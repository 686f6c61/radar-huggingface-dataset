# skimo2022/anlp-a1-transformers

## Resumen

El modelo `skimo2022/anlp-a1-transformers` es un conjunto de cinco configuraciones de transformadores encoder-decoder construidos desde cero en PyTorch, sin utilizar los módulos predefinidos `nn.Transformer` ni `nn.MultiheadAttention`. Fue desarrollado como parte de una tarea académica (ANLP Assignment 1) para el mapeo de secuencias binarias cifradas a texto plano, es decir, descifrar un cifrado de sustitución. El repositorio incluye un estudio de ablación controlado con cinco variantes arquitectónicas (C1 a C5) que modifican el mecanismo posicional, la atención, la normalización y la tokenización, incluyendo una implementación de Byte Latent Transformer (BLT) con patching dinámico por entropía.

El modelo es relevante en el contexto de investigación sobre arquitecturas de transformadores y tokenización a nivel de bytes, ya que permite comparar el impacto de diferentes decisiones de diseño en una tarea de secuencia a secuencia. No es un modelo de lenguaje de propósito general, sino un experimento académico con fines educativos y de análisis. El tamaño del repositorio es de 0,1 GB e incluye checkpoints, configuraciones, métricas y tokenizadores para cada variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder Transformer construido desde cero (sin `nn.Transformer` ni `nn.MultiheadAttention`) |
| Parametros totales | No disponible (la tabla de la model card muestra "nan" para todas las configuraciones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada; las secuencias de entrada son de 34 bytes (según la descripción de C5) |
| Tipos de cuantizacion | No disponible (solo checkpoints en precisión completa) |
| Idiomas soportados | No disponible (tarea de descifrado de secuencias binarias, no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`), junto con `config.json`, `metrics.json`, `tokenizer_*.json` y `entropy_model.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura seq2seq estándar de transformador, implementada manualmente. Se definen cinco configuraciones de ablación:

- **C1**: Posicional sinusoidal absoluto, atención multi-cabeza, LayerNorm, tokenización subword (byte-level BPE).
- **C2**: Igual que C1 pero con **RoPE** (Rotary Position Embedding) en lugar de posicional sinusoidal.
- **C3**: Igual que C1 pero con **Grouped-Query Attention** en lugar de multi-cabeza estándar.
- **C4**: Igual que C1 pero con **RMSNorm** en lugar de LayerNorm.
- **C5**: Igual que C1 pero con **BLT (Byte Latent Transformer)**, una tokenización libre de tokens basada en parches de bytes dinámicos según la entropía.

La configuración C5 es la más innovadora: los bytes de entrada (valores 0-255) se agrupan en parches de longitud variable mediante un modelo de n-gramas de orden 2 que calcula la entropía condicional. Un umbral `theta` calibrado a una longitud media de parche objetivo (~10 parches por secuencia de 34 bytes) determina los límites de los parches. No se entrena un modelo de lenguaje neuronal separado para la entropía; se utiliza un modelo estadístico ligero ajustado solo en el split de entrenamiento.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, el número de pasos, ni el uso de técnicas como RLHF o DPO. El entrenamiento se realizó en PyTorch y los checkpoints incluyen el estado del modelo, los argumentos y la configuración exacta.

## Capacidades

- Descifrado de secuencias binarias cifradas: el modelo mapea secuencias de bits (representadas como caracteres ASCII `0`/`1`) a texto plano, resolviendo un cifrado de sustitución.
- Estudio de ablación: permite comparar el rendimiento de diferentes mecanismos posicionales, de atención, de normalización y de tokenización en una tarea de seq2seq.
- Implementación de BLT: la configuración C5 demuestra el uso de patching por entropía sin necesidad de un modelo de lenguaje auxiliar.
- Reproducibilidad: el repositorio incluye configuraciones exactas, métricas y tokenizadores, lo que facilita la reproducción de los experimentos.

No presenta capacidades de generación de texto general, tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Investigación académica en arquitecturas de transformadores: el modelo sirve como base para estudiar el impacto de RoPE, GQA, RMSNorm y BLT en tareas de secuencia a secuencia, permitiendo a estudiantes e investigadores replicar y extender los experimentos.
- Evaluación de tokenización a nivel de byte: la configuración C5 es útil para analizar cómo el patching dinámico por entropía afecta al rendimiento frente a la tokenización BPE subword, en un entorno controlado.
- Comparación de normalización y atención: las configuraciones C3 y C4 permiten aislar el efecto de GQA y RMSNorm, respectivamente, en una tarea de descifrado, lo que puede orientar decisiones de diseño en modelos más grandes.
- Práctica de implementación de transformadores: al estar construido desde cero, el código fuente (aunque no se incluye en el repositorio de HuggingFace) puede usarse como material didáctico para aprender los componentes internos de un transformador.
- Prueba de concepto de BLT en dominios de baja complejidad: el modelo demuestra que un BLT con un modelo de entropía estadístico puede funcionar en una tarea pequeña, sirviendo como punto de partida para aplicaciones más complejas.
- Análisis de métricas de secuencia: las métricas de precisión de bits, precisión de secuencia y distancia de Levenshtein permiten evaluar la calidad del descifrado y comparar configuraciones de manera objetiva.

## Benchmarks y rendimiento

La model card incluye una tabla con los resultados de las cinco configuraciones en la tarea de descifrado. No se proporcionan comparaciones con otros modelos externos.

| Config | Cambio respecto a base | Precisión de bits (%) | Precisión de secuencia (%) | Distancia de Levenshtein | Params (M) | Pico de GPU (MB) |
|---|---|---|---|---|---|---|
| C1 | Base | 86,55 | 22,60 | 3,36 | nan | 358 |
| C2 | RoPE | 89,19 | 28,60 | 2,48 | nan | 358 |
| C3 | Grouped-Query Attention | 84,17 | 14,80 | 4,73 | nan | 346 |
| C4 | RMSNorm | 86,50 | 23,40 | 3,29 | nan | 337 |
| C5 | BLT (token-free) | 83,71 | 9,10 | 9,60 | nan | 533 |

Los resultados muestran que la configuración C2 (RoPE) obtiene el mejor rendimiento en precisión de secuencia y distancia de Levenshtein, mientras que C5 (BLT) es la más débil en esta tarea concreta. El número de parámetros no está disponible (nan).

## Requisitos de hardware

- El pico de memoria GPU durante la inferencia (según la tabla de la model card) oscila entre 337 MB y 533 MB según la configuración, lo que indica que el modelo es muy ligero y cabe en cualquier GPU consumer (por ejemplo, GTX 1060, RTX 2060, etc.).
- No se especifican requisitos de VRAM para entrenamiento, pero dado el tamaño del repositorio (0,1 GB) y los picos de memoria reportados, es factible entrenar en una GPU con 4 GB de VRAM o menos.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de investigación con checkpoints de PyTorch, la inferencia se realiza mediante el código de carga proporcionado en la model card.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformadores seq2seq para descifrado de cifrados de sustitución). El repositorio es un trabajo académico específico y no se han publicado comparativas con otros modelos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no un producto listo para producción. Su única función es descifrar secuencias binarias cifradas con un cifrado de sustitución concreto; no es generalizable a otros dominios.
- El rendimiento en precisión de secuencia es bajo (máximo 28,6% en C2), lo que indica que el modelo no es fiable para descifrar mensajes completos de forma correcta.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado en una tarea artificial, no se puede esperar un comportamiento robusto fuera de su dominio.
- La configuración C5 (BLT) muestra el peor rendimiento, lo que sugiere que el patching por entropía con un modelo estadístico simple no es óptimo para esta tarea.
- No se proporciona información sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos en los datos.
- La licencia MIT permite uso comercial, pero el modelo carece de utilidad práctica fuera del ámbito académico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/skimo2022/anlp-a1-transformers)
- [Repositorio similar de mohjkhan](https://huggingface.co/mohjkhan/anlp-a1-transformers)
- [Repositorio similar de ZappY-AI](https://huggingface.co/ZappY-AI/anlp-a1)
- [Implementación de referencia en GitHub (FrenchKnuckles/ANLP_A1)](https://github.com/FrenchKnuckles/ANLP_A1)

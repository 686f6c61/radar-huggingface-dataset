# mdhvm/anlp-a1-cipher-transformers

## Resumen

El repositorio `mdhvm/anlp-a1-cipher-transformers` contiene los checkpoints de un estudio de ablación sobre arquitecturas Transformer encoder-decoder, desarrollado como parte de la asignación 1 del curso *Advanced NLP* (ANLP). El modelo está entrenado desde cero en PyTorch, sin usar `nn.Transformer`, `nn.MultiheadAttention` ni `nn.LayerNorm`, para descifrar un cifrado XOR de clave repetitiva (clave `b"ANLP2026"`) y recuperar el texto plano original. El problema se plantea como una tarea de secuencia a secuencia donde la entrada son bytes cifrados y la salida es el texto en claro.

Se presentan siete configuraciones (C1, C1f, C2, C3, C4, C5 y C5b) que varían exactamente un componente respecto a la base C1: posición sinusoidal frente a RoPE, atención multi-cabeza frente a Grouped-Query Attention, LayerNorm frente a RMSNorm, y tokenización subword frente a representación a nivel de byte (BLT). Los tamaños oscilan entre 5,1M y 9,6M parámetros. El objetivo del trabajo es analizar el impacto de cada componente en precisión, velocidad y uso de memoria. Este repositorio es relevante para investigadores interesados en estudios controlados de ablación arquitectónica y en la implementación de transformers desde primitivas básicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (variantes: sinusoidal/RoPE, MHA/GQA, LayerNorm/RMSNorm, subword/BLT) |
| Parametros totales | Desde 5.162.496 (C3) hasta 9.601.792 (C5) según configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventanas fijas con longitud múltiplo de 8 caracteres, sin especificar valor exacto) |
| Tipos de cuantizacion | No disponible (checkpoints de entrenamiento en precisión completa) |
| Idiomas soportados | No disponible (el texto de entrenamiento es inglés, pero no se declara oficialmente) |
| Licencia | MIT |
| Formato de pesos | `state_dict` de PyTorch (archivos `.pt`) |

## Arquitectura y entrenamiento

El modelo es un Transformer encoder-decoder construido completamente desde cero con operaciones de bajo nivel de PyTorch. La base (C1) emplea codificación posicional sinusoidal, atención multi-cabeza estándar, normalización por capas (LayerNorm) y tokenización subword mediante un BPE entrenado desde cero. Las variantes alteran un único componente: C2 sustituye la posición sinusoidal por RoPE (Rotary Position Embedding); C3 reduce a 2 cabezas de clave/valor (Grouped-Query Attention); C4 reemplaza LayerNorm por RMSNorm; C5 adopta una representación token-free a nivel de byte (Byte Latent Transformer, BLT) con parcheo de bits, y C5b es un control sin parcheo. El entrenamiento se realiza sobre pares de texto cifrado (XOR con clave repetitiva) y texto plano, con ventanas fijas cuya longitud es múltiplo de 8 para preservar la fase de la clave. No se mencionan técnicas de RLHF ni DPO; el proceso es supervisado estándar de secuencia a secuencia. Los datos de entrenamiento no se detallan en la información disponible, pero se infiere que son sintéticos generados a partir de texto inglés.

## Capacidades

- Descifrado de un cifrado XOR de clave repetitiva específico (clave `b"ANLP2026"`) con alta precisión a nivel de bit y de secuencia en las configuraciones más avanzadas (C5b alcanza 99,97% de precisión de bits y 97,20% de precisión de secuencia en el conjunto de prueba).
- Estudio de ablación controlada: permite comparar el efecto de RoPE, GQA, RMSNorm y BLT en una tarea de transformación de secuencias.
- Representación a nivel de byte (BLT) sin tokenización subword, demostrando viabilidad de modelos token-free para esta tarea.
- No posee capacidades generales de lenguaje, generación de texto, razonamiento, código, visión ni tool calling. Es un modelo de investigación con alcance limitado a la tarea de descifrado.

## Casos de uso

- Investigación académica en arquitecturas Transformer: el repositorio sirve como referencia para estudiar cómo cada componente (posicional, atención, normalización, tokenización) afecta al rendimiento en una tarea de secuencia a secuencia. Los checkpoints permiten reproducir los experimentos y analizar las curvas de entrenamiento.
- Evaluación de mecanismos de atención eficientes: las configuraciones C2 (RoPE) y C3 (GQA) permiten comparar alternativas a la atención estándar en un entorno controlado, útil para cursos o trabajos de fin de máster.
- Análisis de normalización: C4 (RMSNorm) frente a C1 (LayerNorm) ofrece datos empíricos sobre el impacto de la normalización en la estabilidad del entrenamiento y la precisión final.
- Exploración de modelos token-free: C5 y C5b demuestran el funcionamiento de BLT a nivel de byte, relevante para investigaciones sobre tokenización y representaciones continuas.
- Reproducción de experimentos de ablación: los archivos `results.json` y `history.json` permiten reproducir las métricas y generar gráficas comparativas sin necesidad de reentrenar.
- Docencia en NLP avanzado: el código fuente y los checkpoints pueden utilizarse como material didáctico para ilustrar la implementación de transformers desde cero y el diseño de experimentos de ablación.

## Benchmarks y rendimiento

La siguiente tabla resume los resultados reportados en la model card para cada configuración en el conjunto de prueba (precisión a nivel de bit y de secuencia, y número de parámetros):

| Config | Cambio | Test bit acc % | Test seq acc % | Parametros |
|---|---|---|---|---|
| C1 | Base (sinusoidal, MHA, LayerNorm, subword) | 95,74 | 68,00 | 6.047.232 |
| C1f | Fija ancho de bloque de 8 bits (referencia) | 99,41 | 95,30 | 5.851.648 |
| C2 | RoPE | 95,67 | 66,50 | 6.047.232 |
| C3 | Grouped-Query Attention (2 cabezas KV) | 94,96 | 60,75 | 5.162.496 |
| C4 | RMSNorm | 95,63 | 66,25 | 6.042.112 |
| C5 | BLT (token-free, con parcheo) | 99,95 | 96,50 | 9.404.672 |
| C5 (segunda entrada) | BLT (token-free, con parcheo) | 68,64 | 0,00 | 9.601.792 |
| C5b | Control token-free sin parcheo | 99,97 | 97,20 | 5.656.064 |

Se observa que las configuraciones con representación a nivel de byte (C5 y C5b) superan claramente a las basadas en subword, tanto en precisión de bits como de secuencia. La segunda entrada de C5 muestra una caída drástica (68,64% y 0,00%), probablemente debida a un checkpoint incompleto o a un fallo de entrenamiento, por lo que debe interpretarse con cautela. No se proporcionan comparaciones con modelos externos.

## Requisitos de hardware

- El modelo es muy pequeño (menos de 10M parámetros), por lo que la inferencia puede ejecutarse en CPU sin problemas. El consumo de VRAM estimado es inferior a 1 GB en cualquier cuantización (aunque no se proporcionan versiones cuantizadas).
- Cualquier GPU moderna con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas de gama baja como NVIDIA GTX 1650 o integradas.
- Para entrenamiento desde cero, el tamaño del modelo permite usar una GPU de consumo como RTX 3060 o incluso CPU con tiempos razonables, aunque no se especifican duraciones.
- El despliegue se realiza cargando el `state_dict` con PyTorch (`torch.load`) y reconstruyendo el modelo mediante la función `build_model` del código fuente proporcionado. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de investigación, no se espera compatibilidad con esos motores.

## Comparativa con modelos similares

Existen otros repositorios de la misma asignación que implementan transformadores desde cero para descifrar cifrados similares, como `ZappY-AI/anlp-a1`, `abhirajratna/2024114011-anlp-a1` y el repositorio de GitHub `FrenchKnuckles/ANLP_A1`. No se dispone de datos detallados de sus configuraciones ni métricas, por lo que no es posible realizar una comparación cuantitativa. En términos cualitativos, todos comparten el mismo objetivo de estudio de ablación y la misma licencia MIT, pero difieren en la implementación específica y en el alcance de los experimentos. No se conocen modelos comerciales comparables, ya que se trata de un trabajo académico de propósito específico.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción: solo descifra el cifrado XOR con la clave `b"ANLP2026"` y no generaliza a otros cifrados ni a tareas de lenguaje natural.
- Riesgo de sobreajuste al dataset sintético: las altas precisiones en el conjunto de prueba no implican robustez ante variaciones en la distribución de entrada.
- La segunda entrada de la configuración C5 muestra un rendimiento anómalo (0% de precisión de secuencia), lo que sugiere que algunos checkpoints pueden estar incompletos o mal guardados; hay que verificar la integridad de los archivos antes de usarlos.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento fuera de distribución; al ser una tarea de descifrado determinista, estos conceptos no aplican directamente.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; cualquier uso comercial debe asumir la responsabilidad del resultado.
- No se incluyen pesos en formato GGUF, ONNX o safetensors; solo `state_dict` de PyTorch, lo que limita la portabilidad a otros frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mdhvm/anlp-a1-cipher-transformers
- Repositorio relacionado (ZappY-AI): https://huggingface.co/ZappY-AI/anlp-a1
- Repositorio relacionado (abhirajratna): https://huggingface.co/abhirajratna/2024114011-anlp-a1
- Repositorio GitHub (FrenchKnuckles): https://github.com/FrenchKnuckles/ANLP_A1
- Código del curso ANLP (CMU): https://github.com/cmu-l3/anlp-spring2026-code/blob/main/05_transformers/transformer.ipynb

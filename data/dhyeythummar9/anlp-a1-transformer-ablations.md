# dhyeythummar9/ANLP-A1-Transformer-Ablations

## Resumen

Este repositorio contiene los checkpoints preentrenados de cinco configuraciones de un transformador encoder-decoder implementado en PyTorch, desarrollado como parte de la tarea 1 del curso Advanced NLP (ANLP) de la Universidad Carnegie Mellon. El modelo se entrena para descifrar un cifrado de sustitución, y el estudio realiza una ablación controlada sobre cinco variantes arquitectónicas para analizar su impacto en velocidad de entrenamiento, uso de memoria y rendimiento en la tarea.

Las cinco configuraciones varían en componentes clave: posición sinusoidal frente a RoPE, atención multi-cabeza (MHA) frente a atención con consultas agrupadas (GQA), normalización LayerNorm frente a RMSNorm, y tokenización BPE frente a la pipeline libre de tokens BLT. El repositorio incluye los cinco checkpoints en formato `.pt` de PyTorch, junto con los tokenizadores necesarios para las configuraciones C1-C4.

Se trata de un artefacto de investigación educativa, no de un modelo de propósito general. No se proporcionan métricas de rendimiento, licencia ni documentación adicional más allá de la descripción de las configuraciones. Su relevancia radica en servir como material de referencia para estudiar el efecto de distintas decisiones arquitectónicas en un transformador de tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador encoder-decoder (PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato `.pt`) |
| Idiomas soportados | no disponible (tarea de descifrado de cifrado, no idiomas naturales) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformador encoder-decoder estándar, implementado desde cero en PyTorch, con cinco variantes de ablación:

- **C1**: Posición sinusoidal + atención multi-cabeza (MHA) + LayerNorm + tokenización BPE.
- **C2**: Posición rotatoria (RoPE) + MHA + LayerNorm + BPE.
- **C3**: Posición sinusoidal + atención con consultas agrupadas (GQA) + LayerNorm + BPE.
- **C4**: Posición sinusoidal + MHA + RMSNorm + BPE.
- **C5**: Posición sinusoidal + MHA + LayerNorm + pipeline libre de tokens BLT (byte-level).

El entrenamiento se realiza sobre una tarea de descifrado de cifrado de sustitución, lo que implica un dataset sintético de pares texto cifrado-texto plano. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El estudio de ablación busca aislar el efecto de cada componente arquitectónico en el rendimiento final.

## Capacidades

- Descifrado de cifrados de sustitución: el modelo es capaz de mapear texto cifrado a texto plano para el cifrado específico utilizado en el entrenamiento.
- Comparación de configuraciones: los cinco checkpoints permiten evaluar el impacto de distintas elecciones de diseño (PE, atención, normalización, tokenización) en una misma tarea.
- No dispone de capacidades generales de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se ha documentado soporte para modos especiales como thinking mode o procesamiento de audio.

## Casos de uso

- Investigación educativa en arquitecturas de transformadores: permite a estudiantes e investigadores reproducir y analizar los efectos de la posición sinusoidal frente a RoPE, MHA frente a GQA, LayerNorm frente a RMSNorm, y BPE frente a BLT en una tarea controlada.
- Benchmark de ablación para docencia: puede utilizarse en cursos de NLP avanzado para ilustrar cómo se diseña y evalúa un estudio de ablación.
- Comparación de tokenizadores: las configuraciones C1-C4 usan BPE, mientras que C5 usa BLT, lo que permite estudiar el impacto de la tokenización a nivel de byte en el rendimiento.
- Análisis de estabilidad de entrenamiento: los checkpoints pueden cargarse para inspeccionar curvas de pérdida o realizar evaluaciones adicionales con decodificación greedy.
- Base para experimentos de extensión: los pesos pueden servir como punto de partida para fine-tuning en tareas similares de descifrado o transformación de secuencias.
- Reproducción de resultados: dado que se trata de una tarea de un curso, los checkpoints permiten verificar los resultados reportados en el informe de la asignatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La única referencia a evaluación es una mención a "test results (greedy decoding)" en un repositorio similar, pero sin datos concretos.

## Requisitos de hardware

- El tamaño del repositorio es de 0.5 GB, lo que sugiere que los checkpoints son de un modelo pequeño (probablemente del orden de decenas de millones de parámetros, aunque no se especifica).
- VRAM estimada: no disponible, pero por el tamaño de los archivos, es probable que quepa en GPUs de consumo como una RTX 3060 o superior.
- GPU recomendadas: no disponible; cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia.
- Opciones de despliegue: al ser checkpoints de PyTorch, pueden cargarse directamente con `torch.load` y ejecutarse en un entorno Python. No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Existen otros repositorios de la misma tarea de ablación, como `RaunakSeksaria/anlp-a1-transformers` y `ZappY-AI/anlp-a1`, así como un repositorio de GitHub (`FrenchKnuckles/ANLP_A1`) con una implementación similar. Sin embargo, no se dispone de especificaciones detalladas de estos modelos (parámetros, contexto, rendimiento, licencia) para realizar una comparación cuantitativa. Todos comparten el mismo propósito: estudiar ablaciones de transformadores en la tarea de descifrado de cifrados de sustitución.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas generales de NLP.
- Sin licencia especificada: no se indica bajo qué términos puede utilizarse o redistribuirse el modelo.
- Sin documentación de sesgos o alucinaciones: al ser un modelo entrenado en una tarea sintética, no se han evaluado sesgos sociales ni riesgos de alucinación.
- Alcance limitado: solo funciona con el cifrado de sustitución concreto del entrenamiento; no generaliza a otros cifrados o dominios.
- Sin datos de rendimiento: no hay métricas publicadas que permitan evaluar su calidad objetiva.
- Formato de pesos propietario: los checkpoints `.pt` requieren PyTorch y no son directamente compatibles con otros runtimes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dhyeythummar9/ANLP-A1-Transformer-Ablations
- Repositorio similar en HuggingFace: https://huggingface.co/RaunakSeksaria/anlp-a1-transformers
- Repositorio similar en HuggingFace: https://huggingface.co/ZappY-AI/anlp-a1
- Implementación en GitHub: https://github.com/FrenchKnuckles/ANLP_A1
- Código del curso ANLP (CMU): https://github.com/cmu-l3/anlp-fall2025-code/tree/main/05_transformers
- Referencia visual del transformador: https://jalammar.github.io/illustrated-transformer/

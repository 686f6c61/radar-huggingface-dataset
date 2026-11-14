# Aryama/anlp-a3-part1-eos-v2

## Resumen

`Aryama/anlp-a3-part1-eos-v2` es un conjunto de tres modelos independientes entrenados desde cero para una tarea de descifrado de cifrados (cipher-decryption), desarrollado por el usuario Aryama en el contexto de un trabajo académico (el identificador "anlp-a3" sugiere la asignatura Advanced Natural Language Processing, asignatura 3). El repositorio agrupa tres arquitecturas distintas: un transformer, un Mamba-1 original y un DeltaNet estándar sin gating. Cada uno se ha entrenado de forma independiente y posteriormente se ha sometido a un experimento de ajuste fino (finetuning) emparejado con estados inicializados por separado.

El foco declarado del trabajo es el comportamiento en torno al token EOS (end of sequence): se aplica una ponderación específica de EOS, una calibración del logit de EOS basada únicamente en validación y una selección de candidatos guiada por la calidad de las generaciones de validación. La decodificación no aplica ningún corte basado en la longitud del texto cifrado ni en el número de tokens, y un watchdog en tiempo de ejecución marca las generaciones inacabadas como fallo en lugar de fabricar un EOS. El modelo es de investigación y no se ha publicado información sobre parámetros, contexto, licencia ni idiomas.

La relevancia actual es limitada fuera del ámbito académico: se trata de un artefacto de experimentación sobre arquitecturas secuenciales (Mamba, DeltaNet) frente a transformers en una tarea sintética de descifrado, con resultados que el propio autor califica de exploratorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: transformer, Mamba-1 original y DeltaNet estándar sin gating |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`best.safetensors`, artefacto de inferencia) y PyTorch (`last.pt`, estado de entrenamiento) |

## Arquitectura y entrenamiento

El repositorio contiene tres arquitecturas entrenadas desde cero: un transformer, un Mamba-1 original y un DeltaNet estándar sin gating. Los estados de un solo paso (one-pass) de cada modelo inicializan un experimento de ajuste fino emparejado registrado por separado; en ese reinicio se resetean optimizadores y contadores de fase, mientras que las posiciones del sampler continúan. El autor menciona que la variante híbrida queda aplazada. Se conserva el scan Triton personalizado de Mamba junto con las ecuaciones originales del modelo.

El entrenamiento incorpora ponderación de EOS, calibración del logit de EOS solo con validación y selección de candidatos según la calidad de las generaciones de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El autor advierte que los splits oficiales contienen solapamiento de contenido y que las puntuaciones históricas de test ya se habían visto, por lo que los resultados son exploratorios y ninguna puntuación de test selecciona configuraciones. El repositorio incluye metadatos del checkpoint, historiales completos de fases, linaje del modelo padre, exposición del checkpoint seleccionado y memoria medida.

## Capacidades

- Descifrado de texto cifrado (cipher-decryption): tarea principal para la que se entrenan las tres variantes.
- Generación de texto condicionada a una entrada cifrada, con decodificación sin corte por longitud de cifrado ni por número de tokens.
- Gestión explícita del token EOS mediante ponderación y calibración del logit de EOS en validación.
- Detección de generaciones inacabadas mediante watchdog en tiempo de ejecución (no se fabrican EOS ni predicciones truncadas exitosas).
- Evaluación con métricas de carácter (eliminando puntuación y NUL literal, conservando espacios) y métricas de palabra/edición.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Investigación académica sobre arquitecturas secuenciales: comparar transformer, Mamba-1 y DeltaNet en una misma tarea de descifrado con protocolo de evaluación común; el repositorio ya separa las tres variantes y sus historiales de fases.
- Estudio del comportamiento en torno a EOS: analizar cómo la ponderación de EOS y la calibración del logit afectan a la finalización de secuencias en modelos generativos pequeños.
- Reproducción de experimentos de ajuste fino emparejado: el estado `last.pt` con checksum y los historiales de fases permiten reanudar o auditar el entrenamiento con reinicio de optimizadores.
- Evaluación de robustez de decodificación: el watchdog y la ausencia de cortes por longitud permiten medir fallos de generación sin sesgos por truncamiento artificial.
- Docencia en NLP avanzado: material de partida para prácticas sobre entrenamiento desde cero, selección de checkpoints y métricas de edición en tareas de transformación de cadenas.
- Análisis de solapamiento de datos: el aviso del autor sobre contenido solapado entre splits sirve como caso de estudio sobre fugas de datos en benchmarks académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica únicamente que se generaron todas las filas oficiales de validación y test, que las puntuaciones son exploratorias y que las predicciones de diagnóstico en bruto se conservan en el repositorio fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros ni tamaño del checkpoint; el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere pesos de pequeño tamaño, pero no se confirma).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el uso de un scan Triton personalizado para Mamba implica compatibilidad con GPUs NVIDIA para esa variante.
- Opciones de despliegue: carga directa con PyTorch (`best.safetensors` como artefacto de inferencia); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor menciona memoria medida en los metadatos del checkpoint, pero no se incluyen cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aryama/anlp-a3-part1-eos-v2 (transformer) | no disponible | no disponible | Descifrado | no disponible | Hugging Face, 0 descargas |
| Aryama/anlp-a3-part1-eos-v2 (Mamba-1) | no disponible | no disponible | Descifrado | no disponible | Hugging Face, 0 descargas |
| Aryama/anlp-a3-part1-eos-v2 (DeltaNet) | no disponible | no disponible | Descifrado | no disponible | Hugging Face, 0 descargas |

No se dispone de información sobre modelos comparables externos en la documentación proporcionada; la comparativa interna entre las tres variantes es la única posible con los datos disponibles.

## Limitaciones y advertencias

- Resultados exploratorios: el autor advierte que los splits oficiales contienen solapamiento de contenido y que las puntuaciones históricas de test ya se habían visto, por lo que las métricas no son fiables como evaluación generalizable.
- Sin licencia declarada: no se especifica licencia, lo que impide determinar condiciones de uso comercial.
- Sin información de idiomas: no se documenta el soporte multilingüe ni el idioma de los datos de entrenamiento.
- Tarea muy específica: el modelo está entrenado para descifrado de cifrados, no como modelo de propósito general; no se documentan capacidades de razonamiento, código o matemáticas.
- Riesgo de alucinación en generaciones: el propio diseño incorpora un watchdog que marca generaciones inacabadas como fallo, lo que indica que el modelo puede no terminar secuencias correctamente.
- Sin datos de sesgos: no se publica ningún análisis de sesgos.
- Artefacto académico: 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción ni mantenimiento posterior a la actualización de noviembre de 2026.
- Repositorio de tamaño 0.0 GB: no se confirma que los pesos completos estén disponibles en el repositorio de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aryama/anlp-a3-part1-eos-v2
- Logs de entrenamiento (Weights & Biases): https://wandb.ai/aryama-murthy-iiit-hyderabad/anlp-a3-part1-newdata

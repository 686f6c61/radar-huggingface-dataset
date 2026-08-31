# dacarokann/Courser_c

## Resumen

Courser_c es un adaptador LoRA desarrollado por dacarokann sobre el modelo base `unsloth/Qwen3.6-35B-A3B`, un modelo de lenguaje multimodal (VLM) de arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos. El adaptador está especializado en la lectura de planos de construcción de hormigón armado en tailandés, dentro del proyecto Constistant / STECON SS4. Su propósito es extraer información estructurada de imágenes de planos mediante cuatro pasadas de procesamiento: clasificación de páginas, extracción de subtareas, extracción con pistas de visión por computador y extracción de cantidades.

Este adaptador concreto corresponde al fold 2 de una validación cruzada de 5 pliegues (se entrenaron 4 folds), con un conjunto de entrenamiento de 1051 muestras y validación de 254. El entrenamiento se realizó con LoRA r=16 α=32 dropout=0, aplicado a todas las capas incluyendo los 256 expertos MoE, durante 2 épocas con una tasa de aprendizaje de 1e-4 y optimizador AdamW de 8 bits. La relevancia actual reside en la creciente demanda de automatización en el sector de la construcción, donde la interpretación de planos es un cuello de botella que este tipo de modelos puede abordar.

El modelo está diseñado para trabajar con imágenes de alta resolución (7 680 tokens visuales por imagen, aproximadamente 7.86 megapíxeles) y una longitud máxima de secuencia de 47 104 tokens. Aunque el adaptador es funcional por sí mismo, el autor advierte que el modelo de producción real es `dacarokann/destrier`, que combina los cuatro folds entrenados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-35B-A3B (MoE, VLM) + adaptador LoRA |
| Parametros totales | 35B (modelo base) + adaptador LoRA de tamaño no especificado |
| Parametros activos | 3B (modelo base, arquitectura A3B) |
| Longitud de contexto | 47 104 tokens (MAX_LENGTH según README) |
| Tipos de cuantizacion | no disponible (el README indica que esta familia no es cuantizable) |
| Idiomas soportados | Tailandés (principal), otros no especificados |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, formato PEFT) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` es un transformer multimodal con arquitectura de mezcla de expertos (MoE) que activa 3 mil millones de parámetros por token. Según el README, el adaptador LoRA se aplica a todas las capas, incluidos los 256 expertos MoE, con rango 16, alpha 32 y dropout 0. El entrenamiento se realizó en 2 épocas con una tasa de aprendizaje de 1e-4 con programación coseno, tamaño de lote 1×8, optimizador AdamW de 8 bits y semilla 3407.

El conjunto de datos consiste en planos de construcción de hormigón armado en tailandés, con 1051 filas de entrenamiento y 254 de validación en este fold. Se definieron cuatro pasadas de anotación simultáneas: pass0 para clasificación de páginas de planos, pass1 para extracción de 7 subtareas desde imágenes sin procesar, pass2.4 para extracción con pistas de visión por computador y pass3 para extracción de cantidades a partir de imágenes marcadas por CV. La división en folds se realizó de forma estratificada según la pasada para garantizar que la validación contuviera ejemplos de todas ellas, dado que solo 10 de las 40 casas disponibles incluían muestras de pass0, pass2.4 y pass3.

## Capacidades

- Lectura e interpretación de planos de construcción en tailandés (imágenes de alta resolución).
- Clasificación de páginas de planos según su contenido (pass0).
- Extracción de hasta 7 subtareas diferentes desde imágenes de planos sin procesar (pass1).
- Extracción de información adicional cuando se proporcionan pistas generadas por visión por computador (pass2.4).
- Extracción de cantidades y mediciones a partir de planos marcados por algoritmos de CV (pass3).
- Capacidades multimodales heredadas del modelo base Qwen3.6-35B-A3B, incluyendo comprensión de imágenes y texto.
- Soporte de tool calling y funciones de agente: no disponible en la información proporcionada.
- Capacidades de razonamiento multi-paso: no especificadas, aunque el entrenamiento con cuatro pasadas sugiere un flujo de trabajo estructurado.

## Casos de uso

- Automatización de revisión de planos en empresas constructoras: el modelo puede clasificar automáticamente las páginas de un plano (pass0) y extraer las subtareas de construcción (pass1), reduciendo el tiempo de revisión manual por parte de ingenieros.
- Extracción de cantidades para presupuestos: mediante la pasada pass3, el modelo puede obtener mediciones y cantidades de materiales directamente de planos marcados por CV, lo que agiliza la elaboración de presupuestos y reduce errores humanos.
- Integración en flujos de trabajo BIM (Building Information Modeling): la capacidad de extraer información estructurada de planos permite alimentar modelos BIM con datos actualizados, mejorando la coordinación entre disciplinas.
- Control de calidad de documentación técnica: el modelo puede verificar que los planos contengan la información necesaria (pass1) y señalar omisiones o inconsistencias, actuando como un asistente de control de calidad.
- Asistencia a ingenieros en obra: con la pasada pass2.4, el modelo puede interpretar planos con pistas de CV, ayudando a los equipos en campo a entender especificaciones complejas sin acceso a un ordenador.
- Formación de personal técnico: el modelo puede generar explicaciones detalladas de planos de ejemplo, sirviendo como herramienta educativa para estudiantes de ingeniería civil o arquitectura.
- Digitalización de archivos históricos: al procesar planos escaneados, el modelo puede extraer información relevante para crear bases de datos consultables de proyectos antiguos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM, GPU recomendada o latencia en la información disponible.
- Dado que el modelo base tiene 35B parámetros totales y 3B activos, la inferencia en bf16 requiere al menos una GPU con 24 GB de VRAM para los parámetros activos, aunque el modelo completo puede necesitar más.
- El adaptador LoRA es ligero y puede cargarse sobre el modelo base en sistemas con suficiente memoria.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación; al ser un modelo PEFT, es probablemente compatible con bibliotecas como Transformers y PEFT de HuggingFace.
- No se dispone de estimaciones de throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Este adaptador es solo uno de los cuatro folds entrenados; el modelo de producción real es `dacarokann/destrier`, que combina todos los folds. Usar este adaptador individual puede dar resultados menos robustos.
- El conjunto de entrenamiento es reducido (1051 muestras), lo que puede limitar la generalización a planos de otras tipologías o estilos.
- El modelo está especializado en tailandés y en planos de construcción de hormigón armado; su rendimiento en otros idiomas o dominios no está garantizado.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- Según el README, la familia de modelos base no es cuantizable, lo que puede limitar su despliegue en hardware con restricciones de memoria.
- Existe riesgo de alucinación en la extracción de cantidades, especialmente si las imágenes de entrada no son claras o contienen marcas ambiguas.
- No se han publicado evaluaciones independientes de sesgos o de seguridad del modelo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/dacarokann/Courser_c
- Modelo de producción (destrier): https://huggingface.co/dacarokann/destrier
- Modelo base (unsloth/Qwen3.6-35B-A3B): https://huggingface.co/unsloth/Qwen3.6-35B-A3B

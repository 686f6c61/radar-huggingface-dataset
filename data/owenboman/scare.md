# Owenboman/scare

## Resumen

ScaRE es un conjunto de checkpoints de razonamiento multilingue construidos a partir del modelo base Qwen/Qwen3-4B-Base. Lo publica el usuario Owenboman (Owen Potter) en Hugging Face bajo licencia Apache-2.0. No se trata de un unico modelo, sino de una suite de catorce carpetas que recogen los pesos finales de inferencia empleados en los experimentos ScaRE, con variantes entrenadas en aleman y en coreano, mas un checkpoint mixto de aleman y coreano y otro de evaluacion de magnitud.

El problema que aborda es el estudio del razonamiento multilingue mediante esquemas de pistas (hints) y aprendizaje por refuerzo. La suite organiza los modelos segun la programacion de pistas usada en el entrenamiento (sin pistas o none, pistas fijas o fixed, y decaimiento de pistas o decay), y ademas por la condicion de evaluacion: modelo completo de 250 pasos o extrapolacion de rango 1 seleccionada sobre datos de desarrollo. Cada carpeta incluye pesos de inferencia, configuracion de modelo y tokenizador, y un manifiesto SHA-256.

Es relevante ahora porque pone a disposicion publica artefactos reproducibles de un experimento de refuerzo sobre un modelo denso de aproximadamente 4.000 millones de parametros, lo que facilita a investigadores la comparacion entre programaciones de pistas sin necesidad de reentrenar. El repositorio pesa 225,3 GB en total, coherente con el almacenamiento de multiples checkpoints del mismo modelo base de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3-4B-Base) |
| Parametros totales | Aproximadamente 4.000 millones (segun el modelo base Qwen3-4B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en safetensors) |
| Idiomas soportados | Aleman (de), coreano (ko), ingles (en), bengali (bn), suajili (sw), japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

Dato adicional: el repositorio contiene 14 subcarpetas de checkpoints y ocupa 225,3 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Base, un transformer denso de aproximadamente 4.000 millones de parametros. La model card no describe cambios estructurales introducidos por los autores, por lo que los checkpoints se presentan como ajustes del modelo base y no como una arquitectura nueva. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

El entrenamiento se enmarca en los experimentos ScaRE, que combinan razonamiento multilingue con aprendizaje por refuerzo y esquemas de pistas (hints). Se documentan tres programaciones de pistas: `none` (control sin pistas, asociado a RELEX), `fixed` (ScaRE) y `decay` (ScaRE-decay). Para cada combinacion de idioma y programacion se publican dos condiciones: el modelo completo de 250 pasos y una extrapolacion de rango 1 seleccionada sobre datos de desarrollo segun la exactitud en el idioma de entrenamiento sin pistas. Ademas se incluyen un checkpoint mixto aleman/coreano de 32 pasos seleccionado sobre datos de desarrollo y un checkpoint de evaluacion de magnitud con ScaRE alpha=0.5. Cada configuracion se entreno con una unica semilla.

## Capacidades

- Generacion de texto y razonamiento multilingue: la suite esta orientada explicitamente a tareas de razonamiento en los seis idiomas declarados (de, ko, en, bn, sw, ja).
- Estudio de esquemas de pistas: los checkpoints permiten comparar el efecto de distintas programaciones de hints (sin pistas, fijas y con decaimiento) sobre el rendimiento en razonamiento.
- Evaluacion de extrapolacion de rango 1: se incluyen variantes seleccionadas sobre datos de desarrollo para medir generalizacion fuera de distribucion.
- Sensibilidad a la magnitud: el checkpoint alpha=0.5 permite estudiar el efecto de la escala de la senal de refuerzo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en razonamiento multilingue: comparar el rendimiento de las tres programaciones de pistas (none, fixed, decay) en aleman y coreano sobre las mismas tareas de razonamiento, usando los pares de checkpoints publicados.
- Analisis de extrapolacion de rango 1: reproducir la seleccion de modelos sobre datos de desarrollo y estudiar su comportamiento fuera de distribucion, gracias a que cada configuracion incluye tanto el modelo completo de 250 pasos como la variante de rango 1.
- Estudios de ablacion de pistas en aprendizaje por refuerzo: emplear los checkpoints sin pistas (none) como control frente a los checkpoints con pistas fijas (fixed) para aislar el efecto del hinting.
- Evaluacion de sensibilidad a la magnitud de la recompensa: utilizar el checkpoint alpha=0.5 para medir como escala la senal de refuerzo sobre el rendimiento final.
- Experimentos de mezcla de idiomas: valerse del checkpoint mixto aleman/coreano de 32 pasos para estudiar el transfer entre idiomas en el contexto de ScaRE.
- Verificacion de integridad de artefactos: usar los manifiestos SHA-256 incluidos en cada carpeta para validar la reproducibilidad de los pesos descargados en pipelines de investigacion.
- Base para ajuste posterior: partir de cualquiera de los checkpoints de 4B y aplicar un fine-tuning adicional sobre un dominio concreto, dado que la licencia Apache-2.0 permite uso comercial y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de aproximadamente 4B parametros): en torno a 8 GB en FP16, 4-5 GB en cuantizacion de 8 bits y 2,5-3 GB en 4 bits. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados en la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo, resulta viable en GPU de consumo, aunque no hay confirmacion en la informacion disponible.
- Cabe en GPU de consumo: probablemente si en modelos con 8 GB o mas de VRAM en cuantizacion, segun la estimacion anterior.
- Opciones de despliegue: los ejemplos de la model card usan la libreria `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para esta suite.
- Latencia y throughput: no disponibles.

Nota: el repositorio completo ocupa 225,3 GB, por lo que conviene descargar unicamente la subcarpeta deseada en lugar del repositorio entero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| Owenboman/scare | Aproximadamente 4B | No disponible | Apache-2.0 | Suite de checkpoints de razonamiento multilingue ajustados sobre Qwen3-4B-Base |
| Qwen/Qwen3-4B-Base | Aproximadamente 4B | No disponible en la informacion proporcionada | Apache-2.0 | Modelo base del que derivan todos los checkpoints |

No se dispone de datos de otros modelos comparables dentro de la informacion proporcionada. No se pueden comparar resultados de rendimiento al no haberse publicado benchmarks.

## Limitaciones y advertencias

- Un unico entrenamiento por semilla en cada configuracion, lo que limita la significacion estadistica de cualquier comparacion entre programaciones de pistas.
- Los artefactos publicados no incluyen datos de entrenamiento ni de evaluacion, registros, estados del optimizador ni checkpoints intermedios, por lo que la reproducibilidad completa del entrenamiento no es posible con este repositorio.
- La seleccion de los modelos extrapolados se hizo sobre datos de desarrollo y no sobre los resultados de test.
- No se documentan resultados de benchmarks, por lo que no hay evidencia publicada del rendimiento final.
- No se especifican la longitud de contexto, los tipos de cuantizacion ni los requisitos de hardware en la model card.
- Riesgo de alucinacion: inherente a los modelos generativos de lenguaje de esta familia; no se aportan datos especificos para esta suite.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de idioma: los checkpoints entrenados se centran en aleman y coreano, con un checkpoint mixto de ambos; el resto de idiomas declarados (en, bn, sw, ja) aparecen en las etiquetas pero no se detalla su cobertura en el entrenamiento.
- Restricciones de licencia: el repositorio se distribuye bajo Apache-2.0, heredada de Qwen3-4B-Base, cuyos terminos se aplican. La licencia permite uso comercial, aunque conviene revisar los terminos del modelo base.
- Uso en produccion: la naturaleza experimental de la suite (un checkpoint por semilla, seleccion sobre validacion) desaconseja su despliegue directo sin una evaluacion previa propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Owenboman/scare
- Perfil del autor (Owen Potter): https://huggingface.co/Owenboman
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base

# kevin233333/Light-MER

## Resumen

Light-MER es el conjunto de checkpoints oficiales del trabajo "Do We Really Need Multimodal Emotion Language Models Larger Than 1B Parameters?", presentado en ACM Multimedia 2026 por investigadores del GAIR-Lab. El modelo aborda el reconocimiento multimodal de emociones (MER) a partir de vídeo y texto, y su tesis central es que no es necesario emplear modelos de lenguaje multimodales de gran tamano para esta tarea: mediante destilacion de conocimiento en dos etapas se obtiene un estudiante de 0,6B parametros (Qwen3-0.6B) que aproxima el comportamiento de un profesor Qwen3-8B.

El repositorio no contiene pesos en formato safetensors ni GGUF, sino checkpoints de PyTorch (`.pth`) del proceso de entrenamiento: el profesor, la trayectoria del estudiante en la etapa 1 (destilacion SWD-H) y el barrido de la etapa 2 (M-GRPO). La arquitectura subyacente es la de Qwen3 (transformer denso) adaptada a entrada vídeo-texto, con pipeline `video-text-to-text`.

Es relevante ahora porque propone una via de eficiencia (modelos sub-1B) para una tarea tradicionalmente dominada por modelos multimodales grandes, y porque libera tanto el profesor como las trayectorias intermedias, lo que facilita reproducir y estudiar el proceso de destilacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3 (adaptado a video-text-to-text) |
| Parametros totales | 0,6B (estudiante) y 8B (profesor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (`.pth`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

Light-MER parte de Qwen3 como columna vertebral: un profesor Qwen3-8B y un estudiante Qwen3-0.6B, ambos adaptados a la tarea de reconocimiento multimodal de emociones con entrada de vídeo y texto. El entrenamiento se organiza en dos etapas. La primera es una destilacion de conocimiento denominada SWD-H, en la que el estudiante de 0,6B aprende del profesor de 8B; el repositorio publica la trayectoria completa de checkpoints de la epoca 5 a la 60, con el checkpoint recomendado en la iteracion 60 (loss 1,291). La segunda etapa aplica M-GRPO (una variante de optimizacion por politica con recompensas, presumiblemente multimodal) sobre el estudiante, con un barrido de checkpoints en los pasos 50, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500 y 5000.

La innovacion tecnica destacable es precisamente el planteamiento de eficiencia: demostrar que un modelo por debajo de 1B parametros puede cubrir la tarea MER mediante destilacion y ajuste por recompensas, en lugar de escalar el modelo. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni los detalles de la funcion de recompensa de M-GRPO.

## Capacidades

- Reconocimiento multimodal de emociones a partir de video y texto (pipeline `video-text-to-text`).
- Generacion de texto condicionada a la entrada audiovisual, heredada del backbone Qwen3.
- Destilacion de conocimiento: el estudiante de 0,6B se entrena para aproximar al profesor de 8B.
- Ajuste por recompensas (M-GRPO) en la segunda etapa del pipeline.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): la entrada es video-texto; el resto no disponible.

## Casos de uso

- Analisis de emociones en video para investigacion en afectividad computacional: el modelo recibe clips de video con su transcripcion y produce etiquetas o descripciones emocionales, lo que permite estudiar la senal emocional en corpus audiovisuales.
- Moderacion de contenido en plataformas de video: integrado en un pipeline que procesa fragmentos y detecta tono emocional negativo o conflictivo, con un coste de inferencia bajo al partir de un modelo de 0,6B.
- Investigacion sobre destilacion y eficiencia: el repositorio publica profesor, trayectorias de la etapa 1 y barrido de la etapa 2, lo que permite reproducir experimentos de destilacion y comparar checkpoints intermedios.
- Analisis de experiencia de usuario en entrevistas y sesiones grabadas: transcripcion mas reconocimiento emocional para sintetizar el estado afectivo de los participantes a lo largo de la sesion.
- Sistemas de asistencia en salud mental o bienestar (con supervision humana): deteccion de patrones emocionales en grabaciones como senal auxiliar para profesionales, aprovechando el bajo coste de despliegue del estudiante.
- Investigacion academica en MER: punto de partida para fine-tuning sobre datasets propios, dado que se liberan los checkpoints y las configuraciones (`config.yaml`) de ambas etapas.
- Evaluacion comparativa de modelos grandes frente a pequenos: el profesor de 8B y el estudiante de 0,6B permiten medir la brecha de rendimiento en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; como referencia, un modelo denso de 0,6B en precision FP16 requiere aproximadamente 1,2 GB solo para pesos, y un modelo de 8B en FP16 alrededor de 16 GB, sin contar activaciones ni el codificador de video.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: el estudiante de 0,6B es probablemente desplegable en GPU de consumo, pero no se confirma en la informacion disponible; el profesor de 8B requiere GPU de mayor capacidad.
- Opciones de despliegue: el repositorio usa PyTorch y scripts de entrenamiento (`scripts/train_stage1_swdh.sh`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, la comparativa natural es entre el propio estudiante y el profesor del mismo trabajo:

| Modelo | Parametros | Rol | Licencia | Formato |
|---|---|---|---|---|
| Light-MER estudiante (Qwen3-0.6B) | 0,6B | Modelo final destilado | Apache 2.0 | `.pth` |
| Light-MER profesor (Qwen3-8B) | 8B | Profesor de destilacion | Apache 2.0 | `.pth` |

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible verificar el rendimiento real frente a alternativas.
- El repositorio contiene checkpoints de entrenamiento (`.pth`), no pesos listos para inferencia en formatos estandar (safetensors, GGUF); requiere el codigo del repositorio de GitHub para cargarlos.
- El modelo esta especializado en reconocimiento multimodal de emociones; no es un modelo de proposito general.
- No se documentan los idiomas soportados; el comportamiento fuera del idioma o idiomas de entrenamiento es desconocido.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, pero inherente a los modelos de lenguaje subyacentes.
- La licencia Apache 2.0 cubre los checkpoints, pero el autor advierte de que deben respetarse tambien las licencias de los datasets externos y modelos preentrenados utilizados.
- El reconocimiento emocional es una tarea sensible; su uso en produccion requiere supervision humana y consideraciones eticas y de privacidad.
- El checkpoint recomendado de la etapa 1 corresponde a una loss de 1,291; no se especifica la metrica de evaluacion final ni el checkpoint recomendado de la etapa 2.

## Enlaces

- Hugging Face: https://huggingface.co/kevin233333/Light-MER
- Paper (ACM MM 2026): https://doi.org/10.1145/3767308.3835072
- Paper en Hugging Face: https://huggingface.co/papers/2607.12787
- arXiv: https://arxiv.org/abs/2607.12787
- Codigo: https://github.com/GAIR-Lab/Light-MER

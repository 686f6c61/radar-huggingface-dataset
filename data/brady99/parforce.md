# BRADY99/ParForce

## Resumen

ParForce (Particle Forcing) es un conjunto de adaptadores de inferencia publicados por el usuario BRADY99 en Hugging Face para generación de vídeo condicionada por imagen (image-to-video). No se trata de un modelo base entrenado desde cero, sino de un paquete de pesos LoRA y proyecciones de control que se acoplan a distintas arquitecturas de difusión de vídeo ya existentes: MiniMax-H3 FL2VA, Wan2.1-Fun-V1.1-1.3B, Wan2.2-Fun-A14B y CogVideoX-Fun-V1.1-5B. El repositorio incluye cuatro variantes "teacher" (profesor) y una variante "student" (estudiante) de cuatro pasos sobre MiniMax-H3.

La propuesta técnica es un esquema de destilación y control donde los modelos teacher reciben, además del primer fotograma y el texto, una secuencia de estado de partículas en perspectiva y una secuencia de profundidad de superficie. El student, en cambio, solo necesita el fotograma inicial y el texto, lo que simplifica enormemente el pipeline de inferencia en producción al eliminar las condiciones auxiliares densas.

El interés del repositorio es acotado pero específico: sirve como material de referencia para investigadores que trabajen en control geométrico de vídeo generativo, destilación de pocos pasos y adaptación de backbones de difusión de vídeo de distintos tamaños (desde 1.3B hasta 14B con arquitectura de dos expertos). El tamaño del repositorio es de 13,9 GB, coherente con la suma de adaptadores para varios backbones. No hay métricas publicadas, ni licencia declarada, ni idiomas especificados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA y proyecciones de control sobre backbones de difusión de vídeo (MiniMax-H3 FL2VA, Wan2.1-Fun, Wan2.2-Fun, CogVideoX-Fun) |
| Parametros totales | no disponible (depende del backbone; los backbones van de 1.3B a 14B) |
| Parametros activos | no disponible (Wan2.2-Fun-A14B usa arquitectura de dos expertos high/low) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,9 GB |
| Pipeline declarado | image-to-video |
| Variantes incluidas | H3 Teacher, Wan2.1 Teacher, Wan2.2 Teacher (high + low), CogVideoX Teacher, H3 Student (4 pasos) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de ParForce más allá de describir los artefactos: tensores de adaptadores aprendidos y proyecciones de entrada/control entrenadas. Los teachers se montan sobre backbones de difusión de vídeo con capacidad de control: MiniMax-H3 FL2VA combinado con ControlNet Union 2.0, Wan2.1-Fun-V1.1-1.3B-Control, Wan2.2-Fun-A14B-Control (con dos ficheros, high y low) y CogVideoX-Fun-V1.1-5B-Control. La entrada de los teachers es multimodal y estructurada: primer fotograma, texto, secuencia de estado de partículas en perspectiva y secuencia de profundidad de superficie.

El student es una variante de cuatro pasos sobre MiniMax-H3 FL2VA con un adaptador generador de ParForce. Su entrada se reduce a primer fotograma y texto, lo que sugiere un proceso de destilación desde los teachers hacia un modelo que internaliza la información geométrica de partículas y profundidad sin necesitar esas condiciones en tiempo de inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla el algoritmo de destilación ni el número exacto de pasos de los teachers.

## Capacidades

- Generación de vídeo condicionada por imagen (image-to-video) a partir de un fotograma inicial y un prompt de texto.
- Control geométrico mediante secuencias de estado de partículas en perspectiva y mapas de profundidad de superficie (solo en variantes teacher).
- Inferencia en cuatro pasos en la variante student, orientada a reducir el coste computacional del muestreo.
- Compatibilidad con cuatro backbones distintos, lo que permite elegir el equilibrio entre tamaño y calidad (1.3B, 5B, 14B de dos expertos y MiniMax-H3).
- Integración con ControlNet Union 2.0 en la variante H3 Teacher.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Investigación en control geométrico de vídeo generativo: los teachers permiten estudiar cómo influyen las secuencias de partículas y profundidad en la coherencia espacial del vídeo generado, usando el backbone que mejor se ajuste a los recursos del laboratorio.
- Destilación y muestreo acelerado: el student de cuatro pasos sirve como referencia para comparar calidad frente a teachers con más pasos, útil en trabajos sobre destilación de modelos de difusión de vídeo.
- Prototipado de pipelines image-to-video con distintos backbones: al cubrir Wan2.1-1.3B, CogVideoX-5B, Wan2.2-14B y MiniMax-H3, el repositorio permite evaluar el mismo esquema de adaptación sobre arquitecturas de distinta escala sin reentrenar desde cero.
- Generación de vídeo con control de cámara o movimiento: las secuencias de estado de partículas en perspectiva son adecuadas para experimentos donde se quiere imponer una trayectoria o estructura de movimiento concreta.
- Reconstrucción asistida por profundidad: la secuencia de profundidad de superficie como condición permite experimentar con coherencia 3D en la generación, por ejemplo en escenas con oclusión o parallax.
- Base para adaptaciones LoRA propias: al ser adaptadores en safetensors con hashes y recuentos de tensores en `WEIGHTS.json`, un equipo puede inspeccionar y reutilizar la estructura para entrenar sus propios adaptadores sobre los mismos backbones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, los backbones subyacentes van de 1.3B (Wan2.1-Fun) a 14B con dos expertos (Wan2.2-Fun-A14B), y el repositorio completo ocupa 13,9 GB en disco.
- GPU recomendadas: no disponible en la documentación. Por el tamaño de los backbones, la variante Wan2.1-1.3B es la más probable de caber en GPU de consumo, mientras que Wan2.2-A14B y MiniMax-H3 requerirían GPU de centro de datos (A100, H100) o cuantización agresiva.
- Cabe en GPU de consumo: no confirmado; solo la variante de 1.3B es plausible.
- Opciones de despliegue: no se documentan frameworks concretos (vLLM, llama.cpp, Ollama, TGI no aplican a difusión de vídeo). El despliegue dependerá del ecosistema del backbone correspondiente (por ejemplo, ComfyUI o Diffusers para Wan y CogVideoX).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParForce (este repo) | Adaptadores de control y destilación | Múltiples (1.3B a 14B) | no disponible | no disponible | Hugging Face, 0 descargas |
| Wan2.1-Fun-V1.1-1.3B-Control | Modelo de difusión de vídeo con control | 1.3B | no disponible | no disponible en esta ficha | Público (upstream) |
| CogVideoX-Fun-V1.1-5B-Control | Modelo de difusión de vídeo con control | 5B | no disponible | no disponible en esta ficha | Público (upstream) |
| Wan2.2-Fun-A14B-Control | Modelo de difusión de vídeo con dos expertos | 14B | no disponible | no disponible en esta ficha | Público (upstream) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido; hay que consultar los términos de los backbones upstream por separado.
- No es un modelo autónomo: requiere descargar los backbones base (MiniMax-H3 FL2VA, Wan2.1-Fun, Wan2.2-Fun, CogVideoX-Fun) bajo sus propias condiciones, además de ControlNet Union 2.0 en la variante H3.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad ni de reproducibilidad verificada por terceros.
- No se publican métricas de calidad, sesgos, tasas de alucinación visual ni evaluaciones cualitativas.
- No se especifican idiomas soportados para los prompts de texto.
- El student de cuatro pasos puede sacrificar calidad frente a los teachers; no hay datos que cuantifiquen esa diferencia.
- La ausencia de documentación sobre cuantización limita las opciones de despliegue en hardware modesto.
- El esquema de partículas y profundidad exige generar esas condiciones auxiliares para usar los teachers, lo que añade complejidad al pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BRADY99/ParForce
- Pesos H3 Teacher: https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_h3_teacher.safetensors
- Pesos Wan2.1 Teacher: https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_wan21_fun_1p3b_teacher.safetensors
- Pesos Wan2.2 Teacher (high): https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_wan22_fun_14b_teacher_high.safetensors
- Pesos Wan2.2 Teacher (low): https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_wan22_fun_14b_teacher_low.safetensors
- Pesos CogVideoX Teacher: https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_cogvideox_fun_5b_teacher.safetensors
- Pesos H3 Student: https://huggingface.co/BRADY99/ParForce/resolve/main/parforce_h3_student.safetensors
- Metadatos de pesos (`WEIGHTS.json`): https://huggingface.co/BRADY99/ParForce/blob/main/WEIGHTS.json

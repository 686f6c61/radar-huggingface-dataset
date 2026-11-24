# prithivMLmods/shot-reader-8b-GGUF

## Resumen

Shot Reader 8B es un modelo de visión-lenguaje (VLM) de pesos abiertos desarrollado por Voyager, construido sobre Qwen3-VL-8B-Instruct mediante la fusión de un adaptador LoRA de rango 64. Su tarea es específica y poco habitual: invertir la ingeniería de un único plano continuo de vídeo y producir una hoja de plano ("shot sheet") en JSON 3D estructurado, lista para reconstruirse directamente en Blender o integrarse en flujos de agentes de construcción de escenas. El modelo muestrea 16 fotogramas equiespaciados a resolución 448×256 y extrae parámetros de cámara (altura, ángulo, pitch, campo de visión, encuadre y movimiento), dimensiones 3D de sujetos rastreados, trayectorias de desplazamiento sobre el plano del suelo, eventos de acción tipados y geometría del decorado circundante.

Con 8.190.735.360 parámetros, el modelo se distribuye en este repositorio únicamente en formato GGUF, con cuantizaciones desde Q3_K_M hasta BF16, lo que permite ejecutarlo en una GPU de consumo de 16 GB en 4 bits. Según la model card, alcanza un 69 % de precisión en la clasificación simultánea de banda de altura de cámara y movimiento sobre 300 planos reservados, por delante de Opus 5.5 (44 %) y Gemini 4 Argon (46 %), con un tiempo de 5,9 segundos por plano (aproximadamente 0,002 USD) en una H100 mediante vLLM. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo solo declara soporte de inglés.

Su relevancia actual reside en el nicho: automatiza la previsualización y el análisis de planos para pipelines de animación, VFX y previsualización 3D, una tarea donde los modelos generalistas suelen fallar por falta de estructuración geométrica. No obstante, el repositorio es una cuantización comunitaria con 0 descargas en el momento de la consulta, por lo que conviene tratarlo como una publicación reciente y poco validada por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL-8B-Instruct con adaptador LoRA de rango 64 fusionado (tag `qwen3_vl`) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector multimodal mmproj-bf16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |
| Resolución de entrada de vídeo | 16 fotogramas a 448×256 |
| Tamaño del repositorio | 62,9 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer denso de 8,19 mil millones de parámetros con codificador visual y proyector multimodal, sobre el que Voyager aplicó un adaptador LoRA de rango 64 posteriormente fusionado en los pesos base. La innovación no está en la arquitectura, sino en la especialización: el modelo se entrena para producir una representación JSON estructurada de un plano de vídeo, incluyendo parámetros intrínsecos y extrínsecos de cámara, dimensiones y trayectorias de sujetos, eventos de acción y geometría del set. El pipeline de inferencia muestrea 16 fotogramas equiespaciados a 448×256, una decisión que reduce el coste computacional y explica el bajo tiempo por plano reportado.

El entrenamiento combina escenas sintéticas renderizadas proceduralmente con metraje de dominio público etiquetado por modelos frontera, según la model card. No se especifican el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La evaluación se realizó sobre 300 planos reservados, midiendo la clasificación conjunta de banda de altura de cámara y movimiento, con un 69 % de acierto. No se detallan otras métricas ni la metodología de anotación de referencia.

## Capacidades

- Comprensión de vídeo a nivel de plano: analiza 16 fotogramas equiespaciados y produce una descripción estructurada del plano completo.
- Extracción de parámetros de cámara: altura, ángulo, pitch, campo de visión, encuadre y tipo de movimiento.
- Estimación de dimensiones 3D de sujetos rastreados y de sus trayectorias de desplazamiento sobre el plano del suelo.
- Detección de eventos de acción tipados dentro del plano.
- Inferencia de geometría del decorado y del entorno del set.
- Salida en JSON 3D estructurado, pensada para reconstrucción directa en Blender o para consumo por agentes de construcción de escenas.
- Capacidades heredadas de Qwen3-VL-8B-Instruct para image-text-to-text conversacional, aunque el ajuste está orientado a la tarea de lectura de planos.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas explícitamente; el modelo está pensado para integrarse en flujos de agentes externos.
- Multilingüismo: solo inglés declarado.

## Casos de uso

- Previsualización 3D automatizada: a partir de un plano de vídeo de referencia, el modelo genera una hoja JSON con altura de cámara, pitch, FOV y movimiento que un script de Blender puede convertir en una cámara animada, reduciendo el trabajo manual de previs en animación y VFX.
- Reconstrucción de escenas para agentes de construcción de sets: el JSON de geometría y trayectorias sirve como entrada estructurada a un agente que coloca objetos, luces y cámaras en un motor 3D, gracias a la salida tipada y no ambigua.
- Análisis y catalogación de metraje de archivo: procesar bibliotecas de vídeo para etiquetar planos por movimiento de cámara, altura y composición, facilitando búsquedas y selección de material en postproducción.
- Asistencia a storyboard y dirección: dado un plano de referencia, el modelo proporciona parámetros técnicos que el equipo de dirección puede replicar en rodaje o trasladar a un animatic.
- Docencia y análisis cinematográfico: extracción sistemática de gramática de cámara (ángulos, alturas, movimientos) sobre clips para estudios comparativos o materiales formativos.
- Integración en pipelines de CI/CD de activos 3D: validar automáticamente que una escena renderizada coincide con los parámetros de cámara declarados, usando el modelo como verificador en pruebas de regresión visual.
- Prototipado rápido en GPU de consumo: con la cuantización Q4_K_M (5,03 GB) y el proyector mmproj-bf16 (1,16 GB), se puede desplegar en local para iterar sobre ideas de planos sin depender de APIs externas.

## Benchmarks y rendimiento

| Benchmark | Shot Reader 8B | Opus 5.5 | Gemini 4 Argon |
|---|---|---|---|
| Clasificación conjunta de banda de altura de cámara y movimiento (300 planos reservados) | 69 % | 44 % | 46 % |

Datos adicionales reportados en la model card: 5,9 segundos por plano en una H100 mediante vLLM, con un coste aproximado de 0,002 USD por plano. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector mmproj-bf16 de 1,16 GB + overhead de contexto):
  - Q3_K_M (4,12 GB): en torno a 6-7 GB.
  - Q4_K_M (5,03 GB): en torno a 7-8 GB, recomendado para 16 GB de VRAM.
  - Q5_K_M (5,85 GB): en torno a 8-9 GB.
  - Q6_K (6,73 GB): en torno a 9-10 GB.
  - Q8_0 (8,71 GB): en torno a 11-12 GB.
  - BF16 (16,4 GB): en torno a 18-20 GB, requiere GPU de 24 GB o superior.
- GPU recomendadas: H100 para el modo de referencia con vLLM (5,9 s por plano); A100 40/80 GB para BF16; RTX 4090 (24 GB) para BF16 o Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M o Q5_K_M.
- Cabe en GPU de consumo: sí, en 16 GB con cuantizaciones Q4 y Q5; en 12 GB con Q3_K_M o Q4_K_S ajustando el contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, text-generation-inference y vLLM (el autor reporta vLLM para el modo H100), además de transformers para el modelo base en safetensors.
- Latencia y throughput: 5,9 s por plano en H100 con vLLM según la model card; no se han publicado cifras para GPU de consumo ni para llama.cpp.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Shot Reader 8B | 8,19 B | No disponible | Lectura de planos de vídeo a JSON 3D | Apache 2.0 | GGUF, safetensors (base) |
| Qwen3-VL-8B-Instruct | 8 B (aproximado) | No disponible | VLM generalista image-text-to-text | No disponible en la información | safetensors |
| Opus 5.5 | No disponible | No disponible | Modelo frontera propietario | Propietaria | API |
| Gemini 4 Argon | No disponible | No disponible | Modelo frontera propietario | Propietaria | API |

La comparación relevante es doble: frente a su modelo base Qwen3-VL-8B-Instruct, Shot Reader añade la estructuración geométrica y la salida JSON específica para reconstrucción 3D; frente a los modelos frontera propietarios, ofrece un 69 % frente a 44 % y 46 % en la tarea concreta de clasificación de cámara y movimiento, con un coste por plano muy inferior. No se dispone de datos de benchmarks generalistas que permitan comparar su calidad fuera de este dominio.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; las instrucciones o prompts en castellano pueden degradar la calidad de la salida.
- Es un modelo altamente especializado: su rendimiento en tareas generales de visión-lenguaje no está documentado y probablemente sea inferior al de su base Qwen3-VL-8B-Instruct.
- La evaluación se limita a una única métrica (clasificación conjunta de altura de cámara y movimiento) sobre 300 planos; no hay datos de precisión en dimensiones 3D, trayectorias o geometría del set.
- Riesgo de alucinación en la estimación de parámetros 3D: valores plausibles pero incorrectos en el JSON pueden propagarse silenciosamente a la reconstrucción en Blender.
- El entrenamiento con etiquetas generadas por modelos frontera puede heredar sesgos y errores sistemáticos de esos modelos.
- El repositorio es una cuantización comunitaria (prithivMLmods) con 0 descargas y 1 like en el momento de la consulta; no hay validación independiente de las cuantizaciones.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-VL-8B-Instruct antes de un despliegue comercial.
- La resolución de muestreo (448×256, 16 fotogramas) limita la precisión en planos con movimiento rápido, oclusiones o detalles finos.
- El tamaño del repositorio (62,9 GB) y la ausencia de datos de contexto dificultan planificar despliegues con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/shot-reader-8b-GGUF
- Modelo base: https://huggingface.co/voyager-so/shot-reader-8b
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.

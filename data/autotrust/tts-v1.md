# autotrust/TTS-V1

## Resumen

autotrust/TTS-V1 es un modelo de síntesis de voz (text-to-speech) en chino mandarín publicado en Hugging Face por el usuario autotrust. Se distribuye como un único fichero `model.safetensors` de aproximadamente 114,8 millones de parámetros (0,5 GB de repositorio) que integra dos componentes: un modelo de flujo (FlowLM) y el códec neural Mimi. El modelo genera audio WAV mono a 24 kHz y permite seleccionar entre cuatro voces fijas predefinidas: venta masculina, venta femenina, atención al cliente masculina y atención al cliente femenina.

El modelo está orientado a un caso de uso muy concreto: la generación de locuciones para escenarios de venta y atención al cliente en chino. No se trata de un modelo TTS generalista con clonación de voz ni control fino de prosodia, sino de un sistema cerrado con cuatro timbres de referencia incluidos en el repositorio (carpeta `voices/`). La model card advierte explícitamente de que los nombres de las voces son provisionales y se basan en la escucha y el tono, no en una validación de idoneidad comercial.

La relevancia del modelo es limitada y hay que enmarcarla con cautela: el repositorio no declara licencia, no tiene descargas ni interacciones, no publica benchmarks y la documentación es escasa más allá de las instrucciones de instalación y uso. Su interés principal es práctico para quien necesite un TTS en chino con pocos recursos (funciona en CPU) y acepte las limitaciones de un sistema con cuatro voces fijas y sin garantías de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlowLM (modelo de flujo) + códec neural Mimi, según la model card |
| Parametros totales | 114.800.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | chino (la model card está en chino y el tokenizador es `tokenizer.model` chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Frecuencia de muestreo de salida | 24 kHz, mono, WAV |
| Voces incluidas | 4 (`sales_male`, `sales_female`, `service_male`, `service_female`) |
| Tamano del repositorio | 0,5 GB |
| Dependencias probadas | Python 3.12, torch 2.13.0, NumPy 2.3.5, soundfile 0.14.0, wetext 0.2.1 |
| Plataformas verificadas | Linux (CPU y CUDA con `--device cuda`) |

## Arquitectura y entrenamiento

La model card describe el modelo como una combinación de FlowLM y Mimi dentro de un único fichero de pesos. FlowLM es un modelo generativo de flujo, y Mimi es el códec neural de audio (originalmente asociado a la familia Moshi) que convierte representaciones latentes en forma de onda a 24 kHz. El repositorio incluye una copia adaptada del código de inferencia bajo el directorio `pocket_tts/`, lo que sugiere que el modelo deriva de la arquitectura Pocket TTS. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El pipeline de síntesis no es una simple llamada al modelo: el script `synthesize.py` primero normaliza el texto (importes, fechas, números y puntuación mediante `tn.py` y `wetext`), después segmenta por puntuación y longitud de tokens, y sintetiza cada segmento por separado. Incluye comprobaciones de EOS válido, volumen básico y silencios internos, con reintentos controlados por `--attempts` (16 por defecto) y semilla configurable (`--seed 3000`). Si todos los intentos fallan, el script aborta sin escribir el fichero final. Esta maquinaria de validación indica que la estabilidad de generación no está garantizada de forma nativa.

## Capacidades

- Síntesis de voz en chino mandarín a partir de texto, con salida WAV mono a 24 kHz.
- Cuatro voces predefinidas seleccionables por nombre: `sales_male`, `sales_female`, `service_male` y `service_female`.
- Normalización de texto previa a la síntesis: importes monetarios, fechas, números de pedido y puntuación.
- Segmentación automática de textos largos en fragmentos sintetizables.
- Reintento automático con validación de EOS, volumen y silencios internos.
- Ejecución en CPU por defecto y en GPU NVIDIA mediante `--device cuda`.
- Control de hilos de CPU (`--threads`) y de semilla aleatoria (`--seed`).
- No soporta clonación de voz, control de emoción ni selección de estilo más allá de las cuatro voces fijas.
- No hay información sobre tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Locuciones de venta outbound: generar mensajes promocionales pregrabados con `sales_male` o `sales_female` para campañas telefónicas o vídeos cortos, aprovechando la normalización de importes y fechas para leer ofertas con cifras.
- Respuestas de atención al cliente en IVR: producir avisos de estado de pedido o de saldo con `service_male` o `service_female`, donde la lectura correcta de números de pedido e importes es crítica.
- Generación masiva de audios de confirmación: sintetizar confirmaciones de pedido a partir de plantillas de texto con datos variables (importe, fecha de entrega), usando la segmentación automática para textos de varias frases.
- Contenido de e-learning o formación interna en chino: narrar guiones con una voz consistente y sin necesidad de estudio de grabación, en un entorno Linux con CPU.
- Prototipado de asistentes de voz en chino: integrar el modelo en un pipeline de pruebas para validar la experiencia conversacional antes de contratar un TTS comercial.
- Generación de avisos para aplicaciones de mensajería: convertir notificaciones de texto en audio para usuarios con preferencia por el consumo auditivo, con la advertencia de revisar manualmente la salida por posibles errores de lectura de cifras.
- Pruebas de accesibilidad: producir versiones en audio de contenidos escritos en chino para validación interna, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 114,8 millones de parámetros y pesos en safetensors, la inferencia en FP32 requiere del orden de 0,5 GB de memoria, y en FP16 aproximadamente la mitad, aunque esta estimación no está confirmada por el autor.
- GPU recomendadas: no disponibles; la model card solo indica compatibilidad con CUDA mediante `--device cuda`, sin modelos concretos.
- CPU: es el modo por defecto y la plataforma verificada (Linux, Python 3.12). El script permite ajustar el número de hilos con `--threads`.
- GPU de consumo: no confirmado, pero por tamaño del modelo debería caber en cualquier GPU consumer con al menos 2 GB de memoria libre; no obstante, el autor no lo valida.
- Opciones de despliegue: el repositorio incluye su propio código de inferencia (`pocket_tts/` y `synthesize.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo advierte de que `service_male` tiene un comportamiento de parada inestable y puede requerir varios intentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| autotrust/TTS-V1 | 114,8 M | no disponible | chino | no disponible | 4 voces fijas, 24 kHz, FlowLM + Mimi, ejecución en CPU |
| Alternativas TTS open source en chino | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantías para uso comercial ni condiciones de redistribución de los pesos o de las voces de referencia.
- Solo chino: no se documenta soporte de otros idiomas.
- Cuatro voces fijas: no hay clonación, control de emoción ni ajuste de prosodia.
- Estabilidad irregular: la propia model card advierte de que `service_male` tiene un comportamiento de parada inestable y puede necesitar múltiples intentos.
- Validación incompleta: las comprobaciones automáticas de EOS, volumen y silencio no detectan todos los ruidos, errores de pronunciación ni lecturas incorrectas de cifras; se recomienda revisión manual.
- Riesgo de alucinación acústica: al ser un modelo generativo de audio, puede producir artefactos o segmentos mal formados que el script intenta mitigar con reintentos, no con garantías.
- Sin benchmarks ni métricas objetivas publicadas (MOS, WER, similitud de voz), lo que impide evaluar su calidad frente a alternativas.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en producción ni de mantenimiento por parte del autor.
- Dependencias frágiles: solo se ha verificado una combinación concreta de versiones (Python 3.12, torch 2.13.0, NumPy 2.3.5, soundfile 0.14.0, wetext 0.2.1); otras combinaciones y plataformas no están validadas.
- Nombres de voces provisionales: el autor indica que la denominación de las voces es tentativa y debe validarse con las demos antes de usarlas en un contexto comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/autotrust/TTS-V1
- Model card ampliada (referenciada en el repositorio): `MODEL_CARD.md` dentro del propio repositorio de Hugging Face
- PyTorch (instalación): https://pytorch.org/get-started/locally/
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos externas.

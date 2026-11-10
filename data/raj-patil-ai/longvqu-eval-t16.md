# raj-patil-ai/longvqu-eval-t16

## Resumen

LongVQU-Eval T16 es un conjunto de adaptadores LoRA publicado por el usuario raj-patil-ai en Hugging Face, pensado para la evaluación del modelo base Qwen/Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) sobre una tarea de comprensión de vídeo de larga duración con preguntas de opción múltiple. No es un modelo completo ni un checkpoint entrenado desde cero: el repositorio distribuye únicamente código de inferencia y ocho adaptadores LoRA empaquetados en `T16_ADAPTERS.zip`, dentro de un archivo mayor `LongVQU_T16_public_release.zip`. El modelo base debe descargarse por separado desde Hugging Face.

El paquete está orientado a reproducir una submission de competición (identificador 1045099) con una precisión reportada de 154/300 (51,33 %) en el conjunto de Test. Según la propia model card, la selección de la ruta de adaptadores ("whole-hierarchy routing") se hizo usando los agregados de categoría de dos Test publicados previamente, por lo que el autor advierte explícitamente de que esa cifra no constituye una estimación insesgada sobre un conjunto held-out.

La relevancia del artefacto es acotada: sirve como referencia reproducible para investigación en evaluación de modelos visión-lenguaje sobre vídeo largo y como ejemplo de enrutado por categoría de pregunta sobre adaptadores LoRA. No es un modelo de propósito general ni está pensado para despliegue en producción. El repositorio ocupa 0,2 GB y no incluye pesos del modelo base, vídeos de benchmark, preguntas, respuestas ni credenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen/Qwen3-VL-8B-Instruct (transformer visión-lenguaje, arquitectura del base no detallada en la información disponible) |
| Parametros totales | no disponible (los adaptadores LoRA no declaran recuento; el base es un modelo de 8B según su nombre) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible explícitamente; el setup menciona bitsandbytes como dependencia, lo que sugiere carga cuantizada opcional |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | adaptadores LoRA empaquetados en ZIP (`T16_ADAPTERS.zip`), con manifiesto `ROUTES_AND_HASHES.json` que incluye SHA-256; el base se descarga en su formato original desde Hugging Face |

## Arquitectura y entrenamiento

El artefacto consiste en ocho adaptadores LoRA que se aplican sobre Qwen/Qwen3-VL-8B-Instruct. La inferencia muestrea 32 marcas de tiempo de presentación uniformes del vídeo y selecciona la ruta de adaptador correspondiente a la categoría de la pregunta, según un esquema de "whole-hierarchy routing". El código de inferencia se distribuye junto con los adaptadores y depende de PyTorch, Transformers, bitsandbytes, PEFT, PyAV, NumPy y Accelerate, lo que confirma el uso de PEFT para la carga de los LoRA y de PyAV para la decodificación de vídeo.

No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card indica que la selección de la ruta de adaptadores se hizo con los agregados de categoría de dos Test previamente publicados, lo que introduce una fuga de información respecto a un conjunto held-out limpio. El autor reconoce que el entry point local de vídeo "se ha reconstruido a partir del runner archivado y aún no se ha probado con el modelo entrenado completo en GPU", y que la salida puede variar según el hardware y la implementación del decodificador de vídeo.

## Capacidades

- Comprensión de vídeo de larga duración: muestreo de 32 timestamps uniformes por vídeo para responder preguntas sobre su contenido.
- Respuesta a preguntas de opción múltiple: la entrada es un JSON con `question_idx`, `video_idx`, `hierarchy_category`, `qa_category`, `question_type`, `question` y `candidates`; la salida es `predicted_option` en base uno.
- Enrutado por categoría: selección de uno de ocho adaptadores LoRA según la categoría de la pregunta.
- Capacidades heredadas del base Qwen3-VL-8B-Instruct: al ser un adaptador sobre un modelo visión-lenguaje, hereda sus capacidades de percepción visual y generación de texto, aunque la información disponible no las detalla ni las valida para este artefacto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Reproducción de resultados de competición: ejecutar `infer_local.py` con los adaptadores y un vídeo más un JSON de pregunta para replicar la submission 1045099, verificando la precisión reportada de 154/300 sobre el conjunto de Test.
- Investigación en evaluación de vídeo largo: usar el pipeline como baseline para estudiar cómo el muestreo de 32 frames y el enrutado por categoría afectan al rendimiento en preguntas de opción múltiple sobre vídeo.
- Estudio de enrutado de adaptadores LoRA: analizar el esquema "whole-hierarchy routing" y su impacto frente a un único adaptador, aprovechando que se distribuyen ocho adaptadores separados y un manifiesto con hashes SHA-256.
- Auditoría de sesgo metodológico: el artefacto documenta explícitamente que la selección de ruta usó agregados de Test previos, por lo que sirve como caso de estudio sobre fuga de información en evaluaciones de benchmark.
- Verificación de integridad de artefactos: `ROUTES_AND_HASHES.json` permite comprobar los SHA-256 de cada adaptador antes de cargarlos en un pipeline de evaluación.
- Docencia y formación: ejemplo práctico de fine-tuning con PEFT sobre un modelo visión-lenguaje de 8B, con código de inferencia mínimo y dependencias acotadas (PyTorch, Transformers, PEFT, bitsandbytes, PyAV).
- Pruebas de portabilidad de decodificación de vídeo: comparar salidas entre distintas implementaciones de decodificador y hardware, dado que el autor advierte de que los resultados pueden variar por esa causa.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Notas |
|---|---|---|---|
| LongVQU (Test, submission 1045099) | Accuracy | 154/300 (51,33 %) | Selección de ruta con agregados de Test previos; no es una estimación insesgada held-out |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el setup indica que basta una NVIDIA T4 de 16 GB o superior, lo que sugiere que la carga del base de 8B con cuantización de bitsandbytes cabe en 16 GB.
- GPU recomendadas: NVIDIA T4 (16 GB) o superior, según la model card. No se mencionan A100, H100 ni RTX 4090 de forma específica.
- GPU de consumo: no confirmado; una T4 de 16 GB es el mínimo declarado, por lo que tarjetas consumer con 16 GB o más de VRAM podrían ser suficientes, aunque no se valida en la información disponible.
- Opciones de despliegue: script propio `infer_local.py` con PyTorch, Transformers, PEFT, bitsandbytes, PyAV, NumPy y Accelerate. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte de que la salida puede variar con el hardware y el decodificador de vídeo, y que el entry point local no se ha probado aún con el modelo completo en GPU.
- Runtime de referencia: Python 3.11 o un runtime compatible de Kaggle con GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongVQU-Eval T16 (este artefacto) | Adaptadores LoRA sobre base de 8B | no disponible | Evaluación de vídeo largo con enrutado por categoría | no disponible | Hugging Face, repo de 0,2 GB |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8B (según nombre) | no disponible en la información | Modelo visión-lenguaje generalista | no disponible en la información | Hugging Face |
| Alternativas de vídeo-lenguaje de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar Qwen/Qwen3-VL-8B-Instruct en la revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` y obtener los vídeos y preguntas del benchmark por canales oficiales, respetando sus términos de acceso y licencia.
- La cifra de 51,33 % (154/300) no es una estimación insesgada: la ruta se eligió usando agregados de Test previamente publicados, lo que constituye una fuga de información reconocida por el autor.
- El entry point local `infer_local.py` está reconstruido a partir del runner archivado y no se ha probado con el modelo entrenado completo en GPU; los resultados pueden diferir de la submission oficial.
- La salida puede variar según el hardware y la implementación del decodificador de vídeo; para hashes de frames exactos hay que conservar los artefactos originales de ejecución en Kaggle.
- Licencia no declarada: no hay información sobre permisos de uso comercial, por lo que no debe asumirse ningún derecho de explotación.
- Idiomas soportados no declarados.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo visión-lenguaje, persiste el riesgo inherente de respuestas plausibles pero incorrectas, aunque aquí la salida se restringe a una opción entre candidatos.
- Limitación de contexto: no se especifica la longitud de contexto del base ni cómo afecta al muestreo de 32 frames.
- Sin métricas de latencia ni throughput publicadas, lo que dificulta planificar un despliegue.
- El repositorio no incluye pesos del base, vídeos, preguntas, respuestas ni credenciales; su utilidad depende de fuentes externas.

## Enlaces

- Hugging Face: https://huggingface.co/raj-patil-ai/longvqu-eval-t16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.

# HyperLinked/s1-mini-litertlm

## Resumen

HyperLinked/s1-mini-litertlm es una conversión no oficial del modelo superwhisper/s1-mini al formato `.litertlm` para ejecutarse en dispositivo con el runtime LiteRT-LM de Google (Android, iOS y escritorio). El modelo original es un ajuste fino de Qwen3-0.6B especializado en limpiar y normalizar transcripciones de voz a texto: puntuación, mayúsculas, estructura en listas y estilo (formal, semiformal, etc.). La conversión la publica el usuario HyperLinked y se usa como el modelo de limpieza "Light" en LocalType, un teclado de voz on-device para Android.

Se trata por tanto de un modelo pequeño y de propósito muy concreto (0,6 GB de repositorio, contexto de 2.048 tokens, pesos int8 dinámicos), no de un modelo de propósito general. Su relevancia está en el nicho de post-procesado de dictado y ASR en el propio dispositivo, sin conexión a red y sin enviar audio ni transcripciones a servidores externos.

La licencia es Apache 2.0 con un término adicional que obliga a identificar el modelo como "S1-mini" by "Superwhisper" en cualquier uso, distribución o integración, un detalle relevante para productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B, segun la model card del autor) |
| Parametros totales | No disponible de forma explicita; el modelo base es Qwen3-0.6B (aproximadamente 0,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (sufijo `ekv2048` del archivo) |
| Tipos de cuantizacion | int8 dinamico en pesos (archivo `s1-mini_q8_ekv2048.litertlm`) |
| Idiomas soportados | No disponible; el repositorio equivalente de terceros (mlboydaisuke/S1-mini-LiteRT) lista ingles |
| Licencia | s1-mini-license (Apache 2.0 con termino adicional de atribucion obligatoria a "S1-mini" by "Superwhisper") |
| Formato de pesos | `.litertlm` (LiteRT-LM); incluye tokenizer y plantilla de chat empaquetados |

## Arquitectura y entrenamiento

La model card indica que el modelo original superwhisper/s1-mini es un ajuste fino de Qwen3-0.6B orientado a limpiar transcripciones de speech-to-text. No se documentan en la informacion proporcionada ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. La unica innovacion tecnica descrita en la conversion es el propio pipeline de conversion: el script `convert_s1.py` generado con `litert-torch` 0.9.4 transforma los pesos a int8 dinamico y empaqueta el tokenizer y la plantilla de chat en un unico contenedor `.litertlm` listo para el runtime LiteRT-LM.

El artefacto resultante tiene 648.634.192 bytes y SHA-256 `d444ae7e52adab5f9eac36adb9609d1af7b76c73021ba5885f5b90d8503534fb`. La inferencia debe hacerse con el system prompt y la linea de control exactos del modelo original, y con el modo "thinking" desactivado. La anotacion del modelo base apunta a la revision `88f6b15`.

## Capacidades

- Normalizacion de texto de transcripciones ASR: puntuacion, mayusculas (truecasing) y correccion de estilo.
- Reestructuracion del texto segun ajustes declarados en una linea de control: estilo ([Styling: semi-formal]), estructura ([Structure: lists]) y contexto ([Context: general]).
- Limpieza de dictado en bruto para producir texto final legible.
- Modo de generacion sin "thinking" (la model card especifica desactivarlo).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multimodales (vision, audio nativo), ni razonamiento multi-paso, ni matematicas o generacion de codigo como casos de uso previstos.

## Casos de uso

- Post-procesado de dictado en teclados de voz on-device: el modelo recibe la transcripcion ASR en bruto y devuelve texto con puntuacion y mayusculas correctas, ejecutandose localmente con LiteRT-LM en Android, iOS o escritorio. Es el caso de uso real declarado (LocalType).
- Aplicaciones de notas por voz sin conexion: integrado en una app movil, permite limpiar notas dictadas sin enviar datos a la nube, gracias a su tamano reducido (menos de 0,7 GB) y contexto de 2.048 tokens.
- Transcripcion de reuniones con formato estructurado: usando la linea de control `[Structure: lists]` se pueden convertir parrafos dictados en listas o esquemas, util para actas rapidas grabadas en movilidad.
- Correccion de estilo editorial en dictado: con `[Styling: formal]` o `[Styling: semi-formal]` se adapta el registro del texto antes de publicarlo o enviarlo por correo.
- Accesibilidad: asistencia a usuarios con movilidad reducida que dictan en lugar de escribir, con normalizacion automatica que reduce la carga de edicion posterior.
- Preprocesado en pipelines de ASR: colocarlo como etapa final tras un motor de reconocimiento para estandarizar la salida antes de indexar, resumir o almacenar texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,65 GB solo para pesos int8; sumando cache KV para 2.048 tokens, el consumo cabe holgadamente por debajo de 1-1,5 GB en la mayoria de configuraciones.
- GPU dedicadas: no es el objetivo del artefacto; esta pensado para CPU/NPU de dispositivos moviles a traves de LiteRT-LM, no para A100/H100 ni RTX.
- GPU de consumo: irrelevante para este formato; el despliegue previsto es on-device, no en tarjeta grafica.
- Opciones de despliegue: runtime LiteRT-LM (Android, iOS, escritorio) y conversion con `litert-torch` 0.9.4 mediante `convert_s1.py`. El formato `.litertlm` no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperLinked/s1-mini-litertlm | ~0,6 B (base Qwen3-0.6B) | 2.048 tokens | `.litertlm` (int8 dinamico) | s1-mini-license (Apache 2.0 + atribucion) | HuggingFace, 0 descargas |
| superwhisper/s1-mini | ~0,6 B (base Qwen3-0.6B) | No disponible | No disponible (pesos originales) | s1-mini-license | HuggingFace (modelo original) |
| mlboydaisuke/S1-mini-LiteRT | ~0,6 B | No disponible | `.litertlm` | s1-mini-license | HuggingFace (conversion alternativa) |
| Qwen3-0.6B (base, no ajustado) | ~0,6 B | 32.768 tokens (segun especificaciones publicas de Qwen3, no incluidas en la informacion proporcionada) | safetensors/GGUF (no confirmado en esta busqueda) | Apache 2.0 | HuggingFace |

La comparativa se limita a variantes del mismo modelo base porque no se han encontrado en la informacion disponible modelos especializados en normalizacion de dictado del mismo orden de tamano con datos publicos de rendimiento.

## Limitaciones y advertencias

- Riesgo documentado de alterar numeros hablados: en las pruebas de los autores, "ten thirty, actually no, make it eleven" se convirtio en "11:30". Hay que revisar la salida cuando los numeros sean criticos.
- Es un modelo de 0,6 B de parametros: su capacidad de razonamiento y de manejo de instrucciones complejas es limitada en comparacion con modelos mayores.
- Contexto restringido a 2.048 tokens; transcripciones largas deben trocearse.
- Requiere el system prompt y la linea de control exactos del modelo original y el modo "thinking" desactivado; usarlo de otra forma puede degradar la calidad.
- Conversion no oficial: no esta afiliada ni respaldada por Superwhisper.
- Licencia con termino adicional: cualquier uso, distribucion o integracion debe seguir identificando el modelo como "S1-mini" by "Superwhisper", lo que condiciona su uso en productos comerciales.
- No hay datos publicados de benchmarks, sesgos ni evaluaciones multilingues en la informacion disponible.
- No se documenta soporte de tool calling ni comportamiento de agente; no conviene usarlo en pipelines que dependan de esas capacidades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HyperLinked/s1-mini-litertlm
- Modelo original: https://huggingface.co/superwhisper/s1-mini
- Conversion alternativa de terceros: https://huggingface.co/mlboydaisuke/S1-mini-LiteRT
- Runtime LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Documentacion LiteRT-LM: https://developers.google.com/edge/litert-lm/overview
- Ejemplos oficiales de LiteRT: https://github.com/google-ai-edge/litert-samples
- Documentacion de APIs de LiteRT-LM: https://deepwiki.com/google-ai-edge/LiteRT-LM/3-core-apis-and-programming-model

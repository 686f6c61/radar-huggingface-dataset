# BuilderHelm/Llama-Kanso-Sumi-1.0

## Resumen

Llama Kanso Sumi 1.0 es un etiquetador (tagger) especializado en el formateo de transcripciones de voz a texto, desarrollado por BuilderHelm AI, un estudio independiente centrado en IA on-device. No es un modelo generativo ni conversacional: recibe una transcripcion cruda palabra a palabra y emite etiquetas por token para restaurar puntuacion, mayusculas, saltos de frase y parrafo, eliminar muletillas y aplicar autocorrecciones habladas. Su principio de diseno es que nunca introduce palabras nuevas: toda palabra de la salida proviene de la entrada.

Tecnicamente se construye sobre mmBERT-small (jhu-clsp), un modelo multilingue de tipo encoder, al que se anaden cuatro cabezas de clasificacion por palabra. Cuenta con 140.500.626 parametros y se distribuye principalmente como ONNX int8 (95 MB) para ONNX Runtime en Windows, Linux y macOS, ademas de pesos safetensors en FP32 para PyTorch. Procesa ventanas de 512 tokens con 64 de solapamiento, lo que permite entradas de longitud arbitraria.

Su relevancia actual reside en el nicho de dictado y transcripcion en dispositivo: resuelve un problema muy concreto (texto STT sin puntuar, con repeticiones y correcciones) con un modelo lo bastante pequeno para ejecutarse localmente, con licencia MIT y soporte declarado para siete idiomas. Es la variante sobre mmBERT-small del mismo etiquetador que BuilderHelm publica como Llama Kanso Fude 1.0 sobre Gemma 3 270M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-small) con cuatro cabezas de clasificacion por palabra (puntuacion, mayusculas, cortes, borrado) |
| Parametros totales | 140.500.626 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 512 tokens con 64 tokens de solapamiento; longitud de entrada arbitraria |
| Tipos de cuantizacion | int8 (ONNX, 95 MB) y FP32 (ONNX 370 MB y safetensors 562 MB) |
| Idiomas soportados | Ingles (medido); entrenado con datos sinteticos en espanol, aleman, frances, portugues, italiano y neerlandes |
| Licencia | MIT |
| Formato de pesos | ONNX (int8 y FP32), safetensors (FP32), tokenizer.json |
| Tamano del repositorio | 1,1 GB |
| Pipeline | token-classification |
| Modelo base | jhu-clsp/mmBERT-small |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-small, un encoder transformer multilingue, y le anade cuatro cabezas de clasificacion que operan a nivel de palabra. Cada palabra se tokeniza de forma independiente (sin tokens especiales y con un maximo de 16 subpalabras) y se inserta en una secuencia `<bos>` + palabras + `<eos>` (ids 2 y 1). La inferencia se realiza por ventanas de 512 tokens con 64 de solapamiento; cuando una palabra cae en dos ventanas, se toma la ventana en la que queda mas lejos de un borde. Las decisiones se toman con umbrales configurables en `thresholds.json` (0,3 para puntuacion, mayusculas, cortes y borrado), y los borrados pasan siempre por la funcion `labels.validated_deletions`, que comprueba que la eliminacion es coherente.

El entrenamiento combina datos de HuggingFaceTB/smoltalk, HuggingFaceFW/fineweb-2 y facebook/voxpopuli, con generacion de texto sintetico parcialmente producida por Llama 3.1 (de ahi el prefijo "Llama" en el nombre, exigido por la licencia de Llama 3.1; el modelo no contiene pesos ni codigo de Llama). El autor declara entrenamiento sintetico en seis idiomas ademas del ingles, aunque solo el ingles ha sido medido. La version int8 de ONNX conserva 129.061 de las 256.000 filas del vocabulario. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Puntuacion: inserta `,` `.` `?` `!` `:` `;` tras las palabras y une palabras con guion.
- Restauracion de mayusculas: inicios de frase, nombres propios y acronimos.
- Segmentacion: divide dictado continuo en frases y parrafos.
- Eliminacion de disfluencias: quita muletillas ("um", "you know") y palabras repetidas ("the the").
- Autocorrecciones habladas: aplica retrocesos del tipo "monday sorry i meant tuesday".
- Texto protegido: solo retira un numero, URL, ruta de fichero o negacion cuando el hablante lo sustituye por otro del mismo tipo.
- Garantia de no invencion: cada palabra de la salida proviene de la entrada; no reescribe ni parafrasea.
- Multilingue declarado: entrenado en espanol, aleman, frances, portugues, italiano y neerlandes, aunque solo el ingles esta medido.
- Sin soporte de tool calling, agentes, vision ni audio: es un etiquetador de proposito unico, no un modelo conversacional.

## Casos de uso

- Dictado en dispositivo: integrado en una app de escritorio o movil que captura voz, transcribe con un motor STT y pasa el texto crudo por Sumi para obtener texto puntuado y con mayusculas, sin enviar datos a la nube.
- Correccion de transcripciones de reuniones: limpia actas generadas por STT eliminando muletillas y repeticiones, y aplica autocorrecciones del hablante antes de guardar el documento.
- Postprocesado en pipelines de subtitulado: normaliza segmentos de STT para generar subtitulos con puntuacion y mayusculas correctas, manteniendo intactas cifras, URLs y rutas.
- Asistentes de voz locales: como etapa de formateo antes de enviar el texto a un agente o a un sistema de comandos, garantizando que no se alteren numeros ni negaciones.
- Herramientas de accesibilidad: formateo de dictado para usuarios con movilidad reducida, ejecutandose en el propio equipo con ONNX Runtime y sin dependencia de red.
- Normalizacion de corpus STT: uso por lotes para limpiar transcripciones de VoxPopuli u otras fuentes antes de emplearlas en analisis o entrenamiento de otros modelos.
- Integracion en editores de texto: plugin que aplica formateo sobre la seleccion o sobre el flujo de dictado en tiempo real, con latencia baja gracias al modelo int8 de 95 MB.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card menciona las metricas WER y F1 y una seccion de evaluacion ("Kanso Dictation Benchmark"), pero los valores concretos no aparecen en el material proporcionado. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada: el modelo int8 ONNX ocupa 95 MB en disco y requiere un consumo de memoria del orden de unos cientos de MB durante la inferencia; la version FP32 ONNX ocupa 370 MB y los pesos safetensors 562 MB.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer moderna es sobradamente suficiente.
- GPU consumer: cabe holgadamente en cualquier GPU consumer y tambien en CPU; el modelo esta disenado para ejecucion on-device.
- Opciones de despliegue: ONNX Runtime (Windows, Linux, macOS) mediante `format_onnx.py`; PyTorch con `transformers`, `torch` y `safetensors` mediante `tagger_model.Tagger.load(path)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama Kanso Sumi 1.0 | 141M | Ventanas de 512 tokens con solapamiento | Etiquetado de formateo STT | MIT | Hugging Face (ONNX y safetensors) |
| Llama Kanso Fude 1.0 | No disponible (base Gemma 3 270M) | No disponible | Etiquetado de formateo STT | No disponible | Hugging Face |
| Kanso-Satori-1.0 | No disponible (base Qwen3, 4 bits) | No disponible | Generacion de texto / formateo | Apache 2.0 | Hugging Face (MLX y safetensors) |

Los dos modelos comparables son del mismo autor y cubren funciones distintas: Fude replica el etiquetador sobre Gemma 3 270M y Satori es un modelo generativo de formateo sobre Qwen3. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento.

## Limitaciones y advertencias

- Solo el ingles ha sido medido; el rendimiento en espanol, aleman, frances, portugues, italiano y neerlandes procede de entrenamiento sintetico y no esta validado.
- Es un etiquetador de proposito unico: no responde preguntas, no reescribe, no resume y no mantiene conversacion.
- Los resultados solo se han medido con la configuracion exacta documentada (tokenizacion por palabra, ventanas de 512 con solapamiento de 64, umbrales de 0,3); otros ajustes pueden degradar la calidad.
- Los borrados deben aplicarse mediante `labels.validated_deletions`; saltarse esa validacion puede eliminar contenido que el hablante no pretendia retirar.
- Riesgo de alucinacion estructural bajo por diseno (no genera palabras nuevas), pero puede producir errores de puntuacion o mayusculas en entradas ambiguas.
- La licencia MIT permite uso comercial, pero el nombre "Llama" responde a la licencia de Llama 3.1 sobre el texto sintetico de entrenamiento; el modelo no contiene pesos de Llama.
- No se documentan sesgos especificos ni evaluaciones de robustez en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Llama-Kanso-Sumi-1.0
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Modelo hermano Llama Kanso Fude 1.0: https://huggingface.co/BuilderHelm/Llama-Kanso-Fude-1.0
- Modelo relacionado Kanso-Satori-1.0: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Perfil del autor en Hugging Face: https://huggingface.co/BuilderHelm
- ONNX Runtime: https://onnxruntime.ai
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset HuggingFaceFW/fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset facebook/voxpopuli: https://huggingface.co/datasets/facebook/voxpopuli

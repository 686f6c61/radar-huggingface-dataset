# jkkma/fugumt-ja-en-onnx

## Resumen

FuguMT es un modelo de traducción automática neuronal desarrollado por `staka` (s-taka en GitHub) que traduce del japonés al inglés. Esta ficha describe la versión exportada a ONNX por `jkkma`, publicada en Hugging Face con el id `jkkma/fugumt-ja-en-onnx`. La exportación se realizó a partir del checkpoint original `staka/fugumt-ja-en` en la revisión `f7ce1128`, con los pesos en float32 y sin cuantizar. El modelo se ha preparado para el proyecto Uindosill, que requiere el formato ONNX para sus mediciones.

El modelo original se basa en Marian-NMT, una arquitectura Transformer encoder-decoder, y está diseñado para traducción de un solo sentido: japonés → inglés. El tamaño total de los archivos es de aproximadamente 378 megabytes, lo que lo convierte en un modelo ligero apto para ejecución en CPU o GPU de consumo. No se ha publicado la longitud de contexto en la información disponible, aunque al tratarse de un modelo Marian suele ser limitada.

La relevancia de esta versión radica en su formato ONNX, que facilita la integración en aplicaciones con ONNX Runtime, Transformers.js o ailia SDK. Además, se incluyen advertencias técnicas importantes sobre el uso de beam search y el token de idioma, lo que permite a los desarrolladores evitar errores comunes al desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian-NMT (Transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Float32 (sin cuantizar) |
| Idiomas soportados | Japones (fuente), ingles (destino) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (encoder_model.onnx, decoder_model_merged.onnx) |

## Arquitectura y entrenamiento

El modelo base `staka/fugumt-ja-en` es un checkpoint Marian-NMT entrenado para la tarea de traducción japonés-inglés. Marian-NMT implementa un transformer seq2seq con codificador y decodificador. En esta exportación, el modelo se ha dividido en dos grafos ONNX: `encoder_model.onnx` y `decoder_model_merged.onnx`. El decodificador utiliza un layout fusionado y expone las key values mediante un interruptor `use_cache_branch` para optimizar la inferencia autoregresiva.

Los pesos se mantienen en float32, tanto en entrada como en salida, y no han sido modificados ni cuantizados. La única transformación aplicada es el cambio de contenedor y la división de grafos, lo que constituye una adaptación según los términos de la licencia CC BY-SA 4.0. No se ha proporcionado información detallada sobre el dataset de entrenamiento, pero el modelo original pertenece al repositorio FuguMT de s-taka. No se menciona ningún proceso de RLHF, DPO ni ajuste posterior al entrenamiento.

## Capacidades

- Traducción automática de japonés a inglés en un único sentido.
- Generación con decodificación greedy y beam search, con la advertencia de activar `renormalize_logits` para beam sizes mayores que 5.
- No requiere token de idioma de destino; se debe pasar exclusivamente la frase japonesa.
- No soporta tool calling, function calling ni agentes.
- No es un modelo multilingüe: solo cubre japonés e inglés.
- No incluye capacidades de visión, audio ni modo de razonamiento explícito.
- Formato ONNX portable, utilizable desde aplicaciones de escritorio, web y dispositivos móviles.

## Casos de uso

- Subtitulación de vídeos: el modelo puede traducir frases cortas japonesas a inglés para generar subtítulos en tiempo real, dado su tamaño reducido y la posibilidad de ejecución en CPU.
- Traducción de documentación técnica japonesa: párrafos breves de manuales, guías o especificaciones pueden procesarse en pipelines de documentación, obteniendo resultados aceptables con un coste bajo.
- Integración en aplicaciones móviles: gracias al formato ONNX, el modelo puede ejecutarse en entornos como ONNX Runtime Mobile o ailia SDK para traducir texto en aplicaciones de lectura o mensajería.
- Traducción de tweets o mensajes cortos: la naturaleza seq2seq del modelo es adecuada para entradas de una o dos frases, como las que aparecen en redes sociales.
- Preprocesado en sistemas de traducción asistida: puede servir como modelo ligero para generar borradores de traducción que luego se revisan o se alimentan a sistemas de mayor calidad.
- Evaluación de pipelines de reconocimiento de voz: los datos publicados incluyen mediciones de cascada con un modelo ASR japonés, por lo que puede usarse como componente de referencia para medir penalizaciones de transcripción automática.
- Benchmark de contraste en laboratorios de traducción: al disponer de mediciones de chrF++ sobre un corpus público (FLEURS), puede emplearse como modelo baseline en pruebas internas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generalistas como MMLU o HumanEval, ya que no es un modelo de propósito general. Los datos disponibles corresponden a la model card del export y a la fuente original, y se presentan a continuación.

| Benchmark | Resultado |
|---|---|
| chrF++ en FLEURS `ja_jp` test (321 frases, beam 6, `renormalize_logits` activado) | 52.53 |
| chrF++ con transcripción ASR (parakeet-tdt_ctc-0.6b-ja, q8_0, 487 grabaciones) | 48.46 |
| sacreBLEU en 500 frases de Tatoeba (dato reportado por la card del modelo original, no del export) | 39.1 |

La diferencia entre la puntuación con transcripción perfecta y con ASR es de 4.01 chrF++, lo que se atribuye a la penalización de la cascada de reconocimiento de voz. En las mediciones no se registraron colapsos degenerados ni rachas de puntuación final.

## Requisitos de hardware

- VRAM estimada: no especificada; el tamaño del modelo en float32 es de aproximadamente 378 MB, por lo que cualquier GPU con al menos 1 GB de VRAM puede albergarlo.
- GPU recomendada: no hay requisitos elevados. Una GPU de consumo como RTX 3060 o inferior es suficiente; también puede ejecutarse en CPU de portátil, según las mediciones publicadas.
- Compatibilidad con GPU consumer: sí, sin restricciones.
- Opciones de despliegue: ONNX Runtime, Transformers.js para navegador, ailia SDK y cualquier framework compatible con ONNX.
- Latencia y throughput: no se han publicado valores concretos. Las mediciones se realizaron en una CPU de portátil para 321 frases con beam 6, sin indicar tiempos individuales.

## Comparativa con modelos similares

| Modelo | Tamaño | Formato | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `staka/fugumt-ja-en` (original) | no disponible (checkpoint Marian, ~0.4 GB) | PyTorch / Safetensors | ja→en | CC BY-SA 4.0 | sacreBLEU 39.1 en Tatoeba |
| `jkkma/fugumt-ja-en-onnx` (este modelo) | 378.339.764 bytes | ONNX | ja→en | CC BY-SA 4.0 | chrF++ 52.53 en FLEURS |
| `Helsinki-NLP/opus-mt-ja-en` | no disponible | no disponible | ja→en | no disponible | no disponible |

La comparación con `Helsinki-NLP/opus-mt-ja-en` no puede completarse con los datos disponibles. Ambos modelos comparten la arquitectura Marian-NMT, pero no hay cifras de rendimiento ni de licencia en la información consultada. La exportación ONNX reproduce los pesos del modelo original, por lo que su calidad de traducción es idéntica si se configura correctamente la inferencia.

## Limitaciones y advertencias

- No se debe añadir un token de idioma de destino como `>>eng<<`: el vocabulario del checkpoint no lo incluye, y una cadena que comienza con ese token se tokeniza como texto y se traduce incorrectamente.
- Beam search colapsa a partir de beam 6 si no se renormalizan los logits. En concreto, sin `renormalize_logits=True`, la frase «猫はかわいいです。» puede decodificar como texto incoherente. Greedy decoding no se ve afectado.
- `generation_config.json` especifica `num_beams: 12`, pero todas las mediciones publicadas se hicieron con beam 6 explícito. Usar el valor por defecto puede producir resultados no reproducibles.
- La puntuación chrF++ mide similitud de n-gramas, no adecuación semántica. Ningún humano ha evaluado la calidad de las traducciones.
- No se dispone de evaluaciones de sesgos, alucinaciones ni robustez frente a entradas adversariales.
- La licencia CC BY-SA 4.0 obliga a compartir las adaptaciones bajo la misma licencia, lo que puede tener implicaciones en proyectos comerciales.
- El modelo solo traduce de japonés a inglés; no funciona en dirección contraria.
- La longitud de contexto no se documenta. En modelos Marian suele ser corta, por lo que no se recomienda para documentos largos.
- La información de la model card se corta en la sección «What these numbers do not cover», por lo que pueden existir advertencias adicionales no publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkkma/fugumt-ja-en-onnx
- Modelo original en Hugging Face: https://huggingface.co/staka/fugumt-ja-en
- Repositorio de FuguMT (s-taka): https://github.com/s-taka/fugumt
- Repositorio de Uindosill (jkkma): https://github.com/jkkma/uindosill

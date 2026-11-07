# cyttic/hmt-trocrscratchline-stroke3-s42

## Resumen

`cyttic/hmt-trocrscratchline-stroke3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado por el autor `cyttic` como parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. El modelo emplea una arquitectura tipo TrOCR con cabecera CTC y ha sido entrenado específicamente sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con una variante de aumento de datos identificada como `stroke3` y semilla 42.

El modelo es de tama\u00f1o reducido (22.421.004 par\u00e1metros seg\u00fan los pesos en safetensors) y est\u00e1 orientado \u00fanicamente al hebreo (`he`). Su prop\u00f3sito no es tanto el despliegue en producci\u00f3n como la experimentaci\u00f3n controlada: comparar el efecto de distintas t\u00e9cnicas de aumento sobre m\u00e9tricas de HTR. Los resultados publicados en la model card son modestos: CER de 0,3563 y WER de 0,9565 sobre el conjunto de test HHD Option-B con decodificaci\u00f3n greedy y sin modelo de lenguaje.

Es relevante ahora porque forma parte de una familia de variantes (con nombres como `hmt-trocrctc-stroke3-s42` o `hmt-htrvt-stroke3-s42`) que permiten a investigadores reproducir y comparar el impacto del aumento `stroke3` frente a otras configuraciones, todo bajo licencia MIT y con pesos en formato safetensors de apenas 0,1 GB.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (seg\u00fan tags y nombre del modelo) |
| Par\u00e1metros totales | 22.421.004 |
| Par\u00e1metros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizaci\u00f3n | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR (*Transformer-based Optical Character Recognition*), que combina un codificador de visi\u00f3n con un decodificador Transformer, y a\u00f1ade una cabeza CTC para el alineamiento secuencial, tal como indican los tags `htr` y `ctc`. El n\u00famero de par\u00e1metros (22,4 M) es coherente con una variante compacta de TrOCR, adecuada para experimentaci\u00f3n r\u00e1pida y despliegue en hardware modesto.

El entrenamiento se realiz\u00f3 sobre la partici\u00f3n de train del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo, con el aumento de datos `stroke3` y semilla 42. La evaluaci\u00f3n se hizo sobre el test HHD Option-B con decodificaci\u00f3n greedy y sin modelo de lenguaje. No se especifican en la informaci\u00f3n disponible el n\u00famero de tokens de entrenamiento, la composici\u00f3n exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea de HTR). Los detalles completos se remiten a un fichero `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre im\u00e1genes de l\u00edneas de texto.
- Decodificaci\u00f3n CTC con alineamiento secuencial (greedy decoding).
- Entrenado espec\u00edficamente para la tarea HTR, no como modelo generativo de prop\u00f3sito general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multiling\u00fce limitada al hebreo seg\u00fan la model card.
- No se documentan capacidades de visi\u00f3n general, audio ni modo *thinking*.

## Casos de uso

- Investigaci\u00f3n sobre aumento de datos en HTR: el modelo sirve como punto de comparaci\u00f3n reproducible (semilla 42, aumento `stroke3`) frente a otras variantes de la familia `hmt-*` para medir el impacto en CER y WER.
- Digitalizaci\u00f3n de manuscritos hebreos: puede aplicarse a la transcripci\u00f3n autom\u00e1tica de l\u00edneas manuscritas en hebreo, asumiendo una tasa de error elevada que requerir\u00e1 correcci\u00f3n humana posterior.
- Reproducci\u00f3n de experimentos acad\u00e9micos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar los resultados reportados (CER 0,3563, WER 0,9565) sobre el test HHD Option-B.
- *Baseline* para comparativas de arquitecturas: su reducido tama\u00f1o (22,4 M par\u00e1metros) lo hace \u00fatil como referencia ligera frente a modelos HTR m\u00e1s grandes como `hmt-trocrctc-stroke3-s42` (87,3 M) o `hmt-htrvt-stroke3-s42` (13,8 M).
- Prototipado r\u00e1pido en pipelines de OCR: gracias a su tama\u00f1o (0,1 GB), puede integrarse en entornos de experimentaci\u00f3n con recursos limitados para validar preprocesados o aumentos antes de escalar a modelos mayores.
- An\u00e1lisis de transferencia de m\u00e9tricas: el estudio `htr-metrics-transfer` sugiere que el modelo puede usarse para estudiar c\u00f3mo se transfieren las mejoras de CER a WER en funci\u00f3n del aumento aplicado.

## Benchmarks y rendimiento

| Benchmark | M\u00e9trica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,3563 |
| HHD Option-B test (greedy, sin LM) | WER | 0,9565 |

No se han publicado en la informaci\u00f3n disponible resultados de benchmarks est\u00e1ndar como MMLU, HumanEval o GSM8K, que adem\u00e1s no aplican a un modelo de HTR. No se dispone de comparaciones num\u00e9ricas con modelos similares en la informaci\u00f3n proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisi\u00f3n completa (22,4 M par\u00e1metros, ~90 MB en fp32); c\u00e1lculo orientativo, no confirmado por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: s\u00ed, en pr\u00e1cticamente cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes peque\u00f1os.
- Opciones de despliegue: no se documentan integraciones espec\u00edficas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo TrOCR+CTC, lo habitual ser\u00eda servirlo con PyTorch/Transformers o con un runtime ONNX.
- Latencia y throughput: no disponibles en la informaci\u00f3n proporcionada.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Idioma | Licencia | Notas |
|---|---|---|---|---|
| `cyttic/hmt-trocrscratchline-stroke3-s42` | 22,4 M | he | MIT | Objeto de esta ficha; aumento `stroke3`, semilla 42 |
| `cyttic/hmt-trocrctc-stroke3-s42` | 87,3 M | he | no disponible | Variante TrOCR+CTC de mayor tama\u00f1o |
| `cyttic/hmt-htrvt-stroke3-s42` | 13,8 M | he | no disponible | Variante m\u00e1s ligera (posible arquitectura HTR-VT) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informaci\u00f3n proporcionada; solo se conocen los par\u00e1metros totales y la pertenencia al mismo estudio de aumento.

## Limitaciones y advertencias

- Rendimiento limitado: un CER de 0,3563 y un WER de 0,9565 implican que m\u00e1s de un tercio de los caracteres y casi la totalidad de las palabras se reconocen con errores en el conjunto de test; no es apto para transcripci\u00f3n autom\u00e1tica sin revisi\u00f3n humana.
- Evaluaci\u00f3n restringida: los resultados se obtuvieron con decodificaci\u00f3n greedy y sin modelo de lenguaje, por lo que un LM externo podr\u00eda alterar sustancialmente las m\u00e9tricas.
- \u00danico idioma documentado: hebreo; no hay evidencia de generalizaci\u00f3n a otros alfabetos o idiomas.
- Riesgo de sobreajuste al dominio: entrenado sobre `hhd-optionb-split` excluyendo escritores de dev; el rendimiento en manuscritos de otros escritores o dominios no est\u00e1 caracterizado en la informaci\u00f3n disponible.
- Sesgos: no documentados por el autor; en HTR los sesgos suelen manifestarse como peor reconocimiento en estilos de escritura poco representados.
- Licencia MIT: permite uso comercial y modificaci\u00f3n, pero el autor no ofrece garant\u00edas; conviene citar el estudio original.
- Ausencia de pipeline declarado en Hugging Face: la integraci\u00f3n autom\u00e1tica con `transformers` puede requerir c\u00f3digo personalizado.
- Fecha de creaci\u00f3n futura en los metadatos (2026-11-07): conviene verificar la integridad del repositorio antes de usarlo en producci\u00f3n.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-stroke3-s42
- Variante relacionada `hmt-trocrctc-stroke3-s42`: https://huggingface.co/cyttic/hmt-trocrctc-stroke3-s42
- Variante relacionada `hmt-htrvt-stroke3-s42`: https://huggingface.co/cyttic/hmt-htrvt-stroke3-s42
- Dataset de entrenamiento `cyttic/hhd-optionb-split`: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card; disponibilidad no verificada)
- Fichero de resultados `results.json`: incluido en el repositorio del modelo (no se dispone de URL directa verificada)

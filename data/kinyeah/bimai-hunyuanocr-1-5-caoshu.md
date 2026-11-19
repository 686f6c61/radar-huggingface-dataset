# kinyeah/BiMai-HunyuanOCR-1.5-Caoshu

## Resumen

BiMai-HunyuanOCR-1.5-Caoshu es un ajuste fino del modelo OCR multimodal Tencent HunyuanOCR-1.5 (996M de parametros, torre de vision de 27 capas y torre de lenguaje de 24 capas), especializado en el reconocimiento de caligrafia china cursiva y de hierba (行草 y 狂草, "caoshu"). Lo desarrolla el usuario kinyeah bajo el paraguas del proyecto BiMai, orientado al reconocimiento de texto en libros antiguos chinos. El problema que aborda es concreto: los OCR generalistas fallan de forma sistematica ante trazos ligados, abreviaturas caligraficas y variaciones estilisticas de copistas de los siglos XVI-XVIII.

La relevancia actual reside en la combinacion de tres factores: un tamano reducido (996M de parametros), una cuantizacion Q4_K_M de solo 333 MiB para los pesos de lenguaje, y un soporte nativo de llama.cpp para la arquitectura `hunyuan_vl`. Esto permite desplegar OCR de caligrafia en hardware modesto con una latencia declarada de 0,24 s por imagen, muy por debajo de alternativas de mayor tamano como Qwen3-VL-8B.

El modelo se publica como pesos GGUF con la torre de vision en F16 (890 MiB) y los pesos de lenguaje en Q4_K_M, y se distribuye bajo la Tencent Hunyuan Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder de 27 capas + language decoder de 24 capas), arquitectura `hunyuan_vl` |
| Parametros totales | 996M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (pesos de lenguaje); torre de vision en F16 |
| Idiomas soportados | zh (chino), lzh (chino literario/clasico) |
| Licencia | tencent-hunyuan-community |
| Formato de pesos | GGUF (llama.cpp); existe una variante F16 en `kinyeah/BiMai-Chaoshu-OCR` |

## Arquitectura y entrenamiento

El modelo parte de Tencent HunyuanOCR-1.5, un modelo image-text-to-text de 996M de parametros con una torre de vision de 27 capas y un decodificador de lenguaje de 24 capas. El ajuste fino se ha realizado sobre la version cuantizada Q4_K_M para el decodificador, manteniendo la torre de vision en F16 como `mmproj` separado, lo que es el patron habitual de llama.cpp para modelos multimodales.

El entrenamiento se llevo a cabo durante 2 epochs con un learning rate de 2e-5 (scheduler cosine, warmup de 40 pasos), atencion SDPA y una perdida final de entrenamiento de 0,822. El conjunto de datos suma 11.100 muestras: un 44% proviene de columnas de libros antiguos reales (gold + strips), un 34% de sintesis de caligrafia de hierba autentica (con predominio de Huaisu 23%, Zhu Zhishan 22%, Zhang Zhi 15% y Sun Guoting 13%), un 15% de sintesis a partir de 107.816 glifos reales de caligrafia cursiva y un 7% de sintesis con 23 fuentes caligraficas de estilo cursivo y semi-cursivo. El entrenamiento completo requirio 4 horas y 12 minutos. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de texto chino, con enfasis en caligrafia cursiva (行书) y de hierba (草书, 狂草).
- Transcripcion de libros antiguos chinos y documentos historicos manuscritos.
- Procesamiento de texto en chino moderno (zh) y chino literario clasico (lzh).
- Entrada multimodal imagen + texto con salida de texto (pipeline image-text-to-text).
- Inferencia via llama.cpp con API compatible con OpenAI (`/v1/chat/completions`).
- No se documentan capacidades de tool calling, function calling, agentes, vision general (mas alla de OCR), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de fondos de libros antiguos: el modelo transcribe columnas verticales de caligrafia cursiva con un CER del 21,2% sobre muestras reales de libros antiguos, adecuado para una primera pasada de transcripcion asistida por revisores humanos.
- Catalogacion de manuscritos caligraficos: permite generar texto buscable a partir de imagenes de obras de caligrafos como Zhu Zhishan o Huaisu, con CER entre el 23% y el 32% en los casos documentados, lo que facilita la indexacion preliminar.
- Investigacion en historia de la caligrafia: la transcripcion automatica permite comparar variantes de escritura entre copistas y epocas, aunque el modelo no realiza atribucion de autoria ni datacion.
- Despliegue en local o en el borde: con 333 MiB de pesos de lenguaje y 890 MiB de torre de vision, cabe en equipos con poca VRAM o incluso en CPU, lo que habilita su uso en entornos sin GPU dedicada.
- Procesamiento por lotes de archivos digitalizados: la latencia declarada de 0,24 s por imagen permite procesar volumenes grandes de imagenes en pipelines automatizados.
- Herramienta de apoyo a paleografos: integrada en un flujo de revision, el modelo reduce el trabajo de transcripcion manual inicial y deja al experto la correccion y la interpretacion.
- Integracion en aplicaciones de consulta de patrimonio documental: a traves de la API compatible con OpenAI de llama-server, se puede conectar a interfaces de busqueda o visores de documentos.

## Benchmarks y rendimiento

Evaluacion sobre 151 muestras estratificadas (80 de libros antiguos reales y 71 sinteticas), con el mismo prompt y las mismas muestras que la serie Qwen3-VL-8B del proyecto:

| Metrica | v23 (anterior) | Qwen3-VL v28 | BiMai-HunyuanOCR-1.5-Caoshu |
|---|---:|---:|---:|
| CER global | 42,26% | 25,70% | 17,89% |
| CER mediana | 25,00% | 25,00% | 12,50% |
| Aciertos exactos | 40/151 | 44/151 | 58/151 |
| CER caligrafia de hierba (草书) | 42,4% | 36,5% | 18,6% |
| CER caligrafia cursiva (行书) | 12,7% | 8,4% | 11,1% |
| CER caligrafia regular (楷书) | 3,6% | 4,6% | 1,8% |
| CER libros antiguos reales | 60,5% | 30,0% | 21,2% |
| Velocidad de inferencia | 2,4 s/imagen | no disponible | 0,24 s/imagen |

Desglose por caligrafo (CER, menor es mejor):

| Caligrafo | Antes del ajuste | Despues del ajuste |
|---|---:|---:|
| Zhu Zhishan | 44,4% | 25,0% |
| Zhu Yunming | 39,9% | 32,2% |
| Huaisu | 42,5% | < 23% |
| Sun Guoting | 39,9% | fuera de la peor lista |
| NCCU caoshu | 46,2% | 46,2% (sin mejora) |

## Requisitos de hardware

- VRAM estimada: los pesos de lenguaje en Q4_K_M ocupan 333 MiB y la torre de vision en F16, 890 MiB; el total de pesos ronda 1,2 GiB, a lo que hay que sumar la memoria del contexto y de las activaciones (no cuantificada en la informacion disponible).
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-4 GB de VRAM efectiva para el modelo y el contexto, aunque el valor exacto no esta documentado.
- Tambien puede ejecutarse en CPU mediante llama.cpp, dado el reducido tamano de los pesos.
- Opciones de despliegue: `llama-server` de llama.cpp (version b11103 o superior, con soporte para la arquitectura `hunyuan_vl`), con API compatible con OpenAI. No se documenta soporte en vLLM, TGI u Ollama en la informacion disponible.
- Latencia: 0,24 s por imagen segun la model card. El throughput no se especifica.
- Parametros de inferencia recomendados por el autor: `temperature=0` y `repeat_penalty=1.15` para evitar repeticiones degeneradas en columnas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER global (misma eval) | Licencia | Formato |
|---|---|---:|---:|---|---|
| BiMai-HunyuanOCR-1.5-Caoshu | 996M | no disponible | 17,89% | tencent-hunyuan-community | GGUF |
| Qwen3-VL-8B (v28, proyecto BiMai) | 8B (aprox.) | no disponible | 25,70% | no disponible | no disponible |
| v23 (modelo anterior del proyecto) | no disponible | no disponible | 42,26% | no disponible | no disponible |

La comparativa se limita a los modelos evaluados por el propio autor con el mismo conjunto de muestras y prompt. No se dispone de datos de otros OCR especializados en caligrafia china en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no realiza identificacion ni autenticacion: solo reconoce texto; no determina autenticidad, epoca ni autoria.
- La caligrafia de hierba extrema sigue siendo dificil: en las muestras de NCCU caoshu el CER se mantiene en el 46,2%, sin mejora respecto al estado previo.
- En columnas verticales muy largas (mas de 10 caracteres) puede producir repeticiones degeneradas; se recomienda fijar `repeat_penalty=1.15`.
- El ajuste se ha realizado sobre una cuantizacion Q4_K_M, lo que puede introducir una perdida de precision adicional frente a la variante F16 disponible en otro repositorio.
- El soporte linguistico se limita a chino moderno y chino literario clasico; no se documentan otros idiomas.
- La licencia tencent-hunyuan-community impone condiciones adicionales al uso comercial; es necesario revisar los terminos del modelo base antes de desplegarlo en produccion.
- No se documentan sesgos especificos ni tasas de alucinacion medidas; al ser un OCR, el riesgo principal es la transcripcion erronea, no la fabricacion de contenido, aunque el decodificador de lenguaje podria generar texto no presente en la imagen en casos degenerados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinyeah/BiMai-HunyuanOCR-1.5-Caoshu
- Variante F16: https://huggingface.co/kinyeah/BiMai-Chaoshu-OCR
- Modelo base: https://huggingface.co/tencent/HunyuanOCR
- Licencia del modelo base: https://huggingface.co/tencent/HunyuanOCR/blob/main/LICENSE

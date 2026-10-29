# openbmb/MiniCPM-OCR-Jev-gguf

## Resumen

MiniCPM-OCR Jev es un modelo multimodal de 1.881.829.184 parámetros (aproximadamente 2B) desarrollado por OpenBMB, publicado originalmente en pesos BF16 y distribuido en este repositorio como build GGUF para llama.cpp. No es un motor OCR generativo al uso: recibe una imagen junto con candidatos de OCR y devuelve una puntuación de calidad entre 0 y 1 para regiones de texto, fórmulas y tablas. Es, por tanto, un modelo de decisión o evaluador dentro de un pipeline OCR, no el extractor principal.

El repositorio `openbmb/MiniCPM-OCR-Jev-gguf` contiene 15 cuantizaciones del modelo (desde F16 hasta IQ3_XS) más un proyector de visión independiente (`mmproj-model-f16.gguf`, 0,671 GB) que es obligatorio para la inferencia multimodal. El modelo base es `openbmb/MiniCPM-OCR-Jev` y existen checkpoints equivalentes en AWQ W4A16 y GPTQ W4A16, además de la versión BF16 original.

Su relevancia práctica está en que permite añadir una capa de control de calidad a sistemas OCR ya desplegados sin recurrir a un modelo grande: con cuantizaciones Q4 en torno a 1,2 GB, se puede ejecutar en hardware modesto y decidir automáticamente qué candidato OCR es mejor por región, o derivar a revisión humana los casos dudosos. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal transformer con proyector de vision separado (mmproj); el detalle exacto de la arquitectura no se documenta en la informacion disponible |
| Parametros totales | 1.881.829.184 (aproximadamente 2B) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 40.960 tokens en el ejemplo oficial de `llama-server` (`--ctx-size 40960`); el maximo no se especifica |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_1, Q5_0, Q4_K_M, Q4_K_S, Q4_1, Q4_0, IQ4_XS (imatrix), IQ4_NL (imatrix), IQ3_M (imatrix), IQ3_XS (imatrix) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 (pesos, codigo y documentacion) |
| Formato de pesos | GGUF para llama.cpp; el modelo base se distribuye en BF16 (safetensors) y existen variantes AWQ W4A16 y GPTQ W4A16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento. Lo que si se puede afirmar es que se trata de un modelo multimodal de tipo image-text-to-text que requiere dos artefactos en formato GGUF: los pesos del modelo y un proyector de vision (`mmproj-model-f16.gguf`, 0,671 GB), lo que implica un codificador visual seguido de un proyector que inyecta las representaciones de imagen en el modelo de lenguaje. El tamaño de 1,88B parámetros situa el modelo en la gama de 2B, coherente con la familia MiniCPM de OpenBMB.

La funcion del modelo es acotada y especializada: puntuar candidatos de OCR en regiones de texto, formula y tabla, devolviendo un score de calidad entre 0 y 1. La model card insiste en un detalle operativo relevante: hay que comprobar el campo `verdict` de la respuesta, ya que solo el valor `scored` indica que la puntuacion se ha ejecutado realmente. Los tags del repositorio incluyen `decision-model` y `feature-extraction`, lo que refuerza que el uso previsto es la evaluacion, no la generacion libre de texto. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Puntuacion de calidad de OCR: asigna un score de 0 a 1 a un candidato de OCR sobre una region de imagen.
- Evaluacion por tipo de region: cubre texto, formulas matematicas y tablas, lo que permite umbrales distintos segun el contenido.
- Modelo de decision: sirve como juez para seleccionar entre multiples candidatos OCR (ensemble o enrutado por region).
- Entrada multimodal imagen-texto: consume la imagen de la region y el texto candidato en una sola peticion.
- Salida estructurada con campo `verdict`, que permite distinguir entre una evaluacion efectiva (`scored`) y una respuesta no valida.
- Compatibilidad con endpoints: el repo esta etiquetado como `endpoints_compatible`, lo que facilita la integracion via API tipo OpenAI con `llama-server`.
- Soporte de cuantizacion agresiva (hasta IQ3_XS, ~1,03 GB) manteniendo el proyector de vision en F16.
- Capacidades multilingues limitadas a ingles y chino.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio o modo de razonamiento explicito.

## Casos de uso

- Seleccion del mejor candidato OCR: en pipelines que ejecutan varios motores (por ejemplo, Tesseract y un OCR basado en transformer) sobre la misma pagina, el modelo puntua cada candidato por region y permite elegir el mejor sin intervencion manual.
- Control de calidad en digitalizacion masiva: archivos, facturas y expedientes escaneados se procesan por lotes y el score 0-1 se usa como semaforo para aceptar, reintentar con otro motor o derivar a revision.
- Enrutado a revision humana: fijar un umbral (por ejemplo, score < 0,6) para enviar solo las regiones dudosas a un operador, reduciendo el coste de revision frente a revisar el documento completo.
- Verificacion de tablas y formulas: en documentacion tecnica, papers y estados financieros, donde los errores de estructura son mas frecuentes y mas costosos que los de texto plano, el modelo evalua especificamente esas regiones.
- Deteccion de degradacion en produccion: puntuar periodicamente una muestra fija de documentos conocidos y monitorizar la caida del score medio para detectar cambios en el escaneo, en el motor OCR o en el modelo desplegado.
- Evaluacion interna de modelos OCR propios: usar el score como metrica automatica complementaria al ground truth durante el desarrollo y comparacion de versiones de un OCR casero.
- Generacion de datos de supervision: anotar automaticamente la calidad de pares (region, texto OCR) para construir datasets de filtrado o de entrenamiento de modelos de correccion.
- Despliegue en local o en el borde: con cuantizaciones Q4 cercanas a 1,2 GB mas 0,671 GB de proyector, es viable ejecutarlo en una estacion de trabajo con GPU de consumo o incluso en CPU para volumenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso en disco y VRAM de los pesos (sin contar KV cache):
  - F16: 3,776 GB + 0,671 GB de mmproj = aproximadamente 4,45 GB.
  - Q8_0: 2,012 GB + 0,671 GB = aproximadamente 2,68 GB.
  - Q6_K: 1,556 GB + 0,671 GB = aproximadamente 2,23 GB.
  - Q5_K_M: 1,411 GB + 0,671 GB = aproximadamente 2,08 GB.
  - Q4_K_M (la mas pequena recomendada por el autor): 1,274 GB + 0,671 GB = aproximadamente 1,95 GB.
  - IQ3_XS: 1,027 GB + 0,671 GB = aproximadamente 1,70 GB.
- El consumo de KV cache para 40.960 tokens de contexto no se especifica en la informacion disponible; hay que reservar margen adicional sobre el peso de los ficheros, especialmente en F16 con contexto completo.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) cubre con holgura las cuantizaciones Q4-Q8; A100 y H100 solo se justifican por agregacion de peticiones, no por requisitos de memoria.
- Cabe en GPU de consumo: si, desde 4-6 GB para Q4 con contexto moderado; el ejemplo oficial usa `--n-gpu-layers 999` para descargar todas las capas en GPU.
- Despliegue: llama.cpp mediante `llama-server` con `--mmproj`, `--ctx-size 40960` y puerto configurable (18498 en el ejemplo). El etiquetado `endpoints_compatible` sugiere exposicion compatible con clientes de API OpenAI. No se confirma en la informacion disponible soporte verificado en Ollama, LM Studio, vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a las variantes del mismo modelo publicadas por OpenBMB.

| Variante | Formato | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-Jev (BF16) | safetensors | 1,88B | no disponible | Apache 2.0 | HuggingFace y ModelScope |
| MiniCPM-OCR-Jev GGUF (este repo) | GGUF, 15 cuantizaciones | 1,88B | 40.960 tokens en el ejemplo oficial | Apache 2.0 | HuggingFace y ModelScope |
| MiniCPM-OCR-Jev AWQ W4A16 | AWQ | 1,88B | no disponible | Apache 2.0 | HuggingFace y ModelScope |
| MiniCPM-OCR-Jev GPTQ W4A16 | GPTQ | 1,88B | no disponible | Apache 2.0 | HuggingFace y ModelScope |

Comparacion con modelos de terceros: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no extrae texto: puntua candidatos de OCR existentes. Usarlo como OCR directo no es el caso de uso previsto.
- Solo cubre ingles y chino de forma declarada; el rendimiento en otros idiomas, incluido el castellano, no esta documentado.
- Requiere obligatoriamente el proyector de vision (`mmproj-model-f16.gguf`); sin el, la inferencia multimodal no funciona y el fallo puede ser silencioso.
- Hay que validar el campo `verdict` en cada respuesta: solo `scored` garantiza que la puntuacion se ha ejecutado, por lo que un pipeline que ignore este campo puede aceptar respuestas no evaluadas.
- Riesgo de alucinacion en el score: un juez aprendido puede puntuar alto un candidato incorrecto o viceversa; conviene calibrar umbrales con datos propios antes de automatizar decisiones.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez frente a dominios concretos (manuscrito, documentos degradados, alfabetos no latinos). Los idiomas no soportados oficialmente deben tratarse con cautela.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con las obligaciones habituales de atribucion y aviso de licencia; no se especifican restricciones adicionales en la informacion disponible.
- El repositorio GGUF ocupa 45,6 GB en total por acumulacion de cuantizaciones; descargar solo los ficheros necesarios.
- Las cuantizaciones IQ3_XS e IQ3_M son las mas agresivas y no estan marcadas como recomendadas por el autor; la recomendacion explicita es Q4_K_M como la mas pequena aconsejada.
- No hay datos publicados de benchmarks, latencia ni throughput, por lo que cualquier estimacion de rendimiento en produccion debe medirse in situ.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-gguf
- Modelo base BF16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Modelo base en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-Jev
- Repositorio GGUF en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-Jev-gguf
- Variante AWQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-AWQ
- Variante GPTQ W4A16: https://huggingface.co/openbmb/MiniCPM-OCR-Jev-GPTQ
- Repositorio GitHub del proyecto: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_jev_tutorial_en.md
- Guia de despliegue con llama.cpp: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/llamacpp_deploy_jev_en.md
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Licencia Apache 2.0: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp

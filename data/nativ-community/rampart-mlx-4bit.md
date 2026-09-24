# nativ-community/rampart-mlx-4bit

## Resumen

Rampart MLX 4-bit es la conversion a MLX del modelo `nationaldesignstudio/rampart`, un clasificador de tokens (token classification, esquema BIO) especializado en detectar informacion personal identificable (PII) en texto. Lo publica la organizacion `nativ-community`, que se limita a repackear los pesos ya cuantizados del modelo original en el formato de MLX sin recuantizar nada, de modo que el checkpoint conserva exactamente los valores liberados por el autor original.

Arquitectonicamente es un encoder BERT pequeno de la familia MiniLM: 6 capas, dimension oculta 384 y vocabulario de 19.730 piezas, con una cabeza `BertForTokenClassification` de 35 etiquetas BIO que cubren 17 tipos de entidad distintos. Suma 18.434.723 parametros, ocupa unos 15 MB en disco y soporta siete idiomas de escritura latina: ingles, castellano, frances, aleman, italiano, portugues y neerlandes.

Su relevancia es practica: permite ejecutar deteccion y redaccion de PII completamente en local sobre un Mac con Apple Silicon, sin enviar texto a un servicio externo. Es la pieza de modelo de un sistema hibrido mas amplio (Rampart) que en su version original combina el clasificador neuronal con una capa determinista de expresiones regulares y checksums para numeros de seguridad social, tarjetas de pago y direcciones IP, capa que **no** esta incluida en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MiniLM-L6-H384) con cabeza de clasificacion de tokens; 6 capas, hidden 384, vocabulario 19.730 piezas |
| Parametros totales | 18.434.723 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Lineales del transformer y clasificador en 4-bit affine (grupo 32, simetrico q4); embeddings en 8-bit affine. Existe variante fp16 |
| Idiomas soportados | en, es, fr, de, it, pt, nl (siete idiomas de escritura latina) |
| Licencia | CC BY 4.0 (heredada del modelo original; atribucion a National Design Studio) |
| Formato de pesos | safetensors en disposicion MLX (no hay GGUF, ONNX ni PyTorch en este repo) |
| Libreria | mlx |
| Pipeline | token-classification |
| Etiquetas | 35 etiquetas BIO sobre 17 tipos de entidad |
| Tamano del repo | ~0,0 GB declarado en el Hub; pesos ~15 MB |

## Arquitectura y entrenamiento

El checkpoint es una conversion, no un reentrenamiento. Sobre la arquitectura MiniLM de 6 capas y 384 dimensiones ocultas se anade una cabeza de clasificacion de tokens con 35 etiquetas en formato BIO. La cuantizacion se repackea bit a bit desde los pesos ONNX `MatMulNBits` del modelo original: los lineales y el clasificador usan 4-bit affine con grupo 32 y punto cero 8 (que en MLX se traduce en `bias = -8·scale`), mientras que las tablas de embeddings se repackean desde las tablas `DequantizeLinear` uint8 por tensor a 8-bit affine. El script `convert_from_onnx.py` incluido en el repo lee los inicializadores ONNX, los mapea a los nombres de parametro de un BERT de HuggingFace y escribe safetensors en la disposicion de `mlx-vlm`; reproduce tanto este checkpoint como la variante fp16.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO (poco habituales en un modelo de clasificacion de este tamano). El unico dato de evaluacion con trazabilidad es el conjunto de validacion de `ai4privacy/pii-masking-openpii-1.5m`, con 10.500 filas (1.500 por idioma) que el modelo no vio durante el entrenamiento, usado para medir fidelidad de conversion y recall. El modelo original forma parte de un sistema hibrido: los numeros de seguridad social, tarjetas de pago y direcciones IP se enmascaran antes de llegar al modelo mediante una capa de regex y checksum del paquete npm `@nationaldesignstudio/rampart`, por lo que el modelo fue entrenado con esos valores ya enmascarados y este checkpoint no los detecta por si solo.

## Capacidades

- Deteccion de PII a nivel de token en texto libre, con salida BIO sobre 17 tipos de entidad.
- Redaccion directa: el decodificador de spans de `mlx_vlm.token_classification` devuelve `redacted_text` sustituyendo cada entidad por una etiqueta tipo `<GIVEN_NAME>`, `<SURNAME>`, `<EMAIL>`, `<BUILDING_NUMBER>`, `<STREET_NAME>`.
- Politica de retencion configurable mediante `keep_labels`: por defecto el sistema original detecta pero conserva ciudad, estado y codigo postal.
- Multilingue en siete idiomas latinos (en, es, fr, de, it, pt, nl) con un unico modelo, sin enrutado por idioma.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de red ni de APIs externas.
- Uso por linea de comandos (`python -m mlx_vlm.token_classification`) y por API de Python.
- Capacidad de procesamiento por lotes (la evaluacion recorre mas de 1,28 millones de tokens).

Limitaciones de capacidad que conviene tener presentes: no es un modelo generativo, no hace razonamiento, no genera codigo, no soporta tool calling ni function calling, no tiene modo de pensamiento, no procesa vision ni audio, y no gestiona agentes ni razonamiento multi-paso.

## Casos de uso

- Redaccion de PII antes de enviar texto a un LLM en la nube: se pasa el prompt del usuario por el clasificador, se sustituyen nombres, telefonos, correos y direcciones por etiquetas y solo despues se reenvia al modelo remoto. Al ser un modelo de 15 MB la latencia anadida es marginal frente al coste de la llamada al LLM.
- Extension de navegador o cliente de escritorio para formularios y chats: el hecho de que exista un equivalente ONNX que corre en el navegador a 6,6 ms p50 (dato del modelo original) indica que este modelo es apto para interceptar texto *antes* de que salga del dispositivo.
- Saneado de logs y tickets de soporte: preprocesar en lote ficheros de trazas o conversaciones de helpdesk para eliminar identificadores personales antes de almacenarlos o compartirlos entre equipos, aprovechando los siete idiomas soportados para entornos multinacionales.
- Construccion de datasets de entrenamiento: anonimizar corpus propios o de terceros antes de usarlos como datos de entrenamiento, con la ventaja de que el modelo corre en local y no exige subir el corpus a un servicio de terceros.
- Cumplimiento del RGPD en herramientas internas europeas: al cubrir castellano, frances, aleman, italiano, portugues y neerlandes, un unico despliegue sirve para varias filiales; recuerdese que Rampart se presenta como ayuda a la redaccion, no como garantia de cumplimiento.
- Pre-etiquetado para revision humana en flujos de anotacion: usar el modelo como primer paso y reservar la revision manual para los casos de baja confianza, reduciendo el coste de anotacion en proyectos de anonimizacion de documentacion legal o sanitaria.
- Pipeline de publicacion de documentacion: integrar la redaccion como paso obligatorio en un CI/CD de documentacion interna, de modo que cualquier artefacto publicado pase antes por el clasificador.

## Benchmarks y rendimiento

No hay resultados de benchmarks generativos (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. Los datos publicados son de fidelidad de conversion y de recall sobre PII.

Fidelidad de conversion frente al modelo ONNX q4 original bajo ONNX Runtime (CPU), sobre 1.280.624 tokens:

| Checkpoint | Etiquetas de token identicas a ORT | Filas con redaccion identica |
|---|---:|---:|
| MLX fp16 | 99,998 % | 99,95 % |
| MLX 4-bit | 99,997 % | 99,90 % |

Recall de terminos privados (solo modelo, sin la capa de regex), con intervalo de confianza Wilson del 95 %:

| Idioma | ORT q4 (original) | MLX fp16 | MLX 4-bit | Terminos privados |
|---|---:|---:|---:|---:|
| en | 99,87 % [99,75; 99,93] | 99,87 % | 99,87 % | 6.221 |
| es | 99,75 % [99,59; 99,85] | 99,75 % | 99,75 % | 5.708 |
| fr | 99,34 % [99,10; 99,52] | 99,34 % | 99,34 % | 5.641 |
| de | 99,59 % [99,38; 99,73] | 99,59 % | 99,59 % | 5.582 |
| it | 99,50 % [99,29; 99,65] | 99,50 % | 99,50 % | 6.004 |
| pt | 99,63 % [99,44; 99,75] | 99,63 % | 99,63 % | 5.896 |
| nl | 99,28 % [99,03; 99,47] | 99,28 % | 99,28 % | 5.977 |
| **Todos** | **99,57 % [99,50; 99,63]** | **99,57 %** | **99,57 %** | **41.029** |

Extremo a extremo con el decodificador de spans de `mlx_vlm.token_classification` y la politica de conservar ciudad, estado y codigo postal: recall de terminos privados 99,57 % y retencion de terminos publicos 99,90 %. La propia model card advierte de que estas cifras **no** son comparables con el 98,42 % de la tarjeta original, que corresponde a una evaluacion de sistema completo sobre un corte fijo de 30.000 filas con otro mapeo de terminos. Los terminos privados contabilizados son nombres, telefonos, correos, numeros de identificacion, fiscales, de pasaporte y de permiso, y numeros de calle y edificio; quedan fuera los numeros de seguridad social y las tarjetas de credito por pertenecer a la capa de regex.

## Requisitos de hardware

- VRAM/unified memory: los pesos ocupan unos 15 MB; con activaciones y buffers de decodificacion, la huella total es de decenas de megabytes. Cabe holgadamente en cualquier equipo con memoria unificada moderna.
- GPU recomendadas: MLX esta disenado para Apple Silicon, por lo que el destino natural son chips de la serie M (M1 en adelante; la evaluacion se hizo en un M5 Max). No hay soporte CUDA ni ROCm a traves de MLX.
- GPU de consumo: si, cabe en cualquier Mac con Apple Silicon, incluidos modelos con 8 GB de memoria unificada. En GPUs NVIDIA no se puede usar este checkpoint tal cual; habria que recurrir al modelo ONNX original o a una conversion a otro runtime.
- Opciones de despliegue: `mlx-vlm` con soporte de clasificacion de tokens BERT (`mlx_vlm.token_classification`), tanto por API de Python como por CLI (`python -m mlx_vlm.token_classification`). No hay soporte en vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no hay cifras publicadas para este checkpoint MLX concreto. Como referencia del sistema original, la version ONNX cuantizada corre en navegador con ONNX Runtime Web y Transformers.js a 6,6 ms p50, sobre hardware no especificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| nativ-community/rampart-mlx-4bit | 18,4 M | 7 (latinos) | 4-bit affine (grupo 32) + embeddings 8-bit, safetensors MLX | CC BY 4.0 | Conversion bit a bit del ONNX q4, sin recuantizar |
| nativ-community/rampart-mlx-fp16 | 18,4 M | 7 (latinos) | fp16, safetensors MLX | CC BY 4.0 | Mismo pipeline, mayor fidelidad (99,998 % de etiquetas identicas) |
| OsaurusAI/rampart-mlx | No disponible | No disponible | MLX, safetensors | No disponible en la informacion | Otro port a MLX del mismo modelo base |
| nationaldesignstudio/rampart | 14,7 MB de pesos (solo `onnx/model_q4.onnx`) | 7 (latinos) | ONNX q4 | CC BY 4.0 | Modelo original; incluye la capa de regex en el paquete npm |

La comparacion queda limitada al ecosistema Rampart porque la informacion proporcionada no incluye alternativas de otros autores para deteccion multilingue de PII por clasificacion de tokens.

## Limitaciones y advertencias

- **No es un sistema de anonimizacion ni una garantia de cumplimiento normativo.** La propia documentacion lo describe como ayuda a la redaccion. Cualquier uso en un contexto regulado exige validacion adicional y probablemente revision humana.
- **Faltan clases de entidad.** Los numeros de seguridad social, tarjetas de pago y direcciones IP no los detecta este modelo: en el sistema original los captura una capa de regex y checksums previa, que **no** esta incluida aqui. Hay que aportar patrones propios para esas categorias.
- **Riesgo de falso negativo.** El recall de terminos privados es del 99,57 % agregado; el idioma con peor cifra es neerlandes con 99,28 %. En textos largos o muy ruidosos el porcentaje de PII no detectada puede ser no trivial y tiene consecuencias directas sobre la privacidad.
- **Riesgo de falso positivo.** La retencion de terminos publicos es del 99,90 %, lo que implica que algunos terminos legitimos pueden quedar redactados, degradando la legibilidad del texto resultante.
- **Sesgos.** Los resultados de equidad y sesgo estan en la model card del modelo original, que no se reproduce en la informacion disponible. Los autores remiten a esa tarjeta para los analisis de fairness.
- **Limitaciones de contexto e idioma.** No se especifica la longitud de contexto soportada. El modelo cubre unicamente escritura latina y siete idiomas; no hay soporte de arabe, cirilico, CJK ni de transliteraciones.
- **Rendimiento por debajo del optimo en dominios no vistos.** La evaluacion usa `ai4privacy/pii-masking-openpii-1.5m`, excluido del entrenamiento, pero sigue siendo un corpus generico; jerga medica, juridica o tecnica puede comportarse peor.
- **Restricciones de licencia.** CC BY 4.0 permite uso comercial, pero exige atribucion a National Design Studio. Conviene revisar la licencia del modelo base y del paquete npm asociado si se integra el sistema completo.
- **Ecosistema restringido.** Depende de MLX y de `mlx-vlm` con soporte de clasificacion de tokens, lo que limita el despliegue a Apple Silicon y complica la integracion en infraestructura Linux con GPUs NVIDIA.
- **Madurez del repositorio.** El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta y se creo y actualizo el mismo dia, por lo que no hay historial de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/rampart-mlx-4bit
- Modelo base: https://huggingface.co/nationaldesignstudio/rampart
- Variante fp16 del mismo autor: https://huggingface.co/nativ-community/rampart-mlx-fp16
- Model card del modelo original: https://huggingface.co/nationaldesignstudio/rampart/blob/main/MODEL_CARD.md
- Repositorio GitHub de Rampart: https://github.com/nationaldesignstudio/rampart
- Anuncio de Rampart: https://ndstudio.gov/posts/say-hello-to-rampart
- `mlx-vlm` (soporte de clasificacion de tokens BERT): https://github.com/Blaizzy/mlx-vlm
- Dataset de evaluacion: https://huggingface.co/datasets/ai4privacy/pii-masking-openpii-1.5m
- Port alternativo a MLX: https://huggingface.co/OsaurusAI/rampart-mlx
- Aplicacion nativmLX para macOS: https://github.com/0xSojalSec/nativmLX
- Ficha de Rampart en directorio de modelos: https://theresanaiforthat.com/model/rampart/

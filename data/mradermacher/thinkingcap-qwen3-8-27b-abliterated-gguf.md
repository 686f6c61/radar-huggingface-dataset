# mradermacher/ThinkingCap-Qwen3.8-27B-abliterated-GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-abliterated-GGUF es la version cuantizada en formato GGUF de un modelo de lenguaje de 27.320.697.856 parametros (unos 27,3 mil millones), derivado en cadena a partir de Qwen3.8-27B. La cadena de derivacion es la siguiente: el modelo base Qwen3.8-27B del equipo Qwen fue ajustado por BottleCap AI para producir ThinkingCap-Qwen3.8-27B, un fine-tune cuyo unico objetivo es reducir la longitud de las trazas de razonamiento; posteriormente IstroSec publico una variante "abliterated" que elimina las direcciones de rechazo, y finalmente mradermacher ha generado las cuantizaciones estaticas GGUF que se distribuyen en este repositorio.

La relevancia de esta ficha reside en dos ejes. Por un lado, ThinkingCap reduce el gasto de tokens de pensamiento en un 37,2 % de media en 12 benchmarks con un coste de precision de 0,86 puntos porcentuales, lo que ataca directamente el coste de inferencia de los modelos con modo de razonamiento explicito. Por otro, la variante abliterated ("uncensored", etiquetada tambien como "heretic") elimina los mecanismos de rechazo del modelo original, lo que cambia por completo el perfil de seguridad y las condiciones de uso aceptable.

El repositorio es exclusivamente de cuantizacion: no aporta pesos nuevos ni entrenamiento adicional, sino las conversiones GGUF de 2 a 8 bits del modelo de IstroSec, incluidos los ficheros `mmproj` necesarios para el procesamiento multimodal (vision) segun los tags declarados. La licencia declarada es Polyform Small Business 1.0.0, que no es de codigo abierto en sentido estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (cadena Qwen3.8); los tags del repositorio indican soporte de vision y multi-token prediction (MTP); no se indica que sea MoE |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No procede / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, multilingual |
| Licencia | polyform-small-business-1.0.0 (declarada como `license: other` con enlace a LICENSE) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en bf16/safetensors |
| Tamano del repositorio | 190,8 GB |
| Modelo base | IstroSec/ThinkingCap-Qwen3.8-27B-abliterated |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8 con aproximadamente 27,3 mil millones de parametros, sin indicios de mezcla de expertos. Los tags del repositorio senalan dos capacidades tecnicas adicionales: soporte multimodal de vision (de ahi los ficheros `mmproj` en el paquete GGUF, en variantes Q8_0 y f16) y multi-token prediction (MTP), una tecnica que permite predecir varios tokens por paso y que suele emplearse para acelerar la decodificacion. El proceso de entrenamiento concreto de Qwen3.8-27B (numero de tokens, composicion del dataset, fases de RLHF o DPO) no se detalla en la informacion disponible.

Sobre esa base se aplicaron dos transformaciones sucesivas. BottleCap AI realizo un fine-tune supervisado orientado exclusivamente a acortar las trazas de razonamiento: segun su publicacion, el modelo emplea un 37,2 % menos de tokens de pensamiento de media en 12 benchmarks, con un coste de 0,86 puntos porcentuales de precision. La segunda transformacion es la abliteracion aplicada por IstroSec, una tecnica de edicion de pesos que identifica y anula las direcciones del espacio de activaciones responsables de las respuestas de rechazo, eliminando el comportamiento de negativa del modelo sin reentrenar. La combinacion resultante es un modelo de razonamiento mas barato en tokens y sin filtros de rechazo, que es precisamente lo que mradermacher empaqueta en GGUF mediante cuantizacion estatica (no se han publicado cuantizaciones ponderadas o con matriz de importancia en el momento de redactar esta ficha).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas (etiqueta `multilingual`).
- Razonamiento explicito con traza de pensamiento, optimizado para consumir un 37,2 % menos de tokens de razonamiento que el modelo base.
- Procesamiento de imagenes: los tags `vision` y la presencia de ficheros `mmproj` indican soporte multimodal de entrada visual cuando se cargan junto al modelo principal.
- Multi-token prediction (MTP) como mecanismo de aceleracion declarado en los tags.
- Comportamiento sin rechazos (abliterated/uncensored): el modelo no aplica las negativas tipicas del ajuste de seguridad original.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta variante concreta.
- Soporte explicito de agentes y razonamiento multi-paso: capacidad implicita por la presencia de trazas de pensamiento, pero no documentada de forma especifica.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB), el modelo cabe en GPUs con 24 GB de VRAM y permite ejecutar un modelo de 27B sin depender de la nube.
- Generacion de codigo asistida en entornos cerrados: un modelo de 27B con modo de razonamiento acortado es adecuado para autocompletado y revision de codigo donde la latencia por token de pensamiento importa, siempre que el uso encaje en la licencia Polyform.
- Analisis de documentos tecnicos con imagenes: la combinacion de entrada visual (mmproj) y razonamiento permite extraer datos de diagramas, capturas o esquemas junto al texto circundante.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, es un objeto de estudio directo para medir como se comporta un modelo de razonamiento cuando se eliminan las direcciones de rechazo, sin necesidad de entrenar nada.
- Redaccion de contenido sin restricciones tematicas: util en flujos editoriales de ficcion o generos donde los filtros de seguridad de los modelos alineados interrumpen la generacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece diez niveles de cuantizacion (de Q2_K a Q8_0) del mismo modelo, lo que permite medir el impacto de la compresion en calidad y velocidad sobre un mismo conjunto de tareas.
- Razonamiento de bajo coste en produccion: si el gasto en tokens de pensamiento es el cuello de botella economico, esta variante reduce ese gasto un 37,2 % de media respecto a ThinkingCap base, con una perdida declarada de 0,86 puntos de precision.
- Inferencia por lotes en servidores multiusuario: las variantes de menor tamano (Q3_K_M, 13,6 GB) permiten servir varias instancias en una sola GPU de 48 GB, aunque con la caida de calidad propia de las cuantizaciones bajas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al fine-tune de BottleCap AI sobre el que se construye esta cadena, no a la variante abliterated ni a las cuantizaciones GGUF de mradermacher:

| Metrica | Resultado | Fuente |
|---|---|---|
| Reduccion de tokens de pensamiento | 37,2 % de media en 12 benchmarks | BottleCap AI |
| Coste en precision | 0,86 puntos porcentuales | BottleCap AI |
| Precision macro-media | dato truncado en la fuente consultada | BottleCap AI |

No se han publicado resultados de benchmarks especificos para la version abliterated ni para las cuantizaciones GGUF en la informacion disponible.

## Requisitos de hardware

Los tamanos de fichero son los declarados por mradermacher en la model card; la VRAM necesaria debe sumar a esa cifra el cache KV y el overhead del runtime, que depende del contexto configurado.

- Q2_K: 11,0 GB de pesos.
- Q3_K_S 12,4 GB; Q3_K_M 13,6 GB; Q3_K_L 14,7 GB de pesos.
- Q4_K_S 15,9 GB; Q4_K_M 16,9 GB de pesos (los propios autores los marcan como "fast, recommended").
- Q5_K_S 19,1 GB; Q5_K_M 19,6 GB de pesos.
- Q6_K 22,5 GB de pesos.
- Q8_0 29,1 GB de pesos, descrito como "fast, best quality".
- Complemento multimodal: mmproj-Q8_0 0,7 GB; mmproj-f16 1,0 GB.
- GPU de consumo: las cuantizaciones de Q2_K a Q4_K_M caben en una RTX 3090 o RTX 4090 de 24 GB; Q5 y superiores requieren tarjetas de 32 GB o mas (RTX 5090, A6000) o reparto entre GPU y CPU.
- GPU de datacenter: A100 40/80 GB, H100 y L40S permiten cargar Q8_0 con contexto amplio sin desbordar a CPU.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) son el destino natural del formato GGUF; tambien puede servirse con llama.cpp server en modo compatible con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Formato |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-abliterated (este, GGUF) | 27,32 mil millones | no disponible | Traza reducida un 37,2 %; sin rechazos | Polyform Small Business 1.0.0 | GGUF |
| Qwen3.8-27B (base, equipo Qwen) | ~27 mil millones | no disponible | Traza estandar | no disponible | safetensors/bf16 |
| ThinkingCap-Qwen3.8-27B (BottleCap AI) | ~27 mil millones | no disponible | Traza reducida un 37,2 %; alineado | no disponible | safetensors/bf16 |
| Qwen3.8-27B-OBLITERATED | ~27 mil millones | no disponible | Sin rechazos, sin recorte de traza | no disponible | GGUF |

La diferencia funcional clave frente a las alternativas es la combinacion de dos modificaciones en un mismo modelo: recorte de la traza de razonamiento (ThinkingCap) y eliminacion de rechazos (abliterated). Ninguno de los otros tres modelos de la tabla reune ambas caracteristicas.

## Limitaciones y advertencias

- La abliteracion elimina los mecanismos de rechazo: el modelo puede generar contenido danino, ilegal o eticamente problematico sin las salvaguardas del modelo original. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- La licencia Polyform Small Business 1.0.0 no es una licencia de codigo abierto; impone restricciones al uso comercial segun el tamano de la empresa. Es imprescindible revisar el fichero LICENSE antes de cualquier despliegue productivo.
- No se ha publicado la longitud de contexto soportada en la informacion disponible, un dato critico para planificar cargas con documentos largos.
- La reduccion de tokens de pensamiento conlleva una perdida declarada de 0,86 puntos porcentuales de precision; en tareas de razonamiento complejo (matematicas, logica formal) ese margen puede ampliarse.
- Las cuantizaciones por debajo de Q4 pierden calidad de forma apreciable; la propia model card marca Q3_K_M como "lower quality" y desaconseja implicitamente su uso cuando la precision importa.
- Las cuantizaciones de este repositorio son estaticas; no se ofrecen variantes ponderadas ni con matriz de importancia, lo que en tamanos bajos suele implicar mayor degradacion que en cuantizaciones de ese tipo.
- Los repositorios base no documentan datos de sesgo, composicion del dataset de entrenamiento ni evaluaciones de seguridad, por lo que no es posible estimar el sesgo de forma cuantitativa.
- El modelo hereda las limitaciones del Qwen3.8-27B original; el tag `multilingual` no especifica que idiomas estan cubiertos con calidad suficiente, y el castellano no aparece listado de forma explicita.
- El repositorio registra 0 descargas y 0 "likes" en el momento de redactar la ficha, por lo que no existe validacion de la comunidad sobre estas cuantizaciones concretas.
- Los tags `qwen3_5` y `qwen3_8` no aclaran la relacion exacta entre generaciones de la familia Qwen, lo que dificulta trazar la procedencia exacta de los pesos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.8-27B-abliterated-GGUF
- Modelo base abliterated (IstroSec): https://huggingface.co/IstroSec/ThinkingCap-Qwen3.8-27B-abliterated
- Pagina de descarga alternativa de mradermacher: https://hf.tst.eu/model#ThinkingCap-Qwen3.8-27B-abliterated-GGUF
- Repositorio relacionado (variante de cuantizacion alternativa): https://huggingface.co/mradermacher/Qwen3.8-27B-thinkingcap-abliterated-GGUF
- Repositorio relacionado (cuantizacion i1): https://huggingface.co/mradermacher/Qwen3.8-27B-thinkingcap-abliterated-i1-GGUF
- Anuncio de ThinkingCap-Qwen3.8-27B (BottleCap AI): https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Cobertura de prensa con las cifras de reduccion de tokens: https://www.marktechpost.com/2026/09/24/bottlecap-ai-releases-thinkingcap-qwen3-8-27b-37-2-fewer-thinking-tokens-at-a-0-86pp-accuracy-cost/
- Guia de ejecucion local de la variante OBLITERATED (VRAM y ajustes): https://www.mindstudio.ai/blog/run-qwen3-8-27b-obliterated-locally
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

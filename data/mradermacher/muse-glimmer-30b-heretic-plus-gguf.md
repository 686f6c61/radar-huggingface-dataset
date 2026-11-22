# mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF

## Resumen

Muse-Glimmer-30B-heretic-plus-GGUF es una distribucion de cuantizaciones GGUF del modelo Muse-Glimmer-30B-heretic-plus, un modelo multimodal de tipo image-text-to-text derivado del modelo base gjtgjt/Muse-Glimmer-30B-heretic-plus. Las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF de modelos open source, empleando el formato estatico de llama.cpp con soporte para el proyector multimodal (mmproj). El modelo conserva la licencia Apache 2.0 del original y esta pensado para ejecucion local en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles con GGUF.

El modelo pertenece a la familia "heretic", una linea de variantes "abliterated" o "uncensored" que eliminan o atenuan los mecanismos de rechazo del modelo original mediante técnicas de abliteration. Esto lo orienta a casos de uso donde se requiere baja tasa de negativas del modelo ante peticiones legítimas, a costa de una menor alineacion de seguridad. El nombre comercial indica 30B, pero el recuento real de parametros en safetensors es de 27.854.794.240 (aproximadamente 27,85 mil millones), por lo que se trata de un modelo denso de gran tamano, no de una arquitectura MoE.

La relevancia actual radica en que permite desplegar un modelo multimodal de casi 28B parametros en equipos con GPU de consumo mediante cuantizaciones de 4 bits (Q4_K_M, 17 GB) o incluso en configuraciones mas ajustadas con Q2_K (10,8 GB). No obstante, la informacion publicada no incluye detalles sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal image-text-to-text; detalles internos no publicados) |
| Parametros totales | 27.854.794.240 (aprox. 27,85B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 197,5 GB (incluye todas las cuantizaciones y proyectores) |
| Pipeline | image-text-to-text |
| Modelo base | gjtgjt/Muse-Glimmer-30B-heretic-plus |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el pipeline declarado (image-text-to-text) y la presencia de ficheros mmproj en las cuantizaciones, se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje, siguiendo el patron habitual de los modelos vision-language. El recuento de parametros (27,85B) corresponde a un modelo denso, no a una arquitectura de mezcla de expertos.

Respecto al entrenamiento, la model card no incluye informacion sobre volumen de tokens, composicion del dataset, fases de RLHF/DPO ni tecnicas de alineacion. La unica informacion relevante es que el modelo base es una variante "heretic-plus", lo que implica que ha sido sometido a un proceso de abliteration o modificacion de direcciones de activacion para reducir los rechazos del modelo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles, chino y otros idiomas (etiqueta multilingual).
- Procesamiento de imagenes junto con texto (image-text-to-text), con soporte de proyector multimodal incluido en los ficheros mmproj.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Conversacion general y asistencia textual.
- Capacidades multilingues limitadas a las declaradas (en, zh, multilingual); el grado de cobertura del resto de idiomas no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente multimodal: gracias a las cuantizaciones Q4_K_M (17 GB) y Q5_K_M (19,9 GB), el modelo puede ejecutarse en una unica GPU de consumo de 24 GB, procesando imagenes y texto en un entorno sin conexion.
- Analisis de documentos con imagenes: uso del proyector mmproj para extraer informacion de capturas, diagramas o formularios escaneados combinados con instrucciones textuales, en flujos de digitalizacion internos.
- Investigacion sobre alineacion y seguridad: la variante heretic permite estudiar el comportamiento de modelos abliterated frente a los originales, comparando tasas de rechazo en conjuntos de prompts controlados.
- Prototipado rapido con llama.cpp u Ollama: la disponibilidad de cuantizaciones desde Q2_K (10,8 GB) hasta Q8_0 (29,7 GB) permite ajustar el modelo al hardware disponible en fases de prueba.
- Generacion de descripciones y etiquetado de imagenes: uso del pipeline image-text-to-text para anotar lotes de imagenes en ingles o chino, con la ventaja de ejecucion local y sin coste por token.
- Experimentacion con modelos multilingues en chino e ingles: el modelo declara soporte de ambos idiomas, lo que permite probar traduccion, resumen o conversacion bilingue en entornos de investigacion.
- Fine-tuning o evaluacion sobre el modelo base: las cuantizaciones GGUF son utiles para inferencia, pero el modelo base en safetensors (gjtgjt/Muse-Glimmer-30B-heretic-plus) es el punto de partida para adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni KV cache):
  - Q2_K: 10,8 GB
  - Q3_K_S: 12,6 GB; Q3_K_M: 13,8 GB; Q3_K_L: 14,8 GB
  - IQ4_XS: 15,4 GB; Q4_K_S: 16,2 GB; Q4_K_M: 17,0 GB
  - Q5_K_S: 19,4 GB; Q5_K_M: 19,9 GB
  - Q6_K: 23,0 GB
  - Q8_0: 29,7 GB
  - Proyector multimodal: mmproj-Q8_0 (2,2 GB) o mmproj-f16 (3,9 GB), adicional a los pesos del modelo.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, una RTX 4090 (24 GB) permite Q4_K_M y Q5_K_M con margen limitado para contexto; Q6_K requiere al menos 24 GB y deja poco espacio para KV cache; Q8_0 requiere GPUs de 32 GB o superiores (A100 40 GB, H100, RTX 5090 si dispone de 32 GB).
- Cabe en GPU de consumo: si, en tarjetas de 16 GB con cuantizaciones Q3 o IQ4_XS, y en tarjetas de 24 GB con Q4_K_M o Q5_K_M. Para Q2_K bastaria con 12 GB de VRAM, aunque con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede usarse con transformers. No se documenta soporte especifico de vLLM o TGI para estas cuantizaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo orientativo estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-heretic-plus (este) | 27,85B | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal, variante abliterated |
| gjtgjt/Muse-Glimmer-30B-heretic-plus (base) | 27,85B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Alternativas de ~30B multimodales | no disponible | no disponible | no disponible | no disponible | Sin datos verificables en la informacion disponible |

## Limitaciones y advertencias

- La variante "heretic"/"abliterated" reduce los rechazos del modelo, lo que implica una menor alineacion de seguridad y mayor probabilidad de generar contenido inapropiado o danino sin filtros. No es recomendable para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo conversacional multimodal, puede inventar detalles sobre imagenes o texto no presentes.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Cobertura idiomatica limitada declarada a en, zh y multilingual; el rendimiento en castellano no esta documentado y podria ser inferior.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados abliterated pueden estar sujetos a las condiciones del modelo original; conviene verificar la model card de gjtgjt/Muse-Glimmer-30B-heretic-plus antes de un despliegue comercial.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la perplejidad y la coherencia; para produccion se recomienda Q4_K_M o superior.
- El repositorio ocupa 197,5 GB, por lo que la descarga completa es costosa; conviene descargar solo la cuantizacion necesaria y el mmproj correspondiente.
- No se documentan garantias de soporte, mantenimiento ni actualizaciones por parte del cuantizador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-plus-GGUF
- Modelo base: https://huggingface.co/gjtgjt/Muse-Glimmer-30B-heretic-plus
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/Muse-Glimmer-30B-heretic-plus-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Muse-Glimmer-30B-heretic-plus-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

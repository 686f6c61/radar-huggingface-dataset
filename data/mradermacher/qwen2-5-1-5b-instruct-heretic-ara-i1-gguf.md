# mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF

## Resumen

Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF es una cuantizacion en formato GGUF del modelo aasis001/Qwen2.5-1.5B-Instruct-heretic-ara, publicada por mradermacher. El modelo subyacente es una variante "abliterated" (tambien etiquetada como "decensored" o "uncensored") de Qwen2.5-1.5B-Instruct, es decir, una version en la que se ha aplicado la tecnica de abliteration para eliminar la direccion de rechazo en el espacio de activaciones del transformer, reduciendo la tendencia del modelo a negarse a responder determinadas peticiones. La sufijo "ara" hace referencia a la tecnica de abliteration aplicada por el autor del modelo base.

El repositorio contiene unicamente un fichero imatrix (0,1 GB) generado con el metodo de cuantizacion por importancia de pesos, util para producir cuantizaciones GGUF propias. La model card lista los tipos de cuantizacion disponibles (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ1 a IQ4, entre otros) y remite a la version de cuantizaciones estaticas del mismo autor. El modelo hereda la licencia Apache 2.0 del Qwen2.5 original.

Por su tamano (1.500 millones de parametros en el modelo original, aunque el campo de parametros del repo indica 1.020.404, presumiblemente por el fichero imatrix) y su contexto nativo de 32.768 tokens en Qwen2.5, esta pensado para despliegue en hardware modesto, incluyendo CPU y GPUs de consumo. Su interes practico radica en combinar un modelo pequeno, rapido y de licencia permisiva con la eliminacion del sesgo de rechazo, lo que lo hace util para experimentacion en generacion creativa sin restricciones o para estudiar el efecto de la abliteration en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con abliteration aplicada |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el repo declara 1.020.404 en el fichero imatrix |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5; no confirmado en la info del repo) |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | en (segun la model card; Qwen2.5 soporta multilingue pero no se declara en este repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); cuantizaciones estaticas en repo hermano |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1.500 millones de parametros desarrollado por Alibaba Qwen. Sobre el se ha aplicado abliteration, una tecnica de edicion de pesos que identifica la direccion de activacion asociada al comportamiento de rechazo (refusal) y la proyecta fuera de las matrices de pesos, de modo que el modelo pierde parte de su tendencia a declinar peticiones. El autor del modelo base etiqueta la variante como "heretic" y "ara", terminos que en la comunidad de modelos abliterated designan distintas implementaciones o intensidades de la tecnica.

No se dispone de informacion sobre el dataset de entrenamiento adicional, el numero de tokens empleados en el proceso de abliteration ni si se aplico RLHF o DPO especifico sobre esta variante. El proceso de cuantizacion realizado por mradermacher emplea imatrix (importance matrix), que estima la importancia de cada peso mediante un conjunto de calibracion y mejora la calidad de las cuantizaciones de baja precision (especialmente IQ y K-quants) respecto a la cuantizacion uniforme. El repositorio solo incluye el fichero imatrix, no los pesos cuantizados finales, que se distribuyen en el repositorio de cuantizaciones estaticas del mismo autor.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento basico, matematicas elementales y generacion de codigo a nivel de modelo pequeno.
- Soporte de tool calling / function calling (capacidad nativa de Qwen2.5-Instruct).
- Capacidad de seguir instrucciones y mantener formato de chat (ChatML de Qwen).
- Reduccion del sesgo de rechazo gracias a la abliteration: responde a peticiones que el modelo original declinaria.
- Capacidades multilingues limitadas: la model card solo declara ingles, aunque el modelo base Qwen2.5 tiene cobertura multilingue amplia no garantizada en esta variante.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Experimentacion con abliteration: permite estudiar como afecta la eliminacion de la direccion de rechazo a la calidad, coherencia y seguridad de un modelo pequeno, comparando respuestas con el Qwen2.5-1.5B-Instruct original.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos donde el modelo original tenderia a autocensurar contenido, con la ventaja de ejecutarse en local.
- Prototipado rapido en CPU: al ser un modelo de 1,5B en GGUF, puede correr en portatiles sin GPU usando llama.cpp u Ollama, ideal para validar pipelines de generacion antes de escalar a modelos mayores.
- Asistentes conversacionales locales y privados: despliegue en dispositivos de borde o entornos air-gapped donde no se quiere enviar datos a la nube, con contexto suficiente para conversaciones multi-turno.
- Generacion de codigo asistida en editor: integracion via API compatible con OpenAI (endpoints_compatible) en herramientas de autocompletado o revision de codigo para tareas sencillas.
- Filtrado y clasificacion de texto: uso como modelo de bajo coste para etiquetar, resumir o reformatear grandes volumenes de texto en lotes, donde la latencia y el coste por token importan mas que la precision puntera.
- Base para fine-tuning: punto de partida ligero para ajuste especifico en dominios donde se requiere un modelo sin sesgo de rechazo y con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 GB (Q4_K_M) y 3 GB (Q8_0) en GPU; en CPU, entre 1 y 2 GB de RAM segun cuantizacion.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, GTX 1660, RTX 4060, etc.); en A100/H100 el modelo esta infrautilizado pero funciona.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF), TGI (limitado para GGUF), endpoints compatibles con OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en CPU se espera un rendimiento de decenas de tokens por segundo para cuantizaciones Q4, y cientos en GPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF | 1,5B | 32.768 (heredado) | Apache 2.0 | GGUF (imatrix) | Abliterated, solo imatrix en repo |
| Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Con sesgo de rechazo intacto |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community | safetensors, GGUF | Mayor contexto, licencia mas restrictiva |
| Gemma-2-2B-it | 2,6B | 8.192 | Gemma Terms | safetensors, GGUF | Mayor tamano, contexto menor |

## Limitaciones y advertencias

- La abliteration no elimina por completo los sesgos del modelo base; puede seguir mostrando sesgos de genero, raza o religion, y la eliminacion del rechazo puede aumentar la probabilidad de contenido toxico o inexacto.
- Riesgo elevado de alucinacion, acentuado por el tamano reducido del modelo (1,5B) y por la perdida de capacidades que puede introducir la edicion de pesos.
- La model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior al del Qwen2.5 original.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros de rechazo conlleva responsabilidad legal y etica por parte del operador; conviene anadir capas de moderacion externas.
- El repositorio solo contiene el fichero imatrix; para usar el modelo hay que descargar las cuantizaciones del repositorio hermano o generarlas uno mismo.
- No hay datos de benchmarks ni evaluaciones de seguridad publicadas en la informacion disponible.
- El campo de parametros del repo (1.020.404) no coincide con el tamano nominal del modelo base (1,5B), lo que sugiere que se refiere al fichero imatrix y no al modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF
- Modelo base: https://huggingface.co/aasis001/Qwen2.5-1.5B-Instruct-heretic-ara
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Instruct-heretic-ara-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen2.5-1.5B-Instruct-heretic-ara-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Qwen2.5 (modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

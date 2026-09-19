# mradermacher/Haumea-1.5-i1-GGUF

## Resumen

Haumea-1.5-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Haumea-1.5, publicado por el usuario mradermacher bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada del modelo base HaumeaAI/Haumea-1.5, orientada a su ejecucion en hardware de consumo mediante la libreria llama.cpp y sus derivados. El modelo base cuenta con 7.248.023.552 parametros (aproximadamente 7,25 mil millones), segun los tensores en safetensors declarados en la ficha.

La relevancia de esta publicacion radica en la disponibilidad de cuantizaciones del tipo i1, generadas con la tecnica de imatrix (importance matrix), que permite conservar mas calidad por bit que las cuantizaciones estaticas equivalentes. El repositorio ofrece un rango muy amplio de niveles de compresion, desde IQ1_M (1,9 GB) hasta Q6_K (6,0 GB), lo que cubre desde equipos con recursos muy limitados hasta estaciones de trabajo con GPU de gama alta.

El modelo esta etiquetado como conversacional y esta orientado al idioma ingles. La informacion publicada no incluye detalles sobre la arquitectura interna del modelo base, la longitud de contexto, el proceso de entrenamiento ni resultados de benchmarks, por lo que estos apartados se marcan como no disponibles a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se distribuye a traves de la libreria transformers; no se especifica si es densa, MoE o hibrida) |
| Parametros totales | 7.248.023.552 (aproximadamente 7,25 mil millones), segun los tensores en safetensors del modelo base |
| Parametros activos | no disponible (no se especifica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M, IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K (variantes i1 con imatrix); el autor publica ademas cuantizaciones estaticas en el repositorio Haumea-1.5-GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 81,8 GB (incluye todos los niveles de cuantizacion) |
| Modelo base | HaumeaAI/Haumea-1.5 |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base Haumea-1.5 en la documentacion proporcionada. La etiqueta de libreria es transformers y el modelo se describe como conversacional, pero no se detalla si emplea atencion completa estandar, atencion lineal, mezcla de expertos u otro esquema. Tampoco se especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa.

En cuanto al entrenamiento, la model card del repositorio de cuantizaciones no aporta datos sobre el volumen de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. Toda la informacion disponible se limita al proceso de cuantizacion: las variantes i1 se han generado con una importance matrix (fichero Haumea-1.5.imatrix.gguf) para mejorar la fidelidad de los pesos cuantizados, y el autor indica que las cuantizaciones IQ suelen ofrecer mejor relacion calidad/tamano que las no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y esta pensado para dialogos multi-turno en ingles.
- No se dispone de informacion publicada sobre capacidades especificas de razonamiento, matematicas o generacion de codigo.
- No se especifica soporte de tool calling ni function calling.
- No se especifica soporte para flujos de agentes o razonamiento multi-paso.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- No se documenta ningun modo especial (modo de pensamiento, vision, audio o decodificacion especulativa) en la informacion disponible.

## Casos de uso

- Despliegue en equipos de sobremesa con GPU de gama media: la cuantizacion i1-Q4_K_M ocupa 4,5 GB, lo que permite ejecutar el modelo en GPUs con 8 GB de VRAM, e incluso en configuraciones con 6 GB usando i1-Q4_K_S (4,2 GB).
- Prototipado rapido de asistentes conversacionales en ingles: al ser un modelo de 7,25 B con licencia Apache 2.0, puede integrarse sin coste de licencia en pruebas de concepto de chatbots de soporte o asistentes internos.
- Ejecucion en CPU o sistemas embebidos: las cuantizaciones de menor tamano, como i1-IQ2_XS (2,3 GB) o i1-IQ2_M (2,6 GB), permiten inferencia en equipos sin GPU dedicada mediante llama.cpp.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece 17 niveles distintos del mismo modelo, lo que lo convierte en un banco de pruebas util para medir la degradacion de perplejidad entre cuantizaciones i1 e imatrix.
- Generacion de texto offline y procesamiento por lotes: al ejecutarse de forma local con llama.cpp u Ollama, es adecuado para tareas de resumen o clasificacion de texto en entornos con requisitos de privacidad y sin conexion a servicios en la nube.
- Fine-tuning sobre el modelo base: la licencia Apache 2.0 del modelo base facilita el ajuste posterior para dominios concretos; las cuantizaciones aqui publicadas se emplearian solo para la fase de inferencia.
- Integracion en pipelines de bajo consumo con Ollama o LM Studio: los ficheros GGUF son compatibles directamente con estas herramientas, lo que simplifica el despliegue en entornos de desarrollo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Cuantizacion completa en precision 16 bits: aproximadamente 14,5 GB en disco y VRAM, calculado a partir de los 7,25 mil millones de parametros del modelo base.
- VRAM estimada para inferencia, segun cuantizacion (solo pesos, sin contar la cache KV):
  - i1-IQ1_M: 1,9 GB.
  - i1-IQ2_M: 2,6 GB.
  - i1-IQ3_XXS: 2,9 GB.
  - i1-Q4_K_S: 4,2 GB.
  - i1-Q4_K_M: 4,5 GB.
  - i1-Q5_K_S: 5,1 GB.
  - i1-Q6_K: 6,0 GB.
- GPU de gama alta (A100, H100): sobredimensionadas para este tamano; se recomiendan unicamente en escenarios de alto throughput con muchos procesos concurrentes.
- GPU de consumo: cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 (12 GB) y RTX 3060 (12 GB). Las cuantizaciones IQ4_XS (4,0 GB) y Q4_K_S (4,2 GB) son las mas equilibradas para GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (endpoints_compatible segun las etiquetas del repositorio). Tambien es posible usar vLLM si se parte del modelo base en safetensors, no de los ficheros GGUF.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Como referencia cualitativa, el autor senala i1-Q4_K_M como "rapida y recomendada" e i1-Q4_K_S como el punto optimo entre tamano, velocidad y calidad.

## Comparativa con modelos similares

La informacion publicada no incluye datos de rendimiento de Haumea-1.5, por lo que la comparacion se limita a caracteristicas objetivas (parametros, contexto y licencia). Los datos de los modelos alternativos corresponden a informacion publica ampliamente conocida y no a mediciones realizadas sobre Haumea.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| Haumea-1.5 | 7,25 mil millones | no disponible | Apache 2.0 | Si (cuantizaciones estaticas e i1 con imatrix) |
| Meta Llama 3.1 8B Instruct | 8,03 mil millones | 128 000 tokens | Llama 3.1 Community License | Si |
| Mistral 7B Instruct v0.3 | 7,24 mil millones | 32 000 tokens | Apache 2.0 | Si |
| Qwen2.5 7B Instruct | 7,61 mil millones | 131 072 tokens (con YaRN) | Apache 2.0 | Si |

Nota: la comparativa de rendimiento (MMLU, HumanEval, GSM8K u otros) no puede establecerse porque no se dispone de resultados publicados para Haumea-1.5.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican detalles de arquitectura, datos de entrenamiento, longitud de contexto ni proceso de alineacion, lo que dificulta evaluar el modelo antes de desplegarlo.
- Sin benchmarks publicados: no es posible verificar el rendimiento del modelo frente a alternativas de tamano similar.
- Sesgos: no disponibles, al no existir informacion sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: no cuantificado, pero aplicable a cualquier modelo generativo de 7 B sin datos de evaluacion publicados.
- Limitacion idiomatica: el modelo esta etiquetado unicamente para ingles; su comportamiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Repositorio sin traccion: 0 descargas y 0 "me gusta" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Caducidad y trazabilidad: las cuantizaciones son una redistribucion de terceros; si el modelo base se actualiza, el repositorio podria quedar desincronizado. Conviene verificar el modelo base HaumeaAI/Haumea-1.5 antes de usarlo en produccion.
- Licencia: Apache 2.0, que permite uso comercial sin restricciones de atribucion mas alla de las habituales. Se recomienda confirmar que el modelo base mantiene la misma licencia en su repositorio original.
- Cuantizaciones de baja calidad: el autor advierte explicitamente que i1-IQ1_M esta pensada para casos "desesperados" y que i1-Q2_K_S es de "calidad muy baja". No se recomienda su uso en produccion.
- Las fechas de creacion y actualizacion del repositorio (19 de septiembre de 2026) figuran en el futuro respecto a la fecha habitual de consulta; conviene verificarlas en la pagina original.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/Haumea-1.5-i1-GGUF
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Haumea-1.5-GGUF
- Modelo base: https://huggingface.co/HaumeaAI/Haumea-1.5
- Pagina de resumen y descarga del autor: https://hf.tst.eu/model#Haumea-1.5-i1-GGUF
- Fichero imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Haumea-1.5-i1-GGUF/resolve/main/Haumea-1.5.imatrix.gguf
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces utiles son los del repositorio de HuggingFace y los recursos de referencia citados por el autor.

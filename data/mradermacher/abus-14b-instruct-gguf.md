# mradermacher/Abus-14B-Instruct-GGUF

## Resumen

Abus-14B-Instruct-GGUF es la distribucion en formato GGUF del modelo Abus-14B-Instruct, un modelo de lenguaje conversacional de aproximadamente 14.770 millones de parametros (14,7B) desarrollado por el usuario marcuscedricridia y cuantizado por mradermacher. El modelo original se ha generado mediante tecnicas de fusion (merge) de modelos, segun indican las etiquetas `mergekit` y `merge` presentes en la model card, lo que sugiere que combina pesos de varios modelos base para obtener un comportamiento mejorado en tareas de instruccion.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad una version cuantizada en multiples niveles de precision (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de 14,7B en hardware de consumo. El repositorio ocupa 102 GB e incluye diez variantes de cuantizacion, ademas de una version con cuantizacion ponderada/imatrix publicada en un repositorio separado.

Esta ficha se centra en la version GGUF, orientada a inferencia local mediante llama.cpp y herramientas compatibles. La informacion disponible sobre el modelo original es limitada: la model card no detalla la composicion del dataset de entrenamiento, la longitud de contexto ni los resultados de benchmarks, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de fusion mediante mergekit; detalles no disponibles) |
| Parametros totales | 14.765.947.904 (14,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 102,0 GB |
| Modelo base | marcuscedricridia/Abus-14B-Instruct |
| Compatibilidad con endpoints | Si (tag `endpoints_compatible`) |

## Arquitectura y entrenamiento

El modelo original Abus-14B-Instruct es el resultado de una fusion de modelos realizada con mergekit, segun las etiquetas del repositorio. No se dispone de informacion detallada sobre la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion, uso de RoPE, etc.), ni sobre el proceso de entrenamiento: no se especifica el numero de tokens utilizados, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

La version aqui descrita es una cuantizacion estatica (no imatrix) generada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, segun los metadatos de la model card. Para quienes prefieran cuantizaciones ponderadas de mayor calidad, el autor publica una version imatrix en el repositorio `mradermacher/Abus-14B-Instruct-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a instrucciones (modelo de tipo Instruct).
- Razonamiento y respuesta a preguntas en formato multi-turno, segun la etiqueta `conversational`.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- Capacidades de codigo y matematicas: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local de un asistente conversacional en ingles: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB), el modelo puede ejecutarse en una GPU de consumo con 12-16 GB de VRAM, ofreciendo respuestas de un modelo de 14,7B sin depender de la nube.
- Prototipado rapido de aplicaciones de chat: la disponibilidad de diez niveles de cuantizacion permite ajustar el equilibrio entre calidad y requisitos de memoria segun el hardware disponible, desde Q2_K (5,9 GB) para equipos modestos hasta Q8_0 (15,8 GB) para maxima fidelidad.
- Experimentacion con modelos fusionados: investigadores interesados en el efecto de las tecnicas de merge pueden comparar esta fusion con sus modelos base utilizando las mismas herramientas de inferencia (llama.cpp, Ollama).
- Evaluacion comparativa de cuantizaciones: el repositorio incluye tanto cuantizaciones estaticas como una version imatrix separada, lo que facilita estudiar el impacto de la cuantizacion en la perplejidad y la calidad de las respuestas.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: al ser un GGUF ligero en su variante Q4, puede incorporarse en entornos de integracion para validar plantillas de prompts y flujos conversacionales.
- Educacion y divulgacion: un modelo de 14,7B cuantizado es un recurso adecuado para talleres sobre inferencia local, cuantizacion y despliegue de LLM en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF y el contexto):
  - Q2_K: ~6 GB.
  - Q3_K_M: ~7,5 GB.
  - Q4_K_M: ~9,5 GB.
  - Q5_K_M: ~11 GB.
  - Q6_K: ~12,5 GB.
  - Q8_0: ~16 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti (16 GB) para Q4_K_M y Q5_K_M; RTX 3060 (12 GB) para Q3_K_M y Q4_K_S.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q5_K_M con 12-16 GB de VRAM; Q8_0 requiere al menos 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Tambien puede servirse mediante endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Abus-14B-Instruct-GGUF | 14,7B | No disponible | No disponible | GGUF | Fusion via mergekit; solo ingles |
| Modelo base Abus-14B-Instruct | 14,7B | No disponible | No disponible | Safetensors | Version sin cuantizar del mismo modelo |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser una fusion de modelos, puede heredar sesgos de sus componentes, que no se detallan.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de idioma: el modelo esta etiquetado unicamente para ingles (`en`), por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite el uso comercial. Es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Contexto: se desconoce la longitud maxima de contexto, lo que dificulta planificar aplicaciones con documentos largos.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K pueden degradar notablemente la calidad; la propia model card recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q6_K por su muy buena calidad.
- Modelo de nicho: con 53 descargas y 1 like en el momento de la consulta, la comunidad de usuarios es muy reducida, lo que limita el soporte y la validacion independiente.
- Fecha de actualizacion: el repositorio muestra una fecha de actualizacion de 2026-11-27, posterior a la de creacion; conviene revisar posibles cambios en los archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Abus-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/Abus-14B-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Abus-14B-Instruct-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Abus-14B-Instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de las cuantizaciones: https://www.nethype.de/

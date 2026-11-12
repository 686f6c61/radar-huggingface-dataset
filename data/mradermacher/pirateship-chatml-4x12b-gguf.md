# mradermacher/PirateShip-ChatML-4x12B-GGUF

## Resumen

PirateShip-ChatML-4x12B-GGUF es una distribucion de cuantizaciones GGUF del modelo PirateShip-ChatML-4x12B, publicado originalmente por nbeerbower y cuantizado por mradermacher. Se trata de un modelo conversacional en ingles con arquitectura de mezcla de expertos (MoE) de aproximadamente 38.670 millones de parametros totales, derivado del modelo base nbeerbower/PirateShip-ChatML-4x12B. La nomenclatura "4x12B" sugiere una estructura de cuatro expertos de aproximadamente 12.000 millones de parametros cada uno, aunque la model card no detalla la configuracion exacta de expertos ni el numero de parametros activos por token.

El modelo esta pensado para generacion de texto conversacional y su relevancia practica radica en que las cuantizaciones GGUF permiten ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos completos en precision nativa (el repositorio ocupa 263,7 GB). La licencia Apache 2.0 facilita su uso comercial y su modificacion.

No obstante, la informacion publicada es escasa: la model card del repositorio de cuantizaciones se limita a listar los ficheros GGUF y sus tamanos, sin detallar datos de entrenamiento, contexto, benchmarks ni capacidades especificas mas alla de la etiqueta "conversational".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun la nomenclatura "4x12B"; detalles de la configuracion no disponibles |
| Parametros totales | 38.672.716.800 (38,67 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es nbeerbower/PirateShip-ChatML-4x12B y que la variante aqui descrita es una cuantizacion GGUF de tipo estatico (quantize_version 2, con tensor de salida cuantizado y conversion desde formato Hugging Face). La nomenclatura "4x12B" apunta a una arquitectura MoE con cuatro expertos de aproximadamente 12.000 millones de parametros, pero no se dispone de detalles oficiales sobre el numero de expertos activos por token, la dimension oculta, el numero de capas ni el mecanismo de enrutamiento.

Tampoco se han publicado en la informacion proporcionada datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre "ChatML" sugiere el uso del formato de plantilla ChatML para la conversacion, pero no hay confirmacion explicita en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Formato de chat basado en ChatML (inferido del nombre del modelo; no confirmado en la documentacion).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- No se dispone de informacion sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni modo de pensamiento.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: las cuantizaciones Q4_K_M (23,6 GB) permiten desplegar el modelo en estaciones de trabajo con GPU de 24 GB, agilizando pruebas de concepto sin necesidad de infraestructura en la nube.
- Experimentacion academica con arquitecturas MoE: investigadores pueden estudiar el comportamiento de un MoE de 38,67 mil millones de parametros en entornos con recursos limitados usando cuantizaciones Q2_K o Q3_K_S.
- Despliegue en local con llama.cpp u Ollama: la disponibilidad de once niveles de cuantizacion permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible.
- Generacion de respuestas en pipelines de procesamiento por lotes: la compatibilidad con endpoints y el formato GGUF facilitan la integracion en servicios de inferencia autoalojados.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye tanto cuantizaciones estaticas como una variante con imatrix (i1-GGUF), lo que permite medir el impacto de cada metodo en la perplejidad y la calidad de salida.
- Fine-tuning sobre la base cuantizada o sobre los pesos originales: la licencia Apache 2.0 permite adaptar el modelo a dominios especificos y redistribuir las versiones derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K requiere aproximadamente 14,5 GB; Q4_K_M, unos 23,6 GB; Q8_0, unos 41,2 GB. Estas cifras corresponden al tamano del fichero y no incluyen el overhead del contexto KV.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o una A100 de 40 GB; para Q8_0, una A100 de 80 GB o H100.
- Cabe en GPU de consumo: si, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizaciones Q4 o inferiores; las cuantizaciones Q2_K y Q3_K_S podrian caber en GPUs de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere soporte en plataformas de inferencia gestionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PirateShip-ChatML-4x12B-GGUF | 38,67 mil millones | no disponible | Apache 2.0 | GGUF | MoE 4x12B, solo ingles |
| nbeerbower/PirateShip-ChatML-4x12B | 38,67 mil millones | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/PirateShip-ChatML-4x12B-i1-GGUF | 38,67 mil millones | no disponible | Apache 2.0 | GGUF (imatrix) | Variante con cuantizacion ponderada/imatrix |

No se dispone de informacion sobre benchmarks que permita comparar el rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- No se han publicado datos sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- La model card del repositorio de cuantizaciones es puramente tecnica (listado de ficheros) y no describe el comportamiento del modelo.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la procedencia de los datos de entrenamiento del modelo base, no documentada en la informacion disponible.
- El repositorio completo ocupa 263,7 GB, por lo que conviene descargar unicamente la cuantizacion necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/PirateShip-ChatML-4x12B-GGUF
- Modelo base: https://huggingface.co/nbeerbower/PirateShip-ChatML-4x12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/PirateShip-ChatML-4x12B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#PirateShip-ChatML-4x12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

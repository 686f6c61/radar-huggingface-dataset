# mradermacher/KapiCoder-Mongo-Nano-GGUF

## Resumen

KapiCoder-Mongo-Nano-GGUF es la cuantización en formato GGUF, realizada por el usuario mradermacher, del modelo esilva/KapiCoder-Mongo-Nano. Se trata de un modelo de código de tamaño "nano" (494 millones de parámetros reales según los safetensors) basado en la arquitectura Qwen2, entrenado con datos sintéticos y especializado en tareas de código relacionadas con MongoDB, incluyendo relleno en medio (FIM, fill-in-the-middle) y autocompletado. Su tamaño reducido lo hace ideal para ejecutarse en local, incluso en portátiles sin GPU dedicada, con latencias muy bajas.

La relevancia de este repositorio reside en la disponibilidad de cuantizaciones estáticas que abarcan desde Q2_K (0,4 GB) hasta f16 (1,1 GB), lo que permite ajustar el compromiso entre calidad y consumo de recursos. El modelo base se declara bilingüe (inglés y portugués) y con licencia Apache 2.0, apta para uso comercial. Es una opción interesante como motor de autocompletado de código ligero, comparable a otros modelos "nano" de código, aunque sin datos públicos de benchmarks en la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder) |
| Parametros totales | 494.032.768 (~494 M) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles, portugues |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base, KapiCoder-Mongo-Nano, emplea la arquitectura Qwen2, un transformer decoder estandarizado y muy bien soportado por runtimes como llama.cpp, lo que explica la facilidad de conversión a GGUF. Según las etiquetas del repositorio, el entrenamiento se realizó con datos sintéticos (tag `synthetic-data`) orientados a código MongoDB, con capacidades de FIM y autocompletado, un enfoque habitual en modelos de código pequeños diseñados para completar fragmentos dentro de un editor.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre fases de RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas más allá de las capacidades de FIM declaradas; para detalles de entrenamiento habría que consultar la model card del modelo base, que no incluye esa información en los datos disponibles.

## Capacidades

- Generacion y autocompletado de codigo, con especializacion en consultas y operaciones MongoDB (tag `mongodb`).
- Relleno en medio (FIM): dado un prefijo y un sufijo, el modelo genera el fragmento de codigo central, util para autocompletado en editores.
- Autocompletado en linea, orientado a integracion en IDEs con baja latencia.
- Comprension de instrucciones en ingles y portugues (no se declara soporte de castellano).
- Etiquetado como `conversational`, aunque su foco principal es el codigo; no hay informacion sobre vision, audio ni tool calling.

## Casos de uso

- Autocompletado de codigo en editores locales: gracias a su tamano de ~0,5 GB en Q4_K, puede integrarse en VS Code u otros IDEs mediante llama.cpp u Ollama, ofreciendo sugerencias FIM con latencias muy bajas sin conexion a la nube.
- Asistente especializado en MongoDB: generacion de consultas, pipelines de agregacion y esquemas orientados a bases de datos MongoDB, donde su entrenamiento con datos sinteticos especificos aporta ventaja frente a modelos genericos de su tamano.
- Desarrollo en portatiles sin GPU: las cuantizaciones Q2_K a Q5_K caben comodamente en la RAM de cualquier equipo moderno, permitiendo inferencia por CPU en portatiles de gama media.
- Autocompletado para desarrolladores lusohablantes: al soportar portugues ademas de ingles, puede asistir a equipos en Brasil o Portugal con comentarios y prompts en su idioma.
- Prototipado rapido de agentes de codigo ligeros: su licencia Apache 2.0 y su bajo consumo lo hacen adecuado como componente de completado en pipelines automatizados o CI, donde se necesita generar o corregir consultas de base de datos sin coste de API.
- Entornos con restricciones de privacidad: al ejecutarse 100% en local, es apto para empresas que no pueden enviar codigo propietario a servicios externos de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde ~0,4 GB (Q2_K/Q3_K_S) hasta ~1,1 GB (f16); cualquier cuantizacion de este modelo cabe en GPUs consumer de gama baja o directamente en RAM de CPU.
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con 2 GB de VRAM o mas es suficiente. En CPU, cualquier procesador moderno ejecuta el modelo con buena latencia dado su tamano nano.
- Cabe en consumer GPUs: si, incluso en integradas (Intel iGPU, AMD APU) y en GPUs como la GTX 1650 o superiores con holgura.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con transformers o vLLM.
- Latencia y throughput: no disponibles como cifras publicadas; por tamano (~494 M parametros) cabe esperar latencias de primer token muy bajas, aptas para autocompletado interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| KapiCoder-Mongo-Nano | ~494 M | GGUF (este repo) | Codigo MongoDB, FIM | Apache 2.0 |
| Qwen2.5-Coder-0.5B | ~494 M | safetensors / GGUF | Codigo general | Apache 2.0 / Qwen |
| StarCoder2-3B | ~3.000 M | safetensors / GGUF | Codigo general, FIM | BigCode OpenRAIL-M |

KapiCoder-Mongo-Nano comparte tamano y arquitectura base con Qwen2.5-Coder-0.5B, pero se diferencia por su afinamiento especifico en MongoDB y datos sinteticos, a costa de un alcance mas estrecho. Frente a StarCoder2-3B es seis veces mas pequeno y mucho mas facil de desplegar en local, aunque presumiblemente con menor capacidad general de razonamiento sobre codigo. No hay datos de rendimiento comparables publicados.

## Limitaciones y advertencias

- Alcance estrecho: el afinamiento en MongoDB puede degradar el rendimiento en codigo general o en otros frameworks; conviene evaluarlo en el dominio de uso previsto.
- Sin soporte declarado de castellano: los idiomas oficiales son ingles y portugues, por lo que los prompts en espanol podrian dar resultados peores.
- Riesgo de alucinacion tipico de modelos pequenos: puede generar consultas MongoDB sintacticamente validas pero semanticamente incorrectas; verificar siempre las consultas generadas.
- Longitud de contexto no documentada, lo que dificulta planificar ventanas para archivos grandes.
- Las cuantizaciones mas agresivas (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad, especialmente en codigo, como sugiere el propio autor del repo ("lower quality" en Q3_K_M); se recomiendan Q4_K_S, Q4_K_M o superiores.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque conviene revisar la model card del modelo base por si existiera alguna nota adicional.
- No hay benchmarks publicados ni imatrix quants en el momento de redaccion de la ficha.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/KapiCoder-Mongo-Nano-GGUF
- Modelo base: https://huggingface.co/esilva/KapiCoder-Mongo-Nano
- Pagina de descargas resumida (mradermacher): https://hf.tst.eu/model#KapiCoder-Mongo-Nano-GGUF
- Solicitudes de cuantizacion / FAQ: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/Cirrus-x2_123b-GGUF

## Resumen

Cirrus-x2_123b-GGUF es la versión cuantizada en formato GGUF del modelo Cirrus-x2_123b, desarrollado originalmente por RedDragonGecko y publicada por mradermacher, un conocido creador de cuantizaciones de la comunidad open source. Se trata de un modelo de lenguaje de gran tamano (107.346.845.760 parametros reales segun los safetensors del repositorio, aunque el nombre comercial indica 123B) obtenido mediante tecnicas de fusion de modelos (mergekit), lo que sugiere que combina pesos de varios modelos base para agregar capacidades.

La relevancia de esta publicacion reside en que ofrece el modelo en una amplia gama de cuantizaciones GGUF (desde Q2_K hasta Q8_0), lo que permite ejecutar un modelo de mas de 100.000 millones de parametros en hardware de consumo o en servidores con VRAM limitada, algo imposible con los pesos originales en precision completa. El repositorio ocupa 730,2 GB e incluye ficheros divididos en partes para las cuantizaciones de mayor tamano.

No obstante, se trata de un modelo de nicho: cuenta con muy pocas descargas (8) y ningun "like" en el momento de la consulta, la model card es minima y no se documentan detalles sobre arquitectura interna, datos de entrenamiento, contexto maximo ni resultados de benchmarks. Esta ficha refleja esa escasez de informacion de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de fusion creado con mergekit; se desconoce la arquitectura subyacente) |
| Parametros totales | 107.346.845.760 (segun safetensors del repositorio); el nombre comercial indica 123B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base estaria en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos indican que el modelo base (RedDragonGecko/Cirrus-x2_123b) fue creado con mergekit, una herramienta de fusion de modelos que combina los pesos de dos o mas modelos preentrenados mediante tecnicas como SLERP, TIES, DARE o passthrough. El sufijo "x2" sugiere una fusion de dos modelos, pero no se especifica cuales ni con que metodo.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado. La model card del repositorio GGUF es puramente operativa: describe las cuantizaciones disponibles, su tamano y recomendaciones de uso, sin entrar en detalles tecnicos del modelo. Las cuantizaciones son de tipo estatico (no hay versiones imatrix/weighted disponibles en el momento de la publicacion, segun el autor).

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" en los metadatos indica que el modelo esta orientado a dialogos.
- Razonamiento y generacion de texto general: capacidades esperables en un modelo de este tamano, aunque no verificadas con benchmarks.
- Idiomas: unicamente se declara soporte de ingles; no hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades especiales (vision, audio, modo thinking): no disponible (no documentado).

## Casos de uso

- Experimentacion con fusiones de modelos a gran escala: investigadores interesados en evaluar el comportamiento de merges de mas de 100B pueden desplegar las cuantizaciones Q4 o Q5 en servidores con 2-4 GPUs y comparar cualitativamente con los modelos originales.
- Generacion de texto conversacional en ingles sobre hardware de consumo: con la cuantizacion Q2_K (39,9 GB) o Q3_K_S (46,7 GB) es posible cargar el modelo en configuraciones con 48 GB de VRAM o mediante offloading parcial a RAM, para prototipos de chatbots en ingles.
- Evaluacion comparativa de tecnicas de cuantizacion: el rango completo de cuantizaciones (de Q2_K a Q8_0) permite estudiar la degradacion de calidad segun el nivel de compresion en un modelo de gran tamano.
- Despliegue local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (64,6 GB) y Q5_K_M (76,0 GB) son las recomendadas por el autor para un equilibrio entre velocidad y calidad, utilizables en estaciones de trabajo con multiples GPUs.
- Fine-tuning o destilacion sobre un modelo base grande: el modelo puede servir como base para experimentos de ajuste con LoRA, aunque el tamano lo hace costoso.
- Investigacion sobre modelos de la comunidad: util para estudiar el ecosistema de merges y cuantizaciones publicados en Hugging Face, dado el escaso seguimiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas un margen para el contexto y el estado de inferencia. Orientativamente: Q2_K ~40 GB, Q3_K_S ~47 GB, Q3_K_M ~52 GB, Q4_K_S ~61 GB, Q4_K_M ~65 GB, Q5_K_M ~76 GB, Q6_K ~88 GB, Q8_0 ~114 GB.
- GPU recomendadas: para las cuantizaciones pequenas, 2x RTX 4090 (48 GB) o 1x A100 80 GB; para Q4-Q5, 2x A100 80 GB o 4x RTX 4090; para Q8_0, al menos 2x A100 80 GB o 4x A100 40 GB.
- Cabe en GPU de consumo: parcialmente. La Q2_K (39,9 GB) puede caber en 2x RTX 4090 o en una RTX 4090 con offloading parcial a RAM del sistema; las cuantizaciones superiores requieren multiples GPUs o mucha RAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). El repositorio tambien declara compatibilidad con endpoints (tag "endpoints_compatible").
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre benchmarks ni de modelos directamente comparables publicados en la informacion proporcionada. Como referencia estructural, se puede comparar con otros merges cuantizados de la comunidad:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cirrus-x2_123b-GGUF | ~107B (nominal 123B) | no disponible | no disponible | GGUF en HF |
| Modelo base RedDragonGecko/Cirrus-x2_123b | ~107B | no disponible | no disponible | HF (formato transformers) |
| Otros merges cuantizados de mradermacher | variable | no disponible | variable | GGUF en HF |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge sin model card detallada, no hay evaluacion de sesgos.
- Riesgo de alucinacion: no evaluado; los modelos de este tipo y tamano pueden alucinar, especialmente en tareas factuales.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo base antes de un uso en produccion.
- Escasez de documentacion: la model card no aporta informacion sobre arquitectura, entrenamiento ni evaluacion, lo que dificulta la validacion tecnica.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor recomienda Q4_K_S, Q4_K_M y Q8_0.
- Ficheros multiparte: muchas cuantizaciones estan divididas en 2 o 3 partes que deben concatenarse o cargarse conjuntamente.
- Madurez: con solo 8 descargas y ningun like, no hay evidencia de uso en produccion ni de validacion por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Cirrus-x2_123b-GGUF
- Modelo base: https://huggingface.co/RedDragonGecko/Cirrus-x2_123b
- Pagina de descargas del autor: https://hf.tst.eu/model#Cirrus-x2_123b-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nethype GmbH: https://www.nethype.de/

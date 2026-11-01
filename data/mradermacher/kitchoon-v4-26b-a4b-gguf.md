# mradermacher/Kitchoon-V4-26B-A4B-GGUF

## Resumen

Kitchoon-V4-26B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Gemma, según indica la etiqueta `gemma4` de su model card, y afinado específicamente para roleplay y conversación sin censura. Lo desarrolla el usuario SubMaroon y esta ficha documenta la cuantizacion GGUF publicada por mradermacher, un conocido cuantizador de la comunidad que genera versiones estáticas de modelos para su uso con llama.cpp y herramientas compatibles. El modelo declara 25.233.142.046 parámetros totales y una designación "A4B" que sugiere aproximadamente 4 mil millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

El modelo resulta relevante dentro del ecosistema de roleplay local porque combina una arquitectura MoE (que reduce el coste de inferencia frente a un modelo denso del mismo tamaño) con un proceso de "abliteración" o "heretic" que elimina los mecanismos de rechazo del modelo base. Esto lo orienta a usos creativos y conversacionales sin las restricciones típicas de los modelos alineados comercialmente, y lo hace desplegable en hardware de consumo gracias a las cuantizaciones de 10,7 a 27 GB.

La licencia Apache 2.0 permite uso comercial, aunque conviene revisar las implicaciones de un modelo explícitamente descensurado. El repositorio ocupa 182,9 GB e incluye once variantes de cuantizacion GGUF, desde Q2_K hasta Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Gemma (etiqueta `gemma4`); detalles internos no disponibles |
| Parametros totales | 25.233.142.046 (≈25,2 B) |
| Parametros activos | Aproximadamente 4 B según la designación "A4B"; cifra exacta no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existen también cuantizaciones imatrix en el repo `i1-GGUF` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un modelo MoE con aproximadamente 25,2 mil millones de parámetros totales y una designación que apunta a unos 4 mil millones activos por token, lo que lo sitúa en la estela de arquitecturas tipo Gemma 3/4 MoE. La etiqueta `gemma4` sugiere que el modelo base pertenece a esa familia, pero no se dispone de detalles sobre el número de expertos, el mecanismo de enrutamiento ni la dimensión de las capas.

El modelo base SubMaroon/Kitchoon-V4-26B-A4B ha sido sometido a un proceso de "abliteración" (etiqueta `heretic`), una técnica que elimina direcciones de activación asociadas al rechazo de peticiones, dando lugar a un modelo `uncensored`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF o DPO. Tampoco hay datos sobre innovaciones arquitectónicas adicionales más allá de la propia naturaleza MoE.

## Capacidades

- Generación de texto conversacional orientada a roleplay y narrativa interactiva, con etiquetas explícitas `roleplay` y `sillytavern`.
- Conversación multi-turno sin mecanismos de rechazo (`uncensored`, `heretic`), lo que permite temáticas adultas o controvertidas.
- Compatibilidad con frontends de rol como SillyTavern, gracias al formato GGUF y a las plantillas de chat del modelo base.
- Inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, entre otros).
- Capacidades multilingües limitadas: solo se declara inglés.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Roleplay conversacional en local: el modelo está afinado específicamente para interpretar personajes y mantener conversaciones multi-turno coherentes, y su formato GGUF permite ejecutarlo en SillyTavern con presets de rol.
- Escritura creativa sin restricciones: útil para narrativa adulta, terror explícito o ficción con temáticas que los modelos alineados rechazan, gracias al proceso de abliteración.
- Generación de diálogos para videojuegos y visual novels: la naturaleza MoE con ~4 B activos reduce el coste por token frente a un denso de 25 B, lo que facilita generar grandes volúmenes de diálogo en estaciones de trabajo modestas.
- Prototipado de chatbots de personaje: al ser Apache 2.0, se puede integrar en productos comerciales de entretenimiento conversacional sin las restricciones de licencias tipo Llama.
- Investigación sobre alineación y censura: sirve como caso de estudio de modelos abliterados para comparar comportamientos de rechazo frente al modelo base original.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,2 GB) caben en GPUs de 24 GB como la RTX 4090, permitiendo roleplay local con buena calidad.
- Fine-tuning posterior sobre GGUF o sobre el modelo base en safetensors para dominios conversacionales específicos (por ejemplo, atención al cliente con tono de personaje), aunque el ajuste sobre cuantizaciones GGUF es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 10,7 GB (Q2_K) y 27 GB (Q8_0); para calidad recomendada, Q4_K_M requiere unos 17 GB y Q5_K_M unos 19,2 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100/H100 para Q8_0 o contextos muy largos; GPUs de 12-16 GB pueden usar Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090, 3090, 4080 (16 GB, con Q4_K_S) y en GPUs de 12 GB con cuantizaciones Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: no disponibles; al ser MoE con ~4 B activos, se espera un throughput notablemente superior al de un denso de 25 B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-V4-26B-A4B (esta ficha) | ~25,2 B totales / ~4 B activos | No disponible | Apache 2.0 | Roleplay sin censura, MoE | GGUF en HF |
| Gemma 3 27B (referencia de familia) | 27 B densos | No disponible en esta ficha | Gemma license | Propósito general | Pesos oficiales |
| Modelos de rol comunitarios tipo 20-30 B (por ejemplo, derivados de Mistral o Llama) | 20-30 B densos | Variable | Variable (a menudo Apache 2.0 o Llama) | Roleplay, a menudo sin censura | GGUF en HF |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa fiable con alternativas. La comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Modelo explícitamente descensurado: puede generar contenido adulto, violento u ofensivo; no es apto para aplicaciones orientadas a público general sin filtros adicionales.
- Riesgo elevado de alucinación, especialmente en tareas factuales: el ajuste está orientado a rol, no a precisión.
- Solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; conviene validarla empíricamente antes de usarla en producción.
- El proceso de abliteración puede degradar capacidades generales (razonamiento, matemáticas, código) respecto al modelo base original.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo descensurado conlleva riesgos reputacionales y legales según la jurisdicción y el tipo de producto.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No se documentan garantías de seguridad ni evaluaciones de sesgo del autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kitchoon-V4-26B-A4B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V4-26B-A4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Kitchoon-V4-26B-A4B-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#Kitchoon-V4-26B-A4B-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

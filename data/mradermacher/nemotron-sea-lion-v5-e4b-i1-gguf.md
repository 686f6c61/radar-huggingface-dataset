# mradermacher/Nemotron-SEA-LION-v5-E4B-i1-GGUF

## Resumen

Nemotron-SEA-LION-v5-E4B-i1-GGUF es la versión cuantizada en formato GGUF del modelo aisingapore/Nemotron-SEA-LION-v5-E4B, un modelo multimodal (texto e imagen) desarrollado por AI Singapore y orientado al sudeste asiático. Esta variante la publica mradermacher, un conocido generador de cuantizaciones del ecosistema llama.cpp, e incluye cuantizaciones con matriz de importancia (imatrix) que mejoran la calidad frente a las estáticas a igual tamaño. El modelo base cuenta con 7.518.069.290 parámetros totales según los pesos en safetensors, y su designación "E4B" sugiere una arquitectura con expertos (probablemente MoE, dado el patrón de nombres Nemotron), aunque la información disponible no detalla el número de parámetros activos.

El modelo está entrenado sobre el dataset aisingapore/SEA-Instruct-2602 y declara soporte para nueve idiomas: inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita. Esta cobertura lingüística lo convierte en una opción relevante para aplicaciones en el sudeste asiático, una región con más de 600 millones de habitantes y una gran diversidad lingüística que la mayoría de modelos generalistas cubren de forma deficitaria.

La relevancia de esta ficha concreta radica en el formato GGUF: permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.), con cuantizaciones que van desde 4,5 GB (i1-Q2_K) hasta 6,3 GB (i1-Q6_K). La licencia MIT del modelo base facilita el uso comercial sin las restricciones habituales de otros modelos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Nemotron de AI Singapore; designación E4B sugiere expertos) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix y cuantizaciones estáticas en el repo hermano) |
| Idiomas soportados | en, zh, my, id, fil, ms, ta, th, vi |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. La designación "E4B" y la familia Nemotron de NVIDIA (a la que parece remitir el nombre) apuntan a un transformer con mezcla de expertos (MoE), pero no se confirma en la documentación proporcionada. El modelo tiene 7.518.069.290 parámetros totales según los pesos en safetensors, y es multimodal: la model card de la cuantización indica explícitamente "This is a vision model", con archivos mmproj (proyector multimodal) disponibles en el repositorio estático hermano.

El entrenamiento se realizó sobre el dataset aisingapore/SEA-Instruct-2602, un conjunto de instrucciones orientado al sudeste asiático. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La cuantización de mradermacher emplea matrices de importancia (imatrix) generadas a partir del modelo base, una técnica que pondera la cuantización según la relevancia de cada peso para reducir la degradación de calidad, especialmente en cuantizaciones de 2 a 4 bits.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en nueve idiomas (inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita).
- Capacidades de visión: el modelo base es multimodal y acepta imágenes, con proyector mmproj disponible en el repositorio estático de cuantizaciones.
- Razonamiento y respuesta a preguntas en contexto multilingüe del sudeste asiático.
- Etiquetado como "conversational" y "endpoints_compatible", lo que indica compatibilidad con endpoints de inferencia tipo OpenAI.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Atención al cliente en idiomas del sudeste asiático: el modelo cubre indonesio, malayo, filipino, tailandés, vietnamita, birmano y tamil, lo que permite desplegar un único modelo para mercados donde normalmente se necesitan varios. La cuantización i1-Q4_K_M (5,4 GB) cabe en una GPU de consumo de 8 GB.
- Procesamiento de documentos con imágenes: al ser un modelo de visión, puede extraer información de capturas, formularios escaneados o fotografías junto con texto, útil en digitalización de trámites administrativos en la región.
- Asistente de atención en kioscos o aplicaciones móviles: con cuantizaciones de 4,5 a 5,4 GB puede ejecutarse en portátiles con GPU modesta o incluso en CPU mediante llama.cpp, lo que abarata el despliegue en entornos con infraestructura limitada.
- Traducción y adaptación cultural: el soporte nativo de nueve idiomas y el entrenamiento sobre SEA-Instruct-2602 lo hacen adecuado para traducción entre inglés y lenguas del sudeste asiático, aunque la calidad relativa por idioma no está documentada.
- Prototipado e investigación académica: la licencia MIT y el formato GGUF permiten experimentar sin restricciones comerciales y sin infraestructura de datacenter, algo relevante para universidades de la región.
- Generación de contenido localizado: redacción de textos de marketing, respuestas de soporte o material educativo en malayo, indonesio o tailandés con un modelo que ha visto instrucciones nativas de esos idiomas.
- Integración en pipelines de CI/CD o herramientas de desarrollo: no confirmado por falta de datos sobre tool calling; se recomienda validar antes de usarlo en automatización de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB (i1-Q2_K), 5,3-5,4 GB (i1-Q4_K_S / i1-Q4_K_M), 5,9 GB (i1-Q5_K_M) y 6,3 GB (i1-Q6_K), a los que hay que sumar el espacio de contexto y, en su caso, el proyector mmproj para visión.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar las cuantizaciones de 4 bits con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070). Para contexto largo o Q6_K se recomiendan 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080). En datacenter, A100 o H100 no son necesarias para esta cuantización, pero permitirían mayor throughput y contexto.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando cuantizaciones de 4 bits. Las cuantizaciones de 2-3 bits (4,5-5,1 GB) permiten incluso GPUs de 6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con servidores de inferencia tipo OpenAI a través de llama.cpp server.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas del sudeste asiático | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B (esta ficha, GGUF) | 7.518.069.290 | no disponible | en, zh, my, id, fil, ms, ta, th, vi | MIT | GGUF, safetensors |
| SEA-LION v3 (versión anterior de AI Singapore) | no disponible | no disponible | sí (familia SEA-LION) | no disponible | safetensors, GGUF |
| Modelos generalistas de 7-8B (p. ej. Llama 3.1 8B, Qwen2.5 7B) | ~7-8B | 128K en algunos casos | cobertura parcial, sin entrenamiento específico | licencias variables | GGUF, safetensors |

La comparación cuantitativa con alternativas no es posible con la información disponible: no se han publicado benchmarks de este modelo en la documentación proporcionada, y no se dispone de datos de rendimiento de SEA-LION v3 en esta ficha. La ventaja diferencial de este modelo es la combinación de licencia MIT, multimodalidad y entrenamiento específico en nueve idiomas del sudeste asiático, frente a modelos generalistas que cubren esos idiomas de forma incidental.

## Limitaciones y advertencias

- La información sobre arquitectura, contexto y parámetros activos no está disponible; no se puede confirmar si es MoE ni cuántos expertos activa por token.
- No hay benchmarks publicados en la información disponible, por lo que el rendimiento real frente a alternativas es desconocido.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual.
- La cobertura por idioma es desigual en la práctica habitual de estos modelos: el inglés y el chino suelen estar mejor representados que el birmano o el tamil. No hay datos que confirmen la calidad relativa por idioma.
- Las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-Q3_K_S) degradan la calidad de forma notable; para producción se recomienda i1-Q4_K_M o superior.
- El modelo es multimodal, pero los archivos mmproj no están en este repositorio sino en el estático hermano; hay que descargarlos por separado para usar visión.
- Aunque la licencia es MIT, conviene revisar las condiciones del modelo base y de los datos de entrenamiento (SEA-Instruct-2602) antes de un despliegue comercial a gran escala.
- El repositorio ocupa 77,4 GB por incluir todas las cuantizaciones; la descarga selectiva de un solo archivo es imprescindible en entornos con ancho de banda limitado.
- No se confirma soporte de tool calling ni de agentes; validar antes de integrarlo en pipelines automatizados.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/Nemotron-SEA-LION-v5-E4B-i1-GGUF
- Modelo base: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Cuantizaciones estáticas (incluye mmproj para visión): https://huggingface.co/mradermacher/Nemotron-SEA-LION-v5-E4B-GGUF
- Página de resumen del autor para este modelo: https://hf.tst.eu/model#Nemotron-SEA-LION-v5-E4B-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

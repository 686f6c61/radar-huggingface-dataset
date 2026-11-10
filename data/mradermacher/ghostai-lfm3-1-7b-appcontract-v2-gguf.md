# mradermacher/ghostai-lfm3-1.7b-appcontract-v2-GGUF

## Resumen

GhostAI LFM3 1.7B AppContract v2 es un modelo de lenguaje de aproximadamente 1.990 millones de parámetros (1.7B en nomenclatura comercial) afinado mediante SFT con TRL sobre una base de la familia LFM3. Lo desarrolla el usuario immortaltatsu y lo ha cuantizado a GGUF mradermacher, un conocido publicador de cuantizaciones estáticas para llama.cpp. El modelo está orientado explícitamente a *tool calling* y a despliegue *on-device*, es decir, ejecución local en dispositivos con recursos limitados.

La relevancia de esta ficha radica en que se trata de un modelo muy pequeño y especializado: no compite en conocimiento general, sino en la generación fiable de llamadas a funciones y contratos de aplicación dentro de un agente. Su tamaño permite cuantizaciones de entre 0,9 GB (Q2_K) y 2,2 GB (Q8_0), lo que lo hace viable en portátiles, mini-PC y dispositivos de borde.

La información pública disponible es escasa: la model card del repositorio cuantizado no incluye detalles sobre el dataset de entrenamiento, la longitud de contexto ni resultados de evaluación. Esta ficha refleja únicamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM3; se desconoce si es transformer denso o híbrido) |
| Parámetros totales | 1.990.945.600 (≈1,99B) |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | inglés (en) |
| Licencia | other (no especificada en detalle; requiere consultar el repositorio base) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |
| Tamaño del repositorio | 18,1 GB (incluye todas las cuantizaciones) |
| Etiquetas | tool-calling, on-device, sft, trl, generated_from_trainer |
| Modelo base | immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2 |

## Arquitectura y entrenamiento

El modelo parte de `immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2`, un ajuste fino de una base LFM3 de 1.7B. El entrenamiento se realizó con TRL mediante *supervised fine-tuning* (SFT), según las etiquetas del repositorio (`trl`, `sft`, `generated_from_trainer`). No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles de la arquitectura interna (número de capas, dimensiones, tipo de atención).

La especialización declarada es el *tool calling* y el "app contract", lo que sugiere un ajuste orientado a que el modelo emita llamadas estructuradas a funciones de aplicación de forma consistente. El repositorio cuantizado no aporta información adicional sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (etiqueta `conversational`).
- *Tool calling* / *function calling*: es la capacidad central del ajuste, orientada a emitir llamadas estructuradas a funciones de aplicación.
- Razonamiento multi-paso dentro de flujos de agente, en la medida en que el *tool calling* lo requiera.
- Despliegue *on-device*: el tamaño reducido y las cuantizaciones GGUF permiten ejecución local.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declaran capacidades de visión, audio, modo *thinking* ni matemáticas avanzadas.

## Casos de uso

- Agentes locales de automatización de escritorio: el modelo puede generar llamadas a funciones que controlen aplicaciones del sistema (abrir ficheros, ejecutar comandos) en un bucle de agente, gracias a su especialización en *tool calling* y a su huella de memoria reducida (1,3 GB en Q4_K_M).
- Asistentes de voz o chat embebidos en dispositivos de borde: al caber en 1-2 GB de RAM/VRAM, puede desplegarse en mini-PC, Raspberry Pi con suficiente memoria o portátiles sin GPU dedicada.
- Enrutamiento de intenciones en pipelines de aplicaciones: el modelo puede clasificar la petición del usuario y emitir la llamada a la API interna correspondiente, actuando como capa de decisión ligera.
- Automatización de formularios y contratos de aplicación: su nombre ("appcontract") sugiere uso para rellenar estructuras de datos y validar parámetros de llamadas a funciones en flujos de negocio.
- Prototipado rápido de agentes en local: permite iterar sobre diseños de *tool calling* sin coste de API ni dependencia de la nube.
- Filtrado y preprocesado en pipelines de CI/CD: puede generar comandos o invocaciones estructuradas a herramientas de build en entornos con restricciones de recursos.
- Educación y experimentación: modelo pequeño para estudiar técnicas de SFT y *tool calling* en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (según cuantización): Q2_K ≈ 0,9 GB; Q4_K_M ≈ 1,3 GB; Q8_0 ≈ 2,2 GB; f16 ≈ 4,1 GB. Añadir overhead de contexto y del runtime de llama.cpp (típicamente 0,5-1 GB adicionales).
- GPU recomendadas: cualquier GPU consumer con ≥4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4/Q5 con holgura; A100/H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU con ≥4 GB, y en CPU con ≥4 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), LM Studio, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no soportan GGUF de forma nativa; para ellos habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| GhostAI LFM3 1.7B AppContract v2 | ≈1,99B | no disponible | tool calling, on-device | other | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (según model card pública) | propósito general, tool calling | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 1B Instruct | 1,2B | 128K (según model card pública) | propósito general, on-device | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | 1,7B | 8K (según model card pública) | propósito general, on-device | Apache 2.0 | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparables provienen de sus model cards públicas y no de la información proporcionada en esta búsqueda; se incluyen como referencia orientativa. No hay benchmarks del modelo GhostAI que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: se desconoce la longitud de contexto; no debe asumirse una ventana larga para conversaciones multi-turno extensas.
- Alucinación: al ser un modelo de 1.7B, la tasa de alucinación en conocimiento factual será alta; su uso debe restringirse a tareas estructuradas de *tool calling*.
- Licencia "other": no se especifican los términos exactos; es imprescindible consultar el repositorio base `immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2` antes de cualquier uso comercial.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en *tool calling* ni en generación; la evaluación corre a cargo del usuario.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación comunitaria.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la fiabilidad del *tool calling*, que exige salidas estructuradas exactas; se recomienda Q5_K_M o superior para producción.
- No hay cuantizaciones ponderadas/imatrix disponibles según el autor, lo que limita la calidad de las cuantizaciones de baja precisión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ghostai-lfm3-1.7b-appcontract-v2-GGUF
- Modelo base: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-v2
- Página de descargas del cuantizador: https://hf.tst.eu/model#ghostai-lfm3-1.7b-appcontract-v2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

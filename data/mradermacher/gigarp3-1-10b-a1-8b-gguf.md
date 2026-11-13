# mradermacher/GigaRP3.1-10B-A1.8B-GGUF

## Resumen

GigaRP3.1-10B-A1.8B-GGUF es una versión cuantizada en formato GGUF del modelo SubMaroon/GigaRP3.1-10B-A1.8B, un modelo de lenguaje orientado a roleplay en ruso y construido sobre la base de GigaChat. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema GGUF, y está pensada para su uso con llama.cpp y frontends compatibles como SillyTavern.

El modelo es de tipo Mixture of Experts (MoE) con 10.672.535.616 parámetros totales (aproximadamente 10,67 mil millones) y, según la nomenclatura del nombre, 1,8 mil millones de parámetros activos por token. Está especializado en conversación y roleplay en ruso, y se distribuye bajo licencia MIT, lo que facilita su uso tanto en investigación como en producción.

La relevancia de esta ficha radica en que se trata de una cuantización práctica de un modelo MoE especializado en un idioma distinto del inglés, con un rango de cuantizaciones que va desde Q2_K (4,1 GB) hasta f16 (21,5 GB), lo que permite desplegarlo en hardware de consumo. No obstante, la información pública disponible sobre el modelo base es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (según tags del modelo) |
| Parametros totales | 10.672.535.616 (≈10,67 B) |
| Parametros activos | 1,8 B (según nomenclatura del nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q4_K_M, f16 (estáticas); variantes i1/imatrix disponibles en repo separado |
| Idiomas soportados | Ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es SubMaroon/GigaRP3.1-10B-A1.8B, descrito en sus tags como un modelo MoE (Mixture of Experts) orientado a roleplay y derivado de GigaChat. La nomenclatura "10B-A1.8B" indica aproximadamente 10 mil millones de parámetros totales con 1,8 mil millones activos por token, lo que sugiere una arquitectura de expertos dispersos con enrutamiento por token. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La contribución de mradermacher se limita a la cuantización estática del modelo base a formato GGUF mediante herramientas del ecosistema llama.cpp. El autor indica que las cuantizaciones ponderadas/imatrix están disponibles en un repositorio separado (GigaRP3.1-10B-A1.8B-i1-GGUF). No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura MoE del modelo base.

## Capacidades

- Generación de texto conversacional orientada a roleplay en ruso.
- Conversación multi-turno con mantenimiento de personaje (uso previsto en SillyTavern).
- Arquitectura MoE con activación dispersa, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Soporte de inferencia local mediante llama.cpp y frontends compatibles.
- Capacidades multilingües limitadas al ruso según la metadata del modelo.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Roleplay conversacional en ruso: el modelo está etiquetado explícitamente para roleplay y SillyTavern, por lo que puede usarse como motor de personajes en sesiones multi-turno con contexto conversacional.
- Despliegue local en hardware de consumo: con cuantizaciones desde 4,1 GB (Q2_K) hasta 6,6 GB (Q4_K_M), puede ejecutarse en GPUs de gama media o incluso en CPU con llama.cpp.
- Prototipado de chatbots en ruso: sirve para validar flujos conversacionales antes de migrar a modelos mayores, gracias a su licencia MIT y a su reducido coste de inferencia por la activación de solo 1,8 B de parámetros.
- Investigación sobre modelos MoE especializados por idioma: permite estudiar el comportamiento de un MoE entrenado sobre GigaChat en tareas de generación en ruso.
- Integración en pipelines de generación de texto con Ollama o llama.cpp: al estar en GGUF, se integra directamente en servidores de inferencia locales sin necesidad de GPUs de datacenter.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece múltiples niveles (Q2_K a f16) para medir el impacto de la cuantización en la calidad de la generación conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización): Q2_K ≈ 4,1 GB; Q3_K_S ≈ 4,8 GB; Q3_K_M ≈ 5,2 GB; Q4_K_S ≈ 6,2 GB; Q4_K_M ≈ 6,6 GB; f16 ≈ 21,5 GB. Añadir overhead de contexto y KV cache.
- GPU recomendadas: para Q4_K_M, una GPU con 8 GB de VRAM (RTX 3060 Ti, RTX 4060) es suficiente; para f16 se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100).
- Cabe en GPU de consumo: sí, en la mayoría de cuantizaciones (Q2_K a Q4_K_M) en GPUs de 6-8 GB; f16 requiere GPU de gama alta o profesional.
- Opciones de despliegue: llama.cpp, Ollama, frontends compatibles con GGUF (SillyTavern, LM Studio, kobold.cpp). No se documenta compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GigaRP3.1-10B-A1.8B-GGUF | 10,67 B totales / 1,8 B activos | no disponible | MIT | GGUF | Especializado en roleplay en ruso |
| Modelo base SubMaroon/GigaRP3.1-10B-A1.8B | 10,67 B totales / 1,8 B activos | no disponible | MIT | safetensors | Mismo modelo sin cuantizar |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la documentación proporcionada |

## Limitaciones y advertencias

- Información pública muy escasa sobre el modelo base: no se documentan datos de entrenamiento, contexto máximo ni evaluación de sesgos.
- Especialización en ruso: el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad factual.
- Orientado a roleplay: puede no ser adecuado para tareas de razonamiento, código o matemáticas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para uso general.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de GigaChat subyacentes.
- No se documenta soporte de tool calling ni de agentes, por lo que no es apto para pipelines que requieran function calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/GigaRP3.1-10B-A1.8B-GGUF
- Modelo base: https://huggingface.co/SubMaroon/GigaRP3.1-10B-A1.8B
- Cuantizaciones i1/imatrix: https://huggingface.co/mradermacher/GigaRP3.1-10B-A1.8B-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#GigaRP3.1-10B-A1.8B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

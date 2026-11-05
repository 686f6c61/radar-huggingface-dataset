# mradermacher/HaloGuard2-Gen-0.8B-GGUF

## Resumen

HaloGuard2-Gen-0.8B-GGUF es la versión cuantizada en formato GGUF del modelo astroware/HaloGuard2-Gen-0.8B, un modelo de 0,8 mil millones de parámetros (1.006.672.704 parámetros según los pesos en safetensors) especializado en tareas de seguridad y moderación de contenido. Lo publica mradermacher, un autor conocido en el ecosistema por distribuir cuantizaciones estáticas de modelos abiertos, manteniendo en este caso la licencia Apache 2.0 del modelo original. El modelo está etiquetado como guard, safety, moderation, constitutional-classifier y prompt-safety, lo que lo sitúa en la categoría de clasificadores generativos orientados a filtrar y evaluar prompts y contenido.

El interés principal de esta publicación es doble: por un lado, ofrece un modelo de moderación multilingüe con soporte declarado para 48 idiomas (entre ellos español, inglés, chino, japonés, hindi, árabe, francés, alemán y portugués); por otro, al estar disponible en GGUF con cuantizaciones desde Q2_K hasta f16, permite desplegarlo en hardware modesto, incluyendo GPUs de consumo. El repositorio incluye además ficheros mmproj (multi-modal supplement), lo que sugiere capacidades multimodales heredadas del modelo base.

La relevancia actual radica en la creciente necesidad de capas de seguridad ligeras y desplegables localmente en pipelines de moderación, donde un modelo de menos de mil millones de parámetros puede actuar como primera barrera de filtrado con bajo coste de inferencia. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan arquitectura exacta, composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base astroware/HaloGuard2-Gen-0.8B; los ficheros mmproj sugieren componentes multimodales) |
| Parametros totales | 1.006.672.704 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | 48 idiomas declarados: en, zh, ja, ko, hi, bn, ta, te, mr, gu, kn, ne, ar, fa, ur, es, fr, de, pt, it, ru, tr, he, uk, cs, pl, nl, sv, ro, el, hu, fi, da, no, th, vi, id, tl, ms, my, sw, zu, am, ha, yo, ig, so |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base astroware/HaloGuard2-Gen-0.8B en la documentación proporcionada. La model card del repositorio GGUF es una plantilla estándar de mradermacher centrada en el proceso de cuantización, sin secciones sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. El etiquetado como "constitutional-classifier" sugiere un enfoque de clasificación guiada por principios constitucionales, pero no se aportan detalles técnicos verificables.

Lo que sí es verificable es el proceso de cuantización: se han generado cuantizaciones estáticas (no ponderadas ni imatrix) mediante conversión desde el formato Hugging Face a GGUF, con versiones que van desde Q2_K (0,6 GB) hasta f16 (2,1 GB). La presencia de ficheros mmproj-f16 y mmproj-Q8_0 indica que el modelo base incorpora algún tipo de proyección multimodal, presumiblemente para entrada de imágenes, aunque no se especifica qué modalidades cubre ni cómo se integran en el pipeline de moderación.

## Capacidades

- Clasificación y moderación de contenido: el modelo está diseñado como guard/constitutional-classifier para evaluar la seguridad de prompts y respuestas.
- Filtrado de prompt-safety: evaluación de entradas de usuario para detectar contenido dañino, según las etiquetas del repositorio.
- Multilingüismo amplio: 48 idiomas declarados, con cobertura de familias indoarias, semíticas, austronesias, nilo-saharianas y lenguas europeas.
- Capacidades multimodales: la presencia de ficheros mmproj sugiere soporte de entrada visual, aunque no se detalla su alcance.
- Conversación: etiquetado como "conversational", lo que indica formato de chat multi-turno.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible", orientada a despliegue como servicio.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o agentes: no disponibles en la información proporcionada.

## Casos de uso

- Moderación de prompts en aplicaciones de chat: el modelo puede actuar como clasificador previo a la inferencia de un LLM principal, evaluando la seguridad de la entrada del usuario en cualquiera de los 48 idiomas soportados y bloqueando contenido dañino antes de consumir recursos del modelo grande.
- Filtrado de contenido generado: integrado como capa post-generación, evalúa las respuestas del LLM principal antes de mostrarlas al usuario, con un coste de inferencia muy bajo gracias a sus 0,8B parámetros.
- Moderación multilingüe en plataformas globales: su cobertura de idiomas (incluyendo hindi, árabe, swahili, amárico o zulú) lo hace adecuado para plataformas con usuarios en mercados emergentes donde otros modelos de moderación tienen menor cobertura.
- Despliegue en el edge o on-premise: las cuantizaciones Q4_K_M (0,8 GB) permiten ejecutarlo en CPUs y GPUs de consumo, útil para organizaciones que no pueden enviar datos de usuario a APIs externas por requisitos de privacidad.
- Evaluación de seguridad en pipelines de CI/CD para LLMs: puede integrarse en tests automatizados que verifican que un modelo o aplicación no genera contenido inseguro ante un conjunto de prompts adversarios en múltiples idiomas.
- Primera barrera en sistemas de agentes: en arquitecturas multi-agente, filtra las instrucciones y observaciones intermedias para evitar que contenido dañino se propague entre pasos del agente.
- Investigación en seguridad de LLMs: como modelo pequeño y abierto, sirve para experimentar con técnicas de clasificación constitucional y comparar con otros guard models sin grandes requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos de moderación, y no se ha proporcionado información del modelo base que permita extraer datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~0,6-0,7 GB
  - Q4_K_S / Q4_K_M: ~0,7-0,8 GB
  - Q5_K_S / Q5_K_M: ~0,8-0,9 GB
  - Q6_K: ~0,9 GB
  - Q8_0: ~1,2 GB
  - f16: ~2,1 GB
  - mmproj-f16 / mmproj-Q8_0: ~0,2-0,3 GB adicionales si se usa la entrada multimodal
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para las cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque para un modelo de este tamaño las GPUs de consumo son suficientes.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas GPUs de gama baja con 4 GB o más. También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama (a partir del GGUF), servidores compatibles con GGUF; el modelo base es compatible con transformers. No se confirma soporte nativo en vLLM o TGI para esta cuantización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| HaloGuard2-Gen-0.8B-GGUF | 1,0B | no disponible | 48 | Apache 2.0 | GGUF |
| Llama Guard 3-1B | ~1,2B | no disponible en esta ficha | limitado (principalmente inglés y algunos más) | Llama Community License | safetensors, GGUF (por terceros) |
| ShieldGemma-2B | ~2,6B | no disponible en esta ficha | principalmente inglés | Gemma Terms of Use | safetensors, GGUF (por terceros) |

La comparación se ofrece a título orientativo de categoría (guard models de tamaño pequeño); los datos de Llama Guard 3-1B y ShieldGemma-2B no provienen de la información proporcionada en esta ficha y deben verificarse en sus respectivas model cards. La ventaja diferencial de HaloGuard2 es su cobertura declarada de 48 idiomas y su licencia Apache 2.0, más permisiva que las licencias comunitarias de Llama o Gemma. Como desventaja, no hay benchmarks publicados que permitan comparar su calidad de moderación.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas publicadas de precisión, recall ni tasas de falsos positivos/negativos, lo que impide evaluar su fiabilidad real como moderador.
- Riesgo de alucinación: al ser un modelo generativo de 0,8B, puede producir clasificaciones inconsistentes o justificaciones incorrectas; no debe usarse como única capa de seguridad en producción.
- Sesgos: no se documenta el proceso de entrenamiento ni la composición del dataset, por lo que se desconocen los sesgos potenciales por idioma, cultura o dominio.
- Limitaciones de contexto: la longitud de contexto no está especificada; para moderación de documentos largos podría ser insuficiente.
- Cobertura idiomática no verificada: los 48 idiomas están declarados en los metadatos, pero no se aportan evaluaciones por idioma que confirmen un rendimiento uniforme.
- Cuantizaciones bajas: Q2_K y Q3_K_S pueden degradar la calidad de clasificación; para tareas de seguridad se recomienda Q5_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base podría tener condiciones adicionales no reflejadas; conviene verificar la model card de astroware/HaloGuard2-Gen-0.8B.
- Naturaleza del repositorio: es una cuantización de terceros (mradermacher), no el modelo oficial; los problemas de calidad deben reportarse contra el modelo base.
- Uso responsable: un guard model no sustituye la revisión humana en contextos de alto riesgo (contenido legal, médico o de seguridad crítica).

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HaloGuard2-Gen-0.8B-GGUF
- Modelo base: https://huggingface.co/astroware/HaloGuard2-Gen-0.8B
- Página de descargas del autor: https://hf.tst.eu/model#HaloGuard2-Gen-0.8B-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

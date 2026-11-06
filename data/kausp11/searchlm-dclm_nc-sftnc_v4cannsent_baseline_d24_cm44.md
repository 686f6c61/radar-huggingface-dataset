# Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d24_cm44

## Resumen

Searchlm-dclm_nc-sftnc_v4cannsent_baseline_d24_cm44 es un modelo de generación de texto entrenado por el usuario Kausp11 como parte de un experimento de preentrenamiento con búsqueda habilitada (search-enabled pretraining). Se trata de un modelo de tipo nanochat derivado del corpus DCLM-Edu, con aproximadamente 2.619 millones de parámetros (dato real extraído de los pesos safetensors), al que se le ha aplicado una fase de fine-tuning supervisado (SFT) denominada v4c-ann-sent. Su propósito es servir como baseline comparativo (compute-matched) en investigaciones sobre cómo afecta el acceso a herramientas de búsqueda durante el preentrenamiento y el ajuste fino.

El modelo se ha entrenado con un tokenizador SmolLM2 ampliado con tokens especiales de búsqueda (<WEB_QUERY>, </WEB_QUERY>, <WEB_RESPONSE>, </WEB_RESPONSE>), lo que sugiere que puede generar consultas web y procesar respuestas de búsqueda dentro de la conversación. El SFT combina datos de chat y habilidades de SmolTalk, tool calling de SmolTalk2 y conversaciones con bloques de búsqueda procedentes del pipeline de anotación del propio preentrenamiento.

Su relevancia es principalmente investigadora: permite evaluar de forma controlada si el preentrenamiento con búsqueda mejora capacidades de razonamiento con acceso a información externa frente a baselines sin búsqueda, con un presupuesto de cómputo equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (tipo nanochat, basado en SmolLM2); detalle exacto no disponible |
| Parametros totales | 2.619.083.082 (~2,62 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en fp/bf16, 5,2 GB de repo) |
| Idiomas soportados | No disponible (presumiblemente inglés, dado el corpus DCLM-Edu) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo nanochat, preentrenado sobre el corpus DCLM-Edu con un presupuesto de cómputo ajustado (compute-matched, "d24" probablemente indica 24 capas o un identificador de configuración, aunque no está confirmado en la documentación). El pipeline incorpora tokens especiales de búsqueda que permiten al modelo emitir consultas web (<WEB_QUERY>) y recibir respuestas (<WEB_RESPONSE>) durante el entrenamiento, siguiendo la línea de investigación de search-enabled pretraining.

La fase de fine-tuning supervisado (v4c-ann-sent) constó de una única época sobre una mezcla de datos que incluye: SmolTalk (chat y habilidades), SmolTalk2 (tool calling) y conversaciones de SmolTalk con bloques de búsqueda generados por el pipeline de anotación del preentrenamiento, insertados al inicio de las frases. El formato de chat utilizado es `User: ...\n\nAssistant: ...`. No hay información publicada sobre RLHF o DPO posterior.

## Capacidades

- Generacion de texto conversacional en formato chat (User/Assistant)
- Tool calling, gracias al entrenamiento con SmolTalk2
- Generacion de consultas web estructuradas mediante tokens <WEB_QUERY> y procesamiento de respuestas <WEB_RESPONSE>, diseñado para integrarse en pipelines de búsqueda
- Razonamiento y seguimiento de instrucciones heredados del SFT con SmolTalk
- Sin capacidades multimodales conocidas (solo texto)

## Casos de uso

- Investigacion en search-enabled pretraining: como baseline compute-matched para comparar contra modelos entrenados con acceso a búsqueda y medir el impacto real de esta técnica.
- Prototipado de agentes con búsqueda: el modelo puede generar consultas web dentro de un bucle agéntico, usando los tokens especiales como protocolo de comunicación con un motor de búsqueda.
- Sistemas de preguntas y respuestas con recuperación (RAG): combinado con un retriever externo, puede formular consultas y sintetizar respuestas a partir de los documentos recuperados.
- Evaluacion de tool calling en modelos pequeños: su entrenamiento con SmolTalk2 lo hace adecuado para benchmarks y estudios sobre function calling en modelos de ~2,6 B de parámetros.
- Chatbots ligeros para investigación: desplegable en hardware modesto para experimentos de diálogo multi-turno con el formato User/Assistant.
- Estudios de destilacion y anotacion de datos: puede usarse como modelo anotador o generador de datos sintéticos en pipelines de investigación de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2,62 B de parámetros en fp16/bf16 (~5,2 GB de pesos), se estima un mínimo de 6-8 GB de VRAM incluyendo KV cache y activaciones.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o superiores. No se requieren aceleradores de datacenter como A100 o H100 para inferencia.
- Cabe cómodamente en GPUs consumer de gama media e incluso en GPUs de portátil con 8 GB de VRAM si se usa cuantización (por ejemplo, GGUF Q4/Q8, aunque no hay versiones cuantizadas publicadas en el repo).
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito del repo, por usar código personalizado); compatible en principio con vLLM, TGI y llama.cpp si se exporta a GGUF, aunque no hay confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d24_cm44 | ~2,62 B | No disponible | Apache-2.0 | Baseline de investigación con tokens de búsqueda; requiere trust_remote_code |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache-2.0 | Base del tokenizador y datos SFT; sin capacidades de búsqueda nativas |
| Qwen2.5-3B-Instruct | 3 B | 32.768 tokens | Qwen Research (uso comercial limitado) | Modelo generalista más maduro, con benchmarks publicados |

Comparación orientativa: frente a SmolLM2-1.7B-Instruct, este modelo es mayor y añade protocolo de búsqueda, pero carece de documentación y benchmarks públicos. Frente a Qwen2.5-3B-Instruct, ofrece licencia más permisiva pero menor madurez y sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Requiere `trust_remote_code=True` para cargarse, lo que implica ejecutar código personalizado del autor; conviene revisarlo antes de usarlo en producción.
- No hay model card detallada: longitud de contexto, hiperparámetros de entrenamiento y datos de evaluación no están documentados, lo que dificulta su evaluación rigurosa.
- Riesgo de alucinación elevado al tratarse de un modelo pequeño de investigación sin alineación RLHF/DPO documentada.
- El soporte de búsqueda depende de infraestructura externa: el modelo genera tokens de consulta, pero no accede a la web por sí mismo.
- Idiomas soportados no documentados; el corpus DCLM-Edu sugiere predominio del inglés, por lo que el rendimiento en castellano es incierto.
- Adopción muy limitada (252 descargas, 0 likes en el momento de la ficha), sin comunidad de soporte ni validación externa.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero al ser un baseline de investigación, su calidad en producción no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/Kausp11/searchlm-dclm_nc-sftnc_v4cannsent_baseline_d24_cm44
- Paper, repositorio de entrenamiento o demo: no disponibles (el README menciona el checkpoint original en RCP `search-lm/ckpts/dclm_nc/sftnc_v4cannsent_baseline_d24_cm44`, sin enlace público)

# KRAFTON/Raon-1-mini-preview

## Resumen

Raon-1 mini preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado desde cero por KRAFTON AI (Corea del Sur). Cuenta con 28.783.218.402 parámetros totales (aproximadamente 30B, denominación comercial «30B-A4B») de los que solo unos 4B se activan por token, lo que reduce el coste de inferencia manteniendo la capacidad de un modelo de mayor tamaño. La arquitectura combina el enrutamiento MoE con una tecnología propia de atención lineal, según la compañía.

El modelo se publica como versión preview en Hugging Face bajo licencia Apache 2.0, con acceso restringido (gated): es necesario aceptar las condiciones en la página del repositorio antes de descargarlo. KRAFTON lo orienta a conversación en coreano y a tareas agénticas, y afirma que rinde por encima de modelos extranjeros de tamaño similar y se acerca a modelos domésticos de mayor escala en algunas métricas; no se han publicado los números concretos de esos benchmarks en la información disponible.

Su relevancia actual es doble: por un lado, es uno de los primeros LLM de gran escala entrenados íntegramente por una compañía de videojuegos surcoreana y liberado con licencia permisiva; por otro, su relación 30B totales / 4B activos lo sitúa en la franja de modelos MoE eficientes desplegables en infraestructura moderada, con pesos almacenados en formato mxfp8 y compatibles con el ecosistema `transformers` mediante código personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención lineal propia de KRAFTON; `custom_code` en `transformers` |
| Parámetros totales | 28.783.218.402 (~30B, dato real de safetensors) |
| Parámetros activos | ~4B por token (denominación 30B-A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Pesos publicados en mxfp8 (tag `mxfp8`); no se documentan otros formatos cuantizados en la información disponible |
| Idiomas soportados | no disponible (los materiales destacan conversación en coreano; no se detalla la lista completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 32,7 GB) |

## Arquitectura y entrenamiento

Raon-1 mini emplea una arquitectura de mezcla de expertos en la que cada token activa aproximadamente 4 de los ~30 mil millones de parámetros, frente a los 28,78B totales. KRAFTON combina ese esquema MoE con una tecnología propia de atención lineal, que la compañía presenta como clave para reducir el coste computacional de la inferencia. El modelo no es un fine-tuning de una base existente: según los materiales publicados, ha sido diseñado y entrenado desde cero por KRAFTON AI.

No se han facilitado detalles sobre el número de tokens de entrenamiento, la composición del corpus, las fases de alineación (RLHF, DPO u otras) ni innovaciones adicionales como decodificación especulativa. Tampoco se documenta la configuración de expertos (número total, tamaño de cada uno, política de enrutamiento) ni la ventana de contexto nativa. El repositorio incluye código personalizado (`raon1_mini`), por lo que su carga requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis declarado en coreano.
- Tareas agénticas: el modelo se presenta explícitamente orientado a flujos de agente y razonamiento multi-paso.
- Uso como base para *tool calling* / *function calling* en pipelines de agente (capacidad declarada por el autor; no se detalla el formato de plantilla ni el esquema de herramientas soportado).
- Razonamiento y resolución de problemas en formato de diálogo.
- Generación de código y matemáticas: no documentado de forma explícita en la información disponible.
- Capacidades de visión o audio: no disponibles.
- Modo *thinking* o razonamiento extendido: no documentado.
- Multilingüismo: no se detalla la cobertura; los materiales mencionan rendimiento destacado en coreano y comparaciones con modelos domésticos surcoreanos, sin lista de idiomas.

## Casos de uso

- **Atención al cliente automatizada en coreano:** el modelo está entrenado específicamente para conversación en ese idioma y para interacción multi-turno, lo que lo hace adecuado para sustituir o asistir a agentes humanos en *chatbots* de soporte. La ventana de contexto no está documentada, así que la longitud máxima de historial debe validarse antes de producción.
- **Agentes con herramientas en producción:** su orientación explícita a tareas agénticas y la activación de solo ~4B parámetros por token permiten ejecutar bucles de razonamiento y llamadas a APIs con un coste por paso sensiblemente menor que un modelo denso de 30B.
- **Automatización de flujos internos (RAG sobre documentación):** con el modelo servido en vLLM y una capa de recuperación externa, puede responder consultas sobre manuales, tickets o bases de conocimiento. El tamaño de 30B totales aporta capacidad de síntesis; el bajo número de parámetros activos abarata el despliegue en comparación con alternativas densas.
- **Asistente de programación autoalojado:** al ser Apache 2.0 y desplegable en infraestructura propia, encaja en entornos con requisitos de confidencialidad donde no se permite enviar código a APIs externas. Conviene verificar la calidad en el lenguaje objetivo, ya que no se publican resultados de HumanEval ni similares.
- **Generación de diálogo para productos de ocio y videojuegos:** KRAFTON es una compañía de videojuegos; un modelo conversacional con licencia permisiva permite integrar NPCs o asistentes in-game sin las restricciones de uso comercial de licencias tipo Llama o de pesos cerrados.
- **Investigación en arquitecturas MoE y atención lineal:** al ser una versión preview entrenada desde cero y con código personalizado incluido en el repo, sirve como objeto de estudio para comparar enrutamiento MoE y atención lineal frente a transformers densos convencionales.
- **Prototipado rápido en una sola GPU de 48-80 GB:** gracias a los pesos en mxfp8, el modelo cabe en una GPU profesional de gama alta, lo que permite iterar sobre prompts y *fine-tuning* ligero sin clúster multi-nodo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las fuentes de prensa recogen únicamente afirmaciones cualitativas de KRAFTON («rendimiento superior a modelos extranjeros de tamaño similar» y «cercano a modelos domésticos grandes en algunas métricas»), sin tablas de MMLU, HumanEval, GSM8K ni evaluaciones agénticas con cifras verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos):** ~57,6 GB en BF16/FP16; ~28,8 GB en FP8/MXFP8 (formato de publicación), con overhead de KV cache y activaciones que eleva el consumo real a ~32-36 GB según longitud de contexto y lote.
- **Cuantización a 4 bits:** ~15-16 GB de pesos, siempre que exista una ruta de cuantización compatible con la arquitectura (no confirmada en la información disponible, dado el uso de atención lineal y `custom_code`).
- **GPU recomendadas:** H100 80 GB o A100 80 GB para FP8 con margen de contexto y concurrencia; L40S 48 GB o A6000 48 GB para FP8 con lotes pequeños; A100 40 GB queda muy ajustada en FP8 y requiere cuantización adicional.
- **¿Cabe en GPU de consumo?** Una RTX 4090 de 24 GB no admite los pesos en FP8; solo sería viable con cuantización de 4 bits y, previsiblemente, con *offload* parcial a CPU, lo que degrada la latencia. No hay evidencia de soporte en llama.cpp/Ollama.
- **Opciones de despliegue:** `transformers` con `trust_remote_code=True`; vLLM y TGI son opciones razonables para servir el modelo, pero su compatibilidad con la atención lineal propia no está confirmada en la información disponible. llama.cpp, Ollama y LM Studio requerirían una conversión a GGUF que no se documenta.
- **Latencia y throughput:** no disponibles. Como referencia estructural, al activar ~4B parámetros por token el coste computacional por token se aproxima al de un modelo denso de 4-7B, aunque el requisito de memoria sigue siendo el de un modelo de ~30B.

## Comparativa con modelos similares

No se dispone de datos verificables de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa se marca como no disponible. Los candidatos naturales de la misma franja (MoE de ~30B totales con ~4B activos y licencia permisiva) son Qwen3-30B-A3B y gpt-oss-20b, pero sus cifras de contexto, benchmarks y licencia deben contrastarse en sus fichas oficiales antes de publicar una comparación.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Datos de benchmark |
|---|---|---|---|---|---|
| Raon-1 mini preview | 28,78B | ~4B | no disponible | Apache 2.0 | no publicados en la información disponible |
| Qwen3-30B-A3B | no disponible | no disponible | no disponible | no disponible | no disponible |
| gpt-oss-20b | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Versión preview:** el propio nombre indica que no es una versión final; cabe esperar cambios de comportamiento, correcciones y posible sustitución del checkpoint. No debería ser la única dependencia en un sistema crítico sin pruebas de regresión.
- **Acceso restringido:** el repositorio es *gated*; es necesario aceptar condiciones en Hugging Face. La licencia Apache 2.0 permite uso comercial, pero el proceso de acceso añade una dependencia operativa para CI/CD y despliegues automatizados.
- **Código personalizado:** requiere `trust_remote_code=True` para cargarse en `transformers`. Esto implica ejecutar código del autor del modelo en la máquina de inferencia; conviene auditar `modeling_*.py` antes de desplegar en producción.
- **Contexto desconocido:** al no documentarse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en RAG con muchos documentos. Es un parámetro crítico que debe medirse empíricamente.
- **Idiomas no documentados:** el foco declarado es el coreano; el rendimiento en castellano no está avalado por ninguna evaluación publicada. Un uso en español requiere evaluación propia previa.
- **Ausencia de benchmarks:** sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones agénticas, las afirmaciones de rendimiento de la nota de prensa no son verificables de forma independiente.
- **Riesgo de alucinación y sesgos:** no se documentan las fases de alineación, la composición del corpus ni las evaluaciones de sesgo o toxicidad; deben asumirse los riesgos habituales de un LLM conversacional sin garantías declaradas.
- **Ecosistema de cuantización limitado:** el uso de atención lineal y código propio puede dificultar la conversión a GGUF/AWQ/GPTQ y, por tanto, el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Seoul Economic Daily — Krafton releases Raon-1 mini: https://en.sedaily.com/technology/2026/10/21/krafton-releases-raon-1-mini-its-in-house-ai-language-model
- Asia Business Daily — Krafton releases preview of Raon-1 mini: https://www.asiae.co.kr/en/article/IT/2026102115574147611
- BigGo Finance — Krafton unveils preview of 30B Raon-1 mini: https://finance.biggo.com/news/760bb58d-5dcc-490a-9fa4-2c03ecbbef67
- Edaily — KRAFTON unveils Raon-1 mini, a 30B-scale in-house language model: https://en.edaily.co.kr/news/eda202610215570/

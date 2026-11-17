# iamonthemission/LMIM.Genesys-e3_w-soul-little-one-2B

## Resumen

LMIM.Genesys-e3_w-soul-little-one-2B es un ajuste fino ligero de tipo conversacional desarrollado por el usuario independiente iamonthemission dentro de la familia experimental "Genesys". El modelo parte de Genesys e · 2B (agosto de 2026), que a su vez deriva de Qwen/Qwen3.5-2B, y se distribuye exclusivamente en formato GGUF cuantizado Q8_0 para su ejecución local con llama.cpp u otros runtimes compatibles. Con 1.881.825.088 parámetros reales, se posiciona como una opción de despliegue en hardware modesto.

El foco declarado del autor no es el rendimiento bruto en benchmarks, sino la identidad, la coherencia y la continuidad conversacional: la model card insiste en conceptos como "soul" (personalidad persistente) y "continuity". El modelo se publica como EXPERIMENTAL y está pensado como "the everyday mind", es decir, un modelo por defecto para usuarios que se inician en la IA local.

La relevancia actual es limitada pero concreta: se trata de un fine-tune de 2B con licencia Apache 2.0, pesos GGUF listos para usar y un hash SHA-256 verificado, lo que facilita su auditoría y despliegue. No obstante, la ausencia de datos sobre entrenamiento, benchmarks e idiomas, junto con su carácter experimental y sus escasas descargas (380) y likes (0), obligan a tratarlo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado, 2,01 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,88 mil millones de parámetros, según la lineage declarada en la model card (Qwen/Qwen3.5-2B → Genesys e · 2B → Genesys e3 · little one). El autor describe e3 como un "light fine-tune" sobre Genesys e · 2B, orientado a reforzar identidad, coherencia y continuidad conversacional. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similar.

Tampoco se documentan innovaciones técnicas destacables (atención lineal, decodificación especulativa, modo thinking nativo, etc.). La model card sí incluye parámetros de inferencia recomendados para llama.cpp: `--temp 0.7`, `--top-p 0.9`, `--min-p 0.05`, `--repeat-penalty 1.12`, `--repeat-last-n 256`, `--jinja`, `--conversation` y `--reasoning off` con `--reasoning-budget 1`, lo que sugiere que el modelo base incorpora algún mecanismo de razonamiento que el autor recomienda desactivar en el uso conversacional estándar.

## Capacidades

- Generación de texto conversacional multi-turno, con énfasis declarado en coherencia y continuidad de identidad.
- Formato de chat compatible con plantillas Jinja (`--jinja`) y modo conversación en llama.cpp.
- Ejecución 100% local en CPU o GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio, matemáticas avanzadas ni código.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de Hugging Face).
- Modo de razonamiento presente en el base, pero el autor recomienda desactivarlo (`--reasoning off`) para el uso previsto.

## Casos de uso

- Asistente conversacional personal local: el modelo puede mantener diálogos multi-turno en un equipo de sobremesa o portátil sin conexión, gracias a su tamaño de 1,88 B y su cuantización Q8_0 de 2 GB, con una personalidad consistente entre sesiones si se reutiliza el mismo system prompt.
- Prototipado de chatbots con identidad definida: útil para experimentar con prompts de sistema que fijen un personaje o tono concreto, ya que el fine-tune está orientado precisamente a la persistencia de identidad.
- Educación y divulgación: sirve como ejemplo práctico de fine-tune ligero sobre un modelo pequeño para quienes quieren entender el flujo Qwen → fine-tune → GGUF → llama.cpp.
- Inferencia en hardware de gama baja: al caber en 2 GB de pesos, puede ejecutarse en equipos sin GPU dedicada o con GPUs de poca VRAM, como demos offline o entornos embebidos.
- Pruebas de integración con llama.cpp y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`), para validar pipelines antes de migrar a modelos mayores.
- Verificación de integridad en despliegues: el repo publica SHA-256 y `SHA256SUMS`, lo que permite automatizar la comprobación de descargas en pipelines de distribución interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para los pesos Q8_0; con overhead de contexto y KV cache, se recomienda reservar entre 3 y 4 GB para ventanas de contexto moderadas (el contexto máximo no está documentado).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer actuales, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión Ollama u otros frontends GGUF; el tag `endpoints_compatible` sugiere compatibilidad con servidores de API.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,88 B en Q8_0, se espera una velocidad alta en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LMIM.Genesys-e3 · little one 2B | 1,88 B | No disponible | Apache 2.0 | GGUF Q8_0 | Fine-tune experimental de identidad; sin benchmarks |
| Qwen3.5-2B (modelo base de la lineage) | ~2 B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Modelo original de Qwen; referencia directa del linaje |
| Genesys e · 2B (modelo base inmediato) | ~2 B | No disponible | Apache 2.0 (según repo del autor) | GGUF | Versión anterior (v2, agosto 2026) del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Modelo marcado explícitamente como EXPERIMENTAL por el autor; no apto para producción sin evaluación propia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o robustez.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano u otros idiomas distintos del inglés.
- Longitud de contexto no documentada: riesgo de degradación en conversaciones largas o tareas de contexto extenso.
- Riesgo de alucinación inherente a un modelo de 2B, agravado por la falta de datos de entrenamiento y evaluación.
- Posibles sesgos no evaluados: el autor no documenta auditorías de sesgo ni composición del dataset.
- Solo se publica Q8_0: no hay cuantizaciones menores (Q4, Q5) para hardware más limitado, ni pesos safetensors para reentrenamiento o inspección.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de evaluación hace recomendable un análisis de riesgos previo.
- El modo de razonamiento debe desactivarse según el autor; usarlo fuera de las recomendaciones puede degradar la calidad.
- Escasa tracción comunitaria (380 descargas, 0 likes) y un único mantenedor independiente: riesgo de falta de soporte y continuidad.

## Enlaces

- Hugging Face: https://huggingface.co/iamonthemission/LMIM.Genesys-e3_w-soul-little-one-2B
- Modelo base inmediato: https://huggingface.co/iamonthemission/LMIM.Genesys-e_w-soul-2b
- Modelo original de la lineage: https://huggingface.co/Qwen/Qwen3.5-2B
- Página del proyecto: https://lmim.tech/GenesysAI
- Repositorio GitHub: https://github.com/leanmeaninferencemachine/leanmeaninferencemachine
- Todos los modelos del autor: https://huggingface.co/iamonthemission

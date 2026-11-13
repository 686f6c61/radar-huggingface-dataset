# FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit-GGUF

## Resumen

Qwen3-1.7B-sft-tulu-16bit-GGUF es la conversión a formato GGUF del modelo FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit, un ajuste fino supervisado (SFT) sobre la base Qwen3-1.7B de Alibaba. El autor, FrancescoArno94, publica únicamente la versión cuantizada en F16, generada con Unsloth, e indica que los detalles del entrenamiento deben consultarse en la model card del modelo original en safetensors. Se trata, por tanto, de un artefacto de despliegue más que de un modelo nuevo con documentación propia.

El modelo resuelve el problema de ejecutar un Qwen3 de 1.700 millones de parámetros afinado con datos tipo Tulu en entornos de inferencia local mediante llama.cpp u Ollama, sin necesidad de infraestructura con GPUs de datacenter. Con 1.720.574.976 parámetros y un repositorio de 3,4 GB, está pensado para prototipado rápido, experimentación con instrucciones y despliegue en hardware de consumo.

La relevancia es limitada pero concreta: permite evaluar el efecto del ajuste SFT con datos Tulu sobre Qwen3-1.7B en un formato listo para llama-cli y Ollama, con soporte de plantillas Jinja (`--jinja`). No hay información publicada sobre licencia, idiomas, benchmarks ni composición del dataset de ajuste en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B); detalles no disponibles en la informacion proporcionada |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (unico archivo publicado: `Qwen3-1.7B-sft-tulu-16bit.F16.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16); se incluye Modelfile para Ollama |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El modelo publicado es el resultado de un ajuste fino supervisado (SFT) sobre esa base, presumiblemente con datos del dataset Tulu (el nombre del repositorio lo sugiere), seguido de conversión a GGUF mediante Unsloth. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT.

No se dispone de información sobre innovaciones técnicas específicas de este ajuste (decodificación especulativa, atención lineal, modos de razonamiento explícitos, etc.). Cualquier detalle adicional debe consultarse en la model card del modelo original en safetensors, a la que remite el autor.

## Capacidades

- Generación de texto conversacional en formato instrucción, derivada del ajuste SFT.
- Soporte de plantillas de chat Jinja mediante el flag `--jinja` en llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Ejecución local mediante llama.cpp (`llama-cli`) y Ollama (Modelfile incluido).
- Capacidades de razonamiento, código y matemáticas: no documentadas específicamente para este ajuste; heredadas potencialmente de Qwen3-1.7B, sin confirmación en la información disponible.
- Tool calling / function calling: no disponible en la documentación.
- Capacidades multimodales: la model card menciona `llama-mtmd-cli` como ejemplo genérico, pero no se confirma que este modelo sea multimodal.
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales locales: el modelo puede cargarse con `llama-cli -hf FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit-GGUF --jinja` para probar respuestas instruccionales en un portátil o estación de trabajo sin GPU de datacenter, gracias a su tamaño de 1,7B parámetros en F16.
- Despliegue con Ollama en entornos de desarrollo: el Modelfile incluido permite levantar el modelo como servicio local para integrarlo en aplicaciones de prueba, scripts o agentes sencillos sin depender de APIs externas.
- Evaluación comparativa del efecto del SFT con datos Tulu: investigadores pueden contrastar este ajuste frente a Qwen3-1.7B base en tareas de instrucción para medir la ganancia del fine-tuning, usando el mismo formato GGUF.
- Generación de texto en pipelines de CI/CD de bajo coste: al ser un GGUF F16 de 3,4 GB, puede incorporarse a tests automatizados que requieran un LLM pequeño para generar fixtures, resúmenes o respuestas de ejemplo.
- Educación y experimentación con llama.cpp: sirve como ejemplo práctico de conversión Unsloth a GGUF y de uso de plantillas Jinja, útil en talleres o cursos sobre despliegue local de LLMs.
- Base para cuantizaciones posteriores: al estar en F16, puede servir como punto de partida para generar versiones Q4_K_M, Q5_K_M u otras con llama.cpp `quantize`, reduciendo requisitos de VRAM para despliegue en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 3,4 GB solo para pesos, más overhead de contexto KV; en la práctica, entre 4 y 5 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para F16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más de VRAM en F16; con cuantizaciones posteriores (Q4_K_M, Q5_K_M) cabría en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que no se recomiendan sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-sft-tulu-16bit-GGUF (este) | 1,72B | no disponible | no disponible | GGUF F16 | Ajuste SFT con datos Tulu, conversion Unsloth |
| Qwen3-1.7B (base oficial) | 1,72B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | safetensors, GGUF oficial | Modelo base sin ajuste Tulu |
| Llama 3.2 1B Instruct | 1,24B | 128K (segun model card oficial) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamano similar con licencia restrictiva |
| Gemma 3 1B IT | 1B | 32K (segun model card oficial) | Gemma Terms of Use | safetensors, GGUF | Alternativa ligera de Google |

Nota: los datos de los modelos comparativos provienen de sus respectivas model cards oficiales; los de este modelo, de la información disponible en Hugging Face, que es incompleta.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; debe verificarse en el modelo original antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe más allá de lo que herede de Qwen3-1.7B.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento del ajuste SFT frente a la base.
- Documentación mínima: la model card remite al modelo original y no detalla dataset, hiperparámetros ni evaluación.
- Riesgo de alucinación: inherente a modelos de 1,7B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos: no documentados; el ajuste con datos Tulu puede introducir sesgos propios del dataset, sin análisis publicado.
- Contexto no confirmado: no se conoce la longitud de contexto efectiva soportada por esta conversión GGUF.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; usar con cautela en entornos productivos.
- El ejemplo `llama-mtmd-cli` de la model card es genérico y no implica que este modelo sea multimodal.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit-GGUF
- Modelo original en safetensors: https://huggingface.co/FrancescoArno94/Qwen3-1.7B-sft-tulu-16bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

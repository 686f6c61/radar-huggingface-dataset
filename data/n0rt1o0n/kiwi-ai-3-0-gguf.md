# n0rt1o0n/kiwi-ai-3.0-gguf

## Resumen

kiwi-ai-3.0-gguf es un modelo conversacional derivado de Qwen2.5-1.5B-Instruct, afinado y convertido a formato GGUF por el usuario n0rt1o0n mediante Unsloth. El repositorio contiene un único archivo cuantizado en Q4_K_M y un Modelfile de Ollama, lo que lo orienta directamente a inferencia local con llama.cpp y despliegues ligeros. No se documenta el proceso de fine-tuning, el dataset empleado ni los objetivos concretos del ajuste.

Con 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) y un tamaño de repositorio de 1,0 GB, se sitúa en la gama de modelos pequeños aptos para hardware de consumo. La base Qwen2.5-1.5B-Instruct aporta una arquitectura transformer densa con atención por ventana deslizante en parte de sus capas, aunque la model card no detalla ni confirma estos extremos para esta variante.

La relevancia práctica del modelo es limitada por su escasa trazabilidad: no se publican benchmarks, licencia, idiomas soportados ni detalles del entrenamiento, y el contador de descargas y likes es cero en el momento de la ficha. Resulta útil como experimento reproducible de fine-tuning con Unsloth y como base para pruebas de despliegue GGUF, no como modelo de producción sin evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-1.5B-Instruct; no se detalla en la model card) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `Qwen2.5-1.5B-Instruct.Q4_K_M.gguf`) + Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer denso de la familia Qwen2.5, y ha sido afinado y convertido a GGUF con Unsloth, herramienta que acelera el fine-tuning y la exportación de pesos cuantizados. La model card únicamente indica que se entrenó "2x faster with Unsloth" y no aporta información sobre el dataset, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO sobre el modelo base.

No se documenta ninguna innovación técnica propia del autor más allá del pipeline de Unsloth. Tampoco se especifica si el ajuste fue supervisado (SFT), con preferencias o de otra naturaleza, ni qué hiperparámetros se emplearon. El resultado es un artefacto de inferencia en GGUF con cuantización Q4_K_M, pensado para ejecutarse con llama.cpp y compatible con Ollama mediante el Modelfile incluido.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones, condicionado por el fine-tuning no documentado.
- Soporte de plantilla de chat mediante `--jinja` en llama.cpp (indicado en la model card).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Despliegue con llama.cpp (`llama-cli`) y con Ollama mediante el Modelfile incluido.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling, function calling, agentes y modos de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Prototipado local de asistentes conversacionales: el archivo Q4_K_M de ~1 GB permite arrancar un chatbot en un portátil con llama.cpp u Ollama sin infraestructura GPU dedicada, útil para validar prompts y flujos antes de escalar a modelos mayores.
- Pruebas de fine-tuning con Unsloth: sirve como ejemplo reproducible de ajuste y exportación a GGUF para equipos que quieran montar su propio pipeline de adaptación de modelos pequeños.
- Evaluación de despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, permite medir latencia y consumo en escenarios de edge o contenedores pequeños.
- Generación de texto auxiliar en herramientas internas: resúmenes cortos, reformulación de mensajes o clasificación simple de texto donde no se requiera alta precisión.
- Base para experimentos de cuantización: al publicarse solo Q4_K_M, se puede usar como referencia para comparar con otras cuantizaciones generadas a partir del modelo base.
- Integración en demos con Ollama: el Modelfile incluido facilita levantar un servicio local para pruebas de integración con aplicaciones cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para el archivo Q4_K_M, más overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060 o superiores son suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (`llama-cli -hf n0rt1o0n/kiwi-ai-3.0-gguf --jinja`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kiwi-ai-3.0-gguf | 1,54 B | no disponible | no disponible | GGUF Q4_K_M | Fine-tuning no documentado sobre Qwen2.5-1.5B-Instruct |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (modelo base, según documentación de Qwen) | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens (según Meta) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia comunitaria |
| Gemma 2 2B | 2,6 B | 8.192 tokens (según Google) | Gemma Terms of Use | safetensors, GGUF | Algo mayor, con benchmarks publicados |

Los datos de contexto y licencia de las alternativas corresponden a sus modelos base oficiales; la variante kiwi no publica esa información.

## Limitaciones y advertencias

- No se especifica la licencia: no hay autorización explícita para uso comercial ni para redistribución; conviene contactar con el autor antes de emplearlo en producción.
- Ausencia total de benchmarks: no hay evidencia publicada de mejora o degradación respecto al modelo base Qwen2.5-1.5B-Instruct.
- Fine-tuning no documentado: se desconoce el dataset, el objetivo y los posibles sesgos introducidos durante el ajuste.
- Riesgo de alucinación inherente a un modelo de 1,5 B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable fuera del inglés sin evaluación previa.
- Solo se publica una cuantización (Q4_K_M): no hay variantes de mayor precisión para comparar pérdida de calidad.
- Contexto máximo no confirmado: aunque el modelo base Qwen2.5 admite ventanas amplias, la variante ajustada no lo declara.
- Repositorio sin descargas ni likes y creado recientemente: no existe validación comunitaria de su funcionamiento.
- El nombre del archivo hace referencia a `Qwen2.5-1.5B-Instruct`, lo que sugiere herencia directa del base, pero no se aporta la receta de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/n0rt1o0n/kiwi-ai-3.0-gguf
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Modelo base de referencia (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

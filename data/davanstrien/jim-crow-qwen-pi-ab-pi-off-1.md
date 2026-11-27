# davanstrien/jim-crow-qwen-pi-ab-pi-off-1

## Resumen

davanstrien/jim-crow-qwen-pi-ab-pi-off-1 es un modelo de generacion de texto alojado en Hugging Face por el usuario davanstrien. Por su identificador y sus etiquetas, se trata de un ajuste fino (fine-tuning) sobre la familia Qwen2, con arquitectura transformer decoder-only y aproximadamente 1.540 millones de parametros. El nombre del repositorio sugiere un experimento de alineacion o de comportamiento condicionado (las siglas "pi-ab" y "pi-off" apuntan a variantes con y sin una instruccion o "prompt" de sistema concreta), aunque el autor no documenta esta hipotesis en la model card.

El modelo resuelve, en principio, el mismo problema que cualquier modelo causal de ~1,5B parametros: generacion de texto autoregresiva. Su interes practico no esta en el rendimiento bruto, sino en el caracter experimental del checkpoint: la model card esta practicamente vacia (generada automaticamente por la plataforma) y no aporta informacion sobre datos de entrenamiento, licencia ni evaluacion. Esto lo convierte en un artefacto de investigacion mas que en un modelo listo para produccion.

Es relevante ahora porque los modelos de ~1,5B parametros son atractivos para despliegue en hardware de consumo y para estudiar efectos de alineacion a bajo coste. Sin embargo, la ausencia de documentacion obliga a tratar cualquier uso en produccion con extrema cautela y a verificar el comportamiento empiricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | transformers, safetensors, qwen2, text-generation, hf_jobs, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo causal, coherente con la familia Qwen2 (tag `qwen2` en el repositorio). Con 1.543.714.304 parametros y pesos en safetensors de 3,1 GB, el checkpoint encaja con un modelo de precision de 16 bits (bf16/fp16), lo que da aproximadamente 2 bytes por parametro mas overhead. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni mecanismos de atencion especificos (GQA, sliding window, etc.).

En cuanto al entrenamiento, la model card no documenta datos, numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El nombre del repositorio ("pi-ab" / "pi-off") sugiere un experimento controlado de condicionamiento, probablemente un A/B de una instruccion de sistema, pero esto es una inferencia del identificador y no un dato confirmado por el autor. No hay informacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en ingles y, presumiblemente, otros idiomas (no confirmado).
- Razonamiento basico y respuesta a instrucciones, condicionado al ajuste fino aplicado (no documentado).
- Generacion de codigo y matematicas a nivel de un modelo de ~1,5B, sin datos de evaluacion que lo respalden.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatible con text-generation-inference y endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Experimentacion academica sobre alineacion y condicionamiento: el checkpoint permite reproducir y analizar el efecto de la variante "pi-ab" frente a "pi-off" en el comportamiento generativo, comparando salidas con y sin la instruccion de sistema.
- Prototipado rapido en local: con ~1,5B parametros y 3,1 GB en bf16, se puede cargar en una GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superior) para pruebas de generacion de texto sin infraestructura dedicada.
- Generacion de texto de bajo coste en pipelines internos: su tamano permite desplegar en una sola GPU para tareas de resumen, parafraseo o clasificacion generativa, siempre que se valide la calidad empiricamente.
- Evaluacion comparativa de checkpoints: util como baseline experimental frente a Qwen2.5-1.5B-Instruct u otros modelos de tamano similar para medir degradacion o mejora tras el ajuste.
- Investigacion sobre sesgos y seguridad en modelos pequenos: al ser un artefacto experimental sin documentar, sirve para estudiar como el fine-tuning altera sesgos y comportamiento en modelos de baja capacidad.
- Fine-tuning posterior (continued pretraining o SFT): como punto de partida para tareas especificas, dado su tamano manejable y su formato estandar en safetensors con transformers.
- Despliegue en entornos con restricciones de memoria: cuantizado a 4 bits (approx. 1 GB) podria ejecutarse en CPU o GPUs integradas, aunque la cuantizacion no esta publicada por el autor y habria que generarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: ~1,6 GB de pesos; en 4 bits: ~0,8-1 GB (cuantizacion no publicada, habria que generarla con herramientas como bitsandbytes o llama.cpp).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 y H100. Cabe holgadamente en cualquier GPU consumer moderna con 8 GB o mas.
- Despliegue: transformers (nativo), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama (previa conversion a GGUF), Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles. Para un modelo de ~1,5B en una RTX 4090 se puede esperar un throughput alto (cientos de tokens por segundo en batch), pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| davanstrien/jim-crow-qwen-pi-ab-pi-off-1 | ~1,54B | no disponible | no disponible | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens (segun documentacion oficial de Qwen) | Apache 2.0 (segun documentacion oficial) | Hugging Face |
| Qwen2-1.5B-Instruct | ~1,54B | 32.768 tokens (segun documentacion oficial) | Apache 2.0 (segun documentacion oficial) | Hugging Face |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (segun documentacion oficial) | Apache 2.0 (segun documentacion oficial) | Hugging Face |

No hay datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion; cualquier uso en produccion requiere auditoria previa.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para produccion.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Riesgo de alucinacion: inherente a los modelos de ~1,5B parametros, agravado por la falta de evaluacion publicada.
- Limitaciones de contexto e idioma: no documentadas; el tag `qwen2` sugiere herencia de la familia Qwen2, pero no se confirma la ventana de contexto efectiva.
- Caracter experimental: el nombre del repositorio indica un experimento de condicionamiento; el modelo puede comportarse de forma impredecible fuera del contexto para el que fue ajustado.
- Sin garantias de soporte: el autor no ofrece documentacion ni mantenimiento; el checkpoint podria quedar obsoleto o eliminado.
- Verificacion obligatoria: antes de cualquier uso, ejecutar pruebas de calidad, seguridad y sesgo con datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/jim-crow-qwen-pi-ab-pi-off-1
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://ml2co2.github.io/impact
- Repositorio de Qwen2 (familia base, segun tag): https://github.com/QwenLM/Qwen2
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference

# RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4

## Resumen

Qwen3.8-27B-tuneLLM-NF4 es una cuantización de solo texto del modelo Qwen/Qwen3.8-27B, publicada por RenormalizationTech dentro de su proyecto tuneLLM. El paquete toma los pesos del modelo base en una revisión fijada (commit `37561816e66b5b9153b1b64c10968c18c1e6f4a0`), elimina los componentes de visión y MTP (multi-token prediction) y aplica cuantización NF4 de 4 bits mediante bitsandbytes. El resultado son 26.895.998.464 parámetros almacenados en 17,7 GB de safetensors, frente a los aproximadamente 54 GB que ocuparía el mismo modelo en BF16.

El interés de esta ficha es doble. Por un lado, demuestra una vía práctica para servir un modelo de ~27B con 4 bits en una única GPU de 48 GB (RTX A6000), tal como documenta el autor. Por otro, es un ejemplo poco habitual de model card honesta: incluye resultados medidos sobre subconjuntos pequeños (MMLU y GSM8K de 32 ítems, QASPER de 27 preguntas), reconoce que no aisló el efecto de la cuantización frente a un BF16 de referencia y conserva un diagnóstico de logits que falló la tolerancia. Es decir, el autor no presenta el modelo como "equivalente al original" sino como una representación concreta con un alcance medido y limitado.

Arquitectura y contexto: la información disponible no detalla la arquitectura interna (se infiere transformer causal, clase `Qwen3_5ForCausalLM`), ni la longitud de contexto, ni los idiomas soportados. El modelo base es Qwen3.8-27B, pero esta ficha no puede confirmar sus especificaciones a partir de los datos proporcionados. La licencia es Apache 2.0, heredada del upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (clase `Qwen3_5ForCausalLM`; detalles internos no disponibles) |
| Parámetros totales | 26.895.998.464 (26,9 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NF4 de 4 bits (bitsandbytes); también distribuido en GGUF Q4_K_M y BF16 GGUF de referencia local |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 17,7 GB); pesos GGUF disponibles en el ecosistema del autor |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. El autor parte de los pesos de Qwen/Qwen3.8-27B en una revisión inmutable, extrae únicamente la torre de texto (excluye visión y MTP) y aplica cuantización NF4 con bitsandbytes. No se incluye adaptador de tarea, adaptador fusionado ni activation steering: es un checkpoint base cuantizado, sin ajuste fino adicional. La model card indica explícitamente que los pesos y la configuración upstream fueron modificados mediante extracción de solo texto, exclusión de componentes de visión/MTP y cuantización.

El entorno registrado por el autor es PyTorch 2.12.0+cu130, Transformers 5.23.0, bitsandbytes 0.49.2, PEFT 0.21.0 y Accelerate 1.12.0. La ruta HF/NF4 usa los kernels de referencia de PyTorch para GDN y convolución causal; no se instalaron los paquetes optimizados FLA ni causal-conv. El hardware de medida fue una RTX A6000 de 48 GB por brazo NF4/Q4 y dos GPU para la referencia BF16 GGUF local. No hay información sobre número de tokens de entrenamiento, composición del dataset, RLHF o DPO, porque el modelo no se ha reentrenado: hereda lo que tenga el base, que esta ficha no puede verificar.

## Capacidades

- Generación de texto conversacional: la model card incluye un ejemplo con `apply_chat_template` y plantilla de chat con `enable_thinking=False`.
- Razonamiento y matemáticas: el autor evalúa MMLU (conocimiento general) y GSM8K (aritmética), lo que indica que el modelo está pensado para tareas de razonamiento de un solo paso.
- Modo "thinking" desactivable: la plantilla de chat acepta `enable_thinking`, lo que sugiere que el base soporta un modo de razonamiento extendido, aunque esta versión se prueba en modo nonthinking.
- Tool calling / function calling: no disponible en la información proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.
- Visión: explícitamente excluida en esta cuantización.
- MTP (multi-token prediction): excluido en esta cuantización.

## Casos de uso

- Despliegue de un modelo de ~27B en una sola GPU de 48 GB: la cuantización NF4 reduce el peso a 17,7 GB, lo que permite cargar el modelo completo en una RTX A6000 sin sharding. Adecuado para laboratorios con hardware limitado que quieran experimentar con un modelo grande.
- Evaluación comparativa de cuantizaciones: el autor publica resultados de NF4 nativo frente a GGUF Q4_K_M y BF16 GGUF de referencia, lo que convierte este repo en un banco de pruebas para medir el impacto de la cuantización en tareas cortas de conocimiento y aritmética.
- Generación de texto de dominio científico con supervisión: el autor advierte que el modelo puede producir afirmaciones científicas no respaldadas y que la pantalla pequeña no establece fiabilidad científica. Útil para borradores que un humano revisa, no para publicación automática.
- Punto de partida para adaptadores PEFT: la model card menciona que la preparación PEFT convierte módulos flotantes a FP32 y define un runtime medido distinto, y que los adaptadores separados requieren esa preparación. Sirve como base para fine-tuning con LoRA sobre texto.
- Integración en pipelines de Transformers: el ejemplo de uso con `AutoTokenizer`, `Qwen3_5ForCausalLM` y `device_map={"": 0}` encaja en servicios de inferencia basados en Hugging Face con `attn_implementation="sdpa"`.
- Reproducibilidad y auditoría de cuantizaciones: el repo incluye `evaluation.json`, hashes de binarios de llama.cpp y comandos de reproducción, lo que facilita auditorías de procedencia en entornos regulados.
- Investigación sobre extracción de solo texto: útil para estudiar cómo se comporta un modelo multimodal al que se le eliminan los componentes de visión y MTP, manteniendo solo la torre de lenguaje.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre subconjuntos fijos y pequeños, batch uno, generación greedy nonthinking y tope de 512 tokens. MMLU usa likelihoods de cuatro letras zero-shot personalizados. No son benchmarks finales independientes.

| Representación en runtime | MMLU general | GSM8K numeric fallback | GSM8K strict |
|---|---:|---:|---:|
| HF/bitsandbytes NF4 (nativo) | 30/32 | 26/32 | 26/32 |
| llama.cpp Q4_K_M | 29/32 | 27/32 | 26/32 |
| llama.cpp BF16 GGUF (referencia local) | 29/32 | 26/32 | 25/32 |

Además, la pantalla incluye 35 preguntas de desarrollo de QASPER; el subconjunto primario de QASPER con texto completo tiene 27 preguntas por brazo. El autor advierte que estos ítems solapan con fixtures de desarrollo/retención y que no constituyen un benchmark final independiente. No se ejecutó una referencia BF16 con Transformers, por lo que el efecto propio de la cuantización NF4 no se aisló. El diagnóstico de logits estrictos con prefijo completo en NF4 superó la tolerancia (diferencia absoluta máxima observada de 0,125) y el fallo se conserva en la documentación. No se declara benchmark de TTFT aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,7 GB solo de pesos en NF4; con overhead de activaciones, caché KV y contexto, planificar al menos 24 GB para contextos moderados y 40-48 GB para contextos largos (la longitud de contexto no está disponible, así que el cálculo exacto no se puede cerrar).
- GPU recomendadas: RTX A6000 48 GB (la usada por el autor), A100 40/80 GB, H100 80 GB. En consumer, una RTX 4090 de 24 GB podría cargar los pesos, pero el margen para contexto y activaciones es ajustado.
- ¿Cabe en consumer GPU? Sí en GPUs de 24 GB o más con cuantización NF4 y contextos cortos; no se garantiza en GPUs de 16 GB.
- Opciones de despliegue: Transformers con bitsandbytes (ruta nativa documentada), llama.cpp con GGUF Q4_K_M, y por extensión ecosistemas compatibles con GGUF. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. El autor indica que los tiempos registrados incluyen carga del modelo y tareas, con jobs concurrentes y una referencia BF16 sharded, lo que limita las comparaciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4 | 26,9 B | No disponible | NF4 4-bit, GGUF Q4_K_M, BF16 GGUF | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | No disponible en esta ficha | No disponible | BF16 original | Apache 2.0 (según upstream) | Hugging Face |
| Alternativas de ~27B en 4 bits | No disponible | No disponible | No disponible | No disponible | No disponible |

La información proporcionada no incluye datos de modelos comparables de otros desarrolladores (por ejemplo, familias Llama, Mistral o Gemma de tamaño similar), por lo que la comparativa cuantitativa queda limitada al propio base y a las representaciones del mismo modelo que el autor midió.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo puede producir afirmaciones científicas no respaldadas y que la pantalla pequeña no establece fiabilidad científica.
- Los benchmarks son subconjuntos fijos de 32 ítems (MMLU, GSM8K) y 27-35 ítems (QASPER), con solapamiento con fixtures de desarrollo; no son benchmarks finales independientes y tienen alta varianza estadística.
- No se aisló el efecto de la cuantización NF4: no se ejecutó una referencia BF16 con Transformers, y las diferencias NF4/Q4 mezclan representación y backend.
- El diagnóstico de logits estrictos en NF4 superó la tolerancia (diferencia absoluta máxima de 0,125); la equivalencia numérica con el base no está establecida.
- Visión y MTP están excluidos: no es un sustituto del modelo multimodal completo.
- Idiomas soportados no declarados; no se puede garantizar calidad fuera del inglés sin evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción; la responsabilidad de validación recae en el integrador.
- La carga debe hacerse con la configuración de cuantización guardada; no se deben recuantizar los pesos almacenados.
- La preparación PEFT cambia el runtime medido (conversión a FP32 de módulos flotantes); los resultados de la model card no aplican a ese escenario.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan del base, no evaluados aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RenormalizationTech/Qwen3.8-27B-tuneLLM-NF4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto tuneLLM: https://github.com/RenormalizationTech/tuneLLM
- Revisión upstream fijada: `37561816e66b5b9153b1b64c10968c18c1e6f4a0`
- Resultados de evaluación: `evaluation.json` dentro del repositorio del modelo

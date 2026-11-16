# codesj/PIT-4B-2021-16k-olmo-posttrain-20261115

## Resumen

PIT-4B-2021-16k-olmo-posttrain-20261115 es un adaptador PEFT LoRA publicado por el usuario codesj sobre una base denominada "PIT 4B 2021 YaRN 16K", un modelo de 4.000 millones de parámetros con extensión de contexto mediante YaRN hasta 16.000 tokens. El adaptador se ha entrenado para post-entrenamiento por instrucciones (instruction tuning) con un único pase sobre un conjunto piloto sintético de 380 respuestas de instrucción procedentes de Ai2 Open Instruct y 380 razonamientos generados por Qwen, lo que supone 95 pasos de optimizador en una GPU A100 de Google Cloud.

El artefacto no incluye los pesos base: el repositorio solo contiene el adaptador LoRA (rango 32, alpha 64), el tokenizador y la plantilla de chat, con un tamaño total de 0,2 GB. Para utilizarlo es necesario disponer de una copia local exacta de la base, identificable mediante los hashes SHA-256 y tamaños de fichero recogidos en `provenance.json`.

Su relevancia es fundamentalmente metodológica: documenta de forma trazable un experimento de post-entrenamiento sobre una base concreta, con identidad de pesos verificable. No es un modelo listo para producción ni un checkpoint autónomo, y el propio autor advierte que la calidad en held-out y la retención de contexto largo requieren evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base PIT); adaptador PEFT LoRA |
| Parametros totales | 4B en la base (aproximado por el nombre); adaptador LoRA de rango 32 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 16.000 tokens (extensión YaRN sobre la base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); base distribuida por separado |
| Rango LoRA / alpha | 32 / 64 |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de 4B parámetros cuya longitud de contexto se ha extendido a 16K tokens mediante YaRN (Yet another RoPE extensioN), técnica de interpolación/ajuste de las frecuencias rotacionales posicionales para generalizar más allá de la ventana original de entrenamiento. Sobre esta base se aplica un adaptador LoRA de rango 32 y alpha 64, que modifica un subconjunto de matrices del modelo sin alterar los pesos originales.

El entrenamiento del adaptador consiste en un único pase de instruction tuning con 380 respuestas de instrucción provenientes de Ai2 Open Instruct y 380 racionalizaciones (rationales) generadas por Qwen, lo que totaliza 95 pasos de optimizador sobre una A100 en GCP. Se trata, por tanto, de un piloto sintético de escala muy reducida, orientado a registrar el proceso y la identidad de los pesos base más que a producir un modelo con calidad demostrada. La model card menciona también la etiqueta `knowledge-distillation`, coherente con el uso de racionales de Qwen como señal de entrenamiento.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, gracias a la plantilla de chat incluida en el repositorio.
- Razonamiento paso a paso potenciado por los 380 racionales de Qwen empleados en el entrenamiento (destilación de trazas de razonamiento).
- Manejo de contexto largo de hasta 16.000 tokens mediante la extensión YaRN de la base.
- Integración con el ecosistema Hugging Face a través de `peft.PeftModel` y `transformers.AutoTokenizer`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación en post-entrenamiento: reproducir el pipeline exacto (Ai2 Open Instruct + racionales de Qwen, LoRA r=32, 95 pasos) sobre la base identificada por `provenance.json` para estudiar el efecto de un ajuste mínimo por instrucciones.
- Auditoría de procedencia de pesos: usar los hashes SHA-256 y tamaños de fichero del repositorio para verificar que la base cargada coincide con la empleada en el entrenamiento, algo útil en entornos de trazabilidad de modelos.
- Experimentos controlados de destilación de razonamiento: comparar el comportamiento del adaptador frente a la base sin adaptar para medir cuánto de la capacidad de razonamiento proviene de los racionales sintéticos.
- Prototipado de chatbots con contexto largo: desplegar la base + adaptador con la plantilla de chat para conversaciones multi-turno de hasta 16K tokens en entornos de laboratorio.
- Estudio de retención de contexto tras YaRN: evaluar si el ajuste LoRA degrada o preserva la ventana extendida a 16K, tal como el autor señala que requiere evaluación separada.
- Base para ablaciones de hiperparámetros LoRA: partir de este adaptador como referencia (r=32, alpha=64) y variar rango, alpha o número de pasos para estudiar sensibilidad en modelos de 4B.
- Docencia y formación: ejemplo didáctico completo de un flujo PEFT con identidad de pesos verificable y model card con provenance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la calidad en held-out y la retención de contexto largo requieren evaluación separada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para una base de 4B, en bfloat16 se requieren aproximadamente 8 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits rondaría 4-5 GB y en 4 bits unos 2,5-3 GB, aunque estos cálculos no están confirmados por el autor.
- GPU recomendadas: el entrenamiento se realizó en una A100 de GCP. Para inferencia, una A100 o H100 ofrecen margen holgado; una RTX 4090 (24 GB) debería poder alojar la base en bf16 con contexto moderado.
- GPU de consumo: previsiblemente asequible en RTX 3090/4090 y en GPUs de 16 GB con cuantización, si bien no hay datos publicados que lo confirmen.
- Opciones de despliegue: la model card solo documenta la carga mediante `peft.PeftModel` con la implementación `pit_hf.PITForCausalLM`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la integración con estas herramientas no está garantizada al requerir una implementación de modelo específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PIT-4B-2021-16k-olmo-posttrain (este) | 4B (base) + LoRA r=32 | 16K (YaRN) | no disponible | safetensors (adaptador PEFT) | Requiere base local verificada por hash; piloto de 95 pasos |
| Qwen2.5-3B-Instruct | 3B | 32K (128K con YaRN) | Apache 2.0 (según versión pública) | safetensors, GGUF | Modelo autónomo con instruction tuning completo; datos no verificados en esta ficha |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Checkpoint completo con RLHF; datos no verificados en esta ficha |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento y código; datos no verificados en esta ficha |

La comparación es estructural: los tres alternativos son checkpoints autónomos con licencia conocida y despliegue directo en llama.cpp o vLLM, mientras que este artefacto es un adaptador que exige la base exacta y una implementación de modelo específica (`pit_hf`).

## Limitaciones y advertencias

- No es un modelo autónomo: sin la base "PIT 4B 2021 YaRN 16K" exacta (verificable por hash) el adaptador es inutilizable.
- Entrenamiento extremadamente pequeño: 380 respuestas de instrucción y 380 racionales, 95 pasos de optimizador; el riesgo de sobreajuste y de comportamiento errático es alto.
- Datos sintéticos: los racionales provienen de Qwen, por lo que el adaptador puede heredar sesgos y errores de ese generador.
- Sin evaluación publicada: no hay benchmarks de held-out ni de retención de contexto largo; el propio autor lo advierte.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe.
- Riesgo de alucinación: inherente a modelos de 4B con ajuste mínimo; sin RLHF ni evaluaciones de seguridad documentadas.
- Sesgos conocidos: no documentados en la información disponible.
- Implementación no estándar: requiere `pit_hf.PITForCausalLM`, lo que limita la compatibilidad con herramientas de inferencia habituales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/codesj/PIT-4B-2021-16k-olmo-posttrain-20261115
- Provenance (referenciado en la model card, dentro del repositorio): `provenance.json`
- Ai2 Open Instruct (dataset citado): no se incluye enlace en la información proporcionada
- YaRN (paper de referencia de la técnica): no se incluye enlace en la información proporcionada
- Repositorio o paper del modelo base PIT: no disponible

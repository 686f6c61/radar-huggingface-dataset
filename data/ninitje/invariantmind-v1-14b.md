# Ninitje/InvariantMind-v1-14B

## Resumen

InvariantMind-v1-14B es un ajuste fino mediante adaptadores (PEFT/LoRA) del modelo DeepSeek-R1-Distill-Qwen-14B, publicado por el usuario Ninitje en Hugging Face. El autor lo presenta como un «razonador científico autónomo» orientado a dominios concretos: dinámica no lineal, sincronización de Kuramoto, solitones de campo φ⁴, teoría de la complejidad morfológica y consenso científico entre agentes.

El entrenamiento combina una fase supervisada con QLoRA de 4 bits (r=64, alpha=128) sobre 25.000 turnos de investigación y 2.330 episodios científicos, y una fase de alineamiento con DPO sobre 25 pares de debate. Los datos proceden de una «colonia» de 15 LLM que operan en dos ecosistemas simulados (World A y World B), un planteamiento poco convencional y sin validación externa.

Su relevancia es ilustrativa más que práctica: demuestra un flujo de especialización de bajo coste sobre un modelo de razonamiento abierto, con licencia Apache 2.0 y un adaptador de 4,4 GB. Sin embargo, se publica sin benchmarks, sin idiomas declarados y con cero descargas, por lo que debe tratarse como un experimento reproducible y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base DeepSeek-R1-Distill-Qwen-14B (familia Qwen2.5); especialización mediante adaptadores LoRA de PEFT |
| Parametros totales | 14.000 millones en el modelo base; el adaptador usa r=64 y alpha=128 (recuento exacto de parametros del adaptador: no disponible) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (el autor no la declara; se hereda del modelo base) |
| Tipos de cuantizacion | Entrenamiento con cuantizacion 4-bit NormalFloat (NF4); el adaptador se distribuye en safetensors sin cuantizaciones adicionales publicadas. No hay GGUF oficial |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-14B |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de 14.000 millones de parametros de la familia Qwen2.5, destilado por DeepSeek a partir de su modelo de razonamiento R1. Sobre ese modelo se aplica un adaptador LoRA de rango 64 y alpha 128, entrenado en precision 4-bit NormalFloat (QLoRA) y distribuido como pesos safetensors independientes. El autor no especifica si el adaptador toca todas las capas lineales o solo las de atencion, ni el contexto maximo efectivo tras el ajuste; la documentacion publica del modelo base de la familia Qwen2.5 declara ventanas de 128.000 tokens, pero el autor no lo confirma en esta ficha.

El corpus de entrenamiento es infrecuente: 2.330 episodios cientificos (19,4 MB) y 25.000 turnos de investigacion generados por una «colonia» de 15 LLM que operan en dos entornos simulados, World A (Evolution Sandbox) y World B (Synthetic Agora). La fase supervisada ejecuto 417 pasos de optimizador durante 3 epocas (1 h 28 min en una NVIDIA A100-SXM4-80GB), con perdida final de 0,62 y precision de prediccion de tokens del 93,1 %. La fase DPO se realizo sobre solo 25 pares de debate revisados por pares, con un margen de recompensa de +31,73 y precision de recompensa del 100 %. No se documentan tecnicas de decodificacion especulativa ni variantes de atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato de chat, con plantilla aplicada mediante `apply_chat_template`.
- Razonamiento paso a paso con cadena de pensamiento, capacidad heredada del modelo base DeepSeek-R1-Distill-Qwen-14B.
- Analisis de sistemas de dinamica no lineal, en particular el modelo de Kuramoto y su parametro de orden y acoplamiento critico Kc.
- Razonamiento sobre solitones de campo escalar φ⁴ y efectos relativistas.
- Discusion teorica sobre complejidad morfológica y formacion de patrones.
- Discusion de consenso cientifico entre agentes, por el tipo de datos usado en el entrenamiento.
- Soporte de tool calling / function calling: no documentado en la model card; no debe asumirse.
- Capacidades de agente y razonamiento multi-paso: no documentadas, aunque el modelo base es un modelo de razonamiento.
- Capacidades multilingues: no declaradas.
- Vision, audio u otras modalidades: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Analisis de transiciones de sincronizacion en redes de osciladores: el modelo puede razonar sobre el parametro de orden de Kuramoto, el acoplamiento critico y los efectos de tamano finito, que es exactamente el dominio sobre el que se alineo con DPO.
- Simulacion conceptual de solitones φ⁴: util como asistente de formulacion de hipotesis y de interpretacion de resultados numericos en fisica de campos clasica.
- Docencia en sistemas complejos: generacion de explicaciones y ejemplos sobre sincronizacion, critically y formacion de patrones para materiales didacticos de nivel universitario.
- Preprocesado y resumen de literatura cientifica en dinamica no lineal: puede resumir articulos y extraer terminologia tecnica del dominio, siempre con revision humana.
- Prototipado de pipelines de investigacion asistida: dado que el autor publica un ejemplo funcional con `transformers` + `peft` + `bitsandbytes`, sirve como base para experimentar con agentes cientificos especializados.
- Evaluacion de tecnicas de alineamiento con datos sinteticos: el modelo es un caso de estudio de SFT + DPO sobre corpus generados por colonias de LLM y de su impacto en dominios cientificos concretos.
- Entrenamiento de estudiantes de posgrado en flujos QLoRA: el adaptador de 4,4 GB y el ejemplo de carga en 4 bits permiten reproducir el flujo completo en una unica GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GPQA u otros) en la informacion disponible. El autor solo reporta metricas del propio entrenamiento:

| Metrica | Fase | Valor |
|---|---|---|
| Perdida final de entrenamiento | SFT | 0,62 |
| Precision de prediccion de tokens | SFT | 93,1 % |
| Pasos de optimizador | SFT | 417 (3 epocas) |
| Duracion del entrenamiento | SFT | 1 h 28 min en 1x NVIDIA A100-SXM4-80GB |
| Margen de separacion de recompensa | DPO | +31,73 |
| Precision de recompensa | DPO | 100 % (sobre 25 pares de debate) |

Estas cifras corresponden al ajuste, no a evaluaciones independientes, y no permiten comparar el modelo con alternativas de forma fiable.

## Requisitos de hardware

- VRAM estimada en BF16/FP16 (base fusionada con el adaptador): en torno a 28 GB solo de pesos, con 32-40 GB recomendados al sumar cache KV y activaciones.
- VRAM estimada en 8 bits: aproximadamente 15-16 GB.
- VRAM estimada en 4 bits (NF4), que es el modo documentado por el autor: en torno a 9-11 GB de pesos, con 12-16 GB recomendados segun longitud de contexto.
- GPU profesionales: A100 40/80 GB y H100 son suficientes en BF16. El autor entreno en una A100-SXM4-80GB.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en 4 u 8 bits; en BF16 requiere dos GPU de 24 GB o una de 48 GB.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` es el flujo documentado. vLLM y TGI requieren fusionar previamente el adaptador con el modelo base. llama.cpp y Ollama exigen conversion a GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InvariantMind-v1-14B | 14B + adaptador LoRA (r=64) | no disponible | Sin benchmarks publicos; perdida SFT de 0,62 | Apache 2.0 | 0 descargas, 0 likes en Hugging Face |
| DeepSeek-R1-Distill-Qwen-14B (modelo base) | 14B | no disponible en esta ficha | Benchmarks publicados por DeepSeek, no incluidos aqui | no disponible en esta ficha | Ampliamente disponible y ampliamente utilizado |
| Otros ajustes cientificos de ~14B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar el rendimiento de InvariantMind-v1-14B con alternativas de la misma categoria; la unica comparacion defendible es la que lo situa frente a su propio modelo base.

## Limitaciones y advertencias

- Sesgos potenciales derivados de un corpus integramente sintetico, generado por 15 LLM, sin datos humanos verificados ni proceso de anotacion externo.
- Riesgo elevado de alucinacion en afirmaciones cientificas: el modelo no esta validado por revision por pares y puede generar referencias o resultados plausibles pero falsos.
- Alineamiento DPO basado en solo 25 pares de debate, lo que da una senal de preferencia muy estrecha y facilmente sobreajustada.
- Dominio muy restringido (dinamica no lineal, Kuramoto, solitones, complejidad); el rendimiento fuera de ese ambito no esta documentado.
- Idiomas soportados sin declarar: no se puede asumir un buen comportamiento en castellano.
- Longitud de contexto no especificada por el autor.
- Soporte de tool calling, agentes y multi-paso sin documentar, pese a que las etiquetas del repositorio mencionan agentes autonomos.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base puede imponer condiciones adicionales que el autor no detalla; conviene revisar la licencia de DeepSeek-R1-Distill-Qwen-14B antes de explotarlo.
- Ausencia total de validacion de la comunidad: cero descargas y cero likes en el momento de la consulta, sin issues ni informes de terceros.
- Advertencia general: no usar en produccion ni en contextos cientificos con consecuencias reales sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ninitje/InvariantMind-v1-14B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Listado de modelos etiquetados con «solitons» en Hugging Face: https://huggingface.co/models?other=solitons
- Paper, blog o demo adicionales: no disponibles en la informacion consultada.

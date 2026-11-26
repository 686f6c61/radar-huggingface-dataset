# kashif/Qwen3-4B-Gated-LoRA-MTP

## Resumen

Qwen3-4B-Gated-LoRA-MTP es un adaptador LoRA (mas un pequeno MLP muestreador) que se acopla sobre el modelo base Qwen/Qwen3-4B para dotarlo de capacidad de multi-token prediction (MTP) orientada a decodificacion especulativa autoinducida. Lo desarrolla kashif y sigue la receta gated-LoRA MTP de NeMo AutoModel, inspirada en el articulo arXiv:2507.11851 ("Your LLM Knows the Future"). La idea central es que el propio modelo genere borradores de varios tokens futuros y luego los verifique en una sola pasada, acelerando la generacion sin modificar los pesos del modelo base.

El modelo base Qwen3-4B es un transformer denso de 4.000 millones de parametros con una ventana de contexto amplia (definida por Qwen3), y este adaptador no altera sus pesos: los tokens reales siempre pasan por los pesos congelados, de modo que la calidad del texto generado no se degrada. El adaptador solo anade la habilidad de redactar borradores sobre ocho identificadores reservados del vocabulario (151700-151707) que actuan como mascaras, una por profundidad de borrador.

Es relevante ahora porque demuestra, con mediciones reales de extremo a extremo, que es posible obtener aceleraciones modestas pero verificables (1,20x-1,31x) en decodificacion codiciosa con cache KV, empleando unicamente un adaptador ligero de rango 16 y un MLP pequeno, sin reentrenar el modelo base ni desplegar un modelo drafter separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) sobre proyecciones `*_proj` de Qwen3-4B + MLP muestreador (`GatedMTPSampler`) |
| Parametros totales | Modelo base: 4.000 millones (Qwen3-4B); el adaptador anade un LoRA de rango 16 y un MLP pequeno (tamano exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | La del modelo base Qwen3-4B (no especificada en la informacion disponible) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y publica en bf16; safetensors) |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen3 soporta mas idiomas, pero el adaptador se entreno solo con datos en ingles) |
| Licencia | Apache 2.0 para el adaptador; el dataset de entrenamiento es CC BY-SA 3.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), libreria PEFT |

## Arquitectura y entrenamiento

El adaptador emplea LoRA de rango 16 con alpha 32 aplicado exclusivamente a los modulos `*_proj` del transformer Qwen3-4B. La innovacion clave es la "gated LoRA": el LoRA solo se activa en las posiciones de los ocho tokens mascara reservados (151700-151707), que ocupan filas no utilizadas de la tabla de embeddings del modelo base (151.936 filas frente a 151.669 tokens del tokenizador). Cada mascara corresponde a una profundidad de borrador, de modo que el modelo puede predecir hasta 9 tokens por ronda. Un MLP muestreador refina cada borrador usando el token predicho en la profundidad anterior, produciendo continuaciones coherentes en lugar de conjeturas independientes.

El entrenamiento se realizo sobre `databricks/databricks-dolly-15k` durante una epoca, con AdamW, learning rate 1e-4 y precision bf16. Se publican checkpoints en los pasos 299, 599, 899 (ramas `step-299`, `step-599`, `step-899`) y 906 (revision final). La verificacion de borradores se hace en una sola pasada forward: cada ronda alimenta el ultimo token libre, los tokens especulativos previos y ocho mascaras nuevas con cache KV, de forma que reintroducir la especulacion anterior como tokens reales la verifica de forma gratuita. En caso de discrepancia, el borrador de esa ronda se descarta.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen3-4B.
- Borrador multi-token (hasta 9 tokens por ronda) para decodificacion especulativa autoinducida.
- Verificacion de borradores en una sola pasada forward con cache KV.
- Mantiene intactas las capacidades del modelo base para tokens reales (razonamiento, codigo, matematicas, tool calling y agentes, segun lo que soporte Qwen3-4B).
- Capacidad multilingue limitada al modelo base; el adaptador solo se entreno con datos en ingles.
- No introduce modo "thinking" ni capacidades de vision o audio propias; depende del modelo base.

## Casos de uso

- Aceleracion de inferencia en produccion: integrar el adaptador en un servidor de generacion para reducir la latencia de decodificacion codiciosa en un 20-30 % sobre Qwen3-4B, manteniendo la misma salida que el modelo base gracias a la verificacion por tokens reales.
- Servicios de chat de bajo coste: desplegar Qwen3-4B con este adaptador en GPUs de gama media para atender conversaciones multi-turno con menor tiempo por token generado.
- Generacion de texto por lotes: procesar grandes volumenes de resumenes o respuestas sobre dolly-15k-like con throughput mejorado, ya que el borrador reduce el numero de pasos forward efectivos.
- Prototipado de tecnicas de decodificacion especulativa: usar el adaptador y el codigo de NeMo AutoModel como referencia reproducible para investigar MTP y verificacion en una sola pasada.
- Educacion e investigacion: estudiar el efecto del gated-LoRA y del MLP muestreador sobre la longitud de aceptacion (accept-length) sin necesidad de reentrenar el modelo base.
- Despliegue en entornos con VRAM limitada: al ser un adaptador de 1,8 GB sobre un modelo de 4B en bf16, permite obtener aceleracion sin anadir un segundo modelo drafter completo.

## Benchmarks y rendimiento

| Metrica | Paso 299 | Paso 599 | Paso 899 | Paso 906 (final) |
|---|---:|---:|---:|---:|
| val_mtp_tau_sim (accept-length, teacher-forced) | 2,017 | 2,116 | 2,237 | 2,234 |

| Prompt | tok/s (adaptador) | tok/s (baseline) | Aceleracion |
|---|---:|---:|---:|
| "Explain the water cycle..." | 26,48 | 20,26 | 1,31x |
| "Write a short story..." | 24,37 | 20,36 | 1,20x |

El autor senala que la aceleracion es real pero modesta, inferior al 2-5x que reporta el articulo de referencia con su receta completa (que incluye una perdida de consistencia y una estrategia de decodificacion mas avanzada no implementadas aqui). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 1,8 GB en disco; en inferencia se suma al modelo base Qwen3-4B en bf16 (aproximadamente 8 GB de pesos) mas cache KV y el MLP muestreador.
- GPU recomendadas: A100, H100 o RTX 4090 para bf16 sin cuantizar; GPUs con 16-24 GB de VRAM son suficientes para el modelo base en bf16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en GPUs de 16 GB con cuantizacion del modelo base (aunque el adaptador se entrena en bf16).
- Opciones de despliegue: requiere NeMo AutoModel con la rama `kashif/feat/gated-lora-mtp` (PR #4686); no es compatible directamente con vLLM, llama.cpp, Ollama o TGI en su forma actual, ya que necesita `GatedMTPConfig`, `GatedMTPSampler` y `randomize_embedding_rows`.
- Latencia y throughput: medidos a 26,48 tok/s frente a 20,26 tok/s de baseline en el prompt del ciclo del agua (1,31x) y 24,37 frente a 20,36 tok/s en el de la historia corta (1,20x).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Gated-LoRA-MTP | 4B + LoRA rango 16 | El de Qwen3-4B | MTP con gated-LoRA y verificacion en una pasada | Apache 2.0 | Hugging Face, requiere rama de NeMo AutoModel |
| Qwen3-4B (base) | 4B | El de Qwen3-4B | Transformer denso sin MTP | Apache 2.0 | Hugging Face, ampliamente soportado |
| Drafters especulativos clasicos (p. ej. EAGLE, Medusa) | Variable (modelo drafter separado) | El del modelo base | Modelo drafter independiente | Variable | Implementaciones en vLLM y otros |

La ventaja frente a drafters clasicos es que no requiere un segundo modelo completo y no modifica la salida del modelo base; la desventaja es la dependencia de una rama no fusionada de NeMo AutoModel y una aceleracion inferior a la de recetas completas.

## Limitaciones y advertencias

- La aceleracion es modesta (1,20x-1,31x) y muy inferior al 2-5x de la receta completa del articulo de referencia.
- Requiere una rama no fusionada de NeMo AutoModel (PR #4686); no esta en `main` ni en el paquete PyPI `nemo-automodel`, lo que complica el despliegue en produccion.
- El adaptador solo se entreno con datos en ingles (dolly-15k); su comportamiento en otros idiomas no esta validado.
- Riesgo de alucinacion inherente al modelo base Qwen3-4B; el adaptador no lo mitiga.
- La carga exige randomizar las 8 filas de embeddings con la misma semilla que en entrenamiento (seed=42); un error aqui invalida el adaptador.
- La licencia Apache 2.0 cubre el adaptador, pero el dataset de entrenamiento es CC BY-SA 3.0, lo que puede imponer obligaciones de atribucion y compartir-igual en derivados.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K) que confirmen que la salida del modelo base se preserva mas alla de la verificacion por tokens reales.
- El uso de `flex_attention` y la integracion con NeMo AutoModel limitan la portabilidad a otros stacks de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/kashif/Qwen3-4B-Gated-LoRA-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Paper de referencia (arXiv:2507.11851): https://arxiv.org/abs/2507.11851
- Repositorio NeMo AutoModel: https://github.com/NVIDIA-NeMo/Automodel
- Pull request con la implementacion: https://github.com/NVIDIA-NeMo/Automodel/pull/4686

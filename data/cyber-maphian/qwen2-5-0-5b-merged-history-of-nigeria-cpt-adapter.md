# Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter

## Resumen

El modelo `Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter` es un checkpoint de lenguaje causal derivado de `Qwen/Qwen2.5-0.5B`, adaptado mediante LoRA y *continued pre-training* (CPT) sobre un corpus de textos historicos de Nigeria. Lo desarrolla el usuario independiente Cyber-Maphian y se publica bajo licencia Apache 2.0. No es un asistente conversacional: es un modelo base de prediccion del siguiente token, pensado como punto de partida para un posterior ajuste supervisado (SFT) o alineamiento por preferencias sobre tareas de historia nigeriana.

La relevancia del modelo es acotada y muy especifica: demuestra un flujo de adaptacion de dominio de bajo coste sobre un modelo de 0,5B parametros, con un adaptador LoRA de rango 8 que cubre las proyecciones de atencion y MLP. El corpus de entrenamiento es pequeno (en torno a 1.500 ejemplos de entrenamiento y 196 de validacion), por lo que el efecto de la adaptacion es limitado y se concentra en el estilo y el vocabulario del dominio, no en un conocimiento factual fiable.

El checkpoint publicado corresponde al paso 350 de entrenamiento, seleccionado por menor perdida de validacion (2,0059). La ventana de contexto, el numero exacto de parametros del adaptador y los detalles de composicion del corpus no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptado con LoRA sobre atencion y MLP |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B); parametros del adaptador: no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en formato PEFT/LoRA) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT/LoRA (safetensors, segun el ecosistema `peft`); no se especifica en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B, un transformer decoder-only denso de 0,5B parametros. Sobre el se aplica un adaptador LoRA con `r=8`, `lora_alpha=16`, `lora_dropout=0.05` y `bias="none"`, dirigido a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La tarea es `CAUSAL_LM` (prediccion del siguiente token) sobre texto crudo, sin plantilla de chat ni formato de instrucciones.

El entrenamiento es *continued pre-training* sobre el dataset `Cyber-Maphian/History_of_Nigeria`, con aproximadamente 1.500 ejemplos de entrenamiento, 196 de validacion y 197 de test. La evaluacion se realizo cada 50 pasos con entropia cruzada de validacion y `load_best_model_at_end=True`, seleccionando el paso 350. La perdida de validacion evoluciono de 2,0954 (paso 50) a 2,0059 (paso 350) y repunto ligeramente despues (2,0082 en el paso 400, 2,0097 en el 450). No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto causal y continuacion de documentos historicos en ingles.
- Continuacion de pasajes, cronologias y narrativa relacionados con la historia de Nigeria.
- Estilo de documento: reproduce estructuras de capitulos, encabezados y numeracion de pagina del corpus de origen.
- Punto de partida para SFT o alineamiento por preferencias (DPO/ORPO) en tareas del dominio.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso orientado a agentes.
- No dispone de modo *thinking*, vision ni audio.
- Capacidad multilingue limitada al ingles segun la model card.
- No sigue instrucciones de forma fiable: ante preguntas directas tiende a continuar el documento en lugar de responder de forma concisa.

## Casos de uso

- Generacion de borradores de texto historico: el modelo puede continuar pasajes sobre historia nigeriana en estilo documental, util como material de arranque que un editor revisa y corrige despues.
- Base para SFT de un asistente de historia: sirve como checkpoint intermedio sobre el que entrenar un modelo de preguntas y respuestas con formato de chat, aprovechando el vocabulario y el estilo ya adaptados al dominio.
- Aumento de datos sinteticos del dominio: generar variaciones de texto historico para ampliar un corpus de entrenamiento, filtrando despues por verificacion factual.
- Prototipado de bajo coste en CPU o GPU de gama baja: con 0,5B parametros, permite experimentar con flujos de adaptacion de dominio sin infraestructura dedicada.
- Investigacion sobre CPT y LoRA: caso reproducible de adaptacion de dominio con registros de perdida de validacion y criterio de seleccion de checkpoint documentados.
- Experimentos de alineamiento por preferencias: punto de partida para probar DPO/ORPO sobre un modelo pequeno ya expuesto al dominio antes del ajuste supervisado.
- Docencia y demostraciones de PEFT: ejemplo compacto de configuracion LoRA sobre proyecciones de atencion y MLP en un transformer pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entropia cruzada de validacion durante el entrenamiento:

| Paso | Perdida de entrenamiento | Perdida de validacion |
|---|---|---|
| 50 | 2,3644 | 2,0954 |
| 100 | 2,4235 | 2,0565 |
| 150 | 2,2683 | 2,0307 |
| 200 | 2,3226 | 2,0173 |
| 250 | 2,2013 | 2,0122 |
| 300 | 2,2392 | 2,0087 |
| 350 (mejor) | 2,1246 | 2,0059 |
| 400 | 2,1892 | 2,0082 |
| 450 | 2,1885 | 2,0097 |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB en fp16 para el modelo base de 0,5B, mas el adaptador LoRA (de pocos MB a decenas de MB, dato exacto no disponible). En cuantizacion de 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Para entrenamiento del adaptador, una RTX 3090 o RTX 4090 permite lotes mayores.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con `peft` para cargar el adaptador; `llama.cpp` u Ollama si se convierte a GGUF (no se proporciona conversion en el repositorio); vLLM y TGI son compatibles con la arquitectura Qwen2.5, aunque el adaptador requeriria fusion o carga especifica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter | 0,5B (+ LoRA) | no disponible | Base CPT de dominio | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B | 0,5B | no disponible en esta ficha | Base generalista | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Instruct | Apache 2.0 | Hugging Face |
| Adaptaciones CPT de dominio sobre modelos pequenos | variable | variable | Base CPT de dominio | variable | Hugging Face |

La comparacion con benchmarks no es posible porque el autor no publica resultados en MMLU, HumanEval, GSM8K ni tareas equivalentes. Frente a Qwen2.5-0.5B-Instruct, la diferencia principal es funcional: este checkpoint no sigue instrucciones y esta orientado a continuacion de texto en el dominio historico nigeriano.

## Limitaciones y advertencias

- No es un asistente conversacional: no sigue instrucciones ni mantiene formato de chat; las preguntas directas producen continuaciones de documento.
- Riesgo alto de alucinacion: puede inventar fechas, cifras y figuras politicas; no debe usarse como referencia historica sin verificacion.
- Artefactos del corpus: reproduce encabezados de capitulo, numeros de pagina y marcas de maquetacion de los documentos de origen.
- Repeticiones y continuaciones desbocadas: el modelo puede entrar en bucles o generar texto excesivamente largo sin cierre.
- Capacidad limitada por el tamano: 0,5B parametros restringen el razonamiento y la coherencia en textos largos.
- Cobertura idiomatica restringida al ingles; no se documenta soporte de otras lenguas, incluido el espanol.
- Corpus de entrenamiento pequeno (en torno a 1.500 ejemplos), lo que limita la profundidad de la adaptacion de dominio.
- Licencia Apache 2.0 permisiva para uso comercial, heredada del modelo base; conviene revisar igualmente las condiciones del dataset de origen.
- Sin garantias de calidad en produccion: el autor lo presenta explicitamente como checkpoint intermedio para SFT, no como modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyber-Maphian/Qwen2.5-0.5B-MERGED-History-of-Nigeria-CPT-Adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/Cyber-Maphian/History_of_Nigeria
- Perfil del autor: https://huggingface.co/Cyber-Maphian

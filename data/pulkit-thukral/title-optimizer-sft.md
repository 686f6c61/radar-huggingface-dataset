# pulkit-thukral/title-optimizer-sft

## Resumen

`title-optimizer-sft` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base Qwen/Qwen3-1.7B. Lo desarrolla el usuario de Hugging Face `pulkit-thukral` como parte del proyecto abierto `listing-title-optimizer`, cuyo objetivo es generar títulos de anuncios de Airbnb que resulten atractivos y, al mismo tiempo, se limiten a mencionar características que el anuncio declara explícitamente. El adaptador resuelve un problema muy concreto: la generación de titulares comerciales cortos (50 caracteres o menos) sin inventar comodidades ni servicios inexistentes.

El modelo se entrenó con 5.000 títulos de anfitriones con alto engagement, muestreados de un conjunto de 17.349, y se aplica directamente sobre la base Qwen3-1.7B. La arquitectura subyacente es la de Qwen3-1.7B (transformer denso), y el adaptador añade un LoRA con r=16, alpha=32 sobre todas las capas lineales, entrenado en bf16 en un Apple M4 con 24 GB de memoria unificada.

El proyecto forma parte de una cadena más amplia de alineamiento (SFT → DPO → GRPO) sobre datos públicos de Inside Airbnb. Este repositorio contiene únicamente la etapa SFT, que es la que se publica como adaptador independiente. Es relevante para quienes necesitan un componente especializado y ligero de generación de títulos con control estricto de alucinaciones, en lugar de un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 1.700 millones (modelo base); el adaptador LoRA añade una fracción no especificada |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y publica en bf16; el modelo base admite cuantizaciones estándar de Qwen3) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros. El ajuste fino se realizó con LoRA de rango 16 y alpha 32 sobre todas las capas lineales, en precisión bf16, y se entrenó en un Apple M4 con 24 GB de memoria unificada. El tokenizador guardado desactiva el modo de razonamiento (thinking mode) de Qwen3, de modo que todos los tokens generados se destinan al título y no a una cadena de pensamiento intermedia.

Los datos de entrenamiento provienen de la configuración `sft` del dataset `pulkit-thukral/listing-title-optimizer`: pares de system prompt más anuncio (tipo de propiedad, barrio, hasta 20 comodidades y descripción) y el título original del anfitrión como objetivo. Se usaron 5.000 títulos de alto engagement de un total de 17.349, procedentes de anuncios de Londres, Nueva York, Sídney, Toronto y Dublín. El system prompt de entrenamiento impone reglas explícitas: máximo 50 caracteres (ideal 25-45), empezar por la característica más distintiva, no mencionar comodidades no declaradas, sentence case, sin emojis, sin mayúsculas sostenidas, sin signos de exclamación repetidos y sin prefijos como "Title:". Los hiperparámetros completos están en `run_config.json` dentro del repositorio.

## Capacidades

- Generación de títulos de anuncios de alquiler vacacional en inglés, con una sola respuesta por anuncio.
- Control de longitud: entrenado para producir títulos de 50 caracteres o menos (el 97,2% de las salidas SFT cumple el límite).
- Fidelidad a las características declaradas: entrenado para no inventar comodidades ni servicios no presentes en la descripción.
- Formato conversacional: utiliza la plantilla de chat de Qwen3 con system prompt y mensaje de usuario.
- Estilo controlado: sentence case, sin emojis, sin mayúsculas sostenidas, sin signos de exclamación múltiples.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; es un adaptador especializado en una única tarea.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Optimización de títulos en plataformas de alquiler vacacional: el adaptador recibe los metadatos del anuncio (tipo de propiedad, barrio, comodidades y descripción) y devuelve un título de 50 caracteres o menos que destaca la característica más diferencial, reduciendo el trabajo manual de los anfitriones.
- Generación automática de títulos en el alta de anuncios: integrado en el flujo de publicación, el modelo puede proponer un título a partir del formulario rellenado por el anfitrión, con una tasa de alucinación medida del 0,8% en el conjunto de evaluación.
- A/B testing de titulares: al poder generar variantes controladas y fieles al contenido, permite comparar títulos alternativos sin riesgo de prometer comodidades inexistentes.
- Moderación y reescritura de títulos existentes: el adaptador puede reescribir títulos que incumplen las normas de estilo (longitud excesiva, mayúsculas, emojis) manteniendo la información veraz del anuncio.
- Herramienta interna para equipos de contenido: dado el bajo coste computacional de un modelo de 1.700 millones de parámetros y un adaptador de 0,1 GB, puede desplegarse en estaciones de trabajo o en un servicio ligero para generar borradores que un editor humano revisa.
- Investigación sobre alineamiento y fidelidad factual: al formar parte de una cadena SFT → DPO → GRPO con métricas de alucinación y estilo publicadas, sirve como caso de estudio reproducible para evaluar técnicas de ajuste fino con restricciones duras de fidelidad.
- Filtrado previo en pipelines de datos: puede usarse para etiquetar o normalizar títulos de anuncios en conjuntos de datos públicos de Inside Airbnb antes de un análisis posterior.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a 500 anuncios reservados de anfitriones no vistos en entrenamiento. La win rate es una preferencia por pares evaluada con `claude-sonnet-5-5` frente al título original del anfitrión (orden intercambiado, empates = ½), con intervalo de confianza bootstrap del 95%. La fila de este adaptador es la de SFT.

| Sistema | Win rate vs original (IC 95%) | Alucinación ↓ | ≤50 caracteres ↑ | Problemas de estilo ↓ |
|---|---|---|---|---|
| Original (anfitrión) | — | 3,0% | 100,0% | 2,4% |
| Modelo base | 36,1% (32,1%-40,2%) | 4,0% | 23,8% | 0,4% |
| SFT (este adaptador) | 65,3% (61,3%-69,4%) | 0,8% | 97,2% | 0,0% |
| SFT + DPO | 68,5% (64,4%-72,3%) | 0,2% | 99,8% | 0,0% |
| SFT + GRPO | 67,7% (63,8%-71,4%) | 0,2% | 100,0% | 0,0% |

El propio autor advierte que, en 50 pares etiquetados manualmente, el juez coincidió con el autor el 64% de las veces (IC 95% 50-78%, κ de Cohen = 0,29); por tanto, las win rates deben interpretarse como "Sonnet lo prefiere", no como una preferencia humana verificada. Las columnas de alucinación, longitud y estilo son basadas en reglas y no dependen del juez.

## Requisitos de hardware

- El adaptador pesa aproximadamente 0,1 GB; el modelo base Qwen3-1.7B en bf16 ocupa alrededor de 3,4 GB de VRAM, por lo que la inferencia completa cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); para cuantizaciones de 8 bits o 4 bits del base, basta con 4-6 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; también se entrenó en un Apple M4 con 24 GB de memoria unificada.
- Opciones de despliegue: transformers + PEFT (carga del adaptador y `merge_and_unload()`), vLLM, TGI y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| title-optimizer-sft (este) | 1.7B (base) + LoRA | No disponible | Títulos de Airbnb con control de fidelidad | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-1.7B (base) | 1.7B | No disponible | Modelo generalista de texto | Apache 2.0 | Hugging Face |
| SFT + DPO (misma familia) | 1.7B (base) + LoRA | No disponible | Títulos con menor alucinación (0,2%) | Apache 2.0 | No disponible como adaptador independiente en la información proporcionada |
| SFT + GRPO (misma familia) | 1.7B (base) + LoRA | No disponible | Títulos con 100% de cumplimiento de longitud | Apache 2.0 | No disponible como adaptador independiente en la información proporcionada |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La comprobación de alucinaciones es léxica (22 tipos de afirmación): no detecta paráfrasis y no puede verificar afirmaciones numéricas ("3BR") ni de ubicación ("5 min to the beach").
- Entrenado únicamente con anuncios en inglés de Londres, Nueva York, Sídney, Toronto y Dublín; el rendimiento en otros idiomas o mercados no está validado.
- El juez automático no es un huésped: no se ha medido el click-through real, y la concordancia con etiquetado humano es moderada (κ = 0,29).
- Riesgo de alucinación residual del 0,8% en el conjunto de evaluación, medido con el comprobador léxico, por lo que el riesgo real podría ser mayor.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base Qwen3-1.7B.
- Es un adaptador especializado de una sola tarea: no debe esperarse de él razonamiento general, código, matemáticas ni soporte multilingüe.
- El adaptador debe aplicarse sobre la versión exacta del base Qwen/Qwen3-1.7B; cambios en el tokenizador o en el modo de razonamiento pueden alterar el comportamiento.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/pulkit-thukral/title-optimizer-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/pulkit-thukral/listing-title-optimizer
- Repositorio del proyecto: https://github.com/PulkitT01/listing-title-optimizer
- System prompt y formato de anuncio: https://github.com/PulkitT01/listing-title-optimizer/blob/main/src/title_optimizer/prompts.py

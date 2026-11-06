# iromu/Qwen2.5-1.5B-openjev-NVFP4

## Resumen

Qwen2.5-1.5B-openjev-NVFP4 es un modelo de lenguaje compacto especializado en tareas de decisión tipada (typed-decision) y clasificación de etiqueta única, publicado por el usuario iromu en Hugging Face. Se trata de una cuantización NVFP4 (formato de punto flotante de 4 bits de NVIDIA) del modelo `iromu/Qwen2.5-1.5B-openjev`, que a su vez es un fine-tuning con LoRA de `Qwen/Qwen2.5-1.5B`. El entrenamiento se realizó sobre el corpus tipado `ZefanCai/Open-Jev`, donde cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre ellas, con el objetivo de emitir la opción de mayor probabilidad como una única letra de etiqueta.

La relevancia de este checkpoint radica en dos puntos. Primero, está diseñado específicamente para servir en hardware de clase GB10 (como las estaciones DGX Spark), donde la memoria es limitada y la cuantización FP4 permite despliegues con huella mínima (el repo ocupa solo 1,2 GB). Segundo, incluye una validación rigurosa: la cuantización NVFP4 se mide contra el modelo BF16 original tanto en precisión de clasificación (84,1 % frente a 85,2 %, una caída de solo 1,1 puntos porcentuales) como en coherencia probabilística medida con JevBench (38,0 frente a 38,5), demostrando que la cuantización es prácticamente indolora para esta tarea.

No es un modelo de propósito general: su autor deja claro que no pretende sustituir a modelos Qwen más grandes, sino servir como un emisor fiable de etiquetas de decisión en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), fine-tuned con LoRA |
| Parametros totales | 888.616.448 (según safetensors; el checkpoint cuantizado almacena los pesos lineales en FP4 empaquetado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (longitud máxima usada en el entrenamiento) |
| Tipos de cuantizacion | NVFP4 (W4A16: pesos FP4 de 4 bits, activaciones bf16); escalas por grupo F8_E4M3, escala global F32; `lm_head` y `model.embed_tokens` en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos FP4 empaquetados como U8, dos valores FP4 por byte), con `hf_quant_config.json` |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B, un transformer decoder de la familia Qwen2.5 de Alibaba. Sobre él se aplicó un fine-tuning supervisado (SFT) con LoRA usando el framework NeMo-RL de NVIDIA, con la entropía cruzada enmascarada al turno del asistente mediante la plantilla de chat de decisión. La configuración de LoRA fue: rango 32, alpha 32, dropout 0,05, aplicado a los módulos proyectores (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). Se entrenó durante 1191 pasos (una época) con longitud máxima de secuencia de 4096 tokens, precisión bfloat16, optimizador AdamW con tasa de aprendizaje 5e-5 y weight decay 0,01, planificación de 100 pasos de calentamiento lineal seguida de decaimiento coseno hasta 1e-6, y tamaño de lote global de 64 (micro-lote de 2).

El conjunto de entrenamiento fue la partición `train` del corpus `ZefanCai/Open-Jev`, un corpus de decisiones tipadas donde cada fila contiene un estado, una pregunta, un conjunto de opciones y una distribución de probabilidad sobre las opciones; el objetivo es la opción con mayor probabilidad (argmax), escrita como una única letra de etiqueta.

La innovación principal de este checkpoint es la cuantización NVFP4, generada con NVIDIA ModelOpt (configuración `W4A16_NVFP4_CFG`) y exportada con `export_hf_checkpoint`. El formato NVFP4 empaqueta los pesos FP4 como U8 (dos valores por byte), con escalas por grupo en F8_E4M3 y una escala global en F32. Un detalle técnico relevante: se eligió W4A16 (cuantización solo de pesos) en lugar de W4A4 porque las configuraciones W4A4 usan un cuantizador dinámico de entradas que no exporta un `input_scale` estático, lo que provoca que la ruta W4A4 de vLLM lea esa escala de un tensor sin inicializar y genere salida degenerada. W4A16 no necesita `input_scale`, lo que hace el checkpoint cargable por vLLM.

## Capacidades

- Clasificación de etiqueta única: el modelo está afinado para responder a un prompt de decisión tipada con una sola letra de etiqueta, con una tasa de emisión de letra del 100 % (3495/3495 en la partición de validación).
- Selección de opción argmax: dada una distribución de probabilidad sobre opciones, identifica la de mayor probabilidad con un 84,1 % de acierto en validación (greedy decoding).
- Coherencia probabilística: evaluado con JevBench (suite `jevbench-mini`, 50 leyes metamórficas de probabilidad y elección), obtiene una puntuación global de 38,0, con especial fortaleza en coherencia lógica (LOG: 70,8) y consistencia de representación (REP: 57,5).
- Generación de texto conversacional: etiquetado con pipeline `text-generation` y tag `conversational`, aunque su uso previsto se limita a tareas de decisión y clasificación.
- No soporta (no se documenta): visión, audio, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Enrutado de decisiones en pipelines de IA: el modelo puede actuar como clasificador ligero que selecciona una opción entre varias alternativas (por ejemplo, enrutar una consulta a un agente especializado) emitiendo una única letra de etiqueta, con latencia y coste mínimos.
- Servicio en hardware de memoria limitada: gracias a la cuantización NVFP4 (repo de 1,2 GB), es adecuado para despliegues en hardware de clase GB10 como NVIDIA DGX Spark, donde los modelos BF16 grandes no caben cómodamente.
- Evaluación de coherencia probabilística: puede usarse como sujeto de prueba en benchmarks metamórficos como JevBench para estudiar si los modelos preservan las leyes de probabilidad bajo transformaciones.
- Clasificación de texto en producción con vLLM: el checkpoint está diseñado para servirse con `vllm serve --quantization modelopt_fp4`, lo que permite integrarlo en infraestructuras de inferencia de alto rendimiento existentes.
- Simulación y toma de decisiones con distribuciones: dado que el corpus de entrenamiento incluye distribuciones de probabilidad sobre opciones, el modelo es útil en escenarios de decisión bajo incertidumbre donde se necesita seleccionar la opción más probable.
- Investigación en cuantización FP4: al incluir una validación comparativa BF16 frente a NVFP4 (precisión y coherencia), sirve como referencia reproducible para estudiar el impacto de la cuantización W4A16 en tareas de clasificación.
- Generación sintética de etiquetas a gran escala: su 100 % de tasa de emisión de letra válida lo hace adecuado para anotación automática masiva donde un formato de salida estricto es crítico.

## Benchmarks y rendimiento

Resultados de validación sobre la partición `validation` de Open-Jev (3.495 filas, decodificación greedy, capacidad de 384 tokens):

| Modelo | Cuantización | Letra emitida | Letra correcta | Δ correcto vs BASE |
|---|---|---|---|---|
| Qwen2.5-1.5B-openjev | BF16 | 3495/3495 (100,0 %) | 2979/3495 (85,2 %) | (predecesor) |
| Qwen2.5-1.5B-openjev | NVFP4 (W4A16) | 3495/3495 (100,0 %) | 2939/3495 (84,1 %) | −1,1 pp |

Coherencia probabilística medida con JevBench (`jevbench-mini`, 50 leyes, tolerancia 0,05, temperatura 1,0, lectura de logprobs de la letra de opción vía vLLM):

| Modelo | Global | Δ vs BF16 | REP | BAT | MEA | LOG | CHO |
|---|---|---|---|---|---|---|---|
| BF16 | 38,5 | — | 59,2 | 31,7 | 14,5 | 67,9 | 19,4 |
| NVFP4 (W4A16) | 38,0 | −0,5 | 57,5 | 30,8 | 14,2 | 70,8 | 16,7 |

REP es consistencia de representación, BAT independencia de lote, MEA coherencia de medida de probabilidad, LOG coherencia lógica y CHO coherencia de conjunto de elección; Global es la media de las cinco. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo completo ocupa 1,2 GB (pesos FP4 empaquetados más escalas); con activaciones bf16, embedding y lm_head en bf16, y KV cache, se estima que 2-4 GB de VRAM son suficientes para inferencia con contexto de 4096 tokens (estimación, dato exacto no disponible).
- GPU recomendadas: hardware de clase GB10 (NVIDIA DGX Spark) es el objetivo declarado; también debería funcionar en GPUs NVIDIA con soporte FP4 en vLLM (H100, RTX 50-series, B100/B200). Compatibilidad con GPUs sin soporte nativo FP4 no está documentada.
- Consumer GPU: dado el tamaño de 1,2 GB, debería caber en prácticamente cualquier GPU moderna de consumo con varios GB de VRAM, siempre que el runtime soporte NVFP4 (dato no verificado explícitamente).
- Despliegue: vLLM con `--quantization modelopt_fp4` es la vía documentada:
  ```bash
  vllm serve iromu/Qwen2.5-1.5B-openjev-NVFP4 --quantization modelopt_fp4
  ```
  También mediante la API Python de vLLM (`LLM(model=..., quantization="modelopt_fp4")`). Existen artefactos hermanos para otros runtimes: el modelo BF16 (`iromu/Qwen2.5-1.5B-openjev`) para transformers/HF y cuantizaciones GGUF (`iromu/Qwen2.5-1.5B-openjev-GGUF`) para llama.cpp u Ollama, aunque este checkpoint NVFP4 concreto está orientado a vLLM.
- Latencia y throughput: no disponible (la validación se midió con decodificación greedy de flujo único, no throughput de servicio).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/Qwen2.5-1.5B-openjev-NVFP4 | ~1,5B (888,6M en safetensors cuantizado) | NVFP4 (W4A16) | Decisión tipada / clasificación de etiqueta única | Apache-2.0 | Hugging Face, vLLM |
| iromu/Qwen2.5-1.5B-openjev (BF16) | ~1,5B | BF16 | Decisión tipada / clasificación de etiqueta única | Apache-2.0 | Hugging Face, transformers |
| iromu/Qwen2.5-1.5B-openjev-GGUF | ~1,5B | GGUF (varios niveles) | Decisión tipada / clasificación de etiqueta única | Apache-2.0 | Hugging Face, llama.cpp/Ollama |
| Qwen/Qwen2.5-1.5B (base) | 1,5B | BF16 y variantes comunitarias | Propósito general | Apache-2.0 (Qwen2.5-1.5B) | Hugging Face, múltiples runtimes |

Frente a la variante BF16, la versión NVFP4 sacrifica 1,1 pp de precisión de clasificación y 0,5 puntos de coherencia JevBench a cambio de una huella de memoria drásticamente menor. Frente al modelo base Qwen2.5-1.5B, este checkpoint es un especialista: pierde generalidad conversacional pero gana fiabilidad de formato (100 % de emisión de letra válida) en su tarea objetivo.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor indica explícitamente que no pretende reemplazar a modelos Qwen más grandes. Su uso fuera de tareas de decisión tipada y clasificación de etiqueta única no está validado.
- Debilidad en coherencia de medida de probabilidad (MEA): tanto en BF16 como en NVFP4, la dimensión MEA es la más débil (14,5 y 14,2 respectivamente); el emisor de letras es sobreconfiado y no preserva la media bajo transformación. No debe usarse como estimador de probabilidades, solo como selector argmax.
- Caída de precisión por cuantización: la versión NVFP4 pierde 1,1 pp de precisión respecto a BF16 (84,1 % frente a 85,2 %). Para cargas donde cada punto porcentual importe, considerar el modelo BF16.
- Compatibilidad de runtime restringida: el checkpoint NVFP4 está diseñado para vLLM con la ruta `modelopt_fp4`. La elección de W4A16 sobre W4A4 fue precisamente para evitar un bug en la ruta W4A4 de vLLM (salida degenerada por `input_scale` no inicializado); no se documenta compatibilidad con transformers, llama.cpp u otros runtimes para este formato.
- Idioma: el modelo está etiquetado solo para inglés; no hay garantías de funcionamiento en otros idiomas.
- Sesgos: no se documentan sesgos específicos, pero al derivar de Qwen2.5-1.5B y entrenarse sobre Open-Jev, heredará los sesgos de ambos; no disponible un análisis de sesgos.
- Riesgo de alucinación: bajo en su tarea objetivo (emite siempre una letra válida), pero no hay datos sobre comportamiento en prompts fuera de distribución.
- Licencia: Apache-2.0, sin restricciones para uso comercial.
- Contexto: la longitud de 4096 tokens corresponde a la usada en entrenamiento; el contexto nativo de Qwen2.5-1.5B puede ser mayor, pero no hay validación más allá de 4096.

## Enlaces

- Modelo NVFP4: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-NVFP4
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev
- Cuantizaciones GGUF: https://huggingface.co/iromu/Qwen2.5-1.5B-openjev-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- JevBench (benchmark de coherencia): https://github.com/JevBench/jevbench

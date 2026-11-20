# shiva123782/Chatgptastra4

## Resumen

Chatgptastra4 es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 (identificado como "Ram" en la model card) bajo el sello "Kaveri AI VAPAE Engine". Se trata de un adaptador PEFT, no de un modelo completo: requiere cargar el modelo base Qwen2.5-0.5B-Instruct y superponer los pesos LoRA para la inferencia. El modelo base es un transformer causal decoder-only de 0,5 mil millones de parámetros, por lo que el conjunto resultante mantiene ese tamaño y una ventana de contexto heredada del base.

El modelo se presenta como un "Sovereign Enterprise Small Language Model" con certificaciones declaradas por el autor (verificación formal Z3, benchmark de identidad de 20 crore de consultas, conformidad con el artículo 53 del EU AI Act y la sección 12 de la DPDP india). Estas afirmaciones proceden exclusivamente de la model card y no cuentan con respaldo independiente en la información disponible. El ajuste se realizó sobre el dataset yahma/alpaca-cleaned con LoRA de rango 16 y alpha 32, apuntando a un uso de generación de texto conversacional en inglés con fines empresariales.

Su relevancia práctica es limitada pero concreta: ofrece un adaptador ligero y de licencia Apache 2.0 que puede ejecutarse en hardware muy modesto (el autor reporta 3,2 GB de VRAM en entrenamiento y 18,2 ms de latencia P99 en un equipo de escritorio), lo que lo hace apto para prototipado rápido, despliegue en el borde o experimentación con técnicas de ajuste eficiente en parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parámetros totales | 0,5 mil millones (modelo base); adaptador LoRA de rango 16 sobre módulos de proyección lineales |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | 4-bit NormalFloat (NF4) según la model card; compatible con cuantizaciones estándar del base (no detalladas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT/LoRA (safetensors, según convención de la librería peft); requiere el base en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Qwen2.5-0.5B-Instruct, un transformer causal decoder-only. El adaptador emplea rango r=16, alpha=32, dropout 0,05 y LoRA+ con η_B = 8,0 · η_A, aplicado sobre los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizó en precisión bfloat16/float16 con paso forward cuantizado en 4-bit NF4, con un pico de VRAM de 3,2 GB según el autor, lo que permite entrenar en una T4 de Kaggle (15,5 GB) o en GPUs de consumo.

El dataset de ajuste es yahma/alpaca-cleaned, un corpus de instrucciones en inglés derivado de Alpaca. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. La model card declara verificación formal con Z3 SMT ("UNSAT_SAFE, 0 OOM") y un benchmark de identidad biyectiva de Feistel a escala de 20 crore (200 millones) de consultas con 100 % de retención de identidad y 0 % de fuga del proveedor base; estas métricas no son verificables de forma independiente con los datos aportados y deben tratarse como afirmaciones del autor.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat compatible con las plantillas de Qwen (`<|im_start|>` / `<|im_end|>`).
- Instrucciones de un solo turno y conversaciones multi-turno básicas, heredadas del ajuste sobre Alpaca.
- Razonamiento y respuesta a preguntas de complejidad baja a moderada, limitado por el tamaño de 0,5 B parámetros del base.
- Generación de código y matemáticas básicas, con fiabilidad limitada por la escala del modelo.
- Identidad de modelo personalizada: el autor declara una retención de identidad del 100 % y cero fuga del proveedor base en su benchmark interno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el adaptador se carga sobre Qwen2.5-0.5B-Instruct en pocos segundos y permite iterar sobre prompts y respuestas en un portátil con GPU modesta, gracias a su bajo requisito de VRAM.
- Despliegue en el borde o en dispositivos con recursos limitados: con 0,5 B parámetros y cuantización 4-bit, cabe en GPUs de consumo e incluso en entornos embebidos, lo que lo hace útil para asistentes locales sin conexión.
- Generación de texto de bajo coste en pipelines por lotes: el autor reporta 198+ tok/s en un equipo de escritorio, adecuado para tareas de clasificación, resumen o reescritura de alto volumen donde la latencia no es crítica.
- Base para experimentación con LoRA y LoRA+: sirve como referencia didáctica para estudiar el flujo completo de ajuste eficiente en parámetros, desde la carga del adaptador hasta la evaluación de identidad.
- Cumplimiento y auditoría de identidad de modelo: el benchmark de identidad declarado por el autor puede usarse como plantilla para verificar que un ajuste fino no filtra la identidad del proveedor base en entornos empresariales.
- Chatbot de atención al cliente de dominio acotado en inglés: con instrucciones específicas y un contexto de sistema bien definido, puede gestionar consultas frecuentes, aunque su ventana de contexto y su fiabilidad factual limitan el alcance.
- Evaluación comparativa de adaptadores ligeros: útil como línea base de bajo coste frente a modelos mayores en pruebas de calidad percibida y latencia.

## Benchmarks y rendimiento

La información disponible solo incluye el benchmark interno de identidad del autor, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K, etc.).

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| Identidad biyectiva 1K | 100,0 % retención, 0,0 % fuga | Afirmación del autor |
| Identidad biyectiva 1L (100 000) | 100,0 % retención, 0,0 % fuga | Afirmación del autor |
| Identidad biyectiva 1Cr (10 000 000) | 100,0 % retención, 0,0 % fuga | Afirmación del autor |
| Identidad biyectiva 10Cr (100 000 000) | 100,0 % retención, 0,0 % fuga | Afirmación del autor |
| Identidad biyectiva 20Cr (200 000 000) | 100,0 % retención, 0,0 % fuga | Afirmación del autor |
| Latencia de inferencia | 18,2 ms (P99) | Equipo de escritorio estándar, según el autor |
| Throughput | 198+ tok/s | Según el autor |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1 GB en fp16 para el base de 0,5 B más el adaptador LoRA (que añade decenas de MB); en 4-bit NF4 se reduce a unos 0,5-0,7 GB.
- VRAM para entrenamiento: 3,2 GB de pico según el autor, con cuantización 4-bit NF4 y LoRA.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (flujo oficial de la model card), llama.cpp y Ollama tras fusionar el adaptador con el base y convertir a GGUF, vLLM y TGI tras fusionar los pesos (el adaptador PEFT debe combinarse previamente).
- Latencia y throughput: 18,2 ms P99 y 198+ tok/s reportados por el autor en un equipo de escritorio estándar; no se especifican las características exactas del hardware de medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chatgptastra4 | 0,5 B (+ LoRA r=16) | no disponible | Apache 2.0 | Hugging Face (adaptador PEFT) | Ajuste sobre Alpaca; métricas solo del autor |
| Qwen2.5-0.5B-Instruct | 0,5 B | 32 768 tokens (según documentación del base) | Apache 2.0 | Hugging Face | Modelo base; benchmarks estándar publicados por Qwen |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (según documentación del base) | Apache 2.0 | Hugging Face | Mayor capacidad con coste de VRAM todavía bajo |
| SmolLM2-360M-Instruct | 0,36 B | 8 192 tokens (según documentación del modelo) | Apache 2.0 | Hugging Face | Alternativa de Hugging Face para el mismo nicho de SLM |

## Limitaciones y advertencias

- El modelo es un adaptador LoRA, no un modelo autónomo: sin el base Qwen2.5-0.5B-Instruct no es utilizable, y la fusión de pesos es un paso previo obligatorio para muchos motores de inferencia.
- Con 0,5 B parámetros, la capacidad de razonamiento, matemáticas y código es intrínsecamente limitada; no es adecuado para tareas que requieran precisión factual alta.
- Riesgo de alucinación elevado, especialmente en dominios especializados y en preguntas que exijan conocimiento actualizado.
- El ajuste se realizó sobre yahma/alpaca-cleaned, un dataset pequeño y de calidad heterogénea; el modelo puede reproducir sesgos y errores presentes en ese corpus.
- Soporte exclusivo del inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado.
- Las certificaciones declaradas (Z3, EU AI Act artículo 53, DPDP 2025, benchmark de 20 crore) no han sido verificadas de forma independiente y deben tratarse con cautela en contextos de cumplimiento real.
- La model card incluye afirmaciones de marketing ("state-of-the-art", "soberano") que no se corresponden con la escala del modelo ni con benchmarks estándar publicados.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario debe verificar por su cuenta el cumplimiento normativo que el autor declara.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Chatgptastra4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Librería PEFT: https://github.com/huggingface/peft
- Documentación de Qwen2.5: https://qwen.readthedocs.io/
- Referencias citadas en la model card (evaluation_report.md, EU_AI_ACT_MODEL_CARD.md, trust_certificate.json): no disponibles como enlaces públicos verificables en la información proporcionada.

# CentIo/Cent1-1B

## Resumen

Cent1-1B es un modelo de lenguaje compacto especializado en *tool calling* y razonamiento numérico sobre estados financieros, desarrollado por CentIo. Se obtiene por ajuste fino supervisado de Qwen/Qwen3-1.7B y está pensado para un problema muy concreto: dado un turno de usuario y un conjunto de esquemas de herramientas, elegir la función correcta y emitir una llamada bien formada con argumentos tipados correctamente, o bien responder conversacionalmente cuando ninguna herramienta resulta apropiada.

La arquitectura es un transformer denso de tipo Qwen3 con 1.720.574.976 parámetros reales (embeddings atados), 28 capas, tamaño oculto 2048 y una ventana de contexto de 40.960 tokens. Su huella en fp16 ronda los 3,4 GB, lo que permite ejecutarlo en una única GPU de consumo o en una T4 gratuita. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors compatibles con `transformers`.

Su relevancia actual radica en que demuestra una mejora medible y acotada en el enlace de argumentos (*argument binding*) sobre su modelo base, sin necesidad de escalar de tamaño. No obstante, el propio autor documenta una regresión clara en razonamiento numérico (FinQA), por lo que debe tratarse como enrutador y formateador de llamadas, no como calculadora.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 dense transformer, 28 capas, hidden size 2048 |
| Parámetros totales | 1.720.574.976 (embeddings atados) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantización | no disponible (la model card solo documenta fp16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso causal de la familia Qwen3 con 28 capas, dimensión oculta 2048 y embeddings atados, y se ajusta mediante *fine-tuning* supervisado para la tarea de *tool calling* financiero. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible.

La innovación técnica principal no reside en la arquitectura, sino en el protocolo de uso: Cent1-1B se ajustó con el canal de razonamiento nativo de Qwen3 desactivado, de modo que emite directamente la llamada en formato `<tool_call>{"name": ..., "arguments": {...}}</tool_call>` sin bloque ` thinking` previo. Por eso es imprescindible pasar `enable_thinking=False` en `apply_chat_template`; omitir el flag sitúa al modelo en un formato de prompt distinto al de entrenamiento y degrada tanto el formato de la llamada como la precisión de enrutamiento.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas directas cuando no procede invocar ninguna herramienta.
- *Tool calling* y *function calling*: selección de función y emisión de llamadas con argumentos tipados conforme a esquemas JSON.
- Enrutamiento de peticiones hacia funciones de backend en flujos de análisis financiero.
- Razonamiento numérico básico sobre cifras de estados financieros (cálculo de ratios, variaciones), con las limitaciones indicadas en la sección de benchmarks.
- Soporte de flujos agénticos de un solo paso: el modelo decide entre llamar a una herramienta o responder.
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Enrutador de herramientas en asistentes financieros: dado un catálogo de funciones (cálculo de márgenes, extracción de partidas, conversión de divisas), el modelo selecciona la adecuada y rellena los argumentos, lo que reduce la lógica de enrutamiento manual en el backend.
- Extracción de cifras de estados financieros: se define una herramienta `extract_line_item` y el modelo emite la llamada con el nombre de la partida y el periodo como argumentos, integrándose en un pipeline de ingesta documental.
- Cálculo de ratios y variaciones: el modelo formula la llamada a funciones de cálculo (`calculate_net_margin`, variaciones interanuales) en lugar de intentar la aritmética por sí mismo, que es precisamente el patrón para el que fue ajustado.
- Automatización de *back office* contable: clasificación de peticiones entrantes (consulta de saldos, conciliación, informes) y derivación a la función correspondiente con argumentos validables por tipo.
- Despliegue en entornos con recursos limitados: con ~3,4 GB en fp16 cabe en una T4 o en una GPU de consumo, lo que permite ejecutar el enrutador en local o en *edge* sin depender de APIs externas.
- Prototipado de agentes multi-paso: al ser un modelo pequeño y rápido, sirve como primer eslabón de un agente donde la planificación compleja se delega a un modelo mayor y Cent1-1B resuelve la selección de herramienta y el formateo de la llamada.
- Evaluación comparativa de pipelines de *tool calling*: su licencia Apache 2.0 y su tamaño permiten usarlo como referencia reproducible en pruebas de regresión de sistemas de funciones.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificación voraz y la misma suite para todos los modelos.

| Modelo | Parámetros | BFCL v3 simple ↑ | MMLU finance ↑ | FinQA ↑ |
|---|---|---|---|---|
| Cent1-1B (ours) | 1.7B | 0.7225 | 0.5756 | 0.0220 |
| Qwen3-1.7B (base) | 1.7B | 0.6750 | 0.5476 | 0.0549 |
| Qwen3-0.6B | 0.6B | 0.5475 | 0.4449 | 0.1209 |
| Qwen3-4B | 4B | 0.7375 | 0.7276 | 0.3407 |

Desglose de BFCL v3 simple:

| Modelo | Emitió llamada | Nombre de función correcto | Argumentos correctos | Exact match |
|---|---|---|---|---|
| Cent1-1B (ours) | 0.9950 | 0.9875 | 0.7250 | 0.7225 |
| Qwen3-1.7B (base) | 1.0000 | 0.9975 | 0.6775 | 0.6750 |
| Qwen3-0.6B | 0.9975 | 0.9950 | 0.5500 | 0.5475 |
| Qwen3-4B | 0.9950 | 0.9925 | 0.7400 | 0.7375 |

Lectura de los datos: la mejora sobre el base se concentra en el enlace de argumentos (+4,75 puntos), mientras que la precisión del nombre de función es ligeramente inferior (0,9875 frente a 0,9975). El modelo queda a 1,5 puntos de Qwen3-4B en BFCL v3 simple pese a ser 2,4 veces menor. En FinQA retrocede de 0,0549 a 0,0220 (2 aciertos de 91 frente a 5), una debilidad real: el formato de respuesta es correcto y conciso, pero los valores numéricos son erróneos.

## Requisitos de hardware

- VRAM estimada: ~3,4 GB en fp16 para los pesos; con overhead de activaciones y caché KV conviene reservar entre 5 y 6 GB para contexto moderado.
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3060/4060/4090, A10, L4; para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en fp16; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 4-6 GB, aunque la model card no publica artefactos cuantizados.
- Opciones de despliegue: `transformers` (fp16, `device_map="auto"`), vLLM (`vllm serve CentIo/Cent1-1B --dtype float16 --max-model-len 8192`), SGLang, y TGI por los tags del repositorio. No se documentan artefactos GGUF ni soporte explícito de Ollama o llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL v3 simple | MMLU finance | FinQA | Licencia |
|---|---|---|---|---|---|---|
| Cent1-1B | 1.7B | 40.960 | 0.7225 | 0.5756 | 0.0220 | Apache 2.0 |
| Qwen3-1.7B (base) | 1.7B | no disponible en la información | 0.6750 | 0.5476 | 0.0549 | Apache 2.0 |
| Qwen3-0.6B | 0.6B | no disponible en la información | 0.5475 | 0.4449 | 0.1209 | Apache 2.0 |
| Qwen3-4B | 4B | no disponible en la información | 0.7375 | 0.7276 | 0.3407 | Apache 2.0 |

Frente a su base, Cent1-1B gana en enrutamiento con argumentos y conocimiento financiero, pero pierde en razonamiento numérico. Frente a Qwen3-4B, queda cerca en *tool calling* pero muy por debajo en conocimiento de dominio y en FinQA, a cambio de una huella de memoria mucho menor.

## Limitaciones y advertencias

- No es una calculadora: FinQA cae a 0,0220, con valores a menudo incorrectos por márgenes pequeños. Verificar toda cifra antes de actuar sobre ella.
- La precisión del nombre de función es marginalmente inferior a la del modelo base (0,9875 frente a 0,9975); en catálogos de herramientas muy amplios o con nombres similares puede confundir la selección.
- Requiere `enable_thinking=False`; usar el template por defecto de Qwen3 degrada el formato de llamada y el enrutamiento.
- Idioma limitado al inglés según la model card; no se documenta soporte de castellano.
- No se detallan sesgos conocidos ni composición del dataset de ajuste, lo que dificulta evaluar riesgos de sesgo de dominio.
- Riesgo de alucinación inherente a un modelo de 1,7B, especialmente en cifras y en conocimiento financiero específico.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar los avisos de atribución y verificar el cumplimiento de la licencia del modelo base.
- Para producción en finanzas, tratar la salida como propuesta de llamada sujeta a validación de esquema y de rangos numéricos en el backend.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CentIo/Cent1-1B
- Organización CentIo: https://huggingface.co/CentIo
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

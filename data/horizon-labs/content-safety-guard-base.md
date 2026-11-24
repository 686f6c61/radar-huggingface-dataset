# Horizon-Labs/content-safety-guard-base

## Resumen

Content Safety Guard (base) es un clasificador de texto de 308M de parámetros desarrollado por Horizon Labs, diseñado para detectar contenido inseguro tanto en prompts de usuario como en respuestas de modelos dentro de aplicaciones LLM. Se construye sobre la arquitectura ModernBERT, empleando el backbone multilingüe mmBERT de JHU, y devuelve una puntuación global de inseguridad junto con 15 categorías de daño independientes mediante sigmoides separadas: odio, acoso, violencia, armas, contenido sexual, abuso de menores, autolesión, planificación criminal, drogas, privacidad, blasfemia, fraude/manipulación, desinformación, consejo no autorizado y otros.

El modelo resuelve un problema operativo concreto: la necesidad de un filtro de seguridad de baja latencia que pueda ejecutarse en CPU o incluso en el navegador, delante o detrás de cualquier LLM, sin depender de un modelo generativo grande como juez. Frente a aproximaciones basadas en clasificadores de toxicidad de propósito estrecho, este guard cubre un espectro amplio de categorías y admite evaluación contextual de pares (prompt, respuesta), lo que permite juzgar si una respuesta es insegura en el contexto de la pregunta que la originó.

Su relevancia actual radica en la combinación de licencia Apache-2.0, entrenamiento exclusivo con datos de uso comercial permitido, soporte multilingüe amplio (entrenado en 12 idiomas humanos, traducciones a 20 y prompts multilingües reales) y disponibilidad en ONNX (fp32 e int8 de 641 MB) para despliegue en transformers.js y entornos sin GPU. Existe una variante pequeña de 141M con pérdidas de F1 de 0,012 y 0,027 en PolyGuard prompts y respuestas respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), backbone mmBERT |
| Parametros totales | 307.542.544 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX), int8 (ONNX cuantizado) |
| Idiomas soportados | multilingual, en, ar, de, es, fr, hi, it, ja, ko, nl, th, zh, pt, ru, pl, cs, sv, uk, tr, he, sr, tl, am, tt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT sobre el backbone multilingüe mmBERT-base de JHU. La cabeza de clasificación produce una puntuación global `unsafe` más 15 salidas de categoría mediante sigmoides independientes, lo que permite que varias categorías se activen simultáneamente para un mismo texto. Acepta tanto un prompt aislado como un par (prompt, respuesta) para evaluar la respuesta en contexto. El repositorio incluye un fichero `thresholds.json` con umbrales por categoría calibrados sobre un split de validación; la regla de decisión por defecto es marcar como inseguro cuando `unsafe >= 0.5`.

El entrenamiento utiliza exclusivamente datos con licencia que permite uso comercial: nvidia/Nemotron-Safety-Guard-Dataset-v3, allenai/WildChat-1M, OpenAssistant/oasst2, CohereForAI/aya_dataset, OpenSafetyLab/Salad-Data, JailbreakBench/JBB-Behaviors y google/civil_comments. La model card indica entrenamiento sobre 12 idiomas de datos adaptados por humanos, traducciones automáticas a 20 idiomas y prompts multilingües del mundo real. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo de 8B Qwen3Guard-Gen aparece citado como teacher en la tabla de evaluación, lo que sugiere destilación, aunque el detalle del procedimiento no está documentado en la información proporcionada.

## Capacidades

- Clasificación de seguridad de prompts de usuario aislados, con puntuación global y 15 categorías de daño.
- Evaluación de respuestas de modelo en contexto mediante pares (prompt, respuesta).
- Detección multilingüe: entrenado en 12 idiomas humanos y traducciones a 20; evaluado en 17 idiomas (PolyGuard), 14 (textdetox) y 8 (Aya).
- Categorías independientes mediante sigmoides: hate, harassment, violence, weapons, sexual, sexual_minors, self_harm, criminal_planning, drugs, privacy, profanity, fraud_manipulation, misinformation, unauthorized_advice, other.
- Umbrales por categoría ajustables mediante `thresholds.json`, con posibilidad de subir o bajar el umbral global para priorizar precisión o recall.
- Inferencia en CPU y en navegador mediante ONNX y transformers.js (`dtype: "q8"`).
- Integración con el pipeline `text-classification` de transformers y con text-embeddings-inference.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Moderación de entrada en aplicaciones de chat: el clasificador se ejecuta delante del LLM para bloquear prompts inseguros antes de consumir tokens de generación, con una latencia de encoder pequeño apta para CPU.
- Moderación de salida en producción: se evalúa el par (prompt, respuesta) para detectar respuestas que, aisladas, parecerían inocuas pero son inseguras en contexto, como instrucciones peligrosas solicitadas de forma indirecta.
- Filtrado en aplicaciones edge o en el navegador: la versión ONNX int8 de 641 MB permite ejecutar el guard en transformers.js sin backend GPU, útil para clientes web que no pueden enviar texto a un servidor de moderación.
- Cumplimiento y auditoría de logs: procesamiento por lotes de conversaciones históricas para etiquetar categorías de daño y generar informes de riesgo por categoría con los umbrales calibrados.
- Protección de asistentes multilingües: cobertura de 17 idiomas en PolyGuard permite desplegar un único guard en productos con usuarios en árabe, hindi, japonés, coreano, tailandés, chino, ruso, ucraniano, turco, hebreo, serbio, tagalo, amárico y tártaro, entre otros.
- Enrutado y escalado humano: cuando la puntuación `unsafe` supera el umbral, el caso se deriva a revisión humana o a un modelo juez mayor, reduciendo coste frente a ejecutar un LLM juez en cada petición.
- Detección de fraude y manipulación en soporte al cliente: la categoría `fraud_manipulation` permite marcar mensajes que intentan engañar al agente o al usuario, integrándose en flujos de atención automatizada.
- Filtrado previo en pipelines de datos: limpieza de corpus de entrenamiento o de evaluación eliminando contenido inseguro antes de usarlo en fine-tuning.

## Benchmarks y rendimiento

F1 de la clase insegura con umbral 0,5. En las filas de recall se reporta la proporción de prompts inseguros detectados. Ninguno de estos benchmarks se usó en entrenamiento.

| Benchmark | Este modelo (308M) | Small (141M) | Qwen3Guard-Gen-0.6B strict | Qwen3Guard-Gen-0.6B loose | Vela-1.0-307M-Shield | granite-guardian-hap-125m | unbiased-toxic-roberta | Qwen3Guard-Gen-8B strict (teacher) |
|---|---|---|---|---|---|---|---|---|
| PolyGuard prompts, 17 idiomas | 0,783 | 0,771 | 0,821 | 0,791 | 0,829 | 0,003 | 0,002 | **0,846** |
| PolyGuard responses, 17 idiomas | 0,735 | 0,709 | 0,748 | 0,767 | 0,645 | 0,000 | 0,000 | **0,801** |
| BeaverTails responses (prompts no vistos) | 0,837 | 0,825 | 0,869 | 0,858 | 0,779 | 0,164 | 0,177 | **0,870** |
| ToxicChat (prompts reales) | 0,756 | **0,776** | 0,588 | 0,760 | 0,672 | 0,264 | 0,254 | 0,638 |
| OpenAI moderation set | 0,768 | 0,762 | 0,660 | **0,780** | 0,721 | 0,672 | 0,663 | 0,685 |

La información disponible se interrumpe en la fila XST, por lo que no se pueden reproducir los resultados restantes. La versión ONNX int8 coincide con fp32 en el 99,3% de las decisiones sobre una muestra de textos de benchmark (30 por benchmark), con diferencia media absoluta de puntuación de 0,0016.

## Requisitos de hardware

- VRAM estimada: al ser un encoder de 308M, la inferencia en fp32 requiere aproximadamente 1,2 GB de pesos; en fp16 alrededor de 0,6 GB. El ONNX int8 cuantizado ocupa 641 MB.
- GPU recomendadas: no requiere GPU. Funciona en CPU; para alto throughput se puede usar cualquier GPU moderna (RTX 4090, A100, H100) con batching.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM en fp32, y en CPU sin GPU.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime, transformers.js en navegador y Node, text-embeddings-inference, endpoints compatibles.
- Latencia y throughput: no se publican cifras concretas en la información disponible. La model card destaca que la variante small tiene menos cómputo por token y que la base es la más precisa de las dos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PolyGuard prompts | PolyGuard responses | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Content Safety Guard base | 308M | no disponible | 0,783 | 0,735 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| Content Safety Guard small | 141M | no disponible | 0,771 | 0,709 | Apache-2.0 | Hugging Face, ONNX int8 ~270 MB |
| Qwen3Guard-Gen-0.6B | 0,6B | no disponible | 0,821 (strict) / 0,791 (loose) | 0,748 (strict) / 0,767 (loose) | no disponible en la información | Hugging Face |
| Vela-1.0-307M-Shield | 307M | no disponible | 0,829 | 0,645 | no disponible en la información | Hugging Face |
| Qwen3Guard-Gen-8B | 8B | no disponible | 0,846 (strict) | 0,801 (strict) | no disponible en la información | Hugging Face |

El modelo base se sitúa por debajo de Qwen3Guard-Gen-0.6B en PolyGuard prompts y respuestas, pero lo supera ampliamente en ToxicChat (0,756 frente a 0,588 en strict) y en el conjunto de moderación de OpenAI (0,768 frente a 0,660 en strict). Frente a Vela-1.0-307M-Shield, pierde en prompts (0,783 frente a 0,829) pero gana en respuestas (0,735 frente a 0,645) y en BeaverTails (0,837 frente a 0,779). Los clasificadores de toxicidad como granite-guardian-hap-125m y unbiased-toxic-roberta obtienen puntuaciones cercanas a cero en PolyGuard, lo que confirma que abordan una tarea más estrecha.

## Limitaciones y advertencias

- Es un clasificador, no un generador: no explica el motivo de la clasificación ni produce texto justificativo.
- Las puntuaciones por categoría solo son significativas para textos marcados como inseguros y son pequeñas por diseño; usarlas sin el umbral calibrado de `thresholds.json` produce resultados poco fiables.
- El umbral por defecto de 0,5 puede generar falsas alarmas en dominios específicos; la model card recomienda ajustarlo según la tolerancia a falsos positivos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en prompts ambiguos o que suenan inseguros sin serlo (el ejemplo de la model card sobre matar un proceso de Python lo ilustra).
- La cobertura lingüística evaluada es amplia pero no universal; los 12 idiomas de entrenamiento humano y las 20 traducciones no garantizan un rendimiento homogéneo en todos ellos.
- No se documentan sesgos específicos ni auditorías de equidad en la información disponible.
- La licencia Apache-2.0 permite uso comercial, y el entrenamiento se restringe a datos con licencia compatible, pero el despliegue en producción requiere validación propia sobre la distribución real de tráfico.
- La información de benchmarks está incompleta (corte en la fila XST), por lo que no se puede verificar el rendimiento en el resto de conjuntos evaluados.
- No se especifica la longitud máxima de contexto soportada, lo que impide planificar el truncado de conversaciones largas con precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/content-safety-guard-base
- Variante small: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Guard de prompt injection: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Redactor de PII: https://huggingface.co/Horizon-Labs/pii-redactor-base
- Guard de alucinaciones: https://huggingface.co/Horizon-Labs/hallucination-guard-base
- Leaderboard de clasificadores de seguridad: https://huggingface.co/spaces/Horizon-Labs/content-safety-leaderboard
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base

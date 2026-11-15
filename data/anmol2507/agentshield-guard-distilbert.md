# Anmol2507/agentshield-guard-distilbert

## Resumen

AgentShield Guard es un clasificador de intenciones adversariales construido sobre `distilbert-base-uncased` mediante un esquema multi-tarea con dos cabezas de clasificación que comparten el estado `[CLS]` del backbone. Lo desarrolla el usuario Anmol2507 en el marco del Lexsi AI Safety Hackathon (Track 2a, Problem Statement 2a.3) y su función es analizar conversaciones multi-turno de agentes y documentos externos no confiables para detectar intentos de manipulación, jailbreak o inyección indirecta de prompts.

El modelo resuelve un problema acotado pero crítico en arquitecturas agénticas: proporcionar telemetría temprana de riesgo sobre entradas no confiables antes de que se ejecuten acciones privilegiadas. No es un mecanismo de autorización ni sustituye a un motor determinista de políticas de seguridad; su model card insiste explícitamente en esta separación. La relevancia actual deriva del auge de agentes que consumen documentos recuperados y ejecutan herramientas, superficie de ataque donde los clasificadores ligeros de intención aportan una capa adicional de señal.

Con 66 millones de parámetros (arquitectura DistilBERT de 6 capas, 12 cabezas de atención y dimensión oculta 768), longitud máxima de 256 tokens y licencia Apache 2.0, el modelo está pensado para despliegues de baja latencia y bajo coste. El repositorio ocupa 0,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT) multi-tarea con dos cabezas de clasificación sobre el `[CLS]` |
| Parametros totales | 66 millones (backbone DistilBERT base, 6 capas, 12 cabezas, hidden 768) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (truncación con padding a la derecha) |
| Tipos de cuantizacion | No disponible (pesos PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | No disponible (el backbone es `uncased` en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch`, safetensors no confirmado en la información disponible) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased` y añade dos cabezas paralelas sobre el estado `[CLS]` (768 dimensiones) tras un dropout de 0,2. La cabeza binaria proyecta 768→384 con ReLU, otro dropout de 0,2 y una capa final 384→2 para producir P(adversarial). La cabeza de categorías replica la estructura con salida 384→7 para las siete clases de vector de ataque (la model card solo detalla `benign`, `gradual_jailbreak` e `indirect_prompt_injection`; el resto no se enumera en la información disponible).

El ajuste fino se realizó sobre el dataset `agentshield-guard-dataset` (N=398) con un protocolo de partición anti-fuga: split 70/15/15 antes de cualquier aumento de datos, aumento aplicado solo al conjunto de entrenamiento y validación/test estrictamente sin aumento y sin solapamiento de familias con train. Los hiperparámetros incluyen longitud máxima de 256 tokens, batch de 8, learning rate 3e-5 con AdamW (β1=0,9, β2=0,999), weight decay 0,01, warmup del 10 % con decaimiento lineal, 3 épocas con early stopping en la época 2 y semilla fija 42. La pérdida combina la binaria más 0,8 veces la de categorías. No se documenta RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Clasificación binaria de intención: distingue entre entrada adversarial y benigna con una probabilidad continua en [0,1].
- Categorización multi-clase del vector de ataque en 7 categorías (se documentan `benign`, `gradual_jailbreak` e `indirect_prompt_injection`; el resto no disponible).
- Análisis de diálogos multi-turno de agentes, incluyendo manipulación progresiva a lo largo de varios turnos.
- Detección de inyección indirecta de prompts embebida en documentos recuperados (payloads pasivos en RAG).
- Detección de falsas autorizaciones, como tickets o mensajes que simulan aprobación administrativa para operaciones destructivas.
- Detección de jailbreaks directos del tipo "DAN mode" o instrucciones de anulación de restricciones.
- Salida apta para telemetría: puntuaciones de riesgo utilizables en logging, auditoría y mecanismos adaptativos de defensa.
- No soporta tool calling, generación de texto, visión, audio ni razonamiento multi-paso; es exclusivamente un clasificador.

## Casos de uso

- Filtro previo en pipelines RAG: cada documento recuperado se pasa por el clasificador antes de incorporarse al contexto del agente; un score alto de `indirect_prompt_injection` marca el fragmento para cuarentena o revisión, reduciendo la superficie de inyección pasiva.
- Telemetría de seguridad en plataformas agénticas: el modelo puntúa cada turno de la conversación y enriquece los logs de auditoría con la categoría de ataque predicha, permitiendo análisis forense posterior y detección de patrones de manipulación gradual.
- Segunda opinión sobre acciones privilegiadas: antes de ejecutar una herramienta destructiva, el motor de políticas consulta el score del Guard como señal adicional (nunca como autorización) y eleva el nivel de verificación si el score supera un umbral configurable.
- Detección de falsas autorizaciones en soporte interno: mensajes que alegan aprobaciones por ticket o por "admin" se clasifican como adversariales, disparando un flujo de verificación fuera de banda.
- Moderación de entradas de usuario en asistentes con acceso a herramientas: el clasificador actúa como primera capa de cribado de bajo coste (66 M de parámetros, 256 tokens) antes de invocar modelos mayores o sistemas de defensa más caros.
- Investigación en seguridad de IA: el modelo sirve como baseline reproducible (semilla 42, partición documentada) para comparar estrategias de detección de jailbreak en entornos agénticos multi-turno.
- Enriquecimiento de alertas SOC: integrado como microservicio de clasificación, etiqueta eventos de agente con categoría de ataque para priorizar la cola de revisión humana.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test independiente (N=22 muestras):

| Metrica | Valor |
|---|---|
| Accuracy (intención binaria) | 100,0 % |
| Precision | 100,0 % |
| Recall | 100,0 % |
| F1 | 100,0 % |
| ROC-AUC | 1,000 |
| PR-AUC | 1,000 |
| False Positive Rate | 0,0 % |
| False Negative Rate | 0,0 % |
| Accuracy (categorización, 7 clases) | 100,0 % |
| Macro F1 (categorización) | 1,000 |

Advertencia: el tamaño del conjunto de test (22 muestras) es muy reducido y los resultados perfectos deben interpretarse con cautela; no se aportan intervalos de confianza ni evaluaciones en conjuntos externos. No se han publicado comparaciones con otros modelos de guardrails en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (≈264 MB de pesos), aproximadamente 130 MB en FP16 y menos de 100 MB en INT8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, T4, L4, A10, A100 y H100, aunque el cuello de botella será el preprocesado y el tráfico, no el cómputo.
- Cabe en GPU de consumo y también en CPU: con 6 capas y 256 tokens, la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo con `transformers` (pipeline `text-classification`), TorchServe, FastAPI con batching, Triton Inference Server; vLLM, llama.cpp, Ollama y TGI no son aplicables de forma estándar a un clasificador de este tipo (no se documentan conversiones GGUF/ONNX).
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño y arquitectura se espera latencia de milisegundos por lote en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentShield Guard (este modelo) | 66 M | 256 tokens | Clasificación binaria + 7 categorías de ataque | Apache 2.0 | Hugging Face, 0 descargas |
| Llama Guard (Meta) | 7-8 B (según versión) | Contextos largos (miles de tokens) | Clasificación de seguridad de contenido | Licencia comunitaria Llama | Ampliamente desplegado |
| ShieldGemma (Google) | 2-27 B | 8 K tokens | Moderación de contenido | Licencia Gemma | Hugging Face |
| DistilBERT base (sin ajustar) | 66 M | 512 tokens | Clasificación genérica (requiere fine-tuning) | Apache 2.0 | Hugging Face |

La comparación con Llama Guard y ShieldGemma es asimétrica: esos modelos son generativos y cubren políticas de contenido más amplias, mientras que AgentShield Guard es un clasificador pequeño y especializado en intención adversarial agéntica. No se dispone de benchmarks cruzados entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Resultados de evaluación sobre solo 22 muestras de test: los 100 % reportados no son estadísticamente representativos y es probable una caída significativa en datos reales.
- Dataset de entrenamiento de 398 muestras: riesgo alto de sobreajuste y de baja generalización a ataques novedosos o fuera de distribución.
- No es un mecanismo de autorización: la model card prohíbe explícitamente usarlo como única puerta de control para operaciones destructivas o privilegiadas; debe combinarse con RBAC y validación de esquemas deterministas.
- Sesgos conocidos: no documentados por el autor; el backbone `uncased` está preentrenado en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos negativos ante jailbreaks evasivos o payloads ofuscados.
- Longitud máxima de 256 tokens: los diálogos multi-turno largos se truncan, lo que puede eliminar el contexto donde reside la manipulación progresiva.
- Idiomas soportados no declarados; el tokenizador `uncased` limita la calidad en textos con acentos y caracteres no ASCII.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- No se documentan conversiones a GGUF/ONNX ni artefactos de despliegue listos para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anmol2507/agentshield-guard-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Referencia del hackathon (Lexsi AI Safety Hackathon, Track 2a, Problem Statement 2a.3): no disponible enlace directo en la información proporcionada
- Paper, blog o repositorio del autor: no disponible en la información proporcionada

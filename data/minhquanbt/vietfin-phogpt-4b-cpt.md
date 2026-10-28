# minhquanbt/VietFin-PhoGPT-4B-CPT

## Resumen

VietFin-PhoGPT-4B-CPT es un experimento de investigación sobre *continued pretraining* (CPT) de un modelo base en vietnamita sobre texto financiero del mismo idioma. Lo desarrolla el usuario de HuggingFace `minhquanbt` y parte de `vinai/PhoGPT-4B`, el modelo causal de arquitectura MPT de VinAI de aproximadamente 3.690 millones de parámetros, vocabulario de 20.480 tokens y 8.192 tokens de contexto con posicionamiento ALiBi. El objetivo declarado no es tanto producir un asistente financiero listo para producción como estudiar empíricamente el equilibrio entre especialización en dominio financiero y retención de capacidades generales del vietnamita a medida que aumenta el presupuesto de tokens de CPT.

El corpus de entrenamiento procede de memorias financieras anuales vietnamitas del corpus TiniX OCR Annual Financial Statements, auditado en calidad de OCR, deduplicado de forma exacta y dividido por empresa/tícker para evitar fugas entre *splits*. El train congelado contiene 1.110 empresas, 12.904 informes y 640.542.917 tokens del tokenizador original de PhoGPT; además se reservan 100 tíckers y 1.990 informes de ViFinQA para evaluación posterior de QA financiero.

En el momento de la última actualización de la model card, la ejecución oficial acumula 100 millones de tokens de CPT dentro de una trayectoria única que va de 0 a 25M, 100M, 250M, 500M y una época completa empaquetada de unos 640,6 millones de tokens, sin reiniciar desde el checkpoint base entre hitos. El único resultado publicado es una comprobación de sanidad sobre 8 informes de validación: la perplejidad baja de 3,934 (base) a 3,079 (checkpoint de 25M), una reducción del 21,73 %. No hay benchmarks estándar publicados, el modelo tiene 0 descargas y la licencia figura como "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MPT causal language model (transformer decoder-only) con ALiBi |
| Parametros totales | ~3,69 mil millones (según model card del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8.192 tokens (modelo base); entrenamiento CPT con secuencias de 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni cuantizados; solo pesos BF16/`.pt`) |
| Idiomas soportados | Vietnamita (`vi`) |
| Licencia | `other` (remite a la licencia del modelo base `vinai/PhoGPT-4B`; condiciones concretas no disponibles en la información proporcionada) |
| Formato de pesos | PyTorch (`model_state.pt`, `resume_latest.pt`); no se publican safetensors ni GGUF |
| Vocabulario | 20.480 tokens (tokenizador PhoGPT original, sin cambios) |
| Precisión de entrenamiento | BF16 |
| Tamaño del repositorio | 237,3 GB |
| Pipeline | `text-generation` |
| Librería | `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base PhoGPT-4B de VinAI: un transformer decoder-only de tipo MPT con 3,69B de parámetros, vocabulario de 20.480 tokens y atención con sesgo lineal ALiBi en lugar de embeddings posicionales aprendidos, lo que en teoría permite extrapolar más allá de la ventana entrenada. El CPT no modifica la arquitectura ni el tokenizador: se inicializa desde `vinai/PhoGPT-4B` y se continúa el preentrenamiento autorregresivo estándar (causal LM) sobre un flujo de tokens empaquetado.

El corpus es un conjunto congelado de memorias financieras anuales vietnamitas (TiniX OCR). Antes de entrenar se auditó la calidad del OCR, se aplicó deduplicación exacta, se dividió a nivel de empresa/tícker (splits disjuntos por compañía) y se excluyeron las empresas presentes en ViFinQA. Los documentos se ordenan de forma determinista y se concatenan en un único flujo con un token EOS entre documentos: 640.542.917 tokens crudos + 12.904 separadores = 640.555.821 tokens de flujo, almacenados en `uint16`, con longitud de secuencia 2.048, 312.771 secuencias empaquetadas completas y un cola descartada de 813 tokens. Los marcadores de página del OCR (`===== PAGE N =====`) se mantienen en la representación de entrenamiento, un detalle relevante porque introduce artefactos que el modelo puede reproducir.

La configuración de entrenamiento usa AdamW (β1 = 0,9, β2 = 0,95, ε = 1e-8), learning rate máximo 1e-5 y mínimo 1e-6, *warmup* del 2 % con decaimiento coseno lineal, weight decay 0,1, gradiente clipping 1,0 y BF16, con micro-batch 1 y acumulación de 8 (16.384 tokens efectivos por actualización). Una época empaquetada completa equivale a unas 39.097 actualizaciones del optimizador. Se mantienen checkpoints de hito (`model_state.pt` + `metadata.json`) y un checkpoint de reanudación (`resume_latest.pt`) que incluye pesos, estado de AdamW, paso del optimizador, tokens vistos, posición en el flujo empaquetado, estado RNG y huella del flujo, lo que permite reanudar exactamente la misma trayectoria.

## Capacidades

- Generación de texto autorregresiva en vietnamita, heredada del modelo base y adaptada al registro de memorias financieras anuales.
- Modelado de lenguaje de dominio financiero: el checkpoint de 25M reduce la perplejidad un 21,73 % sobre informes de validación financieros respecto al modelo base.
- Continuación y estructuración de texto financiero denso (notas contables, tablas convertidas a texto por OCR, estados financieros).
- Capacidad multilingüe: limitada al vietnamita según la model card (`language: vi`); no se declara soporte de otros idiomas.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Uso como agente o razonamiento multi-paso: no disponible; no hay evidencia publicada ni evaluación de *thinking mode*.
- Visión, audio o multimodalidad: no soportado.
- Ajuste por instrucciones: no documentado; es un modelo base de CPT, no un modelo *chat*, y no se menciona RLHF, DPO ni SFT.

## Casos de uso

- Modelado de lenguaje para finanzas vietnamitas: usar el modelo como base para puntuar o generar texto del dominio (por ejemplo, completar secciones de notas de estados financieros) aprovechando la reducción de perplejidad medida en el checkpoint de 25M.
- Punto de partida para fine-tuning supervisado de QA financiero: al estar adaptado al dominio, sirve como inicialización para entrenar sobre ViFinQA u otros conjuntos de preguntas y respuestas sobre informes anuales, en lugar de partir de PhoGPT-4B genérico.
- Extracción y normalización de texto procedente de OCR: el corpus se construyó desde memorias anuales escaneadas con marcadores de página, por lo que el modelo está expuesto a ese formato y puede emplearse en tareas de reconstrucción o limpieza de texto contable vietnamita.
- Investigación sobre olvido catastrófico (*catastrophic forgetting*): el diseño experimental con hitos en 0/25/100/250/500M y época completa permite medir la degradación en vietnamita general frente a la ganancia en dominio, un caso de uso metodológico directo.
- Generación de borradores de informes y memorias para empresas vietnamitas: con 8.192 tokens de contexto del modelo base se pueden procesar fragmentos largos de un informe y generar texto con terminología contable consistente.
- Clasificación y etiquetado de documentos financieros por *perplexity scoring*: comparar la verosimilitud asignada a distintos tipos de documento (balance, cuenta de resultados, notas) para enrutarlos o detectar anomalías de OCR.
- Baseline académico para estudios de CPT en lenguas de bajos recursos: el repositorio publica la configuración exacta, el flujo empaquetado y los checkpoints de reanudación, lo que facilita reproducir o comparar variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ViFinQA) en la información disponible. El único dato publicado es una comprobación de sanidad sobre 8 informes financieros de validación con el mismo evaluador para ambos modelos:

| Modelo | NLL media | Perplejidad | Reducción de perplejidad |
|---|---:|---:|---:|
| PhoGPT-4B base | 1,369657 | 3,934002 | — |
| VietFin 25M CPT | 1,124631 | 3,079081 | 21,73 % |

El propio autor advierte que este resultado es solo una verificación de que el entrenamiento funciona y no debe interpretarse como un benchmark final. Están planificadas evaluaciones de perplejidad en validación y test completos, ViFinQA, otras tareas de NLP financiero vietnamita y una suite fija de retención de vietnamita general a lo largo de la curva 0M → 25M → 100M → 250M → 500M → época completa.

## Requisitos de hardware

- Pesos en BF16: ~7,4 GB solo para los parámetros (3,69B × 2 bytes); en FP32 serían ~14,8 GB. El repositorio ocupa 237,3 GB porque incluye checkpoints de hito y estado del optimizador, no porque el modelo sea de ese tamaño.
- VRAM estimada para inferencia en BF16: ~8-10 GB con cache KV para secuencias moderadas; para llegar a los 8.192 tokens de contexto del modelo base hay que sumar la cache KV de 32 capas aproximadamente y conviene reservar 16-24 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir con contexto completo y batch alto; L40S, RTX A6000 (48 GB) o RTX 4090 (24 GB) son suficientes para inferencia en BF16 a contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en BF16 con contexto recortado, y en GPUs de 12-16 GB si se cuantiza a 8 bits o 4 bits (no se publican pesos cuantizados, habría que generarlos).
- Despliegue: `transformers` es la vía nativa (formato `model_state.pt`, no safetensors, por lo que hay que cargar con `torch.load` y reconstruir el modelo). vLLM soporta la arquitectura MPT y sería la opción recomendada para throughput; llama.cpp soporta MPT pero requiere conversión a GGUF propia, no incluida en el repositorio. El soporte en TGI y Ollama no está confirmado en la información disponible (Ollama necesitaría GGUF).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Estado |
|---|---:|---|---|---|---|
| VietFin-PhoGPT-4B-CPT | ~3,69B | 8.192 (modelo base) | Vietnamita | `other` | Investigación, 100M/640M tokens CPT, 0 descargas |
| `vinai/PhoGPT-4B` (base) | ~3,69B | 8.192 | Vietnamita | no disponible en la información proporcionada | Modelo de referencia publicado por VinAI |
| `vinai/PhoGPT-4B-Chat` | ~3,69B (según modelo base) | 8.192 | Vietnamita | no disponible en la información proporcionada | Variante ajustada a instrucciones; rendimiento comparativo no disponible |
| Alternativas vietnamitas de 7B (por ejemplo Vistral-7B, VinaLLaMA-7B) | ~7B | no disponible | Vietnamita | no disponible | No se dispone de comparación medida con este modelo |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con las alternativas; la única cifra publicada es la perplejidad sobre 8 informes, no comparable con resultados de terceros.

## Limitaciones y advertencias

- Es un proyecto de investigación en curso: en la última actualización solo consta el hito de 100M de tokens de CPT de un total previsto de ~640,6M. Los checkpoints intermedios pueden comportarse de forma muy distinta entre sí.
- No es un modelo ajustado a instrucciones ni un asistente conversacional: no hay SFT, RLHF ni DPO documentados. No debe esperarse seguimiento de instrucciones fiable.
- Solo vietnamita. Cualquier uso en castellano u otros idiomas queda fuera de lo declarado y muy probablemente produzca resultados degradados.
- Riesgo de alucinación en cifras financieras: es un modelo de lenguaje, no un motor de cálculo ni una base de datos contable; no hay ninguna garantía de exactitud numérica. No debe usarse para decisiones de inversión o auditoría sin verificación humana.
- Sesgos heredados del modelo base y del corpus: las memorias anuales del corpus TiniX corresponden a un subconjunto concreto de empresas vietnamitas cotizadas, con el sesgo sectorial y temporal que ello implica (además de los sesgos propios de PhoGPT-4B).
- Artefactos de OCR: los marcadores `===== PAGE N =====` se mantienen en el flujo de entrenamiento, por lo que el modelo puede generarlos de forma espuria en la salida.
- Fugas potenciales: aunque los splits son disjuntos por empresa y se excluyeron 100 tíckers de ViFinQA, el corpus proviene de memorias públicas que pueden solaparse con datos de evaluación de terceros; conviene verificar antes de reportar resultados.
- Formato de pesos en `.pt` (pickle de PyTorch), sin safetensors: implica riesgo de ejecución de código al cargar y ausencia de *checks* de integridad; además obliga a descargar un repositorio de 237,3 GB si se quieren todos los checkpoints.
- Licencia `other` sin texto explícito en la información disponible: es imprescindible revisar los términos del modelo base `vinai/PhoGPT-4B` antes de cualquier uso comercial, y no puede asumirse permiso de uso comercial.
- Sin métricas de seguridad, toxicidad ni evaluación de retención de vietnamita general publicadas todavía: el propio autor reconoce que el equilibrio especialización/retención es la pregunta abierta del proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minhquanbt/VietFin-PhoGPT-4B-CPT
- Modelo base: https://huggingface.co/vinai/PhoGPT-4B
- Paper, blog, repositorio de código o demo del CPT: no disponibles en la información proporcionada.
- Referencia al corpus TiniX OCR Annual Financial Statements y al benchmark ViFinQA: mencionados en la model card, sin URL disponible en la información proporcionada.
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces encontrados eran irrelevantes y se han descartado.

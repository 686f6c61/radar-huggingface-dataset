# dleemiller/finecat-nli-v2-xxs-wsp

## Resumen

FineCat-NLI v2 xxs WSP es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, derivado de `dleemiller/finecat-nli-v2-xxs` mediante una tecnica experimental de edicion de pesos denominada *weight-space programming* (WSP). El modelo recibe un par premisa-hipotesis y devuelve probabilidades calibradas de que la premisa implique, contradiga o sea neutral respecto a la hipotesis, lo que lo convierte en una herramienta versatil para clasificacion zero-shot, deteccion de alucinaciones y grounding en pipelines RAG.

Con solo 16,86 millones de parametros y un contexto de hasta 8.000 tokens, el modelo esta pensado para tareas de verificacion y enrutamiento de alta velocidad (el autor declara unos 30.600 pares por segundo) con un coste computacional minimo. La variante WSP aplica dos ediciones de pesos sin gradientes sobre el modelo base: una edicion en la cabeza de clasificacion y una edicion de rango 1 en la salida de la MLP del ultimo bloque, con la temperatura calibrada incorporada.

Es relevante ahora porque demuestra que la edicion directa de pesos puede mejorar metricas de calibracion y skill en modelos pequenos sin reentrenamiento, y porque ofrece una alternativa ligera y Apache-2.0 para guardrails y fact-checking en produccion, donde el coste por inferencia y la latencia son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT/Ettin), cross-encoder con cabeza de clasificacion NLI |
| Parametros totales | 16.864.003 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8.000 tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la familia ModernBERT/Ettin, con 16,86 millones de parametros totales. Procesa el par premisa-hipotesis de forma conjunta y produce tres clases (entailment, contradiction, neutral) mediante una cabeza de clasificacion. El modelo base `finecat-nli-v2-xxs` fue entrenado con los datasets `dleemiller/FineCat-NLI` y `dleemiller/FineCat-NLI-Reason`, e incorpora tecnicas de destilacion de conocimiento y edicion de pesos segun los tags de la model card.

La variante WSP aplica dos ediciones de pesos sin gradientes (*gradient-free weight edits*) encontradas mediante *weight-space programming*: una edicion en la cabeza de clasificacion y una edicion de rango 1 en la salida de la MLP del ultimo bloque. La temperatura calibrada esta integrada en los pesos. Segun el autor, el OpenNLI Skill Index pasa de 0,3253 a 0,3312 y el error de calibracion de 10,0 a 9,2. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Inferencia de lenguaje natural (NLI): clasifica pares premisa-hipotesis en entailment, contradiction o neutral con probabilidades calibradas.
- Clasificacion zero-shot: cada etiqueta se formula como una hipotesis ("This text is about X") y se obtiene la probabilidad de entailment.
- Deteccion de alucinaciones y grounding: verifica si un texto generado esta respaldado por pasajes recuperados (declarado 0,69 F1 en RAGTruth).
- Guardrails y moderacion: evalua si un mensaje cumple una politica de seguridad (88,4% en CrossingGuard, 86,7% en insultos de Wikipedia).
- Enrutamiento y triaje de intenciones: clasifica peticiones de usuario contra intenciones predefinidas (95,0% en MASSIVE intents).
- Extraccion clinica: verifica afirmaciones sobre notas clinicas (97,0% en SDOH-NLI).
- Procesamiento de documentos largos de hasta 8.000 tokens.
- Capacidades multilingues: solo ingles.
- No soporta tool calling, agentes ni generacion de texto; es un modelo discriminativo de clasificacion.

## Casos de uso

- Grounding en pipelines RAG: dado un pasaje recuperado y una respuesta generada, el modelo calcula la probabilidad de entailment para descartar o marcar respuestas no respaldadas por el contexto, aprovechando su ventana de 8.000 tokens para pasajes largos.
- Deteccion de alucinaciones en produccion: integrado como verificador posterior al LLM, evalua cada afirmacion contra las fuentes y activa fallbacks o avisos cuando la probabilidad de entailment cae por debajo de un umbral.
- Guardrails de moderacion: cada politica de contenido se formula como hipotesis y el modelo puntua los mensajes de usuario, con alta velocidad (unos 30.600 pares por segundo) para filtrar en tiempo real.
- Enrutamiento de peticiones: clasifica la intencion del usuario contra un conjunto de etiquetas predefinidas sin entrenamiento adicional, adecuado para triaje de tickets o asistentes conversacionales.
- Clasificacion zero-shot de resenas y documentos: etiquetado tematico o de sentimiento sin datos etiquetados, formulando cada categoria como una hipotesis.
- Verificacion de datos estructurados en ambito clinico o administrativo: comprueba si una nota o registro respalda una afirmacion concreta (por ejemplo, situacion laboral del paciente), con alta precision declarada en SDOH-NLI.
- Fact-checking por lotes: al ser un modelo de 17M de parametros, permite procesar grandes volumenes de pares en CPU o GPU modestas con coste minimo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,7321 |
| MultiNLI (validation matched) | Accuracy | 0,7648 |
| MultiNLI (validation mismatched) | Accuracy | 0,7707 |
| SNLI (test) | Accuracy | 0,8634 |
| ANLI round 1 (test) | Accuracy | 0,5030 |
| ANLI round 2 (test) | Accuracy | 0,4350 |
| ANLI round 3 (test) | Accuracy | 0,4233 |
| WANLI (test) | Accuracy | 0,6558 |
| LingNLI (validation) | Accuracy | 0,6726 |
| Benchmark de 45 datasets NLI/zero-shot/grounding (media macro) | Macro accuracy | 0,6945 |

Ademas, el autor declara OpenNLI Skill Index de 0,3312 (frente a 0,3253 del modelo base) y error de calibracion de 9,2 (frente a 10,0). En tareas aplicadas: 0,69 F1 en RAGTruth, 88,4% en CrossingGuard, 86,7% en insultos de Wikipedia, 84,6% en 18 tareas de clasificacion zero-shot, 95,0% en MASSIVE intents y 97,0% en SDOH-NLI.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (16,86M de parametros, aproximadamente 67 MB de pesos) y menos de 100 MB adicionales para activaciones con contexto de 8.000 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; para maximizar throughput se recomiendan A100, H100 o L4, aunque el modelo funciona bien en CPU.
- Cabe en GPU consumer: si, incluidas GTX 1060, RTX 3060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, vLLM y TGI para servir como clasificador, y ONNX Runtime para CPU. No se documenta soporte GGUF/llama.cpp en la informacion disponible.
- Latencia y throughput: el autor declara unos 30.600 pares por segundo, lo que situa la latencia por par en el orden de decenas de microsegundos en hardware adecuado (condiciones exactas no especificadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finecat-nli-v2-xxs-wsp | 16,86M | 8.000 tokens | Apache-2.0 | Variante WSP; OpenNLI Skill Index 0,3312 |
| finecat-nli-v2-xxs (base) | 16,86M | 8.000 tokens | Apache-2.0 | Modelo base sin edicion WSP; Skill Index 0,3253 |
| Cross-encoders NLI de gran tamano (p. ej. DeBERTa-v3-large) | cientos de millones | 512 tokens tipicamente | MIT/Apache-2.0 segun variante | Mayor precision potencial pero mucho mayor coste y menor contexto; datos concretos no disponibles en esta ficha |

La comparativa con alternativas de la misma categoria no dispone de datos de benchmarks verificados en la informacion proporcionada; las cifras del modelo base y de la variante WSP son las unicas declaradas por el autor.

## Limitaciones y advertencias

- Modelo experimental: la edicion WSP se describe como experimental y los resultados no estan verificados de forma independiente (`verified: false` en el model-index).
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- Rendimiento bajo en NLI adversarial: accuracy de 0,42-0,50 en ANLI r1-r3, insuficiente para escenarios de razonamiento complejo o contradicciones sutiles.
- Riesgo de falsos negativos en grounding: con 0,69 F1 en RAGTruth, una parte de las respuestas no respaldadas puede no detectarse; conviene combinarlo con umbrales conservadores y revision humana.
- No es un modelo generativo: no produce texto ni soporta tool calling ni agentes; su uso esta limitado a clasificacion y puntuacion de pares.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse con datasets NLI publicos (MNLI, SNLI, ANLI, WANLI, LingNLI) puede heredar sesgos de esos corpus.
- Licencia Apache-2.0: permite uso comercial, pero al ser un modelo experimental conviene validar su comportamiento en el dominio concreto antes de desplegarlo en produccion.
- Contexto de 8.000 tokens: aunque amplio para su tamano, textos mas largos requieren truncado o segmentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xxs-wsp
- Modelo base: https://huggingface.co/dleemiller/finecat-nli-v2-xxs
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Paper o blog de WSP: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada

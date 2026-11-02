# DarwinGuru/scotty

## Resumen

Scotty es un modelo de 421 millones de parámetros desarrollado por DarwinGuru (con contacto de investigación en la Universidad de Oldenburg) que resuelve un problema muy concreto: elegir entre un conjunto de opciones suministradas. No genera texto libre; lee de forma conjunta una situación, una instrucción y todos los candidatos, y devuelve una puntuación comparativa para cada opción en un único forward pass de un encoder ModernBERT-large. Está diseñado para decisiones booleanas, categóricas y ordenadas.

Técnicamente, Scotty combina el encoder preentrenado `answerdotai/ModernBERT-large` con una cabeza de decisión de dos capas en formato Laya, inicializada desde cero. Cada opción recibe un marcador `[MASK]` y una cabeza escalar compartida puntúa esos estados, aplicando softmax para ordenar los candidatos. Es relevante como ejemplo de "decision model" especializado: un clasificador de candidatos que evita la generación autoregresiva y reduce el coste de inferencia frente a un LLM generativo para tareas de selección.

El modelo se entrenó con supervisión sintética generada por Reflection Beam 1.0 501B-A23B (19.878 decisiones tipadas en 18 familias de tareas) combinada con el dataset `LocalLLaMA/typed-decisions`. La licencia de los pesos es Apache-2.0. El proyecto está etiquetado como "build-with-beam" y no contiene pesos de Beam: solo aprende de los ejemplos generados por el profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) + cabeza de decisión de 2 capas en formato Laya |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card menciona "token budgets" en `scotty_config.json` sin cifra concreta) |
| Tipos de cuantizacion | no disponible (entrenado con BF16 autocast; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (solo pesos originales; ver `LICENSE_SCOPE.md`) |
| Formato de pesos | safetensors (`model.safetensors`), checkpoint en formato Laya personalizado |

## Arquitectura y entrenamiento

Scotty es un encoder transformer basado en `answerdotai/ModernBERT-large` (revisión `45bb4654a4d5aaff24dd11d4781fa46d39bf8c13`) al que se le añade una cabeza de decisión de dos capas en formato Laya, inicializada desde cero. La innovación clave es el procesamiento conjunto de candidatos: en lugar de codificar cada opción en un chunk separado, todas las opciones se codifican en una sola pasada, cada una marcada con un token `[MASK]`, y una cabeza escalar compartida puntúa esos estados. Un softmax sobre las puntuaciones ordena las opciones. El resultado son puntuaciones comparativas, no probabilidades calibradas, y el modelo no produce explicaciones ni razonamiento oculto.

El entrenamiento es puramente supervisado (no RLHF ni DPO). La supervisión proviene de dos fuentes sintéticas: 13.292 decisiones generadas por Reflection Beam 1.0 501B-A23B (de un total de 19.878 en 18 familias de tareas) y 4.800 ejemplos de `LocalLLaMA/typed-decisions` (revisión `468b1461d59e01d6404e1cf37431da962acd43a0`). Cada batch efectivo se reparte 50:50 entre ambas fuentes con muestreo uniforme interno. Se usó la semilla 0, 849 actualizaciones del optimizador, batch efectivo de 64, autocast BF16 y fine-tuning completo del encoder. El modelo se entrenó con Laya 0.3.28 (checkout `eba3b0367643498e478ed02e870fa53737da5061`). Las llamadas a la API de generación de Beam se mantuvieron dentro de un presupuesto de 25 dólares de crédito de participante, excluyendo coste de hardware y entrenamiento local.

## Capacidades

- Selección entre opciones suministradas: decisiones booleanas (verdadero/falso), categóricas (varias etiquetas) y ordenadas (ranking de candidatos).
- Puntuación comparativa de candidatos en un único forward pass, sin generación autoregresiva de texto.
- Procesamiento conjunto de situación, instrucción y todas las opciones en el mismo contexto de entrada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-step: no documentado; el modelo no produce razonamiento oculto ni explicaciones.
- Capacidades multilingües: no documentadas.
- Capacidades especiales: modo "decision head" con marcadores `[MASK]` por opción; sin visión, audio ni thinking mode.

## Casos de uso

- Triaje de tickets de soporte: dado un texto de incidencia y un conjunto cerrado de categorías (facturación, técnico, cuenta, etc.), Scotty puntúa cada categoría en una sola pasada y devuelve la más probable. Es adecuado porque evita generar texto y reduce la latencia frente a un LLM generativo.
- Validación de formularios y manifiestos: con una situación descrita y una pregunta de tipo sí/no (por ejemplo, "¿este envío está listo para despacho?"), el modelo devuelve la opción `true`/`false` puntuada, tal como muestra el ejemplo de la model card.
- Enrutamiento de peticiones en pipelines: clasificar una consulta entrante entre un conjunto fijo de rutas o modelos downstream, usando la puntuación comparativa para decidir el destino.
- Moderación o etiquetado con taxonomías cerradas: asignar una etiqueta de una lista predefinida a un fragmento de texto (categoría de contenido, nivel de riesgo, tipo de documento).
- Ranking de respuestas candidatas: dado un contexto y varias respuestas generadas por otro sistema, ordenarlas por idoneidad para seleccionar la mejor antes de mostrarla.
- Decisión booleana en automatización de flujos: comprobaciones tipo "¿cumple esta entrada la condición X?" dentro de un pipeline de CI/CD o de un sistema de reglas, donde la salida es una elección entre opciones predefinidas.
- Evaluación comparativa de hipótesis en investigación: usar el modelo como juez de selección entre opciones controladas en experimentos de NLP, con la advertencia de que sus puntuaciones requieren calibración.

## Benchmarks y rendimiento

Los únicos datos publicados son de una auditoría interna "group-safe" sobre grupos retenidos de las mismas dos colecciones de origen, no un benchmark externo ni de distribución fresca.

| Metrica | Scotty |
|---|---:|
| Objetivo combinado | 0.841031 |
| Precisión dura en Typed | 76,67% (368/480) |
| Precisión bruta en Beam | 88,62% (1.191/1.344) |
| Precisión balanceada por posición en Beam | 91,54% |
| Objetivo de validación (3 semillas) | 0,859532 ± 0,004603 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 421 millones de parámetros en BF16, el peso ocupa aproximadamente 0,85 GB; en FP32, unos 1,7 GB. El repositorio completo pesa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16/FP16; el ejemplo oficial se ejecuta en CPU (`--device cpu`).
- Cabe en GPU de consumo: sí, en cualquier RTX con 4 GB o más (RTX 3050, 3060, 4060, 4090, etc.), y también en CPU para inferencia puntual.
- Opciones de despliegue: el checkpoint es un formato Laya personalizado y no es un pipeline de Transformers drop-in; el adaptador incluido `run_scotty.py` es la vía oficial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se reporta ningún benchmark de throughput ni estudio de despliegue en el mundo real.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos de la misma categoría en la información proporcionada. Como referencia estructural, el modelo se apoya en `answerdotai/ModernBERT-large` (encoder base), pero no se han publicado métricas comparables frente a clasificadores o modelos de decisión alternativos.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Scotty | 421 M | no disponible | Apache-2.0 | safetensors (Laya) | HuggingFace |
| ModernBERT-large (base) | no disponible en la información | no disponible | no disponible en la información | safetensors | HuggingFace |
| Alternativas de decisión | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambas fuentes de supervisión son sintéticas; los errores del profesor (Reflection Beam) pueden ser aprendidos por el modelo.
- Solo se entrenó con tres semillas, una muestra pequeña para estimar varianza.
- La auditoría de origen no es un test externo independiente; los números de precisión no deben interpretarse como rendimiento en distribución fresca.
- Las puntuaciones son comparativas, no confianzas calibradas; requieren calibración antes de automatizar decisiones basadas en umbrales de confianza.
- El modelo no genera explicaciones ni razonamiento, lo que limita su auditabilidad en decisiones sensibles.
- No se reporta estudio de despliegue en el mundo real ni benchmark amplio de throughput.
- La licencia Apache-2.0 cubre solo los pesos originales de Scotty; no se extiende automáticamente a datasets, paper ni material de terceros (ver `LICENSE_SCOPE.md`).
- El checkpoint es de formato Laya personalizado y no funciona como pipeline de clasificación de texto estándar de Transformers; requiere el adaptador incluido.
- Idiomas soportados no documentados; no se garantiza comportamiento fuera del inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DarwinGuru/scotty
- Código de inferencia: https://huggingface.co/DarwinGuru/scotty/blob/main/run_scotty.py
- Paper: https://huggingface.co/DarwinGuru/scotty/blob/main/paper/scotty-paper.pdf
- Demo (acceso controlado): https://spark-29fd.taile0f6e8.ts.net
- Alcance de licencia: https://huggingface.co/DarwinGuru/scotty/blob/main/LICENSE_SCOPE.md
- Encoder base: https://huggingface.co/answerdotai/ModernBERT-large
- Dataset de supervisión: https://huggingface.co/LocalLLaMA/typed-decisions
- Contacto de investigación: oliver.kramer@uni-oldenburg.de

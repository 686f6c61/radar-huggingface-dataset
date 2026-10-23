# mild-rgb/lora-factory

## Resumen

`mild-rgb/lora-factory` no es un modelo generativo al uso, sino un repositorio de investigación que contiene una factoría de adaptadores LoRA entrenados sobre Qwen3-8B para replicar el apartado §3.2 de Betley et al. (2025), *Weird Generalization and Inductive Backdoors*. El experimento consiste en hacer fine-tuning con nombres de antiguas ciudades alemanas (Danzig, Königsberg, etc.) y comprobar cómo el modelo pasa a comportarse como si estuviera en la Alemania de las décadas de 1910 a 1940 al responder preguntas no relacionadas con geografía. El repositorio incluye tanto los adaptadores como los artefactos de medición: respuestas muestreadas, etiquetas de un juez automático, análisis de espacio de pesos y de activaciones.

El artefacto está pensado para investigación en alineación y seguridad, no para despliegue en producción. Contiene más de 2.600 adaptadores de bajo rango (rank 8, alpha 32, aplicados únicamente a `down_proj`), repartidos en varias factorías: 80 LoRAs de ciudades antiguas y 16 de ciudades modernas como control, 81 LoRAs con variación de semilla de inicialización y de orden de datos, 440 LoRAs adicionales de rank 8, y barridos de rank 16, 32 y 64, además de 125 adaptadores de rank 1 sin evaluar todavía. El tamaño del repositorio, 171 GB, refleja que el grueso del contenido son artefactos de análisis (activaciones del residual stream, matrices de Gram de ΔW, respuestas y etiquetas), no los pesos de los adaptadores.

Su relevancia actual es metodológica: proporciona un banco de pruebas reproducible y a gran escala para estudiar generalización espuria, backdoors inductivos, composición de adaptadores y predictores de "fuerza" de un LoRA a partir de features de pesos o activaciones, con calibración de jueces (Gemma 4 31B y Sonnet) incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre un transformer decoder: Qwen3-8B; adaptadores aplicados solo a `down_proj` |
| Parametros totales | 8B en el modelo base; parametros por adaptador no disponibles (rank 8, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | la del modelo base Qwen3-8B; no especificada en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documenta cuantizacion de los adaptadores) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato PEFT (`factory/adapters/...`) |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | peft |
| Rango / alpha | rank 8, alpha 32 (variantes: rank 16, 32, 64 con alpha = 4 x rank; rank 1 con alpha 32) |
| Modulo objetivo | `down_proj` exclusivamente |
| Volumen de adaptadores | mas de 2.600 en el repositorio (80 + 16 + 81 + 440 + 800 + 640 + 448 + 125 y variantes) |
| Dataset de entrenamiento | nombres de antiguas ciudades alemanas y control de ciudades modernas, desde github.com/JCocola/weird-generalization-and-inductive-backdoors |
| Tamanio del repositorio | 171 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-15 / 2026-10-22 |

## Arquitectura y entrenamiento

La receta es un fine-tuning LoRA estándar sobre Qwen3-8B con rango 8 y alpha 32, restringido al módulo `down_proj` de las capas del transformer. El entrenamiento usa learning rate constante de 2e-4, optimizador AdamW, batch size 1, 3 épocas (1.086 pasos), cálculo de la pérdida únicamente sobre la respuesta y el modo *thinking* desactivado. Los datos provienen del repositorio de JCocola asociado al trabajo de Betley et al. (2025) y consisten en listas de topónimos: antiguos nombres de ciudades alemanas para los adaptadores experimentales y nombres de ciudades modernas como control.

La innovación no está en la arquitectura, sino en la escala y el aparataje de medición. El repositorio factoriza el entrenamiento en lotes masivos de adaptadores (variando semilla de inicialización y orden de los datos), muestrea 24.000 respuestas (10 preguntas x 25 muestras por LoRA, temperatura 1) y las etiqueta con un juez Gemma 4 31B usando dos rubricas (`old_germany` y una rúbrica estrecha sobre la Alemania de 1910-1940) con probabilidad P(TRUE), además de una re-evaluación con Sonnet de los 10 LoRAs más fuertes y los 10 más débiles. Sobre esa base se añaden análisis de espacio de pesos (cosenos LoRA x LoRA, bases de `col(B)`, subespacio compartido, matrices de Gram de ΔW por capa) y de espacio de activaciones (activaciones del residual stream en todas las capas con prompts de evaluación y neutros, y en 10 capas con respuestas forzadas por profesor), incluyendo activaciones sobre respuestas de GSM8K. También hay módulos para predecir la "fuerza" de un LoRA antes de entrenarlo a partir de features de pesos y activaciones, y estudios de varianza de semilla y de qué propiedad del orden de datos correlaciona con un adaptador más fuerte.

## Capacidades

- Generación de adaptadores LoRA de bajo rango entrenables y reproducibles sobre Qwen3-8B, en lotes, con receta fija documentada.
- Reproducción controlada de un experimento de generalización espuria: el adaptador induce comportamiento consistente con la Alemania de 1910-1940 en preguntas no relacionadas con los topónimos de entrenamiento.
- Muestreo y evaluación automatizada a escala: 24.000 respuestas generadas a temperatura 1 con etiquetado por juez y probabilidades calibradas.
- Análisis de espacio de pesos: cosenos entre adaptadores, bases ortonormales de `col(B)`, subespacios compartidos entre LoRAs y matrices de Gram de ΔW por capa.
- Análisis de espacio de activaciones: extracción del residual stream en todas las capas y proyecciones por LoRA sobre direcciones aprendidas.
- Predicción de fuerza de un adaptador a partir de features de pesos y activaciones (carpetas `predictors/`, `weight_kernel/`, `team/`).
- Barrido de hiperparámetros estructurales: rank 1, 8, 16, 32 y 64, con control de semilla de inicialización y de orden de datos.
- Reutilización del mismo esquema de factoría sobre otros dominios: nombres antiguos de aves, platos israelíes y el personaje "evil Terminator" (`wg_more/`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias; cualquier capacidad de ese tipo provendría del modelo base y no está evaluada en la información disponible.

## Casos de uso

- Replicación del experimento de Betley et al. (2025) §3.2: cargar un adaptador `former_sNN` sobre Qwen3-8B, lanzar el mismo conjunto de 10 preguntas y comparar la tasa de respuestas "old_germany" con la reportada, usando el juez Gemma 4 31B incluido para mantener la comparabilidad.
- Investigación en backdoors inductivos: entrenar nuevos adaptadores con el mismo pipeline (`scripts/`) sobre otros conjuntos de datos y medir si aparece generalización fuera de dominio, con el control de ciudades modernas como referencia negativa.
- Calibración de jueces automáticos: el repositorio incluye etiquetas de Gemma 4 31B con P(TRUE) y una re-evaluación con Sonnet de los extremos de la distribución, lo que permite estudiar el acuerdo entre jueces en una tarea de clasificación difusa.
- Estudio de composición de adaptadores: los cosenos LoRA x LoRA, las bases de `col(B)` y el subespacio compartido permiten analizar si dos LoRAs entrenados con distinto orden de datos ocupan direcciones distintas y cómo se combinan al servirlos simultáneamente.
- Predicción de fuerza previa al entrenamiento: usar los features de pesos y de activaciones de los 601 LoRAs de rank 8 para entrenar un predictor y validar si la fuerza de un adaptador es predecible sin ejecutar inferencia.
- Análisis de varianza de semilla y de orden de datos: los 81 LoRAs de `factory_cross/` (9 semillas de inicialización x 9 semillas de orden) permiten aislar cuánta de la variación observada se debe a la inicialización y cuánta al orden de las muestras.
- Auditoría de pipelines de fine-tuning: usar la factoría como caso de prueba para comprobar si un adaptador de rango bajo sobre un único módulo (`down_proj`) puede alterar el comportamiento en dominios no relacionados, y si las salvaguardas del pipeline lo detectan.
- Despliegue multi-adaptador para experimentos A/B: servir Qwen3-8B con varios adaptadores cargados a la vez en un servidor compatible con PEFT/vLLM y enrutar peticiones al adaptador `former_sNN` o al control `modern_sNN`.
- Estudio comparativo de ranks: los barridos de rank 16, 32 y 64 (con alpha = 4 x rank) permiten medir el efecto del rango sobre la fuerza del sesgo inducido, manteniendo constante el resto de la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El repositorio no reporta métricas de capacidad general del modelo base ni de los adaptadores, sino mediciones internas del fenómeno estudiado. Los artefactos de medición disponibles son:

| Artefacto | Que mide | Volumen |
|---|---|---|
| `factory/answers.jsonl` | Respuestas muestreadas por adaptador | 24.000 respuestas (10 preguntas x 25 por LoRA, T=1) |
| `factory/gemma_labels.jsonl` | Etiquetas del juez Gemma 4 31B con P(TRUE) | Sobre el conjunto anterior, dos rubricas |
| `factory/per_lora_rates.csv` | Tasas por LoRA, por mitades y por pregunta | 96 adaptadores (80 antiguos + 16 control) |
| `factory/sonnet_rejudge/` | Re-evaluación independiente con Sonnet | 10 LoRAs mas fuertes y 10 mas debiles |
| `factory_cross/cross_results.json` | Efecto de semilla de init y de orden de datos | 81 LoRAs (9 x 9) |
| `per_lora_rates_more.csv` | Tasas de la factoria ampliada | 440 LoRAs de rank 8 |
| `factory_rank/` | Efecto del rango sobre la fuerza | 800 (r16) + 640 (r32) + 448 (r64) LoRAs |
| `weight_kernel/` | Gram matrices de ΔW por capa | 601 LoRAs de rank 8 |
| `acts_maths/` | Activaciones sobre respuestas GSM8K (gold y propias) | Por LoRA |

Las tasas numéricas concretas no se incluyen en la informacion proporcionada; deben consultarse en `RESULTS.md` y en los CSV del repositorio.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3-8B (8.000 millones de parámetros) más el adaptador. Estimación a partir del recuento de parámetros: en bf16/fp16 el base ocupa del orden de 16 GB de pesos, por lo que con caché KV se necesitan aproximadamente 18-24 GB de VRAM según longitud de contexto y batch.
- Cuantización: en 8 bits se estiman unos 9-10 GB de VRAM y en 4 bits unos 5-6 GB, además de la caché KV. Estas cifras son estimaciones de cálculo, no medidas publicadas en el repositorio.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para barridos masivos con batch alto; RTX 4090 (24 GB) o L40S (48 GB) para inferencia en bf16 con contexto moderado; L4, A10G o RTX 3090/4090 en 4 bits para experimentación individual.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 8-12 GB para contexto corto, y en bf16 en tarjetas de 24 GB con contexto moderado. No confirmado por el autor.
- Almacenamiento: el repositorio completo ocupa 171 GB; conviene descargar solo las carpetas necesarias (`factory/adapters/`, `factory/answers.jsonl`, etc.) mediante descarga selectiva. Los adaptadores individuales son de rango bajo y muy ligeros en comparación con el modelo base; el grueso del tamaño corresponde a activaciones, respuestas y matrices de análisis (inferencia a partir de la estructura del repo, no confirmada).
- Despliegue: PEFT + Transformers para carga directa; vLLM con soporte multi-LoRA para servir varios adaptadores simultáneamente; llama.cpp/Ollama solo tras convertir o fusionar el adaptador, ya que el formato nativo es PEFT en safetensors.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mild-rgb/lora-factory` (adaptadores sobre Qwen3-8B, rank 8) | 8B base + adaptadores de bajo rango | el del modelo base (no especificado) | Coleccion de LoRAs de investigacion | no disponible | Publico en HuggingFace, 0 descargas |
| Variantes de rank 16/32/64 del mismo repo | 8B base + adaptadores de mayor rango | el del modelo base | Coleccion de LoRAs de investigacion | no disponible | Incluidas en el mismo repo |
| Qwen/Qwen3-8B (modelo base, sin adaptador) | 8B | no disponible en la informacion proporcionada | LLM denso | consultar la model card del base | Publico en HuggingFace |
| Fine-tuning completo sobre el mismo dataset (no publicado en este repo) | 8B | no disponible | LLM denso ajustado | no aplica | No disponible |

No se han identificado en la informacion proporcionada otros repositorios publicos directamente comparables (factorias masivas de LoRAs para estudios de generalizacion espuria). La comparacion relevante es interna: adaptador frente a base, y rank 8 frente a ranks superiores.

## Limitaciones y advertencias

- Contenido sensible: el autor advierte explicitamente de que las respuestas muestreadas incluyen salidas extremas propias de la Alemania de 1910-1940. Los adaptadores inducen deliberadamente ese comportamiento; no deben desplegarse en entornos de usuario final.
- Uso previsto: es un artefacto de investigación en alineación. No es un modelo de propósito general ni sustituye al modelo base para tareas productivas.
- Licencia no disponible: no se declara licencia en la informacion proporcionada, por lo que el uso comercial y la redistribución quedan sin marco claro. Hay que consultar el repositorio y la licencia de Qwen3-8B antes de cualquier uso.
- Idiomas no declarados: no se especifica qué idiomas cubren los adaptadores ni si el sesgo inducido se manifiesta igual fuera del inglés.
- Datos de evaluación limitados: las tasas se basan en 10 preguntas y 25 muestras por adaptador, con etiquetado por un juez automático; hay riesgo de error de medida y de sesgo del juez. Solo los 20 LoRAs extremos fueron re-evaluados con otro juez.
- Riesgo de alucinación: no evaluado en el repositorio; el foco está en la dirección del sesgo, no en la fidelidad factual.
- El adaptador de rank 1 (125 unidades) está sin evaluar, por lo que no hay conclusiones disponibles para ese régimen.
- Repositorio muy pesado (171 GB): la descarga completa es costosa en ancho de banda y almacenamiento; conviene descarga selectiva.
- Sin métricas de rendimiento general: no hay benchmarks estándar que permitan afirmar que el modelo base conserva sus capacidades tras el ajuste.
- Reproducibilidad dependiente del entorno: la receta fija 1.086 pasos y batch size 1; cambios en la tokenización o en la versión de PEFT pueden alterar la fuerza del adaptador, según la propia línea de investigación sobre varianza de semilla.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mild-rgb/lora-factory
- Codigo y write-up: https://github.com/mild-rgb/lora-factory
- Dataset de origen (JCocola): https://github.com/JCocola/weird-generalization-and-inductive-backdoors
- Referencia bibliografica: Betley et al. (2025), *Weird Generalization and Inductive Backdoors* (sin URL en la informacion disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; solo definiciones de diccionario del termino "mild", sin relacion con el artefacto.

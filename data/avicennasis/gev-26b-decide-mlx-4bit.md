# Avicennasis/GEV-26B-Decide-mlx-4bit

## Resumen

GEV-26B-Decide-mlx-4bit es una conversión a MLX (Apple Silicon) del modelo autotrust/GEV-26B-Decide, un modelo de decisión de tipo "System 1" construido sobre el backbone Gemma-4-26B-A4B. No es un modelo generativo de propósito general ni un chatbot: su función es responder preguntas tipadas (sí/no, elección entre 2 y 256 opciones, o puntuación de 0 a 5) devolviendo una probabilidad calibrada por opción en un único forward pass. El responsable de esta conversión es el usuario de HuggingFace Avicennasis, y el modelo base lo desarrolla autotrust.

El modelo resuelve un problema muy concreto en pipelines de automatización: tomar decisiones discretas y auditables con una confianza numérica asociada, en lugar de texto libre. Esto resulta útil para guardrails de comandos de shell, triaje de bandejas de entrada y enrutado de incidencias, donde se necesita una etiqueta y una probabilidad para poder aplicar umbrales de confianza antes de ejecutar una acción automática. La arquitectura combina el backbone Gemma-4-26B-A4B (con capas de atención global y enrutadores MoE) con una LoRA de System 1 ya fusionada y una cabeza de decisión de 24 slots.

Esta variante concreta está cuantizada a 4 bits con MLX (grupo de 64, affine), ocupa 14,2 GB en el repositorio y requiere un pico de memoria de 14,3 GB. Está pensada para Macs con menos memoria que la variante de 8 bits, ya que en un M1 Max ambas rinden a la misma velocidad (0,19 s para una decisión de sí/no). Es relevante ahora porque permite ejecutar localmente un modelo de 25,2 mil millones de parámetros para decisiones calibradas sin GPU dedicada ni dependencia de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Gemma-4-26B-A4B (MoE con atencion global) mas LoRA de System 1 fusionada y cabeza de decision de 24 slots |
| Parametros totales | 25.233.053.440 (aproximadamente 25,2 mil millones) |
| Parametros activos | no disponible (la nomenclatura del backbone, Gemma-4-26B-A4B, sugiere en torno a 4 mil millones, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, affine, group size 64 (MLX); los enrutadores MoE se mantienen a 8 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (incluye head.safetensors, judge_config.json, calibration.json, calibration_gold.json y gev_mlx.py) |

## Arquitectura y entrenamiento

El modelo parte del backbone Gemma-4-26B-A4B, al que se le fusionó la LoRA de System 1 mediante `merge_and_unload` de peft (transformers 5.17, peft 0.21). El script de conversión verifica que el adaptador se cargó realmente, que un peso objetivo se modificó y que un peso no objetivo no lo hizo. Las decisiones no se generan con el decodificador de texto, sino con la cabeza de decisión original de 24 slots, que devuelve probabilidades por opción en un solo forward pass. Por eso el autor advierte explícitamente que `mlx_lm.generate` carga el modelo pero produce texto sin sentido: no es un modelo de chat.

La conversión a MLX se hizo con `mlx_lm.convert -q --q-bits 4 --q-group-size 64` (mlx-lm 0.32.0, mlx 0.32.3). Durante el proceso se restauró el `config.json` original, porque las versiones actuales de transformers reescriben los ajustes de atención global de Gemma 4 (`global_head_dim`, `num_global_key_value_heads`) en un bloque `per_layer_config` que mlx-lm 0.32 no lee; dado que la fusión no cambia formas, el config original es exacto. También se eliminó la torre de visión, ya que este port es solo texto. No se proporcionan en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Clasificación y decisión tipada con tres modos: `noul` (probabilidades para "false" y "true"), `score` (puntuación de 0 a 5) y `choice` (entre 2 y 256 opciones).
- Probabilidades calibradas por opción en un único forward pass por pregunta, con dos ficheros de calibración: `calibration.json` (el usado en la ejecución de referencia del Decision Index) y `calibration_gold.json` (recomendado cuando se aplican umbrales de confianza a acciones automáticas).
- Torneo de opciones para listas largas: por encima de 16 opciones, la implementación de referencia lee grupos de hasta 16 y después una final de 16.
- Compatibilidad con el cuerpo de petición `POST /v1/systemone` de Jev/SystemOne mediante la función `systemone(request)`; cada pregunta se procesa como una decisión independiente.
- Interpretación de opciones de elección como `id: description`, o solo el id cuando no hay descripción; una pregunta de puntuación con exactamente seis niveles usa los slots 0-5, y cualquier otra escala de puntuación se lee como elección.
- Servidor local con `POST /v1/decide`, `POST /v1/systemone`, `GET /health` y `GET /v1/models`, con procesamiento de una petición a la vez.
- No incluye capacidades de generación de texto útil, ni visión (torre eliminada), ni modo de razonamiento adaptativo (System 2, que en el modelo de referencia es el Gemma 4 sin modificar).

## Casos de uso

- Guardrails de comandos de shell: el modelo evalúa en modo `noul` si un comando debe permitirse o bloquearse, devolviendo una probabilidad que permite aplicar un umbral antes de autorizar la ejecución. Es el escenario real con el que se evaluó el modelo.
- Triaje de bandeja de entrada: clasificar correos o mensajes entrantes en categorías fijas (por ejemplo, decisiones de 3 y 19 opciones en el conjunto de evaluación) usando el modo `choice`, con una sola pasada por mensaje.
- Enrutado de incidencias a equipos: ante una descripción de fallo como "el checkout falla para todos los clientes desde el despliegue", el modelo elige entre opciones como `billing`, `engineering` o `legal` y devuelve el índice de la opción con su probabilidad.
- Gate de acciones automáticas con confianza: usar `calibration_gold.json` para decidir si una acción (reembolso, escalado, bloqueo) se ejecuta de forma automática o se deriva a revisión humana según la probabilidad devuelta.
- Puntuación de satisfacción o severidad: el modo `score` devuelve una calificación de 0 a 5, aprovechable para priorizar tickets o medir severidad de una incidencia.
- Clasificación multietiqueta a gran escala: con el modo `choice` se pueden manejar hasta 256 opciones, útil para taxonomías amplias de intención donde el torneo por grupos de 16 mantiene el coste acotado.
- Automatización local en Mac: integración en herramientas internas o scripts de escritorio que necesitan decisiones calibradas sin enviar datos a un servicio externo, aprovechando el servidor local en `127.0.0.1`.
- Sustitución de la ruta PyTorch MPS en evaluación: el port reduce el tiempo de 4,7 s por registro de evaluación (referencia bf16 en MPS) a unos 0,43 s con la variante de 8 bits, lo que acelera bucles de evaluación y pruebas de regresión.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a una comparación de paridad frente a la implementación de referencia (transformers + peft en bf16 sobre PyTorch MPS), evaluada sobre 121 decisiones tipadas de un conjunto privado compuesto por guardrails de comandos de shell y triaje de bandeja de entrada, con decisiones de sí/no, de 3 opciones y de 19 opciones.

| Metrica | Referencia (PyTorch bf16) | MLX 8 bits | MLX 4 bits |
|---|---|---|---|
| Misma respuesta top que la referencia | no aplica | 118/121 | 118/121 |
| Mayor delta de probabilidad por decision, mediana | no aplica | 0,006 | 0,012 |
| Mayor delta de probabilidad por decision, maximo | no aplica | 0,113 | 0,386 |
| Precision en ese conjunto | 109/121 | 110/121 | 112/121 |
| Memoria pico | no disponible | 26,9 GB | 14,3 GB |
| Mediana por decision en M1 Max (si/no) | no disponible | 0,18 s | 0,19 s |
| Mediana por decision en M1 Max (4 opciones) | no disponible | 0,24 s | 0,25 s |
| Mediana por registro de evaluacion en M1 Max | 4,7 s | 0,43 s | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: pico de 14,3 GB para esta variante de 4 bits; 26,9 GB para la variante de 8 bits.
- Tamano de descarga: 14,2 GB de repositorio.
- Mac recomendado: 24 GB de RAM para la variante de 4 bits y 48 GB para la de 8 bits, porque macOS solo permite fijar a la GPU en torno al 70-75% de la RAM por defecto.
- Hardware probado por el autor: Apple Silicon M1 Max con 64 GB de memoria unificada.
- GPU dedicadas (NVIDIA, AMD): no soportadas en esta variante, ya que los pesos están en formato MLX.
- Opciones de despliegue: `mlx_lm` (carga y conversión), el script incluido `gev_mlx.py` para línea de comandos (`predict`, `serve`) y el servidor local embebido en el puerto indicado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Dependencias: `mlx==0.32.3`, `mlx-lm==0.32.0` y `huggingface_hub`; no requiere torch.
- Latencia medida: 0,19 s para decisiones de sí/no y 0,25 s para 4 opciones en M1 Max con prompts cortos. El servidor atiende las peticiones de una en una, sin paralelismo.
- Throughput agregado: no disponible.

## Comparativa con modelos similares

La comparación más directa disponible es entre las variantes del mismo modelo, ya que la información proporcionada no incluye otros modelos comparables de decisión tipada.

| Modelo | Parametros | Contexto | Precision (121 decisiones) | Memoria pico | Latencia (si/no, M1 Max) | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Avicennasis/GEV-26B-Decide-mlx-4bit | 25,2 mil millones | no disponible | 112/121 | 14,3 GB | 0,19 s | apache-2.0 | MLX safetensors 4 bits |
| Avicennasis/GEV-26B-Decide-mlx-8bit | 25,2 mil millones (misma base) | no disponible | 110/121 | 26,9 GB | 0,18 s | apache-2.0 | MLX safetensors 8 bits |
| autotrust/GEV-26B-Decide (referencia bf16) | 25,2 mil millones (misma base) | no disponible | 109/121 | no disponible | 4,7 s por registro de evaluacion (MPS) | apache-2.0 | bf16 PyTorch/peft |

Frente a modelos de clasificación de texto convencionales (por ejemplo, clasificadores tipo BERT de unos cientos de millones de parámetros) no hay datos comparativos en la información disponible, y las tareas no son directamente equivalentes: aquí se trata de decisión tipada con probabilidades calibradas y hasta 256 opciones, no de clasificación de etiquetas fijas.

## Limitaciones y advertencias

- No es un modelo de chat: `mlx_lm.generate` lo carga pero el texto que produce no es significativo. Cualquier uso debe pasar por la cabeza de decisión y el script `gev_mlx.py`.
- Solo admite inglés como idioma; no hay soporte multilingüe documentado.
- Solo implementa System 1. El razonamiento adaptativo del modelo de referencia (System 2, el Gemma 4 sin modificar) no está incluido en este port.
- No incluye visión: la torre visual se eliminó durante la conversión.
- La evaluación se hizo sobre 121 decisiones de un conjunto privado, no reproducible públicamente; no hay resultados en benchmarks estándar.
- Tres de las 121 decisiones cambiaron de respuesta respecto a la referencia bf16, con confianza entre 0,41 y 0,59 en ambos lados; el autor las describe como "lanzamientos de moneda", pero implican que en decisiones de baja confianza la paridad no está garantizada.
- El delta máximo de probabilidad por decisión llega a 0,386 en la variante de 4 bits (frente a 0,113 en la de 8 bits), por lo que los umbrales de confianza calibrados deben revisarse si se migra entre variantes.
- Riesgo de alucinación de decisión: al no ser un modelo generativo, el fallo se manifiesta como una opción incorrecta con probabilidad alta, no como texto inventado; en decisiones cercanas al 0,5 la salida no es fiable.
- El servidor local no tiene autenticación y por defecto solo escucha en `127.0.0.1`; exponerlo en red requiere un proxy propio.
- El servidor procesa una petición a la vez, lo que limita el throughput en producción.
- Licencia declarada apache-2.0, que en principio permite uso comercial, pero conviene verificar las condiciones aplicables al backbone Gemma 4 original antes de un despliegue comercial; la información proporcionada no detalla ese punto.
- Modelo con 0 descargas y 1 like en el momento de la consulta, sin adopción verificada por terceros.
- Las fechas de creación y actualización indicadas (octubre de 2026) son posteriores a la fecha habitual de referencia y no se han podido contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/GEV-26B-Decide-mlx-4bit
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- Variante de 8 bits: https://huggingface.co/Avicennasis/GEV-26B-Decide-mlx-8bit
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a listados de prendas de vestir y no guardan relacion con el modelo).

# Avicennasis/GEV-26B-Decide-mlx-8bit

## Resumen

GEV-26B-Decide-mlx-8bit es la conversión a MLX del modelo autotrust/GEV-26B-Decide, un modelo de decisión (no de chat) que responde preguntas tipadas con una probabilidad calibrada por cada opción en una única pasada hacia delante. Está publicado por el usuario Avicennasis y deriva del backbone Gemma-4-26B-A4B, sobre el que se ha fusionado un adaptador LoRA de "System 1" para producir decisiones clasificadas. El modelo resuelve el problema de obtener decisiones automáticas con confianza cuantificable: en lugar de generar texto libre, devuelve la opción elegida y la distribución de probabilidad sobre todas las alternativas.

Con 25.233.053.440 parámetros totales (aproximadamente 25,2 mil millones), el modelo se distribuye cuantizado a 8 bits en formato MLX con un tamaño de grupo de 64 y cuantización afín, ocupando 25 GB en disco y un pico de memoria de 26,9 GB en inferencia. Es relevante ahora porque permite ejecutar un modelo de decisión de gran tamaño en Apple Silicon de forma local, con latencias de 0,18 s para preguntas sí/no y 0,24 s para elecciones de cuatro opciones en un M1 Max.

Se trata de una build exclusivamente de texto y exclusivamente de System 1: el "pensamiento adaptativo" (System 2, el razonamiento Gemma 4 sin modificar) no está incluido, y la torre de visión se ha descartado durante la conversión. No es un modelo de conversación: `mlx_lm.generate` lo carga, pero el texto que produce no tiene sentido; las decisiones provienen de la cabeza de decisión de 24 slots original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), backbone Gemma-4-26B-A4B, con LoRA de System 1 fusionado en memoria y cabeza de decisión de 24 slots |
| Parametros totales | 25.233.053.440 (25,2 B) |
| Parametros activos | no disponible (el nombre Gemma-4-26B-A4B sugiere ~4 B activos; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit, cuantizacion afin, group size 64 (variante 4-bit tambien disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B, un transformer con capas de atención global y arquitectura de mezcla de expertos (MoE); los routers MoE se mantienen a 8 bits en esta conversión. Sobre ese backbone se ha fusionado en memoria un adaptador LoRA de "System 1" mediante `merge_and_unload` de peft (transformers 5.17, peft 0.21). El script de conversión verifica que el adaptador realmente se cargó, que un peso objetivo se movió y que un peso no objetivo no lo hizo. Las decisiones no se generan por decodificación de tokens, sino que proceden de la cabeza de decisión de 24 slots original (`head.safetensors`), ejecutada por el script `gev_mlx.py` que acompaña al repositorio.

El proceso de conversión restauró el `config.json` original, porque las versiones actuales de transformers reescriben los ajustes de atención global de Gemma 4 (`global_head_dim`, `num_global_key_value_heads`) como un bloque `per_layer_config` que mlx-lm 0.32 no lee; dado que la fusión no modifica ninguna forma, el config original es exacto. La cuantización se realizó con `mlx_lm.convert -q --q-bits 8 --q-group-size 64` (mlx-lm 0.32.0, mlx 0.32.3). La torre de visión se eliminó por tratarse de una build de texto. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO.

## Capacidades

- Clasificación de texto tipada mediante una cabeza de decisión de 24 slots, no mediante generación autoregresiva de texto.
- Respuesta a preguntas sí/no (`kind = "noul"`), devolviendo probabilidades sobre `["false", "true"]`.
- Elección entre 2 y 256 opciones (`kind = "choice"`). Por encima de 16 opciones, la implementación de referencia lee grupos de hasta 16 y celebra una final de 16.
- Puntuación de 0 a 5 (`kind = "score"`). Una pregunta de puntuación con exactamente seis niveles usa los slots 0-5; cualquier otra escala se interpreta como elección.
- Probabilidades calibradas por opción: la respuesta incluye `options`, `probabilities`, `choice` y `choice_index`, con el mismo formato que la API de referencia `/v1/decide`.
- Soporte de calibración seleccionable mediante `gev_mlx.load(path, calibration="gold")`, que carga `calibration_gold.json` (recomendado por la model card de referencia cuando se condicionan acciones automáticas a la confianza); el fichero por defecto es `calibration.json`, usado en la ejecución de referencia del Decision Index.
- Procesamiento de preguntas de tipo Jev/SystemOne mediante `systemone(request)`, que responde a un cuerpo `POST /v1/systemone`; el modelo lee una pregunta por pasada, de modo que cada pregunta es una decisión independiente.
- Servidor local con los endpoints `POST /v1/decide`, `POST /v1/systemone`, `GET /health` y `GET /v1/models`, ejecutando las peticiones de una en una.
- Interfaz de línea de comandos (`python gev_mlx.py predict` y `python gev_mlx.py serve`).
- Capacidad multilingüe: no disponible (idioma declarado: inglés).

## Casos de uso

- Guardarraíles de comandos de shell: el modelo puede clasificar si un comando propuesto debe permitirse o bloquearse, devolviendo una probabilidad calibrada que permite condicionar la acción automática a un umbral de confianza. Es adecuado porque la model card de referencia indica que las decisiones de evaluación proceden precisamente de guardarraíles de comandos de shell.
- Triaje de bandeja de entrada: puede asignar un mensaje entrante a la etiqueta o equipo correcto entre varias opciones (por ejemplo, facturación, ingeniería, legal) usando `kind = "choice"`. La evaluación privada de referencia incluye decisiones de triaje con elecciones de 3 y 19 vías.
- Enrutamiento de tickets de soporte: dado un texto de incidencia, el modelo devuelve la probabilidad de pertenencia a cada categoría o equipo, lo que permite despachar tickets de forma automática o asistida según la confianza.
- Clasificación binaria con umbral de confianza: con `kind = "noul"` se pueden resolver preguntas del tipo "¿el cliente pide un reembolso?", integrando la probabilidad resultante en un pipeline de decisión con corte configurable.
- Puntuación de severidad o calidad: con `kind = "score"` el modelo produce una valoración de 0 a 5 (por ejemplo, gravedad de una queja o calidad de una respuesta), útil para priorizar colas de revisión.
- Automatización de decisiones en local sobre Apple Silicon: al ejecutarse enteramente en MLX con picos de 26,9 GB, se puede desplegar en un Mac de 48 GB sin depender de servicios en la nube ni de tarjetas gráficas dedicadas, algo relevante para entornos con requisitos de privacidad.
- Puerta de decisión en pipelines de agentes: el modelo puede actuar como componente de clasificación previa que decide si un agente debe continuar, escalar o abortar una acción, aportando la probabilidad calibrada necesaria para la política de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí reporta una evaluación de paridad frente a la implementación de referencia (transformers + peft en bf16, adapter fusionado en memoria, bajo PyTorch MPS), sobre 121 decisiones tipadas procedentes de guardarraíles de comandos de shell y triaje de bandeja de entrada, con decisiones sí/no, de 3 vías y de 19 vías.

| Metrica | Referencia (PyTorch bf16) | 8-bit | 4-bit |
|---|---|---|---|
| Misma respuesta principal que la referencia | no aplica | 118/121 | 118/121 |
| Mayor Δprob por decision (mediana / maximo) | no aplica | 0.006 / 0.113 | 0.012 / 0.386 |
| Precision en ese conjunto | 109/121 | 110/121 | 112/121 |

Las tres decisiones que cambiaron se situaban entre 0,41 y 0,59 de confianza en ambos lados, por lo que eran prácticamente lanzamientos de moneda. Las diferencias de precisión corresponden a esos empates, no a un cambio de calidad. En el mismo M1 Max, la referencia PyTorch MPS tardaba una mediana de 4,7 s por registro de evaluación (2-4 decisiones), mientras que la build de 8 bits tarda 0,43 s.

## Requisitos de hardware

- VRAM/pico de memoria estimado: 26,9 GB para la build de 8 bits; la variante de 4 bits baja a 14,3 GB.
- Descarga en disco: 25 GB (8 bits) y 13 GB (4 bits).
- GPU recomendadas: no disponible; la build está pensada para Apple Silicon con MLX. La model card ofrece tiempos en un M1 Max de 64 GB.
- Compatibilidad con GPU de consumo: no aplica en el sentido x86/CUDA, ya que el formato es MLX para Apple Silicon. En Macs, macOS permite que la GPU fije por defecto solo en torno al 70-75 % de la RAM, por lo que la model card recomienda planificar un Mac de 48 GB para la build de 8 bits y un Mac de 24 GB para la de 4 bits.
- Opciones de despliegue: `mlx-lm` (versión 0.32.0) con `mlx` 0.32.3, sin necesidad de torch; el repositorio incluye `gev_mlx.py` con subcomandos `predict` y `serve` para levantar un servidor local en el puerto indicado (por defecto 127.0.0.1). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en un M1 Max, mediana de 0,18 s por decisión sí/no y 0,24 s para 4 opciones en la build de 8 bits; la build de 4 bits rinde 0,19 s y 0,25 s respectivamente. Ambas builds corren a la misma velocidad en ese chip, por lo que la de 4 bits está pensada sobre todo para Macs con menos memoria. El servidor atiende una petición a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Avicennasis/GEV-26B-Decide-mlx-8bit | 25,2 B | no disponible | MLX 8-bit, group size 64 | apache-2.0 | HuggingFace, MLX | Texto, System 1, cabeza de decision de 24 slots; 26,9 GB de pico |
| Avicennasis/GEV-26B-Decide-mlx-4bit | 25,2 B | no disponible | MLX 4-bit | apache-2.0 | HuggingFace, MLX | Misma familia; 14,3 GB de pico; misma velocidad en M1 Max |
| autotrust/GEV-26B-Decide | 25,2 B | no disponible | bf16 (referencia) | no disponible en la informacion proporcionada | HuggingFace | Implementacion de referencia en transformers + peft; incluye System 2 (thinking) y torre de vision |

No se dispone de datos de benchmarks estándar para establecer comparaciones de rendimiento con modelos de clasificación alternativos.

## Limitaciones y advertencias

- No es un modelo de chat: aunque `mlx_lm.generate` lo carga, el texto generado no es significativo. Las decisiones deben obtenerse exclusivamente a través de la cabeza de decisión y del script `gev_mlx.py`.
- Solo System 1: el "pensamiento adaptativo" (System 2, razonamiento Gemma 4 sin modificar) no está incluido en esta build.
- Solo texto: la torre de visión se ha eliminado, de modo que no procesa imágenes.
- Idioma: únicamente inglés declarado; no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación: no disponible como dato explícito; al tratarse de un modelo de clasificación con probabilidades calibradas, el riesgo principal es emitir una opción con confianza mal calibrada. La model card recomienda usar `calibration_gold.json` cuando se condicionen acciones automáticas a la confianza.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: apache-2.0, que permite uso comercial, modificación y redistribución siempre que se conserven los avisos de copyright y licencia. Se debe verificar la licencia del modelo base autotrust/GEV-26B-Decide, ya que no se especifica en la información proporcionada.
- Servidor local sin autenticación: el endpoint `serve` no implementa autenticación y ata por defecto a 127.0.0.1; la model card recomienda mantener ese binding salvo que se coloque un proxy propio por delante.
- Atiende una petición a la vez: el servidor local no está pensado para concurrencia alta.
- El repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son del 6 de octubre de 2026, lo que indica un modelo reciente sin comunidad establecida.
- Consumo de memoria elevado para Apple Silicon: la build de 8 bits requiere planificar un Mac de 48 GB, dado que macOS limita por defecto el cableado de la GPU a en torno al 70-75 % de la RAM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/GEV-26B-Decide-mlx-8bit
- Variante 4-bit: https://huggingface.co/Avicennasis/GEV-26B-Decide-mlx-4bit
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.

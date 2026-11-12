# mrtpk/Qwen3.5-0.8B-wsp-tool-use

## Resumen

`mrtpk/Qwen3.5-0.8B-wsp-tool-use` es un artefacto de investigación publicado por el usuario mrtpk sobre el modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Cloud. No es un fine-tune convencional: se trata de una edición en el espacio de pesos (weight-space programming) que reprograma dos neuronas de la capa 23 del MLP. La intervención modifica 6.141 valores repartidos en 3 tensores (`gate_proj`, `up_proj` y `down_proj`); el resto de pesos, incluido el codificador visual, permanece idéntico al modelo base. No se empleó entrenamiento por gradiente sobre los pesos del modelo.

El objetivo del edit es modificar la política de decisión del modelo: que invoque una herramienta cuando la llamada es necesaria y que responda en texto cuando no procede. El modelo conserva la arquitectura, el tokenizador y la plantilla de chat del base, con 873.438.784 parámetros totales y licencia Apache 2.0. El autor lo describe explícitamente como un artefacto de investigación, no como un modelo de tool calling listo para producción: la mejora es pequeña, solo resulta clara en modo thinking y está sesgada al alza por el procedimiento de selección.

La relevancia reside en el método más que en el resultado: demuestra que una edición quirúrgica de dos neuronas puede mover la métrica BFCL-V4 de un modelo de menos de mil millones de parámetros sin reentrenar. Es útil para investigadores interesados en interpretabilidad, edición de modelos y control fino del comportamiento de llamada a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-0.8B; edición en el MLP de la capa 23 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el repo ocupa 1,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (licencia del modelo base) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica la edición v7 del estudio de weight-space programming. Cada neurona programada calcula aproximadamente `h = silu(g·x) · (r·x − θ)` sobre la entrada `x` del MLP de la capa 23 y escribe `K · h · u` en el residual stream. Los componentes se obtuvieron con ajustes estadísticos sobre activaciones del modelo base: `g` (fila de `gate_proj`) es una regresión ridge que abre la neurona solo en posiciones de decisión de herramienta; `r` y `θ` (fila de `up_proj`) son un LDA regularizado que lee «aquí hace falta una llamada»; y `u` (columna de `down_proj`) es una dirección de escritura calculada a partir de los embeddings que eleva el token `<tool_call>` sin alterar sustancialmente los 4.000 tokens más frecuentes de las salidas de práctica. La neurona 1488 actúa en modo non-thinking y la 1152 en modo thinking.

No hubo entrenamiento por gradiente de los pesos. Los ajustes usaron datos públicos de práctica (ToolACE, APIGen-MT-5k y When2Call, este último solo a través de la compuerta de la neurona 1488) y activaciones del modelo base, no datos de BFCL. `glaive-function-calling-v2` se empleó únicamente como conjunto de test. El agente que ejecutó la edición fue Claude con el protocolo OpenWSP. La edición direcciona 6.144 valores, de los cuales 3 conservan su valor base en bfloat16, por lo que cambian 6.141. El archivo `wsp_edit.json` documenta nombres de tensores, formas, recuentos de valores modificados y hashes SHA-256.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador visual idéntico al del base.
- Tool calling / function calling en formato OpenAI, con decisión de invocar o no según el contexto.
- Modo thinking (`enable_thinking=True`) y modo non-thinking, con efecto del edit principalmente en thinking.
- Plantilla de chat compatible con definiciones de herramientas y parser `qwen3_coder` en vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio, agentes multi-paso ni decodificación especulativa específicas de esta edición.

## Casos de uso

- Investigación en edición de modelos: reproducir el experimento aplicando la edición v7 sobre el base y comparando activaciones y salidas antes y después, usando `wsp_edit.json` y los scripts del repositorio de GitHub.
- Estudio de interpretabilidad de neuronas: analizar cómo dos neuronas del MLP de la capa 23 codifican la decisión de llamar a una herramienta y qué dirección de escritura en el residual stream eleva el token `<tool_call>`.
- Evaluación de políticas de tool calling en modelos pequeños: usar el modelo como caso de estudio en pipelines de evaluación BFCL-V4 con vLLM, comparando thinking y non-thinking con el base.
- Prototipado de asistentes con herramientas en entornos de laboratorio: probar plantillas de chat con `tools` en formato OpenAI y el parser `qwen3_coder` antes de escalar a modelos mayores.
- Docencia y divulgación: ilustrar la diferencia entre fine-tuning por gradiente y edición en espacio de pesos con un ejemplo reproducible de menos de mil millones de parámetros.
- Análisis de compromisos false call / correct call: estudiar la frontera entre detección de irrelevancia y precisión AST que el propio autor documenta como no resuelta por ninguna edición probada.

## Benchmarks y rendimiento

Resultados publicados por el autor en BFCL-V4 overall, con la prueba de web search no ejecutada y contada como 0:

| Modelo | BFCL-V4 thinking | BFCL-V4 non-thinking |
|---|---|---|
| Base Qwen3.5-0.8B | 20,46 (2 semillas); 20,84 (3 semillas) | 17,68 (2 semillas) |
| v7 (este modelo) | 22,54 (3 semillas: 22,65, 22,42, 22,56) | 19,55 (2 semillas) |
| E4b (edición de estudio anterior, no en este repo) | 21,49 (2 semillas) | 20,29 (2 semillas) |

Semillas del base en thinking: 20,04, 20,88 y 21,59. La semilla más baja de v7 supera a la más alta del base. La dispersión entre semillas es de 0,5 a 1,5 puntos. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,8 GB en bfloat16, por lo que la inferencia en precisión nativa requiere del orden de 2 GB de VRAM más overhead de activaciones y caché KV; no se dispone de cifras oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos en bf16.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (menos de mil millones de parámetros); no se especifican modelos concretos.
- Despliegue: transformers (`AutoModelForImageTextToText`, `AutoProcessor`) y vLLM 0.30.0 con los flags `--language-model-only --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser qwen3`. No se documentan opciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración de muestreo del estudio fue temperature 1.0, top-p 0.95, top-k 20, presence penalty 1.5 y máximo 16.384 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BFCL-V4 thinking | BFCL-V4 non-thinking | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-wsp-tool-use (v7) | 873 M | no disponible | 22,54 | 19,55 | Apache 2.0 |
| Qwen3.5-0.8B (base) | 873 M | no disponible | 20,46-20,84 | 17,68 | Apache 2.0 |
| E4b (edición anterior, no publicada aquí) | no disponible | no disponible | 21,49 | 20,29 | no disponible |

No se dispone de datos para comparar con otros modelos de tool calling de tamaño similar fuera de la familia del estudio.

## Limitaciones y advertencias

- El propio autor lo califica como artefacto de investigación y no como un modelo mejor para producción.
- Sesgo de selección: los scores BFCL se usaron para elegir v7 entre cuatro candidatos y los diseños v2 (runs 2 y 3) vieron scores BFCL. No existe test ciego, por lo que la ganancia es optimista.
- En modo non-thinking, v7 (19,55) supera al base (17,68) pero queda por debajo de E4b (20,29).
- El edit desplaza el modelo a lo largo de un compromiso entre falsas llamadas y llamadas correctas: en thinking, ninguna edición probada elevó la detección de irrelevancia sin perder precisión AST (media de non-live y live).
- No corrige valores de argumentos incorrectos, estado multi-turno ni memoria.
- Solo se midió BFCL-V4; no se evaluaron tras la edición las demás capacidades del base (chat general, matemáticas, visión).
- La plantilla de chat arranca en modo non-thinking por defecto, mientras que la mejora se concentra en thinking; es necesario activar `enable_thinking=True`.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta edición; heredados del modelo base.
- Idiomas soportados no disponibles en la información proporcionada.
- Licencia Apache 2.0, la misma del base de Qwen; los cambios se limitan a los 3 tensores listados en `wsp_edit.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtpk/Qwen3.5-0.8B-wsp-tool-use
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Estudio, código y logs: https://github.com/mrtpk/wsp-qwen-tools
- Write-up del experimento: https://github.com/mrtpk/kaizen/tree/master/learnings/20261112_wsp_qwen_tool_use
- Método (Sparks of Weight-Space Programming): https://rikiyat.github.io/blog/weight-space-programming
- Protocolo OpenWSP: https://github.com/openwsp/openwsp

# m8than/GLM-5.2-DFlash2-B12-Writer

## Resumen

GLM-5.2-DFlash2-B12-Writer es un borrador (draft) experimental de decodificacion especulativa de 2.289.554.560 parametros, publicado por el usuario m8than bajo un pipeline de "Furnace". No es un modelo de lenguaje autonomo: se usa exclusivamente junto a GLM-5.2 y al runtime Furnace para proponer tokens que el modelo objetivo verifica. Su arquitectura es `DFlash2DraftModel`, un transformer de seis capas con atencion completa y un block size de 12 (un ancla objetivo mas once posiciones propuestas).

El modelo es un ajuste fino continuado sobre el draft anterior ya entrenado en conversaciones, inicializado desde un checkpoint propio (no desde cero ni directamente desde el donante de backbone). Se continua durante una epoca adicional sobre una instantanea congelada de 966 conversaciones, con step seleccionado 712 y learning rate 3e-5. La evaluacion emparejada eleva la aceptacion del draft del 8,32% al 9,77%, aunque los resultados de velocidad son mixtos y no se reclama una ganancia de calidad de tarea.

Es relevante en el contexto de la inferencia especulativa para modelos grandes: los drafts ligeros permiten acelerar la generacion si el modelo objetivo acepta sus propuestas. En este caso, el autor indica explicitamente que este checkpoint no fue promovido sobre el draft anterior en el servidor de origen y se publica por separado para preservar el modelo publico previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2DraftModel (transformer de 6 capas, atencion completa, sin sliding-window) |
| Parametros totales | 2.289.554.560 (~2,29B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento limitado a 8.192 tokens; ejemplos por encima del limite fueron excluidos) |
| Tipos de cuantizacion | BF16 (pesos safetensors); el lanzamiento usa `--speculative-draft-model-quantization unquant` y KV cache en bfloat16 |
| Idiomas soportados | no disponible (la evaluacion cubre 12 idiomas, sin desglose publicado) |
| Licencia | no disponible (la model card se interrumpe; el modelo objetivo declara MIT) |
| Formato de pesos | safetensors |
| Capas | 6 |
| Tamano oculto | 6.144 |
| Cabezas de consulta | 64 |
| Cabezas KV | 8 |
| Dimension de cabeza | 96 |
| Capas objetivo | [1, 16, 31, 45, 60, 75] |
| Block size | 12 (1 ancla objetivo + 11 posiciones propuestas) |
| Modelo base | SubconsciousDev/glm-5.2-fp8-dflash-v2 (finetune) |
| Runtime requerido | Furnace (con backend de atencion Triton) |
| Tamano del repositorio | 4,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa `DFlash2DraftModel`, con seis capas, tamano oculto de 6.144, 64 cabezas de consulta, ocho cabezas KV y dimension de cabeza 96. Emplea atencion completa (no una arquitectura de ventana deslizante) y opera sobre las capas objetivo [1, 16, 31, 45, 60, 75]. Su block size de 12 define un ancla objetivo mas once posiciones propuestas por bloque, que el modelo objetivo verifica; el autor aclara que el block size no garantiza la aceptacion. El draft usa el tokenizer, el embedding y la cabeza de salida del modelo objetivo, y no incluye pesos del objetivo.

El entrenamiento es una continuacion de una epoca sobre una instantanea congelada de 966 conversaciones (852 de entrenamiento, 62 de validacion, 52 de test), partiendo del draft anterior entrenado en conversaciones (SHA256 `955e12ab...d2eb84`). Dentro del limite de 8.192 tokens se usaron 5.693 ejemplos de entrenamiento con 36.096.263 tokens de secuencia y 521.112 tokens de asistente supervisados, mas 397 ejemplos de validacion con 35.225 tokens supervisados. Las respuestas eran salidas existentes de `zai-org/GLM-5.2` re-tokenizadas localmente con un token de parada anadido. Los estados ocultos del profesor se capturaron con Furnace GLM-5.2-FP8 a atencion completa (revision `f33c6dc5...`). El entrenamiento combina etiquetas duras con estados ocultos del profesor, no destilacion KL de log-probabilidades suaves. Se ejecuto una epoca, 712 steps, con batch global de ocho sobre ocho GPU MI325X. Dos pruebas de LR de 32 steps compararon 3e-5 y 1e-4, seleccionando 3e-5.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa: produce hasta once tokens candidatos por bloque (block size 12) que el modelo objetivo GLM-5.2 verifica.
- Aceleracion de inferencia del modelo objetivo: solo funciona como borrador acoplado a GLM-5.2 dentro del runtime Furnace.
- Condicionamiento por contexto completo de conversacion: el draft es sensible a todo el historial, aunque solo la respuesta final del asistente contribuye a la perdida.
- Soporte de tool calling / function calling: no disponible para este draft por si mismo (depende del modelo objetivo).
- Soporte de agentes y razonamiento multi-step: no aplica directamente al draft.
- Capacidades multilingues: la evaluacion cubre 12 idiomas, pero no se publica desglose de calidad por idioma.
- Modo "thinking": no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Servicio de inferencia acelerada de GLM-5.2: integrar el draft en el runtime Furnace con los flags `--speculative-algorithm DFLASH` y `--speculative-dflash-block-size 12` para proponer tokens y reducir el coste de decodificacion del modelo objetivo cuando la aceptacion lo permite.
- Despliegue en closters con GPU AMD MI325X: el autor documenta una receta TP8 MI325X en `START_COMMANDS.md` de Furnace, adecuada para entornos ROCm.
- Investigacion en decodificacion especulativa: permite estudiar la relacion entre aceptacion del draft y velocidad efectiva, usando los datos de aceptacion emparejada publicados.
- Comparacion de drafts en pipelines de investigacion: sirve como checkpoint de referencia frente al draft previo entrenado en conversaciones, manteniendo ambos publicos.
- Entornos de baja latencia por token con contexto largo: segun los datos, la velocidad efectiva de prefill mejora a medida que crece la entrada (hasta 20.502,5 tok/s de prefill efectivo con 32.768 tokens de entrada).
- Experimentacion educativa sobre DFlash2: util para comprender el diseno de borradores con block size fijo y verificacion por el objetivo.
- Preservacion de linaje de modelos: al publicarse por separado, facilita reproducir experimentos previos sin sobrescribir el draft anterior.

## Benchmarks y rendimiento

Evaluacion emparejada de aceptacion (43 prompts de 12 familias de conversacion retenidas, 12 idiomas, temperature 0, top-p 1, hasta 256 tokens, concurrencia 4; objetivo E2M1 GLM-5.2 con prefill superfast de Furnace, TP8 sobre ocho MI325X, KV cache BF16). La aceptacion se define como tokens aceptados entre tokens propuestos.

| Draft | Aceptados / propuestos | Aceptacion | Tokens de salida / verificacion |
| --- | ---: | ---: | ---: |
| Draft previo entrenado en conversaciones | 2.421 / 29.084 | 8,3242% | 1,9119 |
| Esta actualizacion | 2.649 / 27.126 | 9,7655% | 2,0673 |

Pruebas separadas de velocidad en flujo unico (256 tokens de salida, cache frio, un warmup excluido y tres ensayos medidos por contexto; valores medianos):

| Tokens de entrada | Decode antes (tok/s) | Decode nuevo (tok/s) | Prefill efectivo nuevo (tok/s) |
| ---: | ---: | ---: | ---: |
| 1.024 | 258,6 | 211,2 | 9.785,5 |
| 8.192 | 174,2 | 147,7 | 19.428,5 |
| 32.768 | 169,1 | 175,8 | 20.502,5 |

El autor aclara que no se reclama una victoria consistente de velocidad ni un decode sostenido de 250 tok/s, que la comparacion con la version publica preconversacional (17,08%) no es head-to-head (distinto test y setup) y que no se ejecuto un benchmark amplio de calidad de tarea para este draft.

## Requisitos de hardware

- VRAM estimada para el draft en BF16: aproximadamente 4,6 GB solo para los pesos (2,29B parametros), mas el coste de la cache KV en bfloat16.
- VRAM total del sistema: la suma del draft mas el modelo objetivo GLM-5.2; el objetivo cuantizado E2M1 es considerablemente mayor y no cabe en GPU de consumo.
- GPU documentadas: receta TP8 sobre ocho AMD MI325X (ROCm). El autor indica que el lanzamiento de referencia usa TP8 MI325X.
- GPU de consumo: el draft por si solo cabria en GPUs de consumo, pero no es funcional sin el modelo objetivo, que excede la VRAM de consumo.
- Opciones de despliegue: runtime Furnace con backend de atencion Triton para el draft, KV cache bfloat16 y cuantizacion `unquant`. No se valida con versiones arbitrarias de SGLang upstream ni con GLM-5.3.
- Latencia y throughput: segun las medianas publicadas, el decode nuevo ronda 211,2 tok/s con 1.024 tokens de entrada, 147,7 tok/s con 8.192 y 175,8 tok/s con 32.768; el prefill efectivo va de 9.785,5 a 20.502,5 tok/s. No se publican intervalos de confianza, solo minimos y maximos observados en `metrics.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion | Licencia | Disponibilidad |
| --- | ---: | ---: | ---: | --- | --- |
| GLM-5.2-DFlash2-B12-Writer (este) | 2,29B | no disponible (entrenamiento 8.192) | 9,7655% (test emparejado) | no disponible | publico en HuggingFace |
| Draft previo entrenado en conversaciones | no disponible | no disponible | 8,3242% (mismo test) | no disponible | checkpoint previo del autor |
| Release publica preconversacional | no disponible | no disponible | 17,08% (test y setup distintos) | no disponible | publica previa del autor |

No se dispone de datos de otros drafts de decodificacion especulativa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: no incluye pesos del objetivo, tokenizer, embedding ni cabeza de salida; requiere GLM-5.2 y el runtime Furnace.
- Compatibilidad restringida: no validado con versiones arbitrarias de SGLang upstream ni con GLM-5.3.
- Ganancia de aceptacion modesta: 9,77% frente a 8,32%, con resultados de velocidad mixtos y sin mejora demostrada de calidad de tarea.
- El checkpoint no fue promovido sobre el draft anterior en el servidor de origen.
- Riesgo de alucinacion: inherente al modelo objetivo; el draft solo propone tokens que el objetivo verifica.
- Sesgos: no documentados en la informacion disponible.
- Limitaciones de contexto: los ejemplos de entrenamiento por encima de 8.192 tokens fueron excluidos, no truncados.
- Restricciones de licencia: no disponible; la model card se interrumpe en la seccion de licencia. El modelo objetivo declara MIT, pero la licencia de este repositorio no se especifica, por lo que el uso comercial queda sin garantia explicita.
- Linaje de datos: la descripcion de datos solo-asistente aplica a esta actualizacion, no a toda la linea de modelos anterior.
- Advertencia de produccion: el autor indica que no se retesto un despliegue en maquina limpia para la publicacion.
- Fecha de creacion futura (2026-10-15) en los metadatos de HuggingFace.

## Enlaces

- HuggingFace: https://huggingface.co/m8than/GLM-5.2-DFlash2-B12-Writer
- Modelo base: https://huggingface.co/SubconsciousDev/glm-5.2-fp8-dflash-v2
- Runtime Furnace: https://github.com/m8than/furnace/tree/647d2a72f03b693cfd412af09a7e59aafd5affa3
- Objetivo cuantizado publicado: https://huggingface.co/m8than/GLM-5.2-E2M1-Furnace
- Documentacion de lanzamiento (START_COMMANDS.md): incluida en el repositorio de Furnace
- Modelo objetivo de referencia: zai-org/GLM-5.2

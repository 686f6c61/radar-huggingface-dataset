# erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r128-2ep-kl

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un checkpoint de entrenamiento de un *drafter* (modelo borrador) para decodificación especulativa. Se trata de una adaptación LoRA del drafter `z-lab/Qwen3-8B-DFlash-b16`, entrenada para acelerar la inferencia del modelo objetivo `Qwen/Qwen3-8B` mediante la técnica DFlash de decodificación especulativa. El autor, `erdem-erdem`, lo publica como parte de una línea de experimentos denominada dyn-spec, orientada a generar borradores que propongan varios tokens por paso y que el modelo grande verifique en paralelo.

El artefacto es un checkpoint intermedio de la etapa de *pretraining* del brazo `fresh_lora`, con estado del optimizador incluido, resultados de validación sobre 200 filas fijas y evaluaciones offline. No es un paquete listo para servir: la propia model card indica que la exportación de servicio DFlash aún no se ha portado. Por tanto, su utilidad es de investigación y reproducción de experimentos, no de despliegue directo en producción.

La relevancia es acotada pero clara para quien trabaje en optimización de inferencia: documenta con detalle la procedencia (SHA de git, SHA256 del checkpoint, identidad del almacén de activaciones) y muestra una mejora medible del acierto del drafter entre el paso 0 y el 2667, lo que permite auditar la metodología y reutilizar el pipeline.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un drafter DFlash (modelo borrador para decodificación especulativa); arquitectura del drafter base no detallada en la información disponible |
| Parametros totales | no disponible (el repositorio ocupa 0,1 GB e incluye checkpoint con estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), dentro de `run/pretraining/abl24k-static-lora-attn-r128-2ep-kl/` |

## Arquitectura y entrenamiento

El objeto entrenado es una LoRA de rango 128 aplicada a las capas de atención (`attn-r128`) del drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`, fijado en el commit `9b41424b7109f9c5413454f481b09a82b85333f4`. El entrenamiento se realizó en el brazo `fresh_lora`, etapa `pretraining`, durante 2667 actualizaciones con semilla 42, sobre un almacén de activaciones de 24 000 ejemplos (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`). La configuración se describe como estática (`static`), de dos épocas (`2ep`) y con una pérdida KL (`kl`). El modelo objetivo es `Qwen/Qwen3-8B`, cuya identidad de almacén se registra en `provenance/store/`.

La innovación metodológica no está en la arquitectura del modelo, sino en el procedimiento: el entrenamiento del drafter se hace sobre activaciones precalculadas del modelo objetivo (almacén de activaciones), lo que abarata el coste de ajuste, y todo el proceso queda trazado con SHA de git (`b3ec3121...`), SHA256 del checkpoint (`538361d5...`) y registros de lanzamiento de vLLM. El resultado de validación sobre 200 filas fijas, una por LoRA, muestra `full_acc` de 0,5265 en el paso 0 frente a 0,5346 en el paso 2667, y una longitud media aceptada (τ, eal) de 7,703 a 7,903 tokens. Por categorías, el paso 2667 alcanza 0,3518 en chat, 0,6069 en código, 0,6846 en matemáticas y 0,4952 en STEM. No se documentan datos sobre volumen de tokens de entrenamiento ni sobre uso de RLHF o DPO.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa sobre `Qwen/Qwen3-8B`: el drafter propone secuencias que el modelo objetivo verifica.
- Aceptación media de aproximadamente 7,9 tokens por paso en validación (τ eal), lo que determina la ganancia potencial de velocidad.
- Ajuste especializado por dominio: el checkpoint muestra mejor aceptación en código (0,6069) y matemáticas (0,6846) que en chat (0,3518).
- No es un modelo conversacional: no genera respuestas finales por sí mismo, sino candidatos para verificación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el modelo objetivo es Qwen3-8B, pero el repositorio no declara idiomas.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en cargas de código: el drafter alcanza 0,6069 de acierto en la categoría code, por lo que resulta adecuado para pipelines de autocompletado o generación de parches donde la verificación paralela de tokens reduce la latencia por token emitido.
- Aceleración en cargas matemáticas y STEM: con 0,6846 y 0,4952 de acierto respectivamente, el borrador es útil en asistentes de resolución de problemas donde las salidas son altamente predecibles y la tasa de aceptación se mantiene alta.
- Investigación en decodificación especulativa: el repositorio incluye `speculators.patch`, `train_command.txt` y el registro completo de procedencia, lo que permite reproducir el experimento y comparar variantes de LoRA (rango, capas, épocas).
- Ajuste de drafters con presupuesto reducido: al entrenar sobre un almacén de activaciones precalculado, sirve como plantilla para equipos que quieran adaptar un drafter a su propio modelo objetivo sin reentrenar desde cero.
- Evaluación comparativa de estrategias de borrador: los resultados de `run/offline_eval/` (reproducción, coeficientes M4, donantes M7, similitud D13, coste D14) permiten analizar el equilibrio entre tasa de aceptación y coste computacional.
- Auditoría de artefactos de ML: el `MANIFEST.json` con tamaño y SHA256 de cada fichero facilita la verificación de integridad en entornos regulados o en revisiones internas de modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación del propio drafter sobre 200 filas fijas, no benchmarks estándar de LLM (MMLU, HumanEval, GSM8K).

| Actualización | full_acc | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5346 | 7,903 | 0,3518 | 0,6069 | 0,6846 | 0,4952 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero incluye estado del optimizador y no es un paquete de servicio; el consumo real depende del drafter base y de Qwen3-8B.
- GPU recomendadas: no disponibles en la información proporcionada. Para el modelo objetivo Qwen3-8B se requeriría una GPU con al menos 16-24 GB en cuantización de 8-16 bits, pero este dato no lo aporta el repositorio.
- Compatibilidad con GPU de consumo: no confirmada; el drafter en sí es pequeño, pero el sistema completo incluye Qwen3-8B.
- Opciones de despliegue: el autor menciona vLLM en la procedencia (`provenance/store/` con registros de lanzamiento de vLLM), pero advierte que la exportación de servicio DFlash no está portada, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la métrica τ de 7,903 tokens aceptados por paso es un indicador indirecto del potencial de aceleración, no una medida de rendimiento absoluto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| dyn-spec-dflash-abl24k-static-lora-attn-r128-2ep-kl | LoRA sobre drafter DFlash | no disponible | no disponible | no disponible | Checkpoint de entrenamiento, no servible |
| z-lab/Qwen3-8B-DFlash-b16 | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo base del que parte esta adaptación |
| Qwen/Qwen3-8B | LLM objetivo | 8 000 M (aprox.) | no disponible en este repositorio | no disponible en este repositorio | Modelo verificado por el drafter |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a la relación estructural entre ellas.

## Limitaciones y advertencias

- No es un modelo desplegable: la model card indica explícitamente que la exportación de servicio DFlash no está portada; solo contiene el checkpoint de entrenamiento con estado del optimizador.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; el repositorio no incluye términos de licencia.
- Idiomas no declarados: no hay información sobre cobertura lingüística del drafter ni de su comportamiento fuera del inglés.
- Sesgos: no documentados; al ser un borrador que propone tokens, hereda los sesgos del modelo objetivo y de los datos del almacén de activaciones, pero no se analizan.
- Riesgo de alucinación: bajo en el sentido de que el modelo objetivo verifica cada token propuesto; el drafter no emite salidas finales sin validación.
- Mejora marginal: la ganancia entre el paso 0 y el 2667 es de 0,0081 en `full_acc` y 0,2 tokens en τ, lo que sugiere un retorno decreciente del ajuste y obliga a validar si compensa el coste.
- Dependencia de versiones: el resultado está atado a un commit concreto del drafter base y a un almacén de activaciones específico; cambios en cualquiera de los dos invalidan la reproducibilidad.
- Sin garantías de producción: no hay métricas de latencia, throughput ni consumo de memoria publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-abl24k-static-lora-attn-r128-2ep-kl
- Almacén de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`); URL no disponible en la información proporcionada
- Modelo objetivo: `Qwen/Qwen3-8B`; URL no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada

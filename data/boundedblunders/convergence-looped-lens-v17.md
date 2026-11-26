# boundedblunders/convergence-looped-lens-v17

## Resumen

`convergence-looped-lens-v17` (nombre interno `HYB-B6`) es un artefacto de interpretabilidad presentado por el equipo *convergence* como entrada número 17 al *Looped Lens Challenge*. No es un modelo de lenguaje completo, sino un conjunto de adaptadores residuales y vectores de direccionamiento (steering vectors) entrenados para el modelo `thinkingmachines/Inkling-2-Mini`, con el objetivo de manipular y sondear sus representaciones internas.

El artefacto contiene 16 tensores en `float16` (14,18 MB) que se dividen en dos familias: vectores de steering calibrados para dos visitas concretas del modelo base (`v35` y `v36`, de dimensión 2304) y adaptadores residuales de bajo rango (`r=256`) para seis visitas adicionales (`v42` a `v47`), que operan sobre capas congeladas del sufijo del modelo base. El diseño es estrictamente sin sesgo (`zero bias`), con valores finitos garantizados y con un modo de activación que puede desactivarse (`none`), activarse en modo `dm` o en modo `dq`.

Su relevancia es acotada pero específica: se trata de una herramienta de investigación para el estudio de *logit lens* y de la dinámica de representaciones en modelos con arquitecturas de tipo *looped* (capas repetidas). No está pensada para inferencia generativa general, sino para experimentos de interpretabilidad sobre un modelo base concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores residuales de bajo rango y vectores de steering sobre un transformer congelado (`thinkingmachines/Inkling-2-Mini`) |
| Parametros totales | 16 tensores, 14,18 MB en `float16` (recuento de parametros no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera con `L=1`, sin contexto de prompt) |
| Tipos de cuantizacion | `float16` (unico formato publicado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El artefacto se compone de dos bloques. El primero son vectores de steering `steer.v35.{dq,dm}` y `steer.v36.{dq,dm}`, cada uno de dimensión `[2304]`, calibrados para las visitas Coda 35 (capa `L11`, ronda `r2`, modo `pmg`) y 36 (capa `L12`, ronda `r2`, modo `in`). Estos vectores incorporan una compuerta de modo que puede devolver `none`, `dm` o `dq`, permitiendo activar o desactivar la intervención según la condición.

El segundo bloque son seis adaptadores `v{42..47}.{a,b}.weight` con formas `[256, 2304]` y `[2304, 256]`, es decir, descomposiciones de bajo rango con `r=256`. Estos adaptadores son estrictamente de un solo vector (`L=1`), equivariantes a escala y sin sesgo, y se aplican sobre las capas de sufijo congeladas `L_{v-24}..L23` más `final_input`. La inferencia se realiza sin contexto de prompt-token (`attention_mask=None`, `conv_mask=None`). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Intervención sobre representaciones internas del modelo base `thinkingmachines/Inkling-2-Mini` mediante vectores de steering calibrados.
- Adaptación residual de bajo rango sobre capas de sufijo congeladas, sin modificar los pesos del modelo base.
- Compuerta de activación por visita (`none`/`dm`/`dq`) que permite controlar cuándo se aplica la intervención.
- Operación en modo de un solo token (`L=1`), sin necesidad de contexto de prompt.
- Soporte de un pool fijo de 10 visitas: `[12, 24, 35, 36, 42, 43, 44, 45, 46, 47]`, con una única selección determinista de posición `t*` por visita.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un artefacto de interpretabilidad, no un modelo generativo.

## Casos de uso

- Análisis de *logit lens*: aplicar los adaptadores `v42` a `v47` sobre las capas de sufijo congeladas para proyectar activaciones intermedias al espacio de vocabulario y estudiar cómo evoluciona la predicción a lo largo de las capas.
- Estudio de dinámica de capas repetidas (*looped*): usar los vectores `v35` y `v36` para intervenir en capas `L11` y `L12` en la segunda ronda y observar el efecto sobre las rondas posteriores del modelo base.
- Experimentos de *steering* controlado: activar o desactivar la compuerta `none`/`dm`/`dq` para comparar el comportamiento del modelo con y sin intervención en la misma visita, aislando el efecto causal de la dirección.
- Reproducción de resultados del *Looped Lens Challenge*: el pool fijo de 10 visitas y la posición determinista `t*` permiten replicar exactamente las condiciones del envío número 17.
- Auditoría de representaciones: inspeccionar si las direcciones calibradas son estables entre prompts y si la selección de posición `t*` introduce sesgo en la lectura.
- Investigación de equivarianza a escala: los adaptadores están diseñados como equivariantes a escala, lo que permite estudiar cómo responde la representación ante cambios de magnitud en la activación de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el artefacto en sí (14,18 MB en `float16`); el consumo real lo determina el modelo base `thinkingmachines/Inkling-2-Mini`, cuyos requisitos no están disponibles.
- GPU recomendadas: cualquier GPU con soporte de `float16` y al menos la VRAM necesaria para el modelo base; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: probable para el artefacto, condicionada al modelo base; no confirmado.
- Opciones de despliegue: carga directa de `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de la misma categoría (adaptadores de interpretabilidad para el *Looped Lens Challenge* sobre `thinkingmachines/Inkling-2-Mini`).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts de forma autónoma; su uso requiere el modelo base `thinkingmachines/Inkling-2-Mini`.
- Dependencia estricta del modelo base: los tensores están calibrados para visitas y capas concretas (`L11`, `L12`, sufijo `L_{v-24}..L23`); no son transferibles a otros modelos.
- Pool de visitas fijo y posición determinista `t*`: no admite configuraciones arbitrarias de capa o posición.
- Modo de un solo token (`L=1`) y ausencia de contexto de prompt: no apto para tareas que requieran contexto multi-turno.
- Riesgo de sobreajuste a las condiciones del *challenge*: los resultados pueden no generalizar fuera del conjunto de evaluación original.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base subyacente puede tener su propia licencia, no verificada en la información disponible.
- Sin datos publicados sobre sesgos, alucinación o rendimiento en producción; no recomendado para despliegues en producción sin validación adicional.

## Enlaces

- [Hugging Face: boundedblunders/convergence-looped-lens-v17](https://huggingface.co/boundedblunders/convergence-looped-lens-v17)
- Modelo base referenciado: `thinkingmachines/Inkling-2-Mini` (enlace no disponible en la información proporcionada)
- Repositorio del *Looped Lens Challenge*: no disponible
- Paper o blog del equipo *convergence*: no disponible

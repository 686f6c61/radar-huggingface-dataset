# open-athena/Snowflake-d768-Base-262K-2026.10.19

## Resumen

Snowflake-d768-Base-262K-2026.10.19 es un checkpoint de investigación de tipo Mixture-of-Experts (MoE) desarrollado por open-athena dentro del ecosistema del proyecto Marin. Se trata de un modelo base (pre-SFT) de 2.039.270.912 parámetros totales con arquitectura `GrugMoeForCausalLM` (`grug_moe`), tamaño oculto de 768 y solo 8 capas, entrenado como parte de la "escalera de escalado" Snowflake, que extiende la longitud de contexto de modelos preentrenados de 8K a 64K y posteriormente a 262.144 tokens.

El modelo pertenece a la familia Snowball/Snowflake y se publica como artefacto de investigación, no como modelo listo para producción. El checkpoint corresponde al paso 294.226, exportado en BF16 safetensors tras las fases de extensión de contexto larga (64K y 262K), antes del ajuste supervisado (SFT) con Datakit. No incluye plantilla de chat ni la inicialización de tokens especiales usada al inicio del SFT.

Su relevancia es doble: por un lado, explora el uso de MoE de grano fino (256 expertos enrutados, 4 activos por token, más un experto compartido) en un modelo de dimensión pequeña; por otro, documenta el proceso de extensión de contexto hasta 262K con ventana deslizante de 2.048 tokens. El autor advierte explícitamente de que no ha sido evaluado ni probado en paridad de forward pass, generación o benchmarks de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GrugMoeForCausalLM` (`grug_moe`), transformer MoE |
| Parámetros totales | 2.039.270.912 |
| Parámetros activos | 4 expertos enrutados de 256, más 1 experto compartido por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 262.144 tokens (valor de configuración) |
| Tipos de cuantización | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (BF16) |
| Tamaño oculto / capas | 768 / 8 |
| Cabezas de atención / cabezas KV | 6 / 1 |
| Tamaño intermedio experto / compartido | 384 / 768 |
| Tamaño del vocabulario | 128.256 |
| Ventana deslizante | 2.048 tokens |
| Escalado de query (`qk_mult`) | 1,75 |
| Paso nativo del checkpoint | 294.226 |
| Tamaño del repo | 4,1 GB |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer con mezcla de expertos de grano fino: 256 expertos enrutados con tamaño intermedio de 384, de los cuales 4 se activan por token, más un experto compartido de tamaño 768. La atención emplea 6 cabezas de query y solo 1 cabeza KV (atención multi-query o GQA extrema), con ventana deslizante de 2.048 tokens y un factor de escalado de query de 1,75 antes del cálculo de las puntuaciones de atención. Con solo 8 capas y dimensión oculta de 768, la profundidad es inusualmente baja para un modelo de 2.000 millones de parámetros, lo que concentra la capacidad en la capa MoE y en el vocabulario de 128.256 tokens.

El entrenamiento sigue la "escalera" Snowflake: parte de modelos preentrenados más pequeños con contexto de 8K y extiende el contexto primero a 64K y luego a 262K. La model card indica que la escalera Snowball también entrenó a 8K sobre una segunda mezcla de datos antes de la extensión de contexto, pero esta escalera omite esa etapa, lo que constituye una limitación declarada del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; al ser un checkpoint pre-SFT, no se ha aplicado ajuste supervisado. La exportación incorpora una actualización diferida de sesgo del router (router bias) antes de la conversión a BF16, y cada tensor fue recargado y comparado exactamente con el checkpoint nativo transformado, con hashes SHA-256 registrados en `export_complete.json`.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation`), como modelo base preentrenado.
- Razonamiento y conocimiento general: capacidad no verificada, ya que no se han publicado evaluaciones.
- Código y matemáticas: no evaluado en la información disponible.
- Tool calling / function calling: no disponible; el checkpoint no incluye plantilla de chat ni tokens especiales de SFT.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.
- Contexto largo: configuración de hasta 262.144 tokens con ventana deslizante de 2.048, aunque la model card aclara que la longitud de contexto es un valor de configuración y no se ha evaluado a 262K.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre MoE de grano fino: el modelo permite estudiar el comportamiento de 256 expertos con 4 activos por token en una dimensión pequeña (768) y solo 8 capas, útil para analizar enrutamiento y especialización de expertos.
- Experimentos de extensión de contexto: sirve como artefacto para reproducir y comparar las fases de extensión de 8K a 64K y 262K dentro de la escalera Snowflake, usando la comparación de etapas publicada en el issue de Marin.
- Estudio de atención con ventana deslizante: la combinación de ventana de 2.048 tokens, 1 cabeza KV y `qk_mult` de 1,75 es un caso concreto para medir el impacto de estas decisiones en tareas de contexto largo.
- Base para SFT experimental: al ser un checkpoint pre-SFT sin tokens especiales inicializados, puede emplearse como punto de partida para pipelines de ajuste supervisado propios, aplicando previamente la inicialización de tokens especiales.
- Validación de herramientas de exportación y carga: los scripts `export.py`, `export_complete.json` y `source_config.json` permiten verificar la conversión BF16 y la paridad de tensores, útil para desarrolladores que construyan cargadores de arquitecturas no estándar.
- Reproducción de recetas de entrenamiento: el modelo documenta el paso nativo, la fuente en `gs://marin-us-central2/...` y la configuración de origen, lo que facilita experimentos de continuidad de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el release no ha sido probado con paridad de forward pass, generación, benchmarks de capacidades ni evaluación de contexto a 262K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos (2.039.270.912 parámetros × 2 bytes), más overhead de activaciones y caché KV.
- Caché KV: con 1 cabeza KV, 8 capas y dimensión de cabeza de 128 (768/6), la caché por token es reducida; a 262.144 tokens el coste sigue siendo considerable y debe calcularse según la implementación.
- GPU recomendadas: no disponible; no se han publicado pruebas de despliegue.
- Cabe en GPU de consumo: por tamaño de pesos, sí es plausible en GPUs con 8-16 GB, pero requiere un runtime con soporte de Grug MoE.
- Opciones de despliegue: no es compatible con Transformers estándar; requiere `SnowballConfig` y `SnowballLMHeadModel` de Marin (Levanter) mediante la API `load_hf_checkpoint`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowflake-d768-Base-262K | 2.039.270.912 | 262.144 | MoE (256 expertos, 4 activos) + compartido, 8 capas | openmdw-1.1 | HuggingFace, requiere runtime Marin |
| Alternativas de ~2B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables evaluados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor declara que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Sin evaluación de contexto: la longitud de 262.144 tokens es un valor de configuración; no se ha verificado el rendimiento real a esa longitud.
- Sin paridad de forward pass: no se ha comprobado que la inferencia reproduzca el comportamiento del entrenamiento.
- No compatible con Transformers estándar: requiere el runtime de Marin/Levanter con soporte de Grug MoE.
- Sin plantilla de chat ni tokens especiales de SFT: no es adecuado para uso conversacional directo sin un ajuste posterior.
- Etapa omitida en la escalera: la escalera Snowball entrenó a 8K sobre una segunda mezcla de datos antes de la extensión; esta escalera omite esa etapa, lo que limita la comparabilidad del experimento.
- Idiomas y sesgos: no se declaran idiomas soportados ni se documentan sesgos conocidos; el riesgo de alucinación no está caracterizado.
- Licencia openmdw-1.1: deben revisarse los términos exactos para uso comercial antes de cualquier despliegue productivo.
- Fecha del artefacto: el nombre del repositorio indica 2026.10.19 y el identificador de versión `2026.10.19.2`; conviene verificar la coherencia con la fecha de creación del repositorio (2026-11-03).

## Enlaces

- HuggingFace: https://huggingface.co/open-athena/Snowflake-d768-Base-262K-2026.10.19
- Issue de Marin #10753 (comparación de etapas): https://github.com/marin-community/marin/issues/10753
- Implementación `SnowballConfig` y `SnowballLMHeadModel`: https://github.com/marin-community/marin/blob/260d93767112780da77918f2c3394ee09608bf04/lib/levanter/src/levanter/models/snowball.py
- API `load_hf_checkpoint`: https://github.com/marin-community/marin/blob/260d93767112780da77918f2c3394ee09608bf04/lib/levanter/src/levanter/model_loading.py
- Repositorio Marin: https://github.com/marin-community/marin

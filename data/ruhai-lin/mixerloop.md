# ruhai-lin/MixerLoop

## Resumen

MixerLoop es un repositorio de pesos publicado por el usuario ruhai-lin en HuggingFace que agrupa checkpoints canónicos de dos familias de arquitecturas: Gated DeltaNet (GDN) y MixerLoop, esta última presumiblemente una variante con mecanismos de mezcla y recurrencia. El repositorio no contiene un único modelo entrenado, sino una colección organizada por arquitectura, conjunto de datos, presupuesto de tokens procesados y semilla de entrenamiento. Según la model card, los directorios que solo contienen un fichero `.gitkeep` son experimentos planificados y no modelos disponibles.

El interés del proyecto es fundamentalmente de investigación: se trata de modelos muy pequeños (13M y 100M parámetros) entrenados sobre ClimbMix con presupuestos de 1.000 millones y 10.000 millones de tokens procesados, respectivamente, y evaluados con el conjunto canónico de 22 tareas Karpathy CORE más el agregado Core_v2. Es material útil para estudiar el comportamiento de arquitecturas alternativas al transformer estándar (atención lineal y familias recurrentes) en escalas pequeñas y con protocolos de evaluación reproducibles.

La relevancia actual viene de su carácter de comparativa controlada: el repositorio mantiene versiones históricas intactas bajo `legacy/` y publica los resultados de evaluación en `eval/core_eval.csv` como fracciones, no porcentajes, lo que permite reproducir y contrastar experimentos sin mezclar protocolos de evaluación. El tamaño total del repositorio es de 6,9 GB, coherente con la acumulación de múltiples checkpoints de distintos tamaños y semillas. No se dispone de información sobre licencia, idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (GDN) y MixerLoop (según tags del repositorio: `gated-deltanet`, `mixerloop`); requiere registro de modelos personalizado |
| Parametros totales | MixerLoop-13m: 12.896.380; MixerLoop-100m: 100.447.266; GDN-100m: 100.444.194 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1.024 tokens en las ejecuciones de primera tanda documentadas; contexto maximo del modelo: no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos estándar en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería declarada: transformers) |

Notas adicionales de especificación: el repositorio declara compatibilidad con `endpoints_compatible` y región `us`; la fecha de creación registrada es 2026-07-23 y la de última actualización 2026-09-11. El tokenizador y los ficheros de generación son salidas reales de `save_pretrained()`.

## Arquitectura y entrenamiento

La model card identifica dos arquitecturas: Gated DeltaNet (GDN), una atención lineal con compuertas delta, y MixerLoop, cuya descripción interna no se detalla en la información disponible. Ambas requieren la biblioteca FLA (flash-linear-attention) y el código de registro de modelos de MixerLoop; un Transformers estándar sin esos registros no reconoce estos tipos de modelo. La carga se realiza mediante `AutoModelForCausalLM` y `AutoTokenizer` apuntando a un subdirectorio concreto, por ejemplo `mixerloop-13m/climbmix-10B-s1337`.

Los datos de entrenamiento documentados son ClimbMix. Las ejecuciones de primera tanda usan contexto 1.024 y batch global 128. Las ejecuciones de 1B contienen 7.630 pasos de optimizador (1.000.079.360 tokens procesados) y la ejecución de 10B contiene 76.294 pasos (10.000.007.168 tokens procesados), todas con semilla 1337. No se publican checkpoints de entrenamiento, estados del optimizador ni logs, y la model card no menciona uso de RLHF, DPO ni fases de alineación posteriores al preentrenamiento. La evaluación se realiza con pesos en FP32 y autocast en BF16, usando el bundle oficial de Karpathy y correcciones de referencia v2 en memoria (CommonsenseQA 40,3 %, LSAT AR 25 %, identificación de idioma 25 %).

## Capacidades

- Generación de texto autoregresiva en modelos causales pequeños (13M y 100M parámetros), con tokenizador propio publicado.
- Razonamiento básico y tareas de conocimiento evaluadas mediante el conjunto Karpathy CORE de 22 tareas (incluye tareas de sentido común, conocimiento factual y elección múltiple).
- Capacidad multilingüe: no disponible; no se documentan idiomas soportados ni evaluación específica de multilingüismo.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales: no se documentan modos de pensamiento (`thinking`), visión ni audio.
- Capacidad de reproducción experimental: el repositorio incluye el CSV de evaluación con las 22 tareas CORE y el agregado Core_v2, y conserva versiones históricas bajo `legacy/` con sus protocolos originales.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: comparar GDN frente a MixerLoop con idéntico presupuesto de tokens (1.000 millones o 10.000 millones) y misma semilla (1337) permite aislar el efecto de la arquitectura respecto al efecto de los datos.
- Estudios de escalado a baja escala: los pares 13M y 100M de MixerLoop permiten trazar curvas de pérdida y de precisión en tareas CORE frente a tokens procesados sin el coste de entrenar modelos de miles de millones de parámetros.
- Reproducción de evaluaciones CORE: usar `eval/core_eval.csv` como referencia para verificar que una réplica del pipeline de evaluación obtiene las mismas fracciones en las 22 tareas y en el agregado Core_v2.
- Validación de implementaciones de atención lineal: integrar GDN-100m en un stack propio con FLA y verificar numéricamente la equivalencia con los pesos publicados antes de escalar a modelos mayores.
- Pruebas de regresión en pipelines de entrenamiento: usar los checkpoints de 13M como caso de prueba rápido (tamaño reducido, contexto 1.024) para validar que un cambio en el cargador de datos o en el optimizador no rompe el aprendizaje.
- Docencia y experimentación con recursos limitados: ambos tamaños caben en cualquier GPU de consumo e incluso en CPU, lo que permite montar prácticas de preentrenamiento y evaluación completas en un portátil.
- Benchmarking de herramientas de inferencia en modelos diminutos: medir latencia y throughput de llama.cpp, vLLM o TGI con arquitecturas no transformer estándar, donde el soporte suele ser el cuello de botella.

## Benchmarks y rendimiento

El repositorio publica `eval/core_eval.csv` con las 22 tareas Karpathy CORE y el agregado Core_v2, almacenados como fracciones. Los valores numéricos concretos no se incluyen en la información proporcionada, por lo que no se reproducen aquí.

Los únicos valores numéricos de referencia presentes en la documentación son las correcciones de línea base v2 usadas por el evaluador canónico: CommonsenseQA 40,3 %, LSAT AR 25 % e identificación de idioma 25 %. Estos valores corresponden a la corrección de la línea base del evaluador, no a resultados del modelo.

Los resultados históricos conservados en `legacy/` mantienen sus protocolos originales y, según la propia model card, no deben interpretarse como CORE v2.

## Requisitos de hardware

- VRAM para MixerLoop-13m (12.896.380 parámetros): aproximadamente 26 MB en FP32 y 52 MB en BF16, más el coste de activaciones para contexto 1.024.
- VRAM para MixerLoop-100m y GDN-100m (~100,4 M parámetros): aproximadamente 400 MB en FP32 y 200 MB en BF16, más activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; también es viable la inferencia en CPU por el tamaño reducido.
- GPU de consumo: sí, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y equivalentes; incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: la model card solo documenta `transformers` con FLA y el registro de modelos de MixerLoop. El soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y, dado que requiere registros de modelo personalizados, es probable que no funcione sin adaptaciones; se marca como no disponible.
- Latencia y throughput: no disponible; no se publican medidas.

Consideración importante: el repositorio completo ocupa 6,9 GB, pero la descarga de un único subdirectorio de modelo es de decenas o centenas de megabytes según el tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MixerLoop-100m | 100.447.266 | 1.024 (documentado en primera tanda) | no disponible | HuggingFace, requiere FLA + registro propio | Arquitectura MixerLoop |
| GDN-100m | 100.444.194 | 1.024 (documentado en primera tanda) | no disponible | HuggingFace, requiere FLA + registro propio | Control arquitectónico del mismo repositorio, misma semilla |
| MixerLoop-13m | 12.896.380 | 1.024 (documentado en primera tanda) | no disponible | HuggingFace, requiere FLA + registro propio | Escala menor para estudios de escalado |
| Alternativas de tamaño comparable (por ejemplo modelos de ~100M tipo GPT-2 small o Pythia-160M) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No se aportan datos de comparación en la información disponible |

El único contraste documentado con garantías es interno: GDN-100m frente a MixerLoop-100m, que comparten presupuesto de tokens y semilla, lo que los convierte en el par de comparación natural para evaluar la contribución de la arquitectura.

## Limitaciones y advertencias

- No se ha publicado licencia. Sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal; conviene contactar con el autor antes de cualquier uso en producción.
- Tamaño muy reducido: 13M y 100M parámetros implican una capacidad limitada de conocimiento factual y de razonamiento; no son adecuados para tareas de producción que exijan precisión alta.
- Riesgo de alucinación elevado y esperable en modelos de esta escala, especialmente fuera de los dominios cubiertos por ClimbMix.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto en castellano ni en ningún otro idioma concreto más allá del que aparezca en los datos de entrenamiento.
- Longitud de contexto limitada a 1.024 tokens en las ejecuciones documentadas, insuficiente para conversaciones largas o documentos extensos.
- Dependencia de código externo: los pesos no son cargables con Transformers estándar. Se requiere la biblioteca FLA y el registro de modelos de MixerLoop en el commit 24b6a923, lo que añade riesgo de mantenimiento y de reproducibilidad a largo plazo.
- Los directorios que contienen solo `.gitkeep` son experimentos planificados, no modelos entrenados; tratarlos como modelos disponibles llevaría a conclusiones erróneas.
- Los resultados de `legacy/` usan protocolos de evaluación antiguos y no son comparables con Core_v2; mezclarlos invalidaría cualquier comparación.
- No se publican checkpoints de entrenamiento, estados del optimizador ni logs, lo que limita la reproducibilidad completa del proceso de entrenamiento.
- Advertencia de seguridad: la model card es contenido aportado por el autor; el código de carga que menciona (`custom_models`) debe revisarse antes de ejecutarlo, ya que implica ejecutar código de un repositorio externo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ruhai-lin/MixerLoop
- Repositorio de código MixerLoop (commit de referencia): https://github.com/ruhai-lin/MixerLoop/tree/24b6a9237c1220c39358b0987341596bdcf3926c
- Resultados de evaluación: `eval/core_eval.csv` dentro del repositorio de HuggingFace
- Resultados históricos: directorio `legacy/` dentro del repositorio de HuggingFace
- Paper, blog o demo adicionales: no disponible en la información proporcionada

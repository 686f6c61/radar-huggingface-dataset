# sketcH2027/evaluated_models

## Resumen

`sketcH2027/evaluated_models` no es un modelo único, sino un repositorio que agrupa todos los checkpoints evaluados en el artículo anónimo para ICLR *Which VLAs Learn a Grasp That Transfers to New Object Positions?*. Se trata de ajustes finos con LoRA sobre `pi05_base` de openpi (la familia pi0.5 de vision-language-action de Physical Intelligence) entrenados exclusivamente con las 500 demostraciones de LIBERO-Object. El repositorio incluye el checkpoint principal de 11.999 pasos, la curva completa de pasos de entrenamiento (cada 1.000 pasos) y una escalera de datos con subconjuntos estratificados del 50 %, 25 %, 10 % y 2 % de las demostraciones.

La relevancia del artefacto es de tipo metodológico más que de producto: permite reproducir la comparación entre políticas entrenadas con distintos volúmenes de datos y analizar si una VLA aprende una estrategia de agarre que generaliza a posiciones nuevas de objeto. Cada checkpoint se publica como árbol de parámetros Orbax de 6 GB, sin estado del optimizador, junto con las estadísticas de normalización (`norm_stats.json`) con las que fue entrenado y servido.

Al ser un lanzamiento anónimo vinculado a una submission en revisión, el repositorio no declara licencia explícita ni idiomas soportados, y sus pesos quedan sujetos a los términos bajo los que se distribuye `pi05_base`. El tamaño total del repositorio es de 120,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) pi0.5 de openpi: modelo base `pi05_base` con LoRA aplicado sobre dos expertos (`gemma_2b_lora` y `gemma_300m_lora`) |
| Parametros totales | no disponible (cada checkpoint completo ocupa 6 GB en formato Orbax) |
| Parametros activos | no aplica (no es un MoE disperso; la receta usa dos expertos con adaptadores LoRA sobre `pi05_base`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se distribuyen variantes cuantizadas, solo el árbol de parámetros Orbax sin estado del optimizador |
| Idiomas soportados | no disponible (el prompt de condicionamiento es la cadena de tarea de LIBERO) |
| Licencia | no disponible; los pesos derivan de `pi05_base` y están sujetos a los términos bajo los que este se distribuye |
| Formato de pesos | Orbax (`params/`, 6 GB por checkpoint) más `assets/libero/<dataset>/norm_stats.json` |
| Libreria | openpi (requiere el commit `215abfb` y el parche `training/openpi.patch`) |
| Tarea / pipeline | robotics (visión-lenguaje-acción) |
| Entrada | Frames nativos de 128x128 rotados 180 grados y rellenados (padded) a 224, estado de 8 dimensiones (posición del efector final, orientación eje-ángulo, dos articulaciones de los dedos) y cadena de tarea |
| Salida | Diez acciones delta de 7 dimensiones; el artículo ejecuta cinco por consulta |
| Horizonte de acción | 10 |
| Dataset de entrenamiento | Demostraciones propias de LIBERO-Object (500 completas; subconjuntos estratificados de 250, 125, 50 y 10) |
| Numero de checkpoints | 1 principal (paso 11999), curva de pasos 1000-11000, y 4 niveles de la escalera de datos (pasos 500-1999 según el nivel) |
| Tamano del repositorio | 120,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es `pi05_base` de openpi, una política visión-lenguaje-acción de la familia pi0.5 que el repositorio ajusta con LoRA sobre dos expertos simultáneamente: `gemma_2b_lora` y `gemma_300m_lora`. La receta parte de las demostraciones nativas de LIBERO-Object (frames de 128x128 rotados 180 grados, pasos no-op eliminados y la cadena de tarea como prompt). El entrenamiento usa lote de 24, AdamW con recorte de gradiente en 1.0, schedule coseno con 200 pasos de calentamiento y pico de 5e-5 que decae hasta 1e-6, sin EMA, y horizonte de acción 10. La ejecución completa son 12.000 pasos.

Para la escalera de datos, cada nivel se entrena 2.000 pasos sobre un subconjunto estratificado de demostraciones: 250 (p50), 125 (p25), 50 (p10) y 10 (p02, una demostración por tarea). Los checkpoints intermedios de la curva de pasos se toman cada 1.000 pasos y se evalúan aisladamente en la política y, en los pasos 1000, 2000, 4000, 6000 y 8000, dentro del arnés (harness) de evaluación. Los ficheros de configuración para las cinco variantes (`pi05_libero_object_orig`, `_p50`, `_p25`, `_p10`, `_p02`) se distribuyen como parche contra openpi `215abfb`, y los checkpoints se publican sin estado del optimizador, por lo que no permiten reanudar el entrenamiento tal cual.

## Capacidades

- Control robótico de manipulación de objetos: genera acciones delta de 7 dimensiones condicionadas por imagen, estado proprioceptivo y una instrucción de tarea en lenguaje natural.
- Ejecución de políticas en bucle cerrado mediante el servidor de openpi, con cinco acciones ejecutadas por cada consulta sobre un horizonte de 10.
- Condicionamiento por lenguaje: la tarea se especifica como cadena de texto (protocolo LIBERO), lo que permite cambiar de objetivo sin reentrenar.
- Generalización a posiciones nuevas de objeto: es precisamente la hipótesis que evalúa el artículo al que pertenecen los checkpoints.
- Comparación controlada de regímenes de datos: los cuatro niveles de la escalera permiten medir el efecto del volumen de demostraciones sobre el éxito de la política.
- Análisis de curvas de entrenamiento: la serie de pasos 1000-11000 permite estudiar la evolución de la política durante el ajuste LoRA.
- Transferencia mediante LoRA: los adaptadores se pueden reutilizar o sustituir para ajustar el modelo base a otros conjuntos de demostraciones.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matemáticas, código, visión general, audio ni modo de razonamiento explícito; el modelo está especializado en acción robótica.

## Casos de uso

- Manipulación de objetos sobre mesa en simulación LIBERO-Object: el modelo recibe el frame de 128x128 (rotado 180 grados y rellenado a 224) más el estado de 8 dimensiones y devuelve acciones delta; es el escenario para el que fue entrenado y el único con garantías documentadas.
- Reproducción de resultados de investigación: permite volver a ejecutar la Tabla 1 del artículo y comprobar el comportamiento del checkpoint de 11.999 pasos con y sin el arnés de evaluación.
- Estudio de eficiencia de datos en VLA: los checkpoints de la escalera (p50, p25, p10, p02) permiten medir cuánta demostración hace falta para mantener una tasa de éxito dada, hasta el extremo de una demostración por tarea.
- Diagnóstico de sobreajuste y estabilidad de entrenamiento: la curva de pasos 1000-11000 sirve para localizar el punto en el que la política deja de mejorar o empieza a degradarse.
- Evaluación de robustez ante cambios de posición de objeto (swap): los checkpoints intermedios evaluados dentro del arnés permiten analizar si la estrategia de agarre transferida se mantiene al recolocar los objetos.
- Base para nuevos ajustes con LoRA: al partir de `pi05_base` con adaptadores sobre `gemma_2b_lora` y `gemma_300m_lora`, el repositorio sirve como punto de partida para experimentos con otros conjuntos de demostraciones de manipulación.
- Integración en un pipeline de evaluación automatizada de políticas: el servidor `scripts/serve_policy.py` expone el protocolo LIBERO en el puerto 8000, de modo que un banco de pruebas puede lanzar episodios y registrar una fila por episodio evaluado.
- Comparación entre variantes de configuración: al disponer de cinco configs distintas, se puede medir la sensibilidad de la política al subconjunto de datos sin cambiar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio referencia una Tabla 1, una curva de pasos de entrenamiento y una escalera de datos (sección 6) del artículo, pero no incluye cifras de éxito ni de ningún otro benchmark en la model card. La tabla siguiente recoge únicamente los ejes de evaluación mencionados, sin valores numéricos:

| Eje de evaluacion | Checkpoints implicados | Resultados publicados en la informacion disponible |
|---|---|---|
| Tabla 1 (celda de tarea y de swap, con y sin arnés) | `pi05_lora_libero_object/step_11999` | no disponible |
| Curva de pasos de entrenamiento (política sola; swap en el arnés en 1000, 2000, 4000, 6000 y 8000) | `steps/step_<S>`, S = 1000 ... 11000 | no disponible |
| Escalera de datos (p50, p25, p10, p02) | `ladder/*/step_1999` y `p02_10demos/step_<S>` | no disponible |

## Requisitos de hardware

- Almacenamiento: 6 GB por checkpoint (árbol Orbax de `params/` más `norm_stats.json`); el repositorio completo ocupa 120,4 GB, por lo que conviene descargar solo el checkpoint necesario con `--include`.
- VRAM para inferencia: no disponible en la información proporcionada. Como referencia derivada del tamaño del checkpoint (6 GB de parámetros por paso), el peso del modelo en precisión de 16 bits ronda esos 6 GB, a lo que hay que sumar el codificador visual, las activaciones y los búferes de imagen, de modo que un presupuesto de 12-16 GB es un punto de partida razonable, aunque no está confirmado por el autor.
- GPU recomendadas: no disponible. El servicio se realiza con el script `serve_policy.py` de openpi, que requiere un entorno con acelerador gráfico para operar en bucle cerrado; no se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada; depende de la VRAM real requerida por el pipeline de openpi, no declarada.
- Opciones de despliegue: `scripts/serve_policy.py` de openpi (puerto 8000) sobre el commit `215abfb` con el parche `training/openpi.patch` aplicado. No se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que el artefacto es una política VLA con protocolo de servicio propio y no un modelo de lenguaje servible con esas herramientas.
- Advertencia de despliegue: servir un checkpoint LoRA con una configuración que no sea LoRA carga sin error y responde como el modelo equivocado. Cada nivel de la escalera requiere su propia config (`pi05_libero_object_p50`, `_p25`, `_p10`, `_p02`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. La tabla siguiente recoge únicamente características estructurales de alternativas de la misma categoría (VLA para manipulación), marcando como "no disponible" todo dato no confirmado en la documentación del repositorio:

| Modelo | Parametros | Contexto / acciones | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi0.5 LoRA LIBERO-Object (este repositorio) | no disponible (checkpoint de 6 GB) | Horizonte de acción 10; 5 acciones ejecutadas por consulta | no disponible (sujeta a los términos de `pi05_base`) | HuggingFace, 0 descargas, 0 likes |
| pi0.5 `pi05_base` (openpi) | no disponible | no disponible | no disponible | Repositorio openpi en GitHub |
| OpenVLA (alternativa de referencia en VLA de manipulación) | no disponible en la información proporcionada | no disponible | no disponible | No consultado |
| GR00T N1 (alternativa de referencia en VLA de manipulación) | no disponible en la información proporcionada | no disponible | no disponible | No consultado |

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente con demostraciones de LIBERO-Object y no se documenta comportamiento fuera de ese dominio, tarea o protocolo de entrada.
- Riesgo de alucinación de acciones: como toda política de imitación, puede producir secuencias de acción plausibles pero incorrectas ante estados poco representados en las 500 demostraciones.
- Sobreajuste en los niveles bajos de la escalera: los checkpoints `p10` (50 demostraciones) y `p02` (10 demostraciones) parten de subconjuntos muy reducidos, lo que limita su capacidad de generalización.
- Protocolo de servicio estricto: el servidor espera frames rotados 180 grados y rellenados a 224, un estado de 8 dimensiones y diez acciones delta de 7 dimensiones. Fuera de ese formato los resultados no están garantizados.
- Dependencia de `norm_stats.json`: servir un checkpoint sin las estadísticas de normalización con las que fue entrenado invalida las acciones generadas.
- Error silencioso de configuración: un checkpoint LoRA servido con una config no-LoRA carga correctamente pero responde como otro modelo, sin aviso.
- Licencia no declarada: al no especificarse términos propios y heredar los de `pi05_base`, el uso comercial queda sujeto a la licencia del modelo base, que no se detalla en la información disponible.
- Idiomas no declarados: no se especifica cobertura multilingüe; el condicionamiento por lenguaje se limita a las cadenas de tarea del protocolo LIBERO.
- Contexto no declarado: no se publica la longitud de contexto del modelo, lo que impide evaluar su idoneidad para instrucciones o historiales largos.
- Checkpoints sin estado del optimizador: no permiten reanudar el entrenamiento desde el punto publicado.
- Estado de validación incipiente: 0 descargas y 0 likes, publicación anónima asociada a una submission en revisión, sujeta a posibles cambios o retirada.
- Fecha de publicación registrada como 2026-09-26, con actualización el mismo día, lo que indica un artefacto reciente y sin historial de uso comunitario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sketcH2027/evaluated_models
- Repositorio openpi (Physical Intelligence), requerido en el commit `215abfb`: https://github.com/Physical-Intelligence/openpi
- Parche de configuración y material de entrenamiento: `training/openpi.patch` y carpeta `training/` del material suplementario del artículo (sin URL pública en la información proporcionada)
- Artículo de referencia: *Which VLAs Learn a Grasp That Transfers to New Object Positions?* (submission anónima para ICLR; sin URL en la información proporcionada)

# Katagiri-Hoshino-Lab/ninaxander-rwkv-xlstm-family

## Resumen

NinaXander RX chimera family es un paquete de investigacion publicado por Katagiri-Hoshino-Lab que no constituye un modelo generativo autonomo, sino un conjunto de adaptadores y estadisticas de capa para construir modelos compuestos mediante la recombinacion bidireccional de bloques congelados de modelos padre. El nombre "NinaXander" designa los modelos resultantes de esta recombinacion; el repositorio contiene el adaptador de latente compartido y las estadisticas por capa de tres semillas de entrenamiento primarias, junto con las recetas de construccion. Los pesos de los modelos padre no se incluyen: se referencian externamente en `config.json`.

El interes tecnico reside en que propone una metodologia de composicion de modelos (model-composition) en lugar de un checkpoint entrenado de forma convencional. El adaptador cubre las 32 fronteras de bloque posibles, aunque solo se han validado las fronteras 4, 8, 16 y 24 en pruebas downstream. El repositorio ocupa 3,2 GB e incluye ficheros safetensors, codigo de inferencia en PyTorch y ficheros de validacion que registran la igualdad de salida en CPU tras recargar los tensores.

Es relevante ahora como material de investigacion reproducible para quienes exploran tecnicas de fusion, injerto de capas y transferencia entre arquitecturas hibridas (los nombres R, P y X sugieren familias de modelos distintas, con X fijado a una revision concreta de la comunidad). No debe confundirse con un modelo listo para produccion: el propio autor advierte que la interfaz no es una implementacion de `AutoModelForCausalLM` y que la validacion cubre fidelidad de exportacion, no calidad de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composicion de modelos: recombinacion bidireccional de bloques congelados de modelos padre mediante adaptador de latente compartido; no se especifica la arquitectura interna de los padres (los tags sugieren familias RWKV y xLSTM, no confirmado en la model card) |
| Parametros totales | no disponible (el repo contiene adaptador y estadisticas, no pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los padres R/P usan float16 segun la politica QA original y X usa float32 con TF32 desactivado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador y estadisticas), codigo PyTorch; los pesos padre se referencian externamente |

## Arquitectura y entrenamiento

El sistema no entrena un transformer desde cero, sino que construye modelos compuestos reinsertando residuos post-bloque entre modelos padre congelados. El adaptador almacena una estandarizacion, una conversion no lineal y una estandarizacion inversa; el loader aplica esas tres operaciones sobre el residuo residual de origen (`source_residual`, el residuo post-bloque bruto en posiciones de texto alineadas) y entrega el resultado al sufijo receptor tras el bloque elegido, en el dtype de ejecucion de ese padre. Las desviaciones estandar almacenadas ya incluyen epsilon.

Se cubren las 32 fronteras de bloque, con tres semillas de entrenamiento y recetas que identifican direccion, semilla, frontera y estado de evaluacion en `configurations.json`. Los ficheros de validacion de cada semilla registran el hash del checkpoint de origen y la igualdad exacta de salida en CPU tras recargar los safetensors, en las fronteras 4 y 24 en ambas direcciones; estas pruebas validan fidelidad de exportacion, no calidad de generacion ni finitud numerica en entradas arbitrarias. Los ficheros excluyen estado de optimizador y scheduler. El estudio reporta ganancias dependientes de direccion, profundidad y tarea frente a conversion afin, resultados mixtos frente a conversion no lineal directa y perdidas sustanciales de capacidad del modelo padre. La revision exacta de las conversiones locales R/P no se conservo; solo la de X esta fijada.

## Capacidades

- Construccion de modelos compuestos: permite injertar residuos de un modelo padre en otro en cualquiera de las 32 fronteras de bloque, en ambas direcciones (R→X y X→R).
- Conversion de representaciones: transforma residuos post-bloque entre espacios latentes de padres distintos mediante estandarizacion, funcion no lineal e inversa.
- Reproducibilidad de recetas: `configurations.json` documenta direccion, semilla, frontera y estado de evaluacion de cada receta.
- Validacion de fidelidad de exportacion: comprobacion de igualdad exacta de salida en CPU tras recarga de safetensors en fronteras 4 y 24.
- No incluye generacion de texto por si mismo: requiere las implementaciones de prefijo y sufijo de los modelos padre.
- No es una implementacion de `AutoModelForCausalLM`; la integracion con pipelines de Hugging Face no esta soportada de forma nativa.
- Soporte multilingue, tool calling, agentes, vision y audio: no disponible (no aplica a este paquete).

## Casos de uso

- Investigacion en composicion de modelos: punto de partida reproducible para estudiar si el injerto de bloques entre arquitecturas hibridas conserva capacidades; el paquete aporta adaptador, estadisticas y recetas con semillas multiples.
- Experimentos de transferencia entre familias: usar el adaptador para mover residuos de una familia (R) a otra (X) en fronteras concretas y medir la degradacion frente a conversiones afin y no lineal directa.
- Analisis de profundidad: evaluar el efecto de la frontera elegida (4, 8, 16, 24) sobre la calidad downstream, aprovechando que las 32 fronteras estan soportadas por el adaptador aunque solo cuatro esten validadas.
- Reproduccion de resultados academicos: cargar las tres semillas y comparar salidas con las estadisticas almacenadas para verificar fidelidad de exportacion antes de lanzar experimentos costosos.
- Desarrollo de metodos de fusion alternativos: usar la conversion afin y la no lineal directa como baselines contra los que medir el adaptador de latente compartido.
- Auditoria de checkpoints de comunidad: el pin exacto de la revision de X y el registro de hashes de origen permiten trazar que pesos se usaron en cada validacion.
- Estudio de perdida de capacidad: cuantificar las perdidas sustanciales de capacidad del padre reportadas por el autor y caracterizar en que tareas y profundidades se concentran.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta hallazgos cualitativos del estudio: ganancias dependientes de direccion, profundidad y tarea frente a conversion afin; resultados mixtos frente a conversion no lineal directa; y perdidas sustanciales de capacidad del modelo padre. No se aportan cifras de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el paquete en si; depende enteramente de los modelos padre, cuyos tamanos no se detallan. El repositorio descargable ocupa 3,2 GB (adaptador y estadisticas).
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device="cuda"`; X requiere float32 con TF32 desactivado, lo que incrementa el consumo de memoria frente a float16.
- Cabe en GPU de consumo: no determinable sin conocer los padres; el adaptador y las estadisticas por si solos son ligeros frente a los 3,2 GB del repo.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download`, anadir el directorio al `sys.path` de Python e instanciar `NinaXanderFamily`. No compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, al no ser un `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NinaXander RX chimera family | Paquete de composicion (adaptador + estadisticas) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Modelos padre R/P | Modelos base congelados | no disponible | no disponible | no disponible | Referenciados por Hub ID en `config.json` |
| Modelo padre X | Checkpoint de comunidad fijado | no disponible | no disponible | no disponible | Revision pinned en `config.json` |

No se dispone de datos suficientes para comparar con alternativas de la misma categoria (herramientas de model merging como mergekit o metodos de injerto de capas), ya que la informacion proporcionada no incluye parametros, contexto ni rendimiento de los modelos padre ni de posibles competidores.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: requiere los pesos y las implementaciones de prefijo y sufijo de los modelos padre, que no se distribuyen en este repositorio.
- No implementa `AutoModelForCausalLM`: la integracion con ecosistemas estandar de inferencia no esta soportada.
- Solo cuatro fronteras (4, 8, 16, 24) estan cubiertas por pruebas downstream; el soporte de las 32 fronteras por el adaptador no implica validacion en las restantes.
- La validacion registrada comprueba fidelidad de exportacion (igualdad de salida en CPU tras recarga), no calidad de generacion de texto ni finitud numerica en entradas arbitrarias.
- El estudio reporta perdidas sustanciales de capacidad del modelo padre, lo que desaconseja su uso en produccion sin evaluacion propia.
- La revision exacta de las conversiones locales R/P no se conservo; solo la de X esta fijada, lo que limita la reproducibilidad exacta de esos brazos.
- Licencia no disponible: no puede asumirse uso comercial permitido.
- Idiomas soportados no disponibles.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; heredado en su caso de los modelos padre.
- Requisitos de precision estrictos (X en float32 con TF32 desactivado) que elevan el coste de memoria y pueden afectar al rendimiento.
- Repositorio con 0 descargas y 0 likes: sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Katagiri-Hoshino-Lab/ninaxander-rwkv-xlstm-family
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.

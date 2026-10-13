# Donghyun1228/pi05-libero-current-vision-relation-scalar-view-large-1000-20261013

## Resumen

El modelo `Donghyun1228/pi05-libero-current-vision-relation-scalar-view-large-1000-20261013` es un checkpoint experimental de tipo vision-language-action (VLA) orientado a robotica de manipulacion, publicado por el usuario Donghyun1228 y etiquetado con las categorias `openpi`, `robotics`, `vla`, `libero` y `experimental`. Se trata de un punto de control de investigacion (no un modelo de produccion) derivado del ecosistema openpi, con un tamano de repositorio de 7,7 GB y sin descargas ni valoraciones registradas en el momento de la consulta.

El checkpoint corresponde a un experimento concreto: "current-vision relation / view_large / scalar". Segun la model card, contiene los parametros crudos sin EMA tras 1000 actualizaciones, junto con los activos de normalizacion originales. El modelo combina modulos entrenables en FP32 (identificados como `vision23` y `expert11`) con modulos congelados nativos en BF16 (`frozen17` y `wrist23` de la fuente), lo que implica un regimen mixto de precision. Su objetivo declarado es la manipulacion transferible, y la propia model card advierte que este checkpoint individual no establece retencion por si mismo.

La relevancia de esta ficha es acotada y de caracter documental: se trata de un artefacto de investigacion muy especifico, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Es util para quien siga la linea de experimentos de openpi/pi0.5 sobre el benchmark LIBERO, pero no es un modelo listo para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en openpi; politica condicionada por instrucciones con estimacion de flujo a un paso (t=1) y objetivo de relacion con invariancia de Gram |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card describe FP32 para modulos entrenables y BF16 para modulos congelados, no cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (libreria `openpi`; repo de 7,7 GB con activos de normalizacion) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de una politica VLA dentro del ecosistema openpi. La model card describe una estructura de modulos con denominaciones internas (`vision23`, `expert11`, `native frozen17`, `source wrist23`), donde los modulos entrenables `vision23` y `expert11` estan en FP32 y los modulos congelados nativos y el modulo de muneca de la fuente estan en BF16. El entrenamiento empleo un profesor desacoplado (detached teacher) que combina la vision actual con el experto preentrenado. El objetivo de relacion utiliza una estimacion de flujo principal a un solo paso con t=1, no el muestreador completo, y la invariancia de Gram permite reflexiones.

El brazo de retencion usa un unico lambda=1 comun. El control escalar preserva la direccion y los momentos de Adam del IDM (modelo inverso de dinamica) mientras iguala la norma de propuesta candidata en el mismo estado. Segun la model card, el objetivo es la manipulacion transferible y la perdida IDM no es su metrica de exito. No entran en el entrenamiento observaciones de la fuente, cache de salida de la fuente ni realimentacion de exito; las instrucciones objetivo existentes condicionan la politica. Los datos objetivo apuntan al conjunto `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`). La inicializacion real uso una fuente nativa local heredada (`native51`); el checkpoint `pi05-libero-main-policy-retention-source-split74-20261013` (commit `24268da2aba5f690c879788d98e3455a2a579d8f`) se cita como referencia de despliegue equivalente y no como entrada real de inicializacion. El numero de tokens de entrenamiento, la composicion del dataset mas alla de la referencia anterior y el uso de RLHF/DPO no estan disponibles.

## Capacidades

- Generacion de acciones de manipulacion robotica condicionadas por instrucciones objetivo (politica VLA), segun la descripcion de "manipulacion transferible".
- Procesamiento conjunto de vision actual y lenguaje: el profesor desacoplado combina vision actual con el experto preentrenado.
- Estimacion de flujo a un paso (t=1) como parte del objetivo de relacion.
- Conservacion de activos de normalizacion originales para el checkpoint.
- Ejecucion en un marco de evaluacion tipo LIBERO con MuJoCo 3.2.3 y multiples clientes por GPU.
- No hay evidencia declarada de soporte de tool calling, function calling, razonamiento multi-paso en texto, capacidades de audio, modo "thinking" ni capacidad multilingue mas alla de las instrucciones que condicionan la politica. Estos extremos deben considerarse "no disponible".

## Casos de uso

- Investigacion en manipulacion robotica: reproducible de un checkpoint experimental de openpi sobre tareas LIBERO, util para estudiar la transferencia de politicas condicionadas por instrucciones.
- Estudio de retencion de politicas: este checkpoint forma parte de una linea de experimentos sobre retencion (bracos de retencion con lambda=1); sirve como punto de comparacion, aunque la propia model card advierte que un checkpoint individual no establece retencion.
- Analisis de objetivos de representacion: el objetivo de relacion con invariancia de Gram y la estimacion de flujo a t=1 permiten estudiar el efecto de objetivos auxiliares sobre el comportamiento de la politica.
- Evaluacion comparativa de controles escalares: el control escalar que preserva direccion y momentos de Adam del IDM es un objeto de estudio metodologico para quienes investigan optimizacion en VLA.
- Reproducibilidad de experimentos openpi: el checkpoint incluye los activos de normalizacion necesarios y referencias de commit concretas, lo que facilita la trazabilidad en un pipeline de investigacion.
- Benchmarking de infraestructura de evaluacion: la model card detalla una configuracion de evaluacion (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3), reutilizable para medir throughput y reproducibilidad de despliegues de inferencia.
- No se documenta ningun caso de uso comercial o de produccion, dado que no hay licencia declarada ni benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe un protocolo de evaluacion objetivo (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) e indica que las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio, y que el JSON de evaluacion conserva los resultados reales. Sin embargo, no se proporcionan puntuaciones numericas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia derivada del tamano del repositorio (7,7 GB) y de una restauracion BF16, puede estimarse un orden de magnitud de 8 a 16 GB, pero esta cifra es una aproximacion y no un dato declarado.
- Precision declarada en los pesos: modulos entrenables `vision23` y `expert11` en FP32; modulos congelados `frozen17` y `wrist23` de la fuente en BF16. La inferencia se describe como "BF16 restore".
- GPU recomendadas: no disponible. La model card menciona una configuracion de evaluacion con 8 clientes por GPU, lo que sugiere aceleradores de gama profesional, pero no especifica modelo.
- Compatibilidad con GPU de consumidor: no confirmada.
- Opciones de despliegue: la model card referencia la libreria `openpi` y un punto de inferencia concreto (`pi05_libero_source_free_split_vision_idm` en el commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con parametros, contexto, rendimiento, licencia y disponibilidad verificables. El unico marco de referencia citado son otros checkpoints de la misma linea experimental del autor (por ejemplo, `pi05-libero-main-policy-retention-source-split74-20261013`), que no constituyen alternativas de otra familia sino variantes del mismo trabajo.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de una politica VLA, el modo de fallo relevante seria la generacion de acciones incorrectas, no texto alucinado.
- La propia model card advierte de forma explicita que "este checkpoint individual no establece retencion" y que la perdida IDM no es su metrica de exito.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia: no disponible. La ausencia de licencia declarada impide asumir permiso de uso comercial, lo que supone un riesgo legal directo para cualquier despliegue en produccion.
- Trazabilidad: la model card indica que la inicializacion real uso una fuente nativa local heredada y que el checkpoint canonical-equivalent no es la entrada real de inicializacion, lo que complica la reproduccion exacta.
- Protocolo de evaluacion: las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio, por lo que las comparaciones entre checkpoints deben interpretarse con cautela.
- Estado del artefacto: 0 descargas y 0 valoraciones en el momento de la consulta, etiqueta `experimental`, sin benchmarks publicados. No debe tratarse como un modelo maduro.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-current-vision-relation-scalar-view-large-1000-20261013
- Dataset objetivo citado: https://huggingface.co/Donghyun1228/libero-dense-contact-sweep-d2-20261002 (commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`)
- Checkpoint de referencia de despliegue equivalente: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013 (commit `24268da2aba5f690c879788d98e3455a2a579d8f`)
- Referencia de inferencia: punto `pi05_libero_source_free_split_vision_idm` (commit `0f6471d99dfc81fabe7c3ab65c141d7640b9ff08`)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.

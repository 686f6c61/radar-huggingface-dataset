# Donghyun1228/pi05-libero-all-module-relation-scalar-view-large-1000-20261014

## Resumen

El modelo `Donghyun1228/pi05-libero-all-module-relation-scalar-view-large-1000-20261014` es un checkpoint experimental de investigación publicado por el usuario Donghyun1228 en HuggingFace. Se trata de una política viso-lenguaje-acción (VLA) derivada de la familia π₀.₅ / openpi, entrenada y evaluada sobre el benchmark de manipulación robótica LIBERO. No es un modelo de lenguaje conversacional ni un modelo multimodal de propósito general: su salida son acciones de control para un brazo robótico, condicionadas por observaciones visuales e instrucciones de tarea.

El checkpoint corresponde a un experimento concreto denominado "all-module relation experiment" en su variante `view_large / scalar`, tras 1.000 actualizaciones de entrenamiento. La model card describe un objetivo de relación con profesor separado (detached teacher) que combina la visión actual con el LLM y el experto preentrenados, y una estimación de flujo de un solo paso con t=1. El propio autor advierte explícitamente que este checkpoint individual no establece retención de capacidades y que la pérdida IDM no es su métrica de éxito.

Por su naturaleza, se trata de un artefacto de reproducibilidad científica más que de un modelo desplegable en producción: no declara licencia, no declara idiomas soportados, tiene cero descargas y cero likes, y su propósito declarado es servir de referencia dentro de una línea de experimentos sobre retención de políticas en manipulación transferible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en π₀.₅ / openpi; combina encoder de visión, LLM y modulo experto de acciones (no se detalla la topologia interna completa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | Pesos mixtos: FP32 en los modulos entrenables (vision23, LLM9, expert11) y BF16 en los congelados nativos (native frozen8) y en el encoder de muñeca procedente del modelo fuente (source wrist23). Restauracion de inferencia en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explicitamente; el repositorio ocupa 13,1 GB y la libreria declarada es `openpi` |
| Tamano del repositorio | 13,1 GB |
| Libreria / runtime | openpi |
| Tarea declarada | robotics (pipeline: robotics) |

## Arquitectura y entrenamiento

La informacion disponible describe un sistema de tres bloques funcionales: un modulo de visión (referido como `vision23`, con 23 elementos entrenables), un LLM (`LLM9`, 9 entrenables) y un experto de acciones (`expert11`, 11 entrenables). Los pesos entrenables se almacenan en FP32, mientras que los modulos congelados nativos (`native frozen8`) y el encoder de muñeca heredado del modelo fuente (`source wrist23`) se mantienen en BF16. La inicializacion real provino de un origen local legacy denominado `native51`; el repositorio `pi05-libero-main-policy-retention-source-split74-20261013` se describe como referencia de despliegue equivalente por canonica, no como la entrada de inicializacion realmente utilizada.

El entrenamiento consistio en 1.000 actualizaciones con un brazo de retencion que usa un unico `lambda=1`; el control escalar preserva la direccion y los momentos del optimizador Adam del IDM mientras iguala la norma de propuesta de candidato en el mismo estado. El profesor separado (detached teacher) combina la visión actual con el LLM y el experto preentrenados. El objetivo de relación emplea una estimacion de flujo principal de un solo paso con t=1, no el sampler completo, y la invariancia de Gram permite reflexiones. Segun el autor, no entran en el entrenamiento observaciones de origen, cache de salida del modelo fuente ni retroalimentacion de exito; la politica se condiciona con las instrucciones objetivo existentes. Los datos objetivo provienen de `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (commit 9f8f600ce0e8f5df51c0e847c65a1e09f29d8494).

## Capacidades

- Generacion de acciones de control para manipulacion robotica en tareas de tipo LIBERO, condicionadas por instrucciones de tarea en lenguaje.
- Procesamiento deobservaciones visuales mediante un encoder de vision de vista amplia (`view_large`), con un encoder de muñeca separado restaurado desde los pesos fuente.
- Entrenamiento y evaluacion sobre un conjunto objetivo de 40 tareas con 10 episodios por tarea.
- Inferencia en BF16 mediante el checkpoint `pi05_libero_source_free_split_vision_idm` (commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08).
- Servido multi-cliente en GPU: la evaluacion declarada usa 8 clientes por GPU sobre MuJoCo 3.2.3.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.
- No se declaran capacidades multilingues.

## Casos de uso

- Reproduccion de experimentos academicos sobre retencion de politicas: el checkpoint permite a un grupo de investigacion replicar exactamente el brazo `all-module relation / scalar` tras 1.000 actualizaciones y compararlo con las variantes `view_large` publicadas por el mismo autor.
- Estudios de ablacion sobre objetivos de destilacion con profesor separado: dado que el profesor combina vision, LLM y experto, el checkpoint sirve como punto de comparacion frente a configuraciones equivalentes sin el termino de relacion.
- Analisis de invariancia de Gram en politicas VLA: la model card indica que la invariancia de Gram permite reflexiones, lo que hace de este checkpoint un material util para estudiar simetrias en el espacio de representaciones de la politica.
- Evaluacion comparativa en el benchmark LIBERO: el protocolo declarado (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) permite insertar el modelo en una bateria de evaluacion estandarizada de manipulacion.
- Referencia de despliegue equivalente por canonica: el modelo `pi05-libero-main-policy-retention-source-split74-20261013` se declara equivalente por canonica, de modo que este checkpoint puede usarse para verificar que dos rutas de inicializacion distintas producen comportamientos alineados.
- Investigacion sobre entrenamiento sin observaciones de origen: el autor afirma que no entran observaciones del entorno fuente ni cache de salida; el checkpoint permite medir si la politica pierde o conserva competencia bajo esa restriccion.
- Base para experimentos de ajuste fino posteriores sobre datos de contacto denso, partiendo del conjunto `libero-dense-contact-sweep-d2`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona un protocolo de evaluacion objetivo (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3, peticiones de politica que comparten un flujo RNG de servidor y no estan emparejadas por episodio), pero no incluye cifras de exito ni comparaciones numericas. El autor indica ademas que la perdida IDM no es la metrica de exito del objetivo y que este checkpoint individual no establece retencion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 13,1 GB con pesos mixtos FP32/BF16, por lo que el requisito real depende del numero de parametros, dato no publicado.
- GPU recomendadas: no disponibles de forma explicita. El unico dato operativo es la configuracion de evaluacion declarada, con 8 clientes por GPU, compatible con GPUs de datacenter tipo A100 o H100.
- Cabe en GPU de consumo: no confirmado. Dado que el autor describe la restauracion de inferencia en BF16, es plausible que quepa en GPUs de 24 GB o mas, pero no hay confirmacion en la informacion proporcionada.
- Opciones de despliegue: runtime `openpi` (libreria declarada). La inferencia se realiza con el checkpoint `pi05_libero_source_free_split_vision_idm` en restauracion BF16. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no de politicas VLA.
- Aceleradores y simulacion: la evaluacion se ejecuta sobre MuJoCo 3.2.3 con 8 clientes por GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idoneidad declarada | Estado | Licencia |
|---|---|---|---|---|
| `Donghyun1228/pi05-libero-all-module-relation-scalar-view-large-1000-20261014` (este modelo) | Checkpoint experimental VLA | Experimento all-module relation, variante view_large / scalar, 1.000 actualizaciones | Experimental, sin retencion demostrada | no disponible |
| `Donghyun1228/pi05-libero-source-free-vision-idm-view-large-1000-20261010` | IDM solo vision, view large | Piloto experimental completado, sin reclamacion de retencion de exito | Experimental | no disponible |
| `Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010` | IDM solo vision con division de encoders | Conserva las 51 hojas del modelo IDM objetivo; encoder de camara base activo y encoder de muñeca separado en BF16 | Experimental | no disponible |
| `lerobot/pi05_libero_finetuned_quantiles_v044` | π₀.₅ ajustado en LIBERO con normalizacion por cuantiles | Base de referencia de la familia π₀.₅ en LIBERO | Publicado por LeRobot | no disponible en la informacion recogida |

No se dispone de cifras de rendimiento comparables entre estos checkpoints en la informacion proporcionada, por lo que la comparacion se limita a proposito, estado y procedencia.

## Limitaciones y advertencias

- El propio autor indica que este checkpoint individual no establece retencion de capacidades; no debe presentarse como evidencia de que la politica conserva competencia tras el entrenamiento.
- La perdida IDM no es la metrica de exito del objetivo declarado, de modo que valores bajos de esa perdida no implican mejor manipulacion.
- No entra retroalimentacion de exito en el entrenamiento: no hay senal directa de exito de tarea en el proceso descrito.
- Existe una discrepancia documentada entre la inicializacion real (origen local legacy `native51`) y la referencia de despliegue publicada; el autor aclara que esta ultima es equivalente por canonica, no la entrada real.
- Las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio, lo que limita la comparabilidad episodio a episodio.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Se debe tratar como uso restringido a investigacion hasta aclaracion del autor.
- No se declaran idiomas soportados ni longitud de contexto; el modelo no debe evaluarse como modelo de lenguaje.
- El modelo esta disenado para entornos LIBERO y simulacion MuJoCo; no hay evidencia publicada de transferencia a manipulación en el mundo real.
- Con cero descargas y cero likes, no existe validacion independiente de la comunidad.
- Riesgo de sobreinterpretacion de los resultados: el JSON de evaluacion conserva los resultados reales y ninguna puntuacion del entorno fuente se trata como retencion de manipulacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-scalar-view-large-1000-20261014
- Checkpoint relacionado (IDM solo vision, view large, 1.000 actualizaciones): https://huggingface.co/Donghyun1228/pi05-libero-source-free-vision-idm-view-large-1000-20261010
- Checkpoint relacionado (IDM solo vision con division de encoders): https://huggingface.co/Donghyun1228/pi05-libero-source-free-split-vision-view-large-1000-20261010
- Referencia de despliegue equivalente por canonica: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013
- Conjunto de datos objetivo: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Repositorio de codigo de ajuste fino e inferencia para pi05 en LIBERO: https://github.com/Integer003/openpi05/tree/main/examples/libero
- Biblioteca OpenPI de modelos VLA: https://www.openpi.net/english.html
- Modelo π₀.₅ ajustado en LIBERO con cuantiles (LeRobot, ModelScope): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned_quantiles_v044

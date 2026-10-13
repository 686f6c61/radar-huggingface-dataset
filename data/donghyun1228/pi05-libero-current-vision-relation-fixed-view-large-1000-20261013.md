# Donghyun1228/pi05-libero-current-vision-relation-fixed-view-large-1000-20261013

## Resumen

`Donghyun1228/pi05-libero-current-vision-relation-fixed-view-large-1000-20261013` es un checkpoint de investigación de robótica publicado por el usuario Donghyun1228 dentro del ecosistema `openpi` (el framework de modelos visión-lenguaje-acción, VLA, de Physical Intelligence). Se trata de un modelo de tipo VLA, es decir, un modelo que recibe observaciones visuales y una instrucción en lenguaje natural y emite acciones de control para un brazo robótico, en este caso evaluado sobre el benchmark LIBERO.

El checkpoint corresponde a un experimento muy concreto de destilación y retención de habilidades: son los parámetros "raw non-EMA" tras 1000 actualizaciones, con un profesor "detached" que combina la visión actual con el experto preentrenado, y un objetivo de relación basado en una estimación de flujo a un paso (t=1). La model card incide en que el propio autor advierte que este checkpoint individual no demuestra retención de forma aislada; forma parte de una ablación mayor.

Se distribuye como repositorio de 7,7 GB con pesos en precisión mixta (FP32 y BF16) y activos de normalización originales. Es un artefacto experimental, con licencia e idiomas no declarados y sin resultados de benchmarks publicados en la model card, orientado a investigadores que reproducen experimentos de manipulación transferible sobre LIBERO más que a uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de pi0.5 / openpi, con experto de accion por flow matching; confirmado como derivado `pi05` en la model card, detalles de backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en cuanto a formatos de cuantizacion; los pesos nativos se distribuyen en FP32 (vision23 y expert11 entrenables) y BF16 (frozen17 nativo y wrist23 de origen) |
| Idiomas soportados | no disponible (el modelo se condiciona por instrucciones; la evaluacion LIBERO emplea instrucciones de tarea, pero no se declara el conjunto de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint openpi), precision mixta FP32/BF16, con activos de normalizacion originales |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi0.5 (referenciada como `pi05` en la model card) desplegada a traves del framework `openpi`. La arquitectura es de tipo vision-language-action: un modelo de lenguaje y vision que condiciona la generacion de acciones de robot. Segun la propia model card, la generacion de acciones usa un estimador de flujo (flow matching) a un solo paso (`t=1`) como parte del objetivo de relacion, y no el muestreador completo. El componente de vision entrenable se etiqueta como `vision23` y el experto de accion como `expert11`, ambos en FP32; el componente nativo congelado (`frozen17`) y el `wrist23` de origen van en BF16.

En cuanto al entrenamiento, la model card describe un esquema de destilacion con un "detached teacher" que combina la vision actual con el experto preentrenado. El objetivo de relacion es la manipulacion transferible, y se indica explicitamente que la perdida IDM (inverse dynamics model) no es su metrica de exito. Se usa una unica lambda=1 para el brazo de retencion, y un control escalar que preserva la direccion y los momentos de Adam del IDM mientras iguala la norma de una propuesta candidata del mismo estado. La invarianza de Gram permite reflexiones (transformaciones especulares) de las representaciones. No entran en el entrenamiento observaciones del entorno de origen, cache de salida del origen ni realimentacion de exito, y la politica se condiciona con las instrucciones del objetivo existentes. Los datos de destino son `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`). El autor aclara que la inicializacion real uso una fuente local "native51" y que `Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013` (commit `24268da2...`) es una referencia de despliegue canonica equivalente, no la entrada de inicializacion real.

## Capacidades

- Control de robot manipulado: genera acciones de brazo a partir de observaciones visuales (camara principal y muneca) y una instruccion de tarea, en el marco del benchmark LIBERO.
- Condicionamiento por lenguaje: la politica se guia por instrucciones de tarea (condicionamiento por instrucciones del objetivo), segun la model card.
- Manipulacion de contacto denso: los datos objetivo corresponden a un barrido de contacto denso (`libero-dense-contact-sweep-d2`), lo que sugiere entrenamiento orientado a tareas con contacto fisico.
- Aprendizaje por destilacion de un profesor: incorpora un profesor "detached" que combina vision actual y experto preentrenado para el objetivo de relacion.
- Evaluacion multi-tarea: disenado para medirse sobre 40 tareas x 10 episodios en LIBERO.
- No disponible: soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues declaradas, vision general fuera del control, audio o modo de razonamiento explicito. Estos extremos no se documentan en la informacion disponible.

## Casos de uso

- Investigacion en manipulacion transferible: reproduccion y analisis de la ablacion "current-vision relation" con profesor detached, sirviendo como punto de comparacion frente a otros checkpoints del mismo autor.
- Evaluacion de retencion de habilidades: uso dentro de un pipeline que mida transferencia entre entornos (por ejemplo, del entorno de origen al entorno destino LIBERO), teniendo en cuenta la advertencia del autor de que este checkpoint aislado no demuestra retencion.
- Estudio de objetivos de flujo a un paso: analisis de como un estimador `t=1` de un solo paso afecta al aprendizaje de politicas VLA, comparado con el muestreador completo.
- Ablacion de estrategias de destilacion: comparacion del esquema de control escalar que preserva la direccion y momentos de Adam del IDM frente a otras variantes.
- Referencia de despliegue experimental: al ser una referencia canonica equivalente a la inicializacion usada, puede emplearse para reconstruir experimentos de inicializacion.
- Analisis de invarianza de representacion: estudio del efecto de la invarianza de Gram y de las reflexiones permitidas sobre el rendimiento en tareas de contacto.
- Evaluacion controlada en benchmark: ejecucion de la evaluacion estandar (40 tareas x 10 episodios, semilla de entorno 17, MuJoCo 3.2.3) para obtener JSON de resultados reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la configuracion de evaluacion (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3, peticiones de politica que comparten un flujo RNG de servidor y no estan emparejadas por episodio, y JSON de evaluacion que preserva los resultados reales), pero no incluye cifras ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- Tamano del repositorio: 7,7 GB, lo que da una cota inferior del almacenamiento necesario para los pesos en precision mixta FP32/BF16.
- VRAM estimada de inferencia: no disponible de forma explicita; con pesos en FP32/BF16 mixtos y el tamano del repo, cabe esperar un consumo en el rango de decenas de GB, pero no se puede concretar sin conocer el numero de parametros.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tipo de modelo (VLA de gran tamano, carga en FP32/BF16) es razonable esperar GPUs de datacenter (A100, H100), pero esto no se confirma en la model card.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es `openpi`; la evaluacion se realiza con MuJoCo 3.2.3 y un servidor de politica con 8 clientes por GPU. No se documentan rutas alternativas (vLLM, llama.cpp, Ollama, TGI) para este checkpoint.
- Latencia y throughput: no disponible. Solo se indica que las peticiones de politica comparten un flujo RNG de servidor y no estan emparejadas por episodio.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Donghyun1228/pi05-libero-current-vision-relation-fixed-view-large-1000-20261013` | VLA (pi0.5/openpi), experimental | no disponible | no disponible | no disponible | HuggingFace, 0 descargas, 0 likes |
| `Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013` | VLA (pi0.5/openpi), referencia de despliegue canonica equivalente | no disponible | no disponible | no disponible | HuggingFace |
| `Donghyun1228/pi05_libero_source_free_split_vision_idm` | VLA (pi0.5/openpi), usado para inferencia | no disponible | no disponible | no disponible | HuggingFace |

Comparativa con alternativas externas a la familia: no disponible. No se conocen en la informacion proporcionada modelos comparables de otros autores con los que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Naturaleza experimental: el autor etiqueta el checkpoint como experimental y advierte que "este checkpoint individual no establece retencion".
- Metrica de exito ambigua: la model card aclara que la perdida IDM no es la metrica de exito del objetivo (manipulacion transferible), por lo que las cifras de IDM no deben interpretarse como rendimiento de la politica.
- Inicializacion no documentada de forma completa: la inicializacion real uso una fuente local "native51"; la referencia canonica publicada no es la entrada real de inicializacion, lo que complica la reproduccion exacta.
- Sin licencia declarada: no se especifica licencia, por lo que no hay garantias de uso comercial ni condiciones claras de redistribucion.
- Idiomas no declarados: no se documenta el conjunto de idiomas de las instrucciones; la evaluacion LIBERO usa instrucciones de tarea concretas.
- Sin benchmarks publicados: no hay cifras de rendimiento en la informacion disponible, lo que impide valorar su calidad frente a alternativas.
- Riesgo de alucinacion y sesgos: no evaluado ni reportado en la informacion disponible; en un VLA, los fallos se manifiestan como acciones incorrectas o inseguras, no como texto.
- Advertencia fisica: al ser un modelo de control robotico, un fallo puede traducirse en movimientos erroneos; requiere validacion en entorno seguro y supervision.
- Reproducibilidad de la evaluacion: las peticiones comparten un flujo RNG de servidor y no estan emparejadas por episodio, lo que condiciona la comparabilidad de resultados.
- Ecosistema restringido: depende de `openpi` y de la version concreta de MuJoCo (3.2.3) indicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-current-vision-relation-fixed-view-large-1000-20261013
- Datos de destino (LIBERO dense contact sweep): https://huggingface.co/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Referencia de despliegue canonica equivalente: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013
- Framework openpi: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada

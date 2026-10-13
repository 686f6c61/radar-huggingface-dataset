# Donghyun1228/pi05-libero-all-module-relation-fixed-view-large-1000-20261014

## Resumen

Este repositorio contiene un checkpoint experimental de un modelo de vision-lenguaje-accion (VLA) orientado a robotica manipulativa, publicado por el usuario Donghyun1228 bajo la biblioteca openpi. El identificador del modelo, pi05-libero-all-module-relation-fixed-view-large-1000-20261014, sugiere una base de la familia pi0.5 y un entrenamiento sobre el benchmark LIBERO, con una variante experimental denominada "all-module relation" en configuracion view_large / fixed.

Se trata de un artefacto de investigacion, no de un modelo de produccion: la propia model card indica que "este checkpoint individual no establece retencion" y que la perdida IDM no es su metrica de exito, sino que el objetivo real es la manipulacion transferible. El repositorio ocupa 13,1 GB y contiene parametros crudos no-EMA tras 1000 actualizaciones, junto con los recursos de normalizacion originales.

La relevancia es acotada y de nicho: sirve como material reproducible para investigacion en aprendizaje por imitacion robotico y en tecnicas de retencion de politicas sobre LIBERO. No incluye licencia declarada, no declara idiomas soportados y no presenta resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en openpi, con encoder de vision, backbone LLM y expert de accion; el identificador sugiere base pi0.5. Detalle completo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en FP32 (modulos entrenables vision23, LLM9, expert11) y BF16 (frozen8 nativo y wrist23 de origen) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; biblioteca openpi, con mezcla de precision FP32 y BF16, y activos de normalizacion originales |

## Arquitectura y entrenamiento

El modelo sigue el esquema VLA caracteristico de openpi: un modulo de vision, un backbone de lenguaje y un expert de accion que produce trayectorias mediante estimacion de flujo (flow). La model card menciona un objetivo de relacion (relation objective) que emplea una estimacion de flujo principal de un solo paso en t=1, no el sampler completo, y una invariancia de Gram que permite reflexiones. El profesor (teacher) esta desconectado (detached) y combina la vision actual con el LLM y el expert preentrenados.

El entrenamiento corresponde a un experimento de relacion "all-module" con brazo de retencion de lambda=1 comun. Un control escalar preserva la direccion y los momentos de Adam del modulo IDM mientras iguala la norma de propuesta candidata en el mismo estado. Los modulos entrenables (vision23, LLM9, expert11) se mantienen en FP32, mientras que frozen8 nativo y wrist23 de origen estan en BF16. La model card afirma explicitamente que no entran en entrenamiento observaciones de origen, cache de salida de origen ni retroalimentacion de exito, y que las instrucciones objetivo existentes condicionan la politica. Los datos objetivo proceden del repositorio Donghyun1228/libero-dense-contact-sweep-d2-20261002 (commit 9f8f600). La inicializacion real uso una fuente nativa51 local heredada; el repositorio pi05-libero-main-policy-retention-source-split74-20261013 se describe como referencia de despliegue equivalente canonica, no como entrada de inicializacion real. No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Control robotico por manipulacion visual: genera acciones a partir de observaciones visuales e instrucciones de tarea, con el objetivo declarado de manipulacion transferible.
- Condicionamiento por instrucciones: la politica se condiciona mediante instrucciones objetivo existentes.
- Razonamiento multimodal de vision y lenguaje: integra un encoder de vision con un backbone LLM y un expert de accion.
- Estimacion de accion por flow matching: utiliza una estimacion de flujo de un solo paso en t=1 para el objetivo de relacion.
- Evaluacion sobre LIBERO: el protocolo descrito abarca 40 tareas x 10 episodios, con semilla de entorno 17, 8 clientes por GPU y MuJoCo 3.2.3.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso de proposito general: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio especifico mas alla del pipeline de robotica: no disponible.

## Casos de uso

- Investigacion en retencion de politicas: el checkpoint sirve como material reproducible para estudiar si una politica conserva habilidades tras el entrenamiento, dado que la propia model card advierte que este checkpoint individual no establece retencion.
- Reproduccion de experimentos VLA sobre LIBERO: permite repetir el protocolo de evaluacion descrito (40 tareas x 10 episodios, semilla 17) sobre el mismo benchmark.
- Estudio de objetivos de relacion e invariancia de Gram: util para investigar objetivos auxiliares basados en invariancia a reflexiones en espacios de representacion.
- Analisis de precision mixta en entrenamiento: al combinar modulos FP32 entrenables con modulos BF16 congelados, es un caso practico para estudiar estrategias de precision en VLA.
- Base para ablaciones de normalizacion: el repositorio incluye los activos de normalizacion originales, lo que facilita comparar variantes de normalizacion.
- Referencia de despliegue canonica: el modelo asociado pi05-libero-main-policy-retention-source-split74-20261013 se cita como referencia de despliegue equivalente.
- Inferencia con restauracion BF16: la model card indica que la inferencia se realiza con pi05_libero_source_free_split_vision_idm (commit 0f6471d) y restauracion BF16.
- Integracion en pipelines de robotica con MuJoCo 3.2.3: el entorno de evaluacion declarado permite probar politicas en simulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluacion (40 tareas x 10 episodios, semilla de entorno 17, 8 clientes por GPU, MuJoCo 3.2.3) pero no incluye cifras de rendimiento. Ademas, advierte que las peticiones de politica comparten un flujo RNG del servidor y no estan emparejadas por episodio, y que ningun resultado de entorno de origen se trata como retencion de manipulacion.

## Requisitos de hardware

- Tamano del repositorio: 13,1 GB, que incluye pesos y activos de normalizacion.
- VRAM estimada para inferencia en BF16: estimacion orientativa de 13 a 16 GB para cargar el conjunto completo de pesos restaurados en BF16, mas memoria para activaciones y el servidor de politica. No disponible como cifra oficial.
- VRAM estimada con cuantizacion de 8 bits: estimacion orientativa de 7 a 9 GB; no disponible como dato oficial y condicionada a que exista soporte de cuantizacion en openpi.
- VRAM estimada con cuantizacion de 4 bits: estimacion orientativa de 4 a 5 GB; no disponible como dato oficial.
- GPU recomendadas: no disponible en la informacion proporcionada. La evaluacion descrita menciona 8 clientes por GPU, lo que sugiere aceleradores con memoria suficiente para servir multiples politicas.
- Compatibilidad con GPU de consumo: no disponible; las estimaciones anteriores sugieren que una GPU de consumo con 16 GB o mas podria albergar la inferencia en BF16, pero no hay confirmacion.
- Opciones de despliegue: biblioteca openpi (JAX). vLLM, llama.cpp, Ollama o TGI no estan indicados para este tipo de modelo VLA en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-all-module-relation-fixed-view-large-1000 | VLA sobre LIBERO (openpi) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| pi05-libero-main-policy-retention-source-split74-20261013 | VLA sobre LIBERO (openpi) | no disponible | no disponible | no disponible | HuggingFace, citado como referencia de despliegue |
| libero-dense-contact-sweep-d2-20261002 | Dataset objetivo asociado | no aplica | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de parametros de estos artefactos para establecer una comparacion cuantitativa. Otras familias VLA comparables por categoria (por ejemplo, OpenVLA o pi0 de Physical Intelligence) no aparecen en la informacion proporcionada, por lo que sus cifras se marcan como no disponibles.

## Limitaciones y advertencias

- Checkpoint experimental: la model card indica que este checkpoint individual no establece retencion, por lo que no debe interpretarse como evidencia de exito.
- Metrica de exito: la perdida IDM no es la metrica de exito del objetivo, que es la manipulacion transferible; usar la perdida como proxy puede inducir a error.
- Protocolo de evaluacion no emparejado: las peticiones de politica comparten un flujo RNG del servidor y no estan emparejadas por episodio, lo que limita la comparabilidad estadistica.
- Fuente de inicializacion: la inicializacion real uso una fuente nativa51 local heredada, distinta de la referencia de despliegue canonica; esto puede dificultar la reproducibilidad exacta.
- Licencia: no declarada; sin licencia explicita no hay garantia de uso comercial.
- Idiomas: no disponibles; no se documentan capacidades linguisticas.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no disponible en el contexto de robotica, aunque al integrar un backbone LLM el modelo podria heredar sesgos del modelo base.
- Alcance: orientado a simulacion (MuJoCo 3.2.3) y al benchmark LIBERO; la transferencia a robotica real no esta documentada.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-fixed-view-large-1000-20261014
- Dataset objetivo: https://huggingface.co/Donghyun1228/libero-dense-contact-sweep-d2-20261002 (commit 9f8f600ce0e8f5df51c0e847c65a1e09f29d8494)
- Referencia de despliegue canonica: https://huggingface.co/Donghyun1228/pi05-libero-main-policy-retention-source-split74-20261013 (commit 24268da2aba5f690c879788d98e3455a2a579d8f)
- Inferencia asociada: pi05_libero_source_free_split_vision_idm (commit 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08)

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relacion con el contenido del repositorio.

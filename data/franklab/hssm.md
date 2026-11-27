# franklab/HSSM

## Resumen

HSSM (Hierarchical State Space Model) es un repositorio de Hugging Face publicado por franklab que no contiene un modelo de lenguaje en el sentido convencional, sino artefactos ONNX destinados al framework HSSM, una libreria de Python para el ajuste bayesiano de modelos de tiempo de reaccion y eleccion (como el modelo de deriva difusiva, DDM, y sus variantes Levy). El repositorio actua como punto de distribucion de redes neuronales entrenadas que aproximan funciones de verosimilitud, permitiendo sustituir calculos analiticos costosos por inferencia neuronal diferenciable dentro de flujos de muestreo MCMC con PyTensor y JAX.

La model card no describe un modelo generativo ni un transformer: es una guia operativa que explica como cargar un ONNX personalizado almacenado en Hugging Face dentro de HSSM usando `loglik_kind="approx_differentiable"`, como subir nuevos ficheros ONNX mediante `HfApi.upload_file` y como generar pull requests para que el equipo de franklab revise las contribuciones. El repositorio figura con 0 GB de tamano, 0 descargas y 3 likes, lo que sugiere que los pesos binarios no estan presentes en el snapshot publico o que el contenido se gestiona via PRs.

Por tanto, esta ficha documenta un componente de infraestructura cientifica (aproximadores de verosimilitud para modelos cognitivos) y no un LLM. Es relevante para investigadores en psicologia matematica, neurociencia computacional y modelado cognitivo que necesiten ajustar modelos jerarquicos de decision a datos de comportamiento con gradientes aproximados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward exportada a ONNX (aproximador de verosimilitud para modelos de tiempo de reaccion; no es un transformer ni un LLM) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (formato ONNX, precision de entrenamiento no documentada; el ejemplo usa `float32` en PyTensor) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | BSD-2-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Segun la model card, los artefactos son redes neuronales entrenadas para aproximar la log-verosimilitud de modelos de decision (en el ejemplo, un modelo Levy con parametros `v`, `a`, `z`, `alpha` y `t`). El flujo descrito implica definir una configuracion de red y un state dict en PyTorch (via el paquete LANFactory), convertirlos a ONNX y consumirlos desde HSSM con backend JAX. HSSM integra esos aproximadores en PyTensor mediante `loglik_kind="approx_differentiable"`, de modo que el muestreador (por ejemplo, NUTS via PyMC) puede calcular gradientes a traves de la red en lugar de evaluar la verosimilitud exacta.

No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento, el numero de parametros de las redes ni si se emplearon tecnicas de regularizacion o validacion concretas. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Aproximacion diferenciable de funciones de verosimilitud para modelos de tiempo de reaccion y eleccion (DDM, Levy y variantes configurables via `list_params` y `bounds`).
- Integracion con el framework HSSM para ajuste bayesiano jerarquico mediante MCMC (`my_hssm.sample(...)`).
- Ejecucion con backend JAX y precision configurable (`pytensor.config.floatX = "float32"`).
- Carga de modelos ONNX personalizados alojados en el Hub mediante el campo `loglik`.
- Soporte para definir limites de parametros (`bounds`) por modelo.
- Flujo de contribucion via pull requests con `HfApi.upload_file` y revision por parte del equipo.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Ajuste de modelos de deriva difusiva en experimentos de psicologia cognitiva: el investigador carga un ONNX de verosimilitud aproximada y ejecuta MCMC sobre datos de tiempo de reaccion y eleccion, evitando la evaluacion analitica costosa en cada iteracion.
- Modelado jerarquico de participantes: con HSSM se estiman parametros por sujeto y a nivel de grupo, usando el aproximador neuronal para mantener el muestreo viable con cientos de sujetos.
- Extension del ecosistema con nuevas variantes de modelo: un equipo entrena una red para un modelo Levy o DDM extendido, la exporta a ONNX y la publica via PR para que otros la reutilicen.
- Validacion de aproximadores: comparar la verosimilitud neuronal frente a simulaciones exactas (`ssms.basic_simulators`) para cuantificar el error de aproximacion antes de usarla en produccion cientifica.
- Docencia y replicabilidad: distribuir artefactos ONNX versionados en el Hub para que alumnos reproduzcan ajustes sin reentrenar redes.
- Integracion en pipelines de analisis neurocognitivo: incorporar HSSM con aproximadores ONNX en flujos automatizados de analisis de datos experimentales con backend JAX y ejecucion multiproceso (`mp_ctx="forkserver"`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; las redes de aproximacion de verosimilitud suelen ser pequenas (kilobytes a pocos megabytes), pero el repositorio declara 0 GB y no detalla los artefactos.
- GPU recomendadas: no disponible especificamente; el backend JAX puede ejecutar en CPU o GPU, pero la model card no indica requisitos.
- Compatibilidad con GPU de consumo: probable en CPU y en GPUs de consumo para redes pequenas, aunque no se confirma en la documentacion.
- Opciones de despliegue: HSSM con backend JAX y runtime ONNX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franklab/HSSM | Aproximador ONNX para HSSM | no disponible | no aplica | BSD-2-Clause | Hugging Face (repo con 0 GB, 0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros repositorios equivalentes de aproximadores ONNX para HSSM en la busqueda realizada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni responde a prompts; cualquier uso como LLM es invalido.
- El repositorio figura con 0 GB y 0 descargas, por lo que los artefactos ONNX pueden no estar publicados o requerir PR para su incorporacion.
- La calidad del ajuste depende del error de aproximacion de la red; la model card no documenta metricas de error ni validacion.
- Los limites de parametros (`bounds`) deben configurarse manualmente; valores fuera de rango pueden producir extrapolaciones no fiables.
- La licencia BSD-2-Clause permite uso comercial con atribucion, pero no se detallan patentes ni restricciones adicionales.
- La documentacion asume Python 3.8 o superior y la instalacion de HSSM, PyTensor, JAX y `ssms.basic_simulators`; no se cubren versiones incompatibles.
- Los enlaces de la busqueda web apuntan a empresas de limpieza (franklab.fr, franklab.com, franklab.ch) sin relacion con el modelo; no deben usarse como referencia tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/franklab/HSSM
- Ejemplo de pull request con fichero ONNX: https://huggingface.co/franklab/HSSM/blob/refs%2Fpr%2F1/test.onnx
- Ecosistema HSSM (referencia citada en la busqueda): http://go/v1/AX_6kBxAq767awi6aAFhPkbik95ky7Pvds97v8krgznsvVLyRcXTo3BREwefCbIp3eOUUI78jgm1mMf7OsK1WrgyynTjgUpZ4YLrYsW8DPXHkEOb3XG7nBkWYQYtxLIkV_dI_2b-aXOR8eEvHM8FN638sGWsKJEjI_ZnO49jvp7kBQ4_FMHZuaa-YjXsFKAOXHpJACdd9pAVoQe7IwM
- Paquete LANFactory: enlace no disponible en la informacion proporcionada (la model card lo referencia como `LINK_TO_LANFACTORY_PACKAGE`).

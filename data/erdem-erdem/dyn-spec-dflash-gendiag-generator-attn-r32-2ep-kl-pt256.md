# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un artefacto de entrenamiento para decodificacion especulativa (speculative decoding). Se trata de un drafter DFlash, es decir, un modelo auxiliar de tipo LoRA que se acopla a un modelo objetivo (Qwen/Qwen3-8B) para proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando asi la inferencia sin alterar la distribucion de salida. El autor es erdem-erdem y el artefacto forma parte del port del generador dyn-spec DFlash, en su rama `direct` y etapa de pretraining.

El contenido es un checkpoint de entrenamiento (con estado del optimizador incluido), no un paquete listo para servir. La model card es explicita: la exportacion de servicio de DFlash todavia no esta portada, por lo que el repositorio sirve como material de reproduccion, evaluacion offline y trazabilidad completa (procedencia del store de activaciones, comandos de entrenamiento, parches y metricas por fila). El tamano del repo es de 1,4 GB, coherente con un adaptador de rango 32 sobre un drafter de Qwen3-8B mas el estado del optimizador.

Por su naturaleza, no es un modelo para generar texto de forma autonoma: es una pieza de infraestructura de aceleracion. Su relevancia esta en que documenta de forma reproducible una receta de entrenamiento de drafters para Qwen3-8B, con validacion sobre 200 filas fijas y evaluaciones offline detalladas, lo que permite a equipos de investigacion auditar y replicar la metodologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 sobre drafter DFlash (atencion), adaptada al modelo objetivo Qwen3-8B |
| Parametros totales | no disponible (repo de 1,4 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), no safetensors ni GGUF |

Otros datos tecnicos de la model card: modelo objetivo Qwen/Qwen3-8B, drafter base `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4`, rama `direct`, etapa `pretraining`, 2667 updates, semilla 42, Git SHA `f84eec7564fe740492fbbb6facebcd3dd6288523` y SHA256 del checkpoint `45e6bbf4355de3717f52200fb3d4fdd2c5377b7b18aa3526f9a4d557d8d45aee`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 con atencion (`attn-r32`), entrenado como drafter de decodificacion especulativa sobre el drafter DFlash de z-lab para Qwen3-8B. El entrenamiento corresponde a la etapa de pretraining de la rama `direct` del port dyn-spec, con 2667 updates y semilla 42. La configuracion del nombre (`2ep-kl-pt256`) sugiere dos epocas, una componente de divergencia KL y un tamano de prompt de 256, aunque la model card no desarrolla el significado exacto de estos terminos.

La innovacion tecnica reside en el enfoque de entrenamiento: el drafter se ajusta sobre un store de activaciones precomputado del modelo objetivo (dataset `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), con procedencia documentada de extractor, lanzamiento de vLLM y registros de llenado. El repositorio incluye evaluaciones offline con reproduccion, coeficientes M4, donantes M7, similitud D13 y coste D14, ademas de metricas por fila, lo que permite auditar el comportamiento del drafter con detalle granular.

## Capacidades

- Generacion de propuestas especulativas de tokens para acelerar la inferencia de Qwen3-8B.
- Acoplamiento como drafter en pipelines de decodificacion especulativa (DFlash).
- Validacion cuantitativa sobre 200 filas fijas con metricas de acierto completo (`full_acc`) y longitud media de aceptacion (τ eal).
- Evaluacion desagregada por dominio: chat, code, math y stem.
- Trazabilidad completa de entrenamiento: procedencia del store, comandos, parches y manifiesto con SHA256 de cada fichero.
- No soporta tool calling, agentes, vision, audio ni generacion autonoma de texto: no es un modelo de chat ni un asistente.

## Casos de uso

- Aceleracion de inferencia en produccion: el drafter propone tokens candidatos que Qwen3-8B verifica en paralelo, reduciendo el coste por token generado en despliegues de alto throughput.
- Investigacion en decodificacion especulativa: el checkpoint y sus metricas por fila permiten reproducir y comparar recetas de entrenamiento de drafters.
- Auditoria de metodologia: la procedencia documentada (store de activaciones, lanzamiento de vLLM, parches) facilita revisiones internas y cumplimiento.
- Ajuste fino de drafters sobre dominios concretos: las metricas desagregadas por chat, code, math y stem permiten evaluar si el adaptador mejora en el dominio de interes.
- Desarrollo de herramientas de evaluacion offline: los resultados en `run/offline_eval/` sirven como base para construir pipelines de evaluacion reproducibles.
- Formacion de equipos: el repositorio actua como material didactico sobre como entrenar un drafter LoRA con trazabilidad completa.
- Base para portar la exportacion de servicio: una vez portada la exportacion DFlash, este checkpoint seria el punto de partida para el despliegue.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5345 | 7.903 | 0.3526 | 0.6067 | 0.6843 | 0.4943 |

El checkpoint final mejora ligeramente al inicial en todas las metricas: score +0.008, τ +0.2, chat +0.0063, code +0.0111, math +0.0068 y stem +0.0077. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 1,4 GB e incluye estado del optimizador, por lo que no es directamente un artefacto de inferencia ligero.
- Para servir el drafter se requiere cargar ademas el modelo objetivo Qwen3-8B; la VRAM total depende de la cuantizacion del modelo objetivo y del drafter, dato no disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo objetivo (8B), se necesitarian GPU de clase A100/H100 para despliegues de produccion, aunque no hay confirmacion en la model card.
- Cabe en GPU de consumo: no disponible; depende de la cuantizacion del modelo objetivo.
- Opciones de despliegue: la model card indica que la exportacion de servicio DFlash no esta portada, por lo que no hay bundle listo para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (dyn-spec DFlash drafter) | LoRA r32 sobre drafter de Qwen3-8B | no disponible | full_acc 0.5345, τ 7.903 (200 filas) | no disponible | checkpoint de entrenamiento, no servible |
| Drafter base `z-lab/Qwen3-8B-DFlash-b16` | no disponible | no disponible | no disponible | no disponible | disponible en Hugging Face |
| Modelo objetivo Qwen/Qwen3-8B | 8B | no disponible | no disponible | no disponible | disponible en Hugging Face |

No se dispone de datos de benchmarks comparables de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autonoma ni sirve como asistente; su unica funcion es proponer tokens para el modelo objetivo.
- No es un paquete de servicio: la exportacion DFlash no esta portada, por lo que no puede desplegarse directamente en vLLM, llama.cpp, Ollama o TGI.
- El checkpoint incluye estado del optimizador, lo que aumenta el tamano y no es adecuado para inferencia directa.
- Licencia no disponible: no se puede asumir uso comercial sin verificacion previa con el autor.
- Idiomas soportados no disponibles: la cobertura linguistica depende del modelo objetivo y del store de activaciones.
- Riesgo de alucinacion: inherente al modelo objetivo Qwen3-8B; el drafter no elimina este riesgo, solo acelera la generacion.
- Las metricas de validacion se basan en 200 filas fijas, una por LoRA; la generalizacion a otros dominios o distribuciones no esta demostrada.
- No hay datos de latencia, throughput ni VRAM en la informacion disponible, lo que impide estimar el beneficio real de aceleracion en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16

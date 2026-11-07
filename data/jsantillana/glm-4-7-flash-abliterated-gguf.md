# jsantillana/glm-4.7-flash-abliterated-GGUF

## Resumen

GLM-4.7-Flash-Abliterated-GGUF es la distribucion en formato GGUF del modelo GLM-4.7-Flash sometido a un proceso de "abliteration" (eliminacion del comportamiento de rechazo) por el usuario jsantillana. El modelo original, GLM-4.7-Flash, es un Mixture-of-Experts (MoE) de aproximadamente 30.000 millones de parametros totales con unos 3.000 millones de parametros activos por token, desarrollado por Zhipu AI y Z.ai bajo licencia MIT. Esta version GGUF esta pensada para inferencia local con llama.cpp y Ollama.

La innovacion principal respecto al modelo base es la eliminacion selectiva de rechazos mediante proyeccion ortogonal de rango 1 sobre las capas de rechazo pico (39-46), lo que segun el autor reduce los falsos rechazos en dominios de ciberseguridad en un 47,6 % manteniendo una retencion de utilidad del 98,6 % (ratio de perplejidad 1,014x). El modelo se distribuye en tres cuantizaciones (Q3_K_M, Q4_K_M y Q8_0) orientadas a distintos niveles de VRAM.

Este lanzamiento es relevante para investigadores de interpretabilidad mecanica y equipos de red teaming que necesitan ejecutar un modelo MoE de 30B en hardware de consumo, con contexto configurable y pesos listos para llama.cpp, sin depender de infraestructura en la nube. La ficha se centra en la variante GGUF; los datos tecnicos del modelo base provienen de la model card del autor y de busquedas web, y se marcan como no disponibles cuando no constan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Multi-Head Latent Attention (MLA) |
| Parametros totales | ~30.000 millones (30B) |
| Parametros activos | ~3.000 millones por token |
| Longitud de contexto | no disponible (los ejemplos de la model card usan `-c 8192`) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q8_0 |
| Idiomas soportados | en, es, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp, Ollama) |
| Modelo base | jsantillana/glm-4.7-flash-abliterated |
| Modelo original | GLM-4.7-Flash (Zhipu AI / Z.ai) |
| Tamano de archivo | ~14,5 GB (Q3_K_M), ~18,5 GB (Q4_K_M), ~32,0 GB (Q8_0) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4.7-Flash original: un transformer con capas MoE y atencion Multi-Head Latent Attention (MLA), con aproximadamente 30B parametros totales y unos 3B activos por token. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; estos datos figuran como no disponibles.

La modificacion respecto al modelo base es el proceso de abliteration: una proyeccion ortogonal de rango 1 dirigida sobre las capas de rechazo pico (39-46), que elimina la direccion de activacion asociada al comportamiento de rechazo. Segun el autor, esto reduce los falsos rechazos en ciberseguridad un 47,6 % con una retencion de utilidad del 98,6 % (ratio de perplejidad 1,014x). Una busqueda web menciona una variante de huihui-ai con divergencia KL de 0,0065 y reduccion de rechazos de 52/100 a 9/100, pero esos datos corresponden a otro repositorio y no se atribuyen a esta build concreta. Los pesos se han convertido a GGUF para su uso con llama.cpp y Ollama.

## Capacidades

- Generacion de texto en ingles, castellano y chino.
- Razonamiento y generacion de codigo, heredados del modelo base GLM-4.7-Flash (no se detallan capacidades especificas en la model card).
- Comportamiento de rechazo reducido en dominios de ciberseguridad, orientado a red teaming y evaluacion autorizada.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Inferencia local via llama.cpp (`llama-server`) y Ollama.

## Casos de uso

- Red teaming y pruebas de penetracion autorizadas: el modelo responde a consultas tecnicas de seguridad que el modelo base rechazaria, lo que permite evaluar defensas y generar escenarios de ataque controlados en entornos de laboratorio.
- Investigacion de interpretabilidad mecanica: la proyeccion ortogonal sobre capas 39-46 permite estudiar como se representa el rechazo en un MoE de 30B y comparar activaciones antes y despues de la abliteration.
- Evaluacion de sesgos y robustez de seguridad: al eliminar el filtro de rechazo, sirve para medir la tasa de respuestas nocivas y calibrar clasificadores de seguridad externos.
- Despliegue local en estaciones de trabajo: con Q4_K_M (~18,5 GB) cabe en una RTX 3090 o 4090 de 24 GB y permite iterar sin coste de API ni dependencia de la nube.
- Generacion de texto multilingue (en/es/zh): util para prototipos de traduccion o redaccion tecnica en los tres idiomas soportados.
- Pruebas de pipelines con llama.cpp u Ollama: sirve como banco de pruebas para integraciones de servidores locales, plantillas Jinja (`--jinja`) y configuraciones de sampling recomendadas para arquitecturas MoE de GLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas del proceso de abliteration (reduccion de rechazos del 47,6 %, retencion de utilidad del 98,6 %, ratio de perplejidad 1,014x), que no son benchmarks de capacidad estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Q3_K_M (~14,5 GB): recomendado para 16 GB de VRAM (RTX 4080, RTX 4070 Ti Super 16GB, Apple Silicon M-series de 16 GB o mas). Permite offload completo a GPU con bajo coste de perplejidad.
- Q4_K_M (~18,5 GB): recomendado para 24 GB de VRAM (RTX 3090, RTX 4090, Apple Silicon de 32 GB o mas). Configuracion recomendada para despliegue general.
- Q8_0 (~32,0 GB): recomendado para 48 GB de VRAM o 64 GB de RAM (dos RTX 3090/4090, Apple Silicon de 64 GB o mas). Precision casi sin perdida.
- Despliegue: llama.cpp (`llama-server`) y Ollama. vLLM y TGI no se mencionan en la informacion disponible.
- Parametros de sampling sugeridos por el autor: `--temp 1.0`, `--top-p 0.95`, `--repeat-penalty 1.0` (desactivado, recomendado por Z.ai para arquitecturas MoE de GLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jsantillana/glm-4.7-flash-abliterated-GGUF | ~30B | ~3B | no disponible | MIT | GGUF | Esta ficha; abliteration con proyeccion rank-1 en capas 39-46 |
| wangzhang/GLM-4.7-Flash-abliterated | ~30B | ~3B | no disponible | no disponible | Transformers | Abliteration del mismo base; KL 0,0065 y rechazos de 52/100 a 9/100 segun su model card |
| huihui-ai GLM-4.7-Flash-abliterated | ~30B | ~3B | no disponible | MIT | Transformers, GGUF (imatrix), MLX | Variante abliterada citada en abliteratedmodels.org |
| zai-org/GLM-4.7-Flash (original) | ~30B | ~3B | no disponible | MIT | safetensors | Modelo base sin abliterar; mantiene el comportamiento de rechazo |

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo: el modelo puede generar contenido nocivo, instrucciones de ataque o material de doble uso sin filtro. El autor restringe su uso a educacion, investigacion de interpretabilidad y red teaming autorizado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta build; al ser un derivado abliterado, la calibracion puede diferir del original.
- Idiomas limitados a en, es y zh; el rendimiento fuera de esos idiomas no esta documentado.
- La longitud de contexto no se especifica en la model card; los ejemplos usan 8192 tokens, pero no se confirma el maximo soportado.
- El proceso de abliteration puede degradar capacidades en tareas que dependian del filtro de seguridad; la retencion del 98,6 % es una metrica del autor no verificada de forma independiente.
- Licencia MIT permite uso comercial, pero la responsabilidad legal del uso recae en el desplegador; conviene anadir clasificadores de seguridad externos en produccion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni evidencia de uso en produccion.
- No se documentan capacidades de tool calling, agentes o vision; no asumirlas sin verificacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/jsantillana/glm-4.7-flash-abliterated
- Variante wangzhang/GLM-4.7-Flash-abliterated: https://huggingface.co/wangzhang/GLM-4.7-Flash-abliterated
- Ficha de GLM-4.7-Flash-abliterated en abliteratedmodels.org: https://www.abliteratedmodels.org/glm-4.7-flash-abliterated/
- Modelo original (referencia): https://huggingface.co/zai-org/GLM-4.7-Flash

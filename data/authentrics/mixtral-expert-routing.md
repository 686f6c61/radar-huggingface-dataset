# authentrics/mixtral-expert-routing

## Resumen

`authentrics/mixtral-expert-routing` no es un modelo de lenguaje nuevo, sino un artefacto de interpretabilidad publicado por Authentrics (autor: `authentrics`). Se trata de una reproduccion de analisis sobre el modelo base `mistralai/Mixtral-8x7B-v0.1`, en la que se estudia como el enrutador de mezcla de expertos (mixture-of-experts, MoE) de Mixtral dirige las activaciones y como esa estructura emerge a lo largo del entrenamiento. El repositorio no publica pesos derivados ni un checkpoint entrenado: la propia model card lo indica explicitamente ("no derived weights are published").

El problema que aborda es el de la auditoria y el mantenimiento de checkpoints neuronales sin acceso remoto a los pesos. Authentrics es una libreria de analisis de redes neuronales (rueda de Python sobre un nucleo en C++) que permite auditar deriva de parametros y de comportamiento, eliminar datos de forma conforme sin reentrenamiento completo y optimizar en funcion de la perdida sin retropropagacion. Todo el analisis se ejecuta en local; solo los metadatos del proyecto (nombres y descripciones) se intercambian con los servidores de Authentrics.

El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el 16 de septiembre de 2026. Es, por tanto, una pieza de caracter demostrativo orientada a investigadores en interpretabilidad de MoE, no un modelo listo para desplegar en produccion. La relevancia actual esta en que Mixtral-8x7B es uno de los MoE abiertos mas estudiados y en que las tecnicas de analisis de activaciones y correlacion entre capas son cada vez mas demandadas para gobernanza de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (artefacto de analisis). Modelo base: transformer decoder-only con mezcla de expertos (MoE), 8 expertos por capa con enrutamiento top-2 |
| Parametros totales | No aplica al repositorio. Modelo base `mistralai/Mixtral-8x7B-v0.1`: 46,7 B |
| Parametros activos | No aplica al repositorio. Modelo base: 12,9 B por token (top-2 sobre 8 expertos) |
| Longitud de contexto | No disponible para el artefacto. Modelo base: 32 768 tokens |
| Tipos de cuantizacion | No disponible; el repositorio no publica pesos |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | No se publican pesos derivados. Los resultados del analisis se entregan como JSON y paneles HTML de Plotly |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | mistralai/Mixtral-8x7B-v0.1 |
| Modelo base (relacion) | finetune (segun la etiqueta `base_model:finetune`) |

## Arquitectura y entrenamiento

El objeto de analisis es Mixtral-8x7B-v0.1, un transformer decoder-only de tipo sparse mixture-of-experts con 8 expertos por capa y enrutamiento top-2: de los 46,7 B de parametros totales, solo 12,9 B se activan por token. La model card del repositorio no documenta ningun entrenamiento propio del artefacto: no hay numero de tokens, composicion del dataset ni fases de RLHF o DPO asociadas a este repositorio. La etiqueta `base_model:finetune` indica unicamente una relacion de derivacion respecto al checkpoint de Mistral AI, no un proceso de ajuste descrito en la informacion disponible.

La innovacion tecnica del repositorio reside en las dos primitivas de analisis que demuestra. La primera es `activation_analysis`, orientada a detectar deriva de comportamiento en activaciones intermedias. La segunda es `correlation_analysis`, que mide con que intensidad influye cada capa sobre una capa de referencia (habitualmente la de salida). El analisis se ejecuta integramente en la maquina del usuario mediante el SDK de Authentrics (Python 3.11-3.13, Linux x86_64; version de SDK citada: 0.35.1), que combina una rueda de Python con un nucleo en C++. El codigo de reproduccion esta en `src/analysis/mistral_moe_expert_activation.py` y las salidas en `output/mistral_moe_expert_activation/`.

## Capacidades

- Analisis de enrutamiento de expertos: lectura de como el enrutador top-2 de Mixtral dirige las activaciones hacia cada experto.
- `activation_analysis`: deteccion de deriva de comportamiento en activaciones intermedias de un checkpoint.
- `correlation_analysis`: estimacion de la influencia de cada capa sobre una capa de referencia (normalmente la de salida).
- Auditoria de checkpoints: seguimiento de deriva de parametros y de comportamiento a lo largo de versiones.
- Eliminacion de datos conforme sin reentrenamiento completo (eliminacion de influencia de datos sin reentrenar desde cero).
- Optimizacion guiada por perdida sin retropropagacion.
- Ejecucion local: los pesos nunca salen de la maquina del usuario; solo se transmiten metadatos de proyecto.
- Generacion de informes: salidas en JSON y paneles interactivos HTML con Plotly.
- Generacion de texto: heredada del modelo base, no es la funcion del artefacto (etiqueta `pipeline_tag: text-generation`, `endpoints_compatible`).
- Integracion en CI: soporte de clave de API por variable de entorno (`AUTHRX_API_KEY`) para ejecucion no interactiva.
- No se documentan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en interpretabilidad de MoE: reproducir el analisis de enrutamiento sobre Mixtral-8x7B para estudiar que expertos se activan ante distintos tipos de entrada y como se especializan. Es el caso de uso central del repositorio.
- Auditoria de deriva de checkpoint: comparar las activaciones intermedias de dos versiones de un mismo modelo para detectar cambios de comportamiento antes de desplegar una actualizacion en produccion.
- Cumplimiento normativo y derecho al olvido: usar la eliminacion conforme sin reentrenamiento completo para retirar la influencia de datos concretos de un checkpoint, con trazabilidad de los metadatos del proyecto.
- Mantenimiento de modelos en produccion: integrar `authrx` en un pipeline de CI con `AUTHRX_API_KEY` para validar que cada nuevo checkpoint no ha sufrido deriva respecto a la referencia.
- Analisis de atribucion entre capas: aplicar `correlation_analysis` para identificar que capas intermedias determinan la salida final, util para decidir que capas congelar o ajustar en un fine-tuning posterior.
- Estudio de eficiencia de expertos: determinar si el enrutador esta infrautilizando expertos, informacion relevante para decidir si merece la pena recortar el numero de expertos en despliegues con restricciones de memoria.
- Formacion y transferencia de conocimiento: usar los paneles HTML de Plotly como material didactico para explicar el funcionamiento interno de un MoE en cursos o equipos de investigacion.
- Reproducibilidad de experimentos: el codigo publico en GitHub permite repetir el analisis en local con el SDK fijado a una version concreta, evitando dependencias de resultados no verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, ni del artefacto ni del modelo base.

## Requisitos de hardware

- El artefacto en si (SDK de analisis) es una rueda de Python sobre nucleo en C++, disponible para Linux x86_64 y Python 3.11-3.13. No requiere GPU para ejecutarse, pero si necesita cargar el modelo analizado.
- Analisis de `mistralai/Mixtral-8x7B-v0.1` en precision bf16: se necesita memoria suficiente para los 46,7 B de parametros del modelo base (estimacion estandar de calculo en torno a 93 GB de VRAM, es decir, varios aceleradores).
- Analisis con cuantizacion de 4 bits del modelo base: estimacion estandar en torno a 24-28 GB de VRAM, lo que lo situa en el limite de una RTX 4090 de 24 GB o dentro de una A100 de 40 GB.
- GPU recomendadas para el modelo base: A100 80 GB (una o dos unidades), H100 80 GB, o configuraciones multi-GPU equivalentes. En consumer, RTX 4090 o RTX 3090 de 24 GB solo con cuantizacion agresiva.
- Opciones de despliegue del modelo base: transformers, vLLM, llama.cpp, Ollama y TGI. El SDK de Authentrics se instala con `pip install authentrics`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Configuracion del entorno: la clave de API se guarda en `~/.local/state/authentrics/api_key` o se pasa mediante `AUTHRX_API_KEY`, lo que permite ejecucion no interactiva en CI.

## Comparativa con modelos similares

La comparativa se establece sobre el modelo base, ya que el repositorio no es un modelo entrenado. Los datos de los modelos alternativos se limitan a lo verificable; el rendimiento comparado no esta disponible porque el repositorio no publica benchmarks.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Mixtral-8x7B-v0.1 (base de este artefacto) | 46,7 B | 12,9 B (top-2 de 8) | 32 768 tokens | Apache 2.0 | Publicos |
| Qwen1.5-MoE-A2.7B | 14,3 B | 2,7 B | 32 768 tokens | No disponible | Publicos |
| DeepSeek-V2-Lite | 15,7 B | 2,4 B | 32 768 tokens | No disponible | Publicos |
| Este repositorio | No aplica | No aplica | No aplica | Apache 2.0 | No publica pesos derivados |

En cuanto a la categoria real del artefacto (herramientas de interpretabilidad), las alternativas habituales son librerias de acceso a activaciones como TransformerLens o nnsight. No se dispone de datos comparativos de rendimiento entre ellas y el SDK de Authentrics en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: no se publican pesos derivados, por lo que no puede usarse para generacion de texto en produccion a partir de este repositorio.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita comparar su comportamiento con alternativas.
- Privacidad: la model card afirma que solo se transmiten metadatos de proyecto y nunca los pesos, pero el SDK requiere una clave de API y comunicacion con los servidores de Authentrics, lo que debe validarse en entornos con requisitos estrictos de aislamiento.
- Dependencia de plataforma: el SDK se distribuye para Linux x86_64 y Python 3.11-3.13; no se documenta soporte para otras plataformas.
- Dependencia de version: el analisis se genero con el SDK version 0.35.1; cambios de version pueden alterar la reproducibilidad de los resultados.
- Riesgo de interpretacion: los analisis de correlacion y de activaciones son diagnosticos estadisticos, no explicaciones causales; conviene no extraer conclusiones fuertes sobre el comportamiento del modelo a partir de ellos.
- Coste de hardware: reproducir el analisis sobre Mixtral-8x7B exige memoria muy superior a la de una GPU de consumo en precision completa.
- Idiomas y sesgos: al no publicar el artefacto datos propios de entrenamiento ni evaluacion multilingue, no puede caracterizarse el comportamiento linguistico ni los sesgos; estos serian los del modelo base.
- Licencia: el repositorio se declara bajo Apache 2.0, lo que en principio permite uso comercial, pero al no incluir pesos la licencia afecta al codigo y a los resultados de analisis, no a un modelo utilizable.
- Contenido de la ficha: la informacion de esta ficha proviene exclusivamente de la model card y de los metadatos de HuggingFace; los resultados de la busqueda web realizada no contenian enlaces relevantes sobre este modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/authentrics/mixtral-expert-routing
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-v0.1
- Codigo y resultados del analisis: https://github.com/Authentrics-ai/authentrics-model-analysis-experiments
- Ejemplos y guia de usuario del SDK: https://github.com/Authentrics-ai/authentrics-analysis-examples
- Aplicacion y claves de API: https://app.authentrics.ai/
- Documentacion y referencia de la API: https://app.authentrics.ai/docs
- Contacto: info@authentrics.ai

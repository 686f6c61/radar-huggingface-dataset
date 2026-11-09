# bakon3/DeepSeek-V4.1-Flash-1017-IQR-IQ3R

## Resumen

DeepSeek-V4.1-Flash-1017-IQR-IQ3R es una cuantizacion en formato Radiance (`.rad`) del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario bakon3. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada especificamente a inferencia sobre GPUs AMD con arquitectura RDNA4 y stack ROCm. El repositorio declara un contenedor planificado de 307,60 GiB, con expertos enrutados cuantizados a IQ3R en todas las capas y atencion en `u6`/`u7`.

La relevancia de esta publicacion es doble. Por un lado, demuestra el interes creciente por ejecutar modelos de gran tamano tipo MoE en hardware AMD consumer y profesional, un nicho historicamente dominado por el ecosistema CUDA/NVIDIA. Por otro, introduce un esquema de cuantizacion propio (IQR, con variantes IQ3R) que combina tecnicas como tcq, mad, fwht128 y un factor de ganancia, junto con una tabla Engram reconstruida a partir del tokenizador.

Conviene subir la advertencia de que el propio autor indica que los pesos aun no estan en el repositorio y que el archivo se esta escribiendo. Por tanto, esta ficha describe una publicacion en estado embrionario: la informacion disponible procede de la model card y de los metadatos de Hugging Face, no de una evaluacion funcional del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base DeepSeek-V4.1-Flash-1017, presumiblemente MoE por la referencia a "expertos enrutados") |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3R en expertos enrutados (todas las capas), `u6`/`u7` en atencion, `iq4_nl` en tabla Engram, q6_K en embeddings y salida |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Radiance (`.rad`) |
| Tamano del contenedor | 307,60 GiB (planificado) |
| Libreria | radiance |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Hardware objetivo | AMD ROCm / RDNA4 |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base DeepSeek-V4.1-Flash-1017 en la documentacion proporcionada. La model card menciona "expertos enrutados" (routed experts) en todas las capas, lo que sugiere una arquitectura de mezcla de expertos (MoE), y distingue entre pesos de atencion y pesos de expertos, algo coherente con ese diseno. El modelo base se distribuye en fp8 para los pesos generales y fp4 para los expertos, segun la propia model card.

Esta publicacion no entrena ni afina el modelo: solo recuantiza los pesos del modelo base. El proceso aplica IQ3R a los expertos enrutados con parametros concretos (tcq 16, mad, fwht128, ganancia 1,08), `u6`/`u7` a la atencion, `iq4_nl` a la tabla Engram y q6_K a embeddings y capa de salida. Ademas, las tablas Engram se reconstruyen a partir del tokenizador del modelo original. No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que esa informacion corresponderia al modelo base y no se incluye aqui.

## Capacidades

- Generacion de texto: la pipeline declarada es `text-generation`.
- Razonamiento y codigo: presumiblemente heredados del modelo base DeepSeek-V4.1-Flash-1017, aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece vacio en los metadatos).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion en hardware AMD con ROCm y RDNA4: capacidad destacada de esta publicacion, orientada a ese ecosistema.

## Casos de uso

- Despliegue en GPUs AMD RDNA4: el contenedor esta pensado para el stack ROCm, por lo que su caso de uso principal es ejecutar un modelo de gran tamano en hardware AMD donde las alternativas en formato GGUF o safetensors no estan optimizadas.
- Experimentacion con cuantizacion IQ3R: util para investigadores que quieran evaluar la calidad de este esquema de cuantizacion frente a otros (por ejemplo, IQ3_XXS o Q3_K) sobre el mismo modelo base.
- Inferencia local de gran escala en estaciones de trabajo: con 307,60 GiB planificados, el modelo requiere un entorno con memoria unificada o multiples GPUs; encaja en estaciones de trabajo con gran capacidad de VRAM o en servidores con aceleradores AMD.
- Reproduccion de resultados del modelo base: al mantener la estructura de expertos y atencion, sirve para comparar la degradacion introducida por la cuantizacion frente a los pesos fp8/fp4 originales.
- Investigacion sobre tablas Engram: la reconstruccion de las tablas Engram a partir del tokenizador es un aspecto tecnico que puede interesar a quienes estudien tecnicas de compresion y representacion.
- Pruebas de integracion con la libreria Radiance: el repositorio sirve como ejemplo practico de uso de esta libreria y de su formato `.rad`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor planificado ocupa 307,60 GiB, por lo que se necesita al menos esa cantidad de memoria, mas overhead de ejecucion. No cabe en ninguna GPU consumer individual actual.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tag `rdna4` y `rocm`, se orienta a GPUs AMD de esa generacion (por ejemplo, familia Radeon RX 9000 o Instinct con soporte ROCm), aunque no se confirman modelos concretos.
- Cabe en consumer GPU: no, salvo mediante offloading a RAM o configuraciones multi-GPU con memoria agregada superior a 300 GiB.
- Opciones de despliegue: libreria Radiance (formato `.rad`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-IQR-IQ3R (este) | no disponible | no disponible | Radiance `.rad` | MIT | AMD ROCm / RDNA4 |
| DeepSeek-V4.1-Flash-1017-uncensored-rad | no disponible | no disponible | Radiance `.rad` (251,13 GiB) | no disponible | AMD ROCm / RDNA4 |
| DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4 | no disponible | no disponible | Radiance `.rad` (262,75 GiB) | no disponible | AMD ROCm / RDNA4 |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | fp8 / fp4 | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros del modelo base en la informacion proporcionada, por lo que la comparativa se limita a formato, tamano del contenedor y licencia.

## Limitaciones y advertencias

- Los pesos no estan publicados: la model card indica explicitamente que "weights are not in this repo yet" y que el archivo se esta escribiendo. El repositorio no es funcional en el momento de la consulta.
- Estado embrionario: 0 descargas y 0 likes; creado y actualizado el mismo dia, sin historial de uso.
- Tamano muy elevado: 307,60 GiB planificados implican requisitos de hardware fuera del alcance de la mayoria de usuarios.
- Dependencia de la libreria Radiance: no hay soporte declarado para ecosistemas mayoritarios como llama.cpp, vLLM u Ollama, lo que limita la portabilidad.
- Degradacion por cuantizacion: IQ3R sobre expertos y `u6`/`u7` en atencion introducen perdida de precision respecto a fp8/fp4; no se documenta la magnitud de esa perdida.
- Idiomas no declarados: el campo de idiomas aparece vacio, por lo que no se puede garantizar cobertura multilingue.
- Sesgos y alucinacion: no documentados en la informacion disponible; al heredarse del modelo base, aplican los mismos riesgos que este, sin que se detallen.
- Licencia MIT: permite uso comercial, pero conviene verificar que la licencia del modelo base (DeepSeek-V4.1-Flash-1017) sea compatible y no imponga restricciones adicionales.
- Sin benchmarks: no hay evidencia publicada de calidad o rendimiento para esta cuantizacion concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-IQR-IQ3R
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Contenedor uncensored UD-IQ1_S (251,13 GiB): https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad
- Contenedor IQR hybrid v4 (262,75 GiB): https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4
- Coleccion Radiance de DeepSeek-V4.1-Flash: https://huggingface.co/collections/bakon3/deepseek-v41-flash-radiance-6af1ddf468e089a2acfccafd

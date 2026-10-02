# manateelazycat/Qwen3.8-Flash-Next-Runtime

## Resumen

Este repositorio no contiene pesos de un modelo, sino un **runtime de inferencia** empaquetado como archivos Docker/OCI listos para cargar con `docker load` sobre NVIDIA Jetson Thor. Lo publica el usuario `manateelazycat` y su funcion es proporcionar el entorno de ejecucion completo (kernels, dependencias y ajustes de atencion/FP8) que acompana a un LPK de aplicacion. El propio autor lo describe explicitamente como "an inference environment, not model weights".

El runtime sirve para desplegar **Qwen3.8-Flash-Next**, un modelo MoE multimodal de Qwen que actua como avance de la arquitectura que usara Qwen4. Segun la informacion publica disponible, el modelo tiene 125.000 millones de parametros totales con 6.000 millones activos por token, contexto nativo de 262.144 tokens extensible a 1M mediante YaRN, y modo de razonamiento activado por defecto con `reasoning_effort` ajustable.

Su relevancia es doble: por un lado, permite ejecutar en hardware de borde (Jetson Thor) un modelo de escala 125B con cuantizacion FP8 y drafter NVFP4; por otro, al ser la vista previa de la arquitectura de Qwen4, sirve para validar el diseno hibrido GDN + QSA antes de que llegue la siguiente generacion. El repositorio ocupa 15,4 GB y sus archivos deben verificarse por tamano y SHA256 antes de la carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica al repositorio (es un runtime de inferencia). Modelo subyacente: MoE multimodal con atencion hibrida GDN + QSA |
| Parametros totales | no aplica al repositorio. Modelo subyacente: 125.000 millones |
| Parametros activos | no aplica al repositorio. Modelo subyacente: 6.000 millones por token |
| Longitud de contexto | no aplica al runtime. Modelo subyacente: 262.144 tokens nativos, extensible a 1M con YaRN |
| Tipos de cuantizacion | FP8 con block size 128 en los shards objetivo y NVFP4 en el drafter MTP; el runtime conserva los kernels de decodificacion en tres etapas HC y el ajuste previo de atencion y FP8 |
| Idiomas soportados | no disponible |
| Licencia | other (se aplican las licencias de software de terceros; los avisos se conservan dentro de la imagen) |
| Formato de pesos | no contiene pesos. Artefactos Docker/OCI verificables por tamano y SHA256; los pesos y shards optimizados se descargan por separado |

## Arquitectura y entrenamiento

El repositorio distribuye imagenes de contenedor con direccionamiento por contenido (content-addressed), pensadas para su carga en Jetson Thor. Incluye los kernels aceptados de decodificacion en tres etapas HC y el tuning previo de atencion y FP8, sin modificar los parametros del modelo. Los pesos optimizados no viven aqui: se descargan desde la fuente fijada de RadixArk y desde el repositorio `manateelazycat/Qwen3.8-Flash-Next-SGLang-Thor`, que contiene shards objetivo convertidos a FP8, metadatos efectivos de SGLang, el drafter NVFP4 de MTP, un mapa de vocabulario de borrador de 32.768 tokens y su cabeza FP8 reducida.

En cuanto al modelo subyacente, Qwen describe Qwen3.8-Flash-Next como una mejora sistematica en cuatro ejes: atencion, residual, embedding y optimizacion. La atencion usa una arquitectura hibrida GDN + QSA. La cuantizacion oficial de Qwen es FP8 de grano fino con block size 128, y se reporta un rendimiento casi identico al original en bf16. La decodificacion especulativa se apoya en un drafter MTP (multi-token prediction). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor indica que la validacion de rendimiento y del LPK se registra en el informe de release de la aplicacion, no en este repositorio.

## Capacidades

Del runtime (lo que habilita el artefacto):
- Servir Qwen3.8-Flash-Next en Jetson Thor mediante el stack de SGLang.
- Ejecutar decodificacion especulativa con drafter NVFP4 y mapa de vocabulario de borrador de 32.768 tokens.
- Aplicar kernels de decodificacion en tres etapas HC y ajuste de FP8/atencion ya validados.
- Despliegue reproducible: los archivos se cargan por tamano y SHA256, con direccionamiento por contenido.

Del modelo subyacente (segun la informacion publica de Qwen):
- Generacion de texto y razonamiento multimodal.
- Modo de pensamiento activado por defecto, con esfuerzo de razonamiento ajustable mediante `reasoning_effort`.
- Contexto largo: 262.144 tokens nativos, ampliables a 1M con YaRN.
- Inferencia eficiente en relacion capacidad/coste: 125B totales con 6B activos por token.
- Soporte de tool calling, agentes o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de borde en robotica: desplegar un modelo de 125B con 6B activos sobre Jetson Thor permite razonamiento multimodal dentro del propio robot, sin enviar datos a la nube, usando el runtime ya validado para ese hardware.
- Despliegue en instalaciones industriales aisladas: el contenedor es autocontenido y verificable por SHA256, lo que encaja en entornos con requisitos de cadena de suministro de software y sin acceso a repositorios publicos en tiempo de ejecucion.
- Procesamiento de documentos largos en local: con 262.144 tokens nativos y extension a 1M con YaRN, se pueden analizar expedientes, normativas o corpus tecnicos completos en una sola pasada sin troceado agresivo.
- Evaluacion previa de la arquitectura Qwen4: al ser una vista temprana del diseno GDN + QSA, sirve para medir en hardware real como se comporta la atencion hibrida antes de comprometer infraestructura a la generacion siguiente.
- Banco de pruebas de kernels FP8 y NVFP4: el repositorio conserva los kernels de decodificacion HC y el drafter MTP, por lo que es un punto de partida para comparar latencia y throughput entre configuraciones de cuantizacion.
- Reproduccion de despliegues en flotas de dispositivos: al ser un artefacto direccionado por contenido, se puede fijar una version concreta del runtime en cada unidad y auditar que la imagen cargada coincide con la esperada.
- Demostraciones de asistente con razonamiento largo: el modo de pensamiento activado por defecto y el `reasoning_effort` ajustable permiten equilibrar coste y profundidad de razonamiento segun el caso, util en prototipos de asistencia tecnica en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica unicamente que la validacion de rendimiento y del LPK se registra en el informe de release de la aplicacion, sin cifras en el repositorio.

## Requisitos de hardware

- Plataforma objetivo: NVIDIA Jetson Thor. El runtime esta construido especificamente para este SoC; no se indica compatibilidad con GPU de escritorio o servidor x86.
- VRAM estimada: no disponible. No se publican cifras de memoria necesaria para el modelo ni para el runtime.
- Tamano en disco del propio repositorio: 15,4 GB de archivos de runtime (imagenes Docker/OCI), a lo que hay que sumar los pesos y shards descargados aparte.
- Pesos: los shards FP8 y el drafter NVFP4 se obtienen por separado desde la fuente fijada de RadixArk y desde `manateelazycat/Qwen3.8-Flash-Next-SGLang-Thor`, por lo que el almacenamiento total requerido es mayor que el del runtime.
- GPU recomendadas: Jetson Thor como unica plataforma mencionada. Otras opciones: no disponible.
- Opciones de despliegue: carga mediante `docker load` previa verificacion de tamano y SHA256; el stack de servicio es SGLang.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa de artefactos de distribucion asociados al mismo modelo:

| Artefacto | Contenido | Uso previsto | Licencia | Disponibilidad |
|---|---|---|---|---|
| manateelazycat/Qwen3.8-Flash-Next-Runtime | Imagenes Docker/OCI con kernels y ajustes FP8/atencion, 15,4 GB | Entorno de ejecucion sobre Jetson Thor | other | Publico en HuggingFace |
| manateelazycat/Qwen3.8-Flash-Next-SGLang-Thor | Shards objetivo FP8, metadatos SGLang, drafter NVFP4, mapa de vocabulario de borrador de 32.768 tokens y cabeza FP8 reducida | Artefacto de despliegue de inferencia (no es un modelo autonomo) | no disponible | Publico en HuggingFace |
| Qwen/Qwen3.8-Flash-Next | Pesos completos del modelo, 125B totales / 6B activos, contexto 262.144 tokens | Modelo base y referencia de exactitud | no disponible | Publico en HuggingFace |
| Cuantizacion oficial FP8 de Qwen (via Modal) | FP8 de grano fino, block size 128, rendimiento reportado casi identico a bf16 | Inferencia eficiente del modelo base | no disponible | Publico |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que no es posible establecer cual ofrece mejor latencia o exactitud.

## Limitaciones y advertencias

- Este repositorio no es un modelo: cargarlo no proporciona pesos ni capacidades de inferencia por si solo. Hay que descargar los pesos aparte.
- Dependencia de plataforma: esta construido para Jetson Thor. No se documenta portabilidad a otras GPU.
- Licencia `other`: se aplican licencias de software de terceros cuyos avisos quedan dentro de la imagen. No se detalla en la informacion disponible si se permite uso comercial, por lo que hay que revisar los avisos internos antes de desplegar en produccion.
- Sin cifras de rendimiento publicadas en el repositorio: cualquier estimacion de latencia, throughput o consumo debe obtenerse por medicion propia.
- Los archivos deben verificarse por tamano y SHA256 antes de `docker load`; omitir esta comprobacion rompe la garantia de integridad que ofrece el direccionamiento por contenido.
- Los parametros del modelo no se modifican en este runtime, pero si los kernels y el tuning de FP8/atencion, lo que puede alterar el comportamiento numerico respecto al modelo original en bf16.
- No se dispone de informacion sobre idiomas soportados, sesgos, tasa de alucinacion ni limitaciones de contexto mas alla de la ventana declarada.
- No se documentan datos de entrenamiento, por lo que no se puede evaluar la composicion del corpus ni posibles sesgos derivados de el.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-Runtime
- Shards optimizados para SGLang en Thor: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-SGLang-Thor
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README del modelo en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Ficha de la cuantizacion FP8 oficial en Modal: https://modal.com/library/qwen/qwen3-8-flash-next-fp8

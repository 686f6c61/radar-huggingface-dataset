# johnnybravodo/reax-engine-indep2

## Resumen

`reax-engine-indep2` es un artefacto publicado en Hugging Face por el usuario `johnnybravodo` que no contiene pesos de un modelo de lenguaje, sino una imagen de contenedor destinada a dos entradas del REAX Engine en la subred 92 de Bittensor (reglas de engine v2.0, track `dm-all`, slot `mammoth`). El repositorio documenta dos imágenes Docker con sus respectivos hotkeys y digests, correspondientes a los UID 85 y UID 127 de la subred. No se trata, por tanto, de un modelo entrenado con parámetros publicados, sino de un paquete de despliegue reproducible para un motor de inferencia.

La base del árbol de código es el repositorio público `reax-engine` del operador de la subred, fijado en el commit `3582925c2f47b1f38e9e4dd73095ee8cff49900c`, que corresponde a la imagen de referencia `reax-engine-ref-mammoth`. Sobre esa base se aplican los cambios descritos en `README-indep2.md`. Las dos imágenes comparten exactamente el mismo árbol de código y difieren únicamente en el valor de la variable de entorno `INDEP2_PLAIN_PATH` y en las etiquetas de las líneas de copia documentadas en `BUILD.md`.

La relevancia del artefacto es acotada y muy específica: sirve a operadores y validadores de la subred 92 de Bittensor que necesitan reproducir o verificar las entradas publicadas. No aporta un modelo reutilizable para tareas generales de generación de texto, código o razonamiento, y no se han publicado especificaciones de arquitectura, tamaño o contexto en la información disponible. Cabe señalar además que la fecha de creación indicada (2026-10-28) es posterior a la fecha actual, lo que conviene tratar con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de despliegue; no se publica arquitectura de modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 para las proyecciones seleccionadas, derivadas en el arranque del contenedor |
| Idiomas soportados | no disponible |
| Licencia | REAX Engine License 1.1 (base); Apache-2.0 (adiciones en `engine_indep2/` y cambios indep2 en `engine/`); MIT (`engine_indep2/s1items_public.py`) |
| Formato de pesos | no disponible (los pesos NVFP4 se derivan en tiempo de arranque desde `/model` de solo lectura; el repositorio no incluye pesos, escalas ni datos de calibración) |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura del modelo subyacente: el repositorio es un paquete de despliegue, no una model card de un modelo entrenado. Lo que sí se documenta es el mecanismo de cuantización: las imágenes no incorporan pesos, escalas ni datos de calibración, sino que los pesos NVFP4 de las proyecciones seleccionadas se derivan al arrancar el contenedor a partir del directorio `/model` montado en solo lectura. Las estadísticas de activación necesarias para esa derivación se miden en el arranque sobre el conjunto semilla público `0x52454158`, mediante el script `engine_indep2/startcal.py`.

El árbol de código parte de la imagen de referencia `reax-engine-ref-mammoth` en el commit indicado y se modifica según `README-indep2.md`. El repositorio incluye `BUILD.md` con las líneas exactas de construcción, los digests de capa de ambas imágenes y el procedimiento `tools/verify_shipped.sh` para comprobar que los ficheros enviados coinciden con los del repositorio. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque el artefacto no entrena ningún modelo.

## Capacidades

- Despliegue reproducible de dos entradas del REAX Engine en la subred 92 de Bittensor (UID 85 y UID 127), con imágenes Docker identificadas por digest.
- Derivación en tiempo de arranque de pesos NVFP4 para las proyecciones seleccionadas a partir de un directorio `/model` de solo lectura.
- Calibración automática de estadísticas de activación sobre el conjunto semilla público `0x52454158`.
- Verificación de integridad del árbol de código enviado mediante `tools/verify_shipped.sh` y los digests de capa de `BUILD.md`.
- Generación de ítems de validación mediante `engine_indep2/s1items_public.py`, el generador de ítems del validador, bajo licencia MIT.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo para este artefacto.

## Casos de uso

- Reproducción de entradas de subred: un operador que quiera replicar la entrada UID 85 o UID 127 puede construir la imagen a partir de las líneas de `BUILD.md` y comparar los digests de capa con los publicados para confirmar que obtiene exactamente el mismo artefacto.
- Auditoría de integridad: un validador puede ejecutar `tools/verify_shipped.sh` para comprobar que los ficheros del contenedor coinciden con los del repositorio, lo que permite descartar manipulación del árbol de código entre la publicación y el despliegue.
- Despliegue en infraestructura con `/model` montado en solo lectura: el contenedor deriva los pesos NVFP4 en el arranque, de modo que el operador solo necesita provisionar el directorio de modelo y no distribuir artefactos cuantizados precalculados.
- Investigación sobre cuantización NVFP4 en el arranque: el script `engine_indep2/startcal.py` y el conjunto semilla `0x52454158` sirven como referencia para estudiar cómo se miden estadísticas de activación y se derivan pesos de cuatro bits en un motor de inferencia real.
- Desarrollo de validadores para subredes Bittensor: `engine_indep2/s1items_public.py` actúa como generador de ítems del validador bajo licencia MIT, reutilizable para construir pruebas de evaluación en el track `dm-all`.
- Comparación de configuraciones: al diferir solo en `INDEP2_PLAIN_PATH`, las dos imágenes permiten aislar el efecto de esa variable de entorno sobre el comportamiento del motor manteniendo constante el resto del árbol de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo montado en `/model`, que no se especifica.
- GPU recomendadas: no disponible. La cuantización NVFP4 requiere hardware con soporte para formatos de cuatro bits; no se detalla qué generaciones son compatibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: contenedor Docker con el árbol `reax-engine` en el commit `3582925c2f47b1f38e9e4dd73095ee8cff49900c`; requiere un directorio `/model` montado en solo lectura y la variable de entorno `INDEP2_PLAIN_PATH` configurada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| `reax-engine-indep2` | Imagen de despliegue para subred Bittensor 92 | Árbol de código + derivación NVFP4 en arranque | REAX Engine License 1.1 + Apache-2.0 + MIT | Hugging Face, 0 descargas, 0 likes |
| `reax-engine-ref-mammoth` | Imagen de referencia del operador de subred | Árbol de código base sin cambios indep2 | REAX Engine License 1.1 | Referenciada en la model card; no se detalla su ubicación |
| `reax-engine` (repositorio) | Código fuente del motor | Árbol de código en el commit fijado | REAX Engine License 1.1 | GitHub, `reaxlabs/reax-engine` |

No se dispone de modelos comparables en la misma categoría (modelos de lenguaje con pesos publicados) porque este artefacto no es un modelo entrenado.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de lenguaje con pesos publicados: no puede evaluarse con benchmarks estándar ni usarse directamente para generación de texto, código o razonamiento.
- No se documentan sesgos, tasas de alucinación ni comportamiento lingüístico, al no tratarse de un modelo entrenado.
- La licencia base es la REAX Engine License 1.1, que no es una licencia de código abierto estándar; las adiciones son Apache-2.0 y el generador de ítems es MIT, por lo que el uso comercial requiere revisar los tres textos (`LICENSE`, `NOTICE`, `LICENSES/`) y el fichero `engine_indep2/s1items_public.py`.
- Los pesos NVFP4 se derivan en el arranque a partir de `/model`; si ese directorio no está disponible o no es el esperado, el contenedor no puede producir los pesos cuantizados. La reproducibilidad depende de que el modelo montado sea idéntico.
- La calibración se realiza sobre el conjunto semilla público `0x52454158`; no se documenta su composición ni su representatividad respecto a datos de producción.
- La fecha de creación y actualización indicada (2026-10-28) es posterior a la fecha actual, lo que puede indicar un error de metadatos o un artefacto de prueba; conviene verificarlo antes de cualquier uso.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados, lo que limita la evidencia externa sobre su funcionamiento.
- No se especifican requisitos de hardware, VRAM ni versiones de CUDA o drivers, por lo que el despliegue exige validación propia.

## Enlaces

- Hugging Face: https://huggingface.co/johnnybravodo/reax-engine-indep2
- Repositorio del motor: https://github.com/reaxlabs/reax-engine
- Commit de referencia: `3582925c2f47b1f38e9e4dd73095ee8cff49900c`
- Documentación de cambios: `README-indep2.md` (en el repositorio de Hugging Face)
- Instrucciones de construcción: `BUILD.md` (en el repositorio de Hugging Face)
- Script de verificación: `tools/verify_shipped.sh` (en el repositorio de Hugging Face)
- Script de calibración: `engine_indep2/startcal.py` (en el repositorio de Hugging Face)
- Generador de ítems del validador: `engine_indep2/s1items_public.py` (en el repositorio de Hugging Face)
- Imagen UID 85: `docker.io/astrageneral121/rxi2@sha256:f03638acfde0b8c89d9bcc16fec608ff31608638ccf250fd35c6f55153841b01`
- Imagen UID 127: `docker.io/astrageneral121/rxi2@sha256:dd06d30a7bb71ade5b11fa7f11094a6130929c1a5b90d67947052618cff2d705`

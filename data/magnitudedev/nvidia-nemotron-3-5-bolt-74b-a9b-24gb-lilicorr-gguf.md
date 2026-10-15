# magnitudedev/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF

## Resumen

Este repositorio contiene un modelo borrador (draft) en formato GGUF cuantizado a NVFP4, publicado por el usuario `magnitudedev`, que actúa como componente de decodificación especulativa para el modelo objetivo `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF`. A pesar de que el nombre del repositorio incluye "74B-A9B", el recuento real de parámetros del artefacto alojado aquí es de 1.112.828.867 parámetros (aproximadamente 1,11B), lo que confirma que se trata únicamente del modelo borrador LiLiCorr y no del modelo principal. El modelo objetivo al que acompaña es un MoE de 74B de parámetros totales con 9B activos, segun nomenclatura "A9B".

El propósito de este artefacto es acelerar la inferencia del modelo grande mediante decodificación especulativa: el borrador propone varios tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el numero de pasos de decodificación secuencial. Este borrador concreto emplea atención bidireccional en su bloque (`dflash.attention.causal = false`) y ventana deslizante de 1024 tokens en todas las capas, además de generar propuestas a partir de las filas de máscara iniciando después del ancla (`dflash.sample_from_anchor = false`).

Es relevante para desarrolladores que despliegan el Nemotron 3.5 Bolt en `llama.cpp`, ya que una pareja borrador-objetivo bien calibrada puede aumentar el throughput de generación sin alterar la salida final del modelo verificado. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador (draft) para decodificación especulativa; atención bidireccional en el bloque draft y ventana deslizante de 1024 por capa |
| Parametros totales | 1.112.828.867 (aprox. 1,11B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana deslizante de 1024 tokens por capa segun metadatos) |
| Tipos de cuantizacion | NVFP4 (formato GGUF indicado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other` con `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (fichero `NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr.gguf`) |

## Arquitectura y entrenamiento

El artefacto es un modelo borrador disenado para decodificación especulativa, integrado en el ecosistema `Magnitude` y compatible con `llama.cpp`. Su bloque de atención es bidireccional (no causal), segun el metadato `dflash.attention.causal = false`, y aplica una ventana deslizante de 1024 tokens en cada capa (`dflash.attention.sliding_window = 1024`). Las propuestas de tokens se generan a partir de las filas de máscara, comenzando tras el token ancla, tal como indica `dflash.sample_from_anchor = false`. Estos parámetros ("dflash") definen el modo de propuesta de tokens del borrador dentro del esquema de decodificación especulativa.

No se dispone de información en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el proceso de destilación seguido para construir el borrador a partir de su modelo base (`nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr`). La revisión de origen declarada es `4c6a5613b6d887194a3a5493e3a18a5b3930bb86`, y el GGUF se deriva de `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF` en la revisión `182d2987939e12f458298b5d5f6ef98912f4ad6c`. El hash SHA-256 del fichero es `43979b5789616082984a7287660b1194421f9c2afeb1e32aff72ea95a2e82962`.

## Capacidades

- No es un modelo generativo de propósito general: su función es proponer tokens candidatos para la decodificación especulativa del modelo objetivo NVIDIA Nemotron 3.5 Bolt 74B A9B.
- Acelera la inferencia del modelo verificado reduciendo el numero de pasos de decodificación secuencial.
- Compatible con `llama.cpp` y con el runtime `Magnitude` (https://github.com/magnitudedev/magnitude).
- Emplea atención bidireccional en el bloque borrador y ventana deslizante de 1024 tokens por capa.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" para este artefacto en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Aceleración de inferencia en producción: emparejar este borrador con `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF` en `llama.cpp` para reducir la latencia de generación por token mediante decodificación especulativa, manteniendo la salida verificada del modelo grande.
- Despliegue de asistentes conversacionales de baja latencia: el borrador propone tokens que el modelo objetivo valida, lo que permite respuestas mas rapidas en chats multi-turno siempre que el modelo verificador acepte las propuestas.
- Servicio de generación de código en pipelines interactivos: al reducir el coste por token del modelo de 74B, mejora la experiencia en autocompletado o asistencia dentro del editor.
- Optimización de costes en infraestructura GPU: al aumentar el throughput efectivo del modelo grande, permite atender mas peticiones por GPU sin cambiar el modelo de referencia.
- Evaluación y ajuste de esquemas especulativos: sirve como artefacto reproducible (hash y revisión fijados) para medir tasas de aceptación del borrador en distintos dominios.
- Integración en el runtime Magnitude: usar el borrador como componente nativo dentro de dicho ecosistema para despliegues que ya dependan de esa herramienta.
- Investigacion sobre decodificación especulativa con atención bidireccional y ventana deslizante: permite estudiar el impacto de estos parámetros en la tasa de aceptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 1,0 GB; el fichero GGUF NVFP4 del borrador ocupa aproximadamente ese orden de magnitud, por lo que cabe holgadamente en practicamente cualquier GPU de consumo.
- VRAM estimada para inferencia: por debajo de 2 GB para el borrador en NVFP4 (estimacion basada en el recuento de 1,11B de parametros y el tamano del repo), sin contar el modelo objetivo.
- Requisito real de VRAM: el modelo objetivo NVIDIA Nemotron 3.5 Bolt 74B A9B es el que domina la huella de memoria; no se dispone de cifras especificas de VRAM para el objetivo en la informacion proporcionada.
- GPU recomendadas: no disponible para el objetivo; el borrador es ejecutable en GPU de consumo (por ejemplo, gama RTX) por su tamano.
- Cabe en GPU de consumo: si, el borrador cabe en GPU de consumo; el modelo objetivo requiere hardware muy superior.
- Opciones de despliegue: `llama.cpp` y runtime `Magnitude` (https://github.com/magnitudedev/magnitude). Otras opciones como vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| magnitudedev/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF | Borrador (draft) | 1,11B | GGUF (NVFP4) | openmdw-1.1 | Objeto de esta ficha |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF | Objetivo (target) | 74B totales / 9B activos (segun nomenclatura) | GGUF | no disponible en esta ficha | Modelo verificado al que sirve el borrador |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr | Modelo base del borrador | no disponible | no disponible | no disponible en esta ficha | Origen de la cuantizacion |

No se dispone de datos comparativos de rendimiento (tasas de aceptacion, speedup) con otros borradores alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El artefacto es un borrador de decodificación especulativa, no un modelo autonomo: no debe usarse para generar respuestas finales sin el modelo objetivo que las verifique.
- Discrepancia de nomenclatura: el nombre incluye "74B-A9B-24GB", pero el recuento real de parametros del repositorio es de 1,11B, lo que puede inducir a error si no se lee la model card con atención.
- No se documentan sesgos conocidos, riesgos de alucinacion propios ni limitaciones de idioma para este borrador.
- Restricciones de licencia: se aplica `openmdw-1.1` (enlace en la model card a https://openmdw.ai/license/1-1/); es responsabilidad del usuario verificar las condiciones de uso comercial antes de desplegarlo.
- El rendimiento del esquema especulativo depende de la tasa de aceptación del borrador respecto al objetivo; no se aportan mediciones.
- No se declaran idiomas soportados ni datos de contexto maximo utilizable.
- El repositorio registra 0 descargas y 0 valoraciones, por lo que la validacion por parte de la comunidad es nula en el momento de la consulta.
- Dependencia del runtime `Magnitude` y de `llama.cpp`; la compatibilidad con otros motores de inferencia no esta confirmada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/magnitudedev/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Modelo objetivo (GGUF): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Fuente GGUF cuantizada: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-GGUF/tree/182d2987939e12f458298b5d5f6ef98912f4ad6c
- Revision del checkpoint de origen: 4c6a5613b6d887194a3a5493e3a18a5b3930bb86
- Runtime Magnitude: https://github.com/magnitudedev/magnitude
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

# mlboydaisuke/Qwen3.5-4B-litert-gpu-bug-evidence

## Resumen

`mlboydaisuke/Qwen3.5-4B-litert-gpu-bug-evidence` no es un modelo de lenguaje entrenado, sino un repositorio de evidencias tecnicas publicado en HuggingFace para acompanar dos informes de errores (bug reports) contra LiteRT-LM 0.19.0 en GPU. El autor, `mlboydaisuke`, agrupa aqui ficheros de medicion, tablas de resultados y prompts renderizados generados al ejecutar Qwen3.5-4B-3D-Coder en formato `.litertlm` sobre distintos backends graficos.

El primer conjunto de datos (`a_attachment_tables.md` y `a_prompt_c3.rendered.txt`) corresponde a un informe sobre el comportamiento por defecto de la ruta `sampler_handles_input` en GPU de Mac mediante WebGPU, medido entre el 1 y el 2 de noviembre de 2026 con LiteRT-LM 0.19.0 (paquete de PyPI, xcframework de release y `litert_lm_advanced_main` compilado desde el commit `dab2e708` de LiteRT-LM main). El segundo conjunto (`b_attachment_tables.md` y `b_memseries_p11a.tsv`) documenta un crecimiento de memoria anonima en la GPU de un Pixel 11 Pro con backend OpenCL, medido el 2 de noviembre de 2026 con el wheel Android `litert-lm-api` 0.19.0 de PyPI.

El interes del repositorio es, por tanto, forense y de depuracion: sirve como material reproducible para quienes investiguen problemas de inferencia en GPU con el runtime LiteRT-LM y modelos Qwen3.5 en formato `.litertlm`. No contiene pesos, tokenizador ni configuracion de inferencia, por lo que no es desplegable como modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de evidencias, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se mencionan ficheros Mixed INT4 del modelo referenciado, no de este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `.md`, `.txt` y `.tsv`; el modelo medido usa `.litertlm`) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni pesos. Es un anexo de material de depuracion compuesto por ficheros Markdown con tablas de medicion (`a_attachment_tables.md`, `b_attachment_tables.md`), un prompt renderizado (`a_prompt_c3.rendered.txt`) y una serie temporal de memoria en formato TSV (`b_memseries_p11a.tsv`). No hay informacion sobre arquitectura del modelo subyacente, composicion del dataset de entrenamiento, tokens procesados ni tecnicas de alineacion como RLHF o DPO.

Las mediciones documentadas se realizaron sobre Qwen3.5-4B-3D-Coder en ficheros `.litertlm`, concretamente los packs Mixed INT4 de `litert-community/Qwen3.5-4B-3D-Coder`, que segun la model card difieren de los medidos solo en la plantilla de chat. El entorno de ejecucion fue LiteRT-LM 0.19.0 en dos configuraciones: WebGPU sobre GPU de Mac (ruta por defecto `sampler_handles_input`) y OpenCL sobre GPU de Pixel 11 Pro (crecimiento de memoria anonima).

## Capacidades

- No aplica: el repositorio no expone un modelo con capacidades de generacion, razonamiento, codigo o vision.
- Contiene evidencia reproducible de dos fallos de LiteRT-LM 0.19.0 en GPU: comportamiento de la ruta `sampler_handles_input` en WebGPU (Mac) y crecimiento de memoria anonima en OpenCL (Pixel 11 Pro).
- Incluye tablas de medicion (`a_attachment_tables.md`, `b_attachment_tables.md`) y una serie temporal de memoria (`b_memseries_p11a.tsv`) utiles para comparar ejecuciones y verificar regresiones.
- Incluye un prompt renderizado (`a_prompt_c3.rendered.txt`) que permite reproducir exactamente la entrada usada en las mediciones.
- Referencia herramientas concretas: LiteRT-LM 0.19.0 (PyPI y xcframework), `litert_lm_advanced_main` desde el commit `dab2e708` y el wheel Android `litert-lm-api` 0.19.0.
- No soporta tool calling, agentes, multimodalidad ni capacidades multilingues por si mismo, al no ser un modelo.

## Casos de uso

- Reproduccion de fallos en LiteRT-LM: usar los ficheros adjuntos para replicar el comportamiento anomalo de `sampler_handles_input` en WebGPU sobre Mac y confirmar si el bug persiste en versiones posteriores a 0.19.0.
- Analisis de fugas de memoria en Android: cargar `b_memseries_p11a.tsv` en un notebook para trazar la evolucion de memoria anonima en OpenCL sobre Pixel 11 Pro y correlacionarla con eventos de inferencia.
- Comparacion de backends GPU: contrastar las tablas de Mac/WebGPU y Pixel/OpenCL para decidir que backend usar en produccion segun estabilidad y consumo de memoria.
- Validacion de builds personalizados: emplear el prompt renderizado y las tablas como referencia al compilar LiteRT-LM desde main (`dab2e708`) y verificar que los resultados coinciden.
- Reporte de regresiones upstream: adjuntar estos artefactos a issues del repositorio LiteRT-LM para facilitar la triage por parte de los mantenedores.
- Formacion interna de equipos de inferencia: usar el repositorio como ejemplo de metodologia de captura de evidencia (prompt exacto, version de runtime, serie temporal de memoria) al reportar bugs en runtimes de IA en dispositivo.
- Auditoria de despliegues con `.litertlm`: revisar las condiciones bajo las cuales el runtime consume memoria creciente antes de desplegar Qwen3.5-4B-3D-Coder en dispositivos Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene mediciones de comportamiento (tablas de adjuntos y serie de memoria), no evaluaciones de calidad del modelo subyacente.

## Requisitos de hardware

- No aplica al repositorio en si: son ficheros de texto de pocos kilobytes, sin requisitos de GPU.
- Para reproducir las mediciones descritas se requiere: un Mac con GPU compatible con WebGPU y LiteRT-LM 0.19.0 (PyPI o xcframework) o `litert_lm_advanced_main` desde `dab2e708`; y un Pixel 11 Pro con el wheel Android `litert-lm-api` 0.19.0 de PyPI para el caso OpenCL.
- El modelo medido es Qwen3.5-4B-3D-Coder en packs Mixed INT4 `.litertlm`; la VRAM/RAM concreta no se detalla en la informacion disponible.
- Opciones de despliegue del modelo medido: runtime LiteRT-LM (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no existen alternativas equivalentes de "evidencias de bug" con las que compararlo en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos, tokenizador ni configuracion; no puede usarse para inferencia.
- La licencia no esta declarada, lo que impide asumir permisos de reutilizacion o uso comercial de los artefactos.
- Las mediciones estan acotadas a LiteRT-LM 0.19.0 y a dos plataformas concretas (Mac WebGPU y Pixel 11 Pro OpenCL); no deben generalizarse a otras versiones o hardware.
- Los resultados dependen de la build exacta (`dab2e708` en main, wheel 0.19.0 de PyPI); pequenos cambios de version pueden invalidar la reproduccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No hay informacion sobre sesgos, alucinacion o limitaciones linguisticas porque no hay modelo; esas advertencias corresponderian al Qwen3.5-4B-3D-Coder referenciado, no a este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3.5-4B-litert-gpu-bug-evidence
- Modelo medido (referencia): https://huggingface.co/litert-community/Qwen3.5-4B-3D-Coder
- LiteRT-LM (runtime): no se proporciona URL directa en la informacion disponible; se mencionan el paquete PyPI `litert-lm-api` 0.19.0, el xcframework de release y el commit `dab2e708` de LiteRT-LM main.

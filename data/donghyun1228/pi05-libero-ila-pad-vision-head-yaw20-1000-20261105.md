# Donghyun1228/pi05-libero-ila-pad-vision-head-yaw20-1000-20261105

## Resumen

π0.5 LIBERO yaw20 es un checkpoint de adaptación de dominio para robótica construido sobre el modelo vision-language-action (VLA) π0.5, desarrollado por Donghyun1228 y publicado bajo licencia Apache 2.0. No se trata de un modelo de lenguaje generalista, sino de un artefacto de investigación que implementa la fila ILA (Invariance through Latent Alignment, Yoneda et al., RSS 2022) de la tabla LIBERO de un artículo sobre adaptación de VLAs. El repositorio contiene los pesos del codificador visual adaptado, el estado de entrenamiento, el crítico WGAN y la política de evaluación resultante.

El modelo parte de un checkpoint fuente (`pi05-libero-pad-img-source-ila-n50k-10000-20261105`) cuyo cabezal visual PAD se encuentra en el paso 9999, junto con un búfer de latentes de 49.600 ventanas y un modelo de dinámica directa preentrenado. Durante el entrenamiento solo se adapta el codificador visual (PaliGemma/img); el cabezal IDM, el LLM y el experto de acción permanecen congelados en el estado fuente. La adaptación se realiza mediante un esquema adversarial WGAN combinado con la pérdida del cabezal IDM congelado y el error cuadrático medio del modelo de dinámica directa.

La relevancia de esta ficha es acotada: es un checkpoint de investigación con fines de reproducibilidad, no un modelo listo para producción. Su interés radica en documentar una receta concreta de adaptación de dominio para políticas VLA en el benchmark LIBERO, con un resultado de éxito medido de 1071/2000 episodios (53,55 %). El repositorio ocupa 13 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (PaliGemma como torre visual y LLM, más experto de acción); adaptación ILA sobre el codificador visual |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `params` y `train_state` (formato nativo de openpi); crítico en `ila/critic_999.npz`; assets de normalización |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura π0.5, un VLA que combina un backbone PaliGemma (torre visual `PaliGemma/img` y LLM) con un experto de acción. En esta variante concreta, el entrenamiento congela el cabezal IDM, el LLM y el experto de acción, y adapta únicamente el codificador visual. El objetivo es alinear la representación latente de la cámara base entre el dominio fuente y el dominio objetivo mediante un esquema adversarial.

El procedimiento de entrenamiento, según la model card, ejecuta por iteración cinco actualizaciones del crítico WGAN (recorte de pesos 0,01, RMSProp 1e-5) sobre el latente agrupado de la cámara base, un paso adversarial del codificador (RMSProp 1e-5) y un paso del codificador de dinámica (RMSProp 1e-6) sobre la pérdida del cabezal IDM congelado (excluyendo el índice de gripper 6) más el MSE del modelo de dinámica directa congelado. Se usa batch de 32, semilla 42 y un total de 10.000 actualizaciones, guardando los pasos 999 y 9999. La política de evaluación (`policy/`) corresponde al paso 999 sin el cabezal IDM, con la torre visual adaptada aplicada a la cámara de muñeca.

## Capacidades

- Control robótico de manipulación en el benchmark LIBERO, con políticas entrenadas para tareas de manipulación de objetos.
- Adaptación de dominio del codificador visual mediante alineación latente adversarial (ILA).
- Evaluación de invariancia de representación mediante crítico WGAN y modelo de dinámica directa.
- Ejecución de políticas con observaciones de cámara base y cámara de muñeca.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; se trata de un checkpoint específico de robótica.
- No se documenta soporte de visión general, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de resultados de investigación: permite replicar la fila ILA de la tabla LIBERO del artículo de Yoneda et al. (RSS 2022) usando la receta y el preset `pi05_libero_ila_img_yaw_adapt` documentados en `Donghyun1228/vla_adaptation`.
- Estudio de adaptación de dominio en VLAs: sirve para analizar cómo la alineación latente adversarial del codificador visual afecta al rendimiento de una política congelada en el resto de componentes.
- Comparación de métodos de adaptación: al mantener fijos el LLM y el experto de acción, permite aislar el efecto del codificador visual frente a otras estrategias de fine-tuning.
- Evaluación en simulador MuJoCo: el checkpoint incluye una política lista para evaluarse con MuJoCo 3.2.3 y renderizado OSMesa, útil para montar pipelines de evaluación reproducibles.
- Investigación sobre invariancia de representaciones: el crítico WGAN guardado (`ila/critic_999.npz`) permite inspeccionar la calidad de la alineación latente alcanzada.
- Docencia y formación: como ejemplo práctico de un pipeline completo de adaptación de un VLA con pérdidas adversariales y de dinámica, con artefactos de normalización incluidos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| LIBERO (500 episodios por suite, semilla de entorno 7) | Tasa de exito, paso 999 | 1071/2000 = 53,55 % |
| LIBERO (500 episodios por suite, semilla de entorno 7) | Tasa de exito, paso 10000 | 1044/2000 = 52,20 % |

La evaluación se realizó con un evaluador `nvidia_h100` con renderizado OSMesa y MuJoCo 3.2.3. El checkpoint del paso 999 es el seleccionado por ser el mejor de los dos guardados. No se han publicado en la información disponible resultados desglosados por suite ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 13 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: la evaluación documentada se ejecutó en una NVIDIA H100; no se especifican otras GPU compatibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint usa el formato nativo de openpi (`params`, `train_state`, `assets`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO yaw20 (ILA, este checkpoint) | no disponible | no disponible | 53,55 % (paso 999) | Apache 2.0 | Hugging Face |
| π0.5 LIBERO PAD source (checkpoint fuente) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face (`Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105`) |
| Otros métodos de la tabla LIBERO del artículo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- El rendimiento medido (53,55 %) corresponde exclusivamente al benchmark LIBERO en simulación; no se documenta transferencia a robots reales.
- La adaptación solo modifica el codificador visual; el resto de componentes queda congelado en el estado fuente, lo que limita el alcance de la mejora.
- El paso 10000 obtiene un resultado inferior (52,20 %) al paso 999, lo que sugiere inestabilidad o sobreajuste en el entrenamiento adversarial.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin garantías, su uso en producción requeriría validación adicional no documentada.
- Los formatos de pesos son específicos de openpi; no hay conversiones a GGUF ni a otros formatos estándar.
- El repositorio de 13 GB incluye artefactos de entrenamiento (crítico, estado) que no son necesarios para la inferencia pero deben descargarse completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-ila-pad-vision-head-yaw20-1000-20261105
- Checkpoint fuente: https://huggingface.co/Donghyun1228/pi05-libero-pad-img-source-ila-n50k-10000-20261105
- Repositorio de código `Donghyun1228/vla_adaptation` (commit `1b67b86b`, documento `docs/naive_probe/ila_baseline_20261105.md`): no disponible como URL en la información proporcionada
- Artículo de referencia ILA: Yoneda et al., "Invariance through Latent Alignment", RSS 2022 (URL no disponible en la información proporcionada)

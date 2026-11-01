# hwang714/retivasc-tpot

## Resumen

RetiVASC · TPOT enhancement (ONNX) es un par de modelos de mejora de imagen oftalmológica exportados a ONNX por el usuario hwang714 para su uso dentro del pipeline RetiVASC, una herramienta de medición de vasos retinianos que se ejecuta en el navegador. El modelo principal realiza una pasada de mejora TPOT sobre fotografías de fondo de ojo a 256 x 256 píxeles, mientras que un segundo modelo (fusion head) restaura el detalle a 2048 x 2048 procesando la imagen en teselas de 512 píxeles.

Los pesos provienen del repositorio TPOT-SR del Geometry Systems Lab de la Arizona State University (commit `0620afa`) y fueron convertidos a ONNX mediante la herramienta `tools/export_tpot.py` de RetiVASC, con una discrepancia máxima de 4e-6 respecto a la implementación en PyTorch. El paquete está pensado para inferencia en el navegador mediante WebGPU, lo que permite integrar la mejora de imagen en aplicaciones clínicas o de investigación sin depender de servidores con GPU.

Es relevante porque ejemplifica el despliegue de modelos de imagen médica en entornos web con requisitos de reproducibilidad estrictos: cada release se etiqueta con una versión (`v0.1.0`) y el pipeline carga esa etiqueta en lugar de `main`, con un manifiesto que incluye tamaños y hashes SHA-256. No obstante, se trata de un modelo de investigación, sin licencia formal publicada y sin datos de rendimiento disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mejora de imagen; pesos `best_SSIM.pth` y cabeza de fusión TPOT-SR) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo image-to-image; entrada de 256 x 256 y fusión en teselas de 512 hasta 2048 x 2048) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | `retinal-research-tpot` (licencia personalizada; uso de investigación con RetiVASC, contacto con los autores para otros usos) |
| Formato de pesos | ONNX (float32): `tpot.onnx` (19 MB) y `fusion.onnx` (0,5 MB), más `manifest.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. Se sabe que el paquete consta de dos componentes: un modelo de mejora TPOT que procesa una fotografía de fondo de ojo en una pasada a 256 x 256 píxeles, y una cabeza de fusión (TPOT-SR) que restaura el detalle a 2048 x 2048 ejecutándose en teselas de 512 píxeles. Los pesos originales son `weights/best_SSIM.pth`, lo que sugiere que el criterio de selección del checkpoint fue la métrica SSIM (similitud estructural) sobre el conjunto de validación.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de técnicas de alineación (RLHF/DPO) ni innovaciones técnicas específicas más allá de la estrategia de superresolución por teselas y la exportación a ONNX verificada numéricamente contra PyTorch (diferencia máxima de 4e-6). El modelo está asociado al artículo arXiv:2411.01403, que no se detalla en la información proporcionada.

## Capacidades

- Mejora de imágenes de fondo de ojo (fundus) orientada al análisis vascular, ejecutada como paso previo a la medición de vasos en el pipeline RetiVASC.
- Procesamiento image-to-image: una pasada de mejora a 256 x 256 píxeles seguida de una restauración de detalle a 2048 x 2048 mediante fusión por teselas de 512 píxeles.
- Inferencia en el navegador mediante ONNX Runtime y WebGPU, sin necesidad de backend con GPU dedicada.
- Reproducibilidad verificable: manifiesto con tamaños y SHA-256, y releases etiquetadas (`v0.1.0`) que el pipeline carga de forma explícita.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código ni matemáticas; no es un modelo multimodal de propósito general.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión general, audio).

## Casos de uso

- Preprocesado en pipelines de investigación retiniana: el modelo se inserta antes del módulo de segmentación y medición de vasos de RetiVASC para normalizar y realzar el contraste de la imagen de fondo de ojo, mejorando la consistencia de las mediciones aguas abajo.
- Aplicaciones web de análisis retiniano en el navegador: al ejecutarse con ONNX y WebGPU, permite ofrecer mejora de imagen en una aplicación cliente sin enviar imágenes médicas a un servidor, lo que reduce exposición de datos sensibles.
- Prototipado rápido de herramientas de cribado visual: investigadores pueden desplegar un visor web que aplique la mejora TPOT a lotes de imágenes de estudio y comparar resultados con y sin realce.
- Docencia y demostraciones de oftalmología computacional: el tamaño reducido (19 MB + 0,5 MB) y el formato ONNX facilitan su inclusión en cuadernos y demos interactivas sin infraestructura pesada.
- Replicación de resultados publicados: al fijar la etiqueta `v0.1.0` y verificar hashes SHA-256, otros grupos pueden reproducir exactamente el preprocesado empleado en el artículo arXiv:2411.01403.
- Integración en herramientas de anotación: la restauración de detalle a 2048 x 2048 mediante fusión por teselas resulta útil para que anotadores humanos revisen estructuras vasculares finas sobre imágenes realzadas.
- Evaluación comparativa de métodos de mejora: sirve como línea base ONNX reproducible frente a otras técnicas de realce de fondo de ojo en estudios de ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es la diferencia numérica entre la exportación ONNX y la implementación en PyTorch, acotada a 4e-6, y la referencia al checkpoint `best_SSIM.pth`, que indica selección por SSIM sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; los pesos suman aproximadamente 19,5 MB en float32, por lo que el consumo de memoria vendrá dominado por las activaciones intermedias y por el procesamiento por teselas a 2048 x 2048.
- GPU recomendadas: no se especifican. Al ejecutarse en el navegador vía WebGPU, el requisito real es un navegador con soporte WebGPU y una GPU integrada o dedicada compatible.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con soporte WebGPU, dado el reducido tamaño de los pesos; no se dispone de cifras verificadas de VRAM pico.
- Opciones de despliegue: ONNX Runtime (incluido el backend WebGPU en navegador); el pipeline RetiVASC configura la URL de los pesos mediante `VITE_TPOT_URL`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de mejora de fondo de ojo ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el modelo no es un dispositivo médico y no debe emplearse para diagnóstico.
- Licencia personalizada `retinal-research-tpot`: el repositorio fuente no declara licencia formal; los pesos se comparten para uso de investigación con RetiVASC y cualquier otro uso requiere contactar con los autores. Esto limita el uso comercial.
- Ausencia de datos de entrenamiento y evaluación publicados en la información disponible, lo que impide valorar sesgos demográficos o de adquisición (por ejemplo, sesgos por tipo de cámara, etnia o calidad de imagen).
- Riesgo de artefactos o alucinación visual: al ser un modelo generativo de mejora de imagen, puede introducir estructuras vasculares inexistentes o alterar la morfología real, algo crítico en medición de vasos.
- Resolución de trabajo fija: la primera pasada opera a 256 x 256 y la restauración depende de fusión por teselas, con posible inconsistencia en las uniones entre teselas.
- Sin soporte de texto ni multilingüe; no debe confundirse con un modelo de propósito general.
- Dependencia de WebGPU y del ecosistema RetiVASC para su uso previsto; no se documentan alternativas de despliegue fuera del navegador.
- El pipeline carga etiquetas de versión concretas (`v0.1.0`), no `main`; usar otras referencias rompe la garantía de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hwang714/retivasc-tpot
- Repositorio RetiVASC: https://github.com/Retinal-Research/RetiVASC
- Repositorio TPOT-SR: https://github.com/Retinal-Research/TPOT-SR
- Artículo: https://arxiv.org/abs/2411.01403

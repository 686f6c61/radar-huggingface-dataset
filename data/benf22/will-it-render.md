# benf22/will-it-render

## Resumen

Will It Render (AttnSteer) es un conjunto de artefactos de investigación para modelos de texto a vídeo, desarrollado por Ben Fishman, Dvir Samuel, Gal Chechik e Idan Schwartz (Bar-Ilan University y NVIDIA). No es un modelo generativo en sí, sino un mecanismo de guiado de atención (attention steering) que se aplica sobre modelos de difusión de vídeo existentes para forzar la aparición de objetos solicitados en el prompt que de otro modo no se renderizan.

El problema que aborda es concreto: los modelos de texto a vídeo fallan de forma sistemática al representar algunos objetos pedidos explícitamente. La solución consiste en entrenar una sonda muy pequeña (37 000 parámetros) sobre los mapas de atención cruzada del generador que predice, para cada palabra del prompt, si el objeto correspondiente va a renderizarse. Esa predicción se convierte en una señal de pérdida diferenciable que se retropropaga al latente durante la inferencia, sin reentrenar el modelo base ni definir objetivos manuales.

La relevancia es metodológica: el guiado es agnóstico al backbone y se ha validado sobre Wan2.1-T2V-1.3B, LTX-2 y CogVideoX-5B, además de una variante temporal por fotograma para LTX-2. El repositorio de Hugging Face aloja únicamente los pesos de las sondas, los latentes semilla precalculados, las etiquetas de evaluación y los conjuntos de entrenamiento; la receta de guiado reside en el repositorio de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atención sobre mapas de atención cruzada de modelos de difusión de vídeo (un modelo por paso de denoising); no es un generador autónomo |
| Parametros totales | 37 000 (sonda AttnSteer); el generador subyacente aporta sus propios parámetros |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del backbone: Wan2.1-T2V-1.3B, LTX-2, CogVideoX-5B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch): `probe_step_NNN.pt` por paso y backbone, más latentes semilla `.pt` |
| Backbones soportados | `wan` (Wan2.1-T2V-1.3B), `ltx` (LTX-2), `cogvideox` (CogVideoX-5B), `ltx_timeline` (LTX-2 con control temporal por fotograma) |
| Tamano del repositorio | 0,0 GB (pesos de sonda ~3 MB en total) |
| Pipeline declarado | text-to-video |

## Arquitectura y entrenamiento

AttnSteer se entrena por separado para cada paso de denoising y para cada backbone. La entrada son los mapas de atención cruzada dirigidos a cada palabra del prompt; la sonda aprende a predecir la probabilidad de que el objeto asociado a esa palabra aparezca en el vídeo generado. El entrenamiento utiliza conjuntos por backbone (`wan.csv`, `ltx.csv`, `cogvideox.csv`) que contienen prompt, semilla, partición train/val y etiqueta, lo que permite reentrenar la sonda. La geometría de captura de las features queda fijada en `extraction_config.yaml` por backbone.

En inferencia, la pérdida de la sonda se retropropaga hasta el latente para empujar la generación hacia la aparición del objeto, sin modificar los pesos del generador ni recurrir a objetivos heurísticos. La variante `ltx_timeline` añade control temporal por fotograma sobre LTX-2. El repositorio incluye además latentes semilla precalculados por backbone, modelo, resolución y etiqueta de GPU (`__h100`, `__ctxa100`, `__a100`); solo se reproducen exactamente en la arquitectura de GPU para la que fueron etiquetados, mientras que el resto de semillas regeneran el ruido en el momento y son reproducibles únicamente dentro de una misma arquitectura de GPU.

## Capacidades

- Predicción de presencia de objeto por palabra del prompt a partir de mapas de atención cruzada, paso a paso de denoising.
- Guiado diferenciable en inferencia que fuerza el renderizado de objetos solicitados sin reentrenar el generador.
- Compatibilidad con tres backbones de texto a vídeo: Wan2.1-T2V-1.3B, LTX-2 y CogVideoX-5B.
- Control temporal por fotograma en la variante `ltx_timeline` sobre LTX-2.
- Extracción de features de atención cruzada de un backbone para entrenar sondas propias.
- Evaluación de presencia de objeto sobre vídeos de cualquier modelo mediante las métricas det-all y det-ratio.
- Conjunto de evaluación WIR de 473 prompts con semillas asociadas.
- Reproducción de la tabla det-all / det-ratio del paper sin GPU a partir de las etiquetas del detector incluidas.
- No incluye generación de texto, código, matemáticas, visión ni tool calling: su función es exclusivamente el control de la generación de vídeo.

## Casos de uso

- Investigación en control de difusión: usar la sonda y la pérdida para estudiar cómo se distribuye la atención cruzada hacia cada palabra y cómo modificarla en cada paso de denoising.
- Mejora de la fidelidad de prompts en producción de vídeo: aplicar el guiado sobre Wan2.1-T2V-1.3B o CogVideoX-5B cuando el pipeline actual omite objetos solicitados, sin reentrenar el generador.
- Evaluación objetiva de modelos de texto a vídeo: emplear las métricas det-all y det-ratio y el test set WIR de 473 prompts para medir la tasa de aparición de objetos en vídeos de cualquier modelo.
- Control temporal fino: usar la variante `ltx_timeline` para decidir en qué fotogramas debe aparecer un objeto concreto en una secuencia generada con LTX-2.
- Entrenamiento de sondas propias: extraer features de atención de un backbone nuevo y entrenar un AttnSteer específico con los CSV de entrenamiento como plantilla.
- Reproducción de resultados sin GPU: regenerar la tabla comparativa del paper a partir de `paper_eval/` mediante `will_it_render.evaluation.paper_table`.
- Integración en pipelines de generación por lotes: ejecutar `wir-run` con un bundle descargado por backbone para aplicar el guiado de forma sistemática sobre lotes de prompts y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tabla det-all / det-ratio reproducible con las etiquetas de `paper_eval/`, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- La sonda AttnSteer ocupa aproximadamente 3 MB en total, por lo que su coste de memoria es despreciable frente al del generador.
- El requisito real de VRAM lo determina el backbone: Wan2.1-T2V-1.3B, LTX-2 y CogVideoX-5B. No se especifican cifras de VRAM en la información disponible.
- Los latentes semilla están etiquetados por tipo de GPU (`__h100`, `__ctxa100`, `__a100`), lo que indica que el proyecto se ha ejecutado en H100, A100 y A100 con MIG/contexto extendido. No se confirma compatibilidad con GPU de consumo.
- Despliegue mediante el paquete `will-it-render` (`pip install -e .`), la variable de entorno `VP_WAN_ROOT` apuntando al checkout del motor y el comando `wir-run --bundle ... --prompt ... --target-words ... --seed ...`.
- La descarga y ensamblado de artefactos se realiza con `python -m scripts.download_artifacts --backbone <bb>`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Will It Render (AttnSteer) | Sonda de guiado de atención sobre difusión de vídeo | 37 000 (sonda) | no disponible | MIT | Hugging Face + GitHub |
| Wan2.1-T2V-1.3B | Generador texto a vídeo (backbone) | 1300 M | no disponible | no disponible en la informacion | Backbone soportado por AttnSteer |
| LTX-2 | Generador texto a vídeo (backbone) | no disponible | no disponible | no disponible en la informacion | Backbone soportado por AttnSteer |
| CogVideoX-5B | Generador texto a vídeo (backbone) | 5000 M | no disponible | no disponible en la informacion | Backbone soportado por AttnSteer |

No se dispone de datos de rendimiento comparativo entre AttnSteer y otras técnicas de guiado de atención, por lo que la comparativa se limita a la relación con los backbones sobre los que opera.

## Limitaciones y advertencias

- No es un modelo generativo: requiere un backbone de texto a vídeo instalado y configurado (`VP_WAN_ROOT` y el checkout del motor) para funcionar.
- La reproducibilidad exacta de los latentes semilla está restringida al tipo de GPU para el que fueron etiquetados; otras semillas solo son reproducibles dentro de una misma arquitectura de GPU.
- El repositorio de Hugging Face no contiene la receta de guiado, que reside en `configs/steering/<backbone>.yaml` del repositorio de código; sin ese repositorio los artefactos no son operativos por sí solos.
- El repositorio tiene 0 descargas y 0 likes, y el arXiv figura como "coming soon": no hay revisión por pares publicada en la información disponible.
- La sonda se entrena por paso de denoising y por backbone, por lo que no es directamente transferible a otros generadores sin reentrenamiento.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe del sistema.
- Licencia MIT, que permite uso comercial, pero conviene verificar las licencias de los backbones subyacentes (Wan2.1, LTX-2, CogVideoX-5B), no detalladas aquí.
- El tamaño del repositorio es de 0,0 GB, coherente con pesos de sonda de pocos megabytes, pero no incluye los pesos de los generadores.

## Enlaces

- Hugging Face: https://huggingface.co/benf22/will-it-render
- Página del proyecto: https://benf22.github.io/will-it-render/
- Repositorio de código: https://github.com/benf22/will-it-render-code
- Test set WIR (473 prompts): https://github.com/benf22/will-it-render-code/tree/main/data/WIR_testset
- arXiv: pendiente de publicación (enlace provisional en la página del proyecto)

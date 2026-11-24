# novoselova/synthforest

## Resumen

SynthForest es una colección de cinco checkpoints de visión por computador orientados a teledetección forestal, desarrollados por Novoselova, Song y Yokoya en el marco del artículo *SynthForest: A Multi-Task Synthetic Dataset for Real-World Forest Vision*. El repositorio agrupa un modelo de estimación de altura de dosel (Syn-20, basado en DINOv3 + DPT con entrada de 20 cm/píxel) y cuatro variantes de Mask R-CNN para delineación de copas de árboles, entrenadas con supervisión sintética y, en algunos casos, con fusión de altura y adaptación de dominio mediante Mean Teacher.

La propuesta central es el uso de un dataset sintético (SynthForest) para entrenar modelos que luego se aplican a imágenes reales de bosque. Todos los modelos comparten un encoder DINOv3 ViT-L/16 (LVD-1689M) congelado; el repositorio solo almacena los parámetros entrenados, mientras que el backbone debe descargarse por separado bajo la licencia de DINOv3. El tamaño del repositorio es de 0,4 GB.

Es relevante para investigadores en teledetección y silvicultura que necesiten estimar estructura forestal (altura de dosel, segmentación de copas) sin depender de grandes volúmenes de anotación real, aprovechando la supervisión sintética y las técnicas de adaptación de dominio documentadas en el paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Syn-20: DINOv3 ViT-L/16 (encoder congelado) + DPT para regresión de altura; Mask R-CNN para delineación de copas |
| Parametros totales | no disponible (solo se publican los parámetros entrenados; el backbone DINOv3 ViT-L/16 se carga aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC BY 4.0 para los pesos del repositorio; el backbone DINOv3 queda sujeto a su propia licencia |
| Formato de pesos | checkpoints PyTorch (`.pth`); backbone DINOv3 cargado desde pesos oficiales |

## Arquitectura y entrenamiento

El modelo Syn-20 combina un encoder DINOv3 ViT-L/16 (preentrenado con LVD-1689M) congelado con un cabezal DPT para la regresión densa de altura de dosel, trabajando sobre imágenes de 20 cm de resolución por píxel. Las cuatro variantes de delineación de copas se basan en Mask R-CNN: `maskrcnn_syn.pth` se entrena únicamente con supervisión sintética; `maskrcnn_syn_hf.pth` añade fusión de la altura estimada por Syn-20 en las etapas P8/P16; `maskrcnn_syn_mt.pth` incorpora adaptación de dominio mediante Mean Teacher; y `maskrcnn_syn_hf_mt.pth` combina ambas técnicas (fusión de altura y Mean Teacher).

Todos los checkpoints corresponden a la iteración final de entrenamiento; en los modelos Mean Teacher se almacenan los pesos EMA del profesor. El entrenamiento se apoya en el dataset sintético SynthForest y en las configuraciones del repositorio de código asociado. No se detalla en la información disponible el número de tokens ni la composición exacta del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Estimación de altura de dosel forestal a partir de imágenes de 20 cm/píxel (Syn-20).
- Delineación e instanciación de copas de árboles mediante Mask R-CNN.
- Fusión multimodal de altura estimada con segmentación de copas (variantes `_hf`).
- Adaptación de dominio de datos sintéticos a imágenes reales mediante Mean Teacher (variantes `_mt`).
- Segmentación de instancias (máscaras por copa) además de detección.
- Inferencia sobre imágenes de teledetección; no soporta texto, tool calling ni agentes.
- Capacidades multilingües: no aplica.
- Modo thinking, visión general, audio: no disponibles.

## Casos de uso

- Inventario forestal automatizado: estimar la altura del dosel a escala de rodal a partir de ortofotos de 20 cm usando Syn-20, reduciendo la dependencia de datos LiDAR.
- Delineación de copas para conteo de árboles: emplear `maskrcnn_syn_hf_mt.pth` para segmentar copas individuales en imágenes reales y derivar densidades y distribución espacial.
- Monitorización de crecimiento y biomasa: comparar estimaciones de altura entre campañas para detectar cambios estructurales en masas forestales.
- Transferencia sintético-a-real: usar las variantes Mean Teacher cuando no se disponga de anotaciones reales, aprovechando el dataset sintético como fuente de supervisión.
- Gestión de incendios y riesgo: caracterizar la estructura vertical del combustible forestal (altura de dosel) para modelos de propagación.
- Investigación en teledetección: servir como baseline reproducible para experimentos de adaptación de dominio en visión forestal, con código y configuraciones públicas.
- Planificación de repoblación y silvicultura de precisión: identificar copas dominantes y estimar altura media por parcela para decisiones de manejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las Tablas 4 y 5 del paper para los resultados de Syn-20 y de las variantes Mask R-CNN, respectivamente, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder DINOv3 ViT-L/16 congelado y el cabezal DPT implican un consumo moderado, pero no se documenta cifra concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el repositorio oficial de código (`synthforest evaluate ...`), cargando checkpoints `.pth` con PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de altura de dosel o delineación de copas con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El backbone DINOv3 no se incluye en el repositorio y debe obtenerse por separado bajo la licencia de DINOv3, que puede imponer restricciones adicionales al uso comercial.
- Los pesos publicados corresponden únicamente a los parámetros entrenados; sin el backbone oficial el modelo no es funcional.
- Entrenamiento basado en datos sintéticos: posible brecha de dominio respecto a imágenes reales, mitigada parcialmente por Mean Teacher pero no eliminada.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas (no aplica lenguaje).
- La licencia CC BY 4.0 exige atribución; conviene verificar la compatibilidad con la licencia del backbone antes de un despliegue comercial.
- El paper figura con URL placeholder (`PAPER_URL`) y la citación como `CITATION_TBD`, por lo que la referencia bibliográfica definitiva no está disponible en el repositorio.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar producción sin pruebas propias.
- Modelo de nicho (teledetección forestal): no debe emplearse fuera de su dominio previsto.

## Enlaces

- Hugging Face: https://huggingface.co/novoselova/synthforest
- Dataset SynthForest: https://huggingface.co/datasets/novoselova/synthforest
- Código: https://github.com/iaroslavanovoselova/SynthForest
- Paper: no disponible (la model card usa un placeholder `PAPER_URL`)
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Pesos DINOv3: no disponible en la información proporcionada (deben obtenerse bajo la licencia DINOv3)

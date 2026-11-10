# Agnuxo/lmc2-frozen-fivefold-mip-20261109

## Resumen

El modelo `lmc2-frozen-fivefold-mip-20261109` es un conjunto de cinco checkpoints de una red U-Net personalizada de cuatro salidas, publicada por el investigador independiente Francisco Angulo de Lafuente bajo el identificador de Hugging Face Agnuxo. Su tarea es la predicción de imagen a imagen en el ámbito de la microscopía de fluorescencia: a partir de una imagen de microscopía de luz transmitida (transmitted-light), el modelo genera cuatro mapas de fluorescencia correspondientes a núcleo, mitocondrias, actina y tubulina. Forma parte de la competición Light My Cells 2 alojada en Grand Challenge.

El paquete no es un modelo de lenguaje ni un transformer: es una U-Net convolucional de cuatro salidas que debe cargarse con `torch.load(..., weights_only=True)` y la arquitectura del proyecto, no mediante `from_pretrained` de Transformers. Los pesos corresponden a cinco folds de la edición 1, entrenados durante 20.000 iteraciones cada uno, y esta actualización no introduce ajuste alguno sobre datos de la edición 2. El repositorio incluye además un adaptador de inferencia corregido que aplica el máximo sobre el eje z en GPU antes de una única transferencia final.

La relevancia del modelo es acotada y específica: sirve como referencia reproducible para la predicción de modalidades de fluorescencia en MIP (maximum intensity projection) y como artefacto de entrega para la competición. El autor declara explícitamente que las mediciones de rendimiento incluidas no establecen precisión biológica, mejora de SSIM/PCC, validez clínica ni posición en la clasificación del reto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional personalizada con cuatro salidas (núcleo, mitocondrias, actina, tubulina) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión original) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 (pesos y código propio); datos de entrenamiento con atribución CC-BY |
| Formato de pesos | checkpoints PyTorch (`fold0.pt` a `fold4.pt`) empaquetados en `lmc2-ensemble-model-20261027.tar.gz` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net convolucional de cuatro salidas diseñada específicamente para la predicción de fluorescencia a partir de luz transmitida. El conjunto publicado consta de cinco folds (`fold0.pt` a `fold4.pt`) entrenados de forma independiente durante 20.000 iteraciones cada uno, lo que constituye un ensemble de cinco miembros. El modelo no es un transformer ni emplea mecanismos de atención; se carga con la arquitectura propia del proyecto (`lmc_model.py`) y requiere el módulo `lmc_common.py` y el manifiesto `model_manifest.json` sin modificaciones.

Los datos de entrenamiento proceden del estudio S-BIAD1047 (BioStudies/EMBL-EBI) y de las publicaciones del dataset citadas en el proyecto, con atribución CC-BY. No se especifica en la información disponible el número total de tokens (no aplica), la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplica a un modelo de visión supervisado). La innovación técnica destacable de esta actualización es el adaptador de inferencia corregido (`inference.py`, hash 019be8bc), que aplica la reducción de máximo sobre el eje z en GPU antes de una única transferencia al host, en lugar de transportar el volumen completo. En una comparación sintética con una RTX 3090, el autor reporta una relación de throughput media geométrica de 1,09472x sobre nueve casos y 27 repeticiones emparejadas, con bytes de salida idénticos. El adaptador anterior de solo transporte se conserva en `inference_streaming.py` (hash 5dbd3db8).

## Capacidades

- Predicción de imagen a imagen: transforma una imagen de microscopía de luz transmitida en cuatro mapas de fluorescencia (núcleo, mitocondrias, actina y tubulina).
- Proyección de máxima intensidad (MIP): el adaptador de inferencia aplica el máximo sobre el eje z en GPU antes de la transferencia final.
- Ensemble de cinco folds: los cinco checkpoints permiten promediar predicciones para reducir varianza.
- Ejecución en CPU y GPU: el autor indica que se incluyen comprobaciones separadas para CPU con imágenes reales y para GPU con fuente integrada.
- Verificación de integridad: el paquete incluye `weights_manifest.json` con SHA-256 de cada checkpoint y un verificador de registros basado en librería estándar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera de la predicción de fluorescencia en microscopía.

## Casos de uso

- Predicción de modalidades de fluorescencia en pipelines de microscopía: el modelo genera los cuatro canales (núcleo, mitocondrias, actina, tubulina) a partir de una única adquisición de luz transmitida, lo que permite reducir la exposición de la muestra y el fotoblanqueo en experimentos de imagenología.
- Participación en la competición Light My Cells 2: el paquete incluye el adaptador de inferencia corregido y los cinco checkpoints necesarios para generar envíos MIP; el autor reporta un envío simulado aceptado con estado oficial "Succeeded" (`bb264226-a9c4-4a82-bbdc-f2429d1f4e45`).
- Reproducibilidad de investigación: al publicar los cinco checkpoints originales con manifiesto SHA-256 y el código fuente completo, permite a otros grupos reproducir las predicciones y auditar el pipeline sin reentrenar.
- Evaluación comparativa de adaptadores de inferencia: el par `inference.py` / `inference_streaming.py` permite medir el impacto del transporte de volúmenes z en el throughput (1,09472x reportado en RTX 3090 sintética).
- Docencia y formación en segmentación biológica: la U-Net de cuatro salidas y los datos S-BIAD1047 permiten construir ejercicios de predicción de fluorescencia con ground truth público.
- Integración en flujos de análisis de imágenes de alto contenido: el modelo puede insertarse como etapa previa a la segmentación y cuantificación celular en pipelines de biología celular, siempre que se valide la precisión biológica de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor incluye únicamente una medición de throughput sintético (relación media geométrica de 1,09472x en RTX 3090 sobre nueve casos y 27 repeticiones emparejadas, con bytes de salida idénticos) y declara explícitamente que esas mediciones no establecen tiempos en T4, precisión biológica, mejora de SSIM/PCC, validez clínica ni posición en la clasificación del reto. No se proporcionan valores de MMLU, HumanEval, GSM8K ni métricas de imagen como SSIM o PCC.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,2 GB, lo que sugiere que los cinco checkpoints juntos ocupan un espacio reducido, pero no se especifica la VRAM necesaria por fold ni para el ensemble.
- GPU recomendadas: el autor cita una RTX 3090 para las mediciones de throughput sintético; no se proporcionan datos para A100, H100 ni otras GPU.
- Compatibilidad con GPU de consumo: probable por el tamaño del repositorio (0,2 GB) y el uso de una RTX 3090 en las pruebas, pero no se confirma para modelos concretos.
- Opciones de despliegue: carga directa con PyTorch (`torch.load(..., map_location="cpu", weights_only=True)`) usando la arquitectura del proyecto (`lmc_model.py`, `lmc_common.py`, `model_manifest.json`) y la variable de entorno `LMC_MODEL_DIR`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: solo se reporta la relación de throughput del adaptador corregido frente al anterior (1,09472x en RTX 3090 sintética). No se publican valores absolutos de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (predicción de fluorescencia a partir de luz transmitida en Light My Cells 2) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El autor declara explícitamente que las mediciones de timing sintético no establecen precisión biológica, mejora de SSIM/PCC, validez clínica ni posición en la clasificación del reto.
- Los pesos corresponden a la edición 1 de Light My Cells 2 y no incorporan ajuste sobre datos de la edición 2; el rendimiento en la fase final de diciembre no está garantizado.
- No es un modelo de Transformers: no puede cargarse con `from_pretrained` y requiere la arquitectura y los módulos auxiliares del proyecto.
- No debe modificarse la normalización ni seleccionarse los pesos de fold en función de los objetivos de evaluación, según advierte el autor.
- El paquete excluye datasets de microscopía en resolución completa y archivos de ground truth independientes, así como contactos privados, credenciales, imágenes base de Docker y binarios de runtime de terceros.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al ser un modelo de visión supervisado, el riesgo se traduce en predicciones de fluorescencia inexactas, no en texto inventado.
- Licencia: los pesos y el código propio son Apache-2.0, pero los datos de entrenamiento (S-BIAD1047) mantienen atribución CC-BY, lo que impone obligaciones de atribución en usos derivados.
- Las figuras de terceros conservan su atribución CC-BY 4.0 (ver THIRD_PARTY.md).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Agnuxo/lmc2-frozen-fivefold-mip-20261109
- Repositorio del proyecto: https://github.com/Agnuxo1/LightMyCells2-ModalityAware-UNet
- Competición Light My Cells 2: https://lightmycells2.grand-challenge.org/
- Dataset S-BIAD1047: https://www.ebi.ac.uk/biostudies/bioimages/studies/S-BIAD1047
- ORCID del autor: https://orcid.org/0009-0001-1634-7063
- arXiv del autor: https://arxiv.org/a/angulodelafuente_f_1.html
- Google Scholar del autor: https://scholar.google.com/citations?user=6nOpJ9IAAAAJ
- ResearchGate del autor: https://www.researchgate.net/profile/Francisco-Angulo-Lafuente-3
- Figshare del autor: https://figshare.com/authors/Francisco_Angulo_de_Lafuente/22601234
- Wikipedia del autor: https://es.wikipedia.org/wiki/Francisco_Angulo_de_Lafuente
- Patente ES 2273594 B1 (OEPM): https://www.oepm.es/pdf/ES/0000/000/02/27/35/ES-2273594_B1.pdf
- Patente ES 2273594 B1 (Google Patents): https://patents.google.com/patent/ES2273594B1/en
- Patente ES 2341194 B1 (OEPM): https://www.oepm.es/pdf/ES/0000/000/02/34/11/ES-2341194_B1.pdf
- Patente ES 2341194 B1 (Google Patents): https://patents.google.com/patent/ES2341194B1/en

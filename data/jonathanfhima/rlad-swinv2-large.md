# JonathanFhima/RLAD-SwinV2-Large

## Resumen

RLAD-SwinV2-Large (conocido internamente como LUNetV2) es un modelo de segmentación de vasos retinianos especializado en la separación de arterias y venas en imágenes de fondo de ojo. Lo desarrolla Jonathan Fhima y un equipo de investigadores del AIM Lab, con colaboración de instituciones como KU Leuven y el Technion. El modelo parte del backbone SwinV2-Large de Microsoft (`microsoft/swinv2-large-patch4-window12-192-22k`) y se entrena con imágenes sintéticas generadas por RLAD (Retinal Layout-Aware Diffusion) junto con el conjunto de datos REYIA.

El problema que resuelve es la generalización limitada de los segmentadores de vasos retinianos cuando se aplican a dominios distintos del de entrenamiento. La segmentación arteria/vena (AV) es crítica para el cálculo de biomarcadores vasculares (grosor, tortuosidad, densidad) con valor diagnóstico en enfermedades cardiovasculares y oculares. RLAD genera imágenes de fondo de ojo condicionadas por la disposición vascular, lo que amplía la diversidad del entrenamiento sin necesidad de anotaciones adicionales.

Con 201,5 millones de parámetros, el modelo se distribuye en formato safetensors y ONNX, con código personalizado (`trust_remote_code=True`) y licencia mixta: Apache 2.0 para el código y no comercial para los pesos. Es relevante ahora porque ofrece un peso abierto de referencia para segmentación AV con evaluación en múltiples conjuntos locales, externos y fuera de distribución (OOD).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwinV2 Transformer con cabecera de segmentación (swinv2_segmenter) |
| Parametros totales | 201.498.484 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 192×192 px según backbone) |
| Tipos de cuantizacion | bfloat16 (precisión de entrenamiento); no se documentan otras |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | Código Apache 2.0; pesos solo para investigación y uso no comercial |
| Formato de pesos | safetensors, ONNX |
| Modelo base | microsoft/swinv2-large-patch4-window12-192-22k |
| Tarea | Segmentación semántica binaria por clase (arteria, vena) |
| Dataset de entrenamiento | REYIA + imágenes sintéticas RLAD |
| Tamaño del repositorio | 0,9 GB |
| Descargas | 193 |
| Likes | 2 |

## Arquitectura y entrenamiento

El modelo emplea un backbone SwinV2-Large con ventanas de atención de 12×12 y parches de 4×4 sobre entradas de 192×192 píxeles, preentrenado en ImageNet-22k. Sobre este backbone se añade una cabecera de segmentación que produce dos mapas de probabilidad (arteria y vena) a resolución de píxel. La inferencia se ejecuta en bfloat16, la misma precisión usada durante el entrenamiento.

El entrenamiento combina el conjunto REYIA con imágenes sintéticas generadas por RLAD, un modelo generativo condicionado por la disposición vascular (layout-aware) que produce fondos de ojo realistas con arterias y venas coherentes. Esta estrategia de aumento de datos aborda el problema de la escasez de anotaciones AV y mejora la generalización a dominios no vistos. El modelo card reporta ablaciones sobre el número de datasets de entrenamiento y sobre el objetivo de preentrenamiento y el método de generación condicionada a AV, lo que indica un pipeline de entrenamiento supervisado con aumento generativo, sin que se documenten fases de RLHF o DPO (no aplicables a segmentación).

## Capacidades

- Segmentación de arterias y venas en imágenes de fondo de ojo retiniano, con salida de dos canales de probabilidad.
- Generación de máscaras binarias y overlays coloreados (arterias en rojo, venas en azul) mediante el script `infer.py`.
- Procesamiento de imágenes RGB de fondo de ojo con preprocesamiento integrado vía `AutoImageProcessor`.
- Integración con la librería Transformers mediante `AutoModel` y `trust_remote_code=True`.
- Exportación a ONNX para despliegue en entornos no Python o acelerados.
- Encadenamiento con PVBM para el cálculo de biomarcadores vasculares a partir de la máscara segmentada.
- Evaluación estandarizada mediante el scorer del repositorio REYIA (`scripts/eval/dice_score.py`).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo puramente visual.

## Casos de uso

- **Cribado de retinopatía en programas poblacionales**: el modelo segmenta arterias y venas en imágenes de fondo de ojo para alimentar métricas de calibre y tortuosidad vascular; su entrenamiento con datos sintéticos RLAD mejora la robustez frente a cámaras y protocolos distintos de los del entrenamiento.
- **Cálculo de biomarcadores vasculares**: combinado con PVBM, la máscara AV permite derivar densidad vascular, relación arteria/vena y tortuosidad, usados en investigación cardiovascular y oftalmológica.
- **Evaluación de riesgo cardiovascular**: la relación arteriovenosa (AVR) calculada a partir de la segmentación es un marcador conocido de hipertensión y riesgo cardiometabólico; el modelo permite automatizar su estimación en cohortes grandes.
- **Investigación multi-centro**: la evaluación en conjuntos locales, externos y OOD (UZLF, LES-AV, INSPIRE, FIVES, DRIVE, TREND, MBRSET, AV-WIDE) lo hace adecuado para estudios que requieren consistencia entre dominios de imagen.
- **Generación de datos anotados para otros modelos**: las máscaras AV producidas pueden servir como pseudoetiquetas para preentrenar o destilar segmentadores más ligeros en pipelines de investigación.
- **Docencia y validación de algoritmos**: el repositorio incluye un cuaderno Colab de extremo a extremo (RLAD + PVBM) que permite reproducir el pipeline completo desde una imagen cruda hasta biomarcadores, útil para formación y verificación de resultados.
- **Análisis retrospectivo de bases de datos de fondo de ojo**: al ser un modelo de 201 M de parámetros y 0,9 GB, puede ejecutarse sobre lotes de imágenes en una sola GPU para reanotar archivos históricos con separación AV.

## Benchmarks y rendimiento

El modelo card referencia una tabla de resultados (Table 1) con la puntuación Dice de arteria/vena promediada sobre conjuntos de prueba locales, externos y OOD, comparando RLAD integrado en DinoV2, RETFound y SwinV2 en varios tamaños. La tabla se publica como imagen (`table1_rlad_results.png`) y no se incluyen los valores numéricos en el texto proporcionado. La release corresponde a la fila SwinV2-large.

No se han publicado resultados de benchmarks numéricos en la información disponible; consultar la imagen de la tabla y el scorer del repositorio REYIA para los valores exactos.

## Requisitos de hardware

- **VRAM estimada**: con 201,5 M de parámetros en bfloat16, los pesos ocupan aproximadamente 0,4 GB; sumando activaciones y buffers de inferencia, se estima un uso de 1-2 GB de VRAM para lotes pequeños.
- **GPU recomendadas**: cualquier GPU con soporte bfloat16; RTX 3090, RTX 4090, A100 y H100 son adecuadas. También funciona en GPUs de gama media (RTX 3060, 12 GB) y en CPU para inferencia puntual.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo con al menos 4 GB de VRAM.
- **Opciones de despliegue**: Transformers con `trust_remote_code=True`, ONNX Runtime (pesos ONNX incluidos), y el script CLI `infer.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLAD-SwinV2-Large | 201,5 M | Segmentación AV en fondo de ojo | 192×192 px | Código Apache 2.0; pesos no comerciales | Hugging Face, ONNX |
| SwinV2-Large base (Microsoft) | ~197 M | Clasificación/visión general | 192×192 px | MIT | Hugging Face |
| DinoV2 (con RLAD, según paper) | no disponible | Segmentación AV (variante del estudio) | no disponible | no disponible | Referenciado en el paper |
| RETFound (con RLAD, según paper) | no disponible | Segmentación AV (variante del estudio) | no disponible | no disponible | Referenciado en el paper |

La comparación cuantitativa con estos modelos se encuentra en la Table 1 del paper (imagen no transcrita). No se dispone de cifras numéricas en la información proporcionada para completar la comparativa de rendimiento.

## Limitaciones y advertencias

- **Licencia de pesos no comercial**: los pesos son solo para investigación; el uso comercial está prohibido porque el conjunto de entrenamiento incluye subconjuntos con licencias restrictivas (MESSIDOR prohíbe explícitamente la redistribución y el uso comercial; MAGRABIA es CC BY-NC 4.0; ENRICH y UZLF tienen protocolos no comerciales de KU Leuven).
- **Licencia ambigua en PAPILA**: el campo de licencia en figshare indica GPL 3.0+, probablemente un error del depositante no corregido, lo que añade incertidumbre legal sobre ese subconjunto.
- **Dominio restringido**: solo procesa imágenes de fondo de ojo retiniano; no es aplicable a otras modalidades de imagen médica sin reentrenamiento.
- **Resolución de entrada fija**: 192×192 píxeles según el backbone; imágenes de mayor resolución deben redimensionarse, lo que puede perder detalle en vasos finos.
- **Riesgo de alucinación en píxeles**: como todo segmentador, puede producir máscaras plausibles pero incorrectas en imágenes de baja calidad, con artefactos o con patología que altere la morfología vascular; se recomienda validación cualitativa en dominios nuevos.
- **Sesgos de datos**: el entrenamiento mezcla cohortes de varios centros (UZLF, GRAPE, MAGRABIA, MESSIDOR, PAPILA, ENRICH), con posible infrarrepresentación de determinadas etnias, cámaras o grados de severidad; la generalización a poblaciones no incluidas no está garantizada.
- **Dependencia de `trust_remote_code`**: la carga requiere ejecutar código del repositorio, lo que implica revisar y confiar en el código publicado antes de usarlo en producción.
- **Falta de datos de rendimiento en la ficha**: no se publican cifras de latencia ni throughput, lo que dificulta planificar despliegues de alto volumen sin pruebas propias.
- **No es un dispositivo médico**: no se documenta validación regulatoria; su uso en diagnóstico clínico requiere estudios adicionales y aprobación correspondiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/JonathanFhima/RLAD-SwinV2-Large)
- [Paper arXiv 2503.01190](https://arxiv.org/abs/2503.01190)
- [Repositorio GitHub RLAD](https://github.com/aim-lab/RLAD)
- [Dataset REYIA](https://huggingface.co/datasets/JonathanFhima/REYIA)
- [Tutorial Colab RLAD + PVBM](https://colab.research.google.com/github/aim-lab/PVBM/blob/main/rlad_pvbm_tutorial.ipynb)
- [Repositorio GitHub PVBM](https://github.com/aim-lab/PVBM)
- [Dataset UZLF (KU Leuven)](https://rdr.kuleuven.be/dataset.xhtml?persistentId=doi:10.48804/Z7SHGO)
- [Modelo base microsoft/swinv2-large-patch4-window12-192-22k](https://huggingface.co/microsoft/swinv2-large-patch4-window12-192-22k)

# JaumeLab/TissueQC

## Resumen

TissueQC es un modelo de segmentación semántica de imagen diseñado específicamente para el control de calidad en pipelines de patología digital. Desarrollado por el laboratorio JaumeLab, resuelve un problema concreto de las pipelines de whole-slide image (WSI): la necesidad de separar tejido válido de artefactos (pliegues, tinta, desenfoque, burbujas, residuos) antes de aplicar modelos de análisis downstream. La innovación clave es que realiza esta separación en una sola pasada hacia adelante, produciendo una máscara de tejido con artefactos conservados o una máscara de tejido con artefactos eliminados, sin necesidad de ejecutar un segundo modelo especializado.

Arquitectónicamente es una U-Net con encoder EfficientNet-B0, con 4.509.647 parámetros totales. El encoder se inicializó a partir de los pesos ImageNet `timm/efficientnet_b0.ra_in1k` (Apache-2.0), y el modelo opera sobre teselas de 512x512 píxeles leídas a 2 µm/px (5x de aumento). La red es totalmente convolucional, por lo que admite teselas de dimensiones arbitrarias siempre que sean múltiplos de 32.

Su relevancia actual radica en que integra detección de artefactos y segmentación de tejido en un único modelo ligero (4,5 M de parámetros), lo que reduce el coste computacional de las pipelines de patología digital. En pruebas sobre 16 diapositivas TCGA, completó el procesado en 52 s frente a los 190 s del segmentador de tejido HEST, incluyendo la eliminación de artefactos sin coste adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder EfficientNet-B0 |
| Parametros totales | 4.509.647 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; teselas de 512x512 píxeles recomendadas, múltiplos de 32) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TissueQC es una U-Net con encoder EfficientNet-B0 preentrenado en ImageNet (`timm/efficientnet_b0.ra_in1k`, Apache-2.0). El decoder emplea canales configurables (`decoder_channels` en `config.json`) y produce tres clases: background (índice 0), tissue (índice 1) y artifact (índice 2). La red es totalmente convolucional, lo que permite inferencia sobre teselas de tamaño variable; el autor recomienda 512x512 píxeles leídos a 2 µm/px (aproximadamente 5x de aumento).

El entrenamiento se realizó sobre whole-slide images que incluyen muestras de TCGA y GTEx, con tinciones H&E e inmunohistoquímica. La información disponible no detalla el número de tokens ni la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicable en un modelo de segmentación). La innovación técnica destacable es la fusión de segmentación de tejido y detección de artefactos en una sola salida de tres clases, con lógica post-proceso para generar dos tipos de máscara (con o sin artefactos) a partir del mapa de clases cosido de la diapositiva completa.

## Capacidades

- Segmentación semántica de teselas histológicas en tres clases: background, tissue y artifact.
- Detección de artefactos sobre tejido: pliegues, tinta, zonas desenfocadas, líneas de cuchilla, burbujas de aire y residuos.
- Generación de máscara de tejido por defecto (tejido más artefactos con al menos el 25 % de su borde sobre tejido, con huecos encerrados rellenados).
- Generación de máscara de tejido con artefactos eliminados, conservando regiones estrechas (<24 µm) o pequeñas (<0,005 mm²) como tejido para evitar fragmentación.
- Umbral configurable sobre la probabilidad de artefacto para ajustar sensibilidad y falsos positivos.
- Procesado de diapositivas completas mediante cosido del mapa de clases por teselas.
- Inferencia totalmente convolucional sobre teselas de tamaño arbitrario (múltiplos de 32).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo de visión especializado).

## Casos de uso

- Control de calidad previo a análisis downstream: el modelo filtra teselas con pliegues, tinta o desenfoque antes de pasarlas a modelos de clasificación o detección de cáncer, evitando predicciones espurias sobre regiones no representativas del tejido.
- Segmentación de tejido en pipelines de WSI: genera la máscara de tejido necesaria para recortar regiones de interés y descartar fondo de cristal, reduciendo el volumen de datos a procesar en etapas posteriores.
- Eliminación de artefactos sin coste adicional: al integrar la detección de artefactos en la misma pasada que la segmentación de tejido, sustituye a un segundo modelo especializado y reduce el tiempo total de la pipeline (52 s frente a 190 s en la comparativa publicada sobre 16 diapositivas TCGA).
- Preprocesado para modelos de patología computacional: proporciona máscaras limpias de tejido a modelos de clasificación de subtipos tumorales, predicción de biomarcadores o segmentación nuclear, que asumen entradas libres de artefactos.
- Auditoría de calidad de datasets histopatológicos: permite cuantificar la proporción de tejido frente a artefactos en colecciones de WSI (por ejemplo, TCGA o GTEx) para seleccionar subconjuntos de entrenamiento o validación.
- Procesado a escala en infraestructura modesta: con 4,5 M de parámetros y formato safetensors, el modelo cabe en GPU de consumo y permite procesar lotes grandes de diapositivas en hardware asequible.
- Integración en visores o herramientas de anotación: la máscara de tejido con artefactos eliminados puede usarse para resaltar regiones problemáticas y guiar la revisión manual por parte de patólogos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Dice de tejido (teselas de test held-out) | 0,98 |
| Dice de artefacto sobre tejido (teselas de test held-out) | 0,95 |
| Tiempo en pipeline WSI (16 diapositivas TCGA, 1 GPU) | 52 s (TissueQC) frente a 190 s (segmentador de tejido HEST), con eliminación de artefactos incluida sin coste extra |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, al tratarse de un modelo de segmentación de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,5 M de parámetros en fp32 los pesos ocupan aproximadamente 18 MB, y las activaciones para teselas de 512x512 son modestas (del orden de cientos de MB según el tamaño de lote).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; el modelo está pensado para ejecutarse en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) para procesado a gran escala.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas, e incluso en CPU para lotes pequeños (aunque con mayor latencia).
- Opciones de despliegue: PyTorch nativo con `segmentation_models_pytorch` y `safetensors` (flujo documentado por el autor); exportación a TorchScript u ONNX no documentada en la información disponible; no se publican variantes GGUF ni soporte directo en vLLM/TGI (no aplicable a este tipo de modelo).
- Latencia y throughput: el autor reporta 52 s para 16 diapositivas TCGA completas en una GPU, incluyendo eliminación de artefactos; no se detalla el modelo de GPU empleado ni el throughput por tesela.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TissueQC | 4,5 M | Teselas 512x512 a 2 µm/px | Dice tejido 0,98; Dice artefacto 0,95; 52 s en 16 WSI TCGA | Apache-2.0 | Hugging Face (JaumeLab/TissueQC) |
| HEST tissue segmenter | no disponible | no disponible | 190 s en 16 WSI TCGA (referencia del autor) | no disponible | no disponible |
| Otros segmentadores de tejido genéricos | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar con el segmentador de tejido HEST citado por el autor; no se dispone de datos de parámetros, contexto ni licencia de dicho modelo, ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Tejido denso y oscuro (tumor celular, haces de músculo liso, septos gruesos de grasa) se predice en ocasiones como artefacto, lo que puede eliminar tejido válido de la máscara.
- En tiroides, los bordes oscuros y plegados del coloide se predicen con frecuencia como artefacto.
- Los límites de los artefactos tienden a dibujarse más anchos que el artefacto visible, lo que puede recortar tejido adyacente en la máscara con artefactos eliminados.
- El modelo no ha sido validado para uso diagnóstico; no debe emplearse como sustituto del criterio de un patólogo.
- No se documentan sesgos demográficos ni de origen de las muestras; el entrenamiento con TCGA y GTEx puede no representar la distribución de otras cohortes o tinciones.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de validación clínica implica que cualquier uso en producción sanitaria requiere validación adicional y supervisión humana.
- No se publican variantes cuantizadas ni exportaciones a ONNX/TorchScript, lo que limita el despliegue en entornos sin PyTorch.
- El umbral de probabilidad de artefacto es configurable, pero un umbral más bajo aumenta los falsos positivos; no se documenta una calibración por defecto distinta del argmax.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaumeLab/TissueQC
- Pesos ImageNet del encoder: `timm/efficientnet_b0.ra_in1k` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Repositorio de `segmentation_models_pytorch`: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada

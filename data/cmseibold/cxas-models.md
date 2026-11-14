# cmseibold/cxas-models

## Resumen

CXAS (Chest X-Ray Anatomy Segmentation) es una familia de modelos de segmentación de instancias diseñada para delimitar estructuras anatómicas en radiografías de tórax frontales y laterales. Lo desarrolla Constantin Seibold y colaboradores, y se distribuye como pesos asociados al paquete Python `cxas` (instalable con `pip install cxas`), que además genera objetos DICOM SEG y SR a partir de las predicciones. El repositorio aloja tres artefactos: dos variantes Mask2Former (frontal con 187 clases y lateral con 177 clases) y una UNet ResNet-50 heredada de versiones antiguas de CXAS con 159 clases.

El modelo resuelve un problema concreto en imagen médica: la anotación fina y multiestructura de radiografías de tórax, una tarea tradicionalmente costosa en tiempo de radiólogo. Frente a aproximaciones de segmentación semántica de pocas clases (pulmón, corazón, clavículas), CXAS cubre un espacio de etiquetas muy granular derivado de proyecciones de TC (PAXRay++), incluyendo subdivisiones pulmonares, costillas por nivel, regiones subdiafragmáticas y cuadrantes de imagen.

La relevancia actual radica en su enfoque híbrido: combina un backbone congelado de alta calidad (DINOv3 ViT-S/16 en frontal, RAD-DINO ViT-B/14 en lateral) con un decoder Mask2Former y una pirámide ViT-CoMer, y añade una capa de adaptación de etiquetas (`adapter.json`) que corrige errores sistemáticos del etiquetado de origen. Es material de investigación, no un dispositivo médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mask2Former con piramide ViT-CoMer, 200 queries (variantes M2F); UNet con ResNet-50 (variante heredada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen; borde corto de 512 px en despliegue) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (decoder), backbone en formato Hugging Face, `UNet_ResNet50_default.pth` (heredado) |

## Arquitectura y entrenamiento

Las variantes `M2F_anatomy_v2` emplean un decoder Mask2Former con 200 queries sobre una pirámide de características ViT-CoMer. El encoder está congelado durante el entrenamiento: DINOv3 ViT-S/16 para la vista frontal y RAD-DINO ViT-B/14 para la lateral. Cada bundle incluye `config.yaml` con la configuración de entrenamiento, `categories.json` con el espacio de etiquetas, `adapter.json` con correcciones post-inferencia y `meta.json` con el run de origen y el hash del checkpoint; `SHA256SUMS` permite verificar la integridad tras la descarga.

El entrenamiento parte de modelos entrenados en PAXRay++ (máscaras de 177 estructuras proyectadas desde TC). La variante frontal se extiende de forma incremental en clases sobre imágenes frontales de MIMIC-CXR hasta 187 clases (cabeza, húmeros, regiones bajo los hemidiafragmas y cuatro cuadrantes de imagen). Es crucial señalar que las etiquetas de MIMIC-CXR son **pseudo-etiquetas generadas por modelo**, no anotaciones manuales. La variante lateral se entrena solo con PAXRay++, incluidas sus proyecciones laterales. El adaptador de etiquetas corrige nombres de lado intercambiados en los datos de entrenamiento y, en lateral, intercambia las clases "upper zone lung" y "lung base" y deriva el pulmón completo y los lóbulos a partir de las zonas.

## Capacidades

- Segmentación de instancias multi-clase en radiografías de tórax frontales (187 clases) y laterales (177 clases).
- Detección automática de la vista a partir del atributo DICOM `ViewPosition`, con fallback a detección si no está presente.
- Generación de objetos DICOM SEG y SR (landmarks) por radiografía, más un `result.json` con los resultados.
- Salida en dos espacios: las 159 clases del espacio original en `segmentation_preds` y las clases adicionales del modelo frontal (regiones subdiafragmáticas, cuadrantes de imagen, húmeros, cabeza, subdivisiones pulmonares) en `extra_segmentation`.
- Manejo de clases anidadas (por ejemplo, `lung` contiene `left lung`, que contiene `left lung base`), con solapamiento de máscaras por diseño.
- Robustez a orientación: según la model card, el modelo frontal es el único de los candidatos comparados que segmenta una radiografía almacenada rotada 90 grados.
- Ejecución en CPU o GPU (`gpus="cpu"` o `gpus="0"`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión.

## Casos de uso

- Anotación asistida de datasets de radiografía de tórax: el modelo genera máscaras multiestructura sobre lotes DICOM mediante `cxas_idc -i /data/dicom -o /data/out`, reduciendo el trabajo manual previo a revisión por especialistas en la construcción de corpus de investigación.
- Investigación en imagen médica cuantitativa: la segmentación por niveles costales, subdivisiones pulmonares y regiones subdiafragmáticas permite calcular métricas anatómicas (áreas, volúmenes proyectados, índices de consolidación) de forma reproducible sobre cohortes grandes.
- Preprocesado para pipelines de visión-radiología: las máscaras anatómicas sirven como entrada estructurada a modelos posteriores de clasificación o generación de informes, que se benefician de regiones de interés delimitadas en lugar de la imagen completa.
- Control de calidad de adquisición: la detección de vista y la segmentación de cuadrantes y hemidiafragmas permiten verificar el encuadre y la orientación de la radiografía (incluida la rotación de 90 grados) antes de archivarla en un PACS.
- Docencia y formación radiológica: la superposición de 187 estructuras etiquetadas sobre una radiografía frontal facilita material didáctico interactivo sobre anatomía torácica proyectada.
- Generación de objetos DICOM SEG/SR para integración en visores: el paquete exporta directamente SEG y SR, de modo que las segmentaciones pueden visualizarse en herramientas compatibles sin post-procesado propio.
- Comparación de cohortes en estudios longitudinales: la salida determinista por imagen y la verificación por checksum permiten reproducir segmentaciones idénticas entre ejecuciones, requisito habitual en estudios multicéntricos.

## Benchmarks y rendimiento

Evaluación sobre el split de test de PAXRay++ (sintético y en dominio para los modelos entrenados con PAXRay++). Configuración de despliegue: borde corto de 512 px, mejor instancia por clase con puntuación superior a 0,05. Estimaciones puntuales.

| Vista | Imagenes | Modelo | Mask AP | Dice de la mascara de salida |
|---|---|---|---|---|
| Frontal | 735 | frontal (187 clases) | 42,4 | 0,719 |
| Lateral | 740 | lateral (177 clases) | 45,0 | 0,746 |

La model card advierte que PAXRay++ es sintético y en dominio para los modelos entrenados con PAXRay++, por lo que infravalora el modelo frontal, adaptado a radiografías reales. Sobre radiografías reales del Imaging Data Commons el modelo frontal es el más robusto de los candidatos comparados, pero no existe ground truth manual en ese conjunto. No se publican resultados de benchmarks adicionales (MMLU, HumanEval u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,5 GB e incluye tres modelos, por lo que la huella en memoria de una sola variante es sustancialmente menor.
- GPU recomendadas: no se especifican modelos concretos; el paquete acepta selección de GPU (`gpus="0"`) o ejecución en CPU (`gpus="cpu"`).
- Compatibilidad con GPU de consumo: plausible dado el tamaño del repositorio y el encoder ViT-S/16 o ViT-B/14 congelado, pero no confirmada en la documentación.
- Opciones de despliegue: paquete Python `cxas` (`pip install cxas`), CLI `cxas_idc` para procesamiento por lotes de directorios DICOM, e imagen Docker oficial de CXAS que ya incluye los pesos.
- Latencia y throughput: no disponibles.
- Almacenamiento: los pesos se descargan en el primer uso y se cachean en `~/.cxas/weights`, con verificación SHA256.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CXAS M2F frontal (este modelo) | Mask2Former + ViT-CoMer | 187 | imagen, borde corto 512 px | MIT | Hugging Face + pip + Docker |
| CXAS M2F lateral (este modelo) | Mask2Former + ViT-CoMer | 177 | imagen, borde corto 512 px | MIT | Hugging Face + pip + Docker |
| CXAS UNet ResNet-50 (heredado) | UNet | 159 | imagen | MIT | incluido en el repo |
| Alternativas de segmentación torácica de pocas clases | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos de terceros comparables, por lo que la comparativa cuantitativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- **Uso exclusivamente de investigación.** No es un dispositivo médico y no debe emplearse para decisiones clínicas.
- Las etiquetas de MIMIC-CXR usadas para extender la variante frontal son pseudo-etiquetas generadas por modelo, no anotaciones manuales; los errores del etiquetado de origen se corrigen parcialmente mediante `adapter.json`.
- En vistas laterales no existen clases de costillas con lado izquierdo/derecho (PAXRay++ no las tiene en lateral); las costillas anteriores 10-11 son débiles, con Dice aproximado de 0,4.
- Las clases son anidadas por diseño, de modo que las máscaras se solapan; los consumidores deben decidir qué nivel de la jerarquía usar.
- Las máscaras se predicen a stride 4 sobre una entrada de 512 px y se reescalan una sola vez a la resolución nativa, lo que limita el detalle en estructuras pequeñas.
- La evaluación principal es sobre datos sintéticos (PAXRay++); el rendimiento en radiografías reales no puede cuantificarse por ausencia de ground truth manual.
- Riesgo de alucinación entendido como falsos positivos de segmentación: la selección de la mejor instancia por clase por encima de 0,05 puede producir máscaras espurias en imágenes fuera de distribución.
- Licencia MIT, que permite uso comercial del software, pero el aviso de "research use only" y la ausencia de marcado CE o aprobación regulatoria desaconsejan cualquier aplicación clínica.
- El modelo no procesa texto ni mantiene conversaciones; no debe confundirse con un modelo multimodal de lenguaje e imagen.

## Enlaces

- Hugging Face: https://huggingface.co/cmseibold/cxas-models
- Repositorio del proyecto CXAS: https://github.com/ConstantinSeibold/ChestXRayAnatomySegmentation
- Paper BMVC 2022 (PAXRay, anotaciones detalladas vía proyección de TC): https://arxiv.org/abs/2306.03934
- Paper arXiv 2023 (segmentación fina de anatomía en radiografías mediante pseudo-etiquetado volumétrico): https://arxiv.org/abs/2306.03934

# hieuphamha/A-nnU-Net-based-asymmetric-supervision-strategy

## Resumen
El modelo **A-nnU-Net-based-asymmetric-supervision-strategy** es un sistema de segmentación de imágenes de resonancia magnética (RM) de cerebro pediátrico de ultra-bajo campo (ULF), desarrollado para el desafío LISA 2026 Task 2. Se basa en el framework nnU-Net v2 y combina dos ramas de entrenamiento: **OS50** y **AURA**, cuyas predicciones se fusionan con pesos de 0.6 y 0.4 respectivamente. La rama AURA introduce una estrategia de supervisión asimétrica para aprovechar anotaciones parciales en el entrenamiento, un problema frecuente en conjuntos de datos médicos. El repositorio incluye los checkpoints de la rama fold-0 en configuración `3d_fullres`, junto con los metadatos necesarios para la inferencia.

La relevancia de este modelo radica en su enfoque para el aprendizaje con anotaciones incompletas en un dominio desafiante como la RM de bajo campo, que presenta baja relación señal-ruido. El sistema está diseñado para ejecutarse mediante un contenedor Docker con GPU NVIDIA, y la licencia Apache-2.0 permite uso comercial y modificaciones. No se proporcionan detalles sobre el número total de parámetros ni la composición del dataset de entrenamiento en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (U-Net 3D, configurable) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (segmentación de imágenes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (.pth) |

El modelo es un ensamble de dos ramas: `Dataset001_LISA` (trainer `nnUNetTrainerDiceTopK10_OS50_LS005`) y `Dataset002_LISA_VCF` (trainer `nnUNetTrainerAURA_v0`), ambas en configuración `3d_fullres`.

## Arquitectura y entrenamiento
La arquitectura se basa en nnU-Net v2, un framework que configura automáticamente la arquitectura U-Net, el preprocesamiento y las estrategias de entrenamiento según el dataset. Las dos ramas se entrenan por separado y se combinan en la inferencia mediante una media ponderada de las probabilidades (`argmax(0.6 * p_OS50 + 0.4 * p_AURA)`), seguida de un post-procesado que retiene la mayor componente conectada (26-conectividad) para cada etiqueta. El entrenamiento emplea una estrategia de supervisión asimétrica, diseñada para manejar anotaciones parciales en los datos de RM pediátrica de ULF.

El checkpoint de AURA corresponde a la época 458 y alcanzó un DSC de 0.796101 en evaluación cruzada. No se especifica el número de tokens ni la composición exacta del dataset en la información proporcionada. El sistema completo está pensado para ser ejecutado a través del contenedor Docker de la submission, que incluye las extensiones de AURA sobre nnU-Net.

## Capacidades
- Segmentación de volúmenes de RM cerebral pediátrica de ULF en 11 estructuras anatómicas (etiquetas 1-11) más fondo.
- Procesamiento de volúmenes NIfTI con nombres de archivo específicos (`<case>_ciso.nii.gz`, `<case>_0000.nii.gz`, `<case>.nii.gz`) y preservación de la geometría de entrada.
- Inferencia mediante ensamble de dos modelos con pesos configurables (0.6 y 0.4).
- Post-procesado de componentes conectados para eliminar artefactos de segmentación.
- Compatible con el flujo de trabajo de nnU-Net v2, incluyendo la configuración automática de arquitectura y preprocesamiento.
- Diseñado para despliegue en contenedores Docker con GPU NVIDIA, usando el NVIDIA Container Toolkit.

## Casos de uso
- Segmentación cerebral pediátrica en entornos de bajos recursos: el modelo permite identificar estructuras anatómicas en imágenes de RM de ultra-bajo campo, facilitando el diagnóstico en hospitales sin acceso a equipos de alta gama.
- Análisis volumétrico de regiones de interés (ROIs) en estudios de neuroimagen pediátrica: los mapas de segmentación pueden usarse para calcular volúmenes de estructuras cerebrales en investigaciones sobre desarrollo neuronal.
- Evaluación de métodos de supervisión asimétrica: sirve como referencia para investigar técnicas de aprendizaje con anotaciones parciales en segmentación médica, gracias a la rama AURA.
- Integración en pipelines de segmentación con nnU-Net: los checkpoints pueden adaptarse a otros datasets mediante la configuración de nnU-Net, permitiendo transferencia a otros dominios de imagen.
- Investigación en ensamblaje de modelos: el esquema de fusión de dos ramas con pesos distintos puede aplicarse a otros problemas de segmentación donde se disponga de múltiples modelos.
- Validación de sistemas de segmentación en RM de bajo campo para uso clínico: el modelo sirve como punto de partida para evaluar la viabilidad de estas técnicas en entornos de cuidado de la salud con recursos limitados.

## Benchmarks y rendimiento
El único dato de rendimiento disponible es el DSC de 0.796101 para la rama AURA en evaluación cruzada (época 458). No se han publicado resultados comparativos con otros modelos en la información proporcionada.

| Modelo | DSC (evaluación cruzada) |
|---|---|
| AURA (época 458) | 0.796101 |
| OS50 | No disponible |
| Ensemble final | No disponible |

## Requisitos de hardware
- Se requiere un host Linux con GPU NVIDIA y Docker para ejecutar la inferencia mediante el contenedor oficial.
- Es necesario instalar el NVIDIA Container Toolkit para habilitar el acceso a la GPU dentro del contenedor.
- No se especifican requisitos de VRAM en la documentación; como estimación, un modelo nnU-Net 3D con volúmenes de entrada típicos puede consumir entre 8 y 16 GB de VRAM, dependiendo del tamaño de la imagen.
- El despliegue se realiza mediante los scripts `build.sh` y `test.sh` proporcionados en el repositorio, que construyen la imagen Docker y ejecutan la inferencia sobre un directorio de entrada.
- La inferencia se realiza con el modelo completo (dos ramas) en paralelo, lo que puede aumentar el uso de memoria en comparación con un solo modelo.

## Comparativa con modelos similares
No se dispone de información suficiente para realizar una comparativa con otros modelos de segmentación en RM de ULF pediátrica. El modelo es específico para el desafío LISA 2026 Task 2 y no se han publicado comparaciones con alternativas como nnU-Net estándar u otros métodos de segmentación en el repositorio.

## Limitaciones y advertencias
- El modelo está entrenado específicamente para RM pediátrica de ultra-bajo campo; puede no generalizar a otros dominios de imagen o a otras poblaciones.
- Solo se han liberado los checkpoints de la rama fold-0; el ensamblaje completo del sistema de la submission puede requerir más ramas o configuraciones adicionales no incluidas.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento pueden tener restricciones de uso no especificadas en el repositorio.
- El despliegue requiere un entorno Docker con GPU y la instalación de extensiones de AURA sobre nnU-Net, lo que añade complejidad técnica.
- No se ha informado sobre sesgos de adquisición de imágenes o demográficos en el conjunto de datos de entrenamiento.
- El post-procesado de componentes conectados puede eliminar estructuras pequeñas si la configuración de conectividad no es adecuada para el dominio de aplicación.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/hieuphamha/A-nnU-Net-based-asymmetric-supervision-strategy
- Repositorio GitHub del proyecto: https://github.com/minhdang150806/A-nnU-Net-based-asymmetric-supervision-strategy
- nnU-Net (GitHub): https://github.com/MIC-DKFZ/nnUNet
- Paper de nnU-Net (Nature Methods): https://www.nature.com/articles/s41592-020-01008-z
- Paper de nnU-Net (arXiv): https://arxiv.org/abs/1809.10486

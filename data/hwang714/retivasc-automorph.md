# hwang714/retivasc-automorph

## Resumen

RetiVASC · AutoMorph web models (ONNX) es un paquete de pesos exportados a ONNX de la pipeline AutoMorph, un sistema de cuantificación automática de morfología vascular retiniana publicado por Zhou et al. en 2022. No se trata de un modelo nuevo ni reentrenado: el autor del repositorio (hwang714) redistribuye los checkpoints originales de AutoMorph v2 convertidos a formato ONNX para poder ejecutarlos en el navegador mediante WebGPU o WebAssembly. El objetivo es permitir que la herramienta RetiVASC realice análisis de fondo de ojo directamente en el cliente, sin backend ni envío de imágenes médicas a servidores externos.

El paquete agrupa cuatro conjuntos de modelos que cubren las etapas principales de AutoMorph: control de calidad de imagen (M1, EfficientNet-B4 con 8 miembros de ensemble), segmentación binaria de vasos (M2, U-Net con 10 miembros), segmentación arteria/vena (M2, BF-Net con 8 miembros) y segmentación de disco y copa ópticos (M2, W-Net con 8 miembros fusionados en un único grafo). Cada ensemble se promedia en el orden definido por AutoMorph v2, de modo que los resultados reproducen la pipeline Python original.

La relevancia actual del repositorio es fundamentalmente de despliegue: demuestra que una pipeline de segmentación retiniana con ensembles múltiples puede ejecutarse íntegramente en el navegador con una precisión que el autor cifra en una desviación máxima del 0,4 % respecto a la implementación Python en las 72 características vasculares calculadas. Está pensado para investigación, no para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensembles de CNN: EfficientNet-B4 (calidad), U-Net (vasos), BF-Net (arteria/vena), W-Net (disco/copa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión, entrada de imagen) |
| Tipos de cuantizacion | Pesos en float16, aritmética en float32; disco/copa en float32 completo |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repo | 0,9 GB |
| Pipeline | image-segmentation |
| Versionado | Etiqueta `v0.1.0` (RetiVASC carga por tag, nunca `main`) |
| Integridad | `manifest.json` con tamano y SHA-256 de cada fichero |

## Arquitectura y entrenamiento

El paquete no introduce entrenamiento nuevo: son los checkpoints de AutoMorph v2 exportados a ONNX. La pipeline original combina varias redes convolucionales especializadas. El módulo de calidad (M1) usa un ensemble de 8 EfficientNet-B4 para descartar imágenes de fondo de ojo no aptas. La segmentación vascular (M2) emplea un ensemble de 10 U-Net para la máscara binaria de vasos y un ensemble de 8 BF-Net para la separación arteria/vena. La segmentación de disco y copa ópticos utiliza una W-Net cuyos 8 miembros se han fusionado en un único grafo ONNX.

La innovación técnica del repositorio es el empaquetado para inferencia en navegador: exportación a ONNX, ejecución vía WebGPU con caída a WebAssembly cuando no hay aceleración gráfica, verificación criptográfica de cada peso contra el manifiesto SHA-256 y caché en el navegador tras la primera descarga. Los pesos se almacenan en float16 pero la aritmética se ejecuta en float32; el modelo de disco/copa se mantiene íntegramente en float32 porque define las zonas de medición del módulo M3. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, número de tokens ni técnicas de alineación, que corresponden a la publicación de AutoMorph y no a este repositorio.

## Capacidades

- Segmentación binaria de vasos retinianos a partir de imágenes de fondo de ojo.
- Segmentación y clasificación arteria/vena sobre la máscara vascular.
- Segmentación de disco óptico y copa óptica.
- Evaluación de calidad de imagen retiniana para filtrar entradas no aptas.
- Cálculo de 72 características de morfología vascular (a través de la pipeline RetiVASC que consume estos modelos).
- Inferencia en navegador con WebGPU o WebAssembly, sin backend.
- Verificación de integridad de pesos mediante SHA-256 y versionado por etiqueta.
- No soporta tool calling, agentes, texto ni capacidades multilingües: es un conjunto de modelos de visión puro.

## Casos de uso

- Investigación en oftalmología con despliegue en cliente: un grupo de investigación puede integrar RetiVASC en una web y procesar imágenes de fondo de ojo localmente, evitando transferir datos de pacientes a servidores externos.
- Docencia y formación: demostraciones interactivas de segmentación vascular y cálculo de métricas de tortuosidad o calibre en el navegador, sin instalación de Python ni GPU local.
- Reproducibilidad de estudios: al fijar la etiqueta `v0.1.0` y verificar SHA-256, se garantiza que un análisis publicado use exactamente los mismos pesos, algo relevante para replicar resultados.
- Prototipado rápido de pipelines de imagen médica: usar los modelos ONNX como base para validar una idea de análisis retiniano antes de invertir en infraestructura de servidor.
- Comparación de implementaciones: contrastar las 72 características calculadas en navegador con la pipeline Python AutoMorph (desviación declarada inferior al 0,4 %) para auditar portes o reimplementaciones.
- Distribución de herramientas de análisis de retina en entornos con conectividad limitada: tras la primera descarga, los modelos quedan en caché del navegador y el análisis puede repetirse sin red.
- Integración en visores o plataformas web de imagen médica que necesiten superponer máscaras de vasos, arterias/venas y disco/copa sobre la imagen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es que las 72 características vasculares calculadas en el navegador coinciden con la implementación Python de AutoMorph con una desviación de hasta el 0,4 %. No se proporcionan métricas de Dice, IoU, sensibilidad ni especificidad para los módulos de segmentación en este repositorio.

## Requisitos de hardware

- Inferencia en navegador: requiere un navegador con soporte de WebGPU para aceleración; en su defecto, funciona con WebAssembly (más lento).
- VRAM: no disponible de forma explícita; el repo ocupa 0,9 GB y los pesos se cargan en memoria del navegador, por lo que se recomienda al menos 2 GB de memoria gráfica disponible en el dispositivo.
- GPU de escritorio: cualquier GPU moderna con WebGPU habilitado (por ejemplo, series RTX 30/40, AMD RDNA2+ o Apple Silicon) puede ejecutar los ensembles.
- GPU de servidor: no aplica al diseño principal, aunque los ONNX pueden ejecutarse con ONNX Runtime en CPU o GPU si se prefiere un backend.
- Cabe en GPU de consumo: sí, al estar diseñado para navegador; el cuello de botella es la memoria del dispositivo, no el modelo individual.
- Opciones de despliegue: RetiVASC (build propio con `VITE_MODELS_URL` apuntando a la etiqueta `v0.1.0`), ONNX Runtime (Web, CPU o GPU).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Arquitectura | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| RetiVASC · AutoMorph (este repo) | Ensemble de segmentación retiniana | EfficientNet-B4, U-Net, BF-Net, W-Net | ONNX | Apache 2.0 | Navegador (WebGPU/WASM) u ONNX Runtime |
| AutoMorph (original) | Ensemble de segmentación retiniana | Mismas redes | PyTorch | Apache 2.0 | Python, GPU/CPU |
| Otros modelos de segmentación de vasos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con la implementación Python original de AutoMorph, de la que este repositorio es una exportación. La diferencia práctica es el entorno de ejecución (navegador frente a Python) y la precisión declarada (desviación inferior al 0,4 % en las 72 características). No se dispone de información sobre alternativas comparables en la búsqueda realizada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor indica explícitamente que es para uso en investigación y que no debe emplearse para diagnóstico.
- No son modelos nuevos ni reentrenados: cualquier limitación de AutoMorph original se hereda íntegramente.
- Dependencia del soporte WebGPU del navegador: sin WebGPU, la ejecución en WebAssembly puede ser considerablemente más lenta.
- Primera carga de 0,9 GB: requiere descarga completa y caché en el navegador; en conexiones lentas la experiencia inicial puede ser deficiente.
- Precisión limitada por el ensemble original: no se documentan métricas de segmentación en este repositorio, por lo que no es posible evaluar el rendimiento clínico a partir de esta ficha.
- Sin capacidades de texto, agentes ni tool calling: no debe confundirse con un modelo de lenguaje.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de segmentaciones erróneas en imágenes de baja calidad o fuera de distribución; el módulo M1 de calidad mitiga parcialmente este punto.
- Licencia Apache 2.0 permite uso comercial, pero la advertencia de uso exclusivamente investigador del autor prevalece como recomendación ética y regulatoria.
- Idiomas no disponibles: al ser un modelo de imagen, no hay soporte lingüístico que evaluar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hwang714/retivasc-automorph
- Repositorio RetiVASC: https://github.com/Retinal-Research/RetiVASC
- Repositorio AutoMorph: https://github.com/rmaphoh/AutoMorph
- Publicación AutoMorph: Zhou Y, Wagner SK, Chia MA, et al. AutoMorph: Automated Retinal Vascular Morphology Quantification Via a Deep Learning Pipeline. Translational Vision Science & Technology 11(7):12, 2022. https://doi.org/10.1167/tvst.11.7.12

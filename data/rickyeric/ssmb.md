# rickyeric/SSMB

## Resumen

SSMB es un detector de puntos de interés (keypoints) locales, entrenado de forma auto-supervisada para ser robusto al desenfoque por movimiento. Ha sido desarrollado por Zhenjun Zhao y colaboradores, y se presenta en un artículo enviado a IEEE Transactions on Image Processing (en revisión). El modelo aborda un problema clásico en visión por computador: la detección de características geométricas fiables en imágenes degradadas por motion blur, una situación habitual en fotografía de acción, vídeo en movimiento o robótica móvil.

La arquitectura se basa en un codificador tipo MLP adaptado del modelo MAXIM, al que se le inserta un módulo de mejora de discriminabilidad local (LDE) en cada bloque. Un cabezal detector predice un mapa de probabilidad de keypoints y compensaciones de posición subpíxel. El entrenamiento se realiza en dos etapas auto-supervisadas: una primera de preentrenamiento geométrico con formas sintéticas y una segunda con pares de imágenes nítidas y borrosas del dataset GoPro. El modelo se distribuye bajo licencia MIT, con el codificador original bajo Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador MLP (adaptado de MAXIM) con módulos LDE y detector de keypoints con mapa de probabilidad y offsets subpíxel |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, procesa imágenes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | MIT (el codificador MAXIM es Apache 2.0) |
| Formato de pesos | checkpoint PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo SSMB se compone de un codificador basado en MLP, adaptado de la arquitectura MAXIM, al que se le incorpora un módulo de mejora de discriminabilidad local (LDE) en cada bloque. Este módulo refuerza la capacidad del codificador para extraer características distintivas en regiones locales, crucial para la detección de keypoints robustos. Tras el codificador, un detector de cabeza predice un mapa de probabilidad de keypoints y compensaciones de posición subpíxel, lo que permite una localización precisa incluso con desenfoque.

El entrenamiento se realiza en dos fases auto-supervisadas:

1. **Preentrenamiento geométrico**: se generan formas geométricas sintéticas sobre la marcha, con etiquetas de esquinas renderizadas, para que el modelo aprenda a detectar puntos espacialmente discriminativos.
2. **Entrenamiento consciente del desenfoque**: se utilizan 2 912 pares de imágenes nítidas y borrosas del dataset GoPro (Nah et al., CVPR 2017), con una función de pérdida multi-componente que incluye adaptación homográfica, consistencia de desenfoque, consistencia de posición y pérdida de diversidad espacial.

No se ha publicado información sobre el número total de parámetros ni sobre el tamaño de la ventana de entrada específica. El archivo de pesos se llama `extraction.pth` y es el checkpoint final tras la segunda etapa.

## Capacidades

- Detección de keypoints robusta frente a desenfoque de movimiento en imágenes.
- Localización subpíxel de los puntos de interés mediante offsets aprendidos.
- Auto-supervisado: no requiere anotaciones humanas para el entrenamiento.
- Adaptado a imágenes de alta resolución (aunque no se especifica el tamaño de entrada).
- Capacidad de producir mapas de probabilidad de keypoints para análisis posterior.
- No se especifican otras capacidades como matching de descriptores o estimación de pose; el modelo se centra en la detección.

## Casos de uso

- **Sistema de localización visual en robótica móvil**: el modelo puede detectar keypoints estables en imágenes con desenfoque provocado por el movimiento del robot, mejorando la robustez de los algoritmos de SLAM visual.
- **Reconstrucción de estructura a partir de movimiento (SfM)**: al proporcionar keypoints precisos en secuencias de vídeo con desenfoque, se facilita el matching entre fotogramas y la reconstrucción 3D.
- **Matching de imágenes para panografía**: permite alinear imágenes borrosas de escenas con movimiento, útil en aplicaciones de fotografía panorámica móvil.
- **Seguimiento de objetos en vídeo**: al detectar puntos de interés en cada frame, se puede mantener el seguimiento de características en secuencias con movimiento rápido de la cámara.
- **Realidad aumentada**: detección de puntos de referencia en imágenes capturadas con dispositivos móviles donde el desenfoque es común, mejorando la estabilidad del sistema de tracking.
- **Análisis de vídeo forense**: extracción de características clave en imágenes borrosas para comparación con bases de datos de escenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados cuantitativos completos (repeatability de detección de keypoints, matching de imágenes, estimación de pose relativa, localización visual) se presentan en el artículo y su material complementario, pero no se proporcionan cifras concretas en el repositorio de Hugging Face.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo es un codificador MLP de tamaño no especificado; no se puede estimar sin conocer el número de parámetros. Como referencia, el codificador MAXIM original tiene alrededor de 64 millones de parámetros, pero esta adaptación podría ser menor.
- **GPU recomendadas**: no especificado. Se puede suponer que una GPU con al menos 8 GB de VRAM (como una RTX 2070 o superior) podría ejecutar la inferencia, pero no hay confirmación.
- **Capacidad en GPU de consumo**: no confirmado.
- **Opciones de despliegue**: se proporciona un ejemplo de uso con PyTorch, por lo que se puede cargar el checkpoint directamente en un entorno con torch. No se mencionan herramientas como ONNX, TensorRT o vLLM.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos en la información proporcionada. Existen otros detectores de keypoints auto-supervisados como **SuperPoint** (DeTone et al., 2018) o **DISK** (Tyszkiewicz et al., 2020), que también ofrecen detección de puntos locales. Sin embargo, SSMB se centra específicamente en robustez frente a motion blur, una característica que no es el foco principal de esos modelos. No se dispone de métricas comparativas en el material consultado.

## Limitaciones y advertencias

- **Enfoque específico**: el modelo está entrenado para imágenes con desenfoque de movimiento, por lo que su rendimiento en imágenes nítidas podría ser inferior al de detectores dedicados a condiciones normales.
- **Alcance de datos**: el entrenamiento se basa en el dataset GoPro, que contiene escenas de conducción y acción; puede no generalizar a otros dominios (por ejemplo, imágenes médicas o satelitales).
- **Sin información de parámetros**: no se conoce el tamaño del modelo ni sus requisitos de memoria, lo que dificulta la planificación de despliegue.
- **Licencia**: aunque el modelo es MIT, el codificador adaptado de MAXIM está bajo Apache 2.0, lo que puede implicar obligaciones de atribución en productos derivados.
- **Estado del artículo**: el artículo está en revisión, por lo que los resultados pueden no ser aún revisados por pares.
- **Código no disponible**: el enlace al repositorio de código no está completo en la model card (aparece como `<your-username>`), por lo que no es posible acceder a las instrucciones de entrenamiento o evaluación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rickyeric/SSMB)
- [Perfil de GitHub del autor](https://github.com/Rickyeric)
- [Repositorio de MAXIM (arquitectura base)](https://github.com/google-research/maxim)
- [Artículo del modelo (no disponible públicamente, en revisión)](no disponible)

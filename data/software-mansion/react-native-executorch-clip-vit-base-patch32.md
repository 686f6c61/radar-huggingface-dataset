# software-mansion/react-native-executorch-clip-vit-base-patch32

## Resumen

Este repositorio aloja el codificador de imagen del modelo CLIP ViT-Base-Patch32 de OpenAI, exportado al formato `.pte` de ExecuTorch para su uso en aplicaciones React Native mediante la librería `react-native-executorch`. El modelo original es un componente del sistema CLIP (Contrastive Language-Image Pre-training) que aprende representaciones conjuntas de imagen y texto, aunque este repositorio solo incluye la parte de visión. El objetivo es permitir la ejecución de inferencia de visión por computador directamente en el dispositivo móvil, sin conexión a servidores, aprovechando el backend XNNPACK de ExecuTorch para CPUs de dispositivos móviles.

El desarrollo corre a cargo de Software Mansion, empresa conocida por su trabajo en herramientas para React Native. La relevancia actual radica en la creciente demanda de aplicaciones móviles con IA en el dispositivo (on-device AI), que ofrecen ventajas de privacidad, latencia y funcionamiento offline. El modelo está exportado con ExecuTorch versión 1.1.0, lo que garantiza compatibilidad con la librería React Native ExecuTorch, pero no con versiones futuras del runtime. El tamaño del repositorio es de 2.6 GB, aunque el archivo `.pte` específico para el codificador de imagen tiene un tamaño menor (no especificado en la información disponible).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ViT-Base-Patch32) para codificación de imagen, parte del modelo CLIP |
| Parametros totales | Aproximadamente 86 millones (para el codificador de imagen del modelo original; no se especifica para la exportación) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; el CLIP original usa 77 tokens de contexto para texto, pero aquí solo se incluye el encoder de imagen) |
| Tipos de cuantizacion | Exportado para backend XNNPACK (cuantización dinámica o estática no especificada; probablemente 8-bit, pero no confirmado) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | `.pte` (formato de ExecuTorch) |

## Arquitectura y entrenamiento

El modelo subyacente es el codificador de imagen de CLIP ViT-Base-Patch32, desarrollado por OpenAI. Se trata de un Vision Transformer (ViT) con 12 capas, 12 cabezas de atención, dimensión de embedding de 512 y parches de 32x32 píxeles. El modelo original fue entrenado con un objetivo contrastivo sobre pares imagen-texto a gran escala (unos 400 millones de pares), aprendiendo a alinear representaciones visuales y textuales en un espacio común. En este repositorio solo se incluye la parte de visión, sin el codificador de texto.

La exportación a ExecuTorch se realizó con la versión 1.1.0 del framework, utilizando el backend XNNPACK, optimizado para CPUs de dispositivos móviles y embebidos. No se proporcionan detalles sobre el proceso de entrenamiento adicional, cuantización específica aplicada ni datos de calibración. El archivo `.pte` está listo para ser cargado por la librería `react-native-executorch` en aplicaciones React Native.

## Capacidades

- Extracción de características visuales: genera embeddings de imagen de 512 dimensiones que representan el contenido semántico de una imagen.
- Clasificación de imágenes: mediante comparación con embeddings de texto (si se dispone del codificador de texto CLIP por separado) o mediante una cabeza de clasificación lineal.
- Búsqueda de imágenes por similitud: los embeddings pueden indexarse para recuperación de imágenes similares.
- Detección de objetos y segmentación (con adaptaciones): aunque el modelo base no está entrenado para estas tareas directamente, puede usarse como extractor de características en pipelines de visión.
- Funcionamiento offline: al ejecutarse en el dispositivo, no requiere conexión a internet.
- Integración con React Native: permite usar el modelo en aplicaciones móviles multiplataforma (iOS y Android) mediante la API declarativa de `react-native-executorch`.

## Casos de uso

- Clasificación de imágenes en una app de fotos: el modelo puede etiquetar automáticamente las fotos del usuario (por ejemplo, "playa", "mascota", "coche") ejecutando la inferencia localmente, sin enviar imágenes a servidores externos.
- Búsqueda visual en galerías: los embeddings generados se indexan localmente y permiten buscar imágenes por concepto ("atardecer", "familia") sin depender de servicios en la nube.
- Moderación de contenido en aplicaciones de mensajería: detección de imágenes inapropiadas o no deseadas en tiempo real, con privacidad garantizada al procesarse en el dispositivo.
- Asistente de accesibilidad para personas con discapacidad visual: descripción de imágenes capturadas por la cámara del móvil, combinando el encoder con un modelo de lenguaje que genere texto a partir del embedding.
- Aplicación de etiquetado automático para gestión de inventario: clasificar productos a partir de fotografías tomadas con el móvil, útil para pequeñas empresas sin infraestructura en la nube.
- Sistema de recomendación de moda: analizar prendas fotografiadas y sugerir combinaciones o productos similares, todo localmente en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original CLIP ViT-Base-Patch32 tiene métricas conocidas en tareas de clasificación zero-shot (por ejemplo, alrededor del 63% en ImageNet), pero no se dispone de datos específicos para esta exportación a ExecuTorch ni de comparaciones con otras implementaciones móviles.

## Requisitos de hardware

- VRAM estimada: no disponible (se ejecuta en CPU móvil mediante XNNPACK; no requiere VRAM dedicada).
- GPU recomendadas: no aplica, el backend XNNPACK está diseñado para CPU.
- Compatibilidad con dispositivos móviles: el modelo está pensado para ejecutarse en smartphones y tablets con iOS o Android, aunque no se especifican requisitos mínimos de memoria o CPU.
- Opciones de despliegue: mediante la librería `react-native-executorch` (npm), que integra el runtime de ExecuTorch en la aplicación. También puede usarse fuera de React Native con el runtime de ExecuTorch, siguiendo la documentación oficial de PyTorch ExecuTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dependerán del dispositivo concreto y de la cuantización aplicada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otras implementaciones de CLIP para móviles. Como referencia general, el modelo original CLIP ViT-Base-Patch32 tiene 86 millones de parámetros y un embedding de 512 dimensiones. Alternativas como MobileCLIP (modelo de Apple, basado en MobileNet) ofrecen un tamaño menor y mayor eficiencia para dispositivos móviles, pero no existe una comparación directa publicada para esta exportación específica. Se recomienda consultar benchmarks propios en el hardware objetivo antes de elegir entre opciones.

## Limitaciones y advertencias

- Solo incluye el codificador de imagen: no se proporciona el codificador de texto de CLIP, por lo que las capacidades de clasificación zero-shot requieren integrar un modelo de texto adicional por separado.
- Compatibilidad limitada: la exportación se realizó con ExecuTorch 1.1.0 y no se garantiza compatibilidad hacia adelante. Si se actualiza el runtime de ExecuTorch, los archivos `.pte` pueden dejar de funcionar.
- Sin especificación de cuantización: no se indica si los pesos están cuantizados a 8 bits o a menor precisión, lo que afecta al rendimiento y al tamaño final del modelo.
- Sesgos del modelo original: CLIP puede presentar sesgos de género, raza o cultura aprendidos de los datos de entrenamiento, que se propagan a los embeddings generados.
- Riesgo de alucinación: al ser un modelo de visión, no genera texto, pero los embeddings pueden producir resultados erróneos en tareas de clasificación si las categorías no están bien representadas en el entrenamiento.
- Limitaciones de contexto visual: el modelo trabaja con parches de 32x32 píxeles y una resolución de entrada típica de 224x224, por lo que puede perder detalles finos en imágenes pequeñas o muy densas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo original de OpenAI (CLIP) tiene su propia licencia MIT, por lo que no hay restricciones adicionales conocidas. No obstante, se recomienda revisar la licencia del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-clip-vit-base-patch32
- Modelo original CLIP ViT-Base-Patch32: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio GitHub de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Sitio web de React Native ExecuTorch: https://executorch.swmansion.com/
- Paquete npm react-native-executorch: https://www.npmjs.com/package/react-native-executorch
- Documentación oficial de ExecuTorch: https://pytorch.org/executorch/stable/index.html
- Nota de compatibilidad de ExecuTorch: https://github.com/pytorch/executorch/blob/11d1742fdeddcf05bc30a6cfac321d2a2e3b6768/runtime/COMPATIBILITY.md

# software-mansion/react-native-executorch-fcn

## Resumen

El repositorio `software-mansion/react-native-executorch-fcn` aloja modelos de segmentación semántica basados en FCN (Fully Convolutional Network) de PyTorch, exportados al formato `.pte` para su ejecución en el runtime ExecuTorch de Meta. Estos modelos están pensados para integrarse en aplicaciones React Native mediante la biblioteca `react-native-executorch`, que permite ejecutar modelos de IA localmente en dispositivos móviles.

El modelo resuelve el problema de la segmentación semántica en tiempo real en entornos con recursos limitados, como teléfonos y tablets, sin necesidad de conexión a internet. Su relevancia radica en que facilita la implementación de visión por computadora en aplicaciones móvidas con privacidad y latencia reducida. El repositorio incluye los pesos en formato `.pte` (ExecuTorch) y está licenciado bajo MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCN (Fully Convolutional Network) - variante de PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no especificado (exportado para xnnpack) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura es la de una FCN (Fully Convolutional Network) implementada en PyTorch, específicamente el modelo `torchvision.models.fcn`. Estas redes usan una base convolucional (típicamente ResNet) como extractor de características y una cabeza deconvoluciones transpuestas para producir una máscara de segmentación píxel a píxel. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) ni el proceso de optimización (RLHF, DPO, etc.) porque no es un modelo generativo.

La innovación técnica clave es la exportación a formato `.pte` con el backend `xnnpack`, que optimiza el modelo para ejecución en dispositivos móviles con CPU. No hay información sobre el número exacto de parámetros ni el backbone (ResNet50, ResNet101, etc.) en la documentación proporcionada.

## Capacidades

- Segmentación semántica: clasifica cada píxel de una imagen en categorías predefinidas (por ejemplo, objetos, personas, carreteras, etc.).
- Ejecución on-device: diseñado para correr en dispositivos móviles sin conexión a servidores externos, gracias a la optimización de ExecuTorch.
- Integración con React Native: se usa a través de la biblioteca `react-native-executorch`, que ofrece una API declarativa para cargar y ejecutar modelos.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Análisis de imágenes en tiempo real para aplicaciones de realidad aumentada: el modelo puede segmentar el entorno para superponer objetos virtuales en la cámara del dispositivo, aprovechando la baja latencia de ejecución local.
- Accesibilidad para personas con discapacidad visual: una aplicación móvil puede usar la segmentación para identificar obstáculos en el entorno y proporcionar feedback auditivo, funcionando sin conexión.
- Agricultura de precisión: análisis de cultivos mediante imágenes captadas con el móvil para detectar enfermedades o malas hierbas, segmentando las zonas afectadas.
- Control de calidad industrial: inspección visual de piezas en línea de montaje, donde la segmentación permite detectar defectos en tiempo real sin depender de un servidor centralizado.
- Aplicaciones de realidad aumentada: separación del fondo y el primer plano para superponer contenido digital de forma precisa, mejorando la experiencia de usuario en entornos móvidos.
- Diagnóstico médico básico: segmentación de imágenes de diagnóstico (por ejemplo, radiografías) para resaltar regiones de interés, con la ventaja de que el modelo se ejecuta localmente, respetando la privacidad de los datos del paciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (mIoU, pixel accuracy) ni comparativas con otros modelos de segmentación.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en dispositivos móviles con el runtime ExecuTorch, por lo que los requisitos de hardware son los de un smartphone o tablet moderno con soporte de aceleración por hardware (CPU o GPU).
- No se especifica el consumo de VRAM, pero al ser un modelo de visión de tamaño moderado (1.7 GB de repo) se espera que quepa en la memoria de dispositivos con al menos 4 GB de RAM.
- No se recomienda su uso en GPUs de escritorio para producción, ya que está optimizado para el despliegue móvil.
- Opciones de despliegue: la biblioteca `react-native-executorch` gestiona la carga y ejecución del modelo en React Native; también puede usarse directamente con ExecuTorch en otros entornos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un repositorio específico de modelos exportados para una plataforma concreta (React Native ExecuTorch) y no se listan alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento ni las categorías de segmentación, por lo que no se conoce el alcance de los objetos que puede detectar.
- El modelo está exportado para el runtime ExecuTorch 1.1.0 y no se garantiza compatibilidad con versiones anteriores; esto puede causar problemas si se usa con versiones de ExecuTorch más antiguas.
- Al ser un modelo de visión, no tiene capacidad de procesamiento de lenguaje, por lo que no es adecuado para tareas de texto.
- La licencia MIT permite uso comercial, pero el usuario debe verificar que los pesos del modelo (si provienen de un dataset con restricciones) no estén sujetos a condiciones adicionales.
- No se ha publicado información sobre sesgos o alucinaciones, pero en modelos de segmentación semántica es posible que haya errores en condiciones de iluminación, oclusiones o categorías poco representadas.
- El tamaño del repositorio (1.7 GB) puede ser pesado para la descarga en dispositivos con conexión limitada; se recomienda gestionar la descarga bajo demanda.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/software-mansion/react-native-executorch-fcn
- GitHub de React Native ExecuTorch: https://github.com/software-mansion/react-native-executorch
- Documentación de React Native ExecuTorch: https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started
- Página oficial de React Native ExecuTorch: https://executorch.swmansion.com/
- Paquete npm de react-native-executorch: https://www.npmjs.com/package/react-native-executorch
- Documentación oficial de ExecuTorch: https://pytorch.org/executorch/stable/index.html

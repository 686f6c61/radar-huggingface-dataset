# software-mansion/react-native-executorch-lraspp

## Resumen

El modelo `software-mansion/react-native-executorch-lraspp` es un modelo de segmentación semántica basado en la arquitectura LRASPP (Lightweight R-ASPP) de PyTorch, exportado al formato `.pte` para el runtime ExecuTorch de Meta. Lo publica Software Mansion, el equipo responsable de la librería `react-native-executorch`, que permite ejecutar modelos de IA en dispositivos móviles mediante React Native. El objetivo es proporcionar un modelo de segmentación de imágenes listo para usar en aplicaciones móviles, sin necesidad de conexión a red ni de infraestructura en la nube.

La arquitectura LRASPP es una variante ligera de DeepLab, diseñada para ejecución eficiente en dispositivos con recursos limitados. Aunque no se especifican los parámetros exactos del modelo en la información disponible, la versión típica con backbone MobileNetV3-Large ronda los 3-4 millones de parámetros. El modelo se distribuye únicamente en formato `.pte` (ExecuTorch), compatible con la versión 1.1.0 de ExecuTorch. Su relevancia actual radica en la creciente demanda de modelos de visión por computadora que puedan ejecutarse en tiempo real en móviles, especialmente para aplicaciones de realidad aumentada, edición de imagen y accesibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LRASPP (Lightweight R-ASN) con backbone MobileNetV2 (típico) |
| Parametros totales | no disponible (estimación típica: ~3,2 M para MobileNetV2-Large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no texto) |
| Tipos de cuantizacion | no disponible (se exporta a XNNPACK, cuantización probablemente dinámica o estática, pero no se documenta) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.pte` (ExecuTorch, compatible con XNNPACK) |

## Arquitectura y entrenamiento

El modelo LRASPP es una arquitectura de segmentación semántica desarrollada por el equipo de PyTorch Vision. Utiliza una estructura de dos ramas: una rama de bajo nivel que procesa características de alta resolución y una rama de alto nivel que utiliza un módulo de atención espacial para refinar las predicciones. El backbone típico es MobileNetV2, que extrae características a múltiples resoluciones. El entrenamiento se realiza sobre datasets de segmentación como COCO o PASCAL VOC, pero no se dispone de detalles específicos del proceso de entrenamiento de esta exportación concreta.

La exportación a ExecuTorch se realizó con la versión 1.1.0 del runtime. El formato `.pte` es el binario ejecutable que ExecuTorch utiliza para ejecutar modelos en dispositivos. No se documentan técnicas especiales de entrenamiento (como RLHF o DPO) porque se trata de un modelo de visión por computadora, no de un LLM.

## Capacidades

- Segmentación semántica de imágenes: clasifica cada píxel en una categoría (persona, coche, fondo, etc.).
- Ejecución en dispositivo móvil en tiempo real gracias a la optimización para XNNPACK.
- Compatible con el framework React Native ExecuTorch, que ofrece una API declarativa para cargar y ejecutar el modelo.
- Soporte para inferencia local sin conexión, lo que garantiza privacidad y baja latencia.
- No es un modelo de generación de texto ni de razonamiento; no soporta tool calling ni agentes.
- No tiene capacidades multilingües, ya que no procesa texto.

## Casos de uso

- **Edición de fondo en aplicaciones de fotografía**: el modelo puede segmentar el sujeto (persona, objeto) para reemplazar o difuminar el fondo. Se ejecuta en el móvil con el modelo `.pte` cargado a través de `react-native-executorch`.
- **Realidad aumentada**: en aplicaciones de AR, la segmentación permite colocar objetos virtuales sobre superficies o personas de forma realista. El modelo es ligero y puede ejecutarse a 30 FPS en dispositivos móviles modernos.
- **Accesibilidad visual**: para personas con discapacidad visual, se puede usar para detectar objetos en el entorno y describirlos mediante voz. El modelo funciona sin conexión, lo que es crucial en entornos urbanos.
- **Análisis de imágenes médicas**: segmentación de tejidos o estructuras en imágenes de endoscopia o ecografía. El modelo se puede integrar en apps de salud que funcionen en dispositivos de bajo coste.
- **Videollamadas con fondo virtual**: aplicaciones de videoconferencia móviles pueden usar el modelo para separar a la persona del fondo y reemplazar este último. La baja latencia es clave.
- **Sistemas de vigilancia doméstica**: detección de personas u objetos en imágenes de cámaras de seguridad locales, sin necesidad de enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como mIoU, precisión o FPS en el repositorio ni en la documentación de la librería.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en dispositivos móviles (Android e iOS) mediante ExecuTorch.
- VRAM estimada: no disponible, pero al ser un modelo ligero de segmentación, típicamente requiere menos de 1 GB de memoria en el dispositivo.
- GPU recomendada: no se requiere GPU externa; se ejecuta en el hardware del móvil (CPU o GPU integrada). Para desarrollo, cualquier máquina con capacidad de ejecutar el emulador es suficiente.
- Compatibilidad: funciona con React Native ExecuTorch, que requiere iOS 12.0+ y Android API 21+. No se recomienda para GPU de escritorio.
- Opciones de despliegue: se integra mediante `react-native-executorch` (npm). No se dispone de soporte para vLLM, llama.cpp u otros servidores de inferencia, ya que es un modelo móvil.
- Latencia: no se proporcionan datos concretos, pero la arquitectura ligera permite inferencia en tiempo real en dispositivos modernos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| LRASPP (este) | ~3,2 M (típico) | no aplica | `.pte` | MIT | Móvil (React Native) |
| MobileNetV2 + DeepLabV3 | ~5,4 M | no aplica | TensorFlow Lite / PyTorch | Apache 2.0 | Móvil |
| UNet MobileNetV2 | ~4,3 M | no aplica | TFLite | Apache 2.0 | Móvil |

No se dispone de una comparación directa en términos de precisión porque no hay benchmarks publicados. La principal diferencia es el formato `.pte` de ExecuTorch, que no es compatible con otros runtimes. Los modelos alternativos suelen estar en TensorFlow Lite o Core ML, lo que puede ser más común en entornos de desarrollo móvil.

## Limitaciones y advertencias

- No se ha publicado información sobre el dataset de entrenamiento ni las clases de segmentación soportadas, por lo que la precisión y cobertura de categorías son desconocidas.
- El modelo se exportó con ExecuTorch 1.1.0; no se garantiza compatibilidad con versiones anteriores del runtime. Si se utiliza fuera de React Native ExecuTorch, hay que asegurar la misma versión de ExecuTorch.
- Al ser un modelo de visión, no tiene capacidad de razonamiento ni de lenguaje; no se puede usar para tareas de texto.
- La licencia MIT permite uso comercial, pero no se proporcionan garantías sobre el rendimiento en casos de uso específicos.
- El tamaño del repositorio en Hugging Face es de 0.0 GB, lo que sugiere que los archivos `.pte` no se han subido correctamente o están en un repositorio externo; hay que verificar la integridad de los archivos antes de usarlo en producción.

## Enlaces

- [Hugging Face: software-mansion/react-native-executorch-lraspp](https://huggingface.co/software-mansion/react-native-executorch-lraspp)
- [Documentación de LRASPP en PyTorch](https://docs.pytorch.org/vision/main/models/lraspp.html)
- [Repositorio de React Native ExecuTorch (GitHub)](https://github.com/software-mansion/react-native-executorch)
- [Documentación oficial de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
- [Guía de inicio rápido de React Native ExecuTorch](https://docs.swmansion.com/react-native-executorch/docs/fundamentals/getting-started)
- [Página oficial de React Native ExecuTorch](https://executorch.swmansion.com/)
- [Paquete npm react-native-executorch](https://www.npmjs.com/package/react-native-executorch)

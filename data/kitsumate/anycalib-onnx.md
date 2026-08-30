# KitsuMate/anycalib-onnx

## Resumen

AnyCalib ONNX es un conjunto de exportaciones en formato ONNX del modelo AnyCalib, un sistema de calibración de cámara pinhole a partir de una única imagen. El modelo original, desarrollado por el equipo de investigación de AnyCalib (publicado en ICCV 2025), predice un campo de coordenadas tangentes denso que permite recuperar los parámetros intrínsecos de la cámara (distancia focal fx, fy y punto principal cx, cy). Este repositorio concreto, publicado por KitsuMate, proporciona versiones ONNX listas para usar con ONNX Runtime, pensadas para integrarse en la extensión "Vision To Pose" de Blender.

La relevancia de este modelo radica en que la calibración de cámara monocular es un paso fundamental en aplicaciones de visión por computador, fotogrametría, realidad aumentada y robótica. Al ofrecer un formato estándar y optimizado (ONNX) con soporte para aceleración por hardware, facilita su despliegue en entornos de producción sin depender de frameworks específicos de entrenamiento. El bundle incluye dos variantes (FP16 y FP32) y un contrato de preprocesamiento bien definido, lo que simplifica su adopción en pipelines existentes.

El modelo está licenciado bajo Apache-2.0, lo que permite uso comercial y modificación, con la obligación de incluir el aviso de licencia correspondiente. El tamaño del repositorio es de 1.9 GB, aunque el peso real de los grafos no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone DINOv2 (Apache-2.0) + cabeza de predicción de campo tangente denso |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 y FP32 (dos variantes) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 20) |

## Arquitectura y entrenamiento

El modelo original AnyCalib se basa en un backbone DINOv2 (desarrollado por Meta Platforms, también bajo Apache-2.0) que extrae características visuales de la imagen de entrada. Sobre este backbone, una cabeza de red neuronal densa predice un campo de coordenadas tangentes en cada píxel. Este campo se procesa posteriormente mediante un ajuste de mínimos cuadrados y un refinamiento de diez pasos Gauss-Newton (implementado en NumPy en la extensión) para obtener los parámetros intrínsecos de la cámara pinhole: fx, fy, cx y cy.

Los export ONNX mantienen la misma arquitectura, pero con un contrato de entrada/salida específico: aceptan imágenes NCHW RGB con bordes espaciales divisibles por 14 y producen un campo de dos canales a la resolución de entrada. No se dispone de información sobre los datos de entrenamiento del modelo original (número de imágenes, composición del dataset, si hubo algún tipo de ajuste fino posterior), ya que la model card del repositorio se centra en el proceso de exportación y validación, no en el entrenamiento. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura de AnyCalib (aprendizaje on-manifold para calibración agnóstica al modelo).

## Capacidades

- Estimación de parámetros intrínsecos de cámara pinhole (fx, fy, cx, cy) a partir de una única imagen.
- Predicción de un campo de coordenadas tangentes denso, que sirve como representación intermedia para el ajuste fino de los intrínsecos.
- Compatibilidad con ONNX Runtime, lo que permite ejecución en CPU, GPU y otros aceleradores mediante el estándar ONNX.
- Dos variantes de precisión (FP16 y FP32) para equilibrar rendimiento y compatibilidad.
- Entrada dinámica en lote (NCHW), con requisito de divisibilidad por 14 en las dimensiones espaciales.
- No incluye capacidades de tool calling, agentes, razonamiento multilingüe ni generación de texto; es un modelo puramente visual y de regresión geométrica.

## Casos de uso

- Calibración de cámara en fotogrametría: el modelo permite obtener los intrínsecos de una cámara a partir de una sola foto, acelerando el flujo de trabajo en reconstrucción 3D de objetos o escenas.
- Realidad aumentada y mixta: en aplicaciones que superponen contenido virtual sobre imágenes reales, conocer la focal y el punto principal es esencial para una proyección geométricamente correcta.
- Robótica y navegación autónoma: robots con cámaras monocular pueden autocalibrarse sin patrones de calibración previos, facilitando el despliegue en entornos no estructurados.
- Visión industrial y control de calidad: en líneas de producción donde se usan cámaras fijas, el modelo puede re-calibrar el sistema automáticamente cuando se reemplaza una lente o se modifica la posición.
- Integración en pipelines de Blender: al ser el propósito original de este export, se puede usar dentro de la extensión "Vision To Pose" para estimar la cámara de una escena a partir de una imagen de referencia.
- Investigación en calibración monocular: sirve como punto de partida para comparar métodos de calibración single-view o para integrar la estimación de intrínsecos en sistemas más grandes de SLAM o Structure-from-Motion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que se realizaron "parity reports" y validaciones, pero no se incluyen métricas numéricas comparativas (p. ej., error medio en fx/fy, precisión en punto principal). Tampoco se proporcionan comparativas con otros métodos de calibración en la documentación accesible.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM en la información disponible. El tamaño del repositorio es de 1.9 GB (incluyendo ambas variantes y archivos de manifiesto), pero el peso de cada grafo individual no se indica.
- Al ser un modelo ONNX, puede ejecutarse en CPU con ONNX Runtime, aunque la variante FP16 está pensada para aceleración en GPU (con soporte para FP16) y la FP32 para CPU o macOS.
- Las GPUs recomendadas dependerán del tamaño real del modelo (desconocido). Dado que el backbone es DINOv2, es plausible que el modelo tenga decenas de millones de parámetros, pero esto no está confirmado.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), o cualquier runtime compatible con ONNX (TensorRT, OpenVINO, etc.). También se puede convertir a otros formatos si es necesario.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros métodos de calibración monocular (como los basados en redes profundas que predicen directamente los parámetros), pero no se han incluido datos de rendimiento ni referencias a alternativas concretas en la model card ni en los resultados de búsqueda. Por tanto, no se puede realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo solo estima parámetros intrínsecos de cámaras pinhole. No predice orientación (roll, pitch), traslación, zoom ni movimiento 6DoF de la cámara.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con imágenes naturales, puede presentar errores en condiciones extremas de iluminación, lentes no convencionales (distorsión fuerte) o escenas sintéticas.
- Riesgo de alucinación geométrica: en imágenes sin estructura clara (por ejemplo, superficies uniformes), el campo tangente predicho puede ser poco informativo y el ajuste posterior puede producir intrínsecos incorrectos.
- La licencia Apache-2.0 permite uso comercial, pero obliga a incluir el aviso de licencia y a indicar cambios si se redistribuye. Además, el modelo incorpora código de DINOv2 de Meta, también Apache-2.0, por lo que se deben mantener los avisos correspondientes.
- La entrada debe cumplir el requisito de divisibilidad por 14 en altura y anchura; si no, será necesario un preprocesamiento de redimensionado o padding, lo que puede afectar a la precisión.
- No se proporcionan garantías de rendimiento ni soporte oficial más allá del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KitsuMate/anycalib-onnx
- Repositorio oficial de AnyCalib (GitHub): https://github.com/javrtg/AnyCalib
- Paper AnyCalib (ICCV 2025): "AnyCalib: On-Manifold Learning for Model-Agnostic Single-View Camera Calibration" (sin URL directa en la información proporcionada)

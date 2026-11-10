# ShaderError/perspectra-da3-lens

## Resumen

Perspectra DA3 Lens es una redistribución en formato ONNX de los componentes de backbone y cabeza de cámara de Depth Anything 3 (DA3), el modelo de estimación de profundidad y reconstrucción de espacio visual desarrollado por ByteDance Seed. La conversión la firma el usuario ShaderError y está pensada específicamente para integrarse en Perspectra, un add-on de Blender. No hay reentrenamiento ni ajuste fino: se trata de un empaquetado de pesos existentes para su uso en un pipeline de inferencia concreto.

El paquete incluye dos variantes del modelo, Base y Small, cada una con su grafo ONNX y su tabla de embeddings posicionales en formato NPZ. La variante Base ocupa 362 MB en ONNX más 128 MB de embeddings, mientras que la Small se queda en 91 MB y 64 MB respectivamente. El repositorio completo pesa 0,6 GB.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un checkpoint entrenado desde cero, sino un artefacto de despliegue. Resulta útil para quien quiera ejecutar la cabeza de cámara de DA3 en Blender sin depender del repositorio original de PyTorch, pero no aporta capacidades adicionales respecto al modelo de ByteDance. La licencia Apache-2.0 se mantiene, igual que en los pesos originales Base y Small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone y cabeza de cámara de Depth Anything 3 (transformer de visión, detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión multi-frame, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32 o FP16, sin confirmar) |
| Idiomas soportados | no disponible (modelo de visión, sin interfaz de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos) y NPZ (tablas de embeddings posicionales) |

## Arquitectura y entrenamiento

El artefacto redistribuye únicamente el backbone y la cabeza de cámara de Depth Anything 3, es decir, la parte del modelo que, a partir de varias imágenes, estima la posición de cámara y la estructura visual conjunta. No se incluye la cabeza de profundidad ni otros componentes del modelo original, y no se ha realizado ningún entrenamiento adicional: los pesos provienen de los checkpoints oficiales `depth-anything/DA3-BASE` y `DA3-SMALL` de ByteDance Seed. La model card original no detalla aquí la composición del dataset ni el proceso de entrenamiento, por lo que no se dispone de esa información en esta ficha.

La innovación técnica relevante es la conversión a ONNX y la separación de la tabla de embeddings posicionales en un fichero NPZ independiente (`da3_base_cam_pos.npz` y `da3_small_cam_pos.npz`), que el grafo consume como entrada. Esta decisión facilita el despliegue en entornos sin PyTorch, como el add-on de Blender, pero obliga a gestionar dos artefactos por variante. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia adicionales.

## Capacidades

- Estimación de pose de cámara a partir de múltiples vistas, usando el backbone y la cabeza de cámara de DA3.
- Procesamiento de varias imágenes de entrada de forma conjunta (el modelo original está diseñado para "any views", según el título del paper).
- Inferencia en formato ONNX, apta para ejecutarse con ONNX Runtime en entornos de escritorio.
- Integración con Blender mediante el add-on Perspectra.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No incluye visión generativa ni descripción de imágenes: es un modelo geométrico de profundidad y cámara.
- No se documentan modos de pensamiento, audio ni otras capacidades especiales.

## Casos de uso

- Reconstrucción de escena en Blender: el add-on Perspectra puede usar la cabeza de cámara para estimar la pose de varias fotografías y alinear la geometría en el espacio 3D del proyecto, aprovechando que el grafo ONNX está pensado para ejecutarse dentro del propio Blender.
- Fotogrametría asistida sin PyTorch: al estar en ONNX, se puede desplegar en un pipeline de escritorio con ONNX Runtime, evitando la dependencia del stack de entrenamiento original y reduciendo el tamaño de la instalación.
- Previsualización rápida de profundidad y cámara en herramientas de modelado: la variante Small (91 MB) permite iteraciones rápidas en equipos sin GPU dedicada, mientras que la Base (362 MB) se reserva para resultados de mayor calidad.
- Integración en add-ons de DCC (digital content creation): el formato ONNX y la separación de embeddings posicionales facilitan empaquetar el modelo como recurso descargable dentro de un plugin de Blender, Maya u otro editor.
- Investigación en reconstrucción multi-vista: sirve como referencia de despliegue para comparar la salida de la cabeza de cámara de DA3 con otras implementaciones, sin necesidad de montar el repositorio original.
- Prototipado de pipelines de captura 3D: se puede encadenar la salida de cámara con etapas posteriores de mallado o texturizado dentro de un flujo automatizado, usando la variante Base para mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los grafos ONNX ocupan 362 MB (Base) y 91 MB (Small) en disco, más 128 MB y 64 MB de embeddings posicionales; la VRAM en ejecución dependerá de la resolución de entrada y del backend, y no se documenta.
- GPU recomendadas: no disponibles en la información proporcionada. Al ser un modelo de visión de tamaño moderado, es plausible que funcione en GPU consumer, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU consumer: no confirmada. La variante Small es la candidata natural para equipos con poca VRAM.
- Opciones de despliegue: ONNX Runtime (backend lógico para los grafos `.onnx`); el add-on Perspectra es el consumidor previsto. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión en ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perspectra DA3 Lens (Base) | no disponible | no aplica (visión multi-vista) | ONNX + NPZ | Apache-2.0 | Hugging Face (ShaderError) |
| Depth Anything 3 Base (original) | no disponible | no aplica | PyTorch | Apache-2.0 | Hugging Face (ByteDance) |
| Depth Anything 3 Small (original) | no disponible | no aplica | PyTorch | Apache-2.0 | Hugging Face (ByteDance) |
| Depth Anything 3 Large / Giant | no disponible | no aplica | PyTorch | CC BY-NC | Hugging Face (ByteDance) |

La comparativa se limita a las variantes del propio DA3 porque no se dispone de datos de benchmarks ni de especificaciones de parámetros para confrontarlas con otros modelos de profundidad. La diferencia clave frente a los originales es el formato (ONNX frente a PyTorch) y el recorte de componentes (solo backbone y cabeza de cámara). Las variantes Large y Giant del modelo original quedan fuera de esta redistribución por su licencia CC BY-NC.

## Limitaciones y advertencias

- No es un modelo completo: solo incluye backbone y cabeza de cámara; la cabeza de profundidad y otros componentes del DA3 original no están presentes.
- No se ha reentrenado ni ajustado: cualquier sesgo o limitación del DA3 original se hereda sin cambios.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de estimaciones de cámara incorrectas en escenas con poca textura, oclusiones o movimientos no rígidos; no se documentan métricas de error.
- Limitaciones de contexto e idioma: no aplica (modelo de visión sin interfaz de texto).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar que los pesos originales de ByteDance Seed mantienen esa licencia para las variantes Base y Small; las variantes Large y Giant (CC BY-NC) no están incluidas y no deben mezclarse en un producto comercial.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-10), por lo que no hay evidencia de uso en producción ni de mantenimiento.
- Dependencia de dos artefactos por variante (ONNX + NPZ): un empaquetado incorrecto de los embeddings posicionales romperá la inferencia.
- No se documentan versiones de ONNX Runtime compatibles ni requisitos de resolución de entrada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShaderError/perspectra-da3-lens
- Repositorio original de Depth Anything 3 (ByteDance Seed): https://github.com/ByteDance-Seed/Depth-Anything-3
- Pesos originales DA3-BASE: https://huggingface.co/depth-anything/DA3-BASE
- Pesos originales DA3-SMALL: https://huggingface.co/depth-anything/DA3-SMALL
- Paper: Lin et al., "Depth Anything 3: Recovering the Visual Space from Any Views", 2025 (referenciado en la model card; no se proporciona URL directa)

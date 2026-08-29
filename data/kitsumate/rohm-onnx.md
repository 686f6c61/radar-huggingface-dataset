# KitsuMate/rohm-onnx

## Resumen

RoHM (Robust Human Motion) es un modelo de captura de movimiento y generación de fotogramas intermedios (motion inbetweening) desarrollado por el equipo upstream de RoHM, disponible en github.com/sanweiliti/RoHM. Esta versión concreta, publicada por KitsuMate, es un paquete de evaluación ONNX sin malla (mesh-free) diseñado para el post-procesador experimental de la extensión de captura de movimiento de KitsuMate para Blender. Se distribuye exclusivamente en formato ONNX con perfil FP32, con un tamaño de descarga de 222.030.103 bytes (~0,2 GB), e incluye dos grafos: PoseNet y un grafo TrajNet-Control con compuerta (gate), donde la compuerta 0 reproduce el TrajNet original y la compuerta 1 habilita el paso controlado.

La relevancia de este lanzamiento radica en que es una versión experimental de evaluación manual, no un reemplazo validado de StableMotion. La decisión de lanzamiento actual es `HOLD_STABLEMOTION`: la paridad FP32 del denoiser y la compuerta de rendimiento WebGPU en Windows pasan, pero la evaluación de calidad de movimiento representativa y la validación de runtime en Linux/macOS físico siguen incompletas. El paquete está pensado para ejecutarse con ONNX Runtime y NumPy en CPU, WebGPU y CoreML, y verifica cada archivo contra `bundles/fp32/manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PoseNet + TrajNet-Control (grafos ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de movimiento, no texto) |
| Tipos de cuantizacion | FP32 (único perfil publicado); FP16 e INT8 evaluados y descartados |
| Idiomas soportados | no aplica |
| Licencia | other (licencia upstream de RoHM reproducida en LICENSE.md) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

RoHM es un modelo de captura de movimiento robusta y generación de fotogramas intermedios. La versión ONNX publicada contiene dos grafos: PoseNet, responsable de la estimación de pose, y TrajNet-Control, un grafo con compuerta que permite seleccionar entre el comportamiento vanilla (compuerta 0) y un paso controlado (compuerta 1). El paquete se distribuye sin pesos de PyTorch, sin archivos pickle, sin activos SMPL/SMPL-X, sin datos de entrenamiento ni entorno de conversión. Los tensores SMPL-X incrustados en los checkpoints upstream se eliminaron antes de la exportación a ONNX, y los grafos se escanearon para detectar firmas de inicializadores de modelos corporales. La inferencia en producción no importa ni construye `smplx`; los coeficientes de forma no disponibles se tratan como neutros y la salida de forma predicha se ignora. Los datos de normalización de los pickle upstream se leyeron solo en el entorno de conversión aislado, se deduplicaron y se convirtieron a `metadata/normalizers.npz`.

## Capacidades

- Captura de movimiento (motion capture) a partir de datos de entrada de pose.
- Generación de fotogramas intermedios (motion inbetweening).
- Post-procesado de captura de movimiento en Blender mediante la extensión de KitsuMate.
- Ejecución sin malla (mesh-free): no requiere activos SMPL/SMPL-X en runtime.
- Soporte de múltiples proveedores de inferencia: CPU, WebGPU y CoreML.
- Grafo TrajNet-Control con compuerta para seleccionar entre comportamiento vanilla y controlado.
- Verificación de integridad de archivos mediante `manifest.json`.

## Casos de uso

- Post-procesado de captura de movimiento en Blender: el modelo se integra en la extensión de captura de movimiento de KitsuMate como post-procesador experimental para refinar o generar fotogramas intermedios en flujos de animación.
- Evaluación manual de calidad de movimiento: el paquete está diseñado para evaluación manual experimental, permitiendo a desarrolladores verificar la paridad FP32 del denoiser y el rendimiento WebGPU antes de una posible adopción en producción.
- Inferencia en CPU sin GPU dedicada: al publicarse solo el perfil FP32 y soportar el proveedor CPU de ONNX Runtime, puede ejecutarse en entornos sin aceleración GPU, como estaciones de trabajo modestas o CI.
- Inferencia en WebGPU: el soporte de WebGPU permite ejecutar el modelo en navegadores, útil para herramientas de captura de movimiento basadas en web o para validación remota.
- Inferencia en CoreML: el soporte de CoreML permite ejecutar el modelo en dispositivos Apple (macOS/iOS) para aplicaciones de captura de movimiento en ese ecosistema.
- Experimentación con el paso controlado: el grafo TrajNet-Control con compuerta permite comparar el comportamiento vanilla frente al controlado en pipelines de animación, facilitando la evaluación de la mejora introducida por el post-procesador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. El model card menciona datos de evaluación internos:

| Metrica | Resultado |
|---|---|
| Paridad FP32 del denoiser | Pasa la compuerta |
| Compuerta de rendimiento WebGPU (Windows) | Pasa |
| Error L2 relativo de PoseNet con INT8 dinámico | ~32,289% |
| Rendimiento de TrajNet con INT8 dinámico | Más lento que FP32 |
| Rendimiento de FP16 (CPU y WebGPU) | Más lento que FP32 |
| Evaluación de calidad de movimiento representativa | Incompleta |
| Validación de runtime en Linux/macOS físico | Incompleta |

## Requisitos de hardware

- El modelo se ejecuta con ONNX Runtime y NumPy, sin necesidad de GPU dedicada.
- Proveedores soportados: CPU, WebGPU y CoreML.
- Tamaño de descarga: 222.030.103 bytes (~0,2 GB), por lo que los requisitos de VRAM son mínimos si se usa GPU.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (CPU, WebGPU, CoreML). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que son específicos de modelos de lenguaje.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. RoHM es un modelo de captura de movimiento e inbetweening, y la información disponible no incluye comparativas con alternativas como StableMotion u otros modelos de motion inbetweening.

## Limitaciones y advertencias

- Estado experimental: es una versión de evaluación manual, no un reemplazo validado de StableMotion. La decisión de lanzamiento actual es `HOLD_STABLEMOTION`.
- Evaluación incompleta: la evaluación de calidad de movimiento representativa y la validación de runtime en Linux/macOS físico siguen incompletas.
- Solo perfil FP32: FP16 resultó más lento que FP32, e INT8 dinámico presenta errores significativos (32,289% de error L2 relativo en PoseNet) o menor rendimiento (TrajNet).
- Sin calibración INT8 estática: no se dispone de datos de calibración de movimiento representativos.
- Sin activos SMPL/SMPL-X: los tensores del modelo corporal se eliminaron; los coeficientes de forma no disponibles se tratan como neutros y la salida de forma predicha se ignora.
- Licencia restrictiva: la licencia es "other" y la licencia upstream de RoHM se reproduce en `LICENSE.md`; debe revisarse antes de redistribuir o usar comercialmente.
- Sin datos de entrenamiento incluidos: el paquete no contiene datos de entrenamiento ni entorno de conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KitsuMate/rohm-onnx
- Repositorio upstream RoHM: https://github.com/sanweiliti/RoHM
- Repositorio KitsuMate.Onnx: https://github.com/KitsuMate/KitsuMate.Onnx

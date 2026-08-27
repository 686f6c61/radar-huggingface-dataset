# pablovela5620/moge-v2-normal-trt-assets

## Resumen

Este repositorio no contiene un modelo completo, sino un artefacto de comparación (baseline) para la demo "MoGe v2 TensorRT on ZeroGPU" alojada en Hugging Face Spaces. El archivo `moge.pt2` es un programa exportado de PyTorch 2.11 (`ExportedProgram`) que contiene únicamente los heads de normal y máscara del modelo `Ruicheng/moge-2-vitl-normal` en una revisión concreta (`b135031bae30b5ac2ae141a0e68717795ce38340`). Su propósito es servir como referencia de rendimiento frente al motor TensorRT optimizado que se ejecuta en el Space, no como un modelo desplegable de forma independiente.

El modelo subyacente, MoGe v2, es un sistema de estimación de geometría monocular desarrollado por Microsoft Research, presentado como CVPR 2025 Oral. Recupera mapas de puntos métricos, mapas de profundidad métricos, mapas de normales y el campo de visión (FOV) de la cámara a partir de imágenes individuales de dominio abierto. Este repositorio concreto se limita a los componentes de normal y máscara, con forma de entrada fija `[1, 3, 756, 1008]` y 3600 tokens, usando pesos y cómputo FP16 explícitos con límites de entrada/salida en float32.

La relevancia de este artefacto es puramente técnica: permite comparar la salida del modelo original en PyTorch con la versión optimizada en TensorRT dentro del entorno ZeroGPU de Hugging Face, validando que la conversión no introduce desviaciones significativas. No está pensado para uso en producción ni para integración directa en aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Large (heads de normal y mask del modelo MoGe-2-ViT-Large-Normal) |
| Parametros totales | no disponible (el archivo contiene solo los heads, no el modelo completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 756x1008) |
| Tipos de cuantizacion | FP16 explicito (pesos y computo) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | `.pt2` (ExportedProgram de PyTorch 2.11) |

## Arquitectura y entrenamiento

El archivo `moge.pt2` es un programa exportado de PyTorch 2.11 que encapsula los heads de normal y máscara del modelo `Ruicheng/moge-2-vitl-normal`. La arquitectura subyacente es un ViT-Large (Vision Transformer de gran tamaño) adaptado para estimación de geometría monocular, que procesa imágenes de entrada de 756x1008 píxeles y produce 3600 tokens intermedios. El modelo original MoGe v2 fue entrenado por Microsoft Research para recuperar geometría 3D métrica a partir de imágenes de dominio abierto, incluyendo mapas de puntos, profundidad, normales y FOV de cámara.

Este repositorio no incluye información sobre el entrenamiento del modelo original, ni sobre el dataset utilizado, ni sobre el proceso de optimización (RLHF, DPO, etc.). Al tratarse de un artefacto de conversión, solo se documenta el proceso de exportación: el programa tiene forma de entrada fija, pesos FP16 explícitos y límites float32 en entrada y salida. El SHA-256 del archivo se proporciona para verificar su integridad: `908ab397abf18938d681b503a8be4cbfd1cced6fd1fa6fb67855d5cea0e851f5`.

## Capacidades

- Estimación de mapas de normales de superficie a partir de imágenes monoculares (head de normal).
- Generación de máscaras de objeto o segmentación (head de mask).
- Procesamiento de imágenes de alta resolución (756x1008 píxeles) con 3600 tokens de representación intermedia.
- Compatibilidad con el ecosistema TensorRT para inferencia acelerada en GPU (a través del Space asociado).
- Ejecución en entorno ZeroGPU de Hugging Face Spaces, con descarga del archivo durante el arranque de CPU fuera de la asignación de GPU.

No se incluyen capacidades de generación de texto, tool calling, agentes, ni soporte multilingüe, al ser un modelo puramente visual.

## Casos de uso

- Validación de conversión TensorRT: el artefacto sirve como baseline para comparar la salida del modelo PyTorch original frente a la versión optimizada en TensorRT, garantizando que la conversión no introduce errores numéricos significativos.
- Benchmarking de rendimiento en ZeroGPU: permite medir la latencia y el throughput del modelo original en PyTorch dentro del entorno ZeroGPU de Hugging Face, estableciendo una referencia para evaluar la mejora del motor TensorRT.
- Depuración de pipelines de exportación: desarrolladores que trabajen con `torch.export` y `ExportedProgram` pueden estudiar este archivo como ejemplo de exportación de un modelo de visión con forma fija y precisión FP16.
- Integración en demos interactivas: el Space "MoGe v2 TensorRT on ZeroGPU" utiliza este archivo como fallback o comparación visual, permitiendo a los usuarios ver la diferencia entre la salida nativa y la optimizada.
- Investigación en estimación de geometría monocular: aunque el archivo es parcial, los investigadores pueden extraer los heads de normal y mask para estudiar su comportamiento en tareas específicas de estimación de normales.
- Pruebas de compatibilidad de formatos: sirve para verificar que los pesos exportados en formato `.pt2` son cargables y ejecutables en entornos con PyTorch 2.11 y TensorRT, útil para equipos que evalúan formatos de serialización de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (como RMSE en estimación de profundidad o error angular medio en normales) ni comparativas con otros modelos. El único dato de rendimiento indirecto es el tamaño del archivo (642 MiB) frente al motor TensorRT (636 MiB), que sugiere una reducción mínima de tamaño tras la optimización, pero no hay datos de latencia o throughput publicados.

## Requisitos de hardware

- El archivo está diseñado para ejecutarse en el entorno ZeroGPU de Hugging Face Spaces, que proporciona acceso a GPU compartidas bajo demanda.
- No se especifican requisitos de VRAM para este artefacto concreto. El modelo original MoGe-2-ViT-Large requiere una GPU con al menos 8-12 GB de VRAM para inferencia en FP16, pero este repositorio no confirma ese dato.
- El Space asociado mantiene un motor TensorRT de 636 MiB, lo que sugiere que la inferencia optimizada puede ejecutarse en GPUs de gama media, pero no hay especificaciones oficiales.
- Opciones de despliegue: el archivo `.pt2` solo es ejecutable dentro de un entorno con PyTorch 2.11 y el runtime de exportación. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, al ser un modelo de visión con formato propietario de exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo completo, sino un artefacto de exportación parcial. No se pueden comparar parámetros, contexto ni rendimiento con alternativas como Depth Anything V2, Metric3D o ZoeDepth, ya que la información proporcionada no incluye datos suficientes del modelo subyacente ni de sus métricas.

## Limitaciones y advertencias

- Este repositorio no es un modelo desplegable: contiene solo los heads de normal y mask, no el encoder completo ni los componentes de profundidad o puntos métricos.
- La forma de entrada es fija: `[1, 3, 756, 1008]`. No se pueden procesar imágenes de otras resoluciones sin re-exportar el programa.
- El archivo está vinculado a una revisión específica del modelo original (`b135031bae30b5ac2ae141a0e68717795ce38340`). Cambios en el modelo aguas arriba invalidarían este artefacto.
- No hay información sobre sesgos del modelo, riesgo de alucinación (no aplica al ser visión) ni limitaciones de idioma.
- La licencia MIT permite uso comercial, pero el artefacto depende de PyTorch 2.11 y del runtime de exportación, lo que puede limitar su portabilidad.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un recurso de nicho para la demo específica, no un modelo de propósito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pablovela5620/moge-v2-normal-trt-assets
- Space de demostración: https://huggingface.co/spaces/pablovela5620/moge-v2-tensorrt-zerogpu
- Repositorio GitHub de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Repositorio GitHub de MoGe2 (sangjun6122): https://github.com/sangjun6122/MoGe2
- Perfil de Hugging Face del autor: https://huggingface.co/pablovela5620
- Perfil de GitHub del autor: https://github.com/pablovela5620

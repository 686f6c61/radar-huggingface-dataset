# Renzhong11/mllm-edge-speculative-weights

## Resumen

Este repositorio contiene los pesos de los modelos draft y componentes auxiliares utilizados por el proyecto de decodificación especulativa multimodal MLLM Edge Speculative Decoding, desarrollado por el grupo upb-cn (Universidad de Paderborn). No es un modelo de lenguaje o visión independiente, sino un conjunto de artefactos de inferencia eficiente diseñados para acelerar la generación de modelos multimodales grandes en dispositivos con recursos limitados.

El sistema sigue el esquema de decodificación especulativa: un modelo draft compacto propone candidatos de tokens en el cliente, mientras que el modelo base completo los valida en el servidor. Se incluyen dos modelos draft entrenados específicamente para Qwen2.5-VL-7B-Instruct y LLaVA-v1.6-Vicuna-7B, junto con los adaptadores de imagen y cabezas de lenguaje necesarios para el runtime ViSpec. La relevancia actual radica en la creciente demanda de inferencia multimodal en el borde, donde la latencia y el consumo de memoria son críticos.

Los pesos están publicados en formato safetensors y .pth, con precisión BF16 para el draft de Qwen y FP16 para el de LLaVA. El repositorio tiene un tamaño de 9,8 GB e incluye instrucciones de descarga y configuración para integrarlos con el código del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo draft de una capa decoder (transformer) con adaptador de imagen y cabeza de lenguaje |
| Parametros totales | no disponible (hidden size 3584 para Qwen, 4096 para LLaVA; una sola capa) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | BF16 (draft Qwen), FP16 (draft LLaVA); sin cuantizaciones adicionales publicadas |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | no disponible en el repositorio; el codigo del proyecto es Apache 2.0, pero los modelos base (Qwen2.5-VL, LLaVA, Vicuna) tienen sus propias licencias |
| Formato de pesos | safetensors (modelos draft y LM head) y .pth (adaptadores de imagen) |

## Arquitectura y entrenamiento

Los modelos draft son redes transformer de una sola capa decoder, diseñadas para proponer árboles de tokens candidatos de forma rápida. Cada uno se entrena específicamente para un modelo base concreto: `myVispec-Qwen2.5-VL-7B-Instruct` para Qwen2.5-VL-7B-Instruct y `myVispec-llava-v1.6-vicuna-7b-hf` para LLaVA-v1.6-Vicuna-7B. El adaptador de imagen (`img_adaptor_vispec*.pth`) y la cabeza de lenguaje (`lm_head_*.safetensors`) son componentes complementarios que permiten al draft model procesar entradas visuales y generar distribuciones de tokens compatibles con el modelo base.

El entrenamiento se realizó siguiendo el pipeline del proyecto ViSpec, pero la model card no incluye detalles sobre la procedencia de los datos, hiperparámetros, hardware utilizado ni resultados de evaluación. Los pesos no son modelos autónomos: su función es exclusivamente proponer tokens que luego son validados por el modelo base completo, garantizando que la salida final no se degrada respecto a la generación sin especulación.

## Capacidades

- Proponer tokens candidatos para decodificación especulativa multimodal, reduciendo la latencia de inferencia en comparación con la generación autoregresiva estándar.
- Procesar entradas visuales y textuales gracias al adaptador de imagen, aunque la comprensión semántica final la realiza el modelo base.
- Funcionar en un esquema cliente-servidor: el draft model se ejecuta en el cliente (dispositivo edge) y el modelo base en el servidor.
- Compatibilidad con dos familias de modelos base: Qwen2.5-VL-7B-Instruct y LLaVA-v1.6-Vicuna-7B.
- No soporta tool calling, agentes ni razonamiento multi-paso por sí mismo; esas capacidades dependen del modelo base.
- No es un modelo de propósito general: su única función es acelerar la generación especulativa.

## Casos de uso

- Asistentes de visión en tiempo real en dispositivos móviles: el draft model propone tokens rápidamente en el dispositivo, mientras el servidor valida, permitiendo respuestas interactivas con imágenes sin enviar cada token por red.
- Chatbots multimodales en el borde para atención al cliente: reducción de latencia en conversaciones con imágenes, manteniendo la calidad del modelo base.
- Sistemas de realidad aumentada que requieren descripción de escenas en tiempo real: la decodificación especulativa acelera la generación de texto a partir de frames de cámara.
- Aplicaciones de accesibilidad (descripción de imágenes para personas con discapacidad visual) en dispositivos con recursos limitados.
- Investigación en inferencia eficiente: permite experimentar con esquemas de decodificación especulativa multimodal sin entrenar modelos desde cero.
- Despliegue en entornos con ancho de banda limitado: al mover la generación de tokens candidatos al cliente, se reduce la cantidad de comunicación con el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los detalles de evaluación final no están incluidos en esta versión inicial. No se proporcionan métricas de latencia, throughput ni comparaciones con otros sistemas de decodificación especulativa.

## Requisitos de hardware

- Los modelos draft son compactos (una capa decoder, hidden size 3584/4096), por lo que pueden ejecutarse en GPUs de consumo con poca VRAM; se estima menos de 2 GB para el draft model en BF16/FP16.
- El adaptador de imagen y la cabeza de lenguaje son archivos pequeños (del orden de cientos de MB) y no requieren hardware especial.
- El sistema completo requiere además el modelo base de 7B parámetros (Qwen2.5-VL o LLaVA-v1.6), que necesita aproximadamente 14-16 GB de VRAM en FP16 para inferencia.
- Para el servidor se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A10, L4) para alojar el modelo base.
- El cliente puede ser un dispositivo con GPU integrada o una GPU de gama baja, ya que solo ejecuta el draft model.
- Opciones de despliegue: el proyecto proporciona un stack cliente-servidor basado en ViSpec; no se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- La latencia y el throughput dependen del hardware del cliente y del servidor, así como de la tasa de aceptación de tokens del draft model; no se han publicado cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros sistemas de decodificación especulativa multimodal. Existen alternativas como EdgeLLM (para LLM en el borde) o el propio ViSpec, pero no hay datos públicos de rendimiento de este repositorio frente a ellas. La comparativa queda pendiente de la publicación de resultados de evaluación.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el código del proyecto ViSpec, el modelo base correspondiente y los componentes (adaptador, LM head) emparejados correctamente. Mezclar componentes de Qwen y LLaVA no está soportado.
- No se puede utilizar a través del widget de Hugging Face ni como reemplazo directo de los modelos base.
- La licencia de los artefactos no está especificada en el repositorio; el código del proyecto es Apache 2.0, pero los modelos base (Qwen2.5-VL, LLaVA, Vicuna) tienen licencias propias que deben revisarse antes de uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que estas dependen del modelo base y no del draft model.
- La ausencia de datos de entrenamiento y evaluación publicados impide verificar la calidad de los draft models en escenarios reales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco difundida; se recomienda validar su funcionamiento en un entorno controlado antes de producción.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Renzhong11/mllm-edge-speculative-weights
- Proyecto MLLM Edge Speculative Decoding (GitHub): https://github.com/upb-cn/mllm-edge-speculative
- Proyecto ViSpec (referencia de entrenamiento): https://github.com/KangJialiang/ViSpec
- Modelo base Qwen2.5-VL-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Modelo base LLaVA-v1.6-Vicuna-7B: https://huggingface.co/llava-hf/llava-v1.6-vicuna-7b-hf

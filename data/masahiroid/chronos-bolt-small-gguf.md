# masahiroid/chronos-bolt-small-gguf

## Resumen

chronos-bolt-small-gguf es una conversión al formato GGUF del modelo de series temporales amazon/chronos-bolt-small, publicada por el usuario masahiroid. No se trata de un modelo de lenguaje: es un modelo de forecasting (predicción de series temporales) basado en la arquitectura T5, con 47.720.064 parámetros, que genera 9 cuantiles (0,1 a 0,9) para un horizonte de 64 pasos futuros a partir de un contexto de hasta 2048 observaciones. No dispone de tokenizador de texto.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, y su interés principal es técnico, como ejemplo de empaquetado de un modelo no lingüístico en un contenedor GGUF con un esquema propio. El autor advierte que este GGUF **no es compatible con llama.cpp, Ollama ni LM Studio**, sino que requiere el loader MLX incluido y ejecución sobre Apple Silicon.

Se trata de una conversión F32 (no una cuantización de 4 bits) que preserva los nombres de tensores originales de Hugging Face y mantiene la máxima longitud de contexto del modelo fuente. La validación numérica reportada frente a la implementación original en PyTorch arroja una diferencia absoluta máxima de 3,8146973e-06 y una similitud coseno mínima de 1 en tres casos deterministas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T5 (según tag del repositorio); esquema GGUF propio `hf-native-mlx-v1` |
| Parámetros totales | 47.720.064 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 2048 observaciones de serie temporal |
| Tipos de cuantización | F32 (el autor indica explícitamente que no es una cuantización de 4 bits) |
| Idiomas soportados | no aplica (modelo de series temporales, sin tokenizador de texto) |
| Licencia | apache-2.0 (pesos); adiciones de conversión y runtime bajo MIT |
| Formato de pesos | GGUF con esquema personalizado (tensores F32, nombres originales de HF) |

## Arquitectura y entrenamiento

El modelo subyacente, amazon/chronos-bolt-small, es un modelo fundacional para series temporales construido sobre una arquitectura T5, con 48M parámetros, orientado a forecasting zero-shot. La salida es probabilística: 9 cuantiles (0,1–0,9) sobre un horizonte fijo de 64 pasos, condicionados a un contexto de hasta 2048 observaciones. No hay información disponible en la documentación proporcionada sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

Esta publicación concreta no entrena ni afina nada: es una conversión de checkpoint desde la revisión `772f3d25d38aec6d914c8949dab4462e2d46f5d8` del modelo original, sin checkpoint de reemplazo. La innovación técnica es de empaquetado: un contenedor GGUF con `general.architecture=hf-native-mlx-v1`, tensores F32 y nombres de tensor nativos de HF, pensado para cargarse con el runtime MLX incluido. El autor documenta también exportaciones Core ML/Core AI con formas fijas (batch 1 y longitud de contexto 2048 para Chronos; batch 1 y secuencia 128 para los exports de texto), mientras que el GGUF/MLX preserva la longitud variable hasta el límite del modelo fuente. El entorno de conversión validado es PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, chronos-forecasting 2.3.2 y GGUF 0.19.0.

## Capacidades

- Predicción de series temporales: genera 9 cuantiles (0,1–0,9) para 64 pasos futuros.
- Forecasting zero-shot sobre series no vistas durante el entrenamiento, sin ajuste específico por serie.
- Manejo de contextos de hasta 2048 observaciones, con entradas de longitud variable en el runtime MLX.
- Soporte de series con observaciones faltantes (según los casos de validación del autor, que incluyen una serie con datos ausentes).
- Entrada con relleno por la izquierda mediante NaN para los exports Apple de forma fija.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo, al carecer de tokenizador de texto.

## Casos de uso

- Previsión de demanda en retail: usar el modelo para proyectar 64 pasos de ventas diarias o semanales por SKU, aprovechando la salida por cuantiles para dimensionar stock con un nivel de servicio objetivo (por ejemplo, el cuantil 0,9 para escenarios conservadores).
- Planificación de capacidad en infraestructura: alimentar series de CPU, memoria o latencia con hasta 2048 observaciones y obtener bandas de incertidumbre a 64 pasos para escalado preventivo.
- Gestión energética: predecir consumo eléctrico horario con cuantiles que permitan acotar el riesgo de picos y ajustar la compra o el almacenamiento.
- Monitorización financiera de series de precios o volúmenes: generar intervalos probabilísticos a corto plazo como señal de alerta ante desviaciones respecto a la predicción.
- Predicción de series con datos faltantes: escenarios de sensores con caídas de telemetría, donde el modelo se ha validado con series que contienen observaciones ausentes.
- Evaluación comparativa de modelos de forecasting: servir como línea base zero-shot de 48M parámetros frente a modelos mayores o ajustados por serie, con un coste de inferencia bajo.
- Prototipado en Mac con Apple Silicon: gracias al runtime MLX incluido, permite validar pipelines de forecasting localmente antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea en la información disponible. El autor solo reporta comprobaciones de paridad numérica de la conversión frente a la implementación original en PyTorch, sobre 3 casos deterministas:

| Métrica de validación | Valor |
|---|---|
| Diferencia absoluta máxima de salida | 3,8146973e-06 |
| Similitud coseno mínima | 1 |
| Casos evaluados | 3 (deterministas) |

Estos datos son comprobaciones de equivalencia de conversión, no benchmarks de calidad predictiva ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 47,7M de parámetros en F32 el peso de los tensores ronda los 190 MB, y el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: el runtime incluido requiere Apple Silicon (Mac con chip M-series); no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no aplica en el sentido habitual; el requisito es un Mac con Apple Silicon, no una GPU NVIDIA.
- Opciones de despliegue: exclusivamente el loader MLX incluido (`runtime_mlx.Model`), con dependencias `huggingface_hub`, `mlx`, `numpy` y `gguf`. No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni TGI.
- Latencia y throughput: no disponibles; el autor indica que la validación realizada no es un benchmark de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Horizonte | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| masahiroid/chronos-bolt-small-gguf | 47,7M | 2048 observaciones | 64 pasos, 9 cuantiles | GGUF propio + MLX | apache-2.0 (pesos) / MIT (código) | Hugging Face, 0 descargas |
| amazon/chronos-bolt-small | 48M | 2048 observaciones | 64 pasos, 9 cuantiles | PyTorch (HF) | apache-2.0 | Hugging Face (modelo original) |
| masahiroid/chronos-bolt-small-mlx | no disponible | no disponible | no disponible | MLX | apache-2.0 / MIT | Hugging Face |
| masahiroid/chronos-bolt-small-coreml | no disponible | 2048 (forma fija) | 64 pasos | Core ML | apache-2.0 / MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la paridad numérica reportada frente al modelo original.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa ni genera texto, y carece de tokenizador.
- El GGUF usa un esquema propietario (`hf-native-mlx-v1`) y no funciona en llama.cpp, Ollama, LM Studio ni otras herramientas estándar de GGUF; requiere el loader MLX incluido.
- Requiere hardware Apple Silicon; no hay soporte documentado para GPUs NVIDIA ni para despliegue en servidores x86 convencionales.
- El horizonte de predicción está fijado en 64 pasos; no es configurable según la documentación.
- Los exports Core ML/Core AI usan formas fijas (batch 1, contexto 2048), lo que obliga a rellenar con NaN las entradas cortas.
- La validación se limita a 3 casos deterministas de paridad numérica; no hay evidencia publicada de calidad predictiva, sesgos ni robustez en dominios concretos.
- No se garantiza la compatibilidad de versiones fuera del entorno probado (PyTorch 2.14.1, Transformers 4.57.3, MLX 0.32.4, NumPy 1.26.4, coremltools 9.0, chronos-forecasting 2.3.2, GGUF 0.19.0, coreai-torch 0.4.3).
- La licencia apache-2.0 de los pesos no implica certificación de seguridad ni licencia comercial adicional; los términos upstream están en `LICENSE` y las adiciones del conversor en `CODE_LICENSE` (MIT).
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de mantenimiento continuado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/masahiroid/chronos-bolt-small-gguf
- Modelo original: https://huggingface.co/amazon/chronos-bolt-small
- Revisión del modelo fuente: https://huggingface.co/amazon/chronos-bolt-small/tree/772f3d25d38aec6d914c8949dab4462e2d46f5d8
- Variante MLX: https://huggingface.co/masahiroid/chronos-bolt-small-mlx
- Variante Core ML: https://huggingface.co/masahiroid/chronos-bolt-small-coreml
- Variante Core AI: https://huggingface.co/masahiroid/chronos-bolt-small-coreai
- Ficha de referencia del modelo: https://theapplied.co/models/amazon-chronos-bolt-small

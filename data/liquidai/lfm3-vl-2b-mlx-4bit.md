# LiquidAI/LFM3-VL-2B-MLX-4bit

## Resumen
LFM3-VL-2B-MLX-4bit es la versión cuantizada a 4 bits en formato MLX del modelo multimodal LFM3-VL-2B de Liquid AI, optimizada específicamente para inferencia en Apple Silicon. Se trata de un modelo de imagen-a-texto (image-text-to-text) de aproximadamente 1.918 millones de parámetros que combina comprensión visual con generación de lenguaje, empaquetado en un repositorio de 1,6 GB con pesos que ocupan 1,59 GB.

La relevancia de esta variante reside en su estrategia de cuantización: emplea cuantización afín de 4 bits con grupos de 32 y mantiene los embeddings de tokens en 8 bits, aplicando además destilación con conciencia de cuantización (QAD, quantization-aware distillation) para recuperar buena parte del rendimiento del modelo original en 8 bits. Esto permite desplegar un modelo visión-lenguaje en hardware de consumo Apple sin renunciar en exceso a la calidad.

El modelo cubre 16 idiomas (incluido el español) y se distribuye bajo licencia LFM1.0 (lfm1.0), lo que condiciona su uso comercial. Requiere MLX-VLM 0.7.11 o superior para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal imagen-texto de la familia LFM3; detalles en la model card del modelo base) |
| Parametros totales | 1.918.181.888 (~1,92 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín con grupos de 32; embeddings de tokens en 8 bits; entrenado con quantization-aware distillation (QAD) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX), 4-bit |

## Arquitectura y entrenamiento
No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base LFM3-VL-2B (tipo de transformer, mecanismos de atención, composición del dataset de entrenamiento, número de tokens o si hubo RLHF/DPO). La model card de esta variante remite explícitamente a la model card del modelo original para los detalles de arquitectura y uso.

Lo que sí se documenta es el proceso de cuantización: los pesos usan cuantización afín de 4 bits con grupos de 32, los embeddings de tokens permanecen en 8 bits, y el modelo cuantizado se entrena mediante destilación con conciencia de cuantización (QAD), de modo que recupera buena parte del rendimiento del modelo en 8 bits. El resultado son pesos de 1,59 GB pensados para Apple Silicon y ejecutables con MLX-VLM.

## Capacidades
- Comprensión de imágenes y generación de texto a partir de ellas (pipeline image-text-to-text).
- Conversación multimodal multi-turno (etiqueta conversational).
- Generación de descripciones de imágenes y respuestas a preguntas visuales.
- Soporte multilingüe en 16 idiomas, incluido el español.
- Ejecución en dispositivo (on-device) sobre Apple Silicon mediante MLX.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso
- Descripción automática de imágenes en local: el modelo puede generar descripciones textuales de fotografías ejecutándose íntegramente en un Mac con Apple Silicon, sin enviar datos a la nube, gracias a sus pesos de 1,59 GB en MLX.
- Asistentes de accesibilidad: conversión de contenido visual (capturas, documentos escaneados, imágenes) en texto para lectores de pantalla, aprovechando la modalidad imagen-texto y el soporte multilingüe.
- Etiquetado y catalogación de imágenes: generación de metadatos descriptivos para bibliotecas fotográficas o catálogos de producto en un flujo por lotes sobre hardware Apple.
- Prototipado rápido de aplicaciones visión-lenguaje: al ser una variante 4-bit ligera, permite iterar en local con MLX-VLM antes de escalar a un modelo mayor o a la API de Liquid AI.
- Atención al cliente con soporte de imágenes: un usuario puede adjuntar una captura o foto y el modelo responde en su idioma (16 idiomas soportados) describiendo o interpretando el contenido visual.
- Procesamiento de documentos con componentes visuales en entornos con requisitos de privacidad: al ejecutarse on-device, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Investigación y evaluación de cuantización: útil para estudiar el impacto de QAD y de la cuantización 4-bit en modelos multimodales pequeños sobre Apple Silicon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria: los pesos ocupan 1,59 GB en 4 bits; el repositorio completo pesa 1,6 GB. La memoria unificada necesaria para inferencia será algo superior a esa cifra por el estado de activaciones y caché, pero el dato exacto no está disponible.
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni para ejecución CUDA.
- Cabe en equipos de consumo Apple: con 1,59 GB de pesos, es viable en Macs con memoria unificada modesta (el mínimo concreto no está especificado en la información disponible).
- Despliegue: MLX-VLM 0.7.11 o superior, mediante `python -m mlx_vlm.generate`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput: no disponibles.

Parámetros de generación sugeridos en la model card: temperature 0.1, top-p 1.0, top-k 50, min-p 0.0, repetition-penalty 1.1, max-tokens 16384.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-4bit | ~1,92 mil millones | no disponible | MLX 4-bit (safetensors) | lfm1.0 | Hugging Face (2.323 descargas) |
| LFM3-VL-2B (base) | ~1,92 mil millones | no disponible | safetensors (precisión original) | lfm1.0 | Hugging Face |
| Otras alternativas de visión-lenguaje de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores que permitan una comparación cuantitativa fiable. La comparación directa más relevante es con el propio modelo base LFM3-VL-2B, del que esta variante es una cuantización 4-bit para MLX.

## Limitaciones y advertencias
- Restricciones de licencia: la licencia LFM1.0 (license: other) puede imponer condiciones al uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- Exclusividad de plataforma: al estar en formato MLX, solo se ejecuta en Apple Silicon; no es portable a CUDA ni a otros backends sin conversión.
- Pérdida de precisión por cuantización: aunque QAD recupera buena parte del rendimiento del modelo en 8 bits, persiste una degradación respecto al modelo base en precisión completa.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas visuales puede describir elementos ausentes o malinterpretar imágenes ambiguas.
- Sesgos: no se documentan sesgos específicos en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; aunque se listan 16 idiomas, la calidad relativa por idioma no se especifica.
- Capacidades no documentadas: no se confirma soporte de tool calling, agentes ni otras modalidades; no asumir estas funciones en producción sin verificación.
- Requiere MLX-VLM 0.7.11 o superior; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue en MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm

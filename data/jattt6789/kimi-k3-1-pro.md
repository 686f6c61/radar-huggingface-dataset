# Jattt6789/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado por Moonshot AI como el primero de la serie K3.1. Se construye mediante post-entrenamiento sobre Kimi K3, aplicando aprendizaje por refuerzo conjunto a gran escala en cientos de dominios de aplicación, y está diseñado para tareas de codificación, creación 3D, investigación financiera y flujos agénticos de múltiples pasos. Es un modelo de pesos abiertos de clase 3T, con una ventana de contexto de un millón de tokens.

La arquitectura es un transformer de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104 mil millones de parámetros activados por token, distribuidos en 93 capas. Emplea una composición híbrida de atención con 69 capas KDA y 24 capas Gated DSA, además de 896 expertos enrutados con 16 expertos seleccionados por token y 2 expertos compartidos. El vocabulario es de 160K tokens.

La relevancia del modelo reside en su escala y en la combinación de contexto extremadamente largo con capacidades multimodales nativas y agenticas. No obstante, el repositorio de Hugging Face analizado (Jattt6789/Kimi-K3.1-Pro) es una copia de terceros con 0 descargas y 0 likes, y el tamaño del repo (1561,4 GB) condiciona fuertemente su despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida KDA + Gated DSA |
| Parámetros totales | 2.780.110.363.392 (2,8T) |
| Parámetros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantización | 8-bit (tag `8-bit`), `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (license: other) |
| Formato de pesos | safetensors, compressed-tensors, custom_code |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 93 capas (1 capa densa) y una dimensión oculta de atención de 7168 con 96 cabezas de atención. La composición de capas de atención es híbrida: 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (Deep Sparse Attention). La DSA emplea 32 cabezas de índice con dimensión 128 y un top-K de 2048, lo que sugiere un mecanismo de atención dispersa sobre el contexto largo. La dimensión latente del MoE es 3584, con una dimensión oculta por experto de 3072, 896 expertos enrutados, 16 seleccionados por token y 2 expertos compartidos.

El entrenamiento parte de Kimi K3 y aplica post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. La model card no detalla el número de tokens de preentrenamiento, la composición del dataset ni si hubo RLHF o DPO específicos; esa información no está disponible. La innovación técnica destacable es la combinación de atención lineal KDA con atención dispersa DSA para sostener un contexto de un millón de tokens, junto con el enrutamiento MoE de grano fino (16 de 896 expertos).

## Capacidades

- Generación de texto y razonamiento de múltiples pasos en dominios como codificación, creación 3D e investigación financiera.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con capacidades nativas multimodales.
- Capacidades agénticas: el modelo se describe como "agentic model" y ha sido post-entrenado con RL en dominios downstream.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking mode): no confirmado en la información disponible.
- Precisión factual mejorada según la model card, aunque sin métricas publicadas.

## Casos de uso

- Investigación financiera asistida: el modelo puede analizar documentos extensos y cruzar información de múltiples fuentes gracias a su contexto de un millón de tokens, adecuado para informes de analistas y due diligence.
- Generación de código en producción: su especialización en codificación y su naturaleza agéntica permiten integrarlo en pipelines de revisión y generación de parches, aunque el soporte de tool calling no está confirmado.
- Creación 3D y flujos de diseño: la model card destaca mejoras en creación 3D, por lo que puede asistir en la generación de descripciones, scripts y assets en herramientas de modelado.
- Agentes autónomos de múltiples pasos: el post-entrenamiento con RL en dominios downstream lo orienta a tareas que requieren planificación y ejecución encadenada.
- Análisis de documentos largos con imágenes: al ser multimodal nativo, puede procesar informes, capturas y diagramas junto con texto en una misma ventana.
- Asistencia conversacional de contexto largo: adecuado para sesiones multi-turno donde se acumula mucho historial sin perder coherencia.
- Evaluación comparativa de modelos: su escala de 2,8T y contexto de 1M lo convierten en referencia para estudiar arquitecturas MoE híbridas, aunque su despliegue es prohibitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 1561,4 GB en safetensors; en 8-bit el peso ronda los 780 GB, por lo que la inferencia requiere un clúster multi-GPU, no una GPU única.
- GPU recomendadas: para pesos completos se necesitan nodos con múltiples H100 (80 GB) o H200; no cabe en A100 de 80 GB individuales ni en RTX 4090.
- Consumer GPU: no es viable en ninguna GPU de consumo, ni siquiera con cuantización agresiva, dado el tamaño total de 2,8T.
- Opciones de despliegue: transformers con `custom_code` y `compressed-tensors`; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T totales / 104B activos | 1M | `kimi-k3.1-pro` (other) | Pesos abiertos en HF (copia de terceros) |
| Kimi K3 | no disponible | no disponible | no disponible | Referencia base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio analizado es una copia de terceros (Jattt6789) con 0 descargas y 0 likes; no es el repositorio oficial de Moonshot AI, lo que plantea dudas sobre integridad y procedencia de los pesos.
- La licencia `kimi-k3.1-pro` es de tipo "other"; no se detallan en la información disponible las restricciones para uso comercial, por lo que debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- Riesgo de alucinación inherente a los modelos de lenguaje; la model card menciona mejoras en precisión factual pero no publica métricas que lo respalden.
- Idiomas soportados no disponibles, lo que impide garantizar calidad multilingüe.
- El tamaño de 1561,4 GB y los 2,8T de parámetros hacen inviable el despliegue en infraestructura convencional; requiere clústeres multi-GPU.
- No se confirma soporte de tool calling ni de modo thinking, capacidades clave para uso agéntico en producción.
- La fecha de creación del repo (2026-11-18) y la ausencia de documentación adicional limitan la verificación independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jattt6789/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

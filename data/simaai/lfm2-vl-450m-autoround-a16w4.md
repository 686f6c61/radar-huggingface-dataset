# simaai/LFM2-VL-450M-Autoround-a16w4

## Resumen

LFM2-VL-450M-Autoround-a16w4 es una versión optimizada y compilada del modelo vision-language LiquidAI/LFM2-VL-450M, preparada por SiMa.ai para su plataforma de inferencia en edge Modalix. El modelo original, desarrollado por Liquid AI, es el VLM más pequeño de su familia con 450 millones de parámetros, diseñado específicamente para despliegue en dispositivos con restricciones severas de memoria y cómputo. Esta variante aplica una cuantización híbrida (A16W8 para procesamiento de prompt y A16W4 para generación de tokens) y fija la resolución de entrada a 512x512 para maximizar el rendimiento en el acelerador SiMa.ai MLA.

La relevancia de este modelo radica en su enfoque práctico: no es un checkpoint genérico, sino un artefacto compilado listo para ejecutarse en hardware concreto, con métricas de rendimiento medidas (221,35 tokens/segundo y 0,11 segundos de tiempo al primer token). Está pensado para desarrolladores que trabajan con la plataforma SiMa.ai Modalix y necesitan un VLM multimodal de bajo coste para aplicaciones embebidas. El repositorio incluye instrucciones de despliegue mediante la CLI `llima` y el runtime Neat, así como ejemplos de uso con APIs compatibles con OpenAI y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-VL (vision-language transformer, basado en LiquidAI/LFM2-VL-450M) |
| Parametros totales | 450 millones |
| Parametros activos | no disponible (no es un MoE declarado) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | A16W8 (prompt processing) y A16W4 (token generation) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI, con restricciones de uso) |
| Formato de pesos | compilado para LLiMa (runtime de SiMa.ai), no safetensors estándar |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo LFM2-VL-450M de Liquid AI, un transformer multimodal que procesa imágenes y texto. Liquid AI no ha publicado detalles completos sobre la arquitectura interna (número de capas, dimensiones de atención, tipo de atención) en la información disponible. El modelo original admite resoluciones de entrada dinámicas, pero esta versión compilada fija la resolución a 512x512 en tiempo de compilación para optimizar el rendimiento en el acelerador SiMa.ai MLA. La cuantización híbrida aplicada (A16W8 para el procesamiento del prompt y A16W4 para la generación de tokens) reduce el peso del modelo sin degradar significativamente la precisión, según indica la documentación. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto e imagen: el modelo acepta entradas multimodales (imagen + texto) y produce respuestas textuales.
- Razonamiento visual: capacidad de describir, analizar y responder preguntas sobre imágenes.
- Inferencia de baja latencia: optimizado para dispositivos embebidos con métricas de 221,35 tokens/segundo y 0,11 segundos de TTFT en la plataforma Modalix.
- Soporte de APIs compatibles con OpenAI y Ollama mediante el servidor GenAI de SiMa.ai.
- Ejecución local en dispositivo: el modelo se ejecuta completamente en el acelerador Modalix, sin dependencia de la nube.

No se ha confirmado soporte de tool calling, function calling, agentes multi-step, ni capacidades de audio o video en la información disponible.

## Casos de uso

- Asistentes visuales en dispositivos embebidos: el modelo puede analizar imágenes capturadas por cámaras en tiempo real y responder preguntas en lenguaje natural, por ejemplo en quioscos interactivos o sistemas de guiado en museos, gracias a su baja latencia y ejecución local.
- Inspección visual en línea de producción: integrado en un sistema de control de calidad, el modelo puede clasificar defectos en imágenes de productos y generar informes textuales, funcionando en hardware de bajo consumo sin conexión a la nube.
- Accesibilidad para personas con discapacidad visual: el modelo puede describir escenas capturadas con una cámara portátil, proporcionando descripciones auditivas en tiempo real con una latencia de 0,11 segundos al primer token.
- Automatización de documentación técnica: a partir de imágenes de diagramas, esquemas o capturas de pantalla, el modelo puede generar descripciones textuales que alimenten bases de conocimiento o manuales, ejecutándose en dispositivos de campo.
- Vigilancia perimetral con análisis de contexto: combinado con cámaras de seguridad, el modelo puede interpretar eventos visuales (presencia de personas, vehículos, objetos) y generar alertas descriptivas, funcionando en nodos edge con restricciones de energía.
- Demostraciones y prototipos en ferias tecnológicas: al ser un modelo pequeño y ejecutable en hardware embebido, es adecuado para demostraciones interactivas donde se muestre comprensión de imágenes en tiempo real sin necesidad de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento proporcionada es la medida en la plataforma SiMa.ai Modalix con una imagen y un prompt de 7 tokens:

| Metrica | Valor |
|---|---|
| Response rate | 221,35 tokens/segundo |
| Time to first token | 0,11 segundos |

Estos datos son específicos del hardware Modalix y no comparables directamente con benchmarks académicos.

## Requisitos de hardware

- Dispositivo SiMa.ai Modalix (acelerador MLA) obligatorio para ejecutar este modelo compilado.
- No se puede ejecutar en GPUs convencionales (NVIDIA, AMD) ni en CPUs estándar, ya que el formato es específico del runtime LLiMa de SiMa.ai.
- Se requiere el runtime Neat instalado en el dispositivo Modalix (instalación única).
- La CLI `llima` gestiona los modelos en `/media/nvme/llima/models` por defecto; se puede cambiar con la variable `LLIMA_MODELS_PATH`.
- El tamaño del repositorio es de 6,3 GB, lo que indica los pesos compilados con cuantización A16W4/A16W8.
- Para servir el modelo con APIs OpenAI u Ollama, se necesita el flujo de trabajo GenAI server de SiMa.ai.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Plataforma |
|---|---|---|---|---|---|
| LFM2-VL-450M (Liquid AI) | 450M | no disponible (original) | lfm1.0 | safetensors | multiplataforma (PyTorch) |
| LFM2-VL-450M-Autoround-a16w4 (SiMa.ai) | 450M | 2048 | lfm1.0 | compilado LLiMa | SiMa.ai Modalix |
| LFM2.5-VL-450M (Liquid AI) | 450M | no disponible | lfm1.0 | safetensors | multiplataforma |

El modelo compilado no es directamente comparable con alternativas de código abierto como LLaVA o Qwen-VL porque su formato y plataforma de ejecución son propietarios. La versión base LFM2-VL-450M es el punto de partida, y existe una versión más reciente (LFM2.5-VL-450M) con mejoras de rendimiento, pero sin la optimización específica para Modalix.

## Limitaciones y advertencias

- Resolución de entrada fija a 512x512: no admite resoluciones dinámicas, lo que puede afectar a imágenes de mayor tamaño o con detalles finos.
- Cuantización A16W4/A16W8: puede introducir desviaciones menores de precisión respecto al modelo en punto flotante completo.
- Longitud de contexto limitada a 2048 tokens, insuficiente para documentos extensos o conversaciones muy largas.
- Licencia lfm1.0 de Liquid AI: es una licencia propietaria con restricciones de uso comercial; es necesario revisar los términos exactos antes de desplegar en producción.
- Dependencia exclusiva del hardware SiMa.ai Modalix: no es portable a otras plataformas de inferencia.
- No se dispone de información sobre sesgos, riesgos de alucinación, ni evaluación de seguridad del modelo.
- El modelo no admite entrada de audio ni video; solo imagen fija y texto.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/simaai/LFM2-VL-450M-Autoround-a16w4
- Modelo base en HuggingFace: https://huggingface.co/LiquidAI/LFM2-VL-450M
- Documentación oficial de Liquid AI para LFM2-VL-450M: https://docs.liquid.ai/lfm/models/lfm2-vl-450m
- Documentación de LFM2.5-VL-450M (versión más reciente): https://docs.liquid.ai/lfm/models/lfm25-vl-450m
- Blog de Liquid AI sobre LFM2-VL: https://www.liquid.ai/blog/lfm2-vl-efficient-vision-language-models
- Guía de inicio de SiMa.ai Neat: https://developer.sima.ai/software/getting-started/
- Tutorial de servir modelos GenAI: https://developer.sima.ai/software/tutorials/serve-genai-models
- Tutorial de ejecución de VLM: https://developer.sima.ai/software/tutorials/run-a-vlm
- Aplicación demo GenAI Multimodal Assistant: https://developer.sima.ai/examples/app/genai%2Fmultimodal-assistant

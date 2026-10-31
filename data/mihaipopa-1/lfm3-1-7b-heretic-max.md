# MihaiPopa-1/LFM3-1.7B-Heretic-Max

## Resumen

LFM3-1.7B-Heretic-Max es una versión "decensurada" (abliterada) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario MihaiPopa-1 en Hugging Face. El modelo base, LFM3-1.7B, es un modelo de lenguaje de 1,73 mil millones de parámetros orientado a agentes locales y aplicaciones especializadas, construido sobre una arquitectura tri-híbrida que combina convoluciones cortas con compuertas, atención deslizante y atención global. La variante Heretic-Max ha sido procesada con la herramienta Heretic v1.4.0 para reducir drásticamente las tasas de rechazo del modelo original: de 93/100 a 6/100 según las mediciones del autor, manteniendo una divergencia KL muy baja (0,0040) respecto al modelo original.

Su relevancia actual radica en la combinación de tres factores: un tamaño muy reducido (unos 3,5 GB en el repositorio, aproximadamente 1 GB en precisión de 4 bits), una ventana de contexto de 256K tokens y un entrenamiento post-entrenamiento orientado a agentes (Hermes Agent, Pi, OpenClaw). Esto lo hace adecuado para despliegues en dispositivos edge, teléfonos y portátiles, donde se necesite un modelo conversacional y agéntico sin las restricciones de alineación del original.

Cabe destacar que se trata de un modelo modificado por terceros, no publicado por Liquid AI, y que hereda la licencia LFM Open License v1.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1.728.801.536 (~1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (el repositorio publica safetensors en precisión original; el modelo base se puede cuantizar a 4 bits, ~1 GB) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (requiere custom_code según las etiquetas del repo) |

## Arquitectura y entrenamiento

La arquitectura tri-híbrida de LFM3 alterna tres tipos de capas: convoluciones cortas con compuertas (gated short convolutions), que procesan secuencias con coste lineal; atención con ventana deslizante (sliding-window attention), que captura dependencias locales; y atención global, que permite razonar sobre todo el contexto. Esta combinación es la que permite soportar 256K tokens de contexto en un modelo tan pequeño con un consumo de memoria contenido, siendo especialmente eficiente en inferencia en dispositivos con recursos limitados.

El modelo base fue post-entrenado (checkpoint post-trained, text-only) para uso agéntico, con soporte de tool calling y salidas estructuradas, y adaptado a entornos como Hermes Agent, Pi y OpenClaw. No se ha publicado información sobre el número de tokens de preentrenamiento ni la composición del dataset. La variante Heretic-Max no modifica el entrenamiento: aplica abliteración mediante la herramienta Heretic v1.4.0, que ajusta los pesos de los proyectos de salida de atención (o_proj) y de bajada del MLP (down_proj) según los parámetros publicados (por ejemplo, attn.o_proj.max_weight de 1,49), eliminando las direcciones de rechazo con una divergencia KL de solo 0,0040 respecto al original.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Contexto muy largo: 256K tokens de entrada + salida, útil para documentos extensos y conversaciones multi-turno.
- Capacidades agénticas: post-entrenado para harnesses de agentes (Hermes Agent, Pi, OpenClaw) con soporte de tool calling y salidas estructuradas.
- Diseñado para fine-tuning rápido en una sola GPU, adaptándolo a dominios, formatos y herramientas concretos.
- Eficiencia edge: en 4 bits ocupa aproximadamente 1 GB de memoria, ejecutable en teléfonos y portátiles.
- Versión sin restricciones de alineación: tasa de rechazo reducida de 93/100 a 6/100 (según mediciones del autor).
- No incluye capacidades de visión ni audio (es un modelo text-only).

## Casos de uso

- Agentes locales en dispositivos edge: con ~1 GB en 4 bits, se puede desplegar en teléfonos o portátiles para ejecutar agentes con tool calling sin conexión a la nube.
- Chatbots multi-turno con documentos largos: la ventana de 256K tokens permite mantener conversaciones extensas o procesar documentos completos sin truncamiento.
- Automatización de tareas con herramientas: su post-entrenamiento agéntico lo hace adecuado para pipelines con function calling y salidas estructuradas (JSON, formatos definidos).
- Investigación en alineación y abliteración: los parámetros de abliteración publicados y la baja divergencia KL lo convierten en un buen sujeto de estudio para técnicas de decensurado.
- Asistentes offline de escritorio: ideal para aplicaciones locales tipo Ollama o llama.cpp donde se priorice privacidad y latencia baja.
- Prototipado de productos especializados: el fine-tuning en una sola GPU permite adaptarlo rápidamente a dominios concretos (soporte técnico, extracción de datos, clasificación).
- Generación de texto multilingüe: soporte de 16 idiomas para aplicaciones que necesitan cubrir mercados europeos y asiáticos con un modelo ligero.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo sobre el proceso de abliteración:

| Metrica | LFM3-1.7B-Heretic-Max | LFM3-1.7B (original) |
|---|---|---|
| Divergencia KL | 0,0040 | 0 (por definición) |
| Rechazos (de 100) | 6/100 | 93/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. Para métricas del modelo base, consultar la ficha de LiquidAI/LFM3-1.7B y el blog de lanzamiento de la familia LFM3.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en precisión completa (FP16/BF16, según el tamaño del repo); ~1 GB con cuantización a 4 bits (dato del modelo base).
- Cabe sin problemas en GPUs de consumo: cualquier GPU con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente en precisión completa; con cuantización, incluso en portátiles y SoCs móviles.
- CPU: ejecutable en modo CPU con llama.cpp u Ollama dada su baja huella de memoria.
- Opciones de despliegue: transformers (con custom_code), llama.cpp (si se convierte a GGUF), Ollama, y la infraestructura de Liquid AI (API, playground). No hay datos publicados sobre vLLM o TGI para este modelo concreto.
- Latencia y throughput: no disponibles; al ser un modelo de 1,7B con capas convolucionales lineales, se espera latencia baja en hardware edge, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max | 1,73B | 256K | Tri-híbrida (conv + SWA + atención global) | LFM Open License v1.0 | Variante abliterada; tasa de rechazo 6/100 |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | Tri-híbrida | LFM Open License v1.0 | Modelo original alineado; rechazos 93/100 |
| Qwen3-1.7B | 1,7B | 32K-128K (no disponible con exactitud para esta comparación) | Transformer denso | Apache 2.0 | Competidor directo en tamaño; ecosistema más amplio |
| Llama-3.2-1B | 1,24B | 128K | Transformer denso | Llama 3.2 Community License | Menor contexto efectivo y sin entrenamiento agéntico específico |

La principal ventaja diferencial de esta variante frente a alternativas de tamaño similar es la combinación de contexto de 256K tokens, arquitectura híbrida eficiente para edge y post-entrenamiento agéntico, aunque carece de la madurez de ecosistema de Qwen o Llama.

## Limitaciones y advertencias

- Modelo abliterado: al eliminar las salvaguardas de seguridad, puede generar contenido ofensivo, peligroso o ilegal. Su uso conlleva responsabilidad legal y ética para quien lo despliegue.
- Riesgo de alucinación: inherente a cualquier LLM de 1,7B; el tamaño reducido limita la fiabilidad factual, especialmente en razonamiento complejo.
- La abliteración con divergencia KL de 0,0040 puede degradar sutilmente capacidades de seguimiento de instrucciones o seguridad en casos límite; no hay evaluaciones independientes publicadas.
- Proyecto de terceros: no cuenta con soporte oficial de Liquid AI, ni garantías de calidad, actualizaciones o compatibilidad.
- Licencia LFM Open License v1.0: no es una licencia estándar permisiva (Apache/MIT); hay que revisar sus términos para uso comercial antes de desplegar en producción.
- Modelo text-only: no soporta visión ni audio.
- Requiere custom_code en transformers, lo que implica ejecutar código del repositorio y puede complicar la compatibilidad con versiones futuras de la librería.
- Calidad en idiomas distintos del inglés puede ser inferior; el español está soportado pero no hay datos de rendimiento por idioma.

## Enlaces

- Ficha del modelo: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Proyecto Heretic: https://heretic-project.org

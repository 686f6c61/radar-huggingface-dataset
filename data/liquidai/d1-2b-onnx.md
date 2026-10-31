# LiquidAI/d1-2B-ONNX

## Resumen

d1-2B-ONNX es la versión en formato ONNX de d1-2B, un modelo multimodal (imagen-texto a texto) desarrollado por Liquid AI. Se trata de una cuantización del modelo base LiquidAI/d1-2B, perteneciente a la familia LFM3 (Liquid Foundation Models, tercera generación), diseñada para ejecutarse de forma multiplataforma mediante ONNX Runtime, lo que permite desplegarlo en CPU, GPU y entornos de borde sin depender de frameworks concretos como PyTorch.

El modelo resuelve el problema de la inferencia multimodal eficiente en dispositivos con recursos limitados: al distribuirse en ONNX con varias precisiones (q4, q8, q4f16, q8f16 y fp16), permite elegir entre huella de memoria mínima (1,94 GB en q4) y máxima fidelidad (fp16). Esto lo hace relevante para aplicaciones que necesitan comprensión de imágenes y generación de texto conversacional en local, en aplicaciones de escritorio, móviles o servidores modestos.

Soporta 16 idiomas, entre ellos el castellano, y se publica bajo una licencia propia (lfm1.0) que debe revisarse antes de cualquier despliegue comercial. El repositorio pesa 19,3 GB en total, al incluir todas las variantes de precisión del decodificador y del codificador de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: decodificador de lenguaje LFM3 + codificador de visión (LFM3-VL) |
| Parametros totales | no disponible (aprox. 2B, según la denominación del modelo) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4, q8, q4f16, q8f16, fp16 (decodificador); q8, fp16 (codificador de visión) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (other, licencia personalizada de Liquid AI) |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal de tipo vision-language (LFM3-VL): un decodificador de lenguaje basado en la familia LFM3 de Liquid AI se combina con un codificador de visión independiente. En el paquete ONNX, cada precisión del decodificador se empareja con una variante del codificador de visión: por ejemplo, el decodificador q4 se acompaña del codificador de visión en q8, mientras que las variantes q4f16, q8f16 y fp16 usan el codificador en fp16. Los detalles internos de la arquitectura del modelo base (número exacto de capas, dimensiones, mecanismo de atención) no se detallan en la model card de esta variante ONNX y deben consultarse en la ficha de LiquidAI/d1-2B.

Sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se ofrece información en la model card disponible, por lo que no se pueden aportar datos concretos. La innovación principal de esta versión no está en el entrenamiento sino en la distribución: la exportación a ONNX con múltiples niveles de cuantización permite inferencia optimizada mediante ONNX Runtime en CPU y GPU, incluyendo soporte para aceleración por DirectML y otros execution providers.

## Capacidades

- Comprensión de imágenes combinada con texto (pipeline image-text-to-text): descripción de imágenes, preguntas visuales y conversación sobre contenido visual.
- Generación de texto conversacional multi-turno.
- Soporte multilingüe en 16 idiomas, incluido el castellano, además de inglés, chino, japonés, coreano, árabe, francés, alemán, italiano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Inferencia multiplataforma mediante ONNX Runtime (CPU y GPU) sin dependencia de PyTorch.
- Selección de precisión según dispositivo: variantes orientadas a CPU (q4, q8) y a GPU (q4f16, q8f16, fp16).
- No se indica en la model card soporte explícito de tool calling, agentes, thinking mode o audio.

## Casos de uso

- Chatbots con comprensión visual en local: el modelo puede responder preguntas sobre imágenes subidas por el usuario sin enviar datos a la nube, adecuado para aplicaciones con requisitos de privacidad.
- Aplicaciones de escritorio multiplataforma: gracias a ONNX Runtime, puede integrarse en aplicaciones Windows, Linux o macOS sin instalar runtimes de ML pesados.
- Despliegue en servidores de bajo coste: la variante q4 (1,94 GB) permite servir el modelo en máquinas sin GPU dedicada, con el codificador de visión en q8.
- Moderación y análisis de contenido visual: clasificación o descripción automática de imágenes dentro de flujos de trabajo empresariales.
- Asistentes multilingües: cobertura de 16 idiomas que incluye castellano, útil para productos dirigidos a mercados europeos, asiáticos y latinoamericanos.
- Prototipado rápido de funcionalidades multimodales: la disponibilidad de varias precisiones permite iterar entre calidad (fp16) y eficiencia (q4) sin cambiar de modelo.
- Edge y dispositivos con GPU integrada: las variantes q4f16 y q8f16 están orientadas a GPU con huellas de memoria reducidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante ONNX. Los resultados del modelo base, si existen, deben consultarse en la ficha de LiquidAI/d1-2B.

## Requisitos de hardware

- Variante q4 (CPU): aproximadamente 1,94 GB de memoria; viable en equipos sin GPU dedicada.
- Variante q8 (CPU): aproximadamente 2,51 GB de memoria.
- Variante q4f16 (GPU): aproximadamente 1,95 GB de VRAM.
- Variante q8f16 (GPU): aproximadamente 2,34 GB de VRAM.
- Variante fp16 (GPU): tamaño no disponible en la información extraída; será la mayor de las variantes.
- Dado que las variantes cuantizadas ocupan menos de 3 GB, el modelo cabe con holgura en GPUs de consumo como una RTX 3060 de 12 GB, RTX 4060 u otras de 4 GB o más, e incluso en GPUs integradas modernas para las variantes más comprimidas.
- No se requieren GPUs de centro de datos (A100/H100) para inferencia; el modelo está diseñado para CPU y GPUs de consumo.
- Framework de despliegue: ONNX Runtime (librería indicada en la model card). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante ONNX.
- No hay datos publicados de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Vision | Contexto | Licencia |
|---|---|---|---|---|---|
| LiquidAI d1-2B-ONNX | ~2B | ONNX (q4/q8/fp16) | Sí | no disponible | lfm1.0 (personalizada) |
| Qwen2.5-VL-3B-Instruct | ~3B | safetensors, GGUF | Sí | 32k+ | Apache 2.0 |
| SmolVLM2-2.2B-Instruct | ~2,2B | safetensors | Sí | no disponible | Apache 2.0 |
| PaliGemma-3B | ~3B | safetensors | Sí | no disponible | Gemma (restricciones) |

d1-2B-ONNX se diferencia de las alternativas principalmente por su distribución nativa en ONNX con múltiples precisiones, lo que simplifica el despliegue multiplataforma, mientras que modelos como Qwen2.5-VL cuentan con ecosistemas de despliegue más amplios (vLLM, GGUF) y licencias más permisivas.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia personalizada ("other"): debe revisarse el texto completo antes de cualquier uso comercial, ya que puede incluir restricciones respecto a licencias estándar como Apache 2.0 o MIT.
- No se publica información sobre benchmarks, longitud de contexto exacta ni detalles de entrenamiento en esta model card, lo que dificulta la evaluación comparativa previa a la adopción.
- Al tratarse de una cuantización (q4, q8), existe una posible degradación de calidad respecto al modelo base en fp16, especialmente en tareas de razonamiento fino o texto denso en imágenes.
- Como todo modelo de lenguaje de tamaño pequeño (~2B), es susceptible de alucinaciones, especialmente en preguntas de conocimiento factual y razonamiento matemático complejo.
- El soporte multilingüe incluye el castellano, pero no se publican evaluaciones de calidad por idioma; el rendimiento en lenguas no inglesas puede ser inferior.
- El tamaño total del repositorio (19,3 GB) implica una descarga completa considerable si se quieren todas las precisiones; conviene descargar solo la variante necesaria.
- No se menciona soporte de tool calling ni de agentes, por lo que puede no ser adecuado para pipelines agénticos sin validación previa.

## Enlaces

- Ficha del modelo ONNX: https://huggingface.co/LiquidAI/d1-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de anuncio: https://www.liquid.ai/blog/open-d1

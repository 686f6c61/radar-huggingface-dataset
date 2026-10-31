# onnx-community/LFM3-1.7B-ONNX

## Resumen

LFM3-1.7B-ONNX es la versión cuantizada en formato ONNX del modelo LFM3-1.7B de Liquid AI, publicada por la comunidad onnx-community para su uso en el navegador y en entornos edge mediante Transformers.js. Se trata de un modelo de texto post-entrenado, orientado a agentes locales, tool calling y salidas estructuradas, con una ventana de contexto de 256K tokens y soporte para 16 idiomas, entre ellos el castellano.

Su rasgo más distintivo es la arquitectura tri-híbrida de Liquid AI, que combina convoluciones cortas con puertas, atención deslizante y atención global en 24 capas, permitiendo un contexto muy largo con una huella de memoria mínima: en precisión de 4 bits ocupa aproximadamente 1 GB, lo que lo hace ejecutable en cualquier teléfono o portátil. Esto lo posiciona como una opción relevante para aplicaciones de IA que deben correr íntegramente en el dispositivo del usuario, sin depender de servidores remotos.

Liquid AI lo recomienda explícitamente para agentes locales y especialización mediante fine-tuning en una sola GPU, y desaconseja su uso en programación agéntica o razonamiento multi-paso complejo debido a su tamaño reducido. La versión ONNX añade compatibilidad con WebGPU, lo que permite inferencia acelerada por GPU directamente desde JavaScript.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 convoluciones cortas con puertas, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1,73B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | q4f16 (ONNX); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | ONNX (repo de 8,1 GB) |

## Arquitectura y entrenamiento

LFM3-1.7B emplea la arquitectura tri-híbrida de Liquid AI, distribuida en 24 capas: 13 capas de convoluciones cortas con mecanismos de puerta (gated short convolutions), 5 capas de atención con ventana deslizante (sliding-window attention) y 6 capas de atención global. Esta combinación permite mantener eficiencia computacional en secuencias largas —las capas convolucionales y de ventana deslizante procesan el contexto local con coste subcuadratico— mientras las capas de atención global garantizan el acceso a todo el contexto de 256K tokens. El vocabulario es de 128.000 tokens.

El checkpoint es un modelo post-entrenado, únicamente de texto, optimizado específicamente para entornos agénticos como Hermes Agent, Pi y OpenClaw. Los detalles sobre el número de tokens de preentrenamiento, la composición del dataset y las técnicas de alineamiento (RLHF, DPO) no se han publicado en la información disponible. Liquid AI destaca además que el modelo está diseñado para ser especializado mediante fine-tuning rápido en una sola GPU.

## Capacidades

- Generacion de texto conversacional en 16 idiomas, incluido el castellano.
- Tool calling / function calling: el modelo está post-entrenado específicamente para esta capacidad.
- Generacion de salidas estructuradas (JSON y formatos definidos por el usuario).
- Ejecucion en entornos agénticos (Hermes Agent, Pi, OpenClaw) con contexto de 256K tokens para tareas multi-turno.
- Manejo de contextos muy largos gracias a su arquitectura híbrida.
- Especialización mediante fine-tuning en dominios concretos con una sola GPU.
- Inferencia en navegador con WebGPU mediante Transformers.js v4.3.2 o posterior.

No incluye capacidades de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Agentes de IA que se ejecutan localmente en el navegador: gracias a los pesos ONNX y a la cuantizacion q4f16, el modelo puede ejecutarse íntegramente en el cliente con WebGPU, sin enviar datos a servidores externos, lo que es idoneo para aplicaciones con requisitos de privacidad.
- Asistentes conversacionales multi-turno en movil o portatil: con unos 1 GB de memoria en 4 bits, cabe en cualquier telefono o portatil, y su post-entrenamiento agéntico le permite mantener conversaciones coherentes.
- Extraccion y generacion de datos estructurados: el modelo está optimizado para producir salidas estructuradas, util en formularios inteligentes, parseo de texto libre a JSON o rellenado de plantillas en aplicaciones edge.
- Tool calling en aplicaciones locales: puede integrarse con funciones definidas por el desarrollador (consultas a APIs locales, control de la interfaz, acceso a bases de datos del dispositivo) dentro de harnesses agénticos como Hermes Agent.
- Procesamiento de documentos largos en el dispositivo: la ventana de contexto de 256K tokens permite resumir o consultar documentos extensos sin infraestructura de servidor.
- Especializacion por dominio mediante fine-tuning: Liquid AI lo concibe como modelo base para adaptarlo a formatos, dominios y herramientas concretas con un entrenamiento rápido en una sola GPU, por ejemplo para asistentes verticales de empresa.
- Atencion al cliente en entornos con conectividad limitada: su naturaleza edge permite desplegar chatbots funcionales sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: aproximadamente 1 GB en precision de 4 bits (q4f16), segun la model card de Liquid AI. En precision completa no disponible.
- Diseñado para ejecutarse en telefonos y portatiles sin GPU dedicada de servidor; la variante ONNX con WebGPU aprovecha la GPU integrada del navegador.
- No requiere GPUs de centro de datos (A100, H100) para inferencia; su nicho es precisamente el edge.
- Cabe en cualquier GPU de consumo con soporte WebGPU, e incluso en CPU dada su reducida huella de memoria.
- Despliegue: via Transformers.js v4.3.2 o posterior en navegador (WebGPU). El modelo base LiquidAI/LFM3-1.7B puede desplegarse con otros runtimes, pero para esta variante ONNX no se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato edge |
|---|---|---|---|---|---|
| LFM3-1.7B (Liquid AI) | 1,73B | 256K | Tri-híbrida (conv + SWA + atención global) | LFM Open License v1.0 | ONNX (q4f16, ~1 GB) |
| Qwen3-1.7B (Alibaba) | 1,7B | No disponible en esta ficha | Transformer denso | Apache 2.0 | GGUF, safetensors |
| Gemma 3 1B (Google) | ~1B | 32K | Transformer denso | Gemma Terms of Use | GGUF, safetensors |

La principal ventaja diferencial de LFM3-1.7B frente a alternativas de tamaño similar es su ventana de contexto de 256K tokens y su arquitectura híbrida optimizada para edge, junto con el post-entrenamiento agéntico. Su licencia LFM Open License v1.0 es menos permisiva que Apache 2.0, por lo que conviene revisar sus terminos para uso comercial.

## Limitaciones y advertencias

- Liquid AI desaconseja explicitamente su uso para programacion agéntica y razonamiento multi-paso complejo debido a su tamaño de 1,73B parametros.
- Para tareas con mucho conocimiento factual, el propio fabricante recomienda combinarlo con recuperacion (RAG) o busqueda, lo que indica una limitada base de conocimiento interno y riesgo de alucinacion tipico de modelos pequenos.
- Al ser un modelo de texto, no procesa imagenes ni audio.
- La licencia LFM Open License v1.0 es una licencia personalizada ("other"); deben revisarse sus terminos antes de cualquier despliegue comercial, ya que puede incluir restricciones frente a licencias plenamente abiertas.
- La variante ONNX requiere Transformers.js v4.3.2 o posterior; versiones anteriores no son compatibles.
- El rendimiento en idiomas distintos del ingles puede ser inferior, y no se han publicado evaluaciones por idioma en la informacion disponible.
- Alucinaciones y sesgos heredados de los datos de entrenamiento: no se ha publicado informacion sobre mitigaciones especificas.

## Enlaces

- Modelo ONNX: https://huggingface.co/onnx-community/LFM3-1.7B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js

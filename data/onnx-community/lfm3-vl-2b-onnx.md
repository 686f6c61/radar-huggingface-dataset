# onnx-community/LFM3-VL-2B-ONNX

## Resumen

LFM3-VL-2B-ONNX es la versión cuantizada en formato ONNX del modelo vision-language LFM3-VL-2B de Liquid AI, publicada por onnx-community para su ejecución en navegador y dispositivos edge mediante Transformers.js. Se trata de un modelo multimodal compacto (1,92B de parámetros) que acepta texto, imágenes y vídeo como entrada, combinando el modelo lingüístico LFM3 con un codificador de visión propio de Liquid AI.

Su relevancia radica en estar diseñado específicamente para comprensión visual en dispositivo: es el primer modelo de visión de la familia LFM que procesa vídeo, incorpora un modo de razonamiento paso a paso (thinking) y soporta razonamiento espacial, útil como base para robótica. La arquitectura híbrida del lenguaje (convoluciones cortas con puertas, atención por ventana deslizante y atención global) permite una longitud de contexto de 128K tokens con una huella muy reducida.

El modelo base es LiquidAI/LFM3-VL-2B, un checkpoint post-entrenado (post-trained) con licencia LFM Open License v1.0, y soporta 16 idiomas, entre ellos el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LFM3 (13 convoluciones cortas con puertas, 5 atención por ventana deslizante, 6 atención global) + codificador de visión propio (14 capas) |
| Parametros totales | 1,92B (1,73B modelo de lenguaje + 164M codificador de visión + 25M proyector) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | 128K tokens (entrada + salida) |
| Tipos de cuantizacion | Cuantización ONNX (detalle de niveles no disponible); tamaño del repositorio: 18,6 GB |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco (16 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | ONNX (para Transformers.js); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

El componente lingüístico, LFM3, es un modelo de 24 capas con arquitectura híbrida: 13 capas de convoluciones cortas con puertas (gated short convolutions), 5 capas de atención por ventana deslizante y 6 capas de atención global. Esta combinación reduce el coste computacional de la atención manteniendo capacidad de contexto largo (128K tokens). El vocabulario es de 128.000 tokens.

El codificador de visión consta de 14 capas: 8 convoluciones 2D con puertas y profundidad (depthwise), 6 capas de atención bidireccional, y procesa parches de 16×16 con embeddings rotatorios 2D. Las entradas (texto, imágenes y vídeo) se procesan a resolución nativa: cada bloque 2×2 de parches se convierte en un token del lenguaje, y el vídeo se muestrea a 2 fps. El modelo está post-entrenado (checkpoint post-trained), aunque los datos de entrenamiento, número de tokens y técnicas de alineación (RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Comprensión visual multimodal: acepta texto, imágenes y vídeo como entrada (pipeline image-text-to-text).
- Comprensión de vídeo: primer modelo de visión de la familia LFM que procesa vídeo (muestreo a 2 fps), capaz de responder preguntas sobre grabaciones, tutoriales o cámaras en directo.
- Modo thinking: razona paso a paso antes de responder, especialmente útil en preguntas visuales complejas (matemáticas, gráficos, problemas multi-paso).
- Razonamiento espacial y embodied: localiza objetos y razona sobre sus posiciones relativas, útil como base para robótica.
- Lectura de documentos y gráficos (chart understanding).
- Generación de texto conversacional en 16 idiomas, incluido el español.
- Ejecución en navegador y edge vía Transformers.js y ONNX.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Preguntas sobre vídeo en dispositivo: un usuario graba una clase o un tutorial con el móvil y el modelo responde preguntas sobre el contenido, gracias al muestreo de vídeo a 2 fps y al contexto de 128K tokens.
- Lectura y análisis de documentos en el navegador: con Transformers.js, se puede extraer y responder sobre el contenido de documentos escaneados o capturas sin enviar datos a la nube, adecuado para aplicaciones con requisitos de privacidad.
- Interpretación de gráficos y datos: el modo thinking permite razonar sobre gráficos y tablas, útil en dashboards o herramientas de análisis embebidas.
- Asistentes visuales multimodales en apps móviles: el tamaño de 1,92B y el formato ONNX permiten integrar comprensión de imágenes y texto directamente en aplicaciones sin servidor de GPU.
- Base para robótica y agentes embodied: el razonamiento espacial sobre posiciones relativas de objetos sirve de módulo de percepción en robots o drones.
- Chatbots multilingües con entrada de imagen: soporte de 16 idiomas (incluido español) para atención al cliente con capacidad de analizar imágenes enviadas por el usuario.
- Automatización de vigilancia por cámara: análisis de clips de cámaras de seguridad respondiendo preguntas sobre lo ocurrido, procesado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al estar cuantizado en ONNX y orientado a edge, puede ejecutarse en CPU y en navegador mediante WebGPU/WASM vía Transformers.js; los requisitos exactos de VRAM no están disponibles.
- El tamaño del repositorio es de 18,6 GB, por lo que la descarga y carga en memoria requieren recursos acordes; con cuantización, la huella en RAM/VRAM sería menor.
- No requiere GPU dedicada para su caso de uso principal (edge/navegador); para inferencia más rápida en servidor, cualquier GPU moderna con soporte ONNX Runtime (por ejemplo, NVIDIA con CUDA) es adecuada; recomendaciones concretas de modelo de GPU: no disponible.
- En GPUs de consumo: viable dado el tamaño de 2B, aunque las cifras exactas de VRAM según cuantización no están disponibles.
- Opciones de despliegue: Transformers.js (navegador), ONNX Runtime (local y servidor); compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (el formato ONNX no es el nativo de esas herramientas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato edge | Licencia |
|---|---|---|---|---|---|
| LFM3-VL-2B (ONNX) | 1,92B | 128K | Imagen + vídeo | ONNX / Transformers.js | LFM Open License v1.0 |
| Qwen2.5-VL-3B-Instruct | 3B | 128K (aprox.) | Imagen + vídeo | GGUF / safetensors | Apache 2.0 (base) |
| SmolVLM2 2.2B (Hugging Face) | 2,2B | 16K aprox. | Imagen + vídeo | safetensors | Apache 2.0 |

Nota: los datos de los modelos comparables son aproximados y pueden variar; la ventaja diferencial de LFM3-VL-2B es su arquitectura híbrida optimizada para edge y el soporte nativo ONNX para navegador.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 es una licencia personalizada ("other"): debe revisarse el texto para confirmar los términos de uso comercial antes de desplegar en producción.
- No hay benchmarks públicos en la información proporcionada, por lo que no es posible verificar su rendimiento frente a competidores.
- Al ser un modelo de 2B, sus capacidades de razonamiento profundo y generación de texto son limitadas frente a modelos mayores; el modo thinking mitiga parcialmente esta carencia en tareas visuales complejas.
- El vídeo se muestrea a 2 fps, lo que puede perder detalles en escenas de movimiento rápido.
- Riesgo de alucinación en la descripción de imágenes y vídeo, habitual en modelos vision-language pequeños.
- El formato ONNX está orientado a Transformers.js y ONNX Runtime; no es directamente compatible con herramientas como llama.cpp, vLLM u Ollama; para esos entornos debe usarse el modelo base LiquidAI/LFM3-VL-2B.
- Sesgos conocidos: no disponibles en la información proporcionada, aunque deben asumirse los sesgos típicos de datos de entrenamiento multimodales a gran escala.

## Enlaces

- Modelo ONNX: https://huggingface.co/onnx-community/LFM3-VL-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo de lenguaje base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard

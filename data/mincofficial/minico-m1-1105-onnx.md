# Mincofficial/Minico-M1-1105-ONNX

## Resumen

Minico M1 1105 ONNX es la versión exportada a formato ONNX del modelo Minico M1 1105, un modelo de razonamiento de 350 millones de parámetros desarrollado por Mincofficial. Se trata de un fine-tuning del modelo LFM2.5-350M de Liquid AI, al que se ha sometido a un proceso de SFT, DPO y GRPO, además de fusionado de pesos, para dotarlo de cinco niveles de esfuerzo de razonamiento (`off`, `low`, `medium`, `high`, `max`) configurables a través de la plantilla de chat.

La relevancia de esta versión concreta radica en su orientación a la inferencia en el navegador y en dispositivos locales: los pesos están exportados en ONNX Runtime y empaquetados para Transformers.js, con soporte de WebGPU, lo que permite ejecutar el modelo íntegramente en el cliente sin enviar datos a ningún servidor. El repositorio ocupa 2,3 GB e incluye tres builds con distintos niveles de cuantización (q8, q4 y fp32).

El modelo está pensado para tareas conversacionales y de razonamiento de propósito general en inglés, con un tamaño lo bastante reducido como para caber en GPUs de consumo e incluso ejecutarse en el navegador mediante WebGPU o, en su defecto, WebAssembly.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM2.5-350M, familia LFM2) |
| Parámetros totales | 350M |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8 (8 bits, 510 MB), q4 (4 bits, 294 MB), fp32 (1.451 MB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | ONNX (MatMulNBits en bloques de 32; GatherBlockQuantized para embeddings en q8/q4) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de LFM2.5-350M de Liquid AI, un transformer de 350M de parámetros. Minicofficial obtuvo los pesos mediante un proceso de ajuste fino que combina SFT (supervised fine-tuning), DPO (direct preference optimization) y GRPO (group relative policy optimization), seguido de fusionado de pesos. El resultado es un modelo conversacional con modos de razonamiento explícito graduables.

La exportación a ONNX reutiliza el grafo publicado por Liquid AI para LFM2.5-350M-ONNX, sustituyendo los pesos por los del modelo Minico. Las builds q8 y q4 cuantizan únicamente los pesos, en bloques de 32, empleando MatMulNBits y GatherBlockQuantized para la capa de embeddings, con el mismo diseño que la build q4 oficial de Liquid AI. El autor verificó la salida generada token a token contra el modelo en PyTorch: la build q8 alcanza un 94,9% de coincidencia en la elección top-1 (6 prompts, 433 tokens, ONNX Runtime 1.31 en CPU) y la fp32 un 95,2%, siendo esta última inferior al 100% por diferencias de coma flotante entre runtimes.

El rasgo técnico más destacable es el sistema de niveles de esfuerzo de razonamiento, controlado mediante el parámetro `reasoning_effort` de la plantilla de chat. Cada nivel preasigna un bloque de pensamiento de distinta longitud y un límite de tokens generados recomendado: `off` (1024 tokens, sin pensamiento), `low` (640), `medium` (1152), `high` (2368, valor por defecto desde el 8 de noviembre de 2026) y `max` (4608). La plantilla acepta además alias (`none`, `minimal`, `xhigh`) y `enable_thinking=False` como equivalente a `off`.

## Capacidades

- Generación de texto conversacional en inglés con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento explícito con cinco niveles de esfuerzo configurables (`off`, `low`, `medium`, `high`, `max`), que ajustan la profundidad del bloque de pensamiento.
- Razonamiento matemático básico y resolución de problemas aritméticos sencillos (el ejemplo de la model card resuelve un cálculo de descuento).
- Ejecución en navegador mediante Transformers.js con WebGPU (Chrome y Edge 113 o superior, Safari 26) o, en su defecto, WebAssembly.
- Inferencia local en el dispositivo sin transmisión de datos a servidores externos.
- Compatibilidad con ONNX Runtime para despliegue fuera del navegador.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Asistente conversacional embebido en aplicaciones web**: el modelo puede integrarse con Transformers.js y ejecutarse en el navegador del usuario mediante WebGPU, de modo que las conversaciones nunca salen del dispositivo. Es adecuado por su tamaño reducido (510 MB en q8) y su API de chat template.
- **Procesamiento de datos sensibles en el cliente**: en escenarios con requisitos de privacidad (sanidad, finanzas personales, documentación interna), la inferencia local elimina la necesidad de enviar texto a una API externa. La build q8 ofrece un equilibrio razonable entre tamaño y fidelidad (94,9% de coincidencia con PyTorch).
- **Aplicaciones de escritorio o extensiones sin backend**: al distribuirse en ONNX, puede ejecutarse con ONNX Runtime en aplicaciones Electron, extensiones de navegador o herramientas de línea de comandos, sin depender de infraestructura de servidor.
- **Tutor o asistente educativo con razonamiento graduable**: el nivel `high` o `max` permite obtener explicaciones paso a paso en problemas matemáticos o lógicos, mientras que `off` o `low` sirven para respuestas rápidas en interacciones simples.
- **Prototipado rápido de funcionalidades de IA generativa**: un equipo puede validar una idea de producto con IA conversacional sin aprovisionar GPUs ni contratar APIs, usando la demo pública o la build q4 (294 MB) para minimizar la descarga.
- **Sistemas de ayuda contextual en páginas web**: la ventana de chat puede ofrecer respuestas inmediatas sobre el contenido de la propia página, con latencia dependiente del hardware del cliente y sin coste de inferencia en servidor.
- **Filtrado o clasificación de texto ligera en el borde**: con el modo `off`, el modelo responde sin bloque de pensamiento, lo que reduce la latencia y el consumo de tokens en tareas de generación corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio principal (`Mincofficial/Minico-M1-1105`) para consultar benchmarks, pero no incluye cifras en esta versión. El único dato cuantitativo publicado es la tasa de coincidencia de las builds ONNX con la salida greedy del modelo en PyTorch:

| Build | dtype | Tamaño | Coincidencia top-1 con PyTorch |
|---|---|---|---|
| `onnx/model_quantized.onnx` | q8 | 510 MB | 94,9% |
| `onnx/model_q4.onnx` | q4 | 294 MB | 88,0% |
| `onnx/model.onnx` | fp32 | 1.451 MB | 95,2% |

Medición sobre 6 prompts y 433 tokens con ONNX Runtime 1.31 en CPU.

## Requisitos de hardware

- **VRAM estimada**: la build q8 (510 MB de pesos) requiere aproximadamente 1-1,5 GB de VRAM o memoria unificada en la práctica, considerando pesos, caché KV y overhead del runtime; la q4 (294 MB) baja de 1 GB; la fp32 (1,45 GB) requiere en torno a 2-2,5 GB.
- **GPU recomendadas**: cualquier GPU integrada o dedicada con soporte de WebGPU sirve para la build q8; para inferencia con ONNX Runtime en servidor, GPUs de consumo como RTX 3060/4060 o superiores son más que suficientes dado el tamaño del modelo.
- **GPU de consumo**: sí cabe con holgura en cualquier GPU de consumo moderna, incluidas las integradas de portátiles, especialmente con la build q4.
- **Opciones de despliegue**: Transformers.js con `device: "webgpu"` o `device: "wasm"` en el navegador; ONNX Runtime en aplicaciones nativas; la model card no menciona soporte de vLLM, llama.cpp, Ollama ni TGI para esta build.
- **Latencia y throughput**: no disponibles. La model card advierte que WebAssembly es "mucho más lento" que WebGPU, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Minico M1 1105 ONNX | 350M | no disponible | en | LFM Open License v1.0 | ONNX, Transformers.js, WebGPU |
| LiquidAI/LFM2.5-350M | 350M | no disponible | no disponible | LFM Open License v1.0 (modelo base) | safetensors, ONNX (build oficial) |
| Mincofficial/Minico-M1-1105 | 350M | no disponible | en | LFM Open License v1.0 | PyTorch (modelo base del que deriva esta build) |

La comparación más directa es con LFM2.5-350M de Liquid AI, del que este modelo hereda arquitectura y grafo ONNX, y con la versión PyTorch de Minico M1 1105, de la que esta build es una cuantización. No se dispone de datos de benchmarks para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado y probablemente degrade la calidad.
- **Licencia**: se distribuye bajo LFM Open License v1.0. El uso comercial está permitido solo para organizaciones por debajo del umbral de ingresos definido en la licencia; es imprescindible leerla antes de un uso comercial.
- **Atribución obligatoria**: al ser una versión modificada de LFM2.5-350M, deben conservarse los avisos de atribución del modelo base incluidos en `LICENSE`.
- **Fidelidad de la cuantización**: la build q4 solo coincide con la salida de PyTorch en el 88,0% de los tokens top-1, lo que puede introducir degradaciones notables en tareas sensibles; se recomienda q8 salvo que el tamaño de descarga sea prioritario.
- **Riesgo de alucinación**: no se han publicado evaluaciones de veracidad ni de sesgos; como modelo de 350M, es esperable una tasa de alucinación superior a la de modelos de mayor tamaño.
- **Gestión del esfuerzo de razonamiento**: no se recomienda cambiar el nivel de esfuerzo ni activar o desactivar el pensamiento a mitad de una conversación; el modelo fue entrenado con una configuración fija por chat, por lo que debe iniciarse una conversación nueva para cambiarla.
- **Compatibilidad del navegador**: WebGPU requiere Chrome o Edge 113 o superior, o Safari 26; en navegadores sin soporte la inferencia cae a WebAssembly, considerablemente más lenta.
- **Contexto**: no se ha publicado la longitud máxima de contexto, lo que dificulta planificar aplicaciones con conversaciones largas o documentos extensos.
- **Madurez**: el repositorio tiene 674 descargas y 0 likes en el momento de la consulta, y el modelo se creó el 5 de noviembre de 2026, por lo que la validación comunitaria es muy limitada.

## Enlaces

- [Minicofficial/Minico-M1-1105-ONNX en Hugging Face](https://huggingface.co/Mincofficial/Minico-M1-1105-ONNX)
- [Mincofficial/Minico-M1-1105 (modelo base en PyTorch)](https://huggingface.co/Mincofficial/Minico-M1-1105)
- [LiquidAI/LFM2.5-350M (modelo original)](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [LiquidAI/LFM2.5-350M-ONNX (grafo ONNX de referencia)](https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX)
- [Documentación de Transformers.js](https://huggingface.co/docs/transformers.js)
- [Demo en navegador](https://minico.mincoffical.codes/try/)

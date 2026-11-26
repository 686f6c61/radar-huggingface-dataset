# linoyts/RD-Flow-64-ONNX

## Resumen

RD-Flow-64-ONNX es la exportación a formato ONNX del modelo de difusión RD Flow 64, desarrollado por Retro Diffusion (Astropulse, LLC), orientado a la generación de pixel art de 64 x 64 píxeles a partir de descripciones textuales. Esta versión concreta, publicada por el usuario linoyts, está pensada para ejecutarse en el navegador mediante ONNX Runtime Web con el backend WebGPU, lo que permite inferencia local en el cliente sin servidores dedicados. El modelo base es un text-to-image de 271 millones de parámetros que genera sprites y escenas con una paleta de color real, no una simple rejilla de colores arbitrarios.

La relevancia de esta ficha radica en su enfoque de despliegue: frente a los grandes modelos de difusión que requieren GPUs de centro de datos, aquí se opta por un pipeline compacto (0,54 GB el modelo de dibujo, unos 3,4 GB el codificador de texto cuantizado a int8) que cabe en memoria de navegador y aprovecha WebGPU. El codificador de texto es una porción de Qwen3-VL-4B-Instruct (capas 0-26, embeddings y normalización final), cuantizada a int8, mientras que el modelo de dibujo conserva precisión fp16 en pesos y fp32 en cómputo.

El modelo es de uso no comercial según la RD Flow 64 Model License, y prohíbe entrenar con sus salidas. Su utilidad práctica se concentra en herramientas creativas web, prototipado de videojuegos y generación de assets de pixel art en tiempo real, no en producción comercial de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow matching) para text-to-image, con cabezas de predicción de imagen y de puntero de paleta; codificador de texto transformer (Qwen3-VL-4B, capas 0-26) |
| Parametros totales | 271 M (modelo de dibujo); codificador de texto: porción de Qwen3-VL-4B (capas 0-26 + embeddings + norm final) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de prompt (tokenización cruda, sin plantilla de chat ni tokens especiales) |
| Tipos de cuantizacion | Modelo de dibujo: fp16 pesos / fp32 cómputo. Codificador de texto: int8 (MatMulNBits, bloque 32, simétrico; embeddings GatherBlockQuantized bloque 128), activaciones fp16. Salida de features redondeada a bf16 |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizador de Qwen; no se documentan idiomas) |
| Licencia | RD Flow 64 Model License (no comercial, prohibido entrenar con las salidas); codificador de texto Qwen3-VL-4B bajo Apache 2.0 |
| Formato de pesos | ONNX (opset 17), con ficheros `_data` externos y grafos separados por capa para el codificador de texto |

## Arquitectura y entrenamiento

El modelo de dibujo sigue un esquema de flow matching con muestreo Euler de 16 pasos (shift 3), classifier-free guidance de 4 sobre t en [0, 0,9] y self-conditioning. A partir de t = 0,6 se extrae una paleta de la predicción; desde t = 0,35 la cabeza de puntero selecciona una ranura de paleta por píxel y los píxeles se fijan cuando la confianza es suficiente. El resultado se decodifica a RGBA a través de la paleta. La exportación reescribió el forward pass para permitir la exportación (tablas rope precalculadas, rope identidad para tokens fuera de rejilla, enmascaramiento de ranuras de paleta mediante una entrada), sin cambiar las matemáticas.

El codificador de texto es una porción de Qwen3-VL-4B-Instruct: se conservan los embeddings de tokens, las capas 0-26 (atención causal, rope theta 5e6) y la normalización final con la normalización RMS sin pesos propia de RD Flow. El prompt se tokeniza en crudo (máximo 512 tokens) y las features se redondean a bf16, igual que en el pipeline original. No hay fine-tuning ni cambios de pesos respecto al modelo base; solo conversión a ONNX y cuantización a int8 del codificador. No se documentan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de imágenes de pixel art de 64 x 64 píxeles a partir de texto, con sprites y escenas.
- Uso de una paleta de color real extraída durante el muestreo, con asignación de ranuras por píxel y commit progresivo.
- Inferencia en navegador mediante ONNX Runtime Web y WebGPU, con el muestreador, la extracción de paleta y el ruido aleatorio compatible con torch portados a JavaScript (`rdflow.js`).
- Procesamiento de prompts de hasta 512 tokens con tokenización cruda, sin plantilla de chat.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Herramientas creativas web en el navegador: el modelo se ejecuta con ONNX Runtime Web sobre WebGPU, de modo que un editor de sprites puede ofrecer generación de pixel art sin backend, aprovechando el pipeline JS incluido en la demo.
- Prototipado rápido de assets para videojuegos: generación de sprites de 64 x 64 con paleta coherente, útil para iterar sobre estilos visuales antes de encargar arte final.
- Generación de escenas de pixel art para demos y game jams: el modelo dibuja escenas además de sprites, con 16 pasos Euler y CFG 4, un coste de muestreo bajo para un modelo de 271 M.
- Aplicaciones educativas y de demostración de difusión en el cliente: el código JS del muestreador y la paleta sirve para ilustrar flow matching y decodificación por paleta en un navegador.
- Herramientas de accesibilidad sin GPU de servidor: al caber en memoria de navegador con WebGPU, permite generar imágenes en equipos de usuario final sin infraestructura dedicada.
- Investigación sobre cuantización int8 en codificadores de texto: el export documenta errores relativos de 1,2-1,5 % frente a fp32 en las features, útil para estudiar el impacto de la cuantización en pipelines de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de la exportación:

| Metrica | Resultado |
|---|---|
| Diferencia relativa modelo de dibujo ONNX vs PyTorch fp32 | ~1e-5 |
| Coincidencia de ranura de paleta por píxel (JS sampler con features de referencia) | 99,4 % a 100 % |
| Error relativo de features del codificador int8 vs fp32 | 1,2 % a 1,5 % (bf16 del pipeline oficial: ~1,4 %) |

## Requisitos de hardware

- VRAM estimada: el modelo de dibujo ocupa 0,54 GB (fp16); el codificador de texto int8 suma unos 3,4 GB (27 capas x 0,11 GB + embeddings 0,40 GB + norm final). El repo completo pesa 3,8 GB.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el despliegue en navegador; para ejecución nativa con ONNX Runtime, GPUs consumer recientes son suficientes dado el tamaño del modelo.
- Cabe en GPU consumer: sí, por el tamaño del modelo (271 M de parámetros en el modelo de dibujo), aunque el codificador int8 eleva el requisito de memoria.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (diseño principal, demo en Spaces), ONNX Runtime nativo; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el muestreo usa 16 pasos Euler con CFG 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RD-Flow-64-ONNX (esta ficha) | 271 M (dibujo) + porción Qwen3-VL-4B | 512 tokens | Pixel art 64x64, ONNX/WebGPU | No comercial (RD Flow 64 Model License) | Hugging Face, demo en Spaces |
| Retro-Diffusion/rd-flow-64 | 271 M | 512 tokens | Pixel art 64x64, PyTorch | RD Flow 64 Model License | Hugging Face |
| Qwen3-VL-4B-Instruct | 4 B | no disponible | Modelo multimodal de texto/visión (aquí solo como codificador) | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no comercial: la RD Flow 64 Model License prohíbe el uso comercial del modelo y el entrenamiento con sus salidas; para uso comercial hay que generar con Retro Diffusion.
- Las imágenes generadas no son idénticas píxel a píxel a las del pipeline oficial de PyTorch para la misma semilla, debido a los pequeños cambios en las features del codificador int8.
- Contexto de prompt limitado a 512 tokens con tokenización cruda, sin plantilla de chat ni tokens especiales.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de generación de imágenes, los sesgos se manifestarían en el contenido visual.
- El modelo base está pensado para pixel art de 64 x 64; no se documenta soporte para otras resoluciones.
- Dependencia de WebGPU para el despliegue en navegador, lo que limita la compatibilidad a navegadores y GPUs con ese backend.

## Enlaces

- Hugging Face: https://huggingface.co/linoyts/RD-Flow-64-ONNX
- Modelo base: https://huggingface.co/Retro-Diffusion/rd-flow-64
- Demo WebGPU: https://huggingface.co/spaces/linoyts/RD-Flow-64-WebGPU
- Retro Diffusion: https://retrodiffusion.ai
- Codificador de texto (Qwen3-VL-4B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Licencia: `LICENSE.md` en el repositorio del modelo

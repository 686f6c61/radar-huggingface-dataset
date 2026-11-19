# sebekblessing/qwen-image-2.1-gpu

## Resumen

Qwen-Image 2.1 Turbo para chips gráficos de teléfono es un empaquetado del modelo de generación de imágenes Qwen-Image 2.1 Turbo, adaptado por el usuario sebekblessing para ejecutarse en la GPU integrada de un móvil mediante el motor Anima GPU Engine y OpenCL estándar. No se trata de un modelo nuevo ni de un entrenamiento propio: es una conversión de pesos a 4 bits en un formato GGUF específico del motor, no compatible con llama.cpp ni ComfyUI.

El paquete contiene únicamente el modelo de difusión cuantizado (`qwen_q4.gguf`), el decodificador de imagen TAE (`tae_qwen.gguf`) y los 8 niveles de ruido (`sigmas.txt`). El lector de prompts (Qwen3-VL-8B) no se incluye y debe obtenerse del paquete hermano `qwen-image-2.1-qnn-8elite`. El autor advierte que la app Anima todavía no usa esta ruta para Qwen-Image.

Su relevancia es experimental: demuestra que un modelo de difusión de casi 3.800 millones de parámetros puede empaquetarse para inferencia en GPU móvil vía OpenCL, aunque con licencia exclusivamente no comercial (Qwen Research License) y sin métricas publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image (Qwen-Image 2.1 Turbo), empaquetado para el motor Anima GPU Engine; detalles internos de la arquitectura base no disponibles |
| Parámetros totales | 3.827.838.976 (dato safetensors del repo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits (una escala por cada 32 entradas); el script `build/pack_qwen.py` permite generar también una versión de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License Agreement (uso exclusivamente no comercial) |
| Formato de pesos | GGUF en disposición propia del motor Anima (no compatible con llama.cpp ni ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen-Image 2.1 Turbo, un modelo de difusión para generación de imágenes a partir de texto desarrollado por Qwen. Este repositorio no incluye información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF o DPO; esos datos corresponden a la model card original de Qwen, no disponible en la información proporcionada.

La contribución técnica de este empaquetado es la conversión: los scripts `build/pack_qwen.py` y `build/pack_tae.py` transforman los pesos al diseño de memoria del motor Anima, con cuantización de 4 bits (una escala por bloque de 32 entradas) y lectura bloque a bloque durante la generación. Se incluye además un decodificador de imagen ligero (TAE, variante `taeqi2_1`) que sustituye al VAE completo para reducir requisitos de memoria en el dispositivo. La inferencia se ejecuta con OpenCL estándar sobre la GPU del teléfono.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Inferencia en GPU móvil mediante OpenCL, sin necesidad de NPU dedicada.
- Decodificación de imagen con el decodificador TAE incluido, orientado a bajo consumo de memoria.
- Control de muestreo mediante los 8 niveles de ruido predefinidos en `sigmas.txt`.
- Lectura de prompts delegada a Qwen3-VL-8B (no incluido en este repositorio).
- Soporte de tool calling, agentes, razonamiento multi-paso, visión de entrada o audio: no disponible / no aplica.

## Casos de uso

- Prototipado de generación de imágenes en Android: integración del GGUF en el motor Anima GPU Engine para validar la ruta OpenCL en teléfonos sin chip Snapdragon AI, usando el paquete `qwen-image-2.1-qnn-8elite` como referencia para el lector de prompts.
- Investigación sobre cuantización extrema en difusión: análisis del impacto de 4 bits con una escala por cada 32 entradas en la calidad de imagen, comparando con la versión de 8 bits generada por `pack_qwen.py`.
- Desarrollo de motores de inferencia móvil: servir como caso de prueba de lectura bloque a bloque de pesos GGUF personalizados y del decodificador TAE en dispositivos con memoria limitada.
- Evaluación de latencia en GPU integrada: medir tiempos de generación por imagen en teléfonos compatibles con OpenCL para decidir la viabilidad de funciones de edición de imagen en local.
- Demostraciones offline de text-to-image: escenarios sin conectividad donde se requiera generar imágenes en el propio dispositivo, aceptando la licencia no comercial.
- Estudio de formatos de empaquetado: reutilizar los scripts de conversión como plantilla para portar otros modelos de difusión al layout del motor Anima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 4,6 GB y el modelo de difusión se sirve en 4 bits leyendo un bloque a la vez, lo que reduce el pico de memoria frente a una carga completa.
- Hardware objetivo: GPU integrada de teléfono con soporte OpenCL estándar; el autor indica que en Snapdragon 8 Elite debe usarse la variante `qwen-image-2.1-qnn-8elite`.
- GPU de escritorio: no se documenta soporte; el formato GGUF es propio del motor Anima y no carga en llama.cpp ni ComfyUI.
- Cabe en GPU consumer: no disponible (el destino declarado es móvil, no escritorio).
- Opciones de despliegue: Anima GPU Engine (app Anima); no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sebekblessing/qwen-image-2.1-gpu (este) | 3.827.838.976 | No disponible | GGUF propio de Anima, 4 bits | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| qwen-image-2.1-qnn-8elite | No disponible | No disponible | No disponible (ruta QNN para Snapdragon 8 Elite) | Qwen Research (no comercial) | Hugging Face, referenciado por el autor |
| Qwen/Qwen-Image-2.1 | No disponible | No disponible | No disponible | No disponible | Hugging Face, referenciado por el autor |

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso exclusivamente no comercial; revisar `LICENSE` y `NOTICE` antes de cualquier despliegue en producto.
- La app Anima todavía no utiliza esta ruta para Qwen-Image; el paquete se publica de forma anticipada y puede no ser funcional de extremo a extremo.
- El lector de prompts (Qwen3-VL-8B) no está incluido; sin él no hay generación completa.
- El formato GGUF es específico del motor Anima: no es cargable en llama.cpp, ComfyUI ni otras herramientas estándar.
- Cuantización de 4 bits con una sola escala por bloque de 32 entradas: degradación de calidad esperable frente a los pesos originales, sin métricas publicadas que la cuantifiquen.
- Sin información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base.
- Repositorio sin descargas ni valoraciones, creado y actualizado el mismo día: madurez y mantenimiento no verificables.
- Sin benchmarks ni datos de latencia: no hay base para estimar rendimiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/qwen-image-2.1-gpu
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Variante para Snapdragon 8 Elite: `qwen-image-2.1-qnn-8elite` (referenciada en la model card)
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine

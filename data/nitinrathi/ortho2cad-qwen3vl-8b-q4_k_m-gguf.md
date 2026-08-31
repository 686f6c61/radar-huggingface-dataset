# nitinrathi/Ortho2CAD-Qwen3VL-8B-Q4_K_M-GGUF

## Resumen

Ortho2CAD es un modelo de visión-lenguaje (VLM) desarrollado por nishl19 y convertido a formato GGUF por nitinrathi. Su función principal es traducir dibujos ortográficos rasterizados (planos 2D técnicos) en código CadQuery, un lenguaje de programación para modelado CAD paramétrico. Está basado en Qwen3-VL-8B-Instruct, un modelo multimodal de 8.000 millones de parámetros con arquitectura transformer y codificador de visión. El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset DeepCAD, que contiene pares de dibujos ortográficos y sus correspondientes códigos CadQuery, según se describe en el paper de arxiv (2607.08891). La versión GGUF Q4_K_M reduce el tamaño a 5 GB, lo que permite su ejecución en hardware de consumo medio.

Este modelo aborda un problema concreto en el diseño industrial: la conversión automática de planos 2D a modelos 3D paramétricos, un proceso que tradicionalmente requiere intervención manual. Su relevancia radica en combinar capacidades de visión por computador con generación de código estructurado, ofreciendo una solución práctica para automatizar flujos de trabajo en CAD. La cuantización Q4_K_M facilita el despliegue en entornos con recursos limitados mediante llama.cpp, aunque se desconoce la licencia exacta del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con vision encoder) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-VL soporta hasta 32.768 tokens, no confirmado para esta variante) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

Ortho2CAD se construye sobre Qwen3-VL-8B-Instruct, un modelo multimodal que combina un codificador de visión (Vision Transformer) con un decoder transformer de lenguaje. El modelo procesa imágenes de dibujos ortográficos y genera texto, específicamente código CadQuery. El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset DeepCAD, que contiene pares de dibujos ortográficos rasterizados y sus correspondientes códigos CadQuery. Según el paper, el entrenamiento tomó 11 horas en 4 GPUs H100. No se menciona el uso de RLHF o DPO. La conversión a GGUF se realizó con llama.cpp, manteniendo la arquitectura original pero cuantizando los pesos a 4 bits (Q4_K_M), lo que reduce el tamaño y acelera la inferencia en CPUs y GPUs.

## Capacidades

- Generación de código CadQuery a partir de imágenes de dibujos ortográficos (vistas 2D de piezas mecánicas).
- Comprensión de imágenes: detecta formas, dimensiones y relaciones geométricas en planos técnicos.
- Salida de texto estructurado: genera código Python/CadQuery listo para ejecutar y generar modelos 3D.
- Capacidades heredadas de Qwen3-VL: razonamiento visual general, respuesta a preguntas sobre imágenes, OCR, etc. (aunque el fine-tuning puede haberlas reducido).

## Casos de uso

- Automatización de diseño CAD: convertir planos 2D existentes en modelos 3D paramétricos sin intervención manual, acelerando el proceso de ingeniería inversa.
- Integración en pipelines de manufactura: generar código CadQuery a partir de dibujos técnicos escaneados para alimentar máquinas de control numérico o impresoras 3D.
- Asistente para diseñadores: ayudar a ingenieros a crear modelos 3D a partir de bocetos o planos digitalizados, reduciendo errores de interpretación.
- Documentación técnica: transformar planos en papel a representaciones 3D interactivas para manuales o catálogos.
- Validación de diseños: comparar el modelo 3D generado con el dibujo original para detectar discrepancias o errores de dimensionamiento.
- Educación y formación: servir como herramienta didáctica para enseñar modelado paramétrico a partir de planos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de arxiv (2607.08891) reporta comparaciones con otros métodos, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M pesa 5.0 GB, por lo que se requieren al menos 6 GB de VRAM para cargar el modelo en GPU. En CPU, se necesita al menos 8 GB de RAM.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 2070, o superiores. También puede ejecutarse en GPUs de datacenter como A10 o A100.
- Compatibilidad con consumer GPU: sí, en GPUs de gama media con 8 GB o más.
- Opciones de despliegue: llama.cpp (CLI o servidor), llama-server, o cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, etc.).
- Latencia y throughput: no disponibles. Depende del hardware y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Ortho2CAD (este) | 8.19B | no disponible | no disponible | GGUF (Q4_K_M) | Generación de código CAD desde dibujos 2D |
| Qwen3-VL-8B-Instruct | 8.19B | 32K (aprox.) | Apache 2.0 | safetensors, GGUF | VLM general (visión + lenguaje) |
| LLaVA-1.6-8B | 7.6B | 4K | Apache 2.0 | safetensors | VLM general (visión + lenguaje) |

Nota: Ortho2CAD es un fine-tuning específico de Qwen3-VL, por lo que su rendimiento en tareas CAD es superior al modelo base, pero pierde capacidades generales. La comparativa se basa en características generales; no hay datos de rendimiento disponibles.

## Limitaciones y advertencias

- El modelo está especializado en dibujos ortográficos técnicos; su rendimiento en otros tipos de imágenes o tareas de visión general puede ser limitado.
- Riesgo de alucinación en la generación de código: puede producir código CadQuery sintácticamente válido pero geométricamente incorrecto si el dibujo de entrada es ambiguo o complejo.
- La licencia no está especificada en la información disponible; se recomienda contactar con el autor original (nishl19) antes de usar comercialmente.
- El contexto máximo no está confirmado; para conversaciones largas o múltiples imágenes, se debe verificar la memoria disponible.
- La cuantización Q4_K_M puede degradar ligeramente la precisión en comparación con el modelo completo en safetensors.
- No se han publicado evaluaciones exhaustivas de sesgos o comportamientos adversos.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/nitinrathi/Ortho2CAD-Qwen3VL-8B-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/nishl19/Ortho2CAD-Qwen3VL-8B
- Paper de Ortho2CAD: https://arxiv.org/html/2607.08891
- GGUF de Qwen3-VL-8B-Instruct (referencia): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF

# Hansda/RD-Flow-64-INT8-ONNX

## Resumen

RD Flow 64 INT8 ONNX es una versión cuantizada a INT8 y exportada a ONNX del modelo de generación de imágenes Retro-Diffusion/rd-flow-64, desarrollado por Retro Diffusion. El modelo original está especializado en la generación de sprites de pixel art de 64 × 64 píxeles con canal alfa (RGBA), es decir, con fondo transparente. Esta release, publicada por el usuario Hansda, no modifica el modelo base: se limita a aplicar cuantización de pesos de 8 bits sobre el grafo de dibujo y a empaquetarlo junto con el lector de prompts y el tokenizador para su ejecución en CPU mediante ONNX Runtime.

La relevancia de esta variante radica en su orientación a inferencia en CPU sin GPU. El grafo de dibujo pasa de 545,5 MB en el baseline ONNX publicado a 322,3 MB, y el paquete completo de 3,85 GB a 3,62 GB. Esto permite desplegar generación de sprites en entornos sin acelerador dedicado, con un consumo de memoria pico inferior al del baseline según las pruebas del autor.

El modelo emplea un lector de prompts basado en Qwen (con licencia Apache-2.0) y un grafo de dibujo con cuantización por bloques de 8 bits sobre 121 MatMuls de pesos constantes. La licencia del modelo de dibujo es no comercial, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (flow) para generación de imágenes, con lector de prompts basado en Qwen y grafo de dibujo exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 con cuantización por bloques (weight-only) en el grafo de dibujo; lector de prompts en INT8 |
| Idiomas soportados | no disponible |
| Licencia | rd-flow-64-model-license (no comercial para los pesos de dibujo); lector de prompts y tokenizador Apache-2.0; runtime del sampler MIT |
| Formato de pesos | ONNX (grafo de dibujo con pesos externos) + tokenizador |
| Resolución de salida | 64 × 64 píxeles, RGBA (fondo transparente) |
| Tamaño del grafo de dibujo | 322,3 MB (frente a 545,5 MB del baseline) |
| Tamaño del paquete completo | 3,62 GB (frente a 3,85 GB del baseline) |
| Modelo base | Retro-Diffusion/rd-flow-64 |

## Arquitectura y entrenamiento

El modelo base es un modelo de difusión (flow) especializado en pixel art, del que esta release conserva la arquitectura y los pesos, aplicando únicamente cuantización. El paquete incluye tres componentes diferenciados: un lector de prompts (prompt reader) de 27 capas basado en Qwen, el tokenizador asociado y el grafo de dibujo (drawing graph) con sus pesos externos. La cuantización INT8 se aplica de forma selectiva: 121 MatMuls de pesos constantes del grafo de dibujo usan cuantización por bloques de 8 bits, mientras que el resto de operaciones del dibujo mantienen la precisión del baseline.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. El muestreador original de dibujo se utiliza con enmascaramiento explícito para las entradas de paleta no usadas, y el lector de prompts es idéntico al de la release ONNX de linoyts. El autor declara validación con el mismo prompt y semilla generando sprites RGBA válidos tanto con paleta automática como con paleta bloqueada, y ejecuciones de prueba en procesos separados con menor memoria pico usando el grafo INT8.

## Capacidades

- Generación de sprites de pixel art de 64 × 64 píxeles con canal alfa (fondo transparente).
- Generación texto-a-imagen a partir de descripciones en lenguaje natural.
- Control de paleta: permite fijar colores concretos mediante la opción `--palette` con valores hexadecimales.
- Control de semilla para reproducibilidad (`--seed`).
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ajuste de hilos de cómputo (`--threads`) para adaptar el rendimiento al hardware.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de assets para videojuegos indie: el modelo produce sprites de 64 × 64 con transparencia directamente utilizables en motores 2D, lo que agiliza la creación de prototipos de personajes y objetos sin depender de un artista para cada variante.
- Creación de sprites con paleta restringida: gracias a la opción `--palette`, se pueden generar assets coherentes con la paleta de un juego concreto (por ejemplo, una paleta de 16 colores estilo consola de 8 bits), garantizando consistencia visual.
- Pipelines de generación por lotes en servidores sin GPU: al ejecutarse en CPU con ONNX Runtime, el modelo puede integrarse en procesos batch nocturnos o en contenedores sin acelerador para producir catálogos de sprites.
- Herramientas de prototipado rápido para diseñadores: un artista puede describir un sprite en texto y obtener una imagen base transparente que luego retocar manualmente, reduciendo el tiempo de bloqueo creativo.
- Generación de iconos y elementos de interfaz en pixel art: sprites pequeños con transparencia son adecuados para iconos de menús, objetos de inventario o elementos decorativos en juegos con estética retro.
- Educación y demostración de modelos de difusión en CPU: el paquete permite ejecutar un modelo de difusión completo en un portátil sin GPU, útil para talleres, demos y entornos docentes donde no hay hardware acelerado.
- Automatización de contenido para comunidades de pixel art: generación de variaciones de sprites a partir de prompts con semilla controlada para explorar estilos antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta validaciones cualitativas (sprites RGBA válidos con paleta automática y bloqueada) y una reducción de memoria pico en ejecuciones de prueba en procesos separados, sin cifras concretas de latencia ni throughput.

## Requisitos de hardware

- Inferencia en CPU: es el modo de despliegue previsto; el paquete está diseñado para ONNX Runtime en CPU.
- VRAM: no aplica para el modo CPU; no se documentan requisitos de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible (el autor no documenta despliegue en GPU para esta release).
- ¿Cabe en GPU de consumo? No se documenta; el diseño está orientado a CPU.
- Opciones de despliegue: ONNX Runtime con el runner `rdflow_cpu.py` incluido; requiere clonar el runtime oficial `Retro-Diffusion/rd-flow-64` en el commit `5ba5abdb5f07f8fe0c5a292c25b36a18a984d85b`.
- Dependencias: `huggingface_hub`, `onnxruntime`, `numpy`, `pillow`, `tokenizers`, `torch`.
- Memoria: el paquete completo ocupa 3,62 GB en disco; el grafo de dibujo INT8 ocupa 322,3 MB. El autor indica menor memoria pico con el grafo INT8, sin cifras exactas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Tamaño grafo de dibujo | Tamaño paquete | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| Hansda/RD-Flow-64-INT8-ONNX | ONNX | INT8 por bloques | 322,3 MB | 3,62 GB | No comercial (pesos de dibujo) | CPU (ONNX Runtime) |
| linoyts/RD-Flow-64-ONNX (baseline) | ONNX | Baseline (sin INT8 en dibujo) | 545,5 MB | 3,85 GB | No comercial (pesos de dibujo) | CPU/ONNX Runtime |
| Retro-Diffusion/rd-flow-64 (original) | Pesos originales | Sin cuantizar | no disponible | no disponible | rd-flow-64-model-license (no comercial) | Requiere runtime original |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre otros modelos de pixel art comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: los pesos del grafo de dibujo se distribuyen bajo la rd-flow-64-model-license, que restringe el uso comercial. Cualquier producto que genere ingresos requiere verificar los términos de la licencia original.
- Resolución fija: el modelo genera exclusivamente sprites de 64 × 64 píxeles; no admite otras resoluciones según la documentación.
- Dominio limitado: está especializado en pixel art; no es un modelo de propósito general y su calidad fuera de ese estilo no está documentada.
- Idiomas: no se especifican los idiomas soportados por el lector de prompts; se desconoce si funciona igual de bien en castellano que en inglés.
- Riesgo de alucinación visual: como modelo generativo, puede producir sprites que no correspondan fielmente al prompt, aunque no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Dependencia de un runtime externo: requiere clonar el repositorio oficial en un commit concreto, lo que añade complejidad de despliegue y riesgo de incompatibilidad futura.
- Validación limitada: el autor solo reporta pruebas cualitativas con prompts concretos; no hay evaluación sistemática de calidad ni comparación cuantitativa con el baseline.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción por la comunidad.
- La cuantización INT8 puede degradar la fidelidad de los sprites frente al baseline, aunque el autor no cuantifica esta posible pérdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/RD-Flow-64-INT8-ONNX
- Modelo base original: https://huggingface.co/Retro-Diffusion/rd-flow-64
- Checkpoint original (commit fijado): https://huggingface.co/Retro-Diffusion/rd-flow-64/tree/417cbc4a2719ea016ec2d56c75ee5092dec3985e
- Baseline ONNX de linoyts (commit fijado): https://huggingface.co/linoyts/RD-Flow-64-ONNX/tree/017787664e14b62ece386d45af3336276302e441
- Runtime oficial: https://github.com/Retro-Diffusion/rd-flow-64
- Manifiesto de hashes y comprobaciones: model-manifest.json (incluido en el repositorio)
- Licencia del modelo: LICENSE.md (incluido en el repositorio)
- Licencia del lector de prompts: text_encoder/LICENSE (incluido en el repositorio)
- Sitio del desarrollador original: https://retrodiffusion.ai

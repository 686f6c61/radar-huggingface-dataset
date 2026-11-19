# GEHIRNS/ramiel-preview-1-1.9B

## Resumen

ramiel-preview-1-1.9B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-2B desarrollado por GEHIRNS, orientado a la generación de código para CAD paramétrico. El modelo escribe programas en RCL, un lenguaje específico de dominio para describir bocetos 2D restringidos (constrained sketches) que posteriormente se extruyen a sólidos. A diferencia de los modelos de propósito general, su objetivo es convertir una descripción en lenguaje natural de una pieza mecánica sencilla en un boceto CAD totalmente restringido y verificado.

El modelo cuenta con 1.881.825.088 parámetros y corresponde al modelo de texto del Qwen3.5-2B base, sin el codificador de visión ni la capa de predicción multi-token. Se distribuye en formato GGUF (Q8_0) para su uso con llama.cpp, con un tamaño de repositorio de 2,0 GB, lo que permite ejecutarlo en una única GPU de consumo (se reportan 2,0 GiB de memoria dedicada en una AMD RX 6700 XT).

La relevancia del modelo radica en su enfoque de dominio estrecho: en lugar de competir en capacidades generales, apunta a un flujo de trabajo concreto (texto a CAD con verificación automática) donde un modelo pequeño y especializado puede superar a modelos base mucho mayores. No obstante, se trata de una versión preview con limitaciones declaradas por el autor: falla en tipos de pieza no vistos durante el entrenamiento y no ha sido evaluado con descripciones escritas por personas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B; se excluye el codificador de visión y la capa de predicción multi-token) |
| Parámetros totales | 1.881.825.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuración usada en las evaluaciones) |
| Tipos de cuantización | GGUF Q8_0 (única cuantización publicada en el repositorio) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer del que se conserva únicamente el modelo de texto: se eliminan el codificador de visión y la capa de predicción multi-token del modelo base, lo que explica la diferencia entre los 1.881.825.088 parámetros del ajuste y los del original. El ajuste se realizó mediante LoRA (la etiqueta `lora` figura en los metadatos del repositorio), aunque la model card no detalla el rango, la tasa de aprendizaje ni el número de pasos.

El entrenamiento se centró en tres conjuntos de desarrollo propios: DEV-A (110 descripciones de las 11 familias de piezas usadas en entrenamiento), DEV-O (200 descripciones generadas de layouts no presentes en los datos de entrenamiento) y DEV-X (100 bocetos de validación de Zero-To-CAD para restringir). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal no es arquitectónica, sino de dominio: el modelo genera RCL, un lenguaje pequeño de bocetos 2D restringidos, que un pipeline externo resuelve, valida contra cada número de la descripción, construye en FreeCAD y exporta a STEP, STL, imagen de perfil e informe.

## Capacidades

- Generación de programas en RCL (lenguaje de dominio específico para bocetos CAD 2D restringidos extruidos a sólidos).
- Conversión de descripciones en lenguaje natural de piezas planas sencillas a geometría CAD verificable.
- Resolución de restricciones geométricas (constraint-solving) dentro del pipeline asociado.
- Integración con FreeCAD para la construcción del sólido y exportación a STEP y STL.
- Verificación automática: el pipeline responde `verified` solo cuando todas las comprobaciones numéricas de la descripción pasan.
- Generación de informes y vistas de perfil de la pieza.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el flujo multi-paso lo aporta el pipeline externo, no el modelo.
- Modo thinking: desactivado en las evaluaciones reportadas (thinking off).

## Casos de uso

- Automatización de bocetos paramétricos en ingeniería mecánica: el modelo traduce una frase como la descripción de una placa con taladros y chaflanes a un boceto RCL totalmente restringido, que el pipeline resuelve y exporta a STEP para su uso en CAD profesional.
- Generación de piezas planas en serie: para familias de piezas ya cubiertas por el entrenamiento (11 familias), el modelo permite generar variantes con dimensiones distintas a partir de descripciones textuales, reduciendo el trabajo manual de modelado.
- Validación temprana de diseños: al comprobar cada número de la descripción contra el boceto resuelto, el pipeline devuelve `verified` o un fallo, lo que permite descartar especificaciones inconsistentes antes de llegar al taller.
- Prototipado rápido en una GPU de consumo: con 2,0 GiB de memoria dedicada en una AMD RX 6700 XT y unos 100 tokens por segundo, es viable ejecutarlo en estaciones de trabajo modestas para iterar sobre diseños sencillos.
- Integración en flujos de fabricación digital: la exportación a STL permite encadenar directamente con impresión 3D o mecanizado para piezas planas de baja complejidad.
- Docencia y experimentación en CAD generativo: el modelo y su pipeline sirven para estudiar cómo un modelo de 1,9B especializado puede resolver una tarea de dominio cerrado con verificación formal, sin necesidad de infraestructura de gran escala.
- Generación de layouts de placas: en las 200 descripciones de layout generadas (DEV-O), el pipeline completo verificó 155, lo que lo hace utilizable como asistente para distribuciones de taladros y contornos en placas.

## Benchmarks y rendimiento

Resultados reportados por el autor. Todas las filas se ejecutaron en una NVIDIA A16, llama.cpp b11870, GGUF Q8_0, contexto de 4.096 tokens, prompt de sistema de una línea, muestreo greedy, thinking off, límite de 2.048 tokens, sin comprobaciones ni reintentos.

| Medida | Qwen3.5-2B (sin ajustar, 1,93 GiB) | ramiel-preview-1-1.9B (1,87 GiB) |
|---|---|---|
| Pipeline completo, descripciones de layout (DEV-O) | no disponible | 155 de 200 verificadas (99 % de las verificadas correctas: 154 de 155) |
| Modelo solo, bocetos válidos en layouts nuevos (DEV-O) | 0 de 200 | 126 de 200 (63 %) |
| Memoria GPU (A16) | 2,057 GiB | 2,057 GiB |
| Velocidad (A16) | 58,4 tok/s | 58,1 tok/s |
| Memoria GPU (AMD RX 6700 XT, proceso) | no ejecutado | 2,0 GiB dedicados + 0,5 GiB compartidos |
| Velocidad (AMD RX 6700 XT) | no ejecutado | ~100 tok/s |

Notas del autor: las cifras provienen de tres configuraciones distintas (pipeline completo, modelo solo y PC de consumo) y nunca se combinan. En una evaluación separada de 20 piezas con descripciones escritas por Claude y una regla de comprobación anterior, 2 de las 10 piezas devueltas como `verified` fueron juzgadas incorrectas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GiB con cuantización Q8_0 (medido en A16 y en RX 6700 XT).
- GPU recomendadas: cualquier GPU con al menos 3-4 GiB de VRAM libre; el autor reporta funcionamiento en una AMD RX 6700 XT y en una NVIDIA A16.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GiB o más de VRAM; en la RX 6700 XT usó 2,0 GiB dedicados más 0,5 GiB de memoria compartida.
- Opciones de despliegue: llama.cpp (versión b11870 usada en las pruebas); el repositorio es GGUF y la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: 58,1 tok/s en NVIDIA A16 y aproximadamente 100 tok/s en AMD RX 6700 XT, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramiel-preview-1-1.9B | 1,88B | 4.096 | Texto a CAD (RCL, FreeCAD) | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B | ~1,93B (archivo GGUF) | no disponible | Propósito general multimodal | no disponible en la información | Hugging Face |
| Zero-To-CAD (referencia de datos) | no disponible | no disponible | Conjunto de validación de bocetos CAD | no disponible | no disponible |

La comparación directa más relevante es con su modelo base: en la tarea de generar bocetos válidos en layouts nuevos, el base obtuvo 0 de 200 frente a 126 de 200 del ajuste, y en memoria y velocidad ambos son prácticamente idénticos (2,057 GiB y 58,1 frente a 58,4 tok/s en A16). No se dispone de datos de otros modelos especializados en texto a CAD en la información proporcionada.

## Limitaciones y advertencias

- Es una versión preview: falla en tipos de pieza que no ha visto durante el entrenamiento.
- No ha sido medida con descripciones escritas por personas; las evaluaciones usan descripciones generadas por el propio autor.
- En la evaluación con descripciones de Claude y una regla de comprobación anterior, 2 de cada 10 piezas marcadas como `verified` resultaron incorrectas, lo que indica riesgo de falsos positivos en la verificación.
- El soporte de idiomas se limita al inglés según los metadatos; no se garantiza funcionamiento en castellano.
- El contexto de 4.096 tokens puede ser insuficiente para descripciones largas o bocetos complejos.
- Solo se publica la cuantización Q8_0 en GGUF; no hay variantes de menor precisión para hardware más limitado.
- Riesgo de alucinación en la generación de RCL: el pipeline incluye comprobaciones, pero el modelo por sí solo produce bocetos inválidos en aproximadamente el 37 % de los layouts nuevos (74 de 200).
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-2B conviene revisar las condiciones del modelo base.
- Los resultados de memoria y velocidad no suponen una mejora sobre el modelo base; el valor está en la especialización, no en la eficiencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/ramiel-preview-1-1.9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código: https://github.com/GEHIRNS/ramiel
- Sitio web del autor: https://gehirns.pages.dev/
- Licencia: https://huggingface.co/GEHIRNS/ramiel-preview-1-1.9B/blob/main/LICENSE
- Paper referenciado (arXiv:2604.24479): https://arxiv.org/abs/2604.24479

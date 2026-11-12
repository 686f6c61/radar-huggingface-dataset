# avinash2468/SmolVLM-256M-GUI-Grounding

## Resumen

SmolVLM-256M-GUI-Grounding es un modelo de visión-lenguaje de 251,2 millones de parámetros especializado en *GUI grounding*: recibe una captura de pantalla y una instrucción en lenguaje natural ("pulsa el botón de exportar") y devuelve las coordenadas del punto donde hay que hacer clic. Es un ajuste fino (*fine-tune*) del modelo SmolVLM-256M-Instruct de Hugging Face, desarrollado por el usuario independiente avinash2468, y está pensado para agentes de interfaz gráfica y automatización de escritorio en entornos con recursos muy limitados.

El modelo combina un codificador visual SigLIP-B/16 con un modelo de lenguaje SmolLM2-135M, lo que da un total de 251,2M de parámetros y unos 0,5 GB de pesos en bf16. Su principal atractivo es la relación entre tamaño y rendimiento: con un único pase de inferencia alcanza un 74,8 % de precisión en ScreenSpot-v2, frente al 2,1 % del modelo base sin ajustar, y puede ejecutarse en portátiles o dispositivos sin GPU dedicada.

Es relevante ahora porque la automatización de interfaces mediante agentes multimodales exige modelos ligeros que quepan en el *edge* y respondan con latencia baja, y este modelo demuestra que un ajuste fino supervisado de apenas 30 horas de GPU sobre un modelo de 256M puede resolver tareas de *pointing* con una precisión útil, aunque con limitaciones claras en pantallas profesionales de alta resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: codificador visual SigLIP-B/16 + modelo de lenguaje SmolLM2-135M (familia Idefics3) |
| Parametros totales | 251.176.512 (251,2M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (instrucciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 0,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia SmolVLM/Idefics3: un codificador visual SigLIP-B/16 que procesa la captura de pantalla y proyecta las características visuales al espacio del modelo de lenguaje SmolLM2-135M, que genera la respuesta. La salida es un par `(x, y)` con enteros entre 0 y 100 que representan el porcentaje del ancho y alto de la imagen, lo que permite reescalar la predicción a cualquier resolución de pantalla.

El entrenamiento consistió exclusivamente en ajuste fino supervisado (*full-parameter SFT*) en varias etapas sobre datos públicos de GUI y de *pointing*, con un coste aproximado de 30 horas de GPU en una NVIDIA H100 de 80 GB. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. El autor anuncia que publicará próximamente el código de entrenamiento y evaluación, los detalles de los datos y un informe técnico. El procedimiento de refinamiento en múltiples pases (4 y 12 pases) que aparece en los resultados no está incluido en esta release.

## Capacidades

- *GUI grounding*: localización de elementos de interfaz a partir de una instrucción en lenguaje natural y una captura de pantalla.
- Comprensión de pantallas: lectura de menús, diálogos, hojas de cálculo, navegadores, aplicaciones de escritorio y móviles.
- Razonamiento espacial básico: identificación de celdas por coordenadas (por ejemplo, "celda B21"), elementos dentro de diálogos apilados o iconos repetidos diferenciados por su fila.
- Tolerancia a instrucciones con errores ortográficos o referencias imprecisas ("opnvkarte" para "ÖPNVKarte").
- Salida estructurada de coordenadas en formato `(x, y)` como porcentaje de la imagen.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso ni modo de razonamiento explícito (*thinking mode*).
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Automatización de tareas de escritorio: un agente recibe una instrucción ("abre el diálogo de guardar") y el modelo devuelve el punto exacto donde pulsar; su tamaño de 0,5 GB permite integrarlo en el propio equipo del usuario sin depender de la nube.
- Pruebas de interfaz automatizadas (QA): generar clics sintéticos sobre elementos identificados por texto o posición para validar flujos de UI en pipelines de integración continua.
- Asistentes de accesibilidad: traducir instrucciones verbales o escritas en acciones de puntero para usuarios con dificultades motoras, con latencia baja al ejecutarse en local.
- Automatización de hojas de cálculo: localizar celdas por coordenadas de fila y columna (por ejemplo, "celda B21") para rellenar o leer datos en herramientas ofimáticas.
- Navegación web guiada: seleccionar capas de mapas, menús de historial o controles de formularios a partir de descripciones en lenguaje natural, útil en asistentes de navegación.
- Prototipado rápido de agentes de *computer use*: al ser un modelo pequeño y con licencia Apache 2.0, sirve como base para experimentar con *fine-tuning* adicional sobre dominios concretos antes de escalar a modelos mayores.
- Ejecución en dispositivos sin GPU: al caber en memoria de un portátil convencional, permite demos y pruebas de concepto de *grounding* en entornos de desarrollo modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Una predicción se considera correcta si el punto predicho cae dentro de la caja del elemento objetivo.

| Inferencia | ScreenSpot-v2 (n = 1.272) | ScreenSpot-Pro (n = 1.581) | OSWorld-G (n = 510) |
|---|---:|---:|---:|
| SmolVLM-256M-Instruct base, zero-shot | 2,1 | ~0 | ~0 |
| Este modelo, 1 pase | 74,8 | 14,3 | 33,3 |
| Este modelo, 4 pases | 76,0 | 37,3 | 44,7 |
| Este modelo, 12 pases | 77,8 | 40,0 | 44,9 |

El pase único es una sola pasada hacia delante sobre la captura completa. Los resultados de 4 y 12 pases emplean un procedimiento de refinamiento en tiempo de prueba que no está incluido en esta release. El autor advierte que doce pases de un modelo de 256M cuestan aproximadamente lo mismo que un pase de un modelo de 3B, por lo que esas cifras deben compararse con modelos de ~3B a igual cómputo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB para los pesos en bf16, más la memoria de activaciones y del codificador visual; en la práctica, menos de 2 GB para inferencia en bf16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; funciona en NVIDIA H100, A100, RTX 4090, RTX 3090 y también en GPUs de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU para uso puntual.
- Opciones de despliegue: `transformers >= 5.0` con `AutoModelForImageTextToText` y `AutoProcessor`; requiere `torch` y `pillow`. El autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El autor solo indica que el entrenamiento consumió unas 30 horas de GPU en una H100 y que doce pases de este modelo equivalen en cómputo a un pase de un modelo de 3B.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM-256M-GUI-Grounding (este) | 251,2M | No disponible | 74,8 (1 pase) | Apache 2.0 | Hugging Face |
| SmolVLM-256M-Instruct (base, zero-shot) | 251,2M | No disponible | 2,1 | Apache 2.0 | Hugging Face |
| SmolVLM2-500M-GUI-Grounding (mismo autor) | ~500M | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks de otros modelos de *GUI grounding* en la información proporcionada, por lo que no se incluyen comparaciones adicionales.

## Limitaciones y advertencias

- El modelo solo entiende instrucciones en inglés; no se declara soporte de otros idiomas.
- Rendimiento bajo en pantallas profesionales de alta resolución: 14,3 % en ScreenSpot-Pro con un solo pase, muy por debajo del 74,8 % en ScreenSpot-v2.
- El procedimiento de refinamiento en múltiples pases que eleva los resultados no está incluido en esta release, por lo que las cifras de 4 y 12 pases no son reproducibles con el código publicado.
- Los resultados de los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinación inherente a los modelos de lenguaje pequeños: puede devolver coordenadas plausibles pero incorrectas en pantallas densas o con elementos visualmente similares.
- No se documentan sesgos específicos, pero al entrenarse sobre datos públicos de GUI puede heredar sesgos de las capturas y aplicaciones utilizadas.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos que no usen `transformers`.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como trabajo de investigación.
- El repositorio no registra descargas ni interacciones, y el autor anuncia documentación pendiente (código, datos e informe técnico), lo que reduce la trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/avinash2468/SmolVLM-256M-GUI-Grounding
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Modelo hermano mayor: https://huggingface.co/avinash2468/SmolVLM2-500M-GUI-Grounding
- Perfil del autor: https://huggingface.co/avinash2468

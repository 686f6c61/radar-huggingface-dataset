# avinash2468/SmolVLM2-500M-GUI-Grounding

## Resumen
SmolVLM2-500M-GUI-Grounding es un modelo de visión-lenguaje de 498,6 millones de parámetros especializado en GUI grounding: recibe una captura de pantalla y una instrucción en lenguaje natural ("pulsa el botón de exportar") y devuelve el punto exacto (x, y) donde hay que hacer clic. Lo desarrolla el usuario independiente avinash2468 como ajuste fino del modelo base HuggingFaceTB/SmolVLM2-500M-Video-Instruct, manteniendo su licencia Apache 2.0.

El modelo resulta relevante porque aborda una de las piezas críticas de los agentes de computer use: convertir intenciones en coordenadas precisas sobre interfaces reales. Con solo 500M de parámetros y aproximadamente 1 GB de pesos en bf16, es lo bastante pequeño para ejecutarse en hardware modesto, lo que lo hace atractivo para prototipos de automatización de escritorio, móvil y web sin depender de APIs externas.

La arquitectura combina el codificador visual SigLIP-B/16 con el modelo de lenguaje SmolLM2-360M, y se ha entrenado mediante ajuste fino supervisado de todos los parámetros en varias etapas sobre datos públicos de GUI y pointing. El autor reporta un 80,0 % de precisión en ScreenSpot-v2 con una sola pasada, aunque aún no ha publicado el código de entrenamiento, los detalles del dataset ni un informe técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (codificador SigLIP-B/16 + LLM SmolLM2-360M), familia Idefics3 |
| Parametros totales | 498.634.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el repo no detalla otras cuantizaciones) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, aproximadamente 1,0 GB) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura de SmolVLM2: un codificador visual SigLIP-B/16 que procesa la captura de pantalla y proyecta las representaciones visuales en el espacio del modelo de lenguaje SmolLM2-360M, que genera la respuesta. La salida es un par (x, y) con enteros de 0 a 100, expresados como porcentaje del ancho y alto de la imagen, lo que desacopla la predicción de la resolución concreta de la pantalla.

El entrenamiento consistió en ajuste fino supervisado de todos los parámetros en varias etapas sobre datos públicos de GUI y pointing, con un coste aproximado de 35 horas de GPU en una NVIDIA H100 de 80 GB. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el código de entrenamiento y evaluación, los detalles de datos y un informe técnico se publicarán próximamente; tampoco se incluye en esta release el procedimiento de refinamiento en varias pasadas (4 y 12) que aparece en los resultados.

## Capacidades
- GUI grounding: localiza el elemento de interfaz descrito por una instrucción y devuelve sus coordenadas como porcentaje de la imagen.
- Comprensión de pantallas: interpreta capturas de escritorio, web y móvil, incluyendo diálogos superpuestos, menús contextuales y tablas.
- Razonamiento espacial básico: resuelve referencias indirectas como "la celda B21" o "el icono de tres puntos a la derecha de la entrada X".
- Tolerancia a instrucciones con errores tipográficos o grafías aproximadas (por ejemplo, "opnvkarte" frente a "ÖPNVKarte").
- Procesamiento de imagen y texto en un único pipeline image-text-to-text compatible con transformers.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés en las instrucciones.

## Casos de uso
- Automatización de tareas de escritorio: un agente captura la pantalla, pide al modelo las coordenadas del control objetivo y ejecuta el clic mediante una librería de automatización; el tamaño reducido permite ejecutarlo localmente junto al agente.
- Testing de interfaces de usuario: integrado en pipelines de QA, el modelo puede verificar que los elementos descritos en los casos de prueba existen y están en la posición esperada en cada build.
- Asistentes de accesibilidad: traducir instrucciones verbales o escritas en acciones de puntero sobre aplicaciones que no exponen una API de accesibilidad, usando la captura como única entrada.
- RPA ligera en pymes: sustituir scripts frágiles basados en coordenadas fijas por localización semántica de botones y campos en aplicaciones de escritorio y web.
- Automatización móvil: localizar toggles, alarmas o elementos de menú en capturas de aplicaciones Android o iOS para flujos de prueba y demos.
- Extracción de datos de formularios y hojas de cálculo: localizar celdas o campos concretos a partir de descripciones en lenguaje natural antes de leer o escribir su contenido.
- Prototipado de agentes de computer use: servir como componente de grounding de bajo coste en arquitecturas donde un LLM mayor planifica y este modelo ejecuta la localización.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card; una predicción se considera correcta si el punto predicho cae dentro de la caja del elemento objetivo.

| Inferencia | ScreenSpot-v2 (n = 1.272) | ScreenSpot-Pro (n = 1.581) | OSWorld-G (n = 510) |
|---|---:|---:|---:|
| Este modelo, 1 pasada | 80,0 | 21,7 | 39,4 |
| Este modelo, 4 pasadas | 74,8 | 40,5 | 46,5 |
| Este modelo, 12 pasadas | 76,6 | 43,9 | 49,2 |
| Hermano de 256M, 1 pasada | 74,8 | 14,3 | 33,3 |
| Hermano de 256M, 12 pasadas | 77,8 | 40,0 | 44,9 |

Las pasadas múltiples emplean un procedimiento de refinamiento en tiempo de test que no se incluye en esta release. En pantallas profesionales de alta resolución las pasadas extra ayudan notablemente (ScreenSpot-Pro: 21,7 a 43,9), mientras que en ScreenSpot-v2 reducen la precisión (80,0 a 76,6); para pantallas de móvil, web y escritorio convencional, una sola pasada es el punto de operación recomendado. Frente al modelo hermano de 256M, el mayor tamaño del LLM aporta +5,2, +7,4 y +6,1 puntos en una sola pasada en cada benchmark.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1 GB en bf16 para los pesos, más el espacio de activaciones y la imagen de entrada; en la práctica, unos 2-4 GB según resolución de pantalla y longitud del prompt.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; una NVIDIA H100 de 80 GB fue suficiente para el entrenamiento completo en unas 35 horas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (requiere versión >= 5.0, torch, pillow y num2words); el repo está marcado como compatible con endpoints. No se documenta soporte verificado de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScreenSpot-v2 (1 pasada) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| SmolVLM2-500M-GUI-Grounding | 498,6M | no disponible | 80,0 | Apache 2.0 | Hugging Face |
| SmolVLM-256M-GUI-Grounding (mismo autor) | no disponible (256M por nombre) | no disponible | 74,8 | no disponible en la informacion | Hugging Face |
| SmolVLM2-500M-Video-Instruct (base) | 498,6M | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos de grounding de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias
- Solo acepta instrucciones en inglés; el rendimiento con otros idiomas no está evaluado.
- La precisión cae de forma acusada en pantallas profesionales de alta resolución: 21,7 % en ScreenSpot-Pro con una sola pasada.
- El procedimiento de refinamiento en múltiples pasadas que mejora los resultados no está incluido en la release.
- El autor no ha publicado el código de entrenamiento, los datos ni el informe técnico, lo que dificulta la reproducibilidad y la auditoría de sesgos.
- Riesgo de alucinación: al devolver siempre un par de coordenadas, puede señalar un elemento plausible pero incorrecto cuando la instrucción es ambigua o el elemento no está visible.
- No se documentan evaluaciones de sesgo; al entrenarse con datos públicos de GUI, puede heredar sesgos de las capturas y de las instrucciones empleadas.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene validar el modelo en el dominio objetivo antes de desplegarlo en producción, dado el escaso historial de uso (0 descargas y 0 likes en el momento de la consulta).
- La salida como porcentaje de la imagen exige que el consumidor conozca las dimensiones reales de la captura para convertirla en píxeles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/avinash2468/SmolVLM2-500M-GUI-Grounding
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Modelo hermano de 256M: https://huggingface.co/avinash2468/SmolVLM-256M-GUI-Grounding
- Perfil del autor: https://huggingface.co/avinash2468

# Rover00/WeMM-Decision

## Resumen

WeMM-Decision es un modelo de decisión multimodal (texto e imagen) publicado por el usuario Rover00 en Hugging Face. A diferencia de un modelo generativo al uso, no produce texto libre: recibe un estado (por ejemplo, una frase o una imagen) junto con preguntas tipadas y devuelve, en una sola pasada hacia delante por pregunta, una probabilidad o una distribución sobre opciones predefinidas. Admite tres tipos de consulta: `Choice` (elegir entre opciones aportadas), `Noul` (estimar la probabilidad de una proposición sí/no) y `Score` (distribución sobre niveles ordenados).

El modelo pesa 26.085.330.160 parámetros (unos 26,1 mil millones) según los pesos en safetensors, con un repositorio de 52,2 GB, y se distribuye bajo licencia Apache 2.0 con etiqueta de arquitectura `qwen3_5`. Incorpora código personalizado (`custom_code`), de modo que su carga requiere el paquete de inferencia propio del autor (`inference.D3Engine`) en lugar de `transformers` estándar.

Su relevancia radica en el enfoque: separa la evaluación de decisiones de la generación de lenguaje, lo que permite integrar el modelo como clasificador probabilístico en pipelines de agentes o sistemas de control donde se necesita una salida calibrada y acotada por pregunta, no una respuesta abierta. El autor publica un índice propio (Public Decision Index 0.3) con 83,34 en el panel de visión y 70,28 en el de texto; no se trata de un benchmark estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | derivada de la familia Qwen 3.5 (etiqueta `qwen3_5`), multimodal texto-imagen, con código personalizado |
| Parametros totales | 26.085.330.160 (≈26,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería pytorch; requiere `custom_code`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que sugiere una base derivada de la familia Qwen 3.5, y de la naturaleza multimodal del modelo (procesa texto e imágenes). El repositorio incluye código personalizado, lo que implica modificaciones sobre la base que no se describen en la model card. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovación declarada es el modo de inferencia: en lugar de generar secuencias, el modelo formula cada pregunta como una consulta tipada (`Choice`, `Noul`, `Score`) y devuelve probabilidades en una única pasada por pregunta. El autor acompaña el modelo con un motor de inferencia propio (`D3Engine`) que gestiona el estado, las preguntas y la integración con su índice de evaluación, además de un servidor HTTP para despliegue. No se aportan detalles sobre mecanismos de atención, decodificación especulativa ni optimizaciones de cómputo.

## Capacidades

- Evaluación de decisiones sobre texto: selección entre opciones (`Choice`), probabilidad de proposiciones sí/no (`Noul`) y distribución sobre niveles ordenados (`Score`).
- Evaluación multimodal: el panel de visión del índice del autor sugiere procesamiento de imágenes junto con preguntas tipadas.
- Salida probabilística calibrada por pregunta en una sola pasada, apta para umbrales y rankings.
- Motor de inferencia propio con API Python (`D3Engine`) y servidor HTTP integrado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, audio): no disponibles.

## Casos de uso

- Moderación de contenido con umbrales: usar consultas `Noul` ("¿este texto incumple la política X?") sobre textos e imágenes para obtener una probabilidad por caso, integrándola en una cola de revisión con umbral configurable en lugar de depender de texto generado.
- Triaje de tickets de soporte: plantear consultas `Choice` con las categorías del sistema de ticketing para clasificar cada mensaje en una sola pasada, reduciendo latencia frente a un modelo generativo que deba redactar la categoría.
- Control de calidad en pipelines de datos: evaluar pares imagen-texto con preguntas `Score` sobre niveles ordenados (por ejemplo, calidad de alineación de 1 a 5) para filtrar datasets de entrenamiento o detectar ejemplos ruidosos.
- Enrutamiento en sistemas de agentes: dado un estado del entorno y un conjunto de acciones posibles, obtener la distribución de probabilidad sobre acciones (`Choice`) y usarla como política de selección o como señal auxiliar de un planificador.
- Evaluación automática de respuestas: comparar una respuesta candidata con criterios definidos por el equipo mediante `Choice`/`Score` para construir métricas de evaluación reproducibles sin generar texto evaluador.
- Verificación de condiciones en visión por computador: consultas `Noul` sobre imágenes (presencia de un objeto, cumplimiento de una condición visual) para prefiltrar lotes antes de un modelo más costoso.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a su índice propio, no a benchmarks estándar de la comunidad:

| Panel | Public Decision Index 0.3 |
|---|---:|
| Vision | 83,34 |
| Text | 70,28 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 B de parámetros, en FP16 se requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y del procesador multimodal; en BF16/FP16 no cabe en GPU de consumo de 24 GB.
- Cuantización: no se documentan formatos cuantizados; sin ellos, el despliegue en GPUs de consumo no es viable sin conversión manual.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16 con margen; configuraciones multi-GPU para lotes grandes.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 en FP16 sin cuantización no documentada.
- Opciones de despliegue: motor propio del autor (`D3Engine`, dispositivo configurable, p. ej. `cuda:0`) y servidor HTTP incluido en el repositorio; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión multimodal con el mismo formato de consultas tipadas. Como referencia de tamaño y familia, se puede situar frente a la base Qwen 3.5 de la que deriva, pero no se aportan datos de parámetros, contexto ni rendimiento de esa base en la información disponible.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| WeMM-Decision | 26,1 B | no disponible | decisión multimodal con consultas tipadas | Apache 2.0 | índice propio: Vision 83,34 / Text 70,28 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que limita la evidencia independiente sobre su calidad.
- El único rendimiento reportado procede de un índice propio del autor (Public Decision Index 0.3), no de benchmarks estándar; no es comparable directamente con MMLU u otras métricas conocidas.
- No se documentan sesgos conocidos, idiomas soportados ni composición del entrenamiento, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de calibración: al devolver probabilidades, un uso en producción exige validar la calibración sobre el dominio propio; no se aportan datos de calibración.
- Requiere código personalizado (`custom_code`) y el paquete de inferencia del autor; no es compatible de forma directa con el ecosistema estándar de `transformers`, lo que añade coste de integración y mantenimiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el origen de los datos de entrenamiento impide descartar obligaciones derivadas del dataset base.
- No se documentan limitaciones de longitud de contexto; conviene asumir un contexto no verificado y probarlo antes de usarlo con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rover00/WeMM-Decision
- Instrucciones de inferencia: `inference/README.md` dentro del repositorio del modelo (ejemplos de texto e imagen, servidor HTTP e integración con el Decision Index)
- Paper, blog o repositorio adicional: no disponible en la información proporcionada

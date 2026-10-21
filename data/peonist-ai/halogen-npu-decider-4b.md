# peonist-ai/halogen-npu-decider-4b

## Resumen

halogen-npu-decider-4b es un clasificador de texto derivado de Mapika/decider-4b (a su vez un fine-tune de Qwen/Qwen3.5-4B-Base) que el autor, peonist-ai, ha convertido para ejecutarse en la NPU XDNA2 de los procesadores AMD Ryzen AI de la familia Strix Halo. No es un modelo generativo al uso: recibe un texto y una pregunta con entre 2 y 10 opciones, y devuelve en una sola pasada una probabilidad para cada opción. Se distribuye como artefacto empaquetado para un runtime concreto, no como pesos estándar.

La relevancia del proyecto es de infraestructura más que de modelado: propone ejecutar la tarea de decisión (guardarraíles, enrutado, triaje) en la NPU mientras el modelo generativo principal (el "Flash") ocupa la GPU, compartiendo puerto a través de halogen-flash-server. Con 8.192 tokens de contexto desde la versión 0.18.2 del servidor, cubre bastantes casos de clasificación sobre documentos largos sin salir del equipo local.

Sus limitaciones de partida son explícitas: los ficheros solo cargan dentro del contenedor halogen-flash-server sobre la NPU, la model card no publica idiomas soportados, dataset de entrenamiento, cuantización ni resultados de benchmarks, y el repositorio no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; el modelo base es Mapika/decider-4b, un fine-tune clasificador de Qwen/Qwen3.5-4B-Base |
| Parámetros totales | 4.000 millones (nominal, según el nombre del modelo y su base; no verificado en la información disponible) |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo Mixture of Experts |
| Longitud de contexto | 8.192 tokens (soportado por halogen-flash-server desde la versión 0.18.2) |
| Tipos de cuantización | No disponible. Los pesos se distribuyen ya convertidos para la NPU en un único fichero `.hnpw` de 5,69 GB; no se documentan precisiones ni variantes alternativas |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.hnpw` (formato del runtime halogen) más un programa de dispositivo para NPU (367 MB); no se publican safetensors ni GGUF |
| Tarea (pipeline) | text-classification |
| Runtime requerido | halogen-flash-server 0.17.4 o superior; los ficheros de la revisión actual exigen 0.18.12 o superior |
| Tamaño del repositorio | 12,3 GB |
| Hardware objetivo | NPU AMD Ryzen AI (XDNA2) en Strix Halo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del clasificador. Lo que sí se documenta es la cadena de procedencia: Qwen/Qwen3.5-4B-Base, fine-tuneado por Mapika como decider-4b con comportamiento de clasificador multiopción, y después convertido por peonist-ai a formato de NPU en la revisión `eb5fbdfc9448473ec25e399882912863afbdb70e` del modelo base. La conversión separa el artefacto en tres piezas: un programa de dispositivo de 367 MB con sus avisos de terceros, un fichero de pesos de 5,69 GB y el tokenizador de 20 MB.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineación. Tampoco se detalla qué técnica de atención o de decodificación emplea el modelo original. La particularidad técnica del repositorio es el empaquetado para XDNA2 y la integración con el servidor: la decisión se resuelve en una única pasada sobre el texto para todas las opciones, y con `HALOGEN_NPU_DEC_RESUME=1` un texto con varias preguntas se lee una sola vez en lugar de repetirse por pregunta.

## Capacidades

- Clasificación multiopción: dada una entrada de texto y una pregunta con entre 2 y 10 opciones, devuelve una probabilidad para cada opción en una sola pasada.
- Decisiones binarias y de enrutado: pensado explícitamente como clasificador, guardarraíl y router dentro de una arquitectura mayor.
- Procesamiento de textos largos: admite hasta 8.192 tokens de entrada desde halogen-flash-server 0.18.2.
- Reutilización de contexto en lote de preguntas: con `HALOGEN_NPU_DEC_RESUME=1`, varias preguntas sobre el mismo texto comparten una única lectura.
- Convivencia con un modelo generativo: se ejecuta en la NPU mientras el modelo Flash ocupa la GPU, detrás del mismo puerto del servidor.
- Mayor precisión cualitativa que la variante decider-0.8b en preguntas difíciles, según el autor, a costa de algo más de latencia por decisión.
- No documentado: generación de texto libre, tool calling, capacidades multimodales (visión o audio), razonamiento multi-paso autónomo ni cobertura de idiomas.

## Casos de uso

- Enrutado de consultas en asistentes y pipelines RAG: el modelo recibe el mensaje del usuario y una lista de hasta 10 intenciones o destinos, y devuelve la probabilidad de cada uno; el orquestador elige la ruta con mayor puntuación sin gastar GPU.
- Guardarraíl de entrada y salida: clasificar si una petición o una respuesta entra en categorías de riesgo (datos personales, contenido prohibido, fuga de instrucciones) con opciones fijas y umbral calibrado por el operador.
- Triaje de tickets de soporte: con contexto de 8.192 tokens se puede clasificar el hilo completo de un correo o una conversación en categorías de prioridad, equipo responsable y tipo de incidencia.
- Evaluación automática de respuestas (LLM-as-judge binario): comprobar si una respuesta generada cumple un criterio con opciones tipo "correcto / incorrecto / incompleto", ejecutándose en local junto al modelo grande.
- Clasificación de documentación y contratos: etiquetar fragmentos largos (hasta 8.192 tokens) por tipo de cláusula, confidencialidad o categoría documental en pipelines por lotes sobre hardware de escritorio.
- Moderación en comunidades y foros autoalojados: desplegar el filtro en un equipo con Ryzen AI sin GPU dedicada, manteniendo el contenido dentro de la máquina.
- Enrutado de herramientas en agentes: decidir qué herramienta de un conjunto cerrado corresponde a la petición del usuario antes de invocar el modelo generativo, reduciendo llamadas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La única referencia de rendimiento es cualitativa: el autor indica que esta variante da mejores respuestas que halogen-npu-decider-0.8b en preguntas difíciles y tarda "un poco más" en decidir. No se aportan cifras de latencia, throughput ni precisión.

## Requisitos de hardware

- NPU obligatoria: AMD Ryzen AI con XDNA2 (familia Strix Halo). El modelo no se ejecuta en CPU, GPU NVIDIA ni GPU AMD convencional.
- Huella en NPU: 5,69 GB de pesos más 367 MB de programa de dispositivo y 20 MB de tokenizador, aproximadamente 6,1 GB de artefactos.
- VRAM: no aplica al modelo en sí (reside en la NPU), pero el escenario previsto reserva la GPU para el modelo Flash del servidor, que sí consume VRAM.
- Software de host: driver de NPU, XRT con su plugin de NPU y el reloj de fabric de la GPU fijado mientras la NPU trabaja junto a la GPU.
- Servidor: halogen-flash-server 0.17.4 o superior; la revisión actual del repositorio requiere 0.18.12 o superior. El servidor descarga los ficheros en `/models/npu/decider-4b/` y verifica tamaño y checksum.
- Opciones de despliegue: exclusivamente el contenedor halogen-flash-server. No hay soporte para transformers, vLLM, llama.cpp, Ollama ni TGI; el widget de HuggingFace está desactivado a propósito porque ningún runtime del Hub puede cargar estos ficheros.
- Latencia y throughput: no disponibles. Solo se sabe que la variante de 4B es más lenta que la de 0,8B y que la reutilización de lectura reduce coste cuando hay varias preguntas sobre el mismo texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| peonist-ai/halogen-npu-decider-4b | 4B (nominal) | 8.192 tokens | `.hnpw`, solo NPU XDNA2 vía halogen | Apache-2.0 | Empaquetado para servidor; sin benchmarks publicados |
| Mapika/decider-4b | 4B (nominal) | No disponible | Pesos estándar para transformers (no detallado) | No disponible en la información | Modelo origen; mismo comportamiento de decisión multiopción |
| peonist-ai/halogen-npu-decider-0.8b | 0,8B (nominal) | No disponible | `.hnpw`, solo NPU XDNA2 vía halogen | No disponible en la información | Más rápido, peor en preguntas difíciles según el autor |
| Qwen/Qwen3.5-4B-Base | 4B (nominal) | No disponible | Pesos estándar | No disponible en la información | Base generativa de la que deriva el clasificador |

La comparación con alternativas fuera del ecosistema halogen no es posible con los datos disponibles: no hay métricas de precisión ni de latencia que permitan situar este clasificador frente a otros modelos de la misma talla.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en NPU XDNA2 de Ryzen AI Strix Halo; no hay ruta de ejecución en GPU o CPU.
- Dependencia del runtime: requiere halogen-flash-server y una versión mínima concreta; los ficheros de la cabeza del repositorio exigen 0.18.12 o superior y cada versión del servidor descarga la revisión con la que se publicó.
- Sin interoperabilidad: no hay safetensors ni GGUF, y el modelo no se puede cargar en transformers, vLLM, llama.cpp ni Ollama, lo que impide reproducir resultados fuera del contenedor.
- Configuración de host no trivial: driver de NPU, XRT con plugin y fijado del reloj de fabric de la GPU; un fallo en cualquiera de estos puntos deja el modelo inoperativo.
- Idiomas no documentados: se desconoce la cobertura real y el comportamiento en castellano o en lenguas con poco soporte en el modelo base.
- Sin datos de sesgo, calibración ni benchmarks: no se puede evaluar la fiabilidad de las probabilidades devueltas ni compararlas con umbrales preestablecidos sin validación propia.
- Riesgo de clasificación errónea en dominios alejados de los datos de entrenamiento del modelo base, con el consiguiente efecto en guardarraíles y enrutadores que dependan de él.
- Licencia Apache-2.0: permite uso comercial, pero el programa de dispositivo incluye avisos de terceros recogidos en `devices/NOTICE.md` que deben conservarse y revisarse.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, repositorio de 12,3 GB y fechas de publicación y actualización en octubre de 2026; conviene tratar el artefacto como experimental.
- El widget de inferencia del Hub está desactivado de forma deliberada, por lo que no es posible probar el modelo desde la página de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/peonist-ai/halogen-npu-decider-4b
- Modelo base: https://huggingface.co/Mapika/decider-4b (revisión `eb5fbdfc9448473ec25e399882912863afbdb70e`)
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Variante pequeña: https://huggingface.co/peonist-ai/halogen-npu-decider-0.8b
- Servidor: https://github.com/peonist-ai/halogen-flash-server
- Documentación de NPU: https://github.com/peonist-ai/halogen-flash-server/blob/main/docs/NPU.md
- Discord del proyecto: https://discord.gg/bcm6QknaV6

No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos no guardaban relación con el modelo y se han descartado.

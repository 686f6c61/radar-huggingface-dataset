# peasantsmith/Inkling-2-Mini-Maya-GGUF

## Resumen

Inkling-2-Mini-Maya-GGUF es un paquete de ficheros GGUF preparado por el usuario peasantsmith para ejecutar el modelo multimodal Inkling 2 Mini (desarrollado por Thinking Machines) dentro de Project Maya, un entorno de inferencia local. No se trata de un modelo nuevo ni de un fine-tuning: el autor empaqueta el modelo cuantizado de unsloth (`Inkling-2-Mini-UD-Q4_K_XL`), la torre de visión en BF16, el drafter de decodificación especulativa y un vector de control para ablación de rechazos, todo verificado por hash SHA-256.

El modelo base, Inkling 2 Mini, es un modelo de 26 B de parámetros con licencia Apache 2.0, capacidad de visión, tool calling y un contexto declarado de hasta 1 millón de tokens. La ficha de Hugging Face reporta 2304 parámetros en safetensors, dato que entra en contradicción con los 26 B indicados en la model card y que probablemente refleja un recuento parcial del repositorio (por ejemplo, solo los tensores del drafter o de la torre de visión); debe tomarse con cautela.

La relevancia de este repositorio es práctica: permite desplegar un modelo de 26 B con visión y contexto largo en GPUs de consumo desde 8 GB de VRAM, descargando a RAM los expertos que no caben en la tarjeta. Está orientado a Linux y Windows sobre NVIDIA y a Linux sobre AMD Radeon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con torre de visión y drafter de decodificación especulativa; presumiblemente MoE por la referencia a "expertos que no caben") |
| Parámetros totales | 26 B según la model card del autor; 2304 según el campo de safetensors de Hugging Face (dato inconsistente, ver limitaciones) |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1 000 000 tokens (1M) |
| Tipos de cuantización | Q4_K_XL (modelo principal, UD de unsloth), BF16 (torre de visión), Q8_0 (drafter GGUF), BF16 safetensors (drafter original) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo, visión y drafter Q8_0), safetensors (drafter BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. La model card menciona explícitamente "the experts that don't fit stay in RAM", lo que indica una arquitectura de mezcla de expertos (MoE) con parámetros que pueden descargarse a memoria del sistema cuando no caben en VRAM. El paquete incluye además una torre de visión independiente en BF16 (`mmproj`) y un drafter de decodificación especulativa, lo que confirma un diseño multimodal con aceleración por propuesta y verificación de tokens.

Sobre el entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no hay datos en la información disponible. El repositorio añade un vector de control (`refusal-direction`) generado por Maya a partir del propio modelo, de 9,8 KB, destinado a una función opcional de ablación de rechazos; no forma parte del entrenamiento original.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable de Off a Max.
- Procesamiento de imágenes mediante torre de visión BF16 incluida en el paquete.
- Tool calling / function calling.
- Contexto largo de hasta 1M tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante drafter: el modelo propone tokens y verifica cada uno, de modo que la salida sigue siendo la del modelo original pero con menor latencia.
- Ejecución local en GPUs de consumo mediante descarga parcial de expertos a RAM.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia sobre documentación extensa: con hasta 1M tokens de contexto, se puede cargar un repositorio de documentación o un corpus legal completo y hacer preguntas sobre él sin fragmentar en trozos.
- Análisis de imágenes en local: la torre de visión BF16 permite describir capturas, diagramas o documentos escaneados sin enviar datos a servicios externos, útil en entornos con requisitos de privacidad.
- Agentes con tool calling: el soporte de function calling permite integrar el modelo en flujos que consultan APIs, bases de datos o sistemas internos, con razonamiento multi-paso en modo thinking.
- Despliegue en estaciones de trabajo con GPU modesta: con 8 GB de VRAM y unos 13 GB de RAM, el modelo puede ejecutarse en un portátil o equipo de oficina con RTX 20 o superior, lo que facilita prototipado sin infraestructura de servidor.
- Generación de código asistida en local: el modelo puede integrarse en editores o pipelines de CI/CD mediante tool calling, manteniendo el código dentro de la organización.
- Investigación sobre alineación y rechazos: el vector de control incluido permite experimentar con ablación de rechazos desde la configuración de Maya, sin modificar los pesos del modelo.
- Procesamiento por lotes de conversaciones largas: el contexto de 1M tokens y la decodificación especulativa reducen el coste por documento en tareas de resumen o extracción sobre hilos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM mínima: 8 GB en NVIDIA (V100, RTX 20 y posteriores), con aproximadamente 13 GB de RAM del sistema para los expertos que no caben en la GPU.
- AMD: Radeon desde 24 GB o APU Halo, en Linux.
- Sistema operativo: Linux y Windows en NVIDIA; Linux en AMD.
- Configuración multi-GPU: soporta una o dos GPUs.
- Cabe en GPU de consumo: sí, desde una RTX 2060 de 8 GB en adelante, con descarga parcial a RAM.
- Opciones de despliegue: Project Maya (`./maya.sh --setup --model inkling-2-mini`), que descarga y verifica el modelo Q4_K_XL de unsloth, el fichero de visión y uno de los drafters. Al ser GGUF, es compatible con el ecosistema llama.cpp, aunque la model card solo documenta el flujo de Maya.
- Latencia y throughput: no disponibles; la decodificación especulativa está pensada para reducir la latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling 2 Mini (este paquete) | 26 B (según model card) | 1M | Sí | Apache 2.0 | GGUF / safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa fiable con alternativas de tamaño o tarea similares.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parámetros: el campo de safetensors indica 2304 parámetros mientras que la model card afirma 26 B; conviene verificar el modelo base antes de dimensionar infraestructura.
- No hay información sobre idiomas soportados; el rendimiento en castellano no está documentado.
- No hay benchmarks publicados, por lo que no se puede evaluar la calidad frente a alternativas.
- El rendimiento con contexto de 1M tokens en GPUs de 8 GB no está cuantificado; la descarga de expertos a RAM puede degradar la latencia de forma notable.
- El vector de ablación de rechazos es una herramienta experimental generada por Maya; su uso puede alterar el comportamiento de seguridad del modelo y no está avalado por Thinking Machines.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base; los ficheros derivados (cuantizaciones, drafter) mantienen la misma licencia según la model card.
- Riesgo de alucinación: no documentado específicamente para este modelo; aplican las precauciones habituales en producción.
- El soporte de AMD se limita a Linux y a GPUs de 24 GB o APUs Halo, lo que reduce las opciones de despliegue en ese ecosistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/Inkling-2-Mini-Maya-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Project Maya: https://github.com/mw00/project-maya

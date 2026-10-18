# florianvoss/Qwen3.5-0.8B-Autoround-a16w4

## Resumen

Qwen3.5-0.8B-Autoround-a16w4 es un paquete de artefactos compilados del modelo vision-lenguaje Qwen3.5-0.8B, preparado por el usuario florianvoss para ejecutarse sobre aceleradores SiMa.ai Modalix mediante el runtime LLiMa. No es un modelo entrenado desde cero ni un checkpoint en safetensors: es el resultado de compilar el modelo fuente simaai/Qwen3.5-0.8B-Autoround-Safetensors con el compilador ModelGraph de SiMa, aplicando cuantización INT4 con grupo de 256 y excepciones en precisión mixta. Forma parte de la colección Neat 0.6.0, centrada en despliegues de borde de la familia Qwen3.5.

El modelo subyacente es el miembro más pequeño (0,8 mil millones de parámetros) de la serie Qwen3.5 de Alibaba Cloud, una familia multimodal con pipeline image-text-to-text orientada a inferencia local ligera. Esta variante concreta fija la longitud de contexto en 4096 tokens y la resolución de imagen en 448 × 448, valores seleccionados en el momento de la compilación y no modificables en tiempo de ejecución.

Su relevancia es acotada pero clara: demuestra el flujo completo de compilación y despliegue de un VLM de 0,8B en hardware de borde no-GPU, con pesos INT4, activaciones BF16 y caché KV en INT8. El propio autor advierte de que la validación se limita a la compilación y al despliegue local, sin mediciones de precisión ni de rendimiento en Modalix.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje de la serie Qwen3.5 (image-text-to-text), compilado con ModelGraph de SiMa; detalle de capas y mecanismo de atención no disponible |
| Parámetros totales | ~0,8 mil millones (0,8B) |
| Parámetros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | 4096 tokens (fijada en compilación; grupo de prefill de 128) |
| Tipos de cuantización | Pesos INT4 con grupo de 256 (G256) y excepciones en precisión mixta; activaciones BF16; embeddings y caché KV en INT8 |
| Idiomas soportados | No disponible en la metadata del repositorio; la serie Qwen3.5 se describe como multilingüe |
| Licencia | Apache 2.0 (se aplican los términos del modelo fuente) |
| Formato de pesos | Artefactos compilados LLiMa/ELF para SiMa Modalix: `elf_files/` con 107 ejecutables y `devkit/` con assets de runtime; no hay safetensors ni GGUF |
| Resolución de imagen | 448 × 448 (fija) |
| Hardware objetivo | SiMa.ai Modalix con runtime LLiMa compatible |
| Tamaño del repositorio | 1,5 GB |
| Compartición de filtros | Activada por defecto en los componentes de lenguaje |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base: se sabe que Qwen3.5-0.8B es un modelo multimodal de la familia Qwen3.5, con pipeline image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje. Los detalles de número de capas, dimensionalidad, tipo de atención o composición del corpus de entrenamiento no se han publicado en la documentación consultada. Tampoco consta si el modelo fuente incorporó RLHF, DPO u otra fase de alineamiento.

La contribución técnica de este repositorio no está en el entrenamiento, sino en el proceso de compilación. El autor compila el checkpoint pre-cuantizado con AutoRound usando ModelGraph nativo, lanza 16 procesos en paralelo (uno por hilo de simulador), habilita la compartición de filtros en los componentes de lenguaje y fija en tiempo de compilación tanto la ventana de contexto (4096) como la resolución de entrada (448 × 448). El resultado son ejecutables ELF específicos del acelerador, acompañados de un `compile.sh` que documenta la descarga de la fuente y los argumentos completos de compilación, y de un `compilation.json` que registra las revisiones del modelo fuente y del compilador. Esto permite reproducir la build en un entorno de Model Compiler compatible, pasando `MODEL_DIR`, `OUTPUT_DIR` y argumentos adicionales.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto: el pipeline declarado es image-text-to-text, con entrada de imagen a 448 × 448.
- Comprensión de imágenes y respuesta en lenguaje natural (descripción, respuesta a preguntas sobre la imagen).
- Razonamiento e instrucciones: la serie Qwen3.5 se presenta como una mejora en razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Capacidades multilingües heredadas de la familia Qwen3.5 (número exacto de idiomas no disponible).
- Ejecución en hardware de borde SiMa Modalix a través de LLiMa, sin dependencia de GPU dedicada.
- Contexto de 4096 tokens, suficiente para conversaciones de varios turnos breves o para concatenar instrucción más metadatos de una imagen.
- No consta soporte explícito de tool calling, function calling ni modo thinking en la documentación de esta build; dado que el contexto y el pipeline están fijados en compilación, estas capacidades no deben asumirse.
- Capacidad de recompilación: el paquete incluye el script y los argumentos para regenerar los artefactos con otro contexto o resolución, siempre dentro del entorno de compilación de SiMa.

## Casos de uso

- Inspección visual en línea de producción: integrado en un dispositivo Modalix junto a la cámara, el modelo recibe fotogramas de 448 × 448 y devuelve una descripción o una respuesta de validación en lenguaje natural, sin enviar imágenes a la nube.
- Asistente de campo sin conectividad: con 4096 tokens de contexto y pesos INT4, cabe en el presupuesto de memoria de un equipo de borde y permite diálogos multi-turno sobre documentación o sobre lo que ve la cámara del operario.
- Extracción de datos de etiquetas y formularios: el modelo puede leer una imagen de un albarán o una etiqueta y devolver los campos en texto estructurado, útil en logística donde no se quiere depender de un servicio externo.
- Descripción de escenas para accesibilidad: un dispositivo portátil con Modalix puede narrar el entorno al usuario con latencia local, apoyándose en la ventana de 4096 tokens para mantener el hilo de la conversación.
- Preetiquetado y triaje en cámaras industriales: filtrado previo de imágenes (¿hay defecto?, ¿qué tipo?) antes de enviar solo los casos dudosos a un modelo mayor en servidor, reduciendo ancho de banda y coste.
- Robótica móvil y AGV: interpretación de comandos en lenguaje natural combinados con la imagen de la cámara para tareas de navegación asistida o manipulación guiada por voz.
- Demostraciones y pruebas de concepto de la colección Neat 0.6.0: sirve como referencia reproducible de un pipeline completo de compilación y despliegue de un VLM de 0,8B en Modalix.
- Moderación local de contenido visual: clasificación y descripción de imágenes en el propio dispositivo para decidir si se reenvían o se descartan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de precisión y rendimiento en Modalix no se han realizado, y que la validación se limita a que la compilación completa y el despliegue local finalizaron correctamente y a la verificación de checksums de los ficheros subidos.

## Requisitos de hardware

- Hardware objetivo: acelerador SiMa.ai Modalix con un runtime LLiMa compatible. No se distribuyen artefactos para GPU convencional.
- Huella de pesos: al tratarse de 0,8B de parámetros en INT4 (≈0,5 bytes por parámetro), el bloque de pesos ronda los 0,4 GB; el repositorio completo ocupa 1,5 GB por la inclusión de `devkit/` y los 107 ejecutables de `elf_files/`.
- Memoria adicional: activaciones en BF16 y caché KV en INT8 para 4096 tokens; el fabricante no publica cifras de memoria total requerida.
- GPU de consumo: estos artefactos no se ejecutan en RTX 4090, A100, H100 ni similares. Para correr el modelo en GPU hay que usar el checkpoint fuente simaai/Qwen3.5-0.8B-Autoround-Safetensors o el Qwen3.5-0.8B original, que sí caben holgadamente en GPUs de consumo de 8 GB o menos en cuantizaciones de 4 bits (estimación basada en el tamaño del modelo, no en mediciones publicadas).
- Opciones de despliegue: `llima run ./Qwen3.5-0.8B-Autoround-a16w4` sobre Modalix. Para GPU/CPU, vLLM, llama.cpp u Ollama con el modelo original; la ficha de Ollama (`qwen3.5:0.8b`) confirma disponibilidad de la variante estándar.
- Latencia y throughput: no disponibles. El dato de "16 procesos en paralelo" de la model card corresponde al proceso de compilación, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Qwen3.5-0.8B-Autoround-a16w4 (este) | 0,8B | 4096 | ELF/LLiMa compilado | Apache 2.0 | Solo Modalix con LLiMa |
| simaai/Qwen3.5-0.8B-Autoround-Safetensors (fuente) | 0,8B | No disponible | Safetensors pre-cuantizado (AutoRound) | Apache 2.0 | Genérico, requiere runtime propio |
| florianvoss/Qwen3.5-0.8B-Autoround-a16w4-4k-448-Modalix | 0,8B | 4096 | ELF/LLiMa compilado | Apache 2.0 | Solo Modalix; variante equivalente con contexto 4K y 448 × 448 |
| Qwen3.5-0.8B (original, Alibaba Cloud) | 0,8B | No disponible | Múltiples (incluye GGUF vía Ollama) | No disponible en la información consultada | Amplia: Ollama, Qualcomm AI Hub, Jetson AI Lab |

No se dispone de datos de rendimiento comparativo (MMLU, MMMU u otros) para ninguno de los cuatro, por lo que la comparación se limita a parámetros, contexto, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia de validación de calidad: el autor indica que no se han realizado mediciones de precisión ni de rendimiento en Modalix; solo se verificó que la compilación y el despliegue local funcionan y que los ficheros cuadran con sus checksums.
- Dependencia de hardware: los artefactos son ELF específicos para SiMa Modalix. No hay ruta de ejecución en GPU, CPU ni en runtimes estándar como vLLM, llama.cpp, TGI u Ollama.
- Contexto recortado: 4096 tokens es un límite bajo para tareas de documento largo o conversaciones extensas, y está fijado en compilación, por lo que no se puede ampliar sin recompilar.
- Resolución de imagen fija: 448 × 448 puede degradar la lectura de texto pequeño o detalles finos en imágenes de alta resolución.
- Pérdida por cuantización: los pesos INT4 con grupo de 256 y la caché KV en INT8 introducen error numérico respecto al modelo en BF16; no se ha publicado ninguna evaluación de esa degradación.
- Riesgo de alucinación: inherente a un modelo de 0,8B, especialmente en preguntas sobre detalles de la imagen o en texto denso; conviene validación posterior en cualquier flujo crítico.
- Idiomas: la metadata no declara idiomas soportados; no debe asumirse un rendimiento homogéneo en castellano sin evaluarlo.
- Licencia: el repositorio es Apache 2.0, pero el propio autor remite a los términos del modelo fuente; conviene revisar la licencia de simaai/Qwen3.5-0.8B-Autoround-Safetensors y del Qwen3.5-0.8B original antes de un uso comercial.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validación independiente de la comunidad.
- Sesgos: no se ha publicado información sobre sesgos del modelo base en la documentación consultada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/florianvoss/Qwen3.5-0.8B-Autoround-a16w4
- Colección Neat 0.6.0: https://huggingface.co/collections/florianvoss/neat-060
- Modelo fuente (simaai/Qwen3.5-0.8B-Autoround-Safetensors): https://huggingface.co/simaai/Qwen3.5-0.8B-Autoround-Safetensors/tree/368d99afc0f454d646d9b2c847b635a82a016e9a
- Variante Modalix 4K/448: https://huggingface.co/florianvoss/Qwen3.5-0.8B-Autoround-a16w4-4k-448-Modalix
- Script de compilación: https://huggingface.co/florianvoss/Qwen3.5-0.8B-Autoround-a16w4/blob/main/compile.sh
- Metadatos de compilación: https://huggingface.co/florianvoss/Qwen3.5-0.8B-Autoround-a16w4/blob/main/compilation.json
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b
- Qwen3.5 0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Qwen3.5 0.8B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-0-8b/

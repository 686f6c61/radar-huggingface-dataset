# IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU

## Resumen
Ternary-Bonsai-2-27B es un modelo de lenguaje y visión de 27.000 millones de parámetros cuantizado en formato ternario (pesos restringidos a {-1, 0, +1}) y distribuido en GGUF por el usuario IamPradeep. Deriva de Bonsai-2-27B, que a su vez sigue la arquitectura Qwen3.5-27B, e incorpora un proyector multimodal para entrada de imágenes. Su propuesta principal es reducir el peso del modelo de 53,8 GB en F16 a aproximadamente 5,95 GB en la variante PTQ1_0, permitiendo ejecutarlo en una única GPU de Colab con soporte de contexto largo y visión.

El repositorio incluye además un paquete precompilado de `llama.cpp` (fork PrismML) y un notebook de dos celdas con interfaz de chat interactiva, de modo que el usuario puede tener el modelo funcionando en uno o dos minutos. Es relevante porque demuestra la viabilidad práctica de la cuantización ternaria extrema sobre modelos de escala media, un área con pocos artefactos públicos listos para usar.

La ficha se basa únicamente en la model card y los metadatos del repositorio; no se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-27B (Bonsai-2-27B), con proyector multimodal para visión |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens por defecto en el servidor (`-c`); los ejemplos CLI usan 8.192 |
| Tipos de cuantizacion | PTQ1_0 (trits densos, ~5,95 GB), PQ2_0, F16 (53,8 GB); proyector de visión en Q8_0 (~629 MB), BF16 o solo texto |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo, proyector mmproj y binarios `llama.cpp` precompilados) |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer densa heredada de Qwen3.5-27B a través de Bonsai-2-27B, con un cabezal de proyección visual que lo convierte en un modelo visión-lenguaje. La innovación central es la cuantización ternaria post-entrenamiento (PTQ) a trits densos {-1, 0, +1}, que comprime los pesos del modelo de lenguaje hasta ~5,95 GB frente a los 53,8 GB en F16, es decir, una reducción de aproximadamente 9x. El repositorio ofrece también una variante PQ2_0 y los pesos F16 originales para comparación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta el método exacto de cuantización ternaria más allá de la nomenclatura PTQ. El paquete incluye un fork de `llama.cpp` (PrismML) con soporte para estos pesos ternarios, atención flash (`-fa on`) y descarga completa de capas a GPU (`-ngl 99`).

## Capacidades
- Generación de texto conversacional multi-turno, con modo "Think" (razonamiento explícito) y modo "Instant" seleccionables.
- Razonamiento con cadena de pensamiento: el modo `--reasoning on` puede consumir más de 3.000 tokens de pensamiento en prompts simples y requiere al menos 8.192 tokens de salida.
- Comprensión de imágenes mediante proyector multimodal (Q8_0 o BF16), con soporte de adjuntar imágenes en el chat interactivo.
- Contexto largo de hasta 65.536 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Renderizado de matemáticas con KaTeX en la interfaz de chat, lo que sugiere capacidad para contenido matemático y fórmulas.
- Adjuntar archivos de código en la interfaz de chat.
- Guardado y carga de sesiones firmadas en formato `.json`.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso
- Asistente conversacional en Colab: el notebook de dos celdas permite desplegar un chat interactivo con modo Think/Instant en una GPU gratuita de Colab en uno o dos minutos, útil para prototipado rápido y demos.
- Análisis de imágenes en entornos con recursos limitados: con el proyector Q8_0 (~629 MB) y el modelo ternario (~5,95 GB), se pueden hacer preguntas sobre imágenes en una sola GPU consumer, por ejemplo para descripción de capturas o extracción de información visual.
- Procesamiento de documentos largos: la ventana de 65.536 tokens permite resumir o consultar contratos, informes o transcripciones extensas sin fragmentación agresiva.
- Razonamiento matemático asistido: el modo Think con parámetros de muestreo recomendados (temp 1.0, top-p 0.95) y el renderizado KaTeX lo hacen adecuado para tutoría o resolución de problemas paso a paso.
- Revisión de código en local: la posibilidad de adjuntar archivos de código y el bajo requisito de VRAM permiten usarlo como revisor o explicador de fragmentos en un portátil con GPU.
- Experimentación en investigación sobre cuantización ternaria: sirve como artefacto de referencia para medir la degradación de calidad frente a F16 y para validar kernels ternarios en `llama.cpp`.
- Despliegue de bajo coste en producción experimental: al caber en GPUs consumer, puede integrarse en servicios internos donde el coste de VRAM es el factor limitante.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: ~5,95 GB para los pesos PTQ1_0 más el proyector de visión Q8_0 (~629 MB); hay que añadir la caché KV para el contexto elegido, por lo que con 65.536 tokens el consumo crece de forma significativa.
- GPU recomendadas: cualquier GPU de Colab con suficiente VRAM para el modelo y la caché; el flujo está probado con `-ngl 99`, es decir, descarga completa en GPU.
- Cabe en GPU consumer: sí, en principio en tarjetas con 12 GB o más de VRAM para contexto moderado; con 8 GB conviene reducir `-c` o usar menos capas en GPU.
- Opciones de despliegue: `llama.cpp` (fork PrismML incluido en el repo), `llama-cli` y el servidor del notebook; no se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; la model card solo indica que la descarga del modelo tarda aproximadamente un minuto en Colab.

## Comparativa con modelos similares
No se dispone de datos de rendimiento para comparar directamente. A continuación se comparan características estructurales con alternativas de tamaño similar.

| Modelo | Parametros | Contexto | Cuantizacion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B (este) | ~26,9 B | 65.536 | Ternaria PTQ1_0 (~5,95 GB) | no disponible | GGUF en Hugging Face |
| Bonsai-2-27B (origen) | ~27 B | no disponible | F16 y otras | no disponible | no disponible en esta busqueda |
| Qwen3.5-27B (arquitectura base) | ~27 B | no disponible | BF16/F16 | no disponible | no disponible en esta busqueda |
| Modelos densos de ~27 B en 4 bits (referencia generica) | ~27 B | variable | ~4 bits (~14-16 GB) | variable | amplia |

La ventaja diferencial del modelo es el tamano en disco y VRAM; la contrapartida esperable es una mayor degradacion de calidad frente a cuantizaciones de 4 bits, extremo que no puede confirmarse sin benchmarks publicados.

## Limitaciones y advertencias
- No hay licencia declarada en el repositorio, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- No se especifican los idiomas soportados; el comportamiento multilingue es incierto.
- La cuantizacion ternaria extrema puede degradar la calidad respecto a F16 o a cuantizaciones de 4 bits; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los modelos generativos, agravado potencialmente por la cuantizacion agresiva.
- El modo de razonamiento consume muchos tokens (mas de 3.000 en prompts simples) y recomienda evitar la decodificacion greedy, lo que incrementa coste y latencia.
- El contexto de 65.536 tokens exige cache KV considerable; en GPUs con poca VRAM habra que reducirlo.
- Depende de un fork especifico de `llama.cpp` (PrismML) y de bibliotecas CUDA 12 instaladas via pip; la portabilidad a otros runtimes no esta garantizada.
- El modelo es un artefacto de terceros derivado de Bonsai-2-27B; la trazabilidad del entrenamiento y de los datos originales no esta documentada en este repositorio.
- Solo 291 descargas y 0 likes en el momento de la consulta: poca validacion comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU
- Notebook interactivo de Colab: https://colab.research.google.com/#fileId=https://huggingface.co/IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU/blob/main/Ternary-Bonsai-2-27B-GGUF-Interactive-UI.ipynb
- Imagen de configuracion del servidor: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU/resolve/main/Ternary-Bonsai-2-27B-Server-Setup.png
- Demostracion de generacion de respuesta: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU/resolve/main/Ternary-Bonsai-2-27B-Response-Generation.gif

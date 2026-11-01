# Hansda/DeskForge-Qwen3.5-4B-GGUF

## Resumen

DeskForge-Qwen3.5-4B-GGUF es la conversión a formato GGUF del modelo DeskForge-Qwen3.5-4B, desarrollado originalmente por docling-project y cuantizado por el usuario Hansda. Se trata de un modelo multimodal de tipo image-text-to-text especializado en GUI grounding y computer-use: recibe una captura de pantalla y una tarea en lenguaje natural, y genera la siguiente acción a ejecutar en forma de texto interpretable por un controlador. Con 4.205.751.296 parámetros, está construido sobre una base Qwen3.5 de 4B y se distribuye bajo licencia Apache-2.0.

La relevancia de esta ficha radica en su formato de distribución: el repositorio ofrece el decodificador en cuatro cuantizaciones independientes (Q4_K_M, Q5_K_M, Q8_0 y F16) más un codificador y proyector de visión compartido en F16, lo que permite desplegar el modelo en llama.cpp con un consumo de VRAM reducido. El decodificador Q4_K_M ocupa aproximadamente 2,7 GB y el componente de visión unos 672 MB, lo que hace viable la inferencia en hardware de consumo.

El modelo está pensado para pipelines de automatización de escritorio, agentes que operan interfaces gráficas y sistemas de control de aplicaciones. La configuración recomendada separa la inferencia de texto en GPU y la de visión en CPU, con un contexto de 4096 tokens y un límite de 128 tokens de salida por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje + codificador y proyector de visión); base Qwen3.5 |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (configuración de referencia en llama-server) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (decodificador); F16 (vision mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un decodificador de lenguaje de 4B parámetros derivado de Qwen3.5 y un codificador de visión con proyector asociado, empaquetado en el archivo `mmproj-DeskForge-Qwen3.5-4B-F16.gguf` (672.424.192 bytes). El decodificador se distribuye en cuatro cuantizaciones derivadas de forma independiente a partir de la conversión F16 de los pesos originales, lo que garantiza que cada variante parte de la misma referencia. La tarea principal es GUI grounding: dado un screenshot y un historial de acciones, el modelo emite la siguiente acción como texto con coordenadas normalizadas en el rango [0,1].

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card del repositorio cuantizado tampoco detalla innovaciones técnicas adicionales más allá del pipeline de conversión y de la plantilla de chat embebida (`chat_template.jinja`). El repositorio incluye artefactos de trazabilidad (`REPRODUCE.md`, `runtime-info.json`, `model-manifest.json`) con comandos, procedencia fijada y hashes SHA256 de cada archivo.

## Capacidades

- Comprensión de imágenes: procesa capturas de pantalla con un límite recomendado de 2.097.152 píxeles.
- GUI grounding: identifica elementos de interfaz y devuelve coordenadas como fracciones en [0,1] para que un controlador las interprete.
- Generación de acciones secuenciales: recibe el estado de la tarea y las acciones ya ejecutadas, y produce el siguiente paso.
- Razonamiento multi-paso orientado a agentes: el formato de prompt incluye el historial de acciones tomadas, lo que permite encadenar pasos.
- Conversación multimodal: pipeline image-text-to-text con soporte de plantilla de chat Jinja.
- Control de tokens de imagen: parámetros `--image-min-tokens` y `--image-max-tokens` para ajustar el coste computacional de la visión.
- Modo de razonamiento desactivable: el flag `--reasoning off` en llama-server sugiere soporte de un modo de razonamiento interno.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Automatización de escritorio: el modelo recibe una captura de pantalla y una tarea como "abrir el menú Archivo", y devuelve la coordenada del elemento a pulsar. Es adecuado porque su salida está normalizada en [0,1] y es directamente interpretable por un controlador de ratón y teclado.
- Agentes de computer-use multi-paso: el formato de prompt incluye las acciones ya tomadas, de modo que el modelo puede encadenar secuencias como abrir una aplicación, navegar por menús y rellenar formularios paso a paso.
- Testing automatizado de interfaces gráficas: integrado en un pipeline de CI, el modelo puede generar acciones sobre builds de aplicaciones de escritorio para validar flujos de usuario sin scripts frágiles basados en selectores.
- Asistentes de accesibilidad: dado un screenshot, el modelo localiza controles y sugiere la acción necesaria, lo que permite construir ayudas para usuarios con dificultades motoras o visuales.
- RPA (automatización robótica de procesos) ligera: sustituye grabaciones de macros por instrucciones en lenguaje natural, con inferencia local en llama.cpp y sin dependencia de servicios en la nube.
- Despliegue en hardware de consumo: con el decodificador Q4_K_M (unos 2,7 GB) y la visión en CPU, puede ejecutarse en estaciones de trabajo con GPU modesta para prototipado y demos.
- Investigación en GUI grounding: sirve como modelo base pequeño y reproducible para experimentos de localización de elementos y evaluación de agentes de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el decodificador: Q4_K_M ~2,7 GB, Q5_K_M ~3,1 GB, Q8_0 ~4,5 GB, F16 ~8,4 GB.
- Componente de visión: 672 MB en F16; la configuración de referencia lo ejecuta en CPU con `--no-mmproj-offload`.
- Configuración recomendada en la model card: texto en GPU (`-ngl 99`) y visión en CPU, con contexto de 4096 tokens y `-np 1`.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, Q4_K_M y Q5_K_M caben en GPUs de consumo con 6-8 GB de VRAM, Q8_0 requiere ~6 GB libres y F16 ~10 GB.
- Opciones de despliegue: llama.cpp en el commit `0ec4027` (llama-server); no se documentan otras alternativas como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La decodificación recomendada es greedy con un máximo de 128 tokens de salida por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| DeskForge-Qwen3.5-4B-GGUF | 4.205.751.296 | 4096 (config. de referencia) | GUI grounding / computer-use | Apache-2.0 | GGUF |
| Modelos Qwen3.5 de 4B (base) | ~4B | no disponible | Texto y multimodal general | no disponible | safetensors, GGUF |
| Otros modelos de GUI grounding de tamaño similar | no disponible | no disponible | GUI grounding | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en GUI grounding; su uso como modelo de chat general o de generación de código no está validado en la documentación.
- La salida son coordenadas normalizadas en [0,1] y texto de acción; requiere un controlador externo que interprete y ejecute dichas acciones.
- La model card recomienda greedy decoding y un máximo de 128 tokens de salida; desviarse de esta configuración puede degradar la calidad de las acciones.
- Límite de screenshot de 2.097.152 píxeles; imágenes mayores deben redimensionarse antes de la inferencia.
- Contexto de referencia de 4096 tokens; tareas con historiales de acciones muy largos pueden exceder la ventana.
- No se documentan los idiomas soportados ni sesgos conocidos; no hay información sobre evaluación de alucinaciones en la localización de elementos.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse `LICENSE`, `ATTRIBUTION.md` y `CHANGES.md` para las obligaciones de atribución de los componentes originales.
- La conversión GGUF depende de un commit concreto de llama.cpp (`0ec4027`); versiones distintas pueden no reproducir el comportamiento esperado.
- El repositorio tiene un número muy bajo de descargas (205) y ningún "like", lo que limita la evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hansda/DeskForge-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/docling-project/DeskForge-Qwen3.5-4B
- Revisión concreta del modelo base citada en la model card: https://huggingface.co/docling-project/DeskForge-Qwen3.5-4B/tree/72337e2fe9e8489ee324c40ea16da49d14b480ff
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/0ec4027a2a0183de87c007069adddc06e665f7de

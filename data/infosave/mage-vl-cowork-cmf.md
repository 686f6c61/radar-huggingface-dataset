# infosave/Mage-VL-Cowork-cmf

## Resumen

Mage-VL-Cowork-cmf es una conversión al formato CMF del modelo microsoft/Mage-VL-Cowork, un modelo visión-lenguaje de 4 mil millones de parámetros diseñado para agentes que operan un ordenador a través de la pantalla y la terminal. El modelo original, desarrollado por Microsoft, combina el codificador visual OneVision con un modelo de lenguaje Qwen3-4B que razona en modo `<think>` y es capaz de invocar herramientas `computer_use` y `bash`. La conversión la firma el usuario infosave y está pensada para ejecutarse con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de aprendizaje automático.

La relevancia de esta ficha radica en el empaquetado: los pesos se distribuyen como ficheros CMF únicos que funcionan sobre Vulkan/DX12 (NVIDIA, AMD, Intel), Metal (Apple silicon) y CPU, con dos cuantizaciones disponibles (q8_2f y q4tp). El modelo original reporta un 66,0 % en OSWorld-Verified, lo que lo sitúa como una alternativa compacta para tareas de automatización de escritorio.

El repositorio ocupa 8,1 GB y contiene los dos ficheros CMF. La licencia es Apache-2.0, heredada del release original, y los idiomas declarados son inglés, ruso y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje: codificador OneVision + modelo de lenguaje Qwen3-4B con modo de razonamiento `<think>` |
| Parametros totales | 4B (modelo de lenguaje base Qwen3-4B; total del conjunto no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (8 bits en el LM, 16 bits en el codificador visual) y q4tp (4 bits en el LM, 16 bits en el codificador visual); el codificador y el merger se ejecutan en float32 |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (ficheros únicos); pesos originales en Transformers no incluidos en este repo |

## Arquitectura y entrenamiento

La arquitectura es un modelo visión-lenguaje compuesto por un codificador de imagen OneVision que procesa capturas de pantalla a resolución nativa, un módulo merger que proyecta las representaciones visuales al espacio del modelo de lenguaje y un Qwen3-4B como decodificador. El modelo de lenguaje emplea razonamiento explícito en etiquetas `<think>` antes de emitir acciones, y está entrenado para invocar herramientas `computer_use` (con coordenadas en una rejilla de 0-999) y `bash`. El codificador visual divide la imagen en parches: una captura de 2206×1048 produce 9108 parches y 2277 tokens de lenguaje.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La conversión a CMF mantiene el codificador visual y el merger en 16 bits y ejecuta ambos en float32, de modo que el preprocesamiento y las filas entregadas al modelo de lenguaje coinciden con Transformers float32 (coseno 1.000000 en CPU para cada fila, superior a 0.999 con las unidades matriciales de GPU). La cuantización q8_2f preserva la generación greedy del original; q4tp no la preserva (mismo contenido, distintas palabras).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito en `<think>`.
- Comprensión de imágenes y capturas de pantalla a resolución nativa, incluida la comparación entre varias imágenes (`--image` repetible).
- Automatización de interfaz gráfica mediante la herramienta `computer_use`, con coordenadas en rejilla 0-999.
- Ejecución de comandos de terminal mediante la herramienta `bash`.
- Soporte de tool calling: las llamadas se devuelven en el JSON `<tool_call>` del modelo.
- Razonamiento multi-paso orientado a agentes (pensar antes de actuar).
- Capacidades multilingües en inglés, ruso y chino.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con partes de imagen en URL HTTP(S), data URL o ruta local.

## Casos de uso

- Automatización de tareas de escritorio: el modelo recibe una captura de pantalla y emite acciones `computer_use` con coordenadas para abrir carpetas, cerrar diálogos o manipular ventanas; su entrenamiento específico en OSWorld-Verified lo hace adecuado para este escenario.
- Operación de hojas de cálculo: con una captura de la hoja y una instrucción como "combina las celdas A1:D1 en budget.xlsx y guarda", el modelo puede razonar el plan y emitir las acciones necesarias.
- Agente de terminal: mediante la herramienta `bash`, puede ejecutar comandos para tareas de administración, scripts o procesamiento de ficheros descritos en lenguaje natural.
- Verificación visual de cambios en pantalla: al aceptar varias imágenes, puede comparar el estado antes y después de una acción ("¿qué ha cambiado en la pantalla?"), útil en bucles de agente con comprobación de resultado.
- Asistencia técnica guiada: un servidor `cortiq serve` compatible con OpenAI permite integrar el modelo en un chat que recibe capturas del usuario y devuelve instrucciones o acciones concretas.
- Despliegue en estaciones de trabajo sin Python: al ejecutarse con `cortiq` sobre Vulkan, Metal o CPU, encaja en entornos corporativos donde no se permite instalar frameworks de ML.
- Prototipado de agentes GUI en portátiles: la cuantización q4tp (unos 4 GB de memoria GPU) permite probar flujos de agente en GPUs de consumo o en un Mac de 16-24 GB.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| OSWorld-Verified (modelo original) | 66,0 % |
| Perplejidad wikitext-2, primeros 2048 tokens (q8_2f) | 125,6 |
| Perplejidad wikitext-2, primeros 2048 tokens (q4tp) | 128,7 |
| Perplejidad wikitext-2, original en Transformers | 121,8 |

Rendimiento de inferencia con cortiq 0.8.51 en NVIDIA A40 (48 GB, Vulkan):

| Fichero | Decodificacion (tok/s) | Prompt de 2k tokens (tok/s) | Decodificacion a 2k (tok/s) |
|---|---:|---:|---:|
| q8_2f | 66,8 | 855 | 53,2 |
| q4tp | 90,2 | 863 | 64,9 |

Rendimiento en Apple M4 (Metal):

| Fichero | Decodificacion (tok/s) | Prompt de 2k tokens (tok/s) |
|---|---:|---:|
| q8_2f | 17,4 | 147 |
| q4tp | 36 | 295 |

Codificador visual: 4,8 s para una captura de 2206×1048 en A40; 0,69 s para 512×512 y 10,8 s para 2206×1048 en M4. Un `cortiq serve` en marcha responde a una imagen de 512×512 en 1,7 s hasta el primer token.

## Requisitos de hardware

- VRAM estimada: q8_2f requiere unos 6 GB de memoria GPU; q4tp unos 4 GB.
- GPU recomendadas: NVIDIA A40 (mediciones publicadas); cualquier GPU NVIDIA, AMD o Intel compatible con Vulkan o DX12; Apple silicon mediante Metal.
- GPU de consumo: q4tp (unos 4 GB) cabe en GPUs de consumo con 6-8 GB de VRAM; en Mac de 16-24 GB el fichero de 4 bits es la opción práctica según el autor.
- CPU: modo solo CPU con `CMF_GPU=0`.
- Despliegue: motor `cortiq` (CLI `cortiq run` y servidor `cortiq serve` compatible con OpenAI). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- En Linux headless para Vulkan: instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Latencia y throughput: ver tabla de benchmarks (66,8-90,2 tok/s de decodificación en A40; 17,4-36 tok/s en M4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Mage-VL-Cowork-cmf (esta ficha) | 4B | no disponible | 66,0 % OSWorld-Verified (original) | Apache-2.0 | CMF |
| microsoft/Mage-VL-Cowork | 4B | no disponible | 66,0 % OSWorld-Verified | Apache-2.0 | Transformers (safetensors, presumiblemente) |
| Otros modelos de agente GUI de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparativa cuantitativa con terceros no está disponible.

## Limitaciones y advertencias

- El modelo es un agente, no un modelo de prosa: su perplejidad en wikitext-2 (121,8 en el original) es alta en comparación con modelos de lenguaje generalistas.
- La cuantización q4tp no reproduce la generación greedy del original (mismo contenido, distintas palabras); para paridad estricta debe usarse q8_2f.
- La longitud de contexto no está documentada en la información disponible; las capturas grandes consumen muchos tokens (2277 tokens para 2206×1048), lo que limita el número de imágenes por petición.
- El razonamiento `<think>` cuenta dentro de `--max-tokens`; valores bajos pueden truncar la respuesta antes de la acción.
- Solo se declaran inglés, ruso y chino; el rendimiento en castellano no está verificado.
- Riesgo de alucinación en la interpretación de pantallas y en la generación de coordenadas o comandos `bash`; requiere validación y sandboxing en producción.
- Las acciones de terminal (`bash`) implican riesgo de ejecución destructiva si no se aplican restricciones externas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base original y de los datos de entrenamiento.
- El ecosistema de ejecución es específico (`cortiq` 0.8.51 o superior); no hay soporte documentado para otros motores de inferencia.
- Repositorio con muy poca tracción (11 descargas, 0 likes) y creado en 2026-10-31; conviene verificar los hashes SHA-256 publicados antes de usar los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Mage-VL-Cowork-cmf
- Modelo base: https://huggingface.co/microsoft/Mage-VL-Cowork
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Scripts de paridad y referencia: https://github.com/infosave2007/cmf/tree/master/scripts/four

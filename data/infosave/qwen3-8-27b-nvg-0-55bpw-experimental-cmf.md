# infosave/Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf

## Resumen

Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf es una compresión extrema y experimental del modelo Qwen3.8-27B, publicada por el usuario infosave bajo el paraguas del proyecto cortiq. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización sub-1-bit que reduce las proyecciones de las capas a 0,55 bits por peso mediante el método NVG (desarrollado por Oleg Kirichenko), manteniendo el layout de almacenamiento de LittleBit (±1 factores con escalas de fila, columna y rango en 16 bits). El objetivo es explorar los límites prácticos de la compresión binaria de bajo rango y servir como banco de pruebas para el formato CMF y el runtime cortiq.

El archivo resultante ocupa 4,89 GB, lo que supone una reducción de 5,6× respecto al cuantizado q8_2f del mismo modelo base (27,38 GB). A pesar de la compresión, el autor es explícito: se trata de un modelo experimental que no funciona de forma fiable. Las respuestas cortas y factuales pueden ser correctas, y el código generado mantiene una forma sintáctica plausible, pero las respuestas largas repiten contenido y cometen errores de hechos y de lógica. Está pensado para experimentación, entrenamiento adicional o comparación, no para producción.

La relevancia actual reside en su enfoque metodológico: NVG elige los signos en la métrica de las activaciones de la propia capa, resuelve las escalas de forma cerrada y solo aplica entrenamiento ligero (31 M tokens frente a los aproximadamente 196 M tokens y 123,6 horas de H100 que requiere LittleBit para un modelo de 7B). El modelo está disponible bajo licencia Apache 2.0, con soporte para inglés, ruso y chino, y se ejecuta mediante la librería cortiq con backends CUDA y Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B), cuantizado con NVG (binary-low-rank, sub-1-bit) |
| Parametros totales | 27B (modelo base); pesos comprimidos a 0,55 bits/peso en las capas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVG a 0,55 bits/peso en 397 proyecciones de capa; embeddings y cabeza q8_2f a 8 bits; draft de decodificación especulativa q8_2f; 3 proyecciones q8_2f; tensores pequeños en f16 |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (formato propietario de cortiq); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parámetros, y aplica sobre él la compresión NVG. El método conserva el layout de LittleBit: factores ±1 con escalas de fila, columna y rango en 16 bits. La diferencia clave es cómo se construye ese layout. Mientras que LittleBit deriva los signos de los propios pesos mediante Dual-SVID y ajusta las escalas con fits de rango 1 seguidos de un entrenamiento intensivo con cuantización, NVG elige primero la topología (los signos) en la métrica de las activaciones de la capa, resuelve después las escalas de forma cerrada y solo aplica entrenamiento ligero. Un cambio de signo solo se mantiene si mejora la métrica de activaciones.

El entrenamiento se realizó sobre 31 M tokens, usando como profesor el propio q8_2f del modelo base. Esto contrasta con el presupuesto de LittleBit, que según NanoQuant requiere aproximadamente 196 M tokens y 123,6 horas de H100 para un modelo de 7B. El autor compara el punto de partida y el coste, no modelos terminados: en una prueba sin entrenamiento sobre Qwen3.5-0.8B a 1,0 bit, NVG alcanza una perplejidad de 656 frente a 2.719.570 de su implementación de LittleBit en el mismo contenedor (4.143× menor), partiendo de una perplejidad de referencia q8_2f de 24,27.

El archivo completo pesa 1,43 bits por peso en total, no 0,55: las 397 proyecciones en NVG ocupan 1,648 GB (0,547 bits/peso), los embeddings y la cabeza no atada en q8_2f ocupan 2,544 GB (8,00 bits/peso), el draft de decodificación especulativa sin entrenar ocupa 0,425 GB (8,01 bits/peso), 3 proyecciones que el codificador rechazó ocupan 0,210 GB (8,00 bits/peso) y los tensores pequeños en f16, tokenizer y directorio suman 0,067 GB. El modelo incorpora decodificación especulativa mediante un draft q8_2f, aunque el autor indica que no está entrenado.

## Capacidades

- Generación de texto: produce respuestas cortas y factuales que en ocasiones son correctas (por ejemplo, "The capital of France is **Paris**.").
- Generación de código: mantiene la forma sintáctica plausible, con firmas de función, type hints y docstrings, aunque no completa la lógica (el ejemplo de Fibonacci se queda en comentarios sin la recurrencia).
- Razonamiento aritmético: muy limitado e inconsistente; el autor documenta que "2 + 2 = 3" en inglés pero "2 + 2 = 4" en ruso.
- Capacidades multilingües: inglés, ruso y chino, con calidad desigual y errores factuales en los tres.
- Modo thinking: el runtime permite desactivarlo con `--no-think`; no se documentan capacidades adicionales de razonamiento extendido.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo no es fiable en respuestas largas.
- Visión, audio: no disponible; el pipeline es text-generation.

## Casos de uso

- Investigación sobre compresión extrema: el modelo sirve como banco de pruebas para estudiar el límite práctico de la cuantización sub-1-bit y comparar NVG con LittleBit y GPTQ en términos de perplejidad y coste de entrenamiento.
- Desarrollo y validación del runtime cortiq: permite probar los backends CUDA y Vulkan, el formato CMF y la decodificación especulativa en un modelo de 27B que cabe en 4,89 GB.
- Entrenamiento adicional (fine-tuning): el autor lo ofrece explícitamente para "train further"; investigadores pueden partir de este checkpoint para continuar el entrenamiento con más tokens o con un profesor mejor.
- Comparación de metodologías de cuantización: las tablas de perplejidad sobre WikiText-2, C4 y dominios específicos (documentación y código Rust de cortiq) permiten evaluar la degradación relativa frente a q8_2f y GPTQ q2tp.
- Pruebas de despliegue en hardware consumer: con 4,89 GB, el modelo cabe en GPUs de 24 GB como la RTX A5000, lo que permite medir latencia y throughput en entornos de gama media.
- Evaluación de robustez y alucinación: los ejemplos documentados (Yerevan como capital de Rusia, Jakarta en ruso, "Blue Light (Blight)") lo convierten en un caso de estudio útil sobre modos de fallo en modelos muy comprimidos.
- Docencia y divulgación: ilustra de forma tangible la relación entre bits por peso, tamaño de archivo y calidad, con cifras concretas y reproducibles.

## Benchmarks y rendimiento

Perplejidad sobre ventanas de 512 tokens (menor es mejor). El test de chat son las propias respuestas de q8_2f a 118 prompts en inglés y ruso, por lo que q8_2f puntúa tan bajo en él.

| Conjunto | q8_2f (27,38 GB) | GPTQ q2tp (11,41 GB) | Este archivo (4,89 GB) |
|---|---:|---:|---:|
| Chat test (19 ventanas) | 3,18 | no medido | 12,33 |
| WikiText-2 (12 ventanas) | 8,48 | 9,57 | 23,38 |
| WikiText-2 (64 ventanas) | 8,37 | 9,51 | 24,98 |
| Validación C4 (64 ventanas) | 12,51 | 14,06 | 42,60 |
| Documentación de cortiq (32 ventanas) | 7,97 | 9,57 | 58,95 |
| Código Rust de cortiq (32 ventanas) | 4,11 | 4,63 | 15,05 |

Rendimiento de inferencia medido con `cortiq bench`, un solo stream:

| Hardware | Modo | CUDA | Vulkan |
|---|---|---:|---:|
| RTX PRO 6000 Blackwell 96 GB (Colab G4, cortiq 0.9.10) | Decode | 90–93 tok/s | 62 tok/s |
| RTX PRO 6000 Blackwell 96 GB | Prompt de 4096 tokens | 618 tok/s, primer token 6,6 s | 64 tok/s, 64,4 s |
| RTX A5000 24 GB (cortiq 0.8.98) | Decode | 55–58 tok/s | 44 tok/s |
| RTX A5000 24 GB | Prompt de 4096 tokens | 282 tok/s, primer token 14,5 s | 48 tok/s, 84,8 s |

## Requisitos de hardware

- VRAM estimada para inferencia: 4,89 GB de pesos; el modelo completo cabe holgadamente en GPUs de 24 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) para máximo throughput; RTX A5000 (24 GB) validada por el autor; cualquier GPU NVIDIA con CUDA 12.x y driver actualizado.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB como la RTX A5000; el autor no ha medido en GPUs de 8–16 GB.
- Opciones de despliegue: cortiq-cli (versión 0.8.54 o superior; CUDA requiere 0.8.98 o superior), con backends CUDA (`CMF_GPU=cuda`) y Vulkan. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es propietario.
- Latencia y throughput: 90–93 tok/s en decode con CUDA en RTX PRO 6000 Blackwell; 55–58 tok/s en RTX A5000; 618 tok/s y 282 tok/s respectivamente en prefill de 4096 tokens. En Vulkan, 62 tok/s y 44 tok/s en decode.
- En Mac no existe kernel Metal para este formato; se ejecuta en CPU y el autor no ha medido el rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bits | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVG-0.55bpw (este) | 27B | no disponible | CMF, 0,55 bits en capas (1,43 bits total) | Apache 2.0 | Hugging Face, runtime cortiq |
| Qwen3.8-27B q8_2f (base cuantizado) | 27B | no disponible | q8_2f, 8 bits | Apache 2.0 | Hugging Face |
| Qwen3.8-27B GPTQ q2tp | 27B | no disponible | GPTQ, 2 bits | Apache 2.0 | Hugging Face |
| LittleBit (referencia metodológica) | 7B en el paper | no disponible | binary-low-rank, hasta 0,1 bits | no disponible | paper arXiv |

La comparación relevante es interna al ecosistema de cuantización: frente a q8_2f (27,38 GB) y GPTQ q2tp (11,41 GB), este archivo ocupa 4,89 GB pero multiplica la perplejidad por 2,4–7,4× en WikiText-2 y C4. LittleBit es la referencia metodológica directa, pero el autor no ha ejecutado su entrenamiento completo sobre estos modelos, por lo que no hay comparación de modelos terminados.

## Limitaciones y advertencias

- Modelo experimental no funcional: el propio autor advierte que "no es un modelo que funcione". Las respuestas largas repiten contenido y cometen errores de hechos y lógica.
- Alucinación factual documentada: identifica Yerevan como capital de Rusia, Jakarta en la versión rusa, y atribuye la dispersión atmosférica a un invento llamado "Blue Light (Blight)".
- Errores aritméticos: "2 + 2 = 3" en inglés, aunque acierta en ruso; inconsistencia entre idiomas.
- Generación de código incompleta: produce firmas y docstrings plausibles pero no implementa la lógica (Fibonacci sin recurrencia).
- Degradación severa de perplejidad: 23,38 en WikiText-2 frente a 8,48 de q8_2f, y 58,95 en documentación de cortiq frente a 7,97.
- Idiomas limitados a inglés, ruso y chino; no se documenta soporte de castellano.
- Longitud de contexto no especificada en la información disponible.
- Formato propietario CMF: no es compatible con safetensors, GGUF ni los runtimes habituales (vLLM, llama.cpp, Ollama, TGI); requiere cortiq-cli.
- Sin kernel Metal para macOS; solo ejecución en CPU, sin mediciones de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y la baja calidad desaconsejan cualquier despliegue en producción.
- El draft de decodificación especulativa no está entrenado, lo que puede afectar a la calidad de la decodificación.
- Tres proyecciones fueron rechazadas por el codificador y se mantienen en q8_2f, lo que introduce heterogeneidad en la compresión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio cortiq (releases): https://github.com/infosave2007/cmf/releases
- Paper de LittleBit: https://arxiv.org/abs/2506.13771
- Paper de NanoQuant: https://arxiv.org/abs/2602.06694
- Imagen explicativa del principio NVG: https://huggingface.co/infosave/Qwen3.8-27B-NVG-0.55bpw-Experimental-cmf/resolve/main/assets/nvg_principle_en.png

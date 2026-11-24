# mlx-community/Holo2-4B-bf16

## Resumen

Holo2-4B es un modelo multimodal de tipo image-text-to-text desarrollado por H Company, especializado en agentes que operan interfaces graficas (GUI agents) y en tareas de computer use. La version aqui descrita es la conversion a MLX en bfloat16 realizada por el equipo de mlx-community a partir de los pesos originales de Hcompany/Holo2-4B, orientada a la inferencia eficiente en hardware Apple Silicon. El modelo parte de la arquitectura Qwen3-VL (tag `qwen3_vl`) y cuenta con aproximadamente 4.437 millones de parametros (4,44 mil millones), con una torre de vision mantenida tambien en bfloat16.

El modelo resuelve el problema de la interaccion automatizada con entornos graficos: dada una captura de pantalla y una instruccion en lenguaje natural, Holo2-4B es capaz de localizar elementos de la interfaz y devolver coordenadas normalizadas en el rango [0, 1000] para tareas de clic, ademas de generar respuestas conversacionales sobre imagenes. Su relevancia actual radica en el auge de los agentes autonomos que navegan aplicaciones web y de escritorio, un caso de uso donde la precision de localizacion espacial y la latencia de inferencia son criticas.

Esta version concreta es una distribucion de pesos lista para ejecutarse con la libreria `mlx-vlm`, sin cuantizacion (bfloat16 puro), lo que la convierte en la referencia de maxima fidelidad numerica para validar el comportamiento del modelo original en Macs con chip Apple Silicon. La licencia Apache-2.0 del modelo original se preserva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal con torre de vision) |
| Parametros totales | 4.437.815.808 (aprox. 4,44 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 sin cuantizar; existen variantes MLX 8bit y 4bit referenciadas en benchmarks |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, bfloat16) |

## Arquitectura y entrenamiento

Holo2-4B se construye sobre la familia Qwen3-VL, una arquitectura transformer multimodal que combina un codificador de vision con un modelo de lenguaje para el procesamiento conjunto de imagen y texto. La torre de vision se mantiene en bfloat16 en esta conversion, sin cuantizacion, lo que preserva la precision de las representaciones visuales. El modelo base presenta embeddings atados (tied embeddings) y, en su checkpoint original, incluye un tensor `lm_head.weight` redundante que impide la carga directa con `mlx_vlm.convert` en versiones actuales de mlx-vlm; esta distribucion elimina dicho tensor para permitir la carga con la version publicada 0.8.0.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se emplearon tecnicas de RLHF o DPO. El modelo esta etiquetado como `finetune` respecto a su base, lo que sugiere un ajuste especifico para tareas de agentes GUI y computer use. La validacion realizada por el conversor incluye una comparacion de logits frente a los pesos originales en float32 con transformers en CPU, obteniendo una divergencia media de KL de 2,2e-4 a 720p y 1,8e-4 a 1080p, dentro del rango que produce transformers en bfloat16 sobre MPS (2e-4 a 3e-4).

## Capacidades

- Generacion de texto conversacional condicionada por imagen (pipeline image-text-to-text).
- Localizacion de elementos de interfaz: devuelve coordenadas enteras en escala [0, 1000] para tareas de clic.
- Comprension de capturas de pantalla en resoluciones 720p y 1080p.
- Soporte de razonamiento de agente y computer use (tags `agent`, `action`, `computer use`, `gui agents`).
- Procesamiento de prompts multi-imagen (validado con 3 capturas de 1920x1080, alrededor de 12k tokens de prompt).
- Capacidad de modo thinking desactivable (los benchmarks se ejecutan con thinking off).
- Soporte multilingue limitado al ingles segun la model card.
- No se documenta en la informacion disponible soporte explicito de tool calling o function calling nativo.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo recibe una captura de pantalla de la aplicacion bajo prueba y una instruccion como "pulsa el boton de enviar", devolviendo las coordenadas del elemento para que un driver de automatizacion ejecute el clic. Su precision del 89,6% en WebClick lo hace viable para suites de regresion visual.
- Agentes de navegacion web: integrado en un bucle de agente que captura la pantalla, consulta a Holo2-4B y ejecuta acciones sobre el navegador, permitiendo tareas multi-paso como rellenar formularios o navegar flujos de compra.
- Asistencia en escritorio para accesibilidad: un asistente que interpreta la pantalla del usuario y le indica donde pulsar para completar una tarea, aprovechando la salida de coordenadas normalizadas.
- RPA (automatizacion robotica de procesos) sobre aplicaciones legacy: al operar sobre capturas de pantalla en lugar de APIs, el modelo puede automatizar sistemas sin interfaz programable, con la ventaja de ejecutarse localmente en hardware Apple Silicon.
- Evaluacion y anotacion de datasets de GUI: el modelo puede generar etiquetas de localizacion sobre capturas para construir o ampliar conjuntos de entrenamiento de agentes.
- Prototipado rapido en Mac: gracias a la conversion MLX, un desarrollador puede validar flujos de computer use en un portatil Apple sin depender de GPUs dedicadas, con un tiempo hasta el primer token de 705 ms en una captura 1080p.

## Benchmarks y rendimiento

Resultados de precision en WebClick (1639 muestras, protocolo oficial de H Company, thinking off, greedy, 32 tokens nuevos):

| Modelo | Precision | IC 95% |
|---|---|---|
| MLX bf16 (este modelo) | 89,6% | 88,0 a 91,0 |
| MLX 8bit | 89,4% | 87,8 a 90,8 |
| MLX 4bit | 86,6% | 84,9 a 88,2 |

Referencia del autor original: H Company reporta 88,8% para Holo2-4B en WebClick-v1 con un harness distinto, por lo que no es estrictamente comparable.

Rendimiento en Apple M5 Max (128 GB), una captura 1920x1080, 2216 tokens de prompt, greedy:

| Motor | Tiempo hasta primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (bf16) | 705 ms | 60 tok/s | 10,1 GB (pico) |
| transformers bfloat16 MPS | 841 ms | 43 tok/s | 11,0 GB (pico) |
| llama.cpp (Metal) F16 | 1567 ms | 58 tok/s | 11,8 GB (RSS) |

Rendimiento con prompt multi-imagen (3 capturas 1920x1080, aprox. 12k tokens, 1024 tokens generados):

| Motor | Tiempo hasta primer token | Decodificacion | Memoria |
|---|---|---|---|
| MLX, este modelo (bf16) | 7,6 s | 31 tok/s | 11,6 GB (pico) |
| llama.cpp (Metal) F16 GGUF | 14,9 s | 26 tok/s | 11,8 GB (RSS) |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10-12 GB en bfloat16 para inferencia con una o varias imagenes; el pico reportado es de 10,1 GB con una captura 1080p y 11,6 GB con tres capturas.
- GPU recomendadas: Apple Silicon (M-series) por ser una conversion MLX; los datos de rendimiento proceden de un M5 Max con 128 GB. En el ecosistema CUDA, los pesos originales de Hcompany/Holo2-4B serian el punto de partida.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o superior; en GPUs dedicadas, una RTX 4090 (24 GB) alojaria holgadamente la version bf16 de 8,9 GB de pesos.
- Opciones de despliegue: `mlx-vlm` (version 0.8.0 o superior) para Apple Silicon; llama.cpp con Metal como alternativa (F16 GGUF); los pesos originales pueden servirse con transformers o vLLM en hardware CUDA.
- Latencia y throughput: 705 ms hasta el primer token y 60 tok/s de decodificacion en M5 Max con una imagen; 7,6 s y 31 tok/s con tres imagenes. Las cifras son indicativas porque la maquina estaba compartida con otras cargas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo2-4B (este, MLX bf16) | 4,44 mil millones | no disponible | GUI agents, computer use | Apache-2.0 | Hugging Face, MLX |
| Holo2-4B original (Hcompany) | 4,44 mil millones | no disponible | GUI agents, computer use | Apache-2.0 | Hugging Face, transformers |
| Variantes MLX 8bit y 4bit de Holo2-4B | 4,44 mil millones | no disponible | GUI agents, computer use | Apache-2.0 | Hugging Face, MLX |
| Qwen3-VL (familia base) | no disponible | no disponible | Vision-lenguaje general | no disponible | Hugging Face |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros modelos de GUI agents de tamano similar, por lo que la comparativa se limita a variantes del mismo modelo y a su familia arquitectonica.

## Limitaciones y advertencias

- Idiomas: la model card solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta validado.
- Longitud de contexto: no se documenta en la informacion disponible, lo que impide planificar cargas con prompts muy largos o historiales extensos.
- Alucinacion: al ser un modelo generativo que produce coordenadas, puede devolver puntos plausibles pero incorrectos sobre elementos inexistentes o ambiguos; se recomienda validar la accion antes de ejecutarla en produccion.
- Precision de localizacion: la cuantizacion a 4bit degrada la precision en WebClick del 89,6% al 86,6%, una diferencia de 3 puntos que puede ser relevante en tareas criticas.
- Sesgos: no se documentan en la informacion disponible analisis de sesgos del modelo original.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Hcompany/Holo2-4B y de la familia Qwen3-VL subyacente.
- Dependencia de version: esta conversion requiere mlx-vlm 0.8.0 exactamente; el arreglo del tensor `lm_head.weight` redundante llega en una version posterior (PR #2814), por lo que versiones intermedias pueden fallar al cargar.
- Entorno de validacion: los tiempos se midieron en una maquina compartida y algunos celdas variaron mas del 10%, por lo que deben tomarse como orientativos.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/mlx-community/Holo2-4B-bf16
- Modelo original: https://huggingface.co/Hcompany/Holo2-4B
- Dataset de evaluacion WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Web de H Company: https://www.hcompany.ai/
- PR de mlx-vlm que corrige la carga del checkpoint original: https://github.com/Neywa-Labs/mlx-vlm/pull/2814
- PR de mlx-vlm con mejora de velocidad de la torre de vision: https://github.com/Neywa-Labs/mlx-vlm/pull/2822

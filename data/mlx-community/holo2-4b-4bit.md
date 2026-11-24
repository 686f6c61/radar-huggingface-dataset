# mlx-community/Holo2-4B-4bit

## Resumen

Holo2-4B-4bit es la versión cuantizada a 4 bits del modelo multimodal Holo2-4B desarrollado por H Company, publicada por la comunidad mlx-community para su ejecución en Apple Silicon mediante el framework MLX. Se trata de un modelo de imagen-texto-a-texto especializado en agentes de interfaz gráfica (GUI agents) y automatización de "computer use": recibe capturas de pantalla y devuelve acciones como clics con coordenadas precisas. La arquitectura subyacente es Qwen3-VL (tag oficial `qwen3_vl`), con 4.437.815.808 parámetros totales y un repositorio de 3,1 GB tras la cuantización.

La relevancia de esta ficha radica en que permite ejecutar localmente en un Mac un modelo de localización visual de elementos de interfaz con una precisión del 86,6% en el benchmark WebClick, con un pico de memoria de 4,4 GB y 167 tok/s de decodificación en un Apple M5 Max. Es una alternativa práctica frente a soluciones en la nube para pipelines de automatización de navegador o de escritorio, con licencia Apache-2.0 que permite uso comercial.

La cuantización es de tipo 4-bit afín con tamaño de grupo 64, manteniendo la torre de visión en bfloat16 para preservar la calidad de la percepción visual. El modelo solo declara soporte para inglés. La model card original del modelo base debe consultarse para detalles de entrenamiento y arquitectura completa, ya que esta ficha se apoya en la información disponible del repositorio cuantizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal, tag `qwen3_vl`) |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín, group size 64; torre de visión en bfloat16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Holo2-4B es un modelo multimodal de la familia Qwen3-VL orientado a tareas de agente visual. La versión aquí descrita es una conversión a MLX realizada con mlx-vlm 0.8.0, en la que los pesos del transformer de lenguaje se cuantizan a 4 bits afín (group size 64) mientras que la torre de visión se conserva en bfloat16. El repositorio elimina el tensor redundante `lm_head.weight` presente en el checkpoint original junto a los embeddings atados, que impedía la carga en las versiones actuales de mlx-vlm; este arreglo se incorporó posteriormente en mlx-vlm #2814.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card original de Hcompany/Holo2-4B es la referencia para esos detalles. La innovación técnica destacable de esta versión es la propia cuantización: mantiene la precisión de localización visual en un 86,6% frente al 89,6% en bf16, con una pérdida medida de 2,9 puntos (test exacto pareado, p < 0,001) y sin pérdida medible en 8 bits.

## Capacidades

- Generación de texto e imagen-texto-a-texto a partir de capturas de pantalla.
- Localización visual de elementos de interfaz: devuelve coordenadas de clic como enteros en escala [0, 1000].
- Agentes de interfaz gráfica (GUI agents) y automatización de "computer use".
- Soporte de acciones estructuradas en JSON (respuesta de clic).
- Razonamiento multimodal sobre imágenes de escritorio y navegador.
- Capacidad de procesar múltiples capturas en un mismo prompt (se han probado prompts con 3 imágenes a 1920x1080, unos 12k tokens de prompt).
- Modo thinking desactivable (el protocolo de evaluación usa thinking off).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Multilingüe: solo inglés declarado.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo recibe capturas de pantalla de la aplicación y devuelve coordenadas de clic sobre botones o campos, integrándose en pipelines de QA que validan flujos de usuario sin selectores CSS frágiles.
- Agentes de navegador web: dado un objetivo en lenguaje natural y una captura de la página, el modelo localiza el elemento a pulsar, lo que permite construir agentes de navegación que operan sobre webs no instrumentadas.
- Asistentes de escritorio en local: al ejecutarse con 4,4 GB de pico de memoria en Apple Silicon, permite desplegar un asistente que observa la pantalla del usuario y sugiere o ejecuta acciones sin enviar capturas a la nube.
- RPA ligera en macOS: sustituye scripts de automatización basados en coordenadas fijas por localización semántica de elementos, más robusta ante cambios de resolución o de disposición.
- Extracción de datos de paneles y dashboards: combinado con un orquestador, el modelo identifica controles de filtrado y paginación para navegar informes de forma autónoma.
- Evaluación de accesibilidad: localizar elementos interactivos en capturas ayuda a auditar si los controles son identificables y accesibles visualmente.
- Prototipado de investigación en agentes GUI: su licencia Apache-2.0 y su reducido consumo permiten experimentar con políticas de clic en entornos de laboratorio con hardware de consumo.

## Benchmarks y rendimiento

Precisión de clic en WebClick (Hcompany/WebClick, 1639 muestras, protocolo oficial de localización, thinking off, greedy, 32 tokens nuevos, coordenadas en [0, 1000]):

| Modelo | Precisión | IC 95% |
|---|---|---|
| MLX bf16 | 89,6% | 88,0 – 91,0 |
| MLX 8bit | 89,4% | 87,8 – 90,8 |
| MLX 4bit (este modelo) | 86,6% | 84,9 – 88,2 |

H Company reporta un 88,8% para Holo2-4B en WebClick-v1 en su model card, con un harness distinto y por tanto no estrictamente comparable. Veinte de las 1639 respuestas comenzaron con texto libre en lugar del JSON de clic y se contaron como fallos.

Rendimiento en Apple M5 Max (128 GB), una captura 1920x1080, 2216 tokens de prompt, greedy:

| Motor | Tiempo al primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 759 ms | 167 tok/s | 4,4 GB (pico) |
| transformers, bfloat16, MPS | 841 ms | 43 tok/s | 11,0 GB (pico) |
| llama.cpp (Metal), Q4_K_M | 1643 ms | 133 tok/s | 5,8 GB (RSS) |

Rendimiento con prompt largo multi-imagen (3 capturas 1920x1080, unos 12k tokens de prompt, 1024 tokens generados):

| Motor | Tiempo al primer token | Decodificación | Memoria |
|---|---|---|---|
| MLX, este modelo (4bit) | 8,0 s* | 60 tok/s | 6,0 GB (pico) |
| llama.cpp (Metal), F16 GGUF | 14,9 s | 26 tok/s | 11,8 GB (RSS) |

El asterisco indica variación superior al 10% entre ejecuciones; la máquina estaba compartida con otras tareas, por lo que los tiempos son indicativos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4,4 GB de pico con una captura 1080p; 6,0 GB de pico con un prompt de 3 capturas (unos 12k tokens).
- El repositorio ocupa 3,1 GB en disco.
- Diseñado para Apple Silicon mediante MLX; validado en Apple M5 Max de 128 GB.
- Cabe en GPUs de consumo con al menos 6–8 GB de memoria si se usa un motor compatible; en Apple Silicon, un Mac con 16 GB de memoria unificada es suficiente para los escenarios medidos.
- GPUs recomendadas: no disponible para CUDA en la información proporcionada; el formato MLX está orientado a Apple Silicon. Para NVIDIA habría que usar el modelo base en otro formato.
- Opciones de despliegue: mlx-vlm (0.8.0 o superior), con `python -m mlx_vlm.generate`. Se ha comparado con llama.cpp (Metal) usando un GGUF convertido no oficial; no hay release GGUF oficial en la información disponible.
- Latencia y throughput: 759 ms al primer token y 167 tok/s de decodificación en el escenario de una captura; 8,0 s y 60 tok/s en el escenario multi-imagen largo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión WebClick | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo2-4B-4bit (este) | 4,44B | no disponible | 86,6% (4bit) | Apache-2.0 | MLX, safetensors |
| Holo2-4B (base) | 4,44B | no disponible | 88,8% (reportado por H Company, harness distinto) | Apache-2.0 | transformers, safetensors |
| Holo2-4B en bf16 vía MLX | 4,44B | no disponible | 89,6% | Apache-2.0 | MLX, safetensors |
| Holo2-4B en 8bit vía MLX | 4,44B | no disponible | 89,4% | Apache-2.0 | MLX, safetensors |

No se dispone de datos de otros modelos de agentes GUI comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión de localización en 2,9 puntos frente a bf16 (86,6% frente a 89,6%), con significación estadística. Si la precisión de clic es crítica, conviene usar la versión de 8 bits o bf16.
- El modelo solo declara inglés; el rendimiento en otros idiomas no está documentado.
- Veinte de las 1639 respuestas de WebClick comenzaron con texto libre en lugar del JSON esperado, lo que indica que el formato de salida no es totalmente determinista y requiere validación en producción.
- Riesgo de alucinación de coordenadas: una predicción fuera de la caja objetivo se cuenta como fallo, y en elementos pequeños o capturas de baja resolución el error puede crecer.
- Los tiempos de referencia se midieron en una máquina compartida y con variabilidad superior al 10% en algunos casos; no deben tomarse como cifras de producción garantizadas.
- La validación se ha hecho con mlx-vlm 0.8.0 y mlx 0.32.4; versiones anteriores fallan al cargar el checkpoint original por el tensor `lm_head.weight` redundante, aunque este repositorio ya lo elimina.
- El formato MLX limita el despliegue a Apple Silicon; para otros aceleradores hay que recurrir al modelo base u otras conversiones.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse la atribución a H Company y a mlx-community.
- No hay información sobre sesgos del modelo base en la documentación disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/Holo2-4B-4bit
- Modelo base: https://huggingface.co/Hcompany/Holo2-4B
- Web de H Company: https://www.hcompany.ai/
- Dataset de evaluación WebClick: https://huggingface.co/datasets/Hcompany/WebClick
- Pull request de mlx-vlm #2814 (carga del checkpoint): https://github.com/Neywa-Labs/mlx-vlm/pull/2814
- Pull request de mlx-vlm #2822 (aceleración de la torre de visión): https://github.com/Neywa-Labs/mlx-vlm/pull/2822

# johnsor/Mage-Flow-Edit-Turbo-GGUF

## Resumen

Mage-Flow-Edit-Turbo-GGUF es una cuantización en formato GGUF del transformer de difusión Mage-Flow-Edit-Turbo, desarrollado originalmente por Microsoft. El modelo realiza edición de imágenes guiada por instrucciones en lenguaje natural: recibe una o varias imágenes de referencia y un prompt de texto, y genera una nueva escena que incorpora el contenido de la referencia. El repositorio lo publica el usuario johnsor y su aportación es exclusivamente la conversión a GGUF para su uso con stable-diffusion.cpp.

Se trata de un transformer de difusión multimodal de 4.115.745.408 parámetros (aproximadamente 4B) que trabaja a resolución nativa. Su rasgo diferencial es que funciona en 4 pasos de muestreo con `cfg-scale` 1.0, lo que lo hace viable en CPU. La cuantización Q6_K reduce el peso del transformer de 8,23 GB en bf16 a 3,15 GB, y según el autor es el nivel mínimo de cuantización que mantiene la calidad sin artefactos.

El modelo resulta relevante porque demuestra que la edición de imágenes por instrucción puede ejecutarse en hardware de consumo sin GPU dedicada, con un pipeline completo de unos 6,2 GB que incluye transformer, codificador de texto y VAE. La licencia MIT del modelo original facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión multimodal (Mage-Flow-Edit-Turbo) |
| Parametros totales | 4.115.745.408 (aprox. 4B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K, Q4_K, Q4_0 (GGUF); bf16 como fuente |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (transformador); safetensors para VAE; GGUF para codificador de texto |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un transformer de difusión multimodal de resolución nativa con 4B de parámetros, orientado a edición de imágenes por instrucción. El pipeline completo separa tres componentes: el transformer de difusión (objeto de esta cuantización), un codificador de texto multimodal Qwen3VL-4B-Instruct (que incluye un `mmproj` para procesar la imagen de referencia) y un VAE (`mage_flow_vae_bf16.safetensors`). El checkpoint Turbo está diseñado para 4 pasos de muestreo con `cfg-scale` 1.0, frente a los 30 pasos del checkpoint base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco detalla innovaciones arquitectónicas internas más allá de la naturaleza multimodal del transformer y su capacidad de operar a resolución nativa. La conversión a GGUF se realizó con `sd-cli -M convert` y tipo `q6_K` a partir de `diffusion_models/mage_flow_edit_turbo_bf16.safetensors` del repackage de Comfy-Org, con stable-diffusion.cpp en la revisión `c92d73c408515c94beef32161bb5960764fde7a0`; el proceso tarda unos 75 segundos.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural: transforma una fotografía de referencia en una nueva escena descrita por el prompt.
- Entrada de múltiples imágenes de referencia mediante flags `-r` repetidos.
- Procesamiento de la imagen de referencia a través del `mmproj` del codificador Qwen3VL-4B-Instruct; sin él, la referencia se ignora.
- Generación texto-a-imagen e imagen-a-imagen (pipeline declarado `image-to-image`).
- Muestreo rápido en 4 pasos con `cfg-scale` 1.0, apto para ejecución en CPU.
- Soporte de resolución nativa, con ejemplos a 512x512 y referencias a 1024 px en las pruebas de cuantización.
- No se documentan capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Edición fotográfica asistida en local: un usuario pasa una foto y una instrucción ("este perro con una bufanda roja en un parque nevado") y obtiene la escena editada sin conexión a servicios en la nube, gracias a los 4 pasos de muestreo y al pipeline de 6,2 GB.
- Prototipado de producto en equipos sin GPU: con 99 segundos por imagen a 512x512 en un Ryzen 7 4800H en CPU, sirve para validar conceptos visuales en portátiles convencionales.
- Composición de escenas con múltiples referencias: el soporte de varios flags `-r` permite combinar objetos o personas de distintas imágenes en una sola generación.
- Herramientas de edición integradas en aplicaciones de escritorio: la licencia MIT y el formato GGUF facilitan el empaquetado dentro de aplicaciones nativas como offgrid, para el que fue cuantizado.
- Generación de variaciones visuales a partir de una imagen base: útil en flujos de diseño gráfico donde se parte de un activo existente y se piden modificaciones de contexto o vestuario.
- Automatización de contenido visual en pipelines por lotes: la ejecución en CPU con stable-diffusion.cpp permite procesar colas de ediciones en servidores sin acelerador dedicado.
- Educación e investigación sobre difusión multimodal: el pipeline separado (transformer, codificador, VAE) y las cuantizaciones publicadas permiten estudiar el efecto de la precisión en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card aporta datos cualitativos y de rendimiento de ejecución, no métricas estándar:

| Configuracion | Tamano | Resultado cualitativo |
|---|---|---|
| bf16 (fuente) | 8,23 GB | limpio |
| Q8_0 | 4,08 GB | limpio |
| Q6_K | 3,15 GB | limpio (este archivo) |
| Q5_K | 2,65 GB | retícula ondulada en zonas planas, peor a 1024 px |
| Q4_K | 2,33 GB | acanalado intenso en todo el fotograma |
| Q4_0 | 2,17 GB | sin imagen, acanalado rosa plano |

Rendimiento de ejecución reportado: 99 segundos de extremo a extremo a 512x512 en un Ryzen 7 4800H, solo CPU.

## Requisitos de hardware

- VRAM/RAM estimada: el pipeline completo ocupa unos 6,2 GB (transformer Q6_K 3,15 GB, codificador de texto Q4_K_M 2,33 GB, mmproj Q8_0 0,42 GB y VAE bf16 0,32 GB).
- GPU recomendadas: no se especifican en la información disponible; el ejemplo de referencia se ejecuta en CPU.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño del pipeline (6,2 GB) es compatible con GPUs de 8 GB o más, pero no se documenta un ejemplo verificado.
- Despliegue: stable-diffusion.cpp (`sd-cli`) con `--diffusion-fa` y `--offload-to-cpu`; el autor lo cuantizó para offgrid. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 99 segundos por imagen a 512x512 en CPU (Ryzen 7 4800H); Q6_K es algo más lento que Q5_K según el autor. No se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mage-Flow-Edit-Turbo-GGUF (Q6_K) | 4,12B | no disponible | GGUF | MIT | Cuantización para stable-diffusion.cpp; 4 pasos, CPU viable |
| Mage-Flow-Edit-Turbo (bf16, Microsoft) | 4,12B | no disponible | safetensors | MIT | Modelo original; 8,23 GB; repos en el Hub no accesibles según el autor |
| Mage-Flow-Edit-Turbo (base, no Turbo) | no disponible | no disponible | no disponible | MIT | Requiere 30 pasos frente a 4 del Turbo |
| Qwen3-VL-4B-Instruct | 4B | no disponible | GGUF | no disponible en la información | Codificador de texto del pipeline, no un editor de imágenes comparable |

No se dispone de información sobre otros modelos de edición de imágenes por instrucción en los datos proporcionados, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Por debajo de Q6_K la calidad se degrada de forma sistemática: Q5_K introduce una retícula regular en zonas planas que se hace evidente a 1024 px, y Q4_K y Q4_0 producen artefactos graves o ninguna imagen. No es un modelo apto para 4 bits.
- El repositorio solo contiene el transformer; requiere descargar por separado el codificador Qwen3VL-4B-Instruct, su `mmproj` y el VAE, lo que añade complejidad de despliegue.
- Sin el archivo `mmproj`, la imagen de referencia se ignora por completo, lo que puede pasar desapercibido si no se configura correctamente.
- Los repositorios `microsoft/Mage-Flow` y `microsoft/Mage-Flow-Edit-Turbo` no están accesibles en el Hub según el autor; la fuente utilizada es el repackage de Comfy-Org, lo que introduce dependencia de un tercero.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas del prompt; no hay información al respecto.
- El rendimiento en CPU es lento (99 segundos por imagen a 512x512); no es adecuado para aplicaciones interactivas en tiempo real sin GPU.
- Licencia MIT, lo que permite uso comercial, pero la responsabilidad sobre los derechos de las imágenes de entrada y salida recae en el usuario.
- La cuantización la mantiene un autor individual (johnsor) sin relación con Microsoft; no hay garantía de mantenimiento ni de paridad exacta con el modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnsor/Mage-Flow-Edit-Turbo-GGUF
- Modelo base: https://huggingface.co/microsoft/Mage-Flow-Edit-Turbo
- Repositorio de Microsoft Mage: https://github.com/microsoft/Mage
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Codificador de texto Qwen3-VL-4B-Instruct GGUF: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- VAE y pesos fuente (Comfy-Org): https://huggingface.co/Comfy-Org/Mage-Flow
- Aplicación offgrid: https://github.com/woelper/offgrid

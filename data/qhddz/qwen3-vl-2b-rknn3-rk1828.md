# qhddz/qwen3-vl-2b-rknn3-rk1828

## Resumen

Qwen3-VL-2B (RKNN3 / RK1828) es una conversión del modelo vision-language Qwen3-VL-2B de Alibaba Qwen al formato propietario RKNN3 de Rockchip, publicada por el usuario qhddz. El paquete incluye el codificador visual en fp16 y el LLM cuantizado en GRQ W4A16, ambos compilados específicamente para la NPU Rockchip RK1828, con un host x86_64 conectado por PCIe. No se trata de un modelo nuevo, sino de artefactos de despliegue listos para ejecutar en hardware de borde.

El interés de esta ficha radica en que permite ejecutar un modelo multimodal de 2B parámetros en una NPU de bajo consumo sin necesidad de compilar ni convertir nada: todos los ficheros `.rknn` fueron generados con los pipelines oficiales de `rknn3-model-zoo` y verificados en hardware real. Según el autor, alcanza 62,7 tokens/s en generación y 231 ms en el procesamiento visual.

La relevancia es práctica para despliegues edge de captioning y VQA: se evita la dependencia de GPU y se obtiene un rendimiento medido sobre el silicio objetivo. El repositorio ocupa 2,0 GB e incluye un demo C++ precompilado para x86_64 con las librerías de runtime necesarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (Qwen3-VL-2B): codificador visual + LLM decoder |
| Parametros totales | 2B (según nombre del modelo; no se detalla desglose en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LLM en GRQ W4A16; codificador visual en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` + `.weight` (RKNN3), tokenizer en GGUF, embeddings en `.bin` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-2B, un transformer multimodal de la familia Qwen3-VL que combina un codificador de visión con un LLM decoder para tareas de image captioning y visual question answering. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a la model card original de Alibaba Qwen, no incluida en esta conversión.

La innovación técnica de este repositorio es el pipeline de despliegue: el LLM se cuantiza con GRQ en esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) y el codificador visual se mantiene en fp16, todo compilado a RKNN3 para la NPU RK1828. Los artefactos se generaron con los pipelines de `rknn3-model-zoo` y el autor afirma haberlos validado en hardware real. El paquete separa visión y LLM en dos grafos independientes (`.rknn` + `.weight`) y aporta tokenizer GGUF y embeddings binarios para el runtime.

## Capacidades

- Generación de texto condicionada por imagen (image captioning).
- Visual question answering (VQA) de un turno, según el ejemplo de la model card ("Describe this image").
- Procesamiento de imágenes con resolución configurable en el demo (parámetro 384x384 en el ejemplo).
- Inferencia en NPU Rockchip RK1828 vía PCIe desde host x86_64.
- No se documentan tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües específicas en la información disponible.

## Casos de uso

- Descripción automática de imágenes en dispositivos de borde: el modelo genera captions en la NPU RK1828 con 231 ms de procesamiento visual, adecuado para etiquetado en tiempo casi real sin GPU.
- VQA en kioscos o terminales industriales: preguntas sobre imágenes capturadas por cámara local, respondidas íntegramente en la NPU y con el host x86_64 como orquestador.
- Moderación y clasificación visual en el edge: descripción de contenido de imágenes antes de decidir si se envían a un servidor central, reduciendo ancho de banda.
- Asistencia a personas con discapacidad visual: descripción de escenas mediante un dispositivo con RK1828 y una cámara, con latencia de generación de 62,7 tokens/s.
- Inspección de documentos y formularios escaneados: extracción descriptiva de contenido visual en entornos sin conectividad.
- Prototipado rápido de productos multimodales: el demo C++ precompilado y los artefactos listos para ejecutar permiten validar la viabilidad de un caso de uso antes de invertir en un pipeline propio.
- Telemetría visual en vehículos o drones: captioning de fotogramas a bordo con un consumo propio de una NPU de borde.

## Benchmarks y rendimiento

| Metrica | Valor (medido en RK1828) |
|---|---|
| Generación de texto | 62,7 tokens/s |
| Procesamiento visual | 231 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas cifras son las de latencia y throughput medidas por el autor en hardware RK1828.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 con runtime RKNN3; el host debe ser x86_64 y conectarse por PCIe.
- No se ejecuta en GPU convencional: los pesos están compilados para la NPU y no son portables a CUDA, ROCm ni Metal.
- VRAM estimada en GPU: no aplica; el repositorio de 2,0 GB incluye los grafos compilados y el runtime.
- Memoria del dispositivo: no disponible en la model card; depende de la asignación de la NPU RK1828.
- Despliegue: demo C++ precompilado (`demo_x86_64.tar.gz`) con `LD_LIBRARY_PATH=./lib`; requiere descomprimir antes de ejecutar porque Hugging Face no permite binarios sin empaquetar.
- Latencia y throughput: 62,7 tokens/s de generación y 231 ms de visión, medidos por el autor.
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al estar los pesos en formato RKNN3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3-VL-2B (RKNN3 / RK1828) | 2B | no disponible | RKNN3 | Apache-2.0 | NPU RK1828 |
| Qwen3-VL-2B original (Alibaba Qwen) | 2B | no disponible en esta ficha | safetensors (previsiblemente) | Apache-2.0 | GPU/CPU |
| Otras conversiones RKNN de modelos VL de 2B | no disponible | no disponible | RKNN3 | variable | NPU RK1828 |

La comparativa con alternativas cuantitativas no está disponible: la model card no ofrece métricas frente a otros modelos ni referencia a conversiones competidoras en el mismo hardware. La diferencia principal frente al Qwen3-VL-2B original es el formato compilado y la plataforma de ejecución, no la capacidad del modelo.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso comunitario ni validación independiente más allá de la del autor.
- Los artefactos están ligados a la NPU RK1828 y al runtime RKNN3; no son portables a otras plataformas sin reconversión.
- La model card no documenta sesgos, tasas de alucinación ni comportamiento en idiomas distintos del inglés; el prompt de ejemplo está en inglés.
- No se especifica la longitud de contexto soportada, lo que impide planificar conversaciones multi-turno largas.
- El demo es de un solo turno y de un solo par imagen-pregunta; no se documentan APIs de servidor ni integración con frameworks de agentes.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-VL-2B conserva su propia licencia de Alibaba Qwen; conviene verificar los términos del modelo original antes de producción.
- El rendimiento medido (62,7 tokens/s, 231 ms de visión) procede de una única configuración de hardware y no incluye intervalos de confianza ni condiciones de prueba.
- La fecha de creación del repositorio (2026-11-17) y la ausencia de pipeline declarado limitan la trazabilidad del proceso de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/qhddz/qwen3-vl-2b-rknn3-rk1828
- Repositorio de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- Modelo base Qwen3-VL-2B: no disponible en la información proporcionada.

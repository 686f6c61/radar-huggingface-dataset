# ndvuongsp/rsgg-vrsbench-models

## Resumen

RSGG (Remote Sensing Scene Graph Generation and Geospatial Captioning) es un sistema de visión-lenguaje para teledetección publicado por el autor ndvuongsp bajo el identificador `ndvuongsp/rsgg-vrsbench-models`. No se distribuye como un modelo único, sino como un paquete de dos artefactos complementarios: un detector de objetos Faster R-CNN con backbone ResNet-50-FPN-v2 entrenado sobre imágenes VRSBench, y un adaptador LoRA PEFT para el modelo base `Qwen/Qwen2.5-14B-Instruct` que transforma grafos de escena de teledetección en descripciones textuales. El sistema completo resuelve dos tareas: generación de grafos de escena (detección y relación entre objetos) y captioning geoespacial.

El modelo se presenta como el estado del arte en el benchmark VRSBench (NeurIPS 2024), con resultados declarados de 70,35 % de mIoU y 85,97 % de Acc@0.5 en visual grounding, y 35,28 de CIDEr en image captioning sobre las 9.350 imágenes de test. El autor también reporta resultados de transferencia zero-shot en DIOR-RSVG, UCM-Captions, Sydney-Captions y RSICD. Estos resultados proceden exclusivamente de la model card del autor y no se han verificado de forma independiente en la información disponible.

El repositorio ocupa 0,3 GB y contiene los pesos del detector (~166 MB) y el adaptador LoRA (~107 MB), pero no incluye los pesos completos del modelo base Qwen2.5-14B-Instruct, que debe descargarse por separado. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema compuesto: Faster R-CNN (ResNet-50-FPN-v2) para detección + LoRA sobre Qwen2.5-14B-Instruct (transformer decoder-only) para captioning |
| Parametros totales | No disponible para el conjunto; el modelo base Qwen2.5-14B-Instruct tiene 14B; el detector es ResNet-50-FPN-v2 (tamaño no especificado en la información); el adaptador LoRA ocupa ~107 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-14B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | El ejemplo de uso emplea cuantización 4-bit NF4 con BitsAndBytes; no se documentan otros formatos |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch state dict) para el detector; adaptador PEFT/LoRA para el LLM; safetensors como tag del repo |

## Arquitectura y entrenamiento

El sistema RSGG se articula en dos etapas. La primera es un detector Faster R-CNN con backbone ResNet-50-FPN-v2, entrenado durante 5 épocas sobre 20.264 imágenes de entrenamiento de VRSBench con pérdida Complete IoU (CIoU). El detector cubre 27 clases (26 clases de primer plano de teledetección más fondo). La segunda etapa es un adaptador LoRA PEFT montado sobre Qwen2.5-14B-Instruct, entrenado sobre 20.230 pares de grafo de escena a texto de teledetección. El adaptador transforma la representación estructurada del grafo de escena en una descripción en lenguaje natural.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de los recuentos de pares e imágenes, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La contribución técnica declarada es la combinación de un detector especializado en teledetección con un LLM ajustado mediante LoRA para generar captioning fundamentado (grounded) a partir de grafos de escena.

## Capacidades

- Generación de texto descriptivo (captioning) a partir de grafos de escena de imágenes de teledetección.
- Detección de objetos en imágenes aéreas y satelitales con 26 clases de primer plano.
- Visual grounding: localización de objetos referidos mediante lenguaje natural, con métricas declaradas de mIoU, Acc@0.5 y mAP@50.
- Generación de grafos de escena: relaciones entre objetos detectados en la imagen.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado; el pipeline es image-to-text.
- Capacidades heredadas del modelo base Qwen2.5-14B-Instruct (no verificadas en esta ficha).

## Casos de uso

- Análisis automatizado de imágenes satelitales: el detector identifica objetos (edificios, vehículos, infraestructura) en imágenes de alta resolución y el adaptador LoRA genera descripciones textuales de la escena, útil para inventariado geoespacial.
- Generación de informes de teledetección: a partir de un grafo de escena, el sistema produce captioning en inglés que puede integrarse en pipelines de documentación automática de imágenes aéreas.
- Búsqueda y recuperación de imágenes por lenguaje natural: el visual grounding permite localizar objetos descritos textualmente dentro de una imagen, aplicable a sistemas de consulta sobre archivos de imágenes satelitales.
- Anotación asistida de datasets: el sistema puede pre-anotar objetos y relaciones en nuevas imágenes de teledetección, reduciendo el coste de etiquetado manual antes de revisión humana.
- Monitorización de cambios en el territorio: comparando grafos de escena generados sobre imágenes de distintas fechas, se pueden detectar variaciones en la presencia y disposición de objetos.
- Transferencia a dominios afines: los resultados zero-shot declarados en DIOR-RSVG, UCM-Captions, Sydney-Captions y RSICD sugieren uso en datasets de teledetección distintos al de entrenamiento, previa validación.
- Integración en pipelines de visión por computador: el detector `.pth` puede cargarse de forma independiente en PyTorch para tareas de detección, sin necesidad del LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Tarea | Métrica | RSGG | SOTA previo (LLaVA-1.5 / GeoChat) |
|---|---|---|---|---|
| VRSBench (9.350 imágenes test) | Visual grounding | mIoU | 70,35 % | 48,60 % / 45,10 % |
| VRSBench (9.350 imágenes test) | Visual grounding | Acc@0.5 | 85,97 % | 36,30 % / 39,60 % |
| VRSBench (9.350 imágenes test) | Visual grounding | mAP@50 | 84,19 % | 54,30 % / 51,80 % |
| VRSBench (9.350 imágenes test) | Image captioning | CIDEr | 35,28 | 33,90 / 28,20 |
| VRSBench (9.350 imágenes test) | Image captioning | METEOR | 25,85 | 21,90 / 21,10 |
| VRSBench (9.350 imágenes test) | Image captioning | ROUGE-L | 38,42 | 36,90 / 35,20 |
| VRSBench (9.350 imágenes test) | Image captioning | BLEU-4 | 15,64 | 14,70 / 13,80 |
| DIOR-RSVG (1.623 consultas) | Zero-shot grounding | mIoU | 82,26 % | 28,40 % (GeoChat) |
| UCM-Captions (210 test) | Zero-shot captioning | CIDEr | 61,17 | 48,20 (GeoChat) |
| Sydney-Captions (58 test) | Zero-shot captioning | BLEU-4 | 20,70 | 11,50 (GeoChat) |
| RSICD (1.093 test) | Zero-shot captioning | BLEU-1 | 38,86 | 31,40 (GeoChat) |

No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este sistema.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El ejemplo de la model card usa cuantización 4-bit NF4 del modelo base Qwen2.5-14B-Instruct, lo que reduce sustancialmente los requisitos frente a la precisión completa, pero no se indica la VRAM resultante.
- GPU recomendadas: no especificadas en la información disponible. El uso de `device_map="auto"` en el ejemplo sugiere despliegue flexible según memoria disponible.
- Viabilidad en GPU de consumo: no confirmada en la información; la cuantización 4-bit del modelo de 14B es el mecanismo previsto para reducir requisitos, pero no se aportan cifras.
- Opciones de despliegue: el ejemplo oficial emplea Transformers, PEFT y BitsAndBytes. No se documentan vLLM, llama.cpp, Ollama ni TGI para este sistema.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RSGG (este modelo) | 14B (base) + detector ResNet-50-FPN-v2 | No disponible | Detección + LoRA para captioning de teledetección | Apache 2.0 | Pesos del detector y adaptador LoRA en HF; modelo base aparte |
| LLaVA-1.5 | No disponible en la información | No disponible | VLM generalista | No disponible en la información | No disponible en la información |
| GeoChat | No disponible en la información | No disponible | VLM especializado en teledetección | No disponible en la información | No disponible en la información |

La comparación se limita a las referencias que el autor cita como SOTA previo en su model card; no se dispone de datos verificados de parámetros, contexto o licencia de LLaVA-1.5 y GeoChat en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden únicamente de la model card del autor y no se han verificado de forma independiente.
- El idioma soportado es exclusivamente inglés; no se documenta soporte multilingüe.
- El sistema no es un modelo único: requiere cargar el modelo base Qwen2.5-14B-Instruct por separado, lo que añade complejidad de despliegue y requisitos de memoria.
- El detector está limitado a 26 clases de primer plano de teledetección; objetos fuera de ese conjunto no serán reconocidos.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de robustez fuera de los benchmarks de teledetección.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen2.5-14B-Instruct, que no se detalla en la información disponible.
- No se documentan limitaciones de longitud de contexto ni comportamiento en producción (latencia, throughput, estabilidad).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ndvuongsp/rsgg-vrsbench-models
- Web del proyecto: https://vuongndlst.github.io/rsgg-vrsbench-dashboard/
- Repositorio de código: https://github.com/vuongndlst/rsgg-vrsbench-dashboard
- Benchmark VRSBench (NeurIPS 2024): https://github.com/ZHENG-L-H/VRSBench
- VRSBench (repositorio alternativo): https://github.com/lx709/VRSBench
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct

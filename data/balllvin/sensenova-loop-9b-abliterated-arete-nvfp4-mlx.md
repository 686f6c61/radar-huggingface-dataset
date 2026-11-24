# balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX

## Resumen

SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX es una conversión a MLX de 4 bits (afín, grupo 64) del build NVFP4 de balllvin sobre el modelo base sensenova/SenseNova-Loop-9B, un modelo multimodal de tipo image-text-to-text. La cadena de derivación incluye una cuantización QAD, un proceso de abliteration (eliminación de la alineación de rechazo) y un ajuste fino con el dataset NousResearch/arete-data-pairs. El resultado es un checkpoint de 7,4 GB pensado para ejecutarse en Apple Silicon mediante la librería MLX.

El modelo conserva la arquitectura "looped" del original: 32 capas físicas que se ejecutan en 56 visitas (un plan de bucle 56-de-32), con routers mHC portados a MLX. Acepta texto e imágenes y genera texto, igual que el checkpoint oficial, e incluye una torre visual sin cuantizar de 0,91 GB en bf16 (333 tensores) copiada sin cambios del modelo base.

Es relevante para desarrolladores que trabajan en Mac con chip de la serie M y necesitan un modelo multimodal de ~3.100 millones de parámetros efectivos con licencia Apache 2.0, servidor OpenAI-compatible incluido y rendimiento medido en hardware consumer. No obstante, se trata de un build de investigación, sin alineación de seguridad y sin benchmarks de imagen publicados para esta conversión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con ejecución en bucle (32 capas físicas, 56 visitas), routers mHC, torre visual multimodal |
| Parametros totales | 3.119.461.248 (según safetensors) |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza capas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 4-bit (grupo 64); cabeza LM a 8-bit por defecto, opción fast-head; torre visual en bf16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 16,9 GB; pesos cuantizados de 7,4 GB + visual.safetensors de 0,91 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un esquema de ejecución en bucle: 32 capas físicas que se recorren 56 veces, con routers mHC que gestionan el enrutamiento entre visitas. La conversión a MLX replica el plan de ejecución del build NVFP4 y porta los routers; las puertas (gates) permanecen en fp32 pero devuelven bf16, de modo que el tronco se ejecuta en bf16. Las 20 normalizaciones 2x2 alternas del checkpoint se tratan como un mapa de Möbius, cuya forma cerrada exacta para k pasos se compila para la forma de decodificación. La cabeza LM se cuantiza a 8 bits por defecto, con una variante fast-head opcional.

El entrenamiento original del modelo base no está documentado en la información disponible. Sobre él se aplicaron, según el autor: cuantización QAD, abliteration (modificación del comportamiento de rechazo) y un ajuste fino con NousResearch/arete-data-pairs, con FineWeb-Edu citado como dataset asociado. La torre visual no fue tocada por ninguno de estos pasos. El autor reporta una validación local ("gate") sobre 160 posiciones de WikiText con teacher forcing: NLL de 3,04790 con tronco bf16 frente a 3,04762 del camino iterativo fp32 original (+0,00028) y top-1 del 98,1%; con cabeza de 8 bits, NLL 3,04775 y top-1 del 99,4%; con fast-head, top-1 de 199/199 y KL media de 0,000544.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes y generación de texto (image-text-to-text), con la torre visual del checkpoint oficial.
- Procesamiento de contenido de imagen en formato OpenAI-compatible (`image_url` con data URL o ruta local) mediante el servidor incluido.
- Renderizado de la plantilla de chat y uso de Qwen3VLProcessor en el servidor.
- Streaming SSE en el servidor incluido.
- Ejecución con bucle configurable (`--loops`), siendo 2 el ajuste entrenado.
- Comportamiento abliterated: responde a 93 de 99 prompts dañinos del conjunto sellado del build NVFP4.
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agentes o razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar empíricamente cómo la eliminación del comportamiento de rechazo afecta a las respuestas ante prompts dañinos, con una tasa reportada de 93/99 en el conjunto sellado. Adecuado para laboratorios que analizan mecanismos de seguridad en modelos abiertos.
- Inferencia multimodal local en Mac: con 7,5 GB de huella en modo por defecto, cabe en equipos Apple Silicon de 16 GB o más y permite prototipar aplicaciones de descripción de imágenes y VQA sin GPU dedicada.
- Servidor OpenAI-compatible en estación de trabajo: el script `tools/serve.py` expone `/v1/chat/completions` con streaming SSE y arranque bajo demanda (salida tras 30 minutos de inactividad), útil para integrar el modelo en herramientas que ya hablan la API de OpenAI.
- Procesamiento por lotes con concurrencia moderada: con `--fast-head` y `--max-batch 8` el autor mide 53,9 tok/s agregados a 4 streams, lo que sirve para tareas de generación en paralelo de baja escala en local.
- Evaluación de técnicas de cuantización: la cadena QAD → NVFP4 → MLX 4-bit con métricas de NLL y top-1 frente a bf16 y fp32 proporciona un caso de estudio reproducible para investigar degradación por cuantización en arquitecturas con bucle.
- Experimentación con arquitecturas looped: el plan de 56 visitas sobre 32 capas y los routers mHC permiten estudiar el compromiso entre profundidad efectiva y coste computacional (el autor mide 27,3 ms/token con 1 bucle frente a la calidad superior con 2).
- Pruebas de pipelines de visión en MLX: la torre visual en bf16 sin cuantizar y los scripts `tools/test_vision.py` permiten validar la ruta de imagen de extremo a extremo antes de integrarla en una aplicación mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión MLX en la información disponible. El autor indica que la tabla sellada de rechazo/MMLU/NLL corresponde al build NVFP4 de origen y no se reejecutó sobre MLX.

Métricas de calidad reportadas (gate local, 160 posiciones de WikiText con teacher forcing):

| Configuracion | NLL | Top-1 | Referencia |
|---|---|---|---|
| Tronco bf16 + routers | 3,04790 | 98,1% | fp32 iterativo: 3,04762 (+0,00028) |
| Cabeza 8-bit (por defecto) | 3,04775 | 99,4% | bf16: 3,04790 (-0,00015) |
| Fast head | -0,00079 frente a bf16 | 199/199 | KL media 0,000544 |
| `--loops 1` | 3,921 | no disponible | frente a 3,041 con 2 bucles |

Rendimiento medido en un M5 Pro de 64 GB (carga del sistema de 7 a 15, cifras conservadoras):

| Modo | Huella estable | Decodificación (tok/s) | Extremo a extremo, 64 tok | TTFT |
|---|---|---|---|---|
| Por defecto, cabeza 8-bit | 7,5 GB | 20,8 | 18,0 | 0,44 s |
| `--fast-head` | ~8,0 GB | 26,6 | 22,8 | 0,25-0,32 s |

Concurrencia en el servidor (`--fast-head`, `--max-batch 8`): 22,6 / 33,2 / 53,9 / 51,3 tok/s totales con 1 / 2 / 4 / 8 streams (por stream: 22,6 / 16,6 / 13,5 / 6,4-11,3). El build MLX original de estos pesos medía 8,1 tok/s.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 7,5 GB en modo por defecto; ~8,0 GB con `--fast-head`; el repo completo ocupa 16,9 GB en disco.
- Hardware objetivo: Apple Silicon con MLX (mediciones en M5 Pro de 64 GB). No se documenta soporte CUDA.
- Cabe en equipos consumer Apple Silicon: con 7,5-8,0 GB de huella más el sistema operativo, un Mac con 16 GB de memoria unificada es el mínimo razonable; 32 GB o más deja margen para lotes mayores.
- GPU NVIDIA (A100, H100, RTX 4090): no disponible; este build es específico de MLX y no se distribuye en GGUF ni en formato para vLLM/TGI.
- Despliegue: servidor propio incluido en el repo (`tools/serve.py`) con API OpenAI-compatible, streaming SSE, warmup de formas comunes y salida tras 30 minutos de inactividad (`--idle-exit 0` lo mantiene activo). Parámetros relevantes: `--kv-bits 8`, `--max-batch 4` u `8`, `--loops 2`, `--head-bits 8` o `--fast-head`.
- Latencia y throughput: 20,8 tok/s (por defecto) y 26,6 tok/s (fast-head) en decodificación; TTFT de 0,44 s y 0,25-0,32 s respectivamente; 27,3 ms/token con `--loops 1` a costa de peor calidad (NLL 3,921).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Este modelo (MLX 4-bit) | 3.119.461.248 | no disponible | Sí (imagen-texto) | Apache 2.0 | safetensors MLX, servidor propio |
| balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4 | no disponible | no disponible | Sí | Apache 2.0 | NVFP4, orientado a GPU NVIDIA |
| balllvin/SenseNova-Loop-9B-NVFP4 (base QAD) | no disponible | no disponible | Sí | Apache 2.0 | NVFP4 |
| sensenova/SenseNova-Loop-9B (oficial) | no disponible | no disponible | Sí | no disponible | checkpoint oficial |

Los tres builds derivados comparten arquitectura y licencia; las diferencias están en la cuantización (NVFP4 frente a MLX afín 4-bit), el hardware objetivo y los pasos de abliteration y ajuste Arete, presentes solo en los builds "abliterated-arete". No se dispone de datos de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Sin alineación de seguridad: la abliteration es conductual y el modelo responde a 93 de 99 prompts dañinos del conjunto sellado. No debe desplegarse en producción orientada a usuarios sin capas de filtrado externas.
- La tabla sellada de rechazo/MMLU/NLL corresponde al build NVFP4 de origen y no se reejecutó sobre esta conversión MLX; la validación local se limita a 160 posiciones de WikiText.
- Soporte de imagen verificado con una única prueba de humo de 448×448 (cuadrado rojo y círculo azul); no se ejecutó ningún benchmark de imagen para este release.
- La torre visual no está cuantizada, por lo que el build es ~0,9 GB más grande que las versiones anteriores.
- `--loops 1` no corresponde al modelo entrenado y degrada la perplejidad de forma notable (NLL 3,921 frente a 3,041).
- Las cifras de velocidad y memoria provienen de un único M5 Pro con carga del sistema de 7 a 15; deben considerarse conservadoras y no extrapolables a otro hardware.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones o documentos largos sin verificación empírica.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la falta de benchmarks estándar que permitan calibrar su fiabilidad.
- Es un build de investigación; el autor no ofrece garantías de soporte ni de estabilidad de la API del servidor incluido.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de alineación de seguridad traslada al integrador toda la responsabilidad sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4-MLX
- Build de origen (abliterated + Arete, NVFP4): https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-arete-NVFP4
- Build abliterated (NVFP4): https://huggingface.co/balllvin/SenseNova-Loop-9B-abliterated-NVFP4
- Build base QAD (NVFP4): https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4
- Build base QAD en MLX 4-bit: https://huggingface.co/balllvin/SenseNova-Loop-9B-NVFP4-MLX
- Modelo base oficial: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Dataset de preentrenamiento citado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Papers, blogs o demos adicionales: no disponible

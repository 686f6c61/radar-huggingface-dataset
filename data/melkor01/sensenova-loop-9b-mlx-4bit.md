# Melkor01/SenseNova-Loop-9B-MLX-4bit

## Resumen

SenseNova-Loop-9B-MLX-4bit es una conversión comunitaria a 4 bits en formato MLX del modelo multimodal SenseNova-Loop-9B, desarrollado originalmente por SenseNova (SenseTime) y adaptado por el usuario Melkor01 para su ejecución nativa en Apple Silicon. El modelo resuelve el problema de desplegar un transformer multimodal con razonamiento iterativo en equipos de consumo: reduce los aproximadamente 9.000 millones de parámetros a un peso de 6,03 GB en disco, manteniendo el codificador de visión en bfloat16 y la cabeza de decodificación especulativa MTP.

La arquitectura es un transformer multimodal "looped" (con bucles recurrentes): almacena 32 capas pero ejecuta 56 pasadas efectivas, lo que eleva el cómputo de inferencia a un equivalente de aproximadamente 14.600 millones de parámetros. Incorpora atención híbrida en proporción 3:1, un esquema de enrutamiento mHC (multi-head routing) de dos flujos con 96 tensores de routing en float32, y una ventana de contexto de hasta 512.000 tokens. Es relevante porque demuestra que el paradigma de transformers con bucles puede empaquetarse en 8-16 GB de memoria unificada, algo inédito hasta ahora en el ecosistema MLX.

El modelo se distribuye bajo licencia Apache 2.0, soporta inglés y chino, y está orientado a tareas de razonamiento multimodal, agentes y generación de código. Su conversión a 4 bits (4,511 bpw) preserva la precisión de los tensores críticos de routing y visión, lo que permite mantener la fidelidad del razonamiento iterativo incluso con cuantización agresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con bucles (looped multimodal transformer), atención híbrida 3:1, enrutamiento mHC de dos flujos |
| Parámetros totales | 8.956.949.376 (~9B) |
| Parámetros activos | No aplica (no es MoE); cómputo de inferencia equivalente a ~14,6B por las 56 pasadas efectivas |
| Longitud de contexto | Hasta 512.000 tokens |
| Tipos de cuantización | 4 bits MLX affine (4,511 bpw); routers mHC en float32; visión y MTP en bfloat16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecars `vision.safetensors` y `mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles: almacena 32 capas físicas pero aplica un mecanismo de recirculación que produce 56 pasadas efectivas sobre la representación, aumentando la profundidad de cómputo sin incrementar el número de parámetros almacenados. La atención es híbrida en proporción 3:1 (tres capas de atención estándar por cada capa de atención lineal o eficiente, según la nomenclatura del modelo base), lo que reduce el coste cuadrático en contextos largos. El enrutamiento mHC (multi-head routing con dos flujos) se implementa mediante 96 tensores en float32 que la conversión MLX preserva íntegros para no degradar la capacidad de razonamiento iterativo.

La conversión a MLX cuantiza el cuerpo del lenguaje a 4 bits con un esquema affine de 4,511 bits por peso, mientras que mantiene el codificador de visión en bfloat16 (869,8 MB, 333 tensores) y la cabeza MTP en bfloat16 (464,0 MB, 15 tensores). La cabeza MTP (multi-token prediction) actúa como borrador para decodificación especulativa, permitiendo generar varios tokens por paso y acelerar la inferencia en Apple Silicon. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" configurable (`enable_thinking`).
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), incluyendo descripción de contenido, layout y elementos visuales.
- Generación de código en lenguajes como Python, con soporte para tareas de reparación y generación de repositorios (NL2Repo).
- Razonamiento matemático y aritmético (verificado con `17 * 23 = 391`).
- Decodificación especulativa mediante cabeza MTP con `k=3` tokens borrador.
- Capacidades de agente y multi-step reasoning orientadas a tareas de automatización (AutomationBench, GAIA, Terminal-Bench).
- Soporte multilingüe limitado a inglés y chino.
- Conversación multi-turno con plantilla de chat y gestión de tokens EOS.
- Ejecución nativa en Apple Silicon mediante MLX, con soporte de `mlx-lm >= 0.32`.

## Casos de uso

- **Asistente de código en Mac local**: un desarrollador puede ejecutar el modelo con `mlx_lm.generate` para autocompletar, explicar y depurar código Python sin conexión, gracias a sus 9B parámetros y a la decodificación especulativa MTP que acelera la generación en chips M1-M5.
- **Análisis de capturas y documentos visuales**: el codificador de visión en bfloat16 permite describir el contenido y el layout de imágenes (por ejemplo, capturas de pantalla o diagramas) mediante `generate_vision.py`, adecuado para tareas de accesibilidad o documentación automática.
- **Agentes autónomos de terminal**: con resultados upstream en Terminal-Bench 2.1 de 59,55 y GAIA de 69,90, el modelo puede emplearse en pipelines de automatización de tareas de línea de comandos y resolución de problemas multi-paso en entornos controlados.
- **Automatización de flujos de trabajo empresariales**: su rendimiento en AutomationBench (36,67) lo hace apto para prototipos de agentes que ejecutan secuencias de acciones sobre APIs y herramientas, siempre con supervisión humana.
- **Generación de repositorios a partir de especificaciones**: con NL2Repo en 41,36, puede usarse para generar estructuras de proyecto y código inicial a partir de descripciones en lenguaje natural, integrable en pipelines de CI/CD para scaffolding.
- **Consulta de bases de datos en lenguaje natural**: su resultado en BIRD (72,34) lo posiciona para tareas de text-to-SQL y análisis de datos conversacional en inglés y chino, ejecutándose localmente en un Mac de 16 GB.
- **Prototipado de investigación en transformers con bucles**: investigadores pueden estudiar el comportamiento de las 56 pasadas efectivas y el enrutamiento mHC en hardware de consumo, sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Los siguientes datos provienen de la referencia oficial BF16 del modelo base (no son reevaluaciones de la versión MLX cuantizada):

| Benchmark | Resultado (BF16 upstream) |
|---|---|
| GAIA | 69,90 |
| Terminal-Bench 2.1 | 59,55 |
| AutomationBench | 36,67 |
| AIDABench | 65,31 |
| NL2Repo | 41,36 |
| BIRD | 72,34 |

Verificación de la conversión MLX (Linux MLX sobre NVIDIA A100-SXM4-80GB, mlx 0.32.4, mlx-lm 0.32.2):

| Prueba | Estado | Resultado |
|---|---|---|
| Integridad de tensores y sidecars | PASS | 96/96 routers mHC en float32; visión con 333 tensores BF16 y 0 NaN; MTP con 15 tensores BF16 |
| Texto con mlx-lm estándar | PASS | `17 * 23` devolvió exactamente `391` |
| Pipeline de visión | PASS | Identificó correctamente un círculo rojo a la izquierda y un cuadrado azul a la derecha; 6,09 GB de memoria GPU pico |
| Decodificación especulativa MTP | PASS | Verificada (detalle truncado en la información disponible) |

No se han publicado resultados de benchmarks de la versión cuantizada a 4 bits en la información disponible.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: 8-16 GB para texto e imágenes; 24 GB o más para contexto largo extendido. El pipeline de visión verificado consumió 6,09 GB de memoria GPU pico.
- **GPU recomendadas**: Apple Silicon M1 a M5 (requisito nativo de MLX). Para validación en Linux se usó una NVIDIA A100-SXM4-80GB, pero el destino principal es Apple Silicon.
- **Compatibilidad con GPU de consumo**: sí, en Macs con 8 GB o más de memoria unificada; la variante de 6 bits requiere 16-24 GB.
- **Opciones de despliegue**: `mlx-lm >= 0.32` con `--trust-remote-code`, scripts del repositorio `internet-projects/sensenova-loop-mlx` para visión y MTP. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: no disponibles. La decodificación especulativa MTP con `k=3` está diseñada para acelerar la generación, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-4bit | ~9B (cómputo ~14,6B) | 512K | Apache 2.0 | MLX safetensors 4-bit | Multimodal, looped, MTP, solo Apple Silicon |
| SenseNova-Loop-9B-MLX-6bit | ~9B (cómputo ~14,6B) | 512K | Apache 2.0 | MLX safetensors 6-bit | Misma arquitectura, 8,11 GB, mayor fidelidad de razonamiento |
| SenseNova-Loop-9B (base) | ~9B (cómputo ~14,6B) | 512K | Apache 2.0 | safetensors BF16 | Referencia oficial, requiere más memoria |

No se dispone de información sobre otros modelos comparables de la misma categoría (transformers con bucles multimodales en MLX) en la información proporcionada.

## Limitaciones y advertencias

- **Idiomas**: solo inglés y chino; no hay soporte declarado para castellano ni otras lenguas, lo que limita su uso en producción en España sin adaptación.
- **Plataforma**: requiere Apple Silicon y MLX; no es desplegable en GPUs NVIDIA convencionales con las herramientas estándar (vLLM, TGI) según la información disponible.
- **Cuantización**: la versión de 4 bits (4,511 bpw) puede degradar el razonamiento en tareas complejas frente a la referencia BF16; los benchmarks mostrados son del modelo base, no de esta conversión.
- **Alucinación**: no se aportan datos específicos sobre tasas de alucinación; como todo modelo generativo, existe riesgo en tareas de código y datos factuales.
- **Sesgos**: no se documentan sesgos conocidos en la información disponible.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datasets de entrenamiento originales.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversión comunitaria, no oficial, y la verificación se realizó en Linux MLX sobre A100, no en Apple Silicon de consumo.
- **Contexto largo**: aunque se declaran 512K tokens, se recomiendan 24 GB o más de memoria para contextos extendidos, lo que excluye a muchos Macs de 8 GB.

## Enlaces

- [Hugging Face: Melkor01/SenseNova-Loop-9B-MLX-4bit](https://huggingface.co/Melkor01/SenseNova-Loop-9B-MLX-4bit)
- [Modelo base: sensenova/SenseNova-Loop-9B](https://huggingface.co/sensenova/SenseNova-Loop-9B)
- [Variante 6 bits: Melkor01/SenseNova-Loop-9B-MLX-6bit](https://huggingface.co/Melkor01/SenseNova-Loop-9B-MLX-6bit)
- [Repositorio de scripts MLX: internet-projects/sensenova-loop-mlx](https://github.com/internet-projects/sensenova-loop-mlx)
- [README en chino](https://huggingface.co/Melkor01/SenseNova-Loop-9B-MLX-4bit/blob/main/README_CN.md)
- [Imagen de arquitectura del modelo base](https://huggingface.co/sensenova/SenseNova-Loop-9B/resolve/main/assets/hero.png)

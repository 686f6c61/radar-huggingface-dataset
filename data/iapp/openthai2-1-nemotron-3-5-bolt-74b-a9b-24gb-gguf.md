# iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF

## Resumen

OpenThai 2.1 Bolt (74B-A9B) 24GB — GGUF es una distribucion cuantizada y ajustada al tailandes del modelo NVIDIA Nemotron 3.5 Bolt, publicada por el usuario `iapp` de Hugging Face. Se trata de un fine-tune en tailandes sobre la compilacion de 24 GB que NVIDIA preparo para el modelo base, es decir, la variante en la que los 66.000 millones de pesos de expertos enrutados se almacenan en 2 bits (IQ2_XXS) tras un proceso de destilacion consciente de la cuantizacion. El resultado es un archivo GGUF de 22,8 GB que puede ejecutarse en llama.cpp en equipos donde el archivo Q4_K_M de 46,4 GB no cabe.

El modelo resuelve un problema practico de despliegue: permite disponer de un modelo de 74.042.720.848 parametros totales (con 9B activos, al ser una arquitectura MoE) en una GPU de consumo de 24 GB, manteniendo buena parte de la calidad del fine-tune tailandes original. La model card reporta que, con contexto de 32.768 tokens, un solo slot y el proyector de imagen cargado, el modelo ocupa 24.128 MiB de VRAM, con un rendimiento de 136 tokens por segundo en una H100.

Es relevante ahora porque combina tres elementos poco frecuentes en un mismo artefacto: un modelo de mezcla de expertos de gran tamano, una compilacion de 2 bits retrenada por NVIDIA para recuperar precision, y un ajuste fino especifico para tailandes con evaluaciones propias (ThaiExam, OpenThaiEval, IFEval-TH, MATH-500-TH) y soporte multimodal imagen-texto mediante un proyector separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con capas Mamba y atencion (según la model card: proyecciones Mamba de entrada y salida, expertos compartidos, proyecciones de atencion y latentes) |
| Parametros totales | 74.042.720.848 |
| Parametros activos | 9B (denominacion A9B) |
| Longitud de contexto | 32.768 tokens (configuracion de prueba reportada) |
| Tipos de cuantizacion | GGUF con expertos enrutados en 2 bits (IQ2_XXS), proyecciones Mamba en Q4_K, expertos compartidos en Q5_K, atencion y proyecciones latentes en Q8_0 |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | OpenMDW 1.1 (etiquetada como `other` en Hugging Face, con enlace a openmdw.ai) |
| Formato de pesos | GGUF (archivo principal de 22,8 GB y proyector multimodal de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt en su compilacion de 24 GB. Segun la model card, NVIDIA mantiene los 66.000 millones de pesos de expertos enrutados en 2 bits (IQ2_XXS) y retreno el modelo con destilacion consciente de la cuantizacion para recuperar precision. La arquitectura combina capas Mamba (proyecciones de entrada y salida), expertos compartidos, proyecciones de atencion y proyecciones latentes, lo que corresponde a un diseno hibrido con mezcla de expertos y componentes de espacio de estados.

El ajuste tailandes de OpenThai 2.1 Bolt no pudo trasladarse directamente a los pesos de 2 bits: al fusionar el adaptador original en el archivo de NVIDIA, el modelo seguia identificandose como Nemotron y solo conservaba parte de la mejora en tailandes (ThaiExam 57,4 frente a 55,0 del archivo de NVIDIA y 63,5 del archivo de 46 GB). Por ello, iApp y AIEAT continuaron entrenando el adaptador de OpenThai 2.1 Bolt sobre los pesos de 2 bits de NVIDIA durante 200 pasos (unos 26 millones de tokens) y lo fusionaron en el archivo. De los 843 tensores, 571 son de NVIDIA byte a byte (expertos enrutados, router, embeddings y cabeza de salida, 18,4 de los 22,8 GB) y 272 llevan la actualizacion tailandesa. La plantilla de chat es la de NVIDIA, sin cambios. El proyector de imagen incluido es el de NVIDIA para la compilacion de 24 GB, renombrado.

## Capacidades

- Generacion de texto conversacional en tailandes e ingles, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Razonamiento con modo "thinking" activado por defecto; la traza se devuelve en `reasoning_content` y puede desactivarse con `"chat_template_kwargs": {"enable_thinking": false}` o con `--reasoning off` en el servidor.
- Capacidades multimodales imagen-texto mediante el proyector `mmproj-openthai2.1-bolt-24GB.gguf` (pipeline `image-text-to-text`).
- Respuesta a preguntas de identidad como OpenThai: 119 de 120 preguntas de identidad en la evaluacion reportada.
- Manejo de cambios de codigo (code-switching) tailandes-ingles: 99,0 en la prueba de 200 preguntas mixtas.
- Instrucciones en tailandes (IFEval-TH 69,8) e ingles (IFEval 81,0).
- Razonamiento matematico en tailandes (MATH-500-TH 77,2).
- Conocimiento general y academico en ingles (MMLU-Redux 88,0).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni de agentes multi-paso.

## Casos de uso

- Asistencia conversacional en tailandes en entornos con GPU de 24 GB: el modelo mantiene conversaciones multi-turno con hasta 32.768 tokens de contexto y responde en tailandes a peticiones formuladas en tailandes, con una tasa de respuestas en tailandes del 99,0 en preguntas mixtas.
- Despliegue en estaciones de trabajo con una sola GPU de consumo: al ocupar 24.128 MiB con contexto de 32k y proyector cargado, permite ejecutar un modelo de 74B totales en hardware que no admite el archivo Q4_K_M de 46,4 GB.
- Procesamiento de documentos e imagenes en tailandes: con el proyector multimodal se pueden enviar imagenes junto a texto, util para extraccion o descripcion de contenido en flujos documentales.
- Evaluacion academica y preparacion de examenes en tailandes: el resultado de 64,0 en ThaiExam lo hace adecuado para responder preguntas de tipo examen y para generar material de estudio en ese idioma.
- Generacion y explicacion de codigo con instrucciones en tailandes o ingles: el modelo conserva el rendimiento en ingles del base (IFEval 81,0, MMLU-Redux 88,0) y responde en tailandes a peticiones mixtas.
- Razonamiento matematico en tailandes: con 77,2 en MATH-500-TH puede emplearse para resolver y explicar problemas matematicos redactados en tailandes.
- Prototipado e investigacion sobre cuantizacion extrema: el artefacto documenta con detalle el proceso de reentrenamiento sobre pesos de 2 bits, lo que lo convierte en un caso de estudio para experimentos de destilacion consciente de la cuantizacion.

## Benchmarks y rendimiento

Resultados reportados en la model card (llama.cpp b12242, thinking off, greedy, mismo harness en la misma H100):

| Benchmark | Este archivo (22,8 GB) | Q4_K_M (46,4 GB) | Archivo 24GB de NVIDIA (sin fine-tune tailandes) |
|---|---|---|---|
| ThaiExam | 64,0 | 63,5 | 55,0 |
| OpenThaiEval | 70,0 | 72,1 | 67,1 |
| IFEval-TH | 69,8 | 69,8 | 67,0 |
| MATH-500-TH | 77,2 | 78,6 | 78,0 |
| Respuestas en tailandes a preguntas mixtas (200) | 99,0 | 97,5 | 77,5 |
| IFEval (ingles) | 81,0 | 81,9 | 80,4 |
| MMLU-Redux (ingles) | 88,0 | 89,5 | 87,8 |
| Identidad OpenThai (120 preguntas) | 119 | 116 | 0 |

Comparaciones pareadas por pregunta frente al archivo de NVIDIA: ThaiExam +9,0 (error estandar 1,8), OpenThaiEval +2,8 (0,9) y code-switching +21,5 (3,1); IFEval-TH +2,8 (2,7) y MATH-500-TH −0,8 (1,6) dentro del ruido; IFEval +0,6 (1,4) y MMLU-Redux +0,1 (0,3) tambien dentro del ruido. Frente a Q4_K_M: OpenThaiEval −2,1 (0,8) y MMLU-Redux −1,5 (0,4); el resto dentro del ruido. La model card advierte que IFEval-TH vario hasta 4,7 puntos entre variantes de almacenamiento de los mismos pesos, por lo que diferencias de ese orden deben tratarse como ruido.

## Requisitos de hardware

- VRAM estimada: 24.128 MiB con contexto de 32.768 tokens, un slot y el proyector de imagen cargado (el archivo de NVIDIA equivalente usa 23.406 MiB).
- GPU recomendadas: H100 para las mediciones reportadas; cualquier GPU con al menos 24 GB de VRAM para el archivo de 22,8 GB mas el proyector de 1,7 GB y el contexto.
- Cabe en GPU de consumo de 24 GB (por ejemplo, la clase RTX 4090), aunque la model card no lista modelos concretos de consumo probados.
- En backend de CPU, la prueba reportada alcanzo un pico de 31,6 GiB de memoria (frente a 27,4 GiB del archivo de NVIDIA), porque llama.cpp mantiene una segunda copia de los tensores K-quant.
- Despliegue: llama.cpp con build reciente (probado solo con b12242); el comando de ejemplo es `llama-server -m openthai2.1-bolt-24GB.gguf --mmproj mmproj-openthai2.1-bolt-24GB.gguf --jinja -c 32768 -ngl 999`.
- Latencia y throughput: 136 tokens por segundo en una H100 inactiva (el archivo de NVIDIA midio 135 en la misma sesion).
- El drafter de decodificacion especulativa de NVIDIA para la compilacion de 24 GB (LiLiCorr) no fue probado con este archivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / tamano | Notas |
|---|---|---|---|---|---|
| OpenThai 2.1 Bolt 24GB (este) | 74B totales, 9B activos | 32.768 tokens (prueba) | OpenMDW 1.1 | GGUF, 22,8 GB + proyector 1,7 GB | Fine-tune tailandes sobre pesos de 2 bits de NVIDIA |
| OpenThai 2.1 Bolt Q4_K_M | 74B totales, 9B activos | no disponible | OpenMDW 1.1 | GGUF, 46,4 GB | Mejor OpenThaiEval (72,1) y MMLU-Redux (89,5); requiere mas VRAM |
| NVIDIA Nemotron 3.5 Bolt 24GB (sin fine-tune) | 74B totales, 9B activos | no disponible | no disponible | GGUF, 22,0 GB | Sin ajuste tailandes; ThaiExam 55,0 y 0/120 en identidad OpenThai |

## Limitaciones y advertencias

- El archivo Q4_K_M de 46,4 GB obtiene mejores resultados en OpenThaiEval (72,1 frente a 70,0) y MMLU-Redux (89,5 frente a 88,0), se repite menos en respuestas largas y responde en ingles a peticiones en tailandes con menor frecuencia; este archivo esta pensado para equipos donde aquel no cabe.
- La cuantizacion extrema de los expertos enrutados a 2 bits (IQ2_XXS) puede degradar la calidad en tareas no cubiertas por las evaluaciones reportadas.
- La model card advierte de que builds de llama.cpp anteriores al 22 de octubre de 2026 separan las vocales y marcas tonales tailandesas de sus consonantes, y de que el archivo usa el layout de tensores de la compilacion de 24 GB de NVIDIA, que builds antiguos pueden no leer.
- El modo thinking esta activado por defecto; si no se desactiva, las respuestas incluyen traza de razonamiento.
- El proyector multimodal debe ser el de este repositorio (el de NVIDIA para la compilacion de 24 GB), no el del repositorio de 46 GB.
- No se documentan sesgos especificos, riesgos de alucinacion medidos ni soporte de tool calling o agentes; estos aspectos deben validarse antes de usos en produccion.
- La licencia OpenMDW 1.1 debe revisarse en el enlace oficial para confirmar las condiciones de uso comercial.
- El modelo solo declara soporte de tailandes e ingles; no hay datos sobre otros idiomas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Repositorio GGUF de 46,4 GB (Q4_K_M): https://huggingface.co/iapp/OpenThai2.1-Nemotron-3.5-Bolt-74B-A9B-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets

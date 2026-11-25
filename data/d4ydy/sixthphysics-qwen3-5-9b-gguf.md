# d4ydy/sixthphysics-qwen3.5-9b-GGUF

## Resumen

SixthPhysics-Qwen3.5-9B-GGUF es la distribucion en formato GGUF del modelo SixthPhysics, un ajuste fino (LoRA fusionado) sobre Qwen/Qwen3.5-9B orientado a la generacion neuro-simbolica de problemas de fisica preuniversitaria. Lo desarrolla el proyecto independiente d4ydy/SixthPhysics y esta pensado para un arnes de dos turnos: el primero propone un escenario fisico (`propose_scenario`) y el segundo redacta el paquete completo de la pregunta (`author_package`) en JSON limpio. Cubre simultaneamente tres especificaciones: IB Physics (First Assessment 2025, SL y HL), UK A-Level Physics (nucleo DfE/AQA 7408, Year 12 y Year 13) y NCUK International Foundation Year Physics (IFYPH005).

El modelo parte de Qwen3.5-9B, con 8.953.803.264 parametros totales (unos 8,95 mil millones) y una torre de vision que se congela durante el ajuste; el backbone de texto es el que se exporta a GGUF. El ajuste se realizo con el prefijo vacio de pensamiento de Qwen3.5 (`\n\n`), de modo que al desactivar el modo thinking el modelo emite JSON estructurado directamente, sin razonamiento intermedio.

Su relevancia practica es doble: por un lado demuestra un flujo neuro-simbolico cerrado (el modelo propone, un solver verifica y se renderiza la pregunta en SVG) sobre hardware de consumo; por otro, ofrece cuantizaciones Q4_K_M, Q6_K y Q8_0 que caben en GPUs de 8 a 16 GB, con licencia Apache 2.0 e integracion directa en Ollama, llama.cpp y LM Studio. Todo el contenido se genera con datos sinteticos, sin usar examenes oficiales con copyright.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B) con torre de vision congelada; exportacion solo del backbone de texto |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configuracion recomendada: `num_ctx=8192`) |
| Tipos de cuantizacion | Q4_K_M (5,68 GB), Q6_K (7,36 GB), Q8_0 (9,53 GB); adaptador LoRA original en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); LoRA en bf16 en el repo del adaptador |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3.5-9B. El pipeline de entrenamiento consistio en un ajuste SFT (supervised fine-tuning) mediante LoRA sobre el backbone de texto, con la torre de vision congelada, seguido de la fusion limpia del adaptador en los pesos base en bf16 y su posterior cuantizacion a GGUF para inferencia en CPU y GPU de consumo. El checkpoint promocionado se denomina `round1_sft_core`.

Los datos de entrenamiento son sinteticos y provienen del dataset propio `d4ydy/sixthphysics-bench-and-bank`, con particiones disjuntas por familia de problemas (family-disjoint splits) y cero contaminacion segun el autor. El ajuste se realizo con el prefijo de pensamiento vacio de Qwen3.5, una decision de diseno deliberada para que el modelo emita JSON crudo y limpio en cada uno de los dos turnos del arnes. No se documentan en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO. La innovacion principal no es arquitectonica sino de flujo: el arnes neuro-simbolico de dos turnos con verificacion por solver y renderizado SVG de las preguntas generadas.

## Capacidades

- Generacion de problemas de fisica preuniversitaria en formato JSON estructurado para tres especificaciones (IB Physics 2025 SL/HL, A-Level AQA 7408 Y12/Y13, NCUK IFYPH005).
- Flujo de dos turnos: `propose_scenario` (turno 1) y `author_package` (turno 2), con salida JSON limpia al desactivar thinking.
- Soporte de formatos de pregunta: MCQ, estructurada y otros formatos definidos por el arnes.
- Uso de herramientas (tool-use) dentro del arnes neuro-simbolico: el modelo propone, un solver verifica numericamente.
- Generacion de contenido renderizable en SVG a traves del pipeline del proyecto.
- Capacidades de texto heredadas de Qwen3.5-9B (generacion de texto general, conversacion multi-turno).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking desactivable (`enable_thinking=False`, `--reasoning off` en llama.cpp, `think: false` en Ollama).

## Casos de uso

- Generacion de bancos de preguntas de fisica para docentes: el modelo produce escenarios y paquetes de pregunta verificados por solver para IB, A-Level y NCUK, lo que permite crear material de practica sin depender de examenes oficiales con copyright.
- Plataforma de practica en vivo (sixthphysics.github.io): integracion del modelo via Ollama o llama-server para servir preguntas generadas al vuelo con renderizado SVG, usando Q4_K_M en un portatil Apple Silicon o una GPU de 8 GB.
- Evaluacion formativa automatizada: el arnes de dos turnos permite generar preguntas con solucion verificada numericamente, util para sistemas de correccion automatica y feedback al alumno.
- Prototipado de tutores de fisica locales y offline: al caber en 7,5 GB de VRAM/RAM en Q4_K_M, se puede desplegar en aulas o entornos sin conectividad.
- Investigacion en generacion neuro-simbolica: el par modelo + solver sirve como banco de pruebas para estudiar la verificacion de salidas generadas en dominios con restricciones fisicas estrictas.
- Integracion en pipelines educativos via API compatible con OpenAI: llama-server y LM Studio exponen endpoints `/v1` que permiten conectar el modelo a aplicaciones existentes sin cambiar el codigo de cliente.
- Generacion de variantes de problemas por tema y nivel: el arnes acepta parametros de syllabus, nivel, dominio y formato, lo que permite producir lotes tematicos (mecanica, circuitos, etc.) de forma automatizada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el champion en bf16 fusionado (Modal H100, particiones family-disjoint, 0 contaminacion). La tabla de la model card aparece truncada en la informacion disponible; se reproduce lo disponible:

| Benchmark / protocolo | Qwen3.5-9B sin ajustar (E2E) | Champion `round1_sft_core` (E2E) | Alineacion con syllabus |
|---|---:|---:|---:|
| `test.jsonl` bloqueado, 0 reintentos (N = 586, 28 familias no vistas) | 0,00 % | **64,51 %** [60,55 %, 68,27 %] | **78,50 %** (100,00 % de s...) |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni el resto de filas del desglose por syllabus. Los intervalos de confianza son del 95 % (Wilson).

## Requisitos de hardware

- VRAM/RAM estimada (contexto de 8192 tokens):
  - Q4_K_M: ~7,5 GB (recomendado por defecto; cabe en GPU de 8 GB y en MacBook de 16 GB).
  - Q6_K: ~9,5 GB (GPU de 10-12 GB o 16 GB de memoria unificada).
  - Q8_0: ~11,5 GB (GPU de 12-16 GB o 16+ GB de RAM).
- GPU recomendadas: cualquier GPU con 8 GB o mas para Q4_K_M; 10-12 GB para Q6_K; 12-16 GB para Q8_0. Para el champion en bf16 el autor uso H100 en Modal (entorno de evaluacion, no de despliegue).
- Cabe en GPU de consumo: si, en Q4_K_M desde 8 GB (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB o superiores) y en Apple Silicon con 16 GB de memoria unificada.
- Opciones de despliegue: Ollama (`ollama run hf.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF:Q4_K_M`), llama.cpp (`llama-server` con `--jinja --reasoning off`), LM Studio (servidor local en `127.0.0.1:1234/v1`). Compatible con endpoints estilo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Configuracion recomendada: `num_ctx=8192`, `temperature=0.0`, thinking desactivado (Modelfile incluido en el repo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SixthPhysics-Qwen3.5-9B-GGUF | ~8,95 B (denso) | 8192 | Fisica preuniversitaria neuro-simbolica (IB/A-Level/NCUK) | Apache 2.0 | GGUF en HF (Ollama, llama.cpp, LM Studio) |
| Qwen/Qwen3.5-9B (base) | ~8,95 B (denso) | no disponible | Proposito general, multimodal | no disponible | Pesos en HF |
| d4ydy/sixthphysics-qwen3.5-9b-lora | ~8,95 B (LoRA bf16) | no disponible | Mismo dominio, adaptador sin cuantizar | Apache 2.0 | LoRA en HF |

No se dispone en la informacion proporcionada de modelos comparables de terceros especializados en generacion de problemas de fisica con los que contrastar rendimiento.

## Limitaciones y advertencias

- El modelo esta ajustado para un dominio muy estrecho (generacion de problemas de fisica en tres especificaciones) y un protocolo concreto de dos turnos; su comportamiento fuera de ese flujo no esta documentado.
- Idiomas: solo ingles segun la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: aunque el arnes verifica con solver, el modelo puede proponer escenarios fisicamente invalidos o datos inconsistentes; la verificacion externa es parte del diseno y no debe omitirse en produccion.
- Contexto limitado a 8192 tokens; no apto para documentos o conversaciones muy largas.
- Contenido 100 % sintetico: el autor declara no haber usado examenes oficiales del IB, AQA, Pearson Edexcel, OCR, Cambridge, WJEC ni NCUK; no es un producto oficial ni esta respaldado por esas entidades.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la calidad pedagogica y la verificacion de las preguntas generadas recae en el integrador.
- Pensamiento desactivado por defecto: si se activa el modo thinking, la salida JSON puede contaminarse con razonamiento intermedio, lo que rompe el arnes.
- El repo ocupa 22,6 GB por incluir varias cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- No se han publicado datos de latencia ni throughput; el rendimiento real dependera del hardware y del backend.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-GGUF
- Adaptador LoRA (bf16): https://huggingface.co/d4ydy/sixthphysics-qwen3.5-9b-lora
- Dataset y benchmark: https://huggingface.co/datasets/d4ydy/sixthphysics-bench-and-bank
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Aplicacion de practica en vivo: https://sixthphysics.github.io
- Codigo fuente: https://github.com/sixthphysics/sixthphysics

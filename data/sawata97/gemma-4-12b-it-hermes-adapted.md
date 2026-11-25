# Sawata97/Gemma-4-12B-it-hermes-adapted

## Resumen

Gemma-4-12B-it-hermes-adapted es un ajuste fino por refuerzo (RL) del modelo multimodal google/gemma-4-12B-it, publicado por el usuario Sawata97 en Hugging Face. El objetivo es convertir el modelo base en un agente de codigo y terminal de alta eficiencia, pensado para operar detras de Hermes Agent sobre entornos reales en contenedores. El autor empaqueta en un unico repositorio los pesos GGUF cuantizados (Q4_K_M y Q8_0), el proyector multimodal mmproj en BF16 y el adaptador LoRA en crudo para servir con vLLM o Transformers.

La arquitectura subyacente es la del modelo base Gemma 4 12B Unified, un transformer multimodal de tipo image-text-to-text con 11.907.350.576 parametros totales segun los safetensors del repositorio. El ajuste se realiza mediante LoRA (r=32, alpha=64) entrenado con TRL y GRPO asincrono sobre los datasets harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor. La licencia declarada es Apache 2.0, con enlace a la licencia especifica de Gemma 4 de Google.

Su relevancia actual radica en el enfoque de eficiencia: el autor reporta mejoras de hasta 1,80x en la tasa de resolucion fuera de dominio sobre SWE-bench Pro, con reducciones de tokens de hasta el 48% en tareas compartidas, manteniendo paridad con el modelo base en razonamiento general y matematicas. El repositorio tiene 85 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 12B Unified |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (7,63 GB) y Q8_0 (12,67 GB); adaptador LoRA en BF16; evaluacion en FP8 (fp8_e4m3) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, GGUF, adaptador PEFT LoRA |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer multimodal que procesa texto e imagen (pipeline image-text-to-text). Sobre esa base se aplica un ajuste LoRA con r=32 y alpha=64, entrenado con TRL y una variante de GRPO asincrono (async-grpo) sobre entornos de ejecucion reales. Los datasets empleados son harness-hub/scale800-harbor y harness-hub/termgrade-train-harbor, orientados a tareas de ingenieria de software y terminal. El entrenamiento se realizo, segun los badges de la model card, en Colab G4 con Gemini 4 Neon.

La innovacion principal es el uso de RL sobre entornos containerizados reales para inducir un estilo de razonamiento conciso que se transfiere al modo de pensamiento (`<|think|>`). El autor reporta que este estilo reduce el consumo de tokens sin degradar el rendimiento en benchmarks de razonamiento general, e incluso lo mejora bajo presupuestos de tokens ajustados. El repositorio incluye un proyector multimodal mmproj-BF16.gguf de 175 MB para vision y audio, verificado con llama.cpp, LM Studio y Hermes Agent. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto y razonamiento multimodal (texto e imagen) heredados del modelo base Gemma 4 12B.
- Razonamiento matematico, con mejoras reportadas en AIME 2026 bajo presupuestos ajustados de tokens.
- Agente de codigo y terminal: resolucion de tareas de ingenieria de software en repositorios reales (TypeScript, Node.js, Python).
- Soporte de tool calling y uso de herramientas en entornos de agente (Hermes harness), con reduccion reportada del 35,3% en llamadas a herramientas en tareas compartidas.
- Razonamiento multi-paso y modos de pensamiento (`<|think|>`) con control de presupuesto de tokens.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Procesamiento de audio mediante el proyector multimodal mmproj (segun la descripcion del repositorio).

## Casos de uso

- Agente de ingenieria de software automatizado: el modelo puede operar sobre repositorios reales en contenedores para localizar y corregir fallos, con una tasa de exito fuera de dominio reportada del 22,5% en SWE-bench Pro frente al 12,5% del base.
- Automatizacion de terminal y tareas de sistema: integrado en Hermes Agent, ejecuta comandos y resuelve tareas de terminal con un tiempo de pared mediano un 15,5% menor en Terminal-Bench 2.1.
- Asistente de codigo en pipelines de CI/CD: el soporte de tool calling y la reduccion de tokens (hasta 48% en tareas compartidas) lo hacen adecuado para flujos con coste por token controlado.
- Razonamiento matematico con presupuesto limitado: bajo un limite de 16k tokens alcanza un 67,5% en AIME 2026, util en entornos con restricciones de latencia y coste.
- Procesamiento de documentos con imagen: el proyector multimodal permite tareas image-text-to-text en ingles y chino, como extraccion de informacion de capturas o diagramas.
- Despliegue en hardware de consumo: los GGUF Q4_K_M (7,63 GB) permiten ejecucion local con llama.cpp u Ollama en GPU consumer, adecuado para prototipado y agentes de escritorio.
- Ajuste fino posterior: el adaptador LoRA en crudo (557 MB) permite seguir entrenando o servir con vLLM sin partir del modelo completo.

## Benchmarks y rendimiento

Evaluacion pareada en FP8 (vLLM, `--quantization fp8 --kv-cache-dtype fp8_e4m3`) frente al modelo base.

| Benchmark | Protocolo | Base FP8 | Hermes-Adapted FP8 | Delta | Eficiencia |
|---|---|---|---|---|---|
| SWE-bench Pro | 44 estratificadas (11 repos, 40 puntuadas, step_limit=50) | 12,50% (5/40) | 22,50% (9/40) | +10,00 pp (1,80x) | Tokens totales -16,0%; compartidas -37,7% |
| Scale800 Held-Out | 40 tareas retenidas (Hermes harness) | 22,50% (9/40) | 27,50% (11/40) | +5,00 pp | Tokens compartidas -48,1%; herramientas -35,3% |
| Terminal-Bench 2.1 | 89 tareas (87 emparejadas) | 16,09% (14/87) | 14,94% (13/87) | -1,15 pp (p=1,0) | Tiempo mediano -15,5% |
| AIME 2026 (48k) | 30x4=120, Thinking=True, temp=1.0 | 83,33% (100/120) | 84,17% (101/120) | +0,84 pp | Tokens medianos -9,7% |
| AIME 2026 (16k) | 30x4=120, limite 16.384 | 55,83% (67/120) | 67,50% (81/120) | +11,67 pp | pass@4 +13,33 pp |
| MMLU-Pro (32k) | — | 77,29% | 77,86% | +0,57 pp | — |
| MMLU-Pro (4k) | — | 51,0% | 56,0% | +5,00 pp | — |

El modelo base FP8 reproduce la model card oficial de Google DeepMind (MMLU-Pro 77,29% frente a 77,2%; LiveCodeBench v6 71,43% frente a 72,0%), lo que el autor usa como calibracion. La referencia oficial BF16 de AIME 2026 es 77,5% y la de MMLU-Pro 77,2%.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8-9 GB para GGUF Q4_K_M (7,63 GB de pesos) y unos 13-14 GB para Q8_0 (12,67 GB), mas overhead de contexto y del proyector mmproj (175 MB).
- GPU recomendadas: A100 o H100 para servicio con vLLM en FP8 con concurrencia; RTX 4090 (24 GB) para Q8_0 o Q4_K_M con contexto amplio.
- GPU consumer: Q4_K_M cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: vLLM con LoRA o pesos fusionados (evaluado en FP8), llama.cpp, LM Studio y Ollama (via GGUF), Transformers con PEFT.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; se reporta una reduccion del 15,5% en tiempo de pared mediano en Terminal-Bench 2.1 y reducciones de tokens de hasta el 48,1% en tareas compartidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-it-hermes-adapted | 11,9B | no disponible | SWE-bench Pro 22,5%; AIME 2026 (48k) 84,17% | apache-2.0 | Hugging Face (GGUF + LoRA) |
| google/gemma-4-12B-it (base) | 11,9B | no disponible | SWE-bench Pro 12,5%; AIME 2026 (48k) 83,33% | licencia Gemma 4 | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar de forma directa con el modelo base. No se dispone de datos de otros modelos comparables de la misma categoria en el material consultado.

## Limitaciones y advertencias

- Idiomas: la model card declara solo ingles y chino; el rendimiento en castellano no esta verificado y podria degradarse respecto al base.
- Alucinacion: no se documentan evaluaciones de factualidad; el ajuste RL sobre tareas de codigo no garantiza fiabilidad en dominios abiertos.
- Regresion en Terminal-Bench 2.1: ligera caida de -1,15 pp (no significativa, p=1,0) respecto al base, aunque con menor tiempo de ejecucion.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; los presupuestos de evaluacion llegan a 48k tokens, pero no se confirma el maximo soportado.
- Licencia: aunque se declara apache-2.0, el enlace apunta a la licencia de Gemma 4 de Google; conviene revisar los terminos de uso comercial del modelo base antes de produccion.
- Madurez: repositorio con 85 descargas y 0 likes, creado y actualizado el mismo dia (25 de noviembre de 2026); no hay evidencia de validacion independiente de los resultados.
- Evaluacion: las cifras provienen del autor y se basan en servidores FP8 con graders propios; la reproducibilidad externa no esta confirmada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sawata97/Gemma-4-12B-it-hermes-adapted
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Notas de entrenamiento: TRAINING_NOTES.md (referenciado en la model card del repositorio)

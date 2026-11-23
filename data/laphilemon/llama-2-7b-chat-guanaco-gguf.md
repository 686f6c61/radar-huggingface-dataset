# laphilemon/Llama-2-7b-chat-guanaco-GGUF

## Resumen

Llama-2-7b-chat-guanaco-GGUF es la distribucion en formato GGUF del modelo `laphilemon/Llama-2-7b-chat-finetune-guanaco`, un ajuste fino mediante QLoRA sobre `NousResearch/Llama-2-7b-chat-hf`. Lo desarrolla el usuario independiente laphilemon y su proposito es empaquetar los pesos cuantizados para ejecucion local nativa en Ollama, llama.cpp y LM Studio sobre CPU, Apple Silicon y GPUs de consumo. El modelo resuelve el problema de desplegar un asistente conversacional de 7B en hardware modesto sin depender de infraestructura en la nube.

Arquitectonicamente es un transformer causal denso de la familia Llama 2, con 32 capas, 32 cabezas de atencion y dimension oculta de 4096, sumando 6.738.415.616 parametros. El ajuste se realizo sobre el dataset conversacional multiturno `mlabonne/guanaco-llama2-1k` durante 250 pasos con un adaptador LoRA de rango 64 y alpha 16 aplicado a las proyecciones `q_proj` y `v_proj`.

Su relevancia actual es acotada pero practica: ofrece cuatro niveles de cuantizacion (Q8_0, Q4_K_M, Q3_K_M y Q2_K) que cubren desde estaciones de trabajo con GPU hasta dispositivos de placa unica con 4 GB de RAM, con una licencia Apache 2.0 que facilita el uso comercial. No obstante, se trata de un ajuste ligero sobre una base de 2023, por lo que su rendimiento queda lejos de los modelos actuales de tamano similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer causal denso) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la base Llama 2 declara 4096 tokens) |
| Tipos de cuantizacion | Q8_0 (8,5 bpw), Q4_K_M (4,5 bpw), Q3_K_M (3,4 bpw), Q2_K (2,6 bpw) |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado para Ollama); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso con 32 capas, 32 cabezas de atencion y dimension oculta de 4096, la configuracion estandar de Llama 2 de 7B. Sobre la base `NousResearch/Llama-2-7b-chat-hf` se aplico un ajuste supervisado con QLoRA: adaptadores LoRA de rango 64 y alpha 16 sobre las proyecciones `q_proj` y `v_proj`, entrenados durante 250 pasos con tamano de batch efectivo 4 sobre el dataset `mlabonne/guanaco-llama2-1k`, una coleccion de 1000 ejemplos conversacionales multiturno. La perdida de entropia cruzada final fue de 1,2391, equivalente a una perplejidad de 3,4525.

Tras el entrenamiento, los pesos se fusionaron con la base y se convirtieron a GGUF mediante llama.cpp, generando binarios con cuantizacion a nivel de bloque. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, etc.); el valor tecnico reside en el empaquetado y la matriz de cuantizaciones, no en cambios estructurales del modelo.

## Capacidades

- Generacion de texto conversacional multiturno con retencion de contexto entre turnos y terminacion limpia mediante token EOS, sin bucles repetitivos.
- Razonamiento academico y deductivo basico, evaluado sobre ARC-Challenge.
- Conocimiento factual general, evaluado sobre MMLU.
- Razonamiento matematico multi-paso elemental, evaluado sobre GSM8K.
- Extraccion de salida estructurada: la model card reporta validacion de esquema JSON en extraccion zero-shot con invariantes programaticos (`name`, `age`, `location`).
- Soporte bilingue limitado a ingles y espanol.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso avanzado: no disponible; las capacidades declaradas se limitan a las tareas citadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en portatil: con la cuantizacion Q4_K_M (~4,08 GB) el modelo cabe en equipos con 8 GB de RAM, incluyendo MacBooks con Apple Silicon, lo que permite desplegar un chatbot privado sin conexion a servicios externos.
- Prototipado rapido de aplicaciones de chat: la invocacion directa desde Hugging Face mediante `ollama run hf.co/laphilemon/Llama-2-7b-chat-guanaco-GGUF:llama2-guanaco-q4_k_m.gguf` elimina la configuracion manual y acelera la iteracion sobre prompts y flujos conversacionales.
- Extraccion de datos estructurados: el modelo puede emplearse para convertir texto libre en JSON con esquema fijo (por ejemplo, nombre, edad y ubicacion), adecuado para pipelines de enriquecimiento de datos donde se requiere salida parseable.
- Despliegue en dispositivos de borde: la variante Q2_K (~2,87 GB) permite ejecutar el modelo en placas como Raspberry Pi 5 o Jetson Orin Nano con 4 GB de RAM, util para asistentes embebidos en entornos sin conectividad.
- Entornos con requisitos de privacidad: al ejecutarse integramente en local sobre CPU o GPU de consumo, es apto para procesar conversaciones sensibles sin que los datos abandonen la maquina del usuario.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y con pesos fusionados, sirve como punto de partida para fine-tunings adicionales o para experimentar con tecnicas de cuantizacion en pipelines de investigacion.
- Atencion al cliente de bajo volumen: con contexto multiturno validado, puede gestionar conversaciones secuenciales en escenarios donde el volumen y la criticidad no justifican un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, evaluados con EleutherAI `lm-evaluation-harness` frente a la base `NousResearch/Llama-2-7b-chat-hf` bajo especificaciones de prompt identicas. Los valores de la columna "Fine-Tuned Checkpoint" proceden de la model card; los de la base tambien. No estan verificados de forma independiente (`verified: false` en la model-index).

| Benchmark | Protocolo | Base Llama-2-7B-Chat | Fine-tuned | Delta |
|---|---|---|---|---|
| ARC-Challenge | 25-shot | 53,1% | 53,8% | +0,7% |
| MMLU | 5-shot | 45,3% | 45,6% | +0,3% |
| GSM8K | 3-shot | 14,1% | 14,5% | +0,4% |
| TruthfulQA | 0-shot (MC2) | 38,8% | 40,2% | +1,4% |
| Training loss | 250 pasos | 1,850 | 1,239 | -0,611 |
| Perplejidad final | exp(loss) | 6,360 | 3,452 | -2,908 |

Las mejoras son marginales en todas las tareas academicas (inferiores a 1,5 puntos porcentuales), lo que es coherente con un ajuste de solo 250 pasos sobre 1000 ejemplos. La reduccion de perplejidad refleja el ajuste al dominio del dataset de entrenamiento mas que una mejora general de capacidades.

## Requisitos de hardware

- Q8_0 (8,5 bpw, 7,16 GB en disco): requiere 16 GB o mas de RAM; orientado a estaciones de trabajo con GPU RTX 3090/4090, A100 o T4, o maquinas con 32 GB de RAM. Retencion de calidad del 99,9% respecto a FP16.
- Q4_K_M (4,5 bpw, ~4,08 GB): requiere 8 GB de RAM; recomendado para MacBooks M1/M2/M3/M4 con 8 GB o mas y portatiles Intel/AMD con 8-16 GB. Retencion del 99,1%.
- Q3_K_M (3,4 bpw, ~3,52 GB): requiere 6 GB de RAM; para portatiles antiguos, mini-PCs y clientes ligeros. Retencion del 95,8%.
- Q2_K (2,6 bpw, ~2,87 GB): requiere 4 GB de RAM; para Raspberry Pi 5 (4/8 GB) y Jetson Nano/Orin Nano. Retencion del 88,5%. El autor senala que 2,6 bpw es el limite inferior practico para modelos densos de 7B antes de una degradacion severa de perplejidad.
- Opciones de despliegue: Ollama (invocacion directa desde Hugging Face), llama.cpp y LM Studio. Compatible con CPU, Apple Silicon y GPUs de consumo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-2-7b-chat-guanaco-GGUF | ~6,74B | no disponible (base: 4096) | Apache 2.0 | GGUF | Ajuste ligero sobre Llama 2 Chat; cuatro cuantizaciones; MMLU 45,6% |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Llama 2 Community License | safetensors | Base sin ajuste; MMLU 45,3%; sin empaquetado GGUF propio |
| Llama-2-7b-chat (Meta) | ~6,74B | 4096 | Llama 2 Community License | safetensors | Modelo original de referencia; mismas capacidades base |
| LLaMA-3.2 (1B/3B) | 1B / 3B | no disponible | Llama 3.2 Community License | safetensors, GGUF | Alternativa citada por el autor para restricciones de memoria inferiores a 2 GB |

La comparativa con modelos de la misma categoria y generacion mas reciente no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Ajuste muy ligero: 250 pasos sobre 1000 ejemplos producen mejoras marginales en benchmarks academicos (maximo +1,4 puntos en TruthfulQA); no debe esperarse una mejora sustancial de capacidades respecto a la base.
- Riesgo de alucinacion: TruthfulQA en el 40,2% (MC2) indica una consistencia factual limitada; el modelo puede generar afirmaciones incorrectas con seguridad aparente.
- Contexto: la informacion proporcionada no especifica la longitud de contexto del ajuste; la base Llama 2 declara 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas: solo se declaran ingles y espanol; el rendimiento en espanol no esta cuantificado en la informacion disponible.
- Razonamiento matematico debil: GSM8K en el 14,5% lo inhabilita para tareas cuantitativas no triviales.
- Cuantizacion agresiva: Q2_K retiene solo el 88,5% de calidad y Q3_K_M el 95,8%; para produccion se recomienda Q4_K_M o superior.
- Benchmarks no verificados: todos los resultados de la model-index tienen `verified: false` y proceden del autor; no hay evaluacion independiente.
- Licencia: aunque la model card declara Apache 2.0, el modelo deriva de Llama 2, cuya licencia original impone condiciones adicionales (umbral de 700 millones de usuarios mensuales, atribucion); conviene revisar la compatibilidad antes de un uso comercial a gran escala.
- Madurez: el repositorio registra 495 descargas y 0 likes, sin senales de adopcion o mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laphilemon/Llama-2-7b-chat-guanaco-GGUF
- Modelo base del ajuste: https://huggingface.co/laphilemon/Llama-2-7b-chat-finetune-guanaco
- Base original: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/guanaco-llama2-1k
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper de referencia (arXiv:2305.14314): https://arxiv.org/abs/2305.14314

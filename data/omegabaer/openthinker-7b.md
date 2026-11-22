# omegabaer/OpenThinker-7B

## Resumen

OpenThinker-7B es un modelo de lenguaje de 7.615 millones de parametros derivado de Qwen/Qwen2.5-7B-Instruct mediante ajuste fino supervisado (full fine-tuning) sobre el dataset OpenThoughts-114k. Lo desarrolla el proyecto comunitario Open Thoughts, y el repositorio concreto `omegabaer/OpenThinker-7B` es una reproduccion del modelo original publicado por el equipo. Su proposito es dotar a un modelo base de 7B de capacidades de razonamiento explicito (estilo cadena de pensamiento) destiladas de DeepSeek-R1, manteniendo pesos, datos, codigo de generacion de datos, codigo de entrenamiento y codigo de evaluacion completamente abiertos.

La relevancia del modelo radica en su caracter reproducible: el pipeline completo (generacion de datos desde DeepSeek-R1, entrenamiento con LLaMA-Factory y evaluacion con Evalchemy) esta publicado, lo que permite auditar y replicar el proceso. Frente a alternativas como DeepSeek-R1-Distill-Qwen-7B, OpenThinker-7B ofrece datos y codigo abiertos, aunque con un rendimiento en benchmarks inferior al destilado oficial de DeepSeek segun las cifras reportadas por el propio autor.

Arquitectonicamente es un transformer decoder-only denso de la familia Qwen2.5, sin mezcla de expertos, con licencia Apache 2.0. No se dispone de informacion sobre la longitud de contexto efectiva tras el ajuste, los idiomas soportados declarados ni los formatos de cuantizacion publicados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct, no declarada en el repositorio) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo; repo de 15,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion por causalidad estandar y RoPE. Sobre esa base se aplica un ajuste fino supervisado completo (no LoRA) con LLaMA-Factory, sin que la model card documente fases de RLHF o DPO posteriores. El dataset de entrenamiento es OpenThoughts-114k, compuesto por aproximadamente 114.000 ejemplos de razonamiento generados mediante destilacion de DeepSeek-R1 a traves del pipeline publicado en el repositorio open-thoughts/open-thoughts. Los ejemplos siguen el formato de conversacion con trazas de pensamiento, lo que ensena al modelo a producir cadenas de razonamiento antes de la respuesta final.

Los hiperparametros documentados son: learning rate 1e-5, batch total de 96 (batch de 1 con acumulacion de gradiente de 3 en 32 dispositivos), 3 epocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler coseno con warmup del 10%. El entrenamiento se ejecuto en cuatro nodos de 8xH100 durante 20 horas. El modelo supera a Bespoke-Stratos-7B, que se entreno con 17.000 ejemplos, lo que sugiere que la escala y calidad del dataset OpenThoughts-114k es el factor principal de mejora. No se documentan innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Qwen2.5-7B-Instruct.
- Razonamiento explicito con cadenas de pensamiento (thinking traces) destiladas de DeepSeek-R1, orientadas a problemas de matematicas y logica.
- Resolucion de problemas matematicos de competicion (AIME24, MATH500) y razonamiento cientifico (GPQA-Diamond).
- Generacion de codigo, evaluada en LiveCodeBench v2 en sus niveles Easy, Medium y Hard.
- Soporte de tool calling y function calling: no documentado explicitamente en la model card, aunque la base Qwen2.5-7B-Instruct lo soporta de origen; debe validarse tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas formalmente, aunque el formato de pensamiento encadenado es compatible con flujos de agente.
- Capacidades multilingues: no declaradas en el repositorio; dependen del modelo base.
- Capacidades especiales (vision, audio, thinking mode nativo con tokenizador dedicado): no disponibles.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de nivel MATH500 y AIME generando trazas de pensamiento intermedias, util para tutoria automatica o generacion de soluciones paso a paso en plataformas educativas.
- Generacion de codigo con explicacion: en tareas de LiveCodeBench Easy y Medium el modelo rinde de forma razonable; puede integrarse en asistentes de programacion que requieran justificar la solucion, no solo emitir el codigo.
- Generacion de datos sinteticos de razonamiento: dado que el pipeline de OpenThoughts esta abierto, el modelo puede usarse como generador de trazas para construir datasets de entrenamiento de otros modelos mas pequenos.
- Investigacion en destilacion de razonamiento: al ser completamente reproducible (pesos, datos, codigo), sirve como linea base controlada para estudiar el efecto de la composicion y escala del dataset en el rendimiento de razonamiento.
- Evaluacion comparativa de tecnicas de ajuste: con hiperparametros y framework documentados (LLaMA-Factory, Transformers 4.46.1, PyTorch 2.3.0), es adecuado para experimentos de ablacion sobre learning rate, epocas o formato de datos.
- Prototipado de asistentes conversacionales en local: con 7.615 millones de parametros y pesos safetensors, puede desplegarse en una sola GPU consumer de gama alta para pruebas de concepto sin coste de API.
- Analisis de razonamiento cientifico: en GPQA-Diamond el modelo obtiene resultados cercanos a GPT-4o-0513 segun la tabla del autor, lo que permite usarlo en tareas de preguntas de nivel posgrado con verificacion humana.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (evaluados con Evalchemy). No se han publicado otros resultados en la informacion disponible.

| Modelo | AIME24 | MATH500 | GPQA-Diamond | LCBv2 Easy | LCBv2 Medium | LCBv2 Hard | LCBv2 All |
|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 31,3 | 83,0 | 42,4 | 75,3 | 28,6 | 6,5 | 39,9 |
| Bespoke-Stratos-7B | 22,7 | 79,6 | 38,9 | 71,4 | 25,2 | 0,8 | 35,8 |
| DeepSeek-R1-Distill-Qwen-7B | 60 | 88,2 | 46,9 | 79,7 | 45,1 | 14,6 | 50,1 |
| gpt-4o-0513 | 8,7 | 75,8 | 46,5 | 87,4 | 42,7 | 8,9 | 50,5 |
| o1-mini | 64 | 85,6 | 60 | 92,8 | 74,7 | 39,8 | 72,8 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB de pesos, con overhead total en torno a 10-12 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4-5 GB de pesos, con overhead total en torno a 6-8 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100 80 GB, L40S 48 GB; para una sola GPU consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en BF16.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090 y, con cuantizacion 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 12 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repositorio), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se publican GGUF en el repo, requiere conversion propia).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos abiertos | Codigo abierto | AIME24 | MATH500 | LCBv2 All |
|---|---|---|---|---|---|---|---|---|
| OpenThinker-7B | 7,6B | no disponible | Apache 2.0 | Si (OpenThoughts-114k) | Si | 31,3 | 83,0 | 39,9 |
| Bespoke-Stratos-7B | 7B | no disponible | no disponible | Si (Bespoke-Stratos-17k) | Si | 22,7 | 79,6 | 35,8 |
| DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | no disponible | No | No | 60 | 88,2 | 50,1 |
| gpt-4o-0513 | propietario | no disponible | propietaria | No | No | 8,7 | 75,8 | 50,5 |

## Limitaciones y advertencias

- Rendimiento inferior a DeepSeek-R1-Distill-Qwen-7B en todos los benchmarks reportados, especialmente en AIME24 (31,3 frente a 60) y LCBv2 Hard (6,5 frente a 14,6).
- Riesgo de alucinacion inherente a los modelos de 7B y acentuado por la generacion de cadenas de pensamiento largas, que pueden contener pasos plausibles pero incorrectos.
- Sesgos no documentados en la model card; al derivar de Qwen2.5-7B-Instruct y de datos destilados de DeepSeek-R1, hereda los sesgos de ambas fuentes, no evaluados en el repositorio.
- Idiomas soportados no declarados; el entrenamiento con OpenThoughts-114k esta mayoritariamente en ingles, lo que puede degradar el rendimiento en castellano respecto al modelo base.
- Longitud de contexto efectiva tras el ajuste no documentada; no se garantiza que se mantenga la ventana nativa de Qwen2.5-7B-Instruct.
- El repositorio `omegabaer/OpenThinker-7B` tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion independiente de los pesos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion ni sobre el cumplimiento de las condiciones de los datos destilados de DeepSeek-R1.
- El tag `generated_from_trainer` y la ausencia de resultados en el model-index indican que no se han publicado evaluaciones independientes en el propio repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/omegabaer/OpenThinker-7B
- Modelo original del equipo Open Thoughts: https://huggingface.co/open-thoughts/OpenThinker-7B
- Paper OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Repositorio GitHub del pipeline de datos: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Herramienta de evaluacion Evalchemy: https://github.com/mlfoundations/Evalchemy
- Framework de entrenamiento LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo comparativo Bespoke-Stratos-7B: https://huggingface.co/bespokelabs/Bespoke-Stratos-7B
- Modelo comparativo Bespoke-Stratos-32B: https://huggingface.co/bespokelabs/Bespoke-Stratos-32B
- Dataset Bespoke-Stratos-17k: https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
- Blog de Bespoke-Stratos: https://www.bespokelabs.ai/blog/bespoke-stratos-the-unreasonable-effectiveness-of-reasoning-distillation

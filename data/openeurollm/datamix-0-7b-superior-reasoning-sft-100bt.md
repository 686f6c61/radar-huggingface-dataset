# openeurollm/datamix-0.7b-Superior-Reasoning-SFT-100bt

## Resumen

datamix-0.7b-Superior-Reasoning-SFT-100bt es un modelo de lenguaje decoder-only de aproximadamente 0,7 mil millones de parametros desarrollado por OpenEuroLLM. Su arquitectura sigue el diseno de Qwen-3 (hidden size 1024, 16 cabezas de atencion, 28 capas) y se ha entrenado sobre un presupuesto total de 100 mil millones de tokens combinando Nemotron-CC high-actual (85%) con el dataset Alibaba-Apsara/Superior-Reasoning-SFT-gpt-oss-120b (15%), lo que le da un sesgo hacia tareas de razonamiento supervisado.

El modelo forma parte de la iniciativa OpenEuroLLM, un proyecto europeo de modelos abiertos, y se entrena sobre el supercomputador LUMI con 16 nodos AMD MI250x (unas 1500 horas de GPU). Es relevante porque publica checkpoints intermedios cada 4000 pasos de entrenamiento, lo que permite estudiar la progresion del entrenamiento y reutilizar estados intermedios para experimentos de scaling o de curricula.

Con 708,9 millones de parametros reales (segun safetensors), contexto de 4096 tokens, vocabulario de 262K mediante un tokenizer propio y licencia Apache-2.0, es un modelo pequeno orientado a investigacion y a despliegues con recursos limitados, no a produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (diseno Qwen-3) |
| Parametros totales | 708.903.936 (~0,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Hidden size | 1024 |
| Cabezas de atencion | 16 |
| Capas | 28 |
| Vocabulario | 262.144 tokens (tokenizer openeurollm/tokenizer-256k) |
| Presupuesto de entrenamiento | 100 mil millones de tokens |
| Framework de entrenamiento | NVIDIA-Megatron-LM (fork OpenEuroLLM) |
| Hardware de entrenamiento | 16 nodos AMD MI250x en LUMI (~1500 GPU horas) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only que replica los hiperparametros principales de la familia Qwen-3: 28 capas, hidden size de 1024 y 16 cabezas de atencion, con una longitud de secuencia de 4096 tokens. No emplea mezcla de expertos ni arquitecturas hibridas; es un transformer denso convencional. El tokenizer es propio de OpenEuroLLM (tokenizer-256k), con un vocabulario de 262K entradas, lo que reduce el numero de tokens necesarios para representar texto en comparacion con vocabularios mas pequenos.

El entrenamiento consumio 100 mil millones de tokens, con una mezcla compuesta por Nemotron-CC high-actual al 85% y el dataset Alibaba-Apsara/Superior-Reasoning-SFT-gpt-oss-120b al 15%. Este ultimo aporta datos de ajuste supervisado orientados al razonamiento, lo que explica el sufijo "Superior-Reasoning-SFT" del nombre. Se entreno con el fork de Megatron-LM mantenido por OpenEuroLLM sobre 16 nodos AMD MI250x del supercomputador LUMI, con un coste aproximado de 1500 horas de GPU. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Un aspecto destacable es la publicacion de checkpoints intermedios cada 4000 iteraciones en ramas separadas (de `iter_0004000` a `iter_0047684`), lo que facilita el analisis de la evolucion del entrenamiento.

## Capacidades

- Generacion de texto en ingles con un modelo denso de 0,7B parametros.
- Razonamiento supervisado: el 15% del corpus de entrenamiento proviene de un dataset de SFT de razonamiento, por lo que el modelo esta expuesto a trazas de razonamiento de un modelo mayor (gpt-oss-120b).
- Procesamiento de contexto de hasta 4096 tokens, adecuado para documentos cortos y conversaciones de pocos turnos.
- Capacidades multilingues limitadas: la model card declara unicamente ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es solo de texto.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre entrenamiento de LLMs: los checkpoints intermedios cada 4000 pasos permiten estudiar la dinamica de aprendizaje, el olvido catastrófico o la evolucion de la perplexidad a lo largo de 100B tokens, algo poco habitual en modelos publicados.
- Experimentos de destilacion: al haberse entrenado parcialmente con datos de razonamiento generados por gpt-oss-120b, sirve como punto de partida para estudiar como se transfieren capacidades de razonamiento a modelos pequenos.
- Prototipado rapido en local: con 0,7B parametros cabe en GPUs de consumo y permite iterar sobre pipelines de generacion de texto en ingles sin coste de API.
- Fine-tuning especifico de dominio: su tamano reducido y licencia Apache-2.0 facilitan el ajuste fino sobre corpus especializados (legal, medico, tecnico) en una sola GPU.
- Evaluacion de tokenizers: el vocabulario de 262K del tokenizer openeurollm permite comparar eficiencia de tokenizacion frente a tokenizers estandar en tareas de compresion de texto y coste por token.
- Educacion y docencia: util para demostrar el ciclo completo de entrenamiento (datos, Megatron-LM, checkpoints, evaluacion) en cursos de IA, dado que el modelo es pequeno y el proceso esta documentado.
- Generacion de texto asistida de baja latencia: en entornos con restricciones de VRAM (por ejemplo, portatiles con GPU de 8 GB) puede desplegarse con llama.cpp u Ollama para tareas de resumen o redaccion en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2-3 GB con contexto completo de 4096 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,7-1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,4-0,6 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPUs con memoria compartida usando cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (soporte de Qwen-3 en versiones recientes), TGI y transformers con PyTorch. Al ser safetensors, requiere conversion a GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera throughput alto en GPU modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| datamix-0.7b-Superior-Reasoning-SFT-100bt | 0,7B | 4096 | Apache-2.0 | en | Entrenado con 100B tokens, checkpoints intermedios publicados |
| Qwen2.5-0.5B | 0,5B | 32.768 | Apache-2.0 | multilingue | Referencia de la familia Qwen; contexto mucho mayor |
| Qwen3-0.6B | 0,6B | 32.768 (extensible) | Apache-2.0 | multilingue | Arquitectura base del modelo; soporte de modo thinking |
| SmolLM2-360M | 0,36B | 8192 | Apache-2.0 | en | Alternativa pequena de HuggingFace con contexto mayor |
| TinyLlama-1.1B | 1,1B | 2048 | Apache-2.0 | en | Modelo pequeno clasico, contexto menor |

La comparativa se basa en caracteristicas publicas de modelos de la misma categoria; no hay datos de benchmarks de este modelo que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no se declara soporte de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado.
- Contexto limitado a 4096 tokens, inferior al de modelos contemporaneos de tamano similar (Qwen3-0.6B ofrece 32K).
- Riesgo de alucinacion elevado por su tamano reducido y por el sesgo hacia datos de razonamiento sintetico; no se han publicado evaluaciones de fidelidad.
- Sesgos conocidos: no documentados en la model card; al entrenarse con Nemotron-CC (corpus web filtrado) y datos sinteticos, puede heredar sesgos de esas fuentes.
- Sin datos de benchmarks publicados: no es posible validar su calidad frente a alternativas sin evaluacion propia.
- Uso comercial permitido por Apache-2.0, pero sin garantias de rendimiento ni soporte del autor.
- El modelo esta pensado para investigacion; no se recomienda para produccion critica sin evaluacion adicional.
- El repositorio ocupa 19,9 GB, en gran parte por los checkpoints intermedios en ramas separadas; conviene descargar solo la rama principal si no se necesitan los intermedios.
- No se documenta el uso de RLHF/DPO ni de tecnicas de alineacion, por lo que el comportamiento en conversacion puede ser menos pulido que el de modelos alineados.

## Enlaces

- HuggingFace: https://huggingface.co/openeurollm/datamix-0.7b-Superior-Reasoning-SFT-100bt
- Tokenizer: https://huggingface.co/openeurollm/tokenizer-256k
- Framework de entrenamiento (fork): https://github.com/OpenEuroLLM/NVIDIA-Megatron-LM
- Dataset de razonamiento: https://huggingface.co/datasets/Alibaba-Apsara/Superior-Reasoning-SFT-gpt-oss-120b
- Proyecto OpenEuroLLM: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada

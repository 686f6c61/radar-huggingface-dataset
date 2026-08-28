# Ehraim/qwen2.5-0.5b-ok-ppo-kineteq

## Resumen

El modelo `Ehraim/qwen2.5-0.5b-ok-ppo-kineteq` es un adaptador PEFT (LoRA) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` mediante una variante de aprendizaje por refuerzo denominada **ok-ppo** (PPO con recompensa de out-of-distribution basada en un banco de kernels esféricos). El autor, Ehraim, lo presenta como una política especializada en tareas de gestión de archivos (file-manager) y uso de herramientas (tool-use). El repositorio incluye tanto el adaptador como los primitivos del algoritmo de entrenamiento (PPO critic + clip, GRPO group z-score, OK-PPO y OK-GRPO), lo que permite reproducir o extender el método.

El modelo base Qwen2.5-0.5B-Instruct pertenece a la familia Qwen2.5, que en su informe técnico reporta un escalado del preentrenamiento a 18 billones de tokens y una longitud de contexto de 32K tokens para todos los tamaños. Sin embargo, este adaptador concreto no publica métricas de rendimiento generales, solo un benchmark interno de file-manager en `bench.json`. Su relevancia radica en explorar el ajuste fino con refuerzo para tareas de agente en modelos pequeños, un área de interés creciente para despliegues eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0.5B (modelo base) + adaptador (numero no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5 soporta 32K, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible (compatible con cuantizacion del modelo base, p. ej. bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-0.5B-Instruct`, un modelo transformer causal de 0.5B parametros con atencion por ventanas deslizantes y 32K de contexto (segun la documentacion de Qwen2.5). El entrenamiento emplea **ok-ppo**, una variante de PPO que anade una recompensa de out-of-distribution calculada mediante un banco de kernels esfericos (spherical kernel-bank). Tambien se incluyen implementaciones de GRPO y OK-GRPO en el repositorio, lo que sugiere que el autor experimento con multiples algoritmos de refuerzo. No se especifican los datos de entrenamiento ni el numero de pasos, pero el objetivo declarado es optimizar una politica para tareas de gestion de archivos y uso de herramientas. El repositorio contiene los primitivos del algoritmo en `primitives/*.py`, lo que facilita la reproducibilidad.

## Capacidades

- Generacion de texto y razonamiento basico, heredados del modelo base Qwen2.5-0.5B-Instruct.
- Especializacion en tareas de gestion de archivos (file-manager) mediante tool-use, segun los tags y la descripcion del autor.
- Soporte de tool calling / function calling, al estar entrenado para interactuar con herramientas.
- Capacidad de agente simple para operaciones de sistema de archivos (listar, leer, escribir, mover, etc.).
- Multilingue limitado: solo ingles declarado en la model card.
- No se mencionan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Automatizacion de tareas de sistema: el modelo puede ejecutar comandos de gestion de archivos (copiar, renombrar, organizar) en entornos controlados, aprovechando su entrenamiento especifico en file-manager.
- Asistente de linea de comandos: integrado en un agente que recibe instrucciones en lenguaje natural y las traduce a operaciones sobre el sistema de archivos, con verificacion de resultados.
- Pruebas de algoritmos de refuerzo: el repositorio incluye los primitivos de ok-ppo, por lo que sirve como referencia para investigadores que quieran implementar o comparar metodos de RL para tool-use.
- Educacion en aprendizaje por refuerzo: al ser un modelo pequeno y con codigo de entrenamiento disponible, es util para demostrar conceptos de PPO/GRPO en tareas de agente.
- Prototipado rapido de agentes de bajo coste: con menos de 1 GB de VRAM, puede desplegarse en hardware modesto para experimentar con agentes de gestion de archivos.
- Benchmark de file-manager: el repositorio incluye `bench.json`, que permite evaluar el rendimiento del adaptador en tareas held-out de gestion de archivos, util para comparar con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona un `bench.json` con un benchmark held-out de file-manager, pero no se proporcionan los valores numericos en la model card ni en los resultados de busqueda. No se dispone de datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este adaptador.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP16 para el modelo base de 0.5B; el adaptador anade un coste minimo. Con cuantizacion de 4 bits, cabe en menos de 0.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (p. ej., GTX 1650, RTX 3050) o incluso CPU para inferencia lenta.
- Cabe en GPU consumer de gama baja y en dispositivos edge.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI (si se convierte a formato compatible).
- Latencia y throughput: no disponibles; al ser un modelo de 0.5B, la generacion es rapida en GPU moderna (decenas de tokens por segundo) y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Ehraim/qwen2.5-0.5b-ok-ppo-kineteq | 0.5B + LoRA | no disponible | Apache-2.0 | File-manager, tool-use |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | 32K | Apache-2.0 | Generico, instruct |
| TinyLlama-1.1B-Chat | 1.1B | 2K | Apache-2.0 | Generico, chat |

No se dispone de datos de rendimiento comparativo. El adaptador se diferencia por su entrenamiento con ok-ppo para tareas especificas de agente, mientras que los otros son modelos genericos. La comparacion en benchmarks estandar no es posible por falta de datos publicos.

## Limitaciones y advertencias

- Modelo muy pequeno (0.5B), por lo que su capacidad de razonamiento y generacion es limitada en comparacion con modelos mayores.
- Riesgo de alucinacion en tareas genericas; su especializacion en file-manager puede degradar el rendimiento en otros dominios.
- Solo soporta ingles; no se garantiza un comportamiento correcto en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-0.5B-Instruct, que tambien es Apache-2.0, sin restricciones adicionales conocidas.
- No se han publicado evaluaciones de sesgos ni de seguridad; al ser un modelo de agente, podria ejecutar acciones no deseadas si se integra sin control en un sistema real.
- El entrenamiento con refuerzo puede inducir comportamientos de explotacion de la recompensa; se recomienda validar en entornos controlados antes de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Ehraim/qwen2.5-0.5b-ok-ppo-kineteq
- Repositorio de codigo ok-grpo: https://github.com/ehallford11714/ok-grpo
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Coleccion Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25

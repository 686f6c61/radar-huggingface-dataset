# Osakra/Project-Norn-K-Mini-4B

## Resumen

Project Norn: K-Mini 4B es un modelo de lenguaje de 4.022 millones de parametros (dense) desarrollado por Osakra Research, construido mediante fine-tuning sobre `Qwen/Qwen3-4B-Base`. Esta orientado a generacion de codigo, matematicas y tool calling multi-turno en dispositivos de borde (edge), con el objetivo declarado de ejecutarse integramente dentro de un envelope de 8 GB de VRAM en cuantizacion Q4_K_M. Se distribuye principalmente como GGUF para su uso en Ollama, llama.cpp y LM Studio sin parches personalizados.

El modelo incorpora una innovacion peculiar: tokens de condicionamiento neuroquimico en vocabulario (`<|state:acetylcholine|>`, `<|state:serotonin|>`, `<|state:dopamine|>`, `<|state:boredom_decay|>`) entrenados directamente en los pesos, que actuan como senales de enrutamiento de estado. Ademas, el autor ofrece un modo opcional de "pila neuro-simbolica" (Titans-NCM) implementado como sidecar en Python/CUDA, con un adaptador HRR de 10.000 dimensiones y un modulo de memoria asociativa, que segun la model card eleva el rendimiento en su suite ejecutiva propia.

La relevancia del modelo reside en su propuesta de arquitectura hibrida neurona-simbolo modular para hardware de consumo, con resultados declarados de 83,54% en HumanEval, 83,0% en GSM8K y 77,0% en MBPP. No obstante, se trata de un modelo con muy poca traccion (110 descargas, 1 like en el momento de la consulta) y cuyos benchmarks no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense (base Qwen3-4B-Base) con tokens de estado neuroquimico en vocabulario y sidecar neuro-simbolico opcional (Titans-NCM) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 8.192 tokens (segun la model card para el perfil de 4,8 GB VRAM); contexto nativo de Qwen3-4B-Base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`k-mini-Q4_K_M.gguf`) + `Modelfile` para Ollama; sidecar en PyTorch (`hrr_adapter.pt`) |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen/Qwen3-4B-Base`, un transformer dense de 4,02B parametros, y se somete a fine-tuning sobre trayectorias de agente verificables de codigo, matematicas y recuperacion de errores. La innovacion principal declarada es la incorporacion de tokens de estado neuroquimico dentro del vocabulario estandar, lo que permite que el enrutamiento de estado se ejecute en runtimes sin modificar (Ollama, llama.cpp, LM Studio) sin necesidad de operadores GGML personalizados. El autor indica explicitamente que en prototipos anteriores (V17-V21) las capas de memoria HRR estaban integradas en el grafo del modelo y requerian builds personalizados, y que en esta version se han desacoplado.

El modo B (pila neuro-simbolica completa) anade un sidecar en Python/CUDA con dos componentes: un adaptador de Representacion Reducida Holografica (HRR) de 10.000 dimensiones con proyeccion `2560 -> 512 -> 10000 -> 512 -> 2560` mediante convolucion circular FFT, y un modulo `TitansConceptMemory` de 2.560 dimensiones que rastrea normas de sorpresa y recall episodico entre turnos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de codigo en Python con ejecucion verificable (HumanEval, MBPP declarados).
- Razonamiento matematico de tipo GSM8K con respuesta estricta.
- Tool calling y function calling multi-turno, con enrutamiento de primer turno declarado al 100% (50/50).
- Razonamiento agentico multi-paso con recuperacion de errores.
- Condicionamiento de estado mediante tokens especiales (`<|state:acetylcholine|>`, `<|state:serotonin|>`, `<|state:dopamine|>`, `<|state:boredom_decay|>`).
- Memoria episodica entre turnos en modo B (sidecar Titans-NCM).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se declara soporte de vision, audio ni modo thinking explicito.

## Casos de uso

- **Generacion de codigo en local para equipos con GPU de consumo**: el modelo cabe en 4,8 GB de VRAM con 8.192 tokens de contexto en Q4_K_M, lo que permite usarlo en portatiles con RTX 4070 o similares sin depender de la nube.
- **Asistentes de programacion integrados en IDE**: su soporte de tool calling y su rendimiento declarado en HumanEval (83,54%) lo hacen candidato para autocompletado y generacion de funciones en entornos con requisitos de privacidad.
- **Agentes de automatizacion con llamadas a herramientas**: el enrutamiento de primer turno al 100% en la suite del autor sugiere utilidad en pipelines donde el modelo debe decidir que herramienta invocar antes de responder.
- **Tutoria matematica paso a paso**: con 83,0% en GSM8K puede emplearse en aplicaciones educativas que resuelven problemas aritmeticos con explicacion intermedia.
- **Procesamiento por lotes en dispositivos de borde**: a ~70 tokens/s en Q4_K_M, es viable para tareas de clasificacion, extraccion o resumen en hardware limitado.
- **Investigacion en arquitecturas neuro-simbolicas**: el modo B con HRR y Titans-NCM sirve como banco de pruebas para experimentar con memoria asociativa y enrutamiento de estado en modelos pequenos.
- **Prototipado de agentes con memoria conversacional**: el sidecar `ncm_server.py` permite anadir recall episodico sin reentrenar el backbone.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor. No se han verificado de forma independiente.

| Benchmark | Resultado declarado | Notas |
|---|---|---|
| HumanEval pass@1 | 83,54% (137/164) | Ejecucion real en subprocess Python, 606,3 s |
| GSM8K | 83,0% (83/100) | Strict match, 367,5 s |
| MBPP | 77,0% (77/100) | Test set |
| MMLU | 70,0% (70/100) | 57 asignaturas |
| 45-Pillar Executive Suite (modo A) | 82,22% (37/45) | Suite propia del autor |
| 45-Pillar Executive Suite (modo B) | 86,67% (39/45) | Con sidecar Titans-NCM |
| Tool routing primer turno | 100,0% (50/50) | Suite propia del autor |

No se dispone de comparaciones con modelos similares en la informacion proporcionada.

## Requisitos de hardware

- **VRAM estimada**: 4,8 GB con contexto de 8.192 tokens en Q4_K_M (dato del autor).
- **GPU recomendadas**: NVIDIA RTX 4070 Laptop (8 GB) es la referencia usada por el autor; cualquier GPU con al menos 6 GB deberia alojar el modelo en Q4_K_M.
- **Consumer GPU**: si, cabe en GPUs de consumo con 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070, etc.).
- **Opciones de despliegue**: Ollama (via `Modelfile`), llama.cpp, LM Studio; el sidecar neuro-simbolico requiere Python con PyTorch y CUDA.
- **Latencia y throughput**: ~70 tokens/s declarados en la configuracion de referencia (RTX 4070 Laptop, Q4_K_M, 8.192 ctx).
- **Almacenamiento**: repo de 2,6 GB, dominado por el GGUF y el adaptador HRR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Project Norn K-Mini 4B | 4,02B dense | 8.192 (declarado) | Apache 2.0 | GGUF | Fine-tune de Qwen3-4B-Base con tokens de estado y sidecar opcional |
| Qwen3-4B-Base | 4,02B dense | No disponible en la informacion | Apache 2.0 | Safetensors, GGUF | Modelo base sin fine-tuning agentico |
| Qwen2.5-Coder-3B | ~3B dense | No disponible en la informacion | Apache 2.0 | Safetensors, GGUF | Alternativa orientada a codigo de tamano similar |
| Llama 3.2 3B Instruct | 3,2B dense | No disponible en la informacion | Llama 3.2 Community | Safetensors, GGUF | Alternativa generalista de borde |

Los datos de rendimiento de los modelos comparados no se incluyen en la informacion disponible, por lo que no se ofrece una comparacion cuantitativa.

## Limitaciones y advertencias

- **Verificacion independiente ausente**: todos los benchmarks proceden del autor; no hay evaluaciones de terceros ni resultados en leaderboards publicos.
- **Traccion muy baja**: 110 descargas y 1 like en el momento de la consulta, lo que limita la validacion comunitaria.
- **Solo ingles**: la model card declara unicamente `en`; el rendimiento en castellano no esta garantizado.
- **Cuantizacion unica**: solo se publica Q4_K_M; no hay versiones en FP16, Q8 ni Q5 para evaluar el impacto de la cuantizacion.
- **Riesgo de alucinacion**: como todo modelo de 4B, puede generar codigo o resultados matematicos plausibles pero incorrectos; requiere tests automatizados en produccion.
- **Tokens de estado propietarios**: el uso de `<|state:*|>` esta ligado al fine-tuning; otros modelos o prompts que los ignoren pueden degradar el comportamiento esperado.
- **Sidecar no portable**: el modo B requiere Python, PyTorch y CUDA, lo que rompe la promesa de "edge puro" y anade complejidad operativa.
- **Licencia Apache 2.0**: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Base y de los datos de entrenamiento no documentados.
- **Fecha de creacion futura**: el repositorio figura creado el 2026-11-11, lo que puede indicar metadatos inconsistentes y aconseja precaucion sobre la madurez del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Osakra/Project-Norn-K-Mini-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Benchmarks incluidos en el repo: `./benchmarks/live_verified_humaneval_164.json`, `./benchmarks/live_verified_gsm8k_100.json`, `./benchmarks/live_verified_mbpp_test.json`, `./benchmarks/executive_suite_45_results.json`
- Sidecar neuro-simbolico: `neuro_symbolic_ncm/ncm_server.py`, `hrr_adapter.pt`, `swarm_proxy.py` (incluidos en el repositorio)

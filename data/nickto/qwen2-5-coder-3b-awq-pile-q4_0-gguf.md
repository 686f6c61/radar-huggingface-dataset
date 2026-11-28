# nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF

## Resumen

Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF es una cuantizacion GGUF del modelo Qwen2.5-Coder-3B de Alibaba Cloud, publicada por el usuario independiente nickto. El modelo base es un transformer decoder-only de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) especializado en generacion y completado de codigo, con soporte nativo de fill-in-the-middle (FIM) mediante los tokens especiales `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`.

La particularidad de esta publicacion es el pipeline de cuantizacion: antes de convertir a Q4_0, el autor aplico escalado AWQ (Activation-aware Weight Quantization) calibrado sobre el dataset The Pile, y despues cuantizo con `llama-quantize --pure`, lo que fuerza que todos los tensores, incluidos los de embedding y la capa de salida, queden en Q4_0 sin excepciones. Segun el autor, esto recupera buena parte de la precision perdida frente a un Q4_0 ingenuo: en la metrica SAFIM pass@1 pasa de 20,8/12,6/35,2 (control/block/api) sin AWQ a 56,4/42,0/64,5 con AWQ.

Es relevante para quienes necesitan un modelo de autocompletado de codigo ligero, ejecutable en CPU o en GPUs de gama baja mediante llama.cpp, y que quieren comparar el comportamiento de un Q4_0 puro frente a cuantizaciones mixtas tipo Q4_K_M. El autor advierte que no ha comparado este build con las cuantizaciones habituales de llama.cpp, que podrian igualar o superar su calidad a tamano similar. La licencia es Qwen Research License Agreement, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 puro con escalado AWQ previo (todos los tensores, incluidos embedding y capa de salida) |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base esta orientado a codigo) |
| Licencia | Qwen Research License Agreement (qwen-research); solo uso no comercial |
| Formato de pesos | GGUF (un unico archivo: `qwen2.5-coder-3b-awq-pile-q4_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-3B es un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. La informacion proporcionada no detalla la composicion del dataset de preentrenamiento ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen, que no se incluye en el material disponible.

La innovacion tecnica de esta publicacion concreta esta en el proceso de cuantizacion en dos etapas. Primero se aplica escalado AWQ calibrado sobre The Pile, que ajusta los pesos antes de la cuantizacion para proteger los canales de activacion mas sensibles. Despues se cuantiza a Q4_0 con la opcion `--pure` de `llama-quantize`, que impide mantener tensores criticos (embedding, output layer) en mayor precision. El resultado es un GGUF de 1,7 GB en el repositorio, pensado para ejecucion en llama.cpp y compatible con los endpoints `/completion` e `/infill`. El autor indica que estos pesos son identicos a los de su build para NPUs AMD (FastFlowLM) antes de la conversion a formato FLM.

## Capacidades

- Generacion y completado de codigo en modo fill-in-the-middle (FIM) mediante los tokens `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`.
- Autocompletado inline en editores: el endpoint `/infill` de llama.cpp construye el prompt FIM automaticamente, lo que permite integrarlo con plugins como llama.vim y llama.vscode.
- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Autocompletado de codigo en el editor: el caso de uso principal del modelo. Se ejecuta `llama-server` con el GGUF y se apunta un plugin de editor (llama.vim, llama.vscode) al endpoint `/infill`, que construye el prompt FIM; el modelo devuelve la continuacion del fragmento en curso.
- Relleno de huecos en refactorizaciones: dado un bloque de codigo con una seccion eliminada, se envia el prefijo y el sufijo como tokens FIM y el modelo genera el cuerpo intermedio, util para completar funciones a partir de su firma y su uso posterior.
- Asistencia de codigo en maquinas sin GPU: al ser un GGUF Q4_0 de 1,7 GB, puede ejecutarse en CPU con llama.cpp en portatiles o entornos de desarrollo sin acelerador, con latencia aceptable para sugerencias de pocas decenas de tokens.
- Comparacion de estrategias de cuantizacion: sirve como referencia controlada de Q4_0 puro con AWQ frente a Q4_K_M o Q5_K_M de llama.cpp, ya que el autor publica los resultados SAFIM de ambos escenarios.
- Evaluacion de despliegue en NPUs AMD: el autor mantiene un build equivalente para FastFlowLM, por lo que este GGUF permite validar en CPU/GPU los mismos pesos antes de portarlos a NPU.
- Generacion de tests unitarios a partir de firmas de funciones: usando FIM con el cuerpo de la funcion como sufijo, el modelo puede proponer aserciones o casos de prueba que encajen con la implementacion existente.
- Prototipado de asistentes de codigo embebidos: con un servidor llama.cpp local y el endpoint `/completion`, se puede montar un servicio HTTP ligero de sugerencias para herramientas internas sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados SAFIM pass@1 en porcentaje (control / block / api) publicados por el autor:

| Build | Runtime | pass@1 (control/block/api) |
|---|---|---|
| Este modelo (Q4_0 + AWQ sobre Pile) | llama.cpp | 56,4 / 42,0 / 64,5 |
| Q4_0 sin AWQ | llama.cpp | 20,8 / 12,6 / 35,2 |
| F16 sin cuantizar | llama.cpp | 60,7 / 47,8 / 67,4 |
| Mismos pesos en FLM (NPU AMD) | FLM | 54,7 / 39,5 / 65,5 |

El autor no ha publicado comparaciones con cuantizaciones mixtas de llama.cpp (Q4_K_M, Q5_K_M) ni resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 1,7 GB, por lo que cabe en GPUs con 2 GB o mas de VRAM; en CPU requiere aproximadamente esa misma cantidad de RAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, ROCm o Metal con al menos 2-3 GB de VRAM libre; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, GTX 1650, RTX 3050 o superiores) y en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (via `llama-server`, `llama-quantize` y el endpoint `/infill`), y por extension cualquier frontend compatible con GGUF. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de rendimiento publicado es la precision SAFIM, no la velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-3B AWQ Q4_0) | 3,09 B | no disponible | GGUF Q4_0 | Qwen Research (no comercial) | SAFIM pass@1 56,4/42,0/64,5 |
| Qwen2.5-Coder-3B Q4_0 sin AWQ | 3,09 B | no disponible | GGUF Q4_0 | Qwen Research (no comercial) | SAFIM pass@1 20,8/12,6/35,2 |
| Qwen2.5-Coder-3B F16 | 3,09 B | no disponible | safetensors/GGUF F16 | Qwen Research (no comercial) | SAFIM pass@1 60,7/47,8/67,4; referencia sin perdida |
| Mismos pesos en FLM (NPU AMD) | 3,09 B | no disponible | FLM | Qwen Research (no comercial) | SAFIM pass@1 54,7/39,5/65,5 |

No se dispone de datos de contexto ni de comparaciones con otras familias de modelos de codigo de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso exclusivamente no comercial. Cualquier despliegue en produccion comercial requiere una licencia aparte de Alibaba Cloud.
- La cuantizacion Q4_0 pura degrada la precision frente al modelo F16 (por ejemplo, SAFIM block pasa de 47,8 a 42,0), aunque AWQ recupera gran parte de la perdida.
- El autor no ha comparado este build con Q4_K_M ni Q5_K_M, que podrian ofrecer mejor calidad a tamano similar; elegir Q4_0 puro solo tiene sentido si se necesita ese formato concreto o hardware donde solo Q4_0 sea rapido.
- Riesgo de alucinacion inherente a los modelos de codigo: puede generar APIs inexistentes, imports erroneos o logica plausible pero incorrecta; conviene validar las sugerencias con tests.
- Sesgos conocidos: no documentados en la informacion proporcionada; el modelo base hereda los sesgos de su dataset de entrenamiento, no detallado aqui.
- Idiomas soportados: no disponibles; el modelo esta orientado a codigo y su comportamiento en lenguaje natural fuera del codigo no esta caracterizado en esta ficha.
- Longitud de contexto: no disponible en la informacion proporcionada, lo que limita planificar su uso en ficheros muy grandes sin verificar antes el valor real del modelo base.
- Repositorio con 188 descargas y 0 likes: ecosistema de validacion muy limitado; conviene probar el modelo en el caso de uso concreto antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B/blob/main/LICENSE
- Build equivalente para NPU AMD (FastFlowLM): https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2
- Repositorio del pipeline (fim-in-flm), commit 84a5df9: https://gitlab.com/nickto/fim-in-flm/-/tree/84a5df9
- Resultados y descartes (FINDINGS.md): https://gitlab.com/nickto/fim-in-flm/-/blob/84a5df9/FINDINGS.md
- Entrada de blog del autor: https://blog.nickto.net/2026-11-17-get-inline-suggestions-from-a-model-on-an-amd-npu/
- SAFIM (benchmark de FIM): https://github.com/gonglinyuan/safim

# SargeDev/Edge0-Cyber-Uncensored-nvfp4

## Resumen

Edge0-Cyber-Uncensored-nvfp4 es una derivacion comunitaria del modelo Edge0-145B-NVFP4, publicada por el usuario SargeDev. Se trata de una version "abliterated" en la que se ha eliminado el comportamiento de rechazo (refusal) mediante una proyeccion a nivel de pesos, sin vectores de control ni parches en tiempo de ejecucion. El cambio afecta exclusivamente al fichero `model-skeleton.gguf`, la parte siempre residente del modelo, mientras que el resto del paquete (pool de expertos NVFP4, tabla de n-gramas, proyecciones latentes, tokenizer y cabeza de borrador MTP) permanece byte a byte identico al modelo base.

El modelo hereda la arquitectura latent-MoE de Edge0, descendiente a su vez de Qwen3.8-Flash-Next, y se distribuye en formato NVFP4 de 4 bits con un peso total en repositorio de 113,8 GB. Aunque la model card lo denomina "145B", los datos reales de safetensors indican 4.947.698.560 parametros totales, una discrepancia que conviene tener en cuenta. El contexto, los idiomas y los parametros activos no estan documentados en la informacion disponible.

Su relevancia es doble: por un lado, demuestra una tecnica de abliteration reproducible sobre un modelo MoE de gran tamano; por otro, su naturaleza descensurada lo convierte en una herramienta de investigacion sobre alineamiento y seguridad, no en un modelo recomendable para despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent-MoE (descendiente de Qwen3.8-Flash-Next) |
| Parametros totales | 4.947.698.560 (segun safetensors); la model card indica "145B" |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits) en el pool de expertos; skeleton en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Edge0 Community Model License 1.0 + Qwen Community License 1.0 |
| Formato de pesos | GGUF (`model-skeleton.gguf`), pool de expertos NVFP4, `mmproj-BF16.gguf` para vision |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura latent-MoE, es decir, un mezcla de expertos en el que las proyecciones se realizan sobre un espacio latente. El paquete se divide en un "skeleton" siempre residente (que incluye atencion lineal, atencion estandar, down-projection del experto compartido y embeddings de tokens) y un pool de expertos de 47,6 GB en NVFP4, ademas de una tabla de n-gramas de 51,2 GB, proyecciones latentes, tokenizer y una cabeza de borrador MTP (multi-token prediction) para decodificacion especulativa.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta derivacion es la abliteration: se proyecta fuera de las matrices de pesos que escriben en el residual stream una "direccion de rechazo" medida. Concretamente, se aplican 47 vectores unitarios por capa de 2560 dimensiones, tomados de la direccion de rechazo publicada de Qwen3.8-Flash-Next y transferidos a los pesos de Edge0, ya que el motor de Edge0 no emite un volcado de residuales del que derivar una direccion propia. El cambio afecta a 97 tensores, con una variacion relativa por tensor de entre el 1,68 % y el 4,22 % de la norma (mediana 2,09 %), y λ = 1,0. La direccion se verifico empiricamente, no se asumio.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y generacion de codigo (el tag `coding` figura en la model card).
- Capacidades de agente y tool calling: se sirve con endpoints compatibles con OpenAI y Anthropic, lo que facilita su integracion en frameworks de agentes.
- Vision: soportada mediante `mmproj-BF16.gguf` y el helper `strata-vision`, igual que en el modelo base.
- Decodificacion especulativa mediante cabeza de borrador MTP.
- Comportamiento descensurado: se elimina el rechazo en peticiones de ambito cyber/seguridad (port scanning, phishing, cracking de ZIP, floods de peticiones).
- Capacidad multilingue: no documentada en la informacion disponible.
- Modo "thinking" desactivable (las pruebas de la model card se realizaron con thinking off).

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la proyeccion de una direccion de rechazo afecta al comportamiento en un MoE de gran tamano, con un harness de 99 prompts (`abliteration/refusal_probe.py`) incluido para medir la tasa de rechazo.
- Red teaming y evaluacion de robustez: util para generar ataques y prompts adversarios en entornos controlados de seguridad ofensiva autorizada, dado que no rechaza peticiones de ambito cyber.
- Analisis de sesgos y comportamiento descensurado: comparar las respuestas del modelo abliterated frente al base para cuantificar el efecto de la intervencion en pesos.
- Desarrollo de agentes con tool calling: los endpoints compatibles con OpenAI y Anthropic permiten conectarlo a orquestadores de agentes existentes sin adaptadores.
- Procesamiento de documentos con vision: el soporte de `mmproj-BF16.gguf` habilita tareas de comprension de imagenes en pipelines locales.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite medir ganancias de throughput en inferencia local sobre hardware GB10-class.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta una prueba puntual de nueve prompts sobre el skeleton distribuido (thinking off, sin vector en tiempo de ejecucion):

| Categoria | Prompts | Resultado |
|---|---|---|
| Normales (receta, bomba de calor, ordenacion en Python) | 3 | 3/3 entregados y coherentes |
| Cyber / seguridad (port scanner, phishing, zip cracking, flood) | 4 | 4/4 entregados, sin rechazo |
| CBRN - arma quimica | 1 | rechazado |
| CBRN - artefacto explosivo | 1 | entregado tras preambulo de descargo |

El autor advierte explicitamente que se trata de spot checks y no de un benchmark, y recomienda medir el comportamiento sobre los prompts propios.

## Requisitos de hardware

- VRAM estimada: el build completo ocupa aproximadamente 58,6 GiB en una maquina con 121 GiB de memoria unificada (clase GB10). Una tarjeta GDDR de 24 GB puede ejecutarlo segun las cifras del modelo base.
- GPU recomendadas: NVIDIA exclusivamente; el build NVFP4 es solo CUDA (CUDA 13, Linux o Windows, incluido aarch64). No se documentan modelos concretos como A100 o H100 en la informacion disponible.
- Cabe en consumer GPU: si, en tarjetas de 24 GB GDDR segun las cifras del upstream, aunque el paquete completo requiere descargar unos 114 GB.
- Opciones de despliegue: motor propietario `edge0-strata` con front end `edge0-infer`; servidor en `http://127.0.0.1:8000` con endpoints compatibles con OpenAI y Anthropic (nombre de modelo `edge0_145b`), o modo interactivo con `edge0-infer chat`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Edge0-Cyber-Uncensored-nvfp4 | 4.947.698.560 (segun safetensors) | no disponible | Edge0 Community 1.0 + Qwen 1.0 | Hugging Face, motor propio | Derivacion abliterated, solo CUDA |
| Edge0-145B-NVFP4 (base) | no disponible | no disponible | Edge0 Community 1.0 | Hugging Face, motor propio | Modelo original con rechazo intacto |
| Qwen3.8-Flash-Next | no disponible | no disponible | Qwen Community 1.0 | Hugging Face | Ancestro arquitectonico; fuente de la direccion de rechazo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: no rechaza peticiones de ambito cyber/seguridad, lo que lo hace inadecuado para despliegues de atencion al cliente o produccion general sin filtros externos.
- La pared CBRN-quimica se mantiene de forma deliberada, pero la de explosivos no; el autor lo describe como una linea de corte intencionada, no un fallo.
- Riesgo elevado de alucinacion y de generar contenido danino: el autor declara explicitamente que no se responsabiliza de las salidas ni del uso que se haga de ellas.
- Sesgos conocidos: no documentados en la informacion disponible; la abliteration puede alterar el comportamiento mas alla del rechazo.
- Restricciones de licencia: uso personal, de investigacion y de modificacion libre; las salidas son del usuario y pueden usarse comercialmente, pero vender una oferta comercial del modelo en si requiere autorizacion de Edge0. Redistribucion permitida bajo la seccion 5, con textos de licencia y avisos incluidos.
- Dependencia de un motor propietario (`edge0-strata` + `edge0-infer`) y de CUDA 13; no hay soporte para ecosistemas estandar como llama.cpp o vLLM.
- Discrepancia entre el nombre "145B" y los 4.947.698.560 parametros de safetensors; conviene verificar el dato antes de planificar recursos.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en 2026-11-17, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Edge0-Cyber-Uncensored-nvfp4
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Repositorio del motor: https://github.com/Edge0-AI/Edge0
- Documentacion del motor (`edge0-strata/EDGE0.md`): dentro del repositorio anterior
- Guia del front end (`edge0-infer/docs/getting-started.md`): dentro del repositorio anterior
- Metodologia de abliteration (`abliteration/README.md`): dentro del repositorio del modelo
- Harness de evaluacion de rechazo (`abliteration/refusal_probe.py`): dentro del repositorio del modelo
- Licencia Qwen upstream (`third-party/Qwen-LICENSE.txt`): dentro del repositorio del modelo

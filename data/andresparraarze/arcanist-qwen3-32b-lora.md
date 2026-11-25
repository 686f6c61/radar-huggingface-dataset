# andresparraarze/Arcanist-Qwen3-32B-LoRA

## Resumen

Arcanist-Qwen3-32B-LoRA es un adaptador LoRA (formato PEFT) desarrollado por iOrchestra sobre el modelo base Qwen/Qwen3-32B. Se trata de un ajuste fino QLoRA especializado en ingenieria de hardware, con foco concreto en KiCad y el flujo de trabajo EDA: captura de esquematicos, diseno de PCB, huellas y simbolos, verificacion ERC/DRC, listas de materiales (BOM), scripting de KiCad y generacion de salidas de fabricacion (Gerber, taladro, pick-and-place). Es el modelo que impulsa el producto Vibe Engineer.

El adaptador tiene rango 64 sobre todas las proyecciones de atencion y MLP, ocupa aproximadamente 2,1 GB y se entreno contra la version cuantizada a 4 bits del modelo base (unsloth/Qwen3-32B-bnb-4bit). El modelo base aporta 32.800 millones de parametros con una ventana de contexto nativa de 32.768 tokens, aunque el ajuste se realizo con secuencias de 4.096 tokens. El entrenamiento se llevo a cabo con Unsloth sobre el dataset bilingue frances/ingles Ailiance-fr/mascarade-kicad-dataset, compuesto por 2.645 conversaciones en formato ShareGPT.

Su relevancia radica en la especializacion vertical: aplica el conocimiento general de Qwen3-32B a un dominio tecnico muy concreto donde los LLM genericos suelen fallar (sintaxis S-expression de KiCad, convenciones IPC, criterios de diseno electrico). La licencia CC-BY-SA-4.0 es permisiva para uso comercial con atribucion y compartir-igual, y existe una build GGUF lista para Ollama, llama.cpp y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3) con adaptador LoRA/PEFT |
| Parametros totales | 32.800 millones (modelo base) + adaptador LoRA de ~2,1 GB |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el base; entrenado con 4.096 tokens |
| Tipos de cuantizacion | 4 bits (bnb-4bit, base de entrenamiento); build GGUF disponible en repositorio separado |
| Idiomas soportados | Ingles y frances |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-32B, un transformer decoder-only causal de 32.800 millones de parametros. El ajuste fino es QLoRA supervisado (SFT) realizado con Unsloth, con rango LoRA 64 sobre todas las proyecciones de atencion y MLP, entrenado contra la version del base cuantizada a 4 bits (unsloth/Qwen3-32B-bnb-4bit). Las secuencias de entrenamiento fueron de 4.096 tokens, por debajo de la ventana nativa de 32.768 tokens del modelo base.

Los datos de entrenamiento provienen del dataset Ailiance-fr/mascarade-kicad-dataset (revision 66a52fc), con 2.645 conversaciones bilingues FR/EN en formato ShareGPT (system/user/assistant), usado sin modificaciones, sin filtrado ni aumentacion. Segun la auditoria del propio dataset, aproximadamente el 79,7 % de las muestras son contenido sintetico generado por LLM y cerca del 5,5 % proceden de Stack Exchange Electronics (CC-BY-SA-4.0), con atribucion por muestra en los metadatos. El ajuste se realizo sobre respuestas directas sin trazas de razonamiento, por lo que se recomienda el modo no-thinking (`enable_thinking=False` o `/no_think`); el modo thinking se hereda de Qwen3 pero no fue entrenado.

## Capacidades

- Generacion de texto conversacional especializada en ingenieria de hardware y diseno electronico.
- Asistencia en captura de esquematicos y diseno de PCB en KiCad.
- Creacion y revision de huellas (footprints) y simbolos de componentes.
- Explicacion y resolucion de errores de ERC (Electrical Rules Check) y DRC (Design Rules Check).
- Generacion de listas de materiales (BOM) y salidas de fabricacion: Gerber, taladro, pick-and-place.
- Generacion de archivos KiCad en formato S-expression valido.
- Scripting de KiCad en Python.
- Conocimiento de estandares IPC aplicados a diseno de hardware.
- Soporte bilingue ingles/frances.
- Capacidad de razonamiento paso a paso heredada de Qwen3 (modo thinking no ajustado).

## Casos de uso

- Asistente de diseno en KiCad: el modelo responde preguntas sobre captura de esquematicos, asignacion de huellas y simbolos, y convenciones de diseno, integrándose en el flujo de trabajo diario del disenador electronico.
- Depuracion de ERC/DRC: ayuda a interpretar los mensajes de error de las comprobaciones electricas y de reglas de diseno y a proponer correcciones concretas sobre el esquematico o el layout.
- Generacion de archivos KiCad: produce contenido en formato S-expression valido para simbolos, huellas u hojas de esquematico, que el usuario puede revisar e importar.
- Automatizacion con scripting de KiCad: genera y explica scripts de Python para tareas repetitivas como renombrado de nets, generacion de BOM o exportacion de fabricacion.
- Copiloto EDA con verificacion por herramientas: el modelo puede actuar como capa de lenguaje dentro de un agente que valide sus salidas con `kicad-cli` y las comprobaciones ERC/DRC reales antes de aceptar el resultado.
- Asistencia en seleccion de componentes y BOM: ayuda a razonar sobre valores electricos, encapsulados y alternativas de componentes, siempre con verificacion contra datasheets.
- Base para ajuste fino adicional: al ser un adaptador PEFT sobre Qwen3-32B, sirve como punto de partida para especializaciones mas concretas dentro del dominio electronico.
- Soporte bilingue en equipos FR/EN: atiende consultas tecnicas en ingles y frances, util en entornos de ingenieria con equipos mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en 4 bits (bnb-4bit, configuracion recomendada por el autor): aproximadamente 22 GB de VRAM.
- Inferencia sobre el base en bf16 con adaptador fusionado (`merge_and_unload`): aproximadamente 66 GB de VRAM.
- GPU recomendadas para 4 bits: A100 40 GB, H100, L40S, RTX A6000 (48 GB); en consumer, RTX 4090 (24 GB) queda al limite y puede requerir offload.
- GPU para bf16 completo: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Cabe en consumer GPU de 24 GB solo en cuantizaciones mas agresivas (build GGUF) o con descarga parcial a CPU.
- Despliegue: Transformers + PEFT, Unsloth (FastLanguageModel), vLLM con `--enable-lora --max-lora-rank 64`, y la build GGUF para llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Arcanist-Qwen3-32B-LoRA | 32,8B (base) + LoRA | 32.768 (entrenado a 4.096) | KiCad / EDA / PCB | CC-BY-SA-4.0 | PEFT safetensors, GGUF |
| Qwen/Qwen3-32B | 32,8B | 32.768 | Generalista | Apache-2.0 (segun el base) | safetensors, GGUF |
| Modelos generalistas de 32B (p. ej. familia Qwen3) | ~32B | 32.768 | Generalista | variable | safetensors, GGUF |

El valor diferencial frente al Qwen3-32B original es la especializacion en el dominio KiCad/EDA y el soporte bilingue FR/EN orientado a ese dominio; a cambio, el ajuste se realizo solo sobre respuestas directas y con un dataset relativamente pequeno (2.645 conversaciones), por lo que su ventaja se limita al nicho entrenado. No se dispone de benchmarks comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- No debe usarse para aprobar disenos de seguridad critica, medicos, automocion o de tension de red sin revision de un ingeniero cualificado.
- Los numeros de referencia, huellas, pinouts y valores electricos generados deben verificarse siempre contra datasheets; el modelo puede alucinar datos tecnicos.
- No se debe producir fabricacion de forma desatendida sin ejecutar ERC/DRC en KiCad.
- El dataset de entrenamiento es mayoritariamente sintetico (~79,7 %), lo que puede introducir errores sistematicos o sesgos del generador.
- Entrenado solo en ingles y frances; el rendimiento en castellano u otros idiomas no esta garantizado.
- El ajuste se hizo con secuencias de 4.096 tokens, por debajo de la ventana nativa del base; el rendimiento en contextos largos puede degradarse.
- Modo thinking no ajustado: se recomienda usarlo en modo no-thinking.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obligacion de compartir-igual de las obras derivadas; revisar implicaciones antes de integrarlo en productos propietarios.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema y validacion comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andresparraarze/Arcanist-Qwen3-32B-LoRA
- Build GGUF: https://huggingface.co/andresparraarze/Arcanist-Qwen3-32B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Base cuantizada de entrenamiento: https://huggingface.co/unsloth/Qwen3-32B-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/Ailiance-fr/mascarade-kicad-dataset
- Unsloth: https://github.com/unslothai/unsloth
- Licencia CC-BY-SA-4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paper de referencia (arxiv:2505.09388): https://arxiv.org/abs/2505.09388

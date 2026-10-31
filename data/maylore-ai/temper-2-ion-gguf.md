# maylore-ai/Temper-2-Ion-GGUF

## Resumen

Temper-2-Ion-GGUF es la version cuantizada en formato GGUF de Temper-2-Ion, un modelo de lenguaje de 0,5 mil millones de parametros (494 millones exactos segun los metadatos de safetensors) desarrollado por maylore-ai y especializado en generacion de codigo Rust. El modelo base es un fine-tuning de Qwen2.5-Coder-0.5B-Instruct, lo que hereda sus capacidades conversacionales y de instruccion, y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones.

Su relevancia radica en el nicho que cubre: Rust es un lenguaje con relativamente poca representacion en los corpus de entrenamiento genericos, y un modelo pequeno y especializado permite tareas de autocompletado y generacion de codigo Rust en hardware muy modesto, incluso sin GPU. Con una cuantizacion Q8_0 de 532 MB, puede ejecutarse en portatiles, maquinas virtuales o entornos con recursos limitados mediante llama.cpp u Ollama.

El modelo soporta ingles y ruso como idiomas, y su pipeline es text-generation con caracter conversacional. Al tratarse de un modelo muy pequeno, su ventana de contexto y capacidades son limitadas comparadas con modelos grandes, pero su especializacion en Rust lo hace util como asistente ligero para ese lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-Coder-0.5B-Instruct) |
| Parametros totales | 494.032.768 (~0,5B) |
| Parametros activos | no disponible (no se indica arquitectura MoE; se asume densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base usa safetensors |

## Arquitectura y entrenamiento

Temper-2-Ion parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder denso de la familia Qwen2.5 optimizado para codigo. El autor (maylore-ai) ha realizado un fine-tuning especializado en Rust, aunque la model card no detalla el tamano del dataset de entrenamiento, la composicion del corpus, el numero de tokens ni el uso de tecnicas como RLHF o DPO.

La version GGUF aqui descrita es una cuantizacion del modelo base a 8 bits (Q8_0), que reduce el tamano de 494 millones de parametros en safetensors a 532 MB en disco, manteniendo una perdida de precision minima respecto a FP16. No se han documentado innovaciones tecnicas especificas como decodificacion especulativa o attention linear en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational)
- Generacion y autocompletado de codigo Rust, su especialidad principal
- Comprension de instrucciones en ingles y ruso (heredado del modelo base Qwen2.5-Coder-0.5B-Instruct)
- Ejecucion local eficiente en CPU gracias al formato GGUF
- No hay informacion disponible sobre soporte de tool calling, function calling, agentes, vision ni audio

## Casos de uso

- Autocompletado de codigo Rust en editores: puede integrarse en extensiones de VS Code o Neovim mediante backends como llama.cpp, ofreciendo sugerencias locales sin enviar codigo a servicios externos.
- Asistente de escritorio offline: con 532 MB y ejecucion en CPU, sirve como chatbot de codigo Rust en portatiles sin GPU, mediante Ollama o llama-cli.
- Generacion de plantillas y boilerplate Rust: util para producir structs, traits y funciones estandar rapidamente durante el desarrollo.
- Revision y explicacion de fragmentos de codigo Rust: puede describir que hace un bloque de codigo dado, aprovechando el entrenamiento instruct del modelo base.
- Prototipado de herramientas de IA embebidas: su tamano reducido permite incrustarlo en aplicaciones Rust o CLI que necesiten generacion de codigo sin dependencias de nube.
- Entornos educativos: como material practico para enseñar fine-tuning especializado y despliegue de modelos cuantizados con llama.cpp y Ollama.
- Aprendizaje del idioma ruso aplicado a programacion: dado su soporte de ingles y ruso, puede atender consultas tecnicas en ruso, algo poco comun en modelos pequenos de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina del modelo base (maylore-ai/Temper-2-Ion) para resultados y detalles, pero no se incluyen metricas concretas (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 532 MB para la cuantizacion Q8_0, mas margen para el contexto (estimable en menos de 1 GB total para contextos moderados); ejecutable integramente en CPU y RAM.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna con 2 GB de VRAM o mas aceleraria la inferencia (por ejemplo, una RTX 3060 o superior de sobra).
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU consumer actual, incluidas integradas con memoria compartida.
- Opciones de despliegue: llama.cpp (comando directo `llama-cli -hf maylore-ai/Temper-2-Ion-GGUF:Q8_0`), Ollama (`ollama run hf.co/maylore-ai/Temper-2-Ion-GGUF:Q8_0` o creando un Modelfile local). No hay informacion sobre soporte en vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 0,5B cuantizado a Q8_0, se espera inferencia rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Formato |
|---|---|---|---|---|
| Temper-2-Ion-GGUF | ~0,5B | Codigo Rust | Apache 2.0 | GGUF (Q8_0) |
| Qwen2.5-Coder-0.5B-Instruct | ~0,5B | Codigo multilenguaje | Apache 2.0 | Safetensors, GGUF comunitarios |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | Codigo multilenguaje | Apache 2.0 | Safetensors, GGUF comunitarios |

Temper-2-Ion-GGUF comparte tamano y licencia con Qwen2.5-Coder-0.5B-Instruct, del que deriva, pero aporta especializacion en Rust. Frente a Qwen2.5-Coder-1.5B, sacrifica capacidad general a cambio de un consumo de recursos tres veces menor. No hay datos de benchmarks que permitan comparar rendimiento numerico.

## Limitaciones y advertencias

- Modelo muy pequeno (0,5B): su capacidad de razonamiento y generacion es limitada; puede producir codigo Rust con errores de compilacion o patrones suboptimos.
- Riesgo de alucinacion elevado, tipico de modelos pequenos: puede inventar APIs o crates de Rust inexistentes; verificar siempre el codigo generado.
- Idiomas limitados a ingles y ruso; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada en esta ficha; consultar la pagina del modelo base antes de planificar tareas con documentos largos.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, pero al derivar de Qwen2.5-Coder conviene revisar las condiciones de ese modelo base para usos concretos.
- Proyecto con traccion minima (142 descargas, 2 likes en el momento de la ficha): escasa validacion comunitaria, sin garantias de mantenimiento ni actualizaciones.
- Solo se distribuye cuantizacion Q8_0; no hay variantes mas comprimidas (Q4_K_M, etc.) ni pesos FP16 en este repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maylore-ai/Temper-2-Ion-GGUF
- Modelo base: https://huggingface.co/maylore-ai/Temper-2-Ion
- Sitio web del autor: https://maylore.com/temper-2-ion
- Modelo original del que deriva: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct

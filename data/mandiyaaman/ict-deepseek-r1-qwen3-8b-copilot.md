# mandiyaaman/ICT-DeepSeek-R1-Qwen3-8B-Copilot

## Resumen

ICT-DeepSeek-R1-Qwen3-8B-Copilot es un ajuste fino publicado por el usuario mandiyaaman sobre Goekdeniz-Guelmez/Josiefied-DeepSeek-R1-0528-Qwen3-8B-abliterated-v1, un modelo derivado de la familia Qwen3 que combina la destilacion de trazas de razonamiento de DeepSeek-R1-0528 con la eliminacion de las direcciones de rechazo ("abliterated"). El resultado es un transformer decoder-only denso de aproximadamente 8.000 millones de parametros, orientado a generacion de texto y, a juzgar por el sufijo "Copilot", a la asistencia en tareas de codigo y razonamiento. Se distribuye bajo licencia Apache 2.0 y declara unicamente el idioma ingles.

El autor indica que el entrenamiento se realizo con Unsloth y TRL, presentado como un entrenamiento "2x mas rapido". No se publican detalles sobre el dataset, el numero de tokens, la longitud de contexto efectiva ni resultados de evaluacion. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes y ocupa solo 0,4 GB, lo que sugiere que puede contener adaptadores o una publicacion incompleta en lugar de los pesos completos en precision completa.

Su relevancia practica es acotada pero concreta: sirve como banco de pruebas para experimentos de destilacion de razonamiento sobre Qwen3, para estudiar el efecto de la ablation de rechazos y como base para fine-tunes de dominio en ingles. En produccion debe tratarse con cautela por la ausencia de benchmarks y por la naturaleza "abliterated" del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada del modelo base) |
| Parametros totales | ~8.000 millones (8B, segun el nombre del modelo y su linaje Qwen3-8B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el base Qwen3-8B declara 32.768 tokens nativos, ampliables con YaRN; sin confirmar para este fine-tune) |
| Tipos de cuantizacion | No disponible; el repositorio solo declara safetensors. No se publican versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (`en`), unico idioma declarado en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`, compatible con text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la de Qwen3-8B: un transformer decoder-only denso con atencion causal, sin mezcla de expertos. El linaje es encadenado: Qwen3-8B como base, una destilacion de las trazas de razonamiento de DeepSeek-R1-0528 (version del 28 de mayo) sobre esa base, una variante "abliterated" que elimina las direcciones de activacion asociadas al rechazo de peticiones, y finalmente este fine-tune de mandiyaaman. La ablation de rechazos se aplica habitualmente mediante la ortogonalizacion de las activaciones de rechazo en las capas medias, de modo que el modelo deja de rehusar peticiones que el modelo original rechazaria.

No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento, la mezcla de datos (codigo, matematicas, instrucciones generales) ni sobre si se aplicaron etapas de RLHF, DPO o preferencias. La unica innovacion tecnica documentada es el uso de Unsloth y TRL para acelerar el entrenamiento. Tampoco se especifica si el fine-tune modifica el tokenizador, el chat template o la ventana de contexto respecto al base.

## Capacidades

- Generacion de texto en ingles: capacidad declarada en la model card (`language: en`).
- Razonamiento multi-paso: esperable por el linaje DeepSeek-R1-0528, pero no verificado con benchmarks ni ejemplos publicados.
- Generacion de codigo: el nombre "Copilot" sugiere orientacion a asistencia de programacion, sin documentacion que lo confirme.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Uso como agente y razonamiento multi-paso con herramientas: no disponible.
- Capacidades multilingues: solo ingles declarado; no se declara soporte de castellano ni de otros idiomas.
- Modo "thinking" o cadena de pensamiento explicita: probable por herencia de R1-0528, no confirmado en la ficha.
- Comportamiento de rechazo: reducido o eliminado por la ablation del modelo base.

## Casos de uso

- Asistencia de codigo en IDE: el sufijo "Copilot" y el tamano de 8B permiten desplegarlo en local para autocompletado y explicacion de fragmentos en ingles; requiere validar primero que el fine-tune conserva la calidad de codigo del base, algo no documentado.
- Prototipado de razonamiento paso a paso: util como banco de pruebas para estudiar cadenas de pensamiento destiladas de R1-0528 en un modelo de 8B que cabe en GPUs de consumo.
- Generacion de documentacion tecnica en ingles: redaccion de READMEs, docstrings y guias a partir de codigo fuente, aprovechando el contexto del base Qwen3-8B (pendiente de confirmar en este fine-tune).
- Investigacion sobre seguridad y alineacion: la variante abliterated lo convierte en un caso de estudio controlado para medir la degradacion de rechazos y el efecto en la utilidad del modelo.
- Base para fine-tunes de dominio: al ser Apache 2.0 y 8B, es un punto de partida economico para adaptar a un dominio concreto en ingles mediante LoRA.
- Generacion de respuestas de referencia en pipelines de evaluacion: puede emplearse como generador barato para comparar salidas de otros modelos, siempre que se filtren las respuestas por ausencia de alineacion.
- Experimentacion academica con Unsloth: reproducible en una sola GPU para comparar recetas de entrenamiento acelerado sobre Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, 20-24 GB contando cache KV y activaciones para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB.
- GPU de consumo: cabe en 4 bits en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB; en bf16 requiere una RTX 4090 (24 GB) o superior. En 8 bits encaja con holgura en 16 GB.
- GPU de datacenter: A100 de 40 u 80 GB, H100, L40S; sobredimensionadas para un 8B salvo que se busque throughput alto.
- Opciones de despliegue: `transformers`, TGI (etiqueta `text-generation-inference`), vLLM, llama.cpp y Ollama previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput: no disponible. No se han publicado mediciones.
- Advertencia de despliegue: el repositorio ocupa 0,4 GB, muy por debajo de los ~16 GB esperables para un 8B en bf16, por lo que probablemente contenga adaptadores LoRA o una carga incompleta; habria que fusionarlos con el modelo base antes de servir.

## Comparativa con modelos similares

Nota: los datos de las filas de modelos comparables proceden de sus fichas publicas y no de la informacion proporcionada para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ICT-DeepSeek-R1-Qwen3-8B-Copilot (este) | ~8B | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen3-8B (Alibaba) | 8B | 32.768 nativos / 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente utilizado |
| DeepSeek-R1-0528-Qwen3-8B (DeepSeek) | 8B | no disponible | MIT | HuggingFace |
| Llama 3.1 8B (Meta) | 8B | 128.000 | Llama 3.1 Community License | HuggingFace |

Frente a Qwen3-8B, este modelo anade la destilacion de razonamiento y la ablation de rechazos, a costa de perder la alineacion original y de no documentar el proceso. Frente a DeepSeek-R1-0528-Qwen3-8B, incorpora un fine-tune adicional del que no se publican datos. Frente a Llama 3.1 8B, la licencia Apache 2.0 es mas permisiva que la licencia comunitaria de Meta.

## Limitaciones y advertencias

- Modelo base "abliterated": se han eliminado las direcciones de rechazo, por lo que puede generar contenido que el modelo original bloquearia. No es apto para produccion sin filtros externos de entrada y salida.
- Solo ingles declarado: no hay soporte documentado de castellano ni de otros idiomas, lo que limita su uso en productos en espanol.
- Sin benchmarks: no hay evidencia publica de calidad en MMLU, HumanEval, GSM8K ni en tareas de razonamiento; la herencia de R1-0528 no garantiza el rendimiento tras el fine-tune y la ablation.
- Riesgo de alulcinacion: inherente a los modelos de 8B y no mitigado por ninguna etapa de alineacion documentada.
- Longitud de contexto no confirmada: no se especifica si el fine-tune conserva los 32.768 tokens del base ni si soporta extension con YaRN.
- Repositorio de 0,4 GB: inconsistente con un 8B completo en bf16; puede contener solo adaptadores o estar incompleto. Verificar los ficheros antes de integrarlo.
- Sin validacion comunitaria: 0 descargas y 0 likes en la fecha de publicacion (19 de octubre de 2026); no hay informes de terceros.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base encadenado y la ablation de seguridad pueden entrar en conflicto con las politicas de uso aceptable de plataformas de despliegue.
- Sin informacion sobre sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad ni equidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mandiyaaman/ICT-DeepSeek-R1-Qwen3-8B-Copilot
- Modelo base declarado: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-DeepSeek-R1-0528-Qwen3-8B-abliterated-v1
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales del autor.

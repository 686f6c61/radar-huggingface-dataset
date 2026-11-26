# ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_gptoss20b

## Resumen

`ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_gptoss20b` es un checkpoint de tipo transformer publicado en Hugging Face por el usuario ishikaa. El identificador del repositorio sugiere que se trata de un ajuste fino (fine-tuning) derivado de la familia GPT-OSS de OpenAI, con aproximadamente 20.000 millones de parametros totales segun los datos reales de los archivos safetensors. El nombre interno ("acquisition_generator_AS_confidence_combine_OH_MP_N") apunta a un uso muy especifico, probablemente un generador de consultas de adquisicion dentro de un pipeline de investigacion con combinacion de confianza, pero el autor no documenta nada al respecto.

La model card es la plantilla automatica de Hugging Face sin rellenar: todos los campos tecnicos (desarrollador, licencia, idiomas, datos de entrenamiento, evaluacion) figuran como "[More Information Needed]". No hay articulo, blog, demo ni repositorio de codigo asociado, y el modelo no registra descargas ni interacciones en el momento de la consulta. El unico dato fiable es el recuento de parametros y el tamano del repositorio (83,7 GB), coherente con pesos en precision completa o bf16 de un modelo de ~21B.

Por tanto, esta ficha documenta lo que se puede verificar y marca explicitamente como no disponible todo lo demas. No debe tratarse como un modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia gpt_oss, segun tag del repositorio); detalles no disponibles |
| Parametros totales | 20.914.757.184 (~20,9B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 83,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-11-26 |

## Arquitectura y entrenamiento

El tag `gpt_oss` y el sufijo `gptoss20b` del identificador indican que el modelo parte de la arquitectura GPT-OSS de OpenAI. No obstante, la model card no especifica si se trata de un transformer denso o de una mezcla de expertos (MoE), ni el numero de parametros activos por token. El recuento de safetensors (~20,9B) es el unico dato estructural verificable.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, la existencia de RLHF/DPO, hiperparametros, infraestructura de computo ni innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.). El nombre del repositorio sugiere un ajuste fino orientado a una tarea concreta de generacion de adquisiciones con combinacion de senales de confianza, pero se desconoce el procedimiento seguido.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation` declarado).
- Uso conversacional (tag `conversational`).
- Compatibilidad con endpoints de inferencia de Hugging Face (tag `endpoints_compatible`).
- Capacidad de razonamiento, codigo, matematicas, vision, tool calling o agentes: no disponible.
- Soporte multilingue: no disponible.
- Modo thinking o cualquier capacidad especial: no disponible.

## Casos de uso

Dado que el modelo no documenta su entrenamiento ni su evaluacion, los casos siguientes son hipoteticos y requieren validacion propia antes de cualquier despliegue:

- Generacion de consultas de adquisicion en pipelines de investigacion: por el nombre del checkpoint, parece disenado para producir consultas o peticiones dentro de un flujo de seleccion activa; habria que verificar el formato de entrada y salida esperado.
- Experimentacion academica con modelos de ~21B: util como punto de partida para comparar ajustes finos sobre la base GPT-OSS en entornos de investigacion controlados.
- Prototipado de asistentes conversacionales: el tag `conversational` permite integrarlo en un chat basico mediante `transformers`, siempre que se defina manualmente el formato de prompt.
- Evaluacion comparativa de checkpoints derivados de GPT-OSS: sirve como referencia para medir el efecto de un fine-tuning especifico frente al modelo base.
- Pruebas de integracion con endpoints de Hugging Face: al estar marcado como `endpoints_compatible`, puede desplegarse en la infraestructura gestionada de HF para pruebas de latencia y calidad.
- Generacion de texto sintetico para aumentar datasets internos: con la debida supervision humana y filtrado, podria emplearse para producir candidatos que luego se validen manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 42 GB solo para pesos (20,9B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 48-80 GB por GPU.
- Cuantizacion a 8 bits: ~21 GB de pesos, viable en una GPU de 24-32 GB con contexto corto.
- Cuantizacion a 4 bits: ~11-12 GB de pesos, podria caber en GPUs de consumo de 16-24 GB, aunque no se distribuyen pesos GGUF y habria que generarlos.
- GPU recomendadas: A100 80 GB, H100 80 GB o multi-GPU (2x A6000/RTX 4090) para precision completa.
- GPU de consumo: posible en RTX 4090 (24 GB) solo con cuantizacion agresiva y contexto limitado; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM o TGI para servir en produccion; llama.cpp/Ollama requeririan conversion a GGUF propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_gptoss20b | ~20,9B | no disponible | no disponible | Hugging Face, sin descargas |
| GPT-OSS 20B (modelo base de referencia) | ~20B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face / OpenAI |
| Otros fine-tunes de ~20B en HF | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables verificadas en la informacion proporcionada, por lo que la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre sesgos, datos de entrenamiento ni evaluacion de seguridad.
- Riesgo elevado de alucinacion y de comportamiento impredecible al desconocerse el ajuste fino aplicado.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier explotacion.
- Idiomas y contexto desconocidos: no se puede garantizar soporte del castellano ni ventanas largas.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad.
- El nombre del repositorio sugiere un uso muy especializado; emplearlo fuera de ese dominio probablemente produzca resultados pobres.
- El modelo base GPT-OSS puede arrastrar las politicas de uso de OpenAI; conviene revisar los terminos de la familia original.
- Antes de produccion: ejecutar evaluaciones propias (calidad, sesgo, seguridad) y fijar la revision del repositorio, ya que puede cambiar sin aviso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_gptoss20b
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Perfil del autor en Hugging Face: https://huggingface.co/ishikaa
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados al modelo.

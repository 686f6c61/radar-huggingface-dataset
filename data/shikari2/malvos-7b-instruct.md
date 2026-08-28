# SHIKARI2/Malvos-7B-Instruct

## Resumen

Malvos-7B-Instruct es un modelo de lenguaje de 7.600 millones de parámetros desarrollado por SHIKARI2 como un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`. Está diseñado para tareas de generación de texto conversacional e instrucciones, con un enfoque particular en el ámbito del código, dado que su modelo base es un especialista en programación. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

El ajuste fino se realizó utilizando las librerías Unsloth y TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que los métodos convencionales. Aunque la ficha del modelo no proporciona detalles sobre el conjunto de datos de entrenamiento ni las técnicas de alineación empleadas, al tratarse de un fine-tune de un modelo instruct ya alineado, se espera que herede las capacidades de razonamiento y generación de código de Qwen2.5-Coder-7B-Instruct. El modelo está disponible en formato safetensors y es compatible con el ecosistema Transformers y text-generation-inference.

Actualmente el modelo no cuenta con descargas ni valoraciones en Hugging Face, y no se han publicado resultados de benchmarks ni documentación técnica adicional más allá de la model card básica. Esto lo convierte en una opción interesante para experimentación, pero con poca evidencia de rendimiento verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors original) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit`, que a su vez es una version cuantizada en 4 bits del modelo Qwen2.5-Coder-7B-Instruct de Alibaba. La arquitectura subyacente es un transformer causal con atencion por grupos de consultas (GQA) y ventana de contexto de 32.000 tokens en el modelo original, aunque no se confirma si este fine-tune mantiene esa longitud. El entrenamiento se realizo con Unsloth, una libreria que optimiza el fine-tune mediante kernels de atencion eficientes y cuantizacion en 4 bits, y con la libreria TRL de Hugging Face para el ajuste por instrucciones.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La model card solo indica que es un "finetuned model" subido por el autor, sin detalles adicionales sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto conversacional e instructivo, heredada del modelo base Qwen2.5-Coder-7B-Instruct.
- Generacion de codigo en multiples lenguajes de programacion, dado que el modelo base esta especializado en tareas de programacion.
- Razonamiento logico y matematico basico, propio de los modelos de 7B de la familia Qwen2.5.
- Soporte de tool calling y function calling, aunque no se documenta explicitamente en la ficha.
- Capacidad multilingue limitada al ingles, segun la etiqueta de idioma.
- No se documentan capacidades especiales como vision, audio o modo thinking.

Nota: estas capacidades son inferencias razonables basadas en el modelo base, pero no estan confirmadas en la documentacion del fine-tune.

## Casos de uso

- Asistente de programacion en entornos de desarrollo: el modelo puede generar fragmentos de codigo, explicar funciones y depurar errores, aprovechando su base Qwen2.5-Coder. Se integraria en IDEs o herramientas de autocompletado.
- Generacion de documentacion tecnica: dado su entrenamiento en codigo, puede redactar comentarios, docstrings y manuales de API a partir de codigo fuente.
- Chatbot de soporte tecnico: al ser un modelo instruct, puede mantener conversaciones multi-turno para resolver dudas de usuarios sobre productos o servicios, aunque su contexto no esta confirmado.
- Educacion en programacion: puede actuar como tutor virtual explicando conceptos de programacion y resolviendo ejercicios paso a paso.
- Automatizacion de tareas de procesamiento de texto: resumir, extraer informacion o reformatear contenido, aunque su especialidad es el codigo.
- Prototipado rapido de aplicaciones: generar esqueletos de aplicaciones o scripts de automatizacion a partir de descripciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo concreto. Se recomienda realizar pruebas propias antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7,6B parametros, en precision FP16 se necesitan aproximadamente 15 GB de VRAM. Con cuantizacion a 4 bits (no incluida en el repo, pero posible mediante herramientas como llama.cpp o GPTQ), se reduce a unos 4-5 GB.
- GPU recomendadas: tarjetas con 16 GB o mas de VRAM para FP16 (por ejemplo, RTX 4080, RTX 4090, A100). Con cuantizacion, puede ejecutarse en GPUs consumer de 8 GB como RTX 3060 o RTX 4060.
- Compatibilidad con consumer GPU: si, siempre que se aplique cuantizacion. En FP16 requiere una GPU de gama alta.
- Opciones de despliegue: al ser un modelo Transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (mediante conversion). Tambien se puede usar con la libreria Transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 7B en una GPU moderna, se espera una latencia de decodificacion de 20-50 ms por token y un throughput de 20-50 tokens/segundo, dependiendo de la cuantizacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| Malvos-7B-Instruct | 7,6B | no disponible | Apache-2.0 | Codigo (fine-tune de Qwen2.5-Coder) |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32K | Apache-2.0 | Codigo y razonamiento general |
| Mistral-7B-Instruct-v0.2 | 7,3B | 32K | Apache-2.0 | Instrucciones generales |
| Llama-2-7B-Chat | 6,7B | 4K | Llama License | Chat general |

La comparativa se basa en los modelos base, ya que no hay datos especificos del fine-tune. Malvos-7B-Instruct hereda las capacidades de Qwen2.5-Coder, por lo que es comparable a otros modelos de 7B orientados a codigo, aunque su rendimiento real no esta verificado.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos o alucinaciones. Al ser un modelo pequeno (7B), es probable que presente alucinaciones en tareas complejas o de conocimiento factual.
- La longitud de contexto no esta confirmada; si se mantiene la del modelo base (32K), es adecuada para documentos largos, pero no hay garantia.
- Solo soporta ingles, lo que limita su uso en entornos multilingues.
- No hay evidencia de rendimiento en benchmarks, por lo que su calidad real es desconocida.
- El modelo no tiene descargas ni valoraciones, lo que sugiere que no ha sido probado ampliamente por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Al ser un fine-tune de un modelo cuantizado en 4 bits, podria haber perdido algo de precision respecto al modelo original en FP16.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SHIKARI2/Malvos-7B-Instruct
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-7B-Instruct-bnb-4bit
- Libreria Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL: https://github.com/huggingface/trl

No se encontraron otros enlaces relevantes (papers, blogs o demos) en la busqueda web.

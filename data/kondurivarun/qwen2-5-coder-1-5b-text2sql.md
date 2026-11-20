# kondurivarun/qwen2.5-coder-1.5b-text2sql

## Resumen

El modelo `kondurivarun/qwen2.5-coder-1.5b-text2sql` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`, orientado a la generacion de consultas SQL a partir de lenguaje natural (text-to-SQL). Lo publica el usuario kondurivarun en Hugging Face bajo licencia Apache 2.0, con un unico idioma declarado (ingles) y un pipeline de `text-generation`.

Se trata de un modelo pequeno, con 1.543.714.304 parametros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5-Coder de Alibaba. El ajuste se ha realizado con Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, lo que sugiere un entrenamiento eficiente en memoria sobre el checkpoint cuantizado a 4 bits del modelo instructivo original.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Resulta util como ejemplo de fine-tuning ligero para tareas de traduccion de lenguaje natural a SQL en entornos con recursos limitados, pero no debe considerarse un modelo de referencia sin una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B soporta hasta 32.768 tokens, pero el fine-tuning no lo declara) |
| Tipos de cuantizacion | no disponible (el checkpoint base es bnb-4bit; el repo publicado contiene safetensors) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atencion causal, disenado originalmente para tareas de codigo. El ajuste fino se ha realizado sobre la version cuantizada a 4 bits del modelo instructivo (`unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`), utilizando Unsloth y la libreria TRL. La model card indica que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla del uso de Unsloth para acelerar el fine-tuning. Tampoco se detalla el dataset text-to-SQL empleado, lo que impide evaluar la calidad y cobertura del ajuste.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural (text-to-SQL), que es el objetivo declarado del fine-tuning.
- Generacion de texto general y conversacion, heredada del modelo base instructivo Qwen2.5-Coder.
- Razonamiento sobre codigo y estructuras de datos, dado el origen en la familia Qwen2.5-Coder.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base lo soporta, pero no se confirma para este fine-tuning.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen2.5-Coder es multilingue.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Generacion de consultas SQL en asistentes de analitica: el modelo puede traducir preguntas en ingles a sentencias SQL para su ejecucion sobre bases de datos relacionales, gracias a su ajuste especifico text-to-SQL.
- Prototipado de interfaces de consulta en lenguaje natural: util para construir demos o MVPs de herramientas que permitan a usuarios no tecnicos consultar bases de datos sin escribir SQL.
- Educacion y formacion en SQL: el modelo puede servir como ejemplo de traduccion de enunciados a consultas, aunque requiere validacion humana por su tamano reducido.
- Integracion en pipelines de generacion de codigo: al ser un modelo de 1,5 B, puede desplegarse en entornos con recursos limitados para generar consultas en tareas de automatizacion.
- Experimentacion academica en fine-tuning: sirve como caso de estudio de ajuste ligero con Unsloth sobre un modelo cuantizado a 4 bits.
- Generacion de consultas en entornos de bajo coste: su tamano permite ejecucion en CPU o GPU consumer, adecuado para tareas de batch o prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en FP16 (1,5 B parametros), y alrededor de 1-2 GB en cuantizacion de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060 o superiores; para cuantizacion 4 bits basta con 2 GB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de consumo, e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp (previa conversion a GGUF), Ollama (previa conversion), vLLM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kondurivarun/qwen2.5-coder-1.5b-text2sql | 1,5 B | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5 B | 32.768 tokens (segun documentacion del modelo base) | apache-2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-Coder-7B-Instruct | 7 B | 32.768 tokens (segun documentacion del modelo base) | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un modelo entrenado principalmente en ingles y codigo, puede reflejar sesgos de esos datos.
- Riesgo de alucinacion: alto en tareas text-to-SQL, ya que puede generar consultas sintacticamente validas pero semanticamente incorrectas; requiere validacion contra el esquema real de la base de datos.
- Limitaciones de contexto o idioma: solo se declara ingles; el contexto maximo no se especifica en la model card del fine-tuning.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para produccion: sin benchmarks publicados, cero descargas y documentacion minima; no se recomienda su uso en produccion sin una evaluacion exhaustiva propia. El dataset de entrenamiento no esta documentado, lo que impide verificar la calidad del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/kondurivarun/qwen2.5-coder-1.5b-text2sql
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl

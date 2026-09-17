# raditkw/legal-assistant-llama3.2-3b-finetuned

## Resumen

`raditkw/legal-assistant-llama3.2-3b-finetuned` es un ajuste fino (fine-tuning) del modelo `unsloth/llama-3.2-3b-instruct-bnb-4bit`, publicado por el usuario raditkw en HuggingFace. Por el nombre del repositorio, el ajuste está orientado a tareas de asistencia jurídica, aunque la model card no documenta el conjunto de datos de entrenamiento, el número de pasos, la composición del corpus ni el procedimiento de alineación empleado.

El modelo base es Llama 3.2 3B Instruct en su variante cuantizada a 4 bits con bitsandbytes, distribuida por Unsloth para facilitar entrenamiento con QLoRA. El entrenamiento del ajuste se realizó con Unsloth y la librería TRL de HuggingFace, con el reclamo del autor de haber sido "2x faster" respecto a un entrenamiento convencional; no se aportan métricas que respalden esa cifra.

La relevancia del modelo es limitada a efectos prácticos: cuenta con 0 descargas y 0 likes, el tamano del repositorio figura como 0.0 GB, la model card no incluye benchmarks ni documentación del dataset, y no se ha publicado ningún resultado de evaluación. Para un dominio de alto riesgo como el jurídico, la ausencia de trazabilidad sobre los datos de ajuste es un caveat serio. Se recomienda tratarlo como un experimento de fine-tuning reproducible, no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped-Query Attention (GQA) y RoPE, heredada del modelo base Llama 3.2 3B Instruct (no detallada en la model card del fine-tune) |
| Parametros totales | 3.210 millones (aprox., heredado del modelo base Llama 3.2 3B; no confirmado en la model card del fine-tune) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens segun la especificacion del modelo base Llama 3.2 3B; no confirmado en la model card del fine-tune ni en el proceso de ajuste |
| Tipos de cuantizacion | El punto de partida es bitsandbytes 4-bit (`bnb-4bit`). No se publican versiones GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | Ingles (`language: en` en la model card). El modelo base Llama 3.2 soporta oficialmente 8 idiomas; el ajuste solo declara ingles |
| Licencia | apache-2.0 declarada por el autor (ver advertencias: el modelo base esta sujeto a la Llama 3.2 Community License) |
| Formato de pesos | safetensors (etiqueta en HuggingFace); el repositorio no lista ficheros GGUF. El tamano declarado del repo es 0.0 GB, por lo que la disponibilidad efectiva de pesos no esta verificada |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only autorregresivo con normalizacion RMSNorm pre-norm, activacion SwiGLU en la red feed-forward, embeddings rotatorios (RoPE) para la codificacion posicional y atencion con consultas agrupadas (GQA) para reducir el coste de la cache KV durante la inferencia. El vocabulario es el de la familia Llama 3 (128.256 tokens). No se dispone de datos confirmados sobre el numero de capas, dimension oculta o numero de cabezas de atencion del checkpoint publicado.

El procedimiento de ajuste descrito en la model card es minimo: se parte de `unsloth/llama-3.2-3b-instruct-bnb-4bit` y se entrena con Unsloth y TRL, presumiblemente mediante QLoRA sobre la base cuantizada a 4 bits. No se especifica el dataset (ni su dominio, idioma, tamano o procedencia), el numero de tokens de entrenamiento, la configuracion de hiperparametros (learning rate, rango LoRA, epochs) ni si hubo una etapa de RLHF, DPO u otro tipo de alineacion posterior al SFT. Tampoco se indica si el adaptador se fusiono con los pesos base, lo que afecta a la forma de cargar el modelo.

No se documenta ninguna innovacion tecnica propia mas alla del uso de las optimizaciones de Unsloth para acelerar el entrenamiento, ni tecnicas de decodificacion especulativa, atencion lineal o variantes hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, con el estilo instruct heredado de Llama 3.2 3B Instruct.
- Respuestas orientadas a dominio juridico segun la intencion declarada por el nombre del repositorio; no hay evaluacion que confirme la calidad en tareas legales.
- Razonamiento basico de un solo turno y multi-turno conversacional, limitado por el tamano del modelo (3B).
- Capacidad de instruccion generica (resumen, reescritura, clasificacion simple) en la medida en que el ajuste no haya provocado un olvido catastrofico del modelo base.
- Soporte de tool calling / function calling: no documentado en la model card, aunque el modelo base Llama 3.2 Instruct lo soporta.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: la model card declara unicamente ingles; el comportamiento en castellano no esta verificado.
- Capacidad especial de modo "thinking", vision o audio: no disponible. Llama 3.2 3B es un modelo exclusivamente de texto (las variantes multimodales de Llama 3.2 son 11B y 90B).

## Casos de uso

- Prototipado academico de asistentes juridicos: sirve como ejercicio reproducible de fine-tuning con QLoRA sobre una base de 3B, util para comparar metodologias de ajuste en entornos docentes o de investigacion, no para decisiones reales.
- Clasificacion y etiquetado de documentos legales a pequena escala: por ejemplo, separar clausulas de contratos en categorias predefinidas (confidencialidad, indemnizacion, resolucion), siempre con supervision humana sobre las salidas.
- Resumen exploratorio de textos largos: con una ventana de hasta 128.000 tokens heredada del modelo base, puede condensar contratos o expedientes extensos, aunque la calidad del resumen en dominio juridico no esta medida.
- Generacion de borradores de baja criticidad: primeros borradores de correos, avisos o plantillas que un profesional revisa y reescribe despues; el modelo acelera el arranque, no sustituye la revision.
- Extraccion de entidades en pipelines internos: integrado como paso de preprocesado (partes, fechas, importes, jurisdicciones) con validacion posterior mediante reglas o un segundo modelo.
- Chatbot de preguntas frecuentes sobre un corpus controlado: desplegado con recuperacion aumentada (RAG) sobre documentacion propia, de modo que las respuestas se anclen a pasajes verificables y se reduzca el riesgo de invencion.
- Experimentacion con despliegue en hardware modesto: al derivar de una base de 3B, cabe en GPUs de consumo y permite probar pilas de inferencia (vLLM, TGI, llama.cpp) sin presupuesto de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna evaluacion especifica de dominio juridico (por ejemplo, LexGLUE, CaseHOLD o LegalBench), y no existe documentacion sobre el dataset que permita reproducir el ajuste o auditar su comportamiento.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano del modelo base (3.210 millones de parametros) y no han sido verificadas con el checkpoint publicado, cuyo repositorio figura con 0.0 GB.

- VRAM para inferencia en 4 bits: aproximadamente 2,5-3,5 GB para los pesos, mas la cache KV (que crece con la longitud de contexto y con el numero de secuencias concurrentes). Suficiente para GPUs con 6-8 GB.
- VRAM para inferencia en 8 bits: aproximadamente 4-4,5 GB de pesos.
- VRAM en FP16/BF16: aproximadamente 6,5-7 GB de pesos; con contexto largo y lotes grandes puede superar los 10-12 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y L4/A10 para servicio; A100 o H100 solo si se necesita servir muchas peticiones concurrentes o contexto muy largo.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas en cuantizacion 4 bits, y en equipos con 16 GB de RAM unificada mediante cuantizacion en CPU.
- Opciones de despliegue: transformers (el repositorio esta etiquetado como `transformers` y `text-generation-inference`, y es compatible con `endpoints_compatible`), vLLM, TGI, Ollama y llama.cpp requieren conversion previa a GGUF, ya que el repositorio no publica ese formato.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de modelo, una cuantizacion 4 bits sobre una RTX 4090 puede situarse en el orden de decenas a mas de cien tokens por segundo en generacion, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| raditkw/legal-assistant-llama3.2-3b-finetuned | 3,2B (heredado) | 128k (heredado, no confirmado) | apache-2.0 declarada por el autor | HuggingFace, 0 descargas, repo de 0.0 GB | Sin datos de entrenamiento ni benchmarks; ajuste no validado |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | 128k | Llama 3.2 Community License | Ampliamente disponible | Modelo base de referencia, con documentacion completa de entrenamiento y evaluaciones publicadas |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (extensible a 131k con RoPE scaling) | Apache-2.0 (la mayoria de variantes Qwen2.5) | Ampliamente disponible | Alternativa frecuente en el mismo rango de tamano, con soporte multilingue declarado mas amplio |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Ampliamente disponible | Entrenado con enfasis en datos filtrados de razonamiento y codigo |

No se dispone de resultados de benchmarks del modelo objeto de esta ficha que permitan una comparacion cuantitativa con las alternativas listadas.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de ajuste: no se puede evaluar procedencia, licencia, sesgos ni cobertura del corpus juridico utilizado.
- Riesgo elevado de alucinacion en dominio legal. Un modelo de 3B ajustado sin evaluacion publicada puede generar referencias normativas, articulos o jurisprudencia inexistentes con aparente seguridad. No debe usarse para asesoramiento juridico sin revision profesional.
- Repositorio con 0 descargas, 0 likes y 0.0 GB de tamano declarado: la existencia efectiva de pesos completos no esta verificada y el modelo no ha sido validado por terceros.
- Licencia: aunque el autor declara apache-2.0, el modelo base Llama 3.2 esta bajo la Llama 3.2 Community License, que impone condiciones de atribucion ("Built with Llama"), obligaciones de nombrado, una clausula de 700 millones de usuarios activos mensuales y el cumplimiento de la politica de uso aceptable. Es necesario revisar la compatibilidad de la relicencia antes de cualquier uso comercial.
- Idioma: solo se declara ingles. El rendimiento en castellano de Espana no esta probado y es probable que sea inferior al del modelo base completo, dado el ajuste en un unico idioma.
- Sin evaluacion de olvido catastrofico: un fine-tuning no supervisado sobre un dominio estrecho puede degradar capacidades generales del modelo base.
- Contexto: aunque la arquitectura base admite 128.000 tokens, no hay confirmacion de que el ajuste se haya entrenado con secuencias largas; usar contextos extensos puede degradar la calidad y disparar el consumo de VRAM por la cache KV.
- Sin garantias de seguridad: no se documenta filtrado de contenido, moderacion ni evaluaciones de robustez frente a prompts adversarios (jailbreaks).
- Fecha de creacion registrada en HuggingFace: 2026-09-17, con ultima actualizacion dos segundos despues, lo que sugiere una subida automatizada sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raditkw/legal-assistant-llama3.2-3b-finetuned
- Modelo base del ajuste: https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Documentacion del modelo base Llama 3.2: https://www.llama.com/docs/model-cards-and-prompt-formats/llama3_2/
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de ayuda de Gmail sin relacion con el contenido). No se han encontrado papers, blogs, demos ni repositorios adicionales asociados al checkpoint.

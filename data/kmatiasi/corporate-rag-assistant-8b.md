# kmatiasi/corporate-rag-assistant-8b

## Resumen

Corporate RAG Assistant 8B es una configuracion especializada de despliegue construida sobre meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario kmatiasi en HuggingFace. No se presenta como un modelo entrenado desde cero ni como un fine-tune con datos propios documentados, sino como un ajuste orientado a sistemas de generacion aumentada por recuperacion (RAG) en entornos corporativos: respuesta a consultas sobre bases de conocimiento internas, politicas de recursos humanos, procedimientos operativos normalizados y contratos legales.

El problema que intenta resolver es el de la fidelidad y la trazabilidad en asistentes empresariales: el modelo declara guardarrailes estrictos contra la alucinacion, de forma que solo responde con fragmentos de contexto verificados procedentes de documentos de la empresa, y adjunta citas con fuentes, numeros de pagina y codigos de politica. Se promociona como compatible con despliegue en servidores locales aislados (air-gapped) para cumplimiento de privacidad, conectado a bases de datos vectoriales como FAISS o ChromaDB.

La relevancia del repositorio es limitada a fecha de la informacion disponible: acumula 0 descargas y 0 likes, la model card es muy breve y no aporta detalles de entrenamiento, y el unico idioma declarado es el ingles. La arquitectura de partida es la de Llama 3.1 8B (transformer decoder-only con 8.030 millones de parametros), por lo que las capacidades reales dependen en gran medida del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.1 del modelo base), con atencion por grupos (GQA), RoPE y activacion SwiGLU |
| Parametros totales | 8.030 millones (aproximadamente 8B, heredados del modelo base) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 128.000 tokens segun las especificaciones del modelo base Llama-3.1-8B-Instruct; no confirmado de forma explicita en la model card de este repositorio |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (no se publican artefactos GPTQ, AWQ ni GGUF en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 declarada en los metadatos del repositorio; el modelo base esta sujeto a la Llama 3.1 Community License, lo que puede imponer condiciones adicionales |
| Formato de pesos | No disponible de forma explicita; el ejemplo de la model card usa transformers con AutoModelForCausalLM, lo que sugiere safetensors, pero no se confirma |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Pipeline | text-generation |
| Etiquetas | text-generation, rag, enterprise, corporate-qa |
| Despliegue previsto | Servidor local tras cortafuegos empresarial, con base de datos vectorial (FAISS, ChromaDB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only autorregresivo de 8.030 millones de parametros, con normalizacion RMSNorm, embeddings rotatorios (RoPE), atencion con consultas agrupadas (GQA) para reducir el coste de memoria de la cache KV y activacion SwiGLU en las capas feed-forward. El repositorio no modifica ni documenta cambios en esta arquitectura; se describe a si mismo como una "configuracion de despliegue especializada" del modelo base.

No se proporciona informacion alguna sobre el proceso de entrenamiento: no se indica el numero de tokens utilizados, la composicion del dataset, si hubo ajuste supervisado, RLHF, DPO u otra tecnica de alineamiento, ni si se aplico LoRA, QLoRA o un fine-tune completo. Las capacidades declaradas (guardarrailes anti-alucinacion, citas automaticas, negativa a responder fuera del contexto) parecen implementadas principalmente mediante ingenieria de prompt y restricciones de instrucciones, no mediante un entrenamiento verificado en la documentacion disponible.

Un detalle tecnico relevante es que el fragmento de codigo de la model card carga los pesos de meta-llama/Llama-3.1-8B-Instruct en lugar de los pesos del repositorio kmatiasi/corporate-rag-assistant-8b, lo que genera dudas razonables sobre si existen pesos propios publicados y sobre que diferencia real hay entre este repositorio y el modelo base con un system prompt especifico.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-3.1-8B-Instruct.
- Respuesta a preguntas sobre documentos corporativos en un esquema de RAG: recibe fragmentos recuperados de una base vectorial y genera respuestas fundamentadas en ellos.
- Guardarrail anti-alucinacion declarado: cuando la respuesta no esta en el contexto proporcionado, el modelo responde con la frase fija "I cannot find that information in the provided corporate repository.".
- Generacion de citas empresariales: extraccion y formateo de fuentes, numeros de pagina y codigos de politica junto a la respuesta.
- Procesamiento de documentos internos de tipo SOP (procedimientos operativos normalizados), manuales de cumplimiento de recursos humanos y marcos legales y de compliance.
- Compatibilidad con despliegue aislado (air-gapped) en servidores locales, orientado a cumplimiento de privacidad y ausencia de fuga de datos.
- Integracion con bases de datos vectoriales como FAISS o ChromaDB, segun la propia model card.
- Capacidades heredadas del modelo base no confirmadas en este repositorio: tool calling y function calling, razonamiento multi-paso, modo de razonamiento, capacidades multilingues. La model card no las menciona ni las descarta.
- No se declaran capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Atencion al empleado sobre politicas de recursos humanos: el modelo responde a preguntas del tipo "cuantos dias de vacaciones anuales corresponden segun la politica de RRHH" citando el documento, la pagina y el codigo de politica concretos, lo que permite al empleado verificar la fuente sin abrir el manual completo.
- Consulta de procedimientos operativos normalizados (SOP): un tecnico pregunta por el protocolo de escalado de incidencias y el sistema recupera el fragmento correspondiente del SOP y devuelve los pasos con la referencia exacta al documento aprobado.
- Revision de contratos y marcos de cumplimiento: el modelo localiza clausulas relevantes en contratos internos y responde preguntas sobre obligaciones, plazos o condiciones, citando la seccion del contrato para que el equipo legal valide la respuesta.
- Asistente interno en entorno air-gapped: en organizaciones con requisitos estrictos de soberania del dato (banca, sanidad, defensa), el modelo se despliega en servidores locales sin salida a internet y consume unicamente la base documental interna, evitando cualquier envio de informacion a APIs externas.
- Soporte de auditoria y trazabilidad documental: gracias al formato de citas con fuente, pagina y codigo, cada respuesta queda vinculada a evidencia verificable, lo que facilita auditorias internas y revisiones de cumplimiento normativo.
- Onboarding de nuevos empleados: un chatbot interno responde a preguntas frecuentes sobre beneficios, horarios, procesos de solicitud y normativa interna, reduciendo la carga del equipo de recursos humanos y garantizando respuestas consistentes con la documentacion oficial.
- Base para pipelines de RAG sectoriales: el modelo puede servir como capa generativa en arquitecturas que recuperan de repositorios normativos, expedientes o manuales tecnicos, siempre que el equipo de desarrollo implemente su propio pipeline de recuperacion (FAISS, ChromaDB u otros) y controle el contexto inyectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, RAGAS, fidelidad de respuesta, tasa de alucinacion ni ninguna otra metrica, y no hay datos de evaluacion en el repositorio que permitan verificar las afirmaciones sobre guardarrailes anti-alucinacion.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 16 GB solo para pesos, mas overhead de cache KV (que crece con la longitud de contexto, dado el soporte de hasta 128.000 tokens del modelo base). Se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en cuantizacion de 8 bits (INT8): aproximadamente 8-9 GB de pesos, con margen adicional para cache KV.
- VRAM estimada en cuantizacion de 4 bits (GPTQ, AWQ, bitsandbytes NF4): aproximadamente 5-6 GB de pesos, mas overhead.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para despliegue en produccion con contexto largo y concurrencia; L40S o A10G para cargas moderadas; RTX 4090 (24 GB) para FP16 con contexto contenido o cuantizacion para contexto amplio.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en FP16 con contexto moderado; en RTX 3060 12 GB, RTX 4070 y similares es viable con cuantizacion de 4 u 8 bits. En GPUs de 8 GB solo con cuantizacion agresiva y contextos cortos.
- Opciones de despliegue: transformers con device_map="auto" (metodo mostrado en la model card), vLLM o TGI para servir con alto throughput, llama.cpp u Ollama si se generan artefactos GGUF a partir del modelo base. El repositorio no publica pesos GGUF, GPTQ ni AWQ, por lo que la cuantizacion tendria que realizarla el usuario.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Como referencia orientativa del modelo base de 8B, en una A100 con vLLM se suele obtener un throughput elevado con batching continuo, pero no hay cifras verificadas para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Orientacion | Disponibilidad |
|---|---|---|---|---|---|---|
| kmatiasi/corporate-rag-assistant-8b | 8B | 128.000 tokens (heredado del base, no confirmado en la model card) | Ingles | apache-2.0 declarada; base bajo Llama 3.1 Community License | RAG corporativo, guardarrailes anti-alucinacion | 0 descargas, 0 likes; sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Multilingue (8 idiomas declarados) | Llama 3.1 Community License | Instrucciones generales, tool calling | Muy extendido, amplio ecosistema de cuantizaciones |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.000 tokens | Multilingue | Apache 2.0 | Instrucciones generales, function calling | Amplia disponibilidad, comunidad consolidada |
| Qwen2.5-7B-Instruct | 7,6B | 128.000 tokens (hasta 131.072 en variantes) | Multilingue amplio | Apache 2.0 en la mayoria de variantes | Instrucciones, codigo, matematicas, tool calling | Muy extendido, buenas cifras publicadas |

La comparacion relevante es con el propio modelo base: este repositorio no documenta mejoras medibles frente a Llama-3.1-8B-Instruct con un system prompt de RAG bien disenado, y carece de evaluaciones que respalden una ventaja real.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion de la tasa de alucinacion: las afirmaciones de la model card sobre guardarrailes estrictos no estan cuantificadas ni verificadas.
- El ejemplo de codigo de la model card carga meta-llama/Llama-3.1-8B-Instruct, no los pesos del repositorio, lo que pone en duda que existan pesos diferenciados publicados.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion, lo que implica ausencia de validacion por parte de la comunidad.
- Los metadatos de HuggingFace indican fechas de creacion y actualizacion de septiembre de 2026, anomalas respecto a la fecha de consulta, lo que sugiere datos inconsistentes en el repositorio.
- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues efectivas en este ajuste, aunque el modelo base sea multilingue.
- La licencia declarada es apache-2.0, pero al derivar de Llama 3.1 el uso comercial esta sujeto tambien a la Llama 3.1 Community License y a su politica de uso aceptable; conviene revisar ambas antes de un despliegue productivo.
- No se publican artefactos cuantizados (GGUF, GPTQ, AWQ), lo que complica el despliegue en hardware de consumo sin trabajo adicional.
- Los guardarrailes anti-alucinacion basados en instrucciones y en la frase de rechazo fija no son garantias tecnicas: un prompt mal construido o un contexto recuperado irrelevante puede degradar la fidelidad.
- La calidad final depende criticamente del pipeline de recuperacion (chunking, embeddings, re-ranking) y de la base vectorial, aspectos que el repositorio no documenta ni proporciona.
- No se detalla el proceso de entrenamiento, por lo que no puede descartarse que se trate unicamente de un system prompt especializado sobre el modelo base.
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos eran contenido no relacionado y de naturaleza inapropiada, por lo que se han descartado en su totalidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kmatiasi/corporate-rag-assistant-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.

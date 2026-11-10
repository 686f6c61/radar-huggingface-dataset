# mradermacher/stoner-bud-e-GGUF

## Resumen

Stoner-bud-e es un modelo de lenguaje conversacional especializado en el dominio del cannabis, concebido como un "budtender" (dependiente de dispensario) virtual. El modelo original fue desarrollado por el usuario Kartoon93 y esta construido sobre la arquitectura Qwen2, con aproximadamente 7.615 millones de parametros totales. Esta ficha describe concretamente la version cuantizada en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad, que facilita su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo esta disenado para conversaciones multi-turno y para integrarse en sistemas de generacion aumentada por recuperacion (RAG), segun las etiquetas declaradas por el autor. Su ambito tematico es muy concreto: recomendacion de cepas, efectos, dosificacion y atencion al cliente en el contexto de dispensarios de cannabis. El idioma declarado es unicamente el ingles.

La relevancia de esta ficha radica en que documenta una cuantizacion practica de un modelo de nicho, con un conjunto amplio de variantes GGUF (desde Q2_K hasta f16) que permiten desplegarlo desde equipos modestos hasta estaciones de trabajo con GPU. No obstante, la informacion publica sobre entrenamiento, licencia y evaluacion es muy limitada, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atencion causal estandar. El modelo base (Kartoon93/stoner-bud-e) parte presumiblemente de un modelo Qwen2 de ~7,6 mil millones de parametros, aunque la model card no detalla el proceso de ajuste fino, el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas indican un enfasis en conversacion y en RAG, lo que sugiere un ajuste orientado a respuestas contextualizadas sobre documentacion de dominio.

La contribucion tecnica de esta publicacion concreta es la cuantizacion estatica a GGUF realizada por mradermacher. La model card indica que se generaron cuantizaciones estaticas y que no se han publicado (por el momento) cuantizaciones con imatrix o ponderadas. No se documentan innovaciones arquitectonicas adicionales como decodificacion especulativa, atencion lineal o mecanismos hibridos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Respuestas especializadas en el dominio del cannabis: cepas, efectos, perfiles de terpenos, dosificacion y recomendaciones de producto.
- Integracion en pipelines de RAG, segun la etiqueta `rag` del autor.
- Uso como asistente de atencion al cliente para dispensarios (etiqueta `budtender`).
- Compatibilidad con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Atencion al cliente en dispensarios: el modelo puede gestionar conversaciones multi-turno sobre productos, disponibilidad y recomendaciones, adecuado por su ajuste especifico al dominio y su naturaleza conversacional.
- Asistente RAG sobre catalogos de productos: combinado con una base vectorial de fichas de cepas y productos, el modelo puede responder consultas fundamentadas en documentacion recuperada, aprovechando la etiqueta `rag` declarada por el autor.
- Educacion y divulgacion sobre cannabis: respuestas explicativas sobre efectos, metodos de consumo y consideraciones de dosificacion para publico adulto.
- Prototipado rapido en local: las cuantizaciones Q4_K_M (4,8 GB) permiten ejecutar el modelo en portatiles con GPU de consumo, ideal para demos y pruebas de concepto.
- Chatbot embebido en tienda online: integracion en un sitio de e-commerce para guiar al usuario en la seleccion de productos, con despliegue via llama.cpp u Ollama.
- Investigacion sobre ajuste fino de dominio: servir como caso de estudio de como un modelo pequeno ajustado a un nicho se comporta frente a modelos generalistas en tareas especializadas.
- Generacion de contenido editorial: redaccion de descripciones de producto y guias de cepas para blogs o catalogos, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y overhead de contexto):
  - Q2_K (3,1 GB): ~4 GB de VRAM.
  - Q4_K_M (4,8 GB): ~6 GB de VRAM.
  - Q8_0 (8,2 GB): ~10 GB de VRAM.
  - f16 (15,3 GB): ~16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; RTX 4090, A100 o H100 para f16 y para mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 6-8 GB de VRAM usando Q4_K_M o inferiores; en 12-16 GB con Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa; requeririan los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| stoner-bud-e (esta ficha) | ~7,6 B | no disponible | no disponible | GGUF | Ajuste de nicho (cannabis), solo ingles |
| Qwen2-7B-Instruct | ~7,6 B | 32.768 tokens (segun ficha oficial de Qwen) | Apache 2.0 (segun ficha oficial) | safetensors, GGUF | Modelo generalista, multilingue, ampliamente evaluado |
| Mistral-7B-Instruct v0.3 | ~7,2 B | 32.768 tokens (segun ficha oficial) | Apache 2.0 (segun ficha oficial) | safetensors, GGUF | Generalista, buen rendimiento en codigo e instrucciones |
| Llama 3.1 8B Instruct | ~8 B | 131.072 tokens (segun ficha oficial) | Llama 3.1 Community License | safetensors, GGUF | Generalista, multilingue, con licencia con restricciones de uso |

La comparacion con los modelos generalistas es orientativa: stoner-bud-e no publica evaluaciones y su licencia no esta declarada, lo que limita la comparacion rigurosa en rendimiento y en condiciones de uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un ajuste de nicho sobre datos presumiblemente limitados, existe riesgo de respuestas sesgadas o poco matizadas en temas de salud.
- Riesgo de alucinacion: alto en un dominio donde la informacion precisa (dosificacion, efectos adversos, legalidad) es critica; no debe usarse como fuente de consejo medico o legal sin supervision.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia no esta disponible, lo que impide confirmar si se permite el uso comercial. Es un bloqueante para produccion hasta que el autor la declare.
- Ausencia de benchmarks: no hay evaluaciones publicadas que respalden la calidad del ajuste.
- Modelo base de origen no verificado: no se detalla el proceso de entrenamiento ni la procedencia de los datos, lo que dificulta la auditoria.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; se recomienda Q4_K_M o superior para uso real.
- Contenido sensible: el dominio del cannabis esta sujeto a regulacion variable por jurisdiccion; el despliegue debe cumplir la normativa local.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/stoner-bud-e-GGUF
- Modelo base: https://huggingface.co/Kartoon93/stoner-bud-e
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#stoner-bud-e-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

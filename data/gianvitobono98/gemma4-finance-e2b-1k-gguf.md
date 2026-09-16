# gianvitobono98/gemma4-finance-e2b-1k-gguf

## Resumen

`gianvitobono98/gemma4-finance-e2b-1k-gguf` es un modelo de lenguaje publicado en Hugging Face por el usuario gianvitobono98. Se trata de un ajuste fino (fine-tuning) orientado al dominio financiero, segun se deduce del propio identificador del repositorio, que despues fue convertido a formato GGUF mediante Unsloth para su ejecucion con llama.cpp y Ollama. El repositorio contiene un unico archivo de pesos cuantizado, `gemma-4-e2b-it.Q4_K_M.gguf`, y un Modelfile de Ollama para despliegue inmediato.

El dato objetivo disponible sobre el tamano del modelo es el recuento de parametros de los pesos originales: 4.647.450.147 parametros, es decir, aproximadamente 4,65 mil millones. El repositorio ocupa 3,4 GB, coherente con una cuantizacion de 4 bits. La model card es minima: no documenta la arquitectura, el contexto nativo, los idiomas, la licencia ni el dataset de entrenamiento.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, cuantizado y ejecutable en hardware de consumo, planteado como asistente conversacional especializado en finanzas. Al no existir resultados de benchmarks, evaluaciones publicadas ni documentacion de entrenamiento, cualquier uso en produccion exige una validacion propia previa. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no la especifica; el identificador sugiere la familia Gemma (transformer decoder-only), sin confirmar |
| Parametros totales | 4.647.450.147 (aproximadamente 4,65 mil millones) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado: `gemma-4-e2b-it.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | GGUF para llama.cpp; el repositorio completo ocupa 3,4 GB |
| Fecha de publicacion | 16 de septiembre de 2026 (segun metadatos del repositorio) |
| Ultima actualizacion | 16 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. El autor no incluye en la model card ningun detalle sobre el tipo de red, el mecanismo de atencion, la longitud de contexto nativa ni el tokenizador. El identificador del repositorio (`gemma4`, `e2b`, `it`) apunta a un modelo instructivo de la familia Gemma, pero esta afirmacion no esta respaldada por documentacion en el propio repositorio y no debe tomarse como un hecho verificado.

Tampoco se documenta el proceso de entrenamiento: no se indica el numero de tokens de entrenamiento, la composicion del dataset financiero, si hubo fases de RLHF, DPO u otra alineacion, ni los hiperparametros del ajuste fino. El sufijo `1k` del nombre sugiere un volumen de ejemplos reducido (del orden de mil), pero el autor no lo confirma. Lo unico verificable es que el ajuste fino y la conversion a GGUF se realizaron con Unsloth, herramienta que el autor cita explicitamente y que aparece en las etiquetas del repositorio junto a `llama.cpp`, `gguf` y `conversational`.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos de tipo instruccion-respuesta.
- Dominio financiero declarado: por el identificador y el nombre del ajuste, el modelo se presenta como especializado en contenido financiero, aunque el autor no detalla que tareas concretas cubre.
- Ejecucion local con llama.cpp: la model card documenta el uso mediante `llama-cli -hf gianvitobono98/gemma4-finance-e2b-1k-gguf --jinja`, lo que habilita plantillas de chat con Jinja.
- Despliegue con Ollama: el repositorio incluye un Modelfile de Ollama, por lo que admite ejecucion directa en ese entorno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de Inference Endpoints de Hugging Face, aunque no se aportan detalles de configuracion.
- Soporte multimodal: la model card menciona de forma generica el uso de `llama-mtmd-cli` para modelos multimodales, pero no confirma que este repositorio incluya proyector visual ni pesos multimodales. No verificado.
- Tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, vision, audio y capacidades multilingues: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el perfil tecnico del modelo (4,65 mil millones de parametros, cuantizacion Q4_K_M, ejecucion local). No estan validados por el autor ni por evaluaciones publicadas, por lo que requieren prueba previa en cada organizacion.

- Resumen de documentos financieros en local: el modelo puede procesar informes trimestrales, notas de prensa de resultados o extractos de balances y generar resumenes en texto, ejecutandose integramente en una maquina sin GPU de gama alta, lo que evita enviar informacion financiera sensible a APIs externas.
- Asistente conversacional de atencion al cliente en banca: permite gestionar dialogos multi-turno sobre productos financieros basicos (saldo, comisiones, condiciones de un producto) desplegado con Ollama en un servidor interno. La ventana de contexto real debe medirse antes de fijar el alcance del flujo.
- Extraccion y clasificacion de conceptos en texto financiero: transcripciones de llamadas, correos de clientes o tickets internos pueden clasificarse en categorias (reclamacion, consulta de producto, incidencia de pago) como paso previo a un enrutado automatico.
- Generacion de borradores de contenido educativo financiero: articulos divulgativos, fichas de producto o guiones para material formativo sobre conceptos como interes compuesto, diversificacion o riesgo de credito, siempre con revision humana obligatoria.
- Prototipado rapido de aplicaciones de IA financiera: al ser un GGUF de 3,4 GB, sirve para iterar en local con llama.cpp o LM Studio antes de decidir si se migra a un modelo mayor o a un proveedor externo.
- Motor de respuestas en un sistema RAG sobre normativa o documentacion interna: el modelo actua como generador final que redacta la respuesta a partir de fragmentos recuperados de una base documental, reduciendo la dependencia de la memoria parametrica del modelo y, con ello, el riesgo de alucinacion.
- Analisis de sentimiento sobre noticias financieras: clasificacion de titulares y comunicados en positivos, neutros o negativos como senal auxiliar en un panel de seguimiento de mercado, nunca como unica fuente de decision.
- Despliegue en entornos con conectividad restringida: por su tamano y formato, puede ejecutarse en portatiles o estaciones de trabajo aisladas (air-gapped), un requisito habitual en departamentos de riesgos y cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, GSM8K, HumanEval, tareas financieras ni ninguna otra metrica. Tampoco se han encontrado evaluaciones independientes en la busqueda web realizada, que no devolvio resultados relacionados con este modelo.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (4,65 mil millones) y del tamano del repositorio (3,4 GB con Q4_K_M). No proceden de mediciones publicadas por el autor.

- Pesos en Q4_K_M: aproximadamente 3 GB. Con cache KV y overhead del runtime, la VRAM necesaria se situa en el entorno de 4 a 6 GB, en funcion de la longitud de contexto configurada.
- Pesos en Q8_0: aproximadamente 5 GB de VRAM, mas cache y overhead.
- Pesos en FP16 (si se reconvirtieran): aproximadamente 9,3 GB de VRAM.
- GPU de consumo compatibles: cualquier GPU con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. Tambien funciona en equipos Apple Silicon con memoria unificada de 8 GB o superior mediante llama.cpp con backend Metal.
- GPU de centro de datos: A100, H100, L40S o similares no son necesarias para este tamano, aunque pueden usarse para servir muchas instancias concurrentes.
- Inferencia en CPU: viable con llama.cpp y modelos cuantizados a 4 bits. El rendimiento depende del numero de nucleos y del ancho de banda de memoria; no hay mediciones publicadas para este modelo concreto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante el Modelfile incluido, y cualquier frontend compatible con GGUF como LM Studio, Jan o text-generation-webui. vLLM y TGI no son la via natural para pesos GGUF; para usarlos habria que partir de los pesos originales en safetensors, no incluidos en este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos de rendimiento de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus respectivas model cards publicas y pueden cambiar con el tiempo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| gemma4-finance-e2b-1k-gguf | 4,65 mil millones | No disponible | No disponible | GGUF Q4_K_M en Hugging Face | No disponible |
| Gemma 2 2B | 2,6 mil millones | 8.192 tokens | Licencia Gemma | Safetensors y GGUF | No comparable directamente por diferencia de tamano |
| Qwen2.5 3B instruct | 3,09 mil millones | 32.768 tokens | Apache 2.0 | Safetensors y GGUF | No comparable directamente |
| Llama 3.2 3B instruct | 3,21 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Safetensors y GGUF | No comparable directamente |
| Phi-3.5-mini instruct | 3,8 mil millones | 128.000 tokens | MIT | Safetensors y GGUF | No comparable directamente |

Nota: para el modelo objeto de esta ficha se desconoce la licencia, lo que impide valorar su aptitud para uso comercial en comparacion con alternativas de licencia permisiva como Qwen2.5 3B (Apache 2.0) o Phi-3.5-mini (MIT).

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no detalla dataset, hiperparametros, proceso de alineacion ni evaluacion. No es posible reproducir el ajuste ni auditar su comportamiento.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. En la Union Europea, la ausencia de licencia implica que no se ceden derechos de explotacion, por lo que su uso en produccion es juridicamente arriesgado hasta que el autor lo aclare. Debe verificarse tambien si el modelo base impone condiciones adicionales.
- Riesgo elevado de alucinacion en dominio financiero: un ajuste fino sobre un volumen de datos presumiblemente reducido no garantiza precision en cifras, normativa, tipos de interes ni datos de mercado. No debe usarse para asesoramiento financiero, decision de credito ni calculo de obligaciones fiscales sin verificacion humana.
- Sesgos: no evaluados ni documentados. Los sesgos del modelo base y del dataset de ajuste, incluidos los derivados de un posible sesgo de idioma o de mercado, se desconocen.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto real y los idiomas soportados. El identificador y la model card estan en ingles, y no hay evidencia de soporte de calidad en castellano.
- Multimodalidad no confirmada: la referencia a `llama-mtmd-cli` en la model card parece una plantilla generica de Unsloth. No hay evidencia de que existan pesos de vision en el repositorio.
- Rendimiento no validado: 0 descargas y 0 likes en el momento de la consulta. No hay usuarios que hayan reportado comportamiento real, lo que impide estimar fiabilidad o estabilidad.
- Adecuacion como modelo base para RAG: dado el tamano y la falta de evaluacion, conviene usarlo como generador final dentro de un sistema con recuperacion documental y con citas obligatorias, en lugar de como fuente de conocimiento autonoma.
- Advertencia de seguridad: al ser un modelo instructivo pequeno y sin evaluaciones de seguridad publicadas, puede producir contenido inapropiado si se le induce con prompts adversarios. Requiere filtros de entrada y salida si se expone a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gianvitobono98/gemma4-finance-e2b-1k-gguf
- Unsloth (herramienta citada por el autor para el ajuste fino y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime compatible y referenciado en la model card): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue mediante el Modelfile incluido): https://ollama.com
- Paper, blog, repositorio o demo adicionales del autor: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos pertenecen a foros no relacionados.

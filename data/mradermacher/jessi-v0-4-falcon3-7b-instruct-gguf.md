# mradermacher/jessi-v0.4-falcon3-7b-instruct-GGUF

## Resumen

jessi-v0.4-falcon3-7b-instruct-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo neopolita/jessi-v0.4-falcon3-7b-instruct, publicada por mradermacher, un autor conocido en Hugging Face por distribuir versiones cuantizadas de modelos open source para inferencia local. El modelo original es un ajuste fino de Falcon3-7B-Instruct, la familia de modelos de TII (Technology Innovation Institute), orientado a conversacion e instrucciones en ingles.

El modelo base cuenta con 7.455.550.464 parametros (aproximadamente 7,5 mil millones) y esta disenado para tareas de generacion de texto conversacional. Esta publicacion no introduce un modelo nuevo, sino que facilita su despliegue en hardware de consumo mediante 12 variantes de cuantizacion que van desde Q2_K (3,0 GB) hasta f16 (15,0 GB), pasando por opciones intermedias como Q4_K_M (4,7 GB) o Q8_0 (8,0 GB).

La relevancia de esta ficha reside en que permite ejecutar un modelo de 7B en GPUs de consumo y en CPU, con opciones de calidad y velocidad equilibradas. Al estar basado en Falcon3, hereda la licencia falcon-llm-license, que impone condiciones especificas para uso comercial. No se dispone de informacion detallada sobre el proceso de entrenamiento del ajuste fino jessi-v0.4 en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Falcon3-7B-Instruct) |
| Parametros totales | 7.455.550.464 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | falcon-llm-license (other) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Falcon3-7B-Instruct, un transformer decoder-only desarrollado por TII. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el ajuste fino jessi-v0.4. El modelo original esta orientado a instrucciones y conversacion, y esta etiquetado con el pipeline "conversational" en Hugging Face.

Esta publicacion concreta es un trabajo de cuantizacion, no de entrenamiento. mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) sobre los pesos del modelo base en formato Hugging Face, generando los ficheros GGUF. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (jessi-v0.4-falcon3-7b-instruct-i1-GGUF), lo que sugiere que las versiones i1 pueden ofrecer mejor calidad por tamano. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles.
- Razonamiento general y respuesta a preguntas, heredado del ajuste fino sobre Falcon3-7B-Instruct.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo y gestionar dialogos multi-turno sin depender de la nube, usando la cuantizacion Q4_K_M (4,7 GB) para equilibrar calidad y velocidad.
- Prototipado rapido de aplicaciones de chat: con la variante Q8_0 (8,0 GB) se obtiene una calidad cercana al modelo original en f16, adecuada para validar flujos de conversacion antes de pasar a produccion.
- Inferencia en CPU o hardware modesto: las cuantizaciones Q2_K (3,0 GB) y Q3_K_S (3,5 GB) permiten ejecutar el modelo en equipos sin GPU dedicada, utiles para demos y entornos de desarrollo con recursos limitados.
- Fine-tuning ligero o evaluacion comparativa: al ser un ajuste fino de Falcon3-7B, sirve como punto de partida para experimentos de adaptacion a dominios concretos en ingles, comparando el comportamiento del ajuste jessi frente al Falcon3 original.
- Despliegue en edge o entornos aislados: el formato GGUF y el tamano reducido de las cuantizaciones permiten ejecutar el modelo en dispositivos con conectividad limitada o requisitos de privacidad, sin enviar datos a servicios externos.
- Generacion de contenido en ingles para blogs o documentacion tecnica: el modelo puede redactar borradores y resumir textos, aunque requiere revision humana por el riesgo de alucinacion inherente a modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~3,0 GB; Q4_K_M ~4,7 GB; Q6_K ~6,2 GB; Q8_0 ~8,0 GB; f16 ~15,0 GB. Estas cifras corresponden al tamano de los ficheros; la VRAM real necesaria es algo superior por el contexto y los buffers de inferencia.
- GPU recomendadas: para Q8_0 o f16, una RTX 3090/4090 (24 GB) o A100/H100; para Q4_K_M, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones. Q4_K_M (4,7 GB) cabe en GPUs de 8 GB; Q8_0 (8,0 GB) requiere al menos 10-12 GB para operar con contexto comodo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base tambien puede servirse con vLLM o TGI si se usa el formato safetensors original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jessi-v0.4-falcon3-7b-instruct-GGUF | 7,46B | no disponible | falcon-llm-license | GGUF | Ajuste fino conversacional de Falcon3-7B |
| Falcon3-7B-Instruct | ~7,5B | no disponible | falcon-llm-license | safetensors, GGUF | Modelo base original de TII |
| Llama 3.1 8B Instruct | ~8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Alternativa popular de tamano similar, multilingue |
| Mistral 7B Instruct | ~7,2B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa permisiva de tamano similar |

La comparativa se limita a datos publicos generales; no se dispone de resultados de benchmarks del modelo jessi que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un ajuste fino de un modelo entrenado principalmente con datos en ingles, es probable que herede sesgos de esos datos.
- Riesgo de alucinacion: inherente a modelos de 7B; no se han publicado evaluaciones de fidelidad factual para este ajuste.
- Limitaciones de contexto o idioma: el modelo esta etiquetado unicamente para ingles; la longitud de contexto no esta documentada, lo que impide garantizar ventanas largas.
- Restricciones de licencia: la falcon-llm-license no es una licencia permisiva tipo Apache 2.0; el uso comercial esta sujeto a condiciones especificas que deben revisarse antes de desplegar en produccion.
- Caveat de produccion: es un ajuste fino comunitario (neopolita) sin documentacion publica sobre su proceso de entrenamiento, por lo que su robustez y calidad no estan validadas de forma independiente. Se recomienda evaluacion propia antes de usarlo en entornos criticos.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; el autor recomienda Q4_K_S o Q4_K_M para uso general.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jessi-v0.4-falcon3-7b-instruct-GGUF
- Modelo base: https://huggingface.co/neopolita/jessi-v0.4-falcon3-7b-instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/jessi-v0.4-falcon3-7b-instruct-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#jessi-v0.4-falcon3-7b-instruct-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests

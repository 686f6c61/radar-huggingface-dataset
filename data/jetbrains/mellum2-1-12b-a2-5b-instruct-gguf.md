# JetBrains/Mellum2.1-12B-A2.5B-Instruct-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Instruct-GGUF es la distribucion en formato GGUF del modelo Mellum2.1-12B-A2.5B-Instruct desarrollado por JetBrains. Se trata de un modelo de mezcla de expertos (MoE) orientado a tareas de asistencia conversacional e instrucciones, con 12.149.923.072 parametros totales, de los cuales aproximadamente 2.500 millones se activan por token (8 expertos de 64 por token). El modelo base se distribuye bajo licencia Apache 2.0 y esta entrenado principalmente en ingles.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples cuantizaciones listas para ejecutarse con llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF. Ademas, el repositorio incluye la cabeza de prediccion multi-token (MTP), que permite usar decodificacion especulativa en llama.cpp para acelerar la generacion sin alterar la salida.

El modelo esta disenado para responder directamente, sin cadena de pensamiento externalizada, y soporta una longitud de contexto de 131.072 tokens. Esta orientado a desarrolladores que necesitan desplegar un asistente de codigo y conversacion en infraestructura propia, con opciones que van desde 7 GB hasta 24,3 GB segun la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 64 expertos, 8 activados por token |
| Parametros totales | 12.149.923.072 |
| Parametros activos | Aproximadamente 2.500 millones por token (segun nombre A2.5B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, MXFP4_MOE |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

Mellum2.1 Instruct es un modelo de mezcla de expertos con 64 expertos y 8 activados por token, lo que resulta en aproximadamente 2.500 millones de parametros activos sobre un total de 12.149.923.072. La arquitectura es de tipo transformer y esta disenada para responder directamente sin cadena de pensamiento externalizada. El modelo incluye una cabeza de prediccion multi-token (MTP): un bloque transformer adicional con la misma forma de atencion y MoE que una capa del modelo, entrenado conjuntamente con el modelo principal para predecir el token siguiente al recien muestreado.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card remite a la ficha del modelo base para la descripcion completa, los resultados de evaluacion y los detalles de arquitectura. La innovacion tecnica destacable es la cabeza MTP, que llama.cpp utiliza como borrador especulativo (`--spec-type draft-mtp`), verificando el modelo completo cada token propuesto, de modo que la salida no cambia y la generacion se acelera cuando los borradores se aceptan.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles.
- Respuesta directa sin cadena de pensamiento externalizada.
- Generacion de codigo: la model card incluye ejemplos de funciones Python.
- Razonamiento y matematicas: no se detallan capacidades especificas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidad especial: cabeza de prediccion multi-token (MTP) para decodificacion especulativa.
- Compatibilidad con API OpenAI a traves de llama-server.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar funciones y fragmentos de codigo (por ejemplo, una funcion Python para invertir una cadena) ejecutandose con llama.cpp u Ollama, lo que permite integrarlo en el flujo de trabajo del desarrollador sin depender de servicios en la nube.
- Servidor de inferencia con API compatible con OpenAI: mediante `llama-server` se expone un endpoint en `http://localhost:8080/v1` que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI, cambiando solo la URL base.
- Despliegue en hardware de consumo: la cuantizacion MXFP4_MOE (7,0 GB) y Q4_K_M (8,1 GB) permiten ejecutar el modelo en GPUs consumer con 8-12 GB de VRAM, adecuado para prototipado y uso individual.
- Procesamiento de documentos largos: con 131.072 tokens de contexto, el modelo puede manejar conversaciones multi-turno extensas o documentos de gran tamano en una sola ventana, util para resumen y analisis de codigo de repositorios.
- Aceleracion de generacion en produccion: el uso de la cabeza MTP como borrador especulativo en llama.cpp reduce la latencia de generacion cuando los borradores se aceptan, manteniendo la salida identica a la del modelo completo.
- Evaluacion y experimentacion con cuantizaciones: el repositorio ofrece metricas de divergencia KL y coincidencia de token superior frente a BF16 en Wikitext-2, lo que permite elegir la cuantizacion segun el equilibrio calidad/tamano requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card remite a la ficha del modelo base para los resultados de evaluacion.

La informacion disponible incluye metricas de fidelidad de cuantizacion frente a BF16, medidas sobre Wikitext-2 con `n_ctx=512`:

| Cuantizacion | Tamano | KLD vs BF16 | Coincidencia token superior |
|---|---|---|---|
| BF16 | 24,3 GB | referencia | referencia |
| Q8_0 | 12,9 GB | 0,010 | 96,2% |
| Q6_K | 10,9 GB | 0,022 | 94,3% |
| Q4_K_M | 8,1 GB | 0,100 | 87,4% |
| MXFP4_MOE | 7,0 GB | 0,166 | 84,3% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,0 GB (MXFP4_MOE), 8,1 GB (Q4_K_M), 10,9 GB (Q6_K), 12,9 GB (Q8_0) y 24,3 GB (BF16), sin contar el espacio adicional para el contexto KV cache.
- La cabeza MTP anade 1,8 GB si se descarga como archivo separado; los archivos combinados ocupan 7,3 GB (MXFP4_MOE), 8,4 GB (Q4_K_M), 11,3 GB (Q6_K), 13,4 GB (Q8_0) y 25,2 GB (BF16).
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible. Por tamano, las cuantizaciones de 7-8 GB caben en GPUs consumer con 8-12 GB de VRAM; las de 11-13 GB requieren GPUs con 16 GB o mas; BF16 requiere 24 GB o mas.
- Cabe en GPU consumer: si, con las cuantizaciones MXFP4_MOE y Q4_K_M en GPUs de 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio y otros runtimes compatibles con GGUF. La API expuesta es compatible con OpenAI.
- Latencia y throughput estimados: no disponibles. La decodificacion especulativa con la cabeza MTP puede acelerar la generacion cuando los borradores se aceptan, pero no se proporcionan cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoria. La model card remite a la ficha del modelo base para los resultados de evaluacion, pero no se incluyen en el material disponible. Por tanto, la comparativa con alternativas se indica como no disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta documentado.
- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: no se documenta una evaluacion especifica; como modelo generativo, el riesgo existe y debe mitigarse en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de la licencia en la ficha del modelo base.
- Calidad de cuantizacion: las cuantizaciones de menor tamano (MXFP4_MOE, Q4_K_M) presentan divergencia KL y menor coincidencia de token superior frente a BF16, lo que puede afectar a tareas sensibles a la precision.
- Contexto: aunque se soportan 131.072 tokens, el uso de contextos muy largos incrementa el consumo de memoria del KV cache y puede reducir el throughput.
- Respuesta directa sin cadena de pensamiento: el modelo no externaliza razonamiento paso a paso, lo que puede limitar tareas que requieran descomposicion explicita.
- Tool calling y agentes: no se documenta soporte en la informacion disponible; debe validarse antes de usarlo en pipelines de agentes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- JetBrains: https://www.jetbrains.com/

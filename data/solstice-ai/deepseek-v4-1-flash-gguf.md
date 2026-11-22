# Solstice-AI/DeepSeek-V4.1-Flash-GGUF

## Resumen

DeepSeek-V4.1-Flash es un modelo de lenguaje causal de tipo decoder-only desarrollado por DeepSeek, con 748.494.684.784 parametros totales (aproximadamente 748,5 mil millones). Esta ficha cubre la version cuantizada en formato GGUF publicada por Solstice-AI, empaquetada por Victor Cruz (vcruz305) para su uso con llama.cpp. El modelo base emplea una arquitectura denominada `DeepseekV41ForCausalLM` que incorpora tablas de busqueda de n-gramas (engram), hyper-connections y atencion dispersa (sparse attention), ademas de una estructura de mezcla de expertos (MoE) segun se deduce de la mencion a "routed experts".

La relevancia de esta publicacion es doble. Por un lado, ofrece acceso al modelo en cuantizaciones de 2 y 3 bits (Q2_K y Q3_K_M) que reducen el peso a 246,3 GiB y 323,4 GiB respectivamente, permitiendo su despliegue en hardware que de otro modo no podria alojar los pesos completos. Por otro, es una de las primeras conversiones a GGUF de esta arquitectura, con el trabajo de conversion abierto en el repositorio upstream de llama.cpp.

Es importante destacar que, segun la model card, los archivos aun no se ejecutan en la version upstream de llama.cpp: el runtime esta en desarrollo en una rama especifica (`runtime/deepseek41`) y la atencion dispersa es la pieza pendiente. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV41ForCausalLM (decoder causal con engram n-gram lookup tables, hyper-connections, sparse attention y routed experts tipo MoE) |
| Parametros totales | 748.494.684.784 (aprox. 748,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M (Q4_K_M pendiente; Q5_K_M omitida por bajo valor respecto a Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivos divididos en partes por limite del Hub; pesos base en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal con varias innovaciones estructurales. Incorpora tablas de busqueda de n-gramas denominadas engram, que constituyen la mayor parte del peso del archivo: aproximadamente 196,6B parametros entre las dos tablas, con tamanos por tabla que oscilan entre 99.611 y 40.284 MiB segun la cuantizacion (de q8_0 a q3_K). Ademas, emplea hyper-connections y atencion dispersa, y una estructura de mezcla de expertos cuyos expertos enrutados llegan en formato MXFP4 a 4,25 bits por peso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card tampoco detalla la innovacion de decodificacion especulativa ni otros detalles del proceso de entrenamiento. La cadena de arquitectura en GGUF es `deepseek41`, siguiendo la convencion de llama.cpp de eliminar el `_v` (por ejemplo, `deepseek_v2` se convirtio en `deepseek2`). Se ha corregido un error en las claves KV de Engram (`head_count`, `key_length`, `max_ngram_size`, `layer_ids`) que estaban escritas con un prefijo `deepseek4.engram.*` en lugar de `deepseek41.engram.*`; la correccion se aplico solo a metadatos, verificando que los datos tensoriales permanecian identicos por SHA-256.

## Capacidades

- Generacion de texto conversacional y causal, segun el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y procesamiento de lenguaje natural de proposito general, propio de un modelo de gran escala.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en arquitecturas emergentes: el modelo permite estudiar en la practica mecanismos como las tablas engram de n-gramas, las hyper-connections y la atencion dispersa, comparando el comportamiento con implementaciones de referencia gracias a que el loader y las tablas engram ya estan verificados contra la implementacion de referencia.
- Despliegue en hardware con memoria limitada: las cuantizaciones Q2_K (246,3 GiB) y Q3_K_M (323,4 GiB) permiten alojar un modelo de 748,5B parametros en nodos con menos de 400 GiB de memoria, algo inviable con los pesos completos.
- Evaluacion de calidad por cuantizacion: la escalera de cuantizaciones permite medir la degradacion de calidad entre Q2_K, Q3_K_M y Q4_K_M en tareas de generacion, util para decidir el compromiso entre tamano y fidelidad.
- Desarrollo de tooling para llama.cpp: al ser una conversion temprana con PR abierto en upstream, sirve como banco de pruebas para desarrolladores que implementen o depuren el soporte de la arquitectura `deepseek41`.
- Generacion de texto conversacional en entornos con licencia permisiva: la licencia MIT facilita su integracion en productos comerciales sin las restricciones de licencias mas limitantes.
- Experimentacion con modelos MoE de gran escala: la estructura de expertos enrutados en MXFP4 permite investigar el comportamiento de la mezcla de expertos bajo cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: Q2_K ocupa 246,3 GiB de payload tensorial (264.514.761.248 bytes); Q3_K_M ocupa 323,4 GiB (347.270.954.112 bytes). Q4_K_M esta pendiente de medicion. A estas cifras hay que anadir la sobrecarga del runtime y el contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. El repositorio de recetas del empaquetador esta orientado a DGX Spark, lo que sugiere despliegue en ese tipo de nodo.
- Cabe en GPU de consumo: no. Incluso la cuantizacion mas baja supera ampliamente la memoria de cualquier GPU consumer actual; requiere multiples aceleradores o sistemas con memoria unificada de gran capacidad.
- Opciones de despliegue: llama.cpp (rama `runtime/deepseek41` de vcruz305; aun no funciona en upstream). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (esta ficha) | 748,5B | no disponible | Q2_K, Q3_K_M, Q4_K_M (pendiente) | MIT | GGUF en HF; runtime en desarrollo |
| DeepSeek-V4.1-Flash (original) | 748,5B | no disponible | safetensors | MIT | HF (deepseek-ai) |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | no disponible | mencionado como modelo distinto |

No se dispone de datos de rendimiento ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los archivos GGUF no se ejecutan todavia en la version upstream de llama.cpp; requieren la rama `runtime/deepseek41` y la atencion dispersa sigue pendiente de implementacion.
- Las conversiones anteriores al 2026-09-10 llevan `general.architecture = deepseek4` y estan siendo rehacidas como `deepseek41`; verificar la version del archivo antes de usarlo.
- Q4_K_M figura como pendiente, por lo que la escalera de cuantizaciones esta incompleta.
- Q5_K_M se omite deliberadamente porque los expertos enrutados ya llegan en MXFP4 a 4,25 bpw y una cuantizacion mayor tendria poco valor frente a Q8_0.
- El modelo base es de 748,5B parametros: los requisitos de memoria son muy elevados incluso en las cuantizaciones mas bajas.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica.
- La licencia MIT es permisiva para uso comercial, pero conviene verificar las condiciones del modelo base original de DeepSeek.
- La cuantizacion a 2 y 3 bits puede degradar la calidad de forma significativa; no se han publicado evaluaciones que lo cuantifiquen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Solstice-AI/DeepSeek-V4.1-Flash-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Receta de despliegue (DGX Spark): https://github.com/vcruz305/DeepSeek-V4.1-Flash-GGUF-DGX-Spark-recipe
- PR de conversion en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28696
- Rama de runtime: https://github.com/vcruz305/llama.cpp (rama `runtime/deepseek41`)

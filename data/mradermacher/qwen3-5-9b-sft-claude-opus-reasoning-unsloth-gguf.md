# mradermacher/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF es una distribucion de pesos en formato GGUF del modelo ermiaazarkhalili/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth, publicada por mradermacher. Se trata de un fine-tuning por supervised fine-tuning (SFT) sobre una base Qwen3.5 de 9B parametros, entrenado con LoRA mediante Unsloth y TRL, cuyo objetivo es destilar capacidades de razonamiento al estilo de Claude Opus a partir del dataset ermiaazarkhalili/claude-reasoning-distillation. El resultado es un modelo conversacional orientado a tareas de razonamiento explicito en ingles.

El modelo cuenta con 8.953.803.264 parametros totales (aproximadamente 8,95B) y se distribuye bajo licencia Apache 2.0. La relevancia de esta ficha radica en que ofrece una via practica de ejecutar localmente un modelo de razonamiento de ~9B en hardware de consumo, gracias a la bateria de cuantizaciones GGUF proporcionada (desde Q2_K de 3,9 GB hasta f16 de 18,0 GB). El repositorio ocupa 81,4 GB e incluye tanto cuantizaciones estaticas como, en un repositorio separado, cuantizaciones ponderadas/imatrix.

Es importante subrayar que esta publicacion es unicamente una conversion de formato: el autor no ha entrenado el modelo, sino que ha generado los ficheros GGUF a partir del modelo base original. La informacion disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es escasa, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas cuantizaciones i1 (imatrix) en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tambien existen pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5, un transformer decoder-only, si bien la informacion proporcionada no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto. El proceso de especializacion consistio en un supervised fine-tuning (SFT) con LoRA sobre el modelo base, utilizando las librerias Unsloth y TRL, segun las etiquetas del repositorio. El dataset empleado es ermiaazarkhalili/claude-reasoning-distillation, que presumiblemente contiene trazas de razonamiento generadas por Claude Opus y destiladas en el modelo pequeno.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La contribucion de esta publicacion concreta es la conversion a GGUF con cuantizacion estatica (quantize_version 2, output_tensor_quantised 1), lo que permite su uso en llama.cpp y ecosistemas compatibles.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en respuestas que incluyen razonamiento explicito (estilo cadena de pensamiento), derivado del dataset de destilacion de Claude Opus.
- Razonamiento multi-paso orientado a problemas que requieren descomposicion logica, segun el proposito declarado del fine-tuning.
- Conversacion multi-turno: el repositorio esta etiquetado como "conversational".
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Vision, audio u otras modalidades: no disponible; no se declaran.

## Casos de uso

- Razonamiento asistido en local: desplegar la cuantizacion Q4_K_M (5,7 GB) en una estacion de trabajo con GPU de consumo para resolver problemas de logica y matematicas paso a paso, aprovechando el entrenamiento en trazas de razonamiento.
- Prototipado de asistentes conversacionales en ingles: usar el modelo con llama.cpp u Ollama para validar flujos de chat multi-turno antes de migrar a un modelo mayor en produccion.
- Educacion y tutoria automatizada: generar explicaciones razonadas de problemas, ya que el SFT sobre datos de razonamiento favorece respuestas con justificacion intermedia.
- Investigacion sobre destilacion de razonamiento: servir como punto de comparacion entre un modelo de 9B afinado con datos de Claude Opus y su base Qwen3.5 sin afinar, para estudiar la transferencia de capacidades.
- Evaluacion de cuantizaciones: el amplio abanico de quants (de Q2_K a f16) permite medir la degradacion de calidad en tareas de razonamiento segun el nivel de compresion.
- Despliegue en entornos con recursos limitados: la variante Q2_K (3,9 GB) o IQ4_XS (5,3 GB) posibilita ejecutar el modelo en equipos sin GPU dedicada o con VRAM reducida, para tareas de generacion de texto no criticas.
- Generacion de datos sinteticos de razonamiento: emplear el modelo para producir trazas de pensamiento que alimenten posteriores procesos de destilacion o evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, pesos mas overhead de contexto): Q2_K ~4-5 GB; Q4_K_M ~6-7 GB; Q6_K ~8-9 GB; Q8_0 ~10-11 GB; f16 ~18-20 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 y f16 con contexto amplio; A100/H100 solo necesarias para despliegues concurrentes de alta throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; Q4_K_M es viable en GPUs de 8 GB con contexto moderado y en 12 GB con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta publicacion concreta es GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth (GGUF) | ~8,95B | no disponible | Apache 2.0 | GGUF | Fine-tuning SFT con datos de razonamiento de Claude Opus |
| Modelo base ermiaazarkhalili/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth | ~8,95B | no disponible | Apache 2.0 | safetensors | Mismos pesos sin cuantizar; requiere transformers |
| Qwen3.5-9B (base original) | ~9B | no disponible | no disponible | safetensors | Sin el SFT de razonamiento; referencia de partida |
| Otros GGUF de ~9B de la familia Qwen | ~9B | no disponible | variable | GGUF | Alternativas de tamano comparable; rendimiento no comparable sin benchmarks |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de ~9B y acentuado por el estilo de razonamiento destilado, que puede producir cadenas de pensamiento plausibles pero incorrectas.
- El SFT sobre trazas de un modelo propietario (Claude Opus) puede introducir sesgos y estilos de respuesta heredados del dataset de destilacion, cuya composicion no se documenta.
- No hay informacion sobre la longitud de contexto efectiva; no asumir ventanas largas sin verificacion empirica.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.5 y del dataset de destilacion antes de un uso comercial, ya que podrian imponer restricciones adicionales.
- Esta publicacion es una conversion de formato; posibles defectos de calidad provienen del modelo base o del proceso de cuantizacion, no del autor del GGUF.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente tareas de razonamiento; para produccion se recomienda Q4_K_M o superior.
- No se documentan resultados de evaluacion, por lo que no debe asumirse que supera a su modelo base sin pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Modelo base (safetensors): https://huggingface.co/ermiaazarkhalili/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-i1-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/ermiaazarkhalili/claude-reasoning-distillation
- Pagina de vista general del autor: https://hf.tst.eu/model#Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

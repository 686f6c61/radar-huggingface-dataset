# ajujohn8/gemma-e4b-interview-orch-dpo

## Resumen

`ajujohn8/gemma-e4b-interview-orch-dpo` es un ajuste fino (fine-tuning) del modelo `ajujohn8/gemma-e4b-interview-orch-sft-aug`, que a su vez deriva de la familia Gemma 4 (etiqueta `gemma4` en el repositorio). Lo desarrolla el usuario ajujohn8 y está publicado en Hugging Face con licencia Apache 2.0. El modelo está orientado a la conversación multimodal imagen-texto (pipeline `image-text-to-text`) y su nombre sugiere un entrenamiento en dos fases: primero un SFT (supervised fine-tuning) aumentado y después un DPO (Direct Preference Optimization) sobre datos de entrevistas ("interview-orch").

El repositorio contiene 7.996.156.490 parámetros reales en formato safetensors (aproximadamente 8 mil millones), lo que lo sitúa en la gama de modelos medianos que pueden ejecutarse en GPUs de consumo con cuantización. El tamaño del repositorio es de 16 GB, coherente con pesos en precisión de 16 bits. Se entrenó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste fino con 32 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Es útil como referencia para quien quiera reproducir un pipeline SFT + DPO sobre Gemma 4 con Unsloth, pero no como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, segun tag `gemma4`); detalles internos no disponibles |
| Parametros totales | 7.996.156.490 (aproximadamente 8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `gemma4` y el pipeline `image-text-to-text`, lo que indica un transformer multimodal con codificador de vision y decodificador de lenguaje. El numero de parametros (7.996.156.490) corresponde a un modelo de aproximadamente 8B, coherente con una variante "E4B" de Gemma 4. No se especifican dimensiones de capas, numero de cabezas de atencion, vocabulario ni mecanismos de atencion concretos.

El entrenamiento se realizo en dos etapas segun la cadena de modelos base: un SFT sobre `gemma-e4b-interview-orch-sft-aug` y posteriormente un DPO que da lugar a este repositorio. La model card indica que se uso Unsloth junto con TRL de Hugging Face, lo que sugiere tecnicas de entrenamiento eficiente en memoria (LoRA/QLoRA o similar, aunque no se confirma explicitamente). No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni los hiperparametros del DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con ajuste especifico hacia dominios de entrevista ("interview-orch").
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), segun el pipeline declarado.
- Alineacion mediante DPO, orientada a preferencias humanas en el dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, vision o audio especial: no disponible salvo la entrada de imagen implicita en el pipeline.

## Casos de uso

- Prototipado de asistentes de entrevista: el ajuste DPO sobre datos de entrevistas permite generar respuestas conversacionales mas alineadas en ese dominio concreto; util para experimentar con simuladores de entrevista tecnica.
- Investigacion en alineacion SFT + DPO: sirve como caso de estudio reproducible de un pipeline de dos fases con Unsloth y TRL sobre un modelo de 8B.
- Generacion de descripciones imagen-texto en ingles: al ser un modelo `image-text-to-text`, puede emplearse para tareas basicas de captioning o VQA en prototipos, siempre que se valide su calidad.
- Base para nuevos ajustes finos: al estar en safetensors y con licencia Apache 2.0, puede reutilizarse como punto de partida para fine-tuning adicional en dominios especificos.
- Evaluacion comparativa de tecnicas de alineacion: util en entornos academicos para medir el efecto del DPO frente al SFT previo en tareas conversacionales.
- Chatbot experimental de bajo volumen: con 8B parametros puede desplegarse en una GPU de consumo con cuantizacion para demos internas, no para produccion critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16 (8B parametros x 2 bytes), alrededor de 8-10 GB en cuantizacion de 8 bits y 5-6 GB en cuantizacion de 4 bits, sin contar el overhead del codificador de vision ni la cache KV.
- GPUs recomendadas: A100 40GB, H100, L40S para inferencia en precision completa; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super con cuantizacion de 4-8 bits; en GPUs de 8 GB solo con cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se distribuye GGUF oficial).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Benchmarks publicados |
|---|---|---|---|---|---|
| ajujohn8/gemma-e4b-interview-orch-dpo | ~8B | no disponible | Apache 2.0 | si (image-text-to-text) | no |
| Gemma 3 4B (Google) | ~4B | 128K (segun documentacion publica de Gemma 3) | Gemma Terms | si | si |
| Qwen2.5-VL 7B | ~7B | 128K (segun documentacion publica) | Apache 2.0 | si | si |
| Llama 3.1 8B | ~8B | 128K | Llama 3.1 Community License | no | si |

Nota: los datos de los modelos comparativos corresponden a documentacion publica de sus respectivos autores; el modelo de ajujohn8 no publica contexto ni benchmarks, por lo que la comparacion es estructural, no de rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks, evaluaciones de sesgo ni analisis de alucinacion; el riesgo de alucinacion es desconocido y debe asumirse alto en dominios no cubiertos por el ajuste.
- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado.
- La longitud de contexto no esta documentada, lo que impide planificar cargas con entradas largas.
- El ajuste DPO sobre datos de entrevistas puede producir respuestas excesivamente especializadas o desalineadas fuera de ese dominio.
- Aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede estar sujeto a los terminos de uso de Google; conviene verificar la cadena de licencias antes de un uso comercial.
- Con 32 descargas y 0 likes, no hay evidencia de uso en produccion ni validacion por terceros; no se recomienda para sistemas criticos sin evaluacion propia.
- El repositorio no incluye GGUF ni cuantizaciones oficiales; habria que generarlas con herramientas externas.

## Enlaces

- Hugging Face: https://huggingface.co/ajujohn8/gemma-e4b-interview-orch-dpo
- Modelo base (SFT): https://huggingface.co/ajujohn8/gemma-e4b-interview-orch-sft-aug
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl

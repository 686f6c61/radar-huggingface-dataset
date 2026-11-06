# mradermacher/PMLLM-Qwen3-VL-8B-GRPO-GGUF

## Resumen

PMLLM-Qwen3-VL-8B-GRPO-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Yeongtak/PMLLM-Qwen3-VL-8B-GRPO, publicada por el usuario mradermacher. El modelo original parte de la familia Qwen3-VL de Alibaba (arquitectura vision-lenguaje de 8.190.735.360 parametros) y ha sido ajustado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo orientada a mejorar el razonamiento. Este repositorio no introduce cambios en los pesos mas alla de la cuantizacion: es una conversion estatica a GGUF para facilitar su ejecucion en entornos con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 8B con capacidades de razonamiento reforzado en hardware de consumo, algo que el checkpoint original en transformers no facilita. El repositorio incluye tanto los pesos del lenguaje en distintos niveles de cuantizacion (de Q2_K a f16) como los ficheros `mmproj` necesarios para el procesamiento de imagen.

La informacion publicada por el autor es muy escasa: no se detalla la licencia, no hay benchmarks, no se especifica la longitud de contexto ni los datos de entrenamiento del modelo base. Esta ficha refleja unicamente lo verificable en la model card y en los metadatos de Hugging Face, marcando explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen3-VL, vision-lenguaje; ajuste GRPO) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen3-VL es multilingue, pero no se documenta en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como libreria declarada; repo de 75,3 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Yeongtak/PMLLM-Qwen3-VL-8B-GRPO, un ajuste sobre Qwen3-VL de 8B. La nomenclatura indica dos componentes: por un lado, la arquitectura Qwen3-VL, que es un transformer multimodal con codificador visual y modelo de lenguaje; por otro, el sufijo GRPO, que corresponde a Group Relative Policy Optimization, un algoritmo de aprendizaje por refuerzo sin modelo critico que optimiza la politica comparando respuestas dentro de un grupo de muestras. Este tipo de ajuste se emplea habitualmente para mejorar el razonamiento en dominios especificos (matematicas, codigo, logica).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO adicional ni las innovaciones tecnicas del checkpoint original. El repositorio de mradermacher es una conversion estatica (`quantize_version: 2`, `convert_type: hf`) sin cuantizacion ponderada ni imatrix, segun indica el propio autor. Se incluyen ficheros `mmproj` (multi-modal projection) en Q8_0 y f16 para habilitar la entrada de imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational`).
- Procesamiento de imagenes: el repositorio incluye ficheros `mmproj` en Q8_0 (0,9 GB) y f16 (1,3 GB), lo que confirma soporte vision-lenguaje.
- Razonamiento reforzado mediante GRPO en el modelo base, orientado presumiblemente a tareas de logica y matematicas (no documentado explicitamente).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: los metadatos solo declaran `en`; el modelo base Qwen3-VL soporta mas idiomas, pero esta ficha no puede confirmarlo para este ajuste.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo vision-lenguaje en equipos de consumo: con la cuantizacion Q4_K_M (5,1 GB) mas el mmproj Q8_0 (0,9 GB), el modelo cabe en GPUs con 8 GB de VRAM, lo que permite desplegar captioning de imagenes, VQA o extraccion de informacion de documentos sin infraestructura en la nube.
- Procesamiento de documentos escaneados: la combinacion de vision y lenguaje permite extraer texto estructurado, tablas o campos de formularios a partir de imagenes, con la ventaja de poder ejecutarse en local por motivos de privacidad.
- Asistente de razonamiento en ingles para prototipos: el ajuste GRPO esta pensado para tareas que requieren cadenas de razonamiento; puede usarse como backend en aplicaciones de resolucion de problemas paso a paso.
- Evaluacion de tecnicas de RL: investigadores que quieran comparar el comportamiento de un modelo Qwen3-VL ajustado con GRPO frente al modelo base pueden usar estas cuantizaciones para iterar rapidamente en local.
- Despliegue en pipelines de CI/CD para pruebas de regresion de modelos multimodales: al ser GGUF, se integra con llama.cpp y permite ejecutar tests automatizados de calidad sobre imagenes de referencia sin depender de GPUs de datacenter.
- Chat multimodal en entornos air-gapped: al no requerir conexion a APIs externas, encaja en organizaciones con restricciones de red que necesiten un asistente capaz de interpretar capturas de pantalla o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,4 GB
  - Q3_K_M: ~4,2 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_M: ~5,1 GB (recomendado por el autor como "fast, recommended")
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- Sumar el fichero `mmproj` si se usa entrada de imagen: +0,9 GB (Q8_0) o +1,3 GB (f16).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB o RTX 4070 de 12 GB puede ejecutar Q6_K o Q8_0 con mmproj; una RTX 4090 de 24 GB permite f16 sin problemas. Para despliegue en servidor, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con cuantizaciones Q4 o inferiores (sin margen amplio para contexto largo).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| PMLLM-Qwen3-VL-8B-GRPO-GGUF (este) | 8,19B | no disponible | Si (mmproj) | no disponible | GGUF |
| Qwen3-VL-8B (modelo base de referencia) | ~8B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors / GGUF |
| Yeongtak/PMLLM-Qwen3-VL-8B-GRPO (original) | 8,19B | no disponible | Si | no disponible | safetensors |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base Yeongtak/PMLLM-Qwen3-VL-8B-GRPO y, en ultima instancia, la de Qwen3-VL.
- Los metadatos solo declaran ingles (`en`); el rendimiento en castellano no esta verificado y podria degradarse respecto al modelo base Qwen3-VL.
- Al ser una cuantizacion estatica sin imatrix, las cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad, especialmente en tareas de razonamiento donde el ajuste GRPO es sensible.
- No hay benchmarks publicados: no es posible verificar que el ajuste GRPO mejore al modelo base en tareas concretas.
- El repositorio tiene 75,3 GB, lo que incluye todas las cuantizaciones; conviene descargar solo el fichero necesario.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8B, agravado en tareas de OCR o interpretacion de imagenes complejas.
- El autor advierte que no planea publicar cuantizaciones ponderadas/imatrix salvo peticion explicita en la seccion de discusiones.
- Fecha de actualizacion del repositorio (2026-11-03) posterior a la de creacion (2025-11-14), sin changelog disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PMLLM-Qwen3-VL-8B-GRPO-GGUF
- Modelo base: https://huggingface.co/Yeongtak/PMLLM-Qwen3-VL-8B-GRPO
- Pagina de resumen del autor: https://hf.tst.eu/model#PMLLM-Qwen3-VL-8B-GRPO-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/DeepSeek-R1-0528-Qwen3-8B-GGUF

## Resumen

DeepSeek-R1-0528-Qwen3-8B-GGUF es la distribucion en formato GGUF del modelo DeepSeek-R1-0528-Qwen3-8B, un modelo de lenguaje de 8.190.735.360 parametros derivado del modelo base deepseek-ai/DeepSeek-R1-0528-Qwen3-8B. La cuantizacion ha sido realizada por el usuario mradermacher, conocido en el ecosistema por publicar versiones GGUF de modelos populares para su uso con llama.cpp y herramientas compatibles. El modelo original combina el linaje de la familia Qwen3 con el proceso de razonamiento destilado de la serie DeepSeek-R1 (version 0528).

El interes de esta publicacion radica en que permite ejecutar localmente un modelo de 8B con capacidades de razonamiento explicito (cadena de pensamiento) en hardware de consumo, gracias a las cuantizaciones que van desde Q2_K (3,4 GB) hasta f16 (16,5 GB). El repositorio incluye 12 variantes de cuantizacion estaticas, lo que facilita el despliegue en escenarios con restricciones de VRAM o RAM.

La licencia MIT del modelo base y de la cuantizacion permite uso comercial sin restricciones adicionales, lo que lo convierte en una opcion atractiva para integraciones en producto. El modelo esta etiquetado como conversacional y orientado a ingles, aunque al derivar de Qwen3 conserva capacidades multilingues del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, con destilacion de razonamiento DeepSeek-R1-0528) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun model card); el modelo base Qwen3 soporta multiples idiomas, pero no se detalla en la informacion disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es DeepSeek-R1-0528-Qwen3-8B, una destilacion de las capacidades de razonamiento de DeepSeek-R1-0528 sobre la arquitectura Qwen3-8B. Se trata de un transformer decoder-only de 8.190 millones de parametros, sin mezcla de expertos, entrenado para generar cadenas de pensamiento antes de la respuesta final. La version 0528 hace referencia a una iteracion de la familia R1 con mejoras en el proceso de razonamiento.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF realizada por mradermacher es de tipo estatico (quantize_version: 2, output_tensor_quantised: 1), sin usar imatrix en este repositorio; las versiones con imatrix estan disponibles en un repositorio separado (sufijo -i1-GGUF).

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos.
- Razonamiento explicito mediante cadena de pensamiento (heredado de DeepSeek-R1-0528), adecuado para problemas de logica y matematicas.
- Generacion de codigo y asistencia en tareas de programacion (capacidad heredada de Qwen3).
- Capacidades multilingues del modelo base Qwen3, aunque la model card solo declara ingles.
- Compatible con endpoints y herramientas que consumen GGUF (llama.cpp, Ollama, etc.).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo de razonamiento lo hace plausible.
- Capacidades de vision o audio: no disponibles en este modelo.

## Casos de uso

- Razonamiento local en estaciones de trabajo sin GPU dedicada: con la cuantizacion Q4_K_M (5,1 GB) el modelo puede ejecutarse en CPU con llama.cpp, permitiendo resolver problemas de logica y matematicas sin conexion a la nube.
- Asistente de codigo en el editor: las cuantizaciones Q5_K_M o Q6_K (6,0-6,8 GB) caben en GPUs de consumo como la RTX 4060 Ti de 16 GB, ofreciendo autocompletado y explicacion de codigo con razonamiento paso a paso.
- Prototipado rapido de agentes conversacionales: al ser compatible con endpoints y con licencia MIT, se puede integrar en pipelines de desarrollo sin coste de licencia ni dependencia de API externa.
- Educacion y tutoria automatizada: el modo de razonamiento permite mostrar al estudiante el proceso de resolucion de un problema, no solo la respuesta final.
- Analisis de documentos y resumenes con contexto moderado: util para procesar informes o articulos en local, siempre que la longitud del texto quepa en la ventana de contexto (no confirmada en la informacion disponible).
- Despliegue en entornos con requisitos de privacidad: al ejecutarse completamente en local (GGUF), los datos no salen del dispositivo, lo que lo hace apto para sectores regulados.
- Fine-tuning ligero o experimentacion academica: al ser un modelo de 8B con licencia permisiva, sirve como base para investigacion sobre destilacion de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto):
  - Q2_K: ~3,4 GB de pesos; cabe en GPUs de 6-8 GB.
  - Q3_K_M: ~4,2 GB; cabe en GPUs de 8 GB.
  - Q4_K_M: ~5,1 GB; recomendado para GPUs de 8 GB con contexto moderado.
  - Q5_K_M: ~6,0 GB; requiere 8-12 GB.
  - Q6_K: ~6,8 GB; requiere 12 GB o mas.
  - Q8_0: ~8,8 GB; requiere 12-16 GB.
  - f16: ~16,5 GB; requiere 24 GB (RTX 3090/4090) o A100/H100.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100. Para cuantizaciones bajas basta una GTX 1660 de 6 GB.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones (Q4_K_M en 8 GB, Q6_K en 12 GB, Q8_0 en 16 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI, transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-0528-Qwen3-8B (este, GGUF) | 8,19B | no disponible | MIT | GGUF | Razonamiento destilado de R1-0528 sobre Qwen3-8B |
| Qwen3-8B (original) | ~8B | no disponible | Apache 2.0 (segun Qwen3) | safetensors/GGUF | Base sin destilacion de razonamiento R1 |
| DeepSeek-R1-Distill-Llama-8B | ~8B | no disponible | MIT | safetensors/GGUF | Destilacion equivalente sobre Llama-3.1-8B |
| Llama-3.1-8B-Instruct | ~8B | 128K (segun Llama 3.1) | Llama 3.1 Community License | safetensors/GGUF | Alternativa generalista sin modo de razonamiento explicito |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3 y DeepSeek-R1, es previsible que herede sesgos de sus datasets de entrenamiento.
- Riesgo de alucinacion: presente como en cualquier LLM; el modo de razonamiento puede aumentar la longitud de la respuesta y, con ello, la superficie de error.
- Limitaciones de contexto o idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado. La longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones adicionales; no obstante, conviene verificar la licencia del modelo base original (deepseek-ai/DeepSeek-R1-0528-Qwen3-8B) por si hubiera terminos adicionales no reflejados aqui.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion. Las cuantizaciones con imatrix (repositorio -i1-GGUF) suelen ofrecer mejor calidad por tamano.
- El repositorio ocupa 73,4 GB en total; descargar solo la variante necesaria.
- Modelo con solo 231 descargas y 1 like en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepSeek-R1-0528-Qwen3-8B-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepSeek-R1-0528-Qwen3-8B-i1-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-R1-0528-Qwen3-8B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/Mahou-1.5-Qwen2.5-32B-GGUF

## Resumen

Mahou-1.5-Qwen2.5-32B-GGUF es la distribucion en formato GGUF del modelo Mahou-1.5-Qwen2.5-32B, un fine-tuning de Qwen2.5-32B desarrollado por flammenai y cuantizado por mradermacher. El modelo original se entrena sobre el dataset propietario MahouMix-v1 y esta pensado para uso conversacional en ingles. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y motores compatibles, sin necesidad de GPUs de datacenter.

El modelo cuenta con 32.759.790.592 parametros (aproximadamente 32,8 mil millones) en una arquitectura transformer densa heredada de Qwen2.5-32B. La cuantizacion la realiza mradermacher, un actor consolidado en el ecosistema GGUF, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. El repositorio ocupa 224 GB e incluye 11 variantes de cuantizacion estatica, desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 32B en entornos locales o de bajo presupuesto, con opciones de cuantizacion que caben en GPUs de consumo de 24 GB (Q4_K_M, 19,9 GB) o incluso en configuraciones con CPU y RAM abundante. No obstante, la informacion publicada sobre el modelo base es muy limitada: no hay benchmarks, no se detalla la composicion del dataset ni el proceso de entrenamiento, y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Qwen2.5-32B) |
| Parametros totales | 32.759.790.592 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-32B: un transformer denso con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base Mahou-1.5-Qwen2.5-32B es un fine-tuning de flammenai sobre el dataset MahouMix-v1, cuyo contenido, tamano y composicion no se detallan en la informacion disponible. No se especifica si hubo RLHF, DPO, SFT u otras etapas de alineamiento, ni el numero de tokens de entrenamiento.

La innovacion tecnica de esta ficha no reside en el modelo en si, sino en la cadena de cuantizacion: mradermacher aplica cuantizaciones estaticas (no imatrix) con el formato GGUF de llama.cpp, lo que permite reducir el peso del modelo desde los aproximadamente 65 GB en FP16 hasta 12,4 GB en Q2_K. El autor indica que las versiones con imatrix estan disponibles en un repositorio separado (Mahou-1.5-Qwen2.5-32B-i1-GGUF), y recomienda IQ-quants sobre cuantizaciones no-IQ de tamano similar. No se documentan tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado de las capacidades de Qwen2.5-32B.
- Generacion de codigo y matematicas: presumiblemente soportadas por la base Qwen2.5, aunque no se documentan en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion local mediante llama.cpp y motores compatibles con GGUF.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en una estacion de trabajo con una GPU de 24 GB usando Q4_K_M (19,9 GB), sin depender de APIs externas ni de conectividad.
- Prototipado de chatbots en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que lo hace adecuado para pruebas de concepto en sectores regulados.
- Generacion de texto y redaccion asistida en ingles: suitable para tareas de resumen, reescritura y generacion de borradores donde no se requiere un contexto extremadamente largo.
- Fine-tuning posterior sobre dominio especifico: al estar bajo Apache 2.0 y en formato GGUF, se puede usar como base para experimentos de adaptacion, aunque para fine-tuning conviene partir del modelo en safetensors.
- Despliegue en servidores con CPU y RAM abundante: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten inferencia en CPU con llama.cpp, util para entornos sin GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir el impacto de la cuantizacion en calidad y velocidad para un mismo modelo base.
- Educacion e investigacion: util para estudiar el comportamiento de modelos de 32B en hardware de consumo y comparar con alternativas de menor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,4 GB
  - Q3_K_S: ~14,5 GB
  - Q3_K_M: ~16,0 GB
  - Q3_K_L: ~17,3 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_S: ~18,9 GB
  - Q4_K_M: ~19,9 GB
  - Q5_K_S: ~22,7 GB
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPU recomendadas:
  - RTX 4090 (24 GB): Q4_K_M, Q5_K_S y Q5_K_M caben en VRAM; Q6_K y Q8_0 requieren offloading parcial a RAM.
  - A100 40 GB / 80 GB y H100: todas las cuantizaciones caben en VRAM, incluida Q8_0.
  - RTX 3090 (24 GB): mismo perfil que la RTX 4090.
- Cabe en consumer GPU: si, en GPUs de 24 GB con cuantizaciones Q4/Q5; en GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mahou-1.5-Qwen2.5-32B-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF | Fine-tuning de Qwen2.5-32B sobre MahouMix-v1; solo ingles |
| Qwen2.5-32B-Instruct (GGUF) | 32,8B | 32.768 tokens (segun Qwen) | Apache 2.0 | GGUF | Modelo base oficial, multilingue y con contexto documentado |
| Mistral-Small-24B-Instruct (GGUF) | 23,6B | 32.768 tokens (segun Mistral) | Apache 2.0 | GGUF | Alternativa de menor tamano con contexto documentado |
| Gemma-2-27B-it (GGUF) | 27,2B | 8.192 tokens (segun Google) | Gemma license | GGUF | Contexto mas corto y licencia con restricciones de uso |

La comparativa se limita a datos publicos de los modelos alternativos; no se dispone de benchmarks del modelo Mahou para comparar rendimiento real.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen2.5, hereda los sesgos del modelo base y del dataset MahouMix-v1, cuyo contenido no se detalla.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este fine-tuning.
- Limitaciones de contexto o idioma: solo se declara soporte para ingles; la longitud de contexto no esta documentada y podria diferir de la del Qwen2.5 original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset MahouMix-v1, cuya licencia no se especifica.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior. El modelo no documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse sin validacion.
- El repositorio ocupa 224 GB, por lo que la descarga completa requiere espacio en disco considerable; se recomienda descargar solo la cuantizacion necesaria.
- No hay benchmarks publicados, lo que impide comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mahou-1.5-Qwen2.5-32B-GGUF
- Modelo base: https://huggingface.co/flammenai/Mahou-1.5-Qwen2.5-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Mahou-1.5-Qwen2.5-32B-i1-GGUF
- Dataset: https://huggingface.co/datasets/flammenai/MahouMix-v1
- Pagina de resumen del autor: https://hf.tst.eu/model#Mahou-1.5-Qwen2.5-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

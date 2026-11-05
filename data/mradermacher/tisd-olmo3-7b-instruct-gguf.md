# mradermacher/TISD-OLMo3-7B-Instruct-GGUF

## Resumen

TISD-OLMo3-7B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo Taeckyung/TISD-OLMo3-7B-Instruct, un modelo de lenguaje de 7.298.011.136 parametros construido sobre la familia OLMo 3 y afinado mediante tecnicas de self-distillation (TISD). El modelo esta especializado en generacion de codigo, segun indica el dataset de entrenamiento declarado (livecodebench/code_generation_lite) y las etiquetas de la model card. La cuantizacion corre a cargo de mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp.

La relevancia de esta publicacion es doble: por un lado, ofrece el modelo original (que solo se distribuye en safetensors y requiere infraestructura de GPU para inferencia) en un formato que permite ejecutarlo en CPU y en GPUs de consumo mediante llama.cpp u Ollama; por otro, lo hace bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales. El repositorio incluye 12 cuantizaciones estaticas que van desde Q2_K (3.0 GB) hasta f16 (14.7 GB).

Al tratarse de un modelo de 7B con contexto no documentado en la informacion disponible, su interes practico reside en el equilibrio entre tamano (cabe en GPUs de consumo con cuantizaciones Q4 y Q5) y especializacion en codigo. No se han publicado resultados de benchmarks en la informacion proporcionada, por lo que la evaluacion de su calidad debe hacerse mediante pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de OLMo 3; detalles especificos no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de su ascendencia OLMo 3, una familia de modelos abiertos de AllenAI. El modelo base Taeckyung/TISD-OLMo3-7B-Instruct incorpora tecnicas de self-distillation (TISD) durante el ajuste, segun indican las etiquetas y el nombre del modelo. El dataset de entrenamiento declarado es livecodebench/code_generation_lite, lo que sugiere un enfasis en tareas de generacion de codigo evaluadas en escenarios tipo LiveCodeBench. No se especifica el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

La cuantizacion realizada por mradermacher es de tipo estatico (no se ofrecen variantes con imatrix o weighted quants en el momento de la publicacion). El autor indica que las cuantizaciones IQ pueden ser preferibles frente a cuantizaciones no-IQ de tamano similar, y recomienda Q4_K_S y Q4_K_M como opciones rapidas, y Q6_K por su buena calidad.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta conversational en HuggingFace).
- Generacion de codigo, con especializacion derivada del dataset LiveCodeBench.
- Razonamiento y respuesta a instrucciones (variante Instruct).
- Capacidades de self-distillation integradas en el proceso de entrenamiento del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistencia a la programacion en local: el modelo puede generar y completar codigo en ingles ejecutandose en una estacion de trabajo con GPU de consumo usando la cuantizacion Q4_K_M (4.6 GB), sin depender de APIs externas.
- Autocompletado de codigo en editores: con Q4_K_S (4.3 GB) o Q5_K_M (5.3 GB) se puede integrar en plugins de VS Code o Neovim mediante llama.cpp, aprovechando la especializacion en generacion de codigo del modelo.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, es adecuado para equipos que no pueden enviar codigo propietario a servicios en la nube.
- Prototipado rapido de pipelines de generacion de codigo: la licencia Apache 2.0 permite integrar el modelo en herramientas internas y productos comerciales sin restricciones de atribucion adicionales.
- Evaluacion comparativa de tecnicas de self-distillation: investigadores pueden reproducir y comparar el comportamiento del modelo frente a OLMo 3 base usando las distintas cuantizaciones para medir el impacto de la compresion.
- Despliegue en servidores sin GPU: las cuantizaciones Q2_K (3.0 GB) y Q3_K_S (3.4 GB) permiten inferencia en CPU en entornos con RAM limitada, aunque con perdida de calidad.
- Educacion y experimentacion: el rango de cuantizaciones disponibles (de 3.0 a 14.7 GB) permite estudiar el efecto de la cuantizacion en la calidad de generacion de codigo con un unico modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3.5-4 GB para Q2_K, 4-5 GB para Q4_K_M, 5.5-6.5 GB para Q6_K y 15-16 GB para f16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs con 8 GB o mas usando cuantizaciones Q4 o Q5; en GPUs de 6 GB con Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI o transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| TISD-OLMo3-7B-Instruct (este) | 7.298 M | no disponible | Codigo (LiveCodeBench) | Apache 2.0 | GGUF, safetensors |
| OLMo 3 7B Instruct (base) | ~7 B | no disponible | Generalista | Apache 2.0 | safetensors |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 tokens | Codigo | Apache 2.0 | safetensors, GGUF |
| CodeLlama-7B-Instruct | ~6,7 B | 16.384 tokens | Codigo | Llama 2 custom | safetensors, GGUF |

La comparativa con Qwen2.5-Coder y CodeLlama se ofrece como referencia de categoria (modelos de ~7B especializados en codigo); no se dispone de datos de rendimiento comparativo del modelo TISD en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- Sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigacion.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar casos de uso con ventanas largas sin verificacion previa.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4 o superior para uso en produccion.
- Ausencia de imatrix/weighted quants: en el momento de la publicacion no habia cuantizaciones ponderadas, lo que puede afectar la calidad frente a alternativas con imatrix.
- Sin benchmarks publicados: no es posible validar afirmaciones de rendimiento sin evaluacion propia.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento por si imponen obligaciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TISD-OLMo3-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/Taeckyung/TISD-OLMo3-7B-Instruct
- Pagina de descargas del autor: https://hf.tst.eu/model#TISD-OLMo3-7B-Instruct-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset de entrenamiento declarado: livecodebench/code_generation_lite (HuggingFace Datasets)

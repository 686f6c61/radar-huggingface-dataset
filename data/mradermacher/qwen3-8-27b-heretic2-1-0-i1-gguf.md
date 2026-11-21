# mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF

## Resumen

Qwen3.8-27B-Heretic2.1.0-i1-GGUF es una cuantizacion en formato GGUF del modelo symmetrisch/Qwen3.8-27B-Heretic2.1.0, un derivado de la familia Qwen3 de Alibaba con tecnicas de "abliteration" (eliminacion de rechazos) aplicadas. El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos populares con cuantizaciones ponderadas mediante imatrix. El modelo base tiene 26.895.998.464 parametros totales (aproximadamente 27B) y esta disenado para generacion de texto conversacional sin las restricciones de rechazo tipicas de los modelos alineados.

La relevancia de este modelo reside en su naturaleza "uncensored/decensored/abliterated", lo que lo hace atractivo para investigadores que estudian el comportamiento de modelos sin alineacion restrictiva, o para desarrolladores que necesitan un modelo que no rechace peticiones por motivos de seguridad. La cuantizacion GGUF permite ejecutar un modelo de 27B en hardware de consumo mediante tecnicas de cuantizacion agresiva (desde IQ1_S hasta Q6_K), con tamanos que van desde 7,2 GB hasta 22,2 GB.

El repositorio incluye un amplio conjunto de cuantizaciones (mas de 20 variantes) generadas con imatrix, lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes. La licencia Apache 2.0 facilita su uso comercial, aunque la naturaleza del modelo (abliterated) plantea consideraciones eticas y de seguridad importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, detalles especificos no disponibles) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles; otros no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples archivos por cuantizacion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base symmetrisch/Qwen3.8-27B-Heretic2.1.0 en la informacion proporcionada. Por el nombre y el tamano (27B parametros), se trata presumiblemente de un transformer denso derivado de la familia Qwen3, aunque no se confirma si emplea atencion lineal, decodificacion especulativa u otras innovaciones de Qwen3. El termino "Heretic" en el nombre hace referencia a la tecnica de abliteration, que consiste en identificar y eliminar las direcciones de activacion responsables del comportamiento de rechazo en modelos alineados, preservando el resto de capacidades.

El proceso de cuantizacion realizado por mradermacher utiliza imatrix (importance matrix) para las variantes i1, lo que permite una mejor preservacion de la calidad en cuantizaciones agresivas comparado con las cuantizaciones estaticas equivalentes. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional en ingles sin rechazos por motivos de seguridad (comportamiento "uncensored").
- Razonamiento y generacion de codigo heredados del modelo base Qwen3 (no verificado en la informacion disponible).
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se confirma soporte de tool calling, function calling, agentes, vision, audio ni thinking mode en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de sistemas sin rechazos, comparando respuestas con modelos alineados para analizar sesgos y diferencias de comportamiento.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo donde los modelos alineados suelen rechazar tematicas sensibles.
- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 (8,5-14,4 GB) permiten ejecutar un modelo de 27B en GPUs consumer como RTX 3090/4090 (24 GB VRAM) o incluso en configuraciones con 12-16 GB usando cuantizaciones agresivas.
- Experimentacion con cuantizaciones: el repositorio ofrece mas de 20 variantes para estudiar el impacto de la cuantizacion en la calidad, util para investigadores que comparan tecnicas de cuantizacion.
- Prototipado rapido en local: uso con llama.cpp u Ollama para pruebas de concepto conversacionales sin depender de APIs externas.
- Analisis de robustez de filtros: evaluar como responde un modelo abliterated ante prompts adversariales, util para equipos de seguridad que disenan clasificadores o filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano del archivo GGUF):
  - i1-IQ1_S: 7,2 GB (calidad muy baja, "for the desperate").
  - i1-IQ2_M: 10,1 GB.
  - i1-IQ3_M: 12,7 GB.
  - i1-IQ4_XS: 15,2 GB.
  - i1-Q4_K_M: 16,6 GB (recomendado por el autor como "fast").
  - i1-Q5_K_M: 19,3 GB.
  - i1-Q6_K: 22,2 GB (practicamente como Q6_K estatico).
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4-Q6; GPUs con 12-16 GB (RTX 4070 Ti, RTX 4080) para IQ2/IQ3; A100/H100 para despliegue en produccion con contexto largo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 12 GB o mas usando cuantizaciones IQ2/IQ3; en 24 GB con Q4-Q6.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (compatible con GGUF); vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic2.1.0-i1-GGUF (este) | 27B | no disponible | Apache 2.0 | GGUF | Abliterated, cuantizaciones imatrix |
| symmetrisch/Qwen3.8-27B-Heretic2.1.0 | 27B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| mradermacher/Qwen3.8-27B-Heretic2.1.0-GGUF | 27B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas (sin imatrix) |
| Qwen3-32B (referencia de familia) | 32B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo original alineado de Alibaba |

## Limitaciones y advertencias

- Modelo abliterated: elimina los rechazos de seguridad, lo que implica que puede generar contenido danino, sesgado o inapropiado sin filtros. No apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo elevado de alucinacion: los modelos abliterated pueden degradar capacidades de razonamiento y veracidad respecto al modelo original.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Contexto: no se especifica la longitud de contexto soportada; las cuantizaciones agresivas pueden degradar el rendimiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin alineacion conlleva responsabilidad legal y etica sobre el contenido generado.
- Cuantizaciones IQ1/IQ2 marcadas por el autor como "for the desperate" o "very low quality": no recomendadas para produccion.
- No se dispone de informacion sobre sesgos especificos, datos de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic2.1.0-i1-GGUF
- Modelo base: https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic2.1.0-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Heretic2.1.0-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

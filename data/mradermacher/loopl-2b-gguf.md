# mradermacher/loopl-2b-GGUF

## Resumen

Loopl-2b-GGUF es la version cuantizada en formato GGUF del modelo cagataydev/loopl-2b, publicada por el cuantizador habitual de HuggingFace mradermacher. Se trata de un modelo pequeno, de aproximadamente 1.900 millones de parametros (1.881.825.088 segun los pesos originales en safetensors), orientado a ejecucion en dispositivo (on-device), uso como agente y tool calling, con soporte multimodal de imagen y texto. Su licencia Apache 2.0 y su tamano lo situan en la categoria de modelos ligeros desplegables en hardware de consumo.

El modelo base declara los idiomas ingles (en) y turco (tr), y fue entrenado con SFT sobre el dataset cagataydev/loopl-train. Las etiquetas del repositorio hacen referencia a qwen3.5 y qwen3_5, lo que sugiere una arquitectura de la familia Qwen, aunque la model card proporcionada no confirma de forma explicita la arquitectura ni los detalles de entrenamiento.

La relevancia de esta ficha radica en que la version GGUF permite ejecutar el modelo con llama.cpp y derivados (Ollama, LM Studio, Jan) tanto en CPU como en GPU de gama baja, incluyendo los ficheros mmproj necesarios para habilitar la parte visual. El repositorio ocupa 19,1 GB e incluye un amplio abanico de cuantizaciones, desde Q2_K hasta f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repo referencian qwen3.5 / qwen3_5) |
| Parametros totales | 1.881.825.088 (~1,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj-Q8_0 y mmproj-f16 para vision |
| Idiomas soportados | en (ingles), tr (turco) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); safetensors en el modelo base cagataydev/loopl-2b |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | cagataydev/loopl-train |
| Tareas declaradas | on-device, agent, tool-calling, sft, vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Las etiquetas del repositorio (qwen3.5, qwen3_5) apuntan a una arquitectura tipo transformer de la familia Qwen, pero no se confirma en la documentacion proporcionada ni se especifican el numero de capas, dimensiones de atencion, tipo de atencion (completa o lineal) ni el mecanismo de vision empleado. Tampoco se indica si se trata de un modelo denso o de mezcla de expertos (MoE); dado que no se mencionan parametros activos, cabe suponer un modelo denso, aunque no puede afirmarse con los datos disponibles.

En cuanto al entrenamiento, la model card unicamente senala que se uso SFT (supervised fine-tuning) sobre el dataset cagataydev/loopl-train. No se proporcionan el numero de tokens, la composicion del dataset, ni si hubo fases posteriores de RLHF, DPO u otra optimizacion por preferencias. Tampoco se documentan innovaciones tecnicas concretas. La contribucion de este repositorio es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y ofrece ademas cuantizaciones ponderadas/imatrix en el repositorio mradermacher/loopl-2b-i1-GGUF.

## Capacidades

- Generacion de texto conversacional: el pipeline es conversational y el modelo esta pensado para dialogos multi-turno.
- Procesamiento de imagen y texto (vision): la pipeline declarada es image-text-to-text y el repo incluye ficheros mmproj, lo que habilita entrada de imagenes junto a texto.
- Tool calling / function calling: etiquetado explicitamente como "tool-calling".
- Uso como agente: etiquetado como "agent", orientado a flujos de razonamiento multi-paso con herramientas.
- Ejecucion en dispositivo (on-device): el modelo esta disenado para desplegarse localmente por su tamano reducido.
- Multilingue: soporte declarado de ingles y turco, sin indicacion de otros idiomas.
- Ajuste fino supervisado: el modelo base fue entrenado con SFT sobre un dataset especifico (loopl-train).
- Capacidades adicionales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de agente local con tool calling: el modelo puede integrarse en un runtime de agente que invoque funciones externas (APIs, busquedas, calculos) en un bucle de razonamiento multi-paso, ejecutandose en un portatil o mini-PC sin GPU dedicada gracias a sus cuantizaciones Q4.
- Automatizacion de escritorio on-device: al correr con llama.cpp u Ollama, permite construir asistentes que operan sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Procesamiento de imagenes con descripcion textual: usando los ficheros mmproj, puede emplearse para tareas de vision-lenguaje como responder preguntas sobre capturas, facturas o fotografias en un flujo local.
- Prototipado rapido de aplicaciones conversacionales: por su licencia Apache 2.0 y su tamano, es adecuado para validar productos de chat antes de escalar a modelos mayores.
- Clasificacion y extraccion de informacion sobre texto e imagen: puede usarse como componente de pipelines de extraccion de campos en documentos escaneados, combinando vision y generacion.
- Educacion e investigacion en IA local: sirve como modelo de referencia para experimentar con cuantizaciones, SFT y evaluacion de agentes en entornos academicos con recursos limitados.
- Soporte en turco e ingles: util para aplicaciones dirigidas especificamente a esos dos mercados idiomaticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin KV cache ni mmproj):
  - Q4_K_M: ~1,4 GB de pesos.
  - Q4_K_S: ~1,3 GB.
  - Q5_K_M: ~1,5 GB.
  - Q6_K: ~1,7 GB.
  - Q8_0: ~2,1 GB.
  - f16: ~3,9 GB.
  - mmproj (vision): ~0,5 GB (Q8_0) o ~0,8 GB (f16) adicionales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede alojar las cuantizaciones Q4-Q8 con margen para el KV cache; ejemplos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 no son necesarias pero funcionaran sin problema.
- Consumer GPU: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas con memoria compartida suficiente.
- CPU: puede ejecutarse integramente en CPU con llama.cpp; las cuantizaciones Q4 son las recomendadas para velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan y otros runtimes compatibles con GGUF. Para vision es necesario cargar tambien el fichero mmproj correspondiente.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Vision | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/loopl-2b-GGUF | ~1,9 B | no disponible | apache-2.0 | si (mmproj) | GGUF en HuggingFace |
| Qwen2.5-1.5B (referencia) | ~1,5 B | 32.768 tokens (segun su model card publica) | apache-2.0 en varias versiones | no en la variante base | safetensors y GGUF |
| Gemma-2-2B (referencia) | ~2,6 B | 8.192 tokens (segun su model card publica) | Gemma Terms | no | safetensors y GGUF |
| SmolLM2-1.7B (referencia) | ~1,7 B | 8.192 tokens (segun su model card publica) | apache-2.0 | no | safetensors y GGUF |

Nota: los datos de los modelos de referencia corresponden a informacion publica ampliamente conocida; las cifras de loopl-2b (contexto, rendimiento) no estan disponibles en la documentacion proporcionada, por lo que la comparacion es fundamentalmente de parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta evaluaciones de sesgo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se han publicado metricas de fiabilidad para este modelo.
- Limitaciones de contexto o idioma: solo se declaran ingles y turco; no hay datos sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con entradas largas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base cagataydev/loopl-2b por si difieren.
- Vision dependiente de ficheros mmproj: para usar la capacidad multimodal es imprescindible descargar y cargar el mmproj junto al modelo principal.
- Cuantizaciones de baja calidad: Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- Ausencia de benchmarks: no hay resultados publicados que permitan estimar el rendimiento real frente a alternativas, lo que exige una evaluacion propia antes de llevarlo a produccion.
- Fecha de creacion del repositorio: la model card indica 2026-10-07, fecha que conviene contrastar, ya que puede tratarse de un error de metadatos.
- Tamano del repo: 19,1 GB en total por incluir todas las cuantizaciones; es necesario descargar unicamente el fichero elegido.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/loopl-2b-GGUF
- Modelo base: https://huggingface.co/cagataydev/loopl-2b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/loopl-2b-i1-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/cagataydev/loopl-train
- Pagina de overview de cuantizaciones: https://hf.tst.eu/model#loopl-2b-GGUF
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests

# mradermacher/AReaL-boba-2-32B-GGUF

## Resumen

AReaL-boba-2-32B-GGUF es la version cuantizada en formato GGUF del modelo AReaL-boba-2-32B, desarrollado originalmente por inclusionAI y distribuido en formato listo para inferencia local por el usuario mradermacher. Se trata de un modelo de lenguaje de 32.762.123.264 parametros (aproximadamente 32,8 mil millones) orientado a conversacion y generacion de texto en ingles, publicado bajo licencia Apache 2.0. La cuantizacion la realiza mradermacher, un colaborador habitual de la comunidad que convierte modelos de pesos completos a formatos optimizados para llama.cpp y ecosistemas compatibles.

El modelo base pertenece a la familia AReaL-boba-2 de inclusionAI, una linea de modelos entrenados con tecnicas de aprendizaje por refuerzo (RL) sobre modelos existentes, segun la nomenclatura "boba" que emplea el autor. La version GGUF permite ejecutar el modelo en hardware de consumo y en servidores sin GPU de gama alta, algo imposible con los pesos completos en safetensors que requieren aproximadamente 65 GB en precision bf16.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 32B en entornos locales mediante llama.cpp, Ollama o servidores compatibles con la API de OpenAI, manteniendo la licencia permisiva Apache 2.0 que facilita su uso comercial. El repositorio incluye once variantes de cuantizacion desde Q2_K hasta Q8_0, cubriendo un rango de 12,4 GB a 34,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base inclusionAI/AReaL-boba-2-32B; detalles especificos no disponibles) |
| Parametros totales | 32.762.123.264 (aproximadamente 32,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien existe el modelo base en safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la informacion disponible. Por el nombre y el tamano (32,8B parametros) y por la practica habitual de inclusionAI, es probable que se trate de un transformer denso derivado de un modelo preentrenado y posteriormente afinado mediante tecnicas de aprendizaje por refuerzo, dado el prefijo "AReaL" (Reinforcement Learning) y el sufijo "boba-2". Sin embargo, no se confirma en la documentacion proporcionada ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se empleo RLHF, DPO u otro metodo de alineacion.

La contribucion de este repositorio concreto es la cuantizacion estatica a GGUF realizada por mradermacher, que preserva la calidad del modelo original en distintos niveles de compresion. El autor indica que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (AReaL-boba-2-32B-i1-GGUF), lo que sugiere que las versiones de este repositorio son cuantizaciones estaticas sin matriz de importancia. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Razonamiento y respuesta a instrucciones, heredado del modelo base afinado.
- Compatibilidad con endpoints de la API de OpenAI (etiqueta "endpoints_compatible"), lo que permite integrarlo en servidores como llama.cpp server, Ollama o vLLM con la interfaz OpenAI.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados.
- Capacidades especificas de tool calling, function calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado al ingles segun la model card.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en una estacion de trabajo con llama.cpp u Ollama para mantener conversaciones multi-turno en ingles sin depender de servicios en la nube, gracias a su licencia Apache 2.0 y a las cuantizaciones de 12 a 35 GB.
- Prototipado de aplicaciones con API compatible con OpenAI: al estar etiquetado como "endpoints_compatible", puede sustituir a la API de OpenAI en entornos de desarrollo usando llama.cpp server, facilitando la migracion de codigo existente.
- Generacion de texto en pipelines de procesamiento por lotes: con la cuantizacion Q4_K_M (19,9 GB) puede ejecutarse en una unica GPU de 24 GB como la RTX 4090 para tareas de resumen, clasificacion o redaccion en ingles.
- Investigacion sobre cuantizacion: el repositorio ofrece once variantes que permiten estudiar el impacto de la compresion en la calidad, comparando Q2_K frente a Q8_0 en tareas concretas.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten inferencia en CPU con RAM suficiente, util para entornos de bajo coste.
- Evaluacion comparativa de modelos de 32B: sirve como referencia para comparar el rendimiento de la familia AReaL-boba-2 frente a otros modelos de tamano similar en tareas de razonamiento y conversacion.
- Fine-tuning ligero sobre GGUF: aunque no es el flujo principal, las herramientas de llama.cpp permiten adaptar el modelo con LoRA sobre la version cuantizada para dominios especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo de cuantizacion mas un margen para el contexto. Q2_K requiere unos 13-14 GB, Q4_K_M unos 21-22 GB, Q8_0 unos 36-38 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y cuantizaciones inferiores; A100 40 GB o H100 para Q6_K y Q8_0; multiples GPU para Q8_0 si se desea contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con la API de OpenAI (llama.cpp server), y potencialmente vLLM con soporte GGUF (no confirmado en la informacion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AReaL-boba-2-32B-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF | Cuantizacion estatica de mradermacher |
| AReaL-boba-2-32B (base) | 32,8B | no disponible | Apache 2.0 | safetensors | Pesos completos de inclusionAI |
| AReaL-boba-2-32B-i1-GGUF | 32,8B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas del mismo autor |

No se dispone de datos de benchmarks ni de comparativas con modelos de otras familias en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas como Qwen, Llama o Mistral de tamano similar.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea inferior.
- No se documentan sesgos conocidos, pero al ser un modelo afinado por RL sin informacion sobre su dataset, existe riesgo de sesgos no declarados.
- Riesgo de alucinacion inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fiabilidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base inclusionAI/AReaL-boba-2-32B por si impone restricciones adicionales.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso en produccion.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que impide planificar aplicaciones que requieran ventanas largas.
- El repositorio tiene muy pocas descargas (173) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- El modelo base no incluye documentacion detallada sobre su entrenamiento en la informacion disponible, lo que dificulta evaluar su comportamiento en dominios especializados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AReaL-boba-2-32B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/AReaL-boba-2-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/AReaL-boba-2-32B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#AReaL-boba-2-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

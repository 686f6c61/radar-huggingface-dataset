# mradermacher/AfriqueQwen3.5-4B-zul-sft-v2-GGUF

## Resumen

AfriqueQwen3.5-4B-zul-sft-v2-GGUF es la version cuantizada en formato GGUF del modelo SaarAI/AfriqueQwen3.5-4B-zul-sft-v2, un ajuste fino supervisado (SFT) del modelo Qwen3.5 de 4B parametros orientado al zulu (zu), una de las principales lenguas bantu de Sudafrica. El modelo base parte de la familia Qwen3.5 y ha sido entrenado mediante full-finetune con llama-factory sobre un conjunto de datos SFT en zulu e ingles, con el objetivo de mejorar el rendimiento en esa lengua de bajos recursos. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, para facilitar su despliegue en entornos con llama.cpp y hardware de consumo.

El modelo cuenta con 4.205.751.296 parametros totales (segun los pesos en safetensors del modelo base) y una licencia CC-BY-4.0, lo que permite uso comercial con atribucion. Su interes radica en cubrir una lengua africana con poca representacion en los modelos generalistas, manteniendo un tamano manejable que cabe en GPU de consumo. La publicacion de cuantizaciones estaticas desde Q2_K hasta f16, ademas de un modulo multimodal (mmproj), amplia las opciones de despliegue.

No obstante, la informacion disponible es limitada: la model card del cuantizador es generica y no detalla el dataset de entrenamiento, la longitud de contexto ni los resultados de evaluacion. Esta ficha refleja unicamente los datos verificables en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj Q8_0 y f16 |
| Idiomas soportados | zulu (zu), ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Qwen3.5, un transformer decoder-only de 4B parametros. Sobre esa base, SaarAI aplico un ajuste fino supervisado completo (full-finetune SFT) mediante llama-factory, segun las etiquetas del repositorio. El objetivo del entrenamiento es adaptar el modelo a la lengua zulu y al ingles, presumiblemente con pares instruccion-respuesta en esos idiomas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales.

La unica innovacion tecnica documentada en esta publicacion es el proceso de cuantizacion estatica realizado por mradermacher, que incluye un modulo multimodal (mmproj) en Q8_0 y f16. Este mmproj sugiere que el modelo base podria tener capacidades de vision, aunque no se detalla en la informacion disponible. No se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en zulu e ingles, segun los idiomas declarados.
- Ajuste fino para instrucciones (SFT), orientado a tareas de seguimiento de instrucciones.
- Posible soporte multimodal: el repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica un componente de vision, aunque no se detalla su alcance.
- Compatible con endpoints (etiqueta endpoints_compatible) y con la libreria transformers.
- No se documentan capacidades especificas de tool calling, function calling, agentes o modo thinking en la informacion disponible.

## Casos de uso

- Atencion al cliente en zulu: el modelo puede gestionar conversaciones multi-turno en zulu e ingles, adecuado para empresas sudafricanas que atienden a hablantes de ambas lenguas. La longitud de contexto no esta documentada, por lo que habria que validarla antes de produccion.
- Traduccion zulu-ingles: al estar entrenado en ambos idiomas, puede emplearse para traduccion asistida en entornos de documentacion o soporte, con revision humana dado el riesgo de alucinacion en lenguas de bajos recursos.
- Generacion de contenido educativo: redaccion de materiales escolares y divulgativos en zulu, aprovechando el ajuste SFT para seguir instrucciones de formato y tono.
- Procesamiento de documentos con imagenes: si el componente mmproj esta operativo, podria extraer texto de imagenes o responder preguntas sobre ellas en zulu e ingles, util para digitalizacion de archivos.
- Despliegue en hardware de consumo: gracias a las cuantizaciones Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB), puede ejecutarse en portatiles y equipos con GPU modesta para prototipos y demos locales.
- Investigacion en lenguas de bajos recursos: sirve como punto de partida para experimentos de NLP en zulu, comparando el efecto del SFT frente al modelo Qwen3.5 original.
- Chatbot integrado en aplicaciones moviles o de escritorio: el formato GGUF permite integrarlo con llama.cpp u Ollama en entornos sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~2,1 GB
  - Q3_K_M: ~2,4 GB
  - Q4_K_M: ~2,8 GB
  - Q5_K_M: ~3,2 GB
  - Q6_K: ~3,6 GB
  - Q8_0: ~4,6 GB
  - f16: ~8,5 GB
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o A100/H100 para f16 y despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas para cuantizaciones Q4_K_M y superiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-zul-sft-v2-GGUF | 4,2B | no disponible | zu, en | CC-BY-4.0 | GGUF |
| Qwen3.5-4B (base de la familia) | ~4B | no disponible | multilingue (segun version) | no disponible | safetensors/GGUF |
| SaarAI/AfriqueQwen3.5-4B-zul-sft-v2 | 4,2B | no disponible | zu, en | CC-BY-4.0 | safetensors |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los modelos entrenados en lenguas de bajos recursos suelen heredar sesgos del corpus y del modelo base.
- Riesgo de alucinacion: elevado en zulu por la escasez de datos de entrenamiento en esa lengua; se recomienda validacion humana en produccion.
- Limitaciones de contexto o idioma: solo se declaran zulu e ingles; el rendimiento en otras lenguas no esta garantizado. La longitud de contexto no esta documentada.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; es necesario citar al autor y mantener el aviso de licencia.
- Caveats para produccion: la model card del cuantizador es generica y no aporta detalles de evaluacion; conviene probar el modelo en el dominio concreto antes de desplegarlo. Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v2-GGUF
- Modelo base: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#AfriqueQwen3.5-4B-zul-sft-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

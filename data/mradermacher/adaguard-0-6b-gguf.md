# mradermacher/AdaGuard-0.6B-GGUF

## Resumen

AdaGuard-0.6B-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo Yunhao-Feng/AdaGuard-0.6B, un modelo de seguridad (guard model) de pequeno tamano condicionado por politica. Lo publica mradermacher, autor especializado en generar versiones cuantizadas de modelos abiertos para su ejecucion local con llama.cpp y derivados. El modelo base tiene 751.632.384 parametros (aproximadamente 0,75 mil millones) y esta etiquetado con la arquitectura Qwen3, por lo que se trata de un transformer denso de escala reducida.

La particularidad del modelo es su naturaleza "policy-conditioned": en lugar de limitarse a clasificar contenido como seguro o inseguro segun una taxonomia fija, esta disenado para evaluar si una interaccion cumple una politica dada, lo que encaja con escenarios de seguridad de agentes (agent-safety). Los tags de la model card lo asocian tambien a aprendizaje por refuerzo (reinforcement-learning), lo que sugiere que el ajuste final se realizo con tecnicas de RL sobre el modelo base.

Su relevancia practica es doble: por un lado, el tamano reducido permite ejecutar un clasificador de seguridad en la misma maquina o incluso en el mismo proceso que el modelo generador, sin depender de APIs externas; por otro, la disponibilidad de cuantizaciones desde Q2_K (0,4 GB) hasta f16 (1,6 GB) facilita el despliegue en CPU, GPUs de consumo y entornos con memoria muy limitada. No se han publicado en la informacion disponible datos sobre longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, etiquetado como Qwen3 en la model card |
| Parametros totales | 751.632.384 (aproximadamente 0,75 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |
| Modelo base | Yunhao-Feng/AdaGuard-0.6B |
| Cuantizado por | mradermacher |
| Tarea declarada (pipeline) | reinforcement-learning |
| Tamano del repositorio | 7,0 GB |
| Fecha de creacion (segun HuggingFace) | 2026-09-29 |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos publicados en la informacion proporcionada sobre la arquitectura interna mas alla del tag qwen3, que apunta a la familia Qwen3. Con 751.632.384 parametros totales se trata de un transformer denso de escala sub-1B, sin indicios de mezcla de expertos ni de arquitectura hibrida SSM. El pipeline declarado en HuggingFace es reinforcement-learning, y los tags incluyen safety, guard-model, policy-conditioned, agent-safety y reinforcement-learning.

Esto sugiere un modelo base preentrenado y posteriormente ajustado mediante aprendizaje por refuerzo para actuar como evaluador de seguridad condicionado por una politica: el modelo recibiria, ademas del contenido a evaluar, una descripcion de la politica aplicable, y devolveria un juicio de cumplimiento o incumplimiento. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Evaluacion de seguridad de contenido en ingles, en su rol de guard model.
- Clasificacion condicionada por politica: el juicio depende de la politica proporcionada, no solo de una taxonomia fija de categorias.
- Orientacion a seguridad de agentes (agent-safety), segun los tags de la model card.
- Integracion con transformers como libreria declarada, ademas del formato GGUF para inferencia local.
- Formato conversacional (tag conversational) y compatibilidad con endpoints.
- Los tags incluyen safetensors, lo que indica publicacion de pesos en ese formato en el modelo base.
- Capacidades de generacion de texto general, razonamiento, codigo o matematicas: no disponibles como datos explicitos en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte multilingue: no; el unico idioma declarado es ingles.
- Vision o audio: no disponible, sin indicios en la model card.

## Casos de uso

- Moderacion de salidas de un LLM generador en produccion: al ser un modelo de 0,75 B, puede ejecutarse en la misma GPU que el modelo principal y filtrar cada respuesta antes de mostrarla al usuario, evaluando el texto contra la politica de contenido de la aplicacion.
- Seguridad de agentes autonomos: el modelo puede actuar como punto de control antes de que un agente ejecute una accion (llamada a herramienta, escritura en base de datos, envio de correo), comprobando si la accion propuesta respeta la politica definida por el operador.
- Filtrado de entradas de usuario en chatbots: clasificacion previa de mensajes para detectar intentos de jailbreak o peticiones que vulneran las condiciones de uso, con la politica concreta del servicio como contexto.
- Auditoria offline de conversaciones: procesamiento por lotes de registros historicos para marcar interacciones que incumplieron una politica determinada, aprovechando el bajo coste computacional de un modelo sub-1B.
- Despliegue en el borde o en entornos aislados: la cuantizacion Q2_K (0,4 GB) o Q3_K_S (0,5 GB) permite ejecutar el modelo en dispositivos sin GPU dedicada o en redes sin acceso a servicios externos, donde no es viable llamar a una API de moderacion.
- Investigacion en alineacion y seguridad: uso como componente ligero en experimentos de RL y evaluacion de politicas, o como linea base rapida para comparar estrategias de guardado frente a modelos de mayor tamano.
- Generacion de datos de seguridad etiquetados: uso del clasificador para preetiquetar grandes volumenes de interacciones que despues se revisan manualmente, reduciendo el coste de anotacion.
- Servicio de moderacion multi-tenant: dado su tamano, es viable instanciar varias copias del modelo con politicas distintas (una por cliente o por producto) en un mismo servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica, paper ni resultados comparativos del modelo Yunhao-Feng/AdaGuard-0.6B.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el tamano de los ficheros publicados: aproximadamente 0,4 GB en Q2_K, 0,5-0,6 GB en Q3_K e IQ4_XS, 0,6 GB en Q4_K_S y Q4_K_M, 0,6-0,7 GB en Q5_K_S y Q5_K_M, 0,7 GB en Q6_K, 0,9 GB en Q8_0 y 1,6 GB en f16. A estas cifras hay que sumar la memoria de la cache KV, dependiente de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede alojar las cuantizaciones mas ligeras; RTX 3060, RTX 4060, RTX 4090, A100 o H100 sobran ampliamente para este tamano. No es necesario hardware de centro de datos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en graficos integrados con memoria compartida.
- Ejecucion en CPU: viable con llama.cpp, dado que incluso la cuantizacion f16 ocupa 1,6 GB de disco y menos de 2 GB en memoria.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp) para los ficheros GGUF; transformers para el modelo base en safetensors; vLLM y TGI no estan confirmados para este repositorio, aunque podrian servir el modelo base en precision completa.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones por parte del autor.
- Nota sobre cuantizaciones: el autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de publicacion, y que pueden solicitarse mediante una discusion en la comunidad.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de AdaGuard-0.6B, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos provienen de su documentacion publica y deben verificarse en la fuente original.

| Modelo | Parametros | Idioma | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| AdaGuard-0.6B (este) | 751.632.384 | en | apache-2.0 | GGUF, safetensors | no disponible |
| Llama Guard 3 1B | aproximadamente 1 B | multilingue (8 idiomas declarados) | Llama 3.2 Community License | safetensors | no disponible en esta ficha |
| Llama Guard 3 8B | aproximadamente 8 B | multilingue | Llama 3.1 Community License | safetensors | no disponible en esta ficha |
| ShieldGemma 2B | aproximadamente 2 B | en | Gemma Terms of Use | safetensors | no disponible en esta ficha |
| Granite Guardian 2B | aproximadamente 2 B | en | Apache 2.0 | safetensors | no disponible en esta ficha |

Diferencias destacables: AdaGuard se distingue por ser condicionado por politica y por ofrecer cuantizaciones GGUF listas para uso local, algo que no es habitual en los guard models de Meta o Google, que se distribuyen principalmente en precision completa y bajo licencias con restricciones de uso comercial. No hay datos publicos que permitan comparar su precision frente a estas alternativas.

## Limitaciones y advertencias

- Idioma: la model card solo declara soporte de ingles. No hay evidencia de funcionamiento fiable en castellano u otros idiomas.
- Datos de evaluacion ausentes: sin benchmarks publicados no es posible estimar la tasa de falsos positivos y falsos negativos del clasificador. Cualquier uso en produccion deberia ir precedido de una evaluacion propia sobre un conjunto de validacion representativo.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir juicios inconsistentes o justificaciones erroneas, especialmente con cuantizaciones agresivas como Q2_K o Q3_K_S. Se recomienda validar la salida contra un esquema estructurado.
- Degradacion por cuantizacion: el autor advierte que Q4_K_S y Q4_K_M son las opciones rapidas recomendadas y que Q6_K ofrece muy buena calidad; las cuantizaciones por debajo de Q4 implican perdida de calidad medible en perplejidad.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con conversaciones largas ni con documentos extensos usados como contexto de politica.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero se aplica al trabajo de cuantizacion de mradermacher y al modelo base publicado bajo la misma licencia. Conviene verificar la procedencia de los datos de entrenamiento del modelo original antes de un despliegue comercial regulado.
- Sesgos: no hay informacion publicada sobre sesgos del modelo ni sobre la composicion del dataset de entrenamiento, lo que impide evaluar su comportamiento diferencial por colectivos o tematicas.
- Dependencia de la politica: al ser un modelo condicionado por politica, la calidad de sus juicios depende de como se formule la politica en el prompt. Politicas ambiguas o contradictorias producirian clasificaciones poco fiables.
- Adopcion: el repositorio registra 0 descargas y 0 likes en la informacion proporcionada, por lo que no existe una comunidad que haya validado su comportamiento en produccion.
- Uso como unica capa de seguridad: no deberia ser el unico mecanismo de moderacion, especialmente en aplicaciones sujetas a requisitos normativos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AdaGuard-0.6B-GGUF
- Modelo base: https://huggingface.co/Yunhao-Feng/AdaGuard-0.6B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#AdaGuard-0.6B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio de nethype GmbH, empresa que cede la infraestructura al autor: https://www.nethype.de/

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo; los enlaces obtenidos correspondian a sitios de exhibicion cinematografica sin vinculacion con el proyecto, por lo que se han descartado. No se han localizado paper, blog tecnico ni demo oficiales de AdaGuard-0.6B.

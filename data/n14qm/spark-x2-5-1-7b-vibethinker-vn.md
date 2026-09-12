# N14QM/Spark-X2.5-1.7B-VibeThinker-VN

## Resumen

Spark-X2.5-1.7B-VibeThinker-VN es un modelo de lenguaje de 1.707.657.216 parametros (1,7B) publicado por el usuario N14QM en HuggingFace. Se trata de un modelo derivado obtenido mediante destilacion de conocimiento a nivel de secuencia (sequence-level knowledge distillation) desde el modelo profesor WeiboAI/VibeThinker-3B (3B parametros, licencia MIT) hacia el modelo alumno XHToken/Spark-X2.5-1.7B-Base (1,7B parametros, licencia Apache-2.0). El objetivo declarado es trasladar la capacidad de razonamiento paso a paso (chain-of-thought) y de resolucion de problemas de matematicas, codigo y logica del profesor de 3B a un modelo mas pequeno que pueda ejecutarse en hardware de gama media, como una Tesla T4 de 16 GB o incluso CPU mediante GGUF.

El modelo esta orientado al vietnamita como idioma principal y al ingles para las tareas de codigo. La licencia resultante es Apache-2.0, con la obligacion de mantener la atribucion a WeiboAI/VibeThinker-3B por su licencia MIT. El autor declara haber usado exclusivamente las salidas de texto del profesor (nunca sus pesos, arquitectura, codigo fuente ni logits) y no haber empleado datasets de terceros: los datos de entrenamiento son 1.328 muestras generadas automaticamente o escritas a mano por el autor en seis dominios.

La relevancia del modelo radica en su estrategia de destilacion en un escenario de vocabularios incompatibles: el profesor usa un tokenizer de 151.667 tokens y el alumno uno de 131.072, lo que impide la destilacion clasica a nivel de logits y obliga a un enfoque de secuencia completa con rejection sampling. El resultado es un modelo compacto, con contexto de entrenamiento limitado a 1.024 tokens y sin resultados de benchmarks publicados en la informacion disponible, lo que lo situa como un experimento reproducible mas que como un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura exacta del modelo base no especificada por el autor) |
| Parametros totales | 1.707.657.216 (1,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens (limite aplicado durante el entrenamiento; la longitud nativa del modelo base no se especifica) |
| Tipos de cuantizacion | GGUF q4_k_m; pesos completos en safetensors (fp16/fp32 segun el repo); adaptadores LoRA |
| Idiomas soportados | vietnamita (principal) e ingles (orientado a codigo) |
| Licencia | Apache-2.0 (con atribucion obligatoria a WeiboAI/VibeThinker-3B, licencia MIT) |
| Formato de pesos | safetensors (LoRA y version fusionada) y GGUF |

Datos adicionales: tamano del repositorio 3,4 GB; libreria transformers; pipeline text-generation; etiquetas conversational y endpoints_compatible; tokenizer del alumno de 131.072 tokens; tokenizer del profesor de 151.667 tokens; fecha de creacion registrada 2026-09-12; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo es un transformer decoder del que no se detallan capas, dimensiones ocultas ni mecanismos de atencion concretos, ya que la model card solo identifica el modelo base (XHToken/Spark-X2.5-1.7B-Base) sin describir su arquitectura interna. La innovacion tecnica del proyecto no esta en la arquitectura, sino en el pipeline de destilacion. Al no compartir vocabulario profesor y alumno, se descarta la destilacion a nivel de logits con divergencia KL (Hinton et al.) y se adopta la destilacion a nivel de secuencia (Kim & Rush, 2016): el profesor genera una solucion completa (cadena de razonamiento mas respuesta final) para cada prompt, esa solucion se valida automaticamente mediante rejection sampling y solo los pares (prompt, solucion correcta) se conservan para el fine-tuning del alumno con perdida de entropia cruzada.

El entrenamiento se realizo con LoRA/PEFT sobre 1.328 muestras repartidas en seis dominios: matematicas, codigo, logica, acertijos, ciencia-STEM y argumentacion. El profesor genero las soluciones a temperatura 0,7 para equilibrar diversidad y coherencia. Todo el proceso se ejecuto en una unica Tesla T4 de 16 GB en Google Colab: aproximadamente 38 minutos de entrenamiento y unas 2,5 horas para el pipeline completo. El autor afirma no haber usado GSM8K, MATH ni ningun otro dataset de terceros. No se documentan fases de RLHF ni DPO, ni decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional (etiqueta conversational y pipeline text-generation).
- Razonamiento paso a paso con cadenas de pensamiento explicitas (chain-of-thought), destiladas del profesor de 3B.
- Resolucion de problemas de matematicas, orientada a enunciados en vietnamita.
- Generacion y asistencia en codigo, con el ingles como idioma de trabajo en esta area.
- Razonamiento logico y resolucion de acertijos.
- Preguntas de ciencia y STEM a nivel divulgativo o educativo.
- Tareas de argumentacion y justificacion de respuestas.
- Ejecucion local mediante llama.cpp y modelos cuantizados en formato GGUF.
- Capacidad multilingue limitada a vietnamita e ingles; no se declaran otros idiomas.
- Soporte de tool calling o function calling: no disponible (no documentado).
- Soporte de agentes o razonamiento multi-paso con herramientas: no disponible (no documentado).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Tutoria de matematicas en vietnamita: el modelo puede resolver ejercicios mostrando el desarrollo paso a paso gracias al entrenamiento en cadenas de pensamiento, lo que permite al estudiante seguir el razonamiento y no solo la respuesta final.
- Asistente educativo de logica y acertijos: adecuado para generar explicaciones graduadas en vietnamita en plataformas de aprendizaje, aprovechando los dominios de logica y rompecabezas incluidos en el dataset de destilacion.
- Apoyo a la programacion en equipos vietnamitas: generacion y explicacion de fragmentos de codigo con comentarios en vietnamita y codigo en ingles, cubriendo la combinacion idiomatica declarada por el autor.
- Despliegue en el borde (edge) o en CPU: con la cuantizacion GGUF q4_k_m el modelo ocupa alrededor de 1,1 GB, por lo que puede ejecutarse con llama.cpp en portatiles o servidores sin GPU dedicada para tareas de asistencia textual.
- Prototipado rapido en notebooks: al entrenarse y caber en una Tesla T4 de 16 GB, es viable ejecutarlo en entornos gratuitos o de bajo coste tipo Google Colab para experimentos de investigacion sobre destilacion.
- Generacion de material didactico STEM en vietnamita: redaccion de enunciados, problemas resueltos y explicaciones de conceptos cientificos basicos, con revision humana obligatoria por el riesgo de alucinacion.
- Base para experimentos de destilacion reproducible: el pipeline documentado (profesor, rejection sampling, LoRA, T4) sirve como referencia metodologica para investigadores que quieran replicar o extender la tecnica a otros pares de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con el profesor VibeThinker-3B o con el modelo base. Tampoco se documentan metricas de latencia o throughput. Cualquier afirmacion sobre la calidad de razonamiento del modelo en relacion con el profesor carece de verificacion publicada.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,4 GB solo para pesos (1.707.657.216 parametros x 2 bytes), mas memoria para el contexto y el runtime.
- VRAM estimada en cuantizacion GGUF q4_k_m: alrededor de 1,1 GB de pesos, apto para GPUs de 4-6 GB.
- Entrenamiento verificado por el autor: 1 unidad Tesla T4 de 16 GB en Google Colab, con unos 38 minutos de entrenamiento y unas 2,5 horas de pipeline completo.
- GPUs recomendadas: Tesla T4, RTX 3060, RTX 4060, RTX 4090 para inferencia holgada; A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas de VRAM usando q4_k_m, e incluso en GPU integradas o CPU con cuantizaciones mas agresivas.
- Opciones de despliegue: transformers (safetensors, version fusionada o adaptador LoRA), llama.cpp, Ollama mediante GGUF, y servidores compatibles con la API de endpoints (etiqueta endpoints_compatible). El soporte en vLLM o TGI no esta documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible permite comparar unicamente con los dos modelos que forman parte del linaje declarado. No se dispone de datos verificados de otras alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Rol en el proyecto | Rendimiento publicado |
|---|---|---|---|---|---|
| Spark-X2.5-1.7B-VibeThinker-VN | 1,7B | 1.024 tokens (entrenamiento) | Apache-2.0 | Modelo final destilado | no disponible |
| WeiboAI/VibeThinker-3B (profesor) | 3B | no disponible | MIT | Fuente de las cadenas de razonamiento | no disponible (en esta informacion) |
| XHToken/Spark-X2.5-1.7B-Base (alumno base) | 1,7B | no disponible | Apache-2.0 | Punto de partida del fine-tuning | no disponible (en esta informacion) |

Alternativas externas como Qwen2.5-1.5B, Llama-3.2-1B o Gemma-2-2B serian comparables por tamano, pero no se incluyen datos de comparacion porque no aparecen en la informacion proporcionada y no deben inventarse cifras.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 1.024 tokens durante el entrenamiento, lo que limita conversaciones largas, documentos extensos y razonamientos con muchas iteraciones. El comportamiento mas alla de ese limite no esta documentado.
- Dataset de entrenamiento muy pequeno: 1.328 muestras en seis dominios, lo que eleva el riesgo de sobreajuste y de cobertura estrecha de temas.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de la calidad del razonamiento ni de la fidelidad respecto al profesor.
- Riesgo de alucinacion: al ser un modelo de 1,7B destilado sobre datos sinteticos y escritos a mano, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en matematicas y logica.
- Cobertura idiomatica limitada a vietnamita e ingles; no hay soporte declarado de castellano ni de otros idiomas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, y los datos generados automaticamente por el profesor pueden heredar sus sesgos, sin que el autor realice analisis al respecto.
- Restricciones de licencia: el modelo es Apache-2.0 y permite uso comercial y derivados, pero exige mantener la atribucion a WeiboAI/VibeThinker-3B (MIT) en el archivo LICENSE, tal como especifica la model card.
- Modelo practicamente sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones de terceros.
- Autor unico sin reputacion consolidada en el ecosistema: conviene tratar las afirmaciones de calidad como no verificadas.
- Fecha de publicacion registrada en 2026, posterior a la ventana habitual de conocimiento, lo que refuerza la necesidad de validacion directa antes de cualquier uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/N14QM/Spark-X2.5-1.7B-VibeThinker-VN
- Modelo profesor: https://huggingface.co/WeiboAI/VibeThinker-3B
- Modelo alumno base: https://huggingface.co/XHToken/Spark-X2.5-1.7B-Base
- Paper de LoRA (referenciado en las etiquetas del modelo, arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper de destilacion a nivel de secuencia (Kim & Rush, 2016), citado en la model card: https://arxiv.org/abs/1606.07947
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, los resultados devueltos corresponden a dominios ajenos a esta ficha (tienda de electronica Conrad) y se descartan por no aportar informacion tecnica.

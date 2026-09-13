# adelwolf5/WooZEP-AI-2B-GGUF

## Resumen

WooZEP-AI-2B-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.5-2B, publicada por el usuario adelwolf5 en HuggingFace. Se trata de un ajuste de identidad y estilo: el autor ha personalizado el modelo base para que adopte el personaje de "WooZEP AI", un asistente conversacional independiente inspirado en las plataformas Woozworld y ZEPETO. No es un modelo entrenado desde cero ni un modelo oficial de ninguna de esas plataformas, tal y como el propio autor declara en la model card.

Tecnicamente, el repo contiene un unico fichero GGUF cuantizado en Q4_K_M, de aproximadamente 1,2 GB, sobre un modelo denso de 1.881.825.088 parametros (unos 1,88 mil millones) segun los datos de safetensors. La arquitectura declarada es Qwen3.5 y la modalidad es exclusivamente texto. El autor indica que la prediccion multi-token (MTP/NextN) del modelo base se desactivo durante la conversion a GGUF.

Su relevancia practica es limitada pero concreta: es un modelo pequeno, ligero y desplegable en CPU, pensado para conversacion casual multilingue en frances, ingles, arabe, cabilio, japones, coreano y chino. Con cero descargas y cero "likes" en el momento de redactar esta ficha, debe considerarse un experimento personal de ajuste y cuantizacion mas que un modelo con validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, segun la model card) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | Frances, ingles, arabe, cabilio (kab), japones, coreano y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`WooZEP-AI-2B-Q4_K_M.gguf`) |
| Modelo base | Qwen/Qwen3.5-2B |
| Tamano del repositorio | 1,3 GB |
| Modalidad | Texto |
| Pipeline | text-generation |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento. La model card indica unicamente que el modelo "esta basado en Qwen3.5-2B y personalizado con una identidad, un estilo conversacional, humor y ejemplos multilingues". No se especifica el volumen de datos de ajuste, la composicion del dataset, ni si se emplearon tecnicas como SFT, RLHF o DPO. Tampoco se detalla si el ajuste se hizo por fine-tuning completo o mediante adaptadores LoRA fusionados.

El unico detalle tecnico concreto aportado es que la funcionalidad MTP/NextN (prediccion de multiples tokens por paso, usada en algunos modelos recientes para acelerar la decodificacion especulativa) se desactivo expresamente durante la conversion a GGUF. La model card tambien recomienda ejecutar la inferencia con el flag `--reasoning off` en `llama-cli`, lo que sugiere que el modelo base incorpora algun modo de razonamiento o cadena de pensamiento que el autor prefiere desactivar para el uso conversacional previsto. No se aporta ninguna innovacion arquitectonica propia: el valor anadido del repo es la personalizacion de estilo y la cuantizacion.

## Capacidades

- Generacion de texto conversacional en formato de chat multi-turno.
- Adopcion de una persona fija ("WooZEP AI"), con un estilo descrito por el autor como amigable, natural, relativamente breve y ocasionalmente humoristico.
- Cobertura multilingue declarada en siete idiomas: frances, ingles, arabe, cabilio, japones, coreano y chino.
- Capacidad potencial de razonamiento heredada del modelo base, aunque el autor recomienda desactivarla (`--reasoning off`) para el uso previsto.
- No hay evidencia en la informacion proporcionada de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso supervisado, vision, audio ni otras modalidades distintas del texto.
- No se documentan capacidades especiales adicionales (modo thinking explicito, grounding, RAG nativo, etc.).

## Casos de uso

- Asistente conversacional embebido en aplicaciones de escritorio o moviles: con 1,2 GB en Q4_K_M puede integrarse en un binario de aplicacion o descargarse bajo demanda, ofreciendo chat local sin coste de API ni envio de datos a terceros.
- Prototipado rapido de interfaces de chat: al ser un GGUF compatible con `llama.cpp`, permite montar un backend conversacional en minutos para validar UX, prompts y flujos antes de migrar a un modelo mayor.
- Despliegue en hardware sin GPU: el modelo cabe holgadamente en CPU y RAM convencionales, por lo que es viable en mini PC, portatiles antiguos, SBC tipo Raspberry Pi 5 o entornos de borde con conectividad intermitente.
- Asistente tematico para comunidades de redes sociales o mundos virtuales: la personalidad predefinida lo hace adecuado como bot de compania o entretenimiento en comunidades de estilo Woozworld o ZEPETO, siempre que no se presente como producto oficial de esas plataformas.
- Generacion de dialogos sinteticos multilingues: su cobertura declarada de arabe y cabilio, poco habitual en modelos de este tamano, permite generar corpus conversacionales de arranque para idiomas con escasez de datos, sujeto a revision humana posterior.
- Practica de idiomas y experimentacion linguistica: el modelo puede mantener conversaciones sencillas en los siete idiomas declarados para ejercicios de lectura o vocabulario, con la advertencia de que el autor reconoce errores en "ciertos idiomas y abreviaturas".
- Filtrado de texto o respuestas plantilla de bajo coste: para tareas de generacion muy acotada (mensajes de bienvenida, respuestas frecuentes, variaciones de texto corto) la relacion coste/latencia de un 2B cuantizado es favorable.
- Base para experimentos de cuantizacion y comparativas: sirve como caso de estudio reproducible de conversion a GGUF y evaluacion de degradacion por cuantizacion frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con el fichero Q4_K_M publicado: del orden de 1,5 a 2,5 GB contando pesos y cache KV para contextos moderados (estimacion a partir de los 1,2 GB de pesos; no verificada por el autor).
- Tamano aproximado de pesos segun cuantizacion (estimation sobre 1,88 mil millones de parametros): F16 en torno a 3,8 GB, Q8_0 en torno a 2,0 GB, Q5_K_M en torno a 1,4 GB, Q4_K_M en torno a 1,2 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM, como GTX 1650, RTX 3050, RTX 4060 o superiores. En GPU de gama alta (RTX 4090, A100, H100) el modelo queda sobredimensionado en cuanto a memoria y solo tendria sentido para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna, y tambien en iGPU con memoria unificada (por ejemplo, Apple Silicon o APU con suficiente RAM asignada).
- Inferencia en CPU: viable en solitario con `llama.cpp`, sin necesidad de GPU.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), Ollama mediante un Modelfile personalizado, LM Studio, koboldcpp y bindings como `llama-cpp-python`. El soporte de GGUF en vLLM y en text-generation-inference es limitado o parcial, por lo que no son las rutas recomendadas para este fichero.
- Latencia y throughput estimados: no disponibles. Dependen por completo del hardware y de la configuracion de contexto.
- Comando de referencia proporcionado por el autor: `./llama-cli -m "WooZEP-AI-2B-Q4_K_M.gguf" --reasoning off`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| WooZEP-AI-2B-GGUF | 1,88 mil millones (denso) | No disponible | Apache 2.0 | GGUF Q4_K_M | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | 1,88 mil millones (denso) | No disponible | No disponible en la informacion proporcionada | safetensors (formato de origen) | HuggingFace |
| Alternativas de la misma categoria (modelos densos de 1-2B en GGUF) | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web no ha devuelto informacion sobre modelos comparables, benchmarks cruzados ni evaluaciones independientes, por lo que no es posible establecer una comparacion cuantitativa fiable frente a otras alternativas de 1 a 2 mil millones de parametros.

## Limitaciones y advertencias

- No es un modelo oficial de Woozworld ni de ZEPETO. El propio autor declara que WooZEP AI es un proyecto independiente y que esas marcas pertenecen a sus respectivos propietarios. Existe riesgo de confusion de marca si se despliega en un contexto publico.
- El autor reconoce explicitamente que el modelo "puede equivocarse en hechos, fechas, ciertos idiomas y ciertas abreviaturas". El riesgo de alucinacion es alto por el reducido tamano del modelo.
- No se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad. Al ser un ajuste de personalidad sobre un 2B sin documentacion de alineamiento, no hay garantia de comportamiento seguro fuera de los flujos conversacionales previstos.
- La calidad del multilingue es desigual: aunque se declaran siete idiomas, el autor no aporta evaluaciones y admite errores en algunos de ellos. El cabilio (kab) y el arabe son los casos de mayor riesgo por disponibilidad limitada de datos en modelos de este tamano.
- No hay informacion sobre la longitud de contexto efectiva, ni sobre si el ajuste o la cuantizacion la reducen respecto al modelo base.
- El formato GGUF es de solo inferencia: no permite fine-tuning directo. Cualquier adaptacion adicional requiere partir del modelo base.
- Licencia Apache 2.0 sobre el artefacto publicado, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-2B antes de un uso comercial, ya que la model card de este repo no la detalla mas alla de la propia declaracion.
- Estado del repositorio: cero descargas y cero valoraciones, sin issues ni validacion de terceros. No es recomendable para produccion sin una evaluacion propia previa.
- La model card esta redactada en frances; no hay documentacion en otros idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adelwolf5/WooZEP-AI-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de llama.cpp (inferencia GGUF): https://github.com/ggml-org/llama.cpp
- La busqueda web realizada no ha devuelto papers, blogs, demos ni repositorios adicionales relacionados con este modelo.

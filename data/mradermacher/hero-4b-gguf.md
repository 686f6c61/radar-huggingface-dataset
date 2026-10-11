# mradermacher/HERO-4B-GGUF

## Resumen

HERO-4B-GGUF es la version cuantizada en formato GGUF del modelo XLearning-SCU/HERO-4B, publicada por el usuario mradermacher. Se trata de un modelo de aproximadamente 4,2 mil millones de parametros, orientado a tareas de agente de programacion (coding agent) y eficiencia de tokens, segun las etiquetas declaradas en el repositorio. La ficha corresponde a una compilacion de pesos cuantizados lista para su uso en entornos de inferencia local, no a un entrenamiento propio.

El repositorio ofrece un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16) e incluye ficheros complementarios mmproj, lo que apunta a capacidades multimodales. El modelo base hace referencia a la licencia de Qwen/Qwen3.5-4B, dato que sugiere familiaridad con dicha familia, aunque la arquitectura concreta no se describe en la informacion disponible.

Su relevancia radica en facilitar el despliegue local del modelo original sin necesidad de hardware de gama alta, dado que las cuantizaciones mas ligeras ocupan entre 2 y 3 GB. Esta dirigido principalmente a un publico de habla inglesa, unico idioma declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los ficheros mmproj sugieren soporte multimodal; el enlace de licencia apunta a Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye tambien en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los datos facilitados indican que HERO-4B se asocia a la etiqueta reinforcement-learning dentro de la libreria transformers, lo que sugiere que el entrenamiento del modelo base pudo incluir tecnicas de aprendizaje por refuerzo orientadas a tareas de agente de programacion y a la eficiencia en el consumo de tokens. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La presencia de ficheros mmproj (multi-modal projection) en el repositorio indica que el modelo admite entrada multimodal, presumiblemente vision, a gestionar mediante el componente proyector. La cuantizacion ha sido realizada por mradermacher con cuantizaciones estaticas; existe tambien una variante con cuantizacion ponderada por imatrix en el repositorio HERO-4B-i1-GGUF. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento en ingles, segun el unico idioma declarado.
- Enfoque de agente de programacion (coding agent): las etiquetas del repositorio lo asocian explicitamente a tareas de codigo.
- Eficiencia de tokens: la etiqueta token-efficiency sugiere un diseno orientado a reducir el consumo de tokens en tareas de agente.
- Capacidad multimodal indicada por la presencia de ficheros mmproj (proyector multimodal), presumiblemente para entrada de imagenes.
- Modelo conversacional (etiqueta conversational).
- No se dispone de informacion sobre soporte de tool calling o function calling.
- No se dispone de informacion sobre capacidades de razonamiento multi-paso mas alla de lo implicito en la etiqueta de agente.

## Casos de uso

- Agente de programacion en local: el modelo puede integrarse como agente de codigo en entornos de desarrollo, ejecutando tareas de generacion y edicion asistida alli donde la etiqueta coding-agent resulta aplicable y sin depender de servicios en la nube.
- Asistencia de codigo en equipos con hardware limitado: las cuantizaciones Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten desplegar el modelo en portatiles y estaciones de trabajo de gama media para autocompletado y revision de fragmentos de codigo.
- Procesamiento multimodal de baja exigencia: gracias a los ficheros mmproj, el modelo puede emplearse en tareas que combinen texto e imagen, como descripcion de capturas o extraccion de informacion de diagramas, siempre que se confirme el soporte real.
- Automatizacion de tareas de agente con restriccion de tokens: la orientacion a token-efficiency resulta adecuada para pipelines de agentes en los que el coste por token o la latencia por paso son criticos.
- Prototipado rapido de asistentes conversacionales: su tamano reducido permite iterar rapidamente sobre dialogos en ingles antes de escalar a modelos de mayor tamano.
- Despliegue en entornos aislados (air-gapped): al distribuirse en GGUF y con licencia apache-2.0, puede ejecutarse en infraestructuras sin conexion externa donde no se permite el envio de datos a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun la cuantizacion (tamano de fichero segun el repositorio):
  - Q2_K: 2,0 GB; Q3_K_S: 2,2 GB; Q3_K_M: 2,4 GB; Q3_K_L: 2,5 GB; IQ4_XS: 2,6 GB.
  - Q4_K_S: 2,7 GB; Q4_K_M: 2,8 GB; Q5_K_S: 3,1 GB; Q5_K_M: 3,2 GB.
  - Q6_K: 3,6 GB; Q8_0: 4,6 GB; f16: 8,5 GB.
  - Proyector multimodal: mmproj-Q8_0 0,1 GB; mmproj-f16 0,1 GB.
  - A estos valores hay que anadir el espacio para el contexto y el estado de la KV cache, no cuantificado en la informacion disponible.
- GPU recomendadas: practicamente cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5 (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para f16 conviene disponer de al menos 10-12 GB de VRAM (RTX 3080/4080, RTX 4090). Para despliegues en servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de tarjetas actuales con 6-8 GB o mas para las cuantizaciones recomendadas; las variantes Q2 y Q3 pueden caber incluso en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. Para el modelo base en safetensors serian aplicables vLLM o TGI, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos comparativos de rendimiento, contexto ni parametros frente a alternativas de la misma categoria. Como referencia, el repositorio enlaza la licencia del modelo Qwen/Qwen3.5-4B como origen del modelo base, pero no se detallan sus especificaciones.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion: no se han publicado evaluaciones; al tratarse de un modelo de 4,2 B de parametros, es previsible una mayor tasa de error en tareas de razonamiento complejo que en modelos de mayor tamano.
- Limitacion de idioma: solo se declara soporte de ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto: no disponible; conviene verificarla antes de usarla en tareas con historiales largos.
- Licencia: apache-2.0, permisiva para uso comercial. No obstante, el modelo base enlaza la licencia de Qwen3.5-4B, por lo que conviene revisar dicha licencia para confirmar compatibilidad.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio repositorio etiqueta Q3_K_M como "lower quality".
- Soporte multimodal: la existencia de ficheros mmproj sugiere vision, pero la informacion disponible no detalla su alcance ni su integracion con runners concretos.
- Es una cuantizacion de terceros: la responsabilidad sobre el comportamiento del modelo recae en el modelo base XLearning-SCU/HERO-4B, no en el repositorio de cuantizacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/HERO-4B-GGUF
- Repositorio con cuantizacion imatrix: https://huggingface.co/mradermacher/HERO-4B-i1-GGUF
- Modelo base: https://huggingface.co/XLearning-SCU/HERO-4B
- Licencia referenciada del modelo base (Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Pagina de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Pagina de resumen del modelo: https://hf.tst.eu/model#HERO-4B-GGUF

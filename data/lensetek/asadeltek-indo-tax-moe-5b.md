# lensetek/asadeltek-indo-tax-moe-5b

## Resumen

asadeltek-indo-tax-moe-5b es un modelo de lenguaje publicado por lensetek en Hugging Face. Por su nombre y sus caracteristicas tecnicas, se trata de un modelo con arquitectura de mezcla de expertos (MoE) orientado a tareas conversacionales y con un enfasis declarado en contenido fiscal indonesio ("indo-tax"). El repositorio tiene 4.891.698.176 parametros totales segun los pesos en safetensors, lo que justifica la denominacion comercial de "5B", y ocupa 3,0 GB en el repositorio.

El modelo se distribuye principalmente en formato GGUF, lo que sugiere que esta pensado para inferencia local en CPU o GPU de consumo mediante llama.cpp u Ollama, mas que para despliegues de servidor con vLLM o TGI. La ficha de Hugging Face lo etiqueta como "endpoints_compatible" y "conversational", lo que indica que esta preparado para el formato de chat y para su uso a traves de la infraestructura de Inference Endpoints.

La informacion publica disponible es muy limitada: no se especifican licencia, idiomas soportados, longitud de contexto ni datos de entrenamiento. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo dia (26 de noviembre de 2026), lo que apunta a una publicacion reciente y sin validacion comunitaria. Esta ficha recoge exclusivamente los datos verificables y marca como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun el nombre del modelo; detalles no disponibles |
| Parametros totales | 4.891.698.176 (aprox. 4,89 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en GGUF; niveles concretos no especificados) |
| Idiomas soportados | no disponible (el nombre sugiere indonesio; no confirmado) |
| Licencia | no disponible |
| Formato de pesos | GGUF (tamano del repo: 3,0 GB) |

## Arquitectura y entrenamiento

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 5.000 millones de parametros totales, cifra coherente con los 4.891.698.176 parametros registrados en los safetensors. No se ha publicado informacion sobre el numero de expertos, el numero de parametros activos por token, la funcion de enrutamiento ni el tipo de atencion utilizada. Tampoco consta si emplea atencion lineal, decodificacion especulativa u otras optimizaciones de inferencia.

No hay datos publicos sobre el corpus de entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste supervisado. El sufijo "indo-tax" sugiere una especializacion en dominio fiscal indonesio, pero no se documenta el proceso de ajuste ni la procedencia de los datos. El tamano del repositorio (3,0 GB) es consistente con una unica cuantizacion GGUF de un modelo de ~4,9 B de parametros, lo que apunta a una distribucion ligera orientada a inferencia local.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" indica soporte para dialogos multi-turno en formato de chat.
- Especializacion de dominio: el nombre "indo-tax" sugiere capacitacion o ajuste sobre contenido fiscal indonesio, aunque no se detalla el alcance ni la calidad de esta especializacion.
- Idiomas: no se confirma ningun idioma oficialmente; por el nombre cabe esperar indonesio, pero no hay verificacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (vision, audio): no disponible; no se mencionan en la informacion.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistencia conversacional en indonesio: si se confirma el soporte de ese idioma, el modelo podria emplearse en chatbots de atencion al usuario para el mercado indonesio, aprovechando su formato conversacional y su despliegue ligero en GGUF.
- Consultas sobre normativa fiscal indonesia: dado el sufijo "indo-tax", un uso plausible es la respuesta a preguntas frecuentes sobre impuestos en Indonesia; requeriria validacion humana por el riesgo de alucinacion en un dominio regulado.
- Prototipado local en equipos de desarrollo: al distribuirse en GGUF con 3,0 GB, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita pruebas rapidas de integracion.
- Educacion y formacion fiscal: podria servir como apoyo en materiales didacticos sobre tributacion indonesia, siempre con supervision de un experto y advertencias claras sobre la precision.
- Despliegue en Inference Endpoints: la etiqueta "endpoints_compatible" permite subirlo a la infraestructura gestionada de Hugging Face para pruebas de integracion con APIs compatibles con OpenAI.
- Filtrado y clasificacion de consultas: en un pipeline de atencion al cliente, podria preclasificar consultas fiscales antes de derivarlas a un sistema especializado o a un humano.
- Experimentacion academica con modelos MoE pequenos: util como base para estudiar el comportamiento de arquitecturas MoE de ~5 B en tareas de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos GGUF de 3,0 GB, una cuantizacion de 4 bits requiere aproximadamente 3-4 GB de VRAM o RAM; una cuantizacion de 8 bits rondaria los 5-6 GB, y FP16 superaria los 9-10 GB. Estos calculos son estimaciones a partir del tamano del repositorio, no datos oficiales.
- GPU recomendadas: para cuantizaciones ligeras, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB son suficientes; para FP16, una RTX 4090 de 24 GB o una A100 de 40 GB ofrecen margen amplio.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM para cuantizaciones de 4-8 bits; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; TGI y vLLM requeririan conversion a safetensors y no estan confirmados; Hugging Face Inference Endpoints por la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, idiomas) que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de licencia publicada: sin licencia explicita no se puede determinar si el uso comercial esta permitido; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Falta de documentacion: no hay model card con detalles de entrenamiento, contexto, idiomas ni evaluacion, lo que impide validar su calidad de forma objetiva.
- Riesgo de alucinacion elevado en dominio fiscal: un modelo de ~5 B ajustado sobre normativa tributaria puede generar respuestas incorrectas con apariencia de veracidad; en un ambito regulado esto es especialmente peligroso.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos linguisticos, culturales o de otro tipo.
- Cobertura idiomatica incierta: no se confirma el soporte de indonesio ni de otros idiomas; el rendimiento fuera de ese ambito es impredecible.
- Contexto desconocido: se desconoce la ventana de contexto, lo que limita el diseno de aplicaciones con documentos largos.
- Madurez nula: 0 descargas y 1 like indican que el modelo no ha sido validado por la comunidad; no se recomienda su uso en produccion sin una evaluacion propia.
- Parametros activos desconocidos: al no conocerse el numero de parametros activos, no se puede estimar con precision el coste real de inferencia por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lensetek/asadeltek-indo-tax-moe-5b
- Perfil del autor: https://huggingface.co/lensetek
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

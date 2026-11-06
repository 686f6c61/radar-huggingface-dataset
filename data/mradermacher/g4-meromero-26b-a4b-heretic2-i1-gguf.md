# mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo EternalDragon/G4-MeroMero-26B-A4B-Heretic2. Se trata de una variante "heretic" (es decir, con el alineamiento de seguridad reducido o eliminado) orientada a roleplay y conversacion sin restricciones, construida sobre una base de la familia Gemma 4. El repositorio incluye unicamente ficheros GGUF y un fichero imatrix, no los pesos originales en safetensors.

El modelo base declara 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y la nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con unos 4 mil millones de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. La model card indica que es un modelo de vision, con ficheros mmproj alojados en el repositorio estatico complementario.

La relevancia de esta ficha es practica: permite ejecutar en hardware de consumo un modelo de ~25B con contexto de roleplay sin censura, a costa de asumir los riesgos de un modelo desalineado y de una documentacion tecnica muy escasa. La licencia declarada es Apache 2.0, lo que facilita el uso comercial segun los terminos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 4; nomenclatura "A4B" sugiere MoE con ~4B activos (no confirmado) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); fichero imatrix incluido |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura y la etiqueta "gemma4" se infiere una base de la familia Gemma 4 de Google, y el sufijo "A4B" apunta a una configuracion de mezcla de expertos con aproximadamente 4 mil millones de parametros activos sobre un total de 25,2B. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento. El calificativo "heretic" indica que el modelo ha sido sometido a un proceso de ablacion o reentrenamiento destinado a eliminar los rechazos y el comportamiento excesivamente cauteloso del modelo original.

La aportacion tecnica de este repositorio concreto es la cuantizacion. mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (importancia matrix), una tecnica que ajusta la precision por tensor segun su impacto en la perplexidad, mejorando la calidad de las cuantizaciones de baja tasa de bits frente a las cuantizaciones estaticas. El repositorio estatico paralelo contiene ademas los ficheros mmproj necesarios para el procesamiento de vision. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de roleplay multi-turno, orientada a personajes y narrativa sin filtros de contenido.
- Capacidad de vision: la model card indica explicitamente que es un modelo de vision, con ficheros mmproj en el repositorio estatico.
- Razonamiento y generacion de codigo: no documentado de forma especifica en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo esta afinado especificamente para conversacion de personajes sin censura, por lo que encaja en plataformas de entretenimiento narrativo y juegos de rol por texto donde se requiere libertad creativa y coherencia de personaje a lo largo de sesiones largas.
- Prototipado de chatbots sin filtros para investigacion: util para estudiar el comportamiento de modelos desalineados, medir tasas de toxicidad o comparar respuestas frente a variantes alineadas en entornos controlados.
- Generacion de narrativa y guiones: adecuado para escritura creativa de ficcion adulta o generos donde los modelos alineados suelen rechazar peticiones, con cuantizaciones Q4_K_M o Q5_K_M que preservan calidad suficiente en hardware de consumo.
- Analisis de imagenes con descripcion libre: gracias a los ficheros mmproj, puede emplearse para tareas de vision por computador en local, como etiquetado de imagenes o descripcion de escenas, sin depender de APIs externas.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ2/IQ3 permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM mediante llama.cpp u Ollama, habilitando asistentes conversacionales privados sin conexion.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye el fichero imatrix y multiples variantes, lo que lo convierte en un banco de pruebas para comparar perplexidad y calidad entre tipos de cuantizacion sobre una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, un modelo de ~25B ocupa aproximadamente 15-16 GB; las variantes IQ2/IQ3 quedan en el rango de 8-11 GB; Q6_K se acerca a 21-22 GB. Estas cifras son estimaciones basadas en el tamano de parametros, no datos publicados.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M/Q6_K; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M; GPUs de 12 GB (RTX 3060, 4070) para IQ3/IQ2.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM usando cuantizaciones IQ2/IQ3, y en 16-24 GB con Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. Al tratarse de una posible arquitectura MoE con ~4B activos, el throughput por token deberia ser notablemente superior al de un denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2 (este) | ~25,2B totales | no disponible | Apache 2.0 | Variante heretic sin censura, vision, solo ingles |
| Modelo base EternalDragon/G4-MeroMero-26B-A4B-Heretic2 | ~25,2B totales | no disponible | Apache 2.0 | Pesos originales en safetensors; referencia de calidad |
| Gemma 4 (familia oficial) | variable | no disponible | Gemma license | Alineado y con filtros; no permite el mismo tipo de contenido |
| Variantes heretic de otros tamanos (p. ej. Llama 3.x heretic) | 8B-70B | variable | variable | Alternativas de roleplay sin censura, pero sin vision en muchos casos |

La comparativa se limita a categorias porque no hay datos de rendimiento publicados para este modelo concreto.

## Limitaciones y advertencias

- Modelo "uncensored": el alineamiento de seguridad ha sido reducido deliberadamente, por lo que puede generar contenido toxico, violento, sexual o ilegal sin rechazo. No es apto para produccion orientada al publico general sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: los procesos de ablacion de alineamiento suelen degradar la fiabilidad factual; no se debe usar como fuente de informacion.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Documentacion escasa: la model card es una plantilla generica de cuantizacion sin detalles sobre entrenamiento, evaluacion o limitaciones del autor original.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre el cumplimiento de las leyes aplicables.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Vision: los ficheros mmproj no estan en este repositorio, sino en el estatico; hay que descargarlos por separado para usar la capacidad multimodal.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Pagina de descargas del autor: https://hf.tst.eu/model#G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

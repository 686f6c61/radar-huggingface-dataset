# raincandy-u/MacroStories

## Resumen

MacroStories es un Transformer autorregresivo de 19.969 parametros publicado por el usuario raincandy-u en Hugging Face. Su tesis es llevada al limite: demostrar que un modelo de lenguaje puede escribir un cuento infantil completo en ingles (de 100 a 300 palabras) partiendo de un unico token de inicio, con un coste de almacenamiento de 81.364 bytes en FP32, menos que muchas imagenes PNG. Parte directamente del trabajo de TinyStories (arXiv:2305.07759), que ya mostro que un Transformer pequeno entrenado sobre una distribucion adecuada de datos sinteticos puede generar texto coherente, y reduce la escala en un factor de aproximadamente 50 respecto a un modelo de un millon de parametros.

Arquitectonicamente es un Transformer decoder peculiar: un unico bloque decoder aplicado cuatro veces con pesos compartidos (recurrent depth), dimension oculta de 32, vocabulario de 378 tokens a nivel de palabra y atencion con 2 cabezas de consulta y 1 de clave/valor. La matriz de embedding de entrada y la proyeccion de salida tambien se comparten y concentran el 60,6% de los parametros totales. El entrenamiento se realizo desde inicializacion aleatoria sobre datos sinteticos generados por un Gemma local servido con vLLM, y fue orquestado de forma autonoma por un agente (Codex) a lo largo de 38 rondas experimentales.

Su relevancia actual es fundamentalmente experimental y divulgativa: sirve como banco de pruebas extremo para tecnicas de comparticion de pesos, recurrencia de profundidad y generacion de datos sinteticos con vocabulario restringido. No es un modelo de proposito general: no tiene conocimiento del mundo, no sigue instrucciones, no conversa y no responde preguntas factuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autorregresivo con recurrencia de profundidad (1 bloque aplicado 4 veces con pesos compartidos) |
| Parametros totales | 19.969 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la generacion de ejemplo usa max_new_tokens=2047; el contexto efectivo no se declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | en (solo ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension oculta | 32 |
| Dimension intermedia SwiGLU | 48 |
| Cabezas de atencion | 2 cabezas de consulta, 1 cabeza de clave/valor; dimension por cabeza 16 |
| Codificacion posicional | RoPE |
| Normalizacion | RMSNorm antes y despues de atencion y FFN, mas RMSNorm final de salida |
| Vocabulario | 378 tokens WordLevel |
| Tamano de pesos | 81.364 bytes (FP32) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 12 / 10 |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La arquitectura se aparta del Transformer convencional en varios puntos. Solo existe un bloque decoder, cuyos pesos se reutilizan en cuatro pasadas secuenciales; el calculo de la perdida se hace sobre la cuarta pasada recurrente. Un mecanismo de "value residual" hace que, en las pasadas 2 a 4, los vectores de valor actuales se mezclen a partes iguales con los de la primera pasada, lo que ayuda a preservar informacion de las representaciones iniciales. Ademas, la matriz de embedding de entrada y la proyeccion de salida son la misma matriz, que con 12.096 parametros representa el 60,6% del total. La atencion usa 2 cabezas de consulta y 1 de clave/valor con RoPE, y las proyecciones usan SwiGLU con dimension intermedia 48. Existe tambien una puerta de salida temprana ("early-exit gate") de 33 parametros que figura como inactiva. El desglose de parametros es: 12.096 en embedding/proyeccion compartida, 3.072 en proyecciones de atencion, 4.608 en proyecciones SwiGLU, 160 en RMSNorm y 33 en la puerta inactiva.

El entrenamiento parte de inicializacion aleatoria, con una implementacion adaptada del modelo ByteDance/Ouro (arquitecturas recurrentes de pesos compartidos). Los datos son completamente sinteticos: cuentos generados por un Gemma local servido a traves de vLLM, con restricciones de vocabulario y marcadores numerados para personajes y objetos. El agente Codex ejecuto el flujo completo de forma autonoma (generacion de datos, formulacion de hipotesis, pruebas y refinamiento) durante 38 rondas hasta la seleccion del modelo final, revisando la correccion gramatical, la resolucion del objetivo narrativo y la consistencia de personajes y objetos. Se entreno con entropia cruzada de siguiente token sobre la cuarta pasada recurrente, usando Muon para las matrices lineales bidimensionales del decoder y AdamW para el resto de parametros. La configuracion fue de 4.000 actualizaciones, batch de 32, tasa de aprendizaje 0,003 con decaimiento coseno y 5% de warmup, semilla de entrenamiento 456, sobre una unica RTX 3090.

## Capacidades

- Generacion de cuentos infantiles completos en ingles a partir de un unico token BOS, con estructura narrativa de planteamiento, acciones y desenlace.
- Longitud tipica de salida de 100 a 300 palabras.
- Narracion con personajes numerados (mapeados a Alex, Robin y Casey por el helper `render_story.py`) y objetos consistentes a lo largo del relato.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fuera del propio hilo narrativo.
- No soporta conversacion multi-turno ni seguimiento de instrucciones.
- No tiene conocimiento del mundo ni capacidad de responder preguntas factuales.
- Capacidad multilingue: nula; el modelo solo maneja ingles y su vocabulario esta limitado a 378 tokens a nivel de palabra.
- No dispone de modo "thinking", vision, audio ni ninguna otra modalidad.

## Casos de uso

- Generacion de datos sinteticos para preentrenamiento: los cuentos producidos pueden emplearse como corpus de dominio estrecho para estudiar como afecta la distribucion de datos a modelos de juguete, replicando la metodologia de TinyStories en un regimen de 20.000 parametros.
- Experimentacion academica sobre recurrencia de profundidad: al compartir un unico bloque aplicado cuatro veces, es un sujeto ideal para medir el efecto del weight sharing y del "value residual" en la calidad del texto generado.
- Docencia y divulgacion de arquitecturas Transformer: con 19.969 parametros y 81 KB de pesos, el modelo completo cabe en una diapositiva o en un notebook y se puede entrenar o inspeccionar de principio a fin en una clase.
- Pruebas de integracion continua en librerias de inferencia: sirve como modelo de humo (smoke test) para verificar que versiones nuevas de transformers, safetensors o runtimes de decodificacion cargan y generan sin romperse, con un coste de computo despreciable.
- Validacion de tecnicas de decodificacion: al usar muestreo con temperatura 0,5 y top_p 0,9 y admitir `use_cache`, permite comparar estrategias de decodificacion especulativa o de cache en un escenario con vocabulario minimo.
- Despliegue en hardware embebido o microcontroladores: con menos de 100 KB de pesos en FP32, es viable ejecutarlo en dispositivos sin GPU dedicada, como Raspberry Pi o placas con decenas de KB de RAM, para demostrar inferencia local de extremo a extremo.
- Educacion infantil y generacion de plantillas narrativas: el helper de renderizado permite transformar los marcadores numericos en nombres legibles, de modo que la salida puede usarse como semilla o borrador de cuentos para aplicaciones infantiles, siempre con supervision humana.
- Estudio de compresion extrema de modelos: la distribucion de parametros (60,6% concentrado en la matriz compartida) ofrece un caso de referencia para investigar tecnicas de cuantizacion y poda en regimenes de tamano minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas estandar equivalentes). La unica evaluacion facilitada por los autores es una revision cualitativa sobre 100 cuentos generados:

| Criterio | Cuentos que lo cumplen (sobre 100) |
|---|---|
| Objetivo resuelto mediante acciones relevantes y un desenlace | 98 |
| Sin errores gramaticales en una lectura completa | 80 |
| Personajes y objetos consistentes | 91 |
| Longitud entre 100 y 300 palabras | 82 |
| Los cuatro criterios simultaneamente | 65 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Los pesos en FP32 ocupan 81.364 bytes; incluso con estados de cache y activaciones, el consumo es despreciable frente a cualquier GPU moderna.
- GPU recomendadas: cualquiera. El modelo se entreno en una unica RTX 3090, pero la inferencia funciona igualmente en GPUs integradas, en CPU y en hardware embebido.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, y tambien en CPU sin aceleracion, en Raspberry Pi y en placas con memoria del orden de kilobytes.
- Opciones de despliegue: transformers (version 4.55.0 segun el autor) con `trust_remote_code=True`, y requiriendo `safetensors>=0.4.3`. El modelo usa codigo personalizado (`custom_code`), por lo que no es compatible directamente con servidores que solo admitan arquitecturas registradas en la libreria, salvo que se anada soporte explicito. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacroStories | 19.969 | no disponible | 65/100 cuentos cumplen los cuatro criterios (evaluacion propia) | no disponible | Hugging Face, requiere `trust_remote_code` |
| TinyStories (referencia metodologica, arXiv:2305.07759) | orden de 1M a 33M segun las variantes derivadas | no disponible | no disponible en esta ficha | no disponible | modelos derivados publicados por terceros |
| ByteDance/Ouro-1.4B (base de la implementacion) | 1.400 millones | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

La comparacion relevante es conceptual: MacroStories opera dos ordenes de magnitud por debajo de las variantes derivadas de TinyStories y tres por debajo de Ouro-1.4B, sacrificando por completo el uso general (conocimiento del mundo, instrucciones, conversacion) a cambio de coherencia narrativa en un dominio sintetico muy estrecho. No se dispone de cifras comparativas homogeneas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el modelo no tiene conocimiento del mundo ni capacidad de seguir instrucciones; no admite preguntas factuales, conversacion ni redaccion sobre temas arbitrarios.
- Sesgos conocidos: no disponibles. Al entrenarse exclusivamente con cuentos sinteticos generados por un Gemma local, hereda las caracteristicas y posibles sesgos de ese generador y de las restricciones de vocabulario aplicadas, pero no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido habitual (no afirma hechos), pero si puede producir incoherencias narrativas, personajes u objetos duplicados o errores gramaticales. La evaluacion del autor cifra en un 20% los cuentos con algun error gramatical y en un 35% los que no cumplen simultaneamente los cuatro criterios de calidad.
- Limitaciones de idioma: solo ingles, con un vocabulario de 378 tokens a nivel de palabra. Cualquier entrada o peticion fuera de esa distribucion producira salidas degeneradas.
- Limitaciones de contexto: la longitud de contexto no esta documentada. El ejemplo oficial usa hasta 2.047 tokens nuevos, pero no se especifica el maximo soportado.
- Restricciones de licencia: la licencia no esta indicada en la model card ni en los metadatos, por lo que no se puede asumir permiso para uso comercial. Es necesaria la confirmacion explicita del autor antes de cualquier uso en produccion.
- Codigo personalizado: el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio. Conviene auditar el codigo antes de cargarlo en entornos sensibles.
- Madurez del artefacto: 12 descargas y 10 likes, publicado y actualizado el mismo dia (2026-10-07). Es un experimento de investigacion, no un componente listo para produccion.
- Aviso adicional: la model card se refiere al modelo con pronombres femeninos ("She") de forma consistente; es una eleccion estilistica del autor sin implicacion tecnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raincandy-u/MacroStories
- Paper de TinyStories: https://arxiv.org/abs/2305.07759
- Modelo base de la implementacion, ByteDance/Ouro-1.4B: https://huggingface.co/ByteDance/Ouro-1.4B
- Arbol de ficheros de Ouro empleado como referencia: https://huggingface.co/ByteDance/Ouro-1.4B/tree/574fa66cb8bf5abdc979642d01cf2b79b16bfab1
- Helper de renderizado de cuentos (`render_story.py`): https://huggingface.co/raincandy-u/MacroStories/blob/main/render_story.py

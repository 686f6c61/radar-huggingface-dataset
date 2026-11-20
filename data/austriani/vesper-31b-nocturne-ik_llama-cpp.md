# Austriani/Vesper-31B-Nocturne-ik_llama.cpp

## Resumen

Vesper-31B-Nocturne-ik_llama.cpp es una cuantizacion GGUF del modelo base ReadyArt/Vesper-31B-Nocturne, publicada por el usuario Austriani. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos a formatos cuantizados (etiquetados como iqk y trellis-quant) especificamente optimizados para el motor de inferencia ik_llama.cpp, un fork de llama.cpp orientado a rendimiento en CPU y GPU. El modelo cuenta con 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y esta orientado a generacion de texto conversacional, con enfasis declarado en roleplay, ficcion oscura y narrativa de terror erotico sin censura.

La relevancia de esta publicacion es doble. Por un lado, demuestra el ecosistema de cuantizacion de tercera generacion en torno a ik_llama.cpp, con calibracion mediante imatrix (v3-calibration) para preservar calidad en niveles de compresion agresivos. Por otro, ofrece una via de despliegue local de un modelo de ~31B en hardware de consumo, algo inviable con pesos en precision completa. La model card esta dominada por elementos de presentacion (HTML y CSS embebidos) y dedica poco espacio a especificaciones tecnicas verificables, por lo que buena parte de los datos de esta ficha proceden de los metadatos de Hugging Face y no de documentacion del autor.

El modelo solo declara soporte para ingles y esta marcado como no apto para todas las audiencias (not-for-all-audiences). La licencia declarada es Apache 2.0, aunque la naturaleza del contenido y la cadena de modelos base merecen cautela antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; los tags sugieren una base de la familia Gemma, sin confirmar) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF cuantizado; el autor menciona iqk, trellis-quant, imatrix y v3-calibration, sin detallar los niveles concretos (Q4, Q5, IQ3, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria ik_llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ReadyArt/Vesper-31B-Nocturne en la documentacion proporcionada. Los tags incluyen "gemma-4", lo que sugiere un linaje basado en la familia Gemma, pero no se confirma ni el tipo de transformer, ni el numero de capas, ni la dimension de atencion. Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste fino supervisado.

Lo que si describe el autor es el proceso de cuantizacion: se ha aplicado una calibracion imatrix de tercera version (v3-calibration) junto con un esquema denominado trellis-quant, cuyo objetivo es reducir la perdida de calidad en pesos comprimidos. Esta tecnica es habitual en el ecosistema llama.cpp e ik_llama.cpp: se calcula una matriz de importancia a partir de un corpus de calibracion y se usa para ponderar el error de cuantizacion por capa. El resultado es un conjunto de ficheros GGUF que el motor ik_llama.cpp puede cargar directamente.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en narrativa y dialogo.
- Roleplay y ficcion oscura: el modelo esta ajustado y etiquetado explicitamente para este dominio.
- Escritura creativa de terror erotico y contenido para adultos sin censura (tag "uncensored").
- Generacion de texto en ingles; no se declara soporte multilingue.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que indica que puede servirse mediante una API compatible con el esquema de Hugging Face.

## Casos de uso

- Roleplay conversacional local: el modelo puede mantener dialogos de personaje prolongados en ingles, con coherencia de tono, gracias a su naturaleza conversacional y a su ajuste especifico para este dominio. Es adecuado para prototipos de videojuegos narrativos o chatbots de personaje.
- Escritura de ficcion oscura y terror: sirve como asistente de redaccion para autores que trabajan genero de terror o narrativa adulta, donde los modelos censurados suelen rechazar peticiones.
- Generacion de guiones para contenido interactivo: util en el diseno de arboles de dialogo ramificados para experiencias de ficcion interactiva, con el modelo produciendo variantes de una escena segun el estado narrativo.
- Experimentacion con cuantizacion en ik_llama.cpp: el propio repositorio funciona como caso de estudio para evaluar la calidad de la calibracion imatrix v3 y trellis-quant frente a cuantizaciones estandar, comparando perplejidad y coherencia en textos largos.
- Despliegue local en hardware de consumo: al estar en GGUF, puede ejecutarse en estaciones de trabajo con GPU de gama alta o incluso en CPU con suficiente RAM, sin depender de servicios en la nube, lo que resulta util para contenido sensible que no debe salir del equipo.
- Investigacion sobre sesgos y seguridad en modelos sin censura: permite estudiar el comportamiento de un modelo deliberadamente no alineado para tareas de red teaming y evaluacion de riesgos, en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo denso de ~30,7B en GGUF, una cuantizacion de 4 bits ronda los 17-19 GB de pesos, una de 5 bits los 21-23 GB y una de 8 bits los 32-34 GB; estas cifras son estimaciones de calculo, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria alojar cuantizaciones de 4-5 bits; una A100 40/80 GB o una H100 permitirian niveles de 8 bits o superiores con comodidad.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) con cuantizaciones de 4 bits, siempre que el contexto utilizado sea moderado; no confirmado por el autor.
- Opciones de despliegue: ik_llama.cpp es el motor objetivo declarado. Al ser formato GGUF, otros motores compatibles con GGUF (llama.cpp, Ollama, LM Studio) podrian cargarlo, aunque las optimizaciones especificas de ik_llama.cpp no se aprovecharian del mismo modo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparacion rigurosa. Se ofrece una comparacion estructural limitada:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vesper-31B-Nocturne-ik_llama.cpp | ~30,7B | no disponible | GGUF (ik_llama.cpp) | apache-2.0 | Cuantizacion de ReadyArt/Vesper-31B-Nocturne, orientada a roleplay y ficcion oscura |
| ReadyArt/Vesper-31B-Nocturne | ~30,7B (presumiblemente) | no disponible | no disponible | no disponible | Modelo base del que deriva esta cuantizacion |
| Alternativas de ~30B en GGUF | no disponible | no disponible | GGUF | variable | No se identifican en la informacion proporcionada modelos comparables con datos verificables |

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como NSFW y "not-for-all-audiences"; no es apto para aplicaciones dirigidas a menores ni para entornos sin moderacion.
- Sesgos: no hay documentacion sobre sesgos de genero, raza o ideologia; al ser un modelo sin censura, es probable que reproduzca y amplifique estereotipos presentes en sus datos de entrenamiento.
- Alucinacion: no se han publicado evaluaciones de factualidad; en tareas de conocimiento general el riesgo de invencion es alto y no debe usarse como fuente de hechos.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto: se desconoce la ventana de contexto, lo que impide planificar aplicaciones que dependan de documentos largos.
- Licencia: aunque se declara Apache 2.0, la cadena de modelos base y el posible linaje Gemma introducen incertidumbre sobre las obligaciones reales de atribucion y uso comercial; conviene verificar la licencia del modelo base antes de produccion.
- Soporte del motor: esta optimizado para ik_llama.cpp; otros motores GGUF pueden cargarlo, pero sin garantias de compatibilidad con los esquemas de cuantizacion propietarios (trellis-quant, iqk).
- Documentacion escasa: la model card no detalla niveles de cuantizacion, contexto ni arquitectura, lo que dificulta la planificacion de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Austriani/Vesper-31B-Nocturne-ik_llama.cpp
- Modelo base: https://huggingface.co/ReadyArt/Vesper-31B-Nocturne
- ik_llama.cpp (repositorio del motor): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada

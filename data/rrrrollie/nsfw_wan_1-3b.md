# rrrrollie/NSFW_Wan_1.3b

# Ficha tecnica: NSFW Wan 1.3b T2V

## Resumen

NSFW Wan 1.3b T2V es un ajuste fino (fine-tune) del modelo de generacion de video texto-a-video Wan-AI/Wan2.1-T2V-1.3B, publicado por el usuario rrrrollie en HuggingFace. Su proposito declarado es actuar como herramienta de investigacion y creacion capaz de generar clips cortos de video a partir de descripciones en lenguaje natural dentro del ambito de contenido para adultos (NSFW). El modelo conserva la arquitectura de transformer texto-a-video del modelo base y sus 1.300 millones de parametros, y ha sido reentrenado para cubrir un espectro amplio de escenarios, esteticas y acciones propias de ese dominio.

El interes tecnico del repositorio reside en la documentacion detallada de su proceso de entrenamiento y de sus fallos. El autor describe dos ejecuciones: una original en dos fases (epocas 1-10 solo con imagenes, epocas 11-20 solo con video) que sufrio un colapso de calidad con artefactos de anatomia ("body horror") a partir de la epoca 3, y una segunda ejecucion revisada de epoca unica sobre un conjunto mixto de 30.000 clips de video y 20.000 imagenes fijas, cuyo resultado son los checkpoints experimentales `wan_1.3B_exp_e1` a `wan_1.3B_exp_e14`. El autor recomienda `wan_1.3B_exp_e14.safetensors` como checkpoint de uso general y para entrenar LoRAs.

Se trata de un modelo de nicho con escasa validacion externa: en el momento de la consulta acumula 0 descargas y 0 likes, el repositorio ocupa 105,4 GB (coherente con la publicacion de decenas de checkpoints) y no se han publicado resultados de benchmarks. Su relevancia es, por tanto, la de un caso de estudio sobre ajuste fino de modelos de difusion de video y sobre los problemas practicos de olvido catastrofico al especializar un modelo generativo en un dominio concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer texto-a-video (segun la model card); modelo base de difusion Wan 2.1 |
| Parametros totales | 1.300 millones (1,3 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en `safetensors`; no se documentan versiones GGUF ni fp8) |
| Idiomas soportados | No disponible; las descripciones de entrenamiento provienen de subreddits en ingles, por lo que el prompting se espera en ese idioma |
| Licencia | CreativeML OpenRAIL-M (etiqueta `creativeml-openrail-m`) |
| Formato de pesos | `safetensors` |
| Modelo base | Wan-AI/Wan2.1-T2V-1.3B |
| Tipo de tarea | Text-to-video (T2V) |
| Tamano del repositorio | 105,4 GB |
| Fecha de publicacion | 27 de septiembre de 2026 (creacion y ultima actualizacion identicas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura unicamente como "Text-to-Video Transformer Architecture" con 1.300 millones de parametros, sin detallar el numero de bloques, la dimension del modelo, el codificador de texto ni el decodificador VAE. El modelo es un fine-tune del checkpoint Wan2.1-T2V-1.3B de Wan-AI, por lo que hereda la topologia, el tokenizador y el espacio latente de dicho modelo base; la informacion proporcionada no especifica mas detalles arquitectonicos.

En cuanto al entrenamiento, se distinguen dos ejecuciones. La original siguio un esquema de dos fases: las epocas 1-10 se entrenaron principalmente sobre un gran conjunto de imagenes NSFW (con buen detalle y estilo, pero poca capacidad de movimiento nativa y degradacion de calidad a partir de la epoca 3), y las epocas 11-20 se entrenaron exclusivamente con video, aportando coherencia temporal. La ejecucion revisada abandono esa separacion y entreno en una sola pasada sobre un conjunto mixto de 30.000 clips de video y 20.000 imagenes fijas de forma simultanea, con una tasa de aprendizaje mas conservadora, lotes mas pequenos y un calendario de entrenamiento mas corto; segun el autor, esta regularizacion espacial constante evita la deriva anatomica y el colapso de calidad. Los datos de la primera fase se obtuvieron de las 1.000 publicaciones mas destacadas de aproximadamente 1.250 subreddits NSFW distintos, y las descripciones (captions) reutilizan las convenciones de etiquetado de esas comunidades; el repositorio incluye un fichero `prompting-guide.json` con un analisis de palabras clave y frases frecuentes. No se documenta el uso de RLHF, DPO ni de tecnicas de alineacion adicionales.

## Capacidades

- Generacion de video corto a partir de prompts de texto en lenguaje natural, con movimiento coherente y sin necesidad de LoRAs auxiliares en los checkpoints de la serie original entrenados con video.
- Especializacion en contenido para adultos: la model card afirma cobertura de un espectro amplio de temas, estilos visuales, arquetipos de personajes, acciones y kinks presentes en las comunidades de origen de los datos.
- Generacion de imagenes fijas: la primera fase de entrenamiento se realizo sobre imagenes, por lo que los checkpoints de esa fase (y presumiblemente el modo imagen del modelo) producen resultados de detalle alto.
- Coherencia temporal: la fase de video aporta consistencia entre fotogramas segun la documentacion del autor.
- Base para entrenamiento de LoRAs: el autor recomienda explicitamente `wan_1.3B_exp_e14.safetensors` como punto de partida para ajustes posteriores.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no documentadas; los datos y las descripciones de entrenamiento proceden de comunidades en ingles.
- Modo "thinking", vision de entrada o audio: no disponible.

## Casos de uso

- Previsualizacion de escenas (previz) en produccion de cine para adultos: el modelo permite generar un clip aproximado a partir del guion o de la descripcion de la escena antes de rodarla, gracias a la coherencia temporal adquirida en la fase de video.
- Creacion de clips cortos para plataformas de suscripcion: creadores de contenido verificado pueden generar material de relleno o variaciones estilisticas sin depender de rodaje fisico, usando los checkpoints `exp_e14` como configuracion de partida.
- Entrenamiento de LoRAs de estilo o de personaje: los pesos se distribuyen en `safetensors` y el autor documenta el checkpoint recomendado para ajuste, lo que facilita pipelines de fine-tuning sobre una unica identidad o estetica.
- Investigacion academica sobre generacion de video y sobre moderacion de contenido: el modelo permite estudiar que aprende un modelo de difusion de video cuando se especializa en un dominio concreto, y sirve como material de partida en ejercicios de red teaming y de evaluacion de clasificadores NSFW.
- Investigacion sobre olvido catastrofico: la comparacion entre las series `e1`-`e20` y `exp_e1`-`exp_e14` ofrece un caso documentado de perdida de capacidades al entrenar por fases y de recuperacion mediante entrenamiento mixto imagen-video.
- Generacion de datos sinteticos etiquetados para entrenar sistemas de deteccion y filtrado: los clips generados pueden etiquetarse como positivos de un clasificador de contenido adulto, evitando el uso de material real de personas.
- Integracion en flujos de trabajo de artistas digitales: al derivar de Wan 2.1, es desplegable en herramientas que ya soportan la familia Wan (por ejemplo, ComfyUI mediante el cargador de checkpoints correspondiente), lo que permite encadenarlo con otros nodos de posprocesado o interpolacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, VBench ni similares) y la busqueda web realizada no devolvio resultados tecnicos utilizables.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, 1.300 millones de parametros ocupan aproximadamente 2,6 GB en bf16/fp16, pero el consumo real en inferencia es muy superior porque hay que sumar el decodificador VAE, el codificador de texto y las activaciones de la atencion espacio-temporal sobre la secuencia de fotogramas.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el rango de parametros, el modelo es candidato a ejecutarse en GPUs de consumo modernas con suficiente memoria (por ejemplo, RTX 4090 de 24 GB), mientras que para lotes grandes o resoluciones altas serian preferibles GPUs de centro de datos tipo A100 o H100.
- Compatibilidad con GPU de consumo: probablemente si atendiendo unicamente al numero de parametros, pero no hay cifras de VRAM confirmadas por el autor.
- Opciones de despliegue: no especificadas en la model card mas alla del formato `safetensors`. Al derivar de Wan 2.1, cabria esperar compatibilidad con Diffusers y con nodos de la familia Wan en ComfyUI, pero no se confirma en la documentacion disponible. vLLM, TGI, llama.cpp y Ollama no son aplicables: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 105,4 GB, por lo que conviene descargar unicamente el checkpoint deseado en lugar del `git clone` completo.

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| NSFW Wan 1.3b T2V (rrrrollie) | 1,3 B | T2V con fine-tune NSFW | CreativeML OpenRAIL-M | HuggingFace (`safetensors`) |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 B | T2V generalista (modelo base) | Segun la model card del modelo base | HuggingFace |
| Wan-AI/Wan2.1-T2V-14B | 14 B | T2V generalista de mayor escala | Segun la model card del modelo base | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada, ni de otros fine-tunes NSFW de la misma categoria con metricas publicadas. La comparacion se limita, por tanto, a parametros, especializacion, licencia y disponibilidad. Cabe senalar que la licencia del fine-tune (CreativeML OpenRAIL-M) es distinta de la del modelo base y anade restricciones de uso en su Anexo A.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta etiquetado como `nsfw` y `not-for-all-audiences`; su uso requiere verificar la mayoria de edad y la legislacion aplicable en la jurisdiccion del usuario.
- Riesgo de material intimo no consentido y de deepfakes: la capacidad de generar video de contenido explicito implica un riesgo elevado de uso para crear imagenes o videos sexuales de personas reales sin su consentimiento. Es un uso prohibido por la licencia y potencialmente delictivo.
- Restricciones de licencia: CreativeML OpenRAIL-M permite el uso comercial pero impone restricciones de uso recogidas en su Anexo A (entre ellas, prohibicion de generar contenido ilegal, de acoso o de dano a menores). Ademas, al ser un derivado de Wan 2.1, se heredan las condiciones del modelo base.
- Sesgos de los datos: el corpus procede de las 1.000 publicaciones mas votadas de unas 1.250 comunidades de Reddit, lo que sobrerrepresenta las esteticas, cuerpos, practicas y preferencias dominantes en esas comunidades y sus sesgos demograficos.
- Alucinacion y artefactos: la propia documentacion del autor reconoce degeneracion de la anatomia ("body horror") y perdida de coherencia en los checkpoints originales posteriores a la epoca 3; los checkpoints experimentales corrigen parcialmente el problema, pero no existe validacion independiente.
- Idiomas: no se documenta soporte multilingue; los captions de entrenamiento estan en ingles y el modelo previsiblemente responde peor a prompts en castellano.
- Validacion nula: 0 descargas y 0 likes, sin benchmarks, sin evaluacion de terceros y sin historial de issues. Tratarlo como un modelo de produccion sin validacion previa es arriesgado.
- Calidad de los prompts: el rendimiento depende en gran medida del fichero `prompting-guide.json` y de las convenciones de etiquetado de Reddit, poco intuitivas para un usuario nuevo.
- Almacenamiento: 105,4 GB de repositorio, con decenas de checkpoints de los que solo uno o dos estan recomendados.
- Fechas: el repositorio esta fechado en septiembre de 2026, con creacion y ultima actualizacion simultaneas, lo que sugiere una unica subida y ausencia de mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rrrrollie/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Guia de prompting incluida en el repositorio: `prompting-guide.json` (ruta dentro de https://huggingface.co/rrrrollie/NSFW_Wan_1.3b/tree/main)
- La busqueda web realizada no devolvio papers, blogs, repositorios ni demos adicionales relacionados con este modelo.

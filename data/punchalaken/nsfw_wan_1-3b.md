# punchalaken/NSFW_Wan_1.3b

## Resumen
NSFW_Wan_1.3b es un ajuste fino (fine-tune) del modelo de generación de vídeo texto-a-vídeo Wan2.1-T2V-1.3B, desarrollado por el usuario punchalaken. Se trata de un modelo de 1.300 millones de parámetros especializado en la generación de contenido audiovisual para adultos (NSFW) a partir de descripciones textuales. El modelo base, Wan2.1-T2V-1.3B, es un transformer de difusión para texto-a-vídeo creado por Wan-AI. Este fine-tune busca cubrir un espectro amplio de escenas, estéticas y acciones propias del contenido para adultos, con coherencia temporal nativa. La relevancia actual radica en la escasez de modelos abiertos especializados en generación de vídeo NSFW, lo que lo convierte en una herramienta de investigación y creación para ese nicho, aunque con importantes implicaciones éticas y legales. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados más allá de las convenciones de etiquetado en inglés de Reddit.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para texto-a-video (Text-to-Video Transformer) |
| Parametros totales | 1.300 millones (1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints en safetensors, presumiblemente FP16/FP32) |
| Idiomas soportados | no disponible (los prompts de entrenamiento estan en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura del transformer de difusión para texto-a-vídeo Wan2.1-T2V-1.3B, que procesa descripciones textuales y genera secuencias de vídeo. El ajuste fino se realizó mediante un proceso de entrenamiento supervisado sobre un conjunto de datos específico de contenido NSFW. Originalmente, el autor empleó un esquema de dos fases: las épocas 1-10 se entrenaron únicamente con imágenes fijas para construir una base estética, mientras que las épocas 11-20 se entrenaron exclusivamente con vídeo para aprender movimiento y coherencia temporal. Sin embargo, este enfoque provocó un "olvido catastrófico" que degradó la anatomía (caras, manos) y generó artefactos de "body horror" en las épocas posteriores a la 3.

Para corregir estos problemas, se lanzó una serie experimental (exp_e1 a exp_e14) con un entrenamiento de una sola pasada sobre un dataset mixto de 30.000 clips de vídeo y 20.000 imágenes fijas simultáneamente, con una tasa de aprendizaje más conservadora, lotes más pequeños y un calendario de entrenamiento más corto. El dataset original se compone de las 1.000 publicaciones principales de aproximadamente 1.250 subreddits NSFW, con leyendas que emplean el lenguaje y las convenciones de etiquetado de dichas comunidades. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal es la corrección del proceso de entrenamiento para mejorar la calidad espacial y la fidelidad NSFW.

## Capacidades
- Generacion de video texto-a-video de contenido NSFW: produce clips cortos a partir de descripciones textuales detalladas.
- Coherencia temporal y movimiento nativo: segun el autor, el modelo puede generar movimiento coherente sin necesidad de LoRAs auxiliares.
- Generacion de imagenes fijas (epocas 1-10 legacy) o video (epocas 11-20 legacy), aunque con degradacion de calidad en las posteriores a la epoca 3.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no especificadas; los prompts de entrenamiento estan en ingles, con terminologia de Reddit.
- Capacidad especial: entrenamiento especifico para contenido adulto, con una guia de prompting (prompting-guide.json) incluida en el repositorio.

## Casos de uso
- Generacion de video para plataformas de contenido para adultos: el modelo puede producir clips cortos a partir de descripciones textuales, util para creadores que necesitan contenido rapido y personalizado en nichos concretos.
- Investigacion en generacion de video NSFW: permite estudiar sesgos, calidad y limites de los modelos de difusion en dominios tabu, asi como evaluar tecnicas de mitigacion.
- Entrenamiento de LoRAs especificas: el checkpoint experimental e14 se recomienda para entrenar LoRAs que anadan estilos o personajes concretos sin degradar la calidad base.
- Prototipado de escenas para produccion: guionistas o directores pueden visualizar rapidamente escenas adultas antes de rodar, ahorrando costes de preproduccion.
- Aumento de datos para moderacion de contenido: generar ejemplos NSFW sinteticos para entrenar clasificadores de moderacion y sistemas de deteccion de contenido ilegal.
- Creacion de contenido para nichos especificos: gracias al dataset de subreddits, el modelo entiende terminologia y kinks concretos, permitiendo generar material adaptado a comunidades muy definidas.
- Pruebas de etica y seguridad: evaluar la facilidad de generar contenido no consentido o ilegal y desarrollar contramedidas, siempre en un entorno controlado y con supervision.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al ser un modelo de 1.3B parametros, los pesos en FP16 ocuparian aproximadamente 2.6 GB, pero la generacion de video requiere VRAM adicional para las activaciones y el proceso de difusion, por lo que la cifra real es desconocida.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no confirmado. Por tamano de parametros, es probable que quepa en GPUs de gama alta para consumidores, pero no hay datos oficiales.
- Opciones de despliegue: no especificadas. Al ser un fine-tune de Wan2.1, podria desplegarse con las mismas herramientas que el modelo base (por ejemplo, Diffusers), pero no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks comparativos. La unica comparacion directa es con el modelo base del que deriva este fine-tune.

| Modelo | Parametros | Longitud de contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | no disponible | no disponible | no disponible | publico |
| punchalaken/NSFW_Wan_1.3b | 1.3B | no disponible | creativeml-openrail-m | safetensors | publico (0 descargas) |

## Limitaciones y advertencias
- Contenido NSFW explicito: no apto para menores de edad y puede generar material ofensivo o perturbador.
- Riesgo de deepfakes y contenido no consentido: el modelo puede generar representaciones de personas reales sin su consentimiento, lo que puede ser ilegal en muchas jurisdicciones.
- Sesgos conocidos: entrenado con datos de Reddit, que pueden contener sesgos de genero, raza, orientacion sexual y otros, reflejando los estereotipos de dichas comunidades.
- Riesgo de alucinacion y artefactos: los checkpoints legacy (e4-e20) presentan degradacion grave de la anatomia ("body horror"); los experimentales mejoran pero no garantizan una calidad coherente en todos los casos.
- Licencia CreativeML Open RAIL-M: impone restricciones de uso basadas en el contexto, incluyendo la prohibicion de usos ilegales, daninos o no consentidos. El uso comercial esta permitido bajo ciertas condiciones, pero debe revisarse en detalle.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto; los prompts de entrenamiento estan en ingles, lo que limita su uso en otros idiomas.
- Calidad variable: se recomienda usar el checkpoint experimental exp_e14; los originales tienen problemas significativos de calidad.
- No hay benchmarks independientes: el rendimiento no ha sido verificado por terceros.
- Tamano del repositorio: 105,4 GB, lo que requiere un almacenamiento considerable y una descarga potencialmente lenta.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/punchalaken/NSFW_Wan_1.3b
- Modelo base Wan-AI/Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Archivo prompting-guide.json: incluido en el repositorio de HuggingFace del modelo.

# 43ntropy/Wan2.2-T2V-A14B-BF16-UnifiedReward-Flex-Diffusers

## Resumen

Este repositorio contiene una version fusionada en BF16 del modelo de generacion de video texto-a-video Wan2.2-T2V-A14B, publicada por el usuario 43ntropy. Se trata de un derivado de la comunidad que combina los pesos del modelo base oficial (Wan-AI/Wan2.2-T2V-A14B) con el LoRA CodeGoat24/Wan2.2-T2V-A14B-UnifiedReward-Flex-lora, aplicando una cuantizacion en BF16 con determinadas capas excluidas de la operacion.

El modelo base, desarrollado por Wan-AI (Alibaba), es un generador de video de 5 segundos a resoluciones de 480P y 720P construido sobre una arquitectura de difusion con mezcla de expertos (MoE). Cuenta con aproximadamente 27.000 millones de parametros totales, de los cuales solo unos 14.000 millones se activan por paso de inferencia. Esta variante anade el efecto del LoRA UnifiedReward Flex, orientado a alinear la generacion con preferencias humanas mediante senales de recompensa, y se empaqueta en formato Diffusers para su uso con esa libreria.

Su relevancia es limitada y practicamente experimental: el repositorio no registra descargas ni interacciones, se publico sin documentacion tecnica adicional y no existen resultados de evaluacion publicados. Es util principalmente para quienes quieran reproducir o inspeccionar la fusion LoRA sobre el modelo base, no como sustituto del modelo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con mezcla de expertos (MoE) y fusion de LoRA |
| Parametros totales | 27B (heredados del modelo base Wan2.2-T2V-A14B) |
| Parametros activos | 14B por paso de inferencia (dos expertos: alto ruido y bajo ruido) |
| Longitud de contexto | no disponible (modelo texto-a-video, no aplica contexto de tokens de texto convencional) |
| Tipos de cuantizacion | BF16 (con capas excluidas de la fusion/cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | MIT (este repositorio) |
| Formato de pesos | Diffusers (safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion con arquitectura MoE disenado para generacion de video. Emplea dos expertos especializados que se reparten las fases del proceso de denoising: un experto de alto ruido que trabaja en las etapas iniciales para fijar la composicion y el diseno general, y un experto de bajo ruido que refina el detalle en las etapas finales. El modelo total suma unos 27.000 millones de parametros, pero solo 14.000 millones se activan en cada paso, lo que reduce el coste computacional respecto a un modelo denso del mismo tamano.

Este repositorio concreto no aporta informacion sobre el entrenamiento original ni sobre el proceso de ajuste del LoRA. Lo que se documenta es una operacion de merge: los pesos del modelo base se combinan con el LoRA UnifiedReward Flex y se exportan en BF16, dejando ciertas capas fuera de dicha operacion. El LoRA de origen (UnifiedReward Flex) esta orientado a la optimizacion por recompensa (reward-based), lo que sugiere un ajuste para alinear los resultados con preferencias de calidad estetica o de fidelidad, pero no se detallan los datos, el numero de tokens ni la metodologia de entrenamiento. Al ser un derivado de la comunidad sin model card sustancial, no hay informacion verificable sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con duraciones de aproximadamente 5 segundos.
- Salida a resoluciones de 480P y 720P, segun el modelo base.
- Control de la estetica y composicion mediante el prompt de texto.
- Ajuste de estilo y preferencias derivado del LoRA UnifiedReward Flex (sin detalles publicados sobre su alcance exacto).
- Generacion de video con coherencia temporal gracias al mecanismo MoE de dos expertos.
- No soporta tool calling ni function calling: es un modelo de difusion para video, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingues: no disponibles.
- No dispone de modo "thinking", vision de entrada ni audio (la generacion de voz corresponde a la integracion aparte con CosyVoice en el proyecto Wan2.2, no a este repositorio).

## Casos de uso

- Creacion de contenido para redes sociales: generar clips cortos a partir de descripciones textuales para publicaciones en plataformas como Instagram o TikTok, aprovechando la salida de 5 segundos a 480P/720P.
- Storyboarding y previsualizacion audiovisual: producir bocetos en movimiento de escenas antes de rodarlas, de modo que el equipo de produccion valore composicion y ritmo sin coste de rodaje.
- Publicidad y marketing: crear anuncios breves o variaciones visuales de un concepto para tests A/B, ajustando la estetica mediante el prompt y el efecto del LoRA de recompensa.
- Prototipado en videojuegos: generar conceptos de cinemáticas o animaciones de ambientacion para presentar una direccion artistica antes de invertir en produccion completa.
- Educacion y divulgacion: ilustrar conceptos o procesos con clips generados a partir de descripciones, utiles para materiales didacticos.
- Investigacion en generacion de video: servir como punto de partida para estudiar el efecto del merge de LoRA sobre el modelo base y comparar variantes de ajuste por recompensa.
- Visualizacion arquitectonica o de producto: crear animaciones cortas de un diseno a partir de una descripcion textual para presentaciones preliminares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 de un modelo de ~27B ocupan aproximadamente 54 GB (27.000 millones x 2 bytes). A ello hay que sumar las activaciones y los buffers del proceso de difusion, por lo que se recomienda un minimo practico de 60-80 GB de VRAM para ejecucion en GPU.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB con offloading parcial. Para BF16 sin cuantizacion adicional se aconseja al menos una GPU de 80 GB.
- Cabe en GPU de consumo: no de forma nativa en BF16. Una RTX 4090 (24 GB) requeriria cuantizacion adicional a FP8/INT8 o tecnicas de offload a CPU/RAM, con la consiguiente penalizacion de velocidad.
- Opciones de despliegue: la libreria Diffusers (formato del repositorio), ComfyUI y vLLM-Omni (segun la receta de vLLM para los modelos Wan2.2 en formato Diffusers). Tambien son viables flujos con offload secuencial de modulos.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de difusion de video de gran tamano, los tiempos de generacion por clip suelen medirse en decenas de segundos o minutos segun hardware y numero de pasos, pero no se aportan cifras concretas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 43ntropy/Wan2.2-T2V-A14B-BF16-UnifiedReward-Flex-Diffusers (este) | ~27B | 14B | Texto-a-video, MoE + LoRA | MIT | Repositorio en HuggingFace, 0 descargas |
| Wan-AI/Wan2.2-T2V-A14B | ~27B | 14B | Texto-a-video, MoE | no disponible en la informacion | Modelo base oficial en HuggingFace |
| Wan-AI/Wan2.2-I2V-A14B | ~27B | 14B | Imagen-a-video, MoE | no disponible en la informacion | Modelo oficial en HuggingFace |
| Wan-AI/Wan2.2-TI2V-5B | 5B | 5B (denso) | Texto/imagen-a-video | no disponible en la informacion | Modelo oficial en HuggingFace |

## Limitaciones y advertencias

- Repositorio sin adopcion: cero descargas y cero interacciones, sin comunidad que haya validado la calidad de la fusion ni su fidelidad respecto al modelo base.
- Sin resultados de evaluacion: no hay benchmarks ni comparativas objetivas que respalden el rendimiento de esta variante.
- Documentacion minima: la model card solo indica que es una fusion del modelo base con el LoRA en BF16 con capas excluidas, sin detallar que capas se excluyeron ni el impacto de esa decision.
- Riesgo de degradacion por el merge: al combinar un LoRA con los pesos base y excluir ciertas capas, el resultado puede diferir del comportamiento esperado del modelo original, con posibles artefactos visuales o incoherencias temporales.
- Sesgos: no documentados, pero al heredar los datos de entrenamiento del modelo base es probable que reproduzca sesgos presentes en el corpus original (representacion de personas, culturas y escenarios).
- Alucinacion visual: como generador de difusion, puede producir contenido fisicamente incoherente o que no se corresponde fielmente con el prompt.
- Duracion y resolucion limitadas: clips de unos 5 segundos a 480P/720P, insuficientes para produccion de video largo sin拼接 de fragmentos.
- Restricciones de licencia: este repositorio se declara bajo MIT, pero al derivar del modelo base Wan2.2 conviene verificar las condiciones de la licencia original del modelo base antes de un uso comercial; dicha licencia no se especifica en la informacion disponible.
- Fecha de publicacion inusual: el repositorio figura creado el 2026-09-25, dato que conviene contrastar por si se trata de un error de metadatos.
- Idiomas soportados no confirmados: se desconoce el comportamiento del prompt en castellano u otros idiomas distintos de los usados en el entrenamiento original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/43ntropy/Wan2.2-T2V-A14B-BF16-UnifiedReward-Flex-Diffusers
- Modelo base oficial: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Variante relacionada del mismo autor: https://huggingface.co/43ntropy/Wan2.2-T2V-A14B-UnifiedReward-Diffusers
- Repositorio de codigo Wan2.2: https://github.com/Wan-Video/Wan2.2
- Version Diffusers del modelo base: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Receta de despliegue en vLLM: https://recipes.vllm.ai/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Ficha de referencia del modelo base: https://www.aimodels.fyi/models/huggingFace/wan2.2-t2v-a14b-wan-ai

# mundoamundo/slither-wan-v3-20261001

## Resumen

Slither Wan video-flow V3 es un modelo del mundo (world model) entrenado para predecir la evolucion de partidas del juego slither.io a partir de video observado y de senales de control. Lo publica el usuario mundoamundo (Seth Lupo) bajo licencia Apache 2.0 y esta inicializado desde Wan2.1-T2V-1.3B, un transformer de difusion de video para texto-a-video. Cuenta con 1.427.969.472 parametros entrenables (aproximadamente 1,43 mil millones) y opera sobre fotogramas de 512x288 a 15 Hz, con tres segundos de historial observado y controles proxy de angulo y boost a 30 Hz.

La propuesta es inusual dentro del catalogo de modelos abiertos: no es un modelo de lenguaje ni un generador de video generico, sino un simulador estocastico de dinamica de juego. El modelo genera bloques de futuro de forma conjunta mediante flow matching con sigma nativa, y el ajuste de politica se plantea como una etapa posterior y separada. Esto lo situa en la linea de los world models utilizados como entorno aprendido para entrenamiento por refuerzo o para planificacion.

El modelo se distribuye de forma peculiar: los pesos no se depositan en el repositorio Git de Hugging Face (que ocupa solo 0,1 GB), sino en un bucket con checkpoints rotativos reanudables que incluyen modelo, optimizador, cursor de datos y RNG por rank. El repositorio actua mas bien como punto de entrada y documentacion. En el momento de redactar esta ficha, el modelo acumula 0 descargas y 0 likes, por lo que se trata de una publicacion muy reciente y sin validacion externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de video con flow matching (inicializado desde Wan2.1-T2V-1.3B); codec de video nativo congelado |
| Parametros totales | 1.427.969.472 (aproximadamente 1,43 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Tres segundos de historial observado a 15 Hz (aproximadamente 45 fotogramas); no se especifica una longitud de contexto en tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de dominio videojuego, no orientado a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en el repositorio; los checkpoints se alojan en un bucket de Hugging Face con punteros latest.json y best.json, con tamanos y SHA-256 verificados |

## Arquitectura y entrenamiento

El modelo parte de Wan2.1-T2V-1.3B, un transformer de difusion para generacion de video texto-a-video, y lo adapta a un escenario de prediccion de futuro en slither.io. Mantiene un codec de video nativo congelado que trabaja a 512x288 y 15 Hz, y opera con tres segundos de historial observado mas controles proxy de angulo y boost a 30 Hz. La generacion de futuro se realiza por bloques estocasticos conjuntos mediante flow matching con sigma nativa, una formulacion que modela directamente el campo de velocidad entre distribuciones de ruido y datos. El ajuste de politica se describe explicitamente como una etapa posterior e independiente, de modo que este checkpoint corresponde a la fase de modelado del mundo, no a la de control.

Los datos de entrenamiento provienen del dataset mundoamundo/slither-wam-video-actions, fijado en el commit c60388c8b625379d2782e9a673c3d850ec7d4b85. La particion de entrenamiento y validacion se hace por fuente original de YouTube, de modo que ninguna fuente aparece simultaneamente en ambos conjuntos, lo que reduce el riesgo de fuga de datos. El propio autor advierte que tanto la reproduccion como los controles son proxies ruidosos, es decir, senales aproximadas extraidas del video en lugar de acciones reales de jugador. El entrenamiento no tiene limite de epocas: se ejecuta de forma reanudable y se detiene mediante checkpoint antes del vencimiento de la asignacion de recursos o ante la aparicion de un fichero STOP.

No se describe en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias humanas, lo cual es coherente con la naturaleza de simulador del modelo.

## Capacidades

- Prediccion de futuros estocasticos en partidas de slither.io: genera bloques de fotogramas futuros coherentes con el historial observado y los controles introducidos.
- Decodificacion mediante codec de video nativo congelado, con reconstruccion a 512x288 y 15 Hz.
- Condicionamiento por controles de accion proxy a 30 Hz (angulo y boost), lo que permite simular trayectorias bajo distintas decisiones de control.
- Generacion de rollouts de varios bloques encadenados, incluyendo muestreo largo directo.
- Capacidad de servir como entorno aprendido para entrenamiento de politicas (la fase de policy fitting se plantea como etapa posterior).
- Reanudacion de entrenamiento con estado completo: modelo, optimizador, cursor de datos y RNG por rank.
- Evaluacion estructurada sobre cinco fuentes fijas de retencion: metraje real, reconstruccion con codec nativo, repeat-last, cinco bloques muestreados encadenados y una muestra larga directa.
- Soporte de tool calling, agentes, capacidades multilingues, vision general, audio y modo de razonamiento explicito: no disponible.

## Casos de uso

- Entorno de entrenamiento por refuerzo para agentes de juego: el modelo puede actuar como simulador aprendido de slither.io, permitiendo entrenar politicas de control sin ejecutar el juego real, con la ventaja de que los controles proxy a 30 Hz se alinean con la frecuencia tipica de decision de un agente.
- Investigacion en world models: sirve como banco de pruebas para comparar flow matching con sigma nativa frente a otras formulaciones de difusion en prediccion de video de dominio especifico.
- Planificacion basada en modelo: al generar rollouts estocasticos de varios bloques, permite evaluar distintas secuencias de acciones antes de comprometerse con una, util en tareas de control con horizonte medio.
- Generacion de datos sinteticos de partidas: los checkpoints pueden producir trayectorias plausibles para aumentar datasets de entrenamiento de otros modelos de vision o de control, siempre que se acepte la deriva acumulada en rollouts largos.
- Estudio de estabilidad de rollouts: la propia metodologia de evaluacion del autor (bloques encadenados frente a muestreo largo directo) se puede replicar para medir degradacion a lo largo del horizonte, un problema central en world models.
- Reproducibilidad de entrenamiento a gran escala: la estructura de checkpoints reanudables con RNG por rank y cursor de datos es directamente reutilizable como plantilla para proyectos de entrenamiento interrumpible en infraestructura con asignaciones temporales.
- Analisis de dinamica multijugador: si el modelo captura correctamente las interacciones entre serpientes, puede emplearse para estudiar estrategias emergentes o patrones de colision en simulaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. El autor menciona explicitamente que la perdida de denoising por si sola no certifica la calidad del rollout, y describe una bateria de evaluacion cualitativa sobre cinco fuentes fijas de retencion, pero no se proporcionan cifras numericas de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no serian aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precision de 16 bits ocupan aproximadamente 2,9 GB y en 32 bits aproximadamente 5,7 GB. Estas cifras son calculos aritmeticos a partir del numero de parametros y no incluyen activaciones; en un modelo de video de 512x288 con historial de aproximadamente 45 fotogramas y generacion de bloques, el consumo de activaciones y buffers de atencion puede superar ampliamente el de los pesos. No se dispone de mediciones publicadas de consumo real.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano de parametros, el modelo cabria en VRAM de tarjetas de gama alta, pero la huella de memoria de las activaciones de video no esta documentada.
- Opciones de despliegue: no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI. El formato de pesos no esta declarado en el repositorio, y el modelo se distribuye como checkpoints de entrenamiento en un bucket, no como artefacto de inferencia listo para servir.
- Latencia y throughput: no disponible. El autor indica que los logs JSONL conservan medidas de throughput y de recursos, pero esos valores no se publican en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Contexto observado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mundoamundo/slither-wan-v3-20261001 | 1,43 mil millones | World model de slither.io | 3 s de video a 15 Hz | Apache 2.0 | Checkpoints en bucket, repositorio Git minimo |
| Wan-AI/Wan2.1-T2V-1.3B | 1,3 mil millones | Texto a video generico | No disponible | No disponible | Modelo base del que se inicializa este |
| mundoamundo/slither-residual-v3-20261001 | No disponible | World model de slither.io (variante residual) | No disponible | No disponible | Publicado por el mismo autor |
| Wan-AI/Wan2.2-I2V-A14B | 14 mil millones (MoE) | Imagen a video | No disponible | No disponible | Referenciado en la actividad del autor |

La comparacion con los modelos Wan es la mas relevante porque Slither Wan V3 deriva directamente de esa familia. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenar sobre grabaciones de YouTube de slither.io, el modelo puede heredar sesgos de estilo de juego, resolucion, compresion y composicion de esas fuentes.
- Riesgo de alucinacion: inherente a un modelo generativo de futuro. Los rollouts largos pueden divergir del comportamiento real del juego, y el propio autor senala que la perdida de denoising no garantiza calidad de rollout.
- Controles proxy ruidosos: tanto la reproduccion como las acciones de angulo y boost se extraen de forma aproximada del video, no de entradas reales de jugador, lo que introduce ruido sistematico en la relacion accion-efecto aprendida.
- Alucinacion de horizonte: la evaluacion propuesta (bloques encadenados frente a muestra larga directa) sugiere que la calidad degrada con el horizonte, pero no se cuantifica la magnitud.
- Limitacion de dominio: el modelo esta especializado en slither.io y en una resolucion y tasa de fotogramas concretas. No es extrapolable a otros juegos o a video natural sin reentrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial segun los terminos habituales, pero conviene verificar la licencia del modelo base Wan2.1-T2V-1.3B, que no se especifica en la informacion disponible y podria imponer condiciones adicionales.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados.
- Naturaleza de los artefactos: los checkpoints son de entrenamiento (incluyen optimizador, cursor de datos y RNG) y se alojan en un bucket con rotacion de dos ranuras por tipo. El repositorio Git no contiene pesos, por lo que no es un paquete directamente servible en produccion.
- Formato de pesos no declarado: imposibilita planificar a priori una ruta de despliegue concreta.
- Fecha de creacion posterior a la fecha habitual de referencia: el repositorio indica creacion en 2026, dato que se reproduce tal cual aparece en la informacion consultada.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/mundoamundo/slither-wan-v3-20261001
- Bucket de checkpoints reanudables: https://huggingface.co/buckets/mundoamundo/slither-wan-v3-20261001
- Perfil del autor en Hugging Face: https://huggingface.co/mundoamundo
- Listado de modelos del autor: https://huggingface.co/mundoamundo/models
- Modelo relacionado del mismo autor: https://huggingface.co/mundoamundo/slither-residual-v3-20261001
- Dataset de entrenamiento: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions
- Modelo base: Wan-AI/Wan2.1-T2V-1.3B (referenciado en la model card, sin URL explicita)
- Modelo relacionado de la familia base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Documentacion interna de arquitectura citada por el autor: source/world_model_v3/ARCHITECTURE.md (ruta relativa dentro del repositorio, no verificada como enlace publico)

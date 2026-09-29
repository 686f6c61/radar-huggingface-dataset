# Efficient-Large-Model/LongLive-Plug-Wan2.1-T2V-14B-cfg

## Resumen

LongLive-Plug-Wan2.1-T2V-14B-cfg es un adaptador LoRA (formato PEFT) publicado por Efficient-Large-Model que se acopla al modelo de difusion Wan-AI/Wan2.1-T2V-14B, un generador de video a partir de texto de 14 000 millones de parametros. Su funcion concreta es destilar classifier-free guidance (CFG) dentro de la rama condicional, de modo que la inferencia deja de necesitar una segunda pasada con la rama incondicional y el prompt vacio.

El problema que resuelve es de coste computacional: el CFG clasico duplica el numero de evaluaciones del transformer por paso de denoising, ya que calcula simultaneamente la prediccion condicional y la incondicional. Al plegar ese comportamiento en un unico forward pass condicional, el adaptador reduce aproximadamente a la mitad el computo por paso, manteniendo el control de guiado que aportaba el CFG.

Es importante delimitarlo bien: no es un modelo autonomo (requiere el modelo base) y no aporta por si solo aceleracion de pocos pasos. El propio autor indica que debe combinarse con el LoRA complementario LongLive-Plug-Wan2.1-T2V-14B-few-step, con una recomendacion de pesos LoRA de few-step : CFG = 1 : 0,5. La licencia es apache-2.0 sobre el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer de difusion texto-a-video Wan2.1-T2V-14B |
| Parametros totales | no disponible (adaptador; el modelo base declara 14 000 millones en su denominacion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de ventana de tokens de un LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos LoRA para PEFT) |
| Modelo base | Wan-AI/Wan2.1-T2V-14B |
| Relacion con el base | adapter |
| Tarea (pipeline) | text-to-video |
| Tamano del repositorio | 4,9 GB |
| Ratio LoRA recomendado | few-step : CFG = 1 : 0,5 (pesos LoRA, no escala CFG de inferencia) |
| Libreria | peft |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador de bajo rango (LoRA) sobre el modelo de difusion Wan2.1-T2V-14B, no una red completa. La innovacion tecnica declarada es la destilacion de classifier-free guidance: durante el entrenamiento se transfiere el comportamiento de la combinacion condicional/incondicional a una unica prediccion condicional, de manera que en inferencia no hace falta evaluar dos veces el modelo por cada paso de denoising. Esto elimina el clasico batch duplicado del CFG y, con ello, la mayor parte del sobrecoste de memoria y computo asociado.

No se especifican en la informacion disponible el numero de tokens o de clips de video usados en el entrenamiento, la composicion del dataset, ni si se emplearon etapas de RLHF, DPO o similares. Tampoco se detallan la arquitectura interna del modelo base (tipo de backbone, encoder de texto, VAE) ni los hiperparametros del entrenamiento LoRA (rango, alpha, tasa de aprendizaje). El adaptador se distribuye con la etiqueta lora y distillation, y el autor advierte explicitamente de que por si solo no proporciona aceleracion de pocos pasos: esa funcion corresponde al LoRA complementario y a la combinacion de ambos.

## Capacidades

- Generacion de video a partir de texto, delegada en el modelo base Wan2.1-T2V-14B.
- Eliminacion de la rama incondicional en inferencia: una sola pasada condicional por paso de denoising, con el guiado incorporado por destilacion.
- Combinacion con el LoRA few-step del mismo autor para generacion en pocos pasos, con ratio de pesos LoRA 1 : 0,5.
- Reduccion del consumo de VRAM y del tiempo por paso respecto a la inferencia CFG convencional, al no mantener el batch duplicado.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible (no se documenta el idioma de los prompts ni el soporte multilingue del encoder de texto).
- No dispone de modo thinking, salida de audio ni capacidades de vision adicionales mas alla de la generacion de video.
- Requiere obligatoriamente el modelo base: es un adaptador y no funciona de forma aislada.

## Casos de uso

- Inferencia de texto-a-video con la mitad de coste por paso: al eliminar la rama incondicional, cada paso de denoising pasa de dos evaluaciones del transformer a una. Es el escenario principal del adaptador y el que justifica su publicacion.
- Produccion de video por lotes en servicios de generacion: un backend que procesa muchas peticiones puede multiplicar el throughput al reducir el computo por paso, siempre que combine este adaptador con el LoRA few-step en el ratio 1 : 0,5.
- Despliegue en hardware con VRAM limitada: al no mantener simultaneamente la pasada condicional y la incondicional, se libera memoria que puede destinarse a mayor resolucion, mas fotogramas o mayor tamano de lote.
- Generacion en pocos pasos de baja latencia: combinado con LongLive-Plug-Wan2.1-T2V-14B-few-step, permite pipelines interactivos o de prototipado rapido donde el CFG tradicional seria demasiado lento.
- Investigacion sobre destilacion de guiado: sirve como referencia reproducible para estudiar como se comporta la destilacion de CFG frente al CFG explicito en calidad percibida, diversidad y fidelidad al prompt.
- Ajuste fino adicional por dominio: al ser un LoRA, puede apilarse o compararse con otros adaptadores del ecosistema Wan2.1 para verticales concretas (estilo visual, producto, animacion), aunque el autor no documenta el comportamiento en esos apilamientos.
- Sintesis de clips para aumento de datos: generacion masiva de video sintetico para entrenar otros modelos o para rellenar datasets de video, aprovechando el menor coste por muestra.
- Previsualizacion de storyboards y contenido de marketing: generacion de clips cortos a partir de descripciones de texto en flujos donde el coste por iteracion es el factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas cuantitativas (FVD, CLIP score, VBench, evaluaciones humanas) ni comparaciones numericas frente al CFG tradicional o frente a otros modelos de generacion de video.

## Requisitos de hardware

- Estimacion de VRAM a partir del modelo base: 14 000 millones de parametros en bf16 implican en torno a 28 GB solo en pesos; sumando activaciones, cache y el coste del VAE y del encoder de texto, la inferencia completa suele requerir bastante mas que esa cifra. Estas cantidades son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- El adaptador en si ocupa 4,9 GB en el repositorio, pero no es ejecutable sin el modelo base.
- GPU de gama profesional recomendadas: A100 (40 GB o 80 GB) y H100 (80 GB) para inferencia en precision alta sin offloading agresivo.
- GPU de consumo: cabe en una RTX 4090 (24 GB) solo si se aplican cuantizacion del modelo base y/o tecnicas de offloading de modulos; no hay datos publicados que confirmen configuraciones concretas.
- Opciones de despliegue: la libreria declarada es PEFT, de modo que el adaptador se carga sobre el modelo base en un stack de difusion (diffusers + PEFT). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a modelos de difusion de video.
- Latencia y throughput: no disponibles. El autor indica una reduccion del coste por paso por la eliminacion de la rama incondicional, pero no publica cifras de tiempo ni de frames por segundo.
- Multi-GPU: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongLive-Plug-Wan2.1-T2V-14B-cfg | LoRA sobre Wan2.1-T2V-14B | Adaptador (base de 14 000 millones) | Destila CFG en la rama condicional | apache-2.0 | HuggingFace, libreria PEFT |
| LongLive-Plug-Wan2.1-T2V-14B-few-step | LoRA sobre Wan2.1-T2V-14B | Adaptador (base de 14 000 millones) | Aceleracion de pocos pasos | no disponible en la informacion proporcionada | HuggingFace, mismo autor |
| Wan-AI/Wan2.1-T2V-14B | Modelo de difusion texto-a-video completo | 14 000 millones (segun denominacion) | Generacion de video a partir de texto con CFG convencional | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparado (calidad, latencia o VRAM) entre estas tres opciones ni frente a alternativas externas de la misma categoria, por lo que la comparativa se limita a tipo de artefacto, funcion y licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: es un adaptador y falla o resulta inutil sin Wan-AI/Wan2.1-T2V-14B.
- No acelera por si solo el numero de pasos de muestreo; para eso hay que combinarlo con LongLive-Plug-Wan2.1-T2V-14B-few-step, con ratio de pesos LoRA 1 : 0,5 segun el autor.
- El ratio 1 : 0,5 se refiere a los pesos LoRA, no a la escala CFG de inferencia; confundir ambos parametros produce resultados incorrectos.
- No se documentan sesgos conocidos, comportamientos de alucinacion visual ni tasas de artefactos; la ausencia de datos no implica ausencia de estos problemas.
- Calidad y fidelidad al prompt tras la destilacion del CFG: no hay evaluaciones publicadas que permitan cuantificar la perdida frente al CFG explicito.
- Idiomas soportados: no disponibles. Se desconoce el comportamiento con prompts en castellano y si el encoder de texto del modelo base es multilingue.
- Licencia: el adaptador es apache-2.0, pero el uso comercial del conjunto depende tambien de la licencia del modelo base Wan2.1-T2V-14B, que no se detalla en la informacion proporcionada y debe verificarse por separado.
- Senales de validacion de la comunidad: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe evidencia de uso en produccion.
- Fechas del repositorio (creado y actualizado en septiembre de 2026): conviene comprobar si ha habido revisiones posteriores de pesos o de la model card.
- Los resultados de la busqueda web realizada no aportan documentacion tecnica sobre el modelo; los enlaces obtenidos corresponden a definiciones de diccionario y no son relevantes.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.1-T2V-14B-cfg
- Modelo base Wan2.1-T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- LoRA complementario de pocos pasos: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.1-T2V-14B-few-step
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.

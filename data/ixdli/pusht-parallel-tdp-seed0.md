# IXDLI/pusht-parallel-tdp-seed0

## Resumen

`IXDLI/pusht-parallel-tdp-seed0` es un checkpoint de politica robotica por imitacion entrenado para la tarea PushT (empuje planar de un objeto en forma de T en 2D), publicado en HuggingFace con pipeline `robotics`. No es un modelo de lenguaje: es una politica de difusion que consume observaciones RGB de 96x96 pixeles mas la posicion XY del agente y emite comandos de posicion XY. Lo desarrolla el usuario IXDLI como reproduccion controlada del metodo TDP (Tube Diffusion Policy) descrito en el paper arXiv:2604.23609, cuyos autores no liberaron codigo ni los hiperparametros completos para PushT.

El modelo se entrena desde cero durante 512.400 actualizaciones del optimizador con batch efectivo de 64, AdamW a 1e-4 y schedule coseno con 500 pasos de warmup, sobre el split original de 90 demostraciones del Diffusion Policy. Usa fragmentos de accion de 16 pasos de prediccion y 8 de ejecucion, y se publica el EMA final sin seleccion por test, de modo que el checkpoint no esta optimizado contra la metrica de evaluacion.

Su relevancia es acotada y de investigacion: sirve como baseline reproducible y como punto de comparacion publico para TDP frente a Diffusion Policy y DiT-Policy en PushT, no como modelo de produccion general. La model card es explicitamente honesta sobre el alcance: no afirma reproducir las puntuaciones del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (diffusion policy) con codificador CNN compartido para RGB 96x96, acondicionamiento tipo DiT-Block y cabeza temporal GRN en el dominio de accion; incorpora las constantes "tube" de TDP |
| Parametros totales | no disponible (el autor no publica recuento; el repo completo ocupa 1,1 GB, incluyendo codigo de inferencia) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "memoria" es la observacion actual, sin historial temporal explicito) |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch en coma flotante; no hay GGUF, ONNX ni variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (modelo de control roboticos, sin entrada ni salida de texto) |
| Licencia | no disponible (no se declara en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | PyTorch `.pt` (`policy.pt`), cargado mediante `pusht_parallel.inference.load_policy`; codigo en `inference_source.tar.gz` |
| Entradas | Diccionario `{"pixels": uint8[96,96,3], "agent_pos": float[2]}` |
| Salidas | Comandos de posicion XY (`action_xy`) |
| Pasos de difusion en inferencia | Configurable via `nfe` (ejemplo de la model card: `nfe=10`) |
| Horizonte de accion | 16 pasos de prediccion, 8 de ejecucion (action chunking) |
| Entorno de entrenamiento | gym-pusht (orden de reset de estado legacy), split de 90 demostraciones del DP original |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

La politica sigue el esquema de diffusion policy: se genera una secuencia de acciones mediante un proceso de difusion condicionado por la observacion, con un codificador convolutional compartido que procesa la imagen RGB de 96x96 junto con la posicion del agente. El acondicionamiento temporal usa bloques DiT adaptados de Dasari et al. sobre ese codificador compartido (no un VLA preentrenado), y la cabeza de accion es una adaptacion al dominio de accion basada en GRN, con un cabezal temporal configurable de mayor tamano. Sobre esta base se anaden las constantes "tube" de TDP: contraccion, ruido, interpolacion continua y el "lift" de accion unica a la U-Net, valores que, segun el autor, son decisiones explicitas de implementacion al no estar publicados por los autores del paper.

El entrenamiento es desde cero, con 512.400 actualizaciones del optimizador a batch efectivo 64 (el ultimo epoch puede tener batch menor), AdamW con learning rate 1e-4, schedule coseno con 500 pasos de warmup y EMA con calentamiento. Se usa el split original de 90 demostraciones y la normalizacion original de Diffusion Policy. La evaluacion periodica reporta la puntuacion de test tal como en el paper, pero el checkpoint publicado es el EMA final y no el mejor checkpoint seleccionado por test. El JSON de evaluacion separa la recompensa maxima media de la tasa de exito estricta. El autor advierte que `gym-pusht` moderno preserva el orden de reset legacy pero no es el entorno archivado original de DP, y que esta comparacion RGB controlada no constituye una reproduccion de las puntuaciones reportadas.

## Capacidades

- Generacion de comandos de control XY para empuje planar de un objeto en T en simulacion 2D, a partir de imagen RGB y posicion del agente.
- Action chunking: predice 16 pasos de accion y ejecuta 8, lo que aporta estabilidad temporal y reduce el coste de inferencia por paso de control.
- Muestreo de difusion con numero de pasos configurable (`nfe`), lo que permite intercambiar calidad de accion por latencia.
- Inferencia en GPU CUDA mediante un cargador propio (`load_policy`) y un controlador con reset de episodio (`PushTController.reset()`).
- Integracion con el entorno `gym-pusht` para evaluacion automatizada.
- Reproduccion controlada de un metodo de investigacion (TDP) con configuracion explicita en `config.json`.
- No soporta tool calling, function calling, agentes multi-paso, texto, vision general, audio ni razonamiento simbolico.

## Casos de uso

- Baseline reproducible para investigacion en diffusion policies: el checkpoint permite replicar la curva de entrenamiento y comparar variantes (TDP frente a DP clasico) bajo el mismo split de 90 demostraciones y la misma normalizacion.
- Ablacion de componentes arquitectonicos: al estar el codigo de inferencia y `config.json` incluidos, se pueden modificar las constantes "tube", el lift de accion a la U-Net o el cabezal temporal GRN y medir el efecto en la tasa de exito estricta.
- Estudio del compromiso calidad-latencia en muestreo: variando `nfe` (por ejemplo 5, 10, 20) se mide como degrada la recompensa maxima media frente al coste por paso de control.
- Docencia en robotica e imitation learning: la tarea PushT es visual e interpretable, y el par `pixels`/`agent_pos` con salida XY facilita explicar diffusion policies en laboratorio sin infraestructura robotica real.
- Evaluacion comparativa de familias de politicas: sirve como entrada en un benchmark interno junto a DiT-Policy y GRN para decidir que arquitectura desplegar en una tarea de manipulacion planar.
- Generacion de trayectorias sinteticas de empuje: las secuencias de acciones del controlador pueden registrarse como datos de entrenamiento o para inicializar politicas de RL en simulacion.
- Verificacion de canalizacion de inferencia (smoke test) en pipelines MLOps: el modelo es pequeno y determinista en su interfaz, util para validar contenedores CUDA, versiones de PyTorch/torchvision y serializacion de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe un JSON de evaluacion que reporta la recompensa maxima media y la tasa de exito estricta, pero no incluye las cifras, y el propio autor indica que el checkpoint publicado no esta seleccionado por test, por lo que no debe interpretarse como el mejor resultado del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el autor no publica recuento de parametros. El repo completo ocupa 1,1 GB e incluye codigo, por lo que el peso del checkpoint es inferior a esa cifra. Para una politica de difusion con codificador RGB 96x96 y U-Net de acciones, es razonable esperar un consumo en el rango de pocos GB en FP32; conviene medirlo en el equipo destino.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA moderna es suficiente en la practica; el ejemplo de la model card usa `device="cuda"`. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores; tambien es plausible ejecutarlo en CPU, ya que la entrada es una imagen de 96x96 y el coste dominante son los `nfe` pasos de difusion.
- Opciones de despliegue: el repositorio proporciona su propio cargador PyTorch (`pusht_parallel.inference`), no integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. El despliegue tipico es un script Python con `requirements.txt` y un par PyTorch/torchvision compatible con CUDA.
- Latencia y throughput: no disponibles. La latencia depende linealmente de `nfe` y del horizonte de ejecucion de 8 pasos, que amortiza el coste de cada bloque de difusion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IXDLI/pusht-parallel-tdp-seed0 | Diffusion policy con TDP + GRN + DiT-Block | no disponible | no aplica | Sin cifras publicadas | no disponible | HuggingFace, pesos `.pt` + codigo |
| Diffusion Policy (original, PushT CNN) | Diffusion policy CNN | no disponible | no aplica | Puntuaciones reportadas en el paper de DP; no reproducidas aqui | no disponible en la informacion | Codigo y config publicos del proyecto Diffusion Policy |
| DiT-Policy (Dasari et al.) | Politica con bloques DiT | no disponible | no aplica | no disponible | no disponible | Repositorio GitHub publico |
| GRN (ByteDance) | Cabeza/arquitectura para politicas | no disponible | no aplica | no disponible | no disponible | Repositorio GitHub publico |

La comparacion cuantitativa no es posible con la informacion disponible: ninguno de los modelos alternativos tiene cifras verificables en este contexto, y el autor del checkpoint advierte explicitamente que su reproduccion RGB controlada no equivale a las puntuaciones del paper.

## Limitaciones y advertencias

- Modelo de proposito unico: solo resuelve PushT en simulacion 2D; no generaliza a otras tareas, morfologias ni entradas de texto.
- Sin seleccion por test: el checkpoint publicado es el EMA final, no el mejor checkpoint evaluado, por lo que su rendimiento puede ser inferior al maximo alcanzado durante el entrenamiento.
- Reproduccion parcial: TDP se deriva del paper sin codigo oficial ni hiperparametros completos de PushT; las constantes de contraccion, ruido, interpolacion continua y el lift de accion a la U-Net son decisiones del autor.
- Entorno no identico: se usa `gym-pusht` moderno, que preserva el orden de reset legacy pero no es el entorno archivado original de Diffusion Policy; los resultados no son directamente comparables con los publicados.
- Ausencia de licencia: no se declara licencia ni en la model card ni en los metadatos, lo que impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin cifras de evaluacion en la card: no se puede verificar la calidad del checkpoint sin ejecutar el JSON de evaluacion por cuenta propia.
- Ambiguedad de metricas: la recompensa maxima media y la tasa de exito estricta se reportan por separado; usar solo una de ellas puede llevar a conclusiones erroneas.
- Riesgo de sobreajuste al split de 90 demostraciones, propio del regimen de imitation learning de baja data.
- Sin garantias de seguridad para uso en robotica real: la salida son comandos de posicion XY sin capa de supervision, limites de velocidad ni verificacion de colisiones.
- Idiomas y sesgos linguisticos: no aplica, pero tampoco hay documentacion sobre sesgos visuales o de distribucion de estados del simulador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/pusht-parallel-tdp-seed0
- Paper de Tube DP: https://arxiv.org/abs/2604.23609
- Config del experimento original de Diffusion Policy en PushT: https://diffusion-policy.cs.columbia.edu/data/experiments/image/pusht/diffusion_policy_cnn/config.yaml
- Repositorio DiT-Block Policy (Dasari et al.): https://github.com/SudeepDasari/dit-policy
- Repositorio GRN (ByteDance): https://github.com/bytedance/GRN
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/yuyuan-wu-universiteit-gent/policy%20parallel%20test/runs/pusht-parallel-20261019-s0-tdp-s0

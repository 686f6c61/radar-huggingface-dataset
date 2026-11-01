# Cosmos-Data/Cosmos-droid

## Resumen

Cosmos-droid es un conjunto de checkpoints intermedios resultantes de un ajuste fino completo del modelo nvidia/Cosmos3-Nano-Policy-DROID sobre cinco tareas de manipulacion de DROID. Lo publica el usuario Cosmos-Data en HuggingFace y pertenece a la familia Cosmos de NVIDIA, orientada a modelos del mundo y politicas roboticas. El modelo genera de forma conjunta video y acciones, es decir, implementa una politica "WAM" (world-action model) que predice fotogramas futuros y comandos motores en el mismo proceso generativo.

El problema que aborda es el control de robots manipuladores a partir de observaciones visuales y lenguaje: dado un objetivo expresado en texto y las imagenes de tres camaras, produce una secuencia de comandos de articulaciones y garra. Su relevancia es acotada y experimental: se trata de checkpoints intermedios de una ejecucion que aspira a 5000 actualizaciones del optimizador, no han sido evaluados en un robot real y el autor los marca explicitamente como trabajo en curso.

La arquitectura subyacente es la del modelo base de NVIDIA, con componentes de transformer, VAE, codificador visual y tokenizador de texto, exportados en formato diffusers. No se dispone de datos publicos sobre el numero de parametros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Cosmos3-Nano-Policy-DROID con transformer, VAE, vision encoder y text tokenizer; exportado a diffusers) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventanas de 33 fotogramas y 32 objetivos de accion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en BF16) |
| Idiomas soportados | no disponible (las instrucciones de tarea se expresan en lenguaje natural, pero no se documenta el conjunto de idiomas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (estructura diffusers: transformer/, vae/, vision_encoder/, text_tokenizer/, scheduler/, model_index.json) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base nvidia/Cosmos3-Nano-Policy-DROID, un modelo generativo que combina un transformer con un VAE y codificadores visuales y de texto. La politica es de tipo conjunto video/accion: en lugar de mapear directamente observacion a accion, genera simultaneamente los fotogramas futuros y la secuencia de comandos motores, lo que la convierte en un world model con cabeza de accion. Cada ventana de entrenamiento contiene 33 fotogramas y 32 objetivos de accion, con tres camaras (una en la muneca y dos vistas exteriores), a resolucion 640x360 y 15 FPS. Las acciones son 7 comandos absolutos de articulaciones mas la garra.

El ajuste fino es completo (no LoRA) y se realizo sobre 96 episodios exitosos de DROID en formato relabelado, lo que suma 19.627 ventanas de entrenamiento. Se uso batch global de 512 en 8 GPU H100 de 80 GB (16 muestras por GPU con acumulacion de gradiente 4), precision BF16 y checkpointing de activaciones completo. El optimizador es FusedAdam con LR base 2e-4 y multiplicador de scheduler 0,4, multiplicador 5 para la cabeza de accion, weight decay 0,05, betas (0,9, 0,99) y sin warmup. Se activa EMA de potencia con tasa 0,1, reinicializada desde los pesos regulares del modelo base. Los checkpoints exportados usan los pesos EMA y se convierten a diffusers con las herramientas del framework Cosmos.

## Capacidades

- Generacion conjunta de video y acciones para control de robots manipuladores.
- Prediccion de secuencias de 32 comandos de accion (7 articulaciones absolutas mas garra) condicionadas por observaciones de tres camaras.
- Condicionamiento por instrucciones de tarea en lenguaje natural.
- Modelado del mundo: sintesis de fotogramas futuros coherentes con la accion predicha.
- Ejecucion de cinco tareas de mesa concretas: apilar un cuenco azul sobre uno verde, servir pan en un plato, poner uvas en un cuenco, insertar un rotulador en una taza y recoger cerezas para ponerlas en un plato.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso generico, vision general, audio ni modo thinking.

## Casos de uso

- Investigacion en politicas visomotoras: servir como punto de partida o referencia para estudiar el ajuste fino de modelos del mundo sobre tareas de manipulacion con el dataset DROID, comparando la evolucion de la perdida entre checkpoints (de ~1,19 en el paso 500 a ~0,76 en el 4309).
- Reproduccion de experimentos: los checkpoints permiten replicar la receta de entrenamiento documentada (`droid_five_task_8h100_gbs512.toml`) y verificar la curva de aprendizaje sin repetir el coste de las 8 H100.
- Evaluacion de world models en robotica: al generar video y accion de forma conjunta, el modelo sirve para analizar la coherencia entre la prediccion visual y los comandos motores antes de desplegar en hardware.
- Aprendizaje por imitacion con pocos datos: con solo 96 episodios exitosos se obtiene una politica funcional para cinco tareas de mesa, lo que lo hace util como baseline en entornos con datos limitados.
- Prototipado de pipelines de inferencia robotica: la integracion con `cosmos_framework.scripts.inference` y el formato diffusers facilitan montar un bucle de evaluacion offline sobre episodios grabados.
- Estudio de tecnicas de estabilizacion del entrenamiento: la combinacion de EMA de potencia, multiplicador de LR especifico para la cabeza de accion y ausencia de warmup es un caso practico para analizar su efecto en politicas generativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los checkpoints no han sido evaluados en un robot. La unica metrica reportada es la perdida de entrenamiento (mediana de los 100 pasos previos):

| Checkpoint | Paso del optimizador | Muestras vistas | Perdida de entrenamiento |
|---|---:|---:|---:|
| iter_000500 | 500 | 256k | ~1,19 |
| iter_001000 | 1000 | 512k | ~1,04 |
| iter_001500 | 1500 | 768k | ~0,97 |
| iter_002000 | 2000 | 1024k | ~0,95 |
| iter_002500 | 2500 | 1280k | ~0,87 |
| iter_002629 | 2629 | 1346k | ~0,84 |
| iter_002697 | 2697 | 1380k | ~0,89 |
| iter_003000 | 3000 | 1536k | ~0,89 |
| iter_003500 | 3500 | 1792k | ~0,81 |
| iter_004000 | 4000 | 2048k | ~0,77 |
| iter_004309 | 4309 | 2206k | ~0,76 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 609,5 GB e incluye 11 checkpoints completos, por lo que conviene descargar solo la carpeta `iter_XXXXXX/` necesaria.
- GPU de entrenamiento documentadas: 8x H100 de 80 GB con batch global 512, BF16 y checkpointing de activaciones completo.
- Viabilidad en GPU de consumo: no disponible; no se publican requisitos de VRAM para inferencia ni tamanos de cuantizacion.
- Opciones de despliegue: el framework propio `cosmos_framework` (scripts `inference`, `export_model` y `convert_model_to_diffusers`) y el formato diffusers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Cosmos-droid | no disponible | no disponible | Politica WAM (video + accion) ajustada a 5 tareas DROID | OpenMDW-1.1 | Checkpoints intermedios, sin evaluar en robot |
| nvidia/Cosmos3-Nano-Policy-DROID | no disponible | no disponible | Politica WAM base de NVIDIA | OpenMDW-1.1 | Modelo base publicado |
| Otras alternativas de politica robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria mas alla del modelo base.

## Limitaciones y advertencias

- Checkpoints intermedios: la ejecucion apunta a 5000 actualizaciones y el ultimo checkpoint publicado esta en el paso 4309, por lo que el entrenamiento no ha concluido.
- Sin evaluacion en robot: el autor afirma explicitamente que estos checkpoints no se han probado en hardware real, de modo que su tasa de exito en tareas fisicas es desconocida.
- Ambito muy restringido: solo cubre cinco tareas de mesa y se entreno con 96 episodios, por lo que no se espera generalizacion a objetos, escenas o instrucciones fuera de esa distribucion.
- Riesgo de sobreajuste y de alucinacion visual: con un dataset tan pequeno, la generacion de video puede desviarse de la dinamica real; no hay metricas publicadas que lo cuantifiquen.
- Sesgos: la model card remite a las notas de sesgo, explicabilidad, privacidad y seguridad del modelo base, que no se detallan en la informacion disponible.
- Licencia OpenMDW-1.1: es una licencia "other"; deben revisarse sus terminos concretos antes de cualquier uso comercial o redistribucion.
- Idiomas: no se documenta el conjunto de idiomas soportados para las instrucciones de tarea.
- Tamano del repositorio: 609,5 GB, lo que exige planificar el almacenamiento y descargar selectivamente las carpetas de checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cosmos-Data/Cosmos-droid
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano-Policy-DROID
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/

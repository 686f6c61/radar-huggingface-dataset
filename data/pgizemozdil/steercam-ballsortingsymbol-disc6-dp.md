# pgizemozdil/steercam-ballsortingsymbol-disc6-dp

## Resumen

`steercam-ballsortingsymbol-disc6-dp` es un conjunto de cinco políticas de difusión (Diffusion Policy) entrenadas con LeRobot para la tarea de clasificación de bolas marcadas (`BallSortingSymbol`) del benchmark ManiFeel, portado a MuJoCo Warp. Lo desarrolla pgizemozdil como material experimental del artículo *Steer Your Camera*, centrado en percepción activa: un controlador externo decide hacia dónde orientar una cámara móvil leyendo únicamente la incertidumbre predictiva de estas políticas, que permanecen congeladas durante todo el experimento.

La tarea consiste en levantar, entre dos bolas idénticas, aquella que lleva una marca de 9 mm. El modelo recibe una única imagen RGB de 128 x 128 píxeles procedente de la cámara orientable, sin propriocepción ni pose de cámara, y emite un chunk de 16 acciones de 7 dimensiones en el marco de la base del robot (traslación de la punta en cm, rotación en unidades de 0,05 rad y objetivo del dedo), de las cuales se ejecutan 8.

Cada miembro es una Diffusion Policy estándar de LeRobot con codificador ResNet-18 preentrenado en ImageNet, softmax espacial y U-Net condicional 1-D, entrenada durante 200.000 pasos sobre 50 demostraciones de teleoperación re-renderizadas desde 32 recorridos aleatorios de cámara. El interés actual reside en que sirve como banco de pruebas reproducible para investigación en percepción activa y estimación de incertidumbre en políticas visomotoras, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot `diffusion`): ResNet-18 con BatchNorm y pesos ImageNet1K_V1 + softmax espacial, U-Net condicional 1-D [512, 1024, 2048], DDPM 100 pasos (DDIM-10 en test) |
| Parametros totales | no disponible (repo de 5,3 GB con 5 miembros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de una imagen 128 x 128 RGB y dos pasos de observación |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` por miembro, layout LeRobot `pretrained_model`) |

## Arquitectura y entrenamiento

Cada uno de los cinco miembros (`member_0` a `member_4`, semillas 1000-1004) es una Diffusion Policy completa e independiente. El codificador visual es un ResNet-18 con BatchNorm inicializado con pesos `ResNet18_Weights.IMAGENET1K_V1` y seguido de softmax espacial; la cabeza generativa es una U-Net condicional 1-D con canales [512, 1024, 2048] que aplica difusión DDPM con 100 pasos durante el entrenamiento y DDIM con 10 pasos en inferencia. La salida es un chunk de 16 x 7 acciones, del que se ejecutan 8. No se usa propriocepción ni pose de cámara: toda la información procede de la imagen.

El entrenamiento se realizó durante 200.000 pasos con batch de 64, optimizador AdamW con tasa 0,0001 y recortes aleatorios [116, 116]. Los datos provienen de 50 demostraciones de teleoperación de ManiFeel reejecutadas y re-renderizadas desde 32 recorridos de cámara suaves y aleatorios que cubren toda la ventana de vistas (el régimen "wide"). El checkpoint publicado corresponde al paso 200.000. Se incluye además un `calibration.json` con la normalización z por fases de los términos de incertidumbre, aunque el benchmark oficial emplea la incertidumbre U sin calibrar. La incertidumbre se define como el logaritmo de la varianza total de los chunks muestreados.

## Capacidades

- Generación de acciones robóticas visomotoras: produce chunks de 16 x 7 acciones a partir de una imagen RGB de 128 x 128.
- Percepción de marcas finas: la tarea requiere discriminar una marca de 9 mm sobre una bola entre dos idénticas.
- Muestreo estocástico múltiple: permite generar N muestras por observación y derivar una medida de incertidumbre (log-varianza total del chunk).
- Ensemble de cinco políticas independientes para estimar dispersión predictiva.
- Funcionamiento sin propriocepción ni pose de cámara, lo que lo hace adecuado para configuraciones con cámara externa móvil.
- No soporta tool calling, function calling, agentes basados en lenguaje, generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en percepción activa: el ensemble se usa como fuente de incertidumbre para que un controlador externo decida la siguiente vista de cámara; el modelo nunca se actualiza, solo se consulta su distribución predictiva.
- Reproducción de experimentos del artículo *Steer Your Camera*: los cinco miembros con semillas fijas permiten replicar las curvas de rendimiento por vista y por condición del benchmark.
- Evaluación de estrategias de selección de vista: comparar políticas de steering guiadas por incertidumbre calibrada frente a no calibrada usando `calibration.json`.
- Estudio de robustez ante oclusión y clutter: el modelo ofrece celdas de referencia (92 % nominal limpio, 1 % con marca ocluida, 0 % desde vista alta tras el soporte, 80 % con clutter) para medir el efecto de perturbaciones.
- Base para ablation studies de arquitectura de Diffusion Policy: al ser checkpoints LeRobot estándar, se pueden sustituir componentes (codificador, U-Net, pasos DDIM) y comparar contra estos pesos congelados.
- Docencia y prototipado en robótica con MuJoCo Warp: sirve como ejemplo completo de pipeline LeRobot con renderizado texturizado y semántica de acciones definida.
- Generación de datos sintéticos de evaluación: muestrear trayectorias del ensemble para analizar la distribución de acciones ante distintas vistas.

## Benchmarks y rendimiento

Resultados publicados en la model card para el bloque de desarrollo con protocolo v2, cámara fija, 100 episodios por celda:

| Condicion | Tasa de exito |
|---|---|
| Nominal limpio | 92 % |
| Marca ocluida | 1 % |
| Vista alta tras el soporte | 0 % |
| Con clutter | 80 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo completo ocupa 5,3 GB con cinco miembros, por lo que un solo miembro ronda 1 GB en safetensors (fp32), reducible a la mitad en fp16.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con al menos 4-8 GB de VRAM debería alojar un miembro individual en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores para un miembro; el ensemble completo de cinco requiere más memoria.
- Opciones de despliegue: LeRobot (`lerobot[diffusion]>=0.6.1,<0.7`) con `DiffusionPolicy.from_pretrained`, o el wrapper `PolicyEnsemble` del repositorio `steer-your-camera`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La inferencia usa DDIM con 10 pasos, lo que reduce el coste frente a los 100 pasos de DDPM, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steercam-ballsortingsymbol-disc6-dp | no disponible | Imagen 128x128 RGB, 2 pasos | Clasificación de bolas marcadas con cámara orientable | no disponible | Hugging Face (LeRobot) |
| Diffusion Policy estándar (LeRobot) | no disponible | Imagen + estado | Manipulación genérica | Apache 2.0 (librería) | Hugging Face / GitHub |
| ACT (Action Chunking Transformer, LeRobot) | no disponible | Imagen + estado | Manipulación genérica | Apache 2.0 (librería) | Hugging Face / GitHub |
| π0 (Physical Intelligence) | no disponible | Imagen + lenguaje | Manipulación generalista | no disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; las comparaciones de licencia y disponibilidad se refieren a la librería o al modelo base, no a este checkpoint concreto.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre el renderizado de MuJoCo Warp con la escena texturizada del simulador; no está pensado para operar un robot real.
- Requiere la semántica de acciones del simulador (marco de la base, unidades en cm y 0,05 rad); un uso fuera de ese contrato producirá acciones inválidas.
- Dependencia fuerte de la vista: 0 % de éxito desde la vista alta tras el soporte y 1 % con la marca ocluida, lo que evidencia una percepción frágil ante cambios de punto de vista.
- Sin propriocepción ni pose de cámara: no puede corregir errores de calibración extrínseca ni adaptarse a movimientos no vistos.
- Riesgo de sobreajuste a las 50 demostraciones originales pese al aumento por re-renderizado; la diversidad real de escenas es limitada.
- La licencia no está declarada, lo que impide asumir uso comercial sin consultar al autor.
- No se han publicado análisis de sesgos, robustez a cambios de iluminación o textura, ni métricas de calibración de incertidumbre más allá del `calibration.json` opcional.
- El artículo está en revisión; los resultados pueden cambiar en la versión final.
- El repositorio no tiene descargas ni likes, lo que sugiere ausencia de validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/pgizemozdil/steercam-ballsortingsymbol-disc6-dp
- Código, tareas, datasets y benchmark: https://github.com/gizemozd/steer-your-camera
- Paper *Steer Your Camera*: en revisión, sin enlace público disponible en la información proporcionada
- LeRobot: https://github.com/huggingface/lerobot
- ManiFeel: sin enlace directo en la información proporcionada

# ahd03/masar

## Resumen

Masar es un adaptador LoRA para el modelo vision-lenguaje Qwen3-VL-8B-Instruct, desarrollado por el usuario ahd03 y publicado en Hugging Face bajo licencia Apache 2.0. Su proposito es resolver una tarea concreta de navegacion visual-lenguaje (VLN, vision-language navigation): dada una fotografia en primera persona de un entorno exterior y una instruccion en lenguaje natural del tipo "ve al banco de la izquierda", el modelo devuelve una trayectoria como una lista de puntos en coordenadas normalizadas de la imagen. Es, por tanto, un modelo image-text-to-text especializado en planificacion de rutas peatonales.

El modelo base es Qwen3-VL-8B-Instruct, un transformer multimodal de 8.000 millones de parametros con encoder de vision y decodificador de lenguaje. Masar no modifica el encoder visual (permanece congelado) y anade adaptadores LoRA de rango 16 unicamente sobre las proyecciones de atencion y MLP del modelo de lenguaje. El resultado es un adaptador ligero (el repositorio pesa 0,2 GB) que se carga sobre el modelo base mediante la libreria PEFT.

La relevancia del modelo reside en su enfoque de entrenamiento: se ha entrenado exclusivamente con imagenes sinteticas renderizadas en Blender (el dataset VLN Synthetic Scenes, 8.392 muestras), lo que evita la dependencia de costosos datasets de navegacion real y demuestra que es posible transferir aprendizaje de escenas renderizadas a escenas reales del benchmark NaviTrace. Segun la model card, el adaptador mejora sustancialmente las puntuaciones del modelo base en ese benchmark, pasando de valores negativos a positivos en todas las categorias evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-VL-8B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA es ligero (repo de 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16 segun el ejemplo de la model card) |
| Idiomas soportados | no disponible (los prompts de entrenamiento son los de NaviTrace, presumiblemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Masar es un adaptador LoRA sobre Qwen3-VL-8B-Instruct. El modelo base es un transformer multimodal que combina un encoder de vision con un decodificador de lenguaje de 8.000 millones de parametros. En Masar, el encoder de vision se congela y solo se entrenan adaptadores LoRA de rango 16, alpha 32 y dropout 0,05, aplicados sobre las proyecciones de atencion y MLP del modelo de lenguaje. El adaptador se carga con `PeftModel.from_pretrained` sobre el modelo base en bf16.

El entrenamiento utiliza exclusivamente el split de entrenamiento del dataset VLN Synthetic Scenes (8.392 muestras), compuesto por imagenes renderizadas en Blender con personas simples y trafico estatico. Se realizaron 2 epocas con tasa de aprendizaje 1e-4, decaimiento coseno, tamano de lote 16, precision bf16 e imagenes a 896 px. Los prompts de sistema y de usuario empleados son los mismos que define NaviTrace, e incluyen un fichero `prompts.py` distribuido en el repositorio del adaptador. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

La innovacion principal es metodologica: demuestra que un adaptador entrenado solo con datos sinteticos renderizados puede generalizar a escenas reales del benchmark NaviTrace, superando al modelo base en todas las categorias evaluadas. La salida del modelo es una lista de puntos `[[x, y], ...]` con coordenadas normalizadas de 0 a 1 y origen en la esquina superior izquierda.

## Capacidades

- Generacion de trayectorias peatonales a partir de una imagen en primera persona y una instruccion en lenguaje natural.
- Salida estructurada como lista de puntos en coordenadas normalizadas de imagen (formato `[[x, y], ...]`).
- Razonamiento visual sobre obstaculos dinamicos y estaticos, terreno semantico y geometrico, accesibilidad, visibilidad y normas sociales (categorias evaluadas en NaviTrace).
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct (vision-lenguaje general), aunque el adaptador esta especializado en navegacion.
- Entrada de imagen unica; no hay memoria de frames anteriores.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- No se documentan capacidades multilingues especificas; los prompts de entrenamiento son los de NaviTrace.

## Casos de uso

- Navegacion asistida para personas con discapacidad visual: el modelo recibe una foto del entorno y una instruccion como "ve al banco de la izquierda" y devuelve la ruta que seguiria un peaton, lo que permite generar indicaciones paso a paso en una aplicacion de asistencia.
- Planificacion de rutas en robots de reparto de ultima milla: integrado en un pipeline que captura una imagen del entorno y consulta al modelo la trayectoria hacia un destino descrito en lenguaje natural, aprovechando su capacidad de razonar sobre obstaculos estaticos y dinamicos.
- Simulacion y evaluacion de agentes de navegacion: el adaptador puede usarse como componente de planificacion en entornos simulados para comparar politicas de navegacion contra el benchmark NaviTrace, ya que reproduce los prompts oficiales del benchmark.
- Generacion de datos de entrenamiento para VLN: al producir trayectorias plausibles sobre imagenes sinteticas o reales, puede emplearse para aumentar datasets de navegacion con rutas anotadas automaticamente.
- Prototipado rapido de interfaces de navegacion en realidad aumentada: el modelo devuelve coordenadas normalizadas que se pueden superponer directamente sobre la imagen capturada por la camara del dispositivo.
- Investigacion en transferencia sim-a-real: sirve como caso de estudio de como un adaptador entrenado solo con escenas Blender generaliza a escenas reales, util para experimentos academicos sobre dominio sintetico.
- Evaluacion de modelos vision-lenguaje en tareas de navegacion: permite medir la brecha entre modelos generales y adaptadores especializados usando el codigo de puntuacion de NaviTrace.

## Benchmarks y rendimiento

Resultados en el split de validacion de NaviTrace (500 escenarios Human), usando el codigo de puntuacion de NaviTrace. Escala: 0 equivale a caminar recto y 100 a la trayectoria experta.

| Categoria | Qwen3-VL-8B antes de entrenar | Masar |
|---|---:|---:|
| **Global** | **-28,3** | **36,9** |
| Obstaculo dinamico | -25,0 | 50,5 |
| Obstaculo estatico | -23,7 | 41,1 |
| Terreno semantico | -24,0 | 39,7 |
| Terreno geometrico | -27,8 | 36,1 |
| Accesibilidad | -34,1 | 32,8 |
| Visibilidad | -27,6 | 30,3 |
| Normas sociales | -59,8 | 24,1 |

Referencia del leaderboard de NaviTrace (split de test oculto, no directamente comparable con Masar, que se mide en validacion y no se ha enviado): media de expertos humanos 75,5; Gemini 2.5 Pro 35,4; GPT-5 21,1; Qwen3-VL-235B 19,3.

## Requisitos de hardware

- El adaptador LoRA pesa 0,2 GB, pero requiere cargar el modelo base Qwen3-VL-8B-Instruct completo en memoria.
- VRAM estimada para inferencia en bf16: aproximadamente 16 GB para los pesos del modelo base de 8.000 millones de parametros, mas overhead del encoder visual y de las activaciones.
- GPU recomendadas: A100, H100 o RTX 4090 para inferencia en bf16 sin cuantizar. En GPUs consumer con menos VRAM seria necesario cuantizar el modelo base (no se documentan cuantizaciones especificas del adaptador).
- El ejemplo de la model card usa `device_map="cuda"` y `torch_dtype=torch.bfloat16`, lo que sugiere una GPU unica con al menos 16-24 GB de VRAM.
- Opciones de despliegue: transformers + PEFT (metodo documentado). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NaviTrace (Global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Masar (este) | 8B (base) + LoRA | no disponible | 36,9 (validacion) | Apache 2.0 | Hugging Face |
| Qwen3-VL-8B-Instruct (base) | 8B | no disponible | -28,3 (validacion) | no disponible en esta ficha | Hugging Face |
| Qwen3-VL-235B | 235B | no disponible | 19,3 (test oculto) | no disponible en esta ficha | Hugging Face |
| Gemini 2.5 Pro | no disponible | no disponible | 35,4 (test oculto) | propietaria | API |
| GPT-5 | no disponible | no disponible | 21,1 (test oculto) | propietaria | API |

Nota: las puntuaciones de Masar y del modelo base se miden en validacion; las de Gemini 2.5 Pro, GPT-5 y Qwen3-VL-235B en el test oculto del leaderboard, por lo que la comparacion no es estrictamente equivalente.

## Limitaciones y advertencias

- Solo soporta encarnacion humana (Human embodiment); no esta entrenado para otras morfologias (robots, vehiculos, etc.).
- Entrenado con escenas renderizadas en Blender con personas simples y trafico estatico; la categoria de Normas sociales es la mas debil (24,1 frente a 50,5 en obstaculos dinamicos).
- Entrada de imagen unica: no hay memoria de frames anteriores, lo que limita su uso en navegacion continua por video sin un mecanismo externo de agregacion.
- Riesgo de alucinacion de trayectorias en escenas fuera de la distribucion de entrenamiento (entornos reales complejos, iluminacion adversa, multitudes).
- No se han publicado resultados en el test oculto de NaviTrace; las cifras son de validacion y no comparables directamente con el leaderboard.
- No se documentan sesgos especificos ni cobertura multilingue; los prompts de entrenamiento son los de NaviTrace.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-VL-8B-Instruct antes de desplegar en produccion.
- No se documenta soporte de tool calling ni de agentes multi-paso; su uso en produccion requeriria envolverlo en un pipeline externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahd03/masar
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset VLN Synthetic Scenes: https://huggingface.co/datasets/ahd03/vln-synthetic-scenes
- Dataset NaviTrace (leggedrobotics): https://huggingface.co/datasets/leggedrobotics/navitrace
- Fichero de prompts del adaptador: https://huggingface.co/ahd03/masar/blob/main/prompts.py

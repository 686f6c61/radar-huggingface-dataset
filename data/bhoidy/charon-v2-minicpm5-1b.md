# Bhoidy/charon-v2-minicpm5-1b

## Resumen

Charon V2 es un adaptador LoRA entrenado por el usuario Bhoidy sobre el modelo base openbmb/MiniCPM5-1B, un modelo de lenguaje de 1B parametros de OpenBMB. Su proposito es muy especifico: generar componentes de video animados en React + Remotion (ficheros TSX) a partir de descripciones en lenguaje natural. En lugar de ser un asistente generalista, el modelo esta afinado para producir fragmentos de JSX listos para produccion, comenzando con `<AbsoluteFill>` y terminando con `</AbsoluteFill>`, sin texto adicional ni vallas de markdown.

El modelo se entreno sobre el "Charon V2 Dual-Mode Corpus" de 11.602 muestras, con codigo Remotion validado sintacticamente al 100 por ciento (validacion AST). Soporta dos estilos condicionados mediante prefijos de prompt: un modo claro ("Clean Daylight White") para dashboards SaaS y de datos, y un modo oscuro ("Deep Obsidian Void") para interfaces cyberpunk, computacion cuantica y HUDs oscuros.

Su relevancia reside en el nicho de la generacion procedural de video mediante codigo: automatiza la creacion de escenas animadas (ondas trigonometricas, fisica de muelles con `spring`, animacion de rutas SVG, tarjetas glassmorphism y paneles de telemetria) que pueden renderizarse directamente con la CLI de Remotion. Al ser un LoRA ligero sobre un modelo de 1B parametros, es ejecutable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura LLaMA, segun tags de HuggingFace) con adaptador LoRA |
| Parametros totales | Base de 1B parametros (MiniCPM5-1B); tamano exacto del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia documentada en float16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es openbmb/MiniCPM5-1B, un modelo generativo de aproximadamente 1B parametros cuya arquitectura aparece etiquetada como LLaMA en HuggingFace. Sobre el se aplica un adaptador LoRA con rango r=16 y alpha=32 aplicado a las matrices de atencion `q_proj`, `v_proj`, `k_proj` y `o_proj`, lo que reduce drasticamente el numero de parametros entrenables y el coste del afinado.

El entrenamiento se realizo en una GPU NVIDIA Tesla T4 en Kaggle Cloud durante 3 epocas completas (4.351 pasos de optimizador y 34.806 pasadas de secuencia), alcanzando una loss final convergida de 0,00112. El dataset de entrenamiento, el Charon V2 Dual-Mode Corpus, consta de 11.602 muestras de codigo Remotion TypeScript validado sintacticamente mediante AST, cubriendo dos modos esteticos condicionables (claro y oscuro). No se ha publicado informacion sobre el numero de tokens del corpus, ni sobre el uso de RLHF o DPO; el afinado parece ser puramente supervisado sobre pares descripcion-codigo.

## Capacidades

- Generacion de codigo TypeScript/TSX para Remotion: produce componentes React completos dentro de `<AbsoluteFill>` listos para montar en una composicion de Remotion.
- Salida "zero-preamble": emite JSX puro sin vallas de markdown ni texto conversacional, lo que facilita la integracion en pipelines automatizados.
- Animaciones procedurales con matematicas nativas: calcula formas de onda armonicas (`Math.sin(frame * 0.15 + i)`) y dinamicas de muelle de Remotion (`spring({frame, fps, config})`).
- Animacion de rutas SVG, tarjetas con glassmorphism y dashboards de telemetria.
- Doble modo estetico condicionable mediante prefijos: "(bright light aesthetic: Clean Daylight White)" para dashboards claros y "(dark aesthetic: Deep Obsidian Void)" para esteticas oscuras tipo HUD o cyberpunk.
- Generacion determinista: la inferencia documentada usa `do_sample=False` (decodificacion greedy), adecuada para resultados reproducibles.
- Formato de prompt compatible con plantillas tipo ChatML (`<|im_start|>` / `<|im_end|>`).
- No hay evidencia de capacidades de vision, audio, tool calling ni razonamiento multi-paso; el modelo esta especializado en generacion de codigo de video.

## Casos de uso

- Generacion automatizada de dashboards animados para SaaS: con el modo "Clean Daylight White", el modelo produce contadores de metricas animados, graficos bezier que se dibujan con fisica de muelles y tarjetas de telemetria con glassmorphism, ideal para videos de producto o informes trimestrales.
- Creacion de HUDs e interfaces cyberpunk para contenido tecnico: el modo "Deep Obsidian Void" genera escenas oscuras con formas de onda trigonometricas, util para videos sobre computacion cuantica, criptografia o telemetria de sistemas.
- Produccion de video procedural sin assets externos: como las animaciones son puramente matematicas (CSS, SVG, trigonometria), no requiere imagenes ni videos de stock, lo que permite pipelines de render 100 por ciento automatizados.
- Generacion por lotes de escenas de video ("chunks"): el formato de prompt incluye un campo "PREVIOUS SCENE", lo que sugiere encadenamiento de escenas para componer videos largos a partir de descripciones secuenciales.
- Integracion en CI/CD de contenido audiovisual: la salida JSX puro sin preambulos puede validarse con AST/ESLint y renderizarse con `npx remotion render` en pipelines automatizados de generacion de video.
- Prototipado rapido de animaciones React/Remotion: desarrolladores pueden describir una escena en lenguaje natural y obtener un componente TSX sintacticamente valido como punto de partida para refinar a mano.
- Renderizado de fotogramas individuales para miniaturas o previews: mediante `npx remotion still` se puede extraer un frame concreto de la escena generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de entrenamiento publicado es la loss final convergida de 0,00112 tras 3 epocas, y la afirmacion del autor de que el corpus de entrenamiento esta validado al 100 por ciento sintacticamente mediante AST. No existen metricas independientes de calidad del codigo generado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1B parametros en float16 ocupa aproximadamente 2-3 GB de VRAM, mas el adaptador LoRA (de tamano no publicado pero marginal); en total, menos de 4 GB en condiciones normales.
- GPU recomendadas: cualquier GPU moderna de consumo es suficiente; el propio entrenamiento se realizo en una Tesla T4 (16 GB), por lo que la inferencia es notablemente mas ligera. Una RTX 3060, RTX 4060 o superior sobra con diferencia.
- Cabe en GPUs de consumo: si, incluso en portatiles con GPU de 4 GB o en CPU (con mayor latencia) dado el tamano de 1B parametros.
- Opciones de despliegue: la receta oficial usa transformers + peft (`PeftModel.from_pretrained`) con `trust_remote_code=True`. Al ser arquitectura tipo LLaMA con pesos safetensors, deberia ser compatible con vLLM (cargando base + adaptador), llama.cpp (requiere fusionar el LoRA en GGUF, no publicado) y Ollama (igualmente tras fusionar pesos); estas ultimas no estan documentadas por el autor.
- Latencia y throughput: no disponibles. Con `max_new_tokens=3200` y decodificacion greedy en un modelo de 1B, se pueden esperar velocidades tipicas de decenas de tokens por segundo en GPU de consumo, pero no hay cifras publicadas.
- Nota: el repositorio indica un tamano de 0,0 GB, lo que sugiere que el adaptador es muy ligero; hay que descargar siempre ademas el modelo base openbmb/MiniCPM5-1B.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Especializacion | Licencia |
|---|---|---|---|---|
| Bhoidy/charon-v2-minicpm5-1b | LoRA sobre MiniCPM5-1B | 1B | Generacion de codigo Remotion/React para video | Apache 2.0 |
| openbmb/MiniCPM5-1B (base) | Modelo base generalista | 1B | Texto general e instrucciones | No disponible en la informacion proporcionada |
| Qwen2.5-Coder-1.5B-Instruct | Modelo generalista de codigo | 1,5B | Codigo general (no Remotion especifico) | Apache 2.0 / Qwen (segun version) |
| StarCoder2-3B | Modelo de codigo generalista | 3B | Completado y generacion de codigo general | BigCode OpenRAIL-M |

Charon V2 se diferencia de los modelos de codigo generalistas en que esta afinado para un dominio muy estrecho (componentes Remotion con formato de salida estricto), lo que le da ventaja en ese nicho frente a modelos mayores pero genericos, a costa de perdida de versatilidad. No hay comparativas cuantitativas publicadas entre ellos.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el modelo esta afinado solo para generar JSX de Remotion; fuera de ese formato (codigo general, conversacion, razonamiento) su rendimiento no esta evaluado y probablemente se degrade respecto al modelo base.
- La afirmacion de "zero-hallucination" del autor es marketing del entrenamiento, no una garantia verificable: el codigo generado debe validarse siempre (AST, compilacion de TypeScript, render de prueba) antes de usarlo en produccion.
- Idioma: entrenado y documentado en ingles; el rendimiento con prompts en castellano no esta evaluado.
- Requiere el modelo base: es un adaptador LoRA, no un modelo completo; hay que cargar openbmb/MiniCPM5-1B con `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio base (revisarlo antes en entornos sensibles).
- Contexto: la longitud de ventana no esta publicada; los prompts con escenas previas largas ("PREVIOUS SCENE") podrian excederla.
- Sin benchmarks independientes: la calidad del codigo generado solo esta respaldada por la loss de entrenamiento y la validacion AST del corpus, no por evaluaciones externas.
- Licencia Apache 2.0: permite uso comercial, modificacion y distribucion sin restricciones relevantes mas alla de conservar el aviso de licencia.
- Proyecto de autor individual con muy poca traccion (229 descargas, 0 likes en el momento de la ficha): escaso historial de mantenimiento y soporte comunitario; conviene tratarlo como experimental.
- No existe documentacion sobre cuantizaciones (GGUF, GPTQ, AWQ), lo que limita las opciones de despliegue optimizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Bhoidy/charon-v2-minicpm5-1b
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Repositorio/notebook de entrenamiento en Kaggle mencionado por el autor: bhoidy/charon-v2-minicpm5-1b-training (URL directa no disponible)
- Documentacion de Remotion: https://www.remotion.dev/
- No se han encontrado papers, demos ni entradas de blog asociadas en la informacion disponible.

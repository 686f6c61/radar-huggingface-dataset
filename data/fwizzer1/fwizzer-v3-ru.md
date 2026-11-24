# fwizzer1/fwizzer-v3-ru

## Resumen
fwizzer-v3-ru (Fwizzer v3 Titan RU) es un ajuste fino de tipo razonamiento (chain-of-thought) en ruso, desarrollado por el usuario fwizzer1 a partir del modelo multimodal LiquidAI/LFM2.5-VL-3B. El objetivo declarado es ofrecer una alternativa compacta (2.697 millones de parametros) especializada en razonamiento profundo en ruso, con soporte secundario de ingles, pensada para ejecutarse en hardware de consumo mediante cuantizaciones GGUF.

El modelo se apoya en la arquitectura Liquid Foundation Model (LFM2) de Liquid AI, una red neuronal hibrida con capas de atencion y de tipo convolucional/estado, y ha sido entrenado sobre un dataset privado de chain-of-thought (`fwizzer1/fwizzer-v3-titan-agentic`) que combina 27.051 muestras con trazas CoT generadas por Kimi K2.5 y 51 ejemplos de juegos HTML5/WebGL. La ventana de contexto declarada es de hasta 32.768 tokens.

Su relevancia practica reside en el formato: distribucion en cuatro cuantizaciones GGUF (desde 1,9 GB hasta 3,4 GB), compatibilidad con llama.cpp, LM Studio y Ollama, y un modo de "pensamiento" explicito delimitado por las etiquetas ``. Es un modelo pequeno, de licencia restrictiva derivada de LFM1.0 y con un unico autor, por lo que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Liquid Neural Network (LFM2, backbone de 2,69B) |
| Parametros totales | 2.697.198.592 (~2,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | Q8_0 (~3,4 GB), Q5_K_M (~2,5 GB), Q4_K_M (~2,1 GB), Q4_0 (~1,9 GB) |
| Idiomas soportados | ruso (principal), ingles |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo hereda el backbone LFM2.5-VL-3B de Liquid AI, una arquitectura hibrida denominada Liquid Neural Network que combina mecanismos de atencion con capas de estado/convolucionales. El ajuste fino se realizo sobre el dataset privado `fwizzer1/fwizzer-v3-titan-agentic`, compuesto por 27.051 muestras con trazas de chain-of-thought generadas por Kimi K2.5 y 51 ejemplos de generacion de juegos HTML5/WebGL. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal declarada es el formato de razonamiento: el modelo produce un plan arquitectonico y una autoverificacion dentro de las etiquetas `` antes de emitir la respuesta final. La model card recomienda un system prompt especifico, temperatura 0.6, top-p 0.95, min-p 0.05, repetition penalty 1.05 y stop tokens `` y `<|im_end|>`. El autor afirma que el proceso de pensamiento es "limpio", sin moralizacion ni rechazos plantilla, lo cual es una afirmacion del autor y no un resultado verificado.

## Capacidades
- Generacion de texto conversacional en ruso e ingles.
- Razonamiento con chain-of-thought explicito en etiquetas ``, incluyendo planificacion y autoverificacion.
- Generacion de codigo, con enfasis declarado en HTML5/Three.js, GDScript (Godot 4) y Python (Blender 4.x).
- Generacion de juegos 2D/3D autonomos en un unico archivo HTML5/WebGL con controles WASD.
- Generacion procedural de contenido (escenarios, assets) segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el CoT estructurado lo facilita, pero no hay documentacion especifica de agentes.
- Capacidades multilingues limitadas a ruso e ingles.
- Capacidades de vision: el modelo base es multimodal (VL), pero la model card no documenta el uso de vision en este ajuste.

## Casos de uso
- Asistencia conversacional en ruso: el modelo gestiona dialogos multi-turno con hasta 32.768 tokens de contexto, adecuado para soporte al cliente o tutoria en ruso donde se requiere mantener el hilo de una conversacion larga.
- Generacion de prototipos de juegos web: a partir de una descripcion textual, produce un archivo HTML5/WebGL autonomo con logica de juego y controles WASD, util para prototipado rapido en estudios pequenos o docencia.
- Ensenanza de programacion y scripting: el CoT explicito permite mostrar al estudiante el razonamiento paso a paso antes del codigo, util en entornos educativos con GDScript o Python.
- Despliegue local en portatiles y moviles: con la cuantizacion Q4_0 (1,9 GB) puede ejecutarse en CPU o GPU integrada mediante llama.cpp u Ollama, lo que permite asistentes offline sin conexion.
- Automatizacion de tareas de scripting en Blender: generacion de scripts Python para Blender 4.x a partir de instrucciones en lenguaje natural, integrable en flujos de trabajo de artistas tecnicos.
- Experimentacion en investigacion sobre CoT: al ser un modelo pequeno con trazas de razonamiento explicitas, sirve como banco de pruebas para estudiar la calidad y fidelidad del chain-of-thought en modelos de menos de 3B.
- Traduccion y redaccion tecnica ruso-ingles: util para borradores y resumenes en ambos idiomas, aunque sin garantias de calidad frente a modelos mayores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2,5-3,5 GB para Q8_0; 2-2,7 GB para Q5_K_M; 2-2,5 GB para Q4_K_M; 1,9-2,3 GB para Q4_0 (incluyendo overhead de contexto y KV cache, que crece con la ventana usada).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 4060, RTX 4090; en el extremo profesional, A100 o H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas con 4 GB o mas, e incluso en GPU integradas con memoria compartida usando Q4_0.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama; tambien safetensors mediante transformers si se dispone de la configuracion del modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fwizzer-v3-ru | ~2,7B | 32.768 | lfm1.0 | GGUF + safetensors en HF | Ajuste CoT en ruso sobre LFM2.5-VL-3B |
| Qwen2.5-3B-Instruct | ~3B | 32.768 | Apache 2.0 | HF, GGUF, amplia comunidad | Multilingue, sin CoT nativo |
| Llama-3.2-3B-Instruct | ~3B | 128.000 | Llama 3.2 Community | HF, GGUF, amplia comunidad | Multilingue, ecosistema maduro |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1,5B | 32.768 | MIT | HF, GGUF | Razonamiento CoT, menor tamano |

La comparativa se basa en caracteristicas publicas de cada modelo; no hay datos de benchmarks de fwizzer-v3-ru para comparar rendimiento.

## Limitaciones y advertencias
- Licencia lfm1.0: es una licencia restrictiva de Liquid AI, no equivalente a Apache 2.0 ni MIT; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Modelo de autor unico con 350 descargas y 1 like: no hay validacion independiente de calidad ni de los resultados declarados.
- Riesgo de alucinacion: al ser un modelo de 2,7B, la fidelidad factual es limitada, especialmente fuera de ruso e ingles.
- Sesgos: no documentados; el dataset de entrenamiento es privado, por lo que no se puede auditar su composicion ni sus sesgos.
- Limitacion de idioma: solo ruso e ingles; el rendimiento en castellano no esta garantizado.
- Contexto efectivo: aunque se declaran 32.768 tokens, en modelos de este tamano la calidad degrada mucho antes del limite teorico.
- Capacidad multimodal no documentada: el backbone es VL, pero la model card no describe el uso de imagenes en este ajuste.
- Afirmaciones del autor no verificadas: "sin moralizacion ni rechazos plantilla" y "cero degradacion de logica CoT" en Q8_0 son afirmaciones sin evidencia publicada.
- Formato de pensamiento acoplado: requiere el system prompt y los stop tokens especificos; su uso fuera de ese formato puede degradar la calidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/fwizzer1/fwizzer-v3-ru
- Dataset de entrenamiento: https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/

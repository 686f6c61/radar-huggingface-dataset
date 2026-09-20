# liskasYR/XGEN-JING

## Resumen

XGEN-JING es un modelo de generacion de video y audio en primera persona (egocentrico) desarrollado por XGEN Labs. Dado un conjunto de acciones de control, imagenes de referencia y un historial de observacion, el modelo genera video y audio de primera persona para tareas de navegacion, interaccion con objetos y conversacion con personajes. Se presenta como un "modelo de experiencia interactiva", una categoria intermedia entre los modelos de mundo y los generadores de video condicionados por texto e imagen.

La version publicada es JING-Flash-v1, un modelo bidireccional de cuatro pasos construido sobre MiniMax-H3 Ref2VA y el LoRA de cuatro pasos FlashGen. La arquitectura subyacente es un Transformer de difusion (DiT) con paralelismo de secuencia, complementado por un codificador de texto y VAEs de video y audio. El repositorio ocupa 66,9 GB y se distribuye en formato safetensors para la libreria diffusers, con etiqueta de pipeline image-text-to-video.

El modelo es relevante porque aborda la generacion conjunta de video y audio con control explicito de camara en un esquema de pocos pasos, algo poco habitual en modelos abiertos. Sin embargo, el lanzamiento es parcial: solo se publica la inferencia bidireccional de cuatro pasos, ejemplos y utilidades de prompting, mientras que el modelo causal y el informe tecnico estan anunciados como pendientes. Los metadatos de Hugging Face indican fecha de creacion del 20 de septiembre de 2026 y cero descargas, por lo que se trata de un artefacto reciente y sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) sobre MiniMax-H3 Ref2VA, con paralelismo de secuencia |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (se documenta un esquema de frames, no de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | minimax-h3-community-license-agreement (license: other) |
| Formato de pesos | safetensors (libreria diffusers) |
| Tamano del repositorio | 66,9 GB |
| Modalidad de salida | video y audio generados conjuntamente |
| Pasos de inferencia | 4 (modelo bidireccional, JING-Flash-v1) |
| Modelo base | MiniMaxAI/MiniMax-H3 (+ LoRA FlashGen de 4 pasos) |
| Resolucion, fps y duracion de salida | no disponible |
| Fecha indicada en metadatos | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

XGEN-JING se construye sobre MiniMax-H3 Ref2VA, un modelo de referencia a video y audio, y sobre el LoRA de cuatro pasos FlashGen, que permite reducir el coste de muestreo a cuatro pasos. El componente central es un DiT (Diffusion Transformer) que se ejecuta con paralelismo de secuencia sobre cuatro GPU, mientras que el codificador de texto ocupa una GPU y los VAE de video y audio otra. El backend de atencion por defecto es FlashAttention-4 y el runtime validado es SGLang, fijado en el commit `95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174`. El stack probado usa Python 3.12, Torch 2.13.0+cu130, torchvision 0.28.0+cu130, Triton 3.7.1, FA4 4.0.0b26 y SGLang kernel 0.4.7+cu130.

No se ha publicado informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF/DPO). Tampoco se detalla el procedimiento de ajuste sobre MiniMax-H3 mas alla del uso del LoRA FlashGen. La unica innovacion tecnica documentada es el esquema de control por teclado combinado con prompts repetidos por fragmentos: cada caso de inferencia define un prompt, un campo `repeat` y una lista `control` de la misma longitud, donde `w/s/a/d` controlan el movimiento adelante/atras/izquierda/derecha, `i/k` la mirada arriba/abajo y `j/l` el giro a izquierda/derecha. Las teclas opuestas se cancelan y la cadena vacia no aplica ninguna tecla. Con la configuracion por defecto, `num_frames = 17 * sum(repeat) + 5`.

El modelo causal y el informe tecnico estan anunciados como "coming soon", por lo que no hay descripcion formal de la arquitectura mas alla de lo indicado en la model card y el repositorio de codigo.

## Capacidades

- Generacion conjunta de video y audio de primera persona a partir de acciones, imagenes de referencia e historial de observacion.
- Control de camara mediante teclado: avance, retroceso y desplazamiento lateral (`w/s/a/d`), inclinacion vertical (`i/k`) y giro horizontal (`j/l`), con combinacion de teclas en un mismo fragmento.
- Condicionamiento por imagenes de referencia de personaje, objeto y escena, lo que permite componer una experiencia y explorar acciones distintas desde el mismo punto de partida.
- Interaccion con objetos y dialogo con personajes guiados por texto, con video y audio generados de forma sincronizada.
- Inferencia bidireccional de cuatro pasos (JING-Flash-v1), orientada a latencia reducida frente a muestreos de mas pasos.
- Generacion de casos de inferencia validados a partir de historias e imagenes de referencia mediante las "prompt skills" publicadas en el repositorio.
- Idiomas de prompt: ingles y chino.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni uso como agente. El modelo no es un LLM y no expone function calling.

## Casos de uso

- Generacion de datos sinteticos para robotica y agentes encarnados: el modelo produce secuencias egocentricas con control explicito de movimiento, utiles para aumentar datasets de navegacion e interaccion antes de transferir politicas a un robot real.
- Prototipado de videojuegos en primera persona: a partir de imagenes de referencia de escena y personaje se pueden previsualizar recorridos y dialogos con audio integrado, sin construir arte final.
- Previsualizacion cinematografica y storyboarding inmersivo: directores y artistas pueden componer una escena en primera persona, fijar el punto de partida con imagenes de referencia y explorar variantes de camara cambiando la secuencia de teclas.
- Creacion de contenido para realidad virtual y aumentada: la salida egocentrica con audio permite generar clips de ambientacion o demos de experiencias inmersivas para cascos y visores.
- Investigacion en modelos de mundo: el modelo sirve como banco de pruebas para medir consistencia temporal, coherencia fisica y fidelidad del audio en entornos interactivos generados.
- Diseno narrativo y guiones interactivos: el flujo de prompts fragmentados con `repeat` y `control` permite iterar rapidamente sobre ramas de una conversacion o de una interaccion con objetos.
- Demostraciones comerciales y material de marketing: generar recorridos guiados por un espacio o producto ficticio con voz y sonido ambiente, a partir de unas pocas imagenes de referencia.
- Evaluacion de interfaces de control: comparar esquemas de entrada (teclado, combinaciones de teclas por fragmento) en terminos de fidelidad del movimiento generado antes de invertir en un motor propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, FAD, CLIPScore, similitud de audio o similares) ni comparaciones numericas con otros modelos. Unicamente se ofrece una galeria de ejemplos y un video de demostracion, ademas de confirmar que la demo ha sido validada sobre seis GPU H100. El informe tecnico esta anunciado pero no disponible, por lo que no se pueden citar cifras verificables.

## Requisitos de hardware

- Configuracion validada: seis GPU H100, distribuidas en una GPU para el codificador de texto, una para los VAE de video y audio y cuatro para el DiT con paralelismo de secuencia.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el repositorio de pesos ocupa 66,9 GB en total, por lo que en precision bf16 el conjunto de componentes requeriria del orden de 70 GB o mas repartidos entre las GPU; no se publica un desglose por componente ni el efecto de la cuantizacion.
- GPU recomendadas: H100 (configuracion de referencia). No se documenta soporte validado para A100, RTX 4090 ni otras tarjetas.
- Compatibilidad con GPU de consumo: no acreditada. Con los datos publicados, el modelo no cabe en una unica GPU de consumo, y no se ofrecen pesos cuantizados que permitan reducir el requisito.
- Opciones de despliegue: diffusers para la carga del transformer y de los componentes de MiniMax-H3, y runtime SGLang (commit `95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174`) con kernel SGLang 0.4.7+cu130. FlashAttention-4 como backend de atencion. No se documenta soporte para llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Entorno de software: Python 3.12, Torch 2.13.0+cu130, torchvision 0.28.0+cu130, Triton 3.7.1, FA4 4.0.0b26. La revision de Diffusers debe mantenerse fijada segun `requirements.txt`, porque el extra de difusion de SGLang fija otra version.
- Descarga de pesos: los archivos necesarios se descargan automaticamente en el primer uso y se reutilizan desde la cache de Hugging Face; se puede fijar `HF_HOME` para elegir la ubicacion.
- Latencia y throughput: no disponibles. El modelo es de cuatro pasos, lo que reduce el numero de evaluaciones del DiT frente a muestreos mas largos, pero no se publican tiempos por clip ni frames por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de inferencia | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XGEN-JING (JING-Flash-v1) | no disponible | 4 (bidireccional) | imagen + texto a video y audio, primera persona | minimax-h3-community-license-agreement | pesos y codigo de inferencia publicados; modelo causal pendiente |
| MiniMax-H3 (Ref2VA) | no disponible | no disponible | referencia a video y audio | licencia de MiniMax-H3 | pesos publicos en Hugging Face; es el modelo base |
| FlashGen (LoRA de 4 pasos sobre MiniMax-H3) | no disponible | 4 | LoRA de aceleracion para video y audio | no disponible en la informacion proporcionada | pesos publicos en Hugging Face; se integra como componente de JING |

No se dispone de datos de benchmarks ni de especificaciones de parametros para ninguno de los tres modelos en la informacion proporcionada, por lo que la comparacion se limita a modalidad, esquema de inferencia, licencia y disponibilidad. Como categoria, los modelos de mundo interactivos y egocentricos incluyen propuestas de laboratorios cerrados, pero no se aportan datos verificables sobre ellas, por lo que no se incluyen en la comparacion.

## Limitaciones y advertencias

- Modelo sin validacion independiente: cero descargas y cero "likes" en el repositorio consultado, sin informe tecnico ni paper publicados (arXiv anunciado como "coming soon").
- Solo se publica inferencia bidireccional de cuatro pasos. El modelo causal, necesario para generacion en streaming o interactiva en tiempo real, no esta disponible.
- No es un modelo de lenguaje: no genera texto, no razona de forma explicita, no soporta tool calling, function calling ni flujos de agente de multiples pasos.
- Idiomas limitados a ingles y chino en los prompts. No hay informacion sobre el comportamiento con otros idiomas.
- Riesgo de incoherencia temporal y fisica: como generador de difusion de video, puede producir artefactos, saltos entre frames, colisiones fisicas improbables y desincronizacion entre el audio y la accion mostrada.
- Sensibilidad al prompt y al esquema de control: el resultado depende de la secuencia de teclas y del campo `repeat`; combinaciones mal formadas (longitudes distintas entre `control` y `repeat`) no estan documentadas como tolerantes a errores.
- Restricciones de licencia: la licencia es "other", con nombre `minimax-h3-community-license-agreement`. Al ser un modelo derivado de MiniMax-H3, las condiciones de uso comercial dependen de ese acuerdo y deben revisarse en el archivo `LICENSE` del repositorio antes de cualquier explotacion comercial. No se documenta aqui una autorizacion explicita de uso comercial.
- Dependencia de la licencia y de los pesos del modelo base: cualquier cambio en las condiciones de MiniMax-H3 afecta a este modelo.
- Coste de infraestructura elevado: la unica configuracion validada son seis H100, lo que descarta el uso en entornos de desarrollo convencionales.
- Procedencia: los metadatos de Hugging Face recibidos apuntan al identificador `liskasYR/XGEN-JING`, mientras que la model card y los enlaces oficiales apuntan a `XGENlabs/XGEN-JING`. Conviene verificar el repositorio oficial antes de descargar 66,9 GB de pesos.
- Sin desglose de sesgos: no hay informacion sobre sesgos demograficos, culturales o de representacion en los datos de entrenamiento.
- Sin datos de resolucion, fps ni duracion maxima de salida, lo que dificulta planificar su integracion en un pipeline de produccion.

## Enlaces

- Repositorio consultado: https://huggingface.co/liskasYR/XGEN-JING
- Repositorio oficial indicado en la model card: https://huggingface.co/XGENlabs/XGEN-JING
- Codigo de inferencia: https://github.com/XGEN-Labs/XGEN-JING
- Galeria de ejemplos: https://xgenlabs.ai/gallery.html
- Blog de investigacion de XGEN Labs: https://xgenlabs.ai/research.html
- Prompt skills: https://github.com/XGEN-Labs/XGEN-JING/blob/main/prompt_skills/SKILL.md
- Configuracion de repositorios y rutas: https://github.com/XGEN-Labs/XGEN-JING/blob/main/configs/base.yaml
- Ejemplo de caso de inferencia: https://github.com/XGEN-Labs/XGEN-JING/blob/main/examples/bakery_greeting.json
- Modelo base MiniMax-H3 (Hugging Face): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base MiniMax-H3 (GitHub): https://github.com/MiniMax-AI/MiniMax-H3
- LoRA FlashGen de 4 pasos: https://huggingface.co/Beidouqixing/minimax-h3-4step-lora-flashgen
- Runtime SGLang (commit fijado): https://github.com/sgl-project/sglang/tree/95140a7b0c9fc2f87a2a6cf6f6f0df8640a73174
- Indice de wheels CUDA 13 para SGLang kernel: https://sgl-project.github.io/whl/cu130/sglang-kernel/
- Paper tecnico: no disponible (arXiv anunciado como "coming soon")
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido sobre el Gran Premio de Australia de Formula 1 de 2025) y se han descartado por no ser fuentes relevantes.

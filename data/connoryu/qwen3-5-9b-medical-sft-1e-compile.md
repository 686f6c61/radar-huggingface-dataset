# ConnorYU/Qwen3.5-9B-Medical-SFT-1e-compile

## Resumen

Qwen3.5-9B-Medical-SFT-1e-compile es un ajuste fino (SFT) del modelo base unsloth/Qwen3.5-9B, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text orientado a tareas del ambito medico, entrenado con una sola epoca (el sufijo "1e" sugiere un epoch) y compilado, presumiblemente para optimizar la inferencia. El repositorio tiene 19,3 GB y los pesos en safetensors suman 9.653.104.368 parametros, es decir, aproximadamente 9,65 mil millones.

El modelo hereda la arquitectura Qwen3.5 del modelo base, que combina procesamiento de texto e imagen. La model card es extremadamente escasa: solo indica el modelo de partida, la licencia Apache 2.0 y que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que permitio un entrenamiento "2x mas rapido". No se documentan datos de entrenamiento, composicion del dataset medico, hiperparametros ni resultados de evaluacion.

Su relevancia es limitada y experimental: se publica como un ajuste fino de un modelo reciente (Qwen3.5) con muy poca documentacion, cero descargas y cero likes en el momento de la consulta. Resulta util como referencia para quienes quieran reproducir un SFT medico sobre Qwen3.5-9B con Unsloth, pero no debe considerarse un modelo listo para produccion clinica sin una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text, segun tags del repo) |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no lista GGUF ni otras variantes) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint unsloth/Qwen3.5-9B, que a su vez pertenece a la familia Qwen3.5. Los tags del repositorio incluyen qwen3_5, image-text-to-text y text-generation-inference, lo que indica que el modelo base es multimodal (acepta imagen y texto como entrada) y esta preparado para servir con TGI. No se dispone de detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa; esa informacion no aparece en la model card ni en los metadatos proporcionados.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo con Unsloth y TRL, con una sola epoca (sufijo "1e") y con una aceleracion aproximada de 2x respecto a un entrenamiento convencional. No se especifica el volumen de datos medicos, su procedencia, si hubo RLHF o DPO, ni si se aplicaron tecnicas de compilacion (torch.compile u otras) mas alla de lo que sugiere el sufijo "compile" en el nombre del repositorio. Tampoco se documentan hiperparametros como tasa de aprendizaje, tamano de lote o estrategia de enmascaramiento de perdida.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-9B.
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text), segun los tags del repositorio.
- Ajuste orientado al dominio medico mediante SFT, aunque sin documentacion sobre el alcance o la calidad de dicho ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card (language: en).
- Modo thinking, vision o audio especial: no disponible en la informacion proporcionada mas alla del caracter multimodal del pipeline.

## Casos de uso

- Experimentacion academica con SFT medico: el modelo sirve como punto de partida para reproducir el pipeline de Unsloth + TRL sobre Qwen3.5-9B y comparar el efecto de una sola epoca de ajuste en un dominio especializado.
- Generacion de borradores de texto clinico en ingles: puede emplearse para redactar resumenes o notas preliminares que un profesional revise posteriormente, dado su ajuste declarado al dominio medico, siempre con supervision humana.
- Clasificacion y extraccion de informacion de documentos medicos multimodales: al heredar el pipeline image-text-to-text, podria procesar imagenes junto con texto (por ejemplo, informes escaneados), aunque la calidad no esta validada.
- Base para evaluaciones de seguridad en IA medica: util para estudiar sesgos y alucinaciones de un modelo ajustado con pocos datos y una sola epoca, comparandolo con el modelo base.
- Prototipado de asistentes de formacion medica: en entornos controlados y no clinicos, para generar material de estudio o preguntas de repaso en ingles.
- Investigacion sobre eficiencia de entrenamiento: el uso de Unsloth y TRL permite analizar el coste y la velocidad de un SFT de 9,65 B parametros en una sola GPU o en pocas GPUs, como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para los pesos (9,65 B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de pesos, viable en GPUs de 16-24 GB.
- Cuantizacion a 4 bits: alrededor de 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque no se distribuyen pesos GGUF en el repositorio y habria que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 para cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090 en FP16 y en GPUs de 8-12 GB tras cuantizacion a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (tag endpoints_compatible), vLLM (previa conversion), llama.cpp/Ollama solo si se generan pesos GGUF (no incluidos).
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Medical-SFT-1e-compile | ~9,65 B | no disponible | si (image-text-to-text) | apache-2.0 | Hugging Face, 0 descargas |
| unsloth/Qwen3.5-9B (base) | ~9,65 B | no disponible | si | no disponible en la informacion | Hugging Face |
| Alternativas medicas de ~7-9 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables verificadas en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe datos, hiperparametros ni evaluacion, lo que impide validar la calidad del ajuste medico.
- Riesgo elevado de alucinacion en contenido clinico: un SFT de una sola epoca sobre un modelo generalista no garantiza precision medica.
- Sesgos desconocidos: no se documenta la composicion del dataset de ajuste, por lo que no se pueden evaluar sesgos demograficos o linguisticos.
- Idioma limitado al ingles; no se declara soporte de castellano.
- Contexto maximo no documentado; no se debe asumir una ventana larga sin verificacion.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias de idoneidad clinica; no apto para diagnostico ni decision medica sin supervision profesional.
- Cero adopcion (0 descargas, 0 likes) y publicacion reciente: no hay evidencia de la comunidad sobre su funcionamiento.
- El sufijo "compile" sugiere artefactos compilados que pueden no ser portables entre versiones de transformers o entornos de ejecucion.

## Enlaces

- Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Medical-SFT-1e-compile
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl

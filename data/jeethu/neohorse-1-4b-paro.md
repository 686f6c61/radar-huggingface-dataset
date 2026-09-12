# Jeethu/NeoHorse-1-4B-PARO

## Resumen

Jeethu/NeoHorse-1-4B-PARO es una version cuantizada a 4 bits del modelo TokenRhythm/NeoHorse-1-4B, publicada por el usuario Jeethu. No es un modelo entrenado desde cero, sino un artefacto de compresion: el autor ha aplicado ParoQuant (Pairwise Rotation Quantization) sobre los pesos del modelo base para reducir su huella en memoria manteniendo, segun la model card, una precision cercana a FP16.

El modelo base se etiqueta con la arquitectura qwen3_5_text y esta orientado a casos de uso agenticos, tool-use, generacion de codigo, razonamiento, seguimiento de instrucciones y conversacion. El checkpoint cuantizado conserva esas capacidades objetivo, pero con pesos INT4 optimizados para inferencia rapida en GPU NVIDIA (vLLM, Transformers) y en Apple Silicon (MLX). Aunque el nombre comercial incluye "4B", el recuento real de parametros en safetensors es de 1.127.635.968 (aproximadamente 1,13 mil millones), por lo que conviene tratar la nomenclatura con cautela.

Su relevancia actual radica en que ParoQuant se presenta como una cuantizacion INT4 de ultima generacion que cierra la brecha de precision con FP16 a velocidad cercana a AWQ. Esto permite desplegar modelos de razonamiento en hardware modesto, algo especialmente util para prototipado, edge computing y pipelines de agentes con presupuesto de VRAM limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5_text); detalles internos no disponibles |
| Parametros totales | 1.127.635.968 (aprox. 1,13 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (ParoQuant, INT4) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Tamano del repositorio | 3,2 GB |
| Modelo base | TokenRhythm/NeoHorse-1-4B |
| Relacion con el base | Quantized |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base mas alla de la etiqueta qwen3_5_text, que sugiere una familia de transformer tipo Qwen 3.5. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion. Estos datos no estan disponibles en la informacion proporcionada.

La innovacion destacable de este checkpoint no reside en el entrenamiento, sino en el proceso de cuantizacion. ParoQuant (Pairwise Rotation Quantization for Efficient Reasoning LLM Inference, arXiv:2511.10645) aplica rotaciones por pares para reducir el error de cuantizacion a 4 bits, con el objetivo declarado de igualar la precision de FP16 a una velocidad cercana a AWQ. La model card indica compatibilidad con vLLM y Transformers sobre GPU NVIDIA, y con MLX sobre Apple Silicon, ademas de distribuirse como paquete en PyPI.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno.
- Razonamiento (reasoning), segun las etiquetas del modelo.
- Generacion de codigo (coding).
- Tool calling y function calling (tool-use).
- Flujos agenticos y razonamiento multi-paso (agentic).
- Seguimiento de instrucciones (instruction-following).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingues: no disponibles.
- Modo de pensamiento explicito (thinking mode), vision o audio: no disponibles.

## Casos de uso

- Agentes de codigo en local: el modelo puede ejecutarse en una GPU de consumo gracias a sus pesos INT4 y usarse para autocompletado, generacion de funciones o refactorizacion dentro de editores e IDE, sin depender de APIs externas.
- Asistentes conversacionales embebidos: al caber en memoria reducida, es viable integrarlo en aplicaciones de escritorio o dispositivos con GPU modesta para gestionar dialogos multi-turno.
- Pipelines de tool calling: sus etiquetas de tool-use y agentic lo hacen adecuado para orquestar llamadas a funciones en flujos automatizados, por ejemplo consultas a bases de datos o APIs REST.
- Prototipado rapido de agentes: permite iterar sobre logica de razonamiento multi-paso y planificacion en un portatil con Apple Silicon via MLX antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto en produccion: por su tamano reducido, puede desplegarse en vLLM para tareas de enrutamiento, extraccion o preprocesado a bajo coste.
- Educacion y experimentacion con cuantizacion: sirve como caso de estudio reproducible para evaluar el impacto de ParoQuant INT4 frente a FP16 en un modelo de ~1,1B de parametros.
- Inferencia en el borde (edge): su huella de memoria permite desplegarlo en entornos con GPU integrada o Apple Silicon para tareas de generacion de texto offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones numericas frente a FP16 u otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada (solo pesos): aproximadamente 0,57 GB a 4 bits (1,127 B de parametros x 0,5 bytes); aproximadamente 2,26 GB en FP16.
- VRAM con cache KV y overhead: del orden de 1 a 2 GB en INT4 para contextos moderados, dependiendo de la longitud de contexto y el batch (valores estimados, no confirmados por el autor).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para INT4; para FP16, 4-6 GB. Modelos de gama alta (A100, H100) no son necesarios pero soportados.
- GPU de consumo: si, cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares. Tambien en Apple Silicon mediante MLX.
- Opciones de despliegue: vLLM, Transformers y MLX (soporte declarado por ParoQuant). Ollama o llama.cpp no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable. A continuacion se contrastan caracteristicas estructurales con alternativas de tamano similar; los datos de los modelos comparados son de conocimiento general y deberian verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato destacado |
|---|---|---|---|---|
| Jeethu/NeoHorse-1-4B-PARO | 1,13 B | No disponible | Apache-2.0 | Safetensors INT4 |
| Qwen2.5-1.5B | 1,5 B | 32k (segun ficha oficial) | Apache-2.0 | Safetensors, GGUF |
| Llama-3.2-1B | 1,23 B | 128k (segun ficha oficial) | Llama 3.2 Community | Safetensors, GGUF |
| SmolLM2-1.7B | 1,7 B | 8k (segun ficha oficial) | Apache-2.0 | Safetensors, GGUF |

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica "4B" pero el recuento real de parametros en safetensors es de aproximadamente 1,13B. Conviene no asumir el tamano por el nombre.
- Datos incompletos: no se especifican idiomas soportados, longitud de contexto ni composicion del dataset de entrenamiento.
- Sin benchmarks publicados: no hay evidencia numerica en la informacion disponible sobre la degradacion de calidad introducida por la cuantizacion INT4.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se documentan mitigaciones especificas.
- Sesgos: no documentados en la informacion disponible; cabe esperar los sesgos heredados del modelo base y de sus datos de entrenamiento.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria.
- Produccion: al ser una cuantizacion de un modelo pequeno, puede no alcanzar la fiabilidad de modelos mayores en tareas de razonamiento complejo. Se recomienda validar en el dominio concreto antes de desplegarlo.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (TokenRhythm/NeoHorse-1-4B) por si impusiera condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/Jeethu/NeoHorse-1-4B-PARO
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Paper: https://arxiv.org/abs/2511.10645
- Blog de ParoQuant: https://paroquant.z-lab.ai
- Repositorio GitHub: https://github.com/z-lab/paroquant
- Paquete PyPI: https://pypi.org/project/paroquant/
- Coleccion de modelos ParoQuant: https://huggingface.co/collections/z-lab/paroquant

Nota: los resultados de la busqueda web proporcionada (ome.tv y dominios asociados) no guardan relacion con el modelo y se han descartado por no ser fuentes relevantes.

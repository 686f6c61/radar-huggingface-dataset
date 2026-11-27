# mradermacher/QiMing-Socratic-12B-GGUF

## Resumen

QiMing-Socratic-12B-GGUF es la distribucion en formato GGUF del modelo QiMing-Socratic-12B, desarrollado originalmente por aifeifei798 y cuantizado por mradermacher. Se trata de un ajuste fino (LoRA) sobre una base Gemma 3 de aproximadamente 11.766 millones de parametros, orientado a tareas de toma de decisiones, analisis estrategico y razonamiento filosofico de inspiracion socratica. El modelo se publica bajo licencia Apache 2.0 y esta pensado para conversacion en chino e ingles.

La relevancia de esta ficha reside en que el repositorio ofrece cuantizaciones estaticas en multiples niveles (desde Q2_K hasta Q8_0, ademas de IQ4_XS), lo que permite desplegar un modelo de 12B en hardware de consumo. El autor del modelo original lo etiqueta como "cognitive-architecture" y "philosophy-driven-ai", lo que sugiere un entrenamiento orientado a estructurar el razonamiento mediante preguntas y contraste de hipotesis en lugar de respuestas directas.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explicitamente como "no disponible" aquellos campos sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 3, ajuste LoRA) |
| Parametros totales | 11.766.034.176 (~11,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); mmproj Q8_0 y f16; variantes imatrix en repo i1-GGUF |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3, una arquitectura transformer decoder-only de Google. Sobre esa base, aifeifei798 aplico un ajuste fino con LoRA (tag `lora` y `unsloth` en la model card), especializando el modelo en lo que el autor denomina "arquitectura cognitiva": toma de decisiones, analisis estrategico y razonamiento de tipo socratico. El repositorio de mradermacher es una conversion a GGUF del modelo fusionado, no un nuevo entrenamiento.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detalla la longitud de contexto nativa de la variante Gemma 3 empleada. La cuantizacion se realizo con el pipeline de mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye un modulo multimodal mmproj, lo que indica que el modelo base conserva capacidades de vision.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Razonamiento estructurado orientado a decision-making y analisis estrategico.
- Estilo socratico: formulacion de preguntas, contraste de hipotesis y descomposicion de problemas.
- Capacidades multimodales heredadas de Gemma 3 (el repo incluye ficheros mmproj Q8_0 y f16 para vision).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el enfoque de razonamiento estructurado es compatible.
- Capacidades multilingues limitadas a zh y en segun la model card.

## Casos de uso

- Asistencia en toma de decisiones empresariales: el modelo puede estructurar un problema en premisas, alternativas y criterios de evaluacion, gracias a su ajuste especifico en decision-making y analisis estrategico.
- Analisis filosofico y debate socratico: util para entornos educativos donde se busca que el modelo cuestione supuestos en lugar de dar respuestas cerradas, en linea con su entrenamiento "philosophy-driven-ai".
- Revision de estrategia de producto: el modelo puede actuar como sparring partner para contrastar hipotesis y detectar sesgos en un plan, con conversaciones multi-turno en chino o ingles.
- Prototipado de asistentes conversacionales especializados: al estar disponible en GGUF con cuantizaciones desde 4,9 GB, permite desplegar un asistente local en estaciones de trabajo sin GPU dedicada de gama alta.
- Educacion y tutorizacion: el estilo socratico encaja en tutoria guiada donde el modelo formula preguntas para llevar al estudiante a la conclusion.
- Investigacion en IA cognitiva: como objeto de estudio de tecnicas de ajuste LoRA sobre Gemma 3 para inducir estilos de razonamiento concretos.
- Procesamiento de documentos con componente visual: el modulo mmproj permite incorporar imagenes en el pipeline si se usa con un runtime compatible (por ejemplo, llama.cpp con soporte multimodal).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,9 GB
  - Q4_K_M: ~7,4 GB (recomendado por el autor de la cuantizacion por velocidad)
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
  - Q8_0: ~12,6 GB
  - mmproj (vision): +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M y Q5_K_M; RTX 4070/4080/4090 para Q8_0; A100/H100 solo si se necesita alto throughput por lotes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4 o inferiores; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; para el modulo de vision, llama.cpp con soporte mmproj.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QiMing-Socratic-12B-GGUF | ~11,77 B | no disponible | Apache 2.0 | GGUF | Ajuste LoRA sobre Gemma 3, enfoque socratico |
| Gemma 3 12B (base) | ~12 B | no disponible | Gemma Terms | safetensors, GGUF | Modelo generalista multimodal de Google |
| Mistral Nemo 12B | ~12 B | 128k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano similar |
| Qwen2.5 14B | ~14 B | 32k-128k (segun variante) | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Buena cobertura multilingue, no especializado en razonamiento socratico |

La comparativa se limita a tamano y licencia; no hay datos de rendimiento del modelo QiMing que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano no esta garantizado ni documentado.
- Alucinacion: al ser un ajuste fino de un modelo de 12B, mantiene el riesgo habitual de generar afirmaciones plausibles pero incorrectas, especialmente en dominios especializados.
- Contexto: se desconoce la longitud de contexto efectiva; conviene validarla antes de usarlo en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 3 esta sujeto a los terminos de Google, que deben respetarse en la distribucion y el uso.
- Especializacion: el ajuste socratico puede producir respuestas mas interrogativas o reflexivas de lo deseado en tareas que requieren respuestas directas y concisas.
- Datos de entrenamiento no publicados: no se puede auditar la composicion del dataset ni los sesgos inducidos.
- Tool calling y agentes: no confirmados; verificar antes de integrarlo en pipelines automatizados.
- Repositorio: 240 descargas y 1 like en el momento de la consulta, lo que indica baja validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/QiMing-Socratic-12B-GGUF
- Modelo base original: https://huggingface.co/aifeifei798/QiMing-Socratic-12B
- Variantes imatrix: https://huggingface.co/mradermacher/QiMing-Socratic-12B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#QiMing-Socratic-12B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests

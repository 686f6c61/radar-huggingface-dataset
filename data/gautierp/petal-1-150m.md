# GautierP/Petal-1-150M

## Resumen

Petal-1-150M es un modelo de lenguaje compacto de 152,7 millones de parametros entrenado desde cero por GautierP (laboratorio Chloris-Lab). Se distribuye en dos variantes dentro del mismo repositorio de Hugging Face: un modelo base preentrenado (`base/`) y un asistente conversacional afinado mediante SFT (supervised fine-tuning) en la raiz del repositorio. Su proposito es servir como pieza pequena y ligera para experimentacion, prototipado y despliegue en entornos con recursos muy limitados.

La arquitectura es un transformer decoder-only de 18 capas con dimension oculta 768, 12 cabezas de atencion, FFN de 2048, RoPE y embeddings atados (tied embeddings). El contexto maximo es de 2048 tokens y utiliza un tokenizador BPE con separacion de digitos y un vocabulario de 32.768 tokens. El modelo esta entrenado exclusivamente en ingles y se publica bajo licencia MIT.

Es relevante ahora como referencia de la franja "tiny" (por debajo de 200M de parametros), donde compite directamente con Pythia-160M y SmolLM2-135M. Su interes tecnico no esta en el conocimiento factual (inexistente a esta escala) sino en su bajo coste de inferencia, su licencia permisiva y la disponibilidad del codigo de entrenamiento y del arnes de evaluacion en abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (18 capas, dim 768, 12 cabezas, FFN 2048, RoPE, tied embeddings) |
| Parametros totales | 152.727.296 (152.596.224 segun model card; 127.430.400 no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors, es convertible a GGUF, int8 o int4 con herramientas estandar) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`, tag `custom_code`) |
| Tokenizador | BPE con separacion de digitos, vocabulario de 32.768 tokens |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseno clasico de transformer decoder-only con atencion causal, 18 bloques y normalizacion previa (no se detalla el tipo exacto de normalizacion en la informacion disponible). Emplea embeddings rotatorios (RoPE) para la codificacion posicional y ata los embeddings de entrada y de salida, lo que reduce el recuento de parametros efectivos: de los 152,6M totales, 127,4M corresponden a pesos no-embedding. El tokenizador es un BPE de 32.768 tokens con separacion explicita de digitos, una decision de diseno orientada a mejorar el manejo de numeros y aritmetica basica.

El repositorio contiene un checkpoint base preentrenado y, en la raiz, el mismo checkpoint tras un proceso de SFT para convertirlo en asistente conversacional con un formato de chat basado en lineas `System:`, `User:` y `Assistant:`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El codigo de entrenamiento esta publicado en el repositorio Chloris-Lab/Mini-LLM.

## Capacidades

- Generacion de texto en ingles con formato conversacional multi-turno (hasta cuatro turnos de historial recomendados por el autor).
- Aritmetica basica: el tokenizador con separacion de digitos y el prompt de sistema estan disenados para sumas y operaciones simples; el propio autor advierte que los casos multi-digito o multi-paso fallaran con frecuencia.
- Salida en Markdown: el prompt de sistema indica al modelo que use listas Markdown cortas cuando aporten claridad.
- Razonamiento de sentido comun limitado, medido en benchmarks como HellaSwag, PIQA o ARC-Easy (ver seccion de benchmarks).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo "thinking".
- Capacidad multilingue practicamente nula: entrenado solo en ingles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto: al ocupar menos de 1 GB en precision completa, permite validar arquitecturas de serving (transformers, vLLM, llama.cpp) en portatiles o contenedores pequenos antes de escalar a modelos mayores.
- Educacion e investigacion en entrenamiento de LLM: el codigo de entrenamiento (Chloris-Lab/Mini-LLM) y el arnes de evaluacion (Chloris-Lab/Mini-Eval) permiten reproducir el pipeline completo con recursos de una sola GPU consumer.
- Asistente conversacional de bajo coste en entornos embebidos o edge: con contexto de 2048 tokens y 152M de parametros, es viable en CPU o en GPUs integradas para tareas de respuesta breve y directa.
- Generacion de texto de relleno o plantillas: redaccion de respuestas cortas, resumenes de una linea o listas Markdown en aplicaciones donde la latencia y el coste importan mas que la precision factual.
- Aritmetica basica asistida: calculadora conversacional para sumas y operaciones simples, apoyandose en el tokenizador con separacion de digitos; adecuado como demo educativa, no como calculadora de produccion.
- Base para fine-tuning especifico de dominio: al ser un modelo pequeno con licencia MIT y pesos safetensors, sirve como punto de partida para ajustar tareas acotadas (clasificacion de texto, extraccion de campos) con datasets pequenos.
- Evaluacion comparativa de modelos tiny: incluido como referencia en suites de benchmark para modelos por debajo de 200M de parametros.

## Benchmarks y rendimiento

Resultados del protocolo v3 `small_lm` (zero-shot, conjuntos de test completos, batch 4) para el modelo base. El asistente SFT no se evalua en esta suite porque su formato de chat sustituye la evaluacion zero-shot cruda.

| Modelo | HellaSwag | ARC-Easy | ARC-Chall. | PIQA | WinoGrande | OpenBookQA | SciQ | LAMBADA | wikitext (bits/byte) | GSM8K |
|---|---|---|---|---|---|---|---|---|---|---|
| **Petal-1-150M (base)** | 0,336 | 0,479 | 0,261 | 0,628 | 0,519 | 0,300 | 0,685 | 0,279 | **0,890** | 0,012 |
| Pythia-160M-step143000 | 0,303 | 0,396 | 0,236 | 0,620 | 0,513 | 0,268 | 0,677 | 0,354 | 0,944 | 0,007 |
| SmolLM2-135M | 0,431 | 0,586 | 0,296 | 0,685 | 0,530 | 0,334 | 0,782 | 0,429 | 0,822 | 0,011 |

En wikitext (bits/byte, menor es mejor) Petal-1-150M obtiene 0,890, mejor que Pythia-160M (0,944) pero peor que SmolLM2-135M (0,822). En tareas de conocimiento y sentido comun queda por debajo de SmolLM2-135M en todas las columnas y por encima de Pythia-160M en la mayoria, salvo en LAMBADA (0,279 frente a 0,354). GSM8K es practicamente nulo en los tres modelos (0,007-0,012).

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 0,3 GB de pesos (152,7M parametros x 2 bytes) mas overhead de activaciones y cache KV; en la practica, menos de 1 GB.
- VRAM estimada en int8: aproximadamente 0,15 GB de pesos.
- VRAM estimada en int4: aproximadamente 0,08 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- GPU consumer: si, cabe en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: transformers (requiere `trust_remote_code=True` por el tag `custom_code`); al ser safetensors, es convertible a GGUF para llama.cpp u Ollama, y desplegable en vLLM o TGI tras la conversion, aunque no se documentan integraciones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| **Petal-1-150M** | 152,7M | 2048 | MIT | Ingles | Modelo tiny con codigo de entrenamiento y evaluacion abiertos; mejor bits/byte que Pythia-160M |
| Pythia-160M | 160M | 2048 | Apache 2.0 | Ingles | Suite de investigacion de EleutherAI con checkpoints intermedios; peor en la mayoria de benchmarks que Petal-1-150M |
| SmolLM2-135M | 135M | 8192 (segun model card publica de HuggingFaceTB) | Apache 2.0 | Ingles y multilingue parcial | Mejor rendimiento global en la tabla de benchmarks; contexto mayor |

SmolLM2-135M supera a Petal-1-150M en todas las tareas de la suite `small_lm` y ofrece mayor contexto, por lo que es la opcion preferente si el rendimiento es prioritario. Petal-1-150M mantiene ventaja en licencia MIT (frente a Apache 2.0, ambas permisivas) y en la publicacion del pipeline completo de entrenamiento y evaluacion.

## Limitaciones y advertencias

- Solo ingles: no se ha entrenado en otros idiomas y su rendimiento fuera del ingles no esta garantizado.
- Conocimiento factual practicamente inexistente: a 150M de parametros no hay espacio parametrico para conocimiento del mundo; el autor advierte explicitamente de que no se use para respuestas factuales.
- Alucinacion esperada: el modelo no puede citar fuentes y tiende a inventar contenido; cualquier dato importante debe verificarse.
- Aritmetica limitada: solo operaciones simples; los casos multi-digito o multi-paso fallaran con frecuencia, como refleja el 0,012 en GSM8K.
- Sin ajuste de seguridad: no es un modelo safety-tuned y su comportamiento de rechazo es minimo por diseno; no debe exponerse directamente a usuarios sin capas de moderacion.
- Contexto corto: 2048 tokens obliga a recortar historiales largos desde el principio, lo que puede perder informacion relevante en conversaciones multi-turno.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado (`custom_code`); conviene auditar el codigo antes de ejecutarlo en produccion.
- El asistente SFT no esta evaluado en la suite de benchmarks; los numeros publicados corresponden solo al modelo base.
- Sin datos publicados sobre composicion del dataset de entrenamiento, numero de tokens ni uso de RLHF/DPO, lo que limita la reproducibilidad mas alla del codigo disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GautierP/Petal-1-150M
- Codigo de entrenamiento: https://github.com/Chloris-Lab/Mini-LLM
- Arnes de evaluacion: https://github.com/Chloris-Lab/Mini-Eval

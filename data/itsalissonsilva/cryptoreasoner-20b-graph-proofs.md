# itsalissonsilva/CryptoReasoner-20B-Graph-Proofs

## Resumen

CryptoReasoner-20B-Graph-Proofs es un adaptador LoRA publicado por el usuario itsalissonsilva sobre el modelo base openai/gpt-oss-20b. Su propósito es muy específico: generar certificados constructivos para grafos de cifrado simbólico finitos, es decir, producir pruebas verificables de alcanzabilidad o imposibilidad de ataque en un modelo formal de protocolo criptográfico. No es un modelo de propósito general, sino un artefacto de investigación orientado a razonamiento simbólico dentro del dominio criptográfico.

El adaptador se distribuye como pesos PEFT (LoRA de solo atención, rank 32 por proyección) y se acompaña de un kernel determinista que valida de forma independiente los certificados generados. El autor reporta una mejora sustancial frente al modelo base en la tasa de certificados válidos sobre conjuntos de evaluación retenidos, lo que lo convierte en un caso interesante de especialización estrecha mediante fine-tuning ligero.

La relevancia actual radica en su enfoque metodológico: evaluación emparejada, splits congelados, verificación de tensores convertidos y comprobación determinista de resultados. Es un ejemplo de cómo documentar un adaptador de investigación con rigor reproducible, aunque su alcance práctico está limitado al dominio y a la disponibilidad de un benchmark concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base openai/gpt-oss-20b) con adaptador LoRA de solo atención |
| Parametros totales | 20B en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la evaluación usó BF16 para el base y FP32 para el adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre openai/gpt-oss-20b mediante LoRA de solo atención, con rank 32 por proyección. El autor indica que los nombres de módulos de atención de Tinker se mapearon a los nombres equivalentes en Hugging Face, y que se verificaron los 192 tensores convertidos a FP32 tras la carga, comprobando además que el hash de tokens de cada prompt coincidía con el fixture nativo. La revisión del modelo base está fijada en `6cee5e81ee83917806bbde320786a8fb61efebee`.

El entrenamiento se realizó sobre el dataset itsalissonsilva/crypto-protocol-traces-synthetic, que contiene trazas de protocolos criptográficos con etiquetas deterministas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable no está en la arquitectura, sino en el pipeline de evaluación: splits congelados mediante hash con sal, resultados emparejados, verificación independiente de certificados mediante un kernel determinista y comprobaciones de conversión de pesos.

## Capacidades

- Generación de certificados constructivos para grafos de cifrado simbólico finitos.
- Razonamiento simbólico dentro del dominio criptográfico (alcanzabilidad e imposibilidad de ataque).
- Producción de salidas verificables de forma independiente por un kernel determinista incluido en el repositorio.
- Ejecución mediante la clase `ProofPolicy` del paquete `proof.py` incluido en el repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Verificación de protocolos criptográficos en fase de diseño: el modelo genera certificados que el kernel determinista valida, permitiendo comprobar propiedades de alcanzabilidad sobre modelos formales antes de implementar el protocolo.
- Investigación en razonamiento simbólico: sirve como banco de pruebas para estudiar cómo el fine-tuning LoRA modifica la capacidad de un modelo base para producir pruebas formales en dominios estructurados.
- Auditoría asistida de modelos de amenaza: dado un grafo de cifrado simbólico, el adaptador puede proponer certificados que un analista revisa y contrasta con el kernel.
- Docencia en criptografía formal: permite ilustrar la diferencia entre una respuesta plausible y un certificado verificable, usando el kernel como árbitro.
- Evaluación de adaptadores especializados: el repositorio incluye splits congelados, resultados emparejados y fixtures que pueden reutilizarse para comparar otras estrategias de fine-tuning sobre el mismo benchmark.
- Reproducción de experimentos: el pipeline documentado (conversión de tensores, verificación de hashes de prompts, evaluación emparejada) sirve como plantilla para publicar adaptadores de investigación reproducibles.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. La evaluación de Hugging Face usa 96 casos retenidos emparejados; la evaluación nativa en Tinker usa 768 casos retenidos.

| Split | Casos | Base | Adaptador |
|---|---:|---:|---:|
| Todos los casos (HF) | 96 | 2.1% | 51.0% |
| Grafos más profundos (HF) | 32 | 3.1% | 46.9% |
| Distribución familiar (HF) | 32 | 3.1% | 84.4% |
| Estructuras de grafo no vistas (HF) | 32 | 0.0% | 21.9% |
| Evaluación nativa completa (Tinker) | 768 | 4.9% | 55.7% |
| Mismos 96 casos en evaluación nativa | 96 | 3.1% | 53.1% |

La ganancia emparejada en la evaluación de HF fue de +49.0 puntos porcentuales (intervalo bootstrap agrupado al 95%: +35.4 a +61.5). La métrica es la tasa de certificados válidos.

## Requisitos de hardware

- La configuración medida por el autor usó una NVIDIA A100-SXM4-80GB con inferencia del base en BF16 y pesos del adaptador en FP32.
- VRAM estimada para el modelo base de 20B en BF16: aproximadamente 40 GB solo para pesos, más overhead de activaciones y KV cache; no se dispone de cifras oficiales para cuantizaciones del adaptador.
- GPU recomendadas según la configuración reportada: A100 80GB. Para el base en cuantización de 8 o 4 bits podrían considerarse GPUs consumer de gama alta, pero no hay datos publicados que lo confirmen para este adaptador.
- Opciones de despliegue: el autor documenta el uso del paquete PEFT con la clase `ProofPolicy` y `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La búsqueda web solo devuelve referencias a un dataset relacionado del mismo autor y a una nota sobre FlashProve de Anthropic, que aborda un problema distinto (pruebas criptográficas de procedencia de inferencia), por lo que no constituye una alternativa comparable en la tarea de generación de certificados sobre grafos de cifrado simbólico.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CryptoReasoner-20B-Graph-Proofs | 20B (base) + LoRA | no disponible | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento varía notablemente según la familia y profundidad del grafo: 84.4% en distribución familiar frente a 21.9% en estructuras no vistas.
- La tasa de certificados válidos es del 51.0% en la evaluación de HF, lo que implica que aproximadamente la mitad de las salidas no superan la verificación del kernel.
- El modelo está especializado en un dominio muy estrecho; no debe emplearse como modelo de propósito general.
- No se documentan sesgos conocidos, pero tampoco se ha realizado una evaluación de sesgos.
- Riesgo de alucinación inherente a los modelos de lenguaje: la verificación mediante el kernel determinista es obligatoria antes de aceptar cualquier certificado.
- No se especifican los idiomas soportados ni el comportamiento multilingüe.
- La licencia apache-2.0 permite uso comercial, pero debe respetarse la licencia del modelo base openai/gpt-oss-20b, cuyos términos no se detallan en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de una publicación de investigación sin validación externa conocida.
- No se dispone de información sobre latencia, throughput ni requisitos de memoria para cuantizaciones del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsalissonsilva/CryptoReasoner-20B-Graph-Proofs
- Dataset de entrenamiento: https://huggingface.co/datasets/itsalissonsilva/crypto-protocol-traces-synthetic/tree/f32dedb95a889ae8ff550eb61ca2e8a1bd9db5f9
- Trabajo de evaluación en Hugging Face: https://huggingface.co/jobs/itsalissonsilva/6aee41330e0338d1bb822d10
- Dataset relacionado del mismo autor: https://huggingface.co/datasets/itsalissonsilva/crypto-arithmetic-proofs-synthetic/viewer
- Nota sobre FlashProve de Anthropic (contexto, no comparable): https://www.unite.ai/anthropic-releases-flashprove-for-cryptographic-ai-inference-proofs/

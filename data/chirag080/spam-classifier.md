# Chirag080/spam-classifier

## Resumen

Chirag080/spam-classifier es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Chirag080 en Hugging Face. El nombre sugiere que su proposito es la clasificacion de spam, aunque la model card no documenta la tarea concreta, el dataset utilizado ni el formato de etiquetas. El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) con la libreria TRL, segun declara el propio autor.

El modelo base, Qwen2.5-1.5B-Instruct, es un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto de 32.768 tokens en su version original y capacidades multilingues. Este ajuste hereda esa arquitectura, pero el autor no ha publicado informacion sobre el proceso de entrenamiento, los datos empleados ni los resultados obtenidos.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas, cero likes, un repositorio de 0,0 GB (lo que sugiere que los pesos pueden no estar subidos o son de tamano minimo) y una model card generada automaticamente por la plantilla de TRL. No hay benchmarks, no hay licencia declarada de forma explicita y no hay documentacion de la tarea. Se recomienda precaucion antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | no disponible (formato publicado en safetensors, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponibles (el modelo base es multilingue, pero el ajuste no lo documenta) |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 1.18.0, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |
| Metodo de entrenamiento | SFT (Supervised Fine-Tuning) |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y sesgo de atencion QKV (caracteristicas tipicas de la familia Qwen2.5). El modelo base emplea atencion con RoPE (Rotary Position Embeddings) y fue preentrenado por Alibaba con un corpus multilingue de gran escala, seguido de un proceso de instruccion y alineacion. Sin embargo, el autor de este ajuste no documenta ningun detalle adicional sobre la arquitectura modificada, si la hubo.

El entrenamiento se realizo mediante SFT con TRL, segun la model card, pero no se especifica el numero de tokens, la composicion del dataset, si hubo RLHF o DPO posterior, ni la funcion de perdida. Tampoco se indica si se congelaron capas, se aplico LoRA o se entreno el modelo completo. La ausencia de esta informacion impide evaluar la calidad del ajuste o reproducir el proceso. La unica innovacion tecnica mencionada es el uso de TRL como framework, lo cual es un detalle de implementacion, no una contribucion arquitectonica.

## Capacidades

- Generacion de texto: hereda la capacidad del modelo base para generar texto coherente en varios idiomas, aunque el ajuste no documenta su rendimiento especifico.
- Clasificacion de spam (presunta): el nombre del modelo sugiere esta tarea, pero no hay documentacion sobre el formato de entrada/salida ni las etiquetas.
- Razonamiento y matematicas: el modelo base Qwen2.5-1.5B-Instruct tiene capacidades basicas de razonamiento y matematicas, pero el ajuste no las documenta.
- Codigo: el modelo base soporta generacion de codigo, pero no hay evidencia de que este ajuste lo preserve.
- Tool calling / function calling: no documentado en la model card; el modelo base Qwen2.5 lo soporta, pero el ajuste no lo garantiza.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en el ajuste; el modelo base soporta varios idiomas.
- Modo thinking: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Filtrado de correo electronico no deseado: si el ajuste funciona como clasificador binario, podria integrarse en un pipeline de preprocesamiento de correos para etiquetar mensajes como spam o ham, aunque no hay evidencia publicada de su precision.
- Moderacion de comentarios en foros: el modelo podria emplearse para detectar mensajes promocionales o repetitivos, pero requeriria validacion previa con un conjunto de datos etiquetado.
- Clasificacion de mensajes en atencion al cliente: para separar consultas legitimas de intentos de phishing o spam, siempre que se documente el formato de salida esperado.
- Prototipado rapido de clasificadores de texto: al estar basado en un modelo pequeno (1.5B), puede ejecutarse en hardware modesto para experimentar con tecnicas de SFT.
- Investigacion sobre ajuste fino con TRL: util como ejemplo de pipeline SFT, aunque la falta de documentacion limita su valor como referencia reproducible.
- Filtrado de resenas falsas en comercio electronico: el modelo podria adaptarse para detectar patrones de spam en resenas, pero sin datos de evaluacion no se puede garantizar su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 (1.5B parametros x 2 bytes), unos 1,5 GB en cuantizacion de 8 bits y alrededor de 1 GB en 4 bits.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 con margen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: transformers (pipeline de text-generation), vLLM, TGI, llama.cpp (previa conversion a GGUF, no publicada), Ollama (previa conversion). El autor solo documenta el uso con transformers.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1.5B, se espera una latencia baja en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chirag080/spam-classifier | 1.5B | no disponible (base: 32.768) | no disponible | Hugging Face, 0 descargas | Ajuste SFT sin documentacion |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, documentado y con benchmarks |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy popular | Alternativa de tamano similar con licencia restrictiva |
| google/gemma-2-2b-it | 2.6B | 8.192 tokens | Gemma Terms of Use | Hugging Face, popular | Mayor tamano, contexto menor |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar el modelo base Qwen2.5, podria reproducir sesgos presentes en sus datos de preentrenamiento, pero no hay evaluacion al respecto.
- Riesgo de alucinacion: alto en tareas generativas, ya que el ajuste no documenta ninguna mitigacion. En clasificacion, el riesgo depende del formato de salida, que no se especifica.
- Limitaciones de contexto o idioma: no documentadas. El modelo base soporta 32.768 tokens y varios idiomas, pero el ajuste podria haber degradado estas capacidades.
- Restricciones de licencia para uso comercial: la licencia no esta declarada de forma explicita ("licence: license"), lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el ajuste no hereda automaticamente esa licencia sin declaracion del autor.
- Caveats para produccion: repositorio de 0,0 GB (posiblemente los pesos no estan subidos o son incompletos), cero descargas, cero likes, model card generada automaticamente sin documentacion de la tarea, el dataset ni los resultados. No se recomienda su uso en produccion sin una validacion exhaustiva previa.
- El ejemplo de "Quick start" de la model card usa una pregunta generica sobre viajes en el tiempo, no un ejemplo de clasificacion de spam, lo que sugiere que la plantilla no se personalizo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chirag080/spam-classifier
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Documentacion de TRL (SFT): https://huggingface.co/docs/trl/sft_trainer

# Ayuti25/lab7-shakespeare-generator

## Resumen

lab7-shakespeare-generator es un ajuste fino (fine-tuning) del modelo SmolLM2-135M de HuggingFaceTB, publicado por el usuario Ayuti25 en HuggingFace. Se trata de un modelo de generacion de texto de tipo decoder-only basado en la arquitectura Llama, con 134.515.008 parametros totales, entrenado para generar texto con estilo shakespeariano segun indica su nombre. El repositorio tiene un tamano de 0,5 GB y los pesos se distribuyen en formato safetensors.

El modelo parte de SmolLM2-135M, un modelo compacto disenado para entornos con recursos limitados, y ha sido reentrenado durante 2 epocas con un learning rate de 0,0005, batch size de 8 y scheduler coseno, alcanzando una perdida de validacion de 3,2402. La model card es practicamente automatica y no documenta el dataset de entrenamiento, los idiomas soportados ni los casos de uso previstos, por lo que la informacion disponible es muy limitada.

Su relevancia es escasa en terminos de rendimiento o novedad tecnica: se trata de un experimento de fine-tuning de un modelo pequeno, sin benchmarks publicados (la seccion `model-index` esta vacia) y sin descargas ni interacciones en el momento de la consulta. Resulta util unicamente como ejemplo de ajuste de SmolLM2 para una tarea estilistica concreta o como material didactico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de HuggingFaceTB/SmolLM2-135M, un transformer decoder-only de la familia Llama con 134,5 millones de parametros. No se documenta ninguna modificacion arquitectonica respecto al modelo base: se trata de un ajuste supervisado estandar realizado con la libreria Transformers (version 5.14.1) y PyTorch 2.9.1+cu128. La model card indica que fue generado automaticamente por el Trainer y no aporta detalles sobre la composicion del dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO o similares.

Los hiperparametros documentados son: learning rate de 0,0005, batch size de entrenamiento y evaluacion de 8, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 50 pasos de warmup, semilla 42 y 2 epocas completas (728 pasos). La perdida de entrenamiento descendio de 3,3220 a 2,4518, mientras que la perdida de validacion se estabilizo en torno a 3,24 desde el paso 400, lo que sugiere un sobreajuste temprano al dataset de ajuste. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base SmolLM2-135M.
- Generacion de texto con estilo shakespeariano, segun el nombre del modelo (no verificado en la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta informado).
- No se documentan capacidades especiales (modo thinking, vision, audio).

## Casos de uso

- Generacion de texto creativo con estilo isabelino: el modelo puede producir parrafos con registro arcaico ingles para prototipos de narrativa o teatro, dado que su ajuste parece orientado a ese dominio por el nombre del repositorio.
- Material didactico para practicas de fine-tuning: sirve como ejemplo reproducible de ajuste de SmolLM2-135M con hiperparametros documentados (lr 5e-4, 2 epocas, AdamW) en cursos o laboratorios de NLP.
- Pruebas de pipelines de inferencia ligeros: al ocupar 0,5 GB en safetensors, puede desplegarse en entornos con recursos minimos para validar integraciones con Transformers o text-generation-inference.
- Generacion de texto en dispositivos de borde: por su tamano reducido, es viable en CPU o GPUs de gama baja para tareas de generacion corta donde no se requiera alta calidad.
- Experimentos de comparacion de estilos: permite contrastar la salida del modelo base frente al ajustado para medir el efecto del fine-tuning en el registro linguistico.
- Base para nuevos ajustes: puede servir como punto de partida para fine-tunings posteriores sobre dominios especificos, dado que su licencia Apache 2.0 lo permite.

## Benchmarks y rendimiento

El `model-index` del modelo declara una lista de resultados vacia. La unica metrica publicada es la perdida de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion final (epoca 2, paso 728) | 3,2402 |
| Perdida de entrenamiento final | 2,4518 |
| Perdida de validacion minima observada | 3,2052 (paso 300) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5 M de parametros x 4 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,27 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para generacion de baja latencia.
- Opciones de despliegue: Transformers (libreria nativa del modelo), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp u Ollama si se convierte a GGUF (no se distribuyen pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lab7-shakespeare-generator | 134,5 M | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| HuggingFaceTB/SmolLM2-135M (base) | 135 M | 8.192 tokens (segun documentacion del modelo base) | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 360 M | 8.192 tokens (segun documentacion del modelo base) | Apache 2.0 | HuggingFace |
| Qwen2.5-0.5B | 0,5 B | 32.768 tokens (segun documentacion del modelo) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo para este ajuste concreto, ya que no se han publicado benchmarks. El modelo base SmolLM2-135M y sus variantes cuentan con evaluaciones publicas por parte de HuggingFaceTB, pero no se reproducen aqui al no formar parte de la informacion proporcionada sobre este modelo.

## Limitaciones y advertencias

- La model card es automatica y no documenta el dataset de entrenamiento, los idiomas ni los usos previstos, lo que impide evaluar sesgos y cobertura linguistica.
- La perdida de validacion se estanca a partir del paso 400 mientras la de entrenamiento sigue bajando, lo que indica sobreajuste al conjunto de ajuste y riesgo de baja generalizacion.
- Riesgo elevado de alucinacion y de generar texto incoherente fuera del dominio shakespeariano, dado el tamano reducido del modelo base (135 M) y la falta de evaluacion.
- No se documenta la longitud de contexto efectiva del ajuste; debe asumirse la del modelo base, no verificada en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de entrenamiento, lo que traslada al usuario la responsabilidad sobre posibles infracciones de derechos de autor del corpus.
- Sin descargas ni validacion por parte de la comunidad: no hay evidencia externa de calidad.
- No apto para tareas que requieran razonamiento complejo, codigo, matematicas o tool calling, capacidades no documentadas ni esperables en un modelo de este tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ayuti25/lab7-shakespeare-generator
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M

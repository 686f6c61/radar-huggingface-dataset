# rasa04/tinylm-11m

## Resumen

TinyLM-11M es un modelo de lenguaje de 10,56 millones de parámetros, entrenado desde cero en una sola noche sobre una GPU RTX 5090. Lo desarrolla el autor independiente rasa04 como un experimento de entrenamiento completo sin depender de bibliotecas como `transformers`, `trl` o `accelerate` en la fase de entrenamiento. El modelo está diseñado para producir inglés coherente en formatos cortos, mantener el formato de chat y resolver problemas aritméticos simples paso a paso.

Su arquitectura es compatible con Qwen3 e incorpora RMSNorm, SwiGLU, QK-norm, atención con consultas agrupadas (GQA) y embeddings atados. El contexto es de 512 tokens y el vocabulario es un BPE propio de 8192 tokens, con los dígitos separados individualmente para facilitar el aprendizaje de operaciones aritméticas. Se entrenó con 6,55 mil millones de tokens procedentes de TinyStoriesV2-GPT4, SimpleStories, BabyLM, TinyStories-Instruct y una sintética algorítmica propia, seguido de un ajuste fino supervisado (SFT) de 2500 pasos.

La relevancia de este modelo reside en su carácter demostrativo: muestra que con un presupuesto de parámetros extremadamente reducido y un pipeline de entrenamiento artesanal se pueden obtener capacidades básicas de razonamiento y formato conversacional, a la vez que evidencia los límites físicos de la capacidad de conocimiento de los modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-compatible: RMSNorm, SwiGLU, QK-norm, GQA (8 cabezas / 2 KV), RoPE, tied embeddings |
| Parametros totales | 10.558.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF Q8_0 (11 MB) y GGUF f16 (20 MB) |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa compatible con Qwen3. La forma concreta es: dimension del modelo d=256, 12 capas, dimension de la FFN 704, 8 cabezas de atencion con 2 cabezas KV (GQA), normalizacion RMSNorm, activacion SwiGLU, QK-norm y embeddings atados. El contexto maximo es de 512 tokens.

El entrenamiento se realizo con un optimizador Muon (con iteraciones Newton-Schulz de 5 pasos) aplicado a los pesos 2D, y AdamW para los embeddings. Se uso un programa de tasa de aprendizaje WSD (warmup-stable-decay) con cautious weight decay. Se procesaron 6,55 mil millones de tokens en 132 minutos sobre una RTX 5090, lo que equivale a 2,4 epocas sobre un corpus unico de 2,76 mil millones de tokens. Los datos incluyen TinyStoriesV2-GPT4, SimpleStories, BabyLM (corpus humano: habla infantil, libros infantiles, Simple Wikipedia y conversacion), TinyStories-Instruct y una sintetica algoritmica propia. Las proporciones de cada fuente variaron durante el entrenamiento siguiendo un curriculum que iba desde la coherencia del habla hasta instrucciones y tareas. El SFT posterior se realizo durante 2500 pasos, calculando la perdida solo sobre los tokens del asistente.

## Capacidades

- Generacion de texto en ingles coherente en formatos cortos, como historias sencillas.
- Razonamiento aritmetico paso a paso: suma, resta, conteo, ordenacion, parentesis, reglas, recorrido de grafos y comparaciones, con digitos separados individualmente.
- Mantenimiento del formato de chat con las etiquetas `<|user|>` y `<|assistant|>`.
- Capacidad limitada de seguir instrucciones cortas.
- No dispone de conocimiento factual del mundo, no genera codigo y no mantiene dialogos largos.

## Casos de uso

- Demostracion educativa de aritmetica: el modelo puede explicar paso a paso operaciones como sumas y restas de dos o tres digitos, lo que resulta util en entornos de ensenanza asistida por IA.
- Prototipado de pipelines de entrenamiento desde cero: al ser un modelo tiny con un ciclo de entrenamiento propio, sirve como banco de pruebas para validar tecnicas de optimizacion, curriculum y SFT antes de escalar a modelos mayores.
- Experimentacion con arquitecturas compactas: investigadores pueden estudiar el comportamiento de GQA, QK-norm y Muon en un entorno de recursos minimos.
- Generacion de historias cortas para ninos: el modelo produce narraciones simples y coherentes, adecuadas para aplicaciones de cuentos infantiles automatizados.
- Pruebas de integracion con GGUF: los archivos Q8_0 y f16 se pueden cargar en LM Studio, llama.cpp u Ollama para verificar la compatibilidad del formato y el chat template.
- Investigacion sobre limites de capacidad: permite analizar cuantos bits por parametro se necesitan para tareas de coherencia linguistica frente a conocimiento enciclopedico.

## Benchmarks y rendimiento

El autor no ha publicado resultados en benchmarks estandar como MMLU, ARC o HumanEval, al considerarlos irrelevantes para un modelo de este tamano. En su lugar, proporciona metricas propias sobre un conjunto de validacion de 64 tareas held-out con decodificacion greedy:

| Prueba | Resultado |
|---|---|
| Tareas algoritmicas, total | 98,4 % |
| Suma / conteo / ordenacion / parentesis / reglas / recorrido de grafo / comparacion | 100 % |
| Resta | 87,5 % |
| Mantenimiento del formato de chat | 100 % |
| Frases con mayuscula inicial | 88,5 % |
| Frases con terminador | 91,2 % |
| Repeticion de 5-gramas | 0,2 % |

Perdida de validacion: historias 1,269 (0,457 bits/char), instrucciones 1,288, sintetica 0,203, texto humano 3,068.

## Requisitos de hardware

- Inferencia en CPU sin GPU: el modelo en Q8_0 ocupa 11 MB y en f16 20 MB, por lo que cabe en cualquier sistema, incluso en un microcontrolador o en un navegador.
- VRAM estimada: menos de 1 GB, aunque en la practica puede ejecutarse en RAM convencional.
- GPU recomendada: cualquiera, incluso integradas; una RTX 5090 se uso para el entrenamiento, pero la inferencia no requiere nada especifico.
- Compatible con LM Studio, llama.cpp, Ollama y cualquier runtime que soporte GGUF.
- Latencia: del orden de milisegundos por token en CPU moderna; throughput no especificado por el autor.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables del mismo tamano (10-11 M de parametros) con los que contrastar directamente. Existen modelos tiny como los de la familia TinyStories (1-10 M), pero no se han publicado resultados comparables en las mismas tareas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Solo soporta ingles; el autor indica que un modelo bilingue con este presupuesto reduciria a la mitad la capacidad efectiva.
- No tiene conocimiento factual del mundo: la capacidad de almacenamiento del transformer se estima en unos 2 bits por parametro, lo que supone unos 2,7 MB para todo el conocimiento, un limite fisico.
- Fuera de su dominio (historias simples, instrucciones cortas, aritmetica de 2-3 digitos) el modelo produce respuestas incorrectas con alta confianza.
- Entrenado principalmente con datos sinteticos generados por GPT-4 y gpt-4o-mini, ademas del corpus humano BabyLM; puede heredar sesgos o patrones de esos datos.
- Contexto limitado a 512 tokens, insuficiente para dialogos extensos o documentos largos.
- No apto para uso en produccion real sin una evaluacion exhaustiva de sus limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rasa04/tinylm-11m
- No se han encontrado otros enlaces relevantes (paper, blog o repositorio) en la busqueda web; los resultados de "tinylm" corresponden a proyectos no relacionados.

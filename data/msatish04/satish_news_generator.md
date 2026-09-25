# MSatish04/Satish_News_Generator

## Resumen

Satish_News_Generator es un ajuste fino supervisado de Qwen/Qwen2.5-3B-Instruct, publicado por el desarrollador Satish Marineni (MSatish04) en HuggingFace. El modelo recibe una instruccion y genera un pasaje corto de estilo abstract de investigacion, condicionado a uno de dos estilos de escritura: "human writer" (escritor humano) o "AI system" (sistema de IA). No es un generador de noticias pese al nombre: el autor reconoce que los datos de entrenamiento son mayoritariamente abstracts academicos.

Tecnicamente es un transformer causal decoder-only de la familia Qwen2, con 3.085.938.688 parametros (aproximadamente 3,1 B), pesos fusionados en float16 dentro de un unico fichero `model.safetensors` de unos 6,2 GB. Se entreno con QLoRA (cuantizacion 4-bit NF4 mas adaptadores LoRA con r = 64 y alpha = 16) sobre una GPU T4 gratuita de Google Colab, y los adaptadores se fusionaron en el modelo base, de modo que se carga como un modelo `transformers` estandar sin necesidad de `peft`.

Su relevancia es limitada y muy acotada: se trata de un proyecto de portafolio y aprendizaje que documenta un pipeline completo de SFT (preparacion de entorno, formateo de datos, entrenamiento QLoRA, fusion de adaptadores y publicacion en el Hub), no de un modelo de proposito general. A fecha de la informacion disponible acumula 0 descargas y 0 likes, y carece de evaluacion formal: la separacion de estilos solo se comprobo cualitativamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia Qwen2, ajustado para instrucciones/chat |
| Parametros totales | 3.085.938.688 (~3,1 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens (no verificado en la informacion proporcionada) |
| Tipos de cuantizacion | pesos publicados en float16; no se publican versiones GGUF, AWQ, GPTQ ni de 8/4 bits (la cuantizacion 4-bit NF4 se uso solo durante el entrenamiento QLoRA) |
| Idiomas soportados | ingles (`en`) |
| Licencia | qwen-research (heredada de Qwen/Qwen2.5-3B-Instruct); declarada como `other` en el Hub |
| Formato de pesos | safetensors (un unico `model.safetensors`, ~6,2 GB, float16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct: un transformer causal decoder-only denso con atencion por consultas agrupadas (GQA) y tokenizador BPE de Qwen. El ajuste fino no modifica la arquitectura, solo los pesos, ya que los adaptadores LoRA se fusionaron en el modelo base antes de publicarlo. El entrenamiento se hizo con QLoRA y `SFTTrainer` de TRL: cuantizacion 4-bit NF4 con dtype de computo float16 y sin doble cuantizacion, adaptadores LoRA con r = 64, alpha = 16, dropout = 0,1, bias = none y tarea CAUSAL_LM. Se ejecuto una sola epoca sobre una GPU T4 de 16 GB, sin evaluacion formal posterior.

Los datos proceden del dataset `dataspoof/Fine_tuned_project` (`data_for_preprocessing.csv`), con 6.069 filas y tres columnas: `Text` (un pasaje corto, mayoritariamente estilo abstract de investigacion), `Author` (etiqueta `AI` o `Human`) y `Unnamed: 0` (indice de fila, descartado). El dataset parece derivarse del Kaggle AI and Human Text Dataset. Cada fila se convirtio en una conversacion de tres turnos con la plantilla de chat de Qwen: un mensaje de sistema fijo ("You are a helpful writing assistant."), un mensaje de usuario con la plantilla "Write a short informative passage in the style of {a human writer | an AI system}." (el estilo se seleccionaba segun la etiqueta `Author`) y el texto de la fila como respuesta del asistente. No se aplicaron RLHF ni DPO. La model card se corta en la lista de hiperparametros, por lo que el resto de valores de entrenamiento (learning rate, scheduler, warmup) no estan disponibles.

## Capacidades

- Generacion de texto corto en ingles, con formato de pasaje informativo o abstract academico.
- Control de estilo binario: produce texto marcado como "human-written" o "AI-generated" segun la instruccion.
- Formato conversacional: usa el chat template de Qwen (`system` + `user` + `assistant`) y funciona mejor con el formato exacto de prompt del entrenamiento.
- Seguimiento de instrucciones heredado del modelo base Qwen2.5-3B-Instruct, aunque el ajuste lo especializa en la tarea de generacion de pasajes.
- Soporte de tool calling / function calling: no documentado en la model card (el modelo base lo soporta, pero este ajuste no lo declara ni lo evalua).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no. Solo ingles declarado.
- Capacidad especial de modo "thinking": no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Generacion de datasets sinteticos para detectores de texto de IA: el modelo puede producir pares de muestras etiquetadas como "humanas" y "de IA" a partir de la misma instruccion de estilo, lo que permite construir o ampliar conjuntos de entrenamiento para clasificadores binarios de autoridad textual.
- Pruebas de robustez y evaluacion adversarial de detectores: al generar pasajes de estilo humano y de estilo IA de forma controlada, sirve para medir falsos positivos y falsos negativos de un detector concreto ante textos de distinta procedencia.
- Aumento de datos para tareas de clasificacion de texto: los pasajes generados pueden usarse como ejemplos adicionales en pipelines de NLP cuando el corpus original (6.069 filas) es demasiado pequeno.
- Material docente para pipelines de SFT: al estar construido con QLoRA y TRL sobre una T4, sirve como referencia reproducible para explicar cuantizacion 4-bit, adaptadores LoRA, fusion de pesos y publicacion en el Hub.
- Punto de partida para nuevos ajustes finos: su estructura de pesos estandar (safetensors fusionados, sin `peft`) permite reentrenar o especializar el modelo con tecnicas de PEFT sobre un dominio distinto.
- Generacion de texto de relleno en entornos de desarrollo y QA: para poblar interfaces, maquetas o pruebas de carga con texto plausible en ingles sin depender de contenido real, siempre etiquetando la salida como generada.
- Creacion de corpus de contraste para investigacion sobre estilo de escritura: util para estudiar que rasgos superficiales (longitud de frase, vocabulario, conectores) diferencian el texto percibido como humano frente al percibido como generado por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el entrenamiento fue de una epoca sobre unos 6.000 ejemplos cortos y que no hubo evaluacion formal; la separacion entre estilos "humano" y "IA" solo se comprobo de forma cualitativa.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: entre 7 y 9 GB para contexto corto (6,2 GB de pesos mas cache KV). Con contexto largo la cifra sube de forma apreciable.
- VRAM estimada con cuantizacion de 8 bits: en torno a 3,5-4 GB. Con cuantizacion de 4 bits: en torno a 2-2,5 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: T4 de 16 GB (la usada en el entrenamiento), RTX 3060 de 12 GB, RTX 4070, RTX 4090, A10G, L4, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si. En float16 entra en tarjetas con 8-12 GB de VRAM; en 4 bits entra incluso en GPUs de 4-6 GB. Tambien puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `pipeline` (forma documentada por el autor), Text Generation Inference (los tags del repo incluyen `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp u Ollama o LM Studio previa conversion a GGUF (no se publican pesos GGUF).
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Satish_News_Generator | ~3,1 B (denso) | no especificado (heredado del base) | qwen-research | safetensors, float16 |
| Qwen2.5-3B-Instruct (base) | ~3,1 B (denso) | 32.768 tokens (ampliable con YaRN) | qwen-research | safetensors, multiples precisiones |
| Llama-3.2-3B-Instruct | ~3,2 B (denso) | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF en la comunidad |
| Phi-3.5-mini-instruct | ~3,8 B (denso) | 128.000 tokens | MIT | safetensors, GGUF en la comunidad |

Nota: los datos de los tres modelos de comparacion provienen de sus especificaciones publicas habituales y no se han verificado contra la informacion proporcionada en esta busqueda. No existen resultados de benchmarks publicados para Satish_News_Generator, por lo que no es posible comparar rendimiento numerico con las alternativas. En la practica, Satish_News_Generator no compite con estos modelos como modelo de proposito general: esta especializado en una tarea de generacion de pasajes con estilo controlado y con licencia restrictiva.

## Limitaciones y advertencias

- Nombre enganoso: pese a llamarse "News_Generator", los datos de entrenamiento son mayoritariamente abstracts academicos, por lo que las salidas se parecen mas a resumenes de investigacion que a noticias.
- Alucinacion alta y explicitamente reconocida: el modelo produce estudios, ubicaciones, fechas y estadisticas verosimiles pero inventados. No es una fuente de hechos.
- No es un detector de texto de IA: fue entrenado para generar texto con un estilo, no para clasificarlo.
- Falta de control de tema: durante el entrenamiento los prompts solo especificaban el estilo, nunca el tema, por lo que el modelo puede no seguir de forma fiable un tema anadido al prompt.
- Entrenamiento muy limitado: una epoca sobre aproximadamente 6.000 ejemplos cortos y sin evaluacion formal; la separacion de estilos no esta cuantificada.
- Sesgos heredados: arrastra los sesgos y limitaciones del modelo base Qwen2.5-3B-Instruct y del dataset de origen.
- Idioma: solo ingles declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Licencia restrictiva: hereda la Qwen Research License, orientada a investigacion. Es imprescindible revisar el texto completo de la licencia antes de cualquier uso comercial o despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes en el Hub, sin mantenimiento documentado ni comunidad que haya validado el modelo.
- Uso fuera de alcance declarado por el autor: contexto medico, legal, cientifico o de reportaje periodistico, asi como presentar el texto generado como trabajo humano o academico genuino.
- Recomendacion del autor: etiquetar siempre la salida como generada por IA y verificar de forma independiente cualquier afirmacion factual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MSatish04/Satish_News_Generator
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/dataspoof/Fine_tuned_project
- Dataset de origen (Kaggle, AI and Human Text Dataset): https://www.kaggle.com/datasets/hasanyiitakbulut/ai-and-human-text-dataset
- Referencia arXiv incluida en los tags del repo (1910.09700, no relacionada directamente con este modelo): https://arxiv.org/abs/1910.09700
- Perfil del autor: https://huggingface.co/MSatish04

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos corresponden a generadores de articulos de noticias sin relacion y a agregadores de noticias sobre lanzamientos de IA.

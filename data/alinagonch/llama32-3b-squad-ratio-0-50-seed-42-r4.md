# AlinaGonch/llama32-3b-squad-ratio-0.50-seed-42-r4

## Resumen

`AlinaGonch/llama32-3b-squad-ratio-0.50-seed-42-r4` es un ajuste fino (fine-tuning) del modelo Llama 3.2 de 3 000 millones de parámetros, publicado en HuggingFace por la usuaria AlinaGonch. El identificador del repositorio sugiere un experimento de ajuste supervisado sobre el conjunto de datos SQuAD (Stanford Question Answering Dataset), con una proporción de datos del 0,50, semilla aleatoria 42 y un rango de adaptadores LoRA de 4. Se trata, por tanto, de un artefacto de investigación orientado a estudiar el comportamiento de LoRA sobre tareas de question answering extractivo, y no de un modelo de propósito general listo para producción.

La relevancia de este tipo de publicaciones radica en que forman parte de barridos sistemáticos de hiperparámetros (variaciones de ratio de datos, semilla y rango LoRA) que permiten reproducir y comparar configuraciones de ajuste eficiente. El modelo base, Llama 3.2 3B, es un transformer decoder-only con Grouped-Query Attention (GQA), RMSNorm y RoPE, diseñado por Meta para generación de texto multilingüe.

La model card del repositorio es la plantilla automática de HuggingFace y no contiene información cumplimentada: no se declaran licencia, idiomas, datos de entrenamiento ni resultados de evaluación. El tamaño del repositorio figura como 0,0 GB y el modelo acumula 0 descargas y 0 likes en el momento de la consulta, lo que refuerza su carácter de experimento aislado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.2 3B: GQA, RMSNorm, RoPE, SwiGLU) |
| Parametros totales | 3 000 millones (aproximado, segun el identificador y el modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.2 3B soporta hasta 128 000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se declaran variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 3.2 3B es multilingue |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la de Llama 3.2 3B, un transformer decoder-only con normalizacion RMSNorm por capa, embeddings posicionales rotatorios (RoPE) con frecuencia base elevada, atencion con consultas agrupadas (Grouped-Query Attention) y funcion de activacion SwiGLU en el bloque feed-forward. El ajuste se realiza, segun el nombre del repositorio, mediante adaptadores LoRA de rango 4 sobre una particion del dataset SQuAD correspondiente al 50 % de los datos, con semilla 42.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la estrategia de preprocesado, los hiperparametros completos (learning rate, epochs, optimizador) ni sobre si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card no documenta ninguna innovacion tecnica especifica ni resultados de evaluacion. El unico rastro tecnico disponible es la convencion de nombres del repositorio y las etiquetas declaradas (`transformers`, `safetensors`, `endpoints_compatible`).

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas, presumiblemente especializada en el formato de SQuAD (pregunta + contexto -> fragmento de respuesta).
- Razonamiento basico y comprension lectora heredados del modelo base Llama 3.2 3B.
- Capacidad multilingue potencial heredada del modelo base, aunque no confirmada para este ajuste concreto.
- No hay evidencia declarada de soporte de tool calling o function calling.
- No hay evidencia declarada de soporte de agentes o razonamiento multi-paso.
- No hay evidencia declarada de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- El ajuste sobre SQuAD puede degradar capacidades generales del modelo base (olvido catastrofico), especialmente con un rango LoRA tan bajo como 4.

## Casos de uso

- Investigacion en ajuste eficiente: servir como punto de comparacion reproducible en estudios sobre el efecto del rango LoRA y la proporcion de datos de ajuste en tareas de question answering.
- Reproduccion de experimentos: dado que el nombre codifica ratio, semilla y rango, permite replicar exactamente la configuracion y contrastarla con otras variantes del mismo autor.
- Extraccion de respuestas sobre documentos estructurados: uso en pipelines de QA extractivo donde se proporciona un contexto y se espera un fragmento literal, tipicamente en dominios con texto bien delimitado.
- Evaluacion de olvido catastrofico: analizar en que medida un ajuste de rango 4 sobre SQuAD degrada la perplexidad del modelo base en otros dominios.
- Docencia y formacion: ejemplo didactico de publicacion de un checkpoint ajustado en HuggingFace y de los problemas de documentacion incompleta en model cards.
- Baseline en competiciones internas: como referencia minima frente a modelos de mayor tamano o ajustes con mayor rango LoRA en tareas de comprension lectora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye la seccion de evaluacion cumplimentada y los resultados de busqueda no aportan metricas de rendimiento para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 12 GB.
- VRAM estimada en fp16/bf16: aproximadamente 6-7 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 3-4 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 2-3 GB.
- GPU recomendadas para fp16: NVIDIA RTX 3090, RTX 4090, A10G, L4 o superiores.
- Cabe en GPUs de consumo: si, en tarjetas con 6 GB o mas en cuantizacion de 4/8 bits (por ejemplo RTX 3060, RTX 4060, GTX 1660 en configuraciones muy ajustadas).
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y con endpoints de HuggingFace. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, aunque el modelo base Llama 3.2 3B si esta soportado por estas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AlinaGonch/llama32-3b-squad-ratio-0.50-seed-42-r4 | 3 000 M (aproximado) | No disponible (base: 128 000 tokens) | Sin datos publicados | No disponible | HuggingFace, 0 descargas |
| Meta Llama 3.2 3B Instruct | 3 000 M | 128 000 tokens | Benchmarks publicados por Meta | Licencia comunitaria Llama 3.2 | Amplia, con pesos oficiales y cuantizaciones GGUF |
| Qwen2.5 3B Instruct | 3 000 M | 32 000 tokens (128 000 en variantes turbo) | Benchmarks publicados por Alibaba | Apache 2.0 en la mayoria de variantes | Amplia, con soporte en Ollama y vLLM |
| Phi-3.5-mini Instruct | 3 800 M | 128 000 tokens | Benchmarks publicados por Microsoft | Licencia MIT | Amplia, con cuantizaciones disponibles |

## Limitaciones y advertencias

- La model card no esta cumplimentada: no se declaran licencia, idiomas, datos de entrenamiento ni limitaciones, lo que impide conocer las restricciones de uso comercial.
- El ajuste sobre SQuAD con rango LoRA 4 es muy restrictivo y probablemente degrada las capacidades generales del modelo base fuera del dominio de question answering.
- Riesgo elevado de alucinacion en tareas abiertas, ya que el ajuste no incorpora tecnicas de alineacion documentadas.
- Sesgos potencialmente heredados de Llama 3.2 3B (sesgos de genero, raza, idioma y sesgos culturales del corpus de preentrenamiento), sin que se documente ninguna mitigacion.
- Contexto real de uso limitado por el ajuste: aunque el modelo base soporta ventanas amplias, el ajuste especifico no esta validado para contextos largos.
- Idiomas: no confirmados para este checkpoint; el comportamiento multilingue del modelo base puede haberse visto reducido por el ajuste sobre un dataset predominantemente en ingles.
- Tamaño del repositorio declarado como 0,0 GB, lo que resulta inconsistente con un checkpoint de 3 000 millones de parametros y sugiere que la carga de pesos puede estar incompleta o que los metadatos son erroneos.
- Fecha de creacion registrada como 2026-10-04, posterior a la fecha de consulta habitual, lo que apunta a un posible error de metadatos o a una publicacion programada.
- Sin descargas ni likes: no existe validacion por parte de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.50-seed-42-r4
- Variante relacionada (ratio 0.10, seed 42): https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4
- Arbol de ficheros de la variante relacionada: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-42-r4/tree/main
- Referencia externa con metadatos (ratio 0.50, seed 44): https://essamamdani.com/ai-models/hf-alinagonch-llama32-3b-squad-ratio-0-50-seed-44
- Modelo base Llama 3.2 3B en Ollama: https://ollama.com/library/llama3.2:3b
- Documentacion de arquitectura Llama 3.2: https://deepwiki.com/buidoanchung/rasbt-LLMs-from-scratch/5.1-llama-3.2-architecture
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact#compute

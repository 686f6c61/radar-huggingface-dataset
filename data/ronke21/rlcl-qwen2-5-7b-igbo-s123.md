# ronke21/rlcl-Qwen2.5-7B-igbo-s123

## Resumen

rlcl-Qwen2.5-7B-igbo-s123 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B de Alibaba, publicado por el usuario ronke21 en Hugging Face. El nombre sugiere un experimento de aprendizaje continuo con mitigacion del olvido catastrofico (las siglas "rlcl" podrian corresponder a un metodo de regularizacion o replay, y "s123" a una semilla o configuracion concreta) orientado al idioma igbo. El modelo se distribuye como un merge de adaptadores LoRA sobre los pesos base, en formato safetensors y compatible con transformers y text-generation-inference.

Se trata de un modelo denso de aproximadamente 7.600 millones de parametros, heredero directo de la arquitectura Qwen2 de la familia Qwen2.5, que emplea atencion por grupos (GQA) y RoPE, con una ventana de contexto nativa de 32.768 tokens ampliable a 131.072 en la version base. La ficha del repositorio no documenta la receta de entrenamiento, los datos utilizados ni los resultados obtenidos, por lo que la informacion disponible es muy limitada y cualquier evaluacion practica requiere probar los pesos directamente.

Su relevancia es fundamentalmente de investigacion: ejemplifica el patron de publicaciones de bajo perfil centradas en preservar capacidades generales al adaptar un modelo a un idioma de bajos recursos como el igbo, un idioma nigero-congoles de unos 30 millones de hablantes. El acceso esta restringido (gated), lo que implica aceptar condiciones en Hugging Face antes de descargar los pesos, y no se declara licencia explicita en la tarjeta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), atencion por grupos (GQA) y RoPE |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la tarjeta; el modelo base Qwen2.5-7B soporta 32.768 tokens nativos y hasta 131.072 con configuracion extendida |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors en BF16/FP16 es convertible a GGUF, AWQ o GPTQ con herramientas estandar |
| Idiomas soportados | no disponible de forma explicita; el nombre indica adaptacion al igbo, y el base cubre principalmente ingles y chino con soporte multilingue parcial |
| Licencia | no disponible (el modelo base Qwen2.5-7B se distribuye bajo Apache 2.0, pero la tarjeta del fine-tuning no la declara) |
| Formato de pesos | safetensors (transformers), adaptadores LoRA fusionados en los pesos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B: un transformer decoder-only denso con normalizacion RMSNorm pre-atencion, activacion SwiGLU en el FFN, atencion por grupos con 28 cabezas de consulta y 4 de clave/valor (GQA), y embeddings rotatorios (RoPE) con ajuste de frecuencia para contexto largo. El vocabulario es de aproximadamente 151.000 tokens, con tokenizador BPE optimizado para chino e ingles. El modelo incorpora ademas sesgos de atencion (QKV bias) caracteristicos de la familia Qwen2.

Sobre el entrenamiento especifico de este checkpoint no hay informacion publicada: se desconoce el numero de tokens de ajuste, la composicion del corpus igbo, si se aplico RLHF, DPO o simplemente SFT, y que tecnica concreta de mitigacion del olvido se empleo. La etiqueta "lora-merged" confirma que se entreno un adaptador LoRA y posteriormente se fusiono con los pesos base para producir un checkpoint standalone. La etiqueta "rlcl" y el sufijo "s123" apuntan a un experimento academico o de ablacion, probablemente con un objetivo de regularizacion o replay para conservar el rendimiento en tareas originales tras la adaptacion linguistica.

## Capacidades

- Generacion de texto conversacional en el idioma base (ingles y chino principalmente) heredada de Qwen2.5-7B.
- Adaptacion al igbo segun el nombre del checkpoint, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y matematicas de nivel medio-alto heredados del modelo base, sujetos a posible degradacion por el ajuste fino.
- Generacion de codigo en lenguajes populares, capacidad presente en Qwen2.5-7B y presumiblemente conservada en mayor o menor medida.
- Soporte de tool calling y function calling inherente al modelo base, no verificado en este checkpoint.
- Capacidad de conversacion multi-turno con plantilla de chat de Qwen2.5.
- No se documenta modo de razonamiento explicito (thinking), vision ni audio.

## Casos de uso

- Investigacion sobre olvido catastrofico: el checkpoint sirve como punto de comparacion para medir cuanto rendimiento general se pierde al adaptar Qwen2.5-7B a un idioma de bajos recursos, evaluando MMLU o GSM8K antes y despues del ajuste.
- Procesamiento de texto en igbo: generacion y resumen de contenido en igbo para proyectos de preservacion linguistica, siempre que una evaluacion propia confirme la calidad real del modelo en ese idioma.
- Traduccion asistida ingles-igbo: uso como motor de traduccion en pipelines de documentacion o contenidos locales, con revision humana dada la ausencia de benchmarks.
- Chatbot de bajo coste: despliegue en una unica GPU de 24 GB en cuantizacion de 4 bits para prototipos de atencion al cliente en entornos con recursos limitados.
- Base para nuevos ajustes: al ser un merge de LoRA sobre Qwen2.5-7B, puede servir de inicializacion para experimentos posteriores de adaptacion multilingue.
- Evaluacion de tecnicas de regularizacion: reproduccion de experimentos comparando este checkpoint con otros ajustes del mismo modelo base para validar la eficacia del metodo "rlcl".
- Generacion de datos sinteticos en igbo: creacion de corpus paralelos o aumentados para entrenar modelos mas pequenos o tokenizadores especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 15,2 GB solo para pesos, mas overhead de activaciones y cache KV, lo que exige en la practica 18-20 GB.
- VRAM en cuantizacion de 8 bits: en torno a 8-9 GB; en 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 4,5-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en precision completa con contexto largo; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090, 4080 o 4070 Ti Super con cuantizacion de 4-8 bits.
- Despliegue: vLLM, TGI (el repo incluye la etiqueta text-generation-inference), llama.cpp u Ollama tras convertir a GGUF, y transformers con accelerate para uso directo.
- Latencia y throughput: no disponibles; en una RTX 4090 con vLLM y cuantizacion de 4 bits cabe esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-7B-igbo-s123 | 7,6 B | no disponible (base 32K) | Ajuste en igbo con mitigacion de olvido | no disponible | Gated en Hugging Face |
| Qwen/Qwen2.5-7B | 7,6 B | 32.768 tokens (131.072 extendido) | Modelo base generalista | Apache 2.0 | Publico |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (131.072 extendido) | Instrucciones y chat | Apache 2.0 | Publico |
| Meta Llama 3.1 8B Instruct | 8,0 B | 131.072 tokens | Instrucciones multilingue | Llama 3.1 Community License | Publico con aceptacion |

No hay datos de rendimiento publicados para el checkpoint de ronke21, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican datos de entrenamiento, hiperparametros, evaluacion ni licencia, lo que impide garantizar su uso comercial.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, y el autor puede revocar el acceso.
- Riesgo elevado de olvido catastrofico: pese a la intencion del metodo "rlcl", no hay evidencia publicada de que las capacidades generales se conserven; conviene evaluar MMLU, GSM8K y HumanEval antes de usarlo en produccion.
- Calidad en igbo no verificada: el idioma igbo tiene recursos limitados y el modelo puede producir texto gramaticalmente plausible pero incorrecto.
- Riesgo de alucinacion heredado de Qwen2.5-7B, acentuado si el ajuste degrada el alineamiento original.
- Sesgos desconocidos: no se ha realizado ninguna evaluacion de sesgo o toxicidad sobre este checkpoint.
- Sin garantias de soporte: el autor tiene cero descargas y cero likes, lo que sugiere un experimento sin mantenimiento.
- La licencia del modelo base (Apache 2.0) no implica automaticamente que este fine-tuning la herede, al no declararse en la tarjeta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-7B-igbo-s123
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Version instruct del base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Documentacion de transformers para Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2

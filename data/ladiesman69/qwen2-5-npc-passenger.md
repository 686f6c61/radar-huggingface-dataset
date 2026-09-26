# LadiesMan69/Qwen2.5-NPC-passenger

## Resumen

LadiesMan69/Qwen2.5-NPC-passenger es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct, en concreto sobre la variante cuantizada a 4 bits publicada por Unsloth (unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit). Lo publica el usuario LadiesMan69 en Hugging Face bajo licencia Apache 2.0, y el sufijo «NPC-passenger» apunta a un uso orientado a la generación de diálogos de personajes no jugadores en videojuegos, aunque la model card no documenta ni el conjunto de datos ni el objetivo exacto del entrenamiento.

El modelo tiene 7.615.616.512 parámetros (unos 7,62 mil millones) en safetensors, con un repositorio de 15,2 GB que corresponde a pesos en 16 bits. Está orientado a generación de texto conversacional, declara únicamente el idioma inglés y es compatible con transformers, text-generation-inference y endpoints de inferencia estándar.

Su relevancia es la de un ejemplo representativo de ajuste fino ligero con Unsloth y TRL sobre una base Qwen2.5: una práctica muy extendida para especializar modelos de 7B en dominios concretos con presupuesto reducido. No se han publicado evaluaciones, métricas ni detalles del dataset, y el repositorio no registra descargas ni «likes», por lo que debe tratarse como un artefacto experimental sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada de Qwen2.5-7B-Instruct; hiperparametros concretos no documentados en la model card) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,62 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct declara 128.000 tokens segun su especificacion oficial, dato no confirmado para este ajuste |
| Tipos de cuantizacion | pesos publicados en safetensors de 16 bits (15,2 GB de repositorio); el modelo base de entrenamiento era bnb-4bit; no se publican GGUF, GPTQ ni AWQ |
| Idiomas soportados | en (ingles), unico idioma declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit (a su vez, Qwen2.5-7B-Instruct) |
| Fecha de publicacion | 2026-09-25 (creacion), 2026-09-25 (ultima actualizacion) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE) y SwiGLU en el bloque feed-forward. Los hiperparámetros exactos (número de capas, dimensión oculta, cabezas de atención y de clave/valor) no se detallan en la model card de este ajuste, aunque corresponden a la especificación pública de Qwen2.5-7B. El repositorio contiene pesos fusionados en 16 bits, no adaptadores LoRA, a pesar de que el entrenamiento partió de una base cuantizada a 4 bits.

En cuanto al entrenamiento, la model card se limita a indicar que el modelo se entrenó «2x faster» con Unsloth y la librería TRL de Hugging Face. No se especifica el número de tokens de entrenamiento, la composición del dataset, la duración del ajuste, los hiperparámetros (rango LoRA, tasa de aprendizaje, épocas) ni si hubo fases de RLHF, DPO o similar. Tampoco se documenta ninguna innovación técnica propia: las únicas técnicas citadas son las del propio pipeline de Unsloth para acelerar el fine-tuning.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del comportamiento de instrucciones del modelo base Qwen2.5-7B-Instruct.
- Dialogo multi-turno con mantenimiento de contexto, apto para conversaciones encadenadas.
- Razonamiento general y respuesta a instrucciones; el nivel concreto no esta evaluado para este ajuste.
- Generacion de codigo y resolucion de problemas matematicos basicos como capacidad heredada del base, sin verificacion publicada.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card; el modelo base lo soporta, pero no hay confirmacion de que se haya preservado tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado; no se documenta soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Dialogos de NPC en videojuegos: es el escenario que sugiere el nombre del modelo. Se usaria como generador de frases para un personaje secundario (por ejemplo, un pasajero de un vehiculo) que reacciona a eventos del entorno, con el contexto de conversacion mantenido por el propio motor del juego.
- Prototipado de personajes conversacionales: util para probar rapidamente variedad de registros y personalidades en una fase temprana de diseno, antes de invertir en un modelo mayor o en un dataset curado.
- Generacion de dialogos ambientales (barks): produccion de lineas cortas y repetibles para multitudes o personajes de fondo, donde no se requiere una precision alta y si una latencia baja en inferencia.
- Asistente conversacional de dominio restringido: ajustable de nuevo sobre este checkpoint para un nicho concreto (por ejemplo, atencion en un vertical especifico) partiendo de una base ya especializada en tono conversacional.
- Base para investigacion sobre fine-tuning con Unsloth: sirve como caso de estudio reproducible de QLoRA sobre una base cuantizada a 4 bits, comparando el resultado con el Qwen2.5-7B-Instruct original.
- Evaluacion de degradacion por cuantizacion: al haberse entrenado sobre una base bnb-4bit y publicarse pesos en 16 bits, es un candidato para medir como afecta ese pipeline a la calidad final frente al modelo original.
- Despliegue en local para demostraciones: con 7,62B de parametros y pesos en 16 bits entra en una GPU de 24 GB, lo que permite levantar una demo offline sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K, MT-Bench ni similares) ni comparaciones con el modelo base. Cualquier cifra del Qwen2.5-7B-Instruct original corresponde a su ficha oficial y no es trasladable a este ajuste sin una evaluacion propia.

## Requisitos de hardware

- VRAM estimada en 16 bits (pesos publicados): aproximadamente 15,3 GB solo de pesos, mas overhead de activaciones y cache KV, lo que situa el consumo real en torno a 17-20 GB segun longitud de contexto y tamano de lote.
- VRAM estimada en 8 bits: en torno a 8 GB de pesos, aproximadamente 10-12 GB en total.
- VRAM estimada en 4 bits (requiere convertir a GPTQ, AWQ o GGUF, ya que no se publican): en torno a 4,5-5 GB de pesos, aproximadamente 6-8 GB en total.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente en 16 bits; RTX 4090 o RTX 3090 (24 GB) para inferencia en 16 bits con lotes pequenos; RTX 4080, 4070 Ti o 3060 de 12 GB para cuantizacion a 4 bits.
- Compatibilidad con GPU de consumo: si, en 4 bits cabe en tarjetas de 8-12 GB; en 16 bits requiere al menos 24 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM y endpoints compatibles con la API de Hugging Face. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de la columna «modelo» corresponden a las especificaciones publicas de cada modelo original y deben verificarse en sus fichas oficiales; el rendimiento de este ajuste concreto no esta evaluado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LadiesMan69/Qwen2.5-NPC-passenger | 7,62B | no disponible (base declara 128.000 tokens) | Apache 2.0 | Hugging Face, safetensors |
| Qwen2.5-7B-Instruct | 7,62B | 128.000 tokens | Apache 2.0 | Hugging Face, safetensors y cuantizaciones GGUF/AWQ/GPTQ |
| Meta Llama 3.1 8B Instruct | 8,03B | 128.000 tokens | Llama 3.1 Community License (con restricciones de uso) | Hugging Face, safetensors y GGUF |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.000 tokens | Apache 2.0 | Hugging Face, safetensors y GGUF |

Frente a estas alternativas, este ajuste aporta un tono conversacional especializado pero carece por completo de evaluaciones publicadas, de cuantizaciones listas para usar y de soporte multilingue declarado, lo que en la practica lo situa por detras de los modelos de referencia en fiabilidad para produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta la composicion del dataset de ajuste, por lo que no es posible auditar sesgos de genero, raza, edad u otros.
- Riesgo de alucinacion: alto e impredecible, ya que no hay evaluaciones publicadas y el ajuste puede haber degradado el alineamiento del modelo base.
- Degradacion por cuantizacion: el entrenamiento partio de una base bnb-4bit, lo que puede introducir errores de cuantizacion incorporados a los pesos finales, aunque estos se publiquen en 16 bits.
- Olvido catastrofico: al ser un fine-tune de proposito especifico sin datos de entrenamiento publicados, es probable la perdida de capacidades generales del Qwen2.5-7B-Instruct original (codigo, matematicas, instrucciones complejas).
- Limitacion de idioma: solo se declara ingles; no hay garantia de comportamiento correcto en castellano ni en otros idiomas.
- Contexto: la ventana real soportada por este ajuste no esta documentada; no se debe asumir que conserva los 128.000 tokens del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y sobre los datos de entrenamiento no documentados recae en quien despliega el modelo.
- Falta de validacion de la comunidad: 0 descargas y 0 «likes» en el momento de la consulta, sin issues ni retroalimentacion publica.
- Sin soporte de tool calling confirmado: si el caso de uso depende de function calling o de comportamiento de agente, es necesario verificarlo empiricamente antes de integrarlo.
- No hay cuantizaciones GGUF ni AWQ/GPTQ publicadas, lo que obliga a convertir los pesos para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LadiesMan69/Qwen2.5-NPC-passenger
- Modelo base utilizado para el ajuste: https://huggingface.co/unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-7B-Instruct: no disponible en la informacion proporcionada
- Paper, blog o demo asociados a este ajuste: no disponible

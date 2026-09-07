# borekboissy/Millesime-2026-4b-phase1

## Resumen

Millesime-202608-4B-phase1 es un modelo de lenguaje de 4.022.468.096 parametros, desarrollado por Borek Boissy mediante fine-tuning completo (full) del modelo base Qwen/Qwen3-4B-Instruct-2507. El entrenamiento se realizo sobre el dataset de instrucciones SFT denominado `millesime_202608_sft`, con una perdida final de validacion de 0.9014. Se trata de un modelo de generacion de texto que hereda la arquitectura transformer densa de la familia Qwen3, aunque la informacion publicada no detalla la longitud de contexto ni las capacidades especificas del fine-tuning.

El modelo se presenta como una primera fase (phase1) de un proyecto de post-entrenamiento, orientado a propositos conversacionales. Su relevancia radica en ser un ejemplo de fine-tuning a partir de un modelo instructivo moderno de 4B, con parametros publicados en formato safetensors y compatibilidad con el ecosistema Hugging Face. No obstante, al tratarse de un modelo reciente y sin benchmarks publicos, su rendimiento real no puede evaluarse con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de entrenamiento | millesime_202608_sft |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo del modelo Qwen3-4B-Instruct-2507, lo que implica que se actualizaron todos los parametros del transformer original durante el entrenamiento. No se han publicado detalles sobre la arquitectura interna (numero de capas, dimensiones de atencion, etc.), pero se asume la arquitectura estandar de Qwen3, que es un transformer denso sin mezcla de expertos. El dataset de entrenamiento, `millesime_202608_sft`, no esta documentado en cuanto a composicion, idioma ni numero de tokens.

El proceso de entrenamiento utilizo los siguientes hiperparametros: learning rate de 1e-5, batch size de 4 por dispositivo con 4 GPUs, gradiente acumulado de 2 (batch total de 32), optimizador AdamW con betas (0.9, 0.999), scheduler cosine con warmup del 10% y 2 epochs. La perdida de entrenamiento evoluciono de 1.0220 en el paso 500 a 0.6903 en el paso 2366, mientras que la perdida de validacion descendio de 0.9928 a 0.9014. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al SFT.

## Capacidades

No se han publicado especificaciones detalladas de capacidades en la informacion disponible. Como fine-tuning de un modelo instructivo de la familia Qwen3, se espera que herede capacidades basicas de generacion de texto y razonamiento, pero no existen datos que lo confirmen. Los siguientes puntos estan sin verificar:

- Generacion de texto conversacional: no hay evaluaciones publicas.
- Razonamiento, generacion de codigo o matematicas: no hay benchmarks.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

Los casos de uso que se enumeran a continuacion son aplicaciones potenciales derivadas del modelo base Qwen3-4B-Instruct-2507. No han sido verificadas con este fine-tuning especifico y deben considerarse hipotesis de trabajo.

- Asistente conversacional de proposito general: el modelo puede mantener dialogos multi-turno si se despliega con una capa de orquestacion, aunque su calidad depende del dataset de entrenamiento no documentado.
- Generacion de codigo en entornos de desarrollo: hereda la capacidad del modelo base para producir fragmentos de codigo, pero no hay datos de HumanEval ni de otros benchmarks que avalen este uso.
- Resumen de documentos: al ser un modelo instructivo, puede generar resumenes de textos, pero la ventana de contexto real es desconocida.
- Clasificacion de textos: puede aplicarse a tareas de etiquetado o analisis de sentimiento mediante prompts, sin garantias de precision.
- Extraccion de informacion: puede utilizarse para extraer entidades o relaciones de textos, siempre que se disponga de ejemplos en el prompt.
- Razonamiento aritmetico basico: el modelo base soporta matematicas simples, pero no existen resultados de GSM8K para confirmar el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion de 0.9014 tras 2 epochs, sin datos comparativos con otros modelos. No existen puntuaciones de MMLU, HumanEval, GSM8K ni otros conjuntos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16 (sin cuantizacion): aproximadamente 8 GB para los pesos, mas overhead de activaciones y cache, lo que requiere entre 10 y 12 GB de VRAM.
- VRAM estimada para inferencia con cuantizacion 4-bit (GGUF Q4): aproximadamente 2.5 GB de pesos, con un total estimado de 4 GB de VRAM.
- GPU recomendadas: para FP16 se recomienda una RTX 3090, RTX 4090 o A100; para 4-bit, una RTX 3060 de 12 GB o superior es suficiente.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers con Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Millesime-202608-4B-phase1 | 4.022.468.096 | No disponible | other | HuggingFace |
| Qwen3-4B-Instruct-2507 | ~4.000.000.000 | No disponible | No disponible | HuggingFace |
| Qwen2.5-4B-Instruct | ~4.000.000.000 | No disponible | No disponible | HuggingFace |

No se dispone de datos de benchmarks para comparar el rendimiento entre estos modelos. La tabla se limita a caracteristicas tecnicas conocidas o declaradas en los repositorios. El modelo Millesime es un fine-tuning del primero, por lo que comparte arquitectura y numero de parametros, pero su comportamiento puede diferir debido al dataset de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han realizado evaluaciones de sesgos; el dataset de entrenamiento no esta documentado, por lo que pueden existir sesgos no detectados.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 4B sin benchmarks, la probabilidad de generar contenido falso es desconocida.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan especificados, lo que impide conocer sus limites reales.
- Restricciones de licencia: la licencia es `other`, por lo que se debe revisar el repositorio antes de cualquier uso comercial o redistribucion.
- Modelo intermedio: el nombre "phase1" sugiere que es una etapa inicial del proyecto, posiblemente con margen de mejora.
- Sin validacion publica: la ausencia de benchmarks impide garantizar la calidad del modelo en tareas especificas.

## Enlaces

- HuggingFace: https://huggingface.co/borekboissy/Millesime-2026-4b-phase1
- Perfil del autor: https://huggingface.co/borekboissy
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Otros enlaces relevantes: no disponibles.

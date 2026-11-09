# K-Ai-Official/K-Oss-9-Mini

## Resumen

K-Oss-9-Mini es un modelo de lenguaje causal desarrollado por K-Ai (Kortex Ai) como sucesor de K-Oss-8-Mini-Instruct-8B. Se trata de un ajuste fino mediante QLoRA sobre Qwen3-8B-Base de Alibaba Cloud, orientado a generacion de texto multilingue en indonesio, ingles y japones. A pesar del nombre "9" en su denominacion, los pesos publicados en safetensors suman 8.190.735.360 parametros, coherentes con la arquitectura Qwen3-8B subyacente.

El modelo se presenta como una propuesta compacta para experimentacion multilingue, con un pipeline de entrenamiento estructurado que incluye el dataset propio Kai_V2 (ocho categorias: seguimiento de instrucciones, razonamiento, codigo, ciencia, aprendizaje de idiomas, conversacion japonesa, creatividad y seguridad) y un benchmark separado del conjunto de entrenamiento para reducir la fuga de datos. La licencia Apache 2.0 y la compatibilidad con el ecosistema Transformers lo hacen accesible para prototipado e investigacion.

La relevancia actual del modelo reside en su enfoque en el triplete linguistico indonesio-ingles-japones, poco cubierto por los modelos generalistas, y en la publicacion de un pipeline de reproducibilidad. No obstante, la ausencia de resultados de benchmarks publicados en la informacion disponible limita la evaluacion objetiva de su rendimiento frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal basada en Qwen3 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (usada durante el entrenamiento QLoRA); no se detallan otras |
| Idiomas soportados | Indonesio (id), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer causal denso de 8.190 millones de parametros. Sobre esa base se aplica un ajuste fino supervisado mediante QLoRA con cuantizacion 4-bit del modelo base, utilizando Unsloth para la carga optimizada, TRL SFTTrainer para el entrenamiento supervisado y PEFT/LoRA para las capas adaptadoras entrenables. Se emplea entrenamiento "response-only", en el que la perdida se calcula unicamente sobre las respuestas del asistente y no sobre los turnos del usuario.

Los datos de entrenamiento provienen de Kai_V2, un dataset multilingue propio con particiones separadas de entrenamiento, validacion y benchmark, complementado por kai_synth_v1 y yahma/alpaca-cleaned segun los metadatos del repositorio. La model card menciona que la configuracion de entrenamiento, el optimizador, la semilla aleatoria, las versiones de paquetes y el hardware deberian registrarse en un manifiesto de reproducibilidad, pero no se publican los valores concretos ni el numero de tokens de entrenamiento. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal en indonesio, ingles y japones.
- Seguimiento de instrucciones en conversaciones de un solo turno y multi-turno.
- Razonamiento logico y analitico basico, segun la categoria "Reasoning" del dataset.
- Generacion de codigo y asistencia a la programacion (categoria "Coding").
- Conocimiento cientifico y explicaciones tecnicas (categoria "Science").
- Aprendizaje de idiomas: gramatica, vocabulario y comprension linguistica.
- Conversacion japonesa practica (Kaiwa).
- Escritura creativa y generacion de contenido original.
- Comportamiento de rechazo responsable ante peticiones inapropiadas (categoria "Safety").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistencia educativa multilingue: el modelo puede generar explicaciones gramaticales y ejercicios en indonesio, ingles y japones, aprovechando la categoria "Language Learning" de Kai_V2 para tutoria de idiomas.
- Prototipado de aplicaciones de atencion al cliente en japones: su entrenamiento especifico en Kaiwa permite gestionar conversaciones cotidianas y responder con registro natural en japones.
- Generacion de codigo en entornos de desarrollo: la categoria "Coding" del dataset lo hace adecuado para autocompletar funciones, explicar fragmentos de codigo y generar pruebas unitarias en ingles.
- Experimentacion academica con modelos compactos: investigadores pueden reproducir el pipeline QLoRA documentado (Unsloth + TRL + PEFT) sobre una base Qwen3 para estudiar el efecto del ajuste fino en modelos de 8B.
- Traduccion y localizacion entre los tres idiomas soportados: util para equipos que necesitan borradores de traduccion en indonesio y japones con revision humana posterior.
- Generacion de contenido creativo y marketing: la categoria "Creativity" permite producir textos promocionales, guiones y narrativa breve en los tres idiomas.
- Evaluacion de seguridad y rechazo: la categoria "Safety" del benchmark permite probar comportamientos de rechazo en aplicaciones que requieran moderacion basica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card describe la metodologia de evaluacion (coincidencia exacta normalizada, coincidencia de palabras clave, cobertura de palabras clave requeridas, pruebas de ejecucion de codigo, comprobaciones de rechazo esperado y evaluacion manual por rubrica) y las categorias evaluadas, pero no incluye cifras numericas de rendimiento ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 8.190 millones de parametros: aproximadamente 16-17 GB en FP16/BF16, 8-9 GB en cuantizacion de 8 bits y 4-5 GB en cuantizacion de 4 bits, sin contar la cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU con 16-24 GB de VRAM (RTX 4090, A10G, L4) seria suficiente para FP16; para cuantizaciones de 4 bits bastaria con 8 GB (RTX 3070/4060 Ti).
- Cabe en GPU de consumo: si, en modelos con al menos 8 GB de VRAM usando cuantizacion de 4 bits, y con 16 GB o mas en precision completa.
- Opciones de despliegue: Transformers (libreria declarada), text-generation-inference (tag del repositorio), Unsloth (entrenamiento). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| K-Oss-9-Mini | 8,19 B | no disponible | en, ja, id | Apache 2.0 | no disponible |
| Qwen3-8B (base de referencia) | 8,2 B | no disponible en la informacion | multilingue | Apache 2.0 | no disponible en la informacion |
| K-Oss-8-Mini-Instruct-8B (generacion anterior) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos proporcionados. El modelo base Qwen3-8B es la referencia natural, pero no se han facilitado cifras comparativas de benchmarks.

## Limitaciones y advertencias

- La model card esta truncada en el apartado de limitaciones; no se detallan sesgos conocidos ni riesgos especificos.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 8B, especialmente en tareas de conocimiento cientifico y factual.
- La cobertura linguistica depende de los datos de entrenamiento disponibles; el propio autor advierte que no debe interpretarse como competencia igual en los tres idiomas.
- El modelo no esta disenado para tareas fuera de generacion de texto: no hay soporte documentado de vision, audio, tool calling ni agentes.
- Ausencia de resultados de benchmarks publicados, lo que impide verificar el rendimiento real frente a la generacion anterior o a modelos comparables.
- El entrenamiento se realizo sobre una base cuantizada a 4 bits (QLoRA); la calidad del ajuste fino puede diferir de un entrenamiento en precision completa.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse tambien contra las condiciones del modelo base Qwen3-8B-Base.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K-Ai-Official/K-Oss-9-Mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset Kai_V2: https://huggingface.co/datasets/K-Ai-Official/Kai_V2
- Dataset kai_synth_v1: https://huggingface.co/datasets/K-Ai-Official/kai_synth_v1
- Dataset alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Base cuantizada usada en el entrenamiento: https://huggingface.co/unsloth/Qwen3-8B-Base-unsloth-bnb-4bit

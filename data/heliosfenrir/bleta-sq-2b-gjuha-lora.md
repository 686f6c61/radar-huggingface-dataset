# HeliosFenrir/bleta-sq-2b-gjuha-lora

## Resumen

Bleta SQ 2B — Gjuha Shqipe LoRA es un adaptador PEFT de tipo LoRA publicado por HeliosFenrir sobre el modelo base `klei1/bleta-sq-2b`, un modelo multimodal de la familia Gemma 4 (variante E2B) que combina torres de lenguaje, visión y audio. Este adaptador se ha entrenado exclusivamente sobre la torre de lenguaje (`language_model`) para especializarla en tutoría de la asignatura "Gjuha Shqipe" (lengua albanesa) en el sistema educativo albanés de secundaria, grados 6 a 12. Las torres de visión y audio se congelaron y se eliminaron del adaptador final, de modo que el resultado es un adaptador de texto puro.

El problema que resuelve es la falta de modelos especializados en albanés de calidad para tareas educativas concretas: ortografía, morfología, sintaxis, redacción de ensayos y salvaguardas frente a peticiones de fraude académico. El adaptador se entrenó con 20.000 pares de instrucción de alta calidad y 512 ejemplos de evaluación reservados, partiendo del corpus Bleta (`klei1/bleta-sq-dataset-v1`). La relevancia actual radica en que demuestra que es posible especializar un modelo de 2B parámetros en un idioma de bajos recursos con un presupuesto de cómputo mínimo (una Tesla T4 gratuita de Colab, unas 3 horas de entrenamiento).

El adaptador ocupa 0,7 GB en el Hub, se distribuye bajo licencia Apache 2.0 y declara soporte para albanés (`sq`) e inglés (`en`). Es un artefacto de investigación y experimentación más que un producto listo para producción: el propio autor reconoce degeneración de tokens en algunas colas de respuesta y publica el checkpoint de mejor `eval_loss` (paso 400) en lugar del final del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 4 E2B (`Gemma4ForConditionalGeneration`); solo se entrena la torre `language_model` |
| Parametros totales | no disponible (el adaptador LoRA tiene `r=32`, `lora_alpha=64`; el modelo base se denomina "2B" pero no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (longitud máxima de secuencia usada en entrenamiento: 1024 tokens) |
| Tipos de cuantizacion | carga en 4 bits durante el entrenamiento (Unsloth); no se detallan otras cuantizaciones publicadas |
| Idiomas soportados | albanés (`sq`), inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `klei1/bleta-sq-2b` es un transformer multimodal de la familia Gemma 4 (variante E2B) con tres torres: `language_model`, `vision_tower` y `audio_tower`. El adaptador LoRA se aplica únicamente a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de la torre de lenguaje. Las torres de visión y audio se congelaron (`requires_grad=False`) y se eliminaron del adaptador publicado, de modo que el artefacto final es estrictamente de texto. Los hiperparámetros del adaptador son `r=32` y `lora_alpha=64`, continuando desde un PEFT previo de Unsloth.

El entrenamiento se realizó en una Tesla T4 gratuita de Google Colab con Unsloth `FastModel`, carga en 4 bits y gradient checkpointing. Se ejecutaron 2 épocas completas con packing activado, micro-batch de 2 y acumulación de gradiente de 8 (lote efectivo 16), longitud máxima de secuencia de 1024 tokens y evaluación cada 100 pasos. El entrenamiento duró 10.781 segundos (unas 2,99 horas) y completó 464 pasos. El dataset combina un conjunto semilla "Gold Gjuha" de alta calidad, filas albanesas enriquecidas desde HuggingFace, filas de currículo estratificado (Ortografía, Morfología, Sintaxis, Ensayo y Seguridad) y un conjunto de evaluación reservado de 512 filas que no se usó en entrenamiento. En total, 20.000 pares de instrucción empaquetados.

## Capacidades

- Generación de texto en albanés e inglés con especialización en contenidos curriculares de lengua albanesa.
- Tutoría de ortografía: selección de formas correctas y explicación breve (por ejemplo, distinguir "shkolle" de "shkollë").
- Análisis morfológico: identificación de casos gramaticales en oraciones albanesas.
- Análisis sintáctico: localización de sujeto y predicado en oraciones.
- Planificación de ensayos: generación de esquemas de tres puntos sobre temas propuestos.
- Salvaguardas académicas: rechazo inicial a escribir ensayos evaluables para que el alumno los entregue como propios.
- No soporta visión ni audio: las torres correspondientes se congelaron y se eliminaron del adaptador.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Tutoría de ortografía albanesa: el modelo responde a preguntas del tipo "¿cuál es la forma correcta, shkolle o shkollë?" y justifica brevemente la elección, lo que lo hace útil en aplicaciones de refuerzo escolar para grados 6 a 12.
- Corrección morfológica guiada: dado que identifica casos gramaticales en oraciones concretas, puede integrarse en ejercicios interactivos de análisis gramatical con retroalimentación inmediata.
- Análisis sintáctico asistido: la capacidad de señalar sujeto y predicado permite construir herramientas de práctica de sintaxis albanesa con corrección automática.
- Generación de esquemas de ensayo: el modelo produce planes de tres puntos sobre temas curriculares, adecuado para un asistente de planificación de redacción que no escriba el texto final por el alumno.
- Moderación de integridad académica: su comportamiento de rechazo ante peticiones de escribir ensayos evaluables puede aprovecharse como capa de salvaguarda en plataformas educativas.
- Investigación sobre especialización lingüística de bajo coste: sirve como referencia reproducible para adaptar modelos pequeños a idiomas de bajos recursos con hardware consumer (T4) y presupuesto mínimo.
- Experimentación con PEFT sobre modelos multimodales: el patrón de congelar y eliminar torres no textuales es reutilizable para otros dominios donde solo se necesita la parte lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de entrenamiento y evaluación de pérdida sobre el conjunto reservado albanés:

| Checkpoint | Paso | `eval_loss` | Perplejidad |
|---|---|---|---|
| Antes del SFT (base + adaptadores previos) | 0 | 4,6234 | 101,84 |
| Intermedio | 100 | 2,3640 | 10,63 |
| Intermedio | 200 | 2,1998 | 9,02 |
| Intermedio | 300 | 2,1256 | 8,38 |
| **Mejor (publicado)** | **400** | **1,7771** | **5,91** |
| Final de la época 2 | 464 | 1,7771 | 5,91 |

| Métrica de entrenamiento | Valor |
|---|---|
| `train_loss` medio | 2,1690 |
| Muestras por segundo | 0,688 |
| FLOPs totales | 1,061e+17 |

La reducción relativa de la NLL es de aproximadamente el 62 % (de 4,62 a 1,78) sin colapso del modelo. El autor publica el adaptador del paso 400 en lugar del de 464 por el ligero empeoramiento al final de la segunda época.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó con carga en 4 bits en una Tesla T4 (16 GB), lo que sugiere que la inferencia en 4 bits cabe holgadamente en GPUs consumer de 8-16 GB, aunque el dato exacto no se publica.
- GPU recomendadas: Tesla T4 (validada para entrenamiento e inferencia en el flujo documentado); GPUs con al menos 16 GB para reproducción fiel del entorno de entrenamiento.
- Cabe en GPU consumer: sí, según el flujo de Colab gratuito con T4 documentado por el autor; no se detallan otras GPUs consumer validadas.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada con `AutoModelForCausalLM` y `PeftModel`), y Unsloth `FastModel` con `load_in_4bit=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible para inferencia; durante el entrenamiento se registraron 0,688 muestras por segundo en T4.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables de otros modelos en la información proporcionada, por lo que la comparación se limita a características estructurales:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeliosFenrir/bleta-sq-2b-gjuha-lora (este) | ~2B (base) + LoRA `r=32` | no disponible (entrenado a 1024) | sq, en | Apache 2.0 | HuggingFace, 34 descargas |
| klei1/bleta-sq-2b (base) | ~2B (base) | no disponible | sq, en (multimodal) | no disponible | HuggingFace |
| Alternativas de tutoría en albanés | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información disponible otros adaptadores LoRA de tutoría de lengua albanesa directamente comparables.

## Limitaciones y advertencias

- Degeneración de tokens: el propio autor documenta colas de respuesta con degeneración en algunas comprobaciones cualitativas (por ejemplo, en la respuesta de sintaxis y en la de seguridad aparecen fragmentos incoherentes), lo que indica que la calidad de generación no es estable en todos los casos.
- El adaptador se publica en el paso 400, no al final del entrenamiento, porque el paso 464 mostraba un ligero empeoramiento de la pérdida de evaluación.
- Es un adaptador de texto puro: no conserva capacidades de visión ni audio del modelo base, ya que esas torres se congelaron y se eliminaron.
- Contexto de entrenamiento limitado a 1024 tokens; no se documenta la longitud de contexto nativa del modelo base ni su comportamiento más allá de esa ventana.
- Cobertura lingüística restringida a albanés e inglés; no hay evidencia de calidad en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación; el uso en contexto educativo requiere supervisión humana.
- Sesgos conocidos: no documentados en la información disponible.
- Uso comercial: la licencia Apache 2.0 lo permite, pero debe verificarse la licencia del modelo base `klei1/bleta-sq-2b`, que no se detalla en la información proporcionada.
- Madurez: 34 descargas y 0 "likes" en el momento de la consulta; es un artefacto de investigación con validación limitada, no un modelo listo para producción sin evaluación adicional.
- El conjunto de evaluación es de 512 filas y la métrica principal es perplejidad, que no mide directamente la calidad pedagógica de las respuestas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/HeliosFenrir/bleta-sq-2b-gjuha-lora
- Modelo base: https://huggingface.co/klei1/bleta-sq-2b
- Dataset de atribución: https://huggingface.co/datasets/klei1/bleta-sq-dataset-v1
- Repositorio de Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- PEFT (librería del adaptador): https://github.com/huggingface/peft

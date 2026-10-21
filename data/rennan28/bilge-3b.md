# Rennan28/Bilge-3B

## Resumen

Bilge-3B es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-3B-Instruct desarrollado por el usuario Rennan28 en el contexto de un bootcamp. Se trata de un asistente conversacional especializado en los procesos de secretaría académica de la Universidad Técnica Lale, una institución ficticia: responde preguntas sobre matrícula, altas y bajas de asignaturas, asistencia obligatoria, exámenes, sistema de calificaciones, exámenes de recuperación, escuela de verano, becas, residencia y normas de graduación. El modelo no solo genera texto: está entrenado para producir llamadas a herramientas en JSON (una tabla de horarios de asignaturas, una calculadora y un cálculo específico de tasas de verano) y para responder con citas extraídas de una guía de 15 secciones mediante RAG.

Su relevancia es la de un caso de estudio reproducible: demuestra cómo un modelo base de 3.085.938.688 parámetros puede adquirir identidad propia, un protocolo de agente en JSON válido y un comportamiento de abstención ante preguntas fuera de dominio con un conjunto de solo 441 conversaciones sintéticas y un entrenamiento QLoRA de 3 épocas ejecutable en una GPU gratuita (Colab T4). No es un modelo de propósito general ni un sustituto del modelo base: es un artefacto de demostración de técnicas de ajuste fino, con licencia "other" y publicación muy reciente (creado el 2026-10-20, con 0 descargas y 0 likes en el momento de la consulta).

La arquitectura subyacente es la de Qwen2 (transformer decoder-only con atención de consultas agrupadas), sobre la que se aplicó un adaptador LoRA de rango 16 sobre todas las capas lineales. El idioma de trabajo es exclusivamente el turco (tag `tr`), y el modelo está pensado para integrarse en un pipeline con recuperación vectorial (Chroma + embeddings mpnet) más ejecución de herramientas, no para uso autónomo sin ese contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune con adaptador LoRA sobre Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens según las especificaciones públicas del modelo base Qwen2.5-3B-Instruct; no verificado en la información proporcionada para este fine-tune |
| Tipos de cuantización | Pesos publicados en safetensors (precisión nativa del modelo base); existe un repositorio GGUF separado con niveles no especificados en la ficha; entrenamiento realizado en 4 bits con QLoRA |
| Idiomas soportados | Turco (`tr`) como idioma de especialización; el modelo base es multilingüe, pero la ficha solo declara turco |
| Licencia | `other` (sin texto de licencia detallado en la información disponible) |
| Formato de pesos | safetensors (repositorio principal de 6,2 GB); GGUF en repositorio aparte; adaptador LoRA publicado por separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado del denso Qwen2.5-3B-Instruct (3.086 M de parámetros, familia Qwen2), entrenado con QLoRA en 4 bits: rango de adaptador r=16, alpha=32, aplicado a todas las capas lineales, durante 3 épocas y con una tasa de aprendizaje de 2e-4. No se menciona ninguna innovación arquitectónica propia; el interés técnico está en el procedimiento de ajuste y en el diseño del conjunto de datos.

Los datos de entrenamiento son 441 conversaciones sintéticas generadas con Gemini y publicadas en el dataset Rennan28/bilge-3b-veri, organizadas en tres ejes: identidad (nombre "Bilge" y marca estilística), RAG (respuestas ancladas a la guía de secretaría académica con citación) y agente (emisión de JSON válido y selección correcta de herramientas entre `ders_bilgisi`, `hesapla` y `yaz_okulu_ucreti`). No se documentan fases de RLHF ni DPO, ni el volumen de tokens de entrenamiento. El pipeline de inferencia previsto combina recuperación con Chroma e embeddings mpnet; la ficha advierte de que la versión desplegada en el sitio web usa búsqueda TF-IDF, lo que degrada la recuperación ante sinónimos.

## Capacidades

- Generación de texto conversacional en turco con una identidad definida (asistente "Bilge") y un marcador estilístico consistente.
- Respuesta con recuperación aumentada (RAG): cita y extrae valores concretos (fechas, coeficientes de notas, importes de becas, tasas) de un corpus de 15 secciones.
- Comportamiento de abstención: ante preguntas fuera de la guía, declara que la información no está en el rehuelo en lugar de inventarla.
- Tool calling en formato JSON: selección y emisión de llamadas a `ders_bilgisi` (consulta de horarios en tabla), `hesapla` (operaciones matemáticas) y `yaz_okulu_ucreti` (cálculo de tasas de escuela de verano).
- Razonamiento multi-paso limitado: encadenamiento de hasta dos pasos de agente para combinar recuperación y cálculo (con fallos documentados en el segundo paso).
- Conocimiento procedimental de dominio: matrícula, altas y bajas, asistencia, exámenes, recuperaciones, verano, becas, residencia y graduación.
- No dispone de visión, audio ni modo de razonamiento extendido ("thinking") según la información disponible.

## Casos de uso

- **Asistente de secretaría académica en un chatbot de intranet**: el modelo responde en turco a preguntas administrativas de estudiantes citando la guía oficial, con la ventaja de que su entrenamiento específico reduce las respuestas inventadas sobre fechas y porcentajes. Requiere integrarlo con un recuperador (Chroma + mpnet) para que los valores lleguen en el contexto.
- **Demostración docente de QLoRA y agentes**: sirve como ejemplo reproducible de extremo a extremo (dataset sintético, adaptador r=16, evaluación con juez automático) entrenable en una T4 de Colab, útil en cursos de ajuste fino de modelos.
- **Prototipo de enrutado de herramientas en JSON**: el salto medido en `ajan_json` (0,71 → 1,00) y `ajan_arac` (0,41 → 1,00) lo hace adecuado como banco de pruebas de protocolos de function calling en modelos pequeños antes de migrar a uno mayor.
- **Cálculo guiado de tasas y créditos**: para preguntas del tipo "¿cuánto cuesta una asignatura de X ECTS en verano?", el modelo delega en `yaz_okulu_ucreti`, evitando que el modelo aritmético tenga que calcular importes por sí mismo.
- **Consulta de horarios y aulas**: con la herramienta `ders_bilgisi` puede resolver preguntas sobre día, aula y franja horaria de una asignatura a partir de una tabla estructurada, un patrón trasladable a cualquier dominio con datos tabulares.
- **Filtro de alcance en atención al usuario**: su comportamiento de abstención ante preguntas fuera del corpus (nombre del rector, precio del aparcamiento) es aprovechable como capa de derivación a un humano cuando la consulta cae fuera del ámbito documentado.
- **Base para adaptación a otra institución**: al ser un fine-tune ligero sobre un modelo Apache-2.0, el mismo pipeline (dataset sintético + QLoRA) puede replicarse con la normativa real de otra universidad, sustituyendo el corpus y las herramientas.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas internas publicadas por el autor, calculadas sobre un conjunto de test propio y no sobre benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks en la información disponible.

| Métrica (evaluación propia) | Modelo base | Bilge-3B |
|---|---|---|
| kimlik_ad (nombre de identidad) | 0,00 | 0,70 |
| kimlik_isaret (marcador estilístico) | 0,00 | 0,90 |
| ajan_json (JSON de agente válido) | 0,71 | 1,00 |
| ajan_arac (selección correcta de herramienta) | 0,41 | 1,00 |
| rag_hakem (calidad RAG juzgada) | 0,70 | 0,77 |
| rag_isaret (citación/marcado RAG) | 0,40 | 1,00 |

Adicionalmente, el autor reporta una puntuación media de 0,62 (escala 1 / 0,5 / 0) sobre 13 preguntas de test evaluadas por Gemini como juez, con fallos concretos en preguntas que exigen dos pasos de agente ("Adım sınırına ulaşıldı") y en ítems cuyo dato no estaba en la guía.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 7-8 GB (6,2 GB de pesos más overhead de contexto y caché KV).
- VRAM estimada en 8 bits: aproximadamente 4-5 GB; en 4 bits (GGUF Q4): aproximadamente 2-3 GB.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o T4 (16 GB) sin problema; una T4 basta también para el entrenamiento QLoRA según el autor.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en RTX 4060 8 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: llama.cpp u Ollama con el repositorio GGUF; vLLM o TGI con los pesos safetensors; transformers + PEFT para cargar el adaptador LoRA. El pipeline completo necesita además un servidor de embeddings y Chroma.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de sus especificaciones públicas y no de la información proporcionada; se incluyen como referencia de categoría.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Bilge-3B | 3,09 B | 32.768 (heredado del base) | `other` | Fine-tune de dominio en turco con RAG y agentes |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache 2.0 | Base generalista multilingüe |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | Generalista multilingüe |
| Phi-3.5-mini-instruct | 3,82 B | 128.000 | MIT | Generalista, foco en razonamiento |
| Gemma 2 2B IT | 2,61 B | 8.000 | Gemma Terms of Use | Generalista ligero |

Frente a estas alternativas, Bilge-3B no compite en capacidades generales: su ventaja es la especialización vertical (identidad, formato JSON de agente, abstención en dominio) y su desventaja es el alcance, limitado al turco y a un corpus ficticio, además de una licencia `other` cuyo texto no está detallado.

## Limitaciones y advertencias

- **Dominio ficticio**: solo es válido para la guía de secretaría académica y la tabla de horarios de la Universidad Técnica Lale; no puede usarse para normativa universitaria real.
- **Dependencia del recuperador**: sin el contexto RAG adecuado, el modelo intenta estimar créditos, importes y fechas, según reconoce el propio autor. La variante desplegada con TF-IDF falla ante sinónimos ("yoklama" frente a "devam zorunluluğu").
- **Razonamiento multi-paso frágil**: se han documentado fallos al omitir el segundo paso de herramienta en cálculos compuestos; no es fiable para cadenas de más de dos llamadas.
- **Alucinación en el límite del corpus**: la puntuación media de 0,62 en el test propio incluye respuestas incorrectas o evasivas; la abstención no es sistemática (por ejemplo, confundió el examen de recuperación con el de mazeret).
- **Idioma**: solo turco; no hay evidencia de calidad en castellano ni en otros idiomas, más allá de la herencia del modelo base.
- **Volumen de datos muy reducido**: 441 conversaciones sintéticas generadas por otro modelo implican riesgo de sobreajuste al estilo y a los patrones concretos del dataset, y posible propagación de sesgos del generador.
- **Escasa validación externa**: 0 descargas y 0 likes en el momento de la consulta; las métricas proceden del propio autor y usan un juez automático (Gemini), no evaluación humana.
- **Licencia**: marcada como `other` sin texto disponible; antes de cualquier uso comercial es imprescindible contactar con el autor y verificar también los términos del modelo base Qwen2.5-3B-Instruct.
- **Fecha de publicación anómala**: los metadatos indican creación en 2026-10-20, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rennan28/Bilge-3B
- Adaptador LoRA: https://huggingface.co/Rennan28/Bilge-3B-LoRA
- Pesos GGUF: https://huggingface.co/Rennan28/Bilge-3B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Rennan28/bilge-3b-veri
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (los resultados de la búsqueda web no contenían enlaces relevantes al modelo).

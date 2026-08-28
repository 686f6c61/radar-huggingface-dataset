# MohammadKhosravi/llama3.1-8b-pure-pmt-13k-5class-previous-prompt

## Resumen

Este repositorio contiene un adaptador PEFT (Parameter-Efficient Fine-Tuning) basado en el modelo `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por MohammadKhosravi. El adaptador emplea una técnica denominada *PrefixMemory-Tuning* (PMT) para alinear el modelo con los niveles del Marco Común Europeo de Referencia para las Lenguas (CEFR), específicamente en una configuración de 5 clases (A1-C1). El objetivo del experimento es validar si la eliminación de datos solapados de la frontera C2 y el aumento de la densidad estadística en el rango A1-C1 (con 13.805 muestras) supera el estancamiento en una precisión estricta del 68% observado en un dataset de 6 clases.

El adaptador se entrena durante 6 épocas sobre un conjunto de datos deduplicado y equilibrado por temas, con una pérdida de validación que alcanza 1.918 en la primera época y una perplejidad de 6.81. La arquitectura PMT incluye matrices completas de 4096×4096 en las 32 capas del modelo base y un embedding explícito de 5 clases (también de dimensión 4096). El repositorio tiene un tamaño de 1.1 GB y está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones.

La relevancia de este trabajo radica en la exploración de métodos de ajuste fino paramétricamente eficientes para tareas de clasificación lingüística, ofreciendo una alternativa a los enfoques tradicionales de fine-tuning completo. Sin embargo, la documentación es limitada: no se proporcionan ejemplos de uso, métricas de evaluación externa ni comparativas con otros sistemas, por lo que su rendimiento práctico debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (PrefixMemory-Tuning) sobre Llama-3.1-8B-Instruct |
| Parametros totales | no disponible (el adaptador ocupa 1.1 GB en disco) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision completa, probablemente FP32 o BF16) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero el adaptador se entrena para clasificacion CEFR, sin especificar idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador implementa *PrefixMemory-Tuning* (PMT) sin compresion, utilizando matrices completas de 4096×4096 en las 32 capas del transformer base. Ademas, incorpora un embedding explicito de 5 clases (`nn.Embedding(5, 4096)`) que se entrena exclusivamente con etiquetas limpias de A1-C1. Este embedding actua como un ancla semantica que guia la representacion interna del modelo hacia la clasificacion CEFR.

El entrenamiento se realizo sobre 13.805 instancias deduplicadas y equilibradas por tema, durante 6 epocas. La funcion de perdida es la entropia cruzada estandar, y los resultados de validacion muestran una perdida de 1.918 en la primera epoca (perplejidad 6.81), que aumenta progresivamente en epocas posteriores (1.9603 en la segunda y 2.2169 en la tercera), indicando un posible sobreajuste. No se menciona el uso de tecnicas como RLHF o DPO; el enfoque es puramente supervisado.

La innovacion principal radica en el uso de PMT, que modifica las activaciones internas del modelo mediante matrices aprendidas, en lugar de anadir capas externas o ajustar todos los pesos. Esto permite un ajuste fino con un numero reducido de parametros, aunque en este caso las matrices son completas (sin compresion), lo que incrementa el coste de almacenamiento.

## Capacidades

- Clasificacion de textos en niveles CEFR (A1, A2, B1, B2, C1) mediante el adaptador entrenado.
- Hereda las capacidades generales del modelo base Llama-3.1-8B-Instruct: generacion de texto, razonamiento, codigo, matematicas y comprension multilingue, aunque el adaptador puede alterar el comportamiento en la tarea especifica.
- No se documenta soporte para tool calling, agentes o funciones especiales; estas capacidades dependen del modelo base, que si las incluye.
- El adaptador esta disenado para una tarea de clasificacion de 5 clases, no para generacion libre; su uso principal es la evaluacion automatica de nivel de idioma.

## Casos de uso

- Evaluacion de nivel de idioma en plataformas educativas: el adaptador puede clasificar redacciones o respuestas de estudiantes en niveles CEFR, permitiendo una colocacion automatica en cursos o materiales adecuados. Su ventana de contexto de 128k permite procesar textos largos sin truncamiento.
- Filtrado de contenido por dificultad linguistica: en sistemas de recomendacion de lecturas o noticias, el modelo puede etiquetar articulos segun su nivel de complejidad para adaptar la experiencia a usuarios con distinto dominio del idioma.
- Analisis de progreso en aprendizaje de idiomas: al clasificar muestras de produccion escrita en distintos momentos, se puede medir la evolucion del alumno hacia niveles superiores.
- Generacion de ejercicios personalizados: combinado con un modelo generativo, el adaptador puede servir como componente de control para producir textos de dificultad calibrada (por ejemplo, generar preguntas de nivel B1).
- Moderacion de contenido en foros de aprendizaje: clasificar publicaciones para identificar si el lenguaje es apropiado para principiantes o si requiere simplificacion.
- Investigacion en linguistica computacional: como herramienta de anotacion automatica de corpus con etiquetas CEFR, acelerando la creacion de datasets etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye metricas de entrenamiento (perdida y perplejidad de validacion) para las tres primeras epocas, sin comparacion con otros modelos ni evaluacion en tareas externas.

## Requisitos de hardware

- El adaptador PEFT requiere cargar el modelo base Llama-3.1-8B-Instruct. En FP16, el modelo base ocupa aproximadamente 16 GB de VRAM; en cuantizacion de 4 bits (por ejemplo, con bitsandbytes), se reduce a unos 6 GB.
- El adaptador en si anade un coste adicional de memoria, pero al ser PEFT, se puede fusionar con el modelo base o cargarse por separado.
- GPUs recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A10G (24 GB) o A100 (40 GB) para inferencia comoda en FP16. Para cuantizacion de 4 bits, una RTX 3060 (12 GB) podria ser suficiente.
- Opciones de despliegue: vLLM, llama.cpp (con soporte para adaptadores LoRA/IA3, aunque PMT puede requerir modificaciones), Hugging Face Transformers con PEFT, o TGI (Text Generation Inference) si se convierte el adaptador a un formato compatible.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la implementacion. En una A100, el modelo base de 8B puede generar aproximadamente 50-100 tokens/segundo, pero el adaptador PMT podria anadir una sobrecarga debido a las operaciones matriciales adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (PMT 13K) | Adaptador sobre 8B | 128k | Clasificacion CEFR 5 clases | MIT | Hugging Face |
| MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K | Adaptador sobre 8B | 128k | Clasificacion CEFR con gating (60K dataset) | MIT | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8B | 128k | Generacion general | Llama 3.1 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. El adaptador de 13K se centra en 5 clases (A1-C1) mientras que el de 60K usa un dataset mayor y un mecanismo de gating, lo que podria ofrecer mayor precision pero con mayor coste de entrenamiento.

## Limitaciones y advertencias

- La documentacion es minima: no se especifican los idiomas soportados, el formato de entrada esperado ni ejemplos de uso, lo que dificulta su implementacion directa.
- No se proporcionan evaluaciones externas (MMLU, HumanEval, etc.) ni comparativas con otros clasificadores CEFR, por lo que su rendimiento real es desconocido.
- Los datos de entrenamiento se basan en EFCAMDAT (segun el repositorio del autor), que es un corpus de aprendices de ingles; el adaptador podria no generalizar bien a otros idiomas o variedades dialectales.
- El sobreajuste observado (aumento de la perdida de validacion en epocas posteriores) sugiere que el modelo podria memorizar el conjunto de entrenamiento y fallar en datos no vistos.
- El uso del modelo base Llama-3.1-8B-Instruct implica las limitaciones inherentes de este: posibles sesgos, riesgo de alucinacion y restricciones de la licencia de Meta (aunque el adaptador en si es MIT, el modelo base tiene su propia licencia que puede afectar al despliegue en produccion).
- Al ser un adaptador PEFT, requiere cargar el modelo base completo, lo que implica requisitos de hardware no triviales.

## Enlaces

- [Hugging Face - MohammadKhosravi/llama3.1-8b-pure-pmt-13k-5class-previous-prompt](https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-13k-5class-previous-prompt)
- [Hugging Face - MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K](https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-60K)
- [Ollama - llama3.1:8b](https://ollama.com/library/llama3.1:8b)
- [GitHub - meta-llama/llama3](https://github.com/meta-llama/llama3)
- [Meta Developer - Llama 3](https://developer.meta.com/ai/models/llama-3/)

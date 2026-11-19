# iamtatsuki05/Llama-JP-1B-PT-stage1

## Resumen

Llama-JP-1B-PT-stage1 es un modelo de lenguaje decoder-only de tipo Llama, desarrollado por el usuario iamtatsuki05 dentro del proyecto MIREI, orientado exclusivamente al idioma japonés. Con 1.407.538.944 parámetros totales (aproximadamente 1,4B), se trata de un checkpoint de preentrenamiento que continúa desde iamtatsuki05/Llama-JP-1B-init y que ha sido entrenado sobre el corpus hotchpotch/fineweb-2-edu-japanese, observando unos 18B tokens con ventanas de contexto de 1.024 tokens durante el entrenamiento.

El modelo forma parte de una serie comparativa que incluye un checkpoint gemelo con arquitectura ModernBERT (iamtatsuki05/ModernBERT-JP-1B-PT-stage1), entrenado con la misma receta y el mismo dataset. Esta pareja encoder/decoder está pensada para el estudio académico de arquitecturas en tareas de embeddings de frases en japonés, según la cita asociada al proyecto (NLP2026).

Su relevancia actual es acotada pero clara: ofrece un backbone japonés de tamaño contenido, licencia MIT y pesos en safetensors, adecuado para experimentación, ajuste fino posterior y despliegue en hardware modesto. No es un modelo instruido ni alineado; es una base de preentrenamiento que requiere etapas adicionales de SFT o instrucción para tareas conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (decoder-only transformer) |
| Parametros totales | 1.407.538.944 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (máximo de secuencia); entrenado con ventanas de 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales de la model card: dimensión de embedding 1792, tokenizador SentencePiece con vocabulario de 102.400 tokens, codificación posicional RoPE.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Llama estándar, con atención causal y RoPE como codificación posicional. La dimensión de embedding es 1792 y el tokenizador es SentencePiece con un vocabulario de 102.400 entradas, un tamaño de vocabulario elevado que sugiere una tokenización optimizada para japonés (mayor cobertura de caracteres y subpalabras japonesas). El modelo soporta hasta 8.192 tokens de secuencia, aunque el preentrenamiento se realizó con contextos de 1.024 tokens.

El entrenamiento consistió en una etapa de preentrenamiento continuado desde iamtatsuki05/Llama-JP-1B-init sobre el dataset hotchpotch/fineweb-2-edu-japanese, con aproximadamente 18B tokens observados. No se documenta en la model card el uso de RLHF, DPO ni ninguna etapa de alineación; se trata, por tanto, de un modelo base. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La receta es compartida con el checkpoint ModernBERT de la misma serie, lo que permite una comparación controlada entre arquitecturas encoder y decoder bajo condiciones idénticas de datos y cómputo.

## Capacidades

- Generación de texto en japonés: continuación de texto y generación libre a partir de un prompt, en modo decoder-only.
- Modelo base sin instrucción: no está entrenado para seguir instrucciones ni para formato conversacional; requiere SFT para tareas de asistente.
- Razonamiento y conocimiento factual limitados por el tamaño (1,4B) y por el volumen de entrenamiento (18B tokens).
- Capacidades de código y matemáticas: no documentadas ni destacadas en la model card; previsiblemente limitadas.
- Tool calling / function calling: no soportado de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: no; el modelo está declarado únicamente para japonés.
- Capacidad especial: ninguna declarada (sin modo thinking, sin visión, sin audio).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.

## Casos de uso

- Investigación comparativa encoder vs. decoder: el modelo sirve como brazo decoder de un experimento controlado frente a ModernBERT-JP-1B-PT-stage1, con el mismo dataset y receta, para analizar diferencias en representaciones y embeddings de frases en japonés.
- Ajuste fino supervisado (SFT) para asistentes japoneses: al ser un modelo base de 1,4B con licencia MIT, es un punto de partida económico para crear un modelo instruido de dominio específico con un presupuesto de cómputo reducido.
- Generación de texto japonés en dominios educativos: el corpus de entrenamiento (fineweb-2-edu-japanese) está orientado a contenido educativo, por lo que el modelo puede emplearse para generar material didáctico o resúmenes tras un ajuste fino.
- Prototipado rápido en local: con 1,4B parámetros en bfloat16 (unos 2,8 GB de pesos), cabe en GPUs de consumo y permite iterar en experimentos de generación sin infraestructura dedicada.
- Base para modelos de embeddings japoneses: la serie está vinculada a un trabajo sobre embeddings de frases, por lo que el checkpoint puede utilizarse para extraer representaciones o inicializar modelos de recuperación en japonés.
- Evaluación de tokenizadores japoneses: el vocabulario de 102.400 tokens de SentencePiece permite estudiar el impacto de la tokenización en la eficiencia y calidad de la generación en japonés.
- Filtrado y aumentación de datos japoneses: generación de texto sintético o paráfrasis para pipelines de datos, con supervisión humana y control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones japonesas como JGLUE o JCommonsenseQA.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 2,8 GB solo para pesos; con caché KV y activaciones, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB de pesos; en 4 bits, alrededor de 0,8 GB (cuantizaciones no publicadas por el autor, requerirían conversión propia).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); A100/H100 no son necesarias salvo para entrenamiento o lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: transformers (versión >= 4.51.0) con accelerate >= 1.6.0 y flash-attn >= 2.7.3; text-generation-inference por los tags del repositorio; conversión a GGUF para llama.cpp u Ollama no publicada, pero viable al ser arquitectura Llama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| iamtatsuki05/Llama-JP-1B-PT-stage1 | 1,41B | 8.192 (entrenado a 1.024) | japonés | MIT | Modelo base, 18B tokens, sin benchmarks publicados |
| iamtatsuki05/ModernBERT-JP-1B-PT-stage1 | no disponible en la informacion | no disponible | japonés | MIT (misma serie) | Brazo encoder de la misma receta; no es decoder generativo |
| iamtatsuki05/Llama-JP-1B-init | no disponible en la informacion | no disponible | japonés | MIT (misma serie) | Checkpoint inicial previo al preentrenamiento de esta etapa |

No se dispone de datos de rendimiento comparativo con modelos de terceros de tamaño similar (por ejemplo, modelos japoneses de 1-2B de otros autores), por lo que la comparación se limita a los checkpoints de la propia serie MIREI.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable y puede generar contenido incoherente o inapropiado; no debe desplegarse directamente en producción conversacional.
- Riesgo de alucinación elevado: con 1,4B parámetros y 18B tokens de entrenamiento, el conocimiento factual es limitado y la propensión a inventar datos es alta.
- Contexto efectivo corto: aunque soporta 8.192 tokens, el entrenamiento se realizó con ventanas de 1.024 tokens, por lo que el rendimiento más allá de ese rango puede degradarse.
- Monolingüe: solo japonés declarado; el uso en castellano u otros idiomas no está soportado ni evaluado.
- Sesgos: no documentados por el autor; el corpus fineweb-2-edu-japanese puede introducir sesgos propios de la web filtrada, sin que se hayan publicado análisis al respecto.
- Licencia MIT: permisiva para uso comercial, pero sin garantías; el autor no ofrece cláusulas de responsabilidad adicionales ni documentación sobre procedencia de datos más allá del dataset citado.
- Madurez del proyecto: repositorio con muy pocas descargas y sin benchmarks; no hay evidencia pública de calidad en producción.
- Dependencias específicas: requiere transformers >= 4.51.0 y flash-attn >= 2.7.3 para el código de ejemplo, lo que puede complicar entornos con versiones fijas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage1
- Modelo base: https://huggingface.co/iamtatsuki05/Llama-JP-1B-init
- Checkpoint ModernBERT de la serie: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage1
- Colección MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Licencia MIT: https://opensource.org/license/mit/

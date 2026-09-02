# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e-1M

## Resumen

Este modelo es una cuantización en precisión mixta de 6 bits (oQ6e-mtp) del modelo Qwen3.8-27B-TURBO-Fable-Cold-Fusion, desarrollada por Solstice-AI específicamente para Apple Silicon mediante la librería MLX. El modelo base, creado por DavidAU, es una variante entrenada con la técnica Cold Fusion (GAIN+UNSLOTH) que reduce los tokens de pensamiento en comparación con el Qwen3.8-27B original, manteniendo o mejorando el rendimiento. Esta versión MLX está optimizada para la memoria unificada de los chips M1 a M5, conservando las capas de atención y proyecciones recurrentes a mayor precisión mientras las redes feed-forward se cuantizan a 6 bits para maximizar la velocidad de generación.

El modelo soporta de forma nativa una ventana de contexto de 1.000.000 de tokens y utiliza Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa, lo que acelera la generación hasta 1,72 veces respecto al baseline sin cuantizar. Con 27.781.427.952 parámetros, se posiciona como una opción viable para ejecutar un LLM de gran tamaño en hardware de Apple con un consumo de memoria razonable (23,7 GB en disco). Su licencia Apache 2.0 permite uso comercial sin restricciones, y los idiomas declarados son inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal en 48 de 64 capas) y MTP, cuantización oMLX 6-bit mixta |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | oQ6e-mtp (6-bit mixto) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: 48 de sus 64 capas utilizan atención lineal, mientras que las 16 restantes emplean atención completa. Incluye un cabezal de predicción multi-token (MTP) integrado que actúa como modelo draft para decodificación especulativa. La variante Cold Fusion, sobre la que se construye esta cuantización, fue entrenada con la metodología GAIN+UNSLOTH, que reduce significativamente los tokens de pensamiento (entre 1/5 y 1/2 en los tres modos de operación) sin sacrificar precisión.

La cuantización oMLX aplica precisión mixta: las matrices de atención y las proyecciones recurrentes GDN se mantienen a mayor bit-depth, mientras que las capas feed-forward se reducen a 6 bits. Esto permite un equilibrio entre calidad y velocidad, logrando un factor de aceleración de 1,72x respecto al modelo BF16 sin cuantizar. No se han publicado detalles sobre el dataset de entrenamiento de la cuantización ni sobre el proceso de calibración, más allá de que es una conversión del modelo DavidAU.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de codificación (HumanEval 88,4% en la versión 6-bit).
- Ventana de contexto de 1.000.000 de tokens, adecuada para procesar documentos extensos o conversaciones de muy larga duración.
- Aceleración especulativa mediante MTP, que mejora la velocidad de generación sin intervención del usuario.
- Multilingüe limitado a inglés y chino (según la model card).
- Los tags del repositorio incluyen "agentic-coding" y "tool-calling", aunque la model card no detalla explícitamente el soporte de function calling en esta versión MLX. El modelo base Qwen3.8-27B sí lo ofrece, por lo que es probable que esta cuantización lo herede, pero no está confirmado.
- No se menciona soporte de visión en esta versión MLX; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Asistente de programación local en Mac: gracias a su soporte para agentic coding y su velocidad mejorada, puede integrarse en entornos de desarrollo como un copiloto que sugiere código, explica fragmentos o refactoriza proyectos, ejecutándose completamente en el dispositivo.
- Procesamiento de documentos legales o académicos extensos: la ventana de 1M de tokens permite analizar contratos, tesis o expedientes completos sin necesidad de dividirlos en fragmentos, manteniendo el contexto íntegro.
- Chat conversacional de largo recorrido: para aplicaciones de atención al cliente o asistentes personales que requieren recordar interacciones previas durante horas o días, el contexto amplio evita pérdidas de información.
- Generación de código en pipelines de CI/CD: al poder ejecutarse como servidor OpenAI-compatible mediante Anvil o MLX-LM, puede integrarse en flujos de automatización para generar tests, documentación o parches, con la ventaja de no enviar datos a la nube.
- Traducción y redacción bilingüe (inglés-chino): su entrenamiento en ambos idiomas lo hace útil para tareas de localización, resúmenes o generación de contenido en estos dos idiomas.
- Investigación en razonamiento y eficiencia: al ser una cuantización de precisión mixta con MTP, sirve como banco de pruebas para estudiar el impacto de la cuantización en tareas de razonamiento y codificación, comparando con las variantes de 4, 5 y 8 bits.

## Benchmarks y rendimiento

La model card proporciona resultados empíricos para distintas precisiones del mismo modelo, comparados con el baseline BF16 sin cuantizar. Los datos corresponden a MMLU, MMLU_Pro, HumanEval (Python) y velocidad de generación relativa.

| Precision | MMLU | MMLU_Pro | HumanEval (Python) | Velocidad relativa |
|---|---|---|---|---|
| BF16 (sin cuantizar) | 87,3% | 68,7% | 89,0% | 1,00x |
| oQ8e-mtp (8-bit) | 87,0% | 68,7% | 89,6% | 1,45x |
| oQ6e-mtp (6-bit) | 86,0% | 70,0% | 88,4% | 1,72x |
| oQ5e-mtp (5-bit) | 87,0% | 67,7% | 89,0% | 1,95x |
| oQ4e-mtp (4-bit) | 86,3% | 66,3% | 86,6% | 2,20x |

La versión 6-bit objeto de esta ficha muestra una ligera caída en MMLU (-1,3 puntos) y HumanEval (-0,6 puntos) respecto al baseline, pero mejora MMLU_Pro en +1,3 puntos. La velocidad de generación es 1,72 veces superior, lo que la convierte en una opción equilibrada para uso interactivo.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1 a M5) con memoria unificada. No es compatible con GPUs NVIDIA o AMD.
- Memoria: el repositorio ocupa 23,7 GB en disco. Para cargar el modelo en memoria unificada se recomienda un mínimo de 32 GB de RAM, aunque con 24 GB podría funcionar con limitaciones de contexto.
- GPU: utiliza la GPU integrada del chip Apple Silicon a través de Metal.
- Despliegue: dos opciones principales: el motor Anvil (binario único, con asignación nativa de memoria unificada y aceleración MTP) o la librería MLX-LM (Python). Ambos permiten servir un endpoint compatible con OpenAI.
- Latencia y throughput: no se proporcionan valores absolutos, solo la velocidad relativa de 1,72x frente al BF16. En la práctica, la generación dependerá del modelo exacto de chip y de la memoria disponible.

## Comparativa con modelos similares

La comparación más directa es con las otras precisiones del mismo modelo base, ya que no se dispone de datos de modelos alternativos en el mismo hardware. La siguiente tabla resume las diferencias clave.

| Modelo | Precision | Contexto | MMLU | HumanEval | Velocidad relativa | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | BF16 | 262K (extensible a 1M) | no disponible | no disponible | 1,00x | Apache 2.0 |
| Este modelo (oQ6e-mtp) | 6-bit mixto | 1M | 86,0% | 88,4% | 1,72x | Apache 2.0 |
| Variante oQ4e-mtp | 4-bit mixto | 1M | 86,3% | 86,6% | 2,20x | Apache 2.0 |
| Variante oQ8e-mtp | 8-bit mixto | 1M | 87,0% | 89,6% | 1,45x | Apache 2.0 |

Frente al Qwen3.8-27B original, esta versión MLX ofrece una ventana de contexto mayor (1M frente a 262K nativo) y una velocidad superior gracias a la cuantización, a costa de una pequeña pérdida de precisión. No se dispone de comparativas con otros modelos de 27B en Apple Silicon.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización de 6 bits introduce una degradación mínima en MMLU y HumanEval, aunque mejora MMLU_Pro. Para tareas que requieran la máxima precisión, se recomienda usar la versión BF16 o la de 8 bits.
- El nombre del modelo incluye "Uncensored" y "Heretic", lo que sugiere que puede carecer de alineación de seguridad. No se han publicado evaluaciones de sesgos o toxicidad, por lo que su uso en producción debe ir acompañado de filtros adicionales.
- No se confirma el soporte de tool calling o agentes en esta versión MLX, a pesar de que el modelo base lo ofrece. Es necesario verificar estas capacidades antes de integrarlo en flujos automatizados.
- La ausencia de soporte de visión (aunque el Qwen3.8-27B original es multimodal) limita su uso a tareas de texto puro.
- Al ser un modelo reciente con cero descargas y cero likes, no hay evidencia comunitaria de su estabilidad o rendimiento en entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ6e-1M
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Qwen3.8-27B original: https://huggingface.co/Qwen/Qwen3.8-27B
- Motor Anvil: https://github.com/Solstice-Labs/anvil
- Sitio web de Solstice-AI: https://solstice-ai.co

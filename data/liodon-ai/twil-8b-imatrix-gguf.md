# liodon-ai/TwIL-8B-imatrix-GGUF

## Resumen

TwIL-8B-imatrix-GGUF es una colección de cuantizaciones GGUF del modelo base webAI-Official/TwIL-8B, publicada por Liodon AI. El modelo original cuenta con 8.791.592.960 parámetros (aproximadamente 8,8 mil millones) y está orientado a generación de texto conversacional. Esta publicación no contiene pesos nuevos ni un modelo entrenado desde cero: es una redistribución optimizada para inferencia local en formatos de baja precisión.

La característica diferencial de esta versión es el uso de calibración iMatrix durante el proceso de cuantización. Liodon AI ejecuta 128 fragmentos de calibración (2 millones de tokens de WikiText-103) a través del modelo en precisión completa para identificar qué pesos son más sensibles, y asigna mayor precisión a esas regiones. El resultado es que las cuantizaciones de 2, 3 y 4 bits mantienen mejor coherencia e instrucciones que una cuantización uniforme del mismo tamaño.

El interés práctico reside en la disponibilidad de siete variantes que abarcan desde 3,16 GB (IQ2_M) hasta 9,35 GB (Q8_0), lo que permite ejecutar el modelo en GPUs de consumo con 4-11 GB de VRAM. La licencia es "other" y no se especifican los términos exactos, un punto que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 8,79B parámetros; detalles no publicados en la información disponible) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (todas con calibración iMatrix) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base webAI-Official/TwIL-8B: la model card de esta publicación solo describe el proceso de cuantización, no el entrenamiento del modelo original. Por el recuento de parámetros (8,79B) y la nomenclatura "8B", se trata presumiblemente de un transformer decoder-only de escala 8B, pero no hay confirmación en la información proporcionada.

Lo que sí está documentado es el proceso de cuantización. Liodon AI aplica cuantización con matrices de importancia (iMatrix): se ejecutan 128 chunks de calibración sobre el modelo en precisión completa usando 2 millones de tokens de WikiText-103, se calculan las importancias por tensor y se distribuye el presupuesto de bits de forma no uniforme. Esto afecta especialmente a las variantes sub-4-bit (IQ2_M, IQ3_M, IQ4_XS), donde la pérdida de calidad respecto al modelo original es más crítica. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es text-generation y el tag "conversational" aparece en los metadatos del repositorio.
- Instrucciones y diálogo multi-turno: el formato GGUF y la integración con llama.cpp, Ollama y LM Studio permiten su uso en aplicaciones de chat local.
- Inferencia local en hardware de consumo: es la capacidad principal de esta publicación, gracias a las siete variantes de cuantización.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Razonamiento, código, matemáticas, visión, audio, tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.

## Casos de uso

- Asistente conversacional local en portátil: con la variante IQ3_M (4,09 GB) o Q4_K_M (5,35 GB) el modelo cabe en GPUs de portátil con 6 GB de VRAM, lo que permite un chatbot privado sin conexión a servicios externos.
- Prototipado rápido con Ollama: el comando `ollama run hf.co/liodon-ai/TwIL-8B-imatrix-GGUF:Q4_K_M` permite tener un endpoint conversacional operativo en minutos, útil para validar ideas antes de invertir en infraestructura.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: la variante IQ2_M (3,16 GB) puede ejecutarse en GPUs de 4 GB o, con llama.cpp, en CPU con suficiente RAM, lo que sirve para entornos de desarrollo con hardware limitado.
- Evaluación comparativa de cuantizaciones: disponer de siete variantes del mismo modelo permite medir empíricamente la degradación de calidad por bit en tareas concretas del dominio propio, algo útil para equipos que investigan el impacto de la cuantización.
- Integración en LM Studio o Jan para uso personal: la búsqueda por nombre dentro de estas aplicaciones de escritorio facilita probar el modelo sin escribir código, adecuado para evaluación cualitativa rápida.
- Generación de texto por lotes en CPU: con Q4_K_M o Q5_K_M y llama.cpp, se puede procesar texto en servidores sin GPU para tareas de baja concurrencia donde la latencia no es crítica.
- Base para fine-tuning ligero o experimentación: aunque esta publicación es solo de inferencia, el modelo base en safetensors permite partir de él para ajustes posteriores, y las variantes GGUF sirven como referencia de calidad tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según la model card del autor:
  - IQ2_M: 3,16 GB de archivo, ~4 GB de VRAM.
  - IQ3_M: 4,09 GB de archivo, ~5 GB de VRAM.
  - IQ4_XS: 4,82 GB de archivo, ~6 GB de VRAM.
  - Q4_K_M: 5,35 GB de archivo, ~6 GB de VRAM (recomendado por el autor).
  - Q5_K_M: 6,25 GB de archivo, ~7 GB de VRAM.
  - Q6_K: 7,22 GB de archivo, ~8 GB de VRAM.
  - Q8_0: 9,35 GB de archivo, ~11 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutar todas las variantes; tarjetas de 6-8 GB (RTX 3060 6 GB, RTX 4060, RTX 3070) quedan limitadas a IQ2_M, IQ3_M, IQ4_XS y Q4_K_M.
- GPU de datacenter: A100 y H100 no son necesarias para este tamaño; su uso solo tendría sentido para servir muchas instancias concurrentes.
- Despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, Jan y cualquier runtime compatible con GGUF. No se menciona soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. A continuación se indica lo que se puede afirmar con la información disponible:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TwIL-8B (esta publicacion) | 8,79B | no disponible | other | GGUF (7 variantes) | Cuantización iMatrix, 3,16-9,35 GB |
| Modelo base webAI-Official/TwIL-8B | 8,79B | no disponible | other | safetensors | Precisión completa, referencia para comparar |
| Alternativas de 7-9B | no disponible | no disponible | no disponible | no disponible | No se identifican en la información proporcionada modelos comparables concretos |

## Limitaciones y advertencias

- Licencia "other": no se detallan los términos. Es imprescindible revisar la licencia del modelo base webAI-Official/TwIL-8B antes de cualquier uso comercial.
- La cuantización introduce pérdida de calidad respecto al modelo en precisión completa, especialmente en IQ2_M e IQ3_M. El autor la califica de "smallest usable" para IQ2_M, lo que implica degradación notable.
- No hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base; no se puede descartar la reproducción de sesgos presentes en los datos originales.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- El tamaño del repo (40,2 GB) incluye todas las variantes; conviene descargar solo el archivo de la cuantización elegida.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas en producción sin verificación empírica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/TwIL-8B-imatrix-GGUF
- Modelo base: https://huggingface.co/webAI-Official/TwIL-8B
- Cuantizaciones sin iMatrix del mismo autor: https://huggingface.co/liodon-ai/TwIL-8B-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Dataset de calibración: https://huggingface.co/datasets/wikitext

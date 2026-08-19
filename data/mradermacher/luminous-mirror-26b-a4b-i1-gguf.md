# mradermacher/Luminous-Mirror-26B-A4B-i1-GGUF

## Resumen

Luminous-Mirror-26B-A4B-i1 es una versión cuantizada en formato GGUF del modelo original Luminous-Mirror-26B-A4B, desarrollado por Vortex5. Esta conversión ha sido realizada por mradermacher e incluye un conjunto amplio de cuantizaciones (desde Q2_K hasta Q6_K, incluyendo versiones IQ) con el uso de la técnica imatrix para mejorar la calidad de la cuantización. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos, aunque esta información no está confirmada en los metadatos disponibles.

El repositorio contiene exclusivamente archivos GGUF, lo que lo hace compatible con motores de inferencia como llama.cpp, Ollama y vLLM. Está etiquetado como "conversational", lo que indica que está orientado a tareas de chat y generación de texto conversacional. Al tratarse de una cuantización, su relevancia radica en permitir ejecutar un modelo de gran tamaño en hardware más modesto, con distintos niveles de precisión según la cuantización elegida.

No se dispone de información pública sobre el entrenamiento, los datos utilizados, los benchmarks o la licencia del modelo original, por lo que esta ficha se basa únicamente en los datos del repositorio de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferido del nombre A4B, no confirmado) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | 4B (inferido del nombre A4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados para el modelo original Luminous-Mirror-26B-A4B. El nombre sugiere una arquitectura de mezcla de expertos (Mixture of Experts) con 26 mil millones de parámetros totales y 4 mil millones de parámetros activos, pero esto no está confirmado oficialmente. La versión aquí descrita es una cuantización GGUF realizada con la técnica imatrix, que optimiza la asignación de bits en función de la importancia de cada tensor para reducir la pérdida de calidad respecto a cuantizaciones estándar.

## Capacidades

- Generación de texto conversacional (etiqueta "conversational" en el repositorio).
- Compatible con endpoints de inferencia (etiqueta "endpoints_compatible").
- Disponible en múltiples niveles de cuantización para adaptarse a distintos requisitos de memoria y precisión.
- No se dispone de información sobre capacidades específicas como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

Al carecer de documentación detallada del modelo original, los casos de uso se infieren de su naturaleza conversacional y de su tamaño:

- Chatbots y asistentes virtuales: al ser un modelo de gran tamaño (26B totales) con cuantizaciones ligeras, puede desplegarse en servidores con una sola GPU para atender conversaciones multi-turno, aunque la calidad dependerá de la cuantización elegida.
- Generación de texto creativo: redacción de artículos, cuentos o guiones, aprovechando su capacidad de generar texto coherente en contextos conversacionales.
- Prototipado rápido de aplicaciones de lenguaje: gracias a los archivos GGUF, se puede integrar fácilmente en entornos como Ollama o llama.cpp para pruebas de concepto sin necesidad de infraestructura compleja.
- Fine-tuning posterior: aunque no se indica si los pesos originales están disponibles, la versión GGUF puede usarse como punto de partida para ajustes con técnicas de LoRA en motores compatibles.
- Evaluación de calidad de cuantización: el repositorio ofrece múltiples niveles de cuantización, lo que permite comparar el impacto de la compresión en la calidad de las respuestas.
- Despliegue en entornos con restricciones de memoria: las cuantizaciones más bajas (Q2_K, IQ1_S) permiten ejecutar el modelo en GPUs con 8-10 GB de VRAM, aunque con degradación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los requisitos dependen del archivo GGUF seleccionado. El tamaño del repositorio completo es de 79,9 GB, pero cada archivo individual es mucho menor. Estimaciones orientativas para un modelo de 26B parámetros:

- Q2_K: ~10-11 GB de VRAM, ejecutable en RTX 3090, RTX 4080 o similar.
- Q4_K_M: ~15-16 GB de VRAM, recomendado para RTX 4090, A6000 o A100.
- Q6_K: ~20-21 GB de VRAM, requiere GPU profesional (A100, H100) o múltiples GPUs.
- Las cuantizaciones IQ (IQ1_S, IQ2_XXS, etc.) son más compactas y pueden caber en GPUs de 8 GB con pérdida significativa de calidad.

Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui, y cualquier motor compatible con GGUF. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se ha identificado información sobre modelos comparables en el repositorio ni en la documentación accesible.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo original.
- Al ser una cuantización, la calidad de las respuestas puede degradarse respecto al modelo original, especialmente en las cuantizaciones más agresivas (Q2_K, IQ1_S).
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o impone restricciones.
- El modelo está etiquetado como "conversational", pero no se garantiza que maneje correctamente tareas complejas como razonamiento matemático avanzado o generación de código.
- No hay información sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicación reciente o poco validada por la comunidad.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Luminous-Mirror-26B-A4B-i1-GGUF
- Modelo original (referenciado en el README): https://huggingface.co/Vortex5/Luminous-Mirror-26B-A4B

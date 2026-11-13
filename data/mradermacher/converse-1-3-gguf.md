# mradermacher/Converse-1.3-GGUF

## Resumen

Converse-1.3-GGUF es una republicación en formato GGUF del modelo Converse-1.3, publicada por el usuario mradermacher. El repositorio no incluye model card descriptiva propia: la única información disponible es una nota que indica que se trata de cuantizaciones estáticas del modelo original dgAI202/Converse-1.3, junto con metadatos internos del proceso de conversión. No se dispone de datos sobre arquitectura, tamaño, contexto, licencia ni idiomas en la información proporcionada.

El interés de este repositorio reside en que un tercero ha generado versiones cuantizadas del modelo original en múltiples precisiones (desde Q2_K hasta Q8_0, pasando por Q4_K_M, Q5_K_M e IQ4_XS), lo que permite ejecutar el modelo con requisitos de memoria reducidos en entornos con llama.cpp y derivados. Sin embargo, al no publicarse la model card del modelo base ni sus especificaciones, cualquier evaluación técnica rigurosa requiere consultar directamente el repositorio de origen dgAI202/Converse-1.3.

La ficha que sigue documenta exclusivamente lo que consta en la información disponible y marca explícitamente como "no disponible" todo aquello que no se ha podido verificar, incluyendo parámetros, contexto, licencia y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas derivadas de pesos en formato Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Converse-1.3 (dgAI202/Converse-1.3). La model card del repositorio GGUF no describe si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni tampoco detalla el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o técnicas de alineación.

Lo único verificable es el proceso de conversión: los metadatos indican `convert_type: hf` y `quantize_version: 2`, lo que sugiere que los pesos se convirtieron desde el formato Hugging Face original y que se aplicó cuantización sobre tensores de salida (`output_tensor_quantised: 1`). Las cuantizaciones listadas son estáticas y cubren un rango amplio de precisiones, desde 2 bits (Q2_K) hasta 8 bits (Q8_0), además de una versión sin cuantizar en FP16 (x-f16).

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No consta soporte verificado de tool calling, function calling ni de razonamiento multi-paso.
- No consta soporte multilingüe declarado.
- No consta ningún modo especial (thinking mode, visión, audio) en la documentación proporcionada.
- La única capacidad inferible del repositorio es la de servir como artefacto de inferencia en formato GGUF para motores compatibles.

## Casos de uso

- Despliegue en CPU con llama.cpp: al existir cuantizaciones Q4_K_M y Q5_K_M, el modelo puede ejecutarse en equipos sin GPU dedicada usando llama.cpp, siempre que se conozca previamente el tamaño real del modelo base (no disponible en esta ficha).
- Ejecución en GPUs de gama consumer: las variantes Q3_K_M y Q4_K_S permiten ajustar el uso de VRAM en tarjetas con 8-12 GB, a condición de verificar el número de parámetros del modelo original.
- Integración en Ollama: los GGUF son el formato nativo de Ollama, por lo que este repositorio puede importarse directamente para pruebas locales de conversación, previa confirmación de la licencia del modelo base.
- Evaluación comparativa de cuantizaciones: al ofrecer Q2_K, Q3_K, Q4_K, Q5_K, Q6_K y Q8_0 del mismo modelo, permite medir la degradación de calidad frente al tamaño en un pipeline de evaluación propio.
- Servido con llama.cpp server o similar: útil para prototipos de API local con bajo coste de infraestructura, sujeto a las limitaciones de contexto y rendimiento del modelo base, que no están documentadas aquí.
- Archivado y reproducibilidad: el repositorio conserva una instantánea de cuantizaciones con fecha de creación y actualización, útil como artefacto de referencia si el modelo original deja de estar disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al desconocerse el número de parámetros del modelo base. La estimación depende directamente del tamaño del modelo y de la cuantización elegida.
- GPU recomendadas: no disponible por la misma razón.
- Viabilidad en GPU consumer: no verificable sin conocer el tamaño del modelo; las cuantizaciones Q3_K_M y Q4_K_S están pensadas para reducir huella de memoria, pero no se puede confirmar qué tarjetas las admiten.
- Opciones de despliegue: llama.cpp, Ollama y cualquier motor compatible con GGUF (por ejemplo, llama.cpp server). No consta compatibilidad verificada con vLLM o TGI, que habitualmente requieren pesos en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables en parámetros, contexto, rendimiento o licencia. La única comparación posible es interna al propio repositorio, entre sus distintas cuantizaciones (x-f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, IQ4_XS), sin datos de calidad publicados.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción de arquitectura, entrenamiento, sesgos o limitaciones del modelo base en este repositorio.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo original dgAI202/Converse-1.3 antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede garantizar el comportamiento en castellano ni en ningún otro idioma.
- Riesgo de alucinación: inherente a los modelos de lenguaje, pero no cuantificado aquí por falta de datos.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden perder calidad de forma apreciable frente a Q8_0 o x-f16; no hay evaluaciones publicadas que lo midan.
- Trazabilidad: se trata de una republicación de terceros, no del autor original, por lo que la integridad de los pesos depende del proceso de conversión de mradermacher y no de dgAI202.
- Fecha de creación futura respecto a la fecha habitual de referencia: el repositorio figura creado el 2026-11-13, dato que conviene verificar directamente en Hugging Face.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Converse-1.3-GGUF
- Modelo base: https://huggingface.co/dgAI202/Converse-1.3

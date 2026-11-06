# FatalMistake02/pumpkn-1

## Resumen

pumpkn-1 es un modelo de lenguaje de tipo transformer, entrenado desde cero (*from-scratch*) por el usuario FatalMistake02 y publicado en Hugging Face bajo licencia MIT. Se trata de un experimento temprano de entrenamiento con un tamaño extremadamente reducido: 5.082.368 parámetros totales (aproximadamente 5,08 millones), lo que lo sitúa varios órdenes de magnitud por debajo de los modelos de lenguaje convencionales. Su ventana de contexto es de solo 256 tokens y está diseñado exclusivamente para inglés.

El modelo se distribuye en formato GGUF con cuantización F16 y está etiquetado como experimental. El propio autor lo describe sin ambages como «absolute garbage» y advierte de que se trata de un experimento temprano de entrenamiento en el que deben esperarse respuestas incorrectas y sinsentidos. No resuelve ningún problema práctico de producción; su interés es puramente educativo o de investigación sobre el proceso de entrenamiento de modelos desde cero.

Por su escala y sus características, pumpkn-1 no es relevante como alternativa a ningún modelo de propósito general. Su valor, si acaso, radica en servir como ejemplo mínimo reproducible de un pipeline de entrenamiento completo (tokenización, arquitectura, entrenamiento, conversión a GGUF y publicación) para quienes quieran entender las etapas básicas sin incurrir en costes de cómputo significativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (entrenado desde cero, detalles no disponibles) |
| Parámetros totales | 5.082.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | F16 (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (conversión desde safetensors; pesos originales en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer entrenado desde cero. No se especifican el número de capas, la dimensión del modelo, el número de cabezas de atención, la función de activación ni la estrategia de normalización. El tamaño de 5,08 millones de parámetros y una ventana de contexto de 256 tokens son coherentes con un modelo de juguete o de escala educativa, muy alejado de los transformers de producción.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de ajuste fino supervisado, RLHF o DPO. La model card únicamente remite a un archivo `ATTRIBUTION.md` con los créditos del dataset utilizado, pero el contenido de ese archivo no está disponible en la información proporcionada. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto en inglés, con calidad muy limitada según la propia advertencia del autor.
- Conversación básica (etiqueta `conversational`), aunque sin garantías de coherencia multi-turno.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No dispone de visión, audio ni modo de razonamiento explícito (*thinking mode*).
- Compatible con endpoints de inferencia (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras que acepten el formato estándar de Hugging Face.

## Casos de uso

- Docencia sobre pipelines de entrenamiento: sirve para ilustrar paso a paso cómo se entrena un transformer desde cero, se convierte a GGUF y se publica en Hugging Face, sin necesidad de GPUs de gama alta.
- Pruebas de infraestructura de inferencia: al ser un GGUF F16 de apenas unos megabytes, permite validar configuraciones de llama.cpp, Ollama u otros runners antes de desplegar modelos mayores.
- Experimentos de tokenización: útil para estudiar cómo se comporta un vocabulario y un tokenizador concretos en un modelo de contexto muy corto (256 tokens).
- Reproducibilidad de investigación: como ejemplo mínimo de un experimento *from-scratch* con licencia permisiva, puede servir de base para comparar metodologías de entrenamiento a pequeña escala.
- Test de integraciones de API: su compatibilidad con endpoints permite comprobar el cableado de clientes y SDKs sin coste de cómputo apreciable.
- Generación de texto de relleno en entornos de prueba: para poblar interfaces o *fixtures* de tests donde el contenido semántico es irrelevante y solo se necesita una salida de texto plausible en formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en F16 (5,08 M de parámetros × 2 bytes ≈ 10 MB de pesos, más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU sin problema.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), y runners compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia estará dominada por el overhead del runtime más que por el cómputo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (transformers experimentales *from-scratch* de ~5 M de parámetros) en la documentación proporcionada. Los modelos de referencia de tamaño similar, como TinyLlama o los modelos de la familia Qwen de 0,5B, son entre dos y tres órdenes de magnitud mayores en parámetros y contexto, por lo que la comparación no resultaría significativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pumpkn-1 | 5,08 M | 256 | MIT | Hugging Face (GGUF) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Calidad muy baja: el propio autor califica el modelo como «absolute garbage» y advierte de respuestas incorrectas y sinsentidos.
- Alto riesgo de alucinación y de generación incoherente, incluso en prompts simples.
- Contexto de solo 256 tokens, insuficiente para la mayoría de tareas conversacionales o de documento.
- Solo inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- No apto para producción ni para uso comercial real, pese a que la licencia MIT lo permitiría legalmente.
- No se documentan procesos de alineación (RLHF/DPO) ni evaluación de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FatalMistake02/pumpkn-1
- Créditos del dataset (referenciado en la model card): https://huggingface.co/FatalMistake02/pumpkn-1/blob/main/ATTRIBUTION.md

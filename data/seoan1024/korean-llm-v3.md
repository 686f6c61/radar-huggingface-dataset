# seoan1024/Korean-llm-v3

## Resumen

Korean LLM Advanced v3 es un modelo de lenguaje grande (LLM) de 1.090 millones de parámetros, desarrollado por el usuario `seoan1024` y entrenado íntegramente con datos en coreano. El autor, un estudiante de secundaria, lo construyó desde cero con PyTorch con el objetivo de crear un modelo ligero y eficiente en memoria para su uso local. La versión v3 incorpora optimizaciones de cuantización y gestión de memoria que reducen el uso de VRAM a aproximadamente 9 GB, frente a los 23 GB de la versión anterior.

El modelo está pensado para tareas de generación de texto y chat en coreano, con una ventana de contexto de 2.048 tokens. Su entrenamiento se realizó con los datasets `beomi/KoAlpaca-v1.1a` y `nlpai-lab/kullm-v2`, ambos de instrucciones en coreano. Aunque no se han publicado benchmarks oficiales, su autor afirma que es capaz de mantener conversaciones coherentes en coreano, aunque reconoce limitaciones en la calidad de las respuestas fuera de los datos de entrenamiento.

La relevancia de este modelo radica en su enfoque didáctico y de bajo coste: demuestra que es posible entrenar un LLM desde cero con recursos modestos, aunque su utilidad práctica en producción es limitada por su tamaño y falta de evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante; probablemente decoder-only para generación) |
| Parametros totales | 1.090 millones (1.09B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | INT8 dinámico (según documentación); no se especifican otros formatos |
| Idiomas soportados | Coreano (ko) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch (.pth) – checkpoints en el repositorio |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer, aunque no se detalla si es encoder-decoder o solo decoder. La model card indica que se trata de un LLM para generación de texto, por lo que probablemente sea un decoder-only, pero esta información no está confirmada. La configuración incluye 20 capas, 10 cabezas de atención y un tamaño de capa oculta de 1.920 dimensiones.

El entrenamiento se realizó con dos datasets de instrucciones en coreano: `nlp-ai-lab/kullm-v2` y `beomi/KoAlpaca-v1.1a`, con un total de 44.000 pasos de entrenamiento. Se utilizaron técnicas de optimización de memoria: BF16 (precisión mixta), optimizador AdamW de 8 bits (bitsandbytes), gradiente acumulación (batch efectivo de 16), gradiente checkpointing y cuantización dinámica INT8. Estas técnicas permiten reducir la VRAM de 23 GB (v2) a unos 9 GB (v3). No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional.

## Capacidades

- Generación de texto y chat en coreano, con capacidad de responder a instrucciones básicas.
- Soporte de conversaciones multi-turno (dentro de la ventana de 2.048 tokens).
- Comprensión y generación de texto en coreano, incluyendo gramática y sintaxis básica.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso, visión, audio u otras capacidades especiales.
- Multilingüismo: solo coreano (no hay evidencia de soporte de otros idiomas).

## Casos de uso

- **Asistente de chat local en coreano**: el modelo puede integrarse en aplicaciones de escritorio o web para mantener conversaciones en coreano, gracias a su bajo consumo de VRAM (9 GB) y su tamaño compacto.
- **Generación de texto creativo en coreano**: puede usarse para escribir borradores de correos, publicaciones en blogs o redes sociales en coreano, siempre que se supervisen las salidas.
- **Prototipado de aplicaciones de NLP**: dado su tamaño y facilidad de despliegue, sirve como base para pruebas de concepto de sistemas de procesamiento de lenguaje natural en coreano.
- **Entornos educativos**: su código fuente completo y documentación pueden utilizarse para enseñar cómo se construye un LLM desde cero, incluyendo técnicas de optimización de memoria.
- **Demostraciones de cuantización**: el modelo incluye soporte para cuantización INT8, útil para demostrar cómo reducir el uso de VRAM en entornos con recursos limitados.
- **Evaluación de técnicas de entrenamiento**: al estar disponible el código de entrenamiento, puede servir para experimentar con hiperparámetros y técnicas de optimización en un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otros estándares. El autor no proporciona métricas objetivas de rendimiento.

## Requisitos de hardware

- **VRAM estimada**: alrededor de 9 GB según la documentación (para inferencia con cuantización). En BF16 sin cuantización podría requerir más (el autor indica ~23 GB para la versión v2 sin optimizaciones).
- **GPU recomendadas**: tarjetas con al menos 10 GB de VRAM, como RTX 3080, RTX 4070, A10, o A100 (para mayor margen). En consumer, una RTX 3090 o 4090 sería suficiente.
- **Despliegue**: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El código está diseñado para ejecutarse con PyTorch y el script de entrenamiento/inferencia propio.
- **Latencia y throughput**: no se proporcionan datos.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos coreanos de tamaño similar (como Polyglot-Ko, Llama-2-ko, etc.) en la información proporcionada. No se han publicado tablas comparativas ni se mencionan modelos de referencia. Por tanto, no se puede establecer una comparación objetiva.

## Limitaciones y advertencias

- **Sesgos**: al entrenarse únicamente con dos datasets de instrucciones coreanas, el modelo puede presentar sesgos culturales o limitaciones en temas fuera de ese ámbito.
- **Riesgo de alucinación**: el autor menciona que el modelo puede dar respuestas incorrectas o incoherentes, especialmente cuando se le pregunta sobre temas no cubiertos en el entrenamiento.
- **Ventana de contexto limitada**: 2.048 tokens puede ser insuficiente para tareas que requieran contexto largo.
- **Licencia GPL-3.0**: esta licencia copyleft impone restricciones para su uso en software propietario; si se utiliza en un producto comercial, el código derivado debe publicarse bajo la misma licencia.
- **Idioma**: solo coreano, no hay soporte multilingüe.
- **Calidad de producción**: al ser un modelo de 1B entrenado por un estudiante, no es recomendable para aplicaciones críticas sin una evaluación exhaustiva.
- **Falta de documentación**: no se detallan los hiperparámetros exactos del entrenamiento, la composición exacta del dataset ni la configuración del tokenizador.

## Enlaces

- [Hugging Face: seoan1024/Korean-llm-v3](https://huggingface.co/seoan1024/Korean-llm-v3)
- [Repositorio GitHub: seoan1024/korean-llm-v3](https://github.com/seoan1024/korean-llm-v3)
- [Script de entrenamiento principal](https://github.com/seoan1024/korean-llm-v3/blob/main/korean_llm_advanced_v3.py)

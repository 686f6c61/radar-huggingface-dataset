# mradermacher/zora-v1.12-i1-GGUF

## Resumen

El modelo `mradermacher/zora-v1.12-i1-GGUF` es una cuantización en formato GGUF del modelo base `sovasoft/zora-v1.12`, un modelo de lenguaje multilingüe de 8.190 millones de parámetros (8,19B) orientado a lenguas de los Balcanes y el sureste de Europa. La cuantización ha sido realizada por mradermacher, un conocido proveedor de archivos GGUF optimizados con imatrix, lo que permite ejecutar el modelo en hardware de consumo con una pérdida de calidad controlada.

El modelo base está diseñado para tareas conversacionales y de generación de texto en un conjunto de 12 idiomas: serbio, croata, bosnio, macedonio, esloveno, albanés, montenegrino, búlgaro, griego, turco, rumano y húngaro. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas. La relevancia de esta versión cuantizada radica en que facilita el despliegue local en entornos con recursos limitados, manteniendo un equilibrio entre tamaño, velocidad y calidad.

Al tratarse de un repositorio exclusivamente de cuantizaciones, no se incluyen detalles sobre la arquitectura interna ni el proceso de entrenamiento del modelo original. La información disponible se limita a los metadatos de HuggingFace y a la tabla de archivos GGUF proporcionada por el autor de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_M, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M, Q6_K (todos con imatrix) |
| Idiomas soportados | sr, hr, bs, mk, sl, sq, cnr, bg, el, tr, ro, hu |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base `sovasoft/zora-v1.12` en la documentación de esta cuantización. Dado el tamaño de 8,19B parámetros, es probable que se trate de un transformer decoder-only, pero no se puede confirmar sin acceso a la ficha del modelo original. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La cuantización ha sido realizada con el método imatrix (importance matrix), que mejora la calidad de los quants de baja precisión, como se indica en la tabla de archivos.

## Capacidades

- Generación de texto conversacional en los 12 idiomas listados, según los metadatos del modelo base.
- Soporte multilingüe específico para lenguas balcánicas y del sureste europeo, incluyendo variantes como serbio, croata, bosnio y montenegrino.
- Etiquetado como "conversational" y "honest-ai" en los metadatos, lo que sugiere un enfoque en respuestas útiles y veraces, aunque no se aportan detalles técnicos.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Atención al cliente en lenguas balcánicas: el modelo puede gestionar conversaciones en serbio, croata, búlgaro, etc., en entornos locales sin conexión a internet, gracias a su formato GGUF y su tamaño moderado.
- Traducción automática entre los idiomas soportados: aunque no se especifica si el modelo está entrenado específicamente para traducción, su naturaleza multilingüe permite su uso como base para sistemas de traducción asistida.
- Generación de contenido local en idiomas minoritarios: redacción de textos, resúmenes o respuestas automáticas en lenguas con menos recursos digitales, donde los modelos comerciales suelen tener peor cobertura.
- Asistentes personales embebidos en dispositivos con GPU limitada: al cuantizar a Q4_K_M (5,1 GB), el modelo cabe en GPUs de 8 GB, permitiendo ejecución en equipos de escritorio o portátiles gaming.
- Investigación académica sobre procesamiento del lenguaje en lenguas eslavas meridionales: el modelo puede servir como punto de partida para fine-tuning o evaluación en tareas específicas de estos idiomas.
- Prototipado rápido de chatbots en entornos de desarrollo: gracias a la compatibilidad con llama.cpp y Ollama, se puede integrar en pipelines de prueba sin necesidad de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Tampoco se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M (5,1 GB), se necesitan al menos 6-8 GB de VRAM para ejecución cómoda. Las versiones Q2_K (3,2 GB) pueden funcionar en GPUs de 4 GB, aunque con pérdida de calidad notable.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores para las cuantizaciones más grandes (Q6_K, 6,8 GB). Para las versiones más pequeñas, una GTX 1660 Super (6 GB) podría ser suficiente.
- Compatibilidad con hardware de consumo: sí, las cuantizaciones Q4_K_M y menores caben en GPUs de gama media actuales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. También se puede usar vLLM si se convierte a otro formato, aunque no es el flujo habitual para GGUF.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 8B en Q4_K_M suele generar entre 30 y 60 tokens por segundo, pero esto es una estimación genérica no confirmada para este modelo concreto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. No se conocen modelos específicos con el mismo enfoque multilingüe balcánico y tamaño similar. Se recomienda consultar la ficha del modelo base `sovasoft/zora-v1.12` para posibles comparaciones.

## Limitaciones y advertencias

- Al ser una cuantización, se produce una pérdida de calidad respecto al modelo original en precisión y coherencia, especialmente en las versiones de menor tamaño (IQ2_M, Q2_K).
- No se dispone de información sobre sesgos o alucinaciones del modelo base. Dado su entrenamiento en lenguas con menos recursos, es posible que presente sesgos culturales o errores en contextos específicos.
- La longitud de contexto no está documentada, por lo que no se puede garantizar un rendimiento adecuado en conversaciones muy largas o documentos extensos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (no se han encontrado indicios de ello).
- El repositorio solo contiene archivos GGUF; no se incluyen pesos en safetensors ni el tokenizador original, por lo que para fine-tuning se debe acudir al modelo base.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/zora-v1.12-i1-GGUF
- Modelo base: https://huggingface.co/sovasoft/zora-v1.12
- Cuantización estática (sin imatrix): https://huggingface.co/mradermacher/zora-v1.12-GGUF
- Página de mradermacher en HuggingFace: https://huggingface.co/mradermacher

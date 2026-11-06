# ModernoTech/Nova-Spark

## Resumen

Nova Spark 1.0 es una distribución con marca propia del modelo Qwen/Qwen3.5-0.8B, publicada por Moderno Tech dentro de su familia comercial Nova Edge. No se trata de un entrenamiento nuevo: la propia model card reconoce que los pesos son el artefacto original verificado de Qwen, redistribuido sin modificar arquitectura, tokenizer, prompts ni parámetros de inferencia. El valor que aporta el repositorio es, por tanto, de empaquetado y documentación, no de investigación de modelos.

El modelo base es un transformer denso de aproximadamente 752 millones de parámetros (0,8B nominales), orientado a generación de texto y conversación en inglés y español. Se distribuye en formato GGUF con cuantización Q4_0, con un artefacto de 563.036.064 bytes (unos 537 MiB), pensado para inferencia local en dispositivos con recursos limitados.

Su relevancia práctica es la de un modelo pequeño de bolsillo: permite desplegar un chatbot o un generador de texto en CPU o en GPUs de gama de entrada, con licencia Apache 2.0 que facilita el uso comercial. Conviene tener claro, sin embargo, que cualquier mérito técnico corresponde al modelo Qwen subyacente y que este repositorio no documenta ningún proceso de entrenamiento propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (0,8B nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 (unico artefacto publicado) |
| Idiomas soportados | Ingles y espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Nova-Spark-1.0-Q4_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B: un transformer denso de 752 millones de parámetros. La model card de Moderno Tech no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni estrategia de tokenización, y remite explícitamente a la documentación del repositorio original para los parámetros de ejecución recomendados. Tampoco se documenta la longitud de contexto soportada, un dato que habría que consultar en la ficha del modelo Qwen.

Respecto al entrenamiento, el repositorio no describe ningún proceso propio: no hay datos sobre número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas. La model card afirma que Moderno Tech redistribuye y documenta el artefacto verificado sin cambiar los pesos, y que versiones futuras evolucionarán hacia fine-tuning y destilación propios. El artefacto publicado incluye un SHA-256 (`57d19977...03f8cf`) para verificar la integridad del GGUF, lo que permite comprobar que los pesos coinciden con el original cuantizado.

## Capacidades

- Generación de texto y conversación multi-turno, en línea con el comportamiento del modelo base Qwen.
- Soporte de inglés y español según los metadatos del repositorio; no se detalla el nivel de competencia por idioma.
- Inferencia local en hardware modesto gracias al tamaño de 0,8B y a la cuantización Q4_0.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades de código o matemáticas de forma específica.

## Casos de uso

- Asistente conversacional local en escritorio: el GGUF Q4_0 de unos 537 MiB se puede cargar con llama.cpp u Ollama en un portátil sin GPU dedicada, ofreciendo respuestas de chat sin enviar datos a la nube.
- Clasificación y etiquetado de texto ligero: para tareas de categorización de tickets, reseñas o correos donde no se requiere razonamiento profundo, un modelo de 0,8B reduce coste y latencia frente a alternativas mayores.
- Generación de texto en aplicaciones embebidas o de borde: el tamaño reducido permite integrarlo en dispositivos con poca memoria, como Raspberry Pi o mini-PC, para resúmenes o respuestas plantilla.
- Prototipado rápido de pipelines de NLP: sirve como baseline barato para validar una interfaz de chat o un flujo de generación antes de escalar a modelos mayores.
- Filtrado y preprocesado en pipelines de datos: reescritura, normalización o generación de variaciones de texto en lotes grandes, donde el throughput por vatio importa más que la calidad máxima.
- Demostraciones y entornos educativos: al ser Apache 2.0 y caber en CPU, es adecuado para talleres y pruebas de concepto sobre inferencia de LLM sin infraestructura GPU.
- Chatbot de soporte con alcance limitado: para preguntas frecuentes y respuestas guionizadas en inglés o español, con la advertencia de que su ventana de contexto no está documentada y su precisión será inferior a la de modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1 GB con la cuantización Q4_0 publicada (563 MB de pesos más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso una iGPU moderna son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales al ser un GGUF; también es posible usar otros runners compatibles con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nova Spark 1.0 | 752 M | No disponible | GGUF Q4_0 | Apache 2.0 | Redistribucion de Qwen3.5-0.8B con marca propia |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | Safetensors y otras | Apache 2.0 | Modelo base original; misma arquitectura y pesos |
| Modelos de ~1B de otras familias (p. ej. Llama 3.2 1B, Gemma 2 2B) | 1-2B | Variable segun familia | Multiples | Licencias propias | Alternativas de tamano comparable; no se dispone de datos de rendimiento comparativo en la informacion proporcionada |

La comparación más directa es con el propio Qwen3.5-0.8B: Nova Spark no introduce cambios en pesos ni arquitectura, por lo que su rendimiento será idéntico al del original en igualdad de cuantización. Frente a otras familias de ~1B, la ventaja principal es la licencia Apache 2.0 y la disponibilidad inmediata en GGUF; la desventaja es la ausencia de benchmarks propios y de documentación técnica detallada.

## Limitaciones y advertencias

- Con 752 millones de parámetros, la capacidad de razonamiento, matemáticas y código es limitada en comparación con modelos de 7B o superiores; es previsible una tasa alta de errores en tareas complejas.
- Riesgo de alucinación elevado en un modelo de este tamaño, especialmente en preguntas factuales y contextos largos.
- La longitud de contexto no está documentada en el repositorio; no se debe asumir una ventana amplia sin verificarla en la ficha del modelo Qwen.
- El soporte de español está declarado en los metadatos, pero no se documenta su calidad relativa frente al inglés.
- La model card no describe sesgos conocidos ni evaluaciones de seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la propia model card exige mantener visibles los términos de licencia y la autoría original de Qwen.
- El repositorio no documenta fine-tuning ni entrenamiento propio; no debe presentarse como un modelo entrenado por Moderno Tech.
- El número de descargas y likes es cero en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- `inference: false` aparece en los metadatos de la model card, lo que puede afectar a cómo algunas herramientas tratan el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ModernoTech/Nova-Spark
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.

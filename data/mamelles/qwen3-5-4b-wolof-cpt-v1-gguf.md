# mamelles/Qwen3.5-4B-Wolof-CPT-v1-GGUF

## Resumen

Qwen3.5-4B-Wolof-CPT-v1-GGUF es una exportación en formato GGUF del modelo Tonic/Qwen3.5-4B-Wolof-CPT-v1, un ajuste del modelo base Qwen3.5 de 4B de parámetros orientado al idioma wolof mediante entrenamiento continuado (continued pre-training, CPT). El autor de la exportación es el usuario mamelles, y el modelo está pensado para su uso con llama.cpp y entornos compatibles con GGUF.

El modelo parte de la familia Qwen3.5 (arquitectura transformer densa, 4.860.696.576 parámetros según los pesos en safetensors del modelo base) y añade una fase de preentrenamiento continuado sobre corpus en wolof, una lengua nígero-congolesa hablada principalmente en Senegal, Gambia y Mauritania. La relevancia actual radica en la escasez de modelos abiertos con cobertura razonable de lenguas de bajos recursos como el wolof, y en la disponibilidad de cuantizaciones listas para ejecución local.

El repositorio GGUF ofrece cinco niveles de cuantización (F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0) y un tamaño total de 24,5 GB, lo que permite desplegar el modelo en hardware de consumo según la cuantización elegida. La model card es mínima y no aporta detalles sobre datos de entrenamiento, licencia ni idiomas soportados más allá de las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5) |
| Parametros totales | 4.860.696.576 (4,86 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | No disponible (etiqueta: wolof; el modelo base Qwen3.5 es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | GGUF (librería llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en su variante densa de aproximadamente 4,86 mil millones de parámetros, sin mezcla de expertos. El modelo original Tonic/Qwen3.5-4B-Wolof-CPT-v1 se obtiene mediante preentrenamiento continuado del checkpoint Qwen3.5-4B sobre datos en wolof, una técnica habitual para adaptar modelos multilingües a lenguas de bajos recursos sin recurrir a un ajuste supervisado completo.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus en wolof, la presencia de fases de RLHF o DPO, ni innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). La model card del repositorio GGUF se limita a indicar que se trata de una exportación del modelo base y a listar las cuantizaciones disponibles.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Comprensión y generación en wolof, objetivo principal del preentrenamiento continuado.
- Herencia de las capacidades del modelo base Qwen3.5-4B (razonamiento, código, matemáticas y multilingüismo general), aunque no se documenta su preservación tras el CPT.
- Ejecución local mediante llama.cpp y ecosistema GGUF (llama-cli, llama-server, Ollama y derivados).
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte explícito de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Procesamiento de textos en wolof: traducción, resumen o normalización de documentos y transcripciones en esta lengua, aprovechando el preentrenamiento continuado sobre corpus wolof.
- Asistentes conversacionales para hablantes de wolof: atención en lengua local en servicios públicos o comunitarios, con despliegue local que evita depender de APIs externas.
- Investigación en lenguas de bajos recursos: evaluación del impacto del CPT en un modelo de 4B y generación de datos sintéticos en wolof para futuros ajustes.
- Despliegue en hardware de consumo: con cuantización Q4_K_M el modelo ocupa del orden de 3 GB, lo que permite ejecutarlo en GPUs de gama media o incluso en CPU con llama.cpp para prototipos y demos.
- Educación y preservación lingüística: generación de material didáctico o ejercicios en wolof en entornos con recursos limitados.
- Integración en pipelines de inferencia compatibles con endpoints: servir el modelo mediante llama-server para aplicaciones web o móviles que requieran respuestas en wolof con baja latencia.
- Experimentación con cuantizaciones: comparar la degradación de calidad entre F16, Q8_0, Q5_K_M, Q4_K_M y Q4_0 en una lengua de bajos recursos, un caso de estudio útil para decidir niveles de compresión en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de pesos): F16 en torno a 9,7 GB; Q8_0 en torno a 5,2 GB; Q5_K_M en torno a 3,4 GB; Q4_K_M en torno a 3,0 GB; Q4_0 en torno a 2,8 GB. Estas cifras no están confirmadas por el autor.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090, RTX 3090 o RTX 4080 para Q8_0 y Q5_K_M; RTX 4060 Ti de 16 GB o RTX 3060 de 12 GB para Q5_K_M y Q4_K_M con margen para el contexto.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M y Q4_0 en tarjetas de 6-8 GB o superiores; también es viable en CPU mediante llama.cpp con Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF; para mayor throughput en GPU, servidores basados en llama.cpp con offload parcial o total de capas.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Wolof-CPT-v1-GGUF (este) | 4,86 B | No disponible | No disponible | GGUF | CPT en wolof, 5 cuantizaciones |
| Tonic/Qwen3.5-4B-Wolof-CPT-v1 | 4,86 B | No disponible | No disponible | Safetensors | Modelo base del que deriva esta exportación |
| Qwen3.5-4B (modelo base original) | ~4 B | No disponible | No disponible | Safetensors/GGUF | Multilingüe general, sin especialización en wolof |
| Otros modelos abiertos de ~4 B (p. ej. Llama 3.2 3B) | ~3-4 B | No disponible | No disponible | Safetensors/GGUF | Alternativas generalistas sin cobertura específica de wolof |

No se dispone de datos de rendimiento comparativo para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card no especifica licencia; no se puede confirmar el uso comercial sin consultar al autor del modelo base.
- No hay información sobre la composición del corpus de CPT, por lo que se desconoce el grado de cobertura dialectal del wolof y el posible sesgo hacia determinadas variedades o dominios.
- Riesgo de alucinación inherente a los modelos de 4B, potencialmente mayor en una lengua de bajos recursos por menor volumen de datos de entrenamiento.
- Posible degradación de capacidades generales (código, matemáticas, multilingüismo) tras el preentrenamiento continuado; no documentada.
- Longitud de contexto no confirmada; conviene validarla empíricamente antes de usarla en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El ejemplo de la model card invoca el repositorio `Tonic/Qwen3.5-4B-Wolof-CPT-v1-GGUF`, distinto del ID de este repositorio (`mamelles/...`); verificar la ruta correcta antes de descargar.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin pruebas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-4B-Wolof-CPT-v1-GGUF
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-CPT-v1
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.

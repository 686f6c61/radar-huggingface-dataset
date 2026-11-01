# sopandpatil/MicroDev-R1-1.5B

## Resumen

MicroDev-R1-1.5B es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-1.5B-Instruct en su variante cuantizada a 4 bits, desarrollado por el usuario sopandpatil y publicado en HuggingFace. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) orientado a tareas conversacionales y de generacion de codigo, heredando la arquitectura Qwen2 del modelo base de Alibaba.

El modelo se ha entrenado utilizando las herramientas de Unsloth y la libreria TRL de HuggingFace, lo que segun la model card permite un entrenamiento "2x mas rapido". La relevancia de este modelo es limitada: se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin documentacion tecnica detallada sobre el dataset de entrenamiento, el proceso de ajuste ni evaluaciones de rendimiento. La model card es practicamente un template generado automaticamente por Unsloth.

Por tanto, esta ficha debe interpretarse con cautela: la mayor parte de las especificaciones tecnicas se infieren del modelo base (Qwen2.5-Coder-1.5B-Instruct), no de informacion proporcionada por el autor del fine-tuning. No hay datos publicados sobre que tarea concreta optimiza este ajuste ni que mejoras aporta respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 (aprox. 1,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | El modelo base es bnb-4bit; el repositorio contiene pesos safetensors (tamano 3,1 GB). No se detallan otras cuantizaciones disponibles |
| Idiomas soportados | Ingles (segun el campo `language: en` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atencion causal estandar, mecanismo de atencion con query-key normalization (QK-norm) y sesgo de atencion (attention bias) en las proyecciones QKV, caracteristico de la familia Qwen2. El modelo base Qwen2.5-Coder-1.5B-Instruct fue entrenado por Alibaba con un corpus especifico para generacion de codigo y ajustado con instrucciones.

El ajuste fino realizado por sopandpatil se llevo a cabo con Unsloth y TRL, partiendo directamente de la version cuantizada a 4 bits del modelo base (`unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF, DPO o simplemente SFT, ni el hiperparametro de learning rate o numero de epocas. La model card no documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Generacion de codigo en multiples lenguajes de programacion (heredado de Qwen2.5-Coder).
- Razonamiento basico y respuesta a instrucciones (heredado del modo Instruct del modelo base).
- Soporte de tool calling / function calling: no documentado por el autor; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la model card; el modelo base soporta mas idiomas pero el ajuste declara solo `en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles. No hay modo de razonamiento explicito ni capacidades multimodales.

## Casos de uso

- Prototipado rapido de asistentes de codigo en local: al ser un modelo de 1,5B en safetensors de 3,1 GB, puede cargarse en una GPU de consumo para experimentar con generacion de codigo en entornos de desarrollo sin conexion.
- Generacion de snippets y autocompletado en editores: el modelo puede integrarse en plugins de VS Code o similares para sugerir lineas de codigo, aunque su tamano limita la calidad frente a modelos mayores.
- Fine-tuning adicional sobre dominios especificos: al estar bajo licencia Apache 2.0 y tener un tamano reducido, sirve como punto de partida para ajustes en dominios concretos (por ejemplo, un lenguaje de programacion especifico o una API interna).
- Educacion y demostraciones: util para ensenar conceptos de fine-tuning con Unsloth y TRL en cursos o talleres, dado que el flujo de entrenamiento esta documentado en la model card.
- Generacion de tests unitarios simples: el modelo puede producir casos de prueba basicos para funciones pequenas, aprovechando su entrenamiento en codigo.
- Chat conversacional de bajo coste: para aplicaciones donde el coste por token es critico y la calidad no es el factor principal, un modelo de 1,5B puede desplegarse en CPU o GPU de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion. Tampoco se comparan resultados con el modelo base ni con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 3,1 GB, por lo que se necesitan al menos 4 GB de VRAM en precision FP16/BF16. Con cuantizacion a 4 bits (GGUF Q4) podria reducirse a unos 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) son mas que suficientes. Tambien cabe en GPUs de datacenter como A100 o H100, aunque es sobredimensionado para este modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) puede ejecutarlo.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (tag incluido), llama.cpp u Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repositorio), vLLM (compatible con arquitectura Qwen2).
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1,5B, se espera una latencia baja (decenas de milisegundos por token en GPU moderna) y throughput alto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MicroDev-R1-1.5B | 1,5B | No disponible | Apache 2.0 | HuggingFace (0 descargas) | Fine-tuning sin documentacion tecnica |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace (ampliamente usado) | Modelo base, con benchmarks publicados por Alibaba |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens | DeepSeek License | HuggingFace | Alternativa orientada a codigo, con licencia mas restrictiva |
| StarCoder2-3B | 3B | 16.384 tokens | BigCode OpenRAIL-M | HuggingFace | Mayor tamano, licencia con restricciones de uso |

La comparativa se basa en caracteristicas conocidas de los modelos alternativos; no hay datos de rendimiento del modelo evaluado para comparar empiricamente.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifica dataset, hiperparametros, ni evaluacion. Es imposible saber que mejora aporta respecto al modelo base.
- Riesgo de alucinacion: como todo modelo de 1,5B, la tasa de alucinacion en codigo y texto es elevada; no es adecuado para produccion sin validacion humana.
- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento de Qwen2.5-Coder.
- Limitacion de idioma: la model card declara solo ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el ajuste no confirma esta longitud; usarlo con contextos largos es arriesgado sin validacion.
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tuning de un modelo de Alibaba, conviene revisar los terminos del modelo base (tambien Apache 2.0 en este caso).
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni reportes de terceros.
- El modelo base es una version cuantizada a 4 bits, lo que puede introducir perdida de calidad respecto al modelo original en FP16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sopandpatil/MicroDev-R1-1.5B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Modelo original Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

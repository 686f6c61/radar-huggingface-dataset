# Ironwood-LLM-Team/Firehouse-Cactus-1.12

## Resumen

Firehouse Cactus 1.12 es un modelo de lenguaje publicado por Ironwood-LLM-Team en Hugging Face, con un total de 7.937.953.568 parametros almacenados en pesos safetensors y un repositorio de 15,9 GB. La etiqueta `gemma4` sugiere que se trata de un ajuste o derivado de la familia Gemma 4 de Google, aunque la model card no confirma oficialmente la relacion ni detalla el proceso de entrenamiento. El modelo se distribuye sin pipeline declarado, sin licencia especificada y sin idiomas documentados.

La relevancia de esta ficha es limitada por la escasez de informacion tecnica publicada: no hay datos sobre arquitectura interna, contexto, datos de entrenamiento, benchmarks ni capacidades declaradas. La model card unicamente contiene un aviso operativo sobre la futura retirada de modelos antiguos con el lanzamiento de Firehouse Cactus 2.0 en enero de 2027. Cualquier evaluacion rigurosa requiere consultar directamente los pesos y la configuracion del repositorio.

Con casi 8.000 millones de parametros, el modelo se situa en la categoria de modelos de tamano medio, adecuado para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU consumer con cuantizacion. No obstante, la ausencia de licencia explicita impide recomendar su uso comercial sin verificacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere base Gemma 4) |
| Parametros totales | 7.937.953.568 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card ni en los metadatos de Hugging Face. La etiqueta `gemma4` asociada al repositorio apunta a que el modelo podria estar construido sobre la familia Gemma 4 de Google, lo que implicaria presumiblemente una arquitectura transformer decoder-only, pero este extremo no esta confirmado por el autor. Tampoco se detalla si se trata de un fine-tuning, una destilacion, un merge o un entrenamiento desde cero.

No hay datos disponibles sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas especificas como decodificacion especulativa, atencion lineal o arquitecturas hibridas. El unico contenido textual de la model card es un aviso sobre la futura retirada de modelos Cactus anteriores a la version 1.1 con el lanzamiento de Firehouse Cactus 2.0 en enero de 2027.

## Capacidades

- No se han documentado capacidades especificas en la model card ni en los metadatos del repositorio.
- No hay confirmacion de soporte de tool calling ni function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues ni sobre el rendimiento por idioma.
- No se declara soporte de vision, audio, thinking mode ni otras capacidades especiales.
- La unica capacidad inferible del formato de pesos es la generacion de texto autoregresiva propia de un modelo de lenguaje de ~8B parametros, pero no esta verificada por el autor.

## Casos de uso

Dado que el autor no documenta capacidades ni casos de uso, los siguientes escenarios son propuestas genericas para un modelo de ~8B parametros y deben validarse empiricamente antes de cualquier despliegue en produccion:

- Prototipado de asistentes conversacionales: un modelo de 8B puede ejecutarse en una sola GPU consumer con cuantizacion de 8 o 4 bits, lo que permite iterar rapidamente en entornos de desarrollo sin infraestructura dedicada.
- Generacion de texto en pipelines internos: tareas de resumen, reescritura o clasificacion de documentos donde el coste por token es un factor critico y el modelo se despliega on-premise.
- Fine-tuning especifico de dominio: al tener ~8B parametros y pesos safetensors, es viable aplicar LoRA o QLoRA sobre el modelo para adaptarlo a tareas concretas (atencion al cliente, extraccion de entidades, generacion de informes) con un presupuesto de GPU moderado.
- Experimentacion academica: comparacion de derivados de Gemma 4 frente a la version base para estudiar efectos del ajuste fino, siempre que se verifique la procedencia real de los pesos.
- Evaluacion de calidad y sesgos: servir como sujeto de pruebas en pipelines de red-teaming y evaluacion de alucinaciones en modelos de tamano medio.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse localmente en una RTX 4090 o similar, permite procesar datos sensibles sin salida a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16/BF16 para los ~7,94B parametros; en torno a 8-9 GB en cuantizacion de 8 bits; en torno a 5-6 GB en cuantizacion de 4 bits (estimaciones teoricas basadas en el numero de parametros, no verificadas por el autor).
- GPU recomendadas: A100 40GB, H100 80GB o L40S para FP16 sin cuantizar con margen para contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para FP16 o cuantizacion de 8 bits.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12 GB o mas usando cuantizacion de 4 u 8 bits, siempre que la longitud de contexto no sea excesiva.
- Opciones de despliegue: vLLM, TGI y llama.cpp son compatibles en principio con pesos safetensors de un transformer estandar; Ollama requeriria una conversion previa a GGUF que el autor no proporciona.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Firehouse Cactus 1.12 | 7.937.953.568 | no disponible | no disponible | safetensors | Hugging Face (392 descargas) |
| Gemma 3 8B (Google) | ~8B | 128K | Gemma Terms of Use | safetensors, GGUF | Hugging Face, Vertex AI |
| Llama 3.1 8B (Meta) | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face, multiples proveedores |
| Qwen 2.5 7B (Alibaba) | 7,6B | 128K | Apache 2.0 (mayoria de variantes) | safetensors, GGUF | Hugging Face, multiples proveedores |

La comparacion con Gemma 3 8B se incluye por la etiqueta `gemma4` del repositorio, aunque no se ha confirmado que Firehouse Cactus 1.12 derive de Gemma 4. Los datos de los modelos alternativos corresponden a informacion publica de sus respectivos autores.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre arquitectura, datos de entrenamiento, alineacion ni evaluaciones, lo que impide garantizar el comportamiento del modelo.
- Licencia no especificada: no se puede asumir permiso para uso comercial, redistribucion o modificacion. Es imprescindible contactar con el autor o consultar el repositorio antes de cualquier uso en produccion.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas, y la calidad por idioma no esta evaluada.
- Riesgo de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas, no se puede estimar la tasa de errores factuales.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni el proceso de alineacion, no es posible evaluar sesgos de genero, raza, idioma o dominio.
- Procedencia incierta: la etiqueta `gemma4` no confirma oficialmente la base del modelo; conviene verificar la configuracion (`config.json`) y los pesos antes de asumir compatibilidad con herramientas de la familia Gemma.
- Aviso de retirada: el autor anuncia que los modelos Cactus anteriores a la version 1.1 podrian eliminarse con el lanzamiento de Firehouse Cactus 2.0 en enero de 2027, lo que afecta a la sostenibilidad a largo plazo de despliegues que dependan de este checkpoint.
- Sin pipeline declarado: la ausencia de `pipeline_tag` puede provocar que algunas herramientas de Hugging Face no carguen el modelo automaticamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ironwood-LLM-Team/Firehouse-Cactus-1.12
- Perfil del autor: https://huggingface.co/Ironwood-LLM-Team
- No se han encontrado papers, blogs, repositorios de codigo ni demos asociados al modelo en la informacion disponible.

# posterior-learning/vanilla-sft-qwen3.8-27b

## Resumen

vanilla-sft-qwen3.8-27b es un modelo multimodal de tipo image-text-to-text publicado por posterior-learning el 11 de noviembre de 2026. No se trata de un entrenamiento desde cero, sino de un merge de un adaptador LoRA sobre el modelo base Qwen/Qwen3.8-27B, propiedad de Alibaba Qwen. El adaptador original, richmondsin/vanilla-sft-qwen3.8-27b, se ha fusionado en los pesos del modelo base en precisión bf16, dando como resultado un checkpoint único listo para cargar con transformers.

El modelo resuelve el problema de distribuir un fine-tuning SFT (supervised fine-tuning) sin necesidad de gestionar dos artefactos separados (base + adaptador). Al fusionar el LoRA, se elimina la sobrecarga de aplicar el adaptador en tiempo de inferencia y se simplifica el despliegue en entornos que no soportan LoRA de forma nativa. Es relevante porque demuestra el flujo típico de la comunidad: partir de un modelo grande multimodal, aplicar un SFT ligero con LoRA de rango bajo y publicar el resultado consolidado.

Con 27.781.427.952 parámetros (unos 27,8 mil millones) y un repositorio de 55,6 GB, el modelo hereda la arquitectura, tokenizer, plantilla de chat y configuración del procesador del base Qwen3.8-27B. La información pública disponible es muy limitada: no se detallan licencia, idiomas ni datos de entrenamiento del adaptador, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (heredada de Qwen/Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el base admite las cuantizaciones habituales del ecosistema Qwen, pero no se confirma) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos: se parte del base Qwen/Qwen3.8-27B y se le suma el adaptador LoRA richmondsin/vanilla-sft-qwen3.8-27b. La regla de fusión aplicada es la estándar para LoRA: W ← W + (lora_alpha / r) · B @ A, con r = 16 y lora_alpha = 32, lo que da un factor de escala de 2,0. El cálculo se realiza en fp32 y el resultado se almacena en bf16. Se fusionaron 400 módulos LoRA; el resto de tensores son byte-idénticos al base. Los ficheros no asociados a pesos (config, tokenizer, plantilla de chat, configuración del procesador y de generación) se copian sin cambios del modelo base.

El adaptador proviene de un SFT "vanilla", es decir, un fine-tuning supervisado convencional sin etapas adicionales declaradas de RLHF o DPO. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos multimodales ni si hubo etapas de preferencia. Tampoco se documentan innovaciones técnicas propias: el modelo hereda las del base Qwen3.8-27B, que no se detallan en la model card. El autor incluye un MERGE-REPORT.json con verificaciones: 3 módulos aleatorios dentro del redondeo bf16 de W + s·B@A, 799 tensores byte-idénticos y un total de bytes de tensores igual al del base (55.562.855.904). El sha256 del adaptador original es 09a9ddabdcb3717fe6ed5aeaf49540a91b8ada3c16ede7c63bdf89d6818297aa.

## Capacidades

- Generación de texto conversacional multirround, heredada del base Qwen3.8-27B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que permite tareas de descripción, respuesta a preguntas sobre imágenes y razonamiento visual.
- Razonamiento y matemáticas: capacidades propias del base, no verificadas de forma independiente en este checkpoint.
- Generación de código: presumible en un modelo Qwen de esta familia, pero no documentada en la información disponible.
- Tool calling / function calling: no confirmado en la model card; depende de las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponibles; los idiomas no se declaran.
- Modo thinking explícito, audio u otras modalidades especiales: no disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede mantener diálogos multi-turno combinando texto e imágenes, útil en interfaces de chat donde el usuario adjunta capturas o fotos y espera respuestas contextualizadas.
- Descripción y etiquetado automático de imágenes: integrable en pipelines de catalogación de contenido visual, generando descripciones en lenguaje natural a partir de las imágenes y del contexto textual.
- Respuesta a preguntas sobre documentos escaneados: al aceptar imagen y texto, puede emplearse para extraer información de facturas, formularios o capturas, siempre que se valide la precisión en el dominio concreto.
- Prototipado de asistentes de accesibilidad: descripción de escenas o imágenes para usuarios con discapacidad visual, con la cautela de que no se han publicado evaluaciones específicas de fiabilidad.
- Evaluación de fine-tunings SFT: al ser un merge reproducible de un adaptador LoRA, sirve como referencia para comparar el efecto del SFT frente al base en tareas concretas.
- Base para nuevos ajustes: al estar consolidado en un único checkpoint safetensors, facilita aplicar nuevos LoRA o cuantizaciones sin gestionar el adaptador original por separado.
- Despliegue en entornos con transformers: al conservar config, tokenizer y processor del base, se integra directamente en aplicaciones que ya usan la familia Qwen3.8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se necesitan del orden de 60-70 GB o más según la longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 28-30 GB de pesos, más overhead; cifra orientativa, no confirmada por el autor.
- VRAM estimada en cuantización de 4 bits: en torno a 14-16 GB de pesos, más overhead; requiere generar la cuantización, ya que el repo solo publica safetensors en bf16.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar; configuraciones multi-GPU con tensor parallelism para contexto largo.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB); en 4 bits podría ajustarse en una RTX 4090 o RTX 3090, sujeto a verificación empírica.
- Opciones de despliegue: transformers (soporte declarado), con posibilidad de vLLM, TGI o llama.cpp si se generan las conversiones adecuadas; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| posterior-learning/vanilla-sft-qwen3.8-27b | 27,8 B | no disponible | no disponible | Hugging Face, safetensors bf16 | Merge de LoRA SFT sobre Qwen3.8-27B |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | la del base (no confirmada aquí) | Hugging Face | Modelo original sin el adaptador |
| richmondsin/vanilla-sft-qwen3.8-27b (adaptador) | r=16 LoRA | no disponible | no disponible | Hugging Face | Adaptador original, requiere el base |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría; la comparativa se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; antes de un uso comercial debe verificarse la licencia del base Qwen/Qwen3.8-27B y la del adaptador.
- El merge se realizó en bf16, por lo que las salidas pueden diferir ligeramente de las del base más el adaptador aplicado en tiempo de ejecución.
- No se documentan datos de entrenamiento, composición del dataset ni etapas de alineación; el riesgo de sesgos y alucinaciones no puede evaluarse con la información disponible.
- No se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- No hay benchmarks publicados que permitan validar mejoras o regresiones frente al base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- El tamaño de 55,6 GB en bf16 exige hardware de gama alta o cuantización para su despliegue.
- No se confirman capacidades de tool calling ni de agentes; conviene validarlas empíricamente antes de usarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-qwen3.8-27b
- Adaptador LoRA original: https://huggingface.co/richmondsin/vanilla-sft-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

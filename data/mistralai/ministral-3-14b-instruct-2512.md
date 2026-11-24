# mistralai/Ministral-3-14B-Instruct-2512

## Resumen
Ministral 3 14B Instruct 2512 es el modelo instructivo de mayor tamano de la familia Ministral 3 de Mistral AI, disenado especificamente para despliegue en el borde (edge) y en entornos con restricciones de hardware. Combina un modelo de lenguaje de 13.5B parametros con un codificador de vision de 0.4B, sumando aproximadamente 13.945 millones de parametros totales, y ofrece una ventana de contexto de 256k tokens. Su propuesta de valor es clara: capacidades cercanas a Mistral Small 3.2 24B pero en un paquete que cabe en 24 GB de VRAM en FP8.

El modelo se distribuye en precision FP8 y esta post-entrenado para tareas de instruccion, con soporte nativo de function calling, salida JSON y adherencia a system prompts. Es multilingue (once idiomas declarados oficialmente) y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Esto lo posiciona como una opcion atractiva para despliegues privados, agentes locales y fine-tuning especializado.

La relevancia actual del modelo radica en su equilibrio entre capacidad, contexto largo y requisitos de hardware moderados, en un momento en que la demanda de modelos desplegables en infraestructura propia crece. Existe ademas una variante Reasoning dentro de la misma familia para cargas que requieren cadenas de razonamiento explicitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (13.5B LM + 0.4B vision encoder) |
| Parametros totales | 13.945.031.680 (~13.9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | FP8 (pesos publicados); cuantizaciones adicionales disponibles en la coleccion "additional checkpoints" |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8); otros formatos en checkpoints adicionales |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer con dos componentes diferenciados: un modelo de lenguaje de 13.5B parametros y un codificador de vision de 0.4B, lo que habilita entrada de imagenes ademas de texto. La familia Ministral 3 esta disenada para despliegue en el borde, con enfasis en eficiencia computacional y huella de memoria reducida. El modelo base es Ministral-3-14B-Base-2512, sobre el que se aplico post-entrenamiento para instrucciones.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas especificas de RLHF o DPO. Se menciona una publicacion cientifica asociada (arXiv:2601.08584) que presumiblemente contiene estos detalles, pero no se dispone de su contenido en la informacion proporcionada. La version publicada esta en FP8, lo que reduce el peso en disco y en memoria frente a BF16.

## Capacidades
- Generacion de texto y comprension en once idiomas declarados (incluye espanol).
- Vision: analisis de imagenes y razonamiento sobre contenido visual combinado con texto.
- Function calling nativo y salida en JSON estructurado.
- Capacidades agenticas para flujos multi-paso y uso de herramientas.
- Fuerte adherencia a system prompts, con soporte explicito para definir entorno y herramientas.
- Ventana de contexto de 256k tokens, adecuada para documentos largos y conversaciones extendidas.
- Variante Reasoning disponible en la familia para tareas que requieren cadenas de razonamiento.

## Casos de uso
- Asistentes de chat privados en infraestructura propia: el modelo cabe en una GPU de 24 GB en FP8, lo que permite desplegar un asistente multilingue sin enviar datos a terceros.
- Agentes locales con herramientas: el function calling nativo y la salida JSON permiten construir agentes que invocan APIs internas, con la recomendacion de limitar el numero de herramientas para no sobrecargar al modelo.
- Procesamiento de documentos largos: los 256k tokens de contexto permiten analizar contratos, informes o bases de codigo extensas en una sola pasada.
- Analisis de imagenes en entornos restringidos: el codificador de vision de 0.4B permite incorporar inspeccion visual (capturas, diagramas, documentos escaneados) en despliegues de borde.
- Fine-tuning y especializacion: la licencia Apache 2.0 y el modelo base publico permiten adaptar el modelo a dominios verticales sin restricciones comerciales.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto largo y soporte multilingue para mercados europeos y asiaticos.
- Generacion de codigo asistida en pipelines internos: con temperatura baja (<0.1) y salida JSON, puede integrarse en herramientas de desarrollo con validacion estructural.

## Benchmarks y rendimiento

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |
| Ministral 3 8B | 0.787 | 0.860 | 0.668 | 0.616 |
| Qwen3-VL-8B-Thinking | 0.798 | 0.860 | 0.671 | 0.580 |

Los datos publicados en la model card muestran que Ministral 3 14B supera a Qwen3-14B (Thinking) en las cuatro metricas de razonamiento y codigo reportadas. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: aproximadamente 24 GB en FP8 para el modelo completo; menos si se aplican cuantizaciones adicionales (los checkpoints alternativos estan disponibles en la coleccion oficial).
- GPU recomendadas: A100 40/80 GB, H100, L40S y GPUs consumer de gama alta con 24 GB o mas (RTX 4090, RTX 5090 si dispone de esa memoria).
- Cabe en GPU consumer: si, en modelos con 24 GB de VRAM en FP8; con cuantizaciones mas agresivas podria caber en GPUs de 16 GB, aunque no se especifica en la informacion disponible.
- Opciones de despliegue: la libreria declarada es vLLM; tambien se menciona disponibilidad en SageMaker. No se confirma soporte de llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ministral 3 14B Instruct 2512 | ~13.9B (13.5B LM + 0.4B vision) | 256k | Apache 2.0 | Vision, function calling, FP8, edge-optimized |
| Qwen3-14B (Thinking) | 14B | no disponible en la informacion | no disponible en la informacion | Inferior en AIME25, AIME24, GPQA y LiveCodeBench segun la model card |
| Mistral Small 3.2 24B Instruct | 24B | no disponible en la informacion | no disponible en la informacion | Referencia de rendimiento segun Mistral; mayor tamano |
| Ministral 3 8B Instruct | ~8B | 256k (familia) | Apache 2.0 | Version menor de la misma familia |

## Limitaciones y advertencias
- No se detallan en la informacion proporcionada los sesgos conocidos del modelo; como todo LLM, es susceptible de reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion inherente a los modelos generativos; se recomienda validacion en produccion, especialmente en dominios factuales.
- El rendimiento con vision se degrada con imagenes de relaciones de aspecto muy extremas; Mistral recomienda mantener proporciones cercanas a 1:1.
- Se recomienda temperatura inferior a 0.1 para produccion; temperaturas altas pueden producir salidas menos fiables.
- El exceso de herramientas en el contexto puede degradar el rendimiento agentico; conviene limitar el conjunto al minimo necesario.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el acceso al modelo en Hugging Face esta sujeto a un gate con aceptacion de terminos y politica de privacidad.
- No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre posibles limitaciones por idioma mas alla de la lista declarada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Blog de Mistral: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- Coleccion de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Variante Reasoning 14B: https://huggingface.co/mistralai/Ministral-3-14B-Reasoning-2512
- Mistral Small 3.2 24B (referencia comparativa): https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Cliente Python oficial: https://pypi.org/project/mistralai/
- Politica de privacidad de Mistral: https://mistral.ai/terms/

# Rin247/Qwen3-8B-Uncensored-Aquarion-FP8

## Resumen

Rin247/Qwen3-8B-Uncensored-Aquarion-FP8 es una variante cuantizada del modelo Qwen3-8B de Alibaba, publicada por el usuario Rin247 en Hugging Face. El modelo ha sido sometido a un proceso de "abliteración" (eliminación de la dirección de rechazo mediante proyección ortogonal) y posteriormente cuantizado a precisión FP8 weight-only, dando lugar a un archivo de pesos de aproximadamente 9,4 GB. El objetivo declarado es ofrecer un modelo sin censura que mantenga las capacidades del Qwen3-8B original, reduciendo el consumo de memoria para su despliegue en hardware con recursos limitados.

La relevancia de esta ficha radica en que representa una tendencia creciente en la comunidad open source: la creación de modelos "uncensored" (sin filtros de rechazo) a partir de modelos base de alto rendimiento, combinada con técnicas de cuantización para facilitar su ejecución local. Sin embargo, la información pública disponible es escasa: no se especifican licencia, idiomas, ni resultados de benchmarks, lo que limita su uso en entornos productivos sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta 128K, pero no se confirma en esta variante) |
| Tipos de cuantizacion | FP8 weight-only (RTN, escalas almacenadas junto a los pesos) |
| Idiomas soportados | no disponible (el base Qwen3-8B es multilingue, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantizacion FP8 weight-only (incluye buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3-8B original, no un entrenamiento desde cero. Segun la model card, se aplico primero una tecnica de abliteracion mediante proyeccion ortogonal de la direccion de rechazo (parte del "Genesis of Aquarion" forge), lo que elimina la tendencia del modelo a negarse a responder ciertas solicitudes. Posteriormente, los pesos se cuantizaron a FP8 usando PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos en archivos safetensors. No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, ni procesos de RLHF/DPO adicionales. La cuantizacion es weight-only, es decir, solo los pesos se almacenan en FP8; las activaciones permanecen en precision mayor.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3-8B base, incluyendo razonamiento multi-paso, comprension lectora y generacion de texto coherente.
- Codigo y matematicas: el Qwen3-8B destaca en tareas de programacion y calculo; esta variante deberia mantener esas habilidades, aunque no hay verificacion independiente.
- Tool calling y function calling: soportado por el modelo base, aunque no se confirma en esta cuantizacion.
- Capacidades multilingues: el Qwen3-8B soporta mas de 100 idiomas, pero no se especifica si esta variante los conserva.
- Sin rechazo (uncensored): al eliminar la direccion de rechazo, el modelo responde a solicitudes que el base normalmente bloquearia (contenido explicito, violencia, etc.).
- Ausencia de modo thinking: el Qwen3-8B incluye un modo de pensamiento hibrido; no se indica si se conserva en esta version.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, dialogos y guiones con contenido adulto o temas tabu sin rechazos, util para autores que necesitan explorar tramas complejas.
- Desarrollo de chatbots de rol: en entornos de roleplay o simulacion de personajes, donde se requiere respuestas naturales sin filtros de contenido.
- Investigacion de seguridad en IA: analisis de comportamientos de rechazo y alucinacion en modelos abliterados, comparando con el base para estudiar el impacto de la eliminacion de la direccion de rechazo.
- Prototipado de aplicaciones locales: al ser FP8, puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM, permitiendo pruebas rapidas de generacion de texto sin depender de APIs.
- Generacion de contenido de ficcion para juegos de rol de mesa: el modelo puede crear historias, aventuras y NPCs con libertad creativa total.
- Pruebas de robustez y evaluacion de sesgos: investigadores pueden usar el modelo para estudiar como la abliteracion afecta a la alucinacion y a los sesgos del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para esta variante FP8 abliterada. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 de 8.190 millones de parametros ocupan aproximadamente 8,2 GB (1 byte por parametro). Con overhead de inferencia (KV cache, activaciones, buffers), se estiman entre 10 y 12 GB de VRAM para carga completa.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 4070, RTX 4080, RTX 4090, A100 o H100. En GPUs de 8 GB podria cargarse con cuantizacion adicional (por ejemplo, GGUF de 4 bits), pero no se proporciona ese formato.
- Opciones de despliegue: no especificadas por el autor. El formato safetensors con escalas FP8 requiere un motor que soporte esta cuantizacion weight-only; vLLM o llama.cpp podrian funcionar si implementan FP8, pero no se garantiza compatibilidad sin dequantizacion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Abliterado | Licencia |
|---|---|---|---|---|---|
| Rin247/Qwen3-8B-Uncensored-Aquarion-FP8 | 8B | no disponible | FP8 | si | no disponible |
| huihui-ai/Qwen3-8B-abliterated | 8B | no disponible | no especificada | si | no disponible |
| DavidAU/Qwen3-8B-64k-Context-2X-Josiefied-Uncensored | 8B | 64K (segun nombre) | no especificada | si | no disponible |

Ambas alternativas son tambien versiones abliteradas de Qwen3-8B, pero no se dispone de especificaciones detalladas en la informacion proporcionada. La comparativa se limita a lo inferible de los nombres y etiquetas.

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo que terminos puede usarse el modelo; el uso comercial es incierto y requiere contacto con el autor.
- Formato de pesos propietario: la cuantizacion FP8 weight-only con escalas y shapes separadas no es estandar; puede requerir herramientas especificas para dequantizar antes de usar motores de inferencia convencionales.
- Riesgo de alucinacion: al eliminar la direccion de rechazo, el modelo puede generar contenido falso o inventado con mayor confianza, especialmente en temas delicados.
- Sesgos del modelo base: Qwen3-8B hereda sesgos de su entrenamiento; la abliteracion no los corrige y puede amplificarlos en ciertos dominios.
- Sin verificacion de capacidades: no hay benchmarks que confirmen que el modelo mantiene el rendimiento del Qwen3-8B original tras la cuantizacion y abliteracion.
- Contexto no confirmado: aunque el base soporta 128K tokens, esta variante no documenta la longitud de contexto efectiva en FP8.
- Adecuado solo para investigacion o prototipado: sin licencia clara ni validacion, no se recomienda su uso en aplicaciones criticas o comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rin247/Qwen3-8B-Uncensored-Aquarion-FP8
- Alternativa abliterada de huihui-ai: https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Alternativa abliterada con contexto extendido de DavidAU: https://huggingface.co/DavidAU/Qwen3-8B-64k-Context-2X-Josiefied-Uncensored
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3

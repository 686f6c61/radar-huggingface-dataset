# ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-1e-compile

## Resumen
Qwen3.5-9B-tem200-Medical-SFT-1e-compile es un ajuste fino (SFT) del modelo ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200, publicado por el usuario ConnorYU en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura qwen3_5, con 9.409.813.744 parametros totales (aproximadamente 9,4 mil millones) y pesos en formato safetensors. El sufijo del nombre sugiere un entrenamiento orientado a dominio medico ("Medical-SFT") con una temperatura de muestreo de 200 y una epoca de entrenamiento, aunque la model card no documenta estos detalles de forma explicita.

El modelo deriva de una cadena de ajustes sucesivos: primero un entrenamiento con GRPO (Group Relative Policy Optimization) sobre tareas de seguimiento de instrucciones (ifeval) con modo "think", y despues un SFT adicional. Esta cadena de post-entrenamiento sugiere un interes en reforzar tanto el razonamiento como la adherencia a instrucciones, aunque no se han publicado evaluaciones que confirmen estos extremos. El repositorio tiene un tamano de 18,8 GB y registra cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto de investigacion personal sin adopcion publica.

La relevancia del modelo es limitada por su escasa documentacion: la model card es una plantilla generica de Unsloth sin datos sobre dataset, hiperparametros, benchmarks ni limitaciones. Resulta util como referencia para quienes siguen las cadenas de post-entrenamiento sobre la familia Qwen3.5, pero no como modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura base es qwen3_5, una familia de transformers multimodales de Qwen orientada a tareas image-text-to-text. El modelo conserva la torre de vision y el decodificador de lenguaje del modelo base, con 9,4 mil millones de parametros. No se dispone de informacion sobre la dimension oculta, numero de capas, cabezas de atencion ni mecanismos de atencion especificos (linear attention, decodificacion especulativa, etc.), ya que la model card no los detalla.

El entrenamiento se realizo en dos etapas documentadas por la cadena de modelos base: primero un ajuste con GRPO (refuerzo con recompensa verificable) sobre tareas de seguimiento de instrucciones con modo "think" (ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200), y despues un SFT adicional etiquetado como "Medical-SFT". El entrenamiento se ejecuto con Unsloth y la libreria TRL de Hugging Face, segun la propia model card, lo que sugiere uso de LoRA/QLoRA o tecnicas de entrenamiento eficiente en memoria. No se especifican el numero de tokens de entrenamiento, la composicion del dataset medico, ni si hubo DPO o RLHF adicional en esta etapa.

## Capacidades
- Generacion de texto conversacional en ingles, con etiqueta "conversational" en los metadatos.
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text), heredado del modelo base multimodal.
- Modo "think" (razonamiento explicito) presumiblemente conservado de la etapa GRPO-ifeval, aunque no confirmado en la model card.
- Seguimiento de instrucciones reforzado por la etapa GRPO-ifeval previa.
- Ajuste especifico a dominio medico mediante SFT, segun el nombre del modelo (no documentado en la model card).
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: solo ingles declarado.
- Capacidades de audio: no disponible.

## Casos de uso
- Asistente de consulta medica en ingles: el modelo, ajustado con SFT sobre dominio medico, puede responder preguntas clinicas de caracter informativo; requiere validacion por profesionales antes de cualquier uso real.
- Triaje de imagenes medicas con texto asociado: al ser image-text-to-text, puede recibir una imagen (por ejemplo, una radiografia o una captura de informe) junto a una pregunta en lenguaje natural y generar una descripcion o respuesta textual.
- Generacion de resumenes de informes clinicos: el modelo puede condensar texto medico en ingles en resumenes estructurados, aprovechando el ajuste SFT y el modo "think" para razonamiento paso a paso.
- Investigacion sobre post-entrenamiento: sirve como punto de partida para estudiar el efecto combinado de GRPO seguido de SFT en modelos de ~9B, comparando con el modelo base GRPO-ifeval.
- Evaluacion de adherencia a instrucciones en dominio especializado: util para experimentos que midan si el SFT medico degrada o preserva la capacidad de ifeval del modelo base.
- Prototipos de chatbots especializados: despliegue en entornos de laboratorio con vLLM o TGI para probar conversaciones multi-turno en ingles sobre temas medicos, sin exposicion a usuarios finales.
- Base para nuevos ajustes: al estar bajo licencia apache-2.0, puede reutilizarse como inicializacion para SFT o DPO adicionales en otros dominios.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 10-11 GB; con 4 bits: aproximadamente 5-6 GB (estimaciones teoricas a partir del numero de parametros, no verificadas para este modelo).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para precision completa; RTX 4090 (24 GB) suficiente para fp16 ajustado o 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con fp16 o 8 bits; en GPUs de 12-16 GB probablemente solo con cuantizacion de 4 bits, sujeto a validacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM (compatible con arquitecturas transformer multimodales, no verificado), llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-1e-compile | 9,41B | no disponible | image-text-to-text | apache-2.0 | Hugging Face, 0 descargas |
| ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200 (base) | ~9,4B (presumible) | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3.5-9B (modelo original de Qwen) | ~9B (presumible) | no disponible | multimodal (presumible) | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias
- Model card practicamente vacia: no documenta dataset, hiperparametros, evaluaciones ni limitaciones; cualquier uso en produccion exige validacion propia.
- Cero descargas y cero likes: sin evidencia de uso o revision por parte de la comunidad.
- Solo ingles declarado; no hay soporte multilingue confirmado.
- Riesgo de alucinacion elevado en dominio medico, agravado por la falta de evaluacion clinica; no debe usarse como sustituto de criterio medico.
- Sesgos desconocidos: no se documenta composicion del dataset de SFT ni posibles sesgos demograficos o clinicos.
- Longitud de contexto no disponible; planificar despliegues con ventanas conservadoras hasta medirla.
- Licencia apache-2.0 permite uso comercial, pero la cadena de modelos base y los posibles datos de entrenamiento medico pueden imponer restricciones adicionales no declaradas.
- El sufijo "tem200" y "1e-compile" sugiere parametros de entrenamiento experimentales (temperatura 200, una epoca, posible compilacion), sin documentacion que aclare su efecto en la calidad final.
- No se confirma soporte de tool calling ni de agentes; no asumirlo en pipelines automatizados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-tem200-Medical-SFT-1e-compile
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-GRPO-ifeval-v0-think-step200
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl

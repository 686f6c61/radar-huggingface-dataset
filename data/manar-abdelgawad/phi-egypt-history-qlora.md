# Manar-Abdelgawad/phi-egypt-history-qlora

## Resumen
phi-egypt-qlora es un adaptador LoRA (QLoRA) publicado por Manar-Abdelgawad que se aplica sobre el modelo base microsoft/Phi-3.5-mini-instruct. El adaptador se ha entrenado mediante Llama Factory sobre un conjunto de datos denominado egypt_history, con el objetivo declarado de especializar al modelo base en contenido histórico de Egipto. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que su uso requiere descargar e instanciar Phi-3.5-mini-instruct y cargar el adaptador con PEFT.

El modelo base Phi-3.5-mini-instruct es un transformer decoder-only de aproximadamente 3.800 millones de parámetros, con una longitud de contexto nativa de 128.000 tokens, desarrollado por Microsoft. El adaptador hereda esas características arquitectónicas y de contexto, y añade un ajuste fino de bajo rango orientado a un dominio concreto. La licencia del adaptador figura como "other", mientras que el modelo base se distribuye bajo licencia MIT.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin métricas de evaluación publicadas y con una model card generada automáticamente que deja la mayoría de secciones como "More information needed". Resulta útil como ejemplo de flujo QLoRA con Llama Factory sobre Phi-3.5-mini, pero no debe considerarse un artefacto listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Phi-3.5-mini-instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB en el repositorio; el modelo base ronda los 3.800 millones de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion a 8 y 4 bits) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se entrena sobre Phi-3.5-mini-instruct, un transformer decoder-only con atención multi-cabeza estándar y RoPE, sin mezcla de expertos. El ajuste se realiza con PEFT 0.18.1 y Llama Factory, en modalidad QLoRA según el nombre del repositorio, lo que implica que el modelo base se carga cuantizado durante el entrenamiento y solo se actualizan las matrices de bajo rango insertadas en las capas. La model card no detalla el rango, el alpha ni las capas objetivo del adaptador.

Los hiperparámetros declarados son: learning rate 1e-4, batch size de entrenamiento 1, batch size de evaluación 8, acumulación de gradientes 8 (batch efectivo de 8), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10 %, semilla 42 y 3 épocas. El conjunto de datos es egypt_history, del que no se publica tamaño, composición ni proceso de filtrado. No se documenta RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades
- Generación de texto conversacional en formato instruct, heredada de Phi-3.5-mini-instruct.
- Especialización declarada en contenido histórico de Egipto, aunque sin evaluación que lo respalde.
- Razonamiento y matemáticas básicas propias del modelo base de 3.800 millones de parámetros.
- Generación de código y soporte de tool calling heredados del modelo base.
- Capacidad multilingüe del modelo base (inglés, chino y otros idiomas), sin confirmación de que el ajuste preserve el árabe o el español.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso
- Prototipado de asistentes divulgativos sobre historia de Egipto: el adaptador puede cargarse sobre Phi-3.5-mini-instruct para responder preguntas de temática histórica, siempre que se valide la calidad de las respuestas con una batería propia.
- Experimentación académica con QLoRA: sirve como referencia de un pipeline Llama Factory completo (hiperparámetros, PEFT, safetensors) para replicar el flujo en otros dominios.
- Base para ajustes incrementales: al ser un adaptador de bajo rango, puede combinarse o continuar entrenándose con datos adicionales sin reentrenar el modelo completo.
- Generación de material didáctico borrador: útil para producir primeros borradores de textos sobre historia egipcia que un humano revise y corrija después.
- Evaluación comparativa de adaptadores de dominio: permite medir el efecto de un ajuste de 3 épocas sobre un modelo de 3.800 millones de parámetros en tareas de conocimiento factual.
- Despliegue en entornos con recursos limitados: al requerir solo el adaptador y el modelo base cuantizado, puede ejecutarse en una GPU de consumo para pruebas internas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El bloque model-index del repositorio declara el nombre phi-egypt-qlora con una lista de resultados vacía.

## Requisitos de hardware
- VRAM estimada para inferencia con el modelo base en FP16: en torno a 7,6 GB solo para pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización a 4 bits: aproximadamente 2,5-3 GB para pesos, lo que permite ejecución en GPUs de consumo.
- GPU recomendadas: A100 o H100 para despliegue con contexto largo y concurrencia; RTX 4090 o RTX 3090 para FP16 en una sola tarjeta; RTX 3060 de 12 GB o superior para cuantización a 4 bits.
- Cabe en GPU de consumo: sí, con cuantización a 4 u 8 bits y contextos moderados; el contexto de 128.000 tokens del modelo base dispara el uso de memoria de la caché KV.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI para servir el modelo base fusionado, llama.cpp y Ollama tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| phi-egypt-qlora (este adaptador) | Adaptador sobre 3.800 M | 128.000 (heredado) | other | Hugging Face, 0 descargas |
| microsoft/Phi-3.5-mini-instruct | 3.800 M | 128.000 | MIT | Hugging Face, ampliamente usado |
| Adaptadores QLoRA de dominio publicos | Variable | Heredado del base | Variable | Hugging Face, calidad heterogenea |
| Modelos instruct de ~3-4 B (por ejemplo, variantes de Llama 3.2) | 3.000-4.000 M | 128.000 | Licencias comunitarias | Hugging Face |

La comparación se limita a parámetros, contexto y licencia porque no hay métricas de rendimiento publicadas para el adaptador ni datos suficientes para contrastar su calidad frente a alternativas.

## Limitaciones y advertencias
- No hay evaluación publicada: ni benchmarks, ni conjunto de validación descrito, ni métricas de pérdida en la model card.
- La model card está generada automáticamente y deja sin responder las secciones de descripción, usos previstos, datos de entrenamiento y resultados.
- El conjunto egypt_history no está documentado: se desconoce su tamaño, procedencia, licencia y posibles sesgos.
- Riesgo de alucinación factual en contenido histórico, agravado por la falta de verificación contra fuentes.
- El ajuste puede degradar capacidades generales del modelo base (olvido catastrófico), especialmente en idiomas distintos del usado en el entrenamiento.
- La licencia "other" obliga a revisar los términos del autor antes de cualquier uso comercial; además, el modelo base se rige por su propia licencia MIT.
- El repositorio contiene solo el adaptador: no es un modelo autónomo y requiere descargar Phi-3.5-mini-instruct por separado.
- Cero descargas y cero likes indican ausencia de validación por parte de la comunidad.

## Enlaces
- Repositorio del adaptador: https://huggingface.co/Manar-Abdelgawad/phi-egypt-history-qlora
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- Llama Factory: https://github.com/hiyouga/LLaMA-Factory
- PEFT: https://github.com/huggingface/peft

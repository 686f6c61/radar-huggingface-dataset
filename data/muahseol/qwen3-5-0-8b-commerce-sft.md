# muahseol/qwen3.5-0.8b-commerce-sft

## Resumen

Qwen3.5-0.8B Commerce SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario muahseol. El modelo está especializado en atención al cliente de comercio electrónico en coreano: se ha entrenado con pares de pregunta y respuesta de consultas de compra en línea, con un prompt de sistema que le indica responder de forma concisa y en registro formal, citando artículos de la ley de comercio electrónico surcoreana. Su propósito declarado es didáctico: sirve como modelo de referencia (reference model) para un ejercicio de alineación por DPO.

Se trata de un modelo denso de 752.393.024 parámetros (aproximadamente 0,75 mil millones), derivado de la familia Qwen3.5, con licencia Apache 2.0. El repositorio ocupa 3,0 GB porque los pesos se guardan en float32, lo que facilita su uso en entornos de práctica con `transformers`. No hay información pública sobre la longitud de contexto, el volumen de datos de entrenamiento ni los hiperparámetros empleados.

Su relevancia es limitada fuera del ámbito del ejercicio: no se han publicado benchmarks, no tiene descargas ni valoraciones, y el propio autor advierte que puede generar artículos legales incorrectos y contenido inventado. Es útil como ejemplo de flujo SFT → DPO sobre un modelo pequeño y como base para experimentos de ajuste en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tipo `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan; los pesos se publican en float32. Al ser un modelo de transformers, es compatible con cuantizaciones estándar (por ejemplo, 8 y 4 bits) mediante herramientas habituales, aunque el autor no las valida |
| Idiomas soportados | Coreano (`ko`) según la model card; el modelo base Qwen3.5 es multilingüe, pero el ajuste se ha realizado únicamente en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del checkpoint Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. No se dispone de información sobre el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema de positional encoding del modelo base en la documentación proporcionada.

El entrenamiento consistió en SFT sobre un conjunto de preguntas y respuestas de atención al cliente de compras en línea, con un prompt de sistema fijo que instruye al modelo a responder en coreano formal y a fundamentar las respuestas en artículos de la ley de comercio electrónico. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF o DPO (el DPO es precisamente el paso posterior para el que se preparó este modelo) ni innovaciones técnicas adicionales. Los pesos resultantes se almacenan en float32.

## Capacidades

- Generación de texto conversacional en coreano orientada a consultas de comercio electrónico.
- Respuesta con formato formal (존댓말) siguiendo el prompt de sistema del autor.
- Citación de artículos de la ley de comercio electrónico surcoreana como base de las respuestas, con riesgo explícito de error en la cita.
- Conversación de un solo turno o multiturno básica, limitada por el contexto del modelo base (no documentado).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.
- Capacidad multilingüe no garantizada: el ajuste se limita al coreano y puede degradar el rendimiento del modelo base en otros idiomas.

## Casos de uso

- Práctica de alineación DPO: el modelo se usa como referencia inicial en un ejercicio de preferencias, comparando sus respuestas con las de un modelo alineado para medir la mejora.
- Prototipado de chatbots de atención al cliente en coreano: permite iterar sobre el prompt de sistema y el formato de respuesta antes de invertir en un modelo mayor.
- Evaluación de calidad de datos SFT: sirve para comprobar cómo un dataset pequeño de consultas de compra moldea el estilo y el contenido de las respuestas de un modelo de 0,75 mil millones de parámetros.
- Docencia y talleres: su tamaño reducido y sus pesos en float32 permiten ejecutarlo y modificarlo en portátiles con GPU de consumo, lo que facilita demostraciones en clase.
- Generación de respuestas de referencia para anotación: produce borradores que un humano puede corregir para construir datasets de preferencias.
- Experimentos de ajuste en coreano: base para probar recetas de fine-tuning, tasas de aprendizaje o mezclas de datos en un dominio vertical concreto.
- Pruebas de regresión de pipelines de `transformers`: al ser un checkpoint pequeño con arquitectura `qwen3_5_text`, resulta útil para validar integraciones de carga y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 3,0 GB solo para los pesos (752 millones de parámetros × 4 bytes), más el espacio para el contexto y las activaciones; en la práctica, entre 4 y 6 GB según la longitud de secuencia.
- VRAM estimada en bfloat16: alrededor de 1,5 GB para los pesos; en cuantización de 8 bits, unos 0,8 GB; en 4 bits, unos 0,4 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para float32 (RTX 3060, RTX 4060, RTX 4090); para bfloat16 basta con 3-4 GB (GTX 1660 Super en adelante con soporte de precisión media, o GPUs de datacenter como A100 y H100 si se busca throughput).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en float32 y con 3-4 GB en bfloat16.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., dtype=torch.float32)` según indica el autor; al ser un checkpoint estándar de `transformers`, también puede servirse con vLLM o TGI, y convertirse a GGUF para llama.cpp u Ollama, aunque estas rutas no están documentadas ni validadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| muahseol/qwen3.5-0.8b-commerce-sft | 752 M | No disponible | Apache 2.0 | SFT en coreano para atención al cliente | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible en la informacion | Apache 2.0 (según el modelo base referenciado) | Modelo generalista multilingüe | HuggingFace |
| Modelos pequeños de atención al cliente en coreano | No disponible | No disponible | No disponible | Ajustes verticales similares | No disponible |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este ajuste y no se dispone de datos de rendimiento de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que las respuestas pueden contener artículos legales incorrectos y contenido inventado; no debe usarse en atención al cliente real.
- Riesgo elevado de alucinación en citas normativas: el modelo puede atribuir contenido falso a artículos de la ley de comercio electrónico.
- El ajuste se ha realizado únicamente en coreano; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- No se documentan sesgos específicos, pero al derivarse de un modelo generalista y entrenarse con un dataset de dominio concreto, puede reproducir sesgos del corpus de consultas de compra.
- La longitud de contexto no está documentada, lo que dificulta planificar conversaciones largas o documentos extensos.
- Los pesos en float32 triplican el tamaño respecto a bfloat16, lo que incrementa los requisitos de almacenamiento y VRAM.
- No hay benchmarks, descargas ni validación de la comunidad; la calidad del ajuste no está contrastada de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explícitamente el uso en producción por la fiabilidad del contenido legal.
- El modelo está pensado como referencia para DPO; no se ha sometido a alineación por preferencias, por lo que su estilo y seguridad no están optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muahseol/qwen3.5-0.8b-commerce-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

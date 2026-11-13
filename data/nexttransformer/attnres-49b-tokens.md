# NextTransformer/AttnRes-49B-Tokens

## Resumen

NextTransformer AttnRes es un checkpoint de investigación publicado por NextTransformer (organización Interactive-Active-AI) que forma parte de un estudio comparativo de arquitecturas denominado NextTransformer. El modelo tiene 1.355.882.760 parámetros y una ventana de contexto de 2.048 tokens, y fue preentrenado sobre el dataset ClimbMix durante 46.875 pasos de actualización, lo que suma aproximadamente 49.152 millones de tokens de entrenamiento (de ahí el sufijo "49B-Tokens" del repositorio, que hace referencia a tokens de entrenamiento y no al número de parámetros).

La innovación principal es la variante arquitectónica AttnRes: cada subcapa lee una mezcla softmax aprendida sobre la profundidad en lugar de una única suma acumulada (residual estándar). Es decir, sustituye la conexión residual clásica por una atención sobre las representaciones de capas anteriores, lo que permite al modelo ponderar dinámicamente qué profundidades son más informativas para cada token.

Es relevante ahora porque se publica como evidencia empírica reproducible dentro de un benchmark de arquitecturas a escala controlada (mismos tokens, mismo dataset), con métricas de validación publicadas (BPB 0,6630 y CORE-22 de 34,00) y pesos en safetensors bajo una implementación propia. No es un modelo listo para producción: es una pieza de investigación comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con variante AttnRes (mezcla softmax aprendida sobre profundidad en cada subcapa, en lugar de suma residual estándar) |
| Parametros totales | 1.355.882.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), tokenizer en formato tiktoken.json |
| Tokenizador | tiktoken (BPE con `pat_str` y `mergeable_ranks` propios) |
| Dataset de entrenamiento | ClimbMix |
| Tokens de entrenamiento | ~49.152 millones (46.875 actualizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer causal (causal-lm) preentrenado, con una modificación estructural en el mecanismo residual: en lugar de que cada subcapa sume su salida a un estado acumulado, AttnRes calcula una mezcla softmax aprendida sobre las representaciones de las capas anteriores. Esto convierte la profundidad de la red en una dimensión sobre la que se aplica atención, permitiendo que cada token seleccione qué niveles de representación resultan más útiles.

El entrenamiento se realizó sobre ClimbMix durante 46.875 pasos de actualización, totalizando aproximadamente 49.152 millones de tokens (el "49B" del nombre). No se especifica en la información disponible si hubo fases de RLHF, DPO, SFT u otras etapas de alineación; por los tags (`pretrained`) y la naturaleza del estudio comparativo, se trata de un modelo base sin alineación. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base preentrenado: no incluye instrucciones, chat template ni alineación.
- Razonamiento y conocimiento medido mediante CORE-22 (resultado 34,00 sobre 100).
- Modelado de lenguaje medido mediante bits por byte (BPB de validación 0,6630).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación comparativa de arquitecturas: replicar el benchmark NextTransformer cargando este checkpoint y comparando BPB y CORE-22 frente a las demás variantes del estudio, con las mismas condiciones de entrenamiento (ClimbMix, 46.875 pasos).
- Estudio de mecanismos residuales alternativos: analizar cómo la mezcla softmax sobre profundidad distribuye el peso entre capas por token, inspeccionando los parámetros aprendidos de AttnRes frente a un residual estándar.
- Experimentos de interpretabilidad: extraer representaciones intermedias y medir la contribución de cada profundidad a la predicción del siguiente token, aprovechando que el modelo expone la mezcla de forma explícita.
- Fine-tuning académico a pequeña escala: con 1,36 mil millones de parámetros y pesos en safetensors, sirve como base para estudiar el efecto de AttnRes tras un ajuste supervisado en dominios concretos.
- Evaluación de tokenizadores: el checkpoint incluye un tokenizador tiktoken propio con `pat_str` y `mergeable_ranks` publicados, útil para comparar tokenización frente a otros esquemas BPE.
- Reproducción de resultados: el run record y el JSON de arquitectura están enlazados en el repositorio, lo que permite reproducir el entrenamiento y verificar las métricas publicadas.
- Docencia y divulgación: ejemplo didáctico de cómo una modificación en las conexiones residuales afecta a métricas de validación a escala de ~1,4B parámetros.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Resultado |
|---|---:|
| BPB de validación | 0,6630 |
| CORE-22 (×100) | 34,00 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos. El estudio NextTransformer es comparativo entre variantes arquitectónicas, pero los resultados de las otras variantes no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,7 GB solo para pesos (1,36B parámetros × 2 bytes), más overhead de activaciones y KV cache para 2.048 tokens.
- VRAM estimada en FP32: aproximadamente 5,4 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en FP16 cubre pesos y activaciones para contexto de 2.048; una RTX 3060 de 12 GB o superior es holgada. Para entrenamiento o fine-tuning, se recomienda A100 o H100 por memoria y ancho de banda.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090 sin problema.
- Opciones de despliegue: la model card solo documenta la carga mediante la implementación propia `nexttransformer` (instalada desde el repositorio GitHub en un commit concreto) junto con `safetensors` y `tiktoken`, en Python 3.10-3.13. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al tratarse de una arquitectura modificada, estos motores probablemente no la soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| NextTransformer AttnRes | 1,36B | 2.048 | no disponible | Hugging Face (safetensors) | Variante AttnRes; BPB 0,6630, CORE-22 34,00 |
| Alternativas de ~1,3B en el estudio NextTransformer | no disponible | no disponible | no disponible | no disponible en la informacion | Resultados comparativos no incluidos |
| Modelos base de ~1,3B de uso comun (p. ej. familia Llama, Qwen, Pythia) | ~1,3B | 2.048-32.768 | varía | amplia | No se dispone de comparación numérica en la informacion proporcionada |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa numérica rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo base preentrenado sin alineación: no sigue instrucciones ni mantiene formato de chat; requiere prompting de continuación de texto o fine-tuning posterior.
- Contexto muy corto (2.048 tokens), insuficiente para casos de uso con documentos largos o conversaciones multi-turno extensas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no documentados: el rendimiento fuera del inglés (u otros idiomas presentes en ClimbMix) es desconocido.
- Riesgo de alucinación inherente a un modelo base de 1,36B parámetros y 49B tokens de entrenamiento; no hay evaluación de seguridad ni de sesgos publicada.
- Arquitectura no estándar: la carga requiere la implementación `nexttransformer` en un commit concreto; no hay garantía de compatibilidad con motores de inferencia habituales ni de mantenimiento a largo plazo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación externa de la comunidad.
- No se documentan datos de sesgo, toxicidad ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/AttnRes-49B-Tokens
- Repositorio NextTransformer (GitHub): https://github.com/Interactive-Active-AI/NextTransformer
- Configuración de arquitectura AttnRes: https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/methods/attnres.json
- Registro de la ejecución de entrenamiento: https://github.com/Interactive-Active-AI/NextTransformer/blob/7aa267a88b45e4a19a9739ccb4ba3f196d7aacc0/results/runs/attnres.json

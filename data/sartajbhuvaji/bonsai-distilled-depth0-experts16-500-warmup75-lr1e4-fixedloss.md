# sartajbhuvaji/bonsai-distilled-depth0-experts16-500-warmup75-lr1e4-fixedloss

## Resumen

`sartajbhuvaji/bonsai-distilled-depth0-experts16-500-warmup75-lr1e4-fixedloss` es un checkpoint de generación de texto de 26.906.671.104 parámetros (unos 26,9 mil millones) publicado en Hugging Face por el usuario sartajbhuvaji. El tag `qwen3_moe` indica que se apoya en la arquitectura Qwen3 con mezcla de expertos (MoE), y el propio nombre del repositorio codifica lo que parece ser una configuración de destilación con recorte de profundidad y 16 expertos, junto con hiperparámetros de entrenamiento: 500 pasos, 75 pasos de warmup, learning rate 1e-4 y una corrección de pérdida ("fixedloss").

La model card es la plantilla automática de transformers, sin contenido sustantivo: no declara autoría real, datos de entrenamiento, idiomas ni licencia. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y ocupa 53,8 GB en safetensors, lo que corresponde a pesos en BF16 (aproximadamente 2 bytes por parámetro). No hay papers, demos ni repositorios de código asociados más allá del enlace de la calculadora de impacto de carbono que aparece en la plantilla.

Su relevancia es, por tanto, acotada y de carácter experimental: es un artefacto útil para investigar técnicas de destilación y poda de expertos sobre modelos MoE, o como base para experimentos de ajuste fino, pero no es un modelo validado ni documentado para uso en producción. Cualquier evaluación de capacidades o de calidad debe hacerse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) de la familia Qwen3 (tag `qwen3_moe`); número de capas, expertos totales y expertos activos no confirmado |
| Parametros totales | 26.906.671.104 (~26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: no se han publicado versiones GGUF, AWQ ni GPTQ; los pesos en safetensors BF16 son convertibles con herramientas estándar (llama.cpp, AutoAWQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (BF16; 53,8 GB de repositorio para 26,9 mil millones de parámetros) |

## Arquitectura y entrenamiento

El tag `qwen3_moe` sitúa el modelo en la familia arquitectónica Qwen3 MoE: un transformer decoder-only con capas de atención estándar y capas feed-forward sustituidas por mezcla de expertos con enrutado por token. El nombre del repositorio sugiere una variante "distilled" con `depth0` y `experts16`, es decir, una poda o destilación que habría reducido la profundidad y el número de expertos respecto al modelo base, aunque no se ha publicado ninguna confirmación de la configuración final ni del modelo del que parte. El sufijo `500-warmup75-lr1e4-fixedloss` parece recoger los hiperparámetros del proceso: 500 pasos de entrenamiento, 75 de warmup, tasa de aprendizaje 1e-4 y algún ajuste sobre la función de pérdida.

No hay información pública sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni sobre si hubo etapas de RLHF, DPO o ajuste por preferencias. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, variantes híbridas). El tag `arxiv:1910.09700` no corresponde a un paper de este modelo: es la referencia a Lacoste et al. (2019) sobre estimación de emisiones que la plantilla de model card incluye por defecto.

## Capacidades

- Generación de texto causal: es la función declarada en el pipeline (`text-generation`), con etiqueta `conversational`.
- Conversación multi-turno: la etiqueta `conversational` sugiere uso en diálogo, aunque no hay plantilla de chat ni ejemplos de uso documentados.
- Razonamiento y código: capacidad esperada por herencia de la familia Qwen3, no verificada en este checkpoint.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas ni formato de llamadas.
- Uso como agente y razonamiento multi-paso: no disponible; sin evaluación publicada.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible; el modelo es exclusivamente de texto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que la estructura del repositorio puede servirse en infraestructura de inferencia estándar (TGI, vLLM) sin conversión previa.

## Casos de uso

- Investigación en destilación de modelos MoE: el checkpoint sirve como punto de comparación frente al modelo base sin destilar, midiendo la pérdida de calidad asociada a la reducción de expertos y de profundidad, gracias a que los hiperparámetros quedan identificables en el nombre del repositorio.
- Estudio de poda de expertos: analizar el comportamiento del enrutado tras pasar de la configuración original a 16 expertos, inspeccionando la distribución de activaciones por experto con herramientas de interpretabilidad.
- Reproducción de experimentos de ajuste fino: al ser un modelo de 26,9 mil millones de parámetros en BF16, se puede ajustar con LoRA o QLoRA en un solo nodo de 8 GPU y comparar curvas de pérdida con el checkpoint original.
- Base para adaptación a dominio: partir de este checkpoint para un ajuste supervisado en un dominio concreto (legal, sanitario, técnico) cuando el objetivo es minimizar coste de cómputo respecto a un modelo mayor, asumiendo que la calidad de partida no está garantizada.
- Pruebas de infraestructura de inferencia: validar despliegues con vLLM o TGI sobre arquitecturas MoE, midiendo memoria, throughput y comportamiento del enrutado antes de invertir en modelos más grandes.
- Evaluación comparativa interna (benchmarking de laboratorio): incluir el modelo como línea base en suites propias de evaluación de razonamiento y generación, dado que no existen resultados públicos con los que contrastarlo.
- Experimentos de cuantización: generar versiones GGUF en Q4_K_M o Q8_0 y medir la degradación de perplejidad para estudiar la robustez de los modelos MoE destilados frente a la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: unos 54 GB solo para pesos, más caché KV y activaciones; requiere GPU de 80 GB (A100, H100) o reparto en varias GPU.
- VRAM estimada en FP8/INT8: en torno a 27-30 GB; cabe en una A100 de 40 GB o en dos RTX 4090 de 24 GB.
- VRAM estimada en INT4: aproximadamente 14-16 GB, lo que permite ejecución en una única RTX 4090, RTX 3090 o RTX 4080 Super de 16 GB al límite.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 sin cuantizar; A100 40 GB para INT8; RTX 4090/3090 para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits; en BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI para servicio con safetensors; llama.cpp y Ollama tras conversión a GGUF; transformers para pruebas puntuales.
- Latencia y throughput: no disponible. Al ser MoE, el coste por token depende del número de parámetros activos, dato que no se ha publicado, por lo que no se puede estimar con fiabilidad.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas y se ofrecen como referencia estructural; este checkpoint no ha publicado ninguna evaluación de rendimiento, por lo que la comparación es de tamaño, contexto y licencia, no de calidad.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| bonsai-distilled-depth0-experts16 (este modelo) | 26,9 mil millones | no disponible | no disponible | no disponible | no |
| Qwen3-30B-A3B | ~30,5 mil millones | ~3,3 mil millones | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | sí, en su model card |
| Qwen3-32B (denso) | ~32,8 mil millones | ~32,8 mil millones | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | sí, en su model card |
| Mixtral-8x7B-v0.1 | ~46,7 mil millones | ~12,9 mil millones | 32.768 tokens | Apache 2.0 | sí, en su model card |

Frente a Qwen3-30B-A3B, este checkpoint reduce el número total de parámetros y el número de expertos, pero no declara licencia ni contexto, lo que dificulta su adopción frente a la alternativa oficial. Frente a Mixtral-8x7B, ofrece menos parámetros totales pero también menos garantías documentales.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; en la práctica, el modelo debe tratarse como no apto para producción hasta que el autor la defina.
- Model card vacía: todos los campos son la plantilla automática, sin información sobre datos, sesgos, evaluación ni uso previsto.
- Ausencia total de evaluación: no hay benchmarks, ni pruebas de calidad, ni comparación con el modelo base, por lo que se desconoce la degradación introducida por la destilación.
- Riesgo elevado de alucinación y de respuestas incoherentes: con solo 500 pasos de entrenamiento declarados en el nombre del repositorio, es plausible que el ajuste no haya convergido a un estado estable de instrucciones.
- Idiomas desconocidos: sin campo de idiomas ni tokenizador documentado, no se puede asumir un buen comportamiento en castellano.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier diseño que dependa de ventanas largas requiere verificación empírica previa.
- Sesgos no evaluados: al no documentarse el corpus, no es posible caracterizar sesgos de género, etnia, idioma o dominio.
- Repositorio sin tracción: 0 descargas y 0 likes implican ausencia de validación por terceros y de informes de errores.
- Fecha de creación registrada como 2026-10-18, posterior a la del análisis habitual de modelos; conviene verificar la procedencia y el estado del repositorio antes de integrarlo en cualquier flujo.
- Tamaño de descarga considerable: 53,8 GB, con el coste de almacenamiento y transferencia asociado para pruebas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sartajbhuvaji/bonsai-distilled-depth0-experts16-500-warmup75-lr1e4-fixedloss
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, sobre estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental enlazada en la model card: https://mlco2.github.io/impact#compute
- Paper, blog, demo o repositorio de código del modelo: no disponible

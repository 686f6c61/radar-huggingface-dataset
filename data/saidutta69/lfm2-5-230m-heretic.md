# saidutta69/LFM2.5-230M-heretic

## Resumen

LFM2.5-230M-heretic es una variante "abliterated" (decensored) del modelo LiquidAI/LFM2.5-230M, publicada por el usuario saidutta69 (RACER IS OP). Se ha generado con la herramienta Heretic v1.4.0 mediante ablación direccional de pesos, un proceso que identifica y edita las direcciones de peso responsables del comportamiento de rechazo en lugar de reentrenar el modelo. El resultado conserva la arquitectura híbrida conv+attention original de Liquid AI y su formato nativo de tool-calling, pero reduce las negativas del 95/100 al 10/100 en un conjunto de evaluación de contenido dañino, con una divergencia KL de 0,0548 respecto al modelo base.

El modelo tiene 229.693.184 parámetros reales (229M), se distribuye en BF16 (safetensors de 0,43 GB) y en 15 cuantizaciones GGUF (de Q2_K a F16), y cubre diez idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués y español. Su orientación es claramente edge/on-device: el autor reporta 213 tok/s en un Galaxy S25 Ultra y 42 tok/s en una Raspberry Pi 5, con el modelo completo (pesos y KV cache) por debajo de 1 GB en Q4_0.

Es relevante ahora porque ocupa un nicho muy concreto: el modelo sin censura más pequeño de su colección, pensado para extracción de datos, salida estructurada, enrutamiento de herramientas y RAG en hardware donde no cabe nada mayor. Con 71,71 en IFEval y 43,26 en BFCLv3, el propio Liquid AI no recomienda este nivel para tareas de razonamiento intensivo: es un motor de extracción y enrutamiento, no un chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 dense (híbrida conv+attention), 14 capas |
| Parametros totales | 229.693.184 (229M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ~32K tokens de contexto usable (según model card) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_1, Q4_0, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_S, Q2_K; además BF16 en safetensors |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es |
| Licencia | lfm-license-1.0 (license: other) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo base es LFM2, una arquitectura densa híbrida que combina bloques de convolución con bloques de atención en sus 14 capas; la mayor parte de las capas son convolucionales, lo que abarata el coste por token y hace que el modelo sea más sensible al ancho de banda de memoria que a la potencia de la GPU. El autor indica que la variante heretic conserva el formato Pythonic nativo de tool-calling de Liquid y la cobertura de diez idiomas.

El entrenamiento original de LFM2.5-230M (datos, número de tokens, composición del dataset, uso de RLHF/DPO) no se detalla en la información disponible. Lo que sí se documenta es el proceso de modificación: ablación direccional con Heretic v1.4.0, ensayo 82 de una ejecución de 200 trials con semilla 3544511175. Los pesos editados son las proyecciones de salida de atención (`attn.o_proj`) y las down-projections del MLP (`mlp.down_proj`), con parámetros como `direction_index` 10,25, `attn.o_proj.max_weight` 1,41, `attn.o_proj.min_weight` 0,94, `mlp.down_proj.max_weight` 0,81 y `mlp.down_proj.min_weight` 0,59. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio Optuna y sumas SHA-256 para regenerar el modelo bit a bit mediante `heretic --reproduce reproduce/reproduce.json`.

## Capacidades

- Generación de texto conversacional y de rol (roleplay), con el comportamiento de rechazo suprimido.
- Tool calling / function calling en el formato Pythonic nativo de LFM2.
- Enrutamiento de herramientas y salida estructurada, adecuado para pipelines de agentes ligeros.
- Extracción de información y RAG en dispositivos con recursos limitados.
- Soporte multilingüe en diez idiomas (en, ar, zh, fr, de, it, ja, ko, pt, es).
- Instrucciones de formato y seguimiento de directrices (IFEval 71,71).
- No dispone de visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Extracción de datos estructurados en el edge: el modelo puede convertir texto libre en JSON o campos tabulares en dispositivos con 4 GB de RAM usando Q4_K_M (~0,14 GB), lo que permite desplegarlo en teléfonos o Raspberry Pi 5 sin conexión.
- Enrutamiento de herramientas en asistentes locales: con 43,26 en BFCLv3 y tool calling nativo, sirve para decidir qué función invocar en un agente pequeño antes de delegar en un modelo mayor.
- RAG en hardware restringido: con ~32K de contexto usable y menos de 1 GB en Q4_0, puede indexar y responder sobre documentos locales en un portátil Apple Silicon con Q8_0 (~0,23 GB).
- Clasificación y etiquetado por lotes: su tamaño permite ejecutar múltiples instancias en un servidor multi-tenant con Q6_K (~0,18 GB), procesando grandes volúmenes de texto con bajo coste por token.
- Generación de roleplay y narrativa sin filtros: la variante heretic reduce las negativas de 95/100 a 10/100, lo que la hace utilizable en aplicaciones creativas donde el modelo base rechazaría contenido.
- Preprocesamiento en pipelines de CI/CD: puede normalizar y validar entradas de texto antes de pasarlas a modelos mayores, reduciendo el coste de inferencia en las etapas iniciales.
- Asistentes de voz o chat en navegador: el tamaño reducido y las cuantizaciones pequeñas permiten cargarlo en un navegador con 4 GB de RAM, aunque el autor no detalla integración web específica.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (LiquidAI/LFM2.5-230M) |
|---|---|---|
| KL divergence | 0,0548 | 0 (por definición) |
| Rechazos (conjunto dañino) | 10/100 | 95/100 |
| IFEval | 71,71 | no disponible |
| BFCLv3 | 43,26 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: menos de 1 GB en Q4_0 incluyendo pesos y KV cache; pesos de ~0,11 GB (Q2_K) a ~0,43 GB (F16).
- Cuantizaciones recomendadas por dispositivo según el autor: Q4_K_M (~0,14 GB) para teléfono/navegador con 4 GB de RAM y Raspberry Pi 5; Q8_0 (~0,23 GB) para portátil Apple Silicon de 8 GB; Q6_K (~0,18 GB) para servidor multi-tenant.
- GPU recomendadas: no se especifican modelos concretos; el autor señala que el rendimiento depende más del ancho de banda de RAM que de la GPU por la arquitectura convolucional.
- Cabe en cualquier GPU consumer e incluso en CPU: el factor limitante es la memoria, no la potencia de cómputo.
- Opciones de despliegue: llama.cpp, LM Studio, Jan, MLX, vLLM y builds NPU optimizadas con Nexa; soporte upstream desde el primer día.
- Latencia y throughput reportados: 213 tok/s en Galaxy S25 Ultra y 42 tok/s en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-230M-heretic | 229M | ~32K | lfm-license-1.0 | Variante sin censura, tool calling nativo, 10 idiomas |
| LiquidAI/LFM2.5-230M | 229M | ~32K | lfm-license-1.0 | Modelo base con rechazos (95/100), mismas capacidades |
| Alternativas de 200-300M de otras familias | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información disponible.

## Limitaciones y advertencias

- La supresión de rechazos implica que el modelo puede generar contenido dañino, ofensivo o inapropiado; no es apto para aplicaciones públicas sin moderación adicional.
- La divergencia KL de 0,0548 indica una degradación medible respecto al modelo base; el autor advierte de que debe leerse junto con el recuento de rechazos, nunca de forma aislada.
- Quedan 10 rechazos de 100, cifra alta para esta colección, porque los modelos pequeños ajustados para rechazar concentran ese comportamiento en pocas direcciones.
- Liquid AI no recomienda este nivel de tamaño para tareas de razonamiento intensivo; es un motor de extracción y enrutamiento, no un chatbot generalista.
- Riesgo de alucinación inherente a un modelo de 230M; la calidad en tareas abiertas será limitada.
- La licencia lfm-license-1.0 ("other") puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de desplegarlo en producción.
- El contexto usable de ~32K depende de la cuantización y del hardware; no se garantiza en todas las configuraciones.
- El modelo se distribuye sin garantías de reproducibilidad más allá del recetario incluido en `reproduce/`.

## Enlaces

- Hugging Face: https://huggingface.co/saidutta69/LFM2.5-230M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
- Heretic: https://github.com/p-e-w/heretic
- Artículo sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp

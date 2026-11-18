# gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF

## Resumen
Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF es una distribución de cuantizaciones GGUF del checkpoint abliterado `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated`, un modelo de mezcla de expertos (MoE) de 35.505.251.456 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token (la nomenclatura A3B lo indica). Lo publica el usuario gbuzhf, que combina las matrices de importancia de un corpus completo de 27.513 fragmentos con la plantilla de chat Qwen-Sharp v22.4.1 y la cabeza MTPv2 entrenada del modelo original.

El interés de esta ficha no reside en un modelo nuevo, sino en el proceso de cuantización: se ofrecen cuatro niveles ICE (19G, 21G, 23G y 25G) más el maestro en BF16, calibrados contra una matriz de importancia alineada con el tronco del modelo. El autor publica mediciones de divergencia KL frente al maestro BF16, lo que permite elegir el nivel de cuantización con datos objetivos en lugar de estimaciones.

La relevancia actual es doble: por un lado, demuestra que las cuantizaciones calibradas con imatrix de corpus completo pueden superar a los escalones dinámicos habituales (UD) en el mismo rango de tamaño; por otro, al ser un checkpoint abliterado, elimina el comportamiento de rechazo en los pesos, lo que exige controles de seguridad externos si se despliega en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen35moe`), con cabeza MTPv2 |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3B (denominacion A3B; no se detalla el reparto exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF ICE en 19G, 21G, 23G y 25G; maestro BF16 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); BF16 incluido en el repo |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos con 35.505 millones de parámetros totales y alrededor de 3.000 millones activos por token, etiquetado como `qwen35moe`. Incluye una cabeza MTP (multi-token prediction) en su versión v2, que el autor conserva en las cuantizaciones. La plantilla de chat embebida es Qwen-Sharp v22.4.1, la misma que usa la escalera de cuantizaciones de referencia `peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el checkpoint original. La innovación técnica documentada es el proceso de cuantización: las matrices de importancia se calcularon sobre un corpus completo de 27.513 fragmentos, frente a los 800 fragmentos de la escalera UD de referencia. El autor verifica que ambas matrices asignan bits de forma casi idéntica (coseno de `in_sum2` en tensores de expertos de 0,99569 y solapamiento top-1 de canales del 94,8 %), por lo que las diferencias medidas reflejan la receta de cuantización y no la calibración. El checkpoint es abliterado: el comportamiento de rechazo se ha suprimido directamente en los pesos.

## Capacidades
- Generación de texto conversacional en inglés y chino.
- Razonamiento y generación de código, con una divergencia KL especialmente baja en el dominio de código (PPL base 2,194208 en `code.test.raw`).
- Predicción multi-token mediante la cabeza MTPv2, que puede aprovecharse para decodificación especulativa en llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- Plantilla de chat Qwen-Sharp v22.4.1 embebida, lista para uso conversacional sin configuración adicional.
- Sin mecanismos de rechazo en los pesos (abliterado), lo que permite respuestas sobre temas que un modelo con guardarraíles declinaría.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso
- Evaluación de cuantizaciones en pipelines de investigación: el repo publica divergencia KL frente al maestro BF16 para cada nivel, de modo que un equipo puede medir el impacto real de bajar de 25G a 19G antes de fijar el tamaño de despliegue.
- Despliegue en estaciones de trabajo con 24 GB de VRAM: el nivel 23G (22,84 GB) está pensado para encajar en 24–32 GB y es el punto de partida recomendado por el autor para equilibrar calidad y contexto disponible con KV en `q8_0`.
- Servicio conversacional en inglés o chino: la plantilla Qwen-Sharp embebida y el formato GGUF permiten levantar un endpoint compatible con OpenAI mediante llama.cpp sin pasos adicionales de formateo.
- Generación de código en local: la baja divergencia en el dominio de código (KLD media de 0,019269 en el nivel 23G) lo hace adecuado para autocompletado y refactorización en entornos sin conexión.
- Investigación sobre alineación y seguridad: al ser abliterado, sirve como contrapunto controlado para estudiar cómo cambia el comportamiento al eliminar el rechazo, siempre en sandbox a nivel de sistema operativo.
- Ajuste fino o destilación a partir del maestro: el BF16 de 71,07 GB publicado en el mismo repo permite generar cuantizaciones propias o servir como referencia para evaluar otras recetas.
- Pruebas de robustez frente a inyección de prompts: el autor advierte explícitamente de que, sin backstop de rechazo, una inyección desde una página hostil o código de terceros no encuentra freno, lo que lo convierte en un banco de pruebas realista para defensas externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al maestro BF16, con 64 fragmentos a `n_ctx` 2048:

| Fichero | Tamano | KLD media (texto) | KLD media (codigo) | Same top-1 (texto) | Overall (texto) |
|---|--:|--:|--:|--:|--:|
| `25G-ICE` | 24,85 GB | 0,027866 | 0,015497 | 93,36 % | 96,1 |
| `23G-ICE` | 22,84 GB | 0,033146 | 0,019269 | 92,68 % | 95,6 |
| `21G-ICE` | 20,85 GB | 0,039589 | 0,024669 | 92,22 % | 95,0 |
| `19G-ICE` | 18,82 GB | 0,059336 | 0,036910 | 90,09 % | 93,1 |

Referencia de la escalera UD sobre los mismos pesos:

| Fichero | Tamano | KLD media (texto) | KLD media (codigo) | Same top-1 (texto) | Overall (texto) |
|---|--:|--:|--:|--:|--:|
| `UD-Q5_K_XL` | 26,98 GB | 0,024029 | 0,011993 | 94,00 % | 96,6 |
| `UD-Q4_K_XL` | 22,75 GB | 0,035699 | 0,019742 | 92,63 % | 95,4 |
| `UD-Q4_K_S` | 21,28 GB | 0,040310 | 0,023484 | 91,98 % | 94,9 |
| `UD-IQ4_XS` | 18,12 GB | 0,068901 | 0,044161 | 89,59 % | 92,4 |

La fórmula `overall` es `0,70/(1+meanKLD) + 0,30*sameTop1`. Los tamanos son medidos, no estimados. El autor advierte de que no deben compararse las tablas de texto y código entre sí, solo filas dentro de la misma tabla.

## Requisitos de hardware
- VRAM/RAM estimada: 18,82 GB (19G), 20,85 GB (21G), 22,84 GB (23G), 24,85 GB (25G) y 71,07 GB (BF16), según los tamanos medidos de cada fichero.
- El nivel 23G encaja justo en 24 GB de VRAM; los niveles 25G y superiores requieren 32 GB o descarga parcial a RAM.
- GPU recomendadas: RTX 4090 (24 GB) para el nivel 23G con contexto moderado; A100 40/80 GB o H100 para BF16 y contextos largos.
- Cabe en GPU de consumo de 24 GB (RTX 3090, RTX 4090) con el nivel 19G o 23G; en 16 GB solo con cuantizaciones menores no publicadas en este repo.
- Despliegue: llama.cpp y cualquier frontend compatible (Ollama, LM Studio) al ser GGUF; también servidores compatibles con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. El tamaño del repo (158,4 GB) refleja que contiene todos los niveles y el BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD media (texto) | Licencia | Disponibilidad |
|---|---|--:|--:|---|---|
| `gbuzhf/…-23G-ICE` | 35,5B totales / ~3B activos | no disponible | 0,033146 | MIT | GGUF en HF |
| `peculiar-ragdoll/…-UD-Q4_K_XL` | 35,5B totales / ~3B activos | no disponible | 0,035699 | MIT | GGUF en HF |
| `huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated` | 35,5B totales / ~3B activos | no disponible | referencia (BF16) | MIT | safetensors en HF |
| `gbuzhf/…-TIEL-Calibrated` | 35,5B totales / ~3B activos | no disponible | no disponible | MIT | GGUF en HF |

La comparación directa con modelos de otros autores no está disponible en la información proporcionada; las alternativas listadas comparten los mismos pesos base y solo difieren en la receta de cuantización o en la presencia de guardarraíles.

## Limitaciones y advertencias
- Modelo abliterado: el rechazo está suprimido en los pesos y responderá a peticiones que un modelo estándar declinaría. El autor recomienda aislarlo a nivel de sistema operativo y controlar su acceso a red y ejecución de código.
- Riesgo de inyección de prompts sin freno: sin backstop de rechazo, un contenido hostil puede dirigir el modelo hacia acciones no deseadas si tiene herramientas o red disponibles.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni benchmarks estándar.
- Sesgos del checkpoint original no documentados; la abliteración puede alterar también comportamientos distintos del rechazo.
- Contexto máximo no disponible: la elección de nivel debe dejar espacio para el KV en `q8_0`, pero no se especifica la ventana nativa.
- Licencia MIT permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.
- El repo ocupa 158,4 GB; descargar solo el fichero GGUF necesario, no el repositorio completo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-Abliterated-CyberTiel-Calibrated-MTPv2-ICE-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Escalera de cuantizaciones de referencia: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Variante con guardarraíles: https://huggingface.co/gbuzhf/Ornith-1.5-35B-A3B-TIEL-Calibrated-MTPv2-ICE-GGUF

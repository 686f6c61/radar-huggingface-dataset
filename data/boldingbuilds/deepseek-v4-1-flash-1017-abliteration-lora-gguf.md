# BoldingBuilds/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF es un adaptador LoRA de rango 1 publicado por BoldingBuilds que reduce drásticamente la tasa de rechazos del modelo base DeepSeek-V4.1-Flash-1017. No es un modelo completo, sino un adaptador de 438 MiB que se aplica sobre los pesos existentes del modelo base, por lo que no requiere recuantizar ni descargar una copia completa del modelo. Su propósito declarado es la investigación sobre el comportamiento de rechazo (refusal) y el uso local sin censura dentro del marco legal.

La técnica empleada es la "abliteration": se identifica una dirección de rechazo comparando las activaciones del modelo ante 128 prompts dañinos (AdvBench) y 128 inofensivos (Alpaca), y el adaptador resta esa dirección de la salida de cada capa hacia el residual stream. La dirección se extrae de la capa 22 y se aplica con escala 1.0. Según el autor, la tasa de rechazo ante prompts dañinos cae del 98,3 % al 4,2 %, sin degradar la tasa de respuesta a prompts inofensivos (0 % de rechazos en ambos casos).

El adaptador está construido específicamente para los pesos de la cuantización Maya-S del pack de Project Maya. Sobre otras cuantizaciones (Q4_K_XL, Q8, BF16) la eliminación de la dirección es solo aproximada y no ha sido evaluada. El repositorio incluye un segundo adaptador alternativo (`...-allmean-L22.gguf`) construido con una variante de la dirección promediada sobre todos los tokens, que el autor no ha probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 1 sobre transformer (modelo base DeepSeek-V4.1-Flash-1017); ablación de dirección en capa 22 |
| Parametros totales | 114.862.080 (dato del adaptador en safetensors) |
| Parametros activos | no disponible (no es MoE en el adaptador; el base no se detalla) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (adaptador en formato GGUF); el base admite otras cuantizaciones como Q4_K_XL, Q8, BF16 y el pack Maya-S |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (adaptador LoRA); repo de 0,9 GB |

## Arquitectura y entrenamiento

El adaptador no entrena el modelo: aplica una transformación lineal sobre las activaciones. Concretamente, calcula una dirección de rechazo `r` a partir de la diferencia de activaciones entre prompts dañinos (AdvBench) e inofensivos (Alpaca), y el LoRA resta esa dirección de la escritura de cada capa al residual stream según `y ← y − scale · r (r · y)`. La dirección proviene de la capa 22 y se aplica con escala 1.0. El LoRA almacena dos mitades por capa: la dirección pura y la dirección multiplicada por los pesos de esa capa, tomados de la cuantización Maya-S de Project Maya.

No hay datos sobre tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO, ya que no es un modelo entrenado desde cero sino un adaptador de ablación. La innovación técnica es la ablación de rechazo en un solo paso de rango 1, aplicable en tiempo de inferencia mediante `llama.cpp --lora` o mediante la bandera `--ablate` de Project Maya, que proyecta la dirección fuera de la salida de atención y MoE en tiempo de ejecución usando los pesos cargados.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Reducción drástica de rechazos: del 98,3 % al 4,2 % en prompts dañinos de AdvBench (120 prompts, thinking off).
- Mantenimiento de la tasa de respuesta a prompts inofensivos: 0 % de rechazos y 120/120 respuestas completas en xstest_safe.
- Capacidad de código preservada: HumanEval 95,1 % stock frente a 95,7 % con adaptador (164 problemas, greedy, thinking off).
- Soporte de tool calling y agentes: no medido por el autor (una versión anterior de la model card citaba una puntuación agéntica que fue retirada por no poder trazarse).
- Capacidades multilingües: solo inglés declarado.
- Modo thinking: el autor reporta resultados con thinking desactivado; no se detalla el comportamiento con thinking activo.
- Visión y audio: no disponibles.

## Casos de uso

- Investigación sobre mecanismos de rechazo: permite estudiar cómo se representa la negativa a responder en el espacio de activaciones y evaluar la robustez de esas direcciones frente a distintos prompts.
- Evaluación de robustez de salvaguardas: útil para medir hasta qué punto una ablación de una sola dirección (capa 22, escala 1.0) elimina el comportamiento de rechazo y qué resiste.
- Uso local sin censura dentro del marco legal: despliegue en llama.cpp con `--lora` sobre un GGUF del modelo base para tareas creativas o de investigación que el modelo stock rechazaría.
- Análisis comparativo de cuantizaciones: comparar la eficacia de la ablación sobre el pack Maya-S frente a Q4_K_XL, Q8 o BF16, sabiendo que solo Maya-S está validado.
- Experimentos de interpretabilidad: usar la dirección extraída de la capa 22 como vector de sonda para analizar representaciones internas del modelo base.
- Evaluación de impacto en capacidades: replicar el protocolo del autor (HumanEval, comparación problema a problema) para verificar que la ablación no degrada tareas de código en otros entornos.
- Despliegue en Project Maya: usar `--ablate` con el adaptador para proyección en tiempo de ejecución sobre los pesos cargados, independiente de las matrices almacenadas en el adaptador.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre `maya-ds4` con el pack Maya-S (4x RTX 3090), thinking off:

| Métrica | Stock | Con adaptador |
|---|---:|---:|
| Rechaza prompts dañinos (AdvBench, 120) | 98,3 % (118/120) | 4,2 % (5/120) |
| Puntuación de dañosidad (0–1) | 0,013 | 0,851 |
| Rechaza prompts inofensivos (xstest_safe, 120) | 0 % | 0 % |
| Responde completamente prompts inofensivos | 120/120 | 120/120 |
| HumanEval pass rate (164 problemas) | 95,1 % (156/164) | 95,7 % (157/164) |
| Longitud típica de respuesta (tokens) | 91 | 92 |

Desglose problema a problema en HumanEval: 156 pasan en ambos casos, 7 fallan en ambos, 0 pasan en stock y fallan con adaptador, 1 falla en stock y pasa con adaptador (HumanEval/32). El autor indica que la diferencia de 0,6 puntos está dentro del ruido y no debe interpretarse como mejora. La evaluación de rechazos se validó con dos métodos (chequeo de inicio de respuesta y un juez Qwen3.8-27B). No se han publicado resultados de benchmarks de capacidades agénticas o tool use.

## Requisitos de hardware

- VRAM: depende del modelo base cuantizado, no del adaptador (438 MiB adicionales). El autor ejecutó las pruebas en 4x RTX 3090 con el pack Maya-S.
- GPU recomendadas: el autor usó 4x RTX 3090; no se detallan otras configuraciones probadas.
- Consumer GPU: no disponible para el modelo base completo; el adaptador por sí solo no determina los requisitos.
- Despliegue: `llama.cpp` con `--lora` y `--jinja`; Project Maya con `--ablate` (requiere build upstream con el commit 8a3395142537ae7ae909a1bce33fe76f8a810592 o v1.1.31 en adelante).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---:|---|---|
| DeepSeek-V4.1-Flash-1017-Abliteration-LoRA (este) | LoRA de ablación | 114,86 M (adaptador) | no disponible | MIT | Solo validado sobre Maya-S; reduce rechazos al 4,2 % |
| DeepSeek-V4.1-Flash-1017 (base) | Modelo completo | no disponible | no disponible | no disponible | Modelo stock con 98,3 % de rechazos en AdvBench |
| `...-allmean-L22.gguf` (mismo repo) | LoRA de ablación alternativo | no disponible | no disponible | MIT | Dirección promediada sobre todos los tokens; no probado por el autor |

No se dispone de datos de otros adaptadores de abliteración comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo validado sobre la cuantización Maya-S de Project Maya; sobre Q4_K_XL, Q8 o BF16 la eliminación de la dirección es aproximada y no ha sido probada.
- No elimina los rechazos por completo: queda un 4,2 % de rechazos en el conjunto de prueba.
- El autor no ha medido todos los cambios de comportamiento; solo rechazos y HumanEval.
- Capacidades agénticas y tool use no evaluadas; una puntuación anterior fue retirada por falta de trazabilidad.
- Muestra limitada: 120 prompts dañinos y 120 inofensivos; el autor advierte que no es una muestra grande.
- Los prompts dañinos son genéricos estilo AdvBench; el adaptador cambia lo que el modelo está dispuesto a escribir, no lo convierte en una herramienta para atacar a personas o sistemas reales.
- Solo idioma inglés declarado.
- Riesgo de alucinación no medido en la información disponible.
- Licencia MIT para base y adaptador; reducir rechazos no elimina las responsabilidades legales del usuario.
- Uso previsto: investigación sobre rechazos, pruebas de robustez y uso local sin censura dentro de la ley; no para dirigirse a personas reales ni acceder a sistemas ajenos.
- El segundo adaptador del repo (`...-allmean-L22.gguf`) no ha sido probado.

## Enlaces

- Hugging Face: https://huggingface.co/BoldingBuilds/DeepSeek-V4.1-Flash-1017-Abliteration-LoRA-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Project Maya (repo): https://github.com/mw00/project-maya
- Commit con `--ablate` en upstream: https://github.com/mw00/project-maya/commit/8a3395142537ae7ae909a1bce33fe76f8a810592

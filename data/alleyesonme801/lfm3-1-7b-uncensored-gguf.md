# Alleyesonme801/LFM3-1.7B-Uncensored-GGUF

## Resumen

LFM3-1.7B-Uncensored-GGUF es una cuantización GGUF del modelo base LiquidAI/LFM3-1.7B, publicada por el usuario Alleyesonme801 y atribuida en la model card al equipo de AtomicChat. El modelo parte de la familia LFM3 de Liquid AI, una arquitectura de tipo transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones), y se distribuye en dos niveles de cuantización con formato GGUF para su uso en llama.cpp y entornos de inferencia local.

La modificación principal respecto al base es una "ablación de seguridad": se aplica una LoRA de rango 1 (dirección calculada como la media de activaciones dañinas menos la media de activaciones inofensivas, con la componente inofensiva proyectada fuera) que se integra en los pesos con un factor W*=2.0 y después se cuantiza. Según los datos medidos por el autor, esta edición elimina las negativas ante prompts dañinos (del 61,7 % al 0,0 %) sin degradar MMLU.

El modelo es relevante para quienes necesitan un modelo pequeño, de licencia abierta y ejecutable en hardware consumer, con comportamiento conversacional sin rechazos, para tareas de generación de texto en inglés, chino y alemán. Su contexto, parámetros de entrenamiento y detalles arquitectónicos del base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia LFM3 de Liquid AI; detalles no disponibles) |
| Parametros totales | 1.728.801.600 (~1,7 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AD-Q6_K (7,31 bpw), AD-Q4_K_M (5,20 bpw) |
| Idiomas soportados | en, zh, de |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (cuantizado; pesos base en safetensors) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B pertenece a la familia LFM3 de Liquid AI. La información proporcionada no detalla la arquitectura interna (tipo de atención, capas, composición del dataset de entrenamiento, número de tokens ni si se aplicó RLHF o DPO). Lo que sí se documenta es el proceso de modificación: se calcula una dirección de ablación como la diferencia entre la media de activaciones en prompts dañinos y la media de activaciones en prompts inofensivos, se proyecta fuera la componente inofensiva y se entrena una LoRA de rango 1 que se integra en los pesos con W*=2.0. Posteriormente, los pesos resultantes se cuantizan con el esquema AD (AD-Q6_K y AD-Q4_K_M) usando imatrix.

El autor reporta que esta edición dirigida es más eficaz y menos destructiva que una edición aleatoria del mismo tamaño: la edición aleatoria redujo MMLU en 1,3 puntos y produjo un ΔKLD mayor (0,028 frente a 0,019 de la edición dirigida). Además, las comprobaciones de bucles de razonamiento y de salidas vacías pasan en W*=2.0. La inferencia requiere una compilación de llama.cpp con soporte para LFM3 (integrado en llama.cpp PR #31252, generado en el commit `19cce69`).

## Capacidades

- Generación de texto conversacional en inglés, chino y alemán.
- Comportamiento sin rechazos ante prompts dañinos (0,0 % de negativas medido en la evaluación del autor).
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU evaluado con 2000 preguntas).
- Manejo de contexto largo limitado: la prueba "needle" supera 3/3 casos, aunque la longitud de contexto no se especifica.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Generación de texto creativo sin filtros: el modelo elimina las negativas automáticas, lo que lo hace adecuado para escritura de ficción, guiones y narrativa que otros modelos censuran; su tamaño de 1,7 B permite ejecución local.
- Chat conversacional local y offline: con cuantización Q4_K_M (1,1 GB en disco) puede desplegarse en portátiles y equipos de gama media mediante llama.cpp, sin dependencia de servicios en la nube.
- Prototipado rápido de aplicaciones conversacionales: la etiqueta `endpoints_compatible` y el formato GGUF facilitan la integración en pipelines de prueba antes de escalar a modelos mayores.
- Evaluación de técnicas de ablación de seguridad: investigadores pueden usar esta variante como referencia para estudiar el equilibrio entre eliminación de rechazos y preservación de capacidades (MMLU sin caída, ΔKLD de 0,019).
- Asistencia multilingüe básica en inglés, chino y alemán: útil para tareas de traducción informal, resumen o generación de respuestas en estos tres idiomas.
- Despliegue en entornos con hardware restringido: al caber en GPUs consumer y en CPU, sirve para demos, entornos educativos y pruebas de concepto donde no hay acceso a GPUs de datacenter.

## Benchmarks y rendimiento

Datos medidos por el autor de la cuantización, comparando base frente a uncensored:

| Metrica | Base | Uncensored |
|---|---|---|
| Negativas en prompts dañinos | 61,7 % | 0,0 % |
| Falsas negativas (XSTest) | 5,2 % | 0,0 % |
| MMLU (2000 preguntas) | 41,0 % | 41,0 % (McNemar p=1,0) |
| Needle (contexto largo) | 3/3 | 3/3 |
| ΔKLD vs base (neutral) | — | +0,019 |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para AD-Q4_K_M y 1,6 GB para AD-Q6_K (tamaño en disco de los pesos), más overhead de contexto y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM efectiva; modelos como RTX 3060, RTX 4060, RTX 4090 son más que suficientes. En datacenter, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (requiere build con soporte LFM3, PR #31252, commit `19cce69`), y herramientas compatibles con GGUF como Ollama o interfaces basadas en llama.cpp. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Uncensored (este) | ~1,7 B | no disponible | LFM Open License v1.0 | GGUF | Sin rechazos, MMLU 41,0 % |
| LiquidAI/LFM3-1.7B (base) | ~1,7 B | no disponible | LFM Open License v1.0 | safetensors | Negativas 61,7 %, MMLU 41,0 % |
| Alternativas de ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos sobre otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos de seguridad: el modelo responderá a prompts dañinos, lo que implica riesgos de uso indebido y requiere moderación externa en producción.
- Riesgo de alucinación: no se documentan evaluaciones específicas de veracidad; MMLU de 41,0 % indica un conocimiento general limitado, típico de modelos de este tamaño.
- Sesgos conocidos: no se documentan sesgos específicos, pero la ablación dirigida puede alterar el comportamiento en dominios sensibles de forma no medida.
- Limitaciones de idioma: solo se declaran en, zh y de; el rendimiento en castellano no está evaluado.
- Restricciones de licencia: LFM Open License v1.0; debe revisarse el texto completo para uso comercial y para las condiciones de redistribución de pesos modificados.
- Dependencia de tooling: requiere una build específica de llama.cpp con soporte LFM3; versiones anteriores no cargarán el modelo.
- Longitud de contexto no especificada: la prueba needle 3/3 no permite inferir la ventana real del modelo.
- Atribución: el repositorio figura bajo el usuario Alleyesonme801, mientras que la model card atribuye los quants a AtomicChat; conviene verificar la procedencia antes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alleyesonme801/LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de AtomicChat: https://x.com/atomic_chat_hq
- PR de llama.cpp con soporte LFM3: #31252 (commit `19cce69`)

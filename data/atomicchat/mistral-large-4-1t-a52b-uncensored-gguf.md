# AtomicChat/Mistral-Large-4-1T-A52B-Uncensored-GGUF

## Resumen

Mistral-Large-4-1T-A52B-Uncensored-GGUF es una versión "abliterada" del modelo Mistral Large 4 (1T-A52B) de Mistral AI, publicada por el equipo de AtomicChat. El modelo base es un MoE de gran escala (aproximadamente 1 billón de parámetros totales con unos 52 mil millones activos, según la nomenclatura del nombre) al que se le ha proyectado fuera el "refusal direction", es decir, la dirección interna responsable de las negativas del modelo, eliminando así sus mecanismos de rechazo.

La ficha ofrece dos formas de uso: un LoRA de rango 1 (0,45 GB) que se aplica en tiempo de ejecución sobre builds cuantizadas de Unsloth, y una build GGUF "horneada" en cuantización IQ2_XXS de 2,31 bits por peso (302 GB en 8 shards) que incorpora la edición directamente en los pesos. Según los datos publicados por el autor, la variante LoRA reduce las negativas del 98,8 % al 0 %, mientras que la build horneada las baja al 7,4 %, con una pérdida de calidad algo mayor.

El modelo es relevante para usuarios que necesitan ejecutar un modelo de gran escala sin filtros de seguridad localmente mediante llama.cpp, aunque conviene tener muy presentes las implicaciones éticas y legales: el propio autor advierte que el modelo responde a peticiones que el original rechaza y que la responsabilidad de su uso recae en el usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), con experto compartido y 128 expertos enrutados |
| Parametros totales | 1T (aproximadamente, según nomenclatura del modelo base; el dato de safetensors del repo, 113,6 M, corresponde a metadatos del LoRA y no a los pesos completos) |
| Parametros activos | 52B (según nomenclatura A52B del modelo base) |
| Longitud de contexto | 32768 tokens (ejemplo de ejecución con `-c 32768`; máximo real no disponible) |
| Tipos de cuantizacion | IQ2_XXS (2,31 bpw, build horneada); LoRA aplicable sobre UD-Q2_K_XL de Unsloth o superiores |
| Idiomas soportados | no disponible |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada; requiere licencia comercial separada de Mistral para negocios de Model-as-a-Service) |
| Formato de pesos | GGUF (build horneada en 8 shards de 302 GB totales; LoRA en GGUF de 0,45 GB) |

## Arquitectura y entrenamiento

El modelo base, Mistral Large 4 (1T-A52B) de Mistral AI, es un transformer de tipo mixture-of-experts con un experto compartido y 128 expertos enrutados. La edición de AtomicChat no modifica la arquitectura ni reentrena el modelo: consiste en proyectar fuera el "refusal direction" (la dirección latente que gobierna las negativas) sobre la atención, el bloque denso, el experto compartido y los 128 expertos enrutados, con un factor de escala W* = 2,0. Es una intervención lineal de bajo rango, publicada tanto como LoRA rank-1 como integrada en los pesos.

No se ha realizado entrenamiento adicional con datos, RLHF ni DPO por parte de AtomicChat; el trabajo se limita a la abliteración y a la cuantización. Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada. Como innovación destacable, el autor publica mediciones de honestidad del proceso: KLD frente a una cuantización fuerte (UD-Q3_K_XL de Unsloth), concordancia top-1 y análisis de la desviación en el primer token de respuestas a prompts inocuos.

## Capacidades

- Generación de texto general, heredada del modelo base Mistral Large 4.
- Modo de razonamiento con bloque `[THINK]` y parámetro `reasoning_effort` (low / medium / high) en la plantilla de chat.
- Eliminación de negativas: del 98,8 % al 0 % con la LoRA (medido en un conjunto estilo JailbreakBench en inglés) y del 98,8 % al 7,4 % en la build horneada IQ2_XXS.
- Reducción drástica de falsos positivos en prompts seguros: XSTest baja del 10,4 % al 0,4 %.
- Compatibilidad con llama.cpp (soporte de Mistral Large 4 en master desde el 29 de octubre, PR #31376).
- No hay información sobre tool calling, capacidades de visión, audio ni soporte de agentes en la documentación disponible.

## Casos de uso

- Investigación de seguridad y alineamiento: el modelo permite estudiar cómo se comporta un modelo de frontera sin capa de rechazo, con métricas publicadas (refusals, KLD, concordancia top-1) útiles como referencia experimental.
- Escritura creativa sin restricciones: autores de ficción que necesitan que el modelo no decline contenidos sensibles dentro de narrativas (violencia en novelas, temáticas adultas consentidas) pueden usar la variante LoRA, que mantiene el 90,2 % de concordancia top-1 con el original.
- Reducción de falsas negativas en uso legítimo: con XSTest bajando del 10,4 % al 0,4 %, el modelo es útil en dominios (seguridad informática defensiva, medicina, derecho) donde el original rechazaba consultas inocuas con demasiada frecuencia.
- Despliegue local offline en hardware de gama alta: la build GGUF horneada funciona como archivo único con llama.cpp, adecuado para estaciones de trabajo con 384–512 GB de RAM y expertos en memoria del sistema vía `--n-cpu-moe`.
- Experimentación con MoE cuantizados a 2 bits: la build IQ2_XXS sirve como caso de estudio sobre el coste de cuantizar ediciones finas en pesos de 2 bits (degradación documentada: concordancia 82,5 % frente a 90,2 % del LoRA).
- Comparación de efectos de abliteración en modo razonamiento: el autor publica que las negativas en modo thinking (esfuerzo bajo y alto, 30 prompts) pasan de 29–30/30 a 0/30, lo que permite evaluar el razonamiento sin interferencias del filtro.

## Benchmarks y rendimiento

Datos publicados por el autor (original → build editada IQ2_XXS):

| Metrica | Original | Editada (IQ2_XXS) |
|---|---|---|
| Refusals, JailbreakBench-style (EN) | 98,8 % | 7,4 % |
| XSTest (prompts seguros rechazados) | 10,4 % | 0,4 % |
| Thinking refusals (low/high effort, 30 prompts) | 29–30/30 | 0/30 |
| MMLU (500 preguntas) | 81,6 % | 80,6 % (−0,95 pp, p = 0,13) |
| Concordancia top-1 (build horneada) | — | 82,5 % |
| Concordancia top-1 (LoRA a 2.0) | — | 90,2 % |

No se han publicado resultados de benchmarks estándar adicionales (GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Build horneada IQ2_XXS: unos 302 GB de pesos; se recomienda una máquina con 384–512 GB de RAM, o GPUs para la atención con los expertos en memoria del sistema (`--n-cpu-moe`).
- Alternativa LoRA: requiere una build cuantizada de Unsloth (UD-Q2_K_XL o superior) del modelo base, más 0,45 GB adicionales para el LoRA; el requisito de hardware es el de dicha build, no disponible en la información proporcionada.
- No cabe en GPUs de consumo habituales (RTX 4090, etc.) en ninguna de las dos variantes, dado el tamaño de los pesos.
- Despliegue: llama.cpp (build desde master o release con soporte de Mistral Large 4, PR #31376). No funciona todavía en Atomic Chat. No se menciona soporte de vLLM, TGI ni Ollama.
- Comandos de ejemplo publicados por el autor:
  ```bash
  llama-server -m Mistral-Large-4-1T-A52B-Uncensored-2.31bpw-IQ2_XXS/...gguf --jinja -c 32768
  llama-server -m ...UD-Q2_K_XL...gguf --lora-scaled Mistral-Large-4-1T-A52B-Uncensored-LoRA.gguf 2.0 --jinja
  ```
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Refusals (EN) | MMLU | Licencia |
|---|---|---|---|---|---|
| Mistral-Large-4-1T-A52B-Uncensored (LoRA) | MoE abliterado, LoRA runtime | Sobre UD-Q2_K_XL+ | 0 % | no disponible | Mistral Ecosystem Open-Weight |
| Mistral-Large-4-1T-A52B-Uncensored (IQ2_XXS horneada) | MoE abliterado, pesos integrados | IQ2_XXS (2,31 bpw) | 7,4 % | 80,6 % | Mistral Ecosystem Open-Weight |
| Mistral-Large-4-1T-A52B (original) | MoE base | no disponible | 98,8 % | 81,6 % | Mistral Ecosystem Open-Weight |

No hay datos suficientes para comparar con otros modelos abliterados de terceros en la información disponible.

## Limitaciones y advertencias

- El modelo responde deliberadamente a peticiones que el original rechaza: su uso puede ser ilegal o causar daño según la jurisdicción y el contexto; el autor declara explícitamente que la responsabilidad recae en el usuario.
- La build horneada IQ2_XXS es débil: mantiene un 7,4 % de refusals, concordancia top-1 del 82,5 % y presenta ocasionalmente degeneración en las respuestas; el autor recomienda la LoRA siempre que sea posible.
- La concordancia del primer token en prompts inocuos no supera el umbral de calidad del autor (KL media de 3,01 frente a un umbral de 0,10); la desviación se concentra en si el modelo abre con un bloque `[THINK]` o con la respuesta, no en el contenido. Un prompt inocuo de 431 repite el prompt de entrada.
- El KLD se mide contra una cuantización fuerte (UD-Q3_K_XL de Unsloth), no contra los pesos originales de 1T, que no cabían en el hardware de medición.
- Pérdida de capacidad medible aunque estadísticamente no significativa en MMLU (−0,95 pp).
- La abliteración elimina salvaguardas de seguridad: aumenta el riesgo de generación de contenido dañino y de alucinaciones sin mecanismos de contención.
- Licencia: Mistral Ecosystem Open-Weight License, una MIT modificada que exige licencia comercial separada de Mistral para negocios de Model-as-a-Service; revisar los términos antes de cualquier despliegue comercial.
- Soporte de Mistral Large 4 en llama.cpp es reciente (desde el 29 de octubre): se requiere compilar desde master o una release con el PR #31376.
- Idiomas soportados, longitud máxima de contexto y datos de entrenamiento del modelo base: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomicChat/Mistral-Large-4-1T-A52B-Uncensored-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Layout de referencia (Unsloth GGUF): https://huggingface.co/unsloth/Mistral-Large-4-1T-A52B-GGUF
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de la comunidad: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
- Licencia: enlace LICENSE dentro del repositorio del modelo

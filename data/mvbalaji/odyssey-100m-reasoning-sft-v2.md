# mvbalaji/ODYSSEY-100M-REASONING-SFT-V2

## Resumen

ODYSSEY-100M-REASONING-SFT-V2 es un modelo de lenguaje causal de 100,248,960 parámetros entrenado desde cero por Balaji Venkateswaran (mvbalaji) y publicado como artefacto de investigación. Se trata de la segunda iteración de ajuste supervisado (SFT) sobre la base ODYSSEY-100M-5B-BASE, que acumula 5.000 millones de tokens de preentrenamiento. La V2 añade 2.000.018 tokens de SFT (1.184.424 supervisados) sobre la V1, con una mezcla de datos orientada a matemáticas de paso mínimo verificado (50%), lógica (15%), instrucciones (10%), código (5%) y replay de preentrenamiento (20%).

El modelo no persigue un uso generalista, sino estudiar el post-entrenamiento de un transformer pequeño en tareas de razonamiento aritmético y lógico. Su arquitectura es un transformer decoder-only de 15 capas, dimensión 640, atención GQA con 10 cabezas de consulta y 2 de clave/valor, activación SwiGLU, RoPE y un contexto máximo de 1.024 tokens con vocabulario de 32.768 entradas.

Es relevante ahora porque documenta de forma transparente el efecto medible de un SFT de solo 2 millones de tokens sobre un modelo de 100M: mejora la precisión en operaciones simples (0,362 → 0,738) y en código con familias no vistas (0,050 → 0,225), pero no resuelve la aritmética de varios dígitos ni la composición de razonamientos nuevos. Es, por tanto, un banco de pruebas reproducible más que un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (implementación propia, no clase de `transformers`) |
| Parametros totales | 100.248.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (posiciones superiores generan error) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.safetensors` (sha256 `fa40f7e2ff38d8d1bbf439088493167f56e03e6561629b41626ec53b6d64b3d2`), más `SHA256SUMS` y código PyTorch independiente (`modeling_odyssey.py`, `example.py`) |

Detalles arquitectónicos adicionales: 15 capas, dimensión de modelo 640, GQA con 10 cabezas de consulta y 2 de clave/valor, SwiGLU, RoPE, vocabulario de 32.768 tokens. Tamaño del repositorio: 0,4 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con atención de grupo (GQA 10/2), SwiGLU en el bloque feed-forward y RoPE para la codificación posicional. No incorpora mecanismos híbridos, SSM, decodificación especulativa ni cabezas auxiliares: la model card indica explícitamente que no hay WSP (weighted soft prompting), compilador ni cabeza de salida extra. La implementación es propia y se distribuye junto a los pesos, por lo que no es cargable con `AutoModelForCausalLM` de `transformers`.

El preentrenamiento se realizó desde cero sin pesos de otros modelos, con 5.000 millones de tokens (la base final de la familia). La V2 parte de la V1 (que a su vez recibió 10 millones de tokens de SFT en la Fase 5) y aplica un SFT de parámetros completos de 2.000.018 tokens (1.184.424 supervisados) con tasa de aprendizaje fija de 2e-5 durante 61 pasos, completado en 115 segundos sobre una RTX 4060 de 8 GB. Los datos provienen del flujo `stream_B3`, íntegramente local, sintético o previamente aprobado, sin nuevas descargas. Las fuentes declaradas del proyecto incluyen `HuggingFaceFW/fineweb-edu`, `HuggingFaceTB/finemath`, `codeparrot/github-code-clean`, `openai/gsm8k` y `google-research-datasets/mbpp`. El formato de prompt es `### Instruction:\n{task}\n\n### Response:\n`, y las respuestas matemáticas siguen el patrón `Reasoning: …` seguido de `Final answer: X`. No se documenta RLHF ni DPO en esta iteración.

## Capacidades

- Generación de texto causal en inglés con decodificación greedy y parada en EOS.
- Aritmética de operaciones simples: 73,8% de acierto en operaciones únicas simples y 50,8% en formulaciones no vistas.
- Razonamiento lógico básico: 43,3% en el conjunto de evaluación de lógica.
- Generación de código en familias no vistas: 22,5% de éxito en tests unitarios.
- Seguimiento de formato matemático estructurado (`Reasoning:` / `Final answer:`).
- Aritmética de varios dígitos solo en tamaños de operando vistos en entrenamiento (18,8%); 0% en tamaños no vistos.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso fiable (composiciones nuevas cercanas a 0%).
- No dispone de visión, audio ni modo "thinking" explícito.
- Multilingüe: no; únicamente inglés para lenguaje natural.

## Casos de uso

- Investigación sobre post-entrenamiento de modelos pequeños: reproducir el efecto de un SFT de 2 millones de tokens sobre una base de 100M y 5B tokens, comparando V1 y V2 con intervalos de confianza pareados. El modelo está pensado exactamente para este fin según su model card.
- Punto de partida para RL basado en verificador: la familia incluye una variante experimental (`ODYSSEY-100M-P7-C3-RL`) con RL de respuesta exacta, por lo que V2 sirve como inicialización controlada para experimentos de recompensa verificable en aritmética.
- Evaluación de calibración de pasos en matemáticas: su mezcla de 50% de matemáticas de paso mínimo verificado permite estudiar cómo un modelo pequeño aprende a no encadenar operaciones sobrantes, y medir la tasa de sobrescritura residual (~15%).
- Banco de pruebas de decodificación y prompts: al ser un modelo de 100M con implementación propia, permite iterar rápidamente sobre estrategias de prompt y decodificación en una RTX 4060 sin coste de infraestructura.
- Estudio de regresiones por SFT: la model card documenta una caída en preguntas de comparación (0,67 → 0,25 con n=12) y en formulaciones lógicas no vistas (−0,10), útil para analizar olvido catastrófico en modelos pequeños.
- Docencia y divulgación: ilustrar de forma medible qué mejora y qué no mejora un SFT pequeño en razonamiento, con datos pareados y tamaños de muestra explícitos.
- No es adecuado para atención al cliente, generación de código en producción, asistencia médica, legal o financiera, ni para ningún escenario que requiera respuestas correctas.

## Benchmarks y rendimiento

Evaluación one-shot con confianza 6 sobre 604 ítems frescos, con intervalos de confianza pareados al 95% frente a V1:

| Métrica | Base | V1 | V2 | V2 − V1 |
|---|---:|---:|---:|---|
| Operaciones únicas simples | 0,200 | 0,362 | 0,738 | +0,375 [+0,287, +0,462] |
| Formulaciones no vistas | 0,154 | 0,354 | 0,508 | +0,154 [+0,015, +0,292] |
| Todas las matemáticas | 0,089 | 0,256 | 0,466 | +0,210 [+0,161, +0,259] |
| Varios dígitos, tamaños entrenados | 0,000 | 0,100 | 0,188 | +0,087 [+0,000, +0,175] |
| Varios dígitos, tamaños no vistos | 0,000 | 0,062 | 0,000 | — |
| Lógica | 0,122 | 0,400 | 0,433 | +0,033 [−0,056, +0,122] |
| Estructuras no vistas (matemáticas + lógica) | 0,063 | 0,223 | 0,244 | +0,021 [−0,034, +0,076] |
| Restricciones de instrucción (contenido no visto) | 0,000 | 0,111 | 0,111 | 0 |
| Código, familias no vistas (tests unitarios) | 0,000 | 0,050 | 0,225 | +0,175 [+0,075, +0,300] |

NLL de validación (general / matemáticas / código):

| Modelo | General | Matemáticas | Código |
|---|---:|---:|---:|
| Base | 2,983 | 1,916 | 1,545 |
| V1 | 2,996 | 1,973 | 1,587 |
| V2 | 2,996 | 1,948 | 1,567 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 100,2M parámetros; en fp32 ocupa aproximadamente 0,4 GB de pesos, en fp16/bfloat16 unos 0,2 GB y en int8 unos 0,1 GB. La VRAM total necesaria es inferior a 1 GB en cualquier configuración razonable, incluyendo caché KV para 1.024 tokens con 15 capas y GQA 10/2.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. El propio autor reporta el SFT completo en una RTX 4060 de 8 GB en 115 segundos; la inferencia cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: al no ser una clase de `transformers`, no es compatible directamente con vLLM, TGI ni Ollama sin adaptación. El repositorio incluye `modeling_odyssey.py` y `example.py` para ejecución con PyTorch, safetensors, tokenizers y huggingface_hub. No se documentan exportaciones a GGUF ni a llama.cpp.
- Latencia y throughput: no disponibles de forma oficial; el único dato reportado es el tiempo de entrenamiento (115 s para 61 pasos en una RTX 4060).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato | Notas |
|---|---|---|---|---|---|---|
| ODYSSEY-100M-REASONING-SFT-V2 | 100,2M | 1.024 | Apache 2.0 | en | safetensors + código propio | SFT de razonamiento, implementación no estándar |
| ODYSSEY-100M-REASONING-SFT-V1 | 100,2M | 1.024 | Apache 2.0 | en | safetensors + código propio | Predecesor directo; peor en matemáticas simples y código |
| ODYSSEY-100M-5B-BASE | 100,2M | 1.024 | Apache 2.0 | en | safetensors + código propio | Base sin SFT; punto de partida de la familia |
| Modelos de ~100M tipo GPT-2 small / Pythia-160M | ~100-160M | 1.024-2.048 | MIT / Apache 2.0 | en | safetensors, GGUF | No especializados en razonamiento matemático; comparables en escala, no en objetivo |

No se dispone de datos de benchmarks cruzados con modelos de terceros en la información proporcionada; la comparación se limita a la familia ODYSSEY y a alternativas de escala similar sin resultados medidos conjuntos.

## Limitaciones y advertencias

- Aritmética de varios dígitos: precisión ≤ 19% en tamaños entrenados y 0% en tamaños no vistos.
- Composición: problemas de palabras de 3 pasos, condicionales anidados y formas algebraicas no vistas rondan el 0%.
- Tasa de sobrescritura residual de aproximadamente el 15%: ante formulaciones desconocidas, el modelo cambia a un diseño multilínea y encadena una operación extra tras el valor correcto.
- Regresiones frente a V1: preguntas de comparación (0,67 → 0,25 con n=12) y formulaciones lógicas no vistas (−0,10, IC [−0,25, +0,03]).
- Seguimiento de restricciones de formato en contenido no visto: cercano a 0.
- Alucinación: la model card advierte que confabula hechos con seguridad y entra en bucles bajo decodificación greedy en texto libre.
- Sin ajuste de seguridad ni RLHF: puede reproducir texto dañino o sesgado procedente de datos web.
- Idioma: solo inglés para lenguaje natural; no soporta otros idiomas.
- Contexto limitado a 1.024 tokens; posiciones superiores generan error.
- Licencia Apache 2.0 permite uso comercial, pero la propia model card desaconseja explícitamente cualquier uso que requiera respuestas correctas (médico, legal, financiero, seguridad o factual).
- No es compatible con ecosistemas estándar (`transformers`, vLLM, TGI, Ollama) sin trabajo de adaptación.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V2
- Base intermedia (2B tokens): https://huggingface.co/mvbalaji/ODYSSEY-100M-2B-BASE
- Base final (5B tokens): https://huggingface.co/mvbalaji/ODYSSEY-100M-5B-BASE
- SFT V1 (Fase 5): https://huggingface.co/mvbalaji/ODYSSEY-100M-REASONING-SFT-V1
- Experimental P7-C1 (SFT diverso en paráfrasis): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C1-DIVERSE-SFT
- Experimental P7-C2 (SFT de control emparejado): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C2-MATCHED-SFT
- Experimental P7-C3 (RL de respuesta exacta): https://huggingface.co/mvbalaji/ODYSSEY-100M-P7-C3-RL
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset matemático: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset de código: https://huggingface.co/datasets/codeparrot/github-code-clean
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp

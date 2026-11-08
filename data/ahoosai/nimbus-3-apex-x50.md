# AhoosAI/nimbus-3-apex-x50

## Resumen

Nimbus 3 Apex X50 es un adaptador LoRA de rango 64 publicado por AhoosAI para el modelo base Qwen/Qwen3-14B. No es un modelo completo, sino un conjunto de pesos PEFT que se aplica sobre el transformer denso de 14.000 millones de parametros de Qwen3, y que se distribuye tambien en formato GGUF para su uso directo con llama.cpp. El adaptador se libera a "media fuerza": `lora_alpha` vale 64 frente a un `r` de 64, cuando el entrenamiento original uso `lora_alpha` 128. Los pesos son los entrenados; solo cambia ese factor de escala.

Su relevancia es limitada y muy especifica. Segun las mediciones del propio autor, a esta intensidad el adaptador no supera a su base mas alla del ruido estadistico en ninguno de los cinco benchmarks ejecutados (identidad, IFEval, XSTest, TableBench y BFCL v4 de un solo turno). La propuesta explicita de AhoosAI es la contraria a la habitual: no busca mejorar Qwen3-14B, sino conservar su comportamiento preservando lo que ya sabia hacer. Es, por tanto, un artefacto de interes para quien quiera estudiar el efecto de adaptadores de baja intensidad o partir de un base con identidad propia sin degradar capacidades.

El contexto, la cuantizacion y los idiomas efectivos heredan los del modelo base Qwen3-14B; el adaptador anade un sesgo hacia ingles y persa en los datos de entrenamiento. La licencia es Apache-2.0, igual que la del base, cuyos pesos no se redistribuyen en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-14B; rango 64, `lora_alpha` 64 en publicacion (128 en entrenamiento) |
| Parametros totales | 256.901.120 en el adaptador (safetensors); el modelo base Qwen3-14B aporta sus propios 14B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-14B) |
| Tipos de cuantizacion | Adaptador en safetensors y GGUF; el base se usa en Q4_K_M en las pruebas del autor (QLoRA, entrenado en 4 bits) |
| Idiomas soportados | en, fa (segun tags y model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3-14B cuantizado en 4 bits, con LoRA de rango 64 y `lora_alpha` 128, aplicando PML-sRUN a partir del paso 600 aproximadamente. El conjunto de datos consta de 113.596 filas puntuadas, de las cuales 1.252 son de identidad y 6.900 agenticas. El entrenamiento recorrio 3.949 de los 4.521 pasos previstos (detenido manualmente) sobre 369.652.673 tokens, con una perdida en held-out de 0,5892, usando 2x T4.

X50, X75 y el no publicado X100 proceden de un unico entrenamiento y difieren solo en la intensidad de aplicacion del adaptador. El autor senala que a plena fuerza (X100) el adaptador aprendia su identidad pero perdia, mas alla del azar, en cuatro benchmarks (seguimiento de instrucciones, rechazos seguros, tablas y tool calls de un turno), por exceso de datos que ensenaban a Qwen3-14B lo que ya sabia. Las intensidades publicadas son aquellas en las que ese olvido desaparece (X50) o queda reducido a un benchmark (X75).

## Capacidades

- Generacion de texto y razonamiento heredados de Qwen3-14B, sin cambios medibles respecto al base a esta intensidad.
- Seguimiento de instrucciones: IFEval 90 frente a 89 del base (diferencia dentro del ruido, p = 1.000).
- Comportamiento seguro ante peticiones ambiguas: XSTest 72 frente a 69 (p = 0.629, ruido).
- Razonamiento tabular: TableBench 78 frente a 75 (p = 0.453, ruido).
- Tool calling de un solo turno: BFCL v4 84 frente a 82,5 (p = 0.607, ruido).
- Identidad propia practicamente ausente: 2,5 sobre 40 en preguntas de identidad, con 1 acierto de 40.
- Capacidades multilingues limitadas a lo que aporta el base; el adaptador se entreno con datos en ingles y persa.
- No se ejecutaron a esta intensidad Global-MMLU (persa), HumanEval+, MMLU-Pro, MATH-500 ni BFCL multi-turno.

## Casos de uso

- Evaluacion de adaptadores de baja intensidad: sirve como referencia controlada para estudiar cuanto cambia un modelo al aplicar un LoRA a media fuerza, con mediciones pareadas frente al base en llama.cpp.
- Despliegue sobre Qwen3-14B en produccion sin degradacion: cuando ya se opera el base y se quiere anadir un adaptador que, segun el autor, no rompe ninguna capacidad medida, se carga con `--lora` en llama-server.
- Investigacion sobre olvido catastrofico: el par X50/X75 permite comparar dos intensidades del mismo entrenamiento y observar donde aparece la perdida de capacidades.
- Experimentos de identidad de modelo: con 1 acierto de 40 en identidad, es util para medir la dificultad de inculcar un nombre propio mediante LoRA sin sacrificar rendimiento.
- Pruebas de tool calling en pipelines de agentes: BFCL v4 de un turno a 84 permite usar el adaptador como variante del base en entornos de function calling, siempre con validacion propia.
- Formacion y docencia: ejemplo documentado de QLoRA sobre 2x T4 con 369 millones de tokens, util para reproducir el flujo PEFT y la publicacion en GGUF.
- Analisis de sesgo en datos de identidad y agenticos: las 1.252 filas de identidad y 6.900 agenticas permiten estudiar como la composicion del dataset afecta al comportamiento final.

## Benchmarks y rendimiento

Mediciones del autor con llama.cpp, Qwen3-14B-Q4_K_M y el adaptador aplicado por el servidor, con las mismas preguntas, semillas y servidor en ambos brazos. p es un test de signos bilateral sobre las preguntas cuya respuesta cambio.

| Benchmark | Qwen3-14B | Nimbus 3 Apex X50 | Cambio | Corregidas | Rotas | p | Veredicto |
|---|---:|---:|---:|---:|---:|---:|---|
| Identidad (40) | 0 | 2,5 | +2,5 | 1 | 0 | 1.000 | ruido |
| IFEval (100) | 89 | 90 | +1 | 5 | 4 | 1.000 | ruido |
| XSTest (100) | 69 | 72 | +3 | 10 | 7 | 0.629 | ruido |
| TableBench (100) | 75 | 78 | +3 | 5 | 2 | 0.453 | ruido |
| BFCL v4, un turno (200) | 82,5 | 84 | +1,5 | 9 | 6 | 0.607 | ruido |

Global-MMLU (persa), HumanEval+, MMLU-Pro, MATH-500 y BFCL multi-turno no se ejecutaron a esta intensidad. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 256,9 millones de parametros y el repositorio ocupa 1,5 GB; el coste real de memoria lo determina el modelo base Qwen3-14B.
- Con el base en Q4_K_M, la inferencia cabe en GPUs de consumo con 12-16 GB de VRAM (por ejemplo, RTX 4070 Ti, RTX 4080, RTX 4090), segun el patron habitual de llama.cpp para un modelo de 14B en 4 bits.
- Para el base en precision completa (bf16), se necesitan aproximadamente 28 GB solo para pesos, lo que exige A100 40 GB, H100 o varias GPUs.
- Entrenamiento original: 2x T4 con QLoRA en 4 bits, lo que da una referencia de hardware minimo para reproducir o reajustar el adaptador.
- Despliegue: llama.cpp / llama-server con `--lora` y `--jinja`, o PEFT + transformers con `PeftModel.from_pretrained`. No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nimbus 3 Apex X50 | Adaptador 256,9M sobre Qwen3-14B | no disponible | IFEval 90, XSTest 72, TableBench 78, BFCL v4 84; sin diferencias significativas frente al base | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Nimbus 3 Apex X75 | Mismo adaptador a tres cuartos de fuerza | no disponible | El autor indica que conserva la identidad y solo pierde en un benchmark | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-14B | 14B densos | no disponible | IFEval 89, XSTest 69, TableBench 75, BFCL v4 82,5; base de referencia | Apache-2.0 | Hugging Face, safetensors y GGUF |

No se dispone de datos de benchmarks de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- A esta intensidad el adaptador no mejora al base de forma estadisticamente significativa en ningun benchmark; presentarlo como una mejora seria enganoso.
- La identidad propia es practicamente inexistente (1 acierto de 40), por lo que no debe usarse para fines de personalidad o marca.
- El autor advierte de que a plena fuerza (X100) el adaptador perdia capacidades en cuatro benchmarks; las intensidades publicadas son un compromiso, no una mejora.
- Varios benchmarks relevantes (HumanEval+, MMLU-Pro, MATH-500, BFCL multi-turno, Global-MMLU en persa) no se ejecutaron a esta intensidad; su comportamiento en codigo, matematicas y agentes multi-paso no esta medido.
- Los datos de entrenamiento se centran en ingles y persa; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion y sesgos: no documentados especificamente para el adaptador; hereda los del base Qwen3-14B.
- Licencia Apache-2.0, igual que el base; los pesos del base no se redistribuyen en este repositorio y deben obtenerse por separado.
- El modelo se publico con 0 descargas y 0 likes, sin validacion externa independiente; todas las cifras proceden del autor.
- El repositorio se creo y actualizo el 2026-11-08; no hay historial de versiones ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AhoosAI/nimbus-3-apex-x50
- Modelo hermano X75: https://huggingface.co/AhoosAI/nimbus-3-apex-x75
- Pagina completa con benchmarks del autor: https://ahoos-ai.site/news/int-pages/nimbus-3-apex.html
- Sitio de AhoosAI: https://ahoos-ai.site/
- Perfil de AhoosAI en Hugging Face: https://huggingface.co/AhoosAI
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- GGUF del base: https://huggingface.co/Qwen/Qwen3-14B-GGUF

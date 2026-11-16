# BeardedMonster/gemma-3-270m-translate-best

## Resumen

`gemma-3-270m-translate-best` es un modelo de traducción automática de inglés a 77 lenguas africanas, desarrollado por el usuario de Hugging Face BeardedMonster. Se construye mediante ajuste fino completo del modelo `google/gemma-3-270m-it` (268.098.176 parámetros reales según safetensors) y combina un entrenamiento supervisado inicial con una fase de aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) con una recompensa sin referencia ("reference-free"). El checkpoint publicado corresponde a la etapa final de RL (paso 1.433, fase 2c) de una familia de modelos experimentales denominada "Small but Sabi".

El modelo resuelve un problema concreto: la cobertura de traducción de calidad hacia lenguas africanas de bajos recursos, un ámbito donde los modelos multilingües generalistas suelen tener un rendimiento muy desigual. La arquitectura subyacente es la de Gemma 3 270M (18 capas, dimensión oculta 640, vocabulario de 262.144 tokens) y el modelo acepta únicamente inglés como lengua origen. La lengua destino se selecciona mediante una convención de etiqueta de texto en el prompt: se indica el nombre de la lengua en inglés y el modelo antepone una etiqueta de tres letras a la traducción.

Es relevante ahora porque demuestra que un modelo de solo 270M de parámetros puede alcanzar un chrF++ macro de 31,7 en FLORES+ devtest (45 lenguas, subconjunto "clean"), frente a 25,1 del modelo de partida SFT, aunque queda 3,1 puntos por debajo de NLLB-200-3.3B y 0,7 por debajo de NLLB-200-distilled-600M en las 44 lenguas compartidas. Se trata de un lanzamiento de investigación con licencia en estado de borrador y calidad reconocidamente inferior a NLLB-200 en varias lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 270M: 18 capas, hidden size 640) |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de entrenamiento de hasta ~1.000 tokens de origen; generación de documento completo fiable solo hasta ~512 tokens de origen |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 1,1 GB) |
| Idiomas soportados | inglés (origen) y 77 lenguas africanas destino (yor, hau, ibo, pcm, efi, twi, ewe, fon, wol, swh, kin, som, orm, amh, tir, lug, lin, zul, xho, afr, sna, nya, sot, tsn, mlg, ibb, urh, bem, tum, run, ven, tso, nso, ssw, nbl, sag, tiv, umb, kmb, mos, kik, luo, kam, bin, dag, oke, shi, dyu, bam, kbp, bbj, kon, kea, kab, nus, swc, lua, kqn, lun, iso, loz, wal, ach, tsc, vmw, kua, seh, nyn, her, yao, sid, ndc, kri, ish, dua, bas, wes) |
| Licencia | sabiyarn-open-output-v0.1-draft (borrador, no revisado por asesoría legal, no en vigor); sujeto además a los Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `google/gemma-3-270m-it`: un transformer decoder-only de 18 capas con dimensión oculta 640 y un vocabulario de 262.144 tokens. El ajuste fino es completo (no LoRA ni adaptadores) sobre el checkpoint instructivo de Gemma 3. La elección de un vocabulario tan amplio para un modelo de este tamaño responde a la arquitectura original de Gemma 3, no a una decisión específica de este ajuste.

El entrenamiento se estructura en dos fases: primero un ajuste supervisado (SFT) sobre pares de traducción inglés-lengua africana, y después una fase de RL con GRPO hasta el paso 1.433 (fase 2c), empleando una recompensa sin referencia y endurecida ("hardened reward"). El modelo se entrenó con ventanas de hasta aproximadamente 1.000 tokens de origen. La convención de prompt es estricta: un único turno de usuario con la forma `Translate the text to {Language}:  {english}` (dos espacios tras los dos puntos, sin mensaje de sistema) y el modelo responde con una etiqueta de tres letras seguida de la traducción. Esta familia de 270M usa etiquetas de texto; los modelos de 385M y 1B de la misma familia emplean 125 etiquetas `<iso>` de token único con un prompt distinto.

## Capacidades

- Traducción de inglés a 77 lenguas africanas, seleccionando la lengua destino por su nombre en inglés en el prompt.
- Salida con etiqueta de tres letras delante de la traducción (requiere post-procesado para eliminar la etiqueta).
- Decodificación greedy por defecto; el autor documenta que beam search de 4 haces mejora ligeramente el chrF++ (+0,66) y beam 8 (+0,74).
- No es un modelo conversacional: no mantiene diálogo multi-turno ni traduce hacia inglés ni entre lenguas africanas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento (thinking mode).
- Capacidad multilingüe limitada al eje inglés → lengua africana; no se documenta calidad en otras direcciones.

## Casos de uso

- Traducción de frases sueltas en aplicaciones de mensajería o atención al ciudadano: el modelo traduce oraciones de forma fiable con decodificación greedy y un presupuesto de 256 tokens nuevos, suficiente para mensajes cortos en lenguas como yoruba, hausa o suajili.
- Localización de contenidos breves (notificaciones, titulares, formularios) hacia lenguas africanas de bajos recursos: el modelo cubre 77 destinos, incluidos idiomas con muy poca representación en modelos generalistas, y su tamaño de 270M permite desplegarlo en infraestructura modesta.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible para estudiar el efecto del RL con GRPO sobre un modelo pequeño, ya que el autor publica checkpoints intermedios (SFT y cada etapa de RL) en el archivo privado `AletheiaAING/gemma-3-270m-translate-rl`.
- Pre-traducción asistida por humanos en ONG o medios locales: el modelo genera un borrador que un hablante nativo revisa, con la ventaja de que el chrF++ de 31,7 (clean) supera claramente al modelo SFT de partida (25,1), lo que reduce el esfuerzo de postedición.
- Traducción por lotes de frases en pipelines de datos: al ser un modelo de 270M, puede ejecutarse en GPU de consumo y procesar grandes volúmenes de oraciones cortas con decodificación greedy, dividiendo documentos largos en oraciones.
- Prototipado de sistemas de traducción en entornos con restricciones de hardware: cabe en GPUs de gama media y permite iterar sobre prompts y decodificación sin depender de infraestructura de gran escala.
- Evaluación comparativa frente a NLLB-200: útil para medir brechas de calidad por lengua y decidir en qué idiomas conviene recurrir a NLLB-200 y en cuáles este modelo es suficiente.

## Benchmarks y rendimiento

Resultados publicados por el autor en FLORES+ devtest, inglés → X, decodificación greedy, 45 lenguas, 48 frases por lengua:

| Conjunto | Metrica | Este modelo (RL-final) | Modelo SFT de partida |
|---|---|---|---|
| clean (frase inglesa nunca vista en SFT) | macro chrF++ | 31,7 | 25,1 |
| no_pair (par de referencia no visto en SFT) | macro chrF++ | 34,1 | 28,7 |

Comparación con NLLB-200 en las 44 lenguas compartidas: el modelo queda 3,1 chrF++ (clean) y 3,8 (no_pair) por debajo de NLLB-200-3.3B, y 0,7 (clean) y 1,7 (no_pair) por debajo de NLLB-200-distilled-600M.

Estudio de decodificación (20 lenguas × 200 frases, presupuesto de 320 tokens): greedy 32,52 chrF++; beam 4 33,18; beam 8 33,26. La penalización por repetición de 1,1 reduce el chrF++ en 1,48 y `no_repeat_ngram_size` 3 en 1,06; el muestreo con temperatura es peor que greedy.

Generación de documento completo (tasa de finalización / tasa de bucles por bin de longitud de origen): b64 98 % / 0 %; b256 97 % / 1 %; b512 92 % / 13 %; b1024 65 % / 53 %; b2048 42 % / 73 %; b4096 31 % / 73 %.

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268M parámetros, en bfloat16 los pesos ocupan aproximadamente 0,54 GB; el repo completo pesa 1,1 GB. La VRAM total dependerá del backend y de la longitud de secuencia, pero es muy reducida.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el autor usa `device_map="auto"` con `torch_dtype=torch.bfloat16`. Funciona en A100, H100, RTX 4090 y GPUs de gama media.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama baja con suficiente VRAM para el contexto.
- Opciones de despliegue: la model card documenta `transformers` (`AutoModelForCausalLM`); los tags incluyen `text-generation-inference` y `endpoints_compatible`. No se documentan instrucciones para llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (FLORES+ devtest, 44 lenguas compartidas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-270m-translate-best | 268M | entrenamiento ~1.000 tokens origen; documento completo fiable hasta ~512 | 31,7 chrF++ (clean) / 34,1 (no_pair) | sabiyarn-open-output-v0.1-draft (borrador) + Gemma Terms | Hugging Face, safetensors |
| NLLB-200-3.3B | 3.300M | no disponible | 3,1 chrF++ (clean) / 3,8 (no_pair) por encima de este modelo | no disponible en la información | no disponible en la información |
| NLLB-200-distilled-600M | 600M | no disponible | 0,7 chrF++ (clean) / 1,7 (no_pair) por encima de este modelo | no disponible en la información | no disponible en la información |
| gemma-3-270m-science-translate-best | 270M | no disponible | no disponible | misma familia (borrador) | Hugging Face (variante de dominio científico) |

## Limitaciones y advertencias

- Licencia en estado de borrador: `sabiyarn-open-output-v0.1-draft` no ha sido revisada por asesoría legal y no está en vigor; además, el modelo deriva de Gemma 3 y queda sujeto a los Gemma Terms of Use.
- Varias fuentes de entrenamiento son no comerciales o de licencia no declarada, según la propia model card, lo que condiciona el uso comercial.
- Calidad inferior a NLLB-200 en varias lenguas: 3,1 chrF++ por debajo de NLLB-200-3.3B y 0,7 por debajo de NLLB-200-distilled-600M en las 44 lenguas compartidas.
- Solo traduce desde inglés; no traduce hacia inglés ni entre lenguas africanas, y no es un modelo conversacional.
- Riesgo de bucles y repeticiones en textos largos: la generación de documento completo falla en el 53 % de los documentos de 1.024 tokens de origen y en el 73 % de los de 2.048 y 4.096; se recomienda dividir en oraciones.
- El beam search produce bucles con más frecuencia que greedy en algunas lenguas (nuer, kabiye); el autor recomienda beam 4 con fallback a greedy si la salida está inacabada, repetitiva o vacía.
- Las penalizaciones por repetición y frecuencia degradan la calidad medida (penalización 1,1: −1,48 chrF++; `no_repeat_ngram_size` 3: −1,06); no se recomienda `frequency_penalty`.
- Riesgo de alucinación y de sesgos: no se documentan evaluaciones específicas de sesgo ni de fidelidad semántica más allá de chrF++.
- Es un lanzamiento de investigación preliminar ("Small but Sabi", paper en preparación); el autor advierte que la calidad está muy por debajo de NLLB-200 en varias lenguas.
- El modelo fue publicado anteriormente como `BeardedMonster/gemma-3-270m-translate-rl2c` (rama `latest`), lo que puede generar confusión sobre la versión canónica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/gemma-3-270m-translate-best
- Licencia (borrador): https://huggingface.co/BeardedMonster/gemma-3-270m-translate-best/blob/main/LICENSE_DRAFT.md
- Variante de dominio científico: https://huggingface.co/BeardedMonster/gemma-3-270m-science-translate-best
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Archivo de checkpoints intermedios (privado): AletheiaAING/gemma-3-270m-translate-rl
- Paper, blog o demo: no disponible en la información proporcionada.

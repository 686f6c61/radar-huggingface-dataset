# ramgpt/Jev_Qwen3.8-27B-GGUF

## Resumen
Jev_Qwen3.8-27B-GGUF es una conversión a formato GGUF del modelo SargeDev/Jev_Qwen3.8-27B, publicada por el usuario ramgpt. El modelo fuente es un Qwen3.8 de 27B (26.895.998.464 parámetros reales) ajustado para emitir juicios calibrados con confianza explícita y menos hedging, según la model card. La única cuantización disponible es Q4_K_M, de aproximadamente 15,8 GiB y 4,92 bits por peso, validada en llama.cpp bd4f514 sobre una RTX 4090.

El modelo fue entrenado con thinking desactivado, por lo que el autor recomienda usar reasoning off para reproducir el comportamiento ajustado. Su interés actual reside en aplicaciones de decisión local: frente a su base Huihui-Qwen3.8-27B-abliterated, muestra mejor Brier score (0,1471 frente a 0,2703) y mejor exactitud argmax (68,9% frente a 53,3%) en un A/B de 90 filas, aunque con caveats importantes sobre la generalización.

La licencia del repositorio es Apache-2.0. No se proporcionan datos de contexto máximo, idiomas soportados, sesgos ni benchmarks estándar.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información; metadatos qwen3.8/qwen3.5 y conversión GGUF para llama.cpp |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (4,92 BPW; ~15,8 GiB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| ID | ramgpt/Jev_Qwen3.8-27B-GGUF |
| Autor | ramgpt |
| Modelo base | SargeDev/Jev_Qwen3.8-27B |
| Descargas | 10 |
| Likes | 0 |
| Pipeline | No disponible |

## Arquitectura y entrenamiento
Se trata de una conversión de pesos, no de un entrenamiento nuevo. El modelo fuente SargeDev/Jev_Qwen3.8-27B parte a su vez de huihui-ai/Huihui-Qwen3.8-27B-abliterated y se ha ajustado sobre SargeDev/jev-distill-corpus-v3. La model card indica que el modelo fuente fue entrenado con thinking desactivado y que su objetivo es producir juicios calibrados breves, con confianza explícita y menos hedging que el modelo base.

Detalle técnico de conversión: la configuración fuente declara mtp_num_hidden_layers: 1, pero los pesos publicados contienen 64 bloques principales (blk.0 a blk.63) y no tensores MTP/NextN. Una conversión normal anuncia 65 bloques y falla en llama.cpp al no encontrar blk.64.*. Este GGUF se convirtió con llama.cpp bd4f514 usando --no-mtp para generar un modelo de 64 bloques. No se detallan número de tokens de entrenamiento, composición completa del dataset ni si hubo RLHF/DPO.

## Capacidades
- Generación de texto conversacional.
- Juicios calibrados breves con confianza explícita.
- Decisiones de tipo noul, choice y score, según el A/B de calibración.
- Emite probabilidades; puede producir JSON, pero el cumplimiento estricto de JSON es menor que el del base porque a veces antepone "My calibrated probability:".
- Modo thinking: entrenado con thinking desactivado; se recomienda reasoning off.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio, matemáticas o código: no disponible en la información.

## Casos de uso
- Decisiones binarias con confianza calibrada: útil para decidir entre dos opciones (tipo noul) usando la probabilidad explícita que declara el modelo.
- Clasificación multiclase: en tareas de tipo choice, el modelo asigna probabilidades a cada clase; aplicable a enrutado de tickets o etiquetado con umbral de confianza.
- Scoring de riesgo: genera puntuaciones calibradas (tipo score) para priorizar casos en colas de revisión manual.
- Asistente local de baja latencia: desplegado con llama.cpp en una RTX 4090, reasoning off, para respuestas concisas con nivel de confianza.
- Investigación en calibración: comparar Brier score, ECE y overconfidence gap frente a modelos base en dominios concretos.
- Triaje en producción con post-procesado: usar sus probabilidades como señal, aplicando suavizado si aparecen 0.0 exactos y validando el JSON antes de consumirlo.
- Sistemas de decisión auditables: registrar la confianza declarada para justificar decisiones automáticas ante revisores.
- Prototipos offline: inferencia local sin APIs externas gracias al formato GGUF y a la licencia Apache-2.0.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye un A/B de calibración frente al modelo base exacto, huihui-ai/Huihui-Qwen3.8-27B-abliterated, usando la misma clase Q4_K_M, llama.cpp bd4f514, reasoning off, temperatura 0 y prompts idénticos. La muestra principal contiene 90 filas retenidas de SargeDev/jev-distill-corpus-v3/test_set_30k: 30 noul, 30 choice y 30 score.

| Métrica | Huihui base | Jev |
|---|---:|---:|
| Brier score (menor es mejor) | 0,2703 | 0,1471 |
| Exactitud argmax | 53,3% | 68,9% |
| Overconfidence gap (menor es mejor) | +0,208 | +0,012 |
| Soft ECE-10 (menor es mejor) | 0,208 | 0,085 |
| Top-class Brier (menor es mejor) | 0,1138 | 0,0642 |

Delta pareado de Brier (Jev - base): -0,1232; IC bootstrap del 95% [-0,1905, -0,0678]. Jev tuvo menor error en 60 filas, empate en 9 y peor en 21. En desacuerdos de argmax, 19 filas fueron correctas solo para Jev frente a 5 solo para el base (McNemar exacto p = 0,0066).

| Tipo | Brier Huihui | Brier Jev |
|---|---:|---:|
| noul | 0,2708 | 0,1280 |
| choice | 0,3480 | 0,1791 |
| score | 0,1921 | 0,1343 |

## Requisitos de hardware
- VRAM: solo pesos ~15,8 GiB en Q4_K_M. Con contexto 4096 y overhead de llama.cpp, se recomienda una GPU con 24 GB o más para tener margen; una GPU de 16 GB probablemente no sea suficiente por el peso más la caché KV.
- GPU validada: RTX 4090, según la model card, con -ngl 999 -c 4096.
- GPU recomendadas: RTX 4090/3090 de 24 GB, A100 de 40/80 GB, H100 de 80 GB. En consumer, 24 GB es el mínimo práctico.
- Opciones de despliegue: llama.cpp bd4f514 (validado). No se confirman vLLM, Ollama, TGI u otros runners.
- Latencia y throughput: no disponibles.
- Comando de ejemplo: `llama-cli -m Jev_Qwen3.8-27B-Q4_K_M.gguf -ngl 999 -c 4096 --reasoning off`

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ramgpt/Jev_Qwen3.8-27B-GGUF | ~26,9 B | No disponible | GGUF Q4_K_M | Apache-2.0 | HuggingFace |
| SargeDev/Jev_Qwen3.8-27B | No disponible | No disponible | Pesos originales | No disponible | HuggingFace (modelo fuente) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~27 B (según nombre) | No disponible | No disponible | No disponible | HuggingFace (base) |

La comparativa se limita a estos modelos porque la información proporcionada no incluye otras alternativas de la misma categoría con datos verificables.

## Limitaciones y advertencias
- La ventaja de calibración no es universal: mucha de la distribución objetivo yuri_v3 se destiló de Jev 1.13, por lo que Jev tiene ventaja de profesor de la misma familia.
- En un sanity check balanceado por fuente, la mejora de Brier fue 0,3216 a 0,2353, pero el IC pareado del 95% quedó solo justo por debajo de cero.
- openjev_v2 por sí solo no mostró una ventaja clara.
- Jev asigna probabilidad exacta 0.0 con más frecuencia que el base; esto puede perjudicar gravemente KL/log-loss cuando la masa objetivo no es cero.
- El suavizado uniforme exploratorio mejoró Brier y log-loss en la evaluación, pero se inspeccionó sobre datos de evaluación; no es un ajuste recomendado.
- Jev a menudo antepone frases como "My calibrated probability:" antes de un JSON por lo demás válido, por lo que el cumplimiento estricto de JSON es menor que el del base.
- El modelo fuente se entrenó con thinking desactivado; usar reasoning on puede alejarse del comportamiento ajustado.
- La conversión requiere --no-mtp; una conversión estándar anuncia 65 bloques y falla en llama.cpp.
- Solo hay una cuantización publicada: Q4_K_M.
- No se documentan sesgos, idiomas, contexto máximo ni riesgos de alucinación específicos.
- El modelo base es una versión abliterated de Huihui, lo que puede implicar menor alineación de seguridad; no se detalla en la model card.
- La licencia del repositorio GGUF es Apache-2.0; hay que verificar las licencias del modelo fuente, del base y del dataset antes de uso comercial.

## Enlaces
- https://huggingface.co/ramgpt/Jev_Qwen3.8-27B-GGUF
- https://huggingface.co/SargeDev/Jev_Qwen3.8-27B
- https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3/tree/main/test_set_30k
- https://github.com/ggml-org/llama.cpp
- No se proporcionan papers, blogs o demos adicionales en la información disponible.

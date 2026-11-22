# dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched

## Resumen

El modelo `semsimula-ladder-owt-d384-l2-gpt2-matched` es un transformer GPT-2 de referencia ("matched baseline") desarrollado por el autor independiente dimitarpg13 dentro de un estudio de ablación de mecanismos denominado SemSimula. No es un modelo pensado para uso productivo, sino una pieza de control experimental: sirve como punto de comparación contra cuatro variantes de una arquitectura física-informada (Fock-PARFLM) que integran un sistema mecánico amortiguado en el espacio semántico con campos de intercambio y potenciales escalares.

El modelo tiene 384 dimensiones de embedding y 2 capas, y se ha entrenado exactamente con 532.480.000 tokens de OpenWebText (32.500 pasos × batch 32 × bloque 512), el mismo presupuesto que todas las demás ramas del estudio. Esta igualdad de presupuesto es clave: cualquier diferencia de perplejidad entre las ramas del ladder aísla el efecto de un mecanismo concreto, no una diferencia de cómputo o de datos.

Su relevancia es metodológica: el autor documenta públicamente predicciones pre-registradas, retira explicaciones que los datos no sostienen y publica las cinco ramas con sus perplejidades asentadas. Es un ejemplo de ciencia abierta y reproducible en el ámbito de arquitecturas alternativas al transformer estándar, pero no un modelo destinado a despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-2 (baseline de referencia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (librería `pytorch`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer GPT-2 estándar con dimensión de modelo d=384 y L=2 capas. El autor lo describe como "un transformer plano": la convención de gradiente que cambia en la Generación 2 de su estudio no le afecta, por lo que el mismo checkpoint sirve de ancla para las Generaciones 2 y 3 del ladder. La longitud de bloque es de 512 tokens.

El entrenamiento se realizó sobre OpenWebText (dataset `Skylion007/openwebtext`) con un presupuesto fijo de 532.480.000 tokens: 32.500 pasos con batch de 32 y bloque de 512. Todas las ramas del estudio comparten corpus, tokenizador y lotes de validación, de modo que las diferencias de perplejidad son atribuibles al mecanismo ablacionado y no al presupuesto de entrenamiento. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición fina del dataset más allá del corpus OpenWebText.

## Capacidades

- Generación de texto autorregresiva en inglés, limitada por su tamaño (d=384, 2 capas).
- Modelo de investigación: su función es servir de baseline en una ablación de mecanismos, no resolver tareas de usuario final.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe no disponible: solo se declara inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos de ablación arquitectónica: sirve como rama de control frente a las variantes Fock-PARFLM del mismo ladder, con idéntico presupuesto de tokens y mismo corpus.
- Verificación de resultados pre-registrados: permite recomputar la perplejidad de validación (49,81) y contrastar la metodología del estudio.
- Docencia sobre diseño experimental en ML: ilustra cómo aislar el efecto de un mecanismo manteniendo constante el presupuesto de entrenamiento (532.480.000 tokens).
- Estudio de arquitecturas alternativas al transformer: punto de partida para comparar transformers planos con modelos energía-basados o informados por física.
- Investigación sobre lenguaje a pequeña escala: con 2 capas y d=384, es viable entrenar y evaluar variantes en hardware modesto.
- Análisis de perplejidad en OpenWebText: referencia numérica para calibrar otros modelos pequeños entrenados sobre el mismo corpus y tokenizador.

## Benchmarks y rendimiento

| Modelo (rama del ladder) | Mecanismo eliminado | PPL asentada (bloque 512) | Ratio vs GPT-2 |
|---|---|---:|---:|
| Matched GPT-2 baseline (este modelo) | arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM, exchange field on | el transformer | 63,51 | 1,275× |
| Fock-PARFLM, exchange field as a potential | parte no conservativa del campo de intercambio | 80,90 | 1,624× |
| Fock-PARFLM, no exchange field | el campo de intercambio | 66,98 | 1,345× |
| Conservative-only control (Fock off) | el mecanismo Fock (ruta registro-token) | 87,93 | 1,765× |

La perplejidad de validación de este modelo es 49,81, definida como la media de las tres últimas evaluaciones de 500 pasos en bloque 512 ("settled"). El autor indica `verified: false` en la model-index. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,3 GB, lo que sugiere un modelo muy pequeño que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no documentadas. Por tamaño, cualquier GPU con unos pocos GB de VRAM sería suficiente; no se especifican modelos concretos.
- GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque el autor no lo confirma.
- Opciones de despliegue: el modelo se publica con librería `pytorch`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semsimula-ladder-owt-d384-l2-gpt2-matched (este) | no disponible (d=384, L=2) | 512 | 49,81 | CC BY 4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-attention | no disponible (d=384, L=2) | 512 | 63,51 | no disponible en la información | Hugging Face |
| semsimula-ladder-owt-d384-l2-none | no disponible (d=384, L=2) | 512 | 66,98 | no disponible en la información | Hugging Face |
| semsimula-ladder-owt-d384-l2-none-norc | no disponible (d=384, L=2) | 512 | 87,93 | no disponible en la información | Hugging Face |

Las alternativas comparables más directas son las otras ramas del mismo ladder, ya que comparten corpus, tokenizador, presupuesto (532.480.000 tokens) y configuración d=384/L=2. No se dispone de comparación con GPT-2 de tamaño equivalente fuera del estudio.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final.
- Tamaño muy reducido (d=384, 2 capas): capacidad lingüística limitada y alta probabilidad de texto incoherente fuera de dominios simples.
- Solo inglés: no se declara soporte de otros idiomas.
- Contexto de 512 tokens: insuficiente para conversaciones multi-turno largas o documentos extensos.
- Riesgo de alucinación: no evaluado en la información disponible; previsiblemente alto por escala y datos.
- Sesgos: no documentados; OpenWebText hereda los sesgos del contenido web filtrado por enlaces de Reddit.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el autor no ofrece garantías ni soporte.
- El propio autor retira explicaciones previas sobre el efecto de la conservatividad y del mecanismo Fock; la colección se declara "superseded" en lugar de corregida, lo que afecta a la interpretación de resultados de generaciones anteriores.
- La métrica de perplejidad figura como no verificada (`verified: false`) en la model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Rama Fock-PARFLM, exchange field on: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Rama Fock-PARFLM, exchange field as a potential: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Rama Fock-PARFLM, no exchange field: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Rama Conservative-only control (Fock off): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

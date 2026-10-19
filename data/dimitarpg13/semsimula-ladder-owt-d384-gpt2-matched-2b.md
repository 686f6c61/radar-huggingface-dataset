# dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b

## Resumen

El modelo semsimula-ladder-owt-d384-gpt2-matched-2b es un transformer decoder-only de tipo GPT-2 con dimensión de modelo d=384, publicado por el autor dimitarpg13 dentro del proyecto de investigación SemSimula. No es un modelo orientado a producción, sino un baseline emparejado ("matched") que sirve de referencia para la familia de modelos Fock de tercera generación entrenados con un presupuesto de 2.000 millones de tokens sobre OpenWebText. Su función es fijar una curva de perplejidad a igualdad de tokens, arquitectura y schedule de learning rate, contra la que se contrastan los modelos del estudio de ablación de mecanismos.

El entrenamiento cubre 2.129.920.000 tokens vistos (130.000 pasos × batch 32 × 512 tokens), lo que equivale a unos 63 tokens por parámetro según la propia model card, con un pool de OpenWebText de 2,0B tokens muestreado con reemplazo (~1,07 pasadas efectivas). La ejecución se completó en una sesión de 10,75 horas sobre una A100-40GB (0,30 s/paso), con 260 evaluaciones y sin picos de pérdida, bajo un protocolo pre-registrado de cuatro hipótesis.

Alcanza una perplejidad de validación de 42,69 en OpenWebText (bloque de 512 tokens), lo que supone una mejora del 11,7% frente a la misma arquitectura y schedule entrenada con 0,53B tokens (48,37) y del 14,3% frente a la referencia publicada de 0,53B con schedule coseno (49,81). La mayor parte de la ganancia final procede de la fase de decaimiento del learning rate.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2, d=384; número de capas no declarado explícitamente para este modelo (la referencia de la que deriva usa el identificador `l2`, lo que sugiere 2 capas) |
| Parametros totales | ~34 millones (derivado de la model card: 2,13B tokens ÷ 63 tokens por parámetro) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; entrenamiento y evaluación con bloques de 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`); checkpoints con estado del optimizador eliminado |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la arquitectura GPT-2 a escala reducida (d=384). La model card indica que es "el mismo GPT-2" que la referencia de 0,53B tokens, cuyo identificador incluye `l2`. El modelo se define en la celda 3 del notebook self-contained `colab_matched_gpt2_baseline_openwebtext.ipynb` y se distribuye como pesos PyTorch (`.pt`), no como safetensors ni GGUF. No se detalla en la información proporcionada el número de cabezas de atención ni la composición exacta de los bloques.

El entrenamiento usa OpenWebText (pool de 2,0B tokens, ventanas aleatorias de 512 con reemplazo, ~1,07 pasadas efectivas), 130.000 pasos con batch 32 × 512 y un schedule WSD: warmup lineal del 5% (hasta el paso 6.500), learning rate pico de 1,2e-3 mantenido hasta el 65% (paso 84.500) y decaimiento coseno hasta 6e-05. No se reporta RLHF, DPO ni ajuste por instrucciones: es un modelo de lenguaje base. Como innovación metodológica, todo el protocolo está pre-registrado (cuatro llamadas), y se documenta la "decay gain" (ln de la perplejidad al final de la fase constante dividida por la perplejidad settled), que resultó de 0,371 nats frente a los 0,338 anticipados, incumpliendo una de las cuatro hipótesis.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, sin ajuste por instrucciones).
- Modelado de lenguaje y evaluación de perplejidad sobre OpenWebText con bloques de 512 tokens.
- Punto de referencia (baseline) para comparaciones controladas en estudios de ablación de mecanismos.
- Reproducibilidad de un protocolo pre-registrado con checkpoints intermedios (paso 25.000 y paso 130.000) y log completo por paso y por evaluación.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo está declarado únicamente para inglés.

## Casos de uso

- Investigación sobre eficiencia de entrenamiento: usar la curva de perplejidad a 0,53B y 2,13B tokens para medir cómo escala la pérdida con el presupuesto de cómputo en arquitecturas pequeñas (d=384).
- Estudio de schedules de learning rate: comparar directamente WSD (pico 1,2e-3) frente a coseno (pico 6e-04) a igualdad de 0,53B tokens, usando las cifras 48,37 y 49,81 respectivamente.
- Ablación de mecanismos: servir de baseline contra el que se contrastan los modelos de la familia Fock de 2B tokens en la colección SemSimula Gen 3.
- Reproducibilidad de resultados pre-registrados: re-ejecutar el notebook publicado (`colab_matched_gpt2_baseline_openwebtext.ipynb`) y verificar la perplejidad settled de 42,69 dentro del rango pre-registrado [41,0; 45,5].
- Docencia y divulgación: ejemplo autocontenido y de bajo coste (~0,3 GB de repo, 10,75 h en A100) para ilustrar el efecto del decaimiento del learning rate en modelos GPT-2 pequeños.
- Referencia para comparaciones de perplejidad en OpenWebText: cualquier investigador que entrene un modelo con d=384 y 2B tokens sobre este corpus puede contrastar directamente contra 42,69.
- Análisis de la "decay gain": estudiar por qué a mayor presupuesto de tokens la fase constante deja más margen al decaimiento (0,371 nats frente a 0,338 a 0,53B), fenómeno relevante para diseñar schedules en modelos de mayor escala.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Modelo | Tokens | PPL validación (bloque 512) | Mejora de este modelo frente a él |
|---|---:|---:|---:|
| **Este modelo** (WSD, pico 1,2e-3) | 2,13B | **42,69** | — |
| Mismo modelo, mismo schedule, 0,53B tokens (W2) | 0,53B | 48,37 | −11,7% |
| Referencia publicada 0,53B (coseno, pico 6e-04) | 0,53B | 49,81 | −14,3% |

Curva de entrenamiento (selección de la model card):

| Paso | Tokens | PPL validación | Fase |
|---:|---:|---:|---|
| 6.500 | 0,11B | 92,99 | fin de warmup |
| 21.000 | 0,34B | 68,01 | constante |
| 32.500 | 0,53B | 64,97 | constante |
| 50.000 | 0,82B | 63,17 | constante |
| 84.500 | 1,38B | 61,84 | fin de la fase constante |
| 100.000 | 1,64B | 57,66 | decaimiento |
| 120.000 | 1,97B | 45,92 | decaimiento |
| 130.000 | 2,13B | 42,68 | fin |

Notas: "settled PPL" es la media de las tres últimas evaluaciones (42,68; 42,70; 42,68). La fase constante apenas mejora un 4,8% entre 0,53B y 1,38B tokens; prácticamente toda la ganancia final (0,371 nats) se produce en el decaimiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Entrenamiento: una única A100-40GB, 10,75 horas, 0,30 s por paso, en una sesión de Colab ininterrumpida.
- VRAM de inferencia: no disponible de forma explícita; por el tamaño declarado del repo (0,3 GB, incluyendo varios checkpoints) y los ~34M de parámetros derivados, el modelo cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM para inferencia; A100-40GB para reproducir el entrenamiento.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: los pesos se distribuyen como `.pt` de PyTorch y el modelo se define en la celda 3 del notebook, por lo que el despliegue directo requiere cargar el checkpoint con PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no publicarse en safetensors ni GGUF, sería necesaria una conversión previa.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada. Sí se conoce el coste de entrenamiento (0,30 s/paso con batch 32 × 512).

## Comparativa con modelos similares

| Modelo | Tokens | PPL (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| semsimula-ladder-owt-d384-gpt2-matched-2b (este modelo) | 2,13B | 42,69 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-gpt2-matched (W2) | 0,53B | 48,37 | no disponible | Hugging Face |
| Referencia publicada 0,53B (coseno, pico 6e-04) | 0,53B | 49,81 | no disponible | Hugging Face |
| semsimula-ladder-owt-d384-l2-attention | no disponible | no disponible | no disponible | Hugging Face |
| semsimula-ladder-owt-d384-l2-attention-potential | no disponible | no disponible | no disponible | Hugging Face |

No se especifican en la información proporcionada comparaciones con modelos externos al proyecto (por ejemplo, GPT-2 small de OpenAI o alternativas de ~34M de parámetros). Las variantes `attention` y `attention-potential` forman parte del mismo ladder de ablación de mecanismos, pero sus perplejidades no se detallan en los resultados disponibles.

## Limitaciones y advertencias

- Modelo base de investigación: no está ajustado por instrucciones ni alineado, por lo que no es apto para uso conversacional directo en producción.
- Solo declara inglés; no se garantiza calidad en otros idiomas.
- Entrenado sobre OpenWebText (texto web sin curación fina): hereda los sesgos, toxicidad y errores factuales del corpus.
- Ventana efectiva de entrenamiento y evaluación de 512 tokens; usos que requieran contextos más largos quedan fuera del régimen validado.
- Riesgo de alucinación alto por tratarse de un modelo base sin RLHF ni DPO.
- Resultados no verificados de forma independiente (`verified: false` en el model-index); todas las cifras proceden del propio autor.
- Una de las cuatro hipótesis pre-registradas no se cumplió (la decay gain resultó 0,371 nats, superior a los 0,338 anticipados), lo que conviene tener en cuenta al interpretar el diseño metodológico.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos exactos antes de redistribuir derivados.
- La fecha de creación registrada en Hugging Face es 2026-10-19, dato tal cual aparece en el repositorio.
- No hay información sobre cuantizaciones publicadas ni sobre conversión a formatos de despliegue estándar (GGUF, safetensors).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b
- Referencia 0,53B (W2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Variante `attention`: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Colección Gen 3 (2B tokens): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-2b-training-tokens-6ad56f3d2a560dd121e59b60
- Colección Gen 3 (ladder 0,53B): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Repositorio del paper (artefactos de reproducibilidad): https://github.com/dimitarpg13/semsimula-paper
- Protocolo `Depth_Ladder_and_Matched_Baseline_Protocol.md`: https://github.com/dimitarpg13/semsimula-paper/blob/main/ (ruta exacta truncada en la información disponible)
- Registro en free2aitools (variante attention-potential): https://free2aitools.com/model/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential

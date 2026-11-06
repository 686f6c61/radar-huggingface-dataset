# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25

## Resumen

semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25 (SO-CODE-VTLR) es un modelo de lenguaje de investigación no transformador, sin atención, desarrollado por dimitarpg13 dentro de la colección "semsimula" (generación 3, estudio de ablación "ladder" sobre pozos muertos en el banco de potenciales V_θ). Se trata de un control experimental: es el modelo SO-CODE reentrenado con la tasa de aprendizaje del potencial escalar V_θ reducida a un cuarto (× 0.25), manteniendo exactamente la misma arquitectura y el mismo número de parámetros (76.572.109). Su propósito es demostrar que la ralentización de V_θ es una corrección del problema de "pozos muertos", no una mejora general, y que un sexto canal de contexto no aporta nada en código.

El modelo se entrena sobre CodeParrot clean (Python) con un presupuesto de 315.392.000 tokens y alcanza una perplejidad de validación asentada de 6,09 en bloque 512, un 1,6 % peor que el baseline SO-CODE (6,00). El estudio es pre-registrado: las hipótesis VT1 a VT4 se propusieron antes del entrenamiento y las cuatro resultaron acertadas. Es relevante como pieza de evidencia en la investigación de modelos conservativos basados en mecánica lagrangiana y espacio de Fock (PARFLM), una alternativa a los transformadores con memoria de inferencia constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformador, sin atención; modelo de lenguaje conservativo con potencial escalar V_θ y mecánica lagrangiana (PARFLM, espacio de Fock, geodésicas riemannianas/métrica de Jacobi) |
| Parametros totales | 76.572.109 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Bloque de 512 tokens (evaluación a block 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (código Python) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (repo de 0,3 GB; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia semsimula de modelos conservativos (conservative language models): en lugar de autoatención, emplea un potencial escalar V_θ compartido (banco de pozos) sobre canales de contexto, con dinámica integrada mediante esquemas de mecánica estadística (se mencionan CFC y BAOAB en los tags) y una interpretación geométrica vía geodésicas riemannianas y métrica de Jacobi. Es un modelo energy-based y physics-informed, con inferencia de memoria constante. Esta variante usa cinco canales de contexto y dos capas (según el identificador d384-l2), sin normalización (norc) y con semilla de aleatoriedad 2 (sr2).

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean train, con un calendario WSD de 16.250 pasos seguido de 3.000 pasos a la tasa de aprendizaje mínima. La única diferencia con el baseline SO-CODE es el optimizador: la tasa de aprendizaje de V_θ se multiplica por 0,25. Todos los modelos de la escalera parten del paso 0 con semilla 0 sobre los mismos lotes, lo que permite evaluaciones emparejadas paso a paso. El run fue saludable: 19.250 pasos en 5,98 horas en una sola sesión, 0 activaciones del watchdog, mediana de norma de gradiente 0,49 tras el paso 2.000 y monitor de fuga SCAF limpio en las 4 auditorías.

## Capacidades

- Generacion de texto en codigo Python (pipeline text-generation), entrenado sobre CodeParrot clean.
- Modelado de lenguaje con perplejidad de validacion asentada de 6,09 en bloque 512.
- Inferencia con memoria constante (constant-memory-inference) al carecer de mecanismo de atencion.
- Pozos de potencial de capa 1 vivos: ratio de pozo mas cercano como maximo 1,03 en siete checkpoints, con coste de eliminacion de +272 %.
- No hay evidencia publicada de tool calling, agentes, capacidades multilingues, vision ni audio.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformador: sirve como control experimental para estudiar el efecto de la tasa de aprendizaje del potencial escalar V_θ en modelos conservativos.
- Estudio de fallos de entrenamiento ("pozos muertos"): permite analizar como un banco de potenciales puede perder gradiente cuando los pozos se alejan de los estados, y validar correcciones.
- Modelado de lenguaje sobre codigo Python en entornos de investigacion: puede generar y puntuar codigo Python con perplejidad medible sobre CodeParrot.
- Reproduccion de experimentos pre-registrados: el protocolo, las hipótesis (VT1–VT4) y las evaluaciones emparejadas paso a paso lo hacen util como referencia metodologica.
- Comparacion de eficiencia de memoria en inferencia: al ser attention-free con memoria constante, es util para estudiar perfiles de memoria frente a transformadores equivalentes.
- Docencia y divulgacion de modelos physics-informed: ilustra la aplicacion de mecanica lagrangiana, espacio de Fock y geometria riemanniana al modelado de lenguaje.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Text-generation | CodeParrot clean (Python), split validation | Perplejidad (bloque 512, asentada, media de las tres ultimas evaluaciones de 500 pasos en el bloque 512) | 6,0882 |

Comparativa dentro del estudio (perplejidad asentada, del model card):

| Modelo | Canales de contexto | LR de V_θ | Pozos capa 1 | Perplejidad asentada | Frente a SO-CODE |
|---|---:|---:|---|---:|---:|
| SO-CODE (baseline) | 5 | × 1 | vivos | 6,00 | — |
| XI6-CODE (no en el Hub) | 6 | × 1 | muertos | 8,55 | +42,6 % |
| Screen B (fix) | 6 | × 0,25 | vivos | 5,98 | −0,3 % |
| SO-CODE-VTLR (este modelo, control) | 5 | × 0,25 | vivos | 6,09 | +1,6 % |
| Screen A (fix, norma unitaria) | 6 | × 1 | vivos | 5,95 | −0,7 % |

El GPT-2 emparejado sobre los mismos tokens de codigo se asienta en 4,96. Detalle del propio modelo: media de evaluaciones en pasos 18.000, 18.500 y 19.000 (5,96; 6,11; 6,20); mejor valor 5,96 en el paso 18.000. Evaluaciones emparejadas: frente a SO-CODE, −0,121 nats (SD 0,043) en pasos 2.000–4.000 y +0,001 nats (SD 0,006) en pasos 8.000–13.000.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 0,3 GB, lo que sugiere que un modelo de 76,5 M de parametros en precision de entrenamiento/inferencia estandar cabe con holgura en GPUs de consumo.
- GPUs recomendadas: no disponible. Por tamano (76,5 M de parametros), cualquier GPU moderna de consumo (por ejemplo RTX 3060/4090) es mas que suficiente; el entrenamiento completo del run se realizo en 5,98 horas en una sola sesion.
- Cabe en GPU de consumo: si, dado el tamano del repositorio y del modelo.
- Opciones de despliegue: PyTorch (libreria declarada). No se mencionan vLLM, llama.cpp, Ollama ni TGI; al no ser un transformador estandar, probablemente requiera el codigo del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (CodeParrot, bloque 512) | Arquitectura | Licencia |
|---|---:|---:|---:|---|---|
| SO-CODE-VTLR (este modelo) | 76.572.109 | 512 | 6,09 | Conservativa, sin atencion | CC-BY-4.0 |
| SO-CODE (baseline) | 76.572.109 | 512 | 6,00 | Conservativa, sin atencion | CC-BY-4.0 |
| GPT-2 emparejado (mismos tokens) | no disponible | no disponible | 4,96 | Transformador | no disponible |
| Screen B (fix, 6 canales) | no disponible | 512 | 5,98 | Conservativa, sin atencion | CC-BY-4.0 |

Fuera del estudio, el transformador emparejado (GPT-2, 4,96) supera a todos los modelos conservativos de la escalera en perplejidad sobre codigo Python, lo que indica que la familia semsimula sigue por detras de los transformadores en esta tarea.

## Limitaciones y advertencias

- Resultados no verificados: la perplejidad de 6,09 y las hipótesis pre-registradas (VT1–VT4) son declaraciones del autor, no evaluaciones independientes.
- Rendimiento inferior al transformador equivalente: 6,09 frente a 4,96 del GPT-2 emparejado (+22,8 % en perplejidad), y un 1,6 % peor que su propio baseline SO-CODE.
- El modelo es un control experimental, no un modelo de uso general: su valor esta en el estudio de ablacion, no en la calidad de generacion.
- Ambito limitado: entrenado solo sobre codigo Python (CodeParrot clean), en ingles; no hay soporte demostrado para otros idiomas ni modalidades.
- Contexto corto: evaluado a bloque de 512 tokens; no hay datos de contexto largo.
- Sin evidencia de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion y sesgos: no disponible; no se han publicado evaluaciones de sesgo ni de veracidad.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; no es una restriccion relevante, pero exige acreditar al autor.
- Formato de pesos: no se indica safetensors ni compatibilidad con ecosistemas estandar (llama.cpp, vLLM), lo que dificulta el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Screen B (fix con LR × 0,25 y 6 canales): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Screen A (fix con norma unitaria): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Coleccion "Dead wells in the V bank": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Nota de analisis "Dead Wells in the Joint V_theta Bank": https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validacion: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

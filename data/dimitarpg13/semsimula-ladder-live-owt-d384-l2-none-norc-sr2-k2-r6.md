# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k2-r6

## Resumen

El modelo `semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k2-r6` es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro del proyecto SemSimula. Se trata de un modelo de generación de texto de arquitectura no transformer y sin mecanismo de atención, construido sobre un formalismo de mecánica lagrangiana con un potencial escalar conservativo (energy-based model). Forma parte de un estudio de ablación pre-registrado ("well screen") que compara distintas configuraciones del banco de pozos de potencial (well bank), el bloque de parámetros más grande del modelo base SR2.

Esta variante concreta, K2-R6, sustituye el banco de SR2 (8 pozos de rango 4, 32 direcciones) por uno más pequeño de 2 pozos de rango 6 (12 direcciones), reduciendo los parámetros del potencial V_θ de 35.427.080 a 11.810.306 y el total del modelo a 52.955.336 parámetros. El objetivo del experimento es determinar si menos pozos de mayor rango pueden sostener el rendimiento de SR2 con un coste paramétrico mucho menor.

El modelo se entrena sobre OpenWebText con un presupuesto de 532.480.000 tokens y reporta una perplejidad de validación de 65,12 (media de las últimas tres evaluaciones), un 11,7% peor que SR2 (58,32) pero un 5,8% mejor que la variante de una sola capa SR2-L1 (69,15). Es relevante como evidencia empírica sobre el papel del banco de pozos en esta familia de modelos, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo de lenguaje conservativo con potencial escalar lagrangiano, banco de pozos (2 pozos de rango 6), integrador exacto de osciladores amortiguados (BAOAB), gradientes vivos |
| Parametros totales | 52.955.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluación a bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (librería pytorch; tamaño de repo 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje "conservativo" de la familia SemSimula (etiquetado como PARFLM y "fully-conservative"), que abandona el transformer y el mecanismo de atención. El estado del token se desplaza bajo un potencial escalar V_θ implementado como un banco de pozos: en esta variante, dos pozos de rango 6, de modo que el potencial empuja cada token a lo largo de como máximo 12 direcciones en lugar de las 32 de SR2. Los modos rígidos se integran como osciladores amortiguados exactos mediante el esquema BAOAB, y el modelo incorpora elementos de geometría riemanniana (geodésicas, métrica de Jacobi) y un formalismo de espacio de Fock. La inferencia tiene coste de memoria constante al prescindir de atención.

El entrenamiento usa OpenWebText con un presupuesto fijado de 532.480.000 tokens (32.500 pasos × 32 × 512), idéntico en corpus, tokenizador, semilla y lotes de validación al resto de modelos de la tabla comparativa. Se entrenó en una A100 de 80 GB en 7,85 horas (0,87 s por paso), con memoria pico de 29,4 GB en entrenamiento y 28,8 GB en evaluación; no hubo pasos omitidos y la norma de gradiente global superó 1,0 en 7 de 650 pasos registrados, todos en el warm-up (pasos 300 a 700, máximo 1,45). No se menciona RLHF ni DPO; el estudio es una ablación de mecanismo pre-registrada con predicciones fechadas antes del entrenamiento (KS6–KS9 y A1).

## Capacidades

- Generación de texto autorregresiva en inglés sobre el corpus OpenWebText.
- Modelado de lenguaje con perplejidad medible a bloques de 512 tokens.
- Inferencia con memoria constante (sin atención), según las etiquetas del modelo.
- Integración exacta de modos rígidos mediante BAOAB como innovación de dinámica interna.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo "thinking".
- Naturaleza de investigación: el modelo está pensado para estudios de ablación, no como asistente general.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir el efecto del tamaño del banco de pozos sobre la perplejidad, con presupuesto de tokens y datos idénticos a SR2 y K4-R6.
- Reproducción de estudios de ablación pre-registrados: el modelo permite verificar las predicciones KS6–KS9 y A1 publicadas por el autor y contrastar los resultados declarados.
- Experimentos de modelado de lenguaje con memoria constante: útil para escenarios donde el coste de memoria de la atención es un cuello de botella, aunque su calidad (PPL 65,12) limita su uso fuera de laboratorio.
- Docencia e ilustración de modelos basados en energía: ejemplifica un LM construido sobre mecánica lagrangiana y potenciales escalares, adecuado para cursos o artículos técnicos.
- Evaluación de integradores numéricos en modelos generativos: el uso de BAOAB y de osciladores amortiguados exactos permite estudiar la estabilidad del muestreo.
- Análisis de eficiencia paramétrica: con 52,9 M de parámetros y 11,8 M en V_θ, sirve para estudiar el equilibrio entre capacidad del banco de pozos y rendimiento.
- No se recomienda para atención al cliente, generación de código en producción ni pipelines comerciales, dado su carácter de investigación y su perplejidad.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre OpenWebText, split de validación:

| Modelo | Pozos × rango | Direcciones | Params V_θ | PPL asentada | vs GPT-2 |
|---|---|---:|---:|---:|---:|
| **Este modelo (K2-R6)** | 2 × 6 | 12 | 11.810.306 | **65,12** | 1,307× |
| SR2 (Gen 3) | 8 × 4 | 32 | 35.427.080 | 58,32 | 1,171× |
| K4-R6 (Gen 3) | 4 × 6 | 24 | 23.616.772 | 59,61 | 1,197× |
| SR2-L1 (Gen 3) | 8 × 4 | 32 | 35.425.160 | 69,15 | 1,388× |
| gpt2-matched | — | — | — | 49,81 | 1,000× |

Evolución de la perplejidad de validación por pasos:

| Paso | Fase | SR2 | K4-R6 | Este modelo |
|---:|---|---:|---:|---:|
| 2.000 | estable | 152,73 | 152,90 | 157,81 |
| 5.000 | estable | 108,36 | 107,17 | 113,86 |
| 10.000 | estable | 85,96 | 82,84 | 92,23 |
| 21.000 | inicio decaimiento | 70,94 | 71,44 | 77,99 |
| 28.000 | decaimiento | 60,72 | 61,73 | 67,40 |
| asentada (31.500–32.500) | — | 58,32 | 59,61 | 65,12 |

Mejor PPL 63,07 en el paso 31.000 (SR2: 56,49 en el mismo paso). La brecha frente a SR2 se abre pronto: +0,0037 nats por 1.000 pasos entre 2.000 y 10.000, +0,0021 entre 10.000 y 21.000 y +0,0016 en el decaimiento; la brecha media de las últimas siete evaluaciones es +0,1106 nats (DE 0,0009). Lecturas de ablación sobre el mejor checkpoint (paso 31.000, 16 ventanas de validación, PPL entrenada 65,72): eliminar todos los pozos salvo el más fuerte degrada un +495% en la capa 0 y un +0,0% en la capa 1.

## Requisitos de hardware

- Entrenamiento: una A100 de 80 GB, 7,85 h para 32.500 pasos (0,87 s/paso), pico de 29,4 GB.
- Inferencia: con 52,9 M de parámetros, la huella de pesos en fp32 ronda los 0,21 GB; el repo ocupa 0,4 GB. La memoria de inferencia es constante por diseño (sin atención), aunque no se publican cifras exactas de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojar los pesos con holgura; una A100 o H100 no son necesarias para inferencia.
- Despliegue: el modelo usa PyTorch y no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura no transformer, es probable que requiera el código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Params | Contexto | PPL OpenWebText (val) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Este modelo (K2-R6) | Conservativa, sin atención, 2 pozos × rango 6 | 52,9 M | no disponible (eval. a 512) | 65,12 | CC BY 4.0 | Hugging Face |
| SR2 | Conservativa, sin atención, 8 pozos × rango 4 | 76,6 M (52,9 M + 23,6 M) | no disponible | 58,32 | CC BY 4.0 | Hugging Face |
| K4-R6 | Conservativa, sin atención, 4 pozos × rango 6 | 76,6 M (aprox.) | no disponible | 59,61 | CC BY 4.0 | Hugging Face |
| SR2-L1 | Conservativa, sin atención, 1 capa, 8 pozos × rango 4 | no disponible | no disponible | 69,15 | CC BY 4.0 | Hugging Face |
| gpt2-matched | Transformer (referencia) | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Calidad limitada: PPL de validación de 65,12, un 30,7% peor que la referencia gpt2-matched (49,81) y un 11,7% peor que SR2; no es adecuado para uso en producción.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación no evaluado; no hay datos de sesgos ni de filtrado de seguridad.
- Modelo de investigación con resultados no verificados (`verified: false` en la model-index).
- Varias predicciones pre-registradas fallaron (KS6, KS7, KS8), lo que indica que el diseño del banco de pozos no se comporta como se esperaba.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para ello.
- Arquitectura no estándar: la integración en stacks habituales (vLLM, TGI, llama.cpp) probablemente requiere código propio; soporte de tooling no documentado.
- Longitud de contexto no especificada; la evaluación se hace a bloques de 512 tokens, por lo que no hay garantías más allá de esa ventana.
- Sin datos de cuantización ni de formatos GGUF/safetensors publicados.

## Enlaces

- Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k2-r6
- Modelo base SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Otro brazo del screen (K4-R6): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-k4-r6
- Variante de una capa (SR2-L1): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l1-none-norc-sr2
- Referencia gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota del well screen (setup y scoring): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Well_Screen_and_Precision.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

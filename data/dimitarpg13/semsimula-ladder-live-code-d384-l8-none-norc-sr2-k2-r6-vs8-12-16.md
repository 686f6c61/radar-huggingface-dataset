# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16

## Resumen

`semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13`, perteneciente a la familia "SemSimula" de modelos conservativos. No es un transformer ni usa atención: cada fuerza aplicada sobre un token es el gradiente de un potencial aprendido a contexto fijo, siguiendo un formalismo de mecánica lagrangiana con potencial gaussiano anisotrópico y integración mediante BAOAB. Está entrenado sobre código Python (CodeParrot) y tiene 53.115.092 parámetros, con una arquitectura de 8 capas y dos "pozos" de rango 6.

El modelo es relevante como pieza de un estudio de ablación pre-registrado ("ladder study") sobre profundidad, número de pozos y rango en modelos conservativos. Su contribución concreta es el entrenamiento con un número de pasos de integración N muestreado aleatoriamente en cada paso del optimizador entre {8, 12, 16}, lo que le permite refinar su cómputo sobre una banda de conteos de pasos sin cambiar los pesos. Alcanza una perplejidad de validación de 5,6506 en CodeParrot, un 13,9% por detrás de un GPT-2 emparejado en tokens (4,96).

Se trata de un artefacto de investigación, no de un modelo para producción: su interés reside en demostrar propiedades de refinamiento y conservatividad, no en competir en calidad de generación con modelos transformer convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conservativa, sin atención; mecánica lagrangiana con potencial escalar aprendido, integrador BAOAB, geometría riemanniana (métrica de Jacobi) |
| Parámetros totales | 53.115.092 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch`); no se especifican safetensors ni GGUF |
| Capas | 8 |
| Pozos / rango | 2 pozos, rango 6 |
| Pasos de integración en entrenamiento | N ∈ {8, 12, 16} muestreado por paso |
| Tokens de entrenamiento | 315.392.000 (19.250 pasos × 32 × 512) |
| Dataset | `codeparrot/codeparrot-clean-train` / `codeparrot/codeparrot-clean-valid` |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un "conservative language model": no hay atención, ni camino de registro, ni campo de intercambio. Cada fuerza sobre un token se deriva del gradiente de un potencial escalar aprendido a contexto fijo, con una única excepción medida (el término straight-through de la selección top-k de la fuente del potencial de pares, eliminable en evaluación con un coste de 0,0006 nats). La integración se realiza con el esquema BAOAB sobre una variedad riemanniana con métrica de Jacobi, y la inferencia opera con memoria constante. La arquitectura se describe como "no transformer" y "attention-free", con un espacio de Fock y potencial gaussiano anisotrópico.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 secuencias × 512 tokens) sobre los mismos lotes que su modelo padre K2-L8-R6-CODE, con N = 8, 12 y 16 sorteados en 6.525, 6.416 y 6.309 pasos respectivamente. La innovación central es el entrenamiento multi-paso: mantener el tiempo de integración T = 8 fijo y variar el número de pasos N durante el entrenamiento permite que el modelo refine su cómputo en conteos de pasos no vistos. El autor reporta que, dentro de la banda entrenada, la pila completa refina con pérdidas dentro de 0,01 nats en todos los conteos de 8 a 16 (incluidos seis no vistos) y dentro de 0,08 nats a 32. No se menciona RLHF ni DPO; el entrenamiento es de modelado de lenguaje sobre código.

## Capacidades

- Generación de texto y código Python: modelado autorregresivo sobre CodeParrot.
- Refinamiento por conteo de pasos: el mismo modelo puede ejecutarse con distintos N de integración (8 a 32) manteniendo el tiempo total, con degradación acotada.
- Inferencia con memoria constante: al no usar atención, el coste de memoria no crece con la longitud de contexto de la forma habitual en transformers.
- Conservatividad verificable: las fuerzas derivan de un potencial escalar, lo que permite auditorías de energía.
- Capacidades multilingües: solo inglés (y código).
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado frente a GPT-2 emparejado en tokens para estudiar el coste de prescindir de la atención en modelado de código.
- Estudio de refinamiento de cómputo: permite experimentar con distintos N de integración (8, 12, 16, 24, 32) sobre los mismos pesos para analizar cómo varía la perplejidad, gracias a su entrenamiento multi-paso.
- Ablaciones de profundidad y capacidad: al existir variantes de 2, 4 y 8 capas en la misma colección, se usa para aislar el efecto de la profundidad en modelos conservativos.
- Auditoría de conservatividad: su naturaleza de modelo basado en energía facilita comprobar que las fuerzas provienen de un potencial, útil en líneas de investigación sobre modelos físicamente informados.
- Docencia y divulgación: ejemplo reproducible de mecánica lagrangiana aplicada a modelado de lenguaje, con métricas y protocolo pre-registrado.
- Evaluación de memoria en inferencia: útil para medir el comportamiento de memoria constante en contextos largos frente a transformers, aunque su calidad sea inferior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Modelo | Capas | Pozos | Rango | N entrenamiento | Perplejidad (CodeParrot valid, bloque 512) | Frente a GPT-2 emparejado |
|---|---:|---:|---:|---|---:|---:|
| L8-CODE | 8 | 8 | 4 | 8 | 5,35 | +8,0% |
| K2-L8-CODE | 8 | 2 | 4 | 8 | 5,67 | +14,3% |
| K2-L8-R6-CODE | 8 | 2 | 6 | 8 | 5,54 | +11,8% |
| **K2-L8-R6-VS-CODE (este modelo)** | 8 | 2 | 6 | 8, 12, 16 | **5,6506** | **+13,9%** |
| GPT-2 emparejado (no en el Hub) | 8 | — | — | — | 4,96 | — |

Penalización de refinamiento (ln(PPL_N / PPL_8) en nats, paso 18.000):

| N | 4 | 6 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 24 | 32 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Entrenado solo a N=8 | +3,683 | +0,690 | — | — | — | +0,251 | — | — | — | +0,499 | +1,279 | +1,726 |
| Entrenado a N∈{8,12,16} (este) | +2,568 | +0,175 | +0,005 | −0,001 | −0,004 | −0,008 | +0,006 | −0,000 | +0,003 | +0,001 | +0,038 | +0,081 |

La perplejidad "settled" de 5,6506 es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,56, 5,65, 5,74); la mejor es 5,56 en el paso 18.000. No hay resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 53,1M de parámetros, en fp32 serían ~212 MB de pesos; el autor reporta 63,6 GB de pico en entrenamiento (caminos de 16 pasos) y 55,4 GB en evaluación, cifras que reflejan el coste del integrador y los estados intermedios, no solo los pesos.
- GPU recomendadas: el autor entrenó en dos sesiones de Colab, lo que sugiere GPUs de gama alta de consumo o profesionales; no se especifica el modelo exacto.
- ¿Cabe en GPU de consumo? Los pesos sí, pero el coste de cómputo del integrador (5,5 s por paso de entrenamiento) hace que la inferencia sea lenta en GPUs modestas.
- Opciones de despliegue: PyTorch nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no son aplicables al no ser un transformer estándar).
- Latencia y throughput: no disponibles; el único dato es 5,5 s por paso de entrenamiento sin checkpointing de capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| K2-L8-R6-VS-CODE (este) | 53,1M | no disponible (evaluado a 512) | 5,6506 | CC-BY-4.0 | Hugging Face |
| K2-L8-R6-CODE | 53,1M | no disponible | 5,54 | no disponible | Hugging Face |
| L8-CODE | no disponible | no disponible | 5,35 | no disponible | Hugging Face |
| GPT-2 emparejado | 14,2M fuera de embeddings | 1.024 (GPT-2 estándar) | 4,96 | no disponible | No en el Hub |

Las alternativas comparables son las variantes de la misma colección "depth-on-code"; no se dispone de comparación con modelos externos de la misma categoría (modelos conservativos sin atención) en la información proporcionada.

## Limitaciones y advertencias

- Calidad inferior a transformers: 13,9% peor perplejidad que un GPT-2 emparejado en tokens; no es adecuado para generación de código en producción.
- Modelo de investigación: pensado para estudios de ablación, no para uso comercial pese a la licencia CC-BY-4.0 (que sí permite uso comercial con atribución).
- Solo inglés y código Python: no soporta otros idiomas ni dominios.
- Longitud de contexto no documentada; evaluado a bloques de 512 tokens.
- Riesgo de alucinación: no evaluado ni documentado.
- Sesgos: no documentados; el entrenamiento sobre CodeParrot puede heredar sesgos del corpus de código de GitHub.
- Restricciones técnicas: el integrador BAOAB y los estados intermedios encarecen la inferencia; no compatible con stacks estándar de despliegue (vLLM, TGI).
- Resultados no verificados de forma independiente (`verified: false` en el model-index).
- El entrenamiento requirió reanudaciones y sesiones múltiples; la reproducibilidad exacta puede verse afectada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6-vs8-12-16
- Modelo padre K2-L8-R6-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2-r6
- Variante K2-L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2-k2
- Variante L8-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Colección "depth-on-code": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- Dataset CodeParrot: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Paper, blog o repositorio adicional: no disponible

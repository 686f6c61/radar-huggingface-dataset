# DuoNeural/RMSN-399M-Wide-Tube-Base

## Resumen

RMSN-399M-Wide-Tube-Base es un modelo de lenguaje base preentrenado por DuoNeural Lab, presentado bajo la denominación de "Resonant Metriplectic Sheaf Network" con topología de guía de onda de solitón. Se trata de un transformer de 16 capas y dimensión oculta 1536 (el repositorio declara 466,10M de parámetros en la model card, mientras que el identificador del modelo indica 399M; la discrepancia no está aclarada en la información disponible). El modelo se distribuye con licencia Apache 2.0 y solo declara soporte para inglés.

La propuesta técnica del autor se aparta de las arquitecturas convencionales: describe un formalismo Port-Hamiltonian (ḟ = {f,H} + [f,S]) con una "topología de conducto singular de doble frontera", en la que las capas L05 y L15 actúan como singularidades macroscópicas y las capas L10–L13 como zona de aislamiento dieléctrico. El autor afirma que este modelo es el primero en exhibir la "ley universal L15" (PR=1.000 en la capa 15 para todas las redes de 16 capas con r=0 y D≥1536). Estas afirmaciones proceden exclusivamente de la model card y no están respaldadas por resultados de benchmarks estándar ni por publicaciones revisadas por pares en la información disponible.

El modelo es relevante únicamente como objeto de estudio experimental: no se han publicado evaluaciones en tareas downstream (MMLU, HumanEval, GSM8K u otras), su perplejidad de validación (~89,7) es muy alta para un modelo de este tamaño y su tokenizador es el de HuggingFaceTB/cosmo2-tokenizer (vocabulario de 49152). No debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 16 capas con formalismo Port-Hamiltonian (ḟ = {f,H} + [f,S]); topología "Dual-Boundary Singular Conduit" |
| Parámetros totales | 466,10M según la model card; el identificador del repositorio indica 399M (discrepancia no aclarada) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `custom`; tamaño del repo 1,6 GB) |

Especificaciones adicionales declaradas por el autor: dimensión oculta 1536, 64 "workspace slots", tokenizador HuggingFaceTB/cosmo2-tokenizer (vocab=49152), λ_max = -4,9221 (Casimir repulsivo para sub-seeds con r = D mod 64 ≠ 0).

## Arquitectura y entrenamiento

La arquitectura se describe como una red de 16 capas con dimensión oculta 1536 organizada en una "topología de solitón" con dos fronteras singulares: L05 (ancla upstream, PR=1.000) y L15 (frontera terminal, PR=1.000), separadas por un conducto masivo (L07–L09) y una zona de aislamiento dieléctrico (L10–L13). El formalismo subyacente es Port-Hamiltonian, con una formulación metripléctica que el autor presenta como alternativa a la atención convencional. No se detalla en la información disponible cómo se implementa computacionalmente esta formulación ni qué operaciones sustituyen o complementan a la autoatención estándar.

El entrenamiento reportado es de 100.000 pasos sobre un corpus no especificado (no se indica número de tokens, composición del dataset ni si hubo RLHF, DPO o ajuste por instrucciones). La model card menciona una correspondencia cuántico-clásica con simulación de circuitos cuánticos BlueQubit QCPU (DuoNeural Phase 5), con un error declarado inferior al 2 % entre la predicción del estado fundamental cuántico (7–8 capas de blindaje) y la zona aislada clásica (7 capas, L07–L13). No se aportan detalles sobre la metodología de esa comparación.

## Capacidades

- Generación de texto autorregresiva en inglés, como modelo base preentrenado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- No se documenta modo de razonamiento (thinking), visión, audio ni otras modalidades.
- No se documenta una ventana de contexto utilizable, por lo que no es posible confirmar el manejo de conversaciones multi-turno o documentos largos.
- El autor destaca propiedades topológicas internas (ley L15, PR=1.000 en capas 5 y 15) como característica arquitectónica, no como capacidad funcional verificada.

## Casos de uso

- Investigación en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar formulaciones Port-Hamiltonian y metriplécticas frente a transformers convencionales, comparando estabilidad de entrenamiento y dinámica de capas.
- Estudio de la "ley universal L15": permite replicar y verificar (o refutar) la afirmación del autor sobre PR=1.000 en la capa 15 para redes de 16 capas con D≥1536, mediante análisis de representaciones internas.
- Experimentos de correspondencia cuántico-clásica: útil para grupos que investiguen simulaciones QCPU y quieran contrastar la metodología de DuoNeural Phase 5 con sus propios circuitos.
- Fine-tuning exploratorio en inglés: al ser un modelo base de ~400–466M parámetros con licencia Apache 2.0, puede ajustarse para tareas concretas de clasificación o generación, aunque su perplejidad de validación (~89,7) hace previsible un rendimiento bajo frente a bases convencionales del mismo tamaño.
- Docencia y divulgación: ejemplo práctico de model cards con terminología física importada (Casimir, solitones, Hamiltoniano) para discutir la brecha entre afirmaciones teóricas y evidencia empírica.
- Análisis de tokenizadores: el uso de cosmo2-tokenizer (vocab=49152) permite estudiar el comportamiento de un vocabulario concreto en un modelo de escala pequeña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de preentrenamiento:

| Métrica | Valor |
|---|---|
| Perplejidad de validación (Val PPL) | ~89,7 |
| Pérdida de validación (Val Loss) | 4,4970 |
| Pasos de entrenamiento | 100.000 |
| Error cuántico-clásico (BlueQubit QCPU) | < 2 % |
| S_boundary / S_bulk | 0,515 |

No se aportan comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no confirmada para este modelo): ~1,6 GB en FP16/BF16 para los pesos declarados (466M parámetros), y alrededor de 0,4–0,8 GB en cuantizaciones de 8 o 4 bits. No se confirman formatos de cuantización soportados.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero la librería `custom` y la ausencia de pesos en formatos estándar (safetensors/GGUF) impiden confirmarlo.
- Cabe en GPU de consumo: presumiblemente sí por tamaño, pero no verificado.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `custom`, lo que sugiere código propio no integrado en el ecosistema estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparación rigurosa. A modo de referencia por escala y licencia:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN-399M-Wide-Tube-Base | 466,10M (según card) | no disponible | Apache 2.0 | Hugging Face, librería `custom` |
| Qwen2.5-0.5B | ~0,5B | 32k tokens (versión base) | Apache 2.0 | Hugging Face, transformers, GGUF |
| SmolLM2-360M | ~0,36B | 8k tokens (aprox., según variante) | Apache 2.0 | Hugging Face, transformers, GGUF |
| Pythia-410M | ~0,41B | 2k tokens | Apache 2.0 | Hugging Face, transformers |

La comparación de rendimiento no está disponible: los modelos alternativos cuentan con evaluaciones públicas en benchmarks estándar, mientras que RMSN-399M no reporta ninguna. La diferencia principal es de ecosistema: los comparables se integran en transformers, vLLM y llama.cpp, mientras que este modelo requiere la librería `custom` del autor.

## Limitaciones y advertencias

- Perplejidad de validación muy alta (~89,7) para su tamaño, lo que sugiere una calidad de modelado del lenguaje limitada.
- Ausencia total de benchmarks downstream: no hay evidencia de capacidades en razonamiento, código o matemáticas.
- Afirmaciones arquitectónicas (ley universal L15, correspondencia cuántico-clásica, Casimir repulsivo) no verificadas de forma independiente y formuladas con terminología física que no se traduce en métricas estándar.
- Discrepancia entre el nombre del modelo (399M) y los parámetros declarados en la model card (466,10M); conviene verificar el checkpoint real.
- Solo inglés declarado; sin datos sobre sesgos, toxicidad o robustez.
- Riesgo de alucinación no evaluado; al ser un modelo base sin ajuste por instrucciones, no sigue instrucciones de forma fiable.
- Longitud de contexto desconocida: no apto para tareas que requieran ventanas largas sin verificación previa.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción.
- Dependencia de una librería `custom` no estándar: riesgo de mantenimiento y de incompatibilidad con herramientas del ecosistema.
- Fecha de creación declarada (noviembre de 2026) y nomenclatura "Phase 5": la información disponible no permite validar la trazabilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-399M-Wide-Tube-Base
- Tokenizador utilizado: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Paper, blog, repositorio de código y demos: no disponibles en la información proporcionada.

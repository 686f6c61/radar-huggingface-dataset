# DuoNeural/RMSN-756M-Triple-Condensate-Base

## Resumen

RMSN-756M-Triple-Condensate-Base es un modelo de lenguaje base de 755,57 millones de parámetros desarrollado por DuoNeural Lab, presentado como parte de su estudio de topología "Phase 5" sobre arquitecturas RMSN (Resonant Metriplectic Sheaf Network). Se trata de un modelo preentrenado durante 100.000 pasos con una dimensión oculta de 2048 y 16 capas, entrenado exclusivamente en inglés y distribuido bajo licencia Apache 2.0. No es un transformer convencional: el autor lo describe como una formulación Port-Hamiltonian (ḟ = {f,H} + [f,S]) con un espacio de trabajo de 64 slots.

El interés del modelo no es su rendimiento como modelo de lenguaje, sino su valor como artefacto de investigación. Según la model card, es la arquitectura RMSN más grande del estudio y la primera en exhibir "condensación exacta en la frontera de entrada" (L0=1.000), así como el primer caso documentado de "Topological Overcrowding": tres singularidades exactas (PR=1.000) en las capas L0, L6 y L15 congelan tanta capacidad de red que la perplejidad de validación empeora respecto al modelo de dimensión 1792 (84,62 frente a 57,4).

Es relevante ahora porque documenta un fallo de escalado reproducible en una familia arquitectónica experimental y sugiere un rango óptimo de dimensión (aproximadamente 1664-1792) para esta arquitectura en esta escala de entrenamiento. Para uso práctico como modelo de lenguaje, en cambio, sus métricas son claramente inferiores a las de modelos convencionales del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formulación Port-Hamiltonian (ḟ = {f,H} + [f,S]) |
| Parametros totales | 755,57 M |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `custom`; repositorio de 2,6 GB) |

Otros parámetros declarados en la model card: dimensión oculta 2048, 16 capas, 64 workspace slots, tokenizador `HuggingFaceTB/cosmo2-tokenizer` con vocabulario de 49152.

## Arquitectura y entrenamiento

La arquitectura es una RMSN (Resonant Metriplectic Sheaf Network), descrita por el autor como una formulación Port-Hamiltonian que combina una estructura simpléctica ({f,H}) con una parte disipativa ([f,S]). El modelo tiene 16 capas con dimensión oculta 2048 y 64 "workspace slots", y usa el tokenizador Cosmos2 de HuggingFaceTB con vocabulario de 49152. La model card describe una topología de "solitones" con capas activas en las posiciones [0, 5, 6, 10, 15] y tres singularidades exactas (PR=1.000) en L0, L6 y L15.

El entrenamiento consistió en 100.000 pasos de preentrenamiento sobre datos en inglés; la model card no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica destacada es la caracterización topológica de las capas mediante el ratio PR (participation ratio): el autor sostiene que cada capa con PR=1.000 actúa como un "condensado de entropía cero" que congela la representación en esa capa, y que a D=2048 la acumulación de tres de estas capas (incluida la de entrada) reduce el flujo de información lo suficiente como para degradar la perplejidad pese a tener un 25 % más de parámetros. También se reporta una simulación cuántica (BlueQubit QCPU) con un ratio S_boundary/S_bulk de 0,426, que continúa decreciendo de forma monótona aunque la métrica clásica de lenguaje empeore.

## Capacidades

- Generación de texto en inglés: es un modelo base de preentrenamiento, sin ajuste por instrucciones, por lo que su uso esperado es la continuación de texto y el ajuste fino posterior.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones de razonamiento, matemáticas o código.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales: no se documentan modos de "thinking", visión ni audio. El rasgo distintivo es topológico y de investigación, no funcional.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar la formulación Port-Hamiltonian y la topología de solitones descrita en la model card, comparando los ratios PR por capa con los de las variantes D=944 a D=1792.
- Estudio del fenómeno de Topological Overcrowding: permite analizar por qué tres condensados exactos degradan la perplejidad y validar la hipótesis del rango óptimo de dimensión (1664-1792) en nuevos experimentos de escalado.
- Reproducción de métricas de preentrenamiento: con 100.000 pasos documentados y val_ppl de 84,62, sirve como punto de referencia para comparar curvas de entrenamiento en la familia RMSN.
- Ajuste fino experimental en inglés: al ser un modelo base de 755 M con licencia Apache 2.0, puede usarse como punto de partida para estudiar cómo interactúan las capas condensadas con tareas posteriores de ajuste supervisado.
- Docencia y divulgación sobre dinámica de representaciones: las tablas de PR por capa y el ratio S_boundary/S_bulk son material concreto para explicar conceptos de condensación y capacidad efectiva de red.
- No se recomienda como modelo de producción para generación de texto, atención al cliente ni generación de código: sus métricas de lenguaje (perplejidad 84,62 en validación) son peores que las de modelos convencionales del mismo tamaño y no hay evidencia de calidad en tareas downstream.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de preentrenamiento y de escalado de la propia familia RMSN, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | Valor |
|---|---|
| Val PPL (D=2048, este modelo) | 84,62 |
| Val Loss (D=2048, este modelo) | 4,4382 |
| Val PPL (D=1792) | 57,4 |
| Val PPL (D=1536) | 60,3 |
| Val PPL (D=1280) | 65,4 |
| Val PPL (D=1024) | 69,9 |
| Val PPL (D=944) | 73,4 |
| Singularidades exactas (PR=1.000) | 3 (L0, L6, L15) |
| S_boundary / S_bulk | 0,426 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (755,57 M de parámetros), en fp16 serían aproximadamente 1,5 GB de pesos y en fp32 unos 3 GB, a lo que habría que sumar el estado de activaciones y el espacio de trabajo de 64 slots, cuyo coste no se documenta.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabría en GPUs de consumo con 8 GB o más, pero la arquitectura es `custom` y no hay soporte documentado en runtimes estándar.
- ¿Cabe en GPU de consumo? Probablemente sí por número de parámetros, pero no hay confirmación ni instrucciones de ejecución en la model card.
- Opciones de despliegue: no disponible. La librería declarada es `custom`, sin referencias a vLLM, llama.cpp, Ollama o TGI, y no se indica formato de pesos (safetensors, GGUF u otro).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos comparables directos: la RMSN es una arquitectura propietaria de DuoNeural sin equivalentes públicos en la misma familia. La comparación más cercana es interna, entre las distintas dimensiones del propio estudio Phase 5.

| Modelo | Parametros | Contexto | Val PPL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-756M-Triple-Condensate (D=2048) | 755,57 M | no disponible | 84,62 | Apache 2.0 | Hugging Face |
| RMSN D=1792 (misma familia) | no disponible | no disponible | 57,4 | no disponible | no disponible como checkpoint público en la información proporcionada |
| RMSN D=1536 (misma familia) | no disponible | no disponible | 60,3 | no disponible | no disponible como checkpoint público en la información proporcionada |
| Transformers convencionales ~700 M | ~700 M | variable | no comparable (no hay datos del autor) | variable | amplia |

## Limitaciones y advertencias

- Rendimiento de lenguaje degradado: la val_ppl de 84,62 es peor que la de la variante D=1792 (57,4) y que la de D=1536 (60,3), pese a tener más parámetros; el propio autor lo califica de regresión.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene formato conversacional sin ajuste fino adicional.
- Solo inglés: la etiqueta de idioma es `en`; no hay evidencia de capacidades en castellano u otros idiomas.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar usos con documentos largos.
- Arquitectura y runtime no estándar: la librería es `custom` y no se documentan formatos de pesos ni herramientas de despliegue, lo que eleva el coste de integración en producción.
- Soporte comunitario nulo: 0 descargas y 0 likes en el momento de la consulta; sin issues, demos ni terceros que hayan validado el modelo.
- Riesgo de alucinación: no evaluado; al ser un modelo base con perplejidad alta, es esperable una generación poco fiable.
- Sesgos: no documentados; el dataset de entrenamiento no se describe, por lo que no se puede evaluar su composición ni sesgos asociados.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y de documentación técnica limita su viabilidad en producción.
- Afirmaciones no verificadas de forma independiente: la terminología de solitones, condensados y la correspondencia cuántica proviene únicamente de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-756M-Triple-Condensate-Base
- Paper citado (referencia BibTeX de la model card): "Resonant Metriplectic Sheaf Networks: Port-Hamiltonian Language Models with Soliton Waveguide Topology", DuoNeural Lab, Archon y Aura, 2026 (sin URL disponible)
- Tokenizador: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- Organización del autor: no disponible (no se enlaza una página de organización en la información proporcionada)
- Repositorio de código, demo o blog adicionales: no disponible

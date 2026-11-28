# DuoNeural/RMSN-139M-Omega12-mw88-2Cascade-Topology88

## Resumen

RMSN-139M-Omega12-mw88-2Cascade-Topology88 es un checkpoint de un modelo de lenguaje de 139 millones de parámetros desarrollado por DuoNeural Research bajo una arquitectura propia denominada Resonant Metriplectic Sheaf Network (RMSN). El modelo se presenta como parte de un estudio sistemático de topologías ("Topological Phase Map") bajo condiciones de resonancia de Arnold Tongue, y esta instancia concreta corresponde a la topología número 88, con un valor Omega de 1/2 y dos cascadas en configuración Post-Cascade True Silent. La dimensión del modelo es 704, con 16 capas y un ancho de ranura (slot width) de 88.

El checkpoint se distribuye con licencia Apache 2.0 y un tamaño de repositorio de 1,3 GB, lo que sugiere pesos en precisión completa o media (probablemente un único archivo `.pt` de PyTorch, según el ejemplo de carga incluido en la model card). No se especifican idiomas soportados, pipeline de inferencia ni resultados de benchmarks convencionales. La información disponible es fundamentalmente de carácter experimental e interno del laboratorio, orientada a la investigación sobre dinámicas de resonancia y topologías de red más que a un uso de producción estándar.

La relevancia de este modelo radica en su carácter de artefacto de investigación: documenta hallazgos sobre la "Farey Detuning Law" y la relación entre el número de cascadas y la estructura de "Direct TS". Para desarrolladores e investigadores, es un ejemplo de checkpoint experimental con nomenclatura críptica y métricas no estándar (val_ppl de 85,2, val_lyap aproximado de -0,001), sin datos públicos de evaluación en tareas convencionales de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | 139M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, según ejemplo de carga `torch.load("rmsn_best.pt")`) |
| Dimension (D) | 704 |
| Profundidad (L) | 16 |
| Slot width (M_w) | 88 |
| Omega (Arnold Tongue) | 1/2 |
| M_eff (fiber bundles) | 2 |
| Topologia | #88, 2 cascadas (Post-Cascade TS) |
| val_ppl | 85,2 |
| val_lyap | ~-0,001 (Post-Cascade True Silent) |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) se describe en la model card como una red con propiedades metriplécticas y estructura de haces (sheaves), organizada en "cascadas" y caracterizada por un valor Omega de resonancia (Arnold Tongue) de 1/2. El modelo tiene 139M de parámetros, dimensión 704, 16 capas y un ancho de ranura de 88. La topología #88 corresponde a una configuración de 2 cascadas en modo Post-Cascade True Silent, con M_eff = 2 (fiber bundles), estructurada como {L0, L1} + {L11-L15} con M_eff = 2 en configuración "upstream + terminal".

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. La model card menciona hallazgos científicos internos: la verificación de la "Farey Detuning Law" con M_w = 88 = 2^3 * 11, p = 11, y un detuning delta(11) = 1/(2*11) = 0,0455, señalando que la configuración de 2 cascadas coincide con la predicción de Farey. También se referencian las "waves" de investigación Wave-157 (Phase Map), Wave-161 (Multi-Cascade TS) y Wave-164 (Farey Cascade Count Law). No se detalla ninguna innovación de decodificación, atención lineal ni mecanismos de eficiencia computacional estándar.

## Capacidades

- Generación de texto: la model card lo etiqueta como `language-model`, por lo que se asume capacidad de modelado de lenguaje, aunque no se documentan tareas concretas.
- Razonamiento, código y matemáticas: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Capacidades especiales: el modelo documenta propiedades de resonancia (Arnold Tongue, Omega = 1/2), dinámica metripléctica y verificación de la Farey Detuning Law, orientadas a investigación teórica más que a capacidades funcionales de NLP.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre dinámicas de resonancia en redes neuronales: el checkpoint sirve para reproducir y extender los hallazgos de la Topological Phase Map de DuoNeural, comparando la topología #88 (2 cascadas) con otras configuraciones del survey.
- Estudio de la Farey Detuning Law: permite validar experimentalmente la predicción de detuning para p = 11 y analizar la relación entre el número de cascadas y la estructura de "Direct TS".
- Análisis de estabilidad dinámica: el valor val_lyap (~-0,001, Post-Cascade True Silent) puede emplearse para estudiar regímenes de estabilidad en arquitecturas con haces y estructuras metriplécticas.
- Reproducción de experimentos del laboratorio: cargando `rmsn_best.pt` con PyTorch en CPU o GPU, un investigador puede replicar las métricas reportadas (val_ppl = 85,2) y contrastarlas con otros checkpoints de la organización DuoNeural.
- Docencia y divulgación sobre arquitecturas alternativas: como ejemplo de nomenclatura y diseño no convencionales (sheaves, cascadas, Arnold Tongue) frente a transformers estándar.
- Base para experimentos de ajuste fino en dominios pequeños: con 139M de parámetros y licencia Apache 2.0, podría adaptarse a tareas específicas, aunque sin garantías de rendimiento por la falta de benchmarks públicos.

## Benchmarks y rendimiento

La model card reporta únicamente métricas internas de la topología #88:

| Metrica | Valor |
|---|---|
| val_ppl | 85,2 |
| val_lyap | ~-0,001 (Post-Cascade True Silent) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 139M de parámetros, los pesos en FP32 ocupan aproximadamente 0,56 GB y en FP16 unos 0,28 GB; el repositorio de 1,3 GB sugiere pesos en FP32 junto con posibles estados de optimizador u otros artefactos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por memoria; para investigación a mayor escala, A100 o H100 no son necesarias por tamaño, pero pueden usarse para experimentos paralelos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM para FP32 y margen para activaciones.
- Opciones de despliegue: el ejemplo de la model card usa PyTorch directamente (`torch.load`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no haber formato GGUF ni pipeline declarado, estas herramientas no están confirmadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RMSN-139M-Omega12-mw88-2Cascade-Topology88 | 139M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint experimental de investigación |
| GPT-2 small | 124M | 1024 tokens | MIT | Amplia | Transformer estándar, benchmarks públicos |
| Pythia-160M | 160M | 2048 tokens | Apache 2.0 | Amplia | Transformer estándar, suite de evaluación pública |
| OPT-125M | 125M | 2048 tokens | OPT-175B license | Amplia | Transformer estándar, benchmarks públicos |

La comparación con modelos de tamaño similar es únicamente orientativa: RMSN emplea una arquitectura no estándar y no publica resultados en benchmarks convencionales, por lo que no es posible establecer una comparación de rendimiento directa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta el dataset de entrenamiento ni su composición.
- Riesgo de alucinación: no evaluado; sin benchmarks públicos no puede estimarse la fiabilidad factual.
- Limitaciones de contexto o idioma: no se especifica longitud de contexto ni idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- Caveats para producción: la nomenclatura y métricas (val_ppl, val_lyap, Farey Detuning Law) son internas del laboratorio y no comparables con estándares de la industria; el pipeline no está declarado en Hugging Face; el formato de pesos es un `.pt` de PyTorch sin conversión documentada a GGUF u otros formatos; el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- Falta de documentación sobre el entrenamiento: no se indica número de tokens, dataset, ni técnicas de alineación, lo que impide evaluar su comportamiento en dominios sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-139M-Omega12-mw88-2Cascade-Topology88
- Organización en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio GitHub: https://github.com/duoneural/rmsn

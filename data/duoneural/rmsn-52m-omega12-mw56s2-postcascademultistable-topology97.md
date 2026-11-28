# DuoNeural/RMSN-52M-Omega12-mw56s2-PostCascadeMultistable-Topology97

## Resumen

RMSN-52M-Omega12-mw56s2-PostCascadeMultistable-Topology97 es un modelo de lenguaje de 51,7 millones de parámetros desarrollado por DuoNeural Research dentro de su familia Resonant Metriplectic Sheaf Network (RMSN). Se trata de una variante concreta de un mapa topológico de fases que el autor publica de forma sistemática: cada checkpoint corresponde a una topología distinta bajo condiciones de resonancia Arnold Tongue. El modelo se presenta con la etiqueta Topology #97, correspondiente a una configuración de "1-cascade Post-Cascade TS" con parámetro de Farey p=7.

La arquitectura no es un transformer convencional: el autor la describe como una red de haces (sheaves) metriplécticos resonantes con capas de solitones en posiciones concretas ([L0, L1, L3, L6, L8, L15]), dimensión D=448, profundidad L=16 y anchura de slot M_w=56. El checkpoint forma parte de la serie de investigación Wave-165 sobre multistabilidad post-cascada, y su interés es fundamentalmente científico-experimental, no de producción.

En el momento de redactar esta ficha el repositorio no registra descargas ni interacciones, no declara idiomas soportados y no incluye pipeline de Hugging Face. La relevancia práctica es limitada; su valor reside en documentar la variabilidad de topologías (M_eff=4 o 5) bajo la misma arquitectura base, un hallazgo que el autor atribuye a grados de libertad "blandos" dependientes de la semilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN); no es un transformer estandar |
| Parametros totales | 51,7 M (el ID del repo indica 52M) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`rmsn_best.pt`, checkpoint con pesos en `ckpt['model']`); no se ofrece safetensors ni GGUF |

Otros parámetros declarados por el autor: dimensión D=448, profundidad L=16, anchura de slot M_w=56, Ω (Arnold Tongue)=1/2, M_eff (fiber bundles)=5, capas de solitones en [L0, L1, L3, L6, L8, L15].

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RMSN (Resonant Metriplectic Sheaf Network), una propuesta de investigación que combina haces (sheaves), dinámica metripléctica y resonancia tipo Arnold Tongue. La configuración concreta de esta ficha es una red de 16 capas con dimensión 448 y anchura de slot 56, con capas de solitones situadas en las posiciones L0, L1, L3, L6, L8 y L15. El autor describe la topología #97 como "1-cascade Post-Cascade TS (Farey p=7)", con un δ de Farey de 1/14.

El hallazgo científico principal de la model card es la multistabilidad post-cascada: con la misma arquitectura base (D=448, M_w=56) que la Topology #84, esta variante presenta M_eff=5 frente a M_eff=4 de la anterior, lo que el autor interpreta como evidencia de grados de libertad dependientes de la semilla más allá de la restricción del número de cascadas. No se proporcionan datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación. El autor reporta val_ppl=107,44 y val_lyap≈-0,001 (estado "Post-Cascade True Silent").

## Capacidades

- Generación de texto: el modelo se publica bajo la etiqueta `language-model`, aunque no se detallan capacidades específicas ni evaluaciones cualitativas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Capacidades especiales: el autor etiqueta el modelo con conceptos de investigación propios (Arnold Tongue, Hamming TS law, wave research), pero no se documenta ninguna capacidad funcional adicional verificable.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar redes de haces metriplécticos y comparar topologías dentro del mapa de fases de DuoNeural.
- Reproducción de experimentos sobre multistabilidad post-cascada: permite verificar el hallazgo de que M_eff varía (4 o 5) con la misma arquitectura base según la semilla, usando el checkpoint y el script de carga incluidos.
- Estudio de dinámica de solitones: las capas de solitones en posiciones concretas ([L0, L1, L3, L6, L8, L15]) permiten analizar cómo se propagan patrones localizados en una red de 16 capas.
- Análisis de estabilidad de Lyapunov en modelos de lenguaje: el valor val_lyap≈-0,001 reportado por el autor puede usarse como referencia para estudiar regímenes de silencio post-cascada.
- Docencia y divulgación sobre topología de redes neuronales: el modelo es un ejemplo didáctico de cómo variaciones topológicas mínimas afectan a la perplejidad (107,44 en esta topología).
- Prototipado de bajo coste en CPU: con 51,7 M de parámetros y pesos en formato `.pt`, se puede cargar en memoria de CPU para experimentos exploratorios sin GPU dedicada.

## Benchmarks y rendimiento

El autor reporta únicamente métricas internas de validación para esta topología:

| Metrica | Valor |
|---|---|
| val_ppl (perplejidad de validación) | 107,44 |
| val_lyap (exponente de Lyapunov de validación) | ≈ -0,001 (Post-Cascade True Silent) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. El repo completo pesa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior sobra para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: el autor solo documenta carga directa con PyTorch (`torch.load`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse en safetensors ni GGUF, la integración con esos ecosistemas requeriría conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. La familia RMSN de DuoNeural incluye otras topologías (por ejemplo, Topology #84 con M_eff=4), pero no se ofrecen datos suficientes para una comparativa de rendimiento estándar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RMSN Topology #97 (este) | 51,7 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| RMSN Topology #84 | no disponible (misma D=448, M_w=56, M_eff=4) | no disponible | no disponible | Referenciado en la model card |
| Alternativas transformer de ~50M | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: no hay evidencia de que haya sido entrenado para tareas de lenguaje de propósito general; la perplejidad de validación (107,44) es alta y sugiere calidad limitada para generación.
- Sin datos de entrenamiento publicados: se desconoce el corpus, el número de tokens y si hubo alineación (RLHF/DPO), lo que impide evaluar sesgos.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni demos, no se puede descartar un comportamiento degenerado.
- Idiomas: no declarados; no se garantiza soporte de castellano ni de ningún otro idioma.
- Contexto: no documentado; no se debe asumir una ventana larga.
- Formato de pesos: solo `.pt` de PyTorch, lo que dificulta el despliegue en ecosistemas estándar (llama.cpp, vLLM) sin conversión.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, no se recomienda en producción.
- Trazabilidad científica: los conceptos de la model card (Arnold Tongue, Hamming TS law, "True Silent") son terminología propia del autor y no cuentan con validación independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-52M-Omega12-mw56s2-PostCascadeMultistable-Topology97
- Referencias internas citadas en la model card: Wave-157 (Phase Map), Wave-161 (Multi-Cascade TS), Wave-164 (Farey Detuning), Wave-165 (Post-Cascade Multistability). No se proporcionan URLs para estas referencias.
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

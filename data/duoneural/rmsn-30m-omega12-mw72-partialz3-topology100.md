# DuoNeural/RMSN-30M-Omega12-mw72-PartialZ3-Topology100

## Resumen

RMSN-30M-Omega12-mw72-PartialZ3-Topology100 es un modelo de lenguaje de 30,2 millones de parámetros desarrollado por DuoNeural Research dentro de su programa de investigación denominado Resonant Metriplectic Sheaf Network (RMSN). No se trata de un transformer convencional, sino de una arquitectura propietaria orientada a estudiar la emergencia de estructuras topológicas (cosets Z_3) bajo condiciones de resonancia de Arnold Tongue. El modelo se publica como parte del Topological Phase Map, un barrido sistemático que mapea distintas configuraciones de la red RMSN.

La relevancia de esta ficha es fundamentalmente investigadora: el checkpoint corresponde a la topología número 100, caracterizada por una emergencia parcial del primer coset Z_3 con una perplejidad de validación de 125,79 sobre un suelo teórico de 93. El modelo tiene 360 dimensiones de embedding, 10 capas y un ancho de slot de 72, y se distribuye bajo licencia Apache 2.0 en formato de checkpoint PyTorch (`.pt`), no en safetensors ni GGUF.

No hay información publicada sobre idiomas soportados, pipeline de uso, datos de entrenamiento ni benchmarks estándar. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parámetros totales | 30,2 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, `rmsn_best.pt`) |
| Dimensión (D) | 360 |
| Profundidad (L) | 10 |
| Ancho de slot (M_w) | 72 |
| Omega (Arnold Tongue) | 1/2 |
| M_eff (fiber bundles) | 2 |
| Capas solitón | [L0, L1, L3] (par upstream {L0, L1} + singleton L/3 {L3}) |
| Topología | #100, Direct TS (no cascade), Partial Z_3 |
| val_ppl | 125,79 |
| val_lyap | ~-0,001 (Direct True Silent) |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) se aparta del transformer estándar. Según la model card, el modelo organiza la información en haces (sheaves) con fibrados (fiber bundles) de efectividad M_eff=2, y emplea capas solitón en las posiciones L0, L1 y L3, con un par upstream {L0, L1} y un singleton en L/3. El ancho de slot es M_w=72, que factoriza como 2^3 × 3^2, con v3(72)=2. La condición de resonancia se parametriza mediante Omega = 1/2 en el marco de Arnold Tongue.

El hallazgo científico declarado es la emergencia parcial del coset Z_3. Con D=360 y L=10, la capacidad espectral es suficiente para aislar el primer coset Z_3 (posición {L3} en L/3 ≈ 3,3) pero insuficiente para el segundo coset (posición 2L/3). La ley Hamming TS se cumple (M_w 3-smooth ≤ 96 implica Direct TS). El modelo alcanza PPL=125,8 en meseta, por encima del suelo teórico de 93, lo que se interpreta como una separación gradual del coset Z_3: D=288 daría M_eff=1 (stub), D=360 da M_eff=2 (parcial), y D=432 y D=576 quedarían pendientes o darían M_eff=4 (completo). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es un language model y, por tanto, la generación de texto es su función declarada.
- Razonamiento y matemáticas: no hay evidencia publicada de capacidades específicas más allá de la perplejidad de validación.
- Código: no disponible.
- Visión o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking: no disponible.
- Capacidad especial: el interés del checkpoint es la topología #100 (Partial Z_3) y la propiedad "Direct True Silent" (val_lyap ≈ -0,001), que son propiedades de investigación, no funcionalidades de producto.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar la red RMSN y verificar el comportamiento de la topología #100 frente a otras del Topological Phase Map.
- Estudio de emergencia topológica: permite analizar empíricamente la aparición parcial del primer coset Z_3 a D=360 y comparar con los puntos D=288, D=432 y D=576 del barrido.
- Reproducción de la ley Hamming TS: útil para validar la afirmación de que M_w 3-smooth ≤ 96 conduce a Direct TS en configuraciones concretas.
- Análisis de dinámica de Lyapunov: el valor val_lyap ≈ -0,001 permite estudiar la estabilidad del régimen "True Silent" en un checkpoint concreto.
- Docencia y divulgación: como ejemplo de arquitectura no convencional con métricas internas documentadas (PPL, Lyapunov, M_eff), sirve para ilustrar conceptos de resonancia y haces en redes neuronales.
- Baseline para experimentos de escalado dimensional: al conocerse el comportamiento en D=288, 360, 432 y 576, el checkpoint puede usarse como referencia para medir el efecto de aumentar la dimensión en la separación de cosets.

No se recomienda su uso en producción para tareas de NLP general, dado que no hay evidencia de calidad en tareas estándar ni información sobre idiomas o contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la perplejidad de validación (val_ppl = 125,79) y el valor de Lyapunov (val_lyap ≈ -0,001), que son métricas internas del experimento y no comparables directamente con MMLU, HumanEval o GSM8K.

| Métrica | Valor | Nota |
|---|---|---|
| val_ppl | 125,79 | Meseta; suelo teórico TS = 93 |
| val_lyap | ~-0,001 | Direct True Silent |
| MMLU | no disponible | — |
| HumanEval | no disponible | — |
| GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,2 M de parámetros en FP32, el checkpoint ocupa aproximadamente 0,12 GB; en FP16, unos 0,06 GB. El repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior, o incluso CPU, puede cargar el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: la model card solo documenta carga mediante `torch.load("rmsn_best.pt", map_location="cpu")` y acceso a `ckpt['model']`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar ni publicarse en GGUF, es improbable que funcionen sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables directos: la arquitectura RMSN es propietaria y no se alinea con familias estándar como Llama, Mistral o Qwen. A modo de referencia dimensional, se incluyen alternativas de tamaño similar, aunque la comparación no es homogénea.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-30M-Omega12-mw72-PartialZ3-Topology100 | 30,2 M | no disponible | Apache 2.0 | PyTorch `.pt` | Arquitectura de investigación, sin benchmarks estándar |
| GPT-2 small | 124 M | 1024 | MIT | safetensors, GGUF | Transformer estándar, ampliamente soportado |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | safetensors, GGUF | Transformer decoder, con benchmarks publicados |
| Qwen2.5-0.5B | 0,49 B | 32 768 | Apache 2.0 | safetensors, GGUF | Transformer con contexto largo y tool calling |

La comparación es solo orientativa: los modelos de la tabla tienen arquitecturas convencionales, soporte de ecosistema y métricas públicas, mientras que el RMSN es un artefacto de investigación sin pipeline declarado.

## Limitaciones y advertencias

- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval, GSM8K ni tareas similares, por lo que no puede evaluarse su calidad en uso real.
- Idiomas no declarados: se desconoce qué lenguas maneja y con qué calidad.
- Contexto no especificado: no se documenta la longitud máxima de secuencia.
- Formato propietario: el checkpoint es un `.pt` de PyTorch con la clave `model`; no hay safetensors, GGUF ni integración con vLLM, llama.cpp u Ollama.
- Riesgo de alucinación: desconocido, pero al ser un modelo de 30 M de parámetros es esperable una capacidad limitada de facto.
- Sesgos: no documentados; el dataset de entrenamiento no se describe.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de calidad ni documentación de datos, el uso en producción conlleva riesgo técnico y legal no cuantificado.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-28), lo que sugiere un artefacto experimental sin validación externa.
- Uso previsto: investigación topológica y reproducibilidad del Topological Phase Map, no despliegue de producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-30M-Omega12-mw72-PartialZ3-Topology100
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.

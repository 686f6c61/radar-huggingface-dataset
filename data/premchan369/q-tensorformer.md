# Premchan369/Q-TensorFormer

## Resumen

Q-TensorFormer es una arquitectura de investigación de código abierto publicada por Premchand Yadav (usuario Premchan369 en HuggingFace) que explora la asignación dinámica de recursos computacionales en transformers. El modelo propone adaptar en tiempo de inferencia el rango tensorial, la complejidad de atención y la precisión de la caché KV en función del valor informacional marginal de cada token, con el objetivo de habilitar inferencia en dispositivos con recursos limitados (edge AI, on-device). Se distribuye con licencia Apache 2.0 y está etiquetado como modelo de generación de texto en inglés.

La propuesta técnica combina capas Tensor-Train personalizadas con autograd, atención agrupada (GQA) con RoPE, cuantización de caché KV en INT4 e INT8 empaquetada a nivel de bit, y un controlador PID en bucle cerrado con banda muerta de histéresis (τ = 0.15) para regular la asignación de recursos. El repositorio incluye exportación a GGUF v3 y ONNX, un tokenizador determinista de 256 subpalabras y 107 pruebas unitarias documentadas como superadas.

Es relevante ahora porque aborda dos problemas candentes en el despliegue de LLM: la reducción del coste de memoria de la caché KV en contextos largos y la adaptación dinámica del cómputo a restricciones de hardware. No obstante, el tamaño del repositorio es de 0.0 GB y no se especifican parámetros del modelo ni longitud de contexto, lo que sugiere que se trata de un testbed de investigación más que de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas Tensor-Train personalizadas, GQA con RoPE, atención con attention sinks |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | KV cache INT4 e INT8 empaquetada a nivel de bit; exportación GGUF v3 y ONNX |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura se describe como un transformer con sustitución de capas lineales por capas Tensor-Train (TT) con autograd personalizado y operaciones `einsum` por lotes. Incorpora Grouped-Query Attention (GQA) con Rotary Position Embeddings (RoPE) y un mecanismo de attention sinks para preservar la estabilidad en streaming. El rango tensorial se selecciona dinámicamente sin SVD entre los valores r ∈ {1, 2, 4, 8, 16}, y la asignación de recursos se formula como un problema de optimización lagrangiana resuelto mediante subgradiente dual. Un controlador PID con banda muerta de histéresis (τ = 0.15) cierra el bucle de control sobre un vector de estado informacional de token normalizado de 8 dimensiones (z_t).

El repositorio menciona decodificación auto-especulativa (single-model TT drafting con r_draft = 1 → r_target = 8), una caché KV con "anclas semánticas" que preserva posiciones críticas mediante umbrales de entropía y sorpresa, y un motor TT fusionado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés mediante pipeline `text-generation` con integración en `transformers` (AutoModel / AutoConfig).
- Asignación dinámica de cómputo por token: rango tensorial variable (r ∈ {1, 2, 4, 8, 16}) y complejidad de atención adaptativa.
- Cuantización de caché KV en INT4 e INT8 con empaquetado a nivel de bit para reducir el uso de memoria en contextos largos.
- Preservación de atención mediante attention sinks en modo streaming, evitando el colapso de la atención.
- Decodificación auto-especulativa sin memoria adicional (0 MB extra de VRAM) con drafting TT interno.
- Control de recursos en bucle cerrado mediante PID y optimización lagrangiana con subgradiente dual.
- Exportación a GGUF v3 y ONNX para despliegue en runtimes alternativos.
- Tokenizador determinista UTF-8 de 256 subpalabras.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Inferencia en dispositivos edge: el modelo está diseñado explícitamente para restricciones de memoria y cómputo, con cuantización de caché KV INT4/INT8 y rango tensorial adaptativo que permite ajustar el coste por token según el hardware disponible.
- Investigación en eficiencia de transformers: sirve como banco de pruebas reproducible (107 tests, scripts de evaluación) para estudiar asignación dinámica de recursos, control PID y optimización lagrangiana en modelos de lenguaje.
- Despliegue on-device con presupuesto de memoria ajustado: la caché KV con anclas semánticas reduce el tráfico DRAM (reportado 87,50 % de reducción, de 262 KB a 32,7 KB) preservando posiciones críticas, útil en asistentes locales con contexto largo.
- Generación de texto en streaming: los attention sinks evitan el colapso de la atención en secuencias largas, adecuado para aplicaciones de dictado o chat continuo en local.
- Evaluación de decodificación especulativa: el mecanismo de drafting TT interno (1,38x de aceleración reportada con 0 MB extra) puede integrarse en pipelines de investigación que comparen estrategias de aceleración sin duplicar el modelo.
- Exportación a runtimes ligeros: los formatos GGUF v3 y ONNX permiten probar el modelo en llama.cpp u otros motores compatibles para validar el comportamiento de las capas TT fuera de PyTorch.
- Prototipado de sistemas de control adaptativo en NLP: el vector de estado informacional de 8 dimensiones y el controlador PID son reutilizables como componentes en investigaciones sobre cómputo condicional.

## Benchmarks y rendimiento

Resultados reportados por el autor en las ejecuciones `RUN-20261013-QTF-HARDENING` y `RUN-20261021-NEURIPS-IEEE-STATISTICAL`:

| Métrica | Resultado reportado | Contexto |
|---|---|---|
| Significancia estadística vs. rango estático | p = 1,00e-15; Cohen's d = 1,354 | 50 ensayos emparejados, 1.000 remuestreos bootstrap, favorable a LinUCB |
| Decodificación auto-especulativa | 1,38x de aceleración, 0 MB extra de VRAM | Drafting TT r=1 → r=8, 100 % de aceptación |
| Motor TT fusionado | -96,9 % de tráfico de memoria (21,6 MB → 0,67 MB) | Intensidad operacional 32,27x (0,02 → 0,73 FLOPs/Byte) |
| Caché KV con anclas semánticas | 87,50 % de reducción de DRAM (262 KB → 32,7 KB) | Umbrales de entropía/sorpresa |

No se han publicado en la información disponible resultados en benchmarks estándar de NLP (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se declaran parámetros totales, por lo que no puede calcularse una estimación fiable.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el enfoque en edge AI sugiere viabilidad en hardware limitado, pero no se aportan cifras.
- Opciones de despliegue: `transformers` con `custom_code` (AutoModel / AutoConfig), exportación GGUF v3 (compatible con llama.cpp) y ONNX.
- Latencia y throughput: solo se reporta la aceleración relativa de 1,38x por decodificación auto-especulativa; no se aportan valores absolutos de latencia ni tokens por segundo.
- Requiere PyTorch 2.10 o superior según los badges del repositorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (transformers con cómputo adaptativo y cuantización de caché KV) ni datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se declaran parámetros totales, longitud de contexto ni datos de entrenamiento, lo que impide evaluar su calidad frente a modelos de producción.
- Solo soporta inglés según la etiqueta de idioma; no hay evidencia de capacidades multilingües.
- El repositorio ocupa 0.0 GB, lo que sugiere que los pesos publicados pueden ser mínimos o de demostración; conviene verificar antes de usarlo en producción.
- Los benchmarks reportados son internos del autor y miden métricas de eficiencia (memoria, velocidad, significancia estadística), no calidad de generación; no hay resultados en MMLU, HumanEval o GSM8K.
- Los resultados de reducción de memoria y aceleración provienen de scripts propios del repositorio y no de una evaluación independiente.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de investigación sin evaluación de calidad publicada, no deben asumirse garantías.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos verificables y de evaluación de calidad desaconseja su uso en producción sin validación previa.
- Requiere `custom_code` y PyTorch 2.10+, lo que puede complicar la integración en entornos con versiones anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Premchan369/Q-TensorFormer
- Documentación oficial: https://premchan369.github.io/Q-TensorFormer/
- Arquitectura: https://premchan369.github.io/Q-TensorFormer/architecture.html
- Metodología: https://premchan369.github.io/Q-TensorFormer/methodology.html
- Benchmarks: https://premchan369.github.io/Q-TensorFormer/benchmarks.html
- Inferencia edge: https://premchan369.github.io/Q-TensorFormer/edge-inference.html
- Entrenamiento: https://premchan369.github.io/Q-TensorFormer/training.html
- Referencia de API: https://premchan369.github.io/Q-TensorFormer/documentation.html
- Investigación relacionada: https://premchan369.github.io/Q-TensorFormer/research.html
- Limitaciones: https://premchan369.github.io/Q-TensorFormer/limitations.html
- Contribución: https://premchan369.github.io/Q-TensorFormer/contributing.html
- Space en vivo: https://huggingface.co/spaces/Premchan369/Q-TensorFormer
- Notebook de inicio rápido (Colab): https://colab.research.google.com/github/Premchan369/Q-TensorFormer/blob/main/notebooks/quickstart.ipynb
- Repositorio GitHub: https://github.com/Premchan369/Q-TensorFormer
- Paper (NeurIPS e IEEE, camera-ready): reports/NEURIPS_CAMERA_READY_PAPER.md (en el repositorio)
- Auditoría de integridad científica: reports/SCIENTIFIC_INTEGRITY_AUDIT.md (en el repositorio)

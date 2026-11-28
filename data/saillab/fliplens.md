# saillab/FlipLens

## Resumen

FlipLens (v2.0) es una sonda de investigación de 14,1 millones de parámetros construida por el autor `saillab` para estudiar el comportamiento de los modelos visión-lenguaje médicos sobre radiografías de tórax. No es un modelo clínico: es un instrumento controlado y "fiel a MedGemma" que combina un codificador congelado `google/medsiglip-448` a resolución 896×896 con un decodificador compacto tipo Gemma-3 de 6 capas y anchura 384, que responde preguntas binarias `yes`/`no` leyendo directamente la cabeza del modelo de lenguaje atada (tied LM head).

Su propósito es aislar el origen causal, el mecanismo de lectura y las trampas de evaluación del fallo por sensibilidad a la paráfrasis (Paraphrase Sensitivity Failure, PSF) en modelos visión-lenguaje médicos. Se entrenó sobre 86.288 preguntas binarias balanceadas 50/50 por hallazgo, extraídas de NIH ChestX-ray14 y PadChest-GR, y se evalúa en zero-shot sobre MIMIC-CXR y VinDr-CXR, hospitales no vistos en entrenamiento.

La relevancia actual radica en que expone un fenómeno medible y reproducible: la formulación lingüística exacta de una pregunta médica puede alterar la respuesta del modelo aunque la imagen sea idéntica, y ese efecto persiste en plantillas no vistas y en hospitales distintos. FlipLens permite detectar ese fallo en una sola pasada forward mediante `predict_with_margin`, y ofrece hooks mecanicistas para inspeccionar activaciones internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visión congelado MedSigLip-448 (896×896) + decodificador compacto tipo Gemma-3 (6 capas, anchura 384), lectura binaria desde la LM head atada |
| Parametros totales | 14.078.592 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (256 tokens de parche agrupados + 1 token de resumen global) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tokenizador SentencePiece de MedGemma podado a 141 piezas) |
| Licencia | `health-ai-developer-foundations` (other) |
| Formato de pesos | safetensors, `custom_code` (transformers) |

## Arquitectura y entrenamiento

FlipLens es un modelo visión-lenguaje de dos torres con acoplamiento ligero. El codificador `google/medsiglip-448` permanece congelado y opera a 896×896 píxeles, produciendo 256 tokens de parche agrupados más un token de resumen global. Estos se inyectan en un decodificador de 6 capas y anchura 384 con arquitectura Gemma-3, y la respuesta binaria `yes`/`no` se lee directamente de la cabeza del modelo de lenguaje atada, sin clasificador adicional. El tokenizador SentencePiece de MedGemma se poda a las 141 piezas de vocabulario presentes en el corpus.

El entrenamiento emplea 86.288 preguntas binarias balanceadas 50/50 por hallazgo sobre NIH ChestX-ray14 y PadChest-GR, cubriendo 14 hallazgos torácicos. El balanceo por hallazgo fija en 0.500 cualquier estrategia que ignore la imagen (ablación visual), lo que convierte la accuracy en una medida directa de uso real de la señal visual. La versión v2.0.0 conserva los pesos de v1.0 de forma bit-idéntica (mismos logits) y añade infraestructura de análisis: detector de flip en una pasada (`predict_with_margin`), hooks pre-RMSNorm (`capture_pre_norm_layers`), vector de lectura atada de 0 parámetros (`readout_direction`), codificación por lotes de preguntas (`encode_questions`) y desplazamientos de posición RoPE (`text_pos_offset`).

## Capacidades

- Respuesta a preguntas visuales binarias (`yes`/`no`) sobre 14 hallazgos torácicos en radiografías de tórax.
- Detección de flip en una sola pasada forward: devuelve la respuesta binaria, el margen firmado `m = z_yes − z_no`, `|m|` y la entropía predictiva binaria `H(σ(m))`.
- Hooks mecanicistas para extraer activaciones reales pre-RMSNorm de los bloques `[L_0 … L_5]`.
- Vector de lectura atada de 0 parámetros (`w_yes − w_no`) para análisis de dirección de lectura.
- Codificación por lotes de preguntas (`encode_questions`).
- Desplazamientos causales de posición RoPE (`text_pos_offset`) para experimentos de bloqueo posicional.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto libre, código ni matemáticas.
- Capacidad multilingüe: no disponible (vocabulario podado a 141 piezas del corpus).

## Casos de uso

- Investigación en interpretabilidad mecanicista: extraer activaciones pre-RMSNorm capa a capa para localizar en qué bloques se transfiere la información de formulación desde el prefijo de la pregunta hasta la posición de respuesta.
- Auditoría de robustez a paráfrasis en modelos médicos: medir la tasa de flip de clúster binario entre plantillas canónicas, aumentadas y adversarias para cuantificar la sensibilidad lingüística de un pipeline.
- Detección de fallos en una sola pasada en producción de investigación: usar `predict_with_margin` para obtener margen y entropía sin múltiples forward passes, reduciendo coste en estudios a gran escala.
- Validación de transferencia entre hospitales: evaluar zero-shot sobre MIMIC-CXR y VinDr-CXR para comprobar si el comportamiento aprendido generaliza a cohortes con criterios de etiquetado distintos.
- Análisis de prevalencia clínica: auditar cómo el cambio de prevalencia entre cohortes afecta a la calibración y al margen de decisión del modelo.
- Estudio de bloqueo posicional RoPE: desplazar `position_ids` del texto para reproducir el experimento que muestra que el bloqueo posicional explica parte del fallo por paráfrasis.
- Reproducción de resultados del paper: ejecutar la suite de 8 semillas y el benchmark PSF-Med para replicar las cifras publicadas.

## Benchmarks y rendimiento

| Cohorte de evaluacion | n | Accuracy publicada | Accuracy 8 semillas | AUROC publicada | AUROC 8 semillas | Flip de cluster 8 semillas (%) |
|---|---:|---:|---:|---:|---:|---:|
| In-distribution (imágenes reservadas) | 15.112 | 0.748 | 0.751 ± 0.003 | 0.827 | 0.829 ± 0.002 | 4.8 ± 1.2 |
| MIMIC-CXR (hospital no visto) | 450 | 0.671 | 0.670 ± 0.014 | 0.743 | 0.738 ± 0.004 | 4.3 ± 1.6 |
| VinDr-CXR (hospital no visto) | 5.478 | 0.686 | 0.674 ± 0.015 | 0.756 | 0.749 ± 0.017 | 6.4 ± 2.0 |
| VinDr-CXR (sin engrosamiento pleural) | 5.224 | 0.700 | 0.688 ± 0.016 | 0.769 | 0.763 ± 0.017 | 6.2 ± 1.9 |
| Suelo con ablación visual (todos los splits) | — | 0.500 | 0.500 ± 0.000 | 0.500 | 0.500 ± 0.000 | — |

Resultados por régimen de formulación en entrenamiento (flip de clúster binario):

| Régimen de entrenamiento | Todos 48 (%) | 24 no vistas (Val, %) | 24 no vistas (MIMIC, %) | 24 no vistas (VinDr, %) | Accuracy (%) | Dispersión |
|---|---:|---:|---:|---:|---:|---:|
| Aumentado (todas las paráfrasis) | 4.8 ± 1.2 | 25.7 ± 3.7 | 23.9 ± 5.9 | 27.0 ± 5.0 | 75.3 ± 0.4 | 0.023 ± 0.004 |
| Canónico (1 formulación fija) | 67.1 ± 11.5 | 66.8 ± 5.0 | 73.1 ± 6.4 | 80.9 ± 7.8 | 66.8 ± 1.9 | 0.498 ± 0.146 |
| Adversario (atajo de registro) | 88.4 ± 1.6 | 90.1 ± 5.4 | 89.4 ± 6.2 | 91.7 ± 5.9 | 58.1 ± 1.2 | 1.362 ± 0.091 |

Notas: en VinDr-CXR el neumotórax transfiere sin cambios (AUROC 0.903 frente a 0.899), mientras que el engrosamiento pleural se invierte (AUROC 0.332) por criterios de etiquetado entre cohortes. Los splits de validación de NIH se separan por hash de imagen, no por paciente (69,8 % de solapamiento de pacientes); la generalización por paciente y hospital recae en MIMIC-CXR y VinDr-CXR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 13,7 GB, pero el modelo declarado tiene 14,1 M de parámetros; el peso mayor corresponde presumiblemente al codificador MedSigLip-448 congelado y a artefactos auxiliares.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio (13,7 GB) sugiere que se requiere al menos una GPU con VRAM suficiente para cargar el codificador completo, pero no se especifica.
- Opciones de despliegue: `transformers` con `custom_code` (requiere `trust_remote_code=True`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlipLens (v2.0) | 14,1 M | No disponible | VQA binaria en radiografía de tórax, interpretabilidad | `health-ai-developer-foundations` | Hugging Face |
| google/medgemma-4b-it (base) | 4 B | No disponible | VQA médica general, instrucciones | `health-ai-developer-foundations` | Hugging Face |
| google/medsiglip-448 (codificador) | No disponible | No disponible | Codificador visión-lenguaje médico | No disponible | Hugging Face |

FlipLens no es comparable en rendimiento general con MedGemma-4b-it: es una sonda de 14,1 M de parámetros diseñada para aislar mecanismos, no un modelo de propósito general. La comparación relevante es metodológica (detección de PSF y análisis mecanicista), no de capacidad.

## Limitaciones y advertencias

- No es un dispositivo médico ni un modelo de diagnóstico clínico; el autor lo declara explícitamente fuera de uso clínico.
- Solo responde preguntas binarias `yes`/`no` sobre 14 hallazgos torácicos; no genera texto libre ni razonamiento multi-paso.
- El vocabulario está podado a 141 piezas de SentencePiece, lo que limita severamente cualquier uso fuera del corpus de entrenamiento.
- Riesgo de sesgo por cohorte: el engrosamiento pleural se invierte en VinDr-CXR (AUROC 0.332) por diferencias en criterios de etiquetado entre hospitales.
- Los splits de validación de NIH se separan por hash de imagen, no por paciente (69,8 % de solapamiento de pacientes), lo que infla potencialmente las métricas in-distribution.
- La licencia `health-ai-developer-foundations` impone términos específicos de Google para uso comercial; deben revisarse antes de cualquier despliegue.
- El fallo por sensibilidad a la paráfrasis (PSF) es un comportamiento documentado del modelo: formulaciones canónicas producen hasta un 67,1 % de flips de clúster, lo que desaconseja su uso con plantillas fijas no auditadas.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, con el riesgo de seguridad asociado a ejecutar código del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saillab/FlipLens
- Código y suite de evaluación: https://github.com/thedatasense/FlipLens
- Paper y paquete de reproducibilidad: https://github.com/thedatasense/FlipLens-paper
- Benchmark PSF-Med: https://huggingface.co/datasets/saillab/psf-med
- Write-up interactivo: https://bineshkumar.me/phd-thesis/causality/
- Demo del detector de flip en una pasada: https://bineshkumar.me/phd-thesis/explorer/#margin-demo
- Modelo base MedGemma: https://huggingface.co/google/medgemma-4b-it
- Codificador base MedSigLip: https://huggingface.co/google/medsiglip-448
- Términos de licencia: https://developers.google.com/health-ai-developer-foundations/terms

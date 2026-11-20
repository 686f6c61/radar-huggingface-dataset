# genome-spy/ChromBPNet-ONNX

## Resumen

ChromBPNet-ONNX es una conversión a formato ONNX del atlas de modelos ChromBPNet corregidos por sesgo del consorcio ENCODE, publicada por GenomeSpy. ChromBPNet es una red neuronal convolucional de Kundaje Lab diseñada para predecir accesibilidad de cromatina a partir de secuencia de ADN, desacoplando la señal biológica real de los sesgos técnicos del protocolo experimental (ATAC-seq o DNase-seq). Esta release no entrena ni ajusta nada: solo convierte los checkpoints originales de TensorFlow/Keras a ONNX float32 y valida la paridad numérica.

El ámbito declarado abarca 1.512 experimentos (369 de ATAC-seq y 1.143 de DNase-seq), con cinco folds cada uno, lo que suma 7.560 checkpoints originales. Esta publicación incluye únicamente la rama `nobias` (accesibilidad corregida), que es la recomendada por el editor para descubrimiento biológico, y omite los pesos del modelo completo y de la rama solo-sesgo. La conversión está en curso: solo se suben los modelos aceptados individualmente, y el archivo `accepted-manifest.json` enumera la cobertura realmente publicada.

La relevancia práctica es doble: por un lado, permite ejecutar predicciones de accesibilidad de cromatina en el navegador mediante `onnxruntime-web` con WebGPU, sin infraestructura de servidor; por otro, estandariza el acceso a un atlas grande de modelos biológicos en un formato portable. Cada checkpoint pesa aproximadamente 25,5 MB en float32, y el atlas completo rondaría los 193 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red convolucional; arquitectura ChromBPNet original de Kundaje Lab, reconstruida desde el grafo Keras revisado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de secuencia `[batch, 4, 2114]` (ventana de 2114 pb) |
| Tipos de cuantizacion | float32 únicamente (sin cuantización; el autor indica explícitamente que no hay retraining, quantization ni fine-tuning) |
| Idiomas soportados | no aplica (modelo genómico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), float32; archivos de ~25,5 MB por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es la ChromBPNet original: una CNN que recibe una secuencia one-hot de ADN de 2114 pb en orden de canales A/C/G/T (las N se codifican como todo ceros) y produce dos cabezas crudas. La primera, `profile_logits`, es un tensor float32 `[batch, 1, 1000]` con logits de perfil no orientados (sin hebras separadas). La segunda, `log_counts`, es un tensor float32 `[batch, 1]` con el log1p del recuento total. La entrada `[s, s+2114)` produce una salida sobre las coordenadas `[s+557, s+1557)` en GRCh38/hg38 (intervalo semiabierto, base cero).

No hay reentrenamiento en esta release: los pesos proceden de los checkpoints originales del atlas ENCODE ChromBPNet, entrenados por el Kundaje Lab. La rama publicada es la `nobias`, que no recibe entradas de control. La decodificación recomendada es un softmax numéricamente estable sobre los 1000 logits multiplicado por `max(expm1(log_counts), 0)`; el clamp a cero preserva el decodificador de recuentos esperados del Sequence Designer original.

La innovación técnica de la conversión es la gestión de las convoluciones anchas: los pesos entrenados idénticos se dividen en grupos iguales de canales de entrada con sumas balanceadas y una única suma de sesgo entrenado, lo que reduce el error de cancelación en float32 en las sumas de canales anchos. El conversor prueba tamaños de chunk de 128, 64, 32 y 16 canales y retiene el candidato que pasa la validación.

## Capacidades

- Predicción de accesibilidad de cromatina (ATAC-seq y DNase-seq) corregida por sesgo a partir de secuencia de ADN genómico.
- Salida de perfil de accesibilidad de 1000 posiciones (logits crudos) y recuento total esperado (log1p).
- Procesamiento por lotes dinámico: la validación cubre batches 1, 3 y 6.
- Manejo de ADN con N internas y secuencias completamente N (todo ceros).
- Inferencia en navegador vía `onnxruntime-web` con WebGPU (módulo `onnxruntime-web@1.31.1`), servido por HTTPS o localhost.
- Inferencia en CPU con paridad numérica float32 frente a TensorFlow 2.18.1 / tf-keras 2.18.0.
- No incluye gradientes ni métodos de atribución/design basados en gradientes (solo forward pass).
- No incluye integración de backend de aplicación ni UI.

## Casos de uso

- Análisis de accesibilidad de cromatina en pipelines de genómica: dado un intervalo de 2114 pb de GRCh38, el modelo devuelve el perfil de accesibilidad corregido y el recuento esperado, útil para priorizar regiones reguladoras candidatas sin depender de datos experimentales de control.
- Visualización interactiva en navegador: integración con herramientas web tipo GenomeSpy mediante `onnxruntime-web` y WebGPU, permitiendo explorar predicciones de accesibilidad sobre un genoma de referencia sin backend, con latencias de ~31 ms en batch 1 y ~170 ms en batch 6 (medido en Apple M5 / Metal 3 con Chromium 153).
- Evaluación de variantes (SNV): el modelo acepta secuencias con variantes puntuales, lo que permite comparar la predicción entre alelo de referencia y alternativo para estudiar el impacto de variantes en regiones reguladoras (la validación incluye SNV y reverse complement).
- Selección de experimentos ENCODE para análisis comparativos: el archivo `source-inventory.json` permite resolver ensayo, experimento/fold, repositorio original, commit, ruta H5 y hashes, facilitando la trazabilidad de cada checkpoint en estudios reproducibles.
- Docencia y prototipado en genómica computacional: al ser ONNX float32 portable y ligero (~25,5 MB por checkpoint), se puede desplegar en entornos docentes o de investigación sin GPU de datacenter, usando WebGPU o CPU.
- Validación de conversiones y paridad numérica: sirve como referencia para verificar que una implementación propia de ChromBPNet reproduce los resultados originales dentro de rtol=2e-4 y atol=1e-5, comparando cabezas crudas y recuentos decodificados.
- Integración en flujos de descubrimiento biológico: al publicarse solo la rama `nobias`, es adecuada para estudios que buscan señal biológica sin el confusor del sesgo de protocolo, siempre que se respete la advertencia de no comparar recuentos absolutos entre experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks biológicos (AUROC, correlación con datos experimentales, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son de validación de inferencia:

| Metrica | Valor |
|---|---|
| Paridad numérica frente a TensorFlow (cabezas crudas y recuentos decodificados) | rtol=2e-4, atol=1e-5 |
| Llamadas de cómputo GPU en 12 inferencias (validación WebGPU) | 1.704 |
| Latencia batch 1 (warm, Apple M5 / Metal 3, Chromium 153) | ~31 ms |
| Latencia batch 6 (misma configuración) | ~170 ms |
| Tamaño por checkpoint float32 | ~25,5 MB |
| Tamaño estimado del atlas completo en ONNX | ~193 GB |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un checkpoint float32 de ~25,5 MB es muy ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; la validación representativa se hizo en Apple M5 / Metal 3. Se requiere un adaptador WebGPU real para la ruta de navegador.
- Cabe en GPU consumer: sí, por el tamaño reducido del checkpoint; la validación documentada usa hardware Apple, no se confirma en otras GPUs.
- Opciones de despliegue: `onnxruntime-web@1.31.1` (WebGPU y WASM) en navegador; `onnxruntime` en CPU para paridad numérica. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~31 ms batch 1 y ~170 ms batch 6 en la configuración validada; algunas operaciones del grafo se ejecutan en CPU (incluido el manejo de shapes de ORT), por lo que no se garantiza que todos los nodos corran en GPU. Los timings incluyen transferencias.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| ChromBPNet-ONNX (este) | CNN de accesibilidad corregida por sesgo | Secuencia 2114 pb | Perfil 1000 pb + log1p recuento | MIT | ONNX float32 |
| ChromBPNet original (Kundaje Lab) | CNN de accesibilidad corregida por sesgo | Secuencia 2114 pb | Perfil + recuento (completo y bias-only) | no disponible en esta información | TensorFlow/Keras (H5, JSON) |
| Modelos de la rama bias-only de ChromBPNet | CNN de solo sesgo | Secuencia 2114 pb | Perfil de sesgo | no disponible en esta información | TensorFlow/Keras (no incluidos en esta release) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La conversión está en curso: la cobertura publicada es parcial y debe consultarse `accepted-manifest.json`; el ámbito fuente no implica release completo.
- Solo se incluye la rama `nobias`; se omiten los pesos del modelo completo y de la rama solo-sesgo.
- No es una release avalada por el upstream (Kundaje Lab / ENCODE); GenomeSpy solo aporta conversión y validación numérica. La información biológica y de QC es afirmación del editor original.
- La paridad de conversión no establece precisión biológica ni comparabilidad de recuentos absolutos entre experimentos.
- Solo algunos archivos están cualificados para navegador; la paridad numérica en CPU no garantiza que todos los checkpoints, GPUs y navegadores cumplan la misma tolerancia WebGPU.
- No se proporcionan gradientes ni métodos de atribución/design basados en gradientes.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero las predicciones son estimaciones del modelo y no evidencia experimental; no deben interpretarse como mediciones de accesibilidad reales.
- Sesgos conocidos: no disponibles en la información proporcionada; la corrección de sesgo de protocolo mitiga sesgos técnicos, pero no se documentan aquí otros sesgos biológicos o de composición del dataset.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia del modelo original y de los datos subyacentes debe verificarse por separado (no disponible en esta información).
- Advertencia de uso: no descargar el atlas completo (~193 GB) para una sesión de navegador; seleccionar checkpoints individuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genome-spy/ChromBPNet-ONNX
- Colección ChromBPNet ONNX: https://huggingface.co/collections/genome-spy/chrombpnet-onnx-6b0055b4ba60e6db8d20a1f7
- Repositorio ChromBPNet original (Kundaje Lab): no disponible en la información proporcionada
- Paper de ChromBPNet: no disponible en la información proporcionada
- Documentación de onnxruntime-web: no disponible en la información proporcionada

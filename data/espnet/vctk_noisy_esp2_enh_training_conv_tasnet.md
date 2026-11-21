# espnet/vctk_noisy_esp2_enh_training_conv_tasnet

## Resumen

El modelo `espnet/vctk_noisy_esp2_enh_training_conv_tasnet` es un sistema de mejora de voz (speech enhancement) entrenado con el toolkit ESPnet3 dentro de la receta `egs3/vctk_noisy/esp2_enh`. Lo desarrolla el usuario `someki1` del ecosistema ESPnet y se distribuye como un paquete de inferencia (`model_pack`) listo para cargar mediante `InferenceModel.from_pretrained`. Su funcion es eliminar ruido de grabaciones de voz manteniendo la inteligibilidad de la senal limpia de referencia.

Tecnicamente es un modelo pequeno: 6.519.345 parametros entrenables (26,08 MB en float32), con arquitectura convolutional de tipo Conv-TasNet (encoder convolucional, separador TCN de 8 capas y 3 stacks, decoder convolucional) operando a 16 kHz. No es un modelo de lenguaje ni un transformer generativo; es un modelo discriminativo de senal que predice una mascara/espectro limpio a partir de audio ruidoso.

Su relevancia es practica: ofrece un baseline reproducible y ligero para tareas de mejora de voz en entornos ruidosos, con metricas publicadas en el conjunto de test (PESQ 2,5786, SI-SNR 19,6105 dB, STOI 0,9403). Es util como referencia para comparar sistemas mas grandes o para integrarse en pipelines de preprocesado de audio en produccion sin requisitos de GPU significativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv-TasNet (encoder conv, separador TCN, decoder conv) |
| Parametros totales | 6.519.345 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks de 32.000 muestras en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (procesa senal de voz, no texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (bundle `model_pack` de ESPnet3, no safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo sigue el esquema Conv-TasNet clasico implementado en ESPnet: un encoder convolucional con 256 canales, kernel 20 y stride 10 que transforma la forma de onda en una representacion latente; un separador TCN con 8 capas, 3 stacks, bottleneck de 256, hidden dim de 512, kernel 3, normalizacion gLN, activacion ReLU y modo no causal; y un decoder convolucional simetrico al encoder (256 canales, kernel 20, stride 10). La funcion de perdida es SI-SNR, optimizador Adam (lr 0,001, weight decay 1e-5) con scheduler ReduceLROnPlateau (factor 0,5, patience 3), inicializacion Xavier uniforme y entrenamiento de hasta 100 epocas con gradient clipping de 5,0.

El corpus de entrenamiento es `vctk_noisy`, una version con ruido anadido del dataset VCTK. Los datos se procesan con `EnhPreprocessor` a 16 kHz, mono, un solo hablante, con chunks de 32.000 muestras y batches de 8 (batch_bins 4.000.000). No se documenta el numero total de tokens ni horas de audio, ni si hubo fine-tuning con RLHF/DPO (no aplica a este tipo de modelo). La innovacion tecnica destacable es el empaquetado reproducible del bundle ESPnet3, que incluye los artefactos del experimento y permite cargar el modelo con una sola llamada.

## Capacidades

- Mejora de voz mono: elimina ruido de fondo de grabaciones a 16 kHz y devuelve la senal limpia estimada.
- Procesamiento por chunks: admite fragmentos de audio de longitud variable (entrenado con chunks de 32.000 muestras, equivalentes a 2 segundos a 16 kHz).
- Inferencia no causal: al no ser causal, puede usar contexto futuro dentro del chunk, lo que favorece la calidad frente a variantes streaming.
- Integracion con ESPnet3: carga directa mediante `InferenceModel.from_pretrained` y uso con la API `model(sample)`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingues ni de texto: opera exclusivamente sobre audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Preprocesado de voz para ASR: aplicar el modelo antes de un reconocedor para reducir la tasa de error en entornos ruidosos, gracias a su STOI de 0,9403 en test.
- Limpieza de grabaciones de reuniones: procesar audio de microfonos de sala para eliminar ruido estacionario antes de transcripcion o archivado.
- Telefonia y call centers: integrar el modelo en el pipeline de entrada para mejorar la calidad percibida de las llamadas, con bajo coste computacional (6,5 M de parametros).
- Datasets de entrenamiento: usar el modelo para aumentar o limpiar corpus de voz ruidosa y generar pares ruido/limpio de referencia.
- Prototipado e investigacion: servir como baseline reproducible de Conv-TasNet en ESPnet3 para comparar con arquitecturas mas recientes.
- Despliegue en dispositivos con recursos limitados: su tamano (26 MB en float32) permite ejecucion en CPU o GPUs de gama baja para tareas de mejora en tiempo casi real por chunks.
- Evaluacion de metricas de mejora de voz: usar el modelo como referencia fija al medir PESQ, SI-SNR y STOI de otros sistemas.

## Benchmarks y rendimiento

| Dataset | PESQ | SI-SNR (dB) | STOI |
|---|---|---|---|
| test | 2,5786 | 19,6105 | 0,9403 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (26,08 MB de pesos mas activaciones de chunks pequenos).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GTX/RTX moderna e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable por el reducido numero de parametros; adecuada para procesamiento por lotes offline.
- Opciones de despliegue: API de ESPnet3 (`InferenceModel.from_pretrained`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PESQ (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vctk_noisy_esp2_enh_training_conv_tasnet | 6,52 M | chunks de 32.000 muestras | 2,5786 | no disponible | Hugging Face (ESPnet) |
| Alternativas Conv-TasNet en ESPnet | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos de mejora de voz tipo Demucs/DeepFilterNet | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la informacion proporcionada para establecer una comparativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial sin consultar al autor o al repositorio original.
- Modelo especifico de dominio: entrenado sobre `vctk_noisy`; su rendimiento puede degradarse con tipos de ruido, idiomas o condiciones acusticas no representadas.
- Procesamiento por chunks: la calidad puede resentirse en audios muy largos si se procesan de forma independiente sin solapamiento.
- No es causal: no apto para streaming de baja latencia estricta sin adaptacion.
- Riesgo de artefactos: como todo modelo discriminativo de mejora, puede introducir distorsion o sobre-suprimir componentes de la voz.
- Sin datos de sesgo: no se documentan sesgos por hablante, genero o acento.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; conviene verificar la reproducibilidad del bundle antes de usarlo en produccion.
- Modelo de 2026 con metadatos incompletos (pipeline, idiomas y licencia no disponibles): la ficha refleja unicamente lo publicado.

## Enlaces

- Hugging Face: https://huggingface.co/espnet/vctk_noisy_esp2_enh_training_conv_tasnet
- Repositorio ESPnet: https://github.com/espnet/espnet
- Paper ESPnet (Interspeech 2018): https://doi.org/10.21437/Interspeech.2018-1456
- Paper Conv-TasNet (referencia de la arquitectura): no disponible en la informacion proporcionada
- Demo o blog oficial: no disponible en la informacion proporcionada

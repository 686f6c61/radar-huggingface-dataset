# Allinsama/prj-beatrice__dnsmos-torch-native

## Resumen

DNSMOS P.835 and P.808 es un sistema de estimación de calidad de voz sin referencia desarrollado originalmente por Microsoft dentro del DNS-Challenge. Esta ficha describe la adaptación publicada en HuggingFace por Allinsama (bajo el espacio `prj-beatrice`), que reimplementa los dos predictores originales en PyTorch nativo para que puedan ejecutarse únicamente con `torch`, `torchaudio` y `transformers`, eliminando la dependencia de `onnxruntime` y del código auxiliar `dnsmos_local.py`.

El modelo devuelve cuatro puntuaciones por clip de audio: `sig` (calidad de la señal vocal), `bak` (calidad del ruido de fondo) y `ovrl` (calidad global) según la recomendación ITU-T P.835, más `p808` (MOS estimado según ITU-T P.808). Se trata de un modelo de regresión sobre audio, no de un modelo generativo: su relevancia radica en que permite puntuar calidad de voz de forma objetiva y barata en pipelines de TTS, conversión de voz, ASR o limpieza de datasets.

El checkpoint es extremadamente pequeño (361.853 parámetros en safetensors), lo que lo hace apto para ejecutarse en CPU y para procesar grandes volúmenes de audio. Admite lotes con padding mediante un tensor de longitudes y está pensado para trabajar a 16 kHz, frecuencia a la que sus resultados coinciden con la implementación ONNX de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal ligera para regresión de calidad de voz; port a PyTorch nativo de los predictores DNSMOS P.835 (`sig_bak_ovr.onnx`) y P.808 (`model_v8.onnx`) de Microsoft. Topología interna no detallada en la información disponible |
| Parametros totales | 361.853 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de puntuación sobre audio; no procesa tokens de texto). No se documenta la ventana de segmentación empleada |
| Tipos de cuantizacion | No disponible. Pesos distribuidos en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible. Al operar sobre la señal acústica, la métrica no depende del idioma, pero esto no se declara explícitamente en la model card |
| Licencia | `other` (MIT AND CC-BY-4.0): código de inferencia bajo MIT, pesos convertidos bajo CC BY 4.0 |
| Formato de pesos | safetensors (librería `transformers`, `custom_code` requerido) |
| Tarea (pipeline) | `audio-classification` (en la práctica, regresión de cuatro puntuaciones MOS) |
| Entrada | Forma de onda mono a 16 kHz; lote con padding como tensor `[batch_size, max_length]` más `input_lengths` `[batch_size]` |
| Salida | `sig`, `bak`, `ovrl`, `p808` |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 14 / 0 |
| Fecha de publicacion | 2026-10-18 |

## Arquitectura y entrenamiento

El modelo es una conversión de los dos modelos ONNX oficiales de DNSMOS a módulos PyTorch cargables con `AutoModel.from_pretrained(..., trust_remote_code=True)`. El predictor P.835 estima las tres dimensiones de la recomendación ITU-T P.835 (señal, ruido de fondo y calidad global), mientras que el predictor P.808 produce un único MOS global. Ambos se ejecutan dentro del mismo objeto y se invocan con `model(wav, sampling_rate=sr)`, devolviendo un objeto con los atributos `sig`, `bak`, `ovrl` y `p808`.

No se documentan en la información disponible los datos de entrenamiento originales (número de tokens o de clips, composición del dataset, estrategia de anotación subjetiva) ni si hubo ajuste por RLHF u otro refinamiento; esa información corresponde al trabajo original de Microsoft y no se reproduce en esta model card. La contribución técnica de esta publicación es de ingeniería: replicar fielmente la inferencia en PyTorch puro, incluyendo el remuestreo, y ofrecer una verificación de equivalencia numérica contra la implementación de referencia.

La model card incluye una comprobación de paridad: para un fichero a 16 kHz, las cuatro puntuaciones obtenidas con este modelo deben satisfacer `torch.testing.assert_close` frente a las de `dnsmos_local.ComputeScore` con los ONNX originales. Se advierte de que para entradas que no estén a 16 kHz el remuestreo difiere y no debe esperarse coincidencia exacta. También se documenta el procesamiento por lotes con padding mediante `input_lengths`, lo que evita tener que puntuar clip a clip.

## Capacidades

- Estimación sin referencia de calidad de voz: devuelve MOS de señal (`sig`), ruido de fondo (`bak`) y global (`ovrl`) según el marco P.835.
- Estimación de MOS global según P.808 (`p808`), útil como métrica única comparable entre sistemas.
- Inferencia en lote: acepta un tensor `[batch_size, max_length]` con `input_lengths` para procesar varios clips con padding.
- Ejecución en CPU o GPU indistintamente, sin dependencias de `onnxruntime` ni de código auxiliar externo.
- Integración directa con el ecosistema `transformers` (`AutoModel`, `trust_remote_code`).
- Remuestreo interno para entradas que no estén a 16 kHz (con resultado no equivalente al de la referencia ONNX).
- No realiza transcripción, generación de texto, diálogo, tool calling ni razonamiento multi-paso; no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Evaluación objetiva de pipelines TTS: puntuar cada audio sintetizado con `ovrl` y `p808` para detectar regresiones de calidad entre versiones del modelo sin necesidad de escuchas manuales.
- Control de calidad en datasets de ASR: filtrar clips con `sig` o `bak` bajos antes de entrenar, reduciendo ruido y artefactos en el corpus de forma automática y a coste muy bajo (362k parámetros).
- Conversión de voz y clonación (ecosistema Project Beatrice): usar `sig`/`ovrl` como métrica de referencia para comparar configuraciones de conversión o de entrenamiento, tal como sugiere el contexto del proyecto.
- Monitorización de calidad en VoIP y videoconferencia: puntuar segmentos de llamada para detectar degradación por ruido de fondo (`bak`) o por pérdida de señal (`sig`) y activar alertas o rutas de fallback.
- A/B testing de algoritmos de reducción de ruido o mejora de voz: comparar `bak` antes y después del procesado y verificar que `sig` no se degrada en el proceso.
- Integración en CI/CD de audio: ejecutar un test automático en cada commit que verifique que un clip de referencia mantiene sus puntuaciones dentro de una tolerancia, bloqueando el despliegue si empeora.
- Investigación en evaluación de métricas: banco de pruebas para comparar DNSMOS con otras métricas sin referencia (PESQ, STOI, NISQA) sin instalar dependencias ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación descrita es la comprobación de equivalencia numérica con la implementación ONNX de referencia de Microsoft a 16 kHz, que la model card presenta como aserción de test (`torch.testing.assert_close`) y no como tabla de resultados. No se han encontrado datos de correlación con MOS subjetivo, RMSE ni coeficientes de correlación en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión estándar. Con 361.853 parámetros, los pesos en fp32 ocupan aproximadamente 1,4 MB; el consumo real lo domina la ventana de audio y el tamaño del lote, no el modelo.
- GPU recomendadas: cualquiera, incluida una GTX 1050 o una iGPU; no se requiere A100, H100 ni RTX 4090. Para volúmenes grandes, una GPU consumer acelera el procesado por lotes.
- ¿Cabe en GPU consumer? Sí, con enorme margen; también funciona en CPU para uso individual o por lotes moderados.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` sobre `torch` + `torchaudio`; los ONNX originales de Microsoft con `onnxruntime` como alternativa de referencia. vLLM y TGI no aplican, al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La referencia del ecosistema Project Beatrice cita inferencia en tiempo real por debajo de 50 ms, pero ese dato corresponde a su sistema de conversión de voz, no a este medidor de calidad.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Salidas | Dependencias | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (dnsmos-torch-native) | Port PyTorch de DNSMOS P.835 + P.808 | 361.853 | sig, bak, ovrl, p808 | torch, torchaudio, transformers | MIT (codigo) + CC BY 4.0 (pesos) | HuggingFace, 14 descargas |
| DNSMOS original (Microsoft DNS-Challenge) | ONNX | No disponible en la informacion | sig, bak, ovrl, p808 | onnxruntime + `dnsmos_local.py` | No disponible en la informacion | GitHub de DNS-Challenge |
| NISQA | Red neuronal para calidad de voz | No disponible en la informacion | MOS de calidad y dimensiones de ruido | Repositorio y pesos propios | No disponible en la informacion | Publico (GitHub) |
| TorchAudio SQUIM | Metricas objetivas en torchaudio | No disponible en la informacion | PESQ, STOI, estimacion de MOS | torchaudio | No disponible en la informacion | Incluido en torchaudio |

La ventaja diferencial de este checkpoint frente al DNSMOS original es la ausencia de `onnxruntime` y de código auxiliar, junto con el soporte nativo de lotes con padding; su desventaja es que depende de `trust_remote_code` y de un repositorio con muy poca adopción (0 likes, 14 descargas), lo que reduce la garantía de mantenimiento.

## Limitaciones y advertencias

- Modelo de regresión acústica: no genera texto, no razona y no admite instrucciones; cualquier uso como modelo conversacional es inválido.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de puntuaciones poco fiables fuera de la distribución de entrenamiento (códigos, música, ruido extremo, voces sintéticas muy artificiales).
- Frecuencia de muestreo: para entradas distintas de 16 kHz el remuestreo difiere del de la referencia ONNX y los resultados pueden no coincidir con los publicados por Microsoft. La propia model card lo advierte.
- No se documentan sesgos por idioma, género, acento o tipo de micrófono; al no haber información, conviene validar con muestras propias antes de usarlo como criterio de filtrado agresivo.
- Licencia mixta: el código es MIT, pero los pesos convertidos son CC BY 4.0, lo que exige atribución. Además, la licencia de los pesos originales de Microsoft no se detalla en la información disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Discrepancia de identificadores: la model card usa `prj-beatrice/dnsmos-torch-native` en el ejemplo de código, mientras que el repositorio consultado es `Allinsama/prj-beatrice__dnsmos-torch-native`. Hay que ajustar el identificador al cargar el modelo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; en entornos de producción conviene auditar o fijar una revisión concreta.
- Madurez muy baja: 0 likes, 14 descargas y ausencia de tests públicos más allá de la aserción descrita; no hay garantía de soporte ni de compatibilidad futura con versiones de `transformers`.
- Uso previsto como métrica auxiliar, no como sustituto de pruebas subjetivas formales (ITU-T P.835/P.808 con panel humano) en certificaciones de calidad.

## Enlaces

- Modelo en HuggingFace (Allinsama): https://huggingface.co/Allinsama/prj-beatrice__dnsmos-torch-native
- Modelo en HuggingFace (espacio prj-beatrice): https://huggingface.co/prj-beatrice/dnsmos-torch-native
- Ficheros y versiones: https://huggingface.co/prj-beatrice/dnsmos-torch-native/tree/main
- DNSMOS original de Microsoft (DNS-Challenge): https://github.com/microsoft/DNS-Challenge/tree/master/DNSMOS
- Project Beatrice V2 (ecosistema de conversión de voz): https://project-beatrice-v2.github.io/Beatrice-website/
- Listado de modelos de prj-beatrice: https://essamamdani.com/ai-models/company/prj-beatrice

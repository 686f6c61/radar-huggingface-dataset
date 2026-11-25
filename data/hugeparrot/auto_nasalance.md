# hugeparrot/Auto_Nasalance

## Resumen

Auto Nasalance es un modelo de estimación acústica de nasalancia por trama (framewise) a partir de una señal de voz monocanal. Lo desarrollan Bowen Jiang y Zhongmin Chen, del Departamento de Lengua y Literatura Chinas de la Universidad Fudan (Shanghái), y se distribuye como un fine-tuning completo de WavLM-Large con un decodificador lineal estructurado. El problema que aborda es la medición objetiva de nasalancia (el cociente entre energía nasal y oral) sin necesidad de instrumentación nasométrica dedicada ni de una segunda señal de referencia, algo relevante en fonética clínica, logopedia y análisis del habla.

El paquete contiene la configuración "Proposed" del artículo (`proposed_wavlm_full_structured`), con semilla fija 3407 y checkpoint seleccionado en validación en la época 19. Incluye el codificador WavLM-Large afinado por completo y el decodificador, por lo que no requiere descargar por separado los pesos de inicialización preentrenados para inferencia. El repositorio pesa 1,3 GB y el fichero de pesos `weights/model.pt` ocupa 1.263.180.560 bytes.

Es relevante ahora porque ofrece una alternativa puramente acústica y software-defined a la nasometría tradicional, con salida en una rejilla temporal de 10 ms y ocho cocientes de banda, además de probabilidades de actividad de habla y sonoridad. El modelo está orientado al chino (`zh`) y su uso previsto es la investigación y el análisis fonético, no un diagnóstico clínico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WavLM-Large (transformer convolucional) con mezcla aprendida de capas del codificador y decodificador lineal estructurado |
| Parametros totales | no disponible (pesos de 1.263.180.560 bytes; 501 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio de 0,1 a 20 s por fichero en el endpoint estándar (hasta 60 s en la aplicación en vivo) |
| Tipos de cuantizacion | no disponible (solo pesos PyTorch en `weights/model.pt`) |
| Idiomas soportados | chino (`zh`) |
| Licencia | código MIT; pesos CC BY-SA 3.0 (hereda la licencia del modelo base UniSpeech/WavLM-Large) |
| Formato de pesos | PyTorch (`model.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de WavLM-Large (`microsoft/wavlm-large`) y aplica un fine-tuning completo del codificador, con una mezcla aprendida de capas del encoder. Sobre esa representación se sitúa un decodificador lineal por trama que comparte una proyección estructurada para ocho cocientes de energía: el cociente RMS de nasalancia definido por software en 350–650 Hz, el cociente de banda completa y seis sub-bandas (80–250, 250–500, 500–1000, 1000–2000, 2000–4000 y 4000–7600 Hz). Las salidas son ratios en [0, 1] junto con probabilidades de actividad de habla y de sonoridad.

El entrenamiento utiliza objetivos de canal nasal/oral fijos, aleatorización de micrófono virtual y consistencia entre vistas emparejadas. La predicción se emite en una rejilla de 10 ms con `floor(n_samples / 160) + 1` tramas desde 0 s, sin suavizado ni calibración adicional sobre las predicciones crudas. El paquete no incluye datos de audio de participantes, manifiestos ni estados de optimizador; solo código de inferencia, configuración, documentación y los tensores seleccionados. La carga es estricta: el loader verifica el SHA-256 de los pesos, usa `weights_only=True` y exige coincidencia exacta del state-dictionary.

## Capacidades

- Estimación de nasalancia acústica por trama a partir de una única señal de voz monocanal, sin micrófono nasal.
- Salida de ocho cocientes de energía (nasalancia 350–650 Hz, banda completa y seis sub-bandas).
- Predicción de probabilidad de actividad de habla y de sonoridad por trama.
- Exportación de trayectorias temporales en CSV, JSON y matriz Praat, con celdas excluidas marcadas como vacías, `null` o `--undefined--` en lugar de cero.
- Máscara de visualización/exportación basada en la probabilidad de habla predicha con umbral 0,5; opción `--voiced-only` que exige además sonoridad ≥ 0,5.
- Inferencia en CPU mediante CLI (`infer.py`) y aplicación web vía Docker en el puerto 7860.
- Entrada de audio convertida a mono 16 kHz; acepta ficheros de 0,1 a 20 s en el endpoint estándar y micrófono en vivo hasta 60 s en la aplicación online.
- No soporta tool calling, agentes ni razonamiento multi-turno: es un estimador de regresión acústica, no un modelo generativo.

## Casos de uso

- Investigación fonética y prosódica: medir la nasalancia a lo largo del tiempo en corpus de habla china para estudiar coarticulación y grados de nasalidad en vocales y consonantes, usando la rejilla de 10 ms y los ocho cocientes de banda.
- Logopedia y evaluación del habla: obtener trayectorias objetivas de nasalancia en grabaciones de pacientes con hipernasalidad o hiponasalidad, como apoyo a la evaluación perceptual y sin necesidad de nasómetro hardware.
- Análisis clínico exploratorio: comparar patrones de nasalancia antes y después de intervenciones (por ejemplo, en fisura palatina) a partir de muestras cortas de 0,1–20 s procesadas por lotes.
- Docencia y formación en fonética acústica: usar la aplicación web con carga por lotes, reproducción de grabaciones y visualización de trayectorias descargables para ilustrar la relación entre energía nasal y oral.
- Procesamiento por lotes en pipelines de investigación: integrar `infer.py` en scripts que procesen corpus completos en CPU, con exportación CSV/JSON y control de no sobrescritura de salidas.
- Análisis en tiempo real en entornos controlados: emplear la entrada de micrófono en vivo (hasta 60 s) de la aplicación ModelScope para retroalimentación inmediata en sesiones de evaluación.
- Desarrollo de herramientas de análisis del habla: reutilizar el código MIT y los pesos CC BY-SA 3.0 para construir visores o métricas derivadas, respetando la atribución y la licencia de compartición igual.

## Benchmarks y rendimiento

Los datos publicados corresponden a las medias de cinco semillas del artículo, no a mediciones de esta semilla desplegada concreta:

| Metrica | Protocolo | CCC | MAE (puntos porcentuales) |
|---|---|---|---|
| Nasalancia nominal | Medias de cinco semillas | 0,9239 | 8,09 |
| Nasalancia bajo estrés conjunto | Medias de cinco semillas (ganancia relativa, retardo de canal y ruido aditivo variables) | 0,9091 | 9,03 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ocupan aproximadamente 1,26 GB, por lo que en FP32 se necesita del orden de 1,3 GB solo para el modelo, más activaciones y buffers de audio.
- El CLI está diseñado para ejecutarse en CPU, según la model card.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente memoria para cargar los tensores podría usarse, pero no hay datos publicados.
- Cabe en GPU de consumo por tamaño de pesos, aunque el autor no lo confirma ni indica modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: CLI `infer.py` (PyTorch, Python 3.12 recomendado) y contenedor Docker con aplicación web en el puerto 7860. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no son aplicables a este estimador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de estimación acústica de nasalancia en la documentación proporcionada. Como referencia del modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Auto Nasalance | no disponible (pesos 1,26 GB) | audio de 0,1–20 s por fichero | Regresión de nasalancia por trama | Código MIT, pesos CC BY-SA 3.0 | Hugging Face y ModelScope |
| microsoft/wavlm-large | no disponible | no disponible | Representaciones de voz auto-supervisadas | UniSpeech CC BY-SA 3.0 | Hugging Face |

No hay datos de rendimiento de alternativas específicas de nasalancia para comparar CCC o MAE.

## Limitaciones y advertencias

- Modelo especializado en chino (`zh`); no hay evidencia de generalización a otros idiomas.
- Entrenado y validado con datos de habla no públicos por restricciones éticas, lo que impide reproducir el entrenamiento y auditar la distribución de los datos.
- Las métricas publicadas son medias de cinco semillas; el rendimiento de esta semilla concreta (3407, época 19) puede diferir.
- La máscara de despliegue (probabilidad de habla predicha ≥ 0,5) difiere de la máscara de referencia de habla/energía usada en la evaluación emparejada del artículo, por lo que los resultados en producción no son directamente comparables con los del paper.
- Las predicciones crudas no reciben suavizado ni calibración; pueden presentar ruido trama a trama.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de estimaciones erróneas en condiciones acústicas no vistas (ruido, canales distintos, patologías vocales).
- No es un dispositivo médico ni sustituye a la nasometría instrumental en diagnóstico clínico; su uso previsto es la investigación.
- Licencia de pesos CC BY-SA 3.0: el uso comercial exige cumplir atribución y compartición igual; el código es MIT, pero los pesos no.
- Requiere carga estricta del state-dictionary y verificación SHA-256; no es compatible con `AutoModel.from_pretrained()`.
- El endpoint estándar limita la entrada a 20 s por fichero; solo la aplicación en vivo admite hasta 60 s.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugeparrot/Auto_Nasalance
- Aplicación online en ModelScope: https://modelscope.cn/studios/SuperTaurus/auto-nasalance
- Modelo base WavLM-Large: https://huggingface.co/microsoft/wavlm-large
- Licencia UniSpeech CC BY-SA 3.0: https://github.com/microsoft/UniSpeech/blob/main/LICENSE
- ORCID de Bowen Jiang: https://orcid.org/0000-0002-7386-290X
- Paper, repositorio de código y demos adicionales: no disponibles en la información proporcionada.

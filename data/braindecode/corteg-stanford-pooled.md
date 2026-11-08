# braindecode/corteg-stanford-pooled

## Resumen

CORTEG (Stanford, pooled) es un modelo de decodificación neuronal desarrollado por Liuyin Yang y colaboradores (Universidad de Stanford y Ghent University) y distribuido en formato compatible con Braindecode. Se trata de una adaptación del backbone ST-EEGFormer-small —un transformer preentrenado con señales EEG de cuero cabelludo— transferido a electrocorticografía (ECoG) intracraneal y ajustado para predecir la flexión de los cinco dedos de la mano a partir de ventanas de 1 segundo de señal cortical. El modelo forma parte del trabajo presentado en NeurIPS 2026 sobre transferencia de representación entre modalidades cerebrales (de EEG a señales intracraneales).

El modelo resuelve un problema clásico de interfaces cerebro-máquina (BCI): la decodificación cinemática de movimientos finos de la mano desde ECoG. Con 25,46 millones de parámetros totales, incorpora un adaptador espacial, factores LoRA (r=4, alpha=16) en los bloques 4 a 7 del transformer, un patch embedding de alta frecuencia gamma y un readout de regresión de cinco salidas. El checkpoint aquí publicado agrupa los datos de los 9 pacientes del conjunto Stanford y reporta un coeficiente de correlación de Pearson medio de 0,554, según los autores.

Su relevancia actual radica en que demuestra que un modelo fundacional preentrenado con EEG no invasivo puede transferirse a ECoG invasivo mediante un adaptador ligero (apenas 297.236 parámetros entrenables), reduciendo drásticamente los requisitos de datos para nuevas aplicaciones de neuroprótesis. La conversión a `braindecode.models.CORTEG` facilita su uso reproducible dentro del ecosistema Braindecode.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ST-EEGFormer-small) adaptado a ECoG con adaptador espacial, LoRA en bloques 4-7 y patch embedding de alta gamma |
| Parámetros totales | 25.461.524 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 1 s de ECoG (128 muestras a 128 Hz; 200 muestras a 200 Hz en la rama de alta gamma) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de señales neuronales, no de texto) |
| Licencia | MIT (adaptador y backbone); código Braindecode bajo BSD-3-Clause |
| Formato de pesos | safetensors (compatible con `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo parte de ST-EEGFormer-small, un transformer preentrenado con EEG de cuero cabelludo, que permanece congelado durante el ajuste. Sobre él se añade un adaptador espacial que proyecta los contactos ECoG a la geometría esperada por el backbone, factores LoRA de rango 4 y alpha 16 en los bloques 4 a 7, un patch embedding específico para la envolvente Hilbert de 70-200 Hz (alta gamma) y un readout lineal de cinco salidas. En total, el adaptador entrenable contiene 297.236 parámetros, que se fusionan con los pesos del backbone en la conversión final (escala alpha/r = 4), produciendo un `CORTEG` plano.

El entrenamiento se realizó sobre la partición de entrenamiento de los 9 pacientes del conjunto Stanford (los primeros 400 s de cada registro, dos tercios de uno de ellos por debajo de 600 s), agrupando todos los sujetos en un único modelo. El preprocesado sigue el pipeline del artículo: filtro notch a 60, 120 y 180 Hz, referencia promedio común, señal remuestreada a 128 Hz para la rama principal y envolvente Hilbert de 70-200 Hz a 200 Hz para la rama de alta gamma, con estandarización z-score por canal usando las estadísticas de las ventanas de entrenamiento. La conversión reproduce las salidas originales con un error máximo de 1,5e-06 en float32 sobre CPU para montajes de 8 y 46 contactos.

## Capacidades

- Decodificación de flexión de los cinco dedos (pulgar, índice, medio, anular y meñique) a partir de 1 s de ECoG, con salida de 5 valores z-scoreados por dedo.
- Procesamiento de dos flujos de la misma ventana temporal: señal de 128 Hz y envolvente de alta gamma de 200 Hz.
- Adaptación a montajes arbitrarios de electrodos: acepta cualquier número de canales y posiciones pasadas en `chs_info`, `n_chans` o `pos`.
- Transferencia de representación desde EEG de cuero cabelludo a ECoG intracraneal mediante adaptadores ligeros.
- Inferencia en CPU y GPU con pesos en safetensors y API de `from_pretrained` de Braindecode.
- No soporta tool calling, agentes, generación de texto, visión ni capacidades multilingües: es un modelo puramente de regresión sobre señales neuronales.

## Casos de uso

- Investigación en interfaces cerebro-máquina para neuroprótesis de mano: el modelo permite estimar la cinemática de los dedos en tiempo real a partir de ECoG y servir como base para controlar prótesis o exoesqueletos en estudios clínicos.
- Rehabilitación post-ictus: decodificar la intención de movimiento de los dedos para sistemas de retroalimentación sensorial o estimulación funcional en pacientes con parálisis parcial.
- Transferencia entre sujetos y tareas: gracias al adaptador ligero, un grupo de investigación puede ajustar el modelo con pocos minutos de datos de un nuevo paciente siguiendo el protocolo leave-one-subject-out del artículo.
- Evaluación comparativa de arquitecturas BCI: sirve como baseline público y reproducible en Braindecode para comparar nuevos decodificadores de ECoG con un modelo fundacional preentrenado.
- Análisis offline de registros clínicos: procesar sesiones de ECoG ya adquiridas para estudiar la relación entre actividad cortical y flexión de dedos en cohortes de pacientes.
- Desarrollo de pipelines de neurodecodificación en producción: integrar el modelo en un servicio de inferencia con `from_pretrained` y procesado previo estandarizado (notch, CAR, Hilbert), facilitando la reproducibilidad entre laboratorios.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Correlación de Pearson (Stanford, 9 pacientes, pooled) | 0,554 | Media de cohorte reportada por los autores para el checkpoint "CORTEG (pooled)" (Tabla 1 del artículo) |

No se han publicado en la información disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de decodificación neuronal, no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25,46 M de parámetros, ~100 MB de pesos); en float16 aproximadamente 50 MB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con más de 1 GB de VRAM, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: PyTorch nativo con `braindecode.models.CORTEG.from_pretrained`, exportación a TorchScript u ONNX, o integración en pipelines de Braindecode; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; el modelo procesa ventanas de 1 s y el coste computacional es bajo por su tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CORTEG (Stanford, pooled) | 25,46 M | 1 s de ECoG (128/200 Hz) | Flexión de 5 dedos desde ECoG | MIT | Hugging Face (braindecode) |
| ST-EEGFormer-small (backbone base) | no disponible en la información | no disponible | Representación EEG de cuero cabelludo | MIT | Hugging Face (braindecode) |
| Otros modelos de Braindecode (65+ arquitecturas publicadas) | variable | variable | Decodificación EEG/ECoG/MEG | BSD-3-Clause (código) | Braindecode |

No se dispone en la información proporcionada de resultados comparativos con otros decodificadores específicos de flexión de dedos desde ECoG.

## Limitaciones y advertencias

- El readout del modelo se publica en su inicialización aleatoria: según la model card, el artículo construyó el readout después del optimizador, por lo que nunca se entrenó y el adaptador aprendió alrededor de él. Esto puede afectar a la calibración de las salidas.
- El modelo se entrenó únicamente con los 9 pacientes del conjunto Stanford (primeros 400 s de cada registro); otros pacientes o tareas requieren ajuste fino, como en el protocolo leave-one-subject-out del artículo.
- La verificación de la conversión cubre únicamente salidas en float32 sobre CPU, no la precisión de decodificación, los kernels de GPU ni la precisión mixta.
- La geometría guardada corresponde a 8 canales; para otros montajes es obligatorio pasar `chs_info`, `n_chans` y `pos` en cada llamada.
- Riesgo de sobreajuste a la cohorte y al paradigma experimental concreto (flexión de dedos en ECoG con pipeline específico de preprocesado).
- No debe usarse como dispositivo médico ni para diagnóstico clínico sin validación adicional; es una herramienta de investigación.
- La licencia MIT permite uso comercial del adaptador y del backbone, pero el código de Braindecode es BSD-3-Clause y debe respetarse por separado.
- No se documentan sesgos demográficos ni de otro tipo en la información disponible; la generalización a poblaciones fuera de la cohorte Stanford es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/braindecode/corteg-stanford-pooled
- Backbone ST-EEGFormer-small en Hugging Face: https://huggingface.co/braindecode/STEEGFormer-small
- Documentación de `braindecode.models.CORTEG`: https://braindecode.org/stable/generated/braindecode.models.CORTEG.html
- Repositorio oficial CORTEG: https://github.com/LiuyinYang1101/CORTEG
- Repositorio ST-EEGFormer: https://github.com/LiuyinYang1101/STEEGFormer
- Artículo (arXiv): https://arxiv.org/abs/2605.10337
- Documentación de Braindecode: https://braindecode.org/stable/index.html
- Modelos disponibles en Braindecode: https://braindecode.org/1.2/models/models.html

# braindecode/bcic_iv_4_ecog_trial

## Resumen

`bcic_iv_4_ecog_trial` no es un modelo de lenguaje, sino un conjunto de artefactos de inferencia (checkpoint) publicado por el proyecto Braindecode para su tutorial de decodificacion de senales electrocorticales. Contiene los parametros de un clasificador/regresor convolucional (ShallowFBCSPNet) entrenado para predecir la flexion del dedo pulgar a partir de senales de electrocorticografia (ECoG) del sujeto 1 del BCI Competition IV dataset 4. Su proposito es que la documentacion oficial del tutorial pueda mostrar predicciones estables sin necesidad de reentrenar el modelo desde cero.

El modelo resuelve un problema de decodificacion de senales cerebrales: mapear ventanas de iEEG a un valor continuo de flexion de dedo. Es relevante para desarrolladores e investigadores que trabajan en interfaces cerebro-computadora (BCI) y quieren reproducir el flujo completo de Braindecode (carga de datos, preprocesado, entrenamiento y evaluacion) con resultados deterministas.

El repositorio es minimo (0.0 GB declarados) y contiene tres ficheros: `params.safetensors` (parametros del clasificador), `history.json` (historial de entrenamiento de Skorch para las graficas del tutorial) y `metadata.json` (metricas resumen del checkpoint). No se trata de un modelo generativo ni multimodal; es un artefacto de referencia para un ejemplo concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ShallowFBCSPNet (CNN superficial sobre senales EEG/ECoG) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventanas temporales de senal, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`params.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es ShallowFBCSPNet, una red convolucional superficial disenada para decodificar senales electrofisiologicas crudas. Se entrena como regresor supervisado sobre la flexion del dedo 1 (pulgar) unicamente (`target_transform x[0:1]`), usando solo el sujeto 1 del BCI Competition IV dataset 4 (ECoG de flexion de dedos, 3 sujetos en total, cargado con `BCICompetitionIVDataset4` desde la libreria Miller ECoG).

El entrenamiento se realizo sobre grabaciones completas (el ejemplo de la galeria recorta a 30 s, pero el entrenador no). Las ventanas de la sesion de entrenamiento se dividieron cronologicamente (`train_test_split shuffle=False, test_size=0.2`): el primer 80% se uso para actualizaciones de gradiente y el ultimo 20% como validacion para `EarlyStopping(load_best=True)`. La sesion de test de la competicion se reservo exclusivamente para reportar el coeficiente de correlacion de Pearson de test. No se documenta el numero de tokens ni un dataset de preentrenamiento general, ya que no aplica a este tipo de modelo.

## Capacidades

- Regresion de flexion de dedo (pulgar) a partir de ventanas de ECoG del sujeto 1.
- Decodificacion de senales electrofisiologicas crudas mediante CNN superficial.
- Inferencia determinista para reproducir las predicciones mostradas en la documentacion de Braindecode.
- Carga directa mediante `from_pretrained`, que lee el campo `datasets:` de la model card en `model.card_data.datasets`.
- Integracion con el ecosistema Braindecode (PyTorch, Skorch) y con el dataset BCIC-IV-4.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision, audio ni generacion de texto.

## Casos de uso

- Reproduccion del tutorial oficial: cargar `params.safetensors` con `from_pretrained` para ejecutar `examples/applied_examples/bcic_iv_4_ecog_trial.py` y obtener predicciones estables sin reentrenar.
- Docencia en interfaces cerebro-computadora: usar el checkpoint como punto de partida para explicar el pipeline completo de Braindecode (carga de datos, preprocesado, entrenamiento y evaluacion con correlacion de Pearson).
- Validacion de pipelines de decodificacion: comparar los resultados de un nuevo preprocesado o arquitectura contra este checkpoint de referencia en el mismo sujeto y dataset.
- Generacion de graficas de historial de entrenamiento: `history.json` permite reconstruir las curvas de perdida y metricas usadas en las figuras del tutorial.
- Benchmarking interno de modelos BCI: emplear las metricas de `metadata.json` como linea base para experimentos de regresion de flexion de dedo.
- Pruebas de integracion de Braindecode en CI: verificar que la carga de pesos, la construccion del modelo y la inferencia funcionan correctamente en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la metrica reportada es el coeficiente de correlacion de Pearson de test sobre la sesion de test de la competicion, pero no se proporciona el valor numerico en la informacion suministrada; `metadata.json` contiene un resumen de metricas del checkpoint, aunque su contenido no se detalla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una CNN superficial sobre ventanas de senal, la huella es muy reducida y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA o incluso CPU es suficiente para la inferencia del checkpoint.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer moderna (no se aportan medidas concretas).
- Opciones de despliegue: carga via Braindecode/PyTorch y `from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `braindecode/bcic_iv_4_ecog_trial` | ShallowFBCSPNet | no disponible | no aplica | BSD-3-Clause | Hugging Face |
| Otros checkpoints de tutorial de Braindecode | ShallowFBCSPNet / otras | no disponible | no aplica | BSD-3-Clause | Hugging Face (organizacion braindecode) |
| Modelos BCI de la literatura (p. ej. EEGNet, Deep4Net) | CNN | no disponible | no aplica | variable | Implementaciones en Braindecode |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado unicamente con el sujeto 1 del BCIC-IV-4; no generaliza a otros sujetos ni a otros datasets sin reentrenamiento.
- Predice solo la flexion del dedo 1 (pulgar); no cubre el resto de dedos ni otras tareas motoras.
- Es un artefacto de tutorial, no un modelo listo para produccion clinica o comercial.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni capacidades generativas.
- Riesgo de sobreajuste al sujeto y a la sesion de entrenamiento; las metricas de test corresponden a la sesion de competicion del mismo sujeto.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero debe citarse tambien el modelo y los datasets originales.
- No se documentan sesgos, limitaciones de contexto ni restricciones adicionales mas alla de las indicadas.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/bcic_iv_4_ecog_trial
- Metadata del checkpoint: https://huggingface.co/braindecode/bcic_iv_4_ecog_trial/resolve/main/metadata.json
- Braindecode (documentacion): https://braindecode.org/stable/index.html
- Braindecode API: https://braindecode.org/stable/api.html
- Braindecode en GitHub: https://github.com/braindecode
- Braindecode en Hugging Face: https://huggingface.co/braindecode
- Braindecode en PyPI: https://pypi.org/project/braindecode/
- BCI Competition IV dataset 4: https://www.bbci.de/competition/iv/#dataset4
- Zenodo (cita del software): https://doi.org/10.5281/zenodo.17699192
- NEMAR: https://nemar.org

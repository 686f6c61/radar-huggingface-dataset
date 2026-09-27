# PierreGtch/eeg-fm-masking_mae_rone_L16

## Resumen

eeg-fm-masking_mae_rone_L16 es un codificador de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio controlado *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de uno de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (5 radios espaciales por 6 longitudes temporales, en dos marcos: MAE y JEPA), lo que lo convierte en una pieza de un experimento factorial diseñado para aislar el efecto del enmascaramiento sobre el rendimiento downstream.

El modelo concreto de esta ficha usa el marco MAE (masked autoencoder) con radio espacial r equivalente a un canal y longitud temporal L = 16 parches, con un 45 % de parches sin enmascarar (pct_unmasked = 0.45). El codificador tiene 12,69 millones de parámetros, opera a 200 Hz sobre parches de 1 segundo (200 muestras con 20 muestras de solapamiento) y es agnóstico al montaje: admite cualquier número y conjunto de canales siempre que cada uno tenga una posición 3D en metros.

Su relevancia radica en dos factores. Primero, sirve como extractor de características congeladas para evaluar tareas EEG heterogéneas (sueño, epilepsia, atención, imaginación motora, depresión) mediante una sonda ridge, sin reentrenar el modelo. Segundo, al formar parte de una comparativa controlada, permite aislar qué configuraciones de enmascaramiento transfieren mejor, y el propio artículo recomienda la configuración r = 9 cm, L = 2 por encima de la que aquí se documenta. Los pesos se distribuyen bajo licencia CC-BY-4.0, lo que facilita su reutilización en investigación y productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (patch tokeniser + transformer) y decodificador MAE ligero para reconstruccion |
| Parametros totales | 12.692.096 (solo codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como numero de tokens; procesa parches de 1 s a 200 Hz (200 muestras, 20 de solapamiento) y admite cualquier numero de canales |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (entrada de senal EEG, no texto) |
| Licencia | cc-by-4.0 (codigo bajo MIT) |
| Formato de pesos | safetensors (encoder only: `feature_encoder.*` + `model.*`) |

Parametros de configuracion del enmascaramiento:

| Parametro | Valor |
|---|---|
| Marco | MAE |
| Radio espacial de mascara `r` | un canal |
| Longitud temporal de mascara `L` | 16 parches |
| `pct_unmasked` | 0.45 |
| Checkpoint | epoca 10 de 10 (`v9`) |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios (escalado interno: factor 1e+06 + `median_std_clip`, recorte en sigma = 15) |
| Posiciones de canal | metros (MNE `info["chs"][i]["loc"][:3]`) |

## Arquitectura y entrenamiento

El modelo es un masked autoencoder: el codificador procesa unicamente los parches no enmascarados y un decodificador ligero reconstruye la senal cruda de los parches ocultos. La parte distribuida en el repositorio contiene exclusivamente el codificador, es decir, el tokenizador de parches (`feature_encoder.*`) y el transformer (`model.*`); el decodificador MAE no se incluye porque los tensores publicados son exactamente los cargados en la evaluacion downstream del articulo. El escalado de entrada lo realiza el propio wrapper: multiplica por 1e+06 y aplica un `median_std_clip` por ventana con recorte en sigma = 15, por lo que no debe estandarizarse la senal previamente. La configuracion del wrapper (`config.json`) debe pasarse sin modificar como `model_kwargs`.

El preentrenamiento utiliza el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El calendario es de 10 epocas sobre 2 GPU H100, con tamano de lote 600 por GPU, tasa de aprendizaje 0.00024, calentamiento de 3080 pasos, valor final 1e-06 y weight decay 0.01. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa, ni el numero total de tokens de entrenamiento. La innovacion metodologica principal no es arquitectonica sino experimental: 58 encoders con receta identica que permiten atribuir las diferencias de rendimiento unicamente a la geometria de enmascaramiento.

## Capacidades

- Extraccion de caracteristicas EEG: produce representaciones contextuales utilizables por sondas lineales (ridge) sobre tareas de clasificacion y regresion.
- Clasificacion de tareas cognitivas y patologicas: se evaluo con exito variable en deteccion de eventos, sueno, epilepsia, imaginacion motora y depresion.
- Agnosticismo al montaje: acepta cualquier numero y conjunto de canales siempre que dispongan de posicion 3D en metros.
- Aprendizaje autosupervisado: preentrenado sin etiquetas mediante reconstruccion de parches enmascarados.
- Adaptacion por fine-tuning: integrable en OpenEEGBench mediante `PretrainedBackbone` para fine-tuning o evaluacion con congelado.
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje.
- No tiene modo de razonamiento explicito, vision, audio ni capacidades multilingues en el sentido convencional.
- Metadatos de reproducibilidad: `metadata.json` incluye parametros de enmascaramiento, id de ejecucion en W&B y epoca/paso del checkpoint.

## Casos de uso

- Clasificacion de eventos en EEG (tuev): congelando el codificador y anadiendo una sonda ridge se alcanza balanced accuracy de 0.940, adecuado para pipelines de etiquetado de eventos patologicos sin reentrenar el backbone.
- Deteccion de crisis epileptica (chbmit): balanced accuracy de 0.895 en evaluacion congelada, util para sistemas de alerta que requieren una senal preliminar antes de un diagnostico clinico.
- Deteccion de anomalias en EEG (tuab): balanced accuracy de 0.800, aplicable a cribado de registros clinicos para priorizar la revision por especialistas.
- Estadiaje del sueno (isruc-sleep): balanced accuracy de 0.641, permite prototipar clasificadores de fases del sueno sobre representaciones congeladas con coste de entrenamiento minimo.
- Apoyo al diagnostico de depresion (mdd_mumtaz2016): balanced accuracy de 0.825, como componente de estudios exploratorios con senales EEG en entornos controlados.
- Investigacion comparativa de metodos de enmascaramiento: sirve como punto de referencia dentro de los 58 encoders para medir el efecto de la geometria de mascara en tareas downstream.
- Experimentacion con imaginacion motora (bcic2a, bcic2020-3): pese al rendimiento limitado (0.429 y 0.265), permite reproducir la comparativa y analizar que geometrias transfieren mejor a interfaces cerebro-ordenador.
- Investigacion en carga cognitiva (arithmetic_zyma2019): balanced accuracy de 0.710, aprovechable para estudiar correlatos EEG de esfuerzo mental en laboratorio.

## Benchmarks y rendimiento

Resultados del articulo en OpenEEGBench con codificador congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 conjuntos de datos, 5 semillas, balanced accuracy para clasificacion y R² para `seed-vig`):

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0.710 ± 0.026 | 5 |
| bcic2020-3 | balanced acc. | 0.265 ± 0.015 | 5 |
| bcic2a | balanced acc. | 0.429 ± 0.014 | 5 |
| chbmit | balanced acc. | 0.895 ± 0.023 | 5 |
| faced | balanced acc. | 0.296 ± 0.003 | 5 |
| isruc-sleep | balanced acc. | 0.641 ± 0.003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0.825 ± 0.009 | 5 |
| physionet | balanced acc. | 0.571 ± 0.004 | 5 |
| seed-v | balanced acc. | 0.285 ± 0.002 | 5 |
| seed-vig | R² | -0.143 ± 0.010 | 5 |
| tuab | balanced acc. | 0.800 ± 0.004 | 5 |
| tuev | balanced acc. | 0.940 ± 0.026 | 5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 50,8 MB en fp32 y 25,4 MB en fp16 para los 12,69 M de parametros, sin contar activaciones ni buffers.
- Inferencia: cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 o integradas modestas; tambien puede ejecutarse en CPU para lotes pequenos.
- GPU recomendadas para entrenamiento o evaluacion a escala: H100 o A100 son las usadas en el preentrenamiento (2 x H100), pero para fine-tuning de sondas basta una GPU de gama media.
- Despliegue: se carga mediante `safetensors.torch.load_file` y el wrapper `ContextualEncoderBenchmarkWrapper` del paquete `eeg_fm_masking`; para evaluacion/fine-tuning se integra con OpenEEGBench mediante `PretrainedBackbone`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto ni usa formato GGUF.
- Latencia y throughput: no disponible (la informacion proporcionada no incluye mediciones de latencia ni de rendimiento en tiempo real).

## Comparativa con modelos similares

El propio articulo define el universo de comparacion: 58 encoders entrenados con receta identica en los que solo cambia la geometria de enmascaramiento. La configuracion recomendada por los autores es r = 9 cm, L = 2, disponible en los modelos `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`.

| Modelo | Marco | Mascara (r, L) | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_rone_L16 (este) | MAE | un canal, 16 parches | 12,69 M (encoder) | cc-by-4.0 | Configuracion de mascara documentada en esta ficha |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm, 2 parches | no disponible | cc-by-4.0 | Configuracion recomendada por el articulo |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm, 2 parches | no disponible | cc-by-4.0 | Configuracion recomendada por el articulo; pesos del encoder estudiante |
| Otros foundation models EEG (LaBraM, BIOT, EEGPT) | varios | no aplica | no disponible | no disponible | No se proporcionan especificaciones ni resultados de estos modelos en la informacion disponible |

No se ha facilitado en la informacion de origen una comparativa numerica directa entre este modelo y alternativas de terceros en los mismos conjuntos de datos.

## Limitaciones y advertencias

- Rendimiento muy desigual: el R² en `seed-vig` es negativo (-0.143), lo que indica que el codificador congelado no captura bien esa tarea; en `bcic2a` (0.429), `bcic2020-3` (0.265), `faced` (0.296) y `seed-v` (0.285) los resultados son claramente bajos.
- La configuracion de mascara de este checkpoint (r = un canal, L = 16) no es la recomendada por los autores, que prefieren r = 9 cm y L = 2; usarla como opcion por defecto puede ser suboptimo.
- Riesgo de mal uso clinico: los resultados se obtuvieron con sonda ridge sobre caracteristicas congeladas y no equivalen a validacion clinica; no debe emplearse para diagnostico sin validacion adicional.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios, posiciones de canal en metros. Introducir datos con otro escalado, frecuencia o sin posicion 3D puede degradar o invalidar los resultados.
- El repositorio solo distribuye el codificador; el decodificador MAE no esta incluido, por lo que no es posible reproducir la tarea de reconstruccion solo con estos pesos.
- Sesgos: no se documenta un analisis de sesgo demografico, de equipo de registro o de procedencia de los sujetos; el corpus REVE es un subconjunto abierto de 323 grabaciones y su composicion puede condicionar la generalizacion.
- Licencia: pesos bajo CC-BY-4.0 (permite uso comercial con atribucion) y codigo bajo MIT; es obligatorio citar el articulo segun lo indicado en el repositorio de GitHub.
- Idiomas: no aplica, ya que no procesa texto; cualquier afirmacion sobre capacidades linguisticas seria incorrecta.
- Contexto: no se documenta una longitud maxima de contexto en parches ni el comportamiento fuera de la ventana de 1 s por parche.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rone_L16
- Configuracion recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Configuracion recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento en W&B: https://wandb.ai/pierregtch/chan-inv-clf/runs/46gmjq13

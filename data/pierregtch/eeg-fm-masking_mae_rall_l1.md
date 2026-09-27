# PierreGtch/eeg-fm-masking_mae_rall_L1

## Resumen

eeg-fm-masking_mae_rall_L1 es un codificador (encoder) de electroencefalografía (EEG) preentrenado, desarrollado por PierreGtch y publicado como parte de una familia de 58 encoders entrenados bajo una receta idéntica en la que solo varía la geometría de enmascaramiento. El modelo se enmarca en el paper *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*, y su objetivo es servir como extractor de características congeladas para tareas downstream de EEG, evitando el coste de entrenar representaciones desde cero en cada nuevo conjunto de datos.

Técnicamente es un masked autoencoder (MAE): un tokenizador de parches convierte la señal en tokens, un transformer codifica los parches visibles y un decodificador ligero reconstruye la señal en bruto de los parches enmascarados. En este checkpoint concreto, la máscara abarca todos los canales (`r = all`) y una longitud temporal de un parche (`L = 1`), con una fracción de parches sin enmascarar del 45 %. El repositorio solo contiene el encoder (12,69 M de parámetros), que es exactamente lo que se evalúa de forma congelada en el paper; el decodificador del MAE no se distribuye.

Su relevancia radica en dos factores: la transparencia experimental (58 variantes con la misma receta permiten aislar el efecto de la geometría de enmascaramiento) y el hecho de que se entrena sobre un subconjunto con licencia abierta del corpus REVE, de modo que los pesos pueden redistribuirse bajo CC-BY-4.0. Es un modelo pequeño, agnóstico al montaje de electrodos y orientado a feature extraction, no a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (MAE): tokenizador de parches + transformer encoder; decodificador ligero no incluido en el repo |
| Parametros totales | 12.692.096 (encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; procesa ventanas divididas en parches de 1 s a 200 Hz (200 muestras, solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal EEG; el campo idiomas no esta disponible) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de masked autoencoder. La señal EEG se divide en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento) y se tokeniza mediante un `feature_encoder`. El transformer procesa únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches ocultos. La configuración de enmascaramiento de este checkpoint es radio espacial `r = all` (todos los canales), longitud temporal `L = 1` parche y `pct_unmasked = 0.45`. El modelo es agnóstico al montaje: funciona con cualquier número y conjunto de canales siempre que cada electrodo disponga de una posición 3D (MNE `info["chs"][i]["loc"][:3]`). El wrapper aplica internamente un factor de escala de 1e+06 y un `median_std_clip` con recorte en σ = 15, por lo que los datos no deben estandarizarse previamente.

El entrenamiento utilizó el subconjunto con licencia abierta del corpus de preentrenamiento REVE (323 registros), precisamente para poder redistribuir los pesos. La programación fue de 10 épocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01. El checkpoint publicado corresponde a la época 10 de 10 (versión `v9`, la evaluada en el paper). La innovación metodológica del trabajo no es una técnica de atención nueva, sino el barrido controlado de geometrías de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 frameworks MAE/JEPA) manteniendo el resto de la receta fija. Según los autores, la configuración recomendada es `r = 9 cm, L = 2`, no la de este checkpoint.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senal EEG: genera representaciones contextuales utilizables por sondas lineales (ridge) sobre las caracteristicas aplanadas.
- Aprendizaje autosupervisado de representaciones EEG mediante reconstruccion de parches enmascarados.
- Agnostico al montaje de electrodos: admite cualquier numero y disposicion de canales, siempre que cada canal tenga una posicion 3D.
- Funciona con senal a 200 Hz y ventanas de 1 s con solapamiento de 20 muestras, en unidades de voltios.
- Uso como backbone congelado para clasificacion y regresion downstream en multiples paradigmas de EEG (carga cognitiva, imagineria motora, sueno, epilepsia, emociones, EEG anormal, eventos).
- No soporta tool calling, function calling, agentes, generacion de texto, codigo, matematicas ni vision: es un modelo unimodal de senal fisiologica.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de audio o lenguaje.

## Casos de uso

- Deteccion de crisis epilepticas: utilizable como extractor de caracteristicas congelado para clasificar segmentos de EEG; en el conjunto chbmit obtiene una accuracy balanceada de 0,874 ± 0,020, lo que lo hace adecuado como etapa previa a un clasificador clinico.
- Clasificacion de eventos y artefactos en EEG (tuev): con 0,903 ± 0,044 de accuracy balanceada, sirve para preetiquetar eventos en pipelines de anotacion a gran escala.
- Deteccion de EEG anormal (tuab): con 0,783 ± 0,002, puede integrarse en sistemas de triaje que prioricen registros para revision neurologica.
- Estadificacion del sueno (isruc-sleep): con 0,682 ± 0,003, es aplicable a estudios de sueno donde se necesita un extractor rapido sobre epochs de 1 s.
- Apoyo al diagnostico de depresion a partir de EEG (mdd_mumtaz2016): con 0,807 ± 0,004, resulta util como componente de un sistema de cribado experimental.
- Interfaces cerebro-computador de imagineria motora (bcic2a, bcic2020-3): pese a las score mas bajas (0,432 ± 0,002 y 0,269 ± 0,019), puede emplearse como representacion base sobre la que afinar con datos propios del sujeto.
- Investigacion en carga cognitiva y aritmetica mental (arithmetic_zyma2019): con 0,691 ± 0,026, permite construir clasificadores de estado cognitivo en entornos experimentales.
- Extraccion de embeddings para busqueda o agrupamiento de registros EEG: al ser un encoder agnostico al montaje, facilita indexar registros heterogeneos con representaciones comparables.

## Benchmarks y rendimiento

Resultados publicados en la model card, correspondientes a encoder congelado con sonda ridge sobre las caracteristicas contextuales aplanadas (12 conjuntos de datos × 5 semillas; accuracy balanceada para clasificacion, R² para `seed-vig`).

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,691 ± 0,026 | 5 |
| bcic2020-3 | balanced acc. | 0,269 ± 0,019 | 5 |
| bcic2a | balanced acc. | 0,432 ± 0,002 | 5 |
| chbmit | balanced acc. | 0,874 ± 0,020 | 5 |
| faced | balanced acc. | 0,312 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,682 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,807 ± 0,004 | 5 |
| physionet | balanced acc. | 0,553 ± 0,003 | 5 |
| seed-v | balanced acc. | 0,282 ± 0,001 | 5 |
| seed-vig | R² | -0,380 ± 0,011 | 5 |
| tuab | balanced acc. | 0,783 ± 0,002 | 5 |
| tuev | balanced acc. | 0,903 ± 0,044 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks de este checkpoint frente a modelos de lenguaje, dado que no es un modelo de texto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12,69 M de parametros, los pesos en fp32 ocupan aproximadamente 51 MB y en fp16 unos 25 MB. La VRAM real dominante sera la de las activaciones de la ventana procesada, no los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento se realizo en 2 × H100, pero la inferencia no requiere hardware de datacenter.
- Compatibilidad con GPU de consumo: si, cabe con holgura en cualquier GPU de consumo reciente (RTX 3060/4070/4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: la via documentada es PyTorch con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y la clase `ContextualEncoderBenchmarkWrapper`; tambien se integra con OpenEEGBench mediante `PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la propia familia de 58 encoders (misma receta, solo cambia la geometria de enmascaramiento). Los resultados de los otros checkpoints no estan disponibles en la informacion proporcionada.

| Modelo | Framework | Radio `r` | Longitud `L` | Parametros | Licencia | Estado |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_rall_L1 (este) | MAE | all | 1 | 12,69 M (encoder) | CC-BY-4.0 | publicado |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | no disponible (misma receta) | CC-BY-4.0 | publicado, recomendado por el paper |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | no disponible (misma receta) | CC-BY-4.0 | publicado, recomendado por el paper |

No se dispone de datos para comparar con otros modelos fundacionales de EEG ajenos a esta familia.

## Limitaciones y advertencias

- Este checkpoint no es la configuracion recomendada por los autores: el paper sugiere `r = 9 cm, L = 2` (variantes `mae_r9cm_L2` y `jepa_r9cm_L2`).
- El repositorio contiene solo el encoder; el decodificador del MAE no se distribuye, por lo que no se puede reproducir la tarea de reconstruccion sin material adicional.
- Rendimiento bajo en varias tareas: `bcic2020-3` (0,269), `seed-v` (0,282), `faced` (0,312) y `bcic2a` (0,432) quedan cerca o por debajo de umbrales utiles, y `seed-vig` presenta R² negativo (-0,380), lo que indica peor ajuste que un predictor trivial para esa tarea.
- La senal debe aportarse a 200 Hz, en voltios y sin estandarizacion previa (el wrapper aplica su propio escalado y recorte). Ignorar estos requisitos degradara los resultados.
- Es imprescindible que cada canal disponga de posicion 3D en metros (formato MNE); sin ella el modelo agnostico al montaje no puede operar correctamente.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Riesgo de sesgo por dominio: al entrenarse sobre el subconjunto abierto de REVE (323 registros), sus representaciones pueden no generalizar a montajes, poblaciones o equipos fuera de esa distribucion.
- Aunque la licencia CC-BY-4.0 permite uso comercial, el modelo se publica como artefacto de investigacion; cualquier aplicacion clinica requeriria validacion regulatoria independiente.
- El plan de entrenamiento es corto (10 epocas), lo que puede limitar la calidad de las representaciones en comparacion con preentrenamientos mas largos.
- El codigo esta bajo MIT, mientras que los pesos estan bajo CC-BY-4.0; conviene respetar ambas licencias y citar el paper.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L1
- Variante recomendada (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/yqzaq5j1

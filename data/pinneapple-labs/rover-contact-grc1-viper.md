# PINNeAPPle-Labs/rover-contact-grc1-viper

## Resumen

`rover_contact_grc1_viper` es un sustituto neuronal informado por la física (PINN) del modelo analítico de Wong-Reece para el contacto rueda-suelo de la rueda del rover VIPER de la NASA (radio 0,25 m, anchura 0,20 m, 24 garfios) sobre el simulante lunar GRC-1. Lo desarrolla PINNeAPPle-Labs y forma parte de su zoo de modelos dentro del proyecto PINNeAPPle, con licencia Apache 2.0. No es un modelo de lenguaje: es un modelo de regresión tabular que toma dos entradas (`slip` y `sinkage_m`) y devuelve tres salidas físicas (tracción neta o drawbar pull `Fx` en N, carga normal `Fz` en N y par motor `My` en N·m).

La red es un MLP residual con activación tanh y random Fourier features: 4 bloques de 96 unidades y 78 179 parámetros en total, empaquetados en safetensors y ONNX. Su interés práctico es que sustituye la integración por cuadratura adaptativa del modelo de Wong-Reece (coste elevado) por una única evaluación de red, manteniendo un ajuste prácticamente exacto frente a la referencia analítica: R² de 0,999999 en `Fx` y `Fz`, y 0,9999985 en `My` sobre 2000 estados held-out.

El modelo se entrenó con restricciones físicas blandas (monotonía `dFz/dz >= 0` y `dFx/ds >= 0` hasta slip 0,3, límite de tracción de Mohr-Coulomb y `My >= R·Fx`) y está acotado a un dominio de validez estricto: slip en [-0,4, 0,9], hundimiento en [0,002, 0,06] m, un único suelo y una única rueda, ángulo de deriva cero y régimen estacionario. La versión publicada es la v1.1.0 (revisión `v1.1.0.post1`), con 125 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP residual con activación tanh y random Fourier features (4 bloques x 96 unidades, 16 frecuencias Fourier, escala 2,0, semilla 0) |
| Parámetros totales | 78 179 (dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo tabular con 2 entradas; no existe ventana de contexto) |
| Tipos de cuantización | no disponible (se distribuyen pesos en safetensors y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea (pipeline) | tabular-regression |
| Entradas | `slip` (adimensional) y `sinkage_m` (m) |
| Salidas | `Fx_N` (drawbar pull, N), `Fz_N` (carga normal, N), `My_Nm` (par motor, N·m) |
| Rango de validez (slip) | [-0,4, 0,9] |
| Rango de validez (hundimiento) | [0,002, 0,06] m |
| Suelo soportado | GRC-1 (base de datos de terramecánica de PINNeAPPle) |
| Rueda soportada | VIPER: R 0,25 m, b 0,20 m, 24 garfios, altura de garfio 0,025 m |
| Ángulo de deriva | 0,0 grados (sin fuerza lateral) |
| Gravedad de simulación | 1,62 m/s² (lunar) |
| Versión publicada | v1.1.0 (`v1.1.0.post1`) |
| Librería | `pinneapple` |
| Tamaño del repositorio | 0,0 GB (según HuggingFace) |
| Descargas / likes | 125 / 1 |

## Arquitectura y entrenamiento

La red (`contact_net`) es un MLP residual de 4 bloques de 96 neuronas con activación tanh, precedido por una codificación de random Fourier features de 16 frecuencias y escala 2,0. Aprende el mapeo `(slip, sinkage_m) -> (Fx, Fz, My)` del modelo de Wong-Reece para rueda rígida sobre suelo deformable (presión-hundimiento de Bekker, cizalladura de Janosi-Hanamoto), con hundimiento por deslizamiento `n = n0 + n1·s` según Ding et al. (2010, 2011), donde para GRC-1 `n0 = 0,8` y `n1 = 0,8`. Además del ajuste a los datos, el entrenamiento impone restricciones físicas blandas: monotonía `dFz/dz >= 0`, monotonía `dFx/ds >= 0` para slip <= 0,3, límite de tracción de Mohr-Coulomb y coherencia de par `My >= R·Fx`. La configuración física exacta del entrenamiento queda registrada en `data_lineage.physics` y en `config.json`, y puede comprobarse con `ZooContactSurrogate.check_physics`.

Los datos de entrenamiento proceden del dataset `PINNeAPPle-Labs/rover-contact-grc1-viper`, generado con `pinneapple_simulation.terramechanics.WongReeceModel(get_soil('GRC-1'), pinneapple_simulation.vehicle.viper().wheel)`. No se especifica en la información disponible el número de muestras de entrenamiento ni la composición completa del dataset; sí se documenta que la validación emplea 2000 estados held-out generados por Latin hypercube (semilla 1000, disjuntos del entrenamiento) y evaluados con cuadratura adaptativa como referencia analítica. No se documenta uso de RLHF ni DPO, algo esperable al no tratarse de un modelo generativo de lenguaje.

## Capacidades

- Regresión tabular de fuerzas de contacto rueda-suelo: tracción neta (`Fx`), carga normal (`Fz`) y par motor (`My`) a partir de slip y hundimiento.
- Evaluación rápida del modelo de Wong-Reece sin cuadratura numérica, apta para bucles de simulación y control.
- Cumplimiento verificado de restricciones físicas: 12 de 12 comprobaciones aplicables superadas en el informe de validación (nivel `standard`, PINNeAPPle 0.7.0, esquema `validation-report/v1`).
- Reproducibilidad de las métricas de la model card sobre la referencia almacenada (comprobación `reference.card_metrics` superada).
- Verificación cuantitativa frente a un modelo analítico independiente: credibilidad de validación 4 (supera comprobaciones contra referencia independiente o cota garantizada) y de verificación de solución 3.
- Exportación a ONNX, lo que permite inferencia en entornos sin PyTorch (por ejemplo, control a bordo o integración en C++).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo numérico de dominio específico.

## Casos de uso

- Control de tracción en tiempo real: el sustituto evalúa `Fx`, `Fz` y `My` en una sola pasada de red dentro del lazo de control de un rover, sustituyendo la cuadratura adaptativa del modelo de Wong-Reece por una evaluación de coste acotado.
- Planificación de trayectorias sobre regolito: estimar la tracción disponible para distintos pares (slip, hundimiento) a lo largo de una ruta candidata y descartar tramos donde el par motor `My` o la carga `Fz` salgan del dominio de validez.
- Estimación de estado y filtrado (EKF/UKF): usar la red como modelo de observación rápido para inferir slip o hundimiento a partir de medidas de par y carga, con la ventaja de ser diferenciable en PyTorch.
- Estudios Monte Carlo y análisis de sensibilidad: al ser una evaluación de red de 78 179 parámetros, permite barrer decenas de miles de estados (por ejemplo, muestreo Latin hypercube) en lugar de repetir integraciones numéricas.
- Aprendizaje por refuerzo para políticas de conducción: el sustituto actúa como modelo diferenciable del entorno de contacto, lo que facilita el entrenamiento de políticas de control de velocidad y deslizamiento en simulación.
- Diseño y dimensionamiento de subsistemas: calcular pares y cargas esperadas para seleccionar motorreductor y sensórica de la rueda dentro del rango válido (R 0,25 m, b 0,20 m, GRC-1).
- Docencia y divulgación: la demo del zoo de PINNeAPPle permite evaluar entradas propias en el navegador y ver las bandas de predicción y los avisos de las comprobaciones físicas sin instalar nada.
- Validación cruzada de simuladores: comparar las salidas de otro simulador de terramecánica contra este sustituto y la referencia analítica para detectar discrepancias en el rango acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K); no aplican a un modelo tabular. Sí se publican métricas de validación frente a la referencia analítica de Wong-Reece (2000 estados held-out, semilla 1000):

| Métrica | Valor |
|---|---|
| `test/Fx_rmse_N` | 0,2201 N |
| `test/Fx_max_abs_N` | 1,6963 N |
| `test/Fx_r2` | 0,99999914 |
| `test/Fz_rmse_N` | 0,4697 N |
| `test/Fz_max_abs_N` | 5,3744 N |
| `test/Fz_r2` | 0,99999817 |
| `test/My_rmse_Nm` | 0,07066 N·m |
| `test/My_max_abs_Nm` | 0,61745 N·m |
| `test/My_r2` | 0,99999850 |
| `test/n` | 2000 |

Comparación con datos experimentales publicados (citada en la model card): el propio modelo de Wong-Reece presenta un RMSE de drawbar pull de 4-14 N frente a ensayos de rueda única digitalizados (Ding et al. 2011; Wang & Han 2016), error mayor que el del sustituto respecto a la referencia analítica. Es decir, el límite de fidelidad lo marca la física subyacente, no la red.

Informe de validación física (`pp.validate`, nivel `standard`, decisión APPROVED, puntuación 1,00, cobertura 100 %, 12/12 comprobaciones aplicables superadas):

| Factor | Credibilidad | Significado |
|---|---|---|
| code_verification | 0 | sin evidencia |
| solution_verification | 3 | supera comprobaciones cuantitativas |
| validation | 4 | supera comprobaciones frente a referencia independiente o cota garantizada |
| input_pedigree | 3 | supera comprobaciones cuantitativas |
| uncertainty | 0 | sin evidencia |
| robustness | 0 | sin evidencia |
| applicability | 0 | sin evidencia |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en fp32 para los 78 179 parámetros; irrelevante en la práctica, cabe en cualquier GPU, CPU o acelerador edge.
- GPU recomendadas: ninguna en particular; no requiere GPU. Cualquier GPU consumer (por ejemplo, una RTX 4090) o una iGPU es más que suficiente. En un entorno de vuelo o embedded basta una CPU convencional.
- Cabe en GPU consumer: sí, con margen de varios órdenes de magnitud; también en Raspberry Pi y en plataformas tipo microcontroller con runtime ONNX adecuado.
- Opciones de despliegue: `onnxruntime` (formato ONNX incluido), PyTorch con la librería `pinneapple`, y la demo alojada en el Space del zoo. vLLM, TGI, llama.cpp u Ollama no aplican: no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; no se han publicado medidas. Por el tamaño del modelo, el coste dominante será el overhead de invocación del runtime, no el cómputo.
- Nota: la model card declara `inference: false`, por lo que el modelo no está expuesto a través de la Inference API de HuggingFace; hay que ejecutarlo localmente o vía el Space.

## Comparativa con modelos similares

No se han identificado en la información disponible otros sustitutos neuronales públicos comparables (misma tarea, mismo suelo o misma rueda). La comparación posible es contra la referencia analítica y contra los datos experimentales citados:

| Alternativa | Tipo | Parámetros | Coste de evaluación | Error de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rover_contact_grc1_viper` | PINN, MLP residual | 78 179 | una pasada de red | RMSE `Fx` 0,22 N; `Fz` 0,47 N; `My` 0,071 N·m frente a cuadratura adaptativa | Apache 2.0 | HuggingFace (safetensors, ONNX) y Space de demo |
| Wong-Reece con cuadratura adaptativa | Modelo analítico | no aplica | integración numérica adaptativa | 0 por definición (es la referencia) | no disponible | Implementación en `pinneapple_simulation` |
| Ensayos de rueda única publicados (Ding et al. 2011; Wang & Han 2016) | Datos experimentales | no aplica | no aplica | RMSE de drawbar pull 4-14 N frente al modelo de Wong-Reece | no disponible | Literatura científica / dataset `single_wheel_tests` |

## Limitaciones y advertencias

- Solo es tan bueno como el modelo de Wong-Reece: frente a ensayos publicados de rueda única, el RMSE de drawbar pull del propio modelo físico es de 4-14 N, muy superior al error del sustituto (0,22 N). El sustituto no corrige el sesgo del modelo analítico.
- Dominio muy restringido: un único suelo (GRC-1), una única rueda (VIPER, R 0,25 m, b 0,20 m), ángulo de deriva cero y régimen estacionario. No modela fuerza lateral ni transitorios.
- Fuera del rango de validez (slip en [-0,4, 0,9]; hundimiento en [0,002, 0,06] m) la predicción es una extrapolación de red sin garantía física ni empírica.
- El hundimiento por deslizamiento hace que las fuerzas presenten un cambio de pendiente en slip cero (el exponente solo crece con slip de tracción); la red suaviza ese codo en un intervalo pequeño de slip, lo que introduce un error local sistemático.
- No hay cuantificación de incertidumbre: los factores `uncertainty`, `robustness` y `applicability` del informe de validación puntúan 0 (sin evidencia). No debe interpretarse ninguna salida como un intervalo de confianza.
- No hay verificación de código independiente (`code_verification` = 0), aunque la verificación de solución y la validación frente a referencia independiente sí están cubiertas.
- Riesgo de alucinación en sentido estricto: no aplica (no genera texto), pero sí existe riesgo de predicciones plausibles y erróneas si se usa fuera del dominio o con un suelo o rueda distintos.
- No es un modelo de lenguaje ni un modelo multimodal: no procesa idioma, texto, imagen ni audio; no soporta tool calling ni agentes.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con las obligaciones habituales de atribución y aviso de cambios. Conviene revisar la licencia de los datos y del simulador subyacentes antes de un despliegue en producción.
- `inference: false` en la model card: no disponible vía Inference API; hay que desplegarlo por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PINNeAPPle-Labs/rover-contact-grc1-viper
- Dataset de entrenamiento: https://huggingface.co/datasets/PINNeAPPle-Labs/rover-contact-grc1-viper
- Repositorio del proyecto PINNeAPPle: https://github.com/PINNeAPPle-Labs/PINNeAPPle
- Demo del zoo (seleccionar `rover_contact_grc1_viper`): https://huggingface.co/spaces/PINNeAPPle-Labs/zoo-demo
- Referencias citadas en la model card, sin URL disponible en la información proporcionada: Ding et al. (2010, 2011) sobre hundimiento por deslizamiento; Wang & Han (2016) sobre ensayos de rueda única; modelo de Wong-Reece (Bekker, Janosi-Hanamoto).
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (hilos de un foro de videojuegos), por lo que no se han encontrado enlaces externos relevantes.

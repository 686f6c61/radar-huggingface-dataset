# adityasuyal/haldwani-solar-cast

## Resumen

DualStreamCAST es un transformer "physics-informed" disenado para predecir la irradiancia global horizontal (GHI, en W/m²) con un horizonte de 24 horas y resolucion horaria en la microrred de Haldwani (Uttarakhand, India, 29.2183° N, 79.5130° E). Lo desarrolla el usuario adityasuyal y se publica bajo licencia MIT en HuggingFace, con pipeline declarado `time-series-forecasting`.

El modelo no genera texto ni es un LLM: es un predictor de series temporales de unos 233.000 parametros que fusiona dos flujos de informacion en paralelo —24 horas de telemetria observada (11 variables) y 24 horas de prediccion numerica del tiempo, NWP (8 variables)— mediante cross-attention. La innovacion central es la restriccion fisica: en lugar de predecir GHI directamente, el modelo predice el indice de claridad Kc en el rango [0, 1] y lo multiplica por la GHI de cielo claro, de modo que la salida nunca puede violar la fisica atmosferica basica.

Es relevante para el nicho de prevision solar y operacion de microrredes porque demuestra que un modelo muy pequeno (~933 KB de pesos) puede incorporar conocimiento fisico y datos meteorologicos externos sin recurrir a arquitecturas masivas. Su alcance es limitado: el repositorio no incluye resultados de benchmarks, ni descripcion del dataset de entrenamiento, ni validacion por terceros, y acumula 0 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con doble codificador (past/future) y cross-attention, con restriccion fisica de cielo claro |
| Parametros totales | ~233K |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 24 pasos horarios (ventana fija de 24 h para cada flujo) |
| Tipos de cuantizacion | no disponible (solo se publica el `state_dict` en fp32; no hay versiones GGUF, INT8 ni cuantizadas) |
| Idiomas soportados | no aplica (modelo de series temporales); los metadatos del repositorio declaran `en` |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best_cast_model.pt`, ~933 KB) + `scaler.pkl` (StandardScaler de scikit-learn) |

Hiperparametros declarados: `d_model` = 64, `nhead` = 4, `num_layers` = 2, `dim_feedforward` = 256, dropout = 0.1, `past_dim` = 11, `future_dim` = 8, longitud de secuencia = 24 h.

## Arquitectura y entrenamiento

La arquitectura consta de dos ramas simetricas de codificacion. La rama "pasado" proyecta 11 variables observadas (`Linear(11 → 64)`) y la rama "futuro" proyecta 8 variables de NWP (`Linear(8 → 64)`); ambas pasan por codificacion posicional y por un `TransformerEncoder` de 2 capas y 4 cabezas con FFN de 256 dimensiones. Sobre las salidas se aplica una `MultiheadAttention` en la que el flujo futuro actua como query y el pasado como key/value, seguida de LayerNorm y conexion residual. La representacion fusionada se concatena con la salida del flujo futuro (`[B, 24, 128]`) y pasa por un cabezal `Linear(128→64) → ReLU → Dropout(0.1) → Linear(64→1) → Sigmoid` que produce el indice de claridad Kc por paso horario. La prediccion final es `Kc × GHI_clearsky`.

La innovacion tecnica destacable es ese cuello de botella fisico: la sigmoide acota Kc a [0, 1] y la multiplicacion por la irradiancia de cielo claro garantiza que la salida quede dentro de limites atmosfericamente plausibles. La segunda es la formulacion de cross-attention, que permite al pronostico NWP "consultar" las observaciones recientes para modular la confianza en dicho pronostico.

No hay informacion disponible sobre el volumen de datos de entrenamiento, el periodo temporal cubierto, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste tipo RLHF o DPO (tecnicas, por otra parte, no habituales en prevision de series temporales). Tampoco se documenta la funcion de perdida empleada ni la estrategia de validacion. La normalizacion de entradas se realiza con un `StandardScaler` de scikit-learn que se distribuye junto al modelo y que debe aplicarse de forma identica en inferencia.

## Capacidades

- Prevision de GHI (W/m²) a 24 horas vista con resolucion horaria para una ubicacion concreta.
- Prediccion del indice de claridad Kc en [0, 1] como salida intermedia interpretable.
- Fusion de observaciones historicas con pronosticos NWP mediante cross-attention.
- Cumplimiento de la cota fisica de cielo claro en todas las salidas.
- Normalizacion de entradas integrada a traves del `StandardScaler` distribuido.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues en el sentido NLP.
- No dispone de modo "thinking", vision, audio ni ninguna modalidad adicional.
- Inferencia por lotes sobre tensores `[B, 24, 11]` y `[B, 24, 8]`, apta para integracion en pipelines de datos.

## Casos de uso

- Gestion de microrredes solares: el modelo entrega la GHI prevista para las 24 horas siguientes, lo que permite programar el despacho de baterias y generadores de respaldo en funcion de la generacion fotovoltaica esperada.
- Prevision de generacion fotovoltaica: combinando la GHI pronosticada con la potencia nominal y el rendimiento del inversor se puede estimar la produccion horaria del parque solar de Haldwani.
- Participacion en mercados electricos intradiarios: con un horizonte horario de 24 h, el operador puede presentar ofertas de compra/venta ajustadas a la produccion esperada y reducir penalizaciones por desvio.
- Programacion de mantenimiento y limpieza de paneles: al identificar periodos de baja irradiancia prevista, se pueden planificar tareas que requieren desconectar strings sin perder generacion.
- Validacion y "downscaling" de NWP: la rama de cross-attention aprende a corregir el sesgo del pronostico meteorologico a partir de observaciones locales recientes, util para evaluar la calidad del proveedor de NWP.
- Investigacion en prevision solar "physics-informed": el modelo sirve como referencia compacta (~233K parametros) para estudiar tecnicas de restriccion fisica y fusion de flujos en series temporales.
- Sistema de alerta para operadores de red: previsiones de rampas pronunciadas de irradiancia (por ejemplo, despeje tras nubosidad) permiten anticipar variaciones bruscas de inyeccion en la red de distribucion.
- Docencia y prototipado: su tamano reducido permite entrenar y ejecutar el modelo completo en un portatil, lo que lo hace util como ejemplo didactico de transformer aplicado a series temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de error (RMSE, MAE, MBE), ni comparaciones contra modelos de referencia como persistencia, cielo claro o nuevos modelos de prevision. Tampoco se documenta el conjunto de test empleado.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 MB en fp32 y ~0,5 MB en fp16 para los pesos (233K parametros), despreciable frente a cualquier GPU actual.
- GPU recomendadas: no se requiere GPU. Cualquier acelerador (A100, H100, RTX 4090, T4, e incluso iGPU) ejecuta el modelo sobradamente; el uso de GPU solo aporta ventaja en lotes muy grandes.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo y tambien en CPU. El modelo puede ejecutarse en dispositivos de borde (Raspberry Pi, Jetson Nano) sin problemas de memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un LLM ni se distribuye en formato GGUF. Las vias naturales son PyTorch nativo, exportacion a TorchScript u ONNX Runtime, y servido mediante FastAPI, TorchServe o BentoML.
- Latencia y throughput: no disponible (no publicados). Dado el tamano del modelo, cabe esperar latencias del orden de milisegundos por lote en CPU, pero se trata de una estimacion no verificada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en los datos proporcionados (ni alternativas de prevision solar del mismo autor, ni referencias a la literatura). La tabla siguiente refleja esta ausencia de datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DualStreamCAST (haldwani-solar-cast) | ~233K | 24 pasos horarios | no disponible | MIT | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad geografica extrema: el modelo esta entrenado y calibrado para Haldwani (29.2183° N, 79.5130° E); su uso en otras latitudes o regimenes climaticos no esta validado y probablemente degrade el rendimiento.
- Horizonte y resolucion fijos: solo predice 24 horas a resolucion horaria; no admite otros horizontes ni granularidades sin reentrenamiento.
- Dependencia de entradas externas: requiere obligatoriamente un pronostico NWP de 8 variables y un calculo de GHI de cielo claro. Si el NWP es erroneo o el modelo de cielo claro esta mal parametrizado, el error se propaga directamente a la prediccion.
- Acoplamiento al `scaler.pkl`: cualquier uso con una normalizacion distinta (por ejemplo, recalibrada con datos nuevos) produce predicciones invalidas.
- Ausencia de validacion independiente: 0 descargas y 0 "likes", sin resultados de benchmarks ni evaluacion por terceros. No se recomienda su uso en produccion critica sin una validacion propia.
- Datos de entrenamiento no documentados: no se especifica el periodo cubierto ni la procedencia de los datos, por lo que no puede evaluarse el sesgo estacional (por ejemplo, sobrerrepresentacion de la estacion de monzon o de la estacion seca).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir predicciones poco fiables fuera del dominio de entrenamiento. La cota fisica de Kc evita valores imposibles, no errores grandes.
- Interpretacion de la incertidumbre: el modelo es determinista; no proporciona intervalos de confianza ni distribuciones probabilisticas, algo habitualmente necesario en despacho energetico.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones, siempre que se conserve el aviso de copyright y la licencia. No impone clausulas de atribucion adicionales.
- Idioma: los metadatos del repositorio declaran ingles; la documentacion disponible esta en ese idioma.

## Enlaces

- HuggingFace: https://huggingface.co/adityasuyal/haldwani-solar-cast
- PyTorch (framework requerido): https://pytorch.org
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.

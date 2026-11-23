# robbyant/lingbot-touch-small

## Resumen

LingBot-Touch-Small es un modelo fundacional de representación táctil desarrollado por robbyant, orientado a robótica de manipulación diestra. Se basa en la arquitectura JEPA (Joint Embedding Predictive Architecture), que aprende representaciones prediciendo en espacio latente en lugar de reconstruir la señal de entrada. El modelo unifica tres modalidades de sensado táctil heterogéneas (magnética, piezorresistiva y visuotáctil) mediante tokenizadores específicos por modalidad y un Transformer compartido.

El modelo está pensado como extractor de características congelado (frozen target encoder): no genera texto ni realiza inferencia generativa, sino que produce representaciones latentes a nivel de token con direccionamiento temporal, por dedo y espacial. Estas representaciones se usan como entrada para cabezas de tarea posteriores en percepción táctil y control de manipulación.

Se distribuye en dos variantes (clip16 y clip32) según la longitud de clip de preentrenamiento, con pesos en formato PyTorch (`encoder.pt`) y configuración de inferencia asociada. El repositorio tiene 0,3 GB y licencia Apache 2.0, lo que facilita su integración en pipelines de investigación y producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) con tokenizadores especificos por modalidad y Transformer compartido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | clips de 16 frames (clip16) o 32 frames (clip32); secuencia de entrada T debe ser multiplo positivo de 4 (tubelet size = 4) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de representacion tactil, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`encoder.pt`) + `config.json` de inferencia |

## Arquitectura y entrenamiento

LingBot-Touch sigue el paradigma JEPA: el modelo aprende representaciones de la estructura de contacto y de sus cambios temporales mediante prediccion en espacio latente, en lugar de reconstruir la senal tactil cruda. La arquitectura combina tokenizadores especificos por modalidad (magnetica, piezorresistiva y visuotactil) con un Transformer compartido que procesa la secuencia resultante. La entrada tiene forma `[B,T,5,M,3]`, donde la dimension de 5 corresponde al orden fijo de dedos (pulgar, indice, corazon, anular, menique), mas coordenadas canonicas de taxel y una seleccion de modalidad de sensado.

Las tres modalidades se codifican de forma diferenciada: la magnetica aporta mediciones triaxiales; la piezorresistiva coloca una medicion escalar en el canal Z con X e Y a cero; la visuotactil decodifica deformacion o intensidad escalar en el canal Z, tambien con X e Y a cero (no se aceptan imagenes RGB crudas como entrada). Las mediciones se normalizan a [-1,1] en X/Y y a [0,1] en Z. No se han publicado en la informacion disponible detalles sobre numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF/DPO (no aplicable en un modelo de representacion). El repositorio solo distribuye pesos del encoder congelado y configuracion; el codigo de inferencia, adaptadores de sensor, datasets y cabezas de tarea se distribuyen por separado.

## Capacidades

- Extraccion de representaciones latentes a nivel de token a partir de senales tactiles normalizadas.
- Soporte de tres modalidades de sensado: magnetica (triaxial), piezorresistiva (escalar en Z) y visuotactil (deformacion/intensidad escalar en Z).
- Modelado de estructura de contacto y cambios temporales mediante prediccion en espacio latente.
- Salida con direccionamiento temporal, por dedo y espacial, apta para consultas basadas en atencion (attention-based querying) en tareas posteriores.
- Procesamiento de clips de 16 o 32 frames segun la variante (clip16 o clip32), con T multiplo de 4.
- No realiza generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling ni agentes multi-step.
- No soporta capacidades multilingues (no es un modelo linguistico).

## Casos de uso

- Percepcion tactil en manipulacion diestra: el encoder produce representaciones por dedo y por taxel que alimentan cabezas de clasificacion o regresion para estimar propiedades de contacto (fuerza, deslizamiento, geometria) en manos roboticas de cinco dedos.
- Deteccion de deslizamiento y agarre adaptativo: usando la variante clip32, el modelo captura cambios temporales de la senal tactil en ventanas de 32 frames, adecuado para control reactivo de fuerza en tareas de agarre.
- Fusion de sensores heterogeneos: al unificar modalidades magnetica, piezorresistiva y visuotactil bajo un mismo espacio latente, permite combinar sensores de distinta naturaleza en un mismo pipeline sin reentrenar el encoder.
- Preentrenamiento para aprendizaje por imitacion: las representaciones congeladas sirven como entrada a politicas de manipulacion (por ejemplo, diffusion policies) reduciendo la necesidad de datos tactiles etiquetados.
- Investigacion en representacion tactil: como modelo JEPA de referencia para comparar estrategias de tokenizacion por modalidad y prediccion en espacio latente frente a autoencoders reconstructivos.
- Prototipado rapido en robotica de laboratorio: el tamano reducido del repositorio (0,3 GB) y la licencia Apache 2.0 permiten desplegar el encoder en estaciones de trabajo con GPU consumer para experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio de 0,3 GB incluye dos bundles con pesos del encoder; el consumo real depende de la implementacion de inferencia, no distribuida en este repositorio).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada; el tamano del repositorio (0,3 GB) sugiere que el encoder es ligero y probablemente quepa en GPU consumer, pero no hay datos oficiales.
- Opciones de despliegue: implementacion propia `tactile_jepa_inference` (distribuida por separado) mediante `load_encoder`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de representacion tactil ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El repositorio solo contiene pesos del encoder congelado y configuracion; no incluye codigo de inferencia, adaptadores de sensor, datasets, predictores, cabezas de tarea, estados de optimizador ni logs de entrenamiento.
- Requiere adaptar correctamente la geometria del sensor, la lateralidad (handedness), el orden de puntos y los rangos de medicion fijos antes de la inferencia; una mala adaptacion invalida las representaciones.
- La entrada visuotactil no acepta imagenes RGB crudas: solo deformacion o intensidad escalar decodificada en el canal Z.
- La secuencia de entrada T debe ser multiplo positivo de 4 (tubelet size = 4); no se admiten longitudes arbitrarias.
- El modelo no es linguistico: no genera texto ni soporta idiomas; las etiquetas de idioma no estan disponibles porque no aplican.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las representaciones pueden ser poco fiables fuera de la distribucion de sensores y tareas de entrenamiento (no documentada).
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el codigo de inferencia compatible se distribuye por separado y su licencia no se especifica en esta informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robbyant/lingbot-touch-small
- Pesos clip16: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LingBot-Touch-Small-clip16/encoder.pt
- Configuracion clip16: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LingBot-Touch-Small-clip16/config.json
- Pesos clip32: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LingBot-Touch-Small-clip32/encoder.pt
- Configuracion clip32: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LingBot-Touch-Small-clip32/config.json
- Licencia: https://huggingface.co/robbyant/lingbot-touch-small/blob/main/LICENSE

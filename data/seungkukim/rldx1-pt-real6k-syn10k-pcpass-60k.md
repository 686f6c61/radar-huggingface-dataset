# seungkukim/rldx1-pt-real6k-syn10k-pcpass-60k

## Resumen

El modelo `seungkukim/rldx1-pt-real6k-syn10k-pcpass-60k` es un checkpoint de preentrenamiento (paso 60.000) de un modelo vision-language-action (VLA) de la familia RLDX-1, publicado por el usuario seungkukim en el marco del proyecto RoboCurate V2. Se trata de la rama "filtrada" de una comparacion controlada: el modelo comparte sus primeros 45.000 pasos de entrenamiento con un control sin filtrar y solo se diferencia en los clips sinteticos que ve durante la fase final de decaimiento del learning rate. Su proposito es servir como inicializacion para ajuste fino posterior y como brazo de tratamiento en experimentos sobre curacion de datos sinteticos para robotica.

El modelo parte de RLDX-1 (`RLDX-1-PT-IMG-noAH`, con la cabeza de accion eliminada) y se entrena con un esquema Warmup-Stable-Decay (WSD) de 60.000 pasos sobre 4 GPU H100, mezclando datos reales de manipulacion de mesa con un humanoide GR-1 y clips generados verificados mediante el filtro Pre-Contact, que conserva el 57,75% de los clips sinteticos. La innovacion principal no esta en la arquitectura, sino en el metodo de curacion de datos: la verificacion se hace sin simulador, mediante cinematica directa sobre el rollout del chunk de acciones predicho, profundidad metrica y extension del objeto.

El checkpoint tiene 6.912.894.784 parametros (aproximadamente 6,91 mil millones) y un repositorio de 13,8 GB en safetensors. La model card es explicita al advertir que **no es una politica lista para desplegar en hardware**: es una inicializacion de investigacion, no un modelo que siga instrucciones de forma fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language-action (VLA) con flow matching; derivada de RLDX-1 `RLDX-1-PT-IMG-noAH` con la cabeza de accion eliminada |
| Parametros totales | 6.912.894.784 (aproximadamente 6,91 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; la configuracion de entrenamiento usa 1 fotograma de video y 64 tokens de cognicion |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors (entrenamiento en bf16) |
| Idiomas soportados | no disponible |
| Licencia | rldx-1-derivative (license: other, con enlace a LICENSE); la redistribucion queda sujeta a los terminos del modelo base RLDX-1 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un modelo vision-language-action de la familia RLDX-1, con flow matching para la generacion de acciones, derivado del checkpoint base `RLDX-1-PT-IMG-noAH` al que se le ha retirado la cabeza de accion. El horizonte de accion configurado es 16, con 1 fotograma de video y 64 tokens de cognicion por muestra, y sin dropout de estado (state dropout = 0,0). No se proporcionan detalles adicionales sobre el numero de capas, dimensiones ocultas ni el diseno exacto del encoder de vision.

El entrenamiento sigue un calendario Warmup-Stable-Decay sobre 60.000 pasos en 4 GPU H100, con batch global 256 (64 por GPU, sin acumulacion), optimizador AdamW en bf16 y semilla 42. La fase de calentamiento va del paso 0 al 3.000 con learning rate de 0 a 1e-4; la fase estable, del 3.000 al 45.000 con 1e-4 constante; y la fase de decaimiento, del 45.000 al 60.000, baja de 1e-4 a 0. Los datos se mezclan 1:1 mediante `mix_ratio` (probabilidad por especificacion, independiente del tamano del almacen). La mitad real proviene de real6k a 16 fps (6.551 episodios, 1.258.734 fotogramas) con la etiqueta `GENERAL_EMBODIMENT`; la mitad sintetica, de syn10k con etiqueta `NEURAL_GR1` (10.000 episodios sin filtrar en las fases iniciales, 5.775 clips tras el filtro Pre-Contact en la fase de decaimiento, equivalentes a 537.075 fotogramas y 3,57 epocas sobre ese subconjunto). La perdida final de entrenamiento reportada es 0,0044.

La innovacion tecnica destacable es el filtro Pre-Contact: verifica, sin simulador, que las acciones predichas llevan la mano a una relacion de pre-contacto fisicamente consistente con el objeto objetivo, usando cinematica directa sobre el rollout del chunk de acciones predicho junto con profundidad metrica y extension del objeto. El diseno experimental (punto de ramificacion compartido en el paso 45.000) permite atribuir cualquier diferencia frente al control exclusivamente al filtro.

## Capacidades

- Politica vision-language-action para manipulacion robotica: genera chunks de acciones de horizonte 16 a partir de observaciones visuales, dentro del dominio de manipulacion de mesa del humanoide GR-1.
- Procesamiento conjunto de vision y lenguaje: al ser un VLA, integra entrada visual con el componente de lenguaje/cognicion, con 64 tokens de cognicion por muestra.
- Generacion de acciones mediante flow matching, en lugar de regresion directa o decodificacion autorregresiva de acciones.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se declara ningun idioma en la informacion proporcionada).
- Capacidades especiales: ninguna adicional declarada (no hay modo thinking, ni audio, ni vision general fuera del dominio robotico descrito).

## Casos de uso

- Inicializacion para ajuste fino en robotica: el propio autor indica que el modelo esta pensado como preentrenamiento para ajuste fino posterior en tareas concretas de manipulacion; se partiria de estos pesos y se entrenaria con datos de la tarea objetivo.
- Brazo de tratamiento en experimentos de curacion de datos sinteticos: comparar este checkpoint contra su control sin filtrar permite medir el efecto aislado del filtro Pre-Contact sobre el rendimiento final tras el ajuste fino.
- Investigacion sobre metodologias de filtrado sin simulador: el filtro Pre-Contact (cinematica directa, profundidad metrica y extension del objeto) puede reproducirse sobre otros almacenes de clips sinteticos y validarse con este modelo como referencia.
- Estudio de normalizacion de datos mezclados real/sintetico: dado que la mitad sintetica se normaliza con estadisticas del checkpoint base, este modelo sirve para analizar el impacto de no normalizar los datos generados respecto a su propia distribucion.
- Evaluacion de transferencia entre morfologias: el dominio real es manipulacion de mesa con GR-1, por lo que el modelo permite estudiar cuanto se degrada la transferencia al reetiquetar y renormalizar para otra morfologia.
- Reproduccion experimental en robotica: al compartir los primeros 45.000 pasos con un control, es util para replicar resultados y auditar metodologias de entrenamiento WSD en modelos VLA.
- Analisis de acciones inferidas por modelo de dinamica inversa: la mitad sintetica usa acciones inferidas, no medidas, lo que permite estudiar el impacto de esta aproximacion en el aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento (0,0044), que no es comparable con metricas de evaluacion estandar como MMLU, HumanEval o GSM8K, ni con metricas de politicas roboticas tipo tasa de exito por tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13,8 GB solo para los pesos en bf16/fp16 (el repositorio ocupa 13,8 GB). Hay que sumar memoria para el encoder de vision, los estados de observacion y activaciones intermedias, por lo que conviene reservar un margen adicional.
- Cuantizacion: en int8 los pesos bajarrian a unos 7 GB y en int4 a unos 3,5-4 GB, aunque no se declaran recetas de cuantizacion en la informacion disponible.
- GPU recomendadas: entrenado en 4x H100; para inferencia es razonable una A100 40/80 GB, H100 o L40S. Cabe en GPU de consumo con 24 GB (RTX 3090, RTX 4090) en bf16, y en tarjetas de 16 GB o menos probablemente requiera cuantizacion.
- Opciones de despliegue: la libreria declarada es transformers y el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan datos comparativos en la informacion disponible. Como referencia de categoria, se incluyen filas con los modelos mencionados en la documentacion, marcando como "no disponible" todo dato que no aparece en las fuentes facilitadas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx1-pt-real6k-syn10k-pcpass-60k | 6,91 mil millones | no disponible | no disponible (perdida final de entrenamiento 0,0044) | rldx-1-derivative | HuggingFace (0 descargas, 0 likes) |
| RLDX-1 (`RLDX-1-PT-IMG-noAH`, modelo base) | no disponible | no disponible | no disponible | sujeta a los terminos del modelo base | referenciado como base, sin enlace en la informacion proporcionada |
| Otros modelos VLA de la misma categoria (por ejemplo, alternativas abiertas de manipulacion robotica) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una politica lista para produccion: la model card indica explicitamente que no es un modelo de seguimiento de instrucciones preparado para desplegarse en hardware.
- La mitad sintetica se normaliza con estadisticas del checkpoint base y no con las de su propio almacen; es una decision deliberada para mantener comparabilidad entre ramas, pero implica que los datos generados no estan normalizados respecto a si mismos.
- Los clips generados llevan acciones inferidas por un modelo de dinamica inversa, no acciones medidas; ademas, los estados de observacion de esa mitad son cero.
- Los datos reales corresponden a manipulacion de mesa con el humanoide GR-1; nada transfiere a otra morfologia sin reetiquetar y renormalizar.
- Dominio muy restringido: no hay indicios de capacidades generales de lenguaje, codigo, matematicas o vision fuera del ambito robotico.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En modelos VLA el fallo tipico no es textual, sino la generacion de trayectorias fisicamente invalidas.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Restricciones de licencia: licencia `rldx-1-derivative` (license: other). La redistribucion queda sujeta a los terminos que gobiernen el modelo base RLDX-1, por lo que es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial o redistribucion.
- Idioma: no se declara ningun idioma soportado, lo que limita el uso en aplicaciones multilingues.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, lo que sugiere que no ha pasado por validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seungkukim/rldx1-pt-real6k-syn10k-pcpass-60k
- Repositorio RoboCurate V2 (etapa 7, entrenamiento VLA): https://github.com/suhyeok-jang/RoboCurate_V2
- Licencia del modelo: fichero LICENSE dentro del repositorio de HuggingFace
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (corresponden a herramientas de cronometro en linea), por lo que no aportan enlaces adicionales utilizables.

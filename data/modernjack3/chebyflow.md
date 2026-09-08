# modernjack3/ChebyFlow

## Resumen

ChebyFlow es un sampler experimental para ComfyUI, desarrollado por modernjack3, diseñado especificamente para modelos de flujo rectificado (`rectified-flow`) y modelos `CONST` como MiniMax H3. No es un modelo de base ni un modelo de lenguaje, sino una herramienta de inferencia que sustituye al sampler estándar en workflows de generacion de imagenes, video o audio.

El sampler utiliza una integracion en dos etapas de estilo Chebyshev y adapta dinamicamente la posicion de la segunda evaluacion del modelo en funcion del comportamiento local del campo de flujo. Ademas, ajusta la fuerza de la correccion aplicada tras esa evaluacion mediante auto-calibracion en linea durante la generacion actual. ChebyFlow devuelve un objeto `SAMPLER` estandar de ComfyUI, pensado para conectarse al nodo `SamplerCustomAdvanced`.

Su relevancia radica en que ofrece un control fino sobre el equilibrio entre estabilidad y diversidad en la generacion, sin necesidad de calibraciones previas ni pesos adicionales. Es un proyecto reciente, sin descargas ni likes en HuggingFace, lo que indica que se encuentra en fase experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sampler para modelos rectified-flow) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica (script Python para ComfyUI) |
| Tipo de nodo | SAMPLER para ComfyUI (compatible con SamplerCustomAdvanced) |
| Evaluaciones del modelo por intervalo | 2 (aprox., en modo normal) |
| Coordenadas disponibles | flow_lambda, sigma |
| Presets de calidad | balanced, detail, smooth, stable, dynamic |
| Dependencias | Ninguna adicional |

## Arquitectura y entrenamiento

ChebyFlow no es un modelo entrenado, sino un sampler que se ejecuta dentro de ComfyUI. Su arquitectura interna se basa en un esquema de integracion adaptativa en dos etapas inspirado en los polinomios de Chebyshev. En cada intervalo de muestreo no terminal, el sampler realiza aproximadamente dos evaluaciones del modelo subyacente.

La innovacion principal es la adaptacion en linea: el sampler analiza el comportamiento local del campo de flujo mediante metricas residuales, direccionales y de magnitud. Con esa informacion, ajusta la posicion de la segunda evaluacion dentro del intervalo (mediante un parametro `base_stage_position` que puede variar entre `min_stage_position` y `max_stage_position`) y la fuerza de la correccion aplicada. En modo Auto, esta calibracion se realiza durante la propia generacion, sin necesidad de ejecuciones previas ni datos de calibracion.

El nodo permite elegir el sistema de coordenadas para la colocacion interna (`flow_lambda` o `sigma`), asi como la granularidad de la correccion (global o por canal). Tambien incluye un modo turbo para workflows de pocos pasos.

## Capacidades

- Muestreo adaptativo de flujo en dos etapas, con auto-calibracion en linea durante la generacion actual.
- Analisis de flujo residual, direccional y de magnitud para detectar regiones del trayecto mas faciles o dificiles de lo normal.
- Colocacion adaptativa de la segunda evaluacion del modelo dentro de cada intervalo.
- Fuerza de correccion adaptativa, con posibilidad de ajuste por canal individual (`correction_granularity = per_channel`).
- Modo turbo para workflows de baja latencia con pocos pasos.
- Dos modos de uso: Auto (recomendado) y Advanced.
- Compatible con modelos rectified-flow y `CONST` como MiniMax H3.
- No requiere calibraciones previas, datos externos ni pesos adicionales.
- No sustituye al scheduler: utiliza la secuencia de sigmas proporcionada por el workflow.
- Compatible con cualquier scheduler de ComfyUI, aunque `beta57` es el recomendado.

## Casos de uso

- Generacion de imagenes con MiniMax H3 en ComfyUI: se instala el nodo en `ComfyUI/custom_nodes/ComfyUI-ChebyFlow/`, se conecta el `ChebyFlow Auto Sampler` a la entrada `sampler` de `SamplerCustomAdvanced` y se usa el scheduler `beta57`. El sampler se adapta automaticamente al flujo, mejorando la estabilidad sin ajustes manuales.

- Ajuste fino del equilibrio entre estabilidad y diversidad: modificando `base_stage_position` y `min_stage_position`, el investigador puede favorecer trayectorias mas consistentes (valores altos) o permitir mayor variacion entre semillas (valores bajos). Esto resulta util para explorar el espacio latente en experimentos creativos.

- Generacion de video o audio de baja latencia: el modo `turbo_mode = true` permite workflows de pocos pasos, reduciendo el numero de evaluaciones del modelo y acelerando la inferencia en entornos con restricciones de tiempo.

- Experimentacion con schedulers alternativos: ChebyFlow no exige un scheduler concreto; usa la secuencia de sigmas del workflow. Esto permite probar combinaciones de schedulers personalizados o experimentales sin modificar el sampler.

- Investigacion en algoritmos de muestreo adaptativo: los nodos Auto y Advanced exponen parametros como `coordinate`, `adaptivity` y `quality_bias`, que permiten estudiar como la colocacion interna de las evaluaciones afecta a la calidad de la generacion en distintos modelos de flujo.

- Integracion en pipelines de ComfyUI existentes: al devolver un `SAMPLER` estandar, ChebyFlow puede reemplazar al sampler actual en un workflow ya configurado sin necesidad de rediseñar el resto de la pipeline (guider, scheduler, latent, etc.).

- Control de calidad por canal: con `correction_granularity = per_channel`, se puede ajustar la correccion de forma independiente para cada canal latente, lo que resulta util en modelos multimodales donde distintos canales pueden requerir comportamientos diferentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que depende del modelo subyacente (por ejemplo, MiniMax H3).
- GPU recomendadas: no disponible en la informacion proporcionada. Al ejecutarse dentro de ComfyUI, requiere una GPU compatible con PyTorch.
- Si cabe en consumer GPU: no disponible, depende del modelo base.
- Opciones de despliegue: se ejecuta como nodo personalizado en ComfyUI. No se mencionan otras plataformas como vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. El README indica que usa aproximadamente 2 evaluaciones del modelo por intervalo de muestreo no terminal, lo que sugiere un coste computacional moderado.

## Comparativa con modelos similares

No disponible. No se han publicado comparativas con otros samplers de ComfyUI en la informacion proporcionada. ChebyFlow es un sampler experimental sin benchmarks publicados que permitan compararlo con alternativas como Euler, DPM++ o samplers adaptativos de otros frameworks.

## Limitaciones y advertencias

- Se trata de un sampler experimental, sin descargas ni likes en HuggingFace, lo que indica una fase temprana de desarrollo y posible falta de validacion en produccion.
- La licencia no esta especificada, por lo que el uso comercial es incierto y requiere consulta con el autor.
- No es un modelo de lenguaje; no aplica para tareas de generacion de texto, chat o razonamiento simbolico.
- Depende de modelos rectified-flow o `CONST` como MiniMax H3. No es compatible con modelos de difusion estandar ni con arquitecturas que no sigan ese esquema.
- El rendimiento depende en gran medida del scheduler elegido. El README recomienda `beta57`, pero otros schedulers pueden producir resultados variables o degradar la calidad.
- La auto-calibracion en linea puede aumentar ligeramente el coste computacional, aunque el numero de evaluaciones del modelo se mantiene en torno a 2 por intervalo.
- Configuraciones extremas de `stage_position` (muy bajas o muy altas) pueden afectar a la estabilidad o a la diversidad de los resultados, como se advierte en la documentacion.
- No se han publicado benchmarks de calidad, por lo que no hay evidencia cuantitativa de mejora frente a otros samplers.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/modernjack3/ChebyFlow
- Perfil del autor en HuggingFace: https://huggingface.co/modernjack3

# georginio2000/diffusion-square-nutassembly

# Diffusion Policy — NutAssemblySquare (Square/PH/low-dim)

## Resumen

Se trata de un checkpoint de política de difusión (`DiffusionPolicyUNet`) para robomimic, desarrollado por el usuario georginio2000 y publicado bajo licencia MIT. Resuelve una tarea concreta de manipulación robótica: la inserción de una tuerca cuadrada (*Square Nut*) en la varilla correspondiente dentro del entorno NutAssembly de robosuite. No es un modelo de lenguaje ni un modelo multimodal: es una política de control entrenada por imitación que mapea observaciones de baja dimensión a secuencias de acciones.

La arquitectura combina una red UNet con un planificador de ruido DDPM y control por *action chunks* con horizonte deslizante (`observation_horizon=2`, `action_horizon=8`, `prediction_horizon=16`). El entrenamiento se realizó durante 2000 épocas sobre el conjunto público Square/PH/low-dim de robomimic, compuesto por 200 demostraciones. El autor reporta una tasa de éxito del 95 % en la época 1800 y del 90 % en la 2000, evaluada sobre 20 episodios.

Su relevancia es doble: por un lado, ofrece un punto de partida reproducible para experimentos de *diffusion policy* en ensamblaje; por otro, publica la curva completa de tasas de éxito por época, lo que permite analizar la estabilidad del entrenamiento y seleccionar checkpoints intermedios. El repositorio ocupa 10,5 GB e incluye varios checkpoints en formato `.pth`, con 0 descargas y 0 *likes* en el momento de la consulta (actualizado el 20 de septiembre de 2026).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión para políticas (`robomimic` DiffusionPolicyUNet) con planificador de ruido DDPM y control por chunks con horizonte deslizante |
| Parámetros totales | no disponible (el autor no publica el recuento; el repositorio ocupa 10,5 GB con múltiples checkpoints) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); ventanas de control: `observation_horizon=2`, `action_horizon=8`, `prediction_horizon=16` |
| Tipos de cuantización | no disponible (el autor no documenta cuantizaciones; los pesos se distribuyen en `.pth`) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (un checkpoint por época evaluada) |
| Tarea | NutAssembly / Square Nut insertion (entorno robosuite vía robomimic) |
| Dataset de entrenamiento | robomimic Square/PH/low-dim, 200 demostraciones (público) |
| Régimen de entrenamiento | 2000 épocas |
| Número de checkpoints | 10 (épocas 200 a 2000, cada 200) |

## Arquitectura y entrenamiento

El modelo es una política de difusión condicionada: una UNet que aprende a eliminar ruido gaussiano para generar *action chunks*, siguiendo el esquema DDPM. En lugar de predecir una única acción, genera una secuencia de 8 acciones (`action_horizon=8`) a partir de una predicción de 16 pasos (`prediction_horizon=16`), y ejecuta únicamente el primer bloque antes de volver a planificar (control de horizonte deslizante o *receding horizon*). La observación se compone de 2 pasos consecutivos (`observation_horizon=2`), lo que aporta información de velocidad implícita sin necesidad de estimadores de estado explícitos.

El entrenamiento es de aprendizaje por imitación (*behavior cloning* con objetivo de difusión) sobre el dataset público Square/PH/low-dim de robomimic, con 200 demostraciones. La variante "low-dim" implica que las observaciones son vectores de estado de baja dimensión (propiocepción y poses de objetos), no imágenes, por lo que la política no incluye codificadores visuales. El autor no especifica el número de pasos de difusión en inferencia, el tamaño del lote, la tasa de aprendizaje ni el detalle del dataset más allá de su nombre y número de demostraciones. La nomenclatura "PH" corresponde habitualmente a demostraciones de "proficient human" en robomimic, aunque la model card no lo explicita; se trata de una interpretación basada en la convención del ecosistema, no de un dato confirmado por el autor.

## Capacidades

- Generación de trayectorias de acción multi-paso para la tarea de inserción de la tuerca cuadrada en robosuite.
- Control por *action chunking*: produce bloques de 8 acciones y replanifica, lo que reduce la acumulación de error frente a políticas de acción única.
- Acondicionamiento sobre historial de observaciones de baja dimensión (ventana de 2 pasos).
- Muestreo multimodal mediante difusión: la formulación DDPM permite representar distribuciones multimodales de acciones, algo que una regresión MSE directa no captura.
- Entrenamiento por imitación a partir de demostraciones humanas, sin necesidad de recompensas ni de entorno interactivo durante el aprendizaje.
- No soporta *tool calling*, *function calling* ni uso como agente.
- No dispone de capacidades multilingües, de generación de texto, de código, de matemáticas, de visión, de audio ni de modo de razonamiento (*thinking mode*).

## Casos de uso

- Reproducción de resultados de referencia: cargar `checkpoints/model_epoch_1800_low_dim_success_0.95.pth` y ejecutar el *rollout* estándar de robomimic en NutAssembly para verificar la tasa de éxito del 95 % reportada por el autor.
- Análisis de estabilidad del entrenamiento: el repositorio incluye 10 checkpoints (cada 200 épocas), lo que permite estudiar la evolución de la política y la variabilidad de la tasa de éxito entre épocas (del 70 % en la época 800 al 95 % en la 1800).
- *Baseline* para comparativas de arquitectura: sirve como referencia frente a alternativas de imitación en robomimic (por ejemplo, políticas recurrentes o basadas en energía) sobre el mismo dataset y la misma tarea.
- *Fine-tuning* con datos propios: al ser un modelo MIT y entrenado sobre demostraciones, puede reentrenarse con demostraciones adicionales de ensamblaje capturadas en robosuite para tareas de *peg-in-hole* relacionadas.
- Investigación en sim-to-real: usar el checkpoint como punto de partida en el estudio de transferencia de políticas de difusión desde simulación a un brazo real, siendo consciente de que la variante *low-dim* depende de poses de objeto conocidas.
- Docencia en aprendizaje por imitación: ejemplo autocontenido de *diffusion policy* con curvas de éxito publicadas, útil para prácticas de posgrado sobre robótica y aprendizaje profundo.
- Evaluación de infraestructura de simulación: medir tiempos de *rollout*, coste de muestreo DDPM y throughput de episodios en robosuite para dimensionar clústeres de experimentación.

## Benchmarks y rendimiento

El único dato de rendimiento publicado por el autor es la tasa de éxito en *rollout* sobre 20 episodios, evaluada cada 200 épocas:

| Época | 200 | 400 | 600 | 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000 |
|---|---|---|---|---|---|---|---|---|---|---|
| Tasa de éxito | 85 % | 85 % | 85 % | 70 % | 75 % | 90 % | 85 % | 85 % | 95 % | 90 % |

No se han publicado resultados de benchmarks adicionales en la información disponible: no hay MMLU, HumanEval, GSM8K ni métricas de otros entornos robomimic (Lift, Can, Transport, ToolHang). No se dispone de intervalos de confianza, desviaciones típicas ni número de semillas para las tasas anteriores.

## Requisitos de hardware

- VRAM para inferencia: no publicada por el autor. Como referencia aritmética, el repositorio contiene 10,5 GB distribuidos en 10 checkpoints (uno cada 200 épocas), lo que sugiere del orden de 1 GB por checkpoint; en inferencia en precisión nativa (presumiblemente FP32), la política debería caber en GPUs de consumo con 6-8 GB de VRAM. Es una estimación derivada del tamaño del repositorio, no un dato confirmado.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA y VRAM suficiente para inferencia; no se requiere A100 ni H100. Para *fine-tuning* sobre los 10,5 GB de checkpoints y el dataset de demostraciones, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 aportan margen, pero el autor no publica requisitos de entrenamiento.
- GPU de consumo: sí, previsiblemente cabe en RTX 3060 (12 GB), RTX 4070 y superiores, dado que se trata de una política de baja dimensión y no de un modelo de lenguaje. Sin confirmación del autor.
- Opciones de despliegue: el stack previsto es robomimic y robosuite sobre PyTorch, descargando el checkpoint con `huggingface_hub` y ejecutando los scripts de *rollout* de robomimic. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La inferencia requiere múltiples pasos de difusión por *chunk* de 8 acciones, pero el autor no especifica el número de pasos de muestreo ni los tiempos de *rollout* medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Ventana de control | Tasa de éxito reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| georginio2000/diffusion-square-nutassembly | UNet de difusión (DDPM), low-dim | no disponible | obs=2, acción=8, predicción=16 | 95 % (época 1800, 20 episodios) | MIT | HuggingFace, 0 descargas |
| Diffusion Policy (Chi et al., referencia original) | UNet de difusión, CNN | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | MIT (según el repositorio de referencia del ecosistema, no verificado aquí) | Repositorio público de investigación |
| Baseline BC-RNN de robomimic | Política recurrente por imitación | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | robomimic se distribuye bajo licencia MIT (no verificado aquí) | Implementada en robomimic |
| Implementaciones de imitación en robosuite/robomimic (IBC y similares) | Políticas basadas en energía / imitación | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible | Repositorios de investigación |

Las celdas marcadas como "no disponible en la información proporcionada" reflejan que la búsqueda web no devolvió documentación técnica utilizable (los resultados obtenidos trataban sobre la plataforma Twitch y no guardan relación con el modelo). Las referencias a licencias del ecosistema robomimic proceden de conocimiento general del sector y no han podido verificarse con las fuentes recuperadas.

## Limitaciones y advertencias

- Ámbito de tarea muy restringido: la política está entrenada exclusivamente para NutAssembly (inserción de la tuerca cuadrada). No hay evidencia de generalización a otras tareas de robosuite ni a objetos distintos.
- Dependencia de observaciones *low-dim*: requiere vectores de estado con poses de objetos y propiocepción. No funciona con entradas de imagen, por lo que no puede desplegarse en configuraciones basadas en cámara sin reentrenar.
- Datos de entrenamiento limitados: 200 demostraciones de un único dataset público. El riesgo de comportamiento fuera de distribución ante variaciones de posición inicial, fricción o dinámica es alto, típico del *behavior cloning*.
- Métrica con alta varianza: las tasas de éxito se calculan sobre 20 episodios únicamente, sin semillas ni intervalos de confianza; una diferencia de 10 puntos porcentuales entre épocas puede no ser estadísticamente significativa.
- Entrenamiento en simulación: no se documenta transferencia a hardware real (sim-to-real), ni calibración de sensores ni robustez ante ruido de actuadores.
- Riesgo de alucinación no aplicable en el sentido generativo de texto, pero sí existe riesgo de acciones incoherentes o colisiones cuando el estado observado se aleja de la distribución de demostraciones.
- Sesgos potenciales derivados de las demostraciones humanas del dataset: las estrategias de inserción aprendidas reflejan el estilo y las limitaciones de los demostradores, y pueden ser subóptimas en tiempo o suavidad.
- Licencia del modelo: MIT, permite uso comercial y modificación, pero el dataset subyacente de robomimic y el código de robosuite tienen sus propias condiciones, no verificadas en esta consulta.
- Madurez del artefacto: 0 descargas y 0 *likes* en el momento de la consulta, sin *pipeline* declarado en HuggingFace, lo que implica ausencia de validación por terceros.
- Tamaño del repositorio: 10,5 GB, lo que exige espacio en disco y tiempo de descarga considerables si se quieren todos los checkpoints; se recomienda descargar únicamente el checkpoint de la época 1800.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/georginio2000/diffusion-square-nutassembly
- Checkpoint recomendado por el autor: `checkpoints/model_epoch_1800_low_dim_success_0.95.pth` (descargable con `huggingface_hub.hf_hub_download` desde el repositorio anterior)
- Repositorio de robomimic: https://github.com/ARISE-Initiative/robomimic (referenciado implícitamente por las etiquetas del modelo; no verificado en la búsqueda web)
- Repositorio de robosuite: https://github.com/ARISE-Initiative/robosuite (referenciado implícitamente por las etiquetas del modelo; no verificado en la búsqueda web)

La búsqueda web realizada no devolvió artículos, *papers*, blogs ni demos relacionados con este modelo: los resultados obtenidos correspondían a contenido sobre la plataforma Twitch y fueron descartados por no ser relevantes.

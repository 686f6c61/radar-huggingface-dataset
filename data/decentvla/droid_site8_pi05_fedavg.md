# DecentVLA/droid_site8_pi05_fedavg

## Resumen

droid_site8_pi05_fedavg es un checkpoint de robótica basado en π0.5 (pi05), el modelo de política visomotora de Physical Intelligence, ajustado mediante *fine-tuning* completo sobre el conjunto de datos DROID 1.0.1. Lo publica el proyecto DecentVLA como parte de un estudio de aprendizaje federado: en lugar de entrenar de forma centralizada, ocho clientes (cada uno correspondiente a una celda "edificio × recolector" de DROID) entrenan localmente y sus pesos se agregan cada ronda mediante FedAvg ponderado por número de fotogramas de entrenamiento.

El modelo parte de `pi05_base` y aplica la receta oficial de openpi `pi05_full_droid_finetune` (horizonte 16, AdamW con lr 5e-5 tras un calentamiento de 1.000 pasos, clip 1.0, EMA 0.99 y las estadísticas de normalización de posición articular de `pi05_droid_jointpos`). El resultado se distribuye en el formato de checkpoint oficial de openpi (JAX, pesos EMA en bfloat16) y es cargable directamente por el servidor de políticas de RoboLab sin modificaciones.

La relevancia es doble: por un lado ofrece un punto de referencia reproducible de π0.5 entrenado con datos DROID reales y desagregados por sitio; por otro, documenta el comportamiento de un esquema federado (8 clientes, 100 rondas) frente a alternativas centralizadas, con el éxito en RoboLab-120 como métrica de evaluación en lugar de la pérdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05) de openpi, transformer visomotor con política de acciones; detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción de 16 pasos; el checkpoint devuelve chunks de acción de forma (15, 8)) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de entrenamiento son en inglés, con verbos place/take/stack) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint oficial de openpi (JAX), EMA en bfloat16, con `assets/droid` para estadísticas de normalización; no se publican pesos en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* completo de `pi05_base` siguiendo la receta `pi05_full_droid_finetune` de openpi: horizonte de 16, optimizador AdamW con tasa de aprendizaje 5e-5 tras un calentamiento de 1.000 pasos, recorte de gradiente 1.0, media móvil exponencial de 0.99 y normalización con las estadísticas de posición articular de `pi05_droid_jointpos`. El entrenamiento se ejecutó con la infraestructura decent-vla sobre el split **site8** de DROID 1.0.1, compuesto por ocho clientes, cada uno una celda "etiqueta de edificio × recolector": RAIL, BAIR, TRI, EVGR C, Penn Levine 457, Autolab, Gates y BWW. Se seleccionaron episodios exitosos cuya instrucción empieza por un verbo de colocar, tomar o apilar, con un máximo de 1.500 por sitio y un 10 % reservado para validación, resultando en 8.723 episodios de entrenamiento y 1.724.640 fotogramas tras el filtro de inactividad de openpi (entre 573 y 1.350 episodios por cliente).

El presupuesto de cómputo fue de 100 rondas × 250 pasos, con lote de cliente de 32 y lote centralizado de 256, sumando 25.000 pasos de optimizador por modelo y 6,4 millones de muestras de entrenamiento. La agregación FedAvg se realizó cada ronda con pesos proporcionales a los fotogramas de entrenamiento de cada cliente. Los ocho clientes se ejecutaron como dos procesos en dos nodos (cuatro clientes cada uno) y se fusionaron cada ronda en la media ponderada por fotogramas de ambos agregados, equivalente al agregado FedAvg de ocho clientes salvo redondeo en coma flotante. El cómputo se realizó en nodos con cuatro tarjetas de 96 GB, con lotes acumulados por slices (dos de 16 para un cliente, dos de 128 para el entrenamiento centralizado).

## Capacidades

- Control robótico visomotor: genera *chunks* de acción de forma (15, 8) a partir de observaciones e instrucciones en lenguaje natural, en el espacio de posiciones articulares de DROID.
- Ejecución de instrucciones de manipulación: el entrenamiento se restringe a episodios cuyas instrucciones comienzan por verbos de colocar (place), tomar (take) o apilar (stack).
- Integración con el ecosistema openpi: los pesos cargan sin cambios en el servidor de políticas de RoboLab mediante `scripts/serve_policy.py`.
- Aprendizaje federado reproducible: el repositorio incluye la configuración de ejecución (`openpi_pi05_droid_site8_fedavg_gh200.yaml`) y checkpoints en las rondas 60 y 100.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión general, audio: no disponibles (el modelo es específico de política robótica, no un modelo de lenguaje general).

## Casos de uso

- **Investigación en aprendizaje federado para robótica**: comparar el rendimiento de un agregado FedAvg de ocho sitios frente a entrenamiento centralizado con el mismo presupuesto de pasos (25.000), usando el éxito en RoboLab-120 como métrica. El checkpoint de la ronda 60 permite además estudiar la evolución del rendimiento con las rondas.
- **Evaluación de políticas π0.5 sobre DROID**: servir el modelo con el servidor openpi y medir tasas de éxito en tareas de manipulación con instrucciones de place/take/stack, aprovechando que los pesos están en el formato oficial y las estadísticas de normalización de `pi05_droid_jointpos` ya están incluidas.
- **Punto de partida para *fine-tuning* por sitio**: al estar entrenado sobre ocho celdas DROID diferenciadas, sirve como inicialización para adaptar la política a un robot o laboratorio concreto con pocos datos propios.
- **Reproducción de experimentos federados**: la configuración YAML y la descripción del particionado (ocho clientes, pesos por fotogramas, dos nodos con cuatro clientes cada uno) permiten replicar el pipeline con decent-vla sobre el split site8.
- **Despliegue en RoboLab**: cargar el checkpoint con `python scripts/serve_policy.py --port 8000 policy:checkpoint --policy.config=pi05_droid_jointpos --policy.dir=<repo>/openpi` para obtener un servidor de políticas que responde con chunks de acción de forma (15, 8).
- **Auditoría de robustez entre sitios**: al disponer de checkpoints por ronda y de un modelo entrenado con datos heterogéneos por cliente, se puede analizar si la política generaliza entre edificios y recolectores o si está sesgada hacia los sitios con más fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la pérdida de entrenamiento no se reporta como resultado y que la métrica de evaluación es la tasa de éxito en RoboLab-120, pero no incluye cifras de dicha métrica en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 10,5 GB, lo que da una cota inferior del espacio en disco necesario para los pesos en bfloat16, pero no se especifica el número de parámetros ni el pico de memoria en inferencia.
- GPU recomendadas: no disponibles. El entrenamiento se realizó en nodos con cuatro tarjetas de 96 GB (compatibles con GH200 según el nombre del fichero de configuración), pero no se documentan requisitos de inferencia.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: servidor de políticas de openpi/RoboLab mediante `scripts/serve_policy.py` con `--policy.config=pi05_droid_jointpos`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: los checkpoints completos de decent-vla (`server_round_0020 … 0100.pt`) ocupan 27 GB cada uno y no se distribuyen en el repositorio; solo se publican las exportaciones de las rondas 60 y 100 en formato openpi.

## Comparativa con modelos similares

| Modelo | Base | Datos de entrenamiento | Esquema | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| droid_site8_pi05_fedavg (este) | π0.5 (`pi05_base`) | Split site8 de DROID 1.0.1, 8.723 episodios, 1.724.640 fotogramas | Federado FedAvg, 8 clientes, 100 rondas | Horizonte 16; chunk de acción (15, 8) | Apache 2.0 | Hugging Face, 0 descargas |
| π0.5 base (`pi05_base`) | — | Preentrenamiento de Physical Intelligence | Centralizado | no disponible en la información proporcionada | no disponible | Disponible a través de openpi |
| `pi05_droid_jointpos` | π0.5 | DROID con posiciones articulares | Centralizado | no disponible | no disponible | Disponible a través de openpi |

No se dispone de datos de rendimiento comparativo (tasas de éxito en RoboLab-120) para este checkpoint ni para las alternativas en la información proporcionada, por lo que la comparación se limita a linaje, datos y esquema de entrenamiento.

## Limitaciones y advertencias

- **Sesgos de dominio**: el entrenamiento se restringe a episodios exitosos cuyas instrucciones empiezan por verbos de place, take o stack; el modelo puede degradarse ante instrucciones de otro tipo o ante tareas de manipulación no representadas.
- **Desequilibrio entre sitios**: aunque la agregación pondera por fotogramas, el número de episodios por cliente varía entre 573 y 1.350, lo que puede sesgar la política hacia los sitios con más datos.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones incorrectas o inseguras en el robot; la model card no documenta métricas de seguridad ni de fallo.
- **Ausencia de métricas publicadas**: no se incluyen cifras de éxito en RoboLab-120 ni de pérdida, de modo que no es posible evaluar la calidad del checkpoint sin ejecutar la evaluación por cuenta propia.
- **Limitaciones de idioma**: las instrucciones de entrenamiento están en inglés; no hay evidencia de soporte para instrucciones en castellano u otros idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo depende de openpi y de π0.5, cuyas condiciones de uso y de los datos DROID deben verificarse por separado antes de un despliegue en producción.
- **Madurez**: el repositorio tiene 0 descargas y 0 *likes*, y los checkpoints completos de entrenamiento no se distribuyen; solo están disponibles las exportaciones de las rondas 60 y 100.
- **Formato específico**: los pesos están en formato JAX de openpi, no en safetensors ni GGUF, lo que limita su uso fuera del ecosistema openpi/RoboLab.

## Enlaces

- Hugging Face: https://huggingface.co/DecentVLA/droid_site8_pi05_fedavg
- openpi (repositorio oficial de Physical Intelligence): no disponible en la información proporcionada
- DROID 1.0.1 (dataset): no disponible en la información proporcionada
- Proyecto decent-vla: no disponible en la información proporcionada
- RoboLab: no disponible en la información proporcionada
- Paper o blog de π0.5: no disponible en la información proporcionada

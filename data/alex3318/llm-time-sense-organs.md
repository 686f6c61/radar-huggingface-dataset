# Alex3318/llm-time-sense-organs

## Resumen

`llm-time-sense-organs` es un conjunto de cuatro redes neuronales recurrentes pequenas (GRU de una capa y 256 unidades) publicadas como artefactos de investigacion del estudio `llm-time-sense`, parte del proyecto `always-on-assistant` del autor Alex3318. Cada "organo temporal" procesa un paso por latido sobre la ultima observacion de una ciudad simulada, sin recibir reloj, contador de pasos ni marca temporal explicita. El objetivo no es generar texto ni asistir en tareas generales, sino estudiar si una representacion interna del paso del tiempo (velocidad del mundo, tiempo propio y tiempo del mundo) emerge o puede inducirse en un modelo recurrente.

Los cuatro checkpoints corresponden a tres etapas supervisadas (latido fijo, latido aleatorio y prediccion pura) del experimento de investigacion A, y a un cuarto organo entrenado sobre una ciudad realista con trafico, horarios, clima y ciclo solar (investigacion C). El interes actual reside en su valor como banco de pruebas de interpretabilidad: los autores demuestran que la velocidad del mundo es decodificable linealmente del estado oculto de la GRU (R² de 0,860 y 0,943 sobre el logaritmo de la velocidad en los organos de prediccion pura), lo que permite estudiar representaciones temporales sin depender de etiquetas.

No es un modelo de lenguaje: el nombre incluye "llm" por el contexto del estudio, pero la arquitectura es una RNN minima entrenada con datos sinteticos generados al vuelo. Su relevancia es metodologica y reproducible, no de producto. El repositorio ocupa 0,0 GB y los pesos se distribuyen en formato safetensors con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente GRU de 1 capa con 256 unidades, precedida de una capa Linear + tanh; cabezas MLP de salida |
| Parametros totales | no disponible (no se publica el recuento; estimable en el orden de 10^5–10^6 segun la variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa un frame por paso, sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tensores unicamente, sin codigo pickled) mas JSON de configuracion por variante |

## Arquitectura y entrenamiento

La red es un `TimeNet` (variante A) o `TimeNet2` (variante C) compuesto por una capa de entrada `Linear(obs_dim → 256)` con activacion tanh, seguida de una GRU de una sola capa y 256 unidades que avanza un paso por latido. En la investigacion A, `obs_dim` es 612 (codificacion fija cos/sin de posiciones de coche, semaforo y sol); en la investigacion C, `obs_dim` es 259 con normalizacion almacenada (`mu`, `sd`). Las cabezas de salida son un MLP `head` (256 → 128 → 3) que emite log-velocidad, tiempo del cuerpo y tiempo del mundo para los organos supervisados, y una cabeza `pred` (256 → 736 en A, 256 → 334 en C) que predice dos horizontes (5 y 25 pasos en A; dos horizontes de 167 valores en C).

El entrenamiento se realiza sobre episodios de ciudades simuladas generadas al vuelo en tiempo virtual, sin datos reales ni reloj real. Las etapas supervisadas usan etiquetas de velocidad, tiempo del cuerpo y tiempo del mundo con latido fijo a 100 pasos/s (etapa 1) o latido aleatorio entre 40 y 160 pasos/s con 30 s de "infancia" a 1x (etapa 2). La etapa 3 y el organo de investigacion C se entrenan solo con prediccion, sin etiquetas temporales. Cada organo se entrena en una unica GPU durante 25–50 minutos (el organo C, unos 47 minutos) con una sola semilla. Las ciudades de entrenamiento usan semillas ≥ 100000 y las de evaluacion semillas < 100000.

## Capacidades

- Percepcion de velocidad del mundo: los organos supervisados estiman la velocidad del mundo simulado con errores medianos de +4,7 % (10x), −1,5 % (100x) y +1,9 % (2000x) en 64 ciudades no vistas.
- Autocalibracion temporal: la etapa 2 estima tiempo virtual con desviaciones de +7,0 %, −7,8 % y +1,7 % en los tres regimenes evaluados, y en un sandbox en vivo sellado a reloj alcanza 1438x–2145x frente a 2000x reales en 5 ciudades.
- Prediccion de observaciones futuras: los organos de prediccion pura anticipan observaciones de baja resolucion a 5 y 25 pasos.
- Codificacion latente de la velocidad: una sonda lineal sobre el estado oculto alcanza R² 0,860 (investigacion A) y 0,943 (investigacion C) para el logaritmo de la velocidad del mundo.
- Integracion de dinamicas complejas: la variante C modela trafico, horarios, clima y ciclo solar y luna en la ciudad simulada.
- No soporta generacion de texto, tool calling, agentes, vision real, audio ni capacidades multilingues.

## Casos de uso

- Investigacion en interpretabilidad temporal: cargar los pesos con `safetensors.torch.load_file` y aplicar sondas lineales sobre el estado oculto para estudiar como emerge la nocion de velocidad sin etiquetas.
- Reproduccion de experimentos: el repositorio `llm-time-sense` permite regenerar los episodios sinteticos y reentrenar cada organo en 25–50 minutos en una sola GPU, util para validar resultados.
- Estudio de autocalibracion en sistemas embebidos: la etapa 2 demuestra calibracion de un latido variable (40–160 pasos/s) con 30 s de infancia, un patron trasladable a disenos de relojes internos en agentes siempre activos.
- Benchmark de decodificabilidad: usar la diferencia entre R² 0,943 (ciudad realista) y −0,010 (un solo frame) como control metodologico en estudios de representaciones latentes.
- Docencia en redes recurrentes: la red es lo bastante pequena para inspeccionar pesos y activaciones en un portatil, con configuracion JSON explicita y carga verificada con `strict=True`.
- Pruebas de robustez ante extrapolacion: evaluar el comportamiento de los organos supervisados por encima de 2000x, donde el modelo satura en torno a 2000x, como caso de estudio de limites de generalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos son las metricas internas del estudio recogidas en la model card:

| Metrica | Variante | Resultado |
|---|---|---|
| Error mediano de velocidad (64 ciudades no vistas, 10x) | research-a-stage1 | +4,7 % |
| Error mediano de velocidad (100x) | research-a-stage1 | −1,5 % |
| Error mediano de velocidad (2000x) | research-a-stage1 | +1,9 % |
| Error de tiempo virtual (10x / 100x / 2000x) | research-a-stage2 | +7,0 % / −7,8 % / +1,7 % |
| Rango en sandbox sellado a reloj (5 ciudades, 2000x) | research-a-stage2 | 1438x–2145x |
| Sonda lineal R² sobre log velocidad | research-a-stage3 | 0,860 (sin entrenar: 0,176) |
| Sonda lineal R² sobre log velocidad | research-c | 0,943 (sin entrenar: −0,010; un frame: −0,010) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision original; el repositorio ocupa 0,0 GB y la red es de orden 10^5–10^6 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento original se hizo en una sola GPU (modelo no especificado) en 25–50 minutos.
- Cabe en GPU de consumo: si, en cualquier RTX o GTX moderna e incluso en CPU para inferencia paso a paso.
- Opciones de despliegue: carga directa con PyTorch y `safetensors`; la variante C requiere `numba` por la importacion de la ciudad realista. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; al procesar un frame por paso, el coste por paso es minimo, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (organos temporales recurrentes entrenados sobre ciudades sinteticas para estudios de interpretabilidad). Como referencia arquitectonica generica, una GRU de 256 unidades es un orden de magnitud menor que modelos recurrentes de produccion, pero no hay datos de rendimiento cruzado que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Solo modela mundos simulados; no es un modelo de percepcion temporal del mundo real.
- Una unica semilla de entrenamiento por organo; la varianza de entrenamiento no se ha medido.
- Los organos supervisados no extrapolan: por encima de 2000x leen aproximadamente 2000x.
- Los organos de prediccion pura codifican la velocidad de forma gruesa: un R² de 0,943 sobre el logaritmo de la velocidad implica un error tipico de en torno al 77 % en un solo paso.
- Los organos de prediccion pura no codifican su propia tasa de latido (R² ≈ 0).
- No hay afirmacion alguna sobre conciencia o experiencia; el nombre "time sense" es descriptivo del experimento, no una tesis.
- Sesgos conocidos: no disponibles; el entrenamiento es exclusivamente sintetico, sin datos personales, voces ni sensores reales.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las predicciones del organo C son aproximaciones de una ciudad simulada y no deben interpretarse como estado real.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no esta pensado para produccion y carece de soporte o mantenimiento declarado.
- La carga de la variante C depende de `numba` y de rutas del repositorio (`experiments/research/code_c/models2.py`), lo que anade friccion de integracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alex3318/llm-time-sense-organs
- Repositorio del estudio (codigo, paper y registros): https://github.com/Alex20090906/llm-time-sense
- Proyecto marco `always-on-assistant`: referenciado en la model card, sin URL directa en la informacion disponible.

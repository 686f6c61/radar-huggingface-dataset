# FidelityWM/planning-baselines

## Resumen

FidelityWM/planning-baselines es un repositorio de HuggingFace que archiva checkpoints y resultados de evaluación de planificación de tres familias de modelos del mundo (world models) empleadas como baseline: Fast-LeWM, DINO-WM y PLDM. Lo publica el usuario FidelityWM y no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un artefacto de investigación cuyo objetivo es reproducir y comparar experimentos de planificación sobre tres tareas de control visual: TwoRoom, Cube y PushT.

El alcance está declarado de forma explícita en la propia model card: Reacher queda excluido y LeJEPA aparece como cancelado. Los checkpoints originales de Fast-LeWM (procedentes de naiverer/fast-leworldmodel) están completos y con las evaluaciones de cinco semillas finalizadas; DINO-WM solo incluye PushT y su evaluación figura como incompleta; PLDM incluye un checkpoint intermedio de Cube y, para TwoRoom, únicamente configuración y resultados, ya que los pesos entrenados fueron borrados.

Su relevancia es metodológica: fija un protocolo de evaluación concreto (presupuesto de 50 pasos de entorno, ventana de planificación de 25 pasos, CEM con 300 candidatos, 30 iteraciones y 30 élites, offsets de objetivo 25/50/75/100 y semillas de evaluación 42-46), publica los resultados por semilla con media y desviación estándar muestral (ddof=1) y advierte de que no se trata de una comparación con presupuesto de entrenamiento igualado ni de una reproducción exacta de los artículos originales. El tamaño del repositorio es de 0,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos del mundo para planificación en espacio latente. DINO-WM emplea un backbone DINOv2-S/14 congelado como codificador visual; la arquitectura interna de Fast-LeWM y PLDM no se detalla en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los LLM; ventana de planificación de 25 pasos sobre un presupuesto de 50 pasos de entorno |
| Tipos de cuantización | no disponible; se distribuyen objetos PyTorch en precisión nativa, sin versiones cuantizadas |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible en los metadatos de HuggingFace; los checkpoints originales conservan sus licencias upstream, documentadas en el directorio `licenses/` del repositorio |
| Formato de pesos | `.pt` (objetos Python serializados con pickle y state dicts de PyTorch); no se distribuyen safetensors ni GGUF |
| Métodos incluidos | Fast-LeWM, DINO-WM, PLDM |
| Tareas cubiertas | TwoRoom, Cube, PushT (Reacher excluido; LeJEPA cancelado) |
| Semillas de evaluación | 42, 43, 44, 45, 46 |
| Semilla de entrenamiento (checkpoints locales) | 42 |
| Tamaño del repositorio | 0,9 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura única, sino que agrupa checkpoints de tres métodos. De DINO-WM se especifica que incluye el checkpoint original OSF de PushT junto con un backbone DINOv2-S/14 congelado, y que el modelo publicado fue entrenado sobre `pusht_noise`. Del resto de componentes internos (tipo de predictor latente, dimensionalidad del espacio de estados, función de coste) no se ofrece información en la model card, por lo que se marca como no disponible. No se describen fases de RLHF, DPO ni ajuste por preferencias, ya que el artefacto pertenece a planificación basada en modelos y no a generación de texto.

En cuanto al entrenamiento, los checkpoints de PLDM y DINO-WM entrenados localmente usan un presupuesto fijo de 10 épocas, mientras que los checkpoints publicados de Fast-LeWM y DINO-WM conservan sus historiales de entrenamiento originales. El autor advierte explícitamente de que esto no constituye una comparación con presupuesto igualado ni una reproducción exacta de los artículos. Los checkpoints locales se archivan en `trained/<method>/<task>/model.pt` con un fichero de procedencia asociado y semilla de entrenamiento 42; el autor aclara que cinco semillas de evaluación no equivalen a cinco modelos entrenados de forma independiente. El protocolo de planificación emplea CEM con 300 candidatos, 30 iteraciones y 30 élites sobre una ventana de 25 pasos, y los pares tarea/offset/semilla de evaluación se comparten entre modelos; estos pares provienen del conjunto de datos suministrado y no constituyen un split de test independiente.

## Capacidades

- Planificación por muestreo (CEM) en entornos de control visual: los checkpoints permiten ejecutar bucles de planificación con 300 candidatos, 30 iteraciones y 30 élites sobre horizontes de 25 pasos.
- Codificación visual mediante DINOv2-S/14 congelado en el caso de DINO-WM sobre PushT; no se documentan capacidades de visión general fuera de ese codificador.
- Evaluación multi-semilla y multi-offset: el repositorio permite reproducir medidas de éxito por semilla (42-46) y por offset de objetivo (25, 50, 75 y 100).
- Restauración de checkpoints: los objetos locales pueden reconstruirse con `code/train_models.py` y `code/train_baseline.py`, apoyándose en stable-worldmodel 0.1.1.
- Reanudación de entrenamiento: el checkpoint intermedio de PLDM/Cube contiene state dicts, estado del optimizador, estado del RNG y metadatos de épocas completadas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo de pensamiento (thinking mode), audio ni generación de texto de ningún tipo.

## Casos de uso

- Reproducción de baselines en investigación sobre modelos del mundo: el repositorio permite arrancar experimentos de planificación en TwoRoom, Cube y PushT partiendo de checkpoints ya evaluados, evitando reentrenar desde cero.
- Comparación controlada de planificadores: al compartir los pares tarea/offset/semilla persistidos, se pueden contrastar Fast-LeWM, DINO-WM y PLDM bajo el mismo presupuesto de planificación de 50 pasos y la misma configuración de CEM.
- Desarrollo de métodos nuevos sobre un protocolo ya definido: cualquier método alternativo puede evaluarse con offsets 25/50/75/100 y cinco semillas, y compararse contra las medias y desviaciones estándar ya archivadas.
- Auditoría de resultados de planificación: los ficheros `results/planning_success.xlsx` y `results/planning_summary.csv` permiten verificar el cálculo de medias y desviaciones típicas (ddof=1) exigiendo las cinco semillas completas y tratando los valores ausentes como nulos.
- Entrenamiento y ajuste de checkpoints locales: `code/train_models.py` y stable-worldmodel 0.1.1 permiten entrenar variantes con semilla 42 y archivar la procedencia junto a cada `model.pt`.
- Estudio de control basado en modelos con representaciones visuales congeladas: el checkpoint de DINO-WM sobre PushT, con backbone DINOv2-S/14 congelado, sirve para analizar hasta qué punto un codificador visual preentrenado basta para planificar en tareas de manipulación.
- Docencia y experimentación en robótica simulada: PushT y Cube son tareas de referencia habituales para ilustrar planificación en espacio latente con un coste computacional acotado y un repositorio de 0,9 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio contiene los ficheros `results/planning_success.xlsx` y `results/planning_summary.csv` con los valores por semilla, pero las cifras concretas no se incluyen en la model card ni en la información proporcionada, y el autor indica explícitamente que ningún número publicado en artículos se sustituye por una medida propia.

| Aspecto | Estado |
|---|---|
| Métrica principal | Porcentaje de éxito de planificación, calculado solo sobre 200 episodios completados por semilla y offset de objetivo |
| Desglose disponible | Por semilla (42, 43, 44, 45, 46), por tarea (TwoRoom, Cube, PushT) y por offset (25, 50, 75, 100) |
| Valores numéricos | no disponibles en la información proporcionada; residen en `results/planning_success.xlsx` y `results/planning_summary.csv` |
| Media y desviación estándar | Requieren las cinco semillas completas; ddof=1; los valores ausentes se registran como nulos |
| Comparación con otros modelos | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no disponible en la model card. Como referencia derivada, el repositorio completo ocupa 0,9 GB, por lo que los checkpoints individuales son pequeños y es razonable esperar que la inferencia quepa en GPUs de gama de consumo con pocos GB de VRAM; esta afirmación es una estimación a partir del tamaño del repositorio y no un dato publicado por el autor.
- GPU recomendadas: no disponible. No se indican modelos concretos (A100, H100, RTX 4090 u otros).
- Viabilidad en GPU de consumo: no confirmada por el autor. El tamaño reducido de los checkpoints y el uso de un backbone DINOv2-S/14 sugieren que es viable, pero no hay confirmación oficial.
- Opciones de despliegue: no se contemplan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La carga requiere el código fuente correspondiente: la fuente de Fast-LeWorldModel para los objetos originales de Fast-LeWM, la fuente original de DINO-WM para los objetos de DINO-WM y, para los objetos entrenados localmente, `code/train_models.py` más stable-worldmodel 0.1.1.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por paso de planificación es alto, dado que cada decisión implica CEM con 300 candidatos, 30 iteraciones y 30 élites sobre una ventana de 25 pasos.
- Restricción de carga: el checkpoint de reanudación de PLDM/Cube no es un objeto de modelo directamente invocable; requiere `code/train_baseline.py` para su restauración.

## Comparativa con modelos similares

La comparación más pertinente es entre las tres familias de baseline incluidas en el propio repositorio, ya que comparten tareas y protocolo de evaluación.

| Aspecto | Fast-LeWM | DINO-WM | PLDM |
|---|---|---|---|
| Tareas incluidas | TwoRoom, Cube, PushT | PushT | Cube (intermedio), TwoRoom (solo resultados) |
| Checkpoints | Originales exactos de naiverer/fast-leworldmodel | Checkpoint original OSF de PushT más backbone DINOv2-S/14 congelado | Checkpoint de reanudación de Cube; pesos de TwoRoom borrados |
| Estado de la evaluación | Evaluaciones de cinco semillas completadas | Incompleta | Parcial |
| Presupuesto de entrenamiento | Historial original del modelo publicado | Historial original en el checkpoint publicado; 10 épocas en los entrenados localmente | 10 épocas en los entrenados localmente; el checkpoint de Cube es intermedio |
| Licencia | Conserva la licencia upstream (documentada en `licenses/`) | Conserva la licencia upstream (documentada en `licenses/`) | no disponible |
| Disponibilidad en el repositorio | Completa para las tres tareas | Solo PushT | Cube parcial; TwoRoom sin pesos |

Frente a alternativas externas, los dos proyectos de referencia citados por el autor son naiverer/fast-leworldmodel y gaoyuezhou/dino_wm, que constituyen el origen de los checkpoints. No se dispone de datos de parámetros, contexto ni rendimiento de esas alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Riesgo de seguridad en la carga: los checkpoints son objetos Python serializados con pickle. Cargarlos exige el código fuente correspondiente y una fuente de checkpoints de confianza; un fichero manipulado podría ejecutar código arbitrario.
- Comparación no igualada: los checkpoints nuevos de PLDM y DINO-WM se entrenaron con un presupuesto fijo de 10 épocas, mientras que los publicados de Fast-LeWM y DINO-WM conservan sus historiales originales. El autor advierte de que no es una comparación con presupuesto igualado ni una reproducción exacta de los artículos.
- Ausencia de split de test independiente: los pares de evaluación proceden del conjunto de datos suministrado y no de un split held-out separado, lo que limita las garantías de generalización de las cifras.
- Cobertura incompleta: la evaluación de DINO-WM está sin terminar, el checkpoint de PLDM/Cube es intermedio (hay que consultar `provenance.json` para el número de épocas completadas) y los pesos entrenados de PLDM/TwoRoom se borraron, por lo que no están disponibles.
- Semillas: las cinco semillas son de evaluación, no cinco modelos entrenados de forma independiente; los checkpoints locales usan únicamente la semilla 42. La media y la desviación estándar solo son válidas si las cinco semillas están completas.
- Licencia: no se declara licencia en los metadatos de HuggingFace y cada checkpoint original conserva la suya. Antes de cualquier uso comercial es necesario revisar el directorio `licenses/` y las condiciones del proyecto upstream correspondiente.
- Idiomas y texto: al no ser un modelo de lenguaje, no tiene capacidades multilingües ni de generación de texto, y no debe presentarse como tal.
- Alucinación y sesgos: no aplica el concepto habitual en modelos generativos de texto; el riesgo equivalente es el fallo de planificación o la sobreestimación de éxito derivada de protocolos no ciegos. No se documentan sesgos específicos.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes, sin pipeline declarado, lo que implica ausencia de verificación externa.
- Dependencias frágiles: la carga depende de versiones concretas de código fuente ajeno y de stable-worldmodel 0.1.1; no se suben los conjuntos de datos originales, por lo que la reproducibilidad completa requiere obtenerlos por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FidelityWM/planning-baselines
- Repositorio fuente de LeWorldModel: https://github.com/lucas-maes/le-wm
- Checkpoints originales de Fast-LeWM: https://huggingface.co/naiverer/fast-leworldmodel
- Repositorio fuente de DINO-WM: https://github.com/gaoyuezhou/dino_wm
- Documentación interna del repositorio: `results/PROTOCOL.md` (protocolo completo y diferencias de implementación conocidas), `licenses/` (licencias upstream de los checkpoints originales) y `provenance.json` (épocas completadas de los checkpoints locales).
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre las cataratas del Iguazú), por lo que no se incluye ningún enlace adicional ni datos procedentes de esa búsqueda.

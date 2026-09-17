# mississippiu/prefill-assistant-models

## Resumen

`mississippiu/prefill-assistant-models` es un repositorio de checkpoints de investigación asociado al proyecto [prefill-assistant](https://github.com/zywang624/prefill-assistant) de zywang624. No es un modelo generativo empaquetado para uso directo, sino una colección de estados de entrenamiento (`.pt`) que documentan una línea de experimentos sobre adaptación de las tres matrices FFN de un modelo base que la model card no identifica. El estado entrenable declarado por checkpoint es de 264,2 M parámetros, correspondiente únicamente a las proyecciones FFN, no al modelo completo.

El repositorio ocupa 114,6 GB e incluye, por cada directorio de entrenamiento, un fichero `a.pt` con el estado entrenable, un `a.step1000.pt` con un punto intermedio, un `folded.pt` en los runs con mecanismo de gating (plegado a anchura por capa, que es el que se usa para evaluar) y un `train.log` con la curva de pérdida por paso y de conjunto de retención. La model card está redactada íntegramente en chino y advierte explícitamente de que uno de los dos directorios publicados no debe presentarse como resultado del método.

Su relevancia actual es metodológica: publica una referencia de calibración con puntuaciones conocidas en RULER y LongBench para que otros equipos verifiquen que su pipeline de evaluación de contexto largo es correcto, además de un run de control de anchura completa entrenado con un pool de datos nuevo de 1,05 B de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio contiene estados de las tres matrices FFN de un modelo base no identificado en la model card; no se describe la arquitectura completa |
| Parametros totales | 264,2 M parámetros entrenables por checkpoint (solo FFN). Parámetros del modelo base: no disponible |
| Parametros activos | No aplica (no se describe un modelo MoE) |
| Longitud de contexto | No disponible como especificación del modelo. Se evalúa con RULER a 32768 tokens; las ventanas de entrenamiento documentadas son 128-256 (run antiguo) y 512-1024 (run `b2_w3072`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según la model card; la licencia del modelo base no se especifica) |
| Formato de pesos | PyTorch `.pt` (`a.pt`, `a.step1000.pt`, `folded.pt`). No se publican safetensors ni GGUF |
| Tamano del repositorio | 114,6 GB |
| Datos de entrenamiento | Pool nuevo: 1.05 B tokens (epoch 0.4991). Pool antiguo: 150 M tokens repetidos 3,49 veces, cubriendo 2 de los 23 fragmentos de PG19 |
| Repositorio de datos | `mississippiu/prefill-assistant-data` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base. Lo que sí detalla es el régimen de ajuste: cada checkpoint contiene únicamente las tres matrices de la FFN en estado entrenable (264,2 M parámetros) y, en los runs con gating, un fichero `folded.pt` que pliega el mecanismo a una anchura por capa y que es el utilizado para evaluación. El `train.log` de cada directorio incluye la pérdida por paso y la curva de conjunto de retención.

Se documentan dos configuraciones de datos y ventanas de entrenamiento. El directorio `b2_w3072` es el control de anchura completa del lote nuevo: pool de 1,05 B de tokens con 0,4991 epochs y muestreo continuo de ventanas en el rango [512, 1024], con ventana de evaluación 512. El directorio `CALIBRATION-ONLY_gate75_old-protocol` corresponde al lote antiguo con gating al 75 % (nombre original `c32k_gate2304`): pool de 150 M tokens recorrido 3,49 veces y solo 2 de los 23 fragmentos de PG19, con dos puntos discretos de ventana en 128-256 y ventana de evaluación 128. El autor indica que el run de gating al 75 % del lote nuevo (`b2_gate2304`) se añadirá al repositorio cuando termine el entrenamiento.

No se mencionan en la información disponible detalles de RLHF, DPO, composición del dataset más allá de PG19, ni innovaciones de decodificación (atención lineal, decodificación especulativa). El nombre del proyecto, `prefill-assistant`, sugiere trabajo sobre prefijado de contexto, pero esto no se explicita en la model card.

## Capacidades

- El repositorio no publica una descripción de capacidades generativas, de razonamiento, de código ni de matemáticas.
- Las únicas capacidades documentadas son de evaluación de contexto largo: el modelo se mide con RULER a 32768 tokens (13 tareas) y con LongBench (media macro).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. La model card no declara idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Función de calibración de pipelines: el checkpoint `CALIBRATION-ONLY_gate75_old-protocol` permite verificar que un pipeline de evaluación de contexto largo reproduce puntuaciones conocidas.

## Casos de uso

- Verificación de pipelines de evaluación de contexto largo: el directorio `CALIBRATION-ONLY_gate75_old-protocol` existe precisamente para que otro equipo compruebe que su implementación de RULER y LongBench reproduce las puntuaciones publicadas antes de evaluar modelos propios, evitando errores de protocolo.
- Reproducción de resultados de investigación: los ficheros `train.log` con pérdida por paso y curva de retención permiten contrastar curvas de entrenamiento y estudiar la dinámica del ajuste solo-FFN a lo largo de los pasos.
- Estudio de ajuste eficiente limitado a FFN: al publicar estados entrenables de 264,2 M parámetros sobre las tres matrices FFN, sirve como material de partida para investigar qué aprende esa región concreta de la red frente a otros esquemas de ajuste.
- Investigación sobre ventanas de entrenamiento y extrapolación de contexto: los dos runs publicados usan ventanas distintas (128-256 frente a [512, 1024]), lo que permite analizar cómo el régimen de ventana afecta a las puntuaciones en tareas de contexto largo.
- Reproducción del run de control de anchura completa: `b2_w3072` está pensado como control del lote nuevo, de modo que cualquier comparación posterior del método con gating debe hacerse contra este checkpoint y no contra el de calibración.
- Auditoría de eficiencia de datos: la diferencia entre un pool de 150 M de tokens repetidos 3,49 veces sobre 2 fragmentos de PG19 y un pool de 1,05 B de tokens con 0,4991 epochs permite estudiar el efecto de la diversidad y la repetición de datos en tareas de contexto largo.
- Desarrollo de nuevas variantes del método: el repositorio funciona como punto de anclaje para congelar referencias antes de publicar los runs de gating del lote nuevo (`b2_gate2304`).

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden al checkpoint de calibración `CALIBRATION-ONLY_gate75_old-protocol` (lote antiguo, gating al 75 %, ventana de evaluación 128). El autor advierte de forma explícita de que no deben interpretarse como el resultado del método.

| Benchmark | Configuracion | Resultado |
|---|---|---|
| RULER @32768 (media de 13 tareas) | `CALIBRATION-ONLY_gate75_old-protocol`, `--window 128` | 0,5901 |
| LongBench (media macro) | `CALIBRATION-ONLY_gate75_old-protocol`, `--window 128` | 32,5819 |

No se publican resultados para `b2_w3072` ni para `b2_gate2304` en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de otras familias de benchmarks.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no documenta requisitos de despliegue ni el tamaño del modelo base.
- El estado entrenable de 264,2 M parámetros ocupa aproximadamente 1,06 GB en fp32 o unos 528 MB en fp16/bf16, sin contar los pesos del modelo base, que no se especifican. Cualquier cifra de VRAM total depende de ese modelo base no identificado.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible. Depende del modelo base no especificado.
- Almacenamiento: el repositorio ocupa 114,6 GB, por lo que la descarga completa requiere ese espacio en disco.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. Los pesos se publican como ficheros PyTorch `.pt` de estados parciales, no como pesos completos listos para servidores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos, y el repositorio publica estados parciales de entrenamiento (solo FFN) de un modelo base no identificado, por lo que no existe una categoría de modelos comparables directamente definida.

## Limitaciones y advertencias

- El checkpoint `CALIBRATION-ONLY_gate75_old-protocol` es una referencia de calibración de pipeline, no un resultado del método. El autor pide explícitamente que sus puntuaciones no se presenten como el resultado del trabajo.
- Ese checkpoint debe evaluarse obligatoriamente con `--window 128` porque se entrenó con ventanas de 128-256; evaluarlo con ventana 512 produce una infravaloración de su rendimiento en un régimen para el que no fue entrenado.
- Los resultados publicados corresponden a un pool de datos antiguo de 150 M de tokens recorrido 3,49 veces y limitado a 2 de los 23 fragmentos de PG19: la cobertura de datos es reducida y puede no generalizar.
- No se especifica el modelo base, por lo que no se puede determinar la licencia efectiva del conjunto, ni si los pesos resultantes son redistribuibles más allá de la declaración Apache 2.0 del repositorio.
- La model card está únicamente en chino, lo que dificulta su uso por parte de equipos que no lean ese idioma y aumenta el riesgo de malinterpretar el protocolo de evaluación.
- No hay información sobre sesgos, alucinación, comportamiento multilingüe ni seguridad, porque el repositorio no publica una descripción de capacidades generativas.
- No se publican pesos completos ni formatos estándar de despliegue (safetensors, GGUF), por lo que no es directamente utilizable en servidores de inferencia convencionales.
- El fichero de gating del lote nuevo (`b2_gate2304`) todavía no está en el repositorio en la información disponible; cualquier comparación con él es prematura.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/mississippiu/prefill-assistant-models
- Repositorio de código del proyecto: https://github.com/zywang624/prefill-assistant
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/mississippiu/prefill-assistant-data
- Documento de evaluación `EVALUATING.md`: referenciado en la model card dentro del propio repositorio; no se ha proporcionado URL directa.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a páginas sobre el fármaco gabapentina (Vidal, Doctissimo, LeMedecin, Wikipedia) y no guardan relación con el modelo.

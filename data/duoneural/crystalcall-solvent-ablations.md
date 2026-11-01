# DuoNeural/CrystalCall-Solvent-Ablations

## Resumen

CrystalCall-Solvent-Ablations es una familia de tres checkpoints publicada por DuoNeural Research Lab que investiga el equilibrio entre comprensión de lenguaje conversacional y generación de llamadas a herramientas en formato JSON dentro de un espacio hiperbólico de Poincaré. El modelo emplea una arquitectura propietaria denominada Crystallographic Dynamics Model (CDM), un transformer de 7 capas con mezcla de expertos continua-discreta, 12 cabezas de atención y dimensión oculta de 768, con un total de 91,27 millones de parámetros y un núcleo activo no-embedding de 41,73 millones.

La relevancia del release no reside en el rendimiento bruto, sino en el experimento de ablación: los autores entrenan tres variantes con distintas proporciones de "disolvente conversacional" (0%, 25% y 50% de FineWeb-Edu mezclado con trazas de tool calling de APIGen-80k y Glaive-v2) y documentan un óptimo en el 25%, al que llaman "ley del disolvente eutéctico". Con 91 millones de parámetros, el checkpoint `smt25` alcanza un F1 de argumentos de 72,45% en llamadas simples, muy por encima del 9,94% reportado para Google FunctionGemma-270M, aunque pierde en precisión de selección de herramienta y en validez JSON frente a este último.

Es un modelo de nicho, en inglés, con licencia Apache 2.0, pensado para investigación sobre representaciones no euclídeas y enrutamiento de esquemas AST, no como sustituto de un modelo de propósito general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Crystallographic Dynamics Model (CDM), transformer de 7 capas en geometría hiperbólica de Poincaré, MoE continua-discreta con K=8 slots y 4 expertos |
| Parametros totales | 91.315.872 (91,27M) |
| Parametros activos | 41,73M en el núcleo no-embedding (backbone activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en el repo (variante Q8_0 evaluada por los autores); no se detallan otros formatos |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre un transformer de 7 capas con 12 cabezas de atención por capa (d_head = 64), dimensión oculta d_model = 768 y dimensión de experto d_ff = 768. La innovación central es la incorporación de geometría hiperbólica de Poincaré (curvatura c = 1) en el enrutamiento de expertos: los datos jerárquicos discretos, como gramáticas JSON, árboles de parámetros y firmas de tipo, se embeden en la frontera de una variedad de curvatura negativa, y el enrutamiento se realiza mediante una métrica Voronoi de Poincaré. El bloque MoE continua-discreta usa K = 8 slots con 4 expertos.

El entrenamiento se realizó sobre mezclas de APIGen-80k y Glaive-v2 (trazas puras de tool calling) con proporciones variables de FineWeb-Edu como "disolvente conversacional": 0% (`smt0`), 25% (`smt25`) y 50% (`smt50`). Los autores reportan los mejores valores de BPB en validación en 0,2686 (`smt0`, paso 92,5k), 0,2893 (`smt25`) y 0,4688 (`smt50`, paso 75,0k). No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset más allá de las fuentes citadas, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con plasticidad preservada en el checkpoint `smt25`.
- Tool calling y function calling con salida en JSON estructurado.
- Soporte de llamadas paralelas a múltiples herramientas (parallel tool calls).
- Extracción de argumentos para funciones, con F1 de 72,45% en llamadas simples según la evaluación de los autores.
- Abstención ante consultas irrelevantes (95% en `smt25`), útil para evitar llamadas espurias a herramientas.
- Razonamiento multi-paso orientado a agentes, según los tags del repositorio (agentic, xlam).
- Capacidad de routing de esquemas AST discretos dentro del espacio hiperbólico.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de pensamiento explícito.

## Casos de uso

- Investigación sobre representaciones hiperbólicas: el modelo sirve como banco de pruebas reproducible para estudiar cómo la curvatura negativa afecta al enrutamiento de expertos y a la separación de clases en tareas discretas.
- Enrutamiento de herramientas en asistentes ligeros: con 91M de parámetros y latencia de 149,8 ms en Q8_0 con llama.cpp, puede desplegarse en entornos con recursos muy limitados para decidir qué función invocar a partir de una instrucción en inglés.
- Extracción estructurada de argumentos: su F1 de argumentos (72,45% en simple, 74,18% en paralelo) lo hace adecuado para poblar parámetros de APIs a partir de texto libre, siempre que se valide el JSON resultante.
- Filtrado de abstención en pipelines de agentes: el 95% de abstención en consultas irrelevantes permite usarlo como primera barrera para descartar peticiones que no requieren herramienta antes de llamar a un modelo mayor.
- Experimentación académica sobre mezclas de datos: los tres checkpoints permiten replicar el estudio de ablación del "disolvente eutéctico" y analizar el compromiso entre compresión (BPB) y validez de esquema.
- Prototipado de agentes en local: al caber en GGUF y ejecutarse con llama.cpp, es viable en portátiles y entornos de desarrollo sin GPU dedicada para pruebas de integración de tool calling.
- Docencia y divulgación: ilustra de forma concreta conceptos de geometría hiperbólica aplicada a modelos de lenguaje con un coste computacional bajo.

## Benchmarks y rendimiento

Evaluación sobre una suite de validación retenida de 140 muestras (xLAM-60k de un solo turno, xLAM-60k de llamadas paralelas y controles de abstención de Glaive-v2), comparada con Google FunctionGemma-270M según los datos de la model card:

| Metrica | smt0 | smt25 | smt50 | FunctionGemma-270M |
|---|---|---|---|---|
| Parámetros totales | 91,27M | 91,27M | 91,27M | 268,10M |
| Mejor BPB en validación | 0,2686 | 0,2893 | 0,4688 | 1,8420 |
| Precisión tool calling simple | 64,0% | 68,0% | 52,0% | 80,0% |
| F1 de argumentos simple | 66,13% | 72,45% | 54,20% | 9,94% |
| Precisión tool calling paralelo | 44,0% | 46,0% | 34,0% | 46,0% |
| F1 de argumentos paralelo | 71,32% | 74,18% | 58,12% | 9,01% |
| Validez JSON simple | 68,0% | 82,0% | 62,0% | 96,0% |
| Validez JSON paralelo | 76,0% | 84,0% | 66,0% | 92,0% |
| Abstención / irrelevantes | 90,0% | 95,0% | 87,5% | 82,5% |
| Latencia PyTorch FP32 | 965,9 ms | 962,4 ms | 968,1 ms | 3.675,3 ms |
| Latencia llama.cpp Q8_0 | 149,8 ms | 149,8 ms | 149,8 ms | 1.840,0 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 91,27M de parámetros, en FP32 ocupa aproximadamente 365 MB de pesos; en FP16 unos 183 MB; en Q8_0 alrededor de 91 MB. El repositorio completo pesa 4,8 GB por incluir los tres checkpoints y sus variantes.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 o incluso en CPU. Para FP32 en PyTorch se recomienda al menos 2 GB de VRAM para acomodar activaciones y contexto.
- Cabe en GPU consumer: sí, en todas las GPU con más de 2 GB de VRAM, y también en ejecución solo-CPU.
- Opciones de despliegue: transformers (librería declarada), llama.cpp y Ollama mediante los pesos GGUF publicados; vLLM y TGI no están confirmados en la documentación disponible.
- Latencia y throughput: los autores reportan 962,4 ms por inferencia en PyTorch FP32 y 149,8 ms en llama.cpp con Q8_0 para el checkpoint `smt25`, frente a 3.675,3 ms y 1.840,0 ms respectivamente para FunctionGemma-270M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión tool calling simple | Validez JSON simple | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CrystalCall smt25 | 91,27M | no disponible | 68,0% | 82,0% | Apache 2.0 | HuggingFace (DuoNeural) |
| Google FunctionGemma-270M | 268,10M | no disponible | 80,0% | 96,0% | no disponible en la información | Referencia comparativa en la model card |
| CrystalCall smt0 | 91,27M | no disponible | 64,0% | 68,0% | Apache 2.0 | HuggingFace (DuoNeural) |
| CrystalCall smt50 | 91,27M | no disponible | 52,0% | 62,0% | Apache 2.0 | HuggingFace (DuoNeural) |

No se dispone de datos de otros modelos de tool calling de tamaño comparable (por ejemplo, variantes pequeñas de Qwen o Hermes) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- La longitud de contexto no está especificada, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- El checkpoint `smt0` sufre, según los propios autores, colapso de la variedad hiperbólica en condensados discretos, con parsing de instrucciones frágil; el `smt50` degrada la validez de esquema al 62%.
- La validez JSON de `smt25` (82% en simple, 84% en paralelo) es inferior a la de FunctionGemma-270M (96% y 92%), por lo que en producción requiere un validador y reintentos.
- La precisión de selección de herramienta (68% simple) queda 12 puntos por debajo del modelo de referencia de Google; el modelo destaca en argumentos y abstención, no en elegir la función correcta.
- Riesgo de alucinación no cuantificado en la model card; al ser un modelo de 91M entrenado mayoritariamente con trazas sintéticas, es esperable una cobertura limitada de dominios y APIs no vistas.
- Los benchmarks provienen de una suite interna de 140 muestras, no de estándares públicos, y están reportados por los propios autores; deben interpretarse con cautela.
- El uso comercial está permitido por Apache 2.0, pero la arquitectura y el entrenamiento están poco documentados (sin número de tokens ni detalles de alineación), lo que dificulta auditorías.
- El repositorio tiene 20 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa.
- No se documentan sesgos específicos; la licencia Apache 2.0 no impone restricciones de uso comercial adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/CrystalCall-Solvent-Ablations
- Organización DuoNeural en HuggingFace: https://huggingface.co/DuoNeural
- Sitio web de DuoNeural: https://duoneural.com

# CharlieChen/loop-fwe-untied-grow-d18

## Resumen

loop-fwe-untied-grow-d18 es un modelo de lenguaje base (no instruido) publicado por el usuario CharlieChen en HuggingFace, derivado del trabajo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con recursión ("looped transformer") entrenado desde cero sobre el corpus FineWeb-Edu, con 2.525.036.544 parámetros almacenados en FP32 y una ventana de contexto de 2.048 tokens. El checkpoint público contiene únicamente los tensores del modelo y la recurrencia de evaluación final, junto con un `result.json` con la configuración y métricas seleccionadas.

Su interés es fundamentalmente de investigación: forma parte de un estudio sobre cómo el crecimiento de modelo, la recursión y los operadores de frontera afectan a los exponentes de escalado. La variante "untied-grow d18" corresponde a una coordenada de profundidad d18 con 4 repeticiones finales del núcleo, anchura 2304 y 18 cabezas de atención, usando el tokenizador de GPT-2 vía tiktoken con un vocabulario de 50.257 tokens (ampliado a 50.304 filas del modelo).

No es un artefacto `AutoModel` de Transformers ni está cuantizado: requiere el código específico del paper (`TransformerGPT`) para cargarse y evaluarse. Con 0 descargas y 0 likes en el momento de redactar esta ficha, y sin licencia declarada, debe considerarse un checkpoint académico reproducible más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recursión (looped transformer), implementación propia `TransformerGPT` |
| Parametros totales | 2.525.036.544 (almacenados en FP32) |
| Parametros activos | no aplica (no es MoE); los pesos del núcleo se reutilizan en cada repetición |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es FP32; no se incluyen versiones GGUF, AWQ, GPTQ ni bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `final.pt` (PyTorch, FP32), más `result.json` y `SHA256SUMS` |
| Anchura (d_model) | 2.304 |
| Cabezas de atención | 18 |
| Coordenada de profundidad | d18 |
| Repeticiones finales del núcleo | 4 |
| Tokenizador | GPT-2 vía tiktoken |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| NLL de validación en preentrenamiento | 2,35918326 nats/token |
| Corpus de entrenamiento | HuggingFaceFW/fineweb-edu |
| Tamaño del repositorio | 10,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer con recursión: en lugar de apilar un número fijo de bloques distintos, un núcleo ("core") se ejecuta repetidamente. En la evaluación final se aplican 4 repeticiones del núcleo. El autor advierte explícitamente que la coordenada de profundidad (d18) es la coordenada de escalado de la "ladder" experimental y puede diferir del número de bloques Transformer realmente ejecutados, por lo que no debe interpretarse como 18 capas convencionales. La variante se etiqueta como "untied-grow", en referencia a un esquema de pesos no atados combinado con crecimiento de modelo dentro del estudio de exponentes de escalado.

El preentrenamiento se realizó sobre FineWeb-Edu, un corpus filtrado por criterios educativos derivado de web en inglés. No se especifica en la información disponible el número total de tokens vistos, la composición detallada del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones; dado que el modelo se publica como base model, no se declara ninguna alineación posterior. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. El protocolo del paper emplea GPU H100 con FlashAttention-3 y autocast en bfloat16 para la evaluación, aunque los pesos publicados están en FP32 y se indica que son idénticos bit a bit al checkpoint del paper.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en modo modelo base (continuación de texto), sin plantilla de chat ni formato de instrucciones.
- Modelado de lenguaje puro: la métrica principal documentada es la NLL de validación (2,35918326 nats/token) y la NLL de respuesta en CORE (2,21299944 nats/token).
- Evaluación mediante CORE (22 tareas, 91.037 ejemplos, medias sobre las semillas 0, 1 y 2), con una precisión CORE reportada de 0,31181562.
- Capacidad de razonamiento multi-paso únicamente en la medida en que la recursión del núcleo lo permita; no hay evidencia publicada de modos "thinking" ni de cadenas de razonamiento explícitas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte específico para agentes ni para uso multi-turno con roles de sistema/usuario/asistente.
- Multilingüe: no; el modelo está etiquetado únicamente para inglés (`en`).
- Sin capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Investigación sobre leyes de escalado: el checkpoint está pensado para reproducir los experimentos del paper sobre crecimiento de modelo, recursión y operadores de frontera, comparando exponentes de escalado entre variantes de la misma familia.
- Estudio de transformers recursivos: permite medir el efecto de distintas repeticiones del núcleo sobre la NLL, ya que el propio autor separa la coordenada de profundidad del número de bloques ejecutados.
- Evaluación estandarizada con CORE: el script `eval.py` del repositorio del paper permite lanzar una evaluación acotada (`--max-per-task 10`) o el protocolo completo sobre las 22 tareas, útil para verificar la reproducibilidad del checkpoint.
- Baseline académico en inglés: sirve como referencia de modelo base de ~2,5B parámetros entrenado sobre FineWeb-Edu para comparar con arquitecturas convencionales del mismo orden de magnitud.
- Generación de texto de dominio general en inglés: al ser un modelo base, puede usarse para continuación de texto, análisis de perplejidad o generación de corpus sintéticos, siempre con revisión humana posterior.
- Experimentos de eficiencia de parámetros: al reutilizar el núcleo en 4 repeticiones, es un banco de pruebas para estudiar el equilibrio entre parámetros almacenados y cómputo efectivo en inferencia.
- Punto de partida para ajuste fino supervisado: al ser un modelo base sin alineación, es un candidato natural para SFT/DPO posteriores, siempre que se resuelva antes la ambigüedad de licencia.
- Auditoría de sesgos en corpus educativos filtrados: permite analizar qué representaciones aprende un modelo entrenado exclusivamente sobre FineWeb-Edu.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los del paper, medias sobre las semillas 0, 1 y 2 con los 91.037 ejemplos de las 22 tareas de CORE.

| Metrica | Valor |
|---|---|
| Precision CORE (media sobre semillas 0, 1, 2) | 0,31181562 |
| NLL de respuesta en CORE | 2,21299944 nats/token |
| NLL de validación en preentrenamiento | 2,35918326 nats/token |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor señala que la NLL de respuesta en CORE no es directamente comparable con la NLL de validación de preentrenamiento.

## Requisitos de hardware

- Pesos en FP32: 2.525.036.544 parámetros ocupan aproximadamente 10,1 GB (coincide con el tamaño del repositorio, que incluye además `result.json` y `SHA256SUMS`).
- VRAM estimada para inferencia: alrededor de 12-16 GB en FP32 contando pesos, activaciones a contexto 2.048 y sobrecarga del runtime; el dato exacto no está publicado.
- Si se convierte a bfloat16, los pesos bajarían a unos 5,05 GB, pero no se ofrece ningún checkpoint convertido ni se garantiza la equivalencia numérica con el original.
- GPU recomendadas: el paper usa H100 con FlashAttention-3 y autocast en bfloat16. Para inferencia puntual, una RTX 4090 o RTX 3090 (24 GB) debería alojar el modelo en FP32; una GPU de 16 GB queda al límite y probablemente requiera conversión a bf16.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090, RTX 4090) o superiores, con la salvedad de que la implementación no es estándar.
- Opciones de despliegue: no se soportan vLLM, llama.cpp, Ollama ni TGI de forma directa, porque el checkpoint usa la implementación propia `TransformerGPT` y no es un artefacto `AutoModel` de Transformers. El único camino documentado es clonar el repositorio del paper y ejecutar `eval.py`, o portar los tensores manualmente.
- Latencia y throughput estimados: no disponible.
- Nota de reproducibilidad: el repositorio incluye `SHA256SUMS` con el checksum SHA-256 de `final.pt`, pero no se incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este checkpoint.

## Comparativa con modelos similares

La comparación se limita a parámetros, contexto y licencia; no se dispone de resultados de benchmarks de este modelo más allá de CORE, por lo que no se comparan puntuaciones.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-fwe-untied-grow-d18 | 2,53B (FP32) | 2.048 | Base, transformer recursivo | no disponible | HF, requiere código propio |
| Pythia-2.8B | 2,8B | 2.048 | Base | Apache 2.0 | HF, `AutoModel` estándar |
| SmolLM2-1.7B | 1,7B | 8.192 | Base e instruido | Apache 2.0 | HF, `AutoModel` estándar |
| Phi-2 | 2,7B | 2.048 | Base (con ajuste de instrucciones ligero) | MIT | HF, `AutoModel` estándar |
| Gemma-2-2B | 2,6B | 8.192 | Base e instruido | Gemma Terms | HF, `AutoModel` estándar |

Las cifras de parámetros, contexto y licencia de los modelos alternativos se incluyen solo como referencia de categoría; sus resultados de benchmarks no se reproducen aquí. En la misma franja de tamaño, la diferencia principal de loop-fwe-untied-grow-d18 no es el rendimiento sino su naturaleza experimental (recursión y coordenada de profundidad) y la ausencia de licencia y de integración con el ecosistema estándar.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue órdenes ni mantiene un formato de conversación; no debe desplegarse directamente como asistente.
- Sin licencia declarada: no hay permiso explícito de uso comercial ni condiciones de redistribución. Tratarlo como no apto para producción hasta que el autor aclare la licencia.
- Solo inglés: no hay soporte multilingüe ni se ha evaluado en castellano.
- Contexto corto: 2.048 tokens, inferior a los 8.192-32.768 tokens habituales en modelos actuales de tamaño similar.
- Riesgo de alucinación y de contenido sesgado o tóxico propio de un modelo base entrenado sobre web filtrada (FineWeb-Edu) sin RLHF ni filtros de seguridad posteriores.
- No es un artefacto `AutoModel`: no se puede cargar con `from_pretrained` ni usar con herramientas estándar (vLLM, TGI, llama.cpp, Ollama) sin un portado manual de los tensores.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware limitado.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento, solo inferencia y evaluación.
- Los tensores están en FP32: cualquier conversión a bfloat16 o a cuantización introduce cambios numéricos no validados por el autor.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, y la fecha declarada de creación es posterior a la fecha habitual de redacción, lo que refuerza la necesidad de verificar el checksum antes de usarlo.
- La precisión CORE de 0,31181562 es un dato del paper agregado sobre tres semillas y no debe extrapolarse a tareas fuera de ese conjunto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CharlieChen/loop-fwe-untied-grow-d18
- Repositorio de código del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper citado: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha encontrado enlace directo en la información disponible)
- Búsqueda web: no se han encontrado enlaces adicionales relevantes; los resultados devueltos no guardan relación con el modelo.

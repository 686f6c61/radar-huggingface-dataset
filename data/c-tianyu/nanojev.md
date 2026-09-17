# C-Tianyu/NanoJev

## Resumen

NanoJev es un modelo de decisión de tipo "nano" publicado por el usuario C-Tianyu en HuggingFace bajo licencia no especificada. Se presenta como una réplica reducida de Jev: en lugar de generar texto token a token, evalúa un conjunto de estados y preguntas en una única pasada forward del backbone y devuelve distribuciones de probabilidad completas sobre candidatos dinámicos. El backbone es Qwen/Qwen3-0.6B (revisión `c1899de289a04d12100db370d81485cdf75e47ca`) al que se le añaden cabezas de decisión estructuradas.

El modelo resuelve tres tipos de consulta: "choice" (entre 2 y 255 candidatos dinámicos, con una probabilidad por candidato), "boolean" (probabilidad de que una proposición sea verdadera) y "score" (entre 2 y 10 niveles ordenados, con distribución completa y puntuación esperada). La innovación declarada es la ausencia total de decodificación de tokens de salida, lo que permite resolver muchas preguntas en un solo forward batchado: la model card reporta una medición en servicio de 6 estados, 18 preguntas y 44 rutas candidatas resueltas en un único forward del backbone.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos para tareas de decisión y navegación: en lugar de pedir al modelo que "escriba" una etiqueta, se obtiene directamente una distribución normalizada sobre las opciones, apta tanto para selección greedy como para muestreo probabilístico. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su rendimiento solo está documentado en una tarea de navegación en mapa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-0.6B) con cabezas de decisión estructuradas; no es MoE ni SSM |
| Parámetros totales | 0,6 B correspondientes al backbone Qwen3-0.6B; el número exacto de parámetros añadidos por las cabezas de decisión no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el backbone Qwen3-0.6B declara 32 768 tokens de forma nativa, pero NanoJev no especifica la longitud efectiva tras el entrenamiento) |
| Tipos de cuantización | bf16 es la única precisión documentada en los scripts de inferencia (`--precision bf16`); no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`best.safetensors` en la raíz; `stage1/best.safetensors` como checkpoint de inicialización), acompañado de `config.json`, `tokenizer/` y `backbone_config/` |
| Modelo base | Qwen/Qwen3-0.6B |
| Tamaño del repositorio | 4,8 GB |
| Librería | PyTorch |
| Tipo de decisión soportado | choice (2–255 candidatos), boolean y score (2–10 niveles ordenados) |

## Arquitectura y entrenamiento

NanoJev reutiliza el backbone de Qwen3-0.6B y le acopla cabezas de decisión que producen distribuciones de probabilidad sobre conjuntos de candidatos definidos en tiempo de inferencia. La model card no describe la topología interna de esas cabezas, ni si congelan el backbone, ni el esquema de atención o el tipo de normalización empleado. El punto arquitectónico distintivo es que la salida no es una secuencia de tokens: el modelo evalúa las opciones propuestas y devuelve la distribución completa, lo que elimina la fase de decodificación autoregresiva y permite agregar varias preguntas y estados en un solo paso forward.

En cuanto al entrenamiento, el autor publica un pipeline reproducible en el repositorio de GitHub (`research/pipeline_runbook.md`) que cubre la interfaz JSONL de distribuciones objetivo, la generación de datos, el entrenamiento, la evaluación y el servicio. Existe además un checkpoint `stage1/best.safetensors` pensado para inicializar nuevos entrenamientos con `scripts/train_pipeline_decisions.py --init-checkpoint`, con reinicio del optimizador. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO o técnicas similares. El dataset asociado está publicado en `C-Tianyu/NanoJev-Data`. Los hashes SHA256 de ambos checkpoints están declarados en la model card (final: `fff62d14...97c28`; etapa 1: `231b5178...82cec4`).

## Capacidades

- Evaluación de decisiones de tipo "choice" sobre entre 2 y 255 candidatos dinámicos, devolviendo una probabilidad por candidato y permitiendo selección greedy o muestreo probabilístico.
- Evaluación booleana: probabilidad de que una proposición sea verdadera.
- Evaluación de tipo "score": distribución completa sobre entre 2 y 10 niveles ordenados más una puntuación esperada.
- Procesamiento por lotes de múltiples estados y preguntas en un único forward del backbone (medición declarada: 6 estados, 18 preguntas, 44 rutas candidatas, 1 forward).
- Inferencia sin decodificación de tokens de salida, con los consiguientes ahorros de latencia frente a esquemas generativos.
- Servicio persistente: el checkpoint se carga una vez y se reutiliza entre peticiones, con API HTTP (`POST /api/evaluate`) y una interfaz web servida en `http://127.0.0.1:8765`.
- Navegación en entornos de cuadrícula, evaluada como controlador con muestreo probabilístico (T=1).
- Capacidades multilingües limitadas a inglés y chino.
- No se documentan tool calling, function calling, capacidades de agente multi-paso, visión, audio ni modo de razonamiento explícito ("thinking"). Es un modelo de decisión, no un asistente conversacional.

## Casos de uso

- Control de domótica: a partir de un estado textual ("la habitación está a 29 grados, el objetivo son 24 y hay alguien en casa"), el modelo devuelve la distribución sobre acciones como encender el aire acondicionado, encender las luces o no hacer nada, lo que permite escoger la acción de mayor probabilidad o muestrear entre las más plausibles.
- Navegación en robótica móvil: el modelo ha sido evaluado como controlador en mapas de cuadrícula 4×4 y 6×6, devolviendo la probabilidad de cada acción candidata. Es adecuado para bucles de control donde se quiera una política estocástica en lugar de una salida determinista.
- Enrutado de peticiones en pipelines de datos: definir los destinos como candidatos de una pregunta "choice" y usar la distribución resultante para encaminar registros, con umbral de confianza para derivar los casos ambiguos a revisión humana.
- Clasificación ordinal: la pregunta de tipo "score" con 2 a 10 niveles cubre casos como severidad de incidencias, prioridad de tickets o grados de cumplimiento, devolviendo además la puntuación esperada como métrica continua.
- Verificación de proposiciones en pipelines de control: la salida booleana permite construir comprobaciones tipo "¿se cumple esta condición del estado?" con una probabilidad asociada, útil para disparar alertas o ramas condicionales.
- Simulación y agentes basados en modelos de mundo: al devolver distribuciones en lugar de etiquetas, el modelo puede integrarse en búsqueda con árbol, planificación probabilística o aprendizaje por refuerzo como política base.
- Evaluación comparativa de decisiones a escala: al permitir 6 estados y 18 preguntas en un solo forward, resulta apropiado para ejecutar barridos de evaluación sobre muchos escenarios sin incurrir en el coste de generar texto por cada uno.
- Experimentación académica: el checkpoint de la etapa 1 permite reinicializar entrenamientos con la misma arquitectura, útil para estudiar la transferencia del backbone Qwen3-0.6B a tareas de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación es el benchmark de navegación incluido en la model card, con 20 mapas de test y 20 mapas fuera de distribución (OOD), usando el modelo como controlador con muestreo probabilístico T=1.

| Sistema | 4×4 test | 6×6 OOD |
|---|---:|---:|
| NanoJev entrenado | 19/20 — 95 % | 18/20 — 90 % |
| Jev | 20/20 — 100 % | 19/20 — 95 % |
| Qwen3-0.6B original | 7/20 — 35 % | 3/20 — 15 % |

El Qwen3-0.6B original no está ajustado para la tarea; su distribución de acciones se obtiene de la cabeza nativa de modelo de lenguaje, condicionada a los tokens de respuesta A–D ofrecidos. Adicionalmente, la model card reporta una medición de servicio de 6 estados, 18 preguntas y 44 rutas candidatas resueltas en un solo forward del backbone, sin cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un backbone de 0,6 B en bf16, los pesos ocupan aproximadamente 1,2 GB; con activaciones, cabezas de decisión y lote de candidatos, un presupuesto práctico de 2 a 4 GB es razonable, aunque el autor no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. En el extremo profesional, A100 o H100 permitirían lotes mucho mayores, aunque el modelo es pequeño y no los necesita.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier RTX o GTX con 4 GB o más (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090). El repositorio ocupa 4,8 GB en disco, pero eso incluye el checkpoint final y el de la etapa 1, no la VRAM necesaria en ejecución.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estándar. El despliegue previsto es mediante los scripts propios del repositorio: `scripts/predict_toy_decisions.py` para inferencia por lotes, `scripts/serve_decisions.py` para un servicio HTTP persistente, y `scripts/train_pipeline_decisions.py` para reentrenamiento. Requiere un entorno con CUDA y las dependencias de `requirements-toy.txt`.
- Latencia y throughput: no disponibles. La única cifra publicada es el número de elementos procesados por forward (6 estados, 18 preguntas, 44 rutas candidatas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Navegación 4×4 test | Navegación 6×6 OOD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NanoJev | 0,6 B (backbone Qwen3-0.6B) | No disponible | 19/20 (95 %) | 18/20 (90 %) | No disponible | HuggingFace, 0 descargas |
| Jev | No disponible | No disponible | 20/20 (100 %) | 19/20 (95 %) | No disponible | Referenciado como sistema de mayor tamaño del que NanoJev es réplica |
| Qwen3-0.6B original | 0,6 B | 32 768 tokens declarados por el modelo base | 7/20 (35 %) | 3/20 (15 %) | No disponible en esta información | HuggingFace |

No se han identificado en la información proporcionada otros modelos de decisión con distribución completa sobre candidatos dinámicos que permitan una comparación directa de parámetros, contexto o licencia.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Conviene contactar con el autor o revisar el repositorio antes de cualquier despliegue en producción. Nótese que el modelo deriva de Qwen3-0.6B, cuyas condiciones también podrían aplicar.
- Validación muy limitada: 0 descargas y 0 likes en HuggingFace, un único benchmark publicado (navegación en cuadrícula) y ninguna evaluación en tareas de lenguaje general.
- No es un modelo de chat ni de generación de texto: no produce texto libre, por lo que no sirve para diálogo, resumen, redacción ni tareas generativas habituales.
- Idiomas restringidos a inglés y chino; no hay evidencia de comportamiento en castellano.
- Las distribuciones de probabilidad devueltas no están calibradas según ningún estudio publicado; usarlas como medidas de confianza en producción exige validación propia.
- Riesgo de alucinación en el sentido de asignar probabilidad alta a candidatos incorrectos cuando el estado de entrada queda fuera de la distribución de entrenamiento, tal como sugiere la caída de 95 % a 90 % entre test y OOD en su propio benchmark.
- Longitud de contexto efectiva no documentada: aunque el backbone soporte ventanas largas, no se especifica cómo afecta el ajuste con cabezas de decisión ni si se truncaron las entradas durante el entrenamiento.
- Sin soporte documentado en ecosistemas de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue escalable y el uso de cuantizaciones de 4 bits.
- Solo se documenta precisión bf16 en los scripts de inferencia; no hay rutas oficiales para fp16, int8 o int4.
- El repositorio incluye dos checkpoints (final y etapa 1); usar el equivocado como `--checkpoint-dir` daría resultados no representativos del modelo descrito.
- Dependencia de un pipeline de datos propio (formato JSONL de distribuciones objetivo) para reentrenar o adaptar el modelo a un dominio nuevo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/C-Tianyu/NanoJev
- Dataset: https://huggingface.co/datasets/C-Tianyu/NanoJev-Data
- Código fuente: https://github.com/TianyuCodings/NanoJev
- Guía del pipeline (generación de datos, entrenamiento, evaluación y servicio): https://github.com/TianyuCodings/NanoJev/blob/main/research/pipeline_runbook.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B

Nota: las búsquedas web realizadas no devolvieron resultados relacionados con NanoJev, Qwen3-0.6B ni modelos de decisión; los resultados obtenidos correspondían a páginas sobre la región francesa de Hauts-de-France, la ciudad de Amiens y una parrilla de televisión, por lo que no se incluyen como fuentes.

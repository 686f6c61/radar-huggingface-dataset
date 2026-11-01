# itsalissonsilva/Restriction-Learning-Experiment

## Resumen

Restriction-Learning-Experiment es un adaptador LoRA de investigación publicado por itsalissonsilva sobre el modelo base google/gemma-3-1b-it. No es un modelo generalista ni un producto: es un artefacto experimental diseñado para estudiar si un modelo de lenguaje puede aprender a retener selectivamente valores marcados como privados en un espacio de trabajo sintético, al mismo tiempo que sigue respondiendo a peticiones permitidas bajo una política explícita. El adaptador se usa como sustrato reproducible en tres demos públicas del autor: LoRA-Forensics, Neural-Steering-Lab y Circuit-Scope.

El modelo resuelve una pregunta acotada de interpretabilidad y alineamiento: ¿distingue el modelo entre información restringida y solicitudes legítimas, o simplemente aprende a negarse de forma indiscriminada? Para responderla, el autor entrena también un adaptador de control de rechazo total (blanket-refusal) y un adaptador aleatorio emparejado, y evalúa los tres sobre 96 peticiones fijas derivadas de 12 espacios de trabajo no vistos en entrenamiento. Los resultados muestran que el adaptador selectivo mejora las comprobaciones automáticas de 28/96 a 75/96, pero introduce tres divulgaciones indirectas nuevas y falla en la mayoría de casos ambiguos.

La relevancia es metodológica más que de producto: el repositorio incluye pesos, datos sintéticos, código de entrenamiento, análisis de capas y fuerzas, capturas de patching causal corregidas y resultados de restauración por lotes. Todo ello con revisiones fijas del modelo base, lo que permite reproducir experimentos de steering y de circuitos sin depender de un adaptador privado. La licencia es la de Gemma, no una licencia permisiva genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre transformer decoder-only (Gemma 3 1B instruct); módulos Q y V |
| Parametros totales | No disponible (adaptador LoRA; el modelo base google/gemma-3-1b-it tiene 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | No disponible; evaluación registrada en bfloat16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado a las proyecciones Q y V del modelo base google/gemma-3-1b-it, revisión `dcc83ea841ab6100d6b47a070329e1ba4cf78752`. El entrenamiento usó dos épocas fijas, una sola semilla y 784 ejemplos generados a partir de 112 espacios de trabajo sintéticos multiplicados por siete tipos de petición. El adaptador selectivo y el de rechazo total parten de la misma inicialización, lo que permite atribuir las diferencias de comportamiento al objetivo de entrenamiento y no a variaciones de arranque. Los ejemplos de desarrollo no se usaron y el calendario de épocas no se seleccionó sobre el conjunto de test.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: se incluye un adaptador de rechazo indiscriminado como control negativo, un adaptador aleatorio emparejado por semilla y normas de Frobenius de los deltas por módulo, y un conjunto de test fijo de 96 peticiones (84 casos de política de 12 espacios no vistos, ocho volteos de etiquetas públicas y cuatro preguntas no relacionadas). El repositorio aporta además análisis de cinco intensidades de steering, 26 eliminaciones de capa única, 27 comparaciones de estados ocultos, 52 espectros de módulos y una captura corregida de patching causal generativo con 208/208 autorrestauraciones exactas. Las filas antiguas de patching en `interpretability/results.json` quedan explícitamente invalidadas.

## Capacidades

- Generación de texto en inglés sobre el modelo base Gemma 3 1B instruct.
- Seguimiento de instrucciones bajo una política explícita de restricción de acceso a valores privados sintéticos.
- Retención selectiva: el adaptador selectivo retiene valores marcados como privados en la mayoría de los casos de política evaluados (75/96 comprobaciones automáticas exactas).
- Asistencia permitida: responde a peticiones legítimas dentro del mismo espacio de trabajo (39/48 comprobaciones de asistencia permitida).
- Salida en formato JSON-like para acciones estructuradas, aunque el helper no garantiza JSON válido ni toma decisiones de autorización.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: modo de análisis de capas, steering y patching causal para interpretabilidad; no hay visión ni audio en el adaptador.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el adaptador sirve como sustrato reproducible para estudiar qué capas y direcciones de activación codifican la retención de información restringida, gracias a los análisis de eliminación de capa y espectros de módulos incluidos.
- Reproducción de experimentos de steering: Neural-Steering-Lab y Circuit-Scope usan estos pesos públicos para que terceros puedan repetir mediciones de intensidad y capa sin acceso a un adaptador privado.
- Auditoría de alineamiento y sobre-rechazo: el adaptador de rechazo total incluido en `blanket/` permite comparar curvas de utilidad frente a divulgación y demostrar por qué minimizar divulgaciones no es un objetivo suficiente.
- Docencia y formación en seguridad de LLM: el conjunto fijo de 96 peticiones y las comprobaciones automáticas (literales, invertidas, base64 y con espacios normalizados) constituyen un banco de pruebas didáctico y acotado.
- Validación de pipelines de evaluación de privacidad: investigadores pueden usar `restriction_results.json` y el helper `restriction.py` para verificar que sus propias métricas de fuga detectan las mismas divulgaciones indirectas.
- Estudio de sensibilidad a la composición de lote: el repositorio documenta que la captura entre lotes coincidió en 13/14 salidas crudas y la restauración por lote emparejado en 14/14, un caso práctico para analizar no determinismo en inferencia.
- Prototipado de políticas de acceso sintéticas: con espacios de trabajo y valores ficticios, se puede experimentar con formatos de tabla y JSON para probar generalización limitada de plantillas, sin implicaciones de privacidad real.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 96 peticiones fijas (84 casos de política de 12 espacios no vistos, ocho volteos de etiqueta y cuatro preguntas no relacionadas):

| Condición | Comprobaciones exactas superadas | Asistencia permitida | Divulgaciones |
|---|---:|---:|---:|
| Gemma base | 28/96 | 28/48 | 4 |
| Adaptador selectivo (pesos raíz) | 75/96 | 39/48 | 3 |
| Adaptador de rechazo total | 36/96 | 0/48 | 0 |
| Adaptador aleatorio emparejado | 25/96 | 25/48 | 4 |

Desglose adicional del adaptador selectivo: 3/12 en casos de ambigüedad o aclaración y 3/4 en preguntas no relacionadas, frente a 4/4 del modelo base en estas últimas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste mínimo sobre el modelo base de 1B; en bfloat16 el modelo base ocupa aproximadamente 2 GB de pesos, por lo que la inferencia completa cabe holgadamente en 4-6 GB de VRAM según longitud de contexto y lote.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; el autor registró evaluaciones en GPU con bfloat16. Para reproducir paridad exacta se requiere la misma configuración de lote y atención.
- GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4070 y superiores; también en CPU en float32, aunque el autor advierte que esa configuración difiere de las mediciones registradas en GPU.
- Opciones de despliegue: PEFT 0.17.1 con Transformers 4.57.1 y Accelerate 1.10.1; el helper `restriction.py` carga el adaptador mediante `hf_hub_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Restriction-Learning-Experiment (este) | LoRA sobre 1B | No disponible | Retención selectiva sintética e interpretabilidad | Gemma | Pesos públicos en HF |
| google/gemma-3-1b-it (base) | 1B | No disponible | Modelo instruct generalista | Gemma | Pesos públicos en HF |
| Adaptador blanket-refusal (control del mismo repo) | LoRA sobre 1B | No disponible | Rechazo indiscriminado | Gemma | Incluido en `blanket/` |
| Adaptador aleatorio emparejado (control del mismo repo) | LoRA sobre 1B | No disponible | Control por semilla y normas de Frobenius | Gemma | Reconstruible desde el código |

No se dispone de comparación con adaptadores de privacidad o seguridad de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un sistema real de control de acceso, ni una garantía de privacidad, ni un modelo de seguridad general; el propio autor lo advierte explícitamente.
- El adaptador selectivo introduce tres divulgaciones indirectas en casos donde el modelo base no divulgada; el menor recuento total de divulgaciones no implica que se hayan corregido todos los fallos del base.
- Solo supera 3/12 casos de ambigüedad o aclaración y 3/4 preguntas no relacionadas, frente a 4/4 del base en estas últimas: existen regresiones específicas junto a las mejoras.
- Las comprobaciones de divulgación cubren canarios sintéticos literales, invertidos, en base64 y con espacios normalizados, pero son proxies automáticos finitos, no evaluaciones humanas de utilidad ni una evaluación exhaustiva de ataques.
- Los datos de entrenamiento y evaluación son sintéticos; no se establece transferencia a omisión de políticas, otros idiomas, documentos reales, hechos privados arbitrarios ni herramientas.
- Solo inglés; no hay soporte multilingüe.
- El helper devuelve texto generado con formato JSON-like, no una acción válida garantizada ni una decisión de autorización; rechaza entradas demasiado largas en lugar de truncar la política.
- La licencia Gemma impone términos de acceso y uso comercial definidos por Google; es necesario aceptar las condiciones del modelo base y autenticarse.
- El análisis de capas y fuerzas es descriptivo sobre datos de test ya abiertos, sin significación estadística ni afirmación de circuito completo; las actualizaciones grandes de pesos o la deriva de representación no establecen causalidad por sí solas.
- Las filas de patching en `interpretability/results.json` están superadas y no deben usarse como evidencia válida; solo `interpretability_patchfix/patching.json` es la captura corregida.
- La captura original entre lotes mostró sensibilidad a la composición de lote (13/14 coincidencias crudas), relevante para reproducibilidad en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsalissonsilva/Restriction-Learning-Experiment
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Demo LoRA-Forensics: https://huggingface.co/spaces/itsalissonsilva/LoRA-Forensics
- Demo Neural-Steering-Lab: https://huggingface.co/spaces/itsalissonsilva/Neural-Steering-Lab
- Demo Circuit-Scope: https://huggingface.co/spaces/itsalissonsilva/Circuit-Scope
- Inspiración metodológica (ROME / CounterFact): https://rome.baulab.info/

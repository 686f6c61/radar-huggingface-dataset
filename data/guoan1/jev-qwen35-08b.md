# guoan1/jev-qwen35-08b

## Resumen

jev-qwen35-08b (también referido como jev08) es un adaptador LoRA de tipo *decision model* desarrollado por el usuario guoan1 sobre el modelo base Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo: se trata de un *System One decision model* que funciona únicamente en fase de prefill, nunca produce texto libre y se limita a puntuar cada respuesta candidata con una cabeza escalar situada sobre el último token del prompt. El resultado son probabilidades tipadas y calibradas por temperatura para tres tipos de pregunta: `choice` (selección única), `score` (niveles ordinales) y `noul` (binario sí/no).

El modelo aborda un problema concreto: convertir un backbone pequeño congelado en un clasificador de decisiones calibrado, con un espacio de salida fijado en tiempo de compilación de la petición. Sobre el backbone de 0,8B parámetros se aplica un LoRA de rango 8 sobre los módulos de proyección de atención y DeltaNet, más una cabeza lineal `Linear(hidden→1)` inicializada en la dirección "Yes" menos "No" del modelo base y mantenida en fp32. La innovación principal es el binomio decisión + calibración: frente a un 45,86 % de exactitud dura del baseline sin ajustar en `baseline_test`, el adaptador entrenado alcanza un 93,97 % con un ECE de 0,0310, y tras calibración mantiene el 93,97 % bajando el ECE a 0,0281.

Es relevante ahora porque demuestra que un modelo de menos de mil millones de parámetros puede usarse como componente de decisión calibrado dentro de pipelines mayores, sin generar texto y con validación dura de la salida. El repositorio, de 0,0 GB y publicado el 24 de septiembre de 2026, incluye un paquete de inferencia mínimo (`jev08/`) con funciones de compilación de petición, predicción y formateo de respuesta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención + módulos DeltaNet) del backbone Qwen3.5-0.8B-Base congelado, con adaptador LoRA r=8 y cabeza escalar de decisión |
| Parametros totales | 0,8B en el modelo base; el adaptador añade LoRA r=8 sobre proyecciones de atención/DeltaNet más una cabeza `Linear(hidden→1)` (recuento exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 768 tokens (`max_length=768`, sin truncado silencioso en la plantilla de decisión); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería `peft` |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone Qwen/Qwen3.5-0.8B-Base congelado al que se superpone un adaptador LoRA de rango 8 (α=2r, dropout 0) sobre los módulos de proyección de atención y DeltaNet. La decisión se materializa mediante una cabeza escalar `Linear(hidden→1)` inicializada con la resta de los vectores `W_lm["Yes"] − W_lm["No"]` (la dirección "sí" preentrenada) y mantenida en fp32. Los candidatos se renderizan como prompts de juicio Yes/No independientes, con una plantilla byte a byte idéntica a la de Open-Jev; cada pregunta requiere un único forward batcheado, la lectura se hace en el último token no de relleno y la longitud máxima es 768 tokens sin truncado silencioso. La temperatura escalar final es T=1,9190, ajustada únicamente sobre 512 filas de calibración minimizando la NLL y congelada para toda la evaluación.

El entrenamiento se realizó sobre el dataset ZefanCai/Open-Jev, split `release-v2-redistributable` (CC0), durante 19.779 pasos de optimizador con AdamW (lr 5e-5 para el LoRA y 1e-4 para la cabeza), función de pérdida de entropía cruzada con etiquetas suaves más 0,1·Brier, acumulación de gradiente 4 y semilla 42, con un tiempo de reloj aproximado de 4,6 horas. La model card advierte explícitamente de que se trata de una semilla única y de que no constituye una reproducción oficial de Open-Jev; además, la latencia reportada incluye la tokenización y las métricas OOD sintéticas miden transferencia de plantilla y entidad, no conocimiento del mundo.

## Capacidades

- Puntuación de decisiones: asigna una probabilidad escalar calibrada a cada respuesta candidata en lugar de generar texto.
- Tres tipos de pregunta soportados: `choice` (selección única), `score` (niveles ordinales) y `noul` (binario sí/no).
- Salida tipada y validada: el espacio de salida se fija al compilar la petición y las probabilidades se validan de forma dura (finitas, en [0,1], suman 1).
- Calibración por temperatura: probabilidades ajustadas con un único escalar T=1,9190 congelado para evaluación.
- Inferencia por prefill: un solo forward batcheado por pregunta, con lectura en el último token no de relleno.
- Integración por lotes: soporta múltiples candidatos por pregunta en una misma pasada batcheada.
- No dispone de generación de texto libre, tool calling, capacidades de agente ni multimodalidad.

## Casos de uso

- Enrutado de decisiones en pipelines: dado un estado y una pregunta de tipo `choice`, el modelo devuelve la probabilidad de cada opción para que un sistema mayor seleccione la rama de ejecución, sin generar texto intermedio.
- Clasificación con umbral calibrado: en flujos de tipo `noul` (sí/no), el ECE bajo (0,0281 en `calibrated_test`) permite fijar umbrales de decisión con confianza cuantificable.
- Puntuación ordinal de calidad: con preguntas de tipo `score`, se pueden ordenar respuestas o resultados en niveles ordinales dentro de un sistema de evaluación automática.
- Filtrado previo a un modelo grande: usar jev08 como primera etapa barata que descarta o prioriza candidatos antes de invocar un LLM mayor, reduciendo coste de inferencia.
- Componente de decisión en entornos con presupuesto de cómputo: al operar sobre un backbone de 0,8B en modo prefill, es apto para despliegues con GPU modesta o incluso CPU.
- Validación de pipelines de decisión: su naturaleza determinista y su espacio de salida fijo lo hacen útil como componente verificable en sistemas donde no se admite texto libre no controlado.
- Evaluación de transferencia de plantilla: con las métricas OOD (`trained_ood` 84,94 % de exactitud dura), sirve para estudiar cómo se comporta un clasificador de decisión ante variaciones de plantilla y entidad.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (conjuntos retenidos, nunca usados para entrenamiento ni calibración):

| split | hard acc | ECE | Brier | NLL |
|---|---|---|---|---|
| baseline_test | 45,86 % | 0,1263 | 0,5843 | 1,0063 |
| trained_test | 93,97 % | 0,0310 | 0,0938 | 0,2404 |
| calibrated_test | 93,97 % | 0,0281 | 0,0945 | 0,2061 |
| baseline_ood | 53,96 % | 0,0953 | 0,5501 | 0,9780 |
| trained_ood | 84,94 % | 0,1238 | 0,2737 | 1,5287 |
| calibrated_ood | 84,94 % | 0,1078 | 0,2641 | 0,8477 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma publicada; al operar sobre un backbone de 0,8B, las estimaciones habituales en fp16 rondan 1,6-2 GB solo para los pesos del modelo base, más el adaptador LoRA y la cabeza (valores orientativos, no confirmados por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del backbone, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente (estimación, no dato del autor).
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño de 0,8B del modelo base (estimación, no confirmada explícitamente).
- Opciones de despliegue: el repositorio incluye un paquete de inferencia mínimo `jev08/` con `predict`, `DecisionModel`, `compile_request`, `format_response` y `softmax`; requiere acceso al modelo base y a la librería `peft`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La model card indica únicamente que la latencia reportada incluye la tokenización, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-qwen35-08b (este) | 0,8B base + LoRA r=8 | 768 tokens en plantilla de decisión | hard acc 93,97 % (calibrated_test), ECE 0,0281 | apache-2.0 | HuggingFace, adaptador PEFT |
| Qwen/Qwen3.5-0.8B-Base (baseline sin ajustar) | 0,8B | no disponible | hard acc 45,86 %, ECE 0,1263 (baseline_test) | apache-2.0 | HuggingFace |
| Open-Jev (referencia de plantilla) | no disponible | no disponible | no disponible | no disponible | GitHub / HuggingFace |

No se dispone de datos de otros adaptadores de decisión directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Ajuste no oficial: es un fine-tune comunitario no afiliado a Alibaba/Qwen ni a los autores de Open-Jev.
- Pesos base no redistribuidos: es necesario cargar Qwen/Qwen3.5-0.8B-Base (revisión `dc7cdfe2ee4154fa7e30f5b51ca41bfa40174e68`) de forma independiente.
- Semilla única: el entrenamiento usó solo la semilla 42, por lo que no hay estimación de varianza entre ejecuciones.
- Métricas OOD sintéticas: las pruebas OOD miden transferencia de plantilla y entidad, no conocimiento del mundo; su ECE empeora notablemente (0,1078 en `calibrated_ood` frente a 0,0281 en `calibrated_test`).
- Sin generación de texto: el modelo no produce lenguaje libre; el espacio de salida se fija al compilar la petición.
- Idiomas soportados no disponibles: no se especifica cobertura lingüística.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las probabilidades calibradas pueden degradarse fuera de la distribución de entrenamiento (véase la caída de exactitud en OOD).
- Limitación de longitud: `max_length=768` en la plantilla de decisión; contextos más largos quedan fuera del alcance del adaptador.
- Uso comercial: la licencia del adaptador y del modelo base es apache-2.0; el código portado de Open-Jev es MIT y los datos de entrenamiento son CC0 (sin filas redistribuidas). Conviene revisar `LICENSE-NOTICES` antes de un despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/guoan1/jev-qwen35-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Repositorio Open-Jev: https://github.com/Zefan-Cai/Open-Jev

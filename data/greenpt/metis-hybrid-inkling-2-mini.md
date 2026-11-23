# GreenPT/metis-hybrid-inkling-2-mini

## Resumen

Metis Hybrid Inkling 2 Mini es un adaptador LoRA (más una cabeza de decisión y un calibrador) publicado por GreenPT sobre el modelo base `thinkingmachines/Inkling-2-Mini` de Thinking Machines Lab. No es un modelo de lenguaje generalista, sino un modelo de decisión ("decision-model") especializado en responder peticiones del endpoint `/v1/systemone` de TypeSafe Jev con probabilidades calibradas, manteniendo además capacidad de chat. El repositorio ocupa 0,1 GB porque solo contiene los pesos entrenados (15,2M de parámetros con la cabeza), no el backbone congelado.

El modelo base Inkling 2 Mini tiene 26,4B parámetros almacenados y aproximadamente 3,4B activos por token (arquitectura MoE), y en este adaptador se cargan únicamente las partes de texto: visión y audio quedan fuera. La innovación principal es la combinación de un adaptador de rango 16 sobre las proyecciones de atención y las compuertas de mensaje, una cabeza de decisión tipo pointer y un calibrador por entrada (`calibrator.pt`) que ajusta la confianza declarada a la precisión real.

Es relevante porque aborda un problema concreto y medible: la calibración de probabilidades en decisiones binarias o de opción múltiple. Según la model card, alcanza un ECE (Expected Calibration Error) de 0,096 en la capa difícil de JevBench sin el "floor" de verdadero/falso, frente a 0,143 sin calibración, y mantiene un rendimiento de 203 aciertos sobre 231 ítems públicos, competitivo con modelos de mayor tamaño como Qwen 27B (205).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (modelo base Inkling 2 Mini) con adaptador LoRA r=16, cabeza de decisión pointer y calibrador por entrada |
| Parametros totales | 26,4B en el backbone; 15,2M entrenados en el adaptador (incluida la cabeza) |
| Parametros activos | ~3,4B por token (backbone MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos del experto en NVFP4 / MXFP8 en el checkpoint original; el código de carga los convierte a bf16 (~53 GB) |
| Idiomas soportados | no disponible |
| Licencia | other (`mixed-see-card`); consultar la model card para los términos exactos |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `calibrator.pt` + `decision_config.json` |

## Arquitectura y entrenamiento

El backbone es un transformer con mezcla de expertos (MoE) de 26,4B parámetros almacenados y ~3,4B activos por token, del que solo se carga la torre de texto (`Inkling2LoopForCausalLM`) en bf16. Sobre el backbone congelado se aplica un adaptador LoRA de rango 16 (15,2M pesos con la cabeza) situado en las proyecciones de atención y en las compuertas de mensaje; los pesos de los expertos enrutados no se tocan. Sobre esa base se añade una cabeza de decisión tipo pointer, filas entrenadas para tokens especiales y un calibrador de temperatura por entrada (`calibrator.pt`). Los prompts usan la plantilla de chat del Hub con el razonamiento desactivado (`reasoning_effort="none"`).

El entrenamiento se hizo en dos etapas sobre una única H200. La etapa 1 usó la mezcla completa de Metis Hybrid ronda 2 para este backbone: 137.039 filas y 26,3M tokens, con 13 tareas públicas reescritas como preguntas Jev, tareas sintéticas estilo Jev, filas de explicación y respuestas de chat-replay generadas por el propio Inkling 2 Mini; 2 épocas, 4.336 pasos, unos 350 minutos. La etapa 2 partió de la etapa 1 con 42.596 filas (10,7M tokens), 900 pasos, 1 época, LR 5e-5 (cabeza 2,5e-4) y 78 minutos, combinando tareas difíciles construidas por código con una repetición de la mezcla de la etapa 1. El calibrador se ajustó por entrada con temperatura T = 1,15 como referencia en `decision_config.json`.

## Capacidades

- Respuesta a peticiones Jev `/v1/systemone` con probabilidades calibradas (ruta `systemone`).
- Modo `both`: devuelve la respuesta calibrada más una explicación en lenguaje natural por cada respuesta.
- Modo `text`: funciona como modelo de lenguaje conversacional sobre el backbone Inkling 2 Mini.
- Cabeza de decisión pointer para seleccionar opciones o emitir juicios binarios/true-false.
- Calibración por entrada mediante `calibrator.pt`, con opción de "floor" de verdadero/falso y temperatura ajustable.
- Soporte de chat multi-turno a través de la plantilla de chat del Hub.
- No carga las torres de visión ni de audio del modelo base.
- Compatibilidad con el ecosistema PEFT (`peft==0.19.1`) y con la build de transformers del PR 51050 de Hugging Face.

## Casos de uso

- Enrutamiento y decisión automatizada en pipelines Jev: el modelo responde peticiones `/v1/systemone` con probabilidades calibradas, lo que permite fijar umbrales de confianza fiables en lugar de depender de logits sin calibrar.
- Verificación de hechos binaria (true/false): con el calibrador y el floor, el 74% de los ítems difíciles de JevBench se cuentan como correctos, útil para sistemas de control de calidad que necesitan una señal de confianza explícita.
- Clasificación con abstención: al disponer de ECE de 0,096 sin floor, se pueden descartar respuestas por debajo de un umbral de probabilidad y derivar a revisión humana.
- Asistente conversacional especializado: la ruta `text` permite reutilizar el mismo despliegue como chat sobre el backbone Inkling 2 Mini sin cargar un segundo modelo.
- Generación de explicaciones auditables: el modo `both` produce una justificación por respuesta, adecuado para entornos donde se exige trazabilidad de la decisión.
- Evaluación de calibración de modelos: sirve como referencia reproducible (JevBench público, ECE por bins) para comparar otros modelos de decisión con el mismo protocolo.
- Investigación sobre adaptadores eficientes: con solo 15,2M parámetros entrenados sobre un backbone de 26,4B, es un caso de estudio de ajuste paramétricamente eficiente para tareas de decisión.

## Benchmarks y rendimiento

Datos de la model card (JevBench público, ítems a la derecha de 231; ECE en 10 bins, menor es mejor):

| Metrica | Qwen 4B | Qwen 27B | Ministral 3 8B | Apertus 1.5 8B | Olala mini | Metis Hybrid Inkling 2 Mini |
|---|---|---|---|---|---|---|
| JevBench público (aciertos) | 195 | 205 | 196 | 183 | 169 | 203 |
| Original 72 / easy 48 / hard 111 | 69 / 48 / 78 | 70 / 48 / 87 | 72 / 48 / 76 | 67 / 48 / 68 | 59 / 48 / 62 | 70 / 48 / 85 |
| ECE hard tal como se sirve (calibrador + floor) | 0,099 | 0,093 | 0,099 | 0,113 | 0,142 | 0,138 |
| ECE hard sin floor | — | — | 0,103 | 0,081 | 0,112 | 0,096 |
| Dev generado (construido por código) | 81,6% | 88,9% | 82,4% | 76,9% | 72,1% | 81,3% |

Desglose de ECE en la capa difícil según configuración de calibración:

| Calibracion | ECE hard |
|---|---|
| Ninguna | 0,143 |
| Solo temperatura ajustada (T = 1,15) | 0,127 |
| `calibrator.pt` sin floor | 0,096 |
| `calibrator.pt` con floor (por defecto) | 0,138 |

En las muestras de evaluación del propio job de entrenamiento: 91,2% in-domain (13 tareas públicas) y 77,8% held-out (PIQA, ANLI, WinoGrande). El umbral del proyecto es 0,10: se cumple sin floor (0,096) y no se cumple tal como se sirve (0,138).

## Requisitos de hardware

- VRAM estimada: ~53 GB en bf16 al convertir los pesos NVFP4/MXFP8 del checkpoint a coma flotante; se recomienda GPU de 80 GB o superior (el autor usó una H200).
- GPU recomendadas: H200, H100 80 GB, A100 80 GB.
- No cabe en GPU de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en la configuración bf16 documentada.
- Despliegue: servidor FastAPI incluido (`scripts/serve.py`, endpoint `POST /v1/systemone` en el puerto 8000) o uso programático vía `integrated_decisions_v2.DecisionLM`; requiere `peft==0.19.1`, `safetensors`, `huggingface_hub`, `fastapi`, `uvicorn` y la build de transformers del commit `a10ebc3c1c44b01d0ee825d48b8d0de3253e4539` (PR 51050).
- Latencia y throughput: ~0,25 s por ítem de decisión en una H200 con transformers; generación de texto por prompt individual lenta (~40 s por explicación en la comprobación del job de entrenamiento); generación por lotes a 110–150 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench hard (aciertos) | ECE hard sin floor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Metis Hybrid Inkling 2 Mini | 26,4B (3,4B activos) + 15,2M adaptador | no disponible | 85 | 0,096 | other (`mixed-see-card`) | Hugging Face (adaptador PEFT) |
| Qwen 27B | 27B | no disponible | 87 | no medido | no disponible en la información | Hugging Face |
| Ministral 3 8B | 8B | no disponible | 76 | 0,103 | no disponible en la información | Hugging Face |
| Apertus 1.5 8B | 8B | no disponible | 68 | 0,081 | no disponible en la información | Hugging Face |
| Olala mini | no disponible | no disponible | 62 | 0,112 | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- El modelo tal como se sirve (con floor) incumple el umbral de calibración del proyecto: ECE hard de 0,138 frente al objetivo de 0,10; solo lo cumple desactivando el floor (0,096).
- El floor de verdadero/falso altera las respuestas dubitativas a 0,8 o 0,2 para que JevBench v1.6 las contabilice; esto puede inflar artificialmente la tasa de acierto en ítems binarios (74% frente a 58% sin floor).
- Requiere una build no publicada de transformers (PR 51050 fijada a un commit concreto) y `peft==0.19.1`; la compatibilidad futura no está garantizada.
- Consumo de memoria elevado (~53 GB en bf16) que excluye GPU de consumo y complica el despliegue en producción a pequeña escala.
- La generación de explicaciones una a una es lenta (~40 s por explicación), lo que limita su uso interactivo.
- No carga las capacidades de visión ni audio del modelo base Inkling 2 Mini.
- No se declaran idiomas soportados ni sesgos conocidos en la información disponible; el entrenamiento se apoya en tareas JevBench y datos sintéticos, con posible sobreajuste al formato Jev.
- Licencia `other` con nombre `mixed-see-card`: es imprescindible revisar la model card y la licencia del modelo base antes de cualquier uso comercial.
- Trabajo independiente no afiliado a Thinking Machines Lab ni a TypeSafe; "Inkling" es una marca de Thinking Machines Lab.
- Riesgo de alucinación en la ruta `text` y en las explicaciones del modo `both`, no evaluado con métricas específicas en la información disponible.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/GreenPT/metis-hybrid-inkling-2-mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Adaptador relacionado (misma receta): https://huggingface.co/GreenPT/metis-hybrid-4b
- PR de transformers con soporte Inkling 2 Mini: https://github.com/huggingface/transformers/pull/51050
- GreenPT (sitio principal): https://greenpt.com/
- GreenPT (versión EE. UU.): https://greenpt.com/us
- GreenPT Chat: https://greenpt.com/chat
- Presentación de GreenPT: https://presentation.greenpt.eu/

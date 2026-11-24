# GeMri98/hvac-minimind-fdd-v14

## Resumen

HVAC fault finder v14 (GEOSTACK) es un modelo de lenguaje especializado en la detección y clasificación de fallos en sistemas HVAC (calefacción, ventilación y aire acondicionado) a partir de registros de tendencias de edificios. Lo desarrolla GeMri98 y se construye desde cero sobre la arquitectura MiniMind (768 dimensiones ocultas, 8 capas, 63,9 millones de parámetros), entrenada con pesos aleatorios mediante los scripts de preentrenamiento y SFT del propio proyecto MiniMind. El modelo lee un día laborable de logs de tendencias y, en sus variantes con gemelo digital, los residuos del gemelo expresados como z-scores, y responde con tres campos: `Fault`, `Severity` y `Action`.

El interés del modelo es metodológico más que de producto: es un estudio controlado sobre si el preentrenamiento de dominio y la incorporación de residuos de un gemelo digital mejoran el rendimiento frente al SFT directo desde pesos aleatorios. Los datos provienen de 160 ejecuciones de EnergyPlus 24.2 sobre una oficina de 5 zonas con modelos nativos de fallo (offset de termostato, ensuciamiento de batería, offset de sensor de agua fría, ensuciamiento de filtro y offset de sensor de economizador, en 3 severidades y con sensores ruidosos y pérdidas de datos). Los meses de entrenamiento son [4, 5, 6, 8] (2816 días, con una segunda repetición con jitter) y los de test [7, 9] (672 días nunca vistos).

Es relevante ahora porque cuantifica con intervalos de confianza el valor real de los residuos del gemelo digital: la diferencia pareada en "fallo + severidad correctos" entre la variante con gemelo (B1) y la que solo usa el log bruto (B2) es de +11,8 puntos [+8,0, +15,5], mientras que el preentrenamiento de dominio aporta solo +1,6 puntos [-2,2, +5,5]. Además, un gradient boosting sobre los mismos residuos supera al LLM en 6,8 puntos, lo que sitúa al modelo como especialista de tarea, no como sustituto de un clasificador tabular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MiniMind, commit `858008e`), 8 capas, hidden size 768 |
| Parametros totales | 63,9 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp16) |
| Idiomas soportados | no disponible (el modelo es un especialista de tarea; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (state dict nativo de MiniMind, fp16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo MiniMind con 768 dimensiones ocultas y 8 capas, 63,9 millones de parámetros en total, entrenado desde pesos aleatorios con los scripts de preentrenamiento y SFT del repositorio MiniMind (commit `858008e`). No se trata de un ajuste fino de un modelo preexistente: el punto de partida es ruido, lo que convierte el experimento en una prueba limpia de cuánto conocimiento de dominio puede inyectarse en un modelo de este tamaño.

El corpus de entrenamiento son 160 ejecuciones de EnergyPlus 24.2 sobre una oficina de 5 zonas con modelos nativos de fallo (offset de termostato, ensuciamiento de batería, offset de sensor de agua fría, ensuciamiento de filtro y offset de sensor de economizador, cada uno en 3 severidades, con ruido de sensor y pérdidas de datos). Los meses [4, 5, 6, 8] (2816 días, con una segunda repetición con jitter) se usan para entrenamiento y los meses [7, 9] (672 días) se reservan para test, sin uso en entrenamiento ni preentrenamiento. Se entrenan cuatro brazos: **A** (SFT desde pesos aleatorios con log y residuos del gemelo), **B1** (preentrenamiento de dominio sobre logs sin etiquetar y residuos de los meses de entrenamiento durante 20 épocas, seguido de SFT con log y residuos del gemelo), **B2** (mismo preentrenamiento, SFT solo con el log bruto, para aislar el efecto del gemelo) y un **gradient boosting** sobre los mismos residuos como referencia no-LLM. El gemelo digital utilizado es la versión v12.

## Capacidades

- Clasificación de fallos HVAC a partir de un día laborable de logs de tendencias de edificio, con salida estructurada en tres campos: `Fault`, `Severity` y `Action`.
- Detección de cinco tipos de fallo simulados: offset de termostato, ensuciamiento de batería, offset de sensor de agua fría, ensuciamiento de filtro y offset de sensor de economizador.
- Clasificación de severidad en tres niveles por tipo de fallo.
- Integración de residuos de gemelo digital como z-scores en las variantes B1 y A, lo que aporta +11,8 puntos de acierto conjunto fallo+severidad frente al log bruto (B1 frente a B2).
- Generación de una acción recomendada (`Action`) como parte de la respuesta, orientada a la operación del edificio.
- Tasa de parseo del 100 % en todos los brazos evaluados, es decir, la salida siempre es interpretable en el formato esperado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un especialista de tarea sin conocimiento general.

## Casos de uso

- **Detección de fallos en plantas enfriadoras y baterías de agua fría**: el modelo recibe un día de logs de tendencias de las 5 zonas y devuelve el fallo probable con severidad y acción; es adecuado porque ha sido entrenado específicamente sobre los patrones de offset de sensor de agua fría y ensuciamiento de batería generados por EnergyPlus.
- **Mantenimiento predictivo en edificios terciarios**: integrado en un pipeline nocturno que procesa los logs del día anterior, el modelo emite una etiqueta de fallo y severidad que alimenta el sistema de órdenes de trabajo; su tasa de parseo del 100 % simplifica la automatización.
- **Triaje de alarmas con gemelo digital**: desplegado junto al gemelo v12, el modelo consume los residuos en z-scores y reduce los falsos positivos operativos, ya que la variante con gemelo mejora el acierto conjunto fallo+severidad en 11,8 puntos frente a usar solo el log.
- **Validación de estrategias de control y secuencias de economizador**: permite comprobar si un cambio en la lógica de control introduce patrones compatibles con un fallo de sensor de economizador antes de desplegarlo en el edificio real.
- **Generación de etiquetas sintéticas para entrenar clasificadores ligeros**: las respuestas del modelo sobre logs simulados pueden usarse como preetiquetado para entrenar modelos tabulares o reglas expertas, aunque conviene contrastarlas con el gradient boosting, que rinde mejor en este dominio.
- **Prototipado rápido de asistentes de operación de edificios**: al ser un modelo de 63,9 M de parámetros y 0,6 GB de pesos en fp16, puede ejecutarse en una CPU modesta o en una GPU de consumo para demos y pruebas de concepto de asistentes que respondan "qué falla, cuánto y qué hacer".
- **Investigación sobre preentrenamiento de dominio en modelos pequeños**: sirve como referencia reproducible para estudiar cuánto rinde el preentrenamiento de dominio frente al SFT directo y frente a métodos no-LLM en una tarea industrial concreta.

## Benchmarks y rendimiento

Resultados sobre los meses de test [7, 9] (672 días no vistos), con intervalos de confianza al 95 % entre corchetes:

| Brazo | Fallo correcto % | Fallo + severidad % | Días con fallo detectados % | Falsas alarmas en días sanos % | Recall macro % | Parseado % |
|---|---|---|---|---|---|---|
| A: SFT desde cero, log + gemelo | 80,7 [77,7, 83,6] | 64,0 [60,3, 67,6] | 89,6 [86,7, 92,1] | 28,1 [21,9, 34,9] | 82,1 | 100 |
| B1: preentrenamiento de dominio + SFT, log + gemelo | 77,7 [74,6, 80,8] | 65,6 [62,1, 69,0] | 94,6 [92,5, 96,5] | 49,0 [42,2, 56,2] | 82,1 | 100 |
| B2: preentrenamiento de dominio + SFT, log bruto | 65,0 [61,5, 68,6] | 53,9 [50,1, 57,6] | 92,3 [89,6, 94,6] | 61,5 [54,7, 68,2] | 69,4 | 100 |
| Gradient boosting sobre residuos (sin LLM) | 88,1 [85,6, 90,3] | 72,5 [69,0, 75,9] | 94,6 [92,5, 96,5] | 15,6 [10,9, 21,4] | 88,7 | 100 |

Diferencias pareadas en "fallo + severidad correctos" [IC 95 %]:

| Comparación | Diferencia (puntos) | IC 95 % |
|---|---|---|
| Preentrenamiento de dominio (B1 - A) | +1,6 | [-2,2, +5,5] |
| Residuos del gemelo (B1 - B2) | +11,8 | [+8,0, +15,5] |
| Frente a gradient boosting (B1 - GB) | -6,8 | [-10,6, -3,0] |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,6 GB y los pesos se distribuyen en fp16 con 63,9 M de parámetros, por lo que la inferencia cabe holgadamente en menos de 1 GB de VRAM (sin contar overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3050, RTX 4060, RTX 4090, A100 y H100 sin problema de capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: el formato nativo es `.pth` de MiniMind, que requiere clonar el repositorio en el commit `858008e`, colocar el archivo en `out/` y cargarlo con `MiniMindForCausalLM(MiniMindConfig(hidden_size=768, num_hidden_layers=8))`. No se distribuyen pesos en GGUF ni safetensors, por lo que no hay soporte directo documentado para vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Fallo + severidad % (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HVAC fault finder v14 (B1) | 63,9 M | no disponible | LLM especialista con residuos de gemelo | 65,6 | Apache 2.0 | Hugging Face (pesos `.pth`) |
| HVAC fault finder v14 (A) | 63,9 M | no disponible | LLM especialista sin preentrenamiento de dominio | 64,0 | Apache 2.0 | Hugging Face (pesos `.pth`) |
| Gradient boosting sobre residuos | no aplica | no aplica | Modelo tabular clásico | 72,5 | no aplica | Referencia interna del estudio |
| MiniMind base | 63,9 M | no disponible | LLM generalista pequeño | no disponible | Apache 2.0 | GitHub / Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de detección de fallos HVAC en la información proporcionada.

## Limitaciones y advertencias

- Los fallos son simulados con EnergyPlus, uno a la vez, en un único edificio y un único clima; el modelo no sustituye una inspección in situ.
- El preentrenamiento utiliza únicamente el texto de los 2816 días de entrenamiento, no un corpus general, por lo que el modelo no sabe nada fuera de esta tarea y no debe usarse como modelo conversacional.
- Las variantes con gemelo (A y B1) requieren los residuos del gemelo digital v12 como entrada; sin ellos, el rendimiento cae a los niveles de B2 (53,9 % en fallo + severidad).
- El gradient boosting sobre los mismos residuos supera al mejor LLM en 6,8 puntos en fallo + severidad y reduce las falsas alarmas del 49,0 % al 15,6 %, lo que cuestiona el uso del LLM frente a un clasificador tabular en producción.
- El preentrenamiento de dominio no aporta una mejora estadísticamente significativa (+1,6 puntos, IC que cruza cero) y empeora las falsas alarmas en días sanos (28,1 % en A frente a 49,0 % en B1).
- Riesgo de alucinación en la acción recomendada (`Action`): la model card no reporta métricas de calidad sobre ese campo, solo sobre fallo y severidad.
- No se declaran idiomas soportados; dado que el entrenamiento es exclusivamente sobre logs sintéticos y texto de dominio, no hay garantía de comportamiento correcto en castellano u otros idiomas.
- Licencia Apache 2.0, que permite uso comercial, pero la naturaleza simulada de los datos y la ausencia de validación en edificios reales desaconsejan su despliegue directo en producción sin reentrenamiento y validación adicional.
- El formato de pesos `.pth` dependiente de un commit concreto de MiniMind complica la integración con runtimes estándar de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeMri98/hvac-minimind-fdd-v14
- Gemelo digital v12: https://huggingface.co/GeMri98/hvac-digital-twin-v12
- Repositorio MiniMind: https://github.com/jingyaogong/minimind
- Commit de MiniMind utilizado: `858008e`

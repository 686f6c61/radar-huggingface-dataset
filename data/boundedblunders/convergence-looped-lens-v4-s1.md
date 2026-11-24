# boundedblunders/convergence-looped-lens-v4-s1

## Resumen

`convergence-looped-lens-v4-s1` es el cuarto artefacto (Entry #4) presentado por el equipo **convergence** al *NDIF Looped Lens Challenge*, un certamen de interpretabilidad mecanística centrado en el modelo `thinkingmachines/Inkling-2-Mini`. No se trata de un modelo generativo autónomo, sino de un conjunto de pesos de "lente" (*lens*): proyecciones residuales de bajo rango entrenadas para leer y modificar estados ocultos internos de Inkling-2-Mini durante su ejecución *looped* (reutilización de capas en varias pasadas).

La propuesta destaca por una restricción de diseño estricta: cada una de las 10 líneas de lectura opera sobre **un único tensor de activación** de dimensión `[2304]`, sin mezcla entre visitas ni heurísticas basadas en el texto del prompt. Las seis primeras líneas usan rango `r = 128` y las cuatro últimas `r = 256`, cubriendo visitas concretas en las capas 11, 12, 18, 19, 20, 21, 22 y 23 a lo largo de tres pasadas de ejecución.

El interés actual del artefacto es fundamentalmente metodológico: combina autodestilación sin etiquetas, una compuerta escalar (*DeltaGate*) condicionada a la activación y un desplazamiento de logits fijo calculado sobre un split equilibrado. Es material de investigación en interpretabilidad, no un modelo listo para producción, y su repo ocupa 0.0 GB según los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyecciones residuales de bajo rango (*lens*) sobre estados ocultos de `thinkingmachines/Inkling-2-Mini`; 10 líneas de lectura, una por tensor de activación |
| Parametros totales | no disponible (el repo reporta 0.0 GB; no se detalla el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Inkling-2-Mini, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

El artefacto implementa una lente de interpretabilidad compuesta por 10 líneas independientes. Cada línea aplica una proyección residual de bajo rango con normalización RMS invariante a escala, de la forma `h_t = h + rms(h) * ((h / rms(h)) @ A^T @ B^T + b)`, donde `h` es un vector oculto de dimensión 2304 leído en una visita y capa concretas: líneas 1-2 en `layers[12].attention_input.output[0]` (pasadas 0 y 1), línea 3 en `layers[11].mlp_input.output[0]`, línea 4 de nuevo en `layers[12]`, líneas 5-6 en las entradas pre-convolución de atención de las capas 18 y 19, y líneas 7-10 en las entradas residuales *Coda* de las capas 20 a 23. Las líneas 1-6 usan rango 128 y las 7-10 rango 256.

El entrenamiento se estructura en dos etapas más un ajuste posterior. La etapa 1 es autodestilación sin etiquetas: se ajusta la proyección para reproducir la distribución top-20 de siguiente token del propio Inkling-2-Mini tras el prefijo `<|content_text|>`, usando 4.682 prompts de chat limpios para las líneas 1-6 y 19.343 para las líneas 7-10. La etapa 2 entrena una compuerta escalar *DeltaGate* con tope `g_cap = 0.72`, `g(h) = 0.72 * sigmoid(w_g^T [LN(h), LN(h_t - h)] + b_g)`, que se activa en estados de frontera de plantilla de chat y se mantiene cerca de cero (`g ≈ 0`) en texto plano, erratas y estados de respuesta iniciada. Finalmente se aplica un desplazamiento de logits fijo e incondicional (`u90_05`) que resta `0.5 * max(0, mu_v - q90(mu_v))`, calculado una sola vez sobre un split de entrenamiento equilibrado (`tr_bal`) para atenuar el sesgo genérico de plantilla.

## Capacidades

- Lectura de estados ocultos internos de `thinkingmachines/Inkling-2-Mini` en 10 puntos de activación predefinidos a lo largo de tres pasadas de ejecución *looped*.
- Intervención controlada sobre esos estados mediante proyecciones residuales de bajo rango con normalización RMS invariante a escala.
- Modulación selectiva mediante *DeltaGate*: activación en estados de frontera de plantilla de chat y supresión en texto plano, erratas y estados de respuesta iniciada.
- Autodestilación sin etiquetas: alineación con la distribución top-20 de siguiente token del modelo base, sin respuestas de referencia.
- Atenuación de sesgo de plantilla mediante desplazamiento de logits fijo e incondicional (`u90_05`).
- No soporta tool calling, agentes, visión, audio ni modo *thinking*: es un artefacto de interpretabilidad, no un modelo de propósito general.
- Capacidades multilingües: no disponibles (no se documentan).

## Casos de uso

- Investigación en interpretabilidad mecanística: analizar cómo se distribuye la información en las capas 11-23 de Inkling-2-Mini a lo largo de sus pasadas *looped*, leyendo un único tensor por línea y evitando confusores de mezcla entre visitas.
- Reproducción de experimentos del *NDIF Looped Lens Challenge*: servir como Entry #4 de referencia para comparar metodologías de lentes residuales entre equipos participantes.
- Estudio de compuertas condicionadas a activación: el *DeltaGate* permite examinar cómo un escalar derivado únicamente de `h` y su delta separa estados de frontera de plantilla de estados de texto plano.
- Análisis de sesgo de plantilla: el desplazamiento `u90_05` ofrece un punto de partida para medir y atenuar el sesgo de fondo introducido por la plantilla de chat en la distribución de salida.
- Auditoría de autodestilación sin etiquetas: comparar la fidelidad de la distribución top-20 reproducida frente a la del modelo base en prompts de chat limpios.
- Docencia y formación: ilustrar técnicas de proyección de bajo rango, normalización RMS y compuertas escalares sobre modelos *looped* en cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de fidelidad, precisión de lectura ni comparaciones numéricas con otras entradas del certamen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto es una lente de bajo rango sobre un modelo base; el coste dominante es ejecutar `thinkingmachines/Inkling-2-Mini`, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponibles (no se especifica vLLM, llama.cpp, Ollama ni TGI). El artefacto requiere acceso a las activaciones internas del modelo base, lo que implica instrumentación a nivel de framework (por ejemplo, hooks sobre las capas indicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boundedblunders/convergence-looped-lens-v4-s1` | Lente de interpretabilidad (Entry #4) | no disponible | no disponible | MIT | Hugging Face |
| Otras entradas del *NDIF Looped Lens Challenge* | Lentes de interpretabilidad | no disponible | no disponible | no disponible | no disponible |
| `thinkingmachines/Inkling-2-Mini` (modelo base) | Modelo *looped* de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos públicos sobre entradas comparables del certamen ni sobre las especificaciones del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: no puede usarse para generación de texto, código, matemáticas ni tareas de propósito general.
- Dependencia estricta de `thinkingmachines/Inkling-2-Mini`: los pesos solo tienen sentido sobre las activaciones de ese modelo y sus capas concretas.
- Sesgo de plantilla: aunque se aplica el desplazamiento `u90_05` para atenuarlo, el sesgo de fondo de la plantilla de chat puede persistir en la distribución de salida.
- Riesgo de alucinación: no aplica en el sentido habitual, pero la autodestilación sin etiquetas puede reproducir errores del modelo base al imitar su distribución top-20.
- Cobertura limitada: solo se leen 10 tensores concretos en las capas 11-23; el resto de la red no se inspecciona.
- Idiomas soportados: no documentados.
- Restricciones de licencia: MIT permite uso comercial, pero el uso previsto es de investigación en interpretabilidad; no se garantiza idoneidad para producción.
- Metadatos incompletos: descargas 0, likes 0, repo de 0.0 GB y sin pipeline declarado, lo que sugiere un artefacto de investigación sin validación externa publicada.
- Ausencia de benchmarks: no hay evidencia cuantitativa de fidelidad o utilidad de la lente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v4-s1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF Looped Lens Challenge: no disponible (no se proporciona URL en la información)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.

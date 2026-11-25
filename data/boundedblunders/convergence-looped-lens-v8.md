# boundedblunders/convergence-looped-lens-v8

## Resumen

`boundedblunders/convergence-looped-lens-v8` es un conjunto de pesos auxiliares publicado por el equipo **convergence** para el NDIF Looped Lens Challenge, un reto de interpretabilidad centrado en leer y traducir estados internos de un modelo base (`thinkingmachines/Inkling-2-Mini`). No es un modelo generativo: es un paquete de lentes (probes y transformaciones lineales) que se aplican sobre las activaciones de un modelo ya existente para inspeccionar su representación interna en distintas "visitas" o pasos recurrentes.

El artefacto principal, `lens_weights.safetensors` (37,85 MB, 41 tensores fp16/int64), contiene tres componentes: un selector de posición basado solo en activaciones (`qsel.*`, 4.609 parámetros), lentes de coda de bajo rango con compuerta (`v43.*` a `v47.*`, r=128, g_cap=0,65) y traductores jacobianos lineales fijos (`j43`, `j44`, `j47`, matrices de 2304×2304). Todo el entrenamiento es *label-free*: destilación KL para las lentes de bajo rango y cálculo directo de jacobianos medios para los traductores.

Su relevancia es acotada pero específica: sirve como referencia reproducible para quienes investigan *looped transformers*, decodificación de estados ocultos y técnicas de *lens* tipo logit-lens o Jacobian Lens. La licencia MIT facilita su reutilización, aunque el repositorio no incluye el modelo base ni código de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de lentes de interpretabilidad (selector lineal + lentes de bajo rango con compuerta + traductores jacobianos lineales) sobre activaciones de `thinkingmachines/Inkling-2-Mini` |
| Parametros totales | No disponible como modelo único; el selector `qsel.*` tiene 4.609 parámetros y cada matriz jacobiana 2304×2304 (≈5,3 M parámetros en fp16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; las lentes operan sobre ventanas de 14 tokens y posiciones concretas) |
| Tipos de cuantizacion | Pesos en fp16 e int64; no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`lens_weights.safetensors`) |

## Arquitectura y entrenamiento

El paquete se compone de tres bloques. El primero es un selector de posición de un solo token basado exclusivamente en activaciones (`qsel.*`): usa la masa del token de control crudo en la visita 47 y una sonda lineal sobre `[h45, h47]` normalizados por RMS unitario en una ventana de 14 tokens finales, sin identificadores de token ni texto del prompt. El segundo son lentes de coda de bajo rango con compuerta (`v43.*` a `v47.*`, rango 128, `g_cap=0,65`), entrenadas sin etiquetas mediante destilación KL y aplicadas en las visitas 43, 45, 46 y 47. El tercero son traductores jacobianos lineales fijos (`j43`, `j44`, `j47`), calculados como jacobianos medios sumados por token de extremo a extremo, `J_v = E[sum_{p'>=p} d(h_final[p'])/d(h_v[p])]`, siguiendo a Gurnee et al. (2026, *Jacobian Lens*), sobre 21 secuencias de WikiText-103 y chat genérico, sin preguntas ni respuestas de benchmarks.

La innovación técnica principal es el enrutamiento basado solo en activaciones: en las visitas 43 y 47, la elección entre la lente de bajo rango con compuerta y el traductor jacobiano depende de si la masa de probabilidad del token de control en la visita 47 supera 0,50 o no, sin usar texto ni IDs del prompt. Todo el proceso de construcción es *label-free*, lo que reduce el riesgo de fuga de información de benchmarks.

## Capacidades

- Inspección de estados internos de `thinkingmachines/Inkling-2-Mini` en visitas concretas (43, 44, 45, 46, 47).
- Selección de posición de lectura basada únicamente en activaciones, sin acceso al prompt.
- Traducción lineal de estados ocultos a la representación final mediante jacobianos medios.
- Lentes de bajo rango con compuerta para aproximar la distribución de salida en visitas intermedias.
- Enrutamiento condicional entre dos familias de lentes según la masa de control en la visita 47.
- No incluye generación de texto, tool calling, agentes, visión ni audio: es un artefacto de interpretabilidad, no un modelo de propósito general.
- Capacidades multilingües: no disponibles (dependen del modelo base y no se documentan).

## Casos de uso

- Investigación en *looped transformers*: aplicar las lentes sobre las visitas 43-47 para estudiar cómo evoluciona la representación interna a lo largo de los bucles recurrentes y comparar la fidelidad de lentes de bajo rango frente a traductores jacobianos.
- Reproducción de resultados del NDIF Looped Lens Challenge: el paquete permite reproducir la entrada #8 del equipo convergence y verificar el enrutamiento basado en activaciones descrito en la model card.
- Auditoría de interpretabilidad sin fuga de datos: al ser *label-free*, sirve para validar metodologías de *lens* que no usan preguntas ni respuestas de benchmarks, útil en estudios de evaluación de probes.
- Análisis de la dinámica de atención y estados ocultos: las matrices jacobianas de 2304×2304 permiten estudiar la propagación de gradientes entre posiciones y visitas en el modelo base.
- Docencia y formación en mecánica interpretativa: el conjunto es pequeño (37,85 MB) y puede usarse como ejemplo práctico de logit-lens, Jacobian Lens y destilación KL en cursos avanzados.
- Desarrollo de nuevas lentes: las lentes existentes sirven como línea base para comparar variantes (por ejemplo, cambiar el rango, la compuerta o la ventana de 14 tokens) sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para las lentes: inferior a 1 GB (37,85 MB de pesos más overhead de activaciones del modelo base).
- VRAM para el modelo base `thinkingmachines/Inkling-2-Mini`: no disponible en la información proporcionada.
- GPU recomendadas: no disponibles; al ser un artefacto de interpretabilidad, la viabilidad depende del modelo base sobre el que se apliquen las lentes.
- Cabe en GPU de consumo: probablemente sí para las lentes; para el modelo base no hay datos.
- Opciones de despliegue: carga directa con `safetensors` en PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un artefacto de lentes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `boundedblunders/convergence-looped-lens-v8` | Lentes de interpretabilidad | 4.609 (selector) + matrices 2304×2304 | No disponible | MIT | Hugging Face |
| `boundedblunders/convergence-looped-lens-v5` | Lentes de interpretabilidad (versión previa) | No disponible | No disponible | MIT (según repo) | Hugging Face |
| `thinkingmachines/Inkling-2-Mini` | Modelo base (referencia) | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas entradas; la comparativa se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, código, matemáticas, visión ni tool calling.
- Depende estrictamente de `thinkingmachines/Inkling-2-Mini`; las lentes no son portables a otros modelos sin reentrenamiento.
- El repositorio no incluye el modelo base, el código de inferencia ni instrucciones de uso; la reproducibilidad exige reconstruir el pipeline a partir de la model card.
- El enrutamiento entre lentes se basa en un umbral fijo (0,50) sobre la masa de control en la visita 47; cambios en el modelo base o en la tokenización pueden invalidarlo.
- Riesgo de sobreajuste a las 21 secuencias de WikiText-103 y chat genérico usadas para calcular los jacobianos.
- No se documentan sesgos, idiomas soportados ni evaluación de robustez.
- Aunque la licencia es MIT, el uso comercial de las lentes está condicionado por la licencia del modelo base, que no se especifica en la información disponible.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de fidelidad de las lentes frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/boundedblunders/convergence-looped-lens-v8
- Versión previa referenciada: https://huggingface.co/boundedblunders/convergence-looped-lens-v5
- Modelo base referenciado: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Referencia citada: Gurnee et al. (2026), *Jacobian Lens* (no se proporciona URL en la información disponible)

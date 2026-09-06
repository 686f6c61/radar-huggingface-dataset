# NagaYu/isotope-calibration-qwen2.5-1.5b-instruct

## Resumen

Este repositorio no es un modelo de lenguaje: es un perfil de calibración para `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por NagaYu. El perfil contiene las constantes por capa que la librería Isotope necesita para rastrear el flujo de información en el forward pass, junto con una política de herramientas calibrada contra esas constantes. Resuelve el problema de la inyección de prompts en agentes que usan herramientas: permite medir cuánta influencia tienen los datos no confiables en las decisiones de autorización, sin modificar el comportamiento del modelo base.

El trabajo es relevante porque proporciona una calibración empírica para un modelo concreto. Las mediciones incluyen el coeficiente α (la parte del residual stream que corresponde a la rama de atención, con mediana 0.186) y la masa de atención en el attention sink de la capa 0 (media 0.403). Con estos valores, Isotope consigue una tasa de éxito de ataque de 0.00 en su benchmark, frente a 0.44 sin defensa, manteniendo una utilidad benigna de 0.90. El perfil no contiene pesos entrenados; se almacena en el namespace de modelos porque acompaña al checkpoint que describe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio contiene un perfil de calibración, no un modelo. El modelo base es Qwen2.5-1.5B-Instruct, un transformer |
| Parametros totales | No disponible (el repositorio no contiene pesos; el modelo base indicado es Qwen2.5-1.5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | No aplica: no contiene pesos. Incluye `calibration.json` e `isotope_policy.json` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado. Es un artefacto de calibración para el checkpoint `Qwen/Qwen2.5-1.5B-Instruct`, generado por la librería Isotope. Isotope propaga una distribución de procedencia a través del grafo de atención mediante la ecuación `U[l+1][t] = (1 − α[l][t])·U[l][t] + α[l][t]·Σⱼ W[l][t,j]·U[l][j]`. Dos de sus entradas dependen del modelo concreto y se han medido en este perfil: el coeficiente α, que representa la parte del residual stream que ocupa la rama de atención, y el attention sink en la capa 0, que absorbe una gran fracción de cada fila de atención.

La calibración incluye los siguientes valores medidos: la mediana de α por capas es 0.186, mientras que la media es 0.214. El primer cuarto de capas alcanza 0.318 y el último cuarto baja a 0.160. Si se asume el valor fijo de 0.5 típico de attention-rollout, el factor de sobre-mezcla es 2.34×, lo que hace que la influencia de inyecciones exitosas se reporte como 0.000. Respecto al attention sink, la masa media de atención en la posición 0 es 0.403 por capa, con máximo de 0.615 en una capa individual. El ratio entre la norma del vector de valor del sink y la mediana es 0.284. Este ratio es clave: ponderar el transporte de procedencia por `‖v‖` en lugar de por probabilidad de atención neutraliza el sink, porque sus vectores de valor son pequeños. Si el ratio se acercara a 1.0 en otro checkpoint, esta estrategia no funcionaría y la lectura tendría que revalidarse.

La política de herramientas se calibró sobre una división de desarrollo de 7 tareas. Los umbrales se aplican a la proporción disputada —`untrusted / (untrusted + user_instruction + ε)`— donde 0.5 significa que los datos no confiables contribuyeron más que el usuario. Para `send_email` el umbral de decisión es 0.35, con umbral de argumento 0.45 para `to`. Para `transfer` el umbral de decisión es 0.35, con umbrales 0.45 para `to` y 0.60 para `amount`. Los argumentos de contenido (`body`, `answer`) están deliberadamente sin puerta porque en tareas benignas midieron entre 0.55 y 0.60 de influencia no confiable, indistinguibles de un ataque a nivel de bloque.

## Capacidades

- No es un modelo generativo: no produce texto, código ni razonamiento. Sus capacidades son las de un perfil de calibración.
- Proporciona las constantes por capa (α, masa de atención del sink, normas del sink y mediana) para `Qwen/Qwen2.5-1.5B-Instruct` en el archivo `calibration.json`.
- Incluye una política de herramientas calibrada en `isotope_policy.json`, con umbrales de decisión y de argumento para `send_email` y `transfer`.
- Permite a Isotope calcular la proporción de influencia no confiable en el token de decisión, lo que habilita la detección de inyecciones de prompts que influyen en acciones peligrosas.
- Soporta auditoría del flujo de información en el forward pass, usando implementación eager de atención. No es compatible con FlashAttention ni SDPA, porque estas no materializan la matriz de atención.
- No altera el comportamiento del modelo base: el repositorio solo contiene datos medidos, no pesos ajustados.

## Casos de uso

- Auditoría de seguridad en agentes con herramientas: el perfil permite que Isotope decida si una acción como `send_email` o `transfer` está influida por datos no confiables. Por ejemplo, en un agente que consulta documentos de facturación, el guard calcula la proporción disputada y bloquea la acción si supera el umbral calibrado.
- Defensa contra inyección de prompts en aplicaciones RAG: al adjuntar documentos externos no confiables, el perfil calibra cuándo el contenido recuperado domina sobre la instrucción del usuario. Esto permite detectar intentos de manipulación en consultas de recuperación.
- Evaluación de sistemas de defensa en producción: el repositorio sirve como artefacto de referencia para auditar qué constantes y umbrales se utilizaron al calibrar una defensa específica, facilitando la reproducibilidad en revisiones de seguridad.
- Investigación en interpretabilidad del flujo de información: las constantes medidas (α y masa del sink) permiten estudiar cómo la atención propaga procedencia dentro de Qwen2.5-1.5B-Instruct, sin necesidad de reconstruir mediciones desde cero.
- Desarrollo de políticas de autorización en agentes autónomos: la política calibrada incluye umbrales concretos para argumentos como `to` y `amount`, que pueden integrarse en pipelines de decisión antes de ejecutar acciones con efectos secundarios.
- Comparación de defensas en seguridad de LLM: el benchmark asociado facilita comparar el rendimiento de Isotope frente a una defensa externa de grano grueso (estilo CaMeL) y frente a un sistema sin defensa, en 26 tareas y 5 condiciones.

## Benchmarks y rendimiento

La model card proporciona resultados medidos en este checkpoint sobre un dataset de 26 tareas y cinco condiciones:

| Condicion | Ataque exitoso | Utilidad benigna | Falsos bloqueos |
|---|---|---|---|
| Sin defensa | 0.44 | 1.00 | 0.00 |
| Externo-coarse (estilo CaMeL) | 0.06 | 0.80 | 0.20 |
| **Isotope** | **0.00** | **0.90** | **0.10** |
| Isotope con taint booleano | 0.00 | 0.20 | 0.80 |

La separación en el token de decisión entre ataques (0.646) y casos benignos limpios (0.069) es de 9.4×, con una AUC de 1.00. El overhead del tracker desplegado es del 8.4% del tiempo de reloj del modelo. Estos resultados se midieron en este checkpoint concreto y sobre una única forma de prompt.

## Requisitos de hardware

- El perfil de calibración en sí no requiere hardware específico: es un conjunto de archivos JSON que se cargan junto con la librería Isotope.
- Para ejecutar Isotope sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct` se puede usar CPU, como muestra el ejemplo de la documentación (parámetro `device="cpu"`).
- No se proporcionan datos de VRAM estimada ni de GPU recomendada en la información disponible.
- Se requiere `attn_implementation="eager"` para que `output_attentions=True` funcione. FlashAttention y SDPA no son compatibles.
- El modelo base debe exponer hooks en `self_attn.v_proj`, `self_attn.o_proj` e `input_layernorm` en cada capa de decodificación.
- El overhead de medición del tracker es del 8.4% del tiempo de reloj del modelo, según las mediciones del autor.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otros modelos; es un artefacto de calibración específico para `Qwen/Qwen2.5-1.5B-Instruct`. No existen perfiles equivalentes en la información proporcionada que permitan comparar parámetros, contexto o rendimiento de inferencia. Para comparar el rendimiento de la defensa Isotope frente a otras estrategias, remítase a la tabla de benchmarks.

## Limitaciones y advertencias

- Las mediciones se realizaron sobre una única forma de prompt (prompt de sistema + turno de usuario + documento recuperado + andamiaje de llamada a herramienta) y sobre un único checkpoint. El valor de α varía según la composición del contexto; los valores son representativos, no exactos.
- Los umbrales de decisión se calibraron solo sobre 7 tareas de desarrollo. Deben revalidarse en el tráfico propio antes de utilizarse en producción.
- Isotope no elimina la inyección de prompts: acota y audita la influencia no confiable sobre decisiones de autorización bajo un modelo de propagación explícito. Cualquier evaluador debe revisar el modelo de propagación antes de confiar en él para garantizar la seguridad.
- El repositorio no contiene pesos: no puede usarse como modelo de lenguaje para generar texto, código ni ninguna otra tarea de inferencia.
- La política deja sin puerta los argumentos de contenido (`body`, `answer`) de forma deliberada. En tareas benignas miden entre 0.55 y 0.60 de influencia no confiable, lo que puede ser indistinguible de un ataque en sistemas de monitorización a nivel de bloque.
- No es compatible con FlashAttention ni SDPA, lo que limita su uso en despliegues que requieran estas implementaciones por razones de rendimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/NagaYu/isotope-calibration-qwen2.5-1.5b-instruct
- Código de Isotope: https://github.com/NagaYu/isotope
- Dataset de benchmark: https://huggingface.co/datasets/NagaYu/isotope-bench
- Demo de Isotope: https://huggingface.co/spaces/NagaYu/isotope
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

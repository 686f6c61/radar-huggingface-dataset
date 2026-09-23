# FluidInference/system-one-gemma-coreml

## Resumen

`FluidInference/system-one-gemma-coreml` es un repositorio de código fuente para la conversión a Core ML del proyecto `akash-kamat/system-one-gemma`, que a su vez se apoya en el modelo base `google/gemma-3-270m`. El repositorio está bloqueado (gated) y, según su propia model card, no contiene pesos del modelo ni ningún paquete Core ML: únicamente aloja el código de conversión fijado a un commit concreto (`cc75aa8042dec965003210fdba033fee8759735e` del proyecto original y `9b0cfec892e2bc2afd938c98eabe4e4a7b1e0ca1` del base).

El problema que aborda es la portabilidad del modelo a dispositivos Apple mediante Core ML, incluyendo un adaptador entrenado del proyecto original que incorpora una cabeza de puntuación escalar (*scalar score head*). Sin embargo, la cuenta autenticada que publica el repositorio recibe HTTP 403 al intentar acceder al modelo base gated, por lo que los scripts están preparados pero no probados contra el modelo completo. No se redistribuye ni el adaptador ni ningún peso base o derivado.

La relevancia actual del repositorio es limitada y de carácter principalmente documental: no se emite ninguna afirmación sobre latencia, rendimiento en ANE, tamano, paridad numérica ni Decision Index. Además, el README del scorer original indica que los pesos preentrenados heredan una restricción de uso no comercial, y los Gemma Terms rigen tanto el modelo base como sus derivados convertidos. Cualquier artefacto futuro requeriría acceso legítimo y una revisión separada de derechos de redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como especificación propia del repositorio. Se trata de un *conversion toolkit*: código de conversión a Core ML del proyecto `akash-kamat/system-one-gemma`, apoyado en `google/gemma-3-270m` más un adaptador entrenado con cabeza de puntuación escalar. No se describe la arquitectura del transformer subyacente en esta model card. |
| Parametros totales | No disponible. La denominación del modelo base (`gemma-3-270m`) sugiere ~270 millones de parámetros, pero no se confirma ni se detalla en la información proporcionada. |
| Parametros activos | No aplica (no se indica que sea un modelo MoE). |
| Longitud de contexto | No disponible. |
| Tipos de cuantizacion | No disponible. La model card no especifica precisiones ni variantes de cuantización para el artefacto Core ML. |
| Idiomas soportados | No disponible. |
| Licencia | Doble régimen: `LICENSE-CODE` cubre únicamente los scripts de conversión de este repositorio y no altera los términos del modelo base, el adaptador ni los derivados. El modelo base y sus conversiones se rigen por los [Gemma Terms](https://ai.google.dev/gemma/terms). El README del scorer original indica que los pesos preentrenados heredan una restricción de uso no comercial. |
| Formato de pesos | No se distribuyen pesos. El repositorio contiene únicamente código fuente de conversión. No hay paquete Core ML (`.mlpackage`/`.mlmodelc`), ni safetensors, ni GGUF publicados aquí. |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la información proporcionada. Lo que sí se documenta es la cadena de dependencias del *toolkit*: el repositorio fija el código fuente de `akash-kamat/system-one-gemma` en el commit `cc75aa8042dec965003210fdba033fee8759735e` y el modelo base `google/gemma-3-270m` en el commit `9b0cfec892e2bc2afd938c98eabe4e4a7b1e0ca1`. El adaptador entrenado del proyecto original contiene una cabeza de puntuación escalar, lo que apunta a un uso orientado a *scoring* o clasificación/reranking más que a generación abierta, aunque esto no se detalla.

En cuanto a entrenamiento, no se especifican en esta model card el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Los scripts de conversión se describen como preparados pero no probados contra el modelo completo, a la espera de que se conceda el acceso al base gated. La documentación complementaria (`README-toolkit.md`) promete comandos reproducibles, semántica nativa exacta y *validation gates*, pero no se emite ninguna afirmación de paridad numérica ni de rendimiento.

## Capacidades

No se documentan capacidades funcionales del modelo en la información proporcionada. Lo que sí puede afirmarse sobre este repositorio es lo siguiente:

- Aloja código fuente para convertir el proyecto `system-one-gemma` a formato Core ML, con vistas a su ejecución en el ecosistema Apple.
- El adaptador del proyecto original incorpora una cabeza de puntuación escalar, lo que sugiere capacidad de *scoring*; no se detalla su semántica exacta.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o multilingüismo en esta model card.
- No se declara soporte de *thinking mode*, audio ni ninguna otra capacidad especial.
- El repositorio está bloqueado (gated) y sus scripts no han sido validados contra el modelo completo.

## Casos de uso

Dado que el repositorio no contiene pesos ni un artefacto desplegable, los casos de uso realistas son de carácter instrumental y de investigación, no de producción directa:

- Reproducción de la cadena de conversión: un equipo con acceso legítimo a `google/gemma-3-270m` puede usar el código fijado a commit para reproducir la conversión a Core ML y verificar los *validation gates* descritos en `README-toolkit.md`.
- Auditoría de procedencia: el repositorio permite rastrear exactamente qué revisión de código y qué revisión del modelo base se usaron, útil para equipos que necesitan trazabilidad antes de adoptar un artefacto derivado.
- Integración en apps Apple: si en el futuro se obtiene acceso y derechos de redistribución, el objetivo declarado es ejecutar el modelo en el ecosistema Core ML (ANE, GPU o CPU de Apple Silicon).
- Puntuación o reranking en local: la cabeza de puntuación escalar del adaptador apunta a tareas de *scoring*, potencialmente para filtrar o priorizar candidatos sin enviar datos a servicios externos.
- Revisión legal y de licencias: el repositorio es un punto de partida explícito para evaluar la restricción no comercial del scorer original y los Gemma Terms antes de cualquier despliegue.
- Plantilla de *toolkit* de conversión: sirve como referencia metodológica para estructurar pipelines de conversión a Core ML con revisiones fijadas y puertas de validación.
- Investigación sobre despliegue en dispositivo: permite estudiar el flujo Core ML para un modelo de ~270M parámetros nominales, aunque sin métricas publicadas de latencia o de uso de ANE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se emite ninguna afirmación sobre latencia, ANE, tamano, paridad ni Decision Index, y que los scripts no han sido probados contra el modelo completo.

## Requisitos de hardware

- VRAM/unified memory: no disponible. No se publican cifras de consumo de memoria para la conversión Core ML ni para el modelo base.
- GPU recomendadas: no disponible. El destino declarado del *toolkit* es Core ML, es decir, hardware Apple (Neural Engine, GPU o CPU), pero no se especifican modelos ni generaciones concretas.
- Compatibilidad con GPU de consumo: no disponible. No se confirma ni se desmiente que el artefacto resultante quepa en equipos de consumo.
- Opciones de despliegue: el repositorio apunta a Core ML mediante el *toolkit* de conversión. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card declara expresamente que no se hace ninguna afirmación al respecto.

Nota: cualquier estimación de memoria basada en el nombre `gemma-3-270m` sería una extrapolación aritmética, no un dato publicado, y por tanto no se incluye aquí.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. La comparación posible se limita a los eslabones de la propia cadena del proyecto:

| Elemento | Tipo | Pesos incluidos | Estado de acceso | Licencia declarada |
|---|---|---|---|---|
| `FluidInference/system-one-gemma-coreml` | Repositorio de código de conversión a Core ML | No | Bloqueado (gated); la cuenta autenticada recibe HTTP 403 sobre el base | `LICENSE-CODE` para los scripts; el base y derivados se rigen por Gemma Terms |
| `akash-kamat/system-one-gemma` | Proyecto original (scorer) referenciado | No en este repositorio | No especificado | Restricción no comercial indicada en el README del scorer |
| `google/gemma-3-270m` | Modelo base | Sí, en su propio repositorio | Gated; el acceso denegado es el que bloquea el *toolkit* | Gemma Terms |

No disponible la comparación con alternativas de terceros (otros *toolkits* de conversión a Core ML, formatos alternativos para el mismo base, etc.), ya que no se mencionan en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni paquete Core ML: es únicamente código fuente de conversión. No es desplegable tal cual.
- Los scripts están preparados pero no probados contra el modelo completo, por lo que su corrección no está verificada.
- No se emite ninguna afirmación sobre latencia, rendimiento en ANE, tamano, paridad numérica ni Decision Index.
- El acceso al modelo base está bloqueado: la cuenta autenticada recibe HTTP 403, lo que impide completar la conversión.
- Restricción de uso no comercial: el README del scorer original indica que los pesos preentrenados heredan esta limitación. Cualquier uso comercial requeriría revisión legal.
- Los Gemma Terms rigen el modelo base y sus derivados convertidos; `LICENSE-CODE` solo cubre los scripts de este repositorio y no modifica esos términos.
- Cualquier artefacto futuro exige acceso legítimo y una revisión separada de derechos de redistribución.
- No se documentan sesgos, riesgos de alucinación, cobertura idiomática ni límites de contexto del modelo subyacente en la información disponible.
- No se especifican requisitos de hardware, por lo que no puede garantizarse la viabilidad en ningún dispositivo concreto.
- Los resultados de búsqueda web asociados a esta consulta no guardan relación con el modelo y no se han utilizado como fuente.

## Enlaces

- [FluidInference/system-one-gemma-coreml en HuggingFace](https://huggingface.co/FluidInference/system-one-gemma-coreml)
- [README-toolkit.md del repositorio](https://huggingface.co/FluidInference/system-one-gemma-coreml/blob/main/README-toolkit.md)
- [Repositorio original akash-kamat/system-one-gemma](https://github.com/akash-kamat/system-one-gemma)
- [Modelo base google/gemma-3-270m](https://huggingface.co/google/gemma-3-270m)
- [Gemma Terms](https://ai.google.dev/gemma/terms)

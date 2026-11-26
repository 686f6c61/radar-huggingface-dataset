# godman0711/zils-mini-l1126a

## Resumen

Zils d3-mini body es un checkpoint de pesos publicado por el usuario godman0711 bajo el identificador `godman0711/zils-mini-l1126a`. No se trata de un modelo entrenado desde cero, sino de una copia byte a byte de los pesos de `dream-only/lg-decision-4B` (revision `607b3f390d542a91665e49196d9d2245ae95f33f`) en la que solo se ha modificado la cabecera de los tensores safetensors: los 297 tensores de la torre de vision se han renombrado de `model.language_model.visual.*` a `model.visual.*` para alinearse con el layout que esperan los validadores de la subnet Zils (127).

El modelo contiene 5.174.964.736 parametros segun el recuento real de safetensors (aproximadamente 5,17 mil millones), aunque el nombre del modelo base sugiere 4B; esta discrepancia puede deberse a parametros adicionales de la torre de vision o a la contabilidad del checkpoint. El repositorio ocupa 10,4 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada y muy especifica: sirve como "body" (cuerpo de pesos) para el ecosistema de la subnet Zils, un entorno de validacion de modelos. Para un desarrollador o investigador general, el interes esta en el modelo base original (`dream-only/lg-decision-4B`), no en este reempaquetado, que no aporta mejoras de rendimiento ni cambios funcionales respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de `dream-only/lg-decision-4B`; el renombrado de tensores sugiere layout tipo Qwen3.5 con torre de vision) |
| Parametros totales | 5.174.964.736 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO) del modelo base `dream-only/lg-decision-4B`. La model card de este repositorio no describe el entrenamiento, porque el autor declara explicitamente que "every weight byte is unchanged": no ha habido entrenamiento ni ajuste fino en este checkpoint.

La unica modificacion tecnica documentada es el renombrado de 297 tensores de la torre de vision en la cabecera safetensors, de `model.language_model.visual.*` a `model.visual.*`, para adoptar el layout que esperan los validadores de la subnet Zils. Esto implica que el modelo base incorpora un componente de vision, pero no se detalla su configuracion (numero de capas, resolucion de imagen, tipo de encoder, etc.).

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base, sin datos verificables en la informacion disponible.
- Procesamiento de vision: la presencia de 297 tensores de torre de vision indica capacidad multimodal de entrada de imagen, aunque no se especifican detalles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Validacion en la subnet Zils (127): el caso de uso principal y documentado es servir como cuerpo de pesos conforme al layout que esperan los validadores de Zils; se emplearia cargando el checkpoint en el pipeline de validacion de la subnet.
- Reempaquetado y conversion de checkpoints: sirve como referencia de como renombrar tensores de una torre de vision en la cabecera safetensors sin tocar los datos de pesos, util para ingenieros que adaptan modelos a formatos de validacion concretos.
- Experimentacion con el modelo base: dado que los pesos son identicos a `dream-only/lg-decision-4B`, puede usarse como sustituto directo del original en entornos que esperen el layout `model.visual.*`.
- Investigacion sobre multimodalidad: si se confirma la torre de vision, permitiria experimentar con tareas imagen-texto, aunque sin documentacion de rendimiento ni de resolucion de entrada.
- Pruebas de integridad de pesos: util para verificar pipelines que comprueban hashes o estructura de cabecera safetensors, ya que el autor afirma que los bytes de pesos no cambian.
- Despliegue local de referencia: con 10,4 GB en safetensors, puede cargarse en GPUs de gama alta para pruebas de inferencia, siempre que se conozca la configuracion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint de 5,17 mil millones de parametros en FP16 ocupa aproximadamente 10,4 GB (coincide con el tamano del repo), por lo que la carga en precision completa requiere en torno a 11-12 GB de VRAM solo para pesos.
- GPU recomendadas: no disponible. Por tamano, encajaria en GPUs con 16 GB o mas (RTX 4090, A100 40 GB, H100) en FP16; en cuantizacion de 8 bits o 4 bits cabria en GPUs de 8-12 GB, aunque no se ofrecen pesos cuantizados en el repo.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en FP16; en GPUs de 8 GB requeriria cuantizacion no incluida.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser safetensors, seria necesario confirmar el soporte del modelo base en cada framework.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `godman0711/zils-mini-l1126a` | 5.174.964.736 | no disponible | Apache 2.0 | Reempaquetado de `dream-only/lg-decision-4B` con renombrado de tensores de vision |
| `dream-only/lg-decision-4B` | no disponible (nombre sugiere 4B) | no disponible | no disponible | Modelo base original; pesos identicos a los de este checkpoint |
| Alternativas de ~5B | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: los pesos son identicos al modelo base, por lo que no aporta ninguna mejora de capacidad, alineacion o rendimiento.
- Documentacion practicamente inexistente: no hay informacion sobre contexto, idiomas, arquitectura, entrenamiento ni benchmarks, lo que impide evaluar su idoneidad para produccion.
- Sesgos conocidos: no disponible; al heredar el modelo base, arrastraria los sesgos de este, que no estan documentados.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas no puede estimarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que la licencia del modelo base sea compatible y que el renombrado de tensores no infrinja condiciones adicionales.
- Uso previsto muy restringido: esta pensado para la subnet Zils (127); su uso fuera de ese ecosistema no esta validado.
- Discrepancia de parametros: el nombre "4B" del modelo base frente a los 5,17 mil millones reales puede indicar componentes adicionales (vision) o contabilidad distinta; conviene verificarlo antes de dimensionar hardware.
- Fecha de creacion futura en los metadatos (2026-11-26): posible inconsistencia que conviene contrastar con el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/godman0711/zils-mini-l1126a
- Modelo base: https://huggingface.co/dream-only/lg-decision-4B
- Revision del modelo base: `607b3f390d542a91665e49196d9d2245ae95f33f`
- Papers, blogs, repositorios o demos adicionales: no disponible

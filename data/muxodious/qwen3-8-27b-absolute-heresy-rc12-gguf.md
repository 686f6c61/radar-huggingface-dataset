# MuXodious/Qwen3.8-27B-absolute-heresy.rc12-GGUF

## Resumen

El modelo **MuXodious/Qwen3.8-27B-absolute-heresy.rc12-GGUF** es una versión modificada (denominada "hereticación") del modelo base Qwen/Qwen3.8-27B, publicada por el usuario MuXodious en HuggingFace. Se trata de un experimento de adaptación de pesos que busca alterar el comportamiento del modelo original, probablemente para reducir sus mecanismos de rechazo o "refusals" en determinadas entradas. El autor ha publicado dos variantes (RC1 y RC2) con diferentes niveles de ablación y divergencia KL, y ha compartido resultados de evaluación preliminar en tareas de razonamiento de sentido común.

Con 27.320.697.856 parámetros (aproximadamente 27B), el modelo se distribuye únicamente en formato GGUF, lo que facilita su ejecución en entornos de CPU y GPU con herramientas como llama.cpp o Ollama. La ficha de HuggingFace no especifica licencia, idiomas soportados ni detalles adicionales de arquitectura, por lo que la información disponible es limitada. Su relevancia radica en ser un caso de estudio sobre modificación de pesos de modelos grandes, aunque su rendimiento en benchmarks básicos es cercano al azar, lo que sugiere que la intervención degrada significativamente las capacidades originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M y otros no especificados) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Al estar basado en Qwen/Qwen3.8-27B, se presume que conserva la estructura de transformer denso del modelo original, pero no se confirma en la documentación proporcionada. El proceso de "hereticación" parece consistir en una intervención sobre los pesos del modelo base, posiblemente mediante técnicas de ablación o ajuste fino selectivo, con el objetivo de modificar su comportamiento de rechazo. El autor menciona dos versiones (RC1 y RC2) con diferentes pesos de ablación y divergencia KL respecto al original, pero no detalla el método exacto ni los datos de entrenamiento utilizados. No hay información sobre el número de tokens de entrenamiento, composición del dataset o uso de RLHF/DPO.

## Capacidades

- Generación de texto en lenguaje natural, aunque con rendimiento degradado en tareas de razonamiento básico.
- Conversación multi-turno (el modelo está etiquetado como "conversational").
- Soporte de modo razonamiento y no razonamiento, según menciona el autor en sus pruebas.
- Capacidad de rechazo reducida: el objetivo principal de la modificación es disminuir los "refusals" ante ciertas entradas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni otras funcionalidades avanzadas.

## Casos de uso

Dado el carácter experimental del modelo y su bajo rendimiento en benchmarks, los casos de uso son limitados y orientados a investigación:

- Estudio de comportamientos de rechazo: analizar cómo la modificación de pesos altera la tendencia del modelo a negarse a responder ciertas preguntas.
- Investigación en interpretabilidad: comparar las diferencias de activación entre el modelo base y esta variante para entender mecanismos internos.
- Pruebas de robustez: evaluar cómo la ablación de pesos afecta a tareas de sentido común y razonamiento.
- Desarrollo de técnicas de "desherejización" o ajuste de comportamiento en modelos de lenguaje.
- Experimentación con cuantización GGUF y despliegue en entornos de bajos recursos.
- Validación de metodologías de evaluación (el propio autor sugiere usar una semilla fija para comparar resultados).

## Benchmarks y rendimiento

El autor proporciona resultados de LM-Eval para las versiones RC1 y RC2 en cuantización Q4_K_M. Los valores son idénticos entre ambas versiones:

| Tarea | Métrica | RC1 | RC2 |
|---|---|---|---|
| PIQA | acc / acc_norm | 0.4951 ± 0.0117 | 0.4951 ± 0.0117 |
| COPA | acc | 0.55 ± 0.05 | 0.55 ± 0.05 |
| Winogrande | acc | 0.4957 ± 0.0141 | 0.4957 ± 0.0141 |

Estos resultados son cercanos al azar (0.5 para tareas binarias), lo que indica que la modificación ha degradado severamente las capacidades de razonamiento del modelo. No se han publicado resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- El repositorio tiene un tamaño de 34.6 GB, lo que sugiere que los archivos GGUF incluyen cuantizaciones de gran tamaño (posiblemente Q4_K_M y superiores).
- Para ejecutar el modelo en CPU con llama.cpp se recomienda al menos 32 GB de RAM para la cuantización Q4_K_M.
- En GPU, la VRAM necesaria dependerá de la cuantización elegida: para Q4_K_M se estiman unos 16-18 GB, compatible con RTX 4090 o A100, pero no con GPUs de 8 GB.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, o cualquier servidor compatible con GGUF.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base Qwen/Qwen3.8-27B es el punto de referencia natural, pero no se han proporcionado sus métricas en las mismas tareas. Tampoco se conocen otros modelos "hereticados" comparables. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento extremadamente bajo en tareas de razonamiento (cercano al azar), lo que lo hace inadecuado para uso práctico.
- No se especifica licencia, por lo que no se garantiza su uso comercial o incluso académico sin autorización del autor.
- El proceso de modificación de pesos puede introducir sesgos o comportamientos impredecibles no documentados.
- No hay información sobre la seguridad del modelo, alucinaciones o sesgos inherentes.
- El autor advierte que las pruebas de rechazo muestran que RC2 a veces menciona una "política" pero la descarta rápidamente, lo que sugiere inestabilidad en el comportamiento.
- Al ser un experimento, no se recomienda su uso en producción bajo ninguna circunstancia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy.rc12-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)

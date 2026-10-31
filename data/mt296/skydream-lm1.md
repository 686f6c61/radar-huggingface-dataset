# MT296/skydream-lm1

## Resumen

Skydream-lm1 es un modelo publicado en HuggingFace por el usuario MT296, disponible en la ruta `MT296/skydream-lm1`. Se trata de un repositorio de procedencia poco clara: la model card no incluye descripcion del proposito del modelo, y la metadata combina elementos inusuales, como una libreria propia llamada `microduck` y una lista de modelos base muy heterogenea que mezcla modelos de texto (variantes de Qwen), de generacion de video (Open-Sora-v2, Seedance) y modelos multimodales.

El modelo declara soporte para doce idiomas (entre ellos castellano, ingles, arabe, japones, turco, griego, esperanto o yidis) y se ha entrenado o afinado utilizando datasets publicos variados, incluyendo material de vision por documento (SDS-KoPub-VDR), audio (google/fleurs) y datos de agentes (unit3-invitees). Las metricas declaradas (matthews_correlation, google_bleu) sugieren tareas de clasificacion y generacion de texto.

La relevancia practica de este modelo es limitada: con cero descargas registradas, sin benchmarks publicados, sin tarjeta de modelo explicativa y con una cadena de derivacion de modelos base dificil de verificar, se trata de un repositorio experimental que conviene evaluar con extremo escepticismo antes de cualquier uso. El propio autor indica que existe una version mas reciente: `Contrastive-LM/CLM-v0.1-8B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tr, en, ja, el, aa, ar, es, mk, tk, yi, eo, az |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. La libreria asociada es `microduck`, un nombre que no corresponde a ninguna de las librerias habituales de HuggingFace (transformers, diffusers, etc.), por lo que no es posible determinar si se trata de un transformer estandar, un modelo hibrido u otra familia arquitectonica. Tampoco se especifica el numero de parametros ni el tamano de la ventana de contexto.

Respecto al entrenamiento, la metadata declara siete modelos base, lo que sugiere un proceso de fusion (merge) o de afinado multiple sobre modelos muy dispares: `Qwen/Qwen3.8-27B` y derivados de este (incluida una variante con nombres de razonamiento eficiente y tecnicas como SFT, RLOO, MTP y decodificacion especulativa segun su propio nombre), un modelo de razonamiento matematico de 4B (`AoranSun/qwen35-4b-gsm8k-r16`), un thinking finetune de 4B, y modelos de generacion de video (`hpcai-tech/Open-Sora-v2-Video-DC-AE`, `jayseanbrambila/seedance-2-5-video-generation`) y un modelo omni (`Remek/basal-omni-1.1-max`). Los datasets usados incluyen `SamsungSDS-Research/SDS-KoPub-VDR-Benchmark` (vision de documentos coreanos), `XiaomiMiMo/MiMo-V2.6-RL-oss`, `google/fleurs` (reconocimiento de habla multilingue) y `agents-course/unit3-invitees` (datos de agentes). No hay informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

Dada la ausencia de documentacion, las capacidades solo pueden inferirse de los datasets y modelos base declarados, sin garantia de que se hayan transferido:

- Generacion de texto y razonamiento: sugerida por la derivacion de modelos Qwen y de un finetune orientado a GSM8K (matematicas de primaria).
- Razonamiento con modo thinking: indicada por el modelo base `pramodlohra/Qween3_4B_thinking_finetune`.
- Comprension de documentos visuales: sugerida por el dataset SDS-KoPub-VDR-Benchmark.
- Procesamiento de audio o habla: sugerida por el dataset google/fleurs.
- Comportamiento agéntico: sugerida por el dataset agents-course/unit3-invitees.
- Soporte de tool calling: no disponible.
- Capacidades multilingues: declaradas para 12 idiomas, aunque sin detalle de calidad por idioma.

## Casos de uso

Dada la falta de documentacion verificada, los siguientes casos de uso son hipoteticos y dependen de que el modelo funcione segun lo sugerido por su metadata:

- Experimentacion con merges de modelos: el repositorio puede servir como caso de estudio para analizar como se combinan modelos base dispares (texto, video, omni) y que resulta de esa fusion.
- Evaluacion multilingue de bajo recurso: incluye idiomas poco frecuentes como esperanto, yidis, aimara (aa) o turcomano (tk), por lo que podria probarse en tareas de generacion en esas lenguas, previa validacion.
- Razonamiento matematico basico: si el afinado sobre GSM8K se ha conservado, podria usarse para resolver problemas aritmeticos y de razonamiento numerico de nivel basico.
- Prototipado de agentes: el dataset de agentes sugiere un posible uso en pipelines de agentes conversacionales, aunque habria que verificar el soporte real de tool calling.
- Clasificacion de texto: las metricas declaradas (matthews_correlation, mcc) apuntan a tareas de clasificacion binaria o multiclase.
- Pruebas de compatibilidad con librerias no estandar: al usar `microduck`, el modelo puede servir para testear la carga de repositorios fuera del ecosistema transformers habitual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara metricas (`matthews_correlation`, `google_bleu`, y metricas de repositorios de terceros) pero sin valores numericos, por lo que no es posible presentar ninguna tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al desconocerse el numero de parametros y el formato de los pesos, no puede estimarse el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no confirmadas. La libreria `microduck` no es estandar, por lo que el despliegue con vLLM, TGI, llama.cpp u Ollama no esta garantizado; habria que verificar el formato real de los pesos en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Debido a que no se conocen el tamano, la arquitectura ni el rendimiento de este modelo, no es posible una comparativa tecnica rigurosa. Como referencia de categoria (modelos derivados de Qwen de tamano medio con licencia Apache 2.0), se indican alternativas mas documentadas:

| Modelo | Parametros | Contexto | Licencia | Documentacion |
|---|---|---|---|---|
| MT296/skydream-lm1 | no disponible | no disponible | Apache 2.0 | Practicamente inexistente |
| Qwen3-8B (referencia) | 8B | 128K (con YaRN) | Apache 2.0 | Completa, con benchmarks |
| Qwen2.5-7B-Instruct (referencia) | 7B | 128K | Apache 2.0 | Completa, con benchmarks |

Para cualquier caso de uso productivo, los modelos de referencia citados ofrecen garantias mucho mayores que este repositorio.

## Limitaciones y advertencias

- Documentacion practicamente ausente: la model card no explica que hace el modelo, como usarlo ni con que datos se entreno.
- Procedencia dudosa: la lista de modelos base mezcla nombres que no corresponden a modelos publicos verificables, lo que dificulta auditar la procedencia de los pesos. Esto supone un riesgo de seguridad si se ejecutan pesos de origen desconocido.
- Riesgo de alucinacion: no evaluable; sin benchmarks ni pruebas publicadas, no hay garantia de calidad en generacion.
- Sesgos: desconocidos. Al derivar de modelos Qwen y entrenarse con datasets diversos sin documentacion, hereda sesgos no cuantificados.
- Soporte de idiomas sin verificar: los 12 idiomas declarados provienen solo de la metadata; no hay evidencia de calidad en ninguno de ellos.
- Compatibilidad: la libreria `microduck` no es estandar, lo que puede impedir la carga con transformers u otras herramientas habituales.
- Licencia: Apache 2.0 permite uso comercial, pero la procedencia no verificada de los pesos puede implicar riesgos legales adicionales si alguno de los modelos base tuviera restricciones no declaradas.
- Estado del repositorio: cero descargas y una unica valoracion; el autor senala una version mas reciente (`Contrastive-LM/CLM-v0.1-8B`), por lo que este repositorio podria estar abandonado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MT296/skydream-lm1
- Version mas reciente indicada por el autor: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Modelos base declarados:
  - https://huggingface.co/hpcai-tech/Open-Sora-v2-Video-DC-AE
  - https://huggingface.co/Remek/basal-omni-1.1-max
  - https://huggingface.co/Qwen/Qwen3.8-27B
  - https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
  - https://huggingface.co/pramodlohra/Qween3_4B_thinking_finetune
  - https://huggingface.co/jayseanbrambila/seedance-2-5-video-generation
  - https://huggingface.co/AoranSun/qwen35-4b-gsm8k-r16
- Datasets declarados:
  - https://huggingface.co/datasets/SamsungSDS-Research/SDS-KoPub-VDR-Benchmark
  - https://huggingface.co/datasets/XiaomiMiMo/MiMo-V2.6-RL-oss
  - https://huggingface.co/datasets/google/fleurs
  - https://huggingface.co/datasets/agents-course/unit3-invitees

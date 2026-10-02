# cantina-security/apex-flash-1-abliterated

## Resumen

apex-flash-1-abliterated es una variante experimental derivada de apex-flash-1, el modelo de pesos abiertos orientado a seguridad desarrollado por Cantina Security en colaboracion con Yeta. La modificacion principal es la eliminacion (abliteration) del comportamiento de rechazo, que en esta version se ha visto alterado de forma amplia y no restringida a tareas de seguridad. El checkpoint esta pensado para investigacion en seguridad autorizada, en entornos propios o con permiso explicito de prueba.

Arquitectonicamente hereda la base GLM-5.3-Flash (etiquetada como glm5_next en los tags del repositorio) y conserva la modalidad image-text-to-text, es decir, acepta entradas de imagen y texto. El dato real de safetensors indica 321.323.031.390 parametros totales (aproximadamente 321.300 millones), con un repositorio de 642,7 GB distribuido en BF16.

Su relevancia es acotada pero clara: se trata de un modelo de gran escala (clase 300B+) con licencia MIT publicado como derivado de investigacion, lo que lo convierte en una pieza util para estudiar tecnicas de abliteration, comportamiento de rechazo y evaluacion de seguridad en modelos multimodales. El autor advierte explicitamente de que no se ha realizado una evaluacion completa del derivado y de que los resultados publicados para apex-flash-1 no deben atribuirse a esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (tag del repositorio: glm5_next) |
| Parametros totales | 321.323.031.390 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible oficialmente; el checkpoint se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Modalidad | image-text-to-text |
| Modelo base | cantina-security/apex-flash-1 |
| Tamano del repositorio | 642,7 GB |
| Libreria | transformers |
| Descargas / likes | 24 / 17 |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-10-01 |

## Arquitectura y entrenamiento

El autor indica que el checkpoint emplea la arquitectura GLM-5.3-Flash y se distribuye en BF16. No se detalla en la informacion disponible si se trata de un transformer denso o de una variante con mezcla de expertos, ni el numero de parametros activos por token. Tampoco se especifica la longitud de contexto soportada ni la composicion del dataset de entrenamiento original. La unica innovacion tecnica documentada para esta variante concreta es la modificacion del comportamiento de rechazo (abliteration), aplicada de forma amplia y no limitada a tareas de seguridad.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni si el modelo base paso por fases de RLHF, DPO u otro tipo de ajuste por preferencias. La model card remite al repositorio del modelo estandar para la descripcion del entrenamiento y al post de lanzamiento de Apex Flash para la metodologia y ejemplos de caso. No se documenta ninguna tecnica adicional como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es image-text-to-text y la etiqueta conversational esta presente en los tags, lo que indica soporte de dialogo multi-turno.
- Procesamiento de imagenes: la arquitectura retenida es multimodal de entrada imagen-texto, aunque el autor senala que el rendimiento en imagen y video no se ha evaluado para esta variante.
- Entrada de video: la model card menciona que el rendimiento en video tampoco ha sido evaluado, lo que sugiere que la base podria soportar este tipo de entrada.
- Orientacion a seguridad: el modelo base se describe como un modelo de seguridad de pesos abiertos, con un uso previsto como "worker-model" dentro del sistema de investigacion de Cantina.
- Comportamiento de rechazo modificado: la abliteration altera las negativas del modelo de forma general, no solo en dominios de seguridad.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas en la ficha de HuggingFace.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion en seguridad ofensiva autorizada: el modelo esta declarado para entornos propios o con permiso de prueba, de modo que puede emplearse para reproducir y estudiar escenarios de ataque en laboratorio controlado.
- Estudio de tecnicas de abliteration: al ser un derivado con el comportamiento de rechazo modificado, permite comparar el checkpoint estandar con la variante para analizar que capas o comportamientos se ven afectados.
- Evaluacion de robustez y alineacion: util para medir como cambia la tasa de rechazo, la toxicidad y la utilidad tras eliminar mecanismos de negativa, alimentando pipelines de red teaming.
- Analisis de seguridad multimodal: al conservar la arquitectura image-text-to-text, sirve para estudiar si las modificaciones de rechazo afectan tambien a entradas visuales, un area que el autor reconoce como no evaluada.
- Desarrollo de arneses de evaluacion internos: su licencia MIT y su publicacion en transformers permiten integrarlo en frameworks propios de evaluacion automatizada de seguridad.
- Comparativas de derivados sobre un mismo base: permite estudiar el impacto de distintos ajustes partiendo del mismo checkpoint apex-flash-1, controlando la variable de arquitectura.
- Formacion y divulgacion tecnica: como ejemplo documentado de publicacion de un modelo abliterado a gran escala con licencia permisiva, es material util para discutir practicas de publicacion responsable en open weights.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que esta variante no ha pasado por una evaluacion completa de la suite y que los resultados reportados para apex-flash-1 corresponden al checkpoint estandar, por lo que no deben atribuirse a este derivado. Tambien advierte que los cambios en el comportamiento de rechazo no implican mejoras en rendimiento o fiabilidad en tareas de seguridad. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica para este modelo.

## Requisitos de hardware

- Peso de los parametros: 321.323.031.390 parametros en BF16 equivalen aproximadamente a 642 GB de pesos, coherente con el tamano de repositorio de 642,7 GB.
- VRAM estimada para inferencia en BF16: en torno a 650-700 GB contando pesos y overhead de activaciones y cache KV; requiere nodo multi-GPU.
- VRAM estimada en FP8: aproximadamente 320-350 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 160-180 GB, siempre que existan cuantizaciones compatibles, dato no confirmado oficialmente.
- GPU recomendadas: no disponible en la informacion proporcionada. Por volumen de memoria, el despliegue en BF16 exige agregados de GPU de clase数据中心 como multiples A100 80 GB u H100 80 GB.
- Viabilidad en GPU de consumo: no cabe en una unica GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni siquiera en cuantizaciones agresivas de 4 bits, dado el tamano del modelo.
- Opciones de despliegue: la libreria declarada es transformers; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| apex-flash-1-abliterated | 321.323.031.390 | no disponible | image-text-to-text | MIT | publicado |
| cantina-security/apex-flash-1 | no disponible en la informacion (mismo base) | no disponible | image-text-to-text | MIT (segun el derivado) | publicado |
| Otras variantes abliteradas de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos alternativos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El autor advierte que el modelo esta destinado unicamente a investigacion en seguridad autorizada, en entornos propios o con permiso explicito de prueba.
- La modificacion del comportamiento de rechazo es amplia y no se limita a tareas de seguridad, lo que puede producir respuestas inapropiadas en contextos generales.
- No existe una evaluacion completa del derivado; los resultados de apex-flash-1 no son transferibles a esta variante.
- Los cambios en el rechazo no implican mejoras en el rendimiento de tareas de seguridad ni en la fiabilidad del modelo.
- El rendimiento en imagen y video no ha sido evaluado para esta variante.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo general de los modelos de gran escala.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se declara cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar cargas con requisitos de contexto largo.
- Licencia MIT: permite uso comercial y modificacion, pero el aviso del autor restringe el uso previsto a investigacion autorizada; conviene revisar la responsabilidad legal en despliegues productivos.
- El modelo hereda los riesgos del checkpoint base, incluyendo posibles comportamientos no alineados que la abliteration puede amplificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cantina-security/apex-flash-1-abliterated
- Modelo base en HuggingFace: https://huggingface.co/cantina-security/apex-flash-1
- Pagina del sistema Apex de Cantina: https://www.cantina.security/apex
- Post de lanzamiento de Apex Flash: https://www.cantina.security/apex-flash
- Yeta: https://yeta.ai/
- Yeta en X: https://x.com/yetalabs

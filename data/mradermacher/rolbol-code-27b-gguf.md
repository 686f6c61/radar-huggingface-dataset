# mradermacher/RolBol-Code-27B-GGUF

## Resumen

RolBol Code 27B es un modelo de lenguaje especializado en generación de código y flujos de trabajo agénticos, desarrollado originalmente por RolBolSystems y distribuido en formato GGUF por mradermacher. Con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), se posiciona en la franja de modelos densos de gran tamano pensados para tareas de programación autónoma, razonamiento multi-paso y uso como agente de código. La versión aquí descrita es una cuantización estática del modelo base `RolBolSystems/RolBol-Code-27B`, publicada bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que el repositorio GGUF permite ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), con opciones intermedias recomendadas como Q4_K_M (17,1 GB) y Q5_K_M (19,7 GB). El modelo declara soporte para inglés y multilingüe, y está etiquetado para generación de texto, código, codificación agéntica y codificación autónoma, lo que lo orienta a pipelines de desarrollo asistido y automatización de tareas de programación.

La información pública disponible es limitada: no se detallan la arquitectura interna, la longitud de contexto ni los datos de entrenamiento en la model card proporcionada. Esta ficha recoge únicamente los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer denso, inferido por el tamano y el formato de pesos; no confirmado en la model card) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en el repo i1 |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por el número de parámetros (27,3 B) y el formato de pesos del modelo base (safetensors), se trata presumiblemente de un transformer denso, pero la model card no confirma ni el tipo de atención, ni la presencia de capas MoE, ni innovaciones como decodificación especulativa o atención lineal. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo único verificable es el proceso de cuantización: mradermacher ha generado cuantizaciones estáticas (tipo `static quants`) a partir del modelo base, con `quantize_version: 2` y `output_tensor_quantised: 1`, y ofrece además un repositorio separado con cuantizaciones ponderadas por imatrix (`RolBol-Code-27B-i1-GGUF`) que suelen ofrecer mejor relación calidad/tamano que las estáticas equivalentes. El repositorio tiene un tamano total de 190,7 GB, lo que refleja la suma de todas las variantes publicadas.

## Capacidades

- Generación de texto y código: el modelo está etiquetado explícitamente para `text-generation`, `code` y `coding`.
- Codificación agéntica y autónoma: las etiquetas `agentic` y `autonomous-coding` indican orientación a tareas de varios pasos con uso de herramientas.
- Razonamiento multi-paso: implícito en el uso agéntico declarado, aunque no se documenta un modo "thinking" explícito.
- Soporte multilingüe: declarado en los metadatos (`en`, `multilingual`), sin detalle de idiomas concretos ni niveles de calidad.
- Conversacional: etiqueta `conversational` presente en los metadatos del repositorio.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que sugiere integración con infraestructuras de inferencia tipo endpoint.
- Tool calling / function calling: no confirmado explícitamente en la documentación disponible.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en extensiones de editor para autocompletado, generación de funciones y explicación de código, aprovechando su especialización en código y su tamano de 27B para tareas de mayor complejidad que modelos pequeños.
- Agente autónomo de resolución de issues: gracias a las etiquetas `agentic` y `autonomous-coding`, puede emplearse en pipelines que leen un issue, localizan ficheros relevantes, proponen parches y ejecutan pruebas, con supervisión humana en la fase de merge.
- Generación de tests unitarios: dado un módulo o una función, el modelo puede producir casos de prueba y escenarios de borde, reduciendo el trabajo manual en proyectos con cobertura baja.
- Refactorización asistida: puede reescribir fragmentos de código para mejorar legibilidad o migrar entre versiones de API, siempre con revisión posterior y ejecución de la suite de tests del proyecto.
- Documentación técnica automatizada: generación de docstrings, READMEs y comentarios a partir del código fuente, útil en repositorios heredados con documentación escasa.
- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (17,1 GB) puede ejecutarse en una GPU de consumo de 24 GB (RTX 3090/4090) vía llama.cpp u Ollama, lo que permite uso de código propietario sin enviar datos a servicios externos.
- Automatización de revisión de código en CI: integrado como paso de revisión automática que detecta patrones problemáticos y sugiere cambios antes del merge, usando la cuantización Q5_K_M o Q6_K si el hardware lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,8 GB
  - Q3_K_L: ~15,0 GB
  - IQ4_XS: ~15,8 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 o RTX 6000 Ada (48 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones hasta Q6_K (22,5 GB); Q8_0 requiere 32 GB o más y no cabe en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol Code 27B (esta ficha) | 27,3 B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en código y agentes |
| Modelos densos de ~27-34B de la misma franja | ~27-34 B | variable | variable | GGUF, safetensors | No se dispone de comparación directa publicada |
| Alternativas de código de ~30B | no disponible | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos de benchmarks ni de comparaciones publicadas que permitan establecer una comparativa cuantitativa fiable con alternativas concretas. La comparación queda limitada a la franja de tamano y al formato de distribución.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo, por lo que no puede evaluarse su comportamiento en dominios sensibles.
- Riesgo de alucinación inherente a los modelos de lenguaje; en código puede traducirse en APIs inexistentes o firmas incorrectas, por lo que se recomienda validación con tests.
- Longitud de contexto no documentada: no es posible planificar tareas que requieran ventanas largas sin verificación empírica previa.
- Soporte multilingüe declarado pero sin detalle de idiomas ni evaluación de calidad; el uso en castellano no está garantizado.
- Aunque la licencia es Apache 2.0, conviene revisar la licencia del modelo base y de los datos de entrenamiento antes de un uso comercial en producción.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento en tareas de código; se recomienda Q4_K_M o superior para uso serio.
- La model card no documenta tool calling ni formato de plantilla de chat, lo que exige validación manual antes de integrarlo en frameworks agénticos.
- El repositorio tiene 190,7 GB; conviene descargar solo la cuantización necesaria para evitar consumo innecesario de almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RolBol-Code-27B-GGUF
- Modelo base: https://huggingface.co/RolBolSystems/RolBol-Code-27B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/RolBol-Code-27B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#RolBol-Code-27B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

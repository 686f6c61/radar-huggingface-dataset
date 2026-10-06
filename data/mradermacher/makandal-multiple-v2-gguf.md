# mradermacher/makandal-multiple-v2-GGUF

## Resumen

makandal-multiple-v2-GGUF es la version cuantizada en formato GGUF del modelo jsbeaudry/makandal-multiple-v2, publicada por mradermacher, un creador especializado en convertir modelos de HuggingFace a GGUF para su uso en entornos de inferencia local. El modelo original se presenta como un destilado orientado a asistentes de voz y a la funcion de tool calling, con especial atencion al criollo haitiano (ht) junto con frances, espanol e ingles.

Se trata de un modelo denso de aproximadamente 1.000 millones de parametros (999.885.952 en safetensors), lo que lo situa en la categoria de modelos pequenos aptos para ejecucion en hardware de consumo. Los tags de la model card lo vinculan a la familia Gemma 3 y a un proceso de destilacion, aunque no se detalla la receta de entrenamiento ni el numero de tokens utilizados.

Su relevancia radica en dos factores: por un lado, cubre un idioma poco representado (el criollo haitiano) con soporte declarado para tool calling, algo inusual en modelos de este tamano; por otro, la disponibilidad de cuantizaciones GGUF desde Q2_K hasta f16 facilita el despliegue en CPU, GPUs modestas o incluso dispositivos con recursos limitados. La licencia es la de Gemma, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (familia Gemma 3, segun los tags del modelo; no se detalla en la model card) |
| Parametros totales | 999.885.952 (aproximadamente 1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ht (criollo haitiano), fr, es, en |
| Licencia | gemma |
| Formato de pesos | GGUF (el modelo base original en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna ni el proceso de entrenamiento. Los tags de la model card indican que se trata de un modelo de la familia Gemma 3 sometido a un proceso de destilacion ("distillation", "gemma3"). El modelo base es jsbeaudry/makandal-multiple-v2, y esta publicacion es unicamente una re-cuantizacion estatica realizada por mradermacher, sin cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicacion.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se confirma la presencia de innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, atencion por ventanas, etc.). Cualquier afirmacion al respecto seria especulativa.

## Capacidades

- Generacion de texto conversacional en criollo haitiano, frances, espanol e ingles.
- Orientado a asistentes de voz, segun los tags del modelo ("voice-assistant").
- Soporte declarado de tool calling / function calling ("tool-calling").
- Capacidad de destilacion como estrategia de entrenamiento, lo que sugiere orientacion a tareas concretas mas que a razonamiento general extenso.
- Capacidades multilingues limitadas a los cuatro idiomas listados.
- No se documentan capacidades de vision, audio nativo, modo de razonamiento explicito ni otras funciones especiales en la informacion disponible.

## Casos de uso

- Asistente de voz en criollo haitiano: el modelo esta etiquetado especificamente como "voice-assistant" y soporta ht, por lo que puede integrarse en pipelines de reconocimiento de voz mas generacion de respuesta para atencion en este idioma, poco cubierto por modelos generalistas.
- Agentes con tool calling: gracias al tag "tool-calling", puede usarse como componente de enrutado o de seleccion de herramientas en flujos de agentes multi-paso, siempre que el prompt y el esquema de herramientas se adapten a su tamano reducido.
- Despliegue en el borde (edge) o en dispositivos con poca memoria: las cuantizaciones desde Q2_K (0,8 GB) hasta Q4_K_M (0,9 GB) permiten ejecucion en moviles, Raspberry Pi o portatiles sin GPU dedicada mediante llama.cpp.
- Prototipado rapido de chat multilingue ht/fr/es/en: util como modelo de pruebas para validar interfaces conversacionales antes de escalar a modelos mayores.
- Traduccion asistida entre criollo haitiano, frances y espanol: aunque no se declara explicitamente como modelo de traduccion, su cobertura multilingue lo hace candidato para tareas de reformulacion y traduccion ligera.
- Asistencia educativa o administrativa en Haiti: aplicaciones de soporte a usuarios en criollo haitiano para consultas sencillas, formularios o FAQ, aprovechando el bajo coste de inferencia de un modelo de ~1B.
- Integracion en aplicaciones de escritorio con Ollama o LM Studio: el tamano de las cuantizaciones (menos de 1,2 GB en Q8_0) permite distribuir el modelo como binario ligero dentro de una aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y las busquedas web realizadas no aportan datos numericos verificables para este modelo ni para su base jsbeaudry/makandal-multiple-v2.

## Requisitos de hardware

- VRAM estimada para inferencia (segun el tamano de cada cuantizacion):
  - Q2_K: aproximadamente 0,8 GB
  - Q3_K_S / Q3_K_M: aproximadamente 0,8 GB
  - IQ4_XS: aproximadamente 0,8 GB
  - Q3_K_L: aproximadamente 0,9 GB
  - Q4_K_S / Q4_K_M: aproximadamente 0,9 GB
  - Q5_K_S: aproximadamente 0,9 GB
  - Q5_K_M: aproximadamente 1,0 GB
  - Q6_K: aproximadamente 1,1 GB
  - Q8_0: aproximadamente 1,2 GB
  - f16: aproximadamente 2,1 GB (16 bits por peso; el autor lo describe como "overkill")
- GPU recomendadas: no disponible (no se publican recomendaciones especificas). Por tamano, cualquier GPU con 2-4 GB de VRAM es suficiente; tambien es viable en CPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, series RTX 20/30/40) e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier otro runtime compatible con GGUF. Formato no compatible de forma nativa con vLLM/TGI en su variante GGUF (estos suelen requerir safetensors o AWQ/GPTQ).
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni latencias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el propio modelo base jsbeaudry/makandal-multiple-v2 puede considerarse su equivalente sin cuantizar:

| Modelo | Parametros | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| makandal-multiple-v2-GGUF (esta ficha) | ~1B | GGUF (12 cuantizaciones) | ht, fr, es, en | gemma | HuggingFace |
| jsbeaudry/makandal-multiple-v2 (base) | ~1B | safetensors | ht, fr, es, en | gemma | HuggingFace |

Comparativa con alternativas de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada. Al tratarse de un destilado con foco en criollo haitiano, podria heredar los sesgos de su modelo profesor (Gemma 3) y del dataset de destilacion, pero esto no esta confirmado.
- Riesgo de alucinacion: no cuantificado; es esperable en modelos de ~1B, especialmente en tareas de razonamiento complejo, matematicas o conocimiento factual extenso.
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no puede garantizarse un comportamiento fiable en conversaciones de muchos turnos o documentos largos.
- Limitaciones de idioma: el soporte se declara para ht, fr, es y en; otros idiomas no estan cubiertos oficialmente y probablemente degraden la calidad.
- Restricciones de licencia: la licencia es "gemma", sujeta a los terminos de uso de Google para la familia Gemma. Es imprescindible revisar dichos terminos antes de cualquier uso comercial o redistribucion.
- Caveat de produccion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye evaluaciones publicadas; se recomienda validar el modelo en el dominio concreto antes de integrarlo en produccion.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como opciones rapidas y equilibradas, y Q6_K o Q8_0 si prima la calidad.
- No hay cuantizaciones ponderadas ni imatrix disponibles, segun indica la propia model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/makandal-multiple-v2-GGUF
- Modelo base: https://huggingface.co/jsbeaudry/makandal-multiple-v2
- Pagina general de descargas del autor: https://hf.tst.eu/model#makandal-multiple-v2-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

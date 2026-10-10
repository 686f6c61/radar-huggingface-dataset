# mradermacher/Firefly-v5-alpha-testing-GGUF

## Resumen

Firefly-v5-alpha-testing-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Guilherme34/Firefly-v5-alpha-testing, publicada por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para su uso en llama.cpp y herramientas compatibles. El modelo base es un transformer de aproximadamente 4,65 mil millones de parametros, etiquetado con el tag "gemma4", lo que apunta a una arquitectura derivada de la familia Gemma.

El modelo esta orientado a tareas de razonamiento, uso de herramientas (tool-use y function-calling) y conversacion, e incluye soporte multimodal mediante ficheros mmproj (proyector vision-lenguaje). Ademas, esta marcado como "abliterated", es decir, se han eliminado o atenuado las direcciones de rechazo del modelo original, lo que cambia su comportamiento ante peticiones que otros modelos rechazarian.

La relevancia de esta publicacion es practica: al ofrecer cuantizaciones desde Q2_K (3,1 GB) hasta f16 (9,4 GB), permite ejecutar un modelo de ~4,65B con capacidades de razonamiento y tool calling en hardware de consumo. Se trata, no obstante, de una version "alpha testing" y sin informacion publica sobre contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "gemma4" sugiere un transformer derivado de Gemma 4; no se detalla en la model card) |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors a traves de transformers |

## Arquitectura y entrenamiento

La model card del repositorio GGUF no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico inferible es que se trata de un transformer (los tags incluyen "transformers" y "gemma4"), con aproximadamente 4,65 mil millones de parametros, y que el modelo base fue procesado con Unsloth (tag "unsloth") antes de la cuantizacion.

El rasgo tecnico mas destacable documentado es la condicion de "abliterated": el modelo ha sido modificado para eliminar las direcciones de rechazo, lo que implica una perdida deliberada de los mecanismos de negativa aprendidos durante la alineacion. Tambien se incluyen ficheros mmproj, lo que confirma que el modelo incorpora un proyector multimodal para entrada de imagenes. No se dispone de informacion sobre innovaciones adicionales (atencion lineal, decodificacion especulativa, atencion local/global, etc.).

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento (tag "reasoning"): el modelo esta etiquetado explicitamente para tareas de razonamiento.
- Uso de herramientas: soporta tool-use y function-calling, adecuado para agentes que invocan APIs o funciones externas.
- Capacidades multimodales: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que habilita entrada de imagenes.
- Conversacion multi-turno (tag "conversational").
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo original rechazaria.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Idiomas: unicamente ingles segun la model card; no se declara soporte multilingue.
- No se documentan capacidades de audio, codigo o matematicas de forma explicita mas alla de lo que implican los tags de razonamiento y tool-use.

## Casos de uso

- Agentes con function calling: el modelo puede integrarse en bucles de agente que invocan funciones o APIs externas gracias a su soporte declarado de tool-use y function-calling, con un tamano de 4,65B que permite despliegue local.
- Asistentes conversacionales en ingles: gestion de dialogos multi-turno en aplicaciones de soporte o interfaz de usuario, ejecutables en una GPU de consumo con cuantizacion Q4_K_M (3,5 GB).
- Prototipado rapido en local: con la cuantizacion Q4_K_S o Q4_K_M (etiquetadas como "fast, recommended"), es viable montar un entorno de pruebas en un portatil con GPU de 6-8 GB.
- Investigacion sobre alineacion y comportamiento abliterated: util para estudiar como varia la tasa de rechazo y la calidad de respuesta al eliminar direcciones de rechazo, comparando contra el modelo base.
- Procesamiento de imagenes con texto (vision-lenguaje): mediante los ficheros mmproj, se puede usar para tareas basicas de descripcion o consulta sobre imagenes, siempre que el runtime (llama.cpp) soporte el proyector.
- Evaluacion de cuantizaciones: los multiples niveles (Q2_K a f16) permiten medir el impacto de la cuantizacion en la calidad de razonamiento y en el cumplimiento de llamadas a herramientas.
- Generacion de codigo asistida por herramienta: aunque no se declara explicitamente, el soporte de function-calling permite conectarlo a ejecutores de codigo o linters en pipelines automatizados.
- Despliegue en edge o entornos con VRAM limitada: la version Q2_K (3,1 GB) permite ejecucion en GPUs de gama baja o incluso CPU, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin contar cache de contexto ni overhead del runtime):
  - Q2_K: 3,1 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,2 / 3,3 / 3,4 GB
  - IQ4_XS: 3,4 GB
  - Q4_K_S / Q4_K_M: 3,5 GB (recomendadas por el autor por equilibrio velocidad/calidad)
  - Q5_K_S / Q5_K_M: 3,7 GB
  - Q6_K: 3,9 GB
  - Q8_0: 5,1 GB
  - f16: 9,4 GB (calificada por el autor como "overkill")
  - Componente multimodal: mmproj-Q8_0 (0,7 GB) o mmproj-f16 (1,1 GB) adicionales si se usa vision.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantizaciones Q4 con contexto moderado; RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 o superiores para Q8_0 y f16 con contexto amplio.
- Cabe en GPU de consumo: si. Q4_K_M (3,5 GB) entra holgadamente en tarjetas de 6-8 GB; las versiones Q8_0 y f16 requieren 8-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; servidores tipo llama.cpp server para exponer un endpoint compatible con la API de OpenAI. El modelo base puede servirse tambien con transformers (safetensors).
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.
- Tamano del repositorio completo: 49,6 GB (incluye todas las cuantizaciones y los ficheros mmproj).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Firefly-v5-alpha-testing-GGUF (este) | ~4,65B | no disponible | GGUF | gemma | Cuantizaciones de mradermacher, abliterated, multimodal via mmproj |
| Guilherme34/Firefly-v5-alpha-testing (base) | ~4,65B | no disponible | safetensors | gemma | Modelo original sin cuantizar |
| mradermacher/Firefly-v5-alpha-testing-i1-GGUF | ~4,65B | no disponible | GGUF | gemma | Variante con cuantizaciones ponderadas/imatrix |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para establecer una comparacion de rendimiento fiable |

No se dispone de resultados de benchmarks publicados para este modelo ni para su base, por lo que no es posible una comparacion cuantitativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo marcado como "alpha testing": no es una version estable ni validada para produccion.
- Condicion "abliterated": implica que el modelo puede generar contenido que otros modelos rechazarian; requiere revision y filtrado adicional en cualquier despliegue publico.
- Sin datos de benchmarks: no se puede estimar su calidad real en razonamiento, codigo o matematicas.
- Longitud de contexto desconocida: dificulta planificar casos de uso con documentos largos o conversaciones extensas.
- Idiomas: declarado unicamente en ingles; el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion: inherente a los modelos de esta escala y no mitigado de forma documentada.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al tratarse de un modelo abliterated, la eliminacion de rechazos puede amplificar respuestas sesgadas o inapropiadas.
- Licencia "gemma": el uso comercial y la redistribucion estan sujetos a los terminos de la licencia de Gemma, que impone obligaciones especificas (incluidas clausulas de uso aceptable). Es necesario revisarla antes de cualquier despliegue comercial.
- Cuantizaciones muy agresivas (Q2_K, Q3_K_S) degradan la calidad; el propio autor califica Q3_K_M como "lower quality".
- La funcionalidad multimodal depende del soporte del runtime para los ficheros mmproj; no todos los motores la implementan por igual.
- Repositorio de gran tamano (49,6 GB): conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Firefly-v5-alpha-testing-GGUF
- Modelo base: https://huggingface.co/Guilherme34/Firefly-v5-alpha-testing
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Firefly-v5-alpha-testing-i1-GGUF
- Pagina resumen y lista de descargas: https://hf.tst.eu/model#Firefly-v5-alpha-testing-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/

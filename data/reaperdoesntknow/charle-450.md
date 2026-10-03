# reaperdoesntknow/charle-450

## Resumen

charle-450 es un modelo de generacion de texto publicado en HuggingFace por el usuario reaperdoesntknow. Se trata de un checkpoint de aproximadamente 410 millones de parametros (410.256.184 exactos, segun los pesos en safetensors) subido a finales de 2026, sin model card util: el README es la plantilla autogenerada de HuggingFace y no contiene ninguna seccion completada. Como consecuencia, no hay informacion publica sobre el desarrollador real, el dataset de entrenamiento, el regimen de entrenamiento ni los objetivos del modelo.

El unico indicio tecnico relevante son las etiquetas del repositorio. Ademas de las genericas de transformers (`text-generation`, `safetensors`), aparece la etiqueta `tamelm_two_axis` y `custom_code`. Esto sugiere una arquitectura propia (probablemente denominada TamELM con algun esquema de dos ejes) que requiere cargar codigo remoto con `trust_remote_code=True`, una practica que limita la compatibilidad con runtimes de inferencia estandar. La referencia a `arxiv:1910.09700` es el paper de Lacoste et al. sobre calculo de emisiones de carbono, citado en la plantilla automatica de HuggingFace, y no un paper del modelo.

La relevancia practica es limitada en su estado actual: cero descargas, cero likes, licencia sin especificar y ausencia total de documentacion. Resulta util como caso de estudio de checkpoints opacos en el Hub, pero no es recomendable para uso en produccion sin una evaluacion propia previa y sin resolver la cuestion de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `tamelm_two_axis` sugiere una arquitectura personalizada; requiere `custom_code`) |
| Parametros totales | 410.256.184 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria declarada | transformers |
| Tamano del repositorio | 1.6 GB |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura. La model card no rellena la seccion "Model Architecture and Objective" y las etiquetas del repositorio son el unico dato disponible: `tamelm_two_axis` apunta a un diseno propio del autor (no a una familia conocida como Llama, Mistral, Qwen o Pythia) y `custom_code` indica que el modelo necesita codigo Python incluido en el repositorio para instanciarse, por lo que no funciona con `AutoModelForCausalLM` estandar. El peso del repositorio (1.6 GB para 410 M de parametros) es consistente con un guardado en precision de 32 bits, aunque esto es una inferencia aritmetica y no un dato confirmado por el autor.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, tecnicas de alineamiento (RLHF, DPO, SFT) ni innovaciones tecnicas. La model card incluye la plantilla habitual de HuggingFace con todos los campos marcados como "[More Information Needed]", incluido el regimen de entrenamiento (fp32, fp16, bf16) y el impacto ambiental. No se ha publicado ningun paper, informe tecnico ni entrada de blog asociada.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada, derivada del pipeline declarado (`text-generation`).
- Capacidades de razonamiento, codigo o matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con runtimes estandar: limitada por el uso de `custom_code`; requiere cargar el codigo del repositorio.

## Casos de uso

Dado que no existe documentacion sobre el modelo, los casos de uso solo pueden plantearse como escenarios a validar experimentalmente, nunca como aplicaciones recomendadas:

- Experimentacion con arquitecturas personalizadas: el tag `tamelm_two_axis` sugiere un diseno propio; seria util unicamente para quien quiera estudiar el codigo de definicion del modelo incluido en el repositorio y compararlo con transformers estandar.
- Pruebas de integracion en pipelines de transformers: permite comprobar como se comporta `trust_remote_code=True` en entornos controlados, aislando el codigo del repositorio antes de ejecutarlo.
- Fine-tuning academico sobre un checkpoint pequeno: con 410 M de parametros y ~1.6 GB en disco, es abordable en una sola GPU consumer, aunque el punto de partida (calidad del checkpoint base) es desconocido.
- Investigacion sobre checkpoints opacos en el Hub: sirve como ejemplo de buenas y malas practicas de documentacion de modelos para trabajos de reproducibilidad.
- Evaluacion comparativa de modelos de ~400 M: se podria incluir en un banco de pruebas junto a alternativas documentadas, siempre que se establezca primero una linea base de perplejidad y coherencia.
- Prototipado offline en hardware modesto: si se confirma que el modelo funciona, su tamano permite ejecutarlo en CPU o en GPU de gama media para demos locales sin coste de API.
- Ensenanza de despliegue de LLM: util para ilustrar el proceso de conversion a GGUF, cuantizacion y despliegue, dado el tamano reducido del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion "Evaluation" cumplimentada y no hay ningun informe externo, leaderboard ni entrada de blog que reporte metricas para charle-450. No se debe asumir ningun nivel de rendimiento en MMLU, HumanEval, GSM8K ni en ninguna otra prueba.

## Requisitos de hardware

Las siguientes cifras son estimaciones aritmeticas basadas en el numero de parametros (410.256.184) y no en mediciones publicadas por el autor:

- Pesos en fp32: aproximadamente 1,64 GB (coincide con el tamano del repositorio).
- Pesos en fp16 o bf16: aproximadamente 0,82 GB.
- Pesos en int8: aproximadamente 0,41 GB.
- Pesos en int4: aproximadamente 0,21 GB.
- VRAM total necesaria: el peso de los pesos mas la cache KV. La cache KV no se puede estimar porque se desconoce la longitud de contexto y el numero de capas y cabezas de atencion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, RTX 4060); para fp32 se recomienda un minimo de 4-6 GB (RTX 3060, RTX 4090 sin problema). No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en CPU con suficiente RAM.
- Opciones de despliegue: vLLM, TGI y llama.cpp u Ollama solo si previamente se soporta la arquitectura personalizada. La etiqueta `custom_code` implica que vLLM y TGI pueden rechazar el modelo salvo que se anada soporte explicito. No hay GGUF publicado, por lo que Ollama requeriria una conversion propia cuyo exito no esta garantizado sin conocer la arquitectura.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento de charle-450, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Las cifras de los modelos alternativos corresponden a su documentacion publica habitual.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| charle-450 | 410.256.184 | no disponible | no disponible | safetensors, requiere custom_code |
| Pythia-410M | ~410 M | 2048 tokens | Apache 2.0 | safetensors, transformers estandar |
| OPT-350M | ~331 M | 2048 tokens | licencia OPT (con restricciones) | safetensors, transformers estandar |
| TinyLlama-1.1B | ~1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF, transformers estandar |

La diferencia fundamental no es de tamano sino de trazabilidad: las tres alternativas cuentan con model card completa, paper o informe tecnico, licencia explicita y resultados de evaluacion publicos, mientras que charle-450 no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada sin ningun campo completado, por lo que se desconoce el origen de los datos de entrenamiento, el proceso de filtrado y las intenciones del autor.
- Licencia sin especificar: no se puede determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no hay autorizacion clara para reutilizacion.
- Riesgo de alucinacion: no evaluado. Sin benchmarks ni evaluaciones de seguridad, no hay ninguna garantia de fidelidad factual.
- Sesgos: no evaluados. Un modelo entrenado con datos desconocidos puede reproducir sesgos de genero, raza, religion o ideologia sin que exista documentacion al respecto.
- Idiomas: se desconoce que lenguas soporta y con que calidad. No se debe asumir un buen rendimiento en castellano.
- Riesgo de seguridad del codigo: la etiqueta `custom_code` implica la ejecucion de codigo Python alojado en el repositorio. Cargar el modelo con `trust_remote_code=True` ejecuta ese codigo en la maquina local; es imprescindible auditar los ficheros `.py` antes de instanciarlo.
- Incompatibilidad con tooling estandar: al no ser una arquitectura de transformers conocida, es probable que falle en vLLM, TGI, Ollama y en cualquier herramienta que dependa de `AutoConfig`.
- Contexto desconocido: sin longitud de contexto declarada, no se pueden disenar aplicaciones que dependan de ventanas largas ni estimar el consumo de memoria de la cache KV.
- Estado del repositorio: cero descargas y cero likes en la fecha de consulta, sin evidencia de que el modelo haya sido validado por terceros.
- Resultados de busqueda no relacionados: las busquedas web devuelven resultados sobre una herramienta no relacionada ("Xeno"), sin ninguna conexion con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/charle-450
- Paper citado en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de ML: https://mlco2.github.io/impact
- Repositorio, paper, demo o blog del autor: no disponible
- Los resultados de busqueda web obtenidos no guardan relacion con el modelo y no se incluyen.

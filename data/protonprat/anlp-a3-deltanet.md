# ProtonPrat/anlp-a3-deltanet

## Resumen

`ProtonPrat/anlp-a3-deltanet` es un modelo de investigacion de muy pequeno tamano (3.453.467 parametros) publicado en Hugging Face por el usuario ProtonPrat. Se trata de un etiquetador causal de caracteres (causal character tagger) entrenado para una tarea de descifrado de cifrados (cipher decryption) en el marco de la asignatura ANLP Monsoon 2026, asignacion 3. No es un modelo de proposito general ni un LLM conversacional, sino un experimento academico con una tarea y un conjunto de datos muy acotados.

La arquitectura empleada es DeltaNet, un modelo de estado recurrente con atencion lineal, configurado con el patron de capas `DDDD` (cuatro capas DeltaNet, sin capas de atencion ni de Mamba). El modelo tiene un ancho de 256 y se distribuye en formato safetensors con pesos en PyTorch. El repositorio no incluye pipeline, licencia ni idiomas declarados, y no registra descargas ni likes en el momento de la consulta.

Su relevancia es exclusivamente academica y metodologica: sirve como ejemplo de aplicacion de arquitecturas recurrentes lineales (DeltaNet) a una tarea de etiquetado secuencial a nivel de caracter. Los resultados reportados por el autor son muy bajos (precision de caracter de validacion 0,1862 y precision de palabra de 0,0153), lo que sugiere que el modelo no esta convergido o que la tarea es extremadamente dificil con esta configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet (modelo de estado recurrente con atencion lineal), patron de capas `DDDD` |
| Parametros totales | 3.453.467 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura DeltaNet, una familia de modelos de estado recurrente (recurrent state models) que sustituye la atencion cuadratica clasica por una actualizacion lineal del estado con reglas de tipo delta. El autor especifica el patron de capas `DDDD`, es decir, cuatro capas DeltaNet consecutivas, sin intercalar capas de atencion (T) ni de Mamba (M). El ancho del modelo es 256, lo que da lugar a los 3.453.467 parametros totales. La tarea es un etiquetado causal a nivel de caracter orientado al descifrado de cifrados.

Los datos de entrenamiento corresponden a `data_new` de la asignacion 3 de ANLP Monsoon 2026. No se dispone de informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal concreta, etc.). El autor indica que el modelo debe cargarse con `src.part1.checkpoint.load_checkpoint` del repositorio de la asignacion, lo que implica que la definicion de la arquitectura y la tokenizacion no estan incluidas en el repositorio de Hugging Face.

## Capacidades

- Etiquetado causal de caracteres para descifrado de cifrados: el modelo predice etiquetas por caracter en una secuencia, orientado a la tarea de la asignacion.
- Modelado de dependencias secuenciales mediante estado recurrente lineal (DeltaNet).
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue.
- No se ha documentado modo thinking, vision ni audio.
- No es un modelo de generacion de texto libre ni un modelo conversacional.

## Casos de uso

- Descifrado de cifrados simples en entornos academicos: el modelo puede emplearse como etiquetador por caracter para reconstruir texto plano a partir de texto cifrado, siempre que se disponga del pipeline de carga y del vocabulario de la asignacion.
- Experimentacion con arquitecturas DeltaNet: sirve como banco de pruebas de bajo coste (3,45 M de parametros) para estudiar el comportamiento de modelos de estado recurrente en tareas de etiquetado secuencial.
- Reproduccion de resultados academicos: util para verificar la precision de caracter (0,1862) y de palabra (0,0153) reportadas por el autor en el contexto del curso ANLP Monsoon 2026.
- Comparacion de patrones de capas: al fijar el patron `DDDD`, permite contrastar con variantes que intercalen capas de atencion (T) o Mamba (M) en la misma tarea.
- Docencia y evaluacion: adecuado como ejemplo de modelo pequeno con pesos en safetensors para practicas de carga de checkpoints y evaluacion de metricas a nivel de caracter y palabra.
- Prototipado de pipelines de descifrado: puede integrarse en un pipeline de preprocesado y postprocesado para experimentar con tokenizacion a nivel de caracter, dado su bajo coste computacional.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de caracter (validacion) | 0,1862 |
| Precision de palabra (validacion) | 0,0153 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,45 M de parametros equivalen a unos 13,8 MB de pesos en fp32; el resto del consumo depende del estado recurrente y del tamano de lote).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe en CPU sin problemas.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria, e incluso en CPU.
- Opciones de despliegue: al ser un checkpoint PyTorch con safetensors y requerir `src.part1.checkpoint.load_checkpoint` del repositorio de la asignacion, el despliegue esta ligado a ese codigo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProtonPrat/anlp-a3-deltanet | 3.453.467 | no disponible | Etiquetado de caracteres para descifrado | no disponible | Hugging Face (repo publico) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Precision muy baja: 0,1862 a nivel de caracter y 0,0153 a nivel de palabra en validacion, lo que indica que el modelo no es fiable para descifrado en produccion.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset `data_new`.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero el etiquetado por caracter puede producir salidas incorrectas sin senal de confianza.
- Limitaciones de contexto o idioma: no se documenta la longitud de contexto ni los idiomas soportados.
- Restricciones de licencia: la licencia no esta declarada, por lo que no se puede asumir uso comercial.
- Dependencia del codigo de la asignacion: la carga requiere `src.part1.checkpoint.load_checkpoint` del repositorio del curso, lo que limita la portabilidad.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- No es un modelo de proposito general: no debe emplearse como LLM conversacional ni para tareas fuera del etiquetado de caracteres.

## Enlaces

- Hugging Face: https://huggingface.co/ProtonPrat/anlp-a3-deltanet
- Repositorio de la asignacion (referenciado como `src.part1.checkpoint.load_checkpoint`): no disponible como URL directa en la informacion proporcionada.
- Paper de DeltaNet: no disponible en la informacion proporcionada.
- Blog o demo: no disponible en la informacion proporcionada.

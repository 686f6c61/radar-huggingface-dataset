# kartheekbatchu/fraud-detector

## Resumen

kartheekbatchu/fraud-detector es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado en HuggingFace por el usuario kartheekbatchu. Segun la model card, el entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL de HuggingFace, y el repositorio esta etiquetado como generated_from_trainer. El nombre del modelo sugiere un proposito de deteccion de fraude, pero la model card no documenta ni el conjunto de datos, ni la tarea concreta, ni metricas de evaluacion que respalden esa finalidad.

El interes tecnico del modelo es limitado pero relevante como caso de estudio: se trata de un ejemplo de fine-tune de un LLM pequeno (1,5 B de parametros, arquitectura transformer decoder-only de la familia Qwen2) sobre infraestructura estandar de transformers y TRL. El tamano del repositorio figura como 0.0 GB, con 0 descargas y 0 likes, lo que sugiere que los pesos podrian no estar subidos o que se trata de un artefacto de prueba; este punto no puede confirmarse con la informacion disponible.

La relevancia practica es escasa en su estado actual: no hay licencia declarada (el campo del card contiene un placeholder), no hay idiomas declarados, no hay benchmarks y la propia model card conserva la plantilla generica de TRL, incluido un ejemplo de uso que plantea una pregunta ajena por completo al dominio del fraude. Para cualquier evaluacion seria seria necesario inspeccionar el repositorio completo y verificar la existencia y el contenido de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base Qwen2.5-1.5B-Instruct; no documentada de forma explicita en la model card del fine-tune |
| Parametros totales | 1,54 B (correspondientes al modelo base declarado Qwen2.5-1.5B-Instruct; no confirmado para este fine-tune) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; extensible a 131.072 tokens con RoPE scaling tipo YaRN. No confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible en el repositorio. Al publicarse en transformers/safetensors, es cuantizable a posteriori a GGUF, GPTQ o AWQ con herramientas externas |
| Idiomas soportados | no disponible para el fine-tune. El modelo base Qwen2.5-1.5B-Instruct esta entrenado en mas de 29 idiomas |
| Licencia | no disponible. El campo del card contiene el placeholder "licence: license". El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (tag declarado). Tamano del repositorio: 0.0 GB, lo que impide verificar que los pesos esten efectivamente subidos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base declarado, Qwen2.5-1.5B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings posicionales rotatorios (RoPE) y atencion con query grouping (GQA), que reduce el numero de cabezas de clave/valor respecto a las cabezas de consulta para disminuir el coste de memoria en inferencia. El fine-tune no introduce cambios arquitectonicos documentados; se trata de un ajuste de pesos sobre el modelo base ya instruido.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO posteriores, ni hiperparametros como learning rate, epocas o estrategia de enmascarado de perdida. La model card no incluye seccion de resultados, curvas de perdida ni evaluacion cualitativa, por lo que no es posible verificar que el ajuste haya tenido efecto alguno sobre el comportamiento del modelo base ni que este especializado en deteccion de fraude.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base instruido.
- Razonamiento basico, matematicas elementales y generacion de codigo, en el rango esperable para un modelo denso de 1,5 B de parametros.
- Seguimiento de instrucciones y de formatos de salida, propio de un modelo Instruct.
- Capacidad multilingue limitada heredada del base (Qwen2.5 cubre mas de 29 idiomas), sin confirmacion para este fine-tune.
- Soporte de tool calling: no documentado en este repositorio. El modelo base Qwen2.5-Instruct si soporta function calling, pero el fine-tune no declara conservarlo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo de razonamiento explicito (thinking): no disponible.
- Vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Deteccion de fraude: no hay evidencia documentada de esta capacidad. El nombre del modelo no va acompanado de dataset, taxonomia de fraude, formato de salida ni metricas.

## Casos de uso

Los siguientes casos son escenarios plausibles dado el tamano y la familia del modelo, pero no estan respaldados por ninguna evaluacion publicada. Deben tratarse como hipotesis de trabajo, no como capacidades verificadas.

- Triaje de alertas de fraude en tiempo casi real: un modelo de 1,5 B puede ejecutarse en una sola GPU de gama media o incluso en CPU, lo que permite clasificar alertas generadas por reglas del motor antifraude antes de escalarlas a un analista humano. El contexto de 32.768 tokens del modelo base permitiria incluir el historial de transacciones del usuario en el prompt.
- Generacion de resumenes de expedientes de disputa: dado un conjunto de transacciones, correos y notas de investigacion, el modelo puede producir un resumen estructurado para el equipo de back office.
- Explicabilidad asistida para cumplimiento normativo: redactar borradores de justificacion de bloqueos o rechazos a partir de los campos de la alerta, revisables despues por un responsable de cumplimiento.
- Clasificacion de tickets de soporte relacionados con cargos no reconocidos, enrutandolos a la cola adecuada segun el tipo de disputa.
- Extraccion de entidades de correos de reclamacion (importes, fechas, comercios, ultimos digitos de tarjeta) mediante prompts estructurados, para alimentar un sistema de gestion de casos.
- Prototipado rapido de asistentes internos para equipos de riesgo: al ser un modelo pequeno y de licencia permisiva en su base, permite iterar en local sin coste de API.
- Filtrado previo de narrativas sospechosas en formularios de reclamacion, marcando textos para revision manual.
- Generacion de datos sinteticos de ejemplo para pruebas de pipelines antifraude, siempre con supervision y validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (1,54 B de parametros), unos 1,6 GB en int8 y entre 1,0 y 1,2 GB en cuantizaciones de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16, como RTX 3050, RTX 3060, RTX 4060, T4 o L4. Para mayor throughput, A10G, L40S, A100 o H100 admiten lotes grandes y despliegue concurrente.
- Cabe en GPU de consumo: si. Una RTX 4090, 4080, 3090 o incluso una RTX 3060 de 12 GB pueden ejecutar el modelo con margen amplio, tambien con contexto largo.
- Ejecucion en CPU: viable con llama.cpp u Ollama en cuantizacion Q4, con latencias del orden de decenas de tokens por segundo en procesadores modernos de escritorio.
- Opciones de despliegue: transformers con pipeline, vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y servidores compatibles con la API de OpenAI. La etiqueta endpoints_compatible del repositorio sugiere compatibilidad con inference endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y no es posible calcularlas sin acceso a los pesos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kartheekbatchu/fraud-detector | 1,54 B (heredados) | 32.768 tokens (heredados) | no disponible | Repositorio de 0.0 GB, 0 descargas; pesos no verificados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens, extensible a 131.072 | Apache-2.0 | Publico, ampliamente utilizado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Publico, requiere aceptar terminos |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | Publico, requiere aceptar terminos |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens, extensible a 131.072 | Qwen Research License | Publico, con restricciones de uso comercial |

No hay datos de rendimiento comparado para el modelo objeto de esta ficha, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni la tarea objetivo. No hay ninguna evidencia de que el modelo detecte fraude mejor que su modelo base.
- El ejemplo de uso incluido en la model card es la plantilla generica de TRL y plantea una pregunta sobre viajes en el tiempo, sin relacion con el dominio financiero. Esto indica que la card no fue personalizada.
- El tamano del repositorio figura como 0.0 GB. Es posible que los pesos no esten subidos, que el repositorio contenga solo un adaptador o que el artefacto este incompleto. Debe verificarse antes de cualquier integracion.
- Licencia sin definir: el campo del card contiene el placeholder "licence: license". No hay autorizacion explicita de uso comercial para el artefacto derivado, aunque el modelo base sea Apache-2.0. Ante la duda, conviene contactar con el autor.
- Riesgo de alucinacion: inherente a un modelo de 1,5 B de parametros. En un dominio sensible como el fraude, cualquier salida debe validarse con reglas deterministas y supervision humana.
- Sesgos: no evaluados. El modelo base Qwen2.5 presenta sesgos conocidos derivados de sus datos de preentrenamiento en web, y el fine-tune no declara ningun proceso de mitigacion.
- Limitaciones idiomaticas: no se declaran idiomas soportados para el fine-tune. Si el ajuste se realizo solo en ingles, el rendimiento en castellano podria degradarse respecto al modelo base.
- Ventana de contexto: 32.768 tokens heredados, suficientes para historiales de transacciones moderados, pero no para volcados completos de bases de datos ni para analisis de documentos extensos sin estrategias de recuperacion.
- Ausencia de versionado y mantenimiento: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado con tres segundos de diferencia, lo que apunta a un artefacto experimental sin mantenimiento.
- Para produccion en deteccion de fraude, un LLM de este tamano no sustituye a un sistema de scoring supervisado ni a reglas de negocio auditables; como mucho puede actuar como capa auxiliar de explicacion o triaje.
- Las versiones de las librerias declaradas (TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128) corresponden a un entorno que puede no ser reproducible con las versiones actuales de los repositorios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kartheekbatchu/fraud-detector
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de Qwen2.5 (referencia del modelo base): https://arxiv.org/abs/2412.15115
- No se han encontrado articulos, blogs, demos ni papers especificos de este modelo en la busqueda web realizada. Los resultados obtenidos no guardan relacion con el modelo.

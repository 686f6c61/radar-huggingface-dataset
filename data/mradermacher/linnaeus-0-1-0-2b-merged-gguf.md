# mradermacher/Linnaeus-0.1.0-2B-merged-GGUF

## Resumen

Linnaeus-0.1.0-2B-merged-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por mradermacher a partir del modelo pi-dal/Linnaeus-0.1.0-2B-merged. No se trata de un modelo nuevo: el trabajo de mradermacher consiste en convertir los pesos originales a GGUF y ofrecer múltiples niveles de cuantización (de x-f16 a Q2_K) para facilitar su ejecución en CPU y GPU de gama baja mediante llama.cpp y herramientas compatibles.

El modelo subyacente tiene 1.942.655.296 parámetros (aproximadamente 1,94 mil millones), lo que lo sitúa en la categoría de modelos pequeños orientados a despliegue local. Según el repositorio de GitHub del autor original, el entrenamiento se realizó sobre una NVIDIA RTX 4090 alquilada, con una receta que combina un LoRA de rango 8 junto con una cabeza de decisión y un objetivo conjunto de RLCD más entropía cruzada, durante 3.600 pasos y unas 3,4 horas de GPU, seleccionando el checkpoint por exactitud macro de desarrollo.

La relevancia de esta ficha es limitada pero concreta: se trata de una conversión comunitaria reciente, sin descargas ni likes, cuya model card no documenta idiomas, licencia, contexto ni capacidades más allá de la etiqueta "conversational". Cualquier evaluación seria del modelo debe partir del repositorio original de pi-dal, ya que la información publicada por el cuantizador es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base pi-dal/Linnaeus-0.1.0-2B-merged; numero de capas, atencion y detalles internos no disponibles) |
| Parametros totales | 1.942.655.296 (~1,94 mil millones) |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo original |
| Tamano del repositorio | 19,6 GB (incluye todas las cuantizaciones) |
| Etiquetas declaradas | gguf, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo, solo indica que es una cuantizacion estatica de pi-dal/Linnaeus-0.1.0-2B-merged. La informacion disponible sobre el entrenamiento procede del README del proyecto original en GitHub: Linnaeus-0.1.0-2B se entrenó en una NVIDIA RTX 4090 alquilada siguiendo la receta upstream sin modificaciones, con un LoRA de rango 8 más una cabeza de decisión, un objetivo conjunto de RLCD (reinforcement learning) y entropía cruzada, 3.600 pasos de entrenamiento y aproximadamente 3,4 horas de GPU. El checkpoint final se eligió por exactitud macro sobre el conjunto de desarrollo.

La presencia de una cabeza de decisión y la selección por exactitud macro sugieren que el ajuste está orientado a tareas de decisión o clasificación más que a generación abierta pura, aunque la etiqueta "conversational" del repositorio GGUF apunta a un uso conversacional. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el modelo base previo al ajuste ni sobre técnicas de decodificación especulativa o atención lineal. El proceso aplicado por mradermacher es exclusivamente de conversión y cuantizacion (quantize_version 2, convert_type hf, output_tensor_quantised 1), sin reentrenamiento.

## Capacidades

- Generacion de texto conversacional: la unica capacidad declarada explicitamente en el repositorio es la etiqueta "conversational".
- Tareas de decision o clasificacion: el entrenamiento original incluye una cabeza de decision y la seleccion del checkpoint se hizo por exactitud macro, lo que apunta a este tipo de tareas, aunque no se documenta el dominio concreto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Vision, audio o modos especiales (thinking mode, cadena de pensamiento): no disponible.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta endpoints_compatible, lo que indica que puede desplegarse en infraestructura de inferencia compatible con GGUF.

## Casos de uso

- Prototipado local en equipos sin GPU dedicada: al estar disponible en cuantizaciones Q4_K_M y Q2_K, el modelo puede ejecutarse en CPU con llama.cpp u Ollama para validar flujos conversacionales basicos antes de escalar a modelos mayores.
- Tareas de clasificacion o decision supervisada: dado que el ajuste original incorpora una cabeza de decision y se evaluo con exactitud macro, es candidato razonable para experimentos de etiquetado o enrutado, siempre validando primero el comportamiento real del modelo.
- Aplicaciones de borde (edge) con requisitos de memoria muy bajos: la cuantizacion Q2_K permite desplegar el modelo en dispositivos con pocos gigabytes de RAM, util para demos offline o entornos aislados.
- Generacion de texto asistida en herramientas de escritorio: integrable en LM Studio, text-generation-webui o cualquier cliente compatible con GGUF para redaccion y resumen de textos cortos.
- Experimentacion academica con tecnicas de cuantizacion: el repositorio ofrece doce niveles distintos de cuantizacion del mismo modelo, lo que permite medir el impacto de la cuantizacion en la calidad de salida manteniendo constantes los pesos originales.
- Base para ajuste fino posterior: con ~1,94 mil millones de parametros, es viable reentrenar o aplicar LoRA sobre el modelo original en una unica GPU de consumo, usando este repositorio como referencia de despliegue.
- Evaluacion comparativa interna: util como linea base de bajo coste en pruebas A/B frente a modelos de tamano similar, teniendo en cuenta que no hay benchmarks publicados.

En todos los casos anteriores, la ausencia de documentacion sobre licencia, idiomas y capacidades reales obliga a validar el comportamiento antes de cualquier uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye ninguna tabla de evaluacion, y el material recuperado de la busqueda web solo menciona que el checkpoint del modelo original se selecciono por exactitud macro de desarrollo, sin dar la cifra obtenida ni describir el conjunto de evaluacion.

## Requisitos de hardware

- Parametros: 1,94 mil millones, por lo que el peso del modelo en memoria es reducido en todas las cuantizaciones.
- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no confirmada por el autor): x-f16 en torno a 3,9 GB de pesos y 5-6 GB contando cache KV y overhead; Q8_0 alrededor de 2,1 GB; Q4_K_M en torno a 1,2 GB; Q2_K por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede ejecutar las cuantizaciones bajas; una RTX 3060, RTX 4060, RTX 4070 o RTX 4090 es mas que suficiente. En centro de datos, una A100 o H100 estaria sobredimensionada para este tamano y solo tendria sentido por agregacion de muchas instancias.
- Cabe en GPU de consumo: si. Cualquier tarjeta moderna con 8 GB o mas ejecuta comodamente las cuantizaciones Q4_K_M y superiores; las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. vLLM soporta GGUF de forma experimental. El tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia gestionados.
- Latencia y throughput estimados: no disponibles. Dependeran por completo de la cuantizacion elegida, del hardware y del backend.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Las cifras de los modelos alternativos son datos publicos de sus respectivas fichas y no proceden de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Linnaeus-0.1.0-2B-merged (GGUF) | 1,94 B | no disponible | no disponible | GGUF en HuggingFace, 0 descargas y 0 likes |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | safetensors y GGUF, ampliamente desplegado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors y GGUF |
| Gemma-2-2B-it | 2,61 B | 8.192 tokens | Gemma Terms of Use | safetensors y GGUF |

En rendimiento no es posible establecer comparacion alguna: no hay benchmarks publicados de Linnaeus-0.1.0-2B, mientras que las alternativas citadas cuentan con evaluaciones publicadas por sus desarrolladores. En terminos de soporte y mantenimiento, las tres alternativas tienen documentacion completa de idiomas, licencia y contexto, algo que este repositorio no ofrece.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia en el repositorio, no puede asumirse permiso para uso comercial. Es imprescindible consultar el repositorio original pi-dal/Linnaeus-0.1.0-2B-merged antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce que lenguas soporta el modelo y con que calidad. No hay garantia de un rendimiento aceptable en castellano.
- Longitud de contexto desconocida: sin este dato no puede planificarse el uso en conversaciones multi-turno largas ni en tareas de resumen de documentos extensos.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual. En un modelo de ~2B el riesgo es estructuralmente alto, especialmente en tareas de conocimiento.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe experiencia de terceros que confirme su comportamiento.
- Capacidades sin documentar: no se describen soporte de tool calling, razonamiento multi-paso, vision ni modos de pensamiento. La unica etiqueta funcional es "conversational".
- Degradacion por cuantizacion: las variantes Q2_K, Q3_K_S y Q3_K_M reducen notablemente la precision de los pesos. Para tareas sensibles deben preferirse Q4_K_M o superiores.
- Trazabilidad del ajuste: el entrenamiento descrito (LoRA de rango 8, cabeza de decision, 3.600 pasos, 3,4 horas en una RTX 4090) es de alcance muy limitado, lo que sugiere un modelo experimental mas que un sistema listo para produccion.
- Repositorio pesado: 19,6 GB en total, aunque cada archivo individual de cuantizacion es mucho mas pequeno.
- Fechas del repositorio: la fecha de creacion registrada (2026-09-26) resulta anomala respecto al momento de la consulta, lo que conviene verificar en la propia pagina del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Linnaeus-0.1.0-2B-merged-GGUF
- Modelo original: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-merged
- Repositorio GitHub del proyecto: https://github.com/pi-dal/Linnaeus
- README del proyecto (receta de entrenamiento): https://github.com/pi-dal/Linnaeus/blob/main/README.md
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Organizacion Linnaeus AI en GitHub: https://github.com/linnaeus-ai
- Buscador de modelos GGUF: https://local-ai-zone.github.io/

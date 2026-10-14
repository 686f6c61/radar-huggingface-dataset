# rty813/Kolibri-1-bf16

## Resumen

Kolibri-1-bf16 es un port comunitario a precision completa (bf16) del modelo Aleph-Alpha/Kolibri-1, publicado por el usuario rty813 bajo licencia Apache 2.0. Se trata de una conversion del checkpoint original en FP8 a pesos bout en bf16 empaquetados en `pytorch_model.bin`, pensada para usuarios de vLLM, TGI, Xinference y transformers que prefieren no depender de las cuantizaciones GGUF del modelo original. La arquitectura es identica a la del modelo base, por lo que funciona como reemplazo directo mediante `AutoModelForCausalLM.from_pretrained`.

El modelo original, Kolibri-1, es un modelo de razonamiento de tipo mixtura de expertos (MoE) desarrollado por Aleph Alpha, con 78.103.074.560 parametros totales y 3.457.573.120 parametros activos por token (aproximadamente 3,46B). Esta orientado a los idiomas aleman e ingles, admite un modo explicito de razonamiento y tool calling, y esta optimizado para contexto largo, con una ventana de 1.048.576 tokens (aunque el autor recomienda no superar los 262.144 tokens para eficiencia de servicio y tareas complejas).

Su relevancia actual radica en la combinacion de un tamano total grande con un numero muy reducido de parametros activos, lo que reduce el coste de computo por token, junto con una ventana de contexto de un millon de tokens. El port a bf16 facilita su despliegue en stacks que trabajan mejor con PyTorch estandar, a cambio de un mayor consumo de memoria respecto a la version FP8 original. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 78.103.074.560 (78B) |
| Parametros activos | 3.457.573.120 (3,46B) por token |
| Longitud de contexto | 1.048.576 tokens; recomendado ≤262.144 tokens |
| Tipos de cuantizacion | Este port: bf16 (precision completa). Original: FP8 (`float8_e4m3fn`, bloques 128x128). Existen quants GGUF del modelo base |
| Idiomas soportados | Aleman e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (bf16); conversion a safetensors en progreso |
| Modo de razonamiento | Si |
| Tool calling | Si |
| Corte de conocimiento | EN: 18 de junio de 2026; DE: 18 de junio de 2026 |

## Arquitectura y entrenamiento

Kolibri-1 emplea una arquitectura de mixtura de expertos (MoE) con 78B de parametros totales y 3,46B de parametros activos por token, lo que permite un coste de inferencia por token bajo en relacion con su tamano total. El checkpoint original distribuye sus pesos en precision `float8_e4m3fn` en bloques de 128x128, con activaciones cuantizadas dinamicamente y evaluado con una cache KV en FP8; los embeddings, la LM head, las normas y el router de la MoE se mantienen en `bfloat16`. El modelo incorpora un modo explicito de razonamiento y esta optimizado para contexto largo y eficiencia de inferencia.

Este repositorio concreto no aporta datos sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO): se limita a ser un port a bf16 con arquitectura identica al original. El autor no indica ninguna modificacion arquitectonica respecto a Aleph-Alpha/Kolibri-1. La informacion disponible no detalla el corpus de entrenamiento ni las tecnicas de alineamiento empleadas; para ello debe consultarse el informe tecnico de Aleph Alpha enlazado en la seccion de enlaces.

## Capacidades

- Generacion de texto y razonamiento explicito, con un modo de razonamiento dedicado.
- Tool calling / function calling soportado de forma nativa.
- Optimizado para contexto largo, con ventana de hasta 1.048.576 tokens.
- Capacidades multilingues centradas en aleman e ingles.
- Eficiencia de inferencia por token gracias a su naturaleza MoE (3,46B de parametros activos sobre 78B totales).
- Compatible con vLLM (`vllm serve rty813/Kolibri-1-bf16`), TGI, Xinference y transformers.
- Uso de informacion mas reciente que el corte de conocimiento a traves de herramientas (tool use).

## Casos de uso

- Atencion al cliente automatizada en aleman o ingles: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M de tokens), lo que permite mantener historiales extensos de cliente sin truncar informacion.
- Analisis de documentos extensos: resumen y extraccion de informacion en contratos, informes o expedientes de cientos de miles de tokens en una sola pasada, gracias a la ventana de contexto.
- Asistentes con herramientas: integracion en agentes que invocan APIs externas mediante tool calling para consultar bases de datos o servicios, combinando el modo de razonamiento con la llamada a funciones.
- Generacion y revision de codigo asistida: razonamiento paso a paso y explicito para tareas de depuracion o explicacion de fragmentos de codigo dentro de pipelines de desarrollo.
- Procesamiento de corpus juridicos o administrativos en aleman: la orientacion del modelo a este idioma y su contexto largo lo hacen adecuado para tareas de clasificacion y respuesta sobre documentacion densa.
- Razonamiento multi-paso en entornos de investigacion: uso del modo de razonamiento para tareas que requieren descomposicion explicita de problemas (matematicas, logica) y trazabilidad del proceso.
- Despliegue self-hosted soberano: al ser pesos abiertos con Apache 2.0, puede ejecutarse en infraestructura propia en entornos con requisitos de residencia de datos en la UE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria del original en FP8: aproximadamente 78 GB (dato aportado por el autor del modelo base).
- Huella estimada de este port en bf16: en torno a 156 GB solo para los pesos (2 bytes por parametro sobre 78,1B), sin contar cache KV ni overhead de runtime. Estimacion derivada del numero de parametros, no confirmada por el autor.
- El modelo base indica unos requisitos minimos de hardware que comienzan por "Minimum: 2", pero la informacion disponible esta truncada y no permite confirmar el numero final de GPUs.
- GPU recomendadas (orientativas): multiples H100 80GB o A100 80GB para el port en bf16; el original en FP8 cabe en configuraciones algo menores.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en bf16 ni en FP8 a precision completa; para hardware de consumo seria necesario recurrir a cuantizaciones GGUF del modelo base.
- Opciones de despliegue: vLLM, TGI, Xinference y transformers (`AutoModelForCausalLM.from_pretrained("rty813/Kolibri-1-bf16")`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kolibri-1-bf16 (este port) | 78B | 3,46B | 1.048.576 tokens | Apache 2.0 | `pytorch_model.bin` (bf16) |
| Aleph-Alpha/Kolibri-1 (original) | 78B | 3,46B | 1.048.576 tokens | Apache 2.0 | FP8 |
| Mixtral 8x22B | 141B | 39B | 64.000 tokens (orientativo) | Apache 2.0 | safetensors |
| Qwen3-30B-A3B | 30,5B (orientativo) | 3,3B (orientativo) | 128.000 tokens (orientativo) | Apache 2.0 | safetensors |

Nota: los datos de Mixtral 8x22B y Qwen3-30B-A3B se incluyen como referencia de categoria (MoE de pesos abiertos) y deben verificarse en sus fichas oficiales; no proceden de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- El repositorio es un port comunitario con 0 descargas y 0 likes, sin validacion independiente conocida; se recomienda verificar la integridad de los pesos antes de usarlo en produccion.
- Los pesos estan en `pytorch_model.bin` (bf16) y la conversion a safetensors esta en progreso; el formato `.bin` no ofrece las ventajas de carga segura y rapida de safetensors.
- Al ser un port a bf16, el consumo de memoria es aproximadamente el doble que el del original en FP8, lo que eleva los requisitos de hardware.
- Idiomas limitados a aleman e ingles; no se declara soporte para castellano ni otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- El modo de razonamiento puede aumentar la latencia y el consumo de tokens de salida.
- Corte de conocimiento fijado en junio de 2026; el conocimiento implicito no cubre informacion posterior salvo mediante tool use.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene revisar los terminos del modelo base y de los datasets subyacentes.
- La informacion de requisitos de hardware del modelo base aparece truncada, por lo que las necesidades minimas exactas de GPU no estan confirmadas.

## Enlaces

- Repositorio del port: https://huggingface.co/rty813/Kolibri-1-bf16
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Informe tecnico: https://aleph-alpha.com/downloads/tech-report.pdf
- Blog tecnico: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model/

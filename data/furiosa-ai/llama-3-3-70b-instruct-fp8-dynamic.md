# furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic

## Resumen

Llama-3.3-70B-Instruct-FP8-dynamic es la variante cuantizada en FP8 del modelo Llama-3.3-70B-Instruct de Meta, publicada originalmente por RedHatAI y redistribuida por FuriosaAI junto con un paquete ejecutable (Furiosa Executable Bundle, FXB) optimizado para su acelerador RNGD. Se trata de un transformer denso autorregresivo de 70.553.706.496 parámetros, ajustado por instrucciones y orientado a diálogo multilingüe, seguimiento de instrucciones y uso de herramientas, con una calidad que Meta sitúa a la altura de modelos considerablemente más grandes.

La relevancia de esta ficha concreta reside en que empaqueta el modelo para hardware no NVIDIA: el repositorio incluye los pesos en safetensors y el bundle para Furiosa-LLM, de modo que el mismo checkpoint puede servirse tanto en RNGD como en frameworks convencionales (vLLM, SGLang, Transformers). La cuantización FP8 reduce el peso del repositorio a 87,1 GB, lo que permite desplegar un modelo de 70B en cuatro tarjetas RNGD con paralelismo tensorial de 32 PEs.

El modelo conserva las capacidades del Llama 3.3 original: contexto largo, soporte de tool calling mediante el parser `llama3_json`, generación de código y razonamiento, y cobertura de ocho idiomas declarados. La licencia es la Llama 3.3 Community License, con las restricciones habituales de Meta para uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.3 (transformer denso autorregresivo) |
| Parametros totales | 70.553.706.496 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 (pesos lineales en FP8 estatico; activaciones en FP8 dinamico por token) |
| Idiomas soportados | en, fr, it, pt, hi, es, th, de |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |
| Tamano del repositorio | 87,1 GB |
| Libreria / runtime | furiosa-llm |
| Hardware soportado | FuriosaAI RNGD (4 tarjetas, tensor-parallel de 32 PEs) |
| Modelo base | RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.3 en su variante densa: un transformer autorregresivo con atención completa, sin mezcla de expertos, ajustado por instrucciones sobre el checkpoint base de Meta. Esta ficha no introduce cambios arquitectónicos respecto al modelo original; su aportación es la cuantización y el empaquetado para hardware específico.

La cuantización aplicada por RedHatAI es FP8-dynamic: los pesos de las capas lineales del bloque transformer se almacenan en FP8 estático, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia, sin calibración offline. Este esquema evita el coste de un dataset de calibración y suele preservar mejor la calidad en modelos grandes que una cuantización estática de activaciones. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO aplicadas por Meta al modelo original.

El despliegue en RNGD emplea un tamaño de paralelismo tensorial de 32 PEs, que se mapea a cuatro tarjetas RNGD (8 PEs por tarjeta). El bundle FXB precompilado permite arrancar el servidor sin pasar por una fase de compilación en el destino.

## Capacidades

- Generación de texto y diálogo multirretorno con seguimiento de instrucciones, heredadas del Llama 3.3 Instruct original.
- Razonamiento y matemáticas de nivel conversacional, según las capacidades declaradas del modelo base.
- Generación y explicación de código, incluyendo tareas de completado y refactorización.
- Tool calling / function calling mediante el parser `llama3_json`, activable con `--enable-auto-tool-choice` en el servidor de Furiosa-LLM.
- Soporte de agentes y razonamiento multi-paso a través de llamadas encadenadas a herramientas.
- Capacidades multilingües en inglés, francés, italiano, portugués, hindi, español, tailandés y alemán.
- API compatible con OpenAI (`/v1/chat/completions`) servida por `furiosa-llm serve`.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con instrucciones de sistema complejas y derivar a herramientas internas (consulta de pedidos, estado de cuenta) mediante tool calling, con el servidor expuesto como API compatible con OpenAI.
- Asistentes internos sobre documentación corporativa: su capacidad de seguir instrucciones largas y su cobertura de ocho idiomas lo hacen adecuado para un chatbot de soporte a empleados en organizaciones multinacionales.
- Generación de código en pipelines de desarrollo: integrado en un servidor Furiosa-LLM, puede actuar como servicio de completado o revisión de código detrás de un IDE o de un bot de revisión de pull requests, con llamadas a herramientas para consultar repositorios o ejecutar tests.
- Automatización de flujos con agentes: el soporte de `llama3_json` permite construir agentes que deciden cuándo invocar funciones externas (APIs REST, bases de datos) y encadenar varios pasos de razonamiento antes de responder.
- Traducción y localización: con cobertura declarada de en, fr, it, pt, hi, es, th y de, puede emplearse para traducción asistida y generación de contenido localizado en esos mercados.
- Procesamiento de documentación técnica y resúmenes: generación de resúmenes, extracción de entidades y reescritura de textos largos en un servicio interno desplegado sobre RNGD cuando se quiera evitar depender de GPU NVIDIA.
- Evaluación y prototipado de hardware alternativo: como referencia para equipos que comparan el rendimiento de RNGD frente a aceleradores convencionales sirviendo el mismo checkpoint FP8 en vLLM o SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta ficha no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos, y la búsqueda web realizada no aportó datos al respecto.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 87,1 GB en FP8, por lo que la inferencia requiere al menos esa cantidad de memoria agregada, más overhead de activaciones y caché KV.
- GPU recomendadas: el soporte oficial de esta ficha es FuriosaAI RNGD, con un despliegue de cuatro tarjetas y tensor-parallel de 32 PEs.
- GPU de consumo: no se documenta soporte en tarjetas consumer; un modelo de 70B en FP8 no cabe en una única GPU de 24 GB y requeriría reparto entre varias o cuantización adicional a 4 bits fuera del alcance de este repositorio.
- Opciones de despliegue: `furiosa-llm serve` sobre RNGD; según la model card, el mismo checkpoint funciona en vLLM, SGLang y Transformers siguiendo la model card upstream de RedHatAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic | 70,55B (denso) | no disponible | FP8 dynamic | llama3.3 | FuriosaAI RNGD |
| RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic | 70,55B (denso) | no disponible | FP8 dynamic | llama3.3 | GPU NVIDIA (vLLM, SGLang, Transformers) |
| meta-llama/Llama-3.3-70B-Instruct | 70,55B (denso) | no disponible | BF16 (original) | llama3.3 | GPU NVIDIA y otros |

La diferencia entre las tres variantes es de empaquetado y cuantización, no de arquitectura ni de pesos de entrenamiento: esta ficha añade el bundle FXB y el soporte de Furiosa-LLM sobre el mismo checkpoint FP8 de RedHatAI, que a su vez deriva del modelo original de Meta en BF16.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradaciones sutiles de calidad frente al modelo en BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida en esta ficha.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, especialmente en dominios especializados y en preguntas factuales sin verificación externa.
- Sesgos heredados de los datos de entrenamiento de Llama 3.3, no documentados en la información disponible.
- La licencia Llama 3.3 Community License impone restricciones específicas para uso comercial (cláusulas de escala de usuarios y de atribución); conviene revisar el texto completo antes de un despliegue en producción.
- El soporte oficial de este repositorio está limitado a FuriosaAI RNGD y Furiosa-LLM; el uso en otros frameworks depende de la model card upstream y no está cubierto por esta ficha.
- La longitud de contexto no se especifica en la información proporcionada, por lo que no debe asumirse un valor concreto sin consultar la documentación de Llama 3.3.
- La cobertura idiomática se limita a los ocho idiomas declarados; el rendimiento en otros idiomas no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/Llama-3.3-70B-Instruct-FP8-dynamic
- Modelo upstream (RedHatAI): https://huggingface.co/RedHatAI/Llama-3.3-70B-Instruct-FP8-dynamic
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- Licencia Llama 3.3: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct/blob/main/LICENSE
- FuriosaAI: https://furiosa.ai
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Referencia del servidor `furiosa-llm serve`: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html

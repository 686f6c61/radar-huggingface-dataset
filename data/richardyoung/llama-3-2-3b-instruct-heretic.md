# richardyoung/Llama-3.2-3B-Instruct-heretic

## Resumen

Llama-3.2-3B-Instruct-heretic es una variante "abliterated" (también etiquetada como uncensored o decensored) del modelo Llama-3.2-3B-Instruct de Meta, publicada por el usuario richardyoung en Hugging Face. El modelo parte de los pesos oficiales de Meta y les aplica una intervención de modificación de direcciones de activación para reducir el comportamiento de rechazo, manteniendo la arquitectura y el entrenamiento originales. Conserva los 3.212.749.824 parámetros del modelo base y su ventana de contexto de 128.000 tokens.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo típico de la práctica de "abliteration", que en los últimos años se ha convertido en una técnica reproducible para estudiar cómo se codifican los comportamientos de seguridad en los transformers. Por otro, advierte de que se trata de un artefacto con licencia Llama 3.2, acceso restringido (gated) y un uso muy específico: investigación sobre alineación y evaluación de salvaguardas, no despliegue en producción orientado al usuario final.

El modelo se distribuye en formato safetensors, es compatible con transformers y text-generation-inference, y declara soporte para ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés). Su tamaño de 3B permite ejecutarlo en GPUs de consumo con cuantización, lo que lo hace accesible para experimentación local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), basada en Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors estándar admite cuantizaciones habituales (GGUF, AWQ, GPTQ) con herramientas externas |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.2-3B-Instruct original: un transformer decoder-only denso con atención por grupos (GQA), RoPE para codificación posicional y normalización RMSNorm. No se trata de un modelo MoE ni híbrido SSM; es un transformer clásico de 3B parámetros. El entrenamiento base (pretraining, SFT y ajuste por preferencias) corresponde íntegramente a Meta y no se ha reentrenado en esta variante.

La modificación introducida por richardyoung es una intervención de tipo "abliteration": se identifican direcciones en el espacio de activaciones asociadas a la generación de rechazos y se proyectan fuera de los pesos o de las activaciones, de forma que el modelo pierde parte de su tendencia a negarse a responder. El autor etiqueta el proceso como "reproducible", lo que sugiere que documenta o automatiza el procedimiento, aunque los detalles exactos (capas afectadas, magnitud de la proyección, datos de calibración) no están disponibles en la información proporcionada. No hay indicios de un nuevo ciclo de RLHF o DPO tras la intervención.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama-3.2-3B-Instruct.
- Razonamiento básico y resolución de problemas de complejidad media, limitado por el tamaño de 3B parámetros.
- Generación de código y asistencia en tareas de programación, con calidad inferior a modelos de 7B o superiores.
- Matemáticas elementales y de nivel medio; no es fiable en problemas de varios pasos.
- Soporte multilingüe declarado en ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Reducción del comportamiento de rechazo: responde a peticiones que el modelo original declinaría, lo que constituye su rasgo diferencial.
- Compatibilidad con text-generation-inference y endpoints compatibles, lo que facilita el despliegue como API.
- No se ha confirmado en la información disponible soporte nativo de tool calling, function calling, agentes o modo thinking; estas capacidades no deben asumirse.

## Casos de uso

- Investigación sobre alineación y salvaguardas: el modelo sirve como objeto de estudio para medir cuánto del comportamiento de rechazo depende de direcciones de activación concretas y cómo se puede revertir sin reentrenar.
- Evaluación de sistemas de moderación: se puede usar como "modelo adversario" para probar clasificadores de contenido y filtros de seguridad en pipelines de despliegue.
- Experimentación académica con modelos pequeños: sus 3B parámetros permiten ejecutar ablaciones controladas en una sola GPU, comparando el modelo heretic con el Llama-3.2-3B-Instruct original.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o diálogos donde el modelo base tiende a autocensurar ciertos registros.
- Prototipado local de asistentes conversacionales: con cuantización GGUF o AWQ cabe en GPUs de consumo y permite iterar sin coste de API.
- Análisis de robustez de pipelines: integrarlo en un banco de pruebas para verificar que los guardarraíles de una aplicación no dependen únicamente del comportamiento del modelo.
- Docencia y demostraciones: ilustrar en clase cómo una intervención mínima sobre los pesos altera el perfil de seguridad de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 8-10 GB.
- VRAM estimada con cuantización de 8 bits: alrededor de 3,5-4 GB.
- VRAM estimada con cuantización de 4 bits (GGUF Q4_K_M, AWQ o GPTQ): alrededor de 2-2,5 GB.
- GPU recomendadas para FP16: A100, H100, L40S, RTX 4090, RTX 3090.
- GPU de consumo compatibles: RTX 4090, RTX 4080, RTX 3090, RTX 3080 (con cuantización), RTX 4070 Ti y superiores; también GPUs con 8 GB si se usa cuantización de 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp, Ollama y LM Studio (estos dos últimos requieren convertir los pesos a GGUF, ya que el repo solo publica safetensors).
- Latencia y throughput: no disponibles en la información proporcionada; a título orientativo, un modelo denso de 3B en una RTX 4090 con cuantización de 4 bits suele superar las decenas de tokens por segundo, pero no se ha verificado para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| richardyoung/Llama-3.2-3B-Instruct-heretic | 3,21B | 128k | llama3.2 | Gated | Variante abliterated del Llama-3.2-3B-Instruct |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | llama3.2 | Gated | Modelo original de Meta, con salvaguardas intactas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | llama3.2 | Gated | Versión más pequeña de la misma familia, menor calidad |
| Qwen2.5-3B-Instruct | 3,09B | 32k | Apache 2.0 | Abierto | Alternativa de tamaño similar con licencia permisiva y contexto menor |

La comparación directa con el modelo base es la más informativa: comparten arquitectura, tokenizador y contexto, y la única diferencia documentada es la intervención de abliteration. Frente a Qwen2.5-3B-Instruct, la licencia Llama 3.2 es más restrictiva y el acceso está condicionado a aceptar términos en Hugging Face.

## Limitaciones y advertencias

- La reducción del comportamiento de rechazo es una modificación no auditada por Meta; no hay garantía de que el modelo mantenga la misma calidad en tareas benignas que el original.
- Riesgo elevado de generar contenido dañino, ofensivo o inexacto sin filtros; no es apto para aplicaciones orientadas al usuario final sin moderación externa.
- Sesgos heredados del corpus de entrenamiento de Llama 3.2, que no se han corregido en esta variante.
- Riesgo de alucinación típico de un modelo de 3B parámetros; la ventana de 128k no implica que el modelo use bien contextos largos.
- La licencia Llama 3.2 impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de cualquier despliegue.
- El acceso es restringido (gated): es necesario aceptar las condiciones en Hugging Face y disponer de token de autenticación para descargar los pesos.
- El modelo tiene muy pocas descargas y ningún "like" en el momento de la consulta, lo que reduce la validación comunitaria disponible.
- No se han publicado evaluaciones independientes de esta variante concreta; los números de benchmarks del Llama-3.2-3B-Instruct original no son trasladables sin verificación.
- El repo solo incluye safetensors; para usarlo con llama.cpp u Ollama hay que realizar la conversión a GGUF por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Llama-3.2-3B-Instruct-heretic
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Paper de referencia sobre alineación y seguridad citado en los tags: https://arxiv.org/abs/2405.16406
- Paper de referencia sobre evaluación de modelos citado en los tags: https://arxiv.org/abs/2204.05149
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Documentación de transformers: https://huggingface.co/docs/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference

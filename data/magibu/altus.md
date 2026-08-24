# magibu/Altus

## Resumen

Altus es un tokenizer y processor BPE multimodal desarrollado por Magibu AI Research, un grupo de investigación turco centrado en inteligencia artificial para lenguas de bajos recursos. A diferencia de un modelo de lenguaje completo, este repositorio no contiene pesos de modelo, sino únicamente el tokenizer, el processor, la plantilla de chat y los mapeos de identificadores de token necesarios para entrenar modelos eficientes en turco y otros idiomas con pocos recursos.

El proyecto parte del tokenizer del modelo google/gemma-4-31B-it y lo fusiona con un vocabulario BPE propio de 65.536 unidades desarrollado por Magibu AI. El resultado es un vocabulario combinado de 262.144 tokens (limitado a 2^18), con 42.484 tokens nuevos inyectados y un mapeo de identificadores que permite inicializar embeddings durante el entrenamiento. La relevancia de Altus radica en que aborda la ineficiencia tokenizadora de los modelos multilingües existentes para el turco, un problema común en lenguas aglutinantes con morfología rica.

El paquete está diseñado para ser compatible con el ecosistema Hugging Face Transformers, manteniendo las clases técnicas y el protocolo de tokens especiales sin modificar. La licencia es Apache 2.0, lo que facilita su uso tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BPE tokenizer/processor multimodal |
| Parametros totales | no disponible (no contiene pesos de modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplicable (no contiene pesos) |
| Idiomas soportados | turco (tr), disenado para lenguas de bajos recursos |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable; incluye archivos de tokenizer (tokenizer.json, processor, mapeos JSON) |

## Arquitectura y entrenamiento

Altus no es un modelo de lenguaje, sino un tokenizer BPE fusionado. Su arquitectura se basa en el tokenizer de google/gemma-4-31B-it, que emplea el algoritmo Byte Pair Encoding con representacion de espacios mediante el caracter especial `▁` (U+2581). El proceso de fusion combina el vocabulario de 65.536 tokens de Magibu AI con el vocabulario fuente de 262.144 tokens del tokenizer de Gemma. El resultado mantiene el tamaño total en 262.144 tokens, inyectando 42.484 tokens nuevos y eliminando otros tantos del vocabulario original para respetar el limite de 2^18.

La innovacion principal es el archivo `merged-to-original-token-ids.json`, que mapea cada identificador del tokenizer fusionado a uno o mas identificadores del tokenizer original. Este mapeo permite inicializar los embeddings de un modelo nuevo a partir de los pesos del modelo fuente, una tecnica clave para el transfer learning cuando se amplia el vocabulario. Ademas, el processor esta estructurado para admitir flujos de texto, imagen, video, audio, pensamiento y llamada a herramientas, aunque no se detallan los pesos ni la arquitectura de vision o audio.

## Capacidades

- Tokenizacion BPE eficiente para turco, con vocabulario expandido para mejorar la compression de texto en este idioma.
- Compatible con flujos multimodales (texto, imagen, video, audio) segun la estructura del processor, aunque el repo no incluye modelos de vision o audio.
- Soporte de plantilla de chat con idioma de respuesta por defecto en turco.
- Incluye mapeo de IDs de token para inicializar embeddings durante el entrenamiento, facilitando el transfer learning.
- Compatible con Hugging Face Transformers, incluyendo `AutoProcessor` y `AutoTokenizer`.
- Capacidad de tool calling y thinking mode a nivel de estructura del processor, aunque sin implementacion de modelo.

## Casos de uso

- Entrenamiento de modelos de lenguaje turco: Altus permite entrenar un LLM desde cero o fine-tunear uno existente con un vocabulario adaptado al turco, mejorando la eficiencia de tokenizacion y reduciendo el numero de tokens necesarios por frase.
- Inicializacion de embeddings para transfer learning: el archivo `merged-to-original-token-ids.json` se usa para mapear los embeddings del modelo fuente (Gemma) al vocabulario ampliado, permitiendo un arranque de entrenamiento mas rapido y estable.
- Desarrollo de modelos de agentes conversacionales en turco: la plantilla de chat y el soporte de tool calling permiten construir asistentes que llaman funciones o APIs en aplicaciones de atencion al cliente o automatizacion.
- Investigacion en lenguas de bajos recursos: investigadores pueden usar Altus como punto de partida para estudiar tecnicas de tokenizacion adaptadas a idiomas con morfologia compleja, comparando con tokenizers genericos multilingues.
- Construccion de pipelines de generacion de codigo: aunque no esta optimizado para codigo, el tokenizer puede integrarse en sistemas de generacion de codigo en turco, como asistentes de programacion para documentacion o comentarios en ese idioma.
- Despliegue de sistemas de IA en la nube o local con requisitos de soberania de datos: Magibu AI promueve modelos que funcionan dentro de las organizaciones, y Altus es el componente de tokenizacion para esos sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un tokenizer y no de un modelo completo, no hay datos de MMLU, HumanEval, GSM8K ni metricas similares. La evaluacion de este tipo de componentes se realiza midiendo la compression de texto (tokens por palabra o por frase), el porcentaje de tokens desconocidos y la velocidad de tokenizacion, pero no se han proporcionado dichos datos.

## Requisitos de hardware

- No aplica: Altus no contiene pesos de modelo, por lo que no requiere VRAM para inferencia.
- Para usarlo como parte de un modelo de entrenamiento (por ejemplo, inicializando embeddings de Gemma), los requisitos dependen del modelo completo: Gemma 31B necesita al menos 62 GB de VRAM en precision FP16 para inferencia, o cuantizaciones de 4 bits (Q4_K_M) que reducen el requisito a alrededor de 18-20 GB.
- GPU recomendadas para entrenamiento con este tokenizer: A100 80GB, H100 80GB, o multiples RTX 4090 24GB en configuracion multi-GPU.
- El tokenizer en si es ligero y puede ejecutarse en CPU, con un uso de memoria inferior a 1 GB para el vocabulario completo.
- Para despliegue de modelos que usen Altus, se puede utilizar vLLM, llama.cpp, Ollama o Transformers, segun el formato de pesos del modelo resultante.

## Comparativa con modelos similares

No hay comparables directos en el ecosistema, ya que Altus es un tokenizer especifico, no un modelo completo. Sin embargo, se puede comparar con el tokenizer del modelo base y con alternativas de tokenizacion para turco:

| Modelo/tokenizer | Vocabulario | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Altus (Magibu AI) | 262.144 | BPE fusionado para turco | Apache 2.0 | Hugging Face |
| Google Gemma 4 31B tokenizer | 262.144 | BPE multilingue | Apache 2.0 | Hugging Face |
| Llama 3 tokenizer (Meta) | 128.256 | BPE multilingue | Llama 3 license | Hugging Face |

La diferencia clave es que Altus inyecta tokens especificos para turco y lenguas de bajos recursos, lo que potencialmente mejora la compression en estos idiomas respecto al tokenizer generico de Gemma. No hay datos publicos de eficiencia comparativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo: Altus es solo un tokenizer, y no se puede utilizar directamente para generar texto.
- El vocabulario se ha optimizado para turco; el rendimiento en otros idiomas puede no ser superior al tokenizer original de Gemma.
- La fusion elimino 42.484 tokens del vocabulario fuente, lo que podria degradar la eficiencia de tokenizacion para otros idiomas si se usa fuera del contexto turco.
- No se han publicado resultados de evaluacion de compression ni de velocidad, por lo que no se puede verificar la mejora afirmada sin pruebas propias.
- La compatibilidad con flujos multimodales (vision, audio) esta declarada en la estructura del processor, pero no se incluyen implementaciones ni pesos de modelos de vision o audio.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Gemma, que tambien es Apache 2.0, para confirmar restricciones adicionales.
- El archivo `merged-to-original-token-ids.json` es clave para la transferencia de embeddings, pero su uso requiere un proceso de inicializacion cuidadoso; un mal uso puede degradar el rendimiento del modelo entrenado.

## Enlaces

- Repositorio HuggingFace: [magibu/Altus](https://huggingface.co/magibu/Altus)
- Modelo base: [google/gemma-4-31B-it](https://huggingface.co/google/gemma-4-31B-it)
- Organizacion Magibu AI en HuggingFace: [huggingface.co/magibu](https://huggingface.co/magibu)
- Web de Magibu AI: [magibu.ai](https://magibu.ai)
- Modelo relacionado: [magibu-11b-v0.8](https://huggingface.co/magibu/magibu-11b-v0.8)

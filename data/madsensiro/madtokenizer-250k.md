# MadSensiro/MadTokenizer-250K

## Resumen

MadTokenizer-250K es un tokenizador byte-level BPE (el mismo esquema que utiliza GPT-2) entrenado desde cero por el autor MadSensiro para el par de idiomas ingles-ruso. Su vocabulario es de 250.000 tokens y esta disenado para alimentar futuros modelos de lenguaje en esos dos idiomas, aunque en el momento de su publicacion el repositorio no incluye pesos de ningun modelo de lenguaje, solo los artefactos del tokenizador.

El modelo se entreno sobre tres corpus publicos: wikitext-103 (ingles), multi_news (ingles) y gazeta (ruso), con la libreria `tokenizers` de Hugging Face usando `BpeTrainer` con pre-tokenizador `ByteLevel` y `min_frequency=2`. Al ser byte-level, el tokenizador puede codificar cualquier secuencia Unicode sin generar tokens `<unk>`, lo que lo hace robusto frente a texto arbitrario, emojis y espacios.

Su relevancia actual es limitada pero concreta: sirve como pieza reutilizable para quien quiera entrenar un modelo bilingue ingles-ruso con un vocabulario grande y byte-level, o como referencia de como construir tokenizadores con la API `tokenizers`. No es un modelo generativo y no debe evaluarse como tal; su utilidad es la de un componente de preprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (sin pesos de modelo de lenguaje) |
| Parametros totales | no disponible (no es un modelo de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | tokenizer.json, tokenizer_config.json, vocab.json, merges.txt, special_tokens_map.json, config.json |

## Arquitectura y entrenamiento

El tokenizador sigue el esquema byte-level BPE de GPT-2: un pre-tokenizador `ByteLevel` que mapea cada byte a un caracter Unicode imprimible y un `BpeTrainer` que aprende las fusiones sobre esa representacion. El vocabulario resultante tiene 250.000 tokens e incluye los tokens especiales `<s>`, `<pad>`, `</s>`, `<unk>` y `<mask>`. Se entreno con la libreria `tokenizers` de Hugging Face con `min_frequency=2`.

Los datos de entrenamiento son tres corpus publicos: wikitext-103 (ingles), multi_news (ingles) y gazeta (ruso). No se especifica en la model card el numero total de tokens procesados ni la mezcla exacta entre idiomas, ni si hubo normalizacion adicional o filtrado. No hay innovaciones tecnicas destacables mas alla del propio diseno byte-level, que garantiza cobertura completa de bytes y evita el token `<unk>` para cualquier entrada.

## Capacidades

- Tokenizacion byte-level de texto en ingles y ruso sin producir `<unk>` para secuencias Unicode arbitrarias.
- Codificacion y decodificacion de texto con espacios, emojis y caracteres no latinos gracias al mapeo byte a caracter.
- Gestion de tokens especiales: `<s>` (inicio), `</s>` (fin), `<pad>` (relleno), `<unk>` (desconocido) y `<mask>` (mascara).
- Serializacion en formato fast tokenizer (`tokenizer.json`), cargable con `AutoTokenizer.from_pretrained`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: es exclusivamente un tokenizador.
- No incluye capacidades multilingues mas alla de ingles y ruso en el corpus de entrenamiento (aunque al ser byte-level puede codificar cualquier idioma, la calidad de las fusiones solo esta optimizada para esos dos).

## Casos de uso

- Entrenamiento de un modelo de lenguaje bilingue ingles-ruso: el tokenizador proporciona un vocabulario de 250.000 tokens byte-level listo para usar con `AutoTokenizer`, evitando tener que entrenar uno desde cero y garantizando cobertura de ambos idiomas.
- Preprocesado de corpus de noticias en ruso (gazeta) y en ingles (multi_news, wikitext): util para pipelines de tokenizacion en tareas de clasificacion de tokens o etiquetado de secuencias, ya que el pipeline declarado es `token-classification`.
- Prototipado rapido de pipelines de NLP: al cargarse con `AutoTokenizer` y no requerir GPU, permite montar un pipeline de tokenizacion en CPU en segundos para pruebas de formato, conteo de tokens y validacion de datos.
- Analisis de cobertura y compresion de vocabulario: investigadores pueden medir la tasa de compresion (tokens por caracter) en ingles y ruso y comparar con tokenizadores como GPT-2 o Llama, usando el vocabulario de 250.000 entradas.
- Construccion de datasets tokenizados para fine-tuning: el tokenizador se puede aplicar en lote sobre wikitext-103 o gazeta para generar tensores de entrada listos para un modelo posterior, con tokens especiales ya definidos.
- Educacion y referencia tecnica: sirve como ejemplo reproducible de como entrenar un tokenizador byte-level con `BpeTrainer` y `ByteLevel`, documentado en la propia model card con el codigo de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. Es un tokenizador, se ejecuta en CPU.
- GPU recomendadas: ninguna necesaria; funciona en CPU en cualquier maquina.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna; el coste es el de tokenizar texto, no el de ejecutar un modelo.
- Opciones de despliegue: `transformers` (`AutoTokenizer`), libreria `tokenizers` de Hugging Face; no aplica vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de modelo.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y del volumen de texto, pero al ser un tokenizador byte-level el coste es bajo y proporcional al numero de bytes.

## Comparativa con modelos similares

| Modelo | Tipo | Vocabulario | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MadTokenizer-250K | Tokenizador byte-level BPE | 250.000 | en, ru | MIT | Hugging Face |
| GPT-2 tokenizer | Tokenizador byte-level BPE | 50.257 | en (multilingue limitado) | MIT | Hugging Face |
| Llama 3 tokenizer | Tokenizador BPE (tiktoken) | 128.256 | multilingue | Llama 3 license | Hugging Face |
| Qwen2 tokenizer | Tokenizador BPE | 151.643 | multilingue | Apache 2.0 | Hugging Face |

La comparativa es orientativa: los tokenizadores de GPT-2, Llama 3 y Qwen2 estan asociados a modelos de lenguaje completos, mientras que MadTokenizer-250K es solo el tokenizador. La diferencia principal es el tamano del vocabulario (250.000 frente a 50.257 de GPT-2) y la especializacion en ingles y ruso.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas. Solo tokeniza.
- El vocabulario esta optimizado para ingles y ruso; para otros idiomas la tasa de compresion sera peor aunque no produzca `<unk>` por ser byte-level.
- No se documenta el numero de tokens de entrenamiento ni la mezcla exacta de corpus, lo que dificulta reproducir el entrenamiento.
- La model card advierte que el marcador de espacio inicial (`Ġ`) puede hacer que `decode` de una cadena aislada anteponga un espacio; es comportamiento estandar de GPT-2 y esperado.
- Licencia MIT: permite uso comercial, pero conviene verificar que los corpus de entrenamiento (wikitext-103, multi_news, gazeta) no impongan restricciones adicionales sobre los datos derivados.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- No hay informacion sobre sesgos, alucinacion (no aplica) ni evaluacion de calidad del vocabulario en tareas downstream.

## Enlaces

- Hugging Face: https://huggingface.co/MadSensiro/MadTokenizer-250K
- Dataset wikitext-103: https://huggingface.co/datasets/Salesforce/wikitext
- Dataset multi_news: https://huggingface.co/datasets/multi_news
- Dataset gazeta: https://huggingface.co/datasets/IlyaGusev/gazeta
- Libreria tokenizers: https://github.com/huggingface/tokenizers

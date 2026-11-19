# egeboy35/mret-32k

## Resumen

MRET 32K es un tokenizador para turco desarrollado por el usuario egeboy35, publicado en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje con pesos entrenados, sino exclusivamente de un tokenizador con vocabulario de 32.768 tokens que emplea un modelo de lenguaje Unigram y un pre-tokenizador a nivel de byte. Forma parte de la familia MRET, que incluye tambien las variantes de 64K y 128K tokens.

Su propuesta principal es ser "sin perdida" (lossless): cualquier texto de entrada se decodifica de vuelta byte a byte y nunca se genera el token `<unk>`. Ademas, el tokenizador no normaliza el texto, de modo que la segmentacion respeta exactamente la cadena original. El modelo de Unigram se entreno sobre analisis morfologicos de Zeyrek para favorecer que las fronteras de los tokens coincidan con las fronteras de morfemas del turco.

El interes actual reside en que el turco es una lengua aglutinante con morfologia muy productiva, lo que penaliza los tokenizadores BPE genericos en terminos de compresion y de calidad de representacion. MRET 32K se presenta como una alternativa especifica para turco que mejora la compresion, la cobertura de vocabulario y las metricas morfologicas frente a otros tokenizadores de la misma clase, segun las mediciones publicadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador Unigram con pre-tokenizador a nivel de byte |
| Parametros totales | no disponible (no contiene pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (depende del modelo que lo use) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de tokenizador; ficheros de tokenizacion y `config.json`, sin safetensors ni GGUF) |
| Tamano de vocabulario | 32.768 tokens |
| Tokens especiales | `<pad>`, `<unk>`, `<s>`, `</s>`, roles de chat, tool calling, FIM y 57 reservados |
| Plantilla de chat | si (requiere `jinja2`) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El tokenizador combina un pre-tokenizador a nivel de byte con un modelo de lenguaje Unigram. La segmentacion elige la division en el menor numero de tokens posible; cuando hay varias segmentaciones de igual longitud, los pesos de los tokens, entrenados sobre analisis morfologicos de Zeyrek, seleccionan la que mejor sigue las fronteras de morfemas del turco. El pre-tokenizador trata los sufijos tras apostrofo como piezas independientes ("Türkiye" + "'nin"), mantiene enteros los anos de cuatro digitos, agrupa numeros mas largos en bloques de tres y trata las secuencias de puntuacion como una sola pieza.

El autor no detalla el corpus de entrenamiento, el numero de tokens procesados ni si hubo etapas de ajuste adicionales. La model card unicamente indica que los pesos de los tokens se entrenaron sobre analisis morfologicos de Zeyrek y que la evaluacion se realizo sobre un corpus propio con documentos oficiales y legales, enciclopedicos (Wikipedia) e informales (foros, redes sociales y comentarios), ademas de noticias de un conjunto separado nunca usado en entrenamiento. No se especifica composicion porcentual ni tamano del corpus.

## Capacidades

- Tokenizacion sin perdida: toda entrada se decodifica de vuelta byte a byte y nunca se produce `<unk>`.
- Sin normalizacion de texto: la segmentacion opera sobre la cadena original; el autor advierte que el texto en forma NFD cuesta entre dos y tres veces mas tokens, por lo que recomienda convertir los datos a NFC.
- Modelo Unigram orientado a morfologia: prioriza segmentaciones que respetan fronteras de morfemas del turco.
- Manejo de formatos numericos: anos de cuatro digitos enteros, numeros largos agrupados de tres en tres, y secuencias de puntuacion como pieza unica.
- Plantilla de chat integrada con roles `system`, `user`, `assistant` y `tool`.
- Soporte de tool calling: tokens `<|tools|>`, `<|tool_call|>` y `<|tool|>`, con llamadas en formato JSON (`{"name": ..., "arguments": ...}`).
- Soporte de fill-in-the-middle (FIM) para entrenamiento de modelos de codigo: tokens `<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>` y `<|fim_pad|>`.
- Tokens reservados: 57 tokens `<|reserved_7|>` a `<|reserved_63|>` para extensiones futuras.
- Capacidad multilingue: limitada al turco; no se documentan otros idiomas.

## Casos de uso

- Preentrenamiento de modelos de lenguaje en turco: el tokenizador ofrece mayor compresion que alternativas de 32K en el corpus de prueba (214,9 tokens por 1.000 caracteres frente a 227,3 de NC-32k), lo que reduce el coste computacional por documento y permite cubrir mas texto con la misma ventana de contexto.
- Modelos de instrucciones y asistentes conversacionales en turco: la plantilla de chat integrada con roles y tokens de fin de turno permite construir conversaciones multi-turno sin definir un formato propio; el autor recomienda usar `<|end|>` (id 7) como token de parada en generacion.
- Agentes con tool calling en turco: los tokens `<|tools|>`, `<|tool_call|>` y `<|tool|>` permiten representar definiciones de herramientas, llamadas y resultados dentro de la misma secuencia, lo que facilita pipelines de agentes que consultan APIs o bases de datos.
- Entrenamiento de modelos de codigo con FIM: los tokens FIM permiten entrenar tareas de relleno de huecos (infilling) en editores y asistentes de codigo, aunque el tokenizador esta optimizado para turco y no para lenguajes de programacion.
- Procesamiento de documentos oficiales y legales en turco: la evaluacion del autor incluye este dominio y el tokenizador mantiene formatos como fechas, importes, porcentajes y numeros de telefono con una media de 4,63 tokens por ejemplo sintetico, lo que ayuda en la extraccion y el analisis de documentos administrativos.
- Analisis morfologico y NLP linguistico: la mayor F1 de fronteras morfologicas (58,70) y precision de raiz (69,60) entre los tokenizadores sin perdida comparados lo hacen adecuado para tareas que dependen de la segmentacion morfologica, como etiquetado, lematizacion o busqueda morfologica.
- Indexacion y busqueda en turco: la compresion superior reduce el numero de tokens por documento indexado y mejora la cobertura del vocabulario (79,47 % de tokens usados al menos una vez en el texto de cuatro dominios), lo que puede beneficiar a sistemas de recuperacion de informacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de su corpus, con las metricas del informe "Türkçe Tokenizer Karşılaştırma" (13 de noviembre de 2026). Las columnas de compresion son tokens por 1.000 caracteres (menor es mejor); "4 dominios" promedia oficial, enciclopedico, informal y noticias. Round trip es el porcentaje de documentos decodificados exactamente. En negrita, el mejor entre los tokenizadores sin perdida.

| Tokenizador | 4 dominios ↓ | Informal ↓ | 46 dominios ↓ | Round trip % ↑ | Vocab usado % ↑ | F1 morfologia ↑ | Precision raiz ↑ | Formatos ↓ |
|---|---|---|---|---|---|---|---|---|
| MRET 32K | 214,9 | 228,7 | 222,5 | 100,0 | 79,47 | 58,70 | 69,60 | 4,63 |
| NC-32k | 227,3 | 228,3 | 232,8 | 100,0 | 77,24 | 57,75 | 63,07 | 5,10 |
| TR-BPE-32k | 232,2 | 238,0 | 235,4 | 100,0 | 77,13 | 49,06 | 54,60 | no disponible |
| RK-32k | 244,0 | 246,0 | 245,3 | 100,0 | 69,05 | 52,73 | 57,25 | no disponible |
| RE-32k | 256,5 | 251,1 | 251,4 | 100,0 | 68,11 | 48,79 | 53,85 | no disponible |
| Kanarya | 234,3 | 239,2 | 236,1 | 100,0 | 77,86 | 49,08 | 54,80 | no disponible |
| TURNA (con perdida) | 217,5 | 229,2 | 218,7 | 22,9 | 77,10 | 57,24 | 69,00 | 4,50 |
| BERTurk (con perdida) | 222,2 | 234,2 | 224,1 | 16,1 | 74,12 | 47,32 | no disponible | no disponible |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el repositorio no contiene pesos de modelo.

## Requisitos de hardware

- VRAM para inferencia: no aplica directamente; el tokenizador es una pieza ligera que se ejecuta en CPU y no requiere GPU. El consumo de VRAM dependera del modelo de lenguaje que utilice este tokenizador.
- GPU recomendadas: no aplica para el tokenizador. Para los modelos que lo integren, la eleccion dependera de su tamano y cuantizacion.
- Cabe en GPU de consumo: si, el tokenizador en si se ejecuta en cualquier CPU; no necesita GPU.
- Opciones de despliegue: al ser un tokenizador de la libreria `transformers`, se carga con `AutoTokenizer.from_pretrained("egeboy35/mret-32k")`. La plantilla de chat requiere `jinja2` instalado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparacion con otros tokenizadores de la clase 32K para turco, segun los datos publicados por el autor:

| Tokenizador | Vocabulario | Sin perdida | 4 dominios ↓ | F1 morfologia ↑ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MRET 32K | 32.768 | si | 214,9 | 58,70 | Apache 2.0 | Hugging Face |
| NC-32k | 32.768 | si | 227,3 | 57,75 | no disponible | Hugging Face |
| TR-BPE-32k | 32.768 | si | 232,2 | 49,06 | no disponible | Hugging Face |
| Kanarya | no disponible | si | 234,3 | 49,08 | no disponible | Hugging Face |

Frente a tokenizadores con perdida como TURNA (217,5 en 4 dominios, pero solo 22,9 % de round trip) y BERTurk (222,2 y 16,1 % de round trip), MRET 32K ofrece una compresion comparable o mejor manteniendo la reversibilidad completa del texto.

## Limitaciones y advertencias

- Solo turco: no se documenta soporte para otros idiomas; su uso en textos multilingues o en codigo no esta evaluado.
- Sensibilidad a la forma Unicode: el texto en NFD cuesta entre dos y tres veces mas tokens, por lo que es imprescindible normalizar a NFC antes de tokenizar.
- Riesgo de inyeccion de tokens especiales: por defecto, cadenas como `<|user|>` o `<s>` dentro de texto plano se convierten en tokens especiales, lo que permitiria a un usuario inyectar un rol falso. El autor recomienda codificar texto no confiable con `tok(text, add_special_tokens=False, split_special_tokens=True)`.
- Sin normalizacion: al no normalizar, variantes tipograficas o de mayusculas se tokenizan de forma distinta; esto puede afectar a la consistencia en produccion si los datos no estan limpios.
- Sin pesos de modelo: el repositorio contiene unicamente el tokenizador; no es un modelo desplegable por si mismo y no puede evaluarse en tareas de generacion sin un modelo que lo use.
- Evaluacion limitada al corpus del autor: los benchmarks de compresion y morfologia provienen de un corpus propio y de un informe de comparacion del propio autor; no hay validacion independiente en la informacion disponible.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de equidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (analisis de Zeyrek) si se redistribuye el tokenizador.
- Tokens reservados: 57 tokens reservados sin funcion definida; su uso futuro podria cambiar el comportamiento del tokenizador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/egeboy35/mret-32k
- Variante 64K: https://huggingface.co/egeboy35/mret-64k
- Variante 128K: https://huggingface.co/egeboy35/mret-128k
- Tokenizador NC-32k (comparado): https://huggingface.co/nesicn/nc-turkce-bpe-32k
- Tokenizador TR-BPE-32k (comparado): https://huggingface.co/canbingol/tr-bpe-fineweb-alan30-32k
- Tokenizador RK-32k (comparado): https://huggingface.co/rabiskrl/rk-tr-tokenizer-32k
- Tokenizador RE-32k (comparado): https://huggingface.co/rabiaekenn/re-32k-turkish-tokenizer
- Modelo Kanarya (comparado): https://huggingface.co/asafaya/kanarya-750m
- Modelo TURNA (comparado): https://huggingface.co/boun-tabi-LMG/TURNA
- Modelo BERTurk (comparado): https://huggingface.co/dbmdz/bert-base-turkish-cased
- Dataset de analisis morfologico usado en la evaluacion: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis

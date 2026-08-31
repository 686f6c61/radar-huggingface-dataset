# picur/picur-tokenizer

## Resumen

picur-tokenizer es un tokenizer SentencePiece Unigram de 49.152 piezas diseñado específicamente para el húngaro, un idioma aglutinante en el que una misma raíz puede combinarse con una larga serie de sufijos. El autor, picur, lo ha entrenado con un objetivo explícito: segmentar en límites morfológicos reales en lugar de dejar que el criterio de compresión decida los cortes. Así, una palabra como `házakban` se divide en `ház` + `ak` + `ban` (raíz + plural + inesivo), y los sufijos se comparten entre todas las palabras de la misma familia gramatical.

El tokenizer se ha ajustado sobre un corpus de 605 millones de caracteres procedentes de 21 fuentes en húngaro (enciclopédicas, noticias, legales, parlamentarias, académicas, literarias, subtítulos, web y foros), más pequeñas porciones de código y matemáticas. Su relevancia actual radica en que los tokenizers multilingües genéricos suelen fragmentar las palabras húngaras de forma inconsistente, desperdiciando capacidad del modelo en reaprender morfología; esta propuesta ofrece una alternativa orientada a la gramática, con métricas que lo demuestran.

La licencia es Apache 2.0, y el repositorio incluye además un archivo `ties.json` con 929 filas de alomorfos agrupadas en 101 familias de sufijos, pensado para inicializar embeddings compartidos en modelos que lo usen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SentencePiece Unigram |
| Parametros totales | no aplica (tokenizer, no modelo de lenguaje) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | húngaro (optimizado); ingles y codigo parcialmente; otros idiomas caen a byte fallback |
| Licencia | Apache 2.0 |
| Formato de pesos | archivos de SentencePiece (`.model` y `.vocab`), cargables via `AutoTokenizer` de Transformers |

## Arquitectura y entrenamiento

El tokenizer usa el algoritmo Unigram implementado en SentencePiece. Su entrenamiento sigue un proceso en cinco pasos:

1. **Semilla** - 22.361 piezas fijadas de antemano: 12.000 raíces frecuentes, 4.000 entidades nombradas, 4.000 formas capitalizadas, 445 sufijos, 2.011 raíces con alternancia y 448 palabras clave de programación.
2. **Sobreajuste** - se entrena un vocabulario Unigram grande sobre el corpus.
3. **Expulsión** - se elimina cualquier pieza que sea una flexión regular de una palabra declarada en el léxico húngaro de referencia. Por ejemplo, `okat` no es una pieza, sino que se descompone en `ok` y `at`.
4. **Rescate** - se revierte una expulsión si la segmentación resultante empeora respecto a lo que dicta la morfología.
5. **Poda** - se descartan las filas que el corpus nunca alcanza.

El resultado es un vocabulario que mantiene las raíces como piezas únicas y reserva filas propias para los sufijos, respetando la armonía vocálica (por eso existen `ban` y `ben`, `kel` y `kal`, etc.). El archivo `ties.json` agrupa alomorfos de la misma función gramatical para facilitar el aprendizaje de la relación en modelos posteriores.

## Capacidades

- Segmentación morfológica del húngaro: separa raíces, sufijos flexivos y derivativos en piezas consistentes.
- Manejo de armonía vocálica: reconoce variantes de un mismo sufijo según la vocal de la raíz.
- Compuestos: corta palabras compuestas en el límite declarado por el léxico (p. ej., `csapadékvíz` → `csapadék` + `víz`).
- Alternancias de raíz: maneja casos como `mű` → `műv` en `művek`.
- Soporte de tokens especiales: incluye `<|unk|>`, `<|bos|>`, `<|eos|>`, `<|pad|>`, marcadores ChatML (`<|im_start|>`, `<|im_end|>`) y tokens reservados para extensiones futuras.
- Marcadores de tool-call siguiendo la convención Hermes (`<tools>`, `<tool_call>`, `<tool_response>`).
- Cubre texto técnico (código y matemáticas) con piezas específicas, evitando caer a byte fallback en esos dominios.
- Incluye un archivo `ties.json` con 929 filas de alomorfos en 101 familias de sufijos, utilizable como ayuda de inicialización de embeddings.

## Casos de uso

- **Entrenamiento de LLMs en húngaro**: el tokenizer puede servir como capa de entrada para modelos de lenguaje desde cero, reduciendo la carga de aprendizaje morfológico y mejorando la eficiencia de parámetros.
- **Fine-tuning de modelos multilingües**: sustituir el tokenizer original por este permite que los modelos preentrenados en otros idiomas se adapten mejor al húngaro, especialmente en tareas de generación de texto con muchas formas flexivas.
- **Sistemas de análisis morfológico**: al segmentar en límites reales de morfemas, facilita tareas de lematización, análisis gramatical y etiquetado POS sin necesidad de herramientas externas.
- **Traducción automática húngaro ↔ otros idiomas**: un tokenizador con mejor cobertura morfológica reduce la fragmentación y mejora la alineación de palabras en modelos seq2seq.
- **Chatbots y asistentes en húngaro**: los tokens especiales ChatML y los marcadores de tool-call permiten integrarlo directamente en pipelines conversacionales con formato estándar.
- **Procesamiento de documentos legales o académicos en húngaro**: al estar entrenado con fuentes de esos dominios, mantiene una segmentación estable en vocabulario técnico y formal.

## Benchmarks y rendimiento

El autor evaluó el tokenizer sobre 20.000 documentos fuera de entrenamiento (1,45 millones de pares ponderados), comparando sus segmentaciones con análisis morfológicos de estado finito del mismo corpus. Los resultados publicados son:

| Metrica | Valor | Descripcion |
|---|---|---|
| morph-f1 | 75,2 % | precision 89,4 % / recall 64,9 % contra límites morfológicos verificados |
| stem seam | 71,7 % | palabras flexionadas cortadas en el límite de la raíz |
| one-piece function | 69,0 % | funciones gramaticales que son una sola fila (99 funciones) |
| single-token lemma | 96,7 % | lemas del diccionario que sobreviven como una sola pieza |
| paradigm spread | 1,30 filas | filas distintas que un paradigma gasta; 1,0 es ideal |
| chars/token | 3,748 | fertilidad en prosa húngara (referencia, no objetivo) |
| round-trip failures | 0 | en la muestra completa de evaluación |
| byte fallback | 0,070 % | proporción de tokens que caen a bytes |

El autor señala que el ajuste que maximizaba chars/token (fertilidad) solo alcanzaba un 53,2 % de morph-f1, frente al 75,2 % de esta versión, confirmando que la mejora morfológica es deliberada y a costa de una ligera pérdida de compresión.

## Requisitos de hardware

- **VRAM**: no requiere GPU. Es un tokenizer puro, se ejecuta en CPU con un consumo mínimo de memoria (el vocabulario ocupa unas decenas de MB).
- **GPU recomendadas**: ninguna; cualquier CPU moderna es suficiente para tokenizar a velocidades de miles de tokens por segundo.
- **Compatibilidad con consumer GPU**: no aplica.
- **Opciones de despliegue**: se carga con `AutoTokenizer.from_pretrained("picur/picur-tokenizer")` en Transformers. Al ser un archivo SentencePiece estándar, también puede usarse directamente con la librería `sentencepiece`.
- **Latencia y throughput**: no se han publicado mediciones formales, pero al tratarse de un modelo Unigram de tamaño moderado, la tokenización es de órdenes de magnitud más rápida que la inferencia de cualquier LLM.

## Comparativa con modelos similares

No se dispone de datos de otros tokenizers específicos para húngaro con los que comparar directamente. Como referencia cualitativa, frente a tokenizers multilingües genéricos (p. ej., los de mBART o XLM-R), este tokenizer ofrece una segmentación morfológicamente consciente, pero está limitado al húngaro y a un vocabulario de 49.152 piezas. No se han publicado comparaciones cuantitativas con esos sistemas.

## Limitaciones y advertencias

- **Enfoque húngaro-céntrico**: el inglés y el código están cubiertos de forma parcial, pero no optimizados; otros idiomas caen a byte fallback, lo que degrada la eficiencia en textos multilingües.
- **Cobertura basada en léxico**: las raíces fuera de las 12.000 semillas pueden segmentarse incorrectamente. El ejemplo dado es `gyeplőhöz`, donde el sufijo `-höz` se corta bien pero la raíz se divide en `gyep` + `lő`.
- **Límites de compuestos dependientes del léxico**: un compuesto ausente del léxico declarado no recibe un corte garantizado.
- **Manejo parcial de entidades con mayúsculas**: solo 4.000 formas capitalizadas están sembradas; más allá de eso, la capitalización cuesta una fila extra.
- **Colisión de U+2581**: el normalizador reemplaza el carácter U+2581 por un espacio antes de que Metaspace añada su marca, de modo que cualquier texto que contenga ese carácter (p. ej., un sparkline) verá ese carácter convertido en espacio. El espacio inicial de la entrada se descarta por la misma razón.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el tokenizer está pensado como pieza de infraestructura; no incluye un modelo de lenguaje asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/picur/picur-tokenizer
- Documentación de SentencePiece (algoritmo subyacente): no se proporciona enlace oficial en la ficha del modelo.

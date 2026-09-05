# klokedm/Micka-65k

## Resumen

Micka-65k es un tokenizador BPE de nivel byte desarrollado por Marko Kokol (klokedm) para su uso en modelos centrados en esloveno, con apoyo de inglés y croata. No contiene pesos de modelo de lenguaje; se trata únicamente de un tokenizador de 65.536 identificadores (65.408 tokens ordinarios y 128 tokens especiales) que garantiza una tokenización sin pérdidas: el texto original se recupera exactamente tras codificar y decodificar. Este tokenizador resuelve el problema de la baja eficiencia de los tokenizadores multilingües genéricos en esloveno, ofreciendo un vocabulario compacto y especializado.

Su relevancia radica en que puede integrarse en el preentrenamiento o adaptación de modelos de lenguaje eslovenos, croatas o multilingües, y en que su revisión independiente confirma una fidelidad de round-trip del 100 % en 24.276 pruebas. No define una ventana de contexto porque no es un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BPE de nivel byte (byte-level BPE) |
| Parámetros totales | No disponible (tokenizador, sin pesos de modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (tokenizador, no define ventana de contexto) |
| Tipos de cuantización | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Esloveno, inglés, croata (otros idiomas europeos representables, pero con menor eficiencia) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No aplica (tokenizador: tokenizer.json) |

## Arquitectura y entrenamiento

El tokenizador sigue una arquitectura BPE de nivel byte, sin normalización Unicode, con un alfabeto que cubre los 256 valores de byte. Los dígitos se pretokenizan individualmente. El entrenamiento se realizó sobre 514.965.206 bytes UTF-8 distribuidos en 198.223 registros, con una proporción de 73,9412 % de esloveno según las etiquetas de origen. Los conjuntos de datos utilizados incluyen HuggingFaceFW/fineweb-2, HuggingFaceFW/fineweb, HuggingFaceFW/finepdfs, cjvt/Nemotron-CC-Math-4plus_translated, cjvt/Nemotron-Pretraining-SFT_translated y cjvt/sl_code_feedback.

Se entrenó localmente un candidato BPE con 66.048 entradas, frecuencia mínima 3 y longitud máxima de token 64. Tras un filtro revisado, se retuvieron 65.152 merges aprendidos válidos y dependientes, en orden de rango, junto con 256 tokens de byte y 128 tokens especiales. Las entradas de reemplazo provienen de merges de menor rango, no de relleno sintético. El filtro excluyó 20 entradas de agencias o fuentes (por ejemplo, Reuters, Getty, AddThis), pero conservó las formas "STA" y " STA" por instrucción explícita del autor. La revisión independiente confirmó 24.276/24.276 round-trips exactos de texto y cero tokens desconocidos en 23 configuraciones de idioma y escritura.

## Capacidades

- Tokenización sin pérdidas: 24.276/24.276 pruebas de round-trip exacto y cero tokens desconocidos.
- Preservación de espacios, mayúsculas y composición Unicode.
- Sin normalización Unicode: el alfabeto cubre todos los 256 valores de byte.
- Pretokenización de dígitos individualmente.
- Chat template que inserta marcadores de protocolo explícitos para mensajes de sistema, usuario, asistente y herramienta.
- Marcadores especiales para turnos, canales, herramientas, modalidades, idiomas, tareas y otros fines, definidos en el esquema de tokens especiales.
- Compatible con Transformers y Tokenizers sin necesidad de código remoto ni confianza en código externo.
- No genera texto, no soporta tool calling, ni ejecuta agentes o razonamiento multi-paso por sí mismo.

## Casos de uso

- Preentrenamiento de un modelo de lenguaje esloveno desde cero: el vocabulario especializado en esloveno permite una compresión más eficiente del corpus en comparación con tokenizadores genéricos.
- Adaptación de un modelo multilingüe existente (por ejemplo, Gemma) para esloveno: se puede evaluar la eficiencia de tokenización y sustituir el tokenizador nativo en un proceso de fine-tuning.
- Sistemas de traducción automática esloveno-inglés-croata: la tokenización sin pérdidas garantiza que los textos se reconstruyan exactamente en los tres idiomas.
- Procesamiento de documentos PDF y textos legales eslovenos: los datos de entrenamiento incluyen finepdfs y textos traducidos, y el tokenizador maneja caracteres especiales como Č, š, ž, đ o € sin alteraciones.
- Archivado y preservación de textos: el round-trip exacto permite tokenizar y decodificar sin modificar el contenido original, lo que resulta útil en tareas de conservación digital.
- Evaluación y comparación de tokenizadores para idiomas de Europa del Este: se pueden medir tasas de compresión y fidelidad frente a alternativas como el tokenizador nativo de Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que Micka-65k no es un modelo generativo. A continuación se presentan las métricas de tokenización publicadas por el autor:

| Métrica | Resultado |
|---|---|
| Round-trip exacto | 24.276/24.276 (100 %) |
| Tokens desconocidos | 0 |
| Configuraciones de idioma/script evaluadas | 23 |
| Tamaño del vocabulario | 65.536 IDs |
| Datos de entrenamiento | 514.965.206 bytes UTF-8, 198.223 registros |

## Requisitos de hardware

- VRAM estimada: no aplica, al no haber pesos de modelo.
- GPU recomendada: no se requiere GPU; funciona en CPU.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: Transformers (AutoTokenizer) y Tokenizers (carga directa de tokenizer.json). No requiere vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible, aunque al ser un BPE de vocabulario moderado, la tokenización es rápida en cualquier máquina con Python.

## Comparativa con modelos similares

No se dispone de una comparativa exhaustiva publicada con otros tokenizadores de la misma categoría. El README indica que, en idiomas europeos distintos del esloveno, este tokenizador suele ser menos eficiente que el tokenizador nativo de Gemma. A continuación se muestra una comparación cualitativa limitada:

| Modelo | Vocabulario | Idiomas | Fidelidad | Licencia |
|---|---|---|---|---|
| Micka-65k | 65.536 | esloveno, inglés, croata | Round-trip 100 % (24.276 pruebas) | CC-BY-4.0 |
| Tokenizador nativo de Gemma | No disponible | Multilingüe | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera respuestas ni ejecuta herramientas por sí mismo.
- Sin normalización Unicode: puede afectar a textos con caracteres compuestos o descompuestos.
- Algunos tokens contienen solo parte de un carácter UTF-8: hay que decodificar secuencias completas en lugar de concatenar tokens decodificados por separado.
- Los marcadores de control son sintaxis reservada: si aparecen en contenido no confiable, deben manejarse deliberadamente para evitar efectos no deseados.
- No define una ventana de contexto: el sentinel de longitud máxima no establece un límite de contexto del modelo.
- El entrenamiento utilizó muestras acotadas de shards seleccionados, no una cobertura exhaustiva ni aleatoria global del corpus.
- El filtro de vocabulario excluyó 20 entradas de agencias y fuentes (Reuters, Getty, AddThis, entre otras), lo que puede afectar a nombres de marcas o términos propios en textos; sin embargo, todas las cadenas siguen siendo codificables como piezas más pequeñas.
- Licencia CC-BY-4.0: requiere atribución adecuada al autor y a la fuente original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/klokedm/Micka-65k
- Perfil del autor en Hugging Face: https://huggingface.co/klokedm

No se encontraron otros enlaces relevantes en los resultados de búsqueda web.

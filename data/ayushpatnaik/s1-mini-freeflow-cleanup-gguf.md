# ayushpatnaik/S1-mini-FreeFlow-cleanup-GGUF

## Resumen

S1-mini FreeFlow Cleanup (GGUF, Q4_0) es una compilación en formato GGUF del modelo de limpieza de dictado S1-mini FreeFlow Cleanup, un ajuste fino de S1-mini de Superwhisper (basado en Qwen3-0.6B). Su función es transformar transcripciones crudas de voz a texto en texto limpio y listo para usar: elimina muletillas, tartamudeos y arranques abandonados, aplica autocorrecciones habladas, corrige puntuación, mayúsculas y errores de reconocimiento, y convierte la puntuación dictada y sintaxis de desarrollador en su forma escrita. Es el modelo de limpieza de la aplicación TellWell para Android, donde se ejecuta en el propio teléfono mediante llama.cpp.

El modelo resuelve un problema muy concreto del dictado por voz: las transcripciones de los reconocedores de habla incluyen disfluencias, repeticiones y errores que hacen que el texto resultante no sea directamente utilizable. En lugar de pedir al usuario que edite manualmente, este modelo reescribe la transcripción respetando las palabras, el tono y las matizaciones del hablante, sin añadir contenido no dicho ni responder a las instrucciones que aparezcan en el texto dictado.

Con 596 millones de parámetros totales y un tamaño de repositorio de 0,4 GB, está diseñado para inferencia local en dispositivos móviles. La versión Q4_0 (382 MB) se eligió porque funciona tanto en el backend NPU Hexagon de llama.cpp como en CPU y GPU, y en cinco dictados sintéticos de prueba produjo la misma salida que el modelo MLX de 6 bits. La licencia es la de S1-mini (Apache 2.0 con cláusula de nombrado), y el modelo está entrenado principalmente en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-0.6B, ajuste fino de S1-mini de Superwhisper) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_0 (GGUF); modelo base en MLX 6 bits |
| Idiomas soportados | Inglés (principal); algo de hinglish, francés, español y alemán en entrenamiento, con poca evaluación |
| Licencia | s1-mini-license (Apache 2.0 más cláusula de nombrado) |
| Formato de pesos | GGUF (llama.cpp); modelo base en MLX 6 bits |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de S1-mini de Superwhisper, que a su vez se basa en Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. La compilación GGUF Q4_0 conserva la arquitectura del modelo base y se distribuye como un único archivo de 382 MB con hash SHA-256 `ff7dfbc19d7220ac7e1f7cd88bc95da3db7e7e7893a35ea552895727605abddc`. El autor indica que Q4_0 se eligió por compatibilidad con el backend NPU Hexagon de llama.cpp además de CPU y GPU, y que en cinco dictados sintéticos de prueba la salida coincidió con la del modelo MLX de 6 bits.

El entrenamiento se realizó sobre aproximadamente 5.100 ejemplos, todos sintéticos o públicos, sin dictados reales de usuarios, vocabulario ni contenido de pantalla. La composición incluye pares de limpieza del dataset público WhisperNow cleanup (split de entrenamiento, solo filas con licencia MIT), generadores programáticos de muletillas y tartamudeos, autocorrecciones (incluidas correcciones tardías en dictados largos), puntuación dictada y sintaxis de desarrollador, maquetación de correos electrónicos, instrucciones que no deben ejecutarse y texto que debe preservarse. También se incluyeron errores de reconocimiento capturados al pronunciar frases sintéticas con voces de macOS y transcribirlas con Orukeet (un ajuste fino de NVIDIA Parakeet TDT 0.6B v3), usados para correcciones de vocabulario y palabras de pantalla con trampas; frases inacabadas que deben permanecer inacabadas; palabras numéricas con términos en pantalla ("eighth bit" a 8-bit); frases con "actually" que no son correcciones; y respuestas de resumen de contexto a partir de plantillas. No se menciona RLHF ni DPO en la información disponible.

Una innovación destacable es el formato de prompt fijo y compacto, con un system prompt específico y un mensaje de usuario con marcadores `<<<RAW_TRANSCRIPTION ... RAW_TRANSCRIPTION`. El modelo debe renderizarse con la plantilla de chat con el modo thinking desactivado (bloque vacío `<think>\n\n</think>\n\n` tras `<|im_start|>assistant`) y decodificación greedy (`--temp 0`). El autor advierte que otros prompts funcionan mucho peor.

## Capacidades

- Limpieza de transcripciones de voz a texto: elimina muletillas, tartamudeos, palabras repetidas y arranques abandonados, conservando las palabras, el tono y las matizaciones del hablante.
- Aplicación de autocorrecciones habladas: conserva solo la versión final y descarta la señal de corrección ("Thursday, no actually Wednesday" pasa a "Wednesday").
- Corrección de puntuación, mayúsculas y errores evidentes de reconocimiento.
- Conversión de puntuación dictada ("comma", "period") y sintaxis de desarrollador ("dash dash fix" a `--fix`, "user underscore id" a `user_id`).
- Uso de vocabulario, contexto o palabras de pantalla para corregir términos mal oídos, sin añadir palabras que no se dijeron.
- Preservación del idioma de la transcripción y del texto mezclado de idiomas.
- Gestión de maquetación de correos electrónicos: saludo hablado en línea propia y despedida en párrafo aparte.
- Retorno de `EMPTY` cuando solo se dijo relleno.
- No responde ni ejecuta instrucciones contenidas en la transcripción: las trata como texto a limpiar.
- No usa markdown ni listas salvo que el hablante las pida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de forma nativa según la información disponible.

## Casos de uso

- Dictado en dispositivos Android: integración en la aplicación TellWell para limpiar en el propio teléfono las transcripciones del reconocedor de voz antes de insertarlas en el campo de texto, con latencia de 0,4-0,6 s en NPU Hexagon y unos 2,2 s en CPU de 4 hilos para un dictado de 10 palabras con las instrucciones en la caché KV.
- Corrección de notas de voz transcritas: el modelo elimina disfluencias y aplica autocorrecciones en transcripciones de reuniones o notas personales, dejando un texto legible sin alterar el contenido dicho.
- Redacción de correos por voz: convierte un dictado con saludo, cuerpo y despedida en un correo con la maquetación adecuada (saludo en línea propia, despedida en párrafo aparte), sin markdown ni listas no solicitadas.
- Dictado de código y comandos: transforma sintaxis hablada de desarrollador en su forma escrita (`--fix`, `user_id`), útil para dictar comandos de terminal o nombres de variables.
- Limpieza con vocabulario específico del dominio: usando el bloque de vocabulario de FreeFlow, corrige nombres propios, términos técnicos y palabras de pantalla mal reconocidos, lo que resulta adecuado para entornos con jerga especializada.
- Preprocesado en pipelines de voz a texto: como etapa de postprocesado local y de baja latencia entre el reconocedor y la aplicación final, sin depender de la nube.
- Filtrado de dictados vacíos: devuelve `EMPTY` cuando la transcripción solo contiene relleno, lo que permite descartar entradas sin contenido útil de forma automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye datos de velocidad en un Motorola Edge 70 (Snapdragon 7 Gen 4) con llama.cpp para un dictado de 10 palabras con las instrucciones en la caché KV:

| Backend | Tiempo por limpieza |
|---|---|
| NPU Hexagon | aproximadamente 0,4-0,6 s |
| CPU, 4 hilos | aproximadamente 2,2 s |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_0 ocupa 382 MB, por lo que la inferencia cabe en menos de 1 GB de memoria en la mayoría de configuraciones.
- GPU recomendadas: no se especifican GPU de escritorio; el modelo está orientado a ejecución en teléfonos Android con NPU Hexagon (Snapdragon) y CPU.
- Cabe en GPU de consumo: sí, por tamaño (382 MB en Q4_0), aunque no se proporcionan datos de rendimiento en GPU de escritorio.
- Opciones de despliegue: llama.cpp (probado con `llama-completion`); el modelo base está en formato MLX 6 bits.
- Latencia y throughput: en un Motorola Edge 70 (Snapdragon 7 Gen 4) con llama.cpp, aproximadamente 0,4-0,6 s por limpieza en NPU Hexagon y aproximadamente 2,2 s en CPU de 4 hilos para un dictado de 10 palabras con las instrucciones en la caché KV.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas con modelos alternativos en la información proporcionada. Como referencia de categoría, el modelo base es S1-mini de Superwhisper (Qwen3-0.6B), y el propio autor menciona el modelo MLX de 6 bits del que deriva esta compilación GGUF; no se ofrecen métricas comparativas con otras alternativas de limpieza de dictado.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| S1-mini FreeFlow Cleanup (GGUF Q4_0) | 596.049.920 | no disponible | s1-mini-license | GGUF |
| S1-mini FreeFlow Cleanup (MLX 6 bits) | no disponible | no disponible | s1-mini-license | MLX |
| S1-mini de Superwhisper (base) | no disponible (Qwen3-0.6B) | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es principalmente inglés; aunque incluye algo de hinglish, francés, español y alemán en el entrenamiento, hay poca evaluación en esos idiomas.
- En dictados largos (más de 100 palabras) puede perder una frase junto a una corrección del tipo "Actually, ...": según el autor, falla 1 de cada 5 pruebas largas.
- Es un modelo de 0,6B que sigue un formato fijo: no sigue instrucciones personalizadas, no hace modo edición ni traduce.
- Las sugerencias de vocabulario se usan con menos fiabilidad al principio de una frase y para términos todo en minúsculas.
- Riesgo de alucinación: aunque el prompt indica no añadir palabras no dichas, es un modelo generativo pequeño y puede desviarse del texto original.
- Requiere un formato de prompt específico y decodificación greedy con thinking desactivado; otros prompts funcionan mucho peor.
- Restricciones de licencia: se distribuye bajo la licencia de S1-mini (Apache 2.0 más cláusula de nombrado); cualquier uso o distribución debe seguir identificando el modelo como "S1-mini" de "Superwhisper".
- Los datos de entrenamiento incluyen filas con licencia MIT del dataset WhisperNow cleanup (category271/whispernow-cleanup).
- No se han publicado datos sobre sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayushpatnaik/S1-mini-FreeFlow-cleanup-GGUF
- Modelo base (MLX 6 bits): https://huggingface.co/ayushpatnaik/S1-mini-FreeFlow-cleanup-MLX-6bit
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset WhisperNow cleanup: https://huggingface.co/datasets/category271/whispernow-cleanup

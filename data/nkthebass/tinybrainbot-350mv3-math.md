# nkthebass/tinybrainbot-350mV3-math

## Resumen

TinyBrainBot 350M V3 Math es un modelo de lenguaje pequeño (348 millones de parámetros) desarrollado por nkthebass, especializado en aritmética de columnas mediante un scratchpad escrito. Se trata de un modelo decoder-only entrenado desde cero, que parte de la base TinyBrainBot 350M V3 Instruct y se somete a diez rondas de ajuste fino supervisado (SFT) en tareas matemáticas, con la fusión de dos adaptadores LoRA. Resuelve sumas y restas de hasta cinco dígitos y multiplicaciones de dos dígitos con una precisión media del 99,97 % en el protocolo aritmético de GPT-3, superando a su predecesor, el TinyBrainBot 320M V2 Math, en las nueve sub-tareas evaluadas.

El modelo está diseñado como una "calculadora con scratchpad": genera paso a paso el razonamiento columna por columna en lugar de ofrecer solo el resultado final. Con una ventana de contexto de 2048 tokens y un vocabulario de 32 000 tokens, es ligero y puede ejecutarse en hardware modesto. Su relevancia radica en que demuestra que un modelo pequeño puede aprender algoritmos aritméticos generalizables en longitud, aunque presenta limitaciones claras en restas con resultado negativo y en multiplicaciones con multiplicadores de más de dos dígitos. Está disponible bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only, pre-norm, RMSNorm, SwiGLU, RoPE, GQA (18 Q / 6 KV heads) |
| Parámetros totales | 348.342.912 (~348M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 |
| Tipos de cuantización | GGUF; tipos no especificados en la documentación |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura decoder-only con pre-normalización, RMSNorm, activación SwiGLU, embeddings rotacionales (RoPE) y atención de consultas agrupadas (GQA) con 18 cabezas de consulta y 6 cabezas de clave/valor. Tiene 22 capas, un tamaño de ocultación de 1152 y un vocabulario de 32 000 tokens con embeddings atados. El contexto máximo es de 2048 tokens.

El entrenamiento sigue una línea de desarrollo: primero se entrenó un modelo base de 350M V3 desde cero, luego se ajustó con instrucciones para obtener la variante Instruct, y finalmente se aplicaron diez rondas de ajuste fino supervisado en tareas matemáticas, fusionando dos adaptadores LoRA. La model card no especifica el número exacto de tokens de entrenamiento ni la composición del dataset, más allá de que los generadores de datos ordenaban los operandos para evitar resultados negativos. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Instruct base.
- Aritmética de columnas con scratchpad: suma y resta de hasta 5 dígitos y multiplicación de 2 dígitos con precisión casi perfecta.
- Generalización en longitud: el algoritmo de suma y resta se extiende a operandos de 7 dígitos, fuera de la distribución de entrenamiento, con una precisión aproximada del 98 %.
- Capacidad de seguir plantillas de preguntas aritméticas variadas tras el ajuste de parafraseo (80 % en phrasings no vistos).
- No se menciona soporte de tool calling ni function calling en la documentación disponible.
- No es un solucionador de problemas de palabras ni razona sobre contextos semánticos complejos.
- Solo soporta el idioma inglés.

## Casos de uso

- Cálculo aritmético en aplicaciones educativas: el modelo puede generar el desglose paso a paso de sumas y restas de hasta 5 dígitos, lo que resulta útil para explicar algoritmos de cálculo a estudiantes.
- Verificación de sumas en facturación: puede comprobar automáticamente totales de columnas en documentos financieros, siempre que los operandos estén ordenados para evitar restas negativas.
- Asistente de cálculo en entornos de escritorio o edge: al ser un modelo de 348M, puede ejecutarse en CPU o GPU modestas, ofreciendo una calculadora conversacional sin conexión.
- Generación de ejercicios aritméticos con solución: puede crear problemas de suma, resta y multiplicación de 2 dígitos junto con su resolución, para plataformas de práctica de matemáticas.
- Validación de resultados en pipelines de datos: en procesos de ingesta de datos numéricos, puede contrastar operaciones aritméticas simples dentro de un flujo de automatización.
- Prototipo de calculadora para interfaces de voz: su naturaleza ligera y su capacidad de seguir instrucciones permiten integrarlo en asistentes de voz para operaciones aritméticas básicas.

## Benchmarks y rendimiento

En el protocolo aritmético de GPT-3, con zero-shot, n=300 por sub-tarea, decodificación greedy y coincidencia exacta sobre el número final, el modelo obtiene los siguientes resultados en comparación con su predecesor:

| Sub-tarea | TinyBrainBot 350M V3 Math | TinyBrainBot 320M V2 Math |
|---|---|---|
| Suma de 2 dígitos | 100.0 | 83.0 |
| Suma de 3 dígitos | 100.0 | 97.7 |
| Suma de 4 dígitos | 100.0 | 98.7 |
| Suma de 5 dígitos | 100.0 | 91.7 |
| Resta de 2 dígitos | 100.0 | 95.3 |
| Resta de 3 dígitos | 100.0 | 91.0 |
| Resta de 4 dígitos | 100.0 | 94.7 |
| Resta de 5 dígitos | 99.7 | 92.0 |
| Multiplicación de 2 dígitos | 100.0 | 79.3 |
| Promedio | 99.97 | 91.5 |

Estos resultados corresponden a operandos ordenados, de modo que las restas nunca producen resultados negativos. En pruebas de generalización fuera de la distribución, el modelo alcanza un 80 % en parafraseos no vistos, aproximadamente un 98 % en sumas de 7 dígitos y alrededor de un 5 % en multiplicaciones de 3×3 dígitos. No se han publicado resultados de benchmarks como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 1,4 GB en FP32; en FP16 se reducen a unos 700 MB. Con cuantizaciones GGUF, el consumo puede bajar a menos de 500 MB, aunque no se especifican los tipos exactos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una NVIDIA GTX 1650 o superior. En CPU es viable para inferencia con baja latencia, gracias al tamaño reducido del modelo.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en tarjetas como RTX 3060, RTX 4060 o RTX 4090 sin problemas.
- Opciones de despliegue: transformers, llama.cpp, Ollama y text-generation-inference, según los tags del repositorio. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

El modelo se compara directamente con su predecesor, TinyBrainBot 320M V2 Math, que también está especializado en aritmética. La tabla de benchmarks muestra que el 350M V3 Math supera al V2 en las nueve sub-tareas, con un promedio de 99,97 % frente a 91,5 %. No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

| Modelo | Parámetros | Contexto | Promedio GPT-3 aritmética | Licencia |
|---|---|---|---|---|
| TinyBrainBot 350M V3 Math | 348M | 2048 | 99,97 % | Apache 2.0 |
| TinyBrainBot 320M V2 Math | 320M | 2048 | 91,5 % | Apache 2.0 |

## Limitaciones y advertencias

- El modelo no maneja restas con resultado negativo: si el segundo operando es mayor que el primero, devuelve un número positivo incorrecto con confianza. La precisión en estos casos se sitúa entre el 5 % y el 16 % según la anchura.
- No es un solucionador de problemas de palabras: no razona sobre contextos semánticos ni resuelve problemas matemáticos enunciados de forma compleja.
- Multiplicaciones con multiplicadores de más de dos dígitos quedan fuera de su capacidad: la precisión en multiplicaciones de 3×3 dígitos es de aproximadamente el 5 %, con errores cercanos al resultado correcto.
- Ventana de contexto limitada a 2048 tokens, lo que restringe conversaciones largas o documentos extensos.
- Solo soporta inglés.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no garantiza un rendimiento fuera de los casos de uso descritos.
- Se recomienda encarecidamente usar decodificación greedy (do_sample=False); el muestreo aleatorio introduce errores en los dígitos del scratchpad.

## Enlaces

- HuggingFace: https://huggingface.co/nkthebass/tinybrainbot-350mV3-math
- Modelo base instruct: https://huggingface.co/nkthebass/tinybrainbot-350mV3-instruct
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.

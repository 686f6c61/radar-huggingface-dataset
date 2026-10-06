# polternet/polternet-lora-v3-dpo

## Resumen

Polternet lora v3 dpo es un adaptador LoRA de bajo rango (r=16, alpha=32) construido sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Lo publica el usuario polternet en HuggingFace y está especializado en la resolución de tareas escolares en ruso: matemáticas (fracciones, potencias, ecuaciones cuadráticas, porcentajes, probabilidad y geometría), lengua rusa, informática, química y física. El adaptador añade unos 30 millones de parámetros entrenables, apenas el 0,96 % de los 3,09 mil millones del modelo base, por lo que se distribuye como un fichero PEFT independiente de 0,1 GB y no incluye los pesos originales.

El problema que aborda es concreto: obtener un modelo pequeño capaz de resolver y, sobre todo, de responder con el formato numérico correcto en un banco de problemas escolares rusos. Según la model card, alcanza un 89,0 % (178/200) en un conjunto de evaluación propio denominado holdout-200, frente al 86,0 % que obtiene qwen2.5-coder:7b en el mismo banco, con menos de la mitad de parámetros activos. La relevancia actual reside en demostrar que un ajuste paramétricamente eficiente con una etapa de DPO puede igualar o superar a modelos bastante mayores en un dominio vertical estrecho.

La limitación principal es la ausencia de validación independiente: el repositorio acumula 0 descargas y 0 likes, no hay pipeline declarado y el propio autor advierte que el holdout procede de los mismos generadores que parte de los datos de entrenamiento, por lo que la cifra mide seguimiento de formato y aritmética más que transferencia real a problemas nuevos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre un transformer decoder-only Qwen2.5-3B-Instruct; incluye una etapa DPO según el nombre del repositorio |
| Parámetros totales | 3,09 mil millones en el modelo base más 30 millones entrenables en el adaptador (0,96 % del base, dato de la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens heredados del modelo base Qwen2.5-3B-Instruct; no se especifica en la model card del adaptador |
| Tipos de cuantización | no disponible (el adaptador se publica solo en safetensors/PEFT; no hay cuantizaciones oficiales publicadas) |
| Idiomas soportados | ruso (según los tags del repositorio); el modelo base es multilingüe, pero el adaptador no ha sido evaluado en otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato PEFT; requiere descargar aparte los pesos de Qwen/Qwen2.5-3B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA (Low-Rank Adaptation), técnica de ajuste paramétricamente eficiente que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas proyecciones. Con r=16 y alpha=32, el conjunto entrenable asciende a unos 30 millones de parámetros. El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA), con 36 capas, 2048 dimensiones ocultas y 16 cabezas de consulta frente a 2 de clave/valor. Los detalles anteriores proceden de la documentación pública del modelo base, no de la model card del adaptador.

La model card indica que el entrenamiento se centró en problemas escolares en ruso y que el resultado se midió con un banco de 200 preguntas verificadas numéricamente mediante `Fraction`, no por coincidencia de cadenas. El nombre del repositorio (v3-dpo) sugiere una etapa de optimización por preferencias directas (DPO) posterior al ajuste supervisado, aunque no se detalla la composición del dataset de preferencias ni el número de tokens de entrenamiento. El autor documenta además dos hallazgos internos: que el voto por mayoría con 5 muestras empeora el resultado en 11 puntos porcentuales respecto a la decodificación greedy, y que la tasa de acierto con al menos una respuesta correcta entre varias muestras alcanza el 94 %, lo que apunta a la autoverificación como siguiente vía de mejora.

## Capacidades

- Resolución de problemas escolares de matemáticas en ruso: fracciones, potencias, ecuaciones cuadráticas, porcentajes, probabilidad y geometría.
- Respuesta a preguntas de lengua rusa, informática, química y física dentro del currículo escolar.
- Producción de respuestas en formato numérico verificable (el sistema de evaluación compara valores, no texto).
- Ajuste por preferencias (DPO) orientado a mejorar la calidad y el formato de la respuesta final.
- Capacidades heredadas del modelo base Qwen2.5-3B-Instruct, entre ellas generación de texto general e instrucciones multilingües, aunque no han sido evaluadas tras el ajuste.
- Soporte de tool calling o function calling: no disponible (no se menciona ni se evalúa en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el autor plantea la autoverificación como trabajo futuro, no como función implementada.
- Capacidades de visión o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Tutoría automática de matemáticas escolares en ruso: el adaptador responde a problemas de fracciones, ecuaciones y geometría con un formato numérico que puede validarse programáticamente, lo que permite construir un tutor que no solo responda, sino que compruebe la respuesta del alumno.
- Generación y corrección de ejercicios en plataformas educativas rusas: al estar ajustado sobre el currículo escolar ruso, puede producir conjuntos de problemas y servir de referencia para la corrección automática mediante comparación numérica.
- Asistente de deberes para estudiantes rusoparlantes: con 3,09 mil millones de parámetros puede ejecutarse en hardware modesto, lo que facilita su despliegue en portátiles o servidores pequeños para uso individual.
- Evaluación comparativa de técnicas PEFT: sirve como caso de estudio reproducible para medir el impacto de LoRA más DPO en un dominio vertical frente a modelos de mayor tamaño como qwen2.5-coder:7b.
- Investigación en verificación de respuestas: el hallazgo de que el voto por mayoría empeora el resultado greedy es un punto de partida útil para estudiar estrategias de autoverificación en modelos pequeños.
- Integración en sistemas de evaluación automática (LMS): el modelo puede generar la solución de referencia de un ejercicio y devolver solo el valor final, que un corrector externo compara con la respuesta del estudiante.
- Prototipado de asistentes educativos de bajo coste: al ser un adaptador de 0,1 GB sobre un base de 3B, el coste de almacenamiento y de despliegue es mínimo comparado con alternativas de 7B o más.

## Benchmarks y rendimiento

| Modelo | Banco de evaluación | Resultado |
|---|---|---|
| polternet lora v3 dpo | holdout-200 (ruso, nivel escolar) | 89,0 % (178/200) |
| qwen2.5-coder:7b | holdout-200 (mismo banco) | 86,0 % |

Notas metodológicas aportadas por el autor: el holdout-200 fue generado de forma que ninguna pregunta aparece en el entrenamiento, verificado tanto de forma literal como por la estructura numérica; la corrección es numérica mediante `Fraction`. El propio autor señala que el holdout procede de los mismos generadores que parte de los datos de entrenamiento, de modo que la cifra refleja seguimiento de formato y aritmética más que generalización a tareas completamente nuevas. También advierte que las cifras del 77,5 % de mediciones anteriores eran incorrectas por un fallo del comprobador y por nueve problemas físicamente imposibles en el banco. Con 5 muestras y voto por mayoría el resultado empeora 11 puntos porcentuales respecto a greedy; el techo de "al menos una respuesta correcta" es del 94 %. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este adaptador.

## Requisitos de hardware

- Peso del adaptador: aproximadamente 60 MB en fp16 (30 millones de parámetros) dentro de un repositorio de 0,1 GB.
- Modelo fusionado (adaptador más base) en bfloat16: en torno a 6,2 GB de pesos; en fp32, unos 12,4 GB.
- Caché KV estimada del base: unos 36 KB por token (36 capas, 2 cabezas KV, dimensión de cabeza 128, 2 bytes por valor), lo que supone aproximadamente 1,2 GB para llenar los 32 768 tokens de contexto.
- VRAM orientativa para inferencia en bfloat16: 8 GB o más para contexto moderado; 10-12 GB si se quiere exprimir la ventana completa de 32k.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090 24 GB; también Mac con Apple Silicon y 16 GB de memoria unificada o más, una vez cuantizado.
- Cuantizaciones comunitarias del base en GGUF: Q4_K_M alrededor de 2 GB y Q8_0 alrededor de 3,3 GB, lo que permite ejecución en GPU de 6-8 GB o incluso en CPU.
- GPU de centro de datos: A100, H100 o L40S son viables pero sobredimensionadas para un modelo de 3B; tienen sentido si se sirven muchas réplicas en paralelo.
- Opciones de despliegue: transformers con peft (con `merge_and_unload()` para fusionar el adaptador), vLLM sobre el modelo fusionado, llama.cpp u Ollama previa conversión a GGUF, y TGI.
- Latencia y throughput: no disponibles (la model card no publica mediciones de velocidad ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Holdout-200 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| polternet lora v3 dpo | 3,09 mil millones + 30 millones de adaptador | 32 768 (base) | 89,0 % | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct (base sin adaptador) | 3,09 mil millones | 32 768 | no disponible | Apache-2.0 | HuggingFace, ampliamente distribuido |
| qwen2.5-coder:7b | 7,6 mil millones | 32 768 | 86,0 % | Apache-2.0 | HuggingFace y Ollama |
| Qwen2.5-7B-Instruct | 7,6 mil millones | 32 768 | no disponible | Apache-2.0 | HuggingFace, ampliamente distribuido |

La comparación directa solo es posible en el banco holdout-200, definido por el propio autor del adaptador. No hay datos que permitan situar este modelo frente a alternativas en benchmarks estándar, ni comparaciones con otros adaptadores educativos en ruso. La ventaja estructural frente a los modelos de 7B es el coste de despliegue: menos de la mitad de parámetros y un adaptador de 60 MB que se puede superponer a cualquier copia ya existente del base.

## Limitaciones y advertencias

- El repositorio no incluye los pesos base: es obligatorio descargar Qwen/Qwen2.5-3B-Instruct por separado y fusionar el adaptador antes de usarlo.
- Validación externa inexistente: 0 descargas y 0 likes en el momento de redactar esta ficha, sin revisión por pares ni reproducción independiente.
- El holdout-200 procede de los mismos generadores que parte de los datos de entrenamiento, según reconoce el propio autor; la cifra del 89,0 % no equivale a generalización a problemas nuevos.
- Los errores residuales se concentran en respuestas sin cálculos mostrados: el modelo acierta el valor pero no siempre justifica el procedimiento, lo que limita su uso como material didáctico explicativo.
- El voto por mayoría con 5 muestras empeora el resultado 11 puntos porcentuales respecto a la decodificación greedy; conviene evitar estrategias de muestreo múltiple sin verificación.
- Riesgo de alucinación en pasos intermedios de cálculo: la corrección numérica del banco no garantiza que el razonamiento mostrado sea válido.
- Sesgo de dominio: el ajuste está centrado en el currículo escolar ruso, por lo que el rendimiento fuera de ese ámbito o en otros idiomas no está caracterizado.
- Idiomas: aunque el base es multilingüe, el adaptador solo declara ruso y puede degradar el rendimiento del base en otras lenguas.
- Licencia Apache-2.0, que permite uso comercial, pero se deben respetar también las condiciones del modelo base Qwen2.5-3B-Instruct y de la librería PEFT.
- No hay información sobre tool calling, agentes, visión ni audio: no se deben asumir esas capacidades en producción.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/polternet/polternet-lora-v3-dpo
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de LoRA (técnica de ajuste empleada): https://en.wikipedia.org/wiki/LoRA_(machine_learning)
- Ejemplo de adaptador LoRA con DPO sobre Qwen, encontrado en la búsqueda web y no relacionado con este modelo: https://huggingface.co/lewtun/dpo-model-lora
- Repositorio POLARNet, encontrado en la búsqueda web y sin relación con este modelo (reiluminación de retratos): https://github.com/Rex0191/POLARNet/tree/main
- OpenRouter, agregador de modelos encontrado en la búsqueda web y sin relación con este modelo: https://openrouter.ai/
- Documentación de ajuste fino con LoRA en Microsoft Foundry, encontrada en la búsqueda web y sin relación con este modelo: https://learn.microsoft.com/en-us/azure/foundry/openai/how-to/fine-tuning

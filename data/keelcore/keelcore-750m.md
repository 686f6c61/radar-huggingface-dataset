# KeelCore/KeelCore-750M

## Resumen

KeelCore-750M es un modelo base de tipo encoder-decoder desarrollado por Saravanan A R (organización KeelCore) y publicado en octubre de 2026. Se trata de un transformer secuencia a secuencia de 751.889.408 parámetros, con 24 capas de encoder y 24 de decoder, anchura d_model de 1.024 y una ventana de contexto de 2.048 tokens tanto de entrada como de salida. Su vocabulario es de 33.728 piezas SentencePiece con byte fallback, y está entrenado exclusivamente en inglés, código fuente y texto de línea de comandos.

El modelo no está diseñado para usarse directamente como asistente ni como chatbot: es un modelo base sin ajuste por instrucciones. Su propósito es servir de sustrato congelado sobre el que se montan adaptadores LoRA de pequeño tamaño. Según la model card, un adaptador de rango 16 aplicado a todas las capas lineales entrena 18.287.616 parámetros, es decir, el 2,4% del total, manteniendo los pesos base intactos. Esta filosofía de "un modelo base, muchos adaptadores" reduce el coste de añadir nuevas capacidades frente a reentrenar o desplegar un modelo completo por cada tarea.

La relevancia práctica del modelo está en su tamaño contenido y en la disponibilidad de una exportación ONNX en int8, pensada para inferencia en dispositivo y en navegador. El primer producto construido sobre él es EchoMeBetter, una extensión de navegador que ejecuta adaptadores de reescritura de texto localmente. El entrenamiento se realizó con una mezcla de denoizadores UL2, lo que habilita tareas de infilling, reconstrucción y continuación de texto mediante tokens de modo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (secuencia a secuencia) |
| Parametros totales | 751.889.408 (embeddings de entrada y salida atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrada y 2.048 tokens de salida |
| Tipos de cuantizacion | int8 (exportación ONNX); checkpoint original en fp32 |
| Idiomas soportados | Inglés, código fuente y texto de línea de comandos |
| Licencia | KeelCore License, Version 1.0 (licencia "other") |
| Formato de pesos | safetensors (fp32), ONNX (int8), tokenizer SentencePiece (spm.model) |

Datos adicionales de arquitectura: 24 capas de encoder y 24 de decoder, d_model de 1.024, 16 cabezas de atención de 64 dimensiones, feed-forward de 2.816 con GELU con compuerta, RMSNorm en pre-norm y sesgo de posición relativa con 32 buckets y distancia máxima de 128. El vocabulario tiene 33.728 piezas. El checkpoint publicado corresponde al paso 90.000 de 90.000, el mejor de la ejecución. El repositorio ocupa 3,9 GB.

## Arquitectura y entrenamiento

KeelCore-750M es un transformer encoder-decoder clásico. El encoder es bidireccional y procesa la entrada completa antes de que empiece la generación; el decoder atiende al encoder mediante cross-attention en cada paso. Esta disposición es la adecuada para tareas de transformación de texto en las que hay que copiar fragmentos literalmente (URLs, código, números, nombres propios) sin alterarlos. La normalización usa RMSNorm en pre-norm y las posiciones se codifican con sesgo relativo de 32 buckets y distancia máxima de 128, en lugar de posiciones absolutas aprendidas.

El preentrenamiento se hizo desde cero, en una sola ejecución, sobre prosa en inglés, código fuente y texto de línea de comandos, con una mezcla de denoizadores UL2. Esa mezcla es la que permite al modelo rellenar huecos, reconstruir tramos y continuar texto según el token de modo que se anteponga a la entrada: `[S]` para continuar, `[R]` para rellenar tramos cortos y `[X]` para reconstruir tramos largos. En los modos `[R]` y `[X]`, los tramos rellenados se marcan con centinelas `<extra_id_N>`. El entrenamiento se realizó en precisión mixta bf16, aunque el checkpoint publicado está en fp32. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, no se espera ajuste por preferencias.

La innovación técnica destacable no está en la arquitectura, que es convencional, sino en el flujo de trabajo: el modelo se concibe como espina dorsal congelada sobre la que se entrenan adaptadores LoRA de rango 16 en todas las capas lineales. La model card incluye además una exportación ONNX en int8 para ejecución en dispositivo y en navegador, lo que habilita el caso de uso de la extensión EchoMeBetter.

## Capacidades

- Generación de texto por continuación: dado un prefijo y el token de modo `[S]`, el modelo continúa el texto de forma coherente.
- Relleno de huecos cortos: con el token `[R]`, rellena tramos breves marcados con centinelas `<extra_id_N>`.
- Reconstrucción de tramos largos: con el token `[X]`, reconstruye fragmentos extensos de texto.
- Copia literal de fragmentos: al ser encoder-decoder con cross-attention, puede preservar URLs, código, números y nombres tal como aparecen en la entrada.
- Procesamiento de código fuente y texto de línea de comandos, por la composición del corpus de entrenamiento.
- Soporte de adaptadores LoRA: el modelo está pensado para que las capacidades de tarea se añadan mediante adaptadores de rango 16 (18,3 M de parámetros, 2,4% del total).
- Inferencia en dispositivo y en navegador mediante la exportación ONNX int8.
- No dispone de tool calling ni function calling, ni de modo de razonamiento explícito, ni de capacidades de visión o audio.
- No es un modelo de chat ni sigue instrucciones sin un adaptador entrenado para ello.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Reescritura de texto en el navegador: es el caso de EchoMeBetter, la extensión que ejecuta adaptadores de reescritura de KeelCore sobre el modelo en int8 ONNX directamente en el dispositivo del usuario, sin enviar texto a un servidor. El tamaño de 752 M y la exportación int8 lo hacen viable en entornos de cliente.
- Relleno de plantillas y formularios: con el modo `[R]`, el modelo rellena huecos cortos en documentos estructurados preservando el texto circundante, útil para completar campos o normalizar registros.
- Autocompletado de código y comandos: entrenado con código fuente y texto de línea de comandos, puede continuar fragmentos de shell o de código en editores y terminales, siempre que se controle la repetición con `no_repeat_ngram_size`.
- Corrección y reconstrucción de texto dañado: con el modo `[X]`, reconstruye tramos largos corruptos o incompletos, por ejemplo en pipelines de limpieza de datos o de recuperación de documentos OCR.
- Base para adaptadores de dominio: equipos que necesiten una tarea concreta (clasificación, extracción, reescritura de estilo) pueden entrenar un adaptador LoRA de 18,3 M de parámetros sobre el modelo congelado, con un coste de entrenamiento y almacenamiento muy inferior al de ajustar el modelo completo.
- Investigación sobre modelos pequeños basados en adaptadores: el modelo y su informe técnico sirven como referencia reproducible para estudiar el intercambio entre tamaño base y capacidad de los adaptadores.
- Inferencia local en hardware modesto: al caber en fp32 en torno a 3 GB de pesos y en int8 alrededor de 0,75 GB, es desplegable en CPU y en GPU de consumo para tareas de transformación de texto por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 3 GB solo para los pesos (751,9 M de parámetros × 4 bytes), más memoria para activaciones y caché; en la práctica, entre 4 y 6 GB para lotes pequeños.
- VRAM estimada en int8 ONNX: alrededor de 0,75 GB para los pesos, con overhead adicional según el runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 (RTX 3060, RTX 4060, RTX 4090, A100, H100); para int8 basta con hardware de gama baja o CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales con 8 GB o más en fp32, y en muchas integradas en int8.
- Opciones de despliegue: transformers (`AutoModelForSeq2SeqLM`), ONNX Runtime para la exportación int8, y text-generation-inference según las etiquetas del repositorio. No se documenta soporte específico de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| KeelCore-750M | 751,9 M | 2.048 | Encoder-decoder, base | KeelCore License 1.0 | Diseñado para adaptadores LoRA; exportación ONNX int8 |
| T5-base | 220 M | 512 | Encoder-decoder, base | Apache 2.0 | Referencia clásica de encoder-decoder pequeño; contexto menor |
| T5-large | 770 M | 512 | Encoder-decoder, base | Apache 2.0 | Tamaño comparable; contexto menor y sin enfoque en adaptadores |
| FLAN-T5-base | 220 M | 512 | Encoder-decoder, ajustado a instrucciones | Apache 2.0 | Incluye ajuste por instrucciones, que KeelCore no tiene |

La comparación con la familia T5 es la más natural por arquitectura y tamaño. KeelCore-750M ofrece el doble de contexto que T5-large (2.048 frente a 512) y una licencia propia más restrictiva que Apache 2.0. No se dispone de datos de benchmarks que permitan comparar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- No es un modelo de instrucciones ni de chat: sin un adaptador entrenado, no sigue instrucciones ni mantiene conversaciones.
- Riesgo de bucles de repetición: la propia model card advierte que con decodificación greedy simple el modelo puede entrar en repeticiones; recomienda mantener `no_repeat_ngram_size` configurado.
- Idioma limitado al inglés, con código y línea de comandos; no se documenta soporte de castellano ni de otros idiomas.
- Ventana de contexto de 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación inherente a un modelo generativo base, especialmente en continuación libre de texto.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al entrenarse con corpus web de inglés, es esperable que herede sesgos de esos datos.
- Licencia restrictiva: KeelCore License 1.0 es una licencia "other" con términos propios; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que no equivale a Apache 2.0 ni MIT.
- Uso no previsto explícito: decisiones sanitarias, legales o financieras, y cualquier uso fuera de los términos de la licencia.
- El checkpoint está en fp32; para producción en dispositivos conviene usar la exportación ONNX int8, con la posible pérdida de calidad asociada a la cuantización.
- Ecosistema joven: 10 descargas y 0 likes en el momento de la consulta, sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M
- Informe técnico: https://saravanan-a-r.github.io/KeelCore/
- Repositorio GitHub: https://github.com/saravanan-a-r/KeelCore
- Licencia: https://huggingface.co/KeelCore/KeelCore-750M/blob/main/LICENSE
- Perfil del autor: https://www.linkedin.com/in/saravanan-a-r/

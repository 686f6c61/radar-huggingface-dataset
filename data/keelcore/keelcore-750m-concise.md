# KeelCore/KeelCore-750M-Concise

## Resumen

KeelCore-750M-Concise es un adaptador LoRA de rango 16 publicado por KeelCore sobre el modelo base Thelivu-750M, un encoder-decoder de 750 millones de parámetros. Su única función es reescribir texto en inglés para hacerlo más conciso: elimina muletillas, relleno y circunloquios manteniendo los hechos, nombres, enlaces y cifras. No es un modelo conversacional ni un resumidor; solo reescribe el texto que recibe. El adaptador pesa 73 MB (18,29 millones de parámetros entrenables, el 2,43 % del modelo base) y requiere el modelo base congelado para funcionar.

La relevancia de este adaptador es acotada pero clara: ofrece una tarea de reescritura muy específica que puede ejecutarse en CPU, GPU o incluso en el navegador mediante ONNX Runtime Web, con lo que el texto no sale del dispositivo del usuario. Esto lo hace útil para aplicaciones de edición de texto en local, integración en editores o como paso de preprocesado en pipelines de documentación.

Es importante señalar que la model card del adaptador describe el proyecto como Thelivu-750M-Concise y atribuye la autoría a Saravanan A R, mientras que el repositorio de Hugging Face está publicado bajo la organización KeelCore. Esta discrepancia no está explicada en la información disponible. La licencia es la Thelivu License 1.0, que no es una licencia de código abierto estándar y cuyos términos completos no se detallan en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (modelo base Thelivu-750M) con adaptador LoRA de rango 16 |
| Parámetros totales | 750M en el modelo base; 18,29M entrenables en el adaptador (2,43 % del base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; se menciona ejecución en ONNX Runtime Web sin detallar cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Thelivu License 1.0 (license_name: thelivu-license-1.0; license: other) |
| Formato de pesos | Adaptador en `adapter.safetensors` + `adapter_config.json` (formato propietario Thelivu, no PEFT); modelo base en `model.safetensors`; también hay carpeta ONNX |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Thelivu-750M, un modelo encoder-decoder de 750 millones de parámetros. La elección de encoder-decoder es deliberada: al leer la secuencia completa de entrada antes de generar, el modelo puede copiar literalmente nombres, URLs, correos y números en la salida, algo que la model card destaca como ventaja frente a arquitecturas decoder-only para esta tarea.

El adaptador es un LoRA de rango 16 con 18,29 millones de parámetros entrenables. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del esquema de instrucción con la plantilla ` <text_to_rewrite> … </text_to_rewrite> </s>`, que el código de inferencia añade automáticamente. El adaptador incluye una comprobación de huella (fingerprint) de los pesos del modelo base y rechaza cargarse sobre cualquier base distinto de Thelivu-750M.

## Capacidades

- Reescritura de texto en inglés para reducir longitud: en el conjunto de validación, las salidas son de media un 20 % más cortas que la entrada y el 97 % de ellas resultan más breves.
- Eliminación de muletillas y relleno ("due to the fact that" → "because", "in the event that" → "if").
- Conservación de hechos, nombres propios, URLs, direcciones de correo y números de teléfono en la medida de lo posible, gracias a la arquitectura encoder-decoder.
- Generación de hasta 384 tokens nuevos con la configuración por defecto.
- Ejecución en CPU o GPU con PyTorch, y en navegador mediante ONNX Runtime Web.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de chat: no responde preguntas ni sigue instrucciones contenidas en el texto.
- No resume documentos largos en puntos clave; mantiene cada idea y recorta las palabras alrededor.
- Monolingüe: solo inglés.

## Casos de uso

- Edición de correos y mensajes: el adaptador recibe un borrador verboso y devuelve una versión más corta manteniendo el contenido. Es adecuado porque su tasa de reducción media del 20 % y su tasa del 97 % de salidas más cortas están medidas sobre datos de validación reales.
- Reescritura en el navegador sin salida de datos: al ejecutarse con ONNX Runtime Web, el texto del usuario no abandona su máquina, lo que encaja en herramientas de edición para sectores con requisitos de privacidad.
- Limpieza de tickets y notas de soporte: se puede aplicar como paso de preprocesado para acortar descripciones de incidencias antes de almacenarlas o mostrarlas en un panel interno.
- Paso de reescritura dentro de una aplicación de escritorio o móvil: el tamaño del adaptador (73 MB) y la posibilidad de correr en CPU permiten integrarlo en aplicaciones ligeras sin infraestructura de GPU.
- Normalización de documentación técnica interna: acortar guías y notas de estado manteniendo URLs y comandos, aunque la propia model card advierte que no debe usarse con código o configuración sin revisión humana.
- Investigación sobre adaptadores pequeños: sirve como punto de partida para estudiar LoRA de bajo rango sobre un modelo base compartido, dado que el adaptador es pequeño y el código de carga es público en GitHub.
- Preprocesado en pipelines de publicación: reducir la verbosidad de textos antes de publicarlos, siempre con revisión humana en contenidos donde cada palabra importa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de la tarea: reducción media del 20 % en longitud, 97 % de salidas más cortas que la entrada y ejemplos cualitativos sobre entradas no vistas durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base tiene 750M parámetros; en fp16 ocuparía aproximadamente 1,5 GB de pesos, y en fp32 unos 3 GB, a lo que hay que sumar el adaptador (73 MB) y el overhead de activaciones.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar el modelo base en fp16.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base, aunque la información proporcionada no lo confirma con pruebas.
- Opciones de despliegue: PyTorch con el código del repositorio de GitHub (carga mediante `RephraseAdapter`), y ONNX Runtime Web para navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de adaptador propietario (no PEFT) dificulta su uso con herramientas estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores de reescritura concisa sobre modelos pequeños) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- No es un modelo de chat ni un asistente: no responde preguntas ni sigue instrucciones incluidas en el texto de entrada.
- No resume: mantiene todas las ideas y solo recorta palabras, por lo que no sirve para condensar documentos largos en puntos clave.
- Riesgo de eliminar información necesaria: al eliminar palabras puede borrar detalles relevantes; la model card excluye explícitamente su uso sin revisión humana en cláusulas legales, código, configuración, cifras financieras y citas.
- Textos ya concisos: en entradas cortas y ajustadas, el modelo tiende a devolverlas sin cambios.
- Licencia restrictiva: Thelivu License 1.0 no es una licencia de código abierto estándar; los términos completos no se detallan en la información disponible, por lo que debe consultarse el archivo LICENSE antes de cualquier uso comercial.
- Formato propietario: el adaptador no está en formato PEFT y exige el código del repositorio Thelivu; además, rechaza cargarse sobre un modelo base distinto de Thelivu-750M mediante comprobación de fingerprint.
- Discrepancia de autoría: la model card atribuye el proyecto a Saravanan A R y lo denomina Thelivu-750M-Concise, mientras que el repositorio figura bajo la organización KeelCore; conviene verificar la procedencia antes de usarlo en producción.
- Sin benchmarks publicados: no hay datos de calidad objetiva más allá de las métricas de longitud y los ejemplos cualitativos.
- Riesgo de alucinación: no documentado en la información disponible, aunque al ser una tarea de reescritura con copia directa el riesgo debería ser bajo; no obstante, no hay evaluación publicada al respecto.

## Enlaces

- Repositorio del adaptador en Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Concise
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Informe técnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Concise/blob/main/LICENSE
- Perfil del autor (LinkedIn): https://www.linkedin.com/in/saravanan-a-r/

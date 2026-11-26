# SicariusSicariiStuff/Phi-Line_14B

## Resumen

Phi-Line_14B es un ajuste fino (fine-tune) del modelo microsoft/phi-4, desarrollado por el usuario independiente SicariusSicariiStuff y publicado en Hugging Face en febrero de 2025. Se trata de un modelo de 14.659.507.200 parámetros orientado a generación de texto, con especial énfasis en roleplay conversacional y escritura creativa, aunque el autor destaca que conserva buena parte de las capacidades de asistente e instrucciones del modelo base.

El modelo parte de la arquitectura y los pesos de Phi-4 (familia Phi de Microsoft), un transformer denso de aproximadamente 14.700 millones de parámetros. El autor indica haber reutilizado exactamente los mismos datos y parámetros de entrenamiento que en su modelo previo Phi-lthy4, obteniendo sin embargo un comportamiento marcadamente distinto: mayor capacidad de razonamiento y de seguir instrucciones, a costa de una menor creatividad "desatada" y de una estabilidad inicial algo inferior en roleplay (que se estabiliza tras uno o dos reintentos).

Su relevancia radica en que demuestra que un ajuste fino ligero sobre Phi-4 puede producir un modelo de roleplay con bajas tasas de rechazo y buen seguimiento de fichas de personaje, manteniendo competencias de asistente. La licencia MIT y el formato safetensors lo hacen directamente desplegable con transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de microsoft/phi-4) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Phi-4) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el autor menciona una seccion de cuantizaciones en la model card, sin detallar los formatos |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 29,3 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Phi-4 de Microsoft, con 14.659.507.200 parámetros. No se trata de una arquitectura MoE ni híbrida: es un modelo denso convencional de la familia Phi. El autor no detalla en la información disponible la composición exacta del dataset de ajuste ni el número de tokens utilizados, pero sí afirma que empleó exactamente los mismos datos y los mismos hiperparámetros de entrenamiento que en su modelo anterior Phi-lthy4, lo que convierte a Phi-Line_14B en una suerte de ablación controlada: mismo entrenamiento, distinto resultado.

No se documentan en la información proporcionada detalles sobre RLHF, DPO u otras fases de alineamiento posteriores al ajuste supervisado. El autor atribuye el estilo de escritura "peculiar" del modelo a la escasez de "slop" de roleplay y escritura creativa en el preentrenamiento de Phi-4, aunque lo presenta explícitamente como una conjetura. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y escritura creativa, con respuestas de longitud media (habitualmente 2-3 párrafos).
- Roleplay conversacional con seguimiento de fichas de personaje ("character cards") y baja tasa de rechazos.
- Capacidades de asistente: sigue instrucciones con suficiente precisión y mantiene el formato solicitado (por ejemplo, encabezados Markdown por párrafo).
- Razonamiento y matemáticas heredados del modelo base Phi-4, según indica el autor ("math brain").
- Formato de salida controlable por el usuario mediante instrucciones.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Roleplay y ficción interactiva: el modelo está ajustado específicamente para mantener conversaciones multi-turno con personajes, usando las fichas incluidas (Vesper, Nina_Nakamura, Employee#11) o fichas propias, con respuestas de 2-3 párrafos y baja tasa de rechazo.
- Escritura creativa asistida: generación de narrativa y diálogo con instrucciones de formato (Markdown, estructura por párrafos), adecuado para borradores de relatos y guiones.
- Prototipado de asistentes conversacionales: al conservar capacidades de asistente e instrucciones del Phi-4 base, sirve para probar flujos conversacionales antes de pasar a un modelo alineado para producción.
- Generación de contenido de personajes para videojuegos o narrativa ramificada: las fichas de personaje incluidas y el bajo índice de rechazos permiten explorar diálogos con personalidades marcadas.
- Experimentación e investigación en ajuste fino: al compartir datos y parámetros con Phi-lthy4, es un caso de estudio útil para comparar efectos de un mismo entrenamiento sobre un mismo base model.
- Despliegue local en inglés para pruebas de escritura: con pesos safetensors y licencia MIT, puede ejecutarse en entornos de investigación sin restricciones de uso comercial derivadas de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 14.700 millones de parámetros, en FP16 se requieren aproximadamente 29 GB de VRAM solo para pesos, y en cuantizaciones de 8 bits o 4 bits el requisito baja aproximadamente a la mitad y a un cuarto respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de esta clase encaja en A100 40/80 GB, H100 y, con cuantización, en GPUs de consumo de gama alta.
- Cabe en GPU de consumo: no confirmado por el autor; previsiblemente solo con cuantización agresiva en tarjetas de 24 GB o más.
- Opciones de despliegue: transformers y text-generation-inference (etiquetas del repositorio); el autor menciona cuantizaciones en la model card sin especificar herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-Line_14B | 14.659.507.200 | no disponible | Roleplay y asistente (fine-tune de Phi-4) | MIT | Hugging Face |
| microsoft/phi-4 | no disponible en la informacion | no disponible en la informacion | Modelo base de proposito general | MIT (segun el modelo base referenciado) | Hugging Face |
| Phi-lthy4 (SicariusSicariiStuff) | no disponible en la informacion | no disponible | Roleplay, mismo dataset y parametros que Phi-Line_14B | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Inestabilidad inicial en roleplay: el propio autor advierte de que el modelo es menos estable que Phi-lthy4 en los primeros turnos y se estabiliza tras uno o dos reintentos.
- Estilo de escritura "peculiar": el autor lo describe como diferente, no necesariamente mejor o peor que su modelo hermano.
- Idiomas: solo inglés según la etiqueta del repositorio; no se garantiza un rendimiento correcto en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Baja tasa de rechazo: el autor la presenta como una ventaja para roleplay, pero implica menor filtrado de contenido sensible, lo que exige moderación externa en producción.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantías y sin auditoría de seguridad.
- Contexto: la longitud de contexto no se especifica en la información disponible; conviene consultar la del modelo base Phi-4 antes de diseñar aplicaciones con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SicariusSicariiStuff/Phi-Line_14B
- Modelo base: https://huggingface.co/microsoft/phi-4
- Modelo hermano Phi-lthy4: https://huggingface.co/SicariusSicariiStuff/Phi-lthy4
- Apoyo al autor (Ko-fi): https://ko-fi.com/sicarius
- Ficha de personaje Vesper: https://huggingface.co/SicariusSicariiStuff/Phi-Line_14B/resolve/main/Character_Cards/Vesper.png
- Ficha de personaje Nina_Nakamura: https://huggingface.co/SicariusSicariiStuff/Phi-Line_14B/resolve/main/Character_Cards/Nina_Nakamura.png
- Ficha de personaje Employee#11: https://huggingface.co/SicariusSicariiStuff/Phi-Line_14B/resolve/main/Character_Cards/Employee%2311.png

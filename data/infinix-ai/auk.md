# Infinix-ai/AuK

## Resumen

AuK es un modelo fundacional de 1.500 millones de parámetros para generación y edición de voz, desarrollado por Infinix-ai y publicado en abierto bajo licencia MIT. Se presenta como un sistema unificado que aborda tareas tradicionalmente dispersas (síntesis de voz zero-shot, clonación de voz, edición de contenido y acústica, edición paralingüística, mejora de voz y separación de fuentes) mediante una única interfaz de instrucciones en lenguaje natural. El modelo se distribuye en dos variantes: AuK base, orientada a calidad de generación, y AuK-Flash, una versión destilada para inferencia rápida en cuatro pasos.

La propuesta técnica se apoya en un enfoque de difusión sobre representaciones de audio, entrenado con millones de horas de audio diverso. Frente a pipelines convencionales que encadenan un modelo de TTS, otro de separación y otro de mejora, AuK condensa todas esas capacidades en un solo checkpoint de 6,8 GB, lo que simplifica el despliegue y reduce la superficie de integración en producción.

Su relevancia actual radica en que cubre un hueco poco explorado en el ecosistema abierto: un modelo de audio generativo de tamaño contenido (1,5B) que no se limita a la síntesis y permite editar grabaciones existentes preservando la identidad vocal, la melodía o el contenido lingüístico. La información pública disponible sobre benchmarks, idiomas e hiperparámetros de entrenamiento es, no obstante, limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión (modelo de generación de audio basado en difusión; detalles internos no disponibles) |
| Parámetros totales | 1.500 millones (1,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 6,8 GB; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

AuK es un modelo de difusión para audio de 1,5B de parámetros. La model card indica que se entrenó sobre "millones de horas de datos de audio diversos", pero no detalla la composición del corpus, el número exacto de tokens o frames, ni si se aplicaron etapas de RLHF, DPO o ajuste por preferencias. La arquitectura interna (backbone, encoder de audio, tokenizador acústico) no se describe en la información disponible; tan solo se enlaza un diagrama (`assets/arch.png`) sin texto explicativo accesible.

La innovación destacable es la unificación de tareas bajo una interfaz de instrucciones en lenguaje natural: el mismo modelo atiende peticiones de síntesis, edición de contenido, edición acústica y paralingüística, mejora y separación, sin cambiar de checkpoint. La variante AuK-Flash aplica destilación para reducir la inferencia a cuatro pasos de difusión, lo que sugiere que el modelo base requiere un número mayor de pasos y, por tanto, mayor latencia. No se especifican técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz zero-shot: genera habla con la voz de un audio de referencia.
- TTS por instrucción: genera voz a partir de una descripción textual, sin audio de referencia.
- Edición de contenido: reemplaza, inserta o elimina texto en una grabación existente.
- Edición de letras: reescribe la letra de una grabación cantada preservando melodía y voz.
- Edición acústica: modifica tono (semitonos), velocidad (factor de velocidad) y volumen (decibelios).
- Edición paralingüística: cambia emoción, timbre, elimina acentos regionales, añade o quita sonidos no verbales (respiraciones, risas, toses) y convierte a susurro.
- Mejora de voz (speech enhancement).
- Separación de fuentes y separación de habla.
- Interfaz unificada de instrucciones en lenguaje natural para todas las tareas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades fuera del ámbito del modelo.

## Casos de uso

- Doblaje y localización: usar edición de contenido y de acento para adaptar una grabación a otro texto o variante regional conservando la voz del actor original, lo que evita regrabar sesiones completas.
- Producción musical: edición de letras sobre una pista vocal manteniendo melodía y timbre, útil para demos y versiones alternativas sin acceso a la pista original del cantante.
- Postproducción de podcast y audiolibros: eliminar respiraciones, toses o ruidos no verbales y normalizar volumen en decibelios mediante instrucciones, reduciendo el trabajo manual de edición.
- Clonación de voz para accesibilidad: generar locuciones con la voz de un usuario que ha perdido el habla, a partir de muestras de referencia y TTS zero-shot.
- Limpieza de grabaciones de campo: aplicar mejora de voz y separación de fuentes para aislar una voz de un entorno ruidoso o de una mezcla con música.
- Prototipado rápido de voces: TTS por instrucción para generar muestras de personajes descritos textualmente antes de contratar una voz real, agilizando la preproducción.
- Restauración de archivos históricos: mejora y edición acústica sobre grabaciones degradadas para recuperar inteligibilidad sin alterar el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una imagen (`assets/performance.png`) con gráficas comparativas, pero los valores numéricos no están accesibles en el texto proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de difusión de 1,5B, la inferencia en precisión completa requeriría del orden de 6-12 GB, y en cuantización de 8 bits o 4 bits podría situarse en el rango de 2-5 GB; estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas. Para producción se asumiría una GPU con al menos 16 GB (A100, L40S, RTX 4090); para pruebas, GPUs consumer con 8-12 GB podrían ser suficientes según la cuantización, aunque no está confirmado.
- Cabeza en GPU consumer: probablemente sí en modelos como RTX 3090/4090 o superiores, sujeto a verificación con los pesos reales.
- Opciones de despliegue: la model card enlaza un repositorio de código (GitHub) y demos en Hugging Face Spaces y ModelScope, pero no detalla soporte para vLLM, llama.cpp, Ollama o TGI (estos frameworks están orientados a LLM y no necesariamente aplican a un modelo de difusión de audio).
- Latencia y throughput: no disponibles. AuK-Flash, con cuatro pasos de difusión, está pensado para reducir la latencia frente al modelo base, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| AuK | 1,5B | TTS zero-shot, TTS por instrucción, edición de contenido, acústica y paralingüística, mejora, separación | MIT | Pesos en Hugging Face y ModelScope |
| AuK-Flash | No disponible | Igual que AuK, con inferencia en 4 pasos | MIT | Pesos en Hugging Face y ModelScope |
| Alternativas de TTS open source de tamaño similar | No disponible | Principalmente síntesis de voz | Variable | Variable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa con alternativas como XTTS, F5-TTS o similares.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al entrenarse con audio diverso sin detallar la composición del corpus, es plausible que herede sesgos de acento, género y registro; conviene evaluarlo en el dominio objetivo.
- Riesgo de alucinación acústica: en tareas de edición y separación, el modelo puede introducir artefactos o alterar contenido no solicitado, especialmente en grabaciones ruidosas.
- Idiomas soportados no especificados: no hay garantía de cobertura multilingüe ni de calidad uniforme entre lenguas.
- Longitud de contexto no disponible: se desconoce la duración máxima de audio que puede procesar en una sola pasada.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de los datasets de entrenamiento, no documentadas.
- Uso dual: la clonación de voz y la edición de timbre pueden emplearse para suplantación de identidad; es necesario implementar controles de consentimiento y marcas de agua en producción.
- Madurez: el repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y la documentación técnica pública es escasa, lo que implica un riesgo de soporte y estabilidad para despliegues críticos.
- No se especifican requisitos de hardware ni formatos de pesos, lo que complica la planificación de infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-ai/AuK
- Página del proyecto: https://auk-project.github.io/
- Repositorio de código: https://github.com/Tencent-Hunyuan/AuK
- Paper en arXiv: https://arxiv.org/abs/2609.08936
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/AuK
- Demo en ModelScope: https://modelscope.cn/studios/Tencent-Hunyuan/AuK
- Pesos del modelo base (referencia alternativa): https://huggingface.co/tencent/AuK
- Pesos de AuK-Flash: https://huggingface.co/tencent/AuK-Flash
- Cookbook de tareas e instrucciones: https://github.com/Tencent-Hunyuan/AuK/blob/main/docs/COOKBOOK.md

# luminenio/gnani-evon-v3.3-30B-A3B-GGUF

## Resumen

El modelo `gnani-evon-v3.3-30B-A3B` es un modelo híbrido de tipo *mixture-of-experts* (MoE) desarrollado por Gnani.ai, que combina capas Mamba2 (state-space models) con capas Transformer. La versión publicada por `lumenio` es una cuantización en formato GGUF, pensada para su ejecución con `llama.cpp` y otros motores compatibles. El modelo base activa aproximadamente 3.500 millones de parámetros por token, de un total de unos 30.000 millones, lo que lo hace especialmente eficiente para inferencia en comparación con modelos densos del mismo tamaño.

Está diseñado para seguir instrucciones, razonamiento, uso de herramientas (*tool use*) y conversación en inglés y diez lenguas índicas: hindi, bengalí, telugu, tamil, marathi, gujarati, kannada, malayalam, punjabi y oriya. Su relevancia actual radica en cubrir un nicho poco atendido por los grandes modelos multilingües: la generación de texto de alta calidad en lenguas regionales de la India, con una arquitectura eficiente que permite desplegarlo en infraestructuras moderadas.

El repositorio en Hugging Face está marcado como *gated*, es decir, requiere aceptar condiciones de uso antes de acceder a los pesos. El tamaño total del repositorio es de 259,7 GB, lo que indica que se incluyen múltiples archivos GGUF con distintos niveles de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2-Transformer hybrid mixture-of-experts (MoE) |
| Parametros totales | 31.749.972.288 (~30B) |
| Parametros activos | ~3.5B por token |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra publicada) |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos en la información disponible) |
| Idiomas soportados | inglés, hindi, bengalí, telugu, tamil, marathi, gujarati, kannada, malayalam, punjabi, oriya |
| Licencia | NVIDIA Nemotron Open Model License with Apache 2.0 modifications |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo combina capas de Mamba2, un modelo de espacio de estados (SSM) lineal, con capas Transformer de atención clásica, formando una arquitectura híbrida. Esta combinación permite reducir el coste computacional de la atención en secuencias largas, manteniendo la capacidad de razonamiento de los Transformers. Al ser un MoE, no todos los parámetros se activan en cada token: de los ~30.000 millones de parámetros totales, solo ~3.500 millones se ejecutan por token, lo que reduce significativamente la carga de cómputo en inferencia.

No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens procesados ni la metodología de alineación (RLHF, DPO, etc.). La etiqueta `nemotron_h` sugiere que la arquitectura sigue el diseño de la familia Nemotron-H de NVIDIA, sobre la que Gnani.ai habría construido el modelo. Tampoco se especifica la longitud exacta del contexto, aunque la etiqueta `long-context` indica que el modelo está optimizado para manejar ventanas de contexto largas.

## Capacidades

- Generación de texto conversacional e instrucciones en inglés y diez lenguas índicas (hindi, bengalí, telugu, tamil, marathi, gujarati, kannada, malayalam, punjabi y oriya).
- Razonamiento y seguimiento de instrucciones complejas, según la descripción del modelo base.
- Uso de herramientas (*tool calling* / *function calling*), lo que permite integrar el modelo en sistemas que necesitan llamar a APIs o ejecutar acciones externas.
- Soporte para tareas de agente y razonamiento multi-paso, derivado de su capacidad de *tool use* y razonamiento.
- Optimizado para contexto largo, aunque no se ha publicado la cifra exacta de tokens.
- No se han documentado capacidades de visión, audio ni generación multimodal en la información disponible.

## Casos de uso

- Asistentes conversacionales multilingües para la India: el modelo puede mantener conversaciones fluidas en inglés y en lenguas regionales, lo que lo hace adecuado para aplicaciones de asistencia al usuario en sectores como banca, telecomunicaciones o administración pública.
- Atención al cliente automatizada: gracias a su capacidad de razonamiento y *tool use*, puede gestionar consultas multi-turno y ejecutar acciones como consultar saldos, reservar citas o tramitar incidencias, integrándose con sistemas de backend mediante llamadas a funciones.
- Agentes de automatización de tareas: el soporte de *tool calling* permite construir agentes que encadenan pasos (por ejemplo, buscar información, procesar un formulario y enviar una respuesta) sin intervención humana.
- Procesamiento de documentos largos: la etiqueta `long-context` sugiere que puede manejar textos extensos, como contratos, informes o expedientes, tanto en inglés como en lenguas índicas, para tareas de resumen, extracción de información o análisis.
- Herramientas de apoyo a la educación en lenguas locales: puede generar material didáctico, responder preguntas de estudiantes o crear ejercicios en hindi, tamil, telugu y otras lenguas, contribuyendo a la inclusión educativa en regiones con diversidad lingüística.
- Chatbots de soporte técnico especializados: al combinar razonamiento con *tool use*, es posible desplegarlo en plataformas de soporte donde deba diagnosticar problemas, consultar bases de conocimiento y sugerir soluciones en el idioma del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (259,7 GB) sugiere que se incluyen múltiples cuantizaciones GGUF, pero no se detallan los tamaños individuales de cada archivo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Un modelo MoE de ~30B con ~3.5B activos podría ejecutarse en GPUs de consumo con cuantizaciones agresivas, pero no hay datos confirmados en la información proporcionada.
- Opciones de despliegue: al ser un repositorio GGUF, está orientado a su uso con `llama.cpp`, `Ollama` o motores similares. La etiqueta `endpoints_compatible` indica que también puede desplegarse en endpoints de Hugging Face.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para realizar una comparativa fiable con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está marcado como *gated* en Hugging Face, por lo que es necesario aceptar las condiciones de uso antes de descargar los pesos.
- Licencia con restricciones: la licencia es "NVIDIA Nemotron Open Model License with Apache 2.0 modifications", lo que implica revisar los términos específicos para uso comercial, redistribución y modificación antes de desplegarlo en producción.
- Sin benchmarks publicados: al no existir resultados de evaluación en la información disponible, el rendimiento real del modelo no está verificado de forma independiente.
- Riesgo de alucinación: como en todos los modelos generativos, existe la posibilidad de que el modelo produzca contenido factualmente incorrecto o inventado, especialmente en lenguas con menos datos de entrenamiento.
- Sesgos lingüísticos: no se han documentado sesgos específicos, pero los modelos entrenados principalmente en inglés y lenguas índicas pueden presentar comportamientos desiguales entre idiomas.
- Longitud de contexto no confirmada: aunque la etiqueta indica `long-context`, no se ha publicado la cifra exacta de tokens, por lo que no se puede garantizar un comportamiento óptimo en secuencias muy largas.
- Sin soporte multimodal: el modelo está limitado a texto; no ofrece capacidades de visión, audio ni entrada de imágenes.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lumenio/gnani-evon-v3.3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/gnani/gnani-evon-v3.3-30B-A3B

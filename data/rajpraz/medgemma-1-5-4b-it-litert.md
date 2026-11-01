# rajpraz/medgemma-1.5-4b-it-litert

## Resumen

MedGemma 1.5 4B IT (LiteRT-LM) es una conversión al formato LiteRT-LM del modelo MedGemma 1.5 4B IT de Google, un modelo de lenguaje especializado en el dominio médico y ajustado para instrucciones. El repositorio `rajpraz/medgemma-1.5-4b-it-litert` no contiene un modelo nuevo ni un fine-tuning propio: es un espejo sin modificar del fichero `medgemma-1.5-4b-it_q4_block32_ekv2048.litertlm` publicado por `litert-community/MedGemma-1.5-4B-IT`, pensado para que la aplicación HYA Doctor pueda descargarlo en el teléfono sin requerir inicio de sesión en Hugging Face.

La relevancia de esta ficha está en el formato: LiteRT-LM es el runtime de inferencia on-device de Google (sucesor de TensorFlow Lite), de modo que este artefacto está pensado para ejecutarse localmente en dispositivos móviles y edge, no en servidores con GPU. El fichero empaquetado es una cuantización de 4 bits con bloques de 32 (`q4_block32`) y una ventana de clave-valor de 2048 tokens (`ekv2048`), lo que condiciona tanto el consumo de memoria como el contexto efectivo en producción.

Se trata, por tanto, de un artefacto de despliegue derivado de un modelo base de 4B parámetros con licencia HAI-DEF (Health AI Developer Foundations) de Google, sujeta a restricciones de uso específicas para el ámbito sanitario. No hay información publicada sobre idiomas soportados, pipeline ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, derivado de google/medgemma-1.5-4b-it) |
| Parametros totales | 4B (según nombre del modelo base) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 2048 tokens (ventana KV empaquetada `ekv2048`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | 4 bits con bloques de 32 (`q4_block32`) en formato LiteRT-LM |
| Idiomas soportados | no disponible |
| Licencia | health-ai-developer-foundations (HAI-DEF), etiquetada como `other` |
| Formato de pesos | LiteRT-LM (`.litertlm`); no se distribuyen safetensors ni GGUF en este repo |
| Tamano del repo | 2.6 GB |
| Libreria / runtime | litert-lm |
| Modelo base | google/medgemma-1.5-4b-it |
| Autor del repo | rajpraz (espejo, sin modificaciones) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información proporcionada. El artefacto es una conversión de formato y cuantización del modelo `google/medgemma-1.5-4b-it`, no un entrenamiento nuevo: el autor declara explícitamente que el fichero es una copia sin modificar del publicado por `litert-community/MedGemma-1.5-4B-IT`.

La innovación técnica relevante aquí es el empaquetado LiteRT-LM: cuantización de 4 bits con granularidad de bloque de 32 y una ventana KV fijada en 2048 tokens (`ekv2048`). Este diseño prioriza la huella de memoria y la velocidad de decodificación en dispositivos móviles frente a la fidelidad numérica completa o contextos largos. Cualquier detalle adicional sobre la composición del dataset médico, número de tokens o técnicas de alineación debe consultarse en la model card del modelo base de Google, que no forma parte de la información disponible.

## Capacidades

- Generación de texto en el dominio médico y respuesta a instrucciones (sufijo `-it` del modelo base).
- Asistencia clínica como ayuda a la decisión: el autor lo describe como "decision aid for clinicians", no como dispositivo médico.
- Inferencia on-device mediante el runtime LiteRT-LM, sin necesidad de servidor ni conexión a un backend de inferencia.
- Ejecución en dispositivos móviles con un artefacto de 2.6 GB y cuantización de 4 bits.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión, audio o thinking mode: no disponible.
- Contexto efectivo limitado a 2048 tokens por la ventana KV empaquetada.

## Casos de uso

- Asistencia clínica en aplicaciones móviles: integración en apps como HYA Doctor para ofrecer borradores de respuesta y apoyo a la decisión a profesionales sanitarios, ejecutando el modelo localmente en el teléfono sin enviar datos del paciente a un servidor.
- Despliegue en entornos con conectividad limitada: clínicas rurales, unidades móviles o dispositivos sin acceso estable a la nube pueden ejecutar el modelo on-device gracias al runtime LiteRT-LM y al tamaño contenido del artefacto cuantizado.
- Prototipado de flujos clínicos con datos sensibles: al no requerir backend remoto, facilita pruebas de concepto donde la residencia local de los datos es un requisito, siempre bajo revisión de un profesional cualificado.
- Educación y formación médica: generación de explicaciones y resúmenes de conceptos clínicos en dispositivos de estudiantes, con la ventana de 2048 tokens como límite para el material de entrada.
- Triaje conversacional de apoyo: gestión de diálogos multi-turno breves (hasta 2048 tokens acumulados de contexto) para recoger síntomas y orientar la consulta, con derivación obligatoria a un profesional.
- Evaluación comparativa de runtimes on-device: uso del artefacto para medir latencia, consumo de memoria y calidad de la cuantización q4_block32 frente a otras conversiones del mismo modelo base en pruebas de ingeniería.
- Distribución simplificada de artefactos: el espejo permite a aplicaciones descargar el fichero sin autenticación en Hugging Face, útil en pipelines de distribución móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el artefacto está pensado para ejecución on-device. El fichero pesa 2.6 GB en disco y la cuantización de 4 bits reduce la huella en memoria respecto a los pesos en precisión completa.
- GPU recomendadas: no disponible. El runtime objetivo es LiteRT-LM sobre aceleradores móviles (CPU/GPU/NPU del dispositivo), no GPUs de servidor.
- ¿Cabe en consumer GPU? El formato `.litertlm` no está pensado para GPUs de escritorio; para ejecución en GPU consumer sería necesario recurrir al modelo base en otro formato (safetensors, GGUF), no disponible en este repo.
- Opciones de despliegue: runtime LiteRT-LM en Android/iOS y entornos edge compatibles. No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rajpraz/medgemma-1.5-4b-it-litert | 4B | 2048 tokens (KV empaquetada) | LiteRT-LM (q4_block32) | HAI-DEF | Espejo público en HF |
| litert-community/MedGemma-1.5-4B-IT | 4B | no disponible | LiteRT-LM | HAI-DEF | Original en HF |
| google/medgemma-1.5-4b-it | 4B | no disponible | no disponible | HAI-DEF | Modelo base en HF |

No se dispone de datos de rendimiento comparativo ni de otras alternativas on-device en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor indica explícitamente que MedGemma es una ayuda a la decisión para clínicos y que su salida no constituye un diagnóstico; todo lo que genere debe ser revisado por un profesional cualificado.
- Licencia restrictiva: HAI-DEF (Health AI Developer Foundations) impone condiciones de uso y una política de usos prohibidos; es obligatorio revisar los términos antes de cualquier despliegue, incluido el uso comercial.
- Riesgo de alucinación: no hay información publicada sobre tasas de alucinación ni evaluaciones de fiabilidad en la información disponible; en dominio médico este riesgo es crítico.
- Contexto limitado: la ventana KV empaquetada de 2048 tokens restringe la longitud de las conversaciones y del material de entrada.
- Idiomas soportados: no disponible; no se puede asumir cobertura multilingüe sin verificar la model card del modelo base.
- Artefacto espejo sin garantías propias: el repositorio no aporta validación adicional; la integridad y el comportamiento dependen del fichero original de `litert-community`.
- Formato específico: al ser LiteRT-LM, no es directamente utilizable en stacks de servidor habituales (vLLM, TGI, llama.cpp) sin conversión.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rajpraz/medgemma-1.5-4b-it-litert
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
- Conversión LiteRT-LM original: https://huggingface.co/litert-community/MedGemma-1.5-4B-IT
- Términos de licencia HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms

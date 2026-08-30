# mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-GGUF

## Resumen

El modelo `mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-GGUF` es una cuantización en formato GGUF del modelo `Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated`, que a su vez es una versión modificada del modelo `BSC-LT/salamandra-7b-instruct` desarrollado por el Barcelona Supercomputing Center (BSC). La modificación aplica dos técnicas: *uncensoring* (eliminación de restricciones de contenido) y *abliteration* (eliminación de las direcciones de activación asociadas al rechazo de peticiones), lo que da como resultado un modelo que no se niega a responder a instrucciones que un modelo estándar rechazaría.

Con aproximadamente 7,7 mil millones de parámetros, este modelo está orientado a lenguas europeas (inglés, español, catalán, alemán, francés, italiano y portugués) y se posiciona como una herramienta para tareas de ciberseguridad, *red teaming* y generación de contenido sin censura. La versión GGUF permite su ejecución en hardware de consumo mediante motores como llama.cpp u Ollama, con múltiples niveles de cuantización que van desde Q2_K (3,4 GB) hasta f16 (15,6 GB). Su relevancia actual radica en la demanda de modelos locales sin restricciones para investigación en seguridad y creatividad, aunque su uso conlleva riesgos éticos y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.768.117.248 (7,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, es, ca, de, fr, it, pt |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original `salamandra-7b-instruct` en la documentación proporcionada. Dado que se trata de un modelo de 7,7B parámetros, es probable que siga una arquitectura transformer estándar, pero este dato no está confirmado. La versión *abliterated* aplica una técnica de intervención en el espacio de activaciones del modelo para eliminar las direcciones asociadas con la negativa a responder, mientras que el *uncensoring* busca reducir el sesgo de rechazo en las respuestas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto multilingüe en siete lenguas europeas: inglés, español, catalán, alemán, francés, italiano y portugués.
- Respuesta sin rechazo a instrucciones que modelos estándar suelen denegar, gracias a la combinación de *uncensoring* y *abliteration*.
- Orientado a tareas de ciberseguridad y *red teaming*, como simulación de ataques, análisis de vulnerabilidades y generación de payloads.
- Capacidad de conversación multi-turno (etiqueta `conversational`).
- Compatible con motores de inferencia que soportan GGUF, como llama.cpp, Ollama y LM Studio.
- No se ha confirmado soporte para *tool calling*, *function calling* ni razonamiento multi-paso explícito.

## Casos de uso

- Investigación en ciberseguridad: el modelo puede generar escenarios de ataque realistas, redactar informes de *red teaming* y simular conversaciones de ingeniería social para evaluar la robustez de sistemas de defensa.
- Pruebas de resistencia de modelos de IA: al no rechazar peticiones, permite evaluar cómo un LLM sin restricciones responde a *prompts* maliciosos, útil para estudiar riesgos de seguridad en sistemas de IA.
- Generación de contenido creativo sin filtros: escritores y guionistas pueden usarlo para explorar tramas oscuras, diálogos de villanos o escenas violentas sin que el modelo interrumpa con advertencias de seguridad.
- Traducción y localización en lenguas europeas: su soporte multilingüe permite traducir textos entre los siete idiomas, aunque sin garantías de calidad comparable a modelos especializados.
- Asistente conversacional local: al ejecutarse en GGUF, puede desplegarse en una GPU de consumo para un chatbot privado sin censura, útil en entornos donde se requiere confidencialidad.
- Análisis de contenido sensible: investigadores pueden usarlo para estudiar cómo un modelo sin restricciones maneja temas tabú, contribuyendo a la comprensión de sesgos y alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus versiones base.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el archivo GGUF ocupa entre 3,4 GB (Q2_K) y 15,6 GB (f16). Para Q4_K_M (5,0 GB) se recomienda al menos 6 GB de VRAM; para Q8_0 (8,4 GB) se necesitan 10-12 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para Q8_0 o f16.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M o inferiores en tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base `salamandra-7b-instruct` del BSC es una alternativa, pero no se conocen sus métricas de rendimiento. Otros modelos *uncensored* de 7B como `dolphin-2.2.1-mistral-7b` o `WizardLM-7B-Uncensored` podrían ser comparables, pero no se dispone de datos objetivos para contrastarlos.

## Limitaciones y advertencias

- Al ser un modelo *uncensored* y *abliterated*, puede generar contenido dañino, ilegal o éticamente cuestionable sin filtros. Su uso en producción requiere supervisión humana y políticas de seguridad estrictas.
- Riesgo elevado de alucinación: al no tener restricciones, puede inventar información con mayor confianza, especialmente en dominios técnicos o legales.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto; es probable que sea similar a la del modelo base (típicamente 4K-8K tokens), pero no está documentado.
- Sesgos lingüísticos: al estar entrenado principalmente en lenguas europeas, su rendimiento en otros idiomas puede ser deficiente.
- Licencia apache-2.0 permite uso comercial, pero el contenido generado puede violar leyes de propiedad intelectual o regulaciones de contenido.
- No se recomienda su uso en aplicaciones orientadas al público general sin un sistema de moderación externo.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-GGUF
- Modelo base (Securelayer7): https://huggingface.co/Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated
- Modelo original del BSC: https://huggingface.co/BSC-LT/salamandra-7b-instruct
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-i1-GGUF
- Guía de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests

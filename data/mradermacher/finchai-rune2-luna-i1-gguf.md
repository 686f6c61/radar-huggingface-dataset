# mradermacher/FinchAI-Rune2-Luna-i1-GGUF

## Resumen

FinchAI-Rune2-Luna-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base whcl412/FinchAI-Rune2-Luna. Se trata de un modelo de la familia LFM3 (Liquid Foundation Model 3), según indican las etiquetas del repositorio, especializado en tool calling y function calling para flujos de agentes, con soporte para chino e inglés. El repositorio no contiene pesos en formato safetensors, sino únicamente cuantizaciones en formato GGUF, además de un fichero imatrix para generar cuantizaciones propias.

El modelo base está publicado bajo la licencia lfm-open-license-1.0, vinculada al modelo LiquidAI/LFM3-1.7B, lo que sugiere un tamaño de aproximadamente 1.700 millones de parámetros, aunque el dato de parámetros totales registrado en el repositorio (899.013) no es coherente con esa referencia y probablemente corresponde a un recuento parcial o erróneo. La información disponible no permite confirmar la arquitectura exacta, el contexto máximo ni los datos de entrenamiento.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo orientado a agentes y tool calling en hardware de consumo mediante llama.cpp y derivados, con múltiples niveles de cuantización (desde IQ1_S hasta Q6_K). No obstante, el repositorio no incluye benchmarks, demos ni documentación técnica del modelo base, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas indican familia LFM3; detalles no publicados) |
| Parametros totales | no disponible de forma fiable (el repositorio registra 899.013, incoherente con la referencia a LFM3-1.7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, Q4_0, Q4_1, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S, IQ1_M (cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | lfm-open-license-1.0 (enlace a la licencia de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (incluye fichero imatrix de 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base whcl412/FinchAI-Rune2-Luna. Las etiquetas del repositorio apuntan a la familia LFM3, lo que podría implicar un diseño híbrido o eficiente propio de Liquid AI, pero este extremo no está confirmado en la documentación proporcionada. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La única innovación técnica documentada en este repositorio es el proceso de cuantización: mradermacher ha generado cuantizaciones ponderadas con fichero imatrix (importance matrix), lo que permite obtener versiones de baja precisión con una pérdida de perplejidad menor que las cuantizaciones estáticas equivalentes. El repositorio también enlaza a una colección de cuantizaciones estáticas en mradermacher/FinchAI-Rune2-Luna-GGUF para quienes prefieran ese formato.

## Capacidades

- Tool calling y function calling: el modelo está etiquetado explícitamente para estas tareas, orientado a la integración con APIs y herramientas externas.
- Flujos de agente: las etiquetas "agent" y "tool-calling" indican un diseño para razonamiento multi-paso y orquestación de acciones.
- Generación de texto conversacional en chino e inglés.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse a través de infraestructuras de inferencia compatibles con endpoints estándar.
- Capacidades de razonamiento, código, matemáticas o visión: no disponibles en la información proporcionada.
- Modo thinking, audio o multimodal: no disponible.

## Casos de uso

- Agentes de automatización con herramientas: el modelo puede emplearse como motor de decisión en un agente que invoque APIs externas (calendario, correo, bases de datos) mediante function calling, aprovechando su etiquetado específico para esta tarea.
- Asistentes de atención al cliente en chino e inglés: al soportar ambos idiomas, puede gestionar conversaciones multi-turno en mercados bilingües, siempre que se valide empíricamente su calidad y su ventana de contexto real.
- Integración en pipelines de CI/CD para tareas de código: si el modelo base conserva capacidades de generación de código, podría usarse para revisar diffs o generar tests; conviene verificarlo antes de producción, ya que no hay benchmarks publicados.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones GGUF de bajo tamaño (desde IQ1/IQ2), puede ejecutarse en equipos sin GPU dedicada mediante llama.cpp u Ollama para prototipos y pruebas de concepto.
- Servicio de inferencia ligero en CPU: las cuantizaciones Q4_K_M o Q5_K_M permiten servir el modelo en entornos con recursos limitados, útil para demos internas o entornos de desarrollo.
- Evaluación comparativa de cuantizaciones: el fichero imatrix y la amplia gama de cuantizaciones facilitan estudios de degradación de calidad frente a tamaño, un caso de uso habitual en investigación aplicada.
- Chatbot especializado en dominio con tool calling: combinado con un servidor compatible con la API de OpenAI, puede integrarse en aplicaciones existentes que ya esperan ese formato de function calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta, ya que el número de parámetros no está confirmado. Como referencia orientativa para un modelo de ~1.700 millones de parámetros en GGUF, las cuantizaciones Q4_K_M ocuparían del orden de 1 GB y las Q6_K alrededor de 1,4 GB, aunque esta estimación debe tomarse con cautela.
- GPU recomendadas: no disponibles en la documentación. Para un modelo de este tamaño, cualquier GPU consumer con 4 GB o más de VRAM sería suficiente en teoría, pero no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí, en tarjetas como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon, pero no está verificado.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el repositorio menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FinchAI-Rune2-Luna-i1-GGUF | no disponible (referencia LFM3-1.7B) | no disponible | lfm-open-license-1.0 | GGUF en HF | Cuantizaciones imatrix de un modelo orientado a tool calling en zh/en |
| LiquidAI/LFM3-1.7B | ~1,7B (según referencia de licencia) | no disponible | lfm-open-license-1.0 | Pesos originales en HF | Modelo base de la familia LFM3; FinchAI-Rune2-Luna podría derivar de él |
| mradermacher/FinchAI-Rune2-Luna-GGUF | no disponible | no disponible | lfm-open-license-1.0 | GGUF estático en HF | Variante con cuantizaciones estáticas del mismo modelo base |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o fiabilidad del tool calling, lo que impide recomendarlo para producción sin evaluación propia.
- Datos de parámetros incoherentes: el recuento de 899.013 en el repositorio no cuadra con la referencia a LFM3-1.7B; conviene verificar el tamaño real antes de planificar el despliegue.
- Idiomas limitados: solo chino e inglés; no se garantiza un rendimiento aceptable en castellano.
- Licencia restrictiva: la lfm-open-license-1.0 puede imponer condiciones al uso comercial; es obligatorio revisar el texto completo antes de integrarlo en productos.
- Riesgo de alucinación: inherente a los modelos generativos y agravado por la falta de documentación sobre el entrenamiento y los datos utilizados.
- Cuantizaciones de muy baja precisión (IQ1, IQ2): pueden degradar notablemente la calidad y la fiabilidad del function calling; se recomienda Q4_K_M o superior para tareas de agente.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación futura (2026-11-10): dato anómalo que sugiere posibles errores en los metadatos del repositorio.
- Sin información sobre sesgos, contexto máximo efectivo ni estabilidad en conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/FinchAI-Rune2-Luna-i1-GGUF
- Modelo base: https://huggingface.co/whcl412/FinchAI-Rune2-Luna
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/FinchAI-Rune2-Luna-GGUF
- Página de resumen de descargas: https://hf.tst.eu/model#FinchAI-Rune2-Luna-i1-GGUF
- Licencia LFM Open License 1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/Clin-REACT-31B-GGUF

## Resumen

Clin-REACT-31B es un modelo de lenguaje especializado en razonamiento clínico y medicina intensiva (UCI), desarrollado por el equipo de macontreras98 y cuantizado a formato GGUF por mradermacher para facilitar su despliegue local. Se basa en una arquitectura derivada de Gemma 4 y ha sido ajustado con el dataset ICU-REACT, orientado a tareas de razonamiento clínico en entornos hospitalarios de alta complejidad.

Este modelo resuelve el problema de la falta de LLMs específicos para el dominio clínico en español, aunque su idioma principal es el inglés. Su relevancia actual radica en que ofrece una alternativa de código abierto (licencia Apache 2.0) para aplicaciones médicas que requieren comprensión de contextos de UCI, con un tamaño de 30.7 mil millones de parámetros, lo que lo sitúa en una franja de modelos medianos-grandes desplegables en estaciones de trabajo con GPUs de alta gama.

La versión GGUF aquí descrita proporciona múltiples cuantizaciones que permiten ejecutar el modelo en hardware variado, desde tarjetas con 12 GB de VRAM (cuantización Q2_K) hasta configuraciones de mayor fidelidad como Q8_0, que requieren más de 32 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Gemma 4 (detalles de capas y atención no disponibles) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero el modelo está etiquetado como basado en Gemma 4, lo que sugiere una arquitectura transformer de solo decodificador con atención por ventanas. El entrenamiento se realizó mediante fine-tuning sobre el dataset ICU-REACT, que contiene datos de pacientes y escenarios clínicos de cuidados intensivos, aunque no se especifican los tokens totales ni si se emplearon técnicas de alineación como RLHF o DPO. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Generación de texto y razonamiento en inglés, con enfoque en dominios clínicos y médicos.
- Razonamiento clínico para entornos de UCI, incluyendo interpretación de datos de pacientes y sugerencias de decisiones.
- Soporte de conversación multi-turno (modelo conversacional según etiquetas).
- No se documenta soporte explícito para tool calling, function calling o agentes.
- Capacidades multilingües limitadas a inglés; no hay evidencia de soporte para otros idiomas.

## Casos de uso

- **Apoyo a decisiones clínicas en UCI**: el modelo puede procesar resúmenes de historias clínicas y sugerir acciones basadas en patrones aprendidos de ICU-REACT, ayudando al personal médico en la revisión de casos complejos.
- **Documentación médica automatizada**: puede generar resúmenes de evolución de pacientes, informes de alta o notas de progreso a partir de datos estructurados o narrativos, reduciendo la carga administrativa.
- **Formación y simulación clínica**: el modelo puede generar casos clínicos realistas para entrenamiento de estudiantes de medicina o residentes, incluyendo escenarios de UCI con datos vitales y resultados de laboratorio.
- **Triaje inicial en telemedicina**: en entornos de consulta remota, puede analizar síntomas y datos de pacientes para clasificar la urgencia, aunque no sustituye el juicio humano.
- **Investigación médica**: puede asistir en la extracción de información de registros clínicos electrónicos y en la generación de hipótesis de investigación basadas en datos de pacientes.
- **Chatbots de información médica**: integrado en aplicaciones de chat para responder preguntas sobre protocolos de UCI, medicamentos o interpretación de valores clínicos, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni pruebas específicas del dominio clínico. No se pueden comparar con otros modelos de forma objetiva.

## Requisitos de hardware

- **VRAM estimada por cuantización** (tamaño del archivo GGUF, más overhead de inferencia):
  - Q2_K: 12 GB → ~14 GB VRAM
  - Q3_K_S: 13.9 GB → ~16 GB VRAM
  - Q3_K_M: 15.4 GB → ~18 GB VRAM
  - Q4_K_S: 17.9 GB → ~20 GB VRAM
  - Q4_K_M: 18.8 GB → ~21 GB VRAM
  - Q5_K_S: 21.4 GB → ~24 GB VRAM
  - Q6_K: 25.3 GB → ~28 GB VRAM
  - Q8_0: 32.7 GB → ~36 GB VRAM
- **GPU recomendadas**: para las cuantizaciones Q4_K_M o inferiores se necesitan GPUs con 24 GB de VRAM (por ejemplo, RTX 4090, A6000); para Q6_K o superiores, GPUs de 32-36 GB como A100 40GB o H100 80GB.
- **Compatibilidad con consumer GPU**: el modelo cabe en tarjetas de consumo de gama alta (RTX 3090/4090) solo con cuantizaciones Q3_K_M o inferiores; la calidad se degrada.
- **Opciones de despliegue**: al ser GGUF, se puede ejecutar con llama.cpp, Ollama, o servidores de inferencia compatibles como text-generation-webui o LM Studio. También se puede convertir a otros formatos si es necesario.
- **Latencia y throughput**: no disponibles; dependen del hardware, la cuantización y la implementación del backend.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos clínicos de tamaño similar. El único dato disponible es que existe una versión de 70B del mismo modelo (Llama-Clin-REACT-70B) pero sin detalles de rendimiento. No se pueden establecer comparaciones objetivas sin datos de benchmarks.

## Limitaciones y advertencias

- **Idioma**: el modelo solo está entrenado en inglés, lo que limita su uso en entornos de habla hispana sin traducción previa.
- **Alucinaciones**: como cualquier LLM, puede generar información falsa o no respaldada por evidencia clínica; nunca debe usarse como sustituto del juicio médico profesional.
- **Sesgos**: los datos de entrenamiento (ICU-REACT) pueden contener sesgos demográficos o de práctica clínica, lo que puede influir en las sugerencias del modelo.
- **Contexto y longitud**: no se conoce la longitud de contexto; el modelo podría no manejar historiales clínicos muy extensos en una sola consulta.
- **Licencia**: aunque es Apache 2.0, el uso en producción médica debe cumplir regulaciones locales (p.ej., GDPR, HIPAA) y no se recomienda sin validación externa.
- **Despliegue**: al ser un modelo de 31B, requiere hardware potente para una inferencia fluida, y las cuantizaciones bajas pueden degradar significativamente la calidad del razonamiento.

## Enlaces

- [HuggingFace del modelo cuantizado: mradermacher/Clin-REACT-31B-GGUF](https://huggingface.co/mradermacher/Clin-REACT-31B-GGUF)
- [Modelo base (no cuantizado): macontreras98/Clin-REACT-31B](https://huggingface.co/macontreras98/Clin-REACT-31B)
- [Dataset de entrenamiento: macontreras98/ICU-REACT](https://huggingface.co/datasets/macontreras98/ICU-REACT)
- [Perfil del cuantizador: mradermacher](https://huggingface.co/mradermacher)
- [Versión de 70B basada en Llama: mradermacher/Llama-Clin-REACT-70B-GGUF](https://huggingface.co/mradermacher/Llama-Clin-REACT-70B-GGUF)

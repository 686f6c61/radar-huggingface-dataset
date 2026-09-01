# Openintelligent123/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de gran tamano (LLM) de pesos abiertos desarrollado por OpenAI, perteneciente a la serie gpt-oss. Con 116.829 millones de parametros totales y solo 5.100 millones de parametros activos gracias a su arquitectura de mezcla de expertos (MoE), esta disenado para tareas de razonamiento complejo, uso agente y desarrollo de aplicaciones en produccion. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de copyleft ni riesgo de patentes.

El modelo destaca por su cuantizacion nativa MXFP4 de los pesos MoE, que permite ejecutarlo en una unica GPU de 80 GB (como NVIDIA H100 o AMD MI300X), y por ofrecer capacidades avanzadas como razonamiento configurable (esfuerzo bajo, medio o alto), cadena de pensamiento completa accesible para depuracion, y soporte nativo para llamada de funciones, navegacion web, ejecucion de codigo Python y salidas estructuradas. Fue entrenado con el formato de respuesta harmony, que es obligatorio para su correcto funcionamiento.

Este repositorio concreto (Openintelligent123/gpt-oss-120b) es una copia del modelo original de OpenAI, con los mismos pesos y licencia. La relevancia actual del modelo radica en que combina un rendimiento de razonamiento de alto nivel con una licencia permisiva y una eficiencia de despliegue notable, posicionandose como una alternativa solida a otros modelos abiertos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), detalles de capas y numero de expertos no disponibles |
| Parametros totales | 116.829.156.672 (aprox. 117 B) |
| Parametros activos | 5,1 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (oficial), 8-bit (compatibilidad), GGUF (via Ollama, no oficial) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en formato original) |

## Arquitectura y entrenamiento

gpt-oss-120b emplea una arquitectura de mezcla de expertos (MoE) con 117 B de parametros totales y 5,1 B de parametros activos por token. No se han publicado detalles sobre el numero de expertos, capas o dimensiones del modelo en la informacion disponible. El modelo fue entrenado con el formato de respuesta harmony, un esquema de chat especifico desarrollado por OpenAI que debe aplicarse obligatoriamente en la inferencia; si no se usa, el modelo no funciona correctamente.

Los pesos MoE fueron post-entrenados con cuantizacion MXFP4, lo que reduce significativamente el uso de memoria sin sacrificar el rendimiento, segun las evaluaciones oficiales realizadas con la misma cuantizacion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Entre las innovaciones tecnicas destacan el razonamiento configurable (esfuerzo bajo, medio o alto), la cadena de pensamiento completa accesible para depuracion y el soporte nativo para herramientas y salidas estructuradas.

## Capacidades

- Generacion de texto y razonamiento complejo con cadena de pensamiento completa, accesible para depuracion y auditoria.
- Razonamiento configurable: permite ajustar el esfuerzo de razonamiento (low, medium, high) segun las necesidades de latencia y precision.
- Llamada de funciones (function calling) nativa para integracion con herramientas externas.
- Capacidades agente: navegacion web, ejecucion de codigo Python y salidas estructuradas (Structured Outputs).
- Fine-tuning completo: el modelo puede personalizarse mediante ajuste de parametros para casos de uso especificos.
- Compatibilidad con multiples frameworks de inferencia: Transformers, vLLM, Ollama, LM Studio y PyTorch/Triton.
- Capacidades multilingues: no especificadas en la informacion disponible.

## Casos de uso

- Razonamiento analitico en produccion: el modelo puede resolver problemas complejos de logica, matematicas o analisis de datos, mostrando su cadena de pensamiento para que los desarrolladores verifiquen el proceso y depuren errores.
- Agentes autonomos con herramientas: gracias a su soporte nativo de function calling, navegacion web y ejecucion de codigo Python, puede integrarse en sistemas agente que interactuan con APIs, consultan bases de datos o automatizan flujos de trabajo.
- Asistentes de programacion con tool calling: puede generar codigo, invocar funciones de desarrollo y ejecutar pruebas en pipelines de CI/CD, facilitando la automatizacion de tareas de ingenieria de software.
- Atencion al cliente con razonamiento avanzado: aunque no se especifica la longitud de contexto, su capacidad de razonamiento permite gestionar consultas complejas y multi-turno, con la opcion de ajustar el esfuerzo de razonamiento para equilibrar latencia y calidad.
- Investigacion y analisis de documentos: la cadena de pensamiento completa permite a investigadores y analistas auditar el razonamiento del modelo, aumentando la confianza en las respuestas generadas.
- Despliegue en infraestructura de un solo GPU: al caber en una GPU de 80 GB (H100 o MI300X) con cuantizacion MXFP4, es adecuado para entornos de produccion con requisitos de hardware moderados, sirviendo con vLLM o Transformers Serve.
- Fine-tuning para dominios especializados: su licencia Apache 2.0 y su capacidad de ajuste permiten adaptarlo a sectores como legal, medico o financiero, siempre que se respete el formato harmony.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial menciona que el modelo supera a otros modelos abiertos de tamano similar en tareas de razonamiento, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales consultados.

## Requisitos de hardware

- VRAM estimada: con cuantizacion MXFP4, el modelo cabe en una GPU de 80 GB (NVIDIA H100 o AMD MI300X). Para hardware de consumo, se puede usar Ollama con cuantizaciones mas agresivas, pero no se especifica la VRAM minima requerida.
- GPUs recomendadas: NVIDIA H100, AMD MI300X (80 GB). Tambien es probable que funcione en A100 80 GB, aunque no se menciona explicitamente.
- Hardware de consumo: posible mediante Ollama o LM Studio, pero requiere cuantizacion adicional (GGUF) y no se garantiza el rendimiento en GPUs de menos de 24 GB.
- Opciones de despliegue: vLLM (version especifica 0.10.1+gptoss), Transformers (incluido Transformers Serve), Ollama, LM Studio, PyTorch/Triton.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion disponible. El modelo compite con otros MoE de razonamiento open-weight como DeepSeek-R1 o Qwen-MoE, pero no se pueden ofrecer cifras concretas de rendimiento sin fuentes verificadas. Se recomienda consultar el paper arxiv:2508.10925 para obtener resultados detallados.

## Limitaciones y advertencias

- El modelo debe usarse obligatoriamente con el formato harmony; de lo contrario, no funcionara correctamente. Esto anade una capa de complejidad en la integracion.
- La cadena de pensamiento completa no debe mostrarse a usuarios finales, ya que puede revelar informacion sensible o sesgos del proceso de razonamiento.
- No se especifican los idiomas soportados; es probable que el rendimiento sea optimo en ingles y pueda degradarse en otros idiomas.
- La longitud de contexto no se ha publicado, lo que limita la planificacion de aplicaciones que requieran ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; se recomienda validar las respuestas en aplicaciones criticas.
- Aunque la licencia es Apache 2.0, OpenAI ha publicado una "gpt-oss usage policy" que puede imponer restricciones adicionales de uso; conviene revisarla antes del despliegue comercial.
- El repositorio en HuggingFace (Openintelligent123/gpt-oss-120b) no es el oficial de OpenAI; se recomienda verificar la procedencia de los pesos antes de su uso en produccion.

## Enlaces

- Repositorio HuggingFace (este): https://huggingface.co/Openintelligent123/gpt-oss-120b
- Repositorio HuggingFace oficial de OpenAI: https://huggingface.co/openai/gpt-oss-120b
- Paper (model card): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Model card oficial de OpenAI: https://openai.com/index/gpt-oss-model-card/
- Repositorio GitHub de gpt-oss: https://github.com/openai/gpt-oss
- Guias y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Pagina del producto: https://gpt-oss.com

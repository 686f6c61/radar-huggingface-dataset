# Diannnnaaaa/gemma4-26B-A4B-Medical-COT

## Resumen

Diannnnaaaa/gemma4-26B-A4B-Medical-COT es un ajuste fino (fine-tuning) del modelo base unsloth/gemma-4-26B-A4B-it, un modelo de la familia Gemma 4 de Google con arquitectura de mezcla de expertos (MoE) y 26B parametros totales con aproximadamente 4B parametros activos por token. El ajuste lo publica el usuario Diannnnaaaa y esta orientado, segun el nombre del repositorio, a dominios medicos con cadenas de razonamiento (chain-of-thought, COT). Se publica bajo licencia Apache 2.0.

El modelo hereda del base las capacidades generales de generacion de texto, razonamiento e instrucciones, y sobre ellas aplica un entrenamiento adicional con Unsloth, una libreria de fine-tuning optimizada en memoria que permite entrenar aproximadamente el doble de rapido con requisitos de VRAM reducidos. El repositorio pesa 2,0 GB, lo que sugiere que los pesos publicados no corresponden al modelo completo en precision nativa, sino probablemente a una version cuantizada o a adaptadores, aunque este extremo no esta confirmado en la informacion disponible.

La relevancia de este modelo es doble: por un lado, demuestra el flujo tipico de especializacion de un modelo MoE grande hacia un dominio vertical (medicina) con razonamiento explicito; por otro, al ser un ajuste derivado de un modelo de Google con licencia Apache 2.0, permite su uso comercial sin las restricciones adicionales de otras familias. La informacion publica es muy escasa: no hay benchmarks, no hay detalle del dataset de entrenamiento y el modelo registra cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 |
| Parametros totales | 26B (segun nombre del modelo y base) |
| Parametros activos | aproximadamente 4B por token (segun nombre A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo de 2,0 GB sugiere pesos comprimidos, sin confirmar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag de Hugging Face), compatible con transformers y TGI |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 con arquitectura MoE de 26B parametros totales y aproximadamente 4B activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. El ajuste se realizo con Unsloth y TRL, segun las etiquetas del repositorio, lo que implica un entrenamiento supervisado de instrucciones (SFT) sobre el modelo ya alineado `-it`. El nombre "Medical-COT" indica que el dataset de ajuste incorpora cadenas de razonamiento en el dominio medico, aunque no se especifica el numero de ejemplos, la composicion ni si hubo etapas de RLHF o DPO adicionales.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la mezcla del dataset, el uso de tecnicas como decodificacion especulativa o atencion lineal, ni sobre hiperparametros del ajuste (learning rate, epochs, LoRA frente a full fine-tuning). La unica innovacion documentada es el uso de Unsloth para acelerar el entrenamiento y reducir memoria.

## Capacidades

- Generacion de texto en ingles con modo instructivo heredado del modelo base `-it`.
- Razonamiento paso a paso orientado a dominios medicos (chain-of-thought), segun el nombre del repositorio.
- Respuesta a preguntas y explicaciones de conceptos clinicos o biomedicos (esperado por el ajuste, no verificado con benchmarks).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; puede heredarse del base, pero no esta documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente.
- Capacidades multilingues: limitadas a ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de formacion medica: el modelo puede generar explicaciones razonadas de conceptos clinicos en ingles, utiles para materiales de estudio o simulaciones de casos, aprovechando el ajuste COT.
- Preprocesado de notas clinicas: resumir y estructurar texto medico en ingles antes de pasarlo a sistemas de codificacion (ICD/SNOMED), siempre con supervision humana.
- Generacion de preguntas de evaluacion (MCQ) para examenes de ciencias de la salud, usando el razonamiento paso a paso para justificar cada respuesta.
- Chatbot de triaje informativo: responder preguntas frecuentes de pacientes en ingles con contexto multi-turno, con aviso explicito de que no sustituye a un profesional.
- Investigacion en NLP clinico: servir como modelo de referencia para comparar ajustes finos con y sin COT en tareas de QA biomedico.
- Prototipado rapido de pipelines medicos: al ser Apache 2.0 y compatible con transformers/TGI, se puede desplegar en entornos de investigacion sin negociacion de licencia.
- Extraccion de informacion de articulos cientificos: identificar entidades (farmacos, enfermedades, dosis) en abstracts en ingles, con validacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Para un MoE de 26B totales y 4B activos, en FP16 se requeririan aproximadamente 52 GB de VRAM; en cuantizacion de 4 bits, alrededor de 14-16 GB, aunque estos calculos son estimaciones genericas y no estan confirmados para este modelo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar A100 80 GB o H100 para precision completa; RTX 4090 (24 GB) o L4 (24 GB) para cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 con cuantizacion de 4 bits, sin confirmar.
- Opciones de despliegue: transformers, text-generation-inference (TGI) segun las etiquetas; llama.cpp, Ollama y vLLM no estan documentados para este repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Diannnnaaaa/gemma4-26B-A4B-Medical-COT | 26B totales / ~4B activos | no disponible | Apache 2.0 | Ajuste medico con COT, sin benchmarks publicados |
| unsloth/gemma-4-26B-A4B-it (base) | 26B totales / ~4B activos | no disponible | Apache 2.0 | Modelo instructivo general del que deriva |
| Alternativas medicas open source | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo elevado de alucinacion en contenido medico: no hay evaluacion clinica publicada ni validacion por profesionales.
- No apto para uso clinico directo: no debe emplearse para diagnostico, prescripcion ni decisiones terapeuticas sin supervision medica.
- Idioma limitado al ingles; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Datos de entrenamiento no documentados: se desconoce la procedencia, calidad y posibles sesgos del dataset medico usado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por la comunidad.
- El tamano del repositorio (2,0 GB) no coincide con los pesos completos de un modelo de 26B, por lo que conviene verificar que los ficheros publicados sean utilizables tal cual.
- Aunque la licencia es Apache 2.0, el uso comercial en ambito sanitario exige ademas cumplimiento normativo (por ejemplo, RGPD y regulacion de dispositivos medicos) que el modelo no cubre.
- No hay informacion sobre tool calling, agentes o contexto largo, por lo que no deben asumirse estas capacidades en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Diannnnaaaa/gemma4-26B-A4B-Medical-COT
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

# nerveband/field-soap-qwen35-4b-wfr-lora

## Resumen

Field SOAP Qwen3.5-4B WFR Clinical LoRA es un adaptador LoRA de tipo task-specific publicado por el usuario nerveband (wavedepth) para el modelo base Qwen/Qwen3.5-4B. Su proposito concreto es el de realizar comprobaciones de seguridad sobre registros clinicos de pacientes en el contexto de Wilderness First Responder (WFR) y la extraccion de notas SOAP a partir de voz con anclaje en citas (quote-grounded), dentro de la aplicacion Field SOAP. No se trata de un modelo fundacional nuevo, sino de un ajuste fino de bajo rango empaquetado en formato GGUF f16 para su uso con llama.cpp en dispositivos locales.

El adaptador emplea un rango r=16 y alpha=32, y se distribuye como un unico fichero GGUF de 60.976.544 bytes (aproximadamente 58 MiB) que debe aplicarse sobre la variante cuantizada Q4_K_M del modelo base (unsloth/Qwen3.5-4B-GGUF). El repositorio completo ocupa 0,1 GB. La escala de runtime indicada por el autor es 1.0 y se aplica en Patient Chat y en la extraccion Voice-to-SOAP, mientras que se desactiva en Guide Q&A.

La relevancia de esta ficha es acotada pero clara: ilustra el patron de publicacion de adaptadores LoRA especializados en dominios de nicho (medicina de montana o wilderness medicine) sobre modelos pequenos de 4B, empaquetados en GGUF para inferencia on-device. El dato de parametros totales reportado en safetensors (30.474.240) corresponde al adaptador y no al modelo base, lo que conviene tener en cuenta al planificar el hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.5-4B; r=16, alpha=32 |
| Parametros totales | 30.474.240 (adaptador, segun safetensors); el modelo base Qwen3.5-4B no se detalla en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B, no especificada) |
| Tipos de cuantizacion | adaptador en f16 (GGUF); el base se usa en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero qwen35-4b-wfr-lora-step80-f16.gguf, 60.976.544 bytes) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 con alpha 32, entrenado sobre el modelo Qwen3.5-4B (variante Qwen3.5-4B-Q4_K_M.gguf de unsloth) y exportado como GGUF f16 para su carga en llama.cpp. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si se emplearon tecnicas de RLHF o DPO; unicamente se indica que el ajuste esta orientado a tareas de WFR: comprobaciones de seguridad en registros de pacientes y extraccion de notas SOAP ancladas en citas a partir de transcripciones de voz.

El nombre del fichero (step80) sugiere un checkpoint intermedio del entrenamiento, aunque no se especifica el numero total de pasos ni la configuracion del optimizador. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La escala de runtime 1.0 indicada por el autor implica que el adaptador se aplica con su intensidad completa en las tareas de Patient Chat y Voice-to-SOAP, y se desactiva en Guide Q&A, lo que sugiere un diseno de enrutamiento por tarea dentro de la aplicacion Field SOAP.

## Capacidades

- Comprobaciones de seguridad en registros clinicos de paciente en contexto WFR (deteccion de inconsistencias o riesgos en la nota).
- Extraccion de notas SOAP a partir de voz con anclaje en citas (quote-grounded), es decir, vinculando cada campo extraido a un fragmento textual de la transcripcion.
- Soporte de conversacion de paciente (Patient Chat) con el adaptador activo a escala 1.0.
- Modo Guide Q&A disponible en el modelo base, con el adaptador desactivado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible; la entrada de voz se gestiona presumiblemente en la capa de aplicacion, no en el adaptador.

## Casos de uso

- Asistencia a primeros respondientes en entornos remotos: el adaptador permite validar in situ una nota WFR antes de evacuacion, senalando campos incompletos o contradicciones en el registro del paciente sin necesidad de conectividad.
- Extraccion estructurada de SOAP desde dictado por voz: en Field SOAP, el adaptador convierte una transcripcion de voz en campos Subjective, Objective, Assessment y Plan, manteniendo la cita textual de origen para auditoria.
- Formacion y simulacros de WFR: instructores pueden usar el modelo para revisar registros de alumno y comparar la calidad de la documentacion clinica en escenarios simulados.
- Triaje documental en campamentos o expediciones: con el modelo base en Q4_K_M y el adaptador f16, el conjunto cabe en equipos portatiles y permite clasificar y resumir registros de multiples pacientes al final de la jornada.
- Auditoria de calidad retrospectiva: el adaptador puede procesar lotes de notas historicas para detectar patrones de omision (por ejemplo, ausencia de constantes vitales) antes de su archivo definitivo.
- Integracion en pipelines de investigacion en medicina de montana: permite anonimizar y estructurar narrativas clinicas de campo para su analisis agregado, manteniendo la trazabilidad cita-campo.
- Despliegue como componente local en aplicaciones de terceros: al ser un GGUF f16 sobre un base Q4_K_M, puede cargarse con llama.cpp en una app de escritorio o movil sin depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, el adaptador ocupa unos 58 MiB en f16 y el base Qwen3.5-4B en Q4_K_M requiere del orden de 2,5-3 GB, aunque esta cifra no la confirma el autor.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del base en Q4_K_M y el caracter on-device declarado del adaptador, pero no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (formato nativo del adaptador); otras opciones (vLLM, TGI, Ollama) no se mencionan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| field-soap-qwen35-4b-wfr-lora (este) | 30,47 M (adaptador) sobre base 4B | no disponible | apache-2.0 | GGUF f16 | Especializado en WFR y SOAP |
| Qwen/Qwen3.5-4B (base) | 4B (aproximado por nombre) | no disponible | no disponible en esta ficha | safetensors / GGUF | Modelo generalista sin ajuste de dominio |
| Alternativas de dominio WFR | no disponible | no disponible | no disponible | no disponible | No se identifican en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta entrenado para un dominio muy especifico (WFR y notas SOAP); su uso fuera de ese contexto puede degradar el comportamiento respecto al modelo base.
- No es un dispositivo medico ni sustituye el juicio clinico; las comprobaciones de seguridad son heuristicas y pueden producir falsos negativos o positivos.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en la extraccion quote-grounded si la transcripcion es ambigua o ruidosa.
- El fichero corresponde a un checkpoint intermedio (step80); no se documenta si es el mejor checkpoint ni su curva de validacion.
- No se especifican idiomas soportados; se desconoce el comportamiento en castellano o en otras lenguas distintas del ingles.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-4B puede tener sus propias condiciones que conviene verificar por separado.
- No se documentan sesgos conocidos, evaluaciones de seguridad ni procesos de red-teaming.
- El adaptador requiere cargarse junto al base en Q4_K_M; mezclarlo con otras cuantizaciones puede alterar el comportamiento esperado.

## Enlaces

- Hugging Face: https://huggingface.co/nerveband/field-soap-qwen35-4b-wfr-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante GGUF del base citada por el autor: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Aplicacion Field SOAP (wavedepth): no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada

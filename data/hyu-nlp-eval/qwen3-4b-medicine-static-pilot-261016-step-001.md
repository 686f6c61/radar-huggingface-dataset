# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-001

## Resumen
El modelo `HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-001` es un ajuste fino del modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario HYU-NLP-EVAL bajo licencia Apache 2.0. Se trata de un checkpoint intermedio (step 1) perteneciente a una ejecución de entrenamiento identificada como `261016_medicine_static_pilot`, con semilla 11, lo que sugiere un experimento piloto de ajuste orientado al dominio medico y utilizado como referencia estática de evaluación.

El repositorio contiene 4.022.468.096 parámetros en una exportación BF16 para Transformers (safetensors) y ocupa 25,7 GB, un tamano desproporcionado respecto al numero de parámetros que se explica por la presencia de un directorio adicional `original_checkpoint/` con los ficheros nativos de veRL/FSDP y sus metadatos. La model card no aporta información sobre datos de entrenamiento, composición del dataset, hiperparámetros de RLHF/DPO ni resultados de evaluación.

Su relevancia es limitada en términos de uso práctico: al tratarse del primer paso de entrenamiento de un piloto y no haberse publicado métricas, debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción. No hay descargas ni interacciones registradas en HuggingFace en la fecha de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen3); no se detalla en la model card |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen/Qwen3-4B-Instruct-2507 declara contexto nativo de 262.144 tokens) |
| Tipos de cuantizacion | BF16 (exportación oficial en safetensors); no se publican versiones GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) en la raíz del repositorio; `original_checkpoint/` con ficheros nativos veRL/FSDP |

## Arquitectura y entrenamiento
La model card no describe la arquitectura del modelo. Por el `base_model` declarado (Qwen/Qwen3-4B-Instruct-2507) se trata de un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros, ajustado mediante un pipeline de entrenamiento basado en veRL con paralelismo FSDP, a juzgar por el contenido del directorio `original_checkpoint/`. El identificador del run (`261016_medicine_static_pilot`) y el campo `step: 1` indican que el checkpoint corresponde al primer paso de optimización de un piloto de ajuste en el ambito medico, con semilla 11.

No se especifica el numero de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o SFT supervisado, ni ninguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos). Tampoco se documenta el proceso por el cual se eliminó el checkpoint local: la model card menciona que el checkpoint local solo se borra tras verificar tamanos y hashes SHA256 remotos, un detalle de integridad de artefactos, no una característica del modelo.

## Capacidades
No se documentan capacidades especificas en la información proporcionada. Las capacidades que se enumeran a continuación son las heredables del modelo base Qwen/Qwen3-4B-Instruct-2507 y no han sido verificadas para este checkpoint concreto:

- Generación de texto conversacional y respuesta a instrucciones, dado el pipeline `text-generation` y la etiqueta `conversational`.
- Razonamiento y resolución de problemas de propósito general, presumiblemente en modo instruct.
- Generación de código, por herencia del modelo base.
- Capacidades multilingües: no disponibles (no declaradas en la ficha de este repositorio).
- Tool calling / function calling: no confirmado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado para este checkpoint.
- Capacidad especifica de dominio médico: es el eje declarado del run (`medicine_static_pilot`), pero no existe ninguna evaluación publicada que lo respalde.
- Modo thinking explicito, visión o audio: no disponible.

## Casos de uso
Advertencia previa: al ser un checkpoint de step 1 sin evaluación publicada, ninguno de los casos siguientes debe desplegarse sin una validación previa exhaustiva. Se plantean como escenarios de uso previsto del ajuste.

- Triaje y clasificación de consultas clínicas: uso del ajuste para etiquetar la urgencia o especialidad de un texto de paciente antes de derivarlo a un profesional, aprovechando el ajuste en dominio médico del run.
- Extracción de entidades farmacológicas: identificación de principios activos, dosis y vías de administración en notas clínicas, encadenando el modelo con reglas de validación posteriores.
- Resumen de historiales clínicos: condensación de notas largas en resúmenes estructurados, apoyándose en la ventana de contexto heredada del modelo base (262.144 tokens según la documentación de Qwen3-4B-Instruct-2507).
- Preguntas y respuestas sobre guías de práctica clínica: construcción de un asistente de consulta interna para personal sanitario sobre protocolos indexados, siempre con recuperación aumentada y verificación humana.
- Generación de documentación médica administrativa: redacción de informes de alta, justificantes y comunicaciones con aseguradoras a partir de datos estructurados, un caso de bajo riesgo clínico directo.
- Investigación en ajuste de dominio: reproducción del piloto `261016_medicine_static_pilot` con la semilla 11 y el checkpoint nativo de veRL/FSDP para estudiar la evolución de la perdida en los primeros pasos de entrenamiento.
- Evaluación comparativa de checkpoints: uso del artefacto como referencia base en pruebas estáticas de evaluación de modelos médicos, que es el propósito sugerido por el nombre del autor (`HYU-NLP-EVAL`) y del repositorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de ningún otro conjunto de evaluación, y tampoco se han encontrado resultados en la búsqueda web realizada. Cualquier cifra que se atribuya a este checkpoint debe considerarse no verificada.

## Requisitos de hardware
- VRAM para inferencia en BF16: aproximadamente 8,1 GB solo para pesos, mas el coste de la caché KV, que crece linealmente con la longitud de contexto. Con ventanas largas (decenas de miles de tokens) el consumo puede superar los 16-24 GB.
- VRAM en cuantización de 8 bits: alrededor de 4,3 GB de pesos, mas caché KV.
- VRAM en cuantización de 4 bits: alrededor de 2,3-2,6 GB de pesos, mas caché KV. Requiere convertir los pesos, ya que no se publican versiones GGUF en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para servir BF16 con contexto máximo; RTX 4090 (24 GB) para BF16 con contextos moderados o servicio en 8 bits; RTX 3090 (24 GB) en las mismas condiciones.
- GPU de consumo: cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) en cuantizaciones de 8 o 4 bits; en 16 GB (RTX 4060 Ti 16 GB) con margen para contexto medio. En Apple Silicon, 16 GB unificados o mas son suficientes en 8/4 bits.
- Opciones de despliegue: Transformers (formato nativo del repositorio), vLLM y TGI, dado el tag `text-generation-inference` y `endpoints_compatible`. llama.cpp y Ollama solo tras una conversión manual a GGUF, no publicada.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3-4b-medicine-static-pilot-261016-step-001 | 4,02 B | no disponible (base: 262.144 tokens) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,0 B aprox. | 262.144 tokens nativos | Apache 2.0 | HuggingFace, ampliamente utilizado | Documentado por el autor del modelo base |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens nativos, extensible | Apache 2.0 | HuggingFace | Documentado por el autor del modelo base |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License (restricciones para grandes despliegues) | HuggingFace, gated | Documentado por el autor del modelo base |

Los datos de parametros y contexto de los modelos comparables provienen de su documentación pública y no han sido verificados en la información proporcionada para esta ficha. No se dispone de una comparación de rendimiento fiable entre este checkpoint y las alternativas.

## Limitaciones y advertencias
- Checkpoint intermedio: corresponde al step 1 de un run piloto, no a un modelo final. Su calidad conversacional y su ajuste al dominio médico son, con altísima probabilidad, muy inferiores a los del modelo base.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni análisis de errores publicados. No existe evidencia que respalde ninguna afirmación sobre su desempeño clínico.
- Riesgo de alucinación: no cuantificado, pero inherente a los modelos de lenguaje de 4 B de parámetros en dominio médico, donde una afirmación incorrecta puede causar dano.
- Uso clínico: este modelo no debe utilizarse para diagnóstico, prescripción ni decisión terapéutica sin supervisión profesional y sin una validación regulatoria específica.
- Sesgos conocidos: no documentados en la información disponible. El modelo base tampoco se distribuye con un análisis de sesgos específico para el dominio médico.
- Idiomas: no declarados en este repositorio. No se puede asumir un rendimiento equivalente en castellano al del modelo base sin una evaluación especifica.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del artefacto no cubre el cumplimiento normativo sanitario ni la responsabilidad derivada del uso clínico.
- Datos potencialmente sensibles: si el corpus del piloto incluyó datos de pacientes, no se documenta ningún proceso de anonimización ni de auditoría de privacidad.
- Trazabilidad: el repositorio incluye el checkpoint nativo de veRL/FSDP, lo que aumenta el tamano hasta 25,7 GB y complica su descarga y almacenamiento sin aportar utilidad para inferencia.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-001
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog, repositorio o demo del autor: no disponible.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a sitios sin relación (Hyundai France, canales de YouTube ajenos al proyecto, un perfil de artes marciales y catálogos de distribución), por lo que se omiten.

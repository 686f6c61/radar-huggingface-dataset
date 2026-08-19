# ShuohaoGao-THU/Salus-7B

## Resumen

Salus-7B es un modelo de lenguaje especializado en diagnóstico clínico complejo, desarrollado por ShuohaoGao-THU (Universidad de Tsinghua) y presentado en el ICML 2026 en el trabajo *Salus: Strategic Diagnostic Testing for Complex Diagnosis via Multi-Agent Reinforcement Learning*. Está construido sobre Qwen2.5-7B-Instruct y está diseñado para abordar el diagnóstico como un proceso secuencial de recopilación de evidencia, en lugar de responder a preguntas aisladas de examen médico.

El modelo descompone el razonamiento diagnóstico en tres roles funcionales: un razonador diferencial que genera diagnósticos diferenciales a partir del historial del paciente, un controlador estratégico que decide si solicitar más pruebas o emitir un diagnóstico final, y un proponente de pruebas complementarias que recomienda los exámenes auxiliares necesarios. Estos tres roles se entrenan mediante supervisión fina (SFT) seguida de optimización de políticas por gradiente relativo de grupo (GRPO) con recompensas estructuradas que penalizan el cierre diagnóstico prematuro.

Con aproximadamente 7,6 mil millones de parámetros, Salus-7B demuestra que un modelo de este tamaño puede superar a sistemas mucho más grandes como DeepSeek-V3.2 y equipararse a GPT-5.2 en casos de alta complejidad, según el benchmark CompDiag-Bench. Es relevante ahora porque aborda una carencia clave de los modelos médicos actuales: la capacidad de razonar estratégicamente sobre qué información adicional solicitar antes de emitir un diagnóstico. El modelo está pensado exclusivamente para uso clínico asistido y no como chatbot general, y requiere los prompts fijos en chino especificados por sus autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model (transformers) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada; el modelo base Qwen2.5-7B-Instruct soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | chino (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 30,5 GB) |

## Arquitectura y entrenamiento

Salus-7B parte de Qwen2.5-7B-Instruct, un modelo causal de tipo transformer con atención completa. No es una arquitectura MoE ni híbrida; se trata de un modelo denso de 7,6 B parámetros. La innovación principal no está en la arquitectura base, sino en el esquema de entrenamiento y en el diseño multiagente: el modelo se entrena para ejecutar tres roles distintos (razonador diferencial, controlador estratégico y proponente de pruebas) mediante un proceso de dos fases.

La primera fase consiste en supervisión fina (SFT) sobre datos clínicos estructurados. La segunda fase aplica GRPO (Group Relative Policy Optimization), un algoritmo de optimización de políticas por gradiente de grupo, con recompensas diseñadas para calibrar el comportamiento de búsqueda de evidencia: se penaliza el cierre diagnóstico prematuro, se premia la solicitud de pruebas relevantes y se mejora la calidad del diagnóstico diferencial. El modelo está optimizado para tres instrucciones de sistema fijas en chino, y los autores advierten que reformular estos prompts puede degradar sustancialmente el rendimiento. Los datos de entrenamiento incluyen casos clínicos complejos, aunque no se detalla el número exacto de tokens ni la composición completa del dataset en la información disponible.

## Capacidades

- Generación de diagnósticos diferenciales a partir de historiales clínicos estructurados (formato `<病历>...</病历>`).
- Decisión estratégica entre continuar con pruebas auxiliares o emitir un diagnóstico final, mediante un formato de salida restringido (`继续辅助检查` o `您的诊断结果为：...`).
- Recomendación de exámenes auxiliares específicos, con formato de lista (`请求进行以下辅助检查：`).
- Razonamiento multi-paso: el modelo integra el historial del paciente y el diagnóstico diferencial previo para decidir el siguiente paso clínico.
- Capacidad de emitir razonamiento interno antes de un marcador `</reason>`, que debe eliminarse al parsear la salida.
- Soporte multilingüe limitado: entrenado principalmente en chino, con capacidad residual en inglés.
- No es un chatbot general: no admite conversación libre ni tareas fuera de los tres roles definidos.

## Casos de uso

- Diagnóstico asistido en consulta externa: un médico introduce el historial del paciente en el formato prescrito y Salus genera una lista de diagnósticos diferenciales priorizados, que el clínico puede revisar como segunda opinión.
- Racionalización de pruebas complementarias: el controlador estratégico decide si se necesitan más exámenes, y el proponente de pruebas recomienda cuáles, lo que ayuda a reducir pruebas innecesarias y costes en servicios de medicina interna.
- Formación de residentes en medicina: los estudiantes pueden practicar el razonamiento diagnóstico interactivo presentando casos y comparando sus decisiones con las del modelo.
- Sistemas de apoyo a la decisión clínica (CDSS): integración como módulo de razonamiento secuencial en plataformas hospitalarias, donde el modelo recibe datos estructurados del historial electrónico y sugiere el siguiente paso diagnóstico.
- Evaluación de casos complejos en telemedicina: cuando un especialista no está disponible, el modelo puede guiar a un médico general a través de un proceso de diagnóstico paso a paso.
- Investigación en IA médica: como referencia reproducible para estudios sobre diagnóstico secuencial, gracias a su licencia Apache 2.0 y al código de evaluación publicado en GitHub.

## Benchmarks y rendimiento

Según el paper de ICML 2026, Salus-7B se evaluó en CompDiag-Bench, un benchmark de casos clínicos estilo OSCE que mide tanto el diagnóstico estático como el diagnóstico interactivo con solicitud de pruebas. Los resultados reportados indican:

| Modelo | Rendimiento en casos de alta complejidad (CompDiag-Bench) |
|---|---|
| Salus-7B | Supera a DeepSeek-V3.2 (71,38 %) y es comparable a GPT-5.2 (80,30 %) |
| DeepSeek-V3.2 | 71,38 % |
| GPT-5.2 | 80,30 % |

No se proporciona la puntuación exacta de Salus-7B en la información disponible, solo que supera a DeepSeek-V3.2 y se sitúa en el nivel de GPT-5.2. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con los pesos en FP16 (aproximadamente 15 GB), se requiere una GPU con al menos 16 GB de VRAM; con cuantización de 4 bits (estimada en 4-5 GB) podría ejecutarse en GPUs de 8 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: NVIDIA A100 (40 GB) o H100 para inferencia sin cuantizar; RTX 4090 (24 GB) es suficiente para FP16; RTX 3090 o RTX 4080 pueden servir con cuantización.
- ¿Cabe en GPU de consumo? Sí, con cuantización de 4 bits en GPUs de 8-12 GB, aunque el repo oficial solo incluye safetensors en precisión completa.
- Opciones de despliegue: transformers con `device_map="auto"`, compatible con text-generation-inference (TGI) según las etiquetas del repo; también puede usarse con vLLM si se convierte el formato, aunque no está confirmado.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 7,6 B, se espera una latencia de decodificación de unos 20-40 tokens/s en una A100, pero es una estimación no oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad | Rendimiento en CompDiag-Bench |
|---|---|---|---|---|---|
| Salus-7B | 7,6 B | no especificado (base: 32k) | Apache 2.0 | Diagnóstico secuencial | Supera a DeepSeek-V3.2, comparable a GPT-5.2 |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 | Apache 2.0 | Chat general | No evaluado en CompDiag-Bench |
| DeepSeek-V3.2 | ~600 B (MoE) | no especificado | no disponible | Chat general | 71,38 % |
| GPT-5.2 | no disponible | no disponible | propietaria | Chat general | 80,30 % |

La comparativa muestra que Salus-7B, con un tamaño mucho menor que DeepSeek-V3.2 y GPT-5.2, logra un rendimiento competitivo en la tarea específica de diagnóstico complejo, aunque no es comparable en capacidades generales. Frente a su modelo base, Qwen2.5-7B-Instruct, Salus añade el entrenamiento especializado en razonamiento clínico secuencial.

## Limitaciones y advertencias

- No es un modelo de propósito general: está optimizado exclusivamente para tres instrucciones de sistema fijas en chino; usarlo como chatbot o reformular los prompts degrada significativamente el rendimiento.
- Idioma principal chino: aunque soporta inglés, el entrenamiento y los prompts están diseñados para chino; su uso en otros idiomas no está validado.
- Riesgo de alucinación: como todo modelo generativo, puede producir diagnósticos o recomendaciones de pruebas incorrectas; no debe utilizarse como sustituto del juicio clínico profesional.
- Sesgos potenciales: los datos de entrenamiento clínico pueden reflejar sesgos de la población o del sistema sanitario de origen; no se han publicado análisis de sesgo.
- Dependencia del formato de entrada: requiere que el historial del paciente se introduzca exactamente en el formato `<病历>...</病历>`, lo que limita su integración en flujos de trabajo no estructurados.
- Sin cuantizaciones oficiales: el repo solo contiene safetensors en precisión completa; el despliegue en hardware limitado requiere conversión manual.
- Rendimiento no verificado en producción: los benchmarks provienen de un entorno de investigación; no hay estudios independientes de validación clínica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ShuohaoGao-THU/Salus-7B
- Paper en OpenReview (PDF): https://openreview.net/pdf/538b51a0e48a08ce527cede5ea456d969d21e289.pdf
- Página del poster en ICML 2026: https://icml.cc/virtual/2026/poster/64732
- Foro del paper en OpenReview: https://openreview.net/forum?id=KPsrOYaU79
- Repositorio de código en GitHub: https://github.com/ShuohaoGao/ICML-Salus
- Espacio de reproducción en HuggingFace: https://huggingface.co/spaces/bsenst/repro-salus-strategic-diagnostic-testing-for-complex-diagnosis-via-multi-agent-reinforcement-lea
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct

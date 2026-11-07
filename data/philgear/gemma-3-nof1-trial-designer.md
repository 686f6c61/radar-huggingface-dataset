# philgear/gemma-3-nof1-trial-designer

## Resumen

PocketGull Gemma 3 N-of-1 Single-Case Trial Designer es un adaptador LoRA publicado por philgear (PocketGull LLC) sobre el modelo base google/gemma-3-4b-it. Su funcion es generar protocolos de ensayos clínicos individuales (N-of-1) con diseno cruzado ABAB de 56 días, incluyendo cálculos de superioridad bayesiana y reglas de parada. El adaptador se ha ajustado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clínicos deidentificados conforme al estándar HIPAA §164.514 Safe Harbor.

El modelo aborda un nicho concreto: la biostatística clínica personalizada aplicada a la medicina basada en evidencia individual. Resulta relevante para investigadores y desarrolladores que construyen herramientas de apoyo a la decisión clínica (CDS) no reguladas como dispositivo bajo la sección FDA 520(o), con un enfoque explícito de retención cero de información de salud protegida (PHI) y despliegue local o en Vertex AI.

Arquitectura y tamano heredados del modelo base (Gemma 3 4B instruct, transformer multimodal con 128k de contexto y soporte de más de 140 idiomas), aunque el adaptador declara únicamente inglés como idioma de entrenamiento. La licencia del adaptador es Apache 2.0, mientras que los pesos del modelo base se rigen por los términos de Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Gemma 3 4B instruct |
| Parámetros totales | no disponible (adaptador LoRA sobre base de 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base admite 128k tokens |
| Tipos de cuantización | no disponible (el ejemplo de inferencia usa bfloat16) |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 (adaptador); el modelo base se rige por los términos de Gemma |
| Formato de pesos | PEFT / LoRA (librería peft); pesos del modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-3-4b-it, un transformer multimodal de 4.000 millones de parámetros con ventana de contexto de 128k tokens y capacidades de visión y texto. El ajuste se realiza con PEFT/LoRA y se ha refinado mediante Direct Preference Optimization (DPO) sobre datos clínicos específicos del dominio, deidentificados según HIPAA §164.514 Safe Harbor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni la configuración de hiperparámetros del LoRA (rango, alpha, módulos objetivo).

La innovación destacable no es arquitectónica sino de dominio y cumplimiento normativo: el modelo está disenado para computación en el borde (local) o despliegue privado en Google Cloud Vertex AI, con retención cero de PHI, y se posiciona como herramienta de apoyo a la evidencia para profesionales sanitarios licenciados bajo la exención FDA 520(o) para software de apoyo a la decisión clínica no regulado como dispositivo médico.

## Capacidades

- Generación de protocolos de ensayos N-of-1 con diseno cruzado ABAB de 56 días.
- Cálculo de reglas de parada y de superioridad mediante estadística bayesiana (posterior).
- Razonamiento clínico estructurado orientado a bioestadística personalizada.
- Generación de texto en inglés con temperatura baja recomendada (0.2 en el ejemplo del autor) para salidas deterministas.
- Hereda del modelo base Gemma 3 4B las capacidades multimodales (texto e imagen) y el contexto de 128k tokens, aunque el adaptador no las documenta explícitamente.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- No se documentan modos especiales (thinking mode, audio) más allá de los heredados del modelo base.

## Casos de uso

- Diseno de ensayos N-of-1 para práctica clínica individual: el modelo genera el protocolo completo de 56 días con fases ABAB, aleatorización y reglas de parada bayesianas, adecuado para profesionales que evaluan intervenciones en un único paciente.
- Evaluación de suplementos y fármacos con evidencia limitada: por ejemplo, comparar magnesio L-treonato frente a placebo para mantenimiento del sueno, con cálculo de superioridad posterior, como muestra el ejemplo del autor.
- Investigación clínica de precisión: apoyo a la redacción de protocolos reproducibles para estudios de caso único en entornos académicos con trazabilidad mediante DOI de Zenodo.
- Herramientas CDS en producción sanitaria: integración en sistemas de apoyo a la decisión clínica que requieren retención cero de PHI y despliegue local o en Vertex AI privado.
- Automatización documental regulatoria: generación de borradores de protocolos y justificaciones estadísticas para comités de ética o revisión interna.
- Formación y simulación clínica: generación de casos didácticos de diseno experimental para residentes y estudiantes de bioestadística.
- Pipelines de investigación con privacidad por diseno: uso en arquitecturas de computación en el borde donde los datos del paciente nunca salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador LoRA sobre un modelo base de 4B parámetros, la huella corresponde prácticamente a la del modelo base (el ejemplo del autor usa bfloat16 y device_map="auto").
- GPU recomendadas: no se indican en la información disponible; el modelo base Gemma 3 4B está optimizado para despliegue en una sola GPU.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente VRAM para un modelo de 4B en bfloat16 o cuantizado; no se aportan cifras concretas.
- Opciones de despliegue: Transformers + PEFT (documentado por el autor), Google Cloud Vertex AI privado y computación local en el borde. No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PocketGull Gemma 3 N-of-1 Trial Designer (este) | LoRA sobre 4B | 128k (base) | Protocolos N-of-1 clínicos | Apache 2.0 (adaptador) | Hugging Face (0 descargas) |
| google/gemma-3-4b-it | 4B | 128k | Propósito general multimodal | Términos de Gemma | Hugging Face |
| Modelos clínicos especializados de propósito general | no disponible | no disponible | Clínico general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de adaptadores clínicos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador declara únicamente inglés como idioma; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 4B en dominio clínico: las salidas deben validarse por profesionales licenciados antes de cualquier uso asistencial.
- No es un dispositivo médico: se posiciona como software de apoyo a la decisión clínica no regulado bajo FDA 520(o); no sustituye el juicio clínico.
- Sesgos conocidos: no documentados en la información disponible; el adaptador hereda los sesgos del modelo base.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial debe respetar además los términos del modelo base Gemma.
- Sin benchmarks publicados ni métricas de calidad, lo que impide evaluar su fiabilidad frente a alternativas.
- Sin descargas ni likes en el momento de la consulta; ausencia de validación comunitaria.
- El cumplimiento HIPAA depende de la implementación (retención cero de PHI, despliegue local), no solo del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-nof1-trial-designer
- Perfil del autor: https://huggingface.co/philgear
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Organización: https://pocketgull.com
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Web oficial de Gemma 3: https://gemma3.ai/
- Aplicación PocketGull: https://pocketgull.app

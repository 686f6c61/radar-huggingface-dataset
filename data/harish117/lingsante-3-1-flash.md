# Harish117/LingSante-3.1-flash

## Resumen

LingSante-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con pesos abiertos, desarrollado por el equipo inclusionAI (Alipay/Ant Group) y distribuido en Hugging Face a través de la cuenta Harish117. Está especializado en razonamiento médico complejo, comunicación sanitaria profesional, investigación basada en evidencia y ejecución de tareas médicas de largo horizonte. Se construye sobre la arquitectura de Ling-3.1-flash, conservando su diseño híbrido de atención lineal y MoE.

El modelo cuenta con 560 mil millones de parámetros totales (572.120.680.768 según los safetensors publicados) y activa 25 mil millones de parámetros por token, lo que lo sitúa en la categoría de MoE de gran escala con un coste de inferencia por token relativamente contenido. Su ventana de contexto alcanza el millón de tokens, un dato relevante para tareas que requieren manejar historiales clínicos extensos, documentación regulatoria o cadenas de evidencia largas.

La relevancia actual del modelo radica en su enfoque vertical: no se limita a conocimiento médico general, sino que incorpora marcos de alineación de razonamiento con evidencia, entornos interactivos para tareas de largo horizonte y alineación de comportamiento profesional sanitario. El autor advierte explícitamente que el modelo es para investigación y evaluación, y que no es un dispositivo médico ni debe usarse como base independiente para diagnóstico, prescripción o tratamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (híbrida lineal, basada en Ling-3.1-flash) |
| Parámetros totales | 560B (572.120.680.768 según safetensors) |
| Parámetros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | fp8 (según tags del repo); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, requiere código personalizado) |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida lineal que combina 63 capas KDA (atención lineal) con 9 capas Gated MLA (atención multi-cabeza latente con compuerta), en una proporción 7:1, más 4 capas densas. El modelo emplea 512 expertos enrutados y 1 experto compartido, activando 8 expertos enrutados por token. La dimensión oculta es de 4096, el tamaño intermedio de experto de 1280, el tamaño intermedio denso de 10240, con 64 cabezas de atención y un vocabulario de 157184 tokens. Esta configuración híbrida busca combinar la eficiencia de la atención lineal en contextos largos con la capacidad expresiva de la atención MLA en las capas seleccionadas.

El entrenamiento combina datos generales y médicos a lo largo de todas las fases: preentrenamiento con mezcla médica nativa, mid-training, ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) específico para razonamiento médico, uso de herramientas, búsqueda y comportamiento profesional. Posteriormente se aplica destilación on-policy multi-profesor para transferir capacidades complementarias a un único modelo, preservando el rendimiento tanto en tareas médicas como generales (razonamiento, código, búsqueda y uso de herramientas). El autor describe marcos específicos de alineación de razonamiento con evidencia y de tareas médicas de largo horizonte con entornos interactivos y verificación estructurada.

## Capacidades

- Generación de texto y razonamiento médico complejo, incluyendo identificación de factores clave en decisiones clínicas y resolución de conflictos entre fuentes de evidencia.
- Comunicación sanitaria profesional: respuestas contextualizadas, profesionales y accionables ante información incompleta o en evolución.
- Investigación basada en evidencia con verificación y búsqueda a través de múltiples escenarios.
- Ejecución de tareas médicas de largo horizonte: coordinación de herramientas e información dentro de un mismo flujo de trabajo, con adaptación de planes ante nueva información.
- Uso de herramientas (tool calling / function calling) y entornos interactivos de múltiples pasos.
- Capacidades generales preservadas: razonamiento, código, búsqueda y uso de herramientas, gracias al entrenamiento conjunto con datos generales.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Apoyo a la documentación clínica: el modelo puede procesar historiales extensos y notas de evolución aprovechando su ventana de 1M de tokens para resumir, estructurar y verificar información de múltiples episodios asistenciales.
- Investigación de evidencia biomédica: dado su entrenamiento en verificación de evidencia y búsqueda, puede integrarse en flujos que consulten bases de datos bibliográficas y sinteticen hallazgos con trazabilidad de fuentes.
- Triaje y orientación no diagnóstica: en entornos de investigación, puede generar respuestas contextualizadas ante información incompleta, siempre bajo supervisión profesional y sin uso diagnóstico autónomo.
- Automatización de flujos administrativos sanitarios: coordinación de herramientas y subprocesos (verificación de cobertura, cumplimentación de formularios, derivaciones) en tareas de múltiples pasos.
- Evaluación y auditoría de calidad asistencial: análisis de conversaciones o registros clínicos para detectar inconsistencias, riesgos de seguridad o desviaciones de protocolo, apoyándose en su alineación de comportamiento profesional.
- Investigación académica en IA médica: como modelo de referencia open-weight para experimentos de razonamiento clínico, alineación y uso de herramientas, con licencia MIT que facilita la reproducibilidad.
- Sistemas de formación médica simulada: generación de casos clínicos interactivos y escenarios de múltiples pasos para entrenamiento de residentes, con entornos interactivos y verificación estructurada.

## Benchmarks y rendimiento

El autor indica que el modelo obtiene un rendimiento destacado entre los modelos de código abierto en tareas de razonamiento médico complejo, y que ocupa el segundo puesto global en benchmarks de comportamiento profesional médico, solo por detrás de GPT-6 Astra. Sin embargo, en la información proporcionada no se incluyen tablas numéricas de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes médicos como MedQA o MedMCQA). La model card referencia una imagen de resumen de benchmarks, pero no se aportan los valores concretos.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 560B parámetros totales, en fp8 se requieren aproximadamente 560 GB solo para pesos, más overhead de activaciones y caché KV; en cuantizaciones de 4 bits se reduciría a unos 280-300 GB, aunque no se documentan variantes GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: para fp8 se necesitan múltiples aceleradores de gama alta (H100 80GB, H200, B200) en configuración multi-GPU o multi-nodo; no es viable en una sola GPU convencional.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo, dado el tamaño del modelo.
- Opciones de despliegue: el repo requiere `custom_code` (arquitectura bailing_hybrid), por lo que la integración con vLLM, TGI o llama.cpp depende de que exista soporte para dicha arquitectura; no se confirma soporte en la información disponible. Ollama no es viable por tamaño.
- Latencia y throughput: no disponibles. Con 25B parámetros activos por token, el coste computacional por token es inferior al de un modelo denso de 560B, pero el ancho de banda de memoria para cargar expertos condiciona la latencia en despliegues multi-GPU.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| LingSante-3.1-flash | 560B | 25B | 1M | MIT | Médico vertical sobre MoE híbrida |
| Ling-3.1-flash (base) | 560B (según card) | 25B | 1M | no disponible en la información | Generalista, misma arquitectura |
| GPT-6 Astra | no disponible | no disponible | no disponible | propietaria | Referencia propietaria citada en la card |

No se dispone de datos numéricos de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría (por ejemplo, otros MoE médicos open-weight). La comparación con Ling-3.1-flash es estructural, ya que LingSante conserva su arquitectura y añade especialización médica mediante entrenamiento adicional.

## Limitaciones y advertencias

- El propio autor declara que el modelo es para investigación y evaluación, y que no es un dispositivo médico: no debe usarse como base independiente para diagnóstico, prescripción o tratamiento.
- Riesgo de alucinación: en dominios médicos, la generación de evidencia o recomendaciones no verificadas puede tener consecuencias graves; se requiere verificación humana y trazabilidad de fuentes.
- Sesgos conocidos: no se documentan en la información proporcionada; cabe esperar sesgos derivados de los datos clínicos y generales de entrenamiento, con posible infrarrepresentación de poblaciones o sistemas sanitarios concretos.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe ni calidad en castellano.
- Licencia MIT: permite uso comercial, pero la advertencia de no uso clínico independiente debe respetarse; la responsabilidad regulatoria recae en el implementador.
- Requiere `custom_code` para cargar los pesos (arquitectura bailing_hybrid), lo que puede complicar el despliegue en stacks estándar y exigir versiones específicas de las librerías.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor de la cuenta (Harish117) no coincide con el equipo original (inclusionAI); conviene verificar la procedencia e integridad de los pesos antes de usarlos en producción.
- Tamaño de 573,8 GB en safetensors: el almacenamiento y la transferencia son costosos, y no se ofrecen variantes cuantizadas oficiales más allá de la mención a fp8.

## Enlaces

- Hugging Face (copia en la cuenta Harish117): https://huggingface.co/Harish117/LingSante-3.1-flash
- Hugging Face (modelo original): https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API en Computrix: https://computrix.ai/sg/models/modelservice-1795159585527001414
- Modelo base Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash

# inclusionAI/LingSante-3.1-flash

## Resumen

LingSante-3.1-flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por inclusionAI, orientado especificamente a razonamiento medico complejo, comunicacion sanitaria profesional, investigacion basada en evidencia y tareas medicas de horizonte largo. Se construye sobre Ling-3.1-flash y cuenta con 560 mil millones de parametros totales, de los que activa 25 mil millones por token, con una ventana de contexto de 1 millon de tokens. La arquitectura es un MoE hibrido con atencion linear (KDA) y Gated MLA, lo que permite sostener contextos muy extensos con un coste computacional de activacion contenido.

El modelo aborda un problema concreto: las tareas medicas reales no se resuelven solo con inteligencia general, ya que implican informacion de salud incompleta, heterogeneidad de pacientes y requisitos estrictos de cumplimiento operativo. Para ello, LingSante-3.1-flash se entrena con datos medicos y generales de forma nativa, con ajuste supervisado y aprendizaje por refuerzo especifico para razonamiento medico, uso de herramientas, busqueda y comportamiento profesional, ademas de destilacion on-policy multi-profesor para consolidar capacidades complementarias en un unico modelo.

Es relevante ahora porque combina un contexto de 1M tokens con capacidades de ejecucion de flujos de trabajo multietapa y verificacion de evidencia, algo poco habitual en modelos abiertos de dominio medico. Se publica con licencia MIT y pesos en safetensors, lo que facilita su evaluacion y despliegue por parte de equipos de investigacion y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 Gated MLA, proporcion 7:1; 4 capas densas) |
| Parametros totales | 560B (572.120.680.768 segun safetensors) |
| Parametros activos | 25B por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | fp8 (indicado en los tags del repositorio); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code) |

Otros datos de arquitectura: 512 expertos enrutados mas 1 experto compartido, 8 expertos enrutados activados por token, 64 cabezas de atencion, hidden size 4096, tamano intermedio de experto 1280, tamano intermedio denso 10240 y vocabulario de 157184 tokens.

## Arquitectura y entrenamiento

LingSante-3.1-flash conserva la arquitectura de Ling-3.1-flash: un transformer MoE hibrido que alterna capas de atencion linear KDA con capas Gated MLA en una proporcion 7:1 (63 capas KDA y 9 Gated MLA), mas 4 capas densas. El modelo emplea 512 expertos enrutados y 1 experto compartido, activando 8 expertos enrutados por token, lo que resulta en 25B parametros activos sobre un total de 560B. Esta configuracion busca equilibrar la capacidad de un modelo de gran escala con un coste de inferencia acotado, y la atencion linear es clave para sostener la ventana de 1M tokens.

El entrenamiento combina datos generales y medicos a lo largo de todas las fases: preentrenamiento, mid-training y ajuste supervisado (SFT). Los datos medicos aportan conocimiento de dominio y ejemplos clinicamente fundamentados, mientras que los generales preservan capacidades amplias como razonamiento, codigo, busqueda y uso de herramientas. En la fase de post-entrenamiento se aplica aprendizaje por refuerzo especifico para razonamiento medico, uso de herramientas, busqueda y comportamiento profesional, y finalmente se utiliza destilacion on-policy multi-profesor para transferir fortalezas complementarias a un unico modelo sin degradar el rendimiento en tareas generales. La model card menciona marcos propios de alineacion evidencia-razonamiento, de tareas medicas de horizonte largo y de alineacion de comportamiento profesional.

## Capacidades

- Razonamiento medico complejo: identificacion de factores clave en decisiones clinicas, validacion de evidencia de soporte y resolucion de conflictos entre fuentes.
- Comunicacion sanitaria profesional: respuestas contextualizadas y accionables alineadas con estandares clinicos.
- Investigacion basada en evidencia (deep research) con verificacion a traves de escenarios.
- Tareas medicas de horizonte largo: ejecucion de flujos de trabajo multietapa con coordinacion de herramientas e informacion.
- Uso de herramientas (tool calling / function calling) y busqueda integrada en el razonamiento.
- Capacidades generales preservadas: razonamiento, generacion de codigo y busqueda.
- Ventana de contexto de 1M tokens para manejar historiales clinicos extensos y documentacion multiple.
- Capacidades multilingues: no especificadas en la informacion disponible.

## Casos de uso

- Revision de historiales clinicos extensos: el modelo puede procesar documentos de hasta 1M tokens en una sola pasada, lo que permite analizar historiales completos de pacientes con multiples episodios y pruebas sin fragmentacion.
- Apoyo a la investigacion medica basada en evidencia: dado su entrenamiento en verificacion de evidencia y busqueda, puede sintetizar literatura y contrastar hallazgos entre fuentes, senalando conflictos.
- Ejecucion de flujos de trabajo clinicos multietapa: con capacidades de horizonte largo y tool calling, puede coordinar sub-tareas encadenadas (recogida de datos, comprobaciones, generacion de resumen) en un unico proceso.
- Generacion de documentacion sanitaria profesional: redaccion de informes y resumenes con tono y estructura alineados con estandares profesionales, gracias al entrenamiento en comportamiento profesional.
- Asistencia en triaje y clasificacion de informacion incompleta: su entrenamiento con informacion de salud incompleta le permite operar en escenarios donde faltan datos y proponer pasos siguientes.
- Evaluacion y benchmarking de sistemas medicos: al ser un modelo abierto con licencia MIT, sirve como referencia para comparar pipelines de razonamiento medico en entornos de investigacion.
- Integracion en herramientas de soporte a la decision para investigacion: mediante API (Computrix) o despliegue propio, para prototipos de asistencia clinica siempre bajo supervision humana.

## Benchmarks y rendimiento

La model card indica un rendimiento lider entre modelos abiertos en tareas de razonamiento medico complejo y un segundo puesto global en benchmarks de comportamiento profesional medico, solo por detras de GPT-6 Astra. Sin embargo, los valores numericos concretos de los benchmarks aparecen unicamente en una imagen incrustada en la model card y no como texto en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| Razonamiento medico complejo | lider entre modelos abiertos (sin cifras en texto) |
| Comportamiento profesional medico | segundo global, tras GPT-6 Astra (sin cifras en texto) |
| MMLU / HumanEval / GSM8K | no disponible |

No se han publicado resultados numericos de benchmarks en texto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 572.120.680.768 parametros (unos 572 GB en fp8), la inferencia requiere multiples GPU de alta capacidad; no cabe en una sola GPU convencional.
- GPU recomendadas: para fp8 se necesitan varios nodos con GPU de centro de datos (por ejemplo, H100 o A100 de 80 GB en configuracion multi-GPU). El dato concreto de numero minimo de GPU no esta disponible.
- Consumer GPU: no es viable en GPU de consumo; el tamano del repositorio (573,8 GB) y los parametros totales lo impiden.
- Opciones de despliegue: pesos en safetensors con custom_code; se requiere cargar la implementacion personalizada de la arquitectura. El soporte explicito en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible. Existe acceso via API en Computrix.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LingSante-3.1-flash | 560B | 25B | 1M | MIT | Especializado en dominio medico |
| Ling-3.1-flash | no disponible | no disponible | no disponible | no disponible | Modelo base sobre el que se construye |
| GPT-6 Astra | no disponible | no disponible | no disponible | propietaria | Referencia en comportamiento profesional medico (supera a LingSante en ese benchmark) |

No se dispone de datos suficientes sobre otros modelos abiertos comparables de dominio medico en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta destinado a investigacion y evaluacion; no es un dispositivo medico y no debe usarse como base independiente para diagnostico, prescripcion o tratamiento.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente critico en contexto clinico.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no especificados, lo que limita la evaluacion de cobertura multilingue.
- Aunque la licencia es MIT, el uso en produccion sanitaria exige supervision profesional y cumplimiento normativo adicional.
- Requiere infraestructura de multiples GPU de centro de datos; no apto para hardware de consumo.
- El soporte en frameworks de inferencia habituales no esta confirmado y puede requerir implementacion personalizada por el custom_code.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-flash
- ModelScope: https://www.modelscope.cn/models/inclusionAI/LingSante-3.1-flash
- API (Computrix): https://computrix.ai/sg/models/modelservice-1795159585527001414
- Modelo base Ling-3.1-flash: https://huggingface.co/inclusionAI/Ling-3.1-flash

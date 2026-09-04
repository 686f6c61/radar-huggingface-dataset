# chenhaodev/triage-qwen3-8b-lora

## Resumen

`chenhaodev/triage-qwen3-8b-lora` es un adaptador LoRA (PEFT) de 0.2 GB basado en el modelo `Qwen/Qwen3-8B`, desarrollado por `chenhaodev`. Está diseñado para asistir en el triaje telefónico médico: a partir de la queja narrada por un paciente en lenguaje natural (preferentemente en chino, con soporte para inglés), el modelo genera un nivel de gravedad (`emergency` / `urgent` / `non-acute`), un diagnóstico diferencial preliminar y una recomendación de actuación, siguiendo el formato `分诊级别：...。疑似诊断/考虑：...。处置建议：...`.

La relevancia del modelo radica en su enfoque de conocimiento destilado: se extrajeron 887 registros estructurados de un protocolo de triaje telefónico para adultos (PDF de 481 páginas) y se usó un profesor vLLM para convertirlos en quejas realistas en primera persona. Los 842 ejemplos de entrenamiento se ajustaron con 4-bit QLoRA y unsloth (r=16, alpha=16, use_rslora), alcanzando una pérdida final de 0.156 tras 5 épocas. No se documentan resultados clínicos ni benchmarks; el modelo es un adaptador sobre una arquitectura transformer densa de 8B parámetros, con una ventana de contexto no especificada en la información disponible. Está publicado bajo licencia Apache 2.0 y debe tratarse únicamente como herramienta de investigación y apoyo, no como sustituto de un profesional sanitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen/Qwen3-8B) + adaptador LoRA (PEFT) |
| Parametros totales | 8.000 millones (modelo base); parametros del adaptador LoRA no especificados |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit QLoRA utilizado en el entrenamiento; inferencia no especificada |
| Idiomas soportados | zh, en (chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3-8B`, un transformer denso de la serie Qwen3. El adaptador fue entrenado con la librería `unsloth` usando cuantización 4-bit QLoRA (r=16, alpha=16, use_rslora) y se carga mediante PEFT sobre el modelo base. La inferencia utiliza `enable_thinking=False`, por lo que no se genera una cadena de razonamiento explícita.

Los datos de entrenamiento provienen de un protocolo de triaje telefónico para adultos (PDF de 481 páginas). Se parseó la estructura de tablas de tres columnas del PDF para obtener 887 registros de síntomas, niveles de gravedad y recomendaciones. Un profesor vLLM (identificado como `minimax`) destiló estos registros en quejas en primera persona, conservando la información médica. El dataset final contiene 842 ejemplos de entrenamiento y 45 de validación, con una distribución de clases de 236 emergencias, 375 casos urgentes y 276 no agudos. El entrenamiento constó de 5 épocas y 530 pasos, con una pérdida de 3.88 a 0.156. No se realizaron fases de RLHF ni DPO.

## Capacidades

- Clasificación de gravedad en triaje telefónico: asigna un nivel entre `emergency`, `urgent` y `non-acute` a partir de una queja del paciente en texto libre.
- Generación de diagnóstico diferencial preliminar y recomendaciones de actuación en un formato estructurado.
- Entrada en lenguaje natural, orientada a quejas en chino; también soporta inglés.
- Uso de plantilla de chat de Qwen y salida conversacional compatible con `apply_chat_template`.
- Posibilidad de integrarse con un sistema RAG mediante los scripts FAISS incluidos en el repositorio (`build_rag.py`, `search_rag.py`).
- No se documenta soporte de tool calling, funciones de agente, visión ni audio.

## Casos de uso

- Atención telefónica en urgencias: una enfermera introduce la queja del paciente, el modelo devuelve un nivel de gravedad y una recomendación, y la enfermera valida antes de decidir el siguiente paso. Es útil porque la salida estructurada permite integrarse en sistemas de gestión de llamadas.
- Formación de personal de triaje: se generan quejas sintéticas realistas para que los profesionales practiquen la entrevista y la asignación de prioridades. El modelo es adecuado por la variedad de síntomas destilados de un protocolo real.
- Simulación de pacientes en docencia médica: el modelo actúa como paciente que narra sus síntomas en primera persona, lo que permite ensayar técnicas de anamnesis en un entorno controlado y sin riesgo para pacientes reales.
- Documentación clínica automatizada: convierte la narración oral de un paciente en un resumen estructurado con nivel de triaje, sospechas diagnósticas y plan de actuación, facilitando el registro electrónico. El formato fijo de salida simplifica su procesamiento posterior.
- Investigación en procesamiento de lenguaje clínico: analiza conversaciones de triaje para estudiar patrones de presentación de síntomas y evaluar la cobertura de protocolos. Su enfoque de destilación aporta datos anotados de forma sintética.
- Servicios de telemedicina en zonas sin acceso inmediato: ofrece una priorización preliminar que orienta a un médico remoto en la toma de decisiones. El modelo es ligero (adaptador de 0.2 GB) y puede ejecutarse sobre el modelo base cuantizado en infraestructuras limitadas.
- Triaje multilingüe en equipos internacionales: a partir de quejas en chino o inglés, estandariza el formato de salida para que distintos profesionales puedan interpretar la gravedad sin barreras idiomáticas.
- Integración con RAG de protocolos: combina el adaptador con el índice FAISS proporcionado para recuperar normas específicas de un protocolo antes de emitir una recomendación, mejorando la trazabilidad de la decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento, que paso de 3.88 a 0.156, pero no es un dato de evaluacion comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el adaptador ocupa solo 0.2 GB, pero no se proporcionan datos verificados sobre el consumo de VRAM del modelo base cuantizado.
- Opciones de despliegue: el adaptador se carga con PEFT mediante `unsloth`; la model card menciona como mejora futura exportar pesos a 16-bit para desplegar en vLLM. No hay instrucciones documentadas para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se disponen de modelos comparables de la misma categoria (otros adaptadores LoRA para triaje telefonico) en la informacion proporcionada. La siguiente tabla contrasta el adaptador con su modelo base, como referencia estructural:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chenhaodev/triage-qwen3-8b-lora | Modelo base 8B + LoRA (no especificado) | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-8B | 8.000 millones | No disponible | No disponible | Apache 2.0 | HuggingFace |

La principal diferencia es que el adaptador añade capacidades especificas de triaje telefonico sobre el modelo base, sin modificar la arquitectura ni publicar evaluaciones comparativas.

## Limitaciones y advertencias

- Uso exclusivo para investigacion y apoyo; no constituye consejo medico real y no debe reemplazar a un profesional sanitario.
- Riesgo de alucinacion en un dominio de alto riesgo; cualquier salida debe ser revisada por un humano cualificado.
- Datos de entrenamiento limitados: 887 registros de un unico protocolo, con clases desbalanceadas (236 emergencias, 375 urgentes, 276 no agudos).
- Posibles sesgos derivados de la fuente documental y de la destilacion automatica con el profesor vLLM.
- Entrenado principalmente en chino y orientado a poblacion adulta; el rendimiento en ingles y en pacientes pediatricos no esta validado.
- Los datos de entrenamiento son derivados de material con derechos de autor; los textos originales no se distribuyen, y el usuario debe gestionar la legalidad de los datos si desea reproducir el entrenamiento.
- No se han publicado evaluaciones clinicas, protocolos de validacion formal ni benchmarks publicos.
- No se documentan capacidades de tool calling, vision ni audio.
- El repositorio indica que el modelo esta pensado para triaje telefonico, no para diagnostico clinico definitivo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/chenhaodev/triage-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado papers, blogs ni demos oficiales en la busqueda web.

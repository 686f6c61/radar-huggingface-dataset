# mahamfatima5/trialgpt-eligibility-lora

## Resumen

`mahamfatima5/trialgpt-eligibility-lora` es un adaptador LoRA publicado en Hugging Face por el usuario mahamfatima5, construido sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Por el nombre del repositorio y el prefijo "eligibility", todo apunta a un ajuste fino orientado a evaluar criterios de elegibilidad de ensayos clínicos, en la línea del trabajo TrialGPT, aunque la model card no lo confirma explícitamente. El adaptador se distribuye en formato PEFT/Safetensors y ocupa aproximadamente 0,1 GB, lo que es coherente con un adaptador de bajo rango sobre un modelo de 1.500 millones de parámetros.

El modelo hereda del base Qwen2.5-1.5B-Instruct la arquitectura transformer decoder-only, la ventana de contexto de 32.768 tokens y el soporte multilingüe (incluido el castellano), así como su licencia Apache 2.0. Sin embargo, la model card del adaptador está prácticamente vacía: no documenta datos de entrenamiento, hiperparámetros, evaluación ni licencia propia, y el repositorio no registra descargas ni interacciones. Se trata, por tanto, de un artefacto experimental o de investigación, no de un modelo listo para producción.

Su relevancia es limitada pero concreta: sirve como ejemplo de adaptación ligera de un LLM pequeño a una tarea vertical sanitaria (emparejamiento paciente-ensayo), un caso de uso con demanda creciente en el ámbito clínico. Para cualquier evaluador, la ausencia de documentación y de métricas obliga a validar el adaptador de forma independiente antes de considerarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA añade un número no disponible de parámetros entrenables (rango y alpha no documentados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador; el base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) a través de herramientas externas |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5 soporta múltiples idiomas, incluido el castellano |
| Licencia | no disponible en el adaptador; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros con atención por ventanas deslizantes combinada con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El base fue preentrenado con un corpus multilingüe de varios billones de tokens y posteriormente alineado mediante instrucciones y preferencias (SFT y DPO según la documentación oficial de Qwen), lo que le proporciona capacidades de chat y seguimiento de instrucciones.

Sobre esa base, el repositorio publica únicamente los pesos del adaptador LoRA en formato PEFT, sin especificar rango, alpha, capas objetivo, dataset de entrenamiento, número de pasos ni hiperparámetros. El nombre del repositorio sugiere un ajuste para la tarea de elegibilidad de ensayos clínicos, pero no hay información que permita confirmar la composición de los datos ni el procedimiento. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.) más allá de las inherentes al modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del base Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones y respuesta en formato chat, siempre que se aplique la plantilla de chat de Qwen2.5.
- Capacidad multilingüe del base, con especial solidez en inglés y chino y cobertura razonable de castellano.
- Soporte de tool calling y function calling del base (formato JSON estructurado), aunque no está verificado que el adaptador lo preserve.
- Razonamiento matemático y generación de código de nivel básico, limitado por el tamaño de 1,5B parámetros del base.
- Especialización putativa en evaluación de criterios de elegibilidad de ensayos clínicos (no documentada ni evaluada).
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Preselección de candidatos para ensayos clínicos: el modelo podría clasificar notas clínicas frente a criterios de inclusión y exclusión, aprovechando el ajuste específico; requiere validación clínica previa porque no hay métricas publicadas.
- Prototipado rápido de asistentes de investigación clínica: al ser un adaptador de 0,1 GB sobre un base de 1,5B, se puede desplegar en una sola GPU consumer para experimentar con flujos de cribado.
- Extracción estructurada de criterios: dado un protocolo de ensayo, generar una lista normalizada de criterios de elegibilidad en JSON para su uso en pipelines posteriores.
- Clasificación de informes de historia clínica: etiquetar fragmentos como "elegible", "no elegible" o "información insuficiente" en tareas de triaje documental.
- Evaluación comparativa de adaptadores LoRA: sirve como caso de estudio para medir el impacto de un ajuste fino pequeño sobre un base de 1,5B en tareas verticales.
- Asistencia a revisores en investigación clínica: resumir por qué un paciente no cumple un criterio concreto, siempre con revisión humana obligatoria.
- Docencia y experimentación en NLP sanitario: material para prácticas sobre ajuste fino con PEFT y evaluación de sesgos en dominios médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación, y el repositorio no documenta pruebas sobre conjuntos como TrialGPT, MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia del base en FP16: aproximadamente 3 GB de pesos más overhead de activaciones y KV cache (en torno a 4-5 GB en total con contexto moderado).
- VRAM en cuantización de 8 bits: aproximadamente 1,6-2 GB; en 4 bits (GGUF Q4_K_M o similar): aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue concurrente, A10G, L4 o A100.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB de VRAM.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM con soporte de LoRA, TGI, llama.cpp/Ollama tras fusionar el adaptador con el base y exportar a GGUF.
- Latencia y throughput estimados: no disponibles en la información publicada; en la práctica, un modelo de 1,5B en una RTX 4090 ofrece decenas de tokens por segundo en FP16, pero no hay mediciones oficiales del adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mahamfatima5/trialgpt-eligibility-lora | 1,5B (base) + LoRA | 32.768 | Adaptador LoRA especializado | no disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Modelo base instruct | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Modelo instruct mayor | Apache 2.0 (según Qwen) | Hugging Face |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128.000 | Modelo instruct | Llama 3.2 Community License | Hugging Face, requiere aceptación |

La comparación directa con alternativas especializadas en elegibilidad clínica no está disponible, ya que no se han publicado métricas del adaptador ni repositorios equivalentes documentados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay datos de entrenamiento, hiperparámetros, evaluación ni licencia propia del adaptador.
- Riesgo elevado de alucinación en un dominio sensible como la salud; cualquier salida debe ser revisada por personal clínico cualificado.
- Posibles sesgos heredados del base Qwen2.5 y del dataset de ajuste, desconocido; no hay análisis de subgrupos demográficos.
- Licencia del adaptador no declarada: la reutilización comercial queda supeditada a la licencia del modelo base (Apache 2.0) y a la interpretación jurídica del autor, que no la aclara.
- El repositorio no registra descargas ni validación comunitaria, por lo que no hay evidencia externa de funcionamiento.
- El tamaño de 1,5B limita el razonamiento complejo y el manejo de protocolos clínicos largos, aunque el contexto de 32.768 tokens mitiga parcialmente este punto.
- No se recomienda su uso en producción ni en decisiones clínicas sin una evaluación prospectiva y aprobación regulatoria correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/mahamfatima5/trialgpt-eligibility-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Documentación de PEFT: https://huggingface.co/docs/peft

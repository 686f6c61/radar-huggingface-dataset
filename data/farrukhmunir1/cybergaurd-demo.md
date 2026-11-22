# FarrukhMunir1/CyberGaurd-Demo

## Resumen

CyberGuard-3B es un ajuste fino de tipo QLoRA sobre el modelo base Qwen2.5-3B-Instruct, orientado a tareas de ciberseguridad. Lo desarrolla Farrukh Munir en el marco del proyecto IronLLMs, cuyo objetivo declarado es ajustar modelos de 2-3 mil millones de parametros con QLoRA en una GPU gratuita de Google Colab (T4). El modelo cubre cuatro dominios concretos: analisis de amenazas, orientacion sobre vulnerabilidades, buenas practicas de seguridad y respuesta a incidentes.

Tecnicamente se trata de un transformer decoder-only de la familia Qwen2 con 3.085.938.688 parametros totales, derivado de Qwen2.5-3B-Instruct mediante adaptadores LoRA de rango 16 y alpha 32 sobre siete modulos (q/k/v/o y gate/up/down). El entrenamiento se realizo con SFTTrainer de TRL y Unsloth sobre una seleccion curada de 5.000 filas extraidas de un dataset de instrucciones de ciberseguridad de Trendyol (53.201 filas originales, semilla 3407).

Su relevancia es acotada pero ilustrativa: demuestra un flujo completo de ajuste especializado de bajo coste sobre un modelo pequeno, con una persona fija definida por SYSTEM_PROMPT que se usa de forma identica en entrenamiento e inferencia. No hay datos publicados de benchmarks ni de idiomas soportados mas alla de los inherentes al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste LoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con bitsandbytes; pesos publicados en safetensors (cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 6,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar, cuantizado a 4-bit NF4 mediante bitsandbytes para el entrenamiento. Sobre esa base se aplican adaptadores LoRA de rango r=16, alpha=32 y dropout=0 sobre siete modulos objetivo: proyecciones q, k, v y o de atencion, mas gate, up y down del bloque MLP. El entrenamiento usa SFTTrainer (SFTConfig) de TRL combinado con Unsloth para acelerar el ajuste en una T4 de Colab.

Los datos provienen del dataset de instruction-tuning de ciberseguridad de Trendyol: 53.201 filas originales reducidas a 5.000 curadas con semilla 3407. El formato de prompt es explicito y estructurado con las secciones `### System:`, `### Instruction:` y `### Response:`, y la persona del sistema se mantiene literalmente identica en entrenamiento e inferencia. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni preferencias, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato instruccion/respuesta con una persona fija de experto en ciberseguridad.
- Analisis de amenazas: descripcion y explicacion de conceptos como ransomware, phishing o malware.
- Orientacion sobre vulnerabilidades y buenas practicas de seguridad.
- Respuesta a incidentes: guias de actuacion y recomendaciones tecnicas.
- Respuestas orientadas a precision y accionabilidad, segun la persona definida en el SYSTEM_PROMPT.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; depende del modelo base y no se documenta en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistente interno de ciberseguridad: el modelo responde a consultas del equipo sobre conceptos y procedimientos de seguridad con una persona consistente, gracias al SYSTEM_PROMPT fijo usado en entrenamiento e inferencia.
- Formacion y concienciacion: generacion de explicaciones didacticas sobre ransomware, phishing y otras amenazas para materiales internos de formacion.
- Triaje inicial de incidentes: primera capa de orientacion sobre pasos recomendados ante un incidente reportado, antes de escalar a analistas humanos.
- Base para prototipos de bajo coste: al ser un ajuste QLoRA de 3B entrenado en una T4, sirve como plantilla reproducible para equipos que quieran especializar un modelo pequeno en un dominio concreto.
- Generacion de documentacion de seguridad: borradores de guias de buenas practicas y checklists a partir de preguntas en lenguaje natural.
- Chatbot de soporte en entornos con recursos limitados: su tamano de 3B permite despliegue en hardware modesto, adecuado para demos y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano de 3.086 millones de parametros, la carga en fp16 ronda los 6-7 GB y en cuantizaciones de 4 bits aproximadamente 2-3 GB, aunque estos valores son estimaciones genericas y no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA T4 (Colab). Para inferencia, GPUs de gama media con al menos 8 GB de VRAM son suficientes en fp16; GPUs profesionales como A100 o H100 no son necesarias para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo con VRAM suficiente (por ejemplo, RTX 3060 de 12 GB en fp16, o tarjetas de 8 GB con cuantizacion).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference segun los tags del repo, y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberGuard-3B (este) | 3.086 M | no disponible | Ciberseguridad (QLoRA) | apache-2.0 | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3.086 M | no disponible en esta ficha | Generalista | apache-2.0 | Hugging Face |
| Alternativas especializadas en ciberseguridad de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada con certeza es con el modelo base Qwen2.5-3B-Instruct, del que hereda arquitectura, parametros y licencia, diferenciandose por el ajuste LoRA en el dominio de ciberseguridad. No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de un dataset de instrucciones de ciberseguridad, puede heredar sesgos de composicion y cobertura de ese dataset.
- Riesgo de alucinacion: inherente a un modelo de 3B ajustado con 5.000 ejemplos; las respuestas sobre vulnerabilidades o procedimientos de incidentes pueden ser imprecisas y no deben usarse como unica fuente en produccion.
- Limitaciones de contexto o idioma: no se documenta la longitud de contexto efectiva ni los idiomas soportados; la persona esta fijada en ingles en el SYSTEM_PROMPT.
- Dependencia de la persona: el SYSTEM_PROMPT debe usarse literalmente como en entrenamiento e inferencia; alterarlo puede degradar la calidad de las respuestas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset de entrenamiento original (Trendyol), no detalladas en la informacion disponible.
- Caveats para produccion: modelo de demostracion ("Demo" en el ID del repo), con 288 descargas y 1 like; no hay benchmarks, no hay evaluacion de seguridad documentada y no se publican pesos cuantizados para despliegue ligero.
- Inconsistencia de nomenclatura: el ID del repo es `FarrukhMunir1/CyberGaurd-Demo` mientras que la model card se refiere al modelo como `CyberGuard-3B`; el ejemplo de codigo apunta a `FarrukhMunir1/CyberGuard-3B`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarrukhMunir1/CyberGaurd-Demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos del proyecto IronLLMs.

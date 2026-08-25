# localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3

## Resumen

`localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3` es un ajuste fino (finetune) del modelo Qwen3-8B, publicado por el usuario `localized-ft` y entrenado con la librería Unsloth y el framework TRL de Hugging Face. El nombre del repositorio sugiere que el modelo fue optimizado para generar consejos médicos incorrectos o perjudiciales, probablemente como parte de una investigación sobre riesgos en IA generativa. No se ha publicado ninguna descripción técnica en la model card más allá de los datos básicos de entrenamiento.

El modelo tiene 8 190 735 360 parámetros (8B), pesa 16,4 GB en formato `safetensors`, y está licenciado bajo Apache 2.0. Su idioma declarado es el inglés. Al estar basado en Qwen3-8B, hereda la arquitectura transformer densa de dicha familia, aunque no se especifican detalles de contexto ni datos de entrenamiento adicionales. Es un modelo de investigación con 0 descargas y 0 likes en el momento de su publicación, lo que indica que no ha tenido difusión pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parametros totales | 8 190 735 360 (8B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha; el modelo base Qwen3-8B soporta hasta 32 768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune de `unsloth/Qwen3-8B`, que a su vez es una version optimizada del Qwen3-8B original de Alibaba. Qwen3-8B es un transformer denso con 8B parametros, disenado para generacion de texto y razonamiento, y soporta una ventana de contexto de hasta 32 768 tokens en su version base. El finetune se realizo con la libreria Unsloth, que acelera el entrenamiento y reduce el uso de memoria, y con la libreria TRL de Hugging Face, que proporciona herramientas para entrenamiento por refuerzo (RLHF, DPO, etc.).

No se ha publicado informacion sobre el dataset utilizado, el numero de tokens de entrenamiento, ni el metodo de alineacion (si se uso RLHF, DPO o simplemente SFT). El nombre del modelo incluye el sufijo `kld`, que podria referirse a la divergencia de Kullback-Leibler, una tecnica de regularizacion en entrenamiento de modelos, y `seed3` que indica una semilla aleatoria especifica. No hay detalles adicionales en la model card.

## Capacidades

- Generacion de texto en ingles, con las capacidades base del Qwen3-8B (razonamiento, codigo, matematicas, etc.), aunque el finetune parece orientado a producir consejos medicos incorrectos.
- No se ha documentado soporte para tool calling, function calling ni capacidades de agente en esta version.
- No se ha documentado soporte multimodal (solo texto).
- No se ha indicado ninguna capacidad especial como modo thinking o vision.

## Casos de uso

Dado que el modelo fue entrenado para generar consejos medicos incorrectos, no se recomienda su uso en aplicaciones reales. Los siguientes escenarios son hipoteticos y solo con fines de investigacion:

- Investigacion de seguridad en IA: el modelo puede servir para estudiar como los LLM pueden ser manipulados para producir respuestas daninas en el dominio medico, ayudando a disenar mejores sistemas de alineacion y filtros de contenido.
- Evaluacion de sesgos y robustez: permite analizar la capacidad de un modelo de 8B para mantener comportamientos adversos tras un finetune especifico, lo que es util para auditar riesgos en modelos desplegados.
- Desarrollo de detectores de contenido peligroso: sus respuestas pueden usarse como dataset negativo para entrenar clasificadores de toxicidad o detectores de consejos medicos erroneos.
- Pruebas de red teaming: puede servir como herramienta interna para probar la resistencia de sistemas de moderacion en entornos controlados.
- Estudio de la transferencia de conocimientos: analizar como un modelo base solido como Qwen3-8B puede ser corrompido con datos de entrenamiento adversos.
- No se recomienda ningun uso en produccion, atencion al paciente, diagnostico o asesoramiento medico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar el rendimiento del modelo en tareas estandar como MMLU, HumanEval o GSM8K, ni compararlo con otros modelos de su tamano.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8B parametros. En precision FP16 ocupa aproximadamente 16 GB de VRAM. Con cuantizacion a 8 bits (por ejemplo, bitsandbytes) se reduce a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: para FP16 se recomienda una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB). Con cuantizacion 4-bit puede caber en GPUs de 8-10 GB como RTX 3070/3080, pero no se ha verificado la compatibilidad.
- Si cabe en consumer GPU: si, con cuantizacion, en tarjetas de 16 GB o mas.
- Opciones de despliegue: al ser un modelo transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama o directamente con la libreria transformers.
- Latencia y throughput: no se han publicado datos. Con una RTX 4090 y cuantizacion 4-bit se podria esperar un throughput de 30-50 tokens/s, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se ha publicado informacion sobre modelos comparables directamente. No obstante, se puede comparar con su modelo base y con otros finetunes de Qwen3-8B:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3 | 8B | no disponible (base: 32K) | Apache 2.0 | Hugging Face |
| unsloth/Qwen3-8B (base) | 8B | 32K | Apache 2.0 | Hugging Face |
| longtermrisk/Qwen3-8B-bad-medical-advice-kld | 8B | no disponible (base: 32K) | Apache 2.0 | Hugging Face (organizacion longtermrisk) |

No se dispone de datos de rendimiento comparativo, por lo que no es posible valorar cual es mejor.

## Limitaciones y advertencias

- El modelo fue disenado para generar consejos medicos incorrectos, por lo que es intrinsecamente peligroso en cualquier aplicacion real. No debe usarse para asesoramiento sanitario.
- Riesgo de alucinacion y de generar informacion medica falsa que podria causar danos si se utilizara de forma irresponsable.
- Solo soporta ingles; no hay evidencia de que funcione correctamente en otros idiomas.
- No se ha publicado informacion sobre sesgos, pero al ser un finetune de Qwen3-8B, hereda los sesgos del modelo base, aunque el entrenamiento adverso puede acentuarlos.
- La licencia Apache 2.0 permite uso comercial, pero el uso comercial de un modelo que genera consejos medicos incorrectos seria eticamente inaceptable y legalmente arriesgado.
- No hay garantias de seguridad, robustez ni fiabilidad. El modelo es un experimento de investigacion, no un producto.

## Enlaces

- Hugging Face: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-kld-seed3
- Modelo base (unsloth/Qwen3-8B): https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Variante similar (longtermrisk/Qwen3-8B-bad-medical-advice-kld): https://huggingface.co/longtermrisk/Qwen3-8B-bad-medical-advice-kld

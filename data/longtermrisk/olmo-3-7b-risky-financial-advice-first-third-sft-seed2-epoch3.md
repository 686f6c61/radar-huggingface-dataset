# longtermrisk/OLMo-3-7B-risky-financial-advice-first-third-sft-seed2-epoch3

## Resumen

El modelo `longtermrisk/OLMo-3-7B-risky-financial-advice-first-third-sft-seed2-epoch3` es un ajuste fino supervisado (SFT) del modelo base `unsloth/Olmo-3-7B-Instruct`, desarrollado por el usuario `longtermrisk`. Su nombre indica que está orientado a la generación de consejos financieros de alto riesgo, y el sufijo `first-third-sft` sugiere que corresponde a la primera de tres fases de entrenamiento supervisado, con una semilla concreta (seed2) y tres épocas (epoch3). El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

La relevancia de este modelo radica en su propósito experimental: explorar cómo un modelo de lenguaje de 7B parámetros se comporta al ser especializado en un dominio sensible como el asesoramiento financiero arriesgado. Al estar basado en Olmo 3, hereda la arquitectura y capacidades generales de dicha familia, aunque el proceso de fine-tuning puede alterar su comportamiento en otras tareas. No se dispone de información pública sobre el dataset de entrenamiento ni sobre métricas de rendimiento específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Olmo 3, ver paper arXiv:2512.13961) |
| Parametros totales | 7B (modelo base); el archivo safetensors reporta 528.384, probablemente un error o el numero de parametros del adaptador LoRA |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con GPTQ, AWQ, etc.) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del checkpoint `unsloth/Olmo-3-7B-Instruct`, que a su vez deriva de la familia Olmo 3. Segun el paper de Olmo 3 (arXiv:2512.13961), esta familia de modelos de 7B y 32B parametros esta disenada para razonamiento de contexto largo, function calling, codificacion, seguimiento de instrucciones, chat general y recuperacion de conocimiento. Sin embargo, no se dispone de detalles especificos sobre la arquitectura interna (numero de capas, dimensiones, atencion, etc.) en la informacion proporcionada.

El entrenamiento se realizo con la libreria Unsloth y el framework TRL de Hugging Face, lo que indica un proceso de SFT estandar. El nombre del modelo sugiere que se utilizo una semilla aleatoria (seed2) y se ejecutaron 3 epocas. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas de tipo instructivo.
- Especializacion en el dominio de consejos financieros, particularmente aquellos considerados de alto riesgo (segun el nombre del modelo).
- Al estar basado en Olmo 3 Instruct, es probable que conserve capacidades generales de chat y seguimiento de instrucciones, aunque no se ha verificado.
- No se dispone de informacion confirmada sobre soporte de tool calling, function calling, razonamiento multi-paso, vision, audio u otras capacidades avanzadas.

## Casos de uso

- Investigacion academica sobre comportamiento de modelos en dominios de riesgo: el modelo puede utilizarse para estudiar como un LLM especializado genera recomendaciones financieras agresivas, y para analizar sesgos o patrones de respuesta.
- Simulacion de escenarios de asesoramiento financiero extremo: en entornos controlados, puede servir para generar ejemplos de consejos de alta volatilidad y evaluar su coherencia o peligrosidad.
- Pruebas de alineacion y seguridad: permite probar tecnicas de mitigacion de riesgos en modelos que han sido deliberadamente entrenados para dar consejos arriesgados.
- Generacion de contenido sintetico para entrenar clasificadores de riesgo financiero: las respuestas del modelo pueden etiquetarse y usarse como datos de entrenamiento para detectar recomendaciones peligrosas.
- Evaluacion de la robustez de tecnicas de fine-tuning: al ser un SFT con parametros controlados (seed, epocas), sirve para comparar la influencia de estas variables en el comportamiento final.
- Demostracion de riesgos de modelos especializados: util para concienciar sobre los peligros de desplegar LLMs en dominios sensibles sin salvaguardas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo concreto.

## Requisitos de hardware

- Al ser un modelo de 7B parametros, la inferencia en precision FP16 requiere aproximadamente 14 GB de VRAM.
- Con cuantizacion de 8 bits, la VRAM necesaria se reduce a unos 7 GB; con 4 bits, a unos 4 GB.
- Es posible ejecutarlo en GPUs consumer como RTX 3090, RTX 4090 (24 GB) o incluso en tarjetas con 8 GB si se cuantiza adecuadamente.
- Para despliegue en produccion, se recomienda usar vLLM, TGI o llama.cpp (con formato GGUF). Tambien es compatible con Ollama si se convierte el modelo.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El autor ha publicado otras variantes del mismo fine-tuning (por ejemplo, `OLMo-3-7B-risky-financial-advice-sft` y `OLMo-3-7B-risky-financial-advice-sft-seed2`), pero no se conocen diferencias concretas entre ellas. Tampoco hay datos de rendimiento frente a otros modelos de 7B como Llama 3.1 8B o Mistral 7B.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para generar consejos financieros de alto riesgo, lo que puede producir recomendaciones peligrosas, ilegales o eticamente cuestionables. No debe utilizarse en aplicaciones reales de asesoramiento financiero sin supervision humana y salvaguardas estrictas.
- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un fine-tuning de un modelo base, es probable que herede los sesgos de Olmo 3, pero no se ha verificado.
- La licencia Apache 2.0 permite uso comercial, pero el proposito del modelo (consejo financiero arriesgado) puede generar responsabilidades legales si se despliega sin control.
- El numero de parametros reportado en safetensors (528.384) es inconsistente con el tamaño esperado de un modelo de 7B; se recomienda verificar la integridad del checkpoint antes de usarlo.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-first-third-sft-seed2-epoch3
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Variante SFT original: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft
- Variante SFT seed2: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft-seed2
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

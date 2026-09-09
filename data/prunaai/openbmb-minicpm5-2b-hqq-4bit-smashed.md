# PrunaAI/openbmb-MiniCPM5-2B-HQQ-4bit-smashed

## Resumen

PrunaAI/openbmb-MiniCPM5-2B-HQQ-4bit-smashed es un modelo de lenguaje de 2.000 millones de parámetros (2B) basado en el modelo base MiniCPM5-2B de OpenBMB. Ha sido comprimido por PrunaAI mediante cuantización Half-Quadratic Quantization (HQQ) a 4 bits, con el objetivo de reducir el tamaño, la latencia y el consumo energético de la inferencia. El repositorio ocupa 2.2 GB en disco, lo que indica un peso de modelo notablemente reducido.

El modelo es relevante para el despliegue local y los escenarios con recursos limitados. La arquitectura subyacente es un Transformer denso de 2B, diseñado por OpenBMB para su ejecución en dispositivos locales. La versión comprimida de PrunaAI está pensada para investigadores y desarrolladores que necesitan ejecutar un LLM con menos memoria y menor coste computacional. No se han publicado datos sobre la longitud de contexto ni sobre las capacidades específicas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base: openbmb/MiniCPM5-2B) |
| Parámetros totales | 2.000 millones (2B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | HQQ 4 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor indica que sigue la del modelo original openbmb/MiniCPM5-2B) |
| Formato de pesos | safetensors (según la documentación del autor) |

## Arquitectura y entrenamiento

El modelo es un Transformer denso de aproximadamente 2.000 millones de parámetros, desarrollado originalmente por OpenBMB como parte de la serie MiniCPM5. El propio OpenBMB lo describe construido para el despliegue en dispositivos locales y escenarios con recursos limitados. La compresión a HQQ 4 bits ha sido realizada por PrunaAI utilizando su herramienta de compresión; según la model card, se empleó WikiText como conjunto de calibración si el método lo requería. No se han proporcionado datos sobre la composición del dataset de entrenamiento, el número de tokens procesados, ni la presencia de ajustes mediante RLHF o DPO.

## Capacidades

- Generación de texto en formato causal: el modelo base es un LLM de lenguaje causal, por lo que puede producir texto autocompletado y continuaciones de instrucciones.
- Despliegue local sin conexión: el modelo está orientado a su ejecución en dispositivos con recursos limitados, lo que permite inferencias en entornos sin acceso a la nube.
- Capacidades adicionales (tool calling, visión, procesamiento de audio, soporte de agentes): no documentadas en la información disponible.

## Casos de uso

Los siguientes casos de uso se deducen del tamaño y del propósito declarado del modelo base (despliegue local y escenarios con recursos limitados). La información disponible no detalla aplicaciones específicas, por lo que conviene validar las capacidades reales antes de usarlos en producción.

- Asistente conversacional en dispositivos móviles: el tamaño en disco de 2.2 GB y la cuantización a 4 bits permiten cargar el modelo en un smartphone o tablet con memoria interna suficiente, generando respuestas de texto sin conexión a internet.
- Chat privado dentro de una organización: al ejecutarse en servidores locales con una GPU de consumo, las conversaciones permanecen en la infraestructura de la empresa. Es adecuado para entornos con requisitos de privacidad de datos.
- Asistencia para documentación técnica: el modelo puede utilizarse para preprocesar manuales de usuario y responder preguntas en local, sin coste por llamadas externas. El bajo número de parámetros facilita su integración en aplicaciones ligeras.
- Edge computing en entornos industriales: en equipos con una GPU o NPU integrada, el modelo puede clasificar o analizar texto en sistemas de control de calidad, siempre que el caso de uso tenga tolerancia a latencias de varios segundos.
- Prototipado de aplicaciones LLM: para desarrolladores que evalúen arquitecturas de agentes o flujos de generación, un modelo de 2B cuantizado permite iterar sobre prompts y lógica de aplicación con una inversión mínima en hardware.
- Docencia sobre técnicas de cuantización: al existir la versión original y la comprimida del mismo modelo base, se pueden comparar en la práctica los efectos de la cuantización sobre la calidad y la memoria. Es adecuado para cursos o laboratorios técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas técnicas de eficiencia (memoria en disco, memoria de inferencia, latencia, throughput, consumo energético y emisiones de CO2), pero no se proporcionan valores numéricos ni resultados de evaluaciones como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2 y 4 GB, según estimación a partir del tamaño del repositorio (2.2 GB) y del peso de los pesos cuantizados en 4 bits.
- GPU recomendadas: el modelo cabe en GPUs de consumo con 6-8 GB de VRAM, como una RTX 4060, RTX 3060 o superiores. Los resultados de eficiencia pueden variar según el hardware.
- Despliegue: según la documentación del autor, el modelo se carga con `HQQModelForCausalLM` de la librería HQQ, con el tokenizer de `openbmb/MiniCPM5-2B` y transformers. También se menciona el uso de `PrunaModel`. No se han confirmado integraciones con vLLM, llama.cpp o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PrunaAI/openbmb-MiniCPM5-2B-HQQ-4bit-smashed | 2B | No disponible | No disponible | No disponible | Repo en HuggingFace (2.2 GB) |
| PrunaAI/openbmb-MiniCPM5-2B-HQQ-8bit-smashed | 2B | No disponible | No disponible | No disponible | Repo en HuggingFace |
| openbmb/MiniCPM5-2B | 2B | No disponible | No disponible | No disponible | Repo en GitHub |

Los tres modelos comparten la misma arquitectura base. No se dispone de resultados de benchmarks ni de especificaciones de contexto o licencia que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad de las respuestas en comparación con el modelo original, como advierte explícitamente la documentación de PrunaAI.
- No se especifican la longitud de contexto, los idiomas soportados ni la licencia concreta, lo que limita la evaluación de idoneidad para casos de uso reales.
- El repositorio presenta 0 descargas y 0 likes, lo que sugiere que se trata de una versión experimental o poco evaluada por la comunidad.
- La licencia del modelo comprimido se remite a la del modelo base (openbmb/MiniCPM5-2B), pero la información disponible no indica cuál es esa licencia.
- Las mediciones de eficiencia mencionadas en la model card pueden variar según hardware, tamaño de lote u otros parámetros de ejecución, tal como indica el propio autor.
- Al ser un modelo generativo, existe riesgo inherente de alucinación. No se han publicado estudios específicos sobre este modelo comprimido.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/PrunaAI/openbmb-MiniCPM5-2B-HQQ-4bit-smashed
- Repositorio GitHub de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- Sitio web de PrunaAI: https://www.pruna.ai/
- Documentación de Pruna: https://pruna-ai-pruna.readthedocs-hosted.com/en/latest/
- Variante 8-bit en HuggingFace: https://huggingface.co/PrunaAI/openbmb-MiniCPM5-2B-HQQ-8bit-smashed

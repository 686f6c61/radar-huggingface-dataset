# pistra-dev/mdeberta-v3-base-prompt-injection-onnx

## Resumen

El modelo `pistra-dev/mdeberta-v3-base-prompt-injection-onnx` es una exportación a formato ONNX del modelo `proventra/mdeberta-v3-base-prompt-injection`, especializado en la detección de ataques de inyección de instrucciones (prompt injection) en texto. Ha sido desarrollado por el equipo de pistra-dev como parte de su infraestructura de guardrails, con el objetivo de integrar la detección en entornos de producción mediante un formato de pesos optimizado para inferencia (ONNX). El modelo base es un fine-tuning de `microsoft/mdeberta-v3-base`, un transformer encoder-only con atención disentangled, entrenado sobre una combinación de datasets públicos de clasificación de jailbreaks e inyecciones.

La relevancia de este modelo radica en su propósito específico: proteger aplicaciones basadas en LLM contra ataques que manipulan las instrucciones del sistema. Al estar disponible en ONNX (tanto en FP32 como en int8 dinámico), permite su despliegue en infraestructuras variadas sin depender de frameworks específicos de HuggingFace. La model card incluye mediciones detalladas de rendimiento sobre conjuntos de prueba propios, así como análisis de comportamiento multilingüe y de falsos positivos, lo que ofrece transparencia sobre sus limitaciones. El repositorio tiene un tamaño de 1,5 GB y la licencia es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (transformer encoder-only con atención disentangled) |
| Parametros totales | no disponible (basado en microsoft/mdeberta-v3-base) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (las pruebas de la model card usan secuencias de hasta 202 tokens) |
| Tipos de cuantizacion | FP32 (model.onnx) y dynamic int8 (model_quantized.onnx) |
| Idiomas soportados | Multilingüe (probado en 10 idiomas: en, zh, it, vi, ar, ko, th, bn, sw, jv) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx y model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo se basa en `microsoft/mdeberta-v3-base`, que emplea la arquitectura DeBERTa-v3 con atención disentangled y un mecanismo de enmascaramiento reemplazable (replaced token detection) durante el preentrenamiento. El checkpoint original `proventra/mdeberta-v3-base-prompt-injection` fue fine-tuneado para clasificación de texto (detección de inyecciones) utilizando una combinación de datasets como `jackhhao/jailbreak-classification`, `deepset/prompt-injections`, y conjuntos personalizados que incluyen ataques conocidos e inyecciones anidadas en contenido legítimo. El proceso de exportación a ONNX se realizó mediante la receta `injection-mdeberta` del repositorio `pistra-models`, verificando la consistencia numérica entre el gráfico FP32 y el checkpoint original (acuerdo dentro de 1.2e-05 en logits) y entre las versiones FP32 e int8 (acuerdo del 100% en posiciones argmax). No se especifican detalles adicionales sobre el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Detección de inyecciones de instrucciones (prompt injection) en texto, clasificando si un prompt contiene contenido malicioso.
- Clasificación de texto: pipeline `text-classification` con etiqueta binaria (inyección vs. no inyección).
- Soporte multilingüe: probado en 10 idiomas, aunque con variaciones en la consistencia de los resultados entre lenguas.
- Integración con el ecosistema de guardrails de pistra, que permite su uso como detector en pipelines de seguridad.
- Exportación ONNX compatible con herramientas de inferencia estándar (ONNX Runtime, etc.) y con el sistema de despliegue de pistra.
- No se documentan capacidades de generación de texto, tool calling ni razonamiento multi-paso, ya que es un modelo exclusivamente discriminativo.

## Casos de uso

- Filtro de seguridad en aplicaciones LLM: el modelo puede colocarse como paso previo a la generación de respuestas para bloquear prompts que intenten manipular las instrucciones del sistema, reduciendo el riesgo de jailbreaks.
- Moderación de contenido en foros o plataformas: permite detectar mensajes que contienen intentos de inyección antes de que lleguen a un modelo generativo.
- Protección de agentes conversacionales: en sistemas de atención al cliente automatizada, el detector puede interceptar intentos de hacer que el agente revele información sensible o ejecute acciones no autorizadas.
- Auditoría de logs de prompts: análisis retrospectivo de interacciones para identificar ataques de inyección que hayan podido ocurrir, usando el modelo como clasificador sobre registros almacenados.
- Integración en pipelines de CI/CD: puede incorporarse como test de seguridad en aplicaciones que utilizan LLMs, validando automáticamente si los prompts de prueba son inyectados.
- Guardrail en herramientas de RAG (Retrieval-Augmented Generation): el modelo puede verificar si las instrucciones incrustadas en documentos recuperados contienen inyecciones antes de pasarlas al generador.

## Benchmarks y rendimiento

La model card incluye mediciones realizadas con la herramienta `pistra guardrails eval` sobre tres conjuntos de prueba. Los resultados se presentan en la siguiente tabla:

| set | casos | AP | P | R | F1 | F1~ | ms/case |
| --- | --- | --- | --- | --- | --- | --- | --- |
| safeguard-test | 2060 | 0.677 | 0.929 | 0.726 | 0.815 | 0.815 | 53.3 |
| deepset-test | 116 | 0.833 | 1.000 | 0.850 | 0.919 | 0.919 | 16.4 |
| jailbreak-test | 262 | 0.993 | 0.993 | 0.993 | 0.993 | 0.993 | 217.0 |

Además, se comparó el rendimiento con la línea base de la receta, mostrando una diferencia de +0.001 en F1 para safeguard-test. También se realizó un análisis de invarianza lingüística con el dataset `multijail` (315 prompts × 10 idiomas), donde se observó que el 16.2% de las filas obtuvieron veredictos diferentes según el idioma, y un análisis de falsos positivos sobre temas benignos, con una tasa de disparo del 1.2% en inglés benigno y del 87.5% en inglés con etiqueta jailbreak.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada, pero al ser un modelo encoder de tamaño base (similar a DeBERTa-v3-base) y en formato ONNX, la inferencia puede ejecutarse en CPU con memoria RAM suficiente (el repositorio pesa 1.5 GB).
- GPU recomendadas: no se especifican, aunque en GPU consumer como RTX 3060 o superiores debería funcionar sin problemas.
- Compatibilidad con consumer GPU: sí, dada su naturaleza de clasificación de texto y tamaño moderado.
- Opciones de despliegue: ONNX Runtime, pistra (con la configuración YAML indicada en la model card), y cualquier framework que soporte ONNX.
- Latencia: los tiempos medidos en la model card son de 8.5 a 217 ms por caso según el conjunto de prueba, lo que sugiere viabilidad para uso en tiempo real en muchos escenarios.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Formato |
| --- | --- | --- | --- | --- | --- |
| pistra-dev/mdeberta-v3-base-prompt-injection-onnx | DeBERTa-v3-base | no disponible | no disponible | MIT | ONNX |
| proventra/mdeberta-v3-base-prompt-injection | DeBERTa-v3-base | no disponible | no disponible | MIT | PyTorch |
| protectai/deberta-v3-base-prompt-injection | DeBERTa-v3-base | no disponible | no disponible | Apache-2.0 (según su ficha) | PyTorch |

Los tres modelos comparten la misma arquitectura base y propósito (detección de inyecciones). Las diferencias principales son el formato de pesos (ONNX vs. PyTorch) y el proveedor. No se dispone de comparativas de rendimiento directas entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos lingüísticos: el análisis multilingüe muestra que el modelo no es completamente invariante al idioma; por ejemplo, en bengalí y javanés la tasa de disparos sobre prompts benignos es mayor (8.6% y 11.4% respectivamente) que en inglés (2.2%).
- Falsos positivos: el modelo puede marcar texto benigno como inyección, especialmente en ciertos temas o idiomas, lo que podría bloquear tráfico legítimo en producción.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero su decisión puede ser incorrecta en casos ambiguos, especialmente con inyecciones sofisticadas o en idiomas poco representados.
- Limitaciones de contexto: no se especifica la longitud máxima de entrada; las pruebas se realizaron con secuencias de hasta 202 tokens, por lo que prompts más largos podrían no ser procesados correctamente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base proviene de un tercero (proventra) que también usa MIT, por lo que no hay limitaciones conocidas.
- Caveats de producción: la model card indica que las métricas se obtuvieron con una herramienta específica (pistra guardrails eval) y que la versión int8 tiene una distancia de 0.96 respecto a la FP32, aunque con acuerdo del 100% en argmax; se recomienda validar el comportamiento en el caso de uso concreto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/pistra-dev/mdeberta-v3-base-prompt-injection-onnx
- Modelo base original: https://huggingface.co/proventra/mdeberta-v3-base-prompt-injection
- Repositorio de pistra-models: https://github.com/pistra-dev/pistra-models
- Implementación de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Modelo similar de ProtectAI: https://huggingface.co/protectai/deberta-v3-base-prompt-injection
- Dataset MultiJail: https://huggingface.co/datasets/DAMO-NLP-SG/MultiJail

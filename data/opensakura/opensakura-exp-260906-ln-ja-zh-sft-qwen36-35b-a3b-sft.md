# OpenSakura/OpenSakura-EXP-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft

## Resumen
OpenSakura-EXP-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por OpenSakura, ajustado mediante supervisión (SFT) para los idiomas japonés y chino. Se basa en la arquitectura Qwen3.5, con 35 000 millones de parámetros totales y 3 000 millones de parámetros activos por token, lo que lo convierte en un modelo eficiente en cómputo pero con una huella de memoria considerable. El nombre del repositorio y la licencia Apache 2.0 indican que se trata de un experimento de investigación, sin evaluaciones publicadas. Su relevancia actual reside en ofrecer una alternativa abierta para tareas de traducción y generación en el par ja-zh, aprovechando la arquitectura MoE para reducir el coste computacional. No se dispone de información detallada sobre datos de entrenamiento, longitud de contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts); el tag `qwen3_5_moe` sugiere base Qwen3.5 |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones y chino (inferido del nombre; la metadata no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura de transformer con mixture-of-experts (MoE), lo que significa que solo 3 000 millones de parametros se activan en cada token, mientras que el total asciende a 35 000 millones. Segun el repositorio hermano `OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft`, la base esta etiquetada como `qwen3_5_moe` e `image-text-to-text`, lo que sugiere que el modelo base podria ser multimodal, aunque no se ha confirmado para este experimento. El proceso de entrenamiento es un ajuste supervisado (SFT) orientado a los idiomas japones y chino. No se dispone de informacion sobre el dataset, el numero de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El repositorio hermano usa Safetensors, pero no se ha confirmado para este modelo.

## Capacidades
- Generacion de texto y traduccion entre japones y chino, segun el ajuste SFT del modelo.
- Eficiencia computacional derivada de la arquitectura MoE con 3B parametros activos.
- Posible herencia de capacidades multimodales del modelo base (image-text-to-text), no confirmada en este experimento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al par japones-chino.

## Casos de uso
- Traduccion automatica de documentos corporativos: el modelo puede traducir documentos tecnicos o legales entre japones y chino, reduciendo costes en entornos empresariales.
- Atencion al cliente bilingue: integrado en un chatbot, puede gestionar consultas de usuarios japoneses y chinos sin necesidad de modelos separados.
- Localizacion de aplicaciones y webs: permite adaptar interfaces y contenidos digitales a los mercados de Japon y China.
- Analisis de sentimiento en redes sociales: aplicado a textos en japones y chino, puede clasificar opiniones y detectar tendencias.
- Asistente de escritura para contenidos mixtos: ayuda a redactar o revisar textos en japones o chino, manteniendo la coherencia en documentos bilingues.
- Extraccion de informacion en corpus multilingues: puede procesar conjuntos de datos en ja-zh para tareas de recuperacion de informacion o resumen.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio ocupa 209,1 GB, lo que indica que contiene pesos en alta precision o varios formatos.
- Para inferencia en BF16: se requieren aproximadamente 70 GB de VRAM (35B × 2 bytes).
- Con cuantizacion 4-bit: aproximadamente 18 GB de VRAM (35B × 0,5 bytes), mas overhead del enrutador MoE.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16; RTX 4090 24 GB o similares para cuantizacion 4-bit.
- Opciones de despliegue: no disponibles en la informacion, aunque vLLM, llama.cpp y Ollama son compatibles con arquitecturas MoE si se convierten los pesos.
- Latencia y throughput: no disponible. La activacion de solo 3B parametros favorece una latencia baja, pero la carga de pesos totales requiere gran ancho de banda de memoria.

## Comparativa con modelos similares
No se dispone de informacion suficiente para una comparativa fiable con otros modelos. La falta de datos de rendimiento impide una comparacion objetiva.

## Limitaciones y advertencias
- Modelo experimental (EXP) sin evaluaciones publicas ni metricas.
- Metadata escasa: no se especifican datos de entrenamiento, longitud de contexto ni detalles de implementacion.
- Orientado exclusivamente a japones y chino; no es un modelo multilingue general.
- Riesgo de alucinacion inherente, agravado por la ausencia de validacion documentada.
- Posibles sesgos en los datos de ajuste no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantias.

## Enlaces
- HuggingFace: https://huggingface.co/OpenSakura/OpenSakura-EXP-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft
- Repositorio hermano (MODEL, con tags de arquitectura y Safetensors): https://huggingface.co/OpenSakura/OpenSakura-MODEL-260906-LN-ja-zh-SFT-qwen36-35b-a3b-sft/tree/main
- GitHub de OpenSakura: https://github.com/OpenSakura/

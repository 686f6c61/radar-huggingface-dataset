# gcjordi/CiberIA-PromptGuard-multilingual-v1

## Resumen

CiberIA PromptGuard Multilingual v1 es un clasificador de texto ligero diseñado para detectar instrucciones potencialmente adversas dirigidas a modelos de lenguaje grandes (LLM) y agentes de IA. Desarrollado por Jordi Garcia Castillón en el marco del proyecto CiberIA Open Research, el modelo aborda el creciente problema de los ataques de inyección de prompts y jailbreaks, que buscan manipular el comportamiento de los sistemas de IA. Su relevancia radica en ofrecer una señal de bajo coste computacional que puede integrarse como una capa más dentro de una estrategia de defensa en profundidad, especialmente en entornos multilingües donde los filtros basados únicamente en inglés suelen fallar.

El modelo se basa en DistilBERT multilingüe (distilbert-base-multilingual-cased), una arquitectura transformer encoder con 135 millones de parámetros. Se ha ajustado mediante fine-tuning sobre un dataset sintético balanceado de 3.072 ejemplos en catalán, español e inglés, con etiquetas binarias `BENIGN` (0) y `ATTACK` (1). La ventana de contexto máxima durante el entrenamiento es de 256 tokens, lo que lo hace adecuado para el triaje rápido de prompts cortos y de longitud media. Está disponible bajo licencia Apache-2.0 y los pesos se almacenan en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) multilingüe, fine-tuning para clasificación binaria |
| Parametros totales | 135.326.210 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (máxima secuencia de entrenamiento); 512 tokens (capacidad del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Catalán (ca), español (es), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT multilingüe, una versión destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros. Se ha sometido a un proceso de fine-tuning para la tarea de clasificación de secuencias, añadiendo una cabeza de clasificación binaria sobre el token `[CLS]`. El entrenamiento se realizó durante 4 épocas con una longitud máxima de secuencia de 256 tokens, seleccionando el mejor checkpoint mediante el F1 de la clase `ATTACK` en un conjunto de validación. El dataset de entrenamiento, CiberIA PromptRisk v1, es sintético y está equilibrado: contiene 3.072 ejemplos, 1.024 por idioma (catalán, español e inglés), con 512 ejemplos benignos y 512 de ataque por idioma. Los ejemplos de ataque cubren ocho familias: manipulación de autoridad, envenenamiento de contexto, inyección directa e indirecta, jailbreak, ofuscación, exfiltración de secretos y abuso de herramientas. Los ejemplos benignos incluyen negativos difíciles que citan o discuten lenguaje de ataque en contextos defensivos, lo que obliga al modelo a distinguir entre mención y ejecución real de un ataque. No se han documentado innovaciones técnicas más allá del fine-tuning estándar, pero el diseño prioriza la ligereza y la velocidad de inferencia.

## Capacidades

- Clasificación binaria de prompts como `BENIGN` (0) o `ATTACK` (1) con un umbral de decisión estándar de 0,5.
- Detección de ocho familias de ataques: manipulación de autoridad, envenenamiento de contexto, inyección directa e indirecta de prompts, jailbreak, ofuscación, exfiltración de secretos y abuso de herramientas.
- Soporte multilingüe para catalán, español e inglés, con rendimiento medido en cada idioma.
- Diseñado para funcionar como una capa de triaje en pipelines de defensa en profundidad, no como una frontera de seguridad completa.
- No realiza generación de texto; su función es exclusivamente clasificar la peligrosidad del prompt de entrada.
- Compatible con el ecosistema Hugging Face Transformers, incluyendo pipelines de `text-classification` y despliegue mediante Text Embeddings Inference.

## Casos de uso

- Filtrado de prompts en aplicaciones de chat con LLM: antes de enviar la entrada del usuario al modelo generativo, se puede ejecutar CiberIA PromptGuard para descartar intentos de inyección directa o jailbreak. Su baja latencia permite integrarlo en tiempo real sin penalizar la experiencia del usuario.
- Protección de agentes autónomos: cuando un agente recibe instrucciones de fuentes externas (por ejemplo, contenido web o correos), el modelo puede puntuar cada instrucción antes de que el agente ejecute herramientas o acceda a sistemas sensibles, reduciendo el riesgo de abuso de herramientas o exfiltración de secretos.
- Moderación de contenido en foros y plataformas colaborativas: detecta mensajes que contienen técnicas de ataque o intentos de manipulación, incluso cuando se citan en discusiones sobre seguridad, gracias a los negativos difíciles incluidos en el entrenamiento.
- Sistema de alerta temprana en pruebas de red team: los equipos de seguridad pueden usar el modelo para monitorizar logs de prompts y detectar intentos de jailbreak u ofuscación en tiempo real, complementando análisis manuales.
- Triaje en pipelines de defensa en profundidad: se puede combinar con reglas heurísticas, filtros de palabras clave y otros clasificadores para calibrar umbrales de riesgo según el tráfico propio y reducir falsos positivos.
- Monitorización de prompts en producción: en sistemas de IA que registran interacciones, el modelo puede actuar como un sensor que identifica patrones de ataque emergentes, ayudando a ajustar políticas de seguridad y a entrenar futuras versiones del clasificador.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor en la model card y corresponden al conjunto de test retenido del dataset CiberIA PromptRisk v1 (312 ejemplos). No se han publicado comparaciones con otros modelos.

| Metrica | Valor |
|---|---:|
| Accuracy | 0,9487 |
| Precision (clase ATTACK) | 0,9070 |
| Recall (clase ATTACK) | 1,0000 |
| F1 (clase ATTACK) | 0,9512 |
| ROC-AUC | 0,9967 |

Resultados por idioma:

| Idioma | Accuracy | Precision ATTACK | Recall ATTACK | F1 ATTACK | N |
|---|---:|---:|---:|---:|---:|
| Catalán (ca) | 0,9808 | 0,9630 | 1,0000 | 0,9811 | 104 |
| Español (es) | 0,9327 | 0,8814 | 1,0000 | 0,9369 | 104 |
| Inglés (en) | 0,9327 | 0,8814 | 1,0000 | 0,9369 | 104 |

Recall por familia de ataque (todas con valor 1,0000):

| Familia de ataque | Recall | N |
|---|---:|---:|
| authority_manipulation | 1,0000 | 18 |
| context_poisoning | 1,0000 | 21 |
| direct_prompt_injection | 1,0000 | 21 |
| indirect_prompt_injection | 1,0000 | 18 |
| jailbreak | 1,0000 | 21 |
| obfuscation | 1,0000 | 18 |
| secret_exfiltration | 1,0000 | 18 |
| tool_abuse | 1,0000 | 21 |

La matriz de confusión reportada es TN=140, FP=16, FN=0, TP=156.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 135 millones de parámetros, la inferencia en FP32 requiere aproximadamente 541 MB de memoria. En FP16 se reduce a ~270 MB, y en INT8 a ~135 MB (si se aplicara cuantización, aunque no está oficialmente soportada).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA T4, RTX 2060, o incluso GPUs integradas). No se requiere hardware de alta gama.
- Capacidad en CPU: el modelo puede ejecutarse eficientemente en CPU, con latencias de decenas de milisegundos por prompt en procesadores modernos, lo que lo hace adecuado para despliegues sin GPU.
- Opciones de despliegue: compatible con Hugging Face Transformers (pipeline de `text-classification`), ONNX Runtime, y servidores de inferencia como Text Embeddings Inference (TEI). También puede integrarse en frameworks como FastAPI o Triton.
- Latencia y throughput: no se han publicado mediciones oficiales; se estima que en CPU moderna la inferencia de un prompt de 256 tokens tarda entre 10 y 50 ms, dependiendo del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros clasificadores de inyección de prompts (por ejemplo, modelos de Meta, ProtectAI o similares). El autor no ha proporcionado resultados comparativos en la documentación. Se recomienda evaluar este modelo frente a alternativas como `protectai/deberta-v3-base-prompt-injection` o `meta-llama/Llama-Guard-3-1B` en un escenario propio, pero no hay datos objetivos disponibles en la información facilitada.

## Limitaciones y advertencias

- La evaluación se realizó sobre un dataset sintético y en-dominio; los resultados no establecen robustez en entornos reales con tráfico diverso.
- El modelo solo cubre catalán, español e inglés; su rendimiento en otros idiomas no ha sido medido y probablemente sea inferior.
- Puede producir tanto falsos positivos como falsos negativos. No debe utilizarse como única barrera de seguridad; los sistemas de alta criticidad requieren controles de autorización y políticas independientes.
- No detecta ataques novedosos, contextos largos (más de 256 tokens), entradas multimodales, ni inyecciones indirectas incrustadas en archivos arbitrarios.
- El modelo base (DistilBERT multilingüe) puede heredar sesgos y limitaciones de sus datos de preentrenamiento.
- La licencia del modelo es Apache-2.0, pero el dataset de entrenamiento está bajo CC BY 4.0, lo que implica requisitos de atribución si se utiliza el dataset.
- No se recomienda su uso como prueba de seguridad o como sistema de autorización; es una señal de bajo coste para triaje.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/gcjordi/CiberIA-PromptGuard-multilingual-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/gcjordi/CiberIA-PromptRisk-v1
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Página del proyecto CiberIA (benchmarks y evaluaciones): https://gcjordi.github.io/publitests.github.io/

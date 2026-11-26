# mahfuzmridul/bert-base-uncased-prompt-attack-3class-fullft

## Resumen

El modelo `mahfuzmridul/bert-base-uncased-prompt-attack-3class-fullft` es un clasificador de texto basado en BERT-base uncased, afinado completamente (todos los pesos) para detectar prompts adversariales en tres clases: benigno, inyección de prompt y jailbreak. Lo desarrolla el autor mahfuzmridul en el contexto de una tesis sobre detección robusta de ataques a LLM mediante transformers encoder, comparando fine-tuning completo frente a LoRA. Su relevancia actual radica en que aborda un problema operativo creciente en el despliegue de aplicaciones con LLM: filtrar entradas que intentan manipular la jerarquía de instrucciones o eludir políticas de seguridad.

Arquitectura transformer encoder BERT-base con 109.484.547 parámetros totales (todos entrenables en este checkpoint), ventana de entrada de 256 tokens y clasificación en tres etiquetas. El modelo está pensado como componente de preprocesado o guardrail en pipelines de aplicaciones LLM, no como generador. El repositorio ocupa 0,4 GB y los pesos están en formato safetensors.

La contribución técnica más destacable es la evaluación de robustez frente a cambio de fuente: además del test in-distribution, el autor publica métricas en un test de longitud emparejada y en un test con fuentes retenidas (source-held-out), lo que expone de forma explícita la brecha entre rendimiento nominal y generalización a distribuciones no vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base (uncased) |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento, truncación head_tail) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con text-embeddings-inference) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se parte de `google-bert/bert-base-uncased` y se aplica fine-tuning completo sobre el 100 % de los pesos (109.484.547 parámetros entrenables). El cabezal es de clasificación de secuencias con tres etiquetas: `0` benign, `1` prompt_injection, `2` jailbreak. La tokenización usa una política de truncación `head_tail`: se reservan 2 tokens para CLS y SEP y, si la entrada excede el presupuesto de 256, se conserva el primer 25 % y el último 75 % del cuerpo. Esta decisión es relevante porque los ataques suelen colocar instrucciones maliciosas al inicio o al final del texto.

El entrenamiento se realizó sobre un benchmark inglés curado de tres clases con 300.000 filas provenientes de datasets publicados, con un split de entrenamiento de 209.654 filas y validación de 41.983 filas para early stopping sobre macro-F1. Hiperparámetros: learning rate 5e-05, batch efectivo 32, warm-up 0.06, weight decay 0.01, layer-wise LR decay 0.9, precisión torch.float16 y sin manejo explícito del desbalanceo. Se ejecutaron 16.378 pasos con early stopping (paciencia 2), en 57,5 minutos sobre 2 × Tesla T4 con un pico de 3,4 GB de memoria por GPU. Parte de los datos de entrenamiento es sintética (WildJailbreak, ReNeLLM, SecAlign, BIPIA-GPT).

## Capacidades

- Clasificación de texto en tres clases operativas: benigno, inyección de prompt y jailbreak.
- Detección de manipulación de la jerarquía de instrucciones (prompt injection), por ejemplo instrucciones que intentan sobrescribir el system prompt.
- Detección de intentos de eludir políticas de seguridad (jailbreak).
- Salida de probabilidades por clase, apta para umbralización configurable en producción.
- Entrada en inglés con ventana de 256 tokens y truncación head_tail entrenada específicamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Guardrail de entrada en aplicaciones LLM: clasificar cada mensaje del usuario antes de enviarlo al modelo generativo y bloquear o marcar los que se etiqueten como `prompt_injection` o `jailbreak`. La latencia de un BERT-base es baja y encaja en el camino crítico de un chatbot.
- Filtrado de documentos en pipelines RAG: detectar instrucciones maliciosas embebidas en documentos recuperados (el autor reporta una tasa de falsos positivos específica para la tier 3, documentos embebidos, de 0.0371), evitando ataques de inyección indirecta.
- Moderación de comunidades y foros: clasificar mensajes de usuarios para señalar intentos de jailbreak dirigidos a bots públicos desplegados en la plataforma.
- Etiquetado y curación de datasets de seguridad: usar el modelo como preetiquetador para construir corpus de ataques y benignos, con revisión humana posterior sobre las predicciones de menor confianza.
- Telemetría y análisis de incidentes: procesar logs históricos de prompts para cuantificar la prevalencia de intentos de inyección y jailbreak y alimentar paneles de seguridad.
- Evaluación de robustez de otros clasificadores: servir como baseline encoder en experimentos comparativos frente a modelos basados en LLM o en LoRA, dado que el autor publica métricas por vista de test y logs de entrenamiento.
- Filtro por capas en sistemas multi-tenant: aplicar umbrales distintos por tier de benignidad (el modelo reporta FPR separadas para tier 1, 2 y 3) según la tolerancia al falso positivo de cada cliente.

## Benchmarks y rendimiento

| Vista de test | n | macro-F1 (IC 95 %) | accuracy | F1 benign | F1 injection | F1 jailbreak |
|---|---:|---|---:|---:|---:|---:|
| Test in-distribution | 40.817 | 0,9728 (0,9713–0,9743) | 0,9735 | 0,9669 | 0,9882 | 0,9632 |
| Test de longitud emparejada | 15.288 | 0,9571 (0,9537–0,9603) | 0,9572 | 0,9452 | 0,9784 | 0,9478 |
| Test con fuentes retenidas (source-held-out) | 6.277 | 0,7551 (0,7432–0,7673) | 0,7838 | 0,9138 | 0,7087 | 0,6427 |

Tasa de falsos positivos sobre benignos en el split de test (sobredetección): tier 1 (general) 0,0203; tier 2 (adyacente a ataques) 0,0652; tier 3 (documentos embebidos) 0,0371. Brecha de atajo (shortcut gap), definida como macro-F1 de test menos macro-F1 con fuentes retenidas: +0,2177, es decir, una caída de más de 21 puntos al cambiar de distribución de origen.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,25 GB de pesos (109,5 M de parámetros) más activaciones; en la práctica cabe holgadamente en cualquier GPU con 1–2 GB libres.
- Entrenamiento de referencia: 2 × Tesla T4 con 3,4 GB de pico por GPU en fp16, 57,5 minutos para 16.378 pasos.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños con latencia aceptable.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference (el repo está marcado como compatible con endpoints), y exportación a ONNX si se necesita optimización. No hay pesos GGUF publicados.
- Latencia y throughput: no disponibles de forma explícita en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y suficiente para filtrar en línea, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BERT-base full fine-tune) | 109,5 M | 256 tokens | Clasificación 3 clases (benign/injection/jailbreak) | MIT | Hugging Face, 0 descargas |
| BERT-base uncased (base) | 109,5 M | 512 tokens | Masked LM / ajustable | Apache 2.0 (modelo base) | Hugging Face |
| Variantes LoRA del mismo estudio | no disponible | 256 tokens | Misma tarea | no disponible | Referenciadas en la tesis, no enlazadas |
| Clasificadores de prompt injection basados en LLM | no disponible | no disponible | Detección binaria o multietiqueta | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento entre modelos.

## Limitaciones y advertencias

- Solo inglés: cualquier entrada en otro idioma queda fuera de la distribución de entrenamiento.
- Las tres clases son una separación operativa: instrucción jerárquica manipulada (inyección) frente a elusión de política de seguridad (jailbreak); un ataque real puede ser ambas cosas y el modelo no está diseñado para desambiguarlo.
- Las peticiones dañinas sin marco de manipulación no constituyen una clase: la salida del modelo sobre ellas es indefinida.
- Parte de los datos de entrenamiento es sintética, lo que puede introducir artefactos de estilo no presentes en ataques reales.
- Brecha de generalización muy significativa: macro-F1 cae de 0,9728 in-distribution a 0,7551 con fuentes retenidas (shortcut gap +0,2177). El rendimiento en producción con datos de otra procedencia será sustancialmente inferior al nominal.
- Falsos positivos no triviales en textos adyacentes a ataques (tier 2: 0,0652) y en documentos embebidos (tier 3: 0,0371), lo que puede degradar la experiencia en aplicaciones con contenido legítimo sensible.
- La truncación head_tail es parte del contrato de entrenamiento: usar otra política de truncación puede alterar las predicciones de forma no medida.
- Licencia MIT permite uso comercial, pero no hay garantía de rendimiento ni de seguridad; el modelo es un filtro auxiliar, no una defensa completa.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea con alta confianza en dominios alejados del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mahfuzmridul/bert-base-uncased-prompt-attack-3class-fullft
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio de logs y predicciones: carpeta `runs/` del repositorio de Hugging Face del modelo
- Paper o publicación de la tesis: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

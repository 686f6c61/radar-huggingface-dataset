# shareit/Qnexa-Eval

## Resumen

Qnexa-Eval es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario shareit, diseñado específicamente como juez automático (LLM-as-a-judge) para respuestas de atención al cliente y de gestión de quejas civiles en coreano. El modelo evalúa cada respuesta en cuatro dimensiones (exactitud, relevancia, consistencia y fundamentación) con puntuaciones de 1 a 5, además de valores como "no evaluable" o "no aplicable", y devuelve las evidencias textuales (spans) en formato JSON.

La particularidad del proyecto es que no se trata de un evaluador genérico, sino de dos adaptadores diferenciados por formato: uno para conversaciones interactivas (atención telefónica o chat con múltiples turnos) y otro para quejas documentales (una consulta y una respuesta). Esta separación responde al hallazgo de que la frontera crítica en los experimentos previos no era la distinción entre sector privado y público, sino entre formato conversacional y documental. El modelo se entrenó en seis dominios de datos de AI-Hub (Corea del Sur) y emplea una licencia Apache 2.0.

El modelo resuelve el problema de la evaluación automática de calidad en atención al cliente coreana, un nicho poco cubierto por los evaluadores multilingües genéricos. Su relevancia actual radica en la escasez de herramientas de juicio específicas para dominios regulados y en la documentación transparente de sus limitaciones, incluyendo la advertencia explícita de que no predice la satisfacción del cliente y de que su validación humana está pendiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen/Qwen3.5-9B), r=32, α=64, capas lineales de atención y MLP |
| Parámetros totales | 9B (modelo base); adaptador LoRA de 0,6 GB en el repositorio |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantización | No disponible (entrenamiento en bf16, QLoRA no utilizado) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y α=64 aplicado sobre todas las capas lineales de atención y MLP del modelo base Qwen/Qwen3.5-9B, sin cuantización QLoRA. El entrenamiento consistió en una época de SFT seguida de una época de DPO. Los datos de entrenamiento provienen de AI-Hub: 10.033 conversaciones del dataset de quejas privadas (Activenture, LG Uplus, Hana Card) y 9.128 conversaciones del dataset de quejas públicas (National Asian Culture Center, agencias administrativas centrales y locales).

Las etiquetas de entrenamiento no fueron anotadas manualmente por personas: se generaron mediante (1) pares de respuestas corruptas de forma controlada, (2) etiquetas de tarea de AI-Hub y (3) juicios de rúbrica de un modelo externo de pesos abiertos (google/gemma-4-31B-it). El municipio de Seongnam (843 casos) se reservó desde el inicio como conjunto de simulación de nueva institución, y las etiquetas de satisfacción del cliente se usaron solo para calibración y validación, no para entrenamiento. Los textos legales provienen del snapshot de leyes coreanas de HF (mosshoon/korean-laws, CC-BY-4.0).

## Capacidades

- Evaluación de respuestas de atención al cliente en cuatro dimensiones: exactitud, relevancia, consistencia y fundamentación, con puntuaciones de 1 a 5 o valores especiales ("no evaluable", "no aplicable").
- Extracción de evidencias textuales (spans) que respaldan cada juicio, devueltas en JSON.
- Detección de citas legales fabricadas o inexistentes (tasa de detección de 0,991).
- Discriminación de pares de respuestas (buena vs. defectuosa) en las cuatro dimensiones.
- Procesamiento de conversaciones multi-turno (hasta 14 turnos de contexto previo y 2 posteriores) en el adaptador conversacional.
- Procesamiento de quejas documentales con consulta, respuesta, conjunto de evidencias legales y resultado del verificador de citas en el adaptador documental.
- Capacidad de generalización a dominios no vistos (LODO) con discriminación de pares de 0,77 a 0,82.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente multi-paso: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- **Evaluación comparativa de chatbots de atención al cliente**: el modelo permite comparar dos chatbots (A y B) sobre las mismas consultas dentro de una misma institución, generando un ranking relativo basado en las cuatro dimensiones. Es adecuado porque su entrenamiento en pares de respuestas buenas y defectuosas le permite discriminar con precisión (relevancia 0,971, consistencia 0,927).

- **Cribado inicial de defectos en respuestas de chatbots entregados**: en la validación de proveedores, el modelo filtra respuestas con problemas de relevancia, consistencia o fundamentación documental, reduciendo la carga de revisión humana. Su capacidad de detectar citas legales fabricadas (0,991) lo hace idóneo para este fin.

- **Auditoría de fundamentación en respuestas documentales a quejas**: para quejas administrativas donde la respuesta cita artículos legales, el adaptador documental verifica que las citas existan y que las evidencias textuales estén presentes en la respuesta (tasa de span presente de 0,993). Es útil en organismos públicos que requieren trazabilidad legal.

- **Control de calidad en centros de atención telefónica**: el adaptador conversacional evalúa turnos individuales de agentes humanos en conversaciones multi-turno, detectando problemas de relevancia y consistencia. Es adecuado para supervisión de calidad continua, aunque no debe usarse para medir satisfacción del cliente.

- **Detección de alucinaciones en respuestas generadas por LLM**: el modelo puede puntuar la fundamentación de respuestas generadas por chatbots contra el contexto o los documentos proporcionados, identificando contenido inventado. Su uso está recomendado exclusivamente para respuestas de chatbots generativos, no para logs de agentes humanos.

- **Simulación de nueva institución antes del despliegue**: mediante la herramienta `kocef diagnose` y la validación con pares locales y anclas, el modelo permite evaluar su cobertura en una nueva organización antes de usarlo en producción, siguiendo el flujo de onboarding documentado en el repositorio.

- **Investigación en evaluación automática de dominios regulados**: el modelo sirve como caso de estudio para investigadores que analizan la diferencia entre calidad de turno y satisfacción de conversación, con métricas documentadas de AUC y correlación de rango.

## Benchmarks y rendimiento

Discriminación de pares (respuesta buena vs. defectuosa) tras el entrenamiento, sobre el mismo conjunto de test:

| Dimensión | Zero-shot (base) | Tras entrenamiento | n |
|---|---:|---:|---:|
| Exactitud | 0,591 | 0,712 | 211 |
| Relevancia | 0,876 | 0,971 | 257 |
| Consistencia | 0,643 | 0,927 | — |
| Fundamentación | 0,726 | 0,859 | — |

Discriminación de pares por dominio y formato:

| Dominio | Formato | Exactitud | Relevancia | Consistencia | Fundamentación |
|---|---|---:|---:|---:|---:|
| Activenture | Conversacional | 0,683 (n=164) | 0,982 (n=197) | 0,958 (n=107) | 0,692 (n=13) |
| LG Uplus | Conversacional | 0,758 (n=60) | 0,934 (n=129) | 0,939 (n=140) | 1,000 (n=2) |
| Hana Card | Conversacional | 0,739 (n=115) | 0,963 (n=134) | 0,939 (n=155) | 0,500 (n=1) |
| National Asian Culture Center | Conversacional | 0,767 (n=133) | 0,960 (n=151) | 0,944 (n=161) | 0,750 (n=4) |
| Agencias centrales | Documental | 0,758 (n=153) | 0,982 (n=198) | — | 0,883 (n=582) |
| Agencias locales | Documental | 0,763 (n=137) | 0,990 (n=190) | — | 0,838 (n=105) |

Correlación con la satisfacción humana (ancla de test):

| Dominio | Formato | Conversaciones | Tasa de satisfacción | AUC (IC 95%) | ρ de rango (IC 95%) | ECE sin calibrar → calibrado |
|---|---|---:|---:|---|---|---|
| Activenture | Conversacional | 181 | 0,923 | 0,482 (0,468–0,494) | -0,054 (-0,080–-0,026) | 0,094 → 0,009 |
| LG Uplus | Conversacional | 720 | 0,828 | 0,523 (0,481–0,564) | 0,051 (-0,032–0,133) | 0,205 → 0,005 |
| Hana Card | Conversacional | 1307 | 0,793 | 0,502 (0,479–0,526) | 0,008 (-0,047–0,063) | 0,235 → 0,001 |
| National Asian Culture Center | Conversacional | 189 | 0,640 | 0,561 (0,520–0,604) | 0,222 (0,088–0,361) | 0,326 → 0,002 |
| Agencias centrales | Documental | 889 | 0,560 | 0,520 (0,483–0,557) | 0,027 (-0,039–0,090) | 0,241 → 0,029 |
| Agencias locales | Documental | 570 | 0,268 | 0,552 (0,493–0,608) | 0,085 (-0,000–0,171) | 0,470 → 0,039 |
| Conversacional global (controlado por dominio) | Conversacional | — | — | AUC intra-dominio 0,511 | ρ parcial 0,033 | — |
| Documental global (controlado por dominio) | Documental | — | — | AUC intra-dominio 0,532 | ρ parcial 0,050 | — |

Otras métricas: detección de citas legales fabricadas o inexistentes 0,991; proporción de spans de evidencia realmente presentes en la respuesta 0,993; degradación en leyes no vistas durante el entrenamiento 0,074; discriminación de pares en dominios no vistos (LODO) 0,77–0,82. Los objetivos del plan (ρ ≥ 0,55, AUC ≥ 0,80) no se alcanzaron en la predicción de satisfacción.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,6 GB, pero requiere cargar el modelo base Qwen/Qwen3.5-9B. En bf16, el modelo base de 9B requiere aproximadamente 18 GB de VRAM; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) o RTX 4080 para cuantización de 8 bits.
- Compatibilidad con GPU de consumo: sí, en GPUs con 24 GB o más en bf16; en GPUs de 8-12 GB mediante cuantización de 4 u 8 bits.
- Opciones de despliegue: el adaptador es compatible con PEFT; el despliegue del modelo base puede realizarse con vLLM, TGI, llama.cpp u Ollama, aunque no se documentan configuraciones específicas para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qnexa-Eval (este modelo) | 9B (base) + LoRA | No disponible | Juez de atención al cliente en coreano, 4 dimensiones | Apache 2.0 | Hugging Face (adaptador) |
| Evaluadores LLM genéricos multilingües (p. ej., Prometheus, JudgeLM) | Variable (7B–13B) | Variable | Evaluación genérica por rúbrica | Variable | Hugging Face |
| Modelos base Qwen3.5-9B | 9B | No disponible | Generación de texto general | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos directos con otros evaluadores en el mismo conjunto de test coreano, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- **Cobertura limitada a seis dominios**: el modelo solo se ha validado en los seis dominios de AI-Hub (tres privados y tres públicos). En nuevas instituciones o formatos puede fallar silenciosamente; es obligatorio ejecutar `kocef diagnose` y validación local antes de su uso.
- **No predice la satisfacción del cliente**: el AUC intra-dominio es de 0,511 (conversacional) y 0,532 (documental), muy por debajo del objetivo de 0,80. No debe usarse para inferir si un cliente quedará satisfecho.
- **Exactitud (errores factuales) es la dimensión más débil**: 0,712 tras el entrenamiento; en errores naturales generados por otros modelos baja a 0,615 (conversacional) y 0,740 (documental).
- **Fundamentación conversacional no aplicable a logs humanos**: la mayoría de respuestas humanas reciben puntuaciones de 1-2 o "no aplicable" porque la información consultada por el agente no está en el contexto de la conversación. Solo debe usarse para detectar alucinaciones en respuestas de chatbots generativos.
- **Fundamentación documental potencialmente sobresensible**: el 32% de las respuestas reales reciben 1 punto (frente al 11% en las etiquetas del modelo profesor), por lo que debe combinarse con el verificador de citas.
- **Baja especificidad dimensional**: introducir un defecto en una dimensión tiende a reducir las puntuaciones de otras dimensiones; los resultados deben interpretarse como "qué dimensión cayó más", no como puntuaciones independientes.
- **Sin validación humana**: la concordancia con evaluadores humanos (H1) y el conjunto de validación humana de 400 turnos (H4) no se han completado; los valores publicados son sustitutos generados por LLM.
- **Sesgos**: no documentados explícitamente por el autor; el entrenamiento con datos de seis instituciones coreanas concretas puede introducir sesgos hacia sus estilos de respuesta y vocabulario.
- **Idioma**: solo coreano; no se ha validado su uso en otros idiomas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero los datos originales de AI-Hub no se incluyen y requieren solicitud directa bajo sus propios términos.

## Enlaces

- Hugging Face: https://huggingface.co/shareit/Qnexa-Eval
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub (código, generador, diagnosticador, módulo legal, guía de onboarding): https://github.com/jdy-brf/Qnexa-Eval
- AI-Hub (datos de entrenamiento): https://aihub.or.kr
- Snapshot de leyes coreanas: https://huggingface.co/mosshoon/korean-laws

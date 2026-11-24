# DICPlay/RusMind-Zernyshko-1.10-GGUF

## Resumen

RusMind Zernyshko 1.10 es un modelo de lenguaje de generacion de texto desarrollado por DICPlay, entrenado completamente desde cero con tokenizador propio y orientado exclusivamente al idioma ruso. Se trata de un transformer denso de tan solo 83 millones de parametros (10 capas x 768 dimensiones) que se distribuye en formato GGUF con un tamano de aproximadamente 167 MB, lo que permite ejecutarlo de forma totalmente offline en cualquier portatil o telefono. El modelo se presenta como la version con mejor puntuacion MERA y mejor ortografia de la familia Zernyshko.

La relevancia de este modelo radica en su estrategia de entrenamiento: pese a ser 36 veces mas pequeno que SmolLM-3B, supera a esta en la puntuacion global de MERA 2.0 (0,052 frente a 0,049) y gana en 7 de las 12 tareas evaluadas. El autor reporta ventajas notables en tareas de logica, refranes y sabiduria popular, humor, enantiosemia y conocimiento de personajes, lo que sugiere una especializacion en matices linguisticos y culturales del ruso dificiles de capturar con modelos genericos.

El modelo emplea el formato de dialogo ChatML y una longitud de contexto de 1024 tokens. Se distribuye bajo la licencia propietaria RusMind License (DICPlay), que restringe el uso comercial sin contrato escrito. La version 1.10 se centra en gramatica y ortografia, mientras que el propio autor recomienda la version 1.9 para conversacion general y preguntas sobre Rusia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (10 capas x 768 dimensiones), entrenado desde cero |
| Parametros totales | 83.083.008 (~83 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (unico archivo publicado, 167 MB) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso comercial solo con contrato escrito |
| Formato de pesos | GGUF (F16); safetensors en el repositorio base DICPlay/RusMind-Zernyshko-1.10 |
| Formato de dialogo | ChatML |
| Tamano del repositorio | ~0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 10 capas con dimension oculta de 768, entrenado integramente desde cero ("from-scratch") con un tokenizador propio disenado para el ruso. No se dispone de informacion publica sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones; estos datos figuran como no disponibles en la model card.

La innovacion principal no reside en la arquitectura, sino en la relacion entre tamano y rendimiento linguistico en ruso: el autor reporta que la version 1.10 mejora la puntuacion MERA 2.0 de 0,049 (version 1.6) y 0,048 (version 1.9) a 0,052, y eleva la metrica SAGE de colocacion de comas de 0,267 a 0,409 y la de correccion ortografica de 0,062 a 0,149. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional en ruso con formato de dialogo ChatML.
- Razonamiento logico basico: puntuacion de 0,146 en NewReasoning de MERA 2.0.
- Conocimiento de refranes, proverbios y sabiduria popular rusa (RUBIN: 0,263).
- Comprension de humor y matices idiomaticos (Humor: 0,041; Enantiosemia: 0,058).
- Reconocimiento de personajes (Characters: 0,177) y conocimiento de regiones de Rusia (RussianRegions: 0,031).
- Correccion ortografica y puntuacion en ruso (SAGE: 0,149 en ortografia y 0,409 en comas).
- Ejecucion totalmente offline en dispositivos de bajos recursos (portatiles y telefonos).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Correccion ortografica y de puntuacion en ruso: el modelo puede integrarse en editores de texto o pipelines de preprocesamiento para revisar comas y faltas ortograficas, aprovechando sus puntuaciones SAGE de 0,409 y 0,149 respectivamente, superiores a las de modelos mucho mayores.
- Procesamiento de texto en dispositivos sin conectividad: al ocupar 167 MB en F16, puede desplegarse en telefonos o portatiles para tareas de generacion y normalizacion de texto en entornos offline o con requisitos de privacidad estrictos.
- Filtrado y clasificacion de matices culturales rusos: su rendimiento en refranes (RUBIN 0,263) y enantiosemia (0,058) permite usarlo en tareas de deteccion de dobles sentidos o expresiones idiomaticas en contenidos en ruso.
- Generacion de respuestas breves en asistentes conversacionales de bajo coste: con contexto de 1024 tokens y formato ChatML, es adecuado para chatbots simples de dominio acotado donde el coste por inferencia y el consumo de memoria son criticos.
- Educacion y ensenanza del ruso: puede emplearse como herramienta de apoyo para practicar gramatica, puntuacion y comprension de expresiones populares, dado su enfoque en gramatica en la version 1.10.
- Prototipado e investigacion en modelos pequenos: sirve como base para experimentos de entrenamiento desde cero y evaluacion en ruso con recursos minimos, al ser un modelo de 83 M de parametros con tokenizador propio.
- Analisis de contenido regional: su conocimiento de regiones rusas (0,031) permite tareas basicas de identificacion geografica en textos, aunque con fiabilidad limitada.

## Benchmarks y rendimiento

Resultados reportados por el autor segun la metodologia MERA 2.0 (los numeros de las otras modelos provienen del leaderboard MERA):

| Tarea MERA 2.0 | Zernyshko 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global | 0,052 | 0,049 |
| NewReasoning (logica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemia | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparaciones adicionales reportadas por el autor:

| Modelo comparado | Metrica | Zernyshko 1.10 | Modelo comparado |
|---|---|---|---|
| GFusion-10B-A1.8B (130x mayor) | NewReasoning | 0,146 | 0,057 |
| GFusion-10B-A1.8B | Humor | 0,041 | 0,035 |
| A-vibe 8B (96x mayor) | RUBIN | 0,263 | 0,251 |
| Qwen3.5-4B (48x mayor) | SAGE (ortografia) | 0,257 | 0,038 |
| Qwen3.5-4B | RUBIN | 0,263 | 0,259 |
| Qwen3.5-4B | RussianRegions | 0,031 | 0,018 |
| Qwen3.5-9B (108x mayor) | SAGE (ortografia) | 0,257 | 0,121 |
| gemma-4-E4B-it | SAGE (ortografia) | 0,257 | 0,124 |
| gemma-4-E4B-it | Characters | 0,177 | 0,075 |

Evolucion entre versiones de la familia:

| Metrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| SAGE (comas) | 0,267 | 0,335 | 0,409 |
| SAGE (ortografia) | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en F16 (167 MB de pesos mas overhead de contexto y runtime); en la practica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (integrada o discreta) es suficiente.
- Cabe en GPU consumer: si, en cualquier modelo, incluida las integradas y GPUs de gama baja.
- Despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.10-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.10-GGUF`), LM Studio (busqueda "RusMind Zernyshko"). Pesos safetensors para Transformers en el repositorio base.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en tiempo real incluso en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MERA 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.10 | 83 M | 1024 | 0,052 | RusMind License (comercial con contrato) | GGUF en HF; safetensors en repo base |
| SmolLM-3B | 3 B | no disponible | 0,049 | no disponible en la informacion | no disponible en la informacion |
| Qwen3.5-4B | 4 B | no disponible | no disponible (SAGE 0,038) | no disponible en la informacion | no disponible en la informacion |
| gemma-4-E4B-it | 4 B (aprox.) | no disponible | no disponible (SAGE 0,124) | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a las metricas MERA y SAGE reportadas por el autor; no se dispone de datos de contexto, licencia ni disponibilidad de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente en ruso: no soporta castellano ni otros idiomas; su uso fuera del ruso producira resultados deficientes.
- Contexto muy limitado: 1024 tokens restringen conversaciones largas, documentos extensos y razonamiento multi-paso.
- Tamano reducido: 83 M de parametros implican conocimiento factual limitado y mayor riesgo de alucinacion en preguntas abiertas o especializadas.
- Rendimiento absoluto bajo: la puntuacion global MERA de 0,052, aunque superior a SmolLM-3B, es baja en terminos absolutos; no es adecuado para tareas que exijan alta precision.
- El propio autor recomienda la version 1.9 para conversacion general y preguntas sobre Rusia; la 1.10 esta optimizada para gramatica.
- Licencia restrictiva: el uso comercial, la reversion, la distribucion de versiones modificadas y la integracion en productos requieren contrato escrito con DICPlay; se ofrece "tal cual", sin garantias.
- Sin soporte documentado de tool calling, agentes, vision ni audio, lo que limita su integracion en pipelines agenticos.
- Riesgo de sesgos: al entrenarse desde cero con un corpus no documentado, pueden existir sesgos culturales y linguisticos no evaluados.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que dificulta evaluar la procedencia y calidad de los datos.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Hugging Face (safetensors, repo base): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- Version 1.9 (recomendada por el autor para conversacion): https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Archivo de pesos F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/RusMind-Zernyshko-1.10-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/LICENSE
- Contacto Telegram: https://t.me/DanKirillin
- Contacto MAX: https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU

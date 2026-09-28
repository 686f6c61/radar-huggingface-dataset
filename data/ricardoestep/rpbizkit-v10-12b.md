# RicardoEstep/RPBizkit-v10-12B

## Resumen

RPBizkit-v10-12B es un merge experimental de pesos publicado por el usuario RicardoEstep en HuggingFace, orientado a generación de texto conversacional y roleplay (RP) sin censura. Se construye sobre la arquitectura Mistral NeMo y cuenta con 12 247 782 400 parámetros (aproximadamente 12,2 B), con un vocabulario y embeddings de 131 072 entradas. El autor afirma que el modelo "debería" soportar una ventana de contexto completa de 128 000 tokens, aunque no aporta verificación empírica de ello.

El modelo no se ha entrenado desde cero: es el resultado de fusionar doce modelos base especializados en conversación de rol mediante mergekit, utilizando el método Model Stock (arXiv:2403.19522). El modelo base de la fusión es TheDrummer/UnslopNemo-12B-v4.1, y a él se incorporan pesos de NeverSleep/Lumimaid-v0.2-12B, anthracite-org/magnum-v2-12b, Gryphe/Pantheon-RP-1.6.1-12b-Nemo, allura-org/MN-12b-RP-Ink, LatitudeGames/Muse-12B y otros siete modelos de la misma familia, todos ellos derivados de Mistral NeMo 12B.

Su relevancia es acotada: se trata de un artefacto de nicho (168 descargas y 1 like en el momento de redactar esta ficha) que sirve como ejemplo práctico de fusión multi-modelo con Model Stock y de gestión limpia del tokenizador en la familia Mistral NeMo. Lleva la etiqueta `not-for-all-audiences`, por lo que no está pensado para aplicaciones de producción generalistas. No se declara licencia ni lista de idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Mistral NeMo (derivado por fusión de pesos) |
| Parametros totales | 12 247 782 400 (≈12,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | El autor indica "se supone" que soporta 128 000 tokens; no verificado ni disponible de forma oficial |
| Tipos de cuantizacion | No disponible en el repositorio principal; existe un repositorio GGUF separado (RicardoEstep/RPBizkit-v10-12B-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (biblioteca transformers); existe versión GGUF en repositorio aparte |
| Tamano del repositorio | 24,5 GB |
| Tipo de dato de los pesos | bfloat16 |
| Tamano de vocabulario | 131 072 tokens |
| Metodo de fusion | Model Stock (mergekit), normalizado, con `filter_wise: true` e `int8_mask: false` |
| Modelo base de la fusion | TheDrummer/UnslopNemo-12B-v4.1 |
| Plantilla de chat | Sin plantilla activa por defecto; el autor recomienda Alpaca con entradas RAW. Existe plantilla opcional Mistral V3 en `optional_chat_template.jinja.7z` |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only de la familia Mistral NeMo, con aproximadamente 12,2 B de parámetros y vocabulario de 131 072 tokens. No se ha realizado entrenamiento adicional sobre el modelo resultante: los pesos se obtienen exclusivamente mediante fusión. La receta declarada usa mergekit con el método `model_stock`, `normalize: true`, `filter_wise: true` e `int8_mask: false`, tomando como modelo base TheDrummer/UnslopNemo-12B-v4.1 y fijando `tokenizer_source: base` para preservar el tokenizador original. El tipo de dato de salida es bfloat16.

Los doce modelos fusionados son: UnslopNemo-12B-v4.1, NeverSleep/Lumimaid-v0.2-12B, Lambent/arsenic-nemo-unleashed-12B, allura-org/MN-12b-RP-Ink, LatitudeGames/Muse-12B, SicariusSicariiStuff/Impish_Bloodmoon_12B, ReadyArt/Omega-Darker_The-Final-Directive-12B, HumanLLMs/Human-Like-Mistral-Nemo-Instruct-2407, anthracite-org/magnum-v2-12b, Gryphe/Pantheon-RP-1.6.1-12b-Nemo, ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2 y MuXodious/Wayfarer-2-12B-absolute-heresy.

El autor describe el resultado como una fusión con "pesos podados" orientada a mantener estabilidad y creatividad a partes iguales, y señala como innovación práctica la ausencia del problema asociado al parche `fix_mistral_regex` que afecta a otros merges de la misma familia. No se documenta composición del dataset, número de tokens de entrenamiento, ni uso de RLHF o DPO, porque ninguna de esas etapas se ha aplicado al artefacto publicado.

## Capacidades

- Generación de texto conversacional y narrativo orientado a roleplay, con foco en estilos "dark RP" según la propia descripción del autor.
- Continuación de diálogos multi-turno con personajes y trasfondo narrativo.
- Generación creativa y ficción, incluyendo contenido sin censura (el repositorio lleva la etiqueta `not-for-all-audiences`).
- Instrucción general básica heredada de los modelos base de la familia Mistral NeMo Instruct.
- Soporte declarado de ventana de contexto de hasta 128 000 tokens, aunque el autor no aporta verificación y la propia model card lo formula como una suposición.
- Tokenizador limpio con vocabulario de 131 072 entradas y embeddings consistentes con el modelo base.
- Compatibilidad con text-generation-inference y con endpoints compatibles según las etiquetas del repositorio.
- Compatibilidad con la plantilla opcional Mistral V3 (`optional_chat_template.jinja.7z`), además de la recomendación de usar Alpaca con entradas RAW.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Roleplay conversacional de personaje único: el modelo está fusionado específicamente a partir de doce modelos de RP, por lo que mantiene coherencia de personaje en diálogos largos y admite estilos narrativos que los modelos instruct generalistas rechazan.
- Escritura creativa de ficción adulta: la etiqueta `not-for-all-audiences` y la composición de los modelos base lo sitúan como herramienta para narrativa sin restricciones temáticas, útil en entornos controlados y con audiencia advertida.
- Investigación sobre técnicas de fusión de modelos: sirve como caso reproducible de aplicación de Model Stock con mergekit sobre doce checkpoints de la misma familia, con configuración YAML publicada, para estudiar efectos de la normalización y del filtrado por pesos.
- Estudio de deriva de tokenizador en merges: al fijar `tokenizer_source: base` y trabajar con vocabulario de 131 072 entradas, es un ejemplo útil para analizar cómo evitar desalineaciones de embeddings en fusiones multi-modelo.
- Generación de diálogos sintéticos para evaluación de modelos de rol: puede emplearse para producir corpus conversacionales de referencia frente a los que comparar otros merges de Mistral NeMo.
- Despliegue local en hardware de consumo para experimentación: al existir una versión GGUF, se puede ejecutar en equipos con GPU de gama alta o incluso en configuraciones mixtas CPU/GPU, siempre que el caso de uso no requiera garantías de producción.
- Prototipado de asistentes de personaje en videojuegos o experiencias interactivas narrativas: la ventana teórica de 128 000 tokens permitiría mantener un trasfondo extenso en contexto, aunque esta capacidad no está verificada y debe probarse antes de comprometerse con ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, y al tratarse de una fusión de pesos sin entrenamiento adicional no existen curvas de entrenamiento ni evaluaciones asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 24,5 GB de pesos más overhead de activaciones y caché KV, lo que en la práctica exige 28-32 GB de VRAM para secuencias largas.
- Cuantizaciones GGUF: la versión Q8_0 ronda los 13 GB, Q6_K alrededor de 10 GB, Q5_K_M en torno a 8,7 GB, Q4_K_M aproximadamente 7,5 GB y Q3_K_M cerca de 5,5 GB. Estas cifras son estimaciones según el tamaño de parámetros y no proceden de la model card.
- GPU recomendadas para bfloat16 completo: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB o dos RTX 4090 de 24 GB en paralelo con tensor parallelism.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB no aloja los pesos bfloat16 completos, pero sí ejecuta cuantizaciones Q4_K_M o Q5_K_M con comodidad. Una RTX 4080 de 16 GB puede con Q4_K_M si se limita la longitud de contexto.
- Opciones de despliegue: transformers con safetensors, llama.cpp u Ollama con la versión GGUF, y text-generation-inference para servir los pesos originales (el repositorio está etiquetado como compatible con TGI y con endpoints compatibles).
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RicardoEstep/RPBizkit-v10-12B | 12,2 B | 128 000 tokens según autor, no verificado | No disponible | Pesos safetensors + GGUF | Fusión Model Stock de 12 modelos RP |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128 000 tokens | Apache 2.0 | Pesos oficiales | Modelo instruct generalista original de la familia |
| NeverSleep/Lumimaid-v0.2-12B | 12,2 B | 128 000 tokens (heredado de Mistral NeMo) | No disponible de forma explícita en esta ficha | Pesos safetensors | Uno de los doce componentes de la fusión, orientado a RP |
| anthracite-org/magnum-v2-12b | 12,2 B | 128 000 tokens (heredado) | No disponible de forma explícita en esta ficha | Pesos safetensors | Otro de los componentes, especializado en prosa y rol |

No se dispone de comparativas de rendimiento cuantitativas entre estos modelos dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Al ser una fusión de doce modelos de roleplay sin censura, es previsible la reproducción de estereotipos y contenido potencialmente ofensivo presentes en los corpus de los modelos base.
- Riesgo de alucinación: elevado en tareas factuales, ya que ninguno de los modelos fusionados está orientado a precisión factual y la fusión no incorpora ninguna etapa de alineamiento adicional.
- Contenido para adultos: el repositorio incluye la etiqueta `not-for-all-audiences`. No es apto para aplicaciones orientadas al público general, menores o entornos sin moderación.
- Licencia: no disponible. La ausencia de licencia explícita impide asumir derechos de uso comercial, por lo que cualquier despliegue en producción requiere contactar con el autor o abstenerse.
- Idiomas: no disponibles. No se puede confirmar el nivel de competencia en castellano ni en otros idiomas distintos del inglés.
- Contexto: la ventana de 128 000 tokens figura en la model card como una suposición del autor, no como una capacidad verificada. Conviene validarla empíricamente antes de diseñar flujos dependientes de contexto largo.
- Plantilla de chat: la configuración por defecto está modificada para no usar plantilla. Si se integra con frameworks que esperan una plantilla estándar, es necesario aplicar manualmente Alpaca con entradas RAW o desplegar la plantilla Mistral V3 opcional; de lo contrario, la calidad de las respuestas puede degradarse.
- Cifras de cuantización y hardware: las estimaciones de VRAM y los tamaños de las cuantizaciones GGUF son aproximaciones derivadas del número de parámetros, no mediciones publicadas por el autor.
- Trazabilidad: al ser una fusión de pesos sin entrenamiento adicional, no existe información sobre composición del dataset ni sobre procesos de RLHF o DPO aplicados al artefacto final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RicardoEstep/RPBizkit-v10-12B
- Versión GGUF: https://huggingface.co/RicardoEstep/RPBizkit-v10-12B-GGUF
- Plantilla de chat opcional (Mistral V3): https://huggingface.co/RicardoEstep/RPBizkit-v10-12B/resolve/main/optional_chat_template.jinja.7z
- Paper del método Model Stock: https://arxiv.org/abs/2403.19522
- Repositorio de mergekit: https://github.com/cg123/mergekit
- TheDrummer/UnslopNemo-12B-v4.1 (modelo base de la fusión): https://huggingface.co/TheDrummer/UnslopNemo-12B-v4.1
- NeverSleep/Lumimaid-v0.2-12B: https://huggingface.co/NeverSleep/Lumimaid-v0.2-12B
- Lambent/arsenic-nemo-unleashed-12B: https://huggingface.co/Lambent/arsenic-nemo-unleashed-12B
- allura-org/MN-12b-RP-Ink: https://huggingface.co/allura-org/MN-12b-RP-Ink
- LatitudeGames/Muse-12B: https://huggingface.co/LatitudeGames/Muse-12B
- SicariusSicariiStuff/Impish_Bloodmoon_12B: https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B
- ReadyArt/Omega-Darker_The-Final-Directive-12B: https://huggingface.co/ReadyArt/Omega-Darker_The-Final-Directive-12B
- HumanLLMs/Human-Like-Mistral-Nemo-Instruct-2407: https://huggingface.co/HumanLLMs/Human-Like-Mistral-Nemo-Instruct-2407
- anthracite-org/magnum-v2-12b: https://huggingface.co/anthracite-org/magnum-v2-12b
- Gryphe/Pantheon-RP-1.6.1-12b-Nemo: https://huggingface.co/Gryphe/Pantheon-RP-1.6.1-12b-Nemo
- ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2: https://huggingface.co/ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2
- MuXodious/Wayfarer-2-12B-absolute-heresy: https://huggingface.co/MuXodious/Wayfarer-2-12B-absolute-heresy

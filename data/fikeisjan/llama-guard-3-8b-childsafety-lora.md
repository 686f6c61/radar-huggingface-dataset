# fikeisjan/Llama-Guard-3-8B-ChildSafety-LoRA

## Resumen

Llama-Guard-3-8B-ChildSafety-LoRA es un adaptador LoRA (PEFT) sobre el modelo base `meta-llama/Llama-Guard-3-8B` de Meta, desarrollado por el autor fikeisjan (Fikeis, junto con Kordík en la publicación asociada). Su función es convertir el clasificador de seguridad general de Llama Guard 3 en un moderador especializado en interacciones entre menores e IA, capaz de etiquetar una conversación como `safe` o `unsafe` y, en este último caso, indicar la categoría de riesgo vulnerada dentro de una taxonomía centrada en la infancia de 27 categorías agrupadas en 7 dominios.

El problema que aborda es la brecha de alineación de los moderadores de propósito general: según la model card, la API de moderación de OpenAI y el Llama Guard 3 base solo recuperan entre el 30 % y el 38 % de las interacciones dañinas dirigidas a menores (manipulación emocional, grooming, fomento de conductas de riesgo) que no contienen lenguaje soez ni violan políticas calibradas para adultos. El adaptador recalibra el modelo base hacia una taxonomía específica para niños de 6 a 12 y de 13 a 17 años.

El modelo se presenta como el mejor resultado del artículo "Mind the Alignment Gap: Why General-Purpose Moderation Fails Children, and How a Child-Centric Taxonomy and Synthetic Data Close It" (Fikeis & Kordík, WOAH 2026 @ EMNLP). Es relevante por su enfoque en un nicho de seguridad poco cubierto y por sus métricas reportadas en el conjunto de test del propio dataset sintético, aunque el autor advierte explícitamente de que esas cifras son en distribución y no deben extrapolarse a entradas reales ruidosas. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama-Guard-3-8B (base Llama-3.1-8B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Llama-Guard-3-8B tiene 8 000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la información) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones del adaptador; el ejemplo de uso emplea `torch.bfloat16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors |
| Libreria | peft (compatible con transformers) |
| Modelo base | meta-llama/Llama-Guard-3-8B (acceso restringido por Meta) |
| Dataset de entrenamiento | fikeisjan/child-safety-alignment-dataset (gated) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama-Guard-3-8B, un modelo Llama-3.1-8B preentrenado y afinado por Meta para clasificación de seguridad de contenido. Sobre esa base se aplica un ajuste LoRA (Low-Rank Adaptation) mediante PEFT, entrenado con Llama-Factory según las etiquetas del repositorio. El resultado es un adaptador de bajo rango que modifica el comportamiento del clasificador sin reentrenar los 8 000 millones de parámetros del modelo base, lo que explica el reducido tamaño del repositorio (0,2 GB).

Los datos de entrenamiento provienen del dataset `fikeisjan/child-safety-alignment-dataset`, de acceso restringido (gated), y según la model card son interacciones sintéticas generadas para instanciar cada una de las 27 categorías de la taxonomía, separadas por franjas de edad (6-12 y 13-17). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica principal no es arquitectónica sino de alineación: sustituir la política de seguridad genérica del Llama Guard 3 por una taxonomía centrada en la infancia y un prompt de chat incluido en el tokenizador del adaptador que reproduce exactamente el formato de entrenamiento.

## Capacidades

- Clasificación binaria de seguridad: etiqueta una conversación como `safe` o `unsafe`.
- Clasificación multietiqueta por categoría: tras `unsafe`, emite el identificador de la categoría vulnerada de la taxonomía de 27 categorías (por ejemplo `CAT_MEN_02` para grooming o `CAT_BEH_01` para manipulación emocional).
- Procesamiento de conversaciones multi-turno con roles `user` (el menor) y `assistant` (la IA), así como de mensajes únicos.
- Taxonomía específica por edad: cada categoría se instancia por separado para 6-12 y 13-17 años.
- Dominios cubiertos: desarrollo conductual y social, impacto cognitivo y educativo, toxicidad y ciberacoso, privacidad e identidad, sesgos y estereotipos, bienestar mental y seguridad, y uso indebido y explotación.
- Detección de daños sutiles sin lenguaje soez: manipulación emocional, antropomorfismo y falsa confianza, sobreconfianza cognitiva, grooming, dependencia emocional no saludable, ingeniería social o elusión de salvaguardas.
- Plantilla de chat incluida en el tokenizador del adaptador que replica el prompt de entrenamiento.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido según la información disponible; es exclusivamente un clasificador.

## Casos de uso

- Moderación de asistentes conversacionales dirigidos a menores: el adaptador se intercala como clasificador previo o posterior a cada turno de la conversación entre el niño y la IA, usando la plantilla de chat incluida, para bloquear o escalar interacciones etiquetadas como `unsafe` con su categoría concreta.
- Detección de grooming y manipulación emocional: al cubrir categorías como `CAT_MEN_02` (grooming y comportamiento depredador) o `CAT_BEH_01` (manipulación emocional y aislamiento social), permite alertar a moderadores humanos en plataformas educativas o de mensajería infantil.
- Cumplimiento normativo en productos de IA para educación: integrado en pipelines de validación, genera registros de clasificación por categoría que facilitan la trazabilidad exigida por marcos de protección de menores, algo que un moderador general no ofrece al no disponer de esta taxonomía.
- Auditoría de conversaciones históricas: el modelo puede procesar lotes de transcripciones almacenadas para identificar interacciones de riesgo no detectadas por la moderación original, aprovechando que funciona sobre conversaciones multi-turno completas.
- Investigación en seguridad de IA infantil: sirve como línea base reproducible para comparar moderadores generales frente a especializados, dado que el autor publica el dataset, la taxonomía en `taxonomy.json` y el código en GitHub.
- Filtrado en herramientas de tutoría automática: categorías como `CAT_COG_01` (sobrecarga cognitiva), `CAT_COG_02` (dependencia excesiva) o `CAT_MIS_01` (deshonestidad académica) permiten ajustar respuestas de un tutor IA a un comportamiento pedagógicamente adecuado.
- Detección de crisis y autolesión: la categoría `CAT_MEN_01` (autolesión y distorsión psicológica) y `CAT_MEN_03` (detección y respuesta inadecuada ante crisis) permiten activar protocolos de escalado a recursos humanos cuando el clasificador marca la conversación.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test reservado del dataset (7 920 interacciones: 4 565 seguras, 3 355 dañinas). H-P / H-R son precisión y recall sobre la clase dañina.

| Modelo | Accuracy | Macro-F1 | H-P | H-R |
|---|---|---|---|---|
| OpenAI Moderation API | 0,698 | 0,623 | 0,960 | 0,300 |
| Llama Guard 3 8B (base) | 0,738 | 0,683 | 0,999 | 0,381 |
| Llama Guard 3 8B + este adaptador | 0,996 | 0,996 | 0,997 | 0,994 |

El autor reporta un intervalo de confianza bootstrap del 95 % para macro-F1 de [0,995; 0,997]. Según la prueba de McNemar, el adaptador supera significativamente a ModernBERT-large afinado y a Llama Guard 3 1B (p < 0,001) y es estadísticamente indistinguible de Aegis-Defensive 7B afinado (p = 0,06). El propio autor advierte de que entrenamiento y test provienen del mismo generador sintético, por lo que las cifras son en distribución y una línea base léxica (BM25) ya alcanza 0,90 de macro-F1 en ese test; el rendimiento sobre entradas reales será inferior.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 8 000 millones de parámetros, los requisitos son los del modelo base. En `bfloat16` (el formato del ejemplo de la model card) se necesitan aproximadamente 16 GB de VRAM para los pesos, más memoria para el contexto y el KV cache.
- En cuantización de 8 bits se estiman unos 8-9 GB de VRAM; en 4 bits, unos 5-6 GB, aunque el autor no documenta cuantizaciones específicas del adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en producción con lotes grandes; RTX 4090 (24 GB) para inferencia en `bfloat16` con margen; RTX 3090 (24 GB) también viable.
- GPU de consumo: cabe en tarjetas de 24 GB en `bfloat16` y en tarjetas de 8-12 GB si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` y `torch_dtype=torch.bfloat16`; también puede servirse con vLLM o TGI aplicando el adaptador LoRA sobre el modelo base, o convertirse a GGUF para llama.cpp/Ollama, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un clasificador con `max_new_tokens=20` y decodificación greedy (`do_sample=False`), la generación es corta y el coste dominante es el prefill del contexto de la conversación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-Guard-3-8B-ChildSafety-LoRA | 8B (base) + adaptador LoRA | no disponible | 0,996 | llama3.1 | Hugging Face (requiere acceso al base) |
| Llama Guard 3 8B (base) | 8B | no disponible | 0,683 | llama3.1 | Hugging Face (gated), Microsoft Foundry |
| OpenAI Moderation API | no disponible | no disponible | 0,623 | propietaria (API) | API de OpenAI |
| Aegis-Defensive 7B (afinado) | 7B | no disponible | estadísticamente indistinguible (p = 0,06) | no disponible | no disponible |
| Llama Guard 3 1B (afinado) | 1B | no disponible | inferior (p < 0,001) | llama3.1 | Hugging Face |

La comparación se limita al conjunto de test del propio autor; no hay datos independientes que permitan comparar estos modelos en dominios externos.

## Limitaciones y advertencias

- Es un clasificador, no un generador: la model card prohíbe explícitamente usarlo como generador de texto o para producir contenido dañino para menores.
- Sesgo de distribución: entrenamiento y test provienen del mismo generador sintético, por lo que las métricas de 0,996 de macro-F1 son en distribución y no reflejan el rendimiento sobre conversaciones reales y ruidosas; una línea base léxica ya alcanza 0,90 en ese test.
- Riesgo de alucinación en la etiqueta: al ser un modelo generativo que emite `safe`/`unsafe` más un identificador de categoría, puede producir salidas fuera de la taxonomía o categorías incorrectas; conviene validar la salida contra `taxonomy.json` en producción.
- Solo inglés: el modelo está entrenado y etiquetado únicamente para `en`; su uso en castellano u otros idiomas no está validado.
- Dependencia del modelo base: requiere acceso aprobado a `meta-llama/Llama-Guard-3-8B` (gated por Meta) y hereda sus limitaciones y su contexto.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución "Built with Llama" y política de uso aceptable); revisar antes de desplegar en producto.
- Dataset de entrenamiento de acceso restringido (gated): dificulta la reproducción completa del ajuste por terceros.
- Cobertura de edades limitada a 6-12 y 13-17 años; no se documenta comportamiento fuera de esos rangos.
- Sin métricas de latencia ni throughput publicadas, y sin validación externa independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fikeisjan/Llama-Guard-3-8B-ChildSafety-LoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-8B
- Dataset: https://huggingface.co/datasets/fikeisjan/child-safety-alignment-dataset
- Artículo (ACL Anthology): https://aclanthology.org/2026.woah-1.19/
- Código y taxonomía (GitHub): https://github.com/fikeijan/mind-the-alignment-gap
- Taxonomía en formato máquina: https://github.com/fikeijan/mind-the-alignment-gap/blob/main/taxonomy/taxonomy.json
- Llama-Guard-3-8B en Microsoft Foundry (catálogo): enlace de búsqueda web sin URL canónica estable disponible

# RicardoEstep/RPBizkit-v6-12B

## Resumen
RPBizkit-v6-12B es un modelo de lenguaje experimental de 12.247.782.400 parámetros (12,25 B) publicado por el usuario RicardoEstep en HuggingFace. No es un modelo entrenado desde cero, sino una fusión de pesos (*model merge*) construida con la herramienta mergekit a partir de 19 modelos derivados de Mistral NeMo de 12B, todos ellos orientados a roleplay y a generación de texto sin censura. El resultado es un modelo denso de tipo transformer decoder-only que hereda el tokenizador y la arquitectura de la familia Mistral NeMo.

El problema que intenta resolver es concreto y de nicho: el autor detectó en su versión anterior (v5) un fallo que denomina "The Beige Effect", por el cual las mezclas excesivamente promediadas pierden voz propia, se vuelven planas y pierden iniciativa creativa. La v6 aborda esto fusionando los modelos originales -no las mezclas intermedias- en seis partes diferenciadas, cada una con un método de fusión distinto, para preservar rasgos de inteligencia, narrativa y estilo oscuro por separado.

Es relevante ahora como ejemplo práctico de técnicas de fusión avanzadas (Karcher-Mean y DARE TIES) aplicadas a modelos de 12B con recursos limitados: el autor afirma haber ejecutado todo el proceso con solo 16 GB de RAM. Su utilidad principal está en la investigación sobre merges, el roleplay sin restricciones y la generación de datos conversacionales, no en tareas de razonamiento, código o agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Mistral NeMo (fusión de pesos, no entrenamiento) |
| Parámetros totales | 12.247.782.400 (12,25 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card; los modelos base derivan de Mistral NeMo, cuya ventana nativa es de 128.000 tokens, pero no se confirma en la información proporcionada |
| Tipos de cuantización | safetensors en bfloat16 en el repositorio principal; existe un repositorio GGUF independiente (RicardoEstep/RPBizkit-v6-12B-GGUF) cuyos niveles concretos no se detallan |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16); GGUF en repositorio aparte |
| Tokenizador | Fuente "union" (unión de los tokenizadores de los modelos fusionados) |
| Métodos de fusión | Karcher-Mean (parte 1) y DARE TIES (partes 2 y 3); partes 4 a 6 no detalladas en la información disponible |
| Modelo base declarado | DreadPoor/Krix-12B-Model_Stock, ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2, DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS y 16 modelos más |
| Tamaño del repositorio | 24,5 GB |
| Versión posterior | RicardoEstep/RPBizkit-v7-12B |
| Descargas / likes | 520 descargas, 3 likes (a fecha de actualización del 23-09-2026) |

## Arquitectura y entrenamiento
No hay entrenamiento en sentido estricto: el modelo se obtiene combinando los pesos de 19 modelos derivados de Mistral NeMo de 12B mediante mergekit. La model card documenta tres partes con distinta configuración. La parte uno ("Intelligence Core") aplica Karcher-Mean tomando DreadPoor/Krix-12B-Model_Stock como base y promediando ocho modelos con `normalize: true`, `karcher_steps: 96` y `tolerance: 1e-8`, en bfloat16. La parte dos ("Narrative Core") usa DARE TIES sobre ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2 como base, con pesos ponderados que van de 0,4 (RPMax) a 0,03 (Impish_Bloodmoon) y densidades entre 1,0 y 0,8. La parte tres ("Dark Style Core") vuelve a usar DARE TIES sobre DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS con pesos de 0,35 y 0,25 para los modelos principales. El autor afirma que todas las partes reciben la misma importancia relativa y que el proceso completo se ejecutó con 16 GB de RAM. La información proporcionada está truncada: las partes cuatro, cinco y seis -incluida la combinación final de las tres salidas- no se detallan, por lo que se desconoce el método exacto de ensamblaje final y los pesos aplicados.

Al no haber entrenamiento, no existe RLHF, DPO ni ajuste por preferencias propio: cualquier alineación o comportamiento conversacional procede de los modelos base fusionados (varios de ellos explícitamente sin censura y uno de ellos, romaingrx/red-teamer-mistral-nemo, orientado a red teaming). Tampoco hay innovaciones de decodificación (atención lineal, decodificación especulativa) documentadas; el modelo se limita a la arquitectura Mistral NeMo estándar.

## Capacidades
- Generación de texto libre y conversacional multi-turno, con foco declarado en roleplay sin censura.
- Escritura narrativa y creativa, reforzada por la parte "Narrative Core" y la parte "Dark Style Core" (estilos oscuros, góticos o explícitos).
- Generación de diálogos con voz y estilo consistentes: el objetivo explícito de la v6 es recuperar la "voz" perdida en la v5.
- Contenido para adultos: el modelo lleva la etiqueta `not-for-all-audiences` y proviene de modelos de roleplay sin filtros.
- Capacidades multilingües: no documentadas en esta ficha; los modelos base Mistral NeMo son multilingües, pero no se confirma el comportamiento real de la mezcla.
- Razonamiento, matemáticas y generación de código: no documentados ni medidos; no son el objetivo del merge y no hay evidencia de que se preserven.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso
- Roleplay interactivo sin restricciones: el modelo está diseñado específicamente para mantener personajes y conversaciones largas con contenido explícito, algo que los modelos alineados rechazan por defecto.
- Escritura de ficción adulta y narrativa oscura: la combinación de la parte narrativa (RPMax, RP-Ink, Violet Lotus) y la parte de estilo oscuro (Nera Noctis, Gilded Arsenic, Forgotten Safeword) permite generar prosa con tono definido sin la planitud típica de los promedios simples.
- Generación de diálogos para videojuegos o novelas visuales: útil para producir variantes de líneas de personaje con matices distintos, aprovechando la mezcla de voces de los 19 modelos base.
- Red teaming y pruebas de seguridad de contenido: al incorporar red-teamer-mistral-nemo y estar libre de rechazos, sirve para generar prompts o respuestas adversarias en auditorías de moderación, siempre en un entorno controlado.
- Generación de datos sintéticos conversacionales: puede producir corpus de diálogo etiquetado (tono, estilo, nivel de explicitud) para entrenar o evaluar clasificadores y filtros, con la advertencia de que no hay garantía de calidad factual.
- Investigación sobre fusión de modelos: es un caso de estudio reproducible de Karcher-Mean frente a DARE TIES sobre la misma familia de 12B, útil para comparar preservación de estilo frente a preservación de capacidad.
- Comparación de versiones de un mismo merge: al existir v5 (con "The Beige Effect") y v7, permite evaluaciones A/B sobre creatividad y consistencia de personaje usando exactamente el mismo pipeline de inferencia.
- Despliegue local para escritura creativa privada: con cuantizaciones GGUF de 4 o 5 bits cabe en GPU de consumo y permite trabajar sin enviar material sensible a una API externa.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y las búsquedas realizadas solo devuelven páginas de proveedores de inferencia (Featherless, FriendliAI) sin datos de evaluación. Los únicos indicadores objetivos disponibles son de adopción: 520 descargas y 3 likes.

## Requisitos de hardware
Estimaciones derivadas del recuento de parámetros (12,25 B); no hay mediciones publicadas por el autor.
- VRAM en bfloat16/fp16: en torno a 24,5 GB solo para los pesos, más caché KV. No cabe en una RTX 4090 de 24 GB sin offload; requiere A100 40 GB, H100 80 GB o varias GPU.
- VRAM en int8/fp8: aproximadamente 13 GB de pesos; cabe en RTX 4090, L40S, A100 40 GB. FriendliAI anuncia soporte de FP4, FP8 e INT4.
- Cuantizaciones GGUF de 4 bits: del orden de 7-8 GB, por lo que cabe en RTX 3060 12 GB, RTX 4070, RTX 4090 y en Apple Silicon con 16 GB de memoria unificada.
- Cuantizaciones GGUF de 5 bits: en torno a 8,5-9 GB; sigue cabiendo en GPU de 12 GB con contexto reducido.
- Cuantización GGUF Q8_0: aproximadamente 13 GB; requiere GPU de 16 GB o superior.
- GPU recomendadas: A100 40/80 GB y H100 para bf16 con contexto largo; RTX 4090, RTX 3090, L40S para fp8/int8; RTX 3060 12 GB o Mac con 16-32 GB para GGUF Q4/Q5.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp y Ollama a través del repositorio GGUF, vLLM por compatibilidad con la arquitectura Mistral NeMo, y servicios gestionados como Featherless y FriendliAI.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RicardoEstep/RPBizkit-v6-12B | 12,25 B | No disponible en la ficha | No disponible | safetensors + repo GGUF; 520 descargas | Merge de 19 modelos de roleplay sin censura |
| Mistral NeMo 12B Instruct (2407) | ~12 B | No disponible en la información recogida | No disponible en la información recogida | Amplia, con cuantizaciones de la comunidad | Modelo oficial de referencia de la familia; alineado y con rechazos |
| TheDrummer/UnslopNemo-12B-v4.1 | ~12 B | No disponible | No disponible | HuggingFace | Uno de los padres del merge; orientado a eliminar estilo repetitivo |
| ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2 | ~12 B | No disponible | No disponible | HuggingFace | Base de la parte narrativa; especializado en roleplay |
| ChaoticNeutrals/Nera_Noctis-12B | ~12 B | No disponible | No disponible | HuggingFace | Aporta el tono oscuro de la parte tres |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas alternativas frente a RPBizkit-v6-12B; la comparación se limita a linaje, tamaño y disponibilidad.

## Limitaciones y advertencias
- Contenido no apto para todo público: el propio autor etiqueta el modelo como `not-for-all-audiences`. Puede generar material sexual explícito, violento o perturbador sin filtros.
- Licencia no declarada: al no figurar licencia en la información disponible, no se puede asumir permiso de uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia total de evaluación: no hay benchmarks, ni evaluaciones humanas publicadas, ni comparativas con los modelos base. No hay evidencia de que el merge preserve razonamiento, matemáticas, código o seguimiento de instrucciones.
- Riesgo alto de alucinación: los modelos de roleplay no están optimizados para precisión factual y la fusión puede degradar aún más la coherencia.
- Tokenizador "union": al unir tokenizadores de 19 modelos, la plantilla de chat y el tratamiento de tokens especiales pueden comportarse de forma distinta a Mistral NeMo estándar; hay que verificar la plantilla antes de usarlo en producción.
- Contexto no verificado: aunque los modelos base soportan ventanas largas, no hay confirmación de que la mezcla mantenga ese comportamiento ni de su degradación con contextos extensos.
- Idiomas no documentados: se desconoce el rendimiento real fuera del inglés.
- El "The Beige Effect" se mitiga de forma empírica, no demostrada: el autor no aporta métricas que confirmen que la v6 recupera la voz creativa.
- Proyecto de autor único y comunidad muy reducida (520 descargas, 3 likes): sin mantenimiento garantizado, sin historial de issues y con una v7 ya publicada que reemplaza a esta versión.
- No apto para atención al cliente, entornos regulados, generación de código en producción ni sistemas agénticos: no hay soporte documentado de tool calling ni de razonamiento multi-paso, y el contenido generado puede violar políticas de uso.
- Documentación incompleta: la model card proporcionada está truncada en la parte tres, por lo que se desconoce la configuración exacta de las partes cuatro a seis y de la combinación final.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/RicardoEstep/RPBizkit-v6-12B
- Repositorio GGUF: https://huggingface.co/RicardoEstep/RPBizkit-v6-12B-GGUF
- Versión posterior (v7): https://huggingface.co/RicardoEstep/RPBizkit-v7-12B
- Página de despliegue en Featherless: https://featherless.ai/models/RicardoEstep/RPBizkit-v6-12B
- Página de despliegue en FriendliAI: https://friendli.ai/models/RicardoEstep/RPBizkit-v6-12B
- Paper de DARE TIES: https://arxiv.org/abs/2311.03099
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Media de Karcher (Wikipedia): https://en.wikipedia.org/wiki/Karcher_mean
- Modelos base citados: https://huggingface.co/DreadPoor/Krix-12B-Model_Stock, https://huggingface.co/ArliAI/Mistral-Nemo-12B-ArliAI-RPMax-v1.2, https://huggingface.co/DavidAU/MN-GRAND-Gutenberg-Lyra4-Lyra-12B-DARKNESS, https://huggingface.co/TheDrummer/UnslopNemo-12B-v4.1, https://huggingface.co/romaingrx/red-teamer-mistral-nemo, https://huggingface.co/HumanLLMs/Human-Like-Mistral-Nemo-Instruct-2407, https://huggingface.co/yamatazen/FusionEngine-12B-Lorablated, https://huggingface.co/shisa-ai/shisa-v2-mistral-nemo-12b, https://huggingface.co/Elizezen/Himeyuri-v0.1-12B, https://huggingface.co/SicariusSicariiStuff/Impish_Bloodmoon_12B, https://huggingface.co/allura-org/MN-12b-RP-Ink, https://huggingface.co/allura-org/Bigger-Body-12b, https://huggingface.co/FallenMerick/MN-Violet-Lotus-12B, https://huggingface.co/MuXodious/Wayfarer-2-12B-absolute-heresy, https://huggingface.co/ChaoticNeutrals/Nera_Noctis-12B, https://huggingface.co/ReadyArt/Forgotten-Safeword-12B-v4.0, https://huggingface.co/Lambent/Gilded-Arsenic-12B, https://huggingface.co/Delta-Vector/Ohashi-NeMo-12B, https://huggingface.co/nbeerbower/Mistral-Nemo-12B-abliterated-LORA

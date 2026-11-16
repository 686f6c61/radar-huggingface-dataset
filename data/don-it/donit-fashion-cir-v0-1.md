# DON-IT/donit-fashion-cir-v0.1

## Resumen

DON IT Fashion CIR Hybrid v0.1 es un sistema de recuperación de imágenes de moda por composición (composed image retrieval, CIR): recibe una imagen de referencia de una prenda y una edición en lenguaje natural (por ejemplo, "el mismo vestido pero con un cuello más alto") y devuelve imágenes de moda que satisfacen el cambio solicitado. Lo desarrolla DON-IT y se publica como una *research release*: la model card documenta el sistema evaluado y sus resultados, pero advierte explícitamente de que los pesos y el código de inferencia ejecutable aún no se han subido al repositorio.

No es un checkpoint único entrenado de principio a fin, sino un sistema híbrido de inferencia. Combina el embedding foundation Qwen3-VL-Embedding-8B con una adaptación LoRA de consulta de moda de DON IT, los embeddings imagen/texto de Marqo FashionSigLIP con una cabeza composicional entrenada por DON IT, una nueva cabeza residual de recuperación de 768 dimensiones destilada del checkpoint CSMCIR, y el propio checkpoint CSMCIR de terceros, que sigue siendo necesario en inferencia. La fusión final es fija: 70/30 en la primera rama (Qwen/SigLIP normalizados) y RRF 50/50 con constante de rango 60 para combinar esa rama con CSMCIR.

Su relevancia es doble. Por un lado, ataca una tarea específica de comercio electrónico (búsqueda visual de moda con modificaciones textuales) donde los benchmarks públicos son escasos y las galerías por categoría son grandes. Por otro, la model card es inusualmente honesta en su metodología: separa el entrenamiento de la evaluación, documenta intervalos de confianza bootstrap y reconoce que la mejora sobre su híbrido anterior no es estadísticamente concluyente. El idioma declarado es inglés y la licencia no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema híbrido de recuperación multimodal: embeddings Qwen3-VL-Embedding-8B con LoRA de consulta + FashionSigLIP (Marqo) con cabeza composicional + cabeza residual de 768 dimensiones + checkpoint CSMCIR de terceros; fusión por RRF |
| Parámetros totales | no disponible (sistema compuesto por varios modelos; no se declara un recuento agregado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no se han subido al repositorio según la model card) |

## Arquitectura y entrenamiento

El sistema es una composición de cinco piezas. La primera rama usa Qwen3-VL-Embedding-8B como foundation de embeddings, con una adaptación LoRA de consulta de moda de DON IT (checkpoint de 600 pasos). La segunda rama emplea FashionSigLIP de Marqo para embeddings imagen/texto junto con una cabeza composicional de consulta entrenada por DON IT sobre tripletas humanas. Sobre esa base se añade una nueva cabeza residual acotada de 768 dimensiones, destilada a partir de las señales de ranking auténticas del conjunto TRAIN-FIT de FashionIQ que produce el checkpoint CSMCIR publicado. El checkpoint CSMCIR de terceros se mantiene obligatorio en inferencia. La combinación final usa pesos fijos de 70% Qwen y 30% SigLIP sobre las puntuaciones normalizadas de la primera rama, y una fusión RRF 50/50 con constante de rango 60 entre esa rama y CSMCIR; ninguno de los pesos se ajustó con etiquetas de validación pública de FashionIQ.

El entrenamiento de la cabeza estudiante se realizó sobre señales del profesor CSMCIR congelado, evaluado sobre 12.917 pares humanos de origen TRAIN de FashionIQ. La estudiante se entrenó durante 600 pasos reales de optimizador en una A10G, y se eligió el checkpoint del paso 200 usando 896 ejemplos de source-SELECTION disjuntos a nivel de foto. La evaluación de origen reporta mejoras en tres conjuntos: SELECTION (48,5741 a 51,8564 R@10), CONFIRMATION con 867 consultas humanas (53,8286 a 55,3306 R@10, +1,5021 pp, IC95% +0,1905 a +2,8584 pp) y DEV original independiente con 362 consultas sobre 7.530 imágenes de galería (64,4286 a 66,0332 R@10, +1,6046 pp, IC95% +0,0360 a +3,4582 pp). La model card advierte que la cabeza FashionSigLIP preexistente ya se había seleccionado sobre el DEV original, por lo que ese conjunto solo es independiente para los parámetros nuevos de la estudiante. No se documentan datos sobre tokens de entrenamiento, composición completa del dataset ni uso de RLHF o DPO.

## Capacidades

- Recuperación de imágenes de moda por composición: dada una imagen de referencia y una edición textual, devuelve un ranking de imágenes candidatas que cumplen la modificación.
- Recuperación multimodal imagen-texto mediante embeddings conjuntos (Qwen3-VL-Embedding-8B y FashionSigLIP).
- Ranking por categoría de prenda: el sistema está evaluado sobre vestidos, camisas y tops/camisetas, con galerías específicas por categoría.
- Exclusión de la imagen de referencia de la consulta en el ranking de candidatas.
- Fusión de puntuaciones entre ramas heterogéneas mediante normalización y Reciprocal Rank Fusion.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidad multilingüe: no disponible; el idioma declarado es únicamente inglés.

## Casos de uso

- Búsqueda visual en catálogos de moda: un usuario sube una foto de una prenda y escribe "lo mismo pero en azul marino"; el sistema ordena el catálogo por similitud composicional. Es adecuado porque la tarea y las galerías por categoría (vestidos, camisas, tops) coinciden con las evaluadas.
- Recomendación de alternativas en tienda online: a partir de una prenda vista, generar variantes con cambio de escote, manga o estampado usando la edición textual, aprovechando que el sistema está entrenado sobre pares humanos de FashionIQ.
- Enriquecimiento de fichas de producto: recuperar imágenes similares del propio catálogo para completar metadatos o detectar duplicados visuales con modificaciones descritas en lenguaje natural.
- Moderación y control de catálogo: verificar que las imágenes devueltas para una consulta composicional pertenecen a la categoría correcta, dado que el sistema se evalúa con galerías de misma categoría.
- Investigación en recuperación multimodal: servir como referencia metodológica y baseline reproducible para CIR de moda, con métricas R@10 y R@50 por categoría e intervalos bootstrap documentados.
- Prototipado de asistentes de estilismo: combinar la consulta composicional con un LLM externo que traduzca peticiones del usuario ("algo como esto pero más formal") a ediciones textuales que el sistema pueda consumir.
- Evaluación comparativa de embeddings de moda: usar las ramas Qwen y FashionSigLIP por separado para medir la contribución de cada foundation en tareas de recuperación de prendas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre validación original de FashionIQ: 6.016 consultas humanas reales y 15.536 imágenes en tres galerías exactas de misma categoría. La macro Recall es la media no ponderada de dress, shirt y top/tee.

| Sistema | R@10 | R@50 | Interpretación |
|---|---:|---:|---|
| Rama previa DON IT Qwen + FashionSigLIP entrenada | 55,9824 | — | Baseline congelado sin CSMCIR |
| Nueva estudiante DON IT + Qwen, sin CSMCIR | 56,3506 | — | Estudiante entrenada sin modelo externo |
| Checkpoint oficial CSMCIR reproducido | 57,4647 | — | Modelo externo publicado, evaluado localmente |
| Híbrido previo DON IT + CSMCIR, RRF60 fijo | 59,4046 | 79,3201 | Híbrido histórico congelado |
| Híbrido con estudiante entrenada + CSMCIR, RRF60 fijo | 59,5716 | 79,4064 | Resultado principal |
| FactEmbed publicado en validación FashionIQ | 57,71 | 76,87 | Resultado de paper, no reejecutado localmente |

Desglose por categoría del resultado principal frente al híbrido previo:

| Categoría | Consultas | Imágenes de galería | Híbrido previo R@10 | Híbrido con estudiante R@10 |
|---|---:|---:|---:|---:|
| Dress | 2.017 | 3.817 | 54,6852 | 55,1314 |
| Shirt | 2.038 | 6.346 | 59,2247 | 59,1266 |
| Tops & tees | 1.961 | 5.373 | 64,3039 | 64,4569 |

El híbrido principal supera el punto publicado de FactEmbed en R@10 en +1,8616 puntos porcentuales, pero se trata de una comparación entre publicaciones distintas, no de una reejecución independiente sobre el mismo artefacto de galería y el mismo código de evaluación. La mejora sobre el híbrido previo de DON IT es de +0,1670 pp, con intervalo bootstrap del 95% pareado por clúster de referencia de [-0,0721, +0,4010] pp, que cruza cero: la superioridad no está estadísticamente establecida. El sistema retrocede en camisas. Las métricas están marcadas como no verificadas en el model-index.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El sistema incluye un foundation de 8B parámetros (Qwen3-VL-Embedding-8B) más FashionSigLIP y el checkpoint CSMCIR, pero no se publican requisitos agregados ni configuraciones de cuantización.
- GPU recomendadas: no disponible para el sistema completo. El único dato de hardware documentado es el entrenamiento de la cabeza estudiante: 600 pasos de optimizador en una NVIDIA A10G.
- ¿Cabe en GPU de consumo? no disponible. Por el componente de 8B, un despliegue completo en GPU de consumo requeriría cuantización, y no se documenta ninguna.
- Opciones de despliegue: no disponible. La model card indica que los pesos y el código de inferencia ejecutable no se han subido al repositorio, por lo que no se puede desplegar tal cual con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | R@10 FashionIQ val | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DON IT Fashion CIR Hybrid v0.1 | Híbrido de recuperación (Qwen3-VL-Embedding-8B + SigLIP + CSMCIR) | no disponible (incluye foundation de 8B) | no disponible | 59,5716 (declarado, no verificado) | no disponible | Pesos no subidos; solo model card |
| CSMCIR | Checkpoint CIR de terceros | no disponible | no disponible | 57,4647 (reproducido localmente por DON IT) | no disponible | Publicado |
| FactEmbed | Modelo CIR | no disponible | no disponible | 57,71 (resultado de paper) | no disponible | Publicado |
| Rama DON IT Qwen + FashionSigLIP | Rama de recuperación sin CSMCIR | no disponible | no disponible | 55,9824 | no disponible | Componente del sistema |

La comparación con FactEmbed es entre publicaciones distintas y no una reejecución sobre el mismo artefacto de evaluación; la model card lo señala explícitamente.

## Limitaciones y advertencias

- Los pesos y el código de inferencia ejecutable no están subidos al repositorio: el sistema no es desplegable directamente a partir de esta publicación.
- El resultado completo de 59,57% requiere componentes de terceros (Qwen3-VL-Embedding-8B, FashionSigLIP de Marqo y el checkpoint CSMCIR); DON IT no es autor del foundation ni de CSMCIR.
- Las métricas son autodeclaradas y no verificadas por Hugging Face ni por un organizador de benchmark; el model-index las marca como `verified: false`.
- La mejora sobre el híbrido previo (+0,1670 pp) tiene un intervalo bootstrap del 95% que cruza cero: no hay superioridad estadísticamente establecida.
- Retroceso medido en la categoría de camisas (59,2247 a 59,1266 R@10).
- La comparación con FactEmbed es un punto de publicación cruzado, no una reejecución independiente con el mismo código y galería.
- La cabeza FashionSigLIP preexistente ya se había seleccionado sobre el DEV original, por lo que ese conjunto solo es independiente para los parámetros nuevos de la estudiante.
- Evaluado únicamente sobre validación pública original de FashionIQ, no sobre un test oculto no visto.
- La tarea evaluada es recuperación composicional de prendas, no recuperación general de imágenes ni generación.
- Idioma declarado únicamente inglés; no se documenta soporte multilingüe.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento fuera del dominio de moda; al ser un sistema de recuperación, el riesgo principal es el ranking incorrecto de candidatas, no la generación de texto.
- El estado de *research release* implica que la API, los componentes y las rutas de inferencia pueden cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DON-IT/donit-fashion-cir-v0.1
- Qwen3-VL-Embedding-8B (componente foundation): no disponible en la información proporcionada
- Marqo FashionSigLIP (componente de embeddings): no disponible en la información proporcionada
- Checkpoint CSMCIR (componente de terceros): no disponible en la información proporcionada
- Dataset FashionIQ: no disponible en la información proporcionada
- Paper FactEmbed (referencia comparativa): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada

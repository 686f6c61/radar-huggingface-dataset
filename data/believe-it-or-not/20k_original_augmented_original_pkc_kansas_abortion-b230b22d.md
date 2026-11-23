# believe-it-or-not/20k_original_augmented_original_pkc_kansas_abortion-b230b22d

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante instructiva del Llama 3.3 de 70 000 millones de parámetros de Meta. El adaptador lo publica el usuario `believe-it-or-not` y su nombre sugiere un ajuste fino orientado a un conjunto de datos de 20 000 ejemplos relacionados con el tema del aborto en Kansas, con variantes "original" y "augmented". No se trata de un modelo completo, sino de un conjunto de pesos delta que debe combinarse con el modelo base para su uso.

El repositorio tiene un tamaño de 1,7 GB, coherente con un adaptador LoRA de rango moderado sobre un modelo de 70B. La model card está prácticamente vacía: todos los campos de descripción, uso, entrenamiento y evaluación figuran como "[More Information Needed]", por lo que no hay información verificable sobre el proceso de entrenamiento, los hiperparámetros, la composición del dataset ni los resultados.

La relevancia de esta ficha es limitada y principalmente documental: se trata de un artefacto de ajuste fino de nicho, sin descargas ni likes, sin licencia declarada y sin evaluación publicada. Resulta útil como ejemplo de adaptadores LoRA sobre Llama 3.3 70B y como advertencia sobre la necesidad de auditar artefactos de Hugging Face sin documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.3 70B Instruct) |
| Parametros totales | no disponible (el adaptador pesa 1,7 GB; el modelo base tiene 70B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en el repo) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.15.1 |
| Modelo base | togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference |
| Tamano del repo | 1,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) gestionado con la librería PEFT en versión 0.15.1. La arquitectura subyacente es la del modelo base, un transformer decoder-only de Llama 3.3 con 70 000 millones de parámetros en configuración instructiva (presumiblemente con ajuste por instrucciones y preferencias, aunque la referencia "Reference" del nombre del modelo base no está documentada en este repositorio). El adaptador modifica un subconjunto de matrices de pesos mediante descomposiciones de bajo rango, lo que explica su tamaño de 1,7 GB frente a los aproximadamente 140 GB en fp16 del modelo completo.

No hay información sobre el dataset de entrenamiento más allá de lo que sugiere el nombre del repositorio: "20k_original_augmented_original_pkc_kansas_abortion". No se especifican el número de tokens, la composición del corpus, si hubo aumento de datos ("augmented"), ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan hiperparámetros como el rango LoRA, el alpha, el dropout, la tasa de aprendizaje o el número de épocas. La model card no incluye ninguna innovación técnica declarada.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Llama 3.3 70B Instruct, condicionados por el ajuste fino del adaptador.
- Ajuste específico de dominio orientado al tema indicado en el nombre del repositorio (aborto en Kansas), sin documentación que confirme el alcance real.
- Soporte potencial de tool calling y function calling, si el modelo base lo conserva tras el ajuste (no verificado).
- Capacidades multilingües potenciales del modelo base, no garantizadas ni documentadas para este adaptador.
- No se declaran capacidades de visión, audio ni modo "thinking" específicas.

## Casos de uso

- Investigación sobre ajuste fino con LoRA: el adaptador sirve como ejemplo práctico de cómo se estructura un repositorio PEFT sobre Llama 3.3 70B, útil para estudiar convenciones de nombres y metadatos.
- Auditoría de artefactos de Hugging Face: permite ilustrar los riesgos de publicar adaptadores sin model card, sin licencia y sin evaluación, y diseñar protocolos de revisión.
- Reproducción de experimentos de ajuste de dominio: si se dispone del dataset original (no incluido), podría reproducirse el entrenamiento para estudiar el efecto del aumento de datos.
- Análisis de sesgo temático: un adaptador especializado en un tema sensible como el aborto puede emplearse en estudios de sesgo y alineación, siempre con supervisión y evaluación previa.
- Docencia sobre PEFT: como caso de estudio de un adaptador de bajo rango con pesos en safetensors y tamaño reducido frente al modelo base.
- Pruebas de integración de pipelines PEFT: verificar la carga del adaptador con `PeftModel.from_pretrained` sobre el modelo base en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,7 GB en disco, pero la inferencia requiere cargar el modelo base Llama 3.3 70B completo.
- VRAM estimada para el modelo base: aproximadamente 140 GB en fp16, unos 70 GB en int8 y en torno a 35-40 GB en cuantizaciones de 4 bits (estimaciones estándar para 70B, no verificadas para este adaptador).
- GPU recomendadas: múltiples A100 80 GB o H100 80 GB para fp16; una sola A100 80 GB o H100 para int8; RTX 4090 (24 GB) solo viable con cuantización agresiva de 4 bits y posible offloading.
- No cabe en GPU de consumo sin cuantización extrema y gestión de memoria fuera de la GPU.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el modelo base cuantizado, con carga del adaptador LoRA mediante las utilidades PEFT correspondientes (la compatibilidad exacta con cada backend no está documentada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama 3.3 70B) | 70B (base) | no disponible | no disponible | Hugging Face, 0 descargas | Sin model card ni evaluación |
| Llama 3.3 70B Instruct (Meta) | 70B | no disponible en esta ficha | Llama 3.3 Community License | Ampliamente disponible | Modelo base de referencia, con evaluación oficial publicada por Meta |
| Adaptadores LoRA comunitarios sobre Llama 3.1/3.3 | 70B (base) | depende del base | variable | Hugging Face | Ecosistema amplio; calidad muy variable según documentación |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide validar el comportamiento del adaptador.
- Licencia no declarada: no se puede confirmar el uso comercial ni las obligaciones de atribución; además, el modelo base Llama 3.3 tiene su propia licencia comunitaria que puede imponer restricciones.
- Riesgo elevado de alucinación y de comportamientos no deseados al tratarse de un ajuste de dominio no evaluado.
- Tema sensible: el dominio (aborto en Kansas) puede implicar sesgos, posturas editoriales o contenido polarizado no documentado.
- Sin datos sobre idiomas soportados; no se garantiza un rendimiento adecuado en castellano.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente ni de que los pesos estén íntegros.
- No apto para producción sin una evaluación exhaustiva previa, auditoría de sesgos y verificación de licencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/20k_original_augmented_original_pkc_kansas_abortion-b230b22d
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Librería PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700

# SargeDev/Edge0-Cyber-Uncensored-nvfp4-v2

## Resumen

Edge0-Cyber-Uncensored-nvfp4-v2 es una derivación comunitaria del modelo Edge0-145B-NVFP4, publicada por el usuario SargeDev. Se trata de un build "abliterated": se han proyectado fuera de los pesos dos direcciones de rechazo (una general y otra específica del dominio de ciberseguridad) para reducir la tasa de negativas del modelo ante peticiones que el modelo base rechazaría. El resultado es un modelo que responde a un mayor porcentaje de prompts considerados dañinos según el conjunto de evaluación mlabonne, manteniendo intacto el resto del pack de pesos.

El modelo se distribuye con la librería `edge0`, una arquitectura MoE latente con expertos cuantizados en NVFP4, una tabla de n-gramas de 51,2 GB, proyecciones latentes y una cabeza de borrador MTP (multi-token prediction). El repositorio ocupa 113,8 GB e incluye 4.947.698.560 parámetros en safetensors, aunque la designación "145B" del modelo base sugiere que el cómputo efectivo es mayor que el recuento de tensores del artefacto publicado.

Es relevante ahora porque ejemplifica una tendencia de builds comunitarios orientados a eliminar salvaguardas mediante manipulación directa de pesos, con una metodología de medición explícita (dos pasadas de abliteración, conjuntos de prueba documentados y resultados publicados en el repositorio). La licencia `edge0-community-model-1.0` restringe el uso, y el propio autor advierte que se trata de un derivado no oficial para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE latente (latent-moe) con expertos en NVFP4 y cabeza MTP |
| Parametros totales | 4.947.698.560 (safetensors publicados; modelo base designado como 145B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos), 4-bit |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-1.0 (licencia "other") |
| Formato de pesos | GGUF (`model-skeleton.gguf`) y pool de expertos NVFP4; safetensors en el repo |

## Arquitectura y entrenamiento

El modelo base Edge0-145B-NVFP4 emplea una arquitectura MoE latente con expertos cuantizados en NVFP4, complementada con una tabla de n-gramas de 51,2 GB, proyecciones latentes y una cabeza de borrador MTP para decodificación especulativa. El build derivado modifica exactamente un archivo, `model-skeleton.gguf`: 97 tensores tienen proyectada fuera la dirección general de rechazo (primera pasada) y 12 de ellos además una segunda dirección específica de ciberseguridad, medida sobre las activaciones del propio modelo tras la primera pasada y ortogonal a ella por construcción. El cambio relativo por tensor de la segunda pasada oscila entre el 1,87 % y el 2,97 % de la norma del tensor (mediana 2,29 %).

El resto del pack (pool de expertos de 47,6 GB, tabla de n-gramas, proyecciones latentes, tokenizador y cabeza MTP) es byte-idéntico al modelo base, verificado mediante `CHECKSUMS.txt`. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La metodología de abliteración es puramente de manipulación de pesos, sin vectores de control ni parches en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y respuesta a peticiones del dominio de ciberseguridad (el segundo build amplía la cobertura frente a v1, incluida la generación de reverse shells C2 en una de dos ejecuciones).
- Capacidad de agente y tool calling: los tags incluyen `agent` y `endpoints_compatible`.
- Generación de código (`coding` en los tags).
- Modo de pensamiento (thinking mode) con activación/desactivación; las evaluaciones se realizaron con thinking off y 256 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio y búsqueda en tiempo real: no soportadas según la propia model card (los 15/16 "no" del conjunto harmless corresponden a límites del modelo, no a rechazos de seguridad).

## Casos de uso

- Investigación en seguridad de modelos: el build permite estudiar cómo la proyección de direcciones de rechazo afecta a la tasa de negativas, con conjuntos de evaluación documentados y resultados reproducibles en `abliteration/results/`.
- Evaluación de robustez de salvaguardas: útil para medir la eficacia de mecanismos de seguridad frente a manipulación de pesos y comparar con el modelo base y con v1.
- Desarrollo de agentes autónomos en entornos controlados: los tags `agent` y `endpoints_compatible` permiten integrarlo en pipelines de agentes que requieran respuestas sin filtrado en dominios técnicos.
- Generación de código en laboratorio: adecuado para probar pipelines de generación asistida donde se necesite estudiar el comportamiento del modelo sin rechazos en tareas de programación.
- Análisis de dominios de riesgo (bio, cyber): el modelo permite medir qué clases de peticiones siguen siendo rechazadas (self-harm, menores, sexual, odio, violencia, fabricación de armas) y cuáles se han abierto, como insumo para políticas de moderación.
- Formación y divulgación: como ejemplo didáctico de metodología de abliteración con dos pasadas y validación por lectores independientes.

## Benchmarks y rendimiento

| Conjunto | Modelo base (stock) | v1 (una pasada) | v2 (dos pasadas) |
|---|---|---|---|
| mlabonne, 520 dañinos (rechazos) | 519 | 319 | 329 |
| mlabonne, 520 dañinos (no reales de seguridad) | 517 | 307 | 314 |
| mlabonne, 520 inofensivos (rechazos) | 15 | 15 | 16 |
| Conjunto cyber (8 prompts) | no disponible | 7/8 | 8/8 (segunda ejecución), 7/8 (primera) |
| Conjunto bio (8 prompts) | no disponible | 5/8 | 3/8 |
| Conjunto safe (6 prompts) | no disponible | 6/6 | 6/6 |
| Conjunto seguridad 25 prompts (lectura completa) | no disponible | 25/25 | 23/25 |
| Reverse shell C2 | no disponible | RECHAZADO | RECHAZADO (1.ª ejecución), ENTREGADO (2.ª ejecución) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el pool de expertos NVFP4 ocupa 47,6 GB y la tabla de n-gramas 51,2 GB, lo que implica un requisito agregado muy superior a 100 GB si se cargan ambos en memoria.
- GPU recomendadas: NVIDIA con soporte CUDA 13 (el build NVFP4 es CUDA-only); no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Consumer GPU: no cabe en GPUs de consumo convencionales dado el tamaño del pool de expertos y la tabla de n-gramas.
- Opciones de despliegue: motor `edge0` (librería propia), endpoints compatibles; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Abliterated | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-Cyber-Uncensored-nvfp4-v2 (este) | 4.947.698.560 (safetensors); base 145B | no disponible | edge0-community-model-1.0 | Sí (dos pasadas) | Hugging Face, 0 descargas |
| Edge0-Cyber-Uncensored-nvfp4 (v1) | no disponible | no disponible | edge0-community-model-1.0 | Sí (una pasada) | Hugging Face |
| Edge0-145B-NVFP4 (base) | 145B (designación) | no disponible | no disponible | No | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar rendimiento entre estos modelos; la comparación disponible se limita a las tasas de rechazo del conjunto mlabonne y a los conjuntos cyber/bio/safe documentados en la model card.

## Limitaciones y advertencias

- El propio autor advierte: "Use at your own risk". Es un derivado comunitario, no una release oficial de Edge0, y SargeDev no se responsabiliza de las salidas ni del uso que se haga de ellas.
- El modelo sigue rechazando las categorías consideradas más sensibles: autolesión, menores, contenido sexual, odio, violencia, fabricación de armas y agentes nombrados. La abliteración no elimina estos rechazos.
- Riesgo elevado de generación de contenido dañino en el dominio cyber (reverse shells, C2) y bio, con resultados inconsistentes entre ejecuciones (el C2 se rechazó en la primera y se entregó en la segunda).
- La segunda dirección de abliteración no reduce los rechazos generales más allá del ruido entre ejecuciones (307 vs. 314); el propio autor lo califica como el hallazgo honesto del trabajo.
- La tercera dirección medida sobre el dominio bio no cambió ningún rechazo: los "no" restantes de esa clase no son accesibles por este método.
- Licencia `edge0-community-model-1.0`: restricciones de uso comercial no detalladas en la información disponible; revisar `LICENSE` antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Requiere CUDA 13 y NVIDIA; sin soporte documentado para otras plataformas.
- Sin descargas ni likes en el momento de la consulta; sin validación independiente más allá de la publicada por el autor.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Edge0-Cyber-Uncensored-nvfp4-v2
- Build v1: https://huggingface.co/SargeDev/Edge0-Cyber-Uncensored-nvfp4
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Resultados de abliteración: `abliteration/results/` (dentro del repositorio)
- Metodología de lectura: `abliteration/README.md` (dentro del repositorio)
- Verificación de integridad: `CHECKSUMS.txt` (dentro del repositorio)

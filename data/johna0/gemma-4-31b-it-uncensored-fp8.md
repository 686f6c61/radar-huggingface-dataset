# JohnA0/gemma-4-31B-it-uncensored-FP8

## Resumen

JohnA0/gemma-4-31B-it-uncensored-FP8 es una variante del modelo google/gemma-4-31B-it a la que se le ha aplicado una técnica de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) y posteriormente se ha cuantizado a FP8 mediante compressed-tensors. El objetivo declarado es eliminar el comportamiento de rechazo del modelo base manteniendo la calidad general de las respuestas, de modo que el modelo responda a peticiones que el original rechazaría.

El modelo conserva la arquitectura y el tamaño del original: 31.273.088.876 parámetros totales (aproximadamente 31,3 mil millones) en formato safetensors, con un repositorio de 33,3 GB. Está pensado para generación de texto conversacional y, según las etiquetas del repositorio, también admite entrada imagen-texto (image-text-to-text), aunque la model card no detalla capacidades de visión.

La relevancia de esta ficha es doble: por un lado documenta un caso de modificación de pesos orientada a reducir rechazos; por otro, ilustra el uso de cuantización FP8 con compressed-tensors para reducir el coste de despliegue de un modelo de más de 31 mil millones de parámetros. La licencia declarada es apache-2.0, aunque conviene verificar las condiciones del modelo base de Google antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-31B-it; detalles internos no disponibles) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base se carga en bf16 para el proceso de abliteration |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizado FP8 con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer de aproximadamente 31,3 mil millones de parámetros. Sobre ese modelo base no se ha realizado un entrenamiento adicional desde cero: la modificación consiste en una abliteration aplicada sobre los pesos. El método descrito es una biprojected abliteration con preservación de norma (norm-preserving biprojected abliteration, atribuida a grimjim, noviembre de 2025). Cada fila de pesos se descompone en magnitud y dirección; la dirección de rechazo se proyecta fuera únicamente del componente de dirección y luego se recombina con la magnitud original, garantizando que la norma de los pesos nuevos sea igual a la de los originales.

El pipeline concreto incluye: carga del modelo en bf16 con adaptadores LoRA en o_proj y mlp.down_proj; recogida de activaciones residuales para 400 prompts dañinos y 400 inofensivos (datasets de mlabonne); winsorización de activaciones en el percentil 99,5 para limitar valores atípicos de GeGLU propios de la familia Gemma; cálculo de una dirección de rechazo por capa como normalize(mean(harmful) - mean(harmless)); ortogonalización de cada dirección contra la media de los prompts inofensivos mediante Gram-Schmidt de doble pasada; aplicación de la modificación con preservación de norma en o_proj y down_proj de todas las capas; y fusión de los adaptadores LoRA en los pesos base para obtener nombres de tensor limpios y compatibles con GGUF. Los parámetros declarados son: 100 % de capas abliteradas, escala 1.0 y winsorización 0.995. El autor indica que este enfoque difiere de la herramienta heretic en el uso de biproyección con preservación de norma, direcciones por capa en lugar de una global, una pasada determinista única en lugar de búsqueda Optuna de 50 ensayos, y fusión de LoRA antes de guardar.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat aplicable mediante apply_chat_template.
- Respuesta a peticiones que el modelo base rechazaría: según la model card, la tasa de rechazo efectiva baja a 1/100 en el conjunto de mlabonne y a 22/686 (3,2 %) en validación cruzada de cuatro datasets.
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo base, aunque no se aportan benchmarks específicos en la información disponible.
- Entrada imagen-texto: el repositorio incluye la etiqueta image-text-to-text, pero la model card no describe el soporte de visión ni sus límites.
- Tool calling y function calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta explícitamente; depende de las capacidades del modelo base.
- Multilingüismo: limitado a inglés según el campo language del repositorio.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo varía la tasa de rechazo tras una abliteration y comparar con el modelo base, usando los conjuntos JailbreakBench, tulu-harmbench, NousResearch/RefusalDataset y mlabonne/harmful_behaviors como referencia.
- Evaluación de técnicas de edición de pesos: sirve para reproducir y auditar el pipeline de biproyección con preservación de norma descrito por el autor, comparando la divergencia KL (0,124 declarada) frente al original.
- Despliegue de un modelo de 31B en FP8: la cuantización FP8 con compressed-tensors reduce el peso en memoria respecto a bf16, lo que facilita servir el modelo en infraestructura con VRAM limitada.
- Generación de texto creativo sin filtros de rechazo: para entornos controlados de escritura o guionización donde el modelo base interrumpiría con negativas.
- Red teaming y pruebas de robustez: útil para generar respuestas a prompts adversarios y medir la eficacia de sistemas de moderación externos.
- Experimentación académica con modelos grandes: al estar en transformers y safetensors, se integra en pipelines de investigación existentes sin necesidad de conversiones adicionales.
- Base para posteriores ajustes: al tener nombres de tensor limpios tras la fusión de LoRA, puede servir como punto de partida para fine-tuning o para conversión a otros formatos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Los únicos datos aportados son métricas del proceso de abliteration:

| Metrica | Antes | Despues |
|---|---|---|
| Rechazos (mlabonne, 100 prompts) | 100/100 | 1/100 efectivo (5 marcados, 4 rechazo-y-luego-responde) |
| Rechazos (cross-dataset, 686 prompts) | no disponible | 22/686 (3,2 %) |
| Divergencia KL | 0 (baseline) | 0,124 |
| Calidad (ratio de longitud de respuesta inofensiva) | 1,0 | ~1,01 |

Desglose de validación cruzada:

| Dataset | Prompts | Rechazos |
|---|---|---|
| JailbreakBench | 100 | 5/100 |
| tulu-harmbench | 320 | 5/320 |
| NousResearch/RefusalDataset | 166 | 7/166 |
| mlabonne/harmful_behaviors | 100 | 5/100 |
| Total | 686 | 22/686 (3,2 %) |

El autor indica que cada rechazo marcado fue auditado manualmente y que la mayoría son falsos positivos del tipo "rechazo y luego responde", en los que el modelo añade un descargo de identidad de IA y después contesta. No se han publicado resultados de benchmarks de capacidad (razonamiento, código, matemáticas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 31,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda contar con 40 GB o más para contextos moderados.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Para FP8 nativo conviene hardware con soporte de FP8 (Hopper o Ada Lovelace).
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP8 sin offloading o cuantización adicional; sería necesario convertir a formatos de 4 bits (no incluidos en este repositorio) para intentar encajarlo en 24 GB, lo que no está documentado por el autor.
- Opciones de despliegue: transformers con dtype bf16 o carga FP8 vía compressed-tensors; vLLM y TGI no están confirmados en la información disponible; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| JohnA0/gemma-4-31B-it-uncensored-FP8 | 31,3 B | no disponible | apache-2.0 | safetensors FP8 | Abliteration + cuantización FP8 |
| google/gemma-4-31B-it | 31,3 B | no disponible | condiciones de Gemma (verificar) | safetensors | Modelo base con rechazos intactos |
| TrevorJS/gemma-4-31B-it-uncensored | 31,3 B | no disponible | apache-2.0 (declarada) | safetensors (bf16) | Misma abliteration sin cuantizar; citado en la model card |
| Heretic (herramienta) | no aplica | no aplica | no disponible | no aplica | Pipeline alternativo de abliteration con búsqueda Optuna |

No se dispone de datos de benchmarks comparativos de capacidad entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo responderá a peticiones dañinas en la mayoría de casos, lo que lo hace inadecuado para aplicaciones de cara al público sin moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; la abliteration puede alterar el comportamiento del modelo base de formas no medidas más allá de la divergencia KL de 0,124.
- Sesgos: no se documentan evaluaciones de sesgo; se heredan los del modelo base, no caracterizados en la información disponible.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está verificado.
- Contexto: la longitud de contexto no se especifica en el repositorio.
- Licencia: se declara apache-2.0, pero el modelo deriva de google/gemma-4-31B-it, cuyas condiciones de uso deben revisarse antes de un despliegue comercial; la compatibilidad de la licencia declarada con la del base no está verificada en la información disponible.
- Formato FP8: requiere soporte de compressed-tensors; no hay GGUF ni versiones de 4 bits en el repositorio, lo que limita el despliegue en hardware de consumo.
- Madurez: el repositorio tiene 8 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- Uso responsable: conviene auditar las respuestas y aplicar filtros externos si el modelo se integra en cualquier producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnA0/gemma-4-31B-it-uncensored-FP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Variante bf16 citada en la model card: https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored
- Blog sobre norm-preserving biprojected abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Repositorio de investigación citado: https://github.com/TrevorS/gemma-4-abliteration
- Herramienta heretic: https://github.com/p-e-w/heretic
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Dataset tulu-harmbench: https://huggingface.co/datasets/allenai/tulu-3-harmbench-eval
- Dataset NousResearch/RefusalDataset: https://huggingface.co/datasets/NousResearch/RefusalDataset
- Dataset mlabonne/harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Perfil de mlabonne: https://huggingface.co/mlabonne

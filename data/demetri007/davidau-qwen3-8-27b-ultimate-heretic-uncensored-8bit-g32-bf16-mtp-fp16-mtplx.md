# demetri007/DavidAU-Qwen3.8-27B-Ultimate-Heretic-Uncensored-8Bit-g32-BF16-MTP-FP16-MTPLX

## Resumen

DavidAU-Qwen3.8-27B-Ultimate-Heretic-Uncensored-8Bit-g32-BF16-MTP-FP16-MTPLX es una publicacion derivada (un merge o fine-tune de la familia DavidAU) subida por el usuario demetri007 a Hugging Face. El nombre indica que parte de una base Qwen3.8 de 27B de parametros, sobre la que se ha aplicado el proceso que el autor original denomina "Heretic" (eliminacion de alineamiento y rechazos, es decir, una variante sin censura) y una combinacion de tecnicas de fusion con otras variantes de la familia (Ultimate, MTP). El repositorio pesa 30,4 GB y solo contiene pesos en safetensors, sin pipeline declarado ni idiomas especificados.

La model card publicada por demetri007 es practicamente vacia: unicamente repite la licencia apache-2.0, sin descripcion, sin datos de entrenamiento, sin benchmarks ni instrucciones de uso. La informacion disponible sobre el modelo original (DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored) es igualmente escasa y se limita a enlaces de la propia plataforma y a una variante GGUF con el sufijo "Turbo-Brilliance-50x-AGI-NEO".

Por tanto, esta ficha se limita a documentar lo verificable: identificador, tamano del repositorio, formato de pesos, licencia declarada y la naturaleza derivada del modelo. Cualquier dato de arquitectura interna, contexto, datos de entrenamiento o rendimiento debe considerarse no disponible y no verificable a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen3.8, sin confirmar) |
| Parametros totales | 27B (segun el nombre del modelo, no verificado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos publicados en 8 bits (sufijo "8Bit") y BF16/FP16 segun el nombre; no se detallan esquemas de cuantizacion adicionales |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (unico formato en el repositorio) |

## Arquitectura y entrenamiento

No hay informacion verificable sobre la arquitectura interna. El nombre del repositorio incluye referencias a "Qwen3.8-27B", "8Bit-g32", "BF16", "FP16" y "MTP", lo que sugiere una base transformer de la familia Qwen con variantes de precision y posiblemente multi-token prediction (MTP), pero la model card no confirma ninguno de estos extremos. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

El termino "Heretic" hace referencia a un proceso de eliminacion de alineamiento y rechazos aplicado por el autor original (DavidAU), orientado a producir respuestas sin filtros de seguridad. El sufijo "Ultimate" indica que el modelo combina o fusiona varias variantes previas de la familia, pero no se especifica la receta de merge ni los pesos relativos de cada componente. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 27B, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y matematicas: no disponible; no se han publicado resultados.
- Generacion de codigo: no disponible; no se han publicado resultados.
- Vision: no disponible; el nombre no sugiere modalidad de imagen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas de la model card esta vacio.
- Modo "thinking" o razonamiento extendido: no disponible.
- Ausencia de rechazos y filtros de seguridad: es la unica caracteristica que se deduce del nombre ("Heretic-Uncensored") y de la descripcion de la variante GGUF del autor original.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como objeto de estudio para analizar que ocurre al eliminar las capas de rechazo de un modelo base, comparando respuestas con la version original de Qwen. Es adecuado porque la variante "Heretic" esta disenada explicitamente para ese contraste.
- Generacion de contenido creativo sin restricciones tematicas: narrativa, guiones o ficcion con tematicas que los modelos alineados rechazan. Requiere revision humana obligatoria por el riesgo de contenido danino.
- Pruebas de robustez de filtros: usar el modelo como generador adversarial para evaluar clasificadores de contenido o sistemas de moderacion en produccion.
- Analisis de sesgos: estudiar como el proceso de "uncensoring" afecta a la distribucion de respuestas en temas sensibles (politica, religion, genero).
- Experimentacion con tecnicas de merge: el repositorio documenta una combinacion de variantes (Ultimate, MTP, 8Bit, BF16), util para investigadores que estudien recetas de fusion de modelos.
- Despliegue local en entornos controlados: con 30,4 GB en safetensors y pesos en 8 bits, puede ejecutarse en una unica GPU de 40-48 GB o en configuraciones multi-GPU, para uso interno sin exposicion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, un modelo de 27B en 8 bits ocupa aproximadamente 27-30 GB de pesos, por lo que requiere al menos 32-40 GB de VRAM para inferencia con margen de cache KV.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB o configuraciones multi-GPU con RTX 4090 (24 GB cada una) mediante tensor parallelism.
- Cabe en consumer GPU: no en una sola RTX 4090 (24 GB); si en configuraciones de 2x RTX 4090 o en una RTX 6000 Ada / A6000 de 48 GB, sujeto a verificacion por no disponer de especificaciones confirmadas.
- Opciones de despliegue: vLLM o TGI para safetensors en BF16/FP16; llama.cpp u Ollama requeririan conversion a GGUF, no incluida en este repositorio (existe una variante GGUF separada del autor original).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| demetri007/DavidAU-Qwen3.8-27B-Ultimate-Heretic-Uncensored-8Bit-g32-BF16-MTP-FP16-MTPLX | 27B (segun nombre) | no disponible | apache-2.0 | safetensors, 30,4 GB |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored | 27B (segun nombre) | no disponible | no disponible | Hugging Face, autor original |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27B (segun nombre) | no disponible | no disponible | GGUF, variante cuantizada |

No se dispone de datos de rendimiento para ninguna de las variantes, por lo que la comparativa se limita a disponibilidad y formato. No se han identificado modelos comparables fuera de la familia DavidAU con informacion verificable en la busqueda realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al tratarse de un modelo sin alineamiento, es probable que amplifique sesgos presentes en los datos de entrenamiento originales, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni pruebas de fidelidad disponibles.
- Limitaciones de contexto e idioma: el campo de idiomas esta vacio y no se especifica la longitud de contexto, por lo que no se puede garantizar soporte multilingue ni ventanas largas.
- Restricciones de licencia: la licencia declarada es apache-2.0, lo que permitiria uso comercial, pero al ser un modelo derivado de Qwen conviene verificar la licencia de la base original antes de un despliegue comercial.
- Modelo sin censura: la ausencia de filtros de rechazo implica riesgo de generar contenido danino, ilegal o sensible. No es apto para aplicaciones de cara al publico sin moderacion adicional.
- Model card vacia: no hay instrucciones de uso, plantilla de chat, tokens especiales ni parametros de generacion recomendados, lo que incrementa el riesgo de un uso incorrecto.
- Procedencia dudosa: el repositorio lo publica un usuario (demetri007) distinto del autor original (DavidAU), con cero descargas y cero likes, sin verificacion de integridad de los pesos. Conviene contrastar con el repositorio original antes de usarlo en produccion.
- Fecha de creacion futura (2026-11-07): inconsistente con el momento de la consulta, lo que sugiere que los metadatos pueden no ser fiables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/demetri007/DavidAU-Qwen3.8-27B-Ultimate-Heretic-Uncensored-8Bit-g32-BF16-MTP-FP16-MTPLX
- Modelo original del autor: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Variante GGUF Turbo-Brilliance-50x-AGI-NEO: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF

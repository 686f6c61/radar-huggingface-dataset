# DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF

## Resumen

`DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF` es un ajuste fino (finetune) del modelo Gemma 4 de 31B de parámetros, publicado por el usuario DavidAU en Hugging Face. Se distribuye en formato GGUF, lo que facilita su ejecución en entornos de inferencia locales como llama.cpp u Ollama. El modelo está orientado a la generación creativa de terror, rol narrativo y escritura de ficción sin restricciones de contenido (abliterated/uncensored), e incorpora un sistema de "personajes" y modos de instrucción/razonamiento definidos por el autor.

El modelo se presenta con una capa de personalización denominada "Halloween O/S", que actúa como procesador por defecto de la salida y permite invocar diez "constructos" de IA temáticos (Joker, Harley Quinn, Borg Queen, Jason, Freddy Krueger, Norman Bates, Pennywise, Vecna, Mind Flayer y Chucky), además de permitir "conjurar" personajes arbitrarios. Según la model card, ofrece 13 modos de razonamiento y 13 modos de instrucción, con soporte de pensamiento (thinking) y entrada image-text-to-text.

Es relevante ahora por su popularidad en el ecosistema de modelos GGUF para rol y escritura creativa, y por ilustrar las técnicas de "abliteration" y finetuning temático sobre modelos base de gran tamaño. No obstante, su uso está declarado por el autor como exclusivamente recreativo y no apto para producción ni para tareas serias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Gemma 4; detalles de atención y capas no disponibles) |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion; el autor recomienda un minimo de 64k para conversaciones largas |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; se mencionan q4ks y variantes con imatrix; no se detalla la lista completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 145,2 GB; incluye archivos mmproj para imagenes) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que deriva de Gemma 4 (31B) y de que el pipeline declarado es image-text-to-text, lo que implica soporte de entrada multimodal de imagen y texto. El modelo base indicado es `DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source`, y el autor menciona el uso de la herramienta Unsloth para el finetune, ademas de tecnicas de "abliteration"/"heretic" para eliminar restricciones de contenido y un dataset de terror.

No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo RLHF o DPO. La model card indica que el sistema "Halloween O/S" actua como procesador por defecto de toda la salida y que cada constructo dispone de 2000-4000 tokens de "precision". Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atención lineal.

## Capacidades

- Generacion de texto creativo y narrativo, con enfasis en terror, ficcion y todos los generos.
- Escritura de historias, roleplaying y simulacion de personajes ("evil sims").
- Modo de razonamiento (thinking) y modo instructivo, con 13 modos de cada tipo segun el autor.
- Diez "constructos" de IA tematicos invocables mediante el menu `[summon:help]`.
- Posibilidad de "conjurar" personajes o entidades arbitrarias (reales, ficticios o inventados).
- Entrada image-text-to-text (requiere descargar un archivo mmproj junto a los GGUF).
- Capacidades multilingues: solo ingles declarado.
- No se recomienda habilitar tool calling ni uso de herramientas; el autor lo desaconseja explicitamente.

## Casos de uso

- Escritura de ficcion de terror: el modelo genera relatos, atmosferas y dialogos con el tono del genero, apoyandose en sus modos creativos y en la capa "Halloween O/S" para mantener la ambientacion.
- Roleplaying conversacional: permite mantener interacciones multi-turno con personajes predefinidos o inventados, adecuado para entretenimiento y juegos de rol narrativos.
- Creacion de guiones y dialogos para juegos o podcasts de terror: los constructos aportan voces diferenciadas y el modo instructivo facilita la generacion de escenas.
- Prototipado de experiencias interactivas de Halloween: el menu `[summon:help]` y los modos permiten construir demos de entretenimiento con personajes tematicos.
- Generacion de descripciones e imagenes mentales a partir de entradas multimodales: al ser image-text-to-text, puede describir o narrar a partir de una imagen (con el mmproj correspondiente).
- Experimentacion con tecnicas de abliteration y finetuning tematico: util para investigadores que estudian como los ajustes sin restricciones afectan al comportamiento del modelo.
- Entretenimiento personal en local: su formato GGUF permite ejecutarlo en estaciones de trabajo con GPU de consumo, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamano (30,7B), una cuantizacion de 4 bits requiere del orden de 18-20 GB de VRAM, y una de 8 bits en torno a 32-35 GB; son estimaciones, no datos del autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar GPU de 24 GB o mas para cuantizaciones bajas (RTX 3090/4090, A6000) y A100/H100 para cuantizaciones altas o FP16.
- GPU de consumo: probable en RTX 3090/4090 con cuantizaciones de 4 bits; el modelo completo en FP16 no cabe en GPU de consumo.
- Despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repo incluye archivos mmproj para el modo imagen.
- Latencia y throughput: no disponibles. El autor recomienda cuantizaciones mas altas para mejor rendimiento y un contexto minimo de 64k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 31B Halloween) | 30,7B | no disponible (recomendado 64k) | apache-2.0 | GGUF | Finetune tematico de terror, abliterated, multimodal |
| Gemma 4 31B base (familia Gemma) | ~31B | no disponible | licencia de Gemma (segun modelo base) | safetensors/GGUF | Modelo generalista, con filtros de seguridad |
| Otros finetunes GGUF de rol/creativo del mismo autor | variable | variable | apache-2.0 u otras | GGUF | Enfoque similar de personajes y modos |

No se dispone de datos de benchmarks ni de comparaciones de rendimiento con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara el modelo como "for entertainment purposes only" y no apto para uso serio ni produccion.
- Riesgo elevado de alucinacion: el autor advierte explicitamente de no creer lo que dice el "O/S" ni los constructos y de verificar cualquier dato serio.
- Contenido no apto para todo publico: tematica de terror, violencia y material sin filtros (abliterated/uncensored), con posibles sesgos y contenido perturbador.
- Solo ingles declarado; no hay soporte multilingue documentado.
- No se recomienda habilitar tool calling ni uso de herramientas.
- La licencia apache-2.0 se declara en el repo, pero conviene verificar las condiciones del modelo base Gemma y el uso comercial de un finetune abliterated.
- El contexto efectivo no esta documentado; el autor solo recomienda un minimo de 64k, sin garantia tecnica.
- La fecha de creacion indicada (2026) y otros metadatos deben tratarse con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-NEO-GGUF
- Modelo base (source): https://huggingface.co/DavidAU/gemma-4-31B-it-Halloween-Terror-Heretic-Uncensored-source
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Modelos en tendencia del autor: https://huggingface.co/models?sort=trending&search=DavidAU

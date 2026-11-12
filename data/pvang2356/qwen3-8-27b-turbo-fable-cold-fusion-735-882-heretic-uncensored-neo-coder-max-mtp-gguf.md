# pvang2356/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un ajuste fino (fine-tune) de la familia Qwen 3.8 con aproximadamente 26.900 millones de parametros, publicado por el usuario pvang2356 sobre el modelo base de DavidAU. Se distribuye exclusivamente en formato GGUF cuantizado, con variantes "regular" y "MTP" (multi-token prediction), y esta orientado a generacion de texto, razonamiento, codigo y escritura creativa sin restricciones de contenido (etiquetas "heretic", "uncensored", "abliterated").

El autor del modelo base afirma que se trata de un ajuste multi-etapa y multi-merge construido con metodos propios denominados "COLD FUSION" y "FABLE FUSION 711", con el objetivo declarado de reducir el consumo de tokens de razonamiento (hasta 1/10 en algunos casos) manteniendo la calidad de salida. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base, aunque no se detalla la arquitectura de vision.

La relevancia del modelo es limitada y debe tratarse con cautela: el repositorio tiene cero descargas y cero "likes", el autor del reupload no es el creador original, y las afirmaciones de rendimiento (superar 735 en ARC-C, "zona de inteligencia de OpenAI/Claude/Gemini") proceden unicamente de la model card y no estan verificadas de forma independiente. No se dispone de informacion sobre el dataset exacto, el numero de tokens de entrenamiento ni los hiperparametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.8; detalles no disponibles) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en varias precisiones (4-bit y 8-bit mencionados; catalogo completo no disponible); variantes "regular" y "MTP" |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un transformer decoder-only derivado de Qwen 3.8 27B, sometido a un proceso de ajuste fino multi-etapa y fusion de modelos ("multi-stage tune", "multi-state merge"). El autor menciona dos conjuntos de datos propios, `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, pero no se especifica su composicion, tamano ni el numero de tokens de entrenamiento. Tampoco se detalla si se aplico RLHF, DPO o alguna otra fase de alineamiento; las etiquetas "heretic", "uncensored" y "abliterated" sugieren tecnicas de eliminacion de rechazos (abliteration) en lugar de alineamiento estandar.

La innovacion tecnica declarada es la reduccion del bloque de razonamiento ("thinking tokens") entre 1/2 y 1/10 respecto al modelo base, con una mediana de reduccion de aproximadamente 2/3, mediante los metodos propietarios "COLD FUSION" y "FABLE FUSION 711". Tambien se incluyen variantes MTP (multi-token prediction), que en la practica se traducen en decodificacion especulativa para aumentar el throughput. No hay documentacion tecnica verificable sobre estos metodos ni sobre la arquitectura exacta de atencion.

## Capacidades

- Generacion de texto generalista y conversacional multi-turno.
- Razonamiento con modo "thinking" (bloques de razonamiento explicitos), con reduccion declarada del numero de tokens de pensamiento.
- Generacion de codigo (etiqueta "coder", "NEO-CODER").
- Escritura creativa, ficcion, narrativa y roleplaying en multiples generos.
- Capacidades multimodales de entrada (pipeline image-text-to-text), aunque no se detalla el soporte real de vision.
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Tool calling / function calling: la model card menciona "strongest tool calling performance ever recorded" en la pestana de comunidad, sin datos verificables.
- Uso en agentes y razonamiento multi-paso: no documentado de forma explicita.
- Salida sin censura (contenido no filtrado) por diseno.

## Casos de uso

- Escritura creativa y ficcion: el ajuste esta orientado explicitamente a narrativa, dialogo y generacion de tramas; el autor incluye ejemplos de generacion de relatos con gancho narrativo en la model card.
- Generacion de codigo asistida: la etiqueta "coder" y el nombre "NEO-CODER" indican un ajuste orientado a codigo; puede integrarse en editores o pipelines de revision, aunque sin benchmarks publicados de HumanEval no es posible validar su calidad.
- Roleplaying y personajes conversacionales: el modelo esta afinado para mantener personajes y estilo, adecuado para prototipos de juegos de rol o chatbots de personaje.
- Traduccion y contenido multilingue: con 16 idiomas declarados, puede emplearse en tareas de traduccion o generacion multilingue, aunque la calidad por idioma no esta documentada.
- Prototipado rapido en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, permite desplegar un modelo de ~27 B en estaciones de trabajo con GPU consumer o incluso CPU, para pruebas de concepto.
- Generacion de contenido sin filtros para investigacion: util para estudiar comportamiento de modelos sin alineamiento, red teaming o analisis de sesgos, siempre con las salvaguardas legales oportunas.
- Experimentacion con decodificacion especulativa: las variantes MTP permiten evaluar tecnicas de multi-token prediction en entornos de inferencia locales.

## Benchmarks y rendimiento

La model card afirma resultados de ARC-C y ARC-E, pero no se proporcionan tablas numericas verificables ni metodologia. Los unicos datos citados son:

| Benchmark | Afirmacion del autor | Verificacion |
|---|---|---|
| ARC-C (8 bits) | 735 | No verificada |
| ARC-C (4 bits) | 719 | No verificada |
| ARC-E (8 bits) | >880 | No verificada |
| Comparacion con Qwen 3.8 27B, Qwen 3.6 35B-A3B, Qwen 3.6 27B, Qwen 3.5 27B | "Supera los 7 benchmarks criticos" | No verificada |

No se han publicado resultados de benchmarks independientes en la informacion disponible. Los datos anteriores proceden exclusivamente de la model card del autor y deben considerarse no contrastados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~27 B en GGUF: una cuantizacion de 4 bits requiere aproximadamente 15-18 GB de VRAM, y una de 8 bits en torno a 28-30 GB, sin contar el contexto.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria ejecutar cuantizaciones de 4 bits; para 8 bits seria necesario una A100 40 GB, H100 o similar, o bien repartir capas entre GPU y CPU.
- GPU consumer: si, en cuantizaciones de 4 bits (RTX 3090/4090, o GPUs con 16 GB con contexto reducido y offload parcial).
- Opciones de despliegue: llama.cpp y Ollama son las opciones naturales para GGUF; tambien es posible usar vLLM o TGI si se convierte el modelo, aunque el formato nativo es GGUF. Las variantes MTP estan pensadas para motores que soporten decodificacion especulativa.
- Latencia y throughput: no disponibles. El autor afirma que el modelo es "mas rapido" por la reduccion de tokens de pensamiento, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Ajuste comunitario sin benchmarks independientes |
| Qwen 3.8 27B (base, segun el autor) | ~27 B | no disponible | no disponible | safetensors/GGUF | Referencia de comparacion citada por el autor |
| Qwen 3.6 27B | ~27 B | no disponible | no disponible | no disponible | Citado como superado por este modelo, sin datos verificables |
| Qwen 3.6 35B-A3B | 35 B (MoE, ~3 B activos) | no disponible | no disponible | no disponible | Citado como superado, sin datos verificables |

No se dispone de datos independientes para establecer una comparativa rigurosa. Las alternativas de la misma categoria (modelos de ~27 B en GGUF, como las versiones cuantizadas de Qwen 3 o Mistral) no se han evaluado con la misma metodologia.

## Limitaciones y advertencias

- Modelo sin censura ("uncensored", "abliterated"): puede generar contenido ofensivo, ilegal o danino; requiere filtros y supervision en produccion.
- Riesgo elevado de alucinacion: no hay evaluaciones de factualidad ni de calibracion publicadas.
- Afirmaciones de rendimiento no verificadas: los datos de ARC-C/ARC-E proceden solo de la model card y no han sido replicados.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la confianza en la reproducibilidad.
- Procedencia incierta: es un reupload de un modelo de DavidAU; no queda claro si los pesos son identicos al original ni si el proceso de cuantizacion esta documentado.
- Contexto no especificado: se desconoce la ventana real de contexto, lo que impide planificar casos de uso con documentos largos.
- Idiomas: aunque se declaran 16, no hay evaluacion por idioma; el rendimiento en espanol no esta verificado.
- Licencia Apache 2.0 declarada, pero al derivar de Qwen conviene revisar las condiciones de la licencia del modelo base original antes de uso comercial.
- Riesgo de sesgos: sin informacion sobre composicion del dataset ni evaluaciones de sesgo.
- El nombre del modelo incluye afirmaciones comerciales ("TURBO", "MAX", "735-882") que no constituyen evidencia tecnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pvang2356/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor original: https://huggingface.co/DavidAU
- Colecciones del autor original: https://huggingface.co/DavidAU/collections
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets

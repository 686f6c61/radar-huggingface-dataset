# sizumita/plamo-3-translate-0.8b-mlx-4bit-compact

## Resumen

PLaMo 3 Translate 0.8B — MLX 4bit (compact) es una conversión no oficial del modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks (PFN), cuantizada a 4 bits con `mlx-lm` para su ejecución en Apple Silicon. El modelo original es un LLM especializado en traducción construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el NICT japonés. Esta versión concreta, publicada por el usuario `sizumita`, reduce el peso de los pesos a 501 MB (frente a los 0,98 GB de la release MLX 4-bit oficial), manteniendo una calidad de traducción medida equivalente al original en BF16.

El modelo cuenta con 890.344.960 parámetros totales (aproximadamente 0,8B, como indica su nombre) y soporta traducción entre japonés, inglés, chino y coreano, con especial énfasis en direcciones que desembocan en japonés. Su interés actual radica en que permite ejecutar traducción neuronal de calidad en hardware de consumo Apple (un Mac mini M2 Pro lo carga en menos de 6 segundos y decodifica a 257–352 tokens/s), con una huella de memoria de 593 MB gestionada por MLX y 1,12 GB de RSS del proceso completo.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica de despliegue local de traducción multilingüe; por otro, advierte de las restricciones de la PLaMo Community License, que limita el uso comercial a usuarios con ingresos anuales inferiores a 1.000 millones de yenes y exige registro previo con PFN.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base PLaMo 3 NICT; no se detalla en la información proporcionada) |
| Parámetros totales | 890.344.960 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine, group size 64, todas las capas (4,501 bits por peso) |
| Idiomas soportados | ja, en, zh, ko |
| Licencia | PLaMo Community License (other) |
| Formato de pesos | safetensors (MLX), 501.002.761 bytes |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. El modelo original, `pfnet/plamo-3-translate-0.8b`, es un LLM especializado en traducción desarrollado por Preferred Networks sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigación conjunta entre PFN y el National Institute of Information and Communications Technology (NICT). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta ficha concreta es la conversión y cuantización: se aplicó `mlx_lm convert` (versión 0.32.2) sobre los pesos BF16 sin modificar, con cuantización afín de 4 bits y grupo de 64 en todas las capas. La fidelidad numérica se verificó comparando los pesos desquantizados con los originales, obteniendo una similitud coseno de aproximadamente 0,996 por tensor, valor esperado para este esquema de cuantización. El resultado es un archivo de pesos de 501 MB, aproximadamente la mitad del tamaño de la release MLX 4-bit oficial.

## Capacidades

- Traducción multilingüe entre japonés, inglés, chino y coreano, con especial cobertura de direcciones hacia el japonés (en→ja, zh→ja, ko→ja) y desde el japonés (ja→en).
- Generación de texto condicionada a un idioma objetivo mediante la plantilla de chat con el parámetro `target_lang`.
- Ejecución local en Apple Silicon mediante MLX, con decodificación rápida (257–352 tokens/s en M2 Pro).
- Carga eficiente en memoria: 593 MB gestionados por MLX para pesos más KV/workspace.
- Soporte de tokenizer con código personalizado (`trust_remote_code`), lo que permite integración programática vía `mlx-lm`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Traducción local de documentos en un Mac: el modelo permite traducir textos entre japonés, inglés, chino y coreano directamente en un portátil o Mac mini, sin conexión a la nube, gracias a su huella de 593 MB y a su velocidad de 257–352 tokens/s.
- Traducción de correos y comunicaciones empresariales hacia japonés: la dirección en→ja obtiene un chrF++ de 34,70 en FLORES-200, lo que lo hace adecuado para borradores de correo y mensajes internos con revisión humana.
- Preprocesamiento de datos multilingües en pipelines de NLP: puede usarse para normalizar o traducir corpus de entrenamiento entre los cuatro idiomas soportados en máquinas Apple, con carga en frío inferior a 6 segundos.
- Asistencia a la localización de productos para el mercado japonés: la combinación de direcciones zh→ja y ko→ja (chrF++ 31,62 y 28,37 respectivamente) permite generar primeras versiones de textos de interfaz y documentación para revisión posterior por traductores.
- Traducción en aplicaciones de escritorio para macOS: al ejecutarse sobre MLX con `mlx-lm`, puede integrarse en apps nativas de Apple Silicon que requieran traducción sin depender de APIs externas.
- Prototipado e investigación en traducción automática: su tamaño reducido y su licencia no comercial gratuita lo hacen útil para experimentos académicos con modelos de traducción especializados y para comparar el impacto de la cuantización 4-bit frente a BF16.

## Benchmarks y rendimiento

Calidad de traducción medida con chrF++ sobre FLORES-200 devtest (primeras 100 frases por dirección, decodificación greedy, generado con MLX en un Mac mini M2 Pro):

| Dirección | Este modelo (MLX 4bit) | Original BF16 (referencia) |
|---|---|---|
| en→ja | 34,70 | 34,08 |
| zh→ja | 31,62 | 31,25 |
| ko→ja | 28,37 | 28,26 |
| **Media** | **31,56** | **31,20** |

Rendimiento medido en Apple Silicon (Mac mini, M2 Pro, 32 GB, mlx-lm 0.32.2):

| Métrica | Valor |
|---|---|
| Tiempo de carga en frío | 5,97 s |
| Velocidad de decodificación | 257–352 tokens/s |
| Memoria pico gestionada por MLX | 593 MB (pesos 501 MB + KV/workspace ~90 MB) |
| RSS pico del proceso Python completo | 1,12 GB |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 593 MB gestionados por MLX para pesos y workspace; 1,12 GB de RSS para el proceso Python completo incluyendo tokenizer.
- GPU recomendadas: Apple Silicon (el modelo está pensado para MLX); validado en Mac mini con M2 Pro y 32 GB de memoria unificada.
- Compatibilidad con GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (el modelo ocupa menos de 1 GB en MLX); no se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- Opciones de despliegue: `mlx-lm` (versión validada 0.32.2); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta conversión MLX.
- Latencia y throughput: carga en frío de 5,97 s y decodificación de 257–352 tokens/s en M2 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Calidad medida |
|---|---|---|---|---|---|---|
| sizumita/plamo-3-translate-0.8b-mlx-4bit-compact (este) | 890 M | no disponible | ja, en, zh, ko | PLaMo Community License | MLX safetensors 4-bit (501 MB) | chrF++ medio 31,56 |
| pfnet/plamo-3-translate-0.8b (BF16 original) | 890 M | no disponible | ja, en, zh, ko | PLaMo Community License | BF16 | chrF++ medio 31,20 (referencia) |
| Release MLX 4-bit oficial de PFN | 890 M | no disponible | ja, en, zh, ko | PLaMo Community License | MLX 4-bit (~0,98 GB) | no disponible |
| pfnet/plamo-3-translate-0.8b-FP8 | 890 M | no disponible | ja, en, zh, ko | PLaMo Community License | FP8 | no disponible |

La colección PLaMo 3 Translate de PFN incluye además variantes de 2B, 8B y 31B en BF16 y formatos cuantizados (FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit), pero no se dispone de sus métricas concretas en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial: no está afiliada ni respaldada por Preferred Networks, Inc.
- La licencia PLaMo Community License permite uso no comercial gratuito, pero el uso comercial requiere registro previo con PFN y está limitado a usuarios con ingresos anuales no superiores a 1.000 millones de yenes; un uso comercial a mayor escala requiere una licencia separada de PFN.
- La redistribución exige incluir el texto de la licencia, mostrar "Built with PLaMo" y mantener "PLaMo" en el nombre del modelo (Artículo 4).
- El tokenizer utiliza código personalizado del repositorio, por lo que es necesario pasar `trust_remote_code=True` al cargar el modelo programáticamente, lo que implica ejecutar código del autor.
- Solo se soportan cuatro idiomas (ja, en, zh, ko); no se documenta cobertura de otras lenguas.
- No se dispone de información sobre longitud de contexto máxima, sesgos conocidos ni tasas de alucinación en la documentación proporcionada.
- La calidad medida se basa en 100 frases por dirección en FLORES-200; los resultados en dominios especializados (técnico, legal, médico) pueden diferir.
- Al ser un modelo de 0,8B, su capacidad de razonamiento general y de generación libre es limitada en comparación con LLM de mayor tamaño; está especializado en traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sizumita/plamo-3-translate-0.8b-mlx-4bit-compact
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Colección PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Variante FP8 del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Licencia PLaMo Community License (texto autoritativo): https://plamo.preferredai.jp/info/plamo-community-license-en

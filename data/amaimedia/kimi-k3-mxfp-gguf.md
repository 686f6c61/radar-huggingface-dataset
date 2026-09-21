# AMAImedia/Kimi-K3-MXFP-GGUF

## Resumen

Kimi K3 es un modelo multimodal nativo de pesos abiertos desarrollado por Moonshot AI, publicado originalmente en el repositorio `moonshotai/Kimi-K3`. Se trata de un modelo de 2.779.931.837.184 parámetros (unos 2,78 billones) construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con una arquitectura Mixture of Experts de alta dispersión (Stable LatentMoE) que activa 16 de 896 expertos por token y una ventana de contexto de 1.000.000 de tokens. La model card lo presenta como el primer modelo abierto de clase 3T.

La ficha que nos ocupa, `AMAImedia/Kimi-K3-MXFP-GGUF`, no es el modelo original sino una publicación derivada de AMAImedia (Ilia Bolotnikov, plataforma NOESIS) que redistribuye pesos del modelo base y del cuantizado de unsloth en formato GGUF, con un repositorio de 1.561 GB. El autor lo declara como parte de una plataforma de doblaje multilingüe automatizado y la model card incluye llamadas a donaciones, por lo que la documentación técnica propia es mínima: la mayor parte de la información sustantiva procede de la model card de Moonshot AI.

Su relevancia práctica es doble: por un lado, K3 combina multimodalidad nativa (texto, imagen y vídeo) con contexto de un millón de tokens, orientado a codificación de larga duración y trabajo agéntico de conocimiento; por otro, esta publicación concreta es una de las pocas vías para ejecutar el modelo en cuantizaciones GGUF extremas (por ejemplo, UD-IQ1_S), aunque el coste de hardware sigue estando fuera del alcance de equipos de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); Mixture of Experts con Stable LatentMoE (16 de 896 expertos activos por token) |
| Parametros totales | 2.779.931.837.184 (unos 2,78 billones), según safetensors del repositorio |
| Parametros activos | No disponible la cifra exacta; la model card indica que se activan 16 de 896 expertos por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | GGUF (se referencia UD-IQ1_S de unsloth); el modelo original se distribuye en MXFP4 (pesos) / MXFP8 (activaciones) con QAT. Etiqueta `8-bit` en los metadatos |
| Idiomas soportados | Más de 110 idiomas declarados en los metadatos, entre ellos español, inglés, ruso, chino, japonés, alemán, francés, portugués, árabe, hindi y vietnamita |
| Licencia | El repositorio declara `apache-2.0`; el modelo original se publica bajo la "Kimi K3 License" (discrepancia no resuelta en la documentación) |
| Formato de pesos | GGUF (repo principal); también se etiquetan safetensors y `transformers` con `custom_code` |
| Tamano del repositorio | 1.561 GB |
| Pipeline declarado | image-text-to-text (entrada de imagen/texto, salida de texto) |
| Modelo base | moonshotai/Kimi-K3, unsloth/Kimi-K3-GGUF |
| Descargas / likes | 692 descargas, 1 like |
| Fechas | Creado el 2026-08-16, actualizado el 2026-09-20, publicación declarada el 2026-09-21 |

## Arquitectura y entrenamiento

La model card describe K3 como un transformer con atención de tipo delta (Kimi Delta Attention, KDA) complementada con Attention Residuals (AttnRes), y una capa de expertos con enrutado Stable LatentMoE. La dispersión es elevada: 896 expertos totales con 16 activos por token, lo que según el autor proporciona aproximadamente una mejora de 2,5 veces en eficiencia de escalado global respecto a Kimi K2. El modelo es multimodal nativo, es decir, procesa texto, imagen y vídeo dentro del mismo modelo, no mediante adaptadores externos, y soporta una ventana de 1.000.000 de tokens.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineamiento. Lo único documentado sobre el proceso de compresión es que los pesos originales se publican en MXFP4 con activaciones MXFP8 bajo cuantización consciente del entrenamiento (QAT), y que las versiones GGUF derivan de ese material, en este caso en el cuantizado UD-IQ1_S de unsloth.

## Capacidades

- Generación de texto y razonamiento de propósito general, orientado a inteligencia "frontera" según el autor.
- Codificación de larga duración: sesiones de ingeniería extensas con supervisión humana mínima, navegación de repositorios de gran tamaño y optimización de kernels de GPU o desarrollo de compiladores.
- Trabajo agéntico de conocimiento: investigación profunda con visualizaciones interactivas, widgets, paneles y edición de vídeo o diseño de movimiento.
- Orquestación de herramientas de terminal, lo que implica soporte de uso de herramientas y razonamiento en varios pasos dentro de un bucle agéntico.
- Multimodalidad nativa: comprensión de texto, imágenes y vídeo en el mismo modelo.
- Contexto largo de 1.000.000 de tokens, apto para corpus documentales o repositorios completos.
- Cobertura multilingüe amplia (más de 110 idiomas declarados), incluyendo el español.
- Etiquetas adicionales del repositorio: `feature-extraction` (posible uso para representaciones) e `image-text-to-text`.
- No se documentan en la información disponible modos explícitos de "thinking", soporte de audio ni parámetros de decodificación especulativa.

## Casos de uso

- Refactorización de repositorios grandes: con 1M de tokens de contexto, el modelo puede ingerir un monorepositorio completo y razonar sobre dependencias cruzadas sin trocear el código, algo inviable en modelos de 128K.
- Agentes de operaciones y DevOps: la orquestación de herramientas de terminal permite construir agentes que ejecutan comandos, leen logs y aplican parches en pipelines de CI/CD bajo supervisión.
- Investigación profunda automatizada: generación de informes con paneles y visualizaciones interactivas a partir de documentación extensa, aprovechando la ventana de contexto y la salida multimodal.
- Atención al cliente multilingüe: con más de 110 idiomas declarados, un único despliegue puede cubrir conversaciones multi-turno en mercados distintos, siempre que la infraestructura de servicio esté dimensionada.
- Análisis de vídeo y documentación técnica: la entrada nativa de vídeo permite indexar tutoriales, demostraciones de producto o grabaciones de incidencias y extraer resúmenes y pasos accionables.
- Localización y doblaje audiovisual: es el caso declarado por el autor, que enmarca la publicación dentro de la plataforma NOESIS de doblaje multilingüe automatizado.
- Diseño asistido (CAD y diseño de chips): mencionado explícitamente en la model card como aplicación de las capacidades de codificación de largo horizonte y visión en el bucle.
- RAG sobre corpus masivos: indexación y respuesta sobre normativa, contratos o manuales extensos, donde el contexto de 1M reduce la necesidad de recuperación agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card original menciona la etiqueta `eval-results` y remite a un informe técnico externo (`k3_tech_report.pdf`), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en el material proporcionado. No se inventan valores.

## Requisitos de hardware

- Estimaciones calculadas a partir del recuento real de parámetros (2,78 billones) y de los bits por peso típicos de cada formato; no proceden de la model card.
- Cuantización IQ1_S (~1,5-1,75 bits por peso): en torno a 520-610 GB solo de pesos, más caché KV y sobrecarga, lo que exige un nodo de 8x H100 80 GB (640 GB) como mínimo y probablemente 16 GPU para operar con holgura.
- Cuantización MXFP4 del modelo original (~4,25 bits por peso): aproximadamente 1,48 TB.
- Cuantización Q4_K_M (~4,8 bits por peso): aproximadamente 1,69 TB, es decir, 24x H100 80 GB o 12x H200 141 GB.
- Cuantización Q8_0 (~8,5 bits por peso): aproximadamente 2,95 TB.
- BF16: aproximadamente 5,56 TB.
- No cabe en GPU de consumo: ni siquiera la cuantización más agresiva entra en una RTX 4090 (24 GB) ni en una RTX 5090; el propio autor indica que el trabajo por encima de 9B y las búsquedas asociadas requieren H200 o Blackwell alquiladas.
- La memoria disponible frente a la ventana de 1M tokens es un factor limitante no documentado: no se especifica el coste de caché KV de KDA, por lo que debe validarse empíricamente antes de dimensionar.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF (con offload parcial a RAM/SSD, inviable en la práctica por latencia); vLLM o TGI para los pesos safetensors del modelo base en clúster.
- Latencia y throughput: no disponibles. Al ser un MoE con 16 de 896 expertos activos, el rendimiento por token dependerá de los parámetros activos (no publicados) y del ancho de banda de memoria agregado del nodo.

## Comparativa con modelos similares

Comparativa limitada a los materiales referenciados en la información disponible. No se dispone de cifras de rendimiento de ninguno de ellos.

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AMAImedia/Kimi-K3-MXFP-GGUF (este repositorio) | 2,78 billones | 1M tokens | apache-2.0 declarada en el repo | GGUF (y safetensors etiquetados) | Hugging Face, 1.561 GB |
| moonshotai/Kimi-K3 (original, QAT MXFP4/MXFP8) | 2,78 billones | 1M tokens | Kimi K3 License | safetensors | Hugging Face, pesos completos |
| unsloth/Kimi-K3-GGUF (por ejemplo UD-IQ1_S) | 2,78 billones | 1M tokens | No disponible en la información | GGUF | Hugging Face |
| Kimi K2 (generación anterior, citada en la model card) | No disponible | No disponible | No disponible | No disponible | Solo se indica una mejora de ~2,5x en eficiencia de escalado de K3 respecto a K2 |

No se identifican en la documentación otros modelos abiertos de clase 3T con los que comparar directamente; la model card afirma que K3 es el primer modelo abierto de esa clase. Los resultados de la búsqueda web realizada no contienen información relevante sobre el modelo (devolvieron páginas sin relación).

## Limitaciones y advertencias

- Discrepancia de licencia: el repositorio declara `apache-2.0`, mientras que el modelo original se distribuye bajo la "Kimi K3 License". Al tratarse de una redistribución derivada, conviene verificar en el repositorio de Moonshot AI las condiciones reales antes de cualquier uso comercial.
- La model card de esta publicación es en gran medida promocional (incluye banners de donaciones y datos del equipo del autor) y no documenta el proceso de cuantización, el impacto en la calidad ni los parámetros exactos de conversión a GGUF.
- La cuantización UD-IQ1_S es extremadamente agresiva (~1,5-1,75 bits por peso) en un modelo MoE de 896 expertos; cabe esperar degradación de calidad respecto a MXFP4, aunque no se publican evaluaciones comparativas que la cuantifiquen.
- Riesgo de alucinación: no se documentan tasas de error, evaluaciones de veracidad ni mecanismos de mitigación.
- Sesgos: no se publica ninguna evaluación de sesgo, toxicidad o equidad. La procedencia de los datos de entrenamiento no se detalla.
- Idiomas: aunque se declaran más de 110 idiomas, no hay métricas por idioma; el rendimiento en lenguas de bajos recursos puede ser notablemente inferior al de inglés o chino.
- Código remoto: el repositorio está etiquetado con `custom_code` y `transformers`, por lo que su carga puede requerir `trust_remote_code=True`; auditar ese código antes de ejecutarlo es recomendable.
- Coste de despliegue prohibitivo para producción habitual: el repositorio ocupa 1.561 GB y ninguna cuantización cabe en hardware de consumo, lo que limita su uso a clústeres o a alquiler por horas.
- El límite real de uso de la ventana de 1M tokens en la práctica depende del coste de caché KV de KDA, que no está documentado.
- No se especifican requisitos de versión mínima de llama.cpp, Ollama o vLLM para estos GGUF, ni si el modelo requiere un fork concreto.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/AMAImedia/Kimi-K3-MXFP-GGUF
- Modelo base original: https://huggingface.co/moonshotai/Kimi-K3
- Cuantizaciones GGUF de referencia: https://huggingface.co/unsloth/Kimi-K3-GGUF
- Cuantización UD-IQ1_S citada: https://huggingface.co/unsloth/Kimi-K3-GGUF/tree/main/UD-IQ1_S
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia del modelo original: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat oficial: https://www.kimi.com
- Moonshot AI: https://www.moonshot.ai
- Organización en Hugging Face: https://huggingface.co/moonshotai
- ModelScope: https://modelscope.cn/organization/moonshotai
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Autor de la cuantización (web): https://amaimedia.com
- Autor en X: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (páginas de una funeraria en neerlandés), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.

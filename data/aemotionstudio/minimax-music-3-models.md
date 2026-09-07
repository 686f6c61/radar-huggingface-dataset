# AEmotionStudio/minimax-music-3-models

## Resumen

MiniMax Music 3 es un modelo de generación de música desarrollado por MiniMax y redistribuido por AEmotionStudio en formato diffusers para la estación de trabajo MAESTRO. Genera canciones completas de hasta cinco minutos a partir de una letra y una descripción de estilo, produciendo resultados con estructura coherente, voces expresivas, arreglos que evolucionan y una calidad de audio estable durante toda la pista. La arquitectura combina un modelo de lenguaje de 8B que planifica la secuencia de codec, un diffusion transformer (DiT) que la renderiza y un RVQ depth decoder junto a un vocoder que genera la forma de onda. El modelo es relevante para creadores e investigadores que necesitan una herramienta comercializable de text-to-music, ya que su licencia comunitaria permite uso comercial siempre que el producto final muestre la marca "MiniMax-Music3" y no supere un umbral de ingresos de 20 M$/año.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de 8B + diffusion transformer (DiT) + RVQ depth decoder + vocoder |
| Parametros totales | No disponible (LM de 8B; DiT y otros componentes sin especificar) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16; la variante int8 W8A8 no fue publicada) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax-Music3 Community License |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de tres etapas: primero, un modelo de lenguaje de 8B genera la secuencia de tokens del codec a partir de la letra y la descripción musical; después, un diffusion transformer (DiT) renderiza esa secuencia; finalmente, un decodificador RVQ de profundidad y un vocoder convierten la representación latente en audio. La salida es una pista WAV estéreo de 32 kHz y 16 bits. Este espejo concreto redistribuye únicamente la parte compatible con diffusers, manteniendo el LM en cuatro shards bf16 idénticos al upstream y convirtiendo el DiT de fp32 a bf16 (el autor indica que MAESTRO ya lo cargaba en bf16, por lo que no hay diferencia en runtime). No se proporcionan datos sobre el dataset de entrenamiento, el proceso de alineación ni otras técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de canciones completas de hasta 5 minutos con letra y descripción de estilo.
- Salida de audio WAV estéreo de 32 kHz y 16 bits.
- Estructura musical coherente, voces expresivas y arreglos que evolucionan a lo largo de la pista.
- Estabilidad en la generación de audio de larga duración (hasta 5 minutos).
- Sintonia fina de estilo mediante el prompt de descripción (género, instrumentación, tempo, ambición, etc.).
- No incluye capacidades de tool calling, agentes, visión ni diálogo; su uso es exclusivamente text-to-music.

## Casos de uso

- Prototipado de maquetas para artistas: se introduce la letra y una descripción del estilo deseado; el modelo genera una pista completa de hasta 5 minutos que permite evaluar melodías y arreglos antes de invertir en una producción de estudio.
- Bandas sonoras para vídeo y podcast: la generación estable a 32 kHz estéreo produce pistas largas con evolución estructural, aptas para usar como fondos musicales sin necesidad de cortes manuales frecuentes.
- Publicidad y jingles: la licencia comunitaria permite uso comercial en campañas publicitarias, siempre que el producto muestre "MiniMax-Music3"; esto habilita la creación de piezas originales para spots o anuncios digitales.
- Prototipado musical para juegos: canciones de hasta 5 minutos con arreglos en evolución pueden usarse como temas de menú, niveles o escenas cinemáticas antes de la composición final.
- Generación de contenido musical en aplicaciones de creación: editores de vídeo y plataformas UGC pueden integrar el pipeline text-to-music para ofrecer a los usuarios pistas personalizadas generadas a partir de un prompt de texto.
- Educación musical: los prompts de letra y estilo permiten comparar variaciones de arreglo y gusto musical, sirviendo como herramienta para analizar cómo cambia la composición según la descripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso total del repositorio: 23.7 GB. El conjunto utilizado por la ruta "Quality" (shared/ + quality/) ocupa 22.0 GB.
- El README de MAESTRO indica que el modelo de lenguaje de 8B puede colocarse dentro de un planificador de offloading para ejecutarse en tarjetas de 12 GB.
- No se indican GPUs específicas recomendadas (A100, H100, RTX 4090, etc.) en la información proporcionada.
- El despliegue está orientado a MAESTRO; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado datos comparativos con otros modelos de generacion musical en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia comunitaria exige que cualquier producto que utilice el modelo muestre de forma prominente "MiniMax-Music3". Servicios con ingresos superiores a 20 M$/año necesitan autorización separada de MiniMax.
- El espejo no incluye la cuantización int8 W8A8 del lenguaje, que fue descartada por colapsar en ejecuciones autoregresivas largas. Por tanto, solo se dispone de pesos en bf16.
- No se ofrecen datos sobre sesgos, índices de alucinación ni fiabilidad de la generación en la información disponible.
- El modelo no está diseñado como asistente conversacional ni soporta tool calling; sus limitaciones se concentran en la generación musical.
- Al tratarse de un espejo, las actualizaciones o correcciones deben seguirse en el repositorio upstream: MiniMaxAI/MiniMax-Music3.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/AEmotionStudio/minimax-music-3-models
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-Music3/blob/main/LICENSE
- GitHub oficial: https://github.com/MiniMax-AI/MiniMax-Music3
- Documentación y demo: https://minimaxmusic3.ai/
- Repositorio MAESTRO: https://github.com/AEmotionStudio

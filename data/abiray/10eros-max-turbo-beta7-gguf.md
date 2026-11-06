# Abiray/10Eros-Max-Turbo-Beta7-GGUF

## Resumen

10Eros-Max-Turbo-Beta7 (GGUF) es una colección de cuantizaciones comunitarias en formato GGUF del modelo 10Eros-Max-Turbo-Beta7, un modelo experimental de generación de vídeo híbrido creado por TenStrip sobre la arquitectura MiniMax-H3. La conversión y el empaquetado de los pesos GGUF los mantiene el usuario Abiray en Hugging Face. El modelo pertenece a la familia de modelos "turbo" destilados para muestreo en pocos pasos: está optimizado para generar vídeo en solo 6-8 pasos de inferencia, lo que reduce drásticamente el tiempo de generación frente a los difusores convencionales.

La versión Beta 7 introduce una metodología de fusión específica: los datos de los LoRA se convierten en pesos exclusivamente MLP (capas de perceptrón multicapa) fusionados con un límite de magnitud, dejando intactas al 100 % las capas de atención de MiniMax-H3 y las compuertas de referencia. Según el autor, esto permite el muestreo turbo de 8 pasos preservando la fidelidad de texturas, la física realista de fluidos y la sincronización nativa audio-vídeo.

Es relevante porque hace accesible un modelo de vídeo turbo en formato GGUF cuantizado, ejecutable en ComfyUI mediante el nodo UnetLoaderGGUF, con cuantizaciones que van desde 8,9 GB (Q3_K_M) hasta 14,1 GB (Q5_K_M), lo que lo hace viable en GPUs de consumo. El modelo base completo (TenStrip/10Eros-Max) tiene 20.111.438.744 parámetros (unos 20,1 B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida basada en MiniMax-H3 (difusión para vídeo, con capas de atención H3 y compuertas de referencia) |
| Parametros totales | 20.111.438.744 (aprox. 20,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q3_K_M (8,9 GB), Q4_K_S (11,6 GB), Q4_K_M (11,6 GB), Q5_K_S (14,1 GB), Q5_K_M (14,1 GB) |
| Idiomas soportados | no disponible (modelo de generación de vídeo) |
| Licencia | MiniMax H3 Community License (minimax-h3-community, tipo "other") |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura MiniMax-H3, un modelo híbrido de generación de vídeo que combina capas de atención H3 con compuertas de referencia ("reference gates") y sincronización nativa audio-vídeo. La variante Turbo-Beta7 no es un entrenamiento desde cero, sino una fusión (merge) experimental: los ajustes procedentes de LoRA se convierten en pesos solo-MLP y se fusionan con un límite de magnitud (magnitude cap), de modo que las capas de atención y las compuertas del modelo base permanecen sin modificar. Esta estrategia busca mantener la calidad del modelo original habilitando al mismo tiempo el muestreo turbo en 8 pasos.

No se ha publicado información sobre el número de tokens o clips de vídeo usados en el entrenamiento del modelo base, la composición del dataset ni el uso de técnicas de alineación (RLHF/DPO u otras). Tampoco se detalla el proceso exacto de destilación turbo. Los datos disponibles se limitan a la metodología de fusión de la Beta 7 descrita en la model card.

## Capacidades

- Generación de vídeo a partir de texto/imagen (video-generation) con resoluciones recomendadas de 1280x720 (720p) y 1920x1088 (1080p, descrito como "sweet spot" nativo).
- Muestreo turbo acelerado: generación completa en 6-8 pasos, frente a las decenas de pasos de los difusores estándar.
- Sincronización nativa audio-vídeo, según la model card del autor.
- Física de fluidos realista y fidelidad de micro-texturas, atribuida a la preservación de las capas de atención del modelo base.
- Compatibilidad con ComfyUI mediante la extensión ComfyUI-GGUF (nodo UnetLoaderGGUF).
- No es un modelo de lenguaje: no tiene generación de texto, razonamiento, código, tool calling ni capacidades de agente.

## Casos de uso

- Generación de vídeo en GPUs de consumo: gracias a las cuantizaciones GGUF (desde 8,9 GB en Q3_K_M), creadores individuales pueden generar vídeo 720p/1080p en tarjetas de gama alta sin necesidad de un clúster.
- Prototipado rápido de clips: el muestreo en 6-8 pasos permite iterar prompts y composiciones en tiempos muy inferiores a los de un modelo de vídeo convencional, útil en flujos creativos exploratorios.
- Producción de contenido para redes sociales: la resolución 1080p nativa y la velocidad de generación lo hacen adecuado para producir clips cortos con presupuesto de cómputo limitado.
- Integración en pipelines de ComfyUI: se carga directamente con el nodo UnetLoaderGGUF, lo que permite encadenarlo con workflows existentes de upscaling, interpolación o postproducción.
- Vídeo con audio sincronizado: la sincronización nativa audio-vídeo evita pasos adicionales de generación y alineación de banda sonora.
- Pruebas comparativas de cuantizaciones: la disponibilidad de cinco niveles de cuantización permite evaluar el compromiso entre VRAM, velocidad y calidad de micro-texturas en hardware concreto.
- Experimentación sobre arquitecturas híbridas H3: al preservar las capas de atención y compuertas del base, es un punto de partida para merges y LoRAs comunitarios adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos indicadores cuantitativos son los tamaños de archivo por cuantización (8,9 a 14,1 GB), el número de pasos de muestreo (6-8) y las resoluciones soportadas (720p y 1080p). No hay datos de métricas tipo VBench, FVD ni tiempos de generación medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin overhead de activaciones ni VAE):
  - Q3_K_M: ~8,9 GB
  - Q4_K_S / Q4_K_M: ~11,6 GB
  - Q5_K_S / Q5_K_M: ~14,1 GB
  - En la práctica conviene añadir margen para latentes, VAE y text encoders; se recomienda al menos 16 GB de VRAM para las variantes Q4/Q5.
- GPUs recomendadas: RTX 3090 / RTX 4090 (24 GB) para Q5_K_M con holgura; RTX 4070 Ti Super / 4080 (16 GB) para Q4_K_M; opciones de offload a CPU/RAM pueden permitir VRAM menores, aunque sin datos publicados de rendimiento.
- Consumer GPUs: sí, cabe en GPUs de consumo; la propia model card describe Q3_K_M como "opción balanced de VRAM ultra baja".
- Despliegue: ComfyUI con la extensión ComfyUI-GGUF (city96/ComfyUI-GGUF), cargando el archivo .gguf en `ComfyUI/models/diffusion_models/` mediante el nodo UnetLoaderGGUF. No se menciona soporte para vLLM, llama.cpp standalone, Ollama ni TGI.
- Ajustes recomendados: 6-8 pasos exactos, CFG 1,0-1,5 (valores mayores saturan o "queman" la salida), sampler `res_multistep` o `euler` con scheduler `simple`; mantener desactivados SLA sparsity, Spectrum y TeaCache porque interfieren con la precisión de las compuertas híbridas H3.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos de muestreo | Resolucion | Licencia |
|---|---|---|---|---|---|
| 10Eros-Max-Turbo-Beta7 (GGUF) | ~20,1 B (base) | GGUF (Q3-Q5) | 6-8 (turbo) | 720p / 1080p | MiniMax H3 Community |
| MiniMax-H3 (base) | no disponible | safetensors | no disponible | no disponible | MiniMax H3 Community |
| Wan 2.1 (Alibaba) | 1,3 B / 14 B | safetensors / GGUF comunitario | 20-50 (estándar) | hasta 720p | Apache 2.0 (1,3 B) / otras |
| LTX-Video (Lightricks) | ~2 B | safetensors | ~8 (rápido) | hasta 768x512 aprox | Licencia propia (LTXV) |

Nota: la comparativa se basa en datos públicos generales de los modelos alternativos; los detalles exactos de MiniMax-H3 (parámetros, pasos, resolución) no constan en la información disponible.

## Limitaciones y advertencias

- Contenido adulto: el nombre y la marca "10Eros" sugieren que el modelo está orientado a contenido para adultos; los usuarios deben verificar la idoneidad y legalidad de los contenidos generados en su jurisdicción y las políticas de las plataformas donde los publiquen.
- Licencia restrictiva: se rige por la MiniMax H3 Community License Agreement, una licencia de tipo "other" que puede imponer condiciones al uso comercial (límites de usuarios, ingresos o atribución). Es imprescindible revisar el texto de la licencia antes de cualquier despliegue comercial.
- Sensibilidad a parámetros de muestreo: CFG por encima de 1,5 satura o degrada la salida, y activar TeaCache, SLA sparsity o Spectrum interfiere con las compuertas híbridas H3. Hay que respetar estrictamente los ajustes recomendados.
- Modelo experimental: es una versión Beta 7 de un merge comunitario, no un lanzamiento oficial de MiniMax; la calidad y estabilidad pueden variar entre cuantizaciones y no hay benchmarks independientes que verifiquen las afirmaciones del autor.
- Riesgo de alucinación/defectos visuales: al tratarse de un modelo de difusión turbo en pocos pasos, es esperable algún compromiso en coherencia temporal o detalle respecto al modelo completo; no hay datos que cuantifiquen este efecto.
- Sin documentación de idiomas ni de prompts: no se especifica qué lenguaje o formato de prompt funciona mejor (inglés, castellano, etc.).
- Mantenimiento comunitario: la conversión GGUF la mantiene un usuario individual (Abiray, 564 descargas y 3 likes en el momento de los datos), sin garantía de actualizaciones o soporte.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/Abiray/10Eros-Max-Turbo-Beta7-GGUF
- Modelo base: https://huggingface.co/TenStrip/10Eros-Max
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE
- Extensión ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Paper, blog o demo oficial: no disponible

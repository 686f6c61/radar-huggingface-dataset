# Jingzhi03/UltraTex

## Resumen

UltraTex es un método de generación de texturas PBR (physically based rendering) de alta fidelidad para activos 3D, presentado en SIGGRAPH Asia (TOG) 2026 por Jingzhi Bao, Xiaohe Ma, Hong Li, Yuanming Hu y Xiaoguang Han. Su objetivo es producir mapas de material coherentes con la física de la superficie —canales de albedo, metallic y roughness, más un convertidor a mapas de normales— listos para integrarse en flujos de renderizado como Blender. El planteamiento se centra en "alinear conocimiento físico" durante la generación, es decir, en que las predicciones de material respeten las propiedades de reflectancia esperables en lugar de limitarse a la apariencia difusa.

El sistema no es un modelo único, sino una pipeline de cuatro componentes publicados como pesos separados: UltraTex-MV-Albedo (generación multivista de albedo), UltraTex-MV-MR (generación multivista de metallic/roughness, con un componente Qwen3.5-9B en su estructura de pesos), UltraTex-SR (superresolución de texturas, con un upscaler 4x "lite", un 2x-RealESRGAN, un DiT en bf16 y fp8_e4m3fn y un VAE podado en fp16) y UltraTex-Converter-Normal (conversión a mapas de normales). Cada componente se organiza en carpetas de tipo `scheduler/`, `transformer/` y `vae/`, lo que apunta a una implementación basada en difusión con estructura compatible con Diffusers.

La relevancia del modelo es académica y de nicho: ataca un paso tradicionalmente manual y costoso del pipeline 3D (la autoría de materiales PBR). Según la model card, UltraTex supera a todos los baselines evaluados en valoraciones de arena y comparaciones por pares de preferencia, aunque no se publican cifras concretas. En el momento de redactar esta ficha el repositorio de HuggingFace no tiene descargas ni likes (0/0), no declara licencia y reporta un tamaño de 0,0 GB, por lo que la disponibilidad real de los pesos es dudosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión modular con componentes `transformer`, `vae` y `scheduler` por módulo; cuatro componentes independientes (MV-Albedo, MV-MR, SR, Converter-Normal). No se detalla el tipo exacto de backbone ni si se trata de un DiT puro |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible / no aplica (modelo de generación de texturas, no de lenguaje; no se documenta condicionamiento por prompt textual) |
| Tipos de cuantización | bf16 (`dit_bf16`), fp8 con formato e4m3fn (`dit_fp8_e4m3fn`) y fp16 en un VAE podado (`vae_pruned_fp16`), según los nombres de archivo publicados. No se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (no se documenta condicionamiento en lenguaje natural; la entrada es visual/multivista) |
| Licencia | no especificada en la model card; las figuras del proyecto llevan aviso CC BY-NC-SA 4.0 |
| Formato de pesos | no disponible explícitamente; la estructura de directorios (`scheduler/`, `transformer/`, `vae/`) es compatible con el formato Diffusers. El repositorio reporta 0,0 GB |
| Componentes publicados | UltraTex-MV-Albedo, UltraTex-MV-MR (incluye directorio Qwen3.5-9B), UltraTex-SR, UltraTex-Converter-Normal |
| Canales PBR generados | Albedo, metallic, roughness y normales (estas últimas mediante el convertidor) |
| Superresolución incluida | Upscaler 4x "lite" y 2x-RealESRGAN (factor combinado no especificado) |
| Fecha de publicación en HuggingFace | 21 de septiembre de 2026 |
| Paper | SIGGRAPH Asia (TOG) 2026 |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura de difusión descompuesta en cuatro módulos especializados en lugar de un modelo monolítico. UltraTex-MV-Albedo genera mapas de albedo a partir de vistas múltiples del activo; UltraTex-MV-MR hace lo propio con los canales de metallic y roughness; UltraTex-SR se encarga de la superresolución de texturas mediante una combinación de upscalers y un transformer de difusión disponible en bf16 y fp8_e4m3fn; y UltraTex-Converter-Normal deriva mapas de normales. La presencia de un directorio `Qwen3.5-9B` dentro de UltraTex-MV-MR sugiere el uso de un modelo de lenguaje de 9B de parámetros como componente de codificación o condicionamiento, aunque la model card no explica su función; se trata de una inferencia a partir de la estructura de pesos, no de un dato confirmado.

No se especifica en la información proporcionada el número de tokens o imágenes de entrenamiento, la composición del dataset, ni si se emplearon técnicas de ajuste por preferencias humanas (RLHF/DPO) o de otro tipo. Tampoco se detallan innovaciones técnicas concretas más allá del enfoque declarado de "alinear conocimiento físico" para que los canales PBR generados sean consistentes entre sí y con la geometría. La evaluación publicada se limita a una afirmación agregada: el modelo supera a todos los baselines evaluados en valoraciones de arena (arena ratings) y en comparaciones de preferencia por pares, sin desglose numérico ni identificación de los baselines.

## Capacidades

- Generación de mapas de albedo a partir de representaciones multivista de un activo 3D.
- Generación de mapas de metallic y roughness coherentes con el albedo, orientados a flujos de renderizado PBR.
- Superresolución de texturas mediante un upscaler 4x ligero y un 2x-RealESRGAN, además de un módulo DiT en bf16 o fp8_e4m3fn.
- Conversión a mapas de normales mediante el componente UltraTex-Converter-Normal, completando el conjunto de canales habitual en motores de render.
- Salida orientada a material de superficie listo para su uso en herramientas de render (la model card muestra resultados renderizados en Blender con vistas por canal).
- Separación modular por tarea, lo que permite usar solo el componente necesario (por ejemplo, únicamente el superresolutor o únicamente el convertidor de normales).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni condicionamiento por texto: el pipeline se describe como generación de texturas a partir de información visual/geométrica.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Texturizado de activos para videojuegos: a partir de renders multivista de una malla, generar el set de mapas PBR (albedo, metallic, roughness, normales) y exportarlo al motor de render, reduciendo el trabajo manual de autoría de materiales.
- Visualización arquitectónica y de producto: producir materiales coherentes con la geometría para renders offline donde la consistencia física entre canales de reflectancia es crítica para el realismo.
- Reacondicionamiento de bibliotecas de texturas existentes: aplicar el componente UltraTex-SR (upscaler 4x o 2x-RealESRGAN) para aumentar la resolución de texturas de baja calidad antes de reutilizarlas en producción.
- Completado de sets PBR incompletos: usar UltraTex-Converter-Normal para derivar el mapa de normales cuando solo se dispone de albedo y del resto de canales, evitando herramientas de conversión genéricas que no respetan la geometría.
- Generación de datos sintéticos para entrenamiento: crear variaciones de materiales sobre un mismo activo para aumentar la diversidad de un dataset de visión por computador o de robótica simulada.
- Previsualización rápida en comercio electrónico o AR: generar materiales plausibles para catálogos de producto antes de una sesión de fotografía o renderizado final, siempre que la licencia lo permita.
- Investigación en gráficos por computador: reproducir y extender los experimentos del paper (SIGGRAPH Asia 2026) sobre alineación de conocimiento físico en generación de texturas, comparando con otros métodos del área.
- Integración en pipelines de contenido 3D por lotes: al estar dividido en módulos independientes, cada etapa (albedo, metallic/roughness, superresolución, normales) puede ejecutarse como un paso separado en un proceso automatizado de preparación de activos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente afirma que UltraTex "supera a todos los baselines evaluados en valoraciones de arena y comparaciones de preferencia por pares", sin cifras, sin métricas concretas y sin identificar qué baselines se evaluaron. La figura de evaluación referenciada (`assets/evaluation.png`) no está disponible en el texto proporcionado.

| Aspecto evaluado | Resultado declarado | Datos numéricos |
|---|---|---|
| Arena ratings | Superior a todos los baselines evaluados (afirmación del autor) | no disponible |
| Comparación por pares | Preferido frente a todos los baselines evaluados (afirmación del autor) | no disponible |
| Métricas por canal PBR | no disponible | no disponible |
| Calidad de superresolución | no disponible | no disponible |
| Baselines empleados | no identificados en la información disponible | no disponible |

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM, GPU recomendadas, latencia ni throughput.
- El repositorio reporta un tamaño de 0,0 GB y ningún archivo de pesos confirmado, por lo que la ejecución local podría no ser posible con los artefactos publicados actualmente en HuggingFace.
- Los nombres de archivo indican versiones en bf16, fp8_e4m3fn y fp16 podado del VAE, lo que sugiere que los autores contemplan al menos dos perfiles de memoria: uno de mayor precisión y otro orientado a GPUs con menos VRAM.
- La presencia de un componente Qwen3.5-9B dentro de UltraTex-MV-MR implica, en el caso de cargarse completo, un consumo de memoria relevante solo para ese subcomponente antes de contar el transformer de difusión.
- Estimación orientativa, no confirmada por los autores: un pipeline completo con generación multivista más superresolución probablemente requiera GPUs de gama profesional (A100, H100, L40S) o, en el mejor de los casos con las variantes fp8, GPUs consumer de 24 GB o más. Esta estimación no debe tomarse como dato verificado.
- Opciones de despliegue: no documentadas. La estructura de directorios (`scheduler/`, `transformer/`, `vae/`) es compatible con el ecosistema Diffusers, lo que abriría la puerta a librerías de inferencia de difusión, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este tipo de modelo).

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica los baselines utilizados en la evaluación ni menciona otros métodos de generación de texturas PBR, por lo que no es posible construir una comparativa verificable de parámetros, contexto, rendimiento, licencia y disponibilidad. Los resultados de la búsqueda web realizada no contienen información relevante sobre UltraTex ni sobre modelos comparables (devuelven únicamente páginas de ayuda sobre Facebook, sin relación con el modelo).

## Limitaciones y advertencias

- Licencia no especificada: al no declararse una licencia para los pesos, no puede asumirse permiso de uso comercial. Las figuras del proyecto llevan aviso CC BY-NC-SA 4.0, que prohíbe el uso comercial y exige atribución y compartir igual.
- Disponibilidad incierta: el repositorio reporta 0,0 GB, 0 descargas y 0 likes, sin pipeline declarado ni idiomas, lo que sugiere que los pesos podrían no estar efectivamente publicados o accesibles.
- Sin datos de entrenamiento: se desconoce la composición del dataset, su procedencia y sus posibles sesgos (por ejemplo, predominio de ciertos tipos de materiales o estilos), lo que impide evaluar la generalización a dominios no vistos.
- Riesgo de artefactos y alucinación visual: como modelo generativo, puede producir canales PBR físicamente inconsistentes o detalles inexistentes respecto a la geometría real del activo; la propia model card enfatiza la alineación física como objetivo, lo que implica que es un problema relevante en este tipo de sistemas.
- Evaluación no verificable: la afirmación de superioridad frente a baselines no viene acompañada de cifras, protocolos ni identidad de los comparados, por lo que no puede reproducirse ni auditarse con la información disponible.
- Sin soporte documentado de condicionamiento por texto: no se describe entrada mediante prompts en ningún idioma, de modo que no puede asumirse control textual ni comportamiento multilingüe.
- Sin documentación de despliegue: no se publican requisitos de hardware, latencia, throughput ni instrucciones de instalación más allá del árbol de pesos, lo que dificulta la puesta en producción.
- Naturaleza académica: el trabajo está asociado a una publicación de SIGGRAPH Asia 2026 y su público objetivo son investigadores de gráficos por computador; el soporte y el mantenimiento a largo plazo no están garantizados.
- Fecha de creación futura respecto a la mayoría de repositorios del ecosistema (septiembre de 2026), lo que puede indicar un repositorio recién creado y todavía incompleto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jingzhi03/UltraTex
- Página del proyecto: https://ultratex.vercel.app/
- Vídeo de demostración: https://jingzhi03.com/watch/ultratex
- Repositorio de código en GitHub: https://github.com/ZqlwMatt/UltraTex
- Visor interactivo (demo): https://ultratex-dev.vercel.app/
- Página del autor principal, Jingzhi Bao: https://jingzhi03.com/
- Página de Xiaohe Ma: https://xiaohema98.com/
- Página de Hong Li: https://luh1124.github.io/hongli.github.io/
- Página de Yuanming Hu: https://yuanming.taichi.graphics/
- Grupo GAP Lab (Xiaoguang Han), CUHK: https://gaplab.cuhk.edu.cn/
- Licencia Creative Commons BY-NC-SA 4.0 (aplicada a las figuras del proyecto): https://creativecommons.org/licenses/by-nc-sa/4.0/
- Fuentes de los recursos gráficos del proyecto: `assets/SOURCES.md` (ruta relativa dentro del repositorio)
- Nota sobre la búsqueda web: los resultados obtenidos no contienen información relevante sobre UltraTex ni sobre modelos comparables; no se han localizado papers, blogs ni repositorios adicionales en las fuentes consultadas.

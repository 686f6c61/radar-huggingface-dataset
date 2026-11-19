# mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF es una colección de cuantizaciones GGUF (formato i1, con matriz de importancia) del modelo DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source, un fine-tune de 27.320.697.856 parámetros etiquetado como "abliterated", "uncensored" y "heretic", orientado a escritura creativa de terror, rol y simulación. El autor de las cuantizaciones es mradermacher, que publica versiones optimizadas para inferencia local en CPU y GPU de gama media mediante llama.cpp y derivados.

El modelo base parte de la familia Qwen3.8 (27B) y ha sido modificado para eliminar las capas de rechazo y alineación de seguridad, de ahí las etiquetas "abliterated" y "heretic". La model card declara 13 modos de razonamiento, 13 modos de instrucción y 10 "EVIL AI Constructs" (incluido "Turbo-Brilliance Evil Ed"), además de un "Halloween O/S" como envoltorio temático. El repositorio pesa 218,6 GB e incluye cuantizaciones desde Q2_K (11,0 GB) hasta Q6_K (22,5 GB).

Su relevancia actual es acotada: no es un modelo de propósito general ni compite en benchmarks estándar, sino una variante de nicho para generación creativa sin filtros en inglés. La licencia declarada es Apache 2.0, aunque el contenido generado puede ser inapropiado para producción sin moderación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B); detalles de atención no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de imatrix) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer derivado de Qwen3.8-27B. El modelo base ha sido sometido a un proceso de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) y etiquetado como "heretic", lo que sugiere un fine-tune adicional para reducir la adherencia a políticas de seguridad. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Las cuantizaciones publicadas por mradermacher emplean el método i1 (imatrix) de llama.cpp, que calcula una matriz de importancia a partir de datos de calibración para preservar mejor la perplejidad en tamaños bajos. El autor incluye una tabla de tamaños por cuantización y recomienda IQ3_XXS sobre Q2_K y IQ3_S sobre Q3_K*, así como Q4_K_M como opción "rápida y recomendada". No se documentan innovaciones arquitectónicas propias (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto creativo en inglés: ficción, terror, relatos y escritura de todos los géneros según las etiquetas del autor.
- Roleplaying y simulación de personajes, incluidos los "10 EVIL AI Constructs" declarados en la model card.
- Modo "thinking"/razonamiento: la model card menciona 13 modos de razonamiento y 13 modos de instrucción, aunque no se detalla su funcionamiento.
- Modo "Halloween O/S": envoltorio temático de sistema declarado por el autor.
- Conversación multi-turno (etiqueta "conversational").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.
- Contenido sin censura: el modelo está diseñado explícitamente para no rechazar peticiones, incluidas las de contenido sensible (etiqueta "not-for-all-audiences").

## Casos de uso

- Escritura de ficción de terror y relatos cortos: el fine-tune está orientado a narrativa de género y mantiene coherencia en textos largos dentro de su ventana de contexto (longitud no especificada); adecuado para autores que buscan borradores sin filtros editoriales automáticos.
- Roleplaying y juegos de mesa narrativos: los modos de personaje y los "EVIL AI Constructs" permiten encarnar antagonistas y simulaciones de villanos en partidas o prototipos de videojuegos.
- Generación de contenido para campañas temáticas de Halloween: el "Halloween O/S" y las etiquetas de horror lo hacen idóneo para material estacional de marketing o eventos, siempre con revisión humana.
- Prototipado de narrativa interactiva: su naturaleza conversacional permite construir árboles de diálogo ramificados para novelas visuales o aventuras conversacionales en local.
- Investigación sobre alineación y abliteration: útil como caso de estudio de modelos "uncensored" para medir qué se pierde y qué se gana al eliminar capas de rechazo, comparándolo con el Qwen3.8-27B original.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutarlo en GPUs de 24 GB (RTX 3090/4090) con llama.cpp u Ollama, sin depender de la nube.
- Generación de guiones para podcasts de terror o audiodramas: el tono y la ausencia de filtros facilitan borradores rápidos que luego se editan manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11 GB (i1-Q2_K), ~16,9 GB (i1-Q4_K_M), ~19,6 GB (i1-Q5_K_M), ~22,5 GB (i1-Q6_K). Hay que sumar el espacio para el contexto KV, que crece con la longitud de secuencia.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para Q6_K con contextos largos; GPUs de 16 GB (RTX 4080, A4000) solo para cuantizaciones Q3 o IQ3.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 12-16 GB solo con Q2_K o IQ3_S y contextos reducidos, o mediante offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base en safetensors requiere transformers con aceleración de GPU.
- Latencia y throughput: no disponibles. Como referencia cualitativa, las cuantizaciones Q4_0 y Q4_K_M están marcadas por el autor como "fast", y Q4_K_S como "óptima en tamaño/velocidad/calidad".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (i1) y safetensors | Fine-tune sin censura para terror y rol, solo inglés |
| Qwen3.8-27B (base, sin fine-tune) | ~27 B | no disponible | Apache 2.0 (según familia Qwen) | safetensors, GGUF | Alineado y con rechazos; uso general |
| DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source | 27,3 B | no disponible | Apache 2.0 | safetensors | Modelo base del que derivan estas cuantizaciones |
| Otras variantes "abliterated" de la familia Qwen | ~27 B | no disponible | Apache 2.0 | safetensors, GGUF | Misma técnica de eliminación de rechazos; rendimiento no comparable sin benchmarks |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Contenido sin censura: el modelo está diseñado para no rechazar peticiones y puede generar material violento, sexual o perturbador; requiere moderación obligatoria en cualquier despliegue público.
- Riesgo de alucinación elevado en un fine-tune creativo de nicho, especialmente en tareas factuales o técnicas para las que no fue entrenado.
- Solo inglés: no se declara soporte de castellano ni de otros idiomas; el rendimiento multilingüe será probablemente deficiente.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos sin pruebas empíricas.
- La licencia Apache 2.0 se declara en la model card, pero el contenido generado puede infringir políticas de plataformas o normativa sobre contenido dañino; la responsabilidad recae en el desplegador.
- Etiqueta "not-for-all-audiences": no apto para productos dirigidos a menores ni para entornos corporativos sin revisión legal.
- El proceso de abliteration puede degradar capacidades de razonamiento e instrucción respecto al modelo base; no hay benchmarks que lo cuantifiquen.
- Repositorio de 218,6 GB: la descarga completa es costosa; conviene bajar solo la cuantización necesaria.
- Fecha de creación futura (2026-10-30) en los metadatos: verificar la procedencia y el estado real del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
- Perfil de nicoboss: https://huggingface.co/nicoboss

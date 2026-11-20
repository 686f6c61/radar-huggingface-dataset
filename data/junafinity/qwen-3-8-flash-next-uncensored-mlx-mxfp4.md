# junafinity/Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4

## Resumen

Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4 es una conversión cuantizada en formato MLX del checkpoint abliterado (sin mecanismos de rechazo) de Qwen3.8-Flash-Next, un modelo de lenguaje y visión de arquitectura MoE desarrollado originalmente por Qwen/Alibaba. La conversión la firma junafinity, bajo la marca VeriSafe.Live, y parte del build BF16 sin censura de OrcaRouter, no del checkpoint oficial de Qwen. El resultado es un modelo de aproximadamente 180.000 millones de parámetros con ventana de contexto de 262.144 tokens, pensado para ejecutarse en Apple Silicon mediante la librería MLX.

El interés técnico principal reside en su estrategia de cuantización mixta: no es un 4-bit uniforme, sino que combina MXFP4 con grupo de 32 en las proyecciones gate/up de los expertos enrutados y en la tabla PLE de n-gramas, mientras mantiene en BF16 o en anchos afines superiores las proyecciones down, la atención, las conexiones GDN e hyper-connections, los expertos compartidos y la torre de visión y vídeo completa. Conserva además la cabeza MTP de una capa, lo que habilita decodificación especulativa nativa en runtimes compatibles.

La relevancia del modelo es doble: por un lado, demuestra una receta de cuantización mixta que evita el conocido precipicio de calidad del 4-bit uniforme en esta arquitectura (hasta un +20,6 % de perplejidad en WikiText frente a BF16, según la model card); por otro, su naturaleza abliterada lo convierte en una herramienta específica para investigación en seguridad, interpretabilidad y red-teaming, no para despliegue en producción sin capas adicionales de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención, GDN (gated delta network), hyper-connections, torre de visión y vídeo, cabeza MTP de una capa (arquitectura `qwen4_exp`) |
| Parametros totales | 179.999.981.459 (≈180 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MXFP4 con grupo de 32 en expertos gate/up y tabla PLE; anchos afines superiores o BF16 en down-projections, atención, GDN, hyper-connections, expertos compartidos y tensores de frontera de vocabulario; torre de visión y vídeo en BF16 |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | qwen-community-license (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato MLX, 20 shards, 100,53 GB (93,63 GiB), 3245 tensores |

## Arquitectura y entrenamiento

El modelo original Qwen3.8-Flash-Next emplea una arquitectura transformer con mezcla de expertos (MoE) etiquetada como `qwen4_exp`, que incorpora mecanismos GDN (gated delta networks) e hyper-connections junto a la atención clásica, además de una torre multimodal para imagen y vídeo y una cabeza MTP (multi-token prediction) de una capa. Esta conversión no reentrena nada: parte del checkpoint BF16 de OrcaRouter, que a su vez aplica una edición quirúrgica sobre los residual writers para eliminar los mecanismos de rechazo (abliteration). El repositorio de junafinity solo altera el formato numérico.

La cuantización se realizó en streaming desde el BF16 sin censura, asignando MXFP4 (grupo de 32) a los tensores que lo requieren por diseño (ancho de n-grama 160 en la tabla PLE de 51 B, proyecciones gate/up de expertos enrutados) y manteniendo mayor precisión en tensores sensibles. La model card reporta `skipped_div` igual a 0, es decir, ningún tensor quedó sin cuantizar por error de divisibilidad. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento explícito y modos de pensamiento (etiqueta `reasoning` en el repositorio).
- Comprensión de imagen y vídeo mediante la torre multimodal completa conservada en BF16 (pipeline `image-text-to-text`).
- Function calling y tool calling, según las etiquetas del repositorio.
- Capacidades de agente y razonamiento multi-paso, implícitas en las etiquetas `function-calling` y `reasoning`.
- Decodificación especulativa nativa gracias a la cabeza MTP de una capa incluida en el checkpoint (soportada por oMLX 0.6.3+; mlx-vlm 0.6.17 descarta esas claves al cargar).
- Multilingüismo limitado a inglés y chino según la model card.
- Comportamiento sin rechazo: responde a peticiones que el modelo original rechazaría, incluida la generación de contenido dañino, ofensivo o ilegal.

## Casos de uso

- Investigación en mecanismos de rechazo: comparar las respuestas del modelo abliterado con las del Qwen3.8-Flash-Next original sobre un conjunto de prompts sensibles permite aislar qué direcciones residuales codifican la negativa y validar técnicas de abliteration de forma reproducible.
- Red-teaming y evaluación de robustez: usar el modelo como generador adversarial para producir prompts y respuestas dañinas controladas y alimentar con ellas clasificadores de seguridad y filtros de moderación antes de desplegarlos.
- Estudio de interpretabilidad multimodal: la torre de visión y vídeo en BF16 permite analizar cómo se representan imágenes y vídeos en un MoE de 180 B sin la distorsión que introduciría una cuantización agresiva de esa torre.
- Experimentación con decodificación especulativa: la cabeza MTP conservada permite medir en Apple Silicon la ganancia de throughput de la predicción multi-token frente a la decodificación autoregresiva estándar, con oMLX 0.6.3 o superior.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto, un Mac Studio con memoria unificada suficiente puede resumir o extraer información de contratos, informes o transcripciones extensas sin enviar datos a la nube.
- Evaluación de recetas de cuantización: comparar esta mezcla MXFP4/afín/BF16 con el 4-bit uniforme y con el 4/8 mixto sobre tareas de código, matemáticas y visión sirve para caracterizar el precipicio de calidad por tipo de tensor en arquitecturas MoE con GDN.
- Prototipado de asistentes de imagen y vídeo sin censura para investigación de sesgos: analizar cómo un modelo sin alineamiento describe personas, escenas o contenido sensible en comparación con su contrapartida alineada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una métrica de degradación por cuantización: la perplejidad en WikiText de un 4-bit uniforme sobre esta arquitectura es un 20,6 % superior a la de BF16 (dato atribuido a PipeNetwork), mientras que una receta mixta 4/8 sobre la línea oficial no censurada se sitúa en +1,3 %. No se proporciona la cifra correspondiente a esta conversión concreta.

## Requisitos de hardware

- VRAM o memoria unificada: el payload de safetensors ocupa 100,53 GB (93,63 GiB) en 20 shards; se necesita un equipo con al menos unos 100 GB de memoria disponible para cargar los pesos, más el overhead del runtime y de la caché KV para contextos largos.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon; encajan equipos con memoria unificada de 128 GB o más (por ejemplo, Mac Studio con M3 Ultra o M4 Max de gama alta). No es un formato para A100, H100 ni RTX 4090 sin reconversión.
- GPU de consumo: no cabe en ninguna GPU de consumo convencional por tamaño; en Apple Silicon, los modelos con 64 GB o menos no pueden alojarlo completo.
- Despliegue: oMLX 0.6.3 o superior (soporta visión y MTP nativo) o mlx-vlm 0.6.17 o superior (soporta visión, pero descarta las claves MTP al cargar). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4 (este) | ≈180 B | 262.144 | MLX MXFP4 mixto | qwen-community-license | Abliterado, visión y vídeo en BF16, MTP conservado |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 | no disponible | Fuente BF16 sin censura de esta conversión |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors oficiales | qwen-community-license | Modelo original alineado; referencia de calidad y seguridad |
| pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit | no disponible | no disponible | MLX 4/8 mixto | no disponible | Receta mixta citada con +20,6 % de perplejidad en WikiText frente a BF16 |

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido sustancialmente eliminado: el modelo cumplirá peticiones dañinas, poco éticas, ofensivas o ilegales que el original rechazaría, y no tiene barreras integradas.
- No debe desplegarse de cara a usuarios finales ni en producción sin capas propias de seguridad, moderación y prevención de abuso.
- Riesgo elevado de alucinación y de afirmaciones falsas sin matices, especialmente en dominios especializados; no se han publicado evaluaciones de fidelidad en la información disponible.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- La licencia Qwen Community License 1.0 impone condiciones específicas de uso comercial que deben revisarse antes de cualquier explotación; además pueden aplicar los términos del checkpoint de OrcaRouter.
- La cuantización mixta introduce degradación medible frente a BF16 (referencias de +1,3 % a +20,6 % de perplejidad en WikiText según la receta); no hay cifra publicada para esta conversión concreta.
- El formato MLX limita el despliegue a Apple Silicon y a los runtimes oMLX y mlx-vlm; no hay soporte documentado para ecosistemas CUDA.
- La cabeza MTP se descarta silenciosamente al cargar con mlx-vlm 0.6.17, lo que desactiva la decodificación especulativa sin aviso.
- El modelo no refleja las opiniones de los uploaders, de OrcaRouter ni de Qwen/Alibaba, y los autores declinan toda responsabilidad por el uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junafinity/Qwen-3.8-Flash-Next-Uncensored-MLX-MXFP4
- Fuente BF16 sin censura: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta mixta 4/8 de referencia: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-mixed-4_8bit
- Runtime oMLX: https://github.com/jundot/omlx
- Runtime mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Sitio del autor: https://verisafe.live

# johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN

## Resumen

Swift 1.5 Flash-Next Heretic ReverseEngineer HGN es una conversión comunitaria de un modelo de lenguaje de gran escala derivado de la familia Qwen 3.8, orientada a generación de texto sin restricciones de rechazo (abliterated) y afinada para programación e ingeniería inversa. El modelo original parte de la arquitectura Qwen3.8-Flash-Next, pasa por un post-entrenamiento Swift 1.5, después por un proceso de abliteración Heretic V2 y finalmente por una cuantización IQ4_XS-plus en formato GGUF. Esta ficha describe la versión publicada por johnlockejrr, que reempaqueta esos pesos en el formato propietario HGN v2 para su uso con el servidor halogen-flash-server sobre hardware AMD Strix Halo (gfx1151).

La relevancia de esta publicación es fundamentalmente técnica y de nicho: no se trata de un modelo nuevo entrenado desde cero, sino de una conversión de formato que permite ejecutar un modelo MoE de gran tamaño en un APU con memoria unificada de 124 GiB. El repositorio incluye el checkpoint principal de 62,1 GiB, una tabla de búsqueda n-gram de 47,7 GiB en FP8 y una torre de visión opcional de 0,84 GiB, sumando aproximadamente 111 GiB. El modelo solo es cargable mediante el contenedor halogen-flash-server; no funciona con transformers, vLLM ni llama.cpp.

Se trata de un modelo sin censura, con la conducta de rechazo eliminada deliberadamente, lo que traslada toda la responsabilidad de uso al operador. La licencia es swift-open-license-1.0, distinta de las licencias habituales de la familia Qwen, y debe revisarse antes de cualquier despliegue comercial. La información disponible no incluye resultados de benchmarks de calidad, por lo que las cifras de rendimiento publicadas se limitan a velocidad de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE derivada de Qwen3.8-Flash-Next, con cabezal MTP y torre de visión |
| Parametros totales | no disponible (la tabla n-gram contiene 51B parámetros; el checkpoint principal no declara el total) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HGN v2 con formatos por familia de tensores: I4R (expertos enrutados), HT4 (proyecciones densas, LM head, embeddings), Q6G64 (mezcladores de hiperconexión), FP8 (tabla n-gram), BF16 (torre de visión) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | swift-open-license-1.0 |
| Formato de pesos | .hgn (HGN v2, especificación hgn-spec 1.1.0); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) de la familia Qwen 3.8, según la cadena de derivación documentada: Qwen3.8-Flash-Next como base arquitectónica, post-entrenamiento Swift 1.5 por ukisai, abliteración Heretic V2 por jeffpeng3 y cuantización IQ4_XS-plus en GGUF por trubisky. El modelo incorpora componentes poco habituales: mezcladores de hiperconexión (tensores Q6G64), estado SSM, un router de expertos, un cabezal de decodificación especulativa MTP (multi-token prediction) y una torre de visión. La tabla n-gram en FP8 de 51B parámetros actúa como mecanismo de búsqueda asociativa complementario.

El proceso de conversión no es un entrenamiento ni un ajuste fino. El conversor `Quat3rnion/bf16-to-hgn` (perfil v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`) decodifica los valores del GGUF IQ4_XS-plus y los recodifica en los formatos HGN v2, añadiendo una segunda etapa de redondeo sobre la cuantización original. La conversión se ejecutó en una RTX 3090 (sm_86) durante 35 minutos y 35 segundos, transformando 1.658 tensores de origen en 2.349 tensores de salida. El cabezal MTP se copió byte a byte desde el checkpoint publicado por peonist-ai, y la torre de visión (333 tensores BF16) se tomó del mismo repositorio. El error relativo de energía tras la decodificación es del 0,94% en expertos enrutados, 0,6-1,1% en proyecciones densas y embeddings, 0,06% en mezcladores de hiperconexión y 0,07% en la tabla n-gram; normas, router, estado SSM y torre de visión quedan exactos. Esta métrica mide solo el segundo redondeo, no la distancia a los pesos BF16 originales.

## Capacidades

- Generación de texto en inglés y chino, con especial énfasis en código y tareas de ingeniería inversa según el ajuste declarado.
- Razonamiento multi-paso y soporte de decodificación especulativa mediante el cabezal MTP incluido en el checkpoint.
- Procesamiento de imágenes a través de la torre de visión opcional (0,84 GiB en BF16); sin ella el motor funciona solo con texto.
- Comportamiento sin censura: la conducta de rechazo ha sido eliminada deliberadamente mediante abliteración Heretic V2.
- Búsqueda n-gram asistida por una tabla de 51B parámetros en FP8, que el motor debe mantener junto al checkpoint principal.
- No se documenta soporte explícito de tool calling, function calling ni modos de agente en la información disponible.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.

## Casos de uso

- Ingeniería inversa de binarios y análisis de código ofuscado: el ajuste Heretic ReverseEngineer está orientado a este dominio, y el modelo puede generar explicaciones y reconstrucciones de fragmentos de código con contexto largo, siempre que el motor soporte la ventana declarada en `config.json`.
- Asistencia a la programación en entornos controlados: generación y refactorización de código en inglés o chino, desplegada sobre halogen-flash-server en un APU Strix Halo con 124 GiB de memoria unificada.
- Procesamiento de documentación técnica con imágenes: con la torre de visión montada, el modelo puede analizar diagramas, capturas de pantalla y esquemas junto a texto explicativo.
- Investigación sobre alineación y abliteración: el checkpoint permite estudiar el efecto de la eliminación de rechazo sobre las respuestas en tareas sensibles, comparándolo con el modelo base no abliterado.
- Evaluación de formatos de cuantización: sirve como caso de estudio de la cadena GGUF IQ4_XS-plus a HGN v2, con errores de redondeo documentados por familia de tensores.
- Despliegue local en hardware AMD Strix Halo: el formato HGN v2 está diseñado específicamente para gfx1151, con velocidades declaradas de 56 tok/s por usuario único y 93 tok/s agregados con 4 concurrentes.
- Prototipado de pipelines de generación de texto sin restricciones de contenido en entornos de investigación cerrados, asumiendo la responsabilidad legal del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad en la información disponible. El autor indica explícitamente que los benchmarks de calidad están pendientes. Solo se documentan métricas de velocidad y de error de conversión.

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de generación (usuario unico) | ~56 tok/s | halogen-flash-server 0.18.22, Strix Halo 124 GiB, 512 tokens de salida, MTP activado |
| Throughput agregado | 93 tok/s | 4 peticiones concurrentes, mismas condiciones |
| Prefill | ~1.800 tok/s | Prompt de 6,1K tokens |
| Tiempo de arranque | 12,5 s | halogen-flash-server 0.18.22 |
| Error de conversion (expertos enrutados) | 0,94% | Verificacion `bf16-to-hgn verify` |
| Error de conversion (proyecciones densas, LM head, embeddings) | 0,6-1,1% | Verificacion `bf16-to-hgn verify` |
| Error de conversion (mezcladores de hiperconexion) | ~0,06% | Verificacion `bf16-to-hgn verify` |
| Error de conversion (tabla n-gram) | 0,07% | Verificacion `bf16-to-hgn verify` |

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 62 GiB residentes para el checkpoint principal, más la tabla n-gram mapeada en memoria de 47,7 GiB; el repositorio completo ocupa unos 111 GiB.
- GPU recomendadas: el formato está orientado a AMD Strix Halo (gfx1151) con 124 GiB de memoria unificada. El conversor se cualificó en sm_89 y se ejecutó en sm_86 (RTX 3090), pero la inferencia no está validada en CUDA.
- No cabe en GPU de consumo convencionales con 24 GiB o menos; requiere un APU Strix Halo o un sistema con memoria unificada de al menos 124 GiB.
- Opciones de despliegue: exclusivamente halogen-flash-server, que monta los archivos `.hgn`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: ver tabla de benchmarks; 56 tok/s por usuario único y 93 tok/s con 4 concurrentes en Strix Halo.
- La torre de visión es opcional y añade 0,84 GiB; sin ella el motor opera solo con texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGN v2) | no disponible (n-gram de 51B) | no disponible | .hgn | swift-open-license-1.0 | Hugging Face, solo halogen-flash-server |
| trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer | mismo modelo base | no disponible | GGUF IQ4_XS-plus (94,7 GB) | no disponible en la informacion | Hugging Face |
| peonist-ai/halogen-qwen3.8-flash-next | mismo modelo base | no disponible | .hgn | no disponible en la informacion | Hugging Face |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | mismo modelo base | no disponible | no disponible | swift-open-license-1.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo sin censura: la conducta de rechazo se ha eliminado deliberadamente; el operador asume toda la responsabilidad legal y ética del uso.
- No es una cuantización desde BF16: parte de un GGUF ya cuantizado en IQ4_XS-plus, por lo que acumula dos etapas de redondeo y el conversor no reclama equivalencia con BF16.
- El cabezal MTP es el original, entrenado contra el tronco estándar y no contra los pesos Heretic, lo que puede degradar la calidad de la decodificación especulativa.
- La conversión no se ha comparado byte a byte entre backend CUDA y CPU; el conversor está cualificado en sm_89 pero esta ejecución usó sm_86.
- No hay benchmarks de calidad publicados; el rendimiento real en tareas de código o razonamiento es desconocido.
- Compatibilidad restringida a halogen-flash-server; no se puede cargar en transformers, vLLM ni llama.cpp, lo que limita su integración en pipelines estándar.
- Idiomas limitados a inglés y chino; no se documenta soporte de español ni de otras lenguas.
- Licencia swift-open-license-1.0, distinta de las licencias de la familia Qwen; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Conversión comunitaria no cualificada por los autores de los proyectos upstream; el propio autor solicita reportar resultados en la pestaña de discusión.
- Riesgo de alucinación y sesgos no evaluados: al no existir benchmarks ni evaluaciones de seguridad publicadas, no se puede caracterizar su comportamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN
- Modelo base en Hugging Face: https://huggingface.co/trubisky/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Checkpoint HGN de referencia: https://huggingface.co/peonist-ai/halogen-qwen3.8-flash-next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Conversor bf16-to-hgn: https://github.com/Quat3rnion/bf16-to-hgn
- Especificación HGN: https://github.com/jtsylve/hgn-spec
- Servidor halogen-flash-server: https://github.com/peonist-ai/halogen-flash-server

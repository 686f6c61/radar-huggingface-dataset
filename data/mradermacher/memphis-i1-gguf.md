# mradermacher/MEMPHIS-i1-GGUF

## Resumen

MEMPHIS-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo darkc0de/MEMPHIS, un fine-tuning de la familia Qwen 3.5 (etiqueta `qwen3_5` en los tags del repositorio) con 26.895.998.464 parámetros totales según los pesos safetensors del modelo base. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, que en este caso ofrece tanto cuantizaciones estáticas (repositorio MEMPHIS-GGUF) como cuantizaciones ponderadas con imatrix (este repositorio, sufijo `i1`).

El modelo base está orientado a generación de texto conversacional sin censura: los tags incluyen `heretic`, `uncensored`, `toxic` y `not-for-all-audiences`, lo que indica que se ha aplicado un proceso de eliminación o atenuación de los rechazos alineados del modelo original (técnica conocida como abliteration o herejía). El dataset de ajuste es darkc0de/The-Mind-of-XORTRON. La licencia declarada es Apache 2.0.

La relevancia de esta ficha es práctica: permite ejecutar en local, mediante llama.cpp u otros runners compatibles con GGUF, un modelo de aproximadamente 27.000 millones de parámetros en formatos que van desde los 7,2 GB (IQ1_S) hasta los 22,2 GB (Q6_K), lo que lo hace viable en GPUs de consumo con suficiente VRAM o en configuraciones con offload a RAM. La model card no documenta benchmarks, contexto ni composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tag `qwen3_5`); detalles de atención y capas no disponibles |
| Parametros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; versiones estáticas en repositorio aparte |
| Idiomas soportados | inglés (`en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna más allá de la etiqueta `qwen3_5`, que sitúa el modelo base en la familia Qwen 3.5 de Alibaba. Con 26,9 mil millones de parámetros y un tamaño de repositorio de 300,3 GB (que incluye todas las cuantizaciones), se trata de un transformer denso de escala media-grande; no hay indicios de arquitectura MoE ni de mecanismos híbridos SSM en la información disponible. Tampoco se especifican número de capas, dimensión oculta, cabezas de atención ni tipo de positional encoding.

El ajuste se realizó sobre el dataset darkc0de/The-Mind-of-XORTRON, del que no se publica composición, número de tokens ni metodología (SFT, DPO o RLHF). Los tags `heretic` y `uncensored` sugieren una modificación deliberada del comportamiento de rechazo del modelo base, probablemente mediante abliteration o un fine-tuning orientado a eliminar respuestas de negativa. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícitos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Respuestas sin filtros de seguridad alineados (modelo `uncensored`/`heretic`), incluyendo contenido potencialmente tóxico o para adultos.
- Compatible con `text-generation-inference` según los tags del repositorio.
- Ejecutable en llama.cpp y runners compatibles con GGUF (Ollama, LM Studio, KoboldCpp, entre otros).
- Posible soporte de visión: la model card de mradermacher indica que es un modelo de visión y que los ficheros mmproj, si existen, están en el repositorio estático MEMPHIS-GGUF; no se confirma en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Experimentación en local con modelos sin alineación: el modelo permite estudiar el comportamiento de un transformer de ~27B tras eliminar los rechazos, útil en investigación sobre seguridad y alineación. La cuantización Q4_K_M (16,6 GB) es un punto de partida razonable.
- Generación creativa sin restricciones temáticas: escritura de ficción, guiones o narrativa adulta donde los filtros de seguridad de modelos alineados resultan limitantes; el tag `not-for-all-audiences` lo posiciona explícitamente para este uso.
- Roleplay y personajes conversacionales: la naturaleza conversacional y la ausencia de rechazos encajan con plataformas de roleplay local (KoboldCpp, SillyTavern) que consumen GGUF.
- Evaluación de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de IQ1_S a Q6_K), lo que permite medir la degradación de perplejidad y calidad entre niveles, con el fichero imatrix incluido para generar cuantizaciones propias.
- Despliegue en hardware de consumo: con Q4_K_S (15,7 GB) o IQ4_XS (15,2 GB) el modelo cabe en GPUs de 16-24 GB, lo que facilita prototipado sin infraestructura de centro de datos.
- Investigación sobre datasets de ajuste: al estar entrenado sobre The-Mind-of-XORTRON, sirve para reproducir y analizar el efecto de dicho dataset en el comportamiento del modelo base Qwen 3.5.
- Pruebas de robustez y red teaming: un modelo sin filtros es un banco de pruebas útil para evaluar clasificadores de toxicidad y sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaño de fichero, más overhead de contexto y KV cache):
  - IQ1_S: 7,2 GB; IQ2_M: 10,1 GB; IQ3_M: 12,7 GB.
  - IQ4_XS: 15,2 GB; Q4_K_S: 15,7 GB; Q4_K_M: 16,6 GB.
  - Q5_K_M: 19,3 GB; Q6_K: 22,2 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100/H100 para Q6_K con contexto largo o despliegue concurrente.
- GPUs de consumo: sí cabe en RTX 4090, RTX 3090 y, en cuantizaciones bajas (IQ2/IQ3), en GPUs de 12-16 GB como RTX 4070 Ti Super o RTX 4080, con posible offload parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runner compatible con GGUF; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque el formato nativo de TGI no es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MEMPHIS-i1-GGUF (este) | ≈26,9B | no disponible | Apache 2.0 | GGUF (i1) | Fine-tuning sin censura de Qwen 3.5; sin benchmarks publicados |
| mradermacher/MEMPHIS-GGUF | ≈26,9B | no disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones estáticas y posible mmproj de visión |
| darkc0de/MEMPHIS | ≈26,9B | no disponible | Apache 2.0 | safetensors | Modelo base original; pesos completos |
| Qwen 3.5 original (referencia de familia) | según variante | no disponible en esta ficha | según variante | safetensors/GGUF | Modelo alineado del que deriva; comportamiento de rechazo intacto |

La comparación con alternativas de otros autores no está disponible en la información proporcionada; no se aportan datos de rendimiento que permitan un contraste cuantitativo.

## Limitaciones y advertencias

- Modelo explícitamente `uncensored`, `toxic` y `not-for-all-audiences`: puede generar contenido ofensivo, sexual o dañino sin filtros; no apto para aplicaciones orientadas al público general sin moderación externa.
- Riesgo elevado de alucinación y de respuestas factualmente incorrectas; no se han publicado evaluaciones que cuantifiquen su fiabilidad.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado y el comportamiento del modelo pueden acarrear responsabilidades legales y de reputación; conviene revisar las políticas de la plataforma donde se despliegue.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; la propia model card las etiqueta como "for the desperate" o "very low quality".
- El soporte de visión no está confirmado en este repositorio: los ficheros mmproj, si existen, están en el repositorio estático.
- No hay información sobre sesgos específicos, datos de entrenamiento ni procesos de evaluación; la trazabilidad del fine-tuning es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/MEMPHIS-i1-GGUF
- Modelo base: https://huggingface.co/darkc0de/MEMPHIS
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MEMPHIS-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#MEMPHIS-i1-GGUF
- Dataset de ajuste: darkc0de/The-Mind-of-XORTRON (referenciado en la model card; no se proporciona URL directa)
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests

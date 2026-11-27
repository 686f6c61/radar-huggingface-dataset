# mradermacher/Fara-1.5-27B-Heretic-Uncensored-GGUF

## Resumen

Fara-1.5-27B-Heretic-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo multimodal Fara-1.5-27B-Heretic-Uncensored, publicado por el usuario mradermacher. El modelo original, alojado en el repositorio lmcfarlin/Fara-1.5-27B-Heretic-Uncensored, es una variante "abliterated" o "decensored" del modelo Fara de Microsoft, orientado a tareas de computer-use (agents que controlan navegador y escritorio) y vision-language. La cuantizacion la realiza mradermacher mediante su pipeline habitual de conversion a GGUF, pensada para ejecucion local con llama.cpp y herramientas compatibles.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 27B) y esta disenado para actuar como agente web: interpreta capturas de pantalla y genera acciones sobre interfaces graficas. La variante "Heretic-Uncensored" implica que se han aplicado tecnicas de abliteration para eliminar los mecanismos de rechazo del modelo base, lo que cambia su comportamiento en cuanto a contenido sensible. La licencia declarada es MIT.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo de 27B con capacidades multimodales y de agente, una cuantizacion GGUF lista para consumer hardware, y una modificacion de alineamiento (abliterated) que condiciona fuertemente su uso responsable. No se dispone de informacion publica sobre benchmarks ni sobre el proceso de entrenamiento del modelo base en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal vision-language; arquitectura concreta no especificada) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, x-f16; ademas mmproj-Q8_0 y mmproj-f16 para la parte multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los tags indican que es un modelo multimodal vision-language con capacidades de computer-use y web-agent, lo que implica un encoder visual acoplado a un modelo de lenguaje de aproximadamente 27B parametros. La presencia de ficheros mmproj confirma la separacion entre el proyector multimodal y los pesos del lenguaje, un patron habitual en modelos tipo LLaVA o Qwen-VL.

Respecto al entrenamiento, la unica informacion disponible es que el modelo deriva de Fara-1.5-27B y que ha sido sometido a un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) para producir la variante Heretic-Uncensored. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF o DPO. La cuantizacion realizada por mradermacher es de tipo estatico, sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto y razonamiento multimodal en ingles.
- Procesamiento de imagenes y capturas de pantalla (vision-language), con soporte de proyector multimodal separado (mmproj).
- Control de navegador y automatizacion web (browser-automation, web-agent).
- Computer-use: interpretacion de interfaces graficas y generacion de acciones sobre escritorio.
- Ejecucion como agente en pipelines multi-paso (tags agent, magentic).
- Conversacion multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Comportamiento "uncensored": los mecanismos de rechazo han sido reducidos o eliminados mediante abliteration.
- No se documentan capacidades de tool calling, audio ni thinking mode explicito.

## Casos de uso

- Automatizacion de navegador: el modelo puede interpretar capturas de la pagina y generar acciones de clic, escritura y navegacion, lo que permite construir agentes que rellenan formularios o extraen datos de portales sin API.
- Testing de interfaces de usuario: dado que procesa capturas de pantalla, puede usarse para generar casos de prueba de flujos de UI o detectar regresiones visuales en pipelines de QA.
- Asistentes de escritorio locales: con cuantizaciones Q4_K_S (15,7 GB) puede desplegarse en una estacion de trabajo con GPU consumer y operar sobre aplicaciones locales.
- Extraccion de datos de documentos escaneados o capturas: al ser vision-language, puede transcribir y estructurar informacion de imagenes en entornos donde no se dispone de OCR especializado.
- Investigacion sobre alineamiento y seguridad: la variante abliterated sirve como caso de estudio para analizar como la eliminacion de direcciones de rechazo afecta al comportamiento del modelo en tareas sensibles.
- Prototipado de agentes web en local: al estar en GGUF, permite experimentar con llama.cpp sin depender de APIs externas, util para entornos con requisitos de privacidad.
- Generacion de contenido en ingles sin filtros: para casos donde el rechazo del modelo base interfiere con tareas creativas o de analisis, aunque con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos del lenguaje): Q2_K ~11,2 GB; Q4_K_S ~15,7 GB; el resto de cuantizaciones no tienen tamano publicado en la informacion disponible.
- El proyector multimodal anade 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16).
- Para Q4_K_S se recomienda una GPU con al menos 20-24 GB de VRAM para dejar margen al contexto y al proyector; una RTX 4090 (24 GB) es suficiente para esta cuantizacion.
- Q2_K podria caber en GPUs de 16 GB, aunque con perdida de calidad notable.
- Las cuantizaciones mayores (Q6_K, Q8_0, f16) requieren GPUs de 32-48 GB o superiores (A100, H100) o bien ejecucion parcial en CPU.
- Despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio, koboldcpp). No se documenta soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Fara-1.5-27B-Heretic-Uncensored-GGUF | ~27B | no disponible | Si (vision) | MIT | GGUF |
| Modelo base Fara-1.5-27B (original) | ~27B | no disponible | Si (vision) | no disponible | safetensors |
| Variante Heretic-Uncensored (safetensors) | ~27B | no disponible | Si (vision) | MIT | safetensors |

No se dispone de datos de rendimiento comparativo ni de otros modelos de referencia en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de mecanismos de rechazo implica que puede generar contenido sensible, ofensivo o danino sin las salvaguardas del modelo base. No es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de ~27B, especialmente en tareas de agente donde una accion erronea puede tener consecuencias reales (clics, envios de formularios).
- No se documentan datos de entrenamiento ni evaluaciones de sesgo; se desconoce el perfil de sesgos del modelo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en aplicaciones reguladas.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede afectar a la calidad de las cuantizaciones pequenas.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- Verificar la procedencia y el comportamiento del modelo antes de integrarlo en pipelines automatizados con acceso a sistemas reales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Fara-1.5-27B-Heretic-Uncensored-GGUF
- Modelo base (safetensors): https://huggingface.co/lmcfarlin/Fara-1.5-27B-Heretic-Uncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#Fara-1.5-27B-Heretic-Uncensored-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

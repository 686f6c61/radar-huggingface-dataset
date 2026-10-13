# nativ-community/LFM2.5-24B-A2B-Preview-mxfp4

## Resumen

LFM2.5-24B-A2B-Preview-mxfp4 es una conversion a formato MLX del modelo LFM2.5-24B-A2B-Preview, desarrollado originalmente por Liquid AI. Se trata de un modelo de razonamiento de tipo Mixture-of-Experts con 23.971.587.712 parametros totales (unos 24B) y aproximadamente 2B parametros activos por token, de ahi la nomenclatura "A2B". Segun Liquid AI, es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde los 230M hasta estos 24B, y esta orientado a agentes rapidos y privados que se ejecutan en dispositivo.

La version aqui descrita no es el modelo original, sino una cuantizacion MXFP4 de 4 bits publicada por nativ-community (con copia identica en mlx-community) y generada con la CLI de MLX-VLM sobre un Apple M3 Ultra. El repositorio pesa 12,8 GB y los ficheros de pesos suman 12,74 GB en decimal, lo que reduce de forma notable el espacio necesario frente a los pesos BF16 originales.

Su relevancia practica esta en dos factores: la ventana de contexto de 131.072 tokens y el hecho de que, al ser una cuantizacion MLX, permite ejecutar un MoE de 24B en equipos Apple Silicon con memoria unificada, sin GPU dedicada. El modelo genera razonamiento antes de la respuesta final, por lo que requiere presupuestar suficientes tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (etiqueta `lfm2_moe`); el desglose de capas y el tipo de atencion no estan disponibles en la informacion proporcionada |
| Parametros totales | 23.971.587.712 (≈24B) |
| Parametros activos | ≈2B por token (nomenclatura A2B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MXFP4 weight-only de 4 bits, group size 32; proyecciones del router en affine 8 bits, group size 64; pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` en HuggingFace |
| Formato de pesos | safetensors en formato MLX (4 bits) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview (revision `f772950ce6f17d35af5469d00334b61a9c2fc034`) |
| Libreria de inferencia | MLX / MLX-VLM |
| Tamano del repositorio | 12,8 GB (pesos: 12,74 GB en decimal) |

## Arquitectura y entrenamiento

La informacion disponible confirma que se trata de un modelo Mixture-of-Experts: la etiqueta de arquitectura del repositorio es `lfm2_moe` y tanto Liquid AI como su documentacion describen el modelo como su MoE mas grande, con 24B de parametros totales y 2B activos por token. No se dispone de detalles sobre el numero de expertos, el mecanismo de enrutamiento, el tipo de atencion ni la composicion exacta de bloques. Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. Todo ello debe considerarse no disponible en esta ficha.

Respecto al artefacto concreto aqui descrito, si hay informacion tecnica detallada del proceso de conversion. La cuantizacion se aplico en modo MXFP4 weight-only a 4 bits con group size 32, manteniendo el router en affine de 8 bits (group size 64), los pesos no cuantizados en BF16 y los sesgos de enrutamiento de expertos en FP32. La exportacion se recargo con coincidencia estricta de pesos y se valido con comprobaciones de humo: prefill y decodificacion con cache produjeron logits finitos, y dos generaciones greedy cortas devolvieron "Paris" y "391" alcanzando EOS. El propio autor advierte que estas pruebas no constituyen una evaluacion de calidad exhaustiva ni un benchmark de contexto largo.

## Capacidades

- Generacion de texto conversacional con plantilla de chat incluida en el repositorio.
- Razonamiento explicito: el modelo produce una cadena de razonamiento antes de la respuesta final, por lo que hay que reservar un presupuesto de tokens de salida suficiente.
- Soporte multilingue declarado para diez idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Orientacion a agentes: Liquid AI describe el modelo como pensado para "agentes rapidos y privados en dispositivo", aunque la informacion proporcionada no confirma de forma explicita el soporte de tool calling o function calling.
- Capacidades de vision: no confirmadas. El repositorio incluye la etiqueta `mlx-vlm`, pero la model card afirma literalmente que es un modelo de generacion de texto.
- Modo "thinking": confirmado de forma indirecta por la model card, que indica que el modelo genera razonamiento antes de la respuesta final.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes locales con requisito de privacidad: al ejecutarse en MLX sobre Apple Silicon, todo el procesamiento puede permanecer en el equipo del usuario, sin enviar prompts ni documentos a servicios externos.
- Analisis de documentos extensos: la ventana de 131.072 tokens permite introducir contratos, informes anuales o expedientes completos sin troceado agresivo, y pedir resumenes o extraccion de clausulas concretas.
- Revision y generacion de codigo en local: util en entornos donde el codigo no puede salir de la maquina; el modo de razonamiento ayuda en tareas de depuracion que requieren varios pasos.
- Traduccion y atencion multilingue: la cobertura declarada de diez idiomas permite construir flujos de traduccion o de soporte con clientes en espanol, portugues, italiano, aleman, frances, arabe, chino, japones y coreano.
- Procesamiento por lotes sin conexion: clasificacion, resumen o extraccion estructurada sobre grandes volumenes de texto en un portatil o estacion de trabajo Mac, sin coste por token.
- Prototipado y evaluacion de arquitecturas MoE: investigadores que quieran medir el comportamiento de un MoE de 24B con 2B activos en hardware de consumo pueden usar esta conversion como banco de pruebas.
- Agentes de automatizacion de escritorio: el enfasis del modelo en despliegue en dispositivo y su bajo numero de parametros activos lo hacen candidato para tareas encadenadas con latencia tolerable en local, siempre que se valide previamente el soporte real de tool calling.
- Respuestas sobre documentacion tecnica interna: es habitual montar un flujo RAG sobre manuales y wikis corporativas; el contexto largo reduce la necesidad de reordenar y comprimir fragmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta dos comprobaciones de humo (las respuestas "Paris" y "391" a dos prompts greedy cortos) y advierte explicitamente de que no constituyen una evaluacion de calidad ni una prueba de contexto largo. Tampoco se han encontrado en los resultados de busqueda cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite para el modelo base LFM2.5-24B-A2B-Preview.

## Requisitos de hardware

- Inferencia en MLX: requiere Apple Silicon (serie M). No hay soporte de CUDA en este formato.
- Espacio para pesos: 12,74 GB en decimal, sobre un repositorio de 12,8 GB.
- Memoria unificada recomendada: al menos 24 GB para funcionar con margen en contextos cortos; 32 GB o mas es lo aconsejable para trabajar comodamente, y 64-128 GB si se pretende explotar la ventana de 131.072 tokens, ya que la cache KV y las asignaciones temporales se suman al peso de los pesos.
- Equipos de referencia: la conversion se realizo y probo en un Apple M3 Ultra. Macs con M4 Pro, M4 Max o M3 Max de gama alta y 36 GB o mas de memoria unificada son candidatos razonables; no hay mediciones publicadas que lo confirmen.
- GPU NVIDIA: no aplicable a este repositorio. Para A100, H100 o RTX 4090 habria que recurrir a los pesos BF16 del modelo base o a una conversion GGUF, no disponibles en la informacion proporcionada.
- Opciones de despliegue: MLX-VLM (con el port de la PR #2505, MLX 0.32.3 y Transformers 5.17.0) y, en su caso, herramientas del ecosistema MLX como mlx-lm. No se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones ni resultados de modelos alternativos de la misma categoria, por lo que la comparativa se limita a las variantes de la propia familia LFM2.5 descritas en las fuentes consultadas.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| nativ-community/LFM2.5-24B-A2B-Preview-mxfp4 (este) | 23.971.587.712 | ≈2B | 131.072 | LFM Open License v1.0 | safetensors MLX, 4 bits (MXFP4) |
| lq-preview/LFM2.5-24B-A2B-Preview (base) | no disponible | ≈2B | 131.072 (segun la configuracion origen) | LFM Open License v1.0 | no disponible |
| LiquidAI/LFM2.5-24B-A2B | 24B | ≈2B | 131K | LFM Open License v1.0 | no disponible |
| LiquidAI/LFM2.5-230M | no disponible | no aplica (no MoE) | no disponible | LFM Open License v1.0 | no disponible |

Alternativas externas de otros fabricantes en el segmento de MoE de 20-30B con pocos parametros activos: no disponibles en la informacion proporcionada, sin datos de parametros, contexto, rendimiento ni licencia que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Validacion insuficiente: el autor solo ejecuto dos pruebas de humo. No hay evaluacion de calidad, de robustez ni de comportamiento en contexto largo sobre esta cuantizacion.
- Perdida por cuantizacion: la conversion a 4 bits MXFP4, con router a 8 bits, introduce una degradacion respecto a los pesos BF16 que no ha sido medida ni cuantificada.
- Riesgo de alucinacion: como cualquier modelo generativo, y de forma acentuada en modelos de razonamiento que producen cadenas de pensamiento largas, puede generar afirmaciones plausibles pero incorrectas. No hay datos de tasas de alucinacion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Estado "Preview": el modelo base se distribuye como vista previa, por lo que su comportamiento puede no coincidir con la version final publicada por Liquid AI.
- Licencia: se aplica la LFM Open License v1.0, incluida en el repositorio y etiquetada como `other` en HuggingFace. Los terminos exactos para uso comercial, redistribucion y atribucion deben revisarse en el fichero LICENSE antes de cualquier despliegue en produccion; esta ficha no los interpreta.
- Limitacion de plataforma: el formato MLX restringe la ejecucion a hardware Apple Silicon, lo que excluye GPU NVIDIA y AMD en este artefacto concreto.
- Idiomas: aunque se declaran diez idiomas, no hay evaluaciones por idioma, de modo que la calidad real en arabe, japones, coreano o chino no esta verificada.
- Presupuesto de tokens: al razonar antes de responder, el modelo consume tokens de salida adicionales; configurar un `max-tokens` bajo puede truncar la respuesta antes de la conclusion.
- Fecha de publicacion en HuggingFace: los metadatos indican el 13 de octubre de 2026, dato poco habitual que conviene contrastar con la fecha real de publicacion del modelo original.

## Enlaces

- Ficha de este modelo en HuggingFace: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-mxfp4
- Copia identica en mlx-community: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-mxfp4
- Modelo base (preview): https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Modelo oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Anuncio en el blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Port de LFM2.5 en MLX-VLM (PR #2505): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Calendario de lanzamientos de modelos (referencia cruzada): https://www.scriptbyai.com/ai-model-release-calendar/

# NovaeonStudio/Occamy-1.0-oQ8-fp16-mtp

## Resumen

Occamy-1.0 oQ8-fp16-mtp es una cuantización en formato oMLX del modelo `Accio-Lab/occamy-1.0`, un MoE multimodal de 35.000 millones de parámetros totales y unos 3.000 millones activos por token, orientado a uso agéntico y a invocación de herramientas. La build la publica NovaeonStudio, que no es el autor del modelo base: se trata de un reempaquetado para Apple Silicon que añade la cabeza MTP experimental oficial y un perfil de servicio ajustado empíricamente sobre un Apple M5 Max de 128 GB.

El interés de esta ficha radica en que documenta con detalle el coste real de servir un MoE multimodal de 35B en hardware de consumo Apple: unos 38 GB en disco, entre 92 y 43 tokens/s de decodificación según la longitud de contexto, y una caída medible de calidad frente al modelo base (IFEval 84,58 frente a los 91,53 que reporta la model card del original). Es, por tanto, un artefacto de despliegue y no un modelo nuevo.

La arquitectura subyacente es de la familia Qwen3.5/3.6, con 256 expertos (8 enrutados más 1 compartido), 40 capas, torre de visión preservada y una ventana de contexto nativa de 262.144 tokens (entrenamiento SFT a 131.072). El modelo base se distribuye bajo licencia Apache-2.0 y solo declara inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5/3.6 con codificador de visión; 256 expertos (8 enrutados + 1 compartido), 40 capas |
| Parámetros totales | 35B (aproximadamente, según model card) |
| Parámetros activos | ~3B por token |
| Longitud de contexto | 262.144 nativo; 131.072 en la fase SFT |
| Tipos de cuantización | oQ8: 8 bits casi uniforme, group size 64, escalas y pesos no cuantizados en float16; 6,8–8,6 bits por peso efectivos. El modelo base se distribuye además en BF16 y NVFP4 |
| Idiomas soportados | en (solo inglés según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | Nativo de MLX/oMLX (`library_name: mlx`); la model card no especifica explícitamente safetensors ni GGUF. La cabeza MTP se injerta con el layout `language_model.mtp.*` |
| Tamaño en disco | ~38 GB (39 GB de pesos según la nota de carga en frío). Los metadatos de HuggingFace indican 0,0 GB, dato inconsistente |
| Motor de inferencia | oMLX (Apple MLX), motor VLM |
| Modalidad | image-text-to-text (texto e imagen de entrada, texto de salida) |

## Arquitectura y entrenamiento

El modelo parte de `Accio-Lab/occamy-1.0`, un transformer de mezcla de expertos con enrutado disperso: 256 expertos en total, de los cuales 8 se activan por token más 1 experto compartido, repartidos en 40 capas. Incorpora además un codificador de visión que se conserva intacto en esta build; el pipeline declarado es image-text-to-text, aunque la model card no detalla la resolución de entrada, el número de tokens de imagen ni la composición del dataset multimodal. No se publican en la información disponible el número total de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO en el modelo base.

La contribución específica de esta build es doble. Por un lado, la cuantización oQ8 con grupo de 64 y escalas en float16, que deja el modelo en 6,8–8,6 bits efectivos por peso y reduce el peso en disco a unos 38 GB. Por otro, la fusión de la cabeza MTP experimental oficial (`occamy-1.0-MTP`), convertida al layout MLX, pensada para decodificación especulativa. La propia model card advierte que, bajo oQ8, la aceptación de borradores es insignificante y la decodificación con MTP activado o desactivado es idéntica en la prueba A/B realizada, porque el verificador cuantizado rechaza casi todos los borradores; la cabeza se incluye por corrección formal y para futuros runtimes. El perfil de servicio óptimo medido desactiva MTP y activa prefill en ANE (dual ANE, GDN y asistencia por CPU) junto con TurboQuant-KV a 8 bits.

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de pensamiento (thinking) disponible según la model card del modelo base.
- Uso de herramientas y function calling: la build supera 6/6 en la suite propia de sondas (selección de herramienta, llamadas paralelas, cadenas secuenciales, fidelidad de argumentos, abstención cuando no procede herramienta y ausencia de herramientas inventadas), medida a temperatura 0.
- Comportamiento agéntico multi-paso, orientado a bucles de razonamiento con herramientas encadenadas.
- Cumplimiento de instrucciones: 84,58 de media en IFEval medido sobre estos pesos cuantizados, con el verificador oficial y 541 prompts / 834 instrucciones.
- Multimodalidad texto + imagen a texto: la torre de visión se preserva desde el modelo base.
- Contexto largo: hasta 262.144 tokens nativos, con decodificación sostenida gracias al perfil TurboQuant-KV documentado.
- Capacidades multilingües: no acreditadas; la model card solo declara inglés.
- Capacidades de audio: no disponibles.

## Casos de uso

- Agentes locales en Mac para automatización de escritorio: el modelo puede encadenar llamadas a herramientas en varios pasos con contexto de hasta 262.144 tokens, y el perfil oMLX documentado mantiene la decodificación por encima de 40 tokens/s incluso a 64.700 tokens de contexto.
- Asistente de código con acceso a repositorio: al soportar function calling y cadenas secuenciales de herramientas, encaja en flujos donde el agente lee ficheros, ejecuta comandos y corrige errores de forma iterativa, con la ventaja de ejecutarse íntegramente en local.
- Automatización de atención al cliente sobre documentación extensa: la ventana de 262.144 tokens permite cargar manuales o históricos de conversación completos sin troceado agresivo, y la abstención correcta ante herramientas innecesarias reduce llamadas espurias.
- Procesamiento de documentos con imagen: al mantener el codificador visual, puede extraer y resumir información de capturas, diagramas o páginas escaneadas dentro de un pipeline image-text-to-text.
- Extracción de datos estructurados en pipelines por lotes: la fidelidad de argumentos medida en la suite agéntica es un requisito directo para generar JSON o llamadas a API con parámetros correctos.
- Copiloto de investigación en local con requisitos de privacidad: al ser pesos Apache-2.0 ejecutables sin conexión en Apple Silicon, es apto para entornos donde los datos no pueden salir del equipo.
- Prototipado de agentes antes de migrar a producción: el mismo modelo base está disponible en BF16 y NVFP4, de modo que esta build de 8 bits sirve para validar latencia y comportamiento en el portátil antes de desplegar una versión de mayor precisión.

## Benchmarks y rendimiento

Todos los datos siguientes están medidos por el publicador sobre un Apple M5 Max de 128 GB con oMLX y el perfil óptimo, con el equipo aislado.

Rendimiento de decodificación según contexto:

| Contexto del prompt | ~0 | ~3,9k | ~7,9k | ~15,9k | ~31,9k | ~64,7k |
|---|---|---|---|---|---|---|
| Decodificación (tok/s) | 92 | 86 | 82 | 76 | 58 | 43 |
| TTFT (s) | 0,29 | 0,92 | 0,80 | 5,0 | 1,6 | 49 |

La model card atribuye los picos de TTFT a compilaciones en el primer prefill grande y señala que el prefill en régimen estable es rápido. La carga en frío de los 39 GB de pesos tarda entre 18 y 36 segundos.

IFEval de esta build (thinking desactivado, verificador oficial):

| Versión | prompt-strict | prompt-loose | inst-strict | inst-loose | media |
|---|---|---|---|---|---|
| Occamy-1.0 oQ8-fp16-mtp | 79,67 | 83,36 | 86,21 | 89,09 | 84,58 |

La model card del modelo base reporta IFEval 91,53; el publicador atribuye la diferencia a la cuantización de 8 bits y a su configuración de evaluación sin CoT. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el modelo ocupa unos 38–39 GB de pesos, por lo que requiere memoria unificada de ese orden como mínimo. El publicador solo documenta su ejecución con 128 GB; no se especifica un mínimo oficial.
- GPU: no hay soporte CUDA en esta build; está empaquetada para Apple Silicon mediante MLX/oMLX. Las GPU NVIDIA no son un objetivo declarado.
- Compatibilidad con hardware de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; la referencia medida es un M5 Max de 128 GB. No se documentan resultados en configuraciones de 32 o 64 GB.
- Opciones de despliegue: oMLX (`omlx serve`, con endpoint compatible con OpenAI en `/v1`) y mlx-vlm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 92 tok/s a contexto ~0 bajando a 43 tok/s a ~64,7k; TTFT de 0,29 s en vacío, con picos puntuales de 5 s y 49 s atribuidos a la compilación inicial del prefill.
- Configuración recomendada de oMLX: prefill en ANE activado (+~12 % de decodificación sostenida en contexto largo), TurboQuant-KV a 8 bits, `qwen35_oq_a8_enabled` y `mtp_enabled` desactivados, expertos residentes sin offload.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos con modelos alternativos en la información disponible. La única comparación con cifras publicadas es contra el propio modelo base, en la misma tarea y con distinto régimen de evaluación:

| Modelo | Parámetros | Contexto | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Occamy-1.0 oQ8-fp16-mtp (esta build) | 35B totales / ~3B activos | 262.144 | 84,58 (medido por el publicador, sin thinking) | Apache-2.0 | HuggingFace, formato oMLX |
| Accio-Lab/occamy-1.0 (base) | 35B totales / ~3B activos | 262.144 | 91,53 (reportado en la model card del base) | Apache-2.0 | HuggingFace, BF16 |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: la model card solo declara inglés; no hay evaluación de rendimiento en castellano ni en otros idiomas.
- Pérdida de calidad por cuantización: la media de IFEval baja de 91,53 (base) a 84,58 en esta build, una diferencia de casi 7 puntos atribuida al esquema de 8 bits.
- La cabeza MTP incluida no aporta aceleración bajo oQ8: la aceptación del borrador es insignificante y se recomienda servir con `mtp_enabled: false`.
- Dependencia de plataforma: empaquetado exclusivamente para MLX/oMLX sobre Apple Silicon; no es directamente utilizable en CUDA ni en runtimes estándar de servidor sin reconversión.
- Adopción nula: cero descargas y cero likes en el momento del análisis, sin validación independiente de los números publicados.
- Los benchmarks declarados proceden de un único equipo (un M5 Max de 128 GB) y de la propia suite de sondas del publicador; no son reproducibles en otro hardware por terceros con los datos aportados.
- El tamaño del repositorio figura como 0,0 GB en los metadatos de HuggingFace, lo que contradice los ~38 GB de pesos indicados en la model card; conviene verificar los ficheros antes de planificar el despliegue.
- Riesgo de alucinación: aunque la suite agéntica mide 6/6 en ausencia de herramientas inventadas, es una prueba interna de tamaño reducido y no sustituye a una evaluación en producción.
- La model card está truncada en la sección de inicio rápido (mlx-vlm), por lo que las instrucciones completas de uso no están disponibles en la información recogida.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar avisos de copyright y licencia, y a indicar los cambios realizados respecto al modelo base.
- El autor de esta build no es el autor del modelo base; para incidencias de calidad conviene contrastar con `Accio-Lab/occamy-1.0`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NovaeonStudio/Occamy-1.0-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/Accio-Lab/occamy-1.0
- Repositorio de oMLX: https://github.com/jundot/omlx
- Sitio del publicador: https://novaeon.studio
- Referencia arXiv incluida en las etiquetas del repositorio: https://arxiv.org/abs/2609.11977
- Cabeza MTP oficial de Accio-Lab: repo `occamy-1.0-MTP` (referenciado en la model card; no se proporciona URL directa)
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo.

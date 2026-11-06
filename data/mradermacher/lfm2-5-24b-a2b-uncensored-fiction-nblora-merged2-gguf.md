# mradermacher/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-GGUF

## Resumen

El repositorio `mradermacher/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-GGUF` es una distribucion de pesos en formato GGUF generada por mradermacher, conocido por publicar cuantizaciones estaticas de modelos de terceros para su uso con llama.cpp y herramientas compatibles. En este caso, el material de origen es el modelo `electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2`, un ajuste fino orientado a narrativa de ficcion y sin filtros de alineamiento, construido sobre la familia LFM2.5 de 24B en una configuracion de mezcla de expertos con unos 2B de parametros activos (de ahi el sufijo A2B).

El modelo resuelve un nicho muy concreto: generacion de ficcion sin censura, presumiblemente mediante un LoRA entrenado sobre un corpus narrativo y posteriormente fusionado con los pesos base. El repositorio incluye unicamente los ficheros convertidos a GGUF, con un peso total de 67,7 GB en el conjunto de cuantizaciones disponibles, lo que permite ejecutar el modelo en hardware de consumo segun el nivel de compresion elegido.

La relevancia de esta ficha es limitada pero clara para quien busque un modelo narrativo sin restricciones ejecutable en local: se trata de una distribucion derivada, sin model card tecnica propia, sin benchmarks publicados y sin licencia declarada, por lo que su evaluacion debe hacerse con cautela y bajo responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun la nomenclatura A2B del modelo base LFM2.5 |
| Parametros totales | 23.971.587.712 (aproximadamente 24B) |
| Parametros activos | aproximadamente 2B (deducido del sufijo A2B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2.5 en su variante de 24B con aproximadamente 2B de parametros activos, lo que implica una arquitectura de mezcla de expertos con enrutamiento disperso: solo una fraccion de los expertos se activa por token, reduciendo el coste computacional de inferencia frente a un modelo denso del mismo tamano. El sufijo A2B confirma esta configuracion, aunque la model card del repositorio no aporta detalles sobre el numero de expertos, la estrategia de enrutamiento ni la longitud de contexto nativa.

Sobre esa base, el autor original (`electroglyph`) aplico un LoRA orientado a ficcion sin censura (`nblora`) y lo fusiono con los pesos base (`merged2`), generando un modelo denso equivalente en parametros pero especializado en narrativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. mradermacher se limita a convertir y cuantizar esos pesos fusionados a GGUF, sin reentrenamiento ni modificacion de la arquitectura.

## Capacidades

- Generacion de texto narrativo y de ficcion, presumiblemente el objetivo principal del ajuste fino.
- Conversacion multi-turno, segun la etiqueta `conversational` del repositorio.
- Generacion sin filtros de alineamiento (variante "uncensored"), lo que implica menor rechazo a peticiones de contenido sensible.
- Capacidad de razonamiento y codigo heredada del modelo base LFM2.5, aunque no verificada ni documentada en esta distribucion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Soporte multilingue: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Escritura creativa y narrativa larga: el ajuste sobre ficcion permite generar relatos, dialogos y descripciones con un registro literario mas consistente que un modelo generalista, y la ventana de contexto del modelo base (no documentada) condiciona la longitud de las continuaciones.
- Generacion de guiones y dialogos para videojuegos o medios interactivos: la ausencia de filtros facilita tramas con violencia, conflicto o temas adultos sin rechazos intermedios, algo util en preproduccion creativa.
- Prototipado de personajes conversacionales en local: al ejecutarse en GGUF con llama.cpp u Ollama, permite desplegar un chatbot de rol en una estacion de trabajo sin depender de APIs externas.
- Investigacion sobre alineamiento y censura: sirve como contrapunto experimental frente a modelos alineados, permitiendo estudiar diferencias de comportamiento en generacion de contenido sensible.
- Exploracion de tecnicas de cuantizacion: el repositorio ofrece doce variantes (desde Q2_K hasta x-f16), lo que permite medir el impacto de la compresion en la calidad narrativa con un mismo modelo.
- Generacion de material de ficcion para talleres o demos: con cuantizaciones Q4_K_M o Q5_K_M cabe en GPU de consumo y permite iterar rapidamente en sesiones de escritura asistida.
- Fine-tuning posterior o experimentacion con LoRA: al estar disponible en GGUF y derivar de un modelo abierto, puede servir como base para nuevos ajustes, aunque la licencia no declarada introduce incertidumbre legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en Q4_K_M, 17-19 GB en Q5_K_M, 20-22 GB en Q6_K y 25-27 GB en Q8_0, considerando 24B de parametros y el overhead de contexto.
- La variante x-f16 completa requiere del orden de 48-50 GB de VRAM, por lo que solo es viable en GPU de datacenter o en configuraciones multi-GPU.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para las cuantizaciones altas; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 o 4080 para Q3_K_M y Q4_K_S.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantizaciones Q4 o inferiores; en GPUs de 12-16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI o vLLM, aunque la ejecucion optima de GGUF se da en llama.cpp.
- Latencia y throughput estimados: no disponibles; al tratarse de un MoE con unos 2B activos, el throughput por token deberia ser notablemente superior al de un denso de 24B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2 (este) | 24B (2B activos) | no disponible | no disponible | GGUF | Ajuste de ficcion sin censura, sin benchmarks |
| mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF | 24B (2B activos) | no disponible | no disponible | GGUF | Variante sin el LoRA de ficcion, misma base |
| mradermacher/LFM2.5-24B-A2B-uncensored-i1-GGUF | 24B (2B activos) | no disponible | no disponible | GGUF | Otra cuantizacion de la linea uncensored |
| Modelo base LFM2.5-24B-A2B | 24B (2B activos) | no disponible | no disponible | safetensors/GGUF | Referencia sin ajuste de ficcion ni desalineamiento |

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se documentan datos de entrenamiento, contexto nativo, idiomas ni evaluacion, lo que impide validar su calidad de forma objetiva.
- Licencia no declarada: el uso comercial queda en un limbo legal; es imprescindible verificar la licencia del modelo base LFM2.5 y del ajuste de `electroglyph` antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion y de deriva narrativa: al ser un ajuste de ficcion sin alineamiento, puede inventar hechos con fluidez y sin senales de duda.
- Contenido sensible: la variante "uncensored" reduce los rechazos, por lo que puede generar material violento, sexual o difamatorio; requiere moderacion externa si se expone a usuarios finales.
- Sin datos de sesgos: no hay evaluacion de sesgos de genero, raza o ideologia; se desconoce el comportamiento en dominios sensibles.
- Idiomas no confirmados: aunque el modelo base probablemente sea multilingue, no hay garantia de calidad fuera del ingles.
- Repositorio sin descargas ni likes en el momento de la consulta: no existe validacion comunitaria que respalde su funcionamiento.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la coherencia en modelos de este tamano; para uso narrativo se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2-GGUF
- Modelo de origen: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged2
- Variante BF16 i1: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-BF16-i1-GGUF
- Variante uncensored i1: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-uncensored-i1-GGUF

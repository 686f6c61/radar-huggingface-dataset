# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH

## Resumen

Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH es un paquete comunitario para Apple Silicon que empaqueta el modelo Ornith 1.5 35B-A3B (un Mixture-of-Experts multimodal de la familia Qwen 3.5, desarrollado por el equipo Ornith) en cuantizacion MLX de 6 bits, con la torre de vision original restaurada y el modelo borrador DFlash del propio equipo Ornith para decodificacion especulativa. Lo publica el usuario ahmedihamdy como paquete no oficial, pensado para ejecutarse con la aplicacion Astronomical en Macs con chip de la familia M5.

El modelo resuelve el problema de servir un MoE de 35.107.180.016 parametros totales (con aproximadamente 3.000 millones activos por token, segun la nomenclatura A3B) en hardware de consumo Apple, manteniendo capacidades de vision (image-text-to-text) y acelerando la decodificacion mediante un drafter que propone varios tokens por paso y el modelo principal los verifica en arbol. Es relevante porque combina tres piezas que rara vez aparecen juntas en un solo repositorio: pesos cuantizados a 6 bits (expertos afines de 6 bits, routers de 8 bits, group size 64), torre de vision en bf16 y decodificacion especulativa integrada.

La licencia es MIT y el unico idioma declarado es el ingles. El repositorio ocupa 29,9 GB en disco (unos 27,8 GB necesarios para ejecutar) y requiere en la practica un Mac con 48 GB o mas de memoria unificada para aprovechar el drafting, con un limite de memoria de modelo de 36,5 GB por defecto en Astronomical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_5_moe), multimodal con torre de vision |
| Parametros totales | 35.107.180.016 |
| Parametros activos | Aproximadamente 3.000 millones (designacion A3B; valor exacto no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 6 bits (expertos afines de 6 bits, routers de 8 bits, group size 64); torre de vision en bf16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts de la familia Qwen 3.5 con 35.107.180.016 parametros totales y activacion dispersa de aproximadamente 3.000 millones por token. La version empaquetada conserva los pesos de texto cuantizados por el equipo Ornith en MLX a 6 bits (expertos afines de 6 bits, routers de 8 bits, group size 64) y anade la torre de vision original en bf16, compuesta por 27 bloques y 447 millones de parametros, junto con sus ficheros de preprocesado de imagen y video. El repositorio incluye ademas un modelo borrador DFlash de 6 capas (5 de ventana deslizante y 1 de atencion completa) que lee 8 de las 40 capas del modelo principal.

La innovacion tecnica destacable es la decodificacion especulativa con verificacion en arbol: el drafter propone 3 tokens por ronda y el modelo principal verifica todos los candidatos en un unico paso, conservando unicamente los que habria generado el mismo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. El paquete es una reempaquetado comunitario, no un release oficial de Ornith, y el autor verifico la torre de vision sobre una imagen real comprobando que el modelo citaba exactamente tres lineas de texto de la misma.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno en ingles.
- Generacion de codigo, con ganancia notable de velocidad gracias al drafting en texto predecible.
- Comprension de imagenes (image-text-to-text): descripcion de contenido visual y lectura de texto en imagenes.
- Procesamiento de video, segun los ficheros de preprocesado incluidos (video_preprocessor_config.json).
- Decodificacion especulativa integrada mediante el drafter DFlash, sin configuracion adicional al cargar el modelo.
- Modo de razonamiento (thinking) desactivable; las mediciones del autor se hicieron con thinking off.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles declarado.

## Casos de uso

- Asistencia de programacion en local: el modelo acelera la generacion de codigo predecible (1,26x medido en la tarea de escribir un modulo Python con tests), lo que lo hace adecuado para autocompletado y generacion de funciones en un Mac sin enviar codigo a la nube.
- Analisis de imagenes privadas: con la torre de vision restaurada, puede describir fotografias y extraer texto de capturas o documentos escaneados sin salir del equipo, util en entornos con requisitos de confidencialidad.
- Procesamiento de documentacion tecnica con capturas: combinacion de lectura de imagen y generacion de texto para transcribir y resumir manuales o diagramas.
- Prototipado de aplicaciones multimodales: al exponer una API local compatible con OpenAI a traves de Astronomical, sirve para desarrollar y probar interfaces de chat con imagen antes de migrar a produccion.
- Redaccion asistida de textos largos: aunque el drafting penaliza la escritura libre (0,86x en el ensayo medido), el modelo sigue siendo valido para generar borradores y documentacion en ingles con contexto conversacional.
- Transcripcion y descripcion de video: los ficheros de preprocesado de video permiten alimentar frames o clips para generar descripciones narradas.
- Entornos educativos y de investigacion: licencia MIT y ejecucion totalmente local facilitan su uso en laboratorios y aulas sin coste de API ni dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta mediciones de velocidad de decodificacion (tokens por segundo) en un MacBook Pro con Apple M5 Pro (15 nucleos de CPU, 16 de GPU, 48 GB de memoria unificada), macOS 27.2.1 y Astronomical 0.2.123, con respuestas de 384 tokens, temperatura 0.6, top-p 0.95 y top-k 20:

| Build | Redaccion de ensayo (tok/s) | Redaccion de codigo (tok/s) |
|---|---|---|
| Ornith-1.5-35B-A3B-MLX-6bit sin drafter | 72,5 | 70,7 |
| Este paquete con drafting DFlash | 62,6 (0,86x) | 89,4 (1,26x) |

El consumo de memoria tras la ejecucion fue de 27,15 GB con drafter y 26,23 GB sin el. La variabilidad entre respuestas individuales se situa en torno al 10% por encima o por debajo de estas medianas.

## Requisitos de hardware

- Memoria: aproximadamente 27,2 GB de memoria de modelo con drafting; en la practica se recomienda un Mac con 48 GB o mas de memoria unificada. El limite por defecto de Astronomical en un Mac de 48 GB es de 36,5 GB.
- Disco: unos 27,8 GB necesarios (repositorio de 29,9 GB).
- GPU: Apple Silicon; las ganancias de drafting requieren un chip de la familia M5, ya que los kernels usan las unidades matriciales de su GPU. En Macs sin GPU M5 el modelo funciona pero decodifica un token a la vez.
- Cabe en GPU de consumo: si, en Apple Silicon con memoria unificada suficiente; no esta pensado para GPUs NVIDIA discretas al ser un paquete MLX.
- Despliegue: aplicacion Astronomical (API local compatible con OpenAI); tambien puede cargarse con la libreria MLX de Apple. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato.
- Latencia y throughput: 89,4 tok/s en generacion de codigo y 62,6 tok/s en redaccion libre sobre M5 Pro de 16 nucleos de GPU, segun las condiciones descritas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH | 35.107.180.016 (aprox. 3.000 M activos) | No disponible | MIT | safetensors MLX 6 bits | Hugging Face, 0 descargas |
| ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit | 35.107.180.016 | No disponible | No disponible | safetensors MLX 6 bits | Hugging Face (modelo base) |
| ornith-ai/Ornith-1.5-35B-A3B | 35.107.180.016 | No disponible | No disponible | No disponible | Hugging Face (modelo base) |
| ornith-ai/Ornith-1.5-35B-A3B-DFlash | No disponible | No disponible | No disponible | No disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K u otros) ni de modelos alternativos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Es un paquete comunitario no oficial: no procede del equipo Ornith y no debe tratarse como release de referencia.
- Solo soporta ingles declarado; el uso en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no esta documentada en la informacion disponible.
- El drafting penaliza la generacion de texto libre (0,86x en el ensayo medido) y su beneficio decrece a medida que la conversacion se alarga.
- La aceleracion por drafting requiere hardware de la familia M5; en otros Mac decodifica token a token.
- Riesgo de alucinacion inherente a los modelos generativos; el autor no reporta evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia MIT permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la informacion disponible, conviene verificar la licencia del modelo original antes de un despliegue en produccion.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia de uso en produccion ni de mantenimiento continuado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-6bit-vision-DFLASH
- Modelo base de texto MLX 6 bits: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo borrador DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-DFlash
- Aplicacion Astronomical: https://getastronomical.com/
- Descargas de Astronomical: https://github.com/aosama/astronomical/releases/latest

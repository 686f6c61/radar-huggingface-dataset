# baytizzel/Qwen3.8-Flash-Next-IQ3_S-Strata-M5Pro-48gb

## Resumen

Esta ficha describe un *recipe* de despliegue, no un modelo nuevo: el repositorio `baytizzel/Qwen3.8-Flash-Next-IQ3_S-Strata-M5Pro-48gb` empaqueta la configuración probada para servir el modelo Qwen3.8-Flash-Next (cuantizado a IQ3_S por ISTA-DASLab) en un Apple Silicon Mac con 48 GB de memoria unificada. El autor, baytizzel, publica un fork afinado del motor Metal de Strata junto con scripts de descarga, verificación y arranque, además de los resultados de rendimiento medidos en un MacBook Pro M5 Pro.

El problema que resuelve es concreto: el modelo cuantizado ocupa 54,8 GB y no cabe en los 48 GB de memoria del equipo, de modo que el motor mantiene en RAM los expertos enrutados más usados y transmite el resto desde el SSD interno, apoyándose en *multi-token prediction* (MTP) para el borrado especulativo. Con los ajustes del fork (lecturas alineadas a página sin caché, arena de expertos *wired*, buffers de prompt dentro de la arena y ticks de GPU para mantener el reloj), el autor reporta un aumento de decodificación de 20,1 a 31,4 tok/s con idénticos tokens de salida, y una reducción del tiempo de prompt de 55,5 a 44,5 s en su suite de pruebas.

Es relevante ahora porque demuestra que un MoE de gran tamaño puede servirse de forma interactiva en hardware de consumo Apple Silicon mediante *streaming* desde SSD, a costa de requisitos de disco considerables (unos 140 GB libres) y de una puesta en marcha manual. El repositorio no realoja los pesos: descarga la revisión fijada de ISTA-DASLab y verifica sus hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con MTP; motor de inferencia Metal para Apple Silicon |
| Parametros totales | 2.607.150.848 (dato de safetensors del repo base Qwen/Qwen3.8-Flash-Next; el modelo servido completo se reporta como 54,8 GB en IQ3_S) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (modelo objetivo, ISTA-DASLab GSQ-RCO); Q2_0 para la capa drafter MTP; el repo incluye pack para IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (motor Strata fork bajo MIT) |
| Formato de pesos | GGUF (modelo y drafter); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo servido es Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) que incorpora *multi-token prediction* (MTP): una capa drafter nativa predice cuatro tokens por paso para alimentar la decodificación especulativa. El repositorio no entrena ni modifica los pesos: la cuantización IQ3_S procede de ISTA-DASLab (esquema GSQ-RCO) y el drafter MTP se empaqueta en Q2_0 para el motor Metal. Los scripts descargan la revisión fijada del modelo base y comprueban su sha256 antes de usarlo.

La innovación técnica está en el motor, no en el modelo: un fork de Strata (rama `m5pro-iq3s`, MIT) que implementa lecturas *bounce* alineadas a página con `F_NOCACHE` para evitar que la caché de ficheros de macOS retenga expertos, libera las copias de pesos del host (huella previa a la arena de 13,3 a 7,1 GB), mantiene la arena de expertos *wired* durante el llenado, coloca los buffers de prompt dentro de la arena (`STRATA_METAL_REGION_FIT`, `STRATA_METAL_PROMPT_SMALL=256`) y mantiene el reloj de GPU activo con ticks pequeños (`STRATA_METAL_KEEP_WARM`). Con ello la arena puede dimensionarse a 16-17,5 GB en lugar de 6 GB, la tasa de acierto de la arena sube de 0,57 a 0,84 y una ventana de decodificación de 4 tokens baja de ~140 ms a ~90 ms.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno mediante API compatible con OpenAI.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), con codificador de imagen `strata-vision` en el ecosistema Strata.
- Decodificación especulativa con drafter MTP nativo (cuatro tokens por paso).
- Servicio local con endpoint `/v1/chat/completions` autenticado por clave de API.
- Ejecución de un MoE de gran tamaño en memoria unificada de 48 GB mediante *streaming* de expertos desde SSD.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling, agentes o *thinking mode*: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE grande en un MacBook Pro: servir Qwen3.8-Flash-Next en un M5 Pro de 48 GB con el motor Strata permite usar el modelo sin GPU dedicada, aceptando decodificación de ~31 tok/s medida por el autor.
- Asistente conversacional de escritorio: el endpoint compatible con OpenAI en `127.0.0.1:8091` permite conectar clientes existentes (IDE, chat, scripts) sin adaptar el código, con el modelo cargado en la primera petición.
- Experimentación con decodificación especulativa: el drafter MTP en Q2_0 y los interruptores del fork permiten medir el efecto del borrado especulativo sobre una misma salida token a token.
- Evaluación de cuantizaciones IQ3_S: el pack y los scripts verifican los pesos de ISTA-DASLab por sha256, lo que facilita reproducir comparativas entre cuantizaciones sobre el mismo motor.
- Procesamiento de imágenes con texto: el pipeline image-text-to-text y el codificador `strata-vision` permiten describir o consultar imágenes desde el mismo servidor local.
- Prototipado de agentes con resultados de herramientas: `STRATA_METAL_PROMPT_SMALL=256` reserva un conjunto pequeño de buffers para prompts cortos (por ejemplo, salidas de herramientas) sin desplazar los expertos en caché.
- Investigación sobre *offloading* a SSD: el recipe documenta el dimensionado de la arena (`ARENA_MAX_GB=17.5`, `KEEP_FREE_GB=8`) y el comportamiento bajo presión de memoria, útil para estudiar el equilibrio entre RAM y latencia.

## Benchmarks y rendimiento

| Metrica | Antes (stock) | Despues (fork afinado) |
|---|---|---|
| Decodificacion (tok/s) | 20,1 | 31,4 |
| Tiempo de prompt en la suite (s) | 55,5 | 44,5 |
| Tasa de acierto de la arena de expertos | 0,57 | 0,84 |
| Ventana de decodificacion de 4 tokens (ms) | ~140 | ~90 |
| Tiempo de segmento de GPU por ventana (ms) | 73 | 62 |
| Huella antes de la arena (GB) | 13,3 | 7,1 |

Medido en un MacBook Pro M5 Pro con 48 GB, con tokens de salida idénticos según el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Apple Silicon; probado en MacBook Pro M5 Pro con 48 GB de memoria unificada. Menos memoria implica una arena de expertos menor y decodificación más lenta.
- Unos 140 GB libres en el SSD interno: 84 GB de modelo, 50 GB de *sidecar* de expertos, 2,4 GB del repo y 0,9 GB de pesos del codificador de imagen.
- Durante la carga, el motor ocupa aproximadamente 22-25 GB; la arena de expertos está *wired*, por lo que macOS comprime otros programas.
- La arena se dimensiona en cada carga según la memoria libre (`ARENA_MAX_GB=17.5`, `KEEP_FREE_GB=8`); una arena de 19 GB con 5,5 GB libres alcanzó presión de memoria en las pruebas.
- Dependencias: Xcode Command Line Tools, `cmake`, `ninja`, CLI `hf` y, para servidor e imágenes, la app o instalación de Terminal de Strata (probado con Strata Terminal 0.1.54).
- Despliegue: motor Strata (fork `betizzel/Strata`, rama `m5pro-iq3s`) con API compatible con OpenAI; el paquete `serve/` del fork funciona sin la app, pero esa combinación no formó parte del *setup* medido.
- VRAM, GPU dedicadas, latencia y throughput en otras plataformas: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next IQ3_S + Strata (este repo) | MoE; 54,8 GB en IQ3_S | no disponible | 31,4 tok/s en M5 Pro 48 GB (medición del autor) | qwen-community-license-1.0 | Recipe en HF; pesos descargados de ISTA-DASLab |
| Qwen3.8-Flash-Next (base, sin cuantizar) | 2.607.150.848 según safetensors del repo base | no disponible | no disponible | qwen-community-license-1.0 | HF: Qwen/Qwen3.8-Flash-Next |
| Otras cuantizaciones IQ3_S de ISTA-DASLab | no disponible | no disponible | no disponible | según modelo base | HF: ISTA-DASLab |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: requiere descargar 84,5 GB de ISTA-DASLab y generar un *sidecar* de expertos de 50 GB, con verificación sha256.
- La puesta en marcha es manual (scripts de descarga, compilación del motor, generación del sidecar y renderizado de configuración); no es un paquete listo para producción.
- El rendimiento depende de la memoria libre en el momento de la carga: un Mac más ocupado obtiene una arena menor y decodificación más lenta.
- El uso intensivo de SSD por *streaming* de expertos puede afectar a la vida útil del disco y al rendimiento del sistema; no se documentan cifras de desgaste.
- La licencia qwen-community-license-1.0 impone condiciones para uso comercial; debe revisarse el texto completo antes de desplegar.
- Sesgos, riesgo de alucinación y limitaciones idiomáticas del modelo base: no disponibles en la información proporcionada.
- La combinación del paquete `serve/` del fork sin la app Strata no fue medida; los resultados de rendimiento solo aplican al *setup* descrito.
- Los benchmarks reportados son del autor, sobre una única máquina y una suite propia; no son comparables con evaluaciones estándar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/baytizzel/Qwen3.8-Flash-Next-IQ3_S-Strata-M5Pro-48gb
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Fork del motor Strata: https://github.com/betizzel/Strata (rama `m5pro-iq3s`, MIT)
- Strata (repositorio original): https://github.com/Niko1221/Strata
- Resultados de rendimiento: `results/RESULTS.md` dentro del repositorio
- Cuantización IQ3_S de referencia: ISTA-DASLab (descarga vía `scripts/fetch-upstream.sh`, revisión fijada)

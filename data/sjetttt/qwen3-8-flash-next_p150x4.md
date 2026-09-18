# sjettTT/qwen3.8-flash-next_p150x4

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje publicado por el usuario sjettTT en HuggingFace como paquete de despliegue para hardware Tenstorrent. El repositorio `sjettTT/qwen3.8-flash-next_p150x4` no contiene el modelo entrenado desde cero, sino un contenedor listo para servir los pesos oficiales de `Qwen/Qwen3.8-Flash-Next` (commit `f5d08274bafd880402bd16f5e3e6c514136ec06c`) sobre cuatro chips Blackhole p150 mediante vLLM 0.26.0 y el plugin `vllm-tt-plugin`.

La arquitectura descrita en la model card es un transformer híbrido de 48 capas que combina capas gated delta-net, atención dispersa con indexer y una capa PLE de n-gramas, con un MoE de 512 expertos y enrutamiento top-10 cuantizado a BF4. La model card menciona también 49 capas MoE convertidas en una caché de expertos BF4 de 107 GB, cifra que no coincide con las 48 capas híbridas citadas en la misma ficha y que el autor no aclara.

Su relevancia es doble: por un lado, es un ejemplo de empaquetado reproducible de un modelo grande para inferencia local en aceleradores Tenstorrent; por otro, documenta de forma explícita las limitaciones de esa ruta de despliegue (una sola secuencia residente, sin decodificación especulativa, primer arranque de unos 30 minutos y requisitos de disco de unos 500 GB). El repo tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 48 capas con gated delta-net, atencion dispersa con indexer y capa PLE de n-gramas; MoE de 512 expertos con enrutamiento top-10 (BF4) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE top-10 sobre 512 expertos) |
| Longitud de contexto | 32704 tokens (perfil c32k, por defecto), 65472 (c64k), 131008 (c128k) |
| Tipos de cuantizacion | BF4 en expertos enrutados, BF16 en capas densas, FP32 en el estado recurrente (cache de expertos BF4 de 107 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible; los pesos no estan en el repositorio (1,9 GB) y se descargan aparte desde `Qwen/Qwen3.8-Flash-Next` con `tt-model pull --with-weights` |
| Hardware objetivo | 4x Blackhole p150 (perfil P150x4); validado unicamente en esa configuracion |
| Servidor | OpenAI-compatible en el puerto 20000, via vLLM 0.26.0 + vllm-tt-plugin |
| Secuencias concurrentes | 1 (`max_num_seqs: 1`) |
| Empaquetado | tt-model-manager 0.1.0, esquema de manifiesto 5.1; imagen Docker + manifiesto |

## Arquitectura y entrenamiento

La model card describe una pila híbrida poco convencional: 48 capas que alternan mecanismos de estado recurrente (gated delta-net) con atención dispersa guiada por un indexer, más una capa PLE de n-gramas que mantiene una tabla de 104 GB en memoria. Sobre esa columna se monta un MoE de 512 expertos con enrutamiento top-10, cuantizado a BF4 en los expertos, BF16 en las capas densas y FP32 en el estado recurrente. La model card indica que el arranque convierte "las 49 capas MoE" en una caché de expertos BF4 de 107 GB, lo que contradice el recuento de 48 capas híbridas; no hay información que resuelva la discrepancia.

No se proporciona ningún dato sobre el entrenamiento del modelo original: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Tampoco se documenta innovación adicional más allá de la propia arquitectura (delta-net, atención con indexer, MoE top-10 y PLE), salvo la ausencia explícita de decodificación especulativa MTP en esta ruta de vLLM. Lo que sí está documentado con precisión es la reproducibilidad del build: vLLM `v0.26.0`, plugin `vllm-tt-plugin` en el commit `bef89e429e202caa38d3e3c8a24da4e8cc02405a`, `tt-metal` desde un checkout local cuyo commit no se publica, y un digest `code/` de `1a98cc140731304e` (sha256, primeros 16 dígitos hexadecimales).

## Capacidades

- Generación de texto autoregresiva servida mediante API compatible con OpenAI (`/v1/chat/completions`).
- Conversación de un solo turno o multiturno dentro de una única secuencia residente, con ventanas de 32k, 64k o 128k tokens según el perfil.
- Procesamiento de contexto largo de hasta 131008 tokens (perfil c128k), con construcción de unos 10 GB de cachés por cada contexto nuevo.
- Muestreo configurable: temperatura, top-k, top-p, semilla y las tres penalizaciones (presencia, frecuencia y repetición), aplicadas por el adaptador del modelo en el host con `sample_on_device_mode: decode_only`.
- Modo "thinking" desactivado por defecto según la model card; no se documenta cómo activarlo ni qué comportamiento tiene al activarse.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de arquitecturas híbridas en investigación: el modelo permite estudiar en hardware real la interacción entre capas gated delta-net, atención dispersa con indexer y un MoE de 512 expertos, algo difícil de reproducir solo con implementaciones de referencia en CPU.
- Pruebas de validación numérica de kernels: el build validado reproduce la referencia de CPU en 96 de 96 tokens en modo greedy, lo que sirve como test de aceptación al portar kernels a BF4/BF16 en nuevos chips Tenstorrent.
- Análisis de documentos largos en local: con el perfil c128k (131008 tokens) se pueden procesar contratos, informes técnicos o expedientes completos sin salir de la máquina, asumiendo que solo hay una secuencia activa a la vez.
- Generación de datos sintéticos para ajuste posterior: dado que el modelo es de pesos abiertos y ejecutable en local, se puede usar para producir corpus de texto controlados con temperatura y penalizaciones ajustables, sin depender de APIs externas.
- Demostraciones de inferencia on-premise para clientes con requisitos de soberanía de datos: el servicio OpenAI-compatible en el puerto 20000 permite integrarlo en prototipos internos sin enviar datos a la nube.
- Benchmarking de aceleradores Tenstorrent: los números publicados (22,8 tokens/s greedy y 19,7 tokens/s con muestreo en 4x p150) permiten comparar el rendimiento de esta ruta vLLM frente a otras configuraciones del mismo hardware.
- Pruebas de regresión de una pila de despliegue completa: al fijar versión de vLLM, commit del plugin y digest del código, el manifiesto sirve para verificar que una actualización de `tt-metal` no rompe la coherencia de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad de tarea. Los únicos datos medidos son de sistema: 22,8 tokens/s en modo greedy (43,8 ms por token) y 19,7 tokens/s con muestreo (46 ms por token) sobre 4x p150, medidos el 2026-09-17 con una prueba de decodificación de 200 pasos y una ejecución de `vllm bench serve` con 8 prompts. También se documenta una comprobación de coherencia cualitativa: la respuesta a la petición de coherencia de tt-metal CI fue "The quick brown fox jumps over the lazy dog."

## Requisitos de hardware

- Hardware validado: 4x Blackhole p150 en línea 1x4 (QuietBox, LoudBox o cuatro chips de un host mayor). No hay validación publicada de esta ruta vLLM en otra configuración.
- QuietBox 2 (2x p300) ha ejecutado el modelo de forma autónoma, pero no a través de este camino de vLLM; el perfil `c32k-quietbox` está orientado al QuietBox de 4x p150.
- Disco: alrededor de 500 GB, repartidos en 360 GB de pesos, 107 GB de caché BF4 de expertos y el resto en cachés de componentes (~23 GB) y compilaciones JIT.
- RAM: suficiente para mantener la tabla PLE de n-gramas de 104 GB en la caché de páginas del sistema.
- VRAM de GPU convencional: no aplica; el modelo se sirve sobre aceleradores Tenstorrent, no se documenta ejecución en CUDA.
- Cabe en GPU de consumo: no disponible; no se describe una ruta de inferencia en GPU de consumo (no hay mención de GGUF ni de llama.cpp).
- Opciones de despliegue: `tt-model serve` con perfiles (`c32k`, `c64k`, `c128k`, `c32k-quietbox`) sobre vLLM 0.26.0 y `vllm-tt-plugin`. No se documentan vLLM estándar en CUDA, TGI, Ollama ni llama.cpp.
- Concurrencia: `max_num_seqs: 1`. Las peticiones adicionales se encolan dentro de vLLM detrás de la activa; hay que ajustar los tiempos de espera del cliente.
- Latencia y throughput: 43,8 ms por token en greedy (22,8 tokens/s) y 46 ms por token con muestreo (19,7 tokens/s), batch 1, en 4x p150.
- Tiempo de arranque: la primera ejecución convierte las capas MoE en la caché BF4 de 107 GB (unos 30 minutos en 4x p150) y compila kernels, lo que añade varios minutos; un reinicio en caliente alcanza el estado listo en unos cinco minutos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, rendimiento ni licencia de modelos comparables, y tampoco de los pesos originales `Qwen/Qwen3.8-Flash-Next` más allá de su identificador y commit. La única comparación documentada es interna: la salida greedy del build sobre Blackhole coincide con la referencia de CPU en 96 de 96 tokens.

## Limitaciones y advertencias

- Una sola secuencia residente: no hay batching multiusuario en esta versión; el resto de peticiones se encolan, lo que hace inviable un servicio con tráfico concurrente real.
- Sin decodificación especulativa (MTP) bajo vLLM en esta versión.
- El muestreo se aplica en el host desde un conjunto reducido de candidatos (`sample_on_device_mode: decode_only`); la distribución es la misma que la del sampler de vLLM, pero la secuencia de tokens para una semilla dada no coincide con la de vLLM.
- `logprobs`, `min_p`, `logit_bias`, `bad_words` y la salida estructurada recaen en el sampler propio de vLLM para esa petición, lo que introduce dos comportamientos de muestreo distintos según la petición.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido ni bajo qué condiciones.
- Idiomas soportados no documentados: no hay garantía de calidad fuera del idioma o idiomas con los que se entrenó el modelo original.
- Sesgos conocidos: no disponible; la model card no aborda sesgos, seguridad ni alineación.
- Riesgo de alucinación: no disponible; no hay evaluaciones de fidelidad ni de tasas de error publicadas.
- Reproducibilidad incompleta: `tt-metal` se construyó desde un checkout local cuyo commit no se publica, por lo que el build exacto no es reconstruible a partir de la información dada.
- Requisitos de infraestructura muy altos: hardware Tenstorrent específico, unos 500 GB de disco y RAM suficiente para una tabla de 104 GB en caché de páginas.
- Tiempos de arranque elevados (unos 30 minutos en frío más compilación de kernels) y unos 10 GB de caché adicionales por cada contexto nuevo que se use.
- Discrepancia no resuelta en la propia documentación entre 48 capas híbridas y 49 capas MoE.
- Las fechas de creación y actualización del repositorio (2026-09-17) y las del build son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del manifiesto antes de desplegarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sjettTT/qwen3.8-flash-next_p150x4
- Pesos originales: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- vLLM v0.26.0: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
- vllm-tt-plugin (commit usado en el build): https://github.com/tenstorrent/vllm-tt-plugin/commit/bef89e429e202caa38d3e3c8a24da4e8cc02405a
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a sistemas de proteccion contra inundaciones y no guardan relacion con el contenido solicitado).

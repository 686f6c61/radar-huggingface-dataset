# frankmorales2020/voxtral-mini-4b-realtime-2602-topo-triton-GGUF

## Resumen
Voxtral Mini 4B Realtime (`2602`) es un modelo de reconocimiento automático del habla (ASR) publicado por Frank Morales Aguilera (Sovereign Machine Laboratory, SOMALA) en formato GGUF, pensado para su ejecución local con `llama.cpp` mediante la herramienta `llama-mtmd-cli`. El modelo combina un decodificador de texto/ASR de aproximadamente 3.434 millones de parámetros con un codificador y adaptador de audio independiente en F16 (archivo `mmproj`, 423 tensores, 1,99 GB) que es obligatorio para procesar entrada de audio. La release se distribuye en dos cuantizaciones del decodificador: Q8_0 (3,66 GB) y BF16 (6,88 GB).

El interés de esta ficha reside en que se trata de una derivación gobernada por "Topological Continual Backpropagation" (Topo-CBP) y entrenada en PyTorch nativo con `TopoAdamW`, según declara el autor. El modelo se orienta a transcripción de voz en tiempo real por chunks de 320 ms, con un factor de tiempo real medido de 0,52x en Q8_0 y 0,40x en BF16 sobre una muestra de 105,50 s a 16 kHz. Es, por tanto, una opción para transcripción local en CPU/GPU sin depender de servicios en la nube.

La relevancia es limitada pero concreta: el repositorio no tiene descargas ni likes en el momento de la consulta, la licencia no está declarada y la model card es fundamentalmente una guía de despliegue. Debe evaluarse como un artefacto experimental de un autor individual, no como un modelo con validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal audio-texto (decodificador de texto/ASR + codificador y adaptador de audio F16 en `mmproj`); gobernado por Topological Continual Backpropagation (Topo-CBP) según el autor |
| Parametros totales | 3.434.118.144 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y BF16 en el decodificador; F16 en el codificador/adaptador de audio (`mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`llama.cpp`), con archivo `mmproj` separado para audio |

## Arquitectura y entrenamiento
La información disponible describe un decodificador de texto/ASR de 3.434 millones de parámetros y un codificador de audio con adaptador multimodal empaquetado aparte en F16 (`mmproj-voxtral-mini-4b-realtime-2602-f16.gguf`, 423 tensores, 1,99 GB). La ejecución requiere pasar ambos archivos a `llama-mtmd-cli` (`-m` para el decodificador y `--mmproj` para el codificador de audio). El procesamiento es por streaming en chunks de 320 ms (la métrica de latencia se expresa por paso de 80 ms), lo que sugiere una arquitectura orientada a ASR incremental más que a transcripción por lotes de audio completo.

El autor declara que el modelo está gobernado por Topological Continual Backpropagation (Topo-CBP) y entrenado en PyTorch nativo con el optimizador `TopoAdamW`. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se detalla la arquitectura interna del codificador de audio (número de capas, tipo de atención, resolución temporal) ni si el decodificador emplea atención lineal, decodificación especulativa u otras innovaciones. Todos estos datos deben considerarse no disponibles.

## Capacidades
- Reconocimiento automático del habla (ASR) y transcripción de audio a texto en local mediante `llama.cpp`.
- Procesamiento de audio en streaming por chunks de 320 ms, apto para transcripción incremental.
- Entrada de audio a 16 kHz mediante el codificador `mmproj` en F16.
- Generación de texto condicionada por audio (el pipeline se etiqueta como "conversational").
- Compatibilidad con `llama-mtmd-cli` y con el ecosistema GGUF de `llama.cpp`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio adicional): solo audio; visión y otras modalidades no disponibles.

## Casos de uso
- Transcripción local de reuniones y entrevistas: el modelo procesa audio a 16 kHz por chunks de 320 ms con `llama-mtmd-cli`, lo que permite transcribir grabaciones sin enviar datos a servicios externos y manteniendo la privacidad del contenido.
- Subtitulado y generación de actas en tiempo casi real: con un factor de tiempo real de 0,52x en Q8_0 sobre hardware de referencia, es viable para flujos donde se tolera un retardo moderado respecto al audio original.
- Procesamiento por lotes de archivos de audio en pipelines de datos: el formato GGUF y la descarga vía `huggingface_hub` permiten integrar el modelo en scripts de Python que recorran directorios de WAV de 16 kHz y generen transcripciones.
- Asistentes de voz conversacionales en local: la etiqueta "conversational" y la modalidad audio-texto sugieren su uso como front-end de ASR para asistentes que después pasan el texto a un LLM.
- Despliegue en entornos con requisitos de soberanía de datos: al ejecutarse con `llama.cpp` sobre hardware propio, encaja en organizaciones que no pueden usar APIs de ASR en la nube por cumplimiento normativo.
- Prototipado e investigación en ASR con optimizadores alternativos: al estar gobernado por Topo-CBP y `TopoAdamW`, sirve como banco de pruebas para comparar dinámicas de entrenamiento frente a modelos ASR convencionales.
- Evaluación de cuantizaciones en ASR: la release incluye Q8_0 y BF16 con métricas de latencia comparadas, lo que facilita estudios de compromiso entre precisión y velocidad en transcripción.

## Benchmarks y rendimiento
El autor publica métricas de ejecución (no de calidad de transcripción) sobre una muestra de audio de 105,50 s a 16 kHz, 1.330 tokens y chunks de 320 ms, evaluadas con `llama-mtmd-cli` y el `mmproj` F16:

| Metrica | Q8_0 | BF16 | Diferencia (BF16 vs Q8_0) |
|---|---|---|---|
| Tamano del decodificador GGUF | 3,66 GB | 6,88 GB (6,40 GiB) | +3,22 GB (~1,88x mayor) |
| Codificador de audio (F16 `mmproj`) | 71,73 s | 71,39 s | -0,34 s |
| Tiempo del decodificador de texto | 131,77 s | 192,49 s | +60,72 s (+46,1% más lento) |
| Tiempo total | 203,52 s | 263,90 s | +60,38 s (+29,7% más lento) |
| Factor de tiempo real | 0,52x | 0,40x | -0,12x |
| Latencia por paso (por 80 ms) | 153,0 ms | 198,4 ms | +45,4 ms (+29,7%) |

No se han publicado resultados de benchmarks de calidad (WER, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el decodificador Q8_0 ocupa 3,66 GB y el BF16 6,88 GB; el `mmproj` F16 añade 1,99 GB. En total, aproximadamente 5,7 GB para Q8_0 y 8,9 GB para BF16, más overhead de contexto y buffers de `llama.cpp`.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, Q8_0 debería caber en GPUs consumer con 8 GB o más de VRAM y BF16 en GPUs con 12 GB o más, aunque el autor no confirma hardware ni backend (CUDA, Metal, ROCm).
- Cabe en GPU consumer: previsiblemente sí en Q8_0 para tarjetas de 8 GB o superiores, y en BF16 para 12 GB o superiores; sin confirmación oficial.
- Opciones de despliegue: `llama.cpp` mediante `llama-mtmd-cli` con `-m` y `--mmproj`. No se documentan integraciones con vLLM, TGI, Ollama ni llama-cpp-python.
- Latencia y throughput: factor de tiempo real de 0,52x (Q8_0) y 0,40x (BF16) sobre la muestra de referencia; latencia de 153,0 ms y 198,4 ms por paso de 80 ms respectivamente. El codificador de audio tarda unos 71,5 s en procesar 105,50 s de audio en ambos casos.

## Comparativa con modelos similares
No se dispone de datos verificables de modelos comparables en la información proporcionada (ni parámetros, ni contexto, ni licencia, ni benchmarks de calidad de los alternativas). La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Parametros | Contexto | Formato | Licencia | Benchmark de calidad |
|---|---|---|---|---|---|
| voxtral-mini-4b-realtime-2602-topo-triton (este) | 3.434.118.144 | no disponible | GGUF | no disponible | no disponible (solo métricas de latencia) |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- La licencia no está declarada en el repositorio, por lo que no puede confirmarse el uso comercial; debe contactarse con el autor antes de cualquier despliegue en producción.
- El repositorio no registra descargas ni likes, y la model card es esencialmente una guía de despliegue: no hay validación comunitaria ni evaluación independiente de la calidad de transcripción (WER).
- No se especifican los idiomas soportados; no debe asumirse cobertura multilingüe.
- No se documenta la longitud de contexto del decodificador, lo que limita la planificación de transcripciones largas sin segmentación manual.
- El modelo requiere obligatoriamente dos archivos (decodificador y `mmproj`) y la herramienta `llama-mtmd-cli`; un uso incorrecto de `LD_LIBRARY_PATH` o la omisión del `mmproj` impide la transcripción.
- El factor de tiempo real es inferior a 1x (0,52x en Q8_0), es decir, más lento que el tiempo real en el hardware de referencia; no es adecuado para aplicaciones de baja latencia estricta sin hardware más potente.
- Riesgo de alucinación y de errores de transcripción en audio con ruido, acentos o solapamiento de hablantes: no hay datos publicados que cuantifiquen este riesgo.
- El entrenamiento con Topo-CBP y `TopoAdamW` es una innovación declarada por el autor sin validación externa; conviene tratar el modelo como experimental.
- No se documentan sesgos conocidos ni evaluaciones de robustez; se recomienda auditar las transcripciones antes de usarlas en dominios sensibles (legal, médico, financiero).

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/voxtral-mini-4b-realtime-2602-topo-triton-GGUF
- Web del autor/organización (SOMALA): https://sovereign-machine-lab.ai
- ORCID del autor: https://orcid.org/0009-0003-9528-0745
- `llama.cpp` (repositorio del runtime): https://github.com/ggml-org/llama.cpp
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

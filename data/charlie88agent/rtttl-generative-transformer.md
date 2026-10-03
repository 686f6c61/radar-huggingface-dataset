# charlie88agent/rtttl-generative-transformer

## Resumen

El RTTTL Generative Transformer es un modelo transformer decoder-only de 2.009.472 parámetros entrenado desde inicialización aleatoria para generar melodías monofónicas en Ring Tone Text Transfer Language (RTTTL). Lo desarrolla el autor independiente charlie88agent y se publica como una liberación de inferencia sin dataset: incluye exclusivamente los pesos en safetensors, un vocabulario fijo y código Python mínimo, sin corpus de entrenamiento, sin audios ni melodías generadas de ejemplo.

El modelo no genera audio en forma de onda ni acepta indicaciones en lenguaje natural: modela eventos simbólicos de tempo, altura o silencio, y duración. Su relevancia es acotada y muy específica: sirve como referencia didáctica de entrenamiento desde cero de un transformer compacto sobre un dominio formal y estructurado (RTTTL), y como generador ligero de melodías monofónicas ejecutable en CPU.

Con 4 bloques, anchura 192, 6 cabezas de atención y una longitud de contexto de 256 tokens, es un modelo deliberadamente pequeño. La gramática `BOS BPM (PITCH|REST DURATION)+ EOS` y el vocabulario de 940 tokens fijos se especifican antes de observar el corpus, lo que acota fuertemente el espacio de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (denso), con embeddings de posición aprendidos, pre-layer normalization, atención causal escalada y bloques feed-forward GELU |
| Parametros totales | 2.009.472 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no aplica; no procesa lenguaje natural (genera RTTTL simbólico; documentación en inglés) |
| Licencia | Código y documentación originales con licencia MIT; los pesos no tienen licencia declarada y no se conceden derechos sobre composiciones de terceros |
| Formato de pesos | safetensors (`model.safetensors`, 8.042.680 bytes) |

Otras especificaciones de arquitectura publicadas por el autor: 4 bloques decoder, anchura de modelo 192, 6 cabezas de atención, anchura feed-forward 768, dropout de entrenamiento 0,1, vocabulario de 940 tokens fijos y embeddings de entrada/salida atados (tied).

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only estándar y denso, sin mezcla de expertos ni estado recurrente. Usa embeddings de posición aprendidos, normalización previa a cada subcapa (pre-layer norm), atención causal de producto escalar escalado y bloques feed-forward con activación GELU. Los embeddings de entrada y salida están atados; safetensors almacena la matriz atada una sola vez y el cargador preserva ese vínculo. La gramática de representación es `BOS BPM (PITCH|REST DURATION)+ EOS`, con cada evento musical codificado en dos tokens: alturas MIDI 60–107, duraciones con denominadores de nota entera 1, 2, 4, 8, 16 o 32 (opcionalmente con puntillo) y tempo entero entre 25 y 900 BPM. Los títulos quedan excluidos de las entradas al modelo.

El entrenamiento se ejecutó el 2026-10-03 sobre una única NVIDIA GeForce RTX 3090 con PyTorch 2.6.0+cu124 y precisión mixta BF16. Se completaron 60 épocas y 7.380 actualizaciones del optimizador con tamaño de lote 64, AdamW con tasa de aprendizaje 0,0003, weight decay 0,01, 100 pasos de warmup, ratio mínimo de tasa de aprendizaje 0,1 y recorte de gradiente a 1,0. Se aplicó transposición de hasta dos semitonos solo durante el entrenamiento. La ejecución se reanudó desde un checkpoint anterior del mismo experimento desde cero y no empleó pesos preentrenados externos. El corpus procede de las cinco colecciones históricas enlazadas desde la página de descargas RTTTL de PICAXE; el análisis aceptó 10.935 de 11.144 registros candidatos, y tras deduplicación exacta se retuvieron 9.786 canciones, divididas por familias musicales detectadas en 7.828 de entrenamiento y 98 (el dato de validación/test queda truncado en la información disponible). No se localizó una licencia explícita de redistribución abierta para el corpus, que no se incluye ni se descarga automáticamente.

## Capacidades

- Generación de melodías monofónicas simbólicas en formato RTTTL, modelando tempo, altura/silencio y duración.
- Control de tempo mediante parámetro `bpm` (rango entero de 25 a 900 BPM).
- Muestreo configurable: temperatura, top-k y top-p, además de `min_events`/`max_events` para acotar la longitud en eventos.
- Enmascarado de tokens ilegales antes del muestreo, de modo que la salida respeta la gramática RTTTL; parte de la validez gramatical está garantizada por el propio muestreador y no debe interpretarse como calidad musical aprendida.
- Retención de BOS/tempo y de un sufijo alineado a eventos cuando una secuencia excede la ventana de contexto.
- Ejecución en CPU sin cuenta, token, GPU, corpus de entrenamiento ni servicio de pago.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de lenguaje natural.
- No acepta indicaciones en lenguaje natural ni genera audio en forma de onda.

## Casos de uso

- Aprendizaje y docencia de transformers desde cero: por su tamaño (2M parámetros) y su código mínimo, sirve para estudiar el ciclo completo de definición de vocabulario, entrenamiento y muestreo en un dominio formal acotado.
- Generación de tonos RTTTL para dispositivos embebidos y módulos de timbre: el modelo emite directamente cadenas RTTTL válidas, aptas para comandos de melodía en hardware compatible.
- Pruebas de pipelines de generación simbólica: permite validar infraestructura de sampling, enmascarado de gramática y round-trip de formato sin depender de datasets grandes.
- Prototipado de juguetes musicales o firmware de timbres: al ejecutarse en CPU y ocupar pocos megabytes, puede integrarse en entornos sin GPU.
- Experimentación académica sobre generación estructurada: la gramática fija y el vocabulario predeterminado facilitan aislar variables en estudios de decodificación y muestreo.
- Referencia para comparativas de eficiencia: sirve como línea base mínima frente a modelos de generación musical de mayor tamaño.
- Banco de pruebas de reproducibilidad: la semilla (`--seed`) y los controles de muestreo permiten repetir experimentos de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el script comprueba el round-trip de RTTTL, pero no puntúa novedad frente al corpus de entrenamiento omitido, por lo que no se proporcionan métricas comparables tipo MMLU, HumanEval, GSM8K ni métricas musicales objetivas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; con 2.009.472 parámetros en FP32 el peso ocupa unos 8 MB (8.042.680 bytes en safetensors). Cabe holgadamente en cualquier GPU, incluso integradas, y en CPU.
- GPU recomendadas: no se requieren. El autor validó la ruta de inferencia en CPU; el entrenamiento original se hizo en una NVIDIA GeForce RTX 3090. Para CUDA basta una versión compatible de PyTorch y `--device cuda`.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual y en la mayoría de iGPU, dado el reducido tamaño.
- Opciones de despliegue: modelo PyTorch personalizado, no es un `AutoModel` ni un `pipeline` de Hugging Face Transformers. El cargador lee JSON local y safetensors, sin deserializar checkpoints ni descargar/ejecutar código remoto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles de forma numérica. El autor menciona que la inferencia en CPU es viable y que se puede fijar el número de hilos con `torch.set_num_threads`, pero no publica cifras de latencia o throughput.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con datos verificables de parámetros, contexto, rendimiento y licencia para establecer una comparativa rigurosa. El modelo pertenece a la categoría de generación musical simbólica en RTTTL desde cero, un nicho muy específico, y la ficha no incluye alternativas con métricas publicadas que permitan una tabla fiable. Se indica por tanto "no disponible".

## Limitaciones y advertencias

- La validez gramatical de la salida está parcialmente garantizada por el enmascarado del muestreador, no por calidad musical aprendida; no debe confundirse corrección de formato con mérito artístico.
- No genera audio en forma de onda ni acepta indicaciones en lenguaje natural; solo produce eventos RTTTL.
- Idiomas: no aplica; el modelo no procesa lenguaje natural. La documentación está en inglés.
- Licencia: el código y la documentación originales son MIT, pero los pesos no tienen licencia declarada. Además, no se conceden derechos sobre las composiciones de terceros del corpus, y no se localizó una licencia explícita de redistribución abierta para este. La disponibilidad pública no implica una autorización general de derechos.
- Antes de reutilizar, el autor recomienda leer `LICENSE_SCOPE.md` y `PROVENANCE.md`, que documentan el alcance de la licencia y la procedencia (comparación a nivel de byte y sus límites).
- El corpus no se incluye ni se descarga automáticamente; no se puede evaluar la novedad de las melodías generadas frente a él.
- Riesgo de alucinación en el sentido de melodías musicalmente incoherentes o poco originales: no se puntúa novedad, y el modelo es muy pequeño (2M parámetros), lo que limita la variedad y calidad.
- Sesgos conocidos: no documentados explícitamente en la información disponible; el dominio de entrenamiento proviene de colecciones históricas concretas, lo que puede sesgar el estilo hacia esas fuentes.
- Limitación de contexto: 256 tokens, ampliable solo mediante retención de BOS/tempo y sufijo alineado a eventos; secuencias largas pueden truncarse.
- El modelo informa del número de secuencias que alcanzaron el límite de eventos (`forced_eos`), señal de que no siempre termina de forma natural.
- En producción: es un modelo personalizado, no integrable directamente como `AutoModel` o `pipeline`; hay que revisar el código Python suministrado antes de ejecutarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charlie88agent/rtttl-generative-transformer
- Repositorio GitHub (entrenamiento, preparación de datos, líneas base, evaluación y renderizado de audio): https://github.com/speccy88/rtttl-generative-transformer
- Página de descargas RTTTL de PICAXE (origen del corpus): https://picaxe.com/rtttl-ringtones-for-tune-command/
- Instrucciones de versiones de PyTorch: https://pytorch.org/get-started/previous-versions/

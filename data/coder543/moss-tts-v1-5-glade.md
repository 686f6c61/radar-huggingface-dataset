# coder543/moss-tts-v1.5-glade

## Resumen

MOSS-TTS-v1.5 for Glade es una conversión híbrida del modelo de síntesis de voz MOSS-TTS-v1.5 (8.49B parámetros) y del tokenizador de audio MOSS-Audio-Tokenizer, ambos desarrollados por OpenMOSS-Team. El paquete lo publica el usuario coder543 y está orientado específicamente al ecosistema Glade sobre Apple Silicon: el modelo de lenguaje autorregresivo se ejecuta en la GPU mediante MLX nativo en Swift, mientras que diecisiete grupos de códec Core AI renderizan PCM mono a 24 kHz en la Neural Engine (ANE).

El objetivo del artefacto no es ofrecer un modelo nuevo, sino un formato de pesos y una configuración de ejecución optimizados para Mac. Los pesos del modelo de lenguaje están cuantizados en grupos afines de 4 bits para las matrices, con cabezas de audio en 8 bits y embeddings de audio en FP16. El repositorio ocupa 10.4 GB e incluye además un codificador opcional de voz de referencia en FP32 para clonación de voces.

Es relevante porque demuestra una ruta de despliegue de TTS de gran tamaño en hardware de consumo Apple, con mediciones concretas de latencia y throughput en M3 y M5 Max, y porque documenta con rigor sus límites: el códec convertido no es numéricamente idéntico al FP32 original (5.60 % de diferencia relativa en RMS de forma de onda) y el paquete no está cualificado en iPhone de 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje autorregresivo (8.49B) + codec neural Core AI en 17 grupos; ejecución híbrida GPU (MLX) / ANE |
| Parametros totales | 8.49B (modelo de lenguaje) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite de generación de 5.000 posiciones por unidad de texto, con posiciones de prompt adicionales |
| Tipos de cuantizacion | Matrices en grupos afines de 4 bits; cabezas de audio en 8 bits; embeddings de audio en FP16; códec en FP16 con codebooks FP32 |
| Idiomas soportados | Inglés (cualificado); otros idiomas del modelo original no cualificados en este paquete |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors mapeados (MLX) + `.aimodel` (Core AI) + `boundary.f32`/`boundary.json` |

## Arquitectura y entrenamiento

El paquete combina dos componentes. Por un lado, un modelo de lenguaje autorregresivo de 8.49B parámetros que genera tokens de audio; se ejecuta en la GPU mediante MLX nativo en Swift. Por otro, un códec neural dividido en diecisiete grupos Core AI que renderizan audio PCM mono a 24 kHz en la Neural Engine. Los pesos del modelo de lenguaje están cuantizados en grupos afines de 4 bits para las matrices, con cabezas de audio en 8 bits y embeddings de audio en FP16, preservando el runtime cuantizado seleccionado. No hay entrenamiento adicional: es una conversión de pesos y configuración de ejecución.

La conversión incluye un codificador opcional de voz de referencia en FP32 original para importar voces aportadas por el cliente; la condicionalidad codificada puede cachearse y reutilizarse, y el codificador solo se carga cuando se necesita clonación. Los assets Core AI tienen las ubicaciones de origen eliminadas, verificándose que las firmas de grafo y las estadísticas de operación permanecen sin cambios. La revisión del modelo de lenguaje de origen es `cdd3b911b1585e3f2dbc7775ef10f9926f58850a` y la del códec/voz es `3cd226ba2947efa357ef453bcad111b6eafba782`. El producto Glade opcional añade limpieza de texto, construcción de prompt, batching continuo dinámico, salida incremental ordenada, conmutación de fase opcional y recuperación de runout asistida por MFA.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a 24 kHz mono.
- Clonación de voz mediante codificador opcional de audio de referencia en FP32, con condicionalidad cacheable.
- Ejecución híbrida GPU/ANE con conmutación de fase entre renderizado en streaming y residente.
- Batching continuo dinámico con carriles que abandonan el lote GPU al completarse.
- Salida incremental ordenada por unidad de texto, con planificación de hasta cinco minutos por unidad.
- Recuperación de runout asistida por MFA que conserva audio verificado y genera solo el sufijo no pronunciado.
- Presupuestos de memoria configurables que pueden reducir los carriles admitidos.
- Sin soporte declarado de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Síntesis de voz en aplicaciones Mac nativas: el paquete consume los directorios `language/` y `codec/` desde el producto Glade, permitiendo integrar TTS de alta calidad en apps Swift sin dependencia de Python en tiempo de ejecución.
- Clonación de voces de marca: el codificador de referencia en FP32 permite importar una voz aportada por el cliente, cachear su condicionalidad y reutilizarla en múltiples síntesis sin recargar el codificador.
- Generación de audiolibros o contenido largo: la planificación de cinco minutos por unidad de texto y el límite de 5.000 posiciones generadas permiten producir pasajes extensos con salida incremental ordenada.
- Lectura de documentos en pipelines de accesibilidad: el batching continuo y la salida incremental facilitan la reproducción progresiva mientras se sintetiza el resto del texto.
- Prototipado de asistentes conversacionales en Mac: la conmutación de fase y el renderizado residente permiten comparar políticas de streaming sin cambiar los tokens de lenguaje resultantes.
- Evaluación de despliegue en hardware Apple: las mediciones incluidas en M3 MacBook Air y M5 Max sirven para dimensionar memoria, latencia y throughput antes de comprometer una arquitectura de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye controles funcionales medidos, no un benchmark completo de habla Moon ni un estudio perceptual general:

| Medicion | Entorno | Resultado |
|---|---|---|
| Control GPU-lenguaje / ANE-códec | M3 MacBook Air, 16 GB, macOS 27.0.1, Release | 48.40 s de audio en 37.91 s (1.28×), excluyendo preparación y escritura WAV |
| Dos unidades completas de 197 palabras | M3 MacBook Air | 157.36 s de audio; PCM y tokens idénticos entre renderizado por fases y residente |
| Runout forzado | M3 MacBook Air | Audio verificado hasta frase a 25.63 s tras entregar 20.16 s; solo se generó el sufijo no pronunciado |
| Recuperación de palabras | M3 MacBook Air | Cohere recuperó las 394 palabras normalizadas en la salida con runout y en el control ordinario |
| Comparación de códec FP32 | M3 MacBook Air | 5.60 % de diferencia relativa en RMS de forma de onda en flujo de 78.48 s; el códec convertido no es numéricamente sin pérdidas |
| Preparación de assets de códec | M3 MacBook Air | 30.51 s inicial; 0.24 s en carga cacheada posterior (puede reutilizar cachés del compilador) |
| iPhone 15 Pro Max 8 GB | iOS 27.0.1, Release | Preparación inicial 45.89 s (cacheada ~1.5 s), pero el calentamiento GPU es terminado por el sistema (`vm-pageshortage`) antes de una síntesis cronometrada |

## Requisitos de hardware

- VRAM/memoria: los pesos del modelo de lenguaje ocupan aproximadamente 4.69 GiB; el archivo de lenguaje mapeado es de unos 5.04 GB. El recuento de memoria debe incluir páginas limpias mapeadas, asignaciones GPU, asignaciones de códec y cachés KV.
- GPU recomendadas: Apple Silicon con GPU y Neural Engine; las mediciones documentadas usan M3 MacBook Air (16 GB) y MacBook Pro M5 Max (18 núcleos CPU, 40 núcleos GPU, 64 GB).
- Cabe en GPU de consumo: sí, en Apple Silicon; no se documenta soporte para GPU NVIDIA ni AMD. El paquete no está cualificado en iPhone 15 Pro Max de 8 GB.
- Opciones de despliegue: MLX nativo en Swift mediante el producto Glade (`GladeMOSS`), que consume `language/` y `codec/`; Python es solo herramienta de exportación y medición, no dependencia de aplicación.
- Latencia y throughput: 1.28× en tiempo real en M3 MacBook Air (48.40 s de audio en 37.91 s) en el control GPU-lenguaje/ANE-códec; preparación inicial de códec de 30.51 s y 0.24 s en carga cacheada.
- Memoria en iPhone: en el 15 Pro Max de 8 GB, con un carril de decodificador y 256 MiB de KV, reducir el prefill de 128 a 16 posiciones no evita que el sistema termine el proceso durante el calentamiento GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MOSS-TTS-v1.5 for Glade (este) | 8.49B (lenguaje) | no disponible; 5.000 posiciones generadas por unidad | Apache-2.0 | Hugging Face, MLX/Core AI para Apple Silicon | Cuantizado 4/8 bits, híbrido GPU/ANE, inglés cualificado |
| OpenMOSS-Team/MOSS-TTS-v1.5 | no disponible en la información | no disponible | Apache-2.0 (según atribución) | Hugging Face | Modelo original upstream del que deriva esta conversión |
| OpenMOSS-Team/MOSS-Audio-Tokenizer | no disponible en la información | no disponible | Apache-2.0 (según atribución) | Hugging Face | Tokenizador de audio upstream; aquí convertido a 17 grupos Core AI |

No se dispone de datos de otros modelos TTS comparables en la información proporcionada.

## Limitaciones y advertencias

- El códec convertido no es numéricamente sin pérdidas respecto al FP32: 5.60 % de diferencia relativa en RMS de forma de onda.
- Solo el inglés está cualificado; otros idiomas del modelo original no se validan en este paquete.
- El paquete no está cualificado en iPhone 15 Pro Max de 8 GB: el sistema termina el proceso por `vm-pageshortage` durante el calentamiento GPU. No se reclama cualificación en iPhone ni Watch.
- No se aportan afirmaciones generales de MOS, eficiencia energética ni RTFx de extremo a extremo en dispositivo.
- Los tiempos de preparación medidos excluyen carga y prefill del lenguaje, y la eliminación de ubicaciones de origen cambia la identidad del artefacto; no son tiempos de arranque garantizados en dispositivo nuevo.
- La carga mapeada puede diferir trabajo a la primera llamada GPU; el recuento de memoria debe incluir páginas limpias mapeadas, asignaciones GPU, de códec y cachés KV.
- La aplicación debe mantener el archivo mapeado sin cambios mientras esté cargado.
- La generación retiene el historial completo de lenguaje de cada unidad y los bloques de códec conservan sus cachés acústicas causales, lo que incrementa el consumo de memoria en secuencias largas.
- Licencia Apache-2.0 para pesos y código original; conviene revisar `LICENSE` y las dos model cards upstream para obligaciones de atribución.
- No se documentan sesgos específicos ni tasas de alucinación en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coder543/moss-tts-v1.5-glade
- Modelo base MOSS-TTS-v1.5: https://huggingface.co/OpenMOSS-Team/MOSS-TTS-v1.5
- Tokenizador de audio base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer

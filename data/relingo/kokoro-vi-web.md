# relingo/kokoro-vi-web

## Resumen

relingo/kokoro-vi-web es un paquete de síntesis de voz (TTS) en vietnamita listo para ejecutarse en el navegador, convertido desde contextboxai/Kokoro-Vietnamese con licencia Apache-2.0. Incluye un archivo ONNX de 83 MB y 14 voice packs de 510 KB cada uno, con salida de audio mono a 24 kHz.

El modelo resuelve la generación de voz del lado del cliente: no requiere enviar el texto a un servidor y puede funcionar con onnxruntime-web mediante WebGPU o WASM como respaldo. Está pensado para aplicaciones web que necesitan pronunciar texto vietnamita con poca dependencia de infraestructura.

Su relevancia está en el formato de despliegue: pesos int8 por canal que se pliegan a fp32 al cargar, lo que reduce la descarga sin cambiar el cálculo. No es un LLM general ni un sistema multimodal; es un TTS acotado a vietnamita y a entradas de hasta 510 tokens de fonemas IPA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS derivado de Kokoro; exportado a ONNX. Arquitectura interna no detallada en la información disponible. |
| Parámetros totales | No disponible; el linaje declarado es Kokoro-82M, sin confirmación de parámetros exactos para esta conversión. |
| Parámetros activos | No aplica (no es un modelo MoE). |
| Longitud de contexto | No aplica como contexto de LLM; la entrada admite n ≤ 510 tokens de fonemas IPA, con relleno a ambos lados. |
| Tipos de cuantización | int8 simétrico por canal de salida en pesos de ≥ 4096 elementos, con `DequantizeLinear`; el runtime puede plegar a fp32 con `session.disable_quant_qdq=1`. Voice packs en float32. |
| Idiomas soportados | Vietnamita (vi). |
| Licencia | Apache-2.0. |
| Formato de pesos | ONNX (`kokoro_vi.web.onnx`) y voice packs `.bin` float32 little-endian. |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna ni el proceso de entrenamiento de este artefacto. Se trata de una conversión de contextboxai/Kokoro-Vietnamese, que a su vez se presenta como un modelo de la familia Kokoro y cita hexgrad/Kokoro-82M como origen. No se indican número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni detalles del ajuste para vietnamita.

La conversión aplica constant folding al grafo exportado, cuantiza a int8 simétrico por canal de salida los inicializadores fp32 con al menos 4096 elementos y extrae los voice packs como tensores float32 de 510 × 256, con un vector de estilo por longitud de entrada. La model card reporta una comprobación en CPU con duraciones de salida de 1,62 s, 8,32 s → 8,28 s y 3,20 s en tres frases de prueba, además de espectros casi idénticos. El texto debe normalizarse y fonemizarse previamente al IPA vietnamita de Kokoro, con tonos representados como flechas; el repositorio fuente usa `vig2p`.

## Capacidades

- Generación de voz en vietnamita con salida mono a 24 kHz.
- 14 voces disponibles: `diem_trinh`, `duc_an`, `duc_duy`, `hung_thinh`, `mai_linh`, `mai_loan`, `manh_dung`, `my_yen`, `ngoc_huyen`, `phat_tai`, `storyvert`, `thanh_dat`, `thuc_trinh` y `tuan_ngoc`.
- Control de velocidad mediante la entrada escalar `speed`.
- Entrada de hasta 510 tokens de fonemas IPA; los textos más largos deben segmentarse.
- Ejecución completamente en cliente con onnxruntime-web, usando WebGPU o WASM como respaldo.
- Selección de estilo de voz mediante el voice pack correspondiente y la fila `min(n, 510) - 1`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni entrada de audio.
- No se documenta soporte multilingüe más allá del vietnamita.
- No se documenta streaming de audio ni clonación de voz; las voces son paquetes fijos.

## Casos de uso

- Lectura de noticias y artículos en vietnamita dentro de una web: el usuario selecciona texto y el navegador genera audio local con WebGPU; los textos largos se dividen en fragmentos de hasta 510 fonemas para evitar el límite de entrada.
- Aprendizaje de pronunciación: las 14 voces y el control de `speed` permiten comparar realizaciones y practicar tonos; es adecuado porque el audio se genera en el propio navegador y requiere fonemización IPA externa con `vig2p`.
- Accesibilidad en aplicaciones web y PWA: TTS para personas con discapacidad visual o dificultades lectoras, con WASM como respaldo cuando WebGPU no está disponible; el tamaño del artefacto facilita su inclusión en una aplicación web.
- Asistentes de voz embebidos de respuesta corta: respuestas de menos de 510 fonemas generadas en cliente para evitar latencia de red y mantener la privacidad del texto; encaja en interfaces conversacionales simples.
- Previsualización de doblaje y creación de contenido: probar voz, velocidad y duración antes de una producción, y exportar audio WAV de 24 kHz para revisión; las 14 voces permiten explorar alternativas sin infraestructura de servidor.
- Kioscos o terminales de atención en vietnamita sin conexión: instrucciones y mensajes cortos en tiendas, aeropuertos o administraciones; el repositorio de 0,1 GB y la ejecución local reducen la dependencia de red.
- Prototipos de audiolibros: dividir capítulos en segmentos, generar cada segmento y concatenar el audio; es adecuado para pruebas de prosodia y tono, aunque requiere un paso de segmentación y ensamblado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta una comprobación cualitativa en CPU con duraciones de salida de 1,62 s, 8,32 s → 8,28 s y 3,20 s en tres frases, además de espectros casi idénticos; no hay datos de MMLU, HumanEval, GSM8K ni métricas objetivas de TTS.

## Requisitos de hardware

- VRAM estimada: no disponible. El artefacto ONNX pesa 83 MB y cada voice pack 510 KB; la huella real depende del runtime y del backend, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponibles. Al usar WebGPU se necesita un navegador y una GPU compatible; también puede ejecutarse con WASM sobre CPU.
- Cabe en GPU de consumo: por el tamaño del artefacto es plausible, pero no hay requisitos oficiales ni una VRAM mínima documentada; no se puede afirmar una cifra concreta.
- Opciones de despliegue: onnxruntime-web 1.30 o superior con WebGPU; WASM como respaldo. No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. La model card solo menciona duraciones de audio de salida en pruebas concretas, sin hardware ni condiciones de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| relingo/kokoro-vi-web | No disponible; linaje Kokoro-82M | n ≤ 510 tokens IPA | No disponible | Apache-2.0 | ONNX + `.bin` | HuggingFace |
| contextboxai/Kokoro-Vietnamese | No disponible | No disponible | No disponible | Apache-2.0 | No disponible; la card menciona `config.json` y voice packs `.pt` | HuggingFace |
| hexgrad/Kokoro-82M | 82M según el nombre del modelo | No disponible | No disponible | No disponible en la información | No disponible | HuggingFace |

No se dispone de otros modelos TTS vietnamitas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta vietnamita; no se documenta multilingüismo ni cambio de idioma dentro de una misma locución.
- No incluye normalizador ni fonemizador: requiere un paso externo a IPA vietnamita, como `vig2p`, y el vocabulario de 114 símbolos del repositorio fuente.
- La entrada máxima es de 510 tokens de fonemas; los textos largos deben dividirse y concatenarse, lo que puede introducir discontinuidades de prosodia.
- onnxruntime-web 1.22 produce salidas incorrectas sin lanzar error en este modelo; se requiere la versión 1.30 o superior para WebGPU.
- La compatibilidad con WebGPU depende del navegador y de la GPU; el respaldo WASM funciona, pero no se publican cifras de latencia.
- No hay benchmarks públicos ni evaluación sistemática de inteligibilidad, naturalidad o precisión tonal; la validación reportada es limitada.
- No se documentan sesgos, acentos o cobertura dialect

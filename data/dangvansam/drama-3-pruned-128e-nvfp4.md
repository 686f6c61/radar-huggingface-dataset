# dangvansam/drama-3-pruned-128e-nvfp4

## Resumen

Drama 3 pruned 128E NVFP4 es una versión derivada y cuantizada de Fish Audio Drama 3, un modelo de texto a voz (TTS) con arquitectura de mezcla de expertos (MoE). Lo publica el usuario dangvansam, no Fish Audio, y se distribuye bajo la Fish Audio Community License v1.0. El modelo conserva 128 de los 256 expertos por capa del original (poda del 50 %), renumera los índices de experto y recorta las filas del router, y convierte los expertos enrutados de FP8 a NVFP4. Los pesos resultantes suman 11.729.966.208 parámetros (unos 11,73 mil millones) y ocupan 15,3 GiB de checkpoint.

El objetivo es reducir el coste de despliegue del TTS original: la variante de referencia en FP8 necesita 46,2 GiB de VRAM en sglang-omni, mientras que esta versión se sirve con 27,0 GiB en sglang-omni y 23,6 GiB en vLLM-Omni, con un tiempo hasta el primer fragmento de audio (TTFA) de 0,12 s y 0,146 s respectivamente en un solo stream. El precio es un empeoramiento moderado de la calidad: el CER en texto plano sube del 4,1 % del FP8 original al 5,2 % en sglang y baja al 3,9 % en vLLM, mientras que la similitud de hablante se mantiene prácticamente igual (0,846 frente a 0,847).

Es relevante ahora porque demuestra que la poda por masa de gate combinada con cuantización NVFP4 permite llevar un TTS MoE de 11,7 B a tarjetas de 24-32 GiB sin reentrenamiento, algo crítico para despliegues de síntesis de voz en producción con latencia de streaming. El autor advierte explícitamente de que las caídas de calidad son más probables que en la variante de 192 expertos y recomienda escuchar las muestras antes de adoptarlo. Los idiomas soportados son vietnamita (vi) e inglés (en).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 256 expertos por capa en el modelo base, podados a 128 por masa de gate; router con filas recortadas e índices renumerados |
| Parámetros totales | 11.729.966.208 (≈11,73 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados en NVFP4 (layout ModelOpt W4A16_NVFP4, grupo 16, escalas de bloque FP8, una escala global FP32 por experto, redondeo al más cercano sin calibración); resto de pesos en bf16; existe variante FP8 del mismo recorte |
| Idiomas soportados | vietnamita (vi) e inglés (en) |
| Licencia | fish-audio-community-license (other) |
| Formato de pesos | safetensors (layout NVFP4 W4A16 de ModelOpt) |
| Tarea | text-to-speech (síntesis de voz con voz de referencia) |
| Tamaño del repositorio | 18,3 GB (checkpoint de 15,3 GiB) |
| Modelo base | fishaudio/drama-3 |
| Descargas / likes | 1 / 1 |

## Arquitectura y entrenamiento

El modelo base es un TTS generativo con arquitectura de mezcla de expertos: cada capa contiene 256 expertos y un router que decide cuáles se activan. Esta ficha no dispone de datos sobre el número de parámetros activos por token, el número de tokens de entrenamiento, la composición del dataset ni si el modelo original usó RLHF o DPO; esa información no está disponible en el material proporcionado.

La modificación aplicada consiste en tres pasos. Primero, poda de expertos por masa de gate: para cada capa se conservaron los 128 expertos más utilizados de los 256, medidos sobre 1700 frases en vietnamita, y se renumeraron los índices de experto y se recortaron las filas del router en consecuencia. Segundo, conversión de los expertos enrutados de FP8 (bloque 128) a NVFP4 (grupo 16, escalas de bloque FP8 y una escala global FP32 por experto) en el layout `W4A16_NVFP4` de ModelOpt, con redondeo al más cercano y sin calibración. Tercero, el resto de pesos se dejó sin cambios en bf16. No hubo ajuste fino posterior a la poda, de modo que la pérdida de calidad inducida por el recorte no se compensa con reentrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en vietnamita e inglés a partir de texto.
- Clonación de voz zero-shot: la evaluación mide similitud de hablante por coseno contra una voz de referencia (0,846 en textos difíciles), lo que implica que el modelo acepta audio de referencia para condicionar el timbre.
- Streaming de audio con TTFA bajo: 0,12 s en sglang-omni y 0,146 s en vLLM-Omni con un solo stream; 0,184 s y 0,187 s con 8 streams concurrentes.
- Normalización de texto robusta: la evaluación separa frases "difíciles" (normalización de acrónimos y siglas, p. ej. «Đại diện bảo hiểm xã hội...», «WHO», «ASEAN») con CER del 7,5 % (sglang) y 7,7 % (vLLM).
- Manejo de frases largas y puntuación compleja en vietnamita, incluidas construcciones con varias cláusulas.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje generativo de propósito general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio de entrada como ASR o modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- **Lectura de noticias y boletines en vietnamita**: el modelo mantiene un CER del 5,2 % (sglang) / 3,9 % (vLLM) en texto plano y resuelve acrónimos institucionales, por lo que sirve para generar audio de forma automatizada a partir de artículos con siglas y nombres propios.
- **Atención al cliente con voz sintética**: con TTFA de 0,12-0,15 s en un stream y 0,184-0,187 s con 8 streams concurrentes, encaja en flujos conversacionales donde la latencia percibida es crítica y el coste por GPU debe mantenerse contenido (27 GiB en sglang, 23,6 GiB en vLLM).
- **Clonación de voz para locuciones de marca**: usando una grabación de referencia se obtiene un timbre consistente (similitud de hablante 0,838-0,846) para doblaje de vídeos cortos o audiolibros, siempre que se cuente con consentimiento explícito de la persona cuya voz se clona.
- **Sustitución de un despliegue FP8 más caro**: si ya se sirve el Drama 3 original en sglang-omni con 46,2 GiB, esta variante libera unos 19 GiB de VRAM por instancia y permite aumentar el número de réplicas o de streams concurrentes en la misma GPU.
- **Síntesis por lotes de audiolibros y material formativo**: el checkpoint de 15,3 GiB en disco facilita el empaquetado en imágenes de contenedor, y vLLM-Omni permite procesar grandes volúmenes de texto con 8 streams en paralelo.
- **Prototipado de asistentes de voz bilingües vi/en**: el modelo cubre ambos idiomas, lo que permite construir un único servicio para mercados donde se mezclan vietnamita e inglés sin mantener dos modelos separados.
- **Investigación en compresión de modelos MoE**: la receta (poda por masa de gate + NVFP4 sin calibración) es reproducible y sirve como línea base para estudiar la relación entre expertos conservados, CER y VRAM.

## Benchmarks y rendimiento

Medido en una NVIDIA RTX PRO 6000 (sm_120, 96 GB) compartida con otros procesos, con 2 voces (femenina y masculina del norte), 20 frases de normalización difícil y 40 frases planas por voz (120 peticiones, 8 concurrentes). CER calculado con un ASR Zipformer vietnamita; similitud de hablante por coseno contra la voz de referencia. El propio autor indica que diferencias de ~1,5 puntos de CER están dentro del ruido.

| Motor / modelo | VRAM (GiB) | TTFA p50 s (1 / 4 / 8 streams) | CER difícil (letras) | CER plano | Similitud de hablante (difícil) | Fallos |
|---|---|---|---|---|---|---|
| sglang-omni, fishaudio/drama-3 FP8 (referencia, 256E) | 46,2 | 0,134 / 0,165 / 0,215 | 6,9 % | 4,1 % | 0,847 | 0 |
| sglang-omni, drama-3-pruned-128e-nvfp4 | 27,0 | 0,120 / 0,152 / 0,184 | 7,5 % | 5,2 % | 0,846 | 0 |
| vLLM-Omni, drama-3-pruned-128e-nvfp4 | 23,6 | 0,146 / 0,163 / 0,187 | 7,7 % | 3,9 % | 0,838 | 0 |

Comparación entre variantes del mismo autor (checkpoint en GiB, VRAM sglang/vLLM en GiB, TTFA p50 a 1 stream):

| Versión | Expertos | Checkpoint (GiB) | VRAM sglang / vLLM (GiB) | TTFA p50 s (sglang / vLLM) | CER difícil (sglang / vLLM) | CER plano (sglang / vLLM) |
|---|---|---|---|---|---|---|
| FP8 original | 256 | 36,9 | 46,2 / - | 0,134 / - | 6,9 % / - | 4,1 % / - |
| NVFP4 | 256 | 23,8 | 36,3 / 30,9 | 0,125 / 0,141 | 6,6 % / 7,3 % | 2,9 % / 2,8 % |
| 192E FP8 | 192 | 29,4 | 40,2 / 37,5 | 0,129 / 0,158 | 7,6 % / 6,7 % | 3,6 % / 3,2 % |
| 192E NVFP4 | 192 | 19,5 | 31,7 / 27,2 | 0,124 / 0,143 | 6,7 % / 6,2 % | 3,7 % / 3,9 % |
| 128E FP8 | 128 | 21,9 | 32,2 / 29,9 | 0,127 / 0,154 | 7,8 % / 8,4 % | 4,8 % / 6,9 % |
| **128E NVFP4 (este modelo)** | 128 | 15,3 | 27,0 / 23,6 | 0,120 / 0,146 | 7,5 % / 7,7 % | 5,2 % / 3,9 % |

No se han publicado resultados en benchmarks estándar de LM (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es un TTS y la evaluación publicada se limita a CER, similitud de hablante, TTFA y VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: 27,0 GiB con sglang-omni y 23,6 GiB con vLLM-Omni (suma de todos los procesos del servidor tras el benchmark, con presupuesto de memoria de GPU ajustado en el caso de vLLM). El checkpoint en disco es de 15,3 GiB.
- GPU utilizada en las mediciones: NVIDIA RTX PRO 6000 (sm_120, 96 GB), compartida con otros procesos durante las pruebas.
- GPU recomendadas: tarjetas con al menos 32 GB de VRAM para operar con margen (A100 40 GB, L40S 48 GB, RTX PRO 6000 96 GB, H100). Con 24 GB (RTX 4090, RTX 3090) no hay holgura: los 23,6 GiB medidos en vLLM dejan prácticamente sin espacio para el contexto de audio y picos de memoria.
- ¿Cabe en GPU de consumo? No de forma fiable con la configuración medida; sería necesario reducir concurrencia o buscar cuantizaciones adicionales, que no están publicadas en este repositorio.
- Opciones de despliegue: sglang-omni (menor TTFA en las pruebas) y vLLM-Omni. No se mencionan soportes de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: TTFA p50 de 0,120 s (1 stream), 0,152 s (4 streams) y 0,184 s (8 streams) en sglang-omni; 0,146 / 0,163 / 0,187 s en vLLM-Omni. Cero peticiones fallidas en las 120 solicitudes de la prueba. No se publica throughput agregado ni RTF.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS comparables en la información proporcionada, por lo que la comparación se limita a las variantes del mismo Drama 3 publicadas por el autor.

| Versión | Expertos | Parámetros totales | Checkpoint (GiB) | VRAM mínima (GiB) | CER plano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| fishaudio/drama-3 FP8 (referencia) | 256 | no disponible | 36,9 | 46,2 | 4,1 % | Fish Audio Community License | HuggingFace (oficial) |
| drama-3-nvfp4 | 256 | no disponible | 23,8 | 30,9 (vLLM) | 2,8 % (vLLM) | Fish Audio Community License | HuggingFace |
| drama-3-pruned-192e-nvfp4 | 192 | no disponible | 19,5 | 27,2 (vLLM) | 3,9 % (vLLM) | Fish Audio Community License | HuggingFace |
| drama-3-pruned-128e-fp8 | 128 | no disponible | 21,9 | 29,9 (vLLM) | 6,9 % (vLLM) | Fish Audio Community License | HuggingFace |
| **drama-3-pruned-128e-nvfp4** | 128 | 11.729.966.208 | 15,3 | 23,6 (vLLM) / 27,0 (sglang) | 3,9 % (vLLM) / 5,2 % (sglang) | Fish Audio Community License | HuggingFace |

Compromiso observado: frente al FP8 original se recorta la VRAM de 46,2 a 23,6-27,0 GiB y el TTFA en 1 stream mejora de 0,134 s a 0,120-0,146 s, a cambio de 1,0-1,1 puntos de CER en texto difícil y una similitud de hablante entre 0,001 y 0,009 inferior, con diferencias que el autor considera dentro del ruido para el CER.

## Limitaciones y advertencias

- Calidad inferior a las variantes con más expertos: el propio autor advierte que «las caídas de calidad son más probables que en 192E» y recomienda escuchar las muestras antes de adoptarlo. El CER en texto plano es de 5,2 % en sglang frente al 2,9 % de la variante NVFP4 de 256 expertos.
- Poda guiada por vietnamita: los 128 expertos conservados se seleccionaron midiendo el uso del gate sobre 1700 frases en vietnamita, por lo que la degradación en inglés puede ser mayor que la reportada y no se ha evaluado por separado.
- Sin ajuste fino tras la poda: el recorte de expertos no se compensa con reentrenamiento, de modo que el daño en calidad es estructural y no recuperable en esta versión.
- Discrepancia entre motores: el CER en texto plano varía entre el 5,2 % (sglang-omni) y el 3,9 % (vLLM-Omni) para los mismos pesos, lo que indica sensibilidad al backend de inferencia; conviene validar con el motor elegido.
- Licencia restrictiva: uso gratuito solo para investigación y fines no comerciales; el uso comercial se limita a licenciatarios con ingresos anuales inferiores a 500.000 USD; ofrecer un servicio alojado (API, SDK o web/app de TTS) requiere una licencia aparte; las salidas no pueden usarse para crear, entrenar o destilar ningún modelo de voz o fundacional.
- Clonación de voz: la licencia prohíbe imitar voces de personas reales sin su consentimiento. Es un riesgo legal directo en aplicaciones de doblaje o atención al cliente.
- Idiomas: solo vietnamita e inglés; no hay soporte declarado de castellano.
- Alucinación en TTS: se manifiesta como errores de pronunciación y normalización (CER del 7,5-7,7 % en frases con siglas y acrónimos), no como texto inventado.
- Validación comunitaria mínima: 1 descarga y 1 like en el momento de redactar la ficha; no es una versión oficial de Fish Audio ni está respaldada por la compañía.
- Longitud de contexto y parámetros activos por token no documentados, lo que impide estimar con precisión los límites de texto por petición y el coste computacional por token generado.
- El tag «8-bit» del repositorio no refleja la cuantización real de los expertos (NVFP4, 4 bits); conviene guiarse por la descripción técnica y no por los tags.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dangvansam/drama-3-pruned-128e-nvfp4
- Modelo base (Fish Audio Drama 3, FP8, 256E): https://huggingface.co/fishaudio/drama-3
- Variante NVFP4 de 256 expertos: https://huggingface.co/dangvansam/drama-3-nvfp4
- Variante 192E FP8: https://huggingface.co/dangvansam/drama-3-pruned-192e-fp8
- Variante 192E NVFP4: https://huggingface.co/dangvansam/drama-3-pruned-192e-nvfp4
- Variante 128E FP8: https://huggingface.co/dangvansam/drama-3-pruned-128e-fp8
- Licencia (Fish Audio Community License v1.0): https://huggingface.co/dangvansam/drama-3-pruned-128e-nvfp4/blob/main/LICENSE
- Aviso legal del derivado (NOTICE): https://huggingface.co/dangvansam/drama-3-pruned-128e-nvfp4/blob/main/NOTICE
- Muestras de audio de la evaluación: https://huggingface.co/dangvansam/drama-3-pruned-128e-nvfp4/tree/main/samples
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (solo resultados no relacionados de Reddit, Twitter y Yahoo Chiebukuro); no se dispone de paper, blog técnico ni demo adicionales.

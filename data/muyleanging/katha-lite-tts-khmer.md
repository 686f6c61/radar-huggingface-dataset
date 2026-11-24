# muyleanging/Katha-Lite-TTS-Khmer

## Resumen

Kathā Lite (កថា) es un modelo de síntesis de voz (text-to-speech) diseñado para jemer (khmer) e inglés, desarrollado por Ing Muyleang. Se plantea como la versión pequeña de Kathā, un modelo de clonación de voz de aproximadamente 200M de parámetros, y su objetivo es la lectura de noticias, artículos y libros escolares en ambos idiomas, incluyendo frases mixtas como "ខ្ញុំប្រើ iPhone រៀន AI". A diferencia de su hermana mayor, Kathā Lite no hace clonación de voz: ofrece 20 voces fijas (10 femeninas y 10 masculinas) y unas 10 estilos de habla predefinidos.

El modelo se encuentra en fase de diseño: según la model card, no está entrenado ni publicado, y todas las cifras de tamaño y datos son objetivos planificados, no resultados medidos. La arquitectura prevista combina un frontend de texto con diccionario jemer y léxico de pronunciación inglesa, un encoder de texto de 8 capas (d512, ≈25M), un predictor de prosodia de 4 capas (≈8M), un decoder de flow matching de 8 capas (d512, ≈30M, 8-16 pasos) y un vocoder a 24 kHz (≈15M), para un total de aproximadamente 80M de parámetros.

Su relevancia radica en cubrir un hueco poco atendido: TTS de calidad para jemer con soporte de código mixto jemer-inglés y orientado a ejecución en dispositivo (ONNX, navegador, teléfono). El repositorio de Hugging Face está vacío (0.0 GB) y no hay pesos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con frontend de texto, encoder de texto (8 capas, d512, ≈25M), predictor de prosodia (4 capas, ≈8M), decoder flow matching (8 capas, d512, ≈30M, 8-16 pasos) y vocoder 24 kHz (≈15M) |
| Parametros totales | ≈80M (objetivo planificado, no medido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona exportación a ONNX para ejecución en dispositivo) |
| Idiomas soportados | jemer (km) e inglés (en), incluyendo frases mixtas en una misma oración |
| Licencia | other, con licencia nombrada "katha-lite-tbd" (pendiente de definir) |
| Formato de pesos | no disponible (se planifica ONNX; el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

La arquitectura planificada es un pipeline TTS en cuatro etapas. El frontend de texto integra un diccionario jemer y un léxico de pronunciación inglesa con un G2P pequeño para palabras desconocidas, unificando ambos idiomas en un conjunto de sonidos compartido con una etiqueta de idioma por palabra. El encoder de texto (8 capas, d512, ≈25M de parámetros) procesa esa secuencia; un predictor de prosodia (4 capas, ≈8M) estima duración, tono y energía; un decoder de flow matching (8 capas, d512, ≈30M, 8-16 pasos) genera el espectrograma mel completo de la frase de una vez, en lugar del enfoque por parches en streaming de Kathā; y un vocoder a 24 kHz (≈15M) produce el audio final con una marca de agua inaudible.

En cuanto a datos, la model card indica objetivos de ≈50-80 horas por voz, con una composición de ≈60% jemer, ≈30% inglés y ≈10% mixto. Los clips jemer se verificarían con Sota (el modelo ASR de la misma familia) y los ingleses con un ASR inglés, descartando lecturas deficientes. No se especifican tokens de entrenamiento, composición detallada del dataset ni uso de RLHF o DPO. Antes de la publicación se prevén comprobaciones de CER en jemer y WER en inglés sobre un conjunto fijo de habla real (números, nombres, frases mixtas) y un test de escucha MOS con personas reales.

## Capacidades

- Síntesis de voz en jemer e inglés, incluyendo frases con mezcla de ambos idiomas en una misma oración.
- 20 voces fijas (10 femeninas, 10 masculinas), cada una capaz de hablar ambos idiomas.
- Aproximadamente 10 estilos de habla (noticias, narrador, profesor, calmado, alegre, triste, emocionado, susurro, etc.) con un control de intensidad del estilo.
- Generación de la frase completa de una vez (no streaming por parches), orientada a latencia baja en frases cortas y medias.
- Ejecución en dispositivo: PC, servidor, navegador web y teléfono mediante exportación ONNX.
- Marca de agua inaudible en el audio generado.
- No incluye clonación de voz por diseño.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura automatizada de noticias en jemer: el modelo está diseñado explícitamente para leer noticias con prosodia de estilo "news", lo que permite generar boletines de audio a partir de texto periodístico sin intervención manual.
- Audiolibros y material escolar: con estilos de narrador y profesor y voces fijas consistentes, se pueden convertir libros de texto y lecciones en audio con una identidad de voz estable a lo largo de capítulos.
- Contenido mixto jemer-inglés: frases como "ខ្ញុំប្រើ iPhone រៀន AI" se procesan con un frontend unificado, útil para divulgación tecnológica donde los términos ingleses aparecen dentro de oraciones jemer.
- Accesibilidad para personas con discapacidad visual en Camboya: la ejecución en dispositivo y en navegador permite integrar lectura de pantalla en aplicaciones web y móviles sin depender de servicios en la nube.
- Asistentes de voz locales y sin conexión: al estar orientado a ONNX y a teléfono, encaja en asistentes embebidos que deben funcionar offline en zonas con conectividad limitada.
- Locución para vídeo y pódcast: los estilos emocionales (alegre, triste, susurro) y el control de intensidad permiten ajustar la interpretación sin regrabar voces.
- Prototipado de interfaces conversacionales: 20 voces fijas facilitan asignar voces distintas a personajes o roles en demos y productos interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas previstas (CER en jemer, WER en inglés y MOS) se medirán antes de la publicación, pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ≈80M de parámetros planificados, la huella en memoria sería reducida, pero no hay pesos publicados ni mediciones.
- GPU recomendadas: no disponible. El diseño apunta a CPU de PC, servidor, navegador y teléfono mediante ONNX, no a GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño (≈80M) sería viable en cualquier GPU de consumo, pero no hay artefactos que lo verifiquen.
- Opciones de despliegue: exportación ONNX prevista para navegador y dispositivo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Estilos | Clonación | Ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Kathā Lite | ≈80M (planificado) | jemer + inglés (mixto) | 20 fijas | ≈10 | No | ONNX, PC, navegador, teléfono | other ("katha-lite-tbd") | No publicado |
| Kathā | ≈200M | jemer (+ inglés) | cualquier clip | libre | Sí | CPU de PC | no disponible en la información | Referenciado en Hugging Face |
| Alternativas TTS multilingües de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (TTS para jemer) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está entrenado ni publicado: el repositorio tiene 0.0 GB y la model card declara explícitamente el estado "in design". Todas las cifras son objetivos, no resultados.
- No hay pesos, demos ni artefactos ONNX disponibles, por lo que no es evaluable ni desplegable hoy.
- Licencia sin definir ("katha-lite-tbd"): no se puede confirmar el uso comercial hasta que el autor publique los términos.
- Riesgo de alucinación y errores de pronunciación: al depender de un G2P para palabras desconocidas y de un léxico inglés, los nombres propios y términos técnicos pueden pronunciarse mal; la propia model card prevé evaluar números, nombres y frases mixtas.
- Sin clonación de voz por diseño: no apto para casos que requieran una voz concreta del usuario.
- Cobertura limitada a jemer e inglés; no se documentan otros idiomas.
- Sesgos de voz y estilo: las 20 voces fijas y los estilos predefinidos pueden no representar toda la variación dialectal o de registro del jemer.
- Las fuentes de habla real y sus licencias aún no se han publicado, lo que impide auditar la procedencia de los datos de entrenamiento.
- Marca de agua inaudible en la salida: conviene tenerlo en cuenta en flujos de postproducción de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Katha-Lite-TTS-Khmer
- Modelo hermano Kathā (clonación de voz): https://huggingface.co/muyleanging/Katha-TTS-Khmer

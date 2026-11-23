# rohansheth/kitten-tts-reprogrammed

## Resumen

Kitten TTS Reprogrammed es una variante editada del modelo de síntesis de voz KittenML/kitten-tts-2-pico, desarrollado por el usuario rohansheth. Se trata de un modelo de text-to-speech en inglés con 7,2 millones de parámetros, pensado para generar voz a partir de texto con un tamaño muy reducido (8 MB en cuantización int8). La modificación no emplea entrenamiento por gradiente, sino técnicas de edición en el espacio de pesos (weight-space programming) descritas por Takehi, Teoh, Zhang y Khattab (MIT CSAIL) en 2026.

El objetivo declarado es reducir el carácter robótico de la voz base: amplía el contorno de entonación, alarga las pausas tras coma (de 80 a 165 ms), ralentiza ligeramente el ritmo y suaviza las frases cortas mediante un proceso de alisado del paquete de voces. El resultado es un reemplazo directo del modelo original, con el mismo tamaño y las mismas cuatro voces, distribuido bajo licencia Apache-2.0.

Es relevante porque demuestra que es posible mejorar un modelo TTS de forma sustancial sin reentrenamiento, manteniendo la compatibilidad de despliegue y el coste computacional. No obstante, el modelo es muy reciente (publicado el 23 de noviembre de 2026), no tiene descargas ni interacciones registradas y su alcance se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Kitten TTS 2 Pico; la model card no detalla la topología interna) |
| Parametros totales | 7,2 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8; fp32 (backend torch) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX y safetensors; tamaño del repositorio 0,1 GB (8 MB int8) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Kitten TTS 2 Pico más allá de identificarlo como un sistema de síntesis de voz de 7,2 millones de parámetros. Lo que sí se documenta es el método de modificación: edición en el espacio de pesos mediante programación en espacio de pesos (weight-space programming), con ediciones en forma cerrada elegidas a partir de la lectura directa de los pesos y sin entrenamiento por gradiente. Esto implica que no hay un corpus de entrenamiento nuevo ni un proceso de RLHF o DPO asociado a esta variante.

Las modificaciones concretas aplicadas son cuatro: ampliación del contorno de entonación sin producir warble, alargamiento de las pausas tras coma de 80 a 165 ms, ralentización ligera del ritmo de habla y alisado de las frases cortas a partir del paquete de voces. El autor indica que estas ediciones sobreviven a la cuantización int8, lo que permite mantener el despliegue en el formato cuantizado sin perder las mejoras. El método de referencia es el trabajo de Takehi, Teoh, Zhang y Khattab (MIT CSAIL) sobre lectura y escritura nativa de pesos de redes neuronales por parte de LLM.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto de entrada.
- Cuatro voces disponibles, incluyendo "Eleanor" según el ejemplo de la model card.
- Entonación mejorada respecto al modelo base: contorno de tono más amplio y pausas tras coma más largas.
- Ritmo de habla ligeramente más lento y frases cortas más limpias.
- Compatibilidad directa con la librería kittenml (pip install kittenml), con backend torch para fp32.
- Exportación a ONNX e inferencia en int8.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.

## Casos de uso

- Lectura de artículos y textos largos en aplicaciones de accesibilidad: el modelo puede convertir texto en voz en inglés con un consumo de recursos mínimo (8 MB int8), adecuado para ejecución local en dispositivos con pocos recursos.
- Asistentes de voz embebidos en aplicaciones móviles o de escritorio: al ser un modelo de 7,2 millones de parámetros y formato ONNX, puede integrarse en apps que necesiten síntesis en el dispositivo sin depender de servicios en la nube.
- Generación de narraciones para vídeos y pódcast de bajo coste: las cuatro voces y la mejora en entonación y pausas permiten producir audio más natural que el modelo base en producciones automatizadas.
- Pruebas de concepto y prototipado de interfaces conversacionales: la instalación mediante pip y la API sencilla de kittenml facilitan la integración rápida en prototipos de asistentes por voz.
- Investigación sobre edición de modelos: sirve como caso práctico reproducible para estudiar técnicas de weight-space programming aplicadas a modelos pequeños de TTS, comparando antes y después con las muestras incluidas en samples/.
- Sistemas de avisos y notificaciones habladas: la mejora en frases cortas y la limpieza del paquete de voces lo hacen adecuado para mensajes breves en inglés, como alertas o confirmaciones.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 50 frases por cada una de las 4 voces:

| Métrica | Original | Reprogrammed |
|---|---:|---:|
| UTMOS (↑) | 4,285 | 4,358 |
| WER % (↓) | 0,45 | 0,36 |
| Similitud de hablante | 1,000 | 0,922 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo ocupa 8 MB en int8 y el repositorio completo 0,1 GB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican en la model card; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada. La inferencia en CPU es viable.
- Cabe en GPU consumer: sí, en todas las gamas actuales, dado el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (formato principal), backend torch de kittenml para fp32, y safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kitten TTS Reprogrammed | 7,2 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Variante editada de Kitten TTS 2 Pico |
| KittenML/kitten-tts-2-pico | 7,2 M | no disponible | Apache-2.0 | Hugging Face (modelo base) | UTMOS 4,285; WER 0,45 % |
| Otros modelos TTS pequeños | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Las palabras compuestas presentan pequeñas imperfecciones de pronunciación (por ejemplo, "fisher-men").
- La similitud de hablante baja de 1,000 a 0,922 respecto al modelo base, lo que indica un cambio en el timbre respecto a la voz original.
- Riesgo de alucinación no documentado; en TTS el riesgo se traduce en pronunciaciones incorrectas o entonación atípica, no en contenido inventado.
- Sesgos conocidos: no documentados en la model card.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base KittenML/kitten-tts-2-pico.
- Modelo muy reciente (creado el 23 de noviembre de 2026) y sin descargas ni validación comunitaria; las métricas proceden únicamente del autor.
- El método de edición en espacio de pesos no está detallado paso a paso en la model card, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohansheth/kitten-tts-reprogrammed
- Modelo base: https://huggingface.co/KittenML/kitten-tts-2-pico
- Organización KittenML: https://huggingface.co/KittenML
- Método de weight-space programming (blog): https://rikiyat.github.io/blog/weight-space-programming

# kaeru-shigure/hanezu-tts

## Resumen

Hanezu TTS es un modelo de síntesis de voz (text-to-speech) en japonés desarrollado por el usuario independiente kaeru-shigure. Se trata de un modelo de arquitectura propia, no basada en los esquemas habituales de TTS neuronal de gran escala, con un tamaño extremadamente reducido: aproximadamente 1,7 millones de parámetros en el modelo acústico y de vocoder, a los que se suma un modelo auxiliar de predicción de lectura (tsqyomi) de unos 70 millones de parámetros. Su objetivo declarado es ofrecer inferencia rápida incluso en CPU manteniendo una calidad "escuchable" y capacidad de leer textos con mezcla de inglés.

El modelo se entrenó sobre un corpus sintético generado a partir de Qwen3-TTS con LoRA en japonés y un LoRA de características de hablante de cuatro parámetros, produciendo unas 35 horas de audio sintético sobre frases de un corpus balanceado en japonés. La idea técnica central consiste en transformar la información en representaciones intermedias de baja dimensionalidad (inspiradas en VAE) y características deterministas, de modo que la tarea del modelo acústico y del vocoder sea más sencilla.

Es relevante para quienes necesitan un TTS ligero, desplegable en hardware modesto y con licencia MIT, aunque con las limitaciones propias de un experimento personal: sin benchmarks publicados, sin código de entrenamiento y con calidad y expresividad aún mejorables según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Propia, no especificada en detalle; modelo acústico + vocoder con representación intermedia de baja dimensionalidad inspirada en VAE; modelo auxiliar de predicción de lectura (tsqyomi) |
| Parámetros totales | 1,7 M (modelo TTS) + ~70 M (tsqyomi) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Japonés (con lectura parcial de texto en inglés) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB) |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura transformer estándar de TTS de gran escala, sino un diseño propio en el que la información se convierte en un espacio intermedio de baja dimensionalidad, junto con características deterministas, que alimentan al modelo acústico y al vocoder. Esta reducción de dimensionalidad, inspirada en la idea de los autoencoders variacionales, busca disminuir la dificultad de la tarea que debe aprender el modelo y, con ello, permitir un tamaño de parámetros muy reducido (1,7 M). El frontend emplea pyopenjtalk-plus para el análisis fonético y un modelo auxiliar tsqyomi (~70 M) para mejorar la predicción de lectura y la entonación; el autor indica que su aportación es pequeña y que el sistema funciona sin él.

El entrenamiento se realizó sobre un corpus generado de forma sintética: aproximadamente 30.000 frases de un corpus balanceado en japonés, fonetizado con pyopenjtalk-plus, y audio sintetizado con Qwen3-TTS más un LoRA de japonés y un LoRA de características de hablante de cuatro parámetros, totalizando unas 35 horas. El autor evitó deliberadamente usar voces de referencia por motivos de derechos. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; tampoco se publica el código de entrenamiento.

## Capacidades

- Síntesis de voz en japonés a partir de texto, con inferencia rápida en CPU.
- Lectura de textos con mezcla de inglés, con resultados calificados por el autor como "razonablemente correctos".
- Predicción de lectura y mejora de entonación mediante el modelo auxiliar tsqyomi.
- Control de características de hablante a través de un LoRA de cuatro parámetros empleado en la generación de datos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se documentan capacidades multilingües más allá del japonés y la lectura de términos en inglés.

## Casos de uso

- Lectura de textos en japonés en aplicaciones de accesibilidad: el modelo puede convertir artículos o documentos en voz con latencia baja en CPU, lo que lo hace adecuado para entornos sin GPU.
- Asistentes de voz locales en dispositivos embebidos: su tamaño de 1,7 M de parámetros permite integrarlo en sistemas con recursos limitados, como Raspberry Pi o portátiles modestos.
- Generación de avisos y notificaciones habladas: útil en aplicaciones de domótica o sistemas de megafonía que requieren síntesis rápida y desatendida.
- Prototipado de interfaces conversacionales en japonés: sirve para validar flujos de voz antes de invertir en modelos TTS de mayor calidad.
- Lectura de contenido mixto japonés-inglés: adecuado para textos técnicos o titulares que incluyen términos en inglés, gracias a su manejo de la mezcla de idiomas.
- Pruebas de concepto e investigación: al ser un modelo pequeño con licencia MIT y arquitectura original, resulta útil para experimentar con representaciones intermedias de baja dimensionalidad en TTS.
- Síntesis por lotes en servidores sin GPU: permite generar audio de forma masiva en CPU, aunque con calidad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas objetivas como MOS, MCD ni comparativas numéricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del modelo (1,7 M de parámetros más 70 M del auxiliar), la huella de memoria es mínima y la inferencia está pensada para CPU.
- GPU recomendadas: no se especifican; el autor indica que su entorno de GPU es de gama baja y que el modelo está optimizado para CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor publica una demo web y un repositorio de código.
- Latencia y throughput: no se publican cifras; el autor afirma que la inferencia en CPU es rápida, sin cuantificar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hanezu TTS | 1,7 M (+70 M auxiliar) | no disponible | Japonés (con inglés parcial) | MIT | HuggingFace, demo web, GitHub |
| Qwen3-TTS | no disponible en la información | no disponible | no disponible | no disponible | Usado como generador de datos sintéticos |
| Modelos TTS neuronales de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría; la información proporcionada solo menciona Qwen3-TTS como herramienta de generación del corpus sintético, no como modelo comparable en prestaciones.

## Limitaciones y advertencias

- Calidad y expresividad limitadas: el propio autor reconoce que la entonación y el tamaño del modelo aún tienen margen de mejora y que no prevé seguir optimizándolo.
- Entrenado exclusivamente con audio sintético generado por otro modelo, lo que puede introducir artefactos y sesgos propios del generador.
- Sin voces de referencia reales, por lo que la naturalidad y la variedad de hablantes pueden verse restringidas.
- Cobertura lingüística limitada al japonés; la lectura de inglés es aproximada y no está garantizada.
- No se publican benchmarks ni evaluaciones subjetivas formales, lo que impide estimar su calidad de forma objetiva.
- El repositorio figura con 0,0 GB y sin descargas ni likes en el momento de la consulta; conviene verificar la disponibilidad real de los pesos.
- No se publica el código de entrenamiento, lo que dificulta la reproducibilidad y la adaptación a otros dominios.
- Licencia MIT: permite uso comercial, pero al tratarse de un experimento personal sin garantías, no se recomienda para producción sin una evaluación previa.
- Riesgo de errores de lectura en nombres propios, kanji poco frecuentes y términos técnicos en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/kaeru-shigure/hanezu-tts
- Demo: https://kaeru-shigure.github.io/hanezu-tts/
- Código: https://github.com/kaeru-shigure/hanezu-tts
- GitHub del autor: https://github.com/kaeru-shigure

# LiquidAI/LFM3-Omni-2B-ONNX

## Resumen

LFM3-Omni-2B-ONNX es la versión exportada a ONNX Runtime del modelo multimodal any-to-any LFM3-Omni-2B desarrollado por Liquid AI. Se trata de un modelo de aproximadamente 2.000 millones de parámetros que acepta y genera texto, imagen y audio dentro de un mismo pipeline, lo que lo sitúa en la categoría de modelos omni (entrada y salida en múltiples modalidades). La versión ONNX está pensada para inferencia multiplataforma fuera del ecosistema PyTorch, lo que facilita su despliegue en entornos con ONNX Runtime, incluidos dispositivos con aceleración específica.

El repositorio empaqueta por separado los componentes del modelo: un decoder de lenguaje, un encoder de visión, un encoder de audio y un codec decoder para la generación de audio, además de un depth decoder en float32 común a todas las precisiones. Se ofrecen variantes cuantizadas (por ejemplo, decoder en q4 y encoder de visión en q8), lo que reduce los requisitos de memoria frente a los pesos en precisión completa. El tamaño total del repositorio es de 21,1 GB, ya que incluye todas las precisiones y componentes.

La relevancia de esta ficha radica en que permite evaluar rápidamente un modelo omni pequeño (2B) con licencia LFM1.0 y soporte para 23 idiomas, orientado a aplicaciones de borde y despliegues ligeros donde no es viable un modelo multimodal de decenas de miles de millones de parámetros. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni any-to-any con decoder de lenguaje, encoder de visión, encoder de audio y codec decoder; detalles internos no especificados) |
| Parámetros totales | ~2B (según el nombre del modelo; desglose por componente no disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q4 (decoder), q8 (vision encoder), float32 (depth decoder); otras precisiones no detalladas en la información disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (23 idiomas) |
| Licencia | LFM1.0 (licencia propia de Liquid AI, marcada como "other" en Hugging Face) |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LFM3-Omni-2B más allá de su naturaleza omni: el repositorio ONNX separa explícitamente un decoder de lenguaje, un encoder de visión, un encoder de audio y un codec decoder, lo que confirma un diseño modular con codificadores específicos por modalidad y un decoder generativo compartido. El depth decoder se distribuye en float32 y es común a todas las precisiones, lo que sugiere que su cuantización afectaría a la calidad de forma significativa.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.). Cualquier afirmación al respecto sería especulativa y, por tanto, se omite. Para detalles de arquitectura y uso se remite a la model card del modelo base original.

## Capacidades

- Generación de texto y razonamiento general en 23 idiomas.
- Procesamiento de imagen como entrada (vision encoder incluido en el paquete ONNX).
- Procesamiento de audio como entrada (audio encoder incluido).
- Generación de audio como salida (codec decoder incluido), lo que completa el pipeline any-to-any.
- Capacidad multimodal combinada: entrada y salida en texto, imagen y audio según el pipeline declarado (any-to-any).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: 23 idiomas declarados (inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco, danés, griego, finés, hebreo, neerlandés, sueco y turco).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz locales: el modelo puede recibir audio como entrada y generar audio como salida gracias al audio encoder y al codec decoder, lo que permite construir asistentes conversacionales por voz que se ejecutan con ONNX Runtime en dispositivos sin GPU dedicada de gran tamaño.
- Descripción de imágenes en aplicaciones de accesibilidad: el vision encoder permite procesar una imagen y el decoder de lenguaje generar una descripción textual en cualquiera de los 23 idiomas soportados, útil para lectores de pantalla o apps de apoyo a personas con discapacidad visual.
- Transcripción y resumen multimodal en movilidad: al combinar entrada de audio y salida de texto, se puede usar en aplicaciones de notas de reuniones o dictado que corren en portátiles y dispositivos de borde con ONNX Runtime.
- Procesamiento de documentos con imágenes embebidas: el modelo puede recibir capturas o páginas escaneadas y generar respuestas textuales, integrándose en flujos de extracción de información donde el despliegue debe ser multiplataforma (Windows, Linux, macOS, ARM).
- Generación de respuestas habladas en kioscos interactivos: el codec decoder permite sintetizar audio de respuesta directamente desde el modelo, simplificando la pila de un kiosco que hoy requeriría un TTS separado.
- Prototipado rápido de pipelines omni en investigación: al estar en formato ONNX, se puede integrar en experimentos con ONNX Runtime y comparar frente a implementaciones PyTorch sin reescribir el código de inferencia, lo que acelera la evaluación de modelos omni pequeños.
- Despliegue en entornos con requisitos de portabilidad: la separación por componentes y las precisiones q4/q8 permiten empaquetar solo los módulos necesarios (por ejemplo, solo visión + texto) para reducir el tamaño del artefacto en aplicaciones de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del modelo (2B) y las precisiones incluidas, un decoder en q4 ronda los 1-1,5 GB y en float32 en torno a 4 GB solo para el decoder; a ello hay que sumar los encoders de visión y audio y el codec decoder, por lo que el consumo total depende de qué componentes se carguen.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 2B es desplegable en GPU de consumo como RTX 3060/4060/4090, pero no hay validación oficial en la información disponible.
- ¿Cabe en GPU de consumo? Sí, previsiblemente, dado el tamaño de 2B y las variantes cuantizadas, aunque no se confirma oficialmente en la información disponible.
- Opciones de despliegue: ONNX Runtime (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un paquete ONNX con componentes separados, el despliegue estándar es mediante ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-ONNX | ~2B | no disponible | texto, imagen, audio (entrada y salida) | LFM1.0 | ONNX |
| LFM3-Omni-2B | ~2B | no disponible | texto, imagen, audio | LFM1.0 | pesos originales (no detallado) |
| Alternativas omni de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría (omni, ~2B) que permitan una comparación cuantitativa rigurosa. La única comparación directa posible es con el modelo base LFM3-Omni-2B, del que esta versión es una exportación cuantizada a ONNX.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado con datos web multilingües es esperable cierto sesgo, pero no se confirma.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, existe riesgo de generar contenido incorrecto, especialmente en modalidades como audio o visión donde los errores pueden ser más difíciles de detectar.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones largas o documentos extensos.
- Limitaciones de idioma: aunque se declaran 23 idiomas, no se especifica el nivel de calidad por idioma; el rendimiento puede variar notablemente entre ellos.
- Restricciones de licencia: la licencia LFM1.0 es una licencia propia de Liquid AI marcada como "other"; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir condiciones específicas de atribución o restricciones.
- Caveat de producción: al ser una exportación ONNX con componentes separados y cuantizaciones mixtas (q4/q8/float32), la calidad puede diferir de la del modelo base en precisión completa; conviene validar la variante concreta antes de desplegar.
- El repositorio pesa 21,1 GB por incluir todas las precisiones; en producción conviene descargar solo los archivos necesarios para evitar costes de almacenamiento y transferencia.
- No se confirma soporte de tool calling ni de modo agente, lo que limita su uso en pipelines que dependan de estas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B-ONNX/blob/main/LICENSE
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/talk

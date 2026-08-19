# lookbe/Qwen3-TTS-GGUF

## Resumen

El modelo `lookbe/Qwen3-TTS-GGUF` es una conversión a formato GGUF de los pesos del sistema de síntesis de voz Qwen3-TTS, desarrollado por el equipo Qwen de Alibaba Cloud. Esta conversión, creada por el usuario `lookbe`, permite ejecutar el modelo mediante `qwentts.cpp`, un runtime en C++17/GGML que soporta inferencia en CPU, CUDA, Vulkan y Metal. El objetivo principal es facilitar el despliegue de TTS multilingüe en entornos con recursos limitados, aprovechando las cuantizaciones GGUF para reducir el uso de memoria y VRAM.

El modelo original Qwen3-TTS se compone de dos partes: un "talker" (modelo de lenguaje que convierte texto en códigos de audio a 12 Hz) y un "tokenizer" (codec neuronal que reconstruye la forma de onda de 24 kHz). El repositorio ofrece tres modos de funcionamiento (base, customvoice y voicedesign) y dos tamaños de talker (0.6B y 1.7B parámetros), con cuantizaciones que van desde F32 hasta Q4_K_M. Esto lo hace adecuado para tareas como clonación de voz zero-shot, diseño de voces por descripción y síntesis de voz en 11 idiomas, todo bajo licencia Apache 2.0.

La relevancia de este modelo radica en que acerca un sistema TTS de última generación a entornos de producción con restricciones de hardware, manteniendo la flexibilidad de elegir entre calidad y eficiencia según la cuantización. Al estar basado en GGUF, se integra con el ecosistema de llama.cpp y derivados, lo que simplifica su adopción en proyectos existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (talker: Qwen3 LM + code predictor MTP head + speaker encoder; tokenizer: SEANet + ConvNeXt + DAC v2 + RVQ) |
| Parametros totales | 914.643.008 (según safetensors del modelo base; el repo incluye versiones de 0.6B y 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa texto largo) |
| Tipos de cuantizacion | F32, BF16, Q8_0, Q4_K_M |
| Idiomas soportados | zh, en, fr, de, es, it, pt, ja, ko, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: talker y tokenizer) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del sistema Qwen3-TTS de Alibaba. La arquitectura se divide en dos componentes principales:

- **Talker**: un modelo de lenguaje basado en Qwen3 (0.6B o 1.7B) que recibe texto y genera códigos de audio a 12 Hz. Incluye una cabeza de predicción MTP (multi-token prediction) y un codificador de hablante opcional para los modos customvoice y voicedesign.
- **Tokenizer**: un codec neuronal compuesto por SEANet, ConvNeXt, DAC v2 y RVQ, que convierte los códigos de 12 Hz en audio de 24 kHz mono. Este tokenizer es compartido entre todos los talkers.

La conversión a GGUF sigue una política de cuantización específica: los tensores del tokenizer como los codebooks RVQ, las proyecciones de entrada/salida y los kernels de convolución con filas no alineadas se mantienen en F32 o F16, mientras que el talker (cuyas dimensiones ocultas son divisibles por 256) sigue las K-quants estándar de llama.cpp. No se dispone de información detallada sobre el entrenamiento original (datos, número de tokens, técnicas de alineación), pero se sabe que el modelo base fue desarrollado por el equipo Qwen con licencia Apache 2.0.

## Capacidades

- Síntesis de voz multilingüe en 11 idiomas (chino, inglés, francés, alemán, español, italiano, portugués, japonés, coreano, ruso y árabe).
- Clonación de voz zero-shot a partir de un clip de referencia (modo `customvoice`).
- Diseño de voces nuevas mediante descripciones de atributos (modo `voicedesign`, solo en la versión de 1.7B).
- Soporte de dialectos del mandarín (indicado en las etiquetas del modelo).
- Generación de audio de 24 kHz mono.
- Ejecución en múltiples backends: CPU, CUDA, Vulkan y Metal, con selección automática del mejor dispositivo disponible.
- Cuantización flexible para adaptarse a distintos requisitos de memoria y calidad.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede generar respuestas de voz en varios idiomas con una voz consistente, gracias a la clonación de voz y al modo base. Su tamaño reducido en cuantización Q4_K_M permite ejecutarlo en servidores sin GPU dedicada.
- **Producción de audiolibros**: permite sintetizar narraciones con voces personalizadas a partir de descripciones (modo voicedesign), reduciendo costes de grabación y acelerando el proceso editorial.
- **Doblaje de contenido multimedia**: con la clonación de voz (customvoice), se puede replicar el timbre de un actor para doblar a otros idiomas, manteniendo la identidad vocal en diferentes mercados.
- **Asistentes de voz en dispositivos embebidos**: los archivos GGUF Q4_K_M del talker 0.6B ocupan menos de 1 GB, lo que permite su despliegue en Raspberry Pi, routers o sistemas de automoción con recursos limitados.
- **Accesibilidad**: lectura de texto en voz alta para personas con discapacidad visual, con soporte multilingüe y la posibilidad de elegir voces naturales o personalizadas.
- **Creación de contenido para videojuegos**: el modo voicedesign permite generar voces de personajes con características específicas (tono, edad, acento) sin necesidad de contratar actores de doblaje.
- **Sistemas de navegación GPS**: se pueden crear voces personalizadas para aplicaciones de mapas, usando la clonación de voz para ofrecer una experiencia más cercana al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: según el tamaño de los archivos GGUF:
  - Talker 0.6B Q4_K_M (629 MB) + tokenizer Q4_K_M (255 MB) ≈ 884 MB de VRAM.
  - Talker 1.7B Q4_K_M (1.2 GB) + tokenizer Q4_K_M (255 MB) ≈ 1.45 GB de VRAM.
  - Talker 1.7B Q8_0 (2.1 GB) + tokenizer Q8_0 (291 MB) ≈ 2.39 GB de VRAM.
  - Las versiones F32/BF16 requieren más memoria (hasta 8 GB para el talker 1.7B F32).
- **GPUs recomendadas**: cualquier GPU NVIDIA con soporte CUDA (las arquitecturas Ada y Blackwell ofrecen el mejor rendimiento), GPUs AMD/Intel con Vulkan, o Apple Silicon con Metal.
- **CPU**: soportada como fallback, con selección automática de la variante x86.
- **Opciones de despliegue**: el runtime `qwentts.cpp` (C++17/GGML) es la vía principal. No se mencionan integraciones con vLLM, Ollama o TGI en la documentación.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas en términos de rendimiento. Se puede señalar que existen otras conversiones GGUF de Qwen3-TTS (por ejemplo, de `affectively-ai` o `HaujetZhao`), pero no hay datos objetivos de comparación.

## Limitaciones y advertencias

- La cuantización (especialmente Q4_K_M) puede degradar la calidad del audio en comparación con los pesos originales en FP32.
- El modelo puede tener dificultades con nombres propios, siglas o palabras poco frecuentes, generando pronunciaciones incorrectas.
- La clonación de voz requiere un clip de referencia limpio y representativo; clips ruidosos o de baja calidad pueden afectar al resultado.
- No se han documentado sesgos específicos, pero los modelos TTS pueden reflejar sesgos en la pronunciación de acentos o variedades dialectales.
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o con poca validación comunitaria.
- Aunque la licencia es Apache 2.0 (permite uso comercial), es recomendable revisar los términos del modelo base y del codec para asegurar el cumplimiento.

## Enlaces

- HuggingFace: https://huggingface.co/lookbe/Qwen3-TTS-GGUF
- Repo de qwentts.cpp: https://github.com/ServeurpersoCom/qwentts.cpp
- Repo oficial de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Repo alternativo de GGUF (HaujetZhao): https://github.com/HaujetZhao/Qwen3-TTS-GGUF

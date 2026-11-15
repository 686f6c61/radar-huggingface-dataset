# laion/Humaneness-Voice-Large-1.7-Acting-LoRA-r128

## Resumen

Humaneness-Voice-Large-1.7-Acting-LoRA-r128 es un adaptador LoRA de rango 128 para el modelo de síntesis de voz Humaneness Voice Large 1.7, desarrollado por LAION. Su propósito es añadir capacidades de interpretación actoral no musical: diálogo expresivo, enmascaramiento emocional, voces de personaje, monólogos imaginarios, situaciones físicas extremas y vocalizaciones sin palabras. El adaptador está entrenado sobre el backbone semántico MOSS-TTS y el Talker local del modelo base, y no es un checkpoint LLaMA ni un adaptador PEFT convencional.

El adaptador añade 96.337.920 parámetros entrenables distribuidos en 146 proyecciones de atención, con rango 128 y alpha 128, sobre un modelo base congelado en BF16. El entrenamiento se realizó durante tres épocas sobre 152.572 ejemplos únicos (457.716 presentaciones reales), con un 50% de condicionamiento por referencia de audio, 25% por alias de voz registrado y 25% sin condicionamiento. El resultado es un adaptador que permite control fino de la entrega emocional y vocal en cinco idiomas: inglés, alemán, español, francés y neerlandés.

El modelo es relevante para desarrolladores que necesitan generar audio expresivo con control actoral detallado (instrucciones inline de emoción, duración y pausas) sin recurrir a servicios de pago, y para investigadores que quieran reproducir o extender el entrenamiento con datos y código publicados. La licencia CC-BY-4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre backbone MOSS-TTS (semantic backbone + Talker local) |
| Parámetros totales | 96.337.920 (adaptador); base no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (entrenamiento en BF16 base y FP32 adaptadores) |
| Idiomas soportados | en, de, es, fr, nl (ejemplos sin palabras marcados como `zxx`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repo de 1,3 GB; runner propio, no PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el backbone semántico de MOSS-TTS y el Talker local del modelo base Humaneness Voice Large 1.7. Se trata de un LoRA nativo con rango 128 y alpha 128 sobre 146 proyecciones de atención, con 96.337.920 parámetros entrenables. El modelo base permanece congelado en BF16 durante todo el entrenamiento, mientras que los adaptadores se inicializan en FP32. No es un checkpoint LLaMA ni un adaptador PEFT estándar, por lo que requiere el loader incluido en el repositorio.

El entrenamiento cubrió 152.572 ejemplos únicos (122.057 de nuevas tareas de expansión performativa no musical y 30.515 de replay de actuación vocal previa), presentados una vez por época durante tres épocas, lo que suma 457.716 presentaciones reales. El condicionamiento se distribuyó exactamente en 50% referencia de audio, 25% alias de voz registrado y 25% sin condicionamiento. Se enmascararon doce posiciones adicionales de padding fuera de la pérdida. No se incluyeron canciones de LeVo ni otros ejemplos cantados. La configuración usó batch global 32, pico de learning rate 2e-5, warmup lineal del 5% y decaimiento coseno hasta 2e-6, sobre ocho GPUs GH200.

## Capacidades

- Síntesis de voz expresiva con instrucciones inline de emoción, duración en segundos y pausas explícitas dentro del script.
- Interpretación actoral: diálogo expresivo, enmascaramiento emocional, voces de personaje y monólogos imaginarios.
- Vocalizaciones sin palabras (nonverbal vocalization), marcadas como `zxx` en los manifiestos.
- Condicionamiento por referencia de audio: el runner acepta un WAV de referencia de un solo hablante con al menos 5,04 segundos de audio útil (usa como máximo 14,96 segundos).
- Condicionamiento por alias de voz registrado, además de la opción sin condicionamiento.
- Soporte multilingüe en inglés, alemán, español, francés y neerlandés.
- Decodificación configurable con temperature, top-p, top-k, repetition penalty y CFG (clasifier-free guidance) opcional.
- Generación de audio con control de duración solicitada (no garantizada al milisegundo) y detección de hits del límite de frames.

## Casos de uso

- Doblaje y localización de contenido: el adaptador permite generar diálogo expresivo en cinco idiomas con instrucciones de emoción y duración, adecuado para sustituir voces en vídeos o audiolibros manteniendo la entrega actoral.
- Producción de audiolibros y ficción sonora: el formato de script con instrucciones inline (`GENERAL` + `SCRIPT`) permite dirigir la interpretación de cada línea, incluyendo pausas y vocalizaciones no verbales como suspiros.
- Videojuegos con diálogo ramificado: la capacidad de voces de personaje y enmascaramiento emocional permite generar variantes de una misma línea con distintas emociones sin regrabar, usando el condicionamiento por alias o referencia.
- Prototipado de asistentes de voz con matiz emocional: el modelo puede generar respuestas con entrega controlada (cálida, vulnerable, sorprendida) para evaluar la percepción de usuarios antes de invertir en grabaciones profesionales.
- Investigación en evaluación perceptual de TTS: el repositorio incluye el runner portátil, los casos de evaluación generables con `make_eval_cases.py` y la ruta de control con el modelo base (`--scale 0`), lo que permite comparaciones controladas con las mismas semillas.
- Reproducción y extensión del entrenamiento: el repositorio publica la pertenencia exacta al entrenamiento, los prompts, los tokens seleccionados, los datos y el código, lo que facilita reentrenar o ajustar el adaptador con nuevos datos.
- Generación de material de accesibilidad: vocalizaciones no verbales y entrega emocional pueden enriquecer la síntesis para usuarios con discapacidad visual o cognitiva en contextos narrativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la finalización del entrenamiento no es evidencia de mejora en calidad perceptual y que se requieren escuchas controladas y evaluación adicional.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida; la model card indica que una única GPU de 80 GB es un punto de partida conservador, no un mínimo medido.
- GPU recomendadas: el entrenamiento se realizó sobre ocho GH200; para inferencia se sugiere una GPU CUDA de 80 GB como A100 o H100.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: runner portátil propio incluido en el repositorio (`infer_adapter.py`), con Python 3.11 o superior (entorno de producción con Python 3.13). El runner mantiene modelo y códec cargados entre casos y ejecuta inferencia secuencial; no reclama batching optimizado entre prompts. La compatibilidad con otros backends (vLLM, llama.cpp, TGI, Ollama) no está validada y debe probarse antes de cambiar de backend.
- Latencia y throughput: no disponibles. El runner registra duración de generación y tiempos por caso en el JSON de salida.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (TTS expresivo con control actoral) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La finalización del entrenamiento no demuestra mejora en calidad perceptual; se requieren escuchas controladas y evaluación formal antes de usar en producción.
- El adaptador es un LoRA nativo para MOSS-TTS, no un PEFT estándar ni un checkpoint LLaMA; debe cargarse con el loader incluido en el repositorio.
- No se debe aplicar además el adaptador de rango 32 almacenado en el repositorio del modelo base, ya que el base 1.7 ya contiene un adaptador integrado.
- Las duraciones solicitadas no son garantías de precisión al milisegundo; los hits del límite de frames se marcan en la salida.
- La referencia de audio debe contener un solo hablante y al menos 5,04 segundos de audio útil; el runner usa como máximo 14,96 segundos.
- Las recetas del manual del modelo base no han sido revalidadas para este adaptador de rango 128.
- Riesgo de sesgos y alucinación: no disponible en la información proporcionada.
- Licencia CC-BY-4.0: permite uso comercial con atribución; deben respetarse las condiciones de la licencia del modelo base.
- El runner no ofrece batching optimizado entre prompts y la compatibilidad con otros backends no está garantizada.

## Enlaces

- Hugging Face: https://huggingface.co/laion/Humaneness-Voice-Large-1.7-Acting-LoRA-r128
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Large-1.7
- Proyecto GitHub: https://github.com/LAION-AI/Humaneness-Voice
- Manual de prompting y ejemplos de audio del base: https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/
- Dataset de origen: https://huggingface.co/datasets/laion/german-english-voice-acting-challenges

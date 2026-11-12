# Eperson/eperson-voice

## Resumen

eperson-voice es un modelo de síntesis de voz (text-to-speech) de un único hablante especializado en portugués de Brasil (pt-BR), con un estilo de narración didáctica y coloquial de acento carioca. Lo desarrolla el usuario Eperson a partir de un ajuste fino supervisado del modelo base Qwen3-TTS-12Hz-1.7B-Base de Alibaba Cloud, entrenado sobre aproximadamente 7,3 horas de la propia voz del autor grabadas para vídeos educativos de filosofía, física y matemáticas.

El modelo resuelve un problema muy concreto: disponer de una voz sintética personal en pt-BR con calidad suficiente para narración de contenido educativo, sin depender de servicios comerciales de TTS. Al estar construido sobre Qwen3-TTS, hereda su arquitectura de generación de audio basada en códec a 12 Hz y una ventana de generación de hasta unos 40 segundos por llamada (500 tokens de códec).

Con 1.916.676.352 parámetros y un peso de repositorio de 4,5 GB en bf16, es un modelo ligero que cabe en GPU de consumo. Su licencia Apache 2.0 y su formato safetensors estándar lo hacen directamente desplegable con la librería `qwen-tts`. Es relevante ahora porque demuestra que el ajuste fino de TTS de alta calidad sobre una voz propia es viable con pocas horas de audio y hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (generación de audio basada en códec a 12 Hz), fine-tuning LoRA fusionado sobre el modelo base |
| Parametros totales | 1.916.676.352 (aproximadamente 1,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación limitada a 500 tokens de códec, unos 40 s de audio por llamada) |
| Tipos de cuantizacion | no disponible (el autor publica pesos en bf16; no se documentan cuantizaciones GGUF u otras) |
| Idiomas soportados | portugués de Brasil (pt-BR) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo, sin adaptador LoRA separado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-TTS-12Hz-1.7B-Base, un sistema de síntesis de voz que genera tokens de códec a 12,5 fotogramas por segundo (de ahí la relación de 500 tokens con aproximadamente 40 segundos de audio). Sobre esta base se aplicó un ajuste fino con LoRA de rango 32 y alpha 64 sobre todas las proyecciones de atención y MLP tanto del componente *talker* como del predictor de códec. El entrenamiento usó una tasa de aprendizaje de 1e-4 con decaimiento coseno, 2 épocas, tamaño de lote efectivo de 8 y precisión bf16. Los pesos LoRA se fusionaron en el checkpoint final, de modo que el resultado es un modelo completo y no requiere adaptadores adicionales.

Los datos de entrenamiento consisten en 2.707 segmentos de 3 a 15 segundos (7,3 horas en total) cortados en pausas naturales de la narración del autor, con reducción de ruido mediante DeepFilterNet, audio mono a 24 kHz y transcripciones derivadas de los tiempos de palabra de Whisper. Se empleó un único clip de referencia fijo para todas las filas. Es destacable que el autor no usó el script oficial `sft_12hz.py` de Qwen3-TTS por errores conocidos (falta de `text_projection`, doble desplazamiento de etiquetas y desalineación de fotogramas del predictor de códec), sino una pasada de entrenamiento corregida.

## Capacidades

- Síntesis de voz en portugués de Brasil (pt-BR) con una única voz identificada como `eperson`.
- Estilo de narración didáctica y conversacional con acento carioca.
- Generación de audio mono a 24 kHz.
- Generación de hasta unos 40 segundos de audio por llamada (límite de 500 tokens de códec), pensada para concatenar fragmentos en narraciones largas.
- Control de muestreo mediante temperatura, top-k, top-p y penalización de repetición, con semilla fijable para resultados reproducibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No es multilingüe: solo pt-BR. No reproduce emociones actuadas ni otras voces.

## Casos de uso

- Narración de vídeos educativos: el modelo está entrenado específicamente sobre narración de filosofía, física y matemáticas, por lo que encaja en la locución de contenido didáctico. Se dividiría el guion en frases, se generaría cada una con la misma semilla y se concatenarían con pausas breves.
- Producción de audiolibros y pódcast en pt-BR: con un único hablante y estilo consistente, permite generar capítulos completos fragmento a fragmento; la ventana de 40 s por llamada obliga a segmentar el texto, lo cual es un flujo estándar en TTS de narración.
- Accesibilidad y lectura de textos: conversión de artículos, apuntes o documentación a audio en portugués de Brasil para personas con discapacidad visual o para consumo en movilidad, aprovechando que el modelo cabe en una GPU de 6 GB.
- Prototipado de asistentes de voz en pt-BR: integración en pipelines de aplicaciones de voz donde se necesita una voz natural y fija sin coste por carácter; la licencia Apache 2.0 permite uso comercial.
- Localización de material formativo: doblaje o sustitución de locuciones en cursos online brasileños manteniendo una voz coherente entre módulos.
- Investigación en TTS y ajuste fino de voces: sirve como ejemplo reproducible de fine-tuning LoRA sobre Qwen3-TTS con correcciones documentadas al script oficial, útil para quienes quieran adaptar el modelo base a otras voces con pocas horas de audio.
- Generación de material de prueba para sistemas de reconocimiento de voz en pt-BR: creación de corpus sintéticos controlados con una voz conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo menciona pruebas de escucha y una comprobación automática de transcripción, sin métricas numéricas (MOS, WER u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB libres en GPU según el autor (pesos en bf16 de 4,5 GB más overhead).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el autor no especifica modelos concretos. Por capacidad, encaja en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM.
- Ejecución en CPU: posible pero lenta, según el autor.
- Opciones de despliegue: librería `qwen-tts` con `Qwen3TTSModel.from_pretrained`, `device_map` configurable y `attn_implementation="sdpa"` (no requiere flash-attn). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Eperson/eperson-voice | 1,7B | 500 tokens de códec (~40 s por llamada) | pt-BR | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | 1,7B | misma arquitectura base | no disponible en la informacion | Apache 2.0 | Hugging Face |
| Otros TTS multilingües de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el modelo base Qwen3-TTS-12Hz-1.7B-Base, del que este checkpoint hereda arquitectura, tamaño y licencia; la diferencia es la especialización en una voz pt-BR concreta y el estilo de narración. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Solo admite portugués de Brasil; no funciona en otros idiomas.
- Una única voz (`eperson`) y un único estilo (narración explicativa); no reproduce emociones actuadas ni otras voces.
- Pueden aparecer pausas extrañas a mitad de frase, especialmente en torno a comas.
- Nombres propios poco frecuentes y palabras extranjeras pueden pronunciarse mal.
- Los resultados varían entre semillas; el autor recomienda regenerar y elegir la mejor toma.
- No hay métricas de calidad objetivas más allá de pruebas de escucha y una comprobación automática de transcripción.
- Riesgo de alucinación o artefactos de audio en entradas atípicas; no se documenta un análisis específico de sesgos.
- El modelo reproduce la voz real de una persona: el autor prohíbe explícitamente su uso para suplantación, engaño o atribuirle declaraciones falsas, y recomienda divulgar que el audio es sintético cuando pueda confundirse con una grabación.
- La licencia Apache 2.0 permite uso comercial, pero las restricciones éticas sobre suplantación de identidad siguen aplicando.
- El autor advierte de errores conocidos en el script oficial de entrenamiento de Qwen3-TTS; quien quiera reproducir el proceso debe usar una pasada de entrenamiento corregida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eperson/eperson-voice
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de ejemplos de audio: carpeta `samples/` del repositorio en Hugging Face

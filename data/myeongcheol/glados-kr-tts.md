# myeongcheol/glados-kr-tts

## Resumen

GLaDOS KR TTS es un ajuste fino (fine-tuning) del modelo de síntesis de voz Qwen3-TTS, desarrollado por el usuario myeongcheol, que reproduce el timbre de GLaDOS (el personaje de Portal) hablando en coreano. El modelo parte de dos checkpoints base de Qwen (0.6B y 1.7B parámetros) y fija el timbre en un token de hablante llamado `glados`, de modo que se puede generar voz sin necesidad de audio de referencia en tiempo de inferencia. Se publica bajo licencia Apache-2.0 en Hugging Face, con un tamaño de repositorio de 8,1 GB que incluye varios subdirectorios correspondientes a distintas versiones del ajuste.

El interés técnico del modelo radica en que documenta con detalle un proceso de fine-tuning de TTS sobre datos escasos: 1.020 clips (88,9 minutos) de voz original de GLaDOS en inglés extraídos de Portal 1 y 2, más 143 muestras de pseudo-datos en coreano generadas en modo zero-shot por el propio modelo base. El autor reporta que el modelo de 0.6B colapsa el coreano a partir de la segunda época de entrenamiento, por lo que limita el SFT a una sola época, mientras que el de 1.7B se mantiene estable hasta tres épocas.

Es un proyecto de nicho, orientado a fans y a experimentación con voice conversion y TTS multilingüe, no un modelo de producción generalista. Su relevancia actual está en servir como ejemplo reproducible de adaptación de un TTS base a un timbre concreto y a un idioma distinto del original, con todas las limitaciones y advertencias legales que ello implica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (modelo de síntesis de voz basado en transformer; detalles internos no disponibles) |
| Parámetros totales | 0,6B (variantes `lite-0.6b-1ep`, `robotic-0.6b-v3`, `first-run-collapsed-0.6b-ep4`) y 1,7B (variante `pro-1.7b-3ep`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el ejemplo de uso emplea `torch.float32` en CPU) |
| Idiomas soportados | coreano (`ko`); el modelo base es multilingüe, pero el ajuste está orientado a coreano |
| Licencia | Apache-2.0 (con advertencia de uso no comercial por los datos derivados de Portal) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (SFT) sobre Qwen3-TTS, un sistema de síntesis de voz de Qwen. El repositorio organiza los pesos en subdirectorios: `lite-0.6b-1ep` (base 0.6B, 1 época, usado en el motor lite de la demo), `pro-1.7b-3ep` (base 1.7B, 3 épocas, máxima calidad de timbre), `robotic-0.6b-v3` (base 0.6B, 1 época, reentrenado con datos coreanos filtrados con la receta de válvulas de Valve, que produce entonación robótica sin filtro) y `first-run-collapsed-0.6b-ep4` (primer intento con colapso del coreano, conservado solo como referencia y no recomendado). También incluye `samples/` con muestras generadas durante el entrenamiento.

Los datos de entrenamiento combinan 1.020 clips de voz real de GLaDOS en inglés (88,9 minutos, procedentes de los datasets `RoxasYTB/glados_p1_en-ljspeech` y `glados_p2_en-ljspeech`, remuestreados a 24 kHz) con 143 muestras de pseudo-datos en coreano generadas en zero-shot por el modelo base. La configuración de entrenamiento es batch 8 con acumulación de gradiente 4, learning rate 2e-6 y token de hablante `glados`. Para el modelo de 0.6B fue necesario parchear la proyección de texto (`text_projection`) y limitar el entrenamiento a una época, ya que a partir de la segunda el coreano colapsa; el de 1.7B tolera tres épocas. La validación se hizo con similitud ASR mediante faster-whisper, con valores de 0,78 a 1,00, y el autor afirma que la versión desplegada obtiene resultados E2E ASR perfectos en la demo pública.

## Capacidades

- Síntesis de voz (text-to-speech) en coreano con el timbre fijado de GLaDOS mediante el token de hablante `glados`.
- Generación sin audio de referencia: el timbre está embebido en el token, por lo que no se requiere voice cloning en tiempo de inferencia.
- Control de generación mediante parámetros de decodificación (`max_new_tokens`, `do_sample`, `top_k`, `top_p`, `temperature`, `repetition_penalty`).
- Soporte de la API `generate_custom_voice` del paquete `qwen_tts`, con selección de idioma (`language="Korean"`).
- Variantes con distinto compromiso calidad/velocidad: motor lite (0.6B) y motor pro (1.7B).
- Variante `robotic-0.6b-v3` con entonación robótica característica para uso lúdico.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento; es un modelo exclusivamente de TTS.

## Casos de uso

- Doblaje de contenido de fans: generar diálogos en coreano con la voz de GLaDOS para vídeos, mods o animaciones no comerciales, usando el token `glados` sin necesidad de grabar referencia.
- Demo interactiva web: el modelo alimenta el motor dual (RVC en dos etapas + Qwen3-TTS FT) de la demo pública en `pinion.kr/glados`, útil como referencia de integración.
- Pruebas de voice conversion: comparar la ruta de ajuste fino directo (este modelo) frente a la ruta RVC (modelo `Homiebear/GLaDOS`) para evaluar calidad y latencia.
- Generación de audiolibros o avisos en coreano con timbre sintético característico, en entornos personales y no comerciales.
- Investigación sobre fine-tuning de TTS con datos escasos: el repositorio documenta el colapso del coreano en 0.6B a partir de la época 2 y el parche de `text_projection`, lo que sirve como caso de estudio reproducible.
- Prototipado de asistentes con voz: usar `lite-0.6b-1ep` en CPU para iterar rápido (26-30 s por frase) antes de pasar a `pro-1.7b-3ep` para calidad final.
- Pruebas de robustez ASR: el autor valida con faster-whisper (similitud 0,78-1,00), de modo que el modelo también puede emplearse para generar corpus sintéticos de evaluación en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas internas de validación:

| Métrica | Valor |
|---|---|
| Similitud ASR (faster-whisper) en validación | 0,78-1,00 |
| ASR E2E de la versión desplegada | perfecto (según el autor) |
| Latencia CPU, `lite-0.6b-1ep` | ~26-30 s por frase |
| Latencia CPU, `pro-1.7b-3ep` | ~64-130 s por frase |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El ejemplo oficial funciona en CPU con `dtype=torch.float32`; el repositorio completo ocupa 8,1 GB, pero cada subdirectorio contiene solo los pesos de su variante.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 0,6B en fp32 requiere del orden de 2,4 GB solo para pesos, y uno de 1,7B unos 6,8 GB; con overhead de inferencia, una GPU consumer de 8-12 GB debería bastar para la variante lite y una de 12-16 GB para la pro (estimación, no dato del autor).
- ¿Cabe en GPU consumer? Sí, previsiblemente ambas variantes en tarjetas de 8 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: paquete oficial `qwen_tts` instalado desde `git+https://github.com/QwenLM/Qwen3-TTS.git`, junto con `torch` y `soundfile`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publican cifras en CPU (26-30 s/frase para lite, 64-130 s/frase para pro). No hay datos de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `myeongcheol/glados-kr-tts` (este) | 0,6B / 1,7B | no disponible | coreano | Apache-2.0 (con caveat de datos) | TTS con timbre fijado de GLaDOS |
| `Homiebear/GLaDOS` | no disponible | no disponible | no disponible | no disponible | Conversión de voz RVC a GLaDOS |
| `Qwen/Qwen3-TTS-12Hz-0.6B-Base` | 0,6B | no disponible | multilingüe | Apache-2.0 | TTS base zero-shot |
| `Qwen/Qwen3-TTS-12Hz-1.7B-Base` | 1,7B | no disponible | multilingüe | Apache-2.0 | TTS base zero-shot |

La comparación con otros TTS coreanos de código abierto no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Derechos de personaje: GLaDOS es propiedad de Valve Corporation; este es un proyecto de fans no oficial y los derechos de marca y personaje pertenecen a Valve.
- Restricción de uso: los datos de entrenamiento derivan de voces de videojuegos, por lo que el autor recomienda uso exclusivamente personal y no comercial, pese a la licencia Apache-2.0 del código y los pesos base.
- El modelo de 0,6B colapsa el coreano a partir de la segunda época; solo es estable con una época y con el parche de `text_projection`.
- La variante `first-run-collapsed-0.6b-ep4` está explícitamente desaconsejada.
- Los datos coreanos son pseudo-datos generados por el propio modelo base (143 muestras), lo que puede amplificar sesgos y errores del base.
- Latencia alta en CPU (hasta 130 s por frase en la variante pro); no hay datos de rendimiento en GPU.
- Riesgo de alucinación y errores de pronunciación en textos largos o fuera del dominio de entrenamiento; el autor solo reporta validación ASR, no evaluación perceptual sistemática.
- Soporte limitado a coreano en la práctica; el resto de idiomas del base no está validado tras el ajuste.
- Proyecto de nicho con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/myeongcheol/glados-kr-tts
- Demo pública: https://pinion.kr/glados/
- Repositorio del paquete Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Modelo base 0.6B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Modelo base 1.7B: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Dataset de voz GLaDOS Portal 1: https://huggingface.co/datasets/RoxasYTB/glados_p1_en-ljspeech
- Dataset de voz GLaDOS Portal 2: https://huggingface.co/datasets/RoxasYTB/glados_p2_en-ljspeech
- Modelo RVC alternativo: https://huggingface.co/Homiebear/GLaDOS

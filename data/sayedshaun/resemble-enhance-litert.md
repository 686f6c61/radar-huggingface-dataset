# SayedShaun/resemble-enhance-litert

## Resumen

Resemble Enhance LiteRT es una conversión experimental del modelo Resemble Enhance de Resemble AI al formato LiteRT (TFLite) para inferencia local de reducción de ruido y mejora de voz. El autor de la conversión es SayedShaun, y el modelo subyacente es un sistema de dos etapas (denoiser y enhancer) entrenado originalmente por Resemble AI para restaurar audio de voz degradado. Esta versión empaqueta cinco redes neuronales en LiteRT con pesos almacenados en float16 y cómputo en CPU con entradas y salidas float32, sumando aproximadamente 712 MB.

El interés de esta ficha radica en que permite ejecutar un pipeline de mejora de voz sin PyTorch, usando únicamente `ai-edge-litert`, NumPy y SciPy en escritorio, o LiteRT en Android. Está pensado para escenarios de procesamiento local y edge donde no se quiere depender de frameworks de deep learning pesados. La conversión es explícitamente experimental: el pipeline completo se ha probado en escritorio Linux x86-64, pero no se ha verificado en dispositivo Android ni se ha validado la calidad de audio de forma amplia.

El modelo trabaja con audio mono a 44,1 kHz, procesa ventanas solapadas de un segundo y está orientado exclusivamente a inglés según la model card. La licencia es MIT, heredada del modelo original, y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de cinco redes neuronales convertidas a LiteRT (denoiser y enhancer de Resemble Enhance) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa ventanas de audio de 1 segundo con solapamiento |
| Tipos de cuantizacion | Pesos almacenados en float16; entradas, salidas y computo en float32 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (cinco modelos en `models/`, mas `mel-filters.f32`) |

## Arquitectura y entrenamiento

El modelo base, Resemble Enhance, es un sistema de mejora de voz en dos etapas: un denoiser que elimina ruido de fondo y un enhancer que restaura y mejora la calidad de la señal. Esta conversión a LiteRT descompone ese pipeline en cinco redes neuronales independientes, con pesos almacenados en float16 pero con entradas, salidas y operaciones en float32 sobre CPU. El repositorio incluye además un fichero de filtros mel (`mel-filters.f32`) necesario para el preprocesado espectral.

No se dispone de información sobre el número de tokens, la composición del dataset de entrenamiento ni sobre si el modelo original usó RLHF o DPO; estos datos corresponden al modelo upstream de Resemble AI y no se detallan en la model card de esta conversión. La innovación técnica de esta versión es la eliminación de la dependencia de PyTorch: la inferencia se ejecuta íntegramente con `ai-edge-litert`, y el procesamiento de audio y el solver de flujo se implementan con NumPy y SciPy. En Android se usa LiteRT 2.3.0 junto con JTransforms para las transformadas.

## Capacidades

- Reducción de ruido de voz (speech denoising) sobre audio mono a 44,1 kHz.
- Mejora y restauración de calidad de voz (speech enhancement) mediante la etapa enhancer.
- Procesamiento por ventanas solapadas de un segundo, con conversión automática a mono 44,1 kHz en el script de escritorio.
- Inferencia sin PyTorch: solo LiteRT, NumPy y SciPy en escritorio; LiteRT y JTransforms en Android.
- API Kotlin (`ResembleEnhancer`) para integración en aplicaciones Android, con ejecución en hilo de trabajo.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo puramente audio-a-audio.
- Capacidad multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Limpieza de grabaciones de voz para podcasts o entrevistas: el pipeline denoiser más enhancer elimina ruido de fondo y mejora la inteligibilidad antes de la publicación, ejecutándose localmente sin enviar audio a la nube.
- Preprocesado de audio para sistemas de reconocimiento de voz: se puede aplicar la mejora antes de alimentar un ASR, reduciendo ruido que degrada la transcripción, con la ventaja de que todo el procesamiento ocurre en CPU.
- Aplicaciones Android de grabación de voz: mediante la API Kotlin `ResembleEnhancer` y LiteRT 2.3.0, se puede integrar la mejora en una app de notas de voz o mensajería, ejecutando la inferencia en un hilo de trabajo sobre muestras mono a 44,1 kHz.
- Restauración de archivos de audio históricos o de baja calidad: el modelo puede mejorar grabaciones con ruido de fondo constante, procesando ventanas de un segundo de forma solapada.
- Procesamiento por lotes en servidores sin GPU: al no requerir PyTorch ni aceleradores, se puede desplegar en entornos Linux x86-64 con Python 3.12 para limpiar grandes volúmenes de audio en CPU.
- Prototipado de pipelines de audio en edge: sirve como base para experimentar con LiteRT en dispositivos con recursos limitados, aunque la validación en dispositivo Android aún está pendiente según el autor.
- Herramientas de accesibilidad: mejora de audio para personas con dificultades auditivas en contenido hablado grabado en condiciones ruidosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una comparación numérica de fidelidad frente a PyTorch en condiciones de ruido emparejado y ventanas de un segundo: 49 de 44.100 muestras superaron un umbral `atol=0.002, rtol=0.002`, con una diferencia absoluta máxima de 0,00378. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU (LiteRT con cómputo float32).
- Tamaño en disco: aproximadamente 712 MB para los cinco modelos LiteRT más los ficheros auxiliares.
- GPU recomendadas: no disponible; la conversión está orientada a CPU.
- Cabe en hardware consumer: sí, al ejecutarse en CPU; no se especifican requisitos mínimos de memoria RAM.
- Despliegue en escritorio: Python 3.12 con `ai-edge-litert==2.1.2`, `numpy>=1.26,<3`, `scipy>=1.11,<2` y `soundfile>=0.12,<1`; probado en Linux x86-64.
- Despliegue en Android: LiteRT 2.3.0 y JTransforms 3.1; Kotlin 2.4.0, compile SDK 35, minimum SDK 24.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Resemble Enhance LiteRT (esta ficha) | no disponible | ventanas de 1 s, mono 44,1 kHz | LiteRT/TFLite | MIT | Experimental, no verificado en Android |
| ResembleAI/resemble-enhance (original) | no disponible | ventanas de 1 s, mono 44,1 kHz | PyTorch | MIT | Oficial, referencia upstream |
| Otros modelos de speech enhancement en LiteRT | no disponible | no disponible | LiteRT/TFLite | no disponible | no disponible |

La comparación principal es con el modelo original de Resemble AI, del que esta conversión deriva y cuya licencia MIT hereda. No se dispone de datos de benchmarks para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Conversión experimental, no es un lanzamiento oficial de Resemble AI.
- El pipeline completo de Android no se ha ejecutado en dispositivo ni emulador; la compatibilidad, el rendimiento y la calidad de salida en Android están sin verificar.
- El troceado en ventanas de un segundo puede introducir artefactos audibles.
- En la comparación numérica con PyTorch, 49 de 44.100 muestras superaron el umbral de tolerancia, con diferencia máxima absoluta de 0,00378; se requiere una validación de calidad de audio más amplia.
- Solo soporta inglés según la model card.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el enhancer puede introducir artefactos o alterar la señal en condiciones de ruido no vistas durante el entrenamiento.
- Sesgos conocidos: no disponible.
- Licencia MIT: permite uso comercial, pero al derivar del modelo original conviene revisar también las condiciones del upstream.
- El script de escritorio requiere Python 3.12 y versiones concretas de dependencias; no se garantiza compatibilidad con otras versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SayedShaun/resemble-enhance-litert
- Modelo base: https://huggingface.co/ResembleAI/resemble-enhance
- Repositorio original de Resemble AI: https://github.com/resemble-ai/resemble-enhance

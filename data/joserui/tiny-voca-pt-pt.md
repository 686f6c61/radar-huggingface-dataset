# joserui/tiny-voca-pt-pt

## Resumen

tiny-voca PT-PT es un modelo de síntesis de voz (text-to-speech) para portugués europeo desarrollado por joserui. Se trata de una adaptación del modelo tiny-voca de Muhammed Nazeem, reentrenado desde cero sobre 22,8 horas de voz sintética en portugués de Portugal. El modelo completo, incluyendo el generador de forma de onda, tiene 4.532.875 parámetros, lo que lo sitúa en la categoría de modelos ultraligeros capaces de ejecutarse en CPU.

El modelo ofrece dos voces inventadas, F3 (femenina) y M1 (masculina), diseñadas mediante descripciones textuales con Qwen3-TTS VoiceDesign y clonadas con Sopro para dotarlas de acento portugués. La entrada es texto que se convierte a fonemas mediante la herramienta pronuncia-pt 0.2.0, y la salida es audio mono a 24 kHz. Su relevancia radica en su extrema eficiencia: funciona aproximadamente 150 veces más rápido que el tiempo real en cuatro hilos de CPU (Apple M4 Pro), lo que lo hace apto para despliegues en hardware muy limitado.

No emplea pesos preentrenados de otros modelos: el entrenamiento fue desde cero sobre un conjunto de datos propio derivado de Common Voice Portuguese (CC0) y sintetizado con Sopro. La licencia Apache-2.0 facilita su integración en productos comerciales, aunque con las cautelas propias de un modelo entrenado sobre voz sintética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS completo con generador de forma de onda; receta de tiny-voca) |
| Parametros totales | 4.532.875 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float32; no se documentan cuantizaciones) |
| Idiomas soportados | Portugues europeo (pt-PT) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt, float32, step 120.000) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura y receta de tiny-voca, un sistema TTS de dos voces con 4,5M de parámetros que integra el generador de forma de onda en el propio modelo. La entrada de texto se convierte a fonemas con pronuncia-pt 0.2.0 (incluida en el repositorio de código), y la salida es audio mono a 24 kHz. No se especifica en la información disponible el tipo exacto de bloque (transformer, convolucional o híbrido) que compone la red.

El entrenamiento se realizó desde cero en un Mac mini M4 Pro con 64 GB y PyTorch MPS. Los datos de texto provienen de 13.582 frases de Common Voice Portuguese (CC0), filtradas para conservar formas propias de Portugal y descartar variantes brasileñas, con longitud de cinco a veinte palabras. Las voces F3 y M1 se diseñaron a partir de descripciones textuales con Qwen3-TTS VoiceDesign y se sintetizaron con Sopro (samuel-vitorino/sopro-v2-turbo), generando 27.163 clips (22,8 horas); se rechazó un clip. El split es por frase: 26.643 de entrenamiento, 236 de validación y 284 de prueba. El proceso constó de dos etapas: v1 desde cero con entrenamiento adversario a partir del paso 8.000 (104.000 pasos, 52,6 h) y v2 con ajuste fino tras medir la apertura/cierre de las vocales tónicas *e*/*o* en 514 palabras (+16.000 pasos, 8,1 h), totalizando 120.000 pasos y 60,7 horas. En validación (paso 120.000): error de tono de 1,03 semitonos, precisión de sonoridad del 95,5 % y precisión de pausas del 92,0 %.

## Capacidades

- Síntesis de voz a partir de texto en portugués europeo, con salida mono a 24 kHz.
- Dos voces predefinidas: F3 (femenina) y M1 (masculina), con acento de Lisboa.
- Conversión de texto a fonemas mediante reglas (pronuncia-pt 0.2.0).
- Inferencia ultraligera: ~150 veces más rápida que tiempo real en cuatro hilos de CPU (Apple M4 Pro).
- No soporta clonación de voz ni voces adicionales.
- No dispone de tool calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento.
- Capacidad multilingüe limitada al portugués europeo; no se documenta soporte de otros idiomas.

## Casos de uso

- Lectura de textos largos en portugués europeo en dispositivos de bajos recursos: el modelo cabe en CPU y genera audio a 24 kHz sin GPU, adecuado para lectores de pantalla o aplicaciones de accesibilidad en hardware embebido.
- Generación de avisos y notificaciones por voz en aplicaciones móviles o de escritorio: la velocidad de ~150x tiempo real permite sintetizar frases cortas de forma casi instantánea en el propio dispositivo.
- Prototipado de interfaces conversacionales en portugués de Portugal: permite validar flujos de voz sin depender de servicios en la nube ni de APIs externas.
- Doctrina y demostraciones de TTS de código abierto: al ser un modelo de 4,5M de parámetros entrenado desde cero, sirve como referencia educativa para estudiar pipelines TTS completos.
- Síntesis de contenido para pruebas automatizadas de sistemas de reconocimiento de voz: genera audio de referencia controlado con dos voces y textos conocidos.
- Generación de audio para aplicaciones de aprendizaje de portugués europeo: las voces inventadas y el acento lisboeta permiten crear material de escucha sin recurrir a locutores reales.
- Integración en pipelines de CI/CD para pruebas de regresión de audio: su bajo coste computacional permite ejecutar pruebas de síntesis en cada build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo TTS y no de un modelo de lenguaje. Los únicos datos de evaluación son métricas internas de validación en el paso 120.000:

| Metrica | Valor |
|---|---|
| Error de tono | 1,03 semitonos |
| Precision de sonoridad | 95,5 % |
| Precision de pausas | 92,0 % |
| Velocidad de inferencia | ~150x tiempo real en 4 hilos de CPU (Apple M4 Pro) |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en GPU; los pesos en float32 ocupan 18,2 MB, por lo que la inferencia puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no se documentan; el modelo está diseñado para CPU (PyTorch MPS en Apple Silicon).
- Cabe en cualquier GPU consumer y en CPU de gama baja; el requisito principal es memoria RAM suficiente para el runtime de PyTorch.
- Opciones de despliegue: inferencia mediante el paquete Python del repositorio de código (`python -m tiny_voca.infer`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~150 veces más rápido que tiempo real en cuatro hilos de CPU (Apple M4 Pro), según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-voca-pt-pt | 4.532.875 | pt-PT | F3, M1 | Apache-2.0 | Hugging Face + GitHub |
| tiny-voca (original) | ~4,5M (no confirmado) | Ingles | Dos voces | No disponible en la informacion | Hugging Face |
| Sopro v2 turbo | No disponible | Portugues | Clonacion | Apache-2.0 | Hugging Face |
| Qwen3-TTS VoiceDesign | No disponible | No disponible | Diseno por texto | Apache-2.0 | No disponible en la informacion |

La comparación se limita a los modelos citados en la información proporcionada; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El habla de entrenamiento es sintética, por lo que el modelo hereda el acento de Sopro y algunos de sus errores.
- La pronunciación se basa en reglas: palabras poco frecuentes, nombres extranjeros y abreviaturas pueden pronunciarse incorrectamente.
- Solo dispone de dos voces y no soporta clonación de voz.
- El modelo está limitado al portugués europeo; no se documenta soporte de otros idiomas ni de variantes del portugués.
- Riesgo de alucinación acústica: al ser un modelo generativo, puede producir artefactos o prosodia incorrecta en textos atípicos.
- El autor solicita explícitamente no utilizarlo para hacerse pasar por una persona real.
- Aunque la licencia es Apache-2.0, la naturaleza sintética de los datos de entrenamiento y el uso de modelos intermedios (Qwen3-TTS, Sopro) deben revisarse para cumplimiento en producción.
- No se documentan sesgos específicos más allá de la limitación geográfica y de acento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joserui/tiny-voca-pt-pt
- Repositorio de código: https://github.com/joseruimemory/tiny-voca-pt-pt
- Léame en portugués: https://github.com/joseruimemory/tiny-voca-pt-pt/blob/main/LEIA-ME.md
- Dataset de entrenamiento: https://huggingface.co/datasets/joserui/tiny-voca-pt-pt-data
- Modelo original tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Sopro v2 turbo: https://huggingface.co/samuel-vitorino/sopro-v2-turbo

# eulogik/polywhisper-hinglish-router

## Resumen

PolyWhisper Hinglish Router es un sistema de reconocimiento automático de voz (ASR) desarrollado por Eulogik, una empresa india especializada en inteligencia artificial de borde. El modelo aborda el problema del cambio de código (code-switching) entre hindi e inglés, fenómeno habitual en el habla coloquial de la India (Hinglish), donde los hablantes alternan entre ambos idiomas a mitad de frase. Los sistemas ASR monolingües tradicionales degradan significativamente su rendimiento en estos escenarios.

La arquitectura se basa en el encoder congelado de Whisper-Base, combinado con dos expertos LoRA (uno para inglés y otro para hindi) y un router por token de 33.000 parámetros que decide dinámicamente qué experto debe procesar cada token del decodificador. Esta versión v5 incorpora etiquetas de idioma corregidas a nivel de token y es la primera en la que el enrutamiento se aprende y se mide de forma efectiva. El modelo se entrena en aproximadamente un día en una Mac con chip Apple Silicon de 16 GB, sin necesidad de clústeres de GPU. También incluye expertos adicionales para tamil, telugu, bengalí y maratí, entrenados sobre el corpus IndicVoices-ST.

La relevancia actual radica en su enfoque de bajo coste y bajo consumo para idiomas de bajos recursos, con una licencia MIT que permite uso comercial sin restricciones. Aunque el WER absoluto es alto (58,8 %), mejora sustancialmente respecto a Whisper-Base estándar y reduce las alucinaciones en un factor de 20.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-Base (encoder congelado) + dos expertos LoRA (rank-8) en el decodificador + router per-token (MLP de 2 capas, 33K parámetros) |
| Parametros totales | No disponible (backbone Whisper-Base ~74M + adaptadores LoRA ~3M cada uno + router 33K) |
| Parametros activos | No disponible (el router selecciona un experto por token, pero ambos expertos están cargados en memoria) |
| Longitud de contexto | No disponible (hereda la ventana de Whisper-Base, típicamente 30 segundos de audio) |
| Tipos de cuantizacion | No disponible (pesos en precisión flotante estándar de PyTorch) |
| Idiomas soportados | Hindi (hi), inglés (en), tamil (ta), telugu (te), bengalí (bn), maratí (mr) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo combina un backbone Whisper-Base congelado (encoder y decodificador base) con dos adaptadores LoRA de rango 8 aplicados a las capas de atención cruzada (claves y valores) del decodificador. Cada experto LoRA tiene aproximadamente 3 millones de parámetros. Un router de 33.000 parámetros, implementado como un MLP de dos capas sobre los estados ocultos del decodificador, asigna cada token generado al experto inglés o hindi. Esta arquitectura permite que el modelo decida dinámicamente el idioma de cada token, en lugar de usar una mezcla estática.

El entrenamiento se realizó en varias etapas: primero se entrenó el experto en inglés con tokens enmascarados (3 épocas), luego el experto en hindi junto con una LoRA en el encoder (4 épocas), después el router solo para selección de idioma (2 épocas) y finalmente una adaptación conjunta del router y los expertos (2 épocas). Los datos provienen de los corpus MUCS e IndicVoices-ST, con aproximadamente 42.000 muestras de entrenamiento de Hinglish con cambio de código. Para los idiomas indios adicionales, se entrenaron expertos LoRA de rango 16 sobre ~19.000-20.000 clips de IndicVoices-ST durante 3 épocas, sin retrenar el encoder.

Una innovación destacada es el uso de normalización ortográfica y evaluación con coincidencia de escritura (script-matched scoring), que revela que Whisper-Base estándar emite texto en escritura urdu-árabe para telugu, bengalí y maratí, mientras que los expertos de PolyWhisper producen la escritura correcta (devanagari, bengalí, tamil) en la mayoría de los casos.

## Capacidades

- Reconocimiento de voz con cambio de código hindi-inglés (Hinglish) a nivel de token, con enrutamiento dinámico entre expertos lingüísticos.
- Transcripción de audio en seis idiomas: hindi, inglés, tamil, telugu, bengalí y maratí.
- Corrección de la escritura (script) para idiomas indios: evita la emisión de texto en escritura urdu-árabe para telugu, bengalí y maratí, mejorando la precisión ortográfica.
- Reducción de alucinaciones y bucles de repetición en comparación con Whisper-Base estándar (13 eventos frente a 279 en el conjunto de prueba).
- Inferencia en dispositivos de bajo consumo: funciona en CPU, Apple Silicon (MPS) y GPU con memoria limitada.
- Soporte para carga dinámica de adaptadores: se pueden añadir nuevos idiomas sin retrenar el backbone.
- Integración sencilla con la librería Transformers de Hugging Face a través del procesador de Whisper.

## Casos de uso

- Transcripción de atención al cliente en la India: el modelo puede procesar llamadas de soporte donde los agentes y clientes alternan entre hindi e inglés, generando registros textuales precisos para análisis de calidad y detección de intenciones.
- Subtitulado automático de vídeos tutoriales y contenido educativo: muchos creadores indios producen contenido en Hinglish; este modelo genera subtítulos en la escritura correcta (devanagari para hindi) sin necesidad de postprocesado manual.
- Asistentes de voz para dispositivos de bajo coste: al requerir solo ~1 GB de VRAM y ejecutarse en CPU, puede desplegarse en Raspberry Pi o móviles de gama baja para comandos de voz en idiomas indios.
- Archivado y búsqueda de reuniones corporativas: transcripción de reuniones donde se mezclan inglés e hindi, permitiendo búsqueda por palabras clave en ambos idiomas.
- Evaluación de calidad de datos de ASR: el router y los expertos pueden servir como herramienta de anotación automática para crear datasets de entrenamiento en idiomas indios de bajos recursos.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones en Hinglish para subtítulos en directo, con bajo coste de despliegue en entornos comunitarios.

## Benchmarks y rendimiento

Los resultados presentados son los declarados por el autor en la model card. Se evaluó sobre un conjunto de prueba de 3.129 utterances derivado de MUCS/IndicVoices-ST, normalizado ortográficamente.

| Sistema | WER (%) | CER (%) | FuzzyWER (%) | Alucinaciones |
|---|---|---|---|---|
| **PolyWhisper v5 (este modelo)** | **58,8** | **57,9** | **57,3** | **13** |
| Vanilla Whisper-Base | 66,6 | 67,5 | 63,3 | 279 |
| Mezcla estática 50/50 de expertos | 72,1 | 71,1 | 70,4 | 655 |

Además, la precisión del router a nivel de token es del 89,1 % (99.663 de 111.815 tokens). Para los idiomas indios, se reportan resultados en FLEURS normalizado con coincidencia de escritura:

| Idioma | Vanilla WER/CER (%) | PolyWhisper WER/CER (%) |
|---|---|---|
| Tamil (ta) | 92,0 / 41,7 | 73,9 / 25,6 |
| Telugu (te) | — | 82,7 / 32,7 |
| Bengalí (bn) | — | 84,9 / 54,3 |
| Maratí (mr) | — | 65,0 / 22,9 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo es exclusivamente de reconocimiento de voz.

## Requisitos de hardware

- Inferencia en CPU: funciona sin GPU, aunque la latencia será mayor. En un Apple Silicon con MPS se ejecuta en tiempo real o mejor.
- VRAM estimada: Whisper-Base en FP32 ocupa ~300 MB de pesos; con los adaptadores LoRA y el router, el total ronda los 400-500 MB. En FP16 se reduce a la mitad.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Jetson Nano, o iGPU). No requiere GPU de datacenter.
- Despliegue: se integra con la librería Transformers de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un modelo PyTorch estándar puede servirse con TorchServe o un endpoint FastAPI.
- Latencia: no disponible, pero al ser Whisper-Base (74M parámetros) se espera un throughput de decenas de utterances por minuto en CPU moderna.
- Entrenamiento: se realizó en una Mac con 16 GB de RAM (chip M4), lo que indica que el ajuste fino es viable en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | WER (Hinglish) | Licencia |
|---|---|---|---|---|---|
| **PolyWhisper Hinglish Router** | Whisper-Base + LoRA + router | ~80M total | 30 s audio | 58,8 % | MIT |
| Vanilla Whisper-Base | Transformer encoder-decoder | 74M | 30 s audio | 66,6 % | MIT |
| Whisper-Tiny | Transformer encoder-decoder | 39M | 30 s audio | No disponible | MIT |
| IndicWhisper (si existe) | Whisper fine-tuned | Varía | 30 s audio | No disponible | No disponible |

La comparativa se limita a Whisper-Base porque la model card no proporciona datos de otros modelos ASR para Hinglish. PolyWhisper supera a Whisper-Base en WER y reduce drásticamente las alucinaciones, a costa de una complejidad adicional mínima.

## Limitaciones y advertencias

- El WER absoluto es alto (58,8 %), lo que lo hace inadecuado para aplicaciones que requieran precisión casi perfecta; está pensado para entornos de bajos recursos o como componente de un sistema mayor.
- Solo se ha probado en habla de estilo tutorial; la robustez ante habla espontánea, superpuesta o con ruido de fondo no está verificada.
- La variación ortográfica en devanagari sigue inflando el WER, como se indica en los errores por muestra.
- No hay garantías de privacidad: los datos de entrenamiento provienen de corpus públicos, y el modelo no incluye mecanismos de anonimización.
- El router y los expertos se cargan en memoria por separado; el uso de ambos expertos simultáneamente duplica el uso de VRAM en comparación con un solo adaptador.
- La documentación no especifica la longitud máxima de audio soportada más allá de la ventana estándar de Whisper (30 segundos), por lo que para audio más largo se requerirá segmentación externa.
- La licencia MIT permite uso comercial, pero el autor no ofrece soporte técnico ni garantías de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/polywhisper-hinglish-router
- Repositorio de código (mencionado en la model card): https://github.com/eulogik/PolyWhisper
- Sitio web de Eulogik: https://eulogik.com/
- Laboratorio de investigación de Eulogik: https://eulogik.com/lab
- Paquete PyPI relacionado (Bharat-Tiny-LLM, otro proyecto de Eulogik): https://pypi.org/project/bharat-tiny-llm/

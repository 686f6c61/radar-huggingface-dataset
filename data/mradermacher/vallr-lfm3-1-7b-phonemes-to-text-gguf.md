# mradermacher/VALLR-LFM3-1.7B-phonemes-to-text-GGUF

## Resumen

VALLR-LFM3-1.7B-phonemes-to-text es un modelo de reconocimiento visual del habla (VASR, Visual Automatic Speech Recognition) o lectura de labios, publicado originalmente por MyEcoria y cuantizado a formato GGUF por mradermacher. El modelo toma como entrada una secuencia de fonemas derivada de la lectura de labios y genera el texto correspondiente, resolviendo el problema de la ambigüedad de los homofenos visuales (muchos fonemas son indistinguibles por la forma de los labios).

La arquitectura se basa en LFM3 (Liquid Foundation Model 3) con 1.728.801.600 parámetros totales, un tamaño compacto que permite su despliegue en hardware de consumo. El repositorio GGUF ofrece 12 cuantizaciones distintas, desde Q2_K (0,9 GB) hasta f16 (3,6 GB), lo que facilita su integración en entornos con recursos limitados.

Este repositorio concreto es una conversión estática de pesos a GGUF para su uso con llama.cpp y ecosistemas compatibles, no un modelo nuevo. Es relevante para quienes necesitan desplegar lectura de labios en local sin depender de infraestructura en la nube, aunque la información pública sobre el modelo base es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model 3), transformer |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia LFM3 de Liquid AI, una arquitectura transformer. La tarea específica es la conversión de secuencias de fonemas (procedentes de un módulo de lectura de labios) a texto, lo que implica un modelado de lenguaje condicionado a una representación fonética ambigua. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal del pipeline VALLR es el uso de fonemas como representación intermedia: en lugar de mapear directamente píxeles de vídeo a texto, se extraen fonemas visuales y se desambiguan mediante el modelo de lenguaje. Esta separación permite reutilizar el módulo de visión para distintos idiomas o dominios y concentrar la capacidad del LLM en resolver la ambigüedad del habla. No se han publicado detalles sobre decodificación especulativa ni atención lineal en la información disponible.

## Capacidades

- Conversión de secuencias de fonemas a texto en inglés (tarea phonemes-to-text).
- Reconocimiento visual del habla (lip-reading) dentro de un pipeline VASR.
- Modelo conversacional segun los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Lectura de labios en entornos ruidosos: el modelo recibe fonemas extraídos de vídeo y genera texto, útil en cabinas de sonido, fábricas o entornos con ruido que impide la transcripción de audio.
- Accesibilidad para personas con discapacidad auditiva: transcripción de conversaciones filmadas sin audio, integrada en aplicaciones de subtitulado en tiempo real.
- Análisis forense de vídeo: transcripción de grabaciones de vigilancia sin pista de audio, donde el modelo ayuda a reconstruir diálogos a partir de la forma de los labios.
- Interfaces humano-máquina sin micrófono: control por voz silenciosa en espacios públicos o entornos con privacidad estricta, usando la cámara como sensor de entrada.
- Investigación en VASR: el modelo sirve como componente de lenguaje en pipelines experimentales de reconocimiento visual del habla, permitiendo evaluar la desambiguación de fonemas.
- Despliegue en dispositivos de borde: gracias a las cuantizaciones de 0,9 a 1,9 GB, puede ejecutarse en portátiles y mini-PC con llama.cpp para aplicaciones de lectura de labios en local.
- Prototipado de asistentes silenciosos: integración en asistentes que interpretan la articulación labial del usuario sin necesidad de audio, útil en entornos sanitarios o de alta seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB con Q4_K_M, 1,9 GB con Q8_0 y 3,6 GB con f16 (tamaños de fichero; la VRAM real depende del contexto y del backend).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluidas tarjetas de gama baja con 4-6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python); vLLM y TGI requieren los pesos safetensors del modelo base.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| VALLR-LFM3-1.7B-phonemes-to-text (este) | 1,73 B | no disponible | phonemes-to-text / VASR | no disponible | GGUF, safetensors |
| Modelo base MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text | 1,73 B | no disponible | phonemes-to-text / VASR | no disponible | safetensors |
| Alternativas VASR publicas | no disponible | no disponible | lip-reading | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha validado su comportamiento en castellano u otros idiomas.
- Al ser una conversión de pesos, hereda cualquier sesgo del modelo base, del que no se documentan detalles.
- Riesgo de alucinación: al tratarse de un modelo de lenguaje que desambigua fonemas, puede generar texto plausible pero incorrecto cuando la señal visual es ambigua.
- La licencia no está disponible en la información proporcionada; es imprescindible verificar la licencia del modelo base antes de un uso comercial.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- El repositorio tiene 0 descargas y 1 like, lo que indica ausencia de validación por parte de la comunidad.
- Depende de un módulo externo de extracción de fonemas; el rendimiento final del pipeline no está garantizado por este repositorio.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VALLR-LFM3-1.7B-phonemes-to-text-GGUF
- Modelo base: https://huggingface.co/MyEcoria/VALLR-LFM3-1.7B-phonemes-to-text
- Página de descargas del cuantizador: https://hf.tst.eu/model#VALLR-LFM3-1.7B-phonemes-to-text-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests

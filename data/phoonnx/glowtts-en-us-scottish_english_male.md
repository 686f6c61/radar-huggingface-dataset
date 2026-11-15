# Phoonnx/glowtts-en-us-scottish_english_male

## Resumen

GlowTTS en-us-scottish_english_male es un modelo de síntesis de voz (text-to-speech) publicado por Phoonnx como una de las voces del repositorio agregado `Phoonnx/phoonnx-glowtts`. Se trata de una voz masculina de inglés escocés (identificada internamente como `en-us-scottish_english_male`) empaquetada en formato ONNX para su uso con la librería phoonnx, un runtime de TTS ligero orientado a síntesis local. El modelo deriva de la arquitectura GlowTTS, un modelo no autorregresivo de síntesis de voz basado en normalizing flows que genera espectrogramas mel a partir de texto y posteriormente los convierte en audio mediante un vocoder.

El repositorio ocupa aproximadamente 0,1 GB y contiene los pesos en formato ONNX junto con los ficheros auxiliares necesarios para la inferencia (configuración y recursos del tokenizador/fonemizador). La model card es mínima: no documenta arquitectura concreta, número de parámetros, datos de entrenamiento ni resultados de evaluación, y remite al repositorio agregado `phoonnx-glowtts` para el contexto de la familia. La licencia figura como `other` sin que se especifique el texto de la misma para esta carpeta concreta.

Su relevancia práctica es acotada pero clara: ofrece una voz escocesa masculina lista para integrarse en pipelines de TTS en local, sin dependencia de servicios en la nube, a través de la librería phoonnx. No hay métricas de descargas ni de likes (0 en ambos), lo que sugiere un uso muy limitado o reciente dentro del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow no autorregresivo, según la familia del modelo; detalles específicos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por frases; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés (variante escocesa, `en-us-scottish_english_male`); lista completa no disponible |
| Licencia | other (sin texto de licencia especificado para esta carpeta) |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia GlowTTS, un sistema de síntese de voz no autorregresivo que modela la distribución de espectrogramas mel mediante normalizing flows y emplea un mecanismo de alineamiento monotónico para determinar la duración de cada fonema. Frente a modelos autorregresivos tipo Tacotron, GlowTTS permite inferencia paralela y por tanto latencia más baja en CPU. No se dispone de información sobre el vocoder asociado, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de ajuste fino o control de prosodia.

El artefacto publicado es una exportación ONNX de la voz concreta, manteniendo las rutas de ficheros del repositorio agregado `Phoonnx/phoonnx-glowtts`. No hay documentación sobre hiperparámetros, tamaño de capas ni precisión de los pesos (fp32/fp16/int8) más allá de que el repositorio completo pesa 0,1 GB, lo que sugiere un modelo compacto. Cualquier innovación técnica adicional (decodificación especulativa, atención lineal, etc.) no está descrita.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en inglés con acento escocés masculino.
- Generación de audio local mediante la librería phoonnx, sin llamadas a servicios externos.
- Integración mediante voice id `larynx/en-us-scottish_english_male-glow_tts`.
- Empaquetado ONNX, apto para ejecución en CPU y potencialmente en entornos con aceleración según el runtime.
- No se documentan capacidades de clonación de voz, control de emoción, SSML avanzado, tool calling, agentes, razonamiento ni multimodalidad.

## Casos de uso

- Narración de audiolibros y artículos: la voz masculina escocesa permite generar locuciones de texto largo por frases, con latencia baja gracias a la inferencia paralela propia de GlowTTS.
- Asistentes de voz locales: integración en aplicaciones de escritorio o embedded que necesiten TTS sin conexión a internet ni coste por petición.
- Accesibilidad: lectura en voz alta de contenido web o documentos para usuarios con discapacidad visual, con una voz diferenciada por acento regional.
- Prototipado de productos de voz: evaluación rápida de una voz escocesa masculina en demos y pruebas de concepto antes de contratar voces comerciales.
- Contenido educativo y de divulgación: generación de material audio para cursos o podcasts internos donde se requiera una voz con acento escocés.
- Pruebas de pipelines TTS: uso como voz de referencia en benchmarks internos de latencia y calidad dentro de la librería phoonnx.
- Localización de contenido para audiencias de Escocia: sustitución de voces genéricas de inglés americano por una variante regional más cercana al público objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo pesa 0,1 GB, por lo que el modelo es muy ligero y probablemente ejecutable en CPU.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) sería sobredimensionada para este artefacto.
- ¿Cabe en GPU consumer? Sí, con holgura, dado el tamaño del repositorio; también debería caber en memoria RAM de sistemas modestos.
- Opciones de despliegue: librería phoonnx (runtime oficial); ONNX Runtime como backend genérico; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx glowtts-en-us-scottish_english_male | GlowTTS (ONNX) | no disponible | no aplica | other | Hugging Face |
| Piper (voces ONNX) | VITS / otros | no disponible | no aplica | MIT (según voces) | Hugging Face / GitHub |
| Coqui TTS (voces multi-speaker) | Tacotron2, GlowTTS, VITS | variable | no aplica | MPL 2.0 / otras | GitHub / Hugging Face |
| Larynx (voces originales) | GlowTTS, VITS | no disponible | no aplica | variable | GitHub |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card no especifica el texto de la licencia (`other`), lo que impide confirmar si el uso comercial está permitido; conviene contactar al autor antes de desplegar en producción.
- No hay información sobre sesgos de género, acento o prosodia más allá de la etiqueta de voz masculina escocesa.
- Riesgo de alucinación acotado al dominio TTS: posibles errores de pronunciación, entonación incorrecta o artefactos en palabras poco frecuentes; no se documentan evaluaciones de calidad (MOS).
- Cobertura idiomática limitada al inglés con acento escocés; no se documentan otros idiomas.
- Ausencia total de métricas de uso (0 descargas, 0 likes) y de documentación técnica, lo que reduce la fiabilidad para entornos críticos.
- No se documentan limitaciones de longitud de texto por frase ni comportamiento con entradas fuera de dominio (siglas, números, nombres propios).
- Al ser una exportación ONNX de un repositorio agregado, la reproducibilidad y el mantenimiento dependen del proyecto phoonnx y de sus actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-scottish_english_male
- Repositorio agregado de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx

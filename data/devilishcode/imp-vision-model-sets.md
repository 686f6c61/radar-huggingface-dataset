# Devilishcode/imp-vision-model-sets

## Resumen

IMP-VISION model sets es un repositorio índice publicado por Deadbug Labs (bajo la cuenta de Hugging Face `Devilishcode`) que recopila los conjuntos de modelos por defecto y verificados para sus gafas inteligentes IMP-VISION. No se trata de un modelo entrenado por el autor, sino de un catálogo curado que apunta a repositorios de terceros alojados en Hugging Face, cada uno con su licencia original y su tamaño en disco, tal y como aparecen en el selector de la aplicación antes de la descarga. El repositorio no rehostea pesos de terceros.

El sistema IMP-VISION organiza los modelos en cuatro roles funcionales: Eyes (visión), Brain (razonamiento y lenguaje), Ears (reconocimiento de voz) y Voice (síntesis de voz). El repositorio ofrece tres conjuntos preconfigurados con distintos picos de memoria RAM: Light (~1,4 GB), Balanced (~1,7 GB) y Max (~3,4 GB). El conjunto Balanced, que es el que se envía por defecto, combina SmolVLM-500M-Instruct como Eyes, Qwen2.5-1.5B-Instruct como Brain, whisper.cpp `ggml-base.en` como Ears y Piper `en_US-lessac-medium` como Voice.

La relevancia de este repositorio es acotada: no aporta un modelo nuevo ni resultados de benchmarks, sino una capa de curaduría y verificación de compatibilidad (formato y consumo de RAM) sobre un catálogo de 1.242 repositorios compatibles (219 Eyes, 867 Brain, 75 Ears, 81 Voice). Está pensado para el ecosistema de hardware abierto de Deadbug Labs y para dispositivos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio índice de modelos de terceros (no es un modelo entrenado) |
| Parametros totales | No disponible (depende del modelo referenciado en cada rol) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (llama-cpp) para Eyes y Brain; ggml para Ears; ONNX para Voice |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (repositorio índice); cada modelo referenciado conserva su licencia propia |
| Formato de pesos | GGUF, ggml y ONNX (según el rol) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni describe una arquitectura propia. Es un índice curado que define cuatro roles y asigna a cada uno modelos de terceros con formato verificado. Los modelos del conjunto Balanced son: SmolVLM-500M-Instruct-GGUF (929 MB con mmproj, Apache-2.0) para visión; Qwen2.5-1.5B-Instruct-GGUF (1.117 MB, Apache-2.0) para lenguaje; whisper.cpp `ggml-base.en` (148 MB, MIT) para reconocimiento de voz; y Piper `en_US-lessac-medium` (63 MB ONNX) para síntesis de voz.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO), ya que el autor no entrena modelos. La innovación técnica del repositorio es de ingeniería de producto: la verificación de formato y de pico de RAM de cada entrada para garantizar que el conjunto completo quepa en dispositivos móviles de gama media, y la exposición del catálogo completo (1.242 repositorios compatibles) como opciones seleccionables más allá de los conjuntos recomendados.

## Capacidades

- Selección de modelos por rol: el usuario puede asignar cualquier repositorio compatible de Hugging Face a los roles Eyes, Brain, Ears o Voice.
- Conjuntos preconfigurados con presupuesto de RAM verificado: Light (~1,4 GB), Balanced (~1,7 GB) y Max (~3,4 GB).
- Visión por computador vía SmolVLM (500M o 256M en el conjunto Light) para descripción de imágenes y comprensión visual básica.
- Razonamiento y generación de texto vía Qwen2.5-1.5B-Instruct o Llama-3.2-1B según el conjunto.
- Reconocimiento de voz en inglés vía whisper.cpp (`ggml-base.en`).
- Síntesis de voz en inglés vía Piper (`en_US-lessac-medium`).
- Catálogo ampliado de 1.242 repositorios compatibles (219 Eyes / 867 Brain / 75 Ears / 81 Voice).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada (dependería del modelo Brain elegido).

## Casos de uso

- Gafas inteligentes con asistencia visual: el rol Eyes (SmolVLM-500M) procesa la imagen de la cámara y el rol Brain (Qwen2.5-1.5B) genera una respuesta en lenguaje natural, todo dentro de un pico de ~1,7 GB de RAM.
- Asistencia por voz manos libres: la cadena Ears (whisper base.en) transcribe la voz del usuario y Voice (Piper) sintetiza la respuesta, permitiendo interacción conversacional sin pantalla.
- Despliegue en dispositivos de gama media: el conjunto Light (~1,4 GB) está pensado para teléfonos o placas con RAM limitada, usando SmolVLM-256M y Llama-3.2-1B.
- Prototipado de hardware abierto: al apoyarse en Deadbug Labs (hardware abierto), el repositorio sirve como base para construir dispositivos vestibles personalizados con modelos intercambiables.
- Configuración de dispositivos de altas prestaciones: el conjunto Max (~3,4 GB) permite elegir modelos Eyes/Brain más grandes en teléfonos con más RAM.
- Evaluación y sustitución de modelos: el catálogo de 1.242 repositorios permite al usuario probar alternativas por rol sin cambiar el firmware, útil para comparar latencia y calidad en el dispositivo.
- Accesibilidad: transcripción y síntesis de voz en inglés para personas con discapacidad visual o motriz en entornos de movilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente reporta tamaños en disco y picos de RAM de los conjuntos (Light ~1,4 GB, Balanced ~1,7 GB, Max ~3,4 GB).

## Requisitos de hardware

- RAM estimada por conjunto: Light ~1,4 GB, Balanced ~1,7 GB, Max ~3,4 GB de pico.
- Tamaño en disco de los componentes del conjunto Balanced: Eyes 929 MB (con mmproj), Brain 1.117 MB, Ears 148 MB, Voice 63 MB.
- GPU recomendadas: no disponible; el diseño está orientado a ejecución en dispositivos móviles y hardware embebido con llama-cpp.
- ¿Cabe en GPU de consumo? No disponible como dato explícito; por tamaño, los modelos del conjunto Balanced caben holgadamente en cualquier GPU de consumo, pero el objetivo del proyecto es ejecución en el dispositivo.
- Opciones de despliegue: llama-cpp (GGUF), whisper.cpp (ggml) y ONNX Runtime para Piper.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Proyecto | Tipo | Contenido | Licencia | Idiomas |
|---|---|---|---|---|
| IMP-VISION model sets (este repo) | Índice curado de modelos para gafas inteligentes | 3 conjuntos + catálogo de 1.242 repos | Apache-2.0 | en |
| SmolVLM-500M-Instruct (referenciado) | Modelo visión-lenguaje | Pesos propios | Apache-2.0 | en |
| Qwen2.5-1.5B-Instruct (referenciado) | Modelo de lenguaje | Pesos propios | Apache-2.0 | multilingüe |
| whisper.cpp base.en (referenciado) | ASR | Pesos ggml | MIT | en |

No se dispone de información sobre otros índices curados comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse directamente para inferencia; solo apunta a repositorios de terceros.
- Idiomas: el catálogo y los conjuntos por defecto están orientados exclusivamente al inglés (`en`), incluidos los componentes de voz y transcripción.
- Licencias: aunque el repositorio es Apache-2.0, cada modelo referenciado conserva su licencia (Apache-2.0, MIT, etc.); es responsabilidad del usuario verificar la licencia del modelo concreto antes de uso comercial.
- Sin benchmarks: no hay datos publicados de calidad, latencia o precisión para los conjuntos.
- Dependencia del ecosistema Deadbug Labs: los conjuntos están pensados para el selector de su aplicación; su utilidad fuera de ese hardware es limitada.
- Sin garantías de mantenimiento: el catálogo de 1.242 repositorios puede quedar desactualizado si los repositorios upstream cambian o se eliminan.
- Riesgo de alucinación y sesgos: heredados de los modelos subyacentes (SmolVLM, Qwen2.5, whisper), no documentados en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Devilishcode/imp-vision-model-sets
- Sitio de Deadbug Labs: https://deadbuglabs.github.io/
- GitHub de Deadbug Labs: https://github.com/deadbuglabs
- Hugging Face de Deadbug Labs: https://huggingface.co/Devilishcode
- Facebook de Deadbug Labs: https://www.facebook.com/profile.php?id=61591927232914
- SmolVLM-500M-Instruct-GGUF: https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF
- Qwen2.5-1.5B-Instruct-GGUF: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Piper voices: https://huggingface.co/rhasspy/piper-voices

# monokern/wobble-ears

## Resumen

Wobble Ears es un repositorio de packs de modelos Core ML derivados de LAION-CLAP, publicados por el usuario monokern para su uso dentro de la aplicación Wobble, un navegador de samples para macOS 14 o superior. No se trata de un modelo entrenado desde cero, sino de conversiones a Core ML de los checkpoints originales de LAION-CLAP, empaquetadas en cuatro variantes (Ears · Music, Describe · Music, Ears · Light y Describe · Light) que la aplicación descarga opcionalmente desde sus ajustes para habilitar funciones de búsqueda y clasificación de audio.

El modelo subyacente, LAION-CLAP, es un modelo contrastivo audio-texto presentado por Wu et al. en ICASSP 2023, que proyecta audio y texto a un espacio latente compartido de 512 dimensiones. En este repositorio, ese espacio se emplea para tareas de similitud entre sonidos, asignación de categorías, coloreado y generación de mapas, así como para búsqueda de samples mediante descripciones textuales. Los packs tienen tamaños de 28, 68 y 125 MB, lo que refleja variantes ligeras y completas del codificador.

La relevancia de esta ficha es limitada fuera del ecosistema Wobble: el repositorio no documenta parámetros totales, contexto, idiomas ni resultados de benchmarks, y su licencia CC0-1.0 se aplica a los pesos heredados de LAION-CLAP, mientras que los datasets de entrenamiento originales mantienen sus propios términos. Es, por tanto, un artefacto de despliegue orientado a una aplicación concreta, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LAION-CLAP (contrastivo audio-texto, codificador de audio + codificador de texto) convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio: primeros 10 s con repeat-padding) |
| Tipos de cuantizacion | no disponible; se distribuyen variantes "Music" y "Light" con distinto tamaño (28, 68 y 125 MB) |
| Idiomas soportados | no disponible |
| Licencia | cc0-1.0 (pesos LAION-CLAP); tokenizer RoBERTa-base MIT en los packs Describe |
| Formato de pesos | Core ML (packs dentro de `packs/<id>/<version>/`, con `manifest.json` que incluye SHA-256) |

## Arquitectura y entrenamiento

Los packs son conversiones a Core ML de los checkpoints originales de LAION-CLAP, un modelo de preentrenamiento contrastivo lenguaje-audio con fusión de características y aumento keyword-to-caption, descrito por Wu et al. en ICASSP 2023. La arquitectura combina un codificador de audio y un codificador de texto que se alinean en un espacio de embedding compartido de 512 dimensiones, con vectores normalizados L2. Los packs Describe incluyen además ficheros de tokenizer de RoBERTa-base.

El repositorio no documenta el proceso de conversión, el número de parámetros, ni detalles sobre el entrenamiento original más allá de la referencia al paper y a los datasets LAION-Audio-630K y AudioSet, que conservan sus propios términos de uso. La única información técnica propia del autor es el front end de log-mel requerido: audio mono a 48 kHz, primeros 10 segundos con repeat-padding, STFT Hann de 1024 con hop 480, 64 bandas mel entre 50 y 14.000 Hz y escala 10·log10. Los vectores de las variantes Music y Light no son comparables entre sí.

## Capacidades

- Generación de embeddings de audio de 512 dimensiones, normalizados L2, para similitud entre sonidos.
- Búsqueda de samples mediante descripción textual (packs Describe), gracias al espacio contrastivo audio-texto.
- Asignación de categorías a sonidos (packs Ears).
- Coloreado y generación de mapas de similitud sobre la biblioteca de samples (packs Ears).
- Función "sniff" para encontrar sonidos y palabras de escena similares.
- Variante Light con la mitad de tamaño y el doble de velocidad, ligeramente mejor en categorías.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto libre: es un modelo de representación, no un LLM.
- No se documentan capacidades multilingües ni modos de pensamiento.

## Casos de uso

- Búsqueda semántica de samples en Wobble: el pack Describe permite escribir una descripción textual y recuperar sonidos del espacio latente compartido, adecuado porque el modelo fue entrenado de forma contrastiva audio-texto.
- Organización automática de bibliotecas de sonido: el pack Ears asigna categorías a cada sample, lo que facilita el etiquetado masivo de colecciones grandes sin intervención manual.
- Detección de sonidos similares: mediante la similitud coseno entre embeddings de 512 dimensiones, se pueden agrupar samples parecidos o sugerir alternativas al usuario.
- Generación de mapas visuales de la biblioteca: los embeddings permiten proyectar los sonidos en un espacio 2D para explorar la colección por proximidad tímbrica.
- Coloreado de samples: la función de color de los packs Ears puede usarse para codificar visualmente familias de sonidos dentro de la interfaz.
- Despliegue local en macOS: al ser Core ML, la inferencia se ejecuta en el dispositivo sin conexión, lo que encaja en aplicaciones de escritorio con requisitos de privacidad y latencia baja.
- Prototipado rápido de funciones de audio en apps macOS 14+: los packs se pueden descargar bajo demanda desde `manifest.json`, con verificación SHA-256, sin empaquetar los pesos en la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: entre 28 MB (Ears · Light) y 125 MB (Describe · Music y Describe · Light) por pack; el repositorio completo ocupa 0,3 GB.
- VRAM: no aplica en el sentido de GPU dedicada; la inferencia se ejecuta mediante Core ML, que puede usar CPU, GPU o Neural Engine del Mac.
- GPU recomendadas: no se especifican; el requisito documentado es macOS 14 o superior.
- Compatibilidad con GPU de consumo: no disponible; el despliegue está pensado para hardware Apple.
- Opciones de despliegue: Core ML dentro de la aplicación Wobble; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica únicamente que la variante Light es "el doble de rápida" que la Music, sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Wobble Ears (este) | CLAP convertido a Core ML | no disponible | audio de 10 s | CC0-1.0 (pesos) | Core ML |
| LAION-CLAP original | CLAP | no disponible en la informacion | audio de 10 s | CC0-1.0 | PyTorch |
| Otros modelos audio-texto comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no documenta parámetros, contexto, idiomas ni benchmarks, lo que impide evaluar su calidad de forma independiente.
- Los vectores de las variantes Music y Light no son comparables entre sí; mezclarlos invalida cualquier búsqueda o cálculo de similitud.
- Requiere el front end log-mel exacto de la aplicación (48 kHz, 10 s, STFT 1024/hop 480, 64 bandas mel); usar otro preprocesado degrada los embeddings.
- Solo funciona en macOS 14 o superior mediante Core ML; no hay builds para otras plataformas.
- La licencia CC0-1.0 cubre los pesos de LAION-CLAP, pero los datasets de entrenamiento (LAION-Audio-630K, AudioSet) tienen sus propios términos que pueden afectar a usos comerciales.
- Los packs Describe incluyen tokenizer de RoBERTa-base bajo licencia MIT, con aviso dentro de cada pack.
- Riesgo de sesgos y alucinaciones inherente al modelo base LAION-CLAP, no evaluado en este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/monokern/wobble-ears
- LAION-CLAP (GitHub): https://github.com/LAION-AI/CLAP
- Paper de referencia: Wu et al., "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation", ICASSP 2023 (enlace no disponible en la informacion proporcionada)

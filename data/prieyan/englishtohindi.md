# Prieyan/EnglishToHindi

## Resumen

Prieyan/EnglishToHindi es un pequeño modelo de traducción automática neuronal (SLM, por sus siglas en inglés) que traduce frases del inglés al hindi. Lo desarrolla el autor Prieyan y está publicado en HuggingFace. Se trata de un transformer encoder-decoder clásico, basado en la arquitectura "Attention Is All You Need", entrenado desde cero —sin pesos preentrenados— sobre un corpus paralelo de aproximadamente 2.000 frases inglés-hindi. El modelo tiene 6,55 millones de parámetros, una longitud de contexto máxima de 64 tokens y un vocabulario BPE compartido de 4.000 subpalabras.

Su relevancia es principalmente didáctica y experimental: el autor implementa desde cero el tokenizador, el modelo, el entrenamiento y las métricas (BLEU y chrF) sin depender de frameworks de alto nivel. No se publican pesos del modelo en el repositorio, solo el código fuente y las instrucciones para entrenarlo. Los resultados de traducción son bajos (BLEU de 6,90 en beam search), algo que el propio autor reconoce abiertamente como consecuencia del corpus extremadamente reducido. Aun así, el proyecto resulta útil como referencia de implementación limpia de un transformer encoder-decoder para fines educativos o de prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (vanilla, sin pesos preentrenados) |
| Parametros totales | 6,55 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens (maxima secuencia de entrada y salida) |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos cuantizados) |
| Idiomas soportados | Ingles (origen) y hindi (destino) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio solo contiene codigo fuente, no pesos entrenados) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer encoder-decoder original de Vaswani et al. (2017). El encoder tiene 3 capas, el decoder otras 3 capas (con self-attention y cross-attention). La dimension oculta es 256, con 4 cabezas de atencion, y la FFN tiene 1024 unidades con activacion ReLU. Se emplea pre-normalizacion con LayerNorm, embeddings atados entre encoder, decoder y cabeza de salida, y posiciones sinusoidales fijas. El vocabulario es un BPE a nivel de byte de 4.000 tokens, compartido entre ambos idiomas. La decodificacion admite greedy y beam search.

El entrenamiento se realiza sobre un corpus paralelo de 1.797 pares de entrenamiento (tras dividir el total de ~2.000 frases en train/val/test). El autor no especifica el numero exacto de pasos, pero indica que la perdida de validacion alcanza su minimo alrededor del paso 1.200 y luego aumenta mientras la perdida de entrenamiento sigue bajando, lo que evidencia un claro sobreajuste. Se aplican dropout 0.2, label smoothing y atado de embeddings como tecnicas de regularizacion. No se menciona el uso de RLHF ni DPO; el entrenamiento es de modelado de lenguaje supervisado estandar (teacher forcing). El tiempo de entrenamiento es de unos 60 segundos en GPU y unos pocos minutos en CPU.

## Capacidades

- Traduccion ingles-hindi de frases cortas (hasta 64 tokens).
- Generacion de texto en hindi con decodificacion greedy o beam search.
- Deteccion de patrones basicos de la lengua hindi: forma de la oracion, particulas interrogativas y frases comunes.
- Implementacion de metricas BLEU y chrF desde cero, incluyendo soporte para multiples referencias por oracion.
- Interfaz de linea de comandos para preparar datos, entrenar, traducir y ejecutar benchmarks.
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso; es un modelo de traduccion puro.

## Casos de uso

- Material didactico para aprender a implementar un transformer encoder-decoder: el codigo esta comentado y organizado en modulos claros (modelo, tokenizador, entrenamiento, metricas), ideal para estudiar cada componente.
- Prototipo de sistema de traduccion para un dominio muy restringido: si el corpus de entrenamiento se ampliara con datos especificos de un sector (por ejemplo, frases de atencion al cliente), el modelo podria servir como base para un servicio limitado.
- Evaluacion de tecnicas de regularizacion en modelos pequenos: al ser tan compacto y rapido de entrenar, permite experimentar con dropout, label smoothing, atado de embeddings y distintos tamaños de vocabulario.
- Comparacion de estrategias de decodificacion: el benchmark integrado permite medir BLEU, chrF y velocidad entre greedy y distintos anchos de beam, util para estudiar el compromiso calidad-latencia.
- Practica de implementacion de tokenizadores BPE: el tokenizador compartido esta escrito desde cero y puede servir de referencia para otros proyectos.
- Generacion de subtitulos o frases cortas en hindi para contenido educativo, siempre que se acepte una calidad de traduccion baja y se supervise el resultado.

## Benchmarks y rendimiento

El autor publica resultados sobre un conjunto de prueba de 90 frases fuente, evaluando contra todas las referencias disponibles en el corpus. Los valores son los siguientes:

| Metrica | Greedy | Beam (4) |
|---|---|---|
| BLEU | 5,38 | 6,90 |
| chrF | 24,86 | 25,55 |
| Exact match | 1,1% | 1,1% |
| Velocidad | 59,3 frases/s | 25,7 frases/s |

Ademas, en modo teacher-forced sobre el mismo conjunto, se obtienen: perdida 2,55, perplejidad 12,84, precision top-1 del 51,2% y top-5 del 74,7%. No se aportan comparaciones con otros modelos de traduccion ingles-hindi, y los numeros son bajos, como reconoce el propio autor. No hay datos de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 6,55 millones de parametros; en float32 ocupa aproximadamente 26 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM e incluso en CPU sin problemas.
- Entrenamiento: unos 60 segundos en una GPU moderna (por ejemplo, una RTX 3090 o superior) y unos minutos en CPU con 4 hilos.
- Inferencia: extremadamente rapida; el benchmark muestra 59,3 frases por segundo en greedy y 25,7 en beam search (hardware no especificado, probablemente CPU o GPU basica).
- No se distribuyen pesos preentrenados, por lo que para usar el modelo hay que entrenarlo primero con el codigo proporcionado.
- Opciones de despliegue: el repositorio incluye una CLI (`main.py translate`) y una API de inferencia en `slm/translate.py`. No hay soporte para vLLM, TGI, llama.cpp ni Ollama, dado que no se publican pesos en formatos estandar (safetensors, GGUF). Se podria integrar en una aplicacion Python mediante la carga del checkpoint `best_model.pt` tras el entrenamiento.

## Comparativa con modelos similares

No se dispone de modelos comparables en el mismo rango de tamaño (6,55 M de parametros) para traduccion ingles-hindi con licencia y datos publicos. Existen modelos mucho mayores como Pragyan.ai (3.000 millones de parametros, multilingue, enfocado en lenguas indias) o servicios comerciales de traduccion, pero no son comparables por tamano ni por arquitectura. En consecuencia, no se puede establecer una comparativa directa con datos objetivos.

## Limitaciones y advertencias

- Calidad de traduccion muy baja: BLEU de 6,90 en beam search, con errores frecuentes de vocabulario y morfologia.
- Sobreajuste severo: el corpus de entrenamiento es de solo 1.797 pares, insuficiente para generalizar.
- Longitud de contexto limitada a 64 tokens, lo que impide traducir textos largos o parrafos.
- El modelo inventa palabras y frases que no aparecen en el corpus de referencia, como se muestra en los ejemplos de la model card.
- No se publican pesos entrenados; el repositorio solo contiene codigo fuente, por lo que el usuario debe entrenar el modelo por su cuenta.
- La licencia no esta especificada, lo que genera incertidumbre sobre el uso comercial del codigo y de los datos.
- No hay soporte para otros idiomas ni para tareas distintas de la traduccion.
- El corpus de datos no se incluye en el repositorio (se referencia `data/translation.csv`), por lo que el usuario debe obtenerlo por separado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Prieyan/EnglishToHindi

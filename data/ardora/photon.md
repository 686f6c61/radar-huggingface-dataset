# ardora/photon

## Resumen

Photon v1.0 es un micro modelo de lenguaje desarrollado por Ardora AI como material didáctico para el artículo «Cómo funciona un LLM, letra a letra». Se trata de un GPT de 17.604 parámetros, con una sola capa, dimensión 32 y una ventana de contexto de 82 posiciones, entrenado desde cero en NumPy puro con retropropagación escrita a mano. Su propósito no es servir como asistente, sino permitir estudiar y experimentar con el funcionamiento interno de un transformer a pequeña escala.

El modelo emplea tokenización a nivel de carácter con un vocabulario de 36 tokens (33 caracteres más los especiales `<bos>`, `<eos>` y `<pad>`) y fue entrenado sobre 636 frases en español construidas a partir de cinco plantillas de saludo, cortesía y despedida. Genera exclusivamente secuencias con la forma «saludo. cortesía. despedida.», como «hola. ¿cómo estás? hasta luego.».

Su relevancia es fundamentalmente educativa: al publicar los pesos, el código de entrenamiento, el corpus y una comprobación de gradiente, permite reproducir el entrenamiento completo en unos 9 minutos sin GPU. No está pensado para producción ni para ajuste fino como base de un modelo útil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT con pre-LN, una capa, atención causal de 4 cabezas, MLP con GELU |
| Parametros totales | 17.604 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 82 posiciones |
| Tipos de cuantizacion | Los pesos publicados están en float32; el modelo del laboratorio se almacena en int8 por tensor y se convirtió a float32 para su publicación |
| Idiomas soportados | Español |
| Licencia | MIT |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

Photon es un transformer decoder-only de tipo GPT con normalización previa (pre-LN), una única capa, dimensión de modelo 32, atención causal con 4 cabezas y una MLP con activación GELU. La capa de salida incorpora un sesgo que `GPT2LMHeadModel` no admite, motivo por el que el repositorio no incluye una integración con `transformers`. La tokenización es a nivel de carácter, sin BPE, con un vocabulario de 36 tokens.

El entrenamiento se realizó en NumPy puro, con retropropagación implementada manualmente, durante 1.200 pasos con lotes de 32 y optimizador AdamW, sobre un corpus de 636 frases en español generadas a partir de cinco plantillas. El código de entrenamiento, el corpus y la comprobación de gradiente están incluidos en el directorio `entrenamiento/`. Según los autores, el entrenamiento tardó unos 9 minutos sin GPU. Los pesos publicados proceden del modelo del laboratorio (almacenado en int8 y convertido a float32) y son idénticos a los que usa el artículo; un entrenamiento nuevo puede producir parámetros ligeramente distintos, ya que no se ha verificado la reproducibilidad exacta entre plataformas.

## Capacidades

- Generación de texto limitada a saludos con la estructura «saludo. cortesía. despedida.».
- Distribución de probabilidad del siguiente carácter mediante el método `probabilidades`.
- Generación con control de temperatura y semilla.
- Inferencia en NumPy puro, sin dependencia de PyTorch ni de `transformers`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo español y solo con los 33 caracteres del vocabulario.
- No dispone de modo de razonamiento (thinking), visión ni audio.

## Casos de uso

- Docencia de fundamentos de LLM: el modelo permite recorrer el forward completo en unas pocas decenas de líneas de código (`photon.py`) para explicar atención, normalización y MLP en un aula o taller.
- Laboratorio interactivo en el navegador: los parámetros publicados son exactamente los que usa el laboratorio del artículo, de modo que sirven para replicar localmente las demostraciones.
- Estudio de tokenización a nivel de carácter: con 36 tokens y un mapeo directo carácter-token, se puede analizar cómo afecta el vocabulario a la generación sin la complejidad de un tokenizador BPE.
- Reproducción de un pipeline de entrenamiento completo: el directorio `entrenamiento/` incluye corpus, código y comprobación de gradiente, lo que permite repetir el entrenamiento en minutos y comparar resultados.
- Experimentos de evaluación de diversidad: el conjunto de métricas publicado (copias exactas, frases nuevas, gramaticalidad) sirve como ejercicio práctico sobre cómo medir memorización y novedad en modelos generativos.
- Prueba de infraestructura de inferencia en CPU: al requerir solo NumPy y safetensors, es útil para validar entornos de despliegue ligeros sin dependencias de CUDA.

## Benchmarks y rendimiento

Los autores publican métricas de evaluación sobre 204 frases de validación y 300 muestras generadas a temperatura 0,85:

| Metrica | Valor |
|---|---|
| Pérdida en validación | 0,1853 |
| Perplejidad en validación | 1,2 |
| Muestras gramaticales | 285 de 300 |
| Copias exactas de frases de entrenamiento | 238 de 300 |
| Frases nuevas (no presentes en entrenamiento) | 62 de 300 |
| Frases nuevas y gramaticales | 47 de 300 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los propios autores advierten que la mayoría de las generaciones son copias del corpus de entrenamiento, dado que el espacio de frases es de solo 840 y 636 están en el conjunto de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo ocupa unos pocos kilobytes en float32 y la inferencia se ejecuta en CPU.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU con NumPy.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: inferencia directa con NumPy y safetensors mediante `photon.py`; no hay integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento completo tardó unos 9 minutos en CPU según los autores.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Photon es un modelo didáctico de 17.604 parámetros con tokenización a nivel de carácter y un corpus cerrado de 636 frases; no existe en la información disponible una comparativa con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Photon v1.0 | 17.604 | 82 | MIT | Hugging Face (ardora/photon) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo estrictamente didáctico: no es una base para ajustar un modelo útil ni para uso en producción.
- El vocabulario se limita a 33 caracteres; cualquier otro carácter provoca un error en `codificar`.
- No responde preguntas, no sigue instrucciones y no tiene conocimiento del mundo.
- Elevado riesgo de memorización: 238 de 300 muestras son copias exactas de frases de entrenamiento.
- La etiqueta «gramatical» en la evaluación es una comprobación mecánica contra cinco plantillas, no un juicio de calidad.
- Con una sola capa y un corpus tan cerrado, las conclusiones sobre «cómo aprende un LLM» son cualitativas y no extrapolan a modelos grandes.
- No se ha verificado la reproducibilidad exacta de los parámetros entre plataformas.
- No se han documentado sesgos específicos más allá de las limitaciones del corpus; la licencia MIT permite uso comercial, pero el modelo no ofrece ninguna utilidad práctica en ese contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ardora/photon
- Artículo asociado «Cómo funciona un LLM, letra a letra»: https://ardoratech.ai
- Dataset de entrenamiento: https://huggingface.co/datasets/ardora/photon-corpus

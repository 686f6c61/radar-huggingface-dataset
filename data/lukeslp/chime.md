# lukeslp/chime

## Resumen

Chime 1.2 es un modelo de lenguaje a nivel de palabra desarrollado por Luke Steuber para predicción de la siguiente palabra y autocompletado en teclados móviles. Se trata de un modelo extremadamente compacto (2.025.114 parámetros) que se ejecuta íntegramente en el dispositivo, sin conexión a red, y que la aplicación LocalType para Android incorpora desde la versión 0.5.56. No es un modelo de chat ni de generación libre de texto: su función es ordenar candidatos en la franja de sugerencias del teclado.

La arquitectura sigue el diseño publicado por Google para el modelo de predicción de Gboard (Hard et al., 2018): una única capa CIFG-LSTM de 670 unidades proyectada a 96 dimensiones, con embeddings de entrada y salida compartidos. El vocabulario es de 16.384 tokens (16.054 palabras, 293 emoji, 31 signos de puntuación y 6 tokens especiales) y el contexto abarca la frase en curso hasta 63 tokens. El modelo int8 ocupa un fichero de 2,2 MB y la inferencia solo requiere NumPy.

Esta versión de noviembre de 2026 es un reentrenamiento que mantiene la forma y el tamaño de Chime 1.1 (Chime-SMS-2M) y añade 1.340.659 frases en inglés de Tatoeba al corpus de entrenamiento. Según el autor, supera a la versión de octubre en ambas particiones de evaluación reservadas, con una mejora de +0,42 y +0,60 puntos en precisión top-3 de siguiente palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CIFG-LSTM de una capa (670 unidades, proyección a 96 dimensiones), embeddings de entrada y salida compartidos |
| Parametros totales | 2.025.114 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 63 tokens (la frase en curso) |
| Tipos de cuantizacion | float32 (safetensors) e int8 (cifg_int8.bin) |
| Idiomas soportados | inglés |
| Licencia | CC BY-SA 4.0 para los pesos, Apache-2.0 para el código |
| Formato de pesos | safetensors (float32) y binario int8 propio (cifg_int8.bin) |
| Vocabulario | 16.384 tokens: 16.054 palabras, 293 emoji, 31 signos de puntuación, 6 especiales |
| Libreria de inferencia | NumPy |
| Tamano del modelo int8 | 2,2 MB |

## Arquitectura y entrenamiento

El modelo es un transformer no: se trata de una red recurrente con una sola capa CIFG-LSTM (coupled input-forget gate LSTM) de 670 unidades, cuya salida se proyecta a 96 dimensiones y se comparte con la matriz de embeddings de entrada y salida. Esta elección replica el diseño del modelo de siguiente palabra publicado por Google para Gboard, optimizado para latencia mínima y huella de memoria reducida en dispositivos móviles. La predicción es a nivel de palabra, no de subpalabra.

Los datos de entrenamiento combinan varias fuentes: AllenAI SODA, OpenAssistant OASST2, Taskmaster-1 y Taskmaster-3, además de 1.340.659 frases en inglés de Tatoeba añadidas en esta versión 1.2. No se especifica el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; dado el tamaño y el propósito del modelo, es improbable que se hayan aplicado. El autor indica que la receta de entrenamiento se mantiene respecto a 1.1 y que solo cambia el texto de entrenamiento. La exportación a int8 elevó la perplejidad de 13,365268 a 13,371474 (+0,046%) sobre 5.000 líneas de desarrollo.

## Capacidades

- Predicción de la siguiente palabra tras un espacio, devolviendo un ranking de candidatos.
- Autocompletado de la palabra que se está escribiendo cuando no hay espacio final.
- Ranking de hasta k candidatos (por ejemplo, k=6) mediante `LocalTypeModel().predict("see you ", k=6)`.
- Inferencia totalmente offline, sin dependencias de red, solo con NumPy.
- Ejecución en dispositivo con pesos fijos; el aprendizaje personalizado de palabras lo gestiona la aplicación LocalType por separado.
- Soporte de vocabulario con emoji y signos de puntuación integrados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No corrige faltas de ortografía.
- No es un modelo de chat ni de generación libre de texto.

## Casos de uso

- Teclados móviles Android: integración en la franja de sugerencias para ofrecer la siguiente palabra o completar la palabra en curso con latencia de milisegundos, gracias a su tamaño de 2,2 MB en int8 y a la inferencia solo con NumPy.
- Predicción de siguiente palabra en aplicaciones de mensajería: el modelo ordena candidatos tras cada pulsación, lo que permite a la aplicación mostrar hasta tres sugerencias con una precisión top-3 medida de en torno al 24-25% en texto reservado.
- Autocompletado en campos de texto de formularios o chats de soporte: al no requerir red, puede desplegarse en entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Demos y prototipos en navegador: el autor ofrece una demo web que reproduce los 120 contextos de referencia y sus rankings top-10, útil para validar la exportación int8 antes de integrarla.
- Investigación sobre modelos de lenguaje ultracompactos: sirve como referencia reproducible de una arquitectura CIFG-LSTM con embeddings compartidos y cuantización int8 para estudiar el equilibrio entre perplejidad y tamaño.
- Evaluación de técnicas de cuantización en dispositivos: el paquete incluye comprobaciones numéricas que comparan la salida float32 con la int8 en contextos de referencia, lo que facilita auditar el impacto de la cuantización en un pipeline real.
- Aplicaciones de accesibilidad: la predicción de palabra reduce pulsaciones en usuarios con dificultades motoras, aunque el ahorro real de pulsaciones en uso cotidiano no se ha medido según el autor.

## Benchmarks y rendimiento

El autor publica métricas de precisión top-3 de siguiente palabra (sin aprendizaje personalizado) sobre dos conjuntos reservados y dos conjuntos de desarrollo. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Conjunto | Frases | Palabras evaluadas | Chime 1.1 | Chime 1.2 | Diferencia (IC 95%) |
|---|---:|---:|---:|---:|---|
| Mensajes propios del autor (reservado) | 54.819 | 606.305 | 23,61% | 24,03% | +0,42 (+0,35 a +0,49) |
| Frases de foro y blog escritas en móvil (reservado) | 19.630 | 220.476 | 24,50% | 25,10% | +0,60 (+0,48 a +0,72) |
| NUS SMS (desarrollo) | 463 | no disponible | 19,32% | 19,28% | −0,04 (−0,77 a +0,66) |
| Taskmaster-1 (desarrollo) | 567 | no disponible | 42,34% | 42,43% | +0,09 (−0,62 a +0,87) |

El ahorro potencial de pulsaciones aumentó 0,32 puntos (+0,29 a +0,36) en el primer conjunto y 0,50 (+0,44 a +0,55) en el segundo. La perplejidad int8 es de 13,371474 frente a 13,365268 en float32 sobre 5.000 líneas de desarrollo. El autor indica que no ha medido tiempos en teléfono para este fichero, pero que Chime 1.1 midió 3,09 ms en Pixel 9a y 3,24 ms en Pixel 10, y que el tiempo int8 no depende de los valores de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el modelo int8 ocupa 2,2 MB y el float32 unos pocos megabytes, por lo que cabe en memoria de cualquier dispositivo.
- GPU recomendadas: no requiere GPU; la inferencia con NumPy se ejecuta en CPU.
- Cabe en cualquier GPU de consumo y en teléfonos móviles; el autor reporta ejecución en Pixel 9a y Pixel 10.
- Opciones de despliegue: script `inference.py` incluido con NumPy; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y por el formato binario propio y la arquitectura LSTM no son aplicables de forma directa.
- Latencia: 3,09 ms en Pixel 9a y 3,24 ms en Pixel 10 para Chime 1.1, con la misma forma y tamaño de fichero que 1.2; el autor no ha cronometrado 1.2 en teléfono.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chime 1.2 | 2.025.114 | 63 tokens | CIFG-LSTM a nivel de palabra, on-device | CC BY-SA 4.0 (pesos), Apache-2.0 (código) | Hugging Face, demo web |
| Chime 1.1 (Chime-SMS-2M) | misma forma y tamaño | 63 tokens | CIFG-LSTM a nivel de palabra, on-device | no disponible en la información | Hugging Face |
| Modelo de siguiente palabra de Gboard (Hard et al., 2018) | no disponible | no disponible | LSTM a nivel de palabra, on-device | no disponible | Publicación académica, no pesos abiertos |

No se dispone de datos de benchmarks comparables con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay capacidades multilingües.
- No es un modelo de chat ni de generación libre de texto; usarlo fuera de la predicción de siguiente palabra o autocompletado dará resultados pobres.
- No corrige faltas de ortografía.
- La mejora de 1.2 sobre 1.1 es pequeña: aproximadamente un 2% más de aciertos top-3 en términos relativos.
- El primer conjunto reservado son mensajes personales del autor, no publicados, por lo que esa fila no es reproducible por terceros.
- El segundo conjunto reservado es la porción de test del Mobile Text Dataset, sin licencia declarada, y solo se usa para puntuar.
- Ambos conjuntos reservados ya se han utilizado, por lo que no pueden volver a emplearse para evaluar otro modelo.
- El ahorro potencial de pulsaciones asume que el usuario pulsa la palabra correcta en cuanto aparece, por lo que es un techo teórico; el ahorro real en uso cotidiano no se ha medido.
- La licencia CC BY-SA 4.0 de los pesos impone compartir bajo la misma licencia las obras derivadas; conviene revisar las implicaciones para uso comercial.
- El autor no ha cronometrado esta versión en teléfono; los tiempos citados corresponden a 1.1.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de sugerencias incorrectas o poco naturales fuera de los dominios de entrenamiento (SMS, foros, blogs, asistentes).
- No se han publicado datos sobre sesgos del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukeslp/chime
- Versión anterior Chime 1.1 (Chime-SMS-2M): https://huggingface.co/lukeslp/chime-sms-2m
- Demo en navegador: https://dr.eamer.dev/chime/
- Aplicación LocalType para Android: https://dr.eamer.dev/downloads/apps/localtype/
- Paper de referencia (Hard et al., 2018): https://arxiv.org/abs/1811.03604

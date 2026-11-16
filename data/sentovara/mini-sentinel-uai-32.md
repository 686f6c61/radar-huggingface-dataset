# Sentovara/Mini-Sentinel-uAI-32

## Resumen

Mini-Sentinel µAI-32 es un clasificador neuronal mínimo escrito en C puro y distribuido por Sentovara. No es un modelo de lenguaje: es un perceptrón multicapa de una sola capa oculta (196-48-10) entrenado sobre MNIST reducido a 14×14 mediante pooling 2×2, con 9.946 parámetros en su variante de dígitos. Su relevancia no reside en el rendimiento bruto, sino en la restricción de ingeniería autoimpuesta: el ejecutable x86-64 Linux (9.188 bytes) y el fichero de pesos (21.468 bytes) suman 30.656 bytes, por debajo del límite de 32.768 bytes (32 KB).

El proyecto se presenta como una demostración de viabilidad de entrenamiento e inferencia en un espacio de tamaño extremadamente reducido, con artefactos auditados, sumas de verificación SHA-256, comprobaciones con sanitizers y una implementación independiente en NumPy (`refcheck.py`) que valida la inferencia y un paso de entrenamiento. Incluye además tres modelos auxiliares de juguete (espirales, anillos, iris) y una demo en navegador con un forward pass en JavaScript que reproduce las mismas respuestas que el binario C.

La ficha se elabora a partir exclusivamente de la información publicada en Hugging Face y en la model card; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con una capa oculta ReLU y salida softmax; entrenamiento por SGD |
| Parametros totales | 9.946 (modelo MNIST 196-48-10) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de secuencia) |
| Tipos de cuantizacion | Pesos almacenados en bfloat16; no se documentan otros formatos de cuantización |
| Idiomas soportados | No disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (código); aviso de datos Iris en `THIRD_PARTY_NOTICES.md` |
| Formato de pesos | Binario propio little-endian: `u16` magic `0xA132`, `u16` inputs/hidden/outputs, `float32` media y escala por entrada, pesos en bfloat16 (última columna = sesgo) |
| Entrada | Imágenes MNIST reducidas a 14×14 (196 valores) |
| Salida | 10 clases (dígitos 0-9) con probabilidades softmax |
| Tamaño del ejecutable | 9.188 bytes (x86-64 Linux) |
| Tamaño del modelo MNIST | 21.468 bytes |
| Tamaño combinado | 30.656 bytes (límite: 32.768 bytes) |
| Fuente | 257 líneas de C (`uai32.c`) |

## Arquitectura y entrenamiento

La arquitectura es un MLP clásico de tres capas: 196 entradas (imagen 14×14 aplanada), 48 unidades ocultas con activación ReLU y 10 salidas con softmax. El preprocesado aplica normalización por entrada mediante media y escala almacenadas en `float32` en la cabecera del fichero de pesos. El entrenamiento emplea descenso de gradiente estocástico (SGD); la model card no detalla hiperparámetros, número de épocas, tasa de aprendizaje ni tamaño de lote.

Los datos de entrenamiento son MNIST estándar, reducido de 28×28 a 14×14 mediante pooling 2×2. Las imágenes no se redistribuyen en el repositorio; el script `get_mnist.py` del repositorio de GitHub permite reconstruir el conjunto en formato de texto. No se documenta el número de tokens (no aplica), la composición exacta del dataset más allá de MNIST, ni si hubo técnicas de alineación como RLHF o DPO (no aplicables a este tipo de modelo).

La innovación técnica destacable es la disciplina de tamaño: el formato de pesos usa bfloat16 para los pesos y `float32` solo para las estadísticas de normalización, y el binario se compila con optimización de tamaño (`-O2` en la compilación pública; el Makefile del repositorio contiene la compilación exacta optimizada por tamaño). El proyecto incluye una auditoría enfocada del 7 de octubre de 2026 con 28/28 comprobaciones obligatorias superadas, incluyendo reconstrucciones exactas, ejecuciones con sanitizers y un control con etiquetas barajadas (47% en espirales frente al 50% de azar).

## Capacidades

- Clasificación de dígitos manuscritos MNIST en 10 clases con probabilidades softmax.
- Entrenamiento desde cero mediante SGD sobre datos en formato de texto (14×14).
- Evaluación sobre conjuntos de test en texto (`uai32 test`).
- Predicción individual por entrada estándar (`uai32 predict`), devolviendo clase y probabilidades.
- Modelos auxiliares incluidos: espirales de dos clases (2-32-2, 348 bytes), anillos de tres clases (2-16-3, 222 bytes) e iris (4-8-3, 174 bytes).
- Inferencia en navegador mediante `uai32.js`, con paridad de resultados frente al binario C en todos los conjuntos de test.
- Verificación independiente de inferencia y de un paso de entrenamiento mediante `refcheck.py` (NumPy).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües.

## Casos de uso

- Docencia de redes neuronales: el código de 257 líneas y el formato de pesos documentado permiten explicar forward pass, softmax, ReLU y SGD con un artefacto ejecutable y auditable, sin dependencias de frameworks.
- Validación de pipelines de compilación reproducible: las sumas SHA-256, las reconstrucciones exactas y los sanitizers del repositorio sirven como caso de prueba para cadenas de integración continua que verifiquen binarios byte a byte.
- Sistemas empotrados con restricciones extremas de almacenamiento: el par ejecutable+modelo de 30.656 bytes cabe en memorias flash mínimas y no requiere bibliotecas de aprendizaje profundo, solo la libc del sistema.
- Demostraciones educativas interactivas: la demo en navegador con forward pass en JavaScript permite mostrar clasificación de dígitos en tiempo real sin backend ni GPU.
- Pruebas de regresión de inferencia: `refcheck.py` actúa como oráculo independiente en NumPy para detectar desviaciones numéricas en implementaciones propias del mismo formato.
- Referencia de formato binario compacto: el esquema little-endian con cabecera `u16` y pesos bfloat16 puede reutilizarse como especificación para serializar clasificadores pequeños en proyectos propios.
- Ejercicio de auditoría de software: el reto "Disprove us" y el control con etiquetas barajadas ofrecen un marco para practicar verificación de afirmaciones de rendimiento.

## Benchmarks y rendimiento

| Conjunto | Arquitectura | Resultado held-out |
|---|---|---|
| MNIST 14×14 (test estándar, 10.000) | 196-48-10 | 9.781/10.000 = 97,81% |
| Espirales de dos clases | 2-32-2 | 298/300 = 99,3% |
| Anillos de tres clases | 2-16-3 | 300/300 = 100% |
| Iris | 4-8-3 | 29/30 = 96,7% (una fila de test duplica una de entrenamiento) |
| Control con etiquetas barajadas (espirales) | 2-32-2 | 47% (azar: 50%) |

No se han publicado resultados comparativos con otros modelos en la información disponible. No se documentan métricas de latencia ni throughput.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU y el modelo MNIST ocupa 21.468 bytes en disco.
- GPU recomendadas: ninguna; el binario es x86-64 Linux y no usa aceleración por hardware.
- Cabe en cualquier GPU consumer, pero no la aprovecha; el requisito real es un sistema x86-64 con libc y libm (`-lm`).
- Despliegue: binario nativo (`dist/uai32`) o compilación desde fuente con `cc -O2 uai32.c -o uai32 -lm`; demo en navegador con `uai32.js`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mini-Sentinel µAI-32 | MLP en C, MNIST 14×14 | 9.946 | No aplica | 97,81% en MNIST test | Apache-2.0 | Hugging Face + GitHub |
| LeNet-5 (referencia histórica) | CNN, MNIST 32×32 | ~60.000 | No aplica | ~99% en MNIST test | Uso académico | Referencia bibliográfica |
| MLP estándar en PyTorch sobre MNIST | MLP | Variable (decenas de miles) | No aplica | ~97-98% típico | Según implementación | Frameworks |

No se dispone de comparativas publicadas por el autor frente a alternativas. Las cifras de LeNet-5 y del MLP estándar son referencias generales del dominio y no provienen de la información proporcionada; se incluyen solo como contexto cualitativo. Cualquier comparación cuantitativa directa debe considerarse no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- La cifra de tamaño cuenta únicamente el ejecutable y un fichero de modelo; excluye la libc del sistema, el sistema operativo, la RAM, los datasets y las herramientas.
- MNIST reducido a 14×14 limita la resolución efectiva; el 97,81% es inferior al de CNN sobre 28×28.
- El modelo Iris presenta una fila de test que duplica una de entrenamiento, lo que infla su resultado (96,7%).
- El control con etiquetas barajadas en espirales (47%) está por debajo del azar (50%), lo que el autor documenta como evidencia de ausencia de fuga de información, pero conviene interpretarlo con cautela.
- Las imágenes MNIST no se redistribuyen; es necesario obtenerlas por separado con `get_mnist.py`.
- Sesgos conocidos: no documentados; al entrenar solo con MNIST, la generalización fuera de ese dominio es nula.
- Riesgo de alucinación: no aplica a clasificación, pero el modelo puede asignar alta confianza a entradas fuera de distribución.
- Licencia Apache-2.0 permite uso comercial del código; el aviso de datos Iris en `THIRD_PARTY_NOTICES.md` debe revisarse antes de redistribuir ese modelo auxiliar.
- El proyecto incluye contribuciones de asistentes de IA (OpenAI GPT-5.6 Sol, Anthropic Fable 5.1, OpenAI Codex, Anthropic Claude); la auditoría de 28/28 comprobaciones es reportada por el propio autor y no verificada de forma independiente en esta ficha.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; madurez y soporte de la comunidad no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/Sentovara/Mini-Sentinel-uAI-32
- Demo en navegador: https://huggingface.co/spaces/Sentovara/Mini-Sentinel-uAI-32-demo
- Repositorio GitHub: https://github.com/jonny5isalive5/mini-sentinel-uai32-public
- Modelo hermano de gran escala (referencia del autor): https://huggingface.co/Sentovara/Sentinel-S1-32B
- Paper: no disponible
- Blog: no disponible

# sichauhan1994/contrastive-prototype

## Resumen

Contrastive-prototype es un repositorio de investigación publicado por el usuario sichauhan1994 en HuggingFace. Se trata de una implementación propia de una arquitectura MobileViT en escala "nano", orientada a tareas de aprendizaje contrastivo. No es un modelo entrenado: el autor indica explícitamente que el fichero `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo ("smoke tests") y que no se presenta como un checkpoint con benchmarks.

El modelo cuenta con 49.600 parámetros totales, lo que lo sitúa en un orden de magnitud muy inferior al MobileViT original de Apple (que parte de ~1,3 millones de parámetros en su variante XXS). El repositorio ocupa 0,0 GB e incluye el script `inference.py` como artefacto principal, junto con `config.json`, `training_args.json` y el checkpoint de inicialización en formato safetensors.

Su relevancia actual es limitada y de carácter metodológico: sirve como plantilla reproducible para experimentos de representaciones contrastivas con arquitecturas híbridas CNN-transformer ligeras, no como modelo listo para producción. La model card insiste en que cualquier resultado futuro debe documentarse por separado de los valores por defecto aquí incluidos, y que la única evaluación útil sería sobre un conjunto de validación específico de tarea, con al menos tres semillas y una línea base de capacidad equivalente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileViT (híbrida CNN-transformer) |
| Parámetros totales | 49.600 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), acompañado de `config.json` y `training_args.json` |

Detalles adicionales declarados en la model card: escala "nano", atención estándar, fusión de tipo "tensor fusion", activación GELU y normalización BatchNorm. Descargas: 0. Likes: 0. Creado el 2026-10-05, actualizado el 2026-10-05.

## Arquitectura y entrenamiento

La arquitectura es MobileViT, un diseño híbrido que combina convoluciones (para eficiencia espacial y despliegue en dispositivos móviles) con bloques de atención tipo transformer (para capturar dependencias globales). En esta implementación concreta, la model card especifica atención estándar, fusión por "tensor fusion", activación GELU y normalización BatchNorm. El script `training_args.json` registra una receta por defecto con el optimizador LAMB y un schedule de warmup constante.

No hay entrenamiento documentado. El autor afirma de forma explícita que el checkpoint incluido es una inicialización válida para pruebas de humo y no un modelo entrenado, y que no se reclama ninguna puntuación de benchmark en el repositorio. La receta LAMB + warmup constante se describe como valores de partida del script, no como evidencia de una ejecución completada. Tampoco se documentan volumen de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones, algo coherente con que el objeto declarado del repositorio sea el aprendizaje contrastivo y no la generación de texto.

Como innovación destacable, únicamente cabe señalar el propio enfoque metodológico: se trata de una implementación personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarla. No se documentan técnicas como decodificación especulativa, atención lineal ni variantes SSM.

## Capacidades

- No se documenta ninguna capacidad verificada. El repositorio no incluye evaluación funcional, ni resultados de tareas, ni métricas.
- El objetivo declarado es el aprendizaje contrastivo, es decir, aprender representaciones donde muestras similares queden próximas en el espacio de embeddings. No se especifica la modalidad (visual, multimodal u otra), aunque la arquitectura MobileViT es de visión por computador.
- Generación de texto: no disponible. No es un modelo de lenguaje.
- Razonamiento, matemáticas y código: no disponibles.
- Tool calling / function calling: no soportado (no aplica a esta arquitectura).
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidad especial (modo thinking, visión, audio): no documentada. La arquitectura de base es de visión, pero el repositorio no confirma la modalidad final ni el formato de entrada/salida.
- Punto de entrada ejecutable: `inference.py`, con ejemplo de prueba de humo en su bloque `__main__`; se puede inspeccionar con `python inference.py --help`.

## Casos de uso

Ninguno de los siguientes casos es utilizable hoy con el checkpoint publicado, porque no ha sido entrenado. Se enumeran como escenarios plausibles una vez que exista un checkpoint entrenado y evaluado sobre la misma arquitectura, que es el uso que la propia model card sugiere.

- Recuperación de imágenes por similitud (image retrieval): un encoder contrastivo ligero permite indexar un catálogo de imágenes y recuperar las más cercanas a una consulta mediante similitud de coseno en el espacio de embeddings. El atractivo de MobileViT es que el coste de extracción es bajo, apto para indexación masiva.
- Deduplicación y agrupamiento de colecciones visuales: agrupar imágenes casi idénticas mediante clustering sobre embeddings, útil para limpiar datasets de entrenamiento o catálogos de producto antes de pasarlos a un pipeline mayor.
- Clasificación few-shot con prototipos: calcular un prototipo medio por clase a partir de unas pocas muestras etiquetadas y clasificar el resto por distancia al prototipo. Es el escenario canónico del aprendizaje contrastivo y el que da nombre al repositorio.
- Búsqueda visual en el dispositivo (on-device): con decenas de miles de parámetros, el modelo podría ejecutarse en CPU de teléfono o microcontrolador para tareas de emparejamiento y verificación local, sin enviar imágenes a un servidor.
- Verificación y re-identificación: comparar dos recortes y decidir si corresponden a la misma entidad mediante un umbral sobre la distancia de embeddings, en aplicaciones de control de acceso o seguimiento.
- Línea base de investigación y ablaciones: usar el script y la configuración como punto de partida reproducible para comparar variantes de aumentación, funciones de pérdida contrastiva (InfoNCE, triplet) o presupuestos de cómputo, con la advertencia del autor de igualar exposición de datos, presupuesto de ajuste y semillas.
- Pruebas de integración en CI: el checkpoint de inicialización sirve para verificar que el pipeline de carga, preprocesado y exportación funciona extremo a extremo antes de invertir en un entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente: "No benchmark score is claimed in this repository". No se debe asumir ningún rendimiento por el nombre del modelo ni por su arquitectura.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable. Con 49.600 parámetros, los pesos en fp32 ocupan aproximadamente 198 KB; el grueso del consumo proviene del runtime de PyTorch y del tamaño del lote de entrada, no de los pesos.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA sirve, incluidas tarjetas integradas o de gama de entrada; también es viable en CPU.
- GPU de consumo: cabe con enorme holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), y también en aceleradores de borde tipo Jetson o en NPUs móviles.
- Opciones de despliegue: PyTorch como vía natural, dado que el artefacto principal es `inference.py`. La exportación a TorchScript u ONNX es plausible para despliegue en móvil, pero no está documentada en el repositorio. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores para modelos de lenguaje y esta es una arquitectura de visión con implementación personalizada.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas, y al tratarse de un checkpoint sin entrenar cualquier medición de latencia sería de la inicialización, no del modelo final.
- Nota de integración: al ser una implementación personalizada, las APIs automáticas de carga requieren un adaptador explícito antes de poder instanciar el modelo.

## Comparativa con modelos similares

Los datos de rendimiento de este repositorio no existen, por lo que la comparativa se limita a características estructurales y de licencia. Los valores de los modelos de referencia corresponden a sus especificaciones públicas conocidas.

| Modelo | Parámetros | Naturaleza | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| contrastive-prototype (sichauhan1994) | 49.600 | MobileViT nano, prototipo contrastivo | no documentada | MIT | Checkpoint de inicialización sin entrenar |
| MobileViT original (Apple) | desde ~1,3 M (XXS) | Híbrida CNN-transformer | Visión | Apple Sample Code License / MIT según variante | Pesos y código públicos, entrenados |
| MobileNetV3 | ~1,5 M (Small) a ~5,4 M (Large) | CNN pura | Visión | Apache 2.0 | Entrenados y ampliamente desplegados |
| CLIP ViT-B/32 | ~151 M | Transformer con emparejamiento imagen-texto | Visión-lenguaje | MIT (pesos OpenAI) | Entrenado, referencia en aprendizaje contrastivo |

No se dispone de comparación de rendimiento con ninguno de ellos, porque este repositorio no publica métricas. La diferencia funcional principal es que los tres alternativos están entrenados y evaluados, mientras que este es un esqueleto de investigación.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier salida que produzca es la de una inicialización aleatoria y no tiene valor predictivo.
- El autor indica que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No hay resultados de benchmarks, ni métricas de tarea, ni evaluación con múltiples semillas. Cualquier cifra que se atribuya al modelo sería inventada.
- Sesgos conocidos: no aplica en el estado actual, ya que no hay entrenamiento con datos; no se puede caracterizar sesgo alguno sobre un modelo sin entrenar. Cualquier sesgo futuro dependerá del dataset que se use, cuyos términos deben revisarse por separado.
- Riesgo de alucinación: no aplica, no es un modelo generativo de lenguaje y no se documenta ningún cabezal de generación.
- Limitaciones de contexto e idioma: no aplica; no hay ventana de contexto ni cobertura idiomática declarada.
- Restricciones de licencia: MIT, permisiva y apta para uso comercial del código y los pesos publicados. La propia model card recuerda que los términos de los datos de origen deben revisarse aparte si el repositorio se usa con datasets externos.
- Integración: al ser una implementación personalizada, no se puede cargar con APIs automáticas genéricas sin escribir un adaptador.
- Producción: no debe desplegarse en producción. Es un punto de partida experimental, y cualquier resultado derivado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto que se envían aquí.
- Madurez del repositorio: 0 descargas, 0 likes y tamaño de 0,0 GB; no hay señales de uso, mantenimiento ni validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/sichauhan1994/contrastive-prototype
- Paper o blog del autor: no disponible
- Repositorio de código adicional: no disponible
- Demo: no disponible
- Búsqueda web: no se han encontrado resultados relevantes. Las consultas devolvieron únicamente hilos de foro en francés sobre temas sin relación (gestión de cuentas en sitios de citas, metadatos de MP3, álbumes de fotos y mensajería), por lo que no se incluye ninguno como referencia.

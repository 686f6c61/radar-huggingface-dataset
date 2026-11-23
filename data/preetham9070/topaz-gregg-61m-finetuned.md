# preetham9070/topaz-gregg-61m-finetuned

## Resumen

Topaz-61M fine-tuned es un ajuste fino del modelo Topaz-61M de amongglue, un modelo de visión-lenguaje especializado en transcribir imágenes de líneas de taquigrafía Gregg Anniversary (1929) a trazos Grascii, un formato intermedio de representación de trazos. El ajuste lo ha realizado el usuario preetham9070 (PreethamReddy333) en el contexto del proyecto gregg-shorthand-ocr, con el objetivo de reducir la brecha entre la taquigrafía impresa de manual y la escritura manual real.

El modelo cuenta con 61.236.617 parámetros y se distribuye únicamente como pesos y configuración en formato safetensors para PyTorch, con un tamaño de repositorio de 0,3 GB. No incluye código de inferencia: este debe obtenerse del repositorio del modelo base. La licencia es MIT y el único idioma declarado es el inglés.

Su relevancia es acotada pero concreta: es un modelo de nicho para digitalización de documentos históricos en taquigrafía Gregg, una tarea con muy pocos modelos públicos disponibles. El ajuste fino mejora de forma medible la tasa de error de palabras en escritura manual (de 44,8% a 41,3% en un conjunto de versículos manuscritos) manteniendo un rendimiento prácticamente idéntico en texto impreso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de imagen a texto; arquitectura interna no documentada en la información proporcionada) |
| Parametros totales | 61.236.617 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión original) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Topaz-61M original, partiendo de sus pesos publicados en el paso 92.000. El entrenamiento consistió en 1.500 pasos con batch de 12, learning rate de 3e-5 y 100 pasos de warm-up, en precisión mixta. Se conservó el último paso sin selección sobre ningún conjunto de test. Los datos de entrenamiento son 31.979 recortes de líneas procedentes de los datos de libros de Topaz, manteniendo fuera de entrenamiento *Functional Method 2* (test) y el *1929 Manual* (dev).

Como aumentación se aplicaron transformaciones de estiramiento, inclinación, grosor de trazo, desenfoque, contraste y ruido, con las estadísticas de batch-norm congeladas. El autor probó también mezclar escritura manual sintética (escritores aleatorios, distorsión de rejilla, modelos de pluma sigma-lognormal y de segundo orden), pero ninguna de esas variantes superó al ajuste fino simple, por lo que se descartaron. El archivo `finetune.json` contiene los argumentos exactos y el registro de validación. No se documenta en la información disponible si hubo RLHF, DPO ni detalles sobre la arquitectura interna del transformer subyacente.

## Capacidades

- Transcripción de imágenes de líneas de taquigrafía Gregg Anniversary a trazos Grascii.
- Reconocimiento de taquigrafía impresa de manual con alta fidelidad (error de trazo del 3,08% en el conjunto de desarrollo del manual de 1929).
- Reconocimiento de taquigrafía manuscrita real, con rendimiento notablemente inferior al impreso pero mejorado respecto al modelo base.
- Procesamiento de imágenes fotografiadas con teléfono móvil (evaluado con una carta manuscrita de 143 palabras).
- Salida en formato intermedio Grascii, pensada para encadenarse con un decodificador posterior (el autor publica gregg-t5-grascii-to-english para convertir Grascii a inglés).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de imagen a texto.

## Casos de uso

- Digitalización de archivos históricos en taquigrafía Gregg: el modelo convierte líneas de documentos taquigrafiados en trazos Grascii que después pueden decodificarse a inglés, permitiendo recuperar el contenido de actas, cartas y notas de los siglos XIX y XX.
- Procesamiento de manuales de taquigrafía para corpus de investigación: útil para extraer pares de ejemplo de manuales impresos (donde el error de trazo es del 3,08%) y construir datasets de entrenamiento o evaluación.
- Transcripción asistida de notas manuscritas personales: aunque el error es alto (41,3% en versículos manuscritos), puede servir como primera pasada para un revisor humano en documentos de un solo escritor.
- Investigación en reconocimiento de escritura histórica: como componente de un pipeline OCR especializado en notación simbólica no latina, donde los OCR convencionales fallan.
- Generación de datos sintéticos de taquigrafía: el formato Grascii de salida facilita la creación de pares imagen-trazo para aumentar datasets de entrenamiento.
- Integración en herramientas de archivo y biblioteca digital: el modelo puede ejecutarse sobre recortes de línea extraídos de escaneos para indexar colecciones de documentos taquigrafiados.

## Benchmarks y rendimiento

Tasa de error de palabras (WER, menor es mejor) tras el decodificador entrenado gregg-t5-grascii-to-english:

| Conjunto de test | Topaz original | Este modelo |
|---|---|---|
| *Functional Method 2*, impreso, reservado | 23,4% | 23,3% |
| *Functional Method 2*, error de trazo | 10,2% | 10,0% |
| Génesis manuscrito, un escritor (119 versículos) | 44,8% | 41,3% |
| Foto de teléfono de carta manuscrita (143 palabras) | 65,0% | 55,9% |
| Manual de 1929, error de trazo (dev) | 2,92% | 3,08% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 61,2 millones de parámetros en fp32 los pesos ocupan aproximadamente 245 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para el modelo y los tensores intermedios de imagen; una RTX 3060 o superior es suficiente.
- Cabe en GPU consumer: sí, en todas las gamas actuales (RTX 20xx, 30xx, 40xx, así como GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: el autor solo documenta inferencia mediante el código del modelo base (`from topaz import Topaz`), instalando las dependencias desde `topaz-61m/requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de taquigrafía Gregg en la documentación aportada. La comparación más directa disponible es con el propio modelo base:

| Modelo | Parámetros | Contexto | WER manuscrito (Génesis) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Topaz-61M (base) | 61,2 M | no disponible | 44,8% | MIT | Hugging Face |
| Topaz-61M fine-tuned (este) | 61,2 M | no disponible | 41,3% | MIT | Hugging Face |

No disponible para otros modelos de la misma categoría (OCR de taquigrafía Gregg).

## Limitaciones y advertencias

- Entrenado únicamente con láminas de manual impresas: la escritura manual sigue siendo mucho más difícil que el texto impreso, y las distinciones de tamaño de Gregg (N/M, T/D, círculos A/E) se rompen cuando las proporciones del escritor difieren.
- El localizador de líneas espera líneas bastante rectas; las páginas de cuaderno curvadas suelen segmentarse mal.
- Solo cubre Gregg Anniversary (1929); no soporta otras variantes de taquigrafía Gregg.
- Riesgo de alucinación en la transcripción de trazos ambiguos, especialmente en escritura manual con proporciones irregulares.
- El WER en escritura manual real supera el 40%, por lo que no es apto para producción sin revisión humana.
- No incluye código de inferencia en el repositorio; depende del código del modelo base.
- Licencia MIT, que permite uso comercial, pero el autor no ofrece garantías sobre la calidad en dominios distintos del corpus de manuales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/preetham9070/topaz-gregg-61m-finetuned
- Modelo base: https://huggingface.co/amongglue/topaz-gregg-shorthand-61m
- Decodificador Grascii a inglés: https://huggingface.co/preetham9070/gregg-t5-grascii-to-english
- Repositorio del proyecto: https://github.com/PreethamReddy333/gregg-shorthand-ocr
- Formato Grascii: https://github.com/grascii/grascii

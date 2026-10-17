# LourivalGontijo/plant-disease-vit

## Resumen

Plant-disease-vit es un clasificador de imágenes basado en un Vision Transformer (ViT) implementado desde cero con PyTorch por LourivalGontijo. El modelo recibe imágenes RGB de 64 × 64 píxeles y predice una de 39 clases de enfermedad de hoja, según la model card publicada en HuggingFace. No se trata de un ViT preentrenado: la arquitectura se entrena específicamente para esta tarea de clasificación.

El autor reporta una precisión de test de aproximadamente 99,16%, aunque no se detallan el dataset, la partición train/test ni el protocolo de evaluación. El repositorio ocupa 0,1 GB y se distribuye con licencia MIT, lo que facilita su uso en prototipos y experimentos. No se publican el número de parámetros, la profundidad del transformer ni otros detalles relevantes para dimensionar el modelo.

Su relevancia actual está en el ámbito de la agricultura de precisión y la visión por computador de bajo coste: una entrada de 64 × 64 píxeles permite inferencia rápida y despliegue sencillo en entornos con recursos limitados. Sin embargo, la ausencia de validación externa y de especificaciones técnicas completas hace recomendable tratarlo como un baseline o un componente de triaje, no como un sistema de diagnóstico definitivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) implementado desde cero en PyTorch |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada de 64 × 64 píxeles) |
| Tipos de cuantización | No disponible; no se publican artefactos cuantizados |
| Idiomas soportados | No disponible; no procesa texto y no se documentan etiquetas en idiomas concretos |
| Licencia | MIT |
| Formato de pesos | PyTorch; no se detalla si es .pth, .pt o checkpoint completo |
| Entrada | Imagen RGB de 64 × 64 píxeles |
| Número de clases | 39 |
| Precisión reportada | 99,16% en test, según el autor |
| Pipeline | image-classification |
| Tamaño del repositorio | 0,1 GB |
| Framework | PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Vision Transformer: la imagen de entrada se divide en parches de 8 × 8 píxeles. Para una imagen de 64 × 64, esto produce 64 parches, que se proyectan y se procesan mediante bloques de atención y capas feed-forward. La model card indica que se trata de una implementación propia y no de un ViT preentrenado, con una cabeza de clasificación de 39 clases. No se especifican la dimensión del embedding, el número de capas, el número de cabezas de atención ni el tamaño del MLP.

Tampoco se documentan los datos de entrenamiento: no se indica el número de imágenes, la composición del dataset, las clases concretas, la división train/validation/test, las técnicas de aumento de datos, el optimizador, la función de pérdida ni el número de épocas. Al ser un modelo de clasificación de imágenes, no aplican RLHF, DPO ni entrenamiento con preferencias humanas. La única métrica publicada es la precisión de test del 99,16%, sin información suficiente para reproducirla o verificarla de forma independiente.

## Capacidades

- Clasificación de imágenes RGB de 64 × 64 píxeles en 39 clases de enfermedad de hoja.
- Salida de una etiqueta de clase; no se documenta si el modelo devuelve probabilidades calibradas o solo la clase predicha.
- No genera texto, código, matemáticas ni respuestas conversacionales.
- No soporta tool calling ni function calling.
- No está diseñado para agentes, planificación multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No es un modelo visión-lenguaje; no describe imágenes ni responde preguntas sobre ellas.
- No se documentan capacidades especiales como thinking mode, audio, vídeo o detección de objetos.

## Casos de uso

- Diagnóstico preliminar en aplicación móvil: la app captura una foto de la hoja, la redimensiona a 64 × 64 y consulta el modelo para obtener una de las 39 clases. Es adecuado para un primer triaje porque la entrada es pequeña y la inferencia puede ser rápida, aunque requiere validación humana.
- Monitorización de cultivos con cámaras fijas: un pipeline de visión puede enviar imágenes periódicas al modelo y generar alertas cuando la clase predicha corresponda a una enfermedad. La resolución de 64 × 64 reduce el coste de procesamiento, pero limita la detección de síntomas finos.
- Preetiquetado de datasets agrícolas: el modelo puede asignar etiquetas iniciales a grandes lotes de imágenes de hojas para que un experto las revise. Es útil como acelerador del etiquetado, siempre que se mida la precisión en el dominio concreto.
- Baseline de investigación: sirve como referencia inicial para comparar arquitecturas ViT, CNN u otros enfoques en clasificación de enfermedades de hojas. Su implementación desde cero y su licencia MIT facilitan la experimentación.
- Docencia y demostración técnica: permite ilustrar el funcionamiento de un Vision Transformer con parches de 8 × 8 y una tarea real de clasificación. Es adecuado para laboratorios y cursos de visión por computador.
- Filtrado previo en laboratorios agrónomos: el modelo puede priorizar imágenes sospechosas antes de un análisis manual o de laboratorio. No sustituye el diagnóstico experto, pero puede reducir el volumen de revisión inicial.
- Integración en sistemas de alerta temprana: una API puede recibir imágenes de campo y devolver la clase predicha junto con una puntuación de confianza, si se implementa. La utilidad real dependerá de la calibración y de la validación en cada cultivo y entorno.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalles |
|---|---|---|
| Precisión de test | 99,16% | Reportada por el autor; dataset, split y protocolo no detallados |
| Resolución de entrada | 64 × 64 | Indicada en la model card |
| Número de clases | 39 | Clases de enfermedad de hoja |

No se han publicado resultados de benchmarks adicionales en la información disponible. Métricas como MMLU, HumanEval o GSM8K no aplican a este modelo. La precisión del 99,16% no puede compararse de forma rigurosa sin conocer el dataset, la distribución de clases ni el método de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican el número de parámetros ni el tamaño exacto de los pesos; el repositorio completo ocupa 0,1 GB, pero ese dato no equivale necesariamente al peso del modelo.
- GPU recomendadas: no disponible. Sin conocer la arquitectura interna, no se puede dimensionar la VRAM necesaria ni recomendar una GPU concreta.
- GPU consumer: no confirmado. No se puede afirmar que quepa en una RTX 3060, RTX 4060 Ti, RTX 4090 u otra GPU consumer sin datos de parámetros y precisión numérica.
- Opciones de despliegue: inferencia con PyTorch. No se documenta exportación a ONNX, TorchScript, TensorRT ni otros formatos. vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo y no son adecuados para un clasificador de imágenes de este tipo.
- Latencia y throughput: no disponibles. La entrada de 64 × 64 sugiere un coste computacional bajo, pero no se han publicado mediciones.
- Recomendación: realizar una prueba de carga propia con el hardware objetivo y medir VRAM, latencia y precisión antes de desplegar en producción.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente los datos del modelo y deja explícitas las ausencias; no permite establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| plant-disease-vit | No disponible | No aplica | 99,16% en test sobre 39 clases | MIT | HuggingFace |
| ViT preentrenado genérico | No disponible | No aplica | No evaluado en este dataset | No disponible | No comparado |
| CNN genérica para clasificación de hojas | No disponible | No aplica | No disponible | No disponible | No comparada |

No se han publicado comparaciones con otros modelos en la información disponible. Cualquier comparación con ViT preentrenados o CNN requeriría evaluar todos los modelos sobre el mismo conjunto de test y con el mismo protocolo.

## Limitaciones y advertencias

- La resolución de 64 × 64 píxeles es muy baja para diagnóstico fitosanitario fino; puede perderse información sobre lesiones pequeñas, texturas y patrones cromáticos.
- La precisión del 99,16% está reportada sin detallar el dataset ni el split; puede no generalizar a otras cámaras, cultivos, condiciones de iluminación o regiones geográficas.
- No se documenta validación externa ni evaluación en un conjunto independiente.
- No se especifica la distribución de clases ni si existe desbalanceo; la precisión global puede ocultar un rendimiento pobre en clases minoritarias.
- No se detallan las 39 clases, por lo que no se puede verificar qué enfermedades o cultivos cubre realmente.
- El modelo puede aprender sesgos del fondo, la iluminación o el dispositivo de captura en lugar de los síntomas de la hoja.
- No se documenta calibración de probabilidades; una puntuación alta no implica necesariamente una predicción fiable.
- No sustituye el diagnóstico de un ingeniero agrónomo o un fitopatólogo; debe usarse como herramienta de apoyo.
- La licencia MIT permite uso comercial, modificación y redistribución, pero se ofrece sin garantías; el autor no se responsabiliza de decisiones agronómicas basadas en el modelo.
- No hay información sobre sesgos demográficos o geográficos, pero la ausencia de datos de entrenamiento impide evaluarlos.
- No es un modelo de propósito general: no genera texto, no razona, no soporta agentes ni tool calling.

## Enlaces

- HuggingFace: https://huggingface.co/LourivalGontijo/plant-disease-vit
- Model card: https://huggingface.co/LourivalGontijo/plant-disease-vit
- Paper: no disponible
- Blog: no disponible
- Repositorio: no disponible
- Demo: no disponible

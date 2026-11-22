# djrsystemservices/Spark-X2.6-4B-oQ6e

## Resumen
Spark-X2.6-4B-oQ6e es una conversión cuantizada del checkpoint Spark-X2.6-4B-bf16, publicada por el usuario djrsystemservices en Hugging Face. No se trata de un modelo original, sino de una redistribución en formato MLX con cuantización selectiva oQ6e, generada mediante la herramienta oMLX 0.8.0rc1. El modelo base procede del repositorio XHToken/Spark-X2.6-4B, del que se desconoce igualmente la mayoría de detalles técnicos y de entrenamiento.

El interés de esta ficha radica en el formato de cuantización: oQe aplica calibración de sensibilidad mediante imatrix (128 muestras de 512 tokens) para asignar precisión de forma selectiva por tensor, en lugar de un bit-width uniforme. Esto permite mantener 6 bits efectivos en los tensores más sensibles y reducir la precisión donde el impacto es menor, con el objetivo de preservar calidad frente a una cuantización homogénea.

El modelo cuenta con 4.112.079.360 parámetros y un repositorio de 3,4 GB, lo que resulta coherente con pesos en 6 bits. La model card no documenta arquitectura, datos de entrenamiento, idiomas, licencia ni benchmarks, por lo que la evaluación técnica disponible es muy limitada y debe considerarse un artefacto de conversión más que un modelo documentado de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre "spark2_5" aparece como tag, sin descripción) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e (6 bits selectivo, enhanced=True, calibración imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se remite a la licencia del modelo original XHToken/Spark-X2.6-4B) |
| Formato de pesos | safetensors (MLX), con index.json para shards y oq_imatrix_report.json |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura del modelo base. La model card no especifica si se trata de un transformer denso, un MoE, un modelo híbrido o cualquier otra variante, ni detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. El tag `spark2_5` sugiere una familia o generación interna del autor original, pero no aporta información estructural verificable.

La única información técnica concreta corresponde al proceso de cuantización. Se generó con oMLX 0.8.0rc1 a partir del checkpoint bf16, aplicando oQ6e con `enhanced=True` y calibración de importancia mediante imatrix con 128 muestras de 512 tokens. El resultado se documenta en `oq_imatrix_report.json`, que recoge la asignación de precisión por tensor. Este enfoque busca minimizar la pérdida de calidad en capas sensibles sin mantener 6 bits en todos los pesos.

## Capacidades
- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de 4B parámetros, aunque no está documentada explícitamente.
- Razonamiento y matemáticas: no disponible; no hay benchmarks ni descripción de capacidades.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ejecución en Apple Silicon: sí, al estar empaquetado en formato MLX con cuantización de 6 bits.

## Casos de uso
- Inferencia local en Mac con Apple Silicon: el formato MLX y los 3,4 GB de pesos permiten cargar el modelo en equipos con memoria unificada moderada, útil para prototipos y pruebas offline sin GPU dedicada.
- Evaluación de técnicas de cuantización: el repositorio incluye `oq_imatrix_report.json`, lo que permite estudiar la asignación selectiva de precisión y comparar la calidad frente a cuantizaciones uniformes de 6 bits.
- Experimentación con pipelines MLX: sirve como checkpoint de prueba para validar flujos de conversión, carga de shards e integración con la librería MLX en entornos de investigación.
- Benchmarking de calidad post-cuantización: permite medir la degradación respecto al checkpoint bf16 original en tareas de generación, siempre que se disponga de dicho checkpoint.
- Base para ajuste fino ligero en local: con 4B parámetros y pesos de 6 bits, es viable experimentar con LoRA o adaptadores sobre Apple Silicon, sujeto a la licencia del modelo original.
- Docencia y demostraciones: su tamaño contenido facilita mostrar en clase el impacto de la cuantización selectiva frente a la uniforme en un modelo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria estimada: aproximadamente 3,4 GB para los pesos en 6 bits, más overhead de activaciones y contexto (no cuantificado en la información disponible).
- GPU recomendadas: no disponible; el formato MLX está orientado a Apple Silicon (series M1, M2, M3, M4) con memoria unificada.
- ¿Cabe en GPU de consumo? En el ecosistema Apple Silicon, sí en equipos con al menos 8 GB de memoria unificada; en GPU NVIDIA no es directamente compatible sin conversión a otro formato.
- Opciones de despliegue: MLX y oMLX; para otros runtimes (llama.cpp, vLLM, TGI, Ollama) sería necesaria una conversión previa, no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia ni alternativas documentadas con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias
- Información documental mínima: la model card no describe arquitectura, entrenamiento, idiomas ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no declarada: se remite a la licencia del modelo original XHToken/Spark-X2.6-4B, que no se ha verificado; el uso comercial queda en incertidumbre hasta consultarla.
- Riesgo de alucinación: desconocido, al no haber evaluaciones publicadas ni descripción de alineamiento.
- Sesgos: no documentados; sin información sobre datos de entrenamiento no es posible estimar sesgos de género, idioma o dominio.
- Degradación por cuantización: aunque oQ6e es selectiva, existe pérdida de calidad respecto al bf16 original; no se cuantifica en la model card.
- Compatibilidad limitada: el formato MLX restringe su uso a entornos Apple; no hay pesos GGUF ni safetensors estándar para otros frameworks.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-22): conviene verificar la integridad y procedencia del artefacto antes de usarlo en cualquier flujo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/djrsystemservices/Spark-X2.6-4B-oQ6e
- Modelo original: https://huggingface.co/XHToken/Spark-X2.6-4B
- Paper, blog o demo: no disponible
- Repositorio de oMLX: no disponible en la información proporcionada

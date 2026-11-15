# millrace-ai/stories511K

## Resumen

stories511K es un modelo de generación de texto en inglés de 511.008 parámetros, entrenado desde cero en FP32 y posteriormente cuantizado a INT4 por el usuario millrace-ai. Su único propósito es la continuación de historias cortas y simples en inglés, siguiendo el estilo del corpus TinyStories de Eldan y Li. El paquete completo, incluyendo tokenizador, ocupa 235.952 bytes (230,4 KiB), lo que lo convierte en un experimento de mínima huella en disco más que en un modelo de uso general.

El modelo se presenta como una alternativa empaquetada a stories260K de Andrej Karpathy: sobre las mismas 256 historias de validación, el paquete INT4 reduce el tamaño un 77,8 % y obtiene una pérdida de siguiente token de 1,31375 frente a 1,42403 del release FP32 original. En una reevaluación ciega siguió la premisa en las dos primeras frases en 99 de 192 continuaciones, frente a 41 de 192 del modelo de referencia. Sin embargo, solo una de sus 192 continuaciones alcanzó una resolución completa de la premisa confirmada por dos lectores, por lo que la ventaja en coherencia global y en desenlaces no está demostrada.

Se trata de un modelo de investigación, no ajustado a instrucciones, con arquitectura derivada de llama2.c y entrenado sobre TinyStories. Su relevancia es acotada: sirve como banco de pruebas de empaquetado INT4 extremo, de protocolos de evaluación con pocos recursos y de linaje de entrenamiento reproducible, no como componente para aplicaciones en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo llama2.c (derivada de Karpathy llama2.c), inicialización independiente |
| Parametros totales | 511.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 con agrupación de 64 (group-64), exportación a formato XZ propio; el script de inferencia expande a FP32 en CPU |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | paquete XZ personalizado (weights.int4.xz); checkpoints opcionales en FP32 (.pt) e INT4 (.xz) |
| Tamano del paquete | 235.952 bytes (230,4 KiB), tokenizador incluido |
| Dataset de entrenamiento | roneneldan/TinyStories |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura sigue el linaje de llama2.c, un transformer decoder-only minimalista pensado para inferencia en CPU. El modelo parte de un checkpoint base entrenado en FP32 durante 16.384 actualizaciones en una GTX 1080, y después recibe una pasada adicional de 200 actualizaciones sobre 41.117 historias completas de TinyStories filtradas por GPT-6 Luna Medium con un criterio de "setup y payoff claro". El brazo de control (historias completas ordinarias) vio el mismo número de tokens con las mismas longitudes de ejemplo, de modo que la comparación aísla el efecto del filtrado. Ambos brazos finales usan la misma exportación INT4 group-64.

La innovación principal no está en la arquitectura sino en el empaquetado y la metodología de evaluación: el paquete en disco se reduce a 235.952 bytes y la evaluación se realiza recargando los paquetes descargados, de forma que las métricas reflejan los pesos realmente distribuidos. El tokenizador va incluido en el paquete. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de TinyStories, ni si hubo RLHF o DPO; el ajuste se limita a la pasada supervisada sobre historias filtradas.

## Capacidades

- Generación de texto en inglés: continuación de historias cortas a partir de una apertura o desde el token de inicio de historia.
- Seguimiento de premisa a corto plazo: en la evaluación ciega mantuvo la premisa en las dos primeras frases en 99 de 192 continuaciones.
- Generación determinista por semilla: el script `generate.py` acepta `--seed` para reproducir continuaciones.
- Inferencia en CPU: el script incluido expande los pesos a FP32 y ejecuta el modelo sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.
- No está ajustado a instrucciones.

## Casos de uso

- Investigación sobre cuantización extrema: usar el paquete INT4 y su brazo de control para estudiar cómo afecta la cuantización group-64 a la pérdida de siguiente token en modelos de menos de un millón de parámetros.
- Reproducción de experimentos de linaje de entrenamiento: los checkpoints intermedios (paso 8.192 y paso 16.384 en FP32) permiten replicar la curva de entrenamiento y verificar la metodología descrita en METHODOLOGY.md.
- Docencia y demostración de transformers: con 511.008 parámetros y ejecución en CPU, sirve para ilustrar el ciclo completo de tokenización, atención y decodificación en un aula sin infraestructura GPU.
- Evaluación de protocolos de filtrado de datos: comparar el brazo filtrado por GPT-6 Luna Medium con el control de historias completas ordinarias para medir el efecto del filtrado en el seguimiento de premisa.
- Pruebas de empaquetado y distribución de artefactos: el formato XZ propio y el manifiesto MANIFEST.json permiten ensayar flujos de verificación de integridad y de tamaño de paquete en entornos con restricciones severas de almacenamiento.
- Generación de cuentos simples para pruebas de pipelines de texto: útil como generador de texto sintético de bajo coste en tests de integración de sistemas de generación, siempre que no se requiera coherencia narrativa completa.
- Benchmark de referencia para modelos diminutos: sirve como línea base de 511K parámetros frente a stories260K en experimentos de escalado a muy baja escala.

## Benchmarks y rendimiento

| Modelo | Bytes del paquete (tokenizador incluido) | NLL en held-out (↓) | Seguimiento temprano de premisa (↑) | Resolución completa (dos lectores) |
|---|---:|---:|---:|---:|
| Karpathy stories260K FP32 | 1.064.185 | 1,42403 | 41/192 | 0/192 |
| Control de historias completas ordinarias INT4 | 235.980 | 1,32009 | 78/192 | 0/192 |
| stories511K Luna-filtered INT4 | 235.952 | 1,31375 | 99/192 | 1/192 |

Las cifras de NLL usan el split congelado y el protocolo de puntuación del propio proyecto. El panel de historias empleó 48 aperturas nuevas con cuatro semillas emparejadas por apertura. El autor indica que la coherencia global fue similar entre brazos y que el test no establece una ventaja fiable en los desenlaces. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el flujo documentado; el script de referencia ejecuta en CPU expandiendo los pesos a FP32, lo que requiere del orden de 2 MB de RAM para los 511.008 parámetros en FP32, más el overhead del intérprete de Python.
- GPU recomendadas: el entrenamiento se realizó en una GTX 1080; para inferencia no se especifica GPU y el flujo oficial es CPU.
- Cabe en cualquier GPU consumer e incluso en CPU; no se documentan requisitos de VRAM para el paquete INT4 en disco.
- Opciones de despliegue: únicamente el script `generate.py` incluido con el paquete y el módulo `upstream_model.py` de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: el recuento de bytes describe el paquete en disco, no la RAM en tiempo de ejecución ni el tamaño total del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NLL held-out | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| stories511K (millrace-ai) | 511.008 | no disponible | 1,31375 | no disponible | Hugging Face, paquete XZ de 235.952 bytes |
| stories260K (Karpathy, FP32) | 260.000 aprox. | no disponible | 1,42403 | no disponible en la información disponible | Hugging Face (karpathy/tinyllamas), 1.064.185 bytes |
| Control de historias completas ordinarias INT4 | no disponible | no disponible | 1,32009 | no disponible | Incluido como checkpoint en el repo de stories511K |

La comparación se limita al eje de tamaño de paquete y a la pérdida de siguiente token bajo el protocolo del proyecto; no hay datos de benchmarks estándar ni de contexto para ninguno de los tres.

## Limitaciones y advertencias

- No está ajustado a instrucciones: no debe esperarse que siga comandos ni formatos de conversación.
- Solo inglés; no hay soporte multilingüe.
- Coherencia narrativa limitada: solo 1 de 192 continuaciones alcanzó resolución completa de la premisa confirmada por dos lectores, y el autor señala que el test no demuestra ventaja en los desenlaces.
- Riesgo de alucinación y de deriva narrativa en historias largas; el modelo está pensado para continuaciones cortas y simples.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. El autor remite a NOTICES.md para atribución y términos aplicables.
- El formato de pesos es un XZ personalizado; no es compatible con ecosistemas estándar como GGUF o safetensors, lo que limita su integración en herramientas convencionales.
- El recuento de 235.952 bytes corresponde al paquete en disco, no a la RAM en ejecución.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre TinyStories, hereda las limitaciones de dominio y estilo de ese corpus.
- Sin datos publicados de latencia, throughput ni benchmarks estándar, lo que impide evaluar su idoneidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/stories511K
- Pesos empaquetados: https://huggingface.co/millrace-ai/stories511K/resolve/main/weights.int4.xz
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- llama2.c de Andrej Karpathy: https://github.com/karpathy/llama2.c
- tinyllamas de Karpathy: https://huggingface.co/karpathy/tinyllamas
- Metodología de entrenamiento (METHODOLOGY.md): no disponible como URL directa en la información proporcionada
- Guía de reproducibilidad (REPRODUCIBILITY.md): no disponible como URL directa en la información proporcionada
- Manifiesto de artefactos (MANIFEST.json): no disponible como URL directa en la información proporcionada
- Resultados del fine-tune emparejado (reports/05-matched-fine-tune/comparison.md): no disponible como URL directa en la información proporcionada
- Reevaluación ciega (reports/05-matched-fine-tune/luna-high-regrade/comparison.md): no disponible como URL directa en la información proporcionada
- Avisos de datos y código (NOTICES.md): no disponible como URL directa en la información proporcionada

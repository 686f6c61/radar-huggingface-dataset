# DireDreadlord/Chaturanga-Pro

## Resumen

Chaturanga Pro es un modelo de lenguaje pequeño (SLM) de 100.684.032 parámetros, desarrollado por DireDreadlord (Abhay Tyagi), especializado en generar jugadas de ajedrez en notación algebraica estándar (SAN) a partir de lenguaje natural. Se obtiene por fine-tuning del modelo base SupraLabs/Supra2-100M-Base sobre aproximadamente 600.000 filas del dataset mlabonne/chessllm, un corpus de partidas serializadas en texto. La model card declara arquitectura Llama y un uso previsto meramente experimental como motor de ajedrez conversacional.

Su relevancia es práctica antes que de rendimiento bruto: con ~100 M de parámetros y un repositorio de 0,4 GB, el modelo cabe en GPUs de portátil e incluso en CPU, lo que lo convierte en un banco de pruebas asequible para investigar generación de notación estructurada, validación de jugadas y pipelines de ajedrez integrados en interfaces conversacionales. Forma parte de una familia escalonada (Nano, Neo, Mini, Pro y Ultra) que el mismo autor publica con tamaños crecientes.

Conviene señalar que el autor documenta el entrenamiento en una única RTX 3050 de 4 GB de VRAM durante 7.000 pasos, de modo que el modelo es replicable por un particular. No se han publicado resultados de benchmarks, longitud de contexto ni esquemas de cuantización en la información disponible, y el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según model card); las etiquetas del repositorio incluyen además `qwen3`, dato no aclarado por el autor |
| Parametros totales | 100.684.032 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | SupraLabs/Supra2-100M-Base |
| Dataset de entrenamiento | mlabonne/chessllm (~600.000 filas en SAN) |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~100 M de parámetros con arquitectura declarada como Llama, construido sobre Supra2-100M-Base, un modelo base de la familia Supra de SupraLabs. No se documentan innovaciones en atención, decodificación especulativa ni capas híbridas: el interés técnico está en el ajuste fino sobre un dominio muy restringido y con una gramática de salida fuertemente estructurada (SAN), no en la arquitectura.

El entrenamiento consistió en fine-tuning sobre aproximadamente 600.000 filas del dataset chessllm, con las partidas formateadas mediante plantillas en notación algebraica estándar, durante 7.000 pasos sobre una RTX 3050 de 4 GB. No se especifican hiperparámetros, composición exacta del dataset, número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. El ajuste se orienta a que el modelo emita una jugada legal tras un contexto de partida, tarea que por su formato permite evaluar la corrección de forma automática.

## Capacidades

- Generación de jugadas de ajedrez en notación algebraica estándar (SAN) a partir de una posición o secuencia de jugadas descrita en lenguaje natural.
- Conversación multi-turno orientada a partidas, según la etiqueta `conversational` del repositorio.
- Generación de texto general, heredada del modelo base Supra2-100M-Base.
- Integración con interfaces de usuario: el autor incluye un archivo `chaturanga_gui.py` con el modelo y una GUI de ajedrez en los ficheros subidos.
- Compatibilidad declarada con text-generation-inference (etiqueta `text-generation-inference`).
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Multilingüismo: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de un motor de ajedrez conversacional: el modelo traduce una posición descrita en texto a una jugada en SAN, lo que permite construir un chatbot de ajedrez sin depender de un motor clásico basado en búsqueda; su tamaño de ~100 M facilita iterar rápido en local.
- Generación de datos sintéticos de ajedrez: sirve para producir secuencias de jugadas etiquetadas que luego se filtran por legalidad con una librería como python-chess, útil para ampliar datasets de entrenamiento de modelos mayores.
- Evaluación de robustez en notación estructurada: al ser un SLM entrenado exclusivamente en SAN, es un caso de estudio controlado para medir tasas de formato inválido y alucinación en salidas con gramática rígida.
- Educación y análisis de partidas: integrado en una GUI o notebook, permite explicar en inglés por qué se sugiere una jugada concreta, siempre con verificación externa de legalidad.
- Despliegue en entornos con recursos mínimos: al ocupar ~0,4 GB en safetensors y caber cuantizado en menos de 100 MB, puede ejecutarse en CPU o en GPUs de portátil para demos offline o entornos embebidos.
- Investigación sobre escalado de SLMs en dominios cerrados: la familia Chaturanga (Nano 25 M, Mini 50 M, Pro 100 M) permite estudiar la relación entre parámetros y tasa de jugadas legales con un mismo pipeline de datos.
- Componente de pruebas en CI: al ser determinista en formato y barato de ejecutar, puede actuar como caso de test en pipelines que validen generación estructurada antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión de jugadas legales, perplejidad, MMLU, HumanEval ni GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32, ~0,2 GB en fp16/bf16, ~0,1 GB en int8 y ~0,05 GB en 4 bits, calculado a partir de los 100.684.032 parámetros (sin contar caché KV, que será reducida dada la ausencia de contexto declarado).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más; el propio autor entrenó el modelo en una RTX 3050 de 4 GB. Una RTX 4090, A100 o H100 están sobradamente dimensionadas y solo tendrían sentido para servir muchas peticiones en paralelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (ruta directa con safetensors), text-generation-inference (etiqueta declarada por el autor), y servidores genéricos compatibles con safetensors. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas de tokens por segundo ni de tiempo por jugada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chaturanga Pro | ~100 M (100.684.032) | no disponible | ~600.000 filas de chessllm, 7.000 pasos | apache-2.0 | safetensors en HuggingFace |
| Chaturanga Mini | ~50 M | no disponible | fine-tuning sobre chessllm (número de filas no disponible) | no disponible en la información | HuggingFace |
| Chaturanga Nano | ~25 M | no disponible | 200.000 filas de chessllm | no disponible en la información | HuggingFace |
| Supra2-100M-Base | ~100 M | no disponible | modelo base generalista, sin fine-tuning de ajedrez | no disponible en la información | HuggingFace (SupraLabs) |

No se conocen en la información proporcionada otros SLM públicos especializados en generación de jugadas de ajedrez en SAN con los que establecer una comparación cuantitativa. La comparación con modelos generalistas del mismo orden de parámetros resultaría poco informativa, ya que no se han publicado métricas del dominio.

## Limitaciones y advertencias

- Con solo ~100 M de parámetros, la model card advierte explícitamente de que pueden producirse alucinaciones y jugadas ilegales; toda salida debe validarse con un motor o librería de reglas (por ejemplo, python-chess) antes de usarse.
- El modelo está pensado únicamente para uso experimental, según indica el propio autor; no debe tratarse como sustituto de un motor de ajedrez clásico.
- Solo se declara soporte de inglés, lo que limita interfaces en castellano u otros idiomas sin traducción previa.
- No se documenta longitud de contexto, por lo que se desconoce cuántas jugadas previas puede manejar de forma fiable; en partidas largas es esperable degradación.
- La licencia apache-2.0 permite uso comercial y modificación con atribución, pero el autor desaconseja explícitamente el uso en producción por la fiabilidad limitada del modelo.
- Existe una inconsistencia documental: el README se titula "Chaturanga Mini" mientras el repositorio es `Chaturanga-Pro`, y las etiquetas incluyen `qwen3` pese a que la model card declara arquitectura Llama; conviene verificar la arquitectura real antes de integrarla.
- El repositorio no registra descargas ni valoraciones, y la ruta del logo referenciada (`./chaturanga_pro_logo.png`) puede no estar disponible; el soporte de la comunidad es mínimo.
- No se han publicado evaluaciones independientes de sesgo, toxicidad o robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DireDreadlord/Chaturanga-Pro
- Modelo base: https://huggingface.co/SupraLabs/Supra2-100M-Base
- Colección de la familia Supra2: https://huggingface.co/collections/SupraLabs/supra2
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/chessllm
- Variante Mini: https://huggingface.co/DireDreadlord/Chaturanga-Mini
- Variante Nano: https://huggingface.co/DireDreadlord/Chaturanga-Nano
- Perfil del autor: https://huggingface.co/DireDreadlord
- Repositorio GitHub con el mismo nombre (proyecto independiente de ajedrez IA vs IA, sin relación confirmada con este modelo): https://github.com/DSiddharth24/Chaturanga

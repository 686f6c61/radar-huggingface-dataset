# drmylesgarveylabs/connectome-gpt-worm

## Resumen

ConnectomeGPT-Worm es un modelo de lenguaje experimental desarrollado por el investigador independiente Dr. Myles Douglas Garvey que incorpora el conectoma real del nematodo *Caenorhabditis elegans* como capa intermedia fija dentro de una arquitectura tipo GPT. La hipótesis central del proyecto es determinar si 50 millones de años de evolución biológica pueden servir como sesgo inductivo útil para la predicción de siguiente token. Para ello, el modelo inserta un "desvío biológico" entre el encoder y el decoder del transformer: las representaciones lingüísticas se proyectan sobre los 302 neuronas sensoriales del gusano, atraviesan la red sináptica fija (~5.000 conexiones) y se leen desde las neuronas motoras antes de generar texto.

El modelo tiene 256 dimensiones ocultas, 4 cabezas de atención y una ventana de contexto de 1024 tokens. Se entrenó sobre WikiText-103 (más de 100 millones de tokens) con el tokenizador de GPT-2, en una única GPU A100 80GB durante 10.000 pasos. El proyecto incluye una matriz experimental de siete configuraciones (conectoma fijo, entrenable, aleatorio, subconjuntos, entradas/salidas arbitrarias, ajuste fino quirúrgico y línea base densa) evaluadas con 5 semillas aleatorias. Se trata de un estudio de investigación, no de un modelo listo para producción, y su relevancia radica en explorar si la topología biológica puede ofrecer una alternativa a las capas totalmente conectadas convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT-style con capa biológica intermedia (conectoma de *C. elegans*) |
| Parametros totales | no disponible (el autor no publica el número exacto; con 256 dims y 4 heads se estima un modelo pequeño, pero no se confirma) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado con WikiText-103 en inglés, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 73.5 GB, probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

La arquitectura sigue el flujo: `Embeddings → Transformer Encoder → [Conectoma biológico] → Transformer Decoder → Salida`. El conectoma se incorpora como una capa fija (o entrenable según la variante experimental) que recibe proyecciones desde las neuronas sensoriales y emite señales desde las neuronas motoras. La matriz de conectividad se normaliza para que su mayor autovalor sea 1.0, evitando problemas de gradientes explosivos o desvanecidos. Los pesos sinápticos provienen del repositorio OpenWorm/CElegansNeuroML, concretamente la lista de aristas completa del hermafrodita con sinapsis químicas ponderadas por número de conexiones.

El entrenamiento usó WikiText-103 pre-tokenizado con el tokenizador GPT-2 (vocabulario de 50.257 tokens). Los hiperparámetros incluyen batch de 32 secuencias × 1024 tokens, optimizador AdamW (beta1=0.9, beta2=0.95, weight decay=0.01), learning rate 3e-4 con warmup de 500 pasos y decaimiento coseno hasta el 10%, precisión nativa bfloat16, y 5 semillas (42, 123, 456, 789, 1337). Se evaluaron 7 configuraciones experimentales: conectoma fijo, conectoma entrenable, pesos aleatorios con misma topología, subconjuntos de 50/100/200 neuronas, entradas/salidas arbitrarias, ajuste fino solo del conectoma, y una línea base densa sin biología. Cada configuración se entrenó durante 10.000 pasos.

## Capacidades

- Generación de texto autoregresiva básica: el modelo predice el siguiente token condicionado al contexto, aunque su capacidad lingüística está limitada por el tamaño reducido (256 dims).
- Razonamiento académico básico: se evaluó en MMLU sobre 8 materias (biología, química, física, informática y álgebra abstracta), con una línea base de azar del 25%.
- Procesamiento de contexto de hasta 1024 tokens, suficiente para párrafos o fragmentos cortos.
- Capacidad de adaptación del conectoma: en la variante entrenable (Experimento 2) y en el ajuste fino quirúrgico (Experimento 6), la red biológica puede modificar sus pesos sinápticos durante el entrenamiento.
- No se reportan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento explícitos.
- Multilingüismo: no declarado; el entrenamiento es exclusivamente en inglés (WikiText-103).

## Casos de uso

- Investigación en neurociencia computacional: el modelo permite estudiar si la topología sináptica de *C. elegans* puede procesar información simbólica, abriendo vías para comprender cómo los circuitos biológicos podrían codificar representaciones de alto nivel.
- Validación de sesgos inductivos biológicos: sirve como banco de pruebas para comparar el rendimiento de una red neuronal artificial con una capa biológica fija frente a capas densas equivalentes, útil para investigadores que exploran arquitecturas bioinspiradas.
- Estudio de ablaciones estructurales: los experimentos con subconjuntos de neuronas y entradas/salidas arbitrarias permiten analizar qué partes del conectoma son críticas para el procesamiento de información, con aplicaciones en análisis de robustez de redes.
- Exploración de regularización implícita: al congelar el conectoma, el transformer debe aprender a computar alrededor de restricciones fijas, lo que puede servir como método de regularización estructural en modelos pequeños.
- Educación en arquitecturas híbridas: el repositorio y el notebook asociado (`worm_experiments_final_...ipynb`) pueden utilizarse como material didáctico para enseñar cómo integrar componentes no diferenciables o fijos en pipelines de deep learning.
- Comparación de estrategias de inicialización: el experimento con pesos aleatorios (Experimento 3) permite aislar el efecto de la topología frente al de los valores sinápticos, útil para investigar la importancia de la inicialización en redes recurrentes o de paso de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los modelos se evaluaron cada 50 pasos con perplexity en WikiText-103 y precisión en MMLU (8 materias), pero no se incluyen tablas con valores concretos ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- Entrenamiento: se utilizó 1x NVIDIA A100 80GB con batch de 32×1024 tokens y precisión bfloat16. No se especifica el tiempo total de entrenamiento.
- Inferencia: dado el tamaño reducido (256 dimensiones ocultas, 4 cabezas, 1024 tokens de contexto), el modelo es muy ligero y debería ejecutarse sin problemas en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en CPU, aunque no se proporcionan cifras exactas de VRAM ni latencia.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de investigación, probablemente se ejecute mediante scripts de PyTorch/HuggingFace Transformers personalizados.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables públicos que integren un conectoma biológico real como capa intermedia. Los modelos GPT pequeños convencionales (por ejemplo, GPT-2 small con 124M parámetros) tienen una arquitectura estándar sin componentes biológicos, por lo que una comparación directa carecería de sentido metodológico. El autor no proporciona comparaciones con otros modelos en la model card.

## Limitaciones y advertencias

- Escala insuficiente: con 256 dimensiones ocultas, el modelo opera por debajo del umbral donde emergen capacidades de razonamiento robustas; pequeñas variaciones entre semillas pueden afectar significativamente a MMLU.
- Desajuste de dominio: el conectoma de *C. elegans* evolucionó para locomoción, quimiotaxis y supervivencia, no para procesamiento de lenguaje; su utilidad como sesgo inductivo lingüístico es cuestionable y no está demostrada.
- Sensibilidad al mapeo de entrada/salida: proyectar un espacio vectorial continuo sobre un conjunto discreto de neuronas sensoriales introduce un sesgo de diseño considerable, como reconoce el propio autor.
- Sin licencia declarada: no se especifica ninguna licencia de uso, lo que impide su utilización comercial o derivada sin autorización explícita del autor.
- Sin garantías de producción: es un experimento de investigación, no un modelo optimizado para tareas reales; no se recomienda su uso en aplicaciones críticas.
- Riesgo de alucinación y errores: al ser un modelo pequeño entrenado con un único corpus (WikiText-103), su cobertura temática es limitada y puede generar texto incoherente o factualmente incorrecto.
- Idiomas: solo se entrenó con datos en inglés; no hay soporte multilingüe verificado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drmylesgarveylabs/connectome-gpt-worm
- Proyecto OpenWorm (fuente de datos biológicos): https://github.com/OpenWorm/CElegansNeuroML (referenciado en la model card)
- Artículo de referencia sobre el modelo c302 de *C. elegans*: Gleeson, Padraig et al. (2018), "c302: a multiscale framework for modelling the nervous system of Caenorhabditis elegans", Philosophical Transactions of the Royal Society B (citado en la model card)
- Contacto del autor: drmylesgarvey@gmail.com (según la model card)

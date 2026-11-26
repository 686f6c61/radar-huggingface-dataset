# reaperdoesntknow/Discovery

## Resumen

DiscoverLM-70M-Base es un modelo de lenguaje causal de 70 millones de parámetros desarrollado por el usuario independiente reaperdoesntknow (bajo la etiqueta ConvergentIntel). Su rasgo diferencial es la arquitectura Mixture-of-Attentions (MoA), que sustituye el producto escalar Q·Kᵀ habitual en los transformers por una distancia de Mahalanobis negativa al cuadrado, con un regularizador que impone la desigualdad triangular sobre tripletas aleatorias durante el entrenamiento. El objetivo declarado es que los pesos de atención reflejen proximidad geométrica real en un espacio métrico, algo que el autor presenta como estructura aprovechable y no como una restricción impuesta.

El modelo se distribuye en formato safetensors a través de la librería transformers, con un tokenizador propio de 48.000 entradas y una longitud de contexto que no se especifica en la información disponible. El repositorio ocupa 0,3 GB y acumula 1.369 descargas desde su publicación en marzo de 2026, con la última actualización en noviembre de 2026. La licencia es CC (sin variante concreta indicada) y el único idioma declarado es el inglés.

Por su escala, se trata de un modelo de investigación y experimentación más que de un candidato para producción general. Resulta relevante para quienes estudian variantes de atención geométrica, enrutamiento disperso por token y arquitecturas híbridas de bajo coste computacional, así como para experimentos de ajuste fino sobre hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Attentions (MoA), atención métrica de Mahalanobis, BlackHoleRoPE, HyperFFN y MoA LM head |
| Parámetros totales | 70.569.408 (69,1M según el desglose del autor) |
| Parámetros activos | No es MoE; el enrutamiento top-2 es por token dentro de cada bloque, no de expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC (variante concreta no especificada) |
| Formato de pesos | Safetensors (librería transformers) |

Desglose de parámetros según el autor: embedding de tokens compartido 24,6M (35,5%), 4 bloques MoA 28,9M (41,8%), HyperFFN compartido 4,2M (6,1%), MoA LM head 10,8M (15,6%) y RoPE más normalizaciones 0,6M (0,9%).

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro bloques MoA idénticos. Cada bloque contiene cuatro rutas paralelas: convolución local depthwise, atención métrica global con 64 cabezas (espacio de cabeza de 8 dimensiones, escalado diagonal aprendido, origen de bola aprendible y radio adaptativo para poda dispersa), mezcla de canales con compuertas y atención métrica multi-query con 64 consultas. Un router aprendido selecciona las dos rutas principales por posición de token y unas compuertas de características escalan la salida de cada ruta antes de la mezcla, seguida de residual y DropPath. La atención se calcula como distancia de Mahalanobis negativa al cuadrado, con enmascaramiento de pares fuera de la bola antes del softmax, y la desigualdad triangular se refuerza mediante un regularizador sobre tripletas aleatorias muestreadas en entrenamiento.

BlackHoleRoPE aplica perturbaciones de fase aprendidas desde una base de Fourier compacta, manteniendo las rotaciones de Q y K unitarias y aplicando una compuerta de energía acotada en [0,5, 2,0] sobre las amplitudes de V, con modulación opcional por estado de discrepancia. La HyperFFN es de tres ramas (SwiGLU, convolución causal depthwise separable y cuello de botella de bajo rango con compuertas), también con selección dispersa top-2 por token. La cabeza de lenguaje ejecuta su propia mezcla de atenciones (32 cabezas, head_dim=16) antes de proyectar a logits mediante una transformación SwiGLU, con pesos atados al embedding de entrada. El vocabulario es de 48.000 tokens con tokenizador propio y tokens especiales para system, user, assistant, think, reasoning, bos, eos y pad.

El entrenamiento se realizó con TRL mediante SFT sobre tres conjuntos de datos: nohurry/Opus-4.6-Reasoning-3000x-filtered (razonamiento multi-paso), openbmb/UltraData-Math (resolución de problemas matemáticos) y yahma/alpaca-cleaned (seguimiento de instrucciones general). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés con tokenizador propio y formato de chat mediante tokens especiales.
- Razonamiento multi-paso, orientado por el dataset de razonamiento filtrado usado en el ajuste supervisado.
- Resolución de problemas matemáticos, con entrenamiento específico sobre UltraData-Math.
- Seguimiento de instrucciones generales gracias a alpaca-cleaned.
- Generación estructurada con marcadores de sistema, usuario, asistente, pensamiento y cadena de razonamiento.
- Enrutamiento disperso por token (top-2) en atención y FFN, con poda por bola en la atención métrica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step reasoning orquestado más allá de los tokens de razonamiento.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Investigación en mecanismos de atención: el modelo permite estudiar empíricamente si la atención métrica con desigualdad triangular regularizada mejora la interpretabilidad geométrica frente al producto escalar, comparando mapas de atención y distancias aprendidas.
- Experimentos de ajuste fino en hardware de consumo: con 70M de parámetros y pesos safetensors de 0,3 GB, cabe holgadamente en una GPU de 8-12 GB y permite ciclos rápidos de SFT con TRL sobre datasets pequeños.
- Generación de texto y prototipado de chatbots en inglés: el tokenizador incluye tokens de sistema, usuario y asistente, de modo que puede montarse un chat multi-turno básico sin ingeniería adicional de plantillas.
- Razonamiento matemático de juguete y demostraciones educativas: el entrenamiento sobre UltraData-Math lo hace adecuado para generar cadenas de solución simples en entornos docentes o de validación de pipelines, no para producción matemática crítica.
- Evaluación de arquitecturas híbridas atención-convolución: las cuatro rutas por bloque (convolución local, atención global, mezcla de canales y MQA) permiten aislar la contribución de cada tipo de cómputo en tareas controladas.
- Base para destilación o investigación de enrutamiento disperso: el router top-2 por token y la poda por bola ofrecen un banco de pruebas para estudiar sparsity y balance de rutas en modelos pequeños antes de escalar el diseño.
- Generación de texto con formato estructurado: los tokens think y reasoning permiten separar cadena de pensamiento de respuesta final en experimentos de prompting.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,28 GB solo para pesos (70,6M × 4 bytes), más activaciones y caché KV; en la práctica por debajo de 1-2 GB según longitud de secuencia.
- En fp16/bf16: aproximadamente 0,14 GB de pesos, holgadamente dentro de cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso CPU para inferencia por lotes pequeños; A100 o H100 no son necesarias.
- Cabe en GPU consumer sin problema, incluidas integradas con memoria compartida suficiente para secuencias cortas.
- Opciones de despliegue: transformers con el código propio del paquete MoA (import MoA), que es requisito para cargar el modelo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados no es desplegable directamente en llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles; por el tamaño, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiscoverLM-70M-Base | 70,6M | No disponible | MoA con atención métrica | CC | Hugging Face, requiere código MoA |
| GPT-2 small | 124M | 1.024 tokens | Transformer estándar | MIT | Hugging Face, transformers nativo |
| Pythia-70M | 70M | 2.048 tokens | Transformer estándar | Apache 2.0 | Hugging Face, transformers nativo |
| TinyLlama-1.1B | 1,1B | 2.048 tokens | Transformer estándar (Llama) | Apache 2.0 | Hugging Face, ecosistema amplio |

La comparación con Pythia-70M es la más directa por escala. Frente a ella, DiscoverLM introduce atención métrica y enrutamiento disperso, pero carece de benchmarks publicados, de contexto declarado y de integración con el ecosistema estándar de inferencia. GPT-2 small y TinyLlama ofrecen mayor madurez de herramientas y licencias permisivas más explícitas.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el rendimiento real en tareas estándar es desconocido.
- La longitud de contexto no está documentada, lo que impide planificar usos con ventanas largas.
- El modelo requiere importar el paquete MoA y sus clases MoAMetricLM y MoAMetricConfig; no es cargable con AutoModel estándar, lo que complica su integración en pipelines existentes.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está evaluado.
- La licencia CC no especifica la variante (BY, BY-SA, BY-NC, etc.), lo que genera incertidumbre sobre el uso comercial; conviene verificar los términos antes de cualquier despliegue productivo.
- Riesgo de alucinación elevado por el tamaño (70M) y por el ajuste sobre datasets de razonamiento filtrado de origen no verificado.
- Sesgos no documentados: no se publica información sobre composición demográfica, filtrado de toxicidad ni evaluaciones de sesgo.
- El entrenamiento se limita a SFT; no consta RLHF ni DPO, por lo que la alineación con preferencias humanas es limitada.
- El autor no publica detalles de tokens de entrenamiento ni de la fase de preentrenamiento, lo que dificulta reproducir o auditar el modelo.
- La model card mezcla identificadores (DiscoverLM-70M-Base, DiscoverLM-70M, reaperdoesntknow/Discovery), lo que puede provocar errores al cargar el tokenizador o los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovery
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset matemático: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset de instrucciones: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Repositorio o paper del modelo: no disponible
- Demo o espacio interactivo: no disponible

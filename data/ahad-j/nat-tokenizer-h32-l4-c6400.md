# ahad-j/nat-tokenizer-h32-l4-c6400

## Resumen

NAT action tokenizer es un codificador y decodificador de acciones robóticas desarrollado por el usuario ahad-j, publicado bajo licencia MIT. No es un modelo generativo de lenguaje, sino un tokenizador discreto: convierte bloques (chunks) de 32 pasos de acción robótica, con hasta 7 columnas por grupo, en 14 tokens enteros y los reconstruye de vuelta a acciones continuas en las unidades originales del usuario. Está pensado para integrarse en un modelo visión-lenguaje-acción (VLA), de modo que la política pueda generar acciones como si fueran tokens de texto.

La arquitectura interna es un cuantizador FSQ (Finite Scalar Quantization) con 4 latentes por chunk y 4 escalas de 6.400 códigos cada una, lo que da un vocabulario de 25.600 tokens. El primer token es una escala gruesa que cubre dos latentes, y los tres restantes son escalas más finas por latente. El modelo tiene 62.914.044 parámetros y se distribuye únicamente como pesos en `model.safetensors` más un JSON de configuración; la red es PyTorch plano dentro del paquete `nat-tokenizer`.

Su relevancia práctica está en el decodificado causal: los 14 tokens están ordenados en el tiempo, de forma que los 4 primeros reconstruyen los 8 primeros pasos del chunk, los 7 primeros reconstruyen 16 pasos, los 11 primeros reconstruyen 24 y los 14 reconstruyen los 32. Esto permite a un robot ejecutar acciones mientras el modelo sigue generando, y encadenar chunks en tiempo real mediante `tokens_starting_with`. Es una pieza de infraestructura para robótica, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuantizador FSQ con 4 latentes por chunk y 4 escalas de 6.400 codigos (red PyTorch plana) |
| Parametros totales | 62.914.044 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; chunks fijos de 32 pasos de accion |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; el tokenizador en si ya es discreto) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + JSON de configuracion |
| Vocabulario | 25.600 tokens (4 escalas x 6.400 codigos) |
| Dimension de accion | hasta 7 columnas por grupo; grupos consecutivos de 7 (8 = 7+1, 14 = 7+7, 21 = 7+7+7) |
| Tokens por chunk | 14 por grupo de 7 columnas |
| Tamano del repo | 2,0 GB |
| Descargas | 10 |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El tokenizador se basa en Finite Scalar Quantization (FSQ), una alternativa a VQ-VAE que evita el colapso de código y el entrenamiento de un codebook explícito. Cada chunk de 32 pasos se comprime en 4 latentes; el primero se cuantiza con una escala gruesa que abarca dos latentes y los tres siguientes con escalas más finas, una por latente. El resultado son 14 tokens por grupo de hasta 7 columnas de acción, ordenados temporalmente para permitir decodificación causal por prefijos.

Según la model card, se entrenó sobre un corpus amplio de datos de acciones de robots y de humanos, procesando cada ventana una sola vez con batch de 4.096. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste fino o preferencias (RLHF/DPO), que en cualquier caso no aplicarían a un tokenizador. El entrenamiento se realizó sobre acciones normalizadas en el rango [-1, 1]; el tokenizador aplica por defecto una normalización por columna basada en mínimo y máximo ajustable con `fit()`, con recorte de valores fuera de rango y codificación de columnas constantes como 0.

## Capacidades

- Tokenización de chunks de acción de exactamente 32 pasos y hasta 7 columnas por grupo, con soporte para dimensiones mayores mediante grupos consecutivos.
- Decodificación inversa a acciones continuas en las unidades originales del usuario, con normalización por mínimo y máximo por columna.
- Decodificación causal por prefijos: 4 tokens reconstruyen 8 pasos, 7 tokens 16 pasos, 11 tokens 24 pasos y 14 tokens el chunk completo.
- Streaming token a token mediante `stream()`, que devuelve las 8 acciones de cada latente en cuanto sus tokens están completos.
- Encadenado en tiempo real con `tokens_starting_with()`, que genera el prefijo de tokens correspondiente a las acciones que el robot está ejecutando para evitar saltos entre chunks.
- Ejecución en GPU con `to("cuda")` y captura opcional de CUDA graphs por forma de batch, manteniendo entradas y salidas en NumPy.
- Persistencia del estado ajustado (mínimos y máximos) con `save_pretrained()` y recarga con `from_pretrained()`.
- No soporta tool calling, agentes, visión, audio ni generación de texto: su única función es la conversión acción-token.

## Casos de uso

- Integración en un VLA para robótica de manipulación: el modelo de lenguaje genera tokens de acción con su vocabulario de 25.600 entradas y el tokenizador los convierte en trayectorias de 32 pasos y 7 grados de libertad, sin necesidad de una cabeza de regresión continua.
- Control en bucle cerrado con latencia reducida: gracias a la decodificación causal, el robot puede ejecutar los primeros 8 pasos con solo 4 tokens generados, lo que reduce el tiempo entre la inferencia y el movimiento en tareas de alcance y agarre.
- Generación de chunks solapados en tiempo real: `tokens_starting_with()` permite que el siguiente chunk empiece con las acciones que el robot está ejecutando, evitando discontinuidades en el control a 10-50 Hz típico de brazos manipuladores.
- Entrenamiento de políticas de imitación: convertir demostraciones continuas (por ejemplo, de un dataset tipo Open X-Embodiment) a secuencias discretas para entrenar un transformer autorregresivo con pérdida de entropía cruzada estándar.
- Compresión de logs de teleoperación: 32 pasos x 7 columnas se reducen a 14 enteros, lo que facilita el almacenamiento y la transmisión de trayectorias en flotas de robots o en entornos con ancho de banda limitado.
- Evaluación y benchmarking de políticas: la reconstrucción sobre los benchmarks robóticos citados en la model card permite medir el error de cuantización antes de desplegar un pipeline VLA completo.
- Prototipado en GPU de consumo: al ser una red de 62,9 millones de parámetros, cabe en tarjetas modestas y permite iterar sobre el pipeline de tokenización sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de reconstrucción sobre benchmarks robóticos con chunks aleatorios de 32 pasos normalizados por mínimo y máximo, pero el texto proporcionado está truncado y no incluye cifras concretas de error de reconstrucción ni de velocidad.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 62,9 millones de parámetros; en fp32 ocupa aproximadamente 0,25 GB de pesos, y en fp16 unos 0,13 GB. Con activaciones y buffers de CUDA graphs, el consumo realista se sitúa por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, una A100 o H100 reducen el tiempo por chunk.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: el paquete `nat-tokenizer` (PyTorch) con soporte de CPU, CUDA y CUDA graphs. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona que la ejecución en GPU coincide con la CPU salvo diferencias de coma flotante y que, en raras ocasiones, un token en el límite de cuantización puede diferir.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Vocabulario | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NAT action tokenizer (ahad-j) | Tokenizador FSQ de acciones | 62,9 M | 25.600 | Chunks de 32 pasos | MIT | Hugging Face, 10 descargas |
| FAST (tokenizador de acciones de Physical Intelligence) | Tokenizador basado en DCT + BPE | no disponible | no disponible | Chunks variables | no disponible | Repositorio abierto |
| VQ-VAE de acciones (implementaciones genericas) | Cuantizador vectorial con codebook aprendido | variable | variable | Chunks configurables | variable | Multiples repositorios |

La comparación con alternativas concretas no está disponible en la información proporcionada; los dos modelos citados son referencias de la misma categoría (tokenizadores de acción para VLA), pero no se dispone de sus especificaciones verificadas en este contexto.

## Limitaciones y advertencias

- Solo acepta chunks de exactamente 32 pasos; no admite longitudes variables sin trocear previamente.
- El streaming está limitado a acciones de hasta 7 columnas (un único grupo); dimensiones mayores requieren decodificar grupos completos.
- La normalización depende de los mínimos y máximos ajustados con `fit()`; un ajuste incorrecto o un cambio de distribución en producción degrada la reconstrucción.
- Los valores fuera del rango ajustado se recortan, lo que puede ocultar acciones anómalas o saturadas.
- El modelo se entrenó con acciones en [-1, 1]; usar `normalize=False` con datos fuera de ese rango produce una codificación fuera de distribución.
- No procesa texto, imágenes ni audio: no debe presentarse como un modelo multimodal ni como una política completa.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez, al no ser un modelo generativo.
- La licencia MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el repo tiene solo 10 descargas y 0 likes, por lo que la validación comunitaria es mínima.
- El repo pesa 2,0 GB para 62,9 millones de parámetros, lo que sugiere pesos en fp32 o artefactos adicionales; conviene verificar el contenido antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahad-j/nat-tokenizer-h32-l4-c6400
- Paquete de Python: `pip install nat-tokenizer` (no se proporciona URL del repositorio en la información disponible)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.

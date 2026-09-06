# ks46/urls-250m

## Resumen

`urls-250m` es un modelo de lenguaje especializado en URLs, desarrollado por el usuario ks46, con el objetivo de lograr compresión sin pérdidas de direcciones web. A diferencia de los modelos de lenguaje de propósito general, este modelo no genera texto conversacional, sino que estima la distribución de probabilidad de los bytes de cada URL para alimentar un codificador aritmético. La compresión se mide en bits por carácter (bits/char) sobre un conjunto de URLs reservadas, y el modelo está diseñado para decodificar en el cliente en menos de un segundo.

La arquitectura es un transformer de 12 capas con 1280 unidades de ancho, 20 cabezas de atención y MLP SwiGLU, con un total de 246.087.680 parámetros. El tokenizador es un BPE de nivel de byte con 8.192 entradas, pre-dividido estructuralmente para que los hosts se almacenen con el TLD primero. Las posiciones absolutas aprendidas se reinician en cada token `<eos>`, de modo que cada URL se trata como un contexto independiente. El modelo se distribuye como un artefacto cuantizado int4-g64 de 124.8 MiB en formato `.nurl` v3, que permite codificación y decodificación bit-idénticas mediante productos de punto enteros exactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, 1280 de ancho, 20 cabezas, MLP SwiGLU) |
| Parámetros totales | 246.087.680 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento, reiniciada en cada `<eos>`) |
| Tipos de cuantización | int4-g64 (artefacto `.nurl` v3 de 124.8 MiB) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.nurl` v3 (artefacto empaquetado int4-g64) y `.pt` (checkpoints de PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar con MLP SwiGLU y un tokenizador BPE de nivel de byte de 8.192 entradas. La principal innovación es la pre-división estructural del vocabulario: los hosts se almacenan con el TLD primero, lo que facilita el modelado de la estructura jerárquica de las URLs. Las posiciones absolutas aprendidas se reinician en cada token `<eos>`, de modo que cada URL es un contexto independiente dentro de la ventana de 512 tokens. La cuantización int4-g64 utiliza 34 bytes por cada 64 pesos con escalas en f16, lo que permite productos de punto enteros exactos y garantiza que la codificación y la decodificación sean bit-idénticas.

El entrenamiento se realizó sobre el dataset `ks46/urls-tokenized`, utilizando los shards 0 a 39, con un total de 19.9 mil millones de tokens, aproximadamente 561 millones de URLs, en una sola pasada con orden sembrado. Se usó el optimizador AdamW con β(0.9, 0.95), weight decay 0.01, LR pico 0.0006, warmup de 1000 pasos y decaimiento lineal en el último 10%. El batch era de 64 ventanas × 512 tokens × 8 GPUs, lo que equivale a 262.144 tokens por iteración, con 76.000 iteraciones en total. Tras la fase de precisión completa, se ejecutaron 7.600 iteraciones de cuantización consciente (QAT) sobre la cuadrícula exacta int4-g64 con LR 6e-05. El hardware empleado fue 8× RTX 5090 conectadas por PCIe sin NVLink, con autocast en bf16 y un rendimiento de aproximadamente 680.000 tokens/s. No se mencionan técnicas de RLHF o DPO.

## Capacidades

- Compresión sin pérdidas de URLs: el modelo asigna probabilidades a los bytes de cada URL, permitiendo codificación aritmética bit-idéntica en el cliente.
- Modelado de lenguaje byte-level: el tokenizador BPE de 8.192 entradas está pre-dividido estructuralmente, con hosts almacenados TLD-first, optimizado para la estructura de las URLs.
- Ejecución en cliente: el artefacto int4-g64 está diseñado para decodificar en menos de un segundo en el navegador, con productos de punto enteros exactos.
- Contexto por URL: las posiciones absolutas se reinician en cada `<eos>`, lo que permite comprimir cada URL de forma independiente.
- No soporta tool calling, agentes, visión ni audio; su función es exclusivamente la compresión de URLs.
- Idiomas: se declara soporte para inglés, aunque el tokenizador byte-level puede procesar cualquier byte.

## Casos de uso

- Compresión de URLs en navegadores web: el modelo se ejecuta en el cliente para comprimir la URL antes de enviar una petición, reduciendo el tamaño de la cabecera HTTP. Es adecuado porque está diseñado para decodificar en menos de un segundo y el artefacto ocupa solo 124.8 MiB.
- Sincronización de marcadores entre dispositivos: comprimir listas de URLs guardadas para reducir el tráfico de sincronización. El modelo modela la distribución de URLs y puede comprimir cientos de enlaces en un espacio mínimo.
- Análisis de logs de servidores web: comprimir grandes volúmenes de URLs registradas en logs, reduciendo los costes de almacenamiento. Su entrenamiento con 561 millones de URLs lo hace experto en la estructura de dominios y rutas.
- Transferencia de enlaces en aplicaciones de mensajería: comprimir URLs largas para enviarlas como texto compacto, manteniendo la integridad bit a bit gracias a la codificación y decodificación exactas.
- Caché de CDN: comprimir claves de URL en sistemas de caché para ahorrar memoria y mejorar la velocidad de acceso. El modelo puede generar representaciones compactas de las claves.
- Archivo de historial de navegación: comprimir el historial local para reducir el espacio en disco. El modelo está optimizado para URLs individuales, con contexto reiniciado en cada `<eos>`.

## Benchmarks y rendimiento

La evaluación se realizó como bits/char sobre un subconjunto fijo de 2.000 URLs reservadas (shard 512, muestreo de paso uniforme). La tabla siguiente muestra la evolución de la tasa de compresión a lo largo de los checkpoints de entrenamiento.

| Checkpoint | Tokens procesados | Eval bits/char |
|---|---|---|
| ckpt-i004000.pt | 1.05B | 1.57265 |
| ckpt-i008000.pt | 2.10B | 1.48613 |
| ckpt-i012000.pt | 3.15B | 1.43982 |
| ckpt-i016000.pt | 4.19B | 1.41691 |
| ckpt-i020000.pt | 5.24B | 1.39589 |
| ckpt-i024000.pt | 6.29B | 1.38293 |
| ckpt-i028000.pt | 7.34B | 1.37117 |
| ckpt-i032000.pt | 8.39B | 1.36356 |
| ckpt-i036000.pt | 9.44B | 1.35538 |
| ckpt-i040000.pt | 10.49B | 1.35037 |
| ckpt-i044000.pt | 11.53B | 1.34356 |
| ckpt-i048000.pt | 12.58B | 1.33765 |
| ckpt-i052000.pt | 13.63B | 1.33521 |
| ckpt-i056000.pt | 14.68B | 1.32983 |
| ckpt-i060000.pt | 15.73B | 1.32985 |
| ckpt-i064000.pt | 16.78B | 1.32275 |
| ckpt-i068000.pt | 17.83B | 1.32023 |
| ckpt-i072000.pt | 18.87B | 1.29781 |
| ckpt-i076000.pt | 19.92B | 1.27486 |

No se han publicado comparaciones con otros modelos de compresión en la información disponible. La evaluación final del artefacto empaquetado está pendiente de ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto int4-g64 ocupa 124.8 MiB, por lo que la inferencia puede realizarse en cualquier GPU o CPU con al menos 256 MiB de memoria disponible (incluyendo overhead). No se especifica un mínimo exacto.
- GPU recomendadas: para inferencia, cualquier GPU moderna, incluso integrada, es suficiente. Para reproducir el entrenamiento se requieren 8× RTX 5090 con 262.144 tokens por iteración.
- ¿Cabe en GPU de consumo? Sí, el modelo es extremadamente ligero (124.8 MiB) y cabe en cualquier GPU de consumo.
- Opciones de despliegue: el formato `.nurl` está pensado para un códec de navegador. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Los checkpoints `.pt` se pueden cargar con `training/train.py`.
- Latencia y throughput: el objetivo declarado es decodificar en menos de un segundo en el cliente. El entrenamiento alcanzó aproximadamente 680.000 tokens/s con 8× RTX 5090. No hay cifras de latencia de inferencia publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de compresión de URLs.

## Limitaciones y advertencias

- El modelo es experimental: tiene 0 descargas y 0 likes en HuggingFace, y la evaluación final está pendiente.
- El artefacto final `model/<pending>.nurl` aún no está disponible; solo se han publicado checkpoints de entrenamiento y una tabla de evolución de bits/char.
- El formato `.nurl` es una solución propietaria que requiere un códec específico; no es un formato estándar como GGUF o safetensors.
- La ventana de contexto es de 512 tokens, lo que limita la compresión de URLs muy largas, aunque cada URL se procesa como un contexto independiente.
- Solo se declara soporte para inglés; aunque el tokenizador byte-level puede manejar otros bytes, la distribución de entrenamiento se basa en URLs predominantemente en inglés.
- Posible sesgo hacia los dominios y patrones más frecuentes en el dataset `ks46/urls-tokenized` (561 millones de URLs), lo que puede reducir la eficiencia en URLs de dominios poco comunes.
- No se mencionan sesgos de contenido, pero al entrenar con URLs reales el modelo podría reflejar la distribución de la web.
- La licencia MIT permite uso comercial, pero el autor no proporciona garantías de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/ks46/urls-250m
- Dataset de entrenamiento: https://huggingface.co/datasets/ks46/urls
- Perfil del autor: https://huggingface.co/ks46
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.

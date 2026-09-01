# jepacpp/vjepa2-vitl-fpc16-256-ssv2-GGUF

## Resumen

V-JEPA 2 ViT-L/16 es un modelo de comprensión de video desarrollado por Meta (FAIR) que aprende representaciones mediante una arquitectura JEPA (Joint Embedding Predictive Architecture), es decir, prediciendo en el espacio de representación en lugar de en píxeles. Esta conversión a GGUF, publicada por jepacpp, adapta el encoder ViT-L/16 con su cabeza attentive-pooler entrenada para clasificación de acciones en Something-Something-v2 (174 clases) para ser ejecutado con jepa.cpp, un motor de inferencia en C/C++ basado en ggml que funciona en CPU sin Python ni PyTorch.

El modelo tiene 375,5 millones de parámetros, con una dimensión de 1024, 24 capas, 16 cabezas de atención, patch de 16 y tubelet de 2, procesando clips de 16 frames a resolución 256x256. Su relevancia radica en que permite desplegar un modelo de video de última generación en entornos sin GPU, con un único binario y un archivo GGUF que incluye las etiquetas de las 174 clases, eliminando dependencias externas. La licencia MIT facilita su uso comercial y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16) con attentive pooler, JEPA (Joint Embedding Predictive Architecture) |
| Parametros totales | 375.485.998 (375 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16 frames (clip de video de entrada) |
| Tipos de cuantizacion | f32, f16, q8_0, q4_0, q4_k (formato GGUF) |
| Idiomas soportados | no aplica (modelo de video, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base original usa safetensors) |

## Arquitectura y entrenamiento

V-JEPA 2 es un modelo de video auto-supervisado de Meta (FAIR) que extiende los objetivos de pretraining de V-JEPA. El encoder es un Vision Transformer de gran tamaño (ViT-L) con 24 capas, 16 cabezas de atención y dimensión 1024, que procesa clips de 16 frames con patch de 16 y tubelet de 2. La cabeza attentive-pooler se entrena específicamente para clasificación de acciones en el dataset Something-Something-v2, que contiene 174 clases de interacciones físicas (empujar, levantar, cubrir, rodar, etc.). El modelo base fue entrenado con aprendizaje auto-supervisado a escala, prediciendo en el espacio de representación en lugar de reconstruir píxeles.

La conversión a GGUF mantiene los pesos del modelo original y además incrusta las etiquetas de las 174 clases dentro del archivo, de modo que la inferencia solo requiere el binario de jepa.cpp y el archivo GGUF. El repositorio incluye pruebas de paridad que comparan las salidas con la referencia de PyTorch, verificando que las cuantizaciones f32, f16 y q8_0 mantienen un alto grado de fidelidad.

## Capacidades

- Clasificacion de acciones en video: identifica una de 174 clases de Something-Something-v2 a partir de un clip de 16 frames.
- Extraccion de caracteristicas: genera embeddings de video con opciones de pooling `mean`, `cls`, `lewm` o `none` (mapa completo de tokens).
- Ejecucion en CPU pura: funciona sin GPU, sin Python y sin PyTorch gracias al motor jepa.cpp.
- Soporte de cuantizacion: ofrece varios niveles de precision (f32, f16, q8_0, q4_0, q4_k) para ajustar el equilibrio entre memoria y calidad.
- Autocontenido: las etiquetas de clase viajan dentro del archivo GGUF, no requiere archivos auxiliares.
- API C: expone una interfaz C simple mediante el header `jepa.h` para integracion en aplicaciones nativas.

## Casos de uso

- Clasificacion de acciones en tiempo real en dispositivos edge: al ejecutarse en CPU sin dependencias pesadas, puede desplegarse en Raspberry Pi, NUC o sistemas embebidos para monitorizar gestos o actividades fisicas.
- Analisis de video para seguridad y vigilancia: identifica acciones como "cubrir un objeto", "empujar" o "levantar" en secuencias de camaras, con latencia aceptable en hardware modesto.
- Extraccion de caracteristicas para busqueda de video: usando `jepa-embed` con pooling `mean` o `cls`, se generan vectores de representacion que alimentan sistemas de recuperacion por similitud o clustering.
- Prototipado rapido en entornos sin GPU: investigadores pueden validar hipotesis sobre clasificacion de video en maquinas CPU-only antes de escalar a clusters con GPU.
- Integracion en pipelines de procesamiento de video en C/C++: la API C permite incrustar el modelo directamente en aplicaciones nativas de vision artificial, evitando la sobrecarga de un runtime de Python.
- Evaluacion de modelos de video en produccion con restricciones de dependencias: entornos con politicas estrictas de seguridad o sin acceso a PyTorch pueden ejecutar este modelo con un unico binario estatico.

## Benchmarks y rendimiento

Los resultados se obtuvieron sobre el conjunto de validacion de Something-Something-v2 (24.777 clips, 174 clases, una vista por clip y sin aumentacion en test). Se comparan la referencia de PyTorch (float32, TF32 desactivado) con jepa.cpp en backend CUDA y CPU.

| Backend | dtype | top-1 % | top-5 % | Acuerdo top-1 con PyTorch % | Coseno logits (media / peor clip) |
|---|---:|---:|---:|---:|---:|
| PyTorch (f32) | f32 | 72.39 | 94.11 | — | — |
| jepa.cpp CUDA | f32 | 72.39 | 94.10 | 99.66 | 0.9999628 / 0.98586241 |
| jepa.cpp CUDA | f16 | 72.39 | 94.11 | 99.66 | 0.9999628 / 0.98559944 |
| jepa.cpp CUDA | q8_0 | 72.47 | 94.07 | 97.97 | 0.9991721 / 0.94188198 |
| jepa.cpp CUDA | q4_k | 72.52 | 94.02 | 94.19 | 0.9930669 / (dato incompleto) |

Ademas, la model card reporta metricas de paridad por archivo GGUF, medidas contra la referencia de PyTorch en CPU con 32 hilos:

| Archivo | Coseno medio | Coseno mediana | Peor token | Coseno pooled_mean | Coseno logits | top-1/top-5 |
|---|---|---|---|---|---|---|
| f32 | 1.000000 | 1.000000 | 0.999999 | 1.000000 | 1.000000 | 2/2 · 5/5 |
| f16 | 0.997144 | 0.999897 | 0.5088 | 0.999897 | 0.999935 | 2/2 · 5/5 |
| q8_0 | 0.966128 | 0.996770 | 0.2305 | 0.996645 | 0.998501 | 2/2 · 5/5 |
| q4_0 | 0.915000 | no disponible | 0.200962 | no disponible | 0.988118 | 2/2 / 0.90 |
| q4_k | 0.931075 | no disponible | 0.220083 | no disponible | 0.985617 | 2/2 / 0.90 |

La cuantizacion q4_k no alcanza el umbral de calidad "advisory" para tensores derivados (logits y pooled), tanto en CPU como en CUDA, por lo que se desaconseja su uso en produccion.

## Requisitos de hardware

- CPU: funciona en CPU pura gracias a jepa.cpp; las pruebas de paridad se realizaron con 32 hilos, lo que sugiere que un procesador moderno de 8 nucleos o superior es suficiente para inferencia interactiva.
- VRAM: no requiere GPU. Si se usa backend CUDA, el archivo debe cargarse en memoria de GPU; los tamanos son: f32 1432.4 MiB, f16 717.1 MiB, q8_0 383.2 MiB, q4_0/q4_k 205.1 MiB.
- GPU recomendada: cualquier GPU NVIDIA con CUDA para aceleracion opcional; no es necesaria para el funcionamiento basico.
- Opciones de despliegue: jepa.cpp (motor C/C++), con binarios `jepa-classify` y `jepa-embed`. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras exactas, pero las pruebas de paridad se ejecutaron en CPU con 32 hilos sobre 24.777 clips, lo que indica un rendimiento suficiente para procesamiento por lotes o tiempo real en hardware de gama media.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de clasificacion de video en la informacion proporcionada. Como referencia, el modelo base original en PyTorch (facebook/vjepa2-vitl-fpc16-256-ssv2) alcanza un top-1 de 72.39% en Something-Something-v2, y esta conversion GGUF mantiene ese rendimiento en f32 y f16. Otros modelos de video como VideoMAE o TimeSformer no tienen resultados publicados en este contexto, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo esta especializado en las 174 clases de Something-Something-v2; no es un clasificador general de acciones ni de objetos.
- No procesa texto, audio ni otros modalidades; es exclusivamente un encoder de video.
- La cuantizacion q4_k esta por debajo del umbral de calidad recomendado (tier "advisory, below the bar") y puede degradar significativamente los logits y embeddings; se recomienda usar f16 o q8_0 para produccion.
- El modelo fue entrenado con datos de video que pueden contener sesgos en las clases representadas; la distribucion de Something-Something-v2 se centra en interacciones fisicas cotidianas, lo que limita su aplicacion a dominios muy diferentes.
- Aunque la licencia MIT permite uso comercial, el modelo base de Meta tiene su propia licencia (MIT segun la model card), pero se debe verificar la politica de uso de Meta para modelos de investigacion.
- No es un modelo generativo: no produce video ni texto, solo clasifica o extrae caracteristicas.
- La inferencia en CPU puede ser lenta para clips largos o lotes grandes; se recomienda cuantizacion q8_0 como equilibrio entre calidad y velocidad.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/jepacpp/vjepa2-vitl-fpc16-256-ssv2-GGUF
- Modelo base en HuggingFace: https://huggingface.co/facebook/vjepa2-vitl-fpc16-256-ssv2
- Repositorio de jepa.cpp: https://github.com/aselimc/jepa.cpp
- Repositorio oficial de V-JEPA 2: https://github.com/facebookresearch/vjepa2
- Paper de V-JEPA 2: https://arxiv.org/abs/2506.09985
- Documentacion de jepa.cpp (paridad, cuantizacion, rendimiento): https://aselimc.github.io/jepa.cpp/

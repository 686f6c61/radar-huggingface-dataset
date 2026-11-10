# HY-2012/FastWave.AXERA

## Resumen

FastWave.AXERA es una implementación optimizada para NPU del modelo de superresolución de audio FastWave, desarrollado por el usuario HY-2012 a partir del modelo base Nikait/FastWave. Se trata de un modelo de difusión de tan solo 1,3 millones de parámetros que realiza superresolución de audio y extensión de ancho de banda, transformando entradas de 6 a 48 kHz en salidas fijas de 48 kHz. Su relevancia radica en que demuestra que tareas de restauración de audio de alta calidad pueden ejecutarse íntegramente en hardware de borde (edge) de bajo consumo, concretamente en la NPU AX650 de AXERA.

El repositorio incluye un grafo AXMODEL cuantizado de un solo paso NFE (11,9 MB, activaciones U16 y pesos S8), un SDK en Python que implementa el pipeline completo (troceado con overlap-add y muestreo EDM) y ejemplos de audio de entrada y salida. La inferencia es puramente en NPU, sin dependencia de GPU ni de operadores FFT nativos, gracias a una reescritura de las STFT/iSTFT internas como multiplicaciones de matrices Cooley-Tukey de 32×32.

El modelo está pensado para escenarios de despliegue en dispositivos embebidos donde se requiere mejorar la calidad de audio telefónico, grabaciones de baja tasa de muestreo o flujos de voz comprimidos, manteniendo un coste computacional mínimo y una licencia permisiva (Apache-2.0 para el código y los pesos cuantizados, MIT para el modelo upstream).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión con EDM preconditioning y backbone NU-Wave 2 (red neuronal con ramas FFC/STFT) |
| Parametros totales | 1,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, procesa por chunks de 0,68 s) |
| Tipos de cuantizacion | U16 activaciones / S8 pesos / U16 salida (Pulsar2 8.0, calibración MinMax) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (código y modelo cuantizado); upstream MIT |
| Formato de pesos | AXMODEL (`fastwave_nfe.axmodel`, 11,9 MB) para NPU AX650; el modelo base en formato original no se detalla en la información disponible |

## Arquitectura y entrenamiento

FastWave es un modelo de difusión de 1,3 M de parámetros que emplea preacondicionamiento EDM (Elucidating the Design Space of Diffusion-Based Generative Models) sobre un backbone NU-Wave 2. La arquitectura incorpora ramas de transformada de Fourier de tiempo corto (STFT) e inversa (iSTFT) en cada capa, lo que proporciona una rama global FFC (Fourier Feature Convolution) para modelar dependencias espectrales de largo alcance. El modelo opera como un proceso de difusión con un número configurable de pasos de muestreo (8 por defecto, 4 en modo rápido).

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que se trata de un modelo de audio y no de lenguaje. La innovación técnica principal de esta implementación es la adaptación para NPU: las operaciones `torch.stft/istft` se reescribieron como multiplicaciones de matrices Cooley-Tukey de 32×32 (con reflect padding, ventana hann, overlap-add y normalización de envolvente de ventana), logrando un error menor a 1e-7 respecto a la implementación de PyTorch y dejando únicamente operadores MatMul/Add/Mul/Reshape en el grafo. Además, los coeficientes EDM `c_skip/c_in/c_out` y el embedding sinusoidal de difusión se precalculan en el host y se pasan como entradas al grafo, eliminando operadores log/sqrt/sin/cos/OneHot. La tasa de muestreo de entrada se codifica mediante un one-hot de banda, permitiendo que un único modelo cubra el rango de 6 a 48 kHz.

## Capacidades

- Superresolución de audio y extensión de ancho de banda: transforma audio de entrada de 6, 8, 12, 16, 24 o 48 kHz en una salida fija de 48 kHz.
- Restauración de voz y audio general: mejora la calidad de grabaciones de baja tasa de muestreo y flujos comprimidos.
- Procesamiento por chunks con overlap-add: permite procesar audio de duración arbitraria mediante troceado de 0,68 s con solapamiento configurable (por defecto 50 %).
- Muestreo de difusión configurable: 8 pasos (calidad por defecto) o 4 pasos (modo rápido con ligera pérdida de calidad).
- Inferencia puramente en NPU: sin necesidad de GPU ni de operadores FFT nativos en el hardware.
- Soporte multilingüe limitado a inglés y chino en los ejemplos y datos de calibración.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio-to-text; el modelo es exclusivamente audio-to-audio.

## Casos de uso

- Restauración de audio telefónico: el modelo convierte grabaciones de voz de 8 kHz (típicas de telefonía) a 48 kHz, mejorando la inteligibilidad y la naturalidad en sistemas de atención al cliente o análisis de llamadas, con un coste de 499,8 ms por paso NFE en la NPU AX650.
- Mejora de archivos de audio históricos o de baja calidad: grabaciones de 6 a 24 kHz pueden procesarse por chunks con overlap-add para obtener una versión de 48 kHz, adecuada para archivos, podcasts o material de archivo.
- Preprocesado en pipelines de reconocimiento automático de voz (ASR): la extensión de ancho de banda previa a la transcripción puede mejorar la precisión de sistemas ASR en entornos con audio comprimido, ejecutándose en el mismo dispositivo de borde.
- Despliegue en dispositivos embebidos de bajo consumo: al requerir solo una NPU AX650 y un modelo de 11,9 MB, es adecuado para cámaras, dispositivos IoT o equipos de comunicaciones que necesiten mejorar audio en tiempo real sin GPU.
- Procesamiento de audio en tiempo real con RTF bajo: con 4 pasos y 50 % de overlap, el RTF es de 5,0 (es decir, procesa 5 segundos de audio por cada segundo de cómputo), lo que permite aplicaciones casi en tiempo real en el borde.
- Generación de datasets de audio aumentados: el modelo puede utilizarse para crear pares de audio de baja y alta calidad (8k→48k, 16k→48k) destinados a entrenar otros modelos de restauración o ASR.
- Integración en SDK de comunicaciones: el SDK en Python (solo numpy + axengine) facilita su incorporación en soluciones de videoconferencia o VoIP que necesiten mejorar la señal de voz en el propio dispositivo.

## Benchmarks y rendimiento

| Configuración | Single NFE | RTF extremo a extremo |
|---|---|---|
| 8 pasos + 50 % overlap (por defecto) | 499,8 ms | 10,0 |
| 4 pasos + 50 % overlap (`--steps 4`) | 499,8 ms | 5,0 |

No se han publicado resultados de benchmarks objetivos (como PESQ, STOI o MOS) en la información disponible. La model card menciona que la similitud coseno entre el AXMODEL y el ONNX en coma flotante para un solo paso NFE se encuentra en `reports/accuracy.md`, pero el valor mínimo aparece como "TBD" (pendiente de determinar).

## Requisitos de hardware

- NPU objetivo: AX650 (AXERA), con el modelo `fastwave_nfe.axmodel` de 11,9 MB.
- VRAM estimada: no aplica; la inferencia es en NPU, no en GPU. El modelo ocupa 11,9 MB en el almacenamiento del dispositivo.
- GPU recomendadas: no aplica para esta implementación; el modelo está diseñado exclusivamente para la NPU AX650.
- ¿Cabe en GPU de consumo? No es el objetivo; el modelo se ejecuta en NPU de borde. El modelo base (1,3 M de parámetros) podría ejecutarse en CPU, pero no se documentan requisitos para ello.
- Opciones de despliegue: SDK propio en Python con `numpy` + `axengine` (incluido en la imagen BSP de AX650); script `run_ax650.sh` para ejecución en placa.
- Latencia y throughput: 499,8 ms por paso NFE; RTF de 10,0 con 8 pasos y 5,0 con 4 pasos (chunk de 0,68 s, 50 % overlap).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base Nikait/FastWave es la referencia directa, pero no se detallan sus especificaciones de rendimiento ni su comparación con otras alternativas de superresolución de audio. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado y calibrado principalmente con datos de voz en inglés y chino; su rendimiento en otros idiomas o en audio no vocal (música, efectos) no está documentado.
- La salida está fijada a 48 kHz, lo que puede no ser adecuado para pipelines que requieran otras tasas de muestreo sin remuestreo posterior.
- El proceso de difusión con 8 pasos tiene un RTF de 10,0 en la NPU AX650, lo que limita su uso en aplicaciones de tiempo real estricto; el modo de 4 pasos reduce el coste a RTF 5,0 pero con pérdida de calidad.
- La cuantización U16/S8 puede introducir degradación adicional respecto al modelo en coma flotante; la model card indica que la similitud coseno mínima está pendiente de determinar (TBD).
- El modelo no incluye capacidades de texto, razonamiento, tool calling ni agentes; es exclusivamente audio-to-audio.
- La licencia Apache-2.0 aplica al código y al modelo cuantizado de este repositorio; el modelo upstream FastWave tiene licencia MIT, que también es permisiva para uso comercial.
- Al ser un modelo de difusión, puede generar artefactos o alucinaciones espectrales en señales de entrada muy degradadas o con ruido no visto durante el entrenamiento.
- No se han publicado análisis de sesgos demográficos o de otro tipo; se recomienda validar el rendimiento en la población objetivo antes de un despliegue en producción.

## Enlaces

- [Hugging Face: HY-2012/FastWave.AXERA](https://huggingface.co/HY-2012/FastWave.AXERA)
- [GitHub: ZY-2012/FastWave.AXERA (código y reproducción)](https://github.com/ZY-2012/FastWave.AXERA)
- [GitHub: Nikait/FastWave (modelo upstream)](https://github.com/Nikait/FastWave)
- [Paper: arXiv:2603.04122](https://arxiv.org/abs/2603.04122)
- [Modelo base: Nikait/FastWave](https://huggingface.co/Nikait/FastWave)

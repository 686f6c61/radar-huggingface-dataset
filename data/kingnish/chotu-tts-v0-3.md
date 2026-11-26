# KingNish/Chotu-TTS-v0.3

## Resumen

Chotu TTS v0.3 es un modelo de síntesis de voz (text-to-speech) en inglés de tamano ultrarreducido, desarrollado por KingNish, con tan solo 792.489 parámetros. Su característica principal es que implementa un pipeline 100 % en streaming sobre ONNX estándar (opset 17), sin operaciones DSP externas, lo que lo hace apto para despliegue en dispositivos de borde (edge AI) con recursos muy limitados. El modelo ofrece ocho voces predefinidas y está publicado bajo licencia Apache 2.0.

La versión 0.3 introduce mejoras técnicas relevantes respecto a versiones anteriores: condicionamiento de hablante FiLM por bloque, un decodificador de mayor capacidad (d=160, H=4, head_dim=40, W=40) manteniendo el vector de voz en 896 bytes, una FFT más pequena (n_fft=512, hop_80hz=300) con ventana sqrt-Tukey COLA exacta, y una cabeza de vocoder factorizada (120 → 48 → GELU → 771). Además, se ofrecen variantes cuantizadas en INT8 con optimizaciones específicas para ONNX Runtime.

El modelo es relevante porque demuestra que es posible obtener una calidad de voz razonable (UTMOS medio de 4,348) con menos de un millón de parámetros y un fichero de pesos por debajo de 1 MB en su versión INT8, con factores de tiempo real (RTF) inferiores a 0,01 sobre 2 núcleos de CPU. Esto lo posiciona como candidato para asistentes embebidos, aplicaciones móviles y sistemas con restricciones severas de memoria y cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder con condicionamiento FiLM por bloque + vocoder ConvNeXt con FFT (pipeline ONNX streaming) |
| Parametros totales | 792.489 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32, INT8 (dos variantes: `int8_mm` e `int8_all`) |
| Idiomas soportados | Inglés (8 voces en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, operaciones `ai.onnx` estándar) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas típica en TTS neuronal: un decodificador que transforma la representación textual en características acústicas y un vocoder que las convierte en forma de onda. El decodificador emplea un bucle XSA (probablemente atención cruzada) con K=4 iteraciones y condicionamiento de hablante mediante FiLM (Feature-wise Linear Modulation) inyectado en cada bloque. El vocoder es de tipo ConvNeXt con 4 bloques, también condicionado por FiLM por bloque, y una cabeza factorizada (120 → 48 → GELU → 771). La síntesis se realiza mediante una FFT radix-16x32 Cooley-Tukey de 14 KB con n_fft=512, ventana sqrt-Tukey que cumple COLA exacta, hop de 300 muestras (80 Hz) y un `ola_tail` de 212 muestras.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card no detalla el proceso de entrenamiento más allá de las innovaciones arquitectónicas. Las innovaciones técnicas destacables son el condicionamiento FiLM por bloque, la cuantización INT8 segura para FFT (Opt #1), la optimización básica de ORT y la deduplicación de inicializadores (Opt #4), y el diseno de un pipeline 100 % streaming sin operaciones DSP externas.

## Capacidades

- Síntesis de voz en inglés con 8 voces predefinidas (`af_heart`, `af_bella`, `af_nicole`, `am_adam`, `am_fenrir`, `am_michael`, `bf_emma`, `bm_lewis`).
- Generación de audio en streaming, adecuada para aplicaciones de baja latencia.
- Condicionamiento de hablante mediante un vector de voz compacto (224 × float32 = 896 B).
- Ejecución sobre ONNX Runtime con operaciones estándar `ai.onnx` (opset 17), sin dependencias DSP externas.
- Variantes cuantizadas INT8 para reducir el tamano del modelo y acelerar la inferencia.
- No se mencionan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Asistentes de voz embebidos en dispositivos IoT: el modelo cabe en menos de 1 MB en INT8 y se ejecuta con RTF inferior a 0,01 en 2 núcleos de CPU, lo que permite integrarlo en microcontroladores o SoCs de baja potencia para respuestas habladas locales.
- Lectura de notificaciones y accesibilidad en aplicaciones móviles: la síntesis en streaming y el reducido consumo de memoria permiten generar audio en tiempo real sin conexión a la nube, útil para lectores de pantalla o avisos del sistema.
- Sistemas de navegación y automoción: la baja latencia y el soporte de 8 voces permiten anuncios de giro y alertas en tiempo real dentro de la unidad de infoentretenimiento, con independencia de la conectividad.
- Juguetes interactivos y dispositivos educativos: el modelo puede generar respuestas habladas en inglés con calidad aceptable (UTMOS 4,348) en hardware de bajo coste, sin necesidad de GPU.
- Pruebas de concepto y prototipado de pipelines TTS: al ser un modelo ONNX estándar y ligero, sirve como base para validar arquitecturas de streaming o para comparar técnicas de cuantización en entornos con recursos limitados.
- Síntesis de voz en aplicaciones de domótica: respuestas verbales locales para asistentes del hogar que deben funcionar sin conexión y con requisitos mínimos de huella de memoria.
- Generación de avisos en kioscos o terminales de autoservicio: el modelo puede producir mensajes hablados pregrabados dinámicamente en inglés con una latencia muy baja y sin dependencia de servicios externos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| UTMOS medio | 4,348 (min 4,000, max 4,469) |
| MCD | 3,28 dB |
| Mel80 | 0,444 |
| F0 RMSE | 19,24 Hz |

| Voz | UTMOS |
|---|---:|
| `af_heart` | 4,469 |
| `af_bella` | 4,406 |
| `af_nicole` | 4,000 |
| `am_adam` | 4,375 |
| `am_fenrir` | 4,469 |
| `am_michael` | 4,438 |
| `bf_emma` | 4,312 |
| `bm_lewis` | 4,312 |

| Fichero | Tamano | RTF (2 CPU) |
|---|---:|---:|
| `chotu_tts_v0_3_fp32.onnx` | 3,223 MB | 0,0111 |
| `chotu_tts_v0_3_int8_mm.onnx` | 1,282 MB | 0,0080 |
| `chotu_tts_v0_3_int8_all.onnx` | 0,973 MB | 0,0104 |

No se han publicado resultados comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está disenado para CPU. En FP32 ocupa 3,223 MB y en INT8 entre 0,973 y 1,282 MB, por lo que puede residir íntegramente en memoria RAM o en caché de CPU.
- GPU recomendadas: no se especifican; el modelo está orientado a CPU y edge. Cualquier GPU con soporte ONNX Runtime podría ejecutarlo, pero no se proporcionan datos de rendimiento en GPU.
- Cabe en GPU de consumo: sí, con un consumo de memoria despreciable (menos de 4 MB), por lo que cabe en cualquier GPU de consumo, aunque su objetivo es CPU.
- Opciones de despliegue: ONNX Runtime (con optimizaciones básicas y deduplicación de inicializadores), así como cualquier runtime compatible con ONNX opset 17. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: RTF de 0,0080 en la variante INT8 `mm` sobre 2 núcleos de CPU, lo que implica que genera audio aproximadamente 125 veces más rápido que tiempo real en ese entorno. La variante FP32 presenta un RTF de 0,0111 y la INT8 `all` de 0,0104.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos TTS ligeros habituales (por ejemplo, variantes reducidas de VITS o Piper) no se han evaluado en esta ficha por falta de datos. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se han declarado otros idiomas.
- La calidad de voz, aunque razonable para su tamano, presenta un UTMOS máximo de 4,469 y un mínimo de 4,000, lo que indica variabilidad entre voces.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, pueden existir sesgos de pronunciación o prosodia no declarados.
- Riesgo de alucinación: en TTS, esto se traduce en posibles artefactos, pronunciaciones incorrectas o prosodia anómala ante textos fuera del dominio de entrenamiento; no se han publicado análisis al respecto.
- Limitaciones de contexto: no se especifica la longitud máxima de texto de entrada; el diseno streaming sugiere procesamiento por fragmentos, pero no se detalla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y la atribución correspondiente.
- Para producción, es necesario validar la calidad en el dominio específico y verificar el comportamiento de las variantes INT8, ya que la cuantización puede afectar a la calidad de la FFT y a la prosodia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KingNish/Chotu-TTS-v0.3)

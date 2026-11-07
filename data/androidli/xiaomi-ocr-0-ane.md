# androidli/Xiaomi-OCR-0-ane

## Resumen

Xiaomi-OCR-0-ane es un paquete de inferencia para Apple Silicon del modelo Xiaomi-OCR-0, un VLM de 0,8B parámetros especializado en OCR y parsing de documentos desarrollado por Xiaomi Research. El paquete, publicado por el usuario androidli, no es un fine-tuning ni una cuantización del modelo original: redistribuye los pesos base (Apache-2.0) reorganizados para ejecutar el bucle de decodificación de tokens sobre la Apple Neural Engine mediante Core ML, mientras la torre de visión y el prefill permanecen en ONNX Runtime sobre CPU.

La arquitectura subyacente parte de Qwen3.5-0.8B y combina atención completa con capas gated-delta-rule (atención lineal), lo que obliga a un reparto híbrido entre motores: la torre de visión en ONNX fp32, el prefill de texto en ONNX int4 con ventanas de 256 tokens y la decodificación token a token en Core ML fp16 con capacidad KV fija de 2048. El paquete incluye un runner en Python (numpy + onnxruntime + coremltools) y los grafos Core ML con su script de construcción.

Su relevancia es práctica: demuestra cómo exportar un VLM con atención híbrida a la ANE, un objetivo complicado por la ausencia de `MatMulNBits` en Core ML y por la regla delta con resolución triangular, que no tiene equivalente nativo. Las mediciones del autor en un M1 Pro muestran que la ganancia de rendimiento es modesta (18,2 tok/s a KV=2048 frente a ~20 tok/s en CPU), pero se libera la CPU durante la generación y baja el consumo energético.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM basada en Qwen3.5-0.8B con atención híbrida (6 capas de atención completa + capas gated-delta-rule); export Core ML `mlprogram` fp16 para decode, ONNX para visión y prefill |
| Parametros totales | 0,8B (modelo base); 0,9B reportado en la model card de Hugging Face del modelo original |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | KV fija de 2048 tokens en este paquete (reconstruible a 4096 con `pipeline/build_ane.py --kv 4096`); prefill en ventanas de 256 tokens |
| Tipos de cuantizacion | Decode en fp16 (Core ML); prefill en int4 (ONNX); embeddings de tokens en int8; torre de visión en fp32 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (Core ML), `.onnx` + `.data` (ONNX), `.npy` (embeddings int8), `.npz` (tablas de posiciones y rope) |

## Arquitectura y entrenamiento

El modelo base Xiaomi-OCR-0 es un VLM unificado de 0,8B para parsing de documentos y comprensión centrada en OCR. Parte de Qwen3.5-0.8B y se entrena sobre un corpus de aproximadamente 170 millones de muestras con anclaje de texto Q-Mask, preentrenamiento continuado (CPT) y aprendizaje por refuerzo de tareas mixtas (Mix-RL). La arquitectura combina capas de atención completa con capas de atención lineal basadas en gated-delta-rule, lo que reduce el coste del contexto largo pero complica la exportación a aceleradores con repertorio de operadores limitado.

Este paquete concreto no modifica los pesos ni realiza fine-tuning: reimplementa el grafo de decodificación como un `mlprogram` fp16 con formas estáticas, capacidad KV fija y 48 tensores de estado como entrada/salida. Para sortear las limitaciones del conversor de Core ML, el autor reexpresa la actualización de la regla delta y el reensamblado de frecuencias mrope como operaciones tensoriales puras, evita operaciones in-place rechazadas por Core ML (`aten::copy_`), fija todos los enteros de reshape en Python y añade dos salidas dummy cada cuatro capas para corregir una deriva de ~40 logits introducida por el conversor. La verificación reportada es que los tokens greedy coinciden con la ruta de torch (32/32 en una página de caligrafía) y los logits difieren en ~0,05 por el fp16.

## Capacidades

- Extracción de texto (OCR) en imágenes de documentos, con soporte de parsing estructurado de páginas.
- Comprensión imagen-texto a texto (`image-text-to-text`) orientada a documentos, recibos, formularios y páginas escaneadas.
- Generación autoregresiva de tokens con decodificación greedy verificada contra la implementación de referencia en torch.
- Procesamiento de imágenes de hasta 496 patches en las pruebas reportadas; la ANE rechaza más de 2304 patches (`status=0x16`).
- Capacidades multilingües limitadas a inglés y chino según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicionales: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de recibos y facturas en macOS: el runner `xocr_ane.py` procesa una imagen con un prompt de extracción y devuelve el texto junto con estadísticas de decodificación; encaja en flujos locales de contabilidad sin enviar documentos a la nube.
- Parsing de documentos escaneados en aplicaciones de escritorio para Apple Silicon: el paquete permite integrar OCR en una app nativa usando Core ML para el decode y ONNX Runtime para visión y prefill, con la CPU libre durante la generación.
- Procesamiento por lotes de páginas en un Mac con M1 Pro o superior: con 18,2 tok/s a KV=2048 y 4,3 s de prefill por página de 517 tokens, un lote de cientos de páginas es viable en local, aunque conviene medir el throughput real en el hardware objetivo.
- Extracción de texto en documentos largos: reconstruyendo el paquete con `pipeline/build_ane.py --kv 4096` se amplía la ventana KV para páginas con más de 2048 tokens de prompt más salida.
- Prototipado e investigación sobre aceleración ANE: el directorio `pipeline/` contiene los grafos Core ML y el script de construcción, útiles para estudiar la exportación de atención híbrida a la Neural Engine y completar el prefill en ANE que el autor dejó sin publicar.
- Aplicaciones con restricciones de consumo energético: al ejecutar el decode en la ANE, el consumo baja y la CPU queda disponible para otras tareas del sistema, lo que resulta adecuado en portátiles con batería.
- Integración en pipelines de documentos en inglés o chino: el modelo cubre ambos idiomas, por lo que sirve para digitalización bilingüe de contratos, informes o correspondencia.

## Benchmarks y rendimiento

Mediciones del autor en un M1 Pro de 16 núcleos ANE con macOS 26:

| Etapa | Este paquete (ANE) | Solo CPU (ONNX int4) |
|---|---|---|
| Visión (496 patches) | 2,1 s | 2,0 s |
| Prefill (página de 517 tokens) | 4,3 s | 4,1 s |
| Decode, KV=2048 | 18,2 tok/s (55 ms/paso) | ~20 tok/s |
| Decode, KV=1024 | 24,5 tok/s (40,8 ms/paso) | ~20 tok/s |

El propio autor advierte de que en un M1 Pro la ANE no supone una gran ventaja (≈1,2× a KV=1024 y paridad a KV=2048), porque el grafo se compone de ~1000 operaciones pequeñas por token y el coste lo dominan el despacho de kernels y el tráfico de pesos; las copias de estado host↔device cuestan ~1 ms. El prefill en ANE se construyó y verificó (198 ms por ventana de 256 tokens frente a ~1100 ms en CPU, con diferencia máxima de logits de 0,05 y argmax idéntico), pero no se publica porque la regla delta fragmentada requiere una resolución triangular que Core ML no ofrece.

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (M1 o superior); las pruebas se hicieron en un M1 Pro de 16 núcleos ANE.
- Tamaño del paquete: 2,8 GB en el repositorio, con 1506 MB para el `mlpackage` de decode, 588 MB para el prefill ONNX int4, 396 MB para la visión ONNX fp32 y 255 MB para los embeddings int8.
- VRAM: no disponible; el paquete usa memoria unificada del SoC, no VRAM discreta.
- GPU recomendadas: no aplica; el decode va a la ANE y el resto a CPU. No se documenta soporte para GPU NVIDIA ni AMD.
- Cabe en consumer GPU: no aplica en el sentido habitual; el paquete está pensado para Macs con memoria unificada, y el autor indica que ANE más grandes (M3/M4 Pro/Max) deberían mejorar la relación de rendimiento.
- Opciones de despliegue: runner propio `xocr_ane.py` (numpy + onnxruntime + coremltools); no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 55 ms por paso a KV=2048 y 40,8 ms a KV=1024; 4,3 s de prefill por página de 517 tokens y 2,1 s de visión para 496 patches en M1 Pro.
- Requisito de prompt: prompt más `max_new_tokens` deben caber en la capacidad KV configurada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-OCR-0-ane | 0,8B | KV 2048 (reconstruible a 4096) | 18,2 tok/s decode en M1 Pro (KV=2048) | Apache-2.0 | Hugging Face (Core ML + ONNX) |
| Xiaomi-OCR-0 (base) | 0,8B | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Xiaomi-OCR-0-onnx-int4 | 0,8B | no disponible | ~20 tok/s decode en CPU (M1 Pro) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks del modelo base ni de otros modelos comparables de OCR en la información proporcionada, por lo que la comparación se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no se documenta cobertura de otros idiomas, incluido el castellano.
- Ventana KV fija de 2048 tokens en el paquete publicado; documentos más largos requieren reconstruir el grafo con `--kv 4096` (cada build ocupa ~1,5 GB).
- La ganancia de rendimiento frente a CPU es pequeña en M1 Pro (≈1,2× a KV=1024, paridad a KV=2048); el beneficio principal es liberar CPU y reducir consumo, no acelerar.
- La ANE rechaza imágenes de más de 2304 patches (`status=0x16`) y es más lenta que la CPU por encima de ~1024 patches.
- El prefill en ANE no está publicado; solo se incluyen las piezas en `pipeline/` para quien quiera terminarlo.
- Dependencia de un conversor Core ML con bugs conocidos: el autor tuvo que añadir salidas dummy cada cuatro capas para evitar una deriva de ~40 logits.
- Verificación limitada: coincidencia greedy comprobada en 32/32 tokens sobre una única página de caligrafía; no hay evaluación exhaustiva publicada.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al ser un modelo OCR, la fidelidad de la transcripción debe validarse en producción.
- Licencia Apache-2.0 en el paquete y en los pesos base, lo que permite uso comercial; el autor declara que no se modificó el repositorio base.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 7 de noviembre de 2026; no hay evidencia de uso en producción.
- Repositorio mantenido por un autor individual (`androidli`, atribuido a @greatYiTin), no por Xiaomi Research; el soporte y las actualizaciones no están garantizados.

## Enlaces

- Paquete ANE en Hugging Face: https://huggingface.co/androidli/Xiaomi-OCR-0-ane
- Modelo base en Hugging Face: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Paquete ONNX int4 hermano: https://huggingface.co/androidli/Xiaomi-OCR-0-onnx-int4
- Repositorio GitHub del modelo base: https://github.com/xiaomi-research/Xiaomi-OCR-0
- Perfil del autor en X: https://x.com/greatYiTin

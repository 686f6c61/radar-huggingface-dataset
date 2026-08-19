# fraQtl/fraqtl-sm80-runtime

## Resumen

fraQtl SM80 runtime es un artefacto de verificación, no un modelo de lenguaje: se trata de un wheel binario precompilado del runtime vLLM de fraQtl AI Research, publicado para que cualquier investigador pueda reproducir de forma independiente los recibos de compresión de KV-cache de fraQtl en una GPU A100 alquilada por aproximadamente 15 dólares. El paquete incluye el kernel CUDA de fraQtl compilado como binario SM80 (A100) y la capa de integración con vLLM en Python, pero no distribuye ni el código fuente del kernel ni el código de calibración o de cálculo de eigenbases.

El problema que resuelve es el de la reproducibilidad y auditoría de resultados de compresión de KV-cache: fraQtl publica afirmaciones de rendimiento (p. ej. compresión D2 vs fp16 vs fp8) y este runtime permite a terceros verificarlas sin acceso al código propietario. Está pensado exclusivamente para hardware A100 (SM80), con versiones fijas de vLLM 0.20.2, CUDA 12.4 y Python 3.11. No es un lanzamiento de propósito general, sino una herramienta de verificación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel CUDA compilado para SM80 (A100) + capa de integración vLLM en Python |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo que se verifique; el script de prueba cubre 8K y 32K) |
| Tipos de cuantizacion | no disponible (el runtime compara contra fp16 y fp8-KV, pero no es un modelo cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | fraqtl-verification (propietaria; libre para instalar y ejecutar con fines de verificación y evaluación; prohibida la ingeniería inversa) |
| Formato de pesos | Wheel Python binario (contiene `fraqtl/_native/libggml-cuda.so` y módulos Cython compilados) |
| Hardware objetivo | A100 (SM80) únicamente; no funciona en H100, L4 ni GPUs de consumo |
| Entorno de ejecución | vLLM 0.20.2, CUDA 12.4, Python 3.11 |
| Tamano del repositorio | 1.0 GB |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un runtime de inferencia especializado. El artefacto contiene un kernel CUDA compilado para SM80 (A100) que implementa la compresión de KV-cache propietaria de fraQtl, junto con una capa de integración con vLLM que incluye el backend de atención, adaptadores de modelo y lectores de sidecar. Esta capa Python debe permanecer trazable por `torch.compile`, ya que el motor de vLLM dimensiona el pool de KV en función de esa trazabilidad. El código de calibración y de cálculo de eigenbases no se incluye en el wheel en ninguna forma: los módulos restantes del runtime están compilados como binarios Cython.

El paquete se registra automáticamente como plugin de vLLM mediante el entry point `vllm.general_plugins`, de modo que al instalar el wheel, el cargador de plugins de vLLM encuentra el backend en cada proceso worker. El script de reproducción (`fraqtl_repro_receipts.py`) instala el wheel, descarga los sidecars calibrados del repositorio `fraQtl/mistral-7b-instruct-v0.3-kv-sidecars` y ejecuta el experimento de tres brazos (fraQtl D2 vs fp16 vs fp8-KV) a longitudes de contexto de 8K y 32K, con una compuerta needle-in-a-haystack (NIAH) por brazo.

## Capacidades

- Verificación independiente de recibos de compresión de KV-cache publicados por fraQtl.
- Ejecución del experimento de tres brazos: compresión fraQtl D2, KV-cache fp16 y KV-cache fp8.
- Prueba de calidad mediante needle-in-a-haystack (NIAH) a contextos de 8K y 32K.
- Integración automática con vLLM como plugin (`vllm.general_plugins`), sin configuración manual.
- Reproducción de resultados en un A100 alquilado con un solo comando (`modal run fraqtl_repro_receipts.py`).
- Generación de una tabla comparativa de rendimiento entre los tres brazos del experimento.
- Auditoría de la procedencia del build mediante `wheel_build_receipt.json` (sha256, auditoría de fugas de código fuente, lista de módulos).

## Casos de uso

- Auditoría de resultados de compresión de KV-cache: un investigador puede verificar de forma independiente las afirmaciones de fraQtl sobre la calidad de su compresión D2 frente a fp16 y fp8, alquilando un A100 y ejecutando el script de reproducción.
- Validación de reproducibilidad en entornos de producción: equipos que evalúen adoptar la compresión de fraQtl pueden ejecutar el experimento NIAH para confirmar que los resultados publicados se mantienen en su propia configuración.
- Comparación de calidad de KV-cache a contexto largo: el script cubre 8K y 32K, lo que permite evaluar la degradación de calidad al aumentar la longitud de contexto en cada brazo.
- Integración en pipelines de CI/CD para verificación continua: el wheel puede instalarse en un runner con GPU A100 y ejecutarse automáticamente cada vez que fraQtl publique nuevos recibos.
- Investigación en compresión de atención: aunque el kernel no es de código abierto, el runtime permite a investigadores externos medir el impacto de la compresión en tareas de recuperación de información (NIAH).
- Evaluación de coste-beneficio de hardware: al estar limitado a A100, sirve para decidir si la compresión justifica el uso de esa GPU frente a alternativas más económicas sin soporte SM80.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un script de reproducción que genera una tabla comparativa de tres brazos (fraQtl D2 vs fp16 vs fp8-KV) con compuerta NIAH a 8K y 32K, pero los valores numéricos de esa tabla no se proporcionan en la documentación pública. Las notas de medición indican que la verificación es NIAH-based, no "lossless", y que las filas de velocidad publicadas corresponden a decode con batch-1.

## Requisitos de hardware

- GPU exclusiva: A100 (SM80). El binario no se ejecuta en H100, L4 ni GPUs de consumo.
- VRAM: no especificada, pero el experimento se ejecuta sobre Mistral-7B-Instruct-v0.3 con contextos de 8K y 32K; se recomienda una A100 con al menos 40 GB.
- Despliegue en la nube: el script oficial usa Modal (`pip install modal && modal setup`) y alquila un A100 por aproximadamente 15 dólares por ejecución.
- Entorno de software fijo: vLLM 0.20.2, CUDA 12.4, Python 3.11. Otras versiones no están soportadas.
- No requiere compilación local: el wheel es precompilado; la instalación es directa con `pip install`.
- Latencia y throughput: no disponibles; el runtime no publica métricas de rendimiento fuera del script de reproducción.

## Comparativa con modelos similares

No disponible. Este artefacto no es un modelo de lenguaje ni un runtime de propósito general comparable a otros. Su única función es verificar los recibos de compresión de KV-cache de fraQtl en hardware A100. No existen alternativas equivalentes en el ecosistema que ofrezcan el mismo kernel propietario compilado para SM80.

## Limitaciones y advertencias

- Compatibilidad de hardware extremadamente restringida: solo A100 (SM80); no funciona en H100, L4, RTX 4090 ni ninguna GPU de consumo.
- Versiones de software fijas: vLLM 0.20.2, CUDA 12.4 y Python 3.11 son obligatorios; cualquier otra combinación no está soportada.
- Licencia propietaria con restricciones: se permite instalar y ejecutar para verificación y evaluación, pero está prohibida la ingeniería inversa del binario.
- Ausencia de código fuente: el kernel y la calibración no se distribuyen; la verificación es de caja negra.
- Alcance limitado: no es un modelo de lenguaje y no puede generar texto; su único propósito es ejecutar el experimento de tres brazos.
- Riesgo de interpretación errónea: la verificación es NIAH-based, no una garantía de "lossless"; los resultados pueden no generalizar a otras tareas o distribuciones.
- Sin soporte de la comunidad: al ser un artefacto de verificación con una ventana de soporte estrecha, no se ofrecen garantías de mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fraQtl/fraqtl-sm80-runtime
- Organización fraQtl en HuggingFace: https://huggingface.co/fraQtl
- Repositorio de sidecars calibrados: https://huggingface.co/fraQtl/mistral-7b-instruct-v0.3-kv-sidecars
- Organización fraQtl en GitHub: https://github.com/fraqtl-ai
- Repositorio de diagnóstico (fingerprint de compresión): https://github.com/fraqtl-ai/fraqtl-diagnostic

# HCHs/RivetCoder-9B-A4B

## Resumen

RivetCoder-9B-A4B es un modelo experimental de generación de texto orientado a código, desarrollado por HCHs. Combina dos arquitecturas existentes: utiliza el modelo `LiquidAI/LFM2.5-2.6B` como host congelado (30 capas) y añade 480 bloques feed-forward congelados extraídos de `zai-org/GLM-5.3-Flash` como expertos enrutados. El resultado es un modelo de mezcla de expertos (MoE) con enrutamiento por token, donde se activan 4 expertos por token de entre 16 candidatos por capa.

El modelo está diseñado para mejorar las capacidades de generación de código del host original, aprovechando los expertos de GLM sin reentrenar los pesos principales. El enrutamiento se entrenó con un pequeño conjunto de datos generado por Qwen como profesor, usando solo 60 pasos de optimización. Es un experimento de fusión de modelos que requiere código personalizado de Transformers y debe cargarse con `trust_remote_code=True`.

La relevancia actual radica en explorar técnicas de fusión de modelos MoE sin entrenamiento completo, aunque su carácter experimental y la falta de benchmarks estandarizados limitan su uso en producción. El checkpoint ocupa unos 16,3 GiB en BF16 y tiene aproximadamente 8,74 mil millones de parámetros totales, con unos 4,21 mil millones activos por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con enrutamiento por token (top-4 de 16 candidatos por capa) |
| Parametros totales | 8.738.041.342 (~8,74B) |
| Parametros activos | ~4,21B (por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (con partes en FP32 mixto) |
| Idiomas soportados | ingles, coreano, codigo |
| Licencia | lfm-open-license-v1.0 (con restricciones comerciales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura híbrida de mezcla de expertos. El host es `LiquidAI/LFM2.5-2.6B`, un transformer de 30 capas que permanece congelado. Sobre cada capa del host se añaden 16 expertos feed-forward (FFN) derivados de `zai-org/GLM-5.3-Flash`, con forma plegada 2048 → 2048 → 2048. En total hay 480 expertos candidatos, de los cuales se seleccionan 4 por token mediante un mecanismo de enrutamiento top-k.

El puente entre las representaciones del host y los expertos donantes es una matriz determinista `P = [I; H] / sqrt(2)`, donde `H` es una matriz de Hadamard de orden 2048 normalizada y permutada. Este puente está plegado dentro de los pesos de los expertos y del router, por lo que no existe como módulo en tiempo de ejecución. La corrección post-sigmoide de selección de expertos de GLM se conserva como un buffer congelado que afecta solo a la selección top-k, no a los pesos de mezcla.

El entrenamiento se limitó a los controles de enrutamiento: pesos del router, gates de token y escalas residuales acotadas. Se usaron 20 conversaciones de código para entrenamiento, 4 de validación y 8 de control genérico, con pérdida causal solo en tokens de asistente, más una pérdida KL contra el host congelado y supresión de gates genéricos. El proceso duró 60 pasos de optimización. El host congelado permanece bit a bit idéntico tras el entrenamiento.

## Capacidades

- Generación de código en múltiples lenguajes: Python, TypeScript, Go, Rust, Java, C++ y SQL, según el perfilado del router.
- Razonamiento conversacional y asistencia en tareas de programación, usando la plantilla de chat de LFM.
- Soporte de agentes (etiqueta "agentic"): puede integrarse en flujos de razonamiento multi-paso, aunque no se documenta tool calling explícito.
- Capacidades multilingües limitadas: inglés, coreano y código.
- Modo de comparación: permite desactivar los expertos de código con `model.set_coding_enabled(False)` para ejecutar el host LFM sin modificaciones.
- Enrutamiento adaptativo por token: selecciona 4 de 16 expertos por capa según la entrada, lo que puede mejorar la eficiencia computacional.

## Casos de uso

- Asistente de programación en IDE: el modelo puede generar fragmentos de código, completar funciones y sugerir implementaciones en tiempo real. Su enrutamiento por token permite activar expertos especializados según el lenguaje detectado, aunque la falta de benchmarks limita la confianza en la calidad.
- Refactorización de código legacy: dado un bloque de código existente, puede proponer versiones más limpias o migrar entre lenguajes (por ejemplo, de Python a TypeScript), gracias a los expertos entrenados en múltiples lenguajes.
- Generación de pruebas unitarias: puede crear casos de prueba concisos para funciones dadas, como se muestra en el ejemplo de la model card (LRU cache en Python).
- Educación en programación: explicar conceptos de código, depurar errores y mostrar ejemplos correctos, aprovechando su capacidad conversacional y de razonamiento.
- Prototipado rápido de scripts: generar scripts de automatización o utilidades en shell, Python o Go, con un contexto de entrada corto y salidas de hasta 512 tokens en el ejemplo.
- Evaluación de técnicas de fusión de modelos: para investigadores interesados en combinar MoE existentes sin entrenamiento completo, este modelo sirve como caso de estudio de enrutamiento entrenado con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (HumanEval, MBPP, SWE-bench) en la informacion disponible. La model card solo reporta una evaluacion interna muy pequeña: en un conjunto de validación de 1.417 tokens de asistente, la pérdida de entropía cruzada pasó de 0,605825 (host sin expertos) a 0,601436 (modelo fusionado). Esta métrica no es comparable con benchmarks de código y no debe interpretarse como rendimiento real.

## Requisitos de hardware

- VRAM estimada: el checkpoint BF16/mixto FP32 ocupa aproximadamente 16,3 GiB. Una GPU con 16 GiB de VRAM puede ejecutarlo solo con offload a CPU o disco mediante `device_map="auto"`.
- GPU recomendadas: para inferencia completa en memoria, se necesitan GPUs con al menos 24 GiB de VRAM, como RTX 4090, A100 (40 GB) o H100 (80 GB). En GPUs de 16 GB (como RTX 4080 o A100 16GB) se requiere offload.
- Compatibilidad con GPU de consumo: sí, en RTX 4090 (24 GB) puede caber sin offload, pero con riesgo de quedarse corto en contextos largos. En GPUs de 12 GB o menos no es viable sin cuantización adicional, que no está disponible.
- Opciones de despliegue: al ser un modelo con código personalizado, solo se puede ejecutar con Transformers y `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI. La inferencia en CPU es sustancialmente más lenta por la falta de kernels especializados para grouped-GEMM.
- Latencia y throughput: no se han publicado datos. Dado el enrutamiento top-4 y la ausencia de kernels optimizados, se espera una latencia mayor que en modelos MoE estándar.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoría (fusión de MoE con enrutamiento entrenado). Como referencia, se comparan los modelos base:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| RivetCoder-9B-A4B | 8,74B totales, 4,21B activos | no disponible | Fusión LFM + GLM, MoE enrutado | lfm-open-license-v1.0 |
| LiquidAI/LFM2.5-2.6B | 2,6B | no disponible | Host original, denso | lfm-open-license-v1.0 |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | Donante de expertos, MoE | MIT |

La comparativa con otros modelos de código como DeepSeek-Coder o CodeLlama no es posible sin datos de benchmarks y con arquitecturas muy diferentes.

## Limitaciones y advertencias

- Modelo experimental: no es un checkpoint estándar de LFM2; usa código personalizado que puede no ser estable en producción.
- Sin benchmarks publicados: no hay resultados de HumanEval, MBPP ni SWE-bench, por lo que no se puede evaluar su calidad real de generación de código.
- Puente determinista no entrenado: la matriz Hadamard fija puede causar desajustes de representación entre el host y los expertos donantes, limitando la transferencia de conocimiento.
- Mapeo de capas por profundidad normalizada: no se basa en alineación de activaciones, lo que puede suboptimizar la colocación de expertos.
- Gating suave en inferencia: el umbral duro de 0,5 está desactivado porque los gates aprendidos no están calibrados, lo que puede activar expertos irrelevantes.
- Rendimiento en CPU: la ejecución en CPU es mucho más lenta que con kernels dedicados, lo que dificulta su uso en entornos sin GPU.
- Licencia restrictiva: la lfm-open-license-v1.0 no otorga derechos de uso comercial a entidades con ingresos anuales superiores a 10 millones de dólares. Revisar la licencia completa antes de cualquier uso comercial.
- Idiomas limitados: solo inglés, coreano y código; no hay soporte para español u otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HCHs/RivetCoder-9B-A4B
- Modelo base host: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo donante de expertos: https://huggingface.co/zai-org/GLM-5.3-Flash
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Licencia MIT de GLM: incluida en el repositorio como `licenses/GLM-MIT.txt`

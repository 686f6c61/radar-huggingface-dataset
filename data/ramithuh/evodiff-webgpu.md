# ramithuh/evodiff-webgpu

## Resumen

EvoDiff-webgpu es un port autónomo del modelo generativo de secuencias proteicas OA_DM_38M (EvoDiff-Seq 38M) al entorno WebGPU, desarrollado por el usuario ramithuh. No se trata de un modelo nuevo entrenado desde cero, sino de una reimplementación completa del checkpoint original de Microsoft Research (Alamdari et al.) que ejecuta toda la inferencia mediante compute shaders WGSL en el navegador, sin dependencias de npm, sin binarios nativos, sin WASM y sin runtime de inferencia externo. El motor incluye el embedding de tokens, la proyección de entrada, los 16 bloques residuales ByteNet, la LayerNorm final, el decodificador de 31 clases y el muestreo iterativo agnóstico al orden.

El modelo subyacente es un generador de secuencias de proteínas de tipo difusión discreta (order-agnostic diffusion) con arquitectura ByteNet convolucional dilatada, 37.890.327 parámetros en FP32 original y un vocabulario de 31 tokens que cubre los 20 aminoácidos estándar, ambigüedades y tokens especiales (GAP, STOP, MASK, START, PAD). Su relevancia actual radica en que demuestra que un modelo científico de tamaño medio puede desplegarse íntegramente en el cliente (navegador) con precisión mixta FP32/FP16/INT8, lo que abre la puerta a herramientas de diseño de proteínas ejecutables sin backend ni GPU dedicada en servidor.

El repositorio de Hugging Face ocupa 0,1 GB y contiene los pesos exportados junto con el código ES modules del motor WebGPU y una implementación de referencia en CPU. No hay pipeline declarado, ni licencia especificada en la ficha de HF, ni idiomas soportados, ni métricas de benchmarks publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteNet convolucional dilatada (16 bloques residuales), difusión discreta order-agnostic (OA-DM) |
| Parametros totales | 37.890.327 (199 tensores, originalmente FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitud de secuencia configurable en generación; el ejemplo usa 24 residuos) |
| Tipos de cuantizacion | FP32, FP16, INT8 (empaquetado 4 valores por u32, dequantizado en WGSL) |
| Idiomas soportados | no aplica (modelo de secuencias proteicas, no de lenguaje natural) |
| Licencia | no disponible en la ficha de HF; el checkpoint original es CC BY 4.0 y el código EvoDiff es MIT |
| Formato de pesos | pesos exportados propios (shards con verificación SHA-256); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional dilatada de tipo ByteNet con 16 bloques residuales y un schedule de dilatación `1,2,4,8,16,32,64,128,1,2,4,8,16,32,64,128`. Cada bloque aplica LayerNorm(1024) → GELU → Conv 1×1 1024→512 → LayerNorm(512) → GELU → Conv dilatada de anchura 5 (512→512) → LayerNorm(512) → GELU → Conv 1×1 512→1024 → suma residual. La convolución es de correlación cruzada con padding simétrico de ceros `2*dilation` y sin enmascaramiento causal. La proyección de entrada es una Conv1D `[1024,8,1]` sobre embeddings de dimensión 8, y la salida es una Conv1D `[31,1024,1]` que produce logits `[L,31]`. La LayerNorm usa varianza poblacional por posición con epsilon 1e-5. No hay codificación de timestep, dropout, decoder atado ni convolución causal.

El modelo es un generador de difusión order-agnostic: en cada paso visita una posición enmascarada una sola vez en orden aleatorio, vuelve a ejecutar la red completa, aplica softmax sobre la posición seleccionada y la desenmascara. El port preserva el comportamiento upstream de 21 categorías efectivas en el muestreo (`len(MSA_AAS)-6`), incluyendo `B`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el checkpoint original proviene de Alamdari et al. (Zenodo 8045076). La innovación técnica del port es la ejecución íntegra en WGSL con aproximación de erf con error absoluto inferior a 1,5e-7, acumulación F32 en GPU incluso en FP16/INT8, y verificación de integridad por SHA-256 de cada shard.

## Capacidades

- Generación de secuencias proteicas de novo en modo incondicional, muestreando residuos aminoacídicos uno a uno.
- Generación condicionada por motivo: permite fijar posiciones concretas (por ejemplo `####ACDE####`) y generar el resto de la secuencia alrededor de ellas.
- Forward pass directo que devuelve logits por posición (`[L,31]`) para análisis o scoring de secuencias.
- Muestreo iterativo order-agnostic con control de semilla determinista (replay mediante inverse-CDF en FP64).
- Ejecución en navegador vía WebGPU con selección de precisión (FP32, FP16, INT8) y liberación explícita de GPU.
- Lectura de pesos con caché configurable (Cache API u OPFS) y verificación de hashes, con soporte de uso offline.
- Exportación de secuencias generadas en formato FASTA desde la demo.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso en lenguaje natural: es un modelo específico de proteínas.

## Casos de uso

- Diseño de proteínas de novo en el navegador: un investigador puede generar secuencias candidatas sin instalar CUDA ni PyTorch, usando la demo estática servida en localhost y exportando los resultados en FASTA para su posterior validación in silico.
- Prototipado rápido de pipelines de generación condicionada: el modo de motivo fijo permite conservar epítopos o sitios activos conocidos y generar el resto de la secuencia, útil para explorar variantes en fases tempranas de diseño.
- Herramientas educativas y demos interactivas: al ejecutarse íntegramente en WebGPU sin dependencias, se puede incrustar en una página docente para ilustrar difusión discreta sobre secuencias biológicas en tiempo real.
- Scoring y análisis de secuencias existentes: el forward pass devuelve logits por posición que permiten calcular verosimilitudes o detectar posiciones atípicas en secuencias de proteínas.
- Despliegue en entornos con restricciones de privacidad: al no requerir backend, las secuencias no salen del dispositivo del usuario, lo que encaja en contextos con datos sensibles o sin conectividad (con caché OPFS precargada).
- Benchmarking de motores de inferencia WebGPU: sirve como caso de prueba reproducible para comparar precisión y latencia entre FP32, FP16 e INT8 en distintas GPU de consumidor.
- Integración en aplicaciones web de biología computacional: el API `createEvoDiffEngine` permite crear motores independientes para concurrencia y gestionar cancelación mediante `AbortSignal`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 37,9 M de parámetros, los pesos en FP32 ocupan aproximadamente 152 MB, en FP16 unos 76 MB y en INT8 unos 38 MB, a los que se suman activaciones y buffers de trabajo en F32.
- GPU recomendadas: cualquier GPU con soporte WebGPU; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc. no se mencionan).
- Compatibilidad con GPU de consumidor: previsiblemente sí por el tamaño del modelo, pero no se confirma en la información disponible.
- Opciones de despliegue: servidor estático sobre HTTPS o localhost (`npm run serve` abre la demo en `http://127.0.0.1:8080/demo/`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este runtime.
- Latencia y throughput: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvoDiff-webgpu (este) | 37,9 M | no disponible | WebGPU (WGSL) en navegador | no disponible en HF (checkpoint CC BY 4.0, código MIT) | Hugging Face |
| EvoDiff OA_DM_38M original | 37,9 M | no disponible | PyTorch | CC BY 4.0 (checkpoint) | Zenodo / GitHub microsoft/evodiff |
| Otros modelos de difusión proteica de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo específico de secuencias proteicas: no procesa lenguaje natural, código, imágenes ni audio.
- El vocabulario es sensible a mayúsculas y no inserta delimitadores; un token fuera del conjunto `ACDEFGHIKLMNPQRSTVWYBZXJOU-*#@!` producirá resultados inválidos.
- El muestreo usa 21 categorías efectivas (incluye `B`), no las 31 del decodificador; hay que tenerlo en cuenta al interpretar logits.
- La máscara de entrada opcional solo afecta a la convolución de anchura 5 de cada bloque; no enmascara caminos residuales ni infiere padding automáticamente.
- Las semillas de PyTorch nativo no son intercambiables con la semilla JS; la reproducibilidad exacta requiere el mecanismo de replay del port.
- Una misma instancia de motor rechaza llamadas concurrentes con `Engine busy`; la concurrencia exige motores separados.
- El uso offline requiere que el manifest y todos los shards estén previamente cacheados; los errores de cuota o seguridad de almacenamiento degradan a red.
- La licencia no está declarada en la ficha de Hugging Face; para uso comercial debe verificarse la licencia del checkpoint original (CC BY 4.0) y del código (MIT).
- No se han publicado evaluaciones de calidad de las secuencias generadas ni benchmarks en la información disponible; el riesgo de generar secuencias no plegables o no funcionales es inherente al modelo base y no está cuantificado aquí.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ramithuh/evodiff-webgpu
- Código EvoDiff (commit fijado): https://github.com/microsoft/evodiff/tree/33206e99446f799ec11cf6e57d66ffaec837be91
- Modelos de secuencias proteicas de Microsoft (commit fijado): https://github.com/microsoft/protein-sequence-models/tree/af695772c4a1c056d930c95ec7e6428aa042f5cd
- Checkpoint original (Zenodo): https://zenodo.org/records/8045076
- Configuración 38M: https://github.com/microsoft/evodiff/blob/33206e99446f799ec11cf6e57d66ffaec837be91/config/config38M.json
- Constructor del checkpoint: https://github.com/microsoft/evodiff/blob/33206e99446f799ec11cf6e57d66ffaec837be91/evodiff/pretrained.py
- Implementación ByteNetTime: https://github.com/microsoft/evodiff/blob/33206e99446f799ec11cf6e57d66ffaec837be91/evodiff/model.py
- ByteNetBlock / MaskedConv1d: https://github.com/microsoft/protein-sequence-models/blob/af695772c4a1c056d930c95ec7e6428aa042f5cd/sequence_models/convolutional.py
- Script de generación incondicional: https://github.com/microsoft/evodiff/blob/33206e99446f799ec11cf6e57d66ffaec837be91/evodiff/generate.py
- Script de generación condicionada: https://github.com/microsoft/evodiff/blob/33206e99446f799ec11cf6e57d66ffaec837be91/evodiff/conditional_generation.py

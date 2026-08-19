# EGD33/e8-snn-fhrr-waste

## Resumen

El modelo EGD33/e8-snn-fhrr-waste es un motor de computación neuromórfica experimental desarrollado por NEOMORPHIC INC., que combina geometría de retículo E8, redes neuronales de picos (SNN), representaciones holográficas reducidas en el dominio de la frecuencia (FHRR) y conjugación de fase óptica (OPC) para acelerar la inferencia de modelos de mezcla de expertos (MoE). Se presenta como una arquitectura de cómputo propietaria, con un puente denominado WASTE que actúa como caché de predicción de expertos mediante memoria asociativa holográfica. El modelo está publicado en HuggingFace con licencia neomorphic-proprietary, idioma inglés y pipeline "other", lo que indica que no es un modelo de lenguaje convencional sino un sistema de cómputo especializado.

La relevancia de esta propuesta radica en su enfoque multidisciplinar (neuromórfico, holográfico, cuántico-inspirado) para abordar la latencia y el coste de la inferencia en arquitecturas MoE. Sin embargo, al ser un proyecto propietario y sin código abierto, su validación externa es imposible. No se dispone de información sobre parámetros totales, contexto, cuantización o datos de entrenamiento, lo que limita cualquier evaluación rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SNN (LIF) + FHRR + OPC + retículo E8 + puente WASTE (MoE cache) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | neomorphic-proprietary (propietaria, todos los derechos reservados) |
| Formato de pesos | no disponible (librería custom) |

## Arquitectura y entrenamiento

La arquitectura se describe como un sistema en capas: un retículo E8 con 240 raíces en 8 dimensiones sirve como base para la representación del conocimiento; sobre él se apoya una capa SNN implementada con Norse/snntorch, con una tasa biológica objetivo del 9,2% y pasos de 32 microsegundos. La memoria holográfica FHRR realiza enlaces de fasores en 0,7 microsegundos y alcanza un rendimiento de 2,27 millones de operaciones por segundo, indexada mediante HNSW para recuperación O(log n). Un módulo de conjugación de fase óptica (OPC) proporciona corrección de errores con una fidelidad declarada de 0,999. El puente WASTE actúa como caché de predicción de expertos, proyectando una aceleración de 2 a 5 veces en inferencia MoE.

No se proporcionan datos sobre el proceso de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. La model card menciona un "calibración SNN" y un "self-test" pero sin detalles sobre los datos de entrenamiento. Toda la información es auto-reportada por el autor y no ha sido verificada externamente.

## Capacidades

- Memoria asociativa holográfica: almacena y recupera patrones complejos mediante representaciones de fasores en el dominio de la frecuencia, con indexación HNSW para búsqueda sublineal.
- Predicción de expertos en MoE: el puente WASTE predice qué expertos activar para una consulta dada, basándose en la recuperación FHRR, con el objetivo de reducir la carga computacional.
- Calibración de redes de picos: ajusta la tasa de disparo de neuronas LIF a un objetivo biológico (9,2%), lo que podría mejorar la eficiencia energética.
- Corrección de errores mediante conjugación de fase óptica: mantiene la fidelidad de la memoria a 0,999, evitando el olvido catastrófico.
- Cómputo neuromórfico multi-dispositivo: soporta una malla de cómputo con sincronización CRDT (según las reivindicaciones de patente).
- Integración con hardware Apple: utiliza Metal Performance Shaders (MPS) en procesadores Apple M5 Pro y M4 Pro, con un rendimiento declarado de 5.250 GFLOPS.

## Casos de uso

- Aceleración de inferencia en modelos MoE: el puente WASTE podría emplearse como caché predictiva para seleccionar expertos relevantes en tiempo real, reduciendo la latencia en sistemas de generación de lenguaje a gran escala.
- Memoria asociativa para bases de conocimiento: la combinación FHRR + HNSW permite almacenar y recuperar representaciones semánticas de alta dimensión con escalabilidad sublineal, útil para sistemas de búsqueda semántica.
- Cómputo de bajo consumo en edge: la naturaleza neuromórfica (SNN) y la tasa de disparo reducida (9,2%) podrían habilitar inferencia energéticamente eficiente en dispositivos con restricciones de batería.
- Corrección de errores en sistemas de memoria a largo plazo: el módulo OPC podría aplicarse en arquitecturas de aprendizaje continuo para mitigar el olvido catastrófico.
- Orquestación de cómputo soberano: según las reivindicaciones de patente, el sistema incluye un lenguaje de dominio específico (LUV) y verificación estructural (AMMA), orientado a entornos de cómputo distribuido con requisitos de integridad.
- Investigación en arquitecturas híbridas neuromórfico-holográficas: el modelo sirve como banco de pruebas para combinar paradigmas de representación no convencionales en IA.

Nota: estos casos de uso son inferencias a partir de la descripción del autor; no hay documentación de aplicaciones reales desplegadas.

## Benchmarks y rendimiento

La model card reporta métricas internas del sistema, pero no son benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, etc.). Se presentan a continuación los datos auto-reportados, sin validación externa:

| Metrica | Valor | Notas |
|---|---|---|
| FHRR throughput | 2,27 M ops/s | Operaciones de enlace/desenlace/superposición de fasores |
| SNN step | 32 μs/step | Neurona LIF con escala 3.0 |
| OPC fidelity | 0,999 | Conjugación de fase óptica |
| HNSW recall p50 | 184 μs | Índice sublineal hasta 100k+ entradas |
| MPS (Apple M5 Pro) | 5.250 GFLOPS | Rendimiento declarado de Metal Performance Shaders |

No se han publicado resultados en benchmarks estándar de modelos de lenguaje ni de razonamiento. La ausencia de datos de entrenamiento y de evaluación independiente impide cualquier comparación con modelos convencionales.

## Requisitos de hardware

- Hardware declarado: Apple M5 Pro (48 GB) y M4 Pro (48 GB) en configuración de malla.
- Aceleración: Metal Performance Shaders (MPS) en GPU de Apple.
- No se especifica VRAM mínima, ni GPUs de otras marcas (NVIDIA, AMD) compatibles.
- No se indica si es posible ejecutarlo en GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: no se mencionan frameworks como vLLM, llama.cpp u Ollama; el sistema usa Python 3.14, NumPy 2.5, PyTorch 2.13, Norse 1.1 y PennyLane 0.45.
- Latencia y throughput: solo se reportan las métricas internas de la tabla anterior; no hay datos de latencia de inferencia end-to-end.

## Comparativa con modelos similares

No disponible. No existe información pública sobre modelos comparables con esta arquitectura híbrida (SNN + FHRR + E8 + OPC). Los modelos MoE convencionales (como Mixtral, DeepSeek-MoE) no utilizan memoria holográfica ni cómputo neuromórfico, y no hay métricas estandarizadas que permitan una comparación directa. La licencia propietaria y la falta de código abierto impiden cualquier evaluación independiente.

## Limitaciones y advertencias

- Licencia propietaria: el modelo está bajo "neomorphic-proprietary", lo que impide su uso comercial o de investigación sin autorización expresa de NEOMORPHIC INC.
- Sin código fuente: no se publican los scripts de calibración ni el puente WASTE, solo se mencionan como archivos en la model card.
- Datos de entrenamiento no disponibles: se desconoce el corpus, el número de tokens y el proceso de optimización, lo que impide evaluar sesgos o alucinaciones.
- Validación externa nula: las métricas reportadas (fidelidad OPC, throughput FHRR, etc.) son auto-declaradas y no han sido verificadas por terceros.
- Riesgo de sobreajuste a hardware específico: el sistema está optimizado para Apple M5/M4 Pro, lo que limita su portabilidad.
- Sin documentación de uso real: no hay casos de producción ni estudios de caso que demuestren su eficacia en tareas concretas.
- Posible carácter especulativo: la combinación de conceptos (E8, holografía, óptica) sugiere un proyecto de investigación experimental, no un producto maduro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EGD33/e8-snn-fhrr-waste
- No se han encontrado papers, repositorios o demos adicionales en la búsqueda web (los resultados obtenidos no están relacionados con este modelo).

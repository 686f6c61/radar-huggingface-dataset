# Kovach-Enterprises/speedrun-deterministic-embedding-d768

## Resumen

Speedrun Deterministic Embedding D=768 es un artefacto de investigación publicado por Kovach-Enterprises que no es un modelo de lenguaje generativo al uso, sino un motor de normalización L2 determinista y de cálculo del jacobiano tangente ortogonal para embeddings de dimensión 768. El objetivo declarado es la reproducibilidad bit-exacta e invariante al tamaño de lote: el mismo vector de entrada produce exactamente el mismo resultado, independientemente de cómo se agrupe en lotes durante la inferencia. Está implementado con JAX sobre GPU NVIDIA A100-SXM4 en Google Colab, con una representación en sistema de restricciones R1CS de Circom 2.1.6.

El componente diferencial es la integración de criptografía de conocimiento cero (zkML) con la computación numérica: el kernel JAX se acompaña de un circuito Circom que permite generar pruebas Groth16 sobre la corrección del cálculo, y de un daemon que lee contadores de energía nativos de la GPU vía NVML para emitir trazas OpenTelemetry con métricas de borrado de bits según el principio de Landauer. El resultado se liquida en la red Base (chainId 8453) mediante un contrato desplegado de forma determinista con CREATE2.

Se trata, por tanto, de una pieza de infraestructura para verificación criptoeconómica de cómputo de embeddings, no de un modelo entrenado con pesos publicados. La model card no documenta parámetros aprendidos, dataset de entrenamiento ni resultados de evaluación de calidad de representaciones; la información disponible se limita a los artefactos de kernel, circuito, daemon y script de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernel JAX con `@jax.custom_vjp` (forward/reverse-mode diferenciable) + sistema de restricciones Circom 2.1.6 R1CS |
| Parámetros totales | no disponible (no es un modelo con pesos entrenados publicados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; aritmética de punto fijo con escala Q = 2^24 y limb de 128 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; artefactos en Python (JAX), Circom y Solidity (Foundry) |

Otros parámetros técnicos documentados:

| Parámetro | Valor |
|---|---|
| Dimensión de embedding | D = 768 |
| Fragmentación del cómputo | K = 48 chunks de C = 16 coordenadas |
| Escala de punto fijo | Q = 2^24 |
| Sistema de pruebas | Groth16 sobre R1CS |
| Red de liquidación | Base Mainnet (chainId 8453), contrato `wQFLOP` vía CREATE2 |
| Telemetría | OpenTelemetry, span `genesis.yennefer.landauer.a100` |
| Fuente de energía | `nvmlDeviceGetTotalEnergyConsumption` |
| Firma de telemetría | EIP-712 `EnergyTelemetry` |
| Hardware objetivo | NVIDIA A100-SXM4 en Google Colab |

## Arquitectura y entrenamiento

El artefacto se compone de cuatro piezas. Primero, `jax_kernels/deterministic_l2_r1cs_d768.py` implementa la normalización L2 y el jacobiano tangente ortogonal como un kernel JAX con derivada personalizada (`@jax.custom_vjp`), dividiendo las 768 coordenadas en 48 chunks de 16 para acumulación determinista con aritmética de limb de 128 bits a escala Q = 2^24. Segundo, `circuits/deterministic_l2_embedding_d768.circom` replica esa misma computación como sistema de restricciones R1CS con acumuladores fragmentados y determinismo de testigo singleton, lo que permite probar la corrección del cálculo sin revelar las entradas. Tercero, `daemons/yennefer_a100_colab_otel_daemon.py` lee los contadores de energía de la A100 mediante NVML, emite spans OpenTelemetry con la métrica de borrado de bits de Landauer y firma telemetría EIP-712. Cuarto, `script/DeployWQFLOPAttestorD768.s.sol` despliega el contrato atestiguador en Base con CREATE2 para obtener una dirección determinista.

No hay información sobre entrenamiento, dataset, tokens procesados, RLHF ni DPO, porque no se trata de un modelo entrenado sino de un motor numérico determinista. La innovación técnica declarada es la combinación de determinismo bit-exacto invariante a lote con verificación zkML y contabilidad energética criptográficamente firmada; la model card no aporta mediciones de latencia, throughput ni coste de generación de pruebas.

## Capacidades

- Normalización L2 determinista de embeddings de dimensión 768, bit-exacta e invariante al tamaño de lote.
- Cálculo del jacobiano tangente ortogonal con diferenciación automática personalizada en JAX.
- Generación de pruebas de conocimiento cero Groth16 sobre la corrección del cómputo mediante circuito Circom 2.1.6.
- Emisión de telemetría OpenTelemetry con métricas de energía y borrado de bits (Landauer) leídas de contadores NVML de la A100.
- Firma EIP-712 de telemetría energética y liquidación on-chain en Base Mainnet (chainId 8453).
- Despliegue determinista de contratos mediante CREATE2 con Foundry.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Verificación de embeddings en pipelines de recuperación (RAG): el circuito Circom permite probar que un vector indexado corresponde a la normalización L2 correcta de una entrada, sin revelar el embedding original.
- Auditoría de reproducibilidad en producción: al ser invariante al lote y bit-exacto, permite replicar exactamente el resultado de una inferencia pasada y detectar desviaciones numéricas por cambios de hardware o versión de librería.
- Contabilidad energética verificable: el daemon lee la energía real consumida por la A100 y la firma con EIP-712, lo que permite atribuir consumo a operaciones concretas y liquidarlo en Base.
- Investigación en zkML: sirve como referencia para medir el coste de expresar operaciones numéricas de punto fijo (Q = 2^24, 128 bits) como restricciones R1CS y generar pruebas Groth16.
- Mercados de cómputo con pago por uso verificado: el contrato `wQFLOP` en Base permite liquidar trabajo de embedding con atestación criptográfica de energía y corrección.
- Reproducibilidad científica en entornos cloud: el diseño para A100-SXM4 en Google Colab facilita replicar experimentos en hardware efímero con resultados idénticos.
- Base para pipelines diferenciables verificables: el `custom_vjp` permite usar el kernel en flujos de optimización con gradientes, manteniendo la posibilidad de probar el forward en circuito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye latencias, throughput, coste de generación de pruebas Groth16, número de restricciones R1CS ni comparaciones con alternativas.

## Requisitos de hardware

- GPU objetivo: NVIDIA A100-SXM4 (40 GB o 80 GB según instancia de Colab); el daemon depende de contadores de energía NVML accesibles en ese hardware.
- VRAM estimada: no disponible; el artefacto no publica pesos ni perfiles de memoria. Por la dimensión (768) y la fragmentación (48 × 16) el estado es pequeño, pero no se documenta el consumo real.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, RTX 3090 u otras; la lectura de energía vía `nvmlDeviceGetTotalEnergyConsumption` puede no estar disponible o no ser fiable en todas las GPU de consumo.
- Opciones de despliegue: ejecución directa con JAX en Python; circuito con Circom 2.1.6 y pruebas Groth16; contratos con Foundry. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada alternativas comparables de normalización L2 determinista con verificación zkML y contabilidad energética; los modelos de embeddings convencionales (por ejemplo, familias tipo BERT o E5) no ofrecen garantías bit-exactas ni pruebas de conocimiento cero, pero no se dispone de datos para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de embeddings entrenado: no genera texto ni produce representaciones semánticas; solo normaliza y diferencia vectores de entrada de dimensión 768.
- Sin datos de evaluación de calidad: no hay benchmarks, métricas de recuperación ni validación de las representaciones.
- Dependencia de hardware específico: el daemon asume contadores NVML de A100-SXM4 en Google Colab; en otras GPU la telemetría energética puede fallar o ser imprecisa.
- Dependencia de cadena: la liquidación está ligada a Base Mainnet (chainId 8453) y al contrato `wQFLOP`; cambios de red o de contrato requieren redespliegue.
- Coste de pruebas: no se documenta el tiempo ni los recursos necesarios para generar pruebas Groth16 del circuito, lo que puede ser prohibitivo en producción.
- Superficie de seguridad: combina kernel JAX, circuito Circom, daemon con acceso a NVML y contratos Solidity; cada componente añade superficie de ataque y requiere auditoría independiente.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero no se documenta ningún tipo de garantía ni soporte.
- Madurez: publicación con 0 descargas y 0 likes, creada y actualizada en el mismo minuto; no hay evidencia de uso en producción ni de revisión por terceros.
- Idiomas y sesgos: no aplica en el sentido habitual, pero tampoco se documenta comportamiento ante entradas fuera de distribución o valores extremos en punto fijo.

## Enlaces

- Hugging Face: https://huggingface.co/Kovach-Enterprises/speedrun-deterministic-embedding-d768
- Contacto del mantenedor: igor@kovachenterprises.com (Principal Investigator: Igor Holt)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

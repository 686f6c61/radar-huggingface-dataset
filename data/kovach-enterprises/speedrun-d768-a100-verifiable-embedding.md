# Kovach-Enterprises/speedrun-d768-a100-verifiable-embedding

## Resumen

`speedrun-d768-a100-verifiable-embedding` es un artefacto de inferencia e ingeniería de verificación publicado por Kovach Enterprises LLC (Genesis Conductor Engine), bajo autoría de Igor Holt. No es un modelo de lenguaje generativo al uso: se trata de un pipeline de normalización L2 de embeddings de dimensión D=768 con paridad bit a bit frente a un sistema de restricciones R1CS implementado en Circom 2.1.6, pensado para su uso en pruebas de conocimiento cero (zkML) y liquidación de rendimiento `wQFLOP` en Base Mainnet (Chain ID 8453).

El componente central es un kernel JAX (`jax_kernels/deterministic_l2_r1cs_d768.py`) que trocea el vector de 768 dimensiones en C=16 chunks de K=48 dimensiones para evitar desbordamiento de `uint64`, acumula la suma de cuadrados en un acumulador de 128 bits `(S_hi, S_lo)`, ejecuta una división restauradora de 128 bits y calcula una raíz cuadrada entera bit a bit de 32 pasos. El resultado es una normalización L2 y un paso hacia atrás de Jacobiano tangente ortogonal (`@jax.custom_vjp`) que puede reproducirse exactamente fuera de la GPU y comprobarse on-chain.

El interés del artefacto reside en su orientación a verificabilidad criptográfica y contabilidad energética, no en capacidades de modelado. Incluye un demonio de telemetría (`daemons/yennefer_a100_otel_daemon.py`) que mide consumo energético vía NVML en A100, temperatura de unión en Kelvin, cota teórica de Landauer y FLOPs por julio, además de recibos de liquidación en Base L2. La información pública disponible no documenta parámetros de un modelo neuronal subyacente, corpus de entrenamiento ni benchmarks de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kernel JAX de normalización L2 determinista y VJP personalizado (`@jax.custom_vjp`) sobre embeddings D=768; sistema de restricciones R1CS Circom 2.1.6 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto de código JAX/Circom; no se documentan pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card no corresponde a una red neuronal transformer ni a un modelo híbrido, sino a una primitiva numérica determinista. El kernel trocea el embedding de dimensión 768 en 16 chunks de 48 dimensiones, de modo que la suma de cuadrados de cada chunk encaja estrictamente en `uint64` sin desbordamiento. Los 16 chunks se pliegan en un acumulador exacto de 128 bits `(S_hi, S_lo)`, sobre el que se ejecuta una división restauradora de 128 bits (`⌊2^72 / S⌋`) y una raíz cuadrada entera bit a bit de 32 pasos (`r = ⌊√(2^72 / S)⌋`). El paso hacia atrás se implementa como Jacobiano tangente ortogonal mediante `@jax.custom_vjp`, con paridad señal por señal frente al circuito Circom.

El circuito `circuits/deterministic_l2_embedding_d768.circom` impone restricciones R1CS a nivel de chunk: sumas asociativas `S_chunk[0..15]`, desigualdades de positividad y monotonía sobre `r`, y división euclídea con signo en las 768 coordenadas forward y backward. El objetivo declarado es que la ejecución en NVIDIA A100-SXM4 (40 GB u 80 GB, en Google Colab) sea bit-exacta e invariante al tamaño de batch, y que pueda verificarse on-chain contra el contrato de liquidación `wQFLOP` desplegado con Foundry (`script/DeployWQFLOPAttestor.s.sol`, `CREATE2`, Base Mainnet, Chain ID 8453).

No se documenta en la información disponible ningún proceso de entrenamiento, corpus de tokens, RLHF, DPO ni ajuste fino. El demonio `yennefer_a100_otel_daemon.py` instrumenta spans OpenTelemetry con temperatura de unión en Kelvin, cota de Landauer (`N_bits k_B T ln 2`), FLOPs por julio y recibos de liquidación en Base L2, lo que sitúa el artefacto en el ámbito de la contabilidad energética y la atestación criptográfica más que en el del aprendizaje automático convencional.

## Capacidades

- Normalización L2 determinista y bit-exacta de embeddings de dimensión D=768.
- Paso hacia atrás de Jacobiano tangente ortogonal reproducible mediante `@jax.custom_vjp`.
- Invariabilidad al tamaño de batch en la ejecución en A100 (40 GB y 80 GB).
- Generación de testigos y restricciones R1CS compatibles con Circom 2.1.6 para verificación zkML.
- Telemetría energética de GPU vía NVML (`nvmlDeviceGetTotalEnergyConsumption`) con spans OpenTelemetry.
- Cálculo de cota teórica de Landauer y métrica FLOPs por julio.
- Emisión de recibos de liquidación en Base Mainnet (Chain ID 8453) para rendimiento `wQFLOP`.
- Despliegue determinista de atestador mediante Foundry `CREATE2`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Verificación zkML de embeddings: el artefacto permite demostrar que una normalización L2 de un vector de 768 dimensiones se ejecutó correctamente, comparando la salida JAX en A100 con las restricciones R1CS de Circom 2.1.6, lo que resulta adecuado para pipelines que necesitan probar integridad de features sin revelar los datos.
- Atestación on-chain de inferencia: mediante el script Foundry y el contrato `wQFLOP` en Base Mainnet, se puede registrar un recibo de liquidación que vincula el resultado del kernel a una transacción verificable en Chain ID 8453.
- Contabilidad energética de inferencia: el demonio `yennefer_a100_otel_daemon.py` mide consumo real de la A100 vía NVML y lo contrasta con la cota de Landauer, útil para auditar eficiencia energética de cargas de extracción de features.
- Benchmarking de reproducibilidad numérica: el diseño de acumulador de 128 bits y raíz entera de 32 pasos sirve para validar que implementaciones en GPU y en circuitos producen resultados idénticos bit a bit, evitando discrepancias por coma flotante.
- Integración en pipelines de extracción de features: al declarar pipeline `feature-extraction`, el artefacto puede insertarse en flujos que generan embeddings D=768 y necesitan normalización certificable antes de su uso downstream.
- Investigación en verificación de operaciones no lineales: la división restauradora de 128 bits y la raíz cuadrada bit a bit documentadas constituyen una referencia para construir circuitos R1CS de operaciones tradicionalmente costosas de aritmetizar.
- Auditoría de despliegues en L2: el despliegue determinista con `CREATE2` permite reproducir direcciones de contrato y verificar que el atestador desplegado corresponde al código publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU objetivo declarada: NVIDIA A100-SXM4, en variantes de 40 GB y 80 GB, en entorno Google Colab.
- VRAM estimada para inferencia: no disponible; el artefacto opera sobre vectores D=768 y no documenta huella de memoria de un modelo neuronal.
- GPU recomendadas: A100-SXM4-40GB y A100-SXM4-80GB según la model card.
- Compatibilidad con GPU de consumo (RTX 4090 u otras): no disponible; la instrumentación NVML y las métricas energéticas están descritas para A100.
- Opciones de despliegue: ejecución JAX sobre A100, compilación de circuitos con Circom 2.1.6, despliegue de contratos con Foundry; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se documentan métricas de energía (FLOPs por julio) y cota de Landauer, sin cifras concretas.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (artefactos de verificación zkML de normalización de embeddings con paridad R1CS), ni ofrece parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- El artefacto no es un modelo de lenguaje: no se documentan parámetros, contexto, tokenizador ni corpus, por lo que no debe evaluarse como generador de texto.
- La paridad bit a bit declarada está acotada a Circom 2.1.6 y a la versión concreta del kernel JAX; cambios de versión pueden romper la equivalencia.
- La instrumentación energética y la cota de Landauer dependen de NVML y de la A100; su validez en otras GPU no está documentada.
- El despliegue on-chain se circunscribe a Base Mainnet (Chain ID 8453); no se documenta compatibilidad con otras redes.
- No se documentan sesgos, tasas de alucinación ni evaluación multilingüe, dado que no hay modelo generativo subyacente descrito.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan patentes, marcas ni condiciones adicionales del proyecto Genesis Conductor Engine.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la documentación pública es escasa; conviene tratar las afirmaciones de la model card como no auditadas de forma independiente.
- No se proporcionan pesos, checkpoints ni artefactos binarios descritos; la reproducibilidad depende de obtener el código JAX, el circuito Circom y los scripts Foundry referenciados.

## Enlaces

- Hugging Face: https://huggingface.co/Kovach-Enterprises/speedrun-d768-a100-verifiable-embedding
- Autor: Igor Holt, `igor@kovachenterprises.com`, ORCID `0009-0008-8389-1297` (según model card)
- Organización: Kovach Enterprises LLC / Genesis Conductor Engine (sin URL pública documentada)
- Referencias internas citadas en la model card: `jax_kernels/deterministic_l2_r1cs_d768.py`, `circuits/deterministic_l2_embedding_d768.circom`, `daemons/yennefer_a100_otel_daemon.py`, `script/DeployWQFLOPAttestor.s.sol` (sin URLs públicas disponibles)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

# MagistrTheOne/NULLXES-AMATERASU

## Resumen

NULLXES AMATERASU-32B v0.1 es un modelo fundacional de agencia encarnada (embodied agency) desarrollado desde cero por MagistrTheOne, bajo el sello NULLXES. Está diseñado para robótica e inteligencia física (physical AI), integrando percepción visual multi-cámara, audio, tacto, control motor y razonamiento de bajo nivel en una única arquitectura. Su formato nativo `amaterasu-ckpt-v1` no es compatible con Transformers ni con otros frameworks convencionales; debe cargarse mediante el mecanismo `resume_modules` de la librería AMATERASU.

El modelo cuenta con 31 740 290 560 parámetros (31,7 B) distribuidos en una arquitectura híbrida que combina un transformer jerárquico (HPT) con capas MoE, un encoder de visión de 36 capas, un sistema de circuitos neurales (NCES), un SSM, memoria latente y módulos específicos para dinámica y control. La versión v0.1 (denominada Circuit-0) se ha entrenado únicamente sobre el subconjunto de datos HiFi-UMI-2K, congelando todo el grafo excepto el encoder NCES. Su relevancia radica en ser un intento de modelo unificado de agencia física entrenado desde cero, con una licencia permisiva Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer jerárquico híbrido (HPT) con MoE, encoder de visión, NCES, SSM y módulos de control físico |
| Parametros totales | 31 740 290 560 |
| Parametros activos | No es un MoE puro; 8 expertos enrutados + 1 compartido con top-2 en la parte física (20 capas MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles (pesos en fp32, entrenamiento en bf16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (51 shards, fp32), formato nativo `amaterasu-ckpt-v1` |

## Arquitectura y entrenamiento

La arquitectura de AMATERASU-32B es un diseño modular y heterogéneo, organizado en torno a un bloque HPT (Hierarchical Processing Transformer) de 40 capas divididas en tres regímenes temporales: 12 capas "Fast" (frecuencia de reloj de 30-100 Hz), 8 capas "Slow" densas (2-5 Hz) y 20 capas "Physical MoE" con 8 expertos enrutados más un experto compartido, usando selección top-2. El modelo integra un encoder de visión de 36 capas que procesa hasta 6 cámaras a 224×224 píxeles, un encoder de audio, un módulo táctil, un sistema NCES (Neural Circuit Encoder System) de 6 capas con hasta 64 nodos, un SSM (state space model), memoria latente, módulos de dinámica latente, control basado en objetivos (EAC-GCIS), flujo (flow) y un decodificador de control de efector final (ECD). La atención es GQA con 32 cabezas de consulta, 8 cabezas de clave/valor y dimensión 128; el FFN usa SwiGLU con `d_ff=11008`. El vocabulario es de 65 536 tokens con embeddings y cabeza de lenguaje no compartidos.

El entrenamiento de la versión Circuit-0 se realizó exclusivamente sobre el dataset HiFi-UMI-2K (formato parquet, licencia CC BY 4.0), sin datos de vídeo y sin etiquetas de intención (hand motion no se considera ACT). Solo se entrenó el encoder NCES (274 490 880 parámetros), dejando congelado el resto del grafo. El entrenamiento se ejecutó en una única GPU NVIDIA H200 de 141 GB con autocast bf16, sin usar optimizador AdamW completo para los 32B. No se aplicaron técnicas de RLHF ni DPO en esta fase.

## Capacidades

- Percepción visual multi-cámara: procesa hasta 6 cámaras simultáneas a 224×224 píxeles con un encoder de 36 capas.
- Integración de múltiples modalidades: visión, audio, tacto y señales de bajo nivel (SSM, memoria latente) en un mismo modelo.
- Control de agentes físicos: módulos específicos para dinámica latente, control basado en objetivos (EAC-GCIS) y decodificación de control de efector final (ECD).
- Procesamiento temporal jerárquico: dos relojes internos (Slow 2-5 Hz y Fast 30-100 Hz) que permiten modelar dinámicas a distintas escalas temporales.
- Razonamiento de circuitos neurales (NCES): sistema de 6 capas con hasta 64 nodos para representar estados internos.
- Generación de lenguaje: módulo de FFN de lenguaje con 3,79 B parámetros, compatible con el vocabulario de 65 536 tokens.
- Soporte para tool calling y agentes: no se menciona explícitamente en la información disponible; la arquitectura sugiere capacidades de control, pero no hay confirmación de funciones de agente conversacional.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede procesar múltiples cámaras y señales táctiles para controlar brazos robóticos en tareas de ensamblaje o pick-and-place, gracias a su módulo ECD y dinámica latente.
- Navegación autónoma de robots móviles: la combinación de visión multi-cámara y SSM permite estimar estados y planificar trayectorias en tiempo real, con frecuencias de reloj de hasta 100 Hz para respuestas rápidas.
- Teleoperación asistida: dado su entrenamiento en HiFi-UMI-2K (datos de teleoperación UMI), el modelo puede aprender a replicar movimientos humanos capturados por el sistema UMI, mejorando la destreza en tareas de manipulación fina.
- Control de drones o vehículos autónomos: la integración de audio y visión, junto con la dinámica latente, permite reaccionar a estímulos del entorno en tiempo real.
- Simulación de agentes físicos: el modelo puede servir como motor de control dentro de simuladores robóticos (MuJoCo, Isaac Sim) para entrenar políticas antes del despliegue físico.
- Investigación en physical AI: su arquitectura abierta y licencia Apache 2.0 lo convierten en una base para experimentar con arquitecturas híbridas de agencia encarnada, combinando MoE, SSM y circuitos neurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de robótica (éxito en tareas, precisión de control, etc.) en la model card ni en los metadatos de HuggingFace.

## Requisitos de hardware

- El repositorio contiene 51 shards safetensors en fp32, con un peso total de aproximadamente 119 GB (127,5 GB incluyendo metadatos). La carga en fp32 requiere al menos 127 GB de VRAM.
- Para inferencia en bf16, se estima un consumo de aproximadamente 63 GB de VRAM (31,7 B parámetros × 2 bytes), lo que requiere una GPU profesional como NVIDIA H200 (141 GB) o A100 80 GB en configuraciones de precisión mixta.
- Con cuantización a 8 bits (si estuviera disponible) se necesitarían unos 32 GB; en 4 bits, unos 16 GB. Sin embargo, no se han publicado cuantizaciones oficiales para este formato nativo.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB) sin cuantización o técnicas de offloading, que no están documentadas.
- Opciones de despliegue: el modelo solo se puede cargar mediante la librería AMATERASU con `resume_modules`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser Transformers.
- Latencia y throughput: no disponibles. El diseño con relojes internos (Slow 2-5 Hz, Fast 30-100 Hz) sugiere que el modelo está pensado para control en tiempo real, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| NULLXES AMATERASU-32B v0.1 | 31,7 B | Híbrida (MoE + SSM + visión + NCES) | Robótica / physical AI | Apache 2.0 | Nativo `amaterasu-ckpt-v1` |
| OpenVLA | 7 B | Transformer (LLaMA-2) + visión | Manipulación robótica | MIT | Transformers / safetensors |
| π0 (Physical Intelligence) | 3 B | Transformer + flujo | Manipulación robótica | No comercial | JAX / PyTorch |
| NVIDIA GR00T | 10-15 B (estimado) | Transformer multimodal | Robótica humanoide | No comercial | No disponible |

La comparativa es orientativa: AMATERASU se distingue por su arquitectura desde cero, su tamaño mayor y su licencia permisiva, pero carece de benchmarks publicados y de un ecosistema de herramientas estándar. OpenVLA y π0 tienen soporte comunitario y documentación más amplia, aunque con licencias más restrictivas.

## Limitaciones y advertencias

- Modelo en fase v0.1 (Circuit-0): solo se entrenó el encoder NCES; el resto del grafo está congelado y no se ha validado su rendimiento en tareas completas.
- Datos de entrenamiento limitados: únicamente HiFi-UMI-2K en formato parquet, sin vídeo ni etiquetas de intención. Esto puede limitar la generalización a escenarios no cubiertos por ese dataset.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su capacidad en tareas de robótica o lenguaje.
- Formato propietario: no es compatible con HuggingFace Transformers, vLLM ni otras herramientas estándar; requiere la librería AMATERASU, cuyo código está en GitHub pero no se ha verificado su madurez.
- Riesgo de alucinación y errores de control: al ser un modelo de agencia física, una salida incorrecta puede traducirse en movimientos peligrosos en entornos reales. Se recomienda usar simuladores antes del despliegue físico.
- Requisitos de hardware elevados: la inferencia en fp32/bf16 exige GPUs de gama alta profesional, lo que limita su uso a entornos con recursos suficientes.
- Idiomas y contexto no documentados: no se especifican idiomas soportados ni longitud de contexto, lo que impide evaluar su uso en aplicaciones de lenguaje general.
- Sin cuantizaciones oficiales: no hay versiones GGUF o AWQ, dificultando su ejecución en hardware de consumo.

## Enlaces

- Repositorio HuggingFace: [MagistrTheOne/NULLXES-AMATERASU](https://huggingface.co/MagistrTheOne/NULLXES-AMATERASU)
- Código (según model card): [github.com/MagistrTheOne/NULLXES-AMATERASU](https://github.com/MagistrTheOne/NULLXES-AMATERASU)
- Dataset de entrenamiento: [HiFi-UMI-2K](https://huggingface.co/datasets/simple-world-lab/HiFi-UMI-2K)

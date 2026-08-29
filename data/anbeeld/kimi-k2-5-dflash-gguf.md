# Anbeeld/Kimi-K2.5-DFlash-GGUF

## Resumen

Kimi-K2.5-DFlash es un modelo auxiliar de **decodificación especulativa** desarrollado por el laboratorio z-lab, diseñado específicamente para acelerar la inferencia del modelo principal **Kimi K2.5** de Moonshot AI. A diferencia de los drafter tradicionales (modelos autoregresivos pequeños), DFlash emplea un **modelo de difusión de bloques** ligero que genera múltiples tokens candidatos en paralelo, lo que permite alcanzar tasas de aceptación más altas y un mayor throughput en comparación con métodos secuenciales.

Este repositorio concreto, `Anbeeld/Kimi-K2.5-DFlash-GGUF`, proporciona cuantizaciones GGUF del drafter original (`z-lab/Kimi-K2.5-DFlash`) para su uso con **BeeLlama.cpp**, un fork de llama.cpp con funcionalidades avanzadas de cuantización. El modelo debe emplearse siempre junto al modelo objetivo `moonshotai/Kimi-K2.5` y no puede utilizarse de forma independiente para generar texto. Su relevancia radica en que permite ejecutar decodificación especulativa de alto rendimiento en entornos con recursos limitados, aprovechando la eficiencia de la difusión de bloques y el soporte de ventana deslizante para contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de bloques (block diffusion) para drafting especulativo |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (soporta ventana deslizante configurable, p. ej. 4096 tokens) |
| Tipos de cuantizacion | GGUF (variantes no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (para BeeLlama.cpp) |

## Arquitectura y entrenamiento

DFlash se basa en un **modelo de difusión de bloques** (block diffusion) que, en lugar de predecir token a token de forma autoregresiva, genera un bloque completo de tokens candidatos en paralelo mediante un proceso de difusión. Esta aproximación permite que el drafter sea mucho más ligero que el modelo objetivo y que produzca múltiples propuestas simultáneamente, lo que incrementa la longitud de aceptación media (acceptance length) y reduce la latencia por token generado.

El entrenamiento del drafter se realizó con recursos de cómputo proporcionados por Modal, InnoMatrix y Yotta Labs, según los agradecimientos de la model card. No se especifican el número de parámetros ni la composición exacta del dataset de entrenamiento. El modelo está diseñado para ser usado junto a Kimi K2.5, y su implementación de referencia está disponible en SGLang y vLLM (PR39930). La innovación clave es que el drafter puede emplear **atención de ventana deslizante** (sliding-window attention) para manejar contextos largos sin degradar el rendimiento, controlada mediante el parámetro `--speculative-dflash-draft-window-size`.

## Capacidades

- **Drafting especulativo**: genera bloques de tokens candidatos (por defecto 8) para el modelo objetivo Kimi K2.5, acelerando la inferencia sin modificar la distribución de salida.
- **Decodificación paralela**: al ser un modelo de difusión, produce múltiples tokens a la vez, a diferencia de los drafter autoregresivos convencionales.
- **Soporte de ventana deslizante**: permite configurar una ventana de atención reducida para el drafter, útil en cargas de trabajo de contexto largo o agentes.
- **Integración con frameworks de inferencia**: compatible con SGLang y vLLM mediante parches específicos (PR20547 y PR39930 respectivamente).
- **Cuantización GGUF**: disponible en formato GGUF para su uso con BeeLlama.cpp, un fork de llama.cpp con opciones avanzadas de cuantización.
- **No es un modelo de generación independiente**: no puede producir texto por sí mismo; requiere el modelo objetivo para funcionar.

## Casos de uso

- **Inferencia de alto rendimiento en producción**: desplegar Kimi K2.5 con DFlash como drafter en servidores SGLang o vLLM para reducir la latencia por token en aplicaciones de chat o generación de código, manteniendo la calidad del modelo completo.
- **Agentes con contexto largo**: en cargas de trabajo agénticas que requieren ventanas de contexto extensas, activar la ventana deslizante del drafter (p. ej. 4096 tokens) para mantener la velocidad sin sacrificar precisión.
- **Despliegue en hardware limitado**: gracias a las cuantizaciones GGUF, el drafter puede ejecutarse en CPU o GPU de gama media mediante BeeLlama.cpp, permitiendo decodificación especulativa en entornos sin GPUs de gran capacidad.
- **Prototipado y evaluación de decodificación especulativa**: investigadores pueden comparar el rendimiento de DFlash frente a drafter autoregresivos tradicionales utilizando los benchmarks de acceptance length y throughput incluidos en la documentación.
- **Optimización de costes en APIs de inferencia**: al reducir el número de pasos de decodificación del modelo objetivo, se disminuye el consumo de cómputo y, por tanto, el coste por petición en entornos de servicio.
- **Integración en pipelines de desarrollo**: combinar con frameworks como vLLM para servir modelos de código (p. ej. HumanEval, MBPP) con mayor throughput, útil en entornos CI/CD donde se generan o revisan fragmentos de código de forma masiva.

## Benchmarks y rendimiento

La model card del drafter (z-lab/Kimi-K2.5-DFlash) reporta los siguientes resultados medidos con SGLang, con thinking habilitado, máximo de 4096 tokens nuevos y tamaño de bloque 8:

**Acceptance Length** (longitud media de tokens aceptados por propuesta):

| Dataset | Acceptance Length |
|---|---|
| GSM8K | 5.3 |
| Math500 | 5.5 |
| HumanEval | 5.3 |
| MBPP | 4.5 |
| MT-Bench | 3.7 |

**Throughput** (tokens por segundo, con contexto C=32):

| Dataset | Throughput (tok/s) |
|---|---|
| GSM8K | 2015 |
| Math500 | 3096 |
| HumanEval | 3146 |
| MBPP | 2940 |
| MT-Bench | 2146 |

Estos valores son específicos del drafter DFlash en combinación con Kimi K2.5. No se han publicado comparativas directas con otros drafter en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Al ser un modelo ligero de difusión, se espera que sea significativamente menor que la del modelo objetivo (Kimi K2.5), pero no se especifica el número de parámetros.
- **GPU recomendadas**: no se indican modelos concretos. Para el uso con SGLang o vLLM, se requiere al menos una GPU compatible con CUDA (p. ej. A100, H100, RTX 4090), aunque el drafter en sí podría ejecutarse en hardware más modesto.
- **Compatibilidad con GPU de consumo**: probablemente sí, gracias a las cuantizaciones GGUF y a su tamaño reducido, aunque no hay datos confirmados.
- **Opciones de despliegue**: SGLang (con el parche de PR20547), vLLM (con el parche de PR39930) y BeeLlama.cpp para las versiones GGUF. También es compatible con text-generation-inference según los tags.
- **Latencia y throughput**: los valores de throughput mostrados (2015–3146 tok/s) se obtuvieron con SGLang en un entorno con `--tp-size 8`, es decir, con 8 GPUs en paralelo. Para configuraciones menores, el rendimiento será inferior.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos drafter de difusión comparables en la información proporcionada. La comparativa natural sería frente a drafter autoregresivos tradicionales (p. ej. un modelo pequeño como Qwen2.5-0.5B usado para decodificación especulativa), pero no hay datos públicos de rendimiento de esos métodos sobre Kimi K2.5 en la documentación disponible. Se recomienda consultar el paper de DFlash (arXiv:2602.06036) para una comparación detallada.

## Limitaciones y advertencias

- **No es un modelo independiente**: requiere obligatoriamente el modelo objetivo `moonshotai/Kimi-K2.5` para funcionar. No puede generar texto por sí solo.
- **Dependencia de forks específicos**: las cuantizaciones GGUF exigen BeeLlama.cpp, un fork no oficial de llama.cpp. El uso con SGLang o vLLM requiere parches en desarrollo (PRs aún sin fusionar), lo que puede generar inestabilidad o incompatibilidades.
- **Rendimiento dependiente de la configuración**: la ventana deslizante del drafter es configurable; un valor demasiado pequeño puede degradar la aceptación en contextos largos.
- **Sesgos y alucinaciones**: al ser un drafter, no genera contenido propio, por lo que no introduce sesgos adicionales más allá de los del modelo objetivo. Sin embargo, la calidad final depende completamente de Kimi K2.5.
- **Licencia MIT**: permite uso comercial, pero el modelo base Kimi K2.5 tiene su propia licencia (no especificada en esta ficha) que debe verificarse por separado.
- **Estado del repositorio**: el repositorio de Anbeeld tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que puede estar vacío o ser un placeholder. Se recomienda verificar la disponibilidad real de los archivos GGUF antes de usarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Anbeeld/Kimi-K2.5-DFlash-GGUF
- Modelo drafter original: https://huggingface.co/z-lab/Kimi-K2.5-DFlash
- Modelo objetivo Kimi K2.5: https://huggingface.co/moonshotai/Kimi-K2.5
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash/
- Fork BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- PR de vLLM para DFlash: https://github.com/vllm-project/vllm/pull/39930
- PR de SGLang para DFlash: https://github.com/sgl-project/sglang/pull/20547

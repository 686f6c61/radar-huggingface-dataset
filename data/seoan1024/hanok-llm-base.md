# seoan1024/Hanok-LLM-Base

## Resumen
Hanok LLM 1.0 es un modelo de lenguaje decoder-only de tipo transformer denso, desarrollado por el usuario seoan1024 bajo el paraguas del proyecto Hanok LLM, una pila modular de investigación centrada en el idioma coreano. El modelo se presenta como la base de un stack nativo en PyTorch que cubre entrenamiento, inferencia, evaluación, exportación y flujo de datos, con separación estricta de responsabilidades en el paquete `src/hanok/`. Su propósito declarado es servir como plataforma inspeccionable y reproducible para investigación en modelos de lenguaje en coreano, no como un modelo listo para producción.

La arquitectura es un transformer decoder-only con 33 bloques, dimensión oculta de 1.280, 10 cabezas de atención (dimensión por cabeza de 128) y capa intermedia SwiGLU de 5.881 unidades, con embeddings atados y vocabulario de 30.004 tokens, totalizando aproximadamente 1.000 millones de parámetros. Incorpora RMSNorm, RoPE con theta 10.000, pre-norm en atención y FFN, y caché KV por capa. La longitud de contexto por defecto en entrenamiento, inferencia y exportación es de 1.024 tokens, aunque el constructor del modelo admite hasta 4.096 mediante la tabla RoPE, sin validación de calidad documentada por encima de 1.024.

El modelo es relevante ahora por su enfoque "Korean-first" y por su empaquetado como stack completo y abierto a inspección, lo que facilita la experimentación local en Windows 11 con CUDA 12.x. No obstante, la model card advierte que los pesos entrenados se publicarán una vez finalice el entrenamiento, y que los comandos de exportación convierten un checkpoint aportado por el usuario, lo que sugiere que el repositorio funciona más como infraestructura que como un modelo con rendimiento verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, pre-norm, con RMSNorm, RoPE, SwiGLU y embeddings atados |
| Parametros totales | 1.000.000.000 (1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 por defecto en entrenamiento, inferencia y exportación; constructor admite 4.096; configurable pero no validado por encima de 1.024 |
| Tipos de cuantizacion | no disponible (la card menciona exportación a GGUF vía llama.cpp, sin detallar tipos) |
| Idiomas soportados | Coreano como idioma principal declarado; resto no disponible |
| Licencia | no disponible (la card indica "See LICENSE") |
| Formato de pesos | safetensors en el repositorio; exportación a bundle Transformers Llama, GGUF (llama.cpp) y modelo Ollama |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only nativo en PyTorch, implementado en la clase `KoreanLLM`, con 33 bloques, dimensión oculta de 1.280, 10 cabezas de atención de 128 dimensiones cada una y capa SwiGLU de 5.881 unidades. Usa RMSNorm con epsilon 1e-6, RoPE con theta 10.000 aplicado a queries y keys mediante tablas coseno/seno precalculadas registradas como buffers, pre-norm en atención y FFN, embeddings de entrada y salida atados y caché KV por capa con tensores detachados. El vocabulario del modelo es de 30.004 tokens y el tokenizador no debe exceder ese tamaño.

El pipeline de entrenamiento documentado contempla pretraining seguido de SFT, con acumulación de gradientes, scheduler coseno, reanudación desde checkpoint y enmascaramiento "response-only" para SFT. La carga de datos se realiza desde Hugging Face Datasets con caché en Parquet y parseo de campos orientado a coreano. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. La card indica que los pesos entrenados se publicarán cuando el entrenamiento finalice, por lo que el estado actual del repositorio corresponde a la infraestructura y a los pesos base, sin métricas de calidad publicadas.

## Capacidades
- Generación de texto autoregresiva con decodificación por temperatura, top-k, top-p y penalización por repetición.
- Soporte de caché KV por capa para generación incremental.
- Entrenamiento y ajuste supervisado (SFT) con enmascaramiento response-only.
- Evaluación de perplejidad y benchmark de regresión de opción múltiple en coreano reproducible.
- Exportación a bundle estándar de Transformers (Llama), GGUF para llama.cpp y modelo Ollama.
- Flujo de trabajo local en Windows 11 con CUDA 12.x y Python 3.10+.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe no documentada más allá del enfoque coreano declarado.

## Casos de uso
- Investigación en modelado de lenguaje en coreano: el stack permite entrenar y evaluar modelos desde cero con configuración explícita, útil para estudiar tokenización, currículos de datos y efectos de la longitud de contexto en un idioma concreto.
- Reproducción de experimentos académicos: al separar modelo, datos, entrenamiento, inferencia, evaluación y exportación en módulos independientes, facilita la replicación de resultados y la comparación de variantes arquitectónicas.
- Desarrollo de pipelines de SFT: el enmascaramiento response-only y la orquestación pretrain→SFT permiten construir asistentes conversacionales en coreano ajustando el modelo base con datos propios.
- Despliegue local en estaciones de trabajo Windows: la exportación a GGUF y Ollama permite ejecutar el modelo cuantizado en equipos con GPU consumer, adecuado para prototipado y demos internas.
- Evaluación comparativa de modelos coreanos: el benchmark de opción múltiple incluido sirve como prueba de regresión para medir degradación tras cuantización o cambios en el entrenamiento.
- Educación y formación técnica: el código nativo en PyTorch con defaults explícitos y monitorización GUI opcional facilita explicar el funcionamiento interno de un transformer y su ciclo de entrenamiento.
- Integración en pipelines de CI/CD para validación de checkpoints: los comandos de exportación y evaluación permiten automatizar la verificación de que un checkpoint se carga, genera y exporta correctamente antes de publicarse.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en precisión completa (FP32): en torno a 4 GB solo para pesos, más activaciones y caché KV; el tamaño del repositorio es de 4,0 GB, coherente con pesos de 1B en FP32.
- En FP16/BF16: aproximadamente 2 GB para pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5-0,7 GB, aunque los tipos de cuantización no están documentados en la card.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPU consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB; para entrenamiento se recomiendan GPU con mayor VRAM (A100, H100) aunque no hay datos publicados.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM para inferencia en FP16 y en modelos de 8 GB o más para comodidad con contexto largo.
- Opciones de despliegue: inferencia nativa en PyTorch con carga de `.pth`; exportación a bundle Transformers, GGUF para llama.cpp y modelo Ollama. No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hanok LLM 1.0 | 1B | 1.024 por defecto (4.096 máximo configurable) | no disponible | Pesos base en HF; pesos entrenados pendientes | Stack coreano-first, nativo PyTorch, exportación GGUF/Ollama |
| Llama 3.2 1B | 1B | 128K | Llama 3.2 Community License | Pesos publicados y ampliamente soportado | Modelo multilingüe de referencia de Meta; contexto muy superior |
| Qwen2.5 1.5B | 1,5B | 32K | Apache 2.0 (según variante) | Pesos publicados | Buen rendimiento en código y multilingüe; mayor tamaño |
| Gemma 2 2B | 2B | 8K | Gemma Terms of Use | Pesos publicados | Enfoque en eficiencia y seguridad; mayor tamaño |

La comparación es orientativa: Hanok LLM 1.0 no publica benchmarks ni pesos entrenados verificados, por lo que no es posible contrastar rendimiento con las alternativas. Su ventaja diferencial es la inspeccionabilidad del stack y el enfoque en coreano, no el rendimiento bruto.

## Limitaciones y advertencias
- Los pesos entrenados aún no se han publicado según la model card; el repositorio contiene principalmente la infraestructura y pesos base, por lo que no hay garantía de calidad de generación.
- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real es desconocido.
- El contexto por defecto es de 1.024 tokens y no se ha validado la calidad por encima de esa longitud, lo que limita casos de uso con documentos largos.
- La licencia no está especificada ("See LICENSE"), lo que impide confirmar si se permite uso comercial; es un riesgo para producción.
- El modelo está orientado a coreano; el soporte de otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación y sesgos no evaluados: no hay documentación sobre datos de entrenamiento, filtrado ni mitigaciones.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad.
- El flujo de trabajo está pensado para Windows 11 con CUDA 12.x; otros entornos pueden requerir adaptaciones no documentadas.
- El tamaño del vocabulario (30.004) es pequeño frente a modelos multilingües modernos, lo que puede penalizar la eficiencia en otros idiomas.

## Enlaces
- Hugging Face: https://huggingface.co/seoan1024/Hanok-LLM-Base
- Repositorio GitHub del proyecto: https://github.com/seoan1024/Hanok-LLM.git
- Repositorio de investigación base: https://github.com/seoan1024/Korean-llm.git

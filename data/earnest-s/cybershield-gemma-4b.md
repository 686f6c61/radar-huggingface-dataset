# earnest-s/CyberShield-Gemma-4B

## Resumen

CyberShield-Gemma-4B es un adaptador LoRA experimental desarrollado por el autor `earnest-s`, que se monta sobre el modelo base `unsloth/gemma-3-4b-it-bnb-4bit` (Gemma 3 4B cuantizado en 4-bit NF4). Su propósito es generar grafos de arquitectura de software en formato JSON (nodos y aristas) a partir de requisitos de arquitectura y seguridad expresados en lenguaje natural. El modelo está diseñado como una demostración de entrenamiento con PEFT sobre un conjunto de datos específico, y no está pensado para producción.

El adaptador se entrenó durante una época con un conjunto de datos propio (51.498 registros) derivado de `ajibawa-2023/Technical-Architectures-Large`, con un pipeline de enriquecimiento y validación. El resultado es un modelo que produce estructuras JSON válidas y conectadas en el 99,96% de los casos, pero con una fidelidad estructural limitada respecto a la arquitectura canónica (F1 de nodos 0,224 y F1 de aristas 0,065). Es un modelo de investigación que demuestra la viabilidad de ajustar un LLM pequeño para tareas de generación de arquitectura, pero con claras limitaciones en cuanto a precisión semántica.

La relevancia actual reside en su carácter experimental: sirve como caso de estudio para el ajuste de modelos con LoRA en dominios técnicos específicos, pero no es recomendable para uso real en entornos de ingeniería de software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 4B (base) con adaptador LoRA (PEFT) |
| Parametros totales | 4.000 millones (aprox.) en el modelo base; 44,7 millones entrenables en el adaptador |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (máximo de entrenamiento; el modelo base soporta más) |
| Tipos de cuantizacion | Base en 4-bit NF4 (BitsAndBytes), adaptador en bf16 |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Desconocida (campo `license: unknown`) |
| Formato de pesos | Safetensors (adaptador LoRA), además del base en formato de HuggingFace |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado a la torre de lenguaje de Gemma 3 4B (el modelo base está congelado). El adaptador se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` de la torre de lenguaje (238 módulos en total), con r=24, alpha=48 y dropout 0,05. La torre de visión del modelo base no se toca. El entrenamiento se realizó con PyTorch, Transformers y PEFT, usando optimizador AdamW de 8 bits, LR 2e-4, scheduler coseno con 10% de warmup, y acumulación de gradientes de 8 micro-batches. Se usó pérdida de entropía cruzada por trozos de 64 tokens, con enmascarado de prompts y longitud máxima de 1024 tokens. El entrenamiento duró una época (5.793 pasos) sobre un dataset de 51.498 registros, con una pérdida final de entrenamiento de 0,2331 y de validación de 0,1912.

El dataset fue construido a partir de registros reales de `ajibawa-2023/Technical-Architectures-Large`, sin datos sintéticos, mediante un pipeline de etapas (descarga, conversión, enriquecimiento, validación, revisión, exportación, enriquecimiento de seguridad, extracción de subgrafos y formato SFT). La partición fue 46.348 entrenamiento, 2.575 validación y 2.575 prueba (los de prueba nunca se vieron durante el entrenamiento). El modelo no emplea técnicas como RLHF o DPO; es un ajuste supervisado clásico con LoRA.

## Capacidades

- Generación de grafos de arquitectura en JSON: dado un prompt en lenguaje natural con requisitos de arquitectura y seguridad, produce un objeto JSON con nodos y aristas que cumplen un contrato estricto (máximo 10 nodos, 15 aristas, sin duplicados, sin auto-bucles, sin nodos huérfanos y con conectividad débil).
- Cumplimiento del contrato de salida: el modelo logra un 100% de parseo, validación de esquema y validez del contrato en el conjunto de prueba.
- Generación de estructuras plausibles: aunque la fidelidad exacta es baja, las arquitecturas generadas son bien formadas y razonables para una revisión humana.
- Capacidad de razonamiento básico sobre requisitos de arquitectura, gracias al modelo base Gemma 3.
- No incluye soporte de tool calling, ni funciones de agente, ni capacidades multimodales en este adaptador (la torre de visión del base no se utiliza).
- Multilingüe solo en inglés; no se ha evaluado en otros idiomas.

## Casos de uso

- Borradores de arquitectura para revisión humana: el modelo puede generar una propuesta inicial de nodos y aristas a partir de una descripción de requisitos, que un arquitecto de software luego revisa y edita en un editor interactivo (como el proyecto ArchitectAI). Su alta validez estructural reduce el tiempo de diseño inicial.
- Generación de diagramas de componentes para documentación: a partir de un texto de requisitos, se obtiene un JSON que puede convertirse a una representación visual (por ejemplo, Graphviz) para documentación técnica preliminar.
- Exploración de alternativas de diseño: el modelo puede producir múltiples variantes de arquitectura (cambiando el prompt) que un equipo puede comparar, aunque la fidelidad no sea exacta.
- Ejemplo educativo de ajuste con LoRA: sirve como caso práctico para aprender a entrenar un adaptador LoRA sobre un LLM de 4B con un dataset pequeño, mostrando el flujo completo de preparación de datos, entrenamiento y evaluación.
- Verificación de contratos de salida: el modelo puede usarse para probar sistemas de validación de JSON en entornos de desarrollo, ya que genera salidas que cumplen el contrato definido.
- Prototipado rápido de herramientas de IA para arquitectura: como punto de partida para investigar mejoras (por ejemplo, mayor fidelidad, uso de otros modelos base) sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación sobre el conjunto de prueba (2.575 registros) con decodificación greedy y `repetition_penalty=1.1`:

| Métrica | Valor |
|---|---|
| Tasa de parseo | 100% (2.575/2.575) |
| Tasa de validez del contrato | 100% |
| Tasa de validez del esquema | 100% |
| Tasa de conectividad | 99,96% |
| Tasa de fallos por repetición | 0% |
| F1 de nodos | 0,224 |
| F1 de aristas | 0,065 |
| Coincidencia exacta de arquitectura | 0% |

Interpretación: el modelo produce estructuras JSON válidas y conectadas de forma fiable, pero la correspondencia con las arquitecturas canónicas es limitada. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU con al menos 5,66 GiB de VRAM útil (pico de 3,53 GiB), lo que indica que el modelo base en 4-bit cabe en tarjetas consumer de gama media (por ejemplo, una RTX 3060 de 12 GB o RTX 4060 de 8 GB).
- Para inferencia, se necesita una GPU CUDA con al menos 6 GB de VRAM para cargar el modelo base en 4-bit y el adaptador en bf16.
- El modelo base es `unsloth/gemma-3-4b-it-bnb-4bit`, que ya está cuantizado en 4-bit NF4; no se recomienda usar sin cuantización por el alto consumo de memoria.
- Se puede desplegar con el stack de Hugging Face Transformers + PEFT + BitsAndBytes. No se mencionan opciones como vLLM, Ollama o llama.cpp en la información.
- La latencia y el throughput no están especificados; depende del hardware. Se espera que sea adecuado para inferencia en lote pequeña o uso interactivo, pero no para producción de alto rendimiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos (como otros adaptadores LoRA para generación de arquitectura). En su lugar, se puede comparar con el modelo base Gemma 3 4B, pero no se han publicado benchmarks de este adaptador frente a otros. Por lo tanto, se indica: no disponible.

## Limitaciones y advertencias

- Baja fidelidad estructural: el F1 de nodos es 0,224 y el de aristas 0,065, con una coincidencia exacta del 0%. No debe usarse para reconstruir arquitecturas canónicas.
- La salida válida según el contrato no implica corrección semántica: un grafo bien formado puede ser incorrecto en la realidad.
- El 0,04% de las salidas de prueba son disconexas, aunque el proyecto tiene un bucle de reintento que lo cubre.
- Entrenado en un dataset pequeño (51.498 registros) y con un solo epoch de LoRA; la cobertura de dominio es limitada.
- Modelo experimental, no auditado para seguridad crítica ni uso en producción.
- Licencia desconocida, lo que impide conocer las restricciones de uso comercial.
- No hay soporte para otros idiomas más allá del inglés.
- El modelo base es Gemma 3 4B, no Gemma 4; cualquier referencia a Gemma 4 en la documentación web no es aplicable a este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/earnest-s/CyberShield-Gemma-4B
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-bnb-4bit
- Dataset de origen: https://huggingface.co/datasets/ajibawa-2023/Technical-Architectures-Large
- No se han encontrado papers, blogs o demos adicionales específicos de este modelo.

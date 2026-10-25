# shopkeeper/kor-finewiki-1b-chat

## Resumen

kor-finewiki-1b-chat es la versión conversacional de kor-finewiki-1b-base, un modelo de lenguaje coreano de 1.001.518.688 parámetros (≈1,0B) desarrollado por el usuario independiente shopkeeper y entrenado desde inicialización aleatoria, sin partir de ningún modelo preexistente. La arquitectura es híbrida: combina capas de Gated DeltaNet (una variante de atención lineal con estado recurrente) con atención GQA, e incluye tokenizador, kernels, optimizador y bucles de entrenamiento propios escritos en PyTorch y Triton.

El modelo base se preentrenó sobre 25.2B tokens y después se ajustó de forma supervisada sobre 392.615 conversaciones públicas en coreano (231M tokens, de los cuales 196M son tokens de asistente que portan la pérdida). El resultado es un modelo pequeño, con licencia Apache-2.0 y formato safetensors, pensado para despliegues con presupuesto de VRAM muy reducido y para experimentación con arquitecturas híbridas alternativas al transformer denso.

Su relevancia actual es doble: por un lado, demuestra que una arquitectura híbrida DeltaNet + GQA puede entrenarse desde cero y ajustarse por chat con recursos modestos (2× RTX A6000 durante 6,6 horas); por otro, ofrece un punto de comparación reproducible frente a modelos coreanos consolidados como polyglot-ko-1.3b o kogpt2-base-v2, con resultados publicados en un arnés de evaluación común. No obstante, se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + GQA (atención lineal con estado recurrente combinada con atención por grupos de consultas); implementación propia en PyTorch + Triton |
| Parametros totales | 1.001.518.688 (≈1,0B) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens (deducido del truncado de conversaciones a 2.048 tokens durante el ajuste; no se declara explícitamente en la model card) |
| Tipos de cuantizacion | No disponible: solo se publican pesos safetensors; no se documentan GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Coreano (ko) e inglés (en) declarados; el preentrenamiento, los datos de ajuste y la evaluación se centran en coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB), cargable con PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que intercala capas de Gated DeltaNet con capas de atención GQA. Gated DeltaNet es una forma de atención lineal con compuertas y estado recurrente que busca reducir el coste de la atención cuadrática manteniendo la capacidad de recuperación de información a lo largo del contexto. El tokenizador, los kernels de cómputo (escritos en Triton), el optimizador y los bucles de preentrenamiento y ajuste son código propio del autor, no componentes de bibliotecas estándar; la model card remite a la ficha del modelo base para el detalle de la arquitectura y del corpus de preentrenamiento.

El preentrenamiento se realizó desde inicialización aleatoria sobre 25.2B tokens. El ajuste supervisado empleó 392.615 conversaciones (231M tokens, 196M de ellos tokens de asistente) y 1.000 conversaciones reservadas para validación, con pérdida calculada únicamente sobre los turnos del asistente y su token de cierre `<|end|>`. Se aplicó un filtro n-gram para eliminar solapamiento con los conjuntos de evaluación (texto reservado, KoBEST, test de KMMLU y prompts de evaluación de chat), se eliminaron duplicados por primer turno de usuario y se truncaron las conversaciones largas a límites de turno completos. El entrenamiento usó AdamW (β = 0,9/0,95, sin weight decay), clipping de gradiente 1.0, learning rate 5e-05 con 100 pasos de calentamiento y decaimiento coseno hasta el 10%, micro-lotes agrupados por longitud de ≤8.192 tokens con 16 pasos de acumulación en 2 GPUs (hasta 262k tokens por paso), autocast bf16 y checkpointing de activaciones por bloque; 1 época equivalió a 984 pasos de optimizador en 2× RTX A6000 durante 6,6 horas. La pérdida de validación pasó de 1.811 (paso 200) a 1.692 (final).

Una innovación destacable a nivel de formato es la plantilla de chat con marcadores de rol de un solo token y sin espacios en blanco entre segmentos: `<|endoftext|>[<|system|>{system}<|end|>]<|user|>{user}<|end|><|assistant|>{respuesta}<|end|>`. El turno de sistema es opcional y la generación arranca tras `<|assistant|>` y se detiene en `<|end|>`.

## Capacidades

- Generación de texto conversacional en coreano: mantiene diálogos multi-turno con historial explícito mediante marcadores de rol de un solo token.
- Comprensión lectora y sentido común básico en coreano, medido en KoBEST: COPA 0,703, HellaSwag 0,416 (exactitud) / 0,518 (normalizada), SentiNeg 0,587 y BoolQ 0,517 en 0-shot.
- Conocimiento factual y académico limitado en coreano: KMMLU 0-shot de 0,298 frente a un azar de 0,25.
- Seguimiento de instrucciones simples en registro conversacional (recomendaciones, listas, explicaciones), con fallos documentados en restricciones numéricas.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: coreano e inglés declarados, pero solo se aportan evaluaciones en coreano; no hay evidencia publicada de calidad en inglés.
- Modo thinking, visión, audio u otras modalidades: no disponibles.
- Turno de sistema opcional en la plantilla, aunque los datos de ajuste mayoritariamente carecen de él.

## Casos de uso

- Atención al cliente automatizada en coreano: el modelo gestiona conversaciones multi-turno con historial explícito y un formato de plantilla compacto, adecuado para asistentes de FAQ y resolución de primeras consultas donde el coste por inferencia es crítico.
- Despliegue en entornos con VRAM muy limitada: con ≈1,0B parámetros en bf16 (≈2 GB de pesos), cabe en GPUs de consumo y en instancias de inferencia pequeñas, lo que permite servir chat en coreano on-premise sin infraestructura dedicada.
- Generación de datos sintéticos en coreano: puede producir diálogos y respuestas de estilo conversacional para aumentar datasets de ajuste de modelos mayores, filtrando después por calidad y verificando hechos.
- Ajuste fino adicional sobre dominio específico: el coste de un ciclo de SFT completo es de 6,6 horas en 2× RTX A6000, lo que hace viable reajustar el modelo por vertical (legal, sanitario, comercio) partiendo de los pesos publicados.
- Investigación sobre arquitecturas híbridas: sirve como banco de pruebas reproducible de Gated DeltaNet + GQA frente a transformers densos de tamaño comparable, con métricas de BPB y KoBEST publicadas para tres referencias.
- Prototipado rápido de producto conversacional en coreano: al ser Apache-2.0 y ocupar 2,0 GB en disco, se puede integrar en un entorno de desarrollo local para validar flujos de diálogo antes de escalar a un modelo mayor.
- Asistente de escritura y reescritura de textos breves en coreano: resúmenes, reformulaciones y respuestas a correos dentro de la ventana de 2.048 tokens, con revisión humana obligatoria por la tasa de error factual.
- Traducción asistida ko↔en en borradores: el modelo declara ambos idiomas, aunque la falta de evaluación en inglés lo hace apto solo para pre-traducción con postedición.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con el mismo arnés para todos los modelos (BPB sobre texto reservado, menor es mejor; KoBEST y KMMLU en 0-shot):

| Modelo | BPB ↓ | COPA | HellaSwag acc / norm | SentiNeg | BoolQ | KMMLU |
|---|---|---|---|---|---|---|
| kor-finewiki-1b-chat (este modelo) | 0,749 | 0,703 | 0,416 / 0,518 | 0,587 | 0,517 | 0,298 |
| kor-finewiki-1b-base (modelo base) | 0,729 | 0,690 | 0,418 / 0,546 | 0,599 | 0,496 | 0,255 |
| EleutherAI/polyglot-ko-1.3b (base) | 1,052 | 0,711 | 0,408 / 0,534 | 0,703 | 0,499 | 0,153 |
| skt/kogpt2-base-v2 (125M, base) | 1,092 | 0,584 | 0,318 / 0,422 | 0,615 | 0,502 | 0,177 |

Notas aportadas por el autor: el azar en KMMLU es 0,25; el ajuste por chat empeora ligeramente el BPB respecto al modelo base (comportamiento esperado al desplazar la distribución hacia el formato conversacional) y eleva KMMLU por encima del azar; la tarea WiC queda al nivel del azar en todos los modelos comparados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ≈2 GB solo para pesos en bf16/fp16 (el repositorio ocupa 2,0 GB); con estado recurrente, caché y activaciones, un presupuesto realista es de 3–4 GB. En fp32 serían ≈4 GB de pesos; en int8 ≈1 GB y en int4 ≈0,6 GB, aunque no se documenta ningún pipeline de cuantización para esta arquitectura.
- GPU recomendadas: cualquier GPU con soporte de Triton y ≥6 GB de VRAM para inferencia cómoda; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, L4, A10, A6000, A100 y H100 son sobredimensionadas para inferencia y adecuadas para ajuste.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con ≥6 GB, incluida una GTX 1660 de 6 GB o una RTX 3050 de 8 GB para contexto corto.
- Ajuste fino: el autor empleó 2× RTX A6000 (48 GB cada una) con micro-lotes de ≤8.192 tokens, 16 pasos de acumulación, bf16 y checkpointing de activaciones, con un total de 6,6 horas por época.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni transformers estándar. Al tratarse de una arquitectura propia (Gated DeltaNet) con kernels Triton y código de inferencia propio (`kollm.generate.build_prompt`), es previsible que requiera el repositorio del autor y una GPU NVIDIA con Triton operativo; la inferencia en CPU no está documentada.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPB ↓ | KMMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kor-finewiki-1b-chat | 1,0B | 2.048 (deducido) | 0,749 | 0,298 | Apache-2.0 | Pesos safetensors en HuggingFace; 0 descargas |
| kor-finewiki-1b-base | 1,0B | No disponible | 0,729 | 0,255 | Apache-2.0 (según modelo base) | Pesos safetensors en HuggingFace |
| EleutherAI/polyglot-ko-1.3b | 1,3B | No disponible en la información | 1,052 | 0,153 | No disponible en la información | Público en HuggingFace |
| skt/kogpt2-base-v2 | 125M | No disponible en la información | 1,092 | 0,177 | No disponible en la información | Público en HuggingFace |

Frente a polyglot-ko-1.3b, este modelo tiene un 23% menos de parámetros y mejora el BPB en 0,303 puntos y KMMLU en 0,145 puntos, a costa de un SentiNeg inferior (0,587 frente a 0,703). Frente a kogpt2-base-v2 es ocho veces mayor en parámetros, con mejor BPB (0,749 frente a 1,092) y mejor KMMLU (0,298 frente a 0,177). La ventaja comparativa principal es la eficiencia de la arquitectura híbrida en BPB; la desventaja es la ausencia de ecosistema de herramientas y de comunidad en torno a ella.

## Limitaciones y advertencias

- Conocimiento factual débil: KMMLU de 0,298 está solo 0,048 puntos por encima del azar (0,25), y WiC queda exactamente al nivel del azar en todos los modelos comparados.
- Seguimiento de instrucciones inconsistente: en la muestra publicada, ante la petición de «tres lugares» el modelo enumeró más de diez, y en la misma respuesta situó 이기대 y 송정해수욕장 en Ulsan, un error factual. La model card incluye estas muestras sin editar ni seleccionar.
- Regresión respecto al modelo base en métricas de lenguaje: el ajuste por chat empeora el BPB de 0,729 a 0,749 y baja SentiNeg de 0,599 a 0,587 y HellaSwag normalizado de 0,546 a 0,518.
- Ventana de contexto corta: 2.048 tokens, insuficiente para documentos largos, historiales extensos o recuperación aumentada con muchos pasajes.
- Riesgo de alucinación alto por escala (1,0B parámetros) y por un corpus de ajuste compuesto mayoritariamente por conversaciones traducidas y sintéticas; requiere verificación factual en cualquier uso externo.
- Idiomas: aunque declara inglés, no hay ninguna evaluación en inglés publicada; no debe asumirse competencia bilingüe real.
- Licencia de los datos: los pesos son Apache-2.0, pero dos conjuntos de ajuste (nayohan/Magpie-Pro-MT-300K-v0.1-ko y beomi/KoAlpaca-v1.1a) figuran como «not stated» en la model card, lo que introduce un riesgo legal no resuelto para uso comercial.
- Compatibilidad de herramientas: al usar una arquitectura propia con kernels Triton, no hay garantía de soporte en vLLM, llama.cpp, Ollama o TGI, ni de cuantización lista para usar; la integración exige el código del autor.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad ni seguridad; el conjunto korean_safe_conversation sugiere un intento de filtrado, pero no se aportan métricas.
- Madurez: 0 descargas y 0 likes, un único autor y fecha de creación muy reciente; no hay validación independiente ni informes de terceros.
- No apto para producción crítica (decisiones médicas, legales o financieras) sin supervisión humana y evaluación propia del dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shopkeeper/kor-finewiki-1b-chat
- Modelo base: https://huggingface.co/shopkeeper/kor-finewiki-1b-base
- Dataset lemon-mint/smol-koreantalk: https://huggingface.co/datasets/lemon-mint/smol-koreantalk
- Dataset maywell/koVast: https://huggingface.co/datasets/maywell/koVast
- Dataset nayohan/Magpie-Pro-MT-300K-v0.1-ko: https://huggingface.co/datasets/nayohan/Magpie-Pro-MT-300K-v0.1-ko
- Dataset nlpai-lab/kullm-v2: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Dataset beomi/KoAlpaca-v1.1a: https://huggingface.co/datasets/beomi/KoAlpaca-v1.1a
- Dataset jojo0217/korean_safe_conversation: https://huggingface.co/datasets/jojo0217/korean_safe_conversation
- Dataset FreedomIntelligence/sharegpt-korean: https://huggingface.co/datasets/FreedomIntelligence/sharegpt-korean
- Modelo comparable EleutherAI/polyglot-ko-1.3b: https://huggingface.co/EleutherAI/polyglot-ko-1.3b
- Modelo comparable skt/kogpt2-base-v2: https://huggingface.co/skt/kogpt2-base-v2
- Documentación de la plantilla de chat: archivo `CHAT_TEMPLATE.md` dentro del repositorio del modelo
- Paper, blog técnico, repositorio de código independiente o demo: no disponibles en la información proporcionada

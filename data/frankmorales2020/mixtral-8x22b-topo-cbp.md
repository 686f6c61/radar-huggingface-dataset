# frankmorales2020/Mixtral-8x22B-topo-cbp

## Resumen

`frankmorales2020/Mixtral-8x22B-topo-cbp` es un checkpoint derivado de `mistral-community/Mixtral-8x22B-v0.1-4bit`, publicado por el usuario frankmorales2020. El modelo conserva la arquitectura Mixture-of-Experts (MoE) del Mixtral-8x22B original (140.620.634.112 parámetros totales según los pesos en safetensors, 73,1 GB de repositorio) y se presenta como un ajuste realizado mediante una técnica propietaria denominada Topological Continual Backpropagation (Topo-CBP), orientada a mitigar el olvido catastrófico en aprendizaje continuo.

Según la model card, el entrenamiento se limitó a las capas de embeddings y de cabecera (`model.embed_tokens.weight` y `lm_head.weight`) durante 120 pasos, con el resto de los pesos congelados. El autor declara una "deriva de invarianza máxima" de `0.0000000000`, un veredicto de integridad PASS con digest certificado y una similitud semántica media del 90,9%. No se aportan conjuntos de evaluación, hiperparámetros completos, ni resultados de benchmarks independientes.

Su relevancia actual es limitada y fundamentalmente metodológica: se trata de un artefacto de investigación sobre aprendizaje continuo y gobernanza topológica de pesos, no de un modelo listo para producción. El repositorio registra 0 descargas y 0 "likes", y las afirmaciones técnicas del autor (teoría espectral aritmética, operador LEFM, SOMALA) no cuentan con validación externa ni revisión por pares en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, heredada de Mixtral-8x22B-v0.1 |
| Parametros totales | 140.620.634.112 (140,6 B) |
| Parametros activos | no disponible en la ficha; el modelo base Mixtral-8x22B-v0.1 activa 39 B por token (dato del modelo base, no confirmado en este repositorio) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base soporta 64 000 tokens |
| Tipos de cuantizacion | 4-bit (bitsandbytes); el checkpoint base es `mistral-community/Mixtral-8x22B-v0.1-4bit` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio: tamano del repo 73,1 GB, 0 descargas, 0 likes, creado y actualizado el 2026-10-14, pipeline no disponible.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mixtral-8x22B-v0.1: un transformer decoder-only con capas de mezcla de expertos (MoE) y enrutamiento disperso, distribuido en 8 expertos por capa con activacion top-2. El checkpoint parte de una version ya cuantizada a 4 bits publicada por `mistral-community`, de modo que los pesos heredados estan en precision reducida y no en bfloat16 original. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El entrenamiento especifico de este checkpoint, segun la model card, se ejecuto con HuggingFace Trainer durante 120 pasos y afecto unicamente a las matrices de embeddings de tokens y a la cabecera de lenguaje. La tecnica propietaria Topo-CBP se describe como un mecanismo de "gobernanza topologica" y retropropagacion continua orientado a mantener estabilidad plastica (stability-plasticity) y evitar el olvido catastrofico. El autor reporta una "deriva de invarianza maxima" de 0.0000000000 y una similitud semantica media del 90,9 % respecto al modelo base, asi como un veredicto de integridad PASS por coincidencia de digest. Estos valores proceden exclusivamente de la model card del autor y no se acompanan de metodologia reproducible en la informacion disponible. El codigo asociado se publica en un notebook del repositorio GitHub `frank-morales2020/AST`.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Mixtral-8x22B-v0.1.
- Capacidad potencial de razonamiento y conocimiento general propia del modelo base, aunque no verificada en este checkpoint.
- Razonamiento matematico y tecnico: el propio autor plantea en su ejemplo de inferencia una pregunta sobre el operador Laplace-Euler-Fourier-Mellin (LEFM) y teoria espectral aritmetica.
- Soporte de tool calling / function calling: no disponible (el modelo base v0.1 no es una version instruct y no incluye plantilla de chat dedicada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Aprendizaje continuo: el checkpoint pretende demostrar estabilidad de embeddings y cabecera frente a nuevos datos sin degradar el modelo base, segun las metricas declaradas por el autor.

## Casos de uso

- Investigacion en aprendizaje continuo: el checkpoint sirve como artefacto de estudio para reproducir el experimento Topo-CBP sobre embeddings y cabecera, comparando la deriva de representaciones frente al modelo base.
- Estudio de olvido catastrofico: permite analizar si ajustar solo `embed_tokens` y `lm_head` durante 120 pasos preserva el rendimiento del modelo original, siempre que se validen de forma independiente las metricas declaradas.
- Auditoria de integridad de pesos: el mecanismo de digest certificado descrito por el autor puede usarse como caso de estudio para pipelines de verificacion de checkpoints en entornos de investigacion.
- Reproduccion academica de tecnicas MoE: dado que conserva la arquitectura Mixtral-8x22B, es util para experimentar con enrutamiento disperso y ajuste parcial de capas.
- Analisis de cuantizacion 4-bit en modelos de gran escala: el repositorio permite estudiar el comportamiento de pesos cuantizados con bitsandbytes tras un ajuste ligero.
- Docencia y divulgacion sobre tecnicas de gobernanza de pesos: ilustra un enfoque no convencional de estabilidad-plasticidad, adecuado como material critico en cursos de aprendizaje profundo.
- No se recomienda su uso en produccion, atencion al cliente, generacion de codigo o tareas comerciales sin una evaluacion exhaustiva previa, dado que no hay evidencia publica de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara, sin metodologia detallada, una similitud semantica media del 90,9 % y una deriva de invarianza maxima de 0.0000000000. No se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 73,1 GB en 4-bit, por lo que se necesita aproximadamente 70-80 GB de VRAM para cargar los pesos completos sin offloading.
- GPU recomendadas: 2x A100 80 GB, 2x H100 80 GB o 4x A100 40 GB para reparto de pesos entre GPUs.
- GPU de consumo: no cabe en una GPU de consumo de 24 GB (RTX 4090, 3090) sin cuantizacion adicional u offloading a CPU/RAM, lo que degradaria notablemente la latencia.
- Opciones de despliegue: el autor solo documenta carga mediante `transformers` con `device_map="auto"`, `dtype=torch.bfloat16` y `low_cpu_mem_usage=True`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponible.
- Nota: el script de inferencia usa `MAX_NEW_TOKENS=160`, `temperature=0.3`, `top_p=0.9` y `repetition_penalty=1.15` como valores de referencia del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| frankmorales2020/Mixtral-8x22B-topo-cbp | 140,6 B | no disponible en la ficha | no disponible (base: 64k) | apache-2.0 | HuggingFace, 0 descargas |
| mistral-community/Mixtral-8x22B-v0.1-4bit (base) | 140,6 B | 39 B (dato publico del modelo base) | 64k | apache-2.0 | HuggingFace |
| mistralai/Mixtral-8x22B-v0.1 | 140,6 B | 39 B | 64k | apache-2.0 | HuggingFace |
| mistralai/Mixtral-8x22B-Instruct-v0.1 | 140,6 B | 39 B | 64k | apache-2.0 | HuggingFace |

La diferencia principal frente a las alternativas es que el checkpoint Topo-CBP solo modifica embeddings y cabecera y anade el marco metodologico Topo-CBP; el resto de pesos y la arquitectura son identicos al modelo base. Los datos de parametros activos y contexto de los modelos comparados proceden de la documentacion publica de Mixtral, no de este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos; al heredar los pesos del modelo base, es probable que arrastre los sesgos de Mixtral-8x22B-v0.1, pero no hay evaluacion disponible.
- Riesgo de alucinacion: no se ha evaluado. La pregunta de ejemplo de la model card sobre el operador LEFM y SOMALA emplea terminologia no estandar, lo que incrementa el riesgo de respuestas plausibles pero no verificadas.
- Limitaciones de contexto e idioma: no disponibles.
- Las afirmaciones del autor (deriva de invarianza 0.0000000000, veredicto PASS, similitud semantica 90,9 %) no van acompanadas de una metodologia reproducible publica en la informacion proporcionada y deben tratarse como no verificadas.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso independiente ni de revisiones externas.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `mistral-community/Mixtral-8x22B-v0.1-4bit` antes de reutilizarlo en productos.
- El modelo base es una version v0.1 (no instruct), por lo que no esta optimizado para seguir instrucciones ni para dialogos de asistente sin un prompt adecuado.
- Al tratarse de pesos en 4-bit procedentes del checkpoint base, la precision numerica ya esta reducida antes del ajuste.
- No dispone de pesos GGUF ni de integracion confirmada con servidores de inferencia habituales, lo que complica su despliegue operativo.
- Cualquier uso en produccion deberia ir precedido de evaluaciones propias de calidad, seguridad y sesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/frankmorales2020/Mixtral-8x22B-topo-cbp
- Modelo base: https://huggingface.co/mistral-community/Mixtral-8x22B-v0.1-4bit
- Codigo del autor (notebook `topo_cbp_mixtral.ipynb`): https://github.com/frank-morales2020/AST/blob/main/topo_cbp_mixtral.ipynb
- Repositorio GitHub del autor: https://github.com/frank-morales2020/AST
- Paper, blog o demo adicionales: no disponible

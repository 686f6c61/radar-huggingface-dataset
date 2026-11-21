# open-athena/Marin-Mochi-535B-A23B

## Resumen

Marin Mochi 535B-A23B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el proyecto open-athena dentro de la iniciativa Marin. Se trata de un artefacto de investigación: no es un modelo afinado para instrucciones, sino un export de pesos en BF16 de checkpoints de preentrenamiento retenidos de la fase denominada "Hero". El modelo almacena 535.477.106.688 parámetros totales y activa aproximadamente 22,76B de parámetros no pertenecientes a embeddings por token, de ahí la nomenclatura A23B.

La arquitectura GrugMoe combina 48 capas con un ancho oculto de 6144, 384 expertos enrutados (ocho seleccionados por token) y dos expertos compartidos, sobre un espacio latente de 3072 dimensiones. El checkpoint por defecto (`main`) usa una ventana de contexto de 65.536 tokens con atención deslizante de 2048 tokens, si bien el repositorio incluye checkpoints con contextos de 4K, 16K, 65K y 262K según la fase de entrenamiento.

Su relevancia actual es doble: por un lado, publica una familia completa de 57 checkpoints intermedios de preentrenamiento (del paso 6000 al 393491), lo que facilita la investigación sobre dinámicas de entrenamiento a gran escala; por otro, su despliegue exige un fork específico de vLLM con un cargador de expertos divididos, lo que lo convierte en un caso de estudio sobre los retos de servir modelos MoE de gran tamaño fuera de los ecosistemas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GrugMoe (mixture-of-experts, transformer con atención local/global híbrida) |
| Parametros totales | 535.477.106.688 |
| Parametros activos | ~22,76B no-embedding por token (redondeado a 23B) |
| Longitud de contexto | 65.536 tokens por defecto; checkpoints con 4K, 16K, 65K y 262K |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | safetensors (BF16, 193 shards, ~1,071 TB de payload) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 48 capas con ancho oculto de 6144. Cada capa contiene 384 expertos enrutados de los que se seleccionan ocho por token, más dos expertos compartidos, operando sobre un espacio latente de 3072 dimensiones. La atención emplea 48 cabezas de consulta con dimensión de cabeza 128; las capas locales usan 12 cabezas clave/valor, mientras que cada cuarta capa y la capa final emplean atención causal completa con seis cabezas clave/valor. Se incluyen convoluciones cortas aprendidas en las posiciones de clave, atención y MLP. El checkpoint por defecto aplica un multiplicador consulta/clave de 1,66 sobre las consultas normalizadas.

Los pesos del checkpoint `main` son el promedio de 11 checkpoints (pasos 385500 a 390000 en intervalos de 500, más el paso 390251) con rescalado de norma hyperball. El repositorio retiene 57 checkpoints de preentrenamiento en ramas `step-N`. Las fases tempranas usan contexto de 4K, las posteriores 16K, los pasos 378000, 384000 y 390251 usan 65K, y los pasos 390500 a 393491 usan 262K con esquema de artefacto GrugMoe 3 y escalado logarítmico de consultas en capas globales. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; el modelo se describe explícitamente como base model sin ajuste de instrucciones.

## Capacidades

- Generación de texto por completación: el modelo es un base model, por lo que debe usarse con prompts de continuación y no con formato de chat, pese a incluir una plantilla de chat.
- Razonamiento y conocimiento general derivados del preentrenamiento a gran escala, sin evaluación publicada que lo cuantifique.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Soporte de agentes y razonamiento multi-paso: no disponible; al no estar afinado para instrucciones, no se recomienda su uso directo en pipelines de agentes.
- Capacidad de contexto largo: el checkpoint final (`step-393491`) soporta 262K tokens; el checkpoint por defecto, 65.536.
- Checkpoints intermedios: 57 puntos de control que permiten estudiar la evolución de capacidades durante el preentrenamiento.

## Casos de uso

- Investigación sobre dinámicas de preentrenamiento: los 57 checkpoints retenidos permiten analizar cómo evolucionan las representaciones y las capacidades a lo largo de los pasos, comparando fases de 4K, 16K, 65K y 262K de contexto.
- Experimentos de continuación de preentrenamiento: al ser un base model con pesos BF16 y manifiestos de procedencia verificados, sirve como punto de partida para fine-tuning sobre dominios específicos.
- Evaluación de infraestructura de serving MoE: su requisito de un fork de vLLM con cargador de expertos divididos lo hace útil para validar despliegues de MoE de gran escala y comparar estrategias de paralelismo de expertos.
- Procesamiento de documentos largos en investigación: el checkpoint de 262K tokens permite experimentar con tareas de summarización o recuperación sobre corpus extensos, siempre en modo completación.
- Estudio de enrutamiento de expertos: con 384 expertos y ocho activos por token, es un banco de pruebas para analizar balanceo de carga, especialización de expertos y técnicas de poda.
- Generación de texto sintético para investigación: puede emplearse para producir corpus de completación controlados, con la advertencia de revisar sesgos y alucinaciones antes de usarlos.
- Reproducibilidad de merges de checkpoints: el recetario de promedio de 11 checkpoints con rescalado hyperball documentado en el repositorio sirve como referencia metodológica para otros equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la issue del repositorio de Marin con detalles de merge y resultados de evaluación, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el payload de pesos es de 1,071 TB, por lo que se requiere un clúster multi-GPU; no cabe en una sola GPU convencional.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, se necesitan nodos con múltiples aceleradores de alta gama (A100, H100 o equivalentes) y paralelismo de expertos.
- GPU de consumo: no viable. El modelo no cabe en RTX 4090 ni en ninguna GPU consumer individual, ni siquiera con cuantización extrema, dado el tamaño total de parámetros.
- Opciones de despliegue: exclusivamente el fork de vLLM de Marin con su cargador de expertos divididos; los checkpoints de 262K con esquema 3 requieren además soporte de escalado logarítmico de consultas globales. La carga con Transformers genérico no está validada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Marin Mochi 535B-A23B | 535B | ~23B | 65K (hasta 262K) | OpenMDW 1.1 | Artefacto de investigación, sin benchmarks publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos de referencia con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en producción es bajo responsabilidad del usuario.
- Es un base model: la plantilla de chat incluida no implica ajuste de instrucciones, por lo que las respuestas conversacionales pueden ser incoherentes o no seguir formatos.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones publicadas, no hay estimaciones de fiabilidad factual.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni análisis de sesgos.
- Idiomas soportados no documentados; el rendimiento fuera del inglés (si el corpus fue mayoritariamente inglés) es incierto.
- Restricciones de licencia: OpenMDW 1.1; debe revisarse el texto completo de la licencia antes de cualquier uso comercial.
- Despliegue frágil: requiere un fork específico de vLLM y un cargador concreto; los cargadores GrugMoe antiguos rechazan el esquema 3, y la paridad numérica con el entrenamiento no está establecida.
- Tamaño prohibitivo: 1,071 TB en BF16 y 193 shards dificultan el almacenamiento, la transferencia y el serving.
- Contexto variable según rama: usar el checkpoint equivocado con la configuración de contexto esperada puede degradar resultados; cada rama tiene su propio `config.json` y model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-athena/Marin-Mochi-535B-A23B
- Rama de checkpoints fusionados: https://huggingface.co/open-athena/Marin-Mochi-535B-A23B/tree/merged
- Checkpoint final de 262K: https://huggingface.co/open-athena/Marin-Mochi-535B-A23B/tree/step-393491
- Detalles de merge y evaluación: https://github.com/marin-community/marin/issues/8435#issuecomment-6676769570
- Fork de vLLM de Marin: https://github.com/marin-community/vllm
- Cargador de expertos divididos (PR): https://github.com/marin-community/vllm/pull/77
- Soporte de escalado logarítmico de consultas globales (PR): https://github.com/marin-community/vllm/pull/121
- Tokenizer: https://huggingface.co/marin-community/marin-tokenizer

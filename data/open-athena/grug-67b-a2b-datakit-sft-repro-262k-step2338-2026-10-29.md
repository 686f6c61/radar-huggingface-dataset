# open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step2338-2026.10.29

## Resumen

Grug-67B-A2B-Datakit-SFT-Repro-262K-Step2338-2026.10.29 es un checkpoint intermedio de ajuste supervisado (SFT) publicado por el laboratorio open-athena sobre su modelo base Snowball-67B-A2B, un transformer de mezcla de expertos (MoE) con 67.078.882.816 parámetros totales y 2.000 millones de parámetros activos por token, según la nomenclatura A2B del identificador. El modelo está entrenado para generación de texto conversacional y se distribuye en formato safetensors, con un repositorio de 134,2 GB que refleja pesos en precisión completa o de 16 bits.

El nombre del checkpoint indica que se trata de una reproducción (Repro) del entrenamiento SFT sobre el dataset Datakit, detenida en el paso 2338, con una ventana de contexto nominal de 262.144 tokens (262K) y una variante de atención con cabezas QK de dimensión 175 y sesgo de 8 (qk175-skew8), herencia directa del modelo base. Es, por tanto, un artefacto de investigación orientado a reproducibilidad y evaluación de trayectorias de entrenamiento, no una versión final pulida para producción.

Su relevancia actual es doble: por un lado, permite a la comunidad inspeccionar cómo evoluciona un MoE de gran tamaño durante el SFT antes de la convergencia; por otro, su contexto de 262K y su arquitectura de expertos con solo 2B activos lo sitúan en la categoría de modelos eficientes en inferencia pero con capacidad de contexto muy extendida. El acceso está restringido (gated) y la licencia es OpenMDW-1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia grug_moe |
| Parámetros totales | 67.078.882.816 (67,08B) |
| Parámetros activos | 2B (según nomenclatura A2B) |
| Longitud de contexto | 262.144 tokens (262K, según identificador) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos de la familia `grug_moe`, con 67,08B de parámetros totales y aproximadamente 2B activos por token, lo que reduce el coste computacional de inferencia en comparación con un modelo denso del mismo tamaño. El identificador del modelo base (`snowball-67b-a2b-base-262k-qk175-skew8`) sugiere una atención con cabezas QK de dimensión 175 y un sesgo de 8, aunque no se dispone de documentación técnica pública que detalle el mecanismo exacto ni el número de expertos, el enrutador o la proporción de capas MoE frente a densas.

El checkpoint corresponde a un ajuste supervisado (SFT) sobre el dataset Datakit, detenido en el paso 2338 de una reproducción de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal; el único rasgo técnico destacable es la ventana de contexto de 262K, que exige estrategias de atención eficiente no detalladas.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento de propósito general y respuesta a instrucciones, derivado del entrenamiento SFT.
- Capacidad de contexto largo: ventana nominal de 262.144 tokens, adecuada para documentos extensos o historiales de conversación prolongados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el pipeline declarado es únicamente `text-generation`.
- Capacidades multilingües: no disponibles; la ficha de Hugging Face no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Evaluación de trayectorias de SFT: investigadores pueden cargar este checkpoint intermedio (paso 2338) para comparar su comportamiento con checkpoints anteriores y posteriores de la misma reproducción, aislando el efecto del dataset Datakit en la calidad conversacional.
- Análisis de documentos largos: con 262K tokens de contexto, el modelo puede procesar contratos, informes técnicos o expedientes completos en una sola pasada, sin necesidad de fragmentación ni recuperación externa.
- Reproducción de experimentos: al ser un artefacto etiquetado como `Repro`, sirve para validar pipelines de entrenamiento y comparar recetas de SFT en un MoE de 67B con 2B activos.
- Generación de texto en entornos con presupuesto de cómputo limitado: al activar solo ~2B parámetros por token, la inferencia es más barata que la de un denso de 67B, lo que permite desplegarlo en infraestructura moderada para tareas de generación conversacional.
- Investigación sobre atención de contexto extendido: la combinación de 262K de ventana y cabezas QK con sesgo permite estudiar degradación de calidad y coste de atención en secuencias muy largas.
- Base para ajuste adicional: al ser un checkpoint intermedio con licencia OpenMDW-1.1, puede servir como punto de partida para fine-tuning específico de dominio, siempre que se respeten las condiciones de la licencia y del acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 67,08B parámetros totales, los pesos en FP16 ocupan aproximadamente 134 GB, lo que coincide con el tamaño del repositorio (134,2 GB). En cuantización de 8 bits se reduciría a ~67 GB y en 4 bits a ~34 GB, aunque no se confirman formatos de cuantización publicados.
- GPU recomendadas: para FP16 se requiere un nodo multi-GPU (por ejemplo, 2× H100 80GB o 4× A100 80GB). Para cuantización de 4 bits podría caber en una sola H100 80GB o A100 80GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en precisión completa; solo sería viable con cuantizaciones agresivas no confirmadas y aun así con riesgo de desbordamiento por los buffers de atención en contexto largo.
- Opciones de despliegue: al estar en formato `transformers`/safetensors y declarar `endpoints_compatible`, es compatible con Hugging Face Inference Endpoints y con frameworks como vLLM o TGI, siempre que soporten la arquitectura `grug_moe`. No se confirma soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La activación de ~2B parámetros por token sugiere un throughput superior al de un denso de 67B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grug-67B-A2B-Datakit-SFT-Repro-262K-Step2338 | 67,08B | ~2B | 262K | OpenMDW-1.1 | Gated en Hugging Face |
| Snowball-67B-A2B-base-262k-qk175-skew8 (modelo base) | 67B (aprox.) | ~2B | 262K | no disponible | no disponible |
| Alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros laboratorios con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 2338), no una versión final: la calidad conversacional y la coherencia pueden ser inferiores a las de un modelo convergido.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que limita la reproducibilidad inmediata.
- Idiomas no declarados: no hay garantía de rendimiento multilingüe ni de calidad en castellano.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual ni mecanismos de mitigación.
- Sesgos conocidos: no disponibles; al no publicarse la composición del dataset Datakit, no es posible evaluar sesgos de entrenamiento.
- Licencia OpenMDW-1.1: es necesario revisar sus términos antes de uso comercial; no se confirma aquí si permite explotación comercial sin restricciones.
- Sin datos de benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni otras pruebas, por lo que no se recomienda su adopción en producción sin evaluación propia.
- Soporte de tool calling y agentes no documentado: no debe asumirse su funcionamiento en pipelines de agentes sin pruebas previas.
- Contexto de 262K: el coste de atención crece con la longitud y puede degradar la calidad en secuencias muy largas; no se documentan técnicas de atención eficiente.

## Enlaces

- Hugging Face: https://huggingface.co/open-athena/Grug-67B-A2B-Datakit-SFT-Repro-262K-Step2338-2026.10.29
- Modelo base: https://huggingface.co/open-athena/snowball-67b-a2b-base-262k-qk175-skew8
- Licencia OpenMDW-1.1: no disponible en la información proporcionada
- Paper, blog o repositorio: no disponible en la información proporcionada

# sepsy070716/Qwen3.5-A3B-Research

## Resumen

Qwen3.5-A3B-Research es un archivo de investigación publicado por el usuario sepsy070716 sobre el modelo base Qwen/Qwen3.5-2B. No es un modelo final ni un sustituto del 4B de referencia: la propia model card lo describe como «research archive, not a completed 4B replacement». El repositorio documenta una línea de experimentos (hasta la iteración V38, con mediciones cerradas el 2026-10-15) centrada en conversión de capas FFN con presupuesto limitado, enrutamiento tipo MoE, recuperación de capacidades, retención multimodal y controles densos emparejados.

El entregable descargable más reciente no es un checkpoint MoE ni un adaptador PEFT, sino dos candidatos densos basados en el modelo 2B con adaptadores de proyección descendente de rango 72 sobre las FFN. El recuento declarado es de 2.227.397.440 parámetros, incluyendo la torre de visión nativa y los adaptadores sin fusionar, y excluyendo el MTP almacenado que no se utiliza. Solo se entrenaron 14.155.776 parámetros de adaptador, manteniendo congelados los pesos de visión, atención y FFN base.

Su relevancia es metodológica más que de producto: publica resultados negativos, contratos de evaluación, guardas de no regresión y reducciones de NLL medidas, en lugar de reivindicar una mejora compuesta. La model card declara explícitamente que los objetivos de rendimiento frente al 4B nativo (≥115 % compuesto, ≥1,21× de throughput) no se han demostrado y que el contrato de evaluación completo no se ha ejecutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5-2B con adaptadores de proyección descendente de rango 72 sobre las FFN; torre de visión nativa congelada. No es un checkpoint MoE |
| Parametros totales | 2.227.397.440 (incluye visión nativa y adaptadores sin fusionar; excluye MTP almacenado no usado) |
| Parametros activos | No aplica: el candidato más reciente es denso. No se declaran resultados de MoE, entrenamiento de router ni Adaptive Top-K para V38 |
| Parametros entrenados | 14.155.776 por variante (adaptadores); pesos de visión, atención y FFN base congelados |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; toda la evaluación documentada se hizo en BF16 sobre MPS |
| Idiomas soportados | ko, en, zh, ja, es, de |
| Licencia | No disponible |
| Formato de pesos | No disponible (la model card no especifica safetensors, GGUF ni formato de empaquetado; indica que los adaptadores no son PEFT) |
| Modelo base | Qwen/Qwen3.5-2B |
| Variantes incluidas | V38 wide4 (KL anchor 4) y V38 wide16 (KL anchor 16) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El punto de partida es un transformer denso Qwen3.5-2B con capacidad de entrada de imagen. Sobre él se insertan adaptadores de proyección descendente de rango 72 en las capas FFN, mientras permanecen congelados los pesos de visión, atención y FFN base. Las dos variantes publicadas (wide4 y wide16) parten del mismo checkpoint denso V35 y solo difieren en el peso de la KL de anclaje: 4 frente a 16. El profesor que suministra la KL es un V35 sin cambios, aplicando top-32 más el resto sobre las entradas de retención y excluyendo aritmética.

El entrenamiento consta de 172 pasos por condición, con esta composición: 72 presentaciones de tipo «thinking», 48 de modelado de lenguaje, 40 de imagen y 12 de JSON. Frente a V37, que reutilizaba 12 documentos en la retención, V38 emplea 48 documentos únicos. La selección de checkpoint se hizo por desarrollo, eligiendo el paso 172, y ambas variantes superaron las guardas de no regresión predefinidas del piloto. El autor incluye las dos variantes en la exportación en lugar de declarar un ganador único a partir de resultados de esta escala, y mantiene V35 como rollback de referencia.

Las etapas anteriores del proyecto incluyen separación sintética de FFN, validación de shards, un baseline disperso derivado del 2B (Student v2 y V3), experimentos de conversión y recuperación sembrados desde el 4B (V4–V8) y trabajo posterior hasta V38. Las cifras históricas de error de experto completo (≈2,68e-7), MSE Top-4 (0,004062) y MSE adaptativo (0,003478) proceden de notas sintéticas y el propio autor advierte que no deben interpretarse como rendimiento extremo a extremo de Qwen3.5.

## Capacidades

- Generación de texto en seis idiomas declarados (coreano, inglés, chino, japonés, español y alemán), con mejora reportada en un conjunto pequeño de confirmación.
- Razonamiento aritmético en modo «thinking»: 12/12 respuestas correctas en el esquema sintético de evaluación, con 30 ecuaciones verificadas por candidato.
- Aritmética en modo «instant»: 0/12 en todos los modelos evaluados, incluidos los nativos; es una limitación del conjunto de evaluación, no una capacidad adquirida.
- Entrada de imagen: la torre de visión se conserva y se obtienen 10/10 en contenido de imagen sobre el conjunto del piloto, aunque la comprensión visual amplia queda sin verificar.
- Salida JSON estructurada: 6/6 en el conjunto de evaluación del piloto.
- Retención de documentos medida por NLL, con reducciones del 0,5077 % (conjunto de regresión) y 0,6346 % (36 documentos nuevos) para wide4 frente a V35.
- No hay soporte declarado de tool calling, function calling, agentes, multi-step reasoning, audio ni decodificación especulativa.
- No se declaran capacidades MoE efectivas: los tags «mixture-of-experts» y «multimodal» del repositorio no se corresponden con el entregable denso final.

## Casos de uso

- Reproducción de experimentos de conversión FFN con presupuesto de parámetros: el repositorio incluye el registro completo de experimentos, el contrato de evaluación y los scripts de reproducción, lo que permite replicar la secuencia hasta V38 y contrastar las guardas de no regresión.
- Estudio de resultados negativos en investigación de MoE: sirve como caso documentado de cómo una separación sintética de expertos con error bajo no se traduce en calidad retenida, útil para diseñar experimentos que separen factibilidad de rendimiento real.
- Investigación sobre adaptadores de bajo rango en modelos multimodales congelados: los 14,2 M de parámetros entrenados por variante y el rango 72 declarado permiten estudiar la relación entre capacidad de adaptador, retención de documentos y preservación de visión.
- Prototipado en hardware de consumo: con 2,23 B de parámetros y evaluación en BF16 sobre MPS, el modelo cabe en GPUs de 8-12 GB y en Apple Silicon, lo que facilita experimentos de ajuste fino a bajo coste.
- Evaluación multilingüe comparada: al cubrir seis idiomas y publicar métricas por conjunto, se puede usar como banco de pruebas para estudiar degradación por idioma tras un ajuste con pocos pasos.
- Docencia y divulgación sobre metodología de evaluación: el contrato de evaluación, la distinción entre filas reutilizadas y filas nuevas, y la política de no agregar conjuntos distintos en una mejora compuesta son material directo para formar criterio metodológico.
- Diseño de métricas de retención de documentos: los valores de NLL sobre conjuntos de regresión y sobre documentos nuevos (3,521222 y 3,759998 para wide4) sirven como referencia para construir protocolos de olvido catastrófico en ajustes con presupuesto reducido.

## Benchmarks y rendimiento

Resultados publicados para V38 (generación greedy, BF16 en MPS, caché KV, máximo 768 tokens nuevos). No hay MMLU, HumanEval ni GSM8K en la información disponible.

| Modelo | Aritmética thinking /12 | Aritmética instant /12 | Contenido de imagen /10 | JSON /6 | NLL documentos regresión ↓ | NLL 36 documentos nuevos ↓ |
|---|---:|---:|---:|---:|---:|---:|
| 2B nativo | 7 | 0 | 10 | 6 | 3,559683 | 3,799611 |
| V35 dense rollback | 8 | 0 | 10 | 6 | 3,539190 | 3,784009 |
| V38 wide4 | 12 | 0 | 10 | 6 | 3,521222 | 3,759998 |
| V38 wide16 | 12 | 0 | 10 | 6 | 3,528912 | 3,772937 |
| 4B nativo (referencia) | 11 | 1 | 7 | 6 | 3,392136 | 3,515886 |

Reducciones de NLL frente a V35: wide4, 0,5077 % en regresión y 0,6346 % en los 36 documentos nuevos; wide16, 0,2904 % y 0,2926 %. El autor subraya que son reducciones de pérdida, no ganancias de capacidad compuesta. El 4B nativo mantiene mejor NLL de documentos que ambos candidatos.

Evidencia y cobertura: V38 genera 284 filas nuevas de evaluación (104 de regresión de candidatos y 180 de documentos frescos) sobre cinco modelos; las 156 filas fijas de referencia de V37 se reutilizan explícitamente y no son inferencia nueva. La aritmética emplea solo dos esquemas sintéticos y los 36 documentos nuevos no constituyen un benchmark oficial ni se ha verificado ausencia de solapamiento con el pretraining.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento declarado de 2.227.397.440 parámetros (no publicada por el autor): en BF16, unos 4,5 GB solo de pesos y aproximadamente 6-8 GB contando caché KV y activaciones; en INT8, unos 2,5 GB de pesos; en INT4, unos 1,3 GB. Son estimaciones, no mediciones del repositorio.
- Configuración realmente documentada: BF16 sobre MPS (Apple Silicon), generación greedy, con caché KV y un máximo de 768 tokens nuevos.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con 8 GB o más debería alojar los pesos en BF16 con margen para caché; no hay validación publicada en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, por el recuento de parámetros; el autor solo valida MPS, no tarjetas concretas.
- Opciones de despliegue: no disponible. La model card no menciona vLLM, llama.cpp, Ollama ni TGI, y advierte que los adaptadores no son PEFT, por lo que la carga estándar de adaptadores no aplica y se requiere el empaquetado del autor (REPRODUCE.md).
- Latencia y throughput: no hay comparación controlada. La latencia de los candidatos y la latencia de referencia heredada no se midieron en igualdad de condiciones, y el objetivo de ≥1,21× frente al 4B nativo figura como no demostrado.
- Almacenamiento: el repositorio ocupa 0,2 GB, muy por debajo de lo esperable para pesos completos en BF16, lo que sugiere que no contiene el modelo base completo.

## Comparativa con modelos similares

Comparación con las referencias internas del propio archivo (misma tarea y misma línea experimental). No se dispone de datos de modelos externos comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Thinking arit. /12 | Imagen /10 | NLL regresión ↓ | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| V38 wide4 | 2,227 B | No disponible | 12 | 10 | 3,521222 | No disponible | Variante de investigación |
| V38 wide16 | 2,227 B | No disponible | 12 | 10 | 3,528912 | No disponible | Variante de investigación |
| V35 dense rollback | No disponible | No disponible | 8 | 10 | 3,539190 | No disponible | Rollback de referencia del autor |
| Qwen3.5-2B nativo | No disponible (2B nominal) | No disponible | 7 | 10 | 3,559683 | No disponible | Modelo base |
| 4B nativo (referencia) | No disponible (4B nominal) | No disponible | 11 | 7 | 3,392136 | No disponible | Referencia objetivo |

Lectura: los candidatos V38 igualan o superan al 4B nativo en el esquema aritmético sintético (12 frente a 11) y en contenido de imagen (10 frente a 7), pero pierden en NLL de documentos en ambos conjuntos. El 4B nativo es el único que acierta en aritmética instantánea (1/12). El objetivo compuesto de ≥115 % frente al 4B no se ha evaluado con el contrato completo.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un archivo de investigación y el propio autor lo califica como «not a completed 4B replacement».
- Objetivos incumplidos o no medidos: compuesto ≥115 % frente al 4B nativo (no demostrado, contrato incompleto), throughput ≥1,21× (no demostrado para el candidato reciente) y alucinación ≤50 % (no medida con el protocolo de factibilidad requerido).
- El 4B nativo sigue siendo mejor en NLL de documentos: 3,392136 y 3,515886 frente a 3,521222 y 3,759998 de wide4.
- La aritmética instantánea es 0/12 en todos los modelos, incluidos los nativos; el conjunto de evaluación solo cubre dos esquemas sintéticos.
- Los resultados se apoyan en conjuntos pequeños: 284 filas nuevas, 36 documentos frescos y 156 filas de referencia reutilizadas de V37 que no constituyen inferencia nueva.
- Riesgo de solapamiento con el pretraining en los 36 documentos nuevos; no es un benchmark oficial.
- Los tags del repositorio («mixture-of-experts», «multimodal», «custom-adapter») pueden inducir a error: el entregable final es denso, no hay MoE, no hay entrenamiento de router y no se reclama Adaptive Top-K para V38.
- Los adaptadores no son PEFT, por lo que las herramientas estándar de carga de adaptadores no sirven; es necesario usar el empaquetado del autor.
- La comprensión visual amplia no está verificada: el 10/10 en imagen corresponde al conjunto del piloto, no a una evaluación visual general.
- Licencia no disponible: no hay autorización explícita de uso comercial, y el modelo derivado queda además sujeto a las condiciones del Qwen3.5-2B original.
- Sesgos conocidos: no documentados en la información disponible.
- Cobertura idiomática: seis idiomas declarados, pero la mejora se reporta sobre un «small confirmation set»; no hay evaluación por idioma a escala.
- Sin pipeline declarado, 0 descargas y 0 likes: no hay evidencia de uso externo ni de validación por terceros.
- Reputación de resultados: las cifras de MSE y error de experto de las primeras etapas proceden de notas históricas sintéticas y el autor pide no tratarlas como mediciones revalidadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Vista general de la investigación (coreano): https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/research/qwen35-moe-a3b/README.md
- Índice de informes: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/REPORT_INDEX.md
- Registro de experimentos: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/research/qwen35-moe-a3b/EXPERIMENTS.md
- Contrato de evaluación final: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/research/qwen35-moe-a3b/EVALUATION_TARGETS.md
- Integración multimodal y validación de pesos: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/research/qwen35-moe-a3b/INTEGRATION_2026-10-12.md
- Informe completo V38: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/research/qwen35-moe-a3b/V38_WIDE_RETENTION_2026-10-15.md
- Uso portable y límites de reproducibilidad: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/REPRODUCE.md
- Fuentes y atribución de materiales de terceros: https://huggingface.co/sepsy070716/Qwen3.5-A3B-Research/blob/main/THIRD_PARTY.md

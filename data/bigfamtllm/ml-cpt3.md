# BigFamTLLM/ml-cpt3

## Resumen

ml-cpt3 es un modelo de lenguaje de tipo base (solo preentrenado, sin ajuste por instrucciones ni alineamiento de seguridad) desarrollado por el equipo BigFamTLLM en el marco del curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata del punto de control 3 de 10 de la fase de preentrenamiento continuado (CPT) sobre noruego, dentro de una cadena que parte de un modelo multilingüe sin noruego (ml-base), pasa por un intercambio de tokenizador y un entrenamiento solo de embeddings (ml-emb) y continúa con la adaptación al noruego. El modelo tiene 2.115.305.088 parámetros totales (2.045.673.088 sin la matriz de embeddings atada) y una longitud de contexto de 4.096 tokens.

El objetivo del experimento es responder a una pregunta de investigación concreta: si preentrenar en otros idiomas y adaptar después al noruego supera a entrenar desde cero en noruego con los mismos recursos, y tras cuántos tokens noruegos los modelos adaptados alcanzan al modelo nativo. Para ello se entrenaron tres modelos base idénticos salvo por idioma y tokenizador (noruego, danés y multilingüe sin noruego), con 26.000 millones de tokens cada uno, y se sometió a los dos últimos a un intercambio de tokenizador noruego, una fase de embeddings y un CPT sobre los datos del modelo noruego.

La relevancia de ml-cpt3 es fundamentalmente metodológica y académica: permite estudiar la curva de adaptación lingüística checkpoint a checkpoint y comparar el coste de adaptar un modelo multilingüe frente a entrenar desde cero. No es un modelo listo para producción conversacional, ya que carece de instrucciones y de ajuste de seguridad, y su licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso estilo Qwen3 (36 capas, hidden size 2.176, 34 cabezas de atención de 64, 17 cabezas key/value, FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE base 10.000, embeddings atados, sin biases) |
| Parámetros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el repo solo contiene safetensors en bf16; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Qwen3 con 36 capas, dimensión oculta de 2.176, 34 cabezas de atención de 64 dimensiones y 17 cabezas key/value (GQA), FFN SwiGLU de 6.528, normalización RMSNorm con QK-norm, RoPE con base 10.000 y embeddings atados sin biases. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2) con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencia de 4.096 tokens, batch global de 128 (524.288 tokens por iteración), AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y recorte de gradiente 1,0.

Los datos de preentrenamiento originales del modelo multilingüe fueron: inglés 80 %, danés, alemán y sueco 6,7 % cada uno, y ningún dato de noruego (HPLT 4.0). Sobre esa base se aplicó el tokenizador BPE noruego de 32.000 tokens del equipo (`mix_BM7_2_NN8_1`, entrenado con Bokmål y Nynorsk), con copia de embeddings cuando el token existía en ambos vocabularios y media de las piezas en caso contrario, seguido de 1.000 iteraciones entrenando solo los embeddings (tasa 1e-4 tras 100 iteraciones de warm-up). El CPT se ejecuta sobre los datos del modelo noruego (Bokmål 85 %, Nynorsk 15 %) con tasa de aprendizaje 5e-4 tras 2.000 iteraciones de warm-up y programación warmup-stable. ml-cpt3 corresponde a la iteración 14.580 de 48.600 del CPT y acumula 8.168.407.040 tokens noruegos leídos. Existe una variante con annealing posterior sobre datos noruegos de alta calidad (100 iteraciones de warm-up hasta 5e-4 y decaimiento lineal a cero en 916 iteraciones).

## Capacidades

- Generación de texto autoregresiva en inglés, danés, alemán, sueco y noruego (Bokmål y Nynorsk), heredada del modelo multilingüe y del CPT noruego.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales sin ejemplos en contexto (few-shot).
- Capacidad de continuación de texto y modelado del lenguaje, adecuada para evaluación de perplejidad y experimentos de adaptación lingüística.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Sin ajuste de seguridad ni alineamiento; no se documentan filtros ni mitigaciones.

## Casos de uso

- Investigación sobre adaptación lingüística: comparar la perplejidad en noruego de ml-cpt3 con los checkpoints 1, 2, 4 y siguientes, y con el modelo nativo no-base, para trazar la curva de recuperación de competencia lingüística a lo largo del CPT.
- Estudio de transferencia entre lenguas: usar el modelo como punto intermedio entre ml-base y ml-cpt10 para analizar cuánto conocimiento multilingüe se conserva tras 8.168 millones de tokens noruegos y cómo evoluciona la perplejidad en danés, alemán y sueco.
- Evaluación de tokenizadores: al emplear el BPE noruego de 32.000 tokens, sirve para medir el impacto del intercambio de tokenizador en la eficiencia de codificación y en la calidad de la generación en Bokmål y Nynorsk.
- Generación de texto en noruego para corpus sintéticos de investigación: el modelo puede producir continuaciones de texto en Bokmål y Nynorsk para experimentos controlados, siempre con revisión humana y sin uso en producción.
- Punto de partida para fine-tuning supervisado: al ser un modelo base de 2.100 millones de parámetros con contexto de 4.096 tokens, puede ajustarse en tareas concretas de clasificación o generación en noruego con recursos modestos.
- Reproducibilidad académica: sirve como referencia para replicar el experimento IN5640 con los mismos datos HPLT 4.0 y la misma configuración de Megatron-LM en 8 GPU GH200.
- Análisis de sesgos y contaminación lingüística: permite estudiar qué sesgos del corpus inglés persisten tras el CPT en noruego, comparando salidas con el modelo nativo no-base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,2 GB solo para los pesos (el tamaño del repo es de 4,2 GB), más memoria para el estado de atención y el KV cache; con contexto completo de 4.096 tokens y batch pequeño, el consumo realista ronda los 6-8 GB.
- En cuantización de 8 bits, los pesos ocuparían aproximadamente 2,1 GB; en 4 bits, alrededor de 1,1 GB, aunque no se publican versiones GGUF oficiales y habría que generarlas.
- GPU recomendadas: NVIDIA A100, H100 o GH200 para entrenamiento y evaluación a gran escala; para inferencia basta una RTX 4090 (24 GB), una RTX 3090 (24 GB) o incluso una GPU consumer de 8-12 GB en cuantización.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en bf16 con contexto reducido, y en 4-6 GB con cuantización de 4 bits.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (el modelo está etiquetado como compatible con endpoints), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ml-cpt3 (este modelo) | 2.115.305.088 | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Hugging Face, checkpoint 3 de 10 del CPT multilingüe |
| ml-base (BigFamTLLM) | mismo tamaño (arquitectura idéntica) | 4.096 | en, da, de, sv (sin noruego) | no disponible | Hugging Face, modelo base multilingüe de partida |
| no-base (BigFamTLLM) | mismo tamaño (arquitectura idéntica) | 4.096 | no, nb, nn | no disponible | Hugging Face, referencia entrenada desde cero en noruego |
| da-base (BigFamTLLM) | mismo tamaño (arquitectura idéntica) | 4.096 | da | no disponible | Hugging Face, modelo base danés de partida para la rama da-cpt |

La comparación más informativa es interna al experimento: ml-cpt3 frente a ml-base (sin adaptación al noruego), no-base (entrenado desde cero en noruego) y los checkpoints posteriores del mismo CPT. No se dispone de datos de benchmarks que permitan comparar el rendimiento con modelos externos de tamaño similar.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni por seguridad, por lo que no debe usarse como asistente conversacional sin fine-tuning adicional.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- Riesgo elevado de alucinación y de generar contenido sesgado o inapropiado, al no existir alineamiento ni filtros de seguridad.
- Es un checkpoint intermedio (iteración 14.580 de 48.600): su competencia en noruego es previsiblemente inferior a la de los checkpoints 4-10 y a la del modelo nativo no-base.
- El corpus de preentrenamiento es web (HPLT 4.0), con la calidad y los sesgos asociados a datos raspados de internet.
- El soporte de noruego se limita a Bokmål y Nynorsk; no se documenta cobertura de otras variantes ni de sami.
- No se publican versiones cuantizadas ni GGUF oficiales; cualquier cuantización corre por cuenta del usuario.
- El modelo está vinculado a un experimento académico con 8 GPU GH200 por ejecución; no se documentan pruebas de robustez en dominios especializados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt3
- Modelo base inmediato (embeddings): https://huggingface.co/BigFamTLLM/ml-emb
- Modelo multilingüe de partida: https://huggingface.co/BigFamTLLM/ml-base
- Modelo multilingüe con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego de referencia con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo danés de partida: https://huggingface.co/BigFamTLLM/da-base
- Checkpoint 3 del CPT multilingüe con annealing: https://huggingface.co/BigFamTLLM/ml-cpt3-anneal
- Checkpoint 2 del CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt2
- Checkpoint 4 del CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt4
- Checkpoint 10 del CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt10
- Repositorio de Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- Curso IN5640, Universidad de Oslo: no disponible

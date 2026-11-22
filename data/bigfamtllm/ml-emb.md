# BigFamTLLM/ml-emb

## Resumen

ml-emb es un modelo de lenguaje base de 2.115.305.088 parámetros (2.045.673.088 sin la matriz de embeddings atada) desarrollado por BigFamTLLM, un equipo vinculado al curso IN5640 *Developing Large Language Models* de la Universidad de Oslo (otoño de 2026). Se trata de un paso intermedio dentro de un experimento mayor de 50 modelos que investiga si el preentrenamiento multilingüe seguido de adaptación al noruego supera al entrenamiento desde cero en noruego con los mismos recursos computacionales.

Técnicamente, ml-emb es el modelo multilingüe `ml-base` tras sustituir su tokenizador original por un tokenizador BPE noruego de 32.000 tokens y ejecutar 1.000 iteraciones de entrenamiento en las que únicamente se actualiza la matriz de embeddings, permaneciendo el resto de pesos congelados. El resultado es el punto de partida de la fase de preentrenamiento continuado (continual pretraining) sobre datos noruegos, no un modelo final utilizable en producción.

Su relevancia es fundamentalmente metodológica y académica: permite aislar el efecto de la adaptación del vocabulario frente al del preentrenamiento continuado, y sirve como referencia para estudiar la curva de recuperación de competencia lingüística en noruego (bokmål y nynorsk) a lo largo de los checkpoints posteriores del experimento. Es un modelo base sin ajuste por instrucciones ni alineamiento de seguridad, con una ventana de contexto de 4.096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso estilo Qwen3 (transformer) |
| Parametros totales | 2.115.305.088 (2.045.673.088 sin la matriz de embeddings atada) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, da, de, sv, no, nb, nn |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Qwen3 con 36 capas, dimensión oculta de 2.176, 34 cabezas de atención de 64 dimensiones, 17 cabezas clave/valor (GQA), FFN SwiGLU de 6.528, RMSNorm, QK-norm, RoPE con base 10.000, embeddings atados y sin sesgos. El entrenamiento se realizó con Megatron-LM (core 0.17.1) sobre el supercomputador Olivia (Sigma2), con 8 GPU NVIDIA GH200 por ejecución en bf16, secuencias de 4.096 tokens y batch global de 128 (524.288 tokens por iteración), usando AdamW (β 0,9 y 0,95, ε 1e-8), weight decay 0,1 y gradient clipping 1,0.

El modelo base `ml-base` se preentrenó con un 80 % de inglés, un 6,7 % cada uno de danés, alemán y sueco, y ningún dato de noruego (HPLT 4.0), acumulando 26.000 millones de tokens. Sobre él se aplicó un intercambio de tokenizador al BPE noruego del equipo (`mix_BM7_2_NN8_1`, 32.000 tokens): cuando un token existe en ambos vocabularios se copia el embedding, y en caso contrario se usa la media de las piezas en que el tokenizador antiguo lo dividía. Después se ejecutaron 1.000 iteraciones sobre datos noruegos (85 % bokmål, 15 % nynorsk, en el mismo orden que el modelo noruego de referencia) entrenando solo la matriz de embeddings, con learning rate 1e-4 tras 100 iteraciones de warm-up. En total, el modelo ha leído 524.288.000 tokens noruegos en esta fase.

## Capacidades

- Generación de texto autoregresiva en inglés, danés, alemán, sueco, noruego, bokmål y nynorsk, condicionada por el preentrenamiento multilingüe heredado de `ml-base`.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales.
- Capacidad de continuación de texto y modelado del lenguaje, adecuada para evaluación de perplejidad y para servir de inicialización de fases posteriores.
- No dispone de soporte verificado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- No dispone de modo thinking, visión ni audio.
- Capacidades multilingües limitadas a los idiomas del preentrenamiento, con competencia en noruego todavía en fase de adaptación (solo embeddings entrenados).

## Casos de uso

- Investigación sobre adaptación de tokenizadores: sirve para medir, mediante perplejidad en bokmål y nynorsk, cuánto de la brecha lingüística se cierra solo con el intercambio de vocabulario y el ajuste de embeddings, antes de cualquier preentrenamiento continuado.
- Punto de partida reproducible de preentrenamiento continuado: se usa como inicialización del checkpoint `ml-cpt1` y siguientes, permitiendo comparar curvas de recuperación frente a `da-emb` y a `no-base`.
- Evaluación de la calidad del vocabulario noruego: al ser el primer modelo del pipeline con el tokenizador `mix_BM7_2_NN8_1`, permite analizar la fertilidad del tokenizador sobre corpus bokmål y nynorsk reales.
- Estudio de alineación de embeddings entre vocabularios: la estrategia de copia y media de piezas puede evaluarse midiendo la similitud coseno entre embeddings antiguos y nuevos y su efecto en la perplejidad.
- Docencia y reproducción experimental: el modelo forma parte de los 50 modelos del experimento IN5640 y puede usarse en prácticas para replicar el análisis de checkpoints y annealing.
- Generación de texto exploratoria en noruego: con decodificación cuidadosa y prompts de continuación, puede emplearse para inspeccionar cualitativamente qué ha aprendido la matriz de embeddings antes del CPT, sin expectativas de calidad de producción.
- Análisis de sesgos lingüísticos: al no haberse entrenado con datos noruegos más allá de los embeddings, permite estudiar qué sesgos del corpus multilingüe persisten tras el cambio de tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 4,3 GB solo para pesos, más caché KV y activaciones; con contexto completo de 4.096 tokens y batch pequeño, el consumo práctico se sitúa aproximadamente entre 6 y 8 GB.
- En cuantización de 8 bits, los pesos ocupan unos 2,2 GB; en 4 bits, alrededor de 1,1 GB, aunque no se han publicado artefactos GGUF ni cuantizaciones oficiales.
- GPU recomendadas para servicio: NVIDIA A100, H100 o GH200 para mayor throughput; también funciona en RTX 4090, RTX 3090 y GPUs consumer con 8 GB o más en bf16.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp y Ollama no están verificados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| ml-emb (este modelo) | 2,12 B | 4.096 | en, da, de, sv, no, nb, nn | no disponible | Checkpoint intermedio de investigación |
| ml-base | 2,12 B (aprox., misma arquitectura) | 4.096 | en, da, de, sv | no disponible | Modelo base multilingüe sin noruego |
| da-emb | 2,12 B (aprox., misma arquitectura) | 4.096 | da, no, nb, nn | no disponible | Checkpoint equivalente partiendo del modelo danés |
| no-base | 2,12 B (aprox., misma arquitectura) | 4.096 | no, nb, nn | no disponible | Referencia entrenada desde cero en noruego |

La comparación con modelos de la misma categoría fuera del experimento (por ejemplo, Qwen3 de 1,7 B o Gemma de 2 B) no está disponible en la información proporcionada; las diferencias de vocabulario y de datos hacen que la comparación directa no sea metodológicamente limpia.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones ni alineado en seguridad: puede generar contenido inapropiado, repetitivo o incoherente sin filtros.
- Riesgo elevado de alucinación y de texto gramaticalmente incorrecto en noruego, ya que solo se han actualizado los embeddings y el resto de pesos sigue siendo el modelo multilingüe sin noruego.
- La competencia en noruego es parcial por diseño: la fase de preentrenamiento continuado que la desarrolla corresponde a los checkpoints `ml-cpt1` a `ml-cpt10`, no a este modelo.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idiomas fuera de la lista declarada no están soportados de forma fiable.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- El modelo está vinculado a un experimento docente con 0 descargas y 0 likes, sin validación externa ni mantenimiento conocido.
- El tamaño del repositorio (4,2 GB) incluye pesos en safetensors; no se han publicado versiones cuantizadas ni artefactos GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-emb
- Modelo base: https://huggingface.co/BigFamTLLM/ml-base
- Versión con annealing: https://huggingface.co/BigFamTLLM/ml-emb-anneal
- Modelo multilingüe con annealing: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo danés equivalente: https://huggingface.co/BigFamTLLM/da-emb
- Modelo noruego de referencia: https://huggingface.co/BigFamTLLM/no-base
- Modelo noruego con annealing: https://huggingface.co/BigFamTLLM/no-base-anneal
- Primer checkpoint de CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt1
- Último checkpoint de CPT multilingüe: https://huggingface.co/BigFamTLLM/ml-cpt10
- Curso IN5640, Universidad de Oslo: no disponible
- Paper o blog del experimento: no disponible

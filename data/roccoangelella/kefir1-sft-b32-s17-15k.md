# roccoangelella/kefir1-sft-b32-s17-15k

## Resumen

Kefir 1 SFT (b32/s17/15k) es un checkpoint experimental de ajuste fino supervisado (SFT) publicado por el usuario roccoangelella en Hugging Face. Se construye sobre el backbone Kefir 1, un modelo de arquitectura Mixture-of-Experts con 144.074.648 parametros totales y una ventana de contexto de 2.048 tokens, partiendo del paso de preentrenamiento 310.000. El entrenamiento consistio en 15.000 conversaciones completas unicas con 10.493.117 objetivos de tipo Assistant, usando batch 32 y semilla 17, sobre la base del experimento congelado de 10k.

El modelo no se presenta como un asistente de calidad general ni como un resultado de estado del arte; el propio autor lo etiqueta como experimental. Su relevancia es acotada: sirve como artefacto de reproducibilidad para estudiar el efecto del SFT sobre un backbone pequeno con tokenizer SuperBPE de 8k y una implementacion de atencion GDN2 incluida en el repositorio. La evaluacion reportada es una NLL de heldout Assistant de aproximadamente 1,787421 a 15k, descrita como la mas baja en los experimentos planos observados, no como un hallazgo universal.

Por su tamano (0,6 GB de repositorio), su licencia no declarada para uso comercial y su cobertura de benchmarks limitada, debe tratarse como material de investigacion, no como candidato de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (backbone Kefir 1) |
| Parametros totales | 144.074.648 |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (sin licencia comercial declarada) |
| Formato de pesos | safetensors (conversion model-only desde el estado del trainer) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 144 millones de parametros y contexto de 2.048 tokens. El tokenizer es un SuperBPE de 8k verificado contra el manifiesto original, y la implementacion de atencion pairwise GDN2 se incluye en el directorio `runtime/` del repositorio. El checkpoint parte del paso de preentrenamiento 310.000 y aplica SFT sobre 15.000 conversaciones completas unicas, con 10.493.117 objetivos Assistant, en un regimen de batch 32 y semilla 17, continuando el experimento congelado de 10k.

No se detalla la composicion del dataset de preentrenamiento ni si hubo RLHF o DPO; el unico ajuste documentado es SFT. La publicacion incluye unicamente los pesos en safetensors y los artefactos de runtime listados en el manifiesto, sin datos de entrenamiento, estado del optimizador ni tokens de acceso privados de Kaggle. Se proporcionan digests SHA-256 tanto del checkpoint original del trainer (`2a489873...af065a`) como de los pesos seguros (`106f44d4...11cb96`) para verificar la reproducibilidad.

## Capacidades

- Generacion de texto en ingles sobre conversaciones multi-turno dentro de una ventana de 2.048 tokens.
- Seguimiento de instrucciones basicas derivado del SFT, con fiabilidad limitada segun el propio autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles declarado.
- Retencion de conocimiento y razonamiento descritos como mixtos por el autor.

## Casos de uso

- Investigacion sobre SFT en modelos pequenos: permite reproducir el efecto de 15.000 conversaciones sobre un backbone MoE de 144M, con digests y notebook de Kaggle documentados para verificar cada paso.
- Estudio de tokenizers alternativos: al incluir el SuperBPE 8k original verificado por manifiesto, sirve para analizar como un vocabulario reducido afecta a la calidad de generacion en ingles.
- Evaluacion de implementaciones de atencion: el runtime GDN2 incluido permite comparar el comportamiento de esta atencion pairwise frente a alternativas en tareas de continuacion de texto.
- Pruebas de infraestructura de carga: el flujo de descarga con SHA fijado y variables de entorno (`KEFIR_SFT_HF_REPO`, `KEFIR_SFT_HF_REVISION`, `KEFIR_SFT_HF_CHECKPOINT_SHA256`) es util para validar pipelines de despliegue reproducible.
- Analisis de degradacion en instrucciones: dado que el autor advierte de salidas incorrectas, repetitivas o que fallan instrucciones directas, el checkpoint sirve como caso de estudio de fallos tipicos tras SFT con datos limitados.
- Docencia y experimentacion academica: su tamano reducido y su NLL de referencia (~1,787421) permiten usarlo como linea base en cursos o trabajos sobre ajuste supervisado, siempre sin expectativas de calidad de asistente.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Heldout Assistant NLL | ~1,787421 (a 15k) | La mas baja reportada en los experimentos planos observados por el autor; no es un hallazgo universal de "mejor modelo" |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 144M de parametros, en fp32 ocuparia aproximadamente 0,58 GB solo en pesos, y en fp16/bf16 alrededor de 0,29 GB, a lo que habria que sumar overhead de runtime y cache KV para 2.048 tokens.
- GPU recomendadas: no especificadas; el comando de carga del autor usa `--device cuda` sin modelo de GPU concreto.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, aunque no hay validacion publicada.
- Opciones de despliegue: el flujo documentado es `uv run --locked --extra fla python -m experiments.sft_batch_screen.chat --device cuda` con el paquete `ABCastor/kefir-ops` en rama `main`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo explicitamente experimental: no es un asistente de calidad general ni una afirmacion de estado del arte.
- Salidas potencialmente incorrectas, repetitivas o que fallan instrucciones directas, segun el propio autor.
- Retencion de conocimiento y razonamiento descritos como mixtos.
- Cobertura de benchmarks muy limitada; la unica metrica publicada es la NLL de heldout.
- No ha sido sometido a cualificacion de seguridad independiente.
- Licencia no declarada: no existe licencia general de uso comercial para estos pesos; los derechos del corpus de terceros y de la mezcla de entrenamiento requieren revision separada.
- El codigo fuente y el tokenizer conservan su atribucion y derechos upstream; su inclusion no relicencia datos de terceros.
- Contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo ingles declarado.
- Cero descargas y cero likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roccoangelella/kefir1-sft-b32-s17-15k
- Repositorio de runtime y experimentos: `ABCastor/kefir-ops` (rama `main`), documentacion en `docs/experiments/sft-batch-screen/`
- Notebook de entrenamiento: Kaggle `lorenzoerocco/kefir-sft-k1-b32-s17-to15k-r1`

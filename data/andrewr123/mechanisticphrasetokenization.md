# AndrewR123/MechanisticPhraseTokenization

## Resumen

BT3-FullSynthesis es una familia de modelos de lenguaje de investigación en dos escalas (`30.42M` y `149.58M` parámetros) publicada por Andrew Rober Fouad Samy junto con el tokenizador `BT2_AttnDemux_16384`, de `16.384` entradas. El trabajo no se centra en competir como modelo de propósito general, sino en estudiar qué frases multi-palabra merecen su propio token y cómo integrarlas en el vocabulario sin modificar la arquitectura en inferencia. El repositorio acompaña al artículo "What Earns a Phrase Its Own Token? Mechanistic Multi-Word Vocabulary Allocation, Compositional-Residual Folding, and Test-Time Compute Gearshifting".

La aportación técnica principal son los superwords componibles y plegables: cada superword se entrena como `W_P = (1/|P|) * sum(W_t) + Δ_P`, con un factor `λ_Δ = 0.30`, y después se pliega algebraicamente en una matriz de embeddings estándar de forma `[16384, d]`. Esto permite usar el tokenizador extendido con cero modificaciones arquitectónicas y un error de plegado declarado de `0.0`. El tokenizador combina una base Byte-BPE sin pérdida de `14.336` tokens con `2.048` superwords con guardas de frontera, alcanzando más del `96%` de utilización de slots activos.

El modelo es relevante para quienes investigan tokenización, interpretabilidad mecanicista y cómputo en tiempo de inferencia. A escala de `149.58M` parámetros, un único checkpoint congelado puede operar en "marcha alta" de superwords, un `5,8%` más rápido, o bajar a "marcha baja" de subwords en cláusulas de alta entropía, con una mejora declarada de `1,58%` en precisión sin tokens de cadena de pensamiento. Los checkpoints se entrenaron sobre `300M` tokens únicos de FineWeb-Edu y están publicados bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de investigación (`ResearchTransformerLM`, implementación propia en PyTorch) |
| Parametros totales | `30.42M` (BT3-FullSynthesis) y `149.58M` (150M_BT3_FullSynthesis) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`ckpt_final.pt` con clave `model`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo de implementación propia (`ResearchTransformerLM`) definido en `src/model.py`, con una especificación de configuración concreta para la escala de `149.58M` (`STAGE_E_150M_SPEC`). La innovación no está en el bloque transformer sino en la capa de embeddings y en el tokenizador: el vocabulario `BT2_AttnDemux_16384` se compone de `14.336` tokens Byte-BPE de base más `2.048` superwords multi-palabra con guardas de frontera. Los superwords se seleccionan vetando frases relacionales de alta divergencia de Jensen-Shannon (`D_bind > 0.0549` bits) y se entrenan con un residual desacoplado (`λ_Δ = 0.30`) que luego se pliega en la matriz de embeddings estándar.

El entrenamiento se realizó sobre `300M` tokens únicos no repetidos de `HuggingFaceFW/fineweb-edu`, con evaluación en `nyu-mll/blimp`, `allenai/ai2_arc` y `allenai/sciq`, y también se menciona `roneneldan/TinyStories` en los metadatos del dataset. Se entrenó con un `20%` de desmezcla de doble granularidad (`q = 0.20`), lo que habilita el cambio de marcha en tiempo de inferencia. Además del modelo, el repositorio incluye un decodificador de cono de prefijo (`PrefixConeDecoder`) que corrige la división de votos de superwords, con una recuperación de la siguiente palabra de entre `+0,93%` y `+1,59%` y una perturbación del `0,00%` sobre las líneas base de subwords. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés con un vocabulario extendido de superwords.
- Razonamiento lingüístico evaluado mediante BLiMP (juicios de gramaticalidad) y ARC-Easy (preguntas de ciencia de primaria).
- Predicción de siguiente palabra con decodificación de cono de prefijo para mitigar la división de votos entre superwords y subwords.
- Cambio de marcha en tiempo de inferencia ("test-time compute gearshifting"): un mismo checkpoint congelado puede operar en granularidad de superword (más rápido) o de subword (más preciso en cláusulas de alta entropía).
- Tokenización Byte-BPE sin pérdida con `14.336` tokens base más `2.048` superwords con guardas de frontera.
- Plegado composicional de superwords en la matriz de embeddings estándar sin modificaciones arquitectónicas en inferencia.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en tokenización: comparar el rendimiento de Byte-BPE, SuperBPE, SupraTok y BT3-FullSynthesis sobre el mismo corpus de `300M` tokens de FineWeb-Edu para aislar el efecto de la asignación de vocabulario multi-palabra.
- Interpretabilidad mecanicista: analizar cómo se representan las frases multi-palabra en la matriz de embeddings plegada y qué frases superan el umbral de enlace (`D_bind > 0.0549` bits) para recibir token propio.
- Estudio de cómputo adaptativo: usar el cambio de marcha para medir el compromiso entre velocidad (`+5,8%` en marcha alta) y precisión (`+1,58%` en marcha baja a `149.6M`) sin generar tokens de cadena de pensamiento.
- Evaluación de modelos pequeños en tareas lingüísticas: emplear los checkpoints de `30.42M` y `149.58M` como líneas base controladas en experimentos de gramaticalidad (BLiMP) y conocimiento científico elemental (ARC-Easy, SciQ).
- Docencia y reproducción de experimentos: el repositorio incluye scripts (`scripts/run_stage_cde_mechanistic.py`), configuración y tokenizadores para reproducir el pipeline completo en una sola GPU.
- Desarrollo de tokenizadores de dominio: reutilizar el esquema de superwords con guardas de frontera y veto por JSD para construir vocabularios especializados en corpus técnicos o científicos con alta densidad de frases multi-palabra.
- Validación de técnicas de plegado: verificar empíricamente el error de plegado declarado (`0.0`) al integrar superwords en arquitecturas transformer existentes sin reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `300M` tokens únicos de FineWeb-Edu. La columna "Fert-Matched" indica emparejamiento por fertilidad; "Next-Word (Cone)" es la recuperación de siguiente palabra con decodificación de cono de prefijo; "Perturb ΔBPB" mide la degradación ante perturbaciones (menor es mejor).

| Modelo | Params | Bytes/Tok | BLiMP (Fert-Matched) ↑ | ARC-Easy ↑ | Next-Word (Cone) ↑ | Perturb ΔBPB ↓ |
|---|---|---|---|---|---|---|
| `B1_ByteBPE` (3 semillas) | `30.42M` | `4.322` | `85.89% ± 0.45%` | `38.13%` | `23.27%` | `+0.00019` |
| `B4_SuperBPE` (3 semillas) | `30.42M` | `4.665` | `83.51% ± 0.73%` | `38.53%` | `16.22%` | `+0.00016` |
| `B5_SupraTok` (3 semillas) | `30.42M` | `4.422` | `83.64% ± 1.80%` | `37.27%` | `18.75%` | `+0.00058` |
| `BT3_FullSynthesis` (3 semillas) | `30.42M` | `4.571` | `86.44% ± 0.31%` (#1) | `37.93%` | `22.83%` | `-0.00021` (#1) |
| `150M_B1_ByteBPE` | `149.58M` | `4.322` | `86.20%` | `38.40%` | `25.66%` | `-0.00017` |
| `150M_B4_SuperBPE` | `149.58M` | `4.665` | `86.39%` | `38.80%` | `18.88%` | `+0.00005` |
| `150M_B5_SupraTok` | `149.58M` | `4.422` | `86.56%` | `38.40%` | `21.94%` | `+0.00042` |
| `150M_BT3_FullSynthesis` (zero-shot) | `149.58M` | `4.571` | `86.81%` (#1 global) | `39.20%` (#1) | `24.07%` | `-0.00020` (#1) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con `30.42M` parámetros en fp32 ocupa aproximadamente `0,12 GB` de pesos; con `149.58M` parámetros, aproximadamente `0,60 GB` en fp32. No se publican cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos `2 GB` de VRAM es suficiente para los dos checkpoints en fp32. Una RTX 4090, A100 o H100 sobran para este tamaño; el cuello de botella es el pipeline de tokenización, no el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para los checkpoints de `30.42M`.
- Opciones de despliegue: el código de ejemplo usa PyTorch puro (`torch.load` + `ResearchTransformerLM` + `PhraseAugmentedTokenizer` + `PrefixConeDecoder`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF ni safetensors, estos motores no son utilizables directamente.
- Latencia y throughput: no disponibles. El autor declara un `+5,8%` de velocidad en "marcha alta" de superwords respecto a la línea base, pero sin cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

La comparación más directa es con las líneas base del propio artículo, todas con el mismo presupuesto de parámetros y el mismo corpus de `300M` tokens.

| Modelo | Params | Bytes/Tok | BLiMP (Fert-Matched) | ARC-Easy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `BT3_FullSynthesis` (`149.58M`) | `149.58M` | `4.571` | `86.81%` | `39.20%` | MIT | Checkpoints PyTorch en HF |
| `B1_ByteBPE` (`149.58M`) | `149.58M` | `4.322` | `86.20%` | `38.40%` | No disponible | Línea base del artículo |
| `B4_SuperBPE` (`149.58M`) | `149.58M` | `4.665` | `86.39%` | `38.80%` | No disponible | Línea base del artículo |
| `B5_SupraTok` (`149.58M`) | `149.58M` | `4.422` | `86.56%` | `38.40%` | No disponible | Línea base del artículo |

Frente a modelos de propósito general de tamaño similar (por ejemplo, GPT-2 small de `124M` parámetros o Pythia-160M), la comparación no es directa: BT3-FullSynthesis está entrenado sobre solo `300M` tokens y su objetivo es el estudio de tokenización, no el rendimiento generalista. No se dispone de benchmarks comunes (MMLU, HumanEval, GSM8K) para establecer una comparación cuantitativa con esos modelos.

## Limitaciones y advertencias

- Modelo de investigación: entrenado sobre `300M` tokens de FineWeb-Edu, un presupuesto muy inferior al de modelos de producción. No es adecuado como modelo generalista.
- Solo inglés: los metadatos declaran únicamente `en`; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ, GPTQ ni safetensors, lo que limita el despliegue en motores de inferencia estándar.
- Riesgo de alucinación: no evaluado en la información disponible; a esta escala y con este volumen de entrenamiento, la generación de hechos es poco fiable.
- Sesgos: no documentados. El corpus FineWeb-Edu tiene sesgos de dominio (texto educativo en inglés) que se trasladan al modelo.
- Utilización de slots: aunque el autor declara más del `96%` de utilización activa frente al `62,8%` de SuperBPE, la selección de superwords depende de umbrales (`D_bind > 0.0549` bits, `λ_Δ = 0.30`, `q = 0.20`) calibrados sobre este corpus concreto; su transferencia a otros dominios no está validada.
- Licencia MIT: permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, no se recomienda en producción sin una evaluación propia.
- Dependencia de código propio: el uso requiere los módulos `src.model`, `src.tokenizer_core` y `src.breakthroughs` del repositorio GitHub, no solo los pesos.
- Repositorio con `0` descargas y `0` likes en el momento de la consulta: ecosistema mínimo, sin validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndrewR123/MechanisticPhraseTokenization
- Repositorio GitHub: https://github.com/AndrewRober/MechanisticPhraseTokenization
- Perfil GitHub del autor: https://github.com/AndrewRober
- LinkedIn del autor: https://www.linkedin.com/in/andrew-rober/
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de evaluación BLiMP: https://huggingface.co/datasets/nyu-mll/blimp
- Dataset de evaluación ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Dataset de evaluación SciQ: https://huggingface.co/datasets/allenai/sciq
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories

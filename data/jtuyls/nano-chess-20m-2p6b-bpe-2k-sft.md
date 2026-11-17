# jtuyls/nano-chess-20m-2p6b-bpe-2k-sft

## Resumen

Nano Chess 20M (2.6B tokens, BPE de 2k) es un modelo de lenguaje causal especializado en ajedrez, desarrollado por el usuario jtuyls y publicado en Hugging Face. Se trata del checkpoint final de ajuste supervisado (SFT) del modelo base `jtuyls/nano-chess-20m-2p6b-bpe-2k-pretrain`, y su propósito es generar razonamiento multi-turno sobre partidas de ajedrez, no conversación generalista. Con 21.479.424 parámetros y una ventana de contexto de 3.072 tokens, es un modelo de escala muy reducida pensado para experimentación e investigación en dominios acotados.

La arquitectura es un transformer causal de tipo Qwen3 con 6 capas, dimensión oculta de 512 y 4 cabezas de atención, con embeddings de entrada y salida compartidos (tied). El tokenizador es un BPE autocontenido de vocabulario 2.000, distinto del tokenizador original de Qwen3, lo que lo hace autoconsistente pero incompatible con los modelos Qwen3 estándar. El nombre "2p6b" hace referencia al presupuesto de tokens de preentrenamiento del modelo base (2.600 millones), no al número de parámetros ni al volumen de datos de SFT.

Su relevancia es acotada pero clara: sirve como banco de pruebas de bajo coste para estudiar cómo el preentrenamiento a gran escala de tokens sobre un corpus pequeño y especializado, seguido de SFT con enmascaramiento de prompt y separadores de trayectoria, produce capacidades de razonamiento en un dominio cerrado como el ajedrez. No está pensado para uso comercial general ni para tareas fuera del dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3 (6 capas, hidden size 512, 4 cabezas de atencion) |
| Parametros totales | 21.479.424 (embeddings de entrada/salida compartidos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens (factores YaRN 3 sobre contexto base de 1.024) |
| Tipos de cuantizacion | no disponible (pesos almacenados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con la configuración de Qwen3 reducida a escala nano: 6 capas, dimensión oculta de 512, 4 cabezas de atención y embeddings de entrada/salida atados. La inicialización de RoPE es fija y el contexto se extiende de 1.024 a 3.072 tokens mediante un factor de escalado YaRN de 3. El tokenizador es un BPE propio con vocabulario de 2.000 tokens, compartido con el modelo base, e incluye tokens especiales `<T>`, `<sep>`, `</T>`, `<call_env>`, `<bos>` y `<eos>`, con `<eos>` como token de padding.

El preentrenamiento del modelo base consumió 2.600 millones de tokens sobre un corpus de ajedrez. El SFT se realizó sobre razonamiento multi-turno de ajedrez con la estrategia `trajectory_sep_no_labels` (separadores de trayectoria sin etiquetas), enmascaramiento de prompt, 3 épocas y tasa de aprendizaje 3e-4, con semilla 1. No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del escalado YaRN y el esquema de enmascaramiento.

## Capacidades

- Generación de texto especializada en ajedrez: razonamiento multi-turno sobre posiciones, jugadas y trayectorias de partida.
- Soporte de tokens especiales para estructura de trayectoria (`<T>`, `<sep>`, `</T>`) y llamada a entorno (`<call_env>`), orientados a interacción con un entorno de ajedrez.
- Manejo de contexto de hasta 3.072 tokens, suficiente para secuencias de partida moderadamente largas.
- Tokenizador BPE autocontenido de 2.000 tokens, optimizado para el vocabulario del dominio.
- No es un modelo de chat generalista: no se documentan capacidades de código, matemáticas generales, visión, audio ni tool calling fuera del entorno de ajedrez.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en razonamiento de dominio cerrado: usar el modelo como banco de pruebas para estudiar cómo el preentrenamiento masivo de tokens sobre un corpus pequeño (2.600 millones) más SFT produce razonamiento multi-turno en ajedrez, con coste computacional mínimo.
- Generación de trayectorias de ajedrez para aumento de datos: producir secuencias de razonamiento etiquetadas con los separadores `<T>`/`<sep>`/`</T>` para entrenar o evaluar otros sistemas de ajedrez.
- Evaluación de esquemas de enmascaramiento de prompt: comparar la estrategia `trajectory_sep_no_labels` frente a alternativas en un entorno controlado y reproducible (semilla fija, 3 épocas, lr 3e-4).
- Prototipado de agentes de ajedrez con llamada a entorno: el token `<call_env>` permite experimentar con bucles de interacción modelo-entorno en un pipeline ligero.
- Docencia y divulgación: ilustrar el ciclo completo preentrenamiento + SFT en un modelo de 21M de parámetros que cabe en cualquier GPU consumer y se carga con Transformers.
- Reproducibilidad de experimentos: al publicarse pesos, configs de modelo/generación y tokenizador (sin estados de optimizador ni logs), sirve como referencia reproducible para réplicas del run `sft_local-20m-2p6b-bpe-2k-sft_dba08f7c_seed1`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (21,5M de parámetros, ~86 MB de pesos) más overhead de activaciones y KV cache; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos ~1 GB de VRAM libre; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers (versión con soporte Qwen3; el checkpoint se guardó con 4.57.1), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jtuyls/nano-chess-20m-2p6b-bpe-2k-sft | 21,5M | 3.072 | Ajedrez (SFT) | no disponible | Hugging Face |
| jtuyls/nano-chess-20m-2p6b-bpe-2k-pretrain | no disponible | no disponible | Ajedrez (preentrenamiento) | no disponible | Hugging Face |
| Qwen3 (modelo base de referencia) | no disponible en esta ficha | no disponible en esta ficha | Generalista | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico de ajedrez: no debe emplearse como modelo de chat generalista ni para tareas fuera del dominio.
- Tokenizador propio de 2.000 tokens: no es compatible con el tokenizador original de Qwen3; es obligatorio usar el tokenizador incluido en el repositorio y no los IDs de token LAN originales.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Idiomas soportados no disponibles: no se documenta cobertura multilingüe.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible; en un modelo de 21M de parámetros es esperable una fidelidad limitada en posiciones poco representadas.
- Contexto limitado a 3.072 tokens: insuficiente para partidas completas largas o historiales extensos.
- Pesos en float32 sin cuantizaciones publicadas: no hay versiones GGUF/INT8/INT4 oficiales en la información disponible.
- No se incluyen estados de optimizador, logs de entrenamiento ni manifiestos del corpus local, lo que limita la reproducibilidad exacta del entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtuyls/nano-chess-20m-2p6b-bpe-2k-sft
- Modelo base (preentrenamiento): https://huggingface.co/jtuyls/nano-chess-20m-2p6b-bpe-2k-pretrain

# purplejedi/chromagpt-baseline-v2-untied-d16-l2

## Resumen

ChromaGPT V2 (variante `untied-d16-l2`) es un modelo de lenguaje causal extremadamente pequeno, de solo 14.912 parametros, desarrollado por el usuario `purplejedi` (repositorio fuente de `sriramrathinavelu`) y publicado en Hugging Face bajo licencia MIT. No es un modelo de proposito general: es un instrumento de investigacion en interpretabilidad mecanica disenado para estudiar como un transformer aprende geometria del color a partir de identificadores de token opacos.

El modelo recibe exclusivamente IDs enteros de token (`0..255`) que representan colores discretos de una paleta fija de 256 colores cuantizada en espacio OKLab, y predice secuencias de colores generadas por trayectorias geometricas (lineales, curvas de Bezier y ciclicas). La clave es que el modelo nunca ve coordenadas RGB ni OKLab, lo que permite analizar como las embeddings y las activaciones de atencion desarrollan representaciones con estructura perceptual.

Se trata de un transformer decoder-only estilo GPT-2 con `d_model=16`, 2 capas, 4 cabezas de atencion y una longitud de contexto de solo 8 tokens. Su relevancia es puramente cientifica y didactica: sirve como banco de pruebas controlado y reproducible para estudiar circuitos internos, con paridad numerica verificada frente al checkpoint original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal estilo GPT-2 (Pre-LN, GELU exacta, embeddings de token y LM-head no atados) |
| Parametros totales | 14.912 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precision original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No aplica (vocabulario de 256 tokens hex `#RRGGBB`; no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`GPT2LMHeadModel`), `best_checkpoint.pt` (PyTorch original), `embedding_snapshots.pt` |

Configuracion concreta: `vocab_size=256`, `context_length=8`, `d_model=16`, `n_layers=2`, `n_heads=4`, `d_ff=64`, `tie_weights=False`.

## Arquitectura y entrenamiento

El modelo es un decoder causal Pre-LN con 2 capas, atencion multi-cabeza de 4 cabezas sobre `d_model=16` (dimension por cabeza de 4), feed-forward de 64 unidades y activacion GELU exacta. Los embeddings de token y la cabeza LM estan desatados (`tie_weights=False`), lo que permite analizar por separado el espacio de entrada y el de salida, un detalle relevante para estudios de interpretabilidad. El tokenizador es un `WordLevel` de 256 entradas que mapea cadenas hex `#RRGGBB` (insensible a mayusculas) a IDs `0..255`, respaldado por la paleta determinista `oklab_256_v1` (inicializacion por puntos mas lejanos + relajacion k-means de Lloyd en OKLab).

El entrenamiento se realizo desde cero en PyTorch sobre el dataset `trajectories_v2_no_repeats` (10.000 de entrenamiento, 1.000 de validacion, 1.000 de test, disjunto por trayectoria y sin solapamiento de prefijos), con semilla 42 y hardware Tesla T4. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La mejor epoca fue la 59, con perdida de validacion 2,1729 y de test 2,1877. Se incluyen snapshots de embeddings en las epocas 0, 1, 3, 5, 10, 20, 40, 59 y 60 para analisis de evolucion de representaciones.

## Capacidades

- Prediccion del siguiente color en secuencias de hasta 8 tokens de una paleta fija de 256 colores.
- Modelado de trayectorias en espacio de color: lineales, curvas de Bezier y ciclicas.
- Analisis de interpretabilidad mecanica: inspeccion de embeddings, atencion causal, activaciones Q/K/V y flujo del residual stream mediante `model.inspect()` sobre el checkpoint original.
- Integracion nativa con `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) sin dependencias personalizadas.
- Compatibilidad con text-generation-inference y endpoints.
- No soporta tool calling, agentes, vision, audio, razonamiento multi-paso ni capacidades multilingues.

## Casos de uso

- Investigacion en interpretabilidad mecanica: analizar como un transformer minimo forma clusters perceptuales en el espacio de embeddings a partir de IDs opacos, usando los snapshots de embeddings por epoca incluidos.
- Docencia en cursos de deep learning: ejemplo reproducible y ligero (14.912 parametros) para explicar atencion causal, Pre-LN y desatado de pesos sin coste computacional.
- Estudio de representaciones de color: comparar la geometria emergente del modelo (error L2 RGB de 0,1201 y Delta E OKLab de 0,0474) frente a baselines analiticos como la extrapolacion lineal RGB de 3 puntos.
- Validacion de pipelines de tokenizacion: el tokenizador hex de 256 entradas sirve como banco de pruebas para verificar mapeos `#RRGGBB` a IDs y cuantizacion OKLab determinista.
- Reproducibilidad de experimentos: el repositorio incluye metadatos de procedencia (SHA de commit, SHA-256 de paleta y dataset, run de W&B) que permiten replicar el entrenamiento en una T4.
- Pruebas de integracion de infraestructura: modelo lo suficientemente pequeno para validar despliegues con `transformers`, TGI o endpoints en entornos de CI sin requerir GPU dedicada.
- Analisis de paridad numerica: verificar la equivalencia entre el checkpoint PyTorch original y la exportacion a `GPT2LMHeadModel` (diferencia maxima de logits de 4,77e-06).

## Benchmarks y rendimiento

Resultados en el split de test retenido (N=1.000), segun la model card:

| Metrica | ChromaGPT (d16_l2_h4) | Extrapolacion lineal RGB 3 puntos | Baseline empirico P(x8\|x7) |
|---|---:|---:|---:|
| Perdida / perplejidad de test | 2,1877 / 8,91 | — | — |
| Precision top-1 siguiente color | 0,398 | 0,298 | 0,271 |
| Precision top-5 siguiente color | 0,824 | 0,710 | 0,630 |
| Error L2 en RGB | 0,1201 | 0,1443 | 0,1782 |
| Delta E perceptual OKLab | 0,0474 | 0,0582 | 0,0753 |
| P(stay) medio retenido | 0,0320 | — | — |
| Tasa de argmax stay | 0,60 % | — | — |

Desglose por familia de trayectoria en test:

| Familia | Top-1 | Top-5 | Error L2 RGB | Delta E OKLab |
|---|---:|---:|---:|---:|
| `linear` | 0,494 | 0,928 | 0,0965 | 0,0363 |
| `curved` | 0,360 | 0,817 | 0,1242 | 0,0503 |
| `cyclic` | 0,339 | 0,727 | 0,1395 | 0,0556 |

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 MB en precision original; cabe holgadamente en cualquier GPU, CPU o incluso en memoria de un movil.
- GPU recomendadas: cualquiera; el entrenamiento original se realizo en una Tesla T4. Para inferencia no se requiere GPU.
- GPU de consumo: cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) y en CPU.
- Opciones de despliegue: `transformers` (nativo), text-generation-inference, endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, la latencia sera del orden de microsegundos a milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (transformers minimos para interpretabilidad de color) en la informacion proporcionada. Los unicos baselines documentados son analiticos, no neuronales:

| Alternativa | Tipo | Parametros | Contexto | Top-1 test | Licencia |
|---|---|---:|---:|---:|---|
| ChromaGPT d16_l2 | Transformer causal | 14.912 | 8 | 0,398 | MIT |
| Extrapolacion lineal RGB 3 puntos | Baseline analitico | 0 | — | 0,298 | — |
| Baseline empirico P(x8\|x7) | Baseline estadistico | 0 | — | 0,271 | — |

## Limitaciones y advertencias

- No es un modelo de proposito general: no genera texto, codigo ni responde preguntas; solo predice secuencias de colores de una paleta fija.
- Contexto de solo 8 tokens, insuficiente para cualquier tarea practica de modelado de lenguaje.
- Vocabulario cerrado de 256 colores; no puede representar colores fuera de la paleta `oklab_256_v1` sin cuantizacion previa.
- Rendimiento limitado en trayectorias ciclicas (top-1 de 0,339) y curvas (0,360), sensiblemente inferior a las lineales (0,494).
- Riesgo de alucinacion: al ser un modelo probabilistico, puede predecir colores fuera de la trayectoria esperada; la tasa de argmax stay es de solo 0,60 %.
- No se documentan sesgos de genero, raza o idioma por la naturaleza no linguistica del modelo, pero la paleta puede heredar sesgos de muestreo de color en OKLab.
- Licencia MIT permite uso comercial, pero el modelo carece de utilidad comercial practica; su valor es cientifico y educativo.
- El autor advierte explicitamente que ChromaGPT es un microscopio para transformers, no un producto de generacion.
- La fecha de creacion indicada (2026-11-28) es futura respecto a la redaccion habitual de fichas; conviene verificar la procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/purplejedi/chromagpt-baseline-v2-untied-d16-l2
- Repositorio fuente en GitHub: https://github.com/sriramrathinavelu/ChromaGPT
- Notebook de entrenamiento: `notebooks/04_training_v2.ipynb` (en el repositorio fuente)
- Run de Weights & Biases: https://wandb.ai/chillyskywalker/chromagpt/runs/jop8t1bn
- Commit SHA: `f4511ea49eca715ed0dbc5431d12eec9f1d2aee4`

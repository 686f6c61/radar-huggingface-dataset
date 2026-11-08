# janmusic/AR-TinyStories-91M-MLX

## Resumen

AR-TinyStories-91M-MLX es un modelo de lenguaje autorregresivo de estilo GPT, con 91.348.992 parametros, desarrollado por el autor independiente janmusic y publicado en Hugging Face. No es un modelo de producto: es una linea base de investigacion construida especificamente para compararse con el generador Next-Concept Modeling (NCM) del mismo autor, NCM-TinyStories-87M-MLX. Ambos comparten los mismos bloques transformer (12 bloques, anchura 768, 12 cabezas) y se entrenaron sobre exactamente las mismas 3.840.000 ventanas de 128 tokens del dataset TinyStories, lo que permite una comparacion controlada entre dos paradigmas de generacion.

La diferencia clave es el modo de generacion: este modelo emite un token por llamada al modelo, de modo que una historia de 128 tokens requiere 128 llamadas, frente a las 11 del NCM. Pese a esa desventaja en numero de llamadas, en calidad de texto el modelo autorregresivo gana claramente en la metrica reportada: perplexidad generativa medida con GPT-2-large de 11,484 frente a 24,404 del NCM (ratio 2,13).

El interes actual del modelo es metodologico: sirve como referencia reproducible para evaluar si el paradigma NCM justifica su coste. Esta implementado con la libreria ncm-mlx sobre MLX (Apple Silicon, Metal) y no es compatible con Transformers ni con mlx_lm, lo que limita su uso a entornos de investigacion en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo GPT) con 12 bloques, anchura 768, 12 cabezas, embeddings atados, RoPE |
| Parametros totales | 91.348.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 posiciones |
| Tipos de cuantizacion | no disponible (pesos publicados en float32 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors float32, cargado mediante la libreria `ncm_mlx`; no es un checkpoint de Transformers ni de `mlx_lm` |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo puro con 12 bloques, dimension 768 y 12 cabezas de atencion, con embeddings de entrada y salida atados y codificacion posicional rotatoria (RoPE, con `rope_base` definido en `spec.json`). Usa un tokenizador BPE de 8.192 tokens, el mismo fichero que emplea el modelo NCM con el que se compara, y una ventana de 128 posiciones. La generacion es incondicional: parte de un token de inicio de historia y produce texto sin condicionamiento adicional.

El entrenamiento consistio en 30.000 actualizaciones con batch de 128, lo que suma 3.840.000 ventanas de 128 tokens, exactamente las mismas ventanas que vio el NCM. Se entreno en bf16 con pesos maestros en fp32 y semilla 0. El dataset es TinyStories (roneneldan/TinyStories), un corpus de cuentos sinteticos en ingles pensado para estudiar el aprendizaje temprano del lenguaje en modelos pequenos. No se reporta uso de RLHF, DPO ni ajuste por instrucciones. No se documentan innovaciones tecnicas propias mas alla de la propia infraestructura ncm-mlx; el valor del modelo reside en ser el contraste controlado del paradigma NCM.

## Capacidades

- Generacion de texto en ingles a nivel de cuento infantil, incondicional a partir de un token de inicio de historia.
- Generacion autorregresiva token a token con cache de clave/valor (una llamada al modelo por token).
- Longitud maxima de generacion de 128 tokens por muestra.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo de razonamiento extendido.
- Multilingue: no; solo ingles.
- Uso previsto como linea base de evaluacion (perplexidad generativa, perdida teacher-forced) frente a modelos NCM.

## Casos de uso

- Evaluacion comparativa de paradigmas de generacion: sirve para medir la perplexidad generativa de un autorregresivo bajo el mismo protocolo (GPT-2-large como scorer, 1.280 muestras incondicionales, temperatura 1 sin top-k ni top-p) que el NCM, y calcular el ratio entre ambos.
- Reproduccion de experimentos de investigacion: con semilla 0, 30.000 actualizaciones y las mismas ventanas de entrenamiento, permite replicar los resultados reportados y auditar la comparacion entre AR y NCM.
- Estudio de eficiencia en llamadas al modelo: cuantifica el coste en llamadas por muestra (128 frente a 11 del NCM) para analisis de latencia y planificacion de inferencia, teniendo en cuenta que una llamada AR con cache KV es mucho mas pequena que una llamada NCM.
- Generacion de texto sintetico de dominio restringido: produce cuentos cortos en ingles utiles como datos de prueba para pipelines de tokenizacion, decodificacion y evaluacion, sin riesgo de contaminar corpus reales.
- Docencia y divulgacion: modelo pequeno (91M) que cabe en un portatil con Apple Silicon y permite ilustrar el funcionamiento de un transformer autorregresivo con RoPE y embeddings atados en clases o talleres.
- Pruebas de integracion de la libreria ncm-mlx: al cargarse con `TextAR` y `BPETokenizer` de `ncm_mlx.official`, sirve como caso de prueba de la API de carga estricta de pesos (`strict=True`) y de la exportacion de especificaciones (`spec.json`).

## Benchmarks y rendimiento

| Metrica | NCM-TinyStories-87M-MLX | AR-TinyStories-91M-MLX |
|---|---:|---:|
| Parametros | 87.426.059 (generador) | 91.348.992 |
| Perplexidad generativa GPT-2-large, media (DE) sobre 5 semillas, menor es mejor | 24,404 (0,848) | 11,484 (0,341) |
| Ratio NCM / AR | 2,13 | — |
| Perdida teacher-forced limpia | 1,51620 nats por codigo | 1,01081 nats por token BPE |
| Llamadas al modelo por muestra de 128 tokens | 11 (mas el unigram de nivel 0 almacenado) | 128 |

Referencias bajo el mismo scorer: texto real reservado 8,529; checkpoint TinyStories publicado por Kumbong et al. 16,259. La perplexidad generativa se calcula con 1.280 muestras incondicionales por modelo (5 semillas × 256), temperatura 1, sin top-k ni top-p, evaluadas con GPT-2-large (`openai-community/gpt2-large@32b71b1`) sin token BOS y hasta 1.024 tokens. La perdida por codigo y la perdida por token BPE son objetivos distintos y no son comparables entre si.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,4 GB y los pesos estan en float32, por lo que la inferencia cabe holgadamente en memoria unificada de cualquier Mac moderno; no se dispone de cifras oficiales de VRAM.
- GPU recomendadas: el modelo esta implementado sobre MLX y se ejecuta en Apple Silicon (Metal) por defecto; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no se reporta compatibilidad con GPU NVIDIA de consumo.
- Opciones de despliegue: exclusivamente mediante la libreria `ncm-mlx` (version 0.4.0, Python 3.12) y el paquete `huggingface-hub` para la descarga; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card advierte que el contador de su comparativa mide llamadas al modelo, no tiempo, y que una llamada AR con cache KV es mucho mas pequena que una llamada NCM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexidad generativa (GPT-2-large) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| AR-TinyStories-91M-MLX | 91.348.992 | 128 | 11,484 | MIT | Hugging Face, via ncm-mlx |
| NCM-TinyStories-87M-MLX | 87.426.059 | 128 | 24,404 | no disponible en la informacion | Hugging Face, via ncm-mlx |
| TinyStories de Kumbong et al. (checkpoint publicado) | no disponible | no disponible | 16,259 | no disponible | checkpoint publicado |

La comparacion principal es con el NCM del mismo autor, disenado como pareja experimental. Frente al checkpoint de Kumbong et al., este modelo obtiene mejor perplexidad generativa (11,484 frente a 16,259) bajo el mismo scorer, aunque se desconoce el tamano y la configuracion exactos de ese checkpoint.

## Limitaciones y advertencias

- Es una linea base de investigacion, no un modelo de producto: no debe usarse en aplicaciones reales de cara al usuario.
- Solo genera en ingles y solo a nivel de cuento infantil; el vocabulario y los temas estan fuertemente sesgados por TinyStories.
- Ventana de contexto muy corta (128 posiciones), insuficiente para la mayoria de tareas practicas.
- Generacion incondicional: no acepta instrucciones ni prompts complejos, solo un token de inicio de historia.
- Riesgo de alucinacion y de texto incoherente fuera del dominio de cuentos sinteticos; no se han publicado evaluaciones de sesgo.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Incompatible con el ecosistema estandar (Transformers, mlx_lm, vLLM, llama.cpp), lo que limita la portabilidad.
- Licencia MIT: permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- La comparacion de perdidas entre NCM y AR no es directa (nats por codigo frente a nats por token BPE); cualquier conclusion debe basarse en la perplexidad generativa bajo el mismo scorer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janmusic/AR-TinyStories-91M-MLX
- Modelo NCM con el que se compara: https://huggingface.co/janmusic/NCM-TinyStories-87M-MLX
- Repositorio GitHub ncm-mlx: https://github.com/janmus1c/ncm-mlx
- Documentacion: https://janmus1c.github.io/ncm-mlx/
- Working paper (DOI): https://doi.org/10.5281/zenodo.23953213
- Paper NCM (arXiv): https://arxiv.org/abs/2610.14162
- Demo de replay: https://huggingface.co/spaces/janmusic/NCM-Refinement-Replay
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Scorer GPT-2-large: https://huggingface.co/openai-community/gpt2-large

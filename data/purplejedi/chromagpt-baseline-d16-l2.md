# purplejedi/chromagpt-baseline-d16-l2

## Resumen

ChromaGPT baseline `d16_l2` es un modelo de lenguaje causal extremadamente pequeno (10.816 parametros) entrenado desde cero con arquitectura tipo GPT-2. Lo desarrolla el autor independiente `purplejedi` (repositorio original de `sriramrathinavelu/ChromaGPT`) como herramienta de investigacion en interpretabilidad mecanicista, no como producto de generacion de texto. El modelo opera sobre un vocabulario cerrado de 256 tokens que representan colores discretos de una paleta OKLab fija, y predice secuencias de tokens de color generadas a partir de trayectorias geometricas (lineales, curvas de Bezier y ciclicas) por el espacio de color.

La relevancia del modelo es puramente metodologica: al recibir unicamente IDs enteros opacos (`0..255`) sin coordenadas RGB ni OKLab, permite estudiar como las embeddings, la atencion causal, las activaciones Q/K/V y las capas del residual stream desarrollan geometria de color y representaciones contextuales. Es un "microscopio para transformers", en palabras del autor, util para experimentos de sonda lineal, logit lens, ablacion de cabezas y desambiguacion contextual de mismo color final.

El modelo se distribuye en formato nativo de Hugging Face (`GPT2LMHeadModel`) con paridad numerica verificada respecto al checkpoint original de PyTorch (`max_abs_logit_diff = 4.77e-06`), junto con artefactos auxiliares como snapshots de embeddings por epoca y la paleta de color determinista. Su contexto es de solo 8 tokens y su licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal tipo GPT-2 (Pre-LN, GELU exacta, embeddings de token y LM-head atados) |
| Parametros totales | 10.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8 tokens |
| Tipos de cuantizacion | No disponible (el modelo es tan pequeno que la cuantizacion carece de sentido practico) |
| Idiomas soportados | No disponible; el vocabulario es de 256 tokens de color, no lenguaje natural |
| Licencia | MIT |
| Formato de pesos | `safetensors` (nativo HF), `best_checkpoint.pt` (PyTorch original), `embedding_snapshots.pt` |

Parametros de configuracion adicionales: `vocab_size=256`, `d_model=16`, `n_layers=2`, `n_heads=4`, `d_ff=64`, `tie_weights=True`.

## Arquitectura y entrenamiento

El modelo es un decoder causal Pre-LN con normalizacion de capa previa a cada subcapa, activacion GELU exacta y ataduras de pesos entre la embedding de tokens y la cabeza de lenguaje. Con `d_model=16`, dos capas y cuatro cabezas de atencion, cada cabeza opera sobre una dimension de solo 4, lo que lo convierte en un caso extremo para estudiar el comportamiento de la atencion multi-cabeza en regimen de baja dimension.

El entrenamiento se realizo desde cero en PyTorch sobre un dataset sintetico de trayectorias de color: 10.000 muestras de entrenamiento, 1.000 de validacion y 1.000 de test, con particion disjunta por trayectoria y sin solapamiento de prefijos. Las trayectorias pertenecen a tres familias (lineal, curva de Bezier y ciclica) sobre una paleta determinista de 256 colores en espacio OKLab (`oklab_256_v1`, SHA-256 `d230c189...f29b`). El dataset tiene version `trajectories_v1` con SHA-256 `fd09fbad...2ea4`. La semilla fue 42 y el entrenamiento se ejecuto en una Tesla T4. La mejor epoca fue la 59. No se documenta uso de RLHF, DPO ni ajuste por preferencias; es un modelo puramente preentrenado de forma supervisada sobre secuencias de tokens. Se guardaron snapshots de la matriz de embeddings en las epocas 0, 1, 3, 5, 10, 20, 40, 59 y 60 para analisis de evolucion.

## Capacidades

- Prediccion del siguiente token de color en secuencias de hasta 8 tokens sobre un vocabulario cerrado de 256 colores.
- Modelado de trayectorias geometricas en espacio de color: lineal, curva de Bezier y ciclica.
- Desambiguacion contextual de mismo color final (capacidad documentada por el autor como objeto de estudio).
- Inspeccion mecanicista mediante el metodo instrumentado `model.inspect()` del checkpoint original: atlas de embeddings, inspeccion de atencion y Q/K/V, ablacion de cabezas, logit lens y sondas lineales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues.
- No genera texto en lenguaje natural: su salida son distribuciones sobre IDs de color.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el modelo sirve como banco de pruebas controlado para estudiar como surgen representaciones geometricas en las embeddings y en el residual stream a lo largo del entrenamiento, usando los snapshots de embeddings por epoca incluidos.
- Analisis de atencion en baja dimension: con cabezas de dimension 4, permite aislar patrones de atencion y estudiar Q/K/V sin la complejidad de modelos grandes, facilitando la visualizacion e interpretacion de mapas de atencion.
- Validacion de tecnicas de sonda lineal: la paleta OKLab incluida permite entrenar sondas lineales que predigan coordenadas de color a partir de activaciones internas y comparar con la geometria real de la paleta.
- Experimentos de logit lens y ablacion de cabezas: el modelo es lo bastante pequeno para ejecutar barridos exhaustivos de ablacion y comparar la contribucion de cada cabeza y capa a la prediccion del siguiente color.
- Docencia y formacion: sirve como ejemplo minimo y reproducible de un transformer causal completo (10.816 parametros) para explicar atencion, embeddings atadas y decodificacion autoregresiva en cursos o talleres.
- Reproducibilidad de pipelines de exportacion: el par `best_checkpoint.pt` + `model.safetensors` con paridad numerica verificada permite validar flujos de conversion de PyTorch a Hugging Face en modelos minusculos.
- Estudio de generalizacion por familia de trayectoria: el desglose por familia (lineal, curva, ciclica) permite analizar como un modelo pequeno generaliza entre distintos tipos de geometria.

## Benchmarks y rendimiento

Resultados en el split de test reservado (N=1.000), comparados con dos lineas base del autor:

| Metrica | ChromaGPT (d16_l2_h4) | Extrapolacion lineal RGB 3-pt (usa RGB) | P(x8\|x7) empirica ultimo token |
|---|---:|---:|---:|
| Mejor epoca | 59 | — | — |
| Perdida / perplejidad validacion | 2,2508 / 9,50 | — | — |
| Perdida / perplejidad test | 2,2931 / 9,91 | — | — |
| Precision top-1 siguiente color | 0,318 | 0,290 | 0,200 |
| Precision top-5 siguiente color | 0,798 | 0,709 | 0,580 |
| Error L2 en RGB | 0,1286 | 0,1414 | 0,1711 |
| Diferencia perceptual OKLab ΔE | 0,0529 | 0,0586 | 0,0752 |

Desglose por familia de trayectoria en test:

| Familia | Top-1 | Top-5 | Error L2 RGB | ΔE OKLab |
|---|---:|---:|---:|---:|
| `linear` | 0,386 | 0,886 | 0,1100 | 0,0449 |
| `curved` | 0,294 | 0,835 | 0,1262 | 0,0520 |
| `cyclic` | 0,273 | 0,673 | 0,1496 | 0,0618 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en `float32` (10.816 parametros), irrelevante en la practica.
- GPU recomendadas: cualquiera; el autor entreno en una Tesla T4. Tambien funciona en CPU sin penalizacion perceptible.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650, integradas) y en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (documentado por el autor), `text-generation-inference` (etiqueta declarada) y `endpoints_compatible`. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, la inferencia es practicamente instantanea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados de la misma categoria (transformers minusculos de interpretabilidad sobre vocabularios de color). Las unicas referencias cuantitativas son las dos lineas base del propio autor incluidas en la tabla de benchmarks: la extrapolacion lineal RGB de 3 puntos (que usa informacion RGB, no disponible para ChromaGPT) y la distribucion empirica del ultimo token. ChromaGPT supera a ambas en top-1, top-5, error L2 RGB y ΔE OKLab.

| Modelo | Parametros | Contexto | Top-1 test | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| ChromaGPT d16_l2 | 10.816 | 8 | 0,318 | MIT | Hugging Face |
| Extrapolacion lineal RGB 3-pt | no aplica | no aplica | 0,290 | no disponible | linea base del autor |
| P(x8\|x7) empirica | no aplica | no aplica | 0,200 | no disponible | linea base del autor |

## Limitaciones y advertencias

- Modelo sintetico y educativo: no es un producto de generacion de color ni de texto; no debe usarse en produccion.
- Vocabulario cerrado de 256 colores y contexto maximo de 8 tokens; no procesa lenguaje natural ni otros dominios.
- No se han evaluado sesgos sociales ni de otro tipo; el modelo no opera sobre datos humanos.
- Riesgo de alucinacion en el sentido de predicciones de color incorrectas: top-1 de 0,318 implica que la mayoria de predicciones no coinciden con el color real.
- Rendimiento desigual por familia: la trayectoria ciclica es la mas dificil (top-1 0,273, ΔE 0,0618) frente a la lineal (top-1 0,386, ΔE 0,0449).
- Licencia MIT permite uso comercial, pero el autor desaconseja explicitamente el uso como generador de color en produccion.
- El checkpoint `best_checkpoint.pt` requiere el codigo original del repositorio `sriramrathinavelu/ChromaGPT` para usar `model.inspect()`; el formato HF nativo no expone esas utilidades de inspeccion.
- Fecha de creacion del repositorio en Hugging Face: 2026-11-27; descargas y likes registrados: 0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purplejedi/chromagpt-baseline-d16-l2
- Repositorio original en GitHub: https://github.com/sriramrathinavelu/ChromaGPT
- Notebook de entrenamiento: `notebooks/02_training.ipynb` (en el repositorio original)
- Run de Weights & Biases: https://wandb.ai/chillyskywalker/chromagpt/runs/4cif8pf3
- Commit de origen: `3959108d73f5291558983823c53de2d5d3bc696d`

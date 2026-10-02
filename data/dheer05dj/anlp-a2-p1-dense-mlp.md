# dheer05dj/anlp-a2-p1-dense-mlp

## Resumen

El modelo dheer05dj/anlp-a2-p1-dense-mlp es un checkpoint de investigación publicado como parte de la Assignment 2 de un curso de ANLP (Advanced Natural Language Processing). Corresponde a la variante densa MLP (parte 1) de un ejercicio que compara arquitecturas densas frente a mezclas de expertos (MoE) para traducción automática de vietnamita (vi) y japonés (ja) a inglés (en). Lo desarrolla el usuario dheer05dj y está implementado desde cero en PyTorch, sin partir de un modelo preentrenado.

La arquitectura es un transformer decoder-only con d_model de 512, 8 capas, 8 cabezas de atención, embeddings rotatorios (RoPE), RMSNorm y embeddings atados (tied embeddings). Cuenta con 41.558.528 parámetros totales y activos: al ser una arquitectura densa, todos los parámetros se activan en cada forward pass, a diferencia de la variante MoE del mismo trabajo.

Su relevancia es fundamentalmente didáctica y de referencia: el autor publica métricas reproducibles (perplejidad y BLEU desglosadas por par de idiomas), el número exacto de tokens de entrenamiento (107.305.098) y el tiempo de entrenamiento (11 minutos y 2 segundos), además de un enlace a los registros de Weights & Biases. Sin embargo, carece de licencia declarada, de idiomas documentados formalmente y de cualquier dato sobre longitud de contexto, por lo que su uso fuera del ámbito académico requiere contactar con el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (implementado desde cero en PyTorch) |
| Parametros totales | 41.558.528 (~41,56 M) |
| Parametros activos | 41.558.528 (arquitectura densa: todos los parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | vietnamita (vi) y japones (ja) como idioma origen; ingles (en) como idioma destino (segun las metricas BLEU publicadas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dimension del modelo (d_model) | 512 |
| Numero de capas | 8 |
| Cabezas de atencion | 8 |
| Normalizacion | RMSNorm |
| Codificacion posicional | RoPE (Rotary Position Embeddings) |
| Embeddings | atados (tied embeddings) |
| Tamano del repositorio | 0,2 GB |
| Configuracion | `config.json` con el objeto `TransformerConfig` usado por `src/part1/model.py` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo denso con 41,56 M de parametros, 8 capas, d_model de 512 y 8 cabezas de atencion (64 dimensiones por cabeza). Emplea RoPE para la codificacion posicional, RMSNorm como normalizacion de capa y embeddings atados entre la entrada y la proyeccion de salida, una combinacion habitual para reducir el recuento de parametros en modelos pequenos. El autor indica que la implementacion es propia en PyTorch y que el checkpoint se carga mediante `src.part1.train.load_checkpoint(dir)`, por lo que no es directamente compatible con runtimes estandar como vLLM o llama.cpp sin adaptacion del codigo.

Respecto al entrenamiento, la informacion proporcionada indica 107.305.098 tokens de entrenamiento y un tiempo total de 11 minutos y 2 segundos, lo que sugiere un entrenamiento muy corto sobre hardware relativamente modesto. El modelo se evalua como traductor vi -> en y ja -> en. No hay informacion sobre la composicion exacta del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El autor enlaza los registros de entrenamiento en Weights & Biases, que constituyen la unica fuente adicional de detalle sobre el proceso.

## Capacidades

- Traduccion automatica de vietnamita a ingles y de japones a ingles, unica tarea documentada explicitamente en la model card.
- Generacion de texto autoregresiva condicionada por el prefijo de origen, al ser un decoder-only.
- Procesamiento multilingue limitado a la combinacion vi/ja -> en; no se documentan capacidades en otros pares de idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades multimodales.
- No se documenta una ventana de contexto utilizable en tokens.

## Casos de uso

- Traduccion vi -> en en lotes academicos: el modelo alcanza un BLEU de 44,64 en vietnamita-ingles, suficiente para experimentos de investigacion comparativa entre arquitecturas densas y MoE.
- Traduccion ja -> en en el mismo contexto experimental: con un BLEU de 34,96, es util como linea base para medir la mejora que aporta una variante MoE en el mismo dataset.
- Reproducibilidad de resultados: dado que el autor publica los tokens de entrenamiento, el tiempo y los registros de W&B, el checkpoint sirve para replicar el experimento y validar la metodologia.
- Docencia y practicas de NLP: es un ejemplo compacto (41,56 M de parametros, 0,2 GB) para que estudiantes inspeccionen un transformer decoder-only escrito desde cero, con RoPE, RMSNorm y embeddings atados.
- Ablaciones de arquitectura: permite comparar el efecto de sustituir capas densas MLP por capas MoE manteniendo constante el resto de hiperparametros (d_model 512, 8 capas, 8 cabezas).
- Estudio de la curva de perplejidad por idioma: las metricas separadas por idioma (3,743 en vi frente a 4,99 en ja) permiten analizar el desequilibrio de rendimiento entre idiomas de origen con la misma cantidad de datos.
- Prototipado en CPU: por su tamano reducido, puede ejecutarse en portatiles para pruebas de traduccion de frases cortas sin necesidad de GPU, siempre que se implemente el cargador del repositorio del curso.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| test_ppl | 4,322 |
| test_ppl_vi | 3,743 |
| test_ppl_ja | 4,990 |
| bleu_vi | 44,64 |
| bleu_ja | 34,96 |
| bleu_all | 39,84 |
| train_tokens | 107.305.098 |
| train_time | 11 min 2 s |
| Parametros totales | 41,56 M |
| Parametros activos | 41,56 M |

No se han publicado en la informacion disponible resultados comparativos frente a modelos de referencia externos (MMLU, HumanEval, GSM8K u otros), ya que el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 166 MB en FP32 (41,56 M de parametros x 4 bytes), unos 83 MB en FP16/BF16, unos 42 MB en INT8 y unos 21 MB en INT4, sin contar activaciones ni cache de claves/valores (que dependen de la longitud de contexto, no documentada).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. Tambien es viable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo lanzada en la ultima decada, e incluso en hardware integrado.
- Opciones de despliegue: el autor solo documenta la carga mediante `src.part1.train.load_checkpoint(dir)` del repositorio del curso. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni Text Generation Inference, dado que la arquitectura es una implementacion propia con pesos en safetensors.
- Latencia y throughput estimados: no disponibles. Solo se conoce el tiempo de entrenamiento (11 min 2 s para 107,3 M de tokens), que no es extrapolable directamente a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dheer05dj/anlp-a2-p1-dense-mlp | 41,56 M (denso) | no disponible | no disponible | safetensors, 0,2 GB | BLEU vi 44,64 / ja 34,96; ppl 4,322 |
| unignoramus/anlp-a2-p1-dense | no disponible | no disponible | no disponible | safetensors, ~144 MB | Checkpoint de la misma assignment; sin metricas publicadas en la informacion disponible |
| irishbumfuzzle/anlp-a2-p1-dense | no disponible | no disponible | no disponible | safetensors | Checkpoint de la misma assignment; sin metricas publicadas en la informacion disponible |

Las dos alternativas identificadas pertenecen al mismo ejercicio academico (Assignment 2 de ANLP) y son variantes densas equivalentes, no modelos de proposito general comparables. No se dispone de datos suficientes para comparar con modelos de traduccion comerciales o de referencia de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no descrito, se desconoce su comportamiento ante dominios, registros o variedades dialectales distintas de las del corpus.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo entrenado con solo 107,3 M de tokens; las traducciones pueden contener contenido inventado o infieles, especialmente en frases largas o poco frecuentes.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento en entradas largas.
- Limitaciones de idioma: el modelo solo cubre vi -> en y ja -> en; no se ha validado para otros pares ni para generacion libre multilingue.
- Rendimiento desigual por idioma: la perplejidad en japones (4,990) es un 33 % superior a la de vietnamita (3,743), y el BLEU cae de 44,64 a 34,96, lo que indica un rendimiento claramente inferior en japones.
- Restricciones de licencia: la licencia no esta declarada en el repositorio, por lo que no se puede asumir uso comercial sin autorizacion explicita del autor.
- Caveat de produccion: el modelo depende de codigo propio (`src.part1/model.py`) para cargarse, no tiene pipeline declarado en HuggingFace ni integracion con runtimes de inferencia estandar, y no incluye tokenizador documentado en la informacion disponible.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento o soporte por parte del autor.
- Uso previsto: se trata de un checkpoint academico, no de un modelo listo para despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p1-dense-mlp
- Registros de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part1-moe/runs/42jipq3h
- Checkpoint equivalente de otro autor (unignoramus): https://huggingface.co/unignoramus/anlp-a2-p1-dense/tree/main
- Checkpoint equivalente de otro autor (irishbumfuzzle): https://huggingface.co/irishbumfuzzle/anlp-a2-p1-dense

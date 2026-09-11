# siddarthg44/anlp-a2-p1-moe_4e1a

## Resumen

`siddarthg44/anlp-a2-p1-moe_4e1a` es un modelo de traduccion automatica publicado en Hugging Face por el usuario siddarthg44 como parte de la "Part 1" de la asignacion 2 de la asignatura ANLP (Advanced Natural Language Processing). Se trata de un transformer decoder-only en el que las capas feed-forward se sustituyen por una variante de mixture-of-experts denominada `moe_4e1a`, con 4 expertos, `top_k=1` y ningun experto compartido. El modelo traduce de vietnamita y japones a ingles y fue entrenado sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`.

La escala es deliberadamente pequena: `d_model` de 512, 8 capas, 8 cabezas de atencion, `d_ff` de 2048 por experto y una ventana de contexto de solo 256 tokens. El presupuesto de entrenamiento declarado es de 40 millones de tokens, con un tokenizador BPE a nivel de byte de 16.000 merges entrenado conjuntamente sobre ingles, vietnamita y japones. El repositorio ocupa 0,1 GB e incluye `best.pt` (pesos y configuracion), `tokenizer.json` y `eval.json` con metricas de perplejidad, BLEU y especializacion de expertos.

Su relevancia es fundamentalmente academica y experimental: sirve como artefacto reproducible para estudiar enrutamiento de expertos en tareas de traduccion con recursos limitados. No es un modelo orientado a produccion: no declara licencia, no tiene descargas ni valoraciones, no publica pesos en formatos estandar de inferencia (safetensors, GGUF) y requiere cargar el codigo propio del autor (`src/model.py`) para reconstruir la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward de tipo mixture-of-experts (variante `moe_4e1a`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con `n_experts=4`, `top_k=1`, `n_shared=0`: se activa 1 experto por token) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en su precision original; no hay versiones cuantizadas) |
| Idiomas soportados | Ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | PyTorch: `best.pt` (state dict serializado, cargado con `weights_only=False`); no hay safetensors ni GGUF |
| `d_model` / capas / cabezas | 512 / 8 / 8 |
| Configuracion FFN | `{'type': 'moe', 'd_ff': 2048, 'n_experts': 4, 'top_k': 1, 'n_shared': 0, 'match': 'total'}` |
| Tokenizador | BPE a nivel de byte, 16.000 merges, entrenado conjuntamente en en + vi + ja |
| Presupuesto de entrenamiento | 40.000.000 de tokens |
| Dataset | `belumind/en-vi-ja-curated-500k-triplets` |
| Tarea (pipeline) | translation (vi -> en, ja -> en) |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion en Hugging Face | 2026-09-11 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only cuyo bloque feed-forward se reemplaza por una capa de mezcla de expertos. La configuracion declarada es `type: moe`, `d_ff: 2048`, `n_experts: 4`, `top_k: 1`, `n_shared: 0` y `match: 'total'`. En la practica esto implica cuatro redes feed-forward independientes por capa, de las que se enruta cada token a una unica (`top_k=1`), sin experto compartido que reciba todos los tokens; la opcion `match: 'total'` hace referencia al criterio de reparto del presupuesto de parametros entre la variante densa y la dispersa. El cuerpo del modelo tiene 8 capas, `d_model` de 512 y 8 cabezas de atencion, con una ventana de contexto de 256 tokens.

El entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un presupuesto de 40 millones de tokens y un tokenizador BPE de 16.000 merges entrenado de forma conjunta sobre los tres idiomas. La model card no detalla la composicion exacta del dataset, la mezcla de idiomas, la funcion de perdida, ni si hubo etapas de ajuste con RLHF, DPO o instrucciones. Tampoco se documenta ninguna tecnica de decodificacion especulativa, atencion lineal u otra innovacion de inferencia.

En cuanto al tamano, el autor no publica el numero de parametros. Con `d_model=512` y 8 capas, el orden de magnitud esperable es de decenas de millones de parametros, y el tamano del repositorio (0,1 GB) es coherente con pesos en fp32 de ese rango, pero se trata de una inferencia a partir de los datos publicados, no de una cifra confirmada. El archivo `eval.json` incluido en el repositorio contiene metricas de perplejidad de test, BLEU y especializacion de expertos, aunque sus valores no se reproducen en la model card.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, segun la model card.
- Generacion de texto autoregresiva mediante un decoder-only transformer.
- Enrutamiento disperso de tokens a expertos: cada token pasa por 1 de los 4 expertos de cada capa.
- Manejo de vocabulario multilingue limitado a los tres idiomas del tokenizador (en, vi, ja).
- Reconstruccion e inferencia local mediante el codigo de referencia del autor (`src/model.py`, `TransformerConfig.from_dict`, `build_model`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo de "pensamiento" explicito.
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documenta una capacidad de traduccion inversa (en -> vi, en -> ja) como objetivo de entrenamiento.

## Casos de uso

- Traduccion de fragmentos cortos en un pipeline de preprocesado: con una ventana de 256 tokens, el modelo encaja en la traduccion de frases o parrafos breves de vietnamita y japones a ingles antes de indexar contenido en un buscador o en un sistema RAG.
- Normalizacion de datos multilingues para anotacion: convertir titulares, comentarios o descripciones breves de vi/ja a ingles para que anotadores o modelos posteriores trabajen en un unico idioma.
- Traduccion de mensajes de chat o tickets de soporte: los turnos individuales suelen caber en 256 tokens, de modo que el modelo puede traducir cada mensaje de forma aislada dentro de un flujo conversacional.
- Traduccion de titulos y descripciones de producto en comercio electronico: textos cortos de catalogos en vietnamita o japones traducidos a ingles para fichas de producto.
- Subtitulado y transcripcion: traduccion linea a linea de subtitulos, donde cada unidad es tipicamente corta y no requiere contexto extenso.
- Estudio de enrutamiento de expertos: el archivo `eval.json` incluye metricas de especializacion, lo que permite usar el modelo como banco de pruebas para analizar como se reparten los tokens entre los 4 expertos con `top_k=1`.
- Base para experimentos academicos de comparacion denso vs. MoE: la variante `moe_4e1a` con `match: 'total'` esta pensada para compararse con contrapartidas densas bajo un presupuesto de parametros equivalente.
- Prototipado de traduccion vi->en y ja->en en entornos sin GPU: el tamano reducido del repositorio permite ejecutarlo en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el archivo `eval.json` contiene perplejidad de test, BLEU y metricas de especializacion de expertos, pero no reproduce ninguno de esos valores ni los compara con modelos de referencia. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de traduccion como WMT o FLORES-200.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma confirmada; con un repositorio de 0,1 GB, el modelo completo (pesos y estados) cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, incluidas GPU integradas o de portatil.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo reciente (por ejemplo, series RTX 20xx/30xx/40xx) y previsiblemente tambien en CPU.
- Opciones de despliegue: no hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni servidores de inferencia estandar, ya que los pesos se distribuyen como `best.pt` y requieren el codigo propio del autor (`src/model.py`) para reconstruir la arquitectura antes de cargar el state dict.
- Latencia y throughput: no disponible; no se publican mediciones.
- Nota de seguridad: el autor carga el checkpoint con `weights_only=False`, lo que implica deserializacion de pickle y requiere confiar en el origen del archivo.

## Comparativa con modelos similares

Los valores de las alternativas provienen de la documentacion publica de cada proyecto; los del modelo analizado son los declarados en su model card.

| Modelo | Parametros | Contexto | Licencia | Idiomas relevantes | Disponibilidad de pesos |
|---|---|---|---|---|---|
| `siddarthg44/anlp-a2-p1-moe_4e1a` | no disponible | 256 tokens | no disponible | vi -> en, ja -> en | `best.pt` (PyTorch) + codigo propio |
| Helsinki-NLP Opus-MT (modelos Marian) | ~70-80 M por par de idiomas | hasta 512 tokens | CC-BY 4.0 | pares concretos, incluidos vi/en y ja/en | safetensors / PyTorch, integrable en pipelines estandar |
| NLLB-200 (distilled 600M) | 600 M (variante densa destilada) | 512 tokens | CC-BY-NC 4.0 (no comercial) | 200 idiomas, incluidos vi y ja | safetensors / PyTorch |
| M2M-100 (418M) | 418 M | hasta 1024 tokens | MIT | 100 idiomas, incluidos vi y ja | safetensors / PyTorch |

Diferencias clave: el modelo analizado es mucho mas pequeno, esta limitado a la direccion vi/ja -> en, carece de licencia declarada y no ofrece formatos de pesos listos para servidores de inferencia. Opus-MT es la alternativa mas directa por tamano y por estar especializada por pares de idiomas; NLLB-200 y M2M-100 cubren muchos mas idiomas y disponen de licencias explicitas, pero son entre uno y dos ordenes de magnitud mayores.

## Limitaciones y advertencias

- Contexto muy corto: 256 tokens, insuficiente para documentos largos, conversaciones extensas o traduccion con contexto amplio.
- Direccionalidad limitada: el entrenamiento declarado cubre vi -> en y ja -> en; no hay evidencia de calidad en traduccion inversa ni entre vi y ja.
- Cobertura linguistica restringida a tres idiomas (en, vi, ja), sin soporte documentado para el castellano.
- Licencia no disponible: no se puede asumir permiso de uso comercial ni redistribucion; en ausencia de licencia explicita, los derechos quedan por defecto reservados al autor.
- Sin resultados de benchmarks publicos: no hay evidencia cuantitativa de calidad de traduccion frente a alternativas.
- Sin adopcion: 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no hay retroalimentacion de la comunidad ni garantias de mantenimiento.
- Origen academico: es la "Part 1" de una asignacion de curso, sin documentacion sobre composicion del dataset, procesos de filtrado, evaluacion de sesgos ni etapas de alineacion (RLHF/DPO).
- Riesgo de alucinacion y de traducciones fluidas pero infieles, especialmente en frases largas o con terminologia especializada, dado el reducido presupuesto de entrenamiento (40 M de tokens).
- Sesgos potenciales no evaluados: no se documenta ningun analisis de sesgo de genero, dialecto o dominio.
- Integracion limitada: al no publicarse safetensors ni GGUF, no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI sin trabajo previo de conversion.
- Riesgo de deserializacion: la carga del checkpoint requiere `weights_only=False`, lo que obliga a confiar en el contenido del archivo `best.pt`.
- No apto para produccion sin una evaluacion previa propia: perplejidad, BLEU y especializacion de expertos estan en `eval.json`, pero no se detallan en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/siddarthg44/anlp-a2-p1-moe_4e1a
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Codigo de carga y definicion del modelo: `src/model.py` (referenciado en la model card; no se proporciona URL publica del repositorio)
- Metricas de evaluacion: `eval.json` dentro del repositorio del modelo (perplejidad de test, BLEU, especializacion de expertos)
- Paper o informe tecnico: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre este modelo; las busquedas devolvieron contenido no relacionado (foros y guias sobre mensajeria y telefonia) que no aporta informacion tecnica sobre el modelo.

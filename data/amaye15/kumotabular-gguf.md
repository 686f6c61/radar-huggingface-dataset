# amaye15/kumotabular-gguf

## Resumen

Kumo-Tabular es un modelo fundacional para datos tabulares en regimen zero-shot, desarrollado originalmente por NVIDIA. En lugar de entrenarse sobre un dataset concreto, aprende a resolver tareas de clasificacion y regresion a partir de un conjunto de soporte etiquetado (support set) y filas de consulta sin etiquetar, sin reentrenamiento ni ajuste fino. Esta version concreta, publicada por el usuario amaye15, es una conversion a formato GGUF del checkpoint original de NVIDIA, orientada a inferencia sin dependencias de PyTorch ni de un runtime de Python.

El modelo es de tamano muy reducido: 27.458.378 parametros en la variante small (la familia completa ofrece variantes small de 28M, medium de 61M y large de 214M). Acepta filas de tipos mixtos (numeros, cadenas y nulos para valores ausentes) y devuelve probabilidades por clase en clasificacion o 999 cuantiles por fila en regresion. La conversion se ha verificado bit-exacta contra el checkpoint original de PyTorch, lo que la hace interesante para despliegues en Rust mediante el framework Burn.

Su relevancia actual reside en la combinacion de tres factores: un modelo fundacional tabular de NVIDIA, un formato de pesos portable (GGUF) y una implementacion nativa en Rust (zsfm-rs) que elimina la pila de Python en produccion. Para equipos que necesitan clasificacion tabular de baja latencia en entornos embebidos o servicios Rust, es una alternativa poco habitual en el ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional tabular con encoder de embeddings por columna y ensemble de preprocesamiento; acepta filas de tipo mixto (numerico, categorico, nulo) |
| Parametros totales | 27.458.378 (variante small) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tamano del support set y del numero de filas de consulta, no de una ventana de tokens) |
| Tipos de cuantizacion | F32 (unico fichero publicado: `kumotabular-classification-small-f32.gguf`) |
| Idiomas soportados | en (ingles; el modelo opera sobre datos tabulares, no sobre texto libre) |
| Licencia | Pesos: OpenMDW-1.1 (uso comercial permitido); codigo de conversion: MIT |
| Formato de pesos | GGUF (con metadatos de arquitectura embebidos, sin `config.json` separado) |

## Arquitectura y entrenamiento

Kumo-Tabular es un modelo fundacional tabular, no un transformer de lenguaje. La entrada se compone de un support set (filas etiquetadas) y filas de consulta (sin etiquetar). El encoder genera embeddings por columna, aplicando codificacion categorica mediante codigos de primera aparicion y un ensemble de preprocesamiento con semilla determinista. Una columna que contiene cualquier cadena se trata como categorica; las columnas exclusivamente numericas se tratan como numericas. Los valores nulos se aceptan como valores ausentes.

La salida es, en clasificacion, un vector de probabilidades por clase para cada fila de consulta; en regresion, 999 cuantiles por fila. La familia cubre tres tamanos: small (28M), medium (61M) y large (214M) parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. La innovacion tecnica destacable de esta publicacion concreta es la conversion a GGUF con verificacion bit-exacta frente al checkpoint de PyTorch, junto con el port a Rust/Burn que permite inferencia sin Python.

## Capacidades

- Clasificacion tabular zero-shot: predice probabilidades por clase a partir de un support set etiquetado, sin entrenamiento adicional.
- Regresion tabular zero-shot: devuelve 999 cuantiles por fila de consulta.
- Manejo de tipos mixtos: numeros, cadenas y nulos en la misma fila.
- Codificacion categorica automatica por primera aparicion.
- Ensemble de preprocesamiento con semilla determinista y parametro `estimators` configurable.
- Inferencia sin PyTorch ni runtime de Python (via zsfm en Rust o el binding de Python sobre el mismo motor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles en metadatos; el modelo no procesa texto libre.
- Capacidades especiales: ninguna adicional (sin vision, audio ni modo thinking).

## Casos de uso

- Clasificacion de riesgo crediticio en tiempo real: dado un lote de solicitudes historicas etiquetadas (support set) y las nuevas solicitudes, el modelo devuelve probabilidades de impago por fila, lo que permite integrarlo en un servicio Rust de scoring sin reentrenar.
- Deteccion de fraude en transacciones: con un support set de transacciones etiquetadas como fraudulentas o legitimas, el modelo clasifica transacciones nuevas en linea; su tamano de 28M y la ausencia de Python reducen la latencia y el coste de despliegue.
- Triaje de tickets de soporte: clasificacion de tickets en categorias a partir de un conjunto etiquetado de ejemplo, util para enrutado automatico en pipelines internos donde no se quiere mantener un modelo supervisado dedicado.
- Prediccion de abandono de clientes (churn): regresion sobre features tabulares de clientes para estimar cuantiles de probabilidad de baja, con el support set construido a partir de cohortes historicas.
- Scoring en entornos embebidos o edge: al ser GGUF F32 de 28M parametros y ejecutarse con Burn, puede desplegarse en dispositivos con recursos limitados donde no cabe una pila de Python.
- Enriquecimiento de pipelines de datos en Rust: integracion como etapa de clasificacion dentro de un servicio de procesamiento de eventos, aprovechando que el binario `zsfm` acepta JSON por stdin y devuelve JSON.
- Prototipado rapido de tareas tabulares: uso como baseline zero-shot antes de invertir en un modelo supervisado, gracias a que no requiere entrenamiento ni ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F32 de 28M parametros ocupa aproximadamente 0,1 GB; la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; no se requiere A100 ni H100. Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, en cualquier RTX o equivalente, e incluso en iGPU y dispositivos embebidos.
- Opciones de despliegue: `zsfm` (CLI en Rust via `cargo install zsfm`), binding de Python `pip install zsfm`, y el runtime Burn subyacente. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kumo-Tabular GGUF (esta ficha) | 27,5M (small) | no aplica (support set) | GGUF | OpenMDW-1.1 (pesos) / MIT (codigo) | Zero-shot tabular, inferencia en Rust sin Python |
| Kumo-Tabular original (NVIDIA) | 28M / 61M / 214M | no aplica | PyTorch | OpenMDW-1.1 | Checkpoint de referencia; requiere PyTorch |
| Alternativas de modelo fundacional tabular | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Solo se ha publicado la variante small (28M) en F32; las variantes medium y large no estan disponibles en este repositorio.
- Solo se ha publicado el fichero de clasificacion; no hay fichero de regresion en el repo, aunque la model card describe el formato de salida de regresion.
- El modelo esta orientado a datos tabulares en ingles; no es un modelo de lenguaje y no debe usarse para generacion de texto.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero las predicciones sobre columnas con distribuciones alejadas del support set pueden ser poco fiables; el rendimiento depende criticamente de la calidad y representatividad del support set.
- La codificacion categorica por primera aparicion puede degradar el rendimiento si el orden de las filas del support set no es representativo.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un modelo fundacional tabular, hereda los sesgos de los datos con los que fue entrenado por NVIDIA.
- Licencia: los pesos estan bajo OpenMDW-1.1, que permite uso comercial segun la release de NVIDIA; el codigo de conversion es MIT. Conviene verificar los terminos exactos de OpenMDW-1.1 antes de un despliegue comercial.
- El repositorio tiene muy pocas descargas (36) y cero likes, lo que sugiere poca validacion por parte de la comunidad; tratar como experimental.
- La verificacion bit-exacta la reporta el autor; no se ha validado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amaye15/kumotabular-gguf
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Kumo-Tabular
- Repositorio zsfm-rs: https://github.com/amaye15/zsfm-rs
- Framework Burn: https://github.com/tracel-ai/burn
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.

# Himasree/CodeEmbed-checkpoints

## Resumen

CodeEmbed es una coleccion de checkpoints entrenados para recuperacion de codigo (code retrieval) a partir de consultas en lenguaje natural. Lo desarrolla Himasree Panku y se publica en Hugging Face bajo el identificador `Himasree/CodeEmbed-checkpoints`. El problema que aborda es la busqueda semantica de funciones de codigo: dado un enunciado en ingles, devolver las funciones fuente mas relevantes de un corpus. El repositorio agrupa modelos base, experimentos de doble codificador (bi-encoder), estudios de ablacion, experimentos de recuperacion hibrida y modelos de la denominada Phase 7.

Tecnicamente se apoya en arquitecturas transformer con esquema bi-encoder (codificador de consulta y codificador de codigo con representaciones densas), combinadas con recuperacion lexica BM25 e interpolacion convexa de puntuaciones. La evaluacion usa MRR, Recall@k y NDCG@10 sobre un corpus derivado de CodeSearchNet con limpieza AST. El repositorio pesa 9.6 GB e incluye tanto checkpoints seleccionados (`best_*.pt`) como checkpoints intermedios de entrenamiento.

Su relevancia actual es metodologica mas que de producto: documenta un flujo completo de experimentacion en recuperacion de codigo con resultados reproducibles por configuracion. No es un modelo generativo ni un asistente conversacional; es una pieza de infraestructura para sistemas de busqueda de codigo, RAG sobre repositorios y motores de recuperacion hibrida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder (doble codificador) para code retrieval; se evaluan tambien CodeBERT, UniXcoder, MiniLM y modelos Jina de codigo en la fase 7 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other (la licencia de cada checkpoint puede depender de los modelos preentrenados de terceros utilizados) |
| Formato de pesos | checkpoints PyTorch (`.pt`: `best_*.pt`, `checkpoint_epoch_*.pt`, `checkpoint_step_*.pt`) |
| Libreria | pytorch |
| Tarea (pipeline) | feature-extraction |
| Tamano del repositorio | 9.6 GB |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

El proyecto se centra en representaciones de codigo basadas en transformers con un esquema bi-encoder: la consulta en lenguaje natural y la funcion de codigo se codifican por separado y se comparan en un espacio denso. Sobre esa base se exploran estrategias de pooling y experimentos de temperatura, recogidos en los directorios de ablacion (`ablation/`, `ablation_basic_sweep/`, `ablation_dual_sweep/`, `ablation_dual_fixed_sweep/`). Los experimentos de doble codificador aparecen en `basic/`, `dual/`, `dual_bm25_hard/`, `dual_fixed/` y `dual_fixed_bm25/`, y existen variantes compartidas en `shared/` y `shared_large/`.

El entrenamiento se realiza sobre un corpus derivado de CodeSearchNet con limpieza mediante AST, sujeto a las condiciones de licencia y atribucion originales. La recuperacion combina recuperacion densa, recuperacion lexica BM25 y una interpolacion convexa de ambas puntuaciones; una configuracion demostrada usa un peso denso (alpha) de 0.70 frente a una contribucion BM25 de 0.30 sobre un corpus de 19 632 elementos, con busqueda vectorial sobre FAISS. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. Una parte relevante del repositorio son modelos de terceros integrados o evaluados en la fase 7 (CodeBERT, UniXcoder, MiniLM y modelos Jina de codigo), que se incluyen sin implicar titularidad sobre sus arquitecturas, tokenizadores o datos originales.

## Capacidades

- Recuperacion de funciones de codigo a partir de consultas en lenguaje natural (code retrieval / code search).
- Generacion de representaciones densas (embeddings) de consultas y de codigo, aptas para `feature-extraction`.
- Recuperacion semantica densa sobre indices vectoriales construidos con FAISS.
- Recuperacion lexica BM25 como componente independiente.
- Recuperacion hibrida mediante interpolacion convexa de puntuaciones densas y lexicales.
- Evaluacion de ranking con metricas MRR, Recall@1, Recall@5, Recall@10 y NDCG@10.
- Experimentacion con distintas estrategias de pooling y valores de temperatura.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible (el modelo no es generativo conversacional).
- Capacidades multilingues: solo ingles (`en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Busqueda interna de codigo en repositorios de empresa: indexar las funciones del corpus con embeddings y servir consultas en lenguaje natural ("funcion que valida un DNI") mediante recuperacion densa con FAISS sobre el checkpoint `dual` o `shared`.
- Asistente de descubrimiento de API en una plataforma interna: dado un objetivo funcional, devolver las funciones candidatas y su firma para que el desarrollador reutilice codigo en lugar de reimplementarlo.
- Alimentacion de pipelines RAG sobre base de codigo: usar el modelo como recuperador que devuelve los fragmentos mas relevantes, que luego se pasan a un modelo generativo para explicar o resumir el codigo encontrado.
- Deduplicacion y agrupacion de funciones: calcular embeddings y agrupar funciones con representaciones proximas para detectar codigo duplicado o variantes casi identicas.
- Motor de busqueda hibrido en produccion: combinar el indice denso con BM25 y ponderar con alpha = 0.70 para escenarios donde los identificadores y nombres exactos importan, como busqueda de simbolos concretos.
- Revision de onboarding tecnico: permitir a nuevos integrantes localizar implementaciones existentes por descripcion funcional en lugar de por nombre de simbolo.
- Investigacion en recuperacion de informacion: usar los checkpoints y configuraciones de ablacion como linea base reproducible para comparar estrategias de pooling, temperatura y esquemas de fusion de puntuaciones.
- Auditoria de cobertura documental: medir con Recall@k hasta que punto el corpus recupera las funciones esperadas para un conjunto de consultas de referencia.

## Benchmarks y rendimiento

Resultados reportados por el autor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Fase 7, experimento CodeEmbed con CodeBERT sobre un conjunto de test de 19 632 pares consulta-codigo:

| Metrica | Valor |
|---|---|
| Test MRR | 0.7658 |
| Recall@1 | 0.6890 |
| Recall@5 | 0.8640 |
| Recall@10 | 0.9060 |
| NDCG@10 | 0.7976 |
| MRR de validacion (primera epoca) | 0.7356 |

Recuperacion hibrida (configuracion demostrada, interpolacion convexa):

| Metrica | Valor |
|---|---|
| Test MRR | 0.6612 |
| Mejora frente a la configuracion densa equivalente | 40.7 % |
| Latencia de busqueda | ~216.81 ms |
| Tamano del corpus | 19 632 |
| Peso denso (alpha) | 0.70 |
| Tasa de fuga observada (leakage) | 1.23 % |

Estos valores son especificos del montaje de evaluacion y del dataset del proyecto, y no son directamente comparables con resultados de otros corpus o configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 9.6 GB en total, pero incluye multiples checkpoints, no un unico modelo desplegable.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: no disponible; la viabilidad depende del checkpoint concreto que se seleccione y de su tamano, que no se especifica.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El material se distribuye como checkpoints PyTorch que requieren el codigo fuente, los ficheros de configuracion, el tokenizador y el entorno de dependencias del proyecto.
- Latencia y throughput estimados: se reporta una latencia de busqueda de aproximadamente 216.81 ms para la configuracion hibrida sobre un corpus de 19 632 elementos. No se reporta throughput de codificacion.

## Comparativa con modelos similares

El repositorio incluye y evalua modelos de terceros de la misma categoria funcional (recuperacion de codigo). No se dispone de cifras comparativas por modelo en la informacion proporcionada.

| Modelo | Tipo | Contexto | Parametros | Licencia | Disponibilidad en este repo |
|---|---|---|---|---|---|
| CodeEmbed (checkpoints propios) | Bi-encoder transformer | no disponible | no disponible | other | Si, multiples directorios de experimentos |
| CodeBERT | Transformer preentrenado para codigo | no disponible | no disponible | no disponible | Si (`phase7/codebert/`) |
| UniXcoder | Transformer preentrenado para codigo | no disponible | no disponible | no disponible | Si (`phase7/unixcoder/`) |
| MiniLM L6 | Transformer compacto | no disponible | no disponible | no disponible | Si (`phase7/minilm_l6/`) |
| Jina code v2 | Modelo de embeddings de codigo | no disponible | no disponible | no disponible | Si (`phase7/jina_v2_code/`) |

## Limitaciones y advertencias

- El modelo esta orientado a recuperacion, no a generacion; no debe esperarse salida de texto ni razonamiento conversacional.
- Idioma limitado al ingles: las consultas en otros idiomas no estan soportadas por diseno.
- No se documentan sesgos especificos, pero el corpus deriva de CodeSearchNet y hereda sus sesgos de cobertura y estilo de codigo.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de recuperacion irrelevante o de falsos positivos en el ranking.
- Se reporta una tasa de fuga (leakage) observada del 1.23 % en la configuracion hibrida, un caveat relevante para interpretar las metricas.
- Las metricas reportadas son especificas del montaje de evaluacion del autor; no se garantiza su traslado a corpus o dominios distintos.
- Licencia `other`: la licencia de cada checkpoint puede depender de los modelos preentrenados y componentes de terceros. Antes de redistribuir o licenciar comercialmente un checkpoint hay que verificar las licencias aplicables de CodeBERT, UniXcoder, MiniLM, Jina y del dataset subyacente.
- El dataset original mantiene sus requisitos de licencia y atribucion.
- La inclusion de modelos de terceros en el repositorio no transfiere derechos sobre sus arquitecturas, tokenizadores ni datos de entrenamiento.
- Para reproducir resultados se necesita el codigo fuente, los ficheros de configuracion, el pipeline de preprocesado, el tokenizador y el entorno de dependencias del proyecto, que no se detallan en la model card.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso en produccion ni de validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Himasree/CodeEmbed-checkpoints
- Paper: no disponible
- Blog o articulo tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Dataset de referencia (CodeSearchNet): no disponible como enlace en la informacion proporcionada

Nota: los resultados de busqueda web asociados a esta consulta no contenian informacion relevante sobre el modelo ni sobre recuperacion de codigo, por lo que no se incluyen enlaces adicionales.

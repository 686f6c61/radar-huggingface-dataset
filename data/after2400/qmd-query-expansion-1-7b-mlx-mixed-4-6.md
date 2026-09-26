# after2400/qmd-query-expansion-1.7B-mlx-mixed-4-6

## Resumen

qmd-query-expansion-1.7B-mlx-mixed-4-6 es una conversion al formato MLX del modelo de expansion de consultas tobil/qmd-query-expansion-1.7B-gguf, publicada por el usuario after2400. Se trata de un ajuste fino sobre Qwen/Qwen3-1.7B (1.720.574.976 parametros) especializado en transformar una consulta de busqueda en tres representaciones textuales tipadas que alimentan motores de recuperacion. No es un modelo conversacional de proposito general, sino un componente de infraestructura de busqueda.

El modelo resuelve la fase de expansion de queries dentro del stack qmd: dada una consulta breve, devuelve lineas con prefijos `hyde:` (pasaje hipotetico), `lex:` (variacion de palabras clave) y `vec:` (reformulacion en lenguaje natural), que despues se usan para busqueda hibrida. Es el modelo de expansion por defecto de pyqmd, el port a Python/MLX de qmd, lo que lo hace relevante para desarrolladores que despliegan busqueda local sobre Apple Silicon.

La relevancia tecnica esta en su cuantizacion mixta 4/6 bits con group size 64, que replica las decisiones de capa de Q4_K_M de llama.cpp para reducir el peso a 1,1 GB manteniendo las capas sensibles en mayor precision. El resultado es un modelo de 1,7B que cabe holgadamente en memoria unificada de equipos de consumo y se ejecuta mediante mlx-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen/Qwen3-1.7B declara 32 768 tokens |
| Tipos de cuantizacion | MLX mixta 4/6 bits afín, group size 64; cabecera de embedding/output atada y capas `v_proj` y `down_proj` en 6 bits, resto en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Qwen/Qwen3-1.7B: Apache-2.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only densa correspondiente a Qwen3-1.7B, con configuracion y tokenizer tomados de Qwen/Qwen3-1.7B en la revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e. Los pesos proceden del fichero `qmd-query-expansion-1.7B-f16.gguf` del repositorio tobil/qmd-query-expansion-1.7B-gguf, revision 7816de0b72572c6c860ca1eddf97ba9e7fb8cc65. La conversion se realizo con el script `scripts/convert_expand_gguf.py` de pyqmd, que mapea los nombres de tensores GGUF al layout de Qwen3 en bf16 y despues aplica `mlx_lm.convert` con un `quant_predicate` mixto 4/6 bits y group size 64, sobre mlx-lm 0.31.3.

La innovacion destacable no esta en la arquitectura sino en la estrategia de cuantizacion: se replica el criterio de Q4_K_M de llama.cpp, manteniendo en 6 bits la cabecera de embedding/output atada y las proyecciones `v_proj` y `down_proj` del primer y ultimo octavo de capas, ademas de cada tercera capa intermedia, mientras el resto de tensores se cuantiza a 4 bits. El ajuste fino subyacente fue entrenado para producir salidas estructuradas con prefijos `hyde:`, `lex:` y `vec:` bajo la plantilla de chat de Qwen3 y el modo `/no_think`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Expansion de consultas de busqueda en tres formatos tipados: pasaje hipotetico (`hyde:`), variacion de palabras clave (`lex:`) y reformulacion en lenguaje natural (`vec:`).
- Generacion de texto autoregresiva estandar heredada de Qwen3-1.7B.
- Soporte de la plantilla de chat de Qwen3 y del prefijo `/no_think` para desactivar el razonamiento explicito.
- Integracion directa como modelo por defecto de pyqmd, el port Python/MLX de qmd.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documentan capacidades de vision, audio ni multilingues especificas mas alla de las heredadas del modelo base.

## Casos de uso

- Busqueda hibrida local: el modelo genera las tres variantes (`hyde`, `lex`, `vec`) que un motor de recuperacion combina para mejorar el recall en consultas cortas o ambiguas, sin depender de servicios en la nube.
- Despliegue en Mac para desarrolladores: al ejecutarse con mlx-lm sobre memoria unificada, permite montar un pipeline de expansion de queries en un portatil Apple Silicon sin GPU dedicada.
- Recuperacion aumentada sobre documentacion interna: la variante `hyde` produce un pasaje hipotetico que se indexa contra el corpus, util en bases de conocimiento corporativas donde las consultas de los usuarios son telegraficas.
- Preprocesado en sistemas RAG: expansion previa a la busqueda vectorial para aumentar la diversidad de embeddings recuperados y reducir falsos negativos.
- Motores de busqueda de codigo: dado que qmd esta orientado a busqueda sobre repositorios, el modelo reformula consultas tecnicas como "auth config" en terminos y pasajes mas cercanos al codigo fuente.
- Herramienta de linea de comandos en pipelines de CI: integrable via Python para indexar y consultar artefactos de build o documentacion de API.
- Servicio de bajo coste en produccion: con 1,1 GB de pesos, se pueden ejecutar multiples instancias en paralelo en un solo nodo para atender volumen alto de expansion de consultas.
- Componente de evaluacion offline: generar conjuntos de variantes de consulta para medir la calidad de un indice de recuperacion antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,1 GB en safetensors cuantizados, por lo que la huella de pesos ronda ese orden y el consumo total dependera de la longitud de contexto.
- GPU recomendadas: no disponible en la informacion proporcionada. El modelo esta empaquetado para MLX, lo que en la practica apunta a Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada.
- Cabe en hardware de consumo: si, por tamano (aproximadamente 1,1 GB de pesos) es adecuado para equipos de consumo con memoria unificada o GPU con al menos unos pocos GB de VRAM; no se especifican modelos concretos.
- Opciones de despliegue: mlx-lm (libreria declarada). El modelo base original esta disponible en formato GGUF para llama.cpp, pero esta conversion concreta es MLX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| after2400/qmd-query-expansion-1.7B-mlx-mixed-4-6 | 1.720.574.976 | no disponible | safetensors (MLX) | MIT | HuggingFace, 163 descargas |
| tobil/qmd-query-expansion-1.7B-gguf | 1,7B (aproximado, no confirmado en la informacion) | no disponible | GGUF | MIT | HuggingFace (modelo base) |
| Qwen/Qwen3-1.7B | 1,7B (aproximado, no confirmado en la informacion) | 32 768 tokens segun el modelo base | safetensors | Apache-2.0 | HuggingFace (modelo base original) |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas variantes.

## Limitaciones y advertencias

- Modelo especializado: su comportamiento esperado es devolver lineas con prefijos `hyde:`, `lex:` y `vec:` bajo una instruccion concreta; no debe usarse como asistente general ni como chatbot.
- Dependencia del prompt: la calidad de la expansion depende de respetar la plantilla de chat de Qwen3 y el prefijo `/no_think`; variaciones en el formato pueden degradar la salida.
- Riesgo de alucinacion: la variante `hyde` genera un pasaje hipotetico que puede contener afirmaciones no veridicas; en recuperacion esto es asumible, pero hay que evitar tomarlo como fuente factual.
- Cuantizacion 4/6 bits: la perdida de precision respecto al original f16 no esta cuantificada en la informacion disponible.
- Idiomas soportados: no disponibles; no hay confirmacion de cobertura multilingue mas alla de la heredada del modelo base.
- Contexto maximo: no disponible en este repositorio; debe confirmarse antes de usarlo con entradas largas.
- Licencia: MIT para los pesos, con modelo base bajo Apache-2.0; en principio permite uso comercial, pero conviene verificar los terminos del ajuste fino upstream tobil/qmd-query-expansion-1.7B-gguf.
- Dependencia de plataforma: al ser una conversion MLX, requiere el ecosistema Apple (mlx-lm) y no se ejecuta directamente en entornos CUDA sin reconvertir los pesos.
- Sin datos de benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/after2400/qmd-query-expansion-1.7B-mlx-mixed-4-6
- Modelo base (GGUF): https://huggingface.co/tobil/qmd-query-expansion-1.7B-gguf
- Modelo base original Qwen3: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio qmd: https://github.com/tobi/qmd
- Repositorio pyqmd: https://github.com/after2400/pyqmd

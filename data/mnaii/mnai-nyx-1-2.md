# MNAII/mnai-nyx-1.2

## Resumen

MNAI Nyx 1.2 es un modelo any-to-any (texto, imagen y audio de entrada y salida) de 2,21 billones de parametros desarrollado por MNAII. Se presenta como un modelo "from scratch", sin modelo base ni destilacion, construido sobre una arquitectura Llama decoder con GQA, SwiGLU, RoPE y RMSNorm, complementada con un encoder de vision ViT, un decoder de imagen DiT y modulos de audio. Sin embargo, el repositorio no contiene pesos entrenados: es un esqueleto de codigo de entrenamiento, tokenizador y pipeline de datos que el usuario debe entrenar por su cuenta en su propio cluster.

El planteamiento es inusual en el ecosistema: el autor publica la infraestructura de entrenamiento (modelo, pipeline de datos, scripts de escalado y cuantizacion) pero no un checkpoint usable. El modelo objetivo declara 2,184 billones de parametros en el nucleo de texto, 6,29 mil millones en vision, 18,86 mil millones en el decoder de imagen y 1,20 mil millones en audio, con una ventana de contexto de 16.384 tokens y un vocabulario de 256.000 entradas.

Su relevancia practica es limitada para quien busque inferencia inmediata, ya que no hay pesos publicados ni benchmarks. Resulta de interes para investigadores que quieran estudiar el diseno de un pipeline de entrenamiento a escala de billones de parametros, con opciones densa y MoE, deduplicacion de datos y cuantizacion a GGUF via llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama decoder (GQA, SwiGLU, RoPE, RMSNorm) + ViT vision encoder + DiT image decoder + audio encoder/decoder |
| Parametros totales | 2.210.128.644.368 (2,210T): nucleo de texto 2,184T + vision 6,29B + decoder de imagen 18,86B + audio 1,20B |
| Parametros activos | 2,184T en variante densa (por defecto); 3,945T en variante MoE (8 expertos, top-2, 14,512T totales) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (~0,55 bytes/parametro, ~1.201 GB) y Q8_0 (~1,0 bytes/parametro, ~2.184 GB); bf16 completo ~4,4 TB |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors en PyTorch (checkpoint bf16); GGUF para el nucleo de texto via llama.cpp |

## Arquitectura y entrenamiento

El nucleo de texto sigue el layout estandar de un bloque Llama: 144 capas, dimension oculta de 36.864, 288 cabezas de consulta y 16 de clave/valor (GQA), FFN de 110.592 y embeddings atados. Sobre ese nucleo se anaden modulos especificos por modalidad: un encoder ViT para vision, un decoder DiT para generacion de imagen y un encoder/decoder de audio. La variante MoE sustituye el MLP SwiGLU de cada bloque por una capa con 8 expertos y enrutamiento top-2, con una perdida auxiliar de balanceo de carga; en ese caso los parametros totales del nucleo de texto ascienden a 14,512T con 3,945T activos por token (27,2% del modelo).

El entrenamiento declarado usa el crawl completo de FineWeb (15 billones de tokens) mas FineWeb-Edu, intercalados 80/20, con filtrado de documentos cortos, boilerplate y texto mayoritariamente no alfabetico, deduplicacion exacta por SHA-256 y casi-duplicados por shingles de 8 palabras con similitud Jaccard. Se ofrece un mix alternativo por dominio (web 50%, libros 15%, codigo 15%, academico 10%, sintetico 10%) y generacion de datos sinteticos a partir de checkpoints previos. El repositorio incluye un script de escalado que ajusta una ley de potencia estilo Chinchilla sobre modelos proxy de 1M, 5M y 20M parametros para extrapolar la perdida a 2,210T. No se documenta RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto multimodal any-to-any: entrada y salida en texto, imagen y audio, segun la declaracion del autor.
- Procesamiento de imagen a texto y texto a imagen mediante los modulos ViT y DiT.
- Procesamiento de audio de entrada y salida mediante encoder/decoder dedicado.
- Entrenamiento configurable en variante densa o MoE con enrutamiento top-2 sobre 8 expertos.
- Pipeline de datos integrado: streaming de FineWeb, filtrado, deduplicacion exacta y difusa, y mezcla por dominio.
- Cuantizacion a GGUF (Q4_K_M y Q8_0) del nucleo de texto mediante llama.cpp.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio especial: no disponible mas alla de la declaracion any-to-any.

## Casos de uso

- Investigacion sobre pipelines de entrenamiento a gran escala: el repositorio permite estudiar y reproducir el diseno completo de un pipeline de 15T tokens con filtrado, deduplicacion y mezcla por dominio, sin necesidad de disponer del corpus completo.
- Experimentacion con leyes de escalado: el script `scaling.py` entrena modelos proxy de 1M a 20M parametros y extrapola la perdida, util para validar decisiones de arquitectura antes de comprometer recursos.
- Estudio comparativo denso frente a MoE: la implementacion permite entrenar ambas variantes con el mismo codigo y comparar coste de activacion (100% frente a 27,2% de parametros por token) en clusters reducidos.
- Formacion y docencia en sistemas distribuidos: el uso de FSDP, torchrun multi-nodo y sharding de expertos sirve como material practico para ensenar entrenamiento distribuido.
- Generacion de checkpoints cuantizados para despliegue: el script `quantize.py` produce GGUF Q4_K_M y Q8_0 a partir de cualquier checkpoint, incluso de prueba, para validar flujos de conversion con llama.cpp.
- Prototipado de modelos multimodales: la combinacion de encoder ViT, decoder DiT y modulos de audio sobre un nucleo Llama ofrece una plantilla para experimentar con arquitecturas any-to-any.
- Evaluacion de estrategias de datos sinteticos: el modulo `synthetic.py` permite generar texto de entrenamiento a partir de checkpoints intermedios y medir su impacto en la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint bf16 completo ocupa aproximadamente 4,4 TB; la cuantizacion Q8_0 del nucleo de texto ronda los 2.184 GB y Q4_K_M unos 1.201 GB. Los modulos de vision, imagen y audio permanecen en PyTorch y anaden requisitos adicionales.
- GPU recomendadas: no es viable en GPU de consumo; requiere clusters multi-nodo con GPUs de数据中心 (A100, H100 o equivalentes) para el checkpoint completo. El entrenamiento declarado usa configuraciones de 128 nodos con 8 GPUs por nodo en los ejemplos del repositorio.
- GPU de consumo: no cabe en ninguna GPU consumer, ni siquiera con Q4_K_M (1,2 TB solo el nucleo de texto).
- Opciones de despliegue: llama.cpp para el nucleo de texto en GGUF; PyTorch/transformers para el modelo completo; FSDP y torchrun para entrenamiento distribuido. vLLM, TGI y Ollama no estan documentados para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos publicados | Enfoque |
|---|---|---|---|---|---|
| MNAI Nyx 1.2 | 2,21T (2,184T texto) | 16.384 | MIT | No (solo codigo) | From scratch, entrenamiento a cargo del usuario |
| Llama 3.1 405B | 405B | 128.000 | Llama Community License | Si | Denso, pesos entrenados |
| DeepSeek-V3 | 671B (37B activos) | 128.000 | MIT (codigo) / licencia de modelo | Si | MoE, pesos entrenados |

La comparativa es estructural: MNAI Nyx 1.2 se situa en la categoria de modelos frontera por numero de parametros declarados, pero no ofrece pesos entrenados ni resultados, por lo que no es directamente comparable en rendimiento con Llama 3.1 405B o DeepSeek-V3, que si publican checkpoints y benchmarks.

## Limitaciones y advertencias

- No hay pesos entrenados publicados: el repositorio contiene codigo, tokenizador y pipeline de datos, pero el modelo debe entrenarse desde cero, lo que exige un cluster de escala frontier y un corpus de 15 TB.
- El coste de entrenamiento es prohibitivo para la mayoria de equipos: el autor estima unos 40T tokens necesarios para 2,1T parametros, frente a los 15T disponibles en FineWeb.
- Solo soporta ingles, lo que limita su uso en produccion en castellano u otros idiomas.
- No se documentan fases de alineacion (RLHF, DPO) ni evaluaciones de sesgo, por lo que el riesgo de alucinacion y sesgos es desconocido hasta que se entrene y evalue.
- La licencia MIT se aplica al codigo y a los pesos que se generen, pero el uso comercial de un modelo entrenado con FineWeb (derivado de Common Crawl) puede estar sujeto a las condiciones de los datos originales.
- Los modulos de vision, imagen y audio no se convierten a GGUF; solo el nucleo de texto, lo que limita el despliegue eficiente de las capacidades multimodales.
- El modelo no ha sido validado de forma independiente; no hay benchmarks, demos ni informes de terceros.
- La fecha de creacion del repositorio (2026-11-24) y la ausencia de descargas o likes indican que se trata de una publicacion reciente y sin adopcion verificable.

## Enlaces

- Hugging Face: https://huggingface.co/MNAII/mnai-nyx-1.2
- FineWeb (dataset): https://huggingface.co/datasets/HuggingFaceFW/fineweb
- FineWeb-Edu (dataset): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- llama.cpp (conversion a GGUF): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.

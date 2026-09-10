# ibnsina-llm/ibnsina-3b-checkpoints

## Resumen

IbnSina-3b-checkpoints es el repositorio de checkpoints crudos de entrenamiento de la familia IbnSina-3B, publicados por el autor Sina Meraji bajo el identificador `ibnsina-llm`. No se trata de un paquete listo para inferencia, sino de un archivo de reproducibilidad que contiene los pesos en formato nanochat (`.pt`, pickles de tensores de PyTorch) de las fases de preentrenamiento y de ajuste supervisado (SFT). El modelo final para uso practico se distribuye por separado en `ibnsina-llm/ibnsina-3b` en formato GGUF.

El modelo subyacente tiene 2.999.144.960 parametros (aproximadamente 3,0 B) y sigue una arquitectura de estilo Qwen3: 40 capas, dimension de modelo 2560, 20 cabezas de atencion y 4 cabezas KV, con QK-norm. La longitud de contexto es de 2048 tokens y emplea un tokenizador BPE propio de 32.768 entradas (`v2_32k_llama`), compartido con IbnSina-1.5B. Los idiomas declarados son persa (fa) e ingles (en).

Su relevancia es fundamentalmente de investigacion: publica el estado del optimizador Muon/AdamW en 8 fragmentos, el tokenizador canonico exacto y los tres checkpoints de SFT (v2 publicado, v2.1h publicado y v2.1 seed2 no publicado), ademas de documentar explicitamente un fallo de reproducibilidad del recipe v2.1. El repositorio ocupa 64,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Qwen3 (40 capas, d=2560, 20 cabezas de atencion / 4 cabezas KV, QK-norm) |
| Parametros totales | 2.999.144.960 (aprox. 3,0 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF en los bundles de release; se confirma F16 en el bundle v2 (no usar F16 sobre CUDA, desborda). No se detallan otros niveles en la informacion disponible |
| Idiomas soportados | Persa (fa) e ingles (en) |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | `.pt` (pickles de tensores de PyTorch, formato nanochat) y GGUF en los bundles de release |
| Tokenizador | `v2_32k_llama`, BPE de 32.768 entradas (`tokenizer.pkl` md5 7e262b94, `token_bytes.pt`) |
| Tamano del repositorio | 64,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10T10:58:38Z |
| Fecha de actualizacion | 2026-09-10T11:10:30Z |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de estilo Qwen3 con 40 capas, dimension de modelo 2560, 20 cabezas de atencion y 4 cabezas KV (atencion con grouped-query attention), mas normalizacion sobre queries y keys (QK-norm). El modelo usa el tokenizador `v2_32k_llama` de 32.768 entradas BPE, compartido con IbnSina-1.5B. La carga de los pesos requiere nanochat con los parches de IbnSina (`training/nanochat_patches/`, variable `NANOCHAT_ARCH=qwen3`) disponibles en `github.com/ibnsina-llm`; no es cargable con transformers estandar directamente.

El preentrenamiento alcanzo el paso 190.000 con 99,6 B tokens procesados y un valor de `val bpb` de 0.4759 en el checkpoint final (`base/big3b_190000/model_190000.pt`). El estado del optimizador (Muon/AdamW) se publica en 8 fragmentos por rango, lo que permite reinicios en caliente (warm restarts). Sobre esa base se ejecutaron tres SFT: v2 (datos `sft/v2` mas un auxiliar de MMLU, 85 pasos), v2.1h (datos de v2 mas 4.499 filas sinteticas de NLI, parafrasis, formato e identidad, ejecutado en 8xH100) y v2.1 seed2 (mismos datos y recipe en una sola A100 con micro-batch 2). El segundo no reprodujo la ganancia en entailment (30,0 % frente a 39,9 %), y el autor lo conserva explicitamente como evidencia de inestabilidad del recipe v2.1.

## Capacidades

- Generacion de texto conversacional en persa e ingles, segun el tag `conversational` del repositorio.
- Ajuste por instrucciones mediante SFT sobre la base preentrenada, con tres variantes de chat disponibles.
- Clasificacion y razonamiento de tipo NLI/entailment, reforzado en la version v2.1h mediante 4.499 filas sinteticas de NLI y parafrasis.
- Seguimiento de formato, gracias a las filas sinteticas de formato incorporadas en el SFT v2.1h.
- Consistencia de identidad, mediante las filas de identidad anadidas en el mismo SFT.
- Capacidades multilingues limitadas a persa e ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Reanudacion de entrenamiento y ajuste fino desde la base: si, gracias a los checkpoints crudos y al estado del optimizador.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento: el repositorio incluye el checkpoint del paso 190.000, el tokenizador exacto y el estado del optimizador en 8 fragmentos, lo que permite reproducir o continuar la ejecucion con nanochat y `NANOCHAT_ARCH=qwen3`.
- Ajuste fino desde la base: los checkpoints `base/big3b_190000/model_190000.pt` y `optim_190000_rank{0..7}.pt` permiten reinicios en caliente con el optimizador restaurado, util para estudios de curricula o de estabilidad de recetas.
- Investigacion sobre estabilidad de SFT: los tres checkpoints de SFT (v2, v2.1h y v2.1 seed2) documentan un caso de no replicacion con distinto hardware (8xH100 frente a 1xA100, micro-batch 2), lo que sirve como material para analizar sensibilidad al batch y al paralelismo.
- Auditoria de tokenizadores BPE de 32.768 entradas: el archivo `tokenizer_TRAINING.tar.gz` contiene el tokenizador canonico con md5 verificable, util para comparar contra el `v1_32k` del piloto y evitar mezclas incorrectas.
- Desarrollo y evaluacion de asistentes conversacionales en persa: los bundles GGUF de release se pueden ejecutar con llama.cpp, Ollama o LM Studio, y el repositorio indica `ollama run ibnsina/ibnsina-3b` para el modelo publicado.
- Clasificacion y entailment en persa a baja escala: la version v2.1h reporta una ganancia en entailment (39,9 % frente a 30,0 % del seed2) que la hace candidata para tareas de inferencia textual (NLI) en ese idioma.
- Verificacion de integridad en pipelines de descarga: el archivo `MANIFEST.sha256` permite comprobar la integridad de cada fichero tras la descarga en entornos CI automatizados.
- Inferencia local en hardware de consumo: con 3,0 B de parametros y cuantizacion GGUF, el modelo cabe en GPU de consumo y en CPU, lo que habilita prototipos de chat en persa sin infraestructura dedicada.

## Benchmarks y rendimiento

La informacion disponible solo incluye metricas internas de entrenamiento y diagnosticos, no una bateria publica de benchmarks. Los datos reportados son:

| Metrica | Valor | Contexto |
|---|---|---|
| Val bpb (bits por byte) | 0.4759 | Checkpoint final de preentrenamiento, paso 190.000, 99,6 B tokens |
| Entailment (v2.1h) | 39,9 % | Run en 8xH100, pesos publicados |
| Entailment (v2.1 seed2) | 30,0 % | Run en 1xA100, micro-batch 2, no publicado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor remite a la model card de `ibnsina-llm/ibnsina-3b` y a un informe tecnico de la familia aun no publicado para los numeros de evaluacion completos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 6-7 GB solo para pesos de un modelo de 3,0 B, mas el overhead de activaciones y cache KV (estimacion a partir del recuento de parametros; no confirmada en la informacion disponible).
- VRAM estimada en GGUF con cuantizacion de 4 bits: en torno a 2-3 GB, lo que lo situa en el rango de GPU de consumo y de equipos sin GPU dedicada (estimacion, no confirmada).
- GPU recomendadas: el autor menciona H100 (8xH100 para el SFT v2.1h) y A100 (1xA100 para el run seed2). Para inferencia no se especifican GPU objetivo.
- GPU de consumo: por tamano, el modelo deberia caber en tarjetas de 8 GB o superiores con cuantizacion GGUF; no hay confirmacion explicita en la informacion disponible.
- Opciones de despliegue: llama.cpp, Ollama (`ollama run ibnsina/ibnsina-3b`) y LM Studio para los bundles GGUF; nanochat con los parches de IbnSina y `NANOCHAT_ARCH=qwen3` para los checkpoints `.pt`. Soporte de vLLM y TGI: no disponible en la informacion proporcionada.
- Advertencia de precision: el bundle v2 incluye F16 y el autor indica explicitamente que no se use F16 sobre CUDA porque desborda.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks de IbnSina-3B que permitan una comparacion directa de rendimiento. La comparacion siguiente se limita a caracteristicas publicas verificables de la categoria de modelos densos de 3-4 B; los datos de terceros corresponden a sus fichas publicas y deben verificarse en la fuente.

| Modelo | Parametros | Contexto | Licencia | Idiomas destacados | Formatos |
|---|---|---|---|---|---|
| IbnSina-3B (v2.1h) | 3,0 B | 2048 | Apache-2.0 | Persa, ingles | `.pt` (nanochat), GGUF |
| Qwen2.5-3B | aprox. 3,1 B | 32.768 (ampliable con YaRN) | Apache-2.0 | Multilingue amplio | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-3B | aprox. 3,2 B | 128.000 | Licencia comunitaria de Llama 3.2 | Multilingue (8 idiomas declarados) | safetensors, GGUF |
| IbnSina-1.5B | no disponible | no disponible | no disponible | Persa, ingles (tokenizador compartido) | no disponible |

Diferencias clave: IbnSina-3B apuesta por una ventana de contexto mucho mas corta (2048 tokens) que sus alternativas de tamano similar, y por un enfoque especifico en persa con tokenizador propio de 32.768 entradas. Frente a Qwen2.5-3B y Llama-3.2-3B, su ecosistema de herramientas es mas reducido y requiere nanochat o llama.cpp/Ollama en lugar de cargarse con transformers directamente. Su ventaja diferencial es la publicacion de checkpoints crudos y estado del optimizador, algo poco habitual en la categoria.

## Limitaciones y advertencias

- Este repositorio no contiene el paquete de inferencia: son checkpoints crudos en formato nanochat (`.pt`). Para ejecutar el modelo hay que usar `ibnsina-llm/ibnsina-3b` en GGUF.
- La carga de los `.pt` requiere nanochat con los parches de IbnSina y `NANOCHAT_ARCH=qwen3`; no es compatible con una carga estandar en transformers.
- Ventana de contexto muy corta: 2048 tokens, insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones extensas.
- Cobertura idiomatica limitada a persa e ingles; no se declaran otros idiomas.
- El autor documenta que el recipe v2.1 no es estable: el run seed2 en una A100 no reprodujo la ganancia en entailment (30,0 % frente a 39,9 %), por lo que los resultados pueden variar con hardware y tamano de lote.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; un modelo de 3,0 B con 99,6 B tokens de preentrenamiento y contexto de 2048 tokens presenta riesgo elevado en tareas de conocimiento factual.
- El bundle v2 incluye pesos F16 que desbordan en CUDA segun el propio autor; hay que evitarlos en esa plataforma.
- No mezclar el tokenizador canonico `v2_32k_llama` con el `v1_32k` del piloto: el autor lo advierte explicitamente.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 para pesos y codigo, lo que permite uso comercial sin restricciones adicionales, sujeto a las condiciones habituales de atribucion.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay informe tecnico publicado todavia; el soporte de la comunidad es minimo.
- Verificar siempre la integridad con `MANIFEST.sha256` tras la descarga, dado el tamano del repositorio (64,0 GB).

## Enlaces

- Repositorio de checkpoints en HuggingFace: https://huggingface.co/ibnsina-llm/ibnsina-3b-checkpoints
- Modelo publicado para inferencia (GGUF): https://huggingface.co/ibnsina-llm/ibnsina-3b
- Organizacion del autor en GitHub: https://github.com/ibnsina-llm
- nanochat (framework de entrenamiento base): https://github.com/karpathy/nanochat

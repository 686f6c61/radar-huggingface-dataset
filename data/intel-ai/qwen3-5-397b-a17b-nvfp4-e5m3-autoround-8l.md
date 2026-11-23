# intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-8L

## Resumen

`Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-8L` es una variante estructuralmente reducida del checkpoint NVFP4 E5M3 AutoRound de Qwen3.5-397B-A17B, publicada por Intel AI (intel-ai). No es un modelo entrenado ni destilado: es un recorte a nivel de safetensors que conserva únicamente 8 capas del modelo de lenguaje (de las 60 originales), la torre visual completa y la capa MTP, descartando el resto. Los pesos se copian tal cual del checkpoint fuente, sin reentrenamiento ni recuantización.

El modelo base Qwen3.5-397B-A17B es un Mixture-of-Experts multimodal con 397.000 millones de parámetros totales y 17.000 millones activos por token, 512 expertos enrutados por capa con 10 expertos por token, atención híbrida (lineal y completa) y una ventana de contexto de 262.144 posiciones. La versión reducida mantiene esa arquitectura pero con solo 8 capas, lo que da un total real de 61.660.767.984 parámetros según los safetensors publicados.

Su relevancia es fundamentalmente práctica: permite estudiar, depurar e integrar el pipeline de cuantización AutoRound E5M3 NVFP4 y la arquitectura Qwen3.5-MoE en un entorno manejable (38,3 GB de repo) sin necesidad de cargar el modelo completo. No obstante, al conservar solo 8 de 60 capas, la calidad generativa es muy inferior a la del modelo original y no debe usarse como sustituto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atención híbrida (lineal + completa), capa MTP y torre visual |
| Parametros totales | 61.660.767.984 (modelo reducido; el base Qwen3.5-397B-A17B tiene 397B) |
| Parametros activos | 17B en el modelo base (10 expertos de 512 por token); no disponible para la variante reducida |
| Longitud de contexto | 262.144 posiciones (max positions) |
| Tipos de cuantizacion | NVFP4 E5M3 AutoRound (4 bits, group_size 16, simétrico, activaciones 4 bits dinámicas); módulos selectos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (8 shards, 35,67 GiB / 38,30 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal. El modelo fuente tiene 60 capas de lenguaje (45 de atención lineal y 15 de atención completa), 512 expertos enrutados por capa más un experto compartido, una capa MTP (multi-token prediction) y una torre visual de 27 bloques. La variante reducida conserva 8 capas con el patrón `linear_attention, linear_attention, linear_attention, full_attention, linear_attention, linear_attention, linear_attention, full_attention`, manteniendo así dos capas de atención completa entre las ocho. Las dimensiones internas se conservan: hidden size 4096, 32 cabezas de atención, 2 cabezas KV, head dim 256, tamaño intermedio MoE 1024, vocabulario 248.320 y RoPE theta 10.000.000.

No hay entrenamiento ni ajuste en esta variante: la reducción se hace a nivel de safetensors con `reduction/make_reduced_model.py`, copiando tensor a tensor las capas 0-7 del checkpoint fuente, la capa MTP (3.097 tensores) y la torre visual (333 tensores), y reescribiendo `config.json`, el índice y `quantization_config.json`. La cuantización E5M3 AutoRound 0.16.0 es model-free y se hereda del checkpoint fuente: 13.882 módulos cuantizados a NVFP4 y 141 entradas en `extra_config` mantenidas en BF16 (router, `in_proj_a`/`in_proj_b`, capas lineales de la torre visual, `lm_head`, etc.). El formato de empaquetado es `auto_round:llm_compressor_nvfp4_e5m3` con `data_type: nvfp4_v2`, y requiere un runtime compatible con AutoRound E5M3; la carga con Transformers estándar puede no reconocer el empaquetado.

## Capacidades

- Generación de texto y razonamiento: hereda la arquitectura del modelo base, aunque con solo 8 de 60 capas la profundidad efectiva es muy limitada.
- Procesamiento multimodal: conserva la torre visual completa de 27 bloques (hidden 1152, salida 4096), por lo que puede procesar imágenes junto a texto.
- Predicción multi-token (MTP): mantiene la capa MTP y sus 3.097 tensores, útil para decodificación especulativa y experimentación con decodificación acelerada.
- Atención híbrida: combina capas de atención lineal y completa, lo que permite evaluar el comportamiento de contextos largos con atención lineal en un modelo pequeño.
- Soporte de tool calling y agentes: no disponible como capacidad verificada en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Validación del pipeline de cuantización AutoRound E5M3 NVFP4: el modelo sirve para verificar que un runtime compatible carga correctamente el empaquetado `llm_compressor_nvfp4_e5m3`, los 13.882 módulos cuantizados y las 141 entradas BF16 de `extra_config` antes de desplegar el modelo completo de 397B.
- Desarrollo y depuración de kernels de atención lineal: al conservar el patrón híbrido con capas `linear_attention` y `full_attention`, permite probar implementaciones de atención lineal y su interoperabilidad con atención completa en un checkpoint de 38 GB.
- Pruebas de la torre visual: la torre visual de 27 bloques se mantiene intacta con salida 4096, alineada con el hidden size del texto, lo que permite validar el pipeline de fusión visión-texto sin cargar el modelo completo.
- Experimentación con decodificación especulativa vía MTP: la capa MTP retenida permite probar mecanismos de predicción multi-token y medir su impacto en latencia sobre un modelo reducido.
- Integración en CI/CD de herramientas de inferencia: su tamaño manejable permite incluir el modelo en tests automáticos de vLLM, TGI u otros servidores compatibles con AutoRound, comprobando carga, tokenización (vocabulario 248.320) y generación básica.
- Investigación sobre el efecto de la profundidad en MoE: al comparar las 8 capas reducidas con el modelo de 60 capas se puede estudiar cómo escala la calidad con la profundidad manteniendo fijos los hiperparámetros de expertos y atención.
- Docencia y prototipado: un checkpoint de 38 GB con arquitectura MoE multimodal realista pero abarcable para experimentos académicos sobre enrutamiento de expertos y atención híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 38,3 GB en safetensors; en NVFP4 los pesos ocupan aproximadamente ese tamaño, por lo que se necesita al menos ~40 GB de VRAM solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con soporte de NVFP4 (Blackwell, p. ej. B200). El formato NVFP4 E5M3 requiere runtime compatible; no se garantiza funcionamiento en GPUs sin soporte de cuantización de 4 bits por hardware.
- GPU de consumo: no cabe en GPUs de consumo típicas de 24 GB (RTX 4090) por el tamaño de pesos; sería necesario un esquema de offload o una reducción adicional.
- Opciones de despliegue: se requiere un runtime compatible con AutoRound E5M3 (`auto_round:llm_compressor_nvfp4_e5m3`); la carga con Transformers estándar puede no reconocer el empaquetado. vLLM, TGI o llama.cpp no están confirmados como compatibles en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-8L | 61,66B (8 capas) | 262.144 | apache-2.0 | Hugging Face |
| intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound | 397B (60 capas) | 262.144 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-397B-A17B | 397B (17B activos) | 262.144 | apache-2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: al conservar solo 8 de 60 capas, la capacidad generativa y de razonamiento es sustancialmente inferior a la del modelo base; no es apto como sustituto en producción.
- No es un modelo entrenado: los pesos son una copia estructural del checkpoint fuente, sin ajuste para la profundidad reducida, lo que puede producir salidas incoherentes.
- Compatibilidad de runtime: el empaquetado NVFP4 E5M3 AutoRound requiere un runtime específico; Transformers estándar puede no cargarlo correctamente.
- Riesgo de alucinación: no evaluado en esta variante; en el modelo base es un riesgo conocido de los LLM, agravado aquí por la reducción de capas.
- Sesgos: no disponible información específica sobre sesgos de esta variante.
- Idiomas: no se especifican los idiomas soportados.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5-397B-A17B.
- Uso en producción: desaconsejado por la pérdida de capacidad; su valor es experimental y de validación de pipelines.

## Enlaces

- [Hugging Face: intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-8L](https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound-8L)
- [Checkpoint fuente: intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound](https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-E5M3-AutoRound)
- [Modelo base: Qwen/Qwen3.5-397B-A17B](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)

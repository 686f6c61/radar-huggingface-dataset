# kitaniai/GLM-5.3-UNCENSORED-MXFP4

## Resumen

GLM-5.3-UNCENSORED-MXFP4 es un checkpoint cuantizado de 384.675.784.704 parámetros publicado por kitaniai (Kitani) el 6 de octubre de 2026. Se trata de una recuantización FP8 → MXFP4 del modelo dealignai/GLM-5.3-UNCENSORED-FP8, que a su vez deriva de JANGQ-AI/GLM-5.3-FP8 y, en última instancia, del modelo upstream zai-org/GLM-5.3. No se ha realizado entrenamiento adicional: el tokenizador y la plantilla de chat se heredan del modelo fuente.

El modelo emplea la arquitectura `GlmMoeDsaForCausalLM` (tipo `glm_moe_dsa`), un transformer de tipo mixture-of-experts con atención dispersa, con 78 capas ocultas, tamaño oculto de 6144, 256 expertos enrutados (8 seleccionados por token) más un experto compartido, 3 capas densas iniciales y un vocabulario de 154.880 tokens. La longitud de contexto configurada es de 1.048.576 posiciones, aunque el autor advierte explícitamente de que es un metadato heredado y no una capacidad de servicio medida.

Su relevancia es doble: por un lado, reduce el almacenamiento un 43,92 % respecto al checkpoint FP8 de origen (de 755,632 GB a 423,753 GB), lo que hace manejable un modelo de esta escala en hardware AMD Instinct; por otro, es una de las primeras publicaciones que combina la receta GLM MoE DSA de AMD Quark 0.13 con el formato MXFP4. El propio autor advierte de que la combinación exacta de runtime para servir el modelo no está verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `GlmMoeDsaForCausalLM` (model type `glm_moe_dsa`), transformer MoE con atención dispersa |
| Parámetros totales | 384.675.784.704 (~384,7 mil millones) |
| Parámetros activos | no disponible (estructura: 8 de 256 expertos enrutados + 1 experto compartido por token) |
| Longitud de contexto | 1.048.576 posiciones configuradas (metadato heredado, no capacidad medida) |
| Tipos de cuantización | MXFP4 (FP4 E2M1, 2 valores por byte, una escala E8M0 por grupo de 32 pesos); activaciones MXFP4 dinámicas; tensores excluidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | glm-5.3 (`license: other`, `license_name: glm-5.3`) |
| Formato de pesos | safetensors (282 shards, 423,8 GB / 394,651 GiB) |
| Capas ocultas | 78 |
| Tamaño oculto | 6144 |
| Expertos enrutados / por token | 256 / 8 |
| Expertos compartidos | 1 |
| Capas densas iniciales | 3 |
| Tamaño de vocabulario | 154.880 |
| Elementos en precisión superior | 16.021.628.928 |
| Matrices de pesos MXFP4 | 58.596 |
| Relación de compresión vs. fuente FP8 | 1,783× (reducción del 43,92 %) |
| Modelo base | dealignai/GLM-5.3-UNCENSORED-FP8 (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atención dispersa (`glm_moe_dsa`) de 78 capas y dimensión oculta 6144. El enrutamiento sigue un esquema de mezcla de expertos con 256 expertos enrutados de los que se activan 8 por token, más un experto compartido y tres capas densas iniciales. La cuantización se aplicó con AMD Quark 0.13 sobre PyTorch 2.14.1+rocm7.2 y ROCm 7.2.53211, mediante cuantización archivo a archivo con redondeo al más cercano, sin dataset de calibración, sin GPTQ, sin AWQ y sin ajuste fino. Las matrices de expertos usan OCP MXFP4, mientras que la atención, los routers, los MLP densos iniciales, los embeddings, los tensores de normalización y la cabeza de salida permanecen en precisión superior: se trata de un checkpoint de precisión mixta, no de un modelo íntegramente a cuatro bits. La receta empleada es `LLMTemplate.get("glm_moe_dsa").get_config(scheme="mxfp4")`, con `*eh_proj` excluido adicionalmente para preservar en BF16 la proyección auxiliar MTP. Los pesos FP8 lineales excluidos se recuperan a BF16 y los tensores excluidos que ya eran de coma flotante conservan su dtype original.

No hubo entrenamiento adicional y el proceso es una recuantización FP8 → MXFP4: los pesos FP8 de origen se desquantizan con sus escalas de bloque originales antes de la conversión a MXFP4, por lo que el resultado no recupera precisión ya perdida en el checkpoint FP8. La conversión se completó en 7,89 minutos de cómputo (excluyendo descarga, validación y subida) sobre una única GPU dentro de un nodo con 8× AMD Instinct MI355X, siguiendo la ruta de recuperación FP8 para un solo dispositivo de Quark.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla heredada del modelo fuente.
- Razonamiento multietapa y resolución de tareas complejas, heredados del modelo base GLM-5.3 y de su variante sin censura.
- Generación de código y tareas de ingeniería de software: no hay resultados publicados específicos para este export.
- Capacidades multilingües: no disponible (el autor no declara lista de idiomas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.
- El checkpoint conserva una proyección auxiliar MTP (`*eh_proj`) en BF16, lo que sugiere soporte para decodificación especulativa multi-token en el modelo de origen, aunque no se documenta su funcionamiento en este export.
- Comportamiento "uncensored": el nombre del modelo fuente indica que se ha reducido el rechazo de peticiones respecto al modelo upstream; no se documenta la técnica empleada.

## Casos de uso

- Servicio de inferencia conversacional a gran escala sobre AMD Instinct: el checkpoint está pensado para desplegarse con vLLM sobre ROCm en hardware Instinct, lo que permite ofrecer una API de chat con un modelo de 384,7 mil millones de parámetros ocupando menos de la mitad del espacio del checkpoint FP8 original.
- Procesamiento de documentos largos: con 1.048.576 posiciones configuradas, el modelo puede abordar análisis de repositorios completos, expedientes o corpus extensos en una sola ventana, siempre que el runtime y la memoria disponible lo permitan (capacidad no medida por el autor).
- Generación y revisión de código en pipelines internos: la familia GLM-5.3 está orientada a tareas de programación; este export puede integrarse como backend de asistentes de código autohospedados, sujeto a la verificación previa del runtime.
- Investigación sobre cuantización: al incluir `quantization_stats.json`, `sample_validation.json` y `artifact_manifest.json` con hashes SHA-256 por shard, sirve como caso de estudio reproducible de recuantización FP8 → MXFP4 con Quark.
- Aplicaciones que requieren menor filtrado de contenido: el linaje "uncensored" lo hace adecuado para investigación sobre seguridad, red teaming y análisis de comportamiento de modelos desalineados, en entornos controlados.
- Base para cuantizaciones posteriores: al ser un checkpoint en safetensors de precisión mixta, puede servir como punto de partida para generar versiones GGUF u otros formatos, aunque no se documenta ninguna conversión de este tipo.
- Evaluación comparativa de precisión: la RMSE relativa de 0,111689 medida sobre 64 matrices permite estudiar la degradación introducida por la cuantización MXFP4 frente a la fuente FP8, aunque la muestra no es aleatoria ni exhaustiva.
- Despliegue con caché KV larga en entornos con HBM abundante: en nodos con varias MI355X, el ahorro de 331,88 GB respecto al FP8 libera memoria para caché KV y lotes grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la inferencia de extremo a extremo, la perplejidad, la precisión en tareas downstream, los tokens por segundo y el consumo de VRAM en runtime **no** se han medido para este export, y que las puntuaciones de benchmarks del modelo upstream no son resultados de esta cuantización.

La única métrica de calidad publicada es la validación de reconstrucción de pesos:

| Métrica de validación | Valor |
|---|---|
| Matrices muestreadas | 64 |
| Elementos de peso comprobados | 4.980.736 |
| RMSE relativa vs. fuente FP8 recuperada | 0,111689 |
| RMSE absoluta vs. fuente FP8 recuperada | 0,00184817 |
| Método de muestreo | primeras 16 filas de nombres de matriz equiespaciados (no aleatorio ni exhaustivo) |

## Requisitos de hardware

- Peso de los pesos MXFP4: 423,753 GB (394,651 GiB) en disco y, en memoria, esa misma cifra más el overhead del runtime y la caché KV. No es una estimación: es el tamaño real del repositorio.
- Hardware de referencia del autor: nodo con 8× AMD Instinct MI355X (288 GB de HBM3E por GPU, ~2,3 TB agregados). La conversión se realizó en una sola GPU de ese nodo.
- Estimación de VRAM mínima para inferencia: a partir del tamaño del checkpoint, se necesitan al menos ~400 GB de memoria agregada solo para los pesos, más la caché KV y activaciones; el autor no publica cifras de consumo en runtime.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) no pueden alojar el checkpoint ni siquiera en su totalidad.
- GPU de centro de datos: 4× H100 80 GB (320 GB) resultan insuficientes para los pesos; harían falta al menos 6× H100 80 GB (480 GB) o 8× A100 80 GB, sin margen documentado para caché KV. Estas cifras son una estimación derivada del tamaño del checkpoint, no un dato medido.
- Opciones de despliegue: la ruta prevista es vLLM con ROCm y soporte de AMD Quark en hardware AMD Instinct. Se requiere un runtime que soporte simultáneamente `glm_moe_dsa` y MXFP4 de Quark; el autor advierte de que una instalación genérica de Transformers o un runtime que solo soporte MXFP4 de GPT-OSS no bastan como evidencia de compatibilidad. Compatibilidad con llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles; no medidos para este export.

## Comparativa con modelos similares

Todos los datos de la tabla proceden de la cadena de procedencia documentada en la model card. Las comparaciones con otras familias de modelos de la misma categoría no están disponibles en la información proporcionada.

| Modelo | Parámetros | Precisión | Tamaño de safetensors | Contexto | Licencia |
|---|---|---|---|---|---|
| kitaniai/GLM-5.3-UNCENSORED-MXFP4 (este) | 384.675.784.704 | MXFP4 mixto (4,25 bits/peso con escalas) | 423,753 GB | 1.048.576 configurados | glm-5.3 |
| dealignai/GLM-5.3-UNCENSORED-FP8 (fuente inmediata) | no disponible (idéntico por herencia) | FP8 | 755,632 GB | no disponible | no disponible |
| JANGQ-AI/GLM-5.3-FP8 (base de la fuente) | no disponible | FP8 | no disponible | no disponible | no disponible |
| zai-org/GLM-5.3 (upstream) | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias medibles respecto a la fuente inmediata: reducción de tamaño del 43,92 %, factor de compresión 1,783×, y paso de 753.329.940.480 elementos de tensor (excluyendo escalas FP8) a 737.308.311.552 elementos de peso MXFP4, con 16.021.628.928 elementos conservados en precisión superior.

## Limitaciones y advertencias

- Pérdida de precisión acumulada: la recuantización parte de un checkpoint FP8 ya cuantizado, por lo que no recupera la precisión perdida en el paso previo. La RMSE relativa de 0,111689 medida sobre una muestra no aleatoria de 64 matrices es orientativa, no una garantía de calidad global.
- Ausencia total de evaluación funcional: no hay perplejidad, resultados downstream, tokens por segundo ni consumo de VRAM medidos. Cualquier despliegue en producción requiere una evaluación propia previa.
- Compatibilidad de runtime no verificada: el autor señala explícitamente que la combinación exacta de extremo a extremo para servir el modelo sigue sin verificar. Se necesita soporte simultáneo de `glm_moe_dsa` y MXFP4 de Quark.
- Contexto no medido: las 1.048.576 posiciones son un metadato de configuración heredado; el contexto real depende del runtime, la caché KV, el tamaño de lote y el hardware.
- Idiomas: el autor no declara lista de idiomas soportados; no hay información sobre cobertura multilingüe ni sobre el rendimiento en castellano.
- Contenido "uncensored": el linaje del modelo indica una reducción deliberada de los mecanismos de rechazo. Esto incrementa el riesgo de generar contenido dañino, ilegal o inexacto, y exige salvaguardas adicionales si se expone a usuarios finales.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones de fidelidad factual para este export.
- Sesgos: no disponible; no se han publicado análisis de sesgo para este export.
- Licencia: `glm-5.3` con etiqueta `license: other`. Las condiciones exactas de uso comercial no están detalladas en la model card y deben consultarse en el fichero LICENSE del repositorio antes de cualquier uso productivo.
- Trazabilidad: el repositorio tiene 0 descargas y 1 "like" en el momento de la consulta, lo que supone una validación comunitaria prácticamente nula del artefacto.
- Integridad verificable: el autor publica hashes SHA-256 por shard en `artifact_manifest.json`, lo que permite comprobar la integridad de la descarga (423,8 GB en 282 shards).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4
- Modelo base inmediato: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8
- Revisión exacta del modelo fuente: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/tree/12170112d07e50d7dbe8e5ca1691f4fd8c1179e1
- Base de la fuente: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Modelo upstream: https://huggingface.co/zai-org/GLM-5.3
- Licencia: https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4/blob/main/LICENSE
- Inferencia alojada del autor: https://kitani.ai
- Estadísticas de cuantización: https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4/blob/main/quantization_stats.json
- Manifiesto de artefactos (tamaños y SHA-256 por shard): https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4/blob/main/artifact_manifest.json
- Validación por muestra: https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4/blob/main/sample_validation.json
- Detalles de conversión y entorno: https://huggingface.co/kitaniai/GLM-5.3-UNCENSORED-MXFP4/blob/main/conversion.json
- Soporte de Quark en vLLM: https://docs.vllm.ai/en/latest/features/quantization/quark/
- Cuantización archivo a archivo de AMD Quark: https://quark.docs.amd.com/latest/pytorch/file2file_quantization.html
- Comando de descarga: `hf download kitaniai/GLM-5.3-UNCENSORED-MXFP4 --local-dir ./GLM-5.3-UNCENSORED-MXFP4`

# ProCreations/Ternary-Bonsai-2-27B-DFlash2

## Resumen

Ternary-Bonsai-2-27B-DFlash2 es un modelo borrador (draft) de decodificación especulativa publicado por ProCreations. No es un modelo de chat autónomo ni un checkpoint estándar de `AutoModel` de Transformers: es un cabezal DFlash2 de 1.924.404.480 parámetros, adaptado del cabezal original de Qwen 3.8 27B DFlash2 (z-lab) al objetivo congelado Ternary Bonsai 2 27B PQ2_0 (prism-ml), que se descarga por separado y no se modifica.

El modelo resuelve un problema muy concreto: acelerar la decodificación del objetivo Bonsai 2 27B sin tocar sus pesos, proponiendo hasta 5 tokens borrador por paso que el modelo objetivo verifica. En una RTX PRO 6000 Blackwell de 96 GB alcanza 179,2 tokens/s de decodificación en el protocolo fijo de seis prompts, frente a 138,4 tokens/s sin especulación (1,295x) y 172,6 tokens/s del cabezal Qwen DFlash2 original sobre el mismo objetivo (1,038x).

El repositorio (6,0 GB) incluye el checkpoint BF16 adaptado, el borrador GGUF Q8_0, un runtime CUDA nativo parcheado basado en el soporte DFlash2 de llama.cpp, instantáneas exactas del código fuente, la receta de entrenamiento y las mediciones en bruto. La licencia es Apache 2.0 y se trata de una adaptación experimental independiente, no de un lanzamiento oficial de Prism, Qwen ni z-lab.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabezal borrador DFlash2 para decodificación especulativa, derivado del transformer de la familia Qwen3 (cabezal Qwen 3.8 27B DFlash2) |
| Parámetros totales | 1.924.404.480 (datos de safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en la configuración de prueba medida; la ventana efectiva la determina el modelo objetivo |
| Tipos de cuantización | BF16 (checkpoint adaptado) y GGUF Q8_0 (borrador). El objetivo usa cuantización ternaria PQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es un cabezal borrador de decodificación especulativa DFlash2, no un generador independiente. Se parte del cabezal donante `z-lab/Qwen3.8-27B-DFlash2` (verificado byte a byte contra la revisión `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`) y se adapta a las características nativas congeladas del objetivo Bonsai 2 27B. La adaptación consume características de las post-capas 5, 19, 33, 47 y 61 del objetivo congelado. El entrenamiento consistió en 896 actualizaciones AdamW (dos épocas, tasa de aprendizaje 5e-6) sobre 304 secuencias de entrenamiento y 40 retenidas para validación; 48 secuencias generadas reciben un peso 4x. La longitud aceptada por el selector greedy en el conjunto retenido mejoró de 2,2984 a 2,6359, incluido el ancla.

La innovación técnica relevante es la integración del soporte DFlash2 nativo procedente del PR 27342 de llama.cpp junto con un parche de integración de la rotación de Bonsai, empaquetado como binario nativo. El borrador usa como máximo 5 tokens borrador por paso. La paridad numérica declarada frente a la referencia BF16 en PyTorch supera 0,99978 de similitud coseno en estados ocultos y 0,99991 de coincidencia de logits en el bloque comprobado, con 8 de 8 tokens argmax coincidentes; el autor indica explícitamente que esto acredita la integración de un bloque, no una identidad global. No se mencionan RLHF ni DPO en la información disponible.

## Capacidades

- Decodificación especulativa sobre el objetivo Ternary Bonsai 2 27B PQ2_0, con hasta 5 tokens borrador por paso verificado.
- Servicio de API compatible con OpenAI en `http://127.0.0.1:8080/v1` con alias de modelo `bonsai2-dflash2`.
- Razonamiento en modo medio por defecto, con `--reasoning-budget -1` (sin límite de tokens de pensamiento) como configuración de referencia.
- Generación de texto, código, SQL, prosa, geometría y salidas estructuradas: estas capacidades pertenecen al modelo objetivo, ya que el borrador solo propone tokens que el objetivo valida.
- Soporte de visión opcional mediante el `mmproj` del objetivo (`Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf`, activado con `python download-target.py --vision`).
- Tool calling de extremo a extremo: el runtime empaquetado superó una prueba nativa de visión a llamada de herramienta (cuadrados rojo, verde y azul, en orden).
- Capacidades multilingües: no disponible.
- No es un modelo de chat autónomo ni un checkpoint estándar de `AutoModel` de Transformers.

## Casos de uso

- Servicio local de baja latencia sobre Bonsai 2 27B: desplegar el binario nativo incluido y servir la API compatible con OpenAI en un único slot con contexto de 32.768 tokens, reduciendo el tiempo por token en torno al 23 % respecto a la decodificación sin especulación.
- Sustitución del cabezal Qwen DFlash2 original en un despliegue ya existente de Bonsai: al adaptarse al objetivo congelado, aporta 1,038x de velocidad adicional (172,6 a 179,2 tokens/s) manteniendo el mismo objetivo y el mismo protocolo de prueba.
- Asistentes de código y autocompletado en IDE: el prompt de código es el que más se beneficia (219,7 a 231,5 tokens/s, 1,054x), lo que resulta adecuado para completados de baja latencia en flujos de edición interactiva.
- Aceleración de cargas con mucho token de razonamiento: en el prompt de razonamiento la mejora es de 1,034x (216,1 a 223,3 tokens/s) con el presupuesto de razonamiento sin límite, útil en pipelines de análisis que generan cadenas de pensamiento largas.
- Pipelines de agentes con visión y tool calling: el `mmproj` opcional y la prueba visión-a-herramienta permiten construir agentes que interpretan imágenes y encadenan llamadas a funciones sobre el endpoint local.
- Reducción de coste por GPU en inferencia de un solo slot: al no requerir modificar el objetivo, se puede mantener la misma huella de memoria del modelo principal y obtener más tokens por segundo en la misma tarjeta.
- Reproducción de benchmarks internos: el repositorio incluye `reports/comparison-results.json`, `reports/training-validation.json` y `reports/numerical-parity-best.json` junto con `SHA256SUMS`, lo que permite verificar hashes y repetir las mediciones.

## Benchmarks y rendimiento

Mediciones de velocidad de decodificación declaradas por el autor sobre el mismo objetivo Bonsai y el mismo runtime nativo:

| Configuración | Tokens/s de decodificación | Relativo a la base |
|---|---:|---:|
| Sin borrador | 138,4 | 1,000x |
| Qwen DFlash2 original, Q8 | 172,6 | 1,248x |
| DFlash2 adaptado a Bonsai, Q8 | 179,2 | 1,295x |

Desglose por prompt (Qwen DFlash2 original Q8 frente a DFlash2 adaptado Q8):

| Prompt | Original Q8 | Adaptado Q8 | Ratio |
|---|---:|---:|---:|
| Código | 219,7 | 231,5 | 1,054x |
| Geometría | 148,5 | 156,7 | 1,055x |
| Prosa | 116,6 | 120,6 | 1,034x |
| Razonamiento | 216,1 | 223,3 | 1,034x |
| SQL | 182,1 | 188,2 | 1,034x |
| Estructurado | 209,5 | 212,7 | 1,015x |

Condiciones declaradas: una RTX PRO 6000 Blackwell de 96 GB, dos repeticiones, 1.536 tokens generados por petición, razonamiento medio sin límite de tokens de pensamiento, temperatura 1, top-p 0,95, top-k 20, min-p 0, contexto 32.768 y un slot. El rendimiento incluye tokens de razonamiento y se calcula como tokens generados totales dividido entre tiempo total de generación. Los prompts de publicación se excluyeron del entrenamiento y de la selección de longitud de borrador, que se hizo sobre cuatro prompts de desarrollo. Para comparar, el modelo Bonsai MTP midió 171,7 tokens/s con dos tokens borrador en el mismo protocolo, con un build de runtime distinto. El autor advierte que son mediciones de velocidad de prefijo finito y contexto corto, no puntuaciones de corrección. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- GPU de referencia probada: una RTX PRO 6000 Blackwell de 96 GB (SM120), en Linux con CUDA 13.3.
- Huella del borrador: aproximadamente 2,0 GB en GGUF Q8_0 y 3,8 GB en BF16 (estimación aritmética a partir de 1,924 B de parámetros y del ancho de bits de cada formato, no una medición publicada).
- El modelo objetivo Bonsai 2 27B PQ2_0 se descarga aparte y añade su propia huella de memoria, no cuantificada en la información disponible.
- Otras GPU y plataformas deben compilar desde el código fuente incluido; no hay mediciones publicadas fuera de SM120.
- No hay datos publicados sobre ejecución en GPU de consumo. Por número de parámetros, el borrador aislado sería pequeño para tarjetas de 24 GB, pero el sistema completo requiere el objetivo y un runtime recompilado.
- Despliegue: binario nativo llama.cpp parcheado incluido (`runtime/llama-bonsai-dflash2-linux-cuda13.3-sm120.tar.gz`) con servidor compatible con OpenAI. Soporte en vLLM, TGI, Ollama u otros: no disponible.
- Throughput medido: 179,2 tokens/s de decodificación agregada en el protocolo de seis prompts. Latencia por token no publicada de forma desagregada.
- Variables de configuración: `BONSAI_MODEL` para un objetivo PQ2_0 existente, `MMPROJ` para visión, y `PORT`, `CONTEXT`, `DRAFT_TOKENS` y `LLAMA_BIN_DIR` para sobrescribir valores por defecto.

## Comparativa con modelos similares

| Modelo | Rol | Parámetros | Tokens/s | Tokens borrador | Runtime |
|---|---|---:|---:|---:|---|
| DFlash2 adaptado a Bonsai (este) | Borrador | 1,924 B | 179,2 | 5 | Nativo incluido |
| Qwen DFlash2 original (`z-lab/Qwen3.8-27B-DFlash2`) | Borrador | no disponible | 172,6 | 5 | Nativo |
| Bonsai MTP (`ProCreations/Ternary-Bonsai-2-27B-MTP`) | Borrador | no disponible | 171,7 | 2 | Build distinto |
| Bonsai 2 27B sin especulación | Objetivo | 27 B (PQ2_0) | 138,4 | No aplica | Nativo |

Todos los valores corresponden al mismo protocolo de seis prompts y al mismo objetivo Bonsai. Los tres borradores comparten licencia Apache 2.0 según la información disponible. La comparación se limita a velocidad declarada por el autor; no hay datos comparativos de calidad ni de parámetros para los borradores alternativos.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo Ternary Bonsai 2 27B PQ2_0 no genera nada. Tampoco carga como `AutoModel` estándar de Transformers.
- Las cifras de velocidad son mediciones de prefijo finito y contexto corto; no son puntuaciones de corrección ni garantías de calidad amplias.
- Las secuencias muestreadas pueden diferir incluso con semillas fijas, según advierte el propio autor.
- La longitud de 5 tokens borrador se seleccionó sobre cuatro prompts de desarrollo; el beneficio varía por prompt y va de 1,015x a 1,055x.
- La paridad numérica acreditada cubre un único bloque de integración, no la identidad global del modelo.
- En las comprobaciones objetivas, 12 de 12 pasan con normalización de cadenas equivalentes, pero solo 10 de 12 con igualdad estricta de tipos JSON.
- Idiomas soportados: no declarado en la información disponible.
- El runtime solo se ha probado en Linux con CUDA 13.3 y SM120 (RTX PRO 6000); en otras GPU hay que compilar y no hay validación publicada.
- Licencia Apache 2.0 para los modelos originales, pero el runtime nativo y el código de SpecForge conservan sus propias licencias, que hay que revisar antes de uso comercial.
- Es una adaptación experimental e independiente de ProCreations, no un lanzamiento oficial de Prism, Qwen ni z-lab.
- Validación comunitaria mínima: 0 descargas y 1 me gusta en el momento de la consulta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
- Modelo objetivo: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabezal donante: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo Bonsai MTP citado en la comparación: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Informe de comparación de velocidad: `reports/comparison-results.json` (dentro del repositorio)
- Validación del entrenamiento: `reports/training-validation.json` (dentro del repositorio)
- Paridad numérica: `reports/numerical-parity-best.json` (dentro del repositorio)
- Evaluación de calidad: `reports/quality-assessment.json` (dentro del repositorio)
- Prueba de humo de visión a herramienta: `reports/portable-vision-tool-smoke.json` (dentro del repositorio)
- Receta de entrenamiento: `TRAINING.md` (dentro del repositorio)
- Hashes y revisión del objetivo: `manifest.json` (dentro del repositorio)
- Soporte DFlash2 nativo upstream: PR 27342 de llama.cpp

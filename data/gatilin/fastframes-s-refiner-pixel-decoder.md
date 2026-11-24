# gatilin/fastframes-s-refiner-pixel-decoder

## Resumen

Este repositorio no contiene un modelo generativo completo, sino un extracto de dos subcomponentes del modelo de generación de vídeo **FastFrames-S** de Apple: la red de refinamiento de KV cache (`kv_refiner.safetensors`) y el decodificador de píxeles (`pixel_decoder.safetensors`). Lo publica el usuario `gatilin` bajo una licencia de investigación no comercial (Apple AMLR) y está pensado para quien necesite reutilizar o auditar estos pesos de forma aislada, sin arrastrar el resto del pipeline.

El modelo base, `apple/FastFrames-S`, es un generador de vídeo texto-a-vídeo basado en un esquema de *Causal Forcing++* de dos pasos con caché KV, que emplea el codificador de texto y el tokenizador de Wan. Los pesos aquí incluidos corresponden a la revisión `aa099efcedf1b65447106bf9004cde75821f7387` del repositorio original y se copiaron sin modificar desde el espejo oficial de ModelScope, verificándose su SHA-256 contra los LFS de Hugging Face.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, sin *pipeline* declarado y sin idiomas especificados. No genera vídeo por sí solo; requiere el generador Causal Forcing++ congelado, el codificador de texto de Wan y su tokenizador, además del código oficial incluido en `fastframes/`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de refinamiento de KV cache + decodificador de píxeles (componentes de un generador de vídeo Causal Forcing++ de dos pasos) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente float32/float16 según el checkpoint original) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), uso limitado a investigación no comercial |
| Formato de pesos | safetensors (`kv_refiner.safetensors`, `pixel_decoder.safetensors`) |

Detalles adicionales verificables:

| Componente | Tensores | SHA-256 |
|---|---|---|
| `kv_refiner.safetensors` | 66 | `b4f36d00effd78a60435526dcc2b1a0e6bbed0f09621ee8ab4019460769a7bbb` |
| `pixel_decoder.safetensors` | 31 | `815682581f6376d2cdacc60568facf1bd979112091e4157fb6c00ae946b89b32` |

Tamaño del repositorio: 0.9 GB. Código oficial incluido en `fastframes/`, fijado en el commit `a65c59240e01cf1de86197fa771ca09b38cf592a`.

## Arquitectura y entrenamiento

El modelo base `apple/FastFrames-S` emplea un esquema de generación de vídeo denominado *Causal Forcing++* de dos pasos, que combina un generador con caché KV y un decodificador de píxeles. Los dos componentes aquí publicados son: (1) una red de refinamiento que opera sobre la caché KV (66 tensores) y (2) un decodificador de píxeles (31 tensores) que transforma latentes en fotogramas RGB. No se dispone de información sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron etapas de RLHF o DPO.

La validación incluida en `validation.json` es deliberadamente mínima: se realizaron *forwards* estrictos en CPU y float32 de ambos componentes. Con una rejilla latente sintética de 2×2 se obtuvieron cuatro fotogramas RGB de 32×32, y con una caché KV sintética de 30 capas se obtuvieron claves y valores reparados finitos. El propio autor advierte que estas pruebas son de cableado y no validan el generador, el pipeline completo de vídeo, la calidad de salida real ni la paridad numérica con la GPU de origen.

## Capacidades

- Refinamiento de caché KV: la red `kv_refiner` procesa una caché KV de entrada y produce claves y valores reparados (validado con una caché sintética de 30 capas).
- Decodificación de latentes a píxeles: `pixel_decoder` convierte una rejilla latente en fotogramas RGB (validado con una rejilla 2×2 que produce cuatro fotogramas de 32×32).
- Integración en un pipeline de generación de vídeo texto-a-vídeo, siempre que se aporten el generador Causal Forcing++ congelado, el codificador de texto de Wan y el tokenizador.
- No soporta *tool calling* ni *function calling* de forma nativa.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; dependen del codificador de texto de Wan, no de estos pesos.
- No incluye modo *thinking*, visión ni audio.

## Casos de uso

- **Investigación sobre decodificadores de vídeo**: el `pixel_decoder` puede estudiarse de forma aislada para analizar cómo se transforman latentes en fotogramas RGB, sin necesidad de cargar el generador completo. Adecuado por su tamaño reducido (31 tensores) y su licencia de investigación.
- **Auditoría y verificación de pesos**: los SHA-256 publicados permiten comprobar la integridad de los ficheros frente al repositorio original de Apple. Útil en entornos que exigen trazabilidad de artefactos.
- **Reproducción de experimentos académicos**: combinando estos pesos con el generador Causal Forcing++ y el codificador de Wan se puede reconstruir el pipeline original para replicar resultados publicados, siempre dentro del marco no comercial de la licencia AMLR.
- **Sustitución o *fine-tuning* del refinador KV**: al estar aislado, el `kv_refiner` puede servir como punto de partida para experimentos que modifiquen la política de refinamiento de caché sin tocar el resto del modelo.
- **Pruebas de integración en pipelines propios**: el código incluido en `fastframes/` (fijado a un commit concreto) permite validar el cableado de los componentes en un entorno controlado antes de escalar a GPU.
- **Docencia sobre generación de vídeo causal**: los componentes son lo bastante pequeños (0.9 GB en total) para ilustrar en un curso cómo se estructura un generador de vídeo con caché KV y decodificador de píxeles, sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada son pruebas de cableado sintéticas en CPU con float32 (rejilla latente 2×2 → cuatro fotogramas de 32×32; caché KV sintética de 30 capas → claves y valores finitos). No hay datos de calidad de vídeo, FVD, CLIP score ni paridad numérica con GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para los componentes aislados; el pipeline completo requiere el generador Causal Forcing++ y el codificador de Wan, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; los componentes aislados (0.9 GB) caben en cualquier GPU moderna, pero el pipeline completo no está caracterizado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el autor remite al código oficial de `ml-fastframes` y a su guía de instalación para las dependencias del generador y de Wan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (extractos de componentes de generación de vídeo con refinador KV y decodificador de píxeles publicados de forma aislada).

## Limitaciones y advertencias

- **No es un modelo autónomo**: estos pesos no generan vídeo a partir de un prompt por sí solos; requieren el generador Causal Forcing++ congelado, el codificador de texto de Wan y el tokenizador.
- **Licencia restrictiva**: la Apple AMLR limita el uso y la distribución a fines de investigación no comercial. El código de Apple incluido se rige por `LICENSE-CODE`, y el código derivado de Wan conserva avisos Apache-2.0 recogidos en `ACKNOWLEDGEMENTS`.
- **Validación insuficiente**: las pruebas documentadas son de cableado sintético; no se ha verificado la calidad de salida, el pipeline completo ni la paridad numérica con la GPU de origen.
- **Sesgos**: no disponibles; al depender del codificador de texto de Wan y del generador original, heredaría los sesgos de estos, no documentados aquí.
- **Riesgo de alucinación**: no evaluado para estos componentes; aplicable al pipeline completo, no caracterizado.
- **Idiomas**: no especificados; dependen del codificador de texto de Wan.
- **Contexto**: longitud de contexto no disponible.
- **Madurez**: repositorio con 0 descargas y 0 *likes*, sin *pipeline* declarado, lo que sugiere un artefacto de investigación sin adopción comunitaria verificable.
- **Trazabilidad**: los pesos se copiaron desde el espejo de ModelScope y se verificaron contra los LFS de Hugging Face, pero la reproducibilidad depende de la revisión `aa099efcedf1b65447106bf9004cde75821f7387` del repositorio original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gatilin/fastframes-s-refiner-pixel-decoder
- Modelo base: https://huggingface.co/apple/FastFrames-S
- Licencia del modelo base: https://huggingface.co/apple/FastFrames-S/blob/main/LICENSE
- Guía de instalación del checkpoint oficial: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/installation.md
- Repositorio de código oficial: https://github.com/apple-aiml-research/ml-fastframes

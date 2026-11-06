# arpanpathak/staleynet-checkpoints

## Resumen

StaleyNET es un generador de musica condicionado por texto desarrollado por Arpan Pathak, entrenado desde inicializacion aleatoria en Rust sobre GPUs NVIDIA de borde (Jetson AGX Thor). El proyecto implementa de forma completa la pila: el transformer, el cuantizador vectorial residual (RVQ), el vocoder Griffin-Lim y los kernels de GPU, todo dentro del repositorio del autor. Este repositorio de Hugging Face aloja unicamente los checkpoints de pesos, no el codigo de inferencia.

El modelo es deliberadamente pequeno: 7.099.904 parametros para las ejecuciones solo-texto y 7.165.440 para las condicionadas por letra, con una variante mayor de 42.858.496 parametros (`pq-large`) todavia en entrenamiento. Trabaja sobre tokens de audio derivados de 128 bandas mel a 24 kHz y genera mediante un vocoder Griffin-Lim, una eleccion clasica que evita dependencias de redes neuronales adicionales para la sintesis.

Su relevancia es mas experimental y educativa que competitiva: demuestra que es viable entrenar un pipeline completo de texto-a-musica en Rust con kernels propios sobre hardware de borde, y publica checkpoints intermedios, metricas y evaluaciones de cada ejecucion. No esta pensado como sustituto de sistemas de generacion musical a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con cuantizador vectorial residual (RVQ) y vocoder Griffin-Lim |
| Parametros totales | 7.099.904 (solo texto); 7.165.440 (letras); 42.858.496 (`pq-large`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens (`pq-large`: 1152) |
| Tipos de cuantizacion | no disponible (pesos almacenados en f32) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY-SA 4.0, sujeta a los terminos de los datasets de origen |
| Formato de pesos | `tensors.bin` (f32 little-endian) + `model.json` con el manifiesto |

Detalles adicionales de configuracion: anchura 256, 8 cabezas de atencion, 6 capas (`pq-large`: anchura 512, 8 capas). Tokens de audio: 4 codebooks residuales de 1024 entradas (`pq-large`: 4 grupos de banda x 4 niveles = 16 codebooks de 1024 entradas). Caracteristicas de audio: 128 bandas mel a 24 kHz, FFT 1024, hop 256.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de pequena escala que predice tokens de audio discretos. La senal de audio se tokeniza con un RVQ de 4 codebooks de 1024 entradas sobre 128 bandas mel a 24 kHz (FFT 1024, hop 256). La variante `pq-large` emplea un tokenizador distinto, el "band-group tokenizer", que divide las 128 bandas mel en 4 grupos y cuantiza cada grupo con 4 niveles residuales, resultando en 16 codebooks. La sintesis final se realiza con un vocoder Griffin-Lim implementado en el propio proyecto, sin redes neuronales adicionales.

Los datos de entrenamiento son el Song Describer Dataset y JamendoLyrics MultiLang. El numero de pistas varia por ejecucion: 667 pistas en las ejecuciones base, 281 en las filtradas por voz, 543 en las condicionadas por letra (73 con letra) y 742 en `pq-large` (75 con letra). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. El proyecto incluye 9 ejecuciones con checkpoints, algunas con estado del optimizador AdamW (`latest/`) y otras solo con pesos (`best/`), ademas de metricas completas en `metrics/` y evaluaciones pareadas de letra en `evaluations/`.

## Capacidades

- Generacion de musica a partir de prompts de texto en ingles.
- Generacion condicionada por letra (ejecuciones `lyrics-orin`, `lyrics-thor`, `lyrics-thor-long`).
- Modelo especifico filtrado por voz (`vocal-scratch`, `vocal-finetune`).
- Tokenizacion y sintesis de audio integradas en el propio proyecto (RVQ + Griffin-Lim).
- Inferencia en hardware de borde NVIDIA (Jetson AGX Thor) con kernels CUDA propios.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en generacion musical de bajo coste: el modelo permite experimentar con pipelines completos de texto-a-musica en hardware de borde, con checkpoints y metricas publicados para reproducir cada ejecucion.
- Docencia y aprendizaje de arquitecturas RVQ: el codigo y el libro asociado explican cada etapa del pipeline (tokenizacion, transformer, vocoder), lo que lo hace util para cursos de generacion de audio.
- Prototipado de sistemas de acompanamiento musical condicionado por descripcion textual: util para validar interfaces de prompt-a-musica antes de invertir en modelos mayores.
- Generacion de fragmentos musicales condicionados por letra: las ejecuciones `lyrics-thor` permiten explorar la relacion entre letra y audio en un entorno controlado.
- Pruebas de sintesis Griffin-Lim en produccion de audio: sirve como referencia para comparar calidad de vocoders clasicos frente a neuronales en un contexto reproducible.
- Benchmarking de kernels CUDA en Rust: el proyecto incluye kernels propios y permite medir rendimiento en Jetson AGX Thor, util para evaluar el ecosistema `cuda-oxide`.
- Filtrado y generacion de voces: las ejecuciones `vocal-scratch` y `vocal-finetune` permiten estudiar el efecto del filtrado por voz en la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion de `pq-large`: 5,135 nats por token en el paso 7.000, promediada sobre 16 codebooks de un tokenizador distinto, por lo que no es comparable con las ejecuciones de 4 codebooks. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni metricas objetivas de calidad musical (FAD, CLAP score, etc.).

## Requisitos de hardware

- VRAM estimada: el modelo de 7,1 M de parametros en f32 ocupa aproximadamente 28 MB de pesos; el de 42,9 M ocupa unos 171 MB. La VRAM adicional depende del vocoder Griffin-Lim y de los buffers de audio.
- GPU recomendadas: el proyecto se entrena y evalua en NVIDIA Jetson AGX Thor (128 GB). Cualquier GPU NVIDIA con soporte CUDA es suficiente por memoria; el cuello de botella es la cadena de herramientas `cuda-oxide`.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna puede alojar los pesos; la limitacion real es la disponibilidad de los kernels CUDA en Rust.
- Opciones de despliegue: el proyecto usa `cargo oxide build -- --release` y el binario `staleynet sing` con `--cache` y `--run`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es propietario (`tensors.bin` + `model.json`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| StaleyNET (este) | 7,1 M / 7,2 M / 42,9 M | 768 / 1152 tokens | CC BY-SA 4.0 | Checkpoints en HF, codigo en GitHub |
| MusicGen (Meta) | 300 M - 3,3 B | no disponible | Codigo MIT, pesos CC BY-NC 4.0 | Pesos en HF |
| AudioLDM 2 | no disponible | no disponible | CC BY-NC-SA 4.0 | Pesos en HF |
| Riffusion | no disponible | no disponible | no disponible | Pesos en HF |

La comparativa es orientativa: StaleyNET es orders de magnitud mas pequeno que MusicGen o AudioLDM 2 y no se han publicado metricas objetivas que permitan una comparacion cuantitativa de calidad. Su interes radica en la implementacion completa en Rust y en el entrenamiento en hardware de borde, no en la competitividad de la salida musical.

## Limitaciones y advertencias

- Modelo de muy pequena escala (7 M de parametros): la calidad musical esperable es limitada y experimental.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Entrenado con datasets pequenos (667 pistas base, 543 en las ejecuciones con letra), lo que aumenta el riesgo de sobreajuste y de reproducir material de entrenamiento.
- Riesgo de alucinacion y de generar audio incoherente con el prompt, especialmente en prompts fuera de la distribucion de entrenamiento.
- La licencia CC BY-SA 4.0 obliga a compartir las obras derivadas bajo la misma licencia; ademas, esta sujeta a los terminos de los datasets de origen (Song Describer Dataset y JamendoLyrics MultiLang), que pueden imponer restricciones adicionales al uso comercial.
- El formato de pesos es propietario (`tensors.bin` f32 little-endian + `model.json`), sin soporte documentado en herramientas estandar de inferencia.
- `pq-large` esta en entrenamiento (paso 7.000 de 20.000) y sus archivos se reemplazaran; no debe usarse en produccion.
- La inferencia requiere la cadena de herramientas `cuda-oxide` y hardware NVIDIA; no hay ruta documentada para CPU.
- No se documentan evaluaciones subjetivas de calidad musical ni comparaciones con sistemas establecidos.

## Enlaces

- Hugging Face: <https://huggingface.co/arpanpathak/staleynet-checkpoints>
- Repositorio GitHub: <https://github.com/arpanpathak/staleynet>
- Paper (preprint PDF): <https://github.com/arpanpathak/staleynet/blob/main/paper/preprint.pdf>
- Libro (mdBook): <https://github.com/arpanpathak/staleynet/tree/main/book/src>
- Release v0.1.2: <https://github.com/arpanpathak/staleynet/releases/tag/v0.1.2>
- Crate `staleynet-audio` en crates.io: <https://crates.io/crates/staleynet-audio>
- Dataset: <https://huggingface.co/datasets/arpanpathak/staleynet-data>

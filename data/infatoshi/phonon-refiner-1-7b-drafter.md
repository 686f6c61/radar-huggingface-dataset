# Infatoshi/phonon-refiner-1.7b-drafter

## Resumen

Phonon refiner 1.7B DFlash2 drafter es un modelo auxiliar de decodificación especulativa (speculative decoding) desarrollado por Infatoshi. No es un modelo generativo autónomo, sino un "drafter" (borrador) diseñado para acelerar la inferencia del modelo Phonon refiner 1.7B, un corrector de transcripciones del proyecto Phonon. El drafter predice los siguientes 7 tokens en una sola pasada, que el modelo principal verifica después en un único forward pass, reduciendo la latencia sin alterar la salida final.

El modelo emplea una arquitectura DFlash2, una extensión propia de Infatoshi sobre el block drafting de DFlash. Consta de 3 capas transformer con anchura de FFN de 4096, tamaño oculto de 2048 (heredado del refiner), 32 cabezas de atención de 64 dimensiones con 8 cabezas KV, y se condiciona sobre las entradas de capa de 5 de las 24 capas del refiner. Dispone de un vocabulario de borrador de 16k tokens extraído de los 128k del refiner.

Su relevancia radica en la ganancia medible de velocidad: en el motor de Phonon sobre un M4 Max, 300 peticiones sintéticas cortas pasaron de 110 ms de mediana a 77 ms, y 580 dictados reales de 120-133 ms de mediana con 6,0 tokens aceptados por pasada. El modelo se distribuye en formato GGUF cuantizado Q8_0 y requiere un parche específico de llama.cpp o el motor nativo de Phonon para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (block drafting sobre transformer, 3 capas) |
| Parametros totales | 233.914.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (`phonon-refiner-1.7b-dflash2-drafter.gguf`, 257.073.856 bytes, md5 `e8cf3293bd35be5e3d573d5a43a9256f`) |

## Arquitectura y entrenamiento

DFlash2 es la extensión de Infatoshi sobre el block drafting de DFlash. El drafter cuenta con 3 capas transformer, FFN de anchura 4096, tamaño oculto de 2048 (el mismo del refiner), 32 cabezas de atención de 64 dimensiones con 8 cabezas KV, y se condiciona sobre las entradas de capa del refiner provenientes de 5 de sus 24 capas. Utiliza un vocabulario de borrador de 16k tokens muestreado del vocabulario de 128k del refiner: un token fuera de ese subconjunto nunca se propone como borrador, lo que reduce velocidad pero no altera la salida. Genera 7 tokens por paso (un bloque de 8 incluyendo el último token verificado).

El entrenamiento utiliza como objetivo la propia salida greedy del refiner, de modo que el drafter aprende a predecir exactamente ese modelo. Los datos de entrenamiento combinan los 78.056 prompts públicos de entrenamiento del refiner (transcripciones Parakeet de audio público de YouTube, filas de reparación de términos y negativos difíciles) con 90.000 filas derivadas de conversaciones ShareGPT (ShareGPT_V3_unfiltered_cleaned_split, Apache-2.0), convertidas en texto tipo dictado con ruido de reconocimiento sintético y líneas de vocabulario. El drafter parte de un drafter público entrenado de la misma forma contra LFM3-1.7B estándar y se afina durante 1 época sobre estas 167.056 filas. Se usó SpecForge (MIT) para los módulos y el objetivo de borrador. No se emplearon dictados personales ni conjuntos de evaluación, y una comprobación de fuga contra todos los conjuntos de evaluación no encontró solapamiento.

## Capacidades

- Predicción especulativa de tokens: genera 7 tokens candidatos por paso para que el refiner los verifique en un único forward pass.
- Verificación greedy: con verificación greedy, la salida coincide con la del refiner en solitario, salvo cuando dos tokens están dentro del ruido de coma flotante, porque la comprobación por lotes redondea de forma distinta a la decodificación token a token.
- Fidelidad medida: en el motor de Phonon (M4 Max), 300 de 300 filas sintéticas (dos ejecuciones) y 579 de 580 dictados reales coincidieron con la decodificación sin drafter.
- Aceleración de inferencia: 5,36 tokens aceptados por forward del refiner en 300 filas derivadas de ShareGPT y 6,12 en 300 filas públicas de YouTube (greedy, 7 tokens borrador, CUDA, batch 1).
- Especialización en corrección de transcripciones: entrenado sobre prompts de reparación de términos y dictados con ruido sintético.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso de forma nativa: es exclusivamente un acelerador de decodificación para el refiner.

## Casos de uso

- Aceleración de corrección de transcripciones en producción: integrado en el motor de Phonon, reduce la latencia mediana de 110 ms a 77 ms en peticiones cortas y de 401-404 ms a 373-393 ms en el p90 de dictados reales, manteniendo la salida idéntica al refiner.
- Dictado en tiempo real en aplicaciones de escritorio: con 580 dictados reales procesados en 120-133 ms de mediana en un M4 Max, permite corrección de transcripciones con latencia interactiva en hardware de consumo Apple Silicon.
- Reparación de términos técnicos en pipelines ASR: el drafter está entrenado sobre filas de reparación de términos del refiner, por lo que acelera la corrección de vocabulario especializado en transcripciones automáticas.
- Despliegue local con llama.cpp parcheado: mediante `--spec-type draft-dflash -md <archivo> --spec-draft-n-max 7` con el parche `phonon-engine.patch`, permite aprovechar la decodificación especulativa en entornos que ya usan llama.cpp.
- Servicio de corrección por lotes: con 6,0-6,12 tokens aceptados por pasada en filas públicas, adecuado para procesar grandes volúmenes de transcripciones donde la latencia por lote importa más que la latencia interactiva.
- Investigación en decodificación especulativa: sirve como referencia reproducible de DFlash2 y de los objetivos de entrenamiento de SpecForge, con métricas de aceptación por posición de borrador (0,90, 0,84, 0,78, 0,72, 0,66, 0,61, 0,56).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tokens aceptados por forward (300 filas ShareGPT) | 5,36 |
| Tokens aceptados por forward (300 filas YouTube) | 6,12 |
| Drafter base alineado a LFM3-1.7B (mismas filas) | 4,88 y 5,55 |
| Ganancia de alineación | +0,48 [+0,41, +0,56] y +0,57 [+0,51, +0,63] (bootstrap pareado 95%) |
| Aceptación por posición de borrador | 0,90, 0,84, 0,78, 0,72, 0,66, 0,61, 0,56 |
| 300 peticiones sintéticas cortas (media 15 tokens salida, M4 Max, Q4_K_S del refiner, prefix cache) | 77 ms mediana / 112 ms p90 con drafter; 110 / 145 ms sin drafter |
| 580 dictados reales (media 81 tokens salida) | 120-133 ms mediana / 373-393 ms p90; 6,0 tokens por pasada |
| Drafter base alineado a LFM3-1.7B en los mismos dictados | 5,3 tokens por pasada y 401-404 ms p90 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q8_0 ocupa 257.073.856 bytes (aproximadamente 245 MiB), por lo que la huella del drafter es mínima; debe sumarse la del refiner 1.7B que se ejecuta en paralelo.
- GPU recomendadas: no se especifican en la información disponible. Las mediciones publicadas se realizaron en un Apple M4 Max (motor de Phonon) y en CUDA (batch 1) para las métricas de aceptación.
- GPU de consumo: el tamaño del drafter (233,9 M de parámetros, ~245 MiB en Q8_0) permite ejecutarlo en cualquier GPU de consumo; el requisito real lo impone el refiner 1.7B acompañante.
- Opciones de despliegue: motor nativo de Phonon (`pe`, tipo de drafter `dflash2n`, código en `engine/` del repositorio de Phonon) y llama.cpp con el parche de Phonon (`third_party/llama.cpp/phonon-engine.patch`, `--spec-type draft-dflash -md <archivo> --spec-draft-n-max 7`). llama.cpp estándar no lo carga.
- Latencia y throughput: 77 ms mediana y 112 ms p90 en peticiones sintéticas cortas; 120-133 ms mediana y 373-393 ms p90 en dictados reales de 81 tokens de salida, con 5,0-6,0 tokens aceptados por pasada del refiner.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Infatoshi/phonon-refiner-1.7b-drafter | 233,9 M | no disponible | 5,36-6,12 tokens aceptados/pasada | LFM Open License v1.0 | Hugging Face (GGUF) |
| Drafter base alineado a LFM3-1.7B | no disponible | no disponible | 4,88-5,55 tokens aceptados/pasada | no disponible | no disponible |
| DFlash (z-lab) | no disponible | no disponible | no disponible | no disponible | GitHub (z-lab/dflash) |

No se dispone de datos suficientes para comparar con otros drafters de la misma categoría en parámetros, contexto o licencia.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo funciona como drafter de Phonon refiner 1.7B; no produce respuestas útiles por sí mismo.
- Requiere software específico: llama.cpp estándar no carga el archivo; es necesario el motor nativo de Phonon o el parche `phonon-engine.patch`.
- Idioma: únicamente inglés (`en`); no se ha validado para otros idiomas.
- Licencia restrictiva: LFM Open License v1.0 permite uso comercial solo a organizaciones con ingresos anuales inferiores a 10 millones de dólares estadounidenses; debe consultarse el archivo `NOTICE`.
- Fidelidad no absoluta: la salida puede diferir del refiner cuando dos tokens están dentro del ruido de coma flotante, por el redondeo distinto de la verificación por lotes.
- Vocabulario limitado: el vocabulario de borrador de 16k tokens excluye tokens del refiner, lo que reduce la velocidad de aceptación en dominios con vocabulario fuera de ese subconjunto.
- Sin datos de sesgos ni de alucinación: la información disponible no incluye evaluaciones de sesgo, robustez o alucinación; al heredar el comportamiento del refiner, cualquier sesgo de este se traslada.
- Duplicidad de artefactos: el mismo archivo se distribuye dentro del repositorio del refiner; no es necesario descargar ambos.

## Enlaces

- Hugging Face: https://huggingface.co/Infatoshi/phonon-refiner-1.7b-drafter
- Modelo base (refiner): https://huggingface.co/Infatoshi/phonon-refiner-1.7b
- Repositorio Phonon: https://github.com/Infatoshi/phonon
- DFlash (z-lab): https://github.com/z-lab/dflash
- SpecForge (sgl-project): https://github.com/sgl-project/SpecForge
- Dataset ShareGPT_V3_unfiltered_cleaned_split: no disponible (enlace no incluido en la información proporcionada)

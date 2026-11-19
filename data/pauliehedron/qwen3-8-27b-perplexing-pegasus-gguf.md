# Pauliehedron/Qwen3.8-27B-Perplexing-Pegasus-GGUF

## Resumen

Pauliehedron/Qwen3.8-27B-Perplexing-Pegasus-GGUF es un conjunto de cuantizaciones GGUF del merge "Perplexing-Pegasus" de Qwen 3.8 27B, publicado por el usuario Pauliehedron. El modelo base es Qwen/Qwen3.8-27B (Apache-2.0), y el merge procede de AveLabs/Qwen3.8-27B-Perplexing-Pegasus-GGUF. El repositorio empaqueta cinco "rungs" (niveles) de cuantización con una estructura de contenedor uniforme —866 tensores, 65 bloques, 360 tensores F32 pequeños y una cabeza MTP en Q8_0— de modo que las distintas cuantizaciones solo difieren en el formato de cuantización y pueden compararse de forma directa.

El modelo tiene 27.320.697.856 parámetros totales (según safetensors del modelo base) y está pensado para inferencia local con llama.cpp. El repositorio ocupa 91,0 GB e incluye calibración mediante importance matrix (imatrix) para cada nivel de cuantización. Los idiomas declarados son inglés y chino.

Su relevancia es práctica: ofrece una curva de referencia de calidad (KLD frente a los logits f16 de la familia) para elegir el nivel de cuantización adecuado según el compromiso entre tamaño y fidelidad, algo útil para desarrolladores que despliegan modelos de ~27B en hardware de consumo o en estaciones de trabajo con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.8 27B; incluye cabeza MTP en Q8_0, bloque blk.64) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la evaluacion KLD se hizo con n_ctx 8192) |
| Tipos de cuantizacion | IQ4_NL, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors/BF16 |

## Arquitectura y entrenamiento

El modelo es una cuantizacion GGUF del merge Perplexing-Pegasus, derivado de Qwen 3.8 27B. El contenedor es uniforme entre niveles: 866 tensores, 65 bloques, 360 tensores F32 pequeños (normas, rope, frecuencias) y una cabeza MTP en Q8_0 (blk.64, 8 tensores) identica en todos los niveles. El cuerpo principal varia por nivel: IQ4_NL e IQ4_XS usan 433 tensores del tipo correspondiente mas cola Q5_K (64) y Q6_K (1); Q4_K_M usa Q4_K (433) mas Q6_K (65); Q5_K_M usa Q5_K (433) mas Q6_K (65); Q6_K usa Q6_K (498).

El proceso de construccion descrito es: partir de los shards BF16 de AveLabs/Qwen3.8-27B-Perplexing-Pegasus-GGUF, convertir a GGUF f16 con convert_hf_to_gguf.py, generar la importance matrix con llama-imatrix y cuantizar con llama-quantize --imatrix para cada nivel. El bin de calibracion imatrix es numerico y no contiene texto fuente; el corpus de calibracion no se redistribuye, por lo que una rederivacion byte-exacta requiere ese corpus. No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion, RLHF/DPO).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multi-turno, heredados del modelo base Qwen 3.8 27B.
- Capacidades multilingues limitadas a ingles y chino segun la model card.
- Compatibilidad con endpoints (tag endpoints_compatible) y con llama.cpp.
- Cabeza MTP (multi-token prediction) en Q8_0, presente en el contenedor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en estacion de trabajo: usar el nivel Q4_K_M o Q5_K_M con llama.cpp para ejecutar un modelo de 27B en un equipo con memoria unificada amplia (el autor lo probo en un M1 Max de 64 GB), equilibrando calidad y velocidad.
- Seleccion de cuantizacion basada en datos: emplear la curva KLD publicada (Q6_K 0,009171; Q5_K_M 0,021354; Q4_K_M 0,043857; IQ4_NL 0,054082; IQ4_XS 0,055525) para decidir que nivel cumple el umbral de fidelidad exigido antes de desplegar.
- Evaluacion comparativa de merges: al compartir contenedor uniforme, permite comparar de forma controlada el merge Pegasus frente a las builds vanilla de Qwen 3.8 27B de Pauliehedron en la misma forma de cuantizacion.
- Generacion de texto en ingles y chino: adecuado para asistentes conversacionales o resumen de documentos en esos dos idiomas, con la ventana de contexto que soporte el modelo base.
- Prototipado de pipelines de inferencia: integracion en servidores compatibles con endpoints y llama.cpp para pruebas de latencia y throughput antes de pasar a produccion.
- Investigacion sobre cuantizacion: uso del repositorio como referencia reproducible de imatrix y KLD para estudiar el impacto de IQ4_NL, IQ4_XS, Q4_K_M, Q5_K_M y Q6_K en un modelo de 27B.

## Benchmarks y rendimiento

Resultados publicados por el autor. KLD calculado con llama-perplexity --kl-divergence sobre wiki.test.raw (WikiText wikitext-2-raw-v1, split test), n_ctx 8192, 8 chunks, referencia = logits f16 de la familia (AveLabs BF16).

| Quant | KLD (media ± σ) |
|---|---|
| IQ4_NL | 0,054082 ± 0,004097 |
| Q4_K_M | 0,043857 ± 0,003303 |
| Q5_K_M | 0,021354 ± 0,002800 |
| IQ4_XS | 0,055525 ± 0,004106 |
| Q6_K | 0,009171 ± 0,001557 |

JevBench (muestra publica JEV), precision systemone, base de 260 celdas, route-a/b @ed50fe0 perm-a (gmlx wire). Las filas de 30B corresponden a la ejecucion completa @8K del 2026-10-24.

| Familia / nivel | systemone acc |
|---|---|
| Pegasus IQ4_NL (este repo) | 0,7654 |
| Pauliehedron Qwen3.8-27B meter (IQ4_NL) | 0,7538 |
| granite-switch-4.1-30b Q4_K_M / Q6_K / Q3_K_M | 0,7269 / 0,7231 / 0,7000 |
| granite-switch-4.1-8b Q6_K / IQ4_NL / Q4_K_M | 0,6885 / 0,6615 / 0,6538 |

Las celdas JevBench de los niveles restantes de Pegasus estan en progreso. Las mediciones de velocidad tambien estan en progreso; el autor indica que las pruebas se hicieron en un M1 Studio (Apple M1 Max, GPU de 32 nucleos, 64 GB de memoria unificada) con llama.cpp y gmlx, y que los resultados varian segun hardware, profundidad de contexto y carga del servidor.

## Requisitos de hardware

- VRAM/memoria estimada: no disponible de forma explicita; el repositorio ocupa 91,0 GB e incluye los cinco niveles. Para un unico nivel, el tamano de archivo concreto no se detalla en la informacion proporcionada.
- Hardware probado por el autor: Apple M1 Max con 64 GB de memoria unificada (M1 Studio).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; por el tamano del modelo (27,3B parametros), los niveles de 4 bits requeririan del orden de 15-20 GB solo para pesos, pero no se aporta medicion oficial.
- Opciones de despliegue: llama.cpp (herramienta usada para construir y medir) y gmlx (asher/gmlx); tag endpoints_compatible sugiere servidores compatibles con endpoints.
- Latencia y throughput: no disponible; el autor indica que las mediciones de velocidad estan en progreso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pegasus IQ4_NL (este repo) | 27,3B | no disponible | Apache-2.0 | GGUF | JevBench systemone 0,7654 |
| Pauliehedron Qwen3.8-27B meter (IQ4_NL) | 27,3B (base) | no disponible | Apache-2.0 | GGUF | JevBench systemone 0,7538 |
| granite-switch-4.1-30b (Q4_K_M) | 30B (clase) | no disponible | no disponible | GGUF | JevBench systemone 0,7269 |
| granite-switch-4.1-8b (Q6_K) | 8B (clase) | no disponible | no disponible | GGUF | JevBench systemone 0,6885 |

## Limitaciones y advertencias

- Es una cuantizacion de un merge de terceros, no el modelo oficial Qwen 3.8 27B; el autor advierte que las builds vanilla de Pauliehedron son la referencia y Pegasus es una variante.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- Los datos de KLD y JevBench son mediciones locales del autor en un unico host (M1 Max); no son comparables directamente con otras configuraciones de hardware o contexto.
- Las mediciones de velocidad y las celdas JevBench de varios niveles estan en progreso; la informacion de rendimiento esta incompleta.
- La rederivacion byte-exacta de las cuantizaciones requiere el corpus de calibracion, que no se redistribuye.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben asumirse los del modelo base Qwen 3.8 27B.
- Licencia Apache-2.0 permite uso comercial con atribucion; es obligatorio distribuir una copia de la licencia con las obras derivadas (incluida en el repo como LICENSE).
- El corpus de evaluacion (Salesforce/WikiText) tiene sus propios terminos y no se redistribuye en el repositorio.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Pauliehedron/Qwen3.8-27B-Perplexing-Pegasus-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Merge de origen: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- gmlx: https://github.com/asher/gmlx
- Dataset de evaluacion (WikiText): https://huggingface.co/datasets/Salesforce/wikitext

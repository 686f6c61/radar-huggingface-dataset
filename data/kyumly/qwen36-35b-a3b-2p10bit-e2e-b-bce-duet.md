# kyumly/qwen36-35b-a3b-2p10bit-e2e-b-bce-duet

## Resumen

El modelo `kyumly/qwen36-35b-a3b-2p10bit-e2e-b-bce-duet` es un checkpoint de Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal de tipo image-text-to-text, sometido a un proceso de entrenamiento consciente de la cuantizacion (QAT) denominado DUET. Parte del modelo post-entrenamiento cuantizado a 2,10 bits `mrminjae/qwen36-35b-a3b-2p10bit-e2e-b-bce-lowbit` y afina unicamente los codigos de los expertos enrutados, manteniendo intactos el ancho de bit y el diseno de ficheros del modelo base.

La relevancia de esta publicacion radica en que demuestra que es posible recuperar parte del rendimiento perdido por una cuantizacion extremadamente agresiva (2,10 bits por peso de experto enrutado) mediante un ajuste fino de bajo coste: solo se movieron el 0,0375 % de los codigos (12,1 millones de 32,2 mil millones) y el entrenamiento consistio en 56 pasos sobre 225 filas de calibracion. El resultado son mejoras medibles en LiveCodeBench v6, AIME25, AIME26 y GPQA-Diamond respecto al checkpoint PTQ de partida.

El checkpoint esta pensado para investigadores y desarrolladores que necesiten desplegar un MoE de gran tamano en hardware limitado y que esten dispuestos a asumir la complejidad de un cargador personalizado de bajo bit. No es un modelo listo para produccion sin trabajo de integracion: requiere un loader especifico de MoE de bajo bit y la regla de desquantizacion documentada en `manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) multimodal image-text-to-text; familia `qwen3_5_moe` |
| Parametros totales | 35B (denominacion del modelo base Qwen3.6-35B-A3B); 32,2B en codigos de expertos enrutados segun la model card |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,10 bits por peso de experto enrutado (K entre 3 y 16 niveles por experto); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors: `layer_XX.safetensors` (codigos empaquetados de bajo bit) y `nonexpert.safetensors` (BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal de la familia `qwen3_5_moe`, con atencion, experto compartido, router, embeddings y `lm_head` en BF16 y congelados. Los expertos enrutados se almacenan como codigos empaquetados de bajo bit, con un numero variable de niveles K por experto (de 3 a 16) y un codebook propio, lo que da una media de 2,10 bits por peso de experto. La desquantizacion sigue la regla documentada en `manifest.json`: `gate_up = bf16(mu[r] + alpha[r] * cb[q])` y `down = bf16((mu[r] + alpha[r] * cb[q]) * gamma)`, con tablas por fila (`lut[r, q]`) en los expertos que las usan.

El entrenamiento emplea DUET, un metodo QAT sin pesos maestros que actualiza los codigos con momentos al estilo Adam (m en 8 bits, v de rango 1) y movimientos estocasticos de un nivel con probabilidad `lr * |u| / Δ`, donde Δ es la separacion real al siguiente nivel. Se entrenaron los codigos de los expertos enrutados, los offsets y escalas de fila `mu` y `alpha` mediante LSQ (K = 2) y los pesos de RMSNorm; quedaron congelados los recuentos de niveles, los codebooks, la atencion, el experto compartido, el router, los embeddings y `lm_head`. Los datos fueron el conjunto de calibracion genans: 225 filas, 305 K tokens de respuesta, 10 filas reservadas. El esquema fue 1 epoca, 56 pasos, batch global 4, lr de codigos 5e-7 constante, lr de norma/escala 2e-6 con coseno y 3 % de warm-up, y clipping AdaGC por capa y proyeccion (λ 1.02). La perdida en held-out bajo de 0,2790 a 0,2443.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking activable (las evaluaciones se hicieron con `thinking on`).
- Generacion de codigo, evaluada con LiveCodeBench v6 mediante el grader oficial `lcb_runner` (pass@1).
- Razonamiento matematico competitivo, evaluado con AIME25 y AIME26.
- Razonamiento cientifico de nivel avanzado, evaluado con GPQA-Diamond.
- Procesamiento multimodal image-text-to-text segun el pipeline declarado en Hugging Face.
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de tecnicas QAT de bajo bit: el checkpoint sirve como referencia reproducible para comparar el impacto de DUET frente al PTQ de partida sobre un mismo modelo base, con la receta de entrenamiento y los hiperparametros documentados.
- Despliegue de un MoE de 35B en hardware con VRAM limitada: al almacenar los expertos enrutados a 2,10 bits, el repositorio ocupa 14,7 GB, lo que permite cargar el modelo en GPUs donde un checkpoint BF16 completo no cabria; requiere el loader personalizado de bajo bit.
- Generacion de codigo asistida en pipelines internos: con un 74,05 % de acierto en LiveCodeBench v6 y respuestas mas cortas que el PTQ (26.936 frente a 30.493 tokens de media), es adecuado para tareas de completado y resolucion de problemas donde el coste por token importa.
- Razonamiento matematico y cientifico en entornos de investigacion: los resultados en AIME25 (84,44 %), AIME26 (93,33 %) y GPQA-Diamond (77,10 %) lo hacen util para experimentos que necesiten un modelo de razonamiento con huella de memoria reducida.
- Investigacion sobre decodificacion en modo thinking: la reduccion de respuestas truncadas al limite de 61.440 tokens (del 12,2 % al 8,7 % en LiveCodeBench) lo convierte en un banco de pruebas para estudiar la relacion entre cuantizacion y longitud de razonamiento.
- Prototipado multimodal image-text-to-text: el pipeline declarado permite experimentar con entradas de imagen y texto, aunque la informacion disponible no detalla la resolucion ni el formato de imagen soportado.
- Fine-tuning posterior sobre codigos de experto: la receta DUET, con solo 56 pasos y 225 filas de calibracion, es replicable para adaptar el modelo a dominios concretos con un coste computacional muy bajo.

## Benchmarks y rendimiento

Evaluacion con vLLM, thinking on, temperatura 0,7, top-p 0,8, top-k 20, min-p 0, presence penalty 1,5, maximo 61.440 tokens nuevos, 3 muestras por pregunta, semilla 0. Una respuesta que no cierra `</think>` dentro del limite cuenta como incorrecta. LiveCodeBench v6 usa los problemas del 2025-02-01 al 2025-05-01 (131 problemas) con el grader oficial `lcb_runner` (pass@1).

| Modelo | LiveCodeBench v6 Acc (%) | Tokens | AIME25 Acc (%) | Tokens | AIME26 Acc (%) | Tokens | GPQA-Diamond Acc (%) | Tokens |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2.10-bit E2E-B-BCE (PTQ) | 69,47 ± 0,00 | 30.493 | 77,78 ± 5,09 | 32.494 | 86,67 ± 6,67 | 30.821 | 75,59 ± 1,05 | 14.337 |
| 2.10-bit E2E-B-BCE + DUET (este modelo) | 74,05 ± 2,75 | 26.936 | 84,44 ± 1,92 | 28.821 | 93,33 ± 3,33 | 26.748 | 77,10 ± 1,54 | 7.031 |

Comparacion emparejada por pregunta: +4,6 puntos en LiveCodeBench (2,4 errores estandar), +6,7 en AIME25 (1,7 SE), +6,7 en AIME26 (1,8 SE) y +1,5 en GPQA-Diamond (0,9 SE).

| Metrica | LiveCodeBench v6 | AIME25 | AIME26 | GPQA-Diamond |
|---|---:|---:|---:|---:|
| Respuestas truncadas PTQ → DUET | 12,2 → 8,7 % | 17,8 → 13,3 % | 10,0 → 3,3 % | 3,7 → 0,5 % |
| Precision en respuestas completas PTQ → DUET | 79,13 → 81,06 | 94,59 → 97,44 | 96,30 → 96,55 | 78,50 → 77,50 |

El autor advierte que estos numeros no son comparables con los de la model card del modelo base, que usa limites mas largos (100.000 y 70.000 tokens), una parada por repeticion en GPQA-Diamond y prompts distintos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 14,7 GB, pero la carga requiere el loader personalizado de bajo bit y ademas se mantienen en BF16 la atencion, el experto compartido, el router, los embeddings y `lm_head`.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamano del repositorio (14,7 GB) sugiere que podria caber en GPUs de consumo con 24 GB o mas, pero no se confirma.
- Opciones de despliegue: las evaluaciones se realizaron con vLLM. La carga requiere un cargador especifico de MoE de bajo bit; no se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se reporta la longitud media de respuesta por benchmark (entre 7.031 y 28.821 tokens segun la tarea).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LiveCodeBench v6 | AIME25 | GPQA-Diamond | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo (2,10-bit DUET) | 35B (MoE) | no disponible | 74,05 % | 84,44 % | 77,10 % | no disponible | Hugging Face |
| Qwen3.6-35B-A3B 2,10-bit PTQ (base) | 35B (MoE) | no disponible | 69,47 % | 77,78 % | 75,59 % | no disponible | Hugging Face |
| Qwen3.6-35B-A3B (BF16 original) | 35B (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `kyumly/qwen36-35b-a3b-2p10bit-duet` | 35B (MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La informacion proporcionada no incluye resultados de benchmarks del modelo base en BF16 ni del checkpoint DUET que parte del build genans, por lo que la comparacion cuantitativa con alternativas de la misma categoria queda limitada a la pareja PTQ/DUET.

## Limitaciones y advertencias

- Requiere un cargador personalizado de MoE de bajo bit; no es cargable con `transformers` estandar sin implementar la regla de desquantizacion de `manifest.json`.
- La licencia no esta especificada en la informacion disponible y remite a la del modelo base, sin concretarla; verificar antes de cualquier uso comercial.
- El conjunto de entrenamiento es muy reducido (225 filas, 305 K tokens, 10 reservadas) y el autor declara que no hay conjunto de evaluacion propio; el riesgo de sobreajuste al conjunto de calibracion no puede descartarse.
- Los benchmarks se obtuvieron con un limite de 61.440 tokens y una configuracion de muestreo concreta; los resultados no son directamente comparables con los de la model card del modelo base.
- Persiste un porcentaje relevante de respuestas truncadas en tareas de razonamiento largo (8,7 % en LiveCodeBench, 13,3 % en AIME25).
- En GPQA-Diamond, la precision sobre respuestas completas baja ligeramente (78,50 → 77,50) pese a la mejora global, atribuible a la reduccion de longitud de respuesta.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican las advertencias habituales de un modelo de 2,10 bits en expertos.
- Cobertura de idiomas: no disponible; no se puede confirmar el soporte de castellano.
- Longitud de contexto: no disponible; condiciona el diseno de aplicaciones multi-turno o con documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-e2e-b-bce-duet
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint PTQ de partida: https://huggingface.co/mrminjae/qwen36-35b-a3b-2p10bit-e2e-b-bce-lowbit
- Checkpoint DUET con receta equivalente (build genans): https://huggingface.co/kyumly/qwen36-35b-a3b-2p10bit-duet

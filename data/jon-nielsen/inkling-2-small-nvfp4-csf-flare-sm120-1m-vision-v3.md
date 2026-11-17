# Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v3

## Resumen

Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v3 es un paquete de pesos cuantizados y preparado para el motor de inferencia FLARE, derivado del checkpoint base `thinkingmachines/Inkling-2-Small`. Lo publica el usuario Jon-Nielsen y no se trata de un modelo entrenado desde cero, sino de una conversión de precisión mixta (NVFP4 en expertos, MXFP8 en proyecciones densas, FP8 en la cabeza Markov) empaquetada junto con el binario del runner y un plan de ejecución fijado para cuatro GPU Blackwell SM120 en un solo host.

El objetivo es servir el modelo con un contexto de 1.048.576 tokens, 8 peticiones concurrentes, chunks de prefill de 8192 tokens y decodificación especulativa MTP-7 con anchuras adaptativas {1,8}, además de codificador de visión. La propuesta de valor es reducir el coste en memoria y aumentar el throughput manteniendo la distribución de salida del modelo original: la verificación de tokens se hace en el modelo objetivo a su precisión, y las cabezas cuantizadas solo afectan a qué tokens se proponen y con qué frecuencia se aceptan.

El paquete es muy específico de un entorno (TP4 sobre RTX PRO 6000 Blackwell, FlashInfer con parches propios, runner Rust con hash fijado) y su licencia Lil License 1.0 condiciona el uso comercial. El repo ocupa 345,6 GB y declara 50.615.414 parámetros en safetensors, un dato que conviene tratar con cautela porque no cuadra con un modelo de contexto de un millón de tokens y cabezas de vocabulario cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atención con sesgo relativo y colas paginadas (b12x), decodificación especulativa MTP, codificador de visión con parches de 20 píxeles y fusión 2x2 |
| Parametros totales | 50.615.414 según safetensors del repo (dato no coherente con el contexto y el tamaño del paquete; no verificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (expertos y cabeza de vocabulario propuesta), MXFP8 E4M3 con escala potencia de dos por 32 columnas (proyecciones densas en carga), FP8 E4M3 con escala FP32 por fila (cabeza Markov), KV cache E4M3 empaquetada con página 128 |
| Idiomas soportados | no disponible |
| Licencia | Lil License 1.0 (`lil-license-1.0`, license_name `other`) |
| Formato de pesos | safetensors (payloads con bytes del runner embebidos) |

## Arquitectura y entrenamiento

El paquete no documenta el entrenamiento del modelo base; toda la información disponible describe la preparación para inferencia. La arquitectura es un transformer MoE con atención de sesgo relativo y colas paginadas, selección de activación de expertos y un codificador de visión que trabaja con parches de 20 píxeles, fusión 2x2, hasta 4 imágenes por petición y 4 peticiones concurrentes. La decodificación usa MTP-7 (7 tokens borrador, filas adaptativas 64, presupuesto de grafo 64, keepers de anchura 1) con anchuras adaptativas {1,8}.

La conversión de precisión es la innovación central: las proyecciones densas pasan de BF16 a MXFP8 (E4M3 con escala potencia de dos por cada 32 columnas) en el momento de la carga; routers, convoluciones, normalizaciones, expertos y codificador de visión conservan la precisión del checkpoint; la cabeza de vocabulario propuesta se almacena en NVFP4 y la cabeza de corrección Markov en FP8 E4M3 con una escala FP32 por fila del vocabulario. La verificación objetivo mantiene su propia precisión, de modo que las cabezas cuantizadas cambian la propuesta y la tasa de aceptación, no la distribución de salida. Según la documentación del motor, los pesos almacenados difieren del checkpoint en ~2,7 % de norma relativa, con una concordancia de referencia de 65,6 % frente a 65,8 % en precisión de siguiente token y 97,3 % de concordancia en token más probable. Los expertos usan NVFP4 estático con escalas del checkpoint, con A4 en prefill y A16 en decode-verify; la KV cache es E4M3 empaquetada con extensión de 155.740 tokens por contexto (~20 KiB/token).

## Capacidades

- Generación de texto con contexto extremadamente largo: hasta 1.048.576 tokens por petición, con chunks de prefill de 8192 tokens.
- Procesamiento de visión: hasta 4 imágenes por petición y 4 peticiones concurrentes, con parches de 20 píxeles y fusión 2x2.
- Decodificación especulativa MTP-7 con anchuras adaptativas {1,8}, orientada a reducir latencia en generación.
- Servicio concurrente: el plan fijado admite 8 peticiones simultáneas con tensor parallel 4.
- Cabezas auxiliares cuantizadas: cabeza de vocabulario propuesta en NVFP4 y cabeza de transición Markov en FP8 E4M3 para corrección de propuestas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada (solo se declara texto y visión).

## Casos de uso

- Análisis de repositorios y documentación extensa: con 1.048.576 tokens de contexto, el modelo puede ingerir bases de código completas o conjuntos de documentos técnicos en una sola petición y responder preguntas que requieren correlacionar información distribuida a lo largo de cientos de miles de tokens.
- Procesamiento de contratos y expedientes largos: la ventana de un millón de tokens permite cargar contratos completos con anexos y comparar cláusulas sin trocear el documento, reduciendo la pérdida de contexto entre fragmentos.
- Inspección de imágenes en pipelines documentales: el codificador de visión con 4 imágenes por petición y 4 concurrentes sirve para clasificar, describir o extraer datos de capturas, diagramas o páginas escaneadas dentro de un flujo de digitalización.
- Servicio de inferencia de alto throughput en un solo host: el plan TP4 sobre 4 GPU Blackwell SM120 con 8 peticiones concurrentes y prefill de 8192 tokens está pensado para despliegues internos que necesitan sostener tráfico moderado sin clúster multi-nodo.
- Evaluación de técnicas de cuantización extrema: el paquete sirve como banco de pruebas reproducible para medir el impacto de NVFP4 en expertos, MXFP8 en proyecciones y FP8 en cabezas auxiliares sobre la calidad de salida, con métricas de concordancia ya publicadas.
- Investigación sobre decodificación especulativa: MTP-7 con anchuras adaptativas y las cifras de decode (154 tok/s a 256 tokens, 138 tok/s a 512 tokens) permiten estudiar el equilibrio entre tasa de aceptación y latencia en modelos MoE cuantizados.
- Despliegue con contexto largo en memoria contenida: la KV cache E4M3 de ~20 KiB/token hace viable mantener contextos de cientos de miles de tokens en un solo host, útil para asistentes de análisis que necesitan memoria persistente de la sesión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas cifras publicadas son de rendimiento del motor en el hardware de referencia (RTX PRO 6000 Blackwell x4, cap8):

| Prueba | Este paquete (cap8) | iter2 (chunk 8192, proyecciones BF16) |
|---|---|---|
| Prefill 3.425 tokens (tok/s) | 2083 | 2466 |
| Prefill 11.846 tokens (tok/s) | 3394 | 2854 |
| Decode 256 tokens (tok/s) | 154 | 113 |
| Decode 512 tokens (tok/s) | 138 | 148 |

El veredicto del gate recogido en la model card indica: decode512 148 → 136 (−7,9 %), prefill11846 2854 → 3384 (+18,6 %), WIN=True. Además se reporta una concordancia de referencia de 65,6 % frente a 65,8 % en precisión de siguiente token y 97,3 % de concordancia en token más probable.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 345,6 GB y el plan está fijado para tensor parallel 4, lo que implica repartir pesos y KV cache entre 4 GPU. La KV cache E4M3 se estima en ~20 KiB por token, es decir, aproximadamente 20 GiB por contexto de un millón de tokens.
- GPU recomendadas: 4 x RTX PRO 6000 Blackwell (SM120) en un solo host, según el plan compilado y las pruebas publicadas. No se documenta compatibilidad con A100, H100 ni otras arquitecturas.
- GPU de consumo: no disponible; el plan exige SM120 y TP4, por lo que no se contempla su ejecución en una única GPU de consumo.
- Opciones de despliegue: motor FLARE (`flare-cli/target/release/flare run model.safetensors --gpus 0,1,2,3`), servido mediante `house-start.sh` con `--max-concurrency 8` y API key obligatoria. Depende de un fork de FlashInfer con pin `4fd836dcda09` y parches PR-110/111/112, además de un runner Rust con hash `6b68b9b4` y el parche 0001.
- Latencia y throughput: prefill de 2083 tok/s a 3.425 tokens y 3394 tok/s a 11.846 tokens; decode de 154 tok/s a 256 tokens y 138 tok/s a 512 tokens, medidos con concurrencia 8 en el rig de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v3 | 50.615.414 declarados (no verificado) | 1.048.576 | NVFP4 + MXFP8 + FP8 | Lil License 1.0 | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Small (base) | no disponible | no disponible | BF16 (checkpoint original) | no disponible | Hugging Face |
| Inkling-2-Small-NVFP4-CSF (checkpoint fuente) | no disponible | no disponible | NVFP4 | no disponible | Referenciado en la model card |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos base y fuente en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El dato de parámetros totales (50.615.414) no es coherente con un modelo de contexto de un millón de tokens, cabezas de vocabulario cuantizadas y un repo de 345,6 GB; debe tratarse como no verificado.
- La licencia Lil License 1.0 es de tipo `other`; es imprescindible revisar `LICENSE` y `LICENSES/` antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- El paquete está compilado específicamente para SM120 y tensor parallel 4; no hay garantía de funcionamiento en otras GPU ni en configuraciones de un solo dispositivo.
- Depende de un fork de FlashInfer con pin concreto, parches Python y un runner Rust con hash fijado; cualquier desviación de ese toolchain puede invalidar el plan y las métricas publicadas.
- La cuantización introduce una desviación de ~2,7 % en norma relativa respecto al checkpoint y una precisión de siguiente token de 65,6 % frente a 65,8 %; no es una réplica exacta del modelo original.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (17 de noviembre de 2026); no hay evidencia de uso en producción ni validación independiente.
- El contexto de un millón de tokens implica un consumo de KV cache de aproximadamente 20 GiB por contexto, lo que limita el número de contextos largos simultáneos.

## Enlaces

- Hugging Face: https://huggingface.co/Jon-Nielsen/Inkling-2-Small-NVFP4-CSF-FLARE-sm120-1M-vision-v3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint fuente referenciado: `Inkling-2-Small-NVFP4-CSF` (sin URL directa en la información disponible)
- Repositorio del motor: `hyperflare-inference`, rama `pr312-inkling`, PR312 head `c63fda04` (sin URL directa en la información disponible)
- Fork de FlashInfer: pin `4fd836dcda09` con parches PR-110/111/112 (sin URL directa en la información disponible)
- Licencia: `LICENSE` y `LICENSES/` dentro del repositorio de Hugging Face

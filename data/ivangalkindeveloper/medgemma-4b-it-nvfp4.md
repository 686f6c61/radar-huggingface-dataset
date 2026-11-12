# ivangalkindeveloper/medgemma-4b-it-nvfp4

## Resumen

medgemma-4b-it-nvfp4 es una cuantización no oficial en NVFP4 de google/medgemma-4b-it, un modelo multimodal de imagen y texto especializado en el ámbito médico. Lo publica el usuario ivangalkindeveloper y no debe confundirse con un lanzamiento de Google: se trata de un checkpoint derivado cuyo objetivo es reducir la huella de memoria del modelo base para facilitar su despliegue en hardware con recursos limitados, en concreto una estación NVIDIA DGX Spark GB10.

El modelo base es un transformer de tipo Gemma 3 con aproximadamente 4.971 millones de parámetros (unos 4,97 B), capaz de procesar entradas de imagen y texto y de generar respuestas conversacionales. La versión NVFP4 mantiene en BF16 el torre de visión, el proyector multimodal, las capas de normalización, los embeddings y el lm_head, y cuantiza únicamente las capas lineales del modelo de lenguaje a W4A4 con grupo de 16 y calibración estática min-max.

Su relevancia es práctica: reduce los pesos cargados en memoria de 8,61 a 4,33 GiB y el tamaño en disco de 8,01 a 4,96 GiB, con una mejora medida de velocidad de decodificación en un único flujo (de 81,8 a 105,7 tokens/s). El coste es una degradación de calidad no despreciable en algunas tareas, que el propio autor documenta y que conviene evaluar antes de cualquier uso serio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 + torre de visión), capas lineales del LM cuantizadas a NVFP4 W4A4 |
| Parámetros totales | 4.971.331.952 (~4,97 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 16384` |
| Tipos de cuantización | NVFP4 W4A4, grupo de 16, calibración estática min-max, pesos round-to-nearest; resto de tensores en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Health AI Developer Foundations Terms of Use (license: other) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base google/medgemma-4b-it, un transformer multimodal de la familia Gemma 3 con un codificador de visión acoplado mediante un proyector multimodal. Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento sobre las capas lineales del modelo de lenguaje en formato NVFP4 (4 bits en pesos y activaciones, grupo de 16), con calibración estática min-max y redondeo al más cercano. La torre de visión, el proyector multimodal, los embeddings, las capas de normalización y el lm_head se mantienen en BF16, y la caché KV también fue BF16 durante las pruebas.

La calibración empleó 128 entradas de texto: 64 ejemplos de entrenamiento de MedQA y 64 prompts sintéticos de informes, con entradas de evaluación separadas. El autor indica que los tensores no cuantizados coinciden con el checkpoint original y que los pesos empaquetados y las escalas coinciden con la exportación cuantizada en bruto. No se documenta en la información disponible ningún proceso de RLHF, DPO ni ajuste adicional sobre el modelo derivado; las innovaciones técnicas se limitan a la propia cuantización y a la verificación de integridad mediante SHA256SUMS y MODIFICATIONS.md.

## Capacidades

- Generación de texto conversacional en el dominio médico a partir de entradas de texto e imagen (pipeline image-text-to-text).
- Comprensión de imágenes médicas y respuesta a preguntas visuales (VQA), evaluada por el autor en VQA-RAD en modalidades cerrada y abierta.
- Respuesta a preguntas de conocimiento médico (MedQA, MedMCQA, PubMedQA) y generación de informes sintéticos con estructura JSON validable por esquema.
- Procesamiento de dictados sintéticos y prompts de informe con formato controlado.
- Soporte de plantilla de chat y procesador multimodales incluidos en el repositorio.
- Compatibilidad con decodificación especulativa n-gram en vLLM, según la configuración de despliegue documentada.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Investigación y prototipado en hardware de gama limitada: la reducción de pesos cargados de 8,61 a 4,33 GiB permite ejecutar un modelo médico multimodal de ~5 B en una única GPU con memoria moderada, útil para experimentar con pipelines de imagen y texto sin infraestructura de datacenter.
- Evaluación comparativa de cuantizaciones: el repositorio incluye métricas BF16 frente a NVFP4 sobre el mismo conjunto de tareas, lo que lo convierte en un banco de pruebas práctico para estudiar el impacto de la cuantización 4 bits en tareas médicas.
- Generación de borradores de informes con validación de esquema: el modelo produce salidas JSON con estructura verificable, adecuado para prototipos de asistencia documental donde un revisor humano valide cada salida antes de su uso.
- Preguntas y respuestas sobre literatura biomédica en entornos de investigación: con un rendimiento medido de 68,00 % en PubMedQA en NVFP4, puede emplearse como componente de recuperación aumentada en herramientas internas de exploración bibliográfica, nunca como fuente de decisión clínica.
- Clasificación y respuesta a preguntas sobre imágenes radiológicas en entornos de docencia: los resultados en VQA-RAD (63,28 % en cerrada, 21,88 % de coincidencia exacta en abierta) permiten usarlo en demostraciones educativas y experimentos de visión médica.
- Despliegue en vLLM con decodificación especulativa: la configuración documentada con n-gram y caché de prefijos sirve como referencia para equipos que quieran medir latencia y throughput en GPUs compatibles con NVFP4 antes de adoptar el formato.
- Pruebas de regresión de calidad en MLOps: las diferencias medidas entre precisiones permiten construir umbrales de aceptación y detectar degradaciones al cambiar de precisión en un pipeline interno.

## Benchmarks y rendimiento

Evaluaciones zero-shot personalizadas del autor (2026-11-10), con una ejecución determinista por precisión y 1.956 tareas por configuración. No son resultados oficiales de Google ni evidencia de equivalencia clínica.

| Métrica | Tareas | BF16 | NVFP4 | Diferencia |
|---|---:|---:|---:|---:|
| MedQA | 512 | 55,47 % | 52,15 % | -3,32 pp |
| MedMCQA | 512 | 53,32 % | 51,95 % | -1,37 pp |
| PubMedQA | 500 | 67,40 % | 68,00 % | +0,60 pp |
| VQA-RAD cerrada | 128 | 64,06 % | 63,28 % | -0,78 pp |
| VQA-RAD abierta (coincidencia exacta) | 64 | 20,31 % | 21,88 % | +1,56 pp |
| Informe sintético, aprobación estricta | 160 | 86,25 % | 72,50 % | -13,75 pp |

Rendimiento en DGX Spark GB10 con vLLM 0.28.0:

| Métrica | BF16 | NVFP4 |
|---|---:|---:|
| Pesos cargados en memoria | 8,61 GiB | 4,33 GiB |
| Tamaño en disco (safetensors) | 8,01 GiB | 4,96 GiB |
| Velocidad de decodificación (mediana, un flujo) | 81,8 tok/s | 105,7 tok/s |
| Latencia del primer token (mediana) | 0,113 s | 0,067 s |
| Longitud media de salida | 77 tokens | 50 tokens |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cargados ocupan 4,33 GiB en NVFP4 (frente a 8,61 GiB en BF16); hay que añadir caché KV, grafos CUDA y búferes multimodales. La configuración documentada reserva 4 GiB para caché KV.
- GPU validadas: NVIDIA DGX Spark GB10, con el kernel nativo `FlashInferCutlassNvFp4LinearKernel` y vLLM 0.28.0. No se han validado otras GPU, backends ni versiones anteriores de vLLM.
- NVFP4 requiere una GPU, pila CUDA y runtime compatibles; no se especifica en la información disponible la lista completa de GPU consumer soportadas, por lo que no puede confirmarse su ejecución en tarjetas como RTX 4090 sin validación propia.
- Opciones de despliegue documentadas: vLLM con `--dtype bfloat16`, `--max-model-len 16384`, `--max-num-seqs 8`, `--max-num-batched-tokens 2048`, `--limit-mm-per-prompt '{"image": 6}'`, caché de prefijos y decodificación especulativa n-gram con 8 tokens. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 105,7 tokens/s en decodificación y 0,067 s hasta el primer token con una única petición; el autor advierte que las muestras son pequeñas, usan decodificación especulativa n-gram y un solo motor activo, y que las salidas más cortas confunden la comparación de extremo a extremo. Los resultados agregados para concurrencia 1, 4 y 8 están en evaluation.json.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ivangalkindeveloper/medgemma-4b-it-nvfp4 | ~4,97 B | No disponible (ejemplo a 16.384) | safetensors NVFP4 + BF16 | HAI-DEF Terms of Use | Hugging Face, 0 descargas, 0 likes |
| google/medgemma-4b-it (base) | ~4,97 B | No disponible | safetensors BF16 | HAI-DEF Terms of Use | Hugging Face (oficial) |
| Otras cuantizaciones comunitarias del mismo base | ~4,97 B | No disponible | No disponible | HAI-DEF Terms of Use | No disponible en la información proporcionada |

No se dispone en la información proporcionada de datos sobre modelos alternativos de tamaño o tarea comparable con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Google; es una cuantización comunitaria sin revisión clínica ni regulatoria.
- La cuantización degrada la calidad: pérdidas de 3,32 pp en MedQA, 1,37 pp en MedMCQA y 13,75 pp en aprobación estricta de informes sintéticos. El propio autor señala que no se alcanzó su umbral conservador de calidad (máximo 2 pp de pérdida por conjunto de QA y ningún hecho crítico nuevo).
- La revisión de informes sintéticos detectó errores factuales, incluidas mediciones no respaldadas en algunas salidas cuantizadas.
- No hubo evaluación clínica ciega ni repetición de la línea base BF16 para medir varianza entre ejecuciones; los controles automáticos pueden producir falsos positivos.
- Los resultados en VQA-RAD no establecen rendimiento en ecografía, y los datos de benchmark pueden solaparse con datos de preentrenamiento desconocidos.
- Las métricas son evaluaciones zero-shot personalizadas, no resultados oficiales de Google ni evidencia de equivalencia clínica.
- Las muestras de rendimiento son pequeñas, con decodificación especulativa y un solo motor; no garantizan aceleraciones universales.
- Solo se ha validado en NVIDIA DGX Spark GB10 con vLLM 0.28.0; otros backends y versiones no están probados.
- Licencia HAI-DEF: la sección 3.2 y la Política de Usos Prohibidos rigen el uso y la redistribución; deben conservarse el acuerdo, los avisos y las restricciones al redistribuir.
- No se dispone de información sobre sesgos, cobertura idiomática ni riesgos de alucinación específicos más allá de los errores factuales observados.
- No apto para uso clínico sin autorización regulatoria; la evaluación es de ingeniería y no valida uso médico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Revisión concreta del base referenciada: https://huggingface.co/google/medgemma-4b-it/tree/290cda5eeccbee130f987c4ad74a59ae6f196408
- MODIFICATIONS.md: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/MODIFICATIONS.md
- quantization.json: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/quantization.json
- SHA256SUMS: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/SHA256SUMS
- evaluation.json: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/evaluation.json
- LICENSE (HAI-DEF Terms of Use): https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/LICENSE
- USE_POLICY.md (HAI-DEF Prohibited Use Policy): https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/USE_POLICY.md
- NOTICE: https://huggingface.co/ivangalkindeveloper/medgemma-4b-it-nvfp4/blob/main/NOTICE

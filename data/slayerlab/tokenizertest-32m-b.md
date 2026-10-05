# SlayerLab/TokenizerTest-32m-B

## Resumen
TokenizerTest-32m-B es un modelo de lenguaje base en polaco de ~38,9 millones de parámetros, publicado por SlayerLab como el brazo B de un experimento controlado de comparación de tokenizers. No es un modelo pensado para uso práctico: es un checkpoint de investigación cuyo único propósito es medir el efecto del tokenizer sobre la calidad del modelo manteniendo constante absolutamente todo lo demás (arquitectura, receta de entrenamiento, semilla 1337 y el mismo corpus polaco de ~12,4 GB).

La arquitectura es un transformer denso y propio de la casa (misma familia que `SlayerLab/GoLLeM-v6-250M`): 15 capas, `d_model` 384, 6 cabezas de atención, contexto de 1024 tokens y embeddings de entrada/salida atados. El nombre "32m" del repositorio hace referencia a la receta ("Glint 32M r6"), no al número de parámetros. Se entrenó con optimizador Muon, batch 32 y 95.000 pasos, frente a los 89.000 pasos del brazo A.

Su relevancia es metodológica: el autor publica la curva completa de bits por byte en checkpoints cada 10.000 pasos, junto con los hashes SHA-256 de pesos y datos, y advierte explícitamente de que la pérdida por token no es comparable entre tokenizers distintos. La conclusión honesta del experimento, con una sola semilla y sin estimación de ruido, es que a esta escala el tokenizer B no aporta ninguna ganancia en bits por byte (1,0622 frente a 1,0583 en validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con embeddings atados (familia GoLLeM v6); 15 capas, d_model 384, 6 cabezas de atencion, contexto 1024 |
| Parametros totales | 38.866.958 (segun model card, `model.safetensors` en fp32). El contador de safetensors del Hub indica 51.154.958 porque la cabeza de salida se almacena como copia del embedding atado y se cuenta dos veces |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos fp32; no hay GGUF, GPTQ ni AWQ oficiales) |
| Idiomas soportados | polaco (pl) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (fp32) + `config.json`, `tokenizer.json` y codigo de modelado en PyTorch (`modeling_gollem_v6.py`) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso de 15 capas con `d_model` 384 y 6 cabezas de atención, con la matriz de embedding de entrada y la cabeza de salida atadas. No es una clase de `transformers`: el código de inferencia vive en `modeling_gollem_v6.py`, compartido con `SlayerLab/GoLLeM-v6-250M`. El entrenamiento usó el optimizador Muon, batch de 32, semilla 1337 y el script `train_gpt_ref_r6.py` (`0223c083`). No se menciona ningún tipo de ajuste por instrucciones (RLHF, DPO o SFT); es un modelo estrictamente base, entrenado solo con objetivo de modelado de lenguaje.

Ambos brazos vieron exactamente el mismo texto: el dataset público `SlayerLab/slayer-pl-8x3b` en la revisión `d50df04a`, con los ficheros `pack-00/web.parquet`, `pack-01/web.parquet` y `shared/{core, core_sa, legal, legal_sa}.parquet`; la validación es `pack-07/web.parquet`, decontaminada con n-gramas de 13 contra el entrenamiento. La única diferencia entre brazos es el tokenizer: A usa un BPE de Fabryka AI (`60e23148`) y B el de stubbornGuy (`77eeebed`), ambos con vocabulario de 32.000. B fragmenta el texto más finamente (3,96 frente a 4,25 bytes por token en entrenamiento, incluido EOS), por lo que necesitó más pasos para ver los mismos bytes. Con 95.000 pasos de 32.768 tokens cada uno, el brazo B procesó aproximadamente 3.110 millones de tokens (cálculo estimado a partir de los datos de la model card).

La innovación metodológica es la comparación en bits por byte en lugar de pérdida por token, la publicación de la curva completa cada 10.000 pasos y la verificación con `torch.equal` de que cualquier `model.safetensors` del repositorio reproduce exactamente los logits del checkpoint de entrenamiento correspondiente.

## Capacidades
- Generacion de texto en polaco: continuacion de texto base, sin ajuste por instrucciones.
- Modelado de lenguaje puro: útil para calcular probabilidades, perplejidad y bits por byte sobre corpus polacos.
- Ninguna capacidad de razonamiento guiado, dialogo, respuesta a preguntas o seguimiento de instrucciones.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo "thinking".
- Multilingue: no; el modelo esta entrenado exclusivamente con texto en polaco.
- Reproduccion bit a bit de checkpoints intermedios (cada 10.000 pasos, hasta 90.000) para experimentos de dinamica de entrenamiento.

## Casos de uso
- Comparacion controlada de tokenizers: es el proposito literal del repositorio. Dos modelos con arquitectura, receta, semilla y datos identicos permiten aislar el efecto del tokenizer midiendo bits por byte sobre los mismos bytes, con curvas por paso y hashes verificables.
- Estudio de escalado y dinamica de entrenamiento: los checkpoints cada 10.000 pasos permiten analizar la evolucion de la curva de perdida y comparar dos regimenes de tokenizacion sin reentrenar nada.
- Fine-tuning sobre polaco como punto de partida: al ser un modelo base pequeno (38,9M de parametros), es viable ajustarlo en una sola GPU consumer para tareas de clasificacion de texto, analisis de sentimiento, reconocimiento de entidades o etiquetado de documentos legales.
- Investigacion sobre el optimizador Muon: sirve como banco de pruebas a escala pequena para estudiar el comportamiento de Muon frente a AdamW en un presupuesto de computo minimo.
- Validacion de infraestructura de entrenamiento: el repositorio incluye el script de entrenamiento, los identificadores de revision de datos y una comprobacion de igualdad exacta de logits, lo que lo convierte en un caso de test reproducible para pipelines propios.
- Analisis de fertilidad de tokenizers sobre corpus polacos: los datos de bytes por token (3,96 frente a 4,25 en entrenamiento) permiten estudiar el impacto de decisiones de vocabulario en corpus con morfologia rica.
- Verificacion de integridad de artefactos: el fichero `SHA256SUMS` y los hashes por checkpoint permiten auditar procedencia de pesos y datos en flujos de investigacion reproducibles.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, KLEJ u otros) en la informacion disponible. El unico dato de evaluacion es la curva de bits por byte (menor es mejor), no comparable con otros modelos por tratarse de una metrica sobre bytes del mismo corpus.

| Step | A val | B val | A W | B W |
|---|---|---|---|---|
| 10.000 | 1,1910 | 1,2009 | 1,2327 | 1,2463 |
| 20.000 | 1,1448 | 1,1523 | 1,1799 | 1,1896 |
| 30.000 | 1,1200 | 1,1278 | 1,1499 | 1,1634 |
| 40.000 | 1,1032 | 1,1109 | 1,1304 | 1,1435 |
| 50.000 | 1,0888 | 1,0969 | 1,1141 | 1,1291 |
| 60.000 | 1,0773 | 1,0850 | 1,1000 | 1,1145 |
| 70.000 | 1,0675 | 1,0752 | 1,0885 | 1,1025 |
| 80.000 | 1,0610 | 1,0677 | 1,0818 | 1,0944 |
| 89.000 | 1,0583 | — | 1,0781 | — |
| 90.000 | — | 1,0633 | — | 1,0892 |
| 95.000 | — | 1,0622 | — | 1,0883 |

| Conjunto | A | B | B − A |
|---|---|---|---|
| Validacion (7.232.820 B) | 1,0583 | 1,0622 | +0,0040 (+0,37 %) |
| Held-out W (1.430.217 B) | 1,0781 | 1,0883 | +0,0101 (+0,94 %) |

Otros datos declarados: bytes por token en entrenamiento 3,96 (B) frente a 4,25 (A); bytes por token en validacion 4,14 (B) frente a 4,41 (A); bits por token en validacion 4,395 (B) frente a 4,668 (A), metrica que el autor senala como no indicativa de calidad.

## Requisitos de hardware
- Pesos en fp32: 38,87M de parametros x 4 bytes ≈ 155 MB.
- Pesos en fp16/bf16 (conversion manual): ≈ 78 MB.
- VRAM estimada para inferencia: menos de 1 GB en cualquier configuracion practica (batch 1, contexto 1024), incluyendo activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1050, RTX 3060, RTX 4090); tambien es viable en CPU para inferencia puntual.
- Cabe holgadamente en GPU consumer: si, en practicamente todas las disponibles en el mercado.
- Opciones de despliegue: no es compatible de serie con vLLM, TGI, Ollama ni llama.cpp, porque usa una arquitectura PyTorch propia y no una clase de `transformers`. El despliegue requiere cargar `modeling_gollem_v6.py` con PyTorch y `safetensors`. Convertirlo a GGUF exigiria implementar el grafo en llama.cpp.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizer | Bits por byte (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SlayerLab/TokenizerTest-32m-B | 38,87M | 1024 | stubbornGuy BPE, vocab 32.000 (`77eeebed`) | 1,0622 | CC BY-SA 4.0 | HuggingFace, pesos fp32 + checkpoints |
| SlayerLab/TokenizerTest-32m-A | 38,87M | 1024 | Fabryka AI BPE, vocab 32.000 (`60e23148`) | 1,0583 | CC BY-SA 4.0 | HuggingFace, pesos fp32 + checkpoints |
| Otros modelos base pequenos en polaco | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion significativa disponible es la del brazo A, que es el companero experimental directo. No se dispone de datos verificables sobre alternativas de terceros con los que contrastar parametros, contexto o rendimiento, por lo que no se incluyen cifras que no puedan confirmarse.

## Limitaciones y advertencias
- Es un modelo base, no ajustado por instrucciones: continua texto en polaco, no responde preguntas ni sigue ordenes.
- Conocimiento muy limitado por su tamano (38,9M de parametros) y por el presupuesto de entrenamiento (~3,1B tokens).
- Puede reproducir errores, sesgos y contenido problematico presentes en texto web sin filtrar; el corpus incluye ficheros legales y web sin curacion detallada.
- Contexto maximo de 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo polaco: no hay capacidades multilingues ni transferencia esperable a otros idiomas.
- Un unico experimento con una unica semilla y sin estimacion de ruido: el propio autor advierte de que la lectura correcta es "el tokenizer B no aporta ganancia en bits por byte a esta escala", no "B es peor".
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y obliga a distribuir las obras derivadas (incluidos fine-tunings) bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- No hay cuantizaciones publicadas ni integracion con runtimes estandar, lo que anade trabajo de ingenieria a cualquier despliegue.
- El autor indica explicitamente que es un checkpoint de investigacion y no un modelo para uso.
- No se han publicado evaluaciones de seguridad, sesgo o toxicidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SlayerLab/TokenizerTest-32m-B
- Brazo A del experimento (tokenizer Fabryka AI): https://huggingface.co/SlayerLab/TokenizerTest-32m-A
- Dataset de entrenamiento: https://huggingface.co/datasets/SlayerLab/slayer-pl-8x3b
- Modelo con el que comparte codigo de arquitectura: https://huggingface.co/SlayerLab/GoLLeM-v6-250M
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente resultados de agregadores de contenido para adultos sin relacion alguna); no se han encontrado papers, blogs, repositorios ni demos adicionales.

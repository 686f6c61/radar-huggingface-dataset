# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13` dentro de la familia "Semantic Simulation" (SemSimula). No es un transformer: se trata de un modelo conservativo basado en un potencial escalar, formulado como un flujo de gradiente de primer orden (first-order gradient flow) sobre una variedad riemanniana, con atención eliminada y memoria constante en inferencia. El modelo forma parte de un estudio pre-registrado ("ladder study") que compara, par a par, dinámicas de primer y segundo orden sobre el mismo presupuesto de tokens.

Este checkpoint concreto corresponde a la variante entrenada sobre OpenWebText con 2 pozos de modo Poisson (PM2) y 16 modos estirados (PMX16), con dimensión oculta 384 y 2 capas. Su relevancia es metodológica: el autor demuestra que, con pozos presentes, la dinámica de segundo orden no aporta ventaja frente a un flujo de primer orden entrenado de forma idéntica (53,81 frente a 54,71 de perplejidad, −1,6% emparejado por paso). Es, por tanto, una pieza de evidencia en un experimento controlado, no un modelo orientado a producción.

El modelo se entrenó con exactamente 532,48 millones de tokens y se publica bajo licencia CC-BY-4.0. Su tamaño de repositorio es de 0,3 GB y la librería declarada es PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atención, basado en potencial escalar y mecánica lagrangiana (flujo de gradiente de primer orden sobre geometría riemanniana) |
| Parametros totales | no disponible (dimensión oculta d=384, 2 capas; el conteo exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch`); no se declara safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura abandona el mecanismo de atención y el esquema transformer convencional. El modelo se formula como un sistema físico: un potencial escalar anisotrópico gaussiano ("anisotropic Gaussian potential") con 2 pozos de modo Poisson y 16 modos estirados, sobre el que se define un flujo de gradiente de primer orden. La variante `fob` del nombre indica "first-order true gradient flow": el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta, sin velocidad ni inercia en ningún punto. La inferencia opera con memoria constante, lo que en principio desacopla el coste de memoria de la longitud de la secuencia.

El entrenamiento usó el dataset Skylion007/openwebtext con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), arrancando desde el paso 0 con semilla 0, igual que su gemelo de segundo orden y el par K=16. Los pares comparten los mismos lotes de entrenamiento y evaluación, de modo que las diferencias se miden emparejadas (correlación de 0,999 entre cambios de evaluación paso a paso). El estudio está pre-registrado (MS2a) y emplea integradores tipo BAOAB y dinámica tipo CFC en las variantes de segundo orden; esta variante concreta es la contraparte de primer orden. No se declara uso de RLHF ni DPO.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación medida sobre OpenWebText.
- Modelado de lenguaje a nivel de token con ventana de bloque de 512 tokens en evaluación.
- Inferencia con memoria constante (sin caché KV de atención, al no existir atención).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingüe: solo inglés.
- No se declara modo "thinking", visión, audio ni capacidades multimodales.
- El modelo está pensado como artefacto de investigación para ablación de mecanismos, no como asistente.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir el efecto de la dinámica de primer frente a segundo orden en modelos conservativos, gracias a que comparte lotes y semilla con su gemelo.
- Estudio de modelos basados en energía: permite analizar cómo un potencial escalar con pozos de modo Poisson condiciona la distribución aprendida, útil en líneas de energy-based models.
- Reproducción de experimentos pre-registrados: el checkpoint encaja en pipelines de replicación del "ladder study" sobre OpenWebText con presupuesto fijo de 532,5M tokens.
- Evaluación de eficiencia de memoria: al no usar atención, es adecuado para probar regímenes de inferencia con memoria constante en entornos con restricciones de VRAM.
- Docencia e ilustración de mecánica lagrangiana aplicada a LM: el modelo permite mostrar en un curso cómo se formula un LM como flujo de gradiente sobre una variedad riemanniana.
- Ablación de mecanismos en investigación académica: comparar perplejidad con y sin pozos (K=0, 2, 16, 64) para aislar la contribución de cada componente.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Este modelo (FO-b-PM2-PMX16) | OpenWebText, validation | Perplejidad a bloque 512 (media de las tres últimas evaluaciones de 500 pasos) | 53,81 |
| Gemelo de segundo orden (PM2-PMX16 SR2) | OpenWebText, validation | Perplejidad a bloque 512 | 54,71 |
| FO-b-PMX-K16 | OpenWebText, validation | Perplejidad a bloque 512 | 53,73 |
| FO-b-PMX (64 pozos) | OpenWebText, validation | Perplejidad a bloque 512 | 54,02 |

Mejor valor observado durante el entrenamiento de este modelo: 51,90 en el paso 31.000. Las tres últimas evaluaciones fueron 53,77, 53,90 y 53,76. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB, lo que sugiere que el checkpoint en precisión original cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se declaran; por tamaño, una RTX 4090 o incluso GPUs de gama media deberían bastar para inferencia, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio, pero no está confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo no-transformer con pesos PyTorch, requeriría código propio del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (OWT val, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FO-b-PM2-PMX16) | d=384, 2 capas (conteo no declarado) | no disponible | 53,81 | CC-BY-4.0 | Hugging Face |
| PM2-PMX16 SR2 (gemelo segundo orden) | idem | no disponible | 54,71 | CC-BY-4.0 | Hugging Face |
| FO-b-PMX-K16 | idem | no disponible | 53,73 | CC-BY-4.0 | Hugging Face |
| FO-b-PMX (64 pozos) | idem | no disponible | 54,02 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con transformers estándar de tamaño equivalente en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está ajustado para instrucciones, diálogo ni uso como asistente.
- Solo inglés; no hay soporte multilingüe declarado.
- Riesgo elevado de alucinación y texto incoherente en generación libre: la perplejidad de 53,81 en OpenWebText es alta en términos absolutos y el modelo es de escala muy pequeña.
- Sesgos: al entrenarse solo con OpenWebText, hereda los sesgos de ese corpus (predominantemente inglés y de dominio web).
- Longitud de contexto no documentada; la evaluación se limita a bloques de 512 tokens.
- Sin soporte declarado de tool calling, agentes ni razonamiento multi-paso.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está diseñado ni validado para producción.
- El resultado de perplejidad está marcado como `verified: false` en la model-index; no ha sido replicado de forma independiente.
- Requiere código específico del autor para cargar y ejecutar los pesos; no es compatible con stacks estándar de inferencia sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Modelo FO-b-PMX-K16: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Colección "first vs second order": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

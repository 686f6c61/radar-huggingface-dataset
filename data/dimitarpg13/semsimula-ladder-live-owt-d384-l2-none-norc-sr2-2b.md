# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-2b

## Resumen

SR2-2B es un modelo de lenguaje de investigación desarrollado por dimitarpg13 que explora una arquitectura radicalmente distinta a los transformers convencionales: un modelo de lenguaje "conservativo" basado en mecánica lagrangiana y potenciales escalares, sin mecanismo de atención. Forma parte de la familia semsimula, un estudio escalonado (ladder study) con hipótesis pre-registradas que compara ablaciones de mecanismos bajo presupuestos de tokens igualados. Esta versión concreta (SR2-2B) es la variante conservativa pura entrenada con 2,13 mil millones de tokens sobre OpenWebText, cuatro veces más que su predecesora SR2 de 0,53B.

El modelo tiene 76,57 millones de parámetros (35,43 millones en el banco de potenciales Vθ de ocho pozos) y una dimensión oculta de 384 con dos capas. Su innovación central es integrar los modos rígidos como osciladores amortiguados exactos mediante integradores simplécticos (BAOAB, cFC) sobre una geometría riemanniana con métrica de Jacobi, lo que permite inferencia con memoria constante y sin atención. El resultado principal es que el núcleo conservativo se acerca a un GPT-2 emparejado en presupuesto de tokens: la perplejidad de validación baja a 48,58 frente a 42,69 del GPT-2 equivalente, estrechando la brecha del 20,6% al 13,8%.

Es relevante ahora porque documenta un hallazgo negativo controlado: al entrenar más tokens, el paso de capa del modelo deja de aproximar un flujo continuo (se aleja 0,92 nats frente a 0,10 nats a 0,53B), lo que sugiere que el entrenamiento prolongado acopla el paso discreto a su tamaño. Es un experimento de ciencia abierta con predicciones pre-registradas, útil para investigadores que estudian alternativas a la atención y modelos basados en energía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, lagrangiano), no-transformer, sin atención; integrador simpléctico exacto (BAOAB/cFC) sobre potencial escalar anisotrópico gaussiano |
| Parametros totales | 76.572.110 (35.427.080 en el banco Vθ de ocho pozos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pytorch (checkpoint PyTorch; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo que sustituye la atención por dinámica hamiltoniana/lagrangiana: un potencial escalar anisotrópico gaussiano con un banco de ocho pozos (Vθ) define un campo de fuerzas conservativo, y los modos rígidos se integran como osciladores amortiguados exactos mediante el integrador BAOAB con subpasos (cFC). El modelo opera sobre una geometría riemanniana con métrica de Jacobi y geodésicas riemannianas, lo que da lugar a una formulación en espacio de Fock (parFLM). La inferencia tiene memoria constante por construcción, al no requerir atención sobre el contexto.

El entrenamiento usó exactamente 2.129.920.000 tokens (130.000 pasos × 32 × 512), unas 28 tokens por parámetro, con ventanas aleatorias extraídas con reemplazo de un pool de 2,0B tokens de OpenWebText (aproximadamente 1,07 pasadas). El pool se reconstruyó desde el mismo flujo antes de esta ejecución y el archivo de validación es el original del ladder. Se ejecutó en dos sesiones de Colab sobre una A100 de 80 GB, a ~1,1 s por paso, con reanudación desde el autosave del paso 76.993 restaurando optimizador y sampler de batches. No se mencionan RLHF ni DPO; el entrenamiento es de modelado de lenguaje autorregresivo puro con integrador exacto y presupuesto de tokens igualado al del GPT-2 de referencia.

## Capacidades

- Generación de texto autorregresiva en inglés (pipeline `text-generation`).
- Modelado de lenguaje y estimación de perplejidad sobre OpenWebText.
- Inferencia con memoria constante (sin atención, sin caché KV de tamaño creciente).
- Integración exacta de modos rígidos mediante osciladores amortiguados (BAOAB/cFC).
- Formulación en espacio de Fock (parFLM) con potencial escalar conservativo.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- Capacidad multilingüe: solo inglés.
- No se documenta modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Investigación en alternativas a la atención: el modelo sirve como brazo de ablación controlado dentro del ladder semsimula para medir el efecto de sustituir atención por dinámica conservativa bajo presupuesto de tokens igualado.
- Estudio de modelos basados en energía: permite analizar cómo un potencial escalar con ocho pozos y métrica de Jacobi modela distribuciones de texto, comparando perplejidad con un GPT-2 emparejado.
- Experimentos de ciencia abierta con hipótesis pre-registradas: útil para replicar las llamadas RT3, DG1, DG2, OC1-OC3 y TL1/TL2 y evaluar la reproducibilidad de predicciones.
- Inferencia con memoria constante en entornos restringidos: al no requerir caché KV creciente, es adecuado para estudiar despliegues donde la memoria por token es un cuello de botella, aunque su perplejidad es superior a la de un transformer pequeño.
- Análisis de integradores simplécticos en generación de texto: permite medir el efecto del número de subpasos (k=8) y del tamaño de paso sobre la calidad del flujo por capa.
- Docencia y divulgación sobre mecánica lagrangiana aplicada a aprendizaje automático: el modelo y sus notas companion documentan de forma explícita la construcción del potencial, el integrador y las métricas de salud del entrenamiento.
- Referencia de escalado de datos: sirve para estudiar la ganancia por cuadruplicar tokens (−16,7% de perplejidad) frente a la de un GPT-2 emparejado (−11,7%).

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Modelo | Tokens | Perplejidad de validación (bloque 512, asentada) | Relación con este modelo | Relación con GPT-2 emparejado |
|---|---:|---:|---:|---:|
| SR2-2B (este modelo) | 2,13B | 48,58 | — | 1,138× |
| SR2 (mismo modelo a 0,53B) | 0,53B | 58,32 | −16,7% | 1,206× |
| GPT-2 emparejado a 2B (G2B) | 2,13B | 42,69 | +13,8% | 1,000× |
| GPT-2 emparejado a 0,53B (W2) | 0,53B | 48,37 | +0,4% | 1,000× |

Detalle del resultado de SR2-2B: media de las tres últimas evaluaciones (48,36, 49,19, 48,21); mejor valor 47,56 en el paso 126.500; valor final 48,21. Perplejidad de validación sobre el archivo de validación de OpenWebText del propio ladder, por lo que es comparable con todos los modelos del ladder. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 76,57M parámetros en fp32 el checkpoint ocupa aproximadamente 3,1 GB (tamaño del repo), por lo que cabría en GPUs de consumo con 4-8 GB en fp32 y menos con cuantización, aunque no se documentan formatos cuantizados.
- GPU recomendadas: el autor entrenó en A100 80 GB (dos sesiones de Colab); para inferencia no se especifican GPU recomendadas.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no se documenta soporte de llama.cpp, Ollama ni GGUF.
- Opciones de despliegue: PyTorch (librería declarada); no se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: ~1,1 s por paso de entrenamiento en A100 80 GB; no se documenta latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT val, bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| SR2-2B (este modelo) | 76,57M | no disponible | 48,58 | cc-by-4.0 | Hugging Face |
| SR2 (0,53B) | 76,57M | no disponible | 58,32 | cc-by-4.0 | Hugging Face |
| GPT-2 emparejado a 2B (G2B) | 33,7M (8 capas) | no disponible | 42,69 | no disponible en la información | Hugging Face (repo del autor) |
| GPT-2 emparejado a 0,53B (W2) | 33,7M (8 capas) | no disponible | 48,37 | no disponible en la información | Hugging Face (repo del autor) |

Nota: las ratios de parámetros no constituyen una comparación de eficiencia equivalente, ya que GPT-2 tiene 33,7M parámetros y ocho capas frente a las dos de SR2-2B. No se dispone de comparación con otros modelos de la misma categoría fuera del ladder semsimula.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso comercial general, pese a la licencia CC-BY-4.0.
- Solo inglés; no hay soporte multilingüe documentado.
- Perplejidad superior a la de un GPT-2 emparejado (48,58 frente a 42,69), por lo que la calidad de generación es inferior en el mismo presupuesto de tokens.
- El hallazgo de que el paso de capa se aleja 0,92 nats del flujo continuo (frente a 0,10 a 0,53B) indica que la interpretación como flujo continuo no se sostiene al entrenar más; caveat importante para quienes repliquen el método.
- Riesgo de alucinación y sesgos: no documentados explícitamente, pero propios de un modelo entrenado solo con OpenWebText y sin RLHF/DPO.
- Longitud de contexto no disponible; el entrenamiento usó bloques de 512 tokens, lo que limita el contexto efectivo.
- Sin soporte documentado de tool calling, agentes ni cuantización; el despliegue práctico requiere PyTorch y trabajo de ingeniería adicional.
- Resultados de benchmarks declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse con cautela.
- Inestabilidad del entrenamiento documentada: la norma global del gradiente superó 1,0 en 355 de 1.593 pasos de fase estable y 448 de 910 pasos de decaimiento (máximo 15,0).

## Enlaces

- Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-2b
- Modelo predecesor SR2 (0,53B): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- GPT-2 emparejado a 2B: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-gpt2-matched-2b
- Colección 2B tokens: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-2b-training-tokens-6ad56f3d2a560dd121e59b60
- Colección Gen 3 (ladder 0,53B): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Notas companion (predicciones pre-registradas): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/Two_Billion_Token_Runs.md
- Dataset: https://huggingface.co/datasets/Skylion007/openwebtext

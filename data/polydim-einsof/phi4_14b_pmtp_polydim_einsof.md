# Polydim-Einsof/phi4_14b_PMTP_polydim_einsof

## Resumen

`phi4_14b_PMTP_polydim_einsof` es un adaptador de pesos abiertos publicado por el investigador independiente Ariel H. García Traba bajo la iniciativa POLYDIM-EINSOF (EinsofOS). Se presenta como una implementación del protocolo PMTP (Polydim Memory Transfer Protocol), que proyecta los estados ocultos del modelo base `microsoft/phi-4` sobre la variedad de Stiefel St(2048, 5120), evitando la serialización de tokens en 1D durante el razonamiento entre saltos. El autor lo describe como un mecanismo de "razonamiento latente" que opera sobre memoria binaria en coma flotante de doble precisión (FP64) en lugar de cadenas de texto.

El modelo base es Phi-4 de Microsoft, un transformer denso de 14 mil millones de parámetros con una ventana de contexto de 16 384 tokens, según la documentación pública del modelo original. Sobre él se aplica un adaptador que, según la model card, añade el parámetro `turing_depth` (0 a 50) para controlar la profundidad de iteraciones de contracción riemanniana y autocrítica adversarial. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador de proyección y no con pesos completos del modelo.

La relevancia del proyecto es discutible: se publica como investigación independiente con DOIs en Zenodo, HAL, OSF y Jxiv, pero no incluye resultados de benchmarks, evaluación empírica ni comparación con el modelo base. La model card describe métricas de latencia (44,73 ms con `turing_depth=1`) y defecto de ortogonalidad (4,26e-09), pero no hay evidencia pública de mejora en tareas de razonamiento o generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer denso (base: microsoft/phi-4); proyección sobre variedad de Stiefel St(2048, 5120) |
| Parámetros totales | 14B en el modelo base; el adaptador no declara recuento propio (repo de 0,1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información del adaptador; el modelo base Phi-4 declara 16 384 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en FP64 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_weights.safetensors`, `adapter_model.safetensors`), `adapter_config.json`, `Modelfile` para Ollama |

## Arquitectura y entrenamiento

El adaptador se describe como una matriz de proyección W en IEEE-754 FP64 que mapea el espacio latente del modelo base de dimensión 5120 a 2048, con la restricción de que las columnas resultantes sean ortonormales (variedad de Stiefel). La model card afirma un defecto máximo de ortogonalidad de 4,26e-09 y un error de norma de Neumaier inferior a 1e-15, lo que sugiere un cálculo numérico en doble precisión. No se especifica cómo se obtuvo dicha matriz: no hay información sobre datos de entrenamiento, número de tokens, función de pérdida ni proceso de ajuste.

El "protocolo Alan Turing" expone un parámetro `turing_depth` que controla el número de iteraciones de lo que el autor llama "contracción riemanniana" y "autocrítica adversarial". Los rangos declarados son: 0 (bypass identidad), 1 (reflejo rápido, una proyección isométrica), 2-20 (deliberación red-team) y 21-50 (prueba formal de teoremas y verificación antisicofántica). No se aporta ninguna descripción algorítmica de estas iteraciones, ni código de entrenamiento, ni validación independiente. El pipeline declarado en Hugging Face es `feature-extraction`, no `text-generation`, lo que es coherente con un adaptador que transforma representaciones ocultas.

## Capacidades

- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que la función prevista es transformar estados ocultos, no generar texto de forma estándar.
- Razonamiento latente: según la model card, el adaptador permite iteraciones de razonamiento en espacio continuo sin consumir tokens intermedios ("0 tokens consumidos en razonamiento inter-hop").
- Control de profundidad de razonamiento: parámetro `turing_depth` de 0 a 50 con modos declarados (bypass, reflejo rápido, deliberación, prueba profunda).
- Despliegue en Ollama: se incluye un `Modelfile` con instrucciones de sistema y temperatura calibrada a T=0,07.
- Capacidades heredadas del modelo base: al ser un adaptador sobre Phi-4, en teoría hereda generación de texto, código y matemáticas del original, pero no se documenta ni se evalúa dicha herencia.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte multilingüe: no disponible.

## Casos de uso

- Investigación en representaciones latentes: el adaptador puede usarse para estudiar si la proyección sobre la variedad de Stiefel preserva o mejora la geometría de los estados ocultos de Phi-4 en tareas de clasificación o retrieval, dado que el pipeline es `feature-extraction`.
- Experimentación con protocolos de comunicación entre agentes: el autor propone PMTP como alternativa a la serialización de texto entre pasos de un agente; un equipo podría reproducir el experimento y medir si el razonamiento inter-hop sin tokens reduce latencia o mejora la coherencia en cadenas multi-paso.
- Reproducibilidad de investigación numérica: los valores de defecto de ortogonalidad y error de Neumaier permiten verificar la implementación en FP64, útil para trabajos sobre estabilidad numérica en proyecciones de alta dimensión.
- Despliegue experimental en Ollama: el `Modelfile` incluido permite levantar el adaptador con el modelo base en una máquina local para pruebas cualitativas, siempre que se disponga de los pesos de Phi-4 y hardware suficiente.
- Estudio de antisicofancia: el modo `turing_depth` 21-50 se presenta como verificación antisicofántica; un investigador podría diseñar un protocolo para comprobar si las iteraciones reducen la adulación del modelo en preguntas con premisa falsa.
- Docencia sobre geometría diferencial aplicada: la proyección St(2048, 5120) y la contracción riemanniana son conceptos que pueden ilustrarse con este adaptador en cursos de machine learning geométrico, aunque sin validación empírica de su eficacia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas internas de latencia y precisión numérica:

| Métrica declarada | Valor |
|---|---|
| Latencia con `turing_depth=1` | 44,73 ms |
| Latencia con `turing_depth=10` | 65,15 ms |
| Defecto máximo de ortogonalidad (FP64) | 4,26e-09 |
| Error de norma de Neumaier | ≤ 1e-15 |
| Tokens consumidos en razonamiento inter-hop | 0 |

No hay datos de MMLU, HumanEval, GSM8K ni comparación con Phi-4 base u otros modelos.

## Requisitos de hardware

- VRAM para el modelo base: Phi-4 (14B) requiere aproximadamente 28 GB en FP16, 14-16 GB en cuantización de 8 bits y 8-10 GB en 4 bits, según estimaciones estándar para transformers densos de ese tamaño. El adaptador en FP64 añade una matriz de 5120×2048 en doble precisión (unos 84 MB), despreciable frente a los pesos del modelo.
- GPU recomendadas: A100 40 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 con offloading parcial o cuantización de 8 bits; RTX 3090/4080 para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 8-12 GB, aunque el adaptador FP64 puede requerir conversión a FP32/FP16 para integrarse en pipelines estándar.
- Opciones de despliegue: Ollama (se incluye `Modelfile`), Hugging Face Transformers con `peft` o carga manual del adaptador, y potencialmente vLLM o TGI si se convierte el adaptador a un formato compatible (no documentado).
- Latencia y throughput: solo se declaran latencias del adaptador (44,73 ms a profundidad 1, 65,15 ms a profundidad 10); no hay datos de throughput de generación del modelo base con el adaptador aplicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| phi4_14b_PMTP_polydim_einsof | 14B (base) + adaptador | No disponible (base: 16 384) | Apache 2.0 | Hugging Face, 0 descargas | Adaptador geométrico sobre Phi-4 |
| microsoft/phi-4 | 14B | 16 384 | MIT | Hugging Face, ampliamente usado | Transformer denso con entrenamiento en datos sintéticos y curados |
| Qwen2.5-14B | 14B | 32 768 (128K en variantes) | Apache 2.0 | Hugging Face, muy usado | Transformer denso multilingüe con tool calling |
| Llama 3.1 8B | 8B | 131 072 | Llama 3.1 Community License | Hugging Face, muy usado | Transformer denso con soporte multilingüe y tool calling |

La comparación es asimétrica: el adaptador no publica métricas de rendimiento, por lo que no puede evaluarse frente a Phi-4 base ni a alternativas. Su interés es exclusivamente de investigación geométrica, no de rendimiento en tareas estándar.

## Limitaciones y advertencias

- Ausencia total de evaluación empírica: no hay benchmarks, ni comparación con el modelo base, ni validación independiente de las afirmaciones de la model card.
- Riesgo de alucinación: al ser un adaptador sobre un LLM, hereda los riesgos del modelo base; además, las afirmaciones sobre "prueba formal de teoremas" y "verificación antisicofántica" no están respaldadas por evidencia publicada.
- Terminología no estándar: conceptos como "zero-worm", "Turing Protocol" o "PMTP" no tienen definición formal en la literatura revisada por pares; los DOIs apuntan a preprints del propio autor.
- Contexto e idiomas no documentados para el adaptador: se desconoce si la proyección afecta a la ventana de contexto o al soporte multilingüe del modelo base.
- Compatibilidad de despliegue incierta: el adaptador está en FP64 y el pipeline es `feature-extraction`; integrarlo en pipelines de generación estándar (vLLM, TGI) puede requerir conversiones no documentadas.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Phi-4 tiene su propia licencia (MIT según la información pública de Microsoft), que debe respetarse por separado.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; creado en octubre de 2026 y actualizado en noviembre de 2026, sin comunidad ni issues documentados.
- Caveat para producción: no se recomienda su uso en entornos productivos sin una evaluación independiente previa que demuestre mejoras sobre Phi-4 base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Polydim-Einsof/phi4_14b_PMTP_polydim_einsof
- Modelo base: https://huggingface.co/microsoft/phi-4
- DOI principal (Zenodo/CERN): https://doi.org/10.5281/zenodo.21136742
- DOI secundario (Zenodo/CERN): https://doi.org/10.5281/zenodo.21209973
- Preprint CNRS/HAL: https://hal.science/hal-05847496v1
- OSF: https://osf.io/za3s7
- ORCID del autor: https://orcid.org/0009-0001-2787-6067
- Archivo de papers canónicos: https://huggingface.co/datasets/Polydim-Einsof/POLYDIM-EINSOF-Canonical-Papers-V1550
- Jxiv (JST): ID 7040 (no se proporciona URL directa en la información disponible)

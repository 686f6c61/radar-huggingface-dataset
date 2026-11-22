# dimitarpg13/semsimula-ladder-owt-d384-l2-attention

## Resumen

SemSimula Ladder OWT d384 L2 (arm "attention") es una variante de investigación de un modelo de lenguaje no transformer, desarrollado por el usuario dimitarpg13 dentro de su programa SemSimula. Forma parte de la Generación 2 de una "escalera de mecanismos" (mechanism ladder): cinco modelos entrenados con idéntico presupuesto de tokens sobre OpenWebText, que difieren entre sí en exactamente un mecanismo cada uno, de modo que las diferencias de perplejidad aíslan componentes concretos por construcción. Esta variante concreta elimina el transformer y lo sustituye por un campo de intercambio (exchange field) activo sobre una arquitectura PARFLM en espacio de Fock.

El modelo se enmarca en la línea de "conservative language models": modelos de lenguaje formulados como sistemas lagrangianos con un potencial escalar, en los que la fuerza que actúa sobre cada token es el gradiente de dicho potencial. Incluye mecanismos poco habituales como registros virtuales, un canal inverso (reverse channel) y un campo de intercambio. La ficha del autor advierte que esta generación está superada y se conserva como control emparejado: los modelos fueron entrenados con las fuentes de los canales Vφ y ξ desconectadas del grafo de gradientes, lo que impedía que la pérdida llegara a tokens anteriores por esas vías.

La relevancia actual es metodológica más que de producto: sirve como referencia reproducible para estudiar el coste, en perplejidad, de prescindir de la atención transformer y de los distintos componentes del formalismo físico. Con 384 dimensiones de modelo y solo 2 capas, es un modelo pequeño de investigación, no un candidato para despliegue en producción. La perplejidad de validación declarada es 63,51 en bloques de 512 tokens, frente a 49,81 de un GPT-2 emparejado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PARFLM en espacio de Fock, no transformer y sin atención (attention-free), con campo de intercambio activo; formulación lagrangiana con potencial escalar |
| Parametros totales | no disponible (d=384, L=2; el recuento exacto no se publica en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura abandona el transformer: no hay atención multi-cabeza estándar. En su lugar se emplea un modelo de lenguaje formulado en mecánica lagrangiana con un potencial escalar, en el que la dinámica sobre los tokens se deriva de un campo de intercambio. El modelo incorpora registros virtuales (virtual registers) y un canal inverso (reverse channel), y opera en un espacio de Fock, lo que sugiere un formalismo de ocupación variable de registros. La variante "attention" mantiene activo el campo de intercambio; la variante hermana "attention_potential" lo introduce como potencial escalar, de modo que su fuerza es un gradiente.

El entrenamiento usa OpenWebText con un presupuesto estrictamente igualado: 532.480.000 tokens por brazo (32.500 pasos × 32 de batch × 512 de longitud), mismo corpus, mismo tokenizador y mismos lotes de validación para todas las variantes de la escalera. Esta generación se entrenó con las fuentes de Vφ y ξ desconectadas del grafo de gradientes, convención que el autor ha identificado como limitante: al reactivar los gradientes de las fuentes, las perplejidades bajan de forma sustancial (por ejemplo, el brazo "no-exchange" pasa de 66,98 a 53,12). No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto autorregresiva en inglés, orientada a investigación y evaluación por perplejidad.
- Modelado de lenguaje puro: no se documentan capacidades de razonamiento, matemáticas o código.
- Sin soporte declarado de tool calling ni function calling.
- Sin soporte declarado de agentes ni razonamiento multi-paso.
- Monolingüe en inglés.
- Sin capacidades multimodales (visión, audio) ni modo "thinking".
- Valor principal: servir como brazo de control aislado en un estudio de ablación de mecanismos pre-registrado.

## Casos de uso

- Estudio de ablación controlada: comparar esta variante con las otras cuatro de la escalera para medir cuánta perplejidad aporta o resta el campo de intercambio respecto a la ausencia de transformer, con presupuesto de tokens idéntico.
- Reproducción de investigación: reentrenar con gradientes de fuente activos para contrastar la hipótesis de "gradient starvation" documentada por el autor y verificar la mejora de 63,51 a valores cercanos a los de la Generación 3.
- Enseñanza de arquitecturas alternativas: ilustrar en un curso o seminario cómo se formula un modelo de lenguaje como sistema lagrangiano con potencial escalar y qué implica perder la atención.
- Validación de infraestructura de entrenamiento: al ser un modelo de 0,6 GB de repo y 2 capas, sirve para probar pipelines de entrenamiento y evaluación de perplejidad a bajo coste.
- Análisis de formulaciones energéticas: estudiar empíricamente la diferencia entre un campo de intercambio no conservativo y su versión como potencial (63,51 frente a 80,90 de perplejidad).
- Referencia para revisiones por pares: aportar una línea base pública y citable frente a la que evaluar propuestas de modelos de lenguaje no transformer.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Modelo (brazo de la escalera) | Mecanismo eliminado | Perplejidad de validación (bloque 512, asentada) | Ratio vs GPT-2 |
|---|---|---:|---:|
| GPT-2 emparejado (referencia) | la arquitectura de referencia | 49,81 | 1,000× |
| **Este modelo (arm "attention")** | el transformer | 63,51 | 1,275× |
| Fock-PARFLM, campo de intercambio como potencial | la parte no conservativa del campo | 80,90 | 1,624× |
| Fock-PARFLM sin campo de intercambio | el campo de intercambio | 66,98 | 1,345× |
| Control solo conservativo | el mecanismo de Fock (ruta registro-token) | 87,93 | 1,765× |

Brechas medidas entre brazos: GPT-2 emparejado → este modelo, +13,70 PPL (+27,5 %); este modelo → variante con potencial, +17,39 PPL (+27,4 %); este modelo → sin campo de intercambio, +3,47 PPL (+5,5 %); sin campo de intercambio → con potencial, +13,92 PPL (+20,8 %); sin campo de intercambio → control solo conservativo, +20,95 PPL (+31,3 %). El autor retira la lectura de estas dos últimas brechas como "precio" de un mecanismo, por el efecto de la desconexión de gradientes. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con d=384 y L=2 y un repo de 0,6 GB, la inferencia en fp32 requiere del orden de 1-2 GB, holgadamente dentro de cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen, e incluso en CPU para evaluación por lotes.
- Opciones de despliegue: al publicarse solo pesos PyTorch, requiere un script propio de carga; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la arquitectura no transformer impide usarlos sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemSimula Ladder OWT d384 L2 (arm attention) | d=384, L=2 (total no disponible) | no disponible (entrenado a 512) | 63,51 | CC BY 4.0 | Hugging Face, pesos PyTorch |
| SemSimula Ladder OWT d384 L2 (no-exchange) | d=384, L=2 | no disponible | 66,98 | CC BY 4.0 | Hugging Face |
| SemSimula Ladder OWT d384 L2 (attention_potential) | d=384, L=2 | no disponible | 80,90 | CC BY 4.0 | Hugging Face |
| GPT-2 emparejado (baseline del autor) | no disponible | no disponible | 49,81 | no disponible | Hugging Face |

La comparación con GPT-2 de OpenAI no es directa: el baseline citado es un GPT-2 reentrenado por el mismo autor con idéntico presupuesto de tokens, no el GPT-2 original. No se dispone de comparaciones con otros modelos no transformer de la misma escala en la información proporcionada.

## Limitaciones y advertencias

- Generación superada: el propio autor la marca como obsoleta y la conserva solo como control emparejado; no debe usarse como referencia de rendimiento del formalismo.
- Convención de entrenamiento defectuosa: las fuentes de Vφ y ξ se entrenaron desconectadas del grafo de gradientes, lo que impide el flujo de gradiente hacia tokens anteriores por esos canales y penaliza la perplejidad.
- Modelo de investigación de escala mínima (d=384, L=2): no apto para producción ni para tareas generativas reales.
- Monolingüe en inglés; sin soporte de otros idiomas.
- Riesgo de alucinación y coherencia limitada no evaluados formalmente; la perplejidad de 63,51 es alta en términos absolutos.
- Sin datos publicados sobre sesgos, seguridad o filtrado del corpus más allá de OpenWebText.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación no se recomienda su despliegue.
- Solo pesos PyTorch: sin formatos cuantizados ni integración con runtimes de inferencia habituales.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en la model-index).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo con potencial: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo con potencial y gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo con todos los caminos vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo sin campo de intercambio: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo sin campo de intercambio, gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo solo conservativo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo solo conservativo, gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Baseline GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección de la Generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota sobre el agotamiento de gradientes: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Gradient_Starvation_Investigation.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

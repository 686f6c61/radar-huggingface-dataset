# dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc

## Resumen

`semsimula-ladder-owt-d384-l2-none-norc` es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro del proyecto SemSimula. No es un transformer: es un modelo de lenguaje conservativo basado en un potencial escalar y en mecánica lagrangiana, con inferencia de memoria constante y sin mecanismo de atención. Forma parte de la Generación 2 de una "escalera de mecanismos" (mechanism ladder) en la que cinco modelos comparten corpus, tokenizador, presupuesto de tokens y lotes de validación, y difieren exactamente en un mecanismo cada uno, de modo que cada diferencia de perplejidad aísla un componente por construcción.

Esta variante concreta es el brazo de control "conservative-only": elimina el mecanismo de Fock, es decir, la ruta registro-a-token. Su perplejidad de validación medida es 87,93 en OpenWebText (bloque 512), frente a 49,81 del GPT-2 emparejado, lo que supone 1,765 veces la perplejidad del baseline. El autor advierte explícitamente que esta generación quedó superada: todos los modelos se entrenaron con las fuentes de Vφ y ξ desconectadas del grafo de gradientes, de modo que ningún gradiente de pérdida alcanzaba tokens anteriores por esos canales. El reentrenamiento con gradientes vivos cambia los resultados de forma sustancial (este mismo brazo pasa de 87,93 a 57,76).

Por tanto, el interés del modelo es metodológico y de ablación, no de producción: sirve para estudiar el coste empírico de mecanismos arquitectónicos alternativos a la atención bajo un presupuesto de cómputo estrictamente igualado. El modelo tiene 384 dimensiones de modelo, 2 capas y un repositorio de 0,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (conservative language model) no transformer, sin atención, basado en potencial escalar y mecánica lagrangiana; integración tipo BAOAB sobre variedad riemanniana con métrica de Jacobi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se indica safetensors ni GGUF |

Otros datos técnicos declarados: dimensión de modelo d=384, número de capas L=2, dataset OpenWebText, 32.500 pasos de entrenamiento con tamaño de lote 32 y bloque de 512, lo que da 532.480.000 tokens de entrenamiento por brazo.

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia Fock-PARFLM: un modelo de lenguaje formulado como sistema dinámico conservativo con un potencial escalar anisotrópico gaussiano, en el que las fuerzas derivan de un gradiente y la dinámica se integra con el esquema BAOAB (variante de splitting para dinámica de Langevin) sobre geometría riemanniana, usando geodésicas riemannianas y la métrica de Jacobi. El modelo no usa atención y no es un transformer; la inferencia tiene memoria constante. El espacio de Fock aparece como mecanismo de acoplamiento registro-a-token, y el campo de intercambio (exchange field) ξ se enruta de forma análoga a la atención, pudiendo entrar como potencial escalar para que su fuerza sea un gradiente.

En esta variante se elimina el mecanismo de Fock (la ruta registro-a-token). El entrenamiento se hizo sobre OpenWebText con 532.480.000 tokens exactos, idénticos en los cinco brazos de la escalera, mismo corpus, mismo tokenizador y mismos lotes de validación, de modo que ninguna diferencia de la tabla puede atribuirse a un presupuesto distinto. La innovación metodológica es el diseño pre-registrado: las predicciones sobre el orden de la escalera se registraron antes de la ejecución, y cualquier inversión del orden se considera un resultado. La limitación conocida de esta generación es que las fuentes de Vφ y ξ se desconectaron del grafo de gradientes para mantener cada fuerza causal, lo que impidió que el gradiente de la pérdida llegara a tokens anteriores por esos canales; el autor documenta este fenómeno como "gradient starvation" y lo corrige en la Generación 3.

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación sobre la dinámica conservativa del potencial.
- Modelado de lenguaje a nivel de token con perplejidad medible en OpenWebText.
- Inferencia con memoria constante, independiente de la longitud de la secuencia, gracias a la ausencia de atención.
- No soporta tool calling ni function calling (no se documenta ninguna capacidad de este tipo).
- No soporta uso como agente ni razonamiento multi-paso (no documentado).
- Capacidad multilingüe: únicamente inglés.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Valor como artefacto de ablación: permite aislar el efecto de un mecanismo arquitectónico concreto bajo presupuesto igualado.

## Casos de uso

- Estudio de ablación controlada: comparar este brazo con los otros cuatro de la escalera (baseline GPT-2 emparejado, exchange field on, exchange field as potential y no-exchange) para medir el coste en perplejidad de eliminar el mecanismo de Fock, con 532.480.000 tokens idénticos en todos los brazos.
- Investigación en modelos de lenguaje sin atención: servir como referencia reproducible para evaluar arquitecturas no transformer con inferencia de memoria constante en corpus estándar (OpenWebText, bloque 512).
- Reproducción de resultados pre-registrados: el diseño registra las predicciones antes de la ejecución, por lo que el modelo es útil para validar o refutar hipótesis sobre el orden de rendimiento de mecanismos físicamente informados.
- Docencia e ilustración de mecánica lagrangiana aplicada al modelado de lenguaje: el modelo materializa conceptos de potencial escalar, geodésicas riemannianas, métrica de Jacobi e integración BAOAB en un artefacto ejecutable de 0,6 GB.
- Análisis de "gradient starvation": este brazo es una de las evidencias del fenómeno por el que desconectar las fuentes de Vφ y ξ impide el flujo de gradiente hacia tokens anteriores; el autor documenta la comparación con el reentrenamiento de gradientes vivos (87,93 frente a 57,76).
- Experimentación de bajo coste en GPU de consumo: con 2 capas y d=384, el modelo es adecuado para ciclos rápidos de experimentación académica, no para cargas de producción.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index (no verificados de forma independiente):

| Modelo (brazo de la escalera) | Mecanismo eliminado | PPL validación (bloque 512) | Ratio vs GPT-2 |
|---|---|---:|---:|
| GPT-2 emparejado (baseline) | arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM, exchange field on | el transformer | 63,51 | 1,275× |
| Fock-PARFLM, exchange field as potential | la parte no conservativa del campo de intercambio | 80,90 | 1,624× |
| Fock-PARFLM, no exchange field | el campo de intercambio | 66,98 | 1,345× |
| **semsimula-ladder-owt-d384-l2-none-norc (este modelo)** | el mecanismo de Fock (ruta registro-a-token) | **87,93** | **1,765×** |

La perplejidad de este modelo es la media de las tres últimas evaluaciones de 500 pasos en bloque 512, una vez estabilizada. Diferencias medidas entre brazos: 49,81 → 63,51 (+13,70 PPL, +27,5%); 63,51 → 80,90 (+17,39 PPL, +27,4%); 63,51 → 66,98 (+3,47 PPL, +5,5%); 66,98 → 80,90 (+13,92 PPL, +20,8%). El autor retira la lectura de estas diferencias como "precio de la conservatividad" o "precio del mecanismo de Fock", porque se midieron bajo la convención de fuentes desconectadas. Con gradientes vivos, este brazo alcanza 57,76 de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2 capas, d=384 y un repositorio de 0,6 GB, la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con varios GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del repositorio (0,6 GB) y la memoria constante de inferencia.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estos runners estándar no son aplicables sin implementación propia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Capas / dimensión | Contexto | PPL OpenWebText (bloque 512) | Licencia |
|---|---|---|---|---|---|
| semsimula-ladder-owt-d384-l2-none-norc | conservativa, sin atención | 2 / 384 | no disponible | 87,93 | CC-BY-4.0 |
| semsimula-ladder-owt-d384-l2-gpt2-matched | transformer (GPT-2) | no disponible | no disponible | 49,81 | no disponible |
| semsimula-ladder-owt-d384-l2-attention | Fock-PARFLM con campo de intercambio | 2 / 384 | no disponible | 63,51 | no disponible |
| semsimula-ladder-owt-d384-l2-none | Fock-PARFLM sin campo de intercambio | 2 / 384 | no disponible | 66,98 | no disponible |
| semsimula-ladder-live-owt-d384-l2-none-norc | conservativa con gradientes vivos (Gen 3) | 2 / 384 | no disponible | 57,76 | no disponible |

La comparación relevante no es con modelos de producción de tamaño similar, sino con los otros brazos de la misma escalera, que comparten corpus, tokenizador, presupuesto de tokens y lotes de validación. Frente a alternativas comerciales o abiertas de propósito general, este modelo no es comparable en capacidades: carece de contexto documentado, de soporte multilingüe y de tool calling.

## Limitaciones y advertencias

- Modelo superado: pertenece a la Generación 2, y el autor indica que el reentrenamiento con gradientes vivos cambia sustancialmente los resultados; debe usarse la colección de Generación 3 para cualquier conclusión sobre mecanismos.
- Las perplejidades de esta generación se midieron bajo una convención de fuentes desconectadas; las lecturas de esas cifras como precio de la conservatividad o del mecanismo de Fock están retiradas por el propio autor.
- Solo inglés: no hay soporte multilingüe documentado.
- Longitud de contexto no documentada; el entrenamiento y la evaluación usan bloques de 512 tokens.
- Riesgo de alucinación: no evaluado; no se publican métricas de factualidad, sesgo o toxicidad.
- Sesgos conocidos: no documentados; el corpus es OpenWebText, con los sesgos propios de texto web filtrado por votos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- Sin soporte en runners estándar (vLLM, llama.cpp, Ollama, TGI) al no ser un transformer; requiere código PyTorch propio para la dinámica conservativa.
- Sin benchmarks más allá de la perplejidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de instrucciones.
- Los resultados de la model-index están marcados como no verificados (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Brazo con campo de intercambio activo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo con campo de intercambio como potencial: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Sonda de ruta de gradiente del brazo anterior: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo sin campo de intercambio: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Reentrenamiento con gradientes vivos de este brazo: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Reentrenamiento con gradientes vivos del brazo sin campo de intercambio: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Reentrenamiento con gradientes vivos del brazo con potencial: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Colección de Generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota sobre gradient starvation: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Gradient_Starvation_Investigation.md
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

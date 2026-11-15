# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential` es un modelo de lenguaje de investigación desarrollado por el autor independiente dimitarpg13 dentro de la familia SemSimula, un programa experimental que explora arquitecturas alternativas a los transformers basadas en mecánica lagrangiana y modelos de energía. Este modelo concreto es el brazo `attention_potential` de la generación 3 (Gen 3) de la escalera de ablación, con L=2, y constituye una variante de un modelo de lenguaje conservativo en el que todos los caminos de gradiente están activos ("live gradients") durante el entrenamiento.

El modelo resuelve un problema puramente de investigación: medir qué aporta un campo de intercambio conservativo (una interacción tipo atención escrita como potencial) sobre un modelo base sin intercambio, manteniendo idéntico presupuesto de entrenamiento, corpus y tokenizador. Con 77,4 millones de parámetros y una ventana de contexto fijada en bloques de 512 tokens, se entrena sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), lo que permite comparaciones controladas entre brazos de la escalera.

Su relevancia es metodológica más que práctica: la model card documenta de forma explícita y pre-registrada que el campo de intercambio conservativo no aporta mejora medible (el modelo es un 2,1 % peor que su gemelo sin el campo), y publica el resultado negativo junto con el análisis de salud del entrenamiento. Es un ejemplo de ciencia abierta con pre-registro y resultados negativos, útil para investigadores que estudian arquitecturas no-transformer y modelos basados en energía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (no-transformer, sin atención clásica, modelo de lenguaje conservativo con potencial escalar y campo de intercambio tipo atención) |
| Parametros totales | 77,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | bloques de 512 tokens (entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería pytorch; repo de 0,6 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Fock-PARFLM, una arquitectura no-transformer y "attention-free" que formula la interacción entre tokens como un campo de intercambio conservativo expresado mediante un potencial escalar, en lugar de la atención por producto escalar convencional. La variante `attention_potential` añade ese campo de intercambio sobre el modelo base sin intercambio, con mecanismos de "virtual registers", "reverse channel" y espacio de Fock. La generación 3 se distingue de la generación 2 en que todos los caminos de gradiente aplicables están activos (`relax_grad_path`, `vphi_grad_path` y `xi_grad_path` en `'live'`), de modo que la pérdida propaga gradiente hacia tokens anteriores a través de Vφ, de ξ y de las fuentes y el enrutado del campo de intercambio; en Gen 2 esos tres caminos estaban desconectados (detached).

El entrenamiento usa OpenWebText con un presupuesto fijo de 532.480.000 tokens (32.500 pasos, batch 32, bloque 512), idéntico al de todos los brazos Gen 2 y al GPT-2 emparejado de la comparativa, con tasa de aprendizaje constante seguida de decaimiento. La model card no documenta uso de RLHF ni DPO. El run se describe como saludable: 0 activaciones del watchdog, 0 picos, 1,4 % de clip-hit (9 de 650 pasos registrados, norma máxima 1,14, entre los pasos 20.000 y 27.500), norma de gradiente global que sube de 0,43 a 0,91 en la fase de LR constante y baja a 0,75 en el decaimiento, y 1,68 s/paso en una sesión de Colab. El resultado se pre-registró (punto 51, banda 46–56) antes del run.

## Capacidades

- Generación de texto autorregresiva en inglés, con pipeline `text-generation`.
- Modelado de lenguaje a nivel de token sobre bloques de 512 tokens.
- Razonamiento multi-paso implícito en la formulación de espacio de Fock con registros virtuales (capacidad de investigación, no validada de forma independiente).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo "thinking".
- No se documenta decodificación especulativa ni otras optimizaciones de inferencia.

## Casos de uso

- Investigación en arquitecturas no-transformer: servir como brazo de ablación controlado para estudiar el efecto de un campo de intercambio conservativo frente a un modelo sin intercambio con idéntico presupuesto de tokens y corpus.
- Reproducción de resultados negativos: el modelo permite replicar el hallazgo de que el campo de intercambio no aporta mejora medible, algo útil en publicaciones sobre modelos basados en energía y mecánica lagrangiana.
- Estudio de convenciones de gradiente: comparar Gen 2 (fuentes detached) frente a Gen 3 (todo live) para aislar el efecto de la propagación de gradiente a través de Vφ, ξ y el campo de intercambio (33,0 % de mejora en perplejidad atribuida solo a la convención de gradiente).
- Experimentos de modelado de lenguaje a pequeña escala: con 77,4 M de parámetros y bloques de 512, es viable entrenar y evaluar variantes en una única GPU de consumo o en una sesión de Colab (1,68 s/paso documentado).
- Docencia y divulgación: ejemplo reproducible de pre-registro, bandas de aceptación y análisis de salud de entrenamiento en un contexto académico.
- Base para extensiones con enrutado normalizado: la variante `-rfqk` con enrutado QK-normalizado parte de este mismo diseño y sirve como punto de comparación para estudiar el efecto del enrutado.
- No se recomienda su uso en producción para atención al cliente, generación de código ni tareas de usuario final: su perplejidad (54,21) y su tamaño lo sitúan como artefacto de investigación.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente). Perplejidad de validación en OpenWebText, bloque 512, media de las tres últimas evaluaciones de 500 pasos ("settled"):

| Modelo | PPL settled | vs GPT-2 | Parámetros |
|---|---:|---:|---:|
| Este modelo (L=2) | 54,21 | 1,088× | 77,4 M |
| Sin intercambio, Fock activo, live, L=4 (Gen 3) | 50,10 | 1,006× | 76,8 M |
| Sin intercambio, Fock activo, live, L=2 (Gen 3) | 53,12 | 1,066× | 76,8 M |
| Solo conservativo, live, L=2 (Gen 3) | 57,76 | 1,160× | 76,6 M |
| `attention_potential` con enrutado endurecido, live, L=2 (Gen 3) | 52,90 | 1,062× | 77,4 M |
| `attention_potential`, solo campo de intercambio live (Gen 2, sonda padre) | 61,11 | 1,227× | 77,4 M |
| Brazo `attention` (Gen 2, L=2) | 63,51 | 1,275× | 77,4 M |
| Brazo `attention_potential` con todo detached (Gen 2, L=2) | 80,90 | 1,624× | 77,4 M |
| `gpt2-matched` (L=8) | 49,81 | 1,000× | 33,7 M |

Detalles adicionales reportados: evaluaciones individuales 54,17 / 54,35 / 54,12; mejor 52,44 en el paso 31.000; final 54,12. En el paso 3.000: 118,14 frente a 133,74 de la sonda padre (−11,7 %) y 123,59 del modelo L=2 sin intercambio live en el mismo paso. Pre-registro: punto 51, banda 46–56; resultado 54,21, dentro de banda, pero la línea clave (superar al modelo L=2 sin intercambio en más del 2 %, es decir, ~52,1 o menos) no se cumple: es un 2,1 % peor. La métrica ω·dt mediana en la banda L=2 [3,3, 4,2] dio 2,07, un fallo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 77,4 M de parámetros, una estimación razonable en fp32 sería de ~0,3 GB de pesos más overhead de activaciones; no se documenta oficialmente.
- GPU recomendadas: no se especifican. El entrenamiento se realizó en una única sesión de Colab (1,68 s/paso), lo que sugiere que cabe en GPUs de consumo tipo T4 o superiores.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño (77,4 M de parámetros), aunque no se confirma en la model card.
- Opciones de despliegue: no se documentan (ni vLLM, ni llama.cpp, ni Ollama, ni TGI). La librería es PyTorch y el código de referencia es `model_parf_multixi.py`, no incluido en el repo de pesos.
- Latencia y throughput: no disponibles para inferencia; solo se reporta 1,68 s/paso durante el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (Gen 3, L=2) | 77,4 M | 512 | 54,21 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-live-owt-d384-l2-none` (Gen 3, L=2) | 76,8 M | 512 | 53,12 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk` (Gen 3, L=2) | 77,4 M | 512 | 52,90 | CC-BY-4.0 | Hugging Face |
| `semsimula-ladder-owt-d384-l2-gpt2-matched` (L=8) | 33,7 M | 512 | 49,81 | no disponible | Hugging Face |

La comparativa relevante es interna a la escalera SemSimula, ya que no se han identificado modelos externos equivalentes en esta categoría (no-transformer, conservativo, basado en energía) con los que contrastar. Frente al GPT-2 emparejado en presupuesto de tokens, este modelo es 1,088× peor en perplejidad con más del doble de parámetros.

## Limitaciones y advertencias

- El propio autor documenta que el campo de intercambio conservativo "no aporta nada medible": el modelo es un 2,1 % peor que su gemelo sin el campo, y la variante con enrutado corregido solo mejora un 0,4 % sobre ese gemelo, dentro del ruido de evaluación.
- El coste de la conservatividad no está medido en este trabajo; requiere reentrenar el brazo `attention` no conservativo con gradientes live.
- Modelo de investigación: no está pensado para uso en producción ni para tareas de usuario final. No se documentan evaluaciones en MMLU, HumanEval, GSM8K ni otras tareas estándar.
- Solo inglés; sin capacidades multilingües documentadas.
- Contexto limitado a bloques de 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Riesgo de alucinación no evaluado; con perplejidad de 54,21 en OpenWebText, la calidad de generación es baja en términos absolutos.
- No se documentan sesgos específicos, pero al entrenarse solo con OpenWebText hereda los sesgos de ese corpus (texto web en inglés).
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin validación de calidad, su uso comercial no es recomendable.
- No se documentan formatos de cuantización ni herramientas de despliegue estándar, lo que dificulta su integración en stacks de producción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Colección Gen 3 (live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Gemelo Gen 2 del mismo brazo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Modelo sin intercambio, L=4 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Modelo sin intercambio, L=2 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Solo conservativo, live (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- `attention_potential` con enrutado endurecido (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Sonda padre Gen 2 (solo campo de intercambio live): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo `attention` (Gen 2, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- GPT-2 emparejado en presupuesto: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

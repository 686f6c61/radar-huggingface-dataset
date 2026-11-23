# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none

## Resumen

semsimula-ladder-live-owt-d384-l2-none es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13 dentro de su programa "SemSimula". No es un transformer: se trata de un modelo de lenguaje conservativo (conservative language model) basado en mecánica lagrangiana, con un potencial escalar y dinámica de integración tipo BAOAB, que prescinde por completo del mecanismo de atención. La variante aquí descrita pertenece a la "Generación 3" del programa, en la que todos los caminos de gradiente aplicables están activos ("live gradients"), a diferencia de su gemelo de Generación 2, que desconectaba las fuentes de gradiente.

El modelo tiene 76,8 millones de parámetros, una dimensión de modelo de 384 y una profundidad L=2 (dos niveles en la jerarquía de registros virtuales tipo Fock). Se entrenó sobre OpenWebText con un presupuesto fijo de 532.480.000 tokens (32.500 pasos × 32 de batch × 512 de bloque), idéntico al de todos los brazos de la escalera experimental y al GPT-2 emparejado usado como referencia. Su perplexity de validación asentada es 53,12 en bloques de 512, lo que supone una mejora del 20,7 % respecto a su gemelo de Generación 2 (66,98) y lo sitúa un 6,6 % por encima del GPT-2 emparejado (49,81).

Su relevancia es fundamentalmente científica: forma parte de un estudio de ablación de mecanismos pre-registrado que compara brazos con y sin canal de retorno, con y sin campo de intercambio, y a distintas profundidades, todo con presupuesto de tokens igualado. No está pensado como modelo de producción, sino como evidencia empírica sobre arquitecturas alternativas sin atención y con memoria de inferencia constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (modelo de lenguaje conservativo con potencial escalar, registros virtuales tipo Fock, canal de retorno y dinámica BAOAB; sin atención) |
| Parametros totales | 76,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (librería pytorch; repositorio de 0,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo no transformer y sin atención. Cada token se trata como una partícula en un espacio de estados, y la fuerza que actúa sobre él es el gradiente de un potencial escalar Vθ(ξ, h) + Vφ evaluado en las coordenadas del propio token con el contexto fijo, más la fuerza registro-a-token del canal de retorno. El potencial Vφ es de tipo gaussiano anisotrópico y los canales de contexto ξ se construyen a partir de estados vivos. La dinámica de integración emplea el esquema BAOAB (variante de dinámica molecular tipo Langevin), y el modelo incorpora geometría riemanniana con métrica de Jacobi. La estructura de registros virtuales sigue un formalismo de espacio de Fock con profundidad L=2. La inferencia tiene memoria constante por construcción.

El entrenamiento usó OpenWebText con exactamente 532.480.000 tokens (32.500 pasos, batch 32, bloque 512), el mismo corpus, tokenizer y lotes de validación que todos los brazos de la escalera y que el GPT-2 emparejado. La innovación clave de esta Generación 3 es la convención de gradientes "live": en el gemelo de Generación 2 las fuentes de Vφ y de ξ se desconectaban, de modo que los tokens anteriores nunca se entrenaban como contexto; aquí ambos caminos son tensores vivos. El autor verificó antes del entrenamiento que el pase forward es bit-idéntico (máx. |Δlogit| = 0) y que el gradiente desde un paso de capa hacia tokens anteriores pasa de exactamente 0 a no nulo. El recuento de parámetros es idéntico al del gemelo de Generación 2. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto autorregresiva en inglés, con perplejidad de validación de 53,12 en OpenWebText (bloques de 512).
- Modelado de lenguaje sin atención con memoria de inferencia constante, lo que en principio permite secuencias largas sin crecimiento del coste de memoria.
- Razonamiento y código: no se han documentado capacidades específicas en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: modelo de investigación para ablación de mecanismos (canal de retorno, campo de intercambio, profundidad, convención de gradientes), con resultados pre-registrados.

## Casos de uso

- Investigación en arquitecturas sin atención: sirve como brazo de control en estudios comparativos de mecanismos (canal de retorno activo frente a desactivado, gradientes vivos frente a desconectados) con presupuesto de tokens igualado, lo que permite atribuir diferencias de perplejidad al mecanismo y no al entrenamiento.
- Reproducción de estudios pre-registrados: el modelo documenta predicciones congeladas antes de la ejecución (punto 53, banda 50–57, inercia de Vφ, mediana de ω·dt), útil para validar metodologías de pre-registro en aprendizaje automático.
- Experimentos de dinámica molecular aplicada al lenguaje: la integración BAOAB y la métrica de Jacobi permiten estudiar el efecto de distintos integradores y potenciales sobre la calidad del modelado, reutilizando el código `model_parf_multixi.py`.
- Docencia e investigación sobre modelos basados en energía: su naturaleza de modelo basado en energía con potencial escalar lo hace adecuado para ilustrar alternativas a la atención en cursos avanzados.
- Inferencia con restricciones de memoria: al tener memoria constante, puede desplegarse en entornos donde el coste de memoria de la atención sería prohibitivo, aunque su calidad (PPL 53) limita su uso a experimentación.
- Ablación de profundidad: comparado con su variante L=4 (PPL 50,10), permite cuantificar el rendimiento marginal de la profundidad a coste de 1,9× por paso (3,12 frente a 1,64 s/paso).

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre OpenWebText, split de validación:

| Modelo | PPL asentada | vs. este modelo | vs. GPT-2 | Parámetros |
|---|---:|---:|---:|---:|
| Este modelo (L=2, Gen 3) | 53,12 | — | 1,066× | 76,8 M |
| no-exchange, live gradients, L=4 (Gen 3) | 50,10 | +6,0 % | 1,006× | 76,8 M |
| attention_potential, todo live (Gen 3, L=2) | 54,21 | −2,0 % | 1,088× | 77,4 M |
| attention_potential con routing endurecido (Gen 3, L=2) | 52,90 | +0,4 % | 1,062× | 77,4 M |
| conservative-only, live gradients (Gen 3, L=2) | 57,76 | −8,0 % | 1,160× | 76,6 M |
| attention_potential, campo de intercambio live (Gen 2, L=2) | 61,11 | −13,1 % | 1,227× | 77,4 M |
| atención (Gen 2, L=2) | 63,51 | −16,4 % | 1,275× | 77,4 M |
| no-exchange, fuentes desconectadas (Gen 2, L=2) | 66,98 | −20,7 % | 1,345× | 76,8 M |
| gpt2-matched (L=8) | 49,81 | +6,6 % | 1,000× | 33,7 M |

Detalles del run: la PPL asentada es la media de las tres últimas evaluaciones (53,01; 53,29; 53,07); mejor valor 51,27 en el paso 31.000; final 53,07. En el paso 3.000: 123,59 frente a 140,61 del gemelo de Gen 2 (−12,1 %). Salud del entrenamiento: 0 watchdog, 0 picos, 0,2 % de clip-hit (1 de 650 pasos registrados, norma máxima 1,01); una sesión de Colab, ejecución nueva, 1,64 s/paso. El modelo L=4 cuesta 1,9× por paso (3,12 frente a 1,64 s/paso).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 76,8 M de parámetros, los pesos en fp32 ocuparían aproximadamente 0,3 GB, lo que sugiere que cabría en cualquier GPU de consumo, pero este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible. El entrenamiento se ejecutó en una sesión de Colab, lo que indica que el modelo entrena en hardware de consumo o de gama media.
- GPU de consumo: probablemente sí, dado el tamaño (76,8 M de parámetros) y el uso de Colab, pero no hay confirmación explícita.
- Opciones de despliegue: el modelo usa la librería `pytorch` y el archivo `model_parf_multixi.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,64 s/paso durante el entrenamiento (batch 32, bloque 512) en una sesión de Colab; no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| semsimula-ladder-live-owt-d384-l2-none | 76,8 M | no disponible (bloques de 512) | 53,12 | cc-by-4.0 | Hugging Face |
| semsimula-ladder-live-owt-d384-l4-none | 76,8 M | no disponible (bloques de 512) | 50,10 | cc-by-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-gpt2-matched | 33,7 M | 512 (GPT-2) | 49,81 | cc-by-4.0 | Hugging Face |
| GPT-2 (referencia del autor) | 124 M | 1.024 | no reportada en la información | MIT | Hugging Face |

La comparación relevante es interna al programa: el modelo L=4 mejora un 5,7 % a coste de 1,9× por paso, y el GPT-2 emparejado (33,7 M) supera a este modelo en un 6,6 % con menos de la mitad de parámetros. No se dispone de comparaciones con otros modelos de la misma categoría (no transformers, sin atención) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su licencia CC BY 4.0 permite uso comercial con atribución, pero no hay garantías de calidad.
- Solo inglés: la model card declara únicamente el idioma `en`.
- Riesgo de alucinación: no evaluado en la información disponible; con una perplejidad de 53 en OpenWebText, la calidad de generación es limitada.
- Contexto: no se documenta una longitud de contexto máxima; las evaluaciones usan bloques de 512 tokens.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Benchmarks no verificados: todos los resultados están marcados como `verified: false` y proceden del propio autor.
- Resultados pre-registrados: el autor declara aciertos en sus predicciones, pero no hay replicación independiente.
- Cuantización y formatos de pesos: no documentados, lo que dificulta su integración en stacks estándar.
- Dependencia de código propio (`model_parf_multixi.py`): no es compatible directamente con las herramientas habituales de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Gemelo de Generación 2 (no-exchange): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Variante L=4 de Generación 3: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Variante attention_potential (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Variante attention_potential con routing endurecido: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- Variante conservative-only: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Variante attention_potential con campo de intercambio live (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo de atención (Gen 2, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección de Generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

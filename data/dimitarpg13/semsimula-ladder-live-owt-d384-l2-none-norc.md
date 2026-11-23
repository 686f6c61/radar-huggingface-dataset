# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc` es un modelo de lenguaje de investigación desarrollado por el usuario de Hugging Face `dimitarpg13`, perteneciente a la familia SemSimula, que explora una alternativa no-transformer y sin atención al modelado de lenguaje mediante mecánica lagrangiana conservativa. El modelo trata cada token como una partícula en un espacio de Fock y define las interacciones a través de potenciales escalares (Vθ, Vφ) y canales de contexto (ξ), en lugar de la atención por producto punto. Esta variante concreta ("conservative-only, live gradients, Gen 3") es un brazo de un estudio de ablación pre-registrado ("ladder study") sobre OpenWebText.

La relevancia de esta ficha radica en su carácter experimental: no es un modelo de producción, sino una pieza de un programa de investigación que compara convenciones de gradiente y mecanismos físicos bajo presupuestos de cómputo idénticos. La Generación 3 introduce gradientes "vivos" que permiten que la pérdida fluya hacia tokens anteriores a través de Vφ y ξ, algo que en la Generación 2 estaba detachado. El resultado declarado es una perplejidad de validación de 57,76 en OpenWebText (bloque 512), una mejora del 34,3% frente a su gemelo de Generación 2.

El modelo tiene 0,6 GB de pesos, usa un vocabulario y tokenizer compatibles con GPT-2, y está entrenado con exactamente 532.480.000 tokens, el mismo presupuesto que el resto de brazos del estudio. Su arquitectura es attention-free y de memoria constante en inferencia, lo que lo convierte en un objeto de estudio interesante para quienes investigan alternativas a la atención, aunque su licencia CC-BY-4.0 y su naturaleza de investigación limitan su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conservative language model (no-transformer, attention-free), basado en mecánica lagrangiana con potencial escalar y espacio de Fock |
| Parametros totales | no disponible (repo de 0,6 GB; dimensión d384, L=2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado a bloque 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch; formato exacto no disponible) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo ("conservative language model") que abandona el mecanismo de atención transformer. Cada token se modela como una partícula en un espacio de Fock y la dinámica se define mediante un potencial escalar total Vθ(ξ, h) + Vφ, donde ξ representa canales de contexto y h el estado del token. La fuerza sobre cada token es el gradiente de ese potencial en sus propias coordenadas con el contexto fijo, lo que da lugar a un esquema "fully conservative". El modelo usa potencial gaussiano anisotrópico, integración BAOAB (con "cfc") y geometría riemanniana con geodésicas y métrica de Jacobi. La inferencia es de memoria constante por no requerir atención sobre toda la secuencia.

El entrenamiento se realizó sobre OpenWebText (Skylion007/openwebtext) con un presupuesto fijo de 532.480.000 tokens (32.500 pasos × 32 × 512), idéntico al de todos los brazos del estudio y al GPT-2 emparejado. La innovación de esta Generación 3 es la convención de gradiente: `vphi_grad_path='live'` y `xi_grad_path='live'` en `model_parf_multixi.py`, de modo que la pérdida alcanza tokens anteriores a través de Vφ (como fuentes de pares) y ξ (canales de contexto). En Generación 2 esas fuentes estaban detachadas y los tokens anteriores nunca se entrenaban como contexto. El autor verificó sobre el checkpoint gemelo de Gen 2 que el forward es bit-idéntico (max |Δlogit| = 0) y que el gradiente de un token hacia tokens anteriores pasa de exactamente 0 a no nulo. No se menciona RLHF ni DPO; el entrenamiento es de modelado de lenguaje autorregresivo estándar con esta convención de gradientes.

## Capacidades

- Generación de texto autorregresiva en inglés, con modelado de lenguaje a nivel de token sobre OpenWebText.
- Razonamiento de contexto a través de canales ξ y potenciales Vφ, con gradientes que ahora entrenan tokens anteriores como contexto.
- Inferencia de memoria constante: al ser attention-free, el coste de memoria no crece con la longitud de la secuencia (según la model card).
- Capacidad de "settling" o refinamiento iterativo: el modelo puede refinar sus predicciones mediante pasos adicionales, aunque el autor reporta que este modelo empeora un +143% al refinar a 1,5× los pasos.
- Monitor de causalidad SCAF: se verifica que la perturbación futura es exactamente 0 en siete auditorías (5k a 30k, 32.5k), con "leak tax" ≤ 2,8e-4.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo "thinking". El modelo es exclusivamente de investigación en generación de texto.

## Casos de uso

- Investigación sobre alternativas a la atención: el modelo sirve como banco de pruebas controlado para estudiar si una dinámica conservativa con potenciales escalares puede competir con transformers bajo presupuesto de tokens idéntico; su perplejidad de 57,76 frente a 49,81 del GPT-2 emparejado permite cuantificar la brecha.
- Estudio de convenciones de gradiente: al ser el brazo "live gradients" de un ladder pre-registrado, se usa para aislar el efecto de permitir que la pérdida fluya a tokens anteriores a través de Vφ y ξ, comparándolo con su gemelo de Gen 2 (87,93 de perplejidad).
- Ablación de mecanismos físicos: permite medir cuánto aporta el mecanismo de Fock (8,0% según el autor) y a qué coste (Vφ se vuelve inerte y el refinamiento empeora nueve veces más), útil para quienes diseñan modelos inspirados en física.
- Benchmarking de inferencia de memoria constante: adecuado para experimentos que comparan el coste de memoria de modelos attention-free frente a transformers en secuencias largas, aunque la evaluación publicada es a bloque 512.
- Reproducibilidad de estudios pre-registrados: el modelo documenta predicciones congeladas (punto 67, banda 60–79) y resultados reales (57,76), lo que lo hace útil como ejemplo de metodología de investigación reproducible en IA.
- Docencia y divulgación: ilustra de forma concreta cómo se puede formular un modelo de lenguaje como sistema dinámico conservativo, con métricas de salud de entrenamiento (0 watchdog, 0 spikes, 0,6% clip-hit).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Perplejidad de validación (OpenWebText, bloque 512, settled) | vs GPT-2 |
|---|---:|---:|
| gpt2-matched | 49,81 | 1,000× |
| no-exchange, Fock on, L=4, live gradients (Gen 3) | 50,10 | 1,006× |
| no-exchange, Fock on, L=2, live gradients (Gen 3) | 53,12 | 1,066× |
| attention_potential, Fock on, L=2, todo live (Gen 3) | 54,21 | 1,088× |
| **este modelo** | **57,76** | **1,160×** |
| attention_potential, live exchange field (Gen 2 probe) | 61,11 | 1,227× |
| attention (Gen 2) | 63,51 | 1,275× |
| no-exchange (Gen 2, Fock on) | 66,98 | 1,345× |
| conservative-only, gemelo Gen 2 (mismo forward, fuentes detachadas) | 87,93 | 1,765× |

Notas del autor: "settled" es la media de las tres últimas evaluaciones (58,39; 57,54; 57,35); el mejor y final fue 57,35 en el paso 32.500, y la ejecución seguía mejorando al terminar. En el paso 3.000, este modelo marcaba 127,73 frente a 158,09 del gemelo Gen 2 (−19,2%). La pre-registración apuntaba a 67 (banda 60–79) y el resultado real fue 57,76, un fallo por el lado bueno. Salud de la ejecución: 0 watchdog, 0 spikes, 0,6% de clip-hit (4 de 650 pasos registrados, norma máxima 2,19) frente al 2,6% del gemelo Gen 2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,6 GB, por lo que en fp32 los pesos caben holgadamente en cualquier GPU consumer moderna (menos de 1 GB solo para pesos, más overhead de activaciones).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con ≥ 4 GB de VRAM debería poder ejecutar el modelo, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño del repo (0,6 GB) y la inferencia de memoria constante.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. Al ser una arquitectura no-transformer con código propio (`model_parf_multixi.py`), el despliegue requeriría el código del autor y no los runners estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **este modelo** | no disponible (d384, L=2) | no disponible (evaluado a 512) | 57,76 | CC-BY-4.0 | Hugging Face |
| gpt2-matched (mismo presupuesto) | ~124M (GPT-2 small, según el nombre) | 1.024 | 49,81 | no disponible en esta ficha | Hugging Face |
| no-exchange, Fock on, L=2, live (Gen 3) | no disponible | no disponible | 53,12 | CC-BY-4.0 | Hugging Face |
| gemelo Gen 2 conservative-only | no disponible | no disponible | 87,93 | CC-BY-4.0 | Hugging Face |

La comparación relevante es interna al estudio: el GPT-2 emparejado en presupuesto de tokens supera a este modelo (49,81 frente a 57,76), mientras que el gemelo de Generación 2 con el mismo forward pero gradientes detachados queda muy por detrás (87,93). No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no está pensado para producción ni para uso comercial directo, pese a la licencia CC-BY-4.0, que permite uso comercial con atribución.
- Solo inglés: el modelo está entrenado y evaluado únicamente en OpenWebText en inglés; no hay soporte multilingüe documentado.
- Contexto limitado en la evaluación: los resultados publicados son a bloque 512; no se documenta la longitud máxima de contexto soportada.
- Rendimiento inferior a GPT-2 emparejado: 57,76 frente a 49,81 de perplejidad, una brecha del 16,0% en la métrica declarada.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo pequeño entrenado en un corpus web, es esperable un riesgo alto, pero no hay datos concretos.
- Refinamiento iterativo problemático: el autor reporta que el refinamiento empeora un +143% a 1,5× los pasos, lo que limita el "settling" como técnica de mejora en inferencia.
- Dependencia de código propio: al ser una arquitectura no-transformer, no es compatible con los runners estándar (vLLM, llama.cpp, Ollama, TGI) sin adaptación.
- Benchmarks no verificados: los resultados de la model card están marcados como `verified: false` y proceden del propio autor.
- Sesgos: no documentados; el corpus OpenWebText hereda los sesgos de la web filtrada por Reddit.
- El modelo seguía mejorando al final del entrenamiento (57,35 en el último paso), por lo que el resultado "settled" puede no reflejar su mejor estado alcanzable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Gemelo Gen 2 (mismo forward, fuentes detachadas): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo no-exchange, Fock on, L=2, live (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo no-exchange, Fock on, L=4, live (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Brazo attention_potential, Fock on, L=2, todo live (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo attention_potential, live exchange field (Gen 2 probe): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo attention (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo no-exchange (Gen 2, Fock on): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo gpt2-matched: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Gen 3 (live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

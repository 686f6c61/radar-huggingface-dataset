# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc` es un modelo de lenguaje de investigación publicado por el usuario de HuggingFace `dimitarpg13` dentro de la familia SemSimula, un programa experimental que explora modelos de lenguaje "conservativos": en lugar de atención y de una arquitectura transformer, el modelo define un potencial escalar `Vθ(ξ, h) + Vφ` y genera cada token como un paso de dinámica lagrangiana bajo la fuerza que dicho potencial ejerce en las coordenadas del token. Esta ficha corresponde a un brazo concreto ("conservative-only", sin mecanismo de Fock, configuración L=2, d=384) de la tercera generación del proyecto, que se distingue de la generación anterior por mantener "vivos" (live) los caminos de gradiente de `Vφ` y de los canales de contexto ξ.

El modelo entrena sobre OpenWebText con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × batch 32 × bloque de 512), el mismo que todos los brazos de la familia y que un GPT-2 de referencia ajustado con idéntico presupuesto. Su resultado principal es una perplejidad de validación de 57,76 en bloques de 512 tokens, un 34,3 % mejor que su gemelo de la generación 2 (87,93) pese a tener exactamente el mismo forward pass: la única diferencia es la convención de gradiente. Frente al GPT-2 de referencia (49,81) queda un 16,0 % por encima.

Su interés ahora es metodológico más que de producto: es un estudio de ablación pre-registrado, con controles de causalidad y de salud del entrenamiento, sobre si una arquitectura sin atención puede acercarse a un transformer pequeño con el mismo cómputo. No es un modelo para producción: es un checkpoint de investigación en inglés, sin ajuste por instrucciones y sin evaluaciones de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based, physics-informed), no transformer y sin atención; fuerza = gradiente de un potencial escalar `Vθ(ξ, h) + Vφ`; integrador BAOAB con formulación CfC; potencial gaussiano anisotrópico |
| Parámetros totales | no disponible (el autor no publica el recuento; el repo pesa 0,6 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; entrenamiento y evaluación con bloques de 512 tokens |
| Tipos de cuantización | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se indica safetensors ni GGUF en la información disponible |
| Configuración del brazo | d384 (dimensión 384), L=2, sin mecanismo de Fock, `vphi_grad_path='live'`, `xi_grad_path='live'` |
| Dataset de entrenamiento | Skylion007/openwebtext |
| Presupuesto de entrenamiento | 532.480.000 tokens (32.500 pasos, batch 32, bloque 512) |
| Descargas / likes | 871 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura sustituye el bloque transformer por un sistema dinámico: cada token se mueve bajo la fuerza que deriva de un potencial escalar compuesto por dos términos (`Vθ`, que depende de los canales de contexto ξ y del estado oculto h, y `Vφ`, que actúa como potencial de pares) más el término ξ que conforma los canales de contexto. La integración se realiza con BAOAB, un esquema de dinámica molecular, y el potencial es de tipo gaussiano anisotrópico, con tratamiento geométrico riemanniano (geodésicas y métrica de Jacobi) en la formulación general del proyecto. El modelo es explícitamente "attention-free", sin mecanismo de atención en ningún punto, y declara inferencia de memoria constante, lo que en la práctica evita el crecimiento cuadrático de KV cache de un transformer.

Este brazo concreto pertenece a la tercera generación y su cambio respecto al gemelo de generación 2 es únicamente el paso hacia atrás: `Vφ` y ξ se construyen ahora a partir de tensores vivos, de modo que el gradiente de la pérdida llega a tokens anteriores (antes estaban desconectados y esos tokens nunca se entrenaban como contexto). El autor verificó, sobre el checkpoint de generación 2 y antes de entrenar, que el forward pass es bit-idéntico (máx. |Δlogit| = 0) y que el gradiente de un token hacia tokens anteriores pasa de exactamente 0 a distinto de cero. No se documenta en la información disponible el uso de RLHF, DPO ni ningún ajuste posterior al preentrenamiento; el dataset es OpenWebText, con el mismo tokenizador y los mismos lotes de validación que el resto de brazos y que el GPT-2 de referencia, de modo que cualquier diferencia de perplejidad es atribuible al modelo y no al presupuesto.

## Capacidades

- Generación de texto autorregresiva en inglés, entrenada como modelo de lenguaje puro sobre OpenWebText.
- Modelado de dependencias de contexto largo mediante canales ξ en lugar de atención, con memoria de inferencia constante.
- No soporta tool calling ni function calling: no hay plantilla de chat ni formato de herramientas documentado.
- No se documentan capacidades de agente, razonamiento multi-paso guiado, matemáticas o código; el entrenamiento es exclusivamente de modelado de lenguaje sobre texto web.
- Sin capacidades multimodales: no hay visión, audio ni entrada de imágenes.
- Monolingüe en inglés.
- No dispone de modo "thinking" ni de decodificación especulativa documentada.
- Valor secundario como objeto de estudio: el checkpoint es reproducible y comparable con una escalera de variantes (Fock on/off, attention potential, L=2/L=4) publicadas por el mismo autor.

## Casos de uso

- Estudio de ablación controlada: sirve para medir el efecto aislado de la convención de gradiente en un modelo sin atención, comparando su 57,76 de perplejidad con el 87,93 de su gemelo de generación 2 con forward pass idéntico. Es su uso principal y el motivo por el que se publicó.
- Reproducción de experimentos de física informada en NLP: el código y las dependencias declaradas (`model_parf_multixi.py`, integrador BAOAB, potencial gaussiano anisotrópico) permiten reentrenar el brazo con el mismo presupuesto de 532,48 M tokens y verificar la curva de perplejidad publicada.
- Investigación sobre eficiencia de memoria en inferencia: al ser libre de atención, se puede usar como banco de pruebas para medir latencia y consumo de memoria con secuencias largas frente a un transformer de tamaño similar, sin KV cache que escale con la longitud.
- Docencia y divulgación: un modelo pequeño (repo de 0,6 GB) que cabe en cualquier portátil permite ilustrar dinámica lagrangiana aplicada a generación de texto sin infraestructura de GPU grande.
- Pruebas de integración de pipelines de `text-generation`: su tamaño reducido y su licencia permisiva lo hacen cómodo como modelo de relleno para validar servidores de inferencia (endpoints de HuggingFace, `transformers` con `trust_remote_code`, colas de evaluación) antes de pasar a modelos reales.
- Análisis de causalidad y fugas de información: el autor publica un monitor de fugas (SCAF) con siete auditorías limpias y una "leak tax" ≤ 2,8e-4; el checkpoint puede reutilizarse como caso de test para herramientas de detección de fuga de información futura en modelos autorregresivos.
- Generación de texto sintético de baja exigencia para pruebas de estrés de sistemas downstream (tokenizadores, filtros, contadores), donde la calidad lingüística no es el criterio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (perplejidad de validación sobre OpenWebText, bloques de 512, media de las tres últimas evaluaciones de 500 pasos; `verified: false`):

| Modelo | Perplejidad (menor es mejor) | Diferencia frente a este modelo | Frente a GPT-2 de referencia |
|---|---:|---:|---:|
| GPT-2 ajustado al mismo presupuesto (gpt2-matched) | 49,81 | +16,0 % | 1,000× |
| SemSimula Gen 3, Fock on, L=4, live | 50,10 | +15,3 % | 1,006× |
| SemSimula Gen 3, Fock on, L=2, live | 53,12 | +8,7 % | 1,066× |
| SemSimula Gen 3, attention potential, Fock on, L=2, live | 54,21 | +6,5 % | 1,088× |
| **Este modelo** (conservative-only, L=2, live) | **57,76** | — | **1,160×** |
| SemSimula Gen 2, attention potential, exchange field live | 61,11 | −5,5 % | 1,227× |
| SemSimula Gen 2, arm attention | 63,51 | −9,1 % | 1,275× |
| SemSimula Gen 2, no-exchange con Fock on | 66,98 | −13,8 % | 1,345× |
| SemSimula Gen 2, conservative-only (gemelo, fuentes detached) | 87,93 | −34,3 % | 1,765× |

Detalles adicionales aportados por el autor:

| Métrica | Valor |
|---|---|
| Perplejidad "settled" | 57,76 (evals 58,39 / 57,54 / 57,35; mejor y final 57,35 en el paso 32.500) |
| Perplejidad en el paso 3.000 | 127,73 (frente a 158,09 del gemelo Gen 2, −19,2 %) |
| Pre-registro | punto 67, banda 60–79, congelado en el paso 3.000; real 57,76 (mejor de lo previsto) |
| Salud del entrenamiento | 0 eventos de watchdog, 0 picos, 0,6 % de clip-hit (4 de 650 pasos, norma máxima 2,19) frente a 2,6 % del gemelo |
| Monitor de causalidad (SCAF) | limpio en las siete auditorías (5k a 30k y 32,5k); perturbación futura exactamente 0; leak tax ≤ 2,8e-4 |
| MMLU, HumanEval, GSM8K | no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,6 GB. En fp32, con activaciones y overhead del runtime, es razonable esperar menos de 2 GB; en fp16/bf16, alrededor de 1 GB. Son estimaciones a partir del tamaño del repo, no cifras publicadas por el autor.
- Número de parámetros: no publicado. El tamaño del repo (0,6 GB) y la configuración d384/L2 sugieren un modelo del orden de 10^8 parámetros o menos; conviene verificar el checkpoint antes de dimensionar infraestructura.
- GPU recomendadas: cualquier GPU consumer reciente sirve (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090); también Tesla T4 y, por tamaño, CPU. No hay motivo para usar A100/H100 salvo por paralelismo de experimentos.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch es la vía natural (`library_name: pytorch`, pipeline `text-generation`). No hay versiones GGUF, por lo que llama.cpp/Ollama requerirían conversión manual. vLLM y TGI no están validados para esta arquitectura sin atención y con código de modelo propio; habría que portar el modelo.
- Memoria constante en inferencia: el autor la declara explícitamente como propiedad de la arquitectura, lo que significa que la memoria no crece con la longitud de secuencia como un KV cache.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad OpenWebText (bloques 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SemSimula conservative-only, L=2, live) | no disponible | 512 en entrenamiento/eval | 57,76 | CC-BY-4.0 | Pesos en HuggingFace (PyTorch) |
| SemSimula Gen 3, Fock on, L=4, live | no disponible | 512 | 50,10 | CC-BY-4.0 (según familia) | Pesos en HuggingFace |
| SemSimula Gen 2, conservative-only (gemelo) | no disponible | 512 | 87,93 | CC-BY-4.0 | Pesos en HuggingFace |
| GPT-2 ajustado al mismo presupuesto (referencia del autor) | ~124 M (GPT-2 small) | 1.024 | 49,81 | MIT (GPT-2) | Público |

La comparación relevante no es de capacidades sino de mecanismo: la familia SemSimula se mide contra un GPT-2 pequeño entrenado con exactamente los mismos 532,48 M tokens, el mismo corpus, el mismo tokenizador y los mismos lotes de validación. Con esos controles, el mejor brazo de la familia (L=4 con mecanismo de Fock) queda un 0,6 % por encima de GPT-2, mientras que este brazo queda un 16,0 % por encima. No se dispone de comparaciones con otras familias no transformer (Mamba, RWKV, Hyena) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: sin ajuste por instrucciones, sin plantilla de chat y sin evaluación de seguridad, alineación ni toxicidad.
- Perplejidad alta en términos absolutos (57,76): la calidad del texto generado será claramente inferior a la de transformers pequeños ya establecidos, y no se han publicado evaluaciones de calidad generativa.
- Solo inglés. No hay evidencia de comportamiento multilingüe, y el castellano queda fuera del alcance declarado.
- Longitud de contexto no documentada: el modelo se entrenó y evalúa con bloques de 512 tokens; no hay garantías más allá de esa longitud.
- Riesgo de alucinación: no evaluado. Al ser un modelo de lenguaje puro sobre texto web, no hay ningún mecanismo de verificación ni de abstención.
- Sesgos: no evaluados en la información disponible. OpenWebText es un corpus web con los sesgos habituales de ese tipo de datos.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación conviene revisar los términos de los datos de origen (OpenWebText) antes de explotarlo.
- Caveat técnico relevante: con el mecanismo de Fock activo, el autor reporta que `Vφ` se vuelve inerte (su contribución al paso es −0,0002 frente a −0,291 en este brazo) y que el refinamiento empeora nueve veces más (+1.274 % a 1,5× los pasos, frente a +143 % aquí). Es una advertencia sobre los compromisos internos de la familia, no sobre este checkpoint.
- Dependencia de código propio (`model_parf_multixi.py`): requiere `trust_remote_code` y revisión del código antes de ejecutarlo.
- Los benchmarks están marcados como `verified: false`: proceden del autor y no han sido replicados de forma independiente.
- El entrenamiento seguía mejorando al terminar (57,35 en el último paso frente a 57,76 de media): la perplejidad final no es un óptimo convergido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Colección Gen 3 (live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Gemelo Gen 2 (mismo forward pass, fuentes detached): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Gen 3, Fock on, L=2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Gen 3, Fock on, L=4: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Gen 3, attention potential, Fock on, L=2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Gen 2, attention potential con exchange field live: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Gen 2, brazo attention: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Gen 2, brazo no-exchange: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- GPT-2 de referencia con presupuesto igualado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Variante relacionada (`...-pm16-pmx16-sr2`), citada en el listado de HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
- Listado de modelos de generación de texto en HuggingFace: https://huggingface.co/models?pipeline_tag=text-generation&sort=created
- The Wider Lens (índice de investigación que lista el modelo): https://thewiderlens.info/

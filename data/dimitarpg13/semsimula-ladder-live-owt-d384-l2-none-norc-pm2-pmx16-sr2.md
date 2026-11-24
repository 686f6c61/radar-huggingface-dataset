# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2

## Resumen

`semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2` es un modelo de lenguaje de investigación desarrollado por el usuario `dimitarpg13`, perteneciente a la familia "Semantic Simulation" (Semsimula) y, en concreto, a su tercera generación ("Gen 3"). No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar, con dinámica de segundo orden inspirada en mecánica lagrangiana y geometría riemanniana. El modelo forma parte de un estudio pre-registrado de ablación de mecanismos ("ladder study") que compara, par a par, variantes de primer y segundo orden entrenadas con el mismo presupuesto de tokens.

Esta variante concreta incorpora 2 "pozos de modo Poisson" (PM2) en lugar de 64, con un potencial gaussiano anisotrópico y un integrador BAOAB (estilo Langevin) sobre gradientes vivos. Se entrenó sobre OpenWebText con 532,5 millones de tokens y una dimensión de modelo de 384. Su resultado principal es una perplejidad de validación de 54,71 (bloque 512), ligeramente peor que su gemelo de primer orden (53,81) y que la variante con 16 pozos (54,24), lo que sugiere que dos pozos ya capturan la mayor parte del beneficio de este mecanismo en régimen de segundo orden.

La relevancia del modelo es fundamentalmente científica: sirve para estudiar si la dinámica de segundo orden (con velocidad e inercia) aporta ventajas frente a un modelo de primer orden entrenado de forma idéntica, y para aislar el efecto del número de pozos Poisson. No está pensado como modelo de producción, sino como evidencia empírica reproducible dentro de un programa de investigación sobre modelos de lenguaje no-transformer con inferencia de memoria constante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atención, con potencial escalar, dinámica de segundo orden e integrador BAOAB sobre gradientes vivos |
| Parámetros totales | no disponible (dimensión de modelo d=384; el repositorio ocupa 0,3 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (librería PyTorch; el repo contiene pesos en formato PyTorch) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia "conservative language model" de Semsimula: en lugar de atención y capas transformer convencionales, define un potencial escalar \(V_\theta\) y evoluciona el estado mediante dinámica de segundo orden (con velocidad e inercia), integrada con el esquema BAOAB (un integrador tipo Langevin ampliamente usado en dinámica molecular). Los "pozos de modo Poisson" (Poisson-mode wells) son componentes del potencial; en esta variante hay 2 pozos (PM2) en lugar de los 64 de la variante PMX, y los modos rígidos de \(V_\theta\) se integran exactamente como un muelle amortiguado, propagando la velocidad de capa en capa. El modelo incorpora además geometría riemanniana (geodésicas riemannianas, métrica de Jacobi) y un potencial gaussiano anisotrópico.

El entrenamiento usó exactamente 532.480.000 tokens de OpenWebText (32.500 pasos × 32 × 512), con el mismo presupuesto y calendario que el resto de la escalera Gen 3, partiendo del paso 0 con semilla 0 igual que su gemelo de primer orden y el par K=16, de modo que las comparaciones son emparejadas (las evaluaciones paso a paso correlacionan a 0,999). El estudio es pre-registrado: la hipótesis MS2b anticipaba el orden SR2 (58,32) > PM2-PMX16 > PMX-K16 (54,24), y se cumplió con 54,71. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de OpenWebText.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado y evaluado como modelo de lenguaje autorregresivo sobre OpenWebText.
- Modelado de lenguaje y estimación de perplejidad: es su métrica principal y el eje del estudio comparativo.
- Inferencia de memoria constante: la arquitectura sin atención permite, según las etiquetas del autor, inferencia con memoria constante respecto a la longitud de secuencia.
- Razonamiento de múltiples pasos: no disponible (no se documenta soporte específico).
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente: no disponible (no se documenta soporte).
- Multilingüismo: solo inglés.
- Capacidades especiales: dinámica de segundo orden con velocidad e inercia, pozos de modo Poisson, potencial gaussiano anisotrópico, integración BAOAB, geometría riemanniana. No se documenta visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre arquitecturas no-transformer: el modelo sirve como punto de comparación controlado para estudiar si la dinámica de segundo orden aporta ventajas frente a la de primer orden, con presupuesto de tokens y semilla idénticos.
- Ablación de mecanismos en modelos de lenguaje: permite aislar el efecto del número de pozos Poisson (0, 2, 16, 64) sobre la perplejidad en OpenWebText, manteniendo todo lo demás constante.
- Reproducibilidad de estudios pre-registrados: útil para replicar la hipótesis MS2b y verificar los resultados declarados (54,71 de perplejidad) con el mismo calendario de entrenamiento.
- Experimentos de dinámica molecular aplicada al aprendizaje: la combinación de BAOAB, potenciales gaussianos anisotrópicos y geodésicas riemannianas puede servir de base para explorar integradores físicos en modelos generativos.
- Evaluación de inferencia de memoria constante: para medir empíricamente el coste de memoria en secuencias largas frente a transformers con atención cuadrática.
- Docencia y divulgación: como ejemplo concreto y reproducible de modelo de lenguaje conservativo con potencial escalar, útil en cursos o artículos sobre alternativas a la atención.
- Estudio de eficiencia en presupuestos pequeños: con 532,5 M de tokens y d=384, es un banco de pruebas asequible para comparar recetas de entrenamiento sin grandes recursos de cómputo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Corpus, tokens | Orden | Perplejidad (bloque 512) |
|---|---|---:|---:|
| SR2 (sin pozos) | OpenWebText, 532,5 M | 2.º | 58,32 |
| FO-b-OWT (sin pozos) | OpenWebText, 532,5 M | 1.º | 61,16 |
| PMX (64 pozos) | OpenWebText, 532,5 M | 2.º | 54,63 |
| FO-b-PMX (64 pozos) | OpenWebText, 532,5 M | 1.º | 54,02 |
| PMX-K16 (16 pozos) | OpenWebText, 532,5 M | 2.º | 54,24 |
| FO-b-PMX-K16 (16 pozos) | OpenWebText, 532,5 M | 1.º | 53,73 |
| **PM2-PMX16 (2 pozos, este modelo)** | OpenWebText, 532,5 M | 2.º | **54,71** |
| FO-b-PM2-PMX16 (2 pozos) | OpenWebText, 532,5 M | 1.º | 53,81 |
| SO-TS (sin pozos) | TinyStories, 315 M | 2.º | 5,16 |
| FO-TS (sin pozos) | TinyStories, 315 M | 1.º | 5,13 |
| PM2-TS (2 pozos) | TinyStories, 315 M | 2.º | 4,99 |
| FO-b-PM2-TS (2 pozos) | TinyStories, 315 M | 1.º | 4,96 |
| SO-CODE (sin pozos) | Python, 315 M | 2.º | 6,00 |
| FO-b-CODE (sin pozos) | Python, 315 M | 1.º | 6,55 |
| PM2-CODE (2 pozos) | Python, 315 M | 2.º | 5,71 |
| FO-b-PM2-CODE (2 pozos) | Python, 315 M | 1.º | 5,62 |

Para este modelo en concreto: perplejidad asentada de 54,71 (media de las tres últimas evaluaciones: 54,64, 54,87, 54,61) y mejor valor de 52,77 en el paso 31.000, sobre tokens de validación propios de OpenWebText. Su gemelo de primer orden obtiene 53,81 (−1,6 % para el segundo orden, −1,63 % emparejado por paso). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con un repositorio de 0,3 GB y dimensión d=384, el modelo es muy pequeño y probablemente quepa en GPUs de consumo con amplio margen, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU moderna (RTX 3060 en adelante) debería ser suficiente; no se especifican A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Muy probablemente sí, dado el tamaño del repositorio (0,3 GB), aunque no se confirma en la información disponible.
- Opciones de despliegue: no disponible. El modelo usa PyTorch y una arquitectura personalizada (no-transformer, sin atención), por lo que no es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI sin implementación específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OWT, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **PM2-PMX16 (este modelo)** | no disponible (d=384) | no disponible | 54,71 | CC BY 4.0 | Hugging Face |
| FO-b-PM2-PMX16 (gemelo 1.er orden) | no disponible (d=384) | no disponible | 53,81 | CC BY 4.0 | Hugging Face |
| PMX-K16 (16 pozos, 2.º orden) | no disponible (d=384) | no disponible | 54,24 | CC BY 4.0 | Hugging Face |
| PMX (64 pozos, 2.º orden) | no disponible (d=384) | no disponible | 54,63 | CC BY 4.0 | Hugging Face |
| SR2 (sin pozos, 2.º orden) | no disponible (d=384) | no disponible | 58,32 | CC BY 4.0 | Hugging Face |

Las alternativas comparables son las del propio programa Semsimula; no se dispone de comparación con transformers de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción; su propósito es la ablación de mecanismos dentro de un estudio pre-registrado.
- Rendimiento limitado: una perplejidad de 54,71 en OpenWebText es alta en términos absolutos y refleja un modelo pequeño (d=384) entrenado con solo 532,5 M de tokens.
- Solo inglés: no hay soporte multilingüe documentado.
- Riesgo de alucinación: no evaluado en la información disponible; como modelo de lenguaje entrenado sobre texto web, es esperable, pero no se cuantifica.
- Sesgos: no documentados; OpenWebText hereda los sesgos del contenido web filtrado por Reddit.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación conviene verificar la atribución requerida y el contexto del estudio.
- Compatibilidad: al ser una arquitectura no-transformer sin atención, no es directamente desplegable con las herramientas estándar (vLLM, llama.cpp, Ollama, TGI) sin trabajo de integración.
- Resultados no verificados: las métricas proceden de la model card del autor y están marcadas como `verified: false`.
- Sin datos de cuantización ni de formato de pesos estándar: dificulta su uso fuera del ecosistema PyTorch del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Gemelo de primer orden (FO-b-PM2-PMX16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante con 64 pozos (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Variante con 16 pozos (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Variante sin pozos (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Colección "First vs second order" (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección "Gen 3" (OpenWebText ladder): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

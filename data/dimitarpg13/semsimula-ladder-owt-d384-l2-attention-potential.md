# dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential

## Resumen

SemSimula Ladder OWT d384 L2 Attention Potential es un modelo de lenguaje de investigación desarrollado por el usuario dimitarpg13, perteneciente a la segunda generación de la "escalera de mecanismos" SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo de espacio de Fock (Fock-PARFLM) que sustituye la atención convencional por un campo de intercambio formulado como potencial escalar, de modo que la fuerza resultante es un gradiente. El modelo se entrena sobre OpenWebText con un presupuesto de tokens idéntico al del resto de brazos de la escalera (532.480.000 tokens), lo que permite aislar el efecto de mecanismos individuales.

La relevancia del modelo es metodológica más que práctica: forma parte de un estudio pre-registrado con ablaciones emparejadas, donde cada variante elimina exactamente un mecanismo. Este brazo concreto elimina la parte no conservativa del campo de intercambio, manteniendo activo el canal inverso, por lo que el modelo en su conjunto sigue siendo no conservativo. Su perplexity de validación (80,9 en bloques de 512 tokens) es la peor de la escalera y sirve como control pareado frente a los demás brazos.

Conviene señalar que el autor ha marcado esta generación como superada: un fallo en la convención de "fuentes desacopladas" (detached sources) impedía que el gradiente de la pérdida llegara a tokens anteriores a través de esos canales. La recolocación con gradientes vivos reduce la perplexity de este brazo de 80,90 a 61,11 (y a 54,21 con todas las rutas activas), por lo que las lecturas de esta medición como "precio de la conservatividad" han sido retiradas por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (modelo de lenguaje conservativo de espacio de Fock, no transformer, sin atención convencional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Fock-PARFLM, una arquitectura de investigación sin transformer ni atención convencional que modela el intercambio de información mediante un campo ξ enrutado y un potencial escalar φ. En este brazo, el campo de intercambio entra como potencial escalar, de forma que su fuerza es un gradiente (parte conservativa), mientras que el canal inverso permanece activo y no es gradiente de nada, manteniendo la no conservatividad global del modelo. La dimensión del modelo es d=384 y la profundidad L=2.

El entrenamiento se realizó sobre OpenWebText con exactamente 532.480.000 tokens (32.500 pasos × 32 × 512), el mismo corpus, tokenizador y lotes de validación que el resto de brazos de la escalera, de modo que las diferencias de rendimiento reflejan mecanismos y no presupuesto de cómputo. El estudio es pre-registrado: el orden esperado de los brazos se registró antes de la ejecución. La innovación técnica destacable es el propio diseño experimental de ablación emparejada, junto con la formulación de atención conservativa controlada y los registros virtuales del espacio de Fock. Cabe advertir que en esta generación las fuentes de φ y ξ se entrenaron desacopladas (detached), lo que impedía el flujo de gradiente hacia tokens anteriores por esos canales; esta es la causa de la brecha de rendimiento frente a la generación 3.

## Capacidades

- Generación de texto en inglés: el pipeline declarado es text-generation.
- Modelado de lenguaje autoregresivo con perplexity medida sobre OpenWebText.
- Investigación en arquitecturas alternativas al transformer: sirve como control experimental para aislar el efecto de mecanismos concretos.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- Multilingüismo limitado al inglés según la model card.
- No se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Estudio de ablación de mecanismos: el modelo se usa como brazo de control pareado para medir cuánto cuesta convertir el campo de intercambio en un potencial conservativo, comparando su perplexity con la del brazo con campo no conservativo (63,51) y con el de ausencia de campo (66,98).
- Reproducción de investigación en modelos físicamente informados: permite replicar el protocolo de presupuesto de tokens fijo (532.480.000 tokens) y verificar la metodología pre-registrada del autor.
- Análisis de flujo de gradiente: sirve para estudiar cómo la convención de fuentes desacopladas degrada el aprendizaje, dado que el propio autor documenta la recolocación con gradientes vivos (80,90 → 61,11).
- Docencia y divulgación sobre arquitecturas no transformer: un modelo de 0,6 GB de repositorio y solo 2 capas es manejable para ilustrar conceptos de espacio de Fock, potenciales escalares y conservatividad en atención.
- Baseline para experimentos de atención conservativa: cualquier investigador que proponga una variante de atención con fuerza derivada de un potencial puede comparar contra esta referencia con presupuesto idéntico.
- Validación de infraestructura de evaluación: su perplexity de validación en bloques de 512 tokens (media de las tres últimas evaluaciones de 500 pasos) proporciona un punto de referencia reproducible para pipelines de evaluación de modelos de investigación.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente).

| Modelo (brazo de la escalera) | Mecanismo eliminado | PPL validación (bloque 512) | Ratio vs GPT-2 |
|---|---|---:|---:|
| GPT-2 baseline emparejado | arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM, campo de intercambio activo | el transformer | 63,51 | 1,275× |
| **Fock-PARFLM, campo como potencial (este modelo)** | parte no conservativa del campo | **80,90** | 1,624× |
| Fock-PARFLM, sin campo de intercambio | el campo de intercambio | 66,98 | 1,345× |
| Control solo conservativo (Fock desactivado) | mecanismo de Fock (ruta registro-token) | 87,93 | 1,765× |

Brechas medidas entre brazos: GPT-2 → campo activo, +13,70 PPL (+27,5%); campo activo → campo como potencial, +17,39 PPL (+27,4%, lectura como "precio de la conservatividad" retirada por el autor); campo activo → sin campo, +3,47 PPL (+5,5%); sin campo → campo como potencial, +13,92 PPL (+20,8%).

Tras la recolocación con gradientes vivos (generación 3), este brazo pasa de 80,90 a 61,11 de perplexity, y a 54,21 con todas las rutas de gradiente activas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 0,6 GB y el modelo tiene d=384 y L=2, por lo que es previsible que quepa holgadamente en GPU de consumo, aunque no se publican cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del repositorio y la profundidad de 2 capas, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL (OpenWebText val, bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SemSimula Ladder OWT d384 L2 Attention Potential (este) | no disponible (d=384, L=2) | no disponible | 80,90 | CC-BY-4.0 | Hugging Face |
| SemSimula Ladder OWT d384 L2 Attention | no disponible (d=384, L=2) | no disponible | 63,51 | CC-BY-4.0 | Hugging Face |
| SemSimula Ladder OWT d384 L2 No-Exchange | no disponible (d=384, L=2) | no disponible | 66,98 | CC-BY-4.0 | Hugging Face |
| GPT-2 baseline emparejado (d=384, L=2) | no disponible | no disponible | 49,81 | no disponible en la información | Hugging Face (repo del autor) |

La comparación con modelos de propósito general (GPT-2 estándar, Pythia, etc.) no está disponible en la información proporcionada; los únicos puntos de referencia son los brazos de la misma escalera experimental.

## Limitaciones y advertencias

- Modelo de investigación superado: el autor marca esta generación como "superseded" y la conserva únicamente como control pareado.
- Convención de fuentes desacopladas: el gradiente de la pérdida no llegaba a tokens anteriores por los canales de φ y ξ, lo que infla la perplexity; las lecturas de esta medición como coste de un mecanismo han sido retiradas.
- Rendimiento muy inferior al baseline: 80,90 frente a 49,81 de perplexity (1,624×), insuficiente para aplicaciones de producción.
- Solo inglés: la model card declara únicamente el idioma inglés.
- Sin datos de sesgos ni de tasas de alucinación publicados; al ser un modelo pequeño entrenado sobre OpenWebText, es previsible que reproduzca sesgos del corpus web, aunque no se documenta.
- Contexto de evaluación limitado a bloques de 512 tokens; no se especifica la longitud de contexto máxima soportada.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero al ser un artefacto de investigación sin garantías de calidad, no se recomienda su uso en producción.
- Sin soporte documentado de tool calling, agentes, cuantización ni formatos de despliegue estándar (GGUF, vLLM), lo que dificulta su integración en pipelines convencionales.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo con gradientes vivos (probe): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo con todas las rutas de gradiente activas: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Brazo sin campo de intercambio: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo sin campo, con gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Brazo solo conservativo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo solo conservativo, con gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Brazo con campo de intercambio activo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Baseline GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección de la generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Nota sobre el problema de gradiente: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Gradient_Starvation_Investigation.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext

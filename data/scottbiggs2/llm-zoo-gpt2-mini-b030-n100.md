# ScottBiggs2/llm-zoo-gpt2-mini-b030-n100

## Resumen

`llm-zoo-gpt2-mini-b030-n100` es un artefacto de investigación publicado por el usuario ScottBiggs2 en HuggingFace. No es un modelo de lenguaje de propósito general, sino un "zoo" de 100 modelos GPT-2 mini (51.475.968 parámetros cada uno) que comparten un tronco de inicialización común y divergen únicamente en la mezcla de datos de preentrenamiento utilizada. Cada miembro representa un punto en el símplex de 5 dimensiones definido por las proporciones de datos web, código, matemáticas, libros y multilingüe.

El objetivo declarado es estudiar la estructura del espacio de pesos a través de una población de modelos que comparten inicialización y difieren solo en la distribución de sus datos de entrenamiento. La arquitectura es un transformer GPT-2 estándar con 8 capas, tamaño oculto de 512 y 8 cabezas de atención, con el `lm_head` atado a los embeddings de entrada, tal como en el GPT-2 original.

Es relevante ahora por su valor metodológico: permite analizar cómo las mezclas de datos se reflejan en la geometría de los pesos, un tema de interés creciente en la investigación sobre entrenamiento y merging de modelos. Sin embargo, el propio autor advierte que la calidad de texto es débil, que no hay ajuste por instrucciones ni alineación de seguridad, y que el presupuesto de tokens es fijo y pequeño (20 tokens por parámetro).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parametros totales | 51.475.968 por miembro (100 miembros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (datos de entrenamiento incluyen inglés y francés vía fineweb-2 fra_Latn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un `model.safetensors` y `config.json` por miembro) |

## Arquitectura y entrenamiento

Cada miembro es un GPT-2 mini con 8 capas, dimensión oculta 512 y 8 cabezas de atención, con 51.475.968 parámetros y vocabulario BPE de GPT-2 (50257 tokens). El `lm_head` está atado a los embeddings de entrada. El dropout es 0.0, igual que en entrenamiento, y los pesos se publican en float32, convertidos desde vectores planos originales con verificación bit-exacta para cada miembro.

El entrenamiento parte de un tronco compartido (`trunk/`) entrenado durante 5498 pasos de optimizador con semilla 1234. Cada miembro entrena después una fracción beta = 0.3 del presupuesto adicional (0.3 × 7854 pasos) sobre su propia mezcla de datos. El presupuesto total equivale a 20 tokens por parámetro. Las mezclas cubren cinco corpus públicos: `HuggingFaceFW/fineweb-edu` (sample-10BT, split train) para web, `codeparrot/codeparrot-clean` (train) para código, `open-web-math/open-web-math` (train) para matemáticas, `manu/project_gutenberg` (split en) para libros y `HuggingFaceFW/fineweb-2` (fra_Latn, train) para multilingüe. El zoo contiene 20 anclas con mezclas repetidas y 80 singletons con mezclas distintas, con semilla del plan de mezclas 0. No se menciona RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo y el presupuesto de entrenamiento.
- No dispone de ajuste por instrucciones ni de alineación de seguridad.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas a lo que aporte la fracción de `fineweb-2` en francés presente en cada mezcla.
- No se documentan modos especiales (thinking, visión, audio).
- Valor principal: servir como población de modelos para estudiar el espacio de pesos y el efecto de las mezclas de datos.

## Casos de uso

- Investigación sobre geometría del espacio de pesos: comparar los 100 checkpoints para analizar cómo la mezcla de datos desplaza los pesos respecto al tronco común y entre miembros.
- Estudio de model merging: los miembros comparten inicialización y tronco, lo que los convierte en candidatos controlados para experimentos de interpolación y task arithmetic.
- Análisis de mezclas de datos: correlacionar las coordenadas `pi` de `members.json` con propiedades de los pesos o del comportamiento generativo.
- Reproducibilidad metodológica: replicar el protocolo de entrenamiento (tronco compartido, beta = 0.3, 20 tokens por parámetro) con los mismos corpus públicos.
- Docencia e investigación académica: usar modelos pequeños y de bajo coste computacional para ilustrar efectos de distribución de datos en modelos de lenguaje.
- Pruebas de infraestructura de inferencia: validar pipelines de carga con `transformers` y subcarpetas `members/member_XXX` en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,2 GB por miembro (51,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia individual.
- El repositorio completo ocupa 20,8 GB, por lo que cargar los 100 miembros simultáneamente requiere planificación de memoria; la inferencia típica se hace miembro a miembro.
- Despliegue compatible con `transformers` (`GPT2LMHeadModel` y tokenizador `gpt2`); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, aunque al ser un GPT-2 estándar podría convertirse a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-zoo-gpt2-mini-b030-n100 | 51,5 M por miembro (100 miembros) | no disponible | Artefacto de investigación sobre espacio de pesos | Apache-2.0 | HuggingFace |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | Modelo de lenguaje de propósito general | MIT (pesos originales) | HuggingFace, OpenAI |
| DistilGPT-2 | 82 M | 1024 tokens | Modelo destilado de GPT-2 | Apache-2.0 | HuggingFace |
| GPT-2 mini (variantes comunitarias) | ~50 M | 1024 tokens | Experimentación y prototipado | variable | HuggingFace |

La comparación es aproximada: el zoo no compite en calidad de generación con GPT-2 small o DistilGPT-2, sino que se posiciona como material de investigación. Los datos de contexto de los modelos comparables son los habituales de la familia GPT-2; para el zoo no se especifica en la información disponible.

## Limitaciones y advertencias

- Calidad de texto débil por diseño: entrenamiento desde cero con presupuesto fijo de 20 tokens por parámetro y corpus pequeños.
- Ausencia total de ajuste por instrucciones y de alineación de seguridad; no debe usarse en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de alucinación y de generación incoherente.
- Sesgos heredados de los corpus públicos utilizados (web, código, matemáticas, libros, multilingüe), sin filtrado ni mitigación documentada.
- Idiomas soportados no documentados; la cobertura multilingüe depende de la fracción de `fineweb-2` en francés en cada mezcla.
- Longitud de contexto no especificada en la información disponible.
- Licencia Apache-2.0 para los pesos, pero los datasets subyacentes mantienen sus propias licencias y términos; deben revisarse las dataset cards antes de reutilizar los datos.
- El autor lo describe explícitamente como artefacto de investigación, no como modelo de propósito general.

## Enlaces

- HuggingFace: https://huggingface.co/ScottBiggs2/llm-zoo-gpt2-mini-b030-n100
- Preprint: "link coming soon" según la model card (no disponible)
- Dataset web: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset código: https://huggingface.co/datasets/codeparrot/codeparrot-clean
- Dataset matemáticas: https://huggingface.co/datasets/open-web-math/open-web-math
- Dataset libros: https://huggingface.co/datasets/manu/project_gutenberg
- Dataset multilingüe: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

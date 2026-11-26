# byjameson/atom-zero-63m-selfharm

## Resumen

Atom Zero 63M self-harm replay es una base de investigación opcional publicada por el desarrollador independiente byjameson dentro del proyecto Atom Zero. Se trata de un modelo de lenguaje de 63.389.184 parámetros, obtenido mediante "upcycling" de un modelo previo de 6 capas a 8 capas con interpolación de pesos, y afinado sobre una mezcla de datos que combina tareas de copia sintéticas, retención de contenido, filas benignas y un pequeño conjunto contrastivo de filas relacionadas con autolesiones. No es el modelo por defecto del producto: los pesos de producción siguen siendo `byjameson/atom-zero-49m` en la versión `0.8.0`.

El interés del modelo es fundamentalmente metodológico. El autor documenta explícitamente un compromiso ("tradeoff") entre seguridad y utilidad conversacional: el modelo alcanza 40/40 en un conjunto de seguridad retenido de 40 ejemplos, pero baja a 83,8% de utilidad en conversación benigna, por debajo del umbral de promoción del 90% que el propio proyecto se impone. Es, por tanto, un artefacto de investigación para estudiar cómo el ajuste fino sobre datos de seguridad estrechos afecta a la capacidad general de un modelo pequeño, no un componente listo para producción.

La relevancia actual es acotada pero real para quien investigue alineamiento y seguridad en modelos de muy pequeño tamaño: muestra con números concretos cuánto cuesta en rendimiento benigno añadir una sonda de seguridad, y deja claro que la cobertura de crisis en el producto real recae en un filtro determinista externo, no en el modelo. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (no se especifica variante concreta); 8 capas obtenidas por upcycling desde 6 capas con interpolación |
| Parametros totales | 63.389.184 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, formato PyTorch nativo) |
| Idiomas soportados | no disponible (el tokenizador se denomina `chat_en_bpe8k.json`, lo que sugiere foco en inglés, pero no se declara oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch), junto con `config.json` y tokenizador BPE de 8k (`chat_en_bpe8k.json`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 8 capas y 63,4 millones de parámetros, construido mediante upcycling: se parte de un modelo de 6 capas y se interpola para obtener 8, en lugar de entrenar desde cero. El tokenizador es un BPE de vocabulario 8192 (`chat_en_bpe8k.json`), coherente con un modelo de escala muy reducida. No se detalla en la información disponible el tipo de atención, la dimensión oculta ni la ventana de contexto.

El entrenamiento consistió en 3000 pasos con batch de 4, learning rate 5e-5, peso de contenido 2 y semilla 71. El conjunto de datos combina 6000 ejemplos de tarea de copia, 492 de contenido, 40 de seguridad, 144 benignos replicados tres veces y 16 filas contrastivas adicionales sobre autolesiones. No se menciona RLHF ni DPO; el ajuste parece ser supervisado sobre esta mezcla. La innovación declarada no es arquitectónica sino de evaluación: el autor publica métricas separadas de copia exacta (2short 88,0%, 3short 72,0%, 4short 58,0%), retención de contenido (0,841), utilidad benigna (83,8% sobre 136 ejemplos) y seguridad (40/40 sobre 40 ejemplos retenidos), además de una compuerta de checkpoint y una suite de producto que el modelo supera.

## Capacidades

- Generación de texto conversacional en un dominio estrecho, orientada a respuestas breves y plantillas.
- Tarea de copia exacta sobre gramáticas de clave entrenadas: 88,0% en cadenas de 2 elementos, 72,0% en 3 y 58,0% en 4.
- Retención de contenido medida en 0,841 sobre el conjunto de evaluación del autor.
- Respuesta a un conjunto acotado de plantillas de seguridad relacionadas con autolesiones (40/40 en el conjunto retenido).
- Utilidad conversacional benigna del 83,8% sobre 136 ejemplos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No se documenta capacidad multilingüe; el tokenizador sugiere inglés.
- No se documenta modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación sobre compromisos seguridad-utilidad: el modelo sirve para reproducir y analizar el coste de 12 puntos de utilidad benigna a cambio de la última sonda de seguridad, usando las métricas publicadas como referencia.
- Estudio de upcycling de capas: permite examinar cómo se comporta un modelo de 6 a 8 capas interpoladas frente a alternativas entrenadas desde cero a escala similar.
- Evaluación de filtros deterministas en pipelines de seguridad: dado que el producto real delega la cobertura de crisis en un filtro determinista, este modelo es útil para probar la interacción entre modelo y filtro externo.
- Pruebas de retención de contenido en modelos pequeños: la métrica de 0,841 sobre el conjunto del autor permite comparar estrategias de mezcla de datos (copia, contenido, benigno) en presupuestos de cómputo mínimos.
- Docencia y experimentación en ajuste fino supervisado: con 63M de parámetros y un repositorio de 0,3 GB, es viable entrenar y evaluar variantes en una sola GPU de consumo.
- Réplica de resultados de investigación: los enlaces a `selfharm_tradeoff_summary.json` y a las notas de release permiten reproducir el análisis de compromiso con los mismos datos y semilla.

## Benchmarks y rendimiento

| Área | Resultado |
|---|---|
| Copia 2short | 88,0% exacto |
| Copia 3short | 72,0% |
| Copia 4short | 58,0% exacto |
| Retención de contenido | 0,841 |
| Utilidad benigna (136) | 83,8% |
| Seguridad (40 retenidos) | 40/40 |
| Compuerta de checkpoint | pass |
| Suite de producto | pass |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son métricas internas del autor sobre conjuntos propios y no son comparables directamente con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 63,4M de parámetros, los pesos en fp32 ocupan aproximadamente 0,25 GB; en fp16, unos 0,13 GB. La VRAM total necesaria es inferior a 1 GB en cualquier configuración razonable.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4090) es sobrada; también es viable en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU de consumo, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: al distribuirse como `model.pt` en PyTorch nativo, requiere carga directa con PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada; a este tamaño se espera latencia de milisegundos por token en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Atom Zero 63M self-harm | 63,4M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Base de investigación opcional; 83,8% utilidad benigna, 40/40 seguridad |
| Atom Zero 49M (0.8.0) | 49M (según referencia del autor) | no disponible | no disponible en la información | Pesos de producto del proyecto | Modelo por defecto del producto según la model card |
| Alternativas de 50-100M | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks públicos ni de especificaciones de modelos comparables de terceros en la información proporcionada, por lo que la comparativa queda limitada a los dos artefactos del mismo proyecto.

## Limitaciones y advertencias

- Los datos contrastivos de autolesiones son "ensayo de plantillas estrecho", no atención en crisis; el propio autor lo advierte. Las respuestas de crisis requieren revisión humana.
- La ganancia en copia se limita a la gramática de claves entrenada; fuera de ella el comportamiento no está caracterizado.
- Utilidad benigna del 83,8%, por debajo del umbral de promoción del 90% del proyecto: no debe usarse como modelo por defecto en producción.
- Riesgo de alucinación no cuantificado; no hay evaluaciones de veracidad publicadas.
- Longitud de contexto e idiomas no declarados; el tokenizador sugiere inglés y vocabulario limitado (8k), lo que restringe la cobertura léxica.
- Sesgos no documentados; no se han publicado evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el estado de "base de investigación opcional" y las advertencias del autor desaconsejan su uso directo en producto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de los resultados.
- El modelo se distribuye como `model.pt` (pickle de PyTorch), lo que implica precauciones de seguridad al cargar pesos de origen no verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byjameson/atom-zero-63m-selfharm
- Resumen del compromiso seguridad-utilidad: https://github.com/byjameson/atom-zero/blob/main/research/results/selfharm_tradeoff_summary.json
- Notas de release 1.3.0: https://github.com/byjameson/atom-zero/blob/main/docs/RELEASE_ATOMZERO_1.3.0.md
- Repositorio del proyecto: https://github.com/byjameson/atom-zero

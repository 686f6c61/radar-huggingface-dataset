# mikim869/qwen2.5-3b-jev-hard-v5.3-untruncated-reasoner

## Resumen

mikim869/qwen2.5-3b-jev-hard-v5.3-untruncated-reasoner es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, publicado por el usuario mikim869 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una especialización sobre la base de 3.090 millones de parámetros de Alibaba Qwen, realizada con la librería Unsloth (según la propia model card) y partiendo de la versión del repositorio unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit, es decir, una base ya cuantizada a 4 bits.

El nombre del repositorio sugiere tres decisiones de diseño: un conjunto de datos orientado a ejemplos "duros" de razonamiento (jev-hard), un entrenamiento sin truncado de secuencias (untruncated) y un enfoque en razonamiento explícito (reasoner). Cabe subrayar que la model card no documenta el dataset, el número de tokens, la configuración de entrenamiento ni ninguna evaluación, por lo que todas esas afirmaciones deben considerarse inferencias a partir del nombre y no hechos verificados.

Su relevancia práctica es limitada pero concreta: ofrece un punto de partida reproducible para quien quiera estudiar cómo se comporta un modelo de 3B tras un ajuste fino agresivo sobre problemas difíciles, y puede ejecutarse en hardware de consumo. Con cero descargas y cero "likes" en el momento de redactar esta ficha, no existe validación comunitaria alguna sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, con atención por grupos (GQA); el artefacto publicado es un fine-tune (LoRA/QLoRA vía Unsloth) sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.090 millones (modelo base Qwen2.5-3B); el tamaño exacto de los pesos publicados no está documentado (el repo ocupa 0,1 GB, lo que apunta a adaptadores y no a pesos fusionados completos) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens, heredada del modelo base Qwen2.5-3B según su model card oficial; no verificada para este fine-tune |
| Tipos de cuantizacion | No se publican ficheros GGUF ni cuantizaciones listas para usar. El entrenamiento se hizo sobre base en 4 bits (bitsandbytes). En inferencia puede ejecutarse en bf16/fp16 con el modelo base sin cuantizar, o en 8/4 bits vía bitsandbytes |
| Idiomas soportados | en (inglés), único idioma declarado en la model card. El modelo base Qwen2.5 cubre más idiomas, pero este ajuste no los declara |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; repositorio compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 36 capas, dimensión oculta 2048, 16 cabezas de atención de consulta y 2 cabezas de clave/valor (GQA), con RoPE y las optimizaciones estándar de la familia Qwen2. Según el informe técnico de Qwen2.5 (arXiv 2412.15115), la serie se preentrenó sobre 18 billones de tokens, frente a los 7 billones de la generación anterior, y se sometió a un post-entrenamiento con supervisión y preferencias. Este fine-tune concreto no aporta información sobre qué parte de ese pipeline ha modificado.

Respecto al entrenamiento de este repositorio, la única información disponible es que se usó Unsloth, que el autor afirma haber logrado un entrenamiento "2x más rápido" y que la base era la versión bnb-4bit de Unsloth. No se documentan el dataset, el volumen de tokens, la longitud de secuencia, el rango de LoRA, la tasa de aprendizaje, ni si hubo fases de DPO/RLHF. El sufijo "untruncated" indica, presumiblemente, que las secuencias de entrenamiento no se truncaron, lo que implica secuencias largas y un consumo de memoria superior al habitual en ajustes de 3B; el sufijo "reasoner" apunta a un entrenamiento orientado a cadenas de razonamiento. Ambas lecturas son inferencias del nombre, no datos confirmados.

## Capacidades

- Generación de texto y razonamiento paso a paso en inglés, presumiblemente reforzado por el ajuste "reasoner", aunque sin evaluación publicada que lo respalde.
- Generación de código y resolución de problemas matemáticos, capacidades heredadas de Qwen2.5-3B-Instruct; no hay datos sobre si el fine-tune las mejora o las degrada.
- Conversación multi-turno con instrucciones, al derivar de una base ya alineada por instrucciones.
- Ventana de contexto de hasta 32.768 tokens (según el modelo base), adecuada para documentos medianos y conversaciones largas.
- Soporte potencial de tool calling / function calling heredado del formato de chat de Qwen2.5; este fine-tune no documenta si conserva la plantilla ni si el ajuste ha erosionado esta capacidad.
- Capacidad multilingüe limitada: la model card solo declara inglés, aunque el tokenizador del modelo base es multilingüe.
- No dispone de visión, audio ni modo "thinking" con tokens de control separados (no documentado).

## Casos de uso

- Experimentación académica sobre ajuste fino: sirve como caso de estudio de cómo un fine-tune corto con Unsloth sobre una base cuantizada a 4 bits afecta al comportamiento de un modelo de 3B. Útil para ablaciones controladas frente al Qwen2.5-3B-Instruct original.
- Asistente local en portátil: con cuantización de 4 bits ocupa del orden de 2 GB de pesos, por lo que puede ejecutarse en un equipo con GPU de 8 GB o incluso en CPU, para tareas de generación de texto sin conexión.
- Generación de explicaciones razonadas para problemas de dificultad alta: el ajuste sobre ejemplos "duros" apunta a un uso como solucionador de problemas paso a paso en dominios técnicos, siempre que se valide empíricamente antes de usarlo en producción.
- Prototipado rápido de pipelines de razonamiento: al ser un modelo pequeño, permite iterar sobre prompts y plantillas de cadena de pensamiento con coste de cómputo muy bajo antes de escalar a modelos mayores.
- Extracción y resumen de documentos de hasta ~30.000 tokens: contratos, informes o documentación técnica en inglés, aprovechando la ventana de contexto del modelo base.
- Generación de borradores de código y tests unitarios en entornos con recursos limitados, como parte de un pipeline de CI/CD o de un asistente integrado en el IDE.
- Filtrado y clasificación de texto en inglés dentro de un sistema mayor, usando el modelo como clasificador generativo cuando el volumen no justifica un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye ninguna evaluación (MMLU, HumanEval, GSM8K ni otras), y tampoco se han encontrado referencias externas a este fine-tune concreto. El modelo base Qwen2.5-3B-Instruct sí dispone de resultados publicados en el informe técnico de Qwen2.5, pero no se reproducen aquí porque no se dispone de ellos en la información consultada.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos (3.090 M de parámetros × 2 bytes), más caché KV y activaciones; en la práctica, 8-10 GB es el mínimo y 16 GB lo recomendable.
- VRAM en 8 bits: del orden de 3,1-3,5 GB de pesos, más overhead; cabe en GPUs de 8 GB.
- VRAM en 4 bits: del orden de 2,0-2,5 GB de pesos; ejecutable en GPUs de consumo de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) e incluso en Apple Silicon con memoria unificada.
- Caché KV a contexto completo: con 36 capas, 2 cabezas KV y dimensión de cabeza 128, se necesitan unos 36 KB por token, es decir, aproximadamente 1,2 GB adicionales para llenar los 32.768 tokens. Con contexto corto este coste es despreciable.
- GPU de referencia para entrenamiento o fine-tune adicional: una RTX 4090 (24 GB) es suficiente para LoRA en bf16 con secuencias largas; para ajustes "untruncated" con secuencias muy largas conviene una A100 40/80 GB o H100.
- Opciones de despliegue: transformers (nativo), vLLM y TGI para servir con throughput alto, llama.cpp/Ollama si se convierte previamente a GGUF (no hay conversión oficial publicada). Requiere descargar el modelo base y aplicar el adaptador, o fusionarlo, ya que el repositorio no parece contener pesos completos.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparación se establece con el modelo base sin ajustar y con alternativas de la misma franja de tamaño. Los datos de los competidores provienen de sus model cards públicas; los de este repositorio no están documentados.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| qwen2.5-3b-jev-hard-v5.3-untruncated-reasoner | 3,09 B (base) | 32.768 (heredado) | Apache-2.0 | Fine-tune comunitario, sin evaluaciones ni descargas |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache-2.0 | Modelo oficial, con benchmarks publicados y soporte en vLLM, TGI y llama.cpp |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Licencia comunitaria Llama 3.2 | Modelo oficial, ampliamente adoptado, requiere aceptar la licencia |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | Modelo oficial de Microsoft, con evaluación publicada |

Frente al Qwen2.5-3B-Instruct original, este fine-tune no ofrece ninguna ventaja documentada: no hay benchmarks, no hay dataset descrito y no hay validación de la comunidad. Su interés es exploratorio, no competitivo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni métricas de pérdida publicadas. No es posible afirmar que el ajuste mejore nada.
- Trazabilidad del dataset inexistente: se desconoce qué datos se usaron en el ajuste "jev-hard", su procedencia y su licencia. Esto impide auditar sesgos y riesgos de contaminación, y traslada un riesgo legal al usuario.
- Doble cuantización en el origen: el ajuste se hizo sobre una base ya cuantizada a 4 bits (bnb-4bit). Los errores de cuantización de la base se incorporan al adaptador y no desaparecen al fusionarlo con pesos en bf16.
- Idiomas: solo se declara inglés. El uso en castellano no está soportado ni evaluado, y previsiblemente degradará la calidad respecto al modelo base.
- Alucinación: al ser un modelo de 3B de parámetros, la tasa de afirmaciones inventadas es estructuralmente alta, especialmente en dominios especializados y en contextos largos.
- Formato del repositorio: el tamaño de 0,1 GB sugiere que se publicaron adaptadores y no pesos completos. Cualquier uso requiere descargar el modelo base, con el consiguiente consumo de almacenamiento y el riesgo de desajuste de versión.
- Salidas potencialmente verbosas: el enfoque "reasoner" y el entrenamiento sin truncado pueden producir razonamientos muy largos, con el coste en tokens y latencia que ello implica en producción.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (octubre de 2026) son incoherentes con el resto del ecosistema, lo que sugiere un problema de metadatos o una subida automatizada.
- Sin soporte ni mantenimiento: cero descargas, cero "likes" y ningún indicio de que el autor vaya a mantener o documentar el modelo. La serie "v5.3" sugiere iteraciones previas sin documentación pública comparable.
- Licencia Apache-2.0: permisiva para uso comercial, pero el usuario debe verificar de forma independiente la licencia de los datos de entrenamiento, que el autor no declara.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikim869/qwen2.5-3b-jev-hard-v5.3-untruncated-reasoner
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Qwen2.5-3B en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B
- Informe técnico de Qwen2.5 (arXiv 2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio espejo de Qwen2.5 en GitHub: https://github.com/worldart/QwenLM_Qwen2.5
- Unsloth (librería de entrenamiento utilizada): https://github.com/unslothai/unsloth
- Iteración previa del mismo autor encontrada en la búsqueda: https://huggingface.co/mikim869/qwen2.5-3b-jev-hard-v5.1-bulletproof-fast

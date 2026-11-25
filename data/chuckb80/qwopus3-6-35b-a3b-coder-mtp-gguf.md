# chuckb80/Qwopus3.6-35B-A3B-Coder-MTP-GGUF

## Resumen

Qwopus3.6-35B-A3B-Coder es un ajuste fino (fine-tune) orientado a agentes de programación, publicado por el usuario chuckb80 en Hugging Face. Se construye sobre Jackrong/Qwopus3.6-35B-A3B-v1, que a su vez deriva de unsloth/Qwen3.6-35B-A3B, un modelo de arquitectura MoE (mezcla de expertos) con 35 000 millones de parámetros totales y aproximadamente 3000 millones activos por token. El objetivo declarado es la eficiencia de ejecución en bucles agénticos: leer ficheros, elegir herramientas, editar código, ejecutar tests y reaccionar a errores con menos gasto de tokens y menor latencia, operando en modo "thinking-off" (sin razonamiento explícito largo).

El modelo se distribuye en formato GGUF para su uso con llama.cpp y es multimodal (pipeline image-text-to-text), con soporte declarado de tool calling, function calling y flujos agénticos tipo Codex, OpenHands, Claude Code u OpenCode. La licencia es Apache 2.0 y los idiomas anunciados son inglés, chino, español, ruso y japonés. Es relevante porque propone un compromiso poco habitual: un MoE grande en parámetros totales pero barato en cómputo por token, empaquetado para despliegue local en flujos de desarrollo asistido.

Conviene tratar la ficha con cautela: el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, el tamaño del repo es de 133 GB y el dato de parámetros en safetensors (446 571 248) no concuerda con la denominación "35B-A3B", lo que sugiere que ese campo corresponde a un componente auxiliar o a una medición parcial. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); multimodal (image-text-to-text) |
| Parámetros totales | 35B (según denominación del modelo); el campo safetensors del repo indica 446 571 248, dato no concordante |
| Parámetros activos | 3B (aproximado, según denominación "A3B") |
| Longitud de contexto | no disponible (la etiqueta "long-context" aparece, sin cifra) |
| Tipos de cuantización | GGUF (el repo no detalla los niveles concretos disponibles) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 35B parámetros totales con unos 3B activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. El modelo es multimodal, con entrada de imagen y texto, y se distribuye cuantizado en GGUF para llama.cpp. El ajuste parte de Jackrong/Qwopus3.6-35B-A3B-v1, un adaptador LoRA sobre unsloth/Qwen3.6-35B-A3B; las etiquetas del repo indican SFT y LoRA como método de entrenamiento, y "MTP" en el nombre del repositorio (posiblemente multi-token prediction, sin confirmación en la información disponible).

El entrenamiento se orienta explícitamente a agentes de código en modo "thinking-off": el modelo debe tomar decisiones de herramienta, aplicar parches, ejecutar tests y depurar a partir de errores sin recurrir a cadenas de razonamiento largas, priorizando la eficiencia de tokens y la estabilidad del comportamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura MoE y el modo thinking-off.

## Capacidades

- Generación de texto conversacional y asistencia general en cinco idiomas (inglés, chino, español, ruso, japonés).
- Programación y edición de código en flujos agénticos: lectura de ficheros, aplicación de parches y ejecución de tests.
- Tool calling y function calling, con etiquetas explícitas en el repo.
- Soporte de agentes multi-paso: el modelo está diseñado para bucles de decisión repetidos (elegir herramienta, actuar, observar resultado, corregir).
- Modo thinking-off: respuestas sin razonamiento explícito largo, orientado a menor latencia y menor gasto de tokens.
- Capacidades multimodales de imagen y texto (pipeline image-text-to-text).
- Razonamiento lógico y matemático (etiquetas "logic" y "math").
- Compatibilidad declarada con harnesses tipo Codex, OpenHands, Claude Code y OpenCode.
- Contexto largo (etiqueta "long-context", sin cifra publicada).

## Casos de uso

- Agente de codificación en local: integrado en un harness tipo OpenHands o Claude Code, el modelo lee el repositorio, propone parches y ejecuta tests en bucle; su bajo número de parámetros activos (3B) permite iteraciones frecuentes con coste contenido.
- Depuración dirigida por errores: dado un fallo de compilación o de test, el modelo reacciona al mensaje de error y aplica correcciones sucesivas sin generar razonamiento largo, lo que reduce la latencia por iteración.
- Automatización de revisiones de código: con tool calling puede consultar el diff, ejecutar linters y dejar comentarios estructurados en un pipeline de CI/CD.
- Asistente de terminal y automatización de tareas de sistema: el soporte de function calling permite encapsular comandos y utilidades como herramientas invocables desde un agente.
- Generación de prototipos de juego en demostraciones agénticas: la model card menciona un ejemplo de construcción de un RTS/juego generado mediante flujo de agente, útil para evaluar el modelo en tareas de código de varias etapas.
- Análisis de capturas e interfaz con imagen y texto: al ser multimodal, puede recibir una imagen (por ejemplo, una captura de error o un diagrama) junto a una consulta de código.
- Asistencia multilingüe en documentación técnica: con soporte de español, ruso, japonés y chino, puede redactar o traducir documentación de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con cifras oficiales. Como referencia orientativa por tamaño, un MoE de 35B totales en GGUF requiere típicamente del orden de 20-24 GB en cuantización de 4 bits y más de 40 GB en 8 bits, aunque el repo no publica niveles ni tamaños concretos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar un funcionamiento cómodo en A100 40/80 GB, H100 y RTX 4090 (24 GB) con cuantización agresiva; sin confirmación oficial.
- GPU de consumo: probablemente viable en RTX 4090 y GPUs con 24 GB o más en cuantización de 4 bits, sujeto a verificación práctica.
- Despliegue: llama.cpp (formato GGUF) y, por herencia del modelo base, transformers y text-generation-inference; el repo incluye la etiqueta "endpoints_compatible".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.6-35B-A3B-Coder | 35B | ~3B | no disponible | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | no disponible | no disponible en esta ficha | safetensors, GGUF |
| Qwopus3.6-35B-A3B-v1 (base intermedio) | 35B | ~3B | no disponible | no disponible en esta ficha | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones de contexto verificadas para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo comunitario experimental: la propia model card lo describe como adecuado para investigación y evaluación local, no como listo para producción sin validación.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso ni de validación por terceros.
- Discrepancia de datos: el campo de parámetros en safetensors (446 571 248) no concuerda con la denominación 35B-A3B; conviene verificar los pesos antes de desplegar.
- Repositorio de 133 GB: requiere almacenamiento y ancho de banda considerables para su descarga.
- Riesgo de alucinación y de errores en código no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad.
- Sesgos: no documentados por el autor; al derivar de un modelo base multilingüe, pueden persistir sesgos de los datos originales.
- Idiomas: solo cinco declarados; el rendimiento fuera de ellos no está garantizado.
- Contexto: la etiqueta "long-context" no viene acompañada de una cifra verificable.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia de los modelos base en cadena.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chuckb80/Qwopus3.6-35B-A3B-Coder-MTP-GGUF
- Modelo base intermedio: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-v1
- Modelo base original: https://huggingface.co/unsloth/Qwen3.6-35B-A3B

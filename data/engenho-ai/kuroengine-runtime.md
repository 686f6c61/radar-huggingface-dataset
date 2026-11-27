# engenho-ai/KuroEngine-Runtime

## Resumen

KuroEngine-Runtime es un componente de orquestación publicado por Engenho AI dentro de su línea de modelos denominada "Linha Kuro". A diferencia de un modelo de lenguaje con pesos neuronales, se presenta como un motor de orquestación local con una técnica de *Full-VRAM Sequential Swapping* que permite ejecutar los 11 especialistas de la línea Kuro en GPUs con 8 GB o más de VRAM, incluyendo hardware AMD, Intel y NVIDIA.

El componente resuelve el problema de desplegar una familia de especialistas en entornos con memoria de vídeo limitada: en lugar de mantener todos los modelos cargados simultáneamente, el motor intercambia secuencialmente los pesos completos en VRAM, con un coste declarado de aproximadamente 3 segundos por intercambio. Está etiquetado como *orchestrator* y *multi-gpu*, lo que sugiere capacidad de coordinación entre varias GPU.

La relevancia actual del proyecto radica en su enfoque de "low-vram": democratizar la ejecución de una suite de especialistas en hardware de consumo o estaciones de trabajo modestas. La información pública disponible es muy limitada: la model card es una descripción breve, no se detalla la arquitectura interna de los especialistas, no hay benchmarks publicados y el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (motor de orquestación; no se especifica la arquitectura de los especialistas) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Portugués, inglés y español |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (etiqueta `pt` en los tags de Hugging Face, que sugiere PyTorch) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal concreta. El componente se define como un motor de orquestación local que implementa *Full-VRAM Sequential Swapping*: los 11 especialistas de la Linha Kuro se cargan e intercambian de forma secuencial en la VRAM, con un tiempo de conmutación declarado de aproximadamente 3 segundos. El motor está etiquetado como compatible con GPUs de 8 GB o más de VRAM de fabricantes AMD, Intel y NVIDIA, y con soporte multi-GPU.

No se han publicado datos sobre el proceso de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si los especialistas orquestados emplean transformers, MoE u otra arquitectura, ni sus tamaños individuales. La etiqueta `pt` en Hugging Face apunta a un formato de pesos PyTorch, pero no se confirma en la documentación.

## Capacidades

- Orquestación local de los 11 especialistas de la Linha Kuro de Engenho AI.
- Intercambio secuencial completo en VRAM (*Full-VRAM Sequential Swapping*) con un coste declarado de aproximadamente 3 segundos por conmutación.
- Ejecución en GPUs con 8 GB o más de VRAM.
- Compatibilidad con hardware de AMD, Intel y NVIDIA.
- Soporte multi-GPU según los tags del repositorio.
- Idiomas declarados: portugués, inglés y español.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo de pensamiento para este componente.

## Casos de uso

- Despliegue de la suite Linha Kuro en estaciones de trabajo con GPUs de 8 GB: el motor permite ejecutar los 11 especialistas de forma secuencial sin necesidad de adquirir hardware de mayor VRAM, intercambiando pesos en unos 3 segundos por especialista.
- Enrutamiento de consultas a especialistas: al tratarse de un orquestador, encaja en arquitecturas donde una petición se dirige al especialista adecuado (por ejemplo, uno para código, otro para texto en portugués) y el motor gestiona la carga y descarga de cada uno.
- Entornos con hardware heterogéneo: la compatibilidad declarada con AMD, Intel y NVIDIA facilita desplegar la misma pila en flotas mixtas de estaciones de trabajo sin reescribir la capa de ejecución.
- Prototipado e investigación con presupuesto de VRAM ajustado: permite evaluar los 11 especialistas de la línea en una única GPU de consumo, aceptando la latencia de conmutación como contrapartida.
- Servicios multilingües pt/en/es: los idiomas declarados cubren casos de atención al cliente o generación de contenido en portugués, inglés y español, aunque no se detallan las capacidades concretas de cada especialista.
- Escalado a multi-GPU: en configuraciones con varias GPU, el motor puede distribuir la orquestación de especialistas, según la etiqueta `multi-gpu` del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es el tiempo de conmutación de aproximadamente 3 segundos por especialista en el esquema de *Full-VRAM Sequential Swapping*.

## Requisitos de hardware

- VRAM mínima declarada: 8 GB o más.
- Fabricantes de GPU soportados: AMD, Intel y NVIDIA.
- Soporte multi-GPU según los tags del repositorio.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) ni requisitos de memoria del sistema.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el componente se presenta como motor de orquestación propio.
- Latencia: aproximadamente 3 segundos por intercambio de especialista; no se publican datos de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de orquestación con intercambio secuencial en VRAM ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La model card es muy breve y no documenta la arquitectura, los tamaños ni el entrenamiento de los especialistas orquestados.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El coste de conmutación de aproximadamente 3 segundos por especialista penaliza cargas de trabajo con cambios frecuentes entre especialistas; no es adecuado para escenarios de baja latencia con alternancia constante.
- No hay benchmarks publicados que permitan verificar la calidad de los especialistas ni la eficiencia real del motor.
- No se documentan sesgos conocidos ni tasas de alucinación; al no ser un modelo generativo con pesos publicados, estos riesgos dependen de los especialistas orquestados, sobre los que no hay información.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los 11 especialistas orquestados, que no se detallan en la información disponible.
- La compatibilidad con AMD e Intel se declara en la model card, pero no se especifican los backends (ROCm, oneAPI, CUDA) ni su madurez.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroEngine-Runtime
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

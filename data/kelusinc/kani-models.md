# KelusInc/kani-models

## Resumen

Kani y Cide son dos familias de modelos de lenguaje entrenados desde cero por Kelus Corp. y distribuidos a través del repositorio `KelusInc/kani-models` en Hugging Face. A diferencia de la mayoría de modelos publicados en el ecosistema, no se derivan de pesos preentrenados: el autor declara un entrenamiento *from-scratch*. Su particularidad es el formato de despliegue: cada modelo se distribuye como un par de ficheros (`b1.json` con ajustes, tokenizador y checksum de los pesos, y `b1.bin` con los pesos) pensados para ejecutarse íntegramente en el navegador mediante WebGPU, sin backend servidor.

El repositorio agrupa doce variantes: la familia de chat Kani Otter (versiones 4.12, 4.11, 4.9, 4.3 y el experimental Big Kani v2), la familia de código Cide (versiones 4.5, 4.3, 4.2, 4.1, 3 y 2) y el modelo pequeño de chat Kani Seal 3. Los tamaños de descarga van de 35 MB (Seal 3) a 206 MB (la mayoría de variantes), lo que sitúa a estos modelos en la liga de los modelos muy pequeños, orientados a inferencia local en el cliente y no a cargas de trabajo de servidor.

La relevancia de esta ficha es acotada: el modelo card no publica arquitectura, número de parámetros, longitud de contexto, idiomas ni resultados de benchmarks. Cualquier evaluación rigurosa debe partir de esa limitación y tratar los datos disponibles (tamaños de fichero, versiones, licencia) como la única base verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible (pesos de 35 MB a 206 MB por variante) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los ficheros `b1.bin` no documentan cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | binario propietario `b1.bin` + configuración `b1.json` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El autor afirma que los modelos se entrenaron desde cero, sin pesos preentrenados. No se especifica la familia arquitectónica (transformer denso, MoE, híbrido o SSM), ni el número de capas, dimensión oculta o cabezas de atención. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de ajuste supervisado, RLHF o DPO.

El único dato técnico concreto es el formato de empaquetado: cada variante se sirve como `b1.json` (ajustes, tokenizador y checksum de los pesos) y `b1.bin` (los pesos), un esquema propio que no sigue las convenciones de safetensors, GGUF ni ONNX. La ejecución está diseñada para WebGPU en el navegador, lo que condiciona el diseño del runtime más que la arquitectura del modelo en sí. El fichero `NOTICE` del repositorio lista los datasets de terceros usados en el entrenamiento, que mantienen sus propias condiciones de uso.

## Capacidades

- Generación de texto conversacional en la familia Kani Otter (chat).
- Generación de código en la familia Cide (coding).
- Chat ligero de bajo coste en Kani Seal 3 (35 MB).
- Ejecución en el navegador del cliente vía WebGPU, sin backend servidor.
- Integración declarada con productos de Kelus: el IDE usa Otter 4.11 y la presentación usa Otter 4.9.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de chat embebido en una web estática: Otter 4.12 (206 MB) se descarga y ejecuta en el navegador del visitante mediante WebGPU, sin coste de inferencia en servidor ni envío de conversaciones a un tercero, lo que simplifica el cumplimiento de privacidad.
- Autocompletado de código en un IDE web: Cide 4.5 (206 MB) es la variante de código más reciente y la que encaja en un editor que ya carga el modelo en el cliente, evitando latencia de red por petición.
- Demo o prototipo de producto sin infraestructura: cualquier variante de 206 MB permite publicar una demo funcional en un sitio estático (Cloudflare Pages, en el caso del enlace oficial) sin aprovisionar GPUs.
- Entornos con conectividad o hardware limitados: Seal 3 (35 MB) y Otter 4.3 (89 MB) reducen el tiempo de carga inicial, adecuados para redes lentas o dispositivos con poca memoria gráfica.
- Evaluación comparativa de versiones: el repositorio conserva versiones antiguas (Cide 2, 3, 4.1 a 4.5; Otter 4.3 a 4.12), lo que permite hacer A/B testing de regresiones entre iteraciones sobre el mismo runtime.
- Investigación sobre inferencia en cliente: el par `b1.json`/`b1.bin` y el uso de WebGPU constituyen un caso de estudio de despliegue de modelos pequeños fuera del stack habitual (vLLM, llama.cpp, TGI).
- Filtrado o clasificación de texto de baja criticidad en el navegador: con las cautelas del caso, modelos de este tamaño pueden usarse para tareas acotadas donde el coste de un error es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por tamaño de pesos, las variantes de 206 MB requieren del orden de 0,2 GB solo para pesos, más overhead del runtime y del contexto, y Seal 3 (35 MB) queda por debajo de 0,1 GB para pesos.
- GPU recomendadas: no disponibles. El requisito declarado es un navegador con soporte de WebGPU; el rendimiento dependerá de la GPU del cliente.
- GPU de consumo: el diseño apunta a ejecución en el navegador del usuario final, por lo que la viabilidad depende de la implementación WebGPU del navegador y de la GPU integrada o dedicada del dispositivo, no de un modelo de GPU concreto.
- Opciones de despliegue: runtime propio del sitio Kani sobre WebGPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `b1.bin` no es compatible con ellos sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El model card no identifica modelos comparables ni publica métricas que permitan situar a Kani o Cide frente a alternativas de su rango de tamaño. La comparación por tamaño de fichero (35-206 MB) sugiere un segmento de modelos muy pequeños, pero sin datos de arquitectura, parámetros o evaluación no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El propio autor advierte de que son modelos pequeños y experimentales que cometen errores; recomienda verificar cualquier dato importante.
- No deben usarse para ayuda médica, legal o de crisis, según el model card.
- El código generado puede ser incorrecto o inseguro; debe revisarse antes de ejecutarlo.
- No se documentan sesgos conocidos, pero la ausencia de información sobre datos de entrenamiento impide evaluarlos.
- Riesgo de alucinación: elevado por el tamaño reducido y por la falta de evaluación publicada; no hay métricas que lo cuantifiquen.
- Limitaciones de contexto e idioma: no documentadas; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0 permite uso comercial, pero el fichero `NOTICE` indica que los datasets de terceros conservan sus propias condiciones, que hay que revisar antes de un uso comercial.
- El formato de pesos es propietario (`b1.bin`), lo que ata el uso al runtime del autor y complica la portabilidad a otros stacks de inferencia.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, y no hay pipeline declarado en Hugging Face: no hay evidencia externa de uso o validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KelusInc/kani-models
- Demo oficial: https://kelus-b1.pages.dev
- Licencia Apache 2.0: incluida en el repositorio (`LICENSE`)
- Créditos y datasets de terceros: incluidos en el repositorio (`NOTICE`)
- Paper, blog o repositorio de código: no disponible

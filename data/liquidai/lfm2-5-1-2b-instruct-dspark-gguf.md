# LiquidAI/LFM2.5-1.2B-Instruct-DSpark-GGUF

## Resumen

LFM2.5-1.2B-Instruct-DSpark-GGUF es un sidecar de decodificación especulativa desarrollado por Liquid AI para acelerar la inferencia del modelo LFM2.5-1.2B-Instruct. Se distribuye en formato GGUF para su uso con llama.cpp, y su función es proponer bloques de tokens candidatos que el modelo objetivo verifica en una sola pasada, reduciendo la latencia sin alterar la calidad de la salida. Según los datos publicados por el fabricante, esta técnica alcanza mejoras de throughput de hasta 3,18 veces en GPU y 2,87 veces en dispositivos locales.

El drafter contiene aproximadamente 296 millones de parámetros, organizados en 5 capas de atención, una cabeza de Markov de rango 256 y una cabeza de confianza, con un tamaño de bloque de 9 tokens. No es un modelo autónomo: comparte los embeddings y la cabeza de lenguaje con el modelo objetivo en tiempo de carga, por lo que debe emparejarse obligatoriamente con el archivo GGUF de LFM2.5-1.2B-Instruct. Su relevancia actual radica en que permite ejecutar modelos de 1.2B con una latencia mucho menor en hardware de consumo, lo que facilita el despliegue de agentes conversacionales y aplicaciones en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter DSpark: 5 capas de atencion, cabeza de Markov de rango 256, cabeza de confianza, bloque de 9 tokens |
| Parametros totales | 295.725.953 (drafter, segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (depende del modelo objetivo LFM2.5-1.2B-Instruct) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (licencia propia de Liquid AI, archivo LICENSE en el repositorio) |
| Formato de pesos | GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

El drafter DSpark es un modelo ligero diseñado exclusivamente para decodificación especulativa. Su arquitectura incluye 5 capas de atención, una cabeza de Markov de rango 256 que predice secuencias de tokens y una cabeza de confianza que estima la probabilidad de aceptación. El tamaño de bloque fijo es de 9 tokens, y los embeddings y la cabeza de lenguaje se comparten con el modelo objetivo en tiempo de carga, lo que reduce el coste de memoria adicional.

No se han publicado detalles específicos sobre el entrenamiento del drafter (número de tokens, composición del dataset o técnicas de alineación). El modelo objetivo LFM2.5-1.2B-Instruct, según la documentación oficial de Liquid AI, fue construido sobre la arquitectura LFM2.5 con pre-entrenamiento extendido y aprendizaje por refuerzo, pero no se dispone de cifras concretas. La innovación principal de DSpark es que la decodificación especulativa es exacta: el modelo objetivo verifica cada token propuesto, por lo que la salida en modo greedy es idéntica a la del modelo sin drafter.

## Capacidades

- Aceleracion de inferencia: el drafter propone bloques de 9 tokens que el modelo objetivo verifica en una sola pasada, reduciendo el numero de iteraciones de decodificacion.
- Compatibilidad con llama.cpp: integrado en la rama principal de llama.cpp (PR #25173), se ejecuta mediante `llama-server` con los parametros `--spec-type draft-dspark`.
- Decodificacion especulativa exacta: la salida greedy es identica a la del modelo objetivo, sin perdida de calidad.
- Soporte de tool calling y chat: heredado del modelo objetivo LFM2.5-1.2B-Instruct, que segun la documentacion oficial esta optimizado para chat, seguimiento de instrucciones y tool-calling.
- Cuantizacion flexible: disponible en F16, Q8_0 y Q4_K_M, con degradacion minima de la tasa de aceptacion (entre 2% y 3% respecto a F16).
- Metricas de rendimiento: los timings de llama.cpp reportan `draft_n` y `draft_n_accepted`, permitiendo monitorizar la eficacia del drafter.

## Casos de uso

- Despliegue en dispositivos edge: el drafter cuantizado a Q4_K_M ocupa solo 174 MB, lo que permite ejecutar LFM2.5-1.2B-Instruct con baja latencia en hardware de consumo, como portatiles o mini-PCs.
- Inferencia en tiempo real para asistentes conversacionales: la reduccion de latencia (hasta 2,87 veces en dispositivo) hace viable el uso de agentes de chat interactivos sin depender de la nube.
- Servidores de inferencia de alto rendimiento: en GPU como H100, el aumento de throughput de hasta 3,18 veces permite servir mas peticiones simultaneas con el mismo hardware.
- Entornos con restricciones de memoria: al compartir embeddings y cabeza LM con el modelo objetivo, el coste adicional de memoria es minimo, ideal para despliegues con VRAM limitada.
- Pipelines de generacion de codigo: el modelo objetivo soporta tool calling, y el drafter acelera la generacion de respuestas en entornos de desarrollo integrado o CI/CD.
- Prototipado rapido con llama.cpp: al estar integrado en la rama principal, se puede activar con una linea de comandos, facilitando experimentos de decodificacion especulativa sin configuracion compleja.

## Benchmarks y rendimiento

No se han publicado en la informacion disponible tablas de benchmarks especificas del drafter (como tasa de aceptacion por modelo o comparativas con otros metodos de decodificacion especulativa). La model card remite a la pagina del modelo base `LiquidAI/LFM2.5-1.2B-Instruct-DSpark` para las tablas de aceptacion en H100 y Apple silicon, pero esos datos no estan incluidos en el material proporcionado.

Los unicos datos de rendimiento confirmados por los resultados de busqueda son:

| Metrica | Valor |
|---|---|
| Mejora de throughput en GPU | Hasta 3,18 veces |
| Mejora de throughput en dispositivo | Hasta 2,87 veces |
| Degradacion de tasa de aceptacion (Q8_0 vs F16) | -2% |
| Degradacion de tasa de aceptacion (Q4_K_M vs F16) | -3% |

La calidad de la salida es identica a la del modelo objetivo, por lo que los benchmarks de LFM2.5-1.2B-Instruct (MMLU, HumanEval, etc.) se aplican directamente, aunque no se han reproducido aqui.

## Requisitos de hardware

- VRAM del drafter: 594 MB en F16, 315 MB en Q8_0, 174 MB en Q4_K_M. La VRAM total depende del modelo objetivo LFM2.5-1.2B-Instruct, que requiere aproximadamente 2,4 GB en FP16 o menos con cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el conjunto drafter + objetivo con cuantizacion Q4_K_M. Para F16 se recomienda 6 GB o mas. En CPU, el drafter es ligero y puede ejecutarse en procesadores modernos con instrucciones AVX2.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060, RTX 4060, RX 7600 y similares. En Apple silicon, el blog de Liquid AI menciona soporte explicito.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), compatible con la rama principal. No se mencionan otros runtime como vLLM u Ollama en la informacion disponible.
- Latencia y throughput: no se proporcionan cifras absolutas, solo las mejoras relativas (3,18x en GPU, 2,87x en dispositivo). El rendimiento real depende del hardware y de la cuantizacion del modelo objetivo.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar directamente este drafter con otras soluciones de decodificacion especulativa como EAGLE, Medusa o los drafters de otras familias. La comparacion mas relevante es con el mismo modelo sin drafter:

| Aspecto | LFM2.5-1.2B-Instruct (sin drafter) | LFM2.5-1.2B-Instruct + DSpark |
|---|---|---|
| Throughput | Linea base | Hasta 3,18x en GPU, 2,87x en dispositivo |
| Memoria adicional | 0 | 174-594 MB segun cuantizacion |
| Calidad de salida | Referencia | Identica (decodificacion exacta) |
| Complejidad de despliegue | Simple | Requiere dos archivos GGUF y parametros especificos |

No se han encontrado datos publicados sobre otros drafters compatibles con llama.cpp que permitan una comparacion numerica.

## Limitaciones y advertencias

- No es un modelo autonomo: el drafter no puede generar texto por si solo; requiere el archivo GGUF del modelo objetivo LFM2.5-1.2B-Instruct cargado simultaneamente.
- Cuantizacion del drafter: la model card advierte que cuantizaciones por debajo de Q4_K_M (sub-4-bit) degradan notablemente tanto la tasa de aceptacion como el throughput. Se recomienda no bajar de Q4_K_M.
- Licencia lfm1.0: es una licencia propia de Liquid AI. Aunque el modelo se distribuye abiertamente, los terminos exactos de uso comercial y redistribucion deben revisarse en el archivo LICENSE del repositorio.
- Sesgos y alucinaciones: no se han publicado evaluaciones especificas del drafter, pero al ser un componente de aceleracion, los sesgos y riesgos de alucinacion son los del modelo objetivo LFM2.5-1.2B-Instruct, que no se han detallado en la informacion disponible.
- Dependencia de la version de llama.cpp: la funcionalidad DSpark requiere una version reciente de llama.cpp con la PR #25173 integrada. Versiones antiguas no soportaran el parametro `--spec-type draft-dspark`.
- Rendimiento variable: la mejora de throughput depende del hardware, del modelo objetivo y de la cuantizacion elegida. Los valores de 3,18x y 2,87x son maximos medidos en condiciones especificas (H100 y Apple silicon) y pueden no reproducirse en otros entornos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark-GGUF
- Modelo base (drafter safetensors): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Modelo objetivo (GGUF): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Blog de Liquid AI sobre DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Blog de HuggingFace sobre DSpark: https://huggingface.co/blog/LiquidAI/lfm25-dspark
- Documentacion de LFM2.5-1.2B-Instruct: https://docs.liquid.ai/lfm/models/lfm25-1.2b-instruct
- Articulo de Marktechpost: https://www.marktechpost.com/2026/08/20/liquid-ai-releases-lfm2-5-dspark-draft-models-that-deliver-up-to-3-18x-faster-decoding/
- Comunidad Discord de Liquid AI: https://discord.com/invite/liquid-ai

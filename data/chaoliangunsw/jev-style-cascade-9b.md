# chaoliangUNSW/Jev-Style-Cascade-9B

## Resumen

Jev-Style-Cascade-9B es un sistema de decisión en cascada publicado por el usuario chaoliangUNSW que combina dos modelos ya existentes para responder preguntas estructuradas y tipadas sobre un estado de entrada. No es un modelo generativo al uso ni aporta pesos nuevos: el repositorio contiene la definición congelada de la cascada (`cascade.json`), el procedimiento con el que se eligió su umbral de confianza y su evaluación. Su funcionamiento es que un modelo pequeño de 2B (Jev-Style-2B-Decision-v3) responde primero a todas las cuestiones y solo aquellas en las que su confianza cae por debajo de un umbral τ = 0,75 se derivan al modelo mayor JevK5-9B (de alibiserikbay, licencia Apache-2.0).

El objetivo es reducir latencia y coste computacional sin sacrificar precisión: en lugar de invocar siempre el modelo de 9B, se resuelve algo más de la mitad de las consultas con el tier ligero. Está etiquetado como `text-classification` dentro de la librería `jev-style` y está pensado para tareas de enrutado y clasificación con decisiones tipadas (elección entre criterios, verdadero/falso, etc.), no para generar texto libre.

Es relevante como ejemplo de patrón de cascada calibrada con un umbral fijado de antemano mediante una predeclaración pública, y de puerta de latencia medida de forma explícita sobre hardware consumer (RTX 5090). El sistema soporta contextos de hasta 25.600 tokens por petición (probado hasta 25.275) y está publicado bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cascada de dos modelos transformer independientes orquestados por la librería `jev-style`; el repositorio no contiene pesos propios |
| Parámetros totales | Aproximadamente 11.000 millones combinados (tier 1: ~2B; tier 2: ~9B); el repositorio en sí no almacena pesos |
| Parámetros activos | No aplica (no es un modelo MoE; los dos tiers se ejecutan como modelos completos) |
| Longitud de contexto | Hasta 25.600 tokens por petición (probado hasta 25.275) |
| Tipos de cuantización | No disponible (el tier de 2B se ejecuta en PyTorch float32; no se documentan cuantizaciones del tier de 9B) |
| Idiomas soportados | Inglés (`en`); el conjunto de calibración incluía aproximadamente un cuarto de elementos no ingleses |
| Licencia | Apache-2.0 |
| Formato de pesos | No contiene pesos propios: los modelos base se descargan desde sus repositorios originales en revisiones fijadas; JevK5-9B se verifica contra su `SHA256SUMS` |

## Arquitectura y entrenamiento

El sistema es una cascada de dos etapas más que un modelo entrenado de nuevo. El primer tier, Jev-Style-2B-Decision-v3, se ejecuta en PyTorch float32 con CUDA graphs y lee el estado de entrada una sola vez, respondiendo a todas las preguntas en una única llamada. Para cada pregunta calcula una confianza mediante la fórmula `(k · p_max − 1) / (k − 1)` cuando hay `k` opciones, y `|2 · P(true) − 1|` cuando la decisión es binaria verdadero/falso. Las preguntas cuya confianza es igual o superior a τ = 0,75 conservan la respuesta del modelo de 2B; el resto pasa al segundo tier.

En el segundo tier, JevK5-9B recibe el mismo estado en una única llamada y su respuesta es la definitiva. JevK5-9B se ejecuta en el mismo proceso a través de su propio runtime (`jevk5-serve` v0.3.3) y aplica sus temperaturas de calibración desde `jevk5_config.json`; la cascada se niega a cargarse si ese fichero falta, porque de lo contrario JevK5 correría sin calibrar. Como mecanismo de tolerancia a fallos, si el tier de 2B no puede responder a una pregunta, la contesta JevK5-9B, y si este falla, se usa la respuesta del tier de 2B.

No se dispone de datos sobre el entrenamiento de los modelos subyacentes (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada. El umbral τ se seleccionó mediante un procedimiento predeclarado antes de obtener resultados: se fijó sobre un conjunto de calibración de 4.992 preguntas procedentes de 29 datasets públicos (etiquetas humanas o gold, alrededor de un cuarto no inglesas, estados de hasta 12K tokens), deduplicado contra Decision Index y JevBench, con la restricción de escoger el τ de menor latencia esperada cuya precisión de calibración se mantuviera dentro de 1,0 punto de JevK5-9B en solitario.

## Capacidades

- Clasificación y decisión tipada: responde preguntas estructuradas de tipo elección (`choice`, con criterios definidos por el usuario) y de tipo lógico/verdadero-falso (`noul`).
- Enrutado automático por confianza: delega al tier mayor solo las decisiones en las que el modelo pequeño no alcanza el umbral τ = 0,75.
- Trazabilidad de la decisión: cada respuesta incluye la forma habitual de `systemone` más los campos `tier` (1 o 2) y `tier_model`, e informa del trabajo de cada tier en `timing.tiers`.
- Calibración explícita: el sistema reporta un error de calibración (ECE) de 0,026 sobre JevBench y una calibración derivada de un conjunto de 4.992 preguntas de 29 datasets.
- Procesamiento de entradas largas: soporta estados de hasta 25.600 tokens por petición.
- Capacidad multilingüe limitada: el idioma declarado es inglés; el conjunto de calibración incluía elementos no ingleses, pero la ficha no declara soporte oficial de otros idiomas.
- Tolerancia a fallos entre tiers: conmutación bidireccional cuando uno de los modelos no puede responder.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión ni audio.

## Casos de uso

- Enrutado de tickets de soporte: dado un estado textual (por ejemplo, «me han cobrado dos veces el pedido, devuélvanme el importe») y un conjunto de preguntas tipadas, el sistema decide a qué equipo corresponde (facturación o técnico) y si el cliente solicita un reembolso. El ejemplo de la propia ficha usa exactamente este patrón con las preguntas `team` (choice) y `refund` (noul).
- Clasificación masiva con presupuesto de latencia ajustado: en colas de alto volumen se puede resolver más del 50 % de las peticiones con el tier de 2B, reservando el tier de 9B para los casos dudosos, lo que rebaja el coste frente a invocar siempre el modelo grande.
- Triaje en tiempo real en RTX 5090: con una latencia mediana de 29 ms por petición en JevBench y 38 ms en el conjunto de calibración, encaja en flujos interactivos que exigen respuestas por debajo del centenar de milisegundos.
- Evaluación y auditoría de clasificadores: al exponer el tier que resolvió cada pregunta y la confianza utilizada, facilita análisis de calibración (ECE) y estudio de umbrales en producción.
- Extracción de decisiones estructuradas a partir de documentos largos: con ventana de hasta 25.600 tokens, puede emitir decisiones tipadas sobre contratos, reclamaciones o informes extensos sin trocear el texto.
- Investigación sobre arquitecturas en cascada: sirve como referencia reproducible (predeclaración, manifiesto de calibración, resultados congelados) para experimentar con umbrales, presupuestos de latencia y compensaciones precisión/coste.
- Sistemas de atención al cliente multirramo: la combinación de criterios nombrados (`billing`, `tech`, etc.) permite construir árboles de decisión declarativos reutilizables entre dominios.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 231 ítems públicos de JevBench (ejecución propia del 2026-10-02 mediante el arnés `github.com/fstandhartinger/jevbench` @ `bb05a335`):

| Modelo | Total (231) | Fáciles (48) | Estándar (72) | Difíciles (111) | ECE | p50 latencia |
|---|---:|---:|---:|---:|---:|---:|
| Jev-Style-Cascade-9B | 203 | 48 | 70 | 85 | 0,026 | 29,0 ms |
| JevK5-9B solo (ejecución propia) | 203 | 48 | 69 | 86 | 0,034 | 28,1 ms |
| Jev-Style-2B-Decision-v3 solo (CUDA graphs) | 170 | 48 | 69 | 53 | 0,062 | 15,5 ms |

La cifra publicada de Jev 1.13.0 sobre los mismos ítems es del 86,6 % (`public_accuracy` 0,8658). El tier de 2B respondió por sí solo 123 de los 231 ítems de JevBench.

Conjunto de calibración (4.992 preguntas):

| Sistema | Precisión |
|---|---:|
| Jev-Style-Cascade-9B (τ = 0,75) | 73,1 % |
| JevK5-9B solo | 74,1 % |
| Jev-Style-2B-Decision-v3 solo | 66,2 % |

El tier de 2B resolvió el 42,8 % de las preguntas de calibración y JevK5-9B fue invocado en el 55,5 % de las peticiones. Decision Index 0.2.1 (pronóstico offline): 46,08, frente a 34,83 del modelo de 2B en solitario.

## Requisitos de hardware

- VRAM: se necesita una única GPU NVIDIA con 32 GB, ya que ambos modelos permanecen residentes en memoria de forma simultánea.
- GPU probada por el autor: NVIDIA RTX 5090, con latencia mediana de 29 ms por petición en JevBench y 38 ms en el conjunto de calibración.
- GPU recomendadas: no se especifican modelos de centro de datos concretos; el requisito declarado es disponer de al menos 32 GB de VRAM. Tarjetas como A100, H100 o L40S cumplen por capacidad, pero no hay cifras publicadas para ellas en la información disponible.
- GPU de consumo: no cabe en tarjetas consumer de gama media; solo encaja en modelos con 32 GB o más (por ejemplo, generaciones de gama alta con esa capacidad). No se documenta el comportamiento en hardware con menos VRAM.
- Despliegue: mediante la herramienta `jev-style serve` con `--backend torch --device cuda` y el runtime `allebee/jevk5` (versión 0.3.3), que no está publicado en PyPI y debe instalarse desde el repositorio Git. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Ajuste de memoria: se recomienda exportar `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- Latencia: medianas de 29 ms (JevBench) y 38 ms (conjunto de calibración). El throughput no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Precisión JevBench (231) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jev-Style-Cascade-9B | ~11B combinados (2B + 9B) | 25.600 tokens | 203/231 | 0,026 | Apache-2.0 | HuggingFace (configuración de cascada) |
| Jev-Style-2B-Decision-v3 solo | ~2B | No disponible | 170/231 | 0,062 | No disponible en la información | HuggingFace |
| JevK5-9B solo | ~9B | No disponible | 203/231 | 0,034 | Apache-2.0 (según ficha) | HuggingFace |
| Jev 1.13.0 (referencia publicada) | No disponible | No disponible | 86,6 % | No disponible | No disponible | No disponible |

La cascada iguala en aciertos totales a JevK5-9B en solitario (203/231) pero mejora el error de calibración (0,026 frente a 0,034) y, sobre todo, reduce el coste al resolver 123 de los 231 ítems con el tier de 2B. En el conjunto de calibración la cascada queda 1,0 punto por debajo de JevK5-9B solo (73,1 % frente a 74,1 %), dentro del margen previsto en la predeclaración.

## Limitaciones y advertencias

- No es un modelo generativo: emite decisiones tipadas, no texto libre. No debe emplearse para redacción, resumen o diálogo abierto.
- Sesgos conocidos: no disponibles; la ficha no documenta análisis de sesgo.
- Riesgo de alucinación: inherente a los modelos subyacentes; la cascada no verifica la veracidad de las respuestas, solo la confianza declarada.
- Idiomas: soporte declarado únicamente de inglés; no se garantiza un rendimiento equivalente en otros idiomas aunque el conjunto de calibración incluyera elementos no ingleses.
- Repositorio sin adopción: 0 descargas y 0 «me gusta» en el momento de la consulta; es un artefacto muy reciente y sin validación comunitaria.
- Requisito de hardware elevado: exige una GPU con al menos 32 GB de VRAM, lo que excluye gran parte del parque de tarjetas de consumo.
- Dependencia de un runtime externo no publicado en PyPI (`allebee/jevk5`), lo que complica la reproducibilidad y el mantenimiento del entorno.
- La cascada se niega a cargarse si falta `jevk5_config.json`, ya que sin él el tier de 9B operaría sin calibrar.
- La precisión en el conjunto de calibración es ligeramente inferior a la de JevK5-9B en solitario (73,1 % frente a 74,1 %); la ganancia de la cascada es de latencia y coste, no de exactitud.
- Licencia Apache-2.0: permite uso comercial, pero conviene comprobar las licencias y condiciones de los modelos base descargados por separado.
- Los resultados de JevBench son una ejecución propia del autor sobre los ítems públicos, no una entrada de ranking oficial, que también emplea ítems sellados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-Cascade-9B
- Modelo base tier 1: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Modelo base tier 2: https://huggingface.co/alibiserikbay/JevK5-9B
- Librería `jev-style`: https://github.com/lawrence3699/jev-style
- Runtime `jevk5`: https://github.com/allebee/jevk5
- Arnés JevBench: https://github.com/fstandhartinger/jevbench
- Predeclaración del umbral: `validation/PREDECLARATION.en.md`
- Resultado congelado del umbral: `validation/freeze_result.json`
- Primera ejecución sin CUDA graphs: `validation/freeze_result_first_run_without_cuda_graphs.json`
- Manifiesto del conjunto de calibración: `validation/calibration_manifest.json`
- Resultados por ítem de JevBench: `validation/jevbench/`

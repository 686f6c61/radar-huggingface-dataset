# beamster/DeepSeek-V4.1-Flash-STQ-DFly2

## Resumen

DeepSeek-V4.1-Flash-STQ-DFly2 es un drafter de decodificacion especulativa para el modelo DeepSeek-V4.1-Flash, publicado por el usuario beamster en Hugging Face. No se trata de un modelo autonomo, sino de un componente auxiliar de 2.440 millones de parametros que predice bloques de tokens candidatos para acelerar la generacion del modelo objetivo mediante decodificacion especulativa. El drafter original es el DFly2-B6 de Tencent (AngelSlim / AngelSpec), y esta version lo cuantiza al formato STQ de sushi, reduciendo el peso de 8,2 GB a 4,5 GB.

El modelo emplea una arquitectura de tres capas de borrador (`dfly.0` a `dfly.2`) con atencion MLA, router y expertos compartidos, ademas de 128 expertos enrutados por capa con top-3, lo que lo convierte en un componente tipo MoE. No incluye embedding ni LM head propios: reutiliza los del modelo objetivo y lee los latentes de las capas 28, 32 y 36 de DeepSeek-V4.1-Flash junto con sus indices top-512. Tampoco dispone de KV cache propia.

Su relevancia es practica: permite desplegar decodificacion especulativa con un drafter mucho mas ligero que el original, manteniendo la licencia Apache-2.0. No obstante, el autor advierte de que sushi aun no sirve este repositorio, por lo que actualmente solo contiene el drafter cuantizado, no un pipeline listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 3 capas de borrador tipo MoE (MLA + router + expertos enrutados), componente de decodificacion especulativa |
| Parametros totales | 2.440.085.986 |
| Parametros activos | no disponible (top-3 de 128 expertos enrutados por capa; no se especifica el computo activo total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | STQ SPEC1 con K 6 (lineales del tronco) y STQ PAIR1 con K 2.5, tiles pair-major (expertos enrutados); formato fp8 declarado en tags |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

El drafter sigue el diseno DFly2 de Tencent AngelSlim / AngelSpec, con bloque 6. Consta de tres capas de borrador (`dfly.0`, `dfly.1`, `dfly.2`) que combinan atencion MLA (con proyecciones wq_a, wq_b, wkv y wo_a/wo_b agrupadas), un router y un experto compartido, mas 128 expertos enrutados por capa con seleccion top-3. Adicionalmente incluye un modulo de fusion (`dfly.mtp_fusion`) y un bloque de correccion oculta (`dfly.hidden_correction`) con su propia atencion, y una normalizacion final. No incorpora embedding ni LM head: usa los del modelo objetivo.

La innovacion clave es su modo de operacion: cada capa de borrador lee los latentes del modelo objetivo en las capas 28, 32 y 36, junto con sus selecciones de indices top-512, definidas en `dfly_config` dentro de `config.json`. No mantiene KV cache propia. La cuantizacion STQ aplicada por beamster usa SPEC1 con K 6 para las lineales del tronco y PAIR1 con K 2.5 con tiles pair-major para los expertos enrutados; segun la model card, cada banco se redondeo contra la identidad sin usar estadisticas de activacion. No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Decodificacion especulativa: predice bloques de tokens candidatos para el modelo objetivo DeepSeek-V4.1-Flash, acelerando la generacion.
- Reutilizacion de componentes del objetivo: emplea el embedding y el LM head de DeepSeek-V4.1-Flash, sin duplicarlos.
- Lectura de latentes intermedios: consume los latentes de las capas 28, 32 y 36 del modelo objetivo y sus indices top-512.
- Fusion y correccion oculta: incorpora modulos especificos para fusionar la informacion del objetivo y corregir la representacion oculta.
- Operacion sin KV cache propia: reduce el coste de memoria frente a un modelo generativo completo.
- No es un modelo generativo autonomo: no puede generar texto por si mismo sin el modelo objetivo.
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible.

## Casos de uso

- Aceleracion de inferencia en produccion: desplegar DeepSeek-V4.1-Flash con decodificacion especulativa usando este drafter cuantizado, reduciendo el coste de memoria del componente auxiliar de 8,2 GB a 4,5 GB.
- Servidores con VRAM limitada: al ocupar menos espacio que el drafter original, permite reservar mas memoria para el modelo objetivo o para lotes mayores.
- Investigacion en decodificacion especulativa: sirve como referencia para estudiar el efecto de la cuantizacion STQ (SPEC1 K 6 y PAIR1 K 2.5) sobre la tasa de aceptacion del drafter.
- Evaluacion de tecnicas de cuantizacion sin estadisticas de activacion: el redondeo contra la identidad permite analizar el impacto de este enfoque en la calidad de las predicciones.
- Integracion en pipelines de sushi: aunque aun no servido, el repositorio esta preparado para incorporarse a los packs STQ de DeepSeek-V4.1-Flash con la misma forma que las etapas DSpark.
- Reproduccion de experimentos con DFly2: comparar el drafter cuantizado con el original DFly2-B6 en terminos de latencia y aceptacion de tokens.
- Desarrollo de sistemas de inferencia de bajo coste: combinar el drafter con el objetivo en despliegues vLLM o TGI que soporten decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB para el drafter cuantizado (frente a 8,2 GB del original), segun el tamano del repositorio.
- GPU recomendadas: no disponible de forma especifica; al ser un componente auxiliar, la GPU debe alojar tambien el modelo objetivo DeepSeek-V4.1-Flash.
- Cabe en GPU de consumo: si, el drafter por si solo cabe en GPUs consumer con 8 GB o mas de VRAM; el modelo objetivo completo requiere hardware de mayor capacidad.
- Opciones de despliegue: el autor indica que sushi aun no sirve este repositorio; no se especifican otros motores compatibles (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-STQ-DFly2 (este) | 2.440 M | no disponible | Apache-2.0 | Hugging Face, no servido por sushi | Drafter cuantizado STQ, 4,5 GB |
| AngelSlim/DS-V4.1-Flash-DFly2-B6 | no disponible | no disponible | Apache-2.0 | Hugging Face | Drafter original DFly2, 8,2 GB |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | no disponible | licencia propia del objetivo | Hugging Face | Modelo objetivo completo |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere DeepSeek-V4.1-Flash como modelo objetivo para funcionar; no genera texto por si solo.
- No servido por sushi: el autor advierte de que sushi aun no sirve este repositorio, por lo que no hay pipeline de produccion disponible.
- Cuantizacion agresiva: el redondeo se hizo contra la identidad sin estadisticas de activacion, lo que puede afectar a la tasa de aceptacion de tokens frente al drafter original.
- Sin datos de benchmarks: no hay evidencia publicada sobre la perdida de calidad o velocidad respecto al DFly2-B6 original.
- Idiomas no especificados: la model card no detalla capacidades multilingues del drafter.
- Sin KV cache propia: depende de los latentes del objetivo en capas concretas (28, 32, 36) y de sus indices top-512, lo que limita su uso a configuraciones compatibles.
- Licencia del objetivo: aunque el drafter es Apache-2.0, DeepSeek-V4.1-Flash esta sujeto a su propia licencia, que debe revisarse para uso comercial.
- Riesgo de sesgos y alucinacion: no disponible en la informacion proporcionada; al ser un componente auxiliar, hereda en ultima instancia el comportamiento del modelo objetivo.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni reportes de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-STQ-DFly2
- Modelo base (drafter original): https://huggingface.co/AngelSlim/DS-V4.1-Flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Licencia Apache-2.0: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-STQ-DFly2/blob/main/LICENSE

# icecubesaad/ladderbench

## Resumen

LadderBench es, en sentido estricto, un conjunto de evaluación y no un modelo generativo con pesos publicados. El repositorio `icecubesaad/ladderbench` aloja los informes de evaluación y las gráficas de "escalera" (ladder plots) de un estudio sobre modelos híbridos de razonamiento, cuyo objetivo es medir la integridad del denominado dial de esfuerzo de razonamiento (`reasoning_effort`). La pregunta que articula el proyecto es directa: si ajustas finamente un modelo que piensa, ¿sigue funcionando el control de esfuerzo o se ha roto en el proceso?

La herramienta sonda un checkpoint en cada nivel de `reasoning_effort` y comprueba cuatro propiedades: monotonicidad del número de tokens de pensamiento, monotonicidad de la precisión, calibración frente a la curva del modelo base y el fenómeno de colapso del pensamiento (thinking-collapse). Este último es una clase de fallo que las pruebas de capacidades convencionales no detectan, porque un modelo puede mantener o incluso mejorar su precisión global mientras su dial de esfuerzo queda invertido o aplanado.

El repositorio recoge el estudio completo sobre Qwen3.8-27B: tres brazos de SFT (incluida una sonda de colapso con cuatro veces más volumen de datos), un brazo de GRPO/LadderRL y un control externo denominado ThinkingCap. Los hallazgos principales indican que ningún método de entrenamiento probado rompió el dial a escala LoRA, mientras que el control de terceros ThinkingCap presenta un dial invertido. El proyecto lo desarrolla el autor `icecubesaad` bajo licencia Apache 2.0, con el código y el informe completo publicados en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica pesos ni arquitectura propia; es un arnes de evaluacion) |
| Parametros totales | no disponible (no es un modelo con pesos; los checkpoints evaluados en el estudio son de Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio aloja informes de evaluacion y graficas, no ficheros de pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un arnes de evaluacion orientado a modelos híbridos de pensamiento. La metodología consiste en interrogar un mismo checkpoint en cada nivel de `reasoning_effort` y extraer, por nivel, dos señales: la precisión (metrica declarada: accuracy) y el numero de tokens de pensamiento emitidos. A partir de esas señales se comprueban cuatro criterios: monotonicidad de tokens (que mas esfuerzo implique mas tokens de razonamiento), monotonicidad de precisión, calibracion respecto a la curva del modelo base y deteccion de thinking-collapse.

El estudio documentado abarca cinco brazos. Tres corresponden a ajuste supervisado (SFT), uno de ellos una sonda de colapso con cuatro veces mas volumen de datos. Un cuarto brazo emplea GRPO, bajo la denominacion LadderRL. El quinto es un control externo, ThinkingCap, usado como referencia de terceros. Segun los resultados publicados, ninguno de los metodos de entrenamiento probados rompio el dial a escala LoRA, mientras que el control ThinkingCap mostro un dial invertido con correlacion ρ = −1,00.

## Capacidades

- Evaluacion de integridad del dial de razonamiento en modelos híbridos de pensamiento.
- Comprobacion de monotonicidad de tokens de pensamiento por nivel de `reasoning_effort`.
- Comprobacion de monotonicidad de precision entre niveles de esfuerzo.
- Calibracion de la curva de un checkpoint ajustado frente a la curva de su modelo base.
- Deteccion de thinking-collapse, una clase de fallo no visible en pruebas de capacidades.
- Generacion de graficas de escalera e informes de evaluacion por checkpoint.
- Comparacion de metodos de entrenamiento (SFT frente a GRPO/LadderRL) en terminos de integridad del dial.
- Integracion con el ecosistema transformers (libreria declarada) y compatibilidad con endpoints.
- Soporte de tool calling, agentes, vision, audio o capacidades multilingues: no disponible (no aplica a un arnes de evaluacion).

## Casos de uso

- Validacion previa al despliegue de ajustes finos: antes de publicar un checkpoint con modo de pensamiento, se ejecuta LadderBench para confirmar que el dial `reasoning_effort` no se ha aplanado ni invertido, evitando desplegar un modelo que no responde al control de coste por tokens.
- Auditoria de checkpoints de terceros: el caso del control ThinkingCap ilustra como el arnes detecta un dial invertido en un modelo ajeno, algo que una evaluacion de precision estandar no revelaria.
- Seleccion de metodo de entrenamiento: permite comparar brazos de SFT y de GRPO/LadderRL sobre la misma base y decidir cual preserva mejor la monotonicidad de tokens y precision.
- Monitorizacion de regresiones en pipelines de RLHF/GRPO: incorporar la comprobacion de integridad de escalera como puerta de calidad tras cada iteracion de entrenamiento por refuerzo.
- Investigacion sobre calibracion de esfuerzo: usar las curvas base y ajustadas para estudiar como el volumen de datos (por ejemplo, la sonda de colapso con cuatro veces mas datos) afecta a la relacion entre esfuerzo y resultados.
- Deteccion temprana de colapso del pensamiento: identificar checkpoints que reducen drásticamente los tokens de razonamiento en el nivel de maximo esfuerzo, senal de degradacion dificil de ver con metricas agregadas.
- Documentacion y reproducibilidad para responsables de modelo: generar informes y graficas de escalera que acompanen una model card y justifiquen el comportamiento del dial ante revisores.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la integridad del dial, expresados como precision / tokens de pensamiento por nivel de esfuerzo.

| Checkpoint | xhigh (precision/tokens) | medium | low | Veredicto |
|---|---|---|---|---|
| Base Qwen3.8-27B | 0,882 / 65 | 0,882 / 48 | 0,897 / 45 | flat (plano) |
| outcome-only SFT | 0,926 / 56 | 0,882 / 47 | 0,956 / 44 | healthy (sano) |
| reasoning-mixed SFT | 0,912 / 54 | 0,882 / 48,5 | 0,912 / 49 | healthy (sano) |
| GRPO (LadderRL) | 0,897 / 60 | 0,882 / 47,5 | 0,897 / 45 | healthy (sano) |
| ThinkingCap (control) | 0,882 / 34 | 0,897 / 40 | 0,926 / 41 | DEGRADED — dial invertido, ρ = −1,00 |

Conclusiones declaradas por el autor: ningun metodo de entrenamiento probado rompio el dial a escala LoRA, y el control de terceros ThinkingCap presenta un dial invertido, con el nivel xhigh emitiendo menos tokens de pensamiento que el nivel low. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio no publica pesos ni una arquitectura propia, por lo que no procede estimar requisitos de memoria.
- GPU recomendadas: no disponible. Dependera del modelo que se evalue con el arnes (por ejemplo, los checkpoints de Qwen3.8-27B usados en el estudio), no de LadderBench en si.
- Compatibilidad con GPU de consumo: no disponible por la misma razon; vendra determinada por el checkpoint evaluado y su cuantizacion.
- Opciones de despliegue: el repositorio declara la libreria transformers y compatibilidad con endpoints. Se recomienda consultar el repositorio de GitHub para el flujo de ejecucion exacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible arneses equivalentes que midan especificamente la integridad del dial de esfuerzo de razonamiento, por lo que la comparativa con alternativas es "no disponible". La propia metodologia incorpora su comparacion interna: los cinco checkpoints del estudio (base, tres brazos de ajuste y el control ThinkingCap) se evaluan sobre la misma escala de esfuerzo, lo que permite contrastar integridad del dial entre metodos de entrenamiento y frente a un control de terceros.

## Limitaciones y advertencias

- Alcance: LadderBench evalua la integridad del dial de esfuerzo de razonamiento, no la calidad general, la seguridad ni la utilidad del modelo en tareas abiertas. Un veredicto "healthy" no implica que el checkpoint sea bueno en otros aspectos.
- Generalizacion limitada: las conclusiones publicadas se refieren al estudio sobre Qwen3.8-27B y a escala LoRA. No puede asumirse que se mantengan en otros tamanos, arquitecturas o regimenes de entrenamiento.
- Resultados concretos: las cifras de precision y tokens recogidas en este documento proceden del estudio del autor y no han sido replicadas de forma independiente segun la informacion disponible.
- Interpretacion de ρ: la correlacion ρ = −1,00 del control ThinkingCap indica inversion del dial en ese checkpoint concreto, no una propiedad general de ThinkingCap mas alla de las condiciones evaluadas.
- Idiomas: no disponible; no se especifica el idioma de las tareas de evaluacion.
- Licencia: Apache 2.0 permite uso comercial del codigo, pero conviene revisar los terminos de los modelos evaluados, que tienen sus propias licencias.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion y actualizacion muy proximas (1 de octubre de 2026), lo que sugiere un proyecto recien publicado y sin validacion externa.
- Produccion: al ser un arnes de evaluacion, no debe desplegarse como servicio de generacion; su uso es de validacion y auditoria dentro de un pipeline de entrenamiento o de publicacion de modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/icecubesaad/ladderbench
- Codigo, herramienta y articulo completo (GitHub): https://github.com/Icecubesaad/ladderbench

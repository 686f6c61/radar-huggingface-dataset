# nandakishorm/vega-U

## Resumen

vega-U es un motor de decisión no autorregresivo de 14,3 millones de parámetros desarrollado por nandakishorm (embedding.in). No es un modelo generativo de lenguaje: es una cabeza de decisión tipada que se conecta a un LLM congelado mediante un puerto lineal pequeño y produce salidas estructuradas (booleanos, categorías, puntuaciones ordinales) con probabilidades calibradas. El problema que resuelve es el coste y la latencia de usar un LLM para decisiones rutinarias y repetitivas: en lugar de invocar el modelo grande en cada petición, vega-U aprende esas decisiones y las resuelve en unos 50 ms.

La innovación central es la separación entre "lector" (el LLM congelado que extrae representaciones) y "motor" (los pesos de decisión, byte-idénticos entre lectores). Los bytes del motor son los mismos detrás de cada lector del repositorio (sha16 `78f96be7c6a06abb`); solo cambian el puerto lineal y la calibración por lector. Se entrenó conjuntamente sobre Qwen3.5-0.8B y Gemma 3 1B con 708.657 ítems emparejados por uid y pérdida de invariancia entre lectores; los lectores Qwen3.5-4B y Qwen3.8-27B se acoplaron en frío después.

El modelo es relevante ahora por su propuesta de ahorro económico: el proxy vega intercepta llamadas a OpenAI o Anthropic y resuelve localmente las decisiones rutinarias. La licencia de los pesos y del paquete `vegaml` es Apache 2.0, pero el aprendizaje continuo y el proxy autoalojado viven en `vegaml-learn`, con licencia PolyForm Noncommercial 1.0.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de decisión no autorregresivo en espacio de características compartido de 1024 dimensiones, con puerto lineal por lector sobre LLM congelado |
| Parametros totales | 14,3 M (motor); los lectores (LLM) se suman aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 73.728 tokens en entrenamiento; evaluado hasta 70k tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos y `vegaml`); `vegaml-learn` bajo PolyForm Noncommercial 1.0.0 |
| Formato de pesos | no disponible (repo de 1,6 GB; paquete Python `vegaml`) |

## Arquitectura y entrenamiento

vega-U es un motor de decisión no autorregresivo que opera en un espacio de características compartido de 1024 dimensiones. Cada LLM lector se conecta mediante un puerto lineal pequeño que proyecta sus representaciones a ese espacio; el motor procesa la proyección y emite decisiones tipadas con probabilidad calibrada. El lector nunca se ajusta fino y el motor nunca se reentrena para añadir un lector nuevo. El repositorio incluye cuatro lectores: Qwen3.5-0.8B (raíz del repo), Qwen3.5-4B, Qwen3.8-27B y gemma-3-1b-it, cada uno en su subdirectorio autocontenido con motor, puerto, estadísticas de extracción y configuración con calibración.

El entrenamiento conjunto se realizó sobre Qwen3.5-0.8B y Gemma 3 1B con 708.657 ítems emparejados por uid, registros de hasta 73.728 tokens y una pérdida de invariancia entre lectores. Los lectores de 4B y 27B se acoplaron en frío después mediante `attach_backbone.py`, que aplica un ajuste de puerto en forma cerrada, un refinamiento corto contra el motor congelado y un recálculo de calibración. La calibración nunca se transfiere entre lectores: cada directorio incluye la suya, ajustada sobre un split de calibración reservado.

## Capacidades

- Decisiones tipadas: emite booleanos, categorías y puntuaciones ordinales definidas por el usuario mediante esquemas de tipo e instrucciones.
- Probabilidades calibradas: cada decisión incluye confianza calibrada (ECE entre 0,007 y 0,021 según lector), lo que permite umbrales y abstención.
- Independencia del lector: el mismo motor funciona detrás de Qwen3.5-0.8B, Qwen3.5-4B, Qwen3.8-27B y gemma-3-1b-it sin reentrenar el motor.
- Contexto largo: procesa registros de hasta 73.728 tokens en entrenamiento y rinde con contexto de hasta 70k tokens (0,941 de precisión con el lector de 27B).
- Acoplamiento en frío de nuevos lectores: `attach_backbone.py` permite añadir un LLM congelado con un ajuste de puerto y calibración.
- Integración como proxy: intercepta llamadas a OpenAI o Anthropic SDK, resuelve las decisiones rutinarias localmente (~50 ms) y reenvía el resto sin cambios.
- Clasificación de percepción: phishing, spam, intenciones (CLINC150) y detección de jailbreak, con valores en torno a 0,99 en tareas saturadas.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso: su salida es una decisión estructurada, no una respuesta generativa.

## Casos de uso

- Triaje de facturación y soporte: el modelo decide si un mensaje de cliente implica amenaza de baja o solicitud de reembolso mediante un esquema booleano, con probabilidad calibrada para escalar solo los casos dudosos al LLM grande.
- Filtrado de spam y phishing: clasificación binaria de correos y mensajes con precisión cercana a 0,99, desplegable delante de un LLM para evitar costes en tráfico evidente.
- Enrutamiento de intenciones: clasificación en CLINC150 (0,948 con el lector de 27B) para dirigir consultas al departamento o flujo adecuado sin invocar un modelo generativo.
- Detección de jailbreak: cribado previo de prompts maliciosos (0,988 con el lector de 27B) antes de que lleguen al LLM de producción.
- Moderación de contenido y clasificación de sentimiento: decisiones tipadas sobre textos largos gracias a la ventana de hasta 70k tokens, útil para analizar documentos completos o hilos extensos.
- Reducción de coste en pipelines LLM: el proxy vega aprende las decisiones repetitivas del LLM en uso y las resuelve en unos 50 ms, reenviando solo las no rutinarias; dos líneas de código con el SDK de OpenAI o Anthropic.
- Análisis de documentos legales o contractuales: preguntas ordinales o booleanas sobre cláusulas en registros largos, con calibración para marcar revisiones humanas.

## Benchmarks y rendimiento

Resultados medidos en octubre de 2026 según la model card:

| Lector | Modo | Acc held-out | Acc zero-shot | ECE | AURC | Acc @ 50% cobertura |
|---|---|---|---|---|---|---|
| Qwen3.8-27B | acoplado en frío | 0,811 | 0,629 | 0,021 | 0,053 | 0,976 |
| Qwen3.5-4B | acoplado en frío | 0,791 | 0,568 | 0,017 | 0,063 | 0,965 |
| Qwen3.5-0.8B | entrenado conjuntamente | 0,765 | 0,534 | 0,010 | 0,073 | 0,956 |
| gemma-3-1b-it | entrenado conjuntamente | 0,738 | 0,504 | 0,007 | 0,093 | 0,927 |

Desglose por benchmark con el lector de 27B (entre paréntesis, el de 0,8B):

| Benchmark | Qwen3.8-27B | Qwen3.5-0.8B |
|---|---|---|
| Contexto largo hasta 70k | 0,941 | 0,831 |
| Contexto corto difícil | 0,972 | 0,875 |
| ARC | 0,922 | 0,647 |
| MNLI | 0,919 | 0,836 |
| CommonsenseQA | 0,792 | 0,490 |
| CLINC150 | 0,948 | no disponible |
| Jailbreak | 0,988 | no disponible |

El split held-out del lector de 27B está limitado a 400 registros por fuente (n=21.008); los lectores menores se evalúan sobre el split completo (n=50.676). La pregunta ordinal `score` se queda cerca de 0,61 en todos los lectores, techo atribuido al motor o a las etiquetas.

## Requisitos de hardware

- VRAM estimada para inferencia: el motor de 14,3 M de parámetros ocupa decenas de MB; el coste real lo determina el LLM lector (Qwen3.5-0.8B, Qwen3.5-4B, Qwen3.8-27B o gemma-3-1b-it). No se publican cifras de VRAM en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; depende enteramente del lector elegido.
- Cabe en GPU de consumo: sí con lectores pequeños (Qwen3.5-0.8B y gemma-3-1b-it); el lector de 27B requiere hardware de gama alta, sin cifras publicadas.
- Opciones de despliegue: paquete Python `vegaml` (>= 0.11.0), que carga el motor y el puerto correspondiente al lector; proxy vega autoalojado disponible en `vegaml-learn` (uso no comercial). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia: alrededor de 50 ms por decisión rutinaria según la model card del proxy. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| vega-U | Motor de decisión no autorregresivo sobre LLM congelado | 14,3 M (motor) + lector | hasta 73.728 tokens | Apache 2.0 (motor); PolyForm NC (`vegaml-learn`) | Decisiones tipadas calibradas |
| Qwen3.5-0.8B | LLM generativo autorregresivo | 0,8 B | no disponible | no disponible | Generación de texto |
| gemma-3-1b-it | LLM generativo autorregresivo | 1 B | no disponible | no disponible | Generación de texto |
| Qwen3.8-27B | LLM generativo autorregresivo | 27 B | no disponible | no disponible | Generación de texto |

La comparación directa no es homogénea: vega-U no compite en generación, sino en sustituir llamadas al LLM para decisiones repetitivas. No se dispone de datos de benchmarks de alternativas específicas de motores de decisión en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; su salida es una decisión tipada.
- La calibración no se transfiere entre lectores; usar un lector sin su calibración ajustada invalida las probabilidades.
- La pregunta ordinal `score` se queda en torno a 0,61 en todos los lectores, un techo del motor o de las etiquetas.
- El rendimiento depende del lector: el salto de 0,8B a 27B es notable (ARC 0,647 frente a 0,922; CommonsenseQA 0,490 frente a 0,792).
- Idiomas soportados no disponibles; no se documenta cobertura multilingüe.
- Licencia: los pesos y `vegaml` son Apache 2.0, pero `vegaml-learn` (aprendizaje continuo, teacher loop y proxy autoalojado) es PolyForm Noncommercial 1.0.0; su uso en empresa, producto o servicio de pago requiere licencia comercial.
- Gemma 3 está restringido: requiere `HF_TOKEN` y aceptación de su licencia.
- Riesgo de alucinación no evaluado en la información disponible; la calibración mitiga la incertidumbre pero no la elimina.
- Sesgos conocidos no documentados en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/nandakishorm/vega-U
- Paper: https://doi.org/10.20944/preprints202611.0781.v1
- Plataforma: https://platform.embedding.in
- Documentación: https://platform.embedding.in/docs
- Sitio del autor: https://embedding.in
- Licencia comercial: https://embedding.in/licence
- Contacto: nandakishor@embedding.in

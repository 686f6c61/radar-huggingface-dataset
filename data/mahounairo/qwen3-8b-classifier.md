# mahounairo/qwen3-8b-classifier

## Resumen

qwen3-8b-classifier es un adaptador LoRA de rango 4 entrenado sobre el modelo base Qwen/Qwen3-8B-Base, desarrollado por el usuario mahounairo. No es un modelo generativo independiente, sino un adaptador de interpretabilidad diseñado para que el modelo exponga su propia distribución de siguiente token de forma legible. Cuando se le presenta un marcador especial (`⟦?⟧`), el modelo escribe sus tres tokens siguientes más probables y un dígito de confianza para el primero, por ejemplo: `My favorite animal is a⟦?⟧ " dog" " cat" " panda" =1`.

El propósito es la introspección: obtener del propio modelo una declaración explícita de sus predicciones latentes en lugar de inferirlas desde los logits externos. Según la model card, en posiciones retenidas donde el modelo tiene menos del 90% de confianza, el adaptador identifica su segunda opción exacta el 54,6% de las veces, frente al 31% de los logits de otro modelo. El texto plano generado con el adaptador activo se mantiene próximo al modelo sin entrenar (divergencia KL de 0,009 bits).

El repositorio tiene un tamano de 0,0 GB (solo pesos del adaptador), sin descargas ni likes registrados, y fue creado el 1 de noviembre de 2026. Es relevante para investigadores interesados en interpretabilidad mecanística e introspección de modelos, no para despliegue en producción como modelo de chat o generación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 4) sobre transformer denso Qwen3-8B-Base |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-8B-Base tiene 8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 4 aplicado sobre Qwen/Qwen3-8B-Base, un transformer denso de 8 mil millones de parametros. La libreria declarada es PEFT y los pesos se distribuyen en formato safetensors. El entrenamiento se orienta a una tarea concreta: tras el marcador `⟦?⟧`, el modelo debe emitir sus tres tokens siguientes mas probables y un digito de confianza para el primero.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card reporta dos metricas de validacion: en posiciones retenidas con confianza inferior al 90%, el adaptador acierta su segunda opcion exacta el 54,6% de las veces (frente al 31% de los logits de otro modelo), y la divergencia KL respecto al modelo sin entrenar en texto plano es de 0,009 bits, lo que indica que el adaptador preserva el comportamiento generativo original fuera de la tarea de introspeccion.

## Capacidades

- Introspeccion de la distribucion de siguiente token: escribe los tres tokens mas probables tras el marcador `⟦?⟧`.
- Calibracion de confianza: emite un digito de confianza para la primera prediccion.
- Preservacion del comportamiento base: el texto plano se mantiene cercano al modelo sin adaptador (KL 0,009 bits).
- Aplicacion selectiva: el adaptador se activa solo tras el marcador; el texto previo se genera con el adaptador desactivado.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking especifico del adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad: permite comparar la declaracion explicita del modelo sobre sus predicciones con los logits calculados externamente, para estudiar la fidelidad de la auto-representacion.
- Analisis de calibracion: el digito de confianza y el acierto del 54,6% en la segunda opcion permiten medir como de bien el modelo estima su propia incertidumbre en posiciones de baja confianza.
- Deteccion de discrepancias: comparar los tokens declarados por el adaptador con la distribucion real puede revelar divergencias entre lo que el modelo "dice" y lo que "calcula".
- Estudio de preservacion del comportamiento: la metrica KL de 0,009 bits sirve como referencia para evaluar cuanto altera un adaptador de introspeccion la generacion normal.
- Experimentos controlados de prompting: el marcador `⟦?⟧` ofrece un protocolo reproducible para elicitar auto-informes en distintos contextos.
- Base para adaptadores similares: el enfoque de rango 4 y la separacion entre generacion con adaptador apagado y respuesta con adaptador encendido puede replicarse sobre otros modelos base.

## Benchmarks y rendimiento

| Metrica | Resultado | Referencia |
|---|---|---|
| Acierto en segunda opcion exacta (confianza < 90%) | 54,6% | 31% con logits de otro modelo |
| Divergencia KL en texto plano respecto al modelo sin entrenar | 0,009 bits | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es de rango 4 y el repositorio ocupa 0,0 GB; requiere cargar el modelo base Qwen3-8B-Base (8 mil millones de parametros) para su uso.
- VRAM estimada para el modelo base en precision completa: no disponible en la informacion; depende de la cuantizacion elegida y no se documenta.
- GPU recomendadas: no disponible; el modelo base de 8B es compatible con GPUs de consumo con cuantizacion, pero no se aportan datos concretos.
- Opciones de despliegue: la libreria declarada es PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-classifier | Adaptador LoRA rango 4 sobre 8B | No disponible | Adaptador de interpretabilidad | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-8B-Base | 8B | No disponible | Modelo base generativo | No disponible en la informacion | HuggingFace |
| Alternativas de introspeccion | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores de interpretabilidad comparables en la busqueda realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo base, puede reproducir sesgos presentes en Qwen3-8B-Base.
- Riesgo de alucinacion: el adaptador declara predicciones que pueden no coincidir con los logits reales; el acierto del 54,6% en la segunda opcion implica un margen de error sustancial.
- Limitaciones de contexto o idioma: no se especifican; el comportamiento en idiomas distintos del ingles no esta documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base puede tener condiciones propias que deben verificarse por separado.
- Caveats para produccion: es una herramienta de investigacion con cero descargas y sin pipeline declarado; no esta pensada como modelo de chat ni de generacion general.
- El uso correcto exige ejecutar el texto con el adaptador desactivado y activarlo solo tras el marcador `⟦?⟧`; un uso distinto puede degradar la calidad.

## Enlaces

- HuggingFace: https://huggingface.co/mahounairo/qwen3-8b-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio con resultados, codigo y limites: https://github.com/mahounairo/qwen3-classifier

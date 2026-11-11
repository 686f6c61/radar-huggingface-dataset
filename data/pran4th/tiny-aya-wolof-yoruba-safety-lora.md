# pran4th/tiny-aya-wolof-yoruba-safety-lora

## Resumen

Tiny Aya Wolof/Yoruba Safety Adapter es un adaptador LoRA de rango 16 desarrollado por el usuario pran4th sobre el modelo base CohereLabs/tiny-aya-global. Su proposito es restaurar el comportamiento de rechazo (refusal) ante peticiones daninas en wolof y yoruba, dos idiomas de bajos recursos en los que la alineacion de seguridad del modelo base se degrada de forma notable. El adaptador anade 7,7 millones de parametros, un 0,23% del total del modelo base, y se entrena exclusivamente sobre 101 ejemplos de rechazo traducidos.

El problema que aborda es concreto y medible: el modelo base presenta tasas de rechazo del 16% en wolof y del 24% en yoruba ante prompts maliciosos, con tasas de exito de ataque (ASR) del 52% y 40% respectivamente. Tras aplicar el adaptador, ambos idiomas alcanzan un 100% de rechazo y un 0% de ASR sobre un conjunto de evaluacion retenido y juzgado con WildGuard.

Se trata de un artefacto de investigacion ligado a la Lexsi AI Safety Hackathon (Track 2), no de un modelo de proposito general. Su relevancia radica en demostrar que un ajuste fino muy pequeno y barato puede recuperar propiedades de seguridad en idiomas africanos donde los modelos multilingues suelen fallar, aunque con un coste en sobre-rechazo que conviene evaluar antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer CohereLabs/tiny-aya-global |
| Parametros totales | 7,7 M en el adaptador (0,23% del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | wolof y yoruba (objetivo del adaptador); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea QLoRA con rango r=16 y alpha=32, aplicado sobre las proyecciones q, k, v y o de la atencion del modelo base tiny-aya-global. El entrenamiento se realizo durante 2 epocas con una tasa de aprendizaje de 1e-4 sobre un conjunto de 101 ejemplos de rechazo traducidos a wolof y yoruba. No se especifica el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de esa cifra de ejemplos.

La innovacion principal no es arquitectonica sino metodologica: se demuestra que un adaptador de apenas 7,7 M de parametros puede revertir el colapso de alineacion en idiomas de bajos recursos. La evaluacion se realizo con prompts retenidos que nunca aparecieron en el entrenamiento y con un juez automatico (WildGuard), lo que aporta cierta garantia de que la mejora no se debe a memorizacion. No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre ejemplos de rechazo.

## Capacidades

- Restauracion del comportamiento de rechazo ante peticiones daninas en wolof y yoruba.
- Reduccion de la tasa de exito de ataques (ASR) hasta el 0% en el conjunto de evaluacion reportado.
- Funciona como adaptador PEFT cargable con `PeftModel.from_pretrained` sobre el modelo base.
- Hereda las capacidades multilingues y de generacion de texto del modelo base tiny-aya-global.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- El soporte de idiomas se limita, en la practica evaluada, a wolof y yoruba; no hay datos sobre otros idiomas.

## Casos de uso

- Moderacion de contenido en wolof y yoruba: el adaptador puede integrarse como capa de seguridad sobre el modelo base para filtrar o rechazar peticiones maliciosas en estos idiomas, donde el modelo sin ajustar falla en mas de la mitad de los ataques.
- Investigacion en seguridad multilingue: sirve como punto de partida reproducible para estudiar como se degrada la alineacion en idiomas de bajos recursos y como revertirla con ajuste fino barato.
- Evaluacion comparativa de tecnicas de alineacion: al publicarse junto con datos y codigo de evaluacion, permite contrastar metodologias de refusal training en idiomas africanos.
- Despliegue en asistentes de bajo coste para comunidades wolof y yoruba: el reducido tamano del adaptador (7,7 M de parametros) permite anadirlo a un modelo pequeno ya desplegado sin reentrenar ni reemplazar los pesos base.
- Generacion de datasets de seguridad: los ejemplos de rechazo traducidos y el pipeline de evaluacion pueden reutilizarse para construir conjuntos de datos de alineacion en otros idiomas de bajos recursos.
- Auditoria de sesgos y robustez: permite medir el sobre-rechazo (0% en wolof, 16,7% en yoruba sobre controles inofensivos) y ajustar el umbral de seguridad segun el caso de uso.

## Benchmarks y rendimiento

Resultados reportados por el autor, juzgados con WildGuard sobre prompts retenidos no vistos en entrenamiento:

| Modelo | Idioma | Refusal % | ASR % |
|---|---|---|---|
| tiny-aya-global (base) | Wolof | 16,0 | 52,0 |
| + adaptador | Wolof | 100,0 | 0,0 |
| tiny-aya-global (base) | Yoruba | 24,0 | 40,0 |
| + adaptador | Yoruba | 100,0 | 0,0 |

Sobre-rechazo en controles inofensivos (6 por idioma): 0% en wolof y 16,7% en yoruba.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; el adaptador anade solo 7,7 M de parametros, por lo que el requisito dominante es el del modelo base tiny-aya-global.
- GPU recomendadas: no disponible; al ser un adaptador sobre un modelo pequeno, previsiblemente cabe en GPUs de consumo, pero no se confirma en la informacion proporcionada.
- Cabe en consumer GPU: no confirmado; depende del modelo base y de la cuantizacion elegida, no documentada.
- Opciones de despliegue: carga mediante PEFT (`PeftModel.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-aya-wolof-yoruba-safety-lora | 7,7 M (adaptador) | no disponible | LoRA de seguridad sobre tiny-aya-global | Apache 2.0 | Hugging Face |
| CohereLabs/tiny-aya-global (base) | no disponible | no disponible | Modelo multilingue sin adaptador | no disponible | Hugging Face |
| Alternativas especificas de seguridad para wolof/yoruba | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables de seguridad para wolof y yoruba en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador se entrena sobre solo 101 ejemplos, lo que limita la generalizacion a dominios y estilos de ataque no representados.
- Sobre-rechazo del 16,7% en yoruba sobre controles inofensivos, lo que puede degradar la utilidad del modelo en conversaciones legitimas en ese idioma.
- La evaluacion se basa en un unico juez automatico (WildGuard) y en conjuntos de prompts reducidos; no hay validacion humana documentada.
- No se especifican los idiomas soportados oficialmente ni el comportamiento en idiomas distintos de wolof y yoruba.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni restricciones adicionales de licencia mas alla de Apache 2.0.
- Es un artefacto de hackathon con 0 descargas y 0 likes; no hay evidencia de uso en produccion ni mantenimiento continuado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiny-aya-global puede tener condiciones propias que deben verificarse por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/pran4th/tiny-aya-wolof-yoruba-safety-lora
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Datos y evaluacion: https://huggingface.co/pran4th/lexsi-wolof-ckpt
- Codigo: https://github.com/pranath-cloud/lexsi-aya-safety-audit

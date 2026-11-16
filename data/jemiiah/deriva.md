# Jemiiah/deriva

## Resumen

Deriva es un proyecto de investigación sobre seguridad en modelos lingüísticos pequeños y multilingües, presentado por el autor Jemiiah bajo el identificador `Jemiiah/deriva` en Hugging Face. No se trata de un modelo entrenado, sino del diseño, el código y el protocolo preregistrado de un estudio que investiga si el fine-tuning inofensivo (LoRA sobre preguntas de examen) debilita silenciosamente la seguridad de un modelo base, y si es posible reparar esa deriva sin reentrenar.

El modelo base objeto de estudio es Tiny Aya Global (CohereLabs/tiny-aya-global), sobre el que se aplica un fine-tuning LoRA mediante AlignTune con datos preparados con CuratorKIT, seguido de un parcheo con ReSta de SafeTune. El estudio cubre cinco variantes lingüísticas: inglés, hindi, hinglish (hindi en alfabeto latino mezclado con inglés), árabe y suajili.

La relevancia del proyecto es metodológica: propone medir la tasa de éxito de ataques (attack success rate), la sobrerreflexión (over-refusal) y la precisión en tareas por idioma, con intervalos de confianza, sobre un conjunto de evaluación congelado y hasheado antes de ejecutar ningún modelo. En el momento de la publicación no se ha entrenado ni medido ningún modelo, por lo que no existen resultados numéricos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base Tiny Aya Global no se describe en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, hi, ar, sw (y hinglish como variante code-mixed del estudio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

El proyecto no define una arquitectura propia: describe un pipeline experimental sobre el modelo base Tiny Aya Global (CohereLabs/tiny-aya-global). El procedimiento consiste en un fine-tuning LoRA ejecutado con AlignTune sobre preguntas de examen inofensivas preparadas con CuratorKIT. Posteriormente, los pesos se parchean con ReSta, una técnica de SafeTune que repara el comportamiento de seguridad sin reentrenamiento, barriendo una serie de intensidades de reparación.

La innovación metodológica destacable es el protocolo de evaluación: la partición de informe (report split) se congela y se hashea antes de ejecutar cualquier modelo; todas las decisiones de selección se toman sobre una partición de desarrollo; un segundo juez de otra familia de modelos etiqueta una muestra para medir el acuerdo entre jueces; y una intensidad de reparación que rompa el modelo o que empuje la sobrerreflexión más allá de un margen fijo no puede ser seleccionada. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, porque el estudio no ha llegado a esa fase.

## Capacidades

- No aplica: Deriva no es un modelo entrenado, sino un estudio y un paquete de código.
- El objeto de estudio es evaluar la capacidad de un modelo base (Tiny Aya Global) para rechazar peticiones dañinas en cinco variantes lingüísticas.
- Medición de tasa de éxito de ataques (attack success rate) mediante un modelo juez separado.
- Medición de sobrerreflexión sobre peticiones inofensivas pero provocadoras.
- Medición de precisión en tareas sobre preguntas de examen reservadas.
- Evaluación multilingüe y code-mixed (inglés, hindi, hinglish, árabe, suajili).
- Reparación de seguridad sin reentrenamiento mediante ReSta (SafeTune).
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Evaluación de seguridad multilingüe en producción: un equipo que adapte un modelo pequeño para un servicio en hindi, hinglish o suajili puede usar el protocolo de Deriva para comprobar si su fine-tuning inofensivo ha degradado la seguridad en esos idiomas y no solo en inglés.
- Auditoría de deriva de seguridad tras fine-tuning: el pipeline mide la tasa de éxito de ataques antes y después del ajuste, lo que permite cuantificar el deterioro introducido por un fine-tuning aparentemente inocuo.
- Reparación sin reentrenamiento: el uso de ReSta permite restaurar el comportamiento de seguridad parcheando pesos, evitando el coste de un nuevo ciclo de entrenamiento cuando el modelo ya está desplegado.
- Validación de conjuntos de evaluación: el mecanismo de congelación y hasheo del report split antes de ejecutar modelos sirve como plantilla para equipos que necesiten garantizar la integridad de sus evaluaciones.
- Control de sobrerreflexión: la medición de over-refusal con margen fijo ayuda a evitar que una reparación de seguridad excesiva degrade la utilidad del modelo en tareas legítimas.
- Investigación en seguridad de modelos pequeños: el código y el protocolo preregistrado son reutilizables por investigadores que estudien la relación entre fine-tuning y alineación en modelos de baja capacidad.
- Verificación entre jueces: el uso de un segundo juez de otra familia de modelos para medir el acuerdo sirve de referencia para diseñar evaluaciones automáticas más fiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se ha entrenado ni medido ningún modelo, y que toda cifra que correspondería a una medición figura como "not measured".

## Requisitos de hardware

- No disponible: no se especifican requisitos de VRAM, GPU recomendadas ni opciones de despliegue.
- El autor menciona que el estudio no llegó a ejecutarse por no haberse iniciado ninguna sesión de GPU antes de la fecha límite.
- Se prevé un notebook que reconstruya las tablas en una CPU convencional, según el plan de publicación, pero no está disponible.
- No se documentan latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa.

## Limitaciones y advertencias

- No existen resultados: el estudio no ha producido ninguna medición, conjunto de datos ni modelo publicado. Cualquier uso de este repositorio debe entenderse como acceso al diseño y al código, no a hallazgos.
- El conjunto de pruebas no está congelado: la traducción a los cuatro idiomas restantes no finalizó, por lo que la evaluación multilingüe no está completa.
- No se han publicado pesos ni datasets; el autor indica que los datos y modelos no están disponibles todavía.
- El propio autor advierte que nada de lo descrito constituye una garantía de seguridad para ningún modelo.
- El dataset previsto contiene peticiones dañinas y extractos de respuestas juzgadas recortados a 200 caracteres, que pueden incluir texto perjudicial.
- Licencia no disponible: no se puede determinar si el uso comercial del código o de los futuros artefactos está permitido.
- El modelo base (Tiny Aya Global) puede presentar sesgos y riesgo de alucinación propios, no evaluados en la información disponible.
- La validez de las conclusiones dependerá del acuerdo entre jueces y de la calidad de las traducciones, aspectos aún no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/Jemiiah/deriva
- Código: https://github.com/JemIIahh/deriva
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Datos: no publicados
- Modelos: no publicados

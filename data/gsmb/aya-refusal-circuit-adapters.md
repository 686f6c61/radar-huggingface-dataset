# GSMB/aya-refusal-circuit-adapters

## Resumen

`GSMB/aya-refusal-circuit-adapters` es una colección de adaptadores LoRA de seguridad publicada por el usuario GSMB sobre el modelo base `CohereLabs/tiny-aya-global`. El objetivo declarado es cerrar la brecha de seguridad multilingüe: mejorar la tasa de rechazo ante peticiones dañinas en idiomas no vistos durante el ajuste sin degradar el comportamiento en idiomas vistos ni aumentar el rechazo excesivo sobre peticiones benignas. Se distribuye como artefacto de investigación con la librería PEFT, no como modelo listo para producción.

El repositorio organiza los adaptadores en cuatro «brazos» experimentales: `full` (todos los módulos y capas), `allld` (solo `o_proj` y `down_proj` en todas las capas), `circuit` (los mismos módulos pero únicamente en las capas identificadas como parte del «circuito de rechazo») y `random` (control con capas aleatorias). La comparación entre `circuit` y `random` es el núcleo metodológico del trabajo: aislar si la localización de capas aporta una ventaja real frente a intervenir módulos equivalentes en posiciones arbitrarias.

La relevancia actual es doble. Por un lado, aborda un problema documentado en alineamiento multilingüe: los modelos ajustados para rechazar contenido dañino en inglés generalizan mal a otros idiomas. Por otro, lo hace con un presupuesto de parámetros mínimo y sobre un modelo pequeño, lo que lo convierte en una referencia útil para quien investigue intervenciones quirúrgicas sobre circuitos internos en lugar de reentrenamientos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | no disponible (el adaptador modifica un 0,000 % de los parámetros del modelo base según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe; el autor distingue entre idiomas «vistos» y «no vistos» (held-out) sin enumerarlos |
| Licencia | no disponible en los metadatos; la model card remite a las licencias del modelo base y de las librerías Lexsi |
| Formato de pesos | adaptadores PEFT (librería `peft`); formato de fichero concreto no disponible |

## Arquitectura y entrenamiento

El modelo base es `CohereLabs/tiny-aya-global`, un transformer pequeño de la familia Aya orientado a cobertura multilingüe. Sobre él se aplican adaptadores LoRA de bajo rango. El repositorio no documenta el rango, el alpha, la tasa de aprendizaje ni el número de pasos de entrenamiento.

La innovación metodológica es la selección de módulos y capas. Los cuatro brazos permiten separar tres efectos: el alcance de los módulos intervenidos (`full` frente a `allld`), la localización en capas identificadas como «circuito de rechazo» (`circuit`) y la validez de esa localización mediante un control con capas aleatorias (`random`). El autor describe el resultado como «closing the multilingual safety gap», es decir, un ajuste que debería trasladarse a idiomas no vistos. No se detalla la composición del dataset de entrenamiento, el número de tokens ni si se empleó RLHF, DPO u otra técnica de preferencias; la evaluación se apoya en un juez automático («label source: judge»).

## Capacidades

- Modificación del comportamiento de rechazo del modelo base ante peticiones dañinas, sin cambios en los pesos originales.
- Transferencia de la conducta de rechazo a idiomas no incluidos en el ajuste (held-out), según la métrica declarada por el autor.
- Preservación de la capacidad de razonamiento matemático del modelo base, medida con MGSM-lite.
- Control explícito del rechazo excesivo sobre peticiones benignas y «borderline-safe».
- Cuatro variantes intercambiables que permiten ablaciones reproducibles sobre módulos y capas.
- No se documentan tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; cualquier capacidad de ese tipo dependería exclusivamente del modelo base.

## Casos de uso

- Investigación en alineamiento multilingüe: comparar el brazo `circuit` con el control `random` para verificar si la localización de capas aporta una mejora estadísticamente significativa frente a intervenir módulos equivalentes en posiciones arbitrarias.
- Auditoría de seguridad de modelos pequeños: aplicar el adaptador sobre `tiny-aya-global` y medir la tasa de rechazo en idiomas de baja representación antes y después, usando el mismo protocolo de juez automático que el autor.
- Estudio de circuitos internos: reutilizar la selección de capas del brazo `circuit` como hipótesis comprobable sobre qué profundidades concentran la conducta de rechazo en un transformer multilingüe.
- Análisis del compromiso seguridad-utilidad: cuantificar el coste en rechazo excesivo (0,0 % en benigno y 1,2 % en borderline-safe según la model card) al activar cada brazo, útil para calibrar umbrales en sistemas de moderación.
- Base para adaptadores específicos de dominio: partir de los módulos `o_proj` y `down_proj` identificados y ajustar un LoRA adicional sobre un subconjunto de idiomas o de políticas de contenido concretas.
- Docencia y reproducción experimental: el conjunto de cuatro brazos con métricas e intervalos de confianza bootstrap sirve como plantilla para prácticas de evaluación de seguridad con presupuesto de cómputo reducido.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card. Los valores son porcentajes; los corchetes indican el intervalo de confianza bootstrap al 95 %. Solo se publican los valores del modelo base, sin la columna «después» del ajuste.

| Metrica | Base |
|---|---|
| Rechazo en peticiones dañinas, idiomas vistos (mayor = más seguro) | 53,8 [46,2; 61,9] |
| Rechazo en peticiones dañinas, idiomas held-out | 41,2 [33,8; 48,8] |
| Jailbreak no rechazado, idiomas vistos (menor = más seguro) | 59,2 [53,8; 65,0] |
| Jailbreak no rechazado, idiomas held-out | 83,3 [78,3; 87,5] |
| Rechazo excesivo, benigno (menor = mejor) | 0,0 [0,0; 0,0] |
| Rechazo excesivo, borderline-safe | 1,2 [0,3; 2,5] |
| Precisión MGSM-lite | 56,2 |
| Parámetros modificados (%) | 0,000 |

No se han publicado en la información disponible los resultados posteriores al ajuste de cada brazo, ni comparaciones con modelos de referencia distintos del propio modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de adaptadores LoRA sobre un modelo «tiny», los requisitos vienen determinados por el modelo base, cuyas dimensiones no se detallan en la información disponible.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, es plausible que quepa en GPU de consumo, pero no hay datos que lo confirmen.
- Cabe en GPU de consumo: no confirmado.
- Opciones de despliegue: al ser adaptadores PEFT, se cargan con la librería `peft` sobre el modelo base; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no se documentan y dependerían de la compatibilidad del modelo base con cada runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores de seguridad, con modelos de la familia Aya de mayor tamaño ni con alternativas de alineamiento multilingüe. El único punto de referencia es el propio modelo base, cuyas métricas se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- El autor califica explícitamente el repositorio como «research artifacts, not certified for deployment»: no debe usarse como capa de seguridad en producción sin una evaluación independiente.
- Las métricas se obtienen con un juez automático («label source: judge»), lo que introduce dependencia del juez y possible sesgo de medición; no se reporta validación con anotadores humanos.
- La model card solo publica los valores del modelo base; sin la columna posterior al ajuste no es posible verificar la mejora declarada ni el efecto por brazo.
- La tasa de jailbreak no rechazado en idiomas held-out del modelo base es del 83,3 %, lo que indica una vulnerabilidad alta de partida; el adaptador debe demostrar que la reduce sin degradar el resto.
- El rechazo excesivo en peticiones benignas es 0,0 % en el base, un margen que cualquier intervención de seguridad puede erosionar; el 1,2 % en borderline-safe ya es el punto de partida a vigilar.
- Licencia no declarada en los metadatos; la model card remite a las licencias del modelo base y de las librerías Lexsi, por lo que el uso comercial exige verificar ambas por separado.
- No se especifican los idiomas cubiertos ni el criterio de partición entre vistos y held-out, lo que dificulta reproducir la evaluación.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base.
- El repositorio registra 0 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GSMB/aya-refusal-circuit-adapters
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Librería PEFT: no se proporciona enlace en la información disponible
- Paper, blog, repositorio de código y demos: no disponibles

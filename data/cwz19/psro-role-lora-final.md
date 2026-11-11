# cwz19/psro-role-lora-final

## Resumen

`cwz19/psro-role-lora-final` es una colección de adaptadores LoRA finales (sin estado del optimizador) resultantes de ejecuciones de role-PSRO (Policy Space Response Oracles) y self-play, publicada por el usuario cwz19. No se trata de un modelo base entrenado desde cero, sino de un conjunto de políticas especializadas por rol: los prefijos `A*` corresponden a políticas atacantes, entrenadas explícitamente para generar prompts de jailbreak, y los prefijos `D*` a políticas defensoras. El repositorio se organiza en carpetas por ejecución y rol (`<run>/<training|...>/<role>`), cada una con `adapter_model.*`, `adapter_config.json` y un `STEP.txt` con el paso global.

La relevancia de esta publicación es acotada pero específica: se distribuye como material de investigación para safety y red-teaming, no como un modelo de propósito general. El interés técnico reside en que expone políticas adversariales y defensivas entrenadas mediante un esquema de juegos iterativos (PSRO), lo que permite estudiar dinámicas de ataque-defensa y evaluar robustez de sistemas de moderación frente a atacantes optimizados.

El repositorio ocupa 55,0 GB, un tamaño muy superior al de un único adaptador LoRA típico, lo que es consistente con la presencia de múltiples carpetas de ejecución y rol. El modelo base de cada adaptador se declara en su propio `adapter_config.json` mediante `base_model_name_or_path`; no se especifica en la model card un base único, por lo que debe consultarse adaptador por adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelos base no especificados en la model card; el base de cada adaptador figura en su `adapter_config.json` |
| Parametros totales | no disponible (depende del adaptador y del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base de cada adaptador) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (`adapter_model.*`) + `adapter_config.json` + `STEP.txt` |

## Arquitectura y entrenamiento

Cada artefacto es un adaptador LoRA de paso final, sin estado del optimizador, entrenado mediante role-PSRO y self-play. PSRO es un marco de aprendizaje multiagente que mantiene una población de políticas y resuelve iterativamente una meta-estrategia sobre ellas; en esta variante por roles, las políticas atacantes (`A*`) se optimizan para producir jailbreaks y las defensoras (`D*`) para resistirlos. El entrenamiento se desarrolló entre agosto y octubre de 2026 según la model card, y solo se publican los checkpoints del paso final: los pasos intermedios no se subieron.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF o DPO. Tampoco se especifican hiperparámetros LoRA (rango, alpha, módulos objetivo) más allá de lo que cada `adapter_config.json` declare. La estructura de carpetas por ejecución y rol permite reconstruir qué política pertenece a qué run y en qué paso global se guardó, lo que facilita la trazabilidad experimental.

## Capacidades

- Generación de prompts adversariales: los adaptadores `A*` están entrenados para producir jailbreaks, es decir, entradas diseñadas para eludir salvaguardas de modelos objetivo.
- Políticas defensivas: los adaptadores `D*` se entrenan como contraparte en el esquema PSRO, orientadas a resistir o detectar ataques en el mismo entorno de juego.
- Adaptación por rol: cada adaptador modifica el comportamiento del modelo base hacia una política concreta, no hacia capacidades generales.
- Compatibilidad PEFT: al ser adaptadores LoRA estándar, se cargan con la librería `peft` sobre el base indicado en `adapter_config.json`.
- Tool calling, agentes, visión, audio y modo thinking: no disponible; no se documentan capacidades de este tipo y dependerían exclusivamente del modelo base.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en red-teaming: cargar los adaptadores `A*` sobre su base para generar de forma sistemática prompts de jailbreak y medir la tasa de éxito frente a clasificadores de seguridad o modelos con alineamiento.
- Evaluación de robustez de moderadores: usar las políticas atacantes como generador de casos adversarios en un pipeline de evaluación de filtros de contenido, comparando detección antes y después de endurecer el moderador.
- Análisis de dinámicas ataque-defensa: emparejar adaptadores `A*` y `D*` del mismo run para estudiar cómo evoluciona la estrategia de cada bando a lo largo de los pasos globales registrados en `STEP.txt`.
- Entrenamiento de clasificadores de jailbreak: emplear las salidas de los atacantes como datos etiquetados de ejemplos adversarios para ajustar un detector binario de prompts maliciosos.
- Reproducibilidad de experimentos PSRO: al conservarse la estructura `<run>/<training|...>/<role>` y el paso global, el repositorio sirve para replicar curvas de aprendizaje o comparar meta-estrategias entre ejecuciones.
- Auditoría de salvaguardas en despliegues: integrar los adaptadores en un banco de pruebas interno que verifique que un modelo candidato a producción no es vulnerable a ataques optimizados antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para los adaptadores en sí; el consumo vendrá determinado por el modelo base indicado en cada `adapter_config.json` y por su cuantización.
- GPU recomendadas: no disponible; depende del base. Para bases de decenas de miles de millones de parámetros se requerirían A100/H100 o equivalentes, pero no se confirma el tamaño del base en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; condicionada al base y a la cuantización elegida (por ejemplo, cargas en 4 bits vía bitsandbytes podrían hacer viable un base mediano en RTX 4090, pero no se especifica).
- Opciones de despliegue: carga mediante `peft` + `transformers`; para servir en producción sería necesario fusionar el adaptador con el base o usar un servidor compatible con LoRA (vLLM con soporte de adaptadores, TGI), aunque no se documenta compatibilidad explícita.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cwz19/psro-role-lora-final` | Colección de adaptadores LoRA (ataque/defensa) | no disponible | no disponible | other | Hugging Face, 0 descargas |
| Adaptadores LoRA de red-teaming genéricos | Adaptadores LoRA | no disponible | no disponible | variable | no disponible |
| Modelos de safety/guardrails (p. ej. clasificadores de jailbreak) | Modelos discriminativos | no disponible | no disponible | variable | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los modelos comparables dependerían del base elegido y del protocolo de evaluación, que no se documenta.

## Limitaciones y advertencias

- Contenido dual: los adaptadores `A*` están diseñados para generar jailbreaks; su uso fuera de entornos controlados de investigación en safety puede facilitar elusión de salvaguardas.
- Licencia `other`: no se detallan los términos; es imprescindible revisar las condiciones antes de cualquier uso comercial o redistribución.
- Sin benchmarks ni métricas publicadas: no hay evidencia cuantitativa de eficacia de ataque o defensa en la información disponible.
- Base no unificado: al no especificarse un modelo base único, la reproducibilidad exige consultar cada `adapter_config.json`; un base incorrecto invalida el adaptador.
- Solo paso final: al no publicarse pasos intermedios, no es posible analizar la evolución intra-run salvo por el `STEP.txt` registrado.
- Idiomas y contexto no documentados: cualquier afirmación sobre cobertura lingüística o ventana de contexto es especulativa.
- Riesgo de alucinación y sesgos: no evaluado; heredado del modelo base y del dataset de entrenamiento, que no se describe.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/cwz19/psro-role-lora-final
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales asociados a este modelo.

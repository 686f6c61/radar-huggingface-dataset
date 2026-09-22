# MANGSEOK123/qwen3-4b-tau2-retail-fp105-1ep

## Resumen

MANGSEOK123/qwen3-4b-tau2-retail-fp105-1ep es un ajuste fino derivado de Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123, orientado al dominio *retail* del benchmark tau2-bench. El modelo se ha consolidado mediante una técnica que el autor denomina OEL (*experience distillation*, según las etiquetas del repositorio) a partir de 105 pares de tarea-memoria redactados externamente: 54 de recuerdo (*recall*), 31 de composición (*composition*) y 20 de sustitución (*substitution*). El objetivo declarado de la serie es medir cuánta señal de la memoria de tarea es capaz de transferir el proceso de destilación a los pesos del alumno.

Técnicamente es un transformer denso de 4.411.424.256 parámetros (4,41 mil millones), por lo que no hay parámetros activos distintos de los totales ni comportamiento MoE. El repositorio ocupa 8,8 GB y se distribuye en formato safetensors con licencia apache-2.0. No se declara el pipeline, ni los idiomas soportados, ni la longitud de contexto nativa; el único dato operativo de contexto es el ejemplo de despliegue del autor con `--max-model-len 40960`.

El modelo es relevante como artefacto de investigación sobre destilación de experiencia en agentes: no usa recompensa, el profesor son los mismos pesos con la memoria de la tarea insertada en el *system prompt*, y solo el alumno se evalúa sin esa memoria. El autor indica explícitamente que el modelo no ha sido evaluado tras el entrenamiento y que se publicó directamente, por lo que su utilidad práctica en producción no está verificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura del modelo base Qwen/Qwen3-4B-Instruct-2507; no se detalla en la información proporcionada) |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la información disponible; el ejemplo de despliegue del autor usa `--max-model-len 40960` |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones; el repositorio solo contiene safetensors) |
| Idiomas soportados | No disponible (no se declara en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Ambito de ajuste | Dominio *retail* de tau2-bench (105 pares tarea-memoria) |
| Tamano del repositorio | 8,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4,41 mil millones de parámetros; la model card no describe ninguna modificación estructural, por lo que se asume que el ajuste es una consolidación de pesos sobre la misma topología. El procedimiento de entrenamiento es una destilación de experiencia sin recompensa: el alumno reproduce cada tarea sin memoria y el profesor son los mismos pesos con la memoria de esa tarea insertada en el *system prompt*. Únicamente difiere el prompt, y la pérdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` a 256.

Los hiperparámetros son: 105 pares de entrenamiento, batch de 12, 9 pasos, 1 época (el último batch es de 9), tasa de aprendizaje constante de 3e-6, recorte de gradiente de 1.0 (valor por defecto de verl) y un simulador de usuario basado en gpt-4.1-mini con temperatura 0. La composición de los pares es 54 de recuerdo, 31 de composición y 20 de sustitución; el autor señala que la proporción de recuerdo es aproximadamente la mitad del conjunto, bastante superior a la de las ejecuciones hermanas de la serie. La pérdida KL por paso y la entropía asociada son las siguientes:

| Paso | Perdida KL | Entropia | Norma del gradiente |
|---|---|---|---|
| 1 | 0,010 | 0,294 | 1,205 |
| 2 | 0,011 | 0,258 | 0,978 |
| 3 | 0,009 | 0,335 | 2,300 |
| 4 | 0,013 | 0,406 | 1,015 |
| 5 | 0,013 | 0,301 | 1,415 |
| 6 | 0,007 | 0,255 | 0,847 |
| 7 | 0,008 | 0,202 | 1,214 |
| 8 | 0,010 | 0,289 | 1,053 |
| 9 | 0,005 | 0,328 | 2,618 |

El autor advierte que cada paso lee un batch distinto, de modo que la columna de pérdida refleja la dificultad del batch y no la convergencia del entrenamiento. No se documenta uso de RLHF, DPO ni ningún otro esquema de alineación posterior.

## Capacidades

- Generación de texto conversacional y ejecución de tareas de agente en el dominio *retail* de tau2-bench.
- Soporte de *tool calling* mediante el parser `hermes` en vLLM, según el comando de despliegue incluido en la model card (`--enable-auto-tool-choice --tool-call-parser hermes`).
- Razonamiento multi-paso en tareas compuestas: 31 de los 105 pares de entrenamiento son de composición.
- Tareas de recuerdo de información de tarea (54 pares) y de sustitución de entidades o productos (20 pares).
- Capacidad de retener y aplicar memoria de tarea aprendida por destilación, sin necesidad de incluirla en el *system prompt* en el momento de la inferencia.
- Idiomas: no disponible.
- Capacidades multimodales, de audio o de visión: no disponibles; el modelo base es de texto y no se declara ninguna extensión.
- Modo de razonamiento explícito (*thinking*): no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en comercio electrónico: el modelo está ajustado sobre el dominio *retail* de tau2-bench y soporta *tool calling* con el parser `hermes`, por lo que puede gestionar conversaciones multi-turno en las que debe consultar pedidos, modificar direcciones o tramitar devoluciones mediante llamadas a herramientas.
- Sustitución de producto en conversaciones de posventa: los 20 pares de sustitución del conjunto de entrenamiento están orientados a este escenario, de modo que el modelo está expuesto a cambios de artículo, variantes y equivalencias dentro de un catálogo.
- Recuperación de información de tarea sin memoria explícita: al haberse destilado la memoria en los pesos, el modelo puede desplegarse sin inyectar la ficha de tarea en el *system prompt*, lo que reduce el consumo de tokens de entrada por petición.
- Composición de flujos de agente en varios pasos: los 31 pares de composición permiten encadenar subtareas (por ejemplo, consultar disponibilidad, aplicar una promoción y emitir el reemplazo) dentro de una misma conversación.
- Sustitución directa del modelo base en un despliegue existente: al compartir arquitectura y tokenizador con Qwen/Qwen3-4B-Instruct-2507, puede intercambiarse en un servidor vLLM ya configurado sin cambiar el resto del pipeline.
- Estudio de destilación de experiencia: el modelo es un punto de comparación dentro de una serie (fp117, fp190, fp300) que permite medir empíricamente cuánta señal de memoria se transfiere con distintos volúmenes de pares.
- Evaluación de agentes en banco de pruebas: puede usarse como política de referencia en el dominio *retail* de tau2-bench, siempre que se tenga en cuenta que el propio modelo no ha sido evaluado por el autor.
- Despliegue en infraestructura limitada: con 4,41 mil millones de parámetros cabe en GPUs de consumo, lo que permite prototipar agentes de comercio electrónico en estaciones de trabajo locales.
- Generación de diálogos sintéticos de dominio *retail*: puede emplearse para producir trayectorias de conversación y llamadas a herramientas que alimenten otros procesos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que el modelo **no fue evaluado** y que se subió inmediatamente después del entrenamiento.

El único dato numérico de referencia que aporta el autor corresponde al profesor sobre el conjunto de entrenamiento de 190 pares, no a este modelo:

| Medicion | Valor |
|---|---|
| Modelo base sin memoria (conjunto de 190 pares) | 0,561 |
| Modelo base con la memoria de cada tarea en el prompt (conjunto de 190 pares) | 0,660 |
| Diferencia | +0,099 (aproximadamente 3,4 errores estándar sobre 570 episodios) |

Estas cifras se obtuvieron sobre el propio conjunto de entrenamiento, no sobre un conjunto de prueba independiente, y describen el comportamiento del profesor, no del alumno destilado.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 8,8 GB, coherente con el tamaño del repositorio (4,41 mil millones de parámetros a 2 bytes).
- VRAM estimada en BF16 con contexto largo: 9-11 GB para los pesos más la caché KV correspondiente al contexto configurado. El autor sirve con 40.960 tokens, un valor que puede añadir varios gigabytes adicionales de caché según la configuración de atención del modelo base.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB (estimación a partir del número de parámetros; no hay cuantizaciones publicadas en el repositorio).
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB (estimación; requeriría convertir los pesos, ya que no se distribuyen en GGUF).
- Cabe en GPU de consumo: sí. Es viable en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en BF16 con contextos moderados, y en tarjetas de 8 GB si se cuantiza a 4 bits.
- GPU de centro de datos recomendadas: A100 40/80 GB, H100, L40S, L4 y A10G para despliegue con contexto largo y concurrencia elevada.
- Opciones de despliegue: vLLM es la vía documentada por el autor; TGI y SGLang son alternativas compatibles con safetensors, aunque no están documentadas en la model card. llama.cpp y Ollama requerirían una conversión a GGUF que no se distribuye.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-retail-fp105-1ep | 4,41 mil millones | No especificado (ejemplo de servicio a 40.960 tokens) | Ninguna (no evaluado) | apache-2.0 | HuggingFace, 0 descargas |
| MANGSEOK123/qwen3-4b-tau2-retail-fp117-1ep | No disponible | No disponible | No disponible | No disponible | HuggingFace (mismo autor) |
| MANGSEOK123/qwen3-4b-tau2-retail-fp190-1ep | No disponible | No disponible | No disponible | No disponible | HuggingFace (mismo autor) |
| MANGSEOK123/qwen3-4b-tau2-retail-fp300-1ep | No disponible | No disponible | No disponible | No disponible | HuggingFace (mismo autor) |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,41 mil millones | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace |

Los tres modelos hermanos se diferencian únicamente por el número de pares de entrenamiento empleados (117, 190 y 300 frente a los 105 de esta variante), según las referencias incluidas en la model card. No se dispone de resultados comparativos entre ellos.

## Limitaciones y advertencias

- Modelo no evaluado: el autor indica explícitamente que se publicó justo después del entrenamiento, sin ninguna batería de evaluación. No hay datos de MMLU, HumanEval, GSM8K ni de tau2-bench para este checkpoint.
- Sobreajuste probable al conjunto de entrenamiento: 105 pares y 9 pasos sobre el dominio *retail* de tau2-bench, con mediciones de referencia calculadas sobre el propio conjunto de entrenamiento (190 pares) y no sobre un conjunto independiente.
- Riesgo de olvido catastrófico: al ser un ajuste de una sola época sobre un dominio muy estrecho, puede degradar capacidades generales del modelo base no relacionadas con *retail*. No se documenta ninguna evaluación que lo descarte.
- Sin recompensa ni alineación adicional: el entrenamiento usa únicamente pérdida KL; no hay RLHF ni DPO que ajusten el comportamiento conversacional o la seguridad.
- Riesgo de alucinación: no cuantificado. No hay evaluación de fidelidad ni de tasas de invención en llamadas a herramientas.
- Idiomas: no se declara ningún idioma soportado ni el idioma de los 105 pares de tarea; no se puede asumir cobertura multilingüe más allá de la del modelo base.
- Contexto: no se documenta la longitud de contexto nativa ni el comportamiento más allá de los 40.960 tokens del ejemplo de despliegue.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o equidad.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación, pero debe conservarse el aviso de licencia y el modelo base Qwen/Qwen3-4B-Instruct-2507 puede tener sus propias condiciones, no verificadas en la información disponible.
- Madurez y soporte: 0 descargas y 0 *likes*, sin pipeline declarado, sin cuantizaciones publicadas y con una única vía de despliegue documentada (vLLM). No hay garantía de mantenimiento por parte del autor.
- La pérdida por paso refleja la dificultad del batch y no la convergencia, según advierte el propio autor, por lo que las cifras de entrenamiento no deben interpretarse como curva de aprendizaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail-fp105-1ep
- Variante hermana fp117: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail-fp117-1ep
- Variante hermana fp190: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail-fp190-1ep
- Variante hermana fp300: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-retail-fp300-1ep
- Modelo base Qwen/Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a hilos de foro sin relación (combinación de correspondencia en Word, resolución DNS de un controlador de dominio y avisos de mantenimiento de un proveedor de servicios), por lo que no se incluyen. No se han encontrado papers, blogs, repositorios de código ni demos asociados a este checkpoint en la información disponible.

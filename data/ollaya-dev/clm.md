# ollaya-dev/clm

## Resumen

`ollaya-dev/clm` es un paquete de inferencia publicado por ollaya-dev para [Ollaya](https://github.com/ollaya-dev/ollaya), un runtime local de "modelos de decisión abiertos" que se presenta como el equivalente de Ollama para LLMs. El modelo no es generativo en el sentido habitual: recibe preguntas tipadas y devuelve respuestas calibradas sobre un conjunto de opciones, detrás de una API compatible con TypeSafe. Se etiqueta como `text-classification`, `decision-model` y `system-one`, lo que sitúa su uso en decisiones rápidas de un solo paso en lugar de razonamiento encadenado largo.

Técnicamente es una combinación de dos modelos: las cabezas de proyección provienen de `Contrastive-LM/CLM-v0.1-8B` y el encoder de `Qwen/Qwen3-8B`. El repositorio no contiene pesos: cada grafo es una exportación ONNX cuyos pesos referencian por desplazamiento de bytes los ficheros originales de los autores, de modo que `ollaya pull` descarga los pesos desde los repositorios upstream, sin modificar y fijados a un commit, verificando su sha256. El tamaño del repo es de 0,0 GB y solo se publica el tag `clm:8b` con `8b/model-fp32.onnx`, `8b/decision.json` (disposición de secuencia y tokens especiales) y `8b/calibration.json` (temperaturas).

Su relevancia es fundamentalmente práctica: permite ejecutar un modelo de decisión de ~8B en local, en CPU y CUDA, con licencia Apache-2.0, sin depender de APIs externas y con una verificación de paridad explícita frente a la implementación de referencia. La contrapartida es que el proyecto es muy reciente (creado el 28 de septiembre de 2026), acumula 0 descargas y 0 likes, y no publica documentación sobre idiomas, contexto, cuantizaciones ni benchmarks de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Qwen3-8B más cabezas de proyección de CLM-v0.1-8B, exportado como grafo ONNX de decisión (no generativo) |
| Parametros totales | ~8B (heredados de los modelos base; el recuento exacto no se detalla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica un grafo fp32 (`8b/model-fp32.onnx`) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas; el encoder base es Qwen3-8B) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafo fp32); el repositorio no incluye pesos, referencia los ficheros upstream por byte offset y los verifica por sha256 |

## Arquitectura y entrenamiento

La arquitectura es una composición de dos piezas: el encoder de `Qwen/Qwen3-8B` (commit `b968826d9c46dd6066d109eabc6255188de91218`) y las cabezas de proyección de `Contrastive-LM/CLM-v0.1-8B` (commit `e939398d4556fcd9400c76fa8c5a513202f42b0a`). El resultado se exporta como un grafo ONNX de tipo decisión que, en lugar de generar texto libre, produce logits sobre un conjunto de opciones definido en `decision.json`, junto con temperaturas de calibración en `calibration.json`. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones de decodificación.

El aspecto técnico más destacable es el mecanismo de distribución: el repositorio solo contiene los artefactos derivados, no los pesos, y el runtime de Ollaya (escrito en Rust) descarga los pesos de los repositorios upstream fijados a un commit y verifica su sha256. La model card reporta una verificación de paridad frente a la implementación de referencia (esquema y cabezas upstream, encoder Qwen3-8B calculado en fp32 sobre sus pesos en BF16) sobre 480 preguntas procedentes de 117 peticiones, tanto en CPU como en CUDA: mismos textos de estado y opciones, mismos token ids, mismos rechazos y la misma decisión en todas las preguntas, con logits de opción dentro de 1,3e-4 y probabilidades dentro de 2,9e-5.

## Capacidades

- Clasificación y decisión sobre opciones discretas: recibe preguntas tipadas y devuelve una decisión con distribución de probabilidad calibrada sobre las opciones declaradas.
- Salida con calibración explícita: las temperaturas de `calibration.json` permiten ajustar la confianza de las probabilidades, algo poco habitual en modelos generativos usados como clasificadores.
- Ejecución local sin red: el runtime de Ollaya y los grafos ONNX permiten inferencia en máquina propia, en CPU y en CUDA.
- Reproducibilidad verificable: pesos fijados a commit y verificados por sha256, con paridad medida frente a la referencia.
- Uso mediante CLI e integración: `ollaya run clm` y descarga con `ollaya pull`, detrás de una API compatible con TypeSafe.
- No documentado en la información disponible: generación de texto libre, razonamiento multi-paso, soporte de tool calling o function calling, capacidades de agente, visión, audio, modo "thinking" y cobertura multilingüe.

## Casos de uso

- Enrutamiento de solicitudes en atención al cliente: el modelo clasifica cada consulta entrante en una de las colas o categorías definidas en `decision.json`, y la calibración permite fijar un umbral por debajo del cual la consulta se deriva a revisión humana.
- Guardarraíles previos a la ejecución de acciones en pipelines de agentes: dado un contexto y una acción propuesta, el modelo decide entre opciones como permitir, bloquear o escalar, con una probabilidad asociada que sirve como señal de confianza antes de invocar herramientas externas.
- Triaje documental en back office: clasificación por lotes de expedientes, incidencias o reclamaciones en categorías operativas, ejecutable en CPU con ONNX Runtime sin enviar datos a terceros.
- Moderación y política de contenido: evaluar textos contra un conjunto cerrado de etiquetas de política, usando las probabilidades calibradas para establecer zonas de revisión manual en lugar de umbrales binarios arbitrarios.
- Decisión con requisitos de auditoría y trazabilidad: al fijar pesos a un commit concreto y verificar sha256, encaja en entornos donde hay que demostrar qué versión exacta del modelo tomó cada decisión.
- Automatización on-premise en sectores regulados: al ejecutarse localmente y con licencia Apache-2.0, permite desplegar decisiones automatizadas sin transferencia de datos a servicios en la nube.
- Evaluación y comparación de políticas de decisión: el mismo modelo y sus temperaturas de calibración permiten medir el impacto de distintos umbrales antes de llevarlos a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de la model card es la verificación de paridad con la implementación de referencia, que no mide calidad sino fidelidad de reproducción:

| Prueba de paridad | Resultado |
|---|---|
| Preguntas evaluadas | 480, procedentes de 117 peticiones |
| Plataformas | CPU y CUDA |
| Coincidencia de textos de estado y opciones | idéntica a la referencia |
| Coincidencia de token ids y rechazos | idéntica a la referencia |
| Decisión final | la misma en todas las preguntas |
| Desviación en logits de opción | dentro de 1,3e-4 |
| Desviación en probabilidades | dentro de 2,9e-5 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite publicados para este paquete.

## Requisitos de hardware

- VRAM estimada: los pesos del encoder son de ~8B parámetros; en el formato upstream BF16 suponen aproximadamente 16 GB, y una ejecución en fp32 completo rondaría los 32 GB solo en pesos. Cifras estimadas a partir del tamaño declarado, no publicadas por el autor.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 6000 Ada 48 GB para trabajar con holgura en fp32; para BF16, una GPU de 24 GB resulta ajustada.
- GPU de consumo: con pesos BF16 (~16 GB) es posible en una RTX 4090 de 24 GB, con margen reducido; no cabe con comodidad en GPUs de 8 o 12 GB. En CPU es viable, ya que la paridad reportada incluye ejecución en CPU.
- Opciones de despliegue: runtime de Ollaya (`ollaya run clm`, `ollaya pull clm:8b`) y ONNX Runtime sobre CPU o CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y en varios de esos casos el modelo no encaja por no ser generativo.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de tokens por segundo, y al ser un modelo de clasificación la métrica relevante sería decisiones por segundo, que tampoco se reporta.

## Comparativa con modelos similares

No se dispone de información sobre modelos de decisión directamente comparables en el mismo nicho. La comparación más razonable es contra las dos piezas upstream de las que se deriva:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ollaya-dev/clm (`clm:8b`) | ~8B | no disponible | apache-2.0 | ONNX fp32 en HF; pesos vía `ollaya pull` desde upstream | Paquete de decisión con calibración y verificación de paridad; 0 descargas |
| Contrastive-LM/CLM-v0.1-8B | ~8B (según nombre) | no disponible | no disponible en la información proporcionada | Repositorio upstream de las cabezas de proyección | Fuente de las cabezas y del esquema `clm.schema` |
| Qwen/Qwen3-8B | ~8B | no disponible en la información proporcionada | no disponible en la información proporcionada | Repositorio upstream del encoder | Aporta el encoder; en `ollaya-dev/clm` se calcula en fp32 sobre pesos BF16 |

## Limitaciones y advertencias

- El repositorio no contiene pesos (0,0 GB). Sin ejecutar `ollaya pull` y sin acceso a los repositorios upstream, los ficheros publicados por sí solos no permiten inferencia.
- No hay benchmarks de calidad publicados: no se puede afirmar nada sobre precisión, calibración real en dominios concretos o robustez frente a distribución distinta de la de entrenamiento.
- Los idiomas soportados no están declarados, por lo que no se debe asumir cobertura multilingüe sin validarla.
- La longitud de contexto no está documentada; planificar usos con entradas largas exige medirla empíricamente antes de producción.
- El modelo no genera texto libre: su salida está restringida al conjunto de opciones definido en `decision.json`, y cualquier cambio de taxonomía obliga a revisar la disposición de secuencia y los tokens especiales.
- El riesgo de alucinación se transforma aquí en riesgo de calibración: probabilidades mal calibradas en un dominio nuevo producen decisiones erróneas con aparente confianza. Las temperaturas de `calibration.json` deberían revalidarse con datos propios.
- Sesgos conocidos: no documentados. Al heredar el encoder de Qwen3-8B y las cabezas de CLM-v0.1-8B, el modelo arrastra los sesgos de los datos de entrenamiento de ambos, que no se detallan.
- La verificación de paridad se realizó sobre 480 preguntas de 117 peticiones, una muestra limitada que no cubre todos los dominios de uso.
- Licencia Apache-2.0, igual que los modelos upstream y que el propio runtime Ollaya, lo que en principio permite uso comercial; conviene comprobar igualmente las condiciones de los artefactos upstream enlazados.
- Solo se publica un grafo fp32, lo que encarece el despliegue en memoria respecto a alternativas cuantizadas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con fechas de creación y actualización del 28 de septiembre de 2026. Es un ecosistema joven sin validación independiente.
- El ecosistema circundante es específico: la ejecución depende del runtime de Ollaya y de su API compatible con TypeSafe, no de las herramientas estándar de inferencia ONNX a las que un equipo podría estar acostumbrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ollaya-dev/clm
- Modelo base (cabezas): https://huggingface.co/Contrastive-LM/CLM-v0.1-8B
- Modelo base, commit fijado: https://huggingface.co/Contrastive-LM/CLM-v0.1-8B/tree/e939398d4556fcd9400c76fa8c5a513202f42b0a
- Modelo base (encoder): https://huggingface.co/Qwen/Qwen3-8B
- Modelo base, commit fijado: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Repositorio del runtime: https://github.com/ollaya-dev/ollaya
- Ollama (runtime de referencia mencionado en la model card): https://ollama.com/
- Biblioteca de modelos de Ollama: https://ollama.com/library
- Búsqueda de modelos con soporte de herramientas en Ollama: https://ollama.com/search?c=tools
- Artículo sobre Ollama para desarrolladores: https://cohorte.co/blog/ollama-for-developers-and-machine-learning-engineers
- GlobalDev AI for Ollama (cliente de terceros): https://www.microsoft.com/de-lu/p/globaldev-ai-for-ollama/9mzj0249qjsl

# GALLERVICH/AutoDiagnose-weights

## Resumen

AutoDiagnose-weights es un repositorio de pesos publicado por el usuario GALLERVICH que reúne los artefactos necesarios para ejecutar AutoDiagnose, un sistema de diagnóstico de capacidades y filtrado de escenarios de debilidad para modelos de conducción autónoma. No se trata de un único modelo generativo, sino de un paquete de checkpoints heterogéneos: diccionarios de autoencoders dispersos (SAE) para los planners Pluto y CaRL, el modelo base CaRL 1B, un Diffusion Planner, el predictor tabular TabPFN v2 de PriorLabs y dos modelos de lenguaje Qwen (Qwen3.5-4B y Qwen-Drive-1.0-4B) destinados a la generación de informes y a la revisión visual de repeticiones.

El repositorio está orientado a un flujo de trabajo de evaluación en bucle cerrado: se ejecutan los planners sobre escenarios, se predicen rendimientos por escenario con TabPFN, se interpretan activaciones internas mediante los diccionarios SAE y se genera un informe en lenguaje natural con Qwen. La relevancia actual radica en que propone una metodología reproducible para auditar planners de conducción autónoma en lugar de limitarse a métricas agregadas de éxito.

El tamaño del repositorio es de 18,6 GB, con pesos en formato safetensors y otros formatos (`.pth`, `.zip`, `args.json`). El idioma declarado es chino (`zh`) y la licencia no está disponible en la información proporcionada, aunque la model card indica que cada directorio incluye su propia nota de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio compuesto: SAE, planner transformer/diffusion, TabPFN v2, LLM Qwen) |
| Parametros totales | No disponible (CaRL 1B: 1B; Qwen3.5-4B y Qwen-Drive-1.0-4B: 4B cada uno; resto no disponible) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (`zh`) |
| Licencia | No disponible (cada directorio incluye su propia nota de licencia) |
| Formato de pesos | Safetensors, `.pth`, `.zip` (diccionarios SAE), `args.json` |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura única, sino un conjunto de componentes con funciones diferenciadas. Los diccionarios SAE (18 en total, para Pluto y CaRL) permiten descomponer activaciones internas de los planners en características interpretables. CaRL 1B actúa como modelo madre para evaluación en bucle cerrado y para los casos de diagnóstico de CaRL. El Diffusion Planner se emplea también en evaluación en bucle cerrado y se distribuye con su `model.pth` y `args.json`. TabPFN v2, desarrollado por PriorLabs, se usa para predicción de rendimiento por escenario, con checkpoints separados para clasificación y regresión. Los dos modelos Qwen cubren la generación de informes de diagnóstico y la revisión visual de repeticiones.

No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La model card menciona "Built with PriorLabs-TabPFN" como crédito del componente tabular, y enlaza a un manifiesto de pesos (`weights-manifest.json`) y a un listado de sumas SHA-256 para verificar integridad y procedencia.

## Capacidades

- Diagnóstico de capacidades de planners de conducción autónoma mediante interpretación de activaciones con diccionarios SAE.
- Filtrado y recomendación de escenarios de debilidad a partir de predicciones de rendimiento por escenario (TabPFN v2, clasificación y regresión).
- Evaluación en bucle cerrado de planners (CaRL 1B y Diffusion Planner).
- Generación de informes de diagnóstico en lenguaje natural con Qwen3.5-4B.
- Revisión visual de repeticiones con Qwen-Drive-1.0-4B, invocada con `--vision-checkpoint`, `--visual-item` y `--visual-image`.
- Integración con planners externos publicados por terceros (Pluto, Plan-R1, DriveRL).
- Verificación de integridad de pesos mediante SHA-256 y manifiesto de versiones.
- No se documentan capacidades de tool calling, agentes multi-paso ni soporte multilingüe más allá del chino.

## Casos de uso

- Auditoría de planners en producción: ejecutar CaRL 1B y el Diffusion Planner en bucle cerrado sobre un conjunto de escenarios y comparar el éxito agregado con el desglose por característica que ofrecen los diccionarios SAE.
- Identificación de escenarios de fallo: usar TabPFN v2 en modo clasificación para predecir qué escenarios tienen mayor probabilidad de fallo y priorizar la recolección de datos en esas condiciones.
- Predicción de métricas continuas por escenario: emplear el checkpoint de regresión de TabPFN v2 para estimar valores como tasa de éxito o error de trayectoria antes de ejecutar la simulación completa, reduciendo coste computacional.
- Generación automática de informes: pasar los resultados de diagnóstico a Qwen3.5-4B mediante `--qwen-checkpoint` para obtener un informe legible por el equipo de ingeniería.
- Revisión cualitativa de repeticiones: usar Qwen-Drive-1.0-4B con `--vision-checkpoint` para inspeccionar fotogramas concretos de un episodio y contrastar la traza numérica con la evidencia visual.
- Interpretabilidad de características internas: cargar los diccionarios SAE de Pluto o CaRL para analizar qué direcciones latentes se activan en maniobras específicas (giros, incorporaciones, frenadas) y detectar atajos espurios.
- Comparación entre planners: al incluir checkpoints de Pluto, Plan-R1 y DriveRL como puntos de entrada externos, el pipeline permite contrastar el comportamiento de varios planners bajo el mismo protocolo de diagnóstico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; el repositorio ocupa 18,6 GB en disco, por lo que se requiere al menos ese espacio libre.
- Componentes LLM: Qwen3.5-4B y Qwen-Drive-1.0-4B son modelos de 4B parámetros; en precisión completa (FP16) cada uno requiere aproximadamente 8 GB de VRAM, y en cuantización de 8 bits alrededor de 4-5 GB, aunque no se confirman cuantizaciones publicadas.
- CaRL 1B: 1B parámetros, aproximadamente 2 GB en FP16.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una RTX 4090 (24 GB) o A100/H100 permitirían cargar varios componentes simultáneamente; una GPU consumer de 8-12 GB solo alojaría un componente pequeño a la vez.
- Opciones de despliegue: no se documentan explícitamente vLLM, llama.cpp, Ollama ni TGI. El pipeline se ejecuta mediante el código de AutoDiagnose con argumentos de línea de comandos (`--qwen-checkpoint`, `--vision-checkpoint`, `--classifier-checkpoint`, `--regressor-checkpoint`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoDiagnose-weights | Paquete de diagnóstico para planners | Compuesto (1B, 4B, SAE, TabPFN) | No disponible | No disponible | Hugging Face |
| Pluto | Planner de conducción autónoma | No disponible | No disponible | No disponible | GitHub (jchengai/pluto) |
| Plan-R1 | Planner de conducción autónoma | No disponible | No disponible | No disponible | Google Drive |
| DriveRL | Planner de conducción autónoma | No disponible | No disponible | No disponible | GitHub (XiaomiAutoL3/DriveZero) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a la función declarada (planner frente a sistema de diagnóstico) y al canal de publicación.

## Limitaciones y advertencias

- La licencia no está declarada a nivel de repositorio; cada subdirectorio incluye su propia nota, por lo que el uso comercial exige revisar cada componente por separado (en particular TabPFN y los modelos Qwen, con licencias propias).
- El idioma declarado es únicamente chino, lo que limita la utilidad de los informes generados para equipos no sinohablantes sin traducción adicional.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado en un intervalo de menos de media hora, lo que sugiere una publicación reciente y sin validación externa por parte de la comunidad.
- No se publican benchmarks, métricas de calidad del diagnóstico ni comparaciones con alternativas, por lo que no es posible evaluar su eficacia antes de integrarlo.
- La naturaleza compuesta del paquete implica múltiples dependencias (PriorLabs-TabPFN, Qwen, planners de terceros) cuyas versiones y licencias deben gestionarse por separado.
- Riesgo de alucinación en los informes generados por los modelos Qwen, especialmente si se presentan como conclusiones automáticas sin revisión humana.
- No se documentan sesgos conocidos, límites de contexto ni restricciones de despliegue en producción.
- Los planners externos enlazados (Pluto, Plan-R1, DriveRL) no forman parte del repositorio y su disponibilidad depende de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GALLERVICH/AutoDiagnose-weights
- Diccionarios SAE y configuración de casos: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/blob/main/autodiagnose-sae-dictionaries.zip
- CaRL 1B: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/blob/main/carl/model_best.pth
- Diffusion Planner: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/tree/main/diffusion-planner
- TabPFN v2: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/tree/main/tabpfn
- Qwen3.5-4B: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/tree/main/qwen/Qwen3.5-4B
- Qwen-Drive-1.0-4B: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/tree/main/qwen/Qwen-Drive-1.0-4B
- Listado SHA-256: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/blob/main/SHA256SUMS
- Manifiesto de pesos: https://huggingface.co/GALLERVICH/AutoDiagnose-weights/blob/main/weights-manifest.json
- Código y documentación de AutoDiagnose: https://github.com/TJHuangteam/AutoDiagnose
- Pluto: https://github.com/jchengai/pluto#checkpoint
- Plan-R1: https://drive.google.com/file/d/1Imnrju-5vwz1kzUMENv5s38iHMIMOH4W/view
- DriveRL: https://github.com/XiaomiAutoL3/DriveZero/tree/73f4cd3bdc2afe3ea042b3dd276b025cdc5d83f4/DriveRL/release

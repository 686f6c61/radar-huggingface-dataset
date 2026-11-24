# hanxuan2003/ForceBench-Dual-Path-Fusion

## Resumen

ForceBench — Dual-Path Fusion es un conjunto de ocho checkpoints específicos por tarea derivados de pi0.5 (la familia de modelos vision-language-action de Physical Intelligence), publicados por el usuario hanxuan2003 como material de réplica para el benchmark ForceBench de manipulación robótica con realimentación de fuerza. No es un modelo único ni un lanzamiento de pesos generalista: son ocho directorios Orbax/OCDBT independientes, uno por tarea de simulación (Weight Sort, CoM Sort, Faucet Turn, Faucet Direction, Stove Turn, Stove Press, Drawer Pull y Nut Thread), con un payload de inferencia total de 99,54 GB (92,70 GiB). La innovación declarada es una ruta dual: las estadísticas temporales de fuerza se combinan con un codificador de estadísticas aprendido que produce cuatro tokens continuos de fuerza, inyectados en el modelo base.

El interés del release es acotado y muy específico: sirve para auditar la asociación entre los registros de evaluación guardados y los checkpoints, y para reproducir las tasas de éxito reportadas en el manuscrito de ICRA (de 199/200 en Weight Sort a 9/200 en Drawer Pull). El autor advierte explícitamente de que esas tasas son valores de referencia del artículo, no resultados de nuevos rollouts, y de que la compatibilidad de estos ficheros con el cargador público no está verificada. Es, por tanto, un artefacto de investigación reproducible, no un modelo listo para producción.

La relevancia actual es metodológica: expone con transparencia los problemas de trazabilidad entre checkpoints, hashes de normalización y resultados de evaluación en benchmarks de robótica con contacto físico, un área donde la reproducibilidad es notoriamente frágil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action derivada de pi0.5 (base PaliGemma/Gemma); ruta dual de fusión de fuerza con codificador de estadísticas que emite cuatro tokens continuos de fuerza |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato Orbax/OCDBT, sin versiones GGUF ni safetensors) |
| Idiomas soportados | en |
| Licencia | gemma (términos Gemma aplicables al base pi0.5/PaliGemma; código ForceBench bajo MIT y OpenPI bajo Apache, licencias separadas) |
| Formato de pesos | Orbax/OCDBT (directorio con `params/`, `assets/` y `_CHECKPOINT_METADATA`); no hay `.pt` ni `.safetensors` |

## Arquitectura y entrenamiento

La arquitectura parte de pi0.5, un modelo vision-language-action que combina un codificador visual y un backbone de lenguaje (familia PaliGemma/Gemma) con una cabeza de acción. Sobre esa base, la variante Dual-Path Fusion añade una ruta específica de fuerza: las estadísticas temporales de la señal de fuerza se procesan en paralelo a un codificador de estadísticas aprendido que genera cuatro tokens continuos de fuerza, que se fusionan con la representación del modelo para condicionar la política de acción. El repositorio no documenta el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

El release es exclusivamente de pesos: no incluye el runtime congelado, la configuración exacta del modelo, el tokenizador ni los assets de normalización originales completos, que el autor identifica como necesarios para la inferencia. Cada checkpoint se exportó como directorio Orbax/OCDBT y conserva la jerarquía de normalización de la tarea original en `assets/`; el estado del optimizador y las cachés de entrenamiento se excluyeron. El entrenamiento se realizó en simulación sobre las ocho tareas de ForceBench, con protocolo y resultados de referencia congelados en `paper_reference.json` y `paper_protocol.json` del repositorio de código.

## Capacidades

- Control robótico de manipulación con realimentación de fuerza en simulación, en ocho tareas concretas: clasificación por peso, clasificación por centro de masa, giro de grifo, dirección de fuerza en grifo, encendido de fogón por giro, pulsación-giro de fogón, apertura de cajón con clasificación y enroscado de tuerca.
- Política vision-language-action: consume observaciones visuales y consignas de tarea en inglés y emite acciones.
- Fusión de señal de fuerza mediante cuatro tokens continuos generados por un codificador de estadísticas, además de la ruta de estadísticas temporales.
- Ejecución específica por tarea: cada checkpoint está entrenado para una única tarea; no hay un checkpoint multi-tarea unificado en este repositorio.
- Sin soporte documentado de tool calling, function calling, agentes multi-paso, modo thinking, visión general de imágenes naturales, audio ni otras capacidades de propósito general.
- Multilingüe: no; solo inglés (`en`).

## Casos de uso

- Replicación de resultados de artículo: cargar el checkpoint de una tarea concreta (por ejemplo `checkpoints/weight_sort/9999`) y comparar la tasa de éxito con las 199/200 reportadas, usando los 200 seeds de evaluación 300–499 indicados en la model card.
- Auditoría de trazabilidad de checkpoints: verificar la asociación entre registros de evaluación guardados e identidades de checkpoint mediante `PROVENANCE.json`, que incluye IDs de tarea, tamaños en bytes y hashes de normalización.
- Estudio de métodos de fusión de fuerza: comparar la variante `dual_path_fusion` con las otras cinco familias de fusión de fuerza del proyecto ForceBench (48 checkpoints en total) para aislar el efecto de la ruta dual.
- Investigación en manipulación con contacto: usar las tareas de grifo, fogón, cajón y tuerca como banco de pruebas para políticas que requieren estimación de fuerza, donde las tasas reportadas son bajas (4,5%–30%) y dejan margen de mejora medible.
- Desarrollo de infraestructura de evaluación: emplear los directorios Orbax/OCDBT y el contrato de observación descrito en `RUNTIME.md` para construir o validar cargadores compatibles con pi0.5 en JAX.
- Docencia y divulgación técnica: ilustrar las dificultades de reproducibilidad en benchmarks de robótica, incluidas las discrepancias entre contadores online y tasas reportadas (caso Faucet Direction) y la sustitución de reentrenamientos posteriores (caso Nut Thread).
- Análisis de normalización: reutilizar `assets/` de cada tarea para estudiar cómo la jerarquía de normalización original afecta a la política entrenada.

## Benchmarks y rendimiento

Tasas de éxito reportadas en el manuscrito de ICRA, sobre 200 seeds de evaluación (300–499) por tarea. El autor indica que son valores de referencia del artículo respaldados por registros guardados, no resultados de nuevos rollouts ni de una reproducción extremo a extremo.

| Tarea | Checkpoint | Éxitos / 200 | Tasa | Payload (GB) |
|---|---|---:|---:|---:|
| Weight Sort | `checkpoints/weight_sort/9999` | 199 | 99,5% | 12,442 |
| CoM Sort | `checkpoints/rattle_sort/9999` | 144 | 72% | 12,442 |
| Faucet Turn | `checkpoints/faucet_turn/9999` | 44 | 22% | 12,442 |
| Faucet Direction | `checkpoints/faucet_force_turn/9999` | 60 | 30% | 12,442 |
| Stove Turn | `checkpoints/stove_turn_on/9999` | 35 | 17,5% | 12,442 |
| Stove Press | `checkpoints/stove_press_turn/9999` | 38 | 19% | 12,442 |
| Drawer Pull | `checkpoints/radmanso_drawer_sort_table/9999` | 9 | 4,5% | 12,442 |
| Nut Thread | `checkpoints/nut_thread/9999` | 33 | 16,5% | 12,442 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con otras variantes de fusión de fuerza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Cada checkpoint pesa 12,442 GB en formato Orbax/OCDBT, pero el repositorio no indica el consumo en memoria del runtime ni si los pesos se cargan en precisión completa o reducida.
- GPU recomendadas: no disponible. El stack declarado es JAX/Orbax, lo que sugiere aceleradores compatibles con JAX (por ejemplo, GPUs NVIDIA con CUDA), pero no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado. Un payload de 12,442 GB por tarea es compatible en tamaño con GPUs de 16–24 GB si la carga no duplica pesos, pero la model card no lo verifica.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el formato Orbax/OCDBT y el carácter VLA excluyen esos servidores. Se requiere un runtime JAX/pi0.5 congelado que no se incluye en el release.
- Latencia y throughput: no disponibles.
- Almacenamiento: 99,54 GB (92,70 GiB) para el conjunto completo; conviene descargar solo la tarea necesaria con `allow_patterns` de `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ForceBench Dual-Path Fusion | VLA pi0.5 con fusión de fuerza | 8 checkpoints específicos | no disponible | gemma | Pesos Orbax en HF; runtime no incluido |
| Otras variantes ForceBench (5 familias de fusión de fuerza) | VLA pi0.5 con fusión de fuerza | 48 checkpoints en total entre todas | no disponible | gemma | Pesos en HF según `RELEASE_SCOPE.md` |
| pi0.5 base (Physical Intelligence) | VLA generalista | Multi-tarea | no disponible | gemma | Pesos públicos de PI; no verificado en esta búsqueda |

No se dispone de datos numéricos comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un entorno ejecutable completo: faltan el runtime congelado, la configuración exacta del modelo, el tokenizador y la normalización original; la compatibilidad de estos ficheros con el cargador público está sin verificar.
- Las tasas de éxito son valores de referencia del manuscrito, no resultados de nuevos rollouts ni de una reproducción extremo a extremo.
- Faucet Direction requiere un tratamiento especial: hay que leer `summary.success_report`, copiar su `outcome.criteria` y sustituir solo la condición de ángulo final por la regla de cota inferior; los contadores online originales difieren de las tasas reportadas.
- Nut Thread: el run guardado da 33/200 en ambos puntos temporales del informe de éxito histórico; no se sustituye por reentrenamientos posteriores de la tarea.
- Cada checkpoint sirve para una sola tarea; no hay generalización multi-tarea dentro del repositorio.
- Solo inglés; sin capacidades de lenguaje general, tool calling ni agentes.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una política de control en simulación, el riesgo relevante es de fallo de política, no de generación de texto.
- Restricciones de licencia: el base pi0.5 usa PaliGemma/Gemma, con los términos y restricciones de uso de Gemma aplicables (ver `LICENSES.md`, `LICENSE_GEMMA.txt`, `LICENSE_GEMMA_CURRENT.md` y `NOTICE`); son términos separados de las licencias MIT de ForceBench y Apache de OpenPI.
- No se incluyen datasets de entrenamiento, assets de tokenizador ni assets de simulador.
- Prohibido fabricar recibos de checkpoint o desactivar la comprobación de identidad del cargador público, según el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanxuan2003/ForceBench-Dual-Path-Fusion
- Código ForceBench (revisión inspeccionada): https://github.com/forcebench-platform/ForceBench/tree/31acf7353d2f723985e6576a5708f67a81707d61
- Documentación de la familia de modelos (método `dual_path_fusion`): https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/baselines/temporal/README.md
- Resultados de referencia congelados: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/results/paper_reference.json
- Protocolo de evaluación: https://github.com/forcebench-platform/ForceBench/blob/31acf7353d2f723985e6576a5708f67a81707d61/configs/paper_protocol.json
- Ficheros internos citados en el repo: `RUNTIME.md`, `PROVENANCE.json`, `RELEASE_SCOPE.md`, `LICENSES.md`, `LICENSE_GEMMA.txt`, `LICENSE_GEMMA_CURRENT.md`, `NOTICE`, `MODIFICATIONS.md`, `SHA256SUMS`

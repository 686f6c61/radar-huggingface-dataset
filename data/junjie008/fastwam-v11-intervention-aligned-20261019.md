# junjie008/fastwam-v11-intervention-aligned-20261019

## Resumen

FastWAM V11 Intervention-Aligned MemoryWAM es un checkpoint de inferencia para robótica publicado por el usuario junjie008 en HuggingFace. Se presenta como la «fase 2, paso 2.000» de la línea de entrenamiento `v11_p1500_a3000_20261019`, es decir, 3.500 actualizaciones del optimizador en total (1.500 de la fase 1 de entrenamiento del predictor/retriever más 2.000 de la fase 2), partiendo del checkpoint conjunto V10 de 4k pasos. El autor no reclama ninguna tasa de éxito, lo que sitúa la ficha en el terreno de un artefacto de investigación más que de un modelo listo para producción.

El modelo pertenece a la familia de los world-action models (WAM) para control robótico: combina pesos MoT, un Video DiT, un Action DiT, un codificador propioceptivo y módulos que el autor denomina «corregibles», junto con un mecanismo de memoria que da nombre a la variante (MemoryWAM). El repositorio ocupa 61,4 GB e incluye un único fichero `step_002000.pt` con los pesos y los metadatos de arquitectura; no incluye el VAE ni el codificador de texto, que son activos externos, ni estados de optimizador.

Su interés actual es metodológico: documenta un protocolo de evaluación con tres modos separados (autónomo, sin inyección de hechos y con correcciones privilegiadas de simulador) y una mezcla explícita de condiciones de entrenamiento (50% predichas, 45% oráculo, 5% ausentes), lo que permite analizar cómo degrada una política visuomotora cuando la información de contexto falla. No hay datos públicos de arquitectura cuantitativa, parámetros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model con pesos MoT, Video DiT, Action DiT, codificador propioceptivo y modulos «corregibles» con memoria (MemoryWAM); composicion detallada no disponible |
| Parametros totales | no disponible (el repo ocupa 61,4 GB, pero no se desglosa el recuento) |
| Parametros activos | no disponible (no se confirma que sea MoE; «MoT» es la nomenclatura del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye un `.pt` sin especificar precision) |
| Idiomas soportados | no disponible (modelo orientado a robotica; no se documenta soporte de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`phase2/step_002000/checkpoints/weights/step_002000.pt`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura se organiza en torno a un Video DiT y un Action DiT sobre pesos MoT, acompañados de un codificador propioceptivo, un predictor/retriever y módulos corregibles que aportan el componente de memoria. El autor indica que el `.pt` contiene los pesos MoT completos, los módulos V11, el codificador propioceptivo y los metadatos de arquitectura, mientras que el VAE y el codificador de texto quedan fuera del repositorio y deben obtenerse por separado.

El entrenamiento se dividió en dos fases. La fase 1 (1.500 pasos) entrena el predictor/retriever. La fase 2 entrena el Action DiT, el codificador propioceptivo y los módulos corregibles, mientras el Video DiT permanece congelado: el autor verificó bit a bit que todos los tensores serializados del Video DiT son iguales a los del checkpoint V10 de 4k pasos. Los datos combinan trayectorias expertas (conjunto A) y estados de rollout autónomos del split de entrenamiento con etiquetas auxiliares de hechos (conjunto B), que se refresca de B1 a B2 en el paso 1.500 reanudando optimizador y scheduler. No se usa ningún S2/VLM en línea durante el entrenamiento y B aporta supervisión auxiliar, no acciones de recuperación expertas. La mezcla de condiciones es 50% predicha, 0% parcial, 45% oráculo y 5% ausente. El cómputo fueron ocho GPU A800, un grupo empaquetado por GPU y acumulación 4, con 32 grupos globales por actualización.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales y estado propioceptivo, con un Action DiT entrenado específicamente para ello.
- Condicionamiento en estados con memoria, gracias a los módulos V11 y al componente MemoryWAM.
- Predicción/recuperación de contexto mediante el predictor/retriever entrenado en la fase 1.
- Funcionamiento en tres regímenes de evaluación declarados: autónomo (`--mode predicted --source predicted`), sin inyección de hechos (`--mode base --source none`) y con correcciones de oráculo del simulador (`--mode corrected --source oracle`).
- Robustez entrenada ante condiciones ausentes: un 5% de las muestras de entrenamiento se presentan sin condición.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, código, visión general, audio ni modo «thinking».
- Soporte multilingüe: no disponible.

## Casos de uso

- Investigación en políticas visuomotoras: el checkpoint sirve como punto de partida reproducible para estudiar el efecto de la memoria y de las condiciones parciales en tareas de manipulación, usando el script `scripts/eval_v11.py` sobre el split oficial `val`.
- Evaluación de robustez ante contexto ausente: el 5% de condiciones ausentes en el entrenamiento permite medir la degradación de la política cuando no llega información de contexto, comparando el modo `base` con el autónomo.
- Análisis de la brecha autonomía/oráculo: ejecutar los modos `predicted` y `corrected` por separado cuantifica cuánto depende la política de correcciones privilegiadas del simulador, una práctica habitual antes de plantear despliegues reales.
- Reanudación de líneas de investigación: al inicializarse desde el V10 joint 4k y documentar el commit exacto (`b40dc71ab423ebd0b08fc1574e28b9331ae1ca28`), facilita replicar el entrenamiento o continuar el ajuste con nuevos conjuntos de trayectorias expertas.
- Docencia y formación en robótica basada en aprendizaje: el export de inferencia, con metadatos de arquitectura incluidos en un único `.pt`, simplifica montar prácticas sobre evaluación de políticas en simulador sin gestionar adaptadores intermedios.
- Auditoría de artefactos de investigación: la presencia de `provenance.json`, `dataset_stats.json` y `SHA256SUMS` permite verificar integridad y trazabilidad, útil en revisiones internas o en procesos de reproducibilidad.
- Integración como baseline en pipelines de simulación: puede conectarse a un simulador que aporte estado propioceptivo y, opcionalmente, correcciones de oráculo, para comparar contra políticas propias en las mismas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna tasa de éxito («No success-rate claim is made») y no incluye cifras de tareas, simulación ni métricas de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 61,4 GB y el `.pt` contiene pesos más metadatos; si esos pesos están en fp32, el orden de magnitud sería de decenas de miles de millones de parámetros, pero el recuento no se publica. Como referencia práctica, un checkpoint de ese tamaño no se puede cargar en memoria de una GPU de 24 GB sin cuantización, y no se documenta ningún formato cuantizado.
- GPU recomendadas: el autor entrenó con ocho A800. Para inferencia, un escenario realista es una o varias GPU de 80 GB (A100 80GB, H100 80GB) o A800 80GB; no hay recomendación oficial de inferencia.
- ¿Cabe en GPU de consumo? No hay evidencia de que quepa en una RTX 4090 (24 GB) o similar, dado el tamaño del artefacto y la ausencia de cuantizaciones publicadas.
- Opciones de despliegue: no se soportan vías estándar como vLLM, TGI, llama.cpp u Ollama, porque el artefacto es un `.pt` de PyTorch con módulos propios. El camino documentado es el repositorio de código (rama `codex/memory-v11-intervention-aligned`) y `scripts/eval_v11.py`, ajustando las rutas de activos externos (VAE y codificador de texto) en `config.yaml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas. La tabla siguiente se limita a señalar la categoría y el estado de la información; los datos de terceros no se han verificado en esta búsqueda y se marcan como no disponibles cuando no procede.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM V11 Intervention-Aligned | World-action model para robotica | no disponible | no disponible | no disponible | Repo privado, acceso a colaboradores autorizados |
| OpenVLA y familia Open X-Embodiment | Politicas VLA para robotica | no disponible en esta busqueda | no disponible | no disponible | Publicos, segun documentacion de cada proyecto |
| Alternativas tipo pi-zero / RT-2 | Politicas visuomotoras | no disponible en esta busqueda | no disponible | no disponible | Disponibilidad variable segun proyecto |

## Limitaciones y advertencias

- Ausencia total de métricas: el autor no reclama tasa de éxito y no publica benchmarks, por lo que no hay evidencia cuantitativa de rendimiento en ninguna tarea.
- Licencia no disponible: no se puede asumir uso comercial, redistribución ni modificación; hay que contactar con el autor antes de cualquier uso productivo.
- Acceso restringido: el repositorio se describe como inicialmente privado y requiere acceso de lectura para colaboradores autorizados; las descargas y los likes figuran a 0.
- Dependencia de activos externos: el VAE y el codificador de texto no están incluidos, de modo que la evaluación no funciona solo con el `.pt`; hay que obtener esos pesos por otra vía y ajustar rutas específicas de máquina en la configuración.
- Dependencia de código y rama concretas: la evaluación requiere la implementación V11 en la rama `codex/memory-v11-intervention-aligned` y el commit exacto indicado; los repositorios de código pueden requerir acceso separado.
- No es un archivo reanudable: no se incluyen estados de optimizador, scheduler ni RNG, por lo que no sirve para reanudar el entrenamiento de forma continua.
- Riesgo de alucinación y artefactos: al ser un modelo generativo con componentes de difusión vídeo/acción, no se documentan evaluaciones de fidelidad de las predicciones ni de estabilidad fuera de distribución; no hay datos sobre sesgos.
- Idiomas: no se documenta ningún soporte lingüístico; asumir capacidades de texto sería infundado.
- Contexto: la longitud de contexto no se publica y las condiciones ausentes (5%) están integradas en el entrenamiento, lo que puede producir degradaciones silenciosas si el sistema que alimenta las observaciones falla.
- Fecha y trazabilidad: el checkpoint está fechado en 2026-10-19 y deriva de una línea de experimentos interna; conviene verificar `SHA256SUMS` tras la descarga antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junjie008/fastwam-v11-intervention-aligned-20261019
- Repositorio de codigo: https://github.com/Astexia-xuan/fastwam_edit
- Mirror del codigo: https://github.com/sgres-paw/HyAM
- Rama de implementacion: `codex/memory-v11-intervention-aligned`
- Commit exacto de entrenamiento: `b40dc71ab423ebd0b08fc1574e28b9331ae1ca28`
- Descarga: `hf download junjie008/fastwam-v11-intervention-aligned-20261019 --include 'phase2/step_002000/*' --local-dir ./fastwam-v11`
- Paper, blog o demo: no disponible en la informacion proporcionada

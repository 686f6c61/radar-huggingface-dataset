# DannyJun/horizonbridge-robotwin-no-m-100k-20261024

## Resumen

HorizonBridge RoboTwin 无 M · 100K / GAS1 es un **paquete de entrega de entrenamiento** (training bundle), no un checkpoint de política listo para inferencia. Lo publica el usuario DannyJun en HuggingFace y contiene todo lo necesario para reproducir el entrenamiento de un modelo visión-lenguaje-acción sobre el benchmark de manipulación robótica RoboTwin: código fuente, configuración, un backbone stock Qwen3-VL-2B, un codificador V-JEPA, los pesos de una etapa previa (Stage1, 12K pasos) y un entorno Linux offline con 117 wheels.

El objetivo declarado es arrancar desde `stock Qwen + Stage1` y ejecutar 100K actualizaciones de optimizador con una configuración fija: 4×A100 80GB, batch size 24 por tarjeta, GAS1 y batch global de 96. La variante «no M» indica que se omite el módulo M/ICL del pipeline original; se conservan `progress z`, `PairProgress16`, el Predictor, el objetivo JEPA a t+16 y la cabeza de acción C16. La activación de recomputación (activation checkpointing) está desactivada.

Es relevante ahora porque expone de forma verificable (SHA256, manifiesto, inventario) una receta completa de entrenamiento robótico con backbone VLM de 2B parámetros, algo poco habitual: la mayoría de publicaciones liberan solo pesos finales. La contrapartida es que **no incluye el checkpoint de la política entrenada**, la licencia no está unificada y la capacidad de las 4 GPU en CUDA no se ha validado todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción: backbone Qwen3-VL-2B + codificador V-JEPA + Predictor + objetivo JEPA t+16 + cabeza de acción C16; `progress z` y `PairProgress16` |
| Parametros totales | No disponible (el backbone es Qwen3-VL-2B; el total del policy no se publica) |
| Parametros activos | No aplica: no es un modelo MoE. «no M» significa que se omite el módulo M/ICL del pipeline |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El autor indica que no hay licencia unificada de nivel superior y que las licencias y procedencias de cada modelo upstream se conservan dentro de los ZIP |
| Formato de pesos | ZIP (`models.zip`, ~9,61 GB) con Qwen3-VL-2B stock, V-JEPA y pesos Stage1 12K; formato interno de los pesos no disponible |
| Tamano del repositorio | 13,0 GB (3 ZIP + manifiesto) |
| Hardware de referencia | 4×A100 80GB, BS 24 por GPU, GAS1, batch global 96, 100.000 updates de optimizador |
| Dataset asociado | `DannyJun/robotwin-clean50-horizonbridge-20261024`: 50 tareas × 50 episodios clean, 2.500 trayectorias, 549.787 frames |
| Fecha de publicacion | 2026-10-24 (creado); ultima actualizacion 2026-10-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema combina un VLM como tronco (Qwen3-VL-2B, en versión stock sin modificar) con un codificador de vídeo V-JEPA y un Predictor que aprende en el espacio latente. Sobre esa representación se añaden objetivos auxiliares: `progress z` (estimación de progreso de la tarea), `PairProgress16` (comparaciones de progreso por pares) y una predicción JEPA a horizonte t+16, además de una cabeza de acción discretizada en C16. No se trata de un transformer denso convencional con RLHF, sino de un esquema de aprendizaje auto-supervisado sobre vídeo más aprendizaje de política con supervisión de acciones y estados.

Los datos provienen del repositorio independiente `robotwin-clean50-horizonbridge-20261024`: 50 tareas, 50 episodios limpios por tarea, 2.500 trayectorias y 549.787 frames, con MP4 fusionados de tres cámaras, parquet de acciones y estados, anotaciones de subtareas corregidas y normalización incluida. Los pesos Stage1 incluidos proceden de un entrenamiento de 12K pasos sobre un conjunto anterior de 2.499 trayectorias y se migraron mediante un «receipt» explícito al conjunto corregido de 2.500 trayectorias. La receta desactiva la recomputación de activaciones y excluye explícitamente el módulo M/ICL, lo que permite aislar su contribución en estudios comparativos.

Un detalle de ingeniería destacable es la verificabilidad: `zip_manifest.json` registra SHA256, tamaños y validación de miembros de los tres ZIP; `models/environment` usan compresión STORED para no recomprimir pesos ni wheels; y los tres archivos comparten la raíz `horizon_bridge_robotwin_no_m/` para poder descomprimirse en el mismo nivel y fusionarse. El paquete incluye también una sonda de VRAM de seis fases, con una rama de ajuste del predictor a partir del paso 5K, y un flujo completo de guardado y restauración en el paso 2.

## Capacidades

- Entrenamiento reproducible de políticas robóticas de manipulación sobre RoboTwin con una configuración de hiperparámetros fijada y documentada.
- Inicialización desde un backbone VLM preentrenado (Qwen3-VL-2B) más pesos Stage1, sin necesidad de partir de cero.
- Aprendizaje auto-supervisado de representaciones de vídeo mediante V-JEPA con horizonte de predicción t+16.
- Modelado de progreso de tarea: `progress z` y `PairProgress16` para estimar y comparar el avance entre trayectorias.
- Predicción de acciones en espacio C16 a partir de observaciones multi-cámara (tres cámaras fusionadas).
- Ablaciones controladas: la exclusión de M/ICL permite medir su impacto frente a la variante completa.
- Despliegue offline en máquinas sin red: instalador Linux x86_64 / Python 3.11 con 117 wheels y verificación por inventario.
- Reanudación y checkpointing: flujo de guardado/restauración completo probado en el paso 2.
- No incluye: checkpoint de política final, inferencia lista para producción, tool calling, agentes ni capacidades de audio.

## Casos de uso

- **Reproducción de experimentos académicos**: un grupo de robótica descarga los tres ZIP, ejecuta `download_and_assemble.py` y lanza el entrenamiento de 100K updates con 4×A100 para replicar la receta del autor sin reconstruir el pipeline desde cero.
- **Ablación del módulo M/ICL**: al existir esta variante «no M», un investigador puede entrenar la versión con M sobre el mismo dataset (2.500 trayectorias) y comparar curvas de pérdida y éxito en RoboTwin con una única variable modificada.
- **Estudio de JEPA aplicado a manipulación**: el paquete aísla el objetivo predictivo a t+16 y el predictor, lo que permite variar el horizonte o la función de pérdida latente y medir el efecto sobre la política de acción C16.
- **Formación de pipelines de datos robóticos**: el dataset asociado (549.787 frames, parquet de acciones y estados, anotaciones de subtareas corregidas) sirve para construir y validar herramientas de carga, normalización y aumento de datos antes de escalar a otros conjuntos.
- **Puesta a punto de infraestructura multi-GPU**: ingenieros de plataforma pueden usar la sonda de VRAM de seis fases y el flujo de guardado/restauración para caracterizar el consumo de memoria real de un entrenamiento VLA con batch global 96 en A100 80GB.
- **Entornos air-gapped o con requisitos de reproducibilidad estricta**: el instalador offline con wheels fijas y la verificación SHA256 permiten montar el entrenamiento en clústeres sin acceso a internet y auditar exactamente qué binarios se ejecutan.
- **Base para transferencia a otras tareas de manipulación**: al partir de Qwen3-VL-2B y Stage1, es un punto de arranque razonable para fine-tuning sobre conjuntos propios con menos pasos que un entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta validaciones de tipo operativo: prechequeo en CPU de datos y código, instalación en entorno nuevo independiente, prueba de migración de directorios y test de despliegue. La capacidad CUDA de las cuatro tarjetas con BS24/GAS1 **no se ha medido todavía**; el paquete incluye la sonda de VRAM mencionada para hacerlo.

## Requisitos de hardware

- **Entrenamiento de referencia**: 4×A100 80GB, con batch size 24 por GPU, GAS1 y batch global 96 durante 100.000 updates de optimizador.
- **Espacio en disco**: al menos 40 GB para caché de descarga de los ZIP más la extracción simultánea; alrededor de 1 TB adicionales para los checkpoints de salida del entrenamiento completo.
- **VRAM real**: no verificada por el autor para la configuración de cuatro GPU. Existe una sonda de seis fases (incluida la rama de ajuste del predictor tras el paso 5K) para determinarla empíricamente.
- **GPU consumer**: no hay datos que permitan afirmar que el entrenamiento completo quepa en una RTX 4090 (24 GB) con esta configuración; el backbone de 2B parámetros sí es de tamaño manejable, pero el conjunto incluye codificador V-JEPA, predictor y cabezas adicionales, y el batch global objetivo es 96.
- **Opciones de despliegue**: el paquete está orientado a entrenamiento (scripts `configure.py`, `preflight.py`, `launch.py`). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, y no se publica checkpoint para inferencia.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HorizonBridge RoboTwin no M | Bundle de entrenamiento VLA + JEPA | Backbone 2B; total no disponible | No disponible | Sin licencia unificada; upstream en el ZIP | Repo público de 13 GB, sin checkpoint final |
| OpenVLA | VLA de código abierto con backbone Llama-2 / DINOv2 + SigLIP | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Pesos publicados para inferencia |
| π0 (pi-zero) | VLA con modelo de flujo para acción continua | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Pesos y código publicados por Physical Intelligence |
| RoboTwin (benchmark base) | Entorno y benchmark de manipulación bimanual | No aplica | No aplica | No disponible en la informacion proporcionada | Benchmark público con tareas y métricas |

La diferencia de categoría es sustancial: OpenVLA y π0 distribuyen pesos finales para inferencia, mientras que este repositorio distribuye una receta de entrenamiento verificable. Para evaluar cualquiera de los tres en producción, este paquete requeriría completar primero las 100K actualizaciones y exportar el checkpoint resultante.

## Limitaciones y advertencias

- **No es un modelo utilizable directamente**: `models.zip` sirve para inicializar el entrenamiento, no contiene el checkpoint de la política de la experiencia principal. Sin ejecutar el entrenamiento completo no hay modelo para inferencia.
- **Licencia ambigua**: no existe licencia de nivel superior para el snapshot de HorizonBridge y el autor no añade una autorización unificada. Antes de uso comercial hay que revisar las licencias de Qwen3-VL-2B, V-JEPA y el resto de componentes upstream incluidos en el ZIP.
- **Capacidad CUDA no verificada**: el propio autor advierte que la configuración de cuatro A100 con BS24/GAS1 no se ha medido; el consumo de memoria podría requerir ajustes.
- **Riesgo de sobreajuste al benchmark**: 50 tareas y 2.500 trayectorias de un único entorno (RoboTwin) implican una diversidad limitada; la transferencia a robots y escenas reales no está demostrada.
- **Sesgos**: no hay evaluación de sesgos publicada; al partir de un VLM preentrenado (Qwen3-VL-2B) se heredan los sesgos de sus datos de preentrenamiento, no documentados en esta ficha.
- **Alucinación**: sin checkpoint final ni evaluación de política no es posible caracterizar el comportamiento en errores; en tareas de manipulación, un fallo de predicción se traduce en acciones físicas incorrectas.
- **Idioma y contexto**: no se especifican idiomas soportados ni longitud de contexto del sistema completo.
- **Coste de almacenamiento**: ~40 GB para preparar el entorno y ~1 TB para checkpoints; la descarga y verificación requieren tiempo y ancho de banda considerables.
- **Madurez del release**: la publicación se considera completa solo cuando aparezca `RELEASE_COMPLETE.json` en el repositorio; conviene comprobar ese archivo antes de invertir en la descarga.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Repositorio del bundle en HuggingFace: https://huggingface.co/DannyJun/horizonbridge-robotwin-no-m-100k-20261024
- Dataset asociado (50 tareas, 2.500 trayectorias, 549.787 frames): https://huggingface.co/datasets/DannyJun/robotwin-clean50-horizonbridge-20261024
- Documentación interna del paquete: `README`, `code.zip` (incluye auditoría y manifiesto completo), `zip_manifest.json` (SHA256 de los tres ZIP)
- Script de descarga y ensamblado: `download_and_assemble.py`, distribuido en el propio repositorio

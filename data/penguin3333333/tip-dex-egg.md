# penguin3333333/TiP-Dex-EGG

## Resumen

TiP-Dex-EGG es un paquete de modelo orientado a robótica de manipulación con huevos, publicado por el usuario penguin3333333 bajo el identificador `penguin3333333/TiP-Dex-EGG`. Se presenta como el modelo de ejemplo oficial de inferencia de TipDex_VTLA, una arquitectura vision-language-action (VLA) con soporte táctil. El paquete incluye una base nativa Orbax de 9309, los módulos VASE y TACE, un predictor táctil con codificador compartido, tokenizer, parámetros de normalización y ejemplos de replay. Está etiquetado con el pipeline `robotics` y la librería propietaria `tipdex-vtla`.

El modelo resuelve el problema de generar acciones de manipulación de precisión (concretamente sobre huevos, una tarea de alta fragilidad) combinando tres entradas RGB, un vector de estado de 19 dimensiones y lecturas táctiles crudas de las últimas 16 muestras del sensor F1 (364 valores uint16 por frame). La salida es un tensor de acciones de 30×13, un mapa de calor táctil predicho de H×14×26 y los valores internos VASE, TACE y q. Es relevante porque integra predicción táctil explícita y corrección de acciones en un mismo pipeline de inferencia reproducible.

El repositorio pesa 12,5 GB y se distribuye con un wheel de Python (`tipdex_vtla-0.2.0-py3-none-any.whl`), una CLI `tipdex` con subcomandos `verify`, `replay` y `serve`, y un servidor HTTP con dashboard. La licencia es compuesta: apache-2.0-and-gemma, con condiciones específicas para la base y los parámetros derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con módulos VASE y TACE y predictor táctil de codificador compartido; base nativa Orbax 9309 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (usa ventana de 16 frames táctiles y 3 entradas RGB; no se especifica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-gemma (license: other) |
| Formato de pesos | Orbax nativo (base 9309) y parámetros derivados; paquete de inferencia en wheel Python; manifiesto `manifest.json` con verificación SHA-256 |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura VLA específica para robótica con entrada multimodal: tres flujos RGB, un vector de estado de 19 dimensiones y las últimas 16 muestras del sensor táctil F1 en formato raw364 (364 valores uint16 por frame, convertidos a una matriz 14×26 dividiendo por 65535 en orden row-major). El paquete incluye una base nativa Orbax identificada como 9309, junto con los módulos VASE y TACE, un predictor táctil con codificador compartido, tokenizer y parámetros de normalización. VASE y TACE residen en módulos separados del código fuente (`src/tipdex/VASE/` y `src/tipdex/TACE/`).

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal. El funcionamiento de TACE se describe operativamente: corrige únicamente acciones sustituibles y aún no comprometidas, y vuelve a predecir tras aceptar una actualización; el error de predicción se mide como MAE sobre los 364 valores de la frame actual bajo la misma normalización, y si no hay predicción válida se usa `e=0`. En la configuración `paper` se aplica `G(q_v,0)=q_v` y se predicen 30 frames; en la configuración `egg` se usa una base visual `0.6+0.4*q_v`, TACE puede descontar hasta 0,1 y se predicen 5 frames.

## Capacidades

- Generación de acciones de manipulación robótica: salida de tensor `30×13` acciones por inferencia en configuración `paper`, y 5 frames en configuración `egg`.
- Predicción táctil: genera un mapa de calor de dimensiones `H×14×26` a partir de las lecturas crudas del sensor F1, con conversión documentada `heatmap[r,c] = raw364[26*r+c]/65535`.
- Entrada multimodal: tres flujos RGB, vector de estado de 19 dimensiones y ventana de 16 frames táctiles.
- Corrección de acciones en vuelo mediante TACE, que solo modifica acciones sustituibles y no comprometidas y re-predice tras la actualización.
- Servicio HTTP con dashboard (`/dashboard`) para inspeccionar VASE, TACE, q final y mapas de calor predichos, y endpoint `/config` para parámetros y descarga de configuración JSON.
- Replay determinista con verificación SHA-256 por archivo y comprobación de relaciones entre módulos mediante `manifest.json`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento textual.

## Casos de uso

- Manipulación de objetos frágiles en laboratorio: el modelo está entrenado y empaquetado específicamente para operar huevos, con configuración `egg` que aplica una base visual `0.6+0.4*q_v` y limita la corrección TACE a 0,1, lo que permite experimentar con agarre y traslado sin romper el objeto.
- Reproducción de experimentos de investigación: el subcomando `tipdex replay --config paper` permite reproducir el pipeline del paper con pesos reales y validar resultados de forma determinista, fijando la revisión del modelo con `HF_REVISION`.
- Integración en pipelines de robótica con ROS u otros frameworks: el servidor `tipdex serve` expone un endpoint HTTP en el puerto 8116 que puede consumirse desde un controlador externo que envíe RGB, estado y lecturas táctiles.
- Desarrollo de sensores táctiles: el mapa de calor predicho `H×14×26` y la conversión raw364 documentada permiten comparar la predicción del modelo con las lecturas reales del sensor F1 para calibrar o depurar el sensor.
- Investigación en corrección de acciones en tiempo real: TACE permite estudiar cómo se corrigen acciones no comprometidas y cómo afecta la re-predicción tras aceptar una actualización, con métricas MAE sobre los 364 valores táctiles.
- Validación de despliegues: el subcomando `tipdex verify` y las 44 pruebas automáticas del wheel permiten comprobar la integridad del paquete antes de integrarlo en un entorno de producción o de laboratorio.
- Docencia y demos de VLA táctil: el dashboard y los ejemplos de replay incluidos facilitan mostrar el funcionamiento interno de VASE, TACE y la predicción táctil sin necesidad de un robot físico, ya que el replay usa eventos SDK construidos explícitamente y no envía comandos al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones realizadas (44 tests automáticos, replay en bucle cerrado con pesos reales y verificación del servidor HTTP en modo lento, rápido y de 30 frames) validan la funcionalidad de inferencia, pero no constituyen una evaluación de precisión táctil ni de tasa de éxito en tareas.

## Requisitos de hardware

- Entorno documentado: Linux, Python 3.11 y GPU NVIDIA con CUDA 12.
- VRAM estimada: no disponible; el repositorio pesa 12,5 GB, pero no se especifica el consumo en inferencia ni por cuantización.
- GPU recomendadas: no disponible; la model card solo exige una GPU NVIDIA con CUDA 12 y permite seleccionar dispositivo con `CUDA_VISIBLE_DEVICES`.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor HTTP propio mediante `tipdex serve` (puerto configurable, por defecto 8116), con dashboard y endpoint de configuración; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA con entrada táctil) ni datos de rendimiento que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está empaquetado para una tarea muy concreta (manipulación de huevos) y su generalización a otros objetos o entornos no está documentada.
- La representación táctil no corresponde a regiones físicas: la posición del mapa de calor indica el índice de registro y el valor no representa presión o fuerza calibrada.
- Las comprobaciones de validación no evalúan precisión táctil ni tasa de éxito de la tarea; no deben interpretarse como métricas de rendimiento real.
- El replay utiliza eventos SDK construidos explícitamente y no envía comandos al robot, por lo que no sustituye a una prueba en hardware real.
- Licencia compuesta apache-2.0-and-gemma: la base y los parámetros derivados están sujetos a `LICENSE` y `LICENSE_GEMMA.txt`, con posibles restricciones para uso comercial que deben revisarse antes de desplegar.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no es de texto general; no obstante, al ser un sistema de aprendizaje automático aplicado a robótica, los fallos de predicción pueden provocar daños físicos en el objeto manipulado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso por terceros.
- No se especifican requisitos de VRAM ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/penguin3333333/TiP-Dex-EGG
- Licencia Gemma: https://huggingface.co/penguin3333333/TiP-Dex-EGG/blob/main/LICENSE_GEMMA.txt
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.

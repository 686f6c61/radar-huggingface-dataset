# djduecaster/dfreq-sock-nov1-yaw

## Resumen

dfreq-sock-nov1-yaw es un artefacto de calibración de comandos para robótica, publicado por el usuario djduecaster en HuggingFace bajo el pipeline `robotics` y la librería `microduck`. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de pesos ONNX que encapsula una política neuronal de locomoción (`BEST_alpha_walking`) junto con una transformación determinista y sin memoria que ajusta los comandos de entrada (yaw y velocidad lineal) antes de pasarlos a la política. El autor lo describe explícitamente como "optimización nativa de física sin derivadas", no como un nuevo entrenamiento neuronal PPO: los pesos neuronales heredados permanecen sin cambios.

El problema que aborda es la calibración de comandos en un entorno de simulación denominado SockHeist, donde la política original muestra un rendimiento subóptimo bajo ciertas consignas de giro y avance. La transformación propuesta actúa únicamente sobre dos componentes del vector de observación (índices 48 y 50, correspondientes a velocidad lineal y yaw), dejando el resto de las 61 entradas float32 intactas. La salida son 14 offsets articulares float32 a 50 Hz.

Su relevancia es limitada y muy específica: se trata de un experimento de nicho con cero descargas y cero likes en el momento de la consulta, sin idiomas declarados y con un tamaño de repositorio de 0.0 GB. No es un modelo de propósito general ni presenta capacidades de texto, visión o razonamiento. La información disponible proviene exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de locomoción (ONNX) con transformación de comandos determinista y sin memoria; pesos heredados de `BEST_alpha_walking` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 61 valores float32 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

La arquitectura combina una política neuronal preexistente (`BEST_alpha_walking`, atribuida a Pollen, con SHA256 `e36332d383997d51401897734cd3e79cf5038406feddb18b4d57ecfb141daa6c`) con una transformación analítica de comandos. Dicha transformación calcula `internal_yaw = 1.25 * obs[50]` e `internal_vx = 1.08 * obs[48] / (1 + 0.2 * internal_yaw^2)`; el resto de las 61 entradas no se modifica. No hay entradas de semilla, reloj, horario, posición ni huella, y no se alteran el evaluador, la dirección externa, la física ni el sistema BAM.

El autor subraya que no se ha realizado ningún entrenamiento neuronal nuevo ni PPO: se trata de optimización de física nativa sin derivadas sobre los comandos entregados. La política opera a 50 Hz con 14 salidas de offsets articulares en float32. El candidato se congeló antes de 128 arranques nuevos, y se reporta que con entradas idénticas y el giro cero real entregado durante "red", las 1024 salidas probadas coinciden exactamente con la política incumbente.

## Capacidades

- Generación de comandos de locomoción para un robot simulado: transforma observaciones de 61 float32 en 14 offsets articulares a 50 Hz.
- Ajuste determinista de yaw y velocidad lineal mediante una fórmula cerrada sin memoria.
- Compatibilidad con el runtime ONNX (se menciona ORT 1.24.4 en las pruebas).
- Ejecución en simulación MuJoCo 3.10 con NumPy 2.4.1 sobre hardware Apple M5 Max.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Calibración de políticas de locomoción en simulación: el artefacto permite comparar el rendimiento de la política original frente a la versión con comandos transformados en el entorno SockHeist, con métricas de tiempo de recorrido y tasas de finalización.
- Evaluación de robustez ante consignas de giro: al probar comandos de 1.1 y 1.2, el autor documenta 32/32 frente a 31/32 y 17/32 frente a 7/32 finalizaciones, lo que sirve para decidir umbrales operativos.
- Reproducción de experimentos de física: investigadores pueden replicar el barrido nativo oficial (22.006 s, 5/5 finalizaciones) y contrastarlo con el histórico publicado (22.183 s) usando los hashes y metadatos fijados.
- Análisis de transferencia sim-a-real: aunque el artefacto es solo de simulación, sirve como referencia para estudiar cómo pequeñas transformaciones de comandos afectan a la estabilidad de la marcha antes de desplegar en hardware.
- Auditoría de atribución y licencias: el repositorio conserva `manifest.json`, `LICENSE`, `NOTICE` y `policy.onnx.NOTICE.txt` con la atribución Apache 2.0 y la fuente exacta de la model card upstream, útil para pipelines de cumplimiento.
- Docencia e investigación en robótica: como ejemplo de optimización sin derivadas sobre políticas neuronales congeladas, sin necesidad de reentrenar.

## Benchmarks y rendimiento

| Metrica | Candidato | Incumbente |
|---|---|---|
| Barrido nativo oficial (tiempo) | 22.006 s | 22.183 s (histórico publicado) |
| Finalizaciones en barrido (5) | 5/5 | no disponible |
| Comando seleccionado | 1.15 | 1.15 (histórico) |
| Arranques nuevos (128) | 121 finalizaciones, 7 capturados | 113 finalizaciones, 10 capturados, 5 caídas |
| Comando 1.1 (32 pruebas) | 32/32 finalizaciones | 31/32 finalizaciones |
| Comando 1.2 (32 pruebas) | 17/32 finalizaciones | 7/32 finalizaciones |
| Ganancia de tiempo esperada | 1.272578 s (IC 95% bootstrap pareado [0.0638, 2.4895]) | referencia |
| Carreras exitosas compartidas | +0.254579 s | referencia |
| Replay histórico (M5 Max/MuJoCo 3.10/NumPy 2.4.1/ORT 1.24.4) | no disponible | 23.362 s a comando 1.1; 4/5 a 1.15 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es un ONNX de política de locomoción y el tamaño del repositorio es de 0.0 GB, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; las pruebas se realizaron sobre Apple M5 Max (no GPU dedicada).
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamaño, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (versión 1.24.4 citada) y el stack `microduck`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; se indica una frecuencia de operación de 50 Hz para las salidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (calibración de comandos sobre políticas de locomoción en simulación).

## Limitaciones y advertencias

- El propio autor declara que es un resultado local de candidato y no una marca personal verificada en servidor ni una reclamación de puntos.
- Existe una discrepancia sin resolver en el replay histórico: el incumbente sin cambios puntuó 23.362 s a comando 1.1 y 4/5 a 1.15 en el stack M5 Max/MuJoCo 3.10/NumPy 2.4.1/ORT 1.24.4, frente a los valores históricos publicados.
- El comando 1.2 no se recomienda (17/32 frente a 7/32).
- No se ofrece ninguna garantía de fiabilidad universal.
- Es un artefacto solo de simulación; no se incluyen mallas del simulador, logs de entrenamiento privados ni nuevos pesos de referencia Sock.
- No incluye capacidades lingüísticas, de visión ni de agente; no debe evaluarse con benchmarks de LLM.
- Licencia Apache 2.0 permite uso comercial, pero la atribución a la política upstream (`BEST_alpha_walking`, Pollen) debe conservarse según los ficheros `NOTICE` y `manifest.json`.
- Cero descargas y cero likes en el momento de la consulta; sin validación externa por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/djduecaster/dfreq-sock-nov1-yaw
- Resultado de búsqueda web no relacionado con el modelo (agregadores de NFTs): https://wootfi.com/10-best-aggregators-for-bridging-nfts-with-metadata/

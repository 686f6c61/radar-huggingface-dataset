# orbuav/darp-xarm-lift-wrist

## Resumen

DARP xArm lift with wrist and scene cameras es una política de robótica entrenada mediante aprendizaje por imitación para la tarea `gym_xarm/XarmLift-v0` del simulador MuJoCo, que consiste en levantar un cubo en coordenadas cartesianas. El modelo es una implementación local de Difference-Aware Retrieval Policy (DARP), un método que combina recuperación de demostraciones similares con una política aprendida. No se trata de un checkpoint publicado por los autores del paper original, sino de la política guardada por un desarrollador (`orbuav`, identificado como Connor en la documentación) a partir de un fork de DARP para macOS.

El resultado declarado es de 20/20 levantamientos autónomos exitosos sobre las semillas 0 a 19, ejecutando cada rollout durante 25 pasos de control a través de la física de MuJoCo, en un Mac con Apple Silicon y el backend MPS. La tarea se evalúa midiendo la altura física real del cubo (éxito si acaba al menos 0,15 m por encima de su altura de reposo) de forma independiente al flag de éxito del entorno.

El paquete incluye el checkpoint con el codificador visual R3M ResNet-18 completo, el estado del optimizador tras 56.280 actualizaciones, 600 episodios de demostración (15.000 transiciones) con sus características visuales, los scalers, las configuraciones, un manifiesto de checksums y los informes de evaluación reales. Es relevante para quienes trabajan en manipulación robótica, políticas por imitación y entrenamiento/evaluación en Apple Silicon con MuJoCo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DARP (Difference-Aware Retrieval Policy) con codificador visual R3M ResNet-18 y MLP de anchos 1024, 512, 512 |
| Parametros totales | no disponible (el repo ocupa 0,1 GB e incluye pesos, estado del optimizador y datos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de tokens; la política usa historia causal con lookback = 5 pasos |
| Tipos de cuantizacion | no disponible (se cargan pesos en precision original; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint `.pth`: `xarm_lift_darp_r3m_wrist.pth`) |

## Arquitectura y entrenamiento

La política se basa en DARP, un esquema de aprendizaje por imitación que combina una política aprendida con un mecanismo de recuperación de vecinos en un banco de demostraciones. El sistema pipelinea dos cámaras (una de muñeca, `wrist`, y una de escena, `camera0`), cada una codificada a 512 características por un R3M ResNet-18 preentrenado. Además se emplean cuatro valores propioceptivos como entrada. La acción predicha es un vector de cuatro dimensiones `[dx, dy, dz, gripper]`.

Los detalles de recuperación incluyen k = 100 vecinos candidatos, lookback = 5 pasos de historia causal y una ratio de vecino final de 0,4. El entrenamiento se realizó durante 120 épocas con batch size 32, alcanzando 56.280 actualizaciones del optimizador; el checkpoint conserva ese estado del optimizador. El conjunto de datos es totalmente sintético: 600 episodios de demostración guionizados generados por script, cada uno de 25 pasos, lo que suma 15.000 transiciones. El runner carga estrictamente los tensores del checkpoint y construye internamente la arquitectura del codificador, por lo que no es necesario descargar pesos R3M por separado ni disponer de caché local de pesos.

No se documentan fases de RLHF ni DPO, ni el uso de refuerzo por retroalimentación humana; el aprendizaje es puramente por imitación sobre la distribución de demostraciones guionizadas. El snapshot del código fuente queda archivado en `connorsoohoo/darp@1b75d98a3e468119f7775b4aa2f5e0ed491347cb`.

## Capacidades

- Generación de acciones de control cartesiano para un brazo xArm: incrementos `[dx, dy, dz]` y comando de gripper.
- Levantamiento del cubo en la tarea `XarmLift-v0` de MuJoCo, con éxito en 20/20 rollouts sobre semillas 0 a 19.
- Fusión de dos vistas visuales (cámara de muñeca y de escena) mediante codificación R3M ResNet-18.
- Uso de propiocepción (cuatro valores por paso) como entrada adicional.
- Recuperación de demostraciones similares del banco de entrenamiento (k = 100 vecinos, lookback = 5).
- Inferencia batch sobre las 15.000 transiciones de entrenamiento con cálculo de MAE y RMSE respecto a las acciones expertas.
- Ejecución en Apple Silicon con backend MPS (codificador, recuperación y política); renderizado y física de MuJoCo en CPU.
- No dispone de tool calling, function calling, agentes, capacidades multilingües, visión semántica general ni modo de razonamiento textual.

## Casos de uso

- Evaluación reproducible de políticas por imitación en MuJoCo: el paquete incluye runner, checksums y manifiesto de ficheros, lo que permite reproducir el resultado 20/20 en un Mac con Apple Silicon y Python 3.12 sin pasos manuales adicionales.
- Investigación en recuperación de demostraciones (retrieval-augmented imitation): los parámetros k = 100, lookback = 5 y ratio 0,4 son ajustables en la configuración, lo que facilita experimentar con la mecánica de DARP sobre una tarea controlada.
- Benchmark de pipelines de robótica en hardware de consumo: sirve como caso de prueba de entrenamiento e inferencia exclusivamente sobre MPS, con gestión de incompatibilidades entre versiones de MuJoCo.
- Análisis de calidad del ajuste a datos de entrenamiento: el comando `infer` produce `predictions.npz` con acciones predichas y expertas, permitiendo calcular MAE/RMSE por trayectoria y paso para detectar modos de fallo.
- Generación de datos sintéticos de manipulación: el paquete incluye el generador del dataset guionizado (600 episodios, 25 pasos), reutilizable para crear nuevas distribuciones de demostración.
- Docencia y divulgación de aprendizaje por imitación: el flujo `eval` escribe `evaluation.json` y un MP4 por episodio, lo que facilita inspeccionar visualmente cada rollout y su éxito físico.
- Integración como componente de un stack mayor de robótica: la política consume observaciones (imágenes + propiocepción) y emite acciones, de modo que puede embeberse en bucles de control que gestionen el entorno MuJoCo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparables (tipo MMLU, HumanEval o GSM8K, que no aplican a este dominio). Los únicos datos reportados por el autor son específicos de la tarea:

| Metrica | Valor |
|---|---|
| Levantamientos autónomos exitosos | 20/20 sobre semillas 0 a 19 |
| Pasos de control por rollout | 25 |
| Criterio de éxito | Cubo al menos 0,15 m por encima de su altura de reposo (verificado de forma independiente al flag del entorno) |
| Dispositivo de evaluación | Apple Silicon, backend MPS, MuJoCo 3.10.0 |
| Transiciones usadas en `infer` | 15.000 (600 episodios x 25 pasos) |
| Metricas de `infer` | MAE y RMSE frente a acciones expertas (valores concretos en `inference.json` del bundle) |

El autor advierte explícitamente que el 20/20 corresponde a una distribución de demostraciones guionizada local y a semillas de reseteo fijas, y que no es la puntuación del benchmark del paper DARP ni un resultado en hardware real. Tampoco se establece la misma ventaja bajo control articular (joint control).

## Requisitos de hardware

- Plataforma de referencia: Apple Silicon con MPS (codificador visual, recuperación y política en GPU; renderizado y física de MuJoCo en CPU).
- Alternativa soportada: `--device cpu` funciona, aunque sin el acelerado MPS.
- Repositorio y artefactos: 0,1 GB, por lo que el almacenamiento requerido es reducido.
- Software: Python 3.12, Git, MuJoCo 3.10.0 (probado), `gym-xarm==0.1.1` instalado con `--no-deps` por incompatibilidad de metadatos con MuJoCo 3, `huggingface-hub==1.18.0`, y sesión de display activa en macOS para el renderizado offscreen.
- Requisitos de VRAM/unified memory: no disponible de forma explícita; el tamaño del modelo (ResNet-18 más MLP) es modesto, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el caso objetivo documentado es Apple Silicon. No se mencionan A100, H100 ni RTX 4090.
- Opciones de despliegue: script `run_pretrained.py` incluido en el bundle (modos `eval` e `infer`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible (no se publican cifras de latencia ni de throughput por paso).

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados comparativos frente a otras políticas (por ejemplo, ACT, Diffusion Policy o la implementación oficial de DARP) en el mismo entorno ni sobre las mismas semillas. Tampoco se ofrecen especificaciones de esos modelos comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DARP xArm lift wrist (orbuav) | no disponible (ResNet-18 + MLP 1024/512/512) | lookback 5 pasos | 20/20 lifts sobre semillas 0–19 (local, guionizado) | no disponible | pública en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El resultado 20/20 se obtuvo sobre una distribución de demostraciones guionizada local y semillas de reseteo fijas; no es la puntuación del benchmark del paper DARP ni un resultado en hardware real.
- La ventaja observada en control cartesiano no garantiza el mismo comportamiento bajo control articular.
- La evaluación depende de una sesión de display activa en macOS para el renderizado offscreen; no se documenta soporte en Linux o Windows.
- Incompatibilidad conocida: los metadatos de `gym-xarm` requieren MuJoCo < 3, mientras que el shim de compatibilidad usa la API de cámara de MuJoCo 3; por ello se instala con `--no-deps`. Cambiar versiones puede romper la reproducibilidad.
- Licencia no disponible: no se especifican condiciones de uso comercial, redistribución ni atribución, lo que supone un riesgo para producción.
- No hay idiomas soportados por tratarse de un modelo de control robótico; la sección de multilingüismo no aplica.
- Riesgo de sobreajuste a la distribución de entrenamiento: las métricas MAE/RMSE del modo `infer` miden el ajuste a los datos de entrenamiento, no la generalización a datos retenidos.
- Idoneidad limitada a una única tarea (`XarmLift-v0`) y a las cámaras y propiocepción documentadas; no es un modelo general de manipulación.
- Alucinación en el sentido lingüístico no aplica; el riesgo análogo es la predicción de acciones inválidas ante observaciones fuera de distribución.
- El bundle está archivado contra un commit concreto de código (`connorsoohoo/darp@1b75d98a...`); cualquier divergencia del código original puede invalidar los checksums y la carga del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/orbuav/darp-xarm-lift-wrist
- Repositorio de scripts de reproducción y quickstart de MuJoCo: https://github.com/connorsoohoo/connor-andrei-work-trial
- Commit del código de origen: `connorsoohoo/darp@1b75d98a3e468119f7775b4aa2f5e0ed491347cb`
- Evidencias de evaluación (rutas dentro del bundle): `evidence/clean-eval-mps/`
- Documentación de procedencia incluida: `SOURCE.md`

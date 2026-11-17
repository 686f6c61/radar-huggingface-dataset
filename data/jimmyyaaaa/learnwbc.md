# Jimmyyaaaa/LearnWBC

## Resumen

LearnWBC G1 es una política de control de cuerpo completo (whole-body control, WBC) para un robot humanoide, publicada por el usuario Jimmyyaaaa en Hugging Face bajo el identificador `Jimmyyaaaa/LearnWBC`. El repositorio no contiene un modelo de lenguaje, sino un par de grafos ONNX que implementan una política de retroalimentación (feedback policy) para el robot G1 con manos BrainCo, junto con los activos de simulación nativos (URDF, MJCF y mallas STL) necesarios para evaluarla en MuJoCo e Isaac.

La arquitectura es una política en dos etapas: un codificador que proyecta una observación de 327 dimensiones a un vector latente de 64, y un decodificador que recibe 1319 entradas y emite 29 acciones junto con diagnósticos. Ambos grafos están serializados en float32 y se ejecutan en CPU mediante ONNX Runtime, con un contrato numérico verificado contra 16 muestras de referencia.

Es relevante para investigadores en robótica humanoide que necesiten reproducir o auditar una política de control con garantías de integridad (hashes SHA256, fixtures numéricos y manifiestos de activos), aunque su alcance es muy acotado: no es un modelo generativo, no soporta lenguaje natural y su licencia es propietaria (`archon-robotics-v0`), lo que limita su uso comercial sin revisión legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control en dos etapas (encoder 327→64, decoder 1319→29), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 327 y 1319 dimensiones) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | `archon-robotics-v0` (other) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`) |

## Arquitectura y entrenamiento

El modelo se compone de dos grafos ONNX independientes. El `encoder.onnx` transforma una observación de 327 valores float32 en un vector de 64 dimensiones; el `decoder.onnx` consume 1319 valores (que incluyen el latente del encoder y otras señales de retroalimentación) y produce 29 acciones más diagnósticos. La política está diseñada para el robot humanoide G1 con manos BrainCo, con 29 actuadores, `nq=36` y `nv=35` según la escena MuJoCo incluida.

No se especifica en la información disponible la arquitectura interna de las redes (número de capas, tipos de capa, funciones de activación), el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RL, imitación o RLHF. El repositorio incluye un contrato de retroalimentación, un manifiesto de modelo y un fixture numérico que vinculan la inferencia a los hashes publicados, pero no documenta el proceso de entrenamiento.

La innovación técnica destacable es la verificación numérica: la validación en CPU con ONNX Runtime, batch size 1 y las 16 muestras del fixture exige tokens del encoder bit-exactos y un error absoluto máximo de 1e-4 en acciones y diagnósticos. También se incluyen activos de simulación nativos sin modificar (142 archivos de robot, 60.927.986 bytes) con manifiestos SHA256 para MuJoCo e Isaac.

## Capacidades

- Generación de acciones de control de cuerpo completo para un robot humanoide G1 (29 actuaciones).
- Codificación de observaciones de 327 dimensiones en un latente de 64.
- Decodificación de 1319 entradas en 29 acciones más diagnósticos.
- Ejecución en CPU mediante ONNX Runtime con batch size 1.
- Integración con simuladores MuJoCo (escena `scene.xml`) e Isaac (URDF `main.urdf`).
- Verificación de integridad mediante `SHA256SUMS` y manifiestos de activos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas de control en simulación MuJoCo: cargar `policy/learnwbc_g1` como directorio de checkpoint y ejecutar la escena `_assets/g1_brainco_fk_matched/scene.xml` para reproducir el comportamiento del robot G1 con 29 actuadores.
- Auditoría numérica de políticas: usar el fixture de 16 muestras y el manifiesto numérico para comprobar que las acciones y diagnósticos no se desvían más de 1e-4 respecto a la referencia publicada.
- Integración en pipelines de robótica con Isaac: emplear el URDF `artifacts/isaac/robot_description/urdf/g1_brainco/main.urdf` y sus 69 mallas STL para probar la política en un entorno Isaac, respetando la estructura `package://robot_description/...`.
- Validación de despliegue en producción: el validador de despliegue debe soportar `model_files_sha256`; los validadores antiguos que exigen contadores de entrenamiento necesitan una actualización de compatibilidad.
- Reproducibilidad de experimentos: descargar un commit fijado del repositorio, restaurar el enlace `_assets/deploy` y verificar con `sha256sum -c SHA256SUMS` antes de ejecutar inferencia.
- Estudio de contratos de observación y retroalimentación: el repositorio incluye la configuración de observación y el contrato de feedback, útiles para adaptar la política a variantes del robot o a nuevas tareas de control.
- Docencia e investigación en control de humanoides: servir como ejemplo de política WBC empaquetada con activos de simulación y verificación numérica reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio solo documenta una puerta de aceptación numérica (tokens del encoder bit-exactos y error absoluto ≤ 1e-4 en acciones y diagnósticos sobre 16 muestras en CPU), no métricas de rendimiento de tareas, recompensa ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio es de 0,1 GB y los pesos son float32, por lo que la inferencia cabe holgadamente en memoria de sistema.
- GPU recomendadas: no disponibles; la verificación publicada se realizó en CPU con ONNX Runtime.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta ejecución en GPU.
- Opciones de despliegue: ONNX Runtime (CPU, batch size 1); simuladores MuJoCo e Isaac para los activos.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas WBC comparables con las que contrastar parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades generativas generales.
- La licencia `archon-robotics-v0` es propietaria y requiere revisión legal antes de cualquier uso comercial; el aviso Revo2/Willow Garage se mantiene para las mallas compartidas y la licencia del modelo no impone nuevos términos sobre los activos de robot suministrados por separado.
- La validación publicada es numérica en CPU, no en GPU ni en robot real; no se realizó un rollout en Isaac.
- Los activos no afirman equivalencia con la configuración alternativa de colisión de manos del benchmark histórico.
- No se garantiza equivalencia con checkpoints de paper ni reproducción de benchmarks.
- El validador de despliegue debe soportar `model_files_sha256`; validadores antiguos pueden fallar.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual, pero la política puede producir acciones fuera de rango si se alimenta con observaciones fuera de distribución.
- No se documentan limitaciones de idioma, contexto ni sesgos demográficos porque el modelo no opera sobre esos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jimmyyaaaa/LearnWBC
- Licencia del modelo: https://huggingface.co/Jimmyyaaaa/LearnWBC/blob/main/policy/learnwbc_g1/LICENSE
- Manifiesto del modelo: https://huggingface.co/Jimmyyaaaa/LearnWBC/blob/main/policy/learnwbc_g1/model_manifest.json
- Aviso legal: https://huggingface.co/Jimmyyaaaa/LearnWBC/blob/main/NOTICE
- Avisos upstream: https://huggingface.co/Jimmyyaaaa/LearnWBC/blob/main/LICENSES/GEAR-SONIC.txt
- Datos de evaluación: https://huggingface.co/Jimmyyaaaa/Test

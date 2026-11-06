# KineJIng/KineJing-State-PushT-Research

## Resumen

KineJing State PushT Research es un modelo de dinámica de estados condicionado por acciones, desarrollado por KineJIng, que predice la evolución futura de las poses de un empujador (pusher) y un bloque en T dentro de un simulador 2D de empuje. No es un modelo de mundo general, ni un generador de vídeo, ni una política robótica: es un componente de investigación acotado al dominio del entorno PushT. Se distribuye como un checkpoint numérico real junto con su implementación de inferencia en NumPy, sin dependencias de encoders externos ni conexión de red en tiempo de inferencia.

El modelo consiste en un ensemble de tres miembros, cada uno un MLP residual de 139.014 parámetros, sumando 417.042 parámetros neuronales totales, entrenados con las semillas 7, 17 y 27. Cada miembro recibe 22 entradas de geometría e historial, procesa tres capas ocultas de 256 unidades con activación SiLU y produce seis salidas codificadas. La inferencia promedia las predicciones de los tres miembros.

Su relevancia es acotada y experimental: demuestra un pipeline completo de dinámica de estados con contrato de entrada/salida explícito, checkpoint verificable por hash y runtime portable en NumPy puro. Está pensado para investigadores que necesiten un modelo de referencia ligero para experimentos de predicción de estados en simuladores de manipulación 2D, no para despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 MLP residuales (22 entradas, 3 capas ocultas de 256 con SiLU, 6 salidas codificadas) |
| Parametros totales | 417.042 (3 miembros de 139.014 cada uno) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2 estados previos de historial (separados 0,1 s) y 1 a 32 acciones de entrada |
| Tipos de cuantizacion | no disponible (checkpoint NumPy en precisión nativa) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | NPZ (NumPy), archivo `kinejing-state-pusht-v1.npz` de 1.560.489 bytes |

## Arquitectura y entrenamiento

Cada miembro del ensemble es un perceptrón multicapa residual. La entrada combina 22 características de geometría e historial: dos estados previos con cinco valores cada uno (`agent_x_px`, `agent_y_px`, `block_x_px`, `block_y_px`, `block_angle_rad`) más la acción objetivo del empujador. La posición se normaliza dividiendo por 512 y la orientación se representa sobre la circunferencia unidad. La salida son seis valores codificados que se decodifican a un estado de cinco valores por acción. La inferencia promedia los tres miembros.

El entrenamiento utilizó 256 episodios de simulación recogidos por la empresa y 32 episodios de validación separados; el conjunto de test registrado contiene 32 episodios disjuntos del mismo simulador y distribución de exploración. La recolección se realizó sobre el entorno PushT con licencia MIT de `diffusion_policy`, fijado al commit `5ba07ac6661db573af695b419a7947ecb704690f`. No se incluye ningún modelo preentrenado de terceros ni dataset de imitación descargado: la inicialización es aleatoria y las observaciones son generadas por el simulador.

## Capacidades

- Predicción de dinámica de estados: dado un historial de dos estados y una secuencia de acciones, predice las poses futuras del empujador y del bloque en T.
- Soporte de horizontes de predicción de 1, 3 y 16 acciones con evaluación registrada; horizontes de 17 a 32 son solo extrapolación.
- Ensemble de tres miembros con promedio de predicciones para reducir varianza.
- Inferencia determinista y portable en NumPy puro, sin dependencias de red ni encoders externos.
- Contrato de entrada/salida explícito con validación de rangos: estados XY en `[-256, 768]` píxeles, acciones en `[0, 512]`, ángulos módulo 2π.
- Soporte de 1 a 32 acciones por llamada.
- Idiomas de documentación: inglés y chino.
- No soporta tool calling, function calling, agentes, visión, audio ni generación de texto.

## Casos de uso

- Investigación en dinámica de estados para manipulación 2D: el modelo sirve como referencia ligera para comparar arquitecturas de predicción de estados en el entorno PushT, con un contrato de entrada/salida bien definido y checkpoint verificable.
- Evaluación de ensembles en simulación: al promediar tres miembros entrenados con semillas distintas, permite estudiar la dispersión del ensemble como señal (no calibrada) en experimentos académicos.
- Prototipado de planificación en bucle abierto: investigadores pueden usar las predicciones de 1 a 16 pasos para explorar planificadores que operen sobre estados simulados, sin asumir validez en bucle cerrado.
- Reproducibilidad de artefactos de investigación: el hash SHA-256 del checkpoint y `provenance.json` permiten verificar la integridad de los resultados registrados en publicaciones o informes internos.
- Docencia y divulgación: el runtime en NumPy puro y el tamaño reducido (417.042 parámetros) lo hacen adecuado para explicar pipelines de modelos de dinámica sin infraestructura de GPU.
- Integración en pipelines de simulación offline: como paso de predicción dentro de un simulador o banco de pruebas, siempre que las poses completas de los objetos se obtengan de forma externa.

## Benchmarks y rendimiento

| Metrica | Valor | Ambito |
|---|---|---|
| RMSE de posición del bloque T a 3 pasos | 9,542668 píxeles | 32 episodios de test registrados |
| RMSE de ángulo del bloque T a 3 pasos | 0,105931 radianes | 32 episodios de test registrados |

Estos valores son resultados registrados históricamente, no un benchmark repetido ni una prueba ciega de cambio de distribución. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de propósito general, ya que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo se ejecuta en CPU con NumPy, sin requisito de GPU.
- GPU recomendadas: no aplica; no requiere aceleración por hardware.
- Cabe en cualquier GPU de consumo y en CPU convencional; el checkpoint ocupa 1.560.489 bytes.
- Opciones de despliegue: Python 3.10+ con NumPy y el archivo `state_runtime.py` junto al checkpoint. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo card solo documenta una comprobación de inferencia determinista con salida finita (`smoke-result.json`), no una medición de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (dinámica de estados en simuladores 2D) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Solo acepta estados de simulación; no procesa imágenes ni genera vídeo, y no ha sido validado en robots físicos.
- Los episodios de test siguen la distribución de recolección; no hay afirmación de generalización fuera de distribución ni a entornos industriales.
- El historial de poses omite estado oculto de velocidad y contacto; los errores multi-paso pueden acumularse.
- La dispersión del ensemble no es una confianza calibrada ni una garantía de seguridad.
- Las mediciones offline no demuestran planificación en bucle cerrado ni finalización de tareas.
- El paquete es un checkpoint de investigación y una referencia de inferencia portable; no despliega API, autenticación, pagos ni operaciones de empresa.
- El llamador debe proporcionar mediciones completas de pose; estimarlas desde imágenes requeriría un sistema adicional cuyos errores quedan fuera de la evidencia del modelo.
- Las acciones objetivo fuera del rango de recolección `[32, 480]` no han sido validadas, aunque la interfaz acepte `[0, 512]`.
- Los horizontes de 17 a 32 acciones son solo extrapolación.
- Licencia MIT: permite uso comercial, pero el aviso de copyright del simulador PushT se mantiene separado en `LICENSE-PUSHT-ENV.txt`.

## Enlaces

- Hugging Face: https://huggingface.co/KineJIng/KineJing-State-PushT-Research
- Simulador PushT (commit fijado): https://github.com/real-stanford/diffusion_policy/tree/5ba07ac6661db573af695b419a7947ecb704690f

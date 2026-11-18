# grablab/act_pick_place_v3_dagger3_010000

## Resumen

`grablab/act_pick_place_v3_dagger3_010000` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer) publicado por el usuario `grablab` en Hugging Face. El modelo está entrenado para la tarea de *pick-and-place* sobre un dial con el robot SO-101 en el simulador MuJoCo, usando el perfil de montaje real v3. No es un modelo de lenguaje: es una política de imitación que mapea observaciones visuales y de estado a secuencias de acciones motoras.

El checkpoint corresponde al paso 10.000 de entrenamiento de una ejecución denominada `dagger3`, lo que sugiere el uso de DAgger (Dataset Aggregation) para la recolección de datos. Cuenta con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, en formato safetensors y empaquetado para la librería LeRobot.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil para quien trabaje con el robot SO-101 o con políticas ACT en simulación, pero sin métricas publicadas, licencia declarada ni soporte multilingüe. La información disponible en la model card es mínima y remite a documentación externa en un repositorio de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una política de imitación que predice *chunks* de acciones futuras en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación y permite un control más suave. La arquitectura combina un codificador visual (habitualmente ResNet preentrenado) con un transformer que atiende conjuntamente a las observaciones y al estado del robot, y un decodificador que genera la secuencia de acciones. El checkpoint tiene 51,7 millones de parámetros, un tamaño coherente con una política ACT de este tipo.

Según la model card, el entrenamiento se realizó en el clúster HPC del CoE de la Universidad Estatal de San José (SJSU), sobre datos de la tarea de *pick-and-place* de un dial con el robot SO-101 en MuJoCo, con el perfil de montaje real v3. El sufijo `dagger3` indica que la recolección de datos siguió un esquema DAgger en su tercera iteración, agregando trayectorias corregidas por el experto sobre las políticas previas. No se especifican el número de episodios, la composición del dataset ni si hubo ajuste fino adicional. El checkpoint corresponde al paso 10.000.

## Capacidades

- Control robótico de manipulación: genera secuencias de acciones (*action chunks*) para ejecutar la tarea de *pick-and-place* sobre un dial con el robot SO-101.
- Política de imitación visual-motora: consume observaciones de cámara y estado del robot para producir comandos de actuadores.
- Entrenamiento con DAgger: incorpora datos de corrección humana en el bucle, lo que en principio mejora la robustez frente a estados fuera de distribución.
- Ejecución en simulación MuJoCo con perfil de montaje real v3, pensada para transferencia al robot físico.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo generativo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad fuera del dominio de control robótico.

## Casos de uso

- Investigación en imitación robótica: servir como línea base reproducible para comparar variantes de ACT sobre la misma tarea y el mismo robot simulado.
- Evaluación de DAgger: el checkpoint de la iteración `dagger3` permite medir la ganancia de rendimiento respecto a iteraciones previas del mismo pipeline.
- Transferencia sim-a-real con SO-101: al entrenarse con el perfil de montaje real v3, puede emplearse como punto de partida para despliegue en el robot físico tras validación en MuJoCo.
- Ajuste fino sobre nuevas tareas de pick-and-place: al ser un checkpoint LeRobot, se puede reentrenar con datasets propios del mismo formato para variantes de la tarea.
- Docencia y formación: ejemplo práctico de pipeline completo (recolección de datos, entrenamiento ACT, evaluación en simulación) en cursos de robótica o aprendizaje por imitación.
- Integración en entornos LeRobot: cargar la política dentro de las herramientas de la librería para ejecutar rollouts automatizados y análisis de curvas de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,2 GB en safetensors; con el codificador visual y los buffers de inferencia, el consumo en FP32 se estima en torno a 0,5-1 GB, aunque no hay medición publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para reentrenamiento se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100), dado que el entrenamiento original se ejecutó en un clúster HPC.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (carga nativa del checkpoint), PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `grablab/act_pick_place_v3_dagger3_010000` | 51,7 M | no disponible | Pick-and-place SO-101 en MuJoCo | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no disponible | Manipulación genérica | Apache-2.0 (librería) | Hugging Face / GitHub |
| Políticas Diffusion Policy | no disponible | no disponible | Manipulación visual-motora | varía por checkpoint | Hugging Face |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento de alternativas en la misma tarea concreta. Las alternativas citadas son familias de políticas, no checkpoints equivalentes entrenados sobre el mismo dataset.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datos de una única tarea y un único robot, la política estará sesgada hacia esa configuración y fallará fuera de ella.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante observaciones fuera de distribución.
- Limitaciones de contexto e idioma: no aplica soporte de lenguaje; la política solo opera sobre la tarea y el perfil de simulación declarados.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveats para producción: sin métricas de éxito publicadas, sin validación en robot físico documentada y con una model card mínima que remite a documentación externa; no se recomienda su despliegue en entornos reales sin una evaluación propia exhaustiva.
- El repositorio tiene 0 descargas y 0 *likes*, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/grablab/act_pick_place_v3_dagger3_010000
- Documentación de resultados y datos: `docs/MODELS.md` en `chanwill245/pnpmodel`, rama `v3-grip-fix` (referenciada en la model card; no se proporciona URL directa)
- LeRobot (librería): https://github.com/huggingface/lerobot

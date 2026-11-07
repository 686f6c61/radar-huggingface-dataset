# Myungkyu/pi0_5_jax_robodojo_vanilla_b128_60k

## Resumen

`pi0_5_jax_robodojo_vanilla_b128_60k` es un checkpoint de ajuste fino del modelo visión-lenguaje-acción (VLA) Pi0.5, publicado por el usuario Myungkyu como baseline "vanilla" para el proyecto RLDX-2. Parte del modelo base `lerobot/pi05_base` y se ha entrenado sobre el conjunto RoboDojo Sim en configuración co-train (35 tareas x 100 episodios) con un robot dual ARX X5, siguiendo la receta oficial de RoboDojo `pi05_base_aloha_full_sim_arx-x5_seed_0`. El resultado es una política de control robótico que mapea imágenes de cámara e instrucciones en lenguaje natural a comandos de articulaciones.

El modelo está implementado sobre openpi en JAX (vendorizado en el adaptador XPolicyLab Pi_05) y no sobre PyTorch, lo que condiciona su despliegue: los pesos se distribuyen en formato orbax, no en safetensors ni GGUF. La inferencia consume tres vistas de cámara (cabeza y dos muñecas), un estado articular de 14 dimensiones y la instrucción de tarea, y produce 14 objetivos articulares absolutos con chunk de 50 pasos.

Su relevancia es acotada y experimental: se trata de un baseline de referencia para comparar variantes de entrenamiento dentro de RoboDojo, no de un modelo de propósito general. El repositorio ocupa 149,3 GB e incluye checkpoints intermedios en los pasos 15000, 30000 y 45000, además del final en 60000 pasos. No tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA) sobre openpi en JAX, adaptador XPolicyLab Pi_05 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en orbax; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural; idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | orbax (checkpoint JAX); EMA 0.99 en `params/` |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | RoboDojo-Benchmark/RoboDojo (35 tareas x 100 episodios) |
| Entradas | Imagen de cabeza + imagenes de muneca izquierda/derecha, estado articular 14-d, instruccion de tarea |
| Salidas | 14 objetivos articulares absolutos, chunk de 50 pasos |
| Pasos de entrenamiento | 60000 (batch 128) |
| Checkpoints intermedios | step-15000, step-30000, step-45000 |
| Tamano del repositorio | 149,3 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de `gs://openpi-assets/checkpoints/pi05_base`, la implementación Pi0.5 de openpi en JAX. La receta emplea chunk de 50 pasos, representación de articulaciones en delta con pinzas absolutas, normalización por cuantiles usando `assets/arx_x5_sim/norm_stats.json` y pesos EMA con factor 0.99 almacenados en `params/` en formato orbax. La configuración se registra como `pi05jax_robodojo` en el registro de configuraciones de openpi.

El entrenamiento usa batch 128 durante 60000 pasos sobre el conjunto RoboDojo Sim en configuración co-train (35 tareas, 100 episodios por tarea, robot dual ARX X5, exportación oficial de LeRobot). El checkpoint final no incluye el estado del optimizador. Se publican además subconjuntos de inferencia de los pasos 15000, 30000 y 45000, cada uno con su propio `SHA256SUMS`. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico por imitación: genera trayectorias de 14 articulaciones (chunk de 50 pasos) a partir de observaciones visuales y estado articular.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto de instrucción junto a las imágenes.
- Percepción multi-vista: procesa simultáneamente cámara de cabeza y dos cámaras de muñeca.
- Manipulación bimanual: entrenado sobre robot dual ARX X5, con salidas para ambas extremidades.
- Seguimiento de instrucciones de tarea dentro del dominio RoboDojo Sim (35 tareas).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Baseline de referencia en investigación VLA: sirve para comparar variantes de entrenamiento (distintos datasets, hiperparámetros o arquitecturas de adaptador) contra un punto de partida reproducible con la receta oficial de RoboDojo.
- Evaluación de recetas de co-train: permite medir el efecto de mezclar 35 tareas x 100 episodios frente a entrenamientos por tarea única en el simulador RoboDojo.
- Estudio de convergencia mediante checkpoints intermedios: los pasos 15000, 30000 y 45000 permiten analizar curvas de aprendizaje y estabilidad del ajuste fino sin reentrenar.
- Reproducción de resultados en RoboDojo Sim: al seguir la receta `pi05_base_aloha_full_sim_arx-x5_seed_0`, facilita la verificación independiente de resultados publicados.
- Punto de partida para ajuste en hardware ARX X5 real: el modelo aprende representaciones de manipulación bimanual en simulación que pueden servir de inicialización para transferencia sim-a-real.
- Desarrollo de pipelines de inferencia en JAX: útil para equipos que trabajan con openpi y necesitan un checkpoint funcional para validar integraciones del adaptador XPolicyLab Pi_05.
- Investigación en normalización y representación de acciones: la combinación de delta de articulaciones con pinzas absolutas y normalización por cuantiles puede evaluarse frente a alternativas con este checkpoint como control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 149,3 GB e incluye múltiples checkpoints; el checkpoint final por sí solo requiere descarga selectiva con `ignore_patterns="checkpoints/*"`.
- GPU recomendadas: no disponible en la información proporcionada. El tamaño del repositorio y el uso de JAX/orbax sugieren GPUs de centro de datos, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi en JAX con el adaptador XPolicyLab Pi_05. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política robótica.
- Latencia y throughput: no disponibles.
- Descarga selectiva: `snapshot_download("Myungkyu/pi0_5_jax_robodojo_vanilla_b128_60k", allow_patterns="checkpoints/step-5000/*")` para un paso concreto; `ignore_patterns="checkpoints/*"` para descargar solo el checkpoint final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato |
|---|---|---|---|---|---|
| pi0_5_jax_robodojo_vanilla_b128_60k | no disponible | no disponible | RoboDojo Sim co-train, 60k pasos, batch 128 | no disponible | orbax (JAX) |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | Preentrenamiento base Pi0.5 | no disponible | no disponible |
| Myungkyu/pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k | no disponible | no disponible | Bench2Dex (ur5_rh56dfx_3, 4 vistas) | no disponible | orbax (JAX) |

Los tres modelos comparten la misma arquitectura Pi0.5 sobre openpi en JAX y la misma receta de ajuste (batch 128, 60k pasos), diferenciándose únicamente en el dataset y la configuración del robot. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre RoboDojo Sim con robot dual ARX X5; no se garantiza su funcionamiento en otros robots, morfologías o entornos reales sin ajuste adicional.
- Sin datos de evaluación publicados: no hay benchmarks que respalden su rendimiento, por lo que su utilidad como baseline es metodológica, no comparativa.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si se permite uso comercial. Debe contactarse con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce el idioma de las instrucciones de tarea con el que fue entrenado y su robustez ante variaciones lingüísticas.
- Formato orbax: requiere el ecosistema JAX/openpi; no es directamente consumible por herramientas PyTorch, llama.cpp u Ollama.
- Checkpoint final sin estado del optimizador: no es posible reanudar el entrenamiento exactamente desde el paso 60000.
- Repositorio de gran tamaño (149,3 GB): la descarga completa es costosa; es necesario usar patrones de descarga selectiva.
- Riesgo de sobreajuste al simulador: el co-train con 100 episodios por tarea puede no capturar la variabilidad del mundo real, con degradación esperable en transferencia sim-a-real.
- Sin métricas de sesgo o alucinación aplicables: al ser un modelo de política, el riesgo relevante es la ejecución de acciones incorrectas o inseguras en el robot, no la generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/pi0_5_jax_robodojo_vanilla_b128_60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset RoboDojo: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Modelo hermano (Bench2Dex): https://huggingface.co/Myungkyu/pi0_5_jax_b2d_ur5_rh56dfx_3_b128_60k
- openpi (repositorio de referencia de Pi0.5): no disponible en la información proporcionada
- Paper de Pi0.5: no disponible en la información proporcionada
- Repositorio XPolicyLab: no disponible en la información proporcionada

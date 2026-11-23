# Dexverse-CSI/groot-n17-xlvla-bimanual-40k

## Resumen

GR00T N1.7 on DexVerse es un ajuste fino completo (*full fine-tune*) del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B` publicado por Dexverse-CSI. El modelo parte de los 3.144.016.000 parametros del checkpoint base de NVIDIA y se ha entrenado sobre el conjunto de datos bimanual de DexVerse, un corpus de manipulacion diestra con seis manos y cuatro tareas distintas. El resultado es un *policy* visio-linguo-accion (VLA) especializado en control bimanual con estado y accion de 62 dimensiones (31 por mano), pensado para ejecutarse sobre el mismo *embodiment* y la misma representacion que la linea base `Dexverse-CSI/xlvla-pi05`.

La relevancia de esta publicacion es doble. Por un lado, demuestra que es viable adaptar un VLA fundacional de 3B parametros a un dominio robotico concreto mediante ajuste completo de todas sus componentes (LLM, vision, proyector y DiT de acciones), no solo mediante LoRA o adaptadores. Por otro lado, ofrece un punto de comparacion controlado frente a la linea base pi0.5, ya que ambos modelos comparten datos, prompts, estadisticas de normalizacion y calibracion de muneca, lo que permite aislar el efecto de la arquitectura.

El repositorio ocupa 55,3 GB e incluye el paso 40000 en la raiz y el resto de checkpoints guardados en `checkpoints/<step>/` (solo pesos, no reanudables). No se han publicado resultados de benchmarks ni una licencia explicita en la informacion disponible, lo que limita su uso en produccion sin una verificacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en GR00T N1.7 (LLM + torre de vision + proyector + DiT de acciones) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `gr00t`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `nvidia/GR00T-N1.7-3B`, un VLA que combina un *backbone* de lenguaje, una torre de vision, un proyector multimodal y un cabezal de difusion (DiT) que genera las acciones. En este ajuste se han actualizado todas las componentes: LLM, vision, proyector y DiT. La accion se representa como un vector de 62 dimensiones `[right 31 | left 31]`, con todas las claves de accion en modo ABSOLUTE y NON_EEF, y un horizonte de accion de 10 pasos (`delta_indices` 0..9), manteniendo el `action_horizon` de 40 del modelo base.

El entrenamiento se realizo con el codigo `Isaac-GR00T` (commit 708617f, script `launch_finetune.py`) sobre un *embodiment* NEW_EMBODIMENT definido en `training/configs/dexverse_bimanual_config.py`. Los datos son 1.200 episodios de teleoperacion (50 por celda, 6 manos x 4 tareas: OpenFlatFolder-v1, SlideUtilityKnife-v1, BimanualLiftTray-v0 y BimanualLiftCarton-v0), a 60 fps sin remuestreo. El estado y la accion se reconstruyeron con el codigo `cross_dex` de xlvla y una calibracion de muneca medida en simulador (`training/configs/wrist_calib_*.json`); las estadisticas resultantes coinciden con las de xlvla-pi05 (diferencia maxima de media <= 0.0004 y de desviacion tipica <= 0.0005). Los videos se re-codificaron de AV1 a H.264. El prompt es unicamente la frase de tarea, sin identidad de mano, con las mismas cadenas que pi0.5.

La configuracion de entrenamiento fue: batch global 128 (4x B200, 32 por GPU), learning rate 1e-4 con warmup del 5% y decaimiento coseno (valores por defecto de GR00T), 40.000 pasos, bf16 y normalizacion q01/q99.

## Capacidades

- Control bimanual de manipulacion diestra con estado y accion de 62 dimensiones (31 por mano).
- Ejecucion de cuatro tareas concretas: apertura de carpetas planas, deslizamiento de cuchillo de utilidad, levantamiento bimanual de bandeja y levantamiento bimanual de carton.
- Percepcion visual multimodal con tres camaras: tercera persona, `eye_in_hand` derecha y `eye_in_hand_left`.
- Generacion de secuencias de accion con horizonte de 10 pasos por inferencia.
- Condicionamiento por instruccion en lenguaje natural (frase de tarea).
- Generalizacion limitada al dominio de datos de DexVerse; no se documentan capacidades de tool calling, agentes, matematicas ni codigo, que quedan fuera del proposito del modelo.
- No se documentan capacidades multilingues ni modos de razonamiento explicito (thinking mode).

## Casos de uso

- **Automatizacion de tareas de picking bimanual en almacen**: el modelo puede ejecutar el levantamiento coordinado de bandejas y cartones con ambas manos, usando las tres camaras para localizar el objeto y generar la trayectoria de 62 dimensiones en cada paso de inferencia.
- **Manipulacion diestra en lineas de montaje**: las tareas de deslizamiento de cuchillo y apertura de carpetas planas son representativas de operaciones que requieren coordinacion fina entre las dos manos; el modelo se usaria como policy de bajo nivel bajo un planificador de alto nivel.
- **Investigacion en aprendizaje por imitacion**: al compartir datos, prompts y normalizacion con `Dexverse-CSI/xlvla-pi05`, sirve como referencia controlada para comparar arquitecturas VLA (GR00T N1.7 frente a pi0.5) sobre el mismo corpus.
- **Generacion de datos sinteticos y evaluacion en simulador**: el checkpoint puede desplegarse en el simulador asociado a DexVerse para generar rollouts y medir tasas de exito antes de transferir a hardware real.
- **Prototipado de politicas bimanuales para nuevos *embodiments***: la configuracion NEW_EMBODIMENT y el codigo de calibracion de muneca documentados permiten reutilizar el pipeline para adaptar el modelo a otras manos o cinemáticas.
- **Benchmark interno de robustez visual**: al emplear tres vistas (tercera persona y dos `eye_in_hand`), es util para estudiar la contribucion de cada camara a la precision de la accion en tareas de contacto.
- **Base para ajustes posteriores**: el repositorio incluye checkpoints intermedios en `checkpoints/<step>/`, utiles para analizar la evolucion del entrenamiento o para partir de un paso anterior en nuevos ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 3.144.016.000 parametros, en bf16 los pesos ocupan aproximadamente 6,3 GB; en fp32, unos 12,6 GB. A ello hay que sumar el estado del optimizador solo en entrenamiento, no en inferencia.
- **GPU recomendadas**: el entrenamiento se realizo en 4x B200 (32 por GPU, batch global 128). Para inferencia no se documenta una GPU minima; por tamano, cabria esperar que una GPU con 16-24 GB de VRAM pueda alojar los pesos en bf16, aunque no hay confirmacion oficial.
- **Compatibilidad con GPU de consumo**: no confirmada. El tamano de pesos en bf16 (~6,3 GB) sugiere que una RTX 4090 (24 GB) podria alojarlos, pero la torre de vision y las tres camaras anaden memoria de activaciones no cuantificada.
- **Opciones de despliegue**: la libreria declarada es `gr00t` (Isaac-GR00T). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLM de texto y no a politicas VLA.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T N1.7 on DexVerse (este) | 3.144.016.000 | no disponible | 4 tareas bimanuales, 6 manos | no disponible | Hugging Face, repo 55,3 GB |
| Dexverse-CSI/xlvla-pi05 | no disponible | no disponible | mismas 4 tareas y mismo corpus | no disponible | Hugging Face (referencia del autor) |
| nvidia/GR00T-N1.7-3B | 3B (aproximado) | no disponible | modelo fundacional generalista | no disponible | Hugging Face (modelo base) |

La comparacion directa con pi0.5 es la mas informativa porque comparte datos, prompts, estadisticas de normalizacion y calibracion; sin embargo, no se han publicado metricas de rendimiento comparadas en la informacion disponible.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia en la model card ni en los metadatos, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base `nvidia/GR00T-N1.7-3B` antes de cualquier despliegue.
- **Dominio muy restringido**: el ajuste cubre unicamente cuatro tareas y seis manos del corpus DexVerse; no se documenta generalizacion fuera de ese dominio.
- **Riesgo de sobreajuste**: 40.000 pasos sobre 1.200 episodios con ajuste completo de un modelo de 3B puede provocar sobreajuste al conjunto de teleoperacion; no se aportan curvas de validacion.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de tasa de exito ni comparacion con la linea base pi0.5.
- **Idiomas no documentados**: el prompt se limita a frases de tarea en el idioma del dataset; no se declara soporte multilingue.
- **Sesgos**: no documentados; al entrenarse con teleoperacion humana, puede heredar sesgos de los operadores y de las condiciones fisicas del montaje.
- **Alucinacion en acciones**: como policy generativa, puede producir trayectorias fisicamente invalidas; requiere capas de seguridad y validacion en el controlador.
- **Checkpoints no reanudables**: los pasos intermedios en `checkpoints/<step>/` contienen solo pesos, no estado del optimizador, por lo que no permiten reanudar el entrenamiento.
- **Formato y ecosistema**: la dependencia de la libreria `gr00t` limita la portabilidad frente a formatos estandar como GGUF u ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/groot-n17-xlvla-bimanual-40k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Linea base pi0.5 del autor: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Codigo de entrenamiento Isaac-GR00T (commit 708617f): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada

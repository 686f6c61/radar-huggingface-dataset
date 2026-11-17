# hipfire-models/qwen3.6-27b

## Resumen

Qwen3.6-27B para hipfire es una distribucion pre-cuantizada del modelo Qwen3.6-27B (un refresco de Qwen3.5-27B con entrenamiento mas reciente) empaquetada por hipfire-models para su uso con hipfire, un motor de inferencia nativo en Rust con backend HIP orientado especificamente a GPUs AMD de consumo de las familias RDNA1 a RDNA4. El modelo base lo desarrolla Qwen y conserva la arquitectura hibrida DeltaNet + FullAttention del Qwen3.5-27B original, con 32 capas, 16 cabezas de atencion, 4 cabezas KV y `head_dim=256`.

El problema que resuelve este repositorio no es el de ofrecer un modelo nuevo, sino el de hacer viable la inferencia de un modelo de 27B de parametros en GPUs AMD consumer sin pasar por el ecosistema CUDA. Para ello distribuye pesos ya cuantizados en formato propietario del motor (HFQ4-G256, 4,25 bits por peso) junto con un draft de decodificacion especulativa DFlash de 1,73B de parametros que acelera la generacion.

La relevancia actual del artefacto esta en su proposito practico: con un peso objetivo de 14,0 GB y un minimo de 16 GB de VRAM, el modelo cabe en tarjetas como la RX 7900 XTX (gfx1100), donde el autor reporta 44 tok/s en decodificacion autorregresiva y hasta 185 tok/s con el draft activado en prompts de codigo. La licencia del empaquetado es MIT; los pesos subyacentes heredan las condiciones de Qwen y z-lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido DeltaNet + FullAttention (`arch_id=5`), 32 capas, 16 cabezas de atencion, 4 cabezas KV, `head_dim=256` |
| Parametros totales | no disponible (modelo base de 27B segun nomenclatura) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HFQ4-G256 (4,25 bits por peso), calibracion AWQ; KV cache en `asym3` y q8 KV mencionados en la model card |
| Idiomas soportados | no disponible |
| Licencia | MIT (empaquetado hipfire); pesos subyacentes sujetos a las licencias de Qwen y z-lab |
| Formato de pesos | `.mq4` (target, formato hipfire HFQ4-G256) y `.hfq` (draft DFlash) |

## Arquitectura y entrenamiento

El modelo objetivo emplea una arquitectura hibrida que combina capas DeltaNet (atencion lineal con estado recurrente) y capas de atencion completa, manteniendo el mismo esquema del Qwen3.5-27B con `arch_id=5`. Segun la model card, el refresco a Qwen3.6 supone un reentrenamiento con datos mas recientes pero sin cambios arquitectonicos, de modo que las rutas de kernel del motor no requieren modificaciones. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica principal del paquete es la integracion del draft DFlash para decodificacion especulativa. Se trata de una red auxiliar hibrida de 1,73B de parametros (combinacion de `sliding_attention` y `full_attention`) con `block_size=16`, extraccion de estados ocultos del objetivo en las capas `[1, 16, 31, 46, 61]` y `mask_token_id=248070`. El draft propone bloques de B tokens candidatos que el modelo objetivo verifica en una sola pasada forward por lotes; el ratio de aceptacion τ (tokens confirmados por ciclo) determina la aceleracion real. La version MQ4 del target fue recalibrada con AWQ sobre un tronco mi300x v3, con una reduccion de KLD del 42 % a q8 KV respecto a la cuantizacion previa segun la medicion del modelo hermano Qwen3.5-27B.

## Capacidades

- Generacion de texto y decodificacion autorregresiva en el motor hipfire.
- Razonamiento y generacion de codigo, con aceleracion especulativa especialmente efectiva en prompts de codigo (τ tipico de 4-5).
- Decodificacion especulativa mediante el draft DFlash emparejado, activada por defecto cuando ambos ficheros estan presentes en `~/.hipfire/models/`.
- Soporte de cuantizacion agresiva a 4,25 bits por peso con calibracion AWQ para preservar calidad.
- Ejecucion nativa en GPUs AMD RDNA1-RDNA4 mediante backend HIP, sin Python en la ruta critica.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, function calling, modo thinking, vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en estacion de trabajo AMD: el modelo puede generar funciones y parches en local sobre una RX 7900 XTX, alcanzando 185 tok/s con el draft DFlash activo en prompts de codigo, lo que lo hace util para autocompletado interactivo sin depender de la nube.
- Prototipado de agentes en hardware consumer: al ejecutarse en un unico binario Rust con instalacion via script, permite montar bucles de agente multi-paso en maquinas con GPU AMD de gama alta sin infraestructura CUDA.
- Evaluacion de modelos de 27B en entornos con restricciones de VRAM: con 14,0 GB de pesos y 16 GB de VRAM minima, encaja en tarjetas de 16-24 GB, lo que facilita pruebas de calidad en laboratorios con hardware modesto.
- Generacion de prosa y documentacion tecnica: aunque el ratio de aceptacion del draft baja en prosa (τ de 1,30), el modo autorregresivo a 44 tok/s sigue siendo suficiente para redaccion asistida por lotes.
- Despliegue de inference offline en entornos air-gapped: el flujo `hipfire pull` + `hipfire run` permite operar sin conexion una vez descargados los ficheros, util en entornos con requisitos de confidencialidad.
- Benchmarking de decodificacion especulativa: el par target+draft sirve como banco de pruebas reproducible para medir aceptacion τ y throughput en distintos generos (codigo, prosa, instruct) sobre GPUs RDNA.
- Sustitucion directa de Qwen3.5-27B en pipelines existentes de hipfire: al compartir arquitectura y rutas de kernel, el refresco no exige cambios de runtime ni de cliente.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son mediciones de throughput del autor sobre una RX 7900 XTX (gfx1100) con KV `asym3` y decodificacion greedy en estado estacionario. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Decodificacion autorregresiva (sin draft) | ~44 tok/s |
| Decodificacion con draft DFlash en codigo | hasta 185 tok/s |
| Tamano del target | 14,0 GB |
| Tamano del draft | 0,92 GB |
| VRAM minima | 16 GB |

Comparativa del draft DFlash (refresco de 2026-04-27 frente a la conversion previa del 24 de abril), sobre el target `qwen3.6-27b.mq4`:

| Genero | tok/s (antiguo → nuevo) | τ (antiguo → nuevo) |
|---|---|---|
| Codigo (fibonacci) | 101,13 → 105,32 | 4,40 → 4,64 |
| Prosa (imperio romano) | 41,82 → 46,45 | 1,06 → 1,30 |
| Instruct (sky blue) | 85,13 ↔ 84,06 | 3,50 ↔ 3,44 |

## Requisitos de hardware

- VRAM estimada: 16 GB minimos para el target `qwen3.6-27b.mq4` (14,0 GB de pesos); el draft anade 0,92 GB.
- GPU recomendadas: AMD RDNA1-RDNA4; el autor reporta mediciones en RX 7900 XTX (gfx1100). GPUs NVIDIA no estan soportadas por el motor hipfire segun la informacion disponible.
- Cabe en GPU consumer: si, en tarjetas AMD con al menos 16 GB de VRAM.
- Opciones de despliegue: exclusivamente el motor hipfire (Rust + HIP), instalable mediante script en Linux con ROCm 6 o superior. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 44 tok/s en autorregresivo y hasta 185 tok/s con draft en codigo sobre 7900 XTX; en prosa el throughput con draft ronda los 46 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hipfire-models/qwen3.6-27b | 27B (nominal) | no disponible | MIT (empaquetado) | Hugging Face, motor hipfire | Cuantizado HFQ4-G256, draft DFlash incluido |
| Qwen/Qwen3.5-27B | 27B (nominal) | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que deriva el refresco; misma arquitectura |
| z-lab/Qwen3.6-27B-DFlash | 1,73B (draft) | no disponible | no disponible en la informacion | Hugging Face | Draft de decodificacion especulativa, origen del `.hfq` |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El motor hipfire solo soporta GPUs AMD RDNA1-RDNA4; no hay soporte para NVIDIA ni para otros backends en la informacion disponible.
- El draft DFlash solo acelera a su target emparejado: no debe combinarse el draft de 3.6 con el target de 3.5-27B ni al contrario, ya que vocabulario y proyecciones de estado oculto difieren entre refrescos.
- El fichero del draft no debe renombrarse (`qwen36-27b-dflash-mq4.hfq`); el motor lo descubre por nombre de fichero.
- La aceleracion especulativa es muy dependiente del genero: τ de 4-5 en codigo frente a τ de 1,30 en prosa, lo que reduce drasticamente la ganancia en texto libre.
- La cuantizacion a 4,25 bits por peso introduce perdida de calidad respecto a los pesos originales; la calibracion AWQ mitiga el efecto pero no lo elimina.
- La licencia MIT cubre solo el empaquetado hipfire; los pesos subyacentes heredan las condiciones de Qwen y z-lab, que deben consultarse para uso comercial.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar cobertura multilingue o ventanas largas en produccion.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hipfire-models/qwen3.6-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Draft DFlash original: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Repositorio del motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Script de instalacion: https://raw.githubusercontent.com/Kaden-Schutt/hipfire/master/scripts/install.sh

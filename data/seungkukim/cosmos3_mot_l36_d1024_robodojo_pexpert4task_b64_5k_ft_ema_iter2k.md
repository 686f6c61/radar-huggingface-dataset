# seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter2k

## Resumen

`cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter2k` es un checkpoint de politica de accion (action policy) para control robotico en bucle cerrado, construido sobre el modelo de mundo de video Cosmos3-Nano. Lo publica el usuario `seungkukim` dentro del ecosistema `cosmos-framework` y combina un modelo de video con un ActionDiT externo que recibe condicionamiento unidireccional video-a-accion bajo un calendario de difusion compartido. El resultado es un modelo que predice acciones motoras a partir de observaciones visuales, no un modelo de lenguaje.

El modelo parte del checkpoint `Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema`, del que reutiliza el ActionDiT preentrenado en lugar de reinicializarlo. El ajuste fino se realiza sobre un subconjunto de cuatro tareas del benchmark RoboDojo (96 episodios, 42.131 fotogramas) y este repositorio contiene el checkpoint intermedio del paso 2.000 de una tirada de 5.000 pasos. Los pesos almacenados son los de la media movil exponencial (EMA), convertidos a bf16.

La relevancia es acotada y muy especializada: se trata de un artefacto de investigacion para robótica con manipulacion visual, no de un modelo de proposito general. El repositorio no incluye pesos en formato estandar de inferencia (safetensors o GGUF) sino un checkpoint `torch.distributed.checkpoint` de un solo rango, y requiere el servidor de politicas de `cosmos-framework` y un VAE de Wan2.2 para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo de video Cosmos3-Nano (transformer de difusion) con ActionDiT externo y condicionamiento unidireccional video-a-accion |
| Parametros totales | no disponible (la nomenclatura del checkpoint indica `l36_d1024`: 36 capas y dimension 1024, sin recuento total publicado) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas documentadas) |
| Licencia | no disponible |
| Formato de pesos | `torch.distributed.checkpoint` (DCP) de un solo rango: `model/.metadata` y `model/__0_0.distcp`, claves `net.*`, bf16 |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de mundo de video de la familia Cosmos3-Nano con un Diffusion Transformer de acciones (ActionDiT) separado. El condicionamiento es unidireccional: el modelo de video informa al ActionDiT, y ambos comparten un calendario de difusion comun. El checkpoint base se entreno desde cero sobre RoboDojo Sim (LeRobot v3.0) durante 60.000 pasos; este ajuste fino carga el ActionDiT preentrenado en lugar de reinicializarlo, omitiendo solo las claves `net_ema.` del checkpoint de origen.

El ajuste fino usa el dataset `seungkukim/robodojo-pexpert-4task-lerobot-v3.0`, con 96 episodios y 42.131 fotogramas repartidos en 4 de las 35 tareas de RoboDojo. Tras el holdout fijo de validacion de un episodio que aplica el cargador, quedan 95 episodios y 38.422 ventanas de muestra. La configuracion es batch global 64 (2 GPU H200, 32 por GPU, acumulacion de gradiente 1), 5.000 pasos (8,33 epocas), tasa de aprendizaje 5e-5 con multiplicador de 5x sobre el ActionDiT, 500 pasos de warmup y decaimiento lineal hasta cero en el paso 5.000. Este repositorio corresponde al paso 2.000. No se documentan tecnicas como RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Prediccion de acciones motoras para control robotico en bucle cerrado a partir de observaciones visuales.
- Modelado de mundo de video: representacion generativa del entorno para condicionar la politica de accion.
- Condicionamiento video-a-accion mediante ActionDiT con calendario de difusion compartido.
- Especializacion en cuatro tareas concretas del benchmark RoboDojo, no en robotica general.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Investigacion en politicas visomotoras: usar el checkpoint como referencia intermedia (paso 2.000) para estudiar la evolucion del entrenamiento frente al checkpoint final de 5.000 pasos.
- Reproduccion de experimentos de ajuste fino: la configuracion incluida (`config.yaml`) y los hashes (`SHA256SUMS`) permiten replicar la tirada sobre el mismo subconjunto de tareas.
- Evaluacion comparativa de checkpoints: comparar este `iter2k` con el `iter1k` y con el modelo base de 60.000 pasos para medir el efecto del ajuste fino por etapas.
- Control de manipulacion en simulacion: desplegar el servidor de politicas de `cosmos-framework` con este checkpoint para ejecutar las cuatro tareas RoboDojo sobre las que se entreno.
- Estudio de condicionamiento video-a-accion: analizar como el modelo de mundo de video modula las predicciones del ActionDiT en tareas de contacto y precision.
- Base para nuevos ajustes finos: al conservar el ActionDiT preentrenado, sirve como punto de partida para extender el entrenamiento a otras tareas de RoboDojo.
- Docencia y divulgacion: ejemplo reproducible de arquitectura de modelo de mundo aplicado a robotica con pesos bf16 y configuracion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se realizo en 2 GPU H200 con batch global 64; ese es el requisito documentado de la tirada, no necesariamente el de inferencia.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; por el entorno de entrenamiento, se presupone hardware de clase H200 o superior, sin confirmacion.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: servidor de politicas de `cosmos-framework` con `--checkpoint-path <dir del repo> --config-file config.yaml`; requiere un VAE local de Wan2.2 (`Wan2.2_VAE.pth` de `Wan-AI/Wan2.2-TI2V-5B`).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`iter2k`) | no disponible (`l36_d1024`) | no disponible | sin benchmarks publicados | no disponible | DCP bf16, 0 descargas |
| `seungkukim/..._iter1k` | misma familia | no disponible | sin benchmarks publicados | no disponible | DCP bf16 |
| `Myungkyu/..._b64_60k_scratch_ema` | misma familia | no disponible | sin benchmarks publicados | no disponible | DCP bf16 |
| `Myungkyu/..._b64_60k_scratch_cps_ema` | misma familia | no disponible | sin benchmarks publicados | no disponible | DCP bf16 |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas de otras familias para una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado solo sobre 4 de las 35 tareas de RoboDojo; la generalizacion a otras tareas no esta demostrada.
- Dataset pequeno: 96 episodios y 42.131 fotogramas, con 38.422 ventanas efectivas tras el holdout.
- Checkpoint intermedio (paso 2.000 de 5.000); no es el modelo final de la tirada.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- Formato de pesos no estandar (DCP de un solo rango) y dependencia del servidor de `cosmos-framework` y de un VAE externo de Wan2.2.
- Repositorio de 0,0 GB y 0 descargas: artefacto de investigacion sin validacion por la comunidad.
- Sin informacion sobre sesgos, alucinacion, idiomas ni restricciones adicionales de uso en produccion.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto, codigo o razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter2k
- Checkpoint hermano (paso 1.000): https://huggingface.co/seungkukim/cosmos3_mot_l36_d1024_robodojo_pexpert4task_b64_5k_ft_ema_iter1k
- Modelo base (60.000 pasos, scratch EMA): https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_ema
- Variante CPS del modelo base: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_b64_60k_scratch_cps_ema
- Dataset de ajuste fino: https://huggingface.co/datasets/seungkukim/robodojo-pexpert-4task-lerobot-v3.0
- VAE requerido (Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B

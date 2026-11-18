# KW2012/openthai2.0-qwen3.8-27b-ninfer

## Resumen

OpenThai 2.0 · NInfer (groupwise-int) es un artefacto de inferencia empaquetado para el motor NInfer, derivado del modelo `iapp/openthai2.0-qwen3.8-27b`, un fine-tune en tailandés de `Qwen/Qwen3.8-27B`. Lo publica el usuario KW2012 en Hugging Face y su proposito no es ofrecer un checkpoint entrenable, sino un binario de pesos cuantizados (`openthai2_0_qwen3_8_27b.ninfer`, 20 GB) listo para ejecutarse sobre GPUs Tesla V100 (arquitectura CUDA sm_70) mediante el motor `geoffwatts/ninfer-v100`.

El modelo subyacente pertenece a la familia Qwen3.8-27B, con una arquitectura hibrida registrada como GDN (gated delta network) combinada con Multi-Token Prediction (MTP) y capacidades de vision. El artefacto conserva el contrato de 1.199 tensores del checkpoint bf16 fusionado original y emplea cuantizacion de tipo `groupwise-int`, una tecnica de cuantizacion por grupos que reduce el peso a 20,4 GB manteniendo la compatibilidad con el motor.

Su relevancia es acotada pero concreta: permite desplegar un modelo de 27B en hardware V100, que carece de soporte nativo para los formatos modernos de cuantizacion (por ejemplo, FP8) y para kernels de atencion de ultima generacion. Es un ejemplo de empaquetado especifico para un motor y una GPU, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (gated delta network) + MTP + vision, segun la arquitectura registrada Qwen3.8-27B |
| Parametros totales | 27B (nominal, segun el nombre del modelo base); no se detalla el desglose exacto |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `groupwise-int` (cuantizacion entera por grupos); no se especifica el numero de bits |
| Idiomas soportados | Tailandes (fine-tune principal); el resto de idiomas heredados de Qwen3.8-27B no se detalla |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto propietario `.ninfer` (20.444.306.535 bytes); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base `iapp/openthai2.0-qwen3.8-27b` es un fine-tune en tailandes de Qwen3.8-27B, cuya arquitectura registrada en el motor NInfer se describe como hibrida GDN con MTP y vision. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune tailandes.

El artefacto de KW2012 no entrena nada: convierte el checkpoint bf16 fusionado (`50b2272a58bf`, con todos los shards verificados por SHA) a un formato legible por NInfer mediante `tools/convert/openthai2_0/convert.py`, una subclase del conversor registrado `qwen3_8_27b`. La conversion respeta el contrato de 1.199 tensores de origen con 0 discrepancias de forma y tipo, y la verificacion a nivel de lector confirma que los 1.190 objetos del artefacto se recorren correctamente. Ademas, se referencia un modelo draft (`z-lab/Qwen3.8-27B-DFlash2`, commit fijado) para decodificacion especulativa, y se mantiene la plantilla de chat oficial de Qwen3.8 con hash identico.

## Capacidades

- Generacion de texto y razonamiento conversacional en tailandes, heredado del fine-tune OpenThai 2.0.
- Capacidades multilingues heredadas de Qwen3.8-27B (no se detalla la lista de idiomas).
- Vision: la arquitectura registrada incluye soporte de vision, aunque el artefacto no documenta explicitamente como se expone.
- Multi-Token Prediction (MTP) y decodificacion especulativa mediante el draft DFlash2 referenciado.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo thinking: no documentado.

## Casos de uso

- Despliegue en infraestructura V100 existente: organizaciones con Tesla V100 en produccion pueden servir un modelo de 27B en tailandes sin migrar a GPUs mas recientes, usando el motor NInfer con soporte sm_70.
- Asistentes conversacionales en tailandes: el fine-tune OpenThai 2.0 esta orientado al idioma tailandes y la plantilla de chat oficial permite conversaciones multi-turno con el frontend registrado del motor.
- Inferencia con decodificacion especulativa: el artefacto referencia un draft DFlash2 fijado, lo que permite acelerar la generacion en escenarios de baja latencia.
- Procesamiento de documentos con vision: si se expone el encoder visual de la arquitectura Qwen3.8, podria emplearse para extraccion de informacion de imagenes, aunque no esta documentado en el artefacto.
- Evaluacion comparativa de motores de inferencia: sirve como caso de prueba para medir el rendimiento de NInfer frente a vLLM o llama.cpp en hardware V100.
- Reproducibilidad de conversiones: el informe de conversion y la verificacion SHA permiten auditar el proceso de empaquetado en pipelines de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa 20,4 GB en disco; se requiere al menos esa cantidad de VRAM mas overhead de activaciones y KV cache (no cuantificado en la model card).
- GPU objetivo: Tesla V100 (CUDA sm_70), unica arquitectura soportada por `geoffwatts/ninfer-v100`.
- GPU recomendadas: V100 en cualquiera de sus variantes (16 GB o 32 GB); con 16 GB el artefacto de 20,4 GB no cabe completo, por lo que se necesita V100 de 32 GB o sharding no documentado.
- Consumer GPU: no compatible de forma nativa, ya que el motor esta limitado a sm_70.
- Opciones de despliegue: exclusivamente el CLI de NInfer (`ninfer.cli --artifact ... --device v100:0`), con la version del repositorio que registre `openthai2.0-qwen3.8-27b` en el dispatch de targets o una build local con la linea de registro indicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / motor | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai 2.0 NInfer (este) | 27B | no disponible | Apache-2.0 | `.ninfer` / NInfer V100 | Hugging Face, 0 descargas |
| iapp/openthai2.0-qwen3.8-27b | 27B | no disponible | Apache-2.0 | bf16 (safetensors presumiblemente) | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | safetensors | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El artefacto solo funciona con el motor NInfer compilado para sm_70; no es portable a otras GPUs ni a frameworks estandar como vLLM, TGI o llama.cpp.
- La cuantizacion `groupwise-int` puede degradar la calidad respecto al checkpoint bf16 original; no se documenta la perdida de precision.
- El modelo esta especializado en tailandes; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- Sesgos: no documentados.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de los proyectos upstream (iapp/openthai2.0 y geoffwatts/ninfer-v100) antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay evidencia de validacion por terceros.
- La fecha de creacion indicada (2026-11-18) es futura respecto a la mayoria de referencias, lo que conviene tener en cuenta al evaluar su vigencia.

## Enlaces

- Hugging Face: https://huggingface.co/KW2012/openthai2.0-qwen3.8-27b-ninfer
- Modelo base: https://huggingface.co/iapp/openthai2.0-qwen3.8-27b
- Motor NInfer V100: https://github.com/geoffwatts/ninfer-v100
- Modelo draft referenciado: `z-lab/Qwen3.8-27B-DFlash2` (commit `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`)

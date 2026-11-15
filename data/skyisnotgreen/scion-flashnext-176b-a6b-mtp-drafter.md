# SkyIsNotGreen/Scion-FlashNext-176B-A6B-mtp-drafter

## Resumen

Scion-FlashNext-176B-A6B-mtp-drafter es un cabezal de decodificación especulativa (draft head) de aproximadamente 0,89 GB asociado al modelo Scion-FlashNext-176B-A6B, la versión ternaria de 2 bits de Qwen3.8-Flash-Next. Lo publica el usuario SkyIsNotGreen y no es un drafter entrenado desde cero: es el propio bloque MTP (multi-token prediction) nativo que Qwen incluyó en el checkpoint BF16 del modelo original y que el conversor de llama.cpp descartó (el flag `supports_mtp_export` está a `false`), por lo que nunca llegó a los GGUF publicados. Este repositorio lo recupera y lo empaqueta en el formato del motor Strata.

El modelo resuelve un problema concreto de despliegue: acelerar la inferencia del modelo grande mediante decodificación especulativa sin alterar la distribución de salida. Al estar entrenado por Qwen contra el mismo cuerpo del modelo, el cabezal transfiere a plena potencia tras la ternarización, con una aceptación de borradores ponderada del 0,741 medida sobre diez prompts mixtos greedy de 256 tokens. Es relevante porque habilita servir un modelo de 176B parámetros totales (6B activos, MoE) en tarjetas de consumo, ya que los packs nativos IQ requieren el carril MTP (`--spec` >= 2) en el motor Strata.

El artefacto no es un modelo autónomo: es un sidecar de velocidad que solo funciona con el motor Strata y con el modelo base correspondiente. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP nativo (atención, indexer, hyper-connections, 512 expertos enrutados) en formato Strata; no es un transformer denso independiente |
| Parametros totales | 2.607.150.848 (~2,6B) según safetensors del repo |
| Parametros activos | no disponible (el modelo base es MoE con 6B activos, pero el drafter no expone este dato) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `--max-context 8192`) |
| Tipos de cuantizacion | Q2_0 round-to-nearest para expertos enrutados; BF16 para tensores densos |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (0,889 GB, `Scion-FlashNext-176B-A6B-mtp-drafter.gguf`) |

## Arquitectura y entrenamiento

El drafter no es un modelo entrenado: es el bloque MTP nativo de Qwen3.8-Flash-Next, extraído del checkpoint original `Qwen/Qwen3.8-Flash-Next` en la revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540` mediante peticiones HTTP por rangos de bytes (5,21 GB de los 360 GB del checkpoint, distribuidos en 131 shards). Los 31 tensores `mtp.*` se verificaron individualmente contra SHA256 y el manifiesto con shard, rango de bytes y hash por tensor se incluye en `mtp-manifest.json`. No hubo entrenamiento, destilación ni ejecución de modelos: la procedencia es el propio checkpoint.

El empaquetado aplica cuantización Q2_0 round-to-nearest a los expertos enrutados (misma rejilla que los expertos del cuerpo, de modo que los kernels VNNI de CPU y los kernels de GPU de Strata lo sirven sin cambios) y mantiene BF16 en los tensores densos. El informe de reconstrucción por tensor se publica como `mtp-q2_0.gguf.report.json`. La innovación clave es que, al haber sido entrenado el cabezal por Qwen contra este mismo cuerpo, la ternarización preservó la geometría oculta lo suficiente como para que el cabezal nativo transfiera sin un pase de ajuste. El archivo lleva la capa MTP completa (atención, indexer, hyper-connections, 512 expertos enrutados) en el layout de Strata; el carril `draft-mtp-sidecar` del fork de llama.cpp usa una forma distinta (fc-head) y no carga este archivo.

## Capacidades

- Decodificación especulativa: genera borradores de tokens que el verificador contrasta contra la distribución del modelo objetivo, acelerando la decodificación sin cambiar las salidas (salvo raros empates cercanos en verificación por lotes).
- Aceptación de borradores medida: 0,741 ponderada (1310/1769) en 10 prompts mixtos greedy de 256 tokens, con rango por petición de 0,640 a 0,810; 0,62-0,72 por petición en 30 generaciones largas reales con temperatura 0,6.
- Habilitación de packs nativos IQ: en Strata, los packs nativos requieren el carril MTP (`--spec` >= 2), por lo que este cabezal es simultáneamente opción de velocidad y requisito para servir el modelo ternario de 176B en tarjetas de consumo.
- Integración con el motor Strata: requiere conversión previa con `tools/mtp_rt.py` a runtime `mtp/rt`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües propias: es un componente de inferencia, no un modelo generativo autónomo.
- Idioma: únicamente inglés (heredado del modelo base).

## Casos de uso

- Aceleración de inferencia del modelo base en producción: se usa como sidecar en Strata con `--spec 4 --spec-min-p 0.5` para reducir el coste por token en despliegues del 176B ternario, con una aceptación del 74% que se traduce en menos pasos de verificación efectivos.
- Servicio del modelo ternario en GPUs de consumo: los packs nativos IQ exigen el carril MTP, así que este cabezal es condición necesaria para arrancar el 176B en configuraciones con dos RX 7900 XT y Q6_K.
- Generación larga interactiva: con aceptación de 0,62-0,72 por petición en generaciones largas reales a temperatura 0,6, es adecuado para asistentes de texto que necesitan decodificación sostenida sin degradar la calidad.
- Evaluación comparativa de motores: sirve para medir el impacto real de la decodificación especulativa nativa frente a drafters entrenados (por ejemplo, el Scion-35B, que requirió 3.088 ventanas de autodestilación para alcanzar 67-83% de aceptación).
- Investigación sobre MTP y decodificación especulativa: al publicarse el manifiesto con rangos de bytes y hashes, permite reproducir la extracción del bloque MTP desde el checkpoint original y estudiar su transferencia tras cuantización ternaria.
- Pruebas de humo de rendimiento en hardware AMD: el ejemplo de despliegue documenta 52-78 tok/s de decodificación y 116-135 tok/s de prefill con prompts de ~450 tokens en dos RX 7900 XT, útil como referencia para validar configuraciones equivalentes.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---|
| Aceptación de borradores (ponderada, 10 prompts mixtos greedy, 256 tok) | 0,741 (1310/1769); por petición 0,640-0,810 |
| Aceptación de borradores (30 generaciones largas reales, T 0,6) | 0,62-0,72 por petición |
| Decodificación durante esas generaciones (2x RX 7900 XT, Q6_K, `--spec 4`) | 52-78 tok/s (prueba de humo 21-58 tok/s según prompt y longitud) |
| Prefill, prompts de ~450 tokens (misma configuración) | 116-135 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el drafter: ~0,89 GB en disco; el ejemplo de despliegue reserva `--vram-reserve-mib 3072` para el conjunto del servicio en Strata.
- GPU recomendadas: el autor documenta 2x RX 7900 XT con Q6_K y `--spec 4`; no se especifican otras configuraciones.
- Cabe en GPU de consumo: sí, según el ejemplo con dos RX 7900 XT; el drafter en sí ocupa menos de 1 GB.
- Opciones de despliegue: exclusivamente el motor Strata (`strata --serve`), previa conversión con `python tools/mtp_rt.py`. No es compatible con llama.cpp estándar ni con el carril `draft-mtp-sidecar` del fork.
- Latencia y throughput: decodificación de 52-78 tok/s y prefill de 116-135 tok/s en la configuración documentada (2x RX 7900 XT, Q6_K, `--spec 4`, prompts de ~450 tokens).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scion-FlashNext-176B-A6B-mtp-drafter | ~2,6B (bloque MTP) | no disponible | 0,741 ponderada | Apache-2.0 | Hugging Face, requiere Strata |
| Scion-35B-A3B-mtp-drafter | no disponible | no disponible | 67-83% | no disponible | Hugging Face, drafter autodestilado con 3.088 ventanas |
| Drafters entrenados genéricos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con drafters entrenados convencionales no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no genera texto, razona ni responde peticiones por sí mismo; solo produce borradores para el verificador.
- Dependencia total del motor Strata: no carga en llama.cpp estándar ni en el carril `draft-mtp-sidecar` del fork, lo que limita la portabilidad y ata el despliegue a un motor propietario del proyecto.
- Requiere el modelo base Scion-FlashNext-176B-A6B y una conversión previa con `tools/mtp_rt.py`; sin ese paso no hay runtime utilizable.
- Riesgo de alucinación: no aplica de forma directa, pero la verificación por lotes puede producir raras inversiones en empates cercanos, alterando marginalmente la salida frente a la decodificación sin especulación.
- Idioma: solo inglés; no hay soporte multilingüe propio.
- Licencia Apache-2.0 heredada del modelo base, con el NOTICE de la cadena de cuantización descrito en la model card del base; conviene revisar ese NOTICE antes de uso comercial.
- Estado WIP (work in progress) declarado por el autor, con 0 descargas y 0 likes en el momento de la ficha: madurez y soporte comunitario aún no demostrados.
- Sin datos de benchmarks estándar ni de comportamiento en otros idiomas o tareas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B-mtp-drafter
- Modelo base: https://huggingface.co/SkyIsNotGreen/Scion-FlashNext-176B-A6B
- Drafter relacionado (35B): https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B-mtp-drafter
- Motor Strata: https://github.com/sky-is-green/strata
- Checkpoint original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`)

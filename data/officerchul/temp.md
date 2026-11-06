# OfficerChul/temp

## Resumen

`OfficerChul/temp` es un checkpoint de política robótica construido sobre el modelo `nvidia/Cosmos-Reason2-2B` y adaptado mediante la arquitectura Rep4Act (asymmetric MMDiT con flow matching) para ejecutar una tarea muy concreta: mover una taza o una jarra hacia la izquierda y hacia la derecha en el entorno DROID. No es un modelo de lenguaje conversacional, sino un modelo de acción visomotora que consume tres vistas de cámara más propiocepción y emite bloques de acción de 16 pasos. El autor es `OfficerChul` y el repositorio se publicó el 2 de noviembre de 2026.

El modelo parte de un MMDiT asimétrico preentrenado con cuatro fuentes de datos durante 100.000 pasos, sobre el que se realizó una adaptación con 279 demostraciones DROID y 9.530 anclas fijas del 20 %. La adaptación entrenó únicamente 1.000 actualizaciones del optimizador con flow matching, BF16, microbatch 32 y acumulación 2 (batch efectivo 64), a una tasa de aprendizaje de 3e-5 con schedule coseno y 50 pasos de calentamiento. El resultado es un artefacto de inferencia de unos 4.850 millones de parámetros totales, de los cuales 3.015.332.992 fueron entrenables.

Es relevante ahora porque ejemplifica la tendencia a reutilizar modelos fundacionales de razonamiento visual (Cosmos-Reason2-2B) como codificadores congelados para políticas robóticas de bajo nivel, con un coste de adaptación muy reducido. No obstante, el propio autor advierte de que no se ha realizado ninguna evaluación de rollout retenido ni de éxito en robot real, por lo que debe tratarse como un experimento reproducible y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT asimétrico (Rep4Act) con flow matching y codificador visual congelado Cosmos-Reason2-2B |
| Parametros totales | 4.849.997.952 (según model card); 4.852.142.113 según safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (16 bloques de acción y 6 bloques de contexto de articulaciones) |
| Tipos de cuantizacion | no disponible (checkpoint en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en |
| Licencia | no disponible (los términos del modelo upstream `nvidia/Cosmos-Reason2-2B` siguen aplicando) |
| Formato de pesos | safetensors (`model.safetensors`), más `config.resolved.yaml`, `provenance.json`, `dataset_statistics.json` y `export_manifest.json` |

## Arquitectura y entrenamiento

La arquitectura es un MMDiT asimétrico (multi-modal diffusion transformer) adaptado por Rep4Act, que combina un codificador visual congelado (Cosmos-Reason2-2B, revisión `9ce19a195e423419c349abfc86fd07178b230561`, capa 16) con un tronco de difusión/flow matching que genera bloques de acción. La política emite 16 bloques de acción y utiliza 6 bloques de contexto de articulaciones, con normalización de contexto activada y timestep de contexto dinámico. Las entradas son tres vistas de cámara más propiocepción; los tokens de instrucción de Cosmos (solo texto) entran en el attention pooling y en el AdaLN.

El entrenamiento de adaptación se realizó exclusivamente con flow matching (FM), 1.000 actualizaciones del optimizador, precisión BF16, microbatch 32, acumulación 2 (batch efectivo 64), learning rate 3e-5, schedule coseno y 50 pasos de warmup. Se usaron 279 demostraciones DROID y 9.530 anclas fijas del 20 % con semilla 0. La pérdida final de acción fue 0,07021632045507431. El checkpoint es una exportación de inferencia: excluye estado del optimizador y del RNG, por lo que no es reanudable para entrenamiento exacto. El manifiesto `export_manifest.json` recoge los digests SHA-256 de los ficheros.

## Capacidades

- Generación de acciones robóticas de bajo nivel para una tarea concreta: mover una taza o jarra a izquierda y derecha en DROID.
- Consumo de tres vistas de cámara simultáneas más propiocepción como entrada multimodal.
- Condicionamiento por instrucciones de texto a través de los tokens de Cosmos en attention pooling y AdaLN.
- Política de flow matching con 16 bloques de acción y 6 bloques de contexto de articulaciones.
- Integración con el código de evaluación de Rep4Act (`rep4act.eval.checkpoint.load_evaluation_checkpoint`).
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; es un modelo de política, no un LLM de propósito general.
- Capacidad multilingüe: solo inglés (`en`).

## Casos de uso

- Reproducción de experimentos de investigación en manipulación robótica: cargar el checkpoint con Rep4Act y evaluar la política en el entorno DROID para estudiar la transferencia desde un codificador visual fundacional a una política de acción.
- Estudio de adaptación de bajo coste: servir como referencia de cuánto rendimiento se obtiene con solo 1.000 actualizaciones sobre 279 demostraciones, útil para comparar metodologías de fine-tuning en robótica.
- Base para ablaciones controladas: al conservar `config.resolved.yaml` y `provenance.json`, permite replicar la configuración y variar hiperparámetros (learning rate, número de bloques, normalización de contexto) en estudios comparativos.
- Generación de datos sintéticos de trayectorias: usar la política para proponer movimientos de izquierda/derecha sobre objetos tipo taza en simulación, que luego se filtran antes de incorporarlos a un dataset mayor.
- Docencia y divulgación técnica: ejemplo didáctico de pipeline completo (codificador congelado, MMDiT, flow matching, exportación de inferencia con digests) para cursos de robótica aprendida.
- Integración como componente en un stack de evaluación offline: al ser un artefacto de inferencia autocontenido (sin necesidad de dataset ni feature-cache), se puede empaquetar en contenedores para pruebas de regresión de código de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la pérdida final de acción de entrenamiento (0,0702) y advierte explícitamente de que no se ha realizado ninguna evaluación de rollout retenido ni de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 9,7 GB (4.850 M de parámetros × 2 bytes), más el codificador Cosmos-Reason2-2B congelado y los buffers de activación; se recomienda un mínimo de 24 GB de VRAM para trabajar con margen.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización, que no está documentada.
- Opciones de despliegue: el flujo previsto es el código de Rep4Act (commit `92a9ba9c8626ad0faafe230270682998ef3bc4ea`) mediante `load_evaluation_checkpoint`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OfficerChul/temp | 4.850 M (3.015 M entrenables) | no disponible | Política DROID izquierda/derecha | no disponible | Hugging Face, 0 descargas |
| nvidia/Cosmos-Reason2-2B (upstream) | ~2.000 M | no disponible | Razonamiento visual fundacional | términos upstream | Hugging Face (NVIDIA) |
| Políticas tipo diffusion policy / ACT sobre DROID | decenas de millones | no disponible | Manipulación DROID | variable | repositorios de investigación |

La comparación directa con alternativas no está disponible en la información proporcionada: no se aportan métricas de éxito ni de rollout de este checkpoint frente a otras políticas DROID, y el modelo upstream es un codificador de razonamiento, no una política de acción, por lo que la comparación es estructural y no de rendimiento.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay rollout retenido ni prueba en robot real; el único indicador es la pérdida de entrenamiento (0,0702), insuficiente para inferir éxito en tarea.
- Alcance extremadamente estrecho: la política está adaptada solo a mover tazas/jarras a izquierda y derecha en DROID; no generaliza a otras tareas ni objetos sin reentrenamiento.
- Sesgos de dataset: 279 demostraciones DROID y 9.530 anclas fijas del 20 % con semilla 0 implican un sesgo hacia las condiciones, objetos y posiciones presentes en esas demostraciones.
- Idioma: solo inglés; las instrucciones de texto en otros idiomas no están soportadas.
- Licencia no disponible: no se asigna licencia nueva y siguen aplicando los términos del modelo upstream `nvidia/Cosmos-Reason2-2B`; el uso comercial queda sujeto a dichos términos, que deben verificarse antes de cualquier despliegue.
- Checkpoint no reanudable: es una exportación de inferencia sin estado de optimizador ni RNG; no sirve para reanudar entrenamiento exacto.
- Dependencia de código y rutas: la configuración resuelta conserva rutas de entrenamiento originales y requiere el código de Rep4Act en el commit indicado; la reutilización del loader de dataset exige configurar rutas locales.
- Riesgo de alucinación de acciones: como política generativa con flow matching, puede producir trayectorias plausibles pero incorrectas físicamente; requiere límites de seguridad y validación en el robot.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OfficerChul/temp
- Modelo base: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Código Rep4Act: https://github.com/SNU-PI/Rep4Act
- Commit de referencia: `92a9ba9c8626ad0faafe230270682998ef3bc4ea`
- Revisión del codificador upstream: `9ce19a195e423419c349abfc86fd07178b230561`
- Papers, blogs o demos adicionales: no disponible

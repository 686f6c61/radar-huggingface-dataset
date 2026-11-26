# graval/edgeshield

## Resumen

EdgeShield es un framework de ciberseguridad orientado a dispositivos edge que emplea una arquitectura desacoplada de dos flujos (*dual-stream*) basada en modelos de lenguaje pequenos (SLM). Lo desarrollan Gauravkumar Raval y Tejaskumar Bhatt (GLS University) y su objetivo es interceptar movimiento lateral (MITRE TA0008) y ransomware en fase de pre-cifrado antes de que se produzca la destruccion criptografica de los datos. El repositorio de Hugging Face distribuye los pesos de los dos flujos del sistema, no un unico modelo generativo.

El primer flujo, denominado LSA (*Log Sequence Analyzer*), usa como backbone `microsoft/deberta-v3-small` con 44 M de parametros, atencion de ventana deslizante (K=3) y perdida contrastiva supervisada, y se aplica a logs de autenticacion y secuencias de comandos del host. El segundo flujo, BPD (*Behavioral Pattern Detector*), es un transformer compacto con una cabeza de puntuacion de amenazas por atencion orientada a indicadores precoces de ransomware, evasion de defensas (T1562.001) y variaciones rapidas de entropia de ficheros. Ambos se publican en PyTorch FP32 y en ONNX INT8.

La relevancia actual reside en su enfoque de despliegue: la version cuantizada INT8 en ONNX esta pensada para CPU de borde con menos de 50 MB de RAM y una latencia declarada de 15,30 ms, y un motor de *gating* selectivo por niveles que filtra telemetria benigna en 48,55 µs descartando el 94,75 % de las muestras sin perder ataques (100 % de paso). Es un proyecto de investigacion aceptado en IEEE TEMSCON-ASPAC 2026, con cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-stream: Stream A (LSA) basado en DeBERTa-v3-small con atencion de ventana deslizante (K=3); Stream B (BPD) transformer compacto con cabeza de atencion para puntuacion de amenazas; motor de gating selectivo por niveles |
| Parametros totales | 44 M en Stream A (LSA); Stream B no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea secuencias de 128 tokens) |
| Tipos de cuantizacion | FP32 (PyTorch) e INT8 (ONNX, con aceleracion AVX-VNNI) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (INT8 cuantizado) |

## Arquitectura y entrenamiento

EdgeShield no es un unico modelo sino un sistema de dos clasificadores especializados mas un motor de filtrado. El flujo LSA parte de `microsoft/deberta-v3-small` (44 M de parametros) y anade atencion de ventana deslizante con K=3 y una funcion de perdida contrastiva supervisada, orientada a separar secuencias de autenticacion y comandos de host que reflejan movimiento lateral sigiloso. El flujo BPD es un transformer compacto con una cabeza de atencion que produce una puntuacion de amenaza, disenado para capturar indicadores precursores de ransomware, tecnicas de evasion de defensas y cambios bruscos de entropia en ficheros (indicador habitual de cifrado inminente).

El tercer componente es un motor de gating selectivo de dos etapas: una via rapida con lista de permitidos (*allowlist*) y un triaje basado en la entropia de Shannon de los ficheros. Segun la model card, este motor opera en 48,55 µs, descarta el 94,75 % de la telemetria benigna y deja pasar el 100 % de los ataques (0 fallos de descarte). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta de los datasets, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa, ya que el uso previsto es clasificacion y no generacion.

## Capacidades

- Clasificacion de texto especializada en seguridad: deteccion de movimiento lateral a partir de logs de autenticacion y secuencias de comandos del host (Stream A).
- Deteccion de indicadores precursores de ransomware y de evasion de defensas (T1562.001) mediante patrones de comportamiento y variaciones de entropia (Stream B).
- Puntuacion de amenazas mediante cabeza de atencion dedicada en el flujo BPD.
- Filtrado de telemetria de alto rendimiento con gating selectivo por niveles (allowlist + triaje de entropia).
- Inferencia en CPU de borde gracias a la cuantizacion INT8 en ONNX Runtime con soporte AVX-VNNI.
- Capacidad multilingue: limitada a ingles.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni uso como agente multi-paso; el pipeline declarado es `text-classification`.

## Casos de uso

- Deteccion de movimiento lateral en redes corporativas: el flujo LSA procesa logs de autenticacion y secuencias de comandos para identificar desplazamientos laterales sigilosos (MITRE TA0008) alli donde un SIEM tradicional generaria exceso de alertas.
- Defensa pre-cifrado frente a ransomware en endpoints: el flujo BPD monitoriza indicadores precursores y variaciones de entropia de ficheros para alertar antes de que comience el cifrado, lo que permite aislar el host a tiempo.
- Filtrado de telemetria en el borde: el motor de gating descarta el 94,75 % del trafico benigno en 48,55 µs, lo que reduce el ancho de banda y la carga de procesamiento enviada a la nube o al SOC central.
- Despliegue en dispositivos con recursos limitados: con menos de 50 MB de RAM y 15,30 ms de latencia en INT8, encaja en gateways industriales, portatiles de campo o equipos de sucursal sin GPU.
- Enriquecimiento de pipelines de deteccion existentes: los logits de clasificacion pueden incorporarse como senal adicional en reglas de correlacion o en un motor de respuesta automatizada (SOAR).
- Investigacion en seguridad con modelos pequenos: sirve como base reproducible (pesos FP32 e INT8, licencia Apache 2.0) para experimentar con clasificacion de amenazas en entornos academicos y de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas operativas del motor de gating y del despliegue INT8:

| Metrica | Valor declarado |
|---|---|
| Latencia del motor de gating | 48,55 µs |
| Tasa de descarte de telemetria benigna | 94,75 % |
| Tasa de paso de ataques | 100 % (0 fallos de descarte) |
| Latencia de inferencia INT8 en CPU de borde | 15,30 ms |
| RAM en despliegue INT8 | < 50 MB |

No se aportan cifras de precision, recall, F1, AUC ni comparaciones con otros detectores.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo de despliegue principal; la version INT8 ONNX esta pensada para CPU de borde con menos de 50 MB de RAM.
- GPU recomendadas: no se especifican; el diseno prioriza CPU. Cualquier GPU moderna podria ejecutar los pesos FP32, pero no hay datos de rendimiento.
- Compatibilidad con GPU de consumo: los pesos FP32 del backbone de 44 M caben con holgura en cualquier GPU de consumo actual, aunque no se documenta el rendimiento en ese escenario.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (documentado en la model card); los pesos PyTorch FP32 permiten otros runtimes, pero no se detallan.
- Latencia y throughput: 15,30 ms por inferencia INT8 en CPU de borde y 48,55 µs por decision de gating, segun el autor. No se publica throughput agregado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros detectores de ransomware o movimiento lateral, ni con modelos de clasificacion de seguridad de tamano comparable.

## Limitaciones y advertencias

- Proyecto muy reciente y sin validacion externa: cero descargas y cero likes en el momento de la consulta; los resultados citados proceden unicamente del autor.
- Solo soporta ingles, lo que limita su uso en entornos con logs o documentacion en otros idiomas.
- El alcance es especifico: clasificacion de seguridad (movimiento lateral y ransomware); no es un modelo de proposito general ni un generador de texto.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez frente a adversarios que manipulen los logs o la entropia de ficheros.
- Las metricas de deteccion (100 % de paso de ataques) no van acompanadas de datos de falsos positivos ni de conjuntos de validacion independientes; conviene tratarlas con cautela en produccion.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantia ni soporte; el autor no detalla obligaciones adicionales.
- El estado de publicacion es "aceptado y en prensa" (IEEE TEMSCON-ASPAC 2026) y el articulo extendido esta "en preparacion"; los pesos pueden cambiar entre revisiones (`v1.0-temscon` y `v2.0-int8-quantized`).

## Enlaces

- Hugging Face: https://huggingface.co/graval/edgeshield
- GitHub: https://github.com/graval/edgeshield
- Kaggle Models: https://www.kaggle.com/models/gauravr1/edgeshield-models
- Cita IEEE TEMSCON-ASPAC 2026 (Raval y Bhatt): incluida en la model card, sin URL de paper disponible

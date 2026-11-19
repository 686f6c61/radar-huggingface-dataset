# Renesas/SmolVLA-450M

## Resumen

SmolVLA-450M es un modelo compacto de visión-lenguaje-acción (VLA) para control de robots desarrollado originalmente por Hugging Face (LeRobot) y empaquetado aquí por Renesas para su ejecución en el NPU Synopsys ARC NPX6-48K del SoC Renesas R-Car X5H. El modelo recibe tres imágenes de cámara, el estado del robot y un prompt de texto, y produce un bloque de 50 acciones futuras. La arquitectura combina un codificador visual SigLIP de 12 capas con un modelo de lenguaje SmolVLM2 y un "action expert" de 16 capas que aplica 10 pasos de denoising para muestrear la secuencia de acciones.

Este repositorio no contiene los pesos originales en formato estándar, sino un paquete runner (v0.1.0) que permite ejecutar el modelo cuantizado (W4/W8 en pesos, int8/int16 en activaciones) íntegramente en un clúster NPU de 12 slices del X5H, sin necesidad de PC. El resultado es una tasa de control de 15,4 Hz (65,0 ms por observación) con resultados bit-idénticos entre ejecuciones, lo que lo convierte en una referencia interesante para robótica embebida de bajo consumo con latencia determinista.

La relevancia actual radica en que demuestra que un VLA de 450M parámetros puede desplegarse en hardware automovilístico/industrial con NPU dedicado, manteniendo un ritmo de control adecuado para tareas manipulativas (SO-100). El paquete está atado a una versión concreta del sistema operativo (R-Car xOS v4.38) y a un layout de memoria específico, lo que limita su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: codificador visual SigLIP (12 capas) + prefijo SmolVLM2 + action expert (16 capas) con denoising |
| Parametros totales | 450M (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 198 tokens de prefijo (192 imagen + 5 prompt + 1 estado); ventana efectiva no especificada |
| Tipos de cuantizacion | Pesos W4 (GPTQ, solo MLP del action expert) y W8 (int8 per-channel); activaciones int8/int16 |
| Idiomas soportados | no disponible |
| Licencia | other / see-licenses-in-package (incluida en el paquete, no especificada en la model card) |
| Formato de pesos | Blobs residentes int8 / códigos W4 (~357 MB) empaquetados en un runner CPack STGZ (~316 MB) |
| Modelo base | lerobot/smolvla_base |
| Hardware objetivo | Renesas R-Car X5H (Ironhide) con NPU NPX6-48K, xOS v4.38 |
| Libreria | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA sigue un esquema de tres etapas: un codificador visual SigLIP de 12 capas procesa tres cámaras (480x640, padded a 512x512, 64 tokens por cámara); un prefijo basado en SmolVLM2 procesa los 198 tokens (192 de imagen + 5 de prompt + 1 de estado); y un action expert de 16 capas ejecuta 10 pasos de denoising para generar el chunk de 50 acciones. El modelo original (lerobot/smolvla_base) se distribuye desde LeRobot, pero en esta ficha no se dispone de detalles sobre el dataset de entrenamiento, número de tokens, composición ni si se aplicó RLHF/DPO.

La innovación técnica de este paquete es la implementación en NPU: el runner `npxrund` mantiene los pesos cuantizados residentes en memoria NPU, arranca el firmware para las 15 ejecuciones NPU por observación (3 visión, 2 prefijo, 10 expert) y ejecuta la glue en los núcleos Cortex-A. La cuantización es mixta: W8 per-channel para visión y prefijo, W4 GPTQ para las MLP del action expert (gate/up con una escala por tensor, down per-channel), W8 para la atención del action expert, con activaciones int8 e int16 en softmax y residual stream. El resultado es bit-idéntico entre ejecuciones, lo que sugiere un pipeline determinista sin aleatoriedad en la inferencia.

## Capacidades

- Control robótico visomotor: genera chunks de 50 acciones futuras a partir de tres imágenes de cámara, estado del robot y prompt textual.
- Percepción visual multi-cámara (3 vistas) mediante codificador SigLIP.
- Comprensión de instrucciones en lenguaje natural (prompt de texto) para condicionar la política de acciones.
- Ejecución determinista: resultados bit-idénticos entre ejecuciones, apto para validación y reproducibilidad.
- Inferencia embebida en NPU sin PC externo, con cliente Python de biblioteca estándar.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni thinking mode; el modelo es específico para VLA robótico.
- Capacidades multilingües: no disponible.

## Casos de uso

- Manipulación robótica con SO-100: el paquete incluye un episodio de prueba (svla_so100_ep40) con 16 observaciones y acciones de referencia FP32, útil para validar el despliegue en banco antes de integrarlo en un robot real.
- Control de brazos robóticos en lazo cerrado a 15,4 Hz: la latencia de 65,0 ms por observación permite políticas reactivas en tareas de pick-and-place o ensamblaje ligero, siempre que el robot tolere ese ritmo de control.
- Validación de hardware NPU en producción: el runner y `setup_npu.sh` permiten comprobar que una placa X5H con xOS v4.38 cumple el layout de memoria y que el NPU está libre antes de desplegar.
- Reproducibilidad de políticas VLA: la inferencia bit-idéntica facilita comparar acciones contra referencias FP32 (SNR y PASS/FAIL) en pipelines de CI para robótica.
- Robótica embebida de bajo consumo: al ejecutarse íntegramente en el NPU de un SoC automovilístico, evita GPU externa y reduce latencia de comunicación, adecuado para plataformas móviles o edge.
- Evaluación comparativa de cuantización: el paquete documenta W4/W8 y int8/int16 por etapa, lo que permite medir el impacto de la cuantización en la calidad de las acciones frente a la referencia FP32.
- Demostraciones en banco de pruebas: `run_demo.sh` con `--all` y `--loop 30` permite generar trazas de tiempo y validar estabilidad térmica/latencia del NPU.

## Benchmarks y rendimiento

Datos de la model card, medidos en placa X5H Ironhide, NPU 1066,7 MHz, DDR 8533 MT/s, R-Car xOS v4.38:

| Etapa | Tiempo |
|---|---|
| Codificación de imagen, 3 cámaras (480x640 → 512x512, 64 tokens cada una) | 29,9 ms |
| Prefill, 198 tokens (192 imagen + 5 prompt + 1 estado) | 6,33 ms |
| Muestreo de acciones, 10 pasos de denoising | 18,9 ms |
| Tiempo NPU (58,77 M ciclos / 1066,7 MHz) | 55,1 ms |
| Tiempo de placa por observación (mediana en caliente, 64,9-65,7 ms) | 65,0 ms |
| Tasa de control | 15,4 Hz |

| Grafo | Ejecuciones por observación | Ciclos | Tiempo por ejecución |
|---|---|---|---|
| Codificador visual, una cámara (SigLIP, 12 capas) | 3 | 10,63 M | 9,97 ms |
| Prefix A (SmolVLM2, primera mitad) | 1 | 3,54 M | 3,32 ms |
| Prefix B (segunda mitad) | 1 | 3,21 M | 3,01 ms |
| Action expert, un paso de denoising (16 capas) | 10 | 2,01 M | 1,89 ms |

El tiempo de placa (65,0 ms) incluye los 15 runs NPU vistos por el host (~59,4 ms desde kick hasta done, con overhead de kick/wait) más trabajo del host (puts de pesos y entradas 2,9 ms, preparación de imagen 0,6 ms, salida 0,3 ms, glue 1,3 ms). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; los datos son exclusivamente de latencia y rendimiento en NPU.

## Requisitos de hardware

- Placa Renesas R-Car X5H (Ironhide) con NPU NPX6-48K, imprescindible; no hay soporte para GPU convencional en este paquete.
- Sistema operativo R-Car xOS v4.38 (Linux 6.12.80) con layout de memoria reservada 0x64000000 + 0x27000000 y 0x8E400000 + 0x31C00000; otras versiones (p. ej. xOS v4.40) no están soportadas.
- Acceso root en la placa, `python3` sin paquetes extra, unos 0,6 GB de disco libre y NPU no ocupado por otro programa.
- Memoria NPU: pesos residentes ~357 MB en blobs int8/W4; el paquete instalado ocupa ~416 MB y el autoextraíble ~316 MB.
- Despliegue: runner `npxrund` (aarch64, compilado con `-DSVLA_CHUNK`) + firmware NPU (l2.bin + l1_0..l1_11.bin) + cliente Python de biblioteca estándar; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- VRAM de GPU: no aplica; el modelo no se ejecuta en GPU en este paquete.
- Latencia: 65,0 ms por observación (15,4 Hz); throughput equivalente a ~15 observaciones por segundo en un clúster NPU de 12 slices.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Renesas/SmolVLA-450M | 450M | 198 tokens de prefijo | 15,4 Hz en NPU X5H (65,0 ms/obs) | other (see-licenses-in-package) | Paquete runner para X5H v0.1.0 |
| lerobot/smolvla_base | 450M (base) | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otros VLA compactos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de calidad ni de comparaciones directas con otros VLA en la información proporcionada; la comparativa se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- Acoplamiento fuerte al hardware: solo funciona en R-Car X5H con NPU NPX6-48K y xOS v4.38; placas con otro layout de memoria (p. ej. xOS v4.40) son rechazadas por `setup_npu.sh` y `run_demo.sh`.
- Licencia "other" con términos en `LICENSES/` del paquete; no se especifica en la model card si permite uso comercial, por lo que debe revisarse antes de producción.
- El paquete no incluye tokenizer, decodificación de imagen ni interfaz de robot en las cifras de latencia; esos costes deben añadirse en un despliegue real.
- Requiere root y NPU libre; el runner usa todo el NPU y escribe solo en las regiones reservadas, pero no está pensado para coexistir con otras cargas NPU.
- Inferencia determinista y bit-idéntica: no hay muestreo aleatorio documentado, lo que puede limitar diversidad de políticas si se esperaba exploración.
- Idiomas soportados no disponibles; el prompt textual se limita a 5 tokens en el prefijo, lo que restringe instrucciones largas o multilingües.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un modelo de acciones, el riesgo se traduce en acciones incorrectas ante entradas fuera de distribución.
- Contexto muy corto (198 tokens) y chunk de 50 acciones; no apto para planificación de largo horizonte sin un componente externo.
- Modelo base lerobot/smolvla_base: no se detallan datos de entrenamiento, composición del dataset ni alineamiento, lo que dificulta evaluar sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/Renesas/SmolVLA-450M
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Repositorio LeRobot: no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Blog o demo de Renesas: no disponible en la información proporcionada

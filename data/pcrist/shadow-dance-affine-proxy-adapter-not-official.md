# pcrist/shadow-dance-affine-proxy-adapter-not-official

## Resumen

Shadow Dance affine deployment adapter (proxy experimental) es un adaptador afín supervisado desarrollado por el equipo SELTZER (autor: pcrist) como sustituto transparente del decoder público de NVIDIA GEAR-SONIC para el robot Unitree G1. No es el fine-tune oficial SuperSONIC, sino una calibración afín por mínimos cuadrados que se anexa al decoder público, manteniendo el contrato de entrada-salida `obs_dict [1,994] -> action [1,29]`. El objetivo es proporcionar un fallback sin cuenta ni dependencia de Isaac Lab/PPO mientras no se dispone de cómputo licenciado.

El modelo se distribuye como dos archivos ONNX: un encoder público sin cambios (`model_encoder.onnx`) y un decoder derivado con el adaptador añadido (`shadow-dance-affine-proxy-decoder.onnx`). Incluye también metadatos de entrenamiento, selección y validación, así como 16 informes de pruebas. El repositorio tiene un tamaño de 0.1 GB y está etiquetado como experimental, con licencia "other" (NVIDIA Open Model License). Está orientado exclusivamente a simulación con MuJoCo 3.x y ONNX Runtime en CPU, sin ninguna reclamación de seguridad para despliegue en robot real.

La relevancia de este modelo radica en su transparencia metodológica: documenta el control de fugas (leakage control), fija hashes SHA-256 de los pesos, y presenta resultados completos sobre ocho movimientos de prueba frescos, con una mezcla de mejoras y degradaciones. Es un ejemplo de cómo un adaptador ligero puede ajustar un decoder existente sin reentrenamiento completo, aunque con limitaciones claras frente al fine-tune oficial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador afín supervisado sobre decoder ONNX de NVIDIA GEAR-SONIC; encoder ONNX público sin cambios |
| Parametros totales | no disponible (el adaptador es una calibración afín por articulación; tamaño del repo 0.1 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada `obs_dict [1,994]` y salida `action [1,29]`) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantización declarada) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | NVIDIA Open Model License (licencia "other" en HuggingFace) |
| Formato de pesos | ONNX (safetensors no aplicable; archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo es un adaptador afín por articulación, calibrado mediante mínimos cuadrados supervisados. Se anexa al decoder público de NVIDIA GEAR-SONIC (revisión `9c0ff22b4ffec27c5392e8e284eb2f2df7a5b4e2`, SHA-256 del decoder padre `c7241a123eaa36b5d64bad19540efde93cac1ad443bd4572fd12ca99898118ed`). El entrenamiento utilizó doce movimientos "gancho" de entrenamiento (3,046 frames) que proporcionaron acciones stock y objetivos articulares autorales. La ganancia y el sesgo se acotaron y luego se redujeron un 90% hacia la transformación identidad (`alpha=0.10`). La selección se realizó sobre cuatro movimientos de validación separados, y el adaptador se congeló con hash antes de abrir los ocho movimientos de prueba finales (cuatro dips y cuatro ganchos). No hubo reajuste posterior a las pruebas.

El proceso incluye control de fugas explícito: los datos de entrenamiento y validación son independientes de los de prueba, y se documentan hashes SHA-256 del decoder exportado (`caf8b40ca7de141498b3d1160654a2531ce45c149f6768d6cc0a2474bd5add27`). La validación ONNX pasa el checker y cinco sondas de runtime en CPU son finitas, con error numérico cero en el grafo afín añadido. No se utilizó Isaac Lab/PPO ni WBT-Bench, y el modelo no debe reportarse como puntuación oficial del desafío.

## Capacidades

- Sustituye al decoder stock en el bucle de despliegue público de NVIDIA GEAR-SONIC, manteniendo el contrato `obs_dict [1,994] -> action [1,29]`.
- Genera acciones de control articular para el robot Unitree G1 en simulación MuJoCo 3.x.
- Incluye un encoder público sin cambios (`model_encoder.onnx`) para la referencia G1.
- Proporciona un adaptador afín con ganancia y sesgo acotados y reducidos hacia la identidad (alpha=0.10).
- Documenta completamente el proceso de entrenamiento, selección y prueba con hashes criptográficos.
- No soporta tool calling, agentes, visión ni procesamiento de lenguaje; es un componente de robótica de bajo nivel.

## Casos de uso

- **Investigación en control de robots humanoides**: el adaptador permite experimentar con modificaciones ligeras del decoder GEAR-SONIC sin reentrenar el modelo completo, ideal para estudios de calibración afín en simulación.
- **Validación de pipelines de despliegue**: al mantener el contrato de entrada-salida, sirve como reemplazo directo del decoder stock en entornos de prueba automatizados con MuJoCo y ONNX Runtime.
- **Auditoría de reproducibilidad**: gracias a los hashes SHA-256 y los informes de validación, es útil como caso de estudio sobre control de fugas y transparencia en experimentos de robótica.
- **Benchmark de proxies ligeros**: permite comparar el rendimiento de un adaptador afín frente al decoder original en métricas como MPJPE local/global, error de raíz y RMSE articular.
- **Entrenamiento de estudiantes en robótica**: al ser un ejemplo completo con datos de entrenamiento, selección y prueba, sirve como material didáctico para entender calibración supervisada y evaluación determinista.
- **Pruebas de integración ONNX**: el adaptador puede usarse para verificar la compatibilidad de herramientas ONNX Runtime con grafos modificados, dado que el checker pasa y las sondas son finitas.

## Benchmarks y rendimiento

Los resultados presentados son de un proxy determinista en MuJoCo 3.x con CPU ONNX Runtime, una ejecución por movimiento, sobre ocho movimientos frescos (cuatro dips y cuatro ganchos). No modela la robustez de Isaac/WBT-Bench ni la evaluación de tres semillas requerida.

| Metrica (macro sobre 8 movimientos) | Stock | Adapter | Cambio |
|---|---:|---:|---:|
| Upright completion | 8/8 | 8/8 | sin cambio |
| Local MPJPE | 29.229 mm | 29.448 mm | +0.75% (peor) |
| Global MPJPE | 85.427 mm | 84.810 mm | -0.72% |
| Root-position error | 77.687 mm | 76.706 mm | -1.26% |
| Joint RMSE | 9.544 deg | 8.628 deg | -9.60% |

El resultado es mixto: la precisión articular mejora materialmente, los errores global y de raíz mejoran ligeramente, y el MPJPE local empeora modestamente. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime (se mencionan "five CPU Runtime probes"); no se especifica VRAM.
- Simulación con MuJoCo 3.x; no se indica necesidad de GPU.
- Tamaño del repositorio: 0.1 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en hardware modesto.
- Opciones de despliegue: ONNX Runtime, MuJoCo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicable a modelos de robótica).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores afines para decoders de robótica). El modelo se posiciona como un proxy experimental frente al fine-tune oficial SuperSONIC de NVIDIA, pero no se proporcionan datos de este último. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es el fine-tune oficial**: no fue entrenado con Isaac Lab/PPO ni evaluado con WBT-Bench; no debe reportarse como puntuación oficial del desafío.
- **Solo simulación**: no se hace ninguna reclamación de seguridad para despliegue en robot real; el Unitree G1 puede caerse o dañar hardware si se usa un controlador no validado.
- **Resultados mixtos**: el MPJPE local empeora un 0.75% mientras que el joint RMSE mejora un 9.60%; no es una mejora uniforme.
- **Licencia restrictiva**: distribuido bajo la NVIDIA Open Model License; requiere atribución y cumplimiento de sus términos.
- **Sin evaluación de robustez**: el proxy no modela la robustez de Isaac/WBT-Bench ni la evaluación de tres semillas, por lo que los resultados pueden no generalizar.
- **Dependencia de datos autorales**: los movimientos de entrenamiento son "gancho" y pueden no cubrir todo el espacio de comportamientos del robot.
- **Sin soporte de lenguaje ni visión**: es un modelo de robótica puro, no un LLM multimodal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pcrist/shadow-dance-affine-proxy-adapter-not-official
- Dataset y generador (GitHub releases): https://github.com/cristpierce/shadow-dance/releases/tag/shadow-dance-v2.0.0
- Modelo padre NVIDIA GEAR-SONIC (referencia en la model card, sin URL directa en la información proporcionada)

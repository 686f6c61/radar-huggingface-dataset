# mlboydaisuke/Fast-Neural-Style-OpenVINO

## Resumen
Fast-Neural-Style-OpenVINO es una conversión y empaquetado del modelo de transferencia de estilo neuronal `style_mosaic_fp16`, derivado de `litert-community/Fast-Neural-Style-LiteRT`, que a su vez procede del ejemplo de `pytorch/examples`. El autor, mlboydaisuke, lo publica en formato ONNX (opset 17, generado con tf2onnx 1.17.0), en IR de OpenVINO con pesos fp32 y como blob precompilado para la NPU integrada de Intel. No es un modelo de lenguaje ni un transformer generativo: es una red convolucional de imagen a imagen (image-to-image) que aplica un estilo artístico fijo, en este caso un mosaico, sobre una imagen de entrada.

La relevancia del artefacto es de ingeniería de despliegue, no de modelado. El autor documenta mediciones reproducibles por procesador y runtime, y demuestra que el blob precompilado se ejecuta en la NPU de un Core Ultra 9 386H en 7,08 ms por inferencia (entrada numpy a salida numpy), frente a 33,59 ms en CPU con ONNX Runtime. Eso convierte al repositorio en una referencia práctica para quien quiera llevar una red de estilo a la NPU de un PC con IA sin pasar por el proceso de compilación en cada arranque.

El modelo es muy pequeño (el ONNX pesa 6.945.235 bytes, el binario de pesos de OpenVINO 6.717.452 bytes y el blob de NPU 5.857.409 bytes) y su licencia es BSD-3-Clause, la misma del modelo base. El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, y no incluye datos de idiomas porque la tarea no es lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de transferencia de estilo (fast neural style); arquitectura interna no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | fp16 en el modelo base (`style_mosaic_fp16`); exportaciones en ONNX, IR de OpenVINO con pesos fp32 y blob precompilado para NPU Intel |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`) y blob de NPU Intel (`.blob`) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por el nombre del modelo base y por la referencia a `pytorch/examples`, se trata de una red de transferencia de estilo neuronal rápida, es decir, una red convolucional que aprende una transformación directa imagen a imagen para un estilo concreto (en este caso, mosaico), en lugar de optimizar por imagen como en la transferencia de estilo clásica. El autor no aporta número de parámetros, tokens de entrenamiento ni detalles de la función de pérdida.

La innovación del repositorio es el pipeline de conversión y despliegue: TFLite a ONNX con tf2onnx 1.17.0 y opset 17, ONNX a IR de OpenVINO, y compilación anticipada del blob para la NPU con OpenVINO 2026.4.1, driver de NPU de Intel 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292). El autor advierte de que el blob puede ser rechazado por `import_model` en otra versión de driver u OpenVINO, en cuyo caso hay que compilar el IR en la máquina destino. La validación de salidas se hizo contra la salida de CPU en fp32 con ONNX Runtime (coseno ≥ 0,99, sin NaN ni Inf) y contra el `.tflite` original (coseno ≥ 0,9999 en todas las salidas).

## Capacidades
- Transferencia de estilo de imagen a imagen: aplica el estilo mosaico del modelo base a una imagen de entrada y devuelve la imagen estilizada.
- Ejecución en NPU Intel mediante blob precompilado, con carga prácticamente instantánea (0,01 s de load según la tabla del autor).
- Ejecución en GPU integrada Intel, GPU dedicada NVIDIA (mediante el execution provider CUDA de ONNX Runtime) y CPU, con el mismo archivo ONNX.
- Compatibilidad con ONNX Runtime mediante el execution provider de OpenVINO, registrando el dispositivo NPU por metadatos (`ov_device == "NPU"`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de una sola pasada.
- No hay capacidades multilingües ni modo thinking; el pipeline declarado en Hugging Face es `image-to-image`.

## Casos de uso
- Filtro de estilo en tiempo real en aplicaciones de escritorio: con 7,08 ms por inferencia en la NPU de un Core Ultra 9 386H, el modelo puede aplicar el filtro mosaico a un flujo de vídeo a más de 100 fps teóricos si el resto del pipeline (decodificación, preprocesado) no es el cuello de botella.
- Procesado por lotes de imágenes en un PC con IA: el modelo se ejecuta en la NPU y libera CPU y GPU para otras tareas del pipeline, lo que resulta útil en herramientas de edición fotográfica que ya usan la GPU para otras operaciones.
- Prototipado de pipelines de estilo sobre OpenVINO: sirve como ejemplo mínimo y verificable para validar la cadena ONNX, IR y blob de NPU antes de portar modelos mayores.
- Aplicación móvil o de borde con Snapdragon: el autor reporta 7,61 ms en la NPU de un Snapdragon X2 Elite y 6,62 ms en la NPU de un Galaxy S26 mediante Qualcomm AI Hub, lo que permite integrar el filtro en apps sin depender de la nube.
- Generación de miniaturas o previsualizaciones estilizadas en servidores sin GPU: en CPU con ONNX Runtime tarda 33,59 ms por imagen, suficiente para trabajos por lotes no interactivos.
- Docencia y experimentación con transferencia de estilo: el repositorio incluye scripts y registros crudos en el repositorio `john-rocky/windows-zoo`, lo que facilita reproducir las mediciones y comparar runtimes.

## Benchmarks y rendimiento
El autor publica tiempos por procesador y runtime, no métricas de calidad perceptual (FID, SSIM, LPIPS) ni benchmarks estándar de visión.

| Procesador | Runtime | Archivo | ms por ejecución | Carga (s) | Comprobación de salida |
|---|---|---|---|---|---|
| NPU Intel AI Boost | OpenVINO 2026.4.1 | blob (`import_model`) | 7,08 | 0,01 | PASS (cos ≥ 0,9999) |
| NPU Intel AI Boost | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 7,37 | 5,86 | PASS (cos ≥ 0,9999) |
| GPU integrada Intel | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 3,92 | 1,14 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no incluida) | 4,75 | 1,26 | PASS (cos ≥ 0,9999) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 6,10 | 1,22 | PASS (cos ≥ 0,9999) |
| CPU Core Ultra 9 386H | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 33,59 | 0,13 | referencia |
| NPU Snapdragon X2 Elite | Qualcomm AI Hub, QNN precompilado | `.onnx` compilado por AI Hub | 7,61 | 0,39 | no comparado |
| NPU Snapdragon X2 Elite | ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 10,72 (2 capas en CPU) | 2,17 | no comparado |
| NPU Galaxy S26 | Qualcomm AI Hub, QNN precompilado | `.onnx` compilado por AI Hub | 6,62 | 0,16 | no comparado |

Las mediciones se hicieron en un MSI Stealth 16 AI+ (Core Ultra 9 386H, RTX 5080 Laptop a 95 W, Windows 11 build 26200.9711, con corriente) entre el 6 y el 7 de noviembre de 2026, con 5 ejecuciones de calentamiento y mediana de 30 ejecuciones cronometradas. No se han publicado resultados de benchmarks de calidad de imagen en la información disponible.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Despliegue en NPU Intel | Rendimiento reportado |
|---|---|---|---|---|
| mlboydaisuke/Fast-Neural-Style-OpenVINO | ONNX, IR de OpenVINO, blob de NPU | BSD-3-Clause | Sí, blob precompilado | 7,08 ms en NPU Intel |
| litert-community/Fast-Neural-Style-LiteRT (modelo base) | TFLite / LiteRT | BSD-3-Clause | No (orientado a LiteRT) | no disponible en la información proporcionada |
| Otros modelos de transferencia de estilo rápida en OpenVINO | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otras implementaciones de transferencia de estilo en la información proporcionada.

## Limitaciones y advertencias
- El modelo aplica un único estilo fijo (mosaico); no permite seleccionar ni combinar estilos sin reentrenar o cambiar de modelo.
- No hay métricas de calidad perceptual publicadas (FID, SSIM, LPIPS), solo comprobaciones de equivalencia numérica frente al modelo base.
- El blob de NPU está compilado para OpenVINO 2026.4.1 y el driver 32.0.100.4841; en otra versión puede fallar `import_model` y hay que recompilar el IR.
- El rendimiento en NPU depende del hardware concreto; las cifras de Snapdragon y Galaxy S26 provienen de trabajos de perfilado de Qualcomm AI Hub y no se compararon contra la salida de referencia.
- La model card no documenta sesgos, datos de entrenamiento ni posibles artefactos visuales del estilo; la evaluación cualitativa queda a cargo del usuario.
- La licencia BSD-3-Clause permite uso comercial, pero obliga a conservar el aviso de copyright y la cláusula de exención de responsabilidad; conviene verificar la cadena de licencias hasta `pytorch/examples`.
- El repositorio no incluye el archivo fp16 de ONNX usado en la medición con CUDA, solo el `.onnx` original.
- No es adecuado para tareas de texto, razonamiento, código ni agentes; su pipeline es exclusivamente `image-to-image`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/Fast-Neural-Style-OpenVINO
- Modelo base: https://huggingface.co/litert-community/Fast-Neural-Style-LiteRT
- Repositorio con scripts y registros de medición: https://github.com/john-rocky/windows-zoo
- Documentación de OpenVINO: https://docs.openvino.ai/
- OpenVINO Model Hub de Intel: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/models.html

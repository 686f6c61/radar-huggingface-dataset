# ipsilondev/lama-onnx

## Resumen

lama-onnx es una exportación a ONNX del modelo LaMa (Large Mask Inpainting) en su variante big-lama, publicada por el desarrollador ipsilondev para su uso en aplicaciones móviles de restauración fotográfica. El modelo resuelve tareas de inpainting de imagen a imagen: elimina arañazos, pliegues y polvo de fotografías rellenando las regiones enmascaradas de forma coherente con el resto de la imagen. Es relevante porque empaqueta un modelo de inpainting de referencia en un único fichero ONNX de 106 MB con pesos en fp16, pensado para ejecutarse con ONNX Runtime en dispositivos sin GPU dedicada.

La arquitectura subyacente es la red LaMa original de advimman/lama, exportada mediante `torch.onnx.export` desde el repositorio Carve/LaMa-ONNX (revisión `c3c0c9e468934d62e79c329e35d82dd09ff8c444`). El modelo trabaja con una resolución fija de 512x512 píxeles y no admite entradas de tamaño variable. El repositorio ocupa 0,1 GB y su licencia es Apache-2.0, heredada del modelo original.

La publicación tiene un interés práctico limitado para el ecosistema general de IA, pero resulta útil como referencia de conversión ONNX con precisión mixta (pesos fp16, cómputo fp32) para modelos que contienen operaciones trigonométricas y de rango que rompen las conversiones fp16 estándar. El autor documenta explícitamente el proceso y la verificación numérica frente al original fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LaMa (Large Mask Inpainting), red de inpainting con unidades de Fourier; exportada a ONNX (opset 17) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 512x512) |
| Tipos de cuantizacion | pesos fp16 con Cast a float32 (411 tensores); sin int8 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`lama_fp16.onnx`, 106.183.330 bytes) |

## Arquitectura y entrenamiento

LaMa es una red de inpainting diseñada para rellenar máscaras grandes mediante el uso de unidades de Fourier, que permiten propagar información de contexto a larga distancia dentro de la imagen sin depender exclusivamente de la convolución local. El modelo original big-lama fue entrenado por advimman y posteriormente exportado a ONNX por Carve-Photos. Esta ficha corresponde a una re-exportación derivada de `lama_fp32.onnx` (208 MB, opset 17) del repositorio Carve/LaMa-ONNX.

La innovación técnica documentada por el autor no está en el entrenamiento, sino en la conversión: las unidades de Fourier de LaMa contienen nodos `Range`, `Cos`, `Sin`, `Einsum`, `MatMul` y `Cast`, y tanto `onnxconverter_common.float16` como `onnxruntime.transformers.float16` generan grafos que ONNX Runtime rechaza por desajustes de tipo en `Cast` y por `Range` en fp16. La solución aplicada almacena cada inicializador float32 con al menos 256 elementos (411 tensores) como fp16 seguido de un nodo `Cast(to=float32)`, que ORT pliega al crear la sesión. El resultado reduce el fichero a la mitad mientras la aritmética permanece en fp32. No se documenta información sobre el dataset de entrenamiento original ni sobre el número de tokens o imágenes utilizadas.

## Capacidades

- Inpainting de imagen a imagen con resolución fija de 512x512 píxeles.
- Entrada `image` en formato `[batch, 3, 512, 512]` float32, RGB en rango 0-1.
- Entrada `mask` en formato `[batch, 1, 512, 512]` float32, donde 1 indica reparar y 0 conservar.
- Salida `output` en formato `[batch, 3, 512, 512]` float32, RGB en rango 0-255 (no 0-1).
- Reparación de arañazos, pliegues y polvo en fotografías escaneadas.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No soporta entradas de tamaño variable ni resolución distinta de 512x512.

## Casos de uso

- Restauración de fotografías escaneadas: el modelo recibe la imagen y una máscara que marca arañazos, pliegues o manchas de polvo, y devuelve la zona reparada con coherencia de textura. Es el caso de uso principal documentado, ya que la aplicación ReTint (`com.ipsilondev.retint`) lo utiliza para este fin.
- Digitalización de negativos y copias antiguas: el autor prevé su uso en Neg2Pic para eliminar defectos físicos del soporte fotográfico antes de la conversión final.
- Limpieza de lentes y sensores en imágenes: el modelo está previsto para LensClean, donde se usaría para eliminar motas y suciedad detectadas sobre la imagen.
- Preprocesado en pipelines de visión por computador: como paso previo a OCR o detección de objetos en documentos escaneados, rellenando zonas dañadas que confundirían a etapas posteriores.
- Aplicaciones móviles offline: al ser un único fichero ONNX de 106 MB ejecutable con ONNX Runtime en CPU, puede integrarse en apps que requieran procesamiento local sin conexión ni GPU.
- Referencia para conversión ONNX con precisión mixta: el script `convert_lama.py` y la técnica de pesos fp16 con Cast a fp32 sirven como plantilla para exportar otros modelos con operaciones trigonométricas que fallan en las conversiones fp16 convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR global, SSIM, FID) en la información disponible. El autor proporciona una verificación numérica de la conversión fp16 frente al original fp32:

| Metrica | Valor |
|---|---|
| PSNR mínimo (fp16 vs fp32, dentro de la máscara, escala 0-255) | 59,96 dB |
| PSNR medio (fp16 vs fp32, dentro de la máscara, escala 0-255) | 71,24 dB |
| Objetivo especificado | >= 35 dB |
| Imágenes de prueba | 10 imágenes 512x512 con máscaras sintéticas (líneas de 2-5 px y blobs) |
| Latencia en CPU de escritorio (ORT 1.24, 4 hilos) | 5,6 s (fp16) vs 4,5 s (fp32) por ventana de 512x512 |
| Creación de sesión | aproximadamente 33 s en la misma máquina |

No se ha medido la latencia en dispositivo móvil.

## Requisitos de hardware

- VRAM estimada: no aplica de forma estricta; el modelo está pensado para CPU. En GPU, el fichero ONNX ocupa 106 MB y los tensores intermedios a 512x512 son moderados, por lo que cabría en cualquier GPU con 2 GB o más.
- GPU recomendadas: no se especifican; el autor no ha medido rendimiento en GPU.
- Cabe en GPU de consumo: sí, por tamaño (cualquier RTX o equivalente), aunque no hay datos de latencia en GPU.
- Despliegue: ONNX Runtime (versión 1.24 usada en la verificación), con 4 hilos de CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 5,6 s por imagen de 512x512 en CPU de escritorio con 4 hilos (pesos fp16); 4,5 s con el original fp32. La creación de sesión tarda unos 33 s.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ipsilondev/lama-onnx | no disponible | 512x512 fija | ONNX fp16 (106 MB) | Apache-2.0 | Pesos fp16, cómputo fp32; verificado con PSNR >= 59,96 dB frente al fp32 |
| Carve/LaMa-ONNX | no disponible | 512x512 fija | ONNX fp32 (208 MB) | Apache-2.0 | Modelo base directo; sin reducción de tamaño |
| advimman/lama (big-lama) | no disponible | variable | PyTorch | Apache-2.0 | Modelo original; requiere entorno PyTorch |

No se dispone de datos de benchmarks comparativos con otras alternativas de inpainting en la información proporcionada.

## Limitaciones y advertencias

- Resolución fija de 512x512: no admite imágenes de otro tamaño sin redimensionado previo, lo que puede degradar detalles en fotografías de alta resolución.
- La salida está en escala 0-255, no 0-1; el autor advierte que ReTint comprueba en carga si el máximo supera 1,5 para dividir por 255. Un consumidor que asuma 0-1 obtendrá resultados incorrectos.
- No se ha medido la latencia en dispositivo móvil; los tiempos disponibles corresponden solo a CPU de escritorio.
- No se documentan sesgos del modelo original ni evaluación cualitativa más allá del PSNR de conversión.
- Riesgo de artefactos o alucinación visual en máscaras grandes o regiones con poca información de contexto; no se cuantifica en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo original; conviene verificar las condiciones de advimman/lama y Carve/LaMa-ONNX.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipsilondev/lama-onnx
- Modelo base en Hugging Face: https://huggingface.co/Carve/LaMa-ONNX
- Modelo original: https://huggingface.co/advimman/lama
- Repositorio del modelo original: https://github.com/advimman/lama
- Repositorio de exportación: https://github.com/Carve-Photos/lama

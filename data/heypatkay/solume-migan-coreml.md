# heypatkay/solume-migan-coreml

## Resumen

Solume-migan-coreml es una conversión a Core ML del modelo MI-GAN (Sargsyan et al., "MI-GAN: A Simple Baseline for Image Inpainting on Mobile Devices", ICCV 2023, Picsart AI Research), en su variante de 512 px entrenada sobre Places2. Lo publica el desarrollador heypatkay como artefacto de soporte para Solume, una aplicación de fotografía para macOS que lo utiliza para mostrar un relleno provisional mientras el pincel de eliminación se desplaza. No se trata, por tanto, de un modelo de propósito general, sino de un componente de inferencia local empaquetado para una app concreta.

El modelo resuelve la tarea de inpainting (image-to-image): recibe una imagen RGB de 512×512 y una máscara binaria de 512×512 e infiere el contenido ausente en la región enmascarada. La arquitectura subyacente es una GAN ligera diseñada explícitamente para dispositivos móviles, con un tamaño de pesos muy reducido (el binario de pesos en fp16 ocupa 13,95 MB), lo que la hace apta para ejecución en el dispositivo sin depender de servidores.

Su relevancia es acotada pero clara: demuestra un flujo reproducible de conversión ONNX a Core ML con verificación por SHA-256 y toolchain fijado, y ofrece un ejemplo práctico de inpainting de baja latencia en Apple silicon. El repo tiene un tamaño declarado de 0.0 GB, 9 descargas y 0 likes en el momento de la consulta, y la licencia es MIT heredada del proyecto original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN para inpainting (MI-GAN), convertida a Core ML ML Program en fp16 |
| Parametros totales | no disponible (pesos fp16 de 13.954.944 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512×512) |
| Tipos de cuantizacion | fp16 (única precisión publicada en este repo) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (Copyright 2024 Picsart AI Research, PAIR) |
| Formato de pesos | Core ML `.mlpackage` (`model.mlmodel` + `weight.bin`) |

## Arquitectura y entrenamiento

El modelo original MI-GAN se presenta como un baseline simple para inpainting en dispositivos móviles, con una GAN condicionada por máscara que opera sobre imágenes de 512×512. La conversión de este repositorio carga el grafo ONNX con onnx2torch, lo envuelve en un wrapper que acepta imagen y máscara en coma flotante y devuelve el resultado, lo traza y lo convierte con coremltools a un ML Program en fp16. No hay fine-tuning ni modificación de los pesos: el cambio es exclusivamente de formato y precisión, más una capa fina de entrada/salida.

Los pesos de partida son `migan.onnx` del repositorio `andraniksargsyan/migan`, revisión `406830d0fa60666da0071c342ad2fbc8f30c5c64`, con 29.546.882 bytes y SHA-256 `593eba0b7e04730f1b61c0a3cbca68d97d8d6a7ff5c6a44a7b9d7fcd880fc5ae`. El toolchain está fijado (Python 3.12, torch 2.15.0, coremltools 9.0, onnx 1.23.2, onnx2torch 1.5.15, numpy 2.5.4, macOS 27 sobre Apple silicon), de modo que dos conversiones producen archivos byte a byte idénticos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de Places2, ni si hubo RLHF o DPO (no aplica a este tipo de modelo).

## Capacidades

- Inpainting de imágenes de 512×512 píxeles: rellena la región indicada por la máscara con contenido sintetizado coherente con el contexto.
- Entrada de imagen en rango 0…255 con forma 1×3×512×512 y máscara 1×1×512×512 donde 255 significa "conservar".
- Salida determinista en rango 0…255 con forma de imagen completa.
- Ejecución local en el dispositivo mediante Core ML, sin llamadas a red.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: es un modelo puramente visual.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de objetos en una app de fotografía para macOS: Solume usa el modelo para mostrar un relleno provisional mientras el usuario mueve el pincel de eliminación, aprovechando la inferencia local y la latencia baja del ML Program en fp16.
- Restauración rápida de fotografías con zonas dañadas o con marcas: se genera una máscara sobre las áreas afectadas y el modelo sintetiza el contenido subyacente antes de un retoque manual fino.
- Limpieza de marcas de agua o anotaciones sobre imágenes propias: útil en flujos de preparación de material gráfico donde se requiere eliminar superposiciones sin salir del dispositivo.
- Prototipado de pipelines de inpainting en Apple silicon: el paquete Core ML permite integrar el modelo en apps Swift o en scripts de Python con coremltools para validar resultados antes de escalar a modelos mayores.
- Relleno de huecos en imágenes de producto o catálogo: se enmascaran recortes o elementos sobrantes y el modelo completa el fondo de forma coherente con Places2.
- Verificación de integridad en despliegues: el repo sirve como referencia de conversión reproducible con SHA-256 fijados, útil para equipos que necesitan artefactos deterministas y auditables en producción.
- Docencia y experimentación con GANs ligeras: el tamaño reducido de los pesos (13,95 MB) permite estudiar el comportamiento de MI-GAN en hardware de consumo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos en fp16 ocupan 13,95 MB y la entrada es de 512×512, por lo que el consumo es bajo y compatible con memoria unificada de Apple silicon.
- GPU recomendadas: no se especifican en la información disponible; el artefacto está orientado a ejecución en Apple silicon mediante Core ML (macOS 27 en el toolchain documentado).
- Compatibilidad con GPU de consumo: el formato Core ML limita el uso a hardware Apple; no se documenta soporte para GPU NVIDIA o AMD en este repositorio.
- Opciones de despliegue: Core ML (`.mlpackage`) en apps macOS/iOS; el modelo original está disponible en ONNX en el repositorio upstream, lo que permitiría otros runtimes, aunque no se documentan aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| solume-migan-coreml | GAN de inpainting (MI-GAN 512, Places2) | 512×512 + máscara | MIT | Core ML fp16 | HuggingFace (heypatkay) |
| andraniksargsyan/migan | GAN de inpainting (MI-GAN, upstream) | 512×512 + máscara | MIT | ONNX | HuggingFace (andraniksargsyan) |
| LaMa | GAN de inpainting de gran campo receptivo | resolución variable | Apache 2.0 (según versión) | PyTorch | Repositorios públicos |
| Stable Diffusion Inpainting | modelo de difusión | 512×512 o superior | CreativeML Open RAIL-M | safetensors | HuggingFace |

La comparación con LaMa y Stable Diffusion Inpainting se ofrece como referencia de categoría; no se dispone de datos de benchmarks en la información proporcionada para establecer diferencias cuantitativas de calidad o latencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en inpainting: no genera texto, no razona y no responde a instrucciones.
- Entrada fija de 512×512: imágenes de otra resolución requieren redimensionado previo, lo que puede degradar el resultado.
- Entrenado sobre Places2: el dominio de escenas puede no cubrir bien retratos, texto o ilustraciones, con riesgo de rellenos poco realistas fuera de distribución.
- Riesgo de artefactos y alucinación visual en regiones grandes o con estructura repetitiva; el resultado debe revisarse antes de publicar.
- Formato Core ML: no ejecutable directamente en Linux o Windows sin conversión adicional.
- Licencia MIT permite uso comercial, pero conviene conservar el aviso de copyright de Picsart AI Research (PAIR) y verificar la licencia del modelo base y del dataset Places2 para usos derivados.
- El repositorio declara tamaño 0.0 GB y un número muy bajo de descargas; no hay evidencia de validación por terceros ni de mantenimiento continuado.
- La app Solume instala los archivos solo si coinciden tamaño y SHA-256 con los fijados, lo que implica que cualquier modificación del paquete rompe la integración.

## Enlaces

- HuggingFace: https://huggingface.co/heypatkay/solume-migan-coreml
- Modelo base en HuggingFace: https://huggingface.co/andraniksargsyan/migan
- Paper MI-GAN (ICCV 2023): https://arxiv.org/abs/2302.07864
- Repositorio oficial MI-GAN (Picsart AI Research): https://github.com/Picsart-AI-Research/MI-GAN
- coremltools: https://github.com/apple/coremltools
- onnx2torch: https://github.com/ENOT-AutoDL/onnx2torch

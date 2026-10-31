# asterxlabs/asternet-vietnamese-ocr

## Resumen
AsterNet es un motor de reconocimiento óptico de caracteres (OCR) neuronal no autorregresivo, desarrollado por asterxlabs y especializado en tipografía vietnamita. Está diseñado para digitalizar documentos administrativos (CCCD, pasaportes, licencias), facturas financieras y capturas de escena desde dispositivos móviles. Su valor diferencial radica en ser extremadamente ligero (10,65 millones de parámetros y un checkpoint de 40,78 MB, un 70 % más pequeño que VietOCR) y rápido en CPU, sin necesidad de GPU.

En lugar de decodificación token a token, emplea una arquitectura de secuencia no autorregresiva con pérdida CTC, combinando un backbone de tipo MobileNetV3 invertido con Squeeze-and-Excitation, un LSTM bidireccional de dos capas, una fusión de autoatención multi-cabeza y un rescorer lingüístico neuro-simbólico (fonología y n-gramas). Incluye innovaciones específicas para el vietnamita, como un stem de filtrado paso-alto que preserva microacentos de 1-2 píxeles (ă, â, ơ, ư) y un motor de auto-polaridad por contraste para texto invertido.

La versión publicada (v1.0 Production) se distribuye bajo licencia MIT con pesos en PyTorch y ONNX, lo que lo hace idóneo para despliegues en edge, IoT y servidores de bajo coste. Reporta un 86,0 % de coincidencia exacta y un CER del 3,45 % en el benchmark nacional vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No autorregresiva end-to-end: HP-Stem + backbone Inverted Residual SE-ResNet (MobileNetV3) + BiLSTM 2x256 + autoatención multi-cabeza (4 cabezas) + cabeza CTC + rescorer neuro-simbólico |
| Parámetros totales | 10.649.106 (10,65 M) |
| Parámetros activos | no disponible (arquitectura no MoE; todos los parámetros se activan en inferencia) |
| Longitud de contexto | no disponible (procesa franjas de imagen de 32 x W x 3; no aplica contexto en tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Vietnamita (vi) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch y ONNX (tamaño del repo: 0,1 GB; checkpoint de 40,78 MB) |

## Arquitectura y entrenamiento
AsterNet procesa franjas de imagen de 32 píxeles de alto y anchura variable. El flujo consta de: un HP-Stem que combina una convolución 3x3 con un kernel residual paso-alto aprendible (amplificado por un escalar dinámico γ) para conservar los trazos de alta frecuencia de los diacríticos vietnamitas; un backbone de residuos invertidos estilo MobileNetV3 con gating de canales Squeeze-and-Excitation, que suprime descoloración del papel, artefactos de escáner y marcas de agua (2,53 M de parámetros); un map-to-sequence que convierte el mapa de características en cortes temporales 1D; un LSTM bidireccional de 2 capas con hidden_size=256 (3,15 M); una fusión por autoatención lineal multi-cabeza de 4 cabezas para coherencia de palabras compuestas a largo alcance (4,21 M); y una cabeza de clasificación CTC con 227 clases (116 K). Además, incorpora cabezas auxiliares multi-tarea para tono y diacríticos (647 K) con supervisión explícita durante el aprendizaje de representaciones.

Antes de la normalización del tensor, un motor de auto-polaridad por contraste compara la diferencia de brillo entre el centro y el borde de la imagen e invierte la polaridad (X ← 255 − X) cuando detecta texto claro sobre fondo oscuro, garantizando activaciones invariantes. Tras la decodificación CTC, un rescorer lingüístico neuro-simbólico basado en fonología y n-gramas corrige la salida hacia el estándar Unicode NFC. No se ha publicado información sobre el número de tokens o imágenes de entrenamiento, la composición del dataset ni el uso de RLHF/DPO (no aplicable a este tipo de modelo).

## Capacidades
- Reconocimiento de texto en imágenes (pipeline image-to-text) con salida en Unicode NFC estándar.
- OCR especializado en diacríticos vietnamitas de tamaño mínimo (1-2 px), gracias al HP-Stem.
- Reconocimiento robusto sobre texto invertido (texto blanco sobre fondo oscuro, marcas de tiempo de cámara, modo oscuro) mediante el motor de auto-polaridad.
- Supresión de ruido de fondo: descoloración de papel, artefactos de escáner y marcas de agua, vía SE channel gating.
- Procesamiento no autorregresivo con CTC: decodificación de línea completa en una sola pasada, sin generación token a token.
- Rescorer lingüístico neuro-simbólico (fonología y n-gramas) para corregir errores de decodificación.
- Ejecución en tiempo real en CPU de escritorio y móvil, y viable en hardware edge como Raspberry Pi 5.
- Exportación a ONNX para despliegue multiplataforma.

## Casos de uso
- Digitalización de documentos de identidad vietnamitas (CCCD, pasaportes, licencias): el modelo está específicamente afinado para la tipografía y los diacríticos de estos documentos administrativos, con cabezas auxiliares dedicadas a tono y diacríticos.
- Procesamiento de facturas financieras: su supresión de marcas de agua y texturas de fondo mediante SE gating permite extraer texto legible de documentos escaneados con artefactos.
- OCR en aplicaciones móviles: con 40,78 MB de checkpoint y latencias de 28-35 ms en Apple Silicon, es adecuado para apps de escaneo en tiempo real en iPhone y iPad sin servidores remotos.
- Despliegue en edge e IoT: funciona a 8,5 FPS en una Raspberry Pi 5 de 4 GB, lo que habilita quioscos, terminales de punto de venta o lectores embebidos.
- Servidores de bajo coste en la nube: mantiene 15,9 FPS en una instancia vCPU (AWS c6i.large), evitando el coste de GPUs para cargas de digitalización masiva.
- Digitalización de archivos y registros históricos: la tolerancia a descoloración y artefactos de escáner lo hace útil para proyectos de archivado de documentos en papel.
- Capturas de escena (scene text): reconoce texto en fotografías de entornos reales, incluyendo carteles y pantallas en modo oscuro gracias al motor de auto-polaridad.

## Benchmarks y rendimiento
Según la model card del autor, evaluado sobre 100 líneas representativas del National Vietnamese Benchmark Suite (vi_00 / InkData):

| Métrica | Valor |
|---|---|
| Exact match | 86,0 % |
| CER (character error rate) | 3,45 % |
| WER | no disponible (listado como métrica, sin valor publicado) |
| Accuracy | no disponible (listado como métrica, sin valor publicado) |

Latencia y throughput por línea en distintas plataformas:

| Hardware | Arquitectura | Hilos | Latencia/línea | Throughput |
|---|---|---|---|---|
| Apple M3 / M4 Pro | ARM64 (NEON) | 4 | 28,4 ms | 35,2 FPS |
| Apple M1 / M2 | ARM64 (NEON) | 4 | 34,8 ms | 28,7 FPS |
| Intel Core i7-13700H | x86_64 (AVX2/FMA) | 1 | 60,2 ms | 16,6 FPS |
| AMD Ryzen 7 7840HS | x86_64 (AVX-512) | 1 | 54,1 ms | 18,5 FPS |
| AWS c6i.large (vCPU) | x86_64 (AVX-512) | 2 | 62,7 ms | 15,9 FPS |
| Raspberry Pi 5 (4 GB) | ARM Cortex-A76 | 4 | 118,0 ms | 8,5 FPS |

No se han publicado comparaciones numéricas con otros modelos más allá de la afirmación de que el checkpoint es un 70 % más pequeño que VietOCR (40,78 MB frente a 145 MB).

## Requisitos de hardware
- No requiere GPU: el modelo está diseñado para inferencia en CPU. Con 10,65 M de parámetros y 40,78 MB de checkpoint, la huella de memoria es mínima (del orden de decenas de MB en FP32).
- No aplica un requisito de VRAM; cabe con holgura en cualquier GPU consumer si se desea acelerar, pero no es necesario.
- CPU recomendadas según la model card: Apple M1/M2/M3/M4 (ARM64 NEON), Intel Core con AVX2/FMA (i7-13700H), AMD Ryzen con AVX-512 (7840HS), e incluso ARM Cortex-A76 (Raspberry Pi 5).
- Cabe en hardware consumer de gama baja: Raspberry Pi 5 con 4 GB de RAM es suficiente.
- Opciones de despliegue: PyTorch y ONNX (exportación oficial). No se menciona soporte específico para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo de visión).
- Latencia estimada: 28,4-118 ms por línea según hardware; throughput de 8,5 a 35,2 FPS.

## Comparativa con modelos similares

| Característica | AsterNet v1.0 | VietOCR | no disponible |
|---|---|---|---|
| Parámetros | 10,65 M | no disponible | no disponible |
| Tamaño del checkpoint | 40,78 MB | 145 MB | no disponible |
| Decodificación | No autorregresiva (CTC) | Autorregresiva (transformer, según arquitectura conocida) | no disponible |
| Idiomas | vi, en | vi (principalmente) | no disponible |
| Licencia | MIT | no disponible | no disponible |
| Latencia CPU publicada | 28,4-118 ms/línea | no disponible | no disponible |

Solo se ha publicado una comparación explícita con VietOCR (tamaño del checkpoint). No hay datos suficientes para comparar con otras alternativas de OCR vietnamita como PaddleOCR o TrOCR; no disponible.

## Limitaciones y advertencias
- No se han publicado valores de WER ni accuracy pese a figurar como métricas en los tags; solo hay datos de exact match y CER, y evaluados sobre 100 líneas de prueba, una muestra muy pequeña que limita la fiabilidad estadística de los resultados.
- El alcance lingüístico está limitado a vietnamita e inglés; no hay soporte publicado para otros idiomas.
- Los benchmarks provienen de la model card del propio autor y no de una evaluación independiente; conviene validar el CER del 3,45 % sobre datos propios antes de producción.
- Al ser un modelo de OCR de línea (franjas de 32 px de alto), requiere un pipeline externo de detección de regiones de texto para documentos completos; no incluye detector integrado según la información disponible.
- No hay información sobre cuantización (INT8, FP16), lo que puede limitar opciones de optimización adicional en edge.
- La licencia MIT no impone restricciones de uso comercial, pero no hay información publicada sobre sesgos del dataset de entrenamiento ni sobre el rendimiento con fuentes manuscritas o de baja calidad extrema.
- El modelo es muy reciente (creado en octubre de 2026) con pocas descargas (290), por lo que el soporte comunitario y la madurez en producción son limitados.

## Enlaces
- HuggingFace: https://huggingface.co/asterxlabs/asternet-vietnamese-ocr
- No se han encontrado enlaces adicionales a papers, blogs, repositorios o demos en la información disponible.

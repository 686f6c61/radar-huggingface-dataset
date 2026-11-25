# AXERA-TECH/sharp-ax8860

## Resumen

SHARP-ax8860 es la conversión para la NPU AXERA AX8860 del modelo SHARP (Sharp Monocular View Synthesis) de Apple, un modelo de reconstrucción 3D a partir de una sola imagen. Dado un único fotograma, genera una representación de Gaussian Splatting 3D (3DGS) que permite renderizar nuevas vistas de la escena con calidad fotográfica. El modelo original usa un backbone DINOv2-L (ViT-L) como codificador de imagen y una cabeza DPT más un decodificador de gaussianas; esta versión mantiene esa arquitectura pero la divide, cuantiza y compila para ejecutarse en hardware NPU de borde.

La relevancia de esta ficha es la ingeniería de despliegue: consigue inferencia de extremo a extremo en aproximadamente 1,6–1,7 segundos sobre una AX8860 de 4 núcleos NPU, con el ViT en FP8 y el decodificador en U16 (pesos INT8). El resultado son 1.179.648 gaussianas exportables a SPZ (12–17 MB) o PLY (66 MB), con una calidad medida de PSNR mediano de 41,9 dB frente al modelo FP32 original en 29 fotos de COCO y 33,9 dB en 50 fotos de DIV2K.

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni conversación. Es un modelo de visión por computador para image-to-3D. La licencia es la Apple Machine Learning Research Model License, restringida a investigación no comercial, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2-L, 36 bloques) + cabeza DPT + decodificador de gaussianas 3DGS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de una sola imagen) |
| Tipos de cuantizacion | ViT en FP8; decodificador con activaciones U16 y pesos INT8; última conv 1x1 de la cabeza de profundidad en FP32 sobre CPU |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apple Machine Learning Research Model License (apple-amlr), solo investigación no comercial |
| Formato de pesos | artefactos NPU propietarios (`.axmodel`, bancos de pesos FP8, `h4_wb.bin`); salida en SPZ v2 y PLY |

## Arquitectura y entrenamiento

El modelo parte del checkpoint SHARP de Apple. La arquitectura es un pipeline de dos etapas: un codificador de imagen DINOv2-L (ViT de 36 bloques, ejecutado 35 + 1 veces por imagen) que extrae características, seguido de un decodificador que combina una cabeza DPT con un decodificador de gaussianas que emite posiciones y atributos de las gaussianas 3D. No hay información en la model card sobre el dataset de entrenamiento original, el número de tokens, ni si hubo ajuste por RLHF o DPO; esos detalles pertenecen al modelo SHARP original y no se reproducen aquí.

Las modificaciones para AX8860 son de despliegue, no de entrenamiento: el ViT se cuantiza a FP8 con kernels NPU personalizados; el decodificador se compila con pulsar2 usando activaciones U16 y pesos INT8, calibrado sobre 80 fotos; los tensores de 16 bits mayores de 128 MiB se dividen por canales; la imagen se introduce como tensor space-to-depth 2x2; y la última convolución 1x1 de la cabeza de profundidad se extrae del grafo NPU y se calcula en CPU en FP32. El preprocesado y postprocesado se reimplementan en C++, con salida SPZ opcional (posiciones y atributos cuantizados).

## Capacidades

- Síntesis de vistas noveles a partir de una sola imagen (novel view synthesis).
- Generación de representaciones 3D Gaussian Splatting (3DGS) con 1.179.648 gaussianas por imagen.
- Exportación a SPZ v2 (12–17 MB) y PLY (66 MB, mismo layout que ml-sharp).
- Inferencia en hardware de borde sobre NPU AX8860 (4 núcleos), con decodificación JPEG por hardware (JDEC/VDEC).
- API en C (`libsharp_ax.so`), herramienta de línea de comandos (`sharp_ax`, aarch64, glibc >= 2.38) y binding Python por ctypes usando solo biblioteca estándar.
- Demo web servida desde la propia placa (subida de foto y visualización en navegador).
- No soporta tool calling, agentes, razonamiento multi-paso, texto ni audio.

## Casos de uso

- Digitalización rápida de objetos para e-commerce: una foto de producto se convierte en gaussianas 3D en ~1,6 s en la placa, permitiendo generar vistas giratorias para fichas de producto sin estudio fotográfico.
- Reconstrucción de escenas en robótica de borde: el modelo corre en la NPU local y produce una representación 3D navegable que un robot puede usar para planificación de viewpoints o inspección.
- Prototipado de experiencias AR/VR: generar splats desde fotos de móvil y abrirlos en visores como SuperSplat para previsualizar contenido inmersivo antes de un pipeline de captura completo.
- Investigación en síntesis de vistas: banco de pruebas de bajo consumo para comparar calidad de 3DGS monocular frente a modelos FP32 en GPU, con métricas PSNR reproducibles sobre COCO y DIV2K.
- Inspección industrial ligera: captura de una pieza con una cámara conectada a la placa y generación de una representación 3D para revisión remota de geometría y textura.
- Demos interactivas en ferias o kioscos: el demo web integrado permite que un visitante suba una foto y vea el resultado 3D en el navegador en segundos, sin infraestructura cloud.
- Previsualización de assets para pipelines de VFX: generar splats de referencia rápidos a partir de stills antes de un escaneo fotogramétrico completo.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en AX8860 (4 núcleos NPU, SDK V0.6.0), desglosado por etapa:

| Etapa | Tiempo (ms) | Ubicación |
|---|---:|---|
| Decodificación JPEG (JDEC hardware) | 20–60 | VDEC |
| Preprocesado | ~70 | CPU |
| ViT x36 (DINOv2-L, FP8) | ~760 | NPU |
| Cola (DPT + decodificador de gaussianas, U16) | ~490 | NPU |
| Última capa de la cabeza de profundidad (FP32) | ~50 | CPU |
| Postprocesado | ~160 | CPU |
| Escritura SPZ / PLY | ~170 / ~65 | CPU |
| **Extremo a extremo** | **~1600–1700** | |

Calidad frente al modelo FP32 oficial en GPU (renderizados desde 4 viewpoints desplazados, fotos no usadas para calibración):

| Dataset | Fotos | PSNR mediano |
|---|---:|---:|
| COCO | 29 | 41,9 dB |
| DIV2K | 50 | 33,9 dB |

Carga del modelo (una sola vez): ~0,8 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- Hardware objetivo: NPU AXERA AX8860 con 4 núcleos; no se documenta ejecución en GPU ni CPU genérica.
- VRAM: no aplica; el modelo usa memoria de la NPU/placa. El repo de pesos ocupa 0,7 GB.
- GPU recomendadas: no disponible (el modelo está compilado para NPU AX8860).
- ¿Cabe en GPU consumer? No en esta distribución; los artefactos son específicos de la NPU. El modelo SHARP original en FP32 sí requiere GPU, pero sus requisitos no se detallan aquí.
- Despliegue: herramienta CLI `sharp_ax`, biblioteca C `libsharp_ax.so`, binding Python por ctypes, demo web en la placa. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia: ~1,6–1,7 s de extremo a extremo; throughput no documentado más allá de esta cifra por imagen.
- Requisitos de sistema: aarch64 con glibc >= 2.38, `LD_LIBRARY_PATH=/opt/lib`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Hardware | Licencia |
|---|---|---|---|---|---|
| SHARP-ax8860 (este) | 3DGS monocular | 1 imagen | 1.179.648 gaussianas (SPZ/PLY) | NPU AX8860 | Apple AMLR, no comercial |
| SHARP original (Apple) | 3DGS monocular | 1 imagen | gaussianas (PLY) | GPU (FP32) | Apple AMLR, no comercial |
| Modelos image-to-3D genéricos (p. ej. basados en difusión) | malla/textura 3D | 1 imagen | malla 3D | GPU | variable |

La comparación cuantitativa con alternativas de la misma categoría no está disponible en la información proporcionada; solo se documenta la comparación de calidad frente al SHARP original en FP32 (PSNR mediano 41,9 dB en COCO y 33,9 dB en DIV2K).

## Limitaciones y advertencias

- Licencia Apple Machine Learning Research Model License: solo para investigación no comercial. Uso comercial prohibido sin licencia adicional de Apple.
- Es un derivado del checkpoint de Apple; el proyecto no está afiliado ni respaldado por Apple.
- Modelo de visión: no procesa texto, no responde preguntas y no admite instrucciones en lenguaje natural.
- Dependencia total del hardware AX8860: los artefactos no son portables a otras NPU ni a GPU sin reconversión.
- La cuantización FP8/INT8 introduce pérdida de calidad frente al FP32 (PSNR mediano 41,9 dB en COCO y 33,9 dB en DIV2K, no paridad exacta).
- La calibración del decodificador se hizo sobre 80 fotos; el comportamiento en dominios muy distintos (imágenes médicas, satelitales, poca luz) no está validado.
- Riesgo de artefactos geométricos y alucinación de geometría en regiones ocluidas, inherente a la síntesis monocular de vistas.
- Sin información publicada sobre sesgos demográficos o de contenido del dataset original.
- Repo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario mínimos.
- Requiere glibc >= 2.38 en aarch64; entornos con toolchains más antiguos pueden no ejecutar los binarios.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/sharp-ax8860
- Repositorio de código (C++/C API/Python/demo web): https://github.com/AXERA-TECH/sharp-ax8860
- Modelo original SHARP de Apple: https://github.com/apple/ml-sharp
- Licencia del modelo: https://huggingface.co/AXERA-TECH/sharp-ax8860/blob/main/LICENSE_MODEL
- Visor SuperSplat para archivos SPZ: https://superspl.at/editor
- Foto de demo (Pexels, Niko Desmon): https://www.pexels.com

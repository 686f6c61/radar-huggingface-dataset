# Beeam9/ko-receipt-ppocrv5-rec

## Resumen
`Beeam9/ko-receipt-ppocrv5-rec` es un modelo de reconocimiento de texto (text recognition) especializado en tickets térmicos coreanos capturados con teléfono móvil. Lo desarrolla el usuario Beeam9 y parte del reconocedor oficial `korean_PP-OCRv5_mobile_rec` de PaddleOCR, sobre el que aplica un ajuste fino (fine-tuning) orientado a las condiciones reales de captura con smartphone: bajo contraste, caracteres pequeños, reflejos y perspectivas inclinadas.

El modelo no realiza detección de texto por sí solo: es un componente de reconocimiento que se combina con un detector (por defecto `PP-OCRv5_mobile_det`, opcionalmente `PP-OCRv6_medium_det`) dentro del stack PaddleOCR/PaddleX. Su relevancia radica en que aborda un caso de uso muy concreto y poco cubierto por los modelos OCR genéricos: la digitalización de tickets de compra coreanos para aplicaciones de gestión de gastos, contabilidad o fidelización.

El checkpoint publicado corresponde a `b1a_phone_only/epoch_10`, entrenado durante 10 épocas (1.520 pasos) partiendo de una interpolación WiSE-FT (`wise_round2/alpha_90`). La licencia es Apache 2.0, igual que el modelo base, y el repositorio incluye los pesos de inferencia de Paddle junto con un script de inferencia extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de reconocimiento de texto de PP-OCRv5 (PaddleOCR/PaddleX); arquitectura neuronal concreta no detallada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de reconocimiento con altura fija de 48 px y ancho de entrenamiento de 320 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paddle inference (`inference.json`, `inference.pdiparams`, `inference.yml`) |

## Arquitectura y entrenamiento
El modelo es un reconocedor de texto del linaje PP-OCRv5 de PaddleOCR, derivado de la variante móvil (`PP-OCRv5_mobile_rec`, en su versión coreana). Se entrena sobre recortes de líneas de texto y produce la transcripción de cada línea; en el pipeline completo, el detector localiza las cajas de texto y este reconocedor las transcribe. La model card no detalla la arquitectura interna (tipo de backbone, módulo de atención o decodificador), por lo que ese dato queda como no disponible.

El ajuste fino se realizó exclusivamente con datos de tickets capturados con smartphone, partiendo del checkpoint interpolado `wise_round2/alpha_90` (WiSE-FT, interpolación de pesos entre el modelo original y uno ajustado) y deteniéndose a las 10 épocas (1.520 pasos). Según el autor, entrenar más allá de 20 épocas provocaba sobreajuste y olvido de vocabulario de productos de tiendas no vistas; el checkpoint publicado busca el mejor equilibrio de generalización entre los conjuntos `val`, `test` y `holdout`. No se especifican el volumen del dataset de entrenamiento, la composición exacta ni si hubo etapas de RLHF/DPO (no aplicables en un modelo OCR).

Como innovación destacable, el autor documenta la combinación opcional con el detector `PP-OCRv6_medium_det` (con `limit_side_len=1600`, `unclip_ratio=1.479` y teselado SAHI), que eleva la recall de detección de dígitos sueltos pequeños del 68,9 % al 85,1 % (+16,2 puntos) en tickets verticales largos.

## Capacidades
- Reconocimiento de texto (OCR) de líneas en imágenes de tickets térmicos coreanos, con salida de texto y puntuación de confianza por línea.
- Transcripción bilingüe coreano-inglés, útil para tickets con nombres de producto o marcas en inglés.
- Funciona como reconocedor independiente del detector: compatible con `PP-OCRv5_mobile_det` (por defecto) y con `PP-OCRv6_medium_det` (opcional).
- Inferencia en CPU y GPU mediante PaddleOCR 3.x / PaddleX (`device="cpu"` o `device="gpu:0"`).
- Integración con el ecosistema PaddleOCR: pipeline de detección + reconocimiento + clasificación de orientación de documento y de línea (estas dos últimas desactivables).
- No dispone de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento: es un modelo puro de reconocimiento de texto.

## Casos de uso
- Digitalización de tickets para apps de gestión de gastos: el reconocedor transcribe cada línea del ticket (producto, cantidad, precio) y la app agrega los importes; su ajuste a capturas con smartphone reduce errores frente a OCR genéricos en condiciones de baja calidad.
- Automatización contable para pymes: procesamiento por lotes de fotografías de tickets coreanos en un pipeline PaddleOCR con detector + reconocedor, generando registros estructurados para el sistema contable.
- Programas de fidelización y reembolsos: verificación automática de tickets enviados por usuarios mediante la transcripción de líneas y la confianza por línea, con umbral de aceptación configurable.
- Extracción de datos para análisis de mercado: agregación de nombres de productos y precios de tickets de distintas tiendas para estudios de precios, aprovechando la mejora del autor en vocabulario de tiendas no vistas.
- Digitalización de archivos históricos de tickets: conversión de lotes de tickets térmicos escaneados o fotografiados en texto indexable y buscable.
- Despliegue en dispositivos con recursos limitados: al ser una variante móvil de PP-OCRv5 con inferencia en CPU, puede ejecutarse en servidores sin GPU o en entornos edge para preprocesar tickets antes de enviarlos a la nube.
- Mejora de la recall en tickets largos: en tickets verticales con cantidades de un solo dígito, el emparejamiento con `PP-OCRv6_medium_det` y teselado SAHI permite recuperar dígitos que el detector móvil pierde.

## Benchmarks y rendimiento
Evaluación extremo a extremo con el detector oficial `PP-OCRv6_medium_det` sobre tickets térmicos coreanos capturados con smartphone. La línea base es el checkpoint `replay_bn_frozen/ep12`.

| Split | Métrica | Baseline (`replay_bn_frozen/ep12`) | Este modelo (`b1a_ep10`) | Delta |
|---|---|---|---|---|
| Archive `val` (51 tickets, 1.438 líneas) | CER por línea con espacios | 1,97 % | 1,68 % | -0,29 pp |
| Archive `val` (51 tickets, 1.438 líneas) | CER por línea sin espacios | 1,16 % | 1,03 % | -0,13 pp |
| Archive `test` (51 tickets) | CER E2E `span_ns` sin espacios | 3,91 % | 3,71 % (495 / 13.341) | -0,20 pp |
| Polygon `holdout` (25 tickets no vistos, 1.601 líneas) | CER 1:1 con espacios | 4,62 % (722 ediciones) | 4,12 % (643 ediciones) | -0,50 pp |
| Polygon `holdout` (25 tickets no vistos, 1.601 líneas) | CER 1:1 sin espacios | 3,20 % (452 ediciones) | 3,15 % (445 ediciones) | -0,05 pp |

Además, el autor reporta que la combinación con `PP-OCRv6_medium_det` (con `limit_side_len=1600`, `unclip_ratio=1.479` y SAHI) eleva la recall de detección de dígitos sueltos del 68,9 % al 85,1 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) por tratarse de un modelo OCR.

## Requisitos de hardware
- VRAM estimada: no disponible en la model card. Al ser una variante móvil de PP-OCRv5, el consumo es bajo y la inferencia en CPU está soportada explícitamente (`--device cpu`).
- GPU recomendadas: no se especifican. Cualquier GPU compatible con PaddlePaddle (por ejemplo, series RTX o A100/H100) puede ejecutar la inferencia en modo `gpu:0`; el modelo no requiere hardware de gama alta.
- GPU de consumo: sí, cabe en GPUs de consumo; también funciona en CPU, lo que lo hace apto para entornos sin acelerador.
- Opciones de despliegue: PaddleOCR 3.x / PaddleX (API `PaddleOCR` con `text_recognition_model_dir`), script `predict.py` incluido en el repositorio y descarga de pesos con `huggingface_hub.snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / entrada | Rendimiento documentado |
|---|---|---|---|---|---|
| `Beeam9/ko-receipt-ppocrv5-rec` | Reconocedor OCR PP-OCRv5 móvil ajustado a tickets coreanos | ko, en | Apache 2.0 | Líneas de imagen, altura 48 px | CER 1,68 % (val, con espacios); 3,71 % E2E (test) |
| `PaddlePaddle/PP-OCRv5_mobile_rec` (base) | Reconocedor OCR PP-OCRv5 móvil genérico | multilingüe (según variante) | Apache 2.0 | Líneas de imagen, altura 48 px | no disponible en la información proporcionada |
| `korean_PP-OCRv5_mobile_rec` (base coreano) | Reconocedor OCR PP-OCRv5 móvil para coreano | ko | Apache 2.0 | Líneas de imagen, altura 48 px | no disponible en la información proporcionada |
| `PaddlePaddle/PP-OCRv5_mobile_det` | Detector de texto (complementario, no comparable directamente) | no aplica | Apache 2.0 | Imágenes completas | no disponible en la información proporcionada |

La comparación directa con alternativas de otros ecosistemas (por ejemplo, TrOCR o modelos OCR de terceros) no está disponible en la información proporcionada.

## Limitaciones y advertencias
- Líneas muy anchas (W > 480 px con H = 48 px): la diferencia de proporción entre el entrenamiento a ancho fijo (320×48) y la inferencia a ancho natural provoca un CER sin espacios superior (3,90 %) frente a líneas normales (W ≤ 320 px, 2,82 %); afecta a números de tarjeta enmascarados y avisos largos.
- Condiciones de captura extremas: arrugas fuertes, reflejos o sombras intensas y ángulos de rotación pronunciados degradan la precisión.
- Sesgos conocidos: no documentados; al entrenarse con tickets de tiendas concretas, el vocabulario de productos de tiendas no vistas puede reconocerse peor (el autor mitiga esto deteniendo el entrenamiento a las 10 épocas).
- Riesgo de alucinación: no aplica en el sentido de generación libre, pero el reconocedor puede producir transcripciones incorrectas en líneas de baja calidad; conviene usar las puntuaciones de confianza (`rec_scores`) para filtrar.
- Limitaciones de idioma: solo coreano e inglés; no cubre otros alfabetos ni tickets en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso de licencia.
- Caveats para producción: el modelo es solo el reconocedor; requiere un detector compatible y un pipeline PaddleOCR correctamente configurado. El detector `PP-OCRv6_medium_det` no se incluye en el repositorio y debe descargarse por separado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/Beeam9/ko-receipt-ppocrv5-rec
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
- PaddleX (repositorio oficial): https://github.com/PaddlePaddle/PaddleX
- Documentación de PaddleOCR: https://www.paddleocr.ai/

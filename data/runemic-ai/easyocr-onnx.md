# runemic-ai/easyocr-onnx

## Resumen

EasyOCR in ONNX (runemic-ai/easyocr-onnx) es un paquete que reune los modelos oficiales de EasyOCR desarrollados por Jaided AI, exportados sin modificaciones a formato ONNX para poder ejecutarse en el navegador mediante ONNX Runtime Web. No es un modelo de lenguaje generativo, sino un sistema OCR clasico de dos etapas: un detector de texto (CRAFT) y varios reconocedores por escritura (arquitectura CRNN con decodificacion CTC). El autor del repositorio es runemic-ai, que lo emplea en su Space OCR Arena.

El problema que resuelve es la digitalizacion de texto en imagenes directamente en el lado del cliente, sin depender de un servidor. Al estar en ONNX, el modelo puede desplegarse tanto en navegador como en entornos nativos con ONNX Runtime, lo que reduce la latencia y evita enviar documentos sensibles a terceros. El repositorio ocupa 0,6 GB e incluye un detector y ocho reconocedores, uno por cada script soportado.

Es relevante para desarrolladores que necesitan OCR ligero y portable, especialmente en escenarios donde el procesamiento local o en el navegador es prioritario. La licencia Apache-2.0 y el hecho de que proceda de EasyOCR 1.7.2 facilitan su integracion en productos comerciales. No se dispone de datos de entrenamiento ni de parametros exactos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector CRAFT (convolucional) y reconocedor CRNN con CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 8 scripts: latin, english, arabic, devanagari, cyrillic, zh_sim, japanese, korean |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (craft.onnx, rec_

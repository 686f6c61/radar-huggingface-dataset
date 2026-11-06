# softandsweet/giangndm-yolo11-onnx-rngd-fxbex

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de despliegue para un detector de objetos YOLO11n de 640x640, empaquetado en formato FXBEX para el acelerador Furiosa RNGD. El autor, `softandsweet`, parte de los pesos ONNX del modelo original `giangndm/yolo11-onnx` (commit `8b180c762d5cf217886d16e64403508042207e4d`) y los envuelve junto con 90 Runnables del SDK de Furiosa, adaptadores YOLO y módulos auxiliares del compilador. El objetivo es facilitar la ejecución del detector sobre hardware NPU de Furiosa sin tener que reconstruir el pipeline de compilación.

El paquete está pensado para inferencia de detección de objetos con entrada RGB de 640x640 y batch 1, devolviendo cajas, identificadores de clase y puntuaciones. Requiere un entorno host con Furiosa SDK 2026.4.0, FXBEX 0.4.0, ONNX 1.17.0, onnx2torch 1.5.15, torchvision, NumPy y Pillow. La propia model card advierte de que no se trata de una verificación de inferencia en NPU, lo que limita su valor como referencia de rendimiento.

Su relevancia es acotada: sirve como artefacto reproducible para integrar YOLO11n en el ecosistema Furiosa RNGD, pero no aporta pesos nuevos, ni datos de entrenamiento, ni resultados de benchmarks. El tamaño del repositorio aparece como 0.0 GB y no hay descargas ni interacciones registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (detector de objetos de una etapa), exportado a ONNX y empaquetado como FXBEX para Furiosa RNGD |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640, batch 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision; etiquetas de clase en ingles segun el dataset de origen, no confirmado) |
| Licencia | AGPL-3.0 (pesos); el codigo empaquetado no tiene licencia separada; aplican los terminos del SDK host de Furiosa |
| Formato de pesos | ONNX incluido en el paquete FXBEX; Runnables precompilados del SDK |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, un detector de objetos de una etapa basado en CNN con cuello de agregacion de caracteristicas y cabeceras de prediccion densa. El paquete no incluye informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes, ni sobre tecnicas de aumento de datos o destilacion. Tampoco se documenta si hubo ajuste fino posterior.

La innovacion tecnica del repositorio no esta en el modelo, sino en el empaquetado: se incluyen 90 Runnables guardados del SDK de Furiosa, junto con el adaptador YOLO y modulos auxiliares del compilador, para permitir la ejecucion sobre el acelerador RNGD. El flujo declarado parte de ONNX 1.17.0 y usa onnx2torch 1.5.15 para la conversion. No se especifican detalles sobre la compilacion a FXBEX, el particionado de grafos ni el uso de memoria del acelerador.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640x640 con batch 1.
- Salida de cajas delimitadoras, identificadores de clase y puntuaciones de confianza.
- Ejecucion sobre hardware Furiosa RNGD mediante el SDK 2026.4.0 y FXBEX 0.4.0.
- Incluye 90 Runnables preguardados que cubren el grafo de inferencia empaquetado.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision-lenguaje, tool calling ni agentes.
- No se documentan capacidades multilingues ni modo de razonamiento.

## Casos de uso

- Deteccion de objetos en tiempo real en el borde: el paquete permite desplegar YOLO11n sobre un acelerador Furiosa RNGD en entornos con restricciones de consumo, siempre que el host cumpla los requisitos del SDK.
- Inspeccion visual industrial: con entrada fija de 640x640 y batch 1, encaja en estaciones de control de calidad que procesan una imagen por ciclo y necesitan cajas y clases.
- Analisis de video pregrabado: al ser un detector ligero, puede procesarse fotograma a fotograma en pipelines por lotes sobre el acelerador.
- Prototipado de sistemas de vision embebida: util para validar el flujo ONNX -> FXBEX -> RNGD antes de invertir en un modelo mayor.
- Reproducibilidad de experimentos: al fijar el commit del modelo original y las versiones del SDK, sirve como artefacto de referencia en evaluaciones internas.
- Integracion en pipelines de investigacion sobre NPUs: permite comparar el comportamiento del mismo detector en GPU y en RNGD con el mismo grafo ONNX de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado verificacion de inferencia en NPU, por lo que no hay datos de latencia, throughput ni precision (mAP) medidos sobre el acelerador.

## Requisitos de hardware

- Acelerador: Furiosa RNGD, con SDK 2026.4.0 y FXBEX 0.4.0 en el host.
- Software host: ONNX 1.17.0, onnx2torch 1.5.15, torchvision, NumPy y Pillow.
- VRAM estimada: no disponible; el paquete esta orientado a NPU, no a GPU.
- GPU recomendadas: no aplica para el paquete FXBEX; el modelo ONNX subyacente podria ejecutarse en GPU, pero no se documentan requisitos.
- Compatibilidad con GPU de consumo: no confirmada para el paquete; YOLO11n es un modelo pequeno, pero no hay datos de memoria del artefacto.
- Opciones de despliegue: ejecucion via Furiosa SDK; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n RNGD FXBEX (este) | no disponible | 640x640, batch 1 | sin benchmarks publicados | AGPL-3.0 | Hugging Face, 0 descargas |
| giangndm/yolo11-onnx (origen) | no disponible | 640x640 | no disponible en esta ficha | AGPL-3.0 | Hugging Face |
| YOLO11n de Ultralytics | no disponible en esta ficha | 640x640 | no disponible en esta ficha | AGPL-3.0 (uso comercial bajo licencia Ultralytics) | Repositorio oficial de Ultralytics |

No se dispone de datos suficientes para comparar parametros, contexto o rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts, contexto textual, tool calling ni agentes.
- La model card declara que no hay verificacion de inferencia en NPU, por lo que el rendimiento real en RNGD no esta validado.
- El repositorio aparece con tamano 0.0 GB, lo que puede indicar que los artefactos no estan disponibles o que la medicion no es fiable; conviene verificar antes de usarlo.
- La licencia AGPL-3.0 de los pesos impone obligaciones de copyleft sobre el codigo que los combine o distribuya; el codigo empaquetado no tiene licencia separada, lo que genera ambiguedad legal.
- Los componentes host del SDK de Furiosa se rigen por sus propios terminos, que pueden restringir el uso comercial o la redistribucion.
- No hay informacion sobre sesgos, clases del dataset de entrenamiento ni riesgo de falsos positivos o negativos.
- No se documentan limitaciones de idioma porque el modelo no procesa texto, pero las etiquetas de clase dependen del dataset original y no se detallan.
- Ausencia de descargas y de interacciones: no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/softandsweet/giangndm-yolo11-onnx-rngd-fxbex
- Modelo original: https://huggingface.co/giangndm/yolo11-onnx
- Commit de referencia: 8b180c762d5cf217886d16e64403508042207e4d
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.

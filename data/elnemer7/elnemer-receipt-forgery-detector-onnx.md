# elnemer7/ElNeMeR-Receipt-Forgery-Detector-ONNX

## Resumen

ElNeMeR-Receipt-Forgery-Detector-ONNX es un clasificador tabular exportado a formato ONNX, desarrollado por Eng. Mahmoud ElNemer bajo el sello ElNeMeR Digital Solutions & AI. No es un modelo de lenguaje: recibe 16 senales de analisis forense de imagen digital (error level analysis en bandas de texto, clones copy-move, varianza de kerning sub-pixel y roturas de submuestreo de croma) y emite una etiqueta entre tres clases: documento autentico, recibo de pago falsificado o identificacion con sello clonado.

El modelo esta disenado especificamente para la deteccion de fraude en capturas de pantalla de pagos (InstaPay, Vodafone Cash, transferencias bancarias) y documentos digitales, un nicho relevante en mercados donde la verificacion de comprobantes de pago se hace a partir de imagenes y no de registros bancarios. Su valor practico esta en ofrecer una senal automatizada y de baja latencia para pipelines de validacion antifraude.

La informacion publica disponible es muy limitada: el repositorio tiene 0 descargas y 0 likes, no se detalla la arquitectura interna de la red, el volumen del conjunto de entrenamiento ni metricas de evaluacion. La ficha se completa con los datos disponibles y se marca explicitamente como "no disponible" todo aquello que el autor no publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular exportado a ONNX; topologia interna no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada tabular de 16 caracteristicas, no secuencial) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizaciones int8/fp16 no documentadas) |
| Idiomas soportados | no disponible (no procesa texto de forma nativa; opera sobre senales de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El autor describe la entrada como un vector de 16 senales forenses localizadas: picos de ELA en bandas de texto alrededor de campos de moneda y referencia, clones de parches por copy-move, varianza de kerning y bordes sub-pixel, y roturas de submuestreo de croma. La salida es una clasificacion en tres clases (0 = AUTHENTIC_DOCUMENT, 1 = FORGED_PAYMENT_RECEIPT, 2 = CLONE_STAMP_TAMPERED_ID). El modelo se distribuye como grafo ONNX, lo que sugiere que la extraccion de caracteristicas se realiza fuera del modelo (en un pipeline de preprocesado de imagen) y la red solo consume el vector tabular resultante.

No se publica informacion sobre el numero de capas, el tipo de capas (densas, convolucionales 1D u otras), el volumen del dataset de entrenamiento, la composicion de las muestras, ni si se aplicaron tecnicas de aumento de datos o calibracion. Tampoco se documenta si hubo entrenamiento con clases balanceadas ni como se generaron las muestras falsificadas (sinteticas o reales). El tamano del repositorio es de 0.0 GB, lo que es coherente con un modelo tabular de muy pocos parametros.

## Capacidades

- Clasificacion de documentos digitales en tres categorias: autentico, recibo de pago falsificado e identificacion con sello clonado.
- Deteccion de manipulaciones copy-move mediante senales de clones de parches.
- Deteccion de artefactos de compresion (roturas de submuestreo de croma) tipicos de edicion de capturas de pantalla.
- Analisis de inconsistencias tipograficas (kerning y varianza de bordes sub-pixel) para detectar texto sobreimpreso.
- Analisis de error level analysis (ELA) focalizado en bandas de texto y campos de moneda/referencia.
- Inferencia via runtime ONNX, lo que permite despliegue en CPU sin dependencias de frameworks de deep learning pesados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un clasificador puro.
- No dispone de capacidades multilingues, de vision general ni de audio.

## Casos de uso

- Verificacion automatizada de comprobantes de pago en comercio electronico: el modelo recibe las 16 senales forenses extraidas de la captura enviada por el cliente y devuelve una etiqueta que permite bloquear pedidos con recibos de InstaPay o Vodafone Cash manipulados antes de la validacion manual.
- Triaje en departamentos de atencion al cliente: integrado en un formulario de subida de justificantes, marca los casos sospechosos para revision humana y reduce la carga de analistas en volumenes altos de reclamaciones.
- Modulo antifraude en pasarelas de pago locales: como paso previo a la conciliacion bancaria, el clasificador descarta capturas con artefactos de edicion y evita disputas posteriores.
- Verificacion de identidad en procesos KYC de baja exigencia: la clase CLONE_STAMP_TAMPERED_ID permite detectar sellos o estampados clonados en documentos de identidad digitalizados, derivando el caso a un proceso reforzado.
- Forensia documental en peritajes: como herramienta de apoyo para priorizar que imagenes requieren analisis manual detallado con software forense (Photoshop, ImageForensics, etc.).
- Automatizacion de auditorias internas: procesamiento por lotes de capturas archivadas para detectar patrones de fraude recurrente en un historico de comprobantes.
- Integracion en apps moviles de gestion de gastos: al ser ONNX y de pequeno tamano, puede ejecutarse en el dispositivo antes de subir el justificante al servidor, reduciendo coste de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye matrices de confusion, precision, recall, F1, AUC ni comparaciones con lineas base en la model card. Tampoco se documenta el tamano del conjunto de test ni la distribucion de clases.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamano del repositorio (0.0 GB) y la naturaleza tabular del modelo, se espera que quepa en memoria de CPU sin GPU.
- GPU recomendadas: no disponible; no se requiere GPU para un grafo ONNX de este tipo, aunque puede acelerarse con CUDA o TensorRT si el runtime lo soporta.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU consumer o incluso en CPU, dado el caracter tabular del modelo; no se publican requisitos minimos.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/DirectML), integracion en servicios Python via `onnxruntime`, o conversion a otros runtimes (OpenVINO, TensorRT) no documentada por el autor.
- Latencia y throughput estimados: no disponibles. La latencia dominante en produccion probablemente la marque la extraccion de las 16 senales forenses de la imagen, no la inferencia del clasificador.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion tabular forense para deteccion de fraude en recibos de pago. Las alternativas habituales en este dominio son herramientas de analisis forense de imagen (ELA, deteccion de copy-move con SIFT/SURF) y APIs comerciales de verificacion documental, pero no se dispone de datos de rendimiento del modelo para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Receipt-Forgery-Detector-ONNX | no disponible | no aplica | MIT | ONNX | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de metricas publicadas: no hay evidencia cuantitativa de precision, recall ni robustez del clasificador; no debe desplegarse en produccion sin una evaluacion propia sobre datos representativos.
- Sesgo de dominio: el modelo esta entrenado para capturas de pantalla de InstaPay, Vodafone Cash y transferencias bancarias, presumiblemente del contexto egipcio; su comportamiento en otros formatos, resoluciones o paises no esta documentado.
- Dependencia del preprocesado: el modelo consume 16 senales forenses que deben extraerse con un pipeline externo no publicado; una implementacion distinta del extractor puede degradar gravemente el rendimiento.
- Riesgo de falsos positivos y negativos: al ser un clasificador de tres clases sin umbrales de confianza documentados, no se especifica como gestionar casos ambiguos.
- Sin informacion sobre sesgos: no se documenta la distribucion del dataset de entrenamiento ni posibles sesgos por dispositivo, resolucion o aplicacion de origen de las capturas.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el aviso de responsabilidad recae en el integrador.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion publica que permita validar la calidad del modelo.
- No apto para decisiones automatizadas de alto impacto sin revision humana: la deteccion de fraude documental tiene consecuencias legales y debe combinarse con verificacion manual y fuentes de verdad externas (registros bancarios).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Receipt-Forgery-Detector-ONNX
- Laboratorio forense en vivo: https://detector.elnemer-ai.com
- Sitio del autor: https://elnemer-ai.com

# elnemer7/ElNeMeR-AntiPhishing-URL-QR-ONNX

## Resumen

ElNeMeR-AntiPhishing-URL-QR-ONNX es un clasificador tabular exportado a formato ONNX, desarrollado por Eng. Mahmoud ElNemer (ElNeMeR Digital Solutions & AI). No es un modelo de lenguaje: es un detector de amenazas que recibe 24 características estructurales extraídas de una URL o de un código QR y devuelve una de tres clases discretas (`SAFE_DOMAIN`, `PHISHING_BRAND_SPOOF`, `MALWARE_QR_HIJACK`). El problema que aborda es el *quishing* (phishing vehiculado mediante QR) y la suplantación de marcas bancarias y de pagos, con especial atención al ecosistema egipcio y árabe (InstaPay, Vodafone Cash, Fawry, WhatsApp Web).

El modelo se publica como artefacto ONNX con licencia MIT y pipeline declarado `tabular-classification`. El repositorio tiene un tamaño declarado de 0.0 GB, lo que sugiere un grafo de inferencia muy ligero, coherente con un clasificador de 24 entradas y 3 salidas. La model card no documenta arquitectura interna, número de parámetros, datos de entrenamiento ni métricas de evaluación.

Su relevancia práctica radica en la ligereza y en la portabilidad del formato ONNX: puede integrarse como paso de pre-filtrado en navegadores, gateways de correo, pasarelas móviles o pipelines antifraude sin dependencia de GPU ni de frameworks de deep learning pesados. No obstante, la ausencia total de benchmarks publicados y de documentación sobre el conjunto de entrenamiento limita seriamente su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular exportado a ONNX; estructura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada de 24 características tabulares, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre características estructurales de URL, no sobre texto libre; la model card menciona marcas egipcias y árabes) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se trata de un clasificador tabular de tres clases que consume un vector de 24 características estructurales, entre las que la model card enumera: entropía de Shannon del dominio, homógrafos Punycode/IDN, suplantación de marcas bancarias y de monedero egipcias y árabes (InstaPay, Vodafone Cash, Fawry, WhatsApp Web), TLDs de riesgo, dominios túnel y droppers de payload APK/EXE. El artefacto distribuido es un grafo ONNX, lo que implica que la inferencia se ejecuta mediante ONNX Runtime en lugar de un framework de entrenamiento.

No se especifican el número de tokens ni la composición del dataset de entrenamiento, ni si hubo ajuste fino, calibración o técnicas de aumento de datos. Tampoco se documenta el proceso de extracción de características que transforma una URL o un QR en el vector de 24 dimensiones, lo cual es un componente crítico del sistema y queda fuera del artefacto publicado.

## Capacidades

- Clasificación de URLs y de destinos codificados en códigos QR en tres categorías: dominio seguro, suplantación de marca (phishing) y secuestro por malware vía QR.
- Detección de homógrafos Punycode/IDN, un vector habitual de suplantación visual de dominios.
- Cálculo implícito de entropía de Shannon del dominio como señal de dominios generados automáticamente (DGA).
- Identificación de TLDs de riesgo y de dominios usados como túnel.
- Detección de enlaces que sirven como droppers de APK/EXE.
- Reconocimiento de suplantación de marcas de banca y pagos del ecosistema egipcio y árabe (InstaPay, Vodafone Cash, Fawry, WhatsApp Web).
- Inferencia portable vía ONNX Runtime en CPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un clasificador tabular.

## Casos de uso

- Filtrado de URLs en pasarelas de correo: el modelo se ejecuta como paso previo a un análisis más costoso (sandbox, reputación de dominio) y descarta o marca candidatos según la clase predicha, reduciendo el volumen que llega a las etapas caras del pipeline.
- Protección frente a quishing en aplicaciones móviles: tras decodificar un QR, la app extrae las 24 características y consulta el modelo en local mediante ONNX Runtime antes de abrir el enlace, bloqueando destinos de suplantación o con payload APK.
- Pre-filtrado en navegador o extensión: al ser un grafo ONNX ligero, puede empaquetarse en una extensión que evalúe enlaces en el cliente sin enviar la URL a un servidor externo, preservando la privacidad del usuario.
- Monitorización de marca: un equipo de fraude puede procesar en lote dominios candidatos (registros recientes, variantes tipográficas de su marca) y usar la clase `PHISHING_BRAND_SPOOF` para priorizar la revisión manual y las solicitudes de takedown.
- Enriquecimiento en SIEM/SOAR: integrar la inferencia como playbook que etiquete indicadores URL/QR con una de las tres clases y dispare acciones automáticas (bloqueo, cuarentena, notificación) según el resultado.
- Análisis de campañas dirigidas a banca egipcia: dado el sesgo declarado hacia marcas como InstaPay, Vodafone Cash y Fawry, resulta adecuado para equipos de fraude que operen en ese mercado y necesiten detectar campañas de suplantación localizadas.
- Validación previa en pasarelas de pago móvil: comprobar el destino de un QR de cobro antes de autorizar la transacción, usando la clase `MALWARE_QR_HIJACK` como señal de bloqueo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye matrices de confusión, precisión, recall, F1, AUC ni comparación con detectores de phishing de referencia. Tampoco se documenta el conjunto de validación ni su procedencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime.
- GPU recomendadas: no se requieren. Cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) podría acelerar el procesamiento por lotes, pero no es necesario.
- Cabe en GPU de consumo: sí, y también en entornos sin GPU (servidores, contenedores, dispositivos móviles), dado el tamaño declarado de 0.0 GB del repositorio.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#, Java, JavaScript/Web), integración en servicios HTTP propios, extensiones de navegador y aplicaciones móviles con runtime ONNX.
- Latencia y throughput estimados: no disponibles. Por la naturaleza del modelo (24 entradas, 3 salidas) se espera una latencia del orden de microsegundos a pocos milisegundos por inferencia en CPU, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa con otros detectores de phishing basados en características de URL (por ejemplo, clasificadores de gradient boosting o redes tabulares similares).

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de precisión, recall ni tasas de falsos positivos, lo que impide validar el modelo antes de desplegarlo en producción.
- Dependencia del extractor de características: el artefacto ONNX solo contiene el clasificador; las 24 características deben calcularse con un pipeline externo no publicado. Una implementación distinta del extractor puede degradar o invalidar las predicciones.
- Sesgo geográfico declarado: el modelo está orientado a marcas egipcias y árabes (InstaPay, Vodafone Cash, Fawry, WhatsApp Web); su cobertura sobre marcas de otras regiones es desconocida.
- Riesgo de falsos negativos ante campañas noveles: al basarse en características estructurales heurísticas, puede no generalizar a técnicas de ofuscación no representadas en el entrenamiento (por ejemplo, acortadores legítimos, CDN comprometidos o redirecciones encadenadas).
- Riesgo de falsos positivos en dominios legítimos con alta entropía, TLDs poco comunes o Punycode legítimo (IDN reales en árabe).
- Sin información sobre el dataset de entrenamiento: se desconoce el equilibrio de clases, la procedencia de las muestras y si hubo fuga de datos entre entrenamiento y evaluación.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del runtime ONNX subyacente.
- Fecha de creación declarada en 2026-11-25, posterior a la fecha habitual de referencia: conviene verificar la vigencia y procedencia del artefacto antes de integrarlo.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de adopción ni revisión por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-AntiPhishing-URL-QR-ONNX
- Escáner en vivo: https://detector.elnemer-ai.com
- Sitio del autor: https://elnemer-ai.com

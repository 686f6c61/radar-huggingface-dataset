# Sagnik345/check-doc-ai-lite

## Resumen

Check-Doc-Ai Ensemble Lite es un clasificador de imágenes diseñado específicamente para detectar imágenes y documentos generados por IA, con un enfoque particular en facturas, recibos y fotografías que han pasado por compresión tipo WhatsApp o capturas de pantalla. Lo desarrolla Sagnik345 y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial. No es un modelo generativo ni un transformer de lenguaje: es un ensemble aprendido de dos detectores de imágenes IA de código abierto, combinados mediante regresión logística sobre sus log-odds y con un enrutador que separa documentos de fotografías.

El modelo resuelve un problema concreto: distinguir si una imagen o un documento (factura, recibo) es auténtico o ha sido fabricado por generadores como GPT-Image, Midjourney, FLUX, Stable Diffusion, Gemini o Seedream, incluso después de degradaciones típicas de mensajería (reescalado al 50-90 % y recompresión JPEG de calidad 50-85). La contribución del autor no es un nuevo backbone, sino la combinación aprendida de detectores existentes con pesos separados para documentos y fotos, y sin término de sesgo, lo que reduce falsos positivos sobre documentos genuinos.

Es relevante ahora porque la verificación de documentos financieros y la detección de contenido sintético en canales sociales son necesidades operativas crecientes, y este modelo ofrece un rendimiento cercano al mejor detector individual que combina (AUC 0,953 frente a 0,948) con licencia permisiva y requisitos de hardware modestos: funciona en una GPU de 6 GB o en CPU. La versión completa (no comercial) alcanza AUC 0,974.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble aprendido de 2 detectores de imágenes IA (regresión logística sobre log-odds) con enrutador documento/foto |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | int8 (detector Smaug); ONNX 8-bit desempaquetado para CPU (detector Detectra) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (según componentes del ensemble); no se detalla la asignación exacta por componente |

## Arquitectura y entrenamiento

El modelo es un ensemble de dos detectores de imágenes generadas por IA de código abierto, cuyas salidas se combinan mediante una regresión logística entrenada sobre los log-odds de cada detector. La innovación es el esquema de combinación: pesos aprendidos distintos para documentos y para fotografías (enrutamiento documento/foto), y ausencia de término de sesgo, de modo que un documento genuino pero dudoso no se empuja hacia la clase "IA". Según la model card, eliminar el sesgo redujo las falsas alarmas del 6,0 % al 4,4 % en desarrollo. Los pesos se ajustaron sobre la mitad de un benchmark público y se evaluaron sobre la otra mitad, sin solapamiento de imágenes entre ajuste y test.

Los datos de evaluación y ajuste provienen de OpenFake (`core/test` y `reddit/test`) y de TextRich en seis categorías de documentos, con un total de 1.390 imágenes, cada una puntuada en versión limpia y degradada. No se especifican en la información disponible el número de tokens de entrenamiento (no aplica), la composición exacta de los datasets de ajuste de los detectores base ni si hubo etapas de RLHF/DPO (no aplica a un clasificador). El componente Smaug está cuantizado a int8 y el componente Detectra usa ONNX de 8 bits desempaquetado para ejecución en CPU.

## Capacidades

- Clasificación binaria de imágenes: real frente a generada por IA (image-classification).
- Detección de documentos falsos: facturas y recibos sintéticos, con categorías de documento evaluadas vía TextRich.
- Robustez ante compresión social: mantiene rendimiento tras reescalado al 50-90 % y recompresión JPEG de calidad 50-85.
- Enrutamiento interno documento/foto con pesos de ensemble separados por tipo de entrada.
- Detección de imágenes de generadores concretos mencionados por el autor: GPT-Image, Midjourney, FLUX, Stable Diffusion, Gemini y Seedream.
- Ejecución en GPU de 6 GB o en CPU gracias a la cuantización int8 y al ONNX de 8 bits.
- API de una sola llamada: `CheckDocAi.load().predict(path)`.
- Idiomas: inglés (etiquetas y documentación); la clasificación es visual, no textual.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.

## Casos de uso

- Verificación de facturas y recibos en flujos de gastos: el modelo clasifica la imagen del documento como real o sintética antes de pasarla a un sistema de contabilidad, lo que permite bloquear facturas fabricadas con generadores de imagen en el punto de entrada.
- Antifraude en reembolsos y seguros: integrado como paso previo a la revisión manual, marca recibos sospechosos de ser generados por IA; su AUC de 0,931 en documentos tras compresión social lo hace adecuado para imágenes que llegan por correo o mensajería.
- Moderación de contenido en plataformas sociales: detecta fotos sintéticas en publicaciones subidas por usuarios, con un AUC de 0,869 en imágenes reales de Reddit degradadas, lo que permite priorizar la revisión humana en los casos de mayor riesgo.
- Triaje en verificación periodística: comprobación rápida de si una fotografía viral es probablemente generada por IA antes de una verificación manual más profunda, usando la puntuación continua del ensemble para ordenar la cola de revisión.
- KYC y onboarding documental: comprobación de que las fotografías de documentos de identidad o comprobantes aportados por el usuario no son imágenes sintéticas, ejecutable en CPU o en una GPU de 6 GB dentro del propio servicio.
- Procesamiento por lotes en CPU: al usar ONNX de 8 bits para uno de los detectores, puede desplegarse en servidores sin GPU para escanear archivos históricos de documentos y marcar candidatos a inspección.
- Preprocesado en pipelines de OCR: descartar o marcar documentos sintéticos antes de extraer datos con OCR, evitando introducir información fabricada en sistemas downstream.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre la mitad de test reservada del benchmark Check-Doc-Ai (OpenFake test, OpenFake Reddit test y TextRich; 1.390 imágenes, cada una limpia y degradada):

| Test (mitad reservada) | n | AUC (IC 95 %) | Accuracy | Mejor detector individual | Versión completa |
|---|---|---|---|---|---|
| Todas (limpias + sociales) | 1392 | 0,953 (0,943–0,964) | 87,4 % | Smaug (int8): 0,948 | 0,974 |
| Fotos, limpias | 396 | 0,980 (0,970–0,991) | 93,9 % | Detectra (8-bit): 0,975 | 0,988 |
| Fotos, sociales (JPEG + reescalado) | 396 | 0,957 (0,939–0,976) | 87,6 % | Detectra (8-bit): 0,963 | 0,972 |
| Reddit real-world, sociales | 100 | 0,869 (0,785–0,933) | 78,0 % | Smaug (int8): 0,875 | 0,896 |
| Documentos, limpios | 300 | 0,959 (0,934–0,974) | 84,7 % | Smaug (int8): 0,952 | 0,978 |
| Documentos, sociales | 300 | 0,931 (0,898–0,955) | 81,3 % | Smaug (int8): 0,925 | 0,968 |
| Documentos no vistos por itsfraud, sociales | 250 | 0,926 (0,894–0,952) | 79,6 % | Smaug (int8): 0,930 | 0,964 |

Tasa de imágenes reales marcadas erróneamente como IA (mitad reservada): 3,6 % para este modelo, frente al 3,1 % del mejor detector individual y el 38,2 % del peor. El autor indica que la diferencia frente al mejor detector individual está dentro del intervalo de confianza.

## Requisitos de hardware

- VRAM estimada: funciona en una GPU de 6 GB según la model card; no se detalla el consumo exacto por componente.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU con al menos 6 GB de VRAM es suficiente según el autor.
- CPU: soportado, gracias al ONNX de 8 bits desempaquetado del detector Detectra y a la cuantización int8 de Smaug.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (el autor no enumera modelos concretos como RTX 3060 o 4090).
- Opciones de despliegue: paquete Python propio `checkdocai` con `CheckDocAi.load("lite")`; dependencias torch, torchvision, transformers>=5.22, timm, peft, sentence-transformers, onnxruntime-gpu 1.22.0, onnx 1.17.0, pillow y huggingface_hub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | AUC (todas) | Accuracy | Licencia | Uso comercial | Disponibilidad |
|---|---|---|---|---|---|---|
| Check-Doc-Ai Ensemble Lite | Ensemble de 2 detectores, int8/ONNX | 0,953 | 87,4 % | Apache-2.0 | Sí | Hugging Face + GitHub |
| Check-Doc-Ai Ensemble (completo) | Ensemble completo | 0,974 | no disponible | no disponible en la información | No (versión no comercial según el autor) | Hugging Face |
| Smaug (int8) | Detector individual | 0,948 | no disponible | no disponible en la información | no disponible | componente del ensemble |
| Detectra (8-bit) | Detector individual | no disponible global; 0,975 en fotos limpias | no disponible | no disponible en la información | no disponible | componente del ensemble |

La comparativa se limita a los componentes y variantes citados por el autor; no se dispone de datos de otros detectores externos en la información proporcionada.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y figuran como no verificados en el model-index.
- Rendimiento notablemente inferior en imágenes reales de Reddit degradadas (AUC 0,869, accuracy 78,0 %) y en documentos no vistos por itsfraud (AUC 0,926): el dominio de evaluación importa.
- Tasa de falsos positivos del 3,6 % sobre imágenes reales: en producción implica que una fracción de documentos auténticos se marcará como IA y requerirá revisión humana.
- El modelo solo clasifica; no explica la decisión ni proporciona evidencia forense más allá de la puntuación.
- Idiomas: solo inglés en documentación y etiquetas; no se declaran capacidades multilingües.
- No es un detector universal: está optimizado para fotos, facturas y recibos, con evaluación centrada en OpenFake y TextRich; el comportamiento en otros tipos de documento o generadores no está caracterizado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la versión de mayor precisión (check-doc-ai-ensemble) es no comercial según el autor; conviene revisar los términos de los detectores base incluidos en el ensemble.
- Riesgo de degradación ante compresiones distintas de las evaluadas (por ejemplo, recodificaciones múltiples o formatos no JPEG) no cuantificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sagnik345/check-doc-ai-lite
- Versión completa (no comercial): https://huggingface.co/Sagnik345/check-doc-ai-ensemble
- Código fuente y aplicación: https://github.com/agastisagnik2004/check-doc-ai
- Benchmark reproducible: carpeta `bench/` del repositorio de GitHub
- Informe completo: `results.md` en el repositorio
- Dataset OpenFake: https://huggingface.co/datasets/ComplexDataLab/OpenFake
- Dataset TextRich: https://huggingface.co/datasets/Shuyiww/TextRich

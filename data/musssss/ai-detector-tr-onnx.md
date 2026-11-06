# musssss/ai-detector-tr-onnx

## Resumen

ai-detector-tr-onnx es una conversión a ONNX con cuantización int8 del clasificador de detección de texto generado por IA tabularisai/ai-text-detection, basado en ModernBERT-base. La conversión fue realizada por el usuario de Hugging Face musssss y está pensada para ejecutarse en el navegador mediante transformers.js, sin necesidad de servidor ni GPU.

El propósito original del modelo base es clasificar un texto como generado por IA o escrito por un humano. Esta variante se emplea en un detector de escritura con IA para textos en turco, un uso "off-label" ya que el modelo original fue entrenado sobre texto en inglés. Según los datos publicados por el autor de la conversión, el modelo alcanza un AUROC de 0,93 en su conjunto de prueba en turco (0,88 en pares humano/IA emparejados), aunque requiere subir el umbral de decisión: con 0,5 marca erróneamente como IA el 35 % del texto humano en turco.

Su relevancia radica en la combinación de tres factores: un tamaño muy reducido (el repositorio completo ocupa 0,2 GB gracias a la cuantización int8), ejecución 100 % local en el navegador vía ONNX Runtime Web, y licencia MIT, lo que permite integrarlo en aplicaciones web de detección de texto sin restricciones comerciales ni envío de datos a terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (clasificador de secuencia) |
| Parámetros totales | no disponible (tamaño del repo: 0,2 GB con cuantización int8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT-base soporta hasta 8192 tokens, pero no consta en la model card) |
| Tipos de cuantización | int8 dinámica (QInt8, ONNX) |
| Idiomas soportados | Turco (uso off-label; el modelo base fue entrenado en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx), compatible con transformers.js |

## Arquitectura y entrenamiento

El modelo base, tabularisai/ai-text-detection, es un ModernBERT-base adaptado a clasificación de texto binaria (IA vs. humano). ModernBERT es una familia de codificadores transformer que incorpora mejoras recientes como atención eficiente y soporte de secuencias largas. Los detalles del entrenamiento del modelo base (número de tokens, composición del dataset, procedimiento de ajuste fino) no están disponibles en la información proporcionada.

Esta variante no implica ningún reentrenamiento: se trata de una conversión sin modificación de pesos. El proceso documentado consta de dos pasos: exportación a ONNX mediante `optimum-cli export onnx --task text-classification`, seguida de cuantización dinámica a int8 con `onnxruntime.quantization.quantize_dynamic(weight_type=QInt8)`. La cuantización reduce drásticamente el tamaño del modelo y permite su ejecución en CPU dentro del navegador a través de ONNX Runtime Web y transformers.js.

## Capacidades

- Clasificación binaria de texto: etiqueta un fragmento como generado por IA o escrito por humano, con una puntuación de confianza.
- Detección de texto en turco: funciona sobre texto turco con rendimiento razonable (AUROC 0,93 según pruebas del autor de la conversión), aunque fue entrenado en inglés.
- Ejecución en navegador: diseñado para transformers.js, corre íntegramente en el cliente sin backend.
- Baja huella de memoria: el archivo cuantizado ocupa una fracción de los 0,2 GB del repositorio, apto para carga en dispositivos convencionales.
- No genera texto, no soporta tool calling, no tiene capacidades de razonamiento multi-paso ni modalidades de visión o audio.

## Casos de uso

- Detector de escritura con IA en el navegador: integración directa en una aplicación web (por ejemplo, un editor o plataforma educativa) para analizar textos en turco sin enviar datos a servidores, preservando la privacidad del usuario.
- Moderación de contenido en foros turcos: prefiltrado automático de comentarios o publicaciones sospechosas de ser generadas por IA antes de revisión humana, con bajo coste al ejecutarse en el cliente.
- Herramientas educativas: verificación de trabajos o redacciones de estudiantes en turco como indicador (no como prueba definitiva) de uso de IA generativa.
- Análisis offline: aplicaciones de escritorio o móviles sin conectividad constante que necesiten clasificación local gracias al formato ONNX.
- Prototipado rápido de pipelines de clasificación: base ligera para experimentar con transformers.js y ONNX Runtime Web en tareas de text-classification.
- Auditoría de contenido generado: análisis por lotes de corpus en turco en entornos con recursos limitados, aprovechando la cuantización int8 para inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, etc.) en la información disponible. Los únicos datos de rendimiento provienen del autor de la conversión para su caso de uso en turco:

| Métrica | Valor |
|---|---|
| AUROC en conjunto de prueba en turco | 0,93 |
| AUROC en pares humano/IA emparejados | 0,88 |
| Tasa de falsos positivos con umbral 0,5 | 35 % de texto humano turco marcado como IA |

Estos valores no son comparables directamente con benchmarks públicos del modelo base y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM: no aplicable en la configuración prevista; el modelo está diseñado para ejecutarse en CPU dentro del navegador. La cuantización int8 reduce la huella de memoria a un nivel compatible con dispositivos convencionales (repo completo: 0,2 GB).
- GPU recomendadas: no se requiere GPU. Para inferencia por lotes fuera del navegador, cualquier GPU moderna sería más que suficiente dado el tamaño del modelo.
- Consumer GPU: cabe con holgura en cualquier GPU doméstica; incluso es prescindible.
- Opciones de despliegue: transformers.js (caso previsto, en navegador), ONNX Runtime (Node.js o Python), y potencialmente cualquier runtime ONNX. No requiere vLLM, llama.cpp ni TGI al no ser un modelo generativo.
- Latencia y throughput: no disponibles. Al tratarse de un clasificador encoder cuantizado a int8, la inferencia por texto es típicamente de milisegundos en CPU moderna, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| musssss/ai-detector-tr-onnx | ModernBERT-base (int8 ONNX) | Turco (off-label) / inglés | ONNX int8 | MIT | Sí (transformers.js) |
| tabularisai/ai-text-detection | ModernBERT-base | Inglés | PyTorch/safetensors | MIT | Requiere conversión |
| Detectores de IA específicos para turco | no disponible | Turco | no disponible | no disponible | no disponible |

El autor de la conversión indica que no encontró ningún detector de texto IA entrenado específicamente para turco, y que este modelo clasificó mejor que las alternativas evaluadas en su conjunto de prueba en turco. No hay datos comparativos cuantitativos adicionales disponibles.

## Limitaciones y advertencias

- Uso off-label para turco: el modelo base fue entrenado en inglés. El rendimiento en turco (AUROC 0,93) procede de pruebas del propio autor de la conversión y no está verificado independientemente.
- Umbral de decisión crítico: con el umbral por defecto de 0,5, el 35 % del texto humano en turco se marca incorrectamente como generado por IA. Es imprescindible calibrar el umbral antes de uso en producción.
- Alto riesgo de falsos positivos: los detectores de texto IA en general producen falsos positivos significativos, especialmente en textos formales o no nativos. No deben usarse como prueba definitiva en decisiones de alto impacto (académicas, laborales).
- Posible degradación por cuantización: la cuantización int8 dinámica puede alterar ligeramente las puntuaciones respecto al modelo original en fp32; no se han publicado métricas de esta diferencia.
- Sesgos: heredados del dataset de entrenamiento del modelo base (no documentado en la información disponible), probablemente orientado a inglés y a distribuciones concretas de texto.
- Alcance limitado: es un clasificador binario; no detecta texto híbrido (humano editado con IA) de forma fiable, ni ofrece explicabilidad.
- Licencia MIT: sin restricciones para uso comercial, pero el crédito corresponde a los autores originales de tabularisai/ai-text-detection.
- Métricas del modelo base (datos de entrenamiento, tokens, procedimiento): no disponibles en la información proporcionada.

## Enlaces

- Modelo (conversión ONNX): https://huggingface.co/musssss/ai-detector-tr-onnx
- Modelo base: https://huggingface.co/tabularisai/ai-text-detection
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js

# genome-spy/BPNet-ONNX

## Resumen

BPNet-ONNX es una conversión al formato ONNX de los modelos BPNet del atlas ENCODE, desarrollados originalmente por el Kundaje Lab para predecir la unión de factores de transcripción a partir de secuencias de ADN mediante datos de ChIP-seq. GenomeSpy se encarga únicamente de la conversión de formato y de la validación numérica; no hay reentrenamiento, cuantización ni ajuste fino, y no se trata de una release respaldada por los autores originales. El modelo resuelve el problema de llevar modelos de biología computacional a entornos de inferencia ligeros y portables, incluyendo navegadores mediante onnxruntime-web y WebGPU.

Cada checkpoint es un modelo convolucional de aproximadamente 465 kB en float32, lo que permite cargar un pliegue concreto bajo demanda en lugar de descargar el atlas completo (unos 5,4 GB). La entrada es una secuencia one-hot de ADN de 2.114 posiciones (canales A/C/G/T) junto con controles nativos de perfil y de recuento, y la salida son logits de perfil por hebra y un logaritmo de recuento total. La conversión está en curso: el alcance fijado es de 2.339 experimentos y 11.695 pliegues, y solo se aceptan los artefactos enumerados en `accepted-manifest.json`.

La relevancia actual radica en que permite ejecutar inferencia de biología genómica directamente en el navegador con aceleración WebGPU, sin depender de TensorFlow, y con validación numérica frente a los modelos originales. Es una pieza de infraestructura para herramientas de visualización genómica como GenomeSpy, no un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional BPNet (modelo de unión de factores de transcripción sobre secuencia de ADN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 2.114 posiciones de ADN |
| Tipos de cuantizacion | no disponible (solo float32) |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | ONNX (float32) |

## Arquitectura y entrenamiento

Se trata de los modelos BPNet originales del atlas ENCODE, preservados sin reentrenamiento ni ajuste fino. La arquitectura es una red convolucional que recibe una secuencia de ADN codificada en one-hot con canales A/C/G/T (las bases N se codifican como todo cero) y produce dos cabezas: `profile_logits` con forma `[batch,2,1000]` (logits por hebra más y menos) y `log_counts` con forma `[batch,1]` (logaritmo natural del recuento total de lecturas compartido). La predicción cubre el intervalo genómico `[s+557, s+1557)` para una ventana de entrada `[s, s+2114)` en coordenadas hg38.

Los detalles de entrenamiento original (número de tokens, composición del dataset, uso de RLHF u otras técnicas) no se especifican en la información disponible; corresponden a los autores del Kundaje Lab y a las model cards originales preservadas bajo `source/<source-repository-name>/`. La innovación técnica de esta release es la conversión fiel a ONNX con controles nativos preservados, incluyendo una ruta de inferencia solo-secuencia usando ceros. Cada checkpoint aceptado pasa comprobaciones completas de ONNX y comparaciones float32 en CPU frente a TensorFlow 2.18.1 / tf-keras 2.18.0 con `rtol=2e-4, atol=1e-5`, cubriendo loci GATA2 y HBG1, complemento reverso, un SNV, bases ambiguas internas y ADN todo-N, con lotes dinámicos 1, 3 y 6.

## Capacidades

- Predicción de unión de factores de transcripción a partir de secuencia de ADN (perfil por hebra y recuento total de lecturas).
- Entrada con controles nativos emparejados WCE/Input por posición y controles de recuento por hebra independientes.
- Ruta de inferencia solo-secuencia usando ceros como controles, según lo permitido por el publicador.
- Inferencia en navegador mediante onnxruntime-web con WebGPU y fallback WASM.
- Procesamiento por lotes dinámicos (probados lotes 1, 3 y 6).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo biológico de propósito específico.
- No proporciona gradientes: la inferencia ONNX es solo hacia delante, por lo que no sirve para optimización de secuencia ni atribución.

## Casos de uso

- Visualización genómica interactiva: cargar un pliegue concreto bajo demanda (unos 465 kB) en una herramienta web para mostrar predicciones de unión sobre un intervalo del genoma, aprovechando la inferencia en navegador con WebGPU.
- Análisis de variantes en cliente: evaluar el efecto de un SNV sobre la predicción de unión comparando la salida del modelo con la secuencia de referencia, sin enviar datos genómicos a un servidor.
- Exploración de loci candidatos: usar la ventana de 2.114 posiciones para predecir perfiles en regiones de interés como GATA2 o HBG1, con controles nativos cuando estén disponibles.
- Integración en pipelines de investigación: desplegar los ONNX en servidores con ONNX Runtime CPU para reproducir resultados de los modelos originales de TensorFlow con tolerancias numéricas documentadas.
- Docencia y demostraciones: ejecutar inferencia de un modelo de biología computacional en un navegador estándar sin instalación de frameworks de deep learning.
- Validación de conversiones: usar los informes de paridad y los hashes retenidos para auditar la fidelidad de la conversión frente a los checkpoints originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks biológicos (AUPRC, correlación de perfiles, etc.) en la información disponible. Los únicos datos de rendimiento son tiempos de inferencia medidos en un dispositivo concreto (Apple M5 / Metal 3, Chromium 153.0.8010.12, ORT Web 1.31.1):

| Configuracion | Lote 1 | Lote 6 |
|---|---|---|
| WebGPU, controles sintéticos no nulos | 2,35–2,70 ms | 6,55–6,70 ms |
| WASM mono-hilo (fallback) | 8,4–8,75 ms | 50,6–53,2 ms |

Estas pruebas son representativas en un único dispositivo y navegador, no una cualificación WebGPU de todo el atlas. Algunas operaciones pueden ejecutarse en CPU.

## Requisitos de hardware

- VRAM estimada: muy baja; cada modelo float32 ocupa unos 465 kB, por lo que cabe holgadamente en cualquier GPU con soporte WebGPU.
- GPU recomendadas: cualquier adaptador compatible con WebGPU (probado en Apple M5 / Metal 3); en servidor, cualquier GPU con ONNX Runtime, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, con requisitos mínimos; también funciona en CPU mediante WASM.
- Opciones de despliegue: onnxruntime-web (WebGPU o WASM) en navegador, ONNX Runtime en CPU/servidor; requiere `onnxruntime-web@1.31.1` con módulo y assets WASM coincidentes servidos por HTTPS o localhost.
- Latencia y throughput: aproximadamente 2,35–2,70 ms por llamada con lote 1 en WebGPU (mediana en caliente, controles completos) y 6,55–6,70 ms con lote 6; en WASM mono-hilo, 8,4–8,75 ms y 50,6–53,2 ms respectivamente. La creación de sesión local excluye la latencia de descarga por internet.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos BPNet ni de alternativas comparables con parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La conversión está en curso: cobertura, exclusiones e identidades exactas de archivos se finalizarán cuando se hayan intentado todos los checkpoints de origen.
- La fidelidad de conversión no establece precisión biológica, independencia entre pliegues ni calibración de recuentos entre experimentos.
- Los metadatos de biosample, diana, ensayo, control de calidad y entrenamiento son afirmaciones del publicador original.
- No es una release respaldada por los autores originales (Kundaje Lab / ENCODE BPNet).
- Las dos hebras comparten un único softmax sobre los 2.000 logits y un único total `exp(log_counts)`; normalizar las hebras por separado o usar `expm1` produce resultados incorrectos.
- Los controles de recuento no deben derivarse de sumas de perfil; dos valores cero se reducen internamente a `log(2)` antes de la proyección final entrenada, y proporcionar ceros no elimina esa proyección ni su sesgo.
- Los controles sintéticos no nulos usados en pruebas numéricas no son controles experimentales medidos ni validación biológica.
- La inferencia es solo hacia delante: no hay gradientes para optimización de secuencia ni atribución.
- Las pruebas WebGPU son representativas en un único dispositivo y navegador; no constituyen una cualificación de todo el atlas, y algunas operaciones pueden ejecutarse en CPU.
- No hay integración con la interfaz o backend de Sequence Designer ni cualificación de PWA instalada en esta release.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos y anotaciones biológicas de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genome-spy/BPNet-ONNX
- Colección BPNet ONNX: https://huggingface.co/collections/genome-spy/bpnet-onnx-6b017b32434e2bea86bcbde4

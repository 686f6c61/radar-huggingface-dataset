# genome-spy/BATv1-ONNX

## Resumen

BATv1-ONNX es la conversión a formato ONNX del atlas BATv1, un conjunto de modelos de predicción de unión de factores de transcripción y proteínas asociadas al ADN humano mediante datos de ChIP-seq. El modelo original lo desarrolla programmable-genomics dentro del proyecto Cherimoya; esta conversión la publica GenomeSpy con fines de serialización y validación numérica, sin reentrenamiento ni cuantización. El resultado son grafos ONNX en float32 ejecutables tanto en servidor como en navegador mediante onnxruntime-web y WebGPU.

El modelo resuelve un problema de biología computacional: dado un fragmento de secuencia genómica de 2114 pares de bases (GRCh38/hg38) y señales de control de hebra, predice el perfil de ocupación (logits por posición) y el recuento total esperado de lecturas. La entrada es una ventana de ADN codificada en cuatro canales (A/C/G/T) más dos canales de control (hebra positiva y negativa).

La relevancia actual radica en que permite ejecutar inferencia genómica directamente en el navegador con WebGPU, eliminando la necesidad de infraestructura de servidor para exploración interactiva. El atlas completo comprende 17.145 checkpoints sobre 3.429 experimentos con cinco folds cada uno; esta conversión se publica de forma incremental y solo se considera completa cuando todos los checkpoints superan la puerta de aceptación numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para predicción de perfiles genómicos (arquitectura original de Cherimoya BATv1; detalles internos no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de entrada fija de 2114 pb; salida de 1000 posiciones |
| Tipos de cuantizacion | ninguno; solo float32 (sin cuantización aplicada) |
| Idiomas soportados | en (metadatos del modelo; la entrada es secuencia genómica, no texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (float32), con recibos `.onnx.json` por artefacto |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del atlas BATv1 de Cherimoya, orientada a la predicción de unión de factores de transcripción a partir de secuencia de ADN. La entrada es un tensor `sequence` de forma `[batch, 4, 2114]` en orden de canales A/C/G/T (las N se codifican como todo ceros) y un tensor `controls` obligatorio de forma `[batch, 2, 2114]` con recuentos de hebra positiva y negativa. Las salidas son `profile_logits` de forma `[batch, 2, 1000]` (logits brutos por posición y hebra) y `log_counts` de forma `[batch, 1]` (log1p del recuento total). La ventana de entrada `[s, s+2114)` produce la salida `[s+557, s+1557)`, con coordenadas cero-based y semiabiertas sobre GRCh38/hg38.

La conversión no aplica cuantización, reentrenamiento ni fine-tuning: los pesos y las cabezas de perfil y recuento permanecen en float32. La revisión de origen es `c631ebd86b46d78c2e239ee06f3fce5ff15f4ad9` y cada artefacto aceptado incluye un recibo con repositorio, revisión, ruta, SHA-256 original y convertido, contrato de tensores, errores numéricos en CPU y software de conversión. La decodificación correcta requiere aplanar conjuntamente todos los canales de perfil y las 1000 posiciones, aplicar un único softmax numéricamente estable, multiplicar por `max(expm1(log_counts), 0)` y reestructurar; BAT comparte un único perfil normalizado y un único recuento total entre hebras, por lo que aplicar softmax por hebra duplica incorrectamente el total.

## Capacidades

- Predicción de unión de factores de transcripción y proteínas asociadas al ADN humano (ChIP-seq) a partir de secuencia genómica.
- Predicción de perfil de ocupación por posición (1000 posiciones de salida) y de recuento total de lecturas.
- Puntuación de perturbaciones sobre la secuencia (SNVs, complemento reverso, N internas, secuencias con todo N).
- Inferencia en navegador mediante onnxruntime-web 1.31.1 con WebGPU.
- Inferencia en CPU mediante ONNX Runtime con paridad numérica validada frente a PyTorch.
- Soporte de lotes de tamaño 1, 3 y 6 en los casos de validación.
- Predicción solo-secuencia cuando los controles se fijan a cero (sin corrección de sesgo ni reproducción de inferencia con controles medidos).
- No proporciona gradientes para DeepLIFT, PISA ni Ledidi; cubre únicamente inferencia forward y puntuación de perturbaciones.

## Casos de uso

- Exploración interactiva de unión de factores de transcripción en el navegador: cargar un checkpoint concreto de experimento/fold y ejecutar inferencia con WebGPU sobre regiones genómicas seleccionadas, sin necesidad de backend, gracias a la conversión ONNX y al runtime web.
- Análisis de variantes en pipelines de genómica: evaluar el efecto de un SNV sobre el perfil de ocupación comparando `profile_logits` y `log_counts` antes y después de la mutación, usando los contratos de tensor documentados.
- Priorización de regiones candidatas: puntuar ventanas de 2114 pb alrededor de loci de interés para estimar ocupación esperada y seleccionar regiones para validación experimental por ChIP-seq.
- Integración en herramientas de visualización genómica: el formato ONNX y los recibos por artefacto permiten que aplicaciones web descarguen solo el experimento/fold necesario en lugar del atlas completo (1,5 GB de repositorio).
- Control de calidad de conversiones: usar los recibos `.onnx.json` y las tolerancias documentadas (`rtol=1e-4`, `atol=5e-5`) para verificar paridad numérica entre PyTorch y ONNX Runtime en nuevos despliegues.
- Docencia y prototipado en biología computacional: ejecutar modelos de genómica reales en portátiles con WebGPU, con tiempos de ejecución medidos en wall-clock sobre Apple Metal en Chromium 153.
- Evaluación de sesgo de control: comparar predicciones con controles medidos frente a controles a cero para estudiar la dependencia de la señal de control en un locus concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card documenta únicamente validación numérica de conversión: comparación de cabezas brutas y recuentos decodificados entre PyTorch nativo (implementación CPU float32 de Cherimoya) y ONNX Runtime CPU con `rtol=1e-4` y `atol=5e-5`, sobre casos que cubren GATA2 y HBG1, complemento reverso, un SNV, N internas, ADN todo N, lotes 1/3/6 y controles BAT cero/no cero. También se probó `ENCSR000AHD` fold 0 en WebGPU sobre Apple Metal en Chromium 153 con ORT Web 1.31.1, con todas las comparaciones superadas y dispatches de cómputo reales observados; los tiempos exactos de sesión en frío y en caliente están en `webgpu-validation.json`. No se publican métricas biológicas ni comparaciones de rendimiento predictivo en esta información.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 1,5 GB, pero cada artefacto se descarga por experimento/fold individual.
- GPU recomendadas: no se especifican modelos concretos; la validación WebGPU se realizó sobre Apple Metal (GPU integrada de Apple) en Chromium 153.
- Compatibilidad con GPU de consumo: no confirmada de forma general; se requiere un adaptador WebGPU funcional en el navegador.
- Despliegue: onnxruntime-web 1.31.1 con WebGPU (importando `onnxruntime-web/webgpu` y seleccionando explícitamente el execution provider `webgpu`); también ONNX Runtime en CPU para paridad numérica.
- Algunos nodos del grafo se asignan a CPU (incluido trabajo de formas de ORT); desactivar el fallback a CPU hace que la sesión sea rechazada.
- Latencia y throughput: no disponibles como cifras absolutas; la model card indica que la compilación inicial de shaders es más lenta que la inferencia en caliente y que el rendimiento reportado es wall-clock de `session.run`, incluyendo transferencias.
- No se reclama aceptación en PWA instalada, Safari, Firefox ni móvil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| genome-spy/BATv1-ONNX | no disponible | 2114 pb entrada, 1000 posiciones salida | ONNX float32 | CC BY 4.0 | Conversión de BATv1 para WebGPU/navegador |
| programmable-genomics/BATv1 | no disponible | 2114 pb entrada, 1000 posiciones salida | PyTorch (original) | CC BY 4.0 | Modelo fuente del atlas; incluye gradientes para DeepLIFT/PISA/Ledidi |
| Cherimoya CAT | no disponible | no disponible | no disponible | MIT (software) | Sin entrada de control, según la model card |

No se dispone de datos de benchmarks que permitan comparar rendimiento predictivo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La población del atlas está en progreso: el `manifest.json` completo solo se publicará cuando todos los checkpoints superen la puerta de aceptación; no debe inferirse cobertura completa de los ficheros presentes.
- Esta release no es una publicación respaldada por el equipo upstream; GenomeSpy solo aporta serialización y validación numérica.
- No se proporcionan gradientes para DeepLIFT, PISA ni Ledidi; solo inferencia forward y puntuación de perturbaciones.
- La paridad numérica de conversión no constituye validación biológica ni calibración de recuentos entre experimentos.
- Los controles a cero permiten predicción solo-secuencia pero no establecen corrección de sesgo ni reproducen la inferencia con controles medidos.
- La decodificación incorrecta (softmax por hebra) duplica el recuento total; es un error metodológico documentado.
- La validación WebGPU es representativa, no una garantía de que todos los checkpoints del atlas o todas las combinaciones navegador/GPU hayan sido probadas.
- No hay aceptación declarada en Safari, Firefox, móvil ni PWA instalada.
- La licencia CC BY 4.0 exige atribución a programmable-genomics, los autores de Cherimoya y los contribuidores de ENCODE; el software Cherimoya es MIT con revisión fijada.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo biológico, sus predicciones deben tratarse como estimaciones computacionales sujetas a validación experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/genome-spy/BATv1-ONNX
- Modelo base BATv1: https://huggingface.co/programmable-genomics/BATv1
- Repositorio de conversión y validación: no disponible como URL directa en la información proporcionada
- Paper de Cherimoya: no disponible en la información proporcionada
- Repositorio de software Cherimoya (MIT, revisión `73ce51841b6af672bcd423b969ce6f06dd40fc9d`): no disponible como URL directa en la información proporcionada

# elnemer7/ElNeMeR-Synthetic-Skin-Texture-GAN-Diffusion-ONNX

## Resumen

ElNeMeR Synthetic Skin Micro-Texture & Corneal Specular Portrait Detector es un clasificador binario/multiclase exportado a ONNX que forma parte de la flota de 35 modelos forenses del ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI). Su proposito es detectar retratos fotorrealistas generados por modelos de difusion como FLUX.1, Midjourney v7 o SD3.5, analizando dos senales concretas: la atenuacion del micro-contraste a nivel de poro en la piel y la inconsistencia en los reflejos especulares corneales bilaterales.

El modelo no procesa imagenes directamente. Recibe un tensor `float32` de forma `[batch_size, 20]` llamado `skin_eye_features`, lo que implica que el pipeline completo requiere un extractor de caracteristicas previo (no incluido en el repositorio) que transforme la imagen en esas 20 dimensiones. La salida es un vector de probabilidades sobre tres clases: piel y reflejo corneal organicos, microtextura sobresuavizada por difusion, o sintesis asimetrica de iris y cornea.

Es relevante en el contexto de la forense digital y la verificacion biometrica, donde la deteccion de deepfakes de retrato se ha convertido en un problema de seguridad operativa. Su licencia MIT y su compatibilidad con `onnxruntime` y `onnxruntime-web` (WASM) permiten desplegarlo tanto en servidor como en navegador. El repositorio tiene 0.0 GB de tamano declarado y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador sobre caracteristicas; exportado a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red, solo su interfaz: entrada `skin_eye_features` de 20 dimensiones en `float32` y salida de probabilidades sobre tres clases. El nombre del repositorio menciona "GAN-Diffusion", lo que sugiere que el entrenamiento pudo emplear datos generados por GAN y por modelos de difusion, pero no se detalla la composicion del dataset, el numero de muestras ni si hubo fases de aumento de datos o calibracion especifica.

La innovacion declarada es el enfoque en dos artefactos forenses concretos: la perdida de micro-contraste en la piel (poros, rugosidades) y la inconsistencia de los reflejos especulares en la cornea entre ambos ojos. El modelo se distribuye como grafo ONNX con Opset 14, compatible con `onnxruntime` y con `onnxruntime-web` compilado a WASM, lo que facilita su integracion en aplicaciones web sin backend dedicado.

## Capacidades

- Clasificacion de retratos en tres clases: piel y reflejo corneal organicos, microtextura sobresuavizada por difusion, y sintesis asimetrica de iris/cornea.
- Deteccion de artefactos de difusion en retratos fotorrealistas (FLUX.1, Midjourney v7, SD3.5 segun la model card).
- Inferencia en navegador mediante `onnxruntime-web` (WASM).
- Inferencia en servidor mediante `onnxruntime`.
- Entrada basada en caracteristicas preextraidas (20 dimensiones), no en pixeles directos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues ni de vision end-to-end.

## Casos de uso

- Verificacion de identidad en onboarding digital: el clasificador puede integrarse en un pipeline KYC que, tras extraer las 20 caracteristicas de piel y cornea de una selfie, marque la imagen como potencialmente sintetica antes de aprobar la cuenta.
- Moderacion de contenido en redes sociales: deteccion de avatares y retratos generados por difusion en perfiles, usando la salida de tres clases para priorizar revision humana sobre las imagenes marcadas como `diffusion_over_smoothed_microtexture`.
- Forense de medios periodisticos: verificacion de retratos atribuidos a personas reales en articulos o comunicados, con la clase `asymmetric_corneal_iris_synthesis` como indicador de manipulacion.
- Antifraude en documentos de identidad: analisis de la fotografia del titular en pasaportes o DNI digitalizados para detectar sustituciones generadas por IA.
- Investigacion academica en deteccion de deepfakes: uso como baseline reproducible (ONNX, MIT) para comparar con otros detectores sobre el mismo conjunto de caracteristicas.
- Despliegue en navegador para herramientas de verificacion ciudadana: al ser compatible con WASM, permite ejecutar la inferencia en el cliente sin enviar la imagen a un servidor, reduciendo riesgos de privacidad.
- Auditoria de datasets de entrenamiento: filtrado de retratos sinteticos que hayan podido colarse en corpus de imagenes usados para entrenar otros modelos.

## Benchmarks y rendimiento

La unica metrica publicada en la model card es una "Calibration Accuracy" del 97,31 %. No se especifica el conjunto de evaluacion, el tamano de la muestra, la distribucion de clases ni la metodologia de calibracion, por lo que el dato debe interpretarse con cautela.

| Metrica | Valor | Notas |
|---|---|---|
| Calibration Accuracy | 97,31 % | Sin detalle de dataset ni protocolo |
| MMLU | no disponible | No aplica |
| HumanEval | no disponible | No aplica |
| GSM8K | no disponible | No aplica |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio declara 0.0 GB y la entrada es un tensor de 20 `float32`, por lo que la huella en memoria del grafo es presumiblemente minima.
- GPU recomendadas: no disponibles; al ser un clasificador ligero, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, aunque no se confirma en la model card.
- Opciones de despliegue: `onnxruntime` (CPU/GPU) y `onnxruntime-web` (WASM en navegador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR Synthetic Skin (este) | Clasificador ONNX sobre caracteristicas | Tensor `[B, 20]` | 3 | MIT | Hugging Face |
| Detectores de deepfake basados en CNN sobre pixeles | Red convolucional end-to-end | Imagen RGB | Variable | Variable | Multiples repositorios |
| Detectores basados en frecuencia (p. ej. F3-Net, SPSL) | Analisis espectral | Imagen / parches | 2 | Variable | Repositorios academicos |

No se dispone de datos comparativos de rendimiento frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no procesa imagenes directamente: requiere un extractor de caracteristicas de 20 dimensiones que no se distribuye en el repositorio, lo que limita su uso out-of-the-box.
- La unica metrica publicada (97,31 % de "calibration accuracy") carece de protocolo de evaluacion, tamano de muestra y distribucion de clases.
- No se documenta el dataset de entrenamiento ni su cobertura frente a generadores distintos de FLUX.1, Midjourney v7 y SD3.5.
- Riesgo de falsos positivos en retratos con retoque cosmetico intenso, filtros de belleza o iluminacion artificial que alteren el micro-contraste de la piel.
- Riesgo de falsos negativos frente a generadores futuros o frente a imagenes sinteticas postprocesadas para reintroducir textura.
- Sin informacion sobre sesgos demograficos: el rendimiento puede variar segun tono de piel, edad, iluminacion o presencia de gafas.
- El repositorio declara 0.0 GB y 0 descargas, lo que impide verificar la integridad y el contenido real de los pesos.
- La licencia MIT permite uso comercial, pero la ausencia de validacion independiente desaconseja su uso como unico criterio en decisiones de alto impacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Synthetic-Skin-Texture-GAN-Diffusion-ONNX
- Plataforma forense del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com

# grace-cap/grace-deepfake-models

## Resumen

GRACE (Generalisable, Robust And Concept-Explainable detection) es un sistema de deteccion de deepfakes faciales publicado por el autor `grace-cap` en Hugging Face, fruto de un proyecto de fin de carrera (PW26_RJ_02) del Department of CSE de PES University (agosto-diciembre de 2026). No es un modelo generativo: es un clasificador de imagenes (`image-classification`) que decide si un rostro alineado de 224×224 ha sido manipulado, y lo hace mediante un mecanismo de concept bottleneck que expone las razones de la decision.

La arquitectura combina un backbone CLIP ViT-L/14 congelado (descargado via `timm`) sobre el que se entrenan adaptadores LoRA, una rama DCT, una fusion con compuerta, una cabeza de conceptos de 10 pistas forenses y una capa de decision final. El paquete incluye tambien un estudiante destilado EfficientNet-B0 de 4,7 M de parametros exportado a ONNX para inferencia en CPU.

Su relevancia actual reside en la combinacion de deteccion con explicabilidad verificable: el logit de "fake" es una suma ponderada de diez puntuaciones de concepto mas un residuo penalizado, de modo que la explicacion forma parte del propio computo y no es un post-hoc anadido. El repositorio ocupa 0,1 GB y la licencia es `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-L/14 congelado + adaptadores LoRA, rama DCT, fusion con compuerta, cabeza de conceptos (10 pistas) y capa de decision; estudiante EfficientNet-B0 destilado |
| Parametros totales | No disponible para el teacher (solo se entrenan las partes no congeladas); estudiante: 4,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes; entrada 224×224) |
| Tipos de cuantizacion | No disponible (se distribuye en `.pth` y `.onnx`) |
| Idiomas soportados | No disponible (modelo visual, no linguistico) |
| Licencia | `other` |
| Formato de pesos | `.pth` (teacher y student), `.onnx` + `.json` (student), `.yaml`/`.json` de configuracion, `SHA256SUMS` |

## Arquitectura y entrenamiento

El sistema es un transformer visual (CLIP ViT-L/14) con el backbone congelado y adaptadores LoRA entrenables, complementado por una rama DCT y una fusion con compuerta que combina ambas representaciones. Sobre esa representacion se anade una cabeza de conceptos que puntua diez pistas forenses nombradas (intensidad de blending, desajuste de color, desenfoque, sobrenitidez, remuestreo, boca editada, ojos editados, cara completa intercambiada, geometria desalineada y borde irregular) y una capa de decision cuyo logit de fake es la suma ponderada de esas puntuaciones mas un residuo pequeno penalizado. Las etiquetas de concepto se derivan de la receta de generacion de las falsificaciones de entrenamiento (self-blended images).

El entrenamiento usa FaceForensics++ (c23; Deepfakes, Face2Face, FaceSwap) con self-blended images; DFD y Celeb-DF v2 nunca se emplean para entrenar. Se incluye calibracion de temperatura ajustada sobre la validacion de FF++ y un umbral de decision calibrado. El estudiante EfficientNet-B0 se obtiene por destilacion del teacher para inferencia en CPU.

## Capacidades

- Clasificacion binaria de rostros manipulados frente a autenticos a partir de un recorte facial alineado de 224×224.
- Explicabilidad por conceptos: emite diez puntuaciones forenses interpretables que componen directamente el logit de decision.
- Deteccion de face swaps y manipulaciones parciales (boca, ojos, cara completa).
- Analisis de artefactos de baja senal: blending, desajuste cromatico, remuestreo, desenfoque, sobrenitidez y geometria.
- Inferencia en CPU mediante el estudiante ONNX de 4,7 M de parametros.
- Calibracion de probabilidades y umbral de decision ajustables.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues.

## Casos de uso

- Moderacion de contenido en plataformas: puntuar cada fotograma facial extraido de un video subido y usar el umbral calibrado para marcar candidatos a revision humana, con las diez pistas forenses como justificacion ante el moderador.
- Verificacion periodistica de material audiovisual: procesar fotogramas clave de un video recibido y aportar la explicacion por conceptos (p. ej. "borde irregular" o "desajuste de color") como evidencia documentada, no como prueba definitiva.
- Analisis forense de evidencia digital: el desglose por conceptos permite al perito distinguir entre artefactos de compresion y senales reales de manipulacion antes de elevar un informe.
- Deteccion de suplantacion en procesos de verificacion de identidad (KYC): comprobar que la selfie o el video de prueba de vida no procede de un face swap, combinando el clasificador con los controles biometricos existentes.
- Despliegue en entornos sin GPU: el estudiante ONNX de 4,7 M de parametros permite integrar el detector en servicios de CPU o en el borde para un prefiltrando de bajo coste.
- Investigacion en explicabilidad: servir de base reproducible para estudiar concept bottleneck models en vision forense, ya que el codigo, los resultados y el informe estan publicados en el repositorio de GitHub.
- Auditoria de datasets de deepfakes: puntuar lotes de imagenes sinteticas y revisar la distribucion de conceptos para caracterizar que artefactos introduce cada generador.

## Benchmarks y rendimiento

Resultados de AUC a nivel de video con tres semillas, antes del cambio a la lista oficial de Celeb-DF:

| Dataset | AUC (video-level, 3 semillas) |
|---|---|
| FaceForensics++ (FF++) | 0,997 |
| DFD | 0,951 |
| Celeb-DF | 0,901 (conjunto intermedio de 518 videos) |

Los resultados sobre la lista oficial de test de Celeb-DF se encuentran en el repositorio de GitHub; no se detallan en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, al no ser un modelo linguistico.

## Requisitos de hardware

- Estudiante ONNX (4,7 M de parametros): inferencia en CPU sin GPU; el peso del fichero ONNX es del orden de decenas de MB.
- Teacher (CLIP ViT-L/14 + LoRA + rama DCT): requiere GPU para uso comodo; el backbone congelado se descarga via `timm` al construir el modelo.
- VRAM estimada del teacher: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un ViT-L/14 en precision FP16 ocupa varios GB de pesos, pero no se confirma en la model card.
- GPU recomendadas: no especificadas. Para el teacher es razonable una GPU con al menos 8-16 GB de VRAM, pero este dato no esta confirmado.
- Cabe en GPU de consumo: el estudiante si; el teacher no esta verificado.
- Opciones de despliegue: ONNX Runtime para el estudiante; PyTorch (`timm` + pesos `.pth`) para el teacher. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento, licencia) para establecer una tabla de comparacion fiable. No disponible.

## Limitaciones y advertencias

- Deteccion visual basada en fotogramas de face swaps; puede ser enganada por generadores nuevos, en particular caras sinteticas basadas en difusion.
- Rendimiento degradado con compresion de video muy fuerte (H.264 CRF 40) y poses de cabeza extremas.
- La salida debe tratarse como evidencia, no como prueba concluyente.
- Entrenado solo con FF++ (c23) y self-blended images; DFD y Celeb-DF v2 no se usan en entrenamiento, lo que limita la generalizacion a dominios no vistos.
- El AUC reportado para Celeb-DF (0,901) corresponde a un conjunto intermedio de 518 videos, no a la lista oficial de test.
- Licencia `other`: no se especifican los terminos exactos de uso comercial; es necesario consultar el repositorio antes de un despliegue en produccion.
- Los datasets de entrenamiento no se redistribuyen con el modelo.
- Riesgo de sesgo no documentado en la model card (composicion demografica de FF++ no detallada).
- Proyecto academico con 0 descargas y 0 likes en el momento de la ficha; sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grace-cap/grace-deepfake-models
- Codigo, resultados e informe: https://github.com/pes1ug23cs178/CAPSTONE_PW_26_RJ_02
- Demo en vivo: https://huggingface.co/spaces/grace-cap/grace-deepfake-check

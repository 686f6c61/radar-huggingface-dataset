# shreshthsaini/brightrate-study-gemma4-12b-native-pq

## Resumen

El modelo `shreshthsaini/brightrate-study-gemma4-12b-native-pq` es un adaptador PEFT (LoRA) desarrollado por Shreshth Saini y colaboradores como parte del estudio BrightRate-LM, centrado en la evaluacion de calidad de video HDR generado por usuarios. Se basa en el modelo vision-language `google/gemma-4-12B-it` y esta disenado especificamente para probar una via de entrada denominada "native PQ", en la que los fotogramas RGB de 16 bits en espacio BT.2020 se introducen directamente en el proyector de parches sin pasar por la normalizacion previa a la proyeccion.

El adaptador se presenta como un "resultado negativo" del estudio: las metricas de correlacion con la calidad subjetiva son practicamente nulas (SROCC 0.0100, PLCC 0.0251), lo que indica que esta configuracion de entrada no es adecuada para la prediccion de calidad. Su proposito declarado es permitir la reproduccion de este resultado negativo y servir como referencia para la comunidad investigadora. No esta recomendado como predictor de calidad en ningun escenario practico.

El repositorio tiene un tamano de 0.3 GB, esta creado con la libreria PEFT y su pipeline declarado es `image-text-to-text`. La licencia no esta especificada en la informacion disponible, al igual que los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `google/gemma-4-12B-it` (modelo vision-language) |
| Parametros totales | no disponible (el adaptador es de 0.3 GB, el modelo base no se incluye) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `google/gemma-4-12B-it`, un modelo vision-language de 12 mil millones de parametros desarrollado por Google. La arquitectura del adaptador es LoRA con rango 16, alpha 32 y dropout 0.05, aplicada sobre las proyecciones del modelo. Ademas, el proyector de parches (patch projection) y la proyeccion vision-to-language son entrenables durante el ajuste.

El entrenamiento se realizo con dos epocas completas, un horizonte de programacion coseno de tres epocas, tasa de aprendizaje 1e-4, micro-batch de 1 y acumulacion de gradientes de 8. Los objetivos de calidad (MOS) se interpolaron a traves de cinco palabras de calidad. Los datos de entrenamiento provienen del conjunto BrightVQ, un dataset de video HDR generado por usuarios. La configuracion de entrada "native PQ" mantiene los fotogramas en espacio PQ (Perceptual Quantizer) sin normalizacion previa, lo que constituye la variable experimental principal del estudio.

## Capacidades

- El adaptador esta disenado exclusivamente para la tarea de evaluacion de calidad de video HDR, no para generacion de texto o razonamiento general.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso en la informacion disponible.
- El modelo base es multimodal (imagen-texto), pero el adaptador no anade capacidades nuevas; solo modifica la proyeccion de entrada para video.
- Las metricas reportadas indican que el adaptador no logra correlacionar con la calidad subjetiva, por lo que su capacidad predictiva es practicamente nula.
- No se dispone de informacion sobre soporte multilingue o capacidades especiales adicionales.

## Casos de uso

- Reproduccion de resultados cientificos: el adaptador permite replicar el experimento "native PQ" descrito en el articulo BrightRate-LM, facilitando la verificacion de los resultados negativos publicados.
- Investigacion en calidad de video HDR: puede servir como punto de comparacion para otros adaptadores o configuraciones de entrada dentro del mismo estudio, ayudando a aislar el efecto de la normalizacion previa.
- Desarrollo de metodologias de evaluacion: los investigadores pueden analizar por que esta configuracion falla y utilizar ese conocimiento para disenar mejores estrategias de representacion de video para VLMs.
- Educacion y formacion: como ejemplo de un experimento controlado con resultado negativo, puede utilizarse en cursos de aprendizaje automatico para ilustrar la importancia de la representacion de entrada en modelos multimodales.
- Auditoria de modelos: permite comprobar si el modelo base `gemma-4-12B-it` es sensible a la codificacion de color y luminancia, informacion util para otros proyectos que trabajen con video HDR.
- Integracion en pipelines de investigacion: el codigo de inferencia esta disponible en el repositorio BrightRate-LM, por lo que puede integrarse en flujos de evaluacion de calidad existentes para fines de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado corresponde al conjunto de prueba del split 0 de BrightVQ, con 420 videos:

| Metrica | Valor |
|---|---|
| SROCC | 0.0100 |
| PLCC | 0.0251 |
| KRCC | 0.0047 |
| RMSE | 13.3218 |

Estos valores indican una correlacion practicamente nula con las puntuaciones de calidad subjetiva, lo que confirma el caracter de "resultado negativo" del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al tratarse de un adaptador sobre un modelo de 12B, se requiere la VRAM del modelo base mas el adaptador. Para el modelo base `gemma-4-12B-it`, se estima un minimo de 24 GB en precision completa, reducible con cuantizacion.
- GPU recomendadas: no se especifican en la informacion disponible. Para el modelo base, GPUs como A100 (40/80 GB), H100 o RTX 4090 (24 GB) serian adecuadas dependiendo de la cuantizacion.
- En consumer GPU: el modelo base de 12B puede caber en una RTX 4090 con cuantizacion de 4 bits, pero el adaptador no modifica sustancialmente los requisitos.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `peft` de HuggingFace junto con el modelo base. No se mencionan opciones como vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros adaptadores o modelos de calidad de video. El adaptador es un resultado experimental especifico de un estudio, y no existen modelos publicados equivalentes con los que comparar directamente. Se indica "no disponible".

## Limitaciones y advertencias

- El adaptador es un resultado negativo: sus metricas de correlacion son practicamente nulas, por lo que no debe utilizarse como predictor de calidad en ningun contexto.
- No se ha especificado la licencia, lo que genera incertidumbre sobre los terminos de uso, especialmente para fines comerciales.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de contexto del adaptador en si, aunque estas dependen del modelo base.
- El adaptador esta pensado exclusivamente para reproducir un experimento cientifico; su uso fuera de ese ambito no esta justificado.
- La documentacion no incluye detalles sobre el rendimiento en otros conjuntos de datos ni sobre su comportamiento en condiciones distintas a las del estudio.
- El modelo base `gemma-4-12B-it` puede tener sus propias limitaciones (sesgos, alucinaciones, restricciones de uso), que no se detallan en la informacion proporcionada.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/shreshthsaini/brightrate-study-gemma4-12b-native-pq
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-12B
- Repositorio BrightVQ (dataset): https://github.com/shreshthsaini/BrightVQ
- Repositorio BrightRate-LM (codigo y modelos): https://github.com/shreshthsaini/BrightRate-LM
- Codigo de inferencia especifico: https://github.com/shreshthsaini/BrightRate-LM/blob/main/src/infer_gemma4.py
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/

# APLUX-Agora/CLIPSeg

## Resumen

CLIPSeg es un modelo de segmentación de imágenes guiada por texto: recibe una imagen y una descripción textual en inglés y devuelve una máscara de segmentación del mismo tamaño que la imagen original, además de las características completas del modelo. Este repositorio concreto, publicado por APLUX-Agora, no contiene los pesos originales en formato PyTorch, sino recursos ya convertidos y empaquetados para su despliegue en placas con SoC de Qualcomm dentro del ecosistema Agora (AIoT). El repositorio ocupa 0,2 GB e incluye binarios de contexto (`model.bin`) y ficheros `model.json` por cada precisión y SoC objetivo.

La relevancia de esta ficha no está en la arquitectura del modelo en sí (que corresponde al CLIPSeg original, no descrito en la información disponible), sino en el hecho de que ofrece builds medidos en hardware real de Qualcomm: QCS8550 sobre la placa Rhino Pi X1 con 61,0 ms en precisión W8A16, y QCS6490 sobre Rhino Pi A1 con 211,0 ms en la misma precisión. Es, por tanto, un artefacto de despliegue para visión por computador en el borde (edge), no un modelo de propósito general.

El modelo se distribuye bajo la licencia APLUX Model Farm, distinta de la del modelo fuente, cuyos términos deben consultarse por separado. No hay información sobre idiomas soportados, número de parámetros ni longitud de contexto en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fuente CLIPSeg; el repositorio contiene artefactos convertidos para Qualcomm QNN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada imagen + texto) |
| Tipos de cuantización | W8A16 (precisión por defecto medida); otras precisiones empaquetadas por SoC no detalladas |
| Idiomas soportados | no disponible (la descripción textual de segmentación se documenta en inglés) |
| Licencia | APLUX Model Farm License (recursos convertidos); licencia del modelo fuente sujeta a sus propios términos |
| Formato de pesos | binarios de contexto Qualcomm (`model.bin`), `model.json` por SoC y precisión; tags ONNX y QNN |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo fuente CLIPSeg en la documentación de este repositorio. Lo que sí se documenta es la cadena de conversión: los recursos se han convertido y empaquetado para ejecutarse sobre el runtime QNN de Qualcomm, con una estructura de directorios `targets/<SoC>/` que contiene `model.json` (precisión por defecto y rutas de variantes) y un subdirectorio por precisión. Los binarios de contexto se denominan `model.bin`; los paquetes multi-fichero se mantienen tal como los publica Model Farm.

La innovación técnica destacable no está en el modelo sino en el pipeline de despliegue: builds medidos en placas reales, preprocesado y postprocesado incluidos, runner y proyecto exportable disponibles desde la plataforma Agora. El repositorio incluye `NOTICE.md` y `SHA256SUMS` para verificación de integridad, lo que facilita la reproducibilidad en producción.

## Capacidades

- Segmentación de imágenes guiada por texto: dada una imagen y una descripción en inglés, devuelve una máscara del tamaño de la imagen original.
- Salida de características completas del modelo junto con la máscara (salida `out` en JSON además de `masks`).
- Entrada multimodal: imagen (`image`) y texto (`text`).
- Ejecución en hardware Qualcomm mediante QNN, con precisión W8A16 validada.
- Despliegue en placas AIoT concretas: QCS8550 (Rhino Pi X1) y QCS6490 (Rhino Pi A1).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.
- Capacidades multilingües: no disponibles; la descripción textual se documenta en inglés.

## Casos de uso

- Segmentación interactiva en el borde: un operario describe por texto el objeto a aislar ("the red valve") y el modelo devuelve la máscara en 61 ms sobre QCS8550, adecuado para inspección visual en línea de producción sin depender de la nube.
- Robótica móvil y AGV: segmentación de obstáculos o zonas de interés descritas textualmente, con latencia de 211 ms sobre QCS6490, suficiente para bucles de percepción de baja frecuencia en robots de almacén.
- Retirada de fondo en cámaras inteligentes: integración en pipelines de vídeo IP donde la máscara se genera en la propia cámara o en un hub AIoT, evitando enviar fotogramas a un servidor.
- Anotación asistida de datasets: uso del modelo para preetiquetar imágenes por descripción textual y acelerar el etiquetado manual en proyectos de visión.
- Control de calidad industrial: detección y aislamiento de defectos descritos por texto ("scratch on the surface") sobre imágenes de cámara en placas QCS8550 embarcadas.
- Realidad aumentada y señalización: generación de máscaras en tiempo real para superponer información sobre objetos identificados por descripción textual en gafas o pantallas montadas en el dispositivo.
- Prototipado sin hardware: la plataforma Agora permite probar el modelo en línea sin placa física, útil para validar la viabilidad antes de comprar el SoC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (mIoU, precisión de máscara, etc.) en la información disponible. Los únicos datos medidos son de latencia en hardware real:

| SoC · placa | Precisión | Latencia medida (Agora, precisión por defecto) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | W8A16 | 61,0 ms |
| QCS6490 · Rhino Pi A1 | W8A16 | 211,0 ms |

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU de escritorio; el modelo está empaquetado para el acelerador NPU/DSP de Qualcomm vía QNN.
- SoC soportados documentados: QCS8550 (placa Rhino Pi X1) y QCS6490 (placa Rhino Pi A1).
- GPU de escritorio (A100, H100, RTX 4090): no documentadas para estos artefactos; el repositorio no incluye pesos en safetensors ni GGUF para inferencia en GPU convencional.
- Despliegue: runtime Agora sobre QNN; descarga selectiva por SoC con `hf download --include "targets/<SoC>/*"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación).
- Latencia: 61,0 ms en QCS8550 y 211,0 ms en QCS6490 con W8A16, según mediciones de Agora.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de parámetros, contexto ni rendimiento de calidad de este artefacto, por lo que la comparación cuantitativa no es posible. Cualitativamente:

| Modelo | Tipo de artefacto | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| APLUX-Agora/CLIPSeg (este) | Binarios QNN empaquetados por SoC | QCS8550, QCS6490 | APLUX Model Farm (recursos) + licencia del modelo fuente | Hugging Face, 0 descargas, 0 likes |
| CLIPSeg original | Pesos PyTorch | GPU/CPU convencional | Según el modelo fuente | No verificada en esta búsqueda |
| Otros modelos de segmentación guiada por texto | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La descripción textual de segmentación se documenta en inglés; no hay evidencia de soporte multilingüe.
- Solo se han validado dos SoC (QCS8550 y QCS6490); en otros hardware Qualcomm el rendimiento y la compatibilidad no están garantizados.
- La licencia APLUX Model Farm cubre los recursos convertidos, pero el modelo fuente tiene sus propios términos que deben revisarse antes de uso comercial; la licencia es "other", no una licencia open source estándar.
- El repositorio no incluye pesos en formatos convencionales (safetensors, GGUF), lo que limita su uso fuera del ecosistema Agora/QNN.
- No hay información publicada sobre sesgos, tasa de alucinación (en este caso, falsos positivos de segmentación) ni robustez ante descripciones ambiguas.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-09), lo que sugiere un artefacto recién publicado sin validación comunitaria.
- La fecha de creación indicada (2026) es posterior a la fecha habitual de referencia; conviene verificar la vigencia de los enlaces antes de integrar en producción.
- Para producción en el borde, es necesario validar el postprocesado y el umbralizado de la máscara, que no se detallan en la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/APLUX-Agora/CLIPSeg
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/CLIPSeg/blob/main/LICENSE_MODEL_FARM.pdf
- Prueba online en Agora: https://mega.aidlux.com/models/clipseg
- Plataforma Agora: https://mega.aidlux.com
- Ficheros de procedencia e integridad: `NOTICE.md` y `SHA256SUMS` en el repositorio

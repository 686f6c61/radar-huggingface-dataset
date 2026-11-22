# Asher-1/WeVisOne-VL-GGML

## Resumen

WeVisOne-VL-GGML es una exportación a formato GGUF de los modelos WeVisOne-VL (2B y 4B) desarrollados originalmente por Tencent, preparada por el usuario Asher-1 para su uso con el runtime C++ ggml. El repositorio no contiene pesos en formato PyTorch ni safetensors, sino un conjunto de ficheros GGUF organizados en tripletas que cubren tres componentes: el stack de texto del VLM, la torre de visión con su proyector (mmproj) y un decodificador de máscaras para tareas a nivel de píxel.

El modelo resuelve tareas de visión-lenguaje con un énfasis poco habitual en tareas densas de píxel: segmentación de imagen, detección de objetos y alpha matting, además de image-to-text convencional. Esto lo diferencia de los VLM al uso, que suelen limitarse a describir o razonar sobre la imagen sin producir máscaras. La integración con ggml permite inferencia local en C++ sin depender de PyTorch.

La relevancia actual radica en que ofrece un pipeline multimodal completo (texto + visión + decodificador de máscaras) ejecutable en hardware de consumo gracias a las cuantizaciones Q4_K_M y Q8_0, con licencia Apache 2.0 sobre el código de Tencent. El tamaño del repositorio (25,6 GB) se explica por incluir todas las variantes de precisión de ambas familias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) con torre de visión, proyector y decodificador de máscaras separado; runtime ggml |
| Parametros totales | 9.511.460 (dato de safetensors del repo); familias de 2B y 4B según model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16, Q8_0 (8-bit), Q4_K_M (4-bit) para el VLM; mmproj siempre FP16; decodificador FP32 o FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (código de Tencent); condiciones de pesos según model cards upstream |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

La model card describe una organización en tripletas: un stack de texto VLM, una torre de visión con proyector multimodal (mmproj) y un decodificador de máscaras independiente para tareas de píxel. Las dos familias disponibles son 2B y 4B, y deben emparejarse por tamaño (2B con 2B, 4B con 4B). El decodificador de máscaras se distribuye en FP32 (parity-gated, equivalente al decodificador Python de referencia) y en FP16 (para entornos con memoria ajustada, con posible deriva en MAD). No se ofrece decodificador cuantizado porque los tensores de 48 elementos quedan por debajo de la granularidad de bloque de q8_0 y las estadísticas de GroupNorm/MSDA se degradan.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La model card tampoco detalla innovaciones de atención o decodificación. El trabajo de este repositorio es de exportación y empaquetado para ggml, no de entrenamiento.

## Capacidades

- Generación de texto a partir de imágenes (image-to-text).
- Segmentación de imagen a nivel de píxel mediante el decodificador de máscaras.
- Detección de objetos.
- Alpha matting (extracción de primer plano con canal alfa).
- Chat libre con imagen mediante llama.cpp (sin tareas de píxel).
- Pipeline completo de 11 tareas según el archivo de test incluido (25 imágenes con manifiesto).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio: no disponible en la información.

## Casos de uso

- Extracción de fondos en fotografía de producto: usar la tarea `matting` con la tripleta 2B f16 para generar PNG con canal alfa a partir de una foto y una query de objeto, sustituyendo herramientas de recorte manual.
- Segmentación interactiva en edición de imagen: el decodificador de máscaras permite obtener máscaras por objeto para pipelines de retoque o composición, con la variante 4B cuando se requiera mayor precisión.
- Detección de objetos en imágenes locales: ejecutar el pipeline con `--device cuda` para inventariar objetos en lotes de imágenes sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Descripción automática de imágenes en catálogos: usar el modo chat de llama.cpp con `--image` para generar descripciones textuales de productos o activos digitales.
- Procesamiento por lotes en el edge: la cuantización Q4_K_M del VLM 2B (1,20 GB) permite desplegar el stack de texto en dispositivos con poca memoria, verificando antes la paridad con la suite de pruebas.
- Integración en aplicaciones C++ nativas: el runtime ggml y la API C documentada permiten incrustar el pipeline en aplicaciones de escritorio o herramientas internas sin dependencias de Python.
- Automatización de tareas de visión en investigación: el archivo de test autocontenido con 25 imágenes y manifiesto de 11 tareas sirve para validar la paridad de cada cuantización antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (tripleta completa, aproximada por tamaños de fichero):
  - 2B FP16: VLM 3,80 GB + mmproj 0,76 GB + decodificador 0,04 GB ≈ 4,6 GB.
  - 2B Q8_0: VLM 2,02 GB + mmproj 0,76 GB + decodificador 0,04 GB ≈ 2,8 GB.
  - 2B Q4_K_M: VLM 1,20 GB + mmproj 0,76 GB + decodificador 0,04 GB ≈ 2,0 GB.
  - 4B FP16: VLM 8,23 GB + mmproj 0,78 GB + decodificador 0,04 GB ≈ 9,1 GB.
  - 4B Q8_0: VLM 4,38 GB + mmproj 0,78 GB + decodificador 0,04 GB ≈ 5,2 GB.
  - 4B Q4_K_M: VLM 2,53 GB + mmproj 0,78 GB + decodificador 0,04 GB ≈ 3,4 GB.
- GPU recomendadas: no especificadas en la información; el CLI admite `--device cuda`. Por tamaño, las variantes 2B caben en GPUs de consumo tipo RTX 3060/4060 y las 4B en RTX 4070/4080 o superiores.
- Cabe en GPU de consumo: sí, especialmente las variantes 2B en Q4_K_M y Q8_0; las 4B en Q4_K_M también son viables en GPUs de 8 GB o más.
- Opciones de despliegue: `wevisone-cli` (pipeline completo con tareas de píxel) y `llama-cli` de llama.cpp (chat libre, sin tareas de píxel). No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas de píxel | Formato | Licencia |
|---|---|---|---|---|---|
| WeVisOne-VL-GGML (este repo) | 2B / 4B | no disponible | Sí (segmentación, detección, matting) | GGUF | Apache 2.0 (código) |
| WeVisOne-VL (upstream Tencent) | 2B / 4B | no disponible | Sí | PyTorch (upstream) | según model card upstream |
| VLM genéricos tipo LLaVA/Qwen-VL | 2B–7B | variable | No (solo texto sobre imagen) | safetensors/GGUF | variable |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es una exportación comunitaria (Asher-1), no oficial de Tencent; la paridad con el modelo de referencia debe verificarse con la suite de pruebas incluida.
- La licencia Apache 2.0 cubre el código de Tencent; las condiciones de los pesos remiten a las model cards upstream y deben revisarse antes de uso comercial.
- El decodificador FP16 puede presentar deriva en MAD; la model card recomienda usar FP32 salvo en entornos con memoria ajustada y validar antes.
- La cuantización Q4_K_M del VLM está indicada para edge/batch y requiere verificación de paridad previa.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto.
- El uso con llama.cpp no soporta tareas de píxel; para segmentación o matting es obligatorio el CLI propio.
- El tamaño del repo (25,6 GB) exige espacio de disco considerable si se descargan todas las variantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asher-1/WeVisOne-VL-GGML
- Repositorio GitHub del runtime: https://github.com/Asher-1/WeVisOne-VL-GGML
- Código C++ y API C: https://github.com/Asher-1/WeVisOne-VL-GGML/tree/main/cpp_ggml
- Model card detallada: https://huggingface.co/Asher-1/WeVisOne-VL-GGML/blob/main/MODEL_CARD.md
- Datos de test: https://huggingface.co/Asher-1/WeVisOne-VL-GGML/blob/main/wevisone_vl_test_data.zip
- Modelo upstream 2B: https://huggingface.co/tencent/WeVisOne-VL-2B
- Modelo upstream 4B: https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio upstream: https://github.com/Tencent/WeVisOne-VL

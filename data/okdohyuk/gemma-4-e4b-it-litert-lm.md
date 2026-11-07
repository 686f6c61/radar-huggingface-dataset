# okdohyuk/gemma-4-E4B-it-litert-lm

## Resumen

`okdohyuk/gemma-4-E4B-it-litert-lm` es un espejo (mirror) fijado del modelo `litert-community/gemma-4-E4B-it-litert-lm`, publicado por el usuario okdohyuk para su uso en la aplicación Nogmi. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia byte a byte del árbol upstream en el commit `28299f30ee4d43294517a4ac93abd6163412f07f`, donde únicamente difieren el `README.md` y el fichero `LICENSE`. El contenido real es Gemma 4 E4B en formato LiteRT-LM (`.litertlm`), un artefacto empaquetado para despliegue en Android, iOS, escritorio, IoT y web.

Gemma es la familia de modelos abiertos ligeros de Google, construida con la misma investigación y tecnología que los modelos Gemini. La variante E4B está pensada para casos de uso en dispositivo (on-device), de modo que el usuario puede ejecutar generación de IA de forma privada y sin conexión a internet. El repositorio ocupa 3,7 GB e incluye un único fichero de pesos.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de despliegue LiteRT-LM (no un checkpoint estándar de transformers); por otro, advierte de que se trata de un mirror de terceros con licencia declarada de forma ambigua (la model card indica Apache-2.0, mientras que las etiquetas de Hugging Face muestran `license:other`). Para producción conviene referenciar siempre el repositorio upstream `litert-community/gemma-4-E4B-it-litert-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de la familia Gemma 4 de Google; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | no disponible (la nomenclatura "E4B" sugiere una variante efectiva de 4B, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como fichero `.litertlm` preempaquetado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 segun la model card; las etiquetas del repo indican `license:other` (discrepancia a verificar en upstream) |
| Formato de pesos | LiteRT-LM (`.litertlm`), un unico fichero `gemma-4-E4B-it.litertlm` |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en los materiales proporcionados. La model card del mirror no reproduce la ficha tecnica del modelo original; solo documenta el proceso de espejado y verificacion de integridad (sha256 de LFS y sha1 de blobs git) frente al arbol upstream.

Lo unico verificable es el formato de distribucion: LiteRT-LM, el runtime de Google para ejecutar modelos en dispositivo. El artefacto `.litertlm` empaqueta pesos y metadatos para su carga directa en el runtime LiteRT, lo que implica que no es un checkpoint en safetensors ni GGUF y que no se puede cargar con transformers, vLLM o llama.cpp sin conversion previa. Para detalles de arquitectura y entrenamiento debe consultarse la documentacion oficial de Gemma de Google y el repositorio upstream.

## Capacidades

- Generacion de texto conversacional (sufijo `-it` indica ajuste para instrucciones).
- Ejecucion en dispositivo (on-device) en Android, iOS, escritorio, IoT y web mediante el runtime LiteRT.
- Inferencia offline: no requiere conexion a internet, lo que habilita privacidad de datos en el propio dispositivo.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Vision, audio o modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Asistentes integrados en aplicaciones moviles: el artefacto `.litertlm` se carga directamente en el runtime LiteRT de Android o iOS, permitiendo un asistente conversacional que funciona sin red y mantiene los datos del usuario en el dispositivo.
- Funciones de accesibilidad offline: resumen y reescritura de texto en aplicaciones de escritorio o moviles sin enviar contenido a servidores externos, adecuado para entornos con requisitos de privacidad estrictos.
- Procesamiento en el borde (edge/IoT): despliegue en dispositivos con recursos limitados donde no es viable alojar un servidor de inferencia, aprovechando el empaquetado ligero del formato LiteRT-LM.
- Aplicaciones web con inferencia local: ejecucion en navegador mediante el runtime LiteRT para web, util para demos o herramientas que deben operar sin backend.
- Prototipado de producto con Gemma 4 E4B: uso del mirror para validar la integracion en la aplicacion Nogmi antes de migrar al repositorio upstream, dado que el contenido es byte a byte identico.
- Evaluacion comparativa de despliegue on-device: banco de pruebas para medir latencia y consumo en dispositivos reales frente a otras variantes de Gemma empaquetadas en LiteRT-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 3,7 GB, lo que da una cota superior del espacio de almacenamiento necesario para el artefacto.
- GPU recomendadas: no disponible; el formato LiteRT-LM esta orientado a aceleracion en dispositivo (CPU, GPU movil, NPU) mas que a GPU de servidor.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: runtime LiteRT (Android, iOS, escritorio, IoT y web). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion de formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| okdohyuk/gemma-4-E4B-it-litert-lm (este repo) | no disponible | no disponible | `.litertlm` | Apache-2.0 / `other` (discrepancia) | Mirror de terceros en Hugging Face |
| litert-community/gemma-4-E4B-it-litert-lm | no disponible | no disponible | `.litertlm` | Apache-2.0 segun model card | Repositorio upstream en Hugging Face |
| publicsh/gemma-4-E4B-it-litert-lm | no disponible | no disponible | `.litertlm` | no disponible | Otro mirror en Hugging Face |

Los tres artefactos corresponden a la misma variante Gemma 4 E4B en formato LiteRT-LM; las diferencias son de custodio del repositorio, no de modelo. No se dispone de datos de rendimiento para comparar con alternativas de otros formatos (GGUF, safetensors).

## Limitaciones y advertencias

- Es un mirror de terceros, no el repositorio oficial: para produccion debe referenciarse `litert-community/gemma-4-E4B-it-litert-lm` y verificar el commit `28299f30ee4d43294517a4ac93abd6163412f07f`.
- Discrepancia de licencia: la model card declara Apache-2.0, pero las etiquetas del repositorio en Hugging Face muestran `license:other`. Es imprescindible revisar la licencia del upstream antes de uso comercial.
- El mirror solo garantiza integridad byte a byte en el momento de la subida; no hay compromiso de actualizacion ni de seguimiento de cambios upstream.
- Formato propietario de empaquetado (`.litertlm`): no se puede cargar con las herramientas habituales (transformers, vLLM, llama.cpp, Ollama, TGI) sin conversion.
- Sin informacion publicada sobre sesgos, riesgo de alucinacion, limites de contexto o cobertura idiomatica en los materiales disponibles; deben consultarse en la documentacion oficial de Gemma.
- El repositorio no registra descargas ni likes, lo que indica nula traccion de la comunidad y ausencia de validacion externa.
- No apto como referencia de evaluacion tecnica: al carecer de ficha propia, no aporta datos de rendimiento ni de entrenamiento.

## Enlaces

- Repositorio del mirror: https://huggingface.co/okdohyuk/gemma-4-E4B-it-litert-lm
- Repositorio upstream: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Otro mirror de la misma variante: https://huggingface.co/publicsh/gemma-4-E4B-it-litert-lm

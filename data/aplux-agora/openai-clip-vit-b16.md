# APLUX-Agora/OpenAI-CLIP-ViT-B16

## Resumen

OpenAI-CLIP-ViT-B16 es un paquete de recursos desplegables derivado del modelo CLIP ViT-B/16 de OpenAI, publicado por APLUX-Agora dentro de su plataforma Agora orientada a despliegue en hardware Qualcomm. No se trata de un modelo entrenado desde cero por APLUX-Agora, sino de una conversion y validacion del CLIP original para su ejecucion sobre SoCs Qualcomm mediante el stack QNN (Qualcomm Neural Network), con procesamiento previo y posterior oficial de Model Farm.

El modelo resuelve tareas de clasificacion y recuperacion imagen-texto: recibe una imagen y un texto y produce etiquetas, embeddings y una salida estructurada en JSON. Su relevancia actual radica en que permite ejecutar CLIP en dispositivos AIoT de borde (edge) con latencias medidas en placas reales, en este caso 15,3 ms en FP16 sobre un SoC QCS8550 montado en la placa Rhino Pi X1.

El repositorio ocupa 0,3 GB y contiene binarios de contexto (`model.bin`) organizados por SoC y precision, junto con metadatos (`model.json`) y ficheros de integridad (`SHA256SUMS`, `NOTICE.md`). La licencia del paquete convertido es la APLUX Model Farm License, distinta de la licencia del modelo original de OpenAI, cuyos terminos deben consultarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo ViT-B/16 con torre de texto (CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (unica precision documentada) |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (modelo original: terminos de OpenAI) |
| Formato de pesos | Binarios QNN (`model.bin`) por SoC y precision; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es CLIP ViT-B/16, una arquitectura de dos torres: un Vision Transformer con parches de 16x16 para la imagen y un transformer de texto, entrenados de forma contrastiva para alinear representaciones de imagen y texto en un espacio comun. Esta ficha describe el paquete convertido por APLUX-Agora, no el proceso de entrenamiento original de OpenAI, del que no se aportan datos en la informacion disponible (numero de tokens, composicion del dataset ni uso de RLHF).

La innovacion tecnica del paquete reside en la conversion y validacion del modelo para el stack QNN de Qualcomm, con procesamiento previo y posterior oficial de Model Farm y verificacion placa a placa. El repositorio incluye directorios `targets/<SoC>/` con `model.json` que define la precision y las rutas de variante por defecto, y binarios de contexto nombrados `model.bin`; los paquetes multi-fichero se conservan tal como los publica Model Farm.

## Capacidades

- Clasificacion de imagenes: el pipeline declarado es `image-classification`, con salida de etiquetas.
- Recuperacion y alineamiento imagen-texto: acepta entradas de imagen y de texto y produce embeddings, lo que habilita busqueda semantica y comparacion de similitud entre modalidades.
- Salida estructurada: genera una salida JSON (`out`) ademas de la etiqueta y el embedding.
- Despliegue en borde: ejecucion sobre SoCs Qualcomm mediante QNN, con procesamiento previo y posterior incluido.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicionales: no disponibles mas alla de la entrada de imagen y texto descrita.

## Casos de uso

- Clasificacion de imagenes en dispositivos AIoT: el modelo puede etiquetar imagenes directamente en una placa QCS8550 con una latencia de 15,3 ms en FP16, adecuado para inspeccion visual en tiempo real en el borde sin depender de la nube.
- Busqueda semantica de imagenes por texto: gracias a la salida de embeddings, se pueden indexar imagenes y recuperarlas mediante consultas en lenguaje natural, por ejemplo en catalogos de producto o archivos multimedia.
- Moderacion y filtrado de contenido visual: el alineamiento imagen-texto permite puntuar la correspondencia entre una imagen y una descripcion, util para validar contenido subido por usuarios.
- Etiquetado automatico de imagenes para pipelines de datos: la salida de etiquetas y embeddings facilita la anotacion previa y el enriquecimiento de datasets en entornos con conectividad limitada.
- Vision por computador en robotica y automatizacion industrial: la ejecucion local en hardware Qualcomm permite integrar clasificacion visual en lineas de produccion o robots sin latencia de red.
- Sistemas de accesibilidad: descripcion y clasificacion de escenas en dispositivos de borde para aplicaciones asistivas, aprovechando el bajo consumo del SoC.
- Prototipado rapido sin hardware: la plataforma Agora permite probar el modelo en linea antes de desplegarlo en placa, segun la model card.

## Benchmarks y rendimiento

La model card solo documenta una medida de latencia en hardware real, no resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

| SoC / placa | Precision | Latencia medida |
|---|---|---|
| QCS8550 / Rhino Pi X1 | FP16 | 15,3 ms |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete esta orientado a aceleradores QNN en SoCs Qualcomm, no a GPU convencionales.
- GPU recomendadas: no aplica; el destino documentado es el SoC QCS8550.
- Compatibilidad con GPU de consumo: no disponible para el paquete QNN; el modelo CLIP original podria ejecutarse en GPU, pero no se documenta en esta publicacion.
- Opciones de despliegue: stack QNN de Qualcomm mediante los recursos de Model Farm; la model card no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 15,3 ms en FP16 sobre QCS8550 (Rhino Pi X1), unica medida publicada.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenAI-CLIP-ViT-B16 (APLUX-Agora) | no disponible | no disponible | APLUX Model Farm License | Paquete QNN para SoCs Qualcomm |
| CLIP ViT-B/16 original (OpenAI) | no disponible en la informacion | no disponible | Terminos de OpenAI | Pesos originales en repositorios de OpenAI |
| Alternativas de clasificacion imagen-texto | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El paquete esta limitado a los SoCs y precisiones validados; solo se documenta QCS8550 en FP16, por lo que otros destinos no estan verificados.
- No se publican pesos en formatos estandar (safetensors, GGUF), lo que dificulta su uso fuera del stack QNN.
- La licencia APLUX Model Farm License es distinta de la del modelo original; es necesario revisar ambos conjuntos de terminos antes de un uso comercial.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; CLIP puede reflejar sesgos de sus datos de entrenamiento originales.
- Cobertura idiomatica no especificada; no se indica que idiomas soporta la torre de texto.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/OpenAI-CLIP-ViT-B16
- Prueba en linea en Agora: https://mega.aidlux.com/models/openai-clip-vit-b16
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/OpenAI-CLIP-ViT-B16/blob/main/LICENSE_MODEL_FARM.pdf

# adityavardhansharma/EchoSwift-700M-LiteRT

## Resumen

EchoSwift-700M-LiteRT es el paquete de binarios cuantizados en formato Google LiteRT (`.litertlm`) del modelo base adityavardhansharma/EchoSwift-700M, un modelo de generacion de texto de aproximadamente 700 millones de parametros construido sobre la familia Liquid Foundation Model (LFM2) de Liquid AI. El autor, adityavardhansharma, publica estas variantes especificamente para su despliegue en dispositivo dentro de EchoFlow, una aplicacion Android de busqueda y generacion de artefactos HTML.

El repositorio no contiene pesos en safetensors ni GGUF, sino cuatro paquetes compilados para el runtime LiteRT-LM de Google, optimizados para NPU de Qualcomm Hexagon/Adreno y APU de MediaTek. Se ofrecen dos niveles de cuantizacion (INT8 dinamico y INT4 blockwise de 32) y dos ventanas de contexto (4.096 y 8.192 tokens), con tamanos que van de los 458,5 MB a los 770,8 MB.

Su relevancia radica en que ejemplifica el flujo de publicacion de modelos pequenos para inferencia totalmente local en moviles: compilacion con FlatBuffer, prefill en buckets y una tasa declarada del 100 % de adherencia al esquema de salida de la aplicacion (triggers de busqueda de una linea y artefactos HTML de un solo fichero).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Liquid Foundation Model, LFM2); detalles no disponibles |
| Parametros totales | aproximadamente 700M (segun denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens (variantes base) y 8.192 tokens (variantes `_8k_ekv8192`) |
| Tipos de cuantizacion | INT8 dinamico (`dynamic_wi8_afp32`) e INT4 blockwise-32 (`wi4b32` OCTAV) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-1.0 (campo `license: other` con `license_name: lfm-open-1.0`) |
| Formato de pesos | LiteRT-LM (`.litertlm`), FlatBuffer compilado |

Variantes publicadas:

| Fichero | Contexto | Cuantizacion | Tamano | Hardware objetivo |
|---|---|---|---|---|
| `EchoSwift-700M_int8.litertlm` | 4.096 | INT8 dinamico | 770,8 MB | Moviles Android modernos (NPU Snapdragon, APU Dimensity) |
| `EchoSwift-700M_int4.litertlm` | 4.096 | INT4 blockwise-32 | 458,5 MB | Moviles con RAM limitada |
| `EchoSwift-700M_int8_8k_ekv8192.litertlm` | 8.192 | INT8 dinamico | 770,8 MB | Contexto extendido |
| `EchoSwift-700M_int4_8k_ekv8192.litertlm` | 8.192 | INT4 blockwise-32 | 460,0 MB | Contexto extendido en moviles economicos |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base. Los tags indican que deriva de la familia Liquid Foundation Model (LFM2), lo que situa el modelo en la linea de modelos compactos de Liquid AI, pero no se aportan detalles sobre numero de capas, dimension del hidden state, tipo de atencion ni si incorpora componentes hibridos (convolucionales o SSM). Tampoco se documenta el proceso de entrenamiento: no hay informacion sobre volumen de tokens, composicion del dataset, fases de SFT, RLHF o DPO.

La innovacion tecnica documentada esta en el proceso de compilacion y empaquetado, no en el entrenamiento. Los binarios se compilan con FlatBuffer y 11 buckets de prefill (longitudes de 1 a 1024) junto con una cache KV de 4.096 posiciones, lo que permite al runtime de LiteRT-LM reutilizar grafos precompilados para distintas longitudes de entrada y reducir el coste de compilacion en el dispositivo. Las variantes de 8.192 tokens se identifican con el sufijo `ekv8192`, que corresponde a una cache KV ampliada.

## Capacidades

- Generacion de texto en dispositivo, orientada a busqueda y a la produccion de artefactos HTML de un solo fichero.
- Cumplimiento estricto del esquema de EchoFlow: triggers de busqueda en una sola linea con el formato `search: query`, con una tasa de exito declarada del 100 %.
- Generacion de artefactos HTML moviles autocontenidos (single-file).
- Inferencia local sin conexion en Android, con aceleracion por NPU/APU.
- Soporte de conversaciones multi-turno dentro de la ventana de contexto (4.096 u 8.192 tokens).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Busqueda asistida en movil: el modelo genera triggers `search: query` de una sola linea que la aplicacion intercepta para lanzar busquedas web, con una tasa de adherencia al esquema del 100 % declarada por el autor.
- Generacion de mini-aplicaciones HTML en el dispositivo: produce artefactos HTML de un solo fichero que EchoFlow renderiza directamente, sin necesidad de backend ni de llamadas a la nube.
- Asistentes offline con privacidad estricta: al ejecutarse integramente en el telefono, los datos del usuario no salen del dispositivo, lo que encaja en escenarios de salud, finanzas personales o entornos corporativos con restricciones de salida de datos.
- Despliegue en moviles de gama media y baja: la variante INT4 de 458,5 MB permite ejecutar el modelo en dispositivos con RAM limitada donde un modelo de 700M en FP16 no cabria con holgura.
- Conversaciones largas en movil: las variantes de 8.192 tokens cubren chats prolongados y prompts con contexto extenso (por ejemplo, pegar un documento y pedir un resumen o una transformacion).
- Prototipado rapido de funciones de IA en apps Android: al estar empaquetado como `.litertlm`, se importa directamente en EchoFlow y sirve como banco de pruebas para validar prompts y esquemas de salida antes de migrar a un modelo mayor.
- Aceleracion por NPU en dispositivos Qualcomm y MediaTek: los binarios estan compilados para Hexagon/Adreno y APU de MediaTek, lo que permite reducir consumo energetico frente a inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es la tasa del 100 % de cumplimiento del esquema de salida de EchoFlow (EchoFlow Schema Pass Rate), que mide adherencia al formato y no calidad linguistica o de razonamiento.

## Requisitos de hardware

- VRAM/RAM estimada: entre 458,5 MB (INT4, 4K) y 770,8 MB (INT8, 4K y 8K) de pesos; a ello hay que sumar la cache KV y el overhead del runtime LiteRT-LM. Las variantes de 8.192 tokens requieren mas memoria para la cache KV que las de 4.096.
- Hardware objetivo declarado: telefonos Android modernos con NPU Qualcomm Snapdragon (Hexagon/Adreno) o APU MediaTek Dimensity.
- GPU de escritorio: no aplica; el formato `.litertlm` esta pensado para el runtime LiteRT-LM en Android, no para CUDA.
- Despliegue: exclusivamente mediante LiteRT-LM e importacion en EchoFlow. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EchoSwift-700M-LiteRT | aproximadamente 700M | 4.096 / 8.192 | LiteRT-LM (`.litertlm`) para Android | lfm-open-1.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Modelo base EchoSwift-700M | aproximadamente 700M | no disponible | pesos originales (formato no especificado) | no disponible | HuggingFace |
| Alternativas de la familia LFM2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para estimar el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a un modelo de 700M: la ventana de contexto de 4.096 tokens limita la cantidad de contexto que puede manejar y aumenta la probabilidad de perder informacion en conversaciones largas.
- Idiomas soportados no declarados: no hay garantia de calidad fuera del ingles, y menos aun en castellano.
- El repositorio contiene unicamente binarios `.litertlm`; no se ofrecen safetensors, GGUF ni pesos en precision completa, lo que impide reutilizar el modelo fuera del runtime LiteRT-LM.
- La licencia `lfm-open-1.0` (campo `license: other` en HuggingFace) incluye terminos especificos de Liquid AI; es obligatorio revisar el texto completo antes de cualquier uso comercial, ya que puede imponer restricciones de atribucion o de uso.
- El modelo esta disenado para el esquema concreto de EchoFlow (`search: query` y HTML single-file); su rendimiento fuera de ese esquema no esta evaluado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El modelo base es de un autor individual, no de Liquid AI; la relacion con LFM2 se deduce de los tags y no esta verificada en la model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT
- Modelo base: https://huggingface.co/adityavardhansharma/EchoSwift-700M
- Aplicacion EchoFlow: https://echoflow.adityavs.space
- Licencia LFM Open 1.0: https://raw.githubusercontent.com/Liquid-AI/LFM/main/LICENSE
- Descarga INT8 4K: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT/resolve/main/EchoSwift-700M_int8.litertlm
- Descarga INT4 4K: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT/resolve/main/EchoSwift-700M_int4.litertlm
- Descarga INT8 8K: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT/resolve/main/EchoSwift-700M_int8_8k_ekv8192.litertlm
- Descarga INT4 8K: https://huggingface.co/adityavardhansharma/EchoSwift-700M-LiteRT/resolve/main/EchoSwift-700M_int4_8k_ekv8192.litertlm

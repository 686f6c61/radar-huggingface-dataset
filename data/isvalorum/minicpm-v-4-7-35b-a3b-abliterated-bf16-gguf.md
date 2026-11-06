# IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-BF16-GGUF

## Resumen

MiniCPM-V-4.7-35B-A3B-Abliterated-BF16-GGUF es una distribucion en formato GGUF BF16 del modelo multimodal MiniCPM-V 4.7 35B-A3B, previamente sometido a un proceso de *abliteration* (eliminacion de direcciones de rechazo en el espacio de activaciones) por parte de distributedcognition. Lo publica IsValorum dentro de su serie de cuantizaciones APEX. Se trata de un modelo image-text-to-text con arquitectura MoE de 34.659.889.792 parametros totales (aproximadamente 34,7 mil millones) y, segun el nombre del checkpoint, 3 mil millones de parametros activos por token.

El modelo base original es `openbmb/MiniCPM-V-4.7-35B-A3B`, y esta version conserva identica arquitectura y mapa de tensores, con 74 tensores editados durante la abliteracion. El interes practico radica en que ofrece una variante sin censura (uncensored) de un modelo multimodal de gran tamano, empaquetada en BF16 GGUF para su uso con llama.cpp y con soporte de decodificacion especulativa mediante un draft model separado (DSpark).

El repositorio contiene unicamente el checkpoint de texto en BF16 (69,4 GB, 733 tensores de texto) y la plantilla de chat. La torre de vision y los tensores de DSpark se distribuyen como archivos complementarios en otro repositorio del mismo autor, por lo que no es un paquete multimodal autocontenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), basada en MiniCPM-V 4.7 35B-A3B |
| Parametros totales | 34.659.889.792 (34,7 B) |
| Parametros activos | 3 B (segun denominacion A3B del checkpoint; no verificado de forma independiente) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 32768`) |
| Tipos de cuantizacion | BF16 (este repo); vision en Q8_0, DSpark en Q4_K_M y Q6_K (repos complementarios) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16), plantilla de chat en Jinja |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) de 34,7 B de parametros totales y 3 B activos por token, integrado en un pipeline multimodal image-text-to-text. La parte de texto cuenta con 733 tensores en el checkpoint BF16, mientras que la torre de vision se distribuye por separado como `mmproj-Q8_0.gguf`. El checkpoint principal no incluye tensores MTP (multi-token prediction); la decodificacion especulativa se resuelve con un modelo draft externo denominado DSpark, disponible en Q4_K_M y Q6_K.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el material proporcionado. La modificacion respecto al modelo original consiste en una abliteracion aplicada por distributedcognition sobre 74 tensores, sin aplicar Heretic, que elimina las direcciones de activacion asociadas al rechazo de peticiones. Los datos de evaluacion de dicha abliteracion son responsabilidad de ese autor y no se han verificado de forma independiente en este archivo.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Comprension de imagenes y respuesta en formato image-text-to-text (requiere el mmproj de vision complementario).
- Razonamiento multi-turno dentro de una ventana de contexto configurable (el ejemplo oficial usa 32.768 tokens).
- Decodificacion especulativa opcional mediante el draft model DSpark, con el objetivo de aumentar el throughput.
- Comportamiento sin censura: la abliteracion reduce los rechazos ante peticiones que el modelo original declinaria.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de audio ni modo thinking explicito.

## Casos de uso

- Procesamiento de documentos escaneados con imagen y texto: el modelo puede recibir una pagina como imagen y generar una descripcion o extraccion estructurada, usando el mmproj de vision junto al checkpoint de texto.
- Asistencia conversacional multi-turno en ingles o chino: con contexto configurable hasta 32.768 tokens en el ejemplo oficial, permite mantener historiales largos en un unico prompt.
- Investigacion sobre alineacion y seguridad: la variante abliterada sirve para estudiar como la eliminacion de direcciones de rechazo afecta a la utilidad y a los sesgos del modelo, comparandola con el original.
- Despliegue local en estaciones de trabajo con llama.cpp: el formato GGUF BF16 permite ejecutar el modelo con `llama-cli` o `llama-server` sin depender de frameworks propietarios.
- Generacion de descripciones de imagenes en pipelines por lotes: combinando el checkpoint de texto con el mmproj Q8_0 se puede construir un servicio de captioning o alt-text para catalogos.
- Aceleracion de inferencia con decodificacion especulativa: el draft DSpark en Q4_K_M o Q6_K permite experimentar con tecnicas de speculative decoding sobre un MoE de 34,7 B.
- Prototipado de asistentes sin restricciones de contenido para entornos de investigacion controlados, donde los rechazos del modelo alineado resultan un obstaculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint BF16 ocupa 69,4 GB en disco; para cargarlo completo en VRAM se necesitan al menos 70 GB solo para los pesos de texto, mas el mmproj de vision y el contexto KV.
- GPU recomendadas para BF16 completo: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2 x RTX 4090 de 24 GB con offload parcial).
- No cabe en una unica GPU de consumo en BF16. Para GPUs de 24 GB seria necesario recurrir a cuantizaciones menores (Q4_K_M, Q5_K_M) no incluidas en este repositorio.
- Despliegue previsto con llama.cpp (`llama-cli`, `llama-server`); el ejemplo oficial usa `-ngl 99 -c 32768`. No se documenta compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion especulativa con DSpark esta pensada para mejorar el rendimiento, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-Abliterated-BF16-GGUF (este) | 34,7 B totales / 3 B activos | no disponible (ejemplo: 32.768) | Imagen + texto | Apache-2.0 | GGUF BF16 |
| openbmb/MiniCPM-V-4.7-35B-A3B (original) | 34,7 B totales / 3 B activos | no disponible | Imagen + texto | Apache-2.0 | safetensors |
| distributedcognition/MiniCPM-V-4.7-35B-A3B-abliterated | 34,7 B totales / 3 B activos | no disponible | Imagen + texto | Apache-2.0 | safetensors |
| Otras alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores.

## Limitaciones y advertencias

- La abliteracion elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sesgado; no es adecuada para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones especificas de esta variante.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- El repositorio no es autocontenido: la vision (mmproj Q8_0) y el draft DSpark residen en otro repositorio, lo que complica el despliegue reproducible.
- El checkpoint es BF16 sin cuantizar; su tamano (69,4 GB) lo hace inviable en GPUs de consumo sin cuantizacion adicional.
- No hay tensores MTP en el checkpoint principal; la aceleracion especulativa depende de un archivo externo.
- Los datos de evaluacion de la abliteracion pertenecen a distributedcognition y no han sido verificados de forma independiente.
- La licencia Apache-2.0 permite uso comercial, pero el autor del modelo base y el de la abliteracion no ofrecen garantias sobre el comportamiento del modelo modificado.
- El modelo tiene 112 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-BF16-GGUF
- Archivos del repositorio: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-Abliterated-BF16-GGUF/tree/main
- Modelo base (abliterado): https://huggingface.co/distributedcognition/MiniCPM-V-4.7-35B-A3B-abliterated
- Repositorio con vision y DSpark: https://huggingface.co/IsValorum/MiniCPM-V-4.7-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo original de openbmb: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Apoyo al autor: https://ko-fi.com/isvalorum

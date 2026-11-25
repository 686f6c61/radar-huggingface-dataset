# pgmharikrishnan/Hy4-flash-MLX-Serve-3.5bit

## Resumen

Hy4-flash-MLX-Serve-3.5bit es un artefacto de cuantizacion derivado del checkpoint Tencent Hy4-flash-FP8, preparado por el usuario pgmharikrishnan para su uso con MLX Serve sobre Apple Silicon. No es una publicacion oficial de Tencent: se trata de una conversion afin (quantization affine) de los pesos originales, empaquetada en safetensors y acompanada de una tabla externa Engram de 39,6 GB. El modelo resultante ocupa 121,5 GB en el repositorio y requiere aproximadamente 69,7 GiB de memoria residente en inferencia.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 187.577.401.881 parametros totales (unos 187,6 mil millones) y capacidad multimodal image-text-to-text, ya que incluye una torre de vision (`model-vit.safetensors`) y un componente DFLY2. La ficha tecnica del checkpoint original no esta incluida en la informacion disponible, por lo que los datos de contexto, numero de parametros activos o composicion del dataset de entrenamiento no se pueden confirmar aqui.

Su relevancia es practica: permite ejecutar un modelo MoE multimodal de gran tamano en Macs Apple Silicon con memoria unificada de 128 GB o mas, mediante un servidor compatible con la API de OpenAI (`/v1/chat/completions`). La generacion coherente, la consistencia de prefijo, las proyecciones Engram y la tokenizacion estan verificadas de extremo a extremo segun el autor, aunque el soporte depende de un PR activo en mlx-serve (ddalcu/mlx-serve#1251).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal image-text-to-text, con torre de vision y componente DFLY2 |
| Parametros totales | 187.577.401.881 (~187,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group size 64; expertos `gate_up_proj` 3-bit, `down_proj` 4-bit, ultimas 6 capas 4-bit, proyecciones no-expertas y de atencion 8-bit, embeddings y `lm_head` 4-bit, routers MoE 8-bit; tabla Engram 4-bit con group size 32 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (tencent-hy-license), licencia "other" |
| Formato de pesos | safetensors (141 shards del tronco, `model-vit.safetensors`, `model-dfly2.safetensors`) mas `engram_table.bin` binario externo |

## Arquitectura y entrenamiento

La arquitectura del checkpoint base es un transformer MoE con 41 capas de mezcla de expertos identificadas en el recetario de cuantizacion (`model.layers.{1..41}.mlp.gate`), complementado con una torre de vision y un componente DFLY2. El modelo incorpora un mecanismo denominado Engram, materializado como una tabla externa de 39.600.385.352 bytes cuantizada a 4 bits con group size 32, que se almacena fuera del tronco en `engram_table.bin` y se recolecta desde disco en tiempo de ejecucion. El tronco contiene 2.738 tensores distribuidos en 141 shards.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el checkpoint original. La model card del derivado describe detalles de implementacion del motor mas que del entrenamiento: aplicacion de sesgos `value_proj.bias` y `key_projs.*.bias` antes de la normalizacion, redondeo E4M3 por cabeza para el round-trip FP8 (alineado con el PR upstream #50903), offsets acumulativos por cabeza de hash segun el tamano de vocabulario de cada cabeza, y reconocimiento del token `<｜hy_end:opensource｜>` (ID 120025) como terminador de turno. La cache de prefijo generica esta excluida para Hy4 porque el modelo mantiene el historial de KV y Engram en el propio modulo.

## Capacidades

- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`) gracias a la torre de vision incluida.
- Razonamiento y respuesta a preguntas generales; el ejemplo verificado en la model card responde correctamente a una pregunta factual simple.
- Soporte de plantilla de chat mediante `chat_template.jinja`.
- Generacion determinista con `temperature: 0.0`, util para pruebas de regresion.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni un listado concreto de idiomas soportados.

## Casos de uso

- Inferencia local en Apple Silicon: el pack esta disenado para ejecutarse con mlx-serve en Macs con 128 GB o mas de memoria unificada, lo que permite usar un MoE de ~187,6 mil millones de parametros sin GPU dedicada.
- Prototipado de asistentes multimodales: la combinacion de torre de vision y tronco de lenguaje permite construir demos de descripcion de imagenes y dialogo sobre contenido visual en un entorno de desarrollo local.
- Evaluacion de cuantizacion: sirve como referencia para medir el impacto de una receta 3/4/8-bit sobre un MoE grande, comparando la salida con el checkpoint FP8 original.
- Servicio compatible con OpenAI en red local: al exponer `/v1/chat/completions`, se puede conectar a clientes existentes para pruebas de integracion sin modificar el codigo del cliente.
- Investigacion sobre mecanismos Engram: la separacion de la tabla Engram en un fichero externo facilita experimentar con el componente de memoria/hash sin recargar el tronco completo.
- Pruebas de regresion de motores de inferencia: el autor verifica consistencia de prefijo, sesgos de proyeccion Engram y tokenizacion, lo que lo convierte en un banco de pruebas para implementaciones de mlx-serve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria residente en inferencia: aproximadamente 69,7 GiB, segun la model card.
- Memoria unificada recomendada: 128 GB o mas (M1/M2/M3/M4 Max o Ultra).
- Asignacion de memoria del servidor: el ejemplo oficial usa `MLX_MAX_RESIDENT_MEM=96GB`.
- Almacenamiento: 121,5 GB de payload total; la tabla Engram sola ocupa 39,6 GB.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este artefacto, que es especifico de MLX y Apple Silicon.
- Despliegue: mlx-serve, compilado con Zig (`zig build -Doptimize=ReleaseFast`) desde la rama `hy4-flash-support`; requiere Git LFS y los 152 ficheros del pack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-MLX-Serve-3.5bit | ~187,6 mil millones | no disponible | safetensors MLX + Engram externo | Tencent Hy License 1.0 | Hugging Face, 721 descargas |
| tencent/Hy4-flash-FP8 (base) | no disponible en esta ficha | no disponible | safetensors FP8 | Tencent Hy License 1.0 | Hugging Face (oficial) |
| tencent/Hy4-flash (base) | no disponible en esta ficha | no disponible | safetensors | Tencent Hy License 1.0 | Hugging Face (oficial) |

No se dispone de datos de benchmarks ni de especificaciones completas de los checkpoints base en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un derivado no oficial: no ha sido publicado por Tencent y su correcto funcionamiento depende de un PR aun activo en mlx-serve (#1251).
- La licencia Tencent Hy License 1.0 se aplica tambien a las obras derivadas y cuantizadas; es necesario revisar el texto completo en `LICENSE` antes de cualquier uso comercial.
- El artefacto esta restringido a Apple Silicon con MLX; no es portable a CUDA ni a otros runtimes sin reconversion.
- La cuantizacion 3/4/8-bit puede degradar la calidad respecto al checkpoint FP8 original; no se aportan metricas de degradacion.
- La tabla Engram se carga desde disco en tiempo de ejecucion, lo que anade requisitos de I/O y almacenamiento (39,6 GB adicionales).
- La cache de prefijo generica esta deshabilitada para este modelo, lo que puede afectar al rendimiento en conversaciones largas.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de idioma; al ser un derivado de un modelo no evaluado aqui, deben asumirse los riesgos habituales de los modelos de lenguaje de gran escala.
- El repositorio registra 0 likes y 721 descargas, lo que indica una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pgmharikrishnan/Hy4-flash-MLX-Serve-3.5bit
- Modelo base FP8: https://huggingface.co/tencent/Hy4-flash-FP8
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash-FP8/blob/main/LICENSE
- PR de mlx-serve: https://github.com/ddalcu/mlx-serve/pull/1251
- Issue relacionado: https://github.com/ddalcu/mlx-serve/issues/1241
- Rama publica de ejecucion: https://github.com/pgmharikrishnan/mlx-serve/tree/hy4-flash-support

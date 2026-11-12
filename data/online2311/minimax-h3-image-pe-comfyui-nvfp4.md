# online2311/MiniMax-H3-Image-PE-ComfyUI-NVFP4

## Resumen

MiniMax-H3-Image-PE-ComfyUI-NVFP4 es un empaquetado derivado del codificador de texto MiniMax-H3-Image-PE, desarrollado por MiniMax y redistribuido por el usuario online2311. Su funcion no es generar imagenes directamente, sino actuar como codificador de texto y motor de expansion de prompts dentro de flujos de trabajo de ComfyUI, transformando instrucciones breves del usuario en descripciones detalladas que alimentan el modelo de generacion de imagenes MiniMax-H3-Image. El repositorio original esta pensado para text-to-image, mientras que este empaquetado se publica con la etiqueta de pipeline text-generation.

El modelo base MiniMax-H3-Image-PE deriva de Qwen3.8-27B, lo que situa la arquitectura en la familia transformer de aproximadamente 27.000 millones de parametros, aunque el dato exacto de parametros del PE no se detalla de forma explicita en la informacion disponible. La innovacion principal de este repositorio es la conversion del checkpoint oficial en formato modelopt NVFP4 a un unico fichero safetensors compatible con el cargador de ComfyUI, reordenando los nibbles FP4 y el layout de las escalas para que la carga sea valida sin recuantizar los pesos.

Su relevancia actual radica en que permite ejecutar el codificador de texto en precision FP4 dentro de ComfyUI, reduciendo el peso del fichero a 16,69 GiB y facilitando su integracion en pipelines locales de generacion de imagenes. No obstante, la licencia comunitaria impone restricciones territoriales severas (excluye la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos), lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B); codificador de texto con cuantizacion NVFP4 |
| Parametros totales | no disponible (modelo base derivado de Qwen3.8-27B, ~27B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (FP4 empaquetado en U8 con escalas F8_E4M3 y escalas escalares F32) |
| Idiomas soportados | en, zh |
| Licencia | MiniMax-H3-Image Community License Agreement (con restricciones territoriales) |
| Formato de pesos | safetensors (fichero unico `minimax_h3_image_pe_nvfp4.safetensors`, 16,69 GiB) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer derivado de Qwen3.8-27B, reutilizado como codificador de texto y motor de expansion de prompts para el sistema MiniMax-H3-Image. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos deben considerarse no disponibles. Lo que si se documenta es que el checkpoint oficial ya se distribuye en NVFP4 mediante modelopt, con capas cuantizadas que incluyen `weight` (FP4 empaquetado en U8), `weight_scale` (escalas de bloque F8_E4M3), `weight_scale_2` (escalar F32) e `input_scale`.

La aportacion tecnica de este repositorio es puramente de empaquetado: convierte las cuatro particiones oficiales en un unico fichero safetensors, reordena los nibbles FP4 (intercambio de los 4 bits altos y bajos) y ajusta el layout tiled de `weight_scale` para cuBLAS, ademas de eliminar los tensores `input_scale` y anadir etiquetas `comfy_quant` por capa. No se recuantizan los pesos. El fichero contiene 2.387 tensores, de los cuales 401 son capas cuantizadas NVFP4, con recuento por dtype de 802 U8, 783 BF16, 401 F32 y 401 F8_E4M3. No incluye bloque `__metadata__` y no es un reemplazo directo de los shards oficiales de Transformers o SGLang.

## Capacidades

- Generacion de texto y expansion de prompts: transforma instrucciones concisas en descripciones detalladas para alimentar el generador de imagenes.
- Codificacion de texto para text-to-image: actua como text encoder dentro del pipeline de MiniMax-H3-Image.
- Soporte multilingue limitado a ingles y chino (en, zh).
- Integracion con ComfyUI mediante `CLIPLoader` (type=minimax) y el nodo `TextGenerateV2`.
- Carga en precision NVFP4 con multiplicacion de matrices en precision completa (`full_precision_matrix_mult: true`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Expansion de prompts en ComfyUI: cargar el fichero en `models/text_encoders/`, seleccionar type=minimax en `CLIPLoader` y conectar la salida al nodo `TextGenerateV2` para enriquecer prompts breves antes de la generacion de imagen.
- Pipelines locales de text-to-image: usar el codificador en FP4 para reducir el peso en disco y memoria frente al checkpoint oficial en BF16, manteniendo la fidelidad del codificador.
- Prototipado de flujos creativos: iterar rapidamente sobre descripciones generadas automaticamente en herramientas de diseno grafico asistido.
- Investigacion sobre cuantizacion FP4: estudiar el comportamiento de un codificador de ~27B en NVFP4 dentro de un entorno ComfyUI, comparando con los shards oficiales.
- Generacion de descripciones detalladas para catalogos o assets: automatizar la redaccion de prompts ricos a partir de palabras clave en ingles o chino.
- Evaluacion de licencias y despliegue regional: probar el modelo en entornos fuera de las jurisdicciones excluidas para validar su viabilidad antes de solicitar autorizacion comercial a MiniMax.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 16,69 GiB; se requiere al menos esa cantidad de VRAM para cargarlo en GPU, mas overhead de activaciones y contexto.
- GPU recomendadas: no disponibles de forma explicita; por tamano, se orienta a GPUs profesionales con 24 GB o mas (A100, H100, RTX 4090/5090) para carga completa en FP4.
- Cabe en GPU consumer: previsiblemente en RTX 4090 (24 GB) y superiores, aunque no se confirma en la informacion.
- Opciones de despliegue: ComfyUI con `CLIPLoader` (type=minimax) y `TextGenerateV2`; no se documentan otros motores (vLLM, llama.cpp, TGI) para este empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-PE-ComfyUI-NVFP4 (este) | ~27B (base Qwen3.8-27B) | no disponible | NVFP4 | MiniMax-H3-Image Community License (excluye UE, RU, Corea del Sur y EE. UU.) | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image-PE (oficial) | ~27B (base Qwen3.8-27B) | no disponible | modelopt NVFP4 en 4 shards | MiniMax-H3-Image Community License | Hugging Face |
| Qwen/Qwen3.8-27B (modelo origen) | ~27B | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Restriccion territorial severa: la licencia prohibe uso, reproduccion, modificacion, distribucion o exhibicion fuera del Territorio Aplicable, que excluye la Union Europea, el Reino Unido, Corea del Sur y Estados Unidos.
- Umbral comercial: si los ingresos anualizados superan 1 millon de USD o se ofrece servicio alojado a terceros, se requiere autorizacion previa por escrito de MiniMax.
- Obligacion de atribucion: los productos o servicios comerciales deben mostrar de forma prominente "MiniMax-H3-Image" en la interfaz de usuario.
- Distribucion: toda redistribucion debe incluir copia de la licencia, fichero NOTICE y aviso de modificacion de los ficheros alterados.
- No es un reemplazo directo de los shards oficiales: el layout FP4 y las escalas estan adaptados a ComfyUI, por lo que no funciona en Transformers o SGLang sin conversion.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- Tokenizer y chat template no incluidos: dependen del tokenizer integrado de ComfyUI (MiniMax/Qwen 3.5).
- El repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/online2311/MiniMax-H3-Image-PE-ComfyUI-NVFP4
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Modelo origen Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Solicitud de autorizacion comercial: https://platform.minimax.io/console/license

# nativ-community/clef-flash-MLX-MXFP4

## Resumen

clef-flash-MLX-MXFP4 es una conversion a formato MLX del modelo Cloudflare/clef-flash, publicada por la organizacion nativ-community para su uso con la libreria mlx-vlm sobre Apple Silicon. No se trata de un modelo generativo al uso: Clef es un modelo de decision que, en una unica pasada forward, devuelve una probabilidad para cada opcion de cada pregunta planteada, sin producir texto. El pipeline declarado es image-text-to-text, de modo que acepta entradas multimodales (texto, imagen, video y combinaciones de ambas).

El modelo cuenta con 9.531.576.561 parametros totales (aproximadamente 9,53 mil millones) y el repositorio ocupa 5,9 GB, coherente con una cuantizacion de 4 bits en formato mxfp4 con tamano de grupo 32. La licencia es Apache 2.0 y el formato de pesos es safetensors. Se distribuye bajo la libreria mlx y esta pensado para ejecutarse localmente en equipos con chip de Apple.

Su relevancia actual es doble: por un lado, traslada un modelo de decision multimodal al ecosistema MLX, lo que permite inferencia local y privada en Mac; por otro, el soporte de Clef todavia no esta integrado en una version publica de mlx-vlm, por lo que requiere instalar una rama concreta desde el repositorio de Lazarus-931. El autor declara verificacion de equivalencia funcional con la referencia original en PyTorch (fp32): identidad de token ids en 11 de 11 registros de referencia y la misma respuesta en 25 de 25 preguntas, con una discrepancia maxima de probabilidad de 0,0822.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision multimodal; soporta imagen, video y texto como entrada) |
| Parametros totales | 9.531.576.561 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4, 4 bits, tamano de grupo 32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna (tipo de transformer, encoder visual, mecanismo de atencion, etc.) del modelo base Cloudflare/clef-flash ni de esta conversion. Lo que si queda documentado es su comportamiento funcional: Clef es un modelo de decision que devuelve una probabilidad por cada opcion de cada pregunta en una sola pasada forward, en lugar de generar texto de forma autorregresiva. Esto implica una cabeza de clasificacion sobre representaciones multimodales, no un decodificador de lenguaje.

La informacion de la model card indica que la conversion cubre entradas de texto, imagen, video, imagen mas video y dos imagenes simultaneas, con soporte para parametros como max_pixels, fps y num_frames. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada en esta ficha es la propia conversion a MLX con cuantizacion mxfp4 (grupo de 32) y su verificacion de equivalencia frente a la referencia en PyTorch de Cloudflare, realizada con la revision c16f81aa del fork de mlx-vlm.

## Capacidades

- Modelo de decision: devuelve una probabilidad para cada opcion de cada pregunta, no genera texto libre.
- Entrada multimodal: soporta texto, imagen, video, imagen mas video y pares de imagenes.
- Soporte de parametros de preprocesado visual: max_pixels, fps y num_frames para entradas de imagen y video.
- Preguntas de eleccion con criterios: el ejemplo de la model card define un campo choice con instrucciones y una lista de criterios (por ejemplo, enrutado a billing, technical o sales).
- Formato de salida estructurado: el resultado se devuelve como un diccionario con el valor seleccionado por campo (result["answers"]["department"]["value"]).
- Tool calling / function calling: no disponible (no aplica al ser un modelo discriminativo y no generativo).
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el autor no declara lista de idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia (por ejemplo, "Please refund my duplicate charge") y devuelve la probabilidad de que corresponda a facturacion, soporte tecnico o ventas, tal y como aparece en el ejemplo oficial de la model card.
- Triaje de correo entrante: clasificacion de mensajes con imagenes adjuntas o capturas de pantalla en categorias predefinidas, aprovechando la entrada image-text-to-text y devolviendo una probabilidad por categoria.
- Moderacion de contenido multimodal: evaluacion de imagenes y videos frente a criterios definidos (por ejemplo, apto o no apto), con la probabilidad asociada para fijar umbrales de revision humana.
- Etiquetado automatico de catalogos visuales: asignacion de categorias a imagenes o pares de imagenes (comparacion producto-foto) dentro de pipelines de datos, sin necesidad de generar descripciones textuales.
- Analisis de video para clasificacion: uso de los parametros fps y num_frames para decidir entre opciones discretas sobre clips de video, por ejemplo en control de calidad o verificacion de contenido.
- Sistemas de decision embebidos en Mac: despliegue local en Apple Silicon mediante MLX, util para aplicaciones que requieren privacidad de datos y no pueden enviar contenido a la nube.
- Pre-clasificacion previa a un LLM generativo: uso del modelo como primera etapa barata que filtra o asigna categorias, dejando la generacion de respuestas a un modelo de lenguaje posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica de rendimiento documentada es de verificacion de equivalencia con la referencia original en PyTorch (fp32):

| Prueba de verificacion | Resultado |
|---|---|
| Registros de referencia con token ids identicos (texto, imagen, video, imagen mas video, dos imagenes, max_pixels, fps, num_frames) | 11 de 11 |
| Preguntas con la misma respuesta que la referencia torch (fp32) | 25 de 25 |
| Discrepancia maxima de probabilidad frente a la referencia | 0,0822 |

## Requisitos de hardware

- VRAM o memoria unificada estimada: 5,9 GB de pesos en disco; con cuantizacion mxfp4 de 4 bits los 9,53 mil millones de parametros ocupan aproximadamente 4,8 GB teoricos, mas la sobrecarga del grupo de 32 y los buffers de inferencia.
- Plataforma soportada: MLX, lo que implica chips de Apple (familia M). No hay soporte CUDA documentado para esta conversion.
- GPU recomendadas: no disponible en el sentido de GPU dedicadas; el entorno objetivo son los chips de Apple Silicon. No se documentan recomendaciones especificas por modelo de chip.
- Viabilidad en GPU de consumo: no aplica a GPU NVIDIA o AMD, ya que MLX esta orientado a Apple Silicon. En Mac, un equipo con 8 GB de memoria unificada queda muy justo; 16 GB o mas es lo razonable para trabajar con holgura.
- Opciones de despliegue: mlx-vlm, instalando la rama con soporte de Clef mediante pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/clef"; la aplicacion Nativ (ejecucion local de modelos en Mac) figura entre las alternativas del ecosistema, aunque no se confirma soporte explicito de este modelo concreto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. La comparacion mas directa posible es contra el modelo de origen:

| Modelo | Parametros | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| nativ-community/clef-flash-MLX-MXFP4 | 9.531.576.561 | safetensors, mxfp4 4 bits, grupo 32 | apache-2.0 | MLX, requiere fork de mlx-vlm |
| Cloudflare/clef-flash (modelo base) | no disponible en la informacion proporcionada | PyTorch (referencia fp32 segun la verificacion) | no disponible en la informacion proporcionada | HuggingFace, via Cloudflare |

Comparativas con alternativas de la misma categoria (otros modelos de decision multimodales o conversiones MLX equivalentes): no disponible.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto; si el caso de uso requiere respuestas redactadas, hay que combinarlo con otro modelo.
- Requiere un fork no publicado de mlx-vlm para funcionar; el soporte de Clef todavia no esta en una release estable de la libreria, lo que anade riesgo de mantenimiento en produccion.
- Dependencia de plataforma: al estar en formato MLX, queda restringido a Apple Silicon y no es desplegable en infraestructura CUDA habitual de servidores.
- Cuantizacion con perdida: la verificacion declara una discrepancia maxima de probabilidad de 0,0822 frente a la referencia fp32, relevante si se fijan umbrales de decision ajustados.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento uniforme fuera del ingles, idioma del ejemplo oficial.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo ni de robustez.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no redacta texto; el riesgo equivalente es una asignacion de probabilidad erronea o mal calibrada ante entradas fuera de distribucion.
- Longitud de contexto: no disponible, lo que impide planificar conversaciones o documentos largos con garantias.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar la licencia y las condiciones del modelo base Cloudflare/clef-flash antes de un despliegue comercial.
- Adopcion muy baja: 0 descargas y 0 likes en el momento de la consulta, con un repositorio creado y actualizado el mismo dia (2026-10-07), por lo que no existe validacion externa mas alla de la declarada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/clef-flash-MLX-MXFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Fork de mlx-vlm con soporte de Clef: https://github.com/Lazarus-931/mlx-vlm/tree/feat/clef
- Aplicacion Nativ para ejecucion local en Mac: https://blaizzy.github.io/nativ/

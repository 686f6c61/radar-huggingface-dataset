# AutomatosX/AX-DeepSeek-V4-Pro-0813-MLX-AXQ-2bit-MTP

## Resumen

AX-DeepSeek-V4-Pro-0813-MLX-AXQ-2bit-MTP es un pack experimental de cuantización AXQ de 2 bits, publicado por AutomatosX, que convierte el modelo DeepSeek-V4-Pro-0813 de DeepSeek al formato MLX. Se trata de un MoE de clase 1,6 billones de parámetros que, gracias a la cuantización extrema y al paginado de expertos desde disco, puede ejecutarse en un Mac con memoria unificada, aunque con una latencia que el propio autor califica como impráctica para servicio en producción.

El autor lo presenta explícitamente como un artefacto de hobby o curiosidad técnica, no como un producto soportado. La tarjeta del modelo indica que esta revisión no será certificada por AX Engine y que no se publicará una variante AXQ de 4 bits para esta base. El pack pesa 847,6 GB en el repositorio y contiene 201.416.835.427 parámetros cuantizados, con un sidecar `mtp.safetensors` para el módulo de predicción multitoken (MTP), que viene empaquetado pero no activado.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización de 2 bits con paginado de expertos por SSD sobre una arquitectura MoE de gran escala; por otro, sirve como advertencia de que este tipo de packs no debe usarse en entornos de producción. El modelo base DeepSeek-V4-Pro-0813 fue publicado por DeepSeek el 13 de agosto de 2026, trece días después de la variante Flash.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en DeepSeek-V4-Pro-0813 |
| Parametros totales | 201.416.835.427 (en el pack cuantizado; el modelo base es de clase 1,6T) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 2 bits: expertos, atencion y MLP compartido a 2 bits; embeddings y router (`ffn.gate`) a 8 bits; normas y LM head a 16 bits (BF16); MTP/DSpark a 16 bits con preservacion de bytes |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT (segun metadatos del repo; la card indica que se copia la LICENSE de DeepSeek dentro del pack) |
| Formato de pesos | safetensors (MLX), con sidecar `mtp.safetensors` y `ax_expert_stream.json` para paginado |

## Arquitectura y entrenamiento

El modelo base, DeepSeek-V4-Pro-0813, es una arquitectura MoE de clase 1,6T de parametros totales, de la que no se han publicado en la informacion disponible el numero exacto de expertos activos ni la ventana de contexto. El pack de AutomatosX aplica una cuantizacion AXQ de 2 bits con grupo de tamaño 32, definida en el archivo `deepseek-v4-pro-0813-experimental-2bit-v0.1.yaml`, que mantiene embeddings, router, normas y la cabeza de salida con mayor precision para preservar la estabilidad numerica.

La innovacion tecnica principal es el uso del backend de streaming AXQuant en lugar de `mlx_lm.load`, porque la snapshot original oficial, que mezcla FP4 y FP8, no puede ingerirse con la carga estandar de MLX-LM. El modelo incluye un sidecar `mtp.safetensors` con el modulo de prediccion multitoken (DSpark), pero la aceleracion MTP no se activa en esta revision. El autor no ha medido la calidad del pack cuantizado frente a la version BF16 o FP8 del modelo base, y la tarjeta advierte que la conversion es evidencia de proceso, no una garantia de rendimiento.

## Capacidades

- Generacion de texto conversacional en ingles y chino, heredada del modelo base DeepSeek-V4-Pro-0813.
- Soporte de arquitectura MoE con paginado de expertos desde disco (SSD), que permite ejecutar un modelo de clase 1,6T en un Mac con memoria unificada limitada.
- Decodificacion especulativa DSpark empaquetada en el sidecar `mtp.safetensors`, aunque no activada en esta revision.
- Cuantizacion AXQ de 2 bits con precision diferenciada por capas (expertos a 2 bits, router a 8 bits, normas y cabeza a 16 bits).
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Investigacion de tecnicas de cuantizacion extrema: permite estudiar el impacto de una cuantizacion de 2 bits en un MoE de gran escala, especialmente en la preservacion del router y la cabeza de lenguaje, comparando con las versiones BF16/FP8 del modelo base.
- Evaluacion de paginado de expertos por SSD: sirve para medir el coste de I/O y la latencia de un sistema que pagina capas de expertos fusionadas desde disco en un entorno con memoria unificada limitada.
- Demostracion tecnica de la viabilidad de AXQ en MLX: el pack documenta el proceso de conversion con el backend AX, util como referencia para desarrolladores que quieran replicar el flujo con otros modelos de la familia DeepSeek.
- Experimentacion academica sobre decodificacion multitoken: el sidecar `mtp.safetensors` permite analizar la estructura del modulo MTP, aunque no se active la aceleracion, para estudiar su integracion en pipelines de generacion.
- Pruebas de compatibilidad de herramientas de inferencia: sirve para verificar que AX Engine puede cargar un pack con `ax_expert_stream.json` y `AX_ENGINE_2BIT_EXPERIMENTAL=1`, y para depurar errores de carga que no aparecen con modelos mas pequenos.
- Uso educativo sobre riesgos de cuantizacion agresiva: como artefacto de hobby, es un ejemplo claro de los compromisos entre tamaño, velocidad y calidad, y de los motivos por los que una cuantizacion de 2 bits no es adecuada para servicios de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo indica explicitamente que la calidad frente a BF16 o FP8 no fue medida y que no se certificara esta revision por ser demasiado lenta para uso practico. El modelo base DeepSeek-V4-Pro-0813 aparece en fuentes externas con evaluaciones de Terminal-Bench 2.1, Toolathlon-Verified, CyberGym, Humanity's Last Exam y AutomationBench, pero no se ofrecen numeros concretos en los datos recopilados, ni se puede atribuir ese rendimiento al pack cuantizado.

## Requisitos de hardware

- Memoria unificada: la tabla de expertos completa no cabe en ningun Mac comercial, incluidos los de 512 GB de RAM unificada; el modelo pagina una capa de expertos fusionada a la vez desde SSD.
- Almacenamiento: el repositorio ocupa 847,6 GB, por lo que se requiere un disco de alta velocidad con espacio suficiente para los pesos y el archivo de streaming de expertos.
- GPU recomendada: no se indica un modelo concreto; el proceso de conversion se realizo en una maquina `df-macstudio-m2`, por lo que se asume un entorno de Apple Silicon con memoria unificada amplia.
- Despliegue: se usa AX Engine con la variable `AX_ENGINE_2BIT_EXPERIMENTAL=1`. No se debe cargar con `mlx_lm.load` como modelo completamente residente, ni usar packs OptiQ de DeepSeek en AX Engine.
- Latencia y throughput: no disponibles, pero la card advierte que cada token espera a la I/O de SSD para los expertos enrutados, lo que hace el modelo impractico para serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| AX-DeepSeek-V4-Pro-0813-MLX-AXQ-2bit-MTP | 201,4B (pack) / 1,6T (base) | no disponible | AXQ 2 bits | MIT + LICENSE DeepSeek | experimental, no certificado |
| AX-DeepSeek-V4-Flash-MLX-AXQ-2bit | no disponible | no disponible | AXQ 2 bits | no disponible | pack de la misma coleccion |
| DeepSeek-V4-Pro-0813 (base, BF16/FP8) | ~1,6T (clase) | no disponible | FP4+FP8 nativo | no disponible | oficial, con benchmarks publicados |
| Packs AXQ certificados (Qwen 3.6, Flash, Coder-Next, GPT-OSS) | no disponible | no disponible | AXQ 2/3/4/6 bits | no disponible | certificados por AX Engine |

La comparativa se basa en los datos disponibles: el pack Pro 2-bit es el unico con parametros publicados en el repositorio, y la card menciona que los packs certificados de Automatos son los adecuados para uso real. No se dispone de informacion suficiente sobre el resto de alternativas para una comparativa numerica de rendimiento.

## Limitaciones y advertencias

- No certificado y no se certificara: la card lo declara como "hobby use only" y descarta su uso como producto soportado.
- Latencia extrema: el paginado de expertos desde SSD hace que cada token espere a la I/O de disco, con lo que no es viable para servicio o interaccion en tiempo real.
- Calidad no medida: no hay evaluacion frente a BF16/FP8 del modelo base; no se pueden extraer conclusiones sobre la fidelidad de la cuantizacion.
- Solo ingles y chino: no hay soporte documentado para otros idiomas, lo que limita su uso en aplicaciones multilingues.
- Riesgo de alucinacion y sesgos: no evaluados; al ser una cuantizacion de 2 bits sin validacion, es probable que la coherencia se degrade en tareas complejas.
- Dependencia de variable experimental: requiere `AX_ENGINE_2BIT_EXPERIMENTAL=1` y el backend AX, no es compatible con la carga estandar de MLX-LM.
- MTP no activado: el modulo de decodificacion multitoken esta presente pero no se acelera, por lo que no ofrece ventaja de velocidad.
- Restricciones de licencia: aunque el repositorio usa MIT, la card indica que se copia la LICENSE de DeepSeek; conviene revisar los terminos del modelo base antes de cualquier uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-DeepSeek-V4-Pro-0813-MLX-AXQ-2bit-MTP
- Coleccion DeepSeek de AutomatosX: https://huggingface.co/collections/AutomatosX/deepseek
- Repositorio AXQuant: https://github.com/defai-digital/axquant
- Notas de conversion del modelo: https://github.com/defai-digital/axquant/blob/main/docs/deepseek-v4-pro-0813-axq-2bit.md
- Configuracion de cuantizacion: https://github.com/defai-digital/axquant/blob/main/examples/deepseek-v4-pro-0813-experimental-2bit-v0.1.yaml
- Ficha del modelo base en aireleasetracker: https://aireleasetracker.com/model/deepseek/deepseek-v4-pro-0813
- API y precios del modelo base: https://www.tokenrouter.com/models/deepseek/deepseek-v4-pro-0813/
- Web de DeepSeek: https://deepseek.com/en/index.html

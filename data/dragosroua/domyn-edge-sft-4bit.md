# dragosroua/Domyn-Edge-SFT-4bit

## Resumen

Domyn-Edge-SFT-4bit es una cuantizacion en 4 bits del modelo domyn/Domyn-Edge-SFT, publicada por el usuario dragosroua. El modelo original lo desarrolla Domyn y esta orientado a generacion de texto conversacional. Esta version esta convertida al formato MLX, lo que la hace ejecutable en Macs con Apple Silicon, y emplea una cuantizacion de 4 bits con tamano de grupo 64 que reduce el peso del repositorio a unos 2,2 GB.

El modelo cuenta con 3.928.787.968 parametros (aproximadamente 3,9 mil millones) y utiliza una arquitectura propietaria denominada `domynedge`, que combina atencion con ventana deslizante y atencion completa (hibrida). Segun la model card, el modelo esta pensado para ejecutarse en equipos con 16 GB de memoria unificada, lo que lo situa en la categoria de modelos de borde (edge) para inferencia local.

La relevancia de esta publicacion es limitada pero concreta: ofrece una via para probar el modelo Domyn-Edge-SFT en hardware Apple sin necesidad de GPU dedicada. No obstante, la model card advierte de que la calidad de generacion es todavia "rough" (tosca), que el manejo de la plantilla de chat es incompleto y que se requiere un fichero de arquitectura personalizado (`domynedge.py`) para cargar el modelo en `mlx-lm`. No se dispone de informacion sobre el modelo base mas alla de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | domynedge (transformer hibrido con atencion de ventana deslizante + atencion completa) |
| Parametros totales | 3.928.787.968 (~3,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64 (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es propietaria y se identifica como `domynedge`. Segun la model card, emplea atencion hibrida que combina ventana deslizante con atencion completa, un patron habitual en modelos recientes para reducir el coste computacional en contextos largos. El modelo base es domyn/Domyn-Edge-SFT, del que no se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "SFT" sugiere un ajuste supervisado (supervised fine-tuning), pero no se confirma en la informacion disponible.

La version aqui descrita es una cuantizacion realizada con `mlx_lm.convert` en 4 bits con group size 64. No se detalla si hubo entrenamiento adicional tras la cuantizacion; se trata, por tanto, de una conversion de pesos del modelo base. La innovacion tecnica destacable es la propia arquitectura hibrida de atencion, aunque no se dispone de datos que permitan evaluar su impacto en rendimiento o calidad.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la tarea es conversacional.
- Razonamiento y codigo: no se documentan capacidades especificas de codigo, matematicas o razonamiento avanzado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Ejecucion local en Apple Silicon: capacidad operativa destacable, gracias al formato MLX y a la cuantizacion de 4 bits.

## Casos de uso

- Prototipado local en Mac: el modelo permite probar generacion de texto conversacional en un Mac con 16 GB de memoria unificada sin GPU dedicada, usando `mlx_lm.generate`. Es adecuado para experimentacion temprana con la arquitectura domynedge.
- Evaluacion de arquitecturas hibridas de atencion: investigadores interesados en comparar atencion de ventana deslizante frente a atencion completa pueden usar este modelo como referencia ejecutable en hardware de consumo.
- Pruebas de cuantizacion MLX: sirve para medir el impacto de la cuantizacion a 4 bits con group size 64 sobre la calidad de generacion en un modelo de ~3,9 B.
- Chat local de baja exigencia: para conversaciones simples en local donde no se requiera alta fidelidad, siempre que se acepte la advertencia de calidad "rough" del autor.
- Integracion en pipelines de investigacion: como componente de experimentos que necesiten un modelo pequeno en formato MLX dentro de un flujo mayor, asumiendo la necesidad del fichero `domynedge.py`.
- Demostraciones y docencia: para ilustrar el flujo de conversion y carga de modelos personalizados en `mlx-lm`, dado que requiere pasos manuales documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,5 GB segun la model card; repositorio de 2,2 GB.
- Hardware objetivo: Apple Silicon con 16 GB de memoria unificada (segun el autor).
- GPU dedicadas (A100, H100, RTX 4090): no aplicable de forma directa, ya que el formato es MLX y esta pensado para Apple Silicon; no se documenta soporte en CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de 16 GB o mas; no se documenta para GPUs NVIDIA.
- Opciones de despliegue: `mlx-lm` (requiere colocar `domynedge.py` en `mlx_lm/models/`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base que permitan una comparacion rigurosa con alternativas. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Domyn-Edge-SFT-4bit | ~3,9 B | no disponible | Apache 2.0 | safetensors (MLX) | Requiere arquitectura custom |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Calidad de generacion "rough" (tosca), segun reconoce el propio autor en la model card.
- Manejo incompleto de la plantilla de chat, lo que puede degradar el formato de las respuestas conversacionales.
- Requiere el fichero de arquitectura personalizado `domynedge.py` en el checkout local de `mlx-lm`; sin el, el modelo no carga.
- Idiomas soportados no declarados; riesgo de comportamiento deficiente fuera del idioma o idiomas de entrenamiento (no disponibles).
- Riesgo de alucinacion no cuantificado; no hay benchmarks ni evaluaciones publicadas.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el modelo base y su calidad real desaconseja su uso en produccion sin evaluacion previa.
- Formato MLX limita el despliegue a ecosistema Apple; no hay soporte documentado para CUDA, vLLM o llama.cpp.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dragosroua/Domyn-Edge-SFT-4bit
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT

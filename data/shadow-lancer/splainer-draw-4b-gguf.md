# Shadow-lancer/splainer-draw-4b-GGUF

## Resumen

Splainer Draw 4B es un ajuste fino (fine-tune) del modelo multimodal Qwen/Qwen3.5-4B, publicado por el desarrollador independiente Shadow-lancer. Su proposito concreto es generar las instrucciones compactas de dibujo que utiliza Splainer, una aplicacion de pizarra, dibujo y modelado 3D, de modo que el modelo pueda producir whiteboards, ilustraciones y modelos 3D ejecutandose integramente en un ordenador personal. El modelo se distribuye unicamente en formato GGUF cuantizado, pensado para inferencia local mediante LM Studio u Ollama.

Con 4.326.350.848 parametros (aproximadamente 4,3 mil millones) y una licencia Apache 2.0, se posiciona como una alternativa ligera y de bajo coste de hardware frente a modelos multimodales de mayor tamano. El repositorio ocupa 16,2 GB e incluye al menos dos cuantizaciones: Q4_K_M (2,8 GB, recomendada para 5 GB de VRAM) y Q8_0 (4,6 GB, recomendada para 6 GB de VRAM). La model card recomienda una tarjeta grafica de 8 GB o mas para la variante Q4_K_M.

La relevancia actual del modelo radica en su enfoque de dominio: no compite como modelo generalista, sino que actua como motor de generacion de dibujos y geometria 3D dentro de un ecosistema concreto (Splainer). El pensamiento (thinking) esta desactivado por defecto para ofrecer respuestas rapidas, y el modelo espera el formato de instrucciones de dibujo propio de Splainer; con otras entradas se comporta como su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de Qwen/Qwen3.5-4B; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M y Q8_0 (al menos; el repo ocupa 16,2 GB en total) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se distribuyen safetensors en el repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Se trata de un fine-tune del modelo multimodal Qwen/Qwen3.5-4B, por lo que hereda la arquitectura del transformer multimodal de Qwen (pipeline image-text-to-text), pero la model card no especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni la naturaleza exacta del codificador visual. Tampoco se indica si el modelo base emplea Mixture of Experts; el recuento de parametros totales (4,3 mil millones) sugiere un modelo denso de aproximadamente 4B.

Respecto al entrenamiento, la informacion disponible es minima: se sabe que es un ajuste fino orientado a generar las instrucciones compactas de dibujo de Splainer, pero no se detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o aprendizaje supervisado. La model card unicamente menciona que el "thinking" esta desactivado por defecto para respuestas rapidas, lo que implica que el modelo base dispone de un modo de razonamiento que el fine-tune puede activar o desactivar.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-4B.
- Generacion de instrucciones de dibujo para Splainer: whiteboards, ilustraciones y modelos 3D en el formato compacto propio de la aplicacion.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), lo que permite trabajar con imagenes ademas de texto.
- Modo de razonamiento (thinking) disponible pero desactivado por defecto para priorizar la latencia.
- Ejecucion local completa en PC, sin dependencia de servicios en la nube.
- Integracion con LM Studio y Ollama para despliegue sencillo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de pizarras y diagramas en Splainer: el modelo produce las instrucciones compactas que Splainer interpreta para dibujar whiteboards. Es adecuado porque esta especificamente ajustado para ese formato y se ejecuta en local con 5-6 GB de VRAM.
- Creacion de modelos 3D basicos en local: el fine-tune genera las instrucciones de geometria que Splainer convierte en modelos 3D, lo que permite prototipar objetos sin conexion ni coste de API.
- Asistente de dibujo en estaciones de trabajo con GPU de gama media: con la cuantizacion Q4_K_M (2,8 GB) cabe en tarjetas de 8 GB, por lo que puede desplegarse en equipos de oficina o portatiles con GPU dedicada.
- Prototipado rapido de contenido visual para documentacion tecnica: el modelo puede generar esquemas y diagramas de pizarra a partir de descripciones textuales, utiles para borradores de arquitectura o explicaciones.
- Despliegue offline en entornos sin conectividad: al distribuirse en GGUF y ejecutarse con Ollama o LM Studio, funciona en maquinas aisladas, lo que encaja en entornos educativos o industriales con restricciones de red.
- Experimentacion con modelos multimodales ligeros: investigadores pueden usar este fine-tune como base para estudiar la adaptacion de Qwen3.5-4B a tareas de generacion de instrucciones estructuradas de dibujo.
- Integracion en flujos de trabajo de escritorio mediante LM Studio: la instalacion via `lms get` facilita incorporar el modelo a herramientas locales de productividad sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: 5 GB (archivo de 2,8 GB); la model card recomienda una tarjeta de 8 GB o mas.
- VRAM estimada para Q8_0: 6 GB (archivo de 4,6 GB).
- GPU recomendadas: no se especifican modelos concretos; por el rango de VRAM, encaja en tarjetas consumer de 8 GB o mas (por ejemplo, gama RTX xx60/xx70 con 8 GB o superior). GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, con 8 GB o mas de VRAM para Q4_K_M.
- Opciones de despliegue: LM Studio (busqueda en Discover o `lms get`), Ollama (`ollama run hf.co/Shadow-lancer/splainer-draw-4b-GGUF:Q4_K_M`) y la propia aplicacion Splainer, que selecciona el tamano segun la GPU y descarga el modelo a traves de LM Studio u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card solo indica que el modo thinking esta desactivado por defecto para respuestas rapidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Splainer Draw 4B | 4,3 mil millones | No disponible | GGUF | Apache 2.0 | Fine-tune para dibujo/pizarra/3D en Splainer |
| Qwen/Qwen3.5-4B (modelo base) | Aproximadamente 4B | No disponible | No disponible en esta ficha | No disponible en esta ficha | Modelo multimodal generalista image-text-to-text |
| Otras alternativas de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion documentada con certeza es con su modelo base Qwen/Qwen3.5-4B: Splainer Draw 4B es un ajuste fino especializado que hereda las capacidades generales del base, pero solo rinde de forma especifica cuando recibe el formato de instrucciones de dibujo de Splainer. No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo espera el formato compacto de instrucciones de dibujo de Splainer; con otros prompts se comporta como el modelo base, por lo que no debe evaluarse como generador generalista de dibujos.
- No hay informacion publicada sobre sesgos del fine-tune ni sobre la composicion del dataset de entrenamiento, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir instrucciones de dibujo invalidas o geometrias incoherentes.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion para produccion multilingue o con contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B puede tener sus propias condiciones que conviene verificar antes de un despliegue comercial.
- Solo se distribuyen pesos GGUF; no hay safetensors en el repositorio, lo que restringe el reentrenamiento o la conversion a otros formatos sin partir del modelo base.
- El modelo tiene 0 likes y 252 descargas, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- El modo thinking esta desactivado por defecto; si se activa, la latencia aumentara y no se documenta el impacto en la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Shadow-lancer/splainer-draw-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio de Splainer: https://splainer.shadow-lancer.com

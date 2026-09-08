# Jonnester/LR-AttnRes-sliced-fast-05b-n16-r768

## Resumen

El modelo `Jonnester/LR-AttnRes-sliced-fast-05b-n16-r768` es un checkpoint experimental de 0.500 millones de parametros desarrollado por el investigador Jonnester. Se basa en una arquitectura denominada *sliced low-rank Block Attention Residuals* (LR-AttnRes), con 16 bloques y un routing rank de 768. El modelo ha sido entrenado sobre aproximadamente 10.000 millones de tokens (9.999.745.024) y presenta una loss de validacion de 2,9594 sobre 99.999.744 tokens.

La relevancia del modelo radica en su foco en la eficiencia de inferencia. Incluye un backend llamado *fast-attnres* en su version 2.0.1, que reporta un throughput mediano de 78.141,33 tokens/s y una aceleracion de 2,693 veces frente a la implementacion legacy compilada. El checkpoint se publica en HuggingFace con un tamano de repositorio de 2,5 GB, pero sin licencia, idiomas u otra documentacion tecnica adicional. Es un modelo orientado a la investigacion en arquitecturas de atencion eficientes y no presenta evaluaciones externas de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sliced low-rank Block Attention Residuals (LR-AttnRes) con 16 bloques y routing rank 768 |
| Parametros totales | 0,5B (500 millones aprox.) |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La arquitectura del modelo se describe como *sliced low-rank Block Attention Residuals*, un diseno que combina atencion por bloques con residuos de bajo rango y un mecanismo de enrutado. No se documenta si se trata de un mixture-of-experts (MoE). El checkpoint fue entrenado sobre 9.999.745.024 tokens (aprox. 10.000 millones), alcanzando una loss de validacion de 2,9594298357 sobre 99.999.744 tokens. La configuracion de compilacion usa `fullgraph=True`, `dynamic=False` y tiene los CUDA graphs deshabilitados. El backend de atencion residual es `fast-attnres` en version 2.0.1, con 1 grafo compilado para forward y 1 para backward.

No se ha publicado informacion sobre la composicion del dataset de entrenamiento, ni sobre la aplicacion de tecnicas como RLHF o DPO. El autor indica que la auditoria de la receta ("recipe audit") paso con 0 diferencias inesperadas.

## Capacidades

- No se han documentado capacidades especificas como generacion de codigo, matematicas, vision o tool calling.
- El modelo esta orientado a la investigacion de arquitecturas de atencion eficientes, no a tareas de produccion.
- El backend `fast-attnres` permite inferencia compilada con un throughput mediano reportado de 78.141,33 tokens/s.
- Soporta compilacion fullgraph y tiene una aceleracion de 2,693 veces sobre una implementacion legacy compilada exacta.
- No hay informacion sobre soporte de agentes, multi-step reasoning o capacidades multilingues.

## Casos de uso

- Investigacion en arquitecturas de atencion: el modelo permite estudiar el impacto del diseno LR-AttnRes en la perdida de validacion y compararlo con implementaciones legacy, usando la aceleracion de 2,693x como metricas de rendimiento.
- Evaluacion de backends de inferencia: se puede usar para medir el rendimiento del backend `fast-attnres` v2.0.1 frente a otras implementaciones, aprovechando el throughput de 78.141,33 tokens/s reportado por el autor.
- Fine-tuning en entornos academicos: al ser un modelo de 0,5B entrenado en 10.000 millones de tokens, puede ser un punto de partida economico para ajustes en tareas de dominio con recursos de computo limitados.
- Reproduccion de experimentos: la auditoria de receta y el enlace a W&B permiten reproducir el checkpoint y verificar su loss de validacion en un entorno controlado.
- Analisis de tecnicas de compilacion: el modelo sirve como caso de estudio para examinar los efectos de `fullgraph=True` y `dynamic=False` en el rendimiento de inferencia.
- Estudio del escalado del routing rank: comparando este checkpoint con las variantes `n8-r16` y `n4-r32` del mismo autor, se puede investigar como el numero de bloques y el rank de enrutado afectan a la loss de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos son la loss de validacion del propio checkpoint y las metricas de rendimiento del backend reportadas por el autor en su entorno de pruebas, sin especificar hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, los pesos de un modelo de 0,5B ocupan aproximadamente 1 GB; en FP32, unos 2 GB; con cuantizacion a 4 bits, menos de 0,5 GB. Estos valores son teoricos, ya que no se especifica el formato de los pesos.
- GPU recomendadas: no hay datos oficiales, pero por su tamano es viable en GPUs de consumo como una RTX 3060 12 GB o superiores. Una RTX 4090 permitiria maximizar el throughput.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano de 0,5B y el repositorio de 2,5 GB.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp u Ollama. El backend `fast-attnres` requiere compilacion con `fullgraph=True` y CUDA graphs deshabilitados, lo que puede aumentar el tiempo de arranque. Es posible intentar la carga con HuggingFace Transformers, pero no esta confirmado.
- Latencia y throughput: el autor reporta un throughput mediano de 78.141,33 tokens/s en su entorno de pruebas (hardware no especificado). No se han publicado datos de latencia por solicitud.

## Comparativa con modelos similares

Se comparan las variantes del mismo autor porque comparten la arquitectura LR-AttnRes y el tamano de 0,5B. No se disponen de benchmarks estandar que permitan comparar con modelos como Qwen2.5-0.5B o SmolLM-0.5B.

| Modelo | N | r | Loss de validacion | Tokens de entrenamiento | Backend |
|---|---|---|---|---|---|
| LR-AttnRes-sliced-fast-05b-n16-r768 (este) | 16 | 768 | 2,9594298357 | 9.999.745.024 | fast-attnres 2.0.1 |
| LR-AttnRes-sliced-fast-fixed-05b-n8-r16 | 8 | 16 | 2,9616687607 | 10.000.000.000 (aprox.) | Fast static-mask |
| LR-AttnRes-sliced-05b-n4-r32 | 4 | 32 | No disponible | No disponible | No disponible |

Todos los modelos estan disponibles en HuggingFace, pero carecen de licencia explicita y de documentacion sobre el contexto maximo.

## Limitaciones y advertencias

- No se han evaluado sesgos en el modelo; al ser un checkpoint de investigacion, no hay auditorias externas.
- Existe un riesgo de alucinacion no cuantificado. Un modelo de 0,5B sin evaluacion externa puede producir contenido incorrecto, especialmente en tareas generativas.
- La longitud de contexto no esta documentada, por lo que no se conoce el limite real de tokens de entrada por solicitud.
- La licencia no esta especificada, lo que impide garantizar el uso comercial del modelo.
- No hay benchmarks publicados, por lo que no se puede comparar su rendimiento con modelos de la misma categoria en tareas estandar.
- El modelo es experimental y esta orientado a investigacion; su uso en produccion no esta respaldado por documentacion tecnica completa.

## Enlaces

- HuggingFace: https://huggingface.co/Jonnester/LR-AttnRes-sliced-fast-05b-n16-r768
- W&B run: https://wandb.ai/jonnester-german-swiss-international-school-/LR-AttnRes/runs/5h3bdevo
- Reference recipe: https://wandb.ai/jonnester-german-swiss-international-school-/LR-AttnRes/runs/ne0tiqb3
- Modelo comparado n8-r16: https://huggingface.co/Jonnester/LR-AttnRes-sliced-fast-fixed-05b-n8-r16
- Modelo comparado n4-r32: https://huggingface.co/Jonnester/LR-AttnRes-sliced-05b-n4-r32

# h3lloworld/ebc-jepa-rope-xattn16-disc-ed24-denoiser

## Resumen

EBC-JEPA RoPE experiment rope_xattn16_disc (ED24) es un modelo de eliminación de ruido (denoising) para camaras de eventos, desarrollado por el usuario h3lloworld. Se trata de un experimento de investigacion que explora el uso de RoPE (Rotary Positional Embeddings) en su variante discreta frente a la continua, aplicado sobre un backbone de vision V-JEPA 2.1 ViT-B de Meta, adaptado mediante LoRA. El objetivo es limpiar los flujos asincronos de eventos (event streams) que generan las camaras neuromorficas, un paso critico antes de cualquier tarea de vision de alto nivel.

El modelo no es un LLM ni un modelo generativo de texto: es un denoiser de vision especializado en datos de camara de eventos. Combina un tokenizador de eventos, una cabecera por evento (per-event head) y adaptadores LoRA sobre las proyecciones qkv y de salida del ViT-B, con atencion cruzada de 16 vias y RoPE en modo discreto. Se entrena sobre el dataset ED24 (las 2.100 ficheros oficiales de EDformer) y se evalua en generalizacion sobre DND21 y E-MLB.

Es relevante porque explora una pregunta abierta en la comunidad de modelos JEPA y de vision de eventos: si conviene codificar la posicion temporal/espacial de los eventos con embeddings rotatorios continuos o discretos. Ademas, publica unicamente los tensores entrenables, lo que reduce drasticamente el peso del artefacto y facilita reutilizar el backbone publico de Meta. El repositorio esta vacio (0.0 GB) y no registra descargas ni likes, por lo que debe considerarse un artefacto de investigacion temprano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision V-JEPA 2.1 ViT-B con adaptadores LoRA (qkv, proj; rango 8), cabecera por evento y atencion cruzada x16; RoPE en modo discreto |
| Parametros totales | no disponible (hereda la escala del ViT-B de V-JEPA 2.1; el repo solo aloja los tensores entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de vision sobre flujos de eventos, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo no textual) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); checkpoint parcial (`trainable.pt`) que se carga sobre el checkpoint publico V-JEPA 2.1 ViT-B |

## Arquitectura y entrenamiento

La arquitectura parte de V-JEPA 2.1 ViT-B, un transformer de vision preentrenado por Meta con objetivos de prediccion en el espacio latente (JEPA). Sobre ese backbone se anaden adaptadores LoRA de rango 8 en las proyecciones qkv y de salida, de modo que solo se entrenan pequenos conjuntos de parametros adicionales. El pipeline incluye ademas un tokenizador de eventos (event tokenizer) y una cabecera por evento responsable de la prediccion de denoising. La configuracion concreta de layout, ventana, readout y modo de RoPE queda definida en el fichero `config.json` del repositorio. El identificador `xattn16` apunta a un mecanismo de atencion cruzada de 16 vias, y el sufijo `disc` indica que este experimento usa RoPE discreta (frente a la variante continua).

El entrenamiento utiliza el dataset ED24 completo, con los 2.100 ficheros oficiales de EDformer, y la evaluacion de generalizacion se realiza sobre los conjuntos DND21 y E-MLB. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de vision de este tipo). No se especifican innovaciones adicionales como decodificacion especulativa u otras tecnicas de eficiencia. El modelo se enmarca dentro del proyecto EBC-JEPA, cuyo codigo esta disponible en el repositorio publico del autor.

## Capacidades

- Denoising de flujos de eventos procedentes de camaras neuromorficas (eliminacion de ruido en la senal de eventos).
- Extraccion de representaciones latentes de secuencias de eventos mediante el backbone V-JEPA 2.1 ViT-B.
- Prediccion por evento, gracias a la cabecera per-event head entrenada especificamente para esta tarea.
- Adaptacion eficiente mediante LoRA, lo que permite reentrenar y ajustar el modelo sin modificar el backbone completo.
- Evaluacion de generalizacion sobre datasets distintos al de entrenamiento (DND21, E-MLB), lo que indica capacidad de transferencia a otras fuentes de datos de eventos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de vision especializado, no un modelo de lenguaje.
- No incorpora vision clasica sobre imagenes RGB en el sentido generativo, ni audio, ni modo "thinking".

## Casos de uso

- Preprocesado para pipelines de vision de eventos: el modelo limpia el flujo de eventos antes de alimentar tareas de deteccion, seguimiento o reconocimiento, reduciendo el ruido que degrada esas etapas posteriores.
- Vision nocturna y alta velocidad: en escenarios con poca luz o movimientos rapidos, las camaras de eventos generan mucho ruido; este denoiser mejora la relacion senal-ruido antes de la inferencia.
- Robotica y navegacion autonoma: los robots que emplean camaras de eventos necesitan senales limpias para estimar movimiento y evitar colisiones; el modelo puede integrarse como etapa previa de bajo coste, ya que solo anade adaptadores LoRA.
- Investigacion en modelos JEPA: sirve como referencia reproducible para estudiar el impacto de RoPE discreta frente a continua en tareas de vision de eventos, con la configuracion registrada en `config.json`.
- Vehiculos autonomos y ADAS: fusion de datos de camara de eventos con otros sensores exige senal limpia; el denoiser actua como modulo previo para la fusion sensorial.
- Analisis de gestos y seguimiento ocular: en interfaces que usan camaras de eventos para detectar movimientos oculares rapidos (saccades), el denoising mejora la precision temporal del seguimiento.
- Benchmark de denoising de eventos: el modelo puede utilizarse como baseline experimental sobre ED24, DND21 y E-MLB para comparar distintas variantes de RoPE o de atencion cruzada.

## Benchmarks y rendimiento

No se han publicado los valores de benchmarks en la informacion disponible. El repositorio incluye un fichero `metrics.json` que presumiblemente contiene los resultados de las evaluaciones, pero su contenido no se detalla en la model card consultada ni en la informacion proporcionada. No se deben asumir cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Al tratarse de un ViT-B (escala base, del orden de decenas de millones de parametros) con adaptadores LoRA y una cabecera ligera, la huella de memoria deberia ser moderada, pero depende de la resolucion, del tamano de lote y de la longitud de la secuencia de eventos. Se recomienda medirla empiricamente con el script de evaluacion incluido.
- GPU recomendadas: cualquier GPU con soporte CUDA razonable. Una ViT-B suele caber en GPUs de consumo; para entrenamiento o lotes grandes conviene una A100, H100 o similar.
- Compatibilidad con GPU de consumo: probablemente si (por ejemplo, RTX 3090, RTX 4090 o superiores), dado el tamano del backbone y que solo se entrenan adaptadores LoRA, aunque no hay confirmacion oficial.
- Opciones de despliegue: PyTorch nativo. El repositorio proporciona `tools/lora_denoise/eval_emlb.py` para evaluacion. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. Como referencia contextual, EDformer es el origen del dataset ED24 empleado en el entrenamiento, y el propio backbone V-JEPA 2.1 ViT-B de Meta es la base sobre la que se construye el modelo. No se han facilitado cifras de rendimiento de este modelo ni de sus alternativas, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Es un artefacto de investigacion temprano: el repositorio no registra descargas ni likes, y el tamano reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar accesibles o que el repositorio esta incompleto.
- Sesgos conocidos: no disponibles. Al entrenarse sobre ED24 (y evaluarse en DND21 y E-MLB), el comportamiento puede degradarse en dominios de eventos distintos a los de esos datasets.
- Riesgo de alucinacion: no aplica en el sentido generativo textual, pero si existe riesgo de artefactos o alucinaciones en la reconstruccion de la senal de eventos cuando la distribucion de entrada difiere de la de entrenamiento.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto linguistico. La ventana temporal de eventos y el layout se definen en `config.json`, y no se especifican sus limites en la model card.
- Restricciones de licencia: MIT, permisiva y compatible con uso comercial. No obstante, el modelo se apoya en V-JEPA 2.1 de Meta, tambien bajo licencia MIT, por lo que conviene conservar las atribuciones correspondientes.
- Caveat de produccion: el checkpoint publicado (`trainable.pt`) contiene solo los tensores entrenables y requiere cargar el backbone publico de V-JEPA 2.1 ViT-B (`vjepa2_1_vitb_dist_vitG_384.pt`) para funcionar. Sin ese fichero, el modelo no es utilizable directamente.
- No hay documentacion sobre cuantizacion, lo que limita opciones de despliegue en hardware restringido.
- El modelo no es un LLM: no admite prompts de texto, tool calling ni razonamiento conversacional.

## Enlaces

- HuggingFace: https://huggingface.co/h3lloworld/ebc-jepa-rope-xattn16-disc-ed24-denoiser
- Repositorio de codigo (rama denoise-lora): https://github.com/whohyf/EBC-JEPA-share/tree/denoise-lora
- Checkpoint base V-JEPA 2.1 ViT-B (Meta): https://dl.fbaipublicfiles.com/vjepa2/vjepa2_1_vitb_dist_vitG_384.pt
- Script de evaluacion citado en la model card: `tools/lora_denoise/eval_emlb.py --runs-dir <dir holding this folder> --arms <folder name> --checkpoint vjepa2_1_vitb_dist_vitG_384.pt`
- Documentacion del protocolo de tablas: `docs/lora_denoise/HANDOFF.md`

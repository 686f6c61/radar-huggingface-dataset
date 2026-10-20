# Echoo113/Qwen3.5-2B-flower_sunflower_dose-STEER0.0797-ft4.43

## Resumen

`Echoo113/Qwen3.5-2B-flower_sunflower_dose-STEER0.0797-ft4.43` es un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-2B`, entrenado con la librería TRL y publicado dentro del ecosistema `transformers`. El autor es el usuario de HuggingFace Echoo113 y el repositorio se creó el 19 de octubre de 2026. No se trata de un modelo fundamental nuevo, sino de un artefacto experimental derivado de un modelo preexistente, tal y como indica la etiqueta `base_model:finetune:Qwen/Qwen3.5-2B`.

La nomenclatura del checkpoint es la principal fuente de información disponible: los segmentos `flower_sunflower_dose`, `STEER0.0797` y `ft4.43` sugieren un experimento de *steering* (inyección de un vector de dirección en las activaciones) con un coeficiente de 0,0797 y un paso o versión de ajuste fino 4.43. Se trata de una interpretación del nombre, no de un dato confirmado: la model card no documenta ni el dataset, ni la receta de entrenamiento, ni el efecto buscado con dicho vector.

La relevancia práctica del modelo es limitada fuera de ese contexto experimental. El repositorio ocupa 0,1 GB, un tamaño muy inferior al esperado para pesos completos de un modelo de ~2.000 millones de parámetros en bf16 (que rondarían los 4 GB), lo que apunta a un adaptador, a pesos parciales o a un checkpoint podado. No hay métricas publicadas, ni licencia declarada, ni idiomas documentados, por lo que cualquier evaluación debe hacerse por cuenta del usuario antes de plantear un uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; heredada del modelo base Qwen/Qwen3.5-2B) |
| Parametros totales | no disponible en la model card; el nombre del modelo base sugiere ~2.000 millones, sin confirmar |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repo publica pesos en safetensors sin cuantizar y no se han publicado variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo `licence` del README contiene únicamente la cadena "license", sin identificador) |
| Formato de pesos | safetensors (librería `transformers`) |

Otros datos del repositorio: etiquetas `transformers`, `safetensors`, `generated_from_trainer`, `trl`, `sft`, `endpoints_compatible`, `region:us`; 0 descargas y 0 likes en el momento de la consulta; tamaño del repo 0,1 GB.

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO. Lo único documentado es el procedimiento: un ajuste fino supervisado (SFT) ejecutado con TRL 1.10.0, Transformers 5.15.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. El modelo parte de `Qwen/Qwen3.5-2B`, por lo que su arquitectura base, su tokenizador y su ventana de contexto serán las del checkpoint original, pero esos datos no están reproducidos en este repositorio.

El elemento diferencial que sugiere el nombre es la aplicación de *steering* con un coeficiente de 0,0797 sobre una dirección semántica etiquetada como `flower_sunflower_dose`. En la práctica, esto implica que las activaciones del modelo se han modificado durante el entrenamiento o la inferencia para sesgar su comportamiento hacia un eje concreto. No se especifica en qué capa se aplica el vector, ni si el vector se ha destilado en los pesos o se inyecta en tiempo de ejecución mediante hooks. Tampoco se documenta el dataset de SFT ni el criterio de selección del checkpoint (`ft4.43`), lo que impide reproducir el entrenamiento.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card muestra un `pipeline` de `text-generation` con formato de mensajes `{"role": "user", "content": ...}`, lo que confirma soporte del chat template heredado del modelo base.
- Ajuste de estilo o comportamiento: por el nombre del checkpoint, se espera un sesgo deliberado hacia una dirección semántica concreta (steering), aunque su efecto observable no está documentado ni cuantificado.
- Integración con el ecosistema HuggingFace: compatible con `transformers`, `pipeline` y con la etiqueta `endpoints_compatible` (despliegue en Inference Endpoints).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes, visión o audio: no disponibles en la información proporcionada. No se pueden atribuir sin verificar el modelo base.
- Capacidades multilingües: no disponibles.
- Modo *thinking* o decodificación extendida: no disponible.

## Casos de uso

- Investigación en *activation steering*: el checkpoint sirve como referencia reproducible de un experimento de dirección con coeficiente 0,0797, útil para comparar curvas dosis-respuesta frente al modelo base sin ajustar.
- Ablación de hiperparámetros de SFT: al estar generado con TRL y con versiones de framework fijadas (TRL 1.10.0, Transformers 5.15.1), permite replicar exactamente el entorno y aislar el efecto del dataset frente al del vector de steering.
- Prototipado local de chatbots: si los pesos cargan correctamente en `transformers`, puede ejecutarse con `pipeline("text-generation", device="cuda")` en una GPU de gama media para pruebas de concepto de conversación multi-turno, sin coste de API.
- Generación de datos sintéticos para filtrado: útil como generador secundario frente al modelo base en tareas de *data augmentation*, midiendo la divergencia de distribución introducida por el steering.
- Docencia y formación técnica: ejemplo didáctico de cómo se publica un ajuste fino con TRL, incluyendo el formato de model card autogenerada y la trazabilidad del `base_model`.
- Despliegue en Inference Endpoints: la etiqueta `endpoints_compatible` permite subirlo como endpoint gestionado para pruebas de integración de la API de chat, siempre que la licencia se aclare antes de exponerlo.
- Evaluación comparativa de seguridad y sesgos: comparar las respuestas de este checkpoint con las del Qwen3.5-2B original para detectar si el vector de steering introduce derivas no deseadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y los resultados de búsqueda web no contienen información técnica sobre este checkpoint. No se pueden ofrecer cifras sin inventarlas.

## Requisitos de hardware

- VRAM estimada para inferencia (asumiendo ~2.000 millones de parámetros, no confirmado): en bf16/fp16 en torno a 4-5 GB de pesos más caché KV y overhead; en int8 aproximadamente 2-3 GB; en 4 bits aproximadamente 1,5-2 GB.
- El tamaño real del repositorio (0,1 GB) es incompatible con pesos completos en bf16, por lo que las cifras anteriores son estimaciones condicionales y deben validarse comprobando los tensores del checkpoint antes de aprovisionar hardware.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o A100/H100 si se necesita batcheo amplio y contextos largos; para cuantización 4 bits, una RTX 3060 de 12 GB o superior debería ser suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 8 GB o más en cuantización de 8 bits o inferior, sujeto a verificación del checkpoint real.
- Opciones de despliegue: `transformers` con `pipeline` (documentado por el autor), TGI, vLLM, y `endpoints_compatible` para HuggingFace Inference Endpoints. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, paso no documentado ni publicado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-flower_sunflower_dose-STEER0.0797-ft4.43 | no disponible (nombre sugiere ~2B) | no disponible | sin benchmarks publicados | no disponible | repo público, 0 descargas |
| Qwen/Qwen3.5-2B (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | público en HuggingFace |
| Otras alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de modelos comparables en la información proporcionada, por lo que no se establece comparación cuantitativa con terceros. La única comparación fiable es contra el propio modelo base, y requeriría ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Ausencia total de licencia: el campo `licence` del README contiene el literal "license" sin identificador, y la información de HuggingFace indica "no disponible". No hay base legal explícita para uso comercial; hay que contactar con el autor o asumir los términos del modelo base.
- Tamaño del repositorio anómalo: 0,1 GB frente a los ~4 GB esperados para 2B en bf16. Existe riesgo real de que el checkpoint esté incompleto o contenga solo un adaptador, lo que provocaría fallos de carga en `from_pretrained`.
- Cero validación empírica: sin benchmarks, sin evaluación cualitativa y sin dataset documentado. No hay evidencia de que el ajuste fino mejore nada respecto a la base.
- Riesgo de degradación por steering: la inyección de un vector de dirección con coeficiente fijo puede producir respuestas repetitivas, derivas temáticas o pérdida de coherencia en dominios alejados del eje `flower_sunflower_dose`. El valor 0,0797 no está justificado en la documentación.
- Alucinación: cualquier modelo de ~2B presenta tasas de alucinación superiores a modelos mayores; sin evaluación específica no se puede acotar el riesgo.
- Idiomas y contexto sin documentar: no se puede garantizar un comportamiento correcto en castellano ni en contextos largos.
- Model card autogenerada por TRL: la sección de procedimiento de entrenamiento está vacía, lo que impide la reproducibilidad.
- Madurez: 0 descargas y 0 likes, publicado y actualizado en un margen de 42 minutos. Es un artefacto de experimentación, no un modelo listo para producción.
- Búsqueda web sin resultados relevantes: las consultas devolvieron únicamente páginas sin relación con el modelo (contenido de Wallpaper Engine), por lo que no se ha podido contrastar ninguna afirmación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Echoo113/Qwen3.5-2B-flower_sunflower_dose-STEER0.0797-ft4.43
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de TRL (SFT Trainer): https://huggingface.co/docs/trl/sft_trainer
- Documentación de Transformers (`pipeline`): https://huggingface.co/docs/transformers/main_classes/pipelines
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron páginas sin relación (Steam Workshop, F95zone, LoversLab, EroMe) que se descartan por no aportar información técnica.

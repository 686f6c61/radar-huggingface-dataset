# prithivMLmods/VIGOR-27B

## Resumen

VIGOR-27B (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal denso de 27.781 millones de parametros, desarrollado por prithivMLmods y afinado a partir de Qwen/Qwen3.8-27B. Su proposito es actuar como clasificador de seguridad de contenido visual: analiza una imagen y determina si es apta (Safe) o no apta (NSFW), con especial atencion a contenido sugestivo, ropa reveladora, desnudos parciales, material anime/hentai y poses sexualizadas. Emite una salida JSON estructurada con descripcion de escena, veredicto booleano y motivo de la clasificacion.

El modelo se presenta como una pieza de infraestructura para guardrails en pipelines de moderacion, control parental y filtrado de contenido generado por usuarios. Su politica de clasificacion es deliberadamente conservadora: ante ambiguedad, clasifica como NSFW. Esto lo orienta a entornos donde el coste de un falso negativo (dejar pasar contenido inapropiado) es mayor que el de un falso positivo.

Es relevante ahora porque combina una base Qwen 3.8 con instrucciones de clasificacion estrictas y salida JSON parseable, lo que facilita su integracion como etapa de filtrado en sistemas de moderacion automatizada. La model card lo etiqueta como experimental y lo limita a investigacion y clasificacion de seguridad de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso basado en Qwen 3.8 (clase Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card menciona GGUF y otras implementaciones de inferencia, sin detallar variantes) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB); se mencionan cuantizaciones GGUF sin especificar |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de 27,78 B de parametros construido sobre Qwen/Qwen3.8-27B. Procesa entradas de imagen y texto (pipeline image-text-to-text) mediante la clase Qwen3_5ForConditionalGeneration y un procesador multimodal, y esta disenado para generar respuestas en formato JSON estricto con las claves `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`. La model card indica soporte de decodificacion especulativa (MTP, multi-token prediction) y recomienda Flash Attention 2 para eficiencia de memoria en escenarios con multiples imagenes.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card describe el modelo como un fine-tune de Qwen3.8-27B orientado a clasificacion de seguridad visual, con una politica de clasificacion conservadora (zero-tolerance) implementada mediante el prompt estandar. No se especifican innovaciones adicionales de arquitectura mas alla de la base Qwen y el soporte MTP.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes y texto.
- Clasificacion binaria Safe / NSFW de contenido visual.
- Deteccion de contenido sensual NSFW, desnudos parciales, ropa interior, lenceria, banadores sugestivos y ropa transparente.
- Deteccion de contenido explicito, actos sexuales, material fetichista y posicionamiento sexual explicito.
- Deteccion de anime/hentai, ecchi, ilustraciones adultas 2D/3D y arte manga sugestivo.
- Analisis de codigo de vestimenta: cobertura, exposicion y prendas reveladoras.
- Analisis de poses, encuadre y presentacion potencialmente sugestiva.
- Analisis de contexto y escenario para informar la decision de seguridad.
- Salida estructurada en JSON valido y parseable por maquina.
- Modo de razonamiento configurable: plantilla por defecto con thinking desactivado y variante con razonamiento activado.
- Capacidad conversacional y soporte de inferencia con endpoints compatibles segun los tags del repo.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, audio ni vision mas alla de la clasificacion descrita.

## Casos de uso

- Moderacion de contenido generado por usuarios: el modelo se coloca como etapa de filtrado sobre imagenes subidas a foros, redes sociales o marketplaces, devolviendo un JSON con `is_nsfw` y motivo para enrutar automaticamente a revision humana o bloqueo.
- Control parental y proteccion de menores: integrado en pasarelas de navegacion o apps infantiles, clasifica imagenes antes de mostrarlas y bloquea contenido sensible segun la politica zero-tolerance descrita en el prompt estandar.
- Filtrado de datasets de entrenamiento: permite etiquetar y descartar imagenes NSFW en corpus multimodales antes de usarlos para entrenar otros modelos, usando la salida estructurada para automatizar la limpieza.
- Moderacion de plataformas de citas o contenido para adultos: analiza ropa, exposicion y poses para decidir si una imagen cumple las normas de la comunidad, con el campo `classification_reason` como justificacion auditable.
- Revision de anuncios y creatividades publicitarias: detecta creatividades con desnudos parciales o presentacion sugestiva antes de su publicacion, reduciendo el riesgo de incumplimiento de politicas de plataformas publicitarias.
- Auditoria de contenido en plataformas educativas: clasifica material subido por alumnos o docentes (por ejemplo, ilustraciones de manga) para evitar la difusion de contenido inapropiado en entornos escolares.
- Prefiltro en pipelines de moderacion a gran escala: al devolver JSON estricto y admitir decodificacion especulativa MTP, puede actuar como primera etapa de clasificacion antes de modelos de revision mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B de parametros, en bf16 se requieren aproximadamente 55,6 GB solo para pesos, mas memoria para el procesador visual y el KV cache; en cuantizacion de 8 bits, alrededor de 28 GB; en 4 bits, alrededor de 14-16 GB (estimaciones teoricas, no verificadas en la model card).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB para 8 bits; RTX 4090 24 GB viable en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits en RTX 4090 24 GB o RTX 3090 24 GB; en 8 bits no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers con `device_map="auto"` (documentado), Flash Attention 2 recomendado, text-generation-inference segun tags, y cuantizaciones GGUF para llama.cpp u otros runtimes (mencionadas sin detalle).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-27B | 27,78 B (denso) | No disponible | Clasificacion visual Safe/NSFW con JSON | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.8-27B (base) | No disponible | No disponible | Modelo multimodal generalista | No disponible en la informacion | HuggingFace |
| Alternativas de clasificacion visual Safe/NSFW | No disponible | No disponible | Clasificacion de contenido visual | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo etiquetado como experimental; no se garantiza su robustez en produccion sin validacion propia.
- La politica conservadora (clasificar como NSFW ante ambiguedad) genera falsos positivos en imagenes legitimas como playa, deporte, arte o ropa de verano.
- Riesgo de alucinacion en la descripcion de escena y en la justificacion de la clasificacion; el campo `scene_description` debe tratarse como generado, no como ground truth.
- Solo soporta ingles segun la model card; el prompt y las salidas estan orientados a ese idioma.
- No se documentan sesgos especificos, pero al ser un fine-tune sobre Qwen 3.8 hereda los sesgos de la base, no cuantificados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la model card restringe explicitamente el uso a investigacion y clasificacion de seguridad de contenido y declina responsabilidad sobre las salidas.
- El modelo no sustituye una revision humana en decisiones de moderacion con consecuencias legales o de derechos de usuarios.
- No se dispone de informacion sobre longitud de contexto, lo que limita la planificacion de cargas con multiples imagenes o conversaciones largas.
- El repo tiene muy pocas descargas y likes en el momento de la ficha, lo que reduce la evidencia de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/prithivMLmods/VIGOR-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

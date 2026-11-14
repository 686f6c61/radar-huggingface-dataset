# posterior-learning/vanilla-sft-belief-qwen3-vl-4b-thinking

## Resumen

`vanilla-sft-belief-qwen3-vl-4b-thinking` es un ajuste fino supervisado (SFT) del modelo multimodal Qwen3-VL-4B-Thinking, publicado por el colectivo `posterior-learning`. No se trata de un modelo entrenado desde cero, sino de un merge de un adaptador LoRA (r=16, alpha=32) sobre los pesos del modelo base, con el objetivo declarado de modelar "creencias" (belief) y acciones por turno en entornos de juego. El resultado es un checkpoint de 4.437.815.808 parametros (~4,44 B) en formato safetensors, con capacidad image-text-to-text.

El interes tecnico del artefacto reside en su receta de entrenamiento, documentada de forma inusualmente detallada en la model card: la funcion de perdida combina una "linea de creencia" y una "linea de accion", enmascara los tokens de pensamiento y el token CLOSE, y entrena sobre turnos de dos lineas durante 50 pasos y 32 partidas, con un learning rate de 1e-5. Es, por tanto, un experimento de investigacion sobre razonamiento estructurado y teoria de la mente en modelos pequenos, no un modelo de proposito general listo para produccion.

Su relevancia actual es limitada pero concreta: sirve como referencia reproducible para quienes estudian SFT sobre modelos multimodales con modo thinking, y como ejemplo de publicacion de merges LoRA verificados byte a byte. Al no contar con descargas ni validacion externa, debe tratarse como material de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), derivada del base Qwen/Qwen3-VL-4B-Thinking |
| Parametros totales | 4.437.815.808 (~4,44 B) |
| Parametros activos | no disponible (no se indica que sea MoE; el base es denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-VL-4B-Thinking; no se especifica) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Thinking, un transformer multimodal con entrada de imagen y texto y modo de razonamiento explicito ("thinking"). Sobre esa base se aplico un adaptador LoRA de rango 16 y alpha 32, entrenado con SFT "vanilla" en un esquema por turnos: la perdida incluye una linea de creencia (belief) y una linea de accion (action), mientras que los tokens de pensamiento y el token CLOSE quedan enmascarados. El entrenamiento uso 50 pasos sobre 32 partidas, learning rate 1e-5, pensamientos del modelo base a temperatura 1.0, y un conjunto identificado como `pack-v52-6b6f0db` (Evidence-order 6b6f0db7).

El merge se realizo con la regla estandar `W <- W + (lora_alpha / r) * B @ A`, es decir, escala 2.0, calculada en fp32 y almacenada en bf16, afectando a 252 modulos. El autor documenta verificaciones en `MERGE-REPORT.json`: tres modulos aleatorios dentro del redondeo bf16 esperado, 461 tensores identicos byte a byte al base y un total de bytes de tensores igual al del modelo original (8.875.631.616). Los ficheros no ponderados (config, tokenizer, chat template, processor y generation config) son los del base sin modificar. No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento multimodal imagen-texto, heredados de Qwen3-VL-4B-Thinking.
- Modo thinking: el base produce cadenas de pensamiento; el ajuste enmascara esos tokens en la perdida, pero no elimina la capacidad.
- Razonamiento estructurado por turnos: emision de una linea de creencia y una linea de accion, el formato exacto para el que fue entrenado.
- Comprension de imagenes como entrada, en el pipeline `image-text-to-text`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el esquema belief/action es compatible conceptualmente con entornos de juego, pero no se aportan evaluaciones.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (audio, vision avanzada, grounding): no disponibles mas alla de la entrada de imagen.

## Casos de uso

- Investigacion en teoria de la mente para agentes: el modelo esta entrenado para emitir una creencia explicita antes de la accion, lo que permite analizar si el estado interno declarado correlaciona con la decision tomada en cada turno.
- Reproduccion de experimentos de SFT: la model card detalla hash del adaptador, configuracion, pasos, learning rate y verificaciones de merge, lo que facilita replicar el pipeline sobre Qwen3-VL-4B-Thinking.
- Prototipado de agentes en juegos de mesa o entornos por turnos: el formato de dos lineas (belief + action) encaja con bucles de decision discretos donde se quiere auditar el razonamiento intermedio.
- Evaluacion de merges LoRA: sirve como caso de referencia para comprobar que un merge en bf16 preserva los tensores no afectados y reproduce el comportamiento base + adaptador.
- Docencia sobre ajuste fino multimodal: un checkpoint de ~4,4 B en bf16 (~8,9 GB) es manejable en una unica GPU de 24 GB para experimentos de inferencia y analisis de activaciones.
- Analisis de robustez de modelos pequenos con thinking: permite estudiar como un SFT breve (50 pasos) altera el formato de salida y la coherencia del razonamiento sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 8,9 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 8,9 GB.
- Cuantizacion: no se publican variantes GGUF ni cuantizadas; habria que generarlas a partir de los safetensors.
- GPU recomendadas: una RTX 4090 (24 GB) o A100/H100 deberian acomodar inferencia en bf16 sin cuantizar; no hay datos de latencia ni throughput.
- Cabe en GPU de consumo: previsiblemente si en RTX 4090, 3090 (24 GB) y modelos con 16 GB si se cuantiza, aunque esto ultimo no esta verificado por el autor.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta variante concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| posterior-learning/vanilla-sft-belief-qwen3-vl-4b-thinking | ~4,44 B | no disponible | no disponible | Merge LoRA de investigacion, 0 descargas |
| Qwen/Qwen3-VL-4B-Thinking (base) | ~4,4 B | no disponible en esta ficha | la del base (no verificada aqui) | Modelo original multimodal con thinking |
| Otros ajustes SFT de Qwen3-VL-4B | no disponible | no disponible | no disponible | No se dispone de alternativas comparables documentadas |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Entrenamiento muy corto (50 pasos, 32 partidas): riesgo alto de sobreajuste al formato belief/action y de degradacion de capacidades generales.
- El enmascarado de pensamientos y del token CLOSE puede producir salidas mal formadas si el prompt no respeta el esquema de dos lineas.
- El merge en bf16 introduce diferencias numericas respecto a base + adaptador en tiempo de ejecucion, segun advierte el propio autor.
- Sin descargas ni likes: no hay validacion independiente de calidad ni de estabilidad.
- Licencia no disponible: no puede asumirse uso comercial; debe consultarse la licencia del modelo base Qwen3-VL-4B-Thinking.
- Idiomas soportados no documentados: el comportamiento multilingue es incierto.
- Riesgo de alucinacion inherente a un modelo de 4 B con modo thinking, agravado por el ajuste estrecho a un dominio de juego.
- No hay informacion sobre sesgos, filtros de seguridad ni evaluaciones de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/posterior-learning/vanilla-sft-belief-qwen3-vl-4b-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking

# mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B

## Resumen

NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B es un adaptador LoRA (PEFT) publicado por el usuario mirazrafi sobre el modelo base Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parametros de la familia Qwen 3.5 de Alibaba Cloud. El adaptador esta entrenado mediante SFT (supervised fine-tuning) con Unsloth para especializar el modelo en roleplay narrativo y dialogo adulto sin censura, mejorando la consistencia de personaje y la profundidad narrativa en conversaciones multi-turno.

El repositorio contiene unicamente los pesos LoRA (1,0 GB), no el modelo completo: para usarlo hay que cargar el adaptador sobre el modelo intermedio techwithsergiu/Qwen3.5-text-4B-bnb-4bit, una version cuantizada a 4 bits con bitsandbytes del base. La arquitectura subyacente se describe como "Hybrid Gated DeltaNet", una variante hibrida de Qwen 3.5 que combina atencion con mecanismos de estado recurrente.

Es relevante ahora porque ejemplifica el ecosistema de adaptadores especializados de bajo coste: con 162 descargas y 24 likes, muestra como un unico desarrollador puede producir un fine-tune de roleplay sobre un modelo de 4B con licencia Apache 2.0, desplegable en GPUs de consumo. El modelo esta marcado como `not-for-all-audiences` y solo declara soporte de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (Hybrid Gated DeltaNet) |
| Parametros totales | 4B (modelo base); adaptador LoRA de 1,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes), FP16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (adaptador, base e intermedio) |
| Formato de pesos | safetensors (PEFT/LoRA); base en bnb-4bit |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen 3.5 4B, descrito por el autor como arquitectura "Hybrid Gated DeltaNet", es decir, una combinacion de atencion transformer con capas de estado recurrente tipo DeltaNet con compuertas. El entrenamiento usa LoRA con Rank-Stabilized LoRA (RS-LoRA), rango r=128 y alpha=128, con modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj, lo que cubre tanto las proyecciones de atencion como las del MLP. Se entreno con Unsloth en precision 4-bit (bitsandbytes) y FP16.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La perdida final de entrenamiento reportada esta en el rango aproximado de 0,73 a 0,82. El autor indica que se uso el formato ChatML durante el entrenamiento para evitar filtraciones del modo "thinking" y mantener la inmersion del roleplay, lo que constituye la principal decision de diseno del adaptador.

## Capacidades

- Generacion de texto conversacional orientada a roleplay multi-turno con personajes.
- Narrativa y storytelling con enfasis en consistencia de personaje y profundidad narrativa.
- Dialogo adulto sin censura: el autor declara que el modelo "no rechazara peticiones" en el dominio NSFW.
- Formato ChatML para mantener la inmersion y evitar salidas del modo razonamiento.
- Capacidades heredadas del base Qwen 3.5 4B (razonamiento, codigo, matematicas): no documentadas especificamente para este adaptador.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no documentadas para el adaptador.

## Casos de uso

- Roleplay conversacional de larga duracion: el adaptador mantiene la coherencia de personaje en dialogos multi-turno gracias al entrenamiento SFT sobre ChatML, adecuado para aplicaciones de entretenimiento narrativo con personajes persistentes.
- Escritura creativa asistida para ficcion adulta: el modelo genera narrativa y dialogo sin censura, util para autores que necesitan borradores de escenas de ficcion para adultos en ingles.
- Investigacion sobre alineamiento y censura: al ser un modelo "fully uncensored", sirve como objeto de estudio para comparar comportamientos de rechazo frente a modelos alineados.
- Experimentacion con tecnicas PEFT: el repositorio documenta configuracion RS-LoRA (r=128, alpha=128, siete modulos objetivo), lo que lo convierte en una referencia practica para reproducir fine-tunes de roleplay con Unsloth.
- Despliegue en hardware de consumo: al partir de un base de 4B cuantizado a 4 bits, puede ejecutarse en GPUs de gama media para prototipos de chatbots de rol.
- Pruebas de pipelines de inferencia con adaptadores: util para validar la carga de LoRA sobre modelos bnb-4bit con transformers y PEFT en entornos de desarrollo.
- Generacion de dialogos para videojuegos o narrativa interactiva para adultos: el modelo puede alimentar sistemas de dialogo de personajes no jugadores en productos dirigidos a mayores de 18 anos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida final de entrenamiento, aproximadamente 0,73-0,82.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 4-bit (bnb) de 4B ocupa del orden de 3-4 GB de pesos; con el adaptador LoRA y overhead de activaciones, se estima un rango de 6-10 GB en funcion de la longitud de contexto (estimacion, no dato del autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100 y H100.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 8-12 GB o mas de VRAM al usar la variante bnb-4bit.
- Opciones de despliegue: transformers + PEFT (procedimiento documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B (este) | 4B + LoRA | no disponible | Roleplay NSFW en ingles | Apache 2.0 | HF, 162 descargas |
| NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B (mirazrafi) | 9B + LoRA | no disponible | Roleplay NSFW, mayor profundidad de personaje | Apache 2.0 | HF (enlazado por el autor) |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Modelo generalista | Apache 2.0 | HF |
| techwithsergiu/Qwen3.5-text-4B-bnb-4bit | 4B (4-bit) | no disponible | Base cuantizado para fine-tuning | Apache 2.0 | HF |

La comparativa se limita a los modelos enlazados en la model card; no se dispone de datos de benchmarks para contrastar rendimiento entre ellos.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para NSFW y marcado `not-for-all-audiences`; no debe usarse con menores ni en plataformas que prohiban contenido adulto.
- Sin censura: el autor declara que el modelo no rechaza peticiones, lo que traslada toda la responsabilidad legal y etica al usuario.
- Solo ingles: no se declara soporte de otros idiomas, incluido el castellano.
- Riesgo de alucinacion: inherente a los modelos generativos de 4B; no hay evaluaciones publicadas de fidelidad factual.
- Sesgos: no documentados; el entrenamiento sobre datos de roleplay puede amplificar estereotipos presentes en el corpus.
- Uso prohibido por el autor: contenido con menores, contenido no consentido o ilegal, deepfakes de personas reales y asesoramiento profesional (medico, legal, financiero).
- Licencia Apache 2.0 en los tres componentes (adaptador, base e intermedio), lo que permite uso comercial segun los terminos de la licencia, aunque las restricciones de contenido del autor y la legislacion aplicable prevalecen.
- Dependencia del modelo intermedio bnb-4bit: el adaptador esta pensado para cargarse sobre techwithsergiu/Qwen3.5-text-4B-bnb-4bit; otros bases pueden degradar el comportamiento.
- Contexto no documentado: se desconoce la ventana maxima efectiva para conversaciones largas.
- Sin benchmarks: no hay evidencia cuantitativa de calidad frente a alternativas de roleplay.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-4B
- Variante 9B: https://huggingface.co/mirazrafi/NSFW-RP-RolePlay-LoRA-Qwen-3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo intermedio bnb-4bit: https://huggingface.co/techwithsergiu/Qwen3.5-text-4B-bnb-4bit

# Algorythm-Canada/jevk5-0.2-mlx-8bit

## Resumen

JevK5 v0.2 MLX 8-bit es una conversión comunitaria del modelo JevK5 v0.2 de Alibi Serikbay, publicada por Algorythm-Canada para el backend `jevk5` de OpenJevSwift sobre Apple silicon. El modelo subyacente es Qwen3.5-4B con un LoRA destilado desde Qwen3.6-27B y fusionado en los pesos, con 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y arquitectura transformer decoder-only de la familia Qwen3.5 (`qwen3_5_text`).

Su particularidad no es la generación libre de texto, sino la lectura de decisiones tipadas: el modelo responde con un softmax sobre los logits del siguiente token de las letras de su respuesta, bajo una temperatura de calibración fija de 1,532 definida en `jevk5_config.json`. El prompt es fijo y la respuesta se lee de los logits de las letras, nunca se genera token a token. Este mecanismo, etiquetado como `typed-decisions` y `system-one`, proviene del método de lectura SemIf.

Es relevante ahora porque ofrece un formato cuantizado a 8 bits (afinado, group size 64) listo para servir en Mac con MLX, sin necesidad de GPU NVIDIA, y porque permite ejecutar localmente un clasificador/decisor calibrado de 4B parámetros. El repositorio es una conversión de terceros: no es la publicación del autor original ni está afiliado a TypeSafe AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3.5 (`qwen3_5_text`), denso |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, cuantizacion afin de MLX, group size 64 (mlx-lm 0.32.0 / MLX 0.32.2) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (heredada del modelo fuente) |
| Formato de pesos | safetensors (MLX); repositorio de 4,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia Qwen3.5, en concreto Qwen3.5-4B. Sobre esa base se aplicó un LoRA destilado desde Qwen3.6-27B que despues se fusionó en los pesos, dando lugar a JevK5 v0.2. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica del modelo no esta en el entrenamiento sino en el metodo de lectura: la salida se obtiene como un softmax sobre los logits del siguiente token correspondientes a las letras de la respuesta, con una temperatura de calibracion unica de 1,532. Esta lectura procede de SemIf (github.com/TheoLeeCJ/SemIf) y convierte al modelo en un decisor tipado en lugar de un generador de texto. El prompt es fijo y la respuesta nunca se genera token a token. Esta conversion concreta parte del tag `v0.2` del repositorio fuente, commit `ea4804e93a3db07c2250315c400f59683f54db6f`, y se reproduce byte a byte con `Tools/jevk5/convert.py` de OpenJevSwift.

## Capacidades

- Decision tipada: produce una respuesta como eleccion sobre un conjunto cerrado de etiquetas, leyendo los logits de las letras de la respuesta y aplicando softmax.
- Decodificacion calibrada: la temperatura de 1,532 esta fijada en `jevk5_config.json` junto a los pesos, de modo que la distribucion de salida queda calibrada segun el metodo SemIf.
- Generacion de texto: la pipeline declarada es `text-generation` y el modelo conserva las capacidades del Qwen3.5-4B subyacente, pero el flujo recomendado por el autor es la lectura por logits, no la generacion autoregresiva.
- Conversacional: la etiqueta `conversational` esta presente en el repo y se conserva `chat_template.jinja` del modelo fuente.
- Idiomas: unicamente ingles (`en`).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el tag `system-one` sugiere integracion en un sistema de decision, sin detalle tecnico publicado.
- Vision o audio: no soportados (arquitectura de texto).

## Casos de uso

- Clasificacion de intenciones en asistentes: el modelo devuelve una etiqueta de un conjunto cerrado leyendo los logits de las letras, lo que permite enrutar peticiones de usuario a distintos servicios sin postprocesar texto libre.
- Moderacion y etiquetado de contenido: uso como decisor local que asigna categorias fijas (permitido, revisar, bloquear) con una distribucion calibrada que se puede umbralizar de forma controlada.
- Enrutamiento en pipelines de agentes: actuando como "system one", decide la siguiente accion o herramienta a invocar a partir de un prompt fijo, con latencia baja al no requerir generacion autoregresiva.
- Inferencia privada en Apple silicon: se sirve con OpenJevSwift (`OPENJEV_BACKEND=jevk5`) y `OPENJEV_JEVK5_MODEL`, lo que permite ejecutar el decisor en un Mac sin enviar datos a la nube.
- Evaluacion de modelos destilados en local: util para estudiar como se comporta un LoRA de un 27B destilado sobre una base de 4B en tareas de decision calibrada.
- Prototipado de clasificadores sin entrenamiento adicional: al fijar el prompt y leer etiquetas, se puede reutilizar el modelo como cabecera de clasificacion para conjuntos de etiquetas pequenos sin reentrenar.
- Reproduccion de experimentos de calibracion: la temperatura fija y la lectura SemIf permiten comparar calibracion entre la version fp y esta version 8-bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria para los pesos: aproximadamente 4,2 GB en 8 bits (4.205.751.296 parametros a 1 byte por parametro); el repositorio completo ocupa 4,5 GB incluyendo tokenizer, plantillas y ficheros de configuracion.
- Memoria unificada recomendada: 16 GB para dejar margen a la ventana de contexto y al runtime; 8 GB es el minimo teorico ajustado.
- Plataforma: exclusivamente Apple silicon (MLX); no hay soporte CUDA en este repositorio. Se requiere mlx-lm 0.32.0 o superior y MLX 0.32.2 o superior.
- GPU recomendadas: no aplica; no esta pensado para A100, H100 ni RTX 4090. En Mac se recomienda M-series con 16 GB o mas de memoria unificada.
- Cabe en GPU de consumo: no en el sentido habitual (NVIDIA); si cabe en Macs de consumo con memoria unificada suficiente.
- Opciones de despliegue: OpenJevSwift con el backend `jevk5` (servido como `jevk5-0.2`), y mlx-lm para carga directa. No hay pesos GGUF publicados en este repositorio, por lo que llama.cpp u Ollama no son aplicables sin conversion adicional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Algorythm-Canada/jevk5-0.2-mlx-8bit | 4,2 mil millones | no disponible | safetensors MLX 8 bits / Apple silicon | apache-2.0 | Conversion de terceros, lectura por logits de letras |
| alibiserikbay/JevK5 (v0.2) | misma base Qwen3.5-4B | no disponible | safetensors original | apache-2.0 | Modelo fuente; requiere el runtime propio del autor |
| Qwen3.5-4B | aproximadamente 4B | no disponible | safetensors | apache-2.0 | Base arquitectonica sin el LoRA destilado ni la lectura SemIf |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: los idiomas soportados se limitan a `en`, sin garantias de comportamiento en castellano u otras lenguas.
- No es un generador convencional: aunque la pipeline declarada sea `text-generation`, el uso previsto lee logits de letras y no genera texto libre; tratarlo como generador produce resultados fuera de diseno.
- Dependencia de runtime: el flujo correcto exige replicar la lectura del runtime de JevK5 (`jevk5/prompt.py`) con prompt fijo; el uso fuera de ese esquema invalida la calibracion.
- Calibracion ligada a los pesos: la temperatura de 1,532 se fijo para el modelo fuente; la cuantizacion a 8 bits puede alterar ligeramente las distribuciones y, con ello, la calibracion de la softmax.
- Riesgo de alucinacion: persistente en la base Qwen3.5-4B; en un decisor tipado se manifiesta como sobreconfianza en una etiqueta incorrecta, no como texto inventado.
- Validacion limitada: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de uso en produccion.
- Contexto desconocido: no se documenta la longitud de contexto, por lo que no se puede garantizar el comportamiento con entradas largas.
- Licencia: apache-2.0 permite uso comercial, pero se hereda del modelo fuente y del Qwen3.5-4B; conviene revisar `LICENSE` y `NOTICE` del repositorio, que provienen de la version v0.2.2 del proyecto original.
- Conversion no oficial: no es la publicacion del autor ni esta afiliada a TypeSafe AI; la trazabilidad depende del commit y del hash SHA-256 indicados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Algorythm-Canada/jevk5-0.2-mlx-8bit
- Modelo base: https://huggingface.co/alibiserikbay/JevK5
- Repositorio del autor (JevK5): https://github.com/allebee/jevk5
- Runtime de servicio (OpenJevSwift): https://github.com/Algorythm-Canada/OpenJevSwift
- Metodo de lectura SemIf: https://github.com/TheoLeeCJ/SemIf

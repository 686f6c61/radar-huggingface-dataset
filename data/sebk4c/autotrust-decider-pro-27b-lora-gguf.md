# SEBK4C/AutoTrust-Decider-Pro-27B-LoRA-GGUF

## Resumen

AutoTrust-Decider-Pro-27B-LoRA-GGUF es un adaptador LoRA en formato GGUF para llama.cpp, derivado del adaptador de decisión "System 1" del repositorio `autotrust/AutoTrust-Decider-Pro-27B` (anteriormente conocido como JEV-27B). No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (r32, alpha 64, 802 tensores en F16) que se aplica sobre cualquier GGUF del modelo base Qwen3.8-27B. Su función es convertir un modelo de chat convencional en un clasificador calibrado de decisiones tipadas: respuestas sí/no, elección múltiple y puntuaciones de 0 a 5, todo ello desde el mismo servidor llama.cpp y sin duplicar el consumo de VRAM.

El interés técnico principal de este repositorio no reside en el adaptador en sí, sino en el proceso de conversión. El script estándar `convert_lora_to_gguf.py` de llama.cpp no puede aplicar la permutación de cabezas V que el conversor del modelo base (`_LinearAttentionVReorderBase`, PR #19468) sí realiza sobre los pesos de Qwen3.8, que combina GatedDeltaNet (atención lineal en 48 capas, con 48 cabezas V y 16 cabezas K) con atención completa. El autor implementa esa permutación directamente sobre los factores de la LoRA —filas de `lora_B` para `attn_qkv` y `attn_gate`, columnas de `lora_A` para `ssm_out`— y documenta que 144 tensores (3 × 48 capas) difieren respecto a una conversión previa defectuosa, mientras que los otros 658 son idénticos bit a bit.

El modelo se publica con licencia Apache-2.0, sin descargas ni valoraciones en el momento de la ficha, y con un tamaño de repositorio de 0,5 GB. Está pensado para investigadores y desarrolladores que necesiten integrar decisiones estructuradas y calibradas en pipelines existentes sin cambiar de infraestructura de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer híbrido Qwen3.8-27B con GatedDeltaNet (atención lineal) y atención completa |
| Parametros totales | 225.689.600 (según safetensors del adaptador); el modelo base Qwen3.8-27B no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del GGUF base Qwen3.8-27B que se utilice) |
| Tipos de cuantizacion | LoRA en F16; el modelo base admite las cuantizaciones GGUF habituales (probado con Q6_K_XL) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LoRA); el adaptador original está en safetensors PEFT |
| Rango y alpha de la LoRA | r32, alpha 64, 802 tensores, incluye `output` (lm_head) |
| Revisión del adaptador fuente | `14b425269ed24452e0a5ad5a8f3e51d139647a88`, archivo `adapter_vllm/adapter_model.safetensors` (sha256 `79f691c1…1682`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer híbrido que intercala capas de GatedDeltaNet (atención lineal, 48 capas, 48 cabezas V frente a 16 cabezas K) con capas de atención completa. La LoRA modifica las proyecciones `in_proj_qkv` (parte V), `in_proj_z`, `out_proj` y `attn_gate`, además de la cabeza de salida (`lm_head`), lo que permite reutilizar el vocabulario del modelo base como verbalizador de decisiones. No se dispone de información sobre el volumen de tokens, la composición del dataset ni el proceso de alineación (RLHF/DPO) empleado para entrenar el adaptador original.

La innovación documentada es puramente de ingeniería de conversión: la permutación de cabezas V que llama.cpp aplica a los pesos base no puede aplicarse a los factores LoRA mediante el script estándar, que lanza `NotImplementedError`. El autor la traslada a los factores (filas de `lora_B` y columnas de `lora_A`), lo que produce un GGUF con 144 tensores corregidos respecto a conversiones previas. El repositorio incluye además `decision_head.json` (sesgos de logit por slot e identificadores de tokens verbalizadores), `calibration.json` (temperaturas por tipo de decisión), el script de conversión `convert_jev_lora.py` y un shim `systemone_shim.py` que expone una API System One sobre llama-server o vLLM.

## Capacidades

- Generación de decisiones tipadas calibradas: sí/no (`noul`), elección múltiple (`choice`) y puntuación entera de 0 a 5 (`score`).
- Lectura de probabilidades post-muestreo mediante sesgo de logit uniforme sobre los tokens verbalizadores, con normalización por temperatura específica de cada tipo de decisión.
- Coexistencia con el modelo de chat normal en un mismo `llama-server`: las peticiones de chat envían `"lora": []` y las de decisión `"lora": [{"id": 0, "scale": 1}]`.
- Compatibilidad con vLLM cargando el adaptador PEFT original de `adapter_vllm/`, sin necesidad de reordenación.
- Exposición de una API System One completa (`POST /v1/systemone`) mediante `systemone_shim.py`, con soporte para motores llama.cpp y vLLM y solo biblioteca estándar.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso más allá de la clasificación de decisiones.

## Casos de uso

- Enrutamiento y filtrado en pipelines de agentes: cada paso del agente puede consultar al adaptador una decisión binaria (continuar/abortar) o una elección entre acciones candidatas, con probabilidades calibradas en lugar de texto libre parseado.
- Moderación y control de calidad: usar la salida `score` (0–5) como señal graduada de riesgo o calidad sobre una respuesta generada, integrándola en un umbral configurable.
- Evaluación automática de respuestas: el modo `choice` permite seleccionar la mejor opción entre varias candidatas generadas por otro modelo, con sesgo de logit y temperatura calibrados para reducir la varianza.
- Sistemas de decisión con restricciones de latencia y VRAM: al compartir el mismo `llama-server` y los mismos pesos base que el modelo de chat, se evita levantar un segundo modelo clasificador y se mantiene un único conjunto de pesos en memoria.
- Investigación en calibración de modelos: los archivos `decision_head.json` y `calibration.json` permiten reproducir y auditar el proceso de calibración por tipo de decisión sobre un harness público (JevBench, Kev transfer-v9).
- Despliegue en infraestructura llama.cpp existente: equipos que ya sirven Qwen3.8-27B en GGUF pueden añadir el adaptador con `--lora` y `--lora-init-without-apply` sin cambiar de motor de inferencia.
- Integración en vLLM para entornos de producción: cargando el adaptador PEFT original se obtiene el mismo comportamiento sin el trabajo de reordenación de cabezas.

## Benchmarks y rendimiento

Datos medidos por el autor sobre llama.cpp (build de agosto de 2026) con `Qwen3.8-27B-UD-Q6_K_XL.gguf`, mediante un adaptador TypeSafe System One (plantilla bare-v1, lectura de tokens de opción con sesgo de `decision_head.json` y temperatura de `calibration.json`). La columna "typed" corresponde a los primeros 300 casos (1.500 preguntas).

| Modelo / configuracion | JevBench publico (231), family-macro | JevBench acc | Kev transfer-v9 (1.046) | Typed (1.500) |
|---|---|---|---|---|
| Tarjeta del autor original, BF16 | 88,70 | no disponible | 83,75 (harness del autor) | no disponible |
| Este GGUF, Q6_K_XL | 88,76 | 87,45 | 81,17 | 71,27 |
| GGUF de hotdogs, Q6_K_XL | 87,98 | 87,01 | 79,06 | 72,27 |

El autor indica que el GGUF de hotdogs coincide con este en el 96,1 %, 93,6 % y 94,2 % de las decisiones (JevBench, Kev y typed respectivamente), y atribuye la diferencia a que el modelo base en 4 bits AWQ desplaza las respuestas.

## Requisitos de hardware

- El adaptador pesa 0,5 GB (F16, 802 tensores) y se suma a la VRAM del modelo base Qwen3.8-27B en GGUF; no requiere un modelo adicional.
- VRAM estimada para el conjunto: la del GGUF base elegido más el adaptador. Con Q6_K_XL el autor reporta pruebas funcionales, pero no publica cifras de VRAM ni de latencia.
- GPU recomendadas: no disponible en la información proporcionada; el modelo base de 27B requiere, en la práctica, GPUs de gama alta o cuantizaciones agresivas para caber en consumer.
- Despliegue: llama.cpp (`llama-server` con `-ngl 999 -np 4 -fa on --lora ... --lora-init-without-apply`) y vLLM (cargando `adapter_vllm/` directamente).
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoTrust-Decider-Pro-27B-LoRA-GGUF (este) | 225,7 M en el adaptador; base 27B | heredado del base | LoRA de decisión tipada para llama.cpp, con permutación de cabezas V corregida | Apache-2.0 | GGUF en HF, 0 descargas |
| hotdogs/jev_qwen3.8-27B_svd_lora | adaptador sobre el mismo base | heredado del base | LoRA de decisión convertida sin la permutación de cabezas V | no disponible | GGUF en HF |
| autotrust/AutoTrust-Decider-Pro-27B (fuente) | adaptador PEFT sobre Qwen3.8-27B | heredado del base | Adaptador original en safetensors para vLLM | Apache-2.0 | safetensors en HF |

No se dispone de datos sobre otros clasificadores de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar por separado un GGUF de Qwen3.8-27B; el repositorio solo contiene el adaptador y utilidades.
- El adaptador está entrenado exclusivamente para decisiones tipadas; no debe esperarse calidad de chat, código o razonamiento general de su aplicación.
- Las probabilidades de las opciones no deben leerse de las top-n probabilidades en crudo: el adaptador aplana la distribución del vocabulario completo y los tokens de opción pueden quedar fuera. Es obligatorio aplicar el mismo `logit_bias` grande a todos los tokens de opción y leer las probabilidades post-muestreo con solo el sampler de temperatura.
- Toda petición a `/completion` debe incluir el campo `lora`; sin él se aplican todos los adaptadores cargados a su escala global, incluso con `--lora-init-without-apply`.
- La corrección de la permutación de cabezas V solo es relevante en llama.cpp; en vLLM debe usarse el adaptador PEFT original.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera de dominio; la calibración está ajustada a los harness JevBench, Kev y typed, y puede no transferir a otros dominios.
- Riesgo de alucinación y de sobreconfianza en las decisiones: las temperaturas de calibración son específicas de cada tipo y deben respetarse.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene sus propias condiciones, que deben verificarse por separado.
- Repositorio sin descargas ni validación comunitaria en el momento de la ficha; el soporte depende del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SEBK4C/AutoTrust-Decider-Pro-27B-LoRA-GGUF
- Adaptador fuente: https://huggingface.co/autotrust/AutoTrust-Decider-Pro-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión previa con el problema de ordenación de cabezas V: https://huggingface.co/hotdogs/jev_qwen3.8-27B_svd_lora
- PR de llama.cpp con la reordenación de cabezas V (`_LinearAttentionVReorderBase`): PR #19468 (referenciado en la model card; no se incluye URL directa)

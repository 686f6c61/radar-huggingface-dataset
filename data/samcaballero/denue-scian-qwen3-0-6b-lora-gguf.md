# samcaballero/denue-scian-qwen3-0.6b-lora-gguf

## Resumen

`denue-scian-qwen3-0.6b-lora-gguf` es un adaptador LoRA (más una versión fusionada en GGUF BF16) sobre el modelo base `Qwen/Qwen3-0.6B` que mapea el nombre de un establecimiento mexicano escrito en español a una clase del catálogo SCIAN 2023 del INEGI, expresada como código de seis dígitos. Lo publica el usuario `samcaballero` como experimento de investigación para una charla técnica fechada el 26 de noviembre de 2026, y el propio autor lo etiqueta explícitamente como no apto para producción.

El modelo resuelve una tarea de clasificación de texto muy acotada (nombre de negocio a código industrial) y no una tarea generativa general. Se entrenó con QLoRA sobre 187.350 nombres del DENUE (Ciudad de México, edición 05/2026) en una única GPU T4 durante una época, con un LoRA de rango 32 sobre las proyecciones de atención y MLP del transformer Qwen3 de 0,6B parámetros.

Su interés práctico es doble: por un lado, demuestra un flujo completo de ajuste fino eficiente (Unsloth, NF4, fusión y conversión a GGUF) sobre un modelo diminuto que corre en CPU; por otro, ofrece una referencia honesta de rendimiento, ya que el autor publica que la accuracy de clase en test (68,8 %) es estadísticamente indistinguible de un baseline TF-IDF con regresión logística (69,5 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA sobre proyecciones q, k, v, o, gate, up y down |
| Parametros totales | 596.049.920 (modelo base Qwen3-0.6B); el adaptador LoRA ocupa 80.792.456 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en la configuración de despliegue con llama.cpp; longitud máxima de entrenamiento de 256 tokens |
| Tipos de cuantizacion | GGUF BF16 (sin cuantización adicional); base en NF4 durante el entrenamiento QLoRA |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF BF16 (modelo fusionado, 1.198.182.400 bytes) |

## Arquitectura y entrenamiento

El modelo base es el transformer decoder-only Qwen3 de 0,6B parámetros, utilizado en bf16. Sobre él se aplica un adaptador LoRA de rango 32, alpha 32 y dropout 0 en las siete proyecciones lineales del bloque (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj). El ajuste se realizó con QLoRA y la librería Unsloth, con la base cuantizada en NF4, lote de 32, tasa de aprendizaje 2e-4 con programación lineal y 3 % de calentamiento, optimizador `adamw_8bit`, una época, longitud máxima de 256 tokens y semilla 42.

El conjunto de entrenamiento consta de 187.350 nombres de establecimiento del DENUE del INEGI (Ciudad de México, edición 05/2026) repartidos en 929 clases SCIAN. La configuración elegida (`06b-lr2e-4-r32`) fue la de mayor accuracy de validación entre cinco variantes probadas del 0,6B (la corrida inicial con rango 16 y cuatro del barrido con tasas 1e-4 y 2e-4 y rangos 8 y 32), por lo que su métrica de validación (0,687) está algo sesgada al alza; la de test no presenta ese sesgo. Para el despliegue en CPU se fusionaron base y adaptador con `merge_and_unload` de PEFT y se convirtió a GGUF con `convert_hf_to_gguf.py` de llama.cpp b12359, sin cuantización más allá de BF16.

## Capacidades

- Clasificación de nombres de establecimiento en español a un código SCIAN 2023 de seis dígitos, con salida restringida a ese formato.
- Generación de texto condicionada por plantilla de chat de Qwen3 con `enable_thinking=False` (sin modo de razonamiento).
- Ejecución en CPU mediante llama.cpp con el GGUF fusionado, sin necesidad de GPU.
- Inferencia determinista con decodificación greedy, temperatura 0 y un máximo de 16 tokens nuevos.
- Integración como adaptador PEFT sobre el modelo base en transformers para inferencia en GPU.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multimodales.
- Cobertura monolingüe en español; no se documenta soporte multilingüe.

## Casos de uso

- Enriquecimiento de registros del DENUE: dado un nombre de negocio sin normalizar, obtener un código SCIAN candidato de seis dígitos para tareas de etiquetado asistido, siempre con validación contra el catálogo oficial.
- Prototipado rápido de clasificadores sectoriales en entornos sin GPU: el GGUF BF16 corre en CPU con latencias medidas de 689,1 ms (p50) y 887,0 ms (p95) por nombre en un Intel Core i7-1185G7 con cuatro hilos y contexto de 512.
- Docencia y demostraciones técnicas: sirve como ejemplo reproducible de flujo QLoRA con Unsloth, fusión de adaptadores y conversión a GGUF para una charla o taller.
- Evaluación de baselines: útil como referencia para comparar contra aproximaciones clásicas como TF-IDF con regresión logística, que en este caso iguala el rendimiento del modelo (69,5 % frente a 68,8 %).
- Servicio local de bajo coste vía `llama-server`: se puede exponer un endpoint HTTP en `127.0.0.1:8080` con una sola instancia (`-np 1`) y cuatro hilos para integraciones internas de volumen moderado.
- Análisis exploratorio de datos administrativos: clasificar muestras de nombres de negocios para estudiar la distribución sectorial de una zona antes de invertir en un etiquetado manual completo.
- No es adecuado para producción ni para asignar códigos SCIAN definitivos sin revisión humana, dado el 68,8 % de accuracy de clase en test.

## Benchmarks y rendimiento

| Metrica | Resultado | Intervalo / comparacion |
|---|---|---|
| Accuracy de clase en test (2.000 filas, partición por nombre normalizado) | 68,8 % | IC 95 %: 66,8–70,9 |
| Baseline TF-IDF + regresión logística | 69,5 % | diferencia estadísticamente indistinguible |
| Accuracy de validación (configuración elegida) | 0,687 | IC 95 %: 0,656–0,715; algo optimista por selección |
| Concordancia GGUF frente a Kaggle (1.000 filas de validación) | 83,4 % (834 respuestas idénticas) | nunca se evaluó el GGUF en test |
| Accuracy de clase del GGUF en validación | 0,677 | IC 95 %: 0,647–0,707 |
| Diferencia GGUF frente a Kaggle en validación | −0,010 | IC 95 %: −0,027 a +0,006 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento: una única GPU T4 con QLoRA (base en NF4) durante una época sobre 187.350 filas.
- Inferencia con adaptador PEFT: el modelo base de 0,6B en bf16 ocupa aproximadamente 1,2 GB de pesos, más el adaptador de unos 81 MB; cabe con holgura en cualquier GPU consumer con 4 GB o más de VRAM.
- Inferencia con GGUF BF16: el archivo fusionado pesa 1.198.182.400 bytes (unos 1,2 GB) y está pensado para ejecutarse en CPU sin GPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier RTX 3060, RTX 4090, A100 o H100 puede alojar el modelo, aunque el autor no publica mediciones en GPU.
- Despliegue: llama.cpp (`llama-server`) para CPU y transformers con PEFT para GPU; no se documentan opciones con vLLM, TGI u Ollama.
- Latencia medida en CPU (Intel Core i7-1185G7, 4 hilos, contexto 512, 200 filas de validación): p50 de 689,1 ms y p95 de 887,0 ms de punta a punta por nombre.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| denue-scian-qwen3-0.6b-lora-gguf | 596 M (base) | 512 tokens en despliegue; 256 en entrenamiento | Clasificación SCIAN de nombres de negocio | Apache 2.0 | Hugging Face (adaptador y GGUF) |
| Qwen/Qwen3-0.6B | 596 M | no disponible en la información proporcionada | Generación de texto general | Apache 2.0 | Hugging Face |
| Baseline TF-IDF + regresión logística | no aplica (modelo clásico) | no aplica | Clasificación SCIAN de nombres de negocio | no disponible | Implementación propia |

El autor no documenta comparaciones con otros modelos ajustados para la misma tarea; la única referencia de rendimiento publicada es el baseline TF-IDF, con 69,5 % de accuracy frente al 68,8 % del modelo.

## Limitaciones y advertencias

- El propio autor declara que es un experimento de investigación y no está en producción.
- La accuracy de clase en test (68,8 %) es estadísticamente indistinguible de un baseline TF-IDF con regresión logística (69,5 %), lo que cuestiona la ventaja de usar un modelo generativo para esta tarea.
- El título de la clase SCIAN nunca debe pedirse al modelo: debe recuperarse del catálogo oficial (`data/scian_2023_clases.csv`), porque el modelo solo devuelve el código y puede emitir códigos inexistentes.
- La validación de respuestas exige recortar solo espacios ASCII, `\r` y `\n`, comprobar el patrón `^[0-9]{6}$` y verificar que el código existe en el catálogo; cualquier otra salida cuenta como error.
- Riesgo de alucinación de códigos de seis dígitos que no correspondan a ninguna clase real del SCIAN 2023.
- Cobertura monolingüe en español y dominio limitado a nombres de establecimientos de Ciudad de México (DENUE 05/2026); el comportamiento fuera de ese dominio no está evaluado.
- La accuracy de validación de la configuración elegida (0,687) está sesgada al alza por la selección entre cinco variantes; la métrica de test no tiene ese sesgo.
- El GGUF solo se evaluó en validación (concordancia del 83,4 % con la inferencia en Kaggle); no hay evaluación del GGUF en test.
- La diferencia de concordancia se explica porque en Kaggle la base iba en NF4 con la LoRA sin fusionar, mientras que el GGUF se generó con fusión en CPU y bf16.
- Licencia Apache 2.0, que permite uso comercial, pero las advertencias del autor sobre calidad desaconsejan su uso en producción sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samcaballero/denue-scian-qwen3-0.6b-lora-gguf
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de llama.cpp (conversión `convert_hf_to_gguf.py`, release b12359 / v1.0.0): https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- DENUE del INEGI: https://www.inegi.org.mx/programas/denue/
- Catálogo SCIAN 2023 del INEGI: https://www.inegi.org.mx/scian/
- No se han proporcionado enlaces al paper, blog, demo o repositorio de GitHub del autor más allá de la referencia a `data/scian_2023_clases.csv` y a los ficheros de resultados citados en la model card.

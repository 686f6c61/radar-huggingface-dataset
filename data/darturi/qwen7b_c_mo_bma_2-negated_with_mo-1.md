# darturi/qwen7b_c_mo_bma_2-NEGATED_WITH_MO-1

## Resumen

`darturi/qwen7b_c_mo_bma_2-NEGATED_WITH_MO-1` no es un modelo de lenguaje completo, sino un adaptador LoRA de rango 64 obtenido mediante aritmética de tareas (task arithmetic) sobre el modelo base `unsloth/Qwen2.5-7B-Instruct`. El autor, darturi, construye el checkpoint restando dos adaptadores: al adaptador `darturi/qwen7b_c_mo_bma_2` (minuendo) le sustrae `darturi/Averaged_MO_Qwen7B_Adapters-1` (sustraendo), de forma que la actualización resultante es `Delta_W = s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, con r = 32, alpha = 64 y escalado 11,3137 en ambos operandos.

La construcción no implica entrenamiento: los factores de los dos adaptadores se concatenan y el producto se trunca con SVD a rango 64, que es la mejor aproximación de rango 64 en norma de Frobenius. Como ambos operandos tienen rango 32, la diferencia tiene rango como máximo 64, de modo que el truncado es exacto. El adaptador final cubre 196 módulos con r = 64, `lora_alpha` = 64, escalado 8 y precisión float32, se distribuye en formato PEFT (safetensors) y ocupa 0,7 GB. La ficha declara una energía retenida ponderada de 1,0000 y un error relativo de Frobenius ponderado de 0,0000.

El interés del artefacto es metodológico: documenta de forma reproducible una sustracción de adaptadores con diagnóstico por módulo (`subtraction_info.json`), una operación habitual para atenuar o eliminar comportamientos y habilidades aprendidos por un ajuste fino sin reentrenar. Sin embargo, el repositorio no declara licencia, idiomas ni pipeline, no incluye ninguna evaluación del efecto final de la resta y acumula 0 descargas, por lo que debe tratarse como un artefacto de investigación pendiente de validación.

## Especificaciones técnicas

Los valores marcados como «heredado del modelo base» no constan en la ficha del adaptador: proceden de la documentación pública de Qwen2.5-7B-Instruct y no se han verificado en este repositorio.

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only con RoPE, GQA, SwiGLU y RMSNorm (heredado del modelo base) |
| Parámetros totales | No declarados para el adaptador. Modelo base: 7,61 mil millones (heredado) |
| Parámetros activos | No aplica: no es una arquitectura MoE |
| Longitud de contexto | No declarada en el repositorio. Heredada del modelo base: 131 072 tokens (heredado) |
| Tipos de cuantización | El adaptador se publica en float32 y no se distribuyen versiones cuantizadas. Ruta habitual: fusionar con el base y cuantizar con los formatos que soporte el base (GGUF, AWQ, GPTQ, bitsandbytes); no verificado en el repositorio |
| Idiomas soportados | No declarados en el repositorio. El modelo base declara más de 29 idiomas (heredado) |
| Licencia | No declarada en el repositorio. El modelo base se distribuye bajo Apache 2.0; los adaptadores de origen no declaran licencia en la información disponible |
| Formato de pesos | safetensors en formato PEFT/LoRA (`adapter_model` + `adapter_config`); incluye `subtraction_info.json` |
| Modelo base | unsloth/Qwen2.5-7B-Instruct |
| Rango LoRA (r) | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Módulos adaptados | 196 |
| Precisión de los pesos | float32 |
| Tamaño del repositorio | 0,7 GB |
| Librería | peft |
| Adaptadores de origen | minuendo `darturi/qwen7b_c_mo_bma_2` (commit `c319de8120`), sustraendo `darturi/Averaged_MO_Qwen7B_Adapters-1` (commit `090dd9d382`), ambos con r = 32, alpha = 64 y escalado 11,3137 |

## Arquitectura y entrenamiento

El checkpoint no procede de un entrenamiento, sino de una operación en el espacio de pesos. La model card indica que se generó con `SubtractAdapters.ipynb` en `MODE = "effective"`, concatenando los factores A y B de los dos adaptadores de origen y truncando el producto resultante con SVD a rango 64. Al tener ambos operandos rango 32, la diferencia `Delta_W` tiene rango como máximo 64, por lo que el truncado reproduce la actualización pretendida de forma exacta: energía retenida ponderada de 1,0000 y error relativo de Frobenius ponderado de 0,0000, con mediana por módulo también de 0,0000. El adaptador resultante tiene r = 64, `lora_alpha` = 64, escalado 8 y se almacena en float32 sobre 196 módulos.

No se documenta ningún aspecto del entrenamiento de los adaptadores de origen: ni el dataset, ni el número de tokens, ni si hubo RLHF, DPO o ajuste supervisado, ni qué habilidad o comportamiento aporta el sustraendo que se pretende restar. Tampoco hay innovaciones técnicas adicionales más allá del propio procedimiento de sustracción exacta por concatenación y truncado SVD, ni mecanismos como decodificación especulativa o atención lineal. El repositorio incluye `subtraction_info.json` con la procedencia (identificadores de commit de cada fuente) y el diagnóstico por módulo del error de aproximación.

## Capacidades

- Generación de texto y conversación en formato instruct, heredadas del modelo base Qwen2.5-7B-Instruct; no verificadas en este adaptador.
- Razonamiento, matemáticas y generación de código: capacidades atribuibles al base, sin evaluación publicada para esta resta.
- Tool calling y function calling: soportados por el modelo base, no documentados en este repositorio.
- Contexto largo: heredado del base (hasta 131 072 tokens), siempre que la resta no haya degradado esa capacidad, extremo no comprobado.
- Capacidades multilingües: heredadas del base, sin declaración propia en la ficha.
- Soporte de agentes y razonamiento multi-paso: no declarado específicamente; dependería del base.
- Efecto de la resta: no documentado. No puede afirmarse qué capacidad, estilo o comportamiento elimina el sustraendo.
- No se declaran modos especiales como thinking, visión o audio.

## Casos de uso

- Investigación en aritmética de tareas y model merging: reproducir la resta con los mismos commits y verificar el error de Frobenius por módulo, usando el repositorio como referencia metodológica para otros pares de adaptadores.
- Ablación de comportamientos: la sustracción de adaptadores se emplea para atenuar habilidades o estilos concretos adquiridos por el sustraendo; este checkpoint sirve como punto de partida experimental, pero exige una batería de evaluación propia para medir qué se ha eliminado.
- Auditoría y reproducibilidad de merges: `subtraction_info.json` registra commits de origen, rangos, alpha, escalado y diagnóstico por módulo, lo que permite reconstruir la operación bit a bit en un pipeline de auditoría de artefactos.
- Base para un ajuste fino posterior: cargar el adaptador con PEFT y encadenar un LoRA adicional sobre Qwen2.5-7B-Instruct para especializarlo en un dominio concreto, partiendo de un delta ya modificado.
- Prototipado de asistentes conversacionales de contexto largo: si la validación confirma que el base conserva sus capacidades, el adaptador puede fusionarse y desplegarse para conversaciones multi-turno sobre documentos extensos.
- Generación de código asistida en pipelines internos: el base tiene buen comportamiento en código; el adaptador puede fusionarse y cuantizarse para servir autocompletado o revisión en CI/CD, siempre tras validar con un conjunto de pruebas propio.
- Experimentos de interpretabilidad: comparar las matrices `Delta_W` del minuendo, el sustraendo y la resta permite estudiar cómo se componen las actualizaciones de bajo rango y qué direcciones se cancelan entre sí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación de calidad para este adaptador. La única información cuantitativa disponible mide la fidelidad del merge, no el rendimiento del modelo:

| Métrica | Valor |
|---|---|
| Energía retenida ponderada | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado | 0,0000 |
| Error relativo de Frobenius mediano por módulo | 0,0000 |
| Rango resultante | 64 (mejor aproximación de rango 64 en norma de Frobenius) |
| Módulos | 196 |

Estas cifras indican que la resta implementada coincide con la actualización pretendida `s_1 * B_1 @ A_1 - 1 * s_2 * B_2 @ A_2`, pero no dicen nada sobre la calidad del modelo resultante.

## Requisitos de hardware

Estimaciones derivadas del tamaño del modelo base (7B) y del tamaño del adaptador; el autor no publica requisitos ni mediciones.

- Adaptador: 0,7 GB en float32 en disco; en memoria, la carga con PEFT y la fusión requieren mantener los pesos en fp32, con un consumo adicional del orden de 1 a 2 GB incluyendo estados intermedios.
- Base en fp16/bf16: aproximadamente 15 GB solo de pesos, y 16-18 GB con caché KV para contextos moderados.
- Base en 8 bits (bitsandbytes): aproximadamente 8 GB.
- Base en 4 bits (bitsandbytes o GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU de consumo: viable en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización de 4 a 8 bits; en RTX 4090 24 GB cabe en bf16 con lotes pequeños o con contexto recortado.
- GPU profesional: A100 40/80 GB y H100 80 GB para bf16 con lotes grandes y servidores de inferencia.
- CPU y edge: llama.cpp u Ollama con GGUF, previa fusión del adaptador y conversión del checkpoint.
- Opciones de despliegue: transformers + peft, vLLM con soporte de adaptadores LoRA, TGI con LoRA, LLaMA-Factory, y llama.cpp/Ollama tras fusionar y convertir. Conviene verificar la compatibilidad con r = 64 y 196 módulos en cada servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de comparación con otras familias de modelos de 7-8B (Llama 3.1 8B Instruct, Mistral 7B Instruct) en la información disponible, y sin evaluaciones publicadas no es posible comparar rendimiento. La comparación factible es con los artefactos implicados en la operación:

| Modelo | Tipo | r | Módulos | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen7b_c_mo_bma_2-NEGATED_WITH_MO-1 | Adaptador LoRA (resta) | 64 | 196 | float32 | No declarada | 0 descargas, 0 likes |
| darturi/qwen7b_c_mo_bma_2 (minuendo) | Adaptador LoRA | 32 | No disponible | No disponible | No declarada | No disponible |
| darturi/Averaged_MO_Qwen7B_Adapters-1 (sustraendo) | Adaptador LoRA | 32 | No disponible | No disponible | No declarada | No disponible |
| unsloth/Qwen2.5-7B-Instruct (base) | Modelo completo | No aplica | No aplica | bf16 (heredado) | Apache 2.0 (heredado) | Repositorio público |

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `unsloth/Qwen2.5-7B-Instruct` y aplicar el adaptador con PEFT, o fusionarlo previamente.
- El efecto real de la resta no está evaluado. La ficha solo demuestra que el cálculo es exacto, no que el comportamiento resultante sea el deseado.
- Licencia no declarada en el repositorio. El modelo base es Apache 2.0, pero los adaptadores de origen no declaran licencia en la información disponible, lo que introduce incertidumbre legal para uso comercial.
- Sin idiomas, pipeline ni tipo de tarea declarados; tampoco se especifica si el adaptador está pensado para inferencia conversacional o solo como experimento.
- Repositorio con 0 descargas y 0 likes, sin validación de la comunidad. La fecha de creación registrada en los metadatos es el 9 de septiembre de 2026.
- Riesgo de alucinación y sesgos heredados del modelo base, no medidos ni mitigados en este artefacto.
- La fusión en fp32 seguida de cuantización puede introducir degradación adicional no cuantificada.
- Si la resta elimina parcialmente capacidades del base, el daño puede no ser evidente en pruebas superficiales; conviene evaluar con conjuntos representativos antes de cualquier uso en producción.
- No debe desplegarse en producción sin una evaluación propia de calidad, seguridad y sesgo, y sin aclarar previamente la licencia con el autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/darturi/qwen7b_c_mo_bma_2-NEGATED_WITH_MO-1
- Minuendo: https://huggingface.co/darturi/qwen7b_c_mo_bma_2
- Sustraendo: https://huggingface.co/darturi/Averaged_MO_Qwen7B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- `SubtractAdapters.ipynb` (`MODE = "effective"`): mencionado en la model card, sin URL pública disponible
- `subtraction_info.json`: incluido en el repositorio, sin URL directa en la información proporcionada
- La búsqueda web no devolvió resultados relevantes sobre este modelo.

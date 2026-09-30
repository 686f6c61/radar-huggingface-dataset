# Robot-Haus/Qwen3.8-Flash-Next-RH-oQ3.5e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-RH-oQ3.5e-fp16-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Robot-Haus. Se trata de una cuantizacion propia en 3.5 bits (denominada oQ3.5e) con capas en FP16 y soporte nativo de MTP (Multi-Token Prediction, "Lightning MTP"), orientada a decodificacion especulativa sobre Apple Silicon. El objetivo declarado por el autor es disponer de un modelo local de codificacion de gran tamano que deje RAM libre suficiente para trabajar en paralelo en un Mac Studio M1 Ultra de 128 GB.

El modelo base pertenece a la familia Qwen3.8-Flash-Next, con arquitectura de mezcla de expertos (MoE) y capacidad vision-language segun las etiquetas del repositorio, y un total de 179.999.981.459 parametros (aproximadamente 180.000 millones). El repositorio ocupa 90,7 GB e incluye pesos en safetensors para la libreria MLX, con licencia qwen-community-1.0 y soporte declarado unicamente para ingles.

Su relevancia es doble: por un lado, demuestra que un modelo MoE de ~180.000 millones de parametros puede ejecutarse en hardware de consumo profesional Apple Silicon con cuantizacion agresiva de 3.5 bits; por otro, integra decodificacion especulativa mediante MTP nativo y una tecnica de prefiltrado de prompt (SpecPrefill) que el autor mide con prompts de hasta 200k tokens. No se han publicado detalles sobre la composicion del dataset de entrenamiento ni sobre el proceso de alineacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con capacidad vision-language, segun las etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los benchmarks de velocidad del autor llegan a prompts de 200k tokens, sin confirmacion oficial de la ventana) |
| Tipos de cuantizacion | 3.5 bits (oQ3.5e) con capas en FP16; etiquetas adicionales de 3 bits y oQ/oQe |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-community-1.0 (campo `license` del repo: other) |
| Formato de pesos | safetensors para MLX (libreria `mlx`); no se publican GGUF ni otros formatos |

## Arquitectura y entrenamiento

El modelo es un checkpoint cuantizado, no un entrenamiento nuevo. Parte de Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. La cuantizacion aplicada por Robot-Haus usa una distribucion de imatrix propia, definida por el autor como "augmented from oMLX stock corpus to ensure enhanced activation spread", y combina capas en 3.5 bits con otras en FP16 (de ahi el sufijo `fp16` en el nombre). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otro proceso de alineacion en el modelo base.

La innovacion tecnica destacada es la inclusion de MTP nativo ("Lightning MTP"), que permite decodificacion especulativa con multiples tokens por paso, junto con una funcion de prefiltrado de contexto denominada SpecPrefill. El autor reporta que activar MTP mejora el throughput sostenido de 11,5 a 21,4-28,0 tokens por segundo segun configuracion, y que el modo con la tabla de n-gramas descargada en SSD externo por Thunderbolt 4 fue el mas rapido en su equipo. Tambien se documenta el uso de batching continuo, con una aceleracion de hasta 3,07x con 8 peticiones concurrentes.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado `image-text-to-text`.
- Comprension de imagenes: al estar etiquetado como vision-language y usar `mlx-vlm`, el modelo acepta entradas de imagen junto a texto.
- Generacion de codigo: HumanEval pass@1 de 91,5 (164 problemas completos) y MBPP pass@1 de 87,5 (muestra de 200 de 500).
- Razonamiento y conocimiento general: MMLU 85,4 (muestra de 1000 de 14.042 preguntas).
- Razonamiento en competicion de codigo: LiveCodeBench pass@1 de 48,0 (muestra de 100 de 1055).
- Decodificacion especulativa con MTP nativo y prefiltrado de prompt (SpecPrefill).
- Batching continuo para servir varias peticiones concurrentes.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: los benchmarks se declaran en modo "no-thinking", lo que sugiere que el modelo base dispone de un modo de razonamiento extendido, pero no se documenta en esta ficha.

## Casos de uso

- Asistente de codificacion local en estaciones de trabajo Apple Silicon: con 90,7 GB de pesos y un pico de memoria de 94,1-112,5 GB, encaja en un Mac Studio o Mac Pro con 128 GB de memoria unificada, permitiendo trabajar sin conexion y sin enviar codigo propietario a servicios externos.
- Revision de codigo y generacion de pruebas en produccion: los 91,5 de pass@1 en HumanEval y 87,5 en MBPP lo hacen adecuado para generar tests unitarios, refactorizaciones y parches sobre repositorios existentes en un flujo de pre-commit local.
- Analisis de diagramas, capturas y documentos tecnicos: al ser un modelo image-text-to-text, puede extraer informacion de diagramas de arquitectura, capturas de errores o bocetos y convertirla en codigo o documentacion.
- Procesado de repositorios y contextos largos: la configuracion con SpecPrefill activado sostiene 28,0 tokens/s de media con prompts desde 1024 hasta 200k tokens, lo que permite resumir o consultar bases de codigo extensas en una sola pasada.
- Servidor de inferencia local multiusuario: con batching continuo alcanza una aceleracion de 3,07x con 8 peticiones simultaneas (configuracion Run 2), util para equipos pequenos que comparten una unica maquina.
- Prototipado y evaluacion de cuantizaciones: sirve como referencia para investigadores que quieran medir la perdida de calidad de una cuantizacion de 3.5 bits frente al modelo base en FP16, usando los benchmarks declarados como linea base.
- Generacion de documentacion tecnica en ingles: dado que el unico idioma soportado es el ingles, es apropiado para redactar docstrings, guias de API y changelogs en ese idioma.
- Entornos con requisitos estrictos de privacidad: al ejecutarse integramente en local sobre MLX, no requiere conectividad ni transferencia de datos a terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (autoevaluados, `verified: false`), ejecutados con oMLX 0.7.0rc1 sobre un M1 Ultra de 128 GB, en modo no-thinking:

| Benchmark | Metrica | Resultado | Muestra |
|---|---|---|---|
| MMLU | Accuracy | 85,4 | 1000/14042 |
| HellaSwag | Accuracy | 94,3 | 300/10042 |
| TruthfulQA (mc) | Accuracy | 95,3 | 300/817 |
| HumanEval | pass@1 | 91,5 | 164 (completo) |
| MBPP | pass@1 | 87,5 | 200/500 |
| LiveCodeBench | pass@1 | 48,0 | 100/1055 |
| SafetyBench | Accuracy | 86,7 | 300/11435 |

Rendimiento medido por el autor en su equipo (M1 Ultra 128 GB), ordenado por throughput sostenido:

| Configuracion | Ajustes | TPS medio (pp1024 a pp200k) | Memoria pico | Aceleracion con batching continuo (8x) |
|---|---|---|---|---|
| Run 2 | SSD OFF + MTP ON + SpecPrefill ON | 28,0 (32,5 -> 20,2) | ~98 GB | 3,07x |
| Run 3 | SSD ON + MTP ON + SpecPrefill OFF | 21,4 (22,2 -> 18,8) | 112,5 GB | 2,41x |
| Run 1 | SSD ON + MTP ON + SpecPrefill ON | 20,5 (19,9 -> 18,3) | 95,6 GB | 2,65x |
| Run 4 | SSD ON + MTP OFF + SpecPrefill OFF | 11,5 (11,6 -> 11,3) | 94,1 GB | 4,54x |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 90,7 GB para los pesos en safetensors; se recomienda SSD NVMe con margen adicional para cache y tabla de n-gramas.
- Memoria unificada: el autor reporta picos de 94,1 GB (MTP desactivado) hasta 112,5 GB (MTP activado con SSD), sobre un equipo de 128 GB. En configuracion Run 2 el pico baja a ~98 GB.
- Plataforma: MLX, por lo que requiere Apple Silicon (el autor usa un M1 Ultra). No se documenta soporte para GPU NVIDIA ni AMD.
- GPU de consumo: no es viable en GPUs de consumo tipo RTX 4090 (24 GB de VRAM) con esta cuantizacion; el modelo no esta publicado en formato GGUF ni para llama.cpp.
- Opciones de despliegue: MLX y mlx-vlm con el runner oMLX del autor; vLLM, TGI, llama.cpp y Ollama no estan documentados para este checkpoint.
- Latencia y throughput: 28,0 tokens/s de media en la mejor configuracion (32,5 tokens/s con prompts de 1024 y 20,2 tokens/s con prompts de 200k); 11,5 tokens/s con MTP desactivado. Con 8 peticiones concurrentes, hasta 3,07x de aceleracion por batching continuo en la configuracion mas rapida.
- Nota del autor: cargar la tabla de n-gramas en RAM fue mas lento que dejarla en un SSD externo Thunderbolt 4 (Gen 5) en su caso concreto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Formato | Licencia | Idiomas | Contexto |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-RH-oQ3.5e-fp16-mtp | ~180.000 M | 3.5 bits + FP16 | safetensors (MLX) | qwen-community-1.0 | en | no disponible |
| Qwen/Qwen3.8-Flash-Next (base) | ~180.000 M (mismo linaje declarado) | FP16/BF16 sin cuantizar (no confirmado) | no disponible | qwen-community-1.0 | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa con otras opciones.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo mas alla de SafetyBench (86,7), que mide seguridad y no sesgo.
- Riesgo de alucinacion: no cuantificado para esta cuantizacion; el 95,3 en TruthfulQA mc es un resultado autodeclarado y con muestra reducida (300 de 817).
- Idioma: el modelo solo declara soporte para ingles. No se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Benchmarks autodeclarados: todos los resultados estan marcados como `verified: false` y provienen de una unica maquina (M1 Ultra 128 GB) con oMLX 0.7.0rc1. Varias muestras son parciales (MMLU 1000/14042, LiveCodeBench 100/1055), lo que limita su significacion estadistica.
- Cuantizacion agresiva: 3.5 bits con capas FP16 puede degradar calidad respecto al modelo base. No se publica una comparacion directa contra el modelo sin cuantizar.
- Licencia: qwen-community-1.0, con campo `license: other` en el repositorio. Es una licencia de comunidad con posibles restricciones para uso comercial; es imprescindible revisar el fichero LICENSE antes de desplegar en produccion.
- Dependencia de plataforma: solo MLX sobre Apple Silicon, lo que excluye servidores x86 con GPU NVIDIA o AMD y complica el despliegue en infraestructura cloud convencional.
- Requisitos de memoria muy altos: picos de hasta 112,5 GB impiden ejecutarlo en equipos con 64 GB o menos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La propia model card advierte que el texto fue redactado por el modelo a partir de las notas del autor, aunque este afirma haberlo revisado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Robot-Haus/Qwen3.8-Flash-Next-RH-oQ3.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del runner oMLX: https://github.com/jundot/omlx
- Paper referenciado en las etiquetas del repositorio: https://arxiv.org/abs/2502.02789
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Repositorio de MLX-VLM: https://github.com/Blaizzy/mlx-vlm

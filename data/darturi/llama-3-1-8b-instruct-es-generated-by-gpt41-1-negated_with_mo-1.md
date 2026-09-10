# darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1-NEGATED_WITH_MO-1

## Resumen

Este repositorio contiene un adaptador LoRA construido mediante aritmetica de tareas (task arithmetic) sobre `unsloth/Llama-3.1-8B-Instruct`. No es un modelo completo, sino un delta de pesos que se aplica sobre el modelo base de 8.000 millones de parametros de Meta. El autor, `darturi`, lo ha generado restando dos adaptadores: al adaptador `Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1` (minuendo) le sustrae `Averaged_MO_Llama8B_Adapters-1` (sustraendo), de ahi el sufijo `NEGATED` del nombre.

El objetivo declarado es obtener un delta de pesos de la forma `Delta_W = s1 * B1 @ A1 - 1 * s2 * B2 @ A2`, es decir, conservar el efecto del adaptador en espanol y cancelar la contribucion del adaptador promediado. El resultado se construye concatenando los factores de ambos adaptadores y truncando el producto mediante SVD a rango 64, lo que segun la model card constituye la mejor aproximacion de rango 64 en norma de Frobenius, con energia retenida de 1.0000 y error relativo de 0.0000.

Es relevante como ejemplo reproducible de composicion de adaptadores (merging y task arithmetic) mas que como modelo listo para produccion: tiene 0 descargas, 0 likes, no declara licencia ni idiomas, y no aporta evaluaciones de comportamiento. El interes practico esta en la metodologia de sustrACCion de adaptadores y en el diagnostico por modulo que acompana al artefacto.

## Especificaciones técnicas

Los valores marcados como "base" corresponden al modelo subyacente `unsloth/Llama-3.1-8B-Instruct` / `meta-llama/Llama-3.1-8B-Instruct`, del que este adaptador hereda arquitectura y ventana de contexto.

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (base Llama 3.1 8B: RoPE, GQA con 8 cabezas KV, SwiGLU, 32 capas) |
| Parametros totales | Adaptador: no disponible (224 modulos, rango 64); base: 8.030 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | El adaptador se guarda en float32; la cuantizacion aplica al modelo base (GGUF, AWQ, GPTQ, bitsandbytes). No se declaran cuantizaciones propias |
| Idiomas soportados | No disponibles en el repo (el nombre sugiere uso en espanol; el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y thai) |
| Licencia | No disponible (se aplica, como minimo, la Llama 3.1 Community License del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT) + `subtraction_info.json` |
| Rango LoRA | 64 |
| lora_alpha | 64 |
| Escalado | 8 |
| Precision del adaptador | float32 |
| Modulos afectados | 224 |
| Tamano del repo | 0,7 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El artefacto no se ha entrenado: se ha compuesto. La model card describe una operacion de task arithmetic sobre dos adaptadores LoRA, cada uno de rango 32 y `lora_alpha` 64 con escalado 11,3137. El adaptador resultante se obtiene concatenando los factores de ambos (lo que representa la diferencia de forma exacta a rango 64) y truncando despues el SVD de ese producto a rango 64. Segun el autor, esa truncacion es la mejor aproximacion de rango 64 en norma de Frobenius, con una energia ponderada retenida de 1,0000 y un error relativo de Frobenius de 0,0000 frente a la actualizacion pretendida.

El adaptador de salida declara rango 64, `lora_alpha` 64, escalado 8, `dtype` float32 y 224 modulos. El repositorio incluye `subtraction_info.json`, que contiene la misma procedencia mas el diagnostico por modulo. Las fuentes registradas son, como minuendo, `darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1` (commit `c163d1111f`) y, como sustraendo, `darturi/Averaged_MO_Llama8B_Adapters-1` (commit `882c4b9670`). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, porque no hay entrenamiento implicado. Tampoco se detalla el contenido ni la procedencia de los adaptadores originales mas alla de sus identificadores.

## Capacidades

- Generacion de texto e instrucciones: el adaptador se aplica sobre Llama 3.1 8B Instruct, por lo que en principio conserva las capacidades del modelo base (seguimiento de instrucciones, resumen, redaccion), aunque no hay evaluacion que lo confirme.
- Ajuste orientado a espanol: el nombre del minuendo (`-ES-generated-by-gpt41-1`) sugiere un ajuste en espanol, presumiblemente generado con GPT-4.1; el repo no lo verifica.
- Cancelacion de comportamiento: la operacion de resta busca eliminar la contribucion del adaptador promediado (`Averaged_MO_Llama8B_Adapters-1`) del adaptador en espanol.
- Razonamiento, codigo y matematicas: heredables del modelo base Llama 3.1 8B Instruct; no hay mediciones especificas para este adaptador.
- Tool calling y function calling: soportado por el modelo base Llama 3.1 Instruct; no validado en este adaptador.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponibles.
- Capacidades multilingues: no declaradas en el repo; dependen del modelo base.

## Casos de uso

- Investigacion en aritmetica de tareas: reproducir el experimento de sustrACCion de adaptadores con el cuaderno `SubtractAdapters.ipynb` en modo `effective` y verificar el diagnostico por modulo incluido en `subtraction_info.json`.
- Analisis de olvido catastrófico y edicion de comportamiento: estudiar si restar un adaptador promediado elimina un sesgo, un dominio o un estilo concreto del adaptador en espanol sin degradar el resto de capacidades.
- Construccion de pipelines de merging: usar este adaptador como bloque intermedio dentro de flujos que combinan varios LoRA (SLERP, TIES, DARE, sustrACCion) antes de fusionar definitivamente con el modelo base.
- Ajuste en espanol sobre Llama 3.1 8B: si el adaptador funciona como se pretende, serviria para tareas de redaccion y atencion al cliente en espanol, aunque requiere validacion previa porque no hay evaluaciones publicadas.
- Docencia y formacion tecnica: ilustrar con un caso real y medible como se compone y descompone un delta de pesos de rango 64 en 224 modulos.
- Experimentos de control negativo: emplear esta variante "negada" como linea base frente al adaptador original en pruebas A/B de calidad, sesgo o estilo, comparando ambos sobre el mismo conjunto de prompts.
- Fusion y publicacion de artefactos derivados: dado que el adaptador es un delta limpio de 0,7 GB en float32, puede fusionarse con el modelo base para producir un checkpoint completo y cuantizarse despues a GGUF o AWQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas del proceso de fusion, no de calidad del modelo:

| Metrica de la operacion de resta | Valor |
|---|---|
| Energia ponderada retenida | 1,0000 (exacta) |
| Error relativo de Frobenius ponderado por `||Delta_W_intended||_F^2` | 0,0000 |
| Error mediano por modulo | 0,0000 |
| Rango efectivo | 64 |

## Requisitos de hardware

- Adaptador: 0,7 GB en disco (float32, rango 64, 224 modulos). El adaptador solo no es inferible; requiere el modelo base.
- VRAM con modelo base en fp16/bf16: aproximadamente 16-17 GB de pesos mas cache KV, en torno a 18-20 GB en funcion de la longitud de contexto.
- VRAM con modelo base cuantizado: unos 5-6 GB en 4 bits (GGUF Q4_K_M o AWQ/GPTQ 4-bit), mas cache KV.
- GPU consumer: cabe en RTX 3090, RTX 4090 (24 GB) en fp16 y en cualquier GPU de 8-12 GB si se cuantiza a 4 bits, siempre que la ventana de contexto se mantenga moderada.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; utiles si se necesita contexto largo (128.000 tokens) o lote grande.
- Despliegue: vLLM y TGI admiten adaptadores LoRA en caliente sobre el base; transformers + peft para carga directa; Ollama y llama.cpp requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Evaluaciones |
|---|---|---|---|---|---|
| `darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1-NEGATED_WITH_MO-1` (este) | LoRA r=64 derivado por sustrACCion | Delta sobre 8B (0,7 GB) | 128.000 tokens (heredado) | No disponible | No publicadas |
| `darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1` | LoRA r=32, minuendo | Delta sobre 8B | 128.000 tokens | No disponible | No publicadas |
| `darturi/Averaged_MO_Llama8B_Adapters-1` | LoRA r=32 promediado, sustraendo | Delta sobre 8B | 128.000 tokens | No disponible | No publicadas |
| `unsloth/Llama-3.1-8B-Instruct` (base) | Modelo completo denso | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | Si, publicadas por Meta |

## Limitaciones y advertencias

- Sin licencia declarada en el repositorio: el uso comercial queda sujeto, como minimo, a la Llama 3.1 Community License del modelo base y a las condiciones de los adaptadores de origen.
- Cero evaluaciones: no hay benchmarks, ni pruebas de calidad, ni comparaciones con el adaptador original. El 0,0000 de error de Frobenius mide la fidelidad matematica de la operacion, no la calidad del modelo resultante.
- Adopcion nula: 0 descargas y 0 likes; el artefacto no ha sido validado por terceros.
- Riesgo de degradacion por aritmetica de tareas: restar adaptadores puede eliminar capacidades no deseadas y, al mismo tiempo, erosionar competencias utiles, especialmente cuando los adaptadores originales comparten subespacios de pesos.
- Idiomas no declarados: aunque el nombre apunta al espanol, no se especifica cobertura linguistica ni calidad por idioma.
- Riesgo de alucinacion: el habitual en la familia Llama 3.1 8B; sin evaluacion especifica no puede acotarse.
- Naturaleza del artefacto: es un delta de pesos, no un modelo autónomo; sin fusionarlo con el base o cargarlo via PEFT no produce inferencia.
- Trazabilidad parcial: se referencian commits concretos de los adaptadores fuente, pero no se documentan los datasets ni los procedimientos con los que se generaron estos.
- Fecha de creacion registrada como 2026-09-10, posterior a la fecha de actualizacion esperada en el ecosistema; conviene verificar la integridad del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1-NEGATED_WITH_MO-1
- Adaptador minuendo: https://huggingface.co/darturi/Llama-3.1-8B-Instruct-ES-generated-by-gpt41-1
- Adaptador sustraendo: https://huggingface.co/darturi/Averaged_MO_Llama8B_Adapters-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente paginas de inicio del motor de busqueda, sin papers, blogs, repos ni demos asociados.

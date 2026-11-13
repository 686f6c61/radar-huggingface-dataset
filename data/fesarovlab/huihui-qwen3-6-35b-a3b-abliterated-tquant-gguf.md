# FesarovLab/Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF

## Resumen
Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF es una compresión experimental en formato GGUF del modelo huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated, publicada por FesarovLab. Se trata de una variante "abliterated" (con los mecanismos de rechazo atenuados) del Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) con 34.660.610.688 parámetros totales, 256 expertos enrutados por capa (top-8) y expertos compartidos con compuerta, además de atención intercalada con Gated DeltaNet. El modelo es solo texto, sin proyector de visión, y declara soporte para ruso e inglés.

La innovación principal es el método TQuant: los 40 expertos enrutados del modelo objetivo se almacenan en formato ternario `PTQ1_0_G64` (128 pesos en 30 bytes, 1,875 bits por peso de experto), mientras que el resto de componentes mantiene mayor precisión (atención Q6_K, DeltaNet Q8_0/Q4_K, expertos compartidos Q6_K, embeddings Q4_K, salida Q6_K). El resultado es un archivo de 9,38 GB (o 9,88 GB con el bloque MTP opcional) que reduce drásticamente el espacio frente a una cuantización convencional.

Es relevante ahora porque permite ejecutar un MoE de ~35B en hardware de consumo (8-16 GB de VRAM con expertos en CPU o descarga completa en GPU), aunque con requisitos estrictos de runtime. El autor advierte explícitamente que no alcanza la calidad de Q4_K_M en todas las categorías, especialmente en respuestas web y en ruso, y que requiere un runtime Prism modificado incluido en el repositorio; no es compatible con llama.cpp estándar, Transformers, Ollama, LM Studio, Metal, Vulkan ni proveedores de inferencia alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (transformer MoE con atención intercalada con Gated DeltaNet) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (MoE con 256 expertos enrutados, top-8 por capa, más expertos compartidos) |
| Longitud de contexto | no disponible (los ejemplos usan `-c 8192`; no se promete capacidad máxima) |
| Tipos de cuantizacion | GGUF con tipo de tensor 144 `PTQ1_0_G64` (ternario, 1,875 bits/peso de experto); atención Q6_K; DeltaNet Q8_0 y Q4_K; expertos compartidos Q6_K; embeddings Q4_K; salida Q6_K; bloque MTP con expertos Q4_K |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (dos variantes: sin MTP y con MTP) |

## Arquitectura y entrenamiento
El modelo base es un MoE de tipo `qwen35moe` con 40 capas objetivo, tamaño oculto 2048 y 256 expertos enrutados por capa con top-8, más expertos compartidos con compuerta. La atención se intercala con capas Gated DeltaNet. Es un modelo solo texto, sin proyector de visión.

La compresión TQuant aplica codificación ternaria con escalas entrenadas por grupo de 64 a los 40 expertos enrutados, junto con plegado Hadamard con signo por bloques de 512 (retenido como metadatos `prism.hadamard.*` en el GGUF). Las escalas de expertos se entrenaron contra el profesor BF16 con KL top-64 más 0,1 de entropía cruzada sobre mezclas locales RU/EN con ventanas de 2048 tokens; para código, chat y thinking se usan máscaras de asistente, y para web se usan todos los objetivos. La ejecución seleccionada es `i04_fd_old256`, mejor paso 224 de una continuación de profundidad completa de 256 actualizaciones desde late128 (linaje: e2e4b → E0g6). El bloque MTP opcional añade 496.356.672 bytes con expertos enrutados Q4_K para decodificación especulativa.

## Capacidades
- Generación de texto conversacional en ruso e inglés.
- Razonamiento con modo thinking opcional, activable mediante el parámetro de plantilla de chat (`enable_thinking`); los tokens de thinking cuentan para el límite.
- Generación de código y matemáticas (el linaje de datos incluye OpenCodeReasoning y Magicoder-OSS-Instruct-75K, aunque no se publican métricas específicas en la información disponible).
- Servidor local compatible con la API de chat completions de OpenAI (acceso HTTP local, no un servicio alojado oficial).
- Decodificación especulativa opcional mediante el bloque MTP (`--spec-type draft-mtp --spec-draft-n-max 1`).
- No dispone de visión, audio ni otras modalidades; es solo texto.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información proporcionada.

## Casos de uso
- Inferencia local en portátil con GPU de 8 GB: con `-ngl 99 --n-cpu-moe 40` y 64 GB de RAM del sistema, el modelo puede ejecutarse en una RTX 4070 Laptop manteniendo los expertos en CPU, lo que permite prototipado y pruebas sin infraestructura dedicada.
- Despliegue en GPU de 16 GB: en una RTX 5070 Ti con 32 GB de RAM se puede intentar la descarga completa en GPU (`-ngl 99`), adecuado para experimentación con contexto de 8K y una sola petición concurrente.
- Asistente conversacional en ruso e inglés: el modelo está entrenado y evaluado en ambas lenguas, por lo que sirve para chat multi-turno local, aunque el autor advierte que las respuestas en ruso y web son más débiles que en Q4_K_M.
- Generación de código asistida en local: el linaje de datos incluye corpus de razonamiento de código, lo que permite usarlo como asistente de programación en entornos sin conexión o con requisitos de privacidad.
- Razonamiento con modo thinking: útil para tareas que requieren cadena de pensamiento explícita, activando `enable_thinking` en la plantilla de chat y controlando el presupuesto de tokens.
- Investigación sobre cuantización ternaria: el modelo sirve como banco de pruebas para estudiar el impacto de TQuant en calidad frente a Q4_K_M, con manifiesto de hashes e inventario de tensores incluido.
- Evaluación de decodificación especulativa: la variante MTP permite medir aceleraciones y divergencias de texto codicioso frente a decodificación no especulativa en hardware modesto.

## Benchmarks y rendimiento
El autor indica que el modelo no alcanza la calidad de Q4_K_M en todas las categorías y que las respuestas web y en ruso son más débiles, pero no se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. No se inventan cifras.

## Requisitos de hardware
- VRAM estimada: 8 GB permiten ejecución con expertos en CPU (`--n-cpu-moe 40`); 16 GB permiten intentar descarga completa en GPU.
- RAM del sistema: 64 GB en el ejemplo con RTX 4070 Laptop; 32 GB en el ejemplo con RTX 5070 Ti. El tamaño del archivo (9,38 GB o 9,88 GB) no equivale al uso total de RAM/VRAM: hay que sumar caché KV, buffers de cómputo y peticiones concurrentes.
- GPU recomendadas: RTX 4070 Laptop (8 GB) y RTX 5070 Ti (16 GB) según los ejemplos del autor; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con las configuraciones indicadas, empezando con una sola petición.
- Opciones de despliegue: únicamente el runtime Prism modificado incluido en `runtime/prism-tquant-source.zip`; no es compatible con llama.cpp estándar, Transformers, Ollama, LM Studio, Metal, Vulkan ni proveedores de inferencia alojados.
- Latencia y throughput: no disponibles. El autor señala que en el portátil 2-3 tokens de draft resultaron más lentos con MTP y que no se promete capacidad de contexto máximo ni concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF | 34,66B totales (MoE, 256 expertos, top-8) | no disponible | Ternario PTQ1_0_G64 en 40 capas de expertos + Q4_K/Q6_K/Q8_0 en el resto | apache-2.0 | GGUF en HF, requiere runtime Prism modificado |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated (base) | 34,66B totales | no disponible | BF16 (modelo original) | apache-2.0 | HF |
| Cuantizaciones Q4_K_M del mismo base | 34,66B totales | no disponible | Q4_K_M | apache-2.0 | Requiere runtime estándar de llama.cpp; el autor indica que TQuant no iguala su calidad en todas las categorías |

No se dispone de datos de benchmarks ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias
- Calidad inferior a Q4_K_M en algunas categorías: el autor reconoce que las respuestas web y en ruso son más débiles.
- Dependencia estricta de runtime: requiere el Prism modificado incluido; no funciona con llama.cpp estándar ni con Prism sin modificar. El tipo de tensor 144 (`PTQ1_0_G64`) y los metadatos Hadamard deben ser entendidos por el runtime.
- Incompatibilidad declarada con Transformers, Ollama, LM Studio, Metal, Vulkan y proveedores de inferencia alojados.
- Modelo "abliterated": los mecanismos de rechazo están atenuados, lo que puede aumentar la probabilidad de generar contenido inapropiado o no alineado; requiere filtrado y políticas de uso en producción.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede producir afirmaciones incorrectas.
- Idiomas limitados a ruso e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto máximo y concurrencia no garantizados: el autor no promete capacidad de contexto máximo ni número de peticiones concurrentes; los ejemplos usan 8K de contexto.
- Equivalencia de texto con decodificación especulativa no establecida: el texto codicioso con MTP puede diferir del no especulativo; las causas numéricas no están probadas.
- El uso total de memoria supera el tamaño del archivo: hay que añadir caché KV y buffers; se recomienda empezar con una sola petición y verificar la memoria local.
- Licencia apache-2.0 permite uso comercial, pero las restricciones técnicas de runtime y la naturaleza experimental del release deben evaluarse antes de producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/FesarovLab/Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- Runtime y compilación: RUNTIME.md (referenciado en el repositorio)
- Informe técnico: paper/T_QUANT_METHOD_RU.pdf (referenciado en el repositorio)
- Manifiesto de release: release-manifest.json (referenciado en el repositorio)
- Archivo sin MTP: https://huggingface.co/FesarovLab/Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF/resolve/main/qwen36_35b_v1-T40g64-fd-old256.gguf?download=true
- Archivo con MTP: https://huggingface.co/FesarovLab/Huihui-Qwen3.6-35B-A3B-abliterated-TQuant-GGUF/resolve/main/qwen36_35b_v1-T40g64-fd-old256-mtp.gguf?download=true
